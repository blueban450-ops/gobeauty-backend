// Script to delete all bookings and logs for a clean slate
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';

// Load env vars
dotenv.config({ path: '../../.env' });

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gobeauty';

async function cleanBookings() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    const result = await Booking.deleteMany({});
    console.log(`Deleted bookings: ${result.deletedCount}`);
    // If you have a logs collection, clean it too:
    const collections = await mongoose.connection.db.listCollections().toArray();
    const logCollection = collections.find(c => c.name === 'logs');
    if (logCollection) {
      const logResult = await mongoose.connection.db.collection('logs').deleteMany({});
      console.log(`Deleted logs: ${logResult.deletedCount}`);
    }
    await mongoose.disconnect();
    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning bookings/logs:', err);
    process.exit(1);
  }
}

cleanBookings();
