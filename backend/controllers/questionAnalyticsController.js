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
    if (req.user.role === 'teacher' && exam.createdBy.toString() !== req.user._id.toString()) {
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
        answerDistribution: {},
        pointsEarned: 0,
        maxPointsPossible: 0,
        averagePoints: 0,
        fastestTime: Infinity,
        slowestTime: 0,
        medianTime: 0,
        timeDistribution: {
          fast: 0,    // < 25% of allocated time
          medium: 0,  // 25-75% of allocated time
          slow: 0     // > 75% of allocated time
        },
        attemptsOverTime: [] // Will store [date, success rate] pairs
      });
    });

    // Process all attempts to gather analytics
    attempts.forEach(attempt => {
      const attemptDate = new Date(attempt.endTime || attempt.startTime);

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

            // Track points
            const pointsForQuestion = answer.points || 0;
            questionData.pointsEarned += pointsForQuestion;

            // Get max points from question or default to points field
            const question = questions.find(q => q._id.toString() === questionId);
            const maxPoints = question ? question.points : 10;
            questionData.maxPointsPossible += maxPoints;

            // Track answer distribution
            const userAnswer = Array.isArray(answer.selectedOption)
              ? answer.selectedOption.join(',')
              : answer.selectedOption;

            if (!questionData.answerDistribution[userAnswer]) {
              questionData.answerDistribution[userAnswer] = 0;
            }
            questionData.answerDistribution[userAnswer]++;

            // Track attempts over time
            const dateStr = attemptDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const existingDateIndex = questionData.attemptsOverTime.findIndex(
              item => item[0] === dateStr
            );

            if (existingDateIndex >= 0) {
              // Update existing date entry
              const [date, successCount, totalCount] = questionData.attemptsOverTime[existingDateIndex];
              questionData.attemptsOverTime[existingDateIndex] = [
                date,
                answer.isCorrect ? successCount + 1 : successCount,
                totalCount + 1
              ];
            } else {
              // Add new date entry
              questionData.attemptsOverTime.push([
                dateStr,
                answer.isCorrect ? 1 : 0,
                1
              ]);
            }

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
            const timeSpent = timing.timeSpent || 0;

            questionData.totalTimeSpent += timeSpent;

            // Track fastest and slowest times
            if (timeSpent > 0) {
              questionData.fastestTime = Math.min(questionData.fastestTime, timeSpent);
              questionData.slowestTime = Math.max(questionData.slowestTime, timeSpent);

              // Add to time array for median calculation later
              if (!questionData.allTimes) {
                questionData.allTimes = [];
              }
              questionData.allTimes.push(timeSpent);

              // Categorize time spent
              const question = questions.find(q => q._id.toString() === questionId);
              if (question && question.time) {
                const allocatedTime = question.time;
                if (timeSpent < allocatedTime * 0.25) {
                  questionData.timeDistribution.fast++;
                } else if (timeSpent < allocatedTime * 0.75) {
                  questionData.timeDistribution.medium++;
                } else {
                  questionData.timeDistribution.slow++;
                }
              }
            }

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

      // Calculate average points
      question.averagePoints = question.totalAttempts > 0
        ? Math.round((question.pointsEarned / question.totalAttempts) * 10) / 10
        : 0;

      // Calculate difficulty rating based on success rate
      // Lower success rate = higher difficulty
      question.difficultyRating = question.totalAttempts > 0
        ? Math.round(5 - ((question.successRate / 100) * 5))
        : 3; // Default to medium difficulty (3/5)

      // Calculate median time
      if (question.allTimes && question.allTimes.length > 0) {
        const sortedTimes = [...question.allTimes].sort((a, b) => a - b);
        const midIndex = Math.floor(sortedTimes.length / 2);
        question.medianTime = sortedTimes.length % 2 === 0
          ? Math.round((sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2)
          : sortedTimes[midIndex];

        // Remove raw time data to reduce payload size
        delete question.allTimes;
      }

      // Fix infinity value for fastestTime if no attempts
      if (question.fastestTime === Infinity) {
        question.fastestTime = 0;
      }

      // Convert attemptsOverTime to success rate percentages
      question.successRateOverTime = question.attemptsOverTime.map(([date, success, total]) => {
        const rate = total > 0 ? Math.round((success / total) * 100) : 0;
        return [date, rate];
      });

      // Sort by date
      question.successRateOverTime.sort((a, b) => new Date(a[0]) - new Date(b[0]));

      // Remove raw data
      delete question.attemptsOverTime;

      questionAnalytics.push(question);
    });

    // Sort questions by their position in the exam
    const sortedQuestions = questionAnalytics.sort((a, b) => {
      const indexA = exam.questions.findIndex(q => q.toString() === a.id.toString());
      const indexB = exam.questions.findIndex(q => q.toString() === b.id.toString());
      return indexA - indexB;
    });

    // Calculate overall exam analytics
    const overallAnalytics = {
      totalQuestions: sortedQuestions.length,
      averageSuccessRate: sortedQuestions.length > 0
        ? Math.round(sortedQuestions.reduce((sum, q) => sum + q.successRate, 0) / sortedQuestions.length)
        : 0,
      averageTimePerQuestion: sortedQuestions.length > 0
        ? Math.round(sortedQuestions.reduce((sum, q) => sum + q.averageTimeSpent, 0) / sortedQuestions.length)
        : 0,
      difficultyDistribution: {
        easy: sortedQuestions.filter(q => q.difficultyRating <= 2).length,
        medium: sortedQuestions.filter(q => q.difficultyRating > 2 && q.difficultyRating < 4).length,
        hard: sortedQuestions.filter(q => q.difficultyRating >= 4).length
      },
      typeDistribution: {}
    };

    // Calculate type distribution
    sortedQuestions.forEach(q => {
      if (!overallAnalytics.typeDistribution[q.type]) {
        overallAnalytics.typeDistribution[q.type] = 0;
      }
      overallAnalytics.typeDistribution[q.type]++;
    });

    res.status(200).json({
      success: true,
      data: {
        examId: exam._id,
        examTitle: exam.title,
        subject: exam.subject,
        totalAttempts: attempts.length,
        questions: sortedQuestions,
        overallAnalytics
      }
    });
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

    // Get the exam
    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      console.log(`Exam not found: ${attempt.examId}`);
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    console.log(`Found exam: ${exam.title}`);

    // Get question IDs from the exam
    let questionIds = [];

    // Handle different exam schema formats
    if (exam.questions && Array.isArray(exam.questions)) {
      // Direct array of question IDs or objects
      questionIds = exam.questions.map(q => {
        // Handle both string IDs and question objects with _id
        return typeof q === 'string' ? q : q._id ? q._id.toString() : q.toString();
      });
    } else {
      // If questions aren't in the exam, try to find them from the attempt answers
      console.log('No questions found in exam, extracting from attempt answers');
      if (attempt.answers && Array.isArray(attempt.answers)) {
        questionIds = attempt.answers.map(a => a.questionId.toString());
      }
    }

    if (questionIds.length === 0) {
      console.log('No question IDs found for this exam/attempt');
      return res.status(200).json({
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
          questions: []
        }
      });
    }

    console.log(`Found ${questionIds.length} question IDs`);

    // Get all questions for this exam
    const questions = await Question.find({
      _id: { $in: questionIds }
    });

    console.log(`Retrieved ${questions.length} questions from database`);

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

        // Get question data from map or create a placeholder if not found
        let questionData;
        if (questionMap.has(questionId)) {
          questionData = questionMap.get(questionId);
        } else {
          // Create a placeholder for missing questions
          console.log(`Question ${questionId} not found in database, creating placeholder`);
          questionData = {
            id: questionId,
            text: `Question ${questionId} (not found)`,
            type: 'unknown',
            difficulty: 'Medium',
            points: answer.points || 10,
            correctAnswer: '',
            options: []
          };
        }

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
      });
    }

    console.log(`Processed ${questionAnalytics.length} questions for analytics`);

    // Sort questions by their position in the exam if possible
    let sortedQuestions = questionAnalytics;

    if (exam.questions && Array.isArray(exam.questions)) {
      try {
        sortedQuestions = questionAnalytics.sort((a, b) => {
          const indexA = exam.questions.findIndex(q => {
            const qId = typeof q === 'string' ? q : q._id ? q._id.toString() : q.toString();
            return qId === a.id.toString();
          });
          const indexB = exam.questions.findIndex(q => {
            const qId = typeof q === 'string' ? q : q._id ? q._id.toString() : q.toString();
            return qId === b.id.toString();
          });
          return indexA - indexB;
        });
      } catch (sortError) {
        console.error('Error sorting questions:', sortError);
        // Keep the original order if sorting fails
      }
    }

    // Calculate class statistics and enhanced analytics
    let classStats = [];
    let examAnalytics = {};
    let studentPerformance = {};

    try {
      // Find other attempts for the same exam
      const otherAttempts = await ExamAttempt.find({
        examId: attempt.examId,
        status: 'completed'
      }).populate('studentId', 'name');

      const currentAttemptIndex = otherAttempts.findIndex(a => a._id.toString() === attempt._id.toString());
      const currentAttempt = currentAttemptIndex >= 0 ? otherAttempts[currentAttemptIndex] : attempt;
      const otherStudentAttempts = otherAttempts.filter(a => a._id.toString() !== attempt._id.toString());

      console.log(`Found ${otherAttempts.length} total attempts (${otherStudentAttempts.length} from other students)`);

      // Get all attempts by the same student for this exam
      const studentAttempts = otherAttempts.filter(a =>
        a.studentId && attempt.studentId &&
        a.studentId.toString() === attempt.studentId.toString()
      );

      console.log(`Found ${studentAttempts.length} attempts by the same student`);

      // Calculate student performance metrics
      if (studentAttempts.length > 0) {
        // Sort attempts by date
        studentAttempts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        // Calculate improvement over time
        const scores = studentAttempts.map(a => a.percentage || 0);
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        const improvement = lastScore - firstScore;

        // Find best attempt
        const bestAttempt = studentAttempts.reduce((best, current) =>
          (current.percentage || 0) > (best.percentage || 0) ? current : best,
          studentAttempts[0]
        );

        // Calculate average time per question
        const avgTimePerQuestion = studentAttempts.map(a => {
          if (a.questionTimings && a.questionTimings.length > 0) {
            const totalTime = a.questionTimings.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
            return totalTime / a.questionTimings.length;
          }
          return a.timeSpent ? a.timeSpent / (a.answers?.length || 1) : 0;
        });

        // Store student performance data
        studentPerformance = {
          totalAttempts: studentAttempts.length,
          attemptDates: studentAttempts.map(a => a.startTime),
          scores: scores,
          improvement: improvement,
          bestScore: bestAttempt.percentage || 0,
          bestAttemptId: bestAttempt._id,
          averageTimePerQuestion: avgTimePerQuestion,
          currentAttemptRank: currentAttemptIndex + 1,
          isPersonalBest: currentAttempt._id.toString() === bestAttempt._id.toString()
        };
      }

      // Calculate overall exam analytics
      if (otherAttempts.length > 0) {
        // Calculate average score
        const allScores = otherAttempts.map(a => a.percentage || 0);
        const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

        // Calculate score distribution
        const scoreRanges = {
          excellent: allScores.filter(s => s >= 90).length,
          good: allScores.filter(s => s >= 75 && s < 90).length,
          satisfactory: allScores.filter(s => s >= 60 && s < 75).length,
          needsImprovement: allScores.filter(s => s < 60).length
        };

        // Calculate completion time statistics
        const completionTimes = otherAttempts
          .filter(a => a.timeSpent && a.timeSpent > 0)
          .map(a => a.timeSpent);

        const avgCompletionTime = completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
          : 0;

        // Calculate student's percentile
        if (currentAttempt.percentage !== undefined) {
          const betterScores = allScores.filter(s => s > currentAttempt.percentage).length;
          const percentile = Math.round(((otherAttempts.length - betterScores) / otherAttempts.length) * 100);

          examAnalytics.studentPercentile = percentile;
        }

        // Store exam analytics data
        examAnalytics = {
          ...examAnalytics,
          totalAttempts: otherAttempts.length,
          averageScore: avgScore,
          highestScore: Math.max(...allScores),
          lowestScore: Math.min(...allScores),
          medianScore: allScores.sort()[Math.floor(allScores.length / 2)],
          scoreDistribution: scoreRanges,
          averageCompletionTime: avgCompletionTime
        };

        // Create a map to store class statistics by question
        const classStatsMap = new Map();

        // Process all attempts to gather statistics
        otherStudentAttempts.forEach(otherAttempt => {
          if (otherAttempt.answers && Array.isArray(otherAttempt.answers)) {
            otherAttempt.answers.forEach(answer => {
              const questionId = answer.questionId.toString();

              if (!classStatsMap.has(questionId)) {
                classStatsMap.set(questionId, {
                  totalAttempts: 0,
                  correctAttempts: 0,
                  totalTimeSpent: 0,
                  timeSpentCount: 0,
                  pointsEarned: 0,
                  maxPoints: 0
                });
              }

              const stats = classStatsMap.get(questionId);
              stats.totalAttempts++;

              if (answer.isCorrect) {
                stats.correctAttempts++;
              }

              // Track points
              stats.pointsEarned += answer.points || 0;
              stats.maxPoints += answer.points || 10; // Default to 10 if not specified

              // Add timing data if available
              if (otherAttempt.questionTimings && Array.isArray(otherAttempt.questionTimings)) {
                const timingData = otherAttempt.questionTimings.find(
                  t => t.questionId.toString() === questionId
                );
                if (timingData && timingData.timeSpent) {
                  stats.totalTimeSpent += timingData.timeSpent;
                  stats.timeSpentCount++;
                }
              }

              classStatsMap.set(questionId, stats);
            });
          }
        });

        // Convert map to array and calculate averages
        classStats = Array.from(classStatsMap.entries()).map(([questionId, stats]) => {
          return {
            questionId,
            successRate: stats.totalAttempts > 0
              ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100)
              : 0,
            averageTime: stats.timeSpentCount > 0
              ? Math.round(stats.totalTimeSpent / stats.timeSpentCount)
              : 0,
            averagePoints: stats.totalAttempts > 0
              ? Math.round((stats.pointsEarned / stats.totalAttempts) * 10) / 10
              : 0,
            difficulty: stats.totalAttempts > 0
              ? 5 - Math.round((stats.correctAttempts / stats.totalAttempts) * 5)
              : 3 // Default to medium difficulty
          };
        });
      }
    } catch (statsError) {
      console.error('Error calculating analytics:', statsError);
      // Continue without analytics
    }

    // Calculate additional metrics for the frontend
    const correctAnswers = sortedQuestions.filter(q => q.isCorrect).length;
    const totalQuestions = sortedQuestions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate total points earned and total possible points
    const pointsEarned = sortedQuestions.reduce((total, q) => {
      return total + (q.isCorrect ? (q.points || 0) : 0);
    }, 0);

    const totalPossiblePoints = sortedQuestions.reduce((total, q) => {
      return total + (q.points || 0);
    }, 0);

    // Calculate total time spent from questions if available
    let calculatedTimeSpent = 0;
    if (sortedQuestions.some(q => q.timeSpent !== undefined)) {
      calculatedTimeSpent = sortedQuestions.reduce((total, q) => {
        return total + (q.timeSpent || 0);
      }, 0);
    }

    // Use the calculated time spent if it's greater than the attempt's timeSpent
    // or if the attempt's timeSpent is not available
    const timeSpent = (calculatedTimeSpent > 0 && (!attempt.timeSpent || calculatedTimeSpent > attempt.timeSpent))
      ? calculatedTimeSpent
      : attempt.timeSpent || 0;

    // Get feedback if available
    const feedback = attempt.feedback || null;

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
        timeSpent: timeSpent, // Use the calculated timeSpent
        questions: sortedQuestions,
        classStats: classStats,
        examAnalytics: examAnalytics,
        studentPerformance: studentPerformance,
        // Additional metrics for the frontend
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        accuracy: accuracy,
        pointsEarned: pointsEarned,
        totalPossiblePoints: totalPossiblePoints,
        feedback: feedback
      }
    });
  } catch (error) {
    console.error('Error fetching student question analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student question analytics',
      message: error.message
    });
  }
};
