import { User, Exam, Result, DashboardStats, Question } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create an API service for student login features
export const apiService = {
  // Authentication
  auth: {
    login: async (email: string, password: string, role: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    logout: async () => {
      try {
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Logout failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to get current user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get current user error:', error);
        throw error;
      }
    }
  },
  
  // Exams
  exams: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/exams`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get exams error:', error);
        throw error;
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/exams/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch exam');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get exam error:', error);
        throw error;
      }
    },
    
    getByClass: async (classId: string) => {
      try {
        const response = await fetch(`${API_URL}/exams/class/${classId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch exams for class');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get exams by class error:', error);
        throw error;
      }
    },
    
    updateAttempts: async (examId: string, attempts: { current: number, max: number }) => {
      try {
        const response = await fetch(`${API_URL}/exams/${examId}/attempts`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attempts }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update exam attempts');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Update exam attempts error:', error);
        throw error;
      }
    }
  },
  
  // Results
  results: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/results`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get results error:', error);
        throw error;
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/results/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get result error:', error);
        throw error;
      }
    },
    
    getByStudent: async (studentId: string) => {
      try {
        const response = await fetch(`${API_URL}/results/student/${studentId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch results for student');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get results by student error:', error);
        throw error;
      }
    },
    
    getByExam: async (examId: string) => {
      try {
        const response = await fetch(`${API_URL}/results/exam/${examId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch results for exam');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get results by exam error:', error);
        throw error;
      }
    },
    
    create: async (resultData: any) => {
      try {
        const response = await fetch(`${API_URL}/results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultData),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to create result');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Create result error:', error);
        throw error;
      }
    }
  },
  
  // Dashboard
  dashboard: {
    getStats: async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get dashboard stats error:', error);
        throw error;
      }
    }
  },
  
  // Users
  users: {
    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/users/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get user error:', error);
        throw error;
      }
    },
    
    updateProfile: async (id: string, userData: any) => {
      try {
        const response = await fetch(`${API_URL}/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user profile');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Update user profile error:', error);
        throw error;
      }
    }
  },
  
  // Classes
  classes: {
    getAll: async () => {
      try {
        const response = await fetch(`${API_URL}/classes`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get classes error:', error);
        throw error;
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await fetch(`${API_URL}/classes/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch class');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get class error:', error);
        throw error;
      }
    },
    
    getStudentClasses: async (studentId: string) => {
      try {
        const response = await fetch(`${API_URL}/classes/student/${studentId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student classes');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get student classes error:', error);
        throw error;
      }
    }
  },
  
  // Attendance
  attendance: {
    getStudentAttendance: async (studentId: string) => {
      try {
        const response = await fetch(`${API_URL}/attendance/student/${studentId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student attendance');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get student attendance error:', error);
        throw error;
      }
    }
  }
};
