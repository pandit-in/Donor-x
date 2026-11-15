const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['donor', 'request'], required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
    reason: {
      type: String,
      enum: ['incorrect_contact', 'misleading_profile', 'inappropriate_content', 'safety_concern', 'other'],
      required: true,
    },
    details: { type: String, maxlength: 1000, default: '' },
    status: { type: String, enum: ['Open', 'Resolved', 'Dismissed'], default: 'Open' },
    resolution: { type: String, maxlength: 1000, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
