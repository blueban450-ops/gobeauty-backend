import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { z } from 'zod';

import User from '../models/User.js';
import Provider from '../models/Provider.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const signToken = (user, expiresIn = '1h') => jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn });
const signRefresh = (user) => jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });

router.post('/register', asyncHandler(async (req, res) => {
  console.log('REGISTER ATTEMPT:', req.body);
  const schema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN']).default('CUSTOMER'),
    // PROVIDER fields
    businessName: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
  });
  const body = schema.parse(req.body);

  const existing = await User.findOne({ email: body.email.toLowerCase() });
  if (existing) {
    console.log('REGISTER FAILED: Email already exists:', body.email);
    throw createError(409, 'Email already exists');
  }

  const hash = await bcrypt.hash(body.password, 10);
  const user = await User.create({ 
    fullName: body.fullName,
    email: body.email.toLowerCase(),
    password: hash,
    phone: body.phone,
    role: body.role
  });
  console.log('REGISTER SUCCESS:', user.email, 'role:', user.role);

  // If PROVIDER, create Provider profile
  if (body.role === 'PROVIDER') {
    await Provider.create({
      ownerUserId: user._id,
      type: 'INDIVIDUAL',
      name: body.businessName,
      description: body.description,
      phone: body.phone,
      city: body.city,
      addressLine: body.address,
      homeService: false,
      salonVisit: false,
      isVerified: false
    });
  }

  // Also save business details to User if PROVIDER
  if (body.role === 'PROVIDER') {
    user.businessName = body.businessName;
    user.city = body.city;
    user.address = body.address;
    await user.save();
  }

  const token = signToken(user);
  const refresh = signRefresh(user);
  res.json({ 
    token, 
    refresh, 
    user: { 
      id: user._id, 
      fullName: user.fullName, 
      email: user.email, 
      role: user.role,
      phone: user.phone,
      businessName: user.businessName,
      category: user.category,
      city: user.city
    } 
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  console.log('LOGIN ATTEMPT:', req.body);
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  let email, password;
  try {
    ({ email, password } = schema.parse(req.body));
  } catch (err) {
    console.log('LOGIN VALIDATION ERROR:', err);
    throw createError(400, 'Invalid input');
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log('LOGIN FAILED: User not found:', email);
    throw createError(401, 'Invalid credentials');
  }
  if (user.status === 'blocked') {
    console.log('LOGIN FAILED: User blocked:', email);
    throw createError(403, 'Your account has been blocked. Please contact support.');
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    console.log('LOGIN FAILED: Wrong password for:', email);
    throw createError(401, 'Invalid credentials');
  }
  const token = signToken(user);
  const refresh = signRefresh(user);
  console.log('LOGIN SUCCESS:', email, 'role:', user.role);
  res.json({ 
    token, 
    refresh, 
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar || '',
      address: user.address || '',
      city: user.city || ''
    }
  });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const schema = z.object({ refresh: z.string().min(10) });
  const { refresh } = schema.parse(req.body);
  try {
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.id);
    if (!user) throw createError(401, 'Invalid refresh');
    const token = signToken(user);
    res.json({ token });
  } catch (e) {
    throw createError(401, 'Invalid refresh');
  }
}));

// Admin: Get all users
router.get('/users', auth('ADMIN'), asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').lean();
  res.json(users);
}));

// Forgot Password: Send reset token
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw createError(404, 'User not found');
  
  // Generate reset token (valid for 15 minutes)
  const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  
  // In production, send email with reset link
  // For now, return token to mobile (should be via email in production)
  res.json({ 
    message: 'Reset token sent to email',
    resetToken, // Remove in production - send via email instead
    resetEmail: email
  });
}));

// Reset Password: Verify token and set new password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const schema = z.object({ 
    resetToken: z.string(),
    newPassword: z.string().min(6)
  });
  const { resetToken, newPassword } = schema.parse(req.body);
  
  try {
    const payload = jwt.verify(resetToken, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.id);
    if (!user) throw createError(404, 'User not found');
    
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (e) {
    throw createError(401, 'Invalid or expired reset token');
  }
}));

// Admin: Block/Unblock User
router.patch('/users/:userId/block', auth('ADMIN'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw createError(404, 'User not found');
  if (user.role === 'ADMIN') throw createError(403, 'Cannot block admin users');
  
  // Toggle status
  user.status = user.status === 'blocked' ? 'active' : 'blocked';
  await user.save();
  
  res.json({ 
    message: `User ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
    user: { id: user._id, fullName: user.fullName, email: user.email, status: user.status }
  });
}));

// Get Current Authenticated User (for token validation)
router.get('/me', auth('CUSTOMER', 'PROVIDER', 'ADMIN'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw createError(404, 'User not found');
  
  res.json({ 
    user: { 
      id: user._id, 
      fullName: user.fullName, 
      email: user.email, 
      role: user.role,
      status: user.status
    } 
  });
}));

export default router;
