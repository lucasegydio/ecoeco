// MODELO PROVISÓRIO: a arte 2D vira ~16 fatias empilhadas em profundidade (bulbo) para dar volume ao girar.
// Troque por glTF do time quando existir; a API (mount/setMode/reset/dispose) fica igual.
import * as THREE from 'three';

export function mount(canvas, src, mode = 'foto') {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.z = 5;
  const g = new THREE.Group(); scene.add(g);
  const mats = [];
  const tex = new THREE.TextureLoader().load(src, t => {
    const a = t.image.width / t.image.height, h = 2.4, N = 16, D = .5;
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1), z = (k - .5) * D, s = 1 - .06 * Math.pow(Math.abs(k - .5) * 2, 2);
      const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .45, side: THREE.DoubleSide });
      m.userData.k = 1 - .5 * Math.abs(k - .5) * 2; mats.push(m);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(h * a * s, h * s), m); p.position.z = z; g.add(p);
    }
    paint(); ready = true;
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  let ready = false, zoom = 1, vx = 0, vy = 0, drag = false, t0 = performance.now();
  const pts = new Map(); let pinch0 = 0, zoom0 = 1;
  const sil = new THREE.Color('#1b1630');
  function paint() { mats.forEach(m => { if (mode === 'foto') m.color.setScalar(.55 + .45 * m.userData.k); else m.color.copy(sil).multiplyScalar(.6 + .8 * m.userData.k); }); }
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  function spin(dx, dy) { q.setFromAxisAngle(AY, dx).multiply(new THREE.Quaternion().setFromAxisAngle(AX, dy)); g.quaternion.premultiply(q); }
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = true; vx = vy = 0; if (pts.size == 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom0 = zoom; } });
  canvas.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId);
    if (pts.size == 2) { pts.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...pts.values()]; zoom = Math.min(2.2, Math.max(.6, zoom0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0)); return; }
    const dx = (e.clientX - p[0]) * .011, dy = (e.clientY - p[1]) * .011; pts.set(e.pointerId, [e.clientX, e.clientY]); vx = dx; vy = dy; spin(dx, dy);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) drag = false; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.min(2.2, Math.max(.6, zoom * (e.deltaY > 0 ? .93 : 1.07))); }, { passive: false });
  const ro = new ResizeObserver(() => { const w = canvas.clientWidth, h = canvas.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }); ro.observe(canvas);
  let raf, tgt = null;
  (function loop(t) {
    raf = requestAnimationFrame(loop);
    if (!drag) { spin(vx, vy); vx *= .94; vy *= .94; if (Math.abs(vx) + Math.abs(vy) < .0004) { vx = vy = 0; } }
    if (tgt) { g.quaternion.slerp(tgt, .12); if (g.quaternion.angleTo(tgt) < .01) tgt = null; }
    g.position.y = Math.sin((t - t0) / 900) * .05; // flutua
    const s = zoom; g.scale.setScalar(s);
    r.render(scene, cam);
  })(0);
  return {
    setMode(m) { mode = m; if (ready) paint(); },
    reset() { tgt = new THREE.Quaternion(); vx = vy = 0; zoom = 1; },
    get zoom() { return zoom; }, get quat() { return g.quaternion; },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); r.dispose(); }
  };
}
