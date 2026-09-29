import { html, raw, safeUrl, telHref, jsonForScript } from './html.js';
import { INDUSTRIES, DAY_NAMES } from '../industries.js';
import { fontHref } from '../themes.js';
import { openStatus } from '../tenants.js';

const ASSET_V = '2';

function statusText(st) {
  if (st.open) return `Одоо нээлттэй, ${st.until} хүртэл`;
  if (st.opensAt) return `Одоо хаалттай, өнөөдөр ${st.opensAt}-д нээнэ`;
  return 'Одоо хаалттай';
}

export function renderSite({ tenant, config, sent = false, now = new Date(), canonical }) {
  const c = tenant.content;
  const ind = INDUSTRIES[tenant.industry];
  const st = openStatus(c.hours, config.timeZone, now);
  const tel = telHref(c.contact.phone);
  const tel2 = telHref(c.contact.phone2);
  const mapUrl = safeUrl(c.contact.mapUrl, '');
  const description = c.seoDescription || c.tagline || tenant.name;
  const hasGallery = c.gallery.length > 0;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: tenant.name,
    description,
    url: canonical,
    ...(c.contact.phone && { telephone: c.contact.phone }),
    ...(c.contact.address && { address: c.contact.address }),
    ...(c.contact.email && { email: c.contact.email }),
    openingHoursSpecification: c.hours
      .map((h, i) => (h.closed ? null : { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i], opens: h.open, closes: h.close }))
      .filter(Boolean),
  };

  return html`<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${tenant.name}${c.tagline ? ` | ${c.tagline}` : ''}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${tenant.name}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
${c.heroImage ? html`<meta property="og:image" content="${new URL('/media/' + c.heroImage, canonical).href}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref(tenant.theme)}">
<link rel="stylesheet" href="/static/site.css?v=${ASSET_V}">
<link rel="stylesheet" href="/theme.css?v=${tenant.updatedAt}">
<script type="application/ld+json">${jsonForScript(ld)}</script>
<script src="/static/site.js?v=${ASSET_V}" defer></script>
</head>
<body data-layout="${tenant.theme.layout}" data-industry="${tenant.industry}" data-motion="${tenant.theme.motion}">
<a class="skip" href="#main">Үндсэн хэсэг рүү шилжих</a>
${c.notice ? html`<p class="notice" role="status">${c.notice}</p>` : ''}
<header class="top">
  <a class="brand" href="/">${tenant.name}</a>
  <nav aria-label="Үндсэн цэс">
    ${c.about ? html`<a href="#about">Бидний тухай</a>` : ''}
    ${c.items.length ? html`<a href="#items">${ind.itemsTitle}</a>` : ''}
    <a href="#hours">Цагийн хуваарь</a>
    <a href="#contact">Холбоо барих</a>
  </nav>
  ${tel ? html`<a class="btn btn-small" href="${tel}">Залгах</a>` : ''}
</header>

