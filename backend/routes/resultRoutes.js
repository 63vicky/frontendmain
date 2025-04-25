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
  getClassPerformance
} = require('../controllers/resultController');

// Protected routes
router.get('/', authenticate, getResults);
router.get('/:id', authenticate, getResultById);
router.get('/student/:studentId', authenticate, getStudentResults);
router.get('/class/:classId/performance', authenticate, getClassPerformance);
router.post('/', authenticate, authorize(['teacher', 'principal']), createResult);
router.put('/:id', authenticate, authorize(['teacher', 'principal']), updateResult);
router.delete('/:id', authenticate, authorize(['teacher', 'principal']), deleteResult);

module.exports = router; 