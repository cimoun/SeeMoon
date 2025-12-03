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

  try {
    const user = global.db.users.get(authUser.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.method === 'GET') {
      let tasks = [], notes = [], habits = [];
      for (const t of global.db.tasks.values()) if (t.user_id === authUser.id) tasks.push(t);
      for (const n of global.db.notes.values()) if (n.user_id === authUser.id) notes.push(n);
      for (const h of global.db.habits.values()) if (h.user_id === authUser.id) habits.push(h);

      return res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        created_at: user.created_at,
        stats: {
          total_tasks: tasks.length,
          completed_tasks: tasks.filter(t => t.status === 'completed').length,
          notes_count: notes.length,
          habits_count: habits.length,
        },
      });
    }

    if (req.method === 'PUT') {
      const { username, bio, avatar } = req.body || {};

      if (username && username !== user.username) {
        for (const u of global.db.users.values()) {
          if (u.username === username && u.id !== authUser.id) {
            return res.status(400).json({ error: 'Username already taken' });
          }
        }
      }

      const updated = {
        ...user,
        username: username || user.username,
        bio: bio !== undefined ? bio : user.bio,
        avatar: avatar !== undefined ? avatar : user.avatar,
        updated_at: new Date().toISOString(),
      };

      global.db.users.set(authUser.id, updated);

      return res.json({
        id: updated.id,
        email: updated.email,
        username: updated.username,
        avatar: updated.avatar,
        bio: updated.bio,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
