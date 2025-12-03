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
    const { days = 30 } = req.query;
    const tasks = db.tasks.findByUser(authUser.id);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const result = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const completed = tasks.filter(t =>
        t.completed_at && t.completed_at.startsWith(dateStr)
      ).length;
      result.push({ date: dateStr, completed });
    }

    res.json(result);
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
