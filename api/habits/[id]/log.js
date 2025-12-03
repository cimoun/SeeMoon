import { db, generateId, getAuthUser, cors } from '../../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    const { date, count, notes } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    const existingLog = db.habitLogs.findByHabitAndDate(id, logDate);

    if (existingLog) {
      const updated = db.habitLogs.update(existingLog.id, {
        count: count || existingLog.count + 1,
        notes: notes || existingLog.notes,
      });
      return res.json(updated);
    }

    const log = db.habitLogs.create({
      id: generateId(),
      habit_id: id,
      user_id: authUser.id,
      date: logDate,
      count: count || 1,
      notes: notes || '',
      created_at: new Date().toISOString(),
    });

    return res.json(log);
  } catch (error) {
    console.error('Log habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
