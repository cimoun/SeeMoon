const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(email, username, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id, task) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Notes
  async getNotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notes${query ? `?${query}` : ''}`);
  }

  async getNote(id) {
    return this.request(`/notes/${id}`);
  }

  async createNote(note) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id, note) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits
  async getHabits() {
    return this.request('/habits');
  }

  async getHabit(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/habits/${id}${query ? `?${query}` : ''}`);
  }

  async createHabit(habit) {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    });
  }

  async updateHabit(id, habit) {
    return this.request(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habit),
    });
  }

  async deleteHabit(id) {
    return this.request(`/habits/${id}`, {
      method: 'DELETE',
    });
  }

  async logHabit(id, data = {}) {
    return this.request(`/habits/${id}/log`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHabitHeatmap(id) {
    return this.request(`/habits/${id}/heatmap`);
  }

  // Analytics
  async getOverview() {
    return this.request('/analytics/overview');
  }

  async getTasksTimeline(days = 30) {
    return this.request(`/analytics/tasks/timeline?days=${days}`);
  }

  async getTasksPriority() {
    return this.request('/analytics/tasks/priority');
  }

  async getHabitsHeatmap(days = 365) {
    return this.request(`/analytics/habits/heatmap?days=${days}`);
  }

  async getWeeklyStats() {
    return this.request('/analytics/weekly');
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async deleteAccount(password) {
    return this.request('/profile', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }
}

export const api = new ApiClient();
