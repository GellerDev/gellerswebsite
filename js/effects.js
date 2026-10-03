// =========================================================
// VISUAL EFFECTS
// Falling petals in the hero (canvas). Skipped entirely when the
// visitor has "reduce motion" enabled in their OS settings.
// =========================================================
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('petals');
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const COLORS = ['#ead9cc', '#e3cdb8', '#f2e6dc', '#d8c3a5', '#c5cfbf'];
  const pointer = { x: -9999, y: -9999 };

  let width = 0;
  let height = 0;
  let petals = [];
  let running = false;
  let heroVisible = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = width < 600 ? 16 : 30;
    while (petals.length < count) petals.push(createPetal(true));
    petals.length = count;
  }

  function createPetal(anywhere) {
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -20,
      size: 6 + Math.random() * 8,
      speed: 0.35 + Math.random() * 0.6,
      vx: 0,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.scale(Math.cos(p.phase) * 0.6 + 0.4, 1); // fake 3D tumbling
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.9, -p.size * 0.2, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.9, -p.size * 0.2, 0, -p.size);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    petals.forEach((p, i) => {
      // Gentle push away from the cursor / finger
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) p.vx += (dx / dist) * 0.35;
      p.vx *= 0.95;

      p.phase += 0.02;
      p.angle += p.spin;
      p.x += Math.sin(p.phase) * 0.5 + p.vx;
      p.y += p.speed;

      if (p.y > height + 20 || p.x < -40 || p.x > width + 40) petals[i] = createPetal(false);
      drawPetal(p);
    });

    requestAnimationFrame(frame);
  }

  function updateRunning() {
    const shouldRun = heroVisible && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      requestAnimationFrame(frame);
    } else if (!shouldRun) {
      running = false;
    }
  }

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  hero.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -9999;
  });

  // Pause when the hero is scrolled away or the tab is in the background
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    updateRunning();
  }).observe(hero);
  document.addEventListener('visibilitychange', updateRunning);
  window.addEventListener('resize', resize);

  resize();
  updateRunning();
})();
