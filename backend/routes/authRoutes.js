const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.post('/logout', authenticate, logout);

module.exports = router; 