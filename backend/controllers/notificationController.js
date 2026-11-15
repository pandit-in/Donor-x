const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(notifications);
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, readAt: null },
    { $set: { readAt: new Date() } },
    { returnDocument: 'after', runValidators: true }
  );
  if (!notification) return res.status(404).json({ message: 'Unread notification not found' });
  res.json(notification);
};

const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ message: 'Notifications marked as read' });
};

module.exports = { getMyNotifications, markNotificationRead, markAllNotificationsRead };
