const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createExam,
  getTeacherExams,
  getExam,
  updateExam,
  deleteExam,
  getExamsByClass
} = require('../controllers/examController');

// Protect all routes
router.use(authenticate);

// Teacher routes
router.route('/')
  .post(authorize('teacher'), createExam)
  .get(authorize('teacher'), getTeacherExams);

router.route('/:id')
  .get(getExam)  // Allow all authenticated users to view exam details
  .put(authorize('teacher'), updateExam)
  .delete(authorize('teacher'), deleteExam);

// Class exams route - accessible by all authenticated users
router.route('/class/:classId')
  .get(getExamsByClass);

module.exports = router;