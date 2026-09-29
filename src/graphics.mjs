import { esc } from './html.js';

// Нэг хэв маягтай зураасан дүрсүүд (24×24, currentColor)
const P = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
  dish: '<path d="M5 13a8 8 0 0 0 8-8L5 13z"/><path d="M5 13c-1 2-1 4 0 5.5M9 9l4 4M14 4.5l2 2M16.5 2.5a5 5 0 0 1 5 5"/><path d="M7 21h8M9 17.5 11 21"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3z"/><path d="m9 12 2 2 4-4"/>',
  switch: '<rect x="2.5" y="7" width="19" height="10" rx="2"/><path d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.2" r=".9"/>',
  camera: '<path d="M3 7h12l3 3v3l-3 3H3z"/><path d="M18 10.5 21 9v6l-3-1.5M8 16v4M5 20h6"/>',
  server: '<rect x="3.5" y="3.5" width="17" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="7" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>',
  web: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 8.5h19M6 6.3h.01M8.5 6.3h.01M6 12.5h8M6 15.5h5"/>',
  pc: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
  support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12M12 12l-5.5 5M12 12l5.5 5"/>',
};

export function icon(name, size = 24) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
}

export const SERVICE_ICONS = { network: 'network', starlink: 'dish', wifi: 'wifi', cctv: 'camera', server: 'server', support: 'support', web: 'web', callout: 'wrench' };

// Нүүр хэсгийн сүлжээний схем. Зангилаа бүр харгалзах үйлчилгээ рүү холбоос.
export function topology(t) {
  const W = 118, H = 50;
  const node = (key, x, y, ic, label, href) => `
  <a class="tp-node" href="${href}" data-node="${key}" transform="translate(${x - W / 2} ${y - H / 2})">
    <rect width="${W}" height="${H}" rx="12"/>
    <g transform="translate(12 13)" class="tp-ic">${P[ic].replace(/<(path|circle|rect)/g, '<$1 fill="none"')}</g>
    <text x="42" y="31">${esc(label)}</text>
  </a>`;
  const leaves = [
    ['wifi', 72, 'wifi', t.topo.wifi, '#svc-wifi'],
    ['cctv', 198, 'camera', t.topo.cctv, '#svc-cctv'],
    ['server', 322, 'server', t.topo.server, '#svc-server'],
    ['pc', 448, 'pc', t.topo.pc, '#svc-network'],
  ];
  const trunk = (x) => `M260 64 V242 V280 H${x} V318`;
  const packets = leaves
    .map(([, x], i) => `<circle class="tp-packet" r="4"><animateMotion dur="3.2s" begin="-${(i * 0.8).toFixed(1)}s" repeatCount="indefinite" path="${trunk(x)}"/></circle>`)
    .join('');
  return `<svg class="topology" viewBox="0 0 520 412" role="group" aria-label="${esc(t.hero.diagramCaption)}" xmlns="http://www.w3.org/2000/svg">
  <rect class="tp-zone" x="6" y="98" width="508" height="276" rx="20"/>
  <a href="#svc-support" class="tp-zone-label"><text x="24" y="398">${esc(t.topo.support)}</text></a>
  <g class="tp-links">
    <path d="M260 64 V242"/>
    ${leaves.map(([, x]) => `<path d="M260 242 V280 H${x} V318"/>`).join('')}
    <path d="M319 39 H382"/>
    <path class="tp-sat" d="M142 39 H201"/>
  </g>
  <g class="tp-packets">${packets}<circle class="tp-packet" r="4"><animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite" path="M319 39 H382"/></circle></g>
  ${node('starlink', 84, 39, 'dish', t.topo.starlink, '#starlink')}
  ${node('internet', 260, 39, 'globe', t.topo.internet, '#svc-network')}
  ${node('web', 441, 39, 'web', t.topo.web, '#examples')}
  ${node('firewall', 260, 142, 'shield', t.topo.firewall, '#svc-network')}
  ${node('switch', 260, 222, 'switch', t.topo.switch, '#svc-network')}
  ${leaves.map(([key, x, ic, label, href]) => node(key, x, 340, ic, label, href)).join('')}
</svg>`;
}