<main id="main">
  <section class="hero${c.heroImage ? ' has-image' : ''}">
    ${c.heroImage ? html`<img class="hero-img" src="/media/${c.heroImage}" alt="" fetchpriority="high">` : ''}
    <div class="hero-text">
      <h1>${tenant.name}</h1>
      ${c.tagline ? html`<p class="tagline">${c.tagline}</p>` : ''}
      <p class="status ${st.open ? 'is-open' : 'is-closed'}"><span class="dot" aria-hidden="true"></span>${statusText(st)}</p>
      <div class="actions">
        ${tel ? html`<a class="btn" href="${tel}">Залгах ${c.contact.phone}</a>` : ''}
        ${mapUrl ? html`<a class="btn btn-ghost" href="${mapUrl}" rel="noopener" target="_blank">Байршил харах</a>` : ''}
      </div>
    </div>
  </section>

  ${c.about ? html`<section id="about" class="about"><h2>Бидний тухай</h2><p>${c.about}</p></section>` : ''}

  ${c.items.length
    ? html`<section id="items" class="items">
    <h2>${ind.itemsTitle}</h2>
    <ul class="item-list">
      ${c.items.map((it) => html`<li class="item">
        <span class="item-name">${it.name}</span>
        ${it.price ? html`<span class="item-price">${it.price}</span>` : ''}
        ${it.desc ? html`<p class="item-desc">${it.desc}</p>` : ''}
      </li>`)}
    </ul>
  </section>`
    : ''}

  ${hasGallery
    ? html`<section id="gallery" class="gallery" aria-label="Зургийн цомог">
    ${c.gallery.map((id, i) => html`<a class="gal-item" href="/media/${id}" data-gallery-index="${i}" aria-label="Зураг ${i + 1}-ийг томруулж харах"><img src="/media/${id}" alt="" loading="lazy" decoding="async"></a>`)}
  </section>`
    : ''}

  <section id="hours" class="hours">
    <h2>Цагийн хуваарь</h2>
    <table>
      <tbody>
      ${c.hours.map((h, i) => html`<tr${i === st.dayIdx ? raw(' class="today" aria-current="date"') : ''}>
        <th scope="row">${DAY_NAMES[i]}</th>
        <td>${h.closed ? 'Амарна' : `${h.open} – ${h.close}`}</td>
      </tr>`)}
      </tbody>
    </table>
  </section>

  <section id="contact" class="contact">
    <h2>Холбоо барих</h2>
    <div class="contact-grid">
      <dl class="contact-info">
        ${c.contact.address ? html`<div><dt>Хаяг</dt><dd>${c.contact.address}${mapUrl ? html` <a href="${mapUrl}" rel="noopener" target="_blank">Газрын зураг</a>` : ''}</dd></div>` : ''}
        ${tel ? html`<div><dt>Утас</dt><dd><a href="${tel}">${c.contact.phone}</a>${tel2 ? html`, <a href="${tel2}">${c.contact.phone2}</a>` : ''}</dd></div>` : ''}
        ${c.contact.email ? html`<div><dt>Имэйл</dt><dd><a href="mailto:${c.contact.email}">${c.contact.email}</a></dd></div>` : ''}
        ${c.contact.facebook || c.contact.instagram
          ? html`<div><dt>Сошиал</dt><dd>
            ${c.contact.facebook ? html`<a href="${safeUrl(c.contact.facebook)}" rel="noopener" target="_blank">Facebook</a>` : ''}
            ${c.contact.instagram ? html`<a href="${safeUrl(c.contact.instagram)}" rel="noopener" target="_blank">Instagram</a>` : ''}
          </dd></div>`
          : ''}
      </dl>
      <form class="contact-form" method="post" action="/contact" data-contact-form>
        ${sent ? html`<p class="form-ok" role="status">Мессеж илгээгдлээ. Бид удахгүй холбогдоно.</p>` : ''}
        <label>Нэр <input name="name" required maxlength="80" autocomplete="name"></label>
        <label>Утас <input name="phone" required maxlength="30" inputmode="tel" autocomplete="tel"></label>
        <label>Мессеж <textarea name="body" required maxlength="1000" rows="4"></textarea></label>
        <label class="hp" aria-hidden="true">Вэбсайт <input name="website" tabindex="-1" autocomplete="off"></label>
        <button class="btn" type="submit">Мессеж илгээх</button>
      </form>
    </div>
  </section>
</main>

<footer class="foot">
  <p>© ${now.getFullYear()} ${tenant.name}</p>
  ${config.brandUrl ? html`<p><a href="${safeUrl(config.brandUrl)}" rel="noopener">Вэбсайтыг ${config.brandName} бүтээв</a></p>` : ''}
</footer>
</body>
</html>`;
}

export function renderSimplePage(title, message, status = 200) {
  return {
    status,
    body: html`<!doctype html><html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><link rel="stylesheet" href="/static/admin.css?v=${ASSET_V}"></head>
<body class="simple"><main class="simple-box"><h1>${title}</h1><p>${message}</p></main></body></html>`,
  };
}
