const mongoose = require('mongoose');

const caloriesSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bmr: { type: Number, required: true },
  maintenance: { type: Number, required: true },
  weightLoss: { type: Number, required: true },
  weightGain: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  activity: { type: String, required: true },
  unit: { type: String, enum: ['metric', 'imperial'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Calories', caloriesSchema); 