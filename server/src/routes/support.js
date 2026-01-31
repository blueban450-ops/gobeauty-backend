import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import SupportTicket from '../models/SupportTicket.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Create support ticket
router.post('/', auth(), asyncHandler(async (req, res) => {
  const schema = z.object({
    subject: z.string().min(3),
    message: z.string().min(10)
  });
  
  const body = schema.parse(req.body);
  
  const ticket = await SupportTicket.create({
    ...body,
    userId: req.user.id,
    status: 'OPEN'
  });
  
  res.status(201).json(ticket);
}));

// Get my tickets
router.get('/me', auth(), asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(tickets);
}));

// Get all tickets (admin)
router.get('/admin/all', auth('ADMIN'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  
  const tickets = await SupportTicket.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email')
    .lean();
  
  res.json(tickets);
}));

// Close ticket (admin)
router.patch('/:id/close', auth('ADMIN'), asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw createError(404, 'Ticket not found');
  
  ticket.status = 'CLOSED';
  await ticket.save();
  
  res.json(ticket);
}));

export default router;
