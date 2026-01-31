import { Router } from 'express';
import createError from 'http-errors';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get my notifications
router.get('/', auth(), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // If provider, fetch by providerId, else by userId
  let query = {};
  if (req.user.providerId) {
    query = { providerId: req.user.providerId };
  } else {
    query = { userId: req.user.id };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

  res.json({ notifications, unreadCount });
}));

// Mark as read
router.patch('/:id/read', auth(), asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };
  if (req.user.providerId) {
    query.providerId = req.user.providerId;
  } else {
    query.userId = req.user.id;
  }
  const notification = await Notification.findOne(query);
  if (!notification) throw createError(404, 'Notification not found');
  notification.isRead = true;
  await notification.save();
  res.json(notification);
}));

// Mark all as read
router.patch('/read-all', auth(), asyncHandler(async (req, res) => {
  let query = { isRead: false };
  if (req.user.providerId) {
    query.providerId = req.user.providerId;
  } else {
    query.userId = req.user.id;
  }
  await Notification.updateMany(query, { isRead: true });
  res.json({ message: 'All marked as read' });
}));

export default router;
