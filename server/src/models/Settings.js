import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  commissionPercent: { type: Number, default: 12 },
  minCancelHours: { type: Number, default: 24 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Settings', settingsSchema);
