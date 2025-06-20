const mongoose = require('mongoose');

const staffActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  messages: { type: Number, default: 0 },
  voiceTime: { type: Number, default: 0 }, // in minutes
  invites: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Update lastUpdated timestamp before saving
staffActivitySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.models.StaffActivity || mongoose.model('StaffActivity', staffActivitySchema); 