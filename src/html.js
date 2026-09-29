// Tagged template: ${...} доторх бүх утгыг автоматаар escape хийнэ (XSS хамгаалалт).
// Зөвхөн raw()-оор ороосон, бидний өөрсдийн үүсгэсэн HTML escape-гүй орно.
class Raw {
  constructor(s) {
    this.s = s;
  }
  toString() {
    return this.s;
  }
}

export const raw = (s) => new Raw(String(s));

const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
export const esc = (v) => String(v).replace(/[&<>"'`]/g, (c) => MAP[c]);

function render(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(render).join('');
  return esc(v);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}

// href-д зөвхөн аюулгүй схем зөвшөөрнө (javascript: гэх мэтийг хаана).
export function safeUrl(u, fallback = '#') {
  const s = String(u ?? '').trim();
  if (/^https?:\/\/[^\s<>"']+$/i.test(s)) return s;
  return fallback;
}

export function telHref(phone) {
  const digits = String(phone ?? '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}

export function jsonForScript(obj) {
  return raw(JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'));
}
