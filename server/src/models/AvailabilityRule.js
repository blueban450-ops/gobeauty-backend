import mongoose from 'mongoose';

const availabilityRuleSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0=Sunday, 6=Saturday
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true }, // "18:00"
  slotSizeMin: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

availabilityRuleSchema.index({ providerId: 1, dayOfWeek: 1 });

export default mongoose.model('AvailabilityRule', availabilityRuleSchema);
