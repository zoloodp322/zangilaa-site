// Нийтийн сайтын жижиг скрипт: зургийн цомог томруулах, мессеж илгээх үеийн төлөв.
// Скрипт ачаалагдаагүй үед ч сайт бүрэн ажиллана (зураг шинэ хуудсанд нээгдэнэ, форм илгээгдэнэ).
(() => {
  const items = [...document.querySelectorAll('.gal-item')];
  if (items.length && 'HTMLDialogElement' in window) {
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Зургийн цомог');
    dlg.innerHTML =
      '<div class="lightbox-inner"><img alt=""></div>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Хаах">×</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Өмнөх зураг">‹</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Дараагийн зураг">›</button>' +
      '<p class="lb-count" aria-live="polite"></p>';
    document.body.appendChild(dlg);
    const img = dlg.querySelector('img');
    const count = dlg.querySelector('.lb-count');
    const multi = items.length > 1;
    dlg.querySelector('.lb-prev').hidden = !multi;
    dlg.querySelector('.lb-next').hidden = !multi;
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + items.length) % items.length;
      img.src = items[index].getAttribute('href');
      count.textContent = multi ? `${index + 1} / ${items.length}` : '';
      // Хөдөлгөөнийг зураг солигдох бүрт дахин тоглуулна
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = '';
    };

    items.forEach((a, i) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        opener = a;
        show(i);
        dlg.showModal();
      }),
    );
    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
    dlg.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    dlg.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    // Зургийн гадна талд дарвал хаана
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('lightbox-inner')) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    // Гар утсан дээр хуруугаар шударч солих
    let startX = null;
    dlg.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', (e) => {
      if (startX === null || !multi) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
    dlg.addEventListener('close', () => { img.removeAttribute('src'); opener?.focus(); });
  }

  // Мессеж илгээх үед товчийг түгжиж, давхар илгээхээс сэргийлнэ
  const form = document.querySelector('[data-contact-form]');
  form?.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = 'Илгээж байна…';
  });
})();
