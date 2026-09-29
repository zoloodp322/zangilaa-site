// Зангилаа лого: өлзий хээ мэт хоёр гогцоо сүлжилдэж, дөрвөн зангилаа (node) цэгээр холбогдоно.
// bg: логоны ард байх дэвсгэр өнгө (сүлжилдэх хэсгийн завсарт хэрэглэнэ).
export function logoMark({ size = 40, ink = '#0D1B2A', blue = '#1E56C8', node = '#F2A93B', bg = '#F5F7FA', title = 'Зангилаа' } = {}) {
  const w = 4.6;
  const gap = w + 3.2;
  const H = 'M -14 -6 H 14 A 6 6 0 0 1 14 6 H -14 A 6 6 0 0 1 -14 -6 Z';
  const V = 'M -6 -14 V 14 A 6 6 0 0 0 6 14 V -14 A 6 6 0 0 0 -6 -14 Z';
  const overCut = 'M 3.2 -6 H 8.8 M -8.8 6 H -3.2';
  const over = 'M 1.4 -6 H 10.6 M -10.6 6 H -1.4';
  return `<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(32 32) rotate(45)" fill="none" stroke-linecap="round">
    <path d="${H}" stroke="${ink}" stroke-width="${w}"/>
    <path d="${V}" stroke="${bg}" stroke-width="${gap}"/>
    <path d="${V}" stroke="${blue}" stroke-width="${w}"/>
    <path d="${overCut}" stroke="${bg}" stroke-width="${gap}" stroke-linecap="butt"/>
    <path d="${over}" stroke="${ink}" stroke-width="${w}" stroke-linecap="butt"/>
    <g fill="${node}" stroke="${bg}" stroke-width="1.6">
      <circle cx="0" cy="-20" r="3.6"/><circle cx="0" cy="20" r="3.6"/>
      <circle cx="-20" cy="0" r="3.6"/><circle cx="20" cy="0" r="3.6"/>
    </g>
  </g>
</svg>`;
}
