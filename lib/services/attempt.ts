import { toast } from 'sonner';
import { api } from '../api';
import { ExamAttempt, Result, Question } from '../types';

// Define a comprehensive attempt data interface that combines ExamAttempt and Result data
export interface ComprehensiveAttemptData {
  // Basic identification
  id: string;
  _id?: string;
  examId: string;
  studentId: string;
  resultId?: string; // Added to store the Result ID if this data came from a Result

  // Exam metadata
  examTitle?: string;
  examSubject?: string;
  examClass?: string;
  examChapter?: string;
  examDuration?: number;

  // Attempt metadata
  attemptNumber: number;
  maxAttempts: number;
  startTime: string;
  endTime?: string;
  submittedAt?: string;

  // Performance data
  score: number;
  maxScore: number;
  percentage: number;
  grade?: string;
  rating: string;
  timeSpent: number;
  status: string;

  // Additional metrics for the frontend
  correctAnswers?: number;
  totalQuestions?: number;
  accuracy?: number;
  pointsEarned?: number;
  totalPossiblePoints?: number;

  // Detailed data
  answers: Array<{
    questionId: string;
    selectedOption: string;
    answer?: string;
    descriptiveAnswer?: string;
    isCorrect: boolean;
    points: number;
    timeSpent?: number;
  }>;

  // Analytics data
  questionTimings: Array<{
    questionId: string;
    startTime?: string;
    endTime?: string;
    timeSpent: number;
  }>;

  categoryBreakdown: Array<{
    category: string;
    correct: number;
    total: number;
    percentage: number;
  }>;

  classRank?: {
    rank: number;
    totalStudents: number;
    percentile: number;
  };

  // Question data
  questions?: Array<{
    id: string;
    text: string;
    type: string;
    difficulty: string;
    points: number;
    correctAnswer: string | string[];
    options?: string[];
    isCorrect?: boolean;
    userAnswer?: string | string[];
    timeSpent?: number;
    totalAttempts?: number;
    correctAttempts?: number;
    averageTimeSpent?: number;
    successRate?: number;
  }>;

  // Feedback
  feedback?: {
    text: string;
    teacherId?: string;
    createdAt?: string;
  };
}

