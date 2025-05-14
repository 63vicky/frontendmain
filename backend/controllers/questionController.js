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
      teacherId,
      category,
      status = 'Active'
    } = req.query;

    // Build filter object
    const filter = { status };
    if (subject && subject !== 'all') filter.subject = subject;
    if (className && className !== 'all') filter.className = className;
    if (type && type !== 'all') filter.type = type;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (teacherId && teacherId !== 'all') filter.createdBy = teacherId;
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    // If user is a teacher, only show questions created by teachers
    // This ensures principals' questions don't show up in teacher login
    if (req.user.role === 'teacher') {
      // Find all users with teacher role
      const teachers = await mongoose.model('User').find({ role: 'teacher' }, '_id');
      const teacherIds = teachers.map(teacher => teacher._id);

      // Only show questions created by teachers
      filter.createdBy = { $in: teacherIds };
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
      tags,
      category
    } = req.body;

    // Allow custom question types - only validate multiple-choice specifically

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
      category, // Include category field
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
      status,
      category
    } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if user has permission to update
    if (question.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this question' });
    }

    // Allow custom question types - only validate multiple-choice specifically

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
        status,
        category: category || question.category
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
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
    }

    // If question is used in exams, remove it from all exams first
    if (question.examIds && question.examIds.length > 0) {
      console.log(`Removing question ${question._id} from ${question.examIds.length} exams`);

      // Find all exams that contain this question
      const exams = await Exam.find({ _id: { $in: question.examIds } });

      // Remove the question from each exam's questions array
      for (const exam of exams) {
        exam.questions = exam.questions.filter(q => q.toString() !== question._id.toString());
        await exam.save();
        console.log(`Removed question from exam ${exam._id}`);
      }
    }

    // Now delete the question
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
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
    // Create filter object
    const filter = { status: 'Active' };

    // If user is a teacher, only show subjects from questions created by teachers
    if (req.user.role === 'teacher') {
      // Find all users with teacher role
      const teachers = await mongoose.model('User').find({ role: 'teacher' }, '_id');
      const teacherIds = teachers.map(teacher => teacher._id);

      // Only include subjects from questions created by teachers
      filter.createdBy = { $in: teacherIds };
    }

    const subjects = await Question.distinct('subject', filter);
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique classes
exports.getClasses = async (req, res) => {
  try {
    // Create filter object
    const filter = { status: 'Active' };

    // If user is a teacher, only show classes from questions created by teachers
    if (req.user.role === 'teacher') {
      // Find all users with teacher role
      const teachers = await mongoose.model('User').find({ role: 'teacher' }, '_id');
      const teacherIds = teachers.map(teacher => teacher._id);

      // Only include classes from questions created by teachers
      filter.createdBy = { $in: teacherIds };
    }

    const classes = (await Question.distinct('className', filter))
      .filter(c => c !== null)
      .filter(c => c !== '');

    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique chapters for a subject
exports.getChapters = async (req, res) => {
  try {
    const { subject } = req.params;

    // Create filter object
    const filter = { subject, status: 'Active' };

    // If user is a teacher, only show chapters from questions created by teachers
    if (req.user.role === 'teacher') {
      // Find all users with teacher role
      const teachers = await mongoose.model('User').find({ role: 'teacher' }, '_id');
      const teacherIds = teachers.map(teacher => teacher._id);

      // Only include chapters from questions created by teachers
      filter.createdBy = { $in: teacherIds };
    }

    const chapters = await Question.distinct('chapter', filter);
    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique categories
exports.getCategories = async (req, res) => {
  try {
    // Create filter object
    const filter = { status: 'Active' };

    // If user is a teacher, only show categories from questions created by teachers
    if (req.user.role === 'teacher') {
      // Find all users with teacher role
      const teachers = await mongoose.model('User').find({ role: 'teacher' }, '_id');
      const teacherIds = teachers.map(teacher => teacher._id);

      // Only include categories from questions created by teachers
      filter.createdBy = { $in: teacherIds };
    }

    const categories = await Question.distinct('category', filter);
    // Filter out null or empty categories
    const validCategories = categories.filter(category => category && category.trim() !== '');
    res.json({ success: true, data: validCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};