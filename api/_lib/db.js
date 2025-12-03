import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seemoon-demo-secret';

// In-memory storage (resets on cold start - for demo only)
// For production, use Vercel Postgres or external DB
const users = new Map();
const tasks = new Map();
const notes = new Map();
const habits = new Map();
const habitLogs = new Map();

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getAuthUser(req) {
  const authHeader = req.headers.authorization || req.headers.get?.('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Storage helpers
export const db = {
  users: {
    findByEmail: (email) => {
      for (const user of users.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    findByUsername: (username) => {
      for (const user of users.values()) {
        if (user.username === username) return user;
      }
      return null;
    },
    findById: (id) => users.get(id),
    create: (user) => {
      users.set(user.id, user);
      return user;
    },
    update: (id, data) => {
      const user = users.get(id);
      if (!user) return null;
      const updated = { ...user, ...data, updated_at: new Date().toISOString() };
      users.set(id, updated);
      return updated;
    },
    delete: (id) => users.delete(id),
  },
  tasks: {
    findByUser: (userId) => {
      const result = [];
      for (const task of tasks.values()) {
        if (task.user_id === userId) result.push(task);
      }
      return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    findById: (id) => tasks.get(id),
    create: (task) => {
      tasks.set(task.id, task);
      return task;
    },
    update: (id, data) => {
      const task = tasks.get(id);
      if (!task) return null;
      const updated = { ...task, ...data, updated_at: new Date().toISOString() };
      tasks.set(id, updated);
      return updated;
    },
    delete: (id) => tasks.delete(id),
  },
  notes: {
    findByUser: (userId) => {
      const result = [];
      for (const note of notes.values()) {
        if (note.user_id === userId) result.push(note);
      }
      return result.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
    },
    findById: (id) => notes.get(id),
    create: (note) => {
      notes.set(note.id, note);
      return note;
    },
    update: (id, data) => {
      const note = notes.get(id);
      if (!note) return null;
      const updated = { ...note, ...data, updated_at: new Date().toISOString() };
      notes.set(id, updated);
      return updated;
    },
    delete: (id) => notes.delete(id),
  },
  habits: {
    findByUser: (userId) => {
      const result = [];
      for (const habit of habits.values()) {
        if (habit.user_id === userId) result.push(habit);
      }
      return result;
    },
    findById: (id) => habits.get(id),
    create: (habit) => {
      habits.set(habit.id, habit);
      return habit;
    },
    update: (id, data) => {
      const habit = habits.get(id);
      if (!habit) return null;
      const updated = { ...habit, ...data };
      habits.set(id, updated);
      return updated;
    },
    delete: (id) => {
      habits.delete(id);
      // Delete related logs
      for (const [logId, log] of habitLogs.entries()) {
        if (log.habit_id === id) habitLogs.delete(logId);
      }
    },
  },
  habitLogs: {
    findByHabitAndDate: (habitId, date) => {
      for (const log of habitLogs.values()) {
        if (log.habit_id === habitId && log.date === date) return log;
      }
      return null;
    },
    findByHabit: (habitId) => {
      const result = [];
      for (const log of habitLogs.values()) {
        if (log.habit_id === habitId) result.push(log);
      }
      return result;
    },
    create: (log) => {
      habitLogs.set(log.id, log);
      return log;
    },
    update: (id, data) => {
      const log = habitLogs.get(id);
      if (!log) return null;
      const updated = { ...log, ...data };
      habitLogs.set(id, updated);
      return updated;
    },
  },
};

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
