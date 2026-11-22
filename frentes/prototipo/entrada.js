// Entrada do jogo (21-inicio): splash → título → viagem ao planeta. Pistas 1-3 do Ajustes valem para as pistas do jogo.
document.addEventListener("DOMContentLoaded", () => {
  const ent = document.querySelector("#entrada"), game = document.querySelector("#jogo .game"), $ = (s) => ent.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "eco-proto-jogou"; let cont = false; try { cont = localStorage.getItem(KEY) === "1"; } catch (e) {}
  let tm = 0;
  const go = (e) => { ent.dataset.e = e; };
  const setCont = () => { ent.classList.toggle("e-cont", cont); $(".e-estado").hidden = !cont; $("#iniciar").setAttribute("aria-label", cont ? "Continuar" : "Tocar para começar"); };
  function mostra(splash) {
    clearTimeout(tm); ent.classList.remove("viaja"); ent.style.opacity = ""; ent.hidden = false; setCont();
    if (splash && !reduce) { go("splash"); const sp = $(".e-espiral"); sp.style.animation = "none"; void sp.offsetWidth; sp.style.animation = ""; tm = setTimeout(() => go("titulo"), 1800); } else go("titulo");
  }
  function entrar() {
    clearTimeout(tm); ent.hidden = true; ent.classList.remove("viaja"); game.inert = false;
    document.dispatchEvent(new CustomEvent("ecoeco:iniciar"));
  }
  function comecar() {
    if (ent.classList.contains("viaja")) return;
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    const dur = reduce ? 0 : cont ? .9 : 2.4; ent.style.setProperty("--dur", dur + "s"); ent.classList.add("viaja");
    tm = setTimeout(() => { entrar(); game.tabIndex = -1; game.focus({ preventScroll: true }); }, dur * 1000);
  }
  $("#iniciar").onclick = comecar;
  $("#e-abrir").onclick = () => go("ajustes"); $("#e-fechar").onclick = () => go("titulo");
  $(".e-ajustes").addEventListener("click", (e) => { if (e.target === e.currentTarget) go("titulo"); });
  $("#e-vibra").onclick = (e) => { const b = e.currentTarget; b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); navigator.vibrate && navigator.vibrate(30); };
  $("#e-pistas").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    ent.querySelectorAll("#e-pistas button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    document.dispatchEvent(new CustomEvent("ecoeco:pistas", { detail: +b.dataset.v }));
  };
  ent.addEventListener("pointermove", (e) => { const r = ent.getBoundingClientRect(); ent.style.setProperty("--lx", e.clientX - r.left + "px"); ent.style.setProperty("--ly", e.clientY - r.top + "px"); });
  document.querySelectorAll("[data-pular]").forEach((b) => b.addEventListener("click", entrar));
  document.addEventListener("ecoeco:pular", entrar);
  document.querySelector("#jogo-reset").addEventListener("click", () => { game.inert = true; mostra(false); });
  game.inert = true; mostra(true);
});
