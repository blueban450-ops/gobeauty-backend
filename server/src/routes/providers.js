import { Router } from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import ProviderService from '../models/ProviderService.js';
import Service from '../models/Service.js';
import AvailabilityRule from '../models/AvailabilityRule.js';
import BlockedTime from '../models/BlockedTime.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { resizeImage } from '../middleware/resizeImage.js';
import { geocodeAddressOSM } from '../utils/geocodeAddressOSM.js';

const router = Router();

// Get all verified providers (with filters)
router.get('/', asyncHandler(async (req, res) => {
  const { search, city, homeService, salonVisit, minRating, sort, page = 1, limit = 20 } = req.query;

  const filter = { isVerified: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (city) filter.city = city;
  if (homeService === 'true') filter.homeService = true;
  if (salonVisit === 'true') filter.salonVisit = true;
  if (minRating) filter.rating = { $gte: parseFloat(minRating) };

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'reviews') sortOption = { reviewCount: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Debug logs for diagnosis
  console.log('Provider fetch filter:', filter);

  // Query providers with filters and pagination
  const providers = await Provider.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  console.log('Providers found:', providers.length);
  if (providers.length > 0) {
    console.log('Sample provider:', providers[0]);
  }

  // For each provider, fetch their services
  const providerIds = providers.map(p => p._id);
  const providerServices = await ProviderService.find({ providerId: { $in: providerIds } }).lean();
  const serviceIds = providerServices.map(ps => ps.serviceId).filter(Boolean);
  const services = await Service.find({ _id: { $in: serviceIds } }).lean();
  const serviceMap = new Map(services.map(s => [String(s._id), s]));

  // Attach real services to each provider
  const providerIdToServices = {};
  providerServices.forEach(ps => {
    const sid = String(ps.providerId);
    if (!providerIdToServices[sid]) providerIdToServices[sid] = [];
    // Attach full service info
    providerIdToServices[sid].push({
      ...ps,
      serviceId: serviceMap.get(String(ps.serviceId)) || null
    });
  });

  providers.forEach(p => {
    p.services = providerIdToServices[String(p._id)] || [];
  });

  const total = await Provider.countDocuments(filter);
  res.json({ providers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
}));

// Admin: Get all providers (including unverified)
router.get('/admin/all', auth('ADMIN'), asyncHandler(async (req, res) => {
  const providers = await Provider.find({})
    .populate('ownerUserId', 'fullName email phone')
    .sort({ createdAt: -1 })
    .lean();
  
  res.json({ providers });
}));

// Create provider profile (Provider only)
router.post('/', auth('PROVIDER'), asyncHandler(async (req, res) => {
  // Check if already has provider
  const existing = await Provider.findOne({ ownerUserId: req.user.id });
  if (existing) throw createError(400, 'Provider profile already exists');
  
  const schema = z.object({
    type: z.enum(['SALON', 'INDIVIDUAL']),
    name: z.string().min(2),
    description: z.string().optional(),
    phone: z.string(),
    city: z.string(),
    addressLine: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    homeService: z.boolean().default(false),
    salonVisit: z.boolean().default(false)
  });

  let body = schema.parse(req.body);

  // Agar lat/lng missing hain to address se geocode karo (OpenStreetMap)
  if ((body.lat === undefined || body.lng === undefined) && body.addressLine && body.city) {
    const geo = await geocodeAddressOSM(`${body.addressLine}, ${body.city}`);
    if (geo) {
      body.lat = geo.lat;
      body.lng = geo.lng;
    }
  }

  const provider = await Provider.create({
    ...body,
    ownerUserId: req.user.id,
    isVerified: false
  });

  res.status(201).json(provider);
}));

// Update provider profile
router.patch('/me', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ ownerUserId: req.user.id });
  if (!provider) throw createError(404, 'Provider profile not found');
  
  const schema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    addressLine: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    homeService: z.boolean().optional(),
    salonVisit: z.boolean().optional(),
    avatar: z.string().optional(),
    coverImage: z.string().optional(),
    workingHours: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional()
  });
  
  let body = schema.parse(req.body);

  // Agar lat/lng missing hain aur address/city update ho rahe hain to geocode karo (OpenStreetMap)
  if ((body.lat === undefined || body.lng === undefined) && (body.addressLine || body.city)) {
    const addr = body.addressLine || provider.addressLine || '';
    const city = body.city || provider.city || '';
    if (addr && city) {
      const geo = await geocodeAddressOSM(`${addr}, ${city}`);
      if (geo) {
        body.lat = geo.lat;
        body.lng = geo.lng;
      }
    }
  }

  Object.assign(provider, body);
  await provider.save();

  res.json(provider);
}));

