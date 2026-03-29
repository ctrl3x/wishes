import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function appendDevCacheBust(resourceUrl) {
  if (typeof location === 'undefined') {
    return resourceUrl;
  }
  var host = location.hostname;
  var isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1';
  if (!isLocal) {
    return resourceUrl;
  }
  var hasQuery = resourceUrl.indexOf('?') !== -1;
  return resourceUrl + (hasQuery ? '&' : '?') + '_devcb=' + String(Date.now());
}

function runPageInits() {
  initHeroSnakeModel();
  initCustomCursorLikeAHumanityFreshman();
  initHeroBetDrag();
  initBlackjackChipDrag();
  initBlackjackDealerCards();
  initScratchCard();
  initPredictionDiceRolls();
  initSuitsStopwatch();
  initSuitsPool();
  initDecorFrameSecond();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runPageInits);
} else {
  runPageInits();
}

function initHeroSnakeModel() {
  var mount = document.querySelector('.hero-snake');
  var modelHost = document.querySelector('.hero-snake-model');

  if (mount == null || modelHost == null) {
    return;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  var loader = new GLTFLoader();
  var modelPivot = new THREE.Group();
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var animationId = 0;
  var model = null;
  var twoPi = Math.PI * 2;
  /* камера сверху; вращение вокруг X — на экране «верх/низ», не вокруг Y (лево/право) */
  var topViewPitchBase = -Math.PI / 2 + 0.08;
  var currentRotationX = 0;
  var velocityX = 0.0085;
  var isDragging = false;
  var lastPointerX = 0;
  var lastPointerY = 0;
  var pointerId = null;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  modelHost.appendChild(renderer.domElement);
  scene.add(modelPivot);
  modelPivot.rotation.order = 'YXZ';

  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 2.1);
  var keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  var fillLight = new THREE.DirectionalLight(0x9eb6ff, 1.4);
  var rimLight = new THREE.DirectionalLight(0xffffff, 1.1);

  keyLight.position.set(4.2, 2.2, 4.5);
  fillLight.position.set(-4.5, 2.4, -3.8);
  rimLight.position.set(2.4, 0.8, -4.2);

  scene.add(hemiLight);
  scene.add(keyLight);
  scene.add(fillLight);
  scene.add(rimLight);

  function renderFrame() {
    renderer.render(scene, camera);
  }

  function heroSnakeWidthScaleMul() {
    var w = window.innerWidth;
    var wNarrow = 430;
    var wWide = 1600;
    var mulNarrow = 1;
    var mulWide = 1.32 * 0.95;
    if (w <= wNarrow) {
      return mulNarrow;
    }
    if (w >= wWide) {
      return mulWide;
    }
    return mulNarrow + (mulWide - mulNarrow) * (w - wNarrow) / (wWide - wNarrow);
  }

  function fitModelToFrame() {
    if (model == null) {
      return;
    }

    model.scale.setScalar(1);
    model.position.set(0, 0, 0);

    var box = new THREE.Box3().setFromObject(model);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var maxSide = Math.max(size.x, size.y, size.z);

    if (!isFinite(maxSide) || maxSide <= 0) {
      maxSide = 1;
    }

    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    var baseFit = (3.35 * 0.9 * 0.95 * 0.9) * heroSnakeWidthScaleMul();
    model.scale.setScalar(baseFit / maxSide);

    box.setFromObject(model);
    size = box.getSize(new THREE.Vector3());
    center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    modelPivot.position.set(0, -size.y * 0.08, 0);
  }

  function resizeRenderer() {
    var width = mount.clientWidth;
    var height = mount.clientHeight;

    if (width <= 0 || height <= 0) {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.up.set(0, 0, -1);
    camera.position.set(0, 6.35, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    fitModelToFrame();
    renderFrame();
  }

  function animate() {
    if (model != null) {
      if (!isDragging) {
        velocityX *= 0.96;
        if (Math.abs(velocityX) < 0.0025) {
          velocityX = velocityX <= 0 ? -0.0025 : 0.0025;
        }
      }

      currentRotationX += velocityX;
      currentRotationX =
        ((currentRotationX % twoPi) + twoPi) % twoPi;

      modelPivot.rotation.y = 0;
      modelPivot.rotation.x = topViewPitchBase + currentRotationX;
      modelPivot.rotation.z = 0;
    }

    renderFrame();
    animationId = window.requestAnimationFrame(animate);
  }

  function onPointerDown(event) {
    if (model == null) {
      return;
    }

    isDragging = true;
    pointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    velocityX = 0;

    if (renderer.domElement.setPointerCapture != null) {
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging || pointerId !== event.pointerId) {
      return;
    }

    var deltaX = event.clientX - lastPointerX;
    var deltaY = event.clientY - lastPointerY;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    velocityX = deltaY * 0.012 + deltaX * 0.004;
    renderFrame();

    event.preventDefault();
  }

  function onPointerUp(event) {
    if (pointerId !== event.pointerId) {
      return;
    }

    isDragging = false;
    pointerId = null;

    if (Math.abs(velocityX) < 0.003) {
      velocityX = velocityX < 0 ? -0.003 : 0.003;
    }
  }

  loader.load(
    encodeURI(appendDevCacheBust('3d/Snake-white-and-eyes.glb')),
    function (gltf) {
      model = gltf.scene;

      model.traverse(function (child) {
        if (!child.isMesh) {
          return;
        }

        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material != null && 'envMapIntensity' in child.material) {
          child.material.envMapIntensity = 1.1;
        }
      });

      modelPivot.add(model);
      resizeRenderer();

      if (reduceMotionQuery.matches) {
        modelPivot.rotation.y = 0;
        modelPivot.rotation.x = topViewPitchBase + currentRotationX;
        modelPivot.rotation.z = 0;
        renderFrame();
        return;
      }

      if (animationId) {
        window.cancelAnimationFrame(animationId);
      }
      animate();
    },
    undefined,
    function (error) {
      console.error('[hero-snake] failed to load glb model:', error);
    }
  );

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerUp);
  window.addEventListener('resize', resizeRenderer);
  window.requestAnimationFrame(resizeRenderer);
}

