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

  const authUser = getAuthUser(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const task = global.db.tasks.get(id);

  if (!task || task.user_id !== authUser.id) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    if (req.method === 'GET') {
      return res.json(task);
    }

    if (req.method === 'PUT') {
      const { title, description, priority, status, due_date, tags } = req.body || {};

      const completed_at = status === 'completed' && task.status !== 'completed'
        ? new Date().toISOString()
        : task.completed_at;

      const updated = {
        ...task,
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        status: status || task.status,
        due_date: due_date !== undefined ? due_date : task.due_date,
        tags: tags || task.tags,
        completed_at,
        updated_at: new Date().toISOString(),
      };

      global.db.tasks.set(id, updated);
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      global.db.tasks.delete(id);
      return res.json({ message: 'Task deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Task error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
