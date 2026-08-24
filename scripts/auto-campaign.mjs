import fs from 'node:fs';
import path from 'node:path';

const gamesPath = path.resolve('eggermath-astro/src/data/games.js');
const src = fs.readFileSync(gamesPath, 'utf8');
// crude parse games array length + pick by day
const gamesMatch = src.match(/export const games = \[([\s\S]*?)\];/);
if (!gamesMatch) { console.error('games parse failed'); process.exit(1); }
// Use ESM import for accurate data
const { games, SITE } = await import('file://' + path.resolve('eggermath-astro/src/data/games.js').replace(/\\/g,'/'));
const { regionalKeywords } = await import('file://' + path.resolve('eggermath-astro/src/data/keywords.js').replace(/\\/g,'/'));

const idx = Math.floor(Date.now() / 86400000) % games.length;
const game = games[idx];
const lang = 'en';
const pool = regionalKeywords[lang] || [];
const topKw = pool.slice(0,3).join(', ');

const title = `How to Play ${game.title} Online Free — GBA/GBC/GB Emulator (No Download)`;
const canonical = `${SITE.url}/${game.slug}/`;
const body_markdown = `Play **${game.title}** online for free on [EggerMath](${canonical}) — instant browser ${game.system} emulator (mGBA WASM, 240×160), no download or signup.

## Try it
→ [Play ${game.title} now](${canonical}) — Save (F5), Load (F9), 10 slots (F7), touch controls on mobile, IndexedDB offline cache.

## About ${game.title}
${game.desc} — ${game.genre} · ${game.year} · ${game.developer} · ${game.series} series. Part of 52 games on EggerMath (GBA/GBC/GB, 11 languages, 650 pages).

## Controls
WASD/Arrows = D-Pad, K = A, J = B, Q = L, E = R, Enter = Start, Right Shift = Select. Mobile: on-screen D-pad.

## Why this works
Astro static + Cloudflare Pages + mGBA WASM with COOP/COEP (SharedArrayBuffer) + MEGA CDN client-side. Source: [gba-wasm-web](https://github.com/rayanbaig796-crypto/gba-wasm-web).

---
*Keywords: ${game.keywords} — also ${topKw} — Play free at [eggermath.com](https://www.eggermath.com)*
`;

console.log(`Picked [${idx}] ${game.title} — ${canonical}`);
console.log(`Title: ${title}`);
console.log(`Kw: ${topKw}`);

const dry = !process.env.DEVTO_API_KEY;
if (dry) {
  console.log('DRY RUN — set DEVTO_API_KEY to publish. Markdown preview:\n', body_markdown.slice(0,600));
  process.exit(0);
}

const res = await fetch('https://dev.to/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'api-key': process.env.DEVTO_API_KEY },
  body: JSON.stringify({ article: { title, body_markdown, published: true, tags: ['webassembly','gamedev','javascript','webdev'], canonical_url: canonical } })
});
const j = await res.json();
console.log('Dev.to status', res.status, JSON.stringify(j).slice(0,500));
if (!res.ok) process.exit(1);
