const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { registerUser, loginUser, getMe, updateNotificationPreferences } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Account service is unavailable because the database is disconnected. Please try again later.',
    });
  }
  return next();
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.patch('/notifications', protect, updateNotificationPreferences);

module.exports = router;
