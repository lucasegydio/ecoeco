(() => {
const $ = (s) => document.querySelector(s), cs = getComputedStyle(document.documentElement);
const tok = (n) => cs.getPropertyValue(n).trim();
const hex = (c) => { c = c.trim(); if (c.startsWith("var(")) c = tok(c.slice(4, -1)); return c; };
const rgb = (h) => { h = hex(h).replace("#", ""); if (h.length === 3) h = [...h].map((x) => x + x).join(""); const n = parseInt(h.slice(0, 6), 16), a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1; return [n >> 16 & 255, n >> 8 & 255, n & 255, a]; };
const lin = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const over = (fg, bg, a) => bg.map((v, i) => i < 3 ? Math.round(fg[i] * a + v * (1 - a)) : 1);
const H = (c) => "#" + c.slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const AC = ["carinho", "polinizar", "minerar", "construir", "plantar", "canal"];
const ES = ["ok", "foco", "aceito", "falta", "bloqueado"];
window.PALETA = { tok, rgb, ratio, over, L };

// 1 paleta
const sw = [["Base", [["fundo", "--eco-fundo"], ["noite", "--eco-noite"], ["noite-2", "--eco-noite-2"]]], ["Luz", [["âmbar", "--eco-ambar"], ["coral", "--eco-coral"], ["lilás", "--eco-lilas"]]],
 ["Texto", [["texto", "--eco-texto"], ["texto-2", "--eco-texto-2"], ["texto-3", "--eco-texto-3"], ["tinta", "--eco-tinta"]]],
 ["Estado", [["ok/aceito (lima)", "--eco-ok"], ["foco", "--eco-foco"], ["falta", "--eco-falta"], ["bloqueado", "--eco-bloqueado-texto"]]],
 ["Ação", AC.flatMap((a) => [[a + " 1", `--eco-${a}-1`], [a + " 2", `--eco-${a}-2`]])]];
$("#sw").innerHTML = sw.map(([g, l]) => `<h3 style="grid-column:1/-1;margin:14px 0 0;font-size:.9rem" class="mudo">${g}</h3>` + l.map(([n, v]) => { const c = hex(`var(${v})`); const dark = L(rgb(c)) < .4; return `<div class="sw" style="background:${c};color:${dark ? "#fff" : "#232034"}"><b>${n}</b><code>${c}</code></div>`; }).join("")).join("");

// 3 contraste
const planet = [["planeta escuro", "#141c13"], ["planeta médio", "#2e3a1a"], ["planeta claro", "#495c2d"], ["ponto claro", "#6f8686"]];
const bgs = [];
planet.filter((p) => p[0] !== "ponto claro").forEach(([n, c]) => { bgs.push([n, rgb(c)]); });
const base = rgb(tok("--eco-noite")), VEU = +tok("--eco-veu"), fundo = rgb(tok("--eco-fundo"));
const glass = (c) => over([255, 255, 255], over(fundo, c, VEU), .14);
planet.forEach(([n, c]) => bgs.push(["vidro · " + n.replace("planeta ", ""), glass(rgb(c))]));
const warm = (c) => over(rgb(tok("--eco-ambar")), c, .38);
bgs.push(["vidro + luz âmbar · médio", glass(warm(rgb("#2e3a1a")))]);
bgs.push(["vidro + luz âmbar · noite", glass(warm(base))]);
const fgs = [["texto", "--eco-texto", 4.5], ["texto-2", "--eco-texto-2", 4.5], ["texto-3", "--eco-texto-3", 4.5], ["âmbar", "--eco-ambar", 3], ["lima", "--eco-lima", 3], ["falta", "--eco-falta", 3], ["acento", "--eco-acento", 3]];
const badge = (r, min) => r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AAg" : "F";
const cell = (r, min) => { const b = badge(r); const ok = r >= min; return `<td class="r ${ok ? b : "F"}">${r.toFixed(1)}${ok ? "" : " ✕"}</td>`; };
let fails = [];
$("#ct").innerHTML = `<tr><th>texto/ícone ↓ · fundo →</th>${bgs.map(([n]) => `<th>${n}</th>`).join("")}</tr>` + fgs.map(([n, v, min]) => `<tr><th>${n} <small>(≥${min})</small></th>${bgs.map(([bn, b]) => { const r = ratio(rgb(tok(v)), b); if (r < min) fails.push(`${n} sobre ${bn} ${r.toFixed(1)}`); return cell(r, min); }).join("")}</tr>`).join("");
// tinta sobre c1 e branco sobre c2
const bub = AC.map((a) => { const c1 = rgb(tok(`--eco-${a}-1`)), c2 = rgb(tok(`--eco-${a}-2`)); return [a, ratio(rgb(tok("--eco-tinta")), c1), ratio([255, 255, 255], c2)]; });
$("#ct").insertAdjacentHTML("beforeend", `<tr><th colspan="${bgs.length + 1}" class="mudo">Bolhas de ação: ícone tinta sobre cor 1 · ícone branco sobre cor 2 (ícone pede 3)</th></tr>` + bub.map(([a, x, y]) => `<tr><th>${a}</th><td class="r ${x >= 3 ? badge(x) : "F"}">tinta/1 ${x.toFixed(1)}</td><td class="r ${y >= 3 ? badge(y) : "F"}">branco/2 ${y.toFixed(1)}${y < 3 ? " ✕" : ""}</td></tr>`).join(""));
window.PALETA.bub = bub; window.PALETA.fails = fails;
$("#ct-res").textContent = fails.length ? "Abaixo do mínimo: " + fails.join(" · ") : "Todo texto passa de 4,5 e todo glifo de cor passa de 3 sobre planeta e vidro.";

// 2 demo com componentes reais
const ICONS = window.ECO_ICONS || {}; const IC = (id) => ICONS[id] || ICONS.eco || "";
const demo = $("#demo");
const bubble = (id, c1, c2, state = "ok", n = 0) => `<div class="fan-slot" style="--c1:${c1};--c2:${c2}"><button type="button" class="fan-item" data-state="${state}" data-id="${id}" aria-label="${id}"><i class="drop" aria-hidden="true"><i class="caustic"></i><i class="rim"></i></i><span class="ico" aria-hidden="true"><svg viewBox="0 0 32 32">${IC(id)}</svg></span>${n ? `<em class="short" aria-hidden="true">−${n}</em>` : ""}</button></div>`;
const act = (a, st) => bubble(a, tok(`--eco-${a}-1`), tok(`--eco-${a}-2`), st);
$("#fan").innerHTML = AC.map((a) => act(a, "ok")).join("");
$("#estados").innerHTML = [["carinho", "ok"], ["polinizar", "foco"], ["construir", "aceito"], ["minerar", "falta"], ["plantar", "bloqueado"]].map(([a, s]) => `<div style="width:64px;text-align:center">${s === "falta" ? bubble(a, tok(`--eco-${a}-1`), tok(`--eco-${a}-2`), s, 1) : act(a, s)}<small>${s}</small></div>`).join("");
document.querySelectorAll("#estados .fan-slot").forEach((e) => e.style.cssText += ";width:64px;height:64px");
document.querySelectorAll("#estados .fan-item").forEach((b) => b.classList.toggle("press", b.dataset.state === "foco"));
const BIO = ["terra", "deserto", "gelo", "oceano", "vulcao"];
const mk = (el, items, cb, cur) => { el.innerHTML = items.map((i) => `<button aria-pressed="${i === cur}">${i}</button>`).join(""); el.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); cb(b.textContent); }; };
mk($("#bio-btns"), BIO, (v) => document.body.dataset.bioma = v, "terra");
mk($("#lado-btns"), ["dia", "noite"], (v) => { document.body.dataset.lado = v === "noite" ? "noite" : ""; if (v !== "noite") delete document.body.dataset.lado; demo.dataset.lado = v; }, "dia");
demo.addEventListener("pointermove", (e) => { const r = demo.getBoundingClientRect(); demo.style.setProperty("--lx", (e.clientX - r.left) / r.width * 100 + "%"); demo.style.setProperty("--ly", (e.clientY - r.top) / r.height * 100 + "%"); });

