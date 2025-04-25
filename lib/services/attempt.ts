import api from '../api';
import { ExamAttempt } from '../types';

export const attemptService = {
  async startAttempt(examId: string): Promise<ExamAttempt> {
    const response = await api.post<ExamAttempt>('/attempts', { examId });
    return response.data;
  },

  async submitAttempt(attemptId: string, answers: Array<{
    questionId: string;
    selectedOption: string;
  }>): Promise<ExamAttempt> {
    const response = await api.post<ExamAttempt>(`/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },

  async getAttemptsByExam(examId: string): Promise<ExamAttempt[]> {
    const response = await api.get<ExamAttempt[]>(`/attempts/exam/${examId}`);
    return response.data;
  },

  async getAttemptById(id: string): Promise<ExamAttempt> {
    const response = await api.get<ExamAttempt>(`/attempts/${id}`);
    return response.data;
  }
}; 