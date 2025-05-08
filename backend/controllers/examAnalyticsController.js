const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');

// Get exam analytics for principal dashboard
exports.getExamAnalytics = async (req, res) => {
  try {
    const { class: classFilter, subject: subjectFilter } = req.query;

    // Build query based on filters
    const query = {};
    if (classFilter && classFilter !== 'all') {
      // Check if classFilter is a valid ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(classFilter)) {
        // It's an ObjectId, use it to match the class field
        query.class = classFilter;
      } else {
        // It might be a class name, handle as string
        query.class = classFilter;
      }
    }
    if (subjectFilter && subjectFilter !== 'all') {
      query.subject = subjectFilter;
    }

    // Get all exams with filters
    const exams = await Exam.find(query)
      .populate('createdBy', 'name')
      .populate('class', 'name section') // Populate class data
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

      // Format class name based on whether it's a string or object
      let classDisplay;
      let classId;

      if (typeof exam.class === 'object' && exam.class !== null) {
        // If class is populated as an object
        classDisplay = `${exam.class.name} ${exam.class.section || ''}`.trim();
        classId = exam.class._id.toString();
      } else {
        // If class is still a string (legacy data)
        classDisplay = exam.class;
        classId = exam.class; // Use the string as ID for legacy data
      }

      return {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        class: classDisplay,
        classId: classId,
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

    // Get all exams (without filters) to extract all available classes and subjects
    let allExams = exams;

    // If we're filtering, we need to get all exams to build complete filter options
    if (classFilter !== 'all' || subjectFilter !== 'all') {
      allExams = await Exam.find({})
        .populate('class', 'name section')
        .populate('createdBy', 'name');
    }

    // Create a map of class IDs to display names from exams
    const classesMap = {};

    // Add classes from all exams
    allExams.forEach(exam => {
      if (typeof exam.class === 'object' && exam.class !== null) {
        const classId = exam.class._id.toString();
        const displayName = `${exam.class.name} ${exam.class.section || ''}`.trim();
        classesMap[classId] = displayName;
      } else if (typeof exam.class === 'string') {
        // For legacy data where class is stored as a string
        classesMap[exam.class] = exam.class;
      }
    });

    // Convert to array of objects with id and name
    const classes = Object.entries(classesMap).map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    // Get all unique subjects from all exams and sort alphabetically
    const subjects = [...new Set(allExams.map(exam => exam.subject))].sort();

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