const Exam = require('../models/Exam');
const { validateExam } = require('../utils/validators');

// In a real app, this would be a database model
let exams = [
  {
    id: 1,
    title: 'Midterm Mathematics',
    subjectId: 1,
    classId: 1,
    date: '2024-05-01',
    duration: 120,
    totalMarks: 100,
    instructions: 'Complete all questions. Show your work.',
    createdBy: 1
  },
  {
    id: 2,
    title: 'Final Science',
    subjectId: 2,
    classId: 1,
    date: '2024-06-15',
    duration: 90,
    totalMarks: 80,
    instructions: 'Answer all questions. No calculators allowed.',
    createdBy: 2
  }
];

const getExams = async (req, res) => {
  try {
    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = exams.find(e => e.id === parseInt(id));
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Get exam by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, subject, class: className, chapter, duration, startDate, endDate, attempts } = req.body;
    
    // Validate exam data
    const validationError = validateExam(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Create new exam
    const exam = new Exam({
      title,
      subject,
      class: className,
      chapter,
      duration,
      startDate,
      endDate,
      attempts: {
        max: attempts
      },
      createdBy: req.user._id
    });

    await exam.save();

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create exam'
    });
  }
};

const getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exams'
    });
  }
};

const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('questions');

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam'
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const { title, subject, class: className, chapter, duration, startDate, endDate, attempts } = req.body;
    
    // Validate exam data
    const validationError = validateExam(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Check if user is the creator of the exam
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this exam'
      });
    }

    // Update exam fields
    exam.title = title;
    exam.subject = subject;
    exam.class = className;
    exam.chapter = chapter;
    exam.duration = duration;
    exam.startDate = startDate;
    exam.endDate = endDate;
    exam.attempts.max = attempts;

    await exam.save();

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update exam'
    });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Check if user is the creator of the exam
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this exam'
      });
    }

    await exam.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete exam'
    });
  }
};

const getExamResults = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = exams.find(e => e.id === parseInt(id));
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // In a real app, this would fetch results from a database
    // For now, return mock data
    const results = [
      {
        studentId: 1,
        studentName: 'John Doe',
        marks: 85,
        grade: 'A'
      },
      {
        studentId: 2,
        studentName: 'Jane Smith',
        marks: 92,
        grade: 'A+'
      }
    ];

    res.json({
      exam,
      results
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  getTeacherExams,
  getExam,
  updateExam,
  deleteExam,
  getExamResults
}; 