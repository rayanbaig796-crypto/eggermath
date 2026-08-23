#!/usr/bin/env node
// IndexNow submitter — run after build: node scripts/submit-indexnow.mjs
// Docs: https://www.bing.com/indexnow
// Generates key file + submits all sitemap URLs to Bing, Yandex, Naver, Seznam
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SITE = 'https://www.eggermath.com';
const DIST = join(process.cwd(), 'dist');
// Deterministic 32-hex key (stable across builds) — commit public/{KEY}.txt
const KEY = process.env.INDEXNOW_KEY || 'a7f3c9e2b1d04a6f8e2c5d9b0a3f6c1e8';

// 1. Ensure key file exists in dist
const keyFile = join(DIST, `${KEY}.txt`);
if (!existsSync(keyFile)) {
  mkdirSync(DIST, { recursive: true });
  writeFileSync(keyFile, KEY, 'utf8');
  console.log(`IndexNow key file: ${KEY}.txt`);
}
try { writeFileSync(join(process.cwd(), 'public', `${KEY}.txt`), KEY, 'utf8'); } catch {}
try { writeFileSync(join(process.cwd(), 'eggermath-astro', 'public', `${KEY}.txt`), KEY, 'utf8'); } catch {}
try { writeFileSync(join(new URL('.', import.meta.url).pathname.replace(/^\//,''), '..', 'public', `${KEY}.txt`), KEY, 'utf8'); } catch {}

// 2. Collect all URLs from sitemaps
function collectUrls() {
  const urls = new Set();
  const files = ['sitemap.xml'];
  // sitemap.xml is index → parse child sitemaps
  try {
    const index = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
    const locs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const loc of locs) {
      const name = loc.replace(SITE + '/', '');
      try {
        const xml = readFileSync(join(DIST, name), 'utf8');
        for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
      } catch {}
    }
  } catch (e) {
    // fallback: read games.js
    try {
      const raw = readFileSync(join(process.cwd(), 'src/data/games.js'), 'utf8');
      for (const m of raw.matchAll(/slug:\s*'([^']+)'/g)) {
        urls.add(`${SITE}/${m[1]}`);
        for (const l of ['pt-BR','es','ja','de','fr','ru','ko','it','id','ar']) urls.add(`${SITE}/${l}/${m[1]}`);
      }
      urls.add(SITE);
      for (const l of ['pt-BR','es','ja','de','fr','ru','ko','it','id','ar']) urls.add(`${SITE}/${l}`);
    } catch {}
  }
  return [...urls];
}

const urls = collectUrls();
console.log(`Collected ${urls.length} URLs`);

// 3. Submit to IndexNow (Bing + Yandex + others via Bing endpoint)
const payload = JSON.stringify({ host: 'www.eggermath.com', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) });

async function submit(endpoint) {
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
    console.log(`${endpoint}: ${res.status} ${res.statusText}`);
    return res.ok;
  } catch (e) { console.log(`${endpoint}: ${e.message}`); return false; }
}

// Run actual submit only if INDEXNOW_SUBMIT=1
if (process.env.INDEXNOW_SUBMIT === '1') {
  await submit('https://www.bing.com/indexnow');
  await submit('https://yandex.com/indexnow');
  console.log('IndexNow submitted');
} else {
  console.log('Dry run. Set INDEXNOW_SUBMIT=1 to submit. Key:', KEY);
  console.log(`Key location: ${SITE}/${KEY}.txt  (also commit public/${KEY}.txt)`);
}
