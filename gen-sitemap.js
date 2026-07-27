const fs = require('fs');
const raw = fs.readFileSync('./games.js', 'utf8');
const jsonStr = raw.replace(/^const GAMES\s*=\s*/, '').replace(/;?\s*$/, '');
const GAMES = JSON.parse(jsonStr);
const urls = ['https://www.eggermath.com/'];
const seoPages = ['puzzle-games','arcade-games','shooting-games','racing-games','educational-games','action-games','adventure-games','simulation-games','sports-games','girls-games','strategy-games','creative-games','card-games','other-games'];
seoPages.forEach(s => urls.push('https://www.eggermath.com/play/' + s));
const collPages = ['2-player-games','zombie-games','chess-board-games'];
collPages.forEach(c => urls.push('https://www.eggermath.com/collections/' + c));
urls.push('https://www.eggermath.com/social');
GAMES.forEach(g => urls.push('https://www.eggermath.com/game.html?id=' + encodeURIComponent(g.id)));
const lines = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
urls.forEach(u => {
  const p = u === 'https://www.eggermath.com/' ? '1.0' : u.includes('/play/') ? '0.9' : '0.8';
  lines.push('  <url><loc>' + u + '</loc><changefreq>weekly</changefreq><priority>' + p + '</priority></url>');
});
lines.push('</urlset>');
fs.writeFileSync('sitemap.xml', lines.join('\n') + '\n');
console.log('Sitemap:', urls.length, 'URLs');
