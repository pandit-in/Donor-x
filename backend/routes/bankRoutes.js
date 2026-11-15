const express = require('express');
const { getBanks, suggestBank } = require('../controllers/bankController');
const { optionalProtect } = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', getBanks);
router.post('/suggestions', suggestionLimiter, optionalProtect, suggestBank);

module.exports = router;
