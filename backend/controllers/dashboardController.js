const User = require('../models/User');
const Exam = require('../models/Exam_updated');
const Result = require('../models/Result');

// Get principal dashboard statistics
const getPrincipalStats = async (req, res) => {
  try {
    const [
      totalTeachers,
      totalStudents,
      activeExams,
      completedExams,
      totalClasses,
      totalSubjects
    ] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Exam.countDocuments({ status: 'active' }),
      Exam.countDocuments({ status: 'completed' }),
      Exam.distinct('class'),
      Exam.distinct('subject')
    ]);

    res.json({
      totalTeachers,
      totalStudents,
      activeExams,
      completedExams,
      totalClasses: totalClasses.length,
      totalSubjects: totalSubjects.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get recent exams for principal
const getPrincipalRecentExams = async (req, res) => {
  try {
    const recentExams = await Exam.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .populate('class', 'name section') // Populate class data
      .lean();

    const formattedExams = recentExams.map(exam => {
      // Handle both string and ObjectId class references
      let classInfo;
      if (typeof exam.class === 'object' && exam.class !== null) {
        // If class is populated as an object
        classInfo = `${exam.class.name} ${exam.class.section || ''}`.trim();
      } else {
        // If class is still a string (legacy data)
        classInfo = exam.class;
      }

      return {
        id: exam._id,
        name: exam.title,
        date: exam.createdAt,
        status: exam.status,
        subject: exam.subject,
        class: classInfo,
        teacherName: exam.createdBy?.name
      };
    });

    res.json(formattedExams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent exams', error: error.message });
  }
};

// Get class performance data
const getClassPerformance = async (req, res) => {
  try {
    const classPerformance = await Result.aggregate([
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      {
        $group: {
          _id: '$exam.class',
          totalStudents: { $addToSet: '$studentId' },
          totalScore: { $sum: '$marks' },
          totalPassed: {
            $sum: { $cond: [{ $gte: ['$marks', 40] }, 1, 0] }
          },
          count: { $sum: 1 },
          subjectScores: {
            $push: {
              subject: '$exam.subject',
              score: '$marks'
            }
          }
        }
      },
      // Add lookup to get class details
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      {
        $project: {
          // Format class name with section if available
          class: {
            $cond: {
              if: { $gt: [{ $size: '$classDetails' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$classDetails.name', 0] },
                  ' ',
                  { $arrayElemAt: ['$classDetails.section', 0] }
                ]
              },
              else: { $toString: '$_id' } // Fallback to ID as string if class not found
            }
          },
          classId: '$_id', // Keep the original ID for reference
          totalStudents: { $size: '$totalStudents' },
          score: { $round: [ {$divide: ['$totalScore', '$count'] }, 2]},
          passPercentage: { $multiply: [{ $divide: ['$totalPassed', '$count'] }, 100] },
          subjectScores: {
            $map: {
              input: '$subjectScores',
              as: 'score',
              in: {
                subject: '$$score.subject',
                averageScore: { $avg: '$$score.score' }
              }
            }
          }
        }
      }
    ]);

    res.json(classPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class performance', error: error.message });
  }
};

// Get teacher dashboard statistics
const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const [
      totalStudents,
      activeExams,
      completedExams,
      upcomingExams
    ] = await Promise.all([
      User.countDocuments({ role: 'student', class: { $in: req.user.classes } }),
      Exam.countDocuments({ createdBy: teacherId, status: 'active' }),
      Exam.countDocuments({ createdBy: teacherId, status: 'completed' }),
      Exam.countDocuments({ createdBy: teacherId, status: 'scheduled' })
    ]);

    res.json({
      totalStudents,
      activeExams,
      completedExams,
      upcomingExams
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher stats', error: error.message });
  }
};

// Get recent exams for teacher
const getTeacherRecentExams = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const recentExams = await Exam.find({ createdBy: teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('class', 'name section')
      .lean();

    const examsWithStats = await Promise.all(recentExams.map(async exam => {
      // Handle both string and ObjectId class references for querying students
      let classQuery;
      let classDisplay;

      if (typeof exam.class === 'object' && exam.class !== null) {
        // If class is populated as an object
        classQuery = exam.class._id;
        classDisplay = `${exam.class.name} ${exam.class.section || ''}`.trim();
      } else {
        // If class is still a string (legacy data)
        classQuery = exam.class;
        classDisplay = exam.class;
      }

      const totalStudents = await User.countDocuments({ role: 'student', class: classQuery });
      const completedStudents = await Result.countDocuments({ examId: exam._id });

      return {
        id: exam._id,
        name: exam.title,
        date: exam.createdAt,
        status: exam.status,
        subject: exam.subject,
        class: classDisplay,
        totalStudents,
        completedStudents
      };
    }));

    res.json(examsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher recent exams', error: error.message });
  }
};

// Get student dashboard statistics
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Student's class is used to find relevant exams
    const studentClass = student.class;

    const [
      totalExams,
      completedExams,
      upcomingExams,
      averageScore
    ] = await Promise.all([
      Exam.countDocuments({ class: studentClass }),
      Result.countDocuments({ studentId, status: 'completed' }),
      Exam.countDocuments({ class: studentClass, status: 'scheduled' }),
      Result.aggregate([
        { $match: { studentId } },
        { $group: { _id: null, average: { $avg: '$marks' } } }
      ])
    ]);

    res.json({
      totalExams,
      completedExams,
      upcomingExams,
      averageScore: averageScore[0]?.average || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student stats', error: error.message });
  }
};

// Get recent exams for student
const getStudentRecentExams = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find exams for this student's class
    const recentExams = await Exam.find({ class: student.class })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('class', 'name section')
      .lean();

    const examsWithResults = await Promise.all(recentExams.map(async exam => {
      const result = await Result.findOne({ examId: exam._id, studentId });

      // Handle both string and ObjectId class references
      let classInfo;
      if (typeof exam.class === 'object' && exam.class !== null) {
        // If class is populated as an object
        classInfo = `${exam.class.name} ${exam.class.section || ''}`.trim();
      } else {
        // If class is still a string (legacy data)
        classInfo = exam.class;
      }

      return {
        id: exam._id,
        name: exam.title,
        date: exam.createdAt,
        status: exam.status,
        subject: exam.subject,
        class: classInfo,
        marks: result?.marks || null,
        grade: result?.grade || null,
        feedback: result?.feedback || null
      };
    }));

    res.json(examsWithResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student recent exams', error: error.message });
  }
};

module.exports = {
  getPrincipalStats,
  getPrincipalRecentExams,
  getClassPerformance,
  getTeacherStats,
  getTeacherRecentExams,
  getStudentStats,
  getStudentRecentExams
};