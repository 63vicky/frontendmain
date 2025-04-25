const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTeachers,
  getStudents
} = require('../controllers/userController');

// Get all users (admin only)
router.get('/', authenticate, authorize('principal'), getUsers);

// Get user by ID
router.get('/:id', authenticate, getUserById);

// Create new user (admin only)
router.post('/', authenticate, authorize('principal'), createUser);

// Update user
router.put('/:id', authenticate, updateUser);

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('principal'), deleteUser);

// Get all teachers
router.get('/teachers', authenticate, getTeachers);

// Get all students (with optional class filter)
router.get('/students', authenticate, getStudents);

module.exports = router; 