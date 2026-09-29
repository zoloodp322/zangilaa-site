// Орон нутагт урьдчилан харах: node scripts/preview.mjs  ->  http://localhost:5173
// /api/order-г Vercel шиг ажиллуулна. TELEGRAM_* тохируулаагүй бол захиалгыг консолд хэвлэнэ.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { validateOrder, formatMessage, sendTelegram } from '../lib/order.js';

const ROOT = path.resolve('dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
const PORT = Number(process.env.PORT || 5173);

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/order' && req.method === 'POST') {
    let raw = '';
    for await (const c of req) { raw += c; if (raw.length > 20000) return res.writeHead(413).end(); }
    const body = String(req.headers['content-type']).includes('json') ? JSON.parse(raw || '{}') : Object.fromEntries(new URLSearchParams(raw));
    const v = validateOrder(body);
    if (!v.ok) return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: false, errors: v.errors }));
    const text = formatMessage(v.order);
    if (process.env.TELEGRAM_BOT_TOKEN) await sendTelegram(text, { token: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID });
    else console.log('--- Захиалга (Telegram тохируулаагүй) ---\n' + text);
    return res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
  }
  let p = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!p.startsWith(ROOT)) return res.writeHead(403).end();
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) return res.writeHead(404).end('Not found');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
