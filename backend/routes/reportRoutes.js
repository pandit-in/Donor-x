const express = require('express');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', protect, reportLimiter, createReport);

module.exports = router;
