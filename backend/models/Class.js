const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  schedule: {
    type: String,
    required: [true, 'Schedule is required'],
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
classSchema.index({ subject: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 