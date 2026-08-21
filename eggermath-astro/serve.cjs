const http = require('http');
const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'dist');
const t = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json','.xml':'text/xml','.txt':'text/plain','.woff2':'font/woff2','.woff':'font/woff'};
http.createServer((q, r) => {
  let u = q.url.split('?')[0];
  if (u === '/') u = '/index.html';
  let fp = path.join(d, u);
  fs.access(fp, fs.constants.F_OK, e => {
    if (!e) {
      const ext = path.extname(fp);
      r.writeHead(200, {'Content-Type': t[ext] || 'application/octet-stream'});
      fs.createReadStream(fp).pipe(r);
    } else {
      fp = fp + '.html';
      fs.access(fp, fs.constants.F_OK, e2 => {
        if (!e2) {
          r.writeHead(200, {'Content-Type': 'text/html'});
          fs.createReadStream(fp).pipe(r);
        } else {
          r.writeHead(404);
          r.end('Not found');
        }
      });
    }
  });
}).listen(4321, () => console.log('Server on http://localhost:4321'));
