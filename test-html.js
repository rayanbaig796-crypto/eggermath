const https = require('https');
const url = 'https://html5.gamemonetize.co/mu76wlg4vaps2v94e08xay03h09wcbfz/';
https.get(url, {headers: {'User-Agent': 'Mozilla/5.0'}}, r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('Status:', r.statusCode);
    console.log('Has <head>:', /<head/i.test(d));
    console.log('Has <HEAD>:', d.includes('<HEAD'));
    console.log('Script src for c3runtime:', (d.match(/src=["']([^"']*c3runtime[^"']*)/i) || ['','none'])[1]);
    console.log('First 2000 chars:');
    console.log(d.substring(0, 2000));
  });
}).on('error', e => console.error(e));
