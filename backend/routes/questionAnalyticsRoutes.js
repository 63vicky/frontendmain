const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const questionAnalyticsController = require('../controllers/questionAnalyticsController');

// Get question analytics for a specific exam
// Access: Teachers (own exams only) and Principals
router.get('/exam/:examId', 
  authenticate, 
  authorize(['teacher', 'principal']), 
  questionAnalyticsController.getExamQuestionAnalytics
);

// Get question analytics for a specific student's attempt
// Access: Students (own attempts only), Teachers, and Principals
router.get('/attempt/:attemptId', 
  authenticate, 
  questionAnalyticsController.getStudentQuestionAnalytics
);

module.exports = router;
