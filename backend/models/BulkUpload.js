const mongoose = require('mongoose');

const bulkUploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadType: {
    type: String,
    enum: ['students', 'teachers', 'questions', 'results'],
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  errors: [{
    row: Number,
    message: String
  }],
  processedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  fileDeleted: {
    type: Boolean,
    default: false
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
bulkUploadSchema.index({ uploadType: 1 });
bulkUploadSchema.index({ status: 1 });
bulkUploadSchema.index({ uploadedBy: 1 });
bulkUploadSchema.index({ createdAt: 1 });

const BulkUpload = mongoose.model('BulkUpload', bulkUploadSchema);

module.exports = BulkUpload;
