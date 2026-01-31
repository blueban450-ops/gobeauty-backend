import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find({}).populate('categoryId');
  res.json(services);
}));

router.post('/', auth('ADMIN'), asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    categoryId: z.string().length(24),
    baseDurationMin: z.number().min(15).optional()
  });
  const body = schema.parse(req.body);
  const cat = await Category.findById(body.categoryId);
  if (!cat) throw createError(400, 'Invalid category');
  const svc = await Service.create(body);
  res.status(201).json(svc);
}));

export default router;
