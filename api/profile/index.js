import { db, getAuthUser, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const user = db.users.findById(authUser.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tasks = db.tasks.findByUser(authUser.id);
      const notes = db.notes.findByUser(authUser.id);
      const habits = db.habits.findByUser(authUser.id);

      const { password, ...userData } = user;

      return res.json({
        ...userData,
        stats: {
          total_tasks: tasks.length,
          completed_tasks: tasks.filter(t => t.status === 'completed').length,
          notes_count: notes.length,
          habits_count: habits.length,
        },
      });
    }

    if (req.method === 'PUT') {
      const { username, bio, avatar } = req.body;

      if (username) {
        const existing = db.users.findByUsername(username);
        if (existing && existing.id !== authUser.id) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      const user = db.users.findById(authUser.id);
      const updated = db.users.update(authUser.id, {
        username: username || user.username,
        bio: bio !== undefined ? bio : user.bio,
        avatar: avatar !== undefined ? avatar : user.avatar,
      });

      const { password, ...userData } = updated;
      return res.json(userData);
    }

    if (req.method === 'DELETE') {
      const { password } = req.body;
      const user = db.users.findById(authUser.id);

      if (!password) {
        return res.status(400).json({ error: 'Password required' });
      }

      // In production, verify password here
      db.users.delete(authUser.id);
      return res.json({ message: 'Account deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
