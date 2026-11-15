const express = require('express');
const { createSurveyResponse, getSurveyStats } = require('../controllers/surveyController');
const { optionalProtect } = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const surveyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', surveyLimiter, optionalProtect, createSurveyResponse);
router.get('/stats', getSurveyStats);

module.exports = router;
