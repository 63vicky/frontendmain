const Result = require('../models/Result');
const Exam = require('../models/Exam');
const User = require('../models/User');

const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('examId', 'title subject')
      .populate('studentId', 'name email');

    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findById(id)
      .populate('examId', 'title subject')
      .populate('studentId', 'name email')
      .populate('createdBy', 'name');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Get result by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createResult = async (req, res) => {
  try {
    const { examId, studentId, marks, grade, feedback } = req.body;

    // Validate required fields
    if (!examId || !studentId || !marks || !grade) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create new result
    const newResult = new Result({
      examId,
      studentId,
      marks,
      grade,
      feedback: feedback || '',
      createdBy: req.user._id
    });

    await newResult.save();
    res.status(201).json(newResult);
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, grade, feedback } = req.body;

    // Find the result
    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is authorized to update this result
    if (result.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to update this result' });
    }

    // Update result
    result.marks = marks || result.marks;
    result.grade = grade || result.grade;
    result.feedback = feedback || result.feedback;

    await result.save();
    res.json(result);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the result
    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is authorized to delete this result
    if (result.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to delete this result' });
    }

    // Remove result
    await Result.findByIdAndDelete(id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all results for this student
    const studentResults = await Result.find({ studentId })
      .populate('examId', 'title subject')
      .populate('createdBy', 'name');

    res.json(studentResults);
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getClassPerformance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, startDate, endDate } = req.query;

    // Find all students in this class
    const students = await User.find({ role: 'student', class: classId });
    const studentIds = students.map(student => student._id);

    // Find all results for these students
    let resultsQuery = { studentId: { $in: studentIds } };

    // Add subject filter if provided
    if (subject) {
      const exams = await Exam.find({ subject });
      const examIds = exams.map(exam => exam._id);
      resultsQuery.examId = { $in: examIds };
    }

    // Add date filters if provided
    if (startDate && endDate) {
      resultsQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const results = await Result.find(resultsQuery);

    // Calculate statistics
    const marks = results.map(r => r.marks);
    const averageMarks = marks.length > 0 ?
      marks.reduce((a, b) => a + b, 0) / marks.length : 0;

    const highestMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const lowestMarks = marks.length > 0 ? Math.min(...marks) : 0;

    // Calculate pass percentage (assuming passing mark is 40)
    const passingMark = 40;
    const passCount = marks.filter(mark => mark >= passingMark).length;
    const passPercentage = marks.length > 0 ?
      (passCount / marks.length) * 100 : 0;

    // Calculate grade distribution
    const gradeDistribution = {
      'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
    };

    results.forEach(result => {
      gradeDistribution[result.grade] += 1;
    });

    const performance = {
      classId,
      totalStudents: students.length,
      totalResults: results.length,
      averageMarks,
      highestMarks,
      lowestMarks,
      passPercentage,
      gradeDistribution
    };

    res.json(performance);
  } catch (error) {
    console.error('Get class performance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Submit exam result by student
 * This endpoint allows students to submit their exam results
 */
const submitStudentResult = async (req, res) => {
  try {
    const { examId, answers, score, timeSpent } = req.body;

    // Validate required fields
    if (!examId || !answers || score === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure the user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit exam results' });
    }

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if the student has reached the maximum number of attempts
    const studentResults = await Result.find({
      examId: examId,
      studentId: req.user._id
    });

    const attemptCount = studentResults.length;

    // Check if student has reached maximum attempts
    if (exam.attempts && attemptCount >= exam.attempts.max) {
      return res.status(400).json({
        message: `Maximum attempts reached (${exam.attempts.max})`,
        existingResults: studentResults
      });
    }

    // Calculate the attempt number for this submission
    const attemptNumber = attemptCount + 1;

    // Calculate grade based on score
    // Assuming score is a percentage
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';

    // Create new result
    const newResult = new Result({
      examId,
      studentId: req.user._id,
      attemptNumber,
      marks: score,
      grade,
      feedback: '', // Will be filled by teacher later
      createdBy: req.user._id // Student is the creator of this result
    });

    await newResult.save();

    // No need to update the global attempts counter
    // We're tracking attempts per student instead

    res.status(201).json(newResult);
  } catch (error) {
    console.error('Submit student result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  getStudentResults,
  getClassPerformance,
  submitStudentResult
};