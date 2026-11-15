const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    area: { type: String, required: true, trim: true, maxlength: 100 },
    willingness: { type: String, required: true, enum: ['anytime', 'daytime', 'weekends'] },
    delayExperience: { type: String, required: true, enum: ['severe', 'moderate', 'none'] },
    consentToContact: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

surveyResponseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
