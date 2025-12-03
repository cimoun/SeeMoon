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
    const task = db.tasks.findById(id);

    if (!task || task.user_id !== authUser.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.method === 'GET') {
      return res.json(task);
    }

    if (req.method === 'PUT') {
      const { title, description, priority, status, due_date, tags } = req.body;

      const completed_at = status === 'completed' && task.status !== 'completed'
        ? new Date().toISOString()
        : task.completed_at;

      const updated = db.tasks.update(id, {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        status: status || task.status,
        due_date: due_date !== undefined ? due_date : task.due_date,
        tags: tags || task.tags,
        completed_at,
      });

      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      db.tasks.delete(id);
      return res.json({ message: 'Task deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
