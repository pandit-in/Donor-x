const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    hours: { type: String, required: true, trim: true, maxlength: 100 },
    licenseNumber: { type: String, trim: true, maxlength: 80, default: '' },
    isGovernment: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    verifiedAt: { type: Date },
    verificationNotes: { type: String, maxlength: 1000, default: '' },
    inventory: {
      type: Map,
      of: { type: String, enum: ['Available', 'Low Stock', 'Critical', 'Unavailable'] },
      default: {},
    },
    inventoryUpdatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bloodBankSchema.index({ verificationStatus: 1, name: 1 });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
