/* ecoeco · monta a home a partir de data.js */
(function(){
var P=PARTES,G=GRUPOS,ST={aprovado:"Aprovado",decidido:"Decidido",revisao:"Em revisão",aberto:"Aberto"};
var $=function(i){return document.getElementById(i)},cd=function(t){return t.replace(/`([^`]+)`/g,"<code>$1</code>")};
var cont=function(s){return P.filter(function(p){return p.s===s}).length};
$("numeros").innerHTML=[[P.length,"partes"],[cont("aprovado")+cont("decidido"),"decididas"],[cont("revisao"),"em revisão"],[cont("aberto"),"abertas"]].map(function(n){return '<div class="num"><b>'+n[0]+'</b><span>'+n[1]+'</span></div>'}).join("");
/* novidades */
var corDe=function(id){var p=P.filter(function(x){return x.id===id})[0];return p?G[p.g].cor:"lilas"};
var feed=$("feed"),mostra=6;
function pinta(){feed.innerHTML=NOTAS.slice(0,mostra).map(function(n){return '<a class="vidro item rev" href="'+n[4]+'"><time>'+n[0]+'</time><b class="chip c-'+corDe(n[1])+'">'+n[1]+'</b><div><h4>'+n[2]+'</h4>'+n[3].map(function(l){return '<p>'+l+'</p>'}).join("")+'</div><span class="seta">›</span></a>'}).join("");
 $("mais").textContent=mostra>=NOTAS.length?"Ver menos":"Ver mais";$("mais").setAttribute("aria-expanded",mostra>=NOTAS.length);ecoReveal(feed)}
$("mais").onclick=function(){mostra=mostra>=NOTAS.length?6:NOTAS.length;pinta()};pinta();
/* pendências por pessoa */
$("quem").innerHTML=Object.keys(EQUIPE).map(function(q){
 var it=[];P.forEach(function(p){p.p.forEach(function(x){if(x[0]===q)it.push('<li><a href="#'+p.id+'"><b>'+p.t+'</b>'+cd(x[1])+'</a></li>')})});
 return '<div class="vidro rev"><h3>'+q+'</h3><small>'+EQUIPE[q]+'</small>'+(it.length?'<ul>'+it.join("")+'</ul>':'<p class="vazio">Nada pendente.</p>')+'</div>'}).join("");
/* partes */
function pc(p){var cor=G[p.g].cor;
 return '<article class="vidro pc rev" id="'+p.id+'" data-s="'+p.s+'"><div class="topo-c"><div class="bolha k-'+cor+'"><img src="assets/ic/eco-'+p.ic+'.svg" alt=""></div><div><h4>'+p.t+'</h4><span class="st s-'+p.s+'">'+ST[p.s]+'</span></div></div>'
 +'<p class="o">'+cd(p.o)+'</p><dl><div><dt>Decidido</dt><dd>'+cd(p.d)+'</dd></div><div><dt>Em aberto</dt><dd>'+cd(p.a)+'</dd></div></dl>'
 +(p.p.length?'<div class="pend">'+p.p.map(function(x){return '<span><b>'+x[0]+':</b> '+cd(x[1])+'</span>'}).join("")+'</div>':'')
 +(p.l?'<a class="btn sm" href="'+p.l+'">'+p.r+' ▸</a>':'<span class="nolink">Sem link: o arquivo está no zip do projeto.</span>')+'</article>'}
var lista=$("partes-lista"),filtro="todas";
function partes(){lista.innerHTML=Object.keys(G).map(function(g){
 var ps=P.filter(function(p){return p.g===g&&(filtro==="todas"||p.s===filtro)});if(!ps.length)return"";
 return '<div class="grupo"><header><h3>'+G[g].nome+'</h3><p>'+G[g].txt+'</p></header><div class="cards">'+ps.map(pc).join("")+'</div></div>'}).join("")||'<p class="vazio">Nenhuma peça com esse status.</p>';ecoReveal(lista)}
$("filtros").innerHTML=[["todas","Todas"],["aprovado","Aprovado"],["decidido","Decidido"],["revisao","Em revisão"],["aberto","Aberto"]].map(function(f){return '<button type="button" data-f="'+f[0]+'" aria-pressed="'+(f[0]==="todas")+'">'+f[1]+'</button>'}).join("");
$("filtros").onclick=function(e){var b=e.target.closest("button");if(!b)return;filtro=b.dataset.f;[].forEach.call($("filtros").children,function(x){x.setAttribute("aria-pressed",x===b)});partes()};
partes();
if(location.hash){var t=document.querySelector(location.hash);if(t)setTimeout(function(){t.scrollIntoView()},50)}
})();
