import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { user } = await api.login(email, password);
      set({ user, isAuthenticated: true, error: null });
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  register: async (email, username, password) => {
    set({ error: null });
    try {
      const { user } = await api.register(email, username, password);
      set({ user, isAuthenticated: true, error: null });
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  logout: () => {
    api.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },

  clearError: () => set({ error: null }),
}));
