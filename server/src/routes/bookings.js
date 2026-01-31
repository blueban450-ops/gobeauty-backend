import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import ProviderService from '../models/ProviderService.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import { getAvailableSlots, createBookingAtomic } from '../utils/slotGenerator.js';

const router = Router();

// Get available slots for a provider
router.get('/slots/:providerId', asyncHandler(async (req, res) => {
  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    duration: z.coerce.number().min(15)
  });
  const { date, duration } = schema.parse(req.query);
  
  const slots = await getAvailableSlots(req.params.providerId, date, duration);
  res.json({ slots });
}));

// Get customer bookings
router.get('/customer/me', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customerUserId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('providerId', 'name type city rating')
    .lean();
  res.json(bookings);
}));

// Get provider bookings
router.get('/provider/me', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  
  const { status } = req.query;
  const filter = { providerId: req.user.providerId };
  if (status) filter.status = status;
  
  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate('customerUserId', 'fullName phone')
    .lean();
  res.json(bookings);
}));

// Get booking detail
router.get('/:id', auth(), asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('providerId', 'name type phone addressLine')
    .populate('customerUserId', 'fullName phone')
    .populate('items.providerServiceId');
  
  if (!booking) throw createError(404, 'Booking not found');
  
  // Check access
  const isCustomer = req.user.role === 'CUSTOMER' && booking.customerUserId._id.toString() === req.user.id;
  const isProvider = req.user.role === 'PROVIDER' && booking.providerId._id.toString() === req.user.providerId;
  const isAdmin = req.user.role === 'ADMIN';
  
  if (!isCustomer && !isProvider && !isAdmin) {
    throw createError(403, 'Access denied');
  }
  
  res.json(booking);
}));

// Create booking (atomic)
router.post('/', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  console.log('--- Booking creation route HIT ---');
  console.log('Booking creation request by user:', req.user);
  console.log('Request body:', req.body);
  const schema = z.object({
    providerId: z.string().length(24),
    mode: z.enum(['HOME', 'SALON']),
    scheduledStart: z.string(),
    serviceIds: z.array(z.string().length(24)).min(1),
    groupSize: z.coerce.number().min(1).max(20).optional(),
    paymentMethod: z.string().min(1),
    customerAddress: z.object({
      addressLine: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  });
  
  const body = schema.parse(req.body);
  console.log('Parsed providerId:', body.providerId);
  
  // Validate provider
  const provider = await Provider.findById(body.providerId);
  console.log('Provider lookup result:', provider);
  if (!provider || !provider.isVerified) {
    console.error('Provider not found or not verified:', provider);
    throw createError(400, 'Invalid or unverified provider');
  }
  
  // Check mode support
  if (body.mode === 'HOME' && !provider.homeService) {
    throw createError(400, 'Provider does not offer home service');
  }
  if (body.mode === 'SALON' && !provider.salonVisit) {
    throw createError(400, 'Provider does not offer salon visits');
  }
  
  // Get services and calculate total duration
  const services = await ProviderService.find({
    _id: { $in: body.serviceIds },
    providerId: body.providerId,
    isActive: true
  }).populate('serviceId');
  console.log('ProviderService lookup result:', services);
  if (services.length !== body.serviceIds.length) {
    console.error('Some services not found or do not match providerId.');
    throw createError(400, 'Invalid services selected');
  }
  
  // Check mode availability for each service
  services.forEach(ps => {
    if (body.mode === 'HOME' && !ps.homeService) {
      throw createError(400, `Service ${ps.serviceId?.name} not available for home service`);
    }
    if (body.mode === 'SALON' && !ps.salonVisit) {
      throw createError(400, `Service ${ps.serviceId?.name} not available at salon`);
    }
  });
  
  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0);
  const groupSize = body.groupSize || 1;
  const total = services.reduce((sum, s) => sum + s.price, 0) * groupSize;
  
  const scheduledStart = new Date(body.scheduledStart);
  const scheduledEnd = new Date(scheduledStart.getTime() + totalDuration * 60000);
  
  const items = services.map(s => ({
    providerServiceId: s._id,
    serviceNameSnapshot: s.serviceId?.name,
    priceSnapshot: s.price,
    durationSnapshot: s.durationMin
  }));
  
  // Create booking atomically
  const booking = await createBookingAtomic({
    customerUserId: req.user.id,
    providerId: body.providerId,
    mode: body.mode,
    scheduledStart,
    scheduledEnd,
    items,
    total,
    groupSize: body.groupSize || 1,
    paymentMethod: body.paymentMethod,
    customerAddress: body.customerAddress
  });
  if (booking) {
    console.log('Booking created successfully:', booking);
  } else {
    console.error('Booking creation FAILED!');
  }
    await Notification.create({
      userId: provider.ownerUserId,
      title: 'New Booking Request',
      body: `You have a new ${body.mode.toLowerCase()} booking request`,
      type: 'BOOKING_CREATED',
      dataJson: { bookingId: booking._id }
    });
    res.status(201).json(booking);
  }));

