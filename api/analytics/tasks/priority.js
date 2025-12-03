import { db, getAuthUser, cors } from '../../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const tasks = db.tasks.findByUser(authUser.id);

    const priorities = ['low', 'medium', 'high', 'urgent'];
    const result = priorities.map(priority => {
      const filtered = tasks.filter(t => t.priority === priority);
      return {
        priority,
        count: filtered.length,
        completed: filtered.filter(t => t.status === 'completed').length,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Priority error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
