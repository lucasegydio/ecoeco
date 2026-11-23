(() => {
const M = window.MOV, $ = (s, r = document) => r.querySelector(s);
const mq = matchMedia("(prefers-reduced-motion: reduce)");
let RM = mq.matches; const rmBox = $("#rm"); rmBox.checked = RM; rmBox.onchange = () => { RM = rmBox.checked; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HOJE = { ...Liquid.HOJE, stagger: 1.45 }, PROP = { ...Liquid.PROP };
// mola (mesma integração do liquid.js); fixed ignora o modo reduzido
class Sp { constructor(p, k, c, fixed) { Object.assign(this, { p, v: 0, t: p, k, c, fixed }); }
  step(dt) { const k = RM && !this.fixed ? M.reduzido.k : this.k, c = RM && !this.fixed ? M.reduzido.c : this.c, n = Math.ceil(dt / .008), h = dt / n;
    for (let i = 0; i < n; i++) { this.v += (-k * (this.p - this.t) - c * this.v) * h; this.p += this.v * h; } return this.p; } }
const tick = []; let last = performance.now();
(function loop(now) { const dt = Math.min(.034, (now - last) / 1000) || .016; last = now;
  for (const t of tick) if (t.s.vis) t.f(dt, now / 1000); requestAnimationFrame(loop); })(last);
const mk = (cls, par, css) => { const e = document.createElement("div"); e.className = cls; if (css) e.style.cssText = css; par.append(e); return e; };
const seq = (stage, fn) => { const run = () => { const id = stage._g = (stage._g || 0) + 1;
  const w = (ms) => new Promise((ok, no) => setTimeout(() => stage._g === id ? ok() : no(), ms));
  (async () => { try { for (;;) await fn(w); } catch (e) { if (e) console.error(e); } })(); };
  stage.onclick = (e) => { if (e.target.closest("button,input")) return; run(); }; run(); };
const on = (stage, f) => tick.push({ s: stage, f });
const spr = (id, i = 0) => M.movs.find((m) => m.id === id).springs[i];

// ---- anel (Liquid real) ----
function ring(stage, o = {}) {
  const sc = mk("", stage, "position:absolute;inset:0"), n = 5, els = [];
  const L = Liquid.create({ stage, scene: sc, center: () => ({ x: sc.clientWidth / 2, y: sc.clientHeight / 2 }), tune: { ...PROP }, reduced: () => RM });
  const items = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2, el = mk("it", sc); el.innerHTML = `<button aria-label="Ação ${i + 1}"></button>`; els.push(el);
    return { el, id: "b" + i, bx: Math.cos(a) * 15, by: Math.sin(a) * 15 * .9, delay: i * 55 }; });
  L.setItems(items); stage.vis = true; stage._L = L; stage._cmp = "proposto";
  if (!o.noToggle) { const b = document.createElement("button"); b.className = "bt"; b.textContent = "proposto"; b.setAttribute("aria-pressed", "true");
    b.onclick = () => { const p = b.textContent === "hoje"; b.textContent = p ? "proposto" : "hoje"; b.setAttribute("aria-pressed", p); L.tune(p ? PROP : HOJE); };
    stage.parentNode.insertBefore(b, stage.nextSibling); }
  return L;
}
const D = {
 "anel-abrir": (s) => { const L = ring(s); seq(s, async (w) => { L.open(); await w(2600); L.close(); await w(1500); }); },
 "anel-fechar": (s) => { const L = ring(s); L.open(); seq(s, async (w) => { await w(1200); L.close(); await w(1400); L.open(); await w(600); }); },
 "ima": (s) => { const L = ring(s); L.open(); let manual = 0; s.addEventListener("pointermove", (e) => { if (e.isTrusted) manual = performance.now(); });
   let t = 0; setInterval(() => { if (performance.now() - manual < 3000 || RM) return; t += .016; const r = s.getBoundingClientRect(), a = t * 1.1;
     s.dispatchEvent(new PointerEvent("pointermove", { clientX: r.left + r.width / 2 + Math.cos(a) * r.width * .3, clientY: r.top + r.height / 2 + Math.sin(a * 1.3) * r.height * .3 })); }, 16);
   mk("tag", s).textContent = "passe o dedo: a bolha inclina, estica e o ponto atrasa"; },
 "aceitar": (s) => { const L = ring(s); seq(s, async (w) => { L.open(); await w(1700); L.accept("b2"); await w(2000); }); },
 "bolha-hover": (s) => { const A = [["hoje", 1.17, .9, 260, 16, "28%"], ["proposto", 1.12, .92, 180, 22, "72%"]].map(([n, h, p, k, c, x]) => {
     const e = mk("sw bub", s, `left:${x};top:44%;width:56px;height:56px;margin:-28px`); mk("tag", s, `left:${x};top:auto;bottom:8px;transform:translateX(-50%)`).textContent = n;
     const q = new Sp(1, k, c), qp = new Sp(1, 300, 28); on(s, (dt) => { q.step(dt); qp.step(dt); e.style.transform = `scale(${q.p})`; }); return { q, h, p, k, c }; });
   seq(s, async (w) => { const set = (f) => A.forEach((a) => { a.q.t = f(a); }); set((a) => a.h); await w(900); A.forEach((a) => { a.q.k = 300; a.q.c = 28; }); set((a) => a.p); await w(350);
     A.forEach((a) => { a.q.k = a.k; a.q.c = a.c; }); set((a) => a.h); await w(700); set(() => 1); await w(900); }); },
 "coletar": (s) => { const W = () => s.clientWidth, H = 190, o = { x: 44, y: H - 44 }, e = mk("sw bub", s, "width:26px;height:26px;margin:-13px");
   const chip = mk("chip", s, "right:12px;top:12px"), q = { x: new Sp(o.x, 70, 15), y: new Sp(o.y, 70, 15) }, cs = new Sp(1, 260, 18), vs = new Sp(1, 160, 20); let n = 0, fly = 0, done = 0, p0 = 1;
   chip.textContent = "◐ 0"; mk("tag", s).textContent = "item → inventário";
   on(s, (dt) => { const tx = W() - 52, ty = 26; if (fly) { q.x.t = tx; q.y.t = ty; } q.x.step(dt); q.y.step(dt); cs.step(dt); vs.step(dt);
     const d0 = Math.hypot(tx - o.x, ty - o.y), d = Math.hypot(tx - q.x.p, ty - q.y.p), pr = clamp(1 - d / d0, 0, 1), arc = RM ? 0 : Math.sin(pr * Math.PI) * 36;
     const nx = -(ty - o.y) / d0, ny = (tx - o.x) / d0, sp = Math.hypot(q.x.v, q.y.v), st = RM ? 0 : clamp(sp / 900, 0, .12), a = Math.atan2(q.y.v, q.x.v) * 57.3;
     e.style.transform = `translate(${q.x.p + nx * arc - 0}px,${q.y.p + ny * arc}px) rotate(${a}deg) scale(${(1 + st) * Math.max(0, vs.p)},${(1 - st * .6) * Math.max(0, vs.p)})`; e.style.left = e.style.top = 0;
     if (fly && d < 10 && !done) { done = 1; fly = 0; vs.t = .45; cs.p = 1.0; cs.t = 1.18; chip.textContent = "◐ " + (++n); setTimeout(() => cs.t = 1, 140); }
     chip.style.transform = `scale(${cs.p})`; });
   seq(s, async (w) => { q.x.p = o.x; q.y.p = o.y; q.x.v = q.y.v = 0; q.x.t = o.x; q.y.t = o.y; vs.p = 1; vs.t = 1; done = 0; await w(700); fly = 1; await w(2000); }); },
 "menu": (s) => { const sh = mk("sw", s, "left:50%;bottom:0;width:230px;height:150px;margin-left:-115px;border-radius:22px 22px 0 0;background:#2d2342;border:1px solid #ffffff22;justify-content:stretch;align-content:start"),
     tabs = mk("", sh, "display:flex;gap:6px;padding:12px 12px 0;position:relative"), ind = mk("", sh, "position:absolute;left:0;top:34px;height:3px;width:54px;border-radius:3px;background:var(--am)"),
     body = mk("", sh, "padding:16px 14px;font-size:.8rem;color:#e8dff3;transition:opacity 180ms,transform 180ms");
   ["Mundo", "Bichos", "Ajustes"].forEach((t) => { const b = mk("", tabs, "width:62px;text-align:center;font-size:.78rem"); b.textContent = t; });
   const y = new Sp(160, 120, 22), x = new Sp(12, 200, 24), txt = ["Planeta Terra · 3 bichinhos", "Fotos e coleção", "Pistas · Calma"]; body.textContent = txt[0];
   on(s, (dt) => { y.step(dt); x.step(dt); sh.style.transform = `translateY(${y.p}px)`; ind.style.transform = `translateX(${x.p + 4}px)`; });
   const tab = async (i, w) => { x.t = 12 + i * 68; body.style.opacity = 0; body.style.transform = "translateY(10px)"; await w(RM ? 120 : 180); body.textContent = txt[i]; body.style.opacity = 1; body.style.transform = "none"; };
   seq(s, async (w) => { y.t = 160; x.t = 12; body.textContent = txt[0]; await w(500); y.t = 0; await w(1200); await tab(1, w); await w(900); await tab(2, w); await w(900); y.t = 160; await w(1200); }); },
 "bestiario": (s) => { const g = mk("", s, "position:absolute;inset:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px"), cells = []; 
   for (let i = 0; i < 6; i++) cells.push(mk("", g, "border-radius:12px;background:#ffffff14;border:1px solid #ffffff1c"));
   const card = mk("", s, "position:absolute;border-radius:16px;background:linear-gradient(145deg,#ffb36b,#b58cff);opacity:0;display:grid;place-items:center;font-size:.8rem;color:#2a1a10"), fl = mk("fl", s),
     pol = mk("", s, "position:absolute;left:50%;top:50%;width:70px;height:80px;margin:-40px -35px;background:#fff;border-radius:4px;box-shadow:0 8px 20px #0008;opacity:0;padding:6px"); mk("", pol, "height:54px;background:linear-gradient(145deg,#ffb36b,#ff5f9e)");
   const r = ["l", "t", "w", "h"].map((_, i) => new Sp(0, 130, 23)), py = new Sp(-50, 90, 12), pr = new Sp(8, 90, 12);
   const rectOf = (el) => { const a = el.getBoundingClientRect(), b = s.getBoundingClientRect(); return [a.left - b.left, a.top - b.top, a.width, a.height]; };
   on(s, (dt) => { r.forEach((q) => q.step(dt)); py.step(dt); pr.step(dt); card.style.cssText += `;left:${r[0].p}px;top:${r[1].p}px;width:${r[2].p}px;height:${r[3].p}px`; pol.style.transform = `translateY(${py.p}px) rotate(${pr.p}deg)`; });
   const go = (a) => a.forEach((v, i) => r[i].t = v), set = (a) => a.forEach((v, i) => { r[i].p = v; r[i].t = v; r[i].v = 0; });
   seq(s, async (w) => { const c = rectOf(cells[1]), full = [8, 8, s.clientWidth - 16, 174]; set(c); card.style.opacity = 1; card.textContent = ""; pol.style.opacity = 0; py.p = -50; py.t = -50; pr.p = 8; pr.t = 8; await w(700);
     go(full); await w(900); card.textContent = "Lagarto"; fl.style.transition = "none"; fl.style.opacity = 1; await w(RM ? 120 : 90); fl.style.transition = "opacity 280ms"; fl.style.opacity = 0;
     pol.style.opacity = 1; py.t = 0; pr.t = -2; await w(1500); pol.style.opacity = 0; go(c); await w(1000); card.style.opacity = 0; await w(500); }); },
 "eco": (s, m, card) => { const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "-40 -40 80 80"); svg.style.cssText = "position:absolute;left:50%;top:50%;width:110px;margin:-55px";
   svg.innerHTML = `<circle r="5" fill="#ffb36b"/>` + [14, 22, 30].map((r) => `<path d="M${-r * .7} ${-r * .7}A${r} ${r} 0 0 1 ${r * .7} ${-r * .7}" fill="none" stroke="#ffb36b" stroke-width="3.5" stroke-linecap="round"/>`).join(""); s.append(svg);
   const arcs = svg.querySelectorAll("path"), dot = svg.querySelector("circle"), tag = mk("tag", s), sl = document.createElement("input"); sl.type = "range"; sl.min = 0; sl.max = 100; sl.value = 100; sl.style.width = "100%"; s.after(sl);
   let man = 0, ph = 0, d = 1; sl.oninput = () => { man = performance.now(); d = sl.value / 100; };
   on(s, (dt, t) => { if (performance.now() - man > 5000) { d = .5 + .5 * Math.cos(t * .5); sl.value = d * 100; } const per = M.movs.find((x) => x.id === "eco"), P = per.periodo_perto_ms + (per.periodo_longe_ms - per.periodo_perto_ms) * d;
     ph = (ph + dt * 1000 / P) % 1; const tc = ph * P, amp = RM ? 0 : per.treme_max_px * (1 - d);
     arcs.forEach((a, i) => { const x = tc - i * per.arcos_ms, o = RM ? .5 + .5 * Math.sin(t * 5.2) : x < 0 ? .12 : x < 80 ? .12 + .88 * x / 80 : .12 + .88 * Math.exp(-(x - 80) / 130); a.setAttribute("opacity", o.toFixed(2)); });
     svg.style.transform = `translate(${Math.sin(t * 61) * amp}px,${Math.cos(t * 53) * amp}px)`; tag.textContent = `distância ${Math.round(d * 100)}% · pulso ${Math.round(RM ? 1200 : P)} ms`; }); },
 "camera": (s) => { const W = () => s.clientWidth, pl = mk("sw", s, "left:50%;top:50%;width:130px;height:130px;margin:-65px;background:radial-gradient(circle at 35% 30%,#8fe0b0,#3f8f78 55%,#23405a)"),
     det = mk("", pl, "position:absolute;left:62%;top:22%;width:20px;height:20px;border-radius:40%;background:#ffb36b;opacity:0;box-shadow:0 0 12px #ffb36b"), z = new Sp(1, 50, 14.1);
   const stars = mk("", s, "position:absolute;inset:0;background:radial-gradient(#fff6 1px,transparent 1.5px) 0 0/34px 34px;opacity:.35");
   on(s, (dt) => { z.step(dt); pl.style.transformOrigin = "75% 32%"; pl.style.transform = `scale(${z.p}) translate(${-(z.p - 1) * 8}px,${(z.p - 1) * 14}px)`; det.style.opacity = RM ? (z.t > 1 ? 1 : 0) : clamp((z.p - 1.5) / .8, 0, 1); stars.style.transform = `scale(${1 + (z.p - 1) * .15})`; });
   seq(s, async (w) => { z.t = 1; await w(1200); z.t = 2.4; await w(2600); z.t = 1; await w(2000); }); mk("tag", s).textContent = "zoom planetário ↔ local"; },
 "evolucao": (s) => { const b = mk("sw", s, "left:50%;top:50%;width:62px;height:62px;margin:-31px;background:linear-gradient(145deg,#a8f0c0,#4fb08f);border-radius:48% 52% 50% 50%/52% 46% 54% 48%"), fl = mk("fl", s), sc = new Sp(1, 80, 14); let g = 0, sh = 0, t0 = 0;
   on(s, (dt, t) => { sc.step(dt); g *= Math.exp(-dt / .4); const x = sh && !RM ? Math.sin(t * 62) * 2.2 : 0; b.style.transform = `translateX(${x}px) scale(${sc.p})`; b.style.boxShadow = `0 0 ${10 + g * 50}px ${g * 14}px rgba(255,179,107,${g * .6})`; });
   seq(s, async (w) => { b.style.background = "linear-gradient(145deg,#a8f0c0,#4fb08f)"; b.style.width = b.style.height = "62px"; b.style.margin = "-31px"; sc.k = 80; sc.c = 14; sc.t = 1; await w(900);
     sc.t = .9; sh = 1; await w(500); sh = 0; fl.style.transition = "none"; fl.style.opacity = 1; g = 1; b.style.background = "linear-gradient(145deg,#ffd9b0,#ff5f9e)"; b.style.width = b.style.height = "78px"; b.style.margin = "-39px"; await w(RM ? 120 : 160);
     fl.style.transition = "opacity 300ms"; fl.style.opacity = 0; sc.k = 120; sc.c = 10; sc.t = 1.25; await w(280); sc.k = 140; sc.c = 20; sc.t = 1; await w(2200); }); },
 "decolagem": (s) => { const H = 190, pl = mk("sw", s, "left:50%;bottom:-150px;width:320px;height:320px;margin-left:-160px;background:radial-gradient(circle at 40% 25%,#8fe0b0,#3f8f78 55%,#23405a)"),
     b = mk("sw", s, "left:50%;top:50%;width:40px;height:44px;margin:-22px -20px;background:linear-gradient(145deg,#ffd9b0,#ff5f9e);border-radius:48% 52% 50% 50%/52% 46% 54% 48%"), sq = new Sp(1, 160, 20), m = M.movs.find((x) => x.id === "decolagem"); let tl = -1;
   on(s, (dt) => { sq.step(dt); let y = 0, st = 0; if (tl >= 0) { tl += dt; if (RM) y = -Math.min(1, tl / .3) * H; else { y = -.5 * m.aceleracao * tl * tl * H; st = clamp(m.aceleracao * tl * H / 330, 0, m.estica_max); } }
     b.style.opacity = RM && tl > .3 ? 0 : 1; b.style.transform = `translateY(${-40 + y}px) scale(${(1 - st * .6) * (2 - sq.p > 1 ? 1 : 1)},${sq.p * (1 + st)})`;
     pl.style.transform = `translateY(${tl >= 0 && !RM ? Math.min(60, -y * .12) : 0}px)`; });
   seq(s, async (w) => { tl = -1; sq.t = 1; await w(1000); sq.t = .88; await w(RM ? 50 : 280); sq.t = 1; tl = 0; await w(2200); tl = -1; await w(400); }); },
 "reduzido": (s) => { [["normal", 120, 22, "28%"], ["reduzido", 900, 60, "72%"]].forEach(([n, k, c, x]) => { const e = mk("sw bub", s, `left:${x};top:44%;width:56px;height:56px;margin:-28px`), q = new Sp(1, k, c, true);
     mk("tag", s, `left:${x};top:auto;bottom:8px;transform:translateX(-50%)`).textContent = n; (s._q = s._q || []).push(q); on(s, (dt) => { q.step(dt); e.style.transform = `scale(${q.p})`; }); });
   seq(s, async (w) => { s._q.forEach((q) => q.t = 1.5); await w(1300); s._q.forEach((q) => q.t = .8); await w(1000); s._q.forEach((q) => q.t = 1); await w(900); }); }
};

