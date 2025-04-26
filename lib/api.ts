import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // This is important for cookies
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

export default api; 