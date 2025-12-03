import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seemoon-demo-secret-key-2024';

if (!global.db) {
  global.db = { users: new Map(), tasks: new Map(), notes: new Map(), habits: new Map(), habitLogs: new Map() };
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    return jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const habit = global.db.habits.get(id);

  if (!habit || habit.user_id !== authUser.id) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  try {
    if (req.method === 'GET') {
      const logs = [];
      for (const log of global.db.habitLogs.values()) {
        if (log.habit_id === id) logs.push(log);
      }
      return res.json({ ...habit, logs });
    }

    if (req.method === 'PUT') {
      const { name, description, icon, color, frequency, target } = req.body || {};

      const updated = {
        ...habit,
        name: name || habit.name,
        description: description !== undefined ? description : habit.description,
        icon: icon || habit.icon,
        color: color || habit.color,
        frequency: frequency || habit.frequency,
        target: target || habit.target,
      };

      global.db.habits.set(id, updated);
      return res.json(updated);
    }

    if (req.method === 'POST') {
      // Log habit completion
      const { date, count, notes } = req.body || {};
      const logDate = date || new Date().toISOString().split('T')[0];

      let existingLog = null;
      let existingLogId = null;
      for (const [logId, log] of global.db.habitLogs.entries()) {
        if (log.habit_id === id && log.date === logDate) {
          existingLog = log;
          existingLogId = logId;
          break;
        }
      }

      if (existingLog) {
        const updated = {
          ...existingLog,
          count: count || existingLog.count + 1,
          notes: notes || existingLog.notes,
        };
        global.db.habitLogs.set(existingLogId, updated);
        return res.json(updated);
      }

      const newLog = {
        id: generateId(),
        habit_id: id,
        user_id: authUser.id,
        date: logDate,
        count: count || 1,
        notes: notes || '',
        created_at: new Date().toISOString(),
      };
      global.db.habitLogs.set(newLog.id, newLog);
      return res.json(newLog);
    }

    if (req.method === 'DELETE') {
      global.db.habits.delete(id);
      // Delete logs
      for (const [logId, log] of global.db.habitLogs.entries()) {
        if (log.habit_id === id) global.db.habitLogs.delete(logId);
      }
      return res.json({ message: 'Habit deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Habit error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
