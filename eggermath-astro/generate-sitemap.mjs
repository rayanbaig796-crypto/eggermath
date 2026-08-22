import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const SITE = 'https://www.eggermath.com';
const TODAY = new Date().toISOString().split('T')[0];
const DIST = join(process.cwd(), 'dist');
const OG_IMAGE = `${SITE}/og-image.svg`;

const LANGS = ['pt-BR', 'es', 'ja', 'de', 'fr', 'ru', 'ko', 'it', 'id', 'ar'];

function readGames() {
  const raw = readFileSync(join(process.cwd(), 'src', 'data', 'games.js'), 'utf8');
  const games = [];
  const regex = /slug:\s*'([^']+)'[^}]*img:\s*'([^']*)'/g;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    games.push({ slug: m[1], img: m[2] });
  }
  return games;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHreflangs(slug) {
  const langs = [['en', `${SITE}/${slug}`]];
  for (const l of LANGS) {
    langs.push([l, `${SITE}/${l}/${slug}`]);
  }
  langs.push(['x-default', `${SITE}/${slug}`]);
  return langs;
}

function buildHomeHreflangs() {
  const langs = [['en', SITE]];
  for (const l of LANGS) {
    langs.push([l, `${SITE}/${l}`]);
  }
  langs.push(['x-default', SITE]);
  return langs;
}

function urlEntry(loc, opts = {}) {
  const {
    lastmod = TODAY,
    changefreq = 'weekly',
    priority = '0.5',
    images = [],
    hreflangs = [],
  } = opts;

  let xml = `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n`;

  for (const img of images) {
    xml += `    <image:image>\n      <image:loc>${esc(img)}</image:loc>\n    </image:image>\n`;
  }

  for (const [lang, href] of hreflangs) {
    xml += `    <xhtml:link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}" />\n`;
  }

  xml += `  </url>`;
  return xml;
}

function sitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}

function sitemapIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>\n    <loc>${esc(s.loc)}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
}

// --- MAIN ---
const games = readGames();
const allSitemaps = [];
let totalUrls = 0;

// ============================================================
// 1. HOMEPAGES — with cross-language hreflangs + OG image
// ============================================================
const homeHreflangs = buildHomeHreflangs();
const homeUrls = [
  urlEntry(SITE, {
    priority: '1.0',
    changefreq: 'weekly',
    images: [OG_IMAGE],
    hreflangs: homeHreflangs,
  }),
];
for (const lang of LANGS) {
  homeUrls.push(
    urlEntry(`${SITE}/${lang}`, {
      priority: '0.8',
      changefreq: 'weekly',
      images: [OG_IMAGE],
      hreflangs: homeHreflangs,
    })
  );
}
writeFileSync(join(DIST, 'sitemap-home.xml'), sitemapXml(homeUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-home.xml`, lastmod: TODAY });
totalUrls += homeUrls.length;

// ============================================================
// 2. ENGLISH GAME PAGES — images + full hreflangs + x-default
// ============================================================
const enGameUrls = games.map((g) => {
  const hreflangs = buildHreflangs(g.slug);
  const images = g.img ? [g.img] : [];
  return urlEntry(`${SITE}/${g.slug}`, {
    priority: '0.8',
    changefreq: 'monthly',
    images,
    hreflangs,
  });
});
writeFileSync(join(DIST, 'sitemap-games-en.xml'), sitemapXml(enGameUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-games-en.xml`, lastmod: TODAY });
totalUrls += enGameUrls.length;

// ============================================================
// 3. TRANSLATED GAME PAGES — one sitemap per language
// ============================================================
for (const lang of LANGS) {
  const langUrls = games.map((g) => {
    const hreflangs = buildHreflangs(g.slug);
    const images = g.img ? [g.img] : [];
    return urlEntry(`${SITE}/${lang}/${g.slug}`, {
      priority: '0.7',
      changefreq: 'monthly',
      images,
      hreflangs,
    });
  });
  writeFileSync(join(DIST, `sitemap-games-${lang}.xml`), sitemapXml(langUrls));
  allSitemaps.push({ loc: `${SITE}/sitemap-games-${lang}.xml`, lastmod: TODAY });
  totalUrls += langUrls.length;
}

// ============================================================
// 4. FAQ PAGES — game FAQ get cover images, static FAQ get OG
// ============================================================
const faqStaticPages = [
  { slug: 'best-gba-emulator', img: OG_IMAGE },
  { slug: 'gba-emulator-ios', img: OG_IMAGE },
  { slug: 'gba-emulator-android', img: OG_IMAGE },
  { slug: 'gba-emulator-online', img: OG_IMAGE },
  { slug: 'gba-emulator-unblocked', img: OG_IMAGE },
];

const faqUrls = [];

// Static FAQ pages
for (const p of faqStaticPages) {
  faqUrls.push(
    urlEntry(`${SITE}/faq/${p.slug}`, {
      priority: '0.6',
      changefreq: 'yearly',
      images: [p.img],
    })
  );
}

// Per-game FAQ pages — include game cover image
for (const g of games) {
  const images = g.img ? [g.img] : [];
  faqUrls.push(
    urlEntry(`${SITE}/faq/${g.slug}`, {
      priority: '0.5',
      changefreq: 'yearly',
      images,
    })
  );
}

writeFileSync(join(DIST, 'sitemap-faq.xml'), sitemapXml(faqUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-faq.xml`, lastmod: TODAY });
totalUrls += faqUrls.length;

// ============================================================
// 5. CONTENT / PILLAR / LEGAL PAGES — with OG image
// ============================================================
const contentPages = [
  { path: '/best-gba-games', priority: '0.9', changefreq: 'monthly' },
  { path: '/how-to-play-gba-on-ios', priority: '0.8', changefreq: 'monthly' },
  { path: '/how-to-play-gba-on-android', priority: '0.8', changefreq: 'monthly' },
  { path: '/gba-rom-formats-explained', priority: '0.7', changefreq: 'monthly' },
  { path: '/is-emulator-legal', priority: '0.6', changefreq: 'yearly' },
  { path: '/pages/about', priority: '0.4', changefreq: 'yearly' },
  { path: '/pages/contact', priority: '0.4', changefreq: 'yearly' },
  { path: '/pages/privacy', priority: '0.2', changefreq: 'yearly' },
  { path: '/pages/terms', priority: '0.2', changefreq: 'yearly' },
  { path: '/pages/takedown', priority: '0.2', changefreq: 'yearly' },
];

const contentUrls = contentPages.map((p) =>
  urlEntry(`${SITE}${p.path}`, {
    priority: p.priority,
    changefreq: p.changefreq,
    images: [OG_IMAGE],
  })
);
writeFileSync(join(DIST, 'sitemap-content.xml'), sitemapXml(contentUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-content.xml`, lastmod: TODAY });
totalUrls += contentUrls.length;

// ============================================================
// 6. SITEMAP INDEX
// ============================================================
writeFileSync(join(DIST, 'sitemap.xml'), sitemapIndex(allSitemaps));

// Clean up old auto-generated sitemaps from @astrojs/sitemap
try { unlinkSync(join(DIST, 'sitemap-index.xml')); } catch {}
try { unlinkSync(join(DIST, 'sitemap-0.xml')); } catch {}

console.log(`Sitemap generated: ${allSitemaps.length} child sitemaps, ${totalUrls} total URLs`);
