const BulkUpload = require('../models/BulkUpload');
const User = require('../models/User');
const Question = require('../models/Question');
const { parseFile, validateStudentData, validateTeacherData, validateQuestionData, generateStudentTemplate, generateTeacherTemplate, generateQuestionTemplate } = require('../utils/fileParser');
const { handleError } = require('../utils/errorHandler');
const { cleanupOldFiles } = require('../utils/fileCleanup');
const fs = require('fs').promises;

/**
 * Upload students in bulk
 */
exports.uploadStudents = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create a record for this upload
    const bulkUpload = new BulkUpload({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadType: 'students',
      uploadedBy: req.user._id
    });

    await bulkUpload.save();

    // Parse the file
    try {
      const parsedData = await parseFile(req.file);

      // Validate student data
      const { validEntries, invalidEntries } = await validateStudentData(parsedData);

      // Update bulk upload record with validation results
      bulkUpload.totalRecords = parsedData.length;
      bulkUpload.successCount = validEntries.length;
      bulkUpload.failureCount = invalidEntries.length;

      if (invalidEntries.length > 0) {
        bulkUpload.errors = invalidEntries.map(entry => ({
          row: entry.row,
          message: entry.errors.join(', ')
        }));
      }

      // Store processed data for viewing later
      const processedRecords = [
        ...validEntries.map(entry => ({
          ...entry,
          status: 'success'
        })),
        ...invalidEntries.map(entry => ({
          ...entry.data,
          status: 'failed',
          errors: entry.errors
        }))
      ];

      bulkUpload.processedData = {
        records: processedRecords
      };

      // If there are valid entries, create users
      if (validEntries.length > 0) {
        await User.insertMany(validEntries);
      }

      // Update status
      bulkUpload.status = 'completed';
      await bulkUpload.save();

      // Return response
      return res.status(200).json({
        success: true,
        message: 'File processed successfully',
        data: {
          totalRecords: parsedData.length,
          successCount: validEntries.length,
          failureCount: invalidEntries.length,
          uploadId: bulkUpload._id
        }
      });

    } catch (error) {
      // Update bulk upload record with error
      bulkUpload.status = 'failed';
      bulkUpload.errors = [{ row: 0, message: error.message }];
      await bulkUpload.save();

      // Delete the uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Error processing file',
        error: error.message
      });
    }

  } catch (error) {
    // If file was uploaded, try to delete it
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    handleError(res, error, 'Error uploading students');
  }
};

/**
 * Upload teachers in bulk
 */
exports.uploadTeachers = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create a record for this upload
    const bulkUpload = new BulkUpload({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadType: 'teachers',
      uploadedBy: req.user._id
    });

    await bulkUpload.save();

    // Parse the file
    try {
      const parsedData = await parseFile(req.file);

      // Validate teacher data
      const { validEntries, invalidEntries } = await validateTeacherData(parsedData);

      // Update bulk upload record with validation results
      bulkUpload.totalRecords = parsedData.length;
      bulkUpload.successCount = validEntries.length;
      bulkUpload.failureCount = invalidEntries.length;

      if (invalidEntries.length > 0) {
        bulkUpload.errors = invalidEntries.map(entry => ({
          row: entry.row,
          message: entry.errors.join(', ')
        }));
      }

      // Store processed data for viewing later
      const processedRecords = [
        ...validEntries.map(entry => ({
          ...entry,
          status: 'success'
        })),
        ...invalidEntries.map(entry => ({
          ...entry.data,
          status: 'failed',
          errors: entry.errors
        }))
      ];

      bulkUpload.processedData = {
        records: processedRecords
      };

      // If there are valid entries, create users
      if (validEntries.length > 0) {
        await User.insertMany(validEntries);
      }

      // Update status
      bulkUpload.status = 'completed';
      await bulkUpload.save();

      // Return response
      return res.status(200).json({
        success: true,
        message: 'File processed successfully',
        data: {
          totalRecords: parsedData.length,
          successCount: validEntries.length,
          failureCount: invalidEntries.length,
          uploadId: bulkUpload._id
        }
      });

    } catch (error) {
      // Update bulk upload record with error
      bulkUpload.status = 'failed';
      bulkUpload.errors = [{ row: 0, message: error.message }];
      await bulkUpload.save();

      // Delete the uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Error processing file',
        error: error.message
      });
    }

  } catch (error) {
    // If file was uploaded, try to delete it
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    handleError(res, error, 'Error uploading teachers');
  }
};

/**
 * Get all bulk uploads
 */
exports.getBulkUploads = async (req, res) => {
  try {
    const { type, includeDeleted } = req.query;
    const query = {};

    // Filter by upload type if provided and not 'all'
    if (type && type !== 'all') {
      query.uploadType = type;
    }

    // Filter by user if not principal
    if (req.user.role !== 'principal') {
      query.uploadedBy = req.user._id;
    }

    // By default, don't include files that have been deleted
    if (includeDeleted !== 'true') {
      query.fileDeleted = { $ne: true };
    }



    const bulkUploads = await BulkUpload.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: bulkUploads
    });
  } catch (error) {
    handleError(res, error, 'Error fetching bulk uploads');
  }
};

