import { html, raw } from './html.js';
import { CONTACT, SERVICE_KEYS } from './content.mjs';
import { logoMark } from './logo.mjs';
import { icon, topology, SERVICE_ICONS } from './graphics.mjs';
import { INDUSTRIES } from './vendor/industries.js';
import { PALETTES } from './vendor/themes.js';

export const SITE_URL = (process.env.SITE_URL || 'https://zangilaa.vercel.app').replace(/\/$/, '');
const V = process.env.ASSET_VERSION || '1';

export function renderPage(t) {
  const base = t.lang === 'en' ? '/en/' : '/';
  const tel = `tel:+976${CONTACT.phone}`;
  const firstIndustry = 'restaurant';
  return html`<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.title}</title>
<meta name="description" content="${t.description}">
<link rel="canonical" href="${SITE_URL}${base}">
<link rel="alternate" hreflang="mn" href="${SITE_URL}/">
<link rel="alternate" hreflang="en" href="${SITE_URL}/en/">
<meta name="theme-color" content="#0B2A5B">
<meta property="og:type" content="website">
<meta property="og:title" content="${t.title}">
<meta property="og:description" content="${t.description}">
<meta property="og:url" content="${SITE_URL}${base}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:locale" content="${t.lang === 'en' ? 'en_US' : 'mn_MN'}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Onest:wght@400;500;700&display=swap">
<link rel="stylesheet" href="/assets/styles.css?v=${V}">
<script src="/assets/main.js?v=${V}" defer></script>
</head>
<body data-lang="${t.lang}">
<a class="skip" href="#main">${t.skip}</a>

<header class="top">
  <a class="brand" href="${base}">${raw(logoMark({ size: 34, title: t.brand }))}<span>${t.brand}</span></a>
  <nav class="nav" aria-label="${t.brand}">
    <a href="#services">${t.nav.services}</a>
    <a href="#starlink">${t.nav.starlink}</a>
    <a href="#examples">${t.nav.examples}</a>
    <a href="#about">${t.nav.about}</a>
  </nav>
  <a class="lang" href="${t.otherLang.href}" hreflang="${t.otherLang.label === 'EN' ? 'en' : 'mn'}" aria-label="${t.otherLang.name}">${t.otherLang.label}</a>
  <a class="btn btn-sm" href="#order">${t.nav.order}</a>
</header>

<main id="main">
  <section class="hero">
    <div class="hero-text">
      <h1>${t.hero.h1}</h1>
      <p class="lead">${t.hero.lead}</p>
      <div class="actions">
        <a class="btn" href="#order">${t.hero.cta}</a>
        <a class="btn btn-ghost" href="${tel}">${t.hero.call} ${CONTACT.phoneDisplay}</a>
      </div>
      <ul class="facts">${t.facts.map((f) => html`<li>${f}</li>`)}</ul>
    </div>
    <figure class="hero-diagram">
      ${raw(topology(t))}
      <figcaption>${t.hero.diagramCaption}</figcaption>
    </figure>
  </section>

  <section id="services" class="services">
    <div class="section-head">
      <h2>${t.servicesTitle}</h2>
      <p>${t.servicesLead}</p>
    </div>
    <div class="svc-list">
      ${SERVICE_KEYS.map((k) => {
        const s = t.services[k];
        return html`<article id="svc-${k}" class="svc${k === 'starlink' || k === 'network' ? ' svc-major' : ''}">
          <div class="svc-ic">${raw(icon(SERVICE_ICONS[k], 26))}</div>
          <div class="svc-body">
            <h3>${s.title}</h3>
            <p class="svc-lead">${s.lead}</p>
            <ul>${s.points.map((p) => html`<li>${p}</li>`)}</ul>
          </div>
          <div class="svc-side">
            <p class="price"><span>${t.priceFrom}</span> ${s.price}</p>
            <a class="link" href="#order" data-service="${k}">${t.orderThis}</a>
          </div>
        </article>`;
      })}
    </div>
  </section>

  <section id="starlink" class="band">
    <div class="band-inner">
      <div>
        <h2>${t.starlink.title}</h2>
        <p class="lead">${t.starlink.lead}</p>
        <p class="note">${t.starlink.note}</p>
        <a class="btn btn-light" href="#order" data-service="starlink">${t.orderThis}</a>
      </div>
      <dl class="band-points">
        ${t.starlink.points.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}
      </dl>
    </div>
  </section>

  <section class="process">
    <h2>${t.processTitle}</h2>
    <ol>${t.process.map(([k, v]) => html`<li><strong>${k}</strong><span>${v}</span></li>`)}</ol>
  </section>

  <section id="examples" class="examples">
    <div class="section-head">
      <h2>${t.examplesTitle}</h2>
      <p>${t.examplesLead}</p>
    </div>
    <div class="ex-tabs" role="tablist" aria-label="${t.examplesTitle}">
      ${Object.entries(INDUSTRIES).map(([k, ind], i) => html`<button type="button" role="tab" class="ex-tab" data-industry="${k}" data-layout-default="${ind.theme.layout}" data-palette-default="${ind.theme.palette}" data-name="${ind.name}" aria-selected="${i === 0 ? 'true' : 'false'}">${ind.name}</button>`)}
    </div>
    <div class="ex-controls">
      <div class="ex-group" role="radiogroup" aria-label="${t.examplesLayout}">
        <span class="ex-label">${t.examplesLayout}</span>
        ${Object.entries(t.layouts).map(([k, name]) => html`<button type="button" class="ex-seg" data-layout="${k}" data-name="${name}" aria-pressed="false">${name}</button>`)}
      </div>
      <div class="ex-group" role="radiogroup" aria-label="${t.examplesPalette}">
        <span class="ex-label">${t.examplesPalette}</span>
        ${Object.entries(PALETTES).map(([k, p]) => html`<button type="button" class="ex-swatch" data-palette="${k}" data-bg="${p.bg}" data-accent="${p.accent}" aria-pressed="false" aria-label="${p.name}" title="${p.name}"><i></i><i></i></button>`)}
      </div>
    </div>
    <div class="ex-frame">
      <div class="ex-bar" aria-hidden="true"><i></i><i></i><i></i><span class="ex-url">demo.zangilaa.mn</span></div>
      <iframe src="/examples/${firstIndustry}/" title="${t.examplesFrameTitle}" loading="lazy"></iframe>
    </div>
    <div class="ex-actions">
      <a class="btn" href="#order" data-service="web" data-example-order>${t.examplesOrder}</a>
      <a class="link" href="/examples/${firstIndustry}/" target="_blank" rel="noopener" data-example-open>${t.examplesOpen}</a>
    </div>
  </section>

  <section id="about" class="about">
    <div class="about-head">
      <h2>${t.aboutTitle}</h2>
      <p class="about-name">${t.aboutName}</p>
      <p class="about-role">${t.aboutRole}</p>
      <p>${t.aboutText}</p>
    </div>
    <ol class="timeline">
      ${t.timeline.map(([y, role, org]) => html`<li><span class="tl-year">${y}</span><span class="tl-role">${role}</span><span class="tl-org">${org}</span></li>`)}
    </ol>
    <div class="skills">
      <h3>${t.skillsTitle}</h3>
      <ul>${t.skills.map((s) => html`<li>${s}</li>`)}</ul>
    </div>
  </section>

  <section id="order" class="order">
    <div class="order-head">
      <h2>${t.orderTitle}</h2>
      <p>${t.orderLead}</p>
      <div class="direct">
        <p class="direct-label">${t.direct}</p>
        <a href="${tel}">${CONTACT.phoneDisplay}</a>
        <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
      </div>
    </div>
    <form class="order-form" method="post" action="/api/order" data-order-form novalidate>
      <input type="hidden" name="lang" value="${t.lang}">
      <p class="form-msg" role="status" aria-live="polite" data-form-msg hidden></p>
      <fieldset class="seg">
        <legend>${t.form.type}</legend>
        <label><input type="radio" name="customer" value="person" checked> ${t.form.person}</label>
        <label><input type="radio" name="customer" value="org"> ${t.form.org}</label>
      </fieldset>
      <label>${t.form.service}
        <select name="service" required>
          ${SERVICE_KEYS.map((k) => html`<option value="${k}">${t.services[k].title}</option>`)}
          <option value="other">${t.form.other}</option>
        </select>
      </label>
      <div class="row2">
        <label>${t.form.name} <input name="name" required maxlength="80" autocomplete="name"></label>
        <label>${t.form.phone} <input name="phone" required maxlength="30" inputmode="tel" autocomplete="tel"></label>
      </div>
      <label data-org-field hidden>${t.form.orgName} <input name="org" maxlength="120" autocomplete="organization"></label>
      <label>${t.form.location} <input name="location" maxlength="120" placeholder="${t.form.locationHint}"></label>
      <label>${t.form.message} <textarea name="message" rows="4" maxlength="1500" placeholder="${t.form.messageHint}"></textarea></label>
      <label class="hp" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label>
      <button class="btn" type="submit" data-sending="${t.form.sending}">${t.form.submit}</button>
      <template data-ok>${t.form.ok}</template>
      <template data-err>${t.form.error}</template>
    </form>
  </section>
</main>

<footer class="foot">
  <a class="brand" href="${base}">${raw(logoMark({ size: 28, title: t.brand, ink: '#E7ECF3', bg: '#0B2A5B', blue: '#7FAEFF' }))}<span>${t.brand}</span></a>
  <p>${t.footer}</p>
  <p><a href="${tel}">${CONTACT.phoneDisplay}</a> <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
  <p class="copy">© ${new Date().getFullYear()} ${t.brand}, ${t.aboutName}</p>
</footer>
</body>
</html>`;
}
