"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager, ApiError } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getToken();
      if (token) {
        const response = await authApi.getMe();
        if (response.success) {
          setUser(response.user);
        }
      }
    } catch (error) {
      // Token invalid or expired
      tokenManager.removeToken();
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success) {
      tokenManager.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API fails
    } finally {
      tokenManager.removeToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const register = async (userData: any) => {
    const response = await authApi.register(userData);
    if (response.success) {
      tokenManager.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
