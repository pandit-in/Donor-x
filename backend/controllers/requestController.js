const BloodRequest = require('../models/BloodRequest');
const DonorResponse = require('../models/DonorResponse');
const Donor = require('../models/Donor');
const { notifyUsers } = require('../services/notificationService');
const { recordAdminAction } = require('../services/auditService');

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

const donorVisibleRequestStatuses = ['Searching', 'Donor Responded'];
const activeRequestStatuses = ['Pending', 'Verified', 'Searching', 'Donor Responded', 'Connected'];
const finalRequestStatuses = ['Fulfilled', 'Cancelled', 'Expired'];
const allowedEtas = ['10-15 mins', '20-30 mins', '45 mins', '1 hour'];

const notify = async (userIds, details) => {
  try {
    await notifyUsers(userIds, details);
    return null;
  } catch (error) {
    console.error(`Could not persist request notification: ${error.message}`);
    return 'The request was saved, but a notification could not be delivered.';
  }
};

const expireRequests = async () => {
  await BloodRequest.updateMany(
    { status: { $in: activeRequestStatuses }, neededBy: { $lte: new Date() } },
    { $set: { status: 'Expired' } }
  );
};

const getMatchingDonorUserIds = async (bloodGroup) => {
  const donors = await Donor.find({
    bloodGroup: { $in: compatibleDonors[bloodGroup] || [] },
    isAvailable: true,
    verificationStatus: 'Verified',
  })
    .populate('user', 'isActive')
    .select('user');
  return [...new Set(donors
    .filter((donor) => donor.user && donor.user.isActive !== false)
    .map((donor) => String(donor.user._id)))];
};

