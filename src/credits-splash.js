// Cinematic credits/splash intro.
// CSS (css/09-credits-splash.css) drives the mothership reveal + title cascade;
// this module drives the <canvas id="cs-warp"> hyperspace starfield and makes the
// "KonsKall" credit a link that doesn't trigger the credits -> menu tap-advance.
export function initCreditsSplash() {
  const canvas = document.getElementById('cs-warp');

  // KonsKall -> LinkedIn, without triggering the credits->menu tap advance
  const nameLink = document.querySelector('#credits-screen a.cs-name');
  if (nameLink) nameLink.addEventListener('click', (e) => e.stopPropagation());

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, cx, cy, dpr, stars = [], STAR_COUNT = 0;
  const maxDepth = 1000;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight; cx = w / 2; cy = h / 2;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makeStar() {
    return { x: (Math.random() * 2 - 1) * w, y: (Math.random() * 2 - 1) * h, z: Math.random() * maxDepth, pz: 0 };
  }
  function init() {
    resize();
    STAR_COUNT = Math.min(420, Math.floor((w * h) / 2600));
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar());
  }

  const startT = performance.now();
  const WARP_MS = 1700, WARP_SPEED = 30, DRIFT_SPEED = 0.4, STOP_MS = 3200;
  function speedAt(t) {
    if (reduce) return 0;
    if (t >= WARP_MS) return DRIFT_SPEED;
    const p = t / WARP_MS;
    return DRIFT_SPEED + (WARP_SPEED - DRIFT_SPEED) * (1 - Math.pow(p, 2.2));
  }
  function render(now) {
    const t = now - startT, speed = speedAt(t);
    ctx.fillStyle = 'rgba(3,6,12,' + (t < WARP_MS ? 0.30 : 0.5) + ')';
    ctx.fillRect(0, 0, w, h);
    const warpRatio = Math.max(0, Math.min(1, 1 - t / WARP_MS));
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.pz = s.z; s.z -= speed;
      if (s.z <= 1) { s.x = (Math.random() * 2 - 1) * w; s.y = (Math.random() * 2 - 1) * h; s.z = maxDepth; s.pz = s.z; }
      const k = 128 / s.z, sx = cx + s.x * k, sy = cy + s.y * k, pk = 128 / s.pz, px = cx + s.x * pk, py = cy + s.y * pk;
      if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
      const depth = 1 - s.z / maxDepth, size = depth * 1.8 + 0.25, alpha = 0.25 + depth * 0.75;
      if (speed > 1.5) {
        ctx.strokeStyle = 'rgba(' + Math.round(180 + 75 * depth) + ',232,242,' + (alpha * 0.9) + ')';
        ctx.lineWidth = size; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(' + Math.round(232 - warpRatio * 40) + ',247,250,' + alpha + ')';
        ctx.beginPath(); ctx.arc(sx, sy, size * 0.7, 0, Math.PI * 2); ctx.fill();
      }
    }
    // once we've "arrived", the opaque key-art covers the warp — stop to save CPU
    if (t < STOP_MS) requestAnimationFrame(render);
  }
  function staticField() {
    ctx.fillStyle = '#03060c'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i], k = 128 / s.z, sx = cx + s.x * k, sy = cy + s.y * k;
      if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
      const depth = 1 - s.z / maxDepth, alpha = 0.25 + depth * 0.7;
      ctx.fillStyle = 'rgba(232,247,250,' + alpha + ')';
      ctx.beginPath(); ctx.arc(sx, sy, depth * 1.6 + 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  init();
  if (reduce) staticField(); else requestAnimationFrame(render);

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { init(); if (reduce) staticField(); }, 150);
  });
}
