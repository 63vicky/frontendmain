const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');

// Get all classes
router.get('/', authenticate, getAllClasses);

// Get class by ID
router.get('/:id', authenticate, getClassById);

// Create new class (admin only)
router.post('/', authenticate, authorize('principal'), createClass);

// Update class (admin only)
router.put('/:id', authenticate, authorize('principal'), updateClass);

// Delete class (admin only)
router.delete('/:id', authenticate, authorize('principal'), deleteClass);

module.exports = router; 