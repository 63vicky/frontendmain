import api from "../api"
import type { DashboardStats, RecentExam, ClassPerformance } from "../types"

export const dashboardService = {
  async getPrincipalDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/principal/stats")
    return response.data
  },

  async getPrincipalRecentExams(): Promise<RecentExam[]> {
    const response = await api.get("/dashboard/principal/recent-exams")
    return response.data
  },

  async getPrincipalClassPerformance(): Promise<ClassPerformance[]> {
    const response = await api.get("/dashboard/principal/class-performance")
    return response.data
  },

  async getTeacherDashboardStats(teacherId: string): Promise<DashboardStats> {
    const response = await api.get(`/dashboard/teacher/${teacherId}/stats`)
    return response.data
  },

  async getTeacherRecentExams(teacherId: string): Promise<RecentExam[]> {
    const response = await api.get(`/dashboard/teacher/${teacherId}/recent-exams`)
    return response.data
  },

  async getStudentDashboardStats(studentId: string): Promise<DashboardStats> {
    const response = await api.get(`/dashboard/student/${studentId}/stats`)
    return response.data
  },

  async getStudentRecentExams(studentId: string): Promise<RecentExam[]> {
    const response = await api.get(`/dashboard/student/${studentId}/recent-exams`)
    return response.data
  }
} 