import { create } from 'zustand';
import { api } from '../api/client';

export const useTasksStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filter: {
    status: null,
    priority: null,
    search: '',
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filter } = get();
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.search) params.search = filter.search;

      const tasks = await api.getTasks(params);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (task) => {
    try {
      const newTask = await api.createTask(task);
      set({ tasks: [newTask, ...get().tasks] });
      return newTask;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      set({
        tasks: get().tasks.map((t) => (t.id === id ? updatedTask : t)),
      });
      return updatedTask;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleTaskStatus: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return get().updateTask(id, { status: newStatus });
  },

  setFilter: (filter) => {
    set({ filter: { ...get().filter, ...filter } });
    get().fetchTasks();
  },

  clearFilter: () => {
    set({ filter: { status: null, priority: null, search: '' } });
    get().fetchTasks();
  },
}));
