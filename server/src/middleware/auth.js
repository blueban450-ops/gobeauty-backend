import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Provider from '../models/Provider.js';

export const auth = (...roles) => async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(createError(401, 'Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (roles.length && !roles.includes(decoded.role)) {
      return next(createError(403, 'Forbidden'));
    }
    req.user = decoded;
    // Attach providerId for PROVIDER role
    if (decoded.role === 'PROVIDER' && !req.user.providerId) {
      const provider = await Provider.findOne({ ownerUserId: decoded.id });
      if (provider) req.user.providerId = provider._id.toString();
    }
    next();
  } catch (e) {
    next(createError(401, 'Invalid token'));
  }
};
