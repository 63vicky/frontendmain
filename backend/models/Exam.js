const mongoose = require('mongoose');

// Check if the model already exists
const Exam = mongoose.models.Exam || mongoose.model('Exam', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  chapter: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 180
  },
  attempts: {
    current: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
}));

// Validate that endDate is after startDate
Exam.schema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Index for efficient querying
Exam.schema.index({ status: 1, startDate: 1, endDate: 1 });
Exam.schema.index({ createdBy: 1, status: 1 });

module.exports = Exam; 