import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Service from './models/Service.js';
import Provider from './models/Provider.js';

const seed = async () => {
  try {
    await connectDb();
    console.log('Seeding...');

    const adminEmail = 'admin@gobeauty.com';
    const adminPass = 'admin123';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({ 
        fullName: 'Admin', 
        email: adminEmail, 
        password: await bcrypt.hash(adminPass, 10), 
        role: 'ADMIN'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists');
    }

    const catsData = [
      { name: 'Spa & Massage', icon: 'spa' },
      { name: 'Nails & Manicure', icon: 'hand-sparkles' },
      { name: 'Hairstyle', icon: 'scissors' },
      { name: 'Make-up', icon: 'wand-magic-sparkles' },
      { name: 'Facial Care', icon: 'face-smile-beam' },
      { name: 'Waxing', icon: 'user-nurse' }
    ];
    for (const cat of catsData) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) await Category.create(cat);
    }
    console.log('✅ Categories ensured');

    const catMap = Object.fromEntries((await Category.find({})).map(c => [c.name, c._id]));
    const svcData = [
      { name: 'Relaxing Massage', category: catMap['Spa & Massage'], basePrice: 80, duration: 60 },
      { name: 'Deep Tissue Massage', category: catMap['Spa & Massage'], basePrice: 95, duration: 60 },
      { name: 'Classic Manicure', category: catMap['Nails & Manicure'], basePrice: 35, duration: 30 },
      { name: 'Women Haircut', category: catMap['Hairstyle'], basePrice: 45, duration: 45 },
      { name: 'Day Makeup', category: catMap['Make-up'], basePrice: 60, duration: 45 },
      { name: 'Hydrating Facial', category: catMap['Facial Care'], basePrice: 70, duration: 60 }
    ].filter(s => s.category);
    const svcCount = await Service.countDocuments();
    if (svcCount === 0) {
      await Service.insertMany(svcData);
    }
    console.log('✅ Services ensured');

    let proUser = await User.findOne({ email: 'pro@gobeauty.com' });
    if (!proUser) {
      proUser = await User.create({ 
        fullName: 'Sara Khan', 
        email: 'pro@gobeauty.com', 
        password: await bcrypt.hash('pro12345', 10), 
        role: 'PROVIDER',
        phone: '+92-300-1234567',
        businessName: 'Sara Khan Studio',
        category: 'Spa',
        city: 'Karachi',
        address: '123 Demo Street',
        description: 'Premium beauty and wellness services',
        homeService: true,
        salonVisit: true
      });
      console.log('✅ Pro user created');
    } else {
      console.log('✅ Pro user exists');
    }
    const spaCat = catMap['Spa & Massage'];
    if (spaCat) {
      const existsProv = await Provider.findOne({ ownerUserId: proUser._id });
      if (!existsProv) {
        await Provider.create({
          ownerUserId: proUser._id,
          type: 'INDIVIDUAL',
          name: 'Sara Khan Studio',
          description: 'Premium beauty and wellness services',
          city: 'Karachi',
          addressLine: '123 Demo Street',
          phone: '+92-300-1234567',
          lat: 24.8615,
          lng: 67.0099,
          homeService: true,
          salonVisit: true,
          isVerified: true
        });
        console.log('✅ Provider demo created');
      } else {
        console.log('✅ Provider demo exists');
      }
    }

    console.log('✅ Seed complete!');
    await disconnectDb();
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed failed:', e);
    await disconnectDb();
    process.exit(1);
  }
};

seed();

