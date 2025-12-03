import { create } from 'zustand';
import { api } from '../api/client';

export const useHabitsStore = create((set, get) => ({
  habits: [],
  selectedHabit: null,
  heatmapData: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const habits = await api.getHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchHabitDetails: async (id, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const habit = await api.getHabit(id, params);
      set({ selectedHabit: habit });
      return habit;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addHabit: async (habit) => {
    try {
      const newHabit = await api.createHabit(habit);
      set({ habits: [...get().habits, { ...newHabit, today_count: 0 }] });
      return newHabit;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const updatedHabit = await api.updateHabit(id, updates);
      const oldHabit = get().habits.find((h) => h.id === id);
      set({
        habits: get().habits.map((h) =>
          h.id === id ? { ...updatedHabit, today_count: oldHabit?.today_count || 0 } : h
        ),
      });
      return updatedHabit;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      await api.deleteHabit(id);
      set({
        habits: get().habits.filter((h) => h.id !== id),
        selectedHabit: get().selectedHabit?.id === id ? null : get().selectedHabit,
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  logHabit: async (id, data = {}) => {
    try {
      const log = await api.logHabit(id, data);
      set({
        habits: get().habits.map((h) =>
          h.id === id ? { ...h, today_count: log.count } : h
        ),
      });
      return log;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchHeatmap: async (id) => {
    try {
      const data = await api.getHabitHeatmap(id);
      set({ heatmapData: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));
