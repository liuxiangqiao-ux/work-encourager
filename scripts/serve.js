// scripts/serve.js —— 极简静态服务器，用于在浏览器中预览小组件
// 支持 CLI 传入 --host / --port
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i === -1) return fallback;
  const a = args[i];
  return a.includes('=') ? a.split('=')[1] : (args[i + 1] || fallback);
}
const host = arg('host', '0.0.0.0');
const port = Number(arg('port', 7100));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/renderer/preview.html';
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
server.listen(port, host, () => {
  console.log(`上班鼓励器预览: http://localhost:${port}/`);
});
