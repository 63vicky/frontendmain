const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam_updated'); // Use the updated Exam model
const Question = require('../models/Question');

// Get all attempts for the current student, organized by exam ID
router.get('/student', authenticate, authorize('student'), async (req, res) => {
  try {
    console.log('Fetching attempts for student:', req.user._id);

    // Find all attempts for this student
    const attempts = await ExamAttempt.find({
      studentId: req.user._id,
      status: 'completed'
    }).sort({ startTime: -1 });

    console.log(`Found ${attempts.length} attempts for student`);

    // Get all exams for this student's class
    const studentClass = req.user.class;
    const exams = await Exam.find({
      class: studentClass,
      status: { $in: ['active', 'scheduled'] }
    });

    console.log(`Found ${exams.length} exams for student's class ${studentClass}`);

    // Organize attempts by exam ID
    const attemptsByExam = attempts.reduce((acc, attempt) => {
      const examId = attempt.examId.toString();
      if (!acc[examId]) {
        acc[examId] = [];
      }

      // Convert MongoDB document to plain object
      const attemptObj = attempt.toObject();

      // Ensure the attempt has an id field (some clients expect this)
      if (!attemptObj.id && attemptObj._id) {
        attemptObj.id = attemptObj._id.toString();
      }

      acc[examId].push(attemptObj);
      return acc;
    }, {});

    // Add empty arrays for exams with no attempts
    exams.forEach(exam => {
      const examId = exam._id.toString();
      if (!attemptsByExam[examId]) {
        attemptsByExam[examId] = [];
      }
    });

    console.log(`Organized attempts into ${Object.keys(attemptsByExam).length} exams`);

    // Log a sample of the data structure if available
    if (Object.keys(attemptsByExam).length > 0) {
      const sampleExamId = Object.keys(attemptsByExam)[0];
      console.log(`Sample exam ${sampleExamId} has ${attemptsByExam[sampleExamId].length} attempts`);
    }

    res.json(attemptsByExam);
  } catch (error) {
    console.error('Error fetching student attempts:', error);
    res.status(500).json({ message: 'Error fetching student attempts', error: error.message });
  }
});

// Start new exam attempt (Student only)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { examId } = req.body;

    // Verify exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== 'active') {
      return res.status(400).json({ message: 'Exam not available' });
    }

    // Check if the exam's class matches the student's class
    const examClassId = typeof exam.class === 'object' ? exam.class.toString() : exam.class.toString();
    const studentClassId = req.user.class.toString();

    if (examClassId !== studentClassId) {
      console.log(`Class mismatch: exam class ${examClassId}, student class ${studentClassId}`);
      return res.status(400).json({ message: 'Exam not available for your class' });
    }

    // Check if student has reached max attempts
    // Count the number of attempts for this student and exam
    const studentAttempts = await ExamAttempt.countDocuments({
      examId,
      studentId: req.user._id
    });

    console.log(`Student ${req.user._id} has ${studentAttempts} attempts for exam ${examId}`);

    // Check if student has reached max attempts
    if (exam.attempts && studentAttempts >= exam.attempts.max) {
      return res.status(400).json({
        message: 'Maximum attempts reached',
        currentAttempts: studentAttempts,
        maxAttempts: exam.attempts.max
      });
    }

    // Calculate max score based on available information
    let maxScore = 100; // Default value
    if (exam.totalMarks) {
      maxScore = exam.totalMarks;
    } else if (exam.questions && exam.questions.length) {
      maxScore = exam.questions.length * 10; // Default to 10 points per question
    }

    // Create new attempt
    const attempt = new ExamAttempt({
      examId,
      studentId: req.user._id,
      startTime: new Date(),
      maxScore: maxScore,
      status: 'in_progress'
    });

    await attempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    res.status(400).json({ message: 'Error starting exam attempt', error: error.message });
  }
});

// Submit exam attempt (Student only)
router.post('/:id/submit', authenticate, authorize('student'), async (req, res) => {
  try {
    const { answers, questionTimings, timeSpent } = req.body;
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

    // Get exam with populated questions
    const exam = await Exam.findById(attempt.examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get questions and calculate score
    const questions = await Question.find({
      _id: { $in: exam.questions.map(q => q._id) }
    });

    let score = 0;
    const answerResults = [];
    const categoryMap = new Map(); // To track category performance

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;

      // Determine if answer is correct based on question type
      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        if (Array.isArray(question.correctAnswer)) {
          isCorrect = question.correctAnswer.includes(answer.selectedOption);
        } else {
          isCorrect = question.correctAnswer === answer.selectedOption;
        }
      } else if (question.type === 'true-false') {
        isCorrect = question.correctAnswer === answer.selectedOption;
      } else if (question.type === 'short-answer' || question.type === 'fill-in-blank') {
        isCorrect = String(question.correctAnswer).toLowerCase() === String(answer.selectedOption).toLowerCase();
      }

      // Calculate points
      const points = isCorrect ? (question.points || 10) : 0;
      if (isCorrect) {
        score += points;
      }

      // Find timing data for this question
      const timing = questionTimings?.find(t => t.questionId === answer.questionId);
      const timeSpentOnQuestion = timing ? timing.timeSpent : 0;

      // Track difficulty performance instead of category
      const difficulty = question.difficulty || 'Medium';
      if (!categoryMap.has(difficulty)) {
        categoryMap.set(difficulty, { correct: 0, total: 0 });
      }
      const categoryData = categoryMap.get(difficulty);
      categoryData.total += 1;
      if (isCorrect) categoryData.correct += 1;
      categoryMap.set(difficulty, categoryData);

      answerResults.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: timeSpentOnQuestion,
        points
      });
    }

    // Calculate percentage and rating
    const totalPoints = questions.reduce((total, q) => total + (q.points || 10), 0);
    const percentage = Math.round((score / totalPoints) * 100);
    let rating = 'Needs Improvement';
    if (percentage >= 90) rating = 'Excellent';
    else if (percentage >= 75) rating = 'Good';
    else if (percentage >= 60) rating = 'Satisfactory';

    // Process category breakdown
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100)
    }));

    // Calculate class rank
    const classAttempts = await ExamAttempt.find({
      examId: attempt.examId,
      status: 'completed'
    }).sort({ score: -1 });

    const totalStudents = classAttempts.length + 1; // +1 for current attempt
    const higherScores = classAttempts.filter(a => a.score > score).length;
    const rank = higherScores + 1;
    const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100);

    // Update attempt
    attempt.answers = answerResults;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.rating = rating;
    attempt.endTime = new Date();
    attempt.status = 'completed';
    attempt.timeSpent = timeSpent || Math.floor((new Date() - attempt.startTime) / 1000);
    attempt.questionTimings = questionTimings || [];
    attempt.categoryBreakdown = categoryBreakdown;
    attempt.classRank = {
      rank,
      totalStudents,
      percentile
    };

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    console.error('Error submitting exam attempt:', error);
    res.status(400).json({ message: 'Error submitting exam attempt', error: error.message });
  }
});

// Get student's attempts for an exam
router.get('/exam/:examId', authenticate, async (req, res) => {
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
router.get('/:id', authenticate, async (req, res) => {
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