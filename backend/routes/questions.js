const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// Create new question (Teacher only)
router.post('/', auth, authorize('teacher'), async (req, res) => {
  try {
    const { examId, ...questionData } = req.body;

    // Verify exam exists and belongs to the teacher
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const question = new Question({
      ...questionData,
      examId,
      createdBy: req.user._id
    });

    await question.save();

    // Add question to exam's questions array
    exam.questions.push(question._id);
    await exam.save();

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: 'Error creating question', error: error.message });
  }
});

// Get questions for an exam
router.get('/exam/:examId', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && 
        (exam.status !== 'active' || exam.class !== req.user.class)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const questions = await Question.find({ examId: req.params.examId })
      .select('-correctAnswer'); // Don't send correct answers to students

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Get single question (Teacher only)
router.get('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Verify question belongs to teacher's exam
    const exam = await Exam.findOne({
      _id: question.examId,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error: error.message });
  }
});

// Update question (Teacher only)
router.put('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Verify question belongs to teacher's exam
    const exam = await Exam.findOne({
      _id: question.examId,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: 'Error updating question', error: error.message });
  }
});

// Delete question (Teacher only)
router.delete('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Verify question belongs to teacher's exam
    const exam = await Exam.findOne({
      _id: question.examId,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await question.deleteOne();

    // Remove question from exam's questions array
    exam.questions = exam.questions.filter(q => q.toString() !== question._id.toString());
    await exam.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

module.exports = router; 