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

// Teacher and Principal routes
router.route('/')
  .post(authorize('teacher', 'principal'), createExam)
  .get(authorize('teacher', 'principal'), getTeacherExams);

router.route('/:id')
  .get(getExam)  // Allow all authenticated users to view exam details
  .put(authorize('teacher', 'principal'), updateExam)
  .delete(authorize('teacher', 'principal'), deleteExam);

// Class exams route - accessible by all authenticated users
router.route('/class/:classId')
  .get(getExamsByClass);

module.exports = router;