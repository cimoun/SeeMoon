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

  const { id } = req.query;

  try {
    const habit = db.habits.findById(id);

    if (!habit || habit.user_id !== authUser.id) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const logs = db.habitLogs.findByHabit(id);
    const result = logs.map(log => ({
      date: log.date,
      count: log.count,
    }));

    return res.json(result);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
