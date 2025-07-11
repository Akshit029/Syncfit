const express = require('express');
const Weight = require('../models/Weight');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

// Log weight for a date
router.post('/', auth, async (req, res) => {
  const { date, weight } = req.body;
  if (!date || typeof weight !== 'number') return res.status(400).json({ message: 'Date and weight required' });
  let record = await Weight.findOne({ user: req.user.id, date: new Date(date) });
  if (record) {
    record.weight = weight;
    await record.save();
  } else {
    record = await Weight.create({ user: req.user.id, date: new Date(date), weight });
  }
  res.json(record);
});

// Get weight history (last 30 days)
router.get('/history', auth, async (req, res) => {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const history = await Weight.find({
    user: req.user.id,
    date: { $gte: monthAgo }
  }).sort({ date: 1 });
  res.json(history);
});

// Delete all weight history for the user
router.delete('/history', auth, async (req, res) => {
  await Weight.deleteMany({ user: req.user.id });
  res.json({ message: 'All weight history deleted.' });
});

module.exports = router; 