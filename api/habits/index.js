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

  try {
    if (req.method === 'GET') {
      const today = new Date().toISOString().split('T')[0];
      let habits = [];

      for (const habit of global.db.habits.values()) {
        if (habit.user_id === authUser.id) {
          let todayLog = null;
          for (const log of global.db.habitLogs.values()) {
            if (log.habit_id === habit.id && log.date === today) {
              todayLog = log;
              break;
            }
          }
          habits.push({
            ...habit,
            today_count: todayLog?.count || 0,
          });
        }
      }

      return res.json(habits);
    }

    if (req.method === 'POST') {
      const { name, description, icon, color, frequency, target } = req.body || {};
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const habit = {
        id: generateId(),
        user_id: authUser.id,
        name,
        description: description || '',
        icon: icon || 'star',
        color: color || '#58a6ff',
        frequency: frequency || 'daily',
        target: target || 1,
        created_at: new Date().toISOString(),
      };

      global.db.habits.set(habit.id, habit);
      return res.status(201).json(habit);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Habits error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
