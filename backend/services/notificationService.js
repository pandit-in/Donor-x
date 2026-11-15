const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
};

const notifyUsers = async (userIds, { type, title, message, relatedRequest }) => {
  const recipients = [...new Set(userIds.filter(Boolean).map(String))];
  if (!recipients.length) return;

  await Notification.insertMany(recipients.map((user) => ({
    user,
    type,
    title,
    message,
    relatedRequest,
  })));

  const mailer = getTransporter();
  if (!mailer) return;
  const users = await User.find({
    _id: { $in: recipients },
    isActive: { $ne: false },
    emailNotifications: true,
  }).select('email');
  const results = await Promise.allSettled(users.map((user) => mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: title,
    text: message,
  })));
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(`Email notification delivery failed (${result.reason.code || 'SMTP error'}).`);
    }
  });
};

module.exports = { notifyUsers };
