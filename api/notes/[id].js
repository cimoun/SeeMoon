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
  const note = global.db.notes.get(id);

  if (!note || note.user_id !== authUser.id) {
    return res.status(404).json({ error: 'Note not found' });
  }

  try {
    if (req.method === 'GET') {
      return res.json(note);
    }

    if (req.method === 'PUT') {
      const { title, content, color, pinned } = req.body || {};

      const updated = {
        ...note,
        title: title || note.title,
        content: content !== undefined ? content : note.content,
        color: color || note.color,
        pinned: pinned !== undefined ? (pinned ? 1 : 0) : note.pinned,
        updated_at: new Date().toISOString(),
      };

      global.db.notes.set(id, updated);
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      global.db.notes.delete(id);
      return res.json({ message: 'Note deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Note error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
