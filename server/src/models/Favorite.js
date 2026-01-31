import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ customerUserId: 1, providerId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
