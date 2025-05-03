const Question = require('../models/Question');
const Exam = require('../models/Exam_updated');
const mongoose = require('mongoose');

// Get all questions with filters
exports.getAllQuestions = async (req, res) => {
  try {
    const {
      subject,
      className,
      type,
      difficulty,
      search,
      status = 'Active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (subject && subject !== 'all') filter.subject = subject;
    if (className && className !== 'all') filter.className = className;
    if (type && type !== 'all') filter.type = type;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const {
      text,
      type,
      subject,
      className,
      chapter,
      difficulty,
      options,
      correctAnswer,
      points,
      time,
      tags
    } = req.body;

    // Validate question type specific requirements
    if (type === 'multiple-choice' && (!options || options.length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'Multiple choice questions must have at least 2 options'
      });
    }

    const question = new Question({
      text,
      type,
      subject,
      className,
      chapter,
      difficulty,
      options: type === 'multiple-choice' ? options : [],
      correctAnswer,
      points,
      time,
      tags: tags || [],
      createdBy: req.user._id
    });

    const savedQuestion = await question.save();
    res.status(201).json({ success: true, data: savedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const {
      text,
      type,
      subject,
      className,
      chapter,
      difficulty,
      options,
      correctAnswer,
      points,
      time,
      tags,
      status
    } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if user has permission to update
    if (question.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this question' });
    }

    // Validate question type specific requirements
    if (type === 'multiple-choice' && (!options || options.length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'Multiple choice questions must have at least 2 options'
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        text,
        type,
        subject,
        className,
        chapter,
        difficulty,
        options: type === 'multiple-choice' ? options : [],
        correctAnswer,
        points,
        time,
        tags: tags || question.tags,
        status
      },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json({ success: true, data: updatedQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if user has permission to delete
    if (question.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
    }

    // Check if question is used in any exams
    if (question.examIds && question.examIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete question as it is used in one or more exams'
      });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add question to exam
exports.addToExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const questionId = req.params.id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check if question is already in the exam
    if (question.examIds.includes(examId)) {
      return res.status(400).json({ success: false, message: 'Question is already in this exam' });
    }

    // Add exam to question's examIds
    question.examIds.push(examId);
    await question.save();

    // Add question to exam's questions array
    if (!exam.questions.includes(questionId)) {
      exam.questions.push(questionId);
      await exam.save();
    }

    res.json({ success: true, message: 'Question added to exam successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove question from exam
exports.removeFromExam = async (req, res) => {
  try {
    const { examId } = req.body;
    const questionId = req.params.id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Remove exam from question's examIds
    question.examIds = question.examIds.filter(id => id.toString() !== examId);
    await question.save();

    // Remove question from exam's questions array
    exam.questions = exam.questions.filter(id => id.toString() !== questionId);
    await exam.save();

    res.json({ success: true, message: 'Question removed from exam successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Question.distinct('subject', { status: 'Active' });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Question.distinct('className', { status: 'Active' });
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique chapters for a subject
exports.getChapters = async (req, res) => {
  try {
    const { subject } = req.params;
    const chapters = await Question.distinct('chapter', { subject, status: 'Active' });
    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};