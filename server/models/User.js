const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 