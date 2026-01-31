import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Favorite from '../models/Favorite.js';
import Provider from '../models/Provider.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get my favorites
router.get('/', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ customerUserId: req.user.id })
    .populate('providerId')
    .sort({ createdAt: -1 })
    .lean();
  res.json(favorites);
}));

// Toggle favorite
router.post('/toggle/:providerId', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.providerId);
  if (!provider) throw createError(404, 'Provider not found');
  
  const existing = await Favorite.findOne({
    customerUserId: req.user.id,
    providerId: req.params.providerId
  });
  
  if (existing) {
    await existing.deleteOne();
    res.json({ isFavorite: false });
  } else {
    await Favorite.create({
      customerUserId: req.user.id,
      providerId: req.params.providerId
    });
    res.json({ isFavorite: true });
  }
}));

// Check if favorited
router.get('/check/:providerId', auth('CUSTOMER'), asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({
    customerUserId: req.user.id,
    providerId: req.params.providerId
  });
  res.json({ isFavorite: !!favorite });
}));

export default router;
