import { Router } from 'express';
import { z } from 'zod';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Provider from '../models/Provider.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get chats for current user/pro
router.get('/me', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const query = req.user.role === 'user' ? { user: req.user.id } : { provider: req.user.providerId };
  const chats = await Chat.find(query).sort({ lastMessageAt: -1 }).populate('user provider');
  res.json(chats);
}));

// Get messages for a chat
router.get('/:id/messages', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.id }).sort({ createdAt: 1 });
  res.json(messages);
}));

// Send message (creates chat if needed)
router.post('/message', auth('user', 'professional'), asyncHandler(async (req, res) => {
  const schema = z.object({ provider: z.string().length(24), text: z.string().min(1) });
  const body = schema.parse(req.body);
  const provider = await Provider.findById(body.provider);
  if (!provider) return res.status(400).json({ error: 'Invalid provider' });
  const userId = req.user.id;
  const providerId = provider._id;

  let chat = await Chat.findOne({ user: userId, provider: providerId });
  if (!chat) {
    chat = await Chat.create({ user: userId, provider: providerId });
  }

  const senderType = req.user.role === 'user' ? 'user' : 'provider';
  const message = await Message.create({
    chat: chat._id,
    senderId: req.user.id,
    senderType,
    text: body.text,
    read: false
  });

  chat.lastMessage = body.text;
  chat.lastMessageAt = new Date();
  if (senderType === 'user') chat.unreadProvider += 1; else chat.unreadUser += 1;
  await chat.save();

  res.status(201).json({ chatId: chat._id, message });
}));

export default router;
