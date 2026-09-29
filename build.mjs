// Статик сайтыг dist/ руу бүтээнэ: МН, EN хуудас + салбар бүрийн жишээ сайт.
// Vercel дээр `node build.mjs` автоматаар ажиллана. Гадны dependency байхгүй.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, CONTACT } from './src/content.mjs';
import { renderPage, SITE_URL } from './src/page.mjs';
import { logoMark } from './src/logo.mjs';
import { renderSite } from './src/vendor/views/site.js';
import { INDUSTRIES, blankContent } from './src/vendor/industries.js';
import { PALETTES, themeCss } from './src/vendor/themes.js';
import { normalizeTheme } from './src/vendor/themes.js';

const OUT = path.resolve('dist');
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, data) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};
const copy = (from, to) => write(to, fs.readFileSync(from));

// 1. Үндсэн хуудсууд
write('index.html', String(renderPage(LANGS.mn)));
write('en/index.html', String(renderPage(LANGS.en)));
for (const f of ['styles.css', 'main.js']) copy(`assets/${f}`, `assets/${f}`);
copy('assets/og.png', 'og.png');
write('favicon.svg', logoMark({ size: 64, bg: '#FFFFFF', title: 'Зангилаа' }));
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /examples/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod></url>\n<url><loc>${SITE_URL}/en/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`);

// 2. Жишээ сайтууд (site-factory-ийн загвараар)
const NAMES = {
  restaurant: 'Нүүдэл гуанз',
  beauty: 'Саруул гоо сайхан',
  clinic: 'Инээмсэглэл шүдний эмнэлэг',
  auto: 'Хурд авто засвар',
  retail: 'Өглөө маркет',
  tourism: 'Хонгор нуур жуулчны бааз',
  education: 'Алхам сургалтын төв',
};
const config = { timeZone: 'Asia/Ulaanbaatar', brandName: 'Зангилаа', brandUrl: SITE_URL };
for (const [key, ind] of Object.entries(INDUSTRIES)) {
  const content = blankContent(key);
  content.contact = { ...content.contact, phone: CONTACT.phoneDisplay, address: 'Улаанбаатар, Сүхбаатар дүүрэг', mapUrl: 'https://maps.google.com/?q=Ulaanbaatar', facebook: 'https://facebook.com/' };
  const theme = normalizeTheme(ind.theme, ind.theme);
  const tenant = { id: 0, slug: key, name: NAMES[key], industry: key, plan: 'basic', status: 'active', updatedAt: 1, theme, content };
  let page = String(renderSite({ tenant, config, canonical: `${SITE_URL}/examples/${key}/` }));
  const data = JSON.stringify({ palettes: PALETTES, hours: content.hours, theme }).replace(/</g, '\\u003c');
  page = page
    .replace(/\/static\/site\.css\?v=\d+/, '/examples/assets/site.css')
    .replace(/\/theme\.css\?v=\d+/, 'theme.css')
    .replace(/<script src="\/static\/site\.js\?v=\d+" defer><\/script>/,
      '<script src="/examples/assets/site.js" defer></script>\n<script src="/examples/assets/examples.js" defer></script>\n<link rel="stylesheet" href="/examples/assets/examples.css">\n' +
      `<script type="application/json" id="ex-data">${data}</script>\n<meta name="robots" content="noindex">`)
    .replace('action="/contact"', 'action="#" data-demo-form')
    .replace(/(<body[^>]*>)/, '$1\n<p class="demo-ribbon">Энэ бол жишээ сайт. Зангилаа бүтээв.</p>');
  write(`examples/${key}/index.html`, page);
  write(`examples/${key}/theme.css`, themeCss(theme));
}
copy('assets/site.css', 'examples/assets/site.css');
copy('assets/site.js', 'examples/assets/site.js');
copy('assets/examples.js', 'examples/assets/examples.js');
copy('assets/examples.css', 'examples/assets/examples.css');

console.log('Бүтээгдлээ:', OUT);
