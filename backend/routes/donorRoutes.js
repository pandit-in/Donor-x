const express = require('express');
const router = express.Router();
const {
  createDonor,
  getDonors,
  getDonorById,
  getMyDonorProfile,
  updateDonorProfile,
  toggleAvailability,
  getDonorStats,
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', getDonorStats);
router.get('/me', protect, getMyDonorProfile);
router.put('/me', protect, upload.single('profilePhoto'), updateDonorProfile);
router.patch('/me/availability', protect, toggleAvailability);
router.post('/', protect, upload.single('profilePhoto'), createDonor);
router.get('/', protect, getDonors);
router.get('/:id', protect, getDonorById);

module.exports = router;
