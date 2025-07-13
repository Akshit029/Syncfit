const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'SyncFit - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">SyncFit Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #1F2937; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; background: #F3F4F6; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Multer setup for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Ensure uploads/profiles directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log('auth.js routes loaded');

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    let tempUser;
    
    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user with new OTP
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      tempUser = existingUser;
    } else {
      // Create new temporary user
      tempUser = await User.create({
        name: 'temp',
        email,
        password: 'temp',
        otp,
        otpExpiry,
        isEmailVerified: false
      });
    }
    
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      if (!existingUser) {
        await User.findByIdAndDelete(tempUser._id);
      }
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    
    res.json({ message: 'OTP sent successfully', tempUserId: tempUser._id });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for login
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send login OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register with OTP verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp, tempUserId } = req.body;
    if (!name || !email || !password || !otp || !tempUserId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find temporary user or existing unverified user
    const tempUser = await User.findById(tempUserId);
    if (!tempUser || tempUser.email !== email) {
      return res.status(400).json({ message: 'Invalid OTP request' });
    }
    
    // Verify OTP
    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (tempUser.otpExpiry < new Date()) {
      if (!tempUser.isEmailVerified) {
        await User.findByIdAndDelete(tempUserId);
      }
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    let user;
    
    if (tempUser.isEmailVerified) {
      // This shouldn't happen, but handle it gracefully
      return res.status(400).json({ message: 'User already verified' });
    } else {
      // Update the existing unverified user or create new user
      if (tempUser.name === 'temp' && tempUser.password === 'temp') {
        // Check if any user with this email already exists
        const existingUsers = await User.find({ email });
        const existingVerified = existingUsers.find(u => u.isEmailVerified);
        if (existingVerified) {
          // Clean up all unverified users with this email
          await User.deleteMany({ email, isEmailVerified: false });
          return res.status(400).json({ message: 'Email already registered' });
        }
        // If there are other unverified users, clean them up except the current tempUser
        await User.deleteMany({ email, isEmailVerified: false, _id: { $ne: tempUserId } });
        // Update the temp user with real data and mark as verified
        const hash = await bcrypt.hash(password, 10);
        tempUser.name = name;
        tempUser.password = hash;
        tempUser.isEmailVerified = true;
        tempUser.otp = undefined;
        tempUser.otpExpiry = undefined;
        await tempUser.save();
        user = tempUser;
      } else {
        // This was an existing unverified user, update it
        const hash = await bcrypt.hash(password, 10);
        tempUser.name = name;
        tempUser.password = hash;
        tempUser.isEmailVerified = true;
        tempUser.otp = undefined;
        tempUser.otpExpiry = undefined;
        await tempUser.save();
        user = tempUser;
      }
    }
    
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with OTP verification
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) return res.status(400).json({ message: 'Email, password, and OTP are required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    
    // OTP is now required for login
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to protect routes
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Profile (protected)
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update profile info (name, email)
router.patch('/profile', auth, async (req, res) => {
  try {
    console.log('[PATCH /api/auth/profile] user:', req.user.id, 'body:', req.body);
    const { name, email } = req.body;
    if (!name && !email) return res.status(400).json({ message: 'Name or email required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) {
      // Check for duplicate email
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    await user.save();
    console.log('Updated user profile:', user);
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Error in PATCH /api/auth/profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password
router.patch('/password', auth, async (req, res) => {
  try {
    console.log('[PATCH /api/auth/password] user:', req.user.id, 'body:', req.body);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    console.log('Password updated for user:', user._id);
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Error in PATCH /api/auth/password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/profile-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();
    res.json({ profileImage: user.profileImage });
  } catch (err) {
    console.error('Error uploading profile image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove profile image
router.delete('/profile-image', auth, async (req, res) => {
  console.log('DELETE /api/auth/profile-image called');
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.profileImage) {
      // Remove file from disk
      const path = require('path');
      const fs = require('fs');
      const imgPath = path.join(__dirname, '../', user.profileImage);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
      user.profileImage = '';
      await user.save();
    }
    res.json({ message: 'Profile image removed' });
  } catch (err) {
    console.error('Error removing profile image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user profile (account)
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Optionally: Remove related data (BMI, Calories, etc.)
    await user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 