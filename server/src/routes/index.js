
import { Router } from 'express';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import categoryRoutes from './categories.js';
import serviceRoutes from './services.js';
import providerRoutes from './providers.js';
import bookingRoutes from './bookings.js';
import notificationRoutes from './notificationsRoutes.js';
import reviewRoutes from './reviews.js';
import favoriteRoutes from './favorites.js';
import supportRoutes from './support.js';
import settingsRoutes from './settingsRoutes.js';
import healthRouter from './health.js';
import ProviderService from '../models/ProviderService.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// PATCH endpoint to update isActive status of a provider service
router.patch('/admin/provider-services/:id/status', auth('ADMIN'), asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { isActive } = req.body;
	if (typeof isActive !== 'boolean') {
		return res.status(400).json({ message: 'isActive must be boolean' });
	}
	const svc = await ProviderService.findByIdAndUpdate(id, { isActive }, { new: true });
	if (!svc) return res.status(404).json({ message: 'ProviderService not found' });
	res.json(svc);
}));

router.use('/health', healthRouter);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/support', supportRoutes);
router.use('/settings', settingsRoutes);

// Profile routes for customer/provider profile update
router.use('/profile', profileRoutes);

// Alias admin route for provider services to match frontend expectations
// This mirrors the handler in providers.js at `/providers/admin/provider-services`
router.get('/admin/provider-services', auth('ADMIN'), asyncHandler(async (req, res) => {
	const services = await ProviderService.find()
		.populate('providerId', 'name city')
		.populate('serviceId', 'name categoryId')
		.sort({ createdAt: -1 })
		.lean();
	res.json(services);
}));

export default router;
