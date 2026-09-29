// Жишээ сайт дотор: URL-ийн layout/palette-г хэрэглэж, "одоо нээлттэй"-г бодит цагаар тооцно.
(() => {
  const data = JSON.parse(document.getElementById('ex-data').textContent);
  const q = new URLSearchParams(location.search);
  const layout = q.get('layout');
  if (['menu', 'poster', 'card'].includes(layout)) document.body.dataset.layout = layout;
  const pal = data.palettes[q.get('palette')];
  if (pal) {
    const s = document.documentElement.style;
    s.setProperty('--bg', pal.bg); s.setProperty('--surface', pal.surface); s.setProperty('--text', pal.text);
    s.setProperty('--muted', pal.muted); s.setProperty('--accent', pal.accent); s.setProperty('--on-accent', pal.onAccent);
  }

  // Нээлттэй эсэх (Улаанбаатарын цагаар)
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ulaanbaatar', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday);
  const now = +parts.hour * 60 + +parts.minute;
  const m = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const h = data.hours[day];
  let text = 'Одоо хаалттай';
  let open = false;
  if (h && !h.closed) {
    if (now >= m(h.open) && now < m(h.close)) { open = true; text = `Одоо нээлттэй, ${h.close} хүртэл`; }
    else if (now < m(h.open)) text = `Одоо хаалттай, өнөөдөр ${h.open}-д нээнэ`;
  }
  const st = document.querySelector('.status');
  if (st) {
    st.classList.toggle('is-open', open);
    st.classList.toggle('is-closed', !open);
    st.lastChild.textContent = text;
  }
  document.querySelectorAll('.hours tr').forEach((tr, i) => {
    tr.classList.toggle('today', i === day);
  });

  // Жишээ форм илгээхгүй
  const form = document.querySelector('[data-demo-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = document.createElement('p');
    p.className = 'form-ok';
    p.textContent = 'Жишээ сайт: жинхэнэ сайт дээр энэ мессеж эзэмшигчийн самбарт очно.';
    form.prepend(p);
  });
})();
