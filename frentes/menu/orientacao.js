// Rodada 07 · abertura: eco, pistas em níveis e a gota da árvore.
// Lucas: "não é uma seta, é um eco" — a orientação é um eco sonoro desenhado: ondas que nascem
// do Brotinho (mesmo fora da tela) e ficam mais fortes, mais frequentes e mais quentes quanto mais
// perto a câmera está. Funciona sem som. Briefing 0:00–1:30: encontrar pelo choro, tocar na árvore,
// a gota cai e acalma o Brotinho. Pistas sobem de nível se o jogador demora (hierarquia de pistas).
(() => {
  const root = document.querySelector("#orientacao");
  if (!root) return;
  const stage = root.querySelector(".ori-stage");
  const scene = root.querySelector(".ori-scene");
  const world = root.querySelector(".ori-world");
  const pet = root.querySelector(".ori-pet");
  const tree = root.querySelector(".ori-tree-main");
  const fruit = root.querySelector(".ori-fruit");
  const bubble = root.querySelector(".ori-pointer");
  const hint = root.querySelector(".ori-hint");
  const tag = root.querySelector(".eco-tag");
  const status = root.querySelector("#ori-status");
  const levelOut = root.querySelector("#ori-level");
  const inv = root.querySelector(".ori-inv");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const say = (t) => { status.textContent = t; };

  Liquid.create({ stage, scene, center: () => ({ x: scene.clientWidth / 2, y: scene.clientHeight / 2 }) }).setItems([]);

  // mundo: 3 telas de largura. Brotinho e árvore fora de vista, à direita.
  const PET = { x: 2.38, y: .64 }, TREE = { x: 2.16, y: .5 }, FRUIT = { x: 2.56, y: .66 };
  const place = (el, p) => { el.style.left = p.x * 100 / 3 + "%"; el.style.top = p.y * 100 + "%"; };
  place(pet, PET); place(tree, TREE); place(fruit, FRUIT);

  // ---------- pistas: três níveis por etapa ----------
  // nível 0 = só o mundo (eco fraco, brilho sutil); 1 = reforço visual; 2 = instrução explícita
  const INSIST = { sutil: [12, 24], padrao: [6, 12], explicita: [0, 3] };
  let insist = "padrao";
  const STEPS = {
    buscar: { texts: ["", "", "Siga o eco até o Brotinho"], label: "Encontrar" },
    arvore: { texts: ["", "", "Toque na árvore para soltar uma gota"], label: "Gota" },
    colher: { texts: ["", "", "Toque no fruto para recolher"], label: "Coletar" },
    fim: { texts: ["", "", ""], label: "Pronto" }
  };
  let step = "buscar", stepAt = performance.now(), level = 0;
  const setStep = (s) => { step = s; stepAt = performance.now(); level = -1; stage.dataset.step = s; };
  setStep("buscar");

  root.querySelectorAll(".insist button").forEach((b) => b.addEventListener("click", () => {
    insist = b.dataset.insist;
    root.querySelectorAll(".insist button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    stepAt = performance.now(); level = -1;
  }));

  // ---------- câmera ----------
  const cam = { x: 0, vx: 0, tx: null };
  const W = () => scene.clientWidth, H = () => scene.clientHeight;
  let drag = null;
  scene.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    drag = { x: e.clientX, cx: cam.x, t: performance.now() };
    cam.tx = null; scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const nx = drag.cx - (e.clientX - drag.x);
    cam.vx = (nx - cam.x) / Math.max(1, performance.now() - drag.t) * 16;
    drag.t = performance.now(); cam.x = nx;
  });
  const endDrag = () => { drag = null; };
  scene.addEventListener("pointerup", endDrag);
  scene.addEventListener("pointercancel", endDrag);

  bubble.addEventListener("click", (e) => { e.stopPropagation(); cam.tx = PET.x * W() - W() / 2; say("Indo até o eco"); });

  // ---------- Brotinho, árvore, gota, fruto ----------
  let calm = false;
  pet.addEventListener("click", (e) => {
    e.stopPropagation();
    if (calm) { say("O Brotinho está calmo"); return; }
    pet.classList.remove("sob-shake"); void pet.offsetWidth; pet.classList.add("sob-shake");
    say("Ele chora por água · a árvore está logo ali");
    // tocar no bicho chorando é sinal de dúvida: a pista sobe direto para o nível 1
    if (step === "arvore") stepAt = Math.min(stepAt, performance.now() - INSIST[insist][0] * 1000);
  });
  tree.addEventListener("click", (e) => {
    e.stopPropagation();
    if (step !== "arvore" && step !== "buscar") return;
    tree.classList.remove("shake"); void tree.offsetWidth; tree.classList.add("shake");
    dropWater();
  });
  function dropWater() {
    if (calm) return;
    const sb = scene.getBoundingClientRect();
    const t = tree.getBoundingClientRect(), p = pet.getBoundingClientRect();
    const d = document.createElement("i");
    d.className = "water-drop";
    scene.append(d);
    const x0 = t.left + t.width * .6 - sb.left, y0 = t.top + t.height * .05 - sb.top;
    const x1 = p.left + p.width / 2 - sb.left, y1 = p.top + p.height * .12 - sb.top;
    const t0 = performance.now(), dur = reduce.matches ? 1 : 950;
    const stepFn = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      // pendura um pouco na folha, depois cai com gravidade em leve arco
      const hang = Math.min(1, k / .25), fall = Math.max(0, (k - .25) / .75);
      const x = x0 + (x1 - x0) * fall;
      const y = y0 + 6 * hang + (y1 - y0) * fall * fall;
      const sx = 1 - fall * .2, sy = 1 + fall * .35;          // estica caindo
      d.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${sx}, ${sy})`;
      d.style.opacity = String(Math.min(1, k * 6));
      if (k < 1) { requestAnimationFrame(stepFn); return; }
      d.remove();
      splash(x1, y1);
      calm = true; stage.dataset.calm = "true";
      say("A gota acalmou o Brotinho · um fruto amadureceu");
      setTimeout(() => { fruit.hidden = false; setStep("colher"); }, reduce.matches ? 0 : 500);
    };
    requestAnimationFrame(stepFn);
  }
  function splash(x, y) {
    if (reduce.matches) return;
    for (let k = 0; k < 3; k++) {
      const h = document.createElement("i");
      h.className = "halo"; h.style.left = x + "px"; h.style.top = y + "px";
      h.style.setProperty("--hc", k ? "#9fd6ff" : "#ffffff"); h.style.animationDelay = k * 100 + "ms";
      scene.append(h); h.addEventListener("animationend", () => h.remove());
    }
  }
  let gotFruit = false;
  fruit.addEventListener("click", (e) => {
    e.stopPropagation();
    if (gotFruit) return;
    gotFruit = true;
    fruit.classList.add("taken");
    fly(fruit, "fibra", "+2 fibra", 2, 0);
    fly(fruit, "semente", "+1 semente", 1, 140);
    say("Recolhido · 2 fibra e 1 semente");
    setStep("fim");
    setTimeout(() => { fruit.hidden = true; fruit.classList.remove("taken"); }, 1400);
  });
  root.querySelector("#ori-reset").addEventListener("click", () => {
    calm = false; gotFruit = false; stage.dataset.calm = "false"; fruit.hidden = true;
    cam.x = 0; cam.vx = 0; cam.tx = null;
    inv.querySelectorAll("b").forEach((b) => { b.textContent = "0"; });
    setStep("buscar");
    say("Arraste o palco para olhar em volta");
  });

  function fly(from, res, text, n, delay) {
    const sb = scene.getBoundingClientRect(), a = from.getBoundingClientRect();
    const slot = inv.querySelector(`[data-res=${res}]`), b = slot.getBoundingClientRect();
    const p = document.createElement("span");
    p.className = "fly-pill"; p.textContent = text; scene.append(p);
    const x0 = a.left + a.width / 2 - sb.left, y0 = a.top - sb.top;
    const x1 = b.left + b.width / 2 - sb.left, y1 = b.top + b.height / 2 - sb.top;
    const dur = reduce.matches ? 1 : 900;
    setTimeout(() => {
      const t0 = performance.now();
      const stepFn = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const rise = Math.min(1, k / .3), go = Math.max(0, (k - .3) / .7);
        const e = go < .5 ? 4 * go * go * go : 1 - Math.pow(-2 * go + 2, 3) / 2;
        const x = x0 + (x1 - x0) * e;
        const y = y0 - 26 * (1 - Math.pow(1 - rise, 3)) + (y1 - (y0 - 26)) * e - Math.sin(e * Math.PI) * 50;
        p.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 - e * .55})`;
        p.style.opacity = String(k < .9 ? 1 : (1 - k) * 10);
        if (k < 1) { requestAnimationFrame(stepFn); return; }
        p.remove();
        const val = slot.querySelector("b"); val.textContent = String(+val.textContent + n);
        slot.classList.remove("bump"); void slot.offsetWidth; slot.classList.add("bump");
      };
      requestAnimationFrame(stepFn);
    }, delay);
  }

  // ---------- eco ----------
  // Ícone compacto (ponto + três arcos) que treme enquanto o Brotinho chora.
  // Fora da tela: preso na borda, do lado dele, com os arcos abrindo para dentro da tela.
  // Na tela: flutua sobre a cabeça dele. Perto = treme mais forte e mais rápido, e os arcos pulsam mais vezes.
  let lastPulse = 0;
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(.034, (now - last) / 1000); last = now;
    const maxX = W() * 2;
    if (cam.tx != null) {
      const a = -90 * (cam.x - cam.tx) - 16 * cam.vx;
      cam.vx += a * dt; cam.x += cam.vx * dt;
      if (Math.abs(cam.x - cam.tx) < .5 && Math.abs(cam.vx) < 2) { cam.x = cam.tx; cam.tx = null; cam.vx = 0; }
    } else if (!drag) { cam.x += cam.vx; cam.vx *= .92; }
    cam.x = Math.max(0, Math.min(maxX, cam.x));
    world.style.transform = `translate(${-cam.x}px, 0)`;

    const px = PET.x * W() - cam.x, py = PET.y * H();
    const cx = W() / 2, cy = H() / 2, dx = px - cx, dy = py - cy;
    const dist = Math.hypot(dx, dy) / W();
    const near = Math.max(0, Math.min(1, 1.55 - dist));      // 0 longe … 1 em cima
    const onScreen = px > W() * .08 && px < W() * .92;
    scene.style.setProperty("--near", near.toFixed(3));
    stage.dataset.off = String(!onScreen);

    // etapa e nível de pista
    if (step === "buscar" && onScreen) { setStep("arvore"); say("Achou · ele chora por água"); }
    const [t1, t2] = INSIST[insist];
    const idle = (now - stepAt) / 1000;
    const lv = idle >= t2 ? 2 : idle >= t1 ? 1 : 0;
    if (lv !== level) {
      level = lv;
      stage.dataset.level = String(lv);
      levelOut.textContent = `${STEPS[step].label} · pista ${lv}`;
      const txt = STEPS[step].texts[lv];
      hint.textContent = txt; hint.hidden = !txt;
    }

    // vibração e pulso do ícone (só enquanto ele chora)
    const crying = !calm;
    const boost = step === "buscar" ? [1, 1.2, 1.35][level] : 1;
    const amp = (0.8 + 2.6 * near) * boost;                   // px de tremor
    const vib = 0.16 - 0.07 * near;                           // s por ciclo de tremor
    const interval = 1.5 - 0.95 * near;                       // s entre pulsos dos arcos
    for (const el of [bubble, tag]) {
      el.style.setProperty("--amp", amp.toFixed(2) + "px");
      el.style.setProperty("--vib", vib.toFixed(3) + "s");
      el.style.setProperty("--pulse", interval.toFixed(2) + "s");
      el.style.setProperty("--near", near.toFixed(2));
    }
    stage.dataset.crying = String(crying);
    if (crying && !reduce.matches && now - lastPulse > interval * 1000) {
      lastPulse = now;
      for (const el of [bubble, tag]) { el.classList.remove("ping"); void el.offsetWidth; el.classList.add("ping"); }
      pet.classList.remove("ping"); void pet.offsetWidth; pet.classList.add("ping");
    }

    // bolha da borda (nível ≥ 1 na busca): presa na borda, na direção do eco
    if (!onScreen) {
      const margin = Math.min(W(), H()) * .12;
      const sx = (W() / 2 - margin) / Math.abs(dx || 1e-6), sy = (H() / 2 - margin) / Math.abs(dy || 1e-6);
      const s = Math.min(sx, sy);
      bubble.style.setProperty("--px", (cx + dx * s).toFixed(1) + "px");
      bubble.style.setProperty("--py", (cy + dy * s).toFixed(1) + "px");
      bubble.setAttribute("aria-label", `Eco do Brotinho ${dx > 0 ? "à direita" : "à esquerda"}. Tocar para ir até ele`);
      // ponto do lado do Brotinho, arcos abrindo para dentro da tela
      bubble.style.setProperty("--ang", (Math.atan2(-dy, -dx) * 180 / Math.PI).toFixed(1) + "deg");
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
