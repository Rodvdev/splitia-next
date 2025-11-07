import { create } from 'zustand';
import { UserResponse } from '@/types';
import { getToken, getRefreshToken, clearAuth } from '@/lib/auth/token';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: UserResponse | null) => void;
  setToken: (token: string | null) => void;
  initializeAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    set({ user, isAuthenticated: !!user });
  },
  setToken: (token) => {
    set({ token });
  },
  initializeAuth: () => {
    if (typeof window === 'undefined') {
      set({ isInitialized: true });
      return;
    }

    // Restore token from localStorage/cookies
    const token = getToken();
    const refreshToken = getRefreshToken();
    
    // Try to restore user from localStorage
    let user: UserResponse | null = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    
    // If we have a token (even expired), consider user as authenticated
    // The API interceptor will handle token refresh if needed
    if (token || refreshToken) {
      set({ 
        token, 
        user, 
        isAuthenticated: true,
        isInitialized: true 
      });
    } else {
      // No token found, clear everything
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isInitialized: true 
      });
    }
  },
  logout: () => {
    clearAuth();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

