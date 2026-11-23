// Frente 22-icones · família completa de ícones de pincel (62).
// Grade 32, traço 2,8 px, pontas redondas. ".f" = ponto/forma cheia (o ponto recorrente). ".t" = traço fino 1,9 px (detalhe),
// o que dá peso variável de pincel. O filtro #pincel dá a borda de tinta. Margem segura de 4 px.
window.ECO_ICONS = {
  // ── AÇÕES DO ANEL ──
  carinho: '<circle class="f" cx="16" cy="9.5" r="2.8"/><path d="M6 15.5c2.2 6.6 6.2 9.4 10 9.4s7.8-2.8 10-9.4"/><path class="t" d="M11.2 18.2c1.4 1.8 3 2.6 4.8 2.6"/>',
  polinizar: '<circle class="f" cx="16" cy="16" r="3.4"/><path d="M16 5.2v4.2M16 22.6v4.2M5.2 16h4.2M22.6 16h4.2"/><circle class="f" cx="8.6" cy="8.6" r="1.5"/><circle class="f" cx="23.4" cy="8.6" r="1.5"/><circle class="f" cx="8.6" cy="23.4" r="1.5"/><circle class="f" cx="23.4" cy="23.4" r="1.5"/>',
  minerar: '<path d="M6.8 19.6c-1.4-5 2.6-10 8.2-10.4 5.6-.4 10.2 2.6 10.2 7.6s-4.2 8-9.6 8c-4.6 0-7.8-1.6-8.8-5.2z"/><path class="t" d="M16.2 9.4l-1.6 5.2 3 2.4-1.4 4"/>',
  construir: '<path d="M4.4 21.4c3.6-6.2 7.6-8.8 11.6-8.8s8 2.6 11.6 8.8"/><path class="t" d="M9.2 17.4v7.8M22.8 17.4v7.8"/><circle class="f" cx="16" cy="6.8" r="2.3"/>',
  plantar: '<path d="M16 26.6V14.4"/><path d="M16 17.4c-1-4.6-4.4-6.8-8.6-6.8.4 4.6 4 6.8 8.6 6.8z"/><path d="M16 15.2c1-4 4-6.2 8-6.2-.4 4-3.6 6.2-8 6.2z"/><path class="t" d="M10 27.2h12"/>',
  canal: '<path d="M4.4 12.6c3-2.6 5-2.6 7.6 0s4.6 2.6 7.6 0 5-2.6 8 0"/><path d="M4.4 19.6c3-2.6 5-2.6 7.6 0s4.6 2.6 7.6 0 5-2.6 8 0"/><circle class="f" cx="7" cy="25.6" r="1.8"/>',
  colher: '<path d="M5.6 8.4c5.4-2.4 11.2-1.8 15.4 1.6"/><path class="t" d="M21 10v3.2"/><circle cx="21" cy="19" r="5.8"/><circle class="f" cx="19" cy="17.2" r="1.4"/>',
  alcancar: '<circle class="f" cx="22.4" cy="6.6" r="2.7"/><path d="M8 27c1-6 3.2-10.2 6.2-13.2s5-4.4 7-5.4"/><path class="t" d="M10.2 18.6c2.5.2 4.5 1 6 2.6"/>',
  fabricar: '<path d="M6.4 20.6l6-6 4 4-6 6z"/><path d="M15 12.2l4.6-4.6 4.6 4.6-4.6 4.6"/><circle class="f" cx="23.6" cy="23.6" r="2.4"/>',
  montar: '<path d="M16 4.4c4.6 4 6.6 9 6.6 14.6v4H9.4v-4C9.4 13.4 11.4 8.4 16 4.4z"/><circle class="f" cx="16" cy="14.6" r="2.4"/><path class="t" d="M9.6 23.6l-3 3.6M22.4 23.6l3 3.6"/>',
  decolar: '<path d="M16 25.6V8"/><path d="M10.6 13.6L16 7.6l5.4 6"/><circle class="f" cx="16" cy="28.2" r="1.7"/><path class="t" d="M11 21.8c-1.5 1.5-2 3-2 5M21 21.8c1.5 1.5 2 3 2 5"/>',
  fotografar: '<path d="M6 11.4c0-1.6 1-2.6 2.6-2.6h2l1.8-2.6h7.2l1.8 2.6h2c1.6 0 2.6 1 2.6 2.6v10c0 1.6-1 2.6-2.6 2.6H8.6C7 26 6 25 6 23.4z"/><circle cx="16" cy="17.4" r="4.4"/><circle class="f" cx="16" cy="17.4" r="1.4"/>',
  // ── MENU DO PLANETA E NAVEGAÇÃO ──
  receitas: '<path d="M8.4 6.4h13.8c2 0 3.4 1.4 3.4 3.4v13.4c0 1.8-1.4 3-3.2 3H9.6c-2 0-3.6-1.6-3.6-3.6V9c0-1.6 1-2.6 2.4-2.6z"/><path d="M11 21.4c3-7.2 6.2-9.4 10.2-11.2"/><path class="t" d="M14.2 17.8l-2.6-3M17.2 14.8l-1-3.6M17.4 18.2l3.6.4"/>',
  colecao: '<path d="M16 16.6c0-1.6 1.6-2.2 2.6-1.4 1.6 1.2 1 4-1.2 4.6-3 .8-5.6-1.6-5.2-4.8.5-4 4.8-6.2 8.6-4.6 4.6 2 5.6 7.8 2.6 11.6"/><circle class="f" cx="23.6" cy="7" r="2.2"/>',
  som: '<circle class="f" cx="9" cy="16" r="3.1"/><path d="M15 10.4c3 3.6 3 7.6 0 11.2"/><path d="M20.6 6.8c5 5.6 5 12.8 0 18.4"/>',
  ajustes: '<circle class="f" cx="16" cy="8" r="2.8"/><path class="t" d="M5 15.6h22"/><path d="M9.6 25.2c2.4-5 4.4-7 6.4-7s4 2 6.4 7"/>',
  mapa: '<path d="M5 8.6l7-2.8 8 3 7-2.8v17.6l-7 2.8-8-3-7 2.8z"/><path class="t" d="M12 5.8v17.6M20 8.8v17.6"/><circle class="f" cx="8.6" cy="19" r="1.8"/>',
  planeta: '<circle cx="16" cy="16" r="10.4"/><path class="t" d="M6.4 13c6 3 13 3 19.2 0"/><circle class="f" cx="21.4" cy="21" r="2"/>',
  inventario: '<path d="M16 10c-5 0-9 3.8-9 9 0 4 3.4 7 9 7s9-3 9-7c0-5.2-4-9-9-9z"/><path class="t" d="M11.6 10.2c.6-2.6 2.4-4 4.4-4s3.8 1.4 4.4 4"/><circle class="f" cx="16" cy="19.2" r="2.1"/>',
  fechar: '<path d="M9 9c4.6 4.6 9.6 9.8 14.2 14.2"/><path d="M23 8.6C18.6 13.4 13.4 18.6 9.2 23.4"/>',
  voltar: '<path d="M19.6 7c-4 3.4-7.2 6.2-7.2 9s3.2 5.6 7.2 9"/><circle class="f" cx="25.6" cy="16" r="1.8"/>',
  mais: '<path d="M16 7.4v17.2"/><path d="M7.4 16h17.2"/>',
  ok: '<path d="M7 17.4c3 .6 5 2 6.6 5 2.8-6.6 6.6-11 12-14"/>',
  pausa: '<path d="M12 7.6c-.4 5.4-.4 11.2 0 16.8"/><path d="M20 7.6c-.4 5.4-.4 11.2 0 16.8"/>',
  jogar: '<path d="M10.6 7.6c0-1 1-1.6 1.8-1.1l12 7.6c.8.5.8 1.7 0 2.2l-12 7.6c-.8.5-1.8-.1-1.8-1.1z"/>',
  conta: '<circle class="f" cx="16" cy="10" r="4.2"/><path d="M7 26c.6-5.4 4.4-8.4 9-8.4s8.4 3 9 8.4"/>',
  // ── MATERIAIS ──
  fibra: '<path d="M10 26c-1-7 0-14 4-20M16 26c-.6-7 .2-14 3-20M22 26c0-6 1-11 4-15"/><path class="t" d="M8.6 19.4c4.6-1.4 10.4-1.4 15 0"/>',
  pedra: '<path d="M5.8 24c-.8-4 1.8-8 6.4-8.4 4.4-.4 8 2 8 5.6 0 3.6-3.4 5.6-7.4 5.6-3.4 0-6.2-.6-7-2.8z"/><path class="t" d="M18 13.8c.6-3 3-4.8 5.8-4.6 2.8.2 4.4 2.4 4 5-.4 2.6-2.6 4-5.2 3.8"/>',
  semente: '<path d="M16 5.6c5.6 4.6 8 10 6 15.4-1.4 3.6-4.6 5.4-6 5.4s-4.6-1.8-6-5.4c-2-5.4.4-10.8 6-15.4z"/><path class="t" d="M16 13v9.6"/>',
  nucleo: '<circle class="f" cx="16" cy="16" r="5.2"/><path d="M8 11a9.6 9.6 0 0 1 16 0"/><path d="M24 21a9.6 9.6 0 0 1-16 0"/>',
  placa: '<path d="M6.4 12.4l9.6-5 9.6 5v3.2l-9.6 5-9.6-5z"/><path class="t" d="M6.4 15.6v4l9.6 5 9.6-5v-4"/><circle class="f" cx="16" cy="13.6" r="1.8"/>',
  gota: '<path d="M16 5c4.6 5.6 7 9 7 12.6a7 7 0 0 1-14 0C9 14 11.4 10.6 16 5z"/><circle class="f" cx="13.6" cy="18.6" r="1.5"/>',
  fruto: '<path class="t" d="M16 6.4v4"/><path d="M16 9.6c1.6-2.8 4-3.6 6.4-3.2-.6 2.6-3 3.8-6.4 3.2z"/><circle cx="16" cy="19.4" r="7"/><circle class="f" cx="13.4" cy="17" r="1.5"/>',
  // ── ESTADOS ──
  bloqueado: '<path d="M9 14.4h14v9.4c0 1.4-1 2.4-2.4 2.4h-9.2c-1.4 0-2.4-1-2.4-2.4z"/><path class="t" d="M11.6 14.4V11a4.4 4.4 0 0 1 8.8 0v3.4"/><circle class="f" cx="16" cy="20" r="1.8"/>',
  visto: '<path d="M4.6 16c3-4.6 7-6.6 11.4-6.6s8.4 2 11.4 6.6c-3 4.6-7 6.6-11.4 6.6S7.6 20.6 4.6 16z"/><circle class="f" cx="16" cy="16" r="3.3"/>',
  desconhecido: '<path d="M11.4 12c0-3 2.2-5 5-5s4.8 1.8 4.8 4.4c0 3.8-4.6 4.2-4.6 8"/><circle class="f" cx="16.4" cy="25.4" r="2"/>',
  possui: '<path d="M16 5.4a10.6 10.6 0 1 0 .1 0"/><circle class="f" cx="16" cy="16" r="4"/>',
  falta: '<path d="M22.6 8.4A10.4 10.4 0 1 0 26.4 16"/><circle class="f" cx="25.6" cy="8.6" r="1.9"/>',
  chora: '<circle class="f" cx="16" cy="10" r="4.2"/><path d="M11 17.6c-.2 3-1 5-2.6 7M21 17.6c.2 3 1 5 2.6 7"/>',
  calmo: '<circle class="f" cx="16" cy="10.4" r="3.8"/><path d="M8 20c4 4.6 12 4.6 16 0"/>',
  toque: '<circle class="f" cx="16" cy="11" r="3.2"/><path d="M9 20c4.6 3 9.4 3 14 0"/><path class="t" d="M5.4 25.4c6.6 4 14.6 4 21.2 0"/>',
  vibrar: '<circle class="f" cx="16" cy="16" r="2.8"/><path d="M10.4 11a7.6 7.6 0 0 0 0 10M21.6 11a7.6 7.6 0 0 1 0 10"/><path class="t" d="M5.4 7.6a13.6 13.6 0 0 0 0 16.8M26.6 7.6a13.6 13.6 0 0 1 0 16.8"/>',
  sol: '<circle class="f" cx="16" cy="16" r="4.6"/><path d="M16 4.6v3M16 24.4v3M4.6 16h3M24.4 16h3M8 8l2 2M24 8l-2 2M8 24l2-2M24 24l-2-2"/>',
  lua: '<path d="M22.8 21.6A9.6 9.6 0 0 1 11 7.6a9.6 9.6 0 1 0 11.8 14z"/><circle class="f" cx="22.6" cy="9" r="1.7"/>',
  // ── ECO (orientação: nunca seta; mais arcos = mais perto) ──
  eco: '<circle class="f" cx="9" cy="16" r="2.7"/><path d="M14 11.4a6.4 6.4 0 0 1 0 9.2"/><path d="M18.6 8a11.4 11.4 0 0 1 0 16"/><path d="M23.2 4.6a16.2 16.2 0 0 1 0 22.8"/>',
  eco2: '<circle class="f" cx="9" cy="16" r="2.7"/><path d="M14 11.4a6.4 6.4 0 0 1 0 9.2"/><path d="M18.6 8a11.4 11.4 0 0 1 0 16"/>',
  eco1: '<circle class="f" cx="9" cy="16" r="2.7"/><path d="M14 11.4a6.4 6.4 0 0 1 0 9.2"/>',
  // ── BESTIÁRIO ──
  brotinho: '<circle class="f" cx="16" cy="19" r="6.2"/><path class="t" d="M16 12.8V8.4"/><path d="M16 9.4c-1-3-3.4-4-6-3.6.4 2.8 3 4 6 3.6z"/><path d="M16 8.4c1-2.6 3.4-3.6 5.6-3.2-.4 2.6-2.8 3.6-5.6 3.2z"/>',
  cinza: '<path d="M5.8 21c-1-5.6 3-11.2 10.2-11.2s11.2 5.4 10.2 11.2c-.4 2.6-2.4 4-5 4H10.8c-2.6 0-4.6-1.4-5-4z"/><circle class="f" cx="12.4" cy="17" r="1.6"/><circle class="f" cx="19.6" cy="17" r="1.6"/>',
  lagarto: '<path d="M4.6 24.6c2-2.4 4.6-4 8-4.4 3.4-.4 5 1.2 8.2.4 2.8-.8 4-3.2 4-6"/><circle class="f" cx="25.2" cy="11.6" r="2.7"/><path class="t" d="M12.4 20.4l-1.6 4.4M19.4 20.6l1.2 4"/>',
  rabanete: '<path d="M16 12.4c5.4 0 8.4 3.6 8.4 7.6 0 3.2-3 6.6-8.4 6.6S7.6 23.2 7.6 20c0-4 3-7.6 8.4-7.6z"/><path class="t" d="M16 12.4V8M16 9.4c-2-2-4-2.6-6-2.4M16 9c2-2 4-2.6 6-2.4"/><circle class="f" cx="16" cy="5.2" r="1.9"/>',
  regiao: '<path d="M3.6 25l8.2-13.4 4.6 7 3.2-4.6L28.4 25z"/><circle class="f" cx="24.4" cy="8" r="2.4"/>',
  passarela: '<path d="M4 20.4c3.4-3.4 6.8-3.4 12 0s8.6 3.4 12 0"/><path class="t" d="M9.4 17.6v7.4M16 18.6v7.4M22.6 17.6v7.4"/><circle class="f" cx="16" cy="9.4" r="2.2"/>',
  nave: '<path d="M16 4.8c4.4 3.4 6 8 5.2 13.2h-10.4C10 12.8 11.6 8.2 16 4.8z"/><circle class="f" cx="16" cy="12" r="2"/><path class="t" d="M11 18l-3.4 4.6M21 18l3.4 4.6M16 21.4v5"/>',
  conquista: '<path d="M16 5.4l3 6.2 6.6.8-4.8 4.6 1.2 6.6L16 20.4l-6 3.2 1.2-6.6L6.4 12.4l6.6-.8z"/><circle class="f" cx="16" cy="14.4" r="1.7"/>',
  meta: '<circle cx="16" cy="14" r="8.6"/><path class="t" d="M12 14.4l3 3 5.4-6"/><path class="t" d="M11.6 22.4l-2 5 6.4-2 6.4 2-2-5"/>',
  vulcao: '<path d="M3.8 25.6l7.6-12.2h9.2l7.6 12.2z"/><path class="t" d="M12.8 13.4c.4-1.6 1.8-1.8 3.2-1.8s2.8.2 3.2 1.8"/><circle class="f" cx="14" cy="7.2" r="1.7"/><circle class="f" cx="19.4" cy="5.6" r="1.3"/>',
  magma: '<path d="M4.6 17.4c2.4-2.4 4.2-2.4 6.2 0s4 2.4 6.2 0 4-2.4 6.2 0 2.6 1.6 4.2.2"/><path d="M6.6 25.4c1.2-4 2.6-6 4.4-6M25.4 25.4c-1.2-4-2.6-6-4.4-6"/><circle class="f" cx="12.4" cy="10.2" r="1.7"/><circle class="f" cx="19.4" cy="7.4" r="2.2"/><circle class="f" cx="16" cy="22.4" r="1.6"/>',
  brasa: '<path d="M6.4 24.6c-1.2-6 1.4-10.6 6-11.4l-1.6-5.8 4.6 4.2c.4-.2.8-.2 1.2-.2s.8 0 1.2.2l4.6-4.2-1.6 5.8c4.6.8 7.2 5.4 6 11.4z"/><circle class="f" cx="12.8" cy="18.4" r="1.5"/><circle class="f" cx="19.2" cy="18.4" r="1.5"/>',
  duna: '<path d="M3.6 24.8c3.4-8.6 7.2-12.6 11-12.6s5 5 8 5c2 0 3.6-1.4 5.8-4.4"/><path class="t" d="M4 27.6h24"/><circle class="f" cx="23.8" cy="7.4" r="2.4"/>',
  oasis: '<path d="M15 26V12.4"/><path d="M15 12.8c-3.6.2-6.4-1.4-8-4.2 3.6-.6 6.6.6 8 4.2z"/><path d="M15 12.8c3.4-1 6-.4 8.2 2-3.2 1.2-6.4.8-8.2-2z"/><path class="t" d="M17.6 26.4c2.6-1.6 4.6-1.6 6.6 0s2.6 1.2 3.8.6"/><circle class="f" cx="24.6" cy="6.8" r="1.8"/>',
  cacto: '<path d="M16 26.6V8.4c0-1.6 1.2-2.8 2.6-2.8s2.6 1.2 2.6 2.8v18.2"/><path class="t" d="M10.6 17.4v-4.6c0-1.2-.8-1.8-1.6-1.8s-1.6.6-1.6 1.8v6.2c0 1.6 1 2.6 2.6 2.6h3.6"/><circle class="f" cx="22.6" cy="13" r="1.4"/>'
};

// Metadados: [grupo, nome, onde é usado, status]. status: refinado (já existia, redesenhado) | novo.
window.ECO_ICON_GROUPS = [
  ["acoes", "Ações do anel", ["carinho","polinizar","minerar","construir","plantar","canal","colher","alcancar","fabricar","montar","decolar","fotografar"]],
  ["menu", "Menu do planeta e navegação", ["receitas","colecao","som","ajustes","mapa","planeta","inventario","fechar","voltar","mais","ok","pausa","jogar","conta"]],
  ["materiais", "Materiais do inventário", ["fibra","pedra","semente","nucleo","placa","gota","fruto"]],
  ["estados", "Estados", ["bloqueado","visto","desconhecido","possui","falta","chora","calmo","toque","vibrar","sol","lua"]],
  ["eco", "Eco (orientação)", ["eco","eco2","eco1"]],
  ["bestiario", "Bestiário e mundo", ["brotinho","cinza","lagarto","rabanete","regiao"]],
  ["receitas2", "Receitas e conquistas", ["passarela","nave","conquista","meta"]],
  ["vulcanico", "Próximos planetas: vulcânico", ["vulcao","magma","brasa"]],
  ["deserto", "Próximos planetas: deserto", ["duna","oasis","cacto"]]
];
window.ECO_ICON_META = {
  carinho:["Acalmar o Brotinho","refinado"], polinizar:["Polinizar a flor","refinado"], minerar:["Minerar rocha macia","refinado"], construir:["Passarela","refinado"], plantar:["Plantar no canteiro","refinado"], canal:["Cavar canal","refinado"], colher:["Colher o fruto / a colheita","novo"], alcancar:["Alcançar o núcleo no galho","refinado"], fabricar:["Fabricar a placa","refinado"], montar:["Montar a nave","refinado"], decolar:["Decolar","refinado"], fotografar:["Fotografar (bestiário)","novo"],
  receitas:["Aba Receitas","refinado"], colecao:["Aba Coleção","refinado"], som:["Aba Som (bloqueada)","refinado"], ajustes:["Aba Ajustes","refinado"], mapa:["Mapa da região","novo"], planeta:["Chip do planeta","novo"], inventario:["Chip do inventário","novo"], fechar:["Fechar folha","novo"], voltar:["Voltar","novo"], mais:["Novo / adicionar","novo"], ok:["Aceito / confirmar","novo"], pausa:["Pausa","novo"], jogar:["Continuar / jogar","novo"], conta:["Conta (opcional)","novo"],
  fibra:["Material: fibra","novo"], pedra:["Material: pedra","novo"], semente:["Material: semente","novo"], nucleo:["Material: núcleo","novo"], placa:["Material: placa","novo"], gota:["Água / gota","novo"], fruto:["Fruto do Brotinho","novo"],
  bloqueado:["Estado bloqueado (cadeado)","novo"], visto:["Visto no bestiário","novo"], desconhecido:["Não descoberto","novo"], possui:["Na coleção","novo"], falta:["Falta material","novo"], chora:["Bichinho chorando","novo"], calmo:["Bichinho calmo","novo"], toque:["Pista de toque (luz-dedo)","novo"], vibrar:["Vibração (Ajustes)","novo"], sol:["Modo dia","novo"], lua:["Modo noite","novo"],
  eco:["Eco perto demais / chamado (3 arcos)","refinado"], eco2:["Eco médio (2 arcos)","novo"], eco1:["Eco longe (1 arco)","novo"],
  brotinho:["Criatura: Brotinho","novo"], cinza:["Criatura: Bichinho-cinza","novo"], lagarto:["Criatura: Lagarto-deserto","novo"], rabanete:["Criatura: Rabanete-antena","novo"], regiao:["Região / terreno","novo"],
  passarela:["Receita: Passarela (resultado)","novo"], nave:["Receita: Nave","novo"], conquista:["Conquista (estrela)","novo"], meta:["Meta cumprida (selo)","novo"], vulcao:["Região: vulcão","novo"], magma:["Material: magma","novo"], brasa:["Criatura: Bicho-brasa (provisório)","novo"], duna:["Região: duna","novo"], oasis:["Região: oásis","novo"], cacto:["Criatura/planta: cacto (provisório)","novo"]
};

if (typeof document !== "undefined") (() => {
  if (document.getElementById("pincel")) return;
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", "0"); s.setAttribute("height", "0"); s.setAttribute("aria-hidden", "true");
  s.style.position = "absolute";
  s.innerHTML = '<filter id="pincel" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" xChannelSelector="R" yChannelSelector="G"/></filter>';
  (document.body || document.documentElement).append(s);
})();