// 4 biomas
$("#bio").innerHTML = BIO.map((b) => `<div class="card" data-bioma="${b}"><div class="row"><div class="mini"></div><div class="mini noite"></div></div><b>${b}</b><span class="hud-chip"><i class="dot" style="width:9px;height:9px;border-radius:50%;background:var(--eco-acento)"></i>Planeta ${b}</span><small class="r" data-b="${b}"></small></div>`).join("");
document.querySelectorAll("#bio .card").forEach((c) => { const ac = rgb(getComputedStyle(c).getPropertyValue("--eco-acento")); const bgv = glass(rgb("#2e3a1a")); c.querySelector("small").textContent = `acento ${H(ac)} · ${ratio(ac, bgv).toFixed(1)}:1 sobre vidro`; });

// 5 noite
const n1 = [tok("--eco-texto-3")]; // dia
const nt = () => { const e = document.createElement("div"); e.setAttribute("data-lado", "noite"); document.body.append(e); const g = (n) => getComputedStyle(e).getPropertyValue(n).trim(); const o = { t3: g("--eco-texto-3"), fundo: g("--eco-fundo"), luz: g("--eco-luz-forca"), amb: g("--eco-ambar") }; e.remove(); return o; };
const N = nt(), vn = over([255, 255, 255], over(rgb("#0d0e16"), rgb("#141c13"), VEU), .11);
$("#noite-ct").innerHTML = `<p class="mudo">Noite: fundo ${N.fundo}, luz ×${N.luz}, âmbar ${N.amb}. Texto-3 ${N.t3} sobre vidro noturno: <b class="r">${ratio(rgb(N.t3), vn).toFixed(1)}:1</b>; texto branco: <b class="r">${ratio([255, 255, 255], vn).toFixed(1)}:1</b>.</p>`;

