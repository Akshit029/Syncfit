const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  mealType: String
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  meals: [mealSchema]
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema); 