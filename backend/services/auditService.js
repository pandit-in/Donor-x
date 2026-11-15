const AdminAuditLog = require('../models/AdminAuditLog');

const recordAdminAction = async ({ actor, action, targetType, targetId, details = '' }) => {
  try {
    await AdminAuditLog.create({ actor, action, targetType, targetId: String(targetId), details });
  } catch (error) {
    console.error(`Administrator audit entry could not be saved: ${error.message}`);
  }
};

module.exports = { recordAdminAction };
