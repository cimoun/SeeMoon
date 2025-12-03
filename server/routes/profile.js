import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get profile
router.get('/', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, username, avatar, bio, created_at, updated_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stats
    const taskStats = db.prepare(`
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM tasks WHERE user_id = ?
    `).get(req.user.id);

    const notesCount = db.prepare(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?'
    ).get(req.user.id);

    const habitsCount = db.prepare(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = ?'
    ).get(req.user.id);

    res.json({
      ...user,
      stats: {
        total_tasks: taskStats.total_tasks || 0,
        completed_tasks: taskStats.completed_tasks || 0,
        notes_count: notesCount.count || 0,
        habits_count: habitsCount.count || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/', (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = db.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).get(username, req.user.id);

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    db.prepare(`
      UPDATE users
      SET username = ?, bio = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      username || currentUser.username,
      bio !== undefined ? bio : currentUser.bio,
      avatar !== undefined ? avatar : currentUser.avatar,
      req.user.id
    );

    const user = db.prepare(`
      SELECT id, email, username, avatar, bio, created_at, updated_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    db.prepare(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(hashedPassword, req.user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account
router.delete('/', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user (cascades to tasks, notes, habits)
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
