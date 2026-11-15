const Donor = require('../models/Donor');
const User = require('../models/User');
const donorFields = [
  'name', 'bloodGroup', 'age', 'gender', 'phone', 'email', 'area', 'ward',
  'address', 'lastDonation', 'totalDonations', 'weight', 'medicalConditions', 'isAvailable',
  'availabilityStatus', 'bio', 'shareContact',
];

const pickDonorFields = (source) =>
  Object.fromEntries(donorFields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc   Create/Register donor profile
// @route  POST /api/donors
const createDonor = async (req, res) => {
  try {
    const existing = await Donor.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Donor profile already exists' });
    }
    const donorData = {
      ...pickDonorFields(req.body),
      email: req.body.email || req.user.email,
      availabilityStatus: req.body.availabilityStatus || (
        req.body.isAvailable === false || req.body.isAvailable === 'false' ? 'Resting' : 'Available'
      ),
      user: req.user._id,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
      lastConfirmedAvailableAt: new Date(),
    };
    const donor = await Donor.create(donorData);
    try {
      await User.findByIdAndUpdate(req.user._id, {
        name: donor.name,
        email: donor.email,
        role: 'donor',
      }, { runValidators: true });
    } catch (error) {
      await donor.deleteOne();
      throw error;
    }
    res.status(201).json(donor);
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc   Get all donors (with optional filters)
// @route  GET /api/donors
const getDonors = async (req, res) => {
  try {
    const { bloodGroup, area, isAvailable } = req.query;
    if (Object.keys(req.query).some((key) => !['bloodGroup', 'area', 'isAvailable'].includes(key))) {
      return res.status(400).json({ message: 'Unsupported donor search filter' });
    }
    const filter = {};
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    if (bloodGroup !== undefined) {
      if (typeof bloodGroup !== 'string' || !bloodGroups.includes(bloodGroup)) {
        return res.status(400).json({ message: 'Invalid blood group filter' });
      }
      filter.bloodGroup = bloodGroup;
    }
    if (area !== undefined) {
      if (typeof area !== 'string' || area.length > 100) {
        return res.status(400).json({ message: 'Area filter must be a string of 100 characters or fewer' });
      }
      filter.area = { $regex: escapeRegex(area), $options: 'i' };
    }
    if (isAvailable !== undefined) {
      if (isAvailable !== 'true' && isAvailable !== 'false') {
        return res.status(400).json({ message: 'Availability filter must be true or false' });
      }
      filter.isAvailable = isAvailable === 'true';
    }
    filter.verificationStatus = { $ne: 'Rejected' };

    const donors = await Donor.find(filter)
      .select('user name bloodGroup age gender phone email area city lastDonation totalDonations isAvailable availabilityStatus profilePhoto bio verificationStatus verifiedAt lastConfirmedAvailableAt shareContact')
      .populate('user', 'isActive')
      .sort({ createdAt: -1 });
    res.json(donors.filter((donor) => donor.user?.isActive !== false).map((donor) => {
      const result = donor.toObject();
      delete result.user;
      result.availabilityIsStale = !result.lastConfirmedAvailableAt
        || Date.now() - new Date(result.lastConfirmedAvailableAt).getTime() > 30 * 24 * 60 * 60 * 1000;
      if (!result.shareContact) {
        delete result.phone;
        delete result.email;
      }
      return result;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get donor by ID
// @route  GET /api/donors/:id
const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findOne({ _id: req.params.id, verificationStatus: { $ne: 'Rejected' } })
      .select('user name bloodGroup age gender phone email area city lastDonation totalDonations isAvailable availabilityStatus profilePhoto bio verificationStatus verifiedAt lastConfirmedAvailableAt shareContact')
      .populate('user', 'isActive');
    if (!donor || donor.user?.isActive === false) return res.status(404).json({ message: 'Donor not found' });
    const result = donor.toObject();
    delete result.user;
    result.availabilityIsStale = !result.lastConfirmedAvailableAt
      || Date.now() - new Date(result.lastConfirmedAvailableAt).getTime() > 30 * 24 * 60 * 60 * 1000;
    if (!result.shareContact) {
      delete result.phone;
      delete result.email;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get my donor profile
// @route  GET /api/donors/me
const getMyDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'No donor profile found' });
    const result = donor.toObject();
    result.availabilityIsStale = !result.lastConfirmedAvailableAt
      || Date.now() - new Date(result.lastConfirmedAvailableAt).getTime() > 30 * 24 * 60 * 60 * 1000;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update donor profile
// @route  PUT /api/donors/me
const updateDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    const updateData = pickDonorFields(req.body);
    updateData.lastConfirmedAvailableAt = new Date();
    const sensitiveProfileFields = ['name', 'bloodGroup', 'age', 'phone', 'email'];
    if (sensitiveProfileFields.some((field) => updateData[field] !== undefined && updateData[field] !== donor[field])) {
      updateData.verificationStatus = 'Pending';
      updateData.verifiedAt = null;
      updateData.verificationNotes = '';
    }
    if (req.file) updateData.profilePhoto = `/uploads/${req.file.filename}`;

    const updated = await Donor.findByIdAndUpdate(donor._id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    await User.findByIdAndUpdate(req.user._id, {
      name: updated.name,
      email: updated.email || req.user.email,
    }, { runValidators: true });
    res.json(updated);
  } catch (error) {
    const status = error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc   Toggle availability
// @route  PATCH /api/donors/me/availability
const toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    const { availabilityStatus, isAvailable } = req.body;
    if (availabilityStatus !== undefined) {
      if (!['Available', 'On Call', 'Resting'].includes(availabilityStatus)) {
        return res.status(400).json({ message: 'Invalid availability status' });
      }
      donor.availabilityStatus = availabilityStatus;
      donor.isAvailable = availabilityStatus !== 'Resting';
    } else if (typeof isAvailable === 'boolean') {
      donor.isAvailable = isAvailable;
      donor.availabilityStatus = isAvailable ? 'Available' : 'Resting';
    } else {
      donor.isAvailable = !donor.isAvailable;
      donor.availabilityStatus = donor.isAvailable ? 'Available' : 'Resting';
    }
    donor.lastConfirmedAvailableAt = new Date();
    await donor.save();
    res.json({ isAvailable: donor.isAvailable, availabilityStatus: donor.availabilityStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get donor stats
// @route  GET /api/donors/stats
const getDonorStats = async (req, res) => {
  try {
    const total = await Donor.countDocuments();
    const available = await Donor.countDocuments({ isAvailable: true });
    const byBloodGroup = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ total, available, byBloodGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonor,
  getDonors,
  getDonorById,
  getMyDonorProfile,
  updateDonorProfile,
  toggleAvailability,
  getDonorStats,
};
