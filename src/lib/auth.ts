// Authentication utilities and helpers

import { User, LoginFormData, SignupFormData, AuthResponse, ApiResponse } from './types';

// Local storage keys
const AUTH_TOKEN_KEY = 'rideshare_auth_token';
const AUTH_USER_KEY = 'rideshare_auth_user';

export class AuthService {
  // Get current user from localStorage
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Get auth token from localStorage
  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Store auth data in localStorage
  static setAuthData(user: User, token: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  // Clear auth data from localStorage
  static clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getCurrentUser();
  }

  // Login user
  static async login(credentials: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: ApiResponse<AuthResponse> = await response.json();

      if (result.success && result.data) {
        this.setAuthData(result.data.user, result.data.token);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Register new user
  static async signup(userData: SignupFormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result: ApiResponse<AuthResponse> = await response.json();

      if (result.success && result.data) {
        this.setAuthData(result.data.user, result.data.token);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      // Call logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(updates),
      });

      const result: ApiResponse<User> = await response.json();

      if (result.success && result.data) {
        // Update local storage with new user data
        this.setAuthData(result.data, this.getAuthToken()!);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile. Please try again.',
      };
    }
  }

  // Get auth headers for API requests
  static getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return token
      ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : {
          'Content-Type': 'application/json',
        };
  }

  // Verify if token is still valid
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }
}

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate mock user for development
export const generateMockUser = (userType: 'rider' | 'driver', email: string, name: string): User => {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    userType,
    rating: 4.5 + Math.random() * 0.5, // Rating between 4.5 and 5.0
    createdAt: new Date().toISOString(),
  };
};

// Route protection utility
export const requireAuth = (userType?: 'rider' | 'driver') => {
  const user = AuthService.getCurrentUser();
  const isAuthenticated = AuthService.isAuthenticated();

  if (!isAuthenticated || !user) {
    return { 
      redirect: '/auth/login',
      user: null,
      isAuthenticated: false 
    };
  }

  if (userType && user.userType !== userType) {
    return { 
      redirect: user.userType === 'rider' ? '/rider/dashboard' : '/driver/dashboard',
      user: null,
      isAuthenticated: false 
    };
  }

  return { 
    redirect: null,
    user,
    isAuthenticated: true 
  };
};

// Format user display name
export const formatUserName = (user: User): string => {
  return user.name || user.email.split('@')[0];
};

// Get user avatar URL (mock implementation)
export const getUserAvatarUrl = (user: User): string => {
  if (user.profileImage) return user.profileImage;
  
  // Generate a placeholder avatar URL with user's initials
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://placehold.co/150x150/3b82f6/ffffff?text=${initials}&font=inter`;
};