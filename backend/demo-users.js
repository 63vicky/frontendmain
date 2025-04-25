const dotenv = require('dotenv');
// In-memory data store
const users = [
  // Principal
  {
    
    name: 'Principal John Doe',
    email: 'principal@example.com',
    password: 'principal123',
    role: 'principal',
    status: 'active'
  },
  // Teachers
  {
    
    name: 'Math Teacher',
    email: 'math.teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Mathematics',
    classes: ['10A', '10B', '11A'],
    status: 'active'
  },
  {
    
    name: 'Science Teacher',
    email: 'science.teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Science',
    classes: ['9A', '9B', '10A'],
    status: 'active'
  },
  {
    
    name: 'English Teacher',
    email: 'english.teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'English',
    classes: ['10A', '10B', '11A', '11B'],
    status: 'active'
  },
  // Students
  {
    
    name: 'Student Alice',
    email: 'alice.student@example.com',
    password: 'student123',
    role: 'student',
    class: '10A',
    rollNo: '101',
    status: 'active'
  },
  {
    
    name: 'Student Bob',
    email: 'bob.student@example.com',
    password: 'student123',
    role: 'student',
    class: '10B',
    rollNo: '102',
    status: 'active'
  },
  {
    
    name: 'Student Carol',
    email: 'carol.student@example.com',
    password: 'student123',
    role: 'student',
    class: '11A',
    rollNo: '201',
    status: 'active'
  }
];

const exams = [
  {
    
    title: 'Mathematics Midterm',
    subject: 'Mathematics',
    class: '10A',
    status: 'completed',
    createdAt: new Date('2024-03-15'),
    createdBy: 2
  },
  {
   
    title: 'Science Quiz',
    subject: 'Science',
    class: '9A',
    status: 'active',
    createdAt: new Date('2024-03-20'),
    createdBy: 3
  },
  {
    
    title: 'English Final',
    subject: 'English',
    class: '11A',
    status: 'scheduled',
    createdAt: new Date('2024-03-25'),
    createdBy: 4
  }
];

const results = [
  {
    
    examId: 1,
    studentId: 5,
    marks: 85,
    grade: 'A',
    feedback: 'Excellent performance'
  },
  {
    
    examId: 1,
    studentId: 6,
    marks: 75,
    grade: 'B',
    feedback: 'Good work'
  },
  {
   
    examId: 2,
    studentId: 7,
    marks: 90,
    grade: 'A+',
    feedback: 'Outstanding performance'
  }
];

// Example usage: Insert into MongoDB (if using Mongoose)
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed
const Exam = require('./models/Exam'); // Adjust path as needed
const Result = require('./models/Result'); // Adjust path as needed
dotenv.config();
async function seedDemoUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  for (const user of users) {
    const newUser = new User(user);
    await newUser.save();
  }
  console.log('Demo users seeded!');

  mongoose.disconnect();
}

async function seedDemoExams() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-system');
  await Exam.deleteMany({});
  for (const exam of exams) {
    const newExam = new Exam(exam);
    await newExam.save();
  }
  console.log('Demo exams seeded!');

  mongoose.disconnect();
}

async function seedDemoResults() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-system');
  await Result.deleteMany({});
  for (const result of results) {
    const newResult = new Result(result);
    await newResult.save();
  }
  console.log('Demo results seeded!');

  mongoose.disconnect();
}

// Uncomment to run the seeding script
seedDemoUsers();
// seedDemoExams();
// seedDemoResults();

module.exports = { users, exams, results }; 