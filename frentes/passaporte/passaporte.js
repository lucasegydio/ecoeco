import { mount } from './ficha3d.js';
const PL = { terra: { n: 'Terra', g: 'radial-gradient(circle at 35% 30%,#d6f5b0,#5fae4c 60%,#2e6b35)' }, deserto: { n: 'Deserto', g: 'radial-gradient(circle at 35% 30%,#ffe2a8,#f2b46a 55%,#8a5524)' }, gelo: { n: 'Gelo', g: 'radial-gradient(circle at 35% 30%,#fff,#a9dcff 55%,#3b6f9c)' } };
const RAR = { c: 'Comum', r: 'Rara', l: 'Lendária' };
const BICHOS = [
  { id: 1, n: 'Brotinho', img: 'brotinho-frente', p: 'terra', r: 'c', st: 'foto', d: '12 mar 2027', hab: 'Pradaria', tr: ['Tímido', 'Cheira flores', 'Dorme ao sol'] },
  { id: 2, n: 'Rabanete', img: 'rabanete-antena', p: 'terra', r: 'r', st: 'foto', d: '14 mar 2027', hab: 'Solo úmido', tr: ['Curioso', 'Capta sons', 'Rola morro abaixo'] },
  { id: 3, n: 'Flor-creme', img: 'flor-creme', p: 'terra', r: 'c', st: 'visto', d: '15 mar 2027', hab: 'Pradaria', tr: ['???', '???', '???'] },
  { id: 4, n: 'Pilar-musgo', img: 'pilar-musgo', p: 'terra', r: 'l', st: 'nao', d: '', hab: '', tr: [] },
  { id: 5, n: 'Árvore-ninho', img: 'arvore', p: 'terra', r: 'r', st: 'foto', d: '20 mar 2027', hab: 'Floresta', tr: ['Gentil', 'Abriga outros', 'Cresce devagar'] },
  { id: 6, n: 'Cinzinha', img: 'bichinho-cinza', p: 'terra', r: 'c', st: 'visto', d: '21 mar 2027', hab: 'Rochedo', tr: ['???', '???', '???'] },
  { id: 7, n: 'Rocha-ocre', img: 'rocha-ocre', p: 'deserto', r: 'r', st: 'foto', d: '02 abr 2027', hab: 'Dunas', tr: ['Calado', 'Guarda calor', 'Brilha ao pôr do sol'] },
];
const S = { dir: 1, tela: 'capa', pag: 'id', cur: null, nome: 'Viajante', m: null };
const $ = s => document.querySelector(s), app = $('#app');
const num = b => b.st === 'nao' ? '№ ???' : '№ ' + String(b.id).padStart(3, '0');
const sil = b => `<img src="assets/${b.img}.webp" alt="" class="sil ${b.st}">`;
const thumb = b => b.st === 'foto' ? `<img src="assets/${b.img}.webp" alt="${b.n}">` : sil(b);

function carimbo(txt, sub, cor, rot = -8, ico = '') {
  const id = 'c' + Math.random().toString(36).slice(2, 7);
  return `<svg class="carimbo" viewBox="0 0 120 120" style="--rot:${rot}deg;color:${cor}" aria-label="Visto ${txt}"><defs><path id="${id}" d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0"/></defs>
  <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
  <text font-size="13" fill="currentColor" font-family="Menda,serif" letter-spacing="2.4"><textPath href="#${id}" startOffset="0">${(txt + ' · ' + txt).toUpperCase()} ·</textPath></text>
  <circle cx="60" cy="60" r="22" fill="currentColor" opacity=".16"/><text x="60" y="66" text-anchor="middle" font-size="22" fill="currentColor" font-family="Menda,serif">${ico}</text>
  <text x="60" y="94" text-anchor="middle" font-size="8.5" fill="currentColor" font-family="Nunito" font-weight="800" letter-spacing="1">${sub}</text></svg>`;
}
const cor = { terra: '#2e6b35', deserto: '#a2602a', gelo: '#3b6f9c' };

