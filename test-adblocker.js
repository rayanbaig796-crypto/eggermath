const fs = require('fs');
const https = require('https');
const acorn = require('acorn');

function fetchUrl(targetUrl, maxRedirects = 8) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = targetUrl.startsWith('https') ? https : require('http');
    client.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'identity' },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = new URL(targetUrl).origin + loc;
        res.resume();
        return fetchUrl(loc, maxRedirects - 1).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function test() {
  const targetUrl = 'https://html5.gamemonetize.co/g8zgstvqwtavxjr39z275w6vbevvpwv6/';
  const result = await fetchUrl(targetUrl);
  const html = result.body.toString('utf-8');
  
  // Clear require cache to get fresh server.js
  delete require.cache[require.resolve('./server.js')];
  
  const serverCode = fs.readFileSync('server.js', 'utf8');
  const fnStart = serverCode.indexOf('function rewriteHtml(');
  const fnEnd = serverCode.indexOf('\nfunction rewriteCss(');
  const fnCode = serverCode.substring(fnStart, fnEnd);
  eval(fnCode);
  
  const rewritten = rewriteHtml(html, targetUrl, 'www.eggermath.com');
  
  const allMatches = [...rewritten.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  for (const m of allMatches) {
    if (m[1].includes('(function(){') && m[1].includes('px(u)')) {
      console.log('Ad blocker length:', m[1].length);
      
      // Test syntax with acorn
      try {
        acorn.parse(m[1], { ecmaVersion: 2020, sourceType: 'script' });
        console.log('ACORN: VALID');
      } catch(e) {
        console.log('ACORN ERROR:', e.message, 'at pos', e.pos);
        console.log('Context:', JSON.stringify(m[1].substring(e.pos - 40, e.pos + 40)));
      }
      
      // Also test with new Function
      try {
        new Function(m[1]);
        console.log('FUNCTION: VALID');
      } catch(e) {
        console.log('FUNCTION ERROR:', e.message);
      }
      return;
    }
  }
  console.log('Ad blocker not found');
}

test().catch(console.error);
