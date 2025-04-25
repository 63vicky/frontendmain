const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Start new exam attempt (Student only)
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { examId } = req.body;

    // Verify exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== 'active' || exam.class !== req.user.class) {
      return res.status(400).json({ message: 'Exam not available' });
    }

    // Check if student has reached max attempts
    const attemptsCount = await ExamAttempt.countDocuments({
      examId,
      studentId: req.user._id
    });

    if (attemptsCount >= exam.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Create new attempt
    const attempt = new ExamAttempt({
      examId,
      studentId: req.user._id,
      startTime: new Date(),
      maxScore: exam.totalMarks,
      status: 'in_progress'
    });

    await attempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    res.status(400).json({ message: 'Error starting exam attempt', error: error.message });
  }
});

// Submit exam attempt (Student only)
router.post('/:id/submit', auth, authorize('student'), async (req, res) => {
  try {
    const { answers } = req.body;
    const attempt = await ExamAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    // Get questions and calculate score
    const questions = await Question.find({ examId: attempt.examId });
    let score = 0;
    const answerResults = [];

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedOption;
      if (isCorrect) {
        score += question.marks;
      }

      answerResults.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect
      });
    }

    // Calculate percentage and rating
    const percentage = (score / attempt.maxScore) * 100;
    let rating = 'Needs Improvement';
    if (percentage >= 90) rating = 'Excellent';
    else if (percentage >= 75) rating = 'Good';
    else if (percentage >= 60) rating = 'Satisfactory';

    // Update attempt
    attempt.answers = answerResults;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.rating = rating;
    attempt.endTime = new Date();
    attempt.status = 'completed';

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting exam attempt', error: error.message });
  }
});

// Get student's attempts for an exam
router.get('/exam/:examId', auth, async (req, res) => {
  try {
    const query = { examId: req.params.examId };

    // If student, only show their attempts
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const attempts = await ExamAttempt.find(query)
      .populate('studentId', 'name email')
      .sort({ startTime: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attempts', error: error.message });
  }
});

// Get single attempt
router.get('/:id', auth, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.id)
      .populate('studentId', 'name email');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && 
        attempt.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attempt', error: error.message });
  }
});

module.exports = router; 