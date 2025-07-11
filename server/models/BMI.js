const mongoose = require('mongoose');

const bmiSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  unit: { type: String, enum: ['metric', 'imperial'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('BMI', bmiSchema); 