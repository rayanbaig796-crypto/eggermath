const http = require('http');
const targetUrl = 'https://html5.gamemonetize.co/sqtuqupfoswoie8rutb8035178dem34x/';
const url = 'http://localhost:8080/play?url=' + encodeURIComponent(targetUrl);
http.get(url, {headers:{'Cache-Control':'no-cache'}}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Has HTMLImageElement:', data.includes('HTMLImageElement'));
    console.log('Has OI= (image src setter):', data.includes('OI='));
    console.log('Has IMG tag check:', data.includes('tagName==="IMG"'));
    console.log('Cache:', res.headers['x-cache']);
    console.log('Length:', data.length);
    
    // Check if images in the HTML are being rewritten
    const imgMatches = data.match(/src="[^"]*proxy[^"]*\.png/g);
    console.log('Proxied image srcs:', imgMatches ? imgMatches.length : 0);
    
    const cdnImgMatches = data.match(/src="https?:\/\/html5\.gamemonetize\.co[^"]*\.png/g);
    console.log('Unproxied CDN images:', cdnImgMatches ? cdnImgMatches.length : 0);
  });
}).on('error', e => console.error(e));