// ---- curva da mola, valores, cartões ----
function curve(cv, sps) { const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = 56; cv.width = w * dpr; cv.height = h * dpr; const g = cv.getContext("2d"); g.scale(dpr, dpr);
  g.strokeStyle = "#ffffff30"; g.setLineDash([3, 3]); const yy = (v) => h - 8 - v * (h - 18) / 1.4; g.beginPath(); g.moveTo(0, yy(1)); g.lineTo(w, yy(1)); g.stroke(); g.setLineDash([]);
  sps.forEach((s, j) => { g.strokeStyle = ["#ffb36b", "#ff5f9e", "#b58cff"][j % 3]; g.lineWidth = 2; g.beginPath(); let x = 0, v = 0; for (let i = 0; i <= 1000; i++) { v += (-s.k * (x - 1) - s.c * v) * .001; x += v * .001; const px = i / 1000 * w; i ? g.lineTo(px, yy(x)) : g.moveTo(px, yy(x)); } g.stroke(); });
  g.fillStyle = "#a99fba"; g.font = "10px sans-serif"; g.fillText("0", 2, h - 1); g.fillText("1 s", w - 20, h - 1); }
const ex = (m) => ["stagger_ms", "fade_ms", "flash_ms", "estica_max", "ima_cqi", "alcance_cqi", "inercia", "atraso_gota_ms", "arco_px", "desloca_px", "periodo_longe_ms", "periodo_perto_ms", "treme_max_px", "arcos_ms", "brilho_ms", "aceleracao", "dur_ms", "giro_graus"].filter((k) => k in m).map((k) => `${k} ${m[k]}`).join(" · ");
const box = $("#cards");
M.movs.forEach((m) => { const c = document.createElement("article"); c.className = "card"; c.id = m.id; const sp = m.springs.filter((x) => x.k > 0);
  c.innerHTML = `<h2>${m.nome}</h2><div class="stage"></div>` + (sp.length ? `<canvas></canvas><table class="vals"><tr><th>mola</th><th>k</th><th>c</th><th>ζ</th><th>quica</th><th>assenta</th></tr>${sp.map((x, i) => `<tr><td>${x.n}</td><td>${x.k}</td><td>${x.c}</td><td>${x.zeta}</td><td>${x.ricochete_pct}%</td><td>${x.assenta_ms} ms</td></tr>`).join("")}</table>` : "") +
    `<div class="cmp">${ex(m)}</div><ul>${m.coreo.map((l) => `<li>${l}</li>`).join("")}</ul><div class="cmp"><b>Hoje:</b> ${m.hoje}<br><i>Corrige:</i> ${m.corrige}<br><b>Reduzido:</b> ${m.red}</div>`;
  box.append(c); const st = c.querySelector(".stage"); st.vis = false; new IntersectionObserver(([e]) => { st.vis = e.isIntersecting; }).observe(st);
  if (D[m.id]) D[m.id](st, m, c); if (sp.length) curve(c.querySelector("canvas"), sp); });
