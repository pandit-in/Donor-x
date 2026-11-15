const SurveyResponse = require('../models/SurveyResponse');

const createSurveyResponse = async (req, res) => {
  try {
    const {
      name,
      phone,
      bloodGroup,
      area,
      willingness,
      delayExperience,
      consentToContact,
    } = req.body;
    if (phone && consentToContact !== true) {
      return res.status(400).json({ message: 'Consent is required before sharing a phone number for follow-up' });
    }
    const response = await SurveyResponse.create({
      name: consentToContact === true ? name : '',
      phone: consentToContact === true ? phone : '',
      bloodGroup,
      area,
      willingness,
      delayExperience,
      consentToContact: consentToContact === true,
      user: req.user?._id,
    });
    res.status(201).json({ message: 'Survey response saved. Thank you for contributing.' });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
};

const getSurveyResponses = async (req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ createdAt: -1 }).limit(500);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSurveyStats = async (req, res) => {
  try {
    const [total, severeDelays, willingAnytime] = await Promise.all([
      SurveyResponse.countDocuments(),
      SurveyResponse.countDocuments({ delayExperience: 'severe' }),
      SurveyResponse.countDocuments({ willingness: 'anytime' }),
    ]);
    res.json({
      total,
      severeDelays,
      willingAnytime,
      severeDelayPercent: total ? Math.round((severeDelays / total) * 100) : 0,
      willingAnytimePercent: total ? Math.round((willingAnytime / total) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSurveyResponse, getSurveyResponses, getSurveyStats };
