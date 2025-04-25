import api from '../api';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string, role: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { 
      email, 
      password,
      role // Send the selected role to the backend
    });
    const { token, user } = response.data;
    
    // Store token and user role in localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  async register(userData: Partial<User>): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    const { token, user } = response.data;
    
    // Store token and user role in localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  logout(): void {
    // Remove items from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userRole');
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  hasRole(role: string): boolean {
    if (typeof window === 'undefined') return false;
    const userRole = localStorage.getItem('userRole');
    return userRole === role;
  },

  hasAnyRole(roles: string[]): boolean {
    if (typeof window === 'undefined') return false;
    const userRole = localStorage.getItem('userRole');
    return roles.includes(userRole || '');
  }
}; 