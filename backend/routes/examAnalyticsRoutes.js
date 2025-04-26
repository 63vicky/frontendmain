const express = require('express');
const router = express.Router();
const examAnalyticsController = require('../controllers/examAnalyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Get exam analytics (only principal can access)
router.get('/', 
  authenticate, 
  authorize('principal'), 
  examAnalyticsController.getExamAnalytics
);

module.exports = router; 