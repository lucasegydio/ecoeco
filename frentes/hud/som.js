/* ecoeco · som e vibração (22-som). Sons sintetizados = placeholders; Joaquim troca por áudio real. Vibração: Ajustes (desligada/suave/normal). */
window.ECO_SOM = (() => {
const SOM = { vib: 1, on: true };
let ac,master;
function ctx(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.connect(ac.destination)}if(ac.state=='suspended')ac.resume();master.gain.value=.7;return ac}
// tom: freq inicial, final, duração, tipo, ganho, atraso
function tone(f,f2,d,type='sine',g=.3,t0=0,att=.01){const c=ctx(),t=c.currentTime+t0,o=c.createOscillator(),v=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+att);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v).connect(master);o.start(t);o.stop(t+d+.02)}
function noise(d,f1,f2,g=.2,t0=0,q=1){const c=ctx(),t=c.currentTime+t0,b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;const fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+d);const v=c.createGain();v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+d*.15);v.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl).connect(v).connect(master);s.start(t)}
const prox=()=>window.ECO_PROX||0.5;
const E=[
{id:'toque',n:'Toque',i:'Bolha pequena: o vidro responde ao dedo.',d:70,cam:'UI',pri:3,vib:[8],mov:'mola de pressão (press)',s:()=>tone(520,700,.07,'sine',.25)},
{id:'abrir-anel',n:'Abrir o anel',i:'Floração: as bolhas se abrem em leque, sobe suave.',d:260,cam:'UI',pri:3,vib:[10],mov:'leque abre (mola k/c)',s:()=>[320,420,560].forEach((f,k)=>tone(f,f*1.03,.18,'sine',.2,k*.06))},
{id:'aceitar',n:'Aceitar',i:'Confirmação calorosa, duas notas subindo.',d:220,cam:'UI',pri:4,vib:[12,30,18],mov:'estado aceito (brilho âmbar)',s:()=>{tone(523,0,.15,'triangle',.25);tone(784,0,.2,'triangle',.25,.09)}},
{id:'falta',n:'Falta material',i:'Toque opaco e gentil, sem punir: "ainda não".',d:180,cam:'UI',pri:4,vib:[30,50,30],mov:'tremor curto (estado falta)',s:()=>{tone(220,170,.09,'triangle',.3);tone(210,160,.1,'triangle',.25,.1)}},
{id:'coletar',n:'Coletar',i:'Estalo cristalino: pegou algo do planeta.',d:150,cam:'Mundo',pri:3,vib:[15],mov:'item voa até o chip',s:()=>{tone(700,1100,.1,'sine',.25);tone(1400,1800,.1,'sine',.12,.04)}},
{id:'eco',n:'Eco (proximidade)',i:'Pulso de sonar; mais perto = mais agudo, mais forte, mais rápido.',d:600,cam:'Eco',pri:2,vib:'eco',mov:'anel do eco pulsa (borda da tela)',s:()=>eco()},
{id:'choro',n:'Choro do bichinho',i:'Lamento curto e fofo, indica criatura próxima precisando de algo.',d:500,cam:'Eco',pri:2,vib:[20,40,20,40,30],mov:'eco com tremor lento',s:()=>{const c=ctx(),t=c.currentTime,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),v=c.createGain();o.type='sine';o.frequency.setValueAtTime(620,t);o.frequency.exponentialRampToValueAtTime(380,t+.5);l.frequency.value=9;lg.gain.value=18;l.connect(lg).connect(o.frequency);v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(.28,t+.05);v.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(v).connect(master);o.start(t);l.start(t);o.stop(t+.55);l.stop(t+.55)}},
{id:'nova-especie',n:'Nova espécie',i:'Descoberta: arpejo brilhante de 4 notas.',d:700,cam:'Recompensa',pri:5,vib:[15,40,15,40,40],mov:'cartão sobe + brilho',s:()=>[523,659,784,1047].forEach((f,k)=>tone(f,0,.35,'sine',.22,k*.11))},
{id:'foto',n:'Foto',i:'Obturador macio: clique de ar + tom.',d:120,cam:'UI',pri:4,vib:[25],mov:'flash branco curto',s:()=>{noise(.06,3000,1500,.25);tone(900,500,.08,'square',.06,.03)}},
{id:'evolucao',n:'Evolução',i:'Crescendo de acorde que abre e se acalma.',d:1600,cam:'Recompensa',pri:5,vib:[10,30,20,30,30,30,50],mov:'bichinho muda de forma (spring lento)',s:()=>[262,330,392,523].forEach((f,k)=>tone(f,f*1.01,1.5,'sine',.15,k*.18,.5))},
{id:'decolagem',n:'Decolagem',i:'Sopro que sobe e some: a nave deixa o planeta.',d:2400,cam:'Mundo',pri:5,vib:[20,40,30,40,40,40,60,40,80],mov:'zoom out + nave sobe',s:()=>{noise(2.4,200,2400,.3,0,.8);tone(90,260,2.4,'sawtooth',.06)}},
{id:'navegar',n:'Navegar no menu',i:'Tique mínimo ao trocar de aba ou folha.',d:40,cam:'UI',pri:1,vib:[5],mov:'transição de folha (curta)',s:()=>tone(900,0,.04,'sine',.15)}
];
function eco(){const p=prox();tone(500+p*700,(500+p*700)*.8,.6,'sine',.12+.3*p);tone((500+p*700)*2,0,.3,'sine',.05+.08*p,.02)}
function vib(pat){const k=SOM.vib;if(!k||!navigator.vibrate)return;const p=pat=='eco'?[Math.round(10+40*prox())]:pat;navigator.vibrate(p.map((x,i)=>i%2?x:Math.max(3,Math.round(x*k))))}
const byId = Object.fromEntries(E.map((e) => [e.id, e]));
const last = {};
function play(id) { const e = byId[id]; if (!e) return; const n = performance.now(); if (n - (last[id] || 0) < 60) return; last[id] = n; try { if (SOM.on) e.s(); vib(e.vib); } catch (x) {} }
return { play, SOM, setVib: (k) => { SOM.vib = k; } };
})();
