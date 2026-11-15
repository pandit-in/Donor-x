const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { notifyUsers } = require('../services/notificationService');

const compatibleDonors = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

const notify = async (userIds, details) => {
  try {
    await notifyUsers(userIds, details);
  } catch (error) {
    console.error(`Could not persist request notification: ${error.message}`);
  }
};

const createRequest = async (req, res) => {
  try {
    const {
      requesterName,
      requesterPhone,
      requesterEmail,
      bloodGroup,
      unitsNeeded,
      urgency,
      hospital,
      area,
      address,
      shareContactWithDonor,
      attendant,
      patientName,
      reason,
      notes,
      neededBy,
    } = req.body;
    const request = await BloodRequest.create({
      requesterName,
      requesterPhone,
      requesterEmail,
      bloodGroup,
      unitsNeeded,
      urgency,
      hospital,
      area,
      address,
      shareContactWithDonor: shareContactWithDonor === true,
      attendant,
      patientName,
      reason,
      notes,
      neededBy,
      user: req.user._id,
    });

    const donors = await Donor.find({
      bloodGroup: { $in: compatibleDonors[bloodGroup] },
      isAvailable: true,
      verificationStatus: 'Verified',
    }).select('user');
    await notify(donors.map((donor) => donor.user), {
      type: 'request_created',
      title: `Blood request: ${bloodGroup} at ${hospital}`,
      message: `${unitsNeeded || 1} unit(s) requested in ${area}. Sign in to view the request and respond.`,
      relatedRequest: request._id,
    });
    res.status(201).json(request);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('respondedDonor', 'user name phone bloodGroup area shareContact verificationStatus')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ user: req.user._id })
      .populate('respondedDonor', 'user name phone bloodGroup area shareContact verificationStatus')
      .sort({ createdAt: -1 });
    res.json(requests.map((request) => {
      const result = request.toObject();
      if (result.respondedDonor && !result.respondedDonor.shareContact) {
        delete result.respondedDonor.phone;
      }
      if (result.respondedDonor) delete result.respondedDonor.shareContact;
      if (result.respondedDonor) delete result.respondedDonor.user;
      return result;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOpenRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      status: 'Pending',
      respondedDonor: null,
      user: { $ne: req.user._id },
    })
      .select('bloodGroup unitsNeeded urgency hospital area status createdAt')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can respond to requests' });
    }
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Register a donor profile before responding' });
    }
    if (!donor.isAvailable) {
      return res.status(403).json({ message: 'Mark yourself available before responding' });
    }
    if (donor.verificationStatus !== 'Verified') {
      return res.status(403).json({ message: 'Your donor profile must be verified before responding' });
    }
    const allowedEtas = ['10-15 mins', '20-30 mins', '45 mins', '1 hour'];
    if (!allowedEtas.includes(req.body.eta)) {
      return res.status(400).json({ message: 'Select a valid arrival time' });
    }

    const openRequest = await BloodRequest.findOne({
      _id: req.params.id,
      status: 'Pending',
      respondedDonor: null,
      user: { $ne: req.user._id },
    }).select('bloodGroup');
    if (!openRequest) return res.status(404).json({ message: 'Open request not found' });
    if (!compatibleDonors[openRequest.bloodGroup]?.includes(donor.bloodGroup)) {
      return res.status(403).json({ message: 'Your blood group is not compatible with this request' });
    }

    const request = await BloodRequest.findOneAndUpdate(
      { _id: openRequest._id, status: 'Pending', respondedDonor: null, user: { $ne: req.user._id } },
      { $set: { respondedDonor: donor._id, responseEta: req.body.eta, respondedAt: new Date() } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!request) return res.status(404).json({ message: 'Open request not found' });

    if (request.user) {
      await notify([request.user], {
        type: 'request_accepted',
        title: `A donor responded to your ${request.bloodGroup} request`,
        message: `${donor.name} responded with an ETA of ${req.body.eta}. Sign in to view their response.`,
        relatedRequest: request._id,
      });
    }

    const response = request.toObject();
    if (!request.shareContactWithDonor) {
      delete response.requesterName;
      delete response.requesterPhone;
      delete response.requesterEmail;
      delete response.address;
      delete response.attendant;
    }
    delete response.user;
    delete response.shareContactWithDonor;
    delete response.patientName;
    delete response.notes;
    delete response.reason;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    if (!['Pending', 'Fulfilled', 'Cancelled'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid request status' });
    }
    if (req.body.status === 'Pending') {
      return res.status(400).json({ message: 'A closed request cannot be reopened' });
    }

    const isAdmin = req.user.role === 'admin';
    const filter = {
      _id: req.params.id,
      status: 'Pending',
      ...(isAdmin ? {} : { user: req.user._id }),
    };
    const request = await BloodRequest.findOneAndUpdate(
      filter,
      { $set: { status: req.body.status } },
      { returnDocument: 'after', runValidators: true }
    ).populate('respondedDonor', 'user name phone bloodGroup area shareContact verificationStatus');
    if (!request) return res.status(404).json({ message: 'Open request not found or not owned by you' });

    const recipients = [request.user, request.respondedDonor?.user].filter(Boolean);
    await notify(recipients, {
      type: 'request_updated',
      title: `Blood request ${req.body.status.toLowerCase()}`,
      message: `The ${request.bloodGroup} request for ${request.hospital} was marked ${req.body.status.toLowerCase()}.`,
      relatedRequest: request._id,
    });
    const response = request.toObject();
    if (response.respondedDonor) {
      if (!response.respondedDonor.shareContact) delete response.respondedDonor.phone;
      delete response.respondedDonor.user;
      delete response.respondedDonor.shareContact;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestStats = async (req, res) => {
  try {
    const pending = await BloodRequest.countDocuments({ status: 'Pending' });
    const fulfilled = await BloodRequest.countDocuments({ status: 'Fulfilled' });
    const total = await BloodRequest.countDocuments();
    res.json({ pending, fulfilled, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getOpenRequests,
  respondToRequest,
  updateRequest,
  getRequestStats,
};
