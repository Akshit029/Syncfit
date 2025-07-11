const express = require('express');
const Activity = require('../models/Activity');
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

// Log activity (workouts/calories) for a date
router.post('/', auth, async (req, res) => {
  const { date, workouts, calories } = req.body;
  if (!date) return res.status(400).json({ message: 'Date required' });
  let record = await Activity.findOne({ user: req.user.id, date: new Date(date) });
  if (record) {
    record.workouts = (record.workouts || 0) + (workouts || 0);
    record.calories = (record.calories || 0) + (calories || 0);
    await record.save();
  } else {
    record = await Activity.create({ user: req.user.id, date: new Date(date), workouts, calories });
  }
  res.json(record);
});

// Get weekly summary for dashboard
router.get('/summary', auth, async (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  weekAgo.setHours(0,0,0,0);
  const activities = await Activity.find({
    user: req.user.id,
    date: { $gte: weekAgo, $lte: now }
  }).sort({ date: 1 });
  res.json(activities);
});

// Get all activity history for the user
router.get('/history', auth, async (req, res) => {
  const activities = await Activity.find({ user: req.user.id }).sort({ date: 1 });
  res.json(activities);
});

// Delete all activity history for the user
router.delete('/history', auth, async (req, res) => {
  await Activity.deleteMany({ user: req.user.id });
  res.json({ message: 'All activity history deleted.' });
});

module.exports = router; 