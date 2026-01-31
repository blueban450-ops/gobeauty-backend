import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get reviews for provider
router.get('/provider/:providerId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const reviews = await Review.find({ providerId: req.params.providerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('customerUserId', 'fullName avatar')
    .lean();
  
  const total = await Review.countDocuments({ providerId: req.params.providerId });
  
  res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
}));

// Create review (customer only, after completed booking)
router.post('/', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const schema = z.object({
    bookingId: z.string().length(24),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
  });
  
  const body = schema.parse(req.body);
  
  // Validate booking
  const booking = await Booking.findById(body.bookingId);
  if (!booking) throw createError(404, 'Booking not found');
  if (booking.customerUserId.toString() !== req.user.id) {
    throw createError(403, 'Not your booking');
  }
  if (booking.status !== 'COMPLETED') {
    throw createError(400, 'Can only review completed bookings');
  }
  
  // Check if already reviewed
  const existing = await Review.findOne({ bookingId: body.bookingId });
  if (existing) throw createError(400, 'Already reviewed this booking');
  
  const review = await Review.create({
    bookingId: body.bookingId,
    providerId: booking.providerId,
    customerUserId: req.user.id,
    rating: body.rating,
    comment: body.comment
  });
  
  // Update provider rating
  const provider = await Provider.findById(booking.providerId);
  const reviews = await Review.find({ providerId: booking.providerId });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  provider.rating = Math.round(avgRating * 10) / 10;
  provider.reviewCount = reviews.length;
  await provider.save();
  
  res.status(201).json(review);
}));

export default router;
