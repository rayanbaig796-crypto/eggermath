import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_PATH = join(__dirname, '..', 'src', 'data', 'games.js');
const games = [];
const content = readFileSync(GAMES_PATH, 'utf-8');
for (const block of content.split(/\},\s*\{/)) {
  const s = block.match(/slug:\s*['"]([^'"]+)['"]/);
  const t = block.match(/title:\s*['"]([^'"]+)['"]/);
  const g = block.match(/genre:\s*['"]([^'"]+)['"]/);
  if (s && t) games.push({ slug: s[1], title: t[1], genre: g ? g[1] : 'GBA' });
}

const HN_USERNAME = process.env.HN_USERNAME;
const HN_PASSWORD = process.env.HN_PASSWORD;

if (!HN_USERNAME || !HN_PASSWORD) {
  console.error('Missing HN_USERNAME or HN_PASSWORD env vars');
  process.exit(1);
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const game = pickRandom(games);
const url = `https://www.eggermath.com/${game.slug}/`;
const title = `Show HN: Play ${game.title} Online Free (${game.genre} Browser Emulator)`;

async function submitHN() {
  const session = await fetch('https://news.ycombinator.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ acct: HN_USERNAME, pw: HN_PASSWORD }).toString(),
    redirect: 'manual',
  });

  const cookies = session.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
  await new Promise(r => setTimeout(r, 2000));

  const submitPage = await fetch('https://news.ycombinator.com/submit', {
    headers: { Cookie: cookies },
  });
  const html = await submitPage.text();
  const fnidMatch = html.match(/name="fnid"\s+value="([^"]+)"/);
  if (!fnidMatch) { console.error('Could not find FNID CSRF token'); process.exit(1); }
  const fnid = fnidMatch[1];

  await new Promise(r => setTimeout(r, 2000));

  const result = await fetch('https://news.ycombinator.com/r', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
    },
    body: new URLSearchParams({ title, url, fnid }).toString(),
    redirect: 'manual',
  });

  if (result.status === 302 || result.status === 200) {
    console.log(`Submitted to HN: "${title}" -> ${url}`);
  } else {
    console.error('HN submission failed:', result.status);
    process.exit(1);
  }
}

submitHN().catch(e => { console.error(e); process.exit(1); });
