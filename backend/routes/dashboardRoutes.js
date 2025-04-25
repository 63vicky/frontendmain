const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Principal dashboard routes
router.get(
  '/principal/stats',
  authenticate,
  authorize('principal'),
  dashboardController.getPrincipalStats
);

router.get(
  '/principal/recent-exams',
  authenticate,
  authorize('principal'),
  dashboardController.getPrincipalRecentExams
);

router.get(
  '/principal/class-performance',
  authenticate,
  authorize('principal'),
  dashboardController.getClassPerformance
);

// Teacher dashboard routes
router.get(
  '/teacher/:teacherId/stats',
  authenticate,
  authorize('teacher'),
  dashboardController.getTeacherStats
);

router.get(
  '/teacher/:teacherId/recent-exams',
  authenticate,
  authorize('teacher'),
  dashboardController.getTeacherRecentExams
);

// Student dashboard routes
router.get(
  '/student/:studentId/stats',
  authenticate,
  authorize('student'),
  dashboardController.getStudentStats
);

router.get(
  '/student/:studentId/recent-exams',
  authenticate,
  authorize('student'),
  dashboardController.getStudentRecentExams
);

module.exports = router; 