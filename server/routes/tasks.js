import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for user
router.get('/', (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY CASE priority WHEN "urgent" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 ELSE 4 END, due_date ASC, created_at DESC';

    const tasks = db.prepare(query).all(...params);

    // Parse tags JSON
    const tasksWithParsedTags = tasks.map(task => ({
      ...task,
      tags: JSON.parse(task.tags || '[]')
    }));

    res.json(tasksWithParsedTags);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single task
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.tags = JSON.parse(task.tags || '[]');
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', (req, res) => {
  try {
    const { title, description, priority, due_date, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const tagsJson = JSON.stringify(tags || []);

    db.prepare(`
      INSERT INTO tasks (id, user_id, title, description, priority, due_date, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, title, description || '', priority || 'medium', due_date || null, tagsJson);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    task.tags = JSON.parse(task.tags);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id', (req, res) => {
  try {
    const { title, description, priority, status, due_date, tags } = req.body;
    const taskId = req.params.id;

    // Check if task exists and belongs to user
    const existingTask = db.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).get(taskId, req.user.id);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const tagsJson = tags ? JSON.stringify(tags) : existingTask.tags;
    const completed_at = status === 'completed' && existingTask.status !== 'completed'
      ? new Date().toISOString()
      : existingTask.completed_at;

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, status = ?,
          due_date = ?, tags = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      title || existingTask.title,
      description !== undefined ? description : existingTask.description,
      priority || existingTask.priority,
      status || existingTask.status,
      due_date !== undefined ? due_date : existingTask.due_date,
      tagsJson,
      completed_at,
      taskId,
      req.user.id
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    task.tags = JSON.parse(task.tags);

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