/**
 * Get bulk upload by ID
 */
exports.getBulkUploadById = async (req, res) => {
  try {
    const bulkUpload = await BulkUpload.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .lean();

    if (!bulkUpload) {
      return res.status(404).json({
        success: false,
        message: 'Bulk upload not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bulkUpload
    });
  } catch (error) {
    handleError(res, error, 'Error fetching bulk upload');
  }
};

/**
 * Get uploaded records for a specific bulk upload
 */
exports.getUploadedRecords = async (req, res) => {
  try {
    const bulkUpload = await BulkUpload.findById(req.params.id)
      .lean();

    if (!bulkUpload) {
      return res.status(404).json({
        success: false,
        message: 'Bulk upload not found'
      });
    }

    // Check if the user has permission to view this upload
    if (req.user.role !== 'principal' && bulkUpload.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this upload'
      });
    }

    // Get the processed records
    const records = bulkUpload.processedData?.records || [];

    res.status(200).json({
      success: true,
      data: {
        records,
        uploadType: bulkUpload.uploadType,
        totalRecords: bulkUpload.totalRecords,
        successCount: bulkUpload.successCount,
        failureCount: bulkUpload.failureCount
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching uploaded records');
  }
};

/**
 * Download student template
 */
exports.downloadStudentTemplate = (req, res) => {
  try {
    const templateBuffer = generateStudentTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_template.xlsx');
    res.send(templateBuffer);
  } catch (error) {
    handleError(res, error, 'Error generating student template');
  }
};

/**
 * Download teacher template
 */
exports.downloadTeacherTemplate = (req, res) => {
  try {
    const templateBuffer = generateTeacherTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=teacher_template.xlsx');
    res.send(templateBuffer);
  } catch (error) {
    handleError(res, error, 'Error generating teacher template');
  }
};

/**
 * Upload questions in bulk
 */
exports.uploadQuestions = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create a record for this upload
    const bulkUpload = new BulkUpload({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadType: 'questions',
      uploadedBy: req.user._id
    });

    await bulkUpload.save();

    // Parse the file
    try {
      const parsedData = await parseFile(req.file);

      // Validate question data
      const { validEntries, invalidEntries } = await validateQuestionData(parsedData);

      // Update bulk upload record with validation results
      bulkUpload.totalRecords = parsedData.length;
      bulkUpload.successCount = validEntries.length;
      bulkUpload.failureCount = invalidEntries.length;

      if (invalidEntries.length > 0) {
        bulkUpload.errors = invalidEntries.map(entry => ({
          row: entry.row,
          message: entry.errors.join(', ')
        }));
      }

      // Store processed data for viewing later
      const processedRecords = [
        ...validEntries.map(entry => ({
          ...entry,
          status: 'success'
        })),
        ...invalidEntries.map(entry => ({
          ...entry.data,
          status: 'failed',
          errors: entry.errors
        }))
      ];

      bulkUpload.processedData = {
        records: processedRecords
      };

      // If there are valid entries, create questions
      if (validEntries.length > 0) {
        await Question.insertMany(validEntries.map(entry => ({
          ...entry,
          createdBy: req.user._id
        })));
      }

      // Update status
      bulkUpload.status = 'completed';
      await bulkUpload.save();

      // Return response
      return res.status(200).json({
        success: true,
        message: 'File processed successfully',
        data: {
          totalRecords: parsedData.length,
          successCount: validEntries.length,
          failureCount: invalidEntries.length,
          uploadId: bulkUpload._id
        }
      });

    } catch (error) {
      // Update bulk upload record with error
      bulkUpload.status = 'failed';
      bulkUpload.errors = [{ row: 0, message: error.message }];
      await bulkUpload.save();

      // Delete the uploaded file
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Error processing file',
        error: error.message
      });
    }

  } catch (error) {
    // If file was uploaded, try to delete it
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    handleError(res, error, 'Error uploading questions');
  }
};

/**
 * Download question template
 */
exports.downloadQuestionTemplate = (req, res) => {
  try {
    const templateBuffer = generateQuestionTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=question_template.xlsx');
    res.send(templateBuffer);
  } catch (error) {
    handleError(res, error, 'Error generating question template');
  }
};

/**
 * Manually trigger cleanup of old uploads
 * @param {number} days - Number of days to keep files (default: 7)
 */
exports.cleanupUploads = async (req, res) => {
  try {
    // Get days from query parameter or use default (7 days)
    const days = parseInt(req.query.days) || 7;

    // Validate days parameter
    if (days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Days parameter must be at least 1'
      });
    }

    // Run the cleanup
    const result = await cleanupOldFiles(days);

    // Return the result
    res.status(200).json({
      success: true,
      message: `Cleanup completed. Deleted ${result.deletedCount} files.`,
      data: result
    });
  } catch (error) {
    handleError(res, error, 'Error cleaning up uploads');
  }
};


