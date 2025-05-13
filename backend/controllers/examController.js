const Exam = require('../models/Exam_updated');
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

// Function to update exam status based on dates
const updateExamStatus = async (exam) => {
  const now = new Date();
  let newStatus = exam.status;

  if (exam.status === 'draft') {
    if (now >= exam.startDate) {
      newStatus = 'active';
    } else if (now < exam.startDate) {
      newStatus = 'scheduled';
    }
  } else if (exam.status === 'scheduled' && now >= exam.startDate) {
    newStatus = 'active';
  } else if (exam.status === 'active' && now > exam.endDate) {
    newStatus = 'completed';
  }

  if (newStatus !== exam.status) {
    exam.status = newStatus;
    await exam.save();
  }

  return exam;
};

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
    const { title, subject, class: classId, chapter, duration, startDate, endDate, attempts } = req.body;

    // Validate exam data
    const validationError = validateExam(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Create new exam
    const exam = new Exam({
      title,
      subject,
      class: classId, // Now expecting a class ObjectId
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
    let query = {};

    // If user is a teacher:
    // - Show exams created by the teacher
    // - Show exams created by principals (shared with all teachers)
    // If user is a principal, show all exams
    if (req.user.role === 'teacher') {
      // Find all principal user IDs
      const User = require('../models/User');
      const principals = await User.find({ role: 'principal' }).select('_id');
      const principalIds = principals.map(p => p._id);

      // Query for exams created by this teacher OR by any principal
      query = {
        $or: [
          { createdBy: req.user._id },
          { createdBy: { $in: principalIds } }
        ]
      };
    }

    const exams = await Exam.find(query)
      .populate('class', 'name section') // Populate class data
      .populate('createdBy', 'name role') // Populate creator info with role
      .sort({ createdAt: -1 });

    // Update status for each exam
    const updatedExams = await Promise.all(
      exams.map(exam => updateExamStatus(exam))
    );

    res.status(200).json({
      success: true,
      data: updatedExams
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
      .populate('questions')
      .populate('class', 'name section'); // Populate class data

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
    const { title, subject, class: classId, chapter, duration, startDate, endDate, attempts } = req.body;

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

    // Check if user is the creator of the exam or a principal
    if (req.user.role !== 'principal' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this exam'
      });
    }

    // Update exam fields
    exam.title = title;
    exam.subject = subject;
    exam.class = classId; // Now expecting a class ObjectId
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

    // Check if user is the creator of the exam or a principal
    if (req.user.role !== 'principal' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this exam'
      });
    }

    await exam.deleteOne();

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

// Get exams by class ID
const getExamsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const studentId = req.user._id;

    // Find all exams for this class
    const exams = await Exam.find({ class: classId })
      .populate('class', 'name section') // Populate class data
      .sort({ startDate: 1 });

    // Update status for each exam
    const updatedExams = await Promise.all(
      exams.map(async exam => {
        // Update the exam status
        const updatedExam = await updateExamStatus(exam);

        // If the user is a student, get their attempts for this exam
        if (req.user.role === 'student') {
          const ExamAttempt = require('../models/ExamAttempt');
          const attempts = await ExamAttempt.find({
            examId: exam._id,
            studentId: studentId,
            status: 'completed'
          });

          console.log(`Student ${studentId} has ${attempts.length} attempts for exam ${exam._id}`);

          // Convert to plain object to add custom properties
          const examObj = updatedExam.toObject();

          // Add student attempts count to the exam object
          examObj.studentAttempts = attempts.length;

          return examObj;
        }

        return updatedExam;
      })
    );

    res.status(200).json({
      success: true,
      data: updatedExams
    });
  } catch (error) {
    console.error('Error fetching class exams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class exams'
    });
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
  getExamResults,
  getExamsByClass
};