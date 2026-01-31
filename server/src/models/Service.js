import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  name: { type: String, required: true },
  baseDurationMin: { type: Number, required: false, default: 30 }, // Optional with default
  isActive: { type: Boolean, default: true }, // Admin can inactivate
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Service', serviceSchema);
