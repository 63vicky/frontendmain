import { api } from '../api';
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
    try {
      // Ensure role is a string and valid
      const roleStr = String(role).toLowerCase() as "principal" | "teacher" | "student";
      
      // Clear any existing auth data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name) {
            document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
      }

      // Now login with the new role
      const response = await api.post<LoginResponse>('/auth/login', { 
        email, 
        password,
        role: roleStr // Send the role as a lowercase string
      });
      
      const { token, user } = response.data;
      
      // Verify the role matches what we requested
      if (user.role.toLowerCase() !== roleStr) {
        throw new Error(`Role mismatch: Expected ${roleStr} but got ${user.role}`);
      }
      
      // Store token and user role in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  async register(userData: Partial<User>): Promise<RegisterResponse> {
    try {
      // Ensure role is a string and valid
      if (userData.role) {
        userData.role = String(userData.role).toLowerCase() as "principal" | "teacher" | "student";
      }
      
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token and user role in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // Log the start of the logout process
        console.log('Starting logout process...');
        
        // Log current state
        console.log('Before logout - localStorage:', Object.keys(localStorage));
        console.log('Before logout - cookies:', document.cookie);
        
        // Try to call the server logout endpoint
        try {
          await api.post('/auth/logout');
          console.log('Server logout successful');
        } catch (error) {
          console.error('Server logout failed:', error);
        }
        
        // Clear localStorage
        localStorage.clear();
        console.log('localStorage cleared');
        
        // Clear sessionStorage
        sessionStorage.clear();
        console.log('sessionStorage cleared');
        
        // Clear all cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name) {
            document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        // Log state after clearing
        console.log('After logout - localStorage:', Object.keys(localStorage));
        console.log('After logout - cookies:', document.cookie);
        
        // Redirect to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect even if there's an error
        window.location.href = '/login';
      }
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    console.log('Current user:', userStr);
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
    return userRole?.toLowerCase() === role.toLowerCase();
  },

  hasAnyRole(roles: string[]): boolean {
    if (typeof window === 'undefined') return false;
    const userRole = localStorage.getItem('userRole');
    return roles.map(r => r.toLowerCase()).includes(userRole?.toLowerCase() || '');
  }
}; 