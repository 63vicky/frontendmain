const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject');

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ];
    }

    const classes = await Class.find(query)
      .populate('subject', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Class.countDocuments(query);

    res.json({
      success: true,
      data: classes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching classes', error: error.message });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('subject', 'name code');

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Find the teacher assigned to this class
    const teacher = await User.findOne({
      role: 'teacher',
      classes: { $in: [req.params.id] }
    }).select('_id name email');

    // Add teacher to the response if found
    const responseData = classData.toObject();
    if (teacher) {
      responseData.teacher = {
        _id: teacher._id,
        name: teacher.name
      };
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    res.status(500).json({ success: false, message: 'Error fetching class', error: error.message });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const { name, section, subject, schedule, status = 'Active' } = req.body;

    // Validate required fields
    if (!name || !section || !subject || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Name, section, subject and schedule are required'
      });
    }

    // Validate status
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Sanitize input
    const sanitizedName = name.trim();
    const sanitizedSection = section.trim();
    const sanitizedSchedule = schedule.trim();
    const sanitizedSubject = subject.trim();

    // Check if class with same name already exists
    const existingClass = await Class.findOne({ name: sanitizedName, section: sanitizedSection, schedule: sanitizedSchedule, subject: sanitizedSubject });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name, section, schedule and subject already exists'
      });
    }

    // Verify subject exists
    const subjectData = await Subject.findById(subject);
    if (!subjectData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID'
      });
    }

    const newClass = new Class({
      name: sanitizedName,
      section: sanitizedSection,
      subject,
      schedule: sanitizedSchedule,
      status,
      students: 0
    });

    const savedClass = await newClass.save();
    const populatedClass = await Class.findById(savedClass._id)
      .populate('subject', 'name code');

    res.status(201).json({ success: true, data: populatedClass });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid subject ID format' });
    }
    res.status(500).json({ success: false, message: 'Error creating class', error: error.message });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { name, section, subject, schedule, status } = req.body;
    const classId = req.params.id;

    // Check if class exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Validate status if provided
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Sanitize input if provided
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (section) updateData.section = section.trim();
    if (schedule) updateData.schedule = schedule.trim();
    if (status) updateData.status = status;
    if (subject) updateData.subject = subject;

    // Check if new name conflicts with other classes
    if (name && name !== existingClass.name) {
      const duplicateClass = await Class.findOne({
        _id: { $ne: classId },
        name: name.trim()
      });

      if (duplicateClass) {
        return res.status(400).json({
          success: false,
          message: 'Class with this name already exists'
        });
      }
    }

    // If subject is provided, verify it exists
    if (subject) {
      const subjectData = await Subject.findById(subject);
      if (!subjectData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID'
        });
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { new: true, runValidators: true }
    ).populate('subject', 'name code');

    res.json({ success: true, data: updatedClass });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Error updating class', error: error.message });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if class has students
    if (classData.students > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with students'
      });
    }

    await Class.findByIdAndDelete(classId);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    res.status(500).json({ success: false, message: 'Error deleting class', error: error.message });
  }
};

// Get class students
const getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;
    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await User.find({ class: classId, role: 'student' })
      .select('name email rollNo status')
      .sort({ name: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    res.status(500).json({ success: false, message: 'Error fetching class students', error: error.message });
  }
};

// Add students to class
const addStudentsToClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update students' class
    const updateResult = await User.updateMany(
      { _id: { $in: studentIds }, role: 'student' },
      { $set: { class: classId } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid students found to add'
      });
    }

    // Update class student count
    await Class.findByIdAndUpdate(classId, {
      $inc: { students: updateResult.modifiedCount }
    });

    res.json({
      success: true,
      message: `Added ${updateResult.modifiedCount} students to class`,
      data: { modifiedCount: updateResult.modifiedCount }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID or student IDs'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error adding students to class',
      error: error.message
    });
  }
};

// Remove students from class
const removeStudentsFromClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update students' class to empty string (remove from class)
    const updateResult = await User.updateMany(
      { _id: { $in: studentIds }, role: 'student', class: classId },
      { $set: { class: "" } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students were removed from class'
      });
    }

    // Update class student count
    await Class.findByIdAndUpdate(classId, {
      $inc: { students: -updateResult.modifiedCount }
    });

    res.json({
      success: true,
      message: `Removed ${updateResult.modifiedCount} students from class`,
      data: { modifiedCount: updateResult.modifiedCount }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID or student IDs'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error removing students from class',
      error: error.message
    });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addStudentsToClass,
  removeStudentsFromClass
};




