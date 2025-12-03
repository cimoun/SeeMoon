import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get dashboard overview
router.get('/overview', (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Task stats
    const taskStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN due_date = ? AND status != 'completed' THEN 1 ELSE 0 END) as due_today,
        SUM(CASE WHEN due_date < ? AND status != 'completed' THEN 1 ELSE 0 END) as overdue
      FROM tasks WHERE user_id = ?
    `).get(today, today, userId);

    // Notes count
    const notesCount = db.prepare(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?'
    ).get(userId);

    // Habits stats
    const habitsStats = db.prepare(`
      SELECT
        COUNT(DISTINCT h.id) as total_habits,
        COUNT(DISTINCT CASE WHEN hl.date = ? THEN h.id END) as completed_today
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.count >= h.target
      WHERE h.user_id = ?
    `).get(today, userId);

    // Calculate streak (consecutive days with at least one completed habit)
    const streakData = db.prepare(`
      SELECT DISTINCT date FROM habit_logs
      WHERE user_id = ? AND date <= ?
      ORDER BY date DESC
    `).all(userId, today);

    let currentStreak = 0;
    let checkDate = new Date(today);

    for (const log of streakData) {
      const logDate = new Date(log.date);
      const diffDays = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak++;
        checkDate = logDate;
      } else {
        break;
      }
    }

    res.json({
      tasks: {
        total: taskStats.total || 0,
        completed: taskStats.completed || 0,
        pending: taskStats.pending || 0,
        in_progress: taskStats.in_progress || 0,
        due_today: taskStats.due_today || 0,
        overdue: taskStats.overdue || 0,
        completion_rate: taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0
      },
      notes: {
        count: notesCount.count || 0
      },
      habits: {
        total: habitsStats.total_habits || 0,
        completed_today: habitsStats.completed_today || 0,
        streak: currentStreak
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get task completion over time (last 30 days)
router.get('/tasks/timeline', (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const data = db.prepare(`
      SELECT
        date(completed_at) as date,
        COUNT(*) as completed
      FROM tasks
      WHERE user_id = ?
        AND status = 'completed'
        AND completed_at >= date('now', '-' || ? || ' days')
      GROUP BY date(completed_at)
      ORDER BY date ASC
    `).all(userId, days);

    // Fill in missing dates with 0
    const result = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const found = data.find(item => item.date === dateStr);
      result.push({
        date: dateStr,
        completed: found ? found.completed : 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks by priority distribution
router.get('/tasks/priority', (req, res) => {
  try {
    const userId = req.user.id;

    const data = db.prepare(`
      SELECT
        priority,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      WHERE user_id = ?
      GROUP BY priority
    `).all(userId);

    res.json(data);
  } catch (error) {
    console.error('Get priority stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get habit completion heatmap data
router.get('/habits/heatmap', (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 365 } = req.query;

    const data = db.prepare(`
      SELECT
        hl.date,
        COUNT(DISTINCT hl.habit_id) as habits_completed,
        (SELECT COUNT(*) FROM habits WHERE user_id = ?) as total_habits
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.user_id = ?
        AND hl.date >= date('now', '-' || ? || ' days')
        AND hl.count >= h.target
      GROUP BY hl.date
      ORDER BY hl.date ASC
    `).all(userId, userId, days);

    res.json(data);
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weekly productivity summary
router.get('/weekly', (req, res) => {
  try {
    const userId = req.user.id;

    // Last 7 days task completion by day of week
    const weeklyTasks = db.prepare(`
      SELECT
        strftime('%w', completed_at) as day_of_week,
        COUNT(*) as completed
      FROM tasks
      WHERE user_id = ?
        AND status = 'completed'
        AND completed_at >= date('now', '-7 days')
      GROUP BY strftime('%w', completed_at)
    `).all(userId);

    // Last 7 days habit completion
    const weeklyHabits = db.prepare(`
      SELECT
        strftime('%w', date) as day_of_week,
        COUNT(DISTINCT habit_id) as habits_completed
      FROM habit_logs
      WHERE user_id = ?
        AND date >= date('now', '-7 days')
      GROUP BY strftime('%w', date)
    `).all(userId);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map((day, index) => ({
      day,
      tasks: weeklyTasks.find(t => parseInt(t.day_of_week) === index)?.completed || 0,
      habits: weeklyHabits.find(h => parseInt(h.day_of_week) === index)?.habits_completed || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Get weekly error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
