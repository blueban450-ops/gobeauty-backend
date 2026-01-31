import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import ProviderService from '../models/ProviderService.js';
import AvailabilityRule from '../models/AvailabilityRule.js';
import Settings from '../models/Settings.js';

export const seedInitialData = async () => {
  try {
    // Settings
    const settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({ commissionPercent: 12, minCancelHours: 24 });
      console.log('✅ Settings created');
    }

    // Admin user
    const adminEmail = 'admin@gobeauty.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      });
      console.log('✅ Admin user created');
    }

    // Categories
    const catsData = [
      { name: 'Spa & Massage', icon: 'spa' },
      { name: 'Nails & Manicure', icon: 'hand-sparkles' },
      { name: 'Hairstyle', icon: 'scissors' },
      { name: 'Make-up', icon: 'wand-magic-sparkles' },
      { name: 'Facial & Skin', icon: 'face-smile' },
      { name: 'Waxing', icon: 'fire' }
    ];

    for (const cat of catsData) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create({ ...cat, isActive: true });
      }
    }
    console.log('✅ Categories ensured');

    // Services
    const categories = await Category.find();
    const servicesData = [
      { name: 'Relaxing Massage', categoryId: categories[0]?._id, baseDurationMin: 60 },
      { name: 'Hot Stone Therapy', categoryId: categories[0]?._id, baseDurationMin: 90 },
      { name: 'Gel Manicure', categoryId: categories[1]?._id, baseDurationMin: 45 },
      { name: 'Acrylic Nails', categoryId: categories[1]?._id, baseDurationMin: 90 },
      { name: 'Women Haircut', categoryId: categories[2]?._id, baseDurationMin: 60 },
      { name: 'Hair Coloring', categoryId: categories[2]?._id, baseDurationMin: 120 },
      { name: 'Bridal Makeup', categoryId: categories[3]?._id, baseDurationMin: 120 },
      { name: 'Party Makeup', categoryId: categories[3]?._id, baseDurationMin: 60 },
      { name: 'Deep Cleansing Facial', categoryId: categories[4]?._id, baseDurationMin: 75 },
      { name: 'Anti-Aging Treatment', categoryId: categories[4]?._id, baseDurationMin: 90 },
      { name: 'Full Body Wax', categoryId: categories[5]?._id, baseDurationMin: 90 },
      { name: 'Bikini Wax', categoryId: categories[5]?._id, baseDurationMin: 30 }
    ];

    for (const svc of servicesData) {
      if (svc.categoryId) {
        const exists = await Service.findOne({ name: svc.name, categoryId: svc.categoryId });
        if (!exists) {
          await Service.create(svc);
        }
      }
    }
    console.log('✅ Services ensured');

    // Pro user
    const proEmail = 'pro@gobeauty.com';
    let proUser = await User.findOne({ email: proEmail });
    if (!proUser) {
      proUser = await User.create({
        fullName: 'Sara Khan',
        email: proEmail,
        phone: '+92-300-1234567',
        password: await bcrypt.hash('pro12345', 10),
        role: 'PROVIDER'
      });
      console.log('✅ Pro user created');
    }

    // Demo provider
    let demoProvider = await Provider.findOne({ ownerUserId: proUser._id });
    if (!demoProvider) {
      demoProvider = await Provider.create({
        ownerUserId: proUser._id,
        type: 'SALON',
        name: 'Glamour Studio Lahore',
        description: 'Premium salon offering complete beauty services with experienced professionals',
        phone: '+92-300-1234567',
        city: 'Lahore',
        addressLine: 'Plot 123, Gulberg III, Lahore',
        lat: 31.5204,
        lng: 74.3587,
        homeService: true,
        salonVisit: true,
        isVerified: true,
        coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
        avatar: 'https://images.unsplash.com/photo-1562322140-8baeececf3df',
        gallery: [
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
          'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2'
        ]
      });
      console.log('✅ Provider demo created');

      // Add provider services
      const services = await Service.find().limit(6);
      for (const service of services) {
        const price = [2000, 1500, 3000, 5000, 2500, 4000][Math.floor(Math.random() * 6)];
        await ProviderService.create({
          providerId: demoProvider._id,
          serviceId: service._id,
          price,
          durationMin: service.baseDurationMin,
          isActive: true,
          homeService: true,
          salonVisit: true
        });
      }
      console.log('✅ Provider services added');

      // Add availability (Mon-Sat, 9AM-6PM)
      for (let day = 1; day <= 6; day++) {
        await AvailabilityRule.create({
          providerId: demoProvider._id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          slotSizeMin: 30,
          isActive: true
        });
      }
      console.log('✅ Provider availability set');
    }

    console.log('🎯 Initial seed data loaded');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};
