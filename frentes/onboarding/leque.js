// Rodada 03 · ring em leque.
// Simulação abstrata do ring contextual do jogo: tocar no bicho = observar + leque acima dele.
// Ações, custos e textos espelham o briefing e o hub do time (valores de teste). Não são decisões de UI.
(() => {
  const root = document.querySelector("#leque");
  if (!root) return;

  const stage = root.querySelector(".leque-stage");
  const scene = root.querySelector(".leque-scene");
  const fan = root.querySelector(".fan");
  const critter = root.querySelector(".critter");
  const target = root.querySelector(".target");
  const recipe = root.querySelector(".recipe");
  const chip = root.querySelector(".task-chip");
  const prog = root.querySelector(".prog");
  const status = root.querySelector("#leque-status");
  const inv = root.querySelector(".inventory");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const ICONS = window.ECO_ICONS;   // rodada 08: ícones de pincel (icons.js)

  // Valores de teste do briefing (p.3).
  const NEEDS = {
    construir: { fibra: 2, pedra: 2 },
    canal: { fibra: 1, pedra: 1 },
    plantar: { semente: 1 }
  };
  const RES = { fibra: "fibra", pedra: "pedra", semente: "semente" };

  const fresh = () => ({
    inv: { fibra: 0, pedra: 0, semente: 0 },
    flor: "flor",          // flor → fruto (recolhível)
    rocha: "rocha",        // rocha → pedras (recolhível)
    travessia: "vao",      // vão → passarela
    canteiro: { plantado: false, irrigado: false }
  });
  let world = fresh();
  let current = "flor";
  let open = false;
  let busy = null;
  let raf = 0;
  let hintTimer = 0;

  function actionsFor(key) {
    const list = [{ id: "carinho", label: "Carinho", verb: "Carinho", dur: 700 }];
    if (key === "flor" && world.flor === "flor") list.push({ id: "polinizar", label: "Polinizar", verb: "Polinizando", dur: 2200 });
    if (key === "rocha" && world.rocha === "rocha") list.push({ id: "minerar", label: "Minerar", verb: "Minerando", dur: 2000 });
    if (key === "travessia" && world.travessia === "vao") list.push({ id: "construir", label: "Construir", verb: "Construindo", dur: 2400 });
    if (key === "canteiro") {
      if (!world.canteiro.plantado) list.push({ id: "plantar", label: "Plantar", verb: "Plantando", dur: 1600 });
      if (!world.canteiro.irrigado) list.push({ id: "canal", label: "Canal", verb: "Cavando canal", dur: 2200 });
    }
    return list;
  }

  const missing = (id) => {
    const need = NEEDS[id];
    if (!need) return [];
    return Object.entries(need).filter(([r, n]) => world.inv[r] < n).map(([r, n]) => ({ r, n, have: world.inv[r] }));
  };

  const missingText = (m) => m.map(({ r, n, have }) => `${n - have} ${RES[r]}`).join(" + ");

  function say(text) { status.textContent = text; }

  // ---------- Inventário ----------
  function renderInv(bump) {
    for (const key of Object.keys(world.inv)) {
      const el = inv.querySelector(`[data-res=${key}]`);
      el.querySelector("b").textContent = world.inv[key];
      if (bump && bump.includes(key) && !reduceMotion.matches) {
        el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
      }
    }
  }

  // ---------- Alvo ----------
  function targetState() {
    if (current === "canteiro") {
      const c = world.canteiro;
      return c.plantado && c.irrigado ? "muda" : c.irrigado ? "irrigado" : c.plantado ? "plantado" : "seco";
    }
    return world[current];
  }
  const TARGET_LABEL = {
    flor: "flor", fruto: "fruto maduro", rocha: "rocha macia", pedras: "pedras soltas",
    vao: "vão", passarela: "passarela", seco: "canteiro seco", plantado: "semente no solo seco",
    irrigado: "canteiro irrigado", muda: "muda irrigada"
  };
  function renderTarget() {
    const s = targetState();
    target.dataset.kind = current;
    target.dataset.state = s;
    target.querySelector(".target-label").textContent = TARGET_LABEL[s];
    const collectible = s === "fruto" || s === "pedras";
    target.classList.toggle("collectible", collectible);
    target.setAttribute("aria-label", collectible ? `Recolher ${TARGET_LABEL[s]}` : TARGET_LABEL[s]);
  }

  // ---------- Receita no ponto de uso ----------
  const RECIPE_TITLE = { construir: "Passarela", canal: "Canal", plantar: "Plantar" };
  function recipeFor(id) {
    if (id && NEEDS[id]) return { title: RECIPE_TITLE[id], need: NEEDS[id] };
    if (current === "travessia" && world.travessia === "vao") return { title: "Passarela", need: NEEDS.construir };
    if (current === "canteiro" && !world.canteiro.irrigado) return { title: "Canal", need: NEEDS.canal };
    if (current === "canteiro" && !world.canteiro.plantado) return { title: "Plantar", need: NEEDS.plantar };
    return null;
  }
  function renderRecipe(show, id) {
    const r = recipeFor(id);
    if (!r || !show) { recipe.hidden = true; return; }
    recipe.hidden = false;
    recipe.innerHTML = `<strong>${r.title}</strong>` + Object.entries(r.need).map(([res, n]) => {
      const have = Math.min(world.inv[res], n);
      const ok = have >= n;
      return `<span class="${ok ? "ok" : "short"}"><i aria-hidden="true">${ok ? "✓" : "○"}</i>${have}/${n} ${RES[res]}</span>`;
    }).join("");
  }

  // ---------- Leque ----------
  // Cores de cada ação. Paleta de estudo tirada das refs (gotas de cor, halos).
  const HUES = {   // cores quentes por ação (identidade por cor e por forma)
    carinho:   ["#ffc2a8", "#ff5f7e"],
    polinizar: ["#fff0a0", "#ff9f43"],
    minerar:   ["#ffcf8a", "#e8572a"],
    construir: ["#d6f5b0", "#4fb06d"],
    plantar:   ["#f2ff9e", "#5fcf4a"],
    canal:     ["#c9e6ff", "#6a7bff"]
  };
  const cssNum = (name, fallback) => parseFloat(getComputedStyle(scene).getPropertyValue(name)) || fallback;

  // Anel de vidro (rodada 05): bolhas orgânicas em arco acima do bicho, ligadas a um motor de molas.
  const engine = Liquid.create({
    stage, scene,
    center: () => ({ x: scene.clientWidth * cssNum("--cx", 36) / 100, y: scene.clientHeight * cssNum("--cy", 74) / 100 })
  });

  function geometry(n) {
    const R = cssNum("--R", 17);
    const step = 360 / Math.max(n, 5);
    const start = -90 - (step * (n - 1)) / 2;
    return Array.from({ length: n }, (_, i) => {
      const a = (start + i * step) * Math.PI / 180;
      return [Math.cos(a) * R, Math.sin(a) * R];
    });
  }

  function layoutFan(list) {
    fan.innerHTML = "";
    const pos = geometry(list.length);
    const items = list.map((a, i) => {
      const m = missing(a.id);
      const [c1, c2] = HUES[a.id];
      const slot = document.createElement("div");
      slot.className = "fan-slot";
      slot.dataset.id = a.id;
      slot.style.setProperty("--c1", c1);
      slot.style.setProperty("--c2", c2);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fan-item";
      b.dataset.state = m.length ? "falta" : "ok";
      b.dataset.id = a.id;
      b.setAttribute("aria-label", m.length ? `${a.label}, falta ${missingText(m)}` : a.label);
      b.innerHTML = `<i class="drop" aria-hidden="true"><i class="caustic"></i><i class="rim"></i></i>` +
        `<span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32">${ICONS[a.id]}</svg></span>` +
        `<span class="tip" aria-hidden="true">${a.label}</span>` +
        (m.length ? `<em class="short" aria-hidden="true">−${m.reduce((t, x) => t + x.n - x.have, 0)}</em>` : "");
      b.addEventListener("click", (e) => { e.stopPropagation(); choose(a, b); });
      const hot = () => { if (!busy) say(m.length ? `${a.label} · falta ${missingText(m)}` : a.label); };
      b.addEventListener("pointerenter", hot);
      b.addEventListener("focus", hot);
      slot.append(b);
      fan.append(slot);
      return { el: slot, id: a.id, bx: pos[i][0], by: pos[i][1], delay: 60 + i * 55 };
    });
    engine.setItems(items);
  }

  function setOpen(next) {
    open = next;
    stage.dataset.open = String(next);
    critter.setAttribute("aria-expanded", String(next));
    fan.inert = !next;
    renderRecipe(next);
    if (next) {
      delete stage.dataset.chosen;
      layoutFan(actionsFor(current));
      if (!reduceMotion.matches) { critter.classList.remove("gulp"); void critter.offsetWidth; critter.classList.add("gulp"); }
      stage.dataset.fan = "open";
      engine.open();
    } else {
      stage.dataset.fan = "closed";
      engine.close();
    }
  }

  function observe(on) {
    stage.dataset.observing = String(on);
  }

  // Anéis concêntricos (ref.: halos do mapa de cheiros) num ponto da cena.
  function halo(x, y, color) {
    if (reduceMotion.matches) return;
    for (let k = 0; k < 3; k++) {
      const h = document.createElement("i");
      h.className = "halo";
      h.style.left = x + "px";
      h.style.top = y + "px";
      h.style.setProperty("--hc", color);
      h.style.animationDelay = k * 110 + "ms";
      scene.append(h);
      h.addEventListener("animationend", () => h.remove());
    }
  }

  function choose(action, button) {
    const m = missing(action.id);
    if (m.length) {
      button.classList.remove("shake"); void button.offsetWidth; button.classList.add("shake");
      renderRecipe(true, action.id);
      recipe.classList.remove("flash"); void recipe.offsetWidth; recipe.classList.add("flash");
      say(`${action.label} indisponível · falta ${missingText(m)}`);
      return;
    }
    // aceito: a bolha incha, as outras voltam ao bicho, a escolhida cai nele e respinga
    stage.dataset.chosen = action.id;
    button.dataset.state = "aceito";
    engine.accept(action.id);
    for (const [r, n] of Object.entries(NEEDS[action.id] || {})) world.inv[r] -= n;
    renderInv();
    say(`${action.label} · comando aceito`);
    const cb = critter.getBoundingClientRect(), sb = scene.getBoundingClientRect();
    const later = (ms, fn) => setTimeout(fn, reduceMotion.matches ? 0 : ms);
    later(520, () => halo(cb.left + cb.width / 2 - sb.left, cb.top + cb.height * .35 - sb.top, HUES[action.id][1]));
    later(520, () => { critter.classList.remove("gulp"); void critter.offsetWidth; critter.classList.add("gulp"); });
    later(600, () => { setOpen(false); run(action); });
  }

  function pulse(el) {
    if (reduceMotion.matches) return;
    const r = document.createElement("i");
    r.className = "echo";
    el.append(r);
    r.addEventListener("animationend", () => r.remove());
  }

  // ---------- Tarefa em andamento ----------
  function run(action) {
    busy = action;
    stage.dataset.busy = "true";
    if (action.id === "carinho") critter.classList.add("hop");
    const [pc1, pc2] = HUES[action.id];
    stage.style.setProperty("--pc1", pc1);
    stage.style.setProperty("--pc2", pc2);
    prog.classList.remove("done");
    const t0 = performance.now();
    const dur = reduceMotion.matches ? 300 : action.dur;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      // suaviza o fim: desacelera perto de 100% para o anel "assentar"
      const e = p < 1 ? 1 - Math.pow(1 - p, 1.6) : 1;
      critter.style.setProperty("--p", e.toFixed(4));
      chip.textContent = action.id === "carinho" ? "♥" : `${action.verb} ${Math.round(p * 100)}%`;
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      finish(action);
    };
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function finish(action) {
    busy = null;
    stage.dataset.busy = "false";
    critter.classList.remove("hop");
    // conclusão: o anel fecha, floresce para fora e respinga na cor da ação
    if (!reduceMotion.matches) {
      prog.classList.add("done");
      const cb = critter.getBoundingClientRect(), sb = scene.getBoundingClientRect();
      halo(cb.left + cb.width / 2 - sb.left, cb.top + cb.height / 2 - sb.top, HUES[action.id][1]);
      setTimeout(() => { prog.classList.remove("done"); critter.style.setProperty("--p", "0"); }, 700);
    } else critter.style.setProperty("--p", "0");
    switch (action.id) {
      case "polinizar": world.flor = "fruto"; say("A flor deu fruto · toque no fruto para recolher"); break;
      case "minerar": world.rocha = "pedras"; say("Pedras soltas · toque para recolher"); break;
      case "construir": world.travessia = "passarela"; say("Passarela pronta · o vale abre"); break;
      case "plantar": world.canteiro.plantado = true; say(world.canteiro.irrigado ? "Muda irrigada" : "Semente no solo seco · falta água"); break;
      case "canal": world.canteiro.irrigado = true; say("A água chega ao canteiro"); break;
      default: say("Carinho · o bichinho responde");
    }
    renderTarget();
    if (action.id !== "carinho") { target.classList.remove("changed"); void target.offsetWidth; target.classList.add("changed"); }
  }

  // ---------- Recolher por toque ----------
  function collect() {
    const s = targetState();
    let gain;
    if (s === "fruto") { gain = { fibra: 2, semente: 1 }; world.flor = "flor"; }
    else if (s === "pedras") { gain = { pedra: 2 }; world.rocha = "rocha"; }
    else {
      renderRecipe(true);
      say(recipeFor() ? "Receita no ponto de uso · toque no bichinho para mandar" : "Toque no bichinho para mandar");
      return;
    }
    for (const [r, n] of Object.entries(gain)) world.inv[r] += n;
    floatText(Object.entries(gain).map(([r, n]) => `+${n} ${RES[r]}`).join("  "));
    renderInv(Object.keys(gain));
    renderTarget();
    say("Recolhido · " + Object.entries(gain).map(([r, n]) => `${n} ${RES[r]}`).join(" e "));
    if (open) setOpen(true);
  }

  function floatText(text) {
    const f = document.createElement("span");
    f.className = "float-gain";
    f.textContent = text;
    scene.append(f);
    setTimeout(() => f.remove(), reduceMotion.matches ? 900 : 1400);
  }

  // ---------- Eventos ----------
  critter.addEventListener("click", (e) => {
    e.stopPropagation();
    observe(true);
    if (busy) { say(`${busy.verb}… o bichinho está ocupado`); return; }
    setOpen(!open);
    say(open ? "Observando · leque aberto" : "Observando");
  });

  target.addEventListener("click", (e) => { e.stopPropagation(); collect(); });

  stage.addEventListener("click", () => {
    if (open) setOpen(false);
    observe(false);
    recipe.hidden = true;
    say(busy ? `${busy.verb}…` : "Toque no bichinho");
  });

  stage.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); critter.focus(); }
  });

  root.querySelectorAll(".scenes button").forEach((b) => b.addEventListener("click", () => {
    if (busy) { cancelAnimationFrame(raf); finish(busy); }
    current = b.dataset.scene;
    root.querySelectorAll(".scenes button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    setOpen(false);
    observe(false);
    renderTarget();
    say("Toque no bichinho");
  }));

  root.querySelector("#leque-reset").addEventListener("click", () => {
    cancelAnimationFrame(raf);
    busy = null; stage.dataset.busy = "false";
    world = fresh();
    setOpen(false); observe(false);
    renderInv(); renderTarget();
    say("Recomeçado · toque no bichinho");
  });

  fan.inert = true;
  renderInv();
  renderTarget();
})();
