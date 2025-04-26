const Class = require('../models/Class');
const User = require('../models/User');

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .sort({ name: 1 })
      .lean();

    // Get all teacher IDs from classes
    const teacherIds = classes.map(cls => cls.teacher);

    // Fetch all teachers in one query
    const teachers = await User.find(
      { _id: { $in: teacherIds } },
      { _id: 1, name: 1 }
    ).lean();

    // Create a map of teacher IDs to names
    const teacherMap = teachers.reduce((acc, teacher) => {
      acc[teacher._id.toString()] = teacher.name;
      return acc;
    }, {});

    // Add teacher names to classes
    const classesWithTeacherNames = classes.map(cls => ({
      ...cls,
      teacherName: teacherMap[cls.teacher] || 'Unknown Teacher'
    }));

    res.json(classesWithTeacherNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).lean();

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class', error: error.message });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const { name, section, teacher, status } = req.body;

    // Check if class with same name already exists
    const existingClass = await Class.findOne({ name });

    if (existingClass) {
      return res.status(400).json({
        message: 'Class with this name already exists'
      });
    }

    const newClass = new Class({
      name,
      section,
      teacher,
      status,
      students: 0
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { name, section, teacher, status } = req.body;
    const classId = req.params.id;

    // Check if class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if new name conflicts with other classes
    if (name !== existingClass.name) {
      const duplicateClass = await Class.findOne({
        _id: { $ne: classId },
        name
      });

      if (duplicateClass) {
        return res.status(400).json({
          message: 'Class with this name already exists'
        });
      }
    }

    // Update class fields
    existingClass.name = name || existingClass.name;
    existingClass.section = section || existingClass.section;
    existingClass.teacher = teacher || existingClass.teacher;
    existingClass.status = status || existingClass.status;

    await existingClass.save();
    res.json(existingClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error updating class', error: error.message });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const deletedClass = await Class.findByIdAndDelete(classId);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
}; 