$("#corrigeLista").innerHTML = [
 ["liquid.js", "Abrir quica ~8% (k190 c17, ζ0,62). Proposto k110 c17 (ζ0,81). Fechar ganha mola própria crítica k170 c26 (hoje reusa a de abrir)."],
 ["liquid.js", "Esticar máx. 22% → 12%; hover 1,17 → 1,12; toque 0,9 → 0,92; escolhida k150 c16; absorvidas k140 c24 críticas; cascata 80 → 55 ms."],
 ["liquid.js", "Movimento reduzido já baixava k/c, mas ainda esticava, flutuava e puxava ao dedo. Agora zera os três. Arquivo novo deste cartão: <code>22-movimento/site/liquid.js</code> aceita <code>tune</code> e <code>reduced</code>; <code>Liquid.HOJE</code> = antes, <code>Liquid.PROP</code> = depois. Para integrar: copiar por cima de <code>prototipo/site/liquid.js</code> e passar <code>tune: Liquid.PROP</code>."],
 ["entrada.js:20", "Viagem de câmera com duração CSS fixa (2,4 s / 0,9 s). Trocar por mola crítica k50 c14,1 (interrompível, sem salto); reduzido = fade 200 ms."],
 ["jogo.js / coleta", "Item coletado não voa ao inventário. Implementar voo (k70 c15, arco 36 px, estica 12%) e pulso 1,18 no chip."],
 ["style.css .ripple", "Eco por keyframes de 0,64 s. Passar a período contínuo pela distância (1800 → 520 ms) e tremor até 2,2 px; reduzido = só opacidade."],
 ["menu / bestiário", "Folha, aba e ficha por mola (hoje transições CSS ease); foto com queda e flash de 90 ms."]
].map(([f, t]) => `<div class="fix"><b>${f}</b> · ${t}</div>`).join("");
$("#tb").innerHTML = "<tr><th>movimento</th><th>mola</th><th>k</th><th>c</th><th>ζ</th><th>quica</th><th>assenta</th><th>extras</th></tr>" + M.movs.map((m) => { const sp = m.springs.filter((x) => x.k > 0);
  return (sp.length ? sp : [{ n: "—", k: "", c: "", zeta: "", ricochete_pct: "", assenta_ms: "" }]).map((x, i) => `<tr><td>${i ? "" : m.id}</td><td>${x.n}</td><td>${x.k}</td><td>${x.c}</td><td>${x.zeta}</td><td>${x.ricochete_pct === "" ? "" : x.ricochete_pct + "%"}</td><td>${x.assenta_ms === "" ? "" : x.assenta_ms + " ms"}</td><td>${i ? "" : ex(m)}</td></tr>`).join(""); }).join("");
})();
