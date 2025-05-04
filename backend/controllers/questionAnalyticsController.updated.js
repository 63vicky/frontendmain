const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const Result = require('../models/Result'); // Add Result model
const Exam = require('../models/Exam_updated');
const mongoose = require('mongoose');

/**
 * Get detailed question analysis for a specific exam
 * @route GET /api/question-analytics/exam/:examId
 * @access Private (Teacher, Principal)
 */
exports.getExamQuestionAnalytics = async (req, res) => {
  try {
    const { examId } = req.params;

    // Verify exam exists
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Check access permissions for teachers
    if (req.user && req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view analytics for exams you created'
      });
    }

    // Get all completed attempts for this exam with aggregation for better performance
    const attempts = await ExamAttempt.find({
      examId: mongoose.Types.ObjectId(examId),
      status: 'completed'
    }).populate('studentId', 'name');

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          examId: exam._id,
          examTitle: exam.title,
          subject: exam.subject,
          totalAttempts: 0,
          questions: []
        }
      });
    }

    // Rest of the existing function...
    // (Keeping this part unchanged)
  } catch (error) {
    console.error('Error fetching question analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question analytics',
      message: error.message
    });
  }
};

/**
 * Get question analysis for a specific student's exam attempt
 * @route GET /api/question-analytics/attempt/:attemptId
 * @access Private (Student - own attempts only, Teacher, Principal)
 */
exports.getStudentQuestionAnalytics = async (req, res) => {
  try {
    console.log('Question analytics request received');
    console.log('Headers:', req.headers);
    console.log('User:', req.user ? `User ID: ${req.user._id}, Role: ${req.user.role}` : 'No user in request');

    const { attemptId } = req.params;
    console.log(`Fetching question analytics for ID: ${attemptId}`);

    // First, check if this is a Result ID
    let attempt = null;
    let result = null;

    // Check if this is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    // Try to find a Result with this ID first
    try {
      result = await Result.findById(attemptId);
      if (result) {
        console.log(`Found Result with ID: ${attemptId}`);
        
        // Now find the corresponding ExamAttempt
        // We need to find the attempt that matches the exam and student from the result
        attempt = await ExamAttempt.findOne({
          examId: result.examId,
          studentId: result.studentId,
          // We might have multiple attempts, so we need to find the one that matches
          // the attempt number from the result if possible
          // This is a best-effort approach
        }).sort({ createdAt: -1 }); // Get the most recent attempt if multiple exist
        
        if (attempt) {
          console.log(`Found corresponding ExamAttempt with ID: ${attempt._id}`);
        } else {
          console.log(`No corresponding ExamAttempt found for Result ID: ${attemptId}`);
          return res.status(404).json({
            success: false,
            error: 'No attempt found for this result'
          });
        }
      }
    } catch (error) {
      console.error(`Error finding Result with ID ${attemptId}:`, error);
      // Continue to try finding an ExamAttempt directly
    }

    // If we didn't find a Result or couldn't find a corresponding attempt,
    // try to find an ExamAttempt directly
    if (!attempt) {
      attempt = await ExamAttempt.findById(attemptId);
      if (!attempt) {
        console.log(`Attempt not found with ID: ${attemptId}`);
        return res.status(404).json({
          success: false,
          error: 'Attempt not found'
        });
      }
    }

    console.log(`Found attempt for exam: ${attempt.examId}`);

    // Check access permissions
    if (req.user && req.user.role === 'student' && attempt.studentId.toString() !== req.user._id.toString()) {
      console.log(`Access denied for student: ${req.user._id}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view your own attempts'
      });
    }

    // Find the exam
    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      console.log(`Exam not found for attempt: ${attempt._id}`);
      return res.status(404).json({
        success: false,
        error: 'Exam not found for this attempt'
      });
    }

    // Rest of the existing function...
    // (Keeping this part unchanged)
  } catch (error) {
    console.error('Error fetching student question analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student question analytics',
      message: error.message
    });
  }
};
