const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadStudents,
  uploadTeachers,
  uploadQuestions,
  getBulkUploads,
  getBulkUploadById,
  getUploadedRecords,
  downloadStudentTemplate,
  downloadTeacherTemplate,
  downloadQuestionTemplate
} = require('../controllers/bulkUploadController');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all bulk uploads
router.get('/', getBulkUploads);

// Get bulk upload by ID
router.get('/:id', getBulkUploadById);

// Get uploaded records for a specific bulk upload
router.get('/:id/records', getUploadedRecords);

// Download templates
router.get('/templates/students', downloadStudentTemplate);
router.get('/templates/teachers', downloadTeacherTemplate);
router.get('/templates/questions', downloadQuestionTemplate);

// Upload students (principal or teacher)
router.post(
  '/students',
  authorize('principal', 'teacher'),
  upload.single('file'),
  uploadStudents
);

// Upload teachers (principal only)
router.post(
  '/teachers',
  authorize('principal'),
  upload.single('file'),
  uploadTeachers
);

// Upload questions (principal or teacher)
router.post(
  '/questions',
  authorize('principal', 'teacher'),
  upload.single('file'),
  uploadQuestions
);

module.exports = router;
