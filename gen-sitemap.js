const fs = require('fs');
const raw = fs.readFileSync('./games.js', 'utf8');
const jsonStr = raw.replace(/^const GAMES\s*=\s*/, '').replace(/;?\s*$/, '');
const GAMES = JSON.parse(jsonStr);
const urls = ['https://www.eggermath.com/'];
GAMES.forEach(g => urls.push('https://www.eggermath.com/game.html?id=' + encodeURIComponent(g.id)));
const lines = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
urls.forEach(u => {
  const p = u === 'https://www.eggermath.com/' ? '1.0' : '0.8';
  lines.push('  <url><loc>' + u + '</loc><changefreq>weekly</changefreq><priority>' + p + '</priority></url>');
});
lines.push('</urlset>');
fs.writeFileSync('sitemap.xml', lines.join('\n') + '\n');
console.log('Sitemap:', urls.length, 'URLs');
