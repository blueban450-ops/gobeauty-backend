// Customer profile update aur image upload ka route
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Profile update (avatar bhi upload ho sakta hai)
router.put('/me', auth('CUSTOMER', 'PROVIDER', 'ADMIN'), upload.single('avatar'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Text fields update karo
  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.city = req.body.city || user.city;
  user.address = req.body.address || user.address;

  // Agar avatar file aayi hai to uska path save karo
  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }

  await user.save();
  res.json({
    message: 'Profile updated',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      avatar: user.avatar
    }
  });
}));

export default router;
