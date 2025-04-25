// User types
export interface User {
  id: string
  name: string
  email: string
  role: "principal" | "teacher" | "student"
  status: "active" | "inactive"
}

export interface Teacher extends User {
  role: "teacher"
  subject: string
  classes: string[]
}

export interface Student extends User {
  role: "student"
  class: string
  rollNo: string
}

// Exam types
export interface Exam {
  id: string
  title: string
  subject: string
  class: string
  chapter: string
  duration: number // in minutes
  startDate: string
  endDate: string
  maxAttempts: number
  status: "draft" | "scheduled" | "active" | "completed" | "archived"
  createdBy: string // teacher ID
}

export interface Question {
  id: string
  examId: string
  text: string
  options: {
    id: string
    text: string
  }[]
  correctAnswer: string
  category?: string // For categorizing questions (e.g., Algebra, Geometry)
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
