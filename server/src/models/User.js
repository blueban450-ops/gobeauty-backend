import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'], required: true },
  status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'active' },
  avatar: String,
  addresses: [{
    label: String,
    addressLine: String,
    city: String,
    lat: Number,
    lng: Number
  }],
  // PROVIDER fields
  businessName: String,
  category: String,
  city: String,
  address: String,
  description: String,
  homeService: Boolean,
  salonVisit: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
