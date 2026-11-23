// Cena 3D da carta v2. MODELO DO BICHO PROVISÓRIO (arte em 16 fatias); planeta, anéis, cristais, partículas e luz são finais de direção.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BIOMA = { terra: ['#9bd36b', '#3f6b2a', '#d6f5b0'], deserto: ['#f2b46a', '#8a5524', '#ffe2a8'], gelo: ['#a9dcff', '#3b6f9c', '#e6f6ff'] };
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(.25, '#fffa'); g.addColorStop(1, '#fff0'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();

const BG_V = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const BG_F = `varying vec2 vUv;uniform vec3 uA,uB,uC;uniform float uT,uRar;uniform vec2 uL;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 p=vUv-.5;
 vec3 col=mix(uB*.28,uB*.9,smoothstep(0.,1.,vUv.y));
 float d=length(p-vec2(0.,-.1)); col+=uA*.55*exp(-d*4.);
 vec2 q=vUv-uL; float a=atan(q.y,q.x); float r=pow(sin(a*11.+uT*.3)*.5+.5,3.)*pow(sin(a*5.-uT*.2)*.5+.5,1.5);
 col+=uC*r*.3*exp(-length(q)*2.2);
 vec2 g=floor(vUv*vec2(70.,70.)); float s=h(g); float tw=step(.986,s)*(.5+.5*sin(uT*2.+s*40.)); col+=vec3(tw)*.9;
 if(uRar>1.5){col+=.2*vec3(.5+.5*sin(uT*.7+vUv.x*6.),.5+.5*sin(uT*.7+vUv.x*6.+2.),.5+.5*sin(uT*.7+vUv.x*6.+4.))*smoothstep(.25,.95,vUv.y);}
 else if(uRar>.5){col+=vec3(1.,.8,.35)*.1*smoothstep(.4,1.,vUv.y);}
 col*=1.-1.6*dot(p,p); gl_FragColor=vec4(col,1.);}`;
const PL_V = 'varying vec3 vN,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const PL_F = `varying vec3 vN,vP;uniform vec3 uA,uB,uC,uLd;uniform float uT;
void main(){float b=sin(vP.y*5.+sin(vP.x*3.+uT*.2)*1.3+vP.z*2.);vec3 col=mix(uB,uA,smoothstep(-.5,.7,b));
 float c=sin(vP.x*6.+uT*.15)*sin(vP.z*5.+vP.y*2.);col=mix(col,uC,smoothstep(.5,.95,c)*.55);
 float l=max(dot(vN,normalize(uLd)),0.)*.95+.1;float f=pow(1.-max(vN.z,0.),2.6);
 gl_FragColor=vec4(col*l+uC*f*.9,1.);}`;

export function mount(canvas, o) {
  const [A, B, C] = (BIOMA[o.bioma] || BIOMA.terra).map(c => new THREE.Color(c));
  const rar = o.rar === 'l' ? 2 : o.rar === 'r' ? 1 : 0, foto = o.mode === 'foto';
  const r = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.z = 5;
  const U = { uA: { value: A }, uB: { value: B }, uC: { value: C }, uT: { value: 0 }, uRar: { value: rar }, uL: { value: new THREE.Vector2(.5, .6) } };
  // fundo
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShaderMaterial({ vertexShader: BG_V, fragmentShader: BG_F, uniforms: U, depthWrite: false })); bg.position.z = -9; scene.add(bg);
  // planeta + anéis + luas
  const pg = new THREE.Group(); pg.position.set(1.2, 1.15, -4.5); scene.add(pg);
  const PU = { uA: { value: A }, uB: { value: B }, uC: { value: C }, uT: U.uT, uLd: { value: new THREE.Vector3(.4, .5, 1) } };
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 32), new THREE.ShaderMaterial({ vertexShader: PL_V, fragmentShader: PL_F, uniforms: PU })); pg.add(planet);
  const atm = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C, blending: THREE.AdditiveBlending, transparent: true, opacity: .55, depthWrite: false })); atm.scale.setScalar(4.2); pg.add(atm);
  const ringMat = new THREE.MeshBasicMaterial({ color: C, transparent: true, opacity: .75 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.85, .018, 8, 160), ringMat), ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.25, .01, 8, 160), ringMat);
  const rg = new THREE.Group(); rg.rotation.set(1.15, .3, .5); rg.add(ring1, ring2); pg.add(rg);
  const moons = [0, 1].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(.09 - i * .025, 16, 12), new THREE.MeshBasicMaterial({ color: i ? A : '#fff' })); rg.add(m); return m; });
  // cristais
  const cm = new THREE.MeshStandardMaterial({ color: A, emissive: A, emissiveIntensity: .35, metalness: .25, roughness: .18, flatShading: true });
  const geo = new THREE.OctahedronGeometry(.17); geo.scale(1, 1.8, 1);
  const POS = [[-1.55, 1.2, -1.2], [1.65, -.55, -.8], [-1.85, -.35, -2], [.35, 1.7, -2.5], [1.95, .85, -1.5], [-.9, -1.35, -1], [1.15, -1.5, -2]];
  const cr = POS.map((p, i) => { const m = new THREE.Mesh(geo, cm); m.position.set(...p); m.scale.setScalar(.7 + (i % 3) * .3); m.userData = { p: p[1], s: .6 + i * .13 }; scene.add(m); return m; });
  // luzes
  scene.add(new THREE.AmbientLight('#ffffff', .75));
  const pl = new THREE.PointLight(C, 9, 14, 2); pl.position.set(0, 1, 2.5); scene.add(pl);
  const rim = new THREE.DirectionalLight(C, .8); rim.position.set(-2, 2, -3); scene.add(rim);
  const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd9a0', blending: THREE.AdditiveBlending, transparent: true, opacity: .16, depthWrite: false })); lg.scale.setScalar(2.6); lg.position.z = 1.2; scene.add(lg);
  // faíscas
  const N = 150, pp = new Float32Array(N * 3), sp = new Float32Array(N);
  for (let i = 0; i < N; i++) { pp.set([(Math.random() - .5) * 6, (Math.random() - .5) * 5, -2.5 + Math.random() * 3.5], i * 3); sp[i] = .1 + Math.random() * .3; }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pmat = new THREE.PointsMaterial({ map: glowTex, size: .13, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: rar == 1 ? '#ffd36b' : C }); scene.add(new THREE.Points(pgeo, pmat));
  // chão: anéis + sombra
  const floor = new THREE.Group(); floor.position.y = -1.12; floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const fm = new THREE.MeshBasicMaterial({ color: C, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
  floor.add(new THREE.Mesh(new THREE.RingGeometry(.92, .98, 80), fm), new THREE.Mesh(new THREE.RingGeometry(1.3, 1.33, 80), fm.clone()));
  const sh = new THREE.Mesh(new THREE.CircleGeometry(1.3, 40), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000', transparent: true, opacity: .55, depthWrite: false })); floor.add(sh);
  // bicho
  const g = new THREE.Group(); g.position.y = .05; scene.add(g);
  const mats = []; let ready = false, white;
  new THREE.TextureLoader().load(o.src, t => {
    t.colorSpace = THREE.SRGBColorSpace;
    const cv = document.createElement('canvas'); cv.width = t.image.width; cv.height = t.image.height; const x = cv.getContext('2d'); x.drawImage(t.image, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
    white = new THREE.CanvasTexture(cv);
    const a = t.image.width / t.image.height, h = 1.95, NS = 16, D = .5;
    for (let i = 0; i < NS; i++) {
      const k = i / (NS - 1), z = (k - .5) * D, s = 1 - .06 * Math.pow(Math.abs(k - .5) * 2, 2);
      const m = new THREE.MeshLambertMaterial({ map: foto ? t : white, emissive: foto ? '#fff' : '#3b2f66', emissiveMap: foto ? t : white, emissiveIntensity: foto ? .28 : .6, transparent: true, alphaTest: .45, side: THREE.DoubleSide });
      m.color.setScalar(foto ? .6 + .4 * (1 - Math.abs(k - .5) * 2) : .15);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(h * a * s, h * s), m); p.position.z = z; g.add(p); mats.push(m);
    }
    const hm = new THREE.MeshBasicMaterial({ map: white, color: foto ? C : '#7a5cff', transparent: true, blending: THREE.AdditiveBlending, opacity: .85, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(h * a * 1.1, h * 1.1), hm); halo.position.z = -.34; g.add(halo); ready = true;
  });
  // interação
  let zoom = 1, vx = 0, vy = 0, drag = false, tgt = new THREE.Quaternion(), nx = 0, ny = 0, lx = 0, ly = .3, tlx = 0, tly = .3;
  g.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 1.6); // entrada: gira até a frente
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), qq = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  const spin = (dx, dy) => { qq.setFromAxisAngle(AY, dx).multiply(q2.setFromAxisAngle(AX, dy)); g.quaternion.premultiply(qq); tgt = null; };
  canvas.style.touchAction = 'none';
  const norm = e => { const b = canvas.getBoundingClientRect(); tlx = Math.max(-1, Math.min(1, (e.clientX - b.left) / b.width * 2 - 1)); tly = Math.max(-1, Math.min(1, 1 - (e.clientY - b.top) / b.height * 2)); };
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = true; vx = vy = 0; norm(e); if (pts.size == 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom0 = zoom; } });
  canvas.addEventListener('pointermove', e => {
    norm(e); if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId);
    if (pts.size == 2) { pts.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...pts.values()]; zoom = Math.min(2.2, Math.max(.6, zoom0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0)); return; }
    const dx = (e.clientX - p[0]) * .011, dy = (e.clientY - p[1]) * .011; pts.set(e.pointerId, [e.clientX, e.clientY]); vx = dx; vy = dy; spin(dx, dy);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) drag = false; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.min(2.2, Math.max(.6, zoom * (e.deltaY > 0 ? .93 : 1.07))); }, { passive: false });
  // pós: bloom
  const comp = new EffectComposer(r); comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), foto ? .45 : .3, .6, .92); comp.addPass(bloom); comp.addPass(new OutputPass());
  const ro = new ResizeObserver(() => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); comp.setPixelRatio(r.getPixelRatio()); comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }); ro.observe(canvas);
  let raf; const clk = new THREE.Clock();
  (function loop() {
    raf = requestAnimationFrame(loop); if (document.hidden) return; const dt = Math.min(clk.getDelta(), .05), t = clk.elapsedTime; U.uT.value = t;
    if (!drag && (vx || vy)) { spin(vx, vy); vx *= .94; vy *= .94; if (Math.abs(vx) + Math.abs(vy) < .0004) vx = vy = 0; }
    if (tgt) { g.quaternion.slerp(tgt, .07); if (g.quaternion.angleTo(tgt) < .01) tgt = null; }
    lx += (tlx - lx) * .12; ly += (tly - ly) * .12;
    cam.position.x = lx * .3; cam.position.y = ly * .2; cam.lookAt(0, 0, 0);
    pl.position.set(lx * 3, ly * 2.4 + .6, 2.5); lg.position.set(lx * 1.9, ly * 1.6 + .2, 1.2);
    PU.uLd.value.set(lx * 1.2 - .2, ly * 1.2 + .2, 1); U.uL.value.set(.5 + lx * .25, .6 + ly * .2);
    planet.rotation.y = t * .05; rg.rotation.z = .5 + t * .05;
    moons[0].position.set(Math.cos(t * .6) * 1.85, Math.sin(t * .6) * 1.85, 0); moons[1].position.set(Math.cos(-t * .4 + 2) * 2.25, Math.sin(-t * .4 + 2) * 2.25, 0);
    cr.forEach((m, i) => { m.rotation.y = t * (.4 + i * .06); m.rotation.z = Math.sin(t * .5 + i) * .3; m.position.y = m.userData.p + Math.sin(t * m.userData.s + i) * .09; });
    const a = pgeo.attributes.position; for (let i = 0; i < N; i++) { let y = a.getY(i) + sp[i] * dt; if (y > 2.6) y = -2.6; a.setY(i, y); } a.needsUpdate = true;
    if (rar == 2) pmat.color.setHSL((t * .1) % 1, .8, .7);
    g.position.y = .05 + Math.sin(t * 1.1) * .035; g.scale.setScalar(zoom);
    floor.children[0].material.opacity = .55 + Math.sin(t * 2) * .2; floor.children[1].scale.setScalar(1 + Math.sin(t * 1.3) * .04);
    comp.render();
  })();
  return {
    reset() { tgt = new THREE.Quaternion(); vx = vy = 0; zoom = 1; },
    light(x, y) { tlx = x; tly = y; },
    get quat() { return g.quaternion; }, get zoom() { return zoom; },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); comp.dispose(); r.dispose(); }
  };
}
