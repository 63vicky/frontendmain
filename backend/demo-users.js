// In-memory data store
const users = [
  // Principal
  {
    id: 1,
    name: 'Principal John Doe',
    email: 'principal@example.com',
    password: 'principal123',
    role: 'principal',
    status: 'active'
  },
  // Teachers
  {
    id: 2,
    name: 'Math Teacher',
    email: 'math.teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Mathematics',
    classes: ['10A', '10B', '11A'],
    status: 'active'
  },
  {
    id: 3,
    name: 'Science Teacher',
    email: 'science.teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Science',
    classes: ['9A', '9B', '10A'],
    status: 'active'
  },
  {
    id: 4,
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
    id: 5,
    name: 'Student Alice',
    email: 'alice.student@example.com',
    password: 'student123',
    role: 'student',
    class: '10A',
    rollNo: '101',
    status: 'active'
  },
  {
    id: 6,
    name: 'Student Bob',
    email: 'bob.student@example.com',
    password: 'student123',
    role: 'student',
    class: '10B',
    rollNo: '102',
    status: 'active'
  },
  {
    id: 7,
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
    id: 1,
    title: 'Mathematics Midterm',
    subject: 'Mathematics',
    class: '10A',
    status: 'completed',
    createdAt: new Date('2024-03-15'),
    createdBy: 2
  },
  {
    id: 2,
    title: 'Science Quiz',
    subject: 'Science',
    class: '9A',
    status: 'active',
    createdAt: new Date('2024-03-20'),
    createdBy: 3
  },
  {
    id: 3,
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
    id: 1,
    examId: 1,
    studentId: 5,
    marks: 85,
    grade: 'A',
    feedback: 'Excellent performance'
  },
  {
    id: 2,
    examId: 1,
    studentId: 6,
    marks: 75,
    grade: 'B',
    feedback: 'Good work'
  },
  {
    id: 3,
    examId: 2,
    studentId: 7,
    marks: 90,
    grade: 'A+',
    feedback: 'Outstanding performance'
  }
];

module.exports = { users, exams, results }; 