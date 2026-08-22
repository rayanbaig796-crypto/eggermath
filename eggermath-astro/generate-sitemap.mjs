import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const SITE = 'https://www.eggermath.com';
const TODAY = new Date().toISOString().split('T')[0];
const DIST = join(process.cwd(), 'dist');

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
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function url(loc, opts = {}) {
  const { lastmod = TODAY, changefreq = 'weekly', priority = '0.7', images = [], hreflangs = [] } = opts;
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
${sitemaps.map(s => `  <sitemap>\n    <loc>${esc(s.loc)}</loc>\n    <lastmod>${s.lastmod || TODAY}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
}

const games = readGames();
const allSitemaps = [];

// 1. Homepage
const homeUrls = [
  url(SITE, { priority: '1.0', changefreq: 'daily' }),
];
for (const lang of LANGS) {
  homeUrls.push(url(`${SITE}/${lang}`, { priority: '0.9', changefreq: 'weekly' }));
}
writeFileSync(join(DIST, 'sitemap-home.xml'), sitemapXml(homeUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-home.xml`, lastmod: TODAY });

// 2. English game pages (with images + hreflangs)
const enGameUrls = games.map(g => {
  const hreflangs = [['en', `${SITE}/${g.slug}`]];
  for (const lang of LANGS) {
    hreflangs.push([lang, `${SITE}/${lang}/${g.slug}`]);
  }
  const images = g.img ? [g.img] : [];
  return url(`${SITE}/${g.slug}`, { priority: '0.9', changefreq: 'weekly', images, hreflangs });
});
writeFileSync(join(DIST, 'sitemap-games-en.xml'), sitemapXml(enGameUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-games-en.xml`, lastmod: TODAY });

// 3. Translated game pages (one sitemap per language)
for (const lang of LANGS) {
  const langUrls = games.map(g => {
    const hreflangs = [['en', `${SITE}/${g.slug}`]];
    for (const l of LANGS) {
      hreflangs.push([l, `${SITE}/${l}/${g.slug}`]);
    }
    const images = g.img ? [g.img] : [];
    return url(`${SITE}/${lang}/${g.slug}`, { priority: '0.8', changefreq: 'weekly', images, hreflangs });
  });
  writeFileSync(join(DIST, `sitemap-games-${lang}.xml`), sitemapXml(langUrls));
  allSitemaps.push({ loc: `${SITE}/sitemap-games-${lang}.xml`, lastmod: TODAY });
}

// 4. FAQ pages
const faqPages = [
  'best-gba-emulator', 'gba-emulator-ios', 'gba-emulator-android',
  'gba-emulator-online', 'gba-emulator-unblocked'
];
const faqGameUrls = games.map(g => url(`${SITE}/faq/${g.slug}`, { priority: '0.6', changefreq: 'monthly' }));
const faqStaticUrls = faqPages.map(p => url(`${SITE}/faq/${p}`, { priority: '0.7', changefreq: 'monthly' }));
writeFileSync(join(DIST, 'sitemap-faq.xml'), sitemapXml([...faqStaticUrls, ...faqGameUrls]));
allSitemaps.push({ loc: `${SITE}/sitemap-faq.xml`, lastmod: TODAY });

// 5. Content / pillar pages
const contentPages = [
  { path: '/best-gba-games', priority: '0.9' },
  { path: '/how-to-play-gba-on-ios', priority: '0.8' },
  { path: '/how-to-play-gba-on-android', priority: '0.8' },
  { path: '/gba-rom-formats-explained', priority: '0.7' },
  { path: '/is-emulator-legal', priority: '0.6' },
  { path: '/pages/about', priority: '0.5' },
  { path: '/pages/contact', priority: '0.5' },
  { path: '/pages/privacy', priority: '0.3' },
  { path: '/pages/terms', priority: '0.3' },
  { path: '/pages/takedown', priority: '0.3' },
];
const contentUrls = contentPages.map(p => url(`${SITE}${p.path}`, { priority: p.priority, changefreq: 'monthly' }));
writeFileSync(join(DIST, 'sitemap-content.xml'), sitemapXml(contentUrls));
allSitemaps.push({ loc: `${SITE}/sitemap-content.xml`, lastmod: TODAY });

// 6. Write sitemap index
writeFileSync(join(DIST, 'sitemap.xml'), sitemapIndex(allSitemaps));

// Remove old auto-generated sitemaps
import { unlinkSync } from 'fs';
try { unlinkSync(join(DIST, 'sitemap-index.xml')); } catch {}
try { unlinkSync(join(DIST, 'sitemap-0.xml')); } catch {}

console.log(`Sitemap generated: ${allSitemaps.length} sitemaps, ${games.length * 12 + games.length + faqPages.length + faqGameUrls.length + contentPages.length + homeUrls.length} total URLs`);
