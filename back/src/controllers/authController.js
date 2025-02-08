const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role
  });

  // Create token
  const token = user.getSignedJwtToken();

  logger.info(`New user registered: ${user._id}`);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '2m' }
  );
  
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Store refresh token
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  logger.info(`User logged in: ${user._id}`);

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

// Add refresh token endpoint
exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  // Generate new access token
  const accessToken = jwt.sign(
    { userId: storedToken.user },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ success: true, accessToken });
});

// Update logout function
exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
    res.clearCookie('refreshToken');
  }
  
  res.status(200).json({ success: true });
});

exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Use the same secret as when signing the token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('patient', '-user');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        patient: user.patient
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

