import { db, getAuthUser, cors } from '../../_lib/db.js';

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
    const habit = db.habits.findById(id);

    if (!habit || habit.user_id !== authUser.id) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    if (req.method === 'GET') {
      const logs = db.habitLogs.findByHabit(id);
      return res.json({ ...habit, logs });
    }

    if (req.method === 'PUT') {
      const { name, description, icon, color, frequency, target } = req.body;

      const updated = db.habits.update(id, {
        name: name || habit.name,
        description: description !== undefined ? description : habit.description,
        icon: icon || habit.icon,
        color: color || habit.color,
        frequency: frequency || habit.frequency,
        target: target || habit.target,
      });

      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      db.habits.delete(id);
      return res.json({ message: 'Habit deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
