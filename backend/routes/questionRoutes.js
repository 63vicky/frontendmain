const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all questions with filters
router.get('/', authenticate, questionController.getAllQuestions);

// Get unique subjects
router.get('/subjects', authenticate, questionController.getSubjects);

// Get unique classes
router.get('/classes', authenticate, questionController.getClasses);

// Get unique chapters for a subject
router.get('/chapters/:subject', authenticate, questionController.getChapters);

// Get unique categories
router.get('/categories', authenticate, questionController.getCategories);

// Create new question (Teachers and Principals)
router.post('/',
  authenticate,
  authorize('teacher', 'principal'), // Allow both teachers and principals
  questionController.createQuestion
);

// Update question (Teachers and Principals)
router.put('/:id',
  authenticate,
  authorize('teacher', 'principal'), // Allow both teachers and principals
  questionController.updateQuestion
);

// Delete question (Teachers and Principals)
router.delete('/:id',
  authenticate,
  authorize('teacher', 'principal'), // Allow both teachers and principals
  questionController.deleteQuestion
);

// Add question to exam
router.post('/:id/add-to-exam',
  authenticate,
  authorize('teacher', 'principal'),
  questionController.addToExam
);

// Remove question from exam
router.post('/:id/remove-from-exam',
  authenticate,
  authorize('teacher', 'principal'),
  questionController.removeFromExam
);

module.exports = router;