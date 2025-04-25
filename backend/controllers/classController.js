// In a real app, this would be a database model
let classes = [
  { id: 1, name: 'Class 1', grade: '1', teacherId: 1 },
  { id: 2, name: 'Class 2', grade: '2', teacherId: 2 },
  { id: 3, name: 'Class 3', grade: '3', teacherId: 3 }
];

const getClasses = async (req, res) => {
  try {
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = classes.find(c => c.id === parseInt(id));
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classItem);
  } catch (error) {
    console.error('Get class by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, grade, teacherId } = req.body;
    
    // Validate required fields
    if (!name || !grade || !teacherId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new class
    const newClass = {
      id: classes.length + 1,
      name,
      grade,
      teacherId
    };

    classes.push(newClass);
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, teacherId } = req.body;
    
    const classIndex = classes.findIndex(c => c.id === parseInt(id));
    if (classIndex === -1) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update class
    classes[classIndex] = {
      ...classes[classIndex],
      name: name || classes[classIndex].name,
      grade: grade || classes[classIndex].grade,
      teacherId: teacherId || classes[classIndex].teacherId
    };

    res.json(classes[classIndex]);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classIndex = classes.findIndex(c => c.id === parseInt(id));
    
    if (classIndex === -1) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Remove class
    classes.splice(classIndex, 1);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
}; 