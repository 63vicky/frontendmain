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
  class: string
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
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer: string | string[]
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
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
  }[]
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
  examId: string
  studentId: string
  score: number
  answers: {
    questionId: string
    answer: string | string[]
    isCorrect: boolean
    points: number
  }[]
  startedAt: string
  submittedAt: string
  status: 'in-progress' | 'completed' | 'graded'
  feedback?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}
