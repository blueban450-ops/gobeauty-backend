import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Settings from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get settings
router.get('/', asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ commissionPercent: 12, minCancelHours: 24 });
  }
  res.json(settings);
}));

// Update settings (admin only)
router.patch('/', auth('ADMIN'), asyncHandler(async (req, res) => {
  const schema = z.object({
    commissionPercent: z.number().min(0).max(100).optional(),
    minCancelHours: z.number().min(0).optional()
  });
  
  const body = schema.parse(req.body);
  
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(body);
  } else {
    Object.assign(settings, body);
    await settings.save();
  }
  
  res.json(settings);
}));

export default router;
