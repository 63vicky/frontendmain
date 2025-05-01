const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentsToClass,
  removeStudentsFromClass
} = require('../controllers/classController');

// Get all classes
router.get('/', authenticate, getAllClasses);

// Get class by ID
router.get('/:id', authenticate, getClassById);

// Get students in a class
router.get('/:id/students', authenticate, getClassStudents);

// Add students to class
router.post('/:id/students', authenticate, authorize('principal', 'teacher'), addStudentsToClass);

// Create new class (admin only)
router.post('/', authenticate, authorize('principal', 'teacher'), createClass);

// Update class (admin only)
router.put('/:id', authenticate, authorize('principal', 'teacher'), updateClass);

// Delete class (admin only)
router.delete('/:id', authenticate, authorize('principal', 'teacher'), deleteClass);

// Remove students from class
router.post('/:id/remove-students', authenticate, authorize('principal', 'teacher'), removeStudentsFromClass);

module.exports = router; 


