import { Result, ExamAttempt } from '@/lib/types';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const resultService = {
  // Get all results
  async getResults(): Promise<Result[]> {
    const response = await api.get<Result[]>('/results');
    return response.data;
  },

  // Get result by ID
  async getResultById(id: string): Promise<Result> {
    const response = await api.get<Result>(`/results/${id}`);
    return response.data;
  },

  // Get results by student ID
  async getStudentResults(studentId: string): Promise<Result[]> {
    const response = await api.get<Result[]>(`/results/student/${studentId}`);
    return response.data;
  },

  // Get results by exam ID
  async getExamResults(examId: string): Promise<Result[]> {
    const response = await api.get<Result[]>(`/results/exam/${examId}`);
    return response.data;
  },

  // Create a new result (teacher/principal only)
  async createResult(resultData: Partial<Result>): Promise<Result> {
    const response = await api.post<Result>('/results', resultData);
    return response.data;
  },

  // Update an existing result (teacher/principal only)
  async updateResult(id: string, resultData: Partial<Result>): Promise<Result> {
    const response = await api.put<Result>(`/results/${id}`, resultData);
    return response.data;
  },

  // Delete a result (teacher/principal only)
  async deleteResult(id: string): Promise<void> {
    await api.delete(`/results/${id}`);
  },

  // Submit student exam result (student only)
  async submitStudentResult(submissionData: {
    examId: string;
    answers: Array<{
      questionId: string;
      answer: string | string[];
      isCorrect: boolean;
    }>;
    score: number;
    timeSpent?: number;
  }): Promise<Result> {
    const response = await api.post<Result>('/results/student/submit', submissionData);
    return response.data;
  },

  // Get attempt by ID (for compatibility with ExamAttempt model)
  async getAttemptById(id: string): Promise<ExamAttempt> {
    try {
      const response = await fetch(`${API_URL}/attempts/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attempt');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get attempt error:', error);
      throw error;
    }
  },

  // Get class performance
  async getClassPerformance(classId: string, params?: {
    subject?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `/results/class/${classId}/performance${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  }
};
