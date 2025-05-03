// User types
export interface User {
  id: string
  _id: string
  name: string
  email: string
  role: 'principal' | 'teacher' | 'student' | 'admin'
  class?: string
  subjects?: string[]
  createdAt: string
  updatedAt: string
}

export interface Teacher extends User {
  role: 'teacher'
  subject: string
  classes: string[]
}

export interface Student extends User {
  role: 'student'
  class: string
  rollNo: string
}

// Exam types
export interface Exam {
  _id: string
  title: string
  subject: string
  class: string | {
    _id: string
    name: string
    section: string
  }
  chapter: string
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived'
  startDate: string
  endDate: string
  duration: number
  attempts: {
    current: number
    max: number
  }
  avgScore?: number
  questions?: Question[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Question {
  _id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-in-blank'
  options?: Array<{
    id: string
    text: string
  }>
  correctAnswer: string | string[]
  points: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: number
  subject: string
  class: string
  chapter: string
  tags?: string[]
  examIds: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ExamAttempt {
  id: string
  _id?: string
  examId: string
  studentId: string
  startTime: string
  endTime: string
  score: number
  maxScore: number
  percentage: number
  rating: "Excellent" | "Good" | "Satisfactory" | "Needs Improvement"
  answers: {
    questionId: string
    selectedOption: string
    isCorrect: boolean
    points?: number
    timeSpent?: number
  }[]
  timeSpent?: number
  createdAt?: string
  updatedAt?: string
  feedback?: {
    text: string
    teacherId?: string
    createdAt?: string
  }
  questionTimings?: Array<{
    questionId: string
    startTime: string
    endTime: string
    timeSpent: number
  }>
  categoryBreakdown?: Array<{
    category: string
    correct: number
    total: number
    percentage: number
  }>
  classRank?: {
    rank: number
    totalStudents: number
    percentile: number
  }
  status?: string
}

// Result types
export interface ExamResult {
  examId: string
  title: string
  subject: string
  class: string
  teacher: string
  totalStudents: number
  avgScore: number
  highestScore: number
  lowestScore: number
  attempts: {
    total: number
    max: number
  }
}

export interface StudentResult {
  studentId: string
  examId: string
  attempts: ExamAttempt[]
  bestScore: number
  bestAttempt: string // ID of the best attempt
}

export interface DashboardStats {
  totalTeachers?: number
  totalStudents?: number
  activeExams?: number
  completedExams?: number
  totalClasses?: number
  totalSubjects?: number
  upcomingExams?: number
  averageScore?: number
  topStudents?: Array<{
    id: string
    name: string
    score: number
  }>
}

export interface RecentExam {
  id: string
  name: string
  date: string
  status: "Active" | "Completed" | "Upcoming"
  subject?: string
  class?: string
  teacherName?: string
}

export interface ClassPerformance {
  class: string
  score: number
  totalStudents: number
  passPercentage: number
  subjectScores: {
    subject: string
    averageScore: number
  }[]
}

export interface Result {
  _id: string
  examId: string | {
    _id: string
    title: string
    subject: string
    class: string
    attempts?: {
      current: number
      max: number
    }
  }
  studentId: string
  score: number
  marks?: number // Alternative field for score in some API responses
  attemptNumber?: number
  rating?: string
  answers: {
    questionId: string
    answer: string | string[]
    isCorrect: boolean
    points: number
  }[]
  startedAt: string
  submittedAt: string
  // Fields used in ExamAttempt compatibility
  startTime?: string
  endTime?: string
  timeSpent?: number // Time spent in seconds
  status: 'in-progress' | 'completed' | 'graded'
  feedback?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  // Additional fields for analytics
  questionTimings?: Array<{
    questionId: string
    startTime: string
    endTime: string
    timeSpent: number
  }>
  categoryBreakdown?: Array<{
    category: string
    correct: number
    total: number
    percentage: number
  }>
  classRank?: {
    rank: number
    totalStudents: number
    percentile: number
  }
  // Class statistics for question-level comparison
  classStats?: Array<{
    questionId: string
    averageTime: string
    successRate: number
  }>
}

export interface Class {
  _id: string
  name: string
  section: string
  subject: string | {
    _id: string
    name: string
    code: string
  }
  students: number
  schedule: string
  room?: string
  status?: 'Active' | 'Inactive'
  teacher?: {
    _id: string
    name: string
    email: string
  }
}

export interface Student {
  _id: string
  name: string
  rollNo: string
  attendance: string
  performance: string
}

export interface ClassFormData {
  name: string
  subject: string
  schedule: string
  room: string
}

export interface BulkUpload {
  _id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  uploadType: 'students' | 'teachers' | 'questions' | 'results'
  status: 'processing' | 'completed' | 'failed'
  uploadedBy: {
    _id: string
    name: string
    email: string
  }
  totalRecords: number
  successCount: number
  failureCount: number
  errors?: Array<{
    row: number
    message: string
  }>
  processedData?: {
    records?: any[]
  }
  createdAt: string
  updatedAt: string
}
