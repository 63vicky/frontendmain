import axios from 'axios';
import { getToken } from './utils';
import { User, Exam, Result, DashboardStats, RecentExam, ClassPerformance, Class, Student, ClassFormData, Teacher } from './types';

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
    const { url, method = 'GET', data, headers = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    } } = config;

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
    getByClass: (classId: string) => fetchWithAuth<Exam[]>(`/exams/class/${classId}`),
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
      getAllStudents: (classId?: string) =>
        fetchWithAuth<Student[]>(`/users/students?class=${classId}`),
      getAllTeachers: () => fetchWithAuth<Teacher[]>('/users/teachers'),
  },

  // Dashboard endpoints
  dashboard: {
    getStats: () => fetchWithAuth<DashboardStats>('/dashboard/stats'),
    getRecentExams: () => fetchWithAuth<RecentExam[]>('/dashboard/recent-exams'),
    getClassPerformance: () => fetchWithAuth<ClassPerformance[]>('/dashboard/class-performance'),
  },

  // Question Management APIs
  questions: {
    getAll: async (filters?: {
      subject?: string;
      className?: string;
      type?: string;
      difficulty?: string;
      search?: string;
      teacherId?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      const response = await fetch(`${API_URL}/questions?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/questions/${id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch question');
      return response.json();
    },

    create: async (questionData: {
      text: string;
      type: 'multiple-choice' | 'short-answer' | 'descriptive';
      subject: string;
      className: string;
      chapter?: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      time: number;
      tags?: string[];
    }) => {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
        credentials: 'include',
        body: JSON.stringify(questionData)
      });
      if (!response.ok) throw new Error('Failed to create question');
      return response.json();
    },

    update: async (id: string, questionData: {
      text?: string;
      type?: 'multiple-choice' | 'short-answer' | 'descriptive';
      subject?: string;
      className?: string;
      chapter?: string;
      difficulty?: 'Easy' | 'Medium' | 'Hard';
      options?: string[];
      correctAnswer?: string | string[];
      points?: number;
      time?: number;
      tags?: string[];
      status?: 'Active' | 'Inactive';
    }) => {
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
        credentials: 'include',
        body: JSON.stringify(questionData)
      });
      if (!response.ok) throw new Error('Failed to update question');
      return response.json();
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete question');
      }
      return data;
    },

    addToExam: async (id: string, examId: string) => {
      const response = await fetch(`${API_URL}/questions/${id}/add-to-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ examId })
      });
      if (!response.ok) throw new Error('Failed to add question to exam');
      return response.json();
    },

    removeFromExam: async (id: string, examId: string) => {
      const response = await fetch(`${API_URL}/questions/${id}/remove-from-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ examId })
      });
      if (!response.ok) throw new Error('Failed to remove question from exam');
      return response.json();
    },

    getSubjects: async () => {
      const response = await fetch(`${API_URL}/questions/subjects`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },

    getClasses: async () => {
      const response = await fetch(`${API_URL}/questions/classes`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    },

    getChapters: async (subject: string) => {
      const response = await fetch(`${API_URL}/questions/chapters/${subject}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return response.json();
    }
  },

  // Class endpoints
  classes: {
    getAll: () => fetchWithAuth<Class[]>('/classes'),
    getById: (id: string) => fetchWithAuth<Class>(`/classes/${id}`),
    create: (classData: any) =>
      fetchWithAuth<Class>('/classes', {
        method: 'POST',
        body: classData,
      }),
    update: (id: string, classData: any) =>
      fetchWithAuth<Class>(`/classes/${id}`, {
        method: 'PUT',
        body: classData,
      }),
    delete: (id: string) =>
      fetchWithAuth(`/classes/${id}`, {
        method: 'DELETE',
      }),
    getStudents: (id: string) =>
      fetchWithAuth<Student[]>(`/classes/${id}/students`),

    addStudents: (id: string, studentIds: string[]) =>
      fetchWithAuth(`/classes/${id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ studentIds }),
      }),

    removeStudents: (id: string, studentIds: string[]) =>
      fetchWithAuth(`/classes/${id}/remove-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ studentIds }),
      }),
  },

  // Teacher endpoints
  teachers: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/users/teachers`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    },
    getById: (id: string) => fetchWithAuth<Teacher>(`/users/${id}`),
    update: (id: string, teacherData: any) =>
      fetchWithAuth<Teacher>(`/users/${id}`, {
        method: 'PUT',
        body: teacherData,
      }),
    delete: (id: string) =>
      fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Materials endpoints
  materials: {
    getAll: () => fetchWithAuth<any[]>('/materials'),
    getById: (id: string) => fetchWithAuth<any>(`/materials/${id}`),
    getByClass: (classId: string) => fetchWithAuth<any[]>(`/materials/class/${classId}`),
    create: (formData: FormData) => {
      return fetch(`${API_URL}/materials`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(response => {
        if (!response.ok) throw new Error('Failed to upload material');
        return response.json();
      });
    },
    update: (id: string, formData: FormData) => {
      return fetch(`${API_URL}/materials/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      }).then(response => {
        if (!response.ok) throw new Error('Failed to update material');
        return response.json();
      });
    },
    delete: (id: string) =>
      fetchWithAuth(`/materials/${id}`, {
        method: 'DELETE',
      }),
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
    subject: string;
    schedule: string;
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
    subject?: string;
    schedule?: string;
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
    try {
      const response = await axios.delete(`${API_URL}/classes/${id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (response.status !== 200) throw new Error('Failed to delete class');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract the error message from the response
        const errorMessage = error.response.data.message || 'Failed to delete class';
        throw new Error(errorMessage);
      }
      // Re-throw the original error if it's not an Axios error
      throw error;
    }
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

// Bulk Upload APIs
export const bulkUploadApi = {
  // Get all bulk uploads
  getAllUploads: async (type?: string) => {
    const url = type
      ? `${API_URL}/bulk-uploads?type=${type}`
      : `${API_URL}/bulk-uploads`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch bulk uploads');
    return response.json();
  },

  // Get bulk upload by ID
  getUploadById: async (id: string) => {
    const response = await fetch(`${API_URL}/bulk-uploads/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch bulk upload');
    return response.json();
  },

  // Get uploaded records for a specific bulk upload
  getUploadedRecords: async (id: string) => {
    const response = await fetch(`${API_URL}/bulk-uploads/${id}/records`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch uploaded records');
    return response.json();
  },

  // Upload students in bulk
  uploadStudents: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/bulk-uploads/students`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload students');
    }
    return response.json();
  },

  // Upload teachers in bulk
  uploadTeachers: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/bulk-uploads/teachers`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload teachers');
    }
    return response.json();
  },

  // Upload questions in bulk
  uploadQuestions: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/bulk-uploads/questions`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload questions');
    }
    return response.json();
  },

  // Download student template
  downloadStudentTemplate: () => {
    window.open(`${API_URL}/bulk-uploads/templates/students`, '_blank');
  },

  // Download teacher template
  downloadTeacherTemplate: () => {
    window.open(`${API_URL}/bulk-uploads/templates/teachers`, '_blank');
  },

  // Download question template
  downloadQuestionTemplate: () => {
    window.open(`${API_URL}/bulk-uploads/templates/questions`, '_blank');
  },


};

export default api;

