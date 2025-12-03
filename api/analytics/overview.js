import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seemoon-demo-secret-key-2024';

if (!global.db) {
  global.db = { users: new Map(), tasks: new Map(), notes: new Map(), habits: new Map(), habitLogs: new Map() };
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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const today = new Date().toISOString().split('T')[0];

    let tasks = [], notes = [], habits = [];
    for (const t of global.db.tasks.values()) if (t.user_id === authUser.id) tasks.push(t);
    for (const n of global.db.notes.values()) if (n.user_id === authUser.id) notes.push(n);
    for (const h of global.db.habits.values()) if (h.user_id === authUser.id) habits.push(h);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress').length;
    const due_today = tasks.filter(t => t.due_date === today && t.status !== 'completed').length;
    const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length;

    let completed_today = 0;
    for (const habit of habits) {
      for (const log of global.db.habitLogs.values()) {
        if (log.habit_id === habit.id && log.date === today && log.count >= habit.target) {
          completed_today++;
          break;
        }
      }
    }

    return res.json({
      tasks: {
        total,
        completed,
        pending,
        in_progress,
        due_today,
        overdue,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      notes: { count: notes.length },
      habits: {
        total: habits.length,
        completed_today,
        streak: completed_today > 0 ? 1 : 0,
      },
    });
  } catch (error) {
    console.error('Overview error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
