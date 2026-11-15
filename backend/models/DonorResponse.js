const mongoose = require('mongoose');

const donorResponseSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn'],
      default: 'Pending',
    },
    eta: {
      type: String,
      enum: ['10-15 mins', '20-30 mins', '45 mins', '1 hour'],
    },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

donorResponseSchema.index({ request: 1, donor: 1 }, { unique: true });
donorResponseSchema.index({ donor: 1, createdAt: -1 });

module.exports = mongoose.model('DonorResponse', donorResponseSchema);