function initCustomCursorLikeAHumanityFreshman() {
  var canUseThis = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!canUseThis.matches) {
    return;
  }

  var circle = document.createElement('div');
  circle.className = 'custom-cursor';
  circle.setAttribute('aria-hidden', 'true');
  document.body.appendChild(circle);
  document.body.classList.add('has-custom-cursor');

  function putCircleSomewhere(x, y) {
    var leftValue = x + 'px';
    var topValue = y + 'px';
    circle.style.left = leftValue;
    circle.style.top = topValue;
  }

  function showCircle() {
    circle.classList.add('is-visible');
  }

  function hideCircle() {
    circle.classList.remove('is-visible');
    circle.classList.remove('is-pressed');
  }

  function pressCircle() {
    circle.classList.add('is-pressed');
  }

  function unpressCircle() {
    circle.classList.remove('is-pressed');
  }

  document.addEventListener('mousemove', function (e) {
    var x = e.clientX;
    var y = e.clientY;
    putCircleSomewhere(x, y);
    showCircle();
  });

  document.addEventListener('mouseenter', function (e) {
    var x = e.clientX;
    var y = e.clientY;
    putCircleSomewhere(x, y);
    showCircle();
  });

  document.addEventListener('mouseleave', function () {
    hideCircle();
  });

  document.addEventListener('mousedown', function () {
    pressCircle();
  });

  document.addEventListener('mouseup', function () {
    unpressCircle();
  });

  window.addEventListener('blur', function () {
    hideCircle();
  });
}


