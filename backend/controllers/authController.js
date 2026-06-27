const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../config/mailer');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretcivickey12345', {
    expiresIn: '30d'
  });
};

// Helper to generate temporary reset token
const generateResetToken = (id) => {
  return jwt.sign({ id, purpose: 'password_reset' }, process.env.JWT_SECRET || 'supersecretcivickey12345', {
    expiresIn: '15m' // expires in 15 minutes
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, address, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Determine role. If registering, defaults to citizen. Only allow admin role if set explicitly and if it's the first registration or done specifically (for simplicity we allow registering admin if specified, to make setting up the system easy for testing!).
    const userRole = role === 'admin' ? 'admin' : 'citizen';

    const user = await User.create({
      name,
      email,
      phone,
      password,
      address,
      role: userRole
    });

    if (user) {
      // Send registration email notification
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to CivicConnect!',
          text: `Hello ${user.name},\n\nWelcome to CivicConnect! Your account has been registered successfully. You can now log in and report civic issues in your neighborhood.\n\nBest regards,\nCivicConnect Team`,
          html: `<p>Hello <strong>${user.name}</strong>,</p><p>Welcome to CivicConnect! Your account has been registered successfully. You can now log in and report civic issues in your neighborhood.</p><br><p>Best regards,<br>CivicConnect Team</p>`
        });
      } catch (err) {
        console.error('Failed to send registration email:', err.message);
      }

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = generateResetToken(user._id);

    // Create reset url (this will point to the frontend reset password page)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const textContent = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} \n\n This link is valid for 15 minutes. If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - CivicConnect',
        text: textContent,
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p><p>Please click the link below to reset your password. This link is valid for 15 minutes:</p><a href="${resetUrl}" target="_blank">${resetUrl}</a><br><br><p>If you did not request this, please ignore this email.</p>`
      });

      res.status(200).json({ success: true, message: 'Reset password link sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcivickey12345');
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
