const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), asyncHandler(userController.listUsers));

module.exports = router;
