const express = require('express');
const Steps = require('../models/Steps');
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

// Save or update today's steps
router.post('/', auth, async (req, res) => {
  const { steps } = req.body;
  if (typeof steps !== 'number') return res.status(400).json({ message: 'Steps required' });
  const today = new Date();
  today.setHours(0,0,0,0);
  let record = await Steps.findOne({ user: req.user.id, date: { $gte: today } });
  if (record) {
    record.steps = steps;
    await record.save();
  } else {
    record = await Steps.create({ user: req.user.id, steps, date: today });
  }
  res.json(record);
});

// Get today's steps
router.get('/today', auth, async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const record = await Steps.findOne({ user: req.user.id, date: { $gte: today } });
  res.json(record || { steps: 0 });
});

module.exports = router; 