const Subject = require('../models/Subject');
const User = require('../models/User');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
      
      res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacher', 'name email');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new subject
exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, teacher, classes } = req.body;

    // Check if subject with same name or code exists
    const existingSubject = await Subject.findOne({
      $or: [{ name }, { code }]
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name or code already exists'
      });
    }

    // If teacher is provided, verify they exist and are a teacher
    if (teacher) {
      const teacherUser = await User.findOne({ _id: teacher, role: 'teacher' });
      if (!teacherUser) {
        return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
      }
    }

    const subject = new Subject({
      name,
      code,
      description,
      teacher,
      classes: classes || []
    });

    const savedSubject = await subject.save();
    const populatedSubject = await Subject.findById(savedSubject._id)
      .populate('teacher', 'name email');

    res.status(201).json({ success: true, data: populatedSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { name, code, description, teacher, classes, status } = req.body;

    // Check if subject exists
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check for duplicate name/code if they're being changed
    if (name !== subject.name || code !== subject.code) {
      const existingSubject = await Subject.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name }, { code }]
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name or code already exists'
        });
      }
    }

    // If teacher is provided, verify they exist and are a teacher
    if (teacher) {
      const teacherUser = await User.findOne({ _id: teacher, role: 'teacher' });
      if (!teacherUser) {
        return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        description,
        teacher,
        classes: classes || subject.classes,
        status
      },
      { new: true }
    ).populate('teacher', 'name email');

    res.json({ success: true, data: updatedSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 