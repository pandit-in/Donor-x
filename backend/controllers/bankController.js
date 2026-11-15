const BloodBank = require('../models/BloodBank');
const { recordAdminAction } = require('../services/auditService');

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const inventoryStatuses = ['Available', 'Low Stock', 'Critical', 'Unavailable'];

const isValidSourceUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
};

const getBanks = async (req, res) => {
  try {
    const banks = await BloodBank.find({ verificationStatus: 'Verified' }).sort({ name: 1 });
    const now = Date.now();
    res.json(banks.map((bank) => {
      const result = bank.toObject();
      result.inventory = result.inventory instanceof Map
        ? Object.fromEntries(result.inventory)
        : result.inventory || {};
      delete result.verificationNotes;
      delete result.updatedBy;
      const inventoryIsCurrent = result.inventoryUpdatedAt
        && now - new Date(result.inventoryUpdatedAt).getTime() < 24 * 60 * 60 * 1000;
      if (!inventoryIsCurrent || result.facilityType === 'Hospital') result.inventory = {};
      result.inventoryIsCurrent = Boolean(inventoryIsCurrent && result.facilityType !== 'Hospital');
      return result;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminBanks = async (req, res) => {
  try {
    const banks = await BloodBank.find().sort({ createdAt: -1 });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBank = async (req, res) => {
  try {
    const { name, address, phone, hours, facilityType, sourceUrl, licenseNumber, isGovernment } = req.body;
    if (sourceUrl && !isValidSourceUrl(sourceUrl)) {
      return res.status(400).json({ message: 'Source URL must be a valid HTTP or HTTPS address' });
    }
    const bank = await BloodBank.create({
      name, address, phone, hours, facilityType, sourceUrl, licenseNumber, isGovernment,
      updatedBy: req.user._id,
    });
    await recordAdminAction({
      actor: req.user._id,
      action: 'blood_bank_created',
      targetType: 'blood_bank',
      targetId: bank._id,
    });
    res.status(201).json(bank);
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};

const suggestBank = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Centre suggestion must be an object' });
    }
    const { name, address, phone, hours, sourceUrl, facilityType, locationConfirmed } = req.body;
    if (locationConfirmed !== true) {
      return res.status(400).json({ message: 'Confirm that the centre is in Chhatrapati Sambhajinagar district' });
    }
    if (!['Blood centre', 'Hospital'].includes(facilityType)) {
      return res.status(400).json({ message: 'Select whether this facility is a hospital or blood centre' });
    }
    if (!isValidSourceUrl(sourceUrl)) {
      return res.status(400).json({ message: 'Provide a valid public HTTP or HTTPS source URL' });
    }
    const bank = await BloodBank.create({
      name, address, phone, hours, facilityType, sourceUrl,
      verificationStatus: 'Pending',
    });
    res.status(201).json({
      message: 'Facility suggestion received. It will remain private until an administrator verifies it.',
      id: bank._id,
    });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};

const updateBank = async (req, res) => {
  try {
    const updates = {};
    for (const field of ['name', 'address', 'phone', 'hours', 'sourceUrl', 'licenseNumber', 'isGovernment']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.sourceUrl && !isValidSourceUrl(updates.sourceUrl)) {
      return res.status(400).json({ message: 'Source URL must be a valid HTTP or HTTPS address' });
    }

    if (req.body.inventory !== undefined) {
      const inventory = req.body.inventory;
      if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
        return res.status(400).json({ message: 'Inventory must be an object of blood group statuses' });
      }
      const invalid = Object.entries(inventory).some(([group, status]) =>
        !bloodGroups.includes(group) || !inventoryStatuses.includes(status));
      if (invalid) return res.status(400).json({ message: 'Inventory contains an invalid group or status' });
      updates.inventory = inventory;
      updates.inventoryUpdatedAt = new Date();
    }
    if (req.body.verificationStatus !== undefined) {
      if (!['Pending', 'Verified', 'Rejected'].includes(req.body.verificationStatus)) {
        return res.status(400).json({ message: 'Invalid verification status' });
      }
      updates.verificationStatus = req.body.verificationStatus;
      updates.verifiedAt = req.body.verificationStatus === 'Verified' ? new Date() : null;
    }
    if (req.body.verificationNotes !== undefined) {
      if (typeof req.body.verificationNotes !== 'string' || req.body.verificationNotes.length > 1000) {
        return res.status(400).json({ message: 'Verification notes must be 1000 characters or fewer' });
      }
      updates.verificationNotes = req.body.verificationNotes.trim();
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No valid blood-bank updates provided' });
    }
    updates.updatedBy = req.user._id;

    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: 'Blood bank not found' });
    if (bank.facilityType === 'Hospital' && req.body.inventory !== undefined) {
      return res.status(400).json({ message: 'Blood inventory can only be recorded for blood centres' });
    }
    if (updates.verificationStatus === 'Verified') {
      const notes = updates.verificationNotes || bank.verificationNotes;
      if (bank.facilityType === 'Hospital') {
        const sourceUrl = updates.sourceUrl || bank.sourceUrl;
        if (!sourceUrl || !isValidSourceUrl(sourceUrl) || !notes || notes.trim().length < 10) {
          return res.status(400).json({ message: 'Record a public source URL and at least 10 characters describing verification before publishing this hospital' });
        }
      } else {
        const licenseNumber = updates.licenseNumber || bank.licenseNumber;
        if (!licenseNumber || !notes || notes.trim().length < 10) {
          return res.status(400).json({ message: 'Record a license number and at least 10 characters describing verification before publishing this listing' });
        }
      }
    }
    bank.set(updates);
    await bank.save();
    await recordAdminAction({
      actor: req.user._id,
      action: updates.verificationStatus
        ? `blood_bank_${updates.verificationStatus.toLowerCase()}`
        : updates.inventory ? 'blood_bank_inventory_updated' : 'blood_bank_updated',
      targetType: 'blood_bank',
      targetId: bank._id,
      details: updates.verificationNotes || '',
    });
    res.json(bank);
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
};

module.exports = { getBanks, getAdminBanks, createBank, suggestBank, updateBank };
