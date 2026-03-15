'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeroBetDrag();
  initScratchCard();
  initSuitsStopwatch();
  initSuitsPool();
});

function initHeroBetDrag() {
  const container = document.querySelector('.hero');
  const bets = document.querySelectorAll('.hero .hero-bet');
  if (!container || !bets.length) return;

  bets.forEach((el) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function getRect() {
      return el.getBoundingClientRect();
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function onPointerDown(e) {
      if (e.button !== 0 && e.type === 'mousedown') return;
      e.preventDefault();
      isDragging = true;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startLeft = rect.left - containerRect.left + container.scrollLeft;
      startTop = rect.top - containerRect.top + container.scrollTop;
      el.classList.add('hero-bet-dragging');
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const containerRect = container.getBoundingClientRect();
      const dx = clientX - startX;
      const dy = clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const maxW = containerRect.width;
      const maxH = containerRect.height;
      newLeft = clamp(newLeft, 0, maxW - w);
      newTop = clamp(newTop, 0, maxH - h);
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('hero-bet-dragging');
    }

    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: false });

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  });
}

/**
 * Лотерейная стирка: слой стирается только при перетаскивании фишки по билету.
 */
function initScratchCard() {
  const section = document.querySelector('.section-prediction');
  const wrap = document.querySelector('.prediction-scratch-wrap');
  const canvas = document.querySelector('.prediction-scratch-canvas');
  const chip = document.querySelector('.prediction-chip');
  if (!section || !wrap || !canvas || !chip) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const radius = 28;

  const scratchBg = new Image();

  function drawScratchLayer() {
    if (scratchBg.complete && scratchBg.naturalWidth) {
      ctx.drawImage(scratchBg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
    }
  }

  scratchBg.onload = drawScratchLayer;
  scratchBg.src = 'img/scratch-bg.png';

  function scratch(x, y) {
    if (x < -radius || x > width + radius || y < -radius || y > height + radius) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  const scratchStep = Math.max(4, radius / 2);
  function scratchLine(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < scratchStep) {
      scratch(x1, y1);
      return;
    }
    const steps = Math.ceil(dist / scratchStep);
    const inv = 1 / steps;
    for (let i = 1; i <= steps; i++) {
      const t = i * inv;
      scratch(x0 + dx * t, y0 + dy * t);
    }
  }

  function chipCenterToCanvas() {
    const chipRect = chip.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const centerX = chipRect.left + chipRect.width / 2;
    const centerY = chipRect.top + chipRect.height / 2;
    const scaleX = width / canvasRect.width;
    const scaleY = height / canvasRect.height;
    const x = (centerX - canvasRect.left) * scaleX;
    const y = (centerY - canvasRect.top) * scaleY;
    return { x, y, over: centerX >= canvasRect.left && centerX <= canvasRect.right && centerY >= canvasRect.top && centerY <= canvasRect.bottom };
  }

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let lastScratchX = null;
  let lastScratchY = null;

  function getChipPosition() {
    const l = parseFloat(chip.style.left);
    const t = parseFloat(chip.style.top);
    return { left: isNaN(l) ? null : l, top: isNaN(t) ? null : t };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function onChipPointerDown(e) {
    if (e.button !== 0 && e.type === 'mousedown') return;
    e.preventDefault();
    isDragging = true;
    lastScratchX = null;
    lastScratchY = null;
    section.classList.add('section-prediction--hint-hidden');
    chip.classList.add('prediction-chip-dragging');
    const chipRect = chip.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startLeft = chipRect.left - sectionRect.left + section.scrollLeft;
    startTop = chipRect.top - sectionRect.top + section.scrollTop;
  }

  function onChipPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const sectionRect = section.getBoundingClientRect();
    const dx = clientX - startX;
    const dy = clientY - startY;
    let newLeft = clamp(startLeft + dx, 0, sectionRect.width - chip.offsetWidth);
    let newTop = clamp(startTop + dy, 0, sectionRect.height - chip.offsetHeight);
    chip.style.left = newLeft + 'px';
    chip.style.top = newTop + 'px';
    startLeft = newLeft;
    startTop = newTop;
    startX = clientX;
    startY = clientY;

    const { x, y, over } = chipCenterToCanvas();
    if (over) {
      if (lastScratchX != null && lastScratchY != null) {
        scratchLine(lastScratchX, lastScratchY, x, y);
      } else {
        scratch(x, y);
      }
      lastScratchX = x;
      lastScratchY = y;
    } else {
      lastScratchX = null;
      lastScratchY = null;
    }
  }

  function onChipPointerUp(e) {
    if (!isDragging) return;
    e.preventDefault();
    isDragging = false;
    lastScratchX = null;
    lastScratchY = null;
    chip.classList.remove('prediction-chip-dragging');
  }

  chip.addEventListener('mousedown', onChipPointerDown);
  chip.addEventListener('touchstart', onChipPointerDown, { passive: false });
  document.addEventListener('mousemove', onChipPointerMove);
  document.addEventListener('mouseup', onChipPointerUp);
  document.addEventListener('touchmove', onChipPointerMove, { passive: false });
  document.addEventListener('touchend', onChipPointerUp, { passive: false });

  canvas.style.pointerEvents = 'none';
  drawScratchLayer();
}

function initSuitsStopwatch() {
  const el = document.querySelector('.suits-stopwatch-value');
  if (!el) return;
  const startedAt = Date.now();
  function pad(n) {
    return String(n).padStart(2, '0');
  }
  function tick() {
    const totalSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  tick();
  setInterval(tick, 1000);
}

function initSuitsPool() {
  const pool = document.getElementById('suits-pool');
  const section = document.querySelector('.section-suits');
  if (!pool) return;

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RED_SUITS = ['♥', '♦'];
  const PARTICLE_COUNT_MAX = 800;
  const PARTICLE_COUNT_MIN = 80;
  const REFERENCE_WIDTH = 1920;
  const DAMPING = 0.995;
  const REPULSION_RADIUS = 110;
  const REPULSION_STRENGTH = 0.58;
  const PARTICLE_RADIUS = 10;
  const WALL_BOUNCE = 0.72;
  const COLLISION_ITERATIONS = 3;
  const PARTICLE_REPEL_RADIUS = 28;
  const PARTICLE_REPEL_STRENGTH = 0.06;

  let poolRect = { left: 0, top: 0, width: 0, height: 0 };
  let wallLeftX = 0;
  let wallRightX = 0;
  let wallTopY = 0;
  let wallBottomY = 0;
  let mouseX = null;
  let mouseY = null;

  function updateRect() {
    const r = pool.getBoundingClientRect();
    poolRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    const w = r.width;
    const h = r.height;
    const R = PARTICLE_RADIUS;
    if (section) {
      const sr = section.getBoundingClientRect();
      wallLeftX = sr.left - r.left;
      wallRightX = sr.right - r.left;
      wallTopY = sr.top - r.top;
      wallBottomY = sr.bottom - r.top;
    } else {
      wallLeftX = R;
      wallRightX = w - R;
      wallTopY = R;
      wallBottomY = h - R;
    }
  }

  const particles = [];

  function createParticle() {
    const symbol = SUITS[Math.floor(Math.random() * SUITS.length)];
    const span = document.createElement('span');
    span.className = 'suits-particle ' + (RED_SUITS.includes(symbol) ? 'suit-red' : 'suit-black');
    span.textContent = symbol;
    pool.appendChild(span);

    const w = poolRect.width;
    const h = poolRect.height;
    const R = PARTICLE_RADIUS;
    const xMin = Math.max(R, wallLeftX + R);
    const xMax = Math.min(w - R, wallRightX - R);
    const yMin = Math.max(R, wallTopY + R);
    const yMax = Math.min(h - R, wallBottomY - R);
    const x = xMin + Math.random() * Math.max(0, xMax - xMin) || R;
    const y = yMin + Math.random() * Math.max(0, yMax - yMin) || R;
    const vx = (Math.random() - 0.5) * 2.8;
    const vy = (Math.random() - 0.5) * 2.8;

    return { el: span, x, y, vx, vy };
  }

  function getParticleCount() {
    const w = typeof window !== 'undefined' ? window.innerWidth : REFERENCE_WIDTH;
    return Math.min(PARTICLE_COUNT_MAX, Math.max(PARTICLE_COUNT_MIN, Math.round((w / REFERENCE_WIDTH) * PARTICLE_COUNT_MAX)));
  }

  function initParticles() {
    updateRect();
    const count = getParticleCount();
    pool.innerHTML = '';
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function step() {
    const w = poolRect.width;
    const h = poolRect.height;
    const twoR = PARTICLE_RADIUS * 2;

    for (const p of particles) {
      if (mouseX != null && mouseY != null) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < REPULSION_RADIUS) {
          const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS * REPULSION_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < PARTICLE_REPEL_RADIUS && dist > 0.001) {
          const force = (PARTICLE_REPEL_RADIUS - dist) / PARTICLE_REPEL_RADIUS * PARTICLE_REPEL_STRENGTH;
          const nx = dx / dist;
          const ny = dy / dist;
          a.vx -= nx * force;
          a.vy -= ny * force;
          b.vx += nx * force;
          b.vy += ny * force;
        }
      }
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= DAMPING;
      p.vy *= DAMPING;

      if (p.x < wallLeftX + PARTICLE_RADIUS) {
        p.x = wallLeftX + PARTICLE_RADIUS;
        p.vx *= -WALL_BOUNCE;
      }
      if (p.x > wallRightX - PARTICLE_RADIUS) {
        p.x = wallRightX - PARTICLE_RADIUS;
        p.vx *= -WALL_BOUNCE;
      }
      if (p.y < wallTopY) {
        p.y = wallTopY;
        p.vy *= -WALL_BOUNCE;
      }
      if (p.y > wallBottomY - PARTICLE_RADIUS) {
        p.y = wallBottomY - PARTICLE_RADIUS;
        p.vy *= -WALL_BOUNCE;
      }
    }

    for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (dist < twoR) {
            const overlap = twoR - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            const vRel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (vRel < 0) {
              a.vx -= vRel * nx;
              a.vy -= vRel * ny;
              b.vx += vRel * nx;
              b.vy += vRel * ny;
            }
          }
        }
      }
    }

    for (const p of particles) {
      if (p.x < wallLeftX + PARTICLE_RADIUS) {
        p.x = wallLeftX + PARTICLE_RADIUS;
        p.vx *= -WALL_BOUNCE;
      }
      if (p.x > wallRightX - PARTICLE_RADIUS) {
        p.x = wallRightX - PARTICLE_RADIUS;
        p.vx *= -WALL_BOUNCE;
      }
      if (p.y < wallTopY) {
        p.y = wallTopY;
        p.vy *= -WALL_BOUNCE;
      }
      if (p.y > wallBottomY - PARTICLE_RADIUS) {
        p.y = wallBottomY - PARTICLE_RADIUS;
        p.vy *= -WALL_BOUNCE;
      }
    }

    for (const p of particles) {
      p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
  }

  function loop() {
    step();
    requestAnimationFrame(loop);
  }

  function onMouseMove(e) {
    updateRect();
    mouseX = e.clientX - poolRect.left;
    mouseY = e.clientY - poolRect.top;
  }

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    updateRect();
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initParticles, 200);
  });

  document.addEventListener('mousemove', onMouseMove);

  initParticles();
  requestAnimationFrame(loop);
}
