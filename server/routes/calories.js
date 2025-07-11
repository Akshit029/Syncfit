const express = require('express');
const Calories = require('../models/Calories');
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

// Save calories calculation
router.post('/', auth, async (req, res) => {
  try {
    const { bmr, maintenance, weightLoss, weightGain, age, gender, height, weight, activity, unit } = req.body;
    if ([bmr, maintenance, weightLoss, weightGain, age, gender, height, weight, activity, unit].some(v => v === undefined || v === null || v === '')) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const calories = await Calories.create({
      user: req.user.id,
      bmr,
      maintenance,
      weightLoss,
      weightGain,
      age,
      gender,
      height,
      weight,
      activity,
      unit
    });
    res.status(201).json(calories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get calories calculation history for user
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Calories.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 