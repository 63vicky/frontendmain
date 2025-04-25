const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamResults
} = require('../controllers/examController');

// Protected routes
router.get('/', authenticate, getExams);
router.get('/:id', authenticate, getExamById);
router.get('/:id/results', authenticate, getExamResults);
router.post('/', authenticate, authorize(['teacher', 'principal']), createExam);
router.put('/:id', authenticate, authorize(['teacher', 'principal']), updateExam);
router.delete('/:id', authenticate, authorize(['teacher', 'principal']), deleteExam);

module.exports = router; 