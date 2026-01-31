import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const stripeKey = process.env.STRIPE_SECRET || 'sk_test_123';
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

router.post('/intent', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const schema = z.object({ amount: z.number().min(1), currency: z.string().default('eur') });
  const { amount, currency } = schema.parse(req.body);
  const intent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency, metadata: { userId: req.user.id } });
  res.json({ clientSecret: intent.client_secret });
}));

export default router;
