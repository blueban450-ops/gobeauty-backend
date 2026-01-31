import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true });
  res.json(categories);
}));

router.post('/', auth('ADMIN'), asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(2), icon: z.string().optional() });
  const body = schema.parse(req.body);
  const exists = await Category.findOne({ name: body.name });
  if (exists) throw createError(409, 'Category exists');
  const cat = await Category.create({ ...body, isActive: true });
  res.status(201).json(cat);
}));

export default router;
