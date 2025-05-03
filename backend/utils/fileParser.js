const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Question = require('../models/Question');

/**
 * Parse CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Parsed data as array of objects
 */
exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Parse Excel file
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} - Parsed data as array of objects
 */
exports.parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
};

/**
 * Parse file based on extension
 * @param {Object} file - File object from multer
 * @returns {Promise<Array>} - Parsed data as array of objects
 */
exports.parseFile = async (file) => {
  const filePath = file.path;
  const fileExtension = path.extname(file.originalname).toLowerCase();

  try {
    if (fileExtension === '.csv') {
      return await exports.parseCSV(filePath);
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      return exports.parseExcel(filePath);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Validate and process student data
 * @param {Array} data - Parsed data from file
 * @returns {Object} - Validation results with valid and invalid entries
 */
exports.validateStudentData = async (data) => {
  const validEntries = [];
  const invalidEntries = [];

  // Get all classes for validation
  const classes = await Class.find({}).lean();
  const classMap = new Map(classes.map(c => [c.name.toLowerCase() + '-' + c.section.toLowerCase(), c._id]));

  for (const [index, entry] of data.entries()) {
    try {
      // Required fields
      if (!entry.name || !entry.email || !entry.rollNo) {
        invalidEntries.push({
          row: index + 2, // +2 because index is 0-based and we skip header row
          data: entry,
          errors: ['Missing required fields (name, email, or rollNo)']
        });
        continue;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(entry.email)) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Invalid email format']
        });
        continue;
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: entry.email });
      if (existingUser) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Email already exists']
        });
        continue;
      }

      // Validate class if provided
      let classId = null;
      if (entry.class && entry.section) {
        const classKey = (entry.class + '-' + entry.section).toLowerCase();
        classId = classMap.get(classKey);

        if (!classId) {
          invalidEntries.push({
            row: index + 2,
            data: entry,
            errors: [`Class '${entry.class}-${entry.section}' not found`]
          });
          continue;
        }
      }

      // Add valid entry
      validEntries.push({
        name: entry.name,
        email: entry.email,
        password: entry.password || 'password123', // Default password if not provided
        role: 'student',
        rollNo: entry.rollNo,
        class: classId,
        status: entry.status || 'active'
      });

    } catch (error) {
      invalidEntries.push({
        row: index + 2,
        data: entry,
        errors: [error.message]
      });
    }
  }

  return { validEntries, invalidEntries };
};

/**
 * Validate and process teacher data
 * @param {Array} data - Parsed data from file
 * @returns {Object} - Validation results with valid and invalid entries
 */
exports.validateTeacherData = async (data) => {
  const validEntries = [];
  const invalidEntries = [];

  // Get all subjects and classes for validation
  const subjects = await Subject.find({}).lean();
  const classes = await Class.find({}).lean();

  const subjectMap = new Map(subjects.map(s => [s.name.toLowerCase(), s._id]));
  const classMap = new Map(classes.map(c => [c.name.toLowerCase() + '-' + c.section.toLowerCase(), c._id]));

  for (const [index, entry] of data.entries()) {
    try {
      // Required fields
      if (!entry.name || !entry.email || !entry.subject) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Missing required fields (name, email, or subject)']
        });
        continue;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(entry.email)) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Invalid email format']
        });
        continue;
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: entry.email });
      if (existingUser) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Email already exists']
        });
        continue;
      }

      // Validate subject
      const subjectId = subjectMap.get(entry.subject.toLowerCase());
      if (!subjectId) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: [`Subject '${entry.subject}' not found`]
        });
        continue;
      }

      // Process classes if provided
      const classIds = [];
      if (entry.classes) {
        const classNames = entry.classes.split(',').map(c => c.trim());

        for (const className of classNames) {
          // Check if class has section format (e.g., "8A")
          const match = className.match(/^(\d+)([A-Za-z]+)$/);
          if (match) {
            const [, grade, section] = match;
            const classKey = (grade + '-' + section).toLowerCase();
            const classId = classMap.get(classKey);

            if (classId) {
              classIds.push(classId);
            }
          }
        }
      }

      // Add valid entry
      validEntries.push({
        name: entry.name,
        email: entry.email,
        password: entry.password || 'password123', // Default password if not provided
        role: 'teacher',
        subject: subjectId,
        classes: classIds,
        status: entry.status || 'active'
      });

    } catch (error) {
      invalidEntries.push({
        row: index + 2,
        data: entry,
        errors: [error.message]
      });
    }
  }

  return { validEntries, invalidEntries };
};

/**
 * Generate template for student data
 * @returns {Buffer} - Excel file buffer
 */
