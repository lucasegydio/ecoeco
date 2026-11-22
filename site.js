/* ecoeco · topo, luz que segue o dedo, revelar ao rolar, brilho nos cartões */
(function(){
var pg=document.body.dataset.page||"";
var nav=[["index.html#novidades","Novidades","novidades"],["index.html#pendencias","Pendências","pend"],["index.html#partes","Partes","partes"],["timeline.html","Timeline","timeline"]];
var h='<header class="topo"><div class="wrap"><a class="marca" href="index.html" aria-label="ecoeco, início"><i></i>ecoeco</a><nav class="nav" aria-label="Principal">';
nav.forEach(function(n){h+='<a href="'+n[0]+'"'+(pg===n[2]?' aria-current="page"':'')+'>'+n[1]+'</a>'});
h+='<a class="jogar" href="frentes/prototipo/">Jogar ▸</a></nav></div></header>';
var d=document.getElementById("topo");if(d)d.outerHTML=h;
var f=document.getElementById("rodape");
if(f)f.outerHTML='<footer class="wrap rodape"><span>ecoeco™ · Mundos e Bichinhos · estudo de UI/UX</span><span><a href="jogo.html#jogo">Protótipo da rodada 20</a> · <a href="referencias.html">Referências</a></span></footer>';
var luz=document.createElement("div");luz.className="luz";luz.setAttribute("aria-hidden","true");document.body.prepend(luz);
addEventListener("pointermove",function(e){luz.style.setProperty("--lx",e.clientX+"px");luz.style.setProperty("--ly",e.clientY+"px");
 var c=e.target.closest&&e.target.closest(".vidro");if(c){var r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")}},{passive:true});
window.ecoReveal=function(root){var els=(root||document).querySelectorAll(".rev:not(.in)");
 if(!("IntersectionObserver"in window)){els.forEach(function(e){e.classList.add("in")});return}
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{rootMargin:"0px 0px -6% 0px"});
 els.forEach(function(e){io.observe(e)})};
document.addEventListener("DOMContentLoaded",function(){ecoReveal()});
})();
