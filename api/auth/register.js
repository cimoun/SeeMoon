import { db, generateId, generateToken, hashPassword, cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    if (db.users.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (db.users.findByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);
    const id = generateId();
    const now = new Date().toISOString();

    const user = db.users.create({
      id,
      email,
      username,
      password: hashedPassword,
      avatar: null,
      bio: '',
      created_at: now,
      updated_at: now,
    });

    const userData = { id: user.id, email: user.email, username: user.username };
    const token = generateToken(userData);

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