exports.generateStudentTemplate = () => {
  const worksheet = xlsx.utils.json_to_sheet([
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      rollNo: '101',
      class: '8',
      section: 'A',
      password: 'password123',
      status: 'active'
    }
  ]);

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Generate template for teacher data
 * @returns {Buffer} - Excel file buffer
 */
exports.generateTeacherTemplate = () => {
  const worksheet = xlsx.utils.json_to_sheet([
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      subject: 'Mathematics',
      classes: '8A, 9B, 10A',
      password: 'password123',
      status: 'active'
    }
  ]);

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Teachers');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Validate and process question data
 * @param {Array} data - Parsed data from file
 * @returns {Object} - Validation results with valid and invalid entries
 */
exports.validateQuestionData = async (data) => {
  const validEntries = [];
  const invalidEntries = [];

  // Get all subjects and classes for validation
  const subjects = await Subject.find({}).lean();
  const classes = await Class.find({}).lean();

  const subjectMap = new Map(subjects.map(s => [s.name.toLowerCase(), s._id]));
  const classMap = new Map(classes.map(c => [c.name.toLowerCase() + '-' + c.section.toLowerCase(), c._id]));

  for (const [index, entry] of data.entries()) {
    try {
      // Required fields
      if (!entry.text || !entry.type || !entry.subject || !entry.class || !entry.correctAnswer) {
        invalidEntries.push({
          row: index + 2, // +2 because index is 0-based and we skip header row
          data: entry,
          errors: ['Missing required fields (text, type, subject, class, or correctAnswer)']
        });
        continue;
      }

      // Validate question type
      const validTypes = ['multiple-choice', 'short-answer', 'descriptive', 'true-false', 'fill-in-blank'];
      if (!validTypes.includes(entry.type)) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: [`Invalid question type: ${entry.type}. Must be one of: ${validTypes.join(', ')}`]
        });
        continue;
      }

      // Validate difficulty
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (entry.difficulty && !validDifficulties.includes(entry.difficulty)) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: [`Invalid difficulty: ${entry.difficulty}. Must be one of: ${validDifficulties.join(', ')}`]
        });
        continue;
      }

      // Validate options for multiple-choice questions
      if (entry.type === 'multiple-choice' && (!entry.options || entry.options.trim() === '')) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Multiple-choice questions must have options']
        });
        continue;
      }

      // Validate points and time
      const points = parseInt(entry.points);
      const time = parseInt(entry.time);

      if (isNaN(points) || points <= 0) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Points must be a positive number']
        });
        continue;
      }

      if (isNaN(time) || time <= 0) {
        invalidEntries.push({
          row: index + 2,
          data: entry,
          errors: ['Time must be a positive number']
        });
        continue;
      }

      // Process options for multiple-choice questions
      let options = [];
      if (entry.type === 'multiple-choice' && entry.options) {
        options = entry.options.split(',').map(opt => opt.trim());
      }

      // Process tags if provided
      let tags = [];
      if (entry.tags) {
        tags = entry.tags.split(',').map(tag => tag.trim());
      }

      // Add valid entry
      validEntries.push({
        text: entry.text,
        type: entry.type,
        subject: entry.subject,
        className: entry.class + (entry.section ? '-' + entry.section : ''),
        chapter: entry.chapter || '',
        difficulty: entry.difficulty || 'Medium',
        options: options,
        correctAnswer: entry.correctAnswer,
        points: points,
        time: time,
        tags: tags
      });

    } catch (error) {
      invalidEntries.push({
        row: index + 2,
        data: entry,
        errors: [error.message]
      });
    }
  }

  return { validEntries, invalidEntries };
};

/**
 * Generate template for question data
 * @returns {Buffer} - Excel file buffer
 */
exports.generateQuestionTemplate = () => {
  const worksheet = xlsx.utils.json_to_sheet([
    {
      text: 'What is the capital of France?',
      type: 'multiple-choice',
      subject: 'Geography',
      class: '9',
      section: 'A',
      chapter: 'World Capitals',
      difficulty: 'Easy',
      options: 'Paris,London,Berlin,Madrid',
      correctAnswer: 'Paris',
      points: '5',
      time: '60',
      tags: 'capitals,europe'
    },
    {
      text: 'Solve for x: 2x + 5 = 15',
      type: 'short-answer',
      subject: 'Mathematics',
      class: '8',
      section: 'B',
      chapter: 'Algebra',
      difficulty: 'Medium',
      options: '',
      correctAnswer: '5',
      points: '10',
      time: '120',
      tags: 'algebra,equations'
    }
  ]);

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Questions');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
