const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');

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

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
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