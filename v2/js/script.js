'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeroBetDrag();
  initScratchCard();
  initSuitsStopwatch();
  initSuitsPool();
});

/**
 * Перетаскивание hero-bet в рамках первого экрана (hero).
 */
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
 * Лотерейная стирка: верхний слой карточки предсказания стирается курсором при нажатии и движении.
 */
function initScratchCard() {
  const wrap = document.querySelector('.prediction-scratch-wrap');
  const canvas = document.querySelector('.prediction-scratch-canvas');
  if (!wrap || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  /** Рисует верхний слой «стирки» (как на лотерейном билете). */
  function drawScratchLayer() {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.25, '#e8e8e8');
    gradient.addColorStop(0.5, '#a0a0a0');
    gradient.addColorStop(0.75, '#d0d0d0');
    gradient.addColorStop(1, '#b0b0b0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Лёгкая текстура «металлика»
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Подсказка
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.font = '18px Cormorant Garamond, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Потрите, чтобы увидеть предсказание', width / 2, height - 30);
  }

  let isDrawing = false;
  const radius = 28;

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    scratch(x, y);
  }

  function moveDraw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    scratch(x, y);
  }

  function endDraw(e) {
    e.preventDefault();
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw, { passive: false });

  drawScratchLayer();
}

/**
 * Секундомер в секции с мастями: запускается при загрузке, формат ЧЧ:ММ:СС.
 */
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

/**
 * «Бассейн» мастей: частицы ♠ ♥ ♦ ♣ с физикой, отталкиваются от курсора.
 */
function initSuitsPool() {
  const pool = document.getElementById('suits-pool');
  const section = document.querySelector('.section-suits');
  if (!pool) return;

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RED_SUITS = ['♥', '♦'];
  const PARTICLE_COUNT = 800;
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
  let mouseX = null;
  let mouseY = null;

  function updateRect() {
    const r = pool.getBoundingClientRect();
    poolRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    if (section) {
      const sr = section.getBoundingClientRect();
      wallLeftX = sr.left - r.left;
      wallRightX = sr.right - r.left;
    } else {
      wallLeftX = PARTICLE_RADIUS;
      wallRightX = r.width - PARTICLE_RADIUS;
    }
  }

  const particles = [];

  function createParticle() {
    const symbol = SUITS[Math.floor(Math.random() * SUITS.length)];
    const span = document.createElement('span');
    span.className = 'suits-particle ' + (RED_SUITS.includes(symbol) ? 'suit-red' : 'suit-black');
    span.textContent = symbol;
    pool.appendChild(span);

    const x = wallLeftX + PARTICLE_RADIUS + Math.random() * (wallRightX - wallLeftX - PARTICLE_RADIUS * 2);
    const y = PARTICLE_RADIUS + Math.random() * (poolRect.height - PARTICLE_RADIUS * 2);
    const vx = (Math.random() - 0.5) * 2.8;
    const vy = (Math.random() - 0.5) * 2.8;

    return { el: span, x, y, vx, vy };
  }

  function initParticles() {
    updateRect();
    pool.innerHTML = '';
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
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
      if (p.y > h - PARTICLE_RADIUS) {
        p.y = h - PARTICLE_RADIUS;
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
      if (p.y > h - PARTICLE_RADIUS) {
        p.y = h - PARTICLE_RADIUS;
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

  window.addEventListener('resize', () => {
    updateRect();
  });

  document.addEventListener('mousemove', onMouseMove);

  initParticles();
  requestAnimationFrame(loop);
}
