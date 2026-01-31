import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();

// Send notification to provider or user
router.post('/send', asyncHandler(async (req, res) => {
  const { to, type, message, meta } = req.body;
  // 'to' can be providerId or userId
  // For provider notification, save with userId = providerId
  if (!to || !type || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const notif = await Notification.create({
    userId: to,
    title: type === 'booking' ? 'New Booking' : 'Notification',
    body: message,
    type,
    dataJson: meta || {},
    isRead: false
  });
  res.json({ success: true, notification: notif });
}));

router.get('/me', auth(), asyncHandler(async (req, res) => {
  // Har user/provider ko apni notifications milen
  const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notifs);
}));

export default router;