const getResponsesByRequest = async (requests, { includeContact = false } = {}) => {
  if (!requests.length) return new Map();
  const ids = requests.map((request) => request._id);
  const query = DonorResponse.find({ request: { $in: ids } })
    .populate({
      path: 'donor',
      select: 'user name phone bloodGroup area shareContact verificationStatus',
      populate: { path: 'user', select: 'isActive' },
    })
    .sort({ createdAt: 1 });
  const responses = await query;
  const connectedByRequest = new Map(requests.map((request) => [
    String(request._id),
    new Set((request.connectedResponses || []).map(String)),
  ]));
  return responses.reduce((result, response) => {
    const item = response.toObject();
    if (item.donor) {
      if (!includeContact || !item.donor.shareContact || item.donor.user?.isActive === false) {
        delete item.donor.phone;
      }
      delete item.donor.shareContact;
      delete item.donor.user;
    }
    const key = String(item.request);
    item.isConnected = connectedByRequest.get(key)?.has(String(item._id)) || false;
    const forRequest = result.get(key) || [];
    forRequest.push(item);
    result.set(key, forRequest);
    return result;
  }, new Map());
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
      status: 'Pending',
    });
    res.status(201).json(request);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    await expireRequests();
    const requests = await BloodRequest.find()
      .populate('respondedDonor', 'user name phone bloodGroup area shareContact verificationStatus')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    const responsesByRequest = await getResponsesByRequest(requests, { includeContact: true });
    res.json(requests.map((request) => ({
      ...request.toObject(),
      donorResponses: responsesByRequest.get(String(request._id)) || [],
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    await expireRequests();
    const requests = await BloodRequest.find({ user: req.user._id })
      .populate('respondedDonor', 'user name phone bloodGroup area shareContact verificationStatus')
      .sort({ createdAt: -1 });
    const responsesByRequest = await getResponsesByRequest(requests, { includeContact: true });
    res.json(requests.map((request) => {
      const result = request.toObject();
      result.donorResponses = responsesByRequest.get(String(request._id)) || [];
      if (!result.donorResponses.length && result.respondedDonor) {
        const legacyDonor = result.respondedDonor;
        if (!legacyDonor.shareContact) delete legacyDonor.phone;
        delete legacyDonor.shareContact;
        delete legacyDonor.user;
        result.donorResponses = [{
          _id: `legacy-${request._id}`,
          status: 'Accepted',
          eta: result.responseEta,
          respondedAt: result.respondedAt,
          donor: legacyDonor,
          legacy: true,
        }];
      }
      delete result.respondedDonor;
      delete result.responseEta;
      delete result.respondedAt;
      return result;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyResponses = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only registered donors can view their request responses' });
    }
    const donor = await Donor.findOne({ user: req.user._id }).select('_id');
    if (!donor) return res.json([]);

    const responses = await DonorResponse.find({ donor: donor._id })
      .populate('request')
      .sort({ createdAt: -1 });
    const result = responses.filter((response) => response.request).map((response) => {
      const request = response.request;
      const item = {
        _id: response._id,
        requestId: request._id,
        bloodGroup: request.bloodGroup,
        unitsNeeded: request.unitsNeeded,
        urgency: request.urgency,
        hospital: request.hospital,
        area: request.area,
        status: request.status,
        responseStatus: response.status,
        responseEta: response.eta,
        responseMessage: response.message,
        isConnected: (request.connectedResponses || []).some((id) => String(id) === String(response._id)),
        neededBy: request.neededBy,
        respondedAt: response.respondedAt,
        createdAt: response.createdAt,
      };
      if (request.shareContactWithDonor) {
        item.requesterPhone = request.requesterPhone;
        item.address = request.address;
      }
      return item;
    });

    const modernRequestIds = responses.map((response) => response.request?._id).filter(Boolean);
    const legacyRequests = await BloodRequest.find({
      respondedDonor: donor._id,
      _id: { $nin: modernRequestIds },
    })
      .select('bloodGroup unitsNeeded urgency hospital area status neededBy shareContactWithDonor requesterPhone address respondedAt responseEta createdAt')
      .sort({ respondedAt: -1 });
    legacyRequests.forEach((request) => {
      const item = {
        _id: `legacy-${request._id}`,
        requestId: request._id,
        bloodGroup: request.bloodGroup,
        unitsNeeded: request.unitsNeeded,
        urgency: request.urgency,
        hospital: request.hospital,
        area: request.area,
        status: request.status,
        responseStatus: 'Accepted',
        responseEta: request.responseEta,
        neededBy: request.neededBy,
        respondedAt: request.respondedAt,
        createdAt: request.createdAt,
        legacy: true,
      };
      if (request.shareContactWithDonor) {
        item.requesterPhone = request.requesterPhone;
        item.address = request.address;
      }
      result.push(item);
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOpenRequests = async (req, res) => {
  try {
    await expireRequests();
    const donor = await Donor.findOne({ user: req.user._id }).select('_id bloodGroup isAvailable verificationStatus');
    if (!donor || !donor.isAvailable || donor.verificationStatus !== 'Verified') return res.json([]);

    const existingResponses = await DonorResponse.find({ donor: donor._id }).select('request');
    const requests = await BloodRequest.find({
      status: { $in: donorVisibleRequestStatuses },
      bloodGroup: { $in: compatibleDonors[donor.bloodGroup] || [] },
      user: { $ne: req.user._id },
      respondedDonor: null,
      _id: { $nin: existingResponses.map((response) => response.request) },
    })
      .select('bloodGroup unitsNeeded urgency hospital area status createdAt neededBy')
      .sort({ urgency: -1, createdAt: -1 });
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
    if (!donor) return res.status(404).json({ message: 'Register a donor profile before responding' });
    if (!donor.isAvailable) return res.status(403).json({ message: 'Mark yourself available before responding' });
    if (donor.verificationStatus !== 'Verified') {
      return res.status(403).json({ message: 'Your donor profile must be verified before responding' });
    }
    const responseStatus = req.body.status || 'Accepted';
    if (!['Accepted', 'Rejected'].includes(responseStatus)) {
      return res.status(400).json({ message: 'Response status must be Accepted or Rejected' });
    }
    if (responseStatus === 'Accepted' && !allowedEtas.includes(req.body.eta)) {
      return res.status(400).json({ message: 'Select a valid arrival time' });
    }
    if (req.body.message !== undefined && (typeof req.body.message !== 'string' || req.body.message.length > 500)) {
      return res.status(400).json({ message: 'Response message must be 500 characters or fewer' });
    }

    const request = await BloodRequest.findOne({
      _id: req.params.id,
      status: { $in: donorVisibleRequestStatuses },
      user: { $ne: req.user._id },
    });
    if (!request) return res.status(404).json({ message: 'Open request not found' });
    if (!compatibleDonors[request.bloodGroup]?.includes(donor.bloodGroup)) {
      return res.status(403).json({ message: 'Your blood group is not compatible with this request' });
    }

    let response;
    try {
      response = await DonorResponse.create({
        request: request._id,
        donor: donor._id,
        status: responseStatus,
        eta: responseStatus === 'Accepted' ? req.body.eta : undefined,
        message: req.body.message || '',
        respondedAt: new Date(),
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: 'You have already responded to this request' });
      throw error;
    }

    if (responseStatus === 'Accepted') {
      const updatedRequest = await BloodRequest.findOneAndUpdate(
        { _id: request._id, status: { $in: donorVisibleRequestStatuses } },
        { $set: { status: 'Donor Responded' } },
        { returnDocument: 'after', runValidators: true }
      );
      if (!updatedRequest) {
        await response.deleteOne();
        return res.status(409).json({ message: 'This request is no longer accepting responses' });
      }
    } else {
      const stillOpen = await BloodRequest.exists({
        _id: request._id,
        status: { $in: donorVisibleRequestStatuses },
      });
      if (!stillOpen) {
        await response.deleteOne();
        return res.status(409).json({ message: 'This request is no longer accepting responses' });
      }
    }

    const notificationWarning = request.user
      ? await notify([request.user], {
        type: responseStatus === 'Accepted' ? 'request_accepted' : 'request_updated',
        title: responseStatus === 'Accepted'
          ? `A donor responded to your ${request.bloodGroup} request`
          : `A donor declined your ${request.bloodGroup} request`,
        message: responseStatus === 'Accepted'
          ? `${donor.name} responded with an ETA of ${req.body.eta}. Sign in to view their response.`
          : `${donor.name} cannot help with your ${request.bloodGroup} request.`,
        relatedRequest: request._id,
      })
      : null;
    const result = response.toObject();
    delete result.donor;
    if (notificationWarning) result.notificationWarning = notificationWarning;
    res.status(201).json(result);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const connectResponse = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['Donor Responded', 'Connected'] },
    });
    if (!request) return res.status(404).json({ message: 'Request with an accepted donor response not found' });
    const response = await DonorResponse.findOne({
      _id: req.params.responseId,
      request: request._id,
      status: 'Accepted',
    }).populate('donor', 'user name');
    if (!response) return res.status(404).json({ message: 'Accepted donor response not found' });

    const connectedIds = new Set((request.connectedResponses || []).map(String));
    connectedIds.add(String(response._id));
    request.connectedResponses = [...connectedIds];
    request.status = 'Connected';
    await request.save();
    const notificationWarning = response.donor?.user
      ? await notify([response.donor.user], {
        type: 'request_updated',
        title: `You were connected to a ${request.bloodGroup} request`,
        message: `The requester connected with you for the request at ${request.hospital}. Coordinate directly using the contact details they shared.`,
        relatedRequest: request._id,
      })
      : null;
    const result = request.toObject();
    if (notificationWarning) result.notificationWarning = notificationWarning;
    res.json(result);
  } catch (error) {
    const status = error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const withdrawResponse = async (req, res) => {
  try {
    if (req.user.role !== 'donor') return res.status(403).json({ message: 'Only registered donors can withdraw responses' });
    const donor = await Donor.findOne({ user: req.user._id }).select('_id');
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    const response = await DonorResponse.findOne({
      request: req.params.id,
      donor: donor._id,
      status: 'Accepted',
    });
    if (!response) return res.status(404).json({ message: 'Active donor response not found' });
    const request = await BloodRequest.findById(req.params.id);
    if (!request || finalRequestStatuses.includes(request.status)) {
      return res.status(409).json({ message: 'Closed requests cannot receive response changes' });
    }
    if ((request.connectedResponses || []).some((id) => String(id) === String(response._id))) {
      return res.status(409).json({ message: 'Connected donor responses cannot be withdrawn' });
    }

    response.status = 'Withdrawn';
    await response.save();
    request.connectedResponses = (request.connectedResponses || []).filter((id) => String(id) !== String(response._id));
    const acceptedCount = await DonorResponse.countDocuments({ request: request._id, status: 'Accepted' });
    request.status = request.connectedResponses.length
      ? 'Connected'
      : acceptedCount ? 'Donor Responded' : 'Searching';
    await request.save();
    const warning = request.user ? await notify([request.user], {
      type: 'request_updated',
      title: 'A donor withdrew their response',
      message: `A donor can no longer respond to the ${request.bloodGroup} request at ${request.hospital}.`,
      relatedRequest: request._id,
    }) : null;
    res.json({ status: response.status, requestStatus: request.status, notificationWarning: warning || undefined });
  } catch (error) {
    const status = error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Connected', 'Fulfilled', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Select Connected, Fulfilled, or Cancelled' });
    }
    const request = await BloodRequest.findOne({ _id: req.params.id, user: req.user._id });
    if (!request) return res.status(404).json({ message: 'Request not found or not owned by you' });
    if (finalRequestStatuses.includes(request.status)) {
      return res.status(409).json({ message: 'Closed requests cannot be updated' });
    }
    if (status === 'Connected') {
      const acceptedCount = await DonorResponse.countDocuments({ request: request._id, status: 'Accepted' });
      if (acceptedCount === 0 && !request.respondedDonor) {
        return res.status(409).json({ message: 'Connect only after a donor has accepted the request' });
      }
      if (request.status !== 'Donor Responded' && request.status !== 'Connected') {
        return res.status(409).json({ message: 'This request is not ready to be connected' });
      }
      request.status = 'Connected';
    } else if (status === 'Fulfilled') {
      if (request.status !== 'Connected' && !(request.connectedResponses || []).length) {
        return res.status(409).json({ message: 'Connect with a donor before marking the request fulfilled' });
      }
      request.status = 'Fulfilled';
    } else {
      request.status = 'Cancelled';
    }
    await request.save();

    const responses = await DonorResponse.find({ request: request._id, status: 'Accepted' }).populate('donor', 'user');
    const recipients = [request.user, ...responses.map((response) => response.donor?.user)].filter(Boolean);
    const notificationWarning = await notify(recipients, {
      type: 'request_updated',
      title: `Blood request ${request.status.toLowerCase()}`,
      message: `The ${request.bloodGroup} request for ${request.hospital} was marked ${request.status.toLowerCase()}.`,
      relatedRequest: request._id,
    });
    const result = request.toObject();
    if (notificationWarning) result.notificationWarning = notificationWarning;
    res.json(result);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const reviewRequest = async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;
    if (!['Verified', 'Searching', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Select Verified, Searching, or Cancelled' });
    }
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Blood request not found' });
    if (finalRequestStatuses.includes(request.status)) {
      return res.status(409).json({ message: 'Closed requests cannot be reviewed' });
    }

    if (status === 'Verified') {
      if (request.status !== 'Pending') return res.status(409).json({ message: 'Only pending requests can be verified' });
      if (typeof verificationNotes !== 'string' || verificationNotes.trim().length < 10 || verificationNotes.length > 1000) {
        return res.status(400).json({ message: 'Record at least 10 characters of verification notes (1000 maximum)' });
      }
      request.status = 'Verified';
      request.verificationNotes = verificationNotes.trim();
      request.verifiedAt = new Date();
      request.verifiedBy = req.user._id;
    } else if (status === 'Searching') {
      if (request.status !== 'Verified') return res.status(409).json({ message: 'Verify the request before starting donor matching' });
      request.status = 'Searching';
    } else {
      request.status = 'Cancelled';
    }
    await request.save();

    let matchingDonors = 0;
    let notificationWarning = null;
    if (status === 'Searching') {
      const donorUserIds = await getMatchingDonorUserIds(request.bloodGroup);
      matchingDonors = donorUserIds.length;
      if (donorUserIds.length) {
        notificationWarning = await notify(donorUserIds, {
          type: 'request_created',
          title: `Blood request: ${request.bloodGroup} at ${request.hospital}`,
          message: `${request.unitsNeeded || 1} unit(s) requested in ${request.area}. Sign in to review and respond.`,
          relatedRequest: request._id,
        });
      }
    }
    await recordAdminAction({
      actor: req.user._id,
      action: `blood_request_${status.toLowerCase().replace(/\s+/g, '_')}`,
      targetType: 'blood_request',
      targetId: request._id,
      details: verificationNotes || '',
    });
    const result = request.toObject();
    if (status === 'Searching') result.matchingDonors = matchingDonors;
    if (notificationWarning) result.notificationWarning = notificationWarning;
    res.json(result);
  } catch (error) {
    const status = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const getRequestStats = async (req, res) => {
  try {
    await expireRequests();
    const [pending, verified, searching, donorResponded, connected, fulfilled, total] = await Promise.all([
      BloodRequest.countDocuments({ status: 'Pending' }),
      BloodRequest.countDocuments({ status: 'Verified' }),
      BloodRequest.countDocuments({ status: 'Searching' }),
      BloodRequest.countDocuments({ status: 'Donor Responded' }),
      BloodRequest.countDocuments({ status: 'Connected' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      BloodRequest.countDocuments(),
    ]);
    res.json({ pending, verified, searching, donorResponded, connected, fulfilled, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getMyResponses,
  getOpenRequests,
  respondToRequest,
  connectResponse,
  withdrawResponse,
  updateRequest,
  reviewRequest,
  getRequestStats,
};
