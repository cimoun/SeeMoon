import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get all habits with today's logs
router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const habits = db.prepare(`
      SELECT h.*,
             COALESCE(hl.count, 0) as today_count,
             hl.notes as today_notes
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ?
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC
    `).all(today, req.user.id);

    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get habit with logs for a date range
router.get('/:id', (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const habit = db.prepare(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    let logsQuery = 'SELECT * FROM habit_logs WHERE habit_id = ?';
    const params = [req.params.id];

    if (start_date && end_date) {
      logsQuery += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    logsQuery += ' ORDER BY date DESC';

    const logs = db.prepare(logsQuery).all(...params);

    res.json({ ...habit, logs });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create habit
router.post('/', (req, res) => {
  try {
    const { name, description, icon, color, frequency, target } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO habits (id, user_id, name, description, icon, color, frequency, target)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      name,
      description || '',
      icon || 'star',
      color || '#58a6ff',
      frequency || 'daily',
      target || 1
    );

    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update habit
router.put('/:id', (req, res) => {
  try {
    const { name, description, icon, color, frequency, target } = req.body;
    const habitId = req.params.id;

    const existingHabit = db.prepare(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?'
    ).get(habitId, req.user.id);

    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    db.prepare(`
      UPDATE habits
      SET name = ?, description = ?, icon = ?, color = ?, frequency = ?, target = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name || existingHabit.name,
      description !== undefined ? description : existingHabit.description,
      icon || existingHabit.icon,
      color || existingHabit.color,
      frequency || existingHabit.frequency,
      target || existingHabit.target,
      habitId,
      req.user.id
    );

    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete habit
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM habits WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Log habit completion
router.post('/:id/log', (req, res) => {
  try {
    const { date, count, notes } = req.body;
    const habitId = req.params.id;
    const logDate = date || new Date().toISOString().split('T')[0];

    // Check if habit exists and belongs to user
    const habit = db.prepare(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?'
    ).get(habitId, req.user.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Check for existing log
    const existingLog = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?'
    ).get(habitId, logDate);

    if (existingLog) {
      // Update existing log
      db.prepare(`
        UPDATE habit_logs
        SET count = ?, notes = ?
        WHERE habit_id = ? AND date = ?
      `).run(count || existingLog.count + 1, notes || existingLog.notes, habitId, logDate);
    } else {
      // Create new log
      const id = uuidv4();
      db.prepare(`
        INSERT INTO habit_logs (id, habit_id, user_id, date, count, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, habitId, req.user.id, logDate, count || 1, notes || '');
    }

    const log = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?'
    ).get(habitId, logDate);

    res.json(log);
  } catch (error) {
    console.error('Log habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get habit logs for heatmap (last 365 days)
router.get('/:id/heatmap', (req, res) => {
  try {
    const habitId = req.params.id;

    const habit = db.prepare(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?'
    ).get(habitId, req.user.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const logs = db.prepare(`
      SELECT date, count FROM habit_logs
      WHERE habit_id = ? AND date >= date('now', '-365 days')
      ORDER BY date ASC
    `).all(habitId);

    res.json(logs);
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
