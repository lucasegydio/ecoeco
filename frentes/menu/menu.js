// Rodada 21 · anel por contexto: o anel de vidro em cada situação, só com as ações que cabem.
(() => {
  const board = document.querySelector("#anel-board"); if (!board) return;
  const I = window.ECO_ICONS;
  const H = { carinho: ["#ffb3d6", "#ff4f86"], polinizar: ["#ffcf73", "#ff6a2c"], minerar: ["#e4e0f2", "#8a83a8"], construir: ["#ffcf73", "#ff6a2c"], plantar: ["#e6ff86", "#1fbf5b"], canal: ["#bfe0ff", "#4f63f2"], alcancar: ["#d9ccff", "#7d5cf0"], fabricar: ["#ffb3d6", "#ff4f86"], montar: ["#bfe0ff", "#4f63f2"], decolar: ["#ffcf73", "#ff4f86"] };
  const N = { carinho: "Acalmar", polinizar: "Polinizar", minerar: "Minerar", construir: "Construir", plantar: "Plantar", canal: "Cavar canal", alcancar: "Alcançar", fabricar: "Fabricar", montar: "Montar", decolar: "Decolar" };
  const CTX = [
    ["Bichinho", "Brotinho", [["carinho"], ["polinizar"]]],
    ["Rocha macia", "rocha", [["minerar"]]],
    ["Vão", "vão", [["construir"], ["canal", 1]]],
    ["Canteiro", "canteiro", [["plantar"], ["canal"]]],
    ["Galho alto", "núcleo", [["alcancar"]]],
    ["Bancada", "bancada", [["fabricar"], ["montar", 1]]],
    ["Estaleiro", "nave", [["montar"], ["decolar", 1]]]
  ];
  // posições por papel: principal topo (-90°), depois horário em passos de 120° (2 ações: topo e embaixo à direita)
  const ANG = { 1: [-90], 2: [-90, 30], 3: [-90, 30, 150] };
  board.innerHTML = CTX.map(([title, core, acts], ci) => `<div class="anel-card"><h3>${title}</h3><i class="anel-core" data-t="${core}"></i>${acts.map(([id, vazia], k) => {
    const a = ANG[acts.length][k] * Math.PI / 180, R = 33;
    return `<button type="button" class="abub" ${vazia ? "data-void" : ""} aria-pressed="false" aria-label="${N[id]}" style="--x:${(Math.cos(a) * R).toFixed(1)};--y:${(Math.sin(a) * R).toFixed(1)};--c1:${H[id][0]};--c2:${H[id][1]};--d:${-(ci + k) * 1.3}s"><svg viewBox="0 0 32 32" aria-hidden="true">${I[id]}</svg><span class="nm">${N[id]}</span></button>`;
  }).join("")}</div>`).join("");
  board.addEventListener("pointermove", (e) => {
    const c = e.target.closest(".anel-card"); if (!c) return; const r = c.getBoundingClientRect();
    c.style.setProperty("--lx", e.clientX - r.left + "px"); c.style.setProperty("--ly", e.clientY - r.top + "px");
    c.querySelectorAll(".abub").forEach((b) => { const q = b.getBoundingClientRect(); b.style.setProperty("--bx", Math.max(5, Math.min(95, (e.clientX - q.left) / q.width * 100))); b.style.setProperty("--by", Math.max(5, Math.min(95, (e.clientY - q.top) / q.height * 100))); });
  });
  board.addEventListener("click", (e) => { const b = e.target.closest(".abub"); if (!b) return; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
})();
