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
      let notes = db.notes.findByUser(authUser.id);

      const { search } = req.query;
      if (search) {
        const s = search.toLowerCase();
        notes = notes.filter(n =>
          n.title.toLowerCase().includes(s) ||
          n.content?.toLowerCase().includes(s)
        );
      }

      return res.json(notes);
    }

    if (req.method === 'POST') {
      const { title, content, color } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const now = new Date().toISOString();
      const note = db.notes.create({
        id: generateId(),
        user_id: authUser.id,
        title,
        content: content || '',
        color: color || '#1e293b',
        pinned: 0,
        created_at: now,
        updated_at: now,
      });

      return res.status(201).json(note);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