// 6 daltonismo (Machado 2009, sev 1.0; aplicado em sRGB linear)
const M = { protanopia: [[.152286, 1.052583, -.204868], [.114503, .786281, .099216], [-.003882, -.048116, 1.051998]], deuteranopia: [[.367322, .860646, -.227968], [.280085, .672501, .047413], [-.011820, .042940, .968881]], tritanopia: [[1.255528, -.076749, -.178779], [-.078411, .930809, .147602], [.004733, .691367, .303900]] };
const enc = (v) => { v = Math.max(0, Math.min(1, v)); return Math.round((v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055) * 255); };
const sim = (c, m) => { const l = c.slice(0, 3).map(lin); return M[m].map((r) => enc(r[0] * l[0] + r[1] * l[1] + r[2] * l[2])); };
const lab = (c) => { const [r, g, b] = c.slice(0, 3).map(lin); let x = (.4124 * r + .3576 * g + .1805 * b) / .95047, y = .2126 * r + .7152 * g + .0722 * b, z = (.0193 * r + .1192 * g + .9505 * b) / 1.08883; const f = (t) => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
// itens: ação usa cor 2 (a cor da bolha cheia), estado usa a cor do estado
const items = [...AC.map((a) => ["ação·" + a, rgb(tok(`--eco-${a}-2`))]), ["ok", rgb(tok("--eco-ok"))], ["foco", rgb(tok("--eco-foco"))], ["falta", rgb(tok("--eco-falta"))], ["bloqueado", rgb(tok("--eco-bloqueado-texto"))]];
const modes = ["normal", ...Object.keys(M)];
$("#sim").innerHTML = modes.map((m) => `<figure><b>${m}</b><div class="st">${items.map(([n, c]) => { const s = m === "normal" ? c : sim(c, m); return `<span class="chipc" title="${n}" style="background:${H(s)}">${n.replace("ação·", "")}</span>`; }).join("")}</div></figure>`).join("");
// pares críticos: estados entre si e ação×ação, no pior modo
const pares = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { if ((i < 6) !== (j < 6)) continue; let w = 99, wm = ""; modes.forEach((m) => { const a = m === "normal" ? items[i][1] : sim(items[i][1], m), b = m === "normal" ? items[j][1] : sim(items[j][1], m); const d = dE(a, b); if (d < w) { w = d; wm = m; } }); pares.push([items[i][0], items[j][0], w, wm]); }
pares.sort((a, b) => a[2] - b[2]);
const weak = pares.filter((p) => p[2] < 15);
window.PALETA.weak = weak;
$("#de").innerHTML = `<tr><th>par (10 mais próximos)</th><th>pior modo</th><th>ΔE</th></tr>` + pares.slice(0, 10).map(([a, b, d, m]) => `<tr><td>${a} × ${b}</td><td>${m}</td><td class="r ${d < 15 ? "F" : d < 25 ? "AAg" : "AAA"}">${d.toFixed(0)}</td></tr>`).join("");
$("#de-res").textContent = weak.length ? `${weak.length} par(es) abaixo de 15: ${weak.map((p) => p[0] + "×" + p[1]).join(", ")}. Rede de segurança: cada ação tem ícone próprio e cada estado tem forma (cadeado, −n, borda de foco, brilho), então nada depende só da cor.` : "Nenhum par abaixo de 15.";
})();
