(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const phone = $("#phone"), campo = $("#campo"), rotas = $("#rotas"), wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ECO = '<svg class="eco" viewBox="0 0 32 32" aria-hidden="true"><circle cx="9" cy="16" r="2.7"/><path class="a1" d="M14 11.4a6.4 6.4 0 0 1 0 9.2"/><path class="a2" d="M18.6 8a11.4 11.4 0 0 1 0 16"/><path class="a3" d="M23.2 4.6a16.2 16.2 0 0 1 0 22.8"/></svg>';
  const COR = ["#ffb36b", "#ff5f9e", "#b58cff", "#7fd38a", "#ffd29a", "#6ec6ff"];
  // ---- dados (arte substituta: só a Terra tem arte do time) ----
  const mk = () => ({
    terra:  { nome: "Planeta Terra", x: 50, y: 73, s: 96, img: "assets/planeta-1A.webp", lvl: 0, visit: true, b: 4, bt: 6, r: 3, rt: 5, desc: "Seu primeiro planeta. A nave que você montou decolou daqui." },
    vulc:   { nome: "Vulcânico", x: 76, y: 47, s: 66, c: ["#ffd29a", "#ff6a2c", "#6a1f1f"], crat: 1, lvl: 1, known: 1, b: 0, bt: 5, r: 0, rt: 4, desc: "Chão quente e rachado, cheio de brasas que cantam. Algo pequeno se esconde nas frestas." },
    cristal:{ nome: "Cristal", x: 24, y: 48, s: 62, c: ["#d8f4ff", "#6ec6ff", "#2c4a8a"], lvl: 2, known: 1, b: 0, bt: 6, r: 0, rt: 4, desc: "Um planeta que ressoa. Cada pedra devolve um eco diferente." },
    nevoa:  { nome: "Névoa", x: 62, y: 22, s: 56, c: ["#e6d6ff", "#b58cff", "#40306e"], lvl: 2, known: 0, b: 0, bt: 5, r: 0, rt: 3, desc: "Coberto por uma bruma lilás. Os bichinhos aqui são tímidos." },
    mare:   { nome: "Maré", x: 28, y: 20, s: 54, c: ["#c9f7e8", "#4fb0a0", "#1d4a55"], lvl: 3, known: 0, b: 0, bt: 6, r: 0, rt: 5, desc: "Oceano raso e morno, com ilhotas que se movem." },
    brisa:  { nome: "Região Brisa", x: 84, y: 8, s: 44, c: ["#eee", "#888", "#333"], anel: 1, lvl: 9, bloq: 1, b: 0, bt: 0, r: 0, rt: 0, desc: "Outra região." }
  });
  const PECAS = [
    { id: "antena", nome: "Antena", ic: "📡", own: 1, dica: "Antena: +1 de alcance. Chega a planetas mais distantes." },
    { id: "vela", nome: "Vela solar", ic: "✦", own: 1, dica: "Vela solar: viagens mais rápidas e silenciosas." },
    { id: "lanterna", nome: "Lanterna", ic: "🔦", own: 0, dica: "Lanterna: revela o que são os sinais “?”. Receita: 3 cristais do planeta Cristal." }
  ];
  const CASCOS = ["#e8e4f5", "#ffd29a", "#9fe0b4", "#ffa3c4"], FORMAS = ["gota", "concha", "folha"];
  let P, N, at, busy;
  const reset = () => { P = mk(); N = { cor: CASCOS[0], forma: "gota", pecas: [] }; at = "terra"; busy = false; };
  reset();
  const alcance = () => 1 + (N.pecas.includes("antena") ? 1 : 0);
  const known = (p) => p.known || p.visit || (N.pecas.includes("lanterna") && p.lvl <= 3);
  const estado = (id) => { const p = P[id]; if (p.bloq) return "bloq"; if (p.visit) return "visitado"; if (!known(p)) return "sinal"; return p.lvl <= alcance() ? "alcance" : "longe"; };
  // ---- nave (SVG) ----
  const corpo = { gota: "M20 2C30 12 33 28 30 44H10C7 28 10 12 20 2Z", concha: "M20 4C34 10 36 30 31 44H9C4 30 6 10 20 4Z", folha: "M20 1C33 14 34 32 24 46H16C6 32 7 14 20 1Z" };
  const nave = (n = N) => `<svg class="nv" viewBox="0 0 40 56" style="--casco:${n.cor}"><defs><linearGradient id="gchama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset="1" stop-color="#ff6a2c" stop-opacity="0"/></linearGradient></defs>
    <path class="chama" d="M15 46Q20 62 25 46Z"/>${n.pecas.includes("vela") ? '<path class="peca" d="M10 30L1 46H10ZM30 30L39 46H30Z"/>' : '<path class="casco" d="M10 32L4 46H11ZM30 32L36 46H29Z"/>'}
    <path class="casco" d="${corpo[n.forma]}"/><path class="luz" d="M14 14Q16 8 20 6Q15 10 14 18Z"/><circle class="vidro" cx="20" cy="26" r="5.2"/><circle class="luz" cx="18.3" cy="24.4" r="1.4"/>
    ${n.pecas.includes("antena") ? '<path d="M20 4V-6" stroke="#0004" stroke-width="1.6"/><circle class="peca" cx="20" cy="-7" r="2.6"/>' : ""}${n.pecas.includes("lanterna") ? '<circle class="peca" cx="20" cy="38" r="3"/>' : ""}</svg>`;
  const orbe = (p, s) => p.img ? `<img class="img1a" src="${p.img}" alt="">` : `<div class="bola${p.anel ? " anel" : ""}${p.crat ? " crat" : ""}" style="--c1:${p.c[0]};--c2:${p.c[1]};--c3:${p.c[2]}"></div>`;
  const anel = (p) => { const f = p.bt ? (p.b + p.r) / (p.bt + p.rt) : 0, C = 2 * Math.PI * 46; return `<svg class="prog" viewBox="0 0 100 100"><circle class="f" cx="50" cy="50" r="46"/><circle class="v" cx="50" cy="50" r="46" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - f)}"/></svg>`; };
  // ---- mapa ----
  function toast(t) { const e = $("#toast"); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (e.hidden = true), 2600); }
  const pos = (id) => P[id];
  function desenhaMapa() {
    $$(".pl, .aqui", campo).forEach((e) => e.remove()); rotas.innerHTML = "";
    const o = pos(at), vis = Object.keys(P).filter((i) => P[i].visit).length;
    $("#cont").textContent = `${vis} de ${Object.keys(P).length - 1} planetas descobertos`; $("#alc").textContent = `alcance ${alcance()}`;
    for (const id in P) {
      const p = P[id], st = estado(id), kn = st !== "sinal";
      if (id !== at && (st === "alcance" || st === "visitado")) { const mx = (o.x + p.x) / 2 + (p.y > o.y ? 6 : -6); rotas.insertAdjacentHTML("beforeend", `<path class="${st === "alcance" ? "liga" : ""}" d="M${o.x} ${o.y}Q${mx} ${(o.y + p.y) / 2 - 8} ${p.x} ${p.y}"/>`); }
      const b = document.createElement("button"); b.className = "pl"; b.dataset.st = st; b.dataset.id = id; b.style.cssText = `left:${p.x}%;top:${p.y}%;--s:${p.s}px`;
      const leg = { visitado: id === at ? "você está aqui" : `${p.b}/${p.bt} bichinhos`, alcance: "ao alcance", longe: `precisa alcance ${p.lvl}`, sinal: "sinal de criaturas", bloq: "outra região" }[st];
      b.innerHTML = `<span class="orbe">${orbe(p)}${st === "visitado" ? anel(p) : ""}${st === "sinal" || st === "alcance" ? ECO : ""}</span><b>${kn ? p.nome : "?"}</b><em>${leg}</em>`;
      b.setAttribute("aria-label", `${kn ? p.nome : "planeta desconhecido"}, ${leg}`); b.onclick = () => tocar(id); campo.appendChild(b);
    }
    campo.insertAdjacentHTML("beforeend", `<div class="aqui" style="left:${o.x + o.s / 3.2 * 0.5}%;top:${o.y - 9}%">${nave()}</div>`);
    const alvo = Object.keys(P).find((i) => estado(i) === "alcance"); // dica: o próximo sugerido pulsa; os demais alcançáveis ficam calmos
    $$(".pl[data-st=alcance]", campo).forEach((e) => { if (e.dataset.id !== alvo) e.querySelector(".orbe").style.setProperty("--calmo", 1); });
  }
  function tocar(id) {
    if (busy) return; const st = estado(id), p = P[id];
    if (st === "bloq") return toast("Outra região. Ela abre depois de uma nave de longo alcance.");
    if (st === "sinal") return toast("Sinal fraco. Uma lanterna na nave revela o que é.");
    if (st === "longe") return toast(`Longe demais. Equipe a antena na nave para chegar a ${p.nome}.`);
    folha(id);
  }
  function progresso(p, novo) {
    const sl = (n, t, cls) => Array.from({ length: t }, (_, i) => `<i class="slot ${i < n ? "ok" : ""} ${novo && i === n - 1 ? "nov" : ""}" style="--c:${COR[i % 6]}">${i < n ? "" : "?"}</i>`).join("");
    return `<div class="prg"><div><span>Bichinhos</span><span class="slots">${sl(p.b, p.bt)}</span></div><div><span>Receitas</span><span class="slots rec">${sl(p.r, p.rt)}</span></div></div>`;
  }
  function folha(id) {
    const p = P[id], f = $("#folha"), aqui = id === at, rapido = p.visit;
    f.innerHTML = `<div class="ch-card in"><p class="meta">${rapido ? "Já visitado" : "Ao alcance"} ${ECO.replace('class="eco"', 'class="eco" style="position:static;display:inline;width:16px;vertical-align:-3px"')}</p><h2>${p.nome}</h2><p>${p.desc}</p>${rapido ? progresso(p) : "<p>Ainda ninguém pisou aqui. Os bichinhos só aparecem quando você chega.</p>"}<div class="acoes"><button class="btn" data-x>Fechar</button><button class="btn pri" data-v>${aqui ? "Pousar" : rapido ? "Voltar para lá" : "Viajar"}</button></div></div>`;
    f.hidden = false; f.onclick = (e) => { if (e.target === f || e.target.dataset.x !== undefined) f.hidden = true; };
    $("[data-v]", f).onclick = () => { f.hidden = true; aqui ? chegada(id, true) : viajar(id); };
  }
  // ---- cenas ----
  const cena = (n) => { phone.dataset.scene = n; $$(".cena").forEach((c) => (c.hidden = !c.classList.contains("c-" + n))); };
  async function viajar(id) {
    busy = true; const p = P[id], ida = !p.visit, dur = reduce ? 300 : ida ? 3600 : 1700; let veloc = 1;
    $("#v-orig").innerHTML = `<div style="width:${P[at].s * 2.2}px">${orbe(P[at])}</div>`; $("#v-dest").innerHTML = `<div style="width:${p.s * 2.6}px">${orbe(p)}</div>`;
    $("#v-nave").innerHTML = nave(); $("#v-txt").textContent = ida ? `Rumo a ${known(p) ? p.nome : "um sinal"}…` : `De volta a ${p.nome}`;
    cena("viagem");
    const a1 = $("#v-orig").animate([{ transform: "translateY(0) scale(1)" }, { transform: "translateY(380px) scale(.5)" }], { duration: dur, easing: "ease-in", fill: "forwards" });
    const a2 = $("#v-dest").animate([{ transform: "translateY(0) scale(.15)", opacity: .3 }, { transform: "translateY(310px) scale(1)", opacity: 1 }], { duration: dur, easing: "ease-in-out", fill: "forwards" });
    const bar = $("#v-prog").animate([{ width: "0%" }, { width: "100%" }], { duration: dur, fill: "forwards" });
    const rapida = () => [a1, a2, bar].forEach((a) => (a.playbackRate = 3.5)); phone.onclick = () => phone.dataset.scene === "viagem" && rapida();
    await Promise.all([a1.finished, a2.finished]); phone.onclick = null; at = id; busy = false; chegada(id, false);
  }
  async function chegada(id, pouso) {
    busy = true; const p = P[id], primeira = !p.visit; p.visit = true; at = id;
    cena("chegada"); const pl = $("#ch-planeta"), nv = $("#ch-nave"), c = $("#ch-card");
    pl.className = "ch-planeta"; nv.className = "ch-nave"; c.className = "ch-card"; pl.innerHTML = orbe(p); nv.innerHTML = nave(); c.innerHTML = "";
    void pl.offsetWidth; pl.classList.add("in"); await wait(reduce ? 0 : 700); nv.classList.add("in"); await wait(reduce ? 0 : 1500);
    const cartao = (novo) => `<p class="meta">${primeira && !pouso ? "Primeira visita · Região Aurora" : `De volta · ${p.b}/${p.bt} bichinhos`}</p><h2>${p.nome}</h2>
      <p>${primeira && !pouso ? "Você chegou. Fique quieto e ouça: " + (p.b === 0 ? "um eco vem de algum lugar da superfície." : "") : "Tudo como você deixou. Os bichinhos lembram de você."}</p>${progresso(p, novo)}
      <div class="acoes"><button class="btn" data-m>Mapa</button><button class="btn pri" data-p>${primeira && !pouso ? "Pousar" : "Visitar (+1)"}</button></div>`;
    c.innerHTML = cartao(); c.classList.add("in"); busy = false;
    const liga = () => { $("[data-m]", c).onclick = () => { cena("mapa"); desenhaMapa(); }; $("[data-p]", c).onclick = () => {
      if (p.bt) { if (p.b < p.bt && (p.b <= p.r || !p.rt || p.r >= p.rt)) { p.b++; toast(`+1 bichinho em ${p.nome}`); } else if (p.r < p.rt) { p.r++; toast("+1 receita aprendida"); } else toast("Planeta completo!"); }
      c.innerHTML = cartao(true).replace("Primeira visita · Região Aurora", `De volta · ${p.b}/${p.bt} bichinhos`).replace("Pousar", "Visitar (+1)"); liga(); }; };
    liga();
  }
  function hangar() {
    cena("nave"); const n = { ...N, pecas: [...N.pecas] }; const draw = () => {
      $("#nave-grande").innerHTML = nave(n);
      $("#o-cor").innerHTML = CASCOS.map((c) => `<button class="op ${n.cor === c ? "on" : ""}" data-cor="${c}" aria-label="cor"><i class="sw" style="--sw:${c}"></i></button>`).join("");
      $("#o-forma").innerHTML = FORMAS.map((f) => `<button class="op ${n.forma === f ? "on" : ""}" data-forma="${f}" aria-label="${f}">${nave({ cor: n.cor, forma: f, pecas: [] }).replace('class="nv"', 'class="nv" style="--casco:' + n.cor + '"')}</button>`).join("");
      $("#o-peca").innerHTML = PECAS.map((x) => `<button class="op ${n.pecas.includes(x.id) ? "on" : ""} ${x.own ? "" : "trava"}" data-peca="${x.id}" aria-label="${x.nome}"><span class="pc">${x.ic}</span></button>`).join("");
    };
    draw(); $("#peca-dica").textContent = "Toque numa peça para ver o que ela faz.";
    const box = $(".c-nave"); box.onclick = (e) => { const b = e.target.closest(".op"); if (!b) return;
      if (b.dataset.cor) n.cor = b.dataset.cor; if (b.dataset.forma) n.forma = b.dataset.forma;
      if (b.dataset.peca) { const x = PECAS.find((q) => q.id === b.dataset.peca); $("#peca-dica").textContent = x.dica; if (x.own) n.pecas = n.pecas.includes(x.id) ? n.pecas.filter((q) => q !== x.id) : [...n.pecas, x.id]; }
      draw(); };
    $("#nave-ok").onclick = () => { N = n; cena("mapa"); desenhaMapa(); };
  }
  $("#abrir-nave").onclick = hangar;
  // ---- demo ----
  $$(".demo button").forEach((b) => (b.onclick = async () => { const g = b.dataset.go; $("#folha").hidden = true; busy = false;
    if (g === "reset") { reset(); cena("mapa"); return desenhaMapa(); }
    if (g === "mapa") { cena("mapa"); return desenhaMapa(); }
    if (g === "nave") return hangar();
    if (g === "ida") { reset(); return viajar("vulc"); }
    if (g === "chegada") { reset(); at = "terra"; return chegada("vulc", false); }
    if (g === "volta") { reset(); P.vulc.visit = true; P.vulc.b = 2; at = "vulc"; return viajar("terra"); } }));
  $("#v-pular")?.remove(); cena("mapa"); desenhaMapa();
  window.__mapa = { get P() { return P; }, get N() { return N; }, estado, alcance, get at() { return at; } };
})();
