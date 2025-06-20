const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  warnings: [
    {
      reason: String,
      warnerId: String,
      warnerTag: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  totalWarnings: { type: Number, default: 0 },
  lastWarned: { type: Date, default: Date.now }
});

warningSchema.pre('save', function(next) {
  this.totalWarnings = this.warnings.length;
  if (this.warnings.length > 0) {
    this.lastWarned = this.warnings[this.warnings.length - 1].timestamp;
  }
  next();
});

module.exports = mongoose.models.Warning || mongoose.model('Warning', warningSchema); 