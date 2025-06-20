const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: String,
      required: true
    },
    addedByTag: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['warning', 'info', 'positive', 'negative', 'other'],
      default: 'other'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    attachments: [{
      type: String
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  totalNotes: {
    type: Number,
    default: 0
  }
});

// Update totalNotes before saving
noteSchema.pre('save', function(next) {
  this.totalNotes = this.notes.length;
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Note', noteSchema); 