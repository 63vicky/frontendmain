const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Question type is required']
  },
  category: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  className: {
    type: String,
    trim: true
  },
  chapter: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string or array for multiple choice
    required: [true, 'Correct answer is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  },
  time: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [5, 'Time must be at least 5 seconds']
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
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
questionSchema.index({ text: 'text' });
questionSchema.index({ subject: 1 });
questionSchema.index({ className: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ category: 1 }); // Add index for category
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ status: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;