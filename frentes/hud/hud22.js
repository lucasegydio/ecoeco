/* ecoeco · HUD 22: monta pontinhos do arco, botão de menu e barra de teste sobre o protótipo. */
(() => {
  const stage = document.querySelector(".game-stage"), game = stage.querySelector(".game"), top = game.querySelector(".hud-top"),
    planet = top.querySelector(".hud-planet"), inv = top.querySelector(".hud-inv");
  const ARC = [["buscar", "perto", "arvore"], ["polinizar", "fruto"], ["minerar", "pedras"], ["plantar", "canal", "colheita"], ["alcancar", "fabricar", "montar"], ["decolar", "mapa"]];
  planet.insertAdjacentHTML("beforeend", '<span class="hud-dots" aria-hidden="true">' + ARC.map(() => "<i></i>").join("") + "</span>");
  const dots = [...planet.querySelectorAll(".hud-dots i")];
  const paintDots = () => { const s = stage.dataset.step, n = ARC.findIndex(g => g.includes(s)); dots.forEach((d, i) => { d.className = i < n ? "ok" : i === n ? "now" : ""; }); planet.setAttribute("aria-label", "Planeta Terra, passo " + (Math.max(n, 0) + 1) + " de " + ARC.length); };
  const total = () => { let t = 0; inv.querySelectorAll(".inv-item").forEach(e => t += parseInt(e.textContent) || 0); inv.dataset.n = t; };
  new MutationObserver(paintDots).observe(stage, { attributes: true, attributeFilter: ["data-step"] });
  new MutationObserver(total).observe(inv, { childList: true }); total(); paintDots();
  game.insertAdjacentHTML("beforeend", '<i class="hud-notch" aria-hidden="true"></i><button type="button" class="hud-menu" aria-label="Menu do planeta"><svg viewBox="0 0 32 32"><circle cx="8" cy="17" r="3.4"/><circle cx="16" cy="12.5" r="3.9"/><circle cx="24.2" cy="17.4" r="3.1"/></svg></button>');
  game.querySelector(".hud-menu").addEventListener("pointerdown", e => e.stopPropagation());
  game.querySelector(".hud-menu").addEventListener("click", () => game.dispatchEvent(new WheelEvent("wheel", { deltaY: 700, bubbles: true, cancelable: true })));
  // calmo: ocioso
  let t; const wake = () => { stage.dataset.idle = "false"; clearTimeout(t); t = setTimeout(() => stage.dataset.idle = "true", 3000); };
  ["pointerdown", "pointermove", "wheel"].forEach(ev => game.addEventListener(ev, wake, { passive: true })); wake();
  // barra de teste
  const lab = document.createElement("div"); lab.className = "hud-lab";
  const grp = (label, items, cur, fn) => { lab.insertAdjacentHTML("beforeend", `<span>${label}</span>`); const bs = items.map(([k, n]) => { const b = document.createElement("button"); b.textContent = n; b.setAttribute("aria-pressed", String(k === cur)); b.onclick = () => { bs.forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); fn(k); }; lab.append(b); return b; }); };
  stage.dataset.hud = new URLSearchParams(location.search).get("hud") || "gota";
  grp("HUD", [["gota", "A Gota"], ["ilhas", "B Ilhas"], ["calmo", "C Calmo"], ["", "Antigo"]], stage.dataset.hud, k => k ? stage.dataset.hud = k : stage.removeAttribute("data-hud"));
  grp("Modo", [["", "Normal"], ["observar", "Observar"], ["planeta", "Planetária"]], "", k => k ? stage.dataset.force = k : stage.removeAttribute("data-force"));
  grp("Tela", [["", "Real"], ["on", "Notch"]], "", k => k ? stage.dataset.notch = k : stage.removeAttribute("data-notch"));
  grp("Largura", [["400px", "400"], ["375px", "375"], ["430px", "430"]], "400px", k => document.documentElement.style.setProperty("--hw", k));
  document.body.append(lab); const tg = document.createElement("button"); tg.className = "hud-lab-t"; tg.textContent = "teste ⚙"; tg.onclick = () => lab.classList.toggle("open"); document.body.append(tg);
})();