// Get my provider profile
router.get('/me/profile', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ ownerUserId: req.user.id }).lean();
  if (!provider) throw createError(404, 'Provider profile not found');
  res.json(provider);
}));

// Upload avatar
router.post('/me/avatar', auth('PROVIDER'), upload.single('image'), asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ ownerUserId: req.user.id });
  if (!provider) throw createError(404, 'Provider profile not found');
  
  if (!req.file) throw createError(400, 'No image file uploaded');
  
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.protocol || 'http';
  const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  provider.avatar = avatarUrl;
  await provider.save();
  
  res.json({ avatarUrl, message: 'Avatar uploaded successfully' });
}));

// Upload cover image
router.post('/me/cover', auth('PROVIDER'), upload.single('image'), asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ ownerUserId: req.user.id });
  if (!provider) throw createError(404, 'Provider profile not found');
  
  if (!req.file) throw createError(400, 'No image file uploaded');
  
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.protocol || 'http';
  const coverUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  provider.coverImage = coverUrl;
  await provider.save();
  
  res.json({ coverUrl, message: 'Cover image uploaded successfully' });
}));

// ===== PROVIDER SERVICES =====

// Get my services
router.get('/me/services', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const providerId = req.user?.providerId;
  if (!providerId) {
    console.log('[GET /me/services] ERROR: No providerId found');
    return res.status(400).json({ error: 'No provider profile' });
  }

  console.log('[GET /me/services] Fetching for providerId:', providerId);

  const rawServices = await ProviderService.find({ providerId }).lean();
  console.log('[GET /me/services] Raw count:', rawServices.length);

  if (!rawServices.length) {
    console.log('[GET /me/services] No raw services found, returning empty array');
    return res.json([]);
  }

  const serviceIds = rawServices
    .map(s => s.serviceId)
    .filter(id => id && mongoose.Types.ObjectId.isValid(String(id)))
    .map(id => String(id));

  console.log('[GET /me/services] Valid serviceIds:', serviceIds.length);

  if (!serviceIds.length) {
    console.log('[GET /me/services] No valid service IDs, returning empty array');
    return res.json([]);
  }

  const services = await Service.find({ _id: { $in: serviceIds } })
    .populate('categoryId')
    .lean();

  console.log('[GET /me/services] Found services:', services.length);

  const serviceMap = new Map(services.map(s => [String(s._id), s]));
  const result = rawServices
    .map(ps => ({
      ...ps,
      serviceId: serviceMap.get(String(ps.serviceId)) || null
    }))
    .filter(ps => ps.serviceId !== null);

  console.log('[GET /me/services] Final result:', result.length);
  res.json(result);
}));

// Add service
router.post('/me/services', auth('PROVIDER'), upload.single('thumbnail'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  
  const schema = z.object({
    serviceId: z.string().length(24),
    customName: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    durationMin: z.coerce.number().min(15),
    homeService: z.coerce.boolean(),
    salonVisit: z.coerce.boolean(),
    workingHours: z.any().optional()
  });
  
  try {
    const body = schema.parse(req.body);
    // workingHours agar string hai to JSON.parse karo
    if (body.workingHours && typeof body.workingHours === 'string') {
      try {
        body.workingHours = JSON.parse(body.workingHours);
      } catch (e) {
        // ignore, let validation fail if not valid JSON
      }
    }
    // Verify referenced Service exists to avoid broken records
    const serviceExists = await Service.exists({ _id: body.serviceId });
    if (!serviceExists) {
      throw createError(400, 'Invalid serviceId: service not found');
    }
    let thumbnail = undefined;
    if (req.file) {
      // Resize image to 40x40px
      try {
        const resizedPath = await resizeImage(req.file.path, 40, 40);
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        // Use resized image as thumbnail
        const filename = resizedPath.split(/[/\\]/).pop();
        thumbnail = `${protocol}://${host}/uploads/${filename}`;
      } catch (e) {
        // Fallback to original if resize fails
        const host = req.get('host') || 'localhost:4000';
        const protocol = req.protocol || 'http';
        thumbnail = `${protocol}://${host}/uploads/${req.file.filename}`;
      }
    }
    const service = await ProviderService.create({
      ...body,
      thumbnail,
      providerId: req.user.providerId,
      isActive: true
    });
    res.status(201).json(service);
  } catch (err) {
    console.error('Add service validation error:', err.message);
    if (err.errors) {
      console.error('Validation details:', err.errors);
      throw createError(400, err.errors[0]?.message || 'Validation failed');
    }
    throw err;
  }
}));

