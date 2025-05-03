const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam_updated');

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
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view analytics for exams you created'
      });
    }
    
    // Get all completed attempts for this exam
    const attempts = await ExamAttempt.find({
      examId: examId,
      status: 'completed'
    }).populate('studentId', 'name');
    
    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          examTitle: exam.title,
          totalAttempts: 0,
          questions: []
        }
      });
    }
    
    // Get all questions for this exam
    const questions = await Question.find({
      _id: { $in: exam.questions }
    });
    
    // Create a map of question IDs to question details
    const questionMap = new Map();
    questions.forEach(question => {
      questionMap.set(question._id.toString(), {
        id: question._id,
        text: question.text,
        type: question.type,
        difficulty: question.difficulty || 'Medium',
        points: question.points,
        correctAnswer: question.correctAnswer,
        options: question.options || [],
        totalAttempts: 0,
        correctAttempts: 0,
        averageTimeSpent: 0,
        totalTimeSpent: 0,
        successRate: 0,
        difficultyRating: 0,
        answerDistribution: {}
      });
    });
    
    // Process all attempts to gather analytics
    attempts.forEach(attempt => {
      // Process answers
      if (attempt.answers && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(answer => {
          const questionId = answer.questionId.toString();
          if (questionMap.has(questionId)) {
            const questionData = questionMap.get(questionId);
            questionData.totalAttempts++;
            
            if (answer.isCorrect) {
              questionData.correctAttempts++;
            }
            
            // Track answer distribution
            const userAnswer = Array.isArray(answer.selectedOption) 
              ? answer.selectedOption.join(',') 
              : answer.selectedOption;
              
            if (!questionData.answerDistribution[userAnswer]) {
              questionData.answerDistribution[userAnswer] = 0;
            }
            questionData.answerDistribution[userAnswer]++;
            
            questionMap.set(questionId, questionData);
          }
        });
      }
      
      // Process question timings
      if (attempt.questionTimings && Array.isArray(attempt.questionTimings)) {
        attempt.questionTimings.forEach(timing => {
          const questionId = timing.questionId.toString();
          if (questionMap.has(questionId)) {
            const questionData = questionMap.get(questionId);
            questionData.totalTimeSpent += timing.timeSpent;
            questionMap.set(questionId, questionData);
          }
        });
      }
    });
    
    // Calculate final metrics
    const questionAnalytics = [];
    questionMap.forEach(question => {
      // Calculate success rate
      question.successRate = question.totalAttempts > 0 
        ? Math.round((question.correctAttempts / question.totalAttempts) * 100) 
        : 0;
        
      // Calculate average time spent
      question.averageTimeSpent = question.totalAttempts > 0 
        ? Math.round(question.totalTimeSpent / question.totalAttempts) 
        : 0;
        
      // Calculate difficulty rating based on success rate
      // Lower success rate = higher difficulty
      question.difficultyRating = question.totalAttempts > 0 
        ? Math.round(5 - ((question.successRate / 100) * 5)) 
        : 3; // Default to medium difficulty (3/5)
        
      questionAnalytics.push(question);
    });
    
    // Sort questions by their position in the exam
    const sortedQuestions = questionAnalytics.sort((a, b) => {
      const indexA = exam.questions.findIndex(q => q.toString() === a.id.toString());
      const indexB = exam.questions.findIndex(q => q.toString() === b.id.toString());
      return indexA - indexB;
    });
    
    res.status(200).json({
      success: true,
      data: {
        examId: exam._id,
        examTitle: exam.title,
        subject: exam.subject,
        totalAttempts: attempts.length,
        questions: sortedQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching question analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question analytics'
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
    const { attemptId } = req.params;
    
    // Find the attempt
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Attempt not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'student' && attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view your own attempts'
      });
    }
    
    // Get the exam
    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    
    // Get all questions for this exam
    const questions = await Question.find({
      _id: { $in: exam.questions }
    });
    
    // Create a map of question IDs to question details
    const questionMap = new Map();
    questions.forEach(question => {
      questionMap.set(question._id.toString(), {
        id: question._id,
        text: question.text,
        type: question.type,
        difficulty: question.difficulty || 'Medium',
        points: question.points,
        correctAnswer: question.correctAnswer,
        options: question.options || []
      });
    });
    
    // Process student's answers
    const questionAnalytics = [];
    if (attempt.answers && Array.isArray(attempt.answers)) {
      attempt.answers.forEach(answer => {
        const questionId = answer.questionId.toString();
        if (questionMap.has(questionId)) {
          const questionData = questionMap.get(questionId);
          
          // Find timing data for this question
          let timeSpent = 0;
          if (attempt.questionTimings && Array.isArray(attempt.questionTimings)) {
            const timingData = attempt.questionTimings.find(
              t => t.questionId.toString() === questionId
            );
            if (timingData) {
              timeSpent = timingData.timeSpent;
            }
          }
          
          questionAnalytics.push({
            ...questionData,
            isCorrect: answer.isCorrect,
            userAnswer: answer.selectedOption,
            timeSpent: timeSpent,
            points: answer.points || 0
          });
        }
      });
    }
    
    // Sort questions by their position in the exam
    const sortedQuestions = questionAnalytics.sort((a, b) => {
      const indexA = exam.questions.findIndex(q => q.toString() === a.id.toString());
      const indexB = exam.questions.findIndex(q => q.toString() === b.id.toString());
      return indexA - indexB;
    });
    
    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        examId: exam._id,
        examTitle: exam.title,
        studentId: attempt.studentId,
        score: attempt.score,
        percentage: attempt.percentage,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        timeSpent: attempt.timeSpent,
        questions: sortedQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching student question analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student question analytics'
    });
  }
};
