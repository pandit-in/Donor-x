const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getMyResponses,
  getOpenRequests,
  respondToRequest,
  connectResponse,
  withdrawResponse,
  updateRequest,
  getRequestStats,
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/stats', getRequestStats);
router.get('/my', protect, getMyRequests);
router.get('/responses', protect, getMyResponses);
router.get('/open', protect, getOpenRequests);
router.post('/', requestLimiter, protect, createRequest);
router.get('/', protect, adminOnly, getAllRequests);
router.patch('/:id/responses/me', protect, withdrawResponse);
router.patch('/:id/responses/:responseId/connect', protect, connectResponse);
router.post('/:id/respond', protect, respondToRequest);
router.put('/:id', protect, updateRequest);

module.exports = router;
