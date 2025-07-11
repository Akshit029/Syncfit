const express = require('express');
const Nutrition = require('../models/Nutrition');
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

// Log or update nutrition for a date
router.post('/', auth, async (req, res) => {
  const { date, calories, protein, carbs, fats, meals } = req.body;
  if (!date) return res.status(400).json({ message: 'Date required' });
  let record = await Nutrition.findOne({ user: req.user.id, date: new Date(date) });
  if (record) {
    record.calories = calories;
    record.protein = protein;
    record.carbs = carbs;
    record.fats = fats;
    record.meals = meals;
    await record.save();
  } else {
    record = await Nutrition.create({ user: req.user.id, date: new Date(date), calories, protein, carbs, fats, meals });
  }
  res.json(record);
});

// Get nutrition history (last 30 days)
router.get('/history', auth, async (req, res) => {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const history = await Nutrition.find({
    user: req.user.id,
    date: { $gte: monthAgo }
  }).sort({ date: 1 });
  res.json(history);
});

module.exports = router; 