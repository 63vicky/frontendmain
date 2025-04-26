const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const User = require('../models/User');

// Get exam analytics for principal dashboard
exports.getExamAnalytics = async (req, res) => {
  try {
    const { class: classFilter, subject: subjectFilter } = req.query;

    // Build query based on filters
    const query = {};
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    if (subjectFilter && subjectFilter !== 'all') {
      query.subject = subjectFilter;
    }

    // Get all exams with filters
    const exams = await Exam.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Get exam attempts for score calculations
    const examIds = exams.map(exam => exam._id);
    const attempts = await ExamAttempt.find({
      examId: { $in: examIds },
      status: 'completed'
    });

    // Calculate statistics for each exam
    const examStats = exams.map(exam => {
      const examAttempts = attempts.filter(attempt => 
        attempt.examId.toString() === exam._id.toString()
      );

      const scores = examAttempts.map(attempt => attempt.percentage);
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

      return {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        class: exam.class,
        teacher: exam.createdBy.name,
        students: examAttempts.length,
        avgScore: Math.round(avgScore),
        highestScore: Math.round(highestScore),
        lowestScore: Math.round(lowestScore),
        status: exam.status,
        startDate: exam.startDate,
        endDate: exam.endDate,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks
      };
    });

    // Calculate overall statistics
    const activeExams = examStats.filter(exam => 
      exam.status === 'active' || exam.status === 'scheduled'
    );
    const completedExams = examStats.filter(exam => 
      exam.status === 'completed'
    );

    const overallStats = {
      totalExams: examStats.length,
      activeExams: activeExams.length,
      completedExams: completedExams.length,
      averageScore: examStats.length > 0
        ? Math.round(examStats.reduce((acc, exam) => acc + exam.avgScore, 0) / examStats.length)
        : 0
    };

    // Get unique classes and subjects for filters
    const classes = [...new Set(exams.map(exam => exam.class))];
    const subjects = [...new Set(exams.map(exam => exam.subject))];

    res.json({
      exams: examStats,
      stats: overallStats,
      filters: {
        classes,
        subjects
      }
    });
  } catch (error) {
    console.error('Exam analytics error:', error);
    res.status(500).json({ message: error.message });
  }
}; 