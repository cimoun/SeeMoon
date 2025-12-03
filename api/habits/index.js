import { db, generateId, getAuthUser, cors } from '../_lib/db.js';

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
      const habits = db.habits.findByUser(authUser.id);
      const today = new Date().toISOString().split('T')[0];

      // Add today's count to each habit
      const habitsWithToday = habits.map(habit => {
        const todayLog = db.habitLogs.findByHabitAndDate(habit.id, today);
        return {
          ...habit,
          today_count: todayLog?.count || 0,
          today_notes: todayLog?.notes || '',
        };
      });

      return res.json(habitsWithToday);
    }

    if (req.method === 'POST') {
      const { name, description, icon, color, frequency, target } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const habit = db.habits.create({
        id: generateId(),
        user_id: authUser.id,
        name,
        description: description || '',
        icon: icon || 'star',
        color: color || '#58a6ff',
        frequency: frequency || 'daily',
        target: target || 1,
        created_at: new Date().toISOString(),
      });

      return res.status(201).json(habit);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Habits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
