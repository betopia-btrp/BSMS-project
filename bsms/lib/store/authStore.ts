import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '@/types';
import { apiRequest } from '@/lib/api/client';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        const { token, user } = useAuthStore.getState();
        if (!token || user) return;

        try {
          const response = await apiRequest<{ user: User }>('/me', { token });
          set({ user: response.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiRequest<{ token: string; user: User }>('/login', {
            method: 'POST',
            body: { email, password },
          });
          set({ user: response.user, token: response.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error instanceof Error ? error.message : 'Invalid email or password' };
        }
      },

      logout: () => {
        const { token } = useAuthStore.getState();
        if (token) {
          void apiRequest('/logout', { method: 'POST', token }).catch(() => undefined);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await apiRequest('/register', { method: 'POST', body: data });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
        }
      },
    }),
    { name: 'bsms-auth' }
  )
);
