const express = require('express');
const {
  getReports,
  resolveReport,
  verifyDonor,
  getAdminDonors,
  getAdminUsers,
  setUserActive,
  getAdminSummary,
  getAdminAuditLogs,
} = require('../controllers/reportController');
const { getSurveyResponses } = require('../controllers/surveyController');
const { getAdminBanks, createBank, updateBank } = require('../controllers/bankController');
const { getAllRequests, reviewRequest } = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/summary', getAdminSummary);
router.get('/audit-logs', getAdminAuditLogs);
router.get('/donors', getAdminDonors);
router.patch('/donors/:id/verification', verifyDonor);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.get('/requests', getAllRequests);
router.patch('/requests/:id/status', reviewRequest);
router.get('/users', getAdminUsers);
router.patch('/users/:id/active', setUserActive);
router.get('/blood-banks', getAdminBanks);
router.post('/blood-banks', createBank);
router.patch('/blood-banks/:id', updateBank);
router.get('/surveys', getSurveyResponses);

module.exports = router;
