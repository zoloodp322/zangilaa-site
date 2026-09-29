import { INDUSTRIES, blankContent } from './industries.js';
import { normalizeTheme } from './themes.js';

const HOST_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MEDIA_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;

export function normalizeHost(h) {
  const host = String(h || '').toLowerCase().trim().replace(/\.$/, '');
  return HOST_RE.test(host) || host === 'localhost' ? host : null;
}

export function rowToTenant(row) {
  if (!row) return null;
  const industry = INDUSTRIES[row.industry] ? row.industry : 'retail';
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    industry,
    plan: row.plan,
    status: row.status,
    updatedAt: row.updated_at,
    theme: normalizeTheme(JSON.parse(row.theme), INDUSTRIES[industry].theme),
    content: sanitizeContent(JSON.parse(row.content), industry),
  };
}

export function tenantByHost(db, config, host) {
  const d = db.prepare('SELECT t.* FROM domains d JOIN tenants t ON t.id=d.tenant_id WHERE d.host=?').get(host);
  if (d) return rowToTenant(d);
  const suffix = '.' + config.baseDomain;
  if (host.endsWith(suffix)) {
    const slug = host.slice(0, -suffix.length);
    if (SLUG_RE.test(slug)) return rowToTenant(db.prepare('SELECT * FROM tenants WHERE slug=?').get(slug));
  }
  return null;
}

export function tenantById(db, id) {
  return rowToTenant(db.prepare('SELECT * FROM tenants WHERE id=?').get(id));
}

const str = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

/** Гаднаас ирсэн бүх агуулгыг урт, төрөл, форматаар хатуу шүүнэ. */
export function sanitizeContent(input, industry) {
  const base = blankContent(industry);
  const c = input && typeof input === 'object' ? input : {};
  const items = Array.isArray(c.items) ? c.items : base.items;
  const hours = Array.isArray(c.hours) && c.hours.length === 7 ? c.hours : base.hours;
  const contact = c.contact && typeof c.contact === 'object' ? c.contact : {};
  const url = (v) => {
    const s = str(v, 300);
    return /^https:\/\/[^\s<>"']+$/i.test(s) ? s : '';
  };
  return {
    tagline: str(c.tagline ?? base.tagline, 140),
    about: str(c.about ?? base.about, 2000),
    notice: str(c.notice, 200),
    seoDescription: str(c.seoDescription, 160),
    items: items
      .slice(0, 80)
      .map((it) => ({ name: str(it?.name, 80), desc: str(it?.desc, 200), price: str(it?.price, 40) }))
      .filter((it) => it.name),
    hours: hours.map((h) => ({
      open: TIME_RE.test(h?.open) ? h.open : '09:00',
      close: TIME_RE.test(h?.close) ? h.close : '18:00',
      closed: Boolean(h?.closed),
    })),
    contact: {
      phone: str(contact.phone, 30).replace(/[^\d+ -]/g, ''),
      phone2: str(contact.phone2, 30).replace(/[^\d+ -]/g, ''),
      email: /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}$/.test(str(contact.email, 254)) ? str(contact.email, 254) : '',
      address: str(contact.address, 300),
      mapUrl: url(contact.mapUrl),
      facebook: url(contact.facebook),
      instagram: url(contact.instagram),
    },
    heroImage: MEDIA_ID_RE.test(String(c.heroImage || '')) ? c.heroImage : null,
    gallery: (Array.isArray(c.gallery) ? c.gallery : []).filter((id) => MEDIA_ID_RE.test(String(id))).slice(0, 60),
  };
}

export function saveContent(db, tenant, content) {
  const clean = sanitizeContent(content, tenant.industry);
  db.prepare('UPDATE tenants SET content=?, updated_at=? WHERE id=?').run(JSON.stringify(clean), Date.now(), tenant.id);
  return clean;
}

export function saveTheme(db, tenant, theme) {
  const clean = normalizeTheme(theme, INDUSTRIES[tenant.industry].theme);
  db.prepare('UPDATE tenants SET theme=?, updated_at=? WHERE id=?').run(JSON.stringify(clean), Date.now(), tenant.id);
  return clean;
}

export function createTenant(db, { slug, name, industry, plan = 'basic' }) {
  if (!SLUG_RE.test(slug)) throw new Error('Slug зөвхөн жижиг латин үсэг, тоо, зураас (3–40 тэмдэгт) байна.');
  if (!INDUSTRIES[industry]) throw new Error('Салбар буруу байна.');
  const nm = str(name, 100);
  if (!nm) throw new Error('Нэр хоосон байна.');
  const now = Date.now();
  const r = db
    .prepare('INSERT INTO tenants(slug,name,industry,plan,theme,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
    .run(slug, nm, industry, str(plan, 20) || 'basic', JSON.stringify(INDUSTRIES[industry].theme), JSON.stringify(blankContent(industry)), now, now);
  return Number(r.lastInsertRowid);
}

export function countView(db, tenantId, day) {
  db.prepare('INSERT INTO page_views(tenant_id,day,count) VALUES(?,?,1) ON CONFLICT(tenant_id,day) DO UPDATE SET count=count+1').run(tenantId, day);
}

/** Одоо нээлттэй эсэхийг Улаанбаатарын цагаар тооцно. Шөнө дундыг давсан цагийн хуваарийг дэмжинэ. */
export function openStatus(hours, timeZone, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const dayIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday);
  const mins = Number(parts.hour) * 60 + Number(parts.minute);
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const today = hours[dayIdx];
  const yesterday = hours[(dayIdx + 6) % 7];
  // Өчигдрийн шөнө дундаас хэтэрсэн ээлж
  if (yesterday && !yesterday.closed && toMin(yesterday.close) < toMin(yesterday.open) && mins < toMin(yesterday.close)) {
    return { open: true, until: yesterday.close, dayIdx };
  }
  if (today && !today.closed) {
    const o = toMin(today.open);
    const c = toMin(today.close);
    const overnight = c < o;
    if (mins >= o && (overnight || mins < c)) return { open: true, until: today.close, dayIdx };
    if (mins < o) return { open: false, opensAt: today.open, dayIdx };
  }
  return { open: false, dayIdx };
}

export function todayKey(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
