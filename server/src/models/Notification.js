import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, required: true },
  dataJson: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ providerId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
