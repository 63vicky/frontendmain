import { api } from '../api';
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
    try {
      const response = await api.get<ExamAttempt[]>(`/attempts/exam/${examId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching attempts for exam ${examId}:`, error);
      return [];
    }
  },

  async getAttemptById(id: string): Promise<ExamAttempt> {
    const response = await api.get<ExamAttempt>(`/attempts/${id}`);
    return response.data;
  },

  async getStudentAttempts(): Promise<Record<string, ExamAttempt[]>> {
    try {
      console.log('Fetching student attempts...');
      const response = await api.get<Record<string, ExamAttempt[]>>('/attempts/student');

      // Log the response for debugging
      console.log('Student attempts response status:', response.status);

      // Check if response.data exists and is not empty
      if (response.data && Object.keys(response.data).length > 0) {
        console.log('Student attempts data found:', Object.keys(response.data).length, 'exams');

        // Log a sample of the data structure
        const sampleExamId = Object.keys(response.data)[0];
        if (sampleExamId) {
          console.log('Sample exam attempts:', {
            examId: sampleExamId,
            attemptCount: response.data[sampleExamId].length,
            sampleAttempt: response.data[sampleExamId][0]
          });
        }

        // Log all exam IDs with attempt counts
        console.log('All exam attempts:', Object.entries(response.data).map(([examId, attempts]) => ({
          examId,
          attemptCount: attempts.length
        })));

        return response.data;
      } else {
        console.log('No student attempts data found or empty object returned');
        return {};
      }
    } catch (error) {
      console.error('Error fetching student attempts:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {};
    }
  }
};