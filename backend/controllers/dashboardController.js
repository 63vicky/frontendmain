const User = require('../models/User');
const Exam = require('../models/Exam');
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
      .lean();

    const formattedExams = recentExams.map(exam => ({
      id: exam._id,
      name: exam.title,
      date: exam.createdAt,
      status: exam.status,
      subject: exam.subject,
      class: exam.class,
      teacherName: exam.createdBy?.name
    }));

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
      {
        $project: {
          class: '$_id',
          totalStudents: { $size: '$totalStudents' },
          score: { $divide: ['$totalScore', '$count'] },
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
      .populate('class', 'name')
      .lean();

    const examsWithStats = await Promise.all(recentExams.map(async exam => {
      const totalStudents = await User.countDocuments({ role: 'student', class: exam.class });
      const completedStudents = await Result.countDocuments({ examId: exam._id });
      
      return {
        id: exam._id,
        name: exam.title,
        date: exam.createdAt,
        status: exam.status,
        subject: exam.subject,
        class: exam.class.name,
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
    
    const [
      totalExams,
      completedExams,
      upcomingExams,
      averageScore
    ] = await Promise.all([
      Exam.countDocuments({ class: student.class }),
      Result.countDocuments({ studentId, status: 'completed' }),
      Exam.countDocuments({ class: student.class, status: 'scheduled' }),
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
    
    const recentExams = await Exam.find({ class: student.class })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const examsWithResults = await Promise.all(recentExams.map(async exam => {
      const result = await Result.findOne({ examId: exam._id, studentId });
      return {
        id: exam._id,
        name: exam.title,
        date: exam.createdAt,
        status: exam.status,
        subject: exam.subject,
        class: exam.class,
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