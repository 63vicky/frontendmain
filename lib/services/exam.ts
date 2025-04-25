import api from '../api';
import { Exam, Question } from '../types';

export const examService = {
  // Exam CRUD operations
  async createExam(examData: Partial<Exam>): Promise<Exam> {
    const response = await api.post<Exam>('/exams', examData);
    return response.data;
  },

  async getExams(params?: { status?: string; subject?: string; class?: string }): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams', { params });
    return response.data;
  },

  async getExamById(id: string): Promise<Exam> {
    const response = await api.get<Exam>(`/exams/${id}`);
    return response.data;
  },

  async updateExam(id: string, examData: Partial<Exam>): Promise<Exam> {
    const response = await api.put<Exam>(`/exams/${id}`, examData);
    return response.data;
  },

  async deleteExam(id: string): Promise<void> {
    await api.delete(`/exams/${id}`);
  },

  async updateExamStatus(id: string, status: string): Promise<Exam> {
    const response = await api.patch<Exam>(`/exams/${id}/status`, { status });
    return response.data;
  },

  // Question operations
  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const response = await api.post<Question>('/questions', questionData);
    return response.data;
  },

  async getQuestionsByExam(examId: string): Promise<Question[]> {
    const response = await api.get<Question[]>(`/questions/exam/${examId}`);
    return response.data;
  },

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
    const response = await api.put<Question>(`/questions/${id}`, questionData);
    return response.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  }
}; 