// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loadStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      loadStoredToken: async () => {
        console.log('🔵 Loading stored token...');
        const token = localStorage.getItem('userToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            const user = JSON.parse(savedUser);
            set({ user, token });
            console.log('✅ User restored from storage');
          } catch (error) {
            console.log('❌ Invalid stored data, clearing');
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
            set({ user: null, token: null });
          }
        }
      },

      login: async (email: string, password: string) => {
        console.log('🔵 Login attempt:', { email });
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('userToken', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isLoading: false, error: null });
          console.log('✅ Login successful:', user.email);
          return true;
        } catch (error: any) {
          console.error('❌ Login failed:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (userData) => {
        console.log('🔵 Register attempt:', userData.email);
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/register', userData);
          const { token, user } = response.data;
          
          localStorage.setItem('userToken', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isLoading: false, error: null });
          console.log('✅ Registration successful:', user.email);
          return true;
        } catch (error: any) {
          console.error('❌ Registration failed:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: () => {
        console.log('🔵 Logging out');
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        set({ user: null, token: null, error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);