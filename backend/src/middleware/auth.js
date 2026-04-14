const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');

function extractToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

/**
 * Requires a valid JWT. Sets req.user = { id, role }.
 */
async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, jwtSecret());
    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, invalid token payload' });
    }
    const user = await User.findById(userId).select('_id role email');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
    };
    return next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    return next(err);
  }
}

module.exports = { authenticate, extractToken };
