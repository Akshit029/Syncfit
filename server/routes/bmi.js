const express = require('express');
const BMI = require('../models/BMI');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

// Save BMI calculation
router.post('/', auth, async (req, res) => {
  try {
    const { value, height, weight, unit } = req.body;
    if (!value || !height || !weight || !unit) return res.status(400).json({ message: 'All fields required' });
    const bmi = await BMI.create({ user: req.user.id, value, height, weight, unit });
    res.status(201).json(bmi);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get BMI history for user
router.get('/history', auth, async (req, res) => {
  try {
    const history = await BMI.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 