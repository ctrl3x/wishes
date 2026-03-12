'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeroBetDrag();
  initScratchCard();
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
