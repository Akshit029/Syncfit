const express = require('express');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Auth middleware (reuse from auth.js)
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

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    console.log('[GET /api/settings/] user:', req.user.id);
    let settings = await Settings.findOne({ user: req.user.id });
    if (!settings) {
      // Return defaults if not set
      settings = { theme: 'light', notifications: true, language: 'en' };
      console.log('No settings found, returning defaults');
    } else {
      console.log('Found settings:', settings);
    }
    res.json(settings);
  } catch (err) {
    console.error('Error in GET /api/settings/:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update user settings
router.post('/', auth, async (req, res) => {
  try {
    console.log('[POST /api/settings/] user:', req.user.id, 'body:', req.body);
    const { theme, notifications, language } = req.body;
    let settings = await Settings.findOne({ user: req.user.id });
    if (settings) {
      if (theme) settings.theme = theme;
      if (typeof notifications === 'boolean') settings.notifications = notifications;
      if (language) settings.language = language;
      await settings.save();
      console.log('Updated settings:', settings);
    } else {
      settings = await Settings.create({
        user: req.user.id,
        theme: theme || 'light',
        notifications: typeof notifications === 'boolean' ? notifications : true,
        language: language || 'en'
      });
      console.log('Created new settings:', settings);
    }
    res.json(settings);
  } catch (err) {
    console.error('Error in POST /api/settings/:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 