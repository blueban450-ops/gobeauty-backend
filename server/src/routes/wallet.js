import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Wallet from '../models/Wallet.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

const ensureWallet = async (userId) => {
  let w = await Wallet.findOne({ user: userId });
  if (!w) w = await Wallet.create({ user: userId, balance: 0 });
  return w;
};

router.get('/me', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const wallet = await ensureWallet(req.user.id);
  res.json(wallet);
}));

router.post('/topup', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const schema = z.object({ amount: z.number().min(1), ref: z.string().optional() });
  const { amount, ref } = schema.parse(req.body);
  const wallet = await ensureWallet(req.user.id);
  wallet.balance += amount;
  wallet.transactions.push({ type: 'credit', amount, ref, note: 'Top-up' });
  await wallet.save();
  res.json(wallet);
}));

router.post('/charge', auth('admin', 'professional'), asyncHandler(async (req, res) => {
  const schema = z.object({ userId: z.string().length(24), amount: z.number().min(0) });
  const { userId, amount } = schema.parse(req.body);
  const wallet = await ensureWallet(userId);
  if (wallet.balance < amount) throw createError(400, 'Insufficient balance');
  wallet.balance -= amount;
  wallet.transactions.push({ type: 'debit', amount, note: 'Charge' });
  await wallet.save();
  res.json(wallet);
}));

export default router;
