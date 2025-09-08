'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginFormData, SignupFormData } from '@/lib/types';
import { AuthService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const isAuthenticated = AuthService.isAuthenticated();

        if (isAuthenticated && currentUser) {
          // Verify token is still valid
          const isTokenValid = await AuthService.verifyToken();
          if (isTokenValid) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.login(credentials);

      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.signup(userData);

      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.updateProfile(updates);

      if (result.success && result.data) {
        setUser(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Profile update failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for protected routes
export function useRequireAuth(requiredUserType?: 'rider' | 'driver') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      setShouldRedirect('/auth/login');
      return;
    }

    if (requiredUserType && user.userType !== requiredUserType) {
      const redirectPath = user.userType === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
      setShouldRedirect(redirectPath);
      return;
    }

    setShouldRedirect(null);
  }, [user, isAuthenticated, isLoading, requiredUserType]);

  return {
    user,
    isAuthenticated,
    isLoading,
    shouldRedirect,
  };
}