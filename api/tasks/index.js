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
      let tasks = db.tasks.findByUser(authUser.id);

      const { status, priority, search } = req.query;

      if (status) {
        tasks = tasks.filter(t => t.status === status);
      }
      if (priority) {
        tasks = tasks.filter(t => t.priority === priority);
      }
      if (search) {
        const s = search.toLowerCase();
        tasks = tasks.filter(t =>
          t.title.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s)
        );
      }

      // Sort by priority and due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.due_date && b.due_date) {
          return new Date(a.due_date) - new Date(b.due_date);
        }
        return 0;
      });

      return res.json(tasks);
    }

    if (req.method === 'POST') {
      const { title, description, priority, due_date, tags } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const now = new Date().toISOString();
      const task = db.tasks.create({
        id: generateId(),
        user_id: authUser.id,
        title,
        description: description || '',
        priority: priority || 'medium',
        status: 'pending',
        due_date: due_date || null,
        tags: tags || [],
        created_at: now,
        updated_at: now,
        completed_at: null,
      });

      return res.status(201).json(task);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
