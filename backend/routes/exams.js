const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Create new exam (Teacher only)
router.post('/', auth, authorize('teacher'), async (req, res) => {
  try {
    const exam = new Exam({
      ...req.body,
      createdBy: req.user._id
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: 'Error creating exam', error: error.message });
  }
});

// Get all exams (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { status, subject, class: studentClass } = req.query;
    const query = {};

    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (studentClass) query.class = studentClass;

    // If student, only show active exams for their class
    if (req.user.role === 'student') {
      query.status = 'active';
      query.class = req.user.class;
    }

    // If teacher, only show their exams
    if (req.user.role === 'teacher') {
      query.createdBy = req.user._id;
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });
    
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
});

// Get single exam
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if student has access to this exam
    if (req.user.role === 'student' && 
        (exam.status !== 'active' || exam.class !== req.user.class)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam', error: error.message });
  }
});

// Update exam (Teacher only)
router.put('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: 'Error updating exam', error: error.message });
  }
});

// Delete exam (Teacher only)
router.delete('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Delete associated questions
    await Question.deleteMany({ examId: exam._id });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
});

// Change exam status (Teacher only)
router.patch('/:id/status', auth, authorize('teacher'), async (req, res) => {
  try {
    const { status } = req.body;
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: 'Error updating exam status', error: error.message });
  }
});

module.exports = router; 