// Update service
router.patch('/me/services/:id', auth('PROVIDER'), upload.single('thumbnail'), asyncHandler(async (req, res) => {
  const service = await ProviderService.findOne({ _id: req.params.id, providerId: req.user.providerId });
  if (!service) throw createError(404, 'Service not found');

  // If trying to activate, check if linked Service is active
  const schema = z.object({
    customName: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    durationMin: z.coerce.number().min(15).optional(),
    homeService: z.coerce.boolean().optional(),
    salonVisit: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
    workingHours: z.string().optional()
  });

  const body = schema.parse(req.body);

  // If provider is trying to activate, check linked Service
  if (body.isActive === true) {
    const linkedService = await Service.findById(service.serviceId);
    if (!linkedService || linkedService.isActive === false) {
      return res.status(403).json({ error: 'This service has been inactivated by admin. Please contact admin to reactivate.' });
    }
  }

  Object.assign(service, body);

  if (req.file) {
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    service.thumbnail = `${protocol}://${host}/uploads/${req.file.filename}`;
  }

  await service.save();

  res.json(service);
}));

// Upload service thumbnail
router.post('/me/services/:id/thumbnail', auth('PROVIDER'), upload.single('image'), asyncHandler(async (req, res) => {
  const service = await ProviderService.findOne({ _id: req.params.id, providerId: req.user.providerId });
  if (!service) throw createError(404, 'Service not found');
  if (!req.file) throw createError(400, 'No image file uploaded');
  
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.protocol || 'http';
  const thumbnailUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  service.thumbnail = thumbnailUrl;
  await service.save();
  
  res.json({ thumbnailUrl, message: 'Thumbnail uploaded successfully' });
}));

// Inactivate service (soft delete)
// Hard delete service (permanent removal)
router.delete('/me/services/:id', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const deleted = await ProviderService.findOneAndDelete({ _id: req.params.id, providerId: req.user.providerId });
  if (!deleted) throw createError(404, 'Service not found');
  res.json({ message: 'Service deleted permanently' });
}));

// Get provider by ID (must come after /me routes to avoid catching /me/services)
router.get('/:id', asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).lean();
  if (!provider) throw createError(404, 'Provider not found');
  
  // Get services
  const services = await ProviderService.find({ providerId: req.params.id, isActive: true })
    .populate('serviceId')
    .lean();
  
  // Get reviews
  const reviews = await Review.find({ providerId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customerUserId', 'fullName avatar')
    .lean();
  
  res.json({ ...provider, services, reviews });
}));

// Get provider services by id (public)
router.get('/:id/services', asyncHandler(async (req, res) => {
  const { mode } = req.query;
  const filter = { providerId: req.params.id, isActive: true };
  
  if (mode === 'HOME') filter.homeService = true;
  if (mode === 'SALON') filter.salonVisit = true;
  
  const services = await ProviderService.find(filter)
    .populate('serviceId')
    .lean();
  
  // Enrich with custom details and thumbnails
  const enriched = services.map(s => ({
    _id: s._id,
    serviceName: s.customName || s.serviceId?.name || 'Service',
    description: s.description || '',
    thumbnail: s.thumbnail,
    categoryId: s.serviceId?.categoryId,
    price: s.price,
    durationMin: s.durationMin,
    homeService: s.homeService,
    salonVisit: s.salonVisit,
  }));
  
  res.json(enriched);
}));

