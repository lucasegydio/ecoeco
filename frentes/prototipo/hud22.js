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
  // padrão: C Calmo (Lucas ainda não escolheu); ?hud=gota|ilhas|calmo só para comparar
  stage.dataset.hud = new URLSearchParams(location.search).get("hud") || "calmo";
})();
