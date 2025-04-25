// In a real app, this would be a database model
let results = [
  {
    id: 1,
    examId: 1,
    studentId: 1,
    marks: 85,
    grade: 'A',
    feedback: 'Good performance',
    createdBy: 1
  },
  {
    id: 2,
    examId: 1,
    studentId: 2,
    marks: 92,
    grade: 'A+',
    feedback: 'Excellent work',
    createdBy: 1
  }
];

const getResults = async (req, res) => {
  try {
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = results.find(r => r.id === parseInt(id));
    
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

    // Create new result
    const newResult = {
      id: results.length + 1,
      examId,
      studentId,
      marks,
      grade,
      feedback: feedback || '',
      createdBy: req.user.id
    };

    results.push(newResult);
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
    
    const resultIndex = results.findIndex(r => r.id === parseInt(id));
    if (resultIndex === -1) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is authorized to update this result
    if (results[resultIndex].createdBy !== req.user.id && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to update this result' });
    }

    // Update result
    results[resultIndex] = {
      ...results[resultIndex],
      marks: marks || results[resultIndex].marks,
      grade: grade || results[resultIndex].grade,
      feedback: feedback || results[resultIndex].feedback
    };

    res.json(results[resultIndex]);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const resultIndex = results.findIndex(r => r.id === parseInt(id));
    
    if (resultIndex === -1) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is authorized to delete this result
    if (results[resultIndex].createdBy !== req.user.id && req.user.role !== 'principal') {
      return res.status(403).json({ message: 'Not authorized to delete this result' });
    }

    // Remove result
    results.splice(resultIndex, 1);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentResults = results.filter(r => r.studentId === parseInt(studentId));
    
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
    
    // In a real app, this would fetch and aggregate results from a database
    // For now, return mock data
    const performance = {
      classId: parseInt(classId),
      averageMarks: 88.5,
      highestMarks: 92,
      lowestMarks: 85,
      passPercentage: 100,
      gradeDistribution: {
        'A+': 1,
        'A': 1,
        'B': 0,
        'C': 0,
        'D': 0,
        'F': 0
      }
    };

    res.json(performance);
  } catch (error) {
    console.error('Get class performance error:', error);
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
  getClassPerformance
}; 