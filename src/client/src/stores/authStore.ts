import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user' | 'rdc';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        error: null 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ 
        error, 
        isLoading: false 
      }),
      
      logout: () => {
        // Clear localStorage completely for complete logout
        localStorage.removeItem('pm-auth-storage');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        // Reset state
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
          error: null 
        });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'pm-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
