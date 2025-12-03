import { cors } from './_lib/db.js';

export default function handler(req, res) {
  cors(res);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
