const mongoose = require('mongoose');

const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string or array depending on question type
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  time: {
    type: Number,
    default: 30 // Default time in seconds
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
  tags: [{
    type: String,
    trim: true
  }],
  examIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
}));

// Index for efficient querying
Question.schema.index({ examIds: 1 });
Question.schema.index({ createdBy: 1 });
Question.schema.index({ subject: 1 });
Question.schema.index({ class: 1 });

module.exports = Question; 