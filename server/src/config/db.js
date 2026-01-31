import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gobeauty';
    console.log('Connecting MongoDB at:', uri);
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000
    });
    console.log('✅ Mongo connected');
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    throw error;
  }
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};
