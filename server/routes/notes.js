import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get all notes
router.get('/', (req, res) => {
  try {
    const { search, pinned } = req.query;
    let query = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (pinned !== undefined) {
      query += ' AND pinned = ?';
      params.push(pinned === 'true' ? 1 : 0);
    }

    query += ' ORDER BY pinned DESC, updated_at DESC';

    const notes = db.prepare(query).all(...params);
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note
router.get('/:id', (req, res) => {
  try {
    const note = db.prepare(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create note
router.post('/', (req, res) => {
  try {
    const { title, content, color } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO notes (id, user_id, title, content, color)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, title, content || '', color || '#1e293b');

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', (req, res) => {
  try {
    const { title, content, color, pinned } = req.body;
    const noteId = req.params.id;

    const existingNote = db.prepare(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?'
    ).get(noteId, req.user.id);

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, color = ?, pinned = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      title || existingNote.title,
      content !== undefined ? content : existingNote.content,
      color || existingNote.color,
      pinned !== undefined ? (pinned ? 1 : 0) : existingNote.pinned,
      noteId,
      req.user.id
    );

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM notes WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
