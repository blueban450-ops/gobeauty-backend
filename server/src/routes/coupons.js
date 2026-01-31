import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth('admin'), asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
}));

router.post('/', auth('admin'), asyncHandler(async (req, res) => {
  const schema = z.object({
    code: z.string().min(3),
    type: z.enum(['fixed', 'percent']),
    value: z.number().positive(),
    minOrder: z.number().min(0).default(0),
    maxUses: z.number().min(0).default(0),
    expiresAt: z.string().datetime().optional(),
    status: z.enum(['active', 'inactive']).optional()
  });
  const body = schema.parse(req.body);
  const exists = await Coupon.findOne({ code: body.code.toUpperCase() });
  if (exists) throw createError(409, 'Coupon exists');
  const coupon = await Coupon.create({ ...body, code: body.code.toUpperCase() });
  res.status(201).json(coupon);
}));

router.post('/apply', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const schema = z.object({ code: z.string().min(3), amount: z.number().min(0) });
  const { code, amount } = schema.parse(req.body);
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
  if (!coupon) throw createError(404, 'Invalid coupon');
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw createError(400, 'Coupon expired');
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw createError(400, 'Usage limit reached');
  if (amount < coupon.minOrder) throw createError(400, 'Order below minimum');

  const discount = coupon.type === 'fixed' ? coupon.value : (amount * coupon.value) / 100;
  const finalAmount = Math.max(amount - discount, 0);
  res.json({ coupon, discount, finalAmount });
}));

export default router;
