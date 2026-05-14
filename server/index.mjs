import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tiver-local-dev-change-me';
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const db = JSON.parse(raw);
    if (db.nextId == null && Array.isArray(db.users)) {
      db.nextId = db.users.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1;
    }
    return db;
  } catch {
    return { users: [], nextId: 1 };
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '14d' });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

function publicUser(u) {
  return { id: u.id, email: u.email, displayName: u.displayName, bio: u.bio || '' };
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password || !displayName) {
    res.status(400).json({ error: 'missing_fields' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'password_short' });
    return;
  }
  const db = await readDb();
  if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    res.status(409).json({ error: 'email_taken' });
    return;
  }
  const id = db.nextId ?? db.users.length + 1;
  const user = {
    id,
    email: String(email).trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    displayName: String(displayName).trim(),
    bio: '',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.nextId = id + 1;
  await writeDb(db);
  const token = signToken(id);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: 'missing_fields' });
    return;
  }
  const db = await readDb();
  const user = db.users.find((u) => u.email === String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }
  res.json({ token: signToken(user.id), user: publicUser(user) });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) {
    res.status(401).json({ error: 'user_missing' });
    return;
  }
  res.json(publicUser(user));
});

app.patch('/api/me', authMiddleware, async (req, res) => {
  const { displayName, bio } = req.body || {};
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === req.userId);
  if (idx === -1) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (displayName !== undefined) db.users[idx].displayName = String(displayName).trim() || db.users[idx].displayName;
  if (bio !== undefined) db.users[idx].bio = String(bio).slice(0, 2000);
  await writeDb(db);
  res.json(publicUser(db.users[idx]));
});

app.listen(PORT, () => {
  console.log(`Tiver API http://localhost:${PORT}`);
});
