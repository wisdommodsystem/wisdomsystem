const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  reports: [
    {
      reporterId: String,
      reporterTag: String,
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  totalReports: { type: Number, default: 0 },
  lastReported: { type: Date, default: Date.now }
});

reportSchema.pre('save', function(next) {
  this.totalReports = this.reports.length;
  if (this.reports.length > 0) {
    this.lastReported = this.reports[this.reports.length - 1].timestamp;
  }
  next();
});

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema); 