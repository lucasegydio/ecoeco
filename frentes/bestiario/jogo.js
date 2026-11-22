// Rodadas 08–09 · o jogo no celular.
// Como o jogo funciona: não há personagem. O jogador olha um planeta 3D, ARRASTA para girar e usa a
// PINÇA para aproximar. Tocar no bichinho abre o anel sobre ele; afastar até a escala planetária abre
// o menu do planeta. Rodada 09: o arco inteiro do primeiro planeta (briefing 0:00–15:00), com a cena de
// EVOLUÇÃO (a flor vira copa) e a de DECOLAGEM (a câmera se afasta e revela a primeira região do mapa).
(() => {
  const root = document.querySelector("#jogo");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const stage = $(".game-stage"), game = $(".game"), canvas = $(".globe");
  const ctx = canvas.getContext("2d");
  const off = document.createElement("canvas"), octx = off.getContext("2d");
  const objsLayer = $(".objs"), ringLayer = $(".ring-layer"), menuLayer = $(".menu-layer");
  const ecoEdge = $(".eco-edge"), ecoTag = $(".eco-float"), hintEl = $(".hud-hint"), invEl = $(".hud-inv");
  const sheet = $(".game-sheet"), prog = $(".mini-prog"), zoomInput = $("#jogo-zoom"), levelChip = $("#jogo-level");
  const cine = $(".cine"), cineCard = $(".cine-card"), mapa = $(".mapa");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const ICONS = window.ECO_ICONS;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rad = (d) => d * Math.PI / 180;
  const vec = (lat, lon) => [Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat)), Math.cos(rad(lat)) * Math.cos(rad(lon))];
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce.matches ? Math.min(ms, 60) : ms));

  let W = game.clientWidth, H = game.clientHeight, dpr = 1;
  const resize = () => {
    W = game.clientWidth; H = game.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw) canvas.width = cw;
    if (canvas.height !== ch) canvas.height = ch;
  };
  new ResizeObserver(resize).observe(game);
  resize();

  // ---------- câmera orbital ----------
  let lift = 0;     // o planeta sobe quando a folha do menu abre
  let locked = false;   // cenas: sem gestos
  const cam = { yaw: rad(-30), pitch: rad(8), vy: 0, vp: 0, z: .5, zt: .5, goto: null };
  function rotation() {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    return (p) => {
      const x = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
      return [x, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
    };
  }
  const viewAt = (z, l = 0) => {
    const R = W * .34 * Math.pow(7.4, z), k = smooth(0, 1, z);
    return { R, cx: W / 2, cy: H * .46 * (1 - k) + (H * .37 + R) * k - l };
  };
  const view = () => viewAt(cam.z, lift);
  const project = (q, v) => [v.cx + q[0] * v.R, v.cy - q[1] * v.R];
  function focus(o, z = .82, yFrac = .6) {
    const zt = Math.max(cam.zt, z), v = viewAt(zt);
    const qy = clamp((v.cy - H * yFrac) / v.R, -1, 1);
    cam.goto = { yaw: -rad(o.lon), pitch: rad(o.lat) - Math.asin(qy), z: zt };
  }

  // ---------- mundo ----------
  const A = (n) => `assets/${n}.webp`;
  const OBJ = [
    { id: "pet", img: A("brotinho-frente"), lat: 14, lon: 150, size: 21, tap: true, label: "Brotinho", anchor: -94 },
    { id: "cinza", img: A("bichinho-cinza"), lat: -16, lon: -72, size: 19, tap: true, label: "Bichinho-cinza", anchor: -96 },
    { id: "tree", img: A("arvore"), lat: 19, lon: 142, size: 26, tap: true, label: "Árvore com gota" },
    { id: "nucleo", lat: 19, lon: 142, size: 5, label: "Núcleo de propulsão", anchor: -620, hidden: false, kind: "orb" },
    { id: "flower", img: A("flor-creme"), lat: 10, lon: 157, size: 9, label: "Flor" },
    { id: "fruit", lat: 10.5, lon: 157.5, size: 6, tap: true, hidden: true, label: "Fruto maduro", anchor: -50, kind: "fruit" },
    { id: "rock", img: A("rocha-ocre"), lat: 3, lon: 131, size: 14, label: "Rocha macia" },
    { id: "stones", lat: 0, lon: 134, size: 9, tap: true, hidden: true, label: "Pedras soltas", anchor: -60, kind: "stones" },
    { id: "fonte", lat: 1, lon: 162, size: 9, label: "Fonte", anchor: -55, kind: "fonte" },
    { id: "canteiro", lat: 5, lon: 147, size: 15, label: "Canteiro", anchor: -50, kind: "canteiro" },
    { id: "fruit2", lat: 5.6, lon: 147.4, size: 6, tap: true, hidden: true, label: "Colheita irrigada", anchor: -120, kind: "fruit" },
    { id: "nave", lat: 25, lon: 158, size: 13, tap: true, hidden: true, label: "Nave", anchor: -100, kind: "nave" },
    { id: "pilar", img: A("pilar-musgo"), lat: 28, lon: 168, size: 11 },
    { id: "t2", img: A("arvore"), lat: 38, lon: 110, size: 20 }, { id: "t3", img: A("arvore"), lat: -12, lon: 60, size: 24 },
    { id: "t4", img: A("arvore"), lat: 40, lon: -20, size: 22 }, { id: "t5", img: A("arvore"), lat: -30, lon: 175, size: 20 },
    { id: "t6", img: A("arvore"), lat: 8, lon: -95, size: 22 }, { id: "f2", img: A("flor-creme"), lat: -5, lon: 20, size: 7 },
    { id: "f3", img: A("flor-creme"), lat: 30, lon: 60, size: 7 }, { id: "f4", img: A("flor-creme"), lat: 18, lon: -50, size: 7 },
    { id: "p2", img: A("pilar-musgo"), lat: -20, lon: -30, size: 12 }, { id: "r2", img: A("rocha-ocre"), lat: 45, lon: 170, size: 12 },
    { id: "r3", img: A("rocha-ocre"), lat: -40, lon: 90, size: 14 }
  ];
  const byId = {};
  for (const o of OBJ) {
    o.p = vec(o.lat, o.lon);
    const el = document.createElement(o.tap ? "button" : "i");
    el.className = "gobj gobj-" + o.id.replace(/\d+$/, "") + (o.kind ? " k-" + o.kind : "");
    el.dataset.id = o.id;
    if (o.tap) { el.type = "button"; el.setAttribute("aria-label", o.label); } else el.setAttribute("aria-hidden", "true");
    if (o.img) el.innerHTML = `<img src="${o.img}" alt="" draggable="false">`;
    if (o.id === "pet") el.innerHTML += `<img class="canopy" src="${A("arvore")}" alt="" draggable="false"><i class="tear"></i><i class="tear"></i>`;
    if (o.kind === "canteiro") el.innerHTML = '<i class="soil"></i><i class="sprout"></i><i class="bloom"></i>';
    if (o.kind === "fonte") el.innerHTML = '<i class="pool"></i>';
    if (o.kind === "stones") el.innerHTML = "<i></i><i></i><i></i>";
    if (o.kind === "nave") el.innerHTML = '<i class="hull"></i><i class="core"></i><i class="fin l"></i><i class="fin r"></i><i class="flame"></i>';
    el.hidden = !!o.hidden;
    objsLayer.append(el);
    o.el = el; byId[o.id] = o;
  }
  const pet = byId.pet;
  byId.nucleo.hidden = false;

  // terreno: pontos de Fibonacci com cor por região, desenhados em baixa resolução (vira mancha contínua)
  const PATCH = [];
  const N = 520, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    const p = [Math.cos(th) * r, y, Math.sin(th) * r];
    const lon = Math.atan2(p[0], p[2]), lat = Math.asin(p[1]);
    const river = Math.abs(Math.sin(lon + .4) * .5 - lat) < .07;
    const n = Math.sin(lon * 3.1 + lat * 2.3) + Math.sin(lon * 1.7 - lat * 4.1) * .6;
    const col = river ? "#8fd0e6" : n > .75 ? "#3f7d5a" : n > .1 ? "#5f9e64" : n > -.6 ? "#9fd08a" : "#d6e8a8";
    PATCH.push({ p, col, s: river ? .055 : .085 + (i % 7) * .006 });
  }

  // ---------- gestos ----------
  const pointers = new Map();
  let pinch0 = 0, z0 = 0, dragging = false, moved = 0;
  game.addEventListener("pointerdown", (e) => {
    if (locked || e.target.closest(".fan-item, .game-sheet, .eco-edge, .hud-chip, .mapa")) return;
    if (!e.target.closest("button")) game.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); z0 = cam.zt; }
    dragging = true; moved = 0; cam.goto = null;
  });
  game.addEventListener("pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev || locked) return;
    const now = performance.now();
    if (pointers.size >= 2) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: now });
      const [a, b] = [...pointers.values()];
      cam.zt = clamp(z0 + Math.log(Math.hypot(a.x - b.x, a.y - b.y) / Math.max(pinch0, 1)) * .55, 0, 1);
      moved += 10; return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y, dt = Math.max(1, now - prev.t), v = view();
    cam.yaw += dx / v.R; cam.pitch = clamp(cam.pitch + dy / v.R, rad(-70), rad(70));
    cam.vy = dx / v.R / dt * 16; cam.vp = dy / v.R / dt * 16;
    moved += Math.abs(dx) + Math.abs(dy);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: now });
    if (moved > 8 && ringOpen) closeRing();
  });
  const up = (e) => { pointers.delete(e.pointerId); if (!pointers.size) dragging = false; };
  game.addEventListener("pointerup", up);
  game.addEventListener("pointercancel", up);
  game.addEventListener("wheel", (e) => { e.preventDefault(); if (!locked) cam.zt = clamp(cam.zt - e.deltaY * .0016, 0, 1); }, { passive: false });
  zoomInput.addEventListener("input", () => { if (!locked) cam.zt = zoomInput.value / 100; });

  // ---------- estado do arco do primeiro planeta ----------
  const fresh = () => ({ calm: false, pollinated: false, fruitTaken: false, mined: false, stonesTaken: false, planted: false,
    irrigated: false, harvested: false, evolved: false, nucleo: false, placa: false, nave: false, launched: false });
  let S = fresh(), busy = false;

  // ---------- coleção e tracker (rodada 20) ----------
  // Coleção por posse (decisão 5 do hub): a espécie entra quando você tem um bicho dela vivo.
  // Três estados: na coleção (possui) · visto (encontrou no mundo, ainda não é seu) · não descoberto (A06).
  const SPECIES = [
    { id: "brotinho", name: "Brotinho", img: A("brotinho-frente"), planet: "terra", region: "Bosque do Orvalho", obj: "pet", hint: "Chora perto de uma árvore com gota", glyph: "plantar", c: ["#f2ff9e", "#5fcf4a"] },
    { id: "cinza", name: "Bichinho-cinza", img: A("bichinho-cinza"), planet: "terra", region: "Encosta de Pedra", obj: "cinza", hint: "Vive entre as rochas duras", glyph: "minerar", c: ["#e4e0f2", "#8a83a8"] },
    { id: "rabanete", name: "Rabanete-antena", img: A("rabanete-antena"), planet: "vulcanico", region: "Planeta vulcânico", hint: "Escuta longe, na terra quente", glyph: "som", c: ["#ffc2a8", "#ff5f7e"] },
    { id: "lagarto", name: "Lagarto-deserto", img: null, planet: "vulcanico", region: "Deserto do vulcânico", hint: "Toma sol nas pedras quentes", glyph: "polinizar", c: ["#ffcf8a", "#e8572a"] }
  ];
  let seen = { cinza: false };
  let dexModel = "album", a06 = "silhueta", dexPlanet = "terra", tracking = null, foundAt = 0, orbitOpen = false, orbitSel = null;
  const status = (sp) => sp.id === "brotinho" ? (S.calm ? "possui" : "nao") : seen[sp.id] ? "visto" : "nao";
  const STLABEL = { possui: "Na coleção", visto: "Visto", nao: "Não descoberto" };
  const canTrack = (sp) => sp.obj && sp.planet === "terra" && status(sp) !== "nao";
  const num = (sp) => String(SPECIES.indexOf(sp) + 1).padStart(2, "0");
  // arte conforme o estado e, para não descobertos, conforme a opção A06 escolhida
  function art(sp, st) {
    if (st !== "nao") return sp.img ? `<img src="${sp.img}" alt="">` : `<i class="blob-sil"></i>`;
    if (a06 === "silhueta") return sp.img ? `<img class="sil" src="${sp.img}" alt="">` : `<i class="blob-sil"></i>`;
    if (a06 === "pista") return `<span class="pista-glyph"><svg viewBox="0 0 32 32">${ICONS[sp.glyph]}</svg></span>`;
    if (a06 === "numero") return `<span class="caixa-num">${num(sp)}</span>`;
    return sp.img ? `<img class="borrado" src="${sp.img}" alt="">` : `<i class="blob-sil borrado"></i>`;
  }
  const nameFor = (sp, st) => st !== "nao" ? sp.name : a06 === "borrado" ? `<span class="nome-borrado">${sp.name}</span>` : a06 === "numero" ? `Nº ${num(sp)}` : "?";
  const lineFor = (sp, st) => st === "possui" ? sp.region : st === "visto" ? `Visto · ${sp.region}` : a06 === "numero" ? "Ainda não descoberto" : sp.hint;
  let inv = { fibra: 0, pedra: 0, semente: 0, nucleo: 0, placa: 0 };
  const RESC = { fibra: ["#e6ff86", "#1fbf5b"], pedra: ["#e4e0f2", "#8a83a8"], semente: ["#ffe39a", "#d08a2a"], nucleo: ["#ffb3d6", "#ff4f86"], placa: ["#bfe0ff", "#4f63f2"] };
  const renderInv = (bump) => {
    const items = Object.entries(inv).filter(([, n]) => n > 0);
    invEl.innerHTML = !items.length ? '<span class="inv-empty">Inventário vazio</span>' :
      items.map(([k, n]) => `<span class="inv-item"><i style="background:radial-gradient(circle at 40% 35%, ${RESC[k][0]}, ${RESC[k][1]})"></i>${n}</span>`).join("");
    if (bump) { invEl.classList.remove("bump"); void invEl.offsetWidth; invEl.classList.add("bump"); }
  };
  renderInv();

  // ações do anel: o jogo mostra só o que vale agora (Carinho sempre primeiro)
  const ACT = {
    carinho: { label: "Carinho", c: ["#ffc2a8", "#ff5f7e"] },
    polinizar: { label: "Polinizar", c: ["#fff0a0", "#ff9f43"], verb: "Polinizando", dur: 2200, at: "flower" },
    minerar: { label: "Minerar", c: ["#ffcf8a", "#e8572a"], verb: "Minerando", dur: 2000, at: "rock" },
    plantar: { label: "Plantar", c: ["#f2ff9e", "#5fcf4a"], verb: "Plantando", dur: 1600, cost: { semente: 1 }, at: "canteiro" },
    canal: { label: "Canal", c: ["#c9e6ff", "#6a7bff"], verb: "Cavando canal", dur: 2200, cost: { fibra: 1, pedra: 1 }, at: "fonte" },
    alcancar: { label: "Alcançar", c: ["#d6f5b0", "#4fb06d"], verb: "Alcançando", dur: 1400, at: "tree" },
    fabricar: { label: "Fabricar placa", c: ["#e4e0f2", "#8a83a8"], verb: "Fabricando", dur: 2000, cost: { fibra: 1, pedra: 1 } },
    montar: { label: "Montar nave", c: ["#c9e6ff", "#6a7bff"], verb: "Montando", dur: 2400, cost: { placa: 1, nucleo: 1 }, at: "nave" },
    decolar: { label: "Decolar", c: ["#ffd7a8", "#ff7a3d"] }
  };
  function available() {
    const l = ["carinho"];
    if (!S.pollinated) l.push("polinizar");
    if (S.fruitTaken && !S.mined) l.push("minerar");
    if (S.fruitTaken && !S.planted) l.push("plantar");
    if (S.planted && !S.irrigated) l.push("canal");
    if (S.evolved && !S.nucleo) l.push("alcancar");
    if (S.nucleo && !S.placa) l.push("fabricar");
    if (S.placa && !S.nave) l.push("montar");
    if (S.nave && !S.launched) l.push("decolar");
    return l;
  }
  const missing = (id) => Object.entries(ACT[id].cost || {}).filter(([k, n]) => inv[k] < n).map(([k, n]) => `${n - inv[k]} ${k === "nucleo" ? "núcleo" : k}`);

  // ---------- etapa (deriva do estado) e pistas em três níveis ----------
  const HINTS = {
    buscar: ["", "Alguém está chorando. Siga o eco.", "Arraste para girar o planeta e siga o eco até quem chora."],
    perto: ["", "Aproxime com dois dedos.", "Use a pinça (dois dedos) para chegar perto dele."],
    arvore: ["", "Ele chora por água.", "Toque na árvore perto dele para soltar uma gota."],
    polinizar: ["", "Toque no Brotinho.", "Toque no Brotinho e escolha Polinizar (a flor)."],
    fruto: ["", "Um fruto surgiu.", "Toque no fruto para recolher."],
    minerar: ["", "Falta pedra para o canal.", "Toque no Brotinho e escolha Minerar."],
    pedras: ["", "Pedras soltas.", "Toque nas pedras para recolher."],
    plantar: ["", "O canteiro está seco.", "Toque no Brotinho e escolha Plantar."],
    canal: ["", "A semente precisa de água.", "Toque no Brotinho e escolha Canal, da fonte até o canteiro."],
    colheita: ["", "A colheita irrigada está pronta.", "Toque no fruto do canteiro."],
    alcancar: ["", "O núcleo está no alto do galho.", "Agora ele alcança: toque no Brotinho e escolha Alcançar."],
    fabricar: ["", "Uma placa estrutural.", "Toque no Brotinho e escolha Fabricar placa."],
    montar: ["", "Placa e núcleo prontos.", "Toque no Brotinho e escolha Montar nave."],
    decolar: ["", "A nave está pronta.", "Toque no Brotinho e escolha Decolar."],
    cena: ["", "", ""], mapa: ["", "", ""]
  };
  function stepNow(seen, show) {
    if (locked) return "cena";
    if (S.launched) return "mapa";
    if (!S.calm) return !seen ? "buscar" : show < .6 ? "perto" : "arvore";
    if (!S.pollinated) return "polinizar";
    if (!S.fruitTaken) return "fruto";
    if (!S.mined) return "minerar";
    if (!S.stonesTaken) return "pedras";
    if (!S.planted) return "plantar";
    if (!S.irrigated) return "canal";
    if (!S.harvested) return "colheita";
    if (!S.nucleo) return "alcancar";
    if (!S.placa) return "fabricar";
    if (!S.nave) return "montar";
    return "decolar";
  }
  const INSIST = { sutil: [12, 24], padrao: [6, 12], explicita: [0, 3] };
  let insist = "padrao", step = "", stepAt = performance.now(), level = -1;
  document.addEventListener("ecoeco:iniciar", () => { stepAt = performance.now(); level = -1; });
  root.querySelectorAll(".jogo-insist button").forEach((b) => b.addEventListener("click", () => {
    insist = b.dataset.insist;
    root.querySelectorAll(".jogo-insist button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    stepAt = performance.now(); level = -1;
  }));

  // ---------- bolhas de vidro (anel e menu) ----------
  function bubble(layer, id, a, onTap, state = "ok") {
    const slot = document.createElement("div");
    slot.className = "fan-slot";
    slot.style.setProperty("--c1", a.c[0]); slot.style.setProperty("--c2", a.c[1]);
    const b = document.createElement("button");
    b.type = "button"; b.className = "fan-item"; b.dataset.state = state; b.dataset.id = id;
    b.setAttribute("aria-label", a.label);
    const m = state === "falta" ? missing(id) : [];
    b.innerHTML = `<i class="drop" aria-hidden="true"><i class="caustic"></i><i class="rim"></i></i><span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32">${ICONS[id]}</svg></span><span class="tip" aria-hidden="true">${a.label}${m.length ? " · falta " + m.join(" + ") : ""}</span>` +
      (m.length ? `<em class="short" aria-hidden="true">−${m.length}</em>` : "");
    b.addEventListener("click", (e) => { e.stopPropagation(); onTap(id, b); });
    b.addEventListener("pointerdown", (e) => { e.stopPropagation(); b.classList.add("press"); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, () => b.classList.remove("press")));
    slot.append(b); layer.append(slot);
    return slot;
  }
  const ringEngine = Liquid.create({ stage, scene: game, center: () => ({ x: pet.sx || W / 2, y: pet.sy || H / 2 }) });
  let ringOpen = false;
  function openRing() {
    ringLayer.innerHTML = "";
    const ids = available(), n = ids.length, st = 360 / Math.max(n, 5), start = -90 - st * (n - 1) / 2;
    const items = ids.map((id, i) => {
      const el = bubble(ringLayer, id, ACT[id], chooseAction, missing(id).length ? "falta" : "ok");
      const ang = rad(start + i * st);
      return { el, id, bx: Math.cos(ang) * 21, by: Math.sin(ang) * 21 - 9, delay: 40 + i * 55 };
    });
    ringEngine.setItems(items); ringEngine.open();
    ringOpen = true; stage.dataset.observing = "true";
  }
  function closeRing() { ringEngine.close(); ringOpen = false; stage.dataset.observing = "false"; }
  function chooseAction(id, b) {
    if (!ringOpen || busy || ringLayer.querySelector('[data-state="aceito"]')) return;
    if (missing(id).length) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); say(`Falta ${missing(id).join(" + ")}`); return; }
    b.dataset.state = "aceito";
    ringEngine.accept(id);
    const journey = S;
    setTimeout(() => { if (S !== journey) return; closeRing(); act(id); }, reduce.matches ? 0 : 600);
  }
  function say(t) { hintEl.textContent = t; hintEl.hidden = false; hintEl.classList.remove("in"); void hintEl.offsetWidth; hintEl.classList.add("in"); }

  // ---------- ações ----------
  async function work(id) {
    const a = ACT[id];
    for (const [k, n] of Object.entries(a.cost || {})) inv[k] -= n;
    renderInv();
    busy = true; prog.hidden = false;
    const t0 = performance.now(), dur = reduce.matches ? 300 : a.dur;
    await new Promise((res) => {
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        prog.style.setProperty("--p", (1 - Math.pow(1 - p, 1.6)).toFixed(3));
        prog.querySelector("b").textContent = `${a.verb} ${Math.round(p * 100)}%`;
        if (p < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    prog.hidden = true; busy = false;
    if (a.at) halo(byId[a.at].sx, byId[a.at].sy - byId[a.at].px * .4, a.c[1]);
  }
  async function act(id) {
    if (id === "carinho") { pet.el.classList.remove("hop"); void pet.el.offsetWidth; pet.el.classList.add("hop"); return; }
    if (id === "decolar") { launch(); return; }
    const journey = S;
    if (id === "polinizar") focus(byId.flower, .8, .58);
    await work(id);
    if (S !== journey) return;
    if (id === "polinizar") { S.pollinated = true; show("fruit"); byId.flower.dim = true; }
    if (id === "minerar") { S.mined = true; show("stones"); }
    if (id === "plantar") { S.planted = true; byId.canteiro.el.dataset.state = "plantado"; }
    if (id === "canal") { await canalFlow(); S.irrigated = true; byId.canteiro.el.dataset.state = "irrigado"; await wait(500); show("fruit2"); }
    if (id === "alcancar") { S.nucleo = true; byId.nucleo.hidden = true; byId.nucleo.el.hidden = true; inv.nucleo += 1; renderInv(true); fly(byId.nucleo.sx, byId.nucleo.sy, "+1 núcleo", () => {}, 0); }
    if (id === "fabricar") { S.placa = true; inv.placa += 1; renderInv(true); fly(pet.sx, pet.sy - pet.px, "+1 placa", () => {}, 0); }
    if (id === "montar") { S.nave = true; show("nave"); byId.nave.el.classList.add("assemble"); focus(byId.nave, .8, .55); }
  }
  const show = (id) => { byId[id].hidden = false; byId[id].el.hidden = false; };
  const hide = (id) => { byId[id].hidden = true; byId[id].el.hidden = true; };

  // água: contas de água saem da fonte e correm até o canteiro
  async function canalFlow() {
    const f = byId.fonte, c = byId.canteiro;
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("i"); d.className = "water-drop small"; game.append(d);
      const t0 = performance.now(), dur = reduce.matches ? 1 : 700;
      const runner = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = k * k * (3 - 2 * k);
        const x = f.sx + (c.sx - f.sx) * e, y = f.sy + (c.sy - f.sy) * e - Math.sin(k * Math.PI) * 10;
        d.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        if (k < 1) requestAnimationFrame(runner); else d.remove();
      };
      requestAnimationFrame(runner);
      await wait(140);
    }
    await wait(650);
    halo(c.sx, c.sy, "#9fd6ff");
  }

  // ---------- toques nos objetos do mundo ----------
  const tapped = () => moved <= 8 && !locked;
  pet.el.addEventListener("click", (e) => {
    e.stopPropagation(); if (!tapped()) return;
    if (!S.calm) { pet.el.classList.remove("sob-shake"); void pet.el.offsetWidth; pet.el.classList.add("sob-shake"); halo(byId.tree.sx, byId.tree.sy - byId.tree.px * .8, "#9fd6ff"); stepAt = Math.min(stepAt, performance.now() - INSIST[insist][0] * 1000); return; }
    if (busy) return;
    ringOpen ? closeRing() : openRing();
  });
  byId.tree.el.addEventListener("click", (e) => {
    e.stopPropagation(); if (!tapped() || S.calm) return;
    byId.tree.el.classList.remove("shake"); void byId.tree.el.offsetWidth; byId.tree.el.classList.add("shake");
    dropWater();
  });
  byId.fruit.el.addEventListener("click", (e) => {
    e.stopPropagation(); if (!tapped()) return;
    const f = byId.fruit; hide("fruit"); S.fruitTaken = true;
    fly(f.sx, f.sy, "+2 fibra", () => { inv.fibra += 2; renderInv(true); }, 0);
    fly(f.sx, f.sy, "+1 semente", () => { inv.semente += 1; renderInv(true); }, 140);
  });
  byId.stones.el.addEventListener("click", (e) => {
    e.stopPropagation(); if (!tapped()) return;
    const s = byId.stones; hide("stones"); S.stonesTaken = true;
    fly(s.sx, s.sy, "+2 pedra", () => { inv.pedra += 2; renderInv(true); }, 0);
  });
  byId.fruit2.el.addEventListener("click", async (e) => {
    e.stopPropagation(); if (!tapped()) return;
    const f = byId.fruit2; hide("fruit2"); S.harvested = true;
    fly(f.sx, f.sy, "+2 fibra", () => { inv.fibra += 2; renderInv(true); }, 0);
    fly(f.sx, f.sy, "+1 semente", () => { inv.semente += 1; renderInv(true); }, 140);
    await wait(900);
    evolve();
  });
  byId.nave.el.addEventListener("click", (e) => { e.stopPropagation(); if (tapped() && S.nave && !S.launched) launch(); });

  function dropWater() {
    if (game.querySelector(".water-drop")) return;
    const journey = S;
    const tree = byId.tree, d = document.createElement("i"); d.className = "water-drop"; game.append(d);
    const t0 = performance.now(), dur = reduce.matches ? 1 : 950;
    const stepFn = (now) => {
      if (S !== journey) { d.remove(); return; }
      const k = Math.min(1, (now - t0) / dur);
      const x0 = tree.sx + tree.px * .15, y0 = tree.sy - tree.px * .9, x1 = pet.sx, y1 = pet.sy - pet.px * .85;
      const hang = Math.min(1, k / .25), fall = Math.max(0, (k - .25) / .75);
      d.style.transform = `translate(${x0 + (x1 - x0) * fall}px, ${y0 + 6 * hang + (y1 - y0) * fall * fall}px) translate(-50%, -50%) scale(${1 - fall * .2}, ${1 + fall * .35})`;
      d.style.opacity = String(Math.min(1, k * 6));
      if (k < 1) { requestAnimationFrame(stepFn); return; }
      d.remove(); halo(x1, y1, "#9fd6ff");
      S.calm = true; stage.dataset.crying = "false";
      pet.el.classList.add("hop"); pet.el.addEventListener("animationend", () => pet.el.classList.remove("hop"), {once:true});
    };
    requestAnimationFrame(stepFn);
  }
  function halo(x, y, color) {
    if (reduce.matches || x == null) return;
    for (let k = 0; k < 3; k++) {
      const h = document.createElement("i"); h.className = "halo";
      h.style.left = x + "px"; h.style.top = y + "px"; h.style.setProperty("--hc", k ? color : "#fff"); h.style.animationDelay = k * 100 + "ms";
      game.append(h); h.addEventListener("animationend", () => h.remove());
    }
  }
  function fly(x0, y0, text, done, delay) {
    const p = document.createElement("span"); p.className = "fly-pill"; p.textContent = text; game.append(p);
    const gb = game.getBoundingClientRect(), ib = invEl.getBoundingClientRect();
    const x1 = ib.left + ib.width / 2 - gb.left, y1 = ib.top + ib.height / 2 - gb.top;
    setTimeout(() => {
      const t0 = performance.now(), dur = reduce.matches ? 1 : 900;
      const stepFn = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const rise = Math.min(1, k / .3), go = Math.max(0, (k - .3) / .7);
        const e = go < .5 ? 4 * go * go * go : 1 - Math.pow(-2 * go + 2, 3) / 2;
        p.style.transform = `translate(${x0 + (x1 - x0) * e}px, ${y0 - 26 * (1 - Math.pow(1 - rise, 3)) + (y1 - (y0 - 26)) * e - Math.sin(e * Math.PI) * 40}px) translate(-50%, -50%) scale(${1 - e * .55})`;
        p.style.opacity = String(k < .9 ? 1 : (1 - k) * 10);
        if (k < 1) { requestAnimationFrame(stepFn); return; }
        p.remove(); done();
      };
      requestAnimationFrame(stepFn);
    }, delay);
  }
  ecoEdge.addEventListener("click", (e) => { e.stopPropagation(); if (!locked) focus(tracking ? byId[tracking.obj] : pet, .8, .6); });

  // ---------- cena de EVOLUÇÃO ----------
  // Foco no Brotinho → a luz quente converge → faíscas de vidro giram em espiral até ele → ele brilha,
  // encolhe e estoura → a flor vira COPA (cresce com mola) → anéis → cartão "O Brotinho evoluiu".
  async function evolve() {
    locked = true; closeRing(); stage.dataset.cine = "evolucao";
    focus(pet, .9, .58);
    await wait(900);
    cine.hidden = false; cine.classList.add("on");
    const sparks = [];
    if (!reduce.matches) for (let i = 0; i < 26; i++) {
      const s = document.createElement("i"); s.className = "spark";
      s.style.setProperty("--a", (i / 26 * 360) + "deg");
      s.style.setProperty("--r", (60 + (i % 5) * 14) + "px");
      s.style.setProperty("--d", (i % 7) * 60 + "ms");
      s.style.setProperty("--c", i % 3 ? "#ffd29a" : i % 2 ? "#ff9fc0" : "#e6ff86");
      s.style.left = pet.sx + "px"; s.style.top = (pet.sy - pet.px * .5) + "px";
      game.append(s); sparks.push(s);
    }
    pet.el.classList.add("charging");
    await wait(1700);
    sparks.forEach((s) => s.remove());
    pet.el.classList.remove("charging"); pet.el.classList.add("pop");
    halo(pet.sx, pet.sy - pet.px * .5, "#ffb36b");
    await wait(220);
    S.evolved = true; pet.el.classList.add("evolved"); pet.size = 25;
    await wait(500);
    halo(pet.sx, pet.sy - pet.px * 1.2, "#7fd38a");
    cineCard.innerHTML = `<span class="gicon"><svg viewBox="0 0 32 32">${ICONS.plantar}</svg></span><strong>O Brotinho evoluiu</strong><span>A flor virou copa. Agora ele alcança o que estava alto.</span>`;
    cineCard.hidden = false; cineCard.classList.remove("in"); void cineCard.offsetWidth; cineCard.classList.add("in");
    await wait(3200);
    cineCard.classList.remove("in"); cine.classList.remove("on");
    await wait(400);
    cineCard.hidden = true; cine.hidden = true; pet.el.classList.remove("pop");
    locked = false; stage.dataset.cine = "";
    byId.nucleo.el.classList.add("beckon");
    focus(byId.tree, .8, .62);
  }

  // ---------- cena de DECOLAGEM ----------
  // A nave treme e acende (como o eco) → dispara com rastro → a câmera se afasta além da atmosfera →
  // o planeta encolhe → abre o mapa da primeira região, com destinos ao alcance e sinais de criaturas.
  async function launch() {
    locked = true; closeRing(); stage.dataset.cine = "decolagem";
    const nave = byId.nave;
    focus(nave, .78, .62);
    await wait(900);
    nave.el.classList.add("ignite");
    await wait(1300);
    nave.el.classList.add("liftoff");
    S.launched = true;
    const t0 = performance.now(), dur = reduce.matches ? 300 : 2600;
    const zStart = cam.z;
    await new Promise((res) => {
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = k * k;
        nave.lift = e * H * 1.1;
        cam.zt = cam.z = zStart + (-.75 - zStart) * smooth(.15, 1, k);
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    hide("nave");
    await wait(300);
    mapa.hidden = false; mapa.classList.remove("in"); void mapa.offsetWidth; mapa.classList.add("in");
    stage.dataset.cine = "mapa";
  }
  $(".mapa-voltar").addEventListener("click", (e) => {
    e.stopPropagation();
    mapa.classList.remove("in"); setTimeout(() => { mapa.hidden = true; }, 300);
    locked = false; stage.dataset.cine = ""; cam.zt = .35;
  });

  // ---------- menu do planeta (escala planetária) ----------
  const menuEngine = Liquid.create({ stage, scene: game, driveLight: false, center: () => { const v = view(); return { x: v.cx, y: v.cy }; } });
  const MENU = { receitas: { label: "Receitas", c: ["#ffcf73", "#ff6a2c"] }, colecao: { label: "Coleção", c: ["#ffb3d6", "#ff4f86"] },
    som: { label: "Som", c: ["#bfe0ff", "#4f63f2"] }, ajustes: { label: "Ajustes", c: ["#d9ccff", "#7d5cf0"] } };
  let menuOpen = false, activeSheet = null;
  const menuSlots = Object.entries(MENU).map(([id, m]) => bubble(menuLayer, id, m, openSheet));
  const placeMenu = () => {
    const v = view(), u = W / 100, Rm = Math.min(v.R / u + 12, 50);
    menuEngine.setItems(menuSlots.map((el, i) => {
      const a = rad(-135 + i * 90);
      return { el, id: Object.keys(MENU)[i], bx: Math.cos(a) * Rm, by: Math.sin(a) * Rm, delay: 40 + i * 60 };
    }));
  };
  function openSheet(id) {
    if (id === "colecao" && dexModel === "orbita") { closeSheet(); orbitOpen ? closeOrbit() : openOrbit(); return; }
    if (orbitOpen) closeOrbit();
    if (activeSheet === id) { closeSheet(); return; }
    activeSheet = id;
    menuSlots.forEach((s) => { const b = s.querySelector(".fan-item"); b.dataset.state = b.dataset.id === id ? "aceito" : "ok"; });
    sheet.style.setProperty("--c1", MENU[id].c[0]); sheet.style.setProperty("--c2", MENU[id].c[1]);
    sheet.querySelector(".sheet-title").textContent = MENU[id].label;
    sheet.querySelector(".sheet-body").innerHTML = SHEETS[id]();
    sheet.hidden = false; sheet.classList.remove("in"); void sheet.offsetWidth; sheet.classList.add("in");
  }
  function closeSheet() {
    activeSheet = null; sheet.classList.remove("in");
    menuSlots.forEach((s) => { s.querySelector(".fan-item").dataset.state = "ok"; });
    setTimeout(() => { if (!activeSheet) sheet.hidden = true; }, 260);
  }
  sheet.querySelector(".sheet-close").addEventListener("click", (e) => { e.stopPropagation(); closeSheet(); });
  const RES = { fibra: ["fibra", "#e6ff86", "#1fbf5b"], pedra: ["pedra", "#e4e0f2", "#8a83a8"], placa: ["placa", "#bfe0ff", "#4f63f2"], nucleo: ["núcleo", "#ffb3d6", "#ff4f86"] };
  const chip = (k, have, need) => `<span class="res ${have >= need ? "ok" : "short"}" style="--c1:${RES[k][1]};--c2:${RES[k][2]}"><i aria-hidden="true"></i><b>${Math.min(have, need)}/${need}</b> ${RES[k][0]}</span>`;
  const SHEETS = {
    receitas: () => `<ul class="recipes">${[["Passarela", { fibra: 2, pedra: 2 }, false, true], ["Canal", { fibra: 1, pedra: 1 }, false, S.irrigated], ["Placa estrutural", { fibra: 1, pedra: 1 }, false, S.placa], ["Nave", { placa: 1, nucleo: 1 }, false, S.nave]].map(([n, need, wait2, done]) => {
      const ok = Object.entries(need).every(([k, v]) => (inv[k] || 0) >= v);
      const st = done ? "feita" : ok ? "pronta" : "falta";
      return `<li data-state="${st}"><div><strong>${n}</strong><span>No mundo</span></div><div class="chips">${Object.entries(need).map(([k, v]) => chip(k, done ? v : inv[k] || 0, v)).join("")}</div><em>${{ feita: "Feita", pronta: "Dá para fazer", falta: "Falta material" }[st]}</em></li>`;
    }).join("")}</ul>`,
    colecao: () => {
      // Modelo A · álbum por planeta
      const list = SPECIES.filter((sp) => sp.planet === dexPlanet);
      const owned = SPECIES.filter((sp) => status(sp) === "possui").length, vistos = SPECIES.filter((sp) => status(sp) !== "nao").length;
      return `<div class="dex-tabs" role="tablist">${[["terra", "Terra"], ["vulcanico", "Vulcânico"]].map(([k, l]) => `<button type="button" role="tab" class="dex-tab" data-planet="${k}" aria-selected="${dexPlanet === k}">${l}</button>`).join("")}</div>
      <p class="dex-count"><b>${owned}</b> na coleção · <b>${vistos}</b> vistas · ${SPECIES.length} espécies</p>
      <ul class="album">${list.map((sp) => {
        const st = status(sp);
        const forms = sp.id === "brotinho" && st === "possui" ? `<span class="formas"><i class="on">Broto</i><i class="${S.evolved ? "on" : ""}">Copa</i></span>` : "";
        return `<li class="card" data-st="${st}" style="--c1:${sp.c[0]};--c2:${sp.c[1]}"><span class="card-art">${art(sp, st)}</span><strong>${nameFor(sp, st)}</strong><em class="st">${STLABEL[st]}</em><span class="linha">${lineFor(sp, st)}</span>${forms}${canTrack(sp) ? `<button type="button" class="rastrear" data-track="${sp.id}"><svg viewBox="0 0 32 32" aria-hidden="true">${ICONS.eco}</svg>Rastrear</button>` : ""}</li>`;
      }).join("")}</ul>${dexPlanet === "vulcanico" ? '<p class="sheet-note">Espécies de outro planeta aparecem depois da decolagem.</p>' : ""}`;
    },
    som: () => `<div class="toggles">${["Música", "Efeitos", "Vibração no eco"].map((l, i) => `<label class="toggle"><span>${l}</span><input type="checkbox" id="g-snd-${i}" checked><i aria-hidden="true"></i></label>`).join("")}</div>`,
    ajustes: () => `<div class="toggles">${["Movimento reduzido", "Texto maior", "Dicas explícitas"].map((l, i) => `<label class="toggle"><span>${l}</span><input type="checkbox" id="g-adj-${i}"${i === 2 ? " checked" : ""}><i aria-hidden="true"></i></label>`).join("")}</div>`
  };

  // ---------- toast de vidro ----------
  const toastEl = document.createElement("div"); toastEl.className = "g-toast"; toastEl.hidden = true; toastEl.setAttribute("role", "status");
  game.append(toastEl);
  let toastTimer = 0;
  function toast(html, ms = 2600) {
    toastEl.innerHTML = html; toastEl.hidden = false;
    toastEl.classList.remove("in"); void toastEl.offsetWidth; toastEl.classList.add("in");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.classList.remove("in"); setTimeout(() => { toastEl.hidden = true; }, 300); }, ms);
  }

  // ---------- tracker: escolher uma espécie e seguir o eco até ela ----------
  function track(id) {
    const sp = SPECIES.find((x) => x.id === id);
    if (!sp || !canTrack(sp)) return;
    tracking = sp; foundAt = 0;
    closeSheet(); closeOrbit();
    cam.zt = Math.max(cam.zt, .56);
    stage.dataset.track = sp.id;
    for (const el of [ecoEdge, ecoTag]) { el.style.setProperty("--trk1", sp.c[0]); el.style.setProperty("--trk2", sp.c[1]); }
    toast(`<span class="t-art"><img src="${sp.img}" alt=""></span><span><b>Rastreando ${sp.name}</b><small>Siga o eco na borda</small></span>`);
  }
  function stopTrack() { tracking = null; foundAt = 0; delete stage.dataset.track; }
  sheet.addEventListener("click", (e) => {
    const tab = e.target.closest(".dex-tab"), tr = e.target.closest(".rastrear");
    if (tab) { dexPlanet = tab.dataset.planet; sheet.querySelector(".sheet-body").innerHTML = SHEETS.colecao(); }
    if (tr) track(tr.dataset.track);
  });

  // ---------- Modelo B · coleção em órbita do planeta ----------
  // As espécies viram bolhas de vidro girando em volta do planeta; as de outro planeta ficam numa órbita
  // externa, menores e tracejadas. Tocar abre uma legenda de vidro com Rastrear.
  const orbitLayer = document.createElement("div"); orbitLayer.className = "dex-orbit"; orbitLayer.hidden = true;
  const caption = document.createElement("div"); caption.className = "dex-caption"; caption.hidden = true;
  game.append(orbitLayer, caption);
  function openOrbit() {
    orbitOpen = true; orbitSel = null; caption.hidden = true;
    cam.zt = 0;   // planeta no menor tamanho para as órbitas caberem
    stage.dataset.orbit = "1";
    orbitLayer.innerHTML = SPECIES.map((sp, i) => {
      const st = status(sp);
      return `<button type="button" class="orb" data-sp="${sp.id}" data-st="${st}" data-planet="${sp.planet}" style="--c1:${sp.c[0]};--c2:${sp.c[1]};--i:${i}" aria-label="${st === "nao" ? "Espécie não descoberta" : sp.name}"><span class="orb-art">${art(sp, st)}</span></button>`;
    }).join("") + '<button type="button" class="orb-fechar" aria-label="Fechar coleção">×</button>';
    orbitLayer.hidden = false; orbitLayer.classList.remove("in"); void orbitLayer.offsetWidth; orbitLayer.classList.add("in");
    menuEngine.close();
  }
  function closeOrbit() {
    if (!orbitOpen) return;
    orbitOpen = false; delete stage.dataset.orbit; caption.hidden = true;
    orbitLayer.classList.remove("in"); setTimeout(() => { if (!orbitOpen) orbitLayer.hidden = true; }, 300);
    if (menuOpen) { placeMenu(); menuEngine.open(); }
  }
  orbitLayer.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest(".orb-fechar")) { closeOrbit(); return; }
    const b = e.target.closest(".orb"); if (!b) return;
    const sp = SPECIES.find((x) => x.id === b.dataset.sp), st = status(sp);
    orbitSel = sp.id;
    orbitLayer.querySelectorAll(".orb").forEach((o) => o.classList.toggle("sel", o === b));
    caption.style.setProperty("--c1", sp.c[0]); caption.style.setProperty("--c2", sp.c[1]);
    caption.innerHTML = `<strong>${nameFor(sp, st)}</strong><em>${STLABEL[st]}${sp.planet === "vulcanico" ? " · outro planeta" : ""}</em><span>${lineFor(sp, st)}</span>${canTrack(sp) ? `<button type="button" class="rastrear" data-track="${sp.id}"><svg viewBox="0 0 32 32" aria-hidden="true">${ICONS.eco}</svg>Rastrear</button>` : ""}`;
    caption.hidden = false; caption.classList.remove("in"); void caption.offsetWidth; caption.classList.add("in");
  });
  caption.addEventListener("click", (e) => { e.stopPropagation(); const tr = e.target.closest(".rastrear"); if (tr) track(tr.dataset.track); });
  ["pointerdown"].forEach((ev) => { orbitLayer.addEventListener(ev, (e) => e.stopPropagation()); caption.addEventListener(ev, (e) => e.stopPropagation()); });

  // bichinho-cinza: tocar registra "visto" (ainda não é seu: posse pede outro passo do game design)
  byId.cinza.el.addEventListener("click", (e) => {
    e.stopPropagation(); if (moved > 8 || locked) return;
    const sp = SPECIES[1], first = !seen.cinza;
    seen.cinza = true;
    halo(byId.cinza.sx, byId.cinza.sy - byId.cinza.px * .5, sp.c[1]);
    byId.cinza.el.classList.remove("hop"); void byId.cinza.el.offsetWidth; byId.cinza.el.classList.add("hop");
    toast(first ? `<span class="t-art"><img src="${sp.img}" alt=""></span><span><b>Nova espécie vista</b><small>Bichinho-cinza · Encosta de Pedra</small></span>`
      : `<span class="t-art"><img src="${sp.img}" alt=""></span><span><b>Bichinho-cinza</b><small>Visto. Ainda não é seu.</small></span>`);
    if (tracking && tracking.id === "cinza") stopTrack();
  });
  root.querySelectorAll(".dex-model button").forEach((b) => b.addEventListener("click", () => {
    dexModel = b.dataset.model;
    root.querySelectorAll(".dex-model button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (activeSheet === "colecao" || orbitOpen) { closeSheet(); closeOrbit(); openSheet("colecao"); }
  }));
  root.querySelectorAll(".dex-a06 button").forEach((b) => b.addEventListener("click", () => {
    a06 = b.dataset.a06;
    root.querySelectorAll(".dex-a06 button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (activeSheet === "colecao") sheet.querySelector(".sheet-body").innerHTML = SHEETS.colecao();
    if (orbitOpen) openOrbit();
  }));
  root.querySelectorAll("[data-pular-dex]").forEach((b) => b.addEventListener("click", () => {
    reset(); S.calm = true; stage.dataset.crying = "false"; seen.cinza = b.dataset.pularDex === "visto";
    cam.zt = cam.z = .1; document.dispatchEvent(new CustomEvent("ecoeco:pular"));
  }));

  // ---------- recomeçar e atalhos de playtest ----------
  function reset(to) {
    S = fresh(); busy = false; inv = { fibra: 0, pedra: 0, semente: 0, nucleo: 0, placa: 0 };
    seen = { cinza: false }; stopTrack(); closeOrbit();
    ["fruit", "stones", "fruit2", "nave"].forEach(hide);
    byId.nucleo.hidden = false; byId.nucleo.el.hidden = false; byId.nucleo.el.classList.remove("beckon");
    byId.flower.dim = false; byId.canteiro.el.dataset.state = "seco";
    pet.el.classList.remove("evolved", "pop", "charging"); pet.size = 21;
    byId.nave.el.classList.remove("assemble", "ignite", "liftoff"); byId.nave.lift = 0;
    stage.dataset.crying = "true"; closeRing(); closeSheet();
    mapa.hidden = true; cine.hidden = true; cineCard.hidden = true; locked = false; stage.dataset.cine = "";
    Object.assign(cam, { yaw: rad(-30), pitch: rad(8), vy: 0, vp: 0, zt: .5, z: .5, goto: null });
    if (to === "evolucao" || to === "decolagem") {
      Object.assign(S, { calm: true, pollinated: true, fruitTaken: true, mined: true, stonesTaken: true, planted: true, irrigated: true });
      byId.flower.dim = true; byId.canteiro.el.dataset.state = "irrigado"; stage.dataset.crying = "false";
      inv = { fibra: 3, pedra: 1, semente: 0, nucleo: 0, placa: 0 };
      if (to === "evolucao") { show("fruit2"); focus(byId.canteiro, .82, .58); }
    }
    if (to === "decolagem") {
      Object.assign(S, { harvested: true, evolved: true, nucleo: true, placa: true, nave: true });
      pet.el.classList.add("evolved"); pet.size = 25; byId.nucleo.hidden = true; byId.nucleo.el.hidden = true;
      inv = { fibra: 4, pedra: 0, semente: 1, nucleo: 0, placa: 0 };
      show("nave"); focus(pet, .8, .6);
    }
    renderInv(); stepAt = performance.now(); level = -1;
  }
  $("#jogo-reset").addEventListener("click", () => reset());
  root.querySelectorAll("[data-pular]").forEach((b) => b.addEventListener("click", () => reset(b.dataset.pular)));
  byId.canteiro.el.dataset.state = "seco";

  // ---------- quadro ----------
  let last = performance.now(), lastPulse = 0, frameId = 0, visible = false;
  let pausedAt = null, backdrop = null;
  function syncFrame() {
    const now = performance.now();
    if (!visible || document.hidden) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      if (pausedAt === null) pausedAt = now;
      return;
    }
    if (pausedAt !== null) { stepAt += now - Math.max(pausedAt, stepAt); pausedAt = null; }
    if (!frameId) { last = now; frameId = requestAnimationFrame(frame); }
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncFrame();
  }, { rootMargin: "80px" }).observe(game);
  document.addEventListener("visibilitychange", syncFrame);
  stage.dataset.crying = "true";
  function frame(now) {
    frameId = 0;
    const dt = Math.min(.034, (now - last) / 1000); last = now;
    if (cam.goto) {
      const dy = Math.atan2(Math.sin(cam.goto.yaw - cam.yaw), Math.cos(cam.goto.yaw - cam.yaw));
      cam.yaw += dy * Math.min(1, dt * 4); cam.pitch += (cam.goto.pitch - cam.pitch) * Math.min(1, dt * 4);
      cam.zt += (cam.goto.z - cam.zt) * Math.min(1, dt * 3);
      if (Math.abs(dy) < .002 && Math.abs(cam.goto.pitch - cam.pitch) < .002) cam.goto = null;
    } else if (!dragging) {
      const decay = Math.pow(.93, dt * 60);
      const distance = (1 - decay) / (1 - .93);
      cam.yaw += cam.vy * distance;
      cam.pitch = clamp(cam.pitch + cam.vp * distance, rad(-70), rad(70));
      cam.vy *= decay; cam.vp *= decay;
    }
    if (!(locked && stage.dataset.cine === "decolagem")) cam.z += (cam.zt - cam.z) * Math.min(1, dt * 9);
    lift += ((activeSheet ? H * .2 : 0) - lift) * Math.min(1, dt * 8);
    const zoomValue = String(Math.round(clamp(cam.zt, 0, 1) * 100));
    if (zoomInput.value !== zoomValue) zoomInput.value = zoomValue;
    const v = view(), rotate = rotation();

    // Sem movimento visível, reaproveita o planeta já desenhado. O HUD continua animando.
    const repaint = !backdrop || backdrop.width !== canvas.width || backdrop.height !== canvas.height
      || Math.max(Math.abs(v.cy - backdrop.cy), Math.abs(v.R - backdrop.R),
        Math.abs(cam.yaw - backdrop.yaw) * v.R, Math.abs(cam.pitch - backdrop.pitch) * v.R) >= .15;
    if (repaint) {
      backdrop = { width: canvas.width, height: canvas.height, cy: v.cy, R: v.R, yaw: cam.yaw, pitch: cam.pitch };
      game.style.setProperty("--gx", v.cx.toFixed(1) + "px");
      game.style.setProperty("--gy", v.cy.toFixed(1) + "px");
      game.style.setProperty("--gr", v.R.toFixed(1) + "px");

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(v.cx - v.R * .35, v.cy - v.R * .4, v.R * .1, v.cx, v.cy, v.R);
      g.addColorStop(0, "#c8ecb0"); g.addColorStop(.6, "#82bf78"); g.addColorStop(1, "#3d6e55");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(v.cx, v.cy, v.R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(v.cx, v.cy, v.R, 0, Math.PI * 2); ctx.clip();
      const k = 1 / 10;
      if (off.width !== Math.ceil(W * k) || off.height !== Math.ceil(H * k)) { off.width = Math.ceil(W * k); off.height = Math.ceil(H * k); }
      octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, off.width, off.height);
      for (const pt of PATCH) {
        const q = rotate(pt.p);
        if (q[2] <= 0) continue;
        const [x, y] = project(q, v), r = pt.s * v.R * 1.25;
        if (x < -r || x > W + r || y < -r || y > H + r) continue;
        octx.globalAlpha = .7 * (.4 + .6 * q[2]); octx.fillStyle = pt.col;
        octx.beginPath(); octx.ellipse(x * k, y * k, Math.max(.5, r * q[2] * k), r * k, Math.atan2(-q[1], q[0]), 0, Math.PI * 2); octx.fill();
      }
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = .85; ctx.drawImage(off, 0, 0, W, H); ctx.globalAlpha = 1;
      const sh = ctx.createRadialGradient(v.cx - v.R * .3, v.cy - v.R * .35, v.R * .2, v.cx, v.cy, v.R * 1.02);
      sh.addColorStop(0, "rgba(255,240,210,.18)"); sh.addColorStop(.7, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(10,12,30,.45)");
      ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(190,240,200,.18)"; ctx.beginPath(); ctx.arc(v.cx, v.cy, v.R + 3, 0, Math.PI * 2); ctx.stroke();
    }

    // objetos de pé na superfície
    const showK = smooth(.3, .48, cam.z);
    for (const o of OBJ) {
      if (o.hidden) { o.el.style.display = "none"; continue; }
      const q = rotate(o.p), [x, y] = project(q, v);
      const px = o.size * (W / 100) * Math.pow(v.R / W, .55) * (.55 + .45 * q[2]);
      o.sx = x; o.sy = y - (o.lift || 0); o.px = px; o.q = q;
      const vis = q[2] > .04 && showK > .01 && x > -px && x < W + px && y > -px * 2 && y < H + px;
      if (o.id === "nave" && o.lift) { o.el.style.display = ""; }
      else { o.el.style.display = vis ? "" : "none"; if (!vis) continue; }
      const ang = Math.atan2(q[0], q[1]) * 180 / Math.PI;
      o.el.style.transform = `translate(${x.toFixed(1)}px, ${(y - (o.lift || 0)).toFixed(1)}px) rotate(${ang.toFixed(1)}deg) translate(-50%, ${o.anchor || -100}%)`;
      o.el.style.width = px.toFixed(1) + "px";
      o.el.style.opacity = String(showK * smooth(.04, .2, q[2]) * (o.dim ? .55 : 1));
      o.el.style.zIndex = String(10 + Math.round(q[2] * 100 + (1 - q[1]) * 20));
    }
    ringLayer.style.setProperty("--cx", (pet.sx || 0).toFixed(1) + "px");
    ringLayer.style.setProperty("--cy", ((pet.sy || 0) - (pet.px || 0) * (S.evolved ? .95 : .55)).toFixed(1) + "px");
    prog.style.transform = `translate(${(pet.sx || 0).toFixed(1)}px, ${((pet.sy || 0) - (pet.px || 0) * (S.evolved ? 1.7 : 1.25)).toFixed(1)}px)`;

    // menu do planeta
    const planetary = cam.z < .2 && !locked;
    if (planetary !== menuOpen) {
      menuOpen = planetary;
      if (planetary) { placeMenu(); menuEngine.open(); if (ringOpen) closeRing(); } else { menuEngine.close(); closeSheet(); }
      stage.dataset.menu = String(planetary);
    }
    menuLayer.style.setProperty("--cx", v.cx.toFixed(1) + "px");
    menuLayer.style.setProperty("--cy", v.cy.toFixed(1) + "px");

    // eco: segue quem chora (Brotinho) ou, com o tracker, a espécie rastreada
    const T = tracking ? byId[tracking.obj] : pet;
    const pq = T.q || rotate(T.p);
    const onScreen = pq[2] > .1 && showK > .5 && T.sx > 0 && T.sx < W && T.sy > 40 && T.sy < H - 40;
    const q0 = [(W / 2 - v.cx) / v.R, (v.cy - H * .55) / v.R], l0 = Math.hypot(q0[0], q0[1]);
    const c0 = l0 < 1 ? [q0[0], q0[1], Math.sqrt(1 - l0 * l0)] : [q0[0] / l0, q0[1] / l0, 0];
    const near = Math.pow(clamp(1 - Math.acos(clamp(pq[0] * c0[0] + pq[1] * c0[1] + pq[2] * c0[2], -1, 1)) / (Math.PI * .7), 0, 1), 1.4);
    const amp = .8 + 2.6 * near, vib = .16 - .07 * near, pulse = 1.5 - .95 * near;
    for (const el of [ecoEdge, ecoTag]) {
      el.style.setProperty("--amp", amp.toFixed(2) + "px"); el.style.setProperty("--vib", vib.toFixed(3) + "s");
      el.style.setProperty("--pulse", pulse.toFixed(2) + "s"); el.style.setProperty("--near", near.toFixed(2));
    }
    stage.dataset.off = String(!onScreen);
    if ((!S.calm || tracking) && !reduce.matches && now - lastPulse > pulse * 1000) {
      lastPulse = now;
      for (const el of [ecoEdge, ecoTag]) { el.classList.remove("ping"); void el.offsetWidth; el.classList.add("ping"); }
    }
    if (onScreen) ecoTag.style.transform = `translate(${T.sx.toFixed(1)}px, ${(T.sy - T.px * 1.15).toFixed(1)}px)`;
    else {
      let dx = T.sx - W / 2, dy = T.sy - H / 2;
      if (pq[2] <= .1) { dx = pq[0]; dy = -pq[1]; if (Math.hypot(dx, dy) < .05) { dx = 0; dy = 1; } }
      const s = Math.min((W / 2 - 34) / Math.abs(dx || 1e-6), (H / 2 - 74) / Math.abs(dy || 1e-6));
      ecoEdge.style.setProperty("--px", (W / 2 + dx * s).toFixed(1) + "px");
      ecoEdge.style.setProperty("--py", (H / 2 + dy * s).toFixed(1) + "px");
      ecoEdge.querySelector(".eco-rot").style.setProperty("--ang", (Math.atan2(-dy, -dx) * 180 / Math.PI).toFixed(1) + "deg");
    }
    // tracker: encontrado quando o alvo fica à vista, perto do centro, por quase um segundo
    if (tracking) {
      if (onScreen && near > .72) {
        if (!foundAt) foundAt = now;
        else if (now - foundAt > 900) {
          const sp = tracking; stopTrack();
          halo(T.sx, T.sy - T.px * .5, sp.c[1]);
          toast(`<span class="t-art"><img src="${sp.img}" alt=""></span><span><b>Encontrado</b><small>${sp.name} · ${sp.region}</small></span>`);
        }
      } else foundAt = 0;
    }

    // orbita da coleção (modelo B): bolhas giram devagar em volta do planeta
    if (orbitOpen) {
      const u = W / 100, t = now / 1000;
      orbitLayer.querySelectorAll(".orb").forEach((b, i) => {
        const outer = b.dataset.planet !== "terra";
        // órbitas elípticas: a tela é alta, então a externa passa acima e abaixo do planeta
        const rx = outer ? Math.min(v.R / u + 6, 38) : Math.min(v.R / u + 12, 40);
        const ry = outer ? rx * 1.9 : rx * 1.2;
        const a = rad((outer ? 250 : -90) + (i % 2) * (outer ? 180 : 150)) + t * (outer ? -.06 : .09);
        b.style.transform = `translate(${(v.cx + Math.cos(a) * rx * u).toFixed(1)}px, ${(v.cy + Math.sin(a) * ry * u).toFixed(1)}px) translate(-50%, -50%)`;
      });
    }
    const petq = pet.q || rotate(pet.p);

    // etapa e pista
    const petSeen = petq[2] > .1 && pet.sx > 0 && pet.sx < W && pet.sy > 0 && pet.sy < H;
    const st = stepNow(petSeen, showK);
    if (st !== step) { step = st; stepAt = now; level = -1; stage.dataset.step = st; }
    const [t1, t2] = INSIST[insist], idle = (now - stepAt) / 1000;
    const lv = idle >= t2 ? 2 : idle >= t1 ? 1 : 0;
    if (lv !== level) {
      level = lv; stage.dataset.level = String(lv);
      const txt = (HINTS[step] || ["", "", ""])[lv];
      hintEl.textContent = txt; hintEl.hidden = !txt;
      if (txt) { hintEl.classList.remove("in"); void hintEl.offsetWidth; hintEl.classList.add("in"); }
      levelChip.textContent = `${step} · pista ${lv}`;
    }
    if (visible && !document.hidden) frameId = requestAnimationFrame(frame);
  }
})();
