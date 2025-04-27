const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
// https://frontendmain-git-main-viveks-projects-5f4e7921.vercel.app//api/auth/login
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.post('/logout', authenticate, logout);

// /auth/reset-session
router.post('/reset-session', (req, res) => {
    // Clear the session
    req.session.destroy();
    res.json({ success: true });
  });
  
  // /auth/verify-session
  router.get('/verify-session', (req, res) => {
    // Return the current session info
    
    res.json({ 

      role: req.user ? req.user.role : null,
      authenticated: !!req.user
    });
  });

module.exports = router; 