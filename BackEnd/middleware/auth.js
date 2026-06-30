'use strict';

const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
};

const requireSelfOrAdmin = (source = 'params', key = 'userId') => (req, res, next) => {
  const value = req[source]?.[key];
  if (req.user?.isAdmin || String(req.user?.id) === String(value)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'You can only access your own data' });
};

module.exports = {
  authenticate,
  requireAdmin,
  requireSelfOrAdmin,
};
