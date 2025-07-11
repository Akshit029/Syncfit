const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  notifications: { type: Boolean, default: true },
  language: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema); 