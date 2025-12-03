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
    const notes = db.notes.findByUser(authUser.id);
    const today = new Date().toISOString().split('T')[0];

    // Task stats
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress').length;
    const due_today = tasks.filter(t => t.due_date === today && t.status !== 'completed').length;
    const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length;

    // Habits completed today
    let completed_today = 0;
    for (const habit of habits) {
      const todayLog = db.habitLogs.findByHabitAndDate(habit.id, today);
      if (todayLog && todayLog.count >= habit.target) {
        completed_today++;
      }
    }

    // Simple streak calculation
    let streak = 0;
    // (simplified - just check if any habit was done today)
    if (completed_today > 0) streak = 1;

    res.json({
      tasks: {
        total,
        completed,
        pending,
        in_progress,
        due_today,
        overdue,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      notes: {
        count: notes.length,
      },
      habits: {
        total: habits.length,
        completed_today,
        streak,
      },
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
