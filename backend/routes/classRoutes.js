const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');

// Protected routes
router.get('/', authenticate, getClasses);
router.get('/:id', authenticate, getClassById);
router.post('/', authenticate, authorize(['principal']), createClass);
router.put('/:id', authenticate, authorize(['principal']), updateClass);
router.delete('/:id', authenticate, authorize(['principal']), deleteClass);

module.exports = router; 