// Provider: Accept booking
router.patch('/:id/accept', auth('PROVIDER'), asyncHandler(async (req, res) => {
    console.log('--- Booking CONFIRM route HIT ---');
    console.log('Booking ID:', req.params.id);
  const booking = await Booking.findById(req.params.id);
    console.log('Booking found:', booking);
  if (!booking) throw createError(404, 'Not found');
  if (booking.providerId.toString() !== req.user.providerId) {
    throw createError(403, 'Not your booking');
  }
  if (booking.status !== 'PENDING') {
    throw createError(400, 'Can only accept pending bookings');
  }
  
  booking.status = 'CONFIRMED';
  await booking.save();
  
  // Notify customer
  const notification = await Notification.create({
    userId: booking.customerUserId,
    title: 'Booking Confirmed',
    body: 'Your booking has been confirmed',
    type: 'BOOKING_CONFIRMED',
    dataJson: { bookingId: booking._id }
  });
  if (req.app.get('io')) {
    req.app.get('io').to(`user:${booking.customerUserId}`).emit('notification', notification);
  }
  
  res.json(booking);
}));

// Provider: Reject booking
router.patch('/:id/reject', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError(404, 'Not found');
  if (booking.providerId.toString() !== req.user.providerId) {
    throw createError(403, 'Not your booking');
  }
  if (booking.status !== 'PENDING') {
    throw createError(400, 'Can only reject pending bookings');
  }
  
  booking.status = 'REJECTED';
  await booking.save();
  
  // Notify customer
  const notification = await Notification.create({
    userId: booking.customerUserId,
    title: 'Booking Rejected',
    body: 'Your booking request was declined',
    type: 'BOOKING_REJECTED',
    dataJson: { bookingId: booking._id }
  });
  if (req.app.get('io')) {
    req.app.get('io').to(`user:${booking.customerUserId}`).emit('notification', notification);
  }
  
  res.json(booking);
}));

// Provider: Update booking status
router.patch('/:id/status', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const schema = z.object({
    status: z.enum(['ON_THE_WAY', 'STARTED', 'COMPLETED'])
  });
  const { status } = schema.parse(req.body);
  
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError(404, 'Not found');
  if (booking.providerId.toString() !== req.user.providerId) {
    throw createError(403, 'Not your booking');
  }
  if (booking.status !== 'CONFIRMED' && status !== 'COMPLETED') {
    throw createError(400, 'Invalid status transition');
  }
  
  booking.status = status;
  await booking.save();
  
  // Notify customer
  await Notification.create({
    userId: booking.customerUserId,
    title: 'Booking Updated',
    body: `Status: ${status.replace('_', ' ')}`,
    type: 'BOOKING_STATUS_UPDATED',
    dataJson: { bookingId: booking._id, status }
  });
  
  res.json(booking);
}));

// Customer: Cancel booking
router.patch('/:id/cancel', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError(404, 'Not found');
  if (booking.customerUserId.toString() !== req.user.id) {
    throw createError(403, 'Not your booking');
  }
  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    throw createError(400, 'Cannot cancel this booking');
  }
  
  // Check cancellation policy (24 hours)
  const hoursUntil = (booking.scheduledStart - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    throw createError(400, 'Cannot cancel within 24 hours of booking');
  }
  
  booking.status = 'CANCELLED';
  await booking.save();
  
  // Notify provider
  const provider = await Provider.findById(booking.providerId);
  await Notification.create({
    userId: provider.ownerUserId,
    title: 'Booking Cancelled',
    body: 'A customer cancelled their booking',
    type: 'BOOKING_CANCELLED',
    dataJson: { bookingId: booking._id }
  });
  
  res.json(booking);
}));

// Admin: Get all bookings
router.get('/all', auth('ADMIN'), asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .populate('customerUserId', 'fullName email phone')
    .populate('providerId', 'name type city')
    .lean();
  res.json(bookings);
}));

export default router;
