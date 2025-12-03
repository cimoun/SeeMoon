import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seemoon-demo-secret-key-2024';

// Global in-memory storage (persists across warm function invocations)
if (!global.db) {
  global.db = {
    users: new Map(),
    tasks: new Map(),
    notes: new Map(),
    habits: new Map(),
    habitLogs: new Map(),
  };
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body || {};

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing users
    for (const user of global.db.users.values()) {
      if (user.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (user.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();
    const now = new Date().toISOString();

    const user = {
      id,
      email,
      username,
      password: hashedPassword,
      avatar: null,
      bio: '',
      created_at: now,
      updated_at: now,
    };

    global.db.users.set(id, user);

    const token = jwt.sign(
      { id, email, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      user: { id, email, username },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
