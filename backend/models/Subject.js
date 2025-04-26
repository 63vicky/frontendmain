const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classes: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
subjectSchema.index({ name: 1 });
subjectSchema.index({ code: 1 });
subjectSchema.index({ status: 1 });
subjectSchema.index({ teacher: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject; 