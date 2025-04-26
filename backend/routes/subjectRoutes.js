const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all subjects
router.get('/', authenticate, subjectController.getAllSubjects);

// Get subject by ID
router.get('/:id', authenticate, subjectController.getSubjectById);

// Create new subject (only principal can create)
router.post('/', 
  authenticate, 
  authorize('principal'), 
  subjectController.createSubject
);

// Update subject (only principal can update)
router.put('/:id', 
  authenticate, 
  authorize('principal'), 
  subjectController.updateSubject
);

// Delete subject (only principal can delete)
router.delete('/:id', 
  authenticate, 
  authorize('principal'), 
  subjectController.deleteSubject
);

module.exports = router; 