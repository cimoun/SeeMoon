import { db, getAuthUser, cors } from '../_lib/db.js';

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
    const habits = db.habits.findByUser(authUser.id);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get last 7 days
    const result = days.map((day, index) => {
      // Count tasks completed on this day of week (last 7 days)
      const tasksCount = tasks.filter(t => {
        if (!t.completed_at) return false;
        const date = new Date(t.completed_at);
        const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff < 7 && date.getDay() === index;
      }).length;

      // Count habits done on this day
      let habitsCount = 0;
      for (const habit of habits) {
        const logs = db.habitLogs.findByHabit(habit.id);
        habitsCount += logs.filter(log => {
          const date = new Date(log.date);
          const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff < 7 && date.getDay() === index;
        }).length;
      }

      return { day, tasks: tasksCount, habits: habitsCount };
    });

    res.json(result);
  } catch (error) {
    console.error('Weekly error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
