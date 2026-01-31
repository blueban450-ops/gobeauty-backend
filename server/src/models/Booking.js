import mongoose from 'mongoose';

const bookingItemSchema = new mongoose.Schema({
  providerServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderService', required: true },
  serviceNameSnapshot: String,
  priceSnapshot: Number,
  durationSnapshot: Number
}, { _id: true });

const bookingSchema = new mongoose.Schema({
  customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  mode: { type: String, enum: ['HOME', 'SALON'], required: true },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'ON_THE_WAY', 'STARTED', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  items: [bookingItemSchema],
  total: { type: Number, required: true },
  groupSize: { type: Number, default: 1 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  customerAddress: {
    addressLine: String,
    city: String,
    postalCode: String,
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ providerId: 1, scheduledStart: 1, scheduledEnd: 1 });
bookingSchema.index({ customerUserId: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
