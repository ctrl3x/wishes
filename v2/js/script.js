'use strict';

document.addEventListener('DOMContentLoaded', function () {
  initHeroBetDrag();
  initBlackjackChipDrag();
  initBlackjackDealerCards();
  initScratchCard();
  initSuitsStopwatch();
  initSuitsPool();
  initDecorFrameSecond();
});

function initDecorFrameSecond() {
  var screen = document.getElementById('screen-second');
  if (screen === null) return;

  var img = screen.querySelector('.screen-spacer-img');
  if (img === null) return;
  var hint = screen.querySelector('.screen-spacer-hint');

  var clicks = 0;
  var thorns = [
    'img/frame/thorns1.svg',
    'img/frame/thorns2.svg',
    'img/frame/thorns3.svg'
  ];

  function showStartLook() {
    screen.classList.remove('screen-spacer--hint-hidden');
    screen.classList.remove('screen-spacer--finale');
    screen.classList.remove('screen-spacer--inverted-thorns');
    screen.classList.remove('screen-spacer--finale-text-visible');
    img.hidden = true;
    img.src = '';
    img.alt = '';
  }

  function showWhiteTextScreen() {
    screen.classList.add('screen-spacer--hint-hidden');
    screen.classList.add('screen-spacer--finale');
    screen.classList.remove('screen-spacer--inverted-thorns');
    screen.classList.add('screen-spacer--finale-text-visible');
    img.hidden = true;
  }

  function showThorn(number, blackMode) {
    screen.classList.add('screen-spacer--hint-hidden');
    screen.classList.remove('screen-spacer--finale-text-visible');

    if (blackMode) {
      screen.classList.add('screen-spacer--finale');
      screen.classList.add('screen-spacer--inverted-thorns');
    } else {
      screen.classList.remove('screen-spacer--finale');
      screen.classList.remove('screen-spacer--inverted-thorns');
    }

    img.src = thorns[number - 1];
    img.alt = 'Шипы терновника ' + number;
    img.hidden = false;
  }

  function whenUserClicks() {
    console.log('Клик по второму экрану (screen-spacer)');

    clicks = clicks + 1;

    // 8-й клик = возврат в начало цикла
    if (clicks === 8) {
      clicks = 0;
      showStartLook();
      return;
    }

    // 1-2-3 обычный тёрн
    if (clicks === 1) {
      showThorn(1, false);
      return;
    }
    if (clicks === 2) {
      showThorn(2, false);
      return;
    }
    if (clicks === 3) {
      showThorn(3, false);
      return;
    }

    // 4 белый экран с фразой
    if (clicks === 4) {
      showWhiteTextScreen();
      return;
    }

    // 5-6-7 чёрный тёрн на белом фоне
    if (clicks === 5) {
      showThorn(1, true);
      return;
    }
    if (clicks === 6) {
      showThorn(2, true);
      return;
    }
    if (clicks === 7) {
      showThorn(3, true);
      return;
    }
  }

  // если текстовый блок подсказки вдруг убрали из html — просто не ломаемся
  if (hint === null) {
    showStartLook();
  }

  screen.addEventListener('click', whenUserClicks);

  screen.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      whenUserClicks();
    }
    if (e.key === ' ') {
      e.preventDefault();
      whenUserClicks();
    }
  });
}

function initHeroBetDrag() {
  var container = document.querySelector('.hero');
  var bets = document.querySelectorAll('.hero .hero-bet');
  if (container === null || bets.length === 0) return;

  for (var i = 0; i < bets.length; i++) {
    (function (el) {
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;

      function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
      }

      function onPointerDown(e) {
        if (e.button !== 0 && e.type === 'mousedown') return;
        e.preventDefault();
        isDragging = true;
        var rect = el.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startLeft = rect.left - containerRect.left + container.scrollLeft;
        startTop = rect.top - containerRect.top + container.scrollTop;
        el.classList.add('hero-bet-dragging');
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var containerRect = container.getBoundingClientRect();
        var dx = clientX - startX;
        var dy = clientY - startY;
        var newLeft = startLeft + dx;
        var newTop = startTop + dy;
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        var maxW = containerRect.width;
        var maxH = containerRect.height;
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
    })(bets[i]);
  }
}

function initBlackjackChipDrag() {
  var container = document.querySelector('.section-blackjack');
  var chips = document.querySelectorAll('.section-blackjack .blackjack-chip');
  if (container === null || chips.length === 0) return;

  for (var i = 0; i < chips.length; i++) {
    (function (el) {
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;

      function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
      }

      function onPointerDown(e) {
        if (e.button !== 0 && e.type === 'mousedown') return;
        e.preventDefault();
        isDragging = true;
        var rect = el.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startLeft = rect.left - containerRect.left + container.scrollLeft;
        startTop = rect.top - containerRect.top + container.scrollTop;
        el.classList.add('blackjack-chip-dragging');
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var containerRect = container.getBoundingClientRect();
        var dx = clientX - startX;
        var dy = clientY - startY;
        var newLeft = startLeft + dx;
        var newTop = startTop + dy;
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        var maxW = containerRect.width;
        var maxH = containerRect.height;
        newLeft = clamp(newLeft, 0, maxW - w);
        newTop = clamp(newTop, 0, maxH - h);
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
      }

      function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('blackjack-chip-dragging');
      }

      el.addEventListener('mousedown', onPointerDown);
      el.addEventListener('touchstart', onPointerDown, { passive: false });
      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    })(chips[i]);
  }
}

