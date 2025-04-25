const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxAttempts: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
examSchema.index({ status: 1, startDate: 1, endDate: 1 });
examSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Exam', examSchema); 