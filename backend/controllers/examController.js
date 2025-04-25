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
    const { 
      title, 
      subjectId, 
      classId, 
      date, 
      duration, 
      totalMarks, 
      instructions 
    } = req.body;
    
    // Validate required fields
    if (!title || !subjectId || !classId || !date || !duration || !totalMarks) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new exam
    const newExam = {
      id: exams.length + 1,
      title,
      subjectId,
      classId,
      date,
      duration,
      totalMarks,
      instructions: instructions || '',
      createdBy: req.user.id
    };

    exams.push(newExam);
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      subjectId, 
      classId, 
      date, 
      duration, 
      totalMarks, 
      instructions 
    } = req.body;
    
    const examIndex = exams.findIndex(e => e.id === parseInt(id));
    if (examIndex === -1) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is authorized to update this exam
    if (exams[examIndex].createdBy !== req.user.id && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    // Update exam
    exams[examIndex] = {
      ...exams[examIndex],
      title: title || exams[examIndex].title,
      subjectId: subjectId || exams[examIndex].subjectId,
      classId: classId || exams[examIndex].classId,
      date: date || exams[examIndex].date,
      duration: duration || exams[examIndex].duration,
      totalMarks: totalMarks || exams[examIndex].totalMarks,
      instructions: instructions || exams[examIndex].instructions
    };

    res.json(exams[examIndex]);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const examIndex = exams.findIndex(e => e.id === parseInt(id));
    
    if (examIndex === -1) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is authorized to delete this exam
    if (exams[examIndex].createdBy !== req.user.id && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    // Remove exam
    exams.splice(examIndex, 1);
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamResults
}; 