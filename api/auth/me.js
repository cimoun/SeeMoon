import { db, getAuthUser, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = db.users.findById(authUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