function initDecorFrameSecond() {
  var screen = document.getElementById('screen-second');
  if (screen == null) {
    return;
  }

  var img = screen.querySelector('.screen-spacer-img');
  if (img == null) return;

  var hint = screen.querySelector('.screen-spacer-hint');
  var wishWords = screen.querySelectorAll('.wish-word');
  var minWishSize = 10;
  var maxWishSize = 28;
  var stickyWishIndexes = null;

  function resetWishWordsScale() {
    var i;
    for (i = 0; i < wishWords.length; i++) {
      wishWords[i].style.setProperty('--wish-size', String(minWishSize));
    }
    stickyWishIndexes = null;
  }

  function pickRandomWishIndexes() {
    if (wishWords.length == 0) {
      return [];
    }

    var amount = 3 + Math.floor(Math.random() * 5); // 3..7 слов за клик
    if (amount > wishWords.length) amount = wishWords.length;

    var selected = {};
    var picked = 0;
    while (picked < amount) {
      var idx = Math.floor(Math.random() * wishWords.length);
      if (selected[idx]) continue;
      selected[idx] = true;
      picked++;
    }

    var indexes = [];
    var key;
    for (key in selected) {
      if (selected.hasOwnProperty(key)) {
        indexes.push(parseInt(key, 10));
      }
    }
    return indexes;
  }

  function growWishWordsByIndexes(indexes) {
    var i;
    for (i = 0; i < indexes.length; i++) {
      var word = wishWords[indexes[i]];
      if (!word) continue;
      var currentSize = parseFloat(word.style.getPropertyValue('--wish-size'));
      if (isNaN(currentSize) || currentSize <= 0) {
        currentSize = minWishSize;
      }
      var nextSize = currentSize + 2.4;
      if (nextSize > maxWishSize) {
        nextSize = maxWishSize;
      }
      word.style.setProperty('--wish-size', String(nextSize));
    }
  }

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
    resetWishWordsScale();
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
    screen.classList.add('screen-spacer--finale-text-visible');

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
    console.log('click: screen-second');
    if (clicks <= 2) {
      if (stickyWishIndexes == null || stickyWishIndexes.length == 0) {
        stickyWishIndexes = pickRandomWishIndexes();
      }
      growWishWordsByIndexes(stickyWishIndexes);
    } else {
      growWishWordsByIndexes(pickRandomWishIndexes());
    }

    clicks++;

    if (clicks === 8) {
      clicks = 0;
      showStartLook();
      return;
    }

    if (clicks == 1) {
      showThorn(1, false);
      return;
    }
    if (clicks == 2) {
      showThorn(2, false);
      return;
    }
    if (clicks == 3) {
      showThorn(3, false);
      return;
    }

    if (clicks == 4) {
      showWhiteTextScreen();
      return;
    }

    if (clicks == 5) {
      showThorn(1, true);
      return;
    }
    if (clicks == 6) {
      showThorn(2, true);
      return;
    }
    if (clicks == 7) {
      showThorn(3, true);
      return;
    }
  }

  if (hint == null) {
    showStartLook();
  }

  screen.addEventListener('click', whenUserClicks);

  screen.addEventListener('keydown', function (ev) {
    if (ev.key == 'Enter' || ev.key == ' ') {
      ev.preventDefault();
      whenUserClicks();
    }
  });
}

