// ────────────────────────────────────────────────────────────────
//  EggerMath backend API — user accounts, favorites, reviews, reports
//  Zero-dependency: JSON file store + Node crypto (scrypt + tokens)
// ────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const MAX_BODY = 64 * 1024;
const SESSION_TTL = 30 * 24 * 3600 * 1000; // 30 days

const db = loadDb();

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return Object.assign({ users: [], tokens: {}, favorites: {}, reviews: {}, reports: {} }, raw);
    }
  } catch (e) {
    console.error('[api] corrupt db.json, resetting:', e.message);
  }
  return { users: [], tokens: {}, favorites: {}, reviews: {}, reports: {} };
}

let writeQueue = Promise.resolve();
function saveDb() {
  writeQueue = writeQueue.then(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = DB_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error('[api] save failed:', e.message);
    }
  });
  return writeQueue;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        req.destroy();
        return reject(new Error('Body too large'));
      }
      body += c;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function authUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.headers['x-auth-token'] || '');
  if (!token) return null;
  const entry = db.tokens[token];
  if (!entry) return null;
  if (Date.now() - entry.createdAt > SESSION_TTL) {
    delete db.tokens[token];
    saveDb();
    return null;
  }
  const user = db.users.find(u => u.id === entry.userId);
  if (!user) return null;
  return { token, user };
}

function makeToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.tokens[token] = { userId, createdAt: Date.now() };
  saveDb();
  return token;
}

function publicUser(u) {
  return { id: u.id, username: u.username, email: u.email || '', createdAt: u.createdAt };
}

const ROUTES = {};

function api(method, pathname, handler) {
  const key = method + ' ' + pathname;
  ROUTES[key] = handler;
  const keys = pathname.split('/').filter(Boolean);
  const pattern = '^/' + pathname.split('/').filter(Boolean).map(seg => seg.startsWith(':') ? '([^/]+)' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/') + '$';
  api.patterns = api.patterns || [];
  api.patterns.push({ key, method, pattern: new RegExp(pattern), keys });
}

// ── Auth ────────────────────────────────────────────────────────
api('POST', '/api/auth/register', async (req, res) => {
  const b = await readBody(req);
  const username = String(b.username || '').trim();
  const password = String(b.password || '');
  const email = String(b.email || '').trim();
  if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    return sendJson(res, 400, { error: 'Username must be 3-20 chars (letters, numbers, _ or -).' });
  }
  if (password.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: 'Invalid email address.' });
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return sendJson(res, 409, { error: 'That username is already taken.' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
    username,
    email,
    salt,
    hash: hashPassword(password, salt),
    createdAt: Date.now(),
  };
  db.users.push(user);
  saveDb();
  const token = makeToken(user.id);
  sendJson(res, 201, { token, user: publicUser(user) });
});

api('POST', '/api/auth/login', async (req, res) => {
  const b = await readBody(req);
  const username = String(b.username || '').trim();
  const password = String(b.password || '');
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || hashPassword(password, user.salt) !== user.hash) {
    return sendJson(res, 401, { error: 'Invalid username or password.' });
  }
  const token = makeToken(user.id);
  sendJson(res, 200, { token, user: publicUser(user) });
});

api('POST', '/api/auth/logout', (req, res) => {
  const a = authUser(req);
  if (a) {
    delete db.tokens[a.token];
    saveDb();
  }
  sendJson(res, 200, { ok: true });
});

api('GET', '/api/auth/me', (req, res) => {
  const a = authUser(req);
  if (!a) return sendJson(res, 401, { error: 'Not logged in.' });
  sendJson(res, 200, { user: publicUser(a.user) });
});

// ── Favorites ────────────────────────────────────────────────────
api('GET', '/api/favorites', (req, res) => {
  const a = authUser(req);
  if (!a) return sendJson(res, 401, { error: 'Login required.' });
  sendJson(res, 200, { favorites: db.favorites[a.user.id] || [] });
});

