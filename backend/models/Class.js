const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    unique: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true
  },
  students: {
    type: Number,
    default: 0
  },
  teacher: {
    type: String,
    required: [true, 'Class teacher is required'],
    trim: true
  },
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
classSchema.index({ name: 1 });
classSchema.index({ section: 1 });
classSchema.index({ status: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 