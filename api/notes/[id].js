import { db, getAuthUser, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const note = db.notes.findById(id);

    if (!note || note.user_id !== authUser.id) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (req.method === 'GET') {
      return res.json(note);
    }

    if (req.method === 'PUT') {
      const { title, content, color, pinned } = req.body;

      const updated = db.notes.update(id, {
        title: title || note.title,
        content: content !== undefined ? content : note.content,
        color: color || note.color,
        pinned: pinned !== undefined ? (pinned ? 1 : 0) : note.pinned,
      });

      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      db.notes.delete(id);
      return res.json({ message: 'Note deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
