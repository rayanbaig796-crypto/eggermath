const https = require('https');
const url = 'https://html5.gamemonetize.co/mteo9fepwooxffabn9czoh0jxzu5ecfp/index.html';
https.get(url, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('HTML length:', d.length);
    // Find ALL script tags
    const scripts = d.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    console.log('Total script tags:', scripts.length);
    scripts.forEach((s, i) => {
      console.log('--- Script', i, '(len=' + s.length + ') ---');
      console.log(s.substring(0, 400));
      console.log('');
    });
    // Show lines with sdk
    const lines = d.split('\n');
    console.log('Lines with "sdk":');
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('sdk')) {
        console.log('  L' + i + ':', line.substring(0, 300));
      }
    });
  });
}).on('error', e => console.log('Error:', e.message));
