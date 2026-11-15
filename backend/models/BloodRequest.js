const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterName: { type: String, required: true },
    requesterPhone: { type: String, required: true },
    requesterEmail: { type: String },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    unitsNeeded: { type: Number, default: 1 },
    urgency: {
      type: String,
      enum: ['Normal', 'Urgent', 'Critical'],
      default: 'Normal',
    },
    hospital: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String },
    shareContactWithDonor: { type: Boolean, default: false },
    attendant: { type: String },
    patientName: { type: String },
    reason: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
    respondedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
    },
    respondedAt: { type: Date },
    responseEta: {
      type: String,
      enum: ['10-15 mins', '20-30 mins', '45 mins', '1 hour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    neededBy: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
