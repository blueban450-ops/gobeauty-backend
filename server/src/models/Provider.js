import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['SALON', 'INDIVIDUAL'], required: true },
  name: { type: String, required: true },
  description: String,
  phone: String,
  city: String,
  addressLine: String,
  lat: Number,
  lng: Number,
  homeService: { type: Boolean, default: false },
  salonVisit: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  coverImage: String,
  avatar: String,
  gallery: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // New fields
  workingHours: String,
  experience: String,
  specialization: String,
  instagram: String,
  facebook: String,
  createdAt: { type: Date, default: Date.now }
});

providerSchema.index({ lat: 1, lng: 1 });
providerSchema.index({ isVerified: 1, createdAt: -1 });

export default mongoose.model('Provider', providerSchema);
