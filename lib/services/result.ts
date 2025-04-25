import api from '../api';
import { ExamResult, StudentResult, ClassPerformance } from '../types';

export const resultService = {
  async getExamResults(examId: string): Promise<ExamResult> {
    const response = await api.get<ExamResult>(`/results/exam/${examId}`);
    return response.data;
  },

  async getStudentResults(studentId: string): Promise<StudentResult> {
    const response = await api.get<StudentResult>(`/results/student/${studentId}`);
    return response.data;
  },

  async getClassPerformance(
    classId: string,
    params?: { subject?: string; startDate?: string; endDate?: string }
  ): Promise<ClassPerformance> {
    const response = await api.get<ClassPerformance>(`/results/class/${classId}`, { params });
    return response.data;
  }
}; 