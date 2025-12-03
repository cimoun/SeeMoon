import { db, getAuthUser, hashPassword, comparePassword, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = db.users.findById(authUser.id);
    const valid = await comparePassword(current_password, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(new_password);
    db.users.update(authUser.id, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
