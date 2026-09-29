// Захиалгын логик (Vercel-ээс хамааралгүй тул тестлэхэд амар).
// Telegram-д parse_mode ашиглахгүй тул хэрэглэгчийн текстээр мессежийг хэлбэржүүлж, холбоос шургуулах боломжгүй.

export const SERVICES = {
  network: 'Байгууллагын сүлжээ', starlink: 'Starlink', wifi: 'Wi-Fi', cctv: 'Хяналтын камер',
  server: 'Сервер, үүлэн шийдэл', support: 'Сарын IT дэмжлэг', web: 'Вэбсайт', callout: 'Дуудлага', other: 'Бусад',
};
const LIMITS = { name: 80, phone: 30, org: 120, location: 120, message: 1500 };

const clean = (v, max) => String(v ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
  .trim()
  .slice(0, max);

/** Орж ирсэн өгөгдлийг шалгана. { ok, errors, order } буцаана. */
export function validateOrder(body) {
  const b = body && typeof body === 'object' ? body : {};
  // Бот: хүн харахгүй талбарыг бөглөсөн
  if (b.website) return { ok: false, spam: true, errors: [] };
  const order = {
    customer: b.customer === 'org' ? 'org' : 'person',
    service: Object.hasOwn(SERVICES, b.service) ? b.service : 'other',
    name: clean(b.name, LIMITS.name),
    phone: clean(b.phone, LIMITS.phone).replace(/[^\d+ ()-]/g, ''),
    org: clean(b.org, LIMITS.org),
    location: clean(b.location, LIMITS.location),
    message: clean(b.message, LIMITS.message),
    lang: b.lang === 'en' ? 'en' : 'mn',
  };
  const errors = [];
  if (!order.name) errors.push('name');
  if ((order.phone.match(/\d/g) || []).length < 6) errors.push('phone');
  return { ok: errors.length === 0, errors, order };
}

export function formatMessage(o, now = new Date()) {
  const when = new Intl.DateTimeFormat('mn-MN', { timeZone: 'Asia/Ulaanbaatar', dateStyle: 'short', timeStyle: 'short' }).format(now);
  return [
    `Шинэ захиалга: ${SERVICES[o.service]}`,
    `${o.customer === 'org' ? 'Байгууллага' : 'Хувь хүн'}${o.org ? `: ${o.org}` : ''}`,
    `Нэр: ${o.name}`,
    `Утас: ${o.phone}`,
    o.location && `Байршил: ${o.location}`,
    o.message && `\n${o.message}`,
    `\n${when} (${o.lang.toUpperCase()} хуудаснаас)`,
  ].filter(Boolean).join('\n');
}

export async function sendTelegram(text, { token, chatId, fetchImpl = fetch }) {
  if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN эсвэл TELEGRAM_CHAT_ID тохируулаагүй');
  const res = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
}

/** Энгийн rate limit. Serverless-д instance бүрт тусдаа тул "хамгаалалтын эхний давхарга" л болно. */
export function makeLimiter({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    const e = hits.get(key);
    if (!e || e.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
    e.n += 1;
    return e.n <= max;
  };
}
