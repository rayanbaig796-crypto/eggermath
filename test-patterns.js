const https = require('https');
function fetch(url) {
  return new Promise((res, rej) => {
    https.get(url, {headers: {'User-Agent': 'Mozilla/5.0'}}, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(d));
    }).on('error', rej);
  });
}

(async () => {
  const games = [
    ['gm-city-ride', 'https://html5.gamemonetize.co/mteo9fepwooxffabn9czoh0jxzu5ecfp/'],
    ['gm-soccer-duel', 'https://html5.gamemonetize.co/cmu4j0nhxsgrh6dg4kkj/'],
    ['gm-stick-duel', 'https://html5.gamemonetize.co/7yt89sszsvq0j0y7frzu/'],
    ['gm-wonder-vending', 'https://html5.gamemonetize.co/42qmdy4702lj3m47x11w/'],
  ];
  for (const [name, url] of games) {
    try {
      const html = await fetch(url);
      const srcMatches = html.match(/<script[^>]*src=["']([^"']*)/gi) || [];
      const srcs = srcMatches.map(m => {
        const s = m.match(/src=["']([^"']*)/i);
        return s ? s[1] : '';
      });
      const hasShowBanner = /showBanner/.test(html);
      const hasSDK = /api\.gamemonetize\.com\/sdk/.test(html);
      const hasOnload = /onload=/.test(html);
      const hasModule = /type=["']module["']/.test(html);
      const hasAsync = /<script[^>]*\basync\b/.test(html);
      console.log(`\n${name}:`);
      console.log(`  SDK: ${hasSDK}, showBanner: ${hasShowBanner}, onload: ${hasOnload}, module: ${hasModule}, async: ${hasAsync}`);
      console.log(`  Scripts: ${srcs.join(', ')}`);
    } catch (e) {
      console.log(`\n${name}: ERROR ${e.message}`);
    }
  }
})();
