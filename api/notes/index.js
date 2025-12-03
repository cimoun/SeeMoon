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
      let notes = [];
      for (const note of global.db.notes.values()) {
        if (note.user_id === authUser.id) notes.push(note);
      }
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      return res.json(notes);
    }

    if (req.method === 'POST') {
      const { title, content, color } = req.body || {};
      if (!title) return res.status(400).json({ error: 'Title is required' });

      const now = new Date().toISOString();
      const note = {
        id: generateId(),
        user_id: authUser.id,
        title,
        content: content || '',
        color: color || '#1e293b',
        pinned: 0,
        created_at: now,
        updated_at: now,
      };

      global.db.notes.set(note.id, note);
      return res.status(201).json(note);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
