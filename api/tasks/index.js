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
      let tasks = [];
      for (const task of global.db.tasks.values()) {
        if (task.user_id === authUser.id) tasks.push(task);
      }

      const { status, priority } = req.query || {};
      if (status) tasks = tasks.filter(t => t.status === status);
      if (priority) tasks = tasks.filter(t => t.priority === priority);

      tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.json(tasks);
    }

    if (req.method === 'POST') {
      const { title, description, priority, due_date, tags } = req.body || {};
      if (!title) return res.status(400).json({ error: 'Title is required' });

      const now = new Date().toISOString();
      const task = {
        id: generateId(),
        user_id: authUser.id,
        title,
        description: description || '',
        priority: priority || 'medium',
        status: 'pending',
        due_date: due_date || null,
        tags: tags || [],
        created_at: now,
        updated_at: now,
        completed_at: null,
      };

      global.db.tasks.set(task.id, task);
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tasks error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
