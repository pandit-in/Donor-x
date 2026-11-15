const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    age: { type: Number, required: true, min: 18, max: 65 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true },
    email: { type: String },
    area: { type: String, required: true },
    ward: { type: String },
    address: { type: String },
    city: { type: String, default: 'Chhatrapati Sambhaji Nagar' },
    lastDonation: { type: Date },
    totalDonations: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    availabilityStatus: { type: String, enum: ['Available', 'On Call', 'Resting'], default: 'Available' },
    verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    verifiedAt: { type: Date },
    verificationNotes: { type: String, maxlength: 1000, default: '' },
    lastConfirmedAvailableAt: { type: Date },
    shareContact: { type: Boolean, default: false },
    profilePhoto: { type: String, default: '' },
    medicalConditions: { type: String, default: 'None' },
    weight: { type: Number },
    bio: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donor', donorSchema);
