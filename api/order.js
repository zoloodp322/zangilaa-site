// Vercel serverless функц: POST /api/order -> Telegram.
// Нууц утгууд: Vercel -> Project Settings -> Environment Variables
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
import { validateOrder, formatMessage, sendTelegram, makeLimiter } from '../lib/order.js';

const allow = makeLimiter();

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  const wantsJson = String(req.headers.accept || '').includes('application/json');
  const back = (lang, ok) => {
    if (wantsJson) return res.status(ok ? 200 : 400).json({ ok });
    res.setHeader('Location', `${lang === 'en' ? '/en/' : '/'}?sent=${ok ? 1 : 0}#order`);
    return res.status(303).end();
  };

  // Өөр сайтаас илгээхийг хориглоно
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ ok: false });
    } catch {
      return res.status(403).json({ ok: false });
    }
  }

  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = Object.fromEntries(new URLSearchParams(body)); } catch { body = {}; }
  }
  const v = validateOrder(body);
  if (v.spam) return back('mn', true); // ботод амжилттай мэт хариулна
  if (!v.ok) return wantsJson ? res.status(400).json({ ok: false, errors: v.errors }) : back(v.order.lang, false);

  try {
    await sendTelegram(formatMessage(v.order), { token: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID });
  } catch (err) {
    console.error('order send failed:', err.message);
    return wantsJson ? res.status(502).json({ ok: false }) : back(v.order.lang, false);
  }
  return back(v.order.lang, true);
}
