// Rodada 04 · menu do planeta.
// No jogo (hub do time, 22/11): afastar com a pinça até a escala planetária abre o menu do
// planeta com Receitas, Coleção, Som e Debug, num painel compacto no pé da tela.
// Aqui: as mesmas gotas da rodada 03 orbitam o planeta pequeno; cada gota abre uma folha de vidro.
// Conteúdo de exemplo, com valores de teste do briefing. Não são decisões de UI.
(() => {
  const root = document.querySelector("#planeta");
  if (!root) return;
  const stage = root.querySelector(".planet-stage");
  const scene = root.querySelector(".planet-scene");
  const planet = root.querySelector(".planet");
  const fan = root.querySelector(".planet-fan");
  const sheet = root.querySelector(".sheet");
  const sheetBody = sheet.querySelector(".sheet-body");
  const sheetTitle = sheet.querySelector(".sheet-title");
  const zoom = root.querySelector("#planet-zoom");
  const status = root.querySelector("#planet-status");
  const scaleLabel = root.querySelector(".scale-label");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const ICONS = window.ECO_ICONS;   // rodada 08: ícones de pincel (icons.js)
  const ITEMS = [
    { id: "receitas", label: "Receitas", hue: ["#ffcf73", "#ff6a2c"] },
    { id: "colecao", label: "Coleção", hue: ["#ffb3d6", "#ff4f86"] },
    { id: "som", label: "Som", hue: ["#bfe0ff", "#4f63f2"] },
    { id: "ajustes", label: "Ajustes", hue: ["#d9ccff", "#7d5cf0"] }
  ];

  // Inventário de exemplo para mostrar os três estados de receita.
  const INV = { fibra: 3, pedra: 1, semente: 1, placa: 0, nucleo: 0 };
  const RECIPES = [
    { name: "Passarela", note: "Construída no mundo", done: true, need: { fibra: 2, pedra: 2 } },
    { name: "Canal", note: "No Vale da Fonte", need: { fibra: 1, pedra: 1 } },
    { name: "Placa estrutural", note: "Na bancada · planejada", need: { fibra: 1, pedra: 1 } },
    { name: "Nave", note: "Em espera no jogo", need: { placa: 1, nucleo: 1 }, wait: true }
  ];
  const RES = {
    fibra: ["fibra", "#e6ff86", "#1fbf5b"], pedra: ["pedra", "#e4e0f2", "#8a83a8"],
    semente: ["semente", "#ffe39a", "#d08a2a"], placa: ["placa", "#bfe0ff", "#4f63f2"], nucleo: ["núcleo", "#ffb3d6", "#ff4f86"]
  };
  const CREATURES = [
    { name: "Brotinho", owned: true, hue: ["#f6ff9a", "#7d5cf0"], hint: "Pedrinha com musgo e flor. Poliniza." },
    { name: "?", hint: "Pista: vive perto da fonte", hue: ["#bfe0ff", "#4f63f2"] },
    { name: "?", hint: "Pista: rochas duras", hue: ["#ffcf73", "#ff6a2c"] },
    { name: "?", hint: "Pista: só aparece à noite", hue: ["#d9ccff", "#7d5cf0"] },
    { name: "?", hint: "Planeta vulcânico", hue: ["#ffb3d6", "#ff4f86"] },
    { name: "?", hint: "Planeta vulcânico", hue: ["#ffb3d6", "#ff4f86"] }
  ];

  const say = (t) => { status.textContent = t; };
  const fmt = (n) => n.toFixed(2);
  let menuOpen = false;
  let active = null;

  const dropButton = (item, i, n) => {
    // gotas nas diagonais em volta do planeta, ponta para o centro
    const deg = -135 + i * (360 / n);
    const a = deg * Math.PI / 180;
    const u = [Math.cos(a), Math.sin(a)];
    const toward = Math.atan2(-u[1], -u[0]) * 180 / Math.PI;
    const slot = document.createElement("div");
    slot.className = "fan-slot";
    const vars = {
      "--ux": fmt(u[0]), "--uy": fmt(u[1]), "--rot": fmt(toward + 135) + "deg",
      "--tox": fmt(50 - u[0] * 70.7) + "%", "--toy": fmt(50 - u[1] * 70.7) + "%",
      "--delay": 80 + i * 70 + "ms", "--back": (n - 1 - i) * 35 + "ms", "--phase": fmt(i * -1.2) + "s",
      "--c1": item.hue[0], "--c2": item.hue[1]
    };
    for (const [k, v] of Object.entries(vars)) slot.style.setProperty(k, v);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "fan-item";
    b.dataset.state = "ok";
    b.dataset.id = item.id;
    b.setAttribute("aria-label", item.label);
    b.setAttribute("aria-controls", "planet-sheet");
    b.innerHTML = `<i class="drop" aria-hidden="true"><i class="caustic"></i><i class="rim"></i></i><span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32">${ICONS[item.id]}</svg></span><span class="tip" aria-hidden="true">${item.label}</span>`;
    b.addEventListener("click", (e) => { e.stopPropagation(); openSheet(item); });
    b.addEventListener("pointerdown", () => b.classList.add("press"));
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, () => b.classList.remove("press")));
    b.addEventListener("pointerenter", () => say(item.label));
    const grow = document.createElement("div"); grow.className = "grow";
    const sway = document.createElement("div"); sway.className = "sway";
    sway.append(b); grow.append(sway); slot.append(grow);
    return slot;
  };
  const slots = ITEMS.map((it, i) => { const el = dropButton(it, i, ITEMS.length); fan.append(el); return el; });
  // motor líquido (rodada 05): centro = centro do planeta na escala planetária
  const cssNum = (n, f) => parseFloat(getComputedStyle(scene).getPropertyValue(n)) || f;
  const engine = Liquid.create({
    stage, scene,
    center: () => ({ x: scene.clientWidth * cssNum("--cx", 50) / 100, y: scene.clientHeight * cssNum("--cy", 52) / 100 })
  });
  const placeItems = () => {
    const R = cssNum("--R", 23);
    engine.setItems(slots.map((el, i) => {
      const a = (-135 + i * (360 / ITEMS.length)) * Math.PI / 180;
      return { el, id: ITEMS[i].id, bx: Math.cos(a) * R, by: Math.sin(a) * R, delay: 40 + i * 70 };
    }));
  };
  placeItems();
  matchMedia("(max-width: 760px)").addEventListener("change", placeItems);

  // ---------- Escala: local (0) → planetária (1) ----------
  function applyZoom(t) {
    // o planeta encolhe e sobe para o centro; o bicho e o chão somem fora da escala local
    const size = 175 - 145 * t;              // cqi
    const cy = 128 - 76 * t;                 // % da altura
    scene.style.setProperty("--ps", fmt(size));
    scene.style.setProperty("--pcy", fmt(cy));
    scene.style.setProperty("--t", fmt(t));
    const planetary = t > 0.62;
    scaleLabel.textContent = t < 0.35 ? "Escala local" : planetary ? "Escala planetária" : "Afastando…";
    if (planetary !== menuOpen) {
      menuOpen = planetary;
      stage.dataset.fan = planetary ? "open" : "closed";
      planetary ? engine.open() : engine.close();
      fan.inert = !planetary;
      if (!planetary) closeSheet();
      say(planetary ? "Menu do planeta aberto · toque numa gota" : "Toques no mundo ligados");
    }
  }

  // ---------- Folha de vidro ----------
  const chip = (res, have, need) => {
    const [label, c1, c2] = RES[res];
    const ok = have >= need;
    return `<span class="res ${ok ? "ok" : "short"}" style="--c1:${c1};--c2:${c2}"><i aria-hidden="true"></i><b>${Math.min(have, need)}/${need}</b> ${label}</span>`;
  };

  const VIEWS = {
    receitas: () => `<ul class="recipes">${RECIPES.map((r) => {
      const ready = Object.entries(r.need).every(([k, n]) => INV[k] >= n);
      const state = r.done ? "feita" : r.wait ? "espera" : ready ? "pronta" : "falta";
      const tag = { feita: "Feita", espera: "Em espera", pronta: "Dá para fazer", falta: "Falta material" }[state];
      return `<li data-state="${state}"><div><strong>${r.name}</strong><span>${r.note}</span></div><div class="chips">${Object.entries(r.need).map(([k, n]) => chip(k, r.done ? n : INV[k], n)).join("")}</div><em>${tag}</em></li>`;
    }).join("")}</ul><p class="sheet-note">Exemplo com 3 fibras e 1 pedra. As receitas usam os valores de teste do briefing.</p>`,
    colecao: () => `<ul class="dex">${CREATURES.map((c) => `<li class="${c.owned ? "owned" : "unknown"}" style="--c1:${c.hue[0]};--c2:${c.hue[1]}"><i class="slot" aria-hidden="true"></i><strong>${c.name}</strong><span>${c.hint}</span></li>`).join("")}</ul><p class="sheet-note">1 de 6 espécies. Como mostrar um bicho não descoberto ainda é uma decisão aberta (A06). Aqui o teste é silhueta em gota mais uma pista.</p>`,
    som: () => `<div class="toggles">${[["Música", true], ["Efeitos", true], ["Vibração nas coletas", true], ["Legendas de som", false]].map(([l, on], i) => `<label class="toggle"><span>${l}</span><input type="checkbox" id="snd-${i}" ${on ? "checked" : ""}><i aria-hidden="true"></i></label>`).join("")}</div><p class="sheet-note">Legendas de som é uma hipótese para a leitura sem áudio, como o choro do Brotinho.</p>`,
    ajustes: () => `<div class="toggles">${[["Movimento reduzido", false], ["Texto maior", false], ["Dicas explícitas", true]].map(([l, on], i) => `<label class="toggle"><span>${l}</span><input type="checkbox" id="adj-${i}" ${on ? "checked" : ""}><i aria-hidden="true"></i></label>`).join("")}</div><p class="sheet-note">No jogo, esta gota hoje é o Debug. Ajustes é a proposta para a versão de jogador.</p>`
  };

  function openSheet(item) {
    if (active === item.id) { closeSheet(); return; }
    active = item.id;
    fan.querySelectorAll(".fan-item").forEach((b) => {
      b.dataset.state = b.dataset.id === item.id ? "aceito" : "ok";
      b.setAttribute("aria-expanded", String(b.dataset.id === item.id));
    });
    sheet.style.setProperty("--c1", item.hue[0]);
    sheet.style.setProperty("--c2", item.hue[1]);
    sheetTitle.textContent = item.label;
    sheetBody.innerHTML = VIEWS[item.id]();
    sheetBody.querySelectorAll("li, .toggle").forEach((el, i) => el.style.setProperty("--i", i));
    stage.dataset.sheet = "open";
    sheet.hidden = false;
    sheet.classList.remove("in"); void sheet.offsetWidth; sheet.classList.add("in");
    say(`${item.label} aberto`);
  }

  function closeSheet() {
    if (!active) return;
    active = null;
    fan.querySelectorAll(".fan-item").forEach((b) => { b.dataset.state = "ok"; b.setAttribute("aria-expanded", "false"); });
    delete stage.dataset.sheet;
    sheet.classList.remove("in");
    setTimeout(() => { if (!active) sheet.hidden = true; }, reduceMotion.matches ? 0 : 260);
  }

  sheet.querySelector(".sheet-close").addEventListener("click", (e) => { e.stopPropagation(); closeSheet(); });
  sheet.addEventListener("click", (e) => e.stopPropagation());
  stage.addEventListener("click", () => { closeSheet(); });
  stage.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // pinça simulada: roda do mouse ou trackpad sobre o palco, o controle deslizante e os botões
  zoom.addEventListener("input", () => applyZoom(zoom.value / 100));
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoom.value = Math.max(0, Math.min(100, +zoom.value + e.deltaY * 0.25));
    applyZoom(zoom.value / 100);
  }, { passive: false });
  const animateTo = (target) => {
    const from = +zoom.value, t0 = performance.now(), dur = reduceMotion.matches ? 1 : 900;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      zoom.value = from + (target - from) * e;
      applyZoom(zoom.value / 100);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  root.querySelector("#planet-out").addEventListener("click", () => animateTo(100));
  root.querySelector("#planet-in").addEventListener("click", () => animateTo(0));

  fan.inert = true;
  applyZoom(0);
})();
