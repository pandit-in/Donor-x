const express = require('express');
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

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.patch('/notifications', protect, updateNotificationPreferences);

module.exports = router;
