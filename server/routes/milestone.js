const express = require('express');
const Milestone = require('../models/Milestone');
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

// Add milestone
router.post('/', auth, async (req, res) => {
  const { description, date } = req.body;
  if (!description || !date) return res.status(400).json({ message: 'Description and date required' });
  const milestone = await Milestone.create({ user: req.user.id, description, date: new Date(date) });
  res.status(201).json(milestone);
});

// Get all milestones
router.get('/', auth, async (req, res) => {
  const milestones = await Milestone.find({ user: req.user.id }).sort({ date: -1 });
  res.json(milestones);
});

// Delete milestone by ID
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const milestone = await Milestone.findOneAndDelete({ _id: id, user: req.user.id });
  if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
  res.json({ message: 'Milestone deleted' });
});

// Delete all milestones for the user
router.delete('/', auth, async (req, res) => {
  await Milestone.deleteMany({ user: req.user.id });
  res.json({ message: 'All milestones deleted.' });
});

module.exports = router; 