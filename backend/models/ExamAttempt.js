const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    // Not required when creating a new attempt, only when completing
    required: false
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    // Not required when creating a new attempt, only when completing
    required: false
  },
  rating: {
    type: String,
    enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
    // Not required when creating a new attempt, only when completing
    required: false
  },
  answers: {
    type: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOption: {
        type: String,
        required: true
      },
      // Add a separate field for descriptive answers that can handle longer text
      descriptiveAnswer: {
        type: String,
        default: ''
      },
      isCorrect: {
        type: Boolean,
        required: true
      },
      timeSpent: {
        type: Number, // Time spent in seconds
        default: 0
      },
      points: {
        type: Number,
        default: 0
      }
    }],
    default: [] // Default to empty array when creating a new attempt
  },
  questionTimings: {
    type: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      startTime: Date,
      endTime: Date,
      timeSpent: Number // Time spent in seconds
    }],
    default: [] // Default to empty array when creating a new attempt
  },
  categoryBreakdown: {
    type: [{
      category: String,
      correct: Number,
      total: Number,
      percentage: Number
    }],
    default: [] // Default to empty array when creating a new attempt
  },
  classRank: {
    rank: Number,
    totalStudents: Number,
    percentile: Number
  },
  timeSpent: {
    type: Number, // Total time spent in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  feedback: {
    text: String,
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
examAttemptSchema.index({ examId: 1, studentId: 1 });
examAttemptSchema.index({ studentId: 1, startTime: -1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);