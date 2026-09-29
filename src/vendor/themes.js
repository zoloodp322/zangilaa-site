// Загвар = layout (бүтэц) + palette (өнгө) + font (үсгийн хос).
// Эдгээр нь зөвхөн CSS хувьсагч солино — нэг HTML, олон дүр төрх. Шинэ загвар нэмэхэд энд нэг мөр нэмнэ.

export const LAYOUTS = {
  menu: { name: 'Жагсаалт', hint: 'Үнэ бүхий жагсаалт тод харагдана. Хоолны газар, үсчинд тохиромжтой.' },
  poster: { name: 'Постер', hint: 'Нэр том, хүчтэй. Авто засвар, аялал жуулчлалд тохиромжтой.' },
  card: { name: 'Карт', hint: 'Зөөлөн, зураг түлхүү. Эмнэлэг, дэлгүүр, гоо сайханд тохиромжтой.' },
};

// Хөдөлгөөний түвшин. "off" болон хэрэглэгчийн системийн "reduced motion" тохиргоо үргэлж хүндэтгэгдэнэ.
export const MOTION = {
  lively: { name: 'Амьд', hint: 'Сайт нээгдэхэд нүүр хэсэг гоё хөдөлгөөнтэй гарч ирнэ.' },
  subtle: { name: 'Тайван', hint: 'Зөвхөн "нээлттэй" тэмдэг, зургийн цомгийн хөдөлгөөн.' },
  off: { name: 'Хөдөлгөөнгүй', hint: 'Ямар ч хөдөлгөөнгүй.' },
};

// bg: дэвсгэр, surface: хэсгийн дэвсгэр, text: үндсэн текст, muted: туслах текст, accent: товч/онцлох, onAccent: товч дээрх текст
export const PALETTES = {
  chili: { name: 'Чинжүү', bg: '#FFFCF7', surface: '#F3E6D3', text: '#2A1A14', muted: '#7A5E4F', accent: '#B8321E', onAccent: '#FFFFFF' },
  steppe: { name: 'Тал нутаг', bg: '#F6F8F4', surface: '#E4EBDD', text: '#1D2B22', muted: '#5B6B5F', accent: '#2F6B45', onAccent: '#FFFFFF' },
  clinic: { name: 'Цэвэр', bg: '#F7FAFC', surface: '#E3F0F2', text: '#0F2233', muted: '#4F6475', accent: '#0E7C86', onAccent: '#FFFFFF' },
  garage: { name: 'Гараж', bg: '#1C1F22', surface: '#2A2E33', text: '#ECEAE4', muted: '#A5A9AD', accent: '#F2A900', onAccent: '#1C1F22' },
  plum: { name: 'Чавга', bg: '#FBF6F6', surface: '#F1E2E6', text: '#3A2230', muted: '#7D5E6B', accent: '#A34A6B', onAccent: '#FFFFFF' },
  harbor: { name: 'Далай', bg: '#FFFFFF', surface: '#EEF1F7', text: '#14213D', muted: '#56607A', accent: '#D1462F', onAccent: '#FFFFFF' },
  khukh: { name: 'Хөх', bg: '#F5F7FB', surface: '#E2E8F4', text: '#10203F', muted: '#51607D', accent: '#1F4E9C', onAccent: '#FFFFFF' },
  felt: { name: 'Эсгий', bg: '#FAFAF8', surface: '#ECEBE6', text: '#23221F', muted: '#6B6963', accent: '#4A4843', onAccent: '#FFFFFF' },
};

// Бүгд кирилл үсэг бүрэн дэмждэг Google Fonts.
export const FONTS = {
  paratype: { name: 'PT Serif + PT Sans', serif: true, display: 'PT Serif', body: 'PT Sans', q: 'PT+Serif:wght@400;700&family=PT+Sans:wght@400;700' },
  modern: { name: 'Unbounded + Manrope', display: 'Unbounded', body: 'Manrope', q: 'Unbounded:wght@500;700&family=Manrope:wght@400;600' },
  friendly: { name: 'Comfortaa + Nunito', display: 'Comfortaa', body: 'Nunito', q: 'Comfortaa:wght@500;700&family=Nunito:wght@400;700' },
  sturdy: { name: 'Oswald + IBM Plex Sans', display: 'Oswald', body: 'IBM Plex Sans', q: 'Oswald:wght@500;600&family=IBM+Plex+Sans:wght@400;600' },
  rounded: { name: 'Rubik', display: 'Rubik', body: 'Rubik', q: 'Rubik:wght@400;600;700' },
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function normalizeTheme(input, fallback) {
  const t = { ...fallback, ...(input || {}) };
  const out = {
    layout: LAYOUTS[t.layout] ? t.layout : fallback.layout,
    palette: PALETTES[t.palette] ? t.palette : fallback.palette,
    font: FONTS[t.font] ? t.font : fallback.font,
    motion: MOTION[t.motion] ? t.motion : 'lively',
    custom: null,
  };
  // Хэрэглэгч өөрөө өнгө сонгосон бол зөвхөн #RRGGBB форматыг хүлээн авна (CSS injection хамгаалалт).
  if (t.custom && typeof t.custom === 'object') {
    const c = {};
    for (const k of ['bg', 'surface', 'text', 'muted', 'accent', 'onAccent']) {
      if (HEX.test(String(t.custom[k] || ''))) c[k] = t.custom[k].toUpperCase();
    }
    if (Object.keys(c).length) out.custom = c;
  }
  return out;
}

export function themeColors(theme) {
  return { ...PALETTES[theme.palette], ...(theme.custom || {}) };
}

export function themeCss(theme) {
  const c = themeColors(theme);
  const f = FONTS[theme.font];
  return `:root{--bg:${c.bg};--surface:${c.surface};--text:${c.text};--muted:${c.muted};--accent:${c.accent};--on-accent:${c.onAccent};` +
    `--font-display:'${f.display}',${f.serif ? 'Georgia,serif' : 'system-ui,sans-serif'};--font-body:'${f.body}',system-ui,sans-serif;}\n`;
}

export function fontHref(theme) {
  return `https://fonts.googleapis.com/css2?family=${FONTS[theme.font].q}&display=swap`;
}
