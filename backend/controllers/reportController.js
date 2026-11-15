const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const Report = require('../models/Report');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const SurveyResponse = require('../models/SurveyResponse');
const { notifyUsers } = require('../services/notificationService');
const AdminAuditLog = require('../models/AdminAuditLog');
const { recordAdminAction } = require('../services/auditService');

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: 'Invalid report target' });
    }
    const target = targetType === 'donor'
      ? await Donor.findById(targetId).select('_id')
      : targetType === 'request'
        ? await BloodRequest.findById(targetId).select('_id')
        : null;
    if (!target) return res.status(404).json({ message: 'Report target not found' });

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      donor: targetType === 'donor' ? target._id : undefined,
      request: targetType === 'request' ? target._id : undefined,
      reason,
      details,
    });
    res.status(201).json({ message: 'Report submitted for administrator review', id: report._id });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('donor', 'user name phone email verificationStatus')
      .populate('request', 'user requesterName bloodGroup hospital status')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status, resolution, suspendAccount } = req.body;
    if (!['Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Select Resolved or Dismissed' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    let targetUserId;
    if (suspendAccount === true) {
      if (report.targetType === 'donor') {
        const donor = await Donor.findById(report.donor);
        targetUserId = donor?.user;
      } else {
        const request = await BloodRequest.findById(report.request).select('user');
        targetUserId = request?.user;
      }
      if (targetUserId) {
        const targetUser = await User.findById(targetUserId).select('role');
        if (targetUser?.role === 'admin') {
          return res.status(400).json({ message: 'Administrator accounts cannot be suspended through a user report' });
        }
      }
      if (targetUserId && String(targetUserId) === String(req.user._id)) {
        return res.status(400).json({ message: 'Administrators cannot suspend their own account through a report' });
      }
      if (targetUserId) await User.findByIdAndUpdate(targetUserId, { $set: { isActive: false } });
      if (report.targetType === 'donor') {
        await Donor.updateOne(
          { _id: report.donor },
          { $set: { isAvailable: false, availabilityStatus: 'Resting' } }
        );
      } else if (targetUserId) {
        await BloodRequest.updateMany(
          { user: targetUserId, status: 'Pending' },
          { $set: { status: 'Cancelled' } }
        );
      }
    }

    report.status = status;
    report.resolution = typeof resolution === 'string' ? resolution.slice(0, 1000) : '';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();
    await recordAdminAction({
      actor: req.user._id,
      action: suspendAccount ? 'report_resolved_with_suspension' : 'report_reviewed',
      targetType: report.targetType,
      targetId: report.targetType === 'donor' ? report.donor : report.request,
      details: `${status}: ${report.resolution}`,
    });

    if (targetUserId) {
      try {
        await notifyUsers([targetUserId], {
          type: 'admin_notice',
          title: suspendAccount ? 'Your DonorX account was suspended' : 'Your DonorX report was reviewed',
          message: suspendAccount
            ? 'An administrator suspended this account after reviewing a report. Contact support if you believe this is an error.'
            : 'An administrator reviewed a report related to your account or profile.',
        });
      } catch (error) {
        console.error(`Could not create report review notification: ${error.message}`);
      }
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyDonor = async (req, res) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    if (!['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid donor verification status' });
    }
    if (verificationStatus === 'Verified' && (typeof verificationNotes !== 'string' || verificationNotes.trim().length < 10)) {
      return res.status(400).json({ message: 'Record at least 10 characters describing the profile verification performed' });
    }
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    donor.verificationStatus = verificationStatus;
    donor.verifiedAt = verificationStatus === 'Verified' ? new Date() : null;
    donor.verificationNotes = verificationStatus === 'Verified' ? verificationNotes.trim().slice(0, 1000) : '';
    await donor.save();
    await recordAdminAction({
      actor: req.user._id,
      action: `donor_verification_${verificationStatus.toLowerCase()}`,
      targetType: 'donor',
      targetId: donor._id,
      details: donor.verificationNotes,
    });
    if (verificationStatus === 'Verified') {
      try {
        await notifyUsers([donor.user], {
          type: 'donor_verified',
          title: 'Donor profile verified',
          message: 'An administrator verified your DonorX profile. This is profile verification, not medical eligibility.',
        });
      } catch (error) {
        console.error(`Could not create donor verification notification: ${error.message}`);
      }
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminDonors = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'name email isActive')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 }).limit(500);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setUserActive = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot deactivate your own administrator account' });
    }
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be true or false' });
    }
    const user = await User.findById(req.params.id).select('name email role isActive');
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrator accounts cannot be suspended here' });
    }
    user.isActive = req.body.isActive;
    await user.save();
    if (!user.isActive) {
      await Donor.updateOne(
        { user: user._id },
        { $set: { isAvailable: false, availabilityStatus: 'Resting' } }
      );
    }
    await recordAdminAction({
      actor: req.user._id,
      action: user.isActive ? 'account_reactivated' : 'account_suspended',
      targetType: 'user',
      targetId: user._id,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminSummary = async (req, res) => {
  try {
    const [pendingDonors, openReports, pendingBanks, surveyResponses, activeRequests, activeUsers] = await Promise.all([
      Donor.countDocuments({ verificationStatus: 'Pending' }),
      Report.countDocuments({ status: 'Open' }),
      BloodBank.countDocuments({ verificationStatus: 'Pending' }),
      SurveyResponse.countDocuments(),
      BloodRequest.countDocuments({ status: 'Pending' }),
      User.countDocuments({ isActive: { $ne: false } }),
    ]);
    res.json({ pendingDonors, openReports, pendingBanks, surveyResponses, activeRequests, activeUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
  verifyDonor,
  getAdminDonors,
  getAdminUsers,
  setUserActive,
  getAdminSummary,
  getAdminAuditLogs,
};
