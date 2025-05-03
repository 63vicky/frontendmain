import { Result, ExamAttempt } from '@/lib/types';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const resultService = {
  // Get all results
  async getResults(): Promise<Result[]> {
    try {
      const response = await api.get<Result[]>('/results');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  },

  // Get result by ID
  async getResultById(id: string): Promise<Result> {
    try {
      const response = await api.get<Result>(`/results/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  },

  // Get results by student ID
  async getStudentResults(studentId: string): Promise<Result[]> {
    try {
      const response = await api.get<Result[]>(`/results/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  },

  // Get results by exam ID
  async getExamResults(examId: string): Promise<Result[]> {
    try {
      const response = await api.get<Result[]>(`/results/exam/${examId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching exam results:', error);
      return [];
    }
  },

  // Create a new result (teacher/principal only)
  async createResult(resultData: Partial<Result>): Promise<Result> {
    try {
      const response = await api.post<Result>('/results', resultData);
      return response.data;
    } catch (error) {
      console.error('Error creating result:', error);
      throw error;
    }
  },

  // Update an existing result (teacher/principal only)
  async updateResult(id: string, resultData: Partial<Result>): Promise<Result> {
    try {
      const response = await api.put<Result>(`/results/${id}`, resultData);
      return response.data;
    } catch (error) {
      console.error('Error updating result:', error);
      throw error;
    }
  },

  // Delete a result (teacher/principal only)
  async deleteResult(id: string): Promise<void> {
    try {
      await api.delete(`/results/${id}`);
    } catch (error) {
      console.error('Error deleting result:', error);
      throw error;
    }
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
    try {
      // Use the fetch API directly since the endpoint might not be in the API client
      const response = await fetch(`${API_URL}/results/student/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(submissionData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // If the error is because the student has reached maximum attempts
        if (response.status === 400 && data.message && data.message.includes('Maximum attempts reached')) {
          console.log('Maximum attempts reached, returning existing results');

          // Find the result with the highest score
          if (data.existingResults && data.existingResults.length > 0) {
            const bestResult = data.existingResults.reduce((best, current) =>
              current.marks > best.marks ? current : best, data.existingResults[0]);

            return bestResult;
          }
        }

        throw new Error(data.message || 'Failed to submit result');
      }

      return data;
    } catch (error) {
      console.error('Error submitting result:', error);
      throw error;
    }
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
    try {
      const queryParams = new URLSearchParams();
      if (params?.subject) queryParams.append('subject', params.subject);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `/results/class/${classId}/performance${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching class performance:', error);
      throw error;
    }
  }
};
