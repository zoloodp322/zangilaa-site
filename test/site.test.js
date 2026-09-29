import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { validateOrder, formatMessage, sendTelegram, makeLimiter } from '../lib/order.js';
import handler from '../api/order.js';

test('захиалга: зөв өгөгдөл хүлээн авна', () => {
  const v = validateOrder({ name: ' Бат ', phone: '9911-2233', service: 'starlink', customer: 'org', org: 'Хонгор' });
  assert.equal(v.ok, true);
  assert.equal(v.order.name, 'Бат');
  assert.equal(v.order.service, 'starlink');
});

test('захиалга: нэр, утасгүй бол татгалзана; буруу үйлчилгээ "other" болно', () => {
  assert.deepEqual(validateOrder({ name: '', phone: '12' }).errors, ['name', 'phone']);
  assert.equal(validateOrder({ name: 'a', phone: '99112233', service: '__proto__' }).order.service, 'other');
});

test('захиалга: honeypot бөглөсөн бол спам', () => {
  assert.equal(validateOrder({ website: 'x', name: 'a', phone: '99112233' }).spam, true);
});

test('захиалга: урт, удирдах тэмдэгтийг таслана', () => {
  const v = validateOrder({ name: 'x'.repeat(500) + '\u0000\u202E', phone: '99112233', message: 'y'.repeat(5000) });
  assert.equal(v.order.name.length, 80);
  assert.equal(v.order.message.length, 1500);
  assert.doesNotMatch(formatMessage(v.order), /[\u0000\u202E]/);
});

test('Telegram: parse_mode ашиглахгүй, token URL-д зөв байрлана', async () => {
  let call;
  await sendTelegram('hi <b>x</b>', { token: 'T', chatId: '1', fetchImpl: async (url, opt) => { call = { url, body: JSON.parse(opt.body) }; return { ok: true }; } });
  assert.equal(call.url, 'https://api.telegram.org/botT/sendMessage');
  assert.equal(call.body.parse_mode, undefined);
  await assert.rejects(sendTelegram('x', { token: '', chatId: '' }));
});

test('rate limit', () => {
  const allow = makeLimiter({ max: 2 });
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), false);
  assert.equal(allow('b'), true);
});

function mockRes() {
  const r = { code: 0, headers: {}, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.end = () => r;
  return r;
}

test('API: өөр Origin-оос хориглоно, GET 405', async () => {
  const res = mockRes();
  await handler({ method: 'POST', headers: { origin: 'https://evil.com', host: 'zangilaa.vercel.app' }, body: {} }, res);
  assert.equal(res.code, 403);
  const g = mockRes();
  await handler({ method: 'GET', headers: {} }, g);
  assert.equal(g.code, 405);
});

test('API: Telegram тохируулаагүй бол 502, нууц мэдээлэл задлахгүй', async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  const res = mockRes();
  const origErr = console.error;
  console.error = () => {};
  await handler({ method: 'POST', headers: { accept: 'application/json', host: 'x', 'x-real-ip': '9.9.9.9' }, body: { name: 'Бат', phone: '99112233' } }, res);
  console.error = origErr;
  assert.equal(res.code, 502);
  assert.deepEqual(res.body, { ok: false });
});

test('build: хоёр хэл, 7 жишээ сайт үүснэ; inline script байхгүй', () => {
  execFileSync(process.execPath, ['build.mjs'], { stdio: 'ignore' });
  const mn = fs.readFileSync('dist/index.html', 'utf8');
  const en = fs.readFileSync('dist/en/index.html', 'utf8');
  assert.match(mn, /<html lang="mn">/);
  assert.match(en, /<html lang="en">/);
  for (const html of [mn, en]) assert.doesNotMatch(html, /<script>|<script type="text\/javascript">|onclick=|style="/);
  const ex = fs.readdirSync('dist/examples').filter((d) => d !== 'assets');
  assert.equal(ex.length, 7);
  const auto = fs.readFileSync('dist/examples/auto/index.html', 'utf8');
  assert.match(auto, /data-demo-form/);
  assert.doesNotMatch(auto, /\/static\//);
});
