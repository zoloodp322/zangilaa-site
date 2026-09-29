// Зангилаа: схемийн хөдөлгөөн, жишээ сайт солих, захиалгын форм. Inline script ашиглахгүй (CSP).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lang = document.body.dataset.lang || 'mn';

  // --- Сүлжээний схем: багасгасан хөдөлгөөн эсвэл дэлгэцээс гарсан үед зогсооно ---
  const topo = $('.topology');
  if (topo && topo.pauseAnimations) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    const sync = () => (reduce.matches || !visible ? topo.pauseAnimations() : topo.unpauseAnimations());
    reduce.addEventListener?.('change', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(topo);
    }
    sync();
  }

  // --- Захиалгын форм ---
  const form = $('[data-order-form]');
  const msg = form && $('[data-form-msg]', form);
  const setService = (key, message) => {
    if (!form) return;
    const sel = form.elements.service;
    if ([...sel.options].some((o) => o.value === key)) sel.value = key;
    if (message) form.elements.message.value = message;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-service]');
    if (a) setService(a.dataset.service, a.dataset.message);
  });

  if (form) {
    const orgField = $('[data-org-field]', form);
    const syncOrg = () => { orgField.hidden = form.elements.customer.value !== 'org'; };
    form.addEventListener('change', (e) => { if (e.target.name === 'customer') syncOrg(); });
    syncOrg();

    const show = (kind) => {
      msg.hidden = false;
      msg.className = `form-msg ${kind}`;
      msg.textContent = $(kind === 'ok' ? 'template[data-ok]' : 'template[data-err]', form).content.textContent;
    };
    if (new URLSearchParams(location.search).get('sent') === '1') show('ok');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let bad = null;
      for (const name of ['name', 'phone']) {
        const el = form.elements[name];
        const invalid = !el.value.trim();
        el.setAttribute('aria-invalid', String(invalid));
        if (invalid && !bad) bad = el;
      }
      if (bad) { bad.focus(); return; }
      const btn = $('button[type="submit"]', form);
      const label = btn.textContent;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = btn.dataset.sending;
      try {
        const body = Object.fromEntries(new FormData(form));
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        syncOrg();
        show('ok');
      } catch {
        show('err');
      } finally {
        btn.removeAttribute('aria-busy');
        btn.textContent = label;
        msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  // --- Жишээ сайт солих ---
  const frame = $('.ex-frame iframe');
  if (frame) {
    const tabs = $$('.ex-tab');
    const segs = $$('.ex-seg');
    const swatches = $$('.ex-swatch');
    const openLink = $('[data-example-open]');
    const orderBtn = $('[data-example-order]');
    swatches.forEach((b) => { const [a, c] = b.querySelectorAll('i'); a.style.background = b.dataset.bg; c.style.background = b.dataset.accent; });

    const state = { industry: tabs[0].dataset.industry, layout: tabs[0].dataset.layoutDefault, palette: tabs[0].dataset.paletteDefault };
    const render = () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.industry === state.industry)));
      segs.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.layout === state.layout)));
      swatches.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.palette === state.palette)));
      const url = `/examples/${state.industry}/?layout=${state.layout}&palette=${state.palette}`;
      frame.src = url;
      openLink.href = url;
      const ind = tabs.find((t) => t.dataset.industry === state.industry).dataset.name;
      const lay = segs.find((s) => s.dataset.layout === state.layout).dataset.name;
      const pal = swatches.find((s) => s.dataset.palette === state.palette).getAttribute('aria-label');
      orderBtn.dataset.message = lang === 'en'
        ? `Website like the example: ${ind}, layout "${lay}", colours "${pal}".`
        : `Жишээ шиг вэбсайт: ${ind}, бүтэц "${lay}", өнгө "${pal}".`;
    };
    tabs.forEach((t) => t.addEventListener('click', () => {
      Object.assign(state, { industry: t.dataset.industry, layout: t.dataset.layoutDefault, palette: t.dataset.paletteDefault });
      render();
    }));
    // Сумаар tab шилжих
    $('.ex-tabs').addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = tabs.findIndex((t) => t.dataset.industry === state.industry);
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      next.click();
    });
    segs.forEach((s) => s.addEventListener('click', () => { state.layout = s.dataset.layout; render(); }));
    swatches.forEach((s) => s.addEventListener('click', () => { state.palette = s.dataset.palette; render(); }));
    render();
  }
})();
