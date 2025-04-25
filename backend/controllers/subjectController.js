// In a real app, this would be a database model
let subjects = [
  { id: 1, name: 'Mathematics', code: 'MATH101', classId: 1 },
  { id: 2, name: 'Science', code: 'SCI101', classId: 1 },
  { id: 3, name: 'English', code: 'ENG101', classId: 1 }
];

const getSubjects = async (req, res) => {
  try {
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = subjects.find(s => s.id === parseInt(id));
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, classId } = req.body;
    
    // Validate required fields
    if (!name || !code || !classId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new subject
    const newSubject = {
      id: subjects.length + 1,
      name,
      code,
      classId
    };

    subjects.push(newSubject);
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, classId } = req.body;
    
    const subjectIndex = subjects.findIndex(s => s.id === parseInt(id));
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update subject
    subjects[subjectIndex] = {
      ...subjects[subjectIndex],
      name: name || subjects[subjectIndex].name,
      code: code || subjects[subjectIndex].code,
      classId: classId || subjects[subjectIndex].classId
    };

    res.json(subjects[subjectIndex]);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectIndex = subjects.findIndex(s => s.id === parseInt(id));
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Remove subject
    subjects.splice(subjectIndex, 1);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
}; 