function initBlackjackDealerCards() {
  var section = document.querySelector('.section-blackjack');
  if (section === null) return;

  var dealerCard = section.querySelector('.blackjack-card');
  if (dealerCard === null) return;

  var slots = section.querySelectorAll('.blackjack-card-slot');
  if (slots.length === 0) return;

  var nextCardIndex = 1;
  var maxCards = Math.min(slots.length, 6);

  function putCardToSlot(slot, cardIndex) {
    if (slot === null) return;

    var card = slot.querySelector('.blackjack-slot-card');
    if (card === null) {
      card = document.createElement('img');
      card.className = 'blackjack-slot-card';
      card.alt = '';
      card.setAttribute('role', 'presentation');
      slot.appendChild(card);
    }

    card.src = 'img/table/card_' + cardIndex + '.svg';
  }

  dealerCard.addEventListener('click', function () {
    if (nextCardIndex > maxCards) return;

    putCardToSlot(slots[nextCardIndex - 1], nextCardIndex);
    nextCardIndex = nextCardIndex + 1;
  });
}

function initScratchCard() {
  var section = document.querySelector('.section-prediction');
  var wrap = document.querySelector('.prediction-scratch-wrap');
  var canvas = document.querySelector('.prediction-scratch-canvas');
  var chip = document.querySelector('.prediction-chip');
  if (section === null || wrap === null || canvas === null || chip === null) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (ctx === null) return;

  var width = canvas.width;
  var height = canvas.height;
  var radius = 28;

  var scratchBg = new Image();

  function drawScratchLayer() {
    if (scratchBg.complete && scratchBg.naturalWidth > 0) {
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

  var scratchStep = Math.max(4, radius / 2);

  function scratchLine(x0, y0, x1, y1) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < scratchStep) {
      scratch(x1, y1);
      return;
    }
    var steps = Math.ceil(dist / scratchStep);
    var inv = 1 / steps;
    for (var i = 1; i <= steps; i++) {
      var t = i * inv;
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
  var el = document.querySelector('.suits-stopwatch-value');
  if (el === null) return;

  var startedAt = Date.now();

  function pad(n) {
    if (n < 10) return '0' + n;
    return String(n);
  }

  function tick() {
    var totalSeconds = Math.floor((Date.now() - startedAt) / 1000);
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;
    el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

function initSuitsPool() {
  var pool = document.getElementById('suits-pool');
  if (!pool) return;

  var section = document.querySelector('.section-suits');

  var suits = ['♠', '♥', '♦', '♣'];

  // координаты относительно pool, не viewport
  var poolLeft = 0;
  var poolTop = 0;
  var poolWidth = 0;
  var poolHeight = 0;
  var wallLeft = 0;
  var wallRight = 0;
  var wallTop = 0;
  var wallBottom = 0;
  var mouseX = null;
  var mouseY = null;

  var particles = [];

  function updateBounds() {
    var rect = pool.getBoundingClientRect();
    poolLeft = rect.left;
    poolTop = rect.top;
    poolWidth = rect.width;
    poolHeight = rect.height;

    if (section) {
      var sectRect = section.getBoundingClientRect();
      // стенки в координатах pool
      wallLeft = sectRect.left - poolLeft;
      wallRight = sectRect.right - poolLeft;
      wallTop = sectRect.top - poolTop;
      wallBottom = sectRect.bottom - poolTop;
    } else {
      wallLeft = 10;
      wallRight = poolWidth - 10;
      wallTop = 10;
      wallBottom = poolHeight - 10;
    }
  }

  function getParticleCount() {
    var width = window.innerWidth;
    // меньше мастей на узком экране
    if (width < 400) return 80;
    if (width < 800) return 150;
    if (width < 1200) return 300;
    if (width < 1600) return 500;
    return 800;
  }

  function createParticle() {
    var index = Math.floor(Math.random() * 4);
    var symbol = suits[index];

    var span = document.createElement('span');
    span.textContent = symbol;
    if (symbol === '♥' || symbol === '♦') {
      span.className = 'suits-particle suit-red';
    } else {
      span.className = 'suits-particle suit-black';
    }
    pool.appendChild(span);

    var zoneWidth = wallRight - wallLeft;
    var zoneHeight = wallBottom - wallTop;
    if (zoneWidth < 24) zoneWidth = 24;
    if (zoneHeight < 24) zoneHeight = 24;
    var minX = wallLeft + 12;
    var maxX = wallRight - 12;
    if (maxX < minX) maxX = minX;
    // спавн только внизу (нижние 30%)
    var bottomEdge = wallBottom - zoneHeight * 0.3;
    var minY = bottomEdge + 12;
    var maxY = wallBottom - 12;
    if (maxY < minY) maxY = minY;

    var startX = minX + Math.random() * (maxX - minX);
    var startY = minY + Math.random() * (maxY - minY);
    if (isNaN(startX)) startX = 50;
    if (isNaN(startY)) startY = 50;

    var vx = (Math.random() - 0.5) * 2.8;
    var vy = (Math.random() - 0.5) * 2.8;

    return {
      element: span,
      x: startX,
      y: startY,
      vx: vx,
      vy: vy
    };
  }

  function fillPool() {
    updateBounds();
    var count = getParticleCount();
    pool.innerHTML = '';
    particles = [];

    var i = 0;
    while (i < count) {
      particles.push(createParticle());
      i = i + 1;
    }
  }

  function step() {
    var i, j;
    var p, q;
    var dist;
    var dx, dy;
    var force;
    var nx, ny;
    var particleRadius = 10;
    var particleDiameter = particleRadius * 2; // диаметр для столкновений

    if (mouseX !== null && mouseY !== null) {
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        dx = p.x - mouseX;
        dy = p.y - mouseY;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.01) dist = 0.01; // иначе /0
        if (dist < 110) {
          force = (110 - dist) / 110 * 0.75;
          p.vx = p.vx + (dx / dist) * force;
          p.vy = p.vy + (dy / dist) * force;
        }
      }
    }

    // отталкивание мастей друг от друга
    for (i = 0; i < particles.length; i++) {
      for (j = i + 1; j < particles.length; j++) {
        p = particles[i];
        q = particles[j];
        dx = q.x - p.x;
        dy = q.y - p.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.01) dist = 0.01;
        if (dist < 28) {
          force = (28 - dist) / 28 * 0.11;
          nx = dx / dist;
          ny = dy / dist;
          p.vx = p.vx - nx * force;
          p.vy = p.vy - ny * force;
          q.vx = q.vx + nx * force;
          q.vy = q.vy + ny * force;
        }
      }
    }

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      p.vy = p.vy + 0.01;
      p.x = p.x + p.vx;
      p.y = p.y + p.vy;
      p.vx = p.vx * 0.995;
      p.vy = p.vy * 0.995;

      // отскок от границ
      if (p.x < wallLeft + particleRadius) {
        p.x = wallLeft + particleRadius;
        p.vx = p.vx * -0.72;
      }
      if (p.x > wallRight - particleRadius) {
        p.x = wallRight - particleRadius;
        p.vx = p.vx * -0.72;
      }
      if (p.y < wallTop) {
        p.y = wallTop;
        p.vy = p.vy * -0.72;
      }
      if (p.y > wallBottom - particleRadius) {
        p.y = wallBottom - particleRadius;
        p.vy = p.vy * -0.72;
      }
    }

    var iter;
    // развести пересекающиеся, 5 прохода чтобы меньше склеивалось
    for (iter = 0; iter < 5; iter++) {
      for (i = 0; i < particles.length; i++) {
        for (j = i + 1; j < particles.length; j++) {
          p = particles[i];
          q = particles[j];
          dx = q.x - p.x;
          dy = q.y - p.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.01) dist = 0.01;
          if (dist < particleDiameter) {
            var overlap = particleDiameter - dist;
            nx = dx / dist;
            ny = dy / dist;
            p.x = p.x - nx * overlap * 0.5;
            p.y = p.y - ny * overlap * 0.5;
            q.x = q.x + nx * overlap * 0.5;
            q.y = q.y + ny * overlap * 0.5;
            var relVel = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
            if (relVel < 0) {
              p.vx = p.vx - relVel * nx;
              p.vy = p.vy - relVel * ny;
              q.vx = q.vx + relVel * nx;
              q.vy = q.vy + relVel * ny;
            }
          }
        }
      }
    }

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      if (p.x < wallLeft + particleRadius) {
        p.x = wallLeft + particleRadius;
        p.vx = p.vx * -0.72;
      }
      if (p.x > wallRight - particleRadius) {
        p.x = wallRight - particleRadius;
        p.vx = p.vx * -0.72;
      }
      if (p.y < wallTop) {
        p.y = wallTop;
        p.vy = p.vy * -0.72;
      }
      if (p.y > wallBottom - particleRadius) {
        p.y = wallBottom - particleRadius;
        p.vy = p.vy * -0.72;
      }
    }

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      p.element.style.transform = 'translate(' + p.x + 'px, ' + p.y + 'px)';
    }
  }

  function loop() {
    step();
    requestAnimationFrame(loop);
  }

  function onMouseMove(e) {
    updateBounds();
    mouseX = e.clientX - poolLeft;
    mouseY = e.clientY - poolTop;
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    updateBounds();
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fillPool, 200); // debounce
  });

  document.addEventListener('mousemove', onMouseMove);

  fillPool();
  loop();
}
