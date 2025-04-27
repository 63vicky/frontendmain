const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createQuestion,
  getExamQuestions,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
  addQuestionToExam,
  getSubjects,
  getClasses,
  getChapters
} = require('../controllers/questionController');

// Protect all routes
router.use(authenticate);

// Get dynamic data for dropdowns
router.get('/subjects', authorize('teacher'), getSubjects);
router.get('/classes', authorize('teacher'), getClasses);
router.get('/chapters/:subject', authorize('teacher'), getChapters);

// Get all questions (for teachers)
router.get('/', authorize('teacher'), getAllQuestions);

// Add question to exam
router.post('/:questionId/add-to-exam', authorize('teacher'), addQuestionToExam);

// Teacher routes
router.route('/exam/:examId')
  .get(authorize('teacher'), getExamQuestions)
  .post(authorize('teacher'), createQuestion);

router.route('/:id')
  .put(authorize('teacher'), updateQuestion)
  .delete(authorize('teacher'), deleteQuestion);

module.exports = router; 