api('POST', '/api/favorites', async (req, res) => {
  const a = authUser(req);
  if (!a) return sendJson(res, 401, { error: 'Login required.' });
  const b = await readBody(req);
  const slug = String(b.slug || '').trim();
  if (!slug || /\.\.|\//.test(slug)) return sendJson(res, 400, { error: 'Invalid game slug.' });
  const list = db.favorites[a.user.id] || (db.favorites[a.user.id] = []);
  const idx = list.indexOf(slug);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(slug);
  saveDb();
  sendJson(res, 200, { favorites: list, added: idx < 0 });
});

// ── Reviews ──────────────────────────────────────────────────────
api('GET', '/api/games/:slug/reviews', (req, res) => {
  const m = req.url.match(/\/api\/games\/([^/]+)\/reviews/);
  const slug = m ? m[1] : '';
  const reviews = (db.reviews[slug] || []).slice().sort((x, y) => y.createdAt - x.createdAt);
  const rating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  sendJson(res, 200, { reviews, rating: Math.round(rating * 10) / 10, count: reviews.length });
});

api('POST', '/api/games/:slug/reviews', async (req, res) => {
  const a = authUser(req);
  if (!a) return sendJson(res, 401, { error: 'Login required to review.' });
  const m = req.url.match(/\/api\/games\/([^/]+)\/reviews/);
  const slug = m ? m[1] : '';
  if (!slug || /\.\.|\//.test(slug)) return sendJson(res, 400, { error: 'Invalid game slug.' });
  const b = await readBody(req);
  const rating = Math.round(Number(b.rating));
  const text = String(b.text || '').trim().slice(0, 2000);
  if (!rating || rating < 1 || rating > 5) return sendJson(res, 400, { error: 'Rating must be 1-5 stars.' });
  if (!text || text.length < 3) return sendJson(res, 400, { error: 'Please write a short review.' });
  const list = db.reviews[slug] || (db.reviews[slug] = []);
  const idx = list.findIndex(r => r.userId === a.user.id);
  if (idx >= 0) list[idx] = { ...list[idx], rating, text, updatedAt: Date.now() };
  else list.push({ id: crypto.randomBytes(8).toString('hex'), userId: a.user.id, username: a.user.username, rating, text, createdAt: Date.now() });
  saveDb();
  sendJson(res, 201, { ok: true, count: list.length });
});

// ── Reports ──────────────────────────────────────────────────────
api('POST', '/api/games/:slug/report', async (req, res) => {
  const a = authUser(req);
  if (!a) return sendJson(res, 401, { error: 'Login required to report.' });
  const m = req.url.match(/\/api\/games\/([^/]+)\/report/);
  const slug = m ? m[1] : '';
  const b = await readBody(req);
  const reason = String(b.reason || '').trim().slice(0, 1000);
  if (!reason) return sendJson(res, 400, { error: 'Please describe the issue.' });
  const list = db.reports[slug] || (db.reports[slug] = []);
  list.push({ userId: a.user.id, username: a.user.username, reason, createdAt: Date.now() });
  saveDb();
  sendJson(res, 201, { ok: true });
});

// ── Dispatcher ───────────────────────────────────────────────────
function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  if (!pathname.startsWith('/api/')) return false;

  const method = req.method || 'GET';
  for (const p of api.patterns || []) {
    if (p.method === method) {
      const m = pathname.match(p.pattern);
      if (m) {
        (async () => {
          try {
            await ROUTES[p.key](req, res, m);
          } catch (e) {
            console.error('[api] error on', method, pathname, e.message);
            if (!res.headersSent) sendJson(res, 400, { error: e.message || 'Bad request.' });
          }
        })();
        return true;
      }
    }
  }
  if (pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'API route not found: ' + method + ' ' + pathname });
    return true;
  }
  return false;
}

module.exports = { handleApi };