function capa() {
  return `<section class="capa" data-tela="capa"><div class="capa-in"><img class="marca" src="assets/marca.png" alt="">
  <small>MUNDOS E BICHINHOS</small><h1>PASSAPORTE</h1><i class="linha"></i><p>intergaláctico</p>
  <div class="selo"></div></div><button class="abrir" data-go="livro">Abrir</button></section>`;
}
function abas() {
  const a = [['id', 'Eu'], ...Object.entries(PL).map(([k, v]) => [k, v.n])];
  return `<div class="abas">${a.map(([k, n]) => `<button data-pag="${k}" class="${S.pag === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
}
function pagId() {
  return `<div class="folha id"><h2>Identidade</h2>
  <div class="foto">${carimbo(S.nome.slice(0, 1) || 'V', 'RESIDENTE', 'var(--eco-coral)', -6, S.nome.slice(0, 1).toUpperCase() || 'V')}</div>
  <dl><dt>Nome</dt><dd><input id="nome" value="${S.nome}" maxlength="14" aria-label="Seu nome"></dd><dt>Nº do passaporte</dt><dd>EC 0042 17</dd><dt>Emitido em</dt><dd>10 mar 2027</dd><dt>Mundos visitados</dt><dd>2 de 5</dd><dt>Bichinhos</dt><dd>${BICHOS.filter(b => b.st == 'foto').length} fotografados · ${BICHOS.filter(b => b.st == 'visto').length} vistos</dd></dl>
  <p class="mrz">P&lt;ECO&lt;${S.nome.toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>EC004217&lt;4ECO2703&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p></div>`;
}
function pagPlaneta(k) {
  const l = BICHOS.filter(b => b.p === k), visit = l.length > 0, fot = l.filter(b => b.st == 'foto').length;
  const slots = visit ? l.map(b => `<button class="slot ${b.st} r-${b.r}" data-bicho="${b.id}">${thumb(b)}<b>${b.st == 'nao' ? '???' : b.n}</b><small>${num(b)}</small>${b.st == 'visto' ? '<em>VISTO</em>' : ''}</button>`).join('')
    : '<p class="vazio">Mundo ainda não visitado.<br>O visto aparece aqui na chegada.</p>';
  return `<div class="folha pl" data-bioma="${k}"><header><div class="orb" style="background:${PL[k].g}"></div><div><h2>${PL[k].n}</h2><small>${visit ? `${fot} de ${l.length} registrados` : 'sem visto'}</small></div>
  ${visit ? carimbo(PL[k].n, 'VISTO · ' + l[0].d.slice(3), cor[k], -9, '●') : '<div class="carimbo vazio-c"></div>'}</header><div class="grade">${slots}</div></div>`;
}
function livro() {
  return `<section class="livro" data-tela="livro"><div class="topo"><button data-go="capa" class="x">← Capa</button><span>${S.nome}</span></div>${abas()}<div class="miolo">${S.pag === 'id' ? pagId() : pagPlaneta(S.pag)}</div></section>`;
}
function carta(b) {
  const k = b.p, foto = b.st == 'foto';
  const tr = b.tr.map((t, i) => `<li><span>${['Gênio', 'Dom', 'Hábito'][i]}</span><b>${t}</b></li>`).join('');
  const ficha = b.st == 'nao' ? '<p class="dica">Ainda não encontrado.<br>Explore o planeta para ver a silhueta.</p>'
    : `<ul class="tr">${tr}</ul><dl><dt>Planeta</dt><dd>${PL[k].n}</dd><dt>Habitat</dt><dd>${b.hab}</dd><dt>${foto ? 'Registrado em' : 'Visto em'}</dt><dd>${b.d}</dd></dl>${foto ? '' : '<p class="dica">Fotografe de perto para registrar.</p>'}`;
  return `<section class="cartaw" data-tela="carta" data-bioma="${k}"><div class="topo"><button data-go="livro" class="x">← ${PL[k].n}</button><span>${num(b)}</span></div>
  <article class="carta r-${b.r} st-${b.st}" id="carta">
    <header><span class="nome">${b.st == 'nao' ? '? ? ?' : b.n}</span><span class="nr">${b.st == 'nao' ? '?' : String(b.id).padStart(3, '0')}</span></header>
    <div class="janela"><div class="raios"></div>${b.st == 'nao' ? `<div class="flat">${sil(b)}</div>` : '<canvas id="cv"></canvas>'}
      ${b.st == 'visto' ? `<div class="vistoc">${carimbo('Visto', b.d.slice(3), 'var(--eco-coral)', -14, '◉')}</div>` : ''}
      ${b.st != 'nao' ? '<div class="dica3d"><i></i>arraste · pince</div><button class="rec" id="rec" aria-label="Recentrar">↺</button>' : ''}</div>
    <div class="ficha">${ficha}</div>
    <footer><span class="raro" title="Raridade">${b.st == 'nao' ? '?' : RAR[b.r]}</span><span class="pill">${PL[k].n}</span><span class="pill">${foto ? 'Fotografado' : b.st == 'visto' ? 'Visto' : 'Não descoberto'}</span></footer>
    <i class="luz"></i></article>
  <p class="nota3d">${b.st == 'nao' ? '' : 'Modelo 3D provisório (arte em fatias); entra o do time depois.'}</p></section>`;
}
function render() {
  if (S.m) { S.m.dispose(); S.m = null; }
  app.innerHTML = S.tela == 'capa' ? capa() : S.tela == 'livro' ? livro() : carta(BICHOS.find(b => b.id == S.cur));
  document.body.dataset.dir = S.dir; document.body.dataset.tela = S.tela;
  const cv = $('#cv'); if (cv) { const b = BICHOS.find(b => b.id == S.cur); S.m = mount(cv, `assets/${b.img}.webp`, b.st == 'foto' ? 'foto' : 'sil'); $('#rec').onclick = () => S.m.reset(); }
  const c = $('#carta'); if (c) { const mv = e => { const r = c.getBoundingClientRect(); c.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100) + '%'); }; c.addEventListener('pointermove', mv); c.addEventListener('pointerdown', mv); }
  const n = $('#nome'); if (n) n.oninput = e => { S.nome = e.target.value || 'Viajante'; $('.topo span').textContent = S.nome; };
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-pag],[data-bicho],[data-d]'); if (!t) return;
  if (t.dataset.d) { S.dir = +t.dataset.d; document.querySelectorAll('#rev button').forEach(x => x.classList.toggle('on', x == t)); }
  if (t.dataset.go) S.tela = t.dataset.go; if (t.dataset.pag) S.pag = t.dataset.pag;
  if (t.dataset.bicho) { S.cur = t.dataset.bicho; S.tela = 'carta'; }
  render();
});
render();
window.__S = S; window.__render = render; window.__BICHOS = BICHOS;
