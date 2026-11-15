const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, maxlength: 100 },
    targetType: { type: String, required: true, maxlength: 50 },
    targetId: { type: String, required: true, maxlength: 100 },
    details: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