export const attemptService = {
  async startAttempt(examId: string): Promise<ExamAttempt> {
    const response = await api.post<ExamAttempt>('/attempts', { examId });
    return response.data;
  },

  async submitAttempt(
    attemptId: string,
    answers: Array<{
      questionId: string;
      selectedOption: string;
      isDescriptive?: boolean;
      skipped?: boolean;
    }>,
    questionTimings?: Array<{
      questionId: string;
      startTime: Date;
      endTime?: Date;
      timeSpent?: number;
    }>,
    timeSpent?: number
  ): Promise<ExamAttempt> {
    const response = await api.post<ExamAttempt>(
      `/attempts/${attemptId}/submit`,
      {
        answers,
        questionTimings,
        timeSpent
      }
    );
    return response.data;
  },

  async getAttemptsByExam(examId: string): Promise<ExamAttempt[]> {
    try {
      const response = await api.get<ExamAttempt[]>(`/attempts/exam/${examId}`);
      return response.data || [];
    } catch (error) {
      toast("Failed to fetch exam attempts");
      return [];
    }
  },

  async getAttemptById(id: string): Promise<ExamAttempt> {
    try {
      const response = await api.get<ExamAttempt>(`/attempts/${id}`);
      return response.data;
    } catch (error) {
      toast("Failed to fetch attempt details");
      throw error;
    }
  },

  async getStudentAttempts(): Promise<Record<string, ExamAttempt[]>> {
    try {
      const response = await api.get<Record<string, ExamAttempt[]>>('/attempts/student');

      // Check if response.data exists and is not empty
      if (response.data && Object.keys(response.data).length > 0) {
        return response.data;
      } else {
        toast("Failed to fetch student attempts");
        return {};
      }
    } catch (error) {
      toast("Failed to fetch student attempts");
      return {};
    }
  },

  async getAttemptsByStudent(studentId: string): Promise<ExamAttempt[]> {
    try {
      const response = await api.get<ExamAttempt[]>(`/attempts/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      toast("Failed to fetch student's attempts");
      return [];
    }
  },

  async getAttemptAnalytics(examId: string): Promise<any> {
    try {
      const response = await api.get<any>(`/attempts/analytics/exam/${examId}`);
      return response.data || { attempts: [], analytics: {} };
    } catch (error) {
      toast("Failed to fetch attempt analytics");
      return { attempts: [], analytics: {} };
    }
  },

  async getQuestionAnalytics(examId: string): Promise<any> {
    try {
      const response = await api.get<any>(`/question-analytics/exam/${examId}`);
      return response.data || { questions: [], analytics: {} };
    } catch (error) {
      toast("Failed to fetch question analytics");
      return { questions: [], analytics: {} };
    }
  },

  /**
   * Comprehensive method to fetch complete attempt data from both ExamAttempt and Result APIs
   * This combines data from multiple sources to provide a complete picture of an attempt
   */
  async getComprehensiveAttemptData(id: string): Promise<ComprehensiveAttemptData> {
    try {
      console.log('Fetching comprehensive attempt data for ID:', id);

      // Initialize with default values
      let comprehensiveData: Partial<ComprehensiveAttemptData> = {
        id: id,
        answers: [],
        questionTimings: [],
        categoryBreakdown: [],
        questions: []
      };

      // Step 1: Try to fetch from Result API first to check if this is a Result ID
      let resultData = null;
      try {
        console.log('Checking if this is a Result ID...');
        const resultResponse = await api.get<any>(`/results/${id}`);
        resultData = resultResponse.data;
        console.log('Result data received:', resultData);

        // If we found a Result, store its data for later
        comprehensiveData = {
          ...comprehensiveData,
          resultId: id,
          examId: resultData.examId,
          studentId: resultData.studentId,
          attemptNumber: resultData.attemptNumber || 1,
          grade: resultData.grade,
          submittedAt: resultData.submittedAt || resultData.createdAt,
          score: resultData.marks || 0,
          percentage: resultData.percentage || 0
        };
      } catch (resultError) {
        console.log('Not a Result ID or error fetching result:', resultError);
        // Not a Result ID, continue with normal flow
      }

      // Step 2: Try to fetch from ExamAttempt API
      try {
        console.log('Fetching from ExamAttempt API...');


        // If we found a Result earlier, try to find the corresponding ExamAttempt
        let attemptData;
        if (resultData) {
          // Try to find the ExamAttempt that corresponds to this Result
          try {
            // First try to find by examId and studentId with matching attempt number
            const attemptsResponse = await api.get<any>(`/attempts/student/${resultData.studentId}/exam/${resultData.examId}`);
            const attempts = attemptsResponse.data;

            if (Array.isArray(attempts) && attempts.length > 0) {
              // Sort by createdAt descending to get the most recent first
              const sortedAttempts = attempts.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              // Try to find the attempt that matches the attempt number if available
              if (resultData.attemptNumber) {
                // This is a best-effort approach since ExamAttempt doesn't store attempt number
                // We're assuming the attempts are in chronological order
                const attemptIndex = Math.min(resultData.attemptNumber - 1, sortedAttempts.length - 1);
                attemptData = sortedAttempts[attemptIndex];
              } else {
                // Just use the most recent attempt
                attemptData = sortedAttempts[0];
              }

              console.log('Found corresponding attempt for Result:', attemptData._id);
            }
          } catch (error) {
            console.error('Error finding corresponding attempt:', error);
          }
        }

        // If we couldn't find a corresponding attempt or this isn't a Result ID,
        // try to fetch the attempt directly
        if (!attemptData) {
          const attemptResponse = await api.get<ExamAttempt>(`/attempts/${id}`);
          attemptData = attemptResponse.data;
        }

        console.log('ExamAttempt data received:', attemptData);

        // Merge attempt data
        comprehensiveData = {
          ...comprehensiveData,
          id: attemptData.id || attemptData._id || id,
          _id: attemptData._id || attemptData.id || id,
          examId: attemptData.examId,
          studentId: attemptData.studentId,
          startTime: attemptData.startTime,
          endTime: attemptData.endTime,
          score: attemptData.score || 0,
          maxScore: attemptData.maxScore || 100,
          percentage: attemptData.percentage || 0,
          rating: attemptData.rating || 'Needs Improvement',
          timeSpent: attemptData.timeSpent || 0,
          status: attemptData.status || 'completed',
          answers: (attemptData.answers || []).map((a: any) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption,
            // Use descriptiveAnswer if available, otherwise use selectedOption
            answer: a.descriptiveAnswer || a.selectedOption,
            descriptiveAnswer: a.descriptiveAnswer || '',
            isCorrect: a.isCorrect || false,
            points: a.points || 10,
            timeSpent: a.timeSpent
          })),
          questionTimings: attemptData.questionTimings || [],
          categoryBreakdown: attemptData.categoryBreakdown || [],
          classRank: attemptData.classRank,
          feedback: attemptData.feedback,
          attemptNumber: 1, // Default value, will be updated from Result API if available
          maxAttempts: 1    // Default value, will be updated from Exam data
        };

        // Step 2: Fetch the exam details to get title, subject, etc.
        try {
          console.log('Fetching exam details...');
          const examResponse = await api.get<any>(`/exams/${attemptData.examId}`);
          const examData = examResponse.data;
          const examDetails = examData.data || examData;
          console.log('Exam details received:', examDetails);

          comprehensiveData = {
            ...comprehensiveData,
            examTitle: examDetails.title,
            examSubject: examDetails.subject,
            examClass: examDetails.class,
            examChapter: examDetails.chapter,
            examDuration: examDetails.duration,
            maxAttempts: examDetails.attempts?.max || 1
          };
        } catch (examError) {
          console.error('Error fetching exam details:', examError);
        }
      } catch (attemptError) {
        console.error('Error fetching attempt data:', attemptError);
      }

      // Step 3: If we didn't already get Result data, try to fetch it now
      if (!resultData) {
        try {
          console.log('Fetching from Result API...');
          const resultResponse = await api.get<any>(`/results/${id}`);
          resultData = resultResponse.data;
          console.log('Result data received:', resultData);

          // Merge result data
          comprehensiveData = {
            ...comprehensiveData,
            resultId: resultData._id,
            attemptNumber: resultData.attemptNumber || comprehensiveData.attemptNumber || 1,
            grade: resultData.grade,
            submittedAt: resultData.submittedAt || resultData.createdAt
          };
        } catch (resultError) {
          console.error('Error fetching result data:', resultError);
        }
      }

      // Step 4: Try to fetch question analytics for detailed question data
      try {
        console.log('Fetching question analytics...');
        const analyticsResponse = await api.get<any>(`/question-analytics/attempt/${id}`);
        const analyticsData = analyticsResponse.data;
        console.log('Question analytics received:', analyticsData);

        if (analyticsData.success && analyticsData.data) {
          // Add question data
          comprehensiveData.questions = analyticsData.data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type || 'multiple-choice',
            difficulty: q.difficulty || 'Medium',
            points: q.points || 10,
            correctAnswer: q.correctAnswer,
            options: q.options,
            isCorrect: q.isCorrect,
            userAnswer: q.userAnswer,
            timeSpent: q.timeSpent,
            totalAttempts: q.totalAttempts,
            correctAttempts: q.correctAttempts,
            averageTimeSpent: q.averageTimeSpent,
            successRate: q.successRate
          }));
        }
      } catch (analyticsError) {
        console.error('Error fetching question analytics:', analyticsError);
      }

      // Calculate rating if not available
      if (!comprehensiveData.rating) {
        const percentage = comprehensiveData.percentage || 0;
        if (percentage >= 90) comprehensiveData.rating = 'Excellent';
        else if (percentage >= 75) comprehensiveData.rating = 'Good';
        else if (percentage >= 60) comprehensiveData.rating = 'Satisfactory';
        else comprehensiveData.rating = 'Needs Improvement';
      }

      // Calculate additional metrics for the frontend
      if (comprehensiveData.answers && comprehensiveData.answers.length > 0) {
        // Calculate correct answers and total questions
        comprehensiveData.totalQuestions = comprehensiveData.answers.length;
        comprehensiveData.correctAnswers = comprehensiveData.answers.filter(a => a.isCorrect).length;
        comprehensiveData.accuracy = comprehensiveData.totalQuestions > 0
          ? Math.round((comprehensiveData.correctAnswers / comprehensiveData.totalQuestions) * 100)
          : 0;

        // Calculate points earned and total possible points
        comprehensiveData.pointsEarned = comprehensiveData.answers.reduce((total, a) =>
          total + (a.isCorrect ? (a.points || 0) : 0), 0);
        comprehensiveData.totalPossiblePoints = comprehensiveData.answers.reduce((total, a) =>
          total + (a.points || 0), 0);

        // Calculate total time spent from answers if available
        if (comprehensiveData.answers.some(a => a.timeSpent !== undefined)) {
          const calculatedTimeSpent = comprehensiveData.answers.reduce((total, a) =>
            total + (a.timeSpent || 0), 0);

          // Only update if the calculated time is greater than the existing time
          // or if the existing time is 0 or undefined
          if (calculatedTimeSpent > 0 && (!comprehensiveData.timeSpent || calculatedTimeSpent > comprehensiveData.timeSpent)) {
            comprehensiveData.timeSpent = calculatedTimeSpent;
            console.log('Updated timeSpent from answers:', calculatedTimeSpent);
          }
        }
      } else if (comprehensiveData.questions && comprehensiveData.questions.length > 0) {
        // If we have questions data but no answers data, use that instead
        comprehensiveData.totalQuestions = comprehensiveData.questions.length;
        comprehensiveData.correctAnswers = comprehensiveData.questions.filter(q => q.isCorrect).length;
        comprehensiveData.accuracy = comprehensiveData.totalQuestions > 0
          ? Math.round((comprehensiveData.correctAnswers / comprehensiveData.totalQuestions) * 100)
          : 0;

        // Calculate points earned and total possible points
        comprehensiveData.pointsEarned = comprehensiveData.questions.reduce((total, q) =>
          total + (q.isCorrect ? (q.points || 0) : 0), 0);
        comprehensiveData.totalPossiblePoints = comprehensiveData.questions.reduce((total, q) =>
          total + (q.points || 0), 0);

        // Calculate total time spent from questions if available
        if (comprehensiveData.questions.some(q => q.timeSpent !== undefined)) {
          const calculatedTimeSpent = comprehensiveData.questions.reduce((total, q) =>
            total + (q.timeSpent || 0), 0);

          // Only update if the calculated time is greater than the existing time
          // or if the existing time is 0 or undefined
          if (calculatedTimeSpent > 0 && (!comprehensiveData.timeSpent || calculatedTimeSpent > comprehensiveData.timeSpent)) {
            comprehensiveData.timeSpent = calculatedTimeSpent;
            console.log('Updated timeSpent from questions:', calculatedTimeSpent);
          }
        }
      }

      // If we have questionTimings data, calculate time spent from that as well
      if (comprehensiveData.questionTimings && comprehensiveData.questionTimings.length > 0) {
        const calculatedTimeSpent = comprehensiveData.questionTimings.reduce((total, timing) =>
          total + (timing.timeSpent || 0), 0);

        // Only update if the calculated time is greater than the existing time
        // or if the existing time is 0 or undefined
        if (calculatedTimeSpent > 0 && (!comprehensiveData.timeSpent || calculatedTimeSpent > comprehensiveData.timeSpent)) {
          comprehensiveData.timeSpent = calculatedTimeSpent;
          console.log('Updated timeSpent from questionTimings:', calculatedTimeSpent);
        }
      }

      // Generate category breakdown if not available
      if (!comprehensiveData.categoryBreakdown || comprehensiveData.categoryBreakdown.length === 0) {
        if (comprehensiveData.questions && comprehensiveData.questions.length > 0) {
          const difficultyMap = new Map<string, { correct: number, total: number }>();

          comprehensiveData.questions.forEach(q => {
            const difficulty = q.difficulty || 'Medium';
            const category = `${difficulty} Questions`;

            if (!difficultyMap.has(category)) {
              difficultyMap.set(category, { correct: 0, total: 0 });
            }

            const data = difficultyMap.get(category)!;
            data.total += 1;
            if (q.isCorrect) {
              data.correct += 1;
            }
          });

          comprehensiveData.categoryBreakdown = Array.from(difficultyMap.entries()).map(([category, data]) => ({
            category,
            correct: data.correct,
            total: data.total,
            percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
          }));
        }
      }

      console.log('Final comprehensive data:', comprehensiveData);
      return comprehensiveData as ComprehensiveAttemptData;
    } catch (error) {
      console.error('Error fetching comprehensive attempt data:', error);
      toast("Failed to fetch attempt data");
      throw error;
    }
  }
};