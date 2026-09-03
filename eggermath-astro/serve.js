const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'dist');
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.txt':'text/plain','.woff2':'font/woff2','.woff':'font/woff'};
http.createServer((req, res) => {
  let fp = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(fp) && fs.existsSync(path.join(fp, 'index.html'))) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = path.extname(fp);
  res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream'});
  fs.createReadStream(fp).pipe(res);
}).listen(4321, () => console.log('Serving on http://localhost:4321'));
