// Rodada 08 · ícones em traço de pincel.
// Refs de Lucas: pictogramas orgânicos de pincel (Atlas Therapy / Sereth, ícones de movimento e meditação):
// traço único de peso variável, um ponto cheio recorrente (sol, cabeça, semente), glifos de natureza.
// Grade 32, traço ~2,8 px com pontas redondas; ".f" = forma cheia. O filtro #pincel dá a borda de tinta.
window.ECO_ICONS = {
  // cuidar: um colo que embala um ponto
  carinho: '<circle class="f" cx="16" cy="9.5" r="2.8"/><path d="M6 15.5c2.2 6.6 6.2 9.4 10 9.4s7.8-2.8 10-9.4"/><path d="M11.2 18.2c1.4 1.8 3 2.6 4.8 2.6"/>',
  // polinizar: flor-sol, miolo cheio e pétalas em traço
  polinizar: '<circle class="f" cx="16" cy="16" r="3.4"/><path d="M16 5.2v4.2M16 22.6v4.2M5.2 16h4.2M22.6 16h4.2"/><circle class="f" cx="8.6" cy="8.6" r="1.4"/><circle class="f" cx="23.4" cy="8.6" r="1.4"/><circle class="f" cx="8.6" cy="23.4" r="1.4"/><circle class="f" cx="23.4" cy="23.4" r="1.4"/>',
  // minerar: seixo com uma fenda
  minerar: '<path d="M6.8 19.6c-1.4-5 2.6-10 8.2-10.4 5.6-.4 10.2 2.6 10.2 7.6s-4.2 8-9.6 8c-4.6 0-7.8-1.6-8.8-5.2z"/><path d="M16.2 9.4l-1.6 5.2 3 2.4-1.4 4"/>',
  // construir: ponte em arco sobre dois apoios, sol acima
  construir: '<path d="M4.4 21.4c3.6-6.2 7.6-8.8 11.6-8.8s8 2.6 11.6 8.8"/><path d="M9.2 17.4v7.8M22.8 17.4v7.8"/><circle class="f" cx="16" cy="6.8" r="2.2"/>',
  // plantar: broto de duas folhas sobre o chão
  plantar: '<path d="M16 26.6V14.4"/><path d="M16 17.4c-1-4.6-4.4-6.8-8.6-6.8.4 4.6 4 6.8 8.6 6.8z"/><path d="M16 15.2c1-4 4-6.2 8-6.2-.4 4-3.6 6.2-8 6.2z"/><path d="M10 27.2h12"/>',
  // canal: duas ondas e uma gota
  canal: '<path d="M4.4 12.6c3-2.6 5-2.6 7.6 0s4.6 2.6 7.6 0 5-2.6 8 0"/><path d="M4.4 19.6c3-2.6 5-2.6 7.6 0s4.6 2.6 7.6 0 5-2.6 8 0"/><circle class="f" cx="7" cy="25.6" r="1.7"/>',
  // receitas: folha dentro de um quadrado mole
  receitas: '<path d="M8.4 6.4h13.8c2 0 3.4 1.4 3.4 3.4v13.4c0 1.8-1.4 3-3.2 3H9.6c-2 0-3.6-1.6-3.6-3.6V9c0-1.6 1-2.6 2.4-2.6z"/><path d="M11 21.4c3-7.2 6.2-9.4 10.2-11.2"/><path d="M14.2 17.8l-2.6-3M17.2 14.8l-1-3.6M17.4 18.2l3.6.4"/>',
  // coleção: espiral (o todo) com um ponto
  colecao: '<path d="M16 16.6c0-1.6 1.6-2.2 2.6-1.4 1.6 1.2 1 4-1.2 4.6-3 .8-5.6-1.6-5.2-4.8.5-4 4.8-6.2 8.6-4.6 4.6 2 5.6 7.8 2.6 11.6"/><circle class="f" cx="23.6" cy="7" r="2.1"/>',
  // som: ponto e dois arcos
  som: '<circle class="f" cx="9" cy="16" r="3.1"/><path d="M15 10.4c3 3.6 3 7.6 0 11.2"/><path d="M20.6 6.8c5 5.6 5 12.8 0 18.4"/>',
  // ajustes: equilíbrio (ponto, linha, arco)
  ajustes: '<circle class="f" cx="16" cy="8" r="2.7"/><path d="M5 15.6h22"/><path d="M9.6 25.2c2.4-5 4.4-7 6.4-7s4 2 6.4 7"/>',
  // alcançar: um traço que sobe até um ponto alto
  alcancar: '<circle class="f" cx="22.4" cy="6.6" r="2.7"/><path d="M8 27c1-6 3.2-10.2 6.2-13.2s5-4.4 7-5.4"/><path d="M10.2 18.6c2.5.2 4.5 1 6 2.6"/>',
  // fabricar: duas peças que se encaixam e um ponto
  fabricar: '<path d="M6.4 20.6l6-6 4 4-6 6z"/><path d="M15 12.2l4.6-4.6 4.6 4.6-4.6 4.6"/><circle class="f" cx="23.6" cy="23.6" r="2.3"/>',
  // montar: a nave em forma de gota, com o núcleo
  montar: '<path d="M16 4.4c4.6 4 6.6 9 6.6 14.6v4H9.4v-4C9.4 13.4 11.4 8.4 16 4.4z"/><circle class="f" cx="16" cy="14.6" r="2.4"/><path d="M9.6 23.6l-3 3.6M22.4 23.6l3 3.6"/>',
  // decolar: subida com rastro
  decolar: '<path d="M16 25.6V8"/><path d="M10.6 13.6L16 7.6l5.4 6"/><circle class="f" cx="16" cy="28.2" r="1.6"/><path d="M11 21.8c-1.5 1.5-2 3-2 5M21 21.8c1.5 1.5 2 3 2 5"/>',
  // eco: ponto e três arcos
  eco: '<circle class="f" cx="9" cy="16" r="2.7"/><path d="M14 11.4a6.4 6.4 0 0 1 0 9.2"/><path d="M18.6 8a11.4 11.4 0 0 1 0 16"/><path d="M23.2 4.6a16.2 16.2 0 0 1 0 22.8"/>'
};

// filtro de pincel, uma vez por página
(() => {
  if (document.getElementById("pincel")) return;
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", "0"); s.setAttribute("height", "0"); s.setAttribute("aria-hidden", "true");
  s.style.position = "absolute";
  s.innerHTML = '<filter id="pincel" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter>';
  (document.body || document.documentElement).append(s);
})();
