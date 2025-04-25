const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

// Protected routes
router.get('/', authenticate, getSubjects);
router.get('/:id', authenticate, getSubjectById);
router.post('/', authenticate, authorize(['principal']), createSubject);
router.put('/:id', authenticate, authorize(['principal']), updateSubject);
router.delete('/:id', authenticate, authorize(['principal']), deleteSubject);

module.exports = router; 