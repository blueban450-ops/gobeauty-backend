// Script to update all bookings and set paymentStatus to 'PENDING' if missing
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';

async function updatePaymentStatus() {
  await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME'); // <-- apna DB name yahan likhein
  const result = await Booking.updateMany(
    { paymentStatus: { $exists: false } },
    { $set: { paymentStatus: 'PENDING' } }
  );
  console.log('Updated bookings:', result.modifiedCount);
  await mongoose.disconnect();
}

updatePaymentStatus().catch(console.error);
