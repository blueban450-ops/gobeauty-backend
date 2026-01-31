import mongoose from 'mongoose';

const providerServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  customName: { type: String }, // Optional custom name override
  description: { type: String }, // Service description
  thumbnail: { type: String }, // Image URL
  price: { type: Number, required: true },
  durationMin: { type: Number, required: true },
  workingHours: { type: mongoose.Schema.Types.Mixed }, // ab object bhi save ho sakta hai
  isActive: { type: Boolean, default: true },
  homeService: { type: Boolean, default: false },
  salonVisit: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

providerServiceSchema.index({ providerId: 1, isActive: 1 });

export default mongoose.model('ProviderService', providerServiceSchema);
