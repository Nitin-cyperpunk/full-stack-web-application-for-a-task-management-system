const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    jwtSecret(),
    { expiresIn: jwtExpiresIn }
  );
}

function userResponse(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', details: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.create({
    email,
    password,
    role: 'user',
  });

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: userResponse(user),
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', details: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user);
  const safe = await User.findById(user._id);
  return res.json({
    token,
    user: userResponse(safe),
  });
}

module.exports = {
  register,
  login,
  signToken,
  userResponse,
};
