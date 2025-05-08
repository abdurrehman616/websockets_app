const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  country: { type: String },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