// ===== ADMIN ROUTES =====

// Get all provider services (admin only)
router.get('/admin/all-services', asyncHandler(async (req, res) => {
  const services = await ProviderService.find()
    .populate('providerId', 'businessName city')
    .populate('serviceId')
    .sort('-createdAt');
  res.json(services);
}));

// Get my availability rules
router.get('/me/availability', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  const rules = await AvailabilityRule.find({ providerId: req.user.providerId }).lean();
  res.json(rules);
}));

// Create availability rule
router.post('/me/availability', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  
  const schema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotSizeMin: z.number().default(30)
  });
  
  const body = schema.parse(req.body);
  
  const rule = await AvailabilityRule.create({
    ...body,
    providerId: req.user.providerId,
    isActive: true
  });
  
  res.status(201).json(rule);
}));

// Update availability rule
router.patch('/me/availability/:id', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const rule = await AvailabilityRule.findOne({ _id: req.params.id, providerId: req.user.providerId });
  if (!rule) throw createError(404, 'Rule not found');
  
  const schema = z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    slotSizeMin: z.number().optional(),
    isActive: z.boolean().optional()
  });
  
  const body = schema.parse(req.body);
  Object.assign(rule, body);
  await rule.save();
  
  res.json(rule);
}));

// Delete availability rule
router.delete('/me/availability/:id', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const rule = await AvailabilityRule.findOneAndDelete({ _id: req.params.id, providerId: req.user.providerId });
  if (!rule) throw createError(404, 'Rule not found');
  res.json({ message: 'Rule deleted' });
}));

// ===== BLOCKED TIMES =====

// Get blocked times
router.get('/me/blocked-times', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  const blocked = await BlockedTime.find({ providerId: req.user.providerId }).sort({ startAt: 1 }).lean();
  res.json(blocked);
}));

// Create blocked time
router.post('/me/blocked-times', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  
  const schema = z.object({
    startAt: z.string(),
    endAt: z.string(),
    reason: z.string().optional()
  });
  
  const body = schema.parse(req.body);
  
  const blocked = await BlockedTime.create({
    ...body,
    providerId: req.user.providerId,
    startAt: new Date(body.startAt),
    endAt: new Date(body.endAt)
  });
  
  res.status(201).json(blocked);
}));

// Delete blocked time
router.delete('/me/blocked-times/:id', auth('PROVIDER'), asyncHandler(async (req, res) => {
  const blocked = await BlockedTime.findOneAndDelete({ _id: req.params.id, providerId: req.user.providerId });
  if (!blocked) throw createError(404, 'Blocked time not found');
  res.json({ message: 'Blocked time deleted' });
}));

// ===== EARNINGS =====

router.get('/me/earnings', auth('PROVIDER'), asyncHandler(async (req, res) => {
  if (!req.user.providerId) throw createError(400, 'No provider profile');
  
  const bookings = await Booking.find({
    providerId: req.user.providerId,
    status: 'COMPLETED'
  }).lean();
  
  const totalEarnings = bookings.reduce((sum, b) => sum + b.total, 0);
  const commission = totalEarnings * 0.12; // 12% commission
  const netEarnings = totalEarnings - commission;
  
  res.json({
    totalBookings: bookings.length,
    totalEarnings,
    commission,
    netEarnings,
    bookings
  });
}));

// ===== ADMIN ROUTES =====

// Verify provider
router.patch('/:id/verify', auth('ADMIN'), asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) throw createError(404, 'Provider not found');
  
  provider.isVerified = true;
  await provider.save();
  
  res.json(provider);
}));

// Get unverified providers
router.get('/admin/unverified', auth('ADMIN'), asyncHandler(async (req, res) => {
  const providers = await Provider.find({ isVerified: false })
    .populate('ownerUserId', 'fullName email phone')
    .lean();
  res.json(providers);
}));

// Get all provider services (admin endpoint)
router.get('/admin/provider-services', auth('ADMIN'), asyncHandler(async (req, res) => {
  const services = await ProviderService.find()
    .populate('providerId', 'businessName city')
    .populate('serviceId', 'name categoryId')
    .sort({ createdAt: -1 })
    .lean();
  
  res.json(services);
}));

export default router;