function initHeroBetDrag() {
  var mobileBoard = document.querySelector('.hero .hero-rotator-inner');
  var container = mobileBoard || document.querySelector('.hero');
  var bets = document.querySelectorAll('.hero .hero-bet');
  if (container == null || bets.length == 0) {
    return;
  }

  for (var i = 0; i < bets.length; i++) {
    (function (el) {
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;

      function clamp(value, min, max) {
        if (value < min) {
          return min;
        }
        if (value > max) {
          return max;
        }
        return value;
      }

      function onPointerDown(e) {
        if (e.button != 0 && e.type == 'mousedown') return;
        e.preventDefault();
        isDragging = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        var inlineLeft = parseFloat(el.style.left);
        var inlineTop = parseFloat(el.style.top);
        startLeft = isNaN(inlineLeft) ? el.offsetLeft : inlineLeft;
        startTop = isNaN(inlineTop) ? el.offsetTop : inlineTop;
        el.classList.add('hero-bet-dragging');
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var rawDx = clientX - startX;
        var rawDy = clientY - startY;
        /* hero: .hero-rotator-inner без rotate на мобильных — экранные дельты = left/top */
        var dx = rawDx;
        var dy = rawDy;

        var newLeft = startLeft + dx;
        var newTop = startTop + dy;
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        newLeft = clamp(newLeft, 0, container.clientWidth - w);
        newTop = clamp(newTop, 0, container.clientHeight - h);
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        startLeft = newLeft;
        startTop = newTop;
        startX = clientX;
        startY = clientY;
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
  var section = document.querySelector('.section-blackjack');
  var boardWrap = document.querySelector('.section-blackjack .blackjack-board-wrap');
  var rotatorInner = document.querySelector('.section-blackjack .blackjack-rotator-inner');
  var dragBox = rotatorInner || boardWrap || section;
  var chips = document.querySelectorAll('.section-blackjack .blackjack-chip');
  if (!section || !dragBox || chips.length === 0) {
    return;
  }

  for (var i = 0; i < chips.length; i++) {
    (function (chip) {
      var dragging = false;
      var lastPointerX = 0;
      var lastPointerY = 0;
      var chipLeft = 0;
      var chipTop = 0;

      function onPointerDown(e) {
        if (e.button != 0 && e.type == 'mousedown') {
          return;
        }
        e.preventDefault();
        dragging = true;
        lastPointerX = e.touches ? e.touches[0].clientX : e.clientX;
        lastPointerY = e.touches ? e.touches[0].clientY : e.clientY;
        var fromStyleLeft = parseFloat(chip.style.left);
        var fromStyleTop = parseFloat(chip.style.top);
        chipLeft = isNaN(fromStyleLeft) ? chip.offsetLeft : fromStyleLeft;
        chipTop = isNaN(fromStyleTop) ? chip.offsetTop : fromStyleTop;
        chip.classList.add('blackjack-chip-dragging');
      }

      function onPointerMove(e) {
        if (!dragging) {
          return;
        }
        e.preventDefault();
        var x = e.touches ? e.touches[0].clientX : e.clientX;
        var y = e.touches ? e.touches[0].clientY : e.clientY;
        var fingerDx = x - lastPointerX;
        var fingerDy = y - lastPointerY;

        var dLeft = fingerDx;
        var dTop = fingerDy;
        var narrowScreen = window.matchMedia('(max-width: 780px)').matches;
        if (narrowScreen) {
          dLeft = -fingerDy;
          dTop = fingerDx;
        }

        var left = chipLeft + dLeft;
        var top = chipTop + dTop;

        if (narrowScreen) {
          var k;
          var sectionRect;
          var chipRect;
          var nudgeX;
          var nudgeY;
          for (k = 0; k < 8; k++) {
            chip.style.left = left + 'px';
            chip.style.top = top + 'px';
            sectionRect = section.getBoundingClientRect();
            chipRect = chip.getBoundingClientRect();
            nudgeX = 0;
            nudgeY = 0;
            if (chipRect.left < sectionRect.left) {
              nudgeX += sectionRect.left - chipRect.left;
            }
            if (chipRect.right > sectionRect.right) {
              nudgeX -= chipRect.right - sectionRect.right;
            }
            if (chipRect.top < sectionRect.top) {
              nudgeY += sectionRect.top - chipRect.top;
            }
            if (chipRect.bottom > sectionRect.bottom) {
              nudgeY -= chipRect.bottom - sectionRect.bottom;
            }
            if (Math.abs(nudgeX) < 0.25 && Math.abs(nudgeY) < 0.25) {
              break;
            }
            left = left - nudgeY;
            top = top + nudgeX;
          }
        } else {
          var chipW = chip.offsetWidth;
          var chipH = chip.offsetHeight;
          var maxLeft = dragBox.clientWidth - chipW;
          var maxTop = dragBox.clientHeight - chipH;
          if (maxLeft < 0) {
            maxLeft = 0;
          }
          if (maxTop < 0) {
            maxTop = 0;
          }
          if (left < 0) {
            left = 0;
          }
          if (left > maxLeft) {
            left = maxLeft;
          }
          if (top < 0) {
            top = 0;
          }
          if (top > maxTop) {
            top = maxTop;
          }
        }

        chip.style.left = left + 'px';
        chip.style.top = top + 'px';
        chipLeft = left;
        chipTop = top;
        lastPointerX = x;
        lastPointerY = y;
      }

      function onPointerUp() {
        if (!dragging) {
          return;
        }
        dragging = false;
        chip.classList.remove('blackjack-chip-dragging');
      }

      chip.addEventListener('mousedown', onPointerDown);
      chip.addEventListener('touchstart', onPointerDown, { passive: false });
      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    })(chips[i]);
  }
}

function initBlackjackDealerCards() {
  var section = document.querySelector('.section-blackjack');
  if (section == null) return;

  var dealerCard = section.querySelector('.blackjack-card');
  if (dealerCard == null) return;

  var slots = section.querySelectorAll('.blackjack-card-slot');
  if (slots.length == 0) return;

  var maxCards = 6;
  if (slots.length < maxCards) maxCards = slots.length;

  var flyAnimating = false;
  var flyingCard = null;

  // index 1..6: word + pic_card_N.svg
  var slotLabels = [
    '',
    'комфорт',
    'удовольствие',
    'любовь',
    'развитие',
    'связи',
    'здоровье'
  ];

  var dealOrder = [1, 2, 3, 4, 5, 6];
  dealOrder.sort(function () {
    return Math.random() - 0.5;
  });

  var nextSlot = 0;

  function createCardDiv() {
    var card = document.createElement('div');
    card.className = 'blackjack-slot-card';
    var imgTl = document.createElement('img');
    imgTl.className = 'blackjack-slot-card-glyph blackjack-slot-card-glyph--tl';
    imgTl.alt = '';
    imgTl.setAttribute('role', 'presentation');
    var label = document.createElement('span');
    label.className = 'blackjack-slot-card-label';
    var imgBr = document.createElement('img');
    imgBr.className = 'blackjack-slot-card-glyph blackjack-slot-card-glyph--br';
    imgBr.alt = '';
    imgBr.setAttribute('role', 'presentation');
    card.appendChild(imgTl);
    card.appendChild(label);
    card.appendChild(imgBr);
    return card;
  }

  function putCardInSlot(slot, n) {
    if (slot == null) return;
    var card = slot.querySelector('.blackjack-slot-card');
    if (card == null) {
      card = createCardDiv();
      slot.appendChild(card);
    }
    var src = 'img/table/pic_card_' + n + '.svg';
    card.querySelector('.blackjack-slot-card-glyph--tl').src = src;
    card.querySelector('.blackjack-slot-card-glyph--br').src = src;
    card.querySelector('.blackjack-slot-card-label').textContent = slotLabels[n] || '';
    card.setAttribute('aria-label', slotLabels[n] || '');
  }

  dealerCard.addEventListener('click', function () {
    if (flyAnimating) return;

    if (nextSlot >= maxCards) {
      dealOrder = [1, 2, 3, 4, 5, 6];
      dealOrder.sort(function () {
        return Math.random() - 0.5;
      });
      nextSlot = 0;
    }

    var number = dealOrder[nextSlot];
    var slot = slots[nextSlot];
    nextSlot++;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      putCardInSlot(slot, number);
      return;
    }

    flyAnimating = true;

    var r0 = dealerCard.getBoundingClientRect();
    var r1 = slot.getBoundingClientRect();
    var x0 = r0.left + r0.width / 2;
    var y0 = r0.top + r0.height / 2;
    var x1 = r1.left + r1.width / 2;
    var y1 = r1.top + r1.height / 2;

    var sw = slot.offsetWidth;
    var sh = slot.offsetHeight;
    var transformStr = getComputedStyle(slot).transform;
    var angle = 0;
    if (transformStr != null && transformStr !== 'none') {
      if (transformStr.indexOf('matrix') >= 0) {
        var matrixParts = transformStr.replace('matrix(', '').replace(')', '').split(',');
        angle = Math.atan2(parseFloat(matrixParts[1]), parseFloat(matrixParts[0]));
      } else if (transformStr.indexOf('rotate') >= 0) {
        var m = transformStr.match(/rotate\(([-0-9.eE]+)deg\)/);
        if (m != null) angle = (parseFloat(m[1]) * Math.PI) / 180;
      }
    }
    var boxW = Math.abs(sw * Math.cos(angle)) + Math.abs(sh * Math.sin(angle));
    var boxH = Math.abs(sw * Math.sin(angle)) + Math.abs(sh * Math.cos(angle));
    var scale = 1;
    if (boxW > 0.0001 && boxH > 0.0001) {
      scale = (r1.width / boxW + r1.height / boxH) / 2;
    }
    var cardW = sw * scale;
    var cardH = sh * scale;

    var fly = createCardDiv();
    fly.classList.add('blackjack-slot-card--flying');
    fly.querySelector('.blackjack-slot-card-glyph--tl').src = 'img/table/pic_card_' + number + '.svg';
    fly.querySelector('.blackjack-slot-card-glyph--br').src = 'img/table/pic_card_' + number + '.svg';
    fly.querySelector('.blackjack-slot-card-label').textContent = slotLabels[number] || '';
    fly.setAttribute('aria-label', slotLabels[number] || '');

    fly.style.position = 'fixed';
    fly.style.zIndex = '10000';
    fly.style.width = cardW + 'px';
    fly.style.height = cardH + 'px';
    fly.style.left = x0 - cardW / 2 + 'px';
    fly.style.top = y0 - cardH / 2 + 'px';
    fly.style.boxSizing = 'border-box';
    fly.style.pointerEvents = 'none';
    fly.style.transformOrigin = 'center center';
    var dealerTransform = getComputedStyle(dealerCard).transform;
    fly.style.transform = dealerTransform === 'none' ? '' : dealerTransform;

    document.body.appendChild(fly);
    flyingCard = fly;

    var durationMs = 580;
    var slotTransform = getComputedStyle(slot).transform;

    window.setTimeout(function () {
      fly.style.transition =
        'left ' +
        durationMs +
        'ms ease-out, top ' +
        durationMs +
        'ms ease-out, transform ' +
        durationMs +
        'ms ease-out';
      fly.style.left = x1 - cardW / 2 + 'px';
      fly.style.top = y1 - cardH / 2 + 'px';
      fly.style.transform = slotTransform === 'none' ? '' : slotTransform;
    }, 20);

    window.setTimeout(function () {
      if (flyingCard != null && flyingCard.parentNode != null) {
        flyingCard.parentNode.removeChild(flyingCard);
      }
      flyingCard = null;
      putCardInSlot(slot, number);
      flyAnimating = false;
    }, durationMs + 80);
  });
}

function initScratchCard() {
  var section = document.querySelector('.section-prediction');
  var rotatorInner = document.querySelector('.section-prediction .prediction-rotator-inner');
  var dragContainer = rotatorInner || section;
  var wrap = document.querySelector('.prediction-scratch-wrap');
  var canvas = document.querySelector('.prediction-scratch-canvas');
  var chip = document.querySelector('.prediction-chip');
  if (section == null || dragContainer == null || wrap == null || canvas == null || chip == null) {
    return;
  }

  var ctx = canvas.getContext('2d', { alpha: true });
  if (ctx == null) {
    return;
  }

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
  scratchBg.src = 'img/prediction/scratch-bg-v3.png';

  function scratch(x, y) {
    if (x < -radius || x > width + radius || y < -radius || y > height + radius) {
      return;
    }
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
    var chipRect = chip.getBoundingClientRect();
    var wrapRect = wrap.getBoundingClientRect();

    var centerX = chipRect.left + chipRect.width / 2;
    var centerY = chipRect.top + chipRect.height / 2;

    var relX = centerX - wrapRect.left;
    var relY = centerY - wrapRect.top;

    var over =
      relX >= 0 && relX <= wrapRect.width && relY >= 0 && relY <= wrapRect.height;

    var x = relX * (width / wrapRect.width);
    var y = relY * (height / wrapRect.height);
    return { x: x, y: y, over: over };
  }

  var isDragging = false;
  var startX = 0;
  var startY = 0;
  var startLeft = 0;
  var startTop = 0;
  var lastScratchX = null;
  var lastScratchY = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function onChipPointerDown(e) {
    if (e.button != 0 && e.type == 'mousedown') {
      return;
    }
    e.preventDefault();
    isDragging = true;
    lastScratchX = null;
    lastScratchY = null;
    section.classList.add('section-prediction--hint-hidden');
    chip.classList.add('prediction-chip-dragging');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    var inlineLeft = parseFloat(chip.style.left);
    var inlineTop = parseFloat(chip.style.top);
    startLeft = isNaN(inlineLeft) ? chip.offsetLeft : inlineLeft;
    startTop = isNaN(inlineTop) ? chip.offsetTop : inlineTop;
  }

  function onChipPointerMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    var rawDx = clientX - startX;
    var rawDy = clientY - startY;
    var dx = rawDx;
    var dy = rawDy;
    var narrowScreen = window.matchMedia('(max-width: 780px)').matches;
    if (narrowScreen) {
      /* .prediction-board-wrap: rotate(-90deg) — экранный дельта → left/top */
      dx = -rawDy;
      dy = rawDx;
    }

    var newLeft = startLeft + dx;
    var newTop = startTop + dy;

    if (narrowScreen) {
      var k;
      var sectionRect;
      var chipRect;
      var nudgeX;
      var nudgeY;
      var left = newLeft;
      var top = newTop;
      for (k = 0; k < 8; k++) {
        chip.style.left = left + 'px';
        chip.style.top = top + 'px';
        sectionRect = section.getBoundingClientRect();
        chipRect = chip.getBoundingClientRect();
        nudgeX = 0;
        nudgeY = 0;
        if (chipRect.left < sectionRect.left) {
          nudgeX += sectionRect.left - chipRect.left;
        }
        if (chipRect.right > sectionRect.right) {
          nudgeX -= chipRect.right - sectionRect.right;
        }
        if (chipRect.top < sectionRect.top) {
          nudgeY += sectionRect.top - chipRect.top;
        }
        if (chipRect.bottom > sectionRect.bottom) {
          nudgeY -= chipRect.bottom - sectionRect.bottom;
        }
        if (Math.abs(nudgeX) < 0.25 && Math.abs(nudgeY) < 0.25) {
          break;
        }
        left = left - nudgeY;
        top = top + nudgeX;
      }
      newLeft = left;
      newTop = top;
    } else {
      newLeft = clamp(newLeft, 0, dragContainer.clientWidth - chip.offsetWidth);
      newTop = clamp(newTop, 0, dragContainer.clientHeight - chip.offsetHeight);
      chip.style.left = newLeft + 'px';
      chip.style.top = newTop + 'px';
    }

    startLeft = newLeft;
    startTop = newTop;
    startX = clientX;
    startY = clientY;

    var canvasPoint = chipCenterToCanvas();
    var x = canvasPoint.x;
    var y = canvasPoint.y;
    var over = canvasPoint.over;
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


function initPredictionDiceRolls() {
  var allDice = document.querySelectorAll('.section-prediction .prediction-dice');
  if (allDice.length === 0) {
    console.log('[prediction-dice] no dice found');
    return;
  }

  var howLongRollGoes = 1200;
  var gifForRoll = 'img/prediction/cube.gif';
  var allDicePictures = [
    'img/prediction/cube-face-1.png',
    'img/prediction/cube-face-2.png',
    'img/prediction/cube-face-3.png',
    'img/prediction/cube-face-4.png',
    'img/prediction/cube-face-5.png',
    'img/prediction/cube-face-6.png'
  ];
  var i;

  console.log('[prediction-dice] init, dice count:', allDice.length);

  function getRandomDicePicture() {
    var randomNumber = Math.floor(Math.random() * allDicePictures.length);
    return allDicePictures[randomNumber];
  }

  function warmUpPictures() {
    var gifImg = new Image();
    var j;

    gifImg.src = gifForRoll;
    for (j = 0; j < allDicePictures.length; j++) {
      var justImg = new Image();
      justImg.src = allDicePictures[j];
    }
  }

  function makeOneDiceWork(oneDice) {
    var pic = oneDice.querySelector('img');
    var rollingNow = false;
    var timerThing = 0;

    if (pic == null) {
      console.log('[prediction-dice] missing image for die', oneDice.className);
      return;
    }

    pic.src = getRandomDicePicture();
    console.log('[prediction-dice] initial face:', oneDice.className, '->', pic.src);

    function putGifInstead() {
      console.log('[prediction-dice] rolling start:', oneDice.className);
      oneDice.classList.add('prediction-dice--rolling');
      pic.src = gifForRoll + '?t=' + Date.now();
    }

    function stopGifAndShowResult() {
      var whatFell = getRandomDicePicture();
      console.log('[prediction-dice] rolling end:', oneDice.className, '->', whatFell);
      oneDice.classList.remove('prediction-dice--rolling');
      pic.src = whatFell;
      rollingNow = false;
    }

    function startDiceRoll() {
      console.log('[prediction-dice] roll requested:', oneDice.className, 'isRolling:', rollingNow);
      if (rollingNow) {
        return;
      }

      rollingNow = true;
      putGifInstead();

      window.clearTimeout(timerThing);
      timerThing = window.setTimeout(stopGifAndShowResult, howLongRollGoes);
    }

    oneDice.addEventListener('click', startDiceRoll);
    oneDice.addEventListener('touchstart', function () {
      console.log('[prediction-dice] touchstart:', oneDice.className);
    }, { passive: true });
    oneDice.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') {
        return;
      }

      e.preventDefault();
      console.log('[prediction-dice] keydown roll:', oneDice.className, 'key:', e.key);
      startDiceRoll();
    });
  }

  warmUpPictures();

  for (i = 0; i < allDice.length; i++) {
    makeOneDiceWork(allDice[i]);
  }
}

function initSuitsStopwatch() {
  var el = document.querySelector('.suits-stopwatch-value');
  if (el == null) {
    return;
  }

  var startedAt = Date.now();

  function pad(n) {
    if (n < 10) {
      return '0' + n;
    }
    return String(n);
  }

  function tick() {
    var now = Date.now();
    var totalSeconds = Math.floor((now - startedAt) / 1000);
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
  if (pool == null) {
    return;
  }

  var section = document.querySelector('.section-suits');

  var suits = ['♠', '♥', '♦', '♣'];

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

    if (section != null) {
      var sectRect = section.getBoundingClientRect();
      // очередная попытка сделать нормально стены для пула
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
    span.className = 'suits-particle';
    pool.appendChild(span);

    var zoneWidth = wallRight - wallLeft;
    var zoneHeight = wallBottom - wallTop;
    if (zoneWidth < 24) zoneWidth = 24;
    if (zoneHeight < 24) zoneHeight = 24;
    var minX = wallLeft + 12;
    var maxX = wallRight - 12;
    if (maxX < minX) maxX = minX;
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

    for (var n = 0; n < count; n++) {
      particles.push(createParticle());
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
    var particleDiameter = particleRadius * 2;

    if (mouseX !== null && mouseY !== null) {
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        dx = p.x - mouseX;
        dy = p.y - mouseY;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.01) dist = 0.01;
        if (dist < 110) {
          force = (110 - dist) / 110 * 0.75;
          p.vx = p.vx + (dx / dist) * force;
          p.vy = p.vy + (dy / dist) * force;
        }
      }
    }

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
      p.vy = p.vy + 0.003;
      p.x = p.x + p.vx;
      p.y = p.y + p.vy;
      p.vx = p.vx * 0.995;
      p.vy = p.vy * 0.995;

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
    resizeTimer = setTimeout(fillPool, 200);
  });

  document.addEventListener('mousemove', onMouseMove);

  fillPool();
  loop();
}
