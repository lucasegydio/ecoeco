import { mount } from './cena3d.js';
const PL = { terra: { n: 'Terra', g: 'radial-gradient(circle at 35% 30%,#d6f5b0,#5fae4c 60%,#2e6b35)' }, deserto: { n: 'Deserto', g: 'radial-gradient(circle at 35% 30%,#ffe2a8,#f2b46a 55%,#8a5524)' }, gelo: { n: 'Gelo', g: 'radial-gradient(circle at 35% 30%,#fff,#a9dcff 55%,#3b6f9c)' } };
const RAR = { c: 'Comum', r: 'Rara', l: 'Lendária' }, STAR = { c: 1, r: 2, l: 3 };
const BICHOS = [
  { id: 1, n: 'Brotinho', esp: 'Guardião da pradaria', img: 'brotinho-frente', p: 'terra', r: 'c', st: 'foto', d: '12 nov 2026', hab: 'Pradaria', tr: ['Tímido', 'Cheira flores', 'Dorme ao sol'], s: [4, 3, 5, 1], q: 'Só se mostra quando o vento esquenta.' },
  { id: 2, n: 'Rabanete', esp: 'Ouvinte do solo úmido', img: 'rabanete-antena', p: 'terra', r: 'r', st: 'foto', d: '14 nov 2026', hab: 'Solo úmido', tr: ['Curioso', 'Capta sons', 'Rola morro abaixo'], s: [3, 2, 4, 2], q: 'A antena ouve o que a terra sussurra.' },
  { id: 3, n: 'Flor-creme', esp: 'Dançarina de orvalho', img: 'flor-creme', p: 'terra', r: 'c', st: 'visto', d: '15 nov 2026', hab: 'Pradaria', tr: [], s: [], q: '' },
  { id: 4, n: 'Pilar-musgo', esp: '', img: 'pilar-musgo', p: 'terra', r: 'l', st: 'nao', d: '', hab: '', tr: [], s: [], q: '' },
  { id: 5, n: 'Árvore-ninho', esp: 'Anciã de muitos hóspedes', img: 'arvore', p: 'terra', r: 'l', st: 'foto', d: '20 nov 2026', hab: 'Floresta', tr: ['Gentil', 'Abriga outros', 'Cresce devagar'], s: [5, 4, 5, 0], q: 'Cada galho guarda uma casa pequena.' },
  { id: 6, n: 'Cinzinha', esp: 'Sombra do rochedo', img: 'bichinho-cinza', p: 'terra', r: 'c', st: 'visto', d: '21 nov 2026', hab: 'Rochedo', tr: [], s: [], q: '' },
  { id: 7, n: 'Rocha-ocre', esp: 'Brasa das dunas', img: 'rocha-ocre', p: 'deserto', r: 'r', st: 'foto', d: '02 dez 2026', hab: 'Dunas', tr: ['Calado', 'Guarda calor', 'Brilha ao pôr do sol'], s: [2, 1, 0, 5], q: 'Esquenta o dia inteiro e devolve à noite.' },
];
// ícones de pincel (viewBox 24), traço grosso + pontos; o filtro #pincel torce a borda
const IC = {
  carinho: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.2C19.500 15.400 12 20 12 20z"/><circle cx="8" cy="9.500" r=".7"/>',
  polinizar: '<circle cx="12" cy="12" r="2.200"/><path d="M12 9.800C10 6 12 3.500 12 3.500s2 2.500 0 6.300M14.200 12c3.800-2 6.300 0 6.300 0s-2.500 2-6.300 0M12 14.200c2 3.800 0 6.300 0 6.300s-2-2.500 0-6.300M9.800 12C6 14 3.500 12 3.500 12s2.500-2 6.300 0"/>',
  plantar: '<path d="M12 21v-9M12 13c0-4 3-6.500 7.500-6.500 0 4.500-3 6.500-7.500 6.500zM12 16c0-3-2-5-6.500-5 0 3 2 5 6.500 5z"/><circle cx="5" cy="20" r=".8"/>',
  minerar: '<path d="M12 3l6 6-6 12-6-12zM6 9h12M10 9l2 12M14 9l-2 12"/>',
  genio: '<path d="M12 2.500l2.200 6.300 6.300 2.200-6.300 2.200L12 19.500l-2.200-6.300L3.500 11l6.300-2.200z"/><circle cx="19" cy="19" r=".9"/><circle cx="5" cy="19.500" r=".6"/>',
  dom: '<path d="M9 17.500V6l10-2v11.500"/><circle cx="6.800" cy="17.500" r="2.300"/><circle cx="16.800" cy="15.500" r="2.300"/>',
  habito: '<path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500z"/><circle cx="18" cy="5" r=".8"/><circle cx="21" cy="9" r=".5"/>',
  planeta: '<circle cx="12" cy="12" r="5.500"/><path d="M2.500 15c3 1.500 11.500-1 19-6" transform="rotate(8 12 12)"/><circle cx="19.500" cy="4.500" r=".7"/>',
  habitat: '<path d="M4.500 19.500C4 9.500 10 4 20 4c0 10-5.500 15.500-15.500 15.500zM4.500 19.500l8-8"/>',
  camera: '<path d="M3.500 8.500h3.500l1.800-2.800h6.400l1.800 2.800h3.500v11h-17z"/><circle cx="12" cy="13.500" r="3.500"/><circle cx="18.500" cy="11" r=".6"/>',
  olho: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="5" y="10.500" width="14" height="10" rx="3"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/><circle cx="12" cy="15.500" r=".8"/>',
  estrela: '<path d="M12 3l2.700 5.700 6.100.8-4.500 4.300 1.100 6.100L12 16.900l-5.400 3 1.100-6.100L3.200 9.500l6.100-.8z"/>',
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const AF = [['carinho', 'Carinho'], ['polinizar', 'Polinizar'], ['plantar', 'Plantar'], ['minerar', 'Minerar']];
const GEN = [['genio', 'Gênio'], ['dom', 'Dom'], ['habito', 'Hábito']];
const S = { cur: 2, m: null };
const $ = s => document.querySelector(s), app = $('#app');
const pad = n => String(n).padStart(3, '0');
const stars = r => [0, 1, 2].map(i => `<i class="${i < STAR[r] ? 'on' : ''}">${ic('estrela')}</i>`).join('');
const carimbo = (txt, sub) => `<svg class="carimbo" viewBox="0 0 120 120"><defs><path id="cp" d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0"/></defs><circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-dasharray="2 3"/><text font-size="13" fill="currentColor" font-family="Menda,serif" letter-spacing="2.4"><textPath href="#cp">${(txt + ' · ').toUpperCase().repeat(2)}</textPath></text><g transform="translate(46 40) scale(1.2)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">${IC.olho}</g><text x="60" y="94" text-anchor="middle" font-size="9" fill="currentColor" font-family="Nunito" font-weight="900" letter-spacing="1">${sub}</text></svg>`;

function carta(b) {
  const foto = b.st == 'foto', visto = b.st == 'visto', nao = b.st == 'nao', tot = '120';
  const chips = GEN.map(([k, l], i) => `<li><span class="ci">${ic(k)}</span><div><small>${l}</small><b>${foto ? b.tr[i] : '? ? ?'}</b></div></li>`).join('');
  const bars = AF.map(([k, l], i) => { const v = foto ? b.s[i] : 0; return `<li class="a-${k}"><span class="ai">${ic(k)}</span><b>${l}</b><div class="pips">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= v ? 'on' : ''}"></i>`).join('')}</div></li>`; }).join('');
  return `<div class="fit" id="fit"><div class="deck" id="deck"><article class="carta2 r-${b.r} st-${b.st}" id="c" data-bioma="${b.p}">
  <div class="miolo">
   <svg class="canto tl"><use href="#canto"/></svg><svg class="canto tr"><use href="#canto"/></svg><svg class="canto bl"><use href="#canto"/></svg><svg class="canto br"><use href="#canto"/></svg>
   <header class="topc"><div class="num"><small>Nº</small><b>${nao ? '???' : pad(b.id)}</b><em>/${tot}</em></div>
     <div class="tit"><h2>${nao ? '? ? ?' : b.n}</h2><p>${nao ? 'Espécie desconhecida' : visto ? 'Avistado de longe' : b.esp}</p></div>
     <div class="raridade" title="${RAR[b.r]}"><span class="stars">${nao ? '' : stars(b.r)}</span><b>${nao ? '?' : RAR[b.r].toUpperCase()}</b></div></header>
   <div class="vitrine">${nao ? `<div class="flat"><img class="silx" src="assets/${b.img}.webp" alt=""><div class="inter">?</div></div>` : '<canvas id="cv"></canvas>'}
     <div class="chip bio"><i class="orb" style="background:${PL[b.p].g}"></i>${PL[b.p].n}</div>
     <div class="chip est ${b.st}">${ic(foto ? 'camera' : visto ? 'olho' : 'lock')}${foto ? 'Fotografado' : visto ? 'Visto' : 'Não descoberto'}</div>
     ${visto ? `<div class="vistoc">${carimbo('Visto', b.d.slice(3).toUpperCase())}</div>` : ''}
     ${nao ? '' : '<div class="dica3d"><i></i>arraste para girar · pince para aproximar</div><button class="rec" id="rec" aria-label="Recentrar">↺</button>'}</div>
   <ul class="gen">${chips}</ul>
   <ul class="afin">${bars}</ul>
   <div class="rod"><div>${ic('planeta')}<small>Planeta</small><b>${PL[b.p].n}</b></div><div>${ic('habitat')}<small>Habitat</small><b>${nao ? '???' : b.hab}</b></div><div>${ic('camera')}<small>${foto ? 'Registrado' : 'Visto em'}</small><b>${nao ? '???' : b.d.slice(0, 6)}</b></div></div>
   <p class="cit">${foto ? '“' + b.q + '”' : visto ? 'Fotografe de perto para registrar a espécie.' : 'Explore o planeta para encontrar a silhueta.'}</p>
   <i class="brilho"></i><i class="holo"></i></div></article></div></div>`;
}
function arco() {
  const sel = BICHOS.findIndex(b => b.id == S.cur);
  return `<nav class="arco" id="arco">${BICHOS.map((b, i) => { const d = i - sel; return `<button data-id="${b.id}" class="${d == 0 ? 'on' : ''} ${b.st}" style="--d:${d}" aria-label="${b.st == 'nao' ? 'Não descoberto' : b.n}"><img src="assets/${b.img}.webp" alt="" class="${b.st == 'foto' ? '' : 'silx ' + b.st}"><em>${pad(b.id)}</em></button>`; }).join('')}</nav>`;
}
function render(anim) {
  if (S.m) { S.m.dispose(); S.m = null; }
  const b = BICHOS.find(b => b.id == S.cur);
  app.innerHTML = `<section class="stage ${anim ? 'entra' : ''}">${carta(b)}</section>${arco()}`;
  const cv = $('#cv'); if (cv) { S.m = mount(cv, { src: `assets/${b.img}.webp`, mode: b.st == 'foto' ? 'foto' : 'sil', bioma: b.p, rar: b.r }); $('#rec').onclick = () => S.m.reset(); }
  fit();
  const c = $('#c'), deck = $('#deck'), v = $('.vitrine');
  const mv = e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--lx', x * 100 + '%'); c.style.setProperty('--ly', y * 100 + '%');
    deck.style.transform = `perspective(1000px) rotateY(${(x - .5) * 9}deg) rotateX(${(.5 - y) * 7}deg)`;
    if (S.m && v) { const vr = v.getBoundingClientRect(); S.m.light(Math.max(-1, Math.min(1, (e.clientX - vr.left) / vr.width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (e.clientY - vr.top) / vr.height * 2))); }
  };
  c.addEventListener('pointermove', mv); c.addEventListener('pointerdown', mv);
  c.addEventListener('pointerleave', () => { deck.style.transform = ''; });
}
document.addEventListener('click', e => { const t = e.target.closest('#arco button'); if (!t || t.dataset.id == S.cur) return; S.cur = +t.dataset.id; render(true); });
let sx = null; document.addEventListener('pointerdown', e => { if (e.target.closest('#arco')) sx = e.clientX; });
document.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) < 40) return; const i = BICHOS.findIndex(b => b.id == S.cur) + (dx < 0 ? 1 : -1); if (BICHOS[i]) { S.cur = BICHOS[i].id; render(true); } });
render(true);
window.__S = S; window.__render = render;

function fit() { const st = $('.stage'), f = $('#fit'); if (!st || !f) return; f.style.transform = ''; f.style.marginBottom = ''; const h = f.offsetHeight, a = st.clientHeight - 14, w = f.offsetWidth, aw = st.clientWidth - 28, k = Math.min(1, a / h, aw / w); f.style.transformOrigin = 'top center'; f.style.transform = `scale(${k})`; f.style.marginBottom = (h * k - h) + 'px'; }
addEventListener('resize', fit);
