const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc  Register user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = ['donor', 'seeker'].includes(req.body.role) ? req.body.role : 'seeker';
    const userExists = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailNotifications: user.emailNotifications === true,
      token: generateToken(user._id),
    });
  } catch (error) {
    const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (user && user.isActive !== false && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailNotifications: user.emailNotifications === true,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

const updateNotificationPreferences = async (req, res) => {
  if (typeof req.body.emailNotifications !== 'boolean') {
    return res.status(400).json({ message: 'emailNotifications must be true or false' });
  }
  req.user.emailNotifications = req.body.emailNotifications;
  await req.user.save();
  res.json({ emailNotifications: req.user.emailNotifications });
};

module.exports = { registerUser, loginUser, getMe, updateNotificationPreferences };
