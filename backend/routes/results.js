const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');
const User = require('../models/User');

// Get exam results summary
router.get('/exam/:examId', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' &&
        exam.class !== req.user.class) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'teacher' &&
        exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all attempts for this exam
    const attempts = await ExamAttempt.find({ examId: exam._id })
      .populate('studentId', 'name email rollNo');

    // Calculate statistics
    const totalStudents = await User.countDocuments({
      role: 'student',
      class: exam.class
    });

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'completed').length;

    const scores = attempts.map(a => a.score);
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const highestScore = Math.max(...scores, 0);
    const lowestScore = Math.min(...scores, 0);

    // Group by rating
    const ratings = attempts.reduce((acc, attempt) => {
      acc[attempt.rating] = (acc[attempt.rating] || 0) + 1;
      return acc;
    }, {});

    res.json({
      examId: exam._id,
      title: exam.title,
      subject: exam.subject,
      class: exam.class,
      teacher: exam.createdBy,
      totalStudents,
      totalAttempts,
      completedAttempts,
      avgScore,
      highestScore,
      lowestScore,
      ratings,
      attempts: {
        total: totalAttempts,
        max: exam.maxAttempts * totalStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam results', error: error.message });
  }
});

// Get student's results for all exams
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Check access permissions
    if (req.user.role === 'student' &&
        req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all attempts for this student
    const attempts = await ExamAttempt.find({ studentId })
      .populate('examId', 'title subject class');

    // Group attempts by exam
    const examResults = attempts.reduce((acc, attempt) => {
      const examId = attempt.examId._id.toString();
      if (!acc[examId]) {
        acc[examId] = {
          examId: attempt.examId._id,
          title: attempt.examId.title,
          subject: attempt.examId.subject,
          class: attempt.examId.class,
          attempts: [],
          bestScore: 0,
          bestAttempt: null
        };
      }

      acc[examId].attempts.push(attempt);
      if (attempt.score > acc[examId].bestScore) {
        acc[examId].bestScore = attempt.score;
        acc[examId].bestAttempt = attempt._id;
      }

      return acc;
    }, {});

    res.json({
      studentId,
      studentName: student.name,
      class: student.class,
      examResults: Object.values(examResults)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results', error: error.message });
  }
});

// Get class performance analytics
router.get('/class/:classId', authenticate, authorize(['teacher', 'principal']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, startDate, endDate } = req.query;

    // Get all exams for the class
    const examQuery = { class: classId };
    if (subject) examQuery.subject = subject;
    if (startDate && endDate) {
      examQuery.startDate = { $gte: new Date(startDate) };
      examQuery.endDate = { $lte: new Date(endDate) };
    }

    const exams = await Exam.find(examQuery);
    const examIds = exams.map(exam => exam._id);

    // Get all attempts for these exams
    const attempts = await ExamAttempt.find({ examId: { $in: examIds } })
      .populate('studentId', 'name rollNo')
      .populate('examId', 'title subject');

    // Calculate class performance
    const performance = {
      totalExams: exams.length,
      totalAttempts: attempts.length,
      avgScore: 0,
      passRate: 0,
      subjectWise: {},
      studentWise: {}
    };

    // Calculate subject-wise performance
    attempts.forEach(attempt => {
      const subject = attempt.examId.subject;
      if (!performance.subjectWise[subject]) {
        performance.subjectWise[subject] = {
          totalAttempts: 0,
          totalScore: 0,
          passCount: 0
        };
      }

      performance.subjectWise[subject].totalAttempts++;
      performance.subjectWise[subject].totalScore += attempt.score;
      if (attempt.percentage >= 60) {
        performance.subjectWise[subject].passCount++;
      }
    });

    // Calculate student-wise performance
    attempts.forEach(attempt => {
      const studentId = attempt.studentId._id.toString();
      if (!performance.studentWise[studentId]) {
        performance.studentWise[studentId] = {
          name: attempt.studentId.name,
          rollNo: attempt.studentId.rollNo,
          totalAttempts: 0,
          totalScore: 0,
          passCount: 0
        };
      }

      performance.studentWise[studentId].totalAttempts++;
      performance.studentWise[studentId].totalScore += attempt.score;
      if (attempt.percentage >= 60) {
        performance.studentWise[studentId].passCount++;
      }
    });

    // Calculate overall averages
    const totalScores = attempts.map(a => a.score);
    performance.avgScore = totalScores.length > 0
      ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
      : 0;

    const passCount = attempts.filter(a => a.percentage >= 60).length;
    performance.passRate = attempts.length > 0
      ? (passCount / attempts.length) * 100
      : 0;

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class performance', error: error.message });
  }
});

module.exports = router;