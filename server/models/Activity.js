const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  workouts: { type: Number, default: 0 },
  calories: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema); 