// Rodada 05 · motor líquido.
// Molas físicas para abrir, fechar, crescer no toque e "cair" ao escolher; luz quente que segue
// o dedo (ou passeia sozinha); ímã leve das bolhas em direção ao dedo; ícone com inércia real
// (atrasa conforme a velocidade). Tudo escrito em variáveis CSS; o visual fica no CSS.
// Uso: const L = Liquid.create({ stage, scene, center: () => ({x, y}) em px da cena });
//      L.setItems([{ el, bx, by, delay, id }])  // bx/by em cqi relativos ao centro
//      L.open(); L.close(); L.accept(id)
window.Liquid = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // mola crítica-ish: k rigidez, c amortecimento (valores no espírito de react-spring)
  function spring(p, v, target, k, c, dt) {
    const a = -k * (p - target) - c * v;
    v += a * dt;
    p += v * dt;
    return [p, v];
  }

  // 22-movimento: tokens de mola ajustaveis (T). Padrao = valores do prototipo ("hoje").
  const HOJE = { openK: 190, openC: 17, dripK: 120, dripC: 14, scaleK: 260, scaleC: 16, reach: 16, pull: 1.6, stretchMax: .22, stretchDiv: 140, float: .45, inertia: .022, closeK: 190, closeC: 17, absK: 190, absC: 17, chosenK: 190, chosenC: 17, chosenS: 1.3, hot: 1.17, press: .9, stagger: 1 };
  const PROP = { openK: 110, openC: 17, closeK: 170, closeC: 26, scaleK: 200, scaleC: 18, absK: 140, absC: 24, chosenK: 150, chosenC: 16, stretchMax: .12, hot: 1.12, press: .92, stagger: 1 };   // contemplativo + sutil
  function create({ stage, scene, center, driveLight = true, tune = {}, reduced = () => reduce.matches }) {
    const T = { ...HOJE, ...tune };
    let items = [];
    let isOpen = false;
    let openedAt = 0;
    let W = scene.clientWidth, H = scene.clientHeight;
    new ResizeObserver(() => { W = scene.clientWidth; H = scene.clientHeight; }).observe(scene);

    // luz: alvo = dedo/mouse; sem ponteiro, passeia devagar em volta do centro
    const light = { x: W * .4, y: H * .3, x2: W * .4, y2: H * .3, active: false, px: 0, py: 0, lastMove: 0 };
    const toScene = (e) => { const r = scene.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    stage.addEventListener("pointermove", (e) => { [light.px, light.py] = toScene(e); light.active = true; light.lastMove = performance.now(); });
    stage.addEventListener("pointerdown", (e) => { [light.px, light.py] = toScene(e); light.active = true; light.lastMove = performance.now(); });
    stage.addEventListener("pointerleave", () => { light.active = false; });

    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(stage);

    let raf = 0, last = 0;
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    function tick(now) {
      raf = 0;
      const dt = Math.min(0.034, (now - last) / 1000) || 0.016;
      last = now;
      const t = now / 1000;
      const c = center();

      // ponteiro parado por 2,5 s volta ao passeio automático
      if (light.active && now - light.lastMove > 2500) light.active = false;
      if (driveLight) {
        const R = Math.min(W, H) * .32;
        const tx = light.active ? light.px : c.x + Math.cos(t * .35) * R * 1.1;
        const ty = light.active ? light.py : c.y - R * .35 + Math.sin(t * .52) * R * .6;
        const ease = light.active ? .16 : .03;
        light.x += (tx - light.x) * ease; light.y += (ty - light.y) * ease;
        light.x2 += (light.x - light.x2) * .05; light.y2 += (light.y - light.y2) * .05;   // segunda cor, atrasada
        scene.style.setProperty("--lx", light.x.toFixed(1) + "px");
        scene.style.setProperty("--ly", light.y.toFixed(1) + "px");
        scene.style.setProperty("--lx2", light.x2.toFixed(1) + "px");
        scene.style.setProperty("--ly2", light.y2.toFixed(1) + "px");
      }

      const u = W / 100;   // 1cqi em px
      for (const it of items) {
        const RM = reduced();
        const started = isOpen && now >= openedAt + it.delay * T.stagger;
        let gx = 0, gy = 0, gs = 0;
        if (it.mode === "drip") { gx = 0; gy = -u * 2; gs = .2; }
        else if (it.mode === "absorb" || !started) { gx = 0; gy = 0; gs = 0; }
        else {
          // posição de repouso + flutuação orgânica (duas senoides fora de fase)
          gx = it.bx * u + Math.sin(t * .9 + it.phase) * u * (RM ? 0 : T.float);
          gy = it.by * u + Math.cos(t * .73 + it.phase * 1.3) * u * (RM ? 0 : T.float);
          // ímã: perto do dedo, a bolha se inclina um pouco na direção dele
          if (light.active && !RM) {
            const dx = light.px - (c.x + gx), dy = light.py - (c.y + gy);
            const d = Math.hypot(dx, dy), reach = u * T.reach;
            if (d < reach) { const f = (1 - d / reach) * u * T.pull / (d || 1); gx += dx * f; gy += dy * f; }
          }
          gs = it.press ? T.press : it.hot ? T.hot : 1;
          if (it.mode === "chosen") gs = T.chosenS;
        }
        const closing = !isOpen && !it.mode;
        const k = RM ? 900 : it.mode === "drip" ? T.dripK : it.mode === "chosen" ? T.chosenK : it.mode === "absorb" ? T.absK : closing ? T.closeK : T.openK;
        const cd = RM ? 60 : it.mode === "drip" ? T.dripC : it.mode === "chosen" ? T.chosenC : it.mode === "absorb" ? T.absC : closing ? T.closeC : T.openC;
        [it.x, it.vx] = spring(it.x, it.vx, gx, k, cd, dt);
        [it.y, it.vy] = spring(it.y, it.vy, gy, k, cd, dt);
        [it.s, it.vs] = spring(it.s, it.vs, gs, RM ? 900 : T.scaleK, RM ? 60 : T.scaleC, dt);

        const el = it.el;
        el.style.setProperty("--x", it.x.toFixed(2) + "px");
        el.style.setProperty("--y", it.y.toFixed(2) + "px");
        el.style.setProperty("--s", Math.max(0, it.s).toFixed(3));
        // estica na direção do movimento (gota em voo) e o ícone atrasa pela inércia
        const sp = Math.hypot(it.vx, it.vy);
        const stretch = reduced() ? 0 : clamp(sp / (u * T.stretchDiv), 0, T.stretchMax);
        // o ângulo do estiramento só muda em movimento; parado, fica onde estava (sem girar o brilho)
        if (sp > u * 4) it.sa = Math.atan2(it.vy, it.vx);
        const sa = it.sa || 0;
        el.style.setProperty("--st", stretch.toFixed(3));
        el.style.setProperty("--sa", (sa * 180 / Math.PI).toFixed(1) + "deg");
        el.style.setProperty("--ix", clamp(-it.vx * T.inertia, -7, 7).toFixed(2) + "px");
        el.style.setProperty("--iy", clamp(-it.vy * T.inertia, -7, 7).toFixed(2) + "px");
        // luz em cada bolha: brilho do lado virado para a luz
        const ix = c.x + it.x, iy = c.y + it.y;
        const wx = light.x - ix, wy = light.y - iy, ld = Math.hypot(wx, wy) || 1;
        // leva a direção da luz para o referencial da bolha (que pode estar girada pelo estiramento)
        const cs = Math.cos(-sa), sn = Math.sin(-sa);
        const lx = wx * cs - wy * sn, ly = wx * sn + wy * cs;
        el.style.setProperty("--hx", (50 + lx / ld * 30).toFixed(1) + "%");
        el.style.setProperty("--hy", (50 + ly / ld * 30).toFixed(1) + "%");
        el.style.setProperty("--ha", (Math.atan2(ly, lx) * 180 / Math.PI + 90).toFixed(1) + "deg");
        el.style.setProperty("--hl", clamp(1.15 - ld / (u * 45), .3, 1).toFixed(3));
        el.toggleAttribute("data-gone", it.s < .35);
      }
      if (visible) raf = requestAnimationFrame(tick);   // a luz respira sempre que o palco está visível
    }

    // cada bolha recebe três formas próprias; a borda passeia entre elas (orgânico, nunca igual)
    function shapes(seed) {
      let s = seed;
      const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const one = () => {
        const v = Array.from({ length: 8 }, () => Math.round(32 + rnd() * 36));   // 32–68%: bem orgânico sem virar pétala
        return `${v[0]}% ${100 - v[0]}% ${v[1]}% ${100 - v[1]}% / ${v[2]}% ${v[3]}% ${100 - v[3]}% ${100 - v[2]}%`;
      };
      return [one(), one(), one()];
    }

    return {
      setItems(list) {
        items = list.map((o, i) => {
          const seed = [...(o.id || "x" + i)].reduce((a, ch) => a + ch.charCodeAt(0) * 7, 13);
          const [b1, b2, b3] = shapes(seed);
          o.el.style.setProperty("--b1", b1); o.el.style.setProperty("--b2", b2); o.el.style.setProperty("--b3", b3);
          o.el.style.setProperty("--md", (-(seed % 70) / 10).toFixed(1) + "s");
          const btn = o.el.querySelector("button");
          const it = { ...o, x: 0, y: 0, vx: 0, vy: 0, s: 0, vs: 0, hot: false, press: false, mode: null, phase: i * 1.7 };
          btn.addEventListener("pointerenter", () => { it.hot = true; });
          btn.addEventListener("pointerleave", () => { it.hot = false; it.press = false; });
          btn.addEventListener("focus", () => { it.hot = true; });
          btn.addEventListener("blur", () => { it.hot = false; });
          btn.addEventListener("pointerdown", () => { it.press = true; });
          ["pointerup", "pointercancel"].forEach((ev) => btn.addEventListener(ev, () => { it.press = false; }));
          return it;
        });
        kick();
      },
      open() { isOpen = true; openedAt = performance.now(); items.forEach((it) => { it.mode = null; }); kick(); },
      close() { isOpen = false; kick(); },
      accept(id) {
        items.forEach((it) => { it.mode = it.id === id ? "chosen" : "absorb"; });
        setTimeout(() => { const it = items.find((x) => x.id === id); if (it) it.mode = "drip"; }, reduced() ? 0 : 220);
        kick();
      },
      tune(o) { Object.assign(T, o); kick(); },
      kick
    };
  }
  return { create, HOJE, PROP };
})();
