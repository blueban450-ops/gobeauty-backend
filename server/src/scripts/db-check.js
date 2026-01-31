import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gobeauty';

(async () => {
  console.log('DB Check: attempting to connect ->', uri);
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB database:', dbName);
    const admin = await mongoose.connection.db.admin().serverStatus().catch(() => null);
    if (admin) console.log('MongoDB server status ok, version:', admin.version);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection error:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
