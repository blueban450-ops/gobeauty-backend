import mongoose from 'mongoose';

const blockedTimeSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

blockedTimeSchema.index({ providerId: 1, startAt: 1, endAt: 1 });

export default mongoose.model('BlockedTime', blockedTimeSchema);
