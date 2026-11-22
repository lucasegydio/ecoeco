// Guia de linguagem: monta bolhas reais (mesma estrutura do leque.js) e liga o motor líquido.
(() => {
  const I = ECO_ICONS;
  const HUES = { carinho: ["#ffc2a8", "#ff5f7e"], polinizar: ["#fff0a0", "#ff9f43"], minerar: ["#ffcf8a", "#e8572a"], construir: ["#d6f5b0", "#4fb06d"], plantar: ["#f2ff9e", "#5fcf4a"], canal: ["#c9e6ff", "#6a7bff"] };
  const mob = () => matchMedia("(max-width:760px)").matches;
  const grid = (n, cols, sp, rows = Math.ceil(n / cols)) => Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
    return [(c - (inRow - 1) / 2) * sp, (r - (rows - 1) / 2) * sp * 1.25];
  });
  function stage(name, list, opts = {}) {
    const st = document.querySelector(`[data-demo=${name}]`), scene = st.querySelector(".leque-scene"), fan = st.querySelector(".fan");
    const ctr = opts.center || ((W, H) => ({ x: W / 2, y: H / 2 }));
    const eng = Liquid.create({ stage: st, scene, center: () => ctr(scene.clientWidth, scene.clientHeight) });
    const place = () => {
      fan.innerHTML = "";
      const sp = mob() ? 19 : 17, pos = opts.pos(list.length, sp);
      const items = list.map((a, i) => {
        const [c1, c2] = a.hue || HUES[a.id] || ["#ffc2a8", "#ff5f7e"];
        const slot = document.createElement("div"); slot.className = "fan-slot"; slot.dataset.id = a.id;
        slot.style.setProperty("--c1", c1); slot.style.setProperty("--c2", c2);
        if (a.s) slot.style.setProperty("--S", a.s * (mob() ? 1.45 : 1));
        const b = document.createElement("button"); b.type = "button"; b.className = "fan-item" + (a.press ? " press" : "");
        b.dataset.state = a.state || "ok"; b.setAttribute("aria-label", a.label);
        b.innerHTML = `<i class="drop" aria-hidden="true"><i class="caustic"></i><i class="rim"></i></i><span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32">${I[a.icon || a.id] || ""}</svg></span>` +
          (a.short ? `<em class="short" aria-hidden="true">−${a.short}</em>` : "") + (a.state === "bloqueado" ? '<i class="lock" aria-hidden="true"></i>' : "");
        slot.append(b);
        if (a.cap !== false) { const c = document.createElement("span"); c.className = "cap"; c.innerHTML = a.label + (a.sub ? `<small>${a.sub}</small>` : ""); slot.append(c); }
        fan.append(slot);
        if (opts.onPick) b.addEventListener("click", () => opts.onPick(a, eng));
        return { el: slot, id: a.id, bx: pos[i][0], by: pos[i][1], delay: 60 + i * 55 };
      });
      eng.setItems(items); eng.open();
    };
    place(); let m = mob(); addEventListener("resize", () => { if (mob() !== m) { m = mob(); place(); } });
    return eng;
  }
  const row = (n, sp) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * sp, 0]);

  // 1 paleta: três luzes + seis pares de ação (todas como bolhas)
  const luz = [["ambar", "Âmbar", "#ffb36b", "#ffb36b", "#ffe0b8"], ["coral", "Coral", "#ff5f9e", "#ff5f9e", "#ffc2dc"], ["lilas", "Lilás", "#b58cff", "#b58cff", "#e2d2ff"]];
  stage("paleta", luz.map(([id, label, , c2, c1]) => ({ id, label, sub: c2, icon: "eco", hue: [c1, c2] })), { pos: (n, sp) => row(n, sp * 1.2) });
  const toks = [["Âmbar", "#ffb36b"], ["Coral", "#ff5f9e"], ["Lilás", "#b58cff"], ["Noite", "#202130"], ["Noite 2", "#282939"], ...Object.entries(HUES).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), v[1]])];
  document.getElementById("tokens").innerHTML = toks.map(([n, h]) => `<div class="tok"><i style="background:${h}"></i><span>${n}<code>${h}</code></span></div>`).join("");

  // 2 estados
  stage("estados", [
    { id: "plantar", label: "Normal", icon: "plantar" },
    { id: "plantar", label: "Foco", icon: "plantar", press: true },
    { id: "plantar", label: "Selecionado", icon: "plantar", state: "aceito" },
    { id: "plantar", label: "Vazado", sub: "sem material", icon: "plantar", state: "falta", short: 2 },
    { id: "plantar", label: "Bloqueado", icon: "plantar", state: "bloqueado" }
  ].map((a, i) => ({ ...a, id: "e" + i })), { pos: (n, sp) => row(n, sp) });

  // 3 formas: pequena, média, grande
  stage("formas", [
    { id: "f1", label: "Apoio", sub: "7", icon: "som", s: 7, hue: HUES.canal }, { id: "f2", label: "Ação", sub: "11", icon: "construir", hue: HUES.construir },
    { id: "f3", label: "Escolha", sub: "16", icon: "polinizar", s: 16, hue: HUES.polinizar }, { id: "f4", label: "Ação", sub: "11", icon: "carinho", hue: HUES.carinho }, { id: "f5", label: "Apoio", sub: "7", icon: "ajustes", s: 7, hue: HUES.minerar }
  ], { pos: (n, sp) => row(n, sp * 1.05) });

  // 4 ícones: todos
  const names = Object.keys(I);
  stage("icones", names.map((n, i) => ({ id: n, label: n, icon: n, hue: Object.values(HUES)[i % 6] })), { pos: (n, sp) => grid(n, mob() ? 4 : 5, mob() ? 21 : 17) });

  // 5 movimento: anel em arco, base embaixo
  const acts = ["carinho", "polinizar", "minerar", "construir", "plantar", "canal"];
  const E = stage("movimento", acts.map((a) => ({ id: a, label: a, cap: false })), {
    center: (W, H) => ({ x: W / 2, y: H * .84 }),
    pos: (n) => acts.map((_, i) => { const a = (-165 + i * (150 / (n - 1))) * Math.PI / 180, r = mob() ? 33 : 26; return [Math.cos(a) * r * 1.25, Math.sin(a) * r]; }),
    onPick: (a, eng) => { eng.accept(a.id); setTimeout(() => eng.open(), 1800); }
  });
  let open = true;
  document.querySelector("[data-mov=toggle]").onclick = () => { open = !open; open ? E.open() : E.close(); };
  document.querySelector("[data-mov=again]").onclick = () => { open = true; E.close(); setTimeout(() => E.open(), 350); };
})();
