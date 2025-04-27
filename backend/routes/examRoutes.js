const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createExam,
  getTeacherExams,
  getExam,
  updateExam,
  deleteExam
} = require('../controllers/examController');

// Protect all routes
router.use(authenticate);

// Teacher routes
router.route('/')
  .post(authorize('teacher'), createExam)
  .get(authorize('teacher'), getTeacherExams);

router.route('/:id')
  .get(authorize('teacher'), getExam)
  .put(authorize('teacher'), updateExam)
  .delete(authorize('teacher'), deleteExam);

module.exports = router; 