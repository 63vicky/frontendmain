const Result = require('../models/Result');
const Exam = require('../models/Exam');
const User = require('../models/User');

const getResults = async (req, res) => {
  try {
    // Fetch results with deep population of related fields
    const results = await Result.find()
      .populate({
        path: 'examId',
        select: 'title subject class startDate endDate createdAt createdBy',
        populate: [
          {
            path: 'class',
            select: 'name section'
          },
          {
            path: 'createdBy',
            select: 'name email'
          }
        ]
      })
      .populate({
        path: 'studentId',
        select: 'name email class rollNo',
        populate: {
          path: 'class',
          select: 'name section'
        }
      })
      .populate('createdBy', 'name email');

    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching result with ID:', id);

    // Validate that the ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid result ID format:', id);
      return res.status(400).json({ message: 'Invalid result ID format' });
    }

    try {
      const result = await Result.findById(id)
        .populate({
          path: 'examId',
          select: 'title subject class startDate endDate createdAt createdBy',
          populate: [
            {
              path: 'class',
              select: 'name section'
            },
            {
              path: 'createdBy',
              select: 'name email'
            }
          ]
        })
        .populate({
          path: 'studentId',
          select: 'name email class rollNo',
          populate: {
            path: 'class',
            select: 'name section'
          }
        })
        .populate('createdBy', 'name email');

      if (!result) {
        console.error('Result not found with ID:', id);

        // Try to find if there are any results for this user
        if (req.user && req.user._id) {
          const userResults = await Result.find({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5);

          if (userResults && userResults.length > 0) {
            console.log('Found recent results for user:', userResults.map(r => r._id));
            return res.status(404).json({
              message: 'Result not found',
              suggestedResults: userResults.map(r => ({
                _id: r._id,
                examId: r.examId,
                createdAt: r.createdAt
              }))
            });
          }
        }

        return res.status(404).json({ message: 'Result not found' });
      }

      console.log('Result found:', result._id);
      res.json(result);
    } catch (findError) {
      console.error('Error finding result:', findError);
      res.status(500).json({ message: 'Error finding result', error: findError.message });
    }
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
    const allResults = await Result.find({ studentId })
      .populate({
        path: 'examId',
        select: 'title subject class attempts startDate endDate createdAt createdBy',
        populate: [
          {
            path: 'class',
            select: 'name section'
          },
          {
            path: 'createdBy',
            select: 'name email'
          }
        ]
      })
      .populate('createdBy', 'name email');

    // Group results by examId and keep only the best score for each exam
    const examMap = new Map();

    // First, organize results by exam
    allResults.forEach(result => {
      const examId = result.examId?._id?.toString() || result.examId?.toString();

      if (!examMap.has(examId)) {
        examMap.set(examId, {
          bestResult: result,
          allAttempts: [result]
        });
      } else {
        const examData = examMap.get(examId);
        examData.allAttempts.push(result);

        // Compare scores to find the best result
        const currentBestScore = examData.bestResult.marks || 0;
        const newScore = result.marks || 0;

        if (newScore > currentBestScore) {
          examData.bestResult = result;
        }
      }
    });

    // Extract the best results for each exam
    const bestResults = Array.from(examMap.values()).map(examData => {
      // Add attempt information to the best result
      const bestResult = examData.bestResult;
      bestResult._doc.totalAttempts = examData.allAttempts.length;
      bestResult._doc.attemptDetails = examData.allAttempts.map(attempt => ({
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        marks: attempt.marks,
        createdAt: attempt.createdAt
      }));

      return bestResult;
    });

    res.json(bestResults);
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
      // Find the best result to return
      let bestResult = null;
      let bestScore = -1;

      for (const result of studentResults) {
        const score = result.marks || 0;
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      }

      return res.status(400).json({
        message: `Maximum attempts reached (${exam.attempts.max})`,
        existingResults: studentResults,
        bestResult: bestResult
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
      percentage: score, // Store the percentage score as well
      grade,
      feedback: '', // Will be filled by teacher later
      createdBy: req.user._id // Student is the creator of this result
    });

    try {
      // Save the result and log the ID for debugging
      const savedResult = await newResult.save();
      console.log('Result saved successfully with ID:', savedResult._id);

      // Verify the result was saved by fetching it back
      const verifiedResult = await Result.findById(savedResult._id);

      if (!verifiedResult) {
        console.error('Failed to verify saved result with ID:', savedResult._id);
        return res.status(500).json({ message: 'Failed to save result properly' });
      }

      console.log('Result verified successfully with ID:', verifiedResult._id);

      // Return the saved result with its ID
      res.status(201).json(savedResult);
    } catch (saveError) {
      console.error('Error saving result:', saveError);
      res.status(500).json({ message: 'Failed to save result', error: saveError.message });
    }
  } catch (error) {
    console.error('Submit student result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get results by exam ID
const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;

    // Validate that the ID is a valid MongoDB ObjectId
    if (!examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid exam ID format' });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get all results for this exam
    const examResults = await Result.find({ examId })
      .populate({
        path: 'studentId',
        select: 'name email class rollNo',
        populate: {
          path: 'class',
          select: 'name section'
        }
      })
      .populate('createdBy', 'name email');

    res.json(examResults);
  } catch (error) {
    console.error('Get exam results error:', error);
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
  submitStudentResult,
  getExamResults
};