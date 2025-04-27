const Question = require('../models/Question');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { text, type, options, correctAnswer, points } = req.body;
    const examId = req.params.examId;
    
    // Validate exam exists and user has access
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add questions to this exam'
      });
    }

    // Create new question
    const question = new Question({
      text,
      type,
      options,
      correctAnswer,
      points,
      examIds: [new mongoose.Types.ObjectId(examId)],
      createdBy: req.user._id
    });

    await question.save();

    // Add question to exam
    exam.questions.push(question._id);
    await exam.save();

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create question'
    });
  }
};

// Get all questions for an exam
exports.getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    // Validate exam exists and user has access
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view questions for this exam'
      });
    }

    const questions = await Question.find({ examIds: examId });

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type, options, correctAnswer, points } = req.body;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Validate exam exists and user has access
    const exam = await Exam.findById(question.examIds[0]);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update questions for this exam'
      });
    }

    // Update question fields
    question.text = text;
    question.type = type;
    question.options = options;
    question.correctAnswer = correctAnswer;
    question.points = points;

    await question.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question'
    });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Validate exam exists and user has access
    const exam = await Exam.findById(question.examIds[0]);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete questions for this exam'
      });
    }

    // Remove question from exam
    exam.questions = exam.questions.filter(q => q.toString() !== id);
    await exam.save();

    // Delete question
    await question.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question'
    });
  }
};

// Add question to exam
exports.addQuestionToExam = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { examId } = req.body;

    // Validate exam exists and user has access
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add questions to this exam'
      });
    }

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Check if question is already in the exam
    if (question.examIds.includes(examId)) {
      return res.status(400).json({
        success: false,
        error: 'Question is already in this exam'
      });
    }

    // Add exam to question's examIds
    question.examIds.push(examId);
    await question.save();

    // Add question to exam
    exam.questions.push(question._id);
    await exam.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error adding question to exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add question to exam'
    });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user._id });

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');
    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects'
    });
  }
};

// Get all classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Question.distinct('class');
    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
};

// Get all chapters for a subject
exports.getChapters = async (req, res) => {
  try {
    const { subject } = req.params;
    const chapters = await Question.distinct('chapter', { subject });
    res.status(200).json({
      success: true,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapters'
    });
  }
}; 