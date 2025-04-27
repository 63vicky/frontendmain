import axios from 'axios';
import { getToken } from './utils';
import { User, Exam, Result, DashboardStats, RecentExam, ClassPerformance } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: 'principal' | 'teacher' | 'student';
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Create a fetch-based API client that mimics axios interface
const apiClient = {
  async request<T>(config: { url: string; method?: string; data?: any; headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    const { url, method = 'GET', data, headers = {} } = config;

    try {
      const response = await fetch(`${API_URL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server response was not JSON');
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Something went wrong');
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  get<T>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', ...config });
  },

  post<T>(url: string, data?: any, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, ...config });
  },

  put<T>(url: string, data?: any, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, ...config });
  },

  delete<T>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', ...config });
  },
};

// Create a fetch-based API utility
async function fetchWithAuth<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const defaultOptions: RequestOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server response was not JSON');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Export both the axios-style client and the fetch-based API
export const api = {
  // Axios-style methods
  get: <T>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  delete: <T>(url: string, config?: any) => apiClient.delete<T>(url, config),

  // Auth endpoints
  auth: {
    login: (credentials: LoginCredentials) =>
      fetchWithAuth<LoginResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      }),
    register: (userData: any) =>
      fetchWithAuth<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: userData,
      }),
    logout: () =>
      fetchWithAuth('/auth/logout', {
        method: 'POST',
      }),
    refreshToken: () =>
      fetchWithAuth('/auth/refresh-token', {
        method: 'POST',
      }),
  },

  // Exam endpoints
  exams: {
    getAll: () => fetchWithAuth<Exam[]>('/exams'),
    getById: (id: string) => fetchWithAuth<Exam>(`/exams/${id}`),
    create: (examData: any) =>
      fetchWithAuth<Exam>('/exams', {
        method: 'POST',
        body: examData,
      }),
    update: (id: string, examData: any) =>
      fetchWithAuth<Exam>(`/exams/${id}`, {
        method: 'PUT',
        body: examData,
      }),
    delete: (id: string) =>
      fetchWithAuth(`/exams/${id}`, {
        method: 'DELETE',
      }),
  },

  // Results endpoints
  results: {
    getAll: () => fetchWithAuth<Result[]>('/results'),
    getById: (id: string) => fetchWithAuth<Result>(`/results/${id}`),
    create: (resultData: any) =>
      fetchWithAuth<Result>('/results', {
        method: 'POST',
        body: resultData,
      }),
    update: (id: string, resultData: any) =>
      fetchWithAuth<Result>(`/results/${id}`, {
        method: 'PUT',
        body: resultData,
      }),
  },

  // User endpoints
  users: {
    getAll: () => fetchWithAuth<User[]>('/users'),
    getById: (id: string) => fetchWithAuth<User>(`/users/${id}`),
    update: (id: string, userData: any) =>
      fetchWithAuth<User>(`/users/${id}`, {
        method: 'PUT',
        body: userData,
      }),
    delete: (id: string) =>
      fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard endpoints
  dashboard: {
    getStats: () => fetchWithAuth<DashboardStats>('/dashboard/stats'),
    getRecentExams: () => fetchWithAuth<RecentExam[]>('/dashboard/recent-exams'),
    getClassPerformance: () => fetchWithAuth<ClassPerformance[]>('/dashboard/class-performance'),
  },
};

// Teacher Management APIs
export const teacherApi = {
  getAllTeachers: async () => {
    const response = await fetch(`${API_URL}/users/teachers`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return response.json();
  },

  createTeacher: async (teacherData: {
    name: string;
    email: string;
    password: string;
    subject: string;
    classes: string[];
  }) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...teacherData, role: 'teacher' })
    });
    if (!response.ok) throw new Error('Failed to create teacher');
    return response.json();
  },

  updateTeacher: async (id: string, teacherData: {
    name?: string;
    email?: string;
    subject?: string;
    classes?: string[];
    status?: 'active' | 'inactive';
  }) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(teacherData)
    });
    if (!response.ok) throw new Error('Failed to update teacher');
    return response.json();
  },

  deleteTeacher: async (id: string) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete teacher');
    return response.json();
  }
};

// Student Management APIs
export const studentApi = {
  getAllStudents: async (classFilter?: string) => {
    const url = classFilter 
      ? `${API_URL}/users/students?class=${classFilter}`
      : `${API_URL}/users/students`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  createStudent: async (studentData: {
    name: string;
    email: string;
    password: string;
    class: string;
    rollNo: string;
  }) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...studentData, role: 'student' })
    });
    if (!response.ok) throw new Error('Failed to create student');
    return response.json();
  },

  updateStudent: async (id: string, studentData: {
    name?: string;
    email?: string;
    class?: string;
    rollNo?: string;
    status?: 'active' | 'inactive';
  }) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(studentData)
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  deleteStudent: async (id: string) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return response.json();
  }
};

// Class Management APIs
export const classApi = {
  getAllClasses: async () => {
    const response = await fetch(`${API_URL}/classes`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  createClass: async (classData: {
    name: string;
    section: string;
    teacher: string;
    status: 'Active' | 'Inactive';
  }) => {
    const response = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(classData)
    });
    if (!response.ok) throw new Error('Failed to create class');
    return response.json();
  },

  updateClass: async (id: string, classData: {
    name?: string;
    section?: string;
    teacher?: string;
    status?: 'Active' | 'Inactive';
  }) => {
    const response = await fetch(`${API_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(classData)
    });
    if (!response.ok) throw new Error('Failed to update class');
    return response.json();
  },

  deleteClass: async (id: string) => {
    const response = await fetch(`${API_URL}/classes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete class');
    return response.json();
  }
};

// Subject Management
export const getSubjects = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/subjects`, {
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  if (!response.ok) throw new Error('Failed to fetch subjects');
  return response.json();
};

export const getSubjectById = async (id: string) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/subjects/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  if (!response.ok) throw new Error('Failed to fetch subject');
  return response.json();
};

export const createSubject = async (subjectData: any) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/subjects`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(subjectData)
  });
  if (!response.ok) throw new Error('Failed to create subject');
  return response.json();
};

export const updateSubject = async (id: string, subjectData: any) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/subjects/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(subjectData)
  });
  if (!response.ok) throw new Error('Failed to update subject');
  return response.json();
};

export const deleteSubject = async (id: string) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/subjects/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  if (!response.ok) throw new Error('Failed to delete subject');
  return response.json();
};

// Exam Analytics
export const getExamAnalytics = async (classFilter?: string, subjectFilter?: string) => {
  const response = await fetch(
    `${API_URL}/exam-analytics?class=${classFilter || 'all'}&subject=${subjectFilter || 'all'}`,
    {
      credentials: 'include'
    }
  );
  if (!response.ok) throw new Error('Failed to fetch exam analytics');
  return response.json();
};

export default api; 