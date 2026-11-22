(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const tela=$('#tela'),phone=$('#phone');let modo=localStorage.getItem('eco-inicio-modo')||'primeira',cur='',tm=[];
const veu=document.createElement('div');veu.className='veu';tela.append(veu);
const NOTAS={
 icone:['Ícone','Glifo das pranchetas aprovadas sobre luz âmbar→coral→lilás. Vale para círculo, quadrado e monocromático (Android 13).'],
 splash:['Splash','Sem texto e sem áudio. A espiral da marca nasce e gira; três arcos de eco piscam em vez de barra de progresso. ~1,5 s no máximo.'],
 titulo:['Título','Só <b>ecoeco</b>. Planeta vivo respirando; a luz quente segue o dedo. Um único gesto: tocar a bolha.<br><br><em>1ª abertura:</em> bolha com o eco, pulsando. <em>Continuar:</em> bolha com o traço de continuar + o planeta e a vida dele.'],
 ajustes:['Ajustes','Um toque na bolha do canto. <b>Som</b> fica bloqueado até a trilha do Joaquim/SKU. <b>Vibração</b> liga/desliga. <b>Pistas</b>: 1, 2 ou 3 pontos (calma, média, sempre). <b>Conta</b> é opcional: o jogo abre sem login.'],
 entrada:['Entrada','O planeta se aproxima do fundo do céu. <em>1ª vez:</em> viagem lenta (2,4 s). <em>Continuar:</em> 0,9 s, já na posição salva. Termina com o chip do planeta.<br><br><b>Passa para a frente onboarding:</b> planeta parado, zoom 1, luz-dedo ativa.']};
const sec=n=>$(`[data-s=${n}]`);
function clr(){tm.forEach(clearTimeout);tm=[]}
function show(n){clr();cur=n;$$('.s').forEach(s=>s.classList.toggle('on',s.dataset.s===n||(n==='ajustes'&&s.dataset.s==='titulo')));
 if(n==='ajustes')sec('titulo').classList.add('on');
 $$('#passos button').forEach(b=>b.classList.toggle('on',b.dataset.t===n));
 $('#notas').innerHTML=`<h3>${NOTAS[n][0]}</h3><p>${NOTAS[n][1]}</p>`;
 if(n==='splash'){const e=$('.espiral');e.style.animation='none';e.offsetWidth;e.style.animation='';tm.push(setTimeout(()=>show('titulo'),3000))}
 if(n==='entrada')entrar();
 if(n==='titulo')sec('ajustes').setAttribute('aria-hidden','true')
 if(n==='ajustes')sec('ajustes').setAttribute('aria-hidden','false')}
function setModo(m){modo=m;localStorage.setItem('eco-inicio-modo',m);const c=m==='continuar';
 $$('.modo button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
 sec('titulo').classList.toggle('cont',c);$('#estado').hidden=!c;
 $('#comecar').setAttribute('aria-label',c?'Continuar':'Tocar para começar');
 $('#notas2').innerHTML=c?'<h3>Continuar</h3><p>Mesma tela, mesmo gesto. A bolha vira o traço de continuar e três pontos mostram a vida do planeta (bichinhos achados). Sem menu de “novo jogo” aqui: recomeçar fica em Ajustes.</p>':'<h3>1ª abertura</h3><p>Sem escolha nenhuma: <b>um toque</b> e o planeta se aproxima. Sem login, sem permissão pedida, sem texto. Conta e Ajustes ficam no canto, discretos.</p>'}
function entrar(){const s=sec('entrada');s.classList.remove('dentro','rapido');s.classList.toggle('rapido',modo==='continuar');void s.offsetWidth;tm.push(setTimeout(()=>s.classList.add('dentro'),60))}
function comecar(){veu.classList.add('on');tm.push(setTimeout(()=>{show('entrada');veu.classList.remove('on')},modo==='continuar'?220:450))}
$('#passos').onclick=e=>{const t=e.target.dataset.t;if(t)show(t)};
$('.modo').onclick=e=>{if(e.target.dataset.m)setModo(e.target.dataset.m)};
$('#comecar').onclick=comecar;$('#abrirAjustes').onclick=()=>show('ajustes');$('#fechar').onclick=()=>show('titulo');
sec('ajustes').addEventListener('click',e=>{if(e.target===sec('ajustes'))show('titulo')});
$('#vibra').onclick=e=>{const b=e.currentTarget;b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'));navigator.vibrate&&navigator.vibrate(30)};
$('#pistas').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#pistas button').forEach(x=>x.setAttribute('aria-checked',x===b))};
tela.addEventListener('pointermove',e=>{const r=tela.getBoundingClientRect(),k=r.width/375;$$('.luz').forEach(l=>{l.style.setProperty('--lx',(e.clientX-r.left)/k+'px');l.style.setProperty('--ly',(e.clientY-r.top)/k+'px')})});
function fit(){const m=innerWidth<=520,w=innerWidth-(m?0:32),h=innerHeight-(m?50:96),k=Math.min(1,w/375,h/812);document.documentElement.style.setProperty('--k',k.toFixed(3))}
addEventListener('resize',fit);fit();setModo(modo);show(new URLSearchParams(location.search).get('t')||'splash');
})();
