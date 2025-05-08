const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  getStudentResults,
  getClassPerformance,
  submitStudentResult,
  getExamResults
} = require('../controllers/resultController');

// Protected routes
router.get('/', authenticate, getResults);
router.get('/exam/:examId', authenticate, getExamResults);
router.get('/student/:studentId', authenticate, getStudentResults);
router.get('/class/:classId/performance', authenticate, getClassPerformance);
router.get('/:id', authenticate, getResultById);
router.post('/', authenticate, authorize(['teacher', 'principal']), createResult);
router.put('/:id', authenticate, authorize(['teacher', 'principal']), updateResult);
router.delete('/:id', authenticate, authorize(['teacher', 'principal']), deleteResult);

// Student-specific routes
router.post('/student/submit', authenticate, authorize('student'), submitStudentResult);

module.exports = router;