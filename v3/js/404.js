(function () {
  var canvas = document.getElementById('canvas');
  var chips = document.querySelectorAll('.notfound__chip');
  if (!canvas || chips.length === 0) return;

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
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        var inlineLeft = parseFloat(el.style.left);
        var inlineTop = parseFloat(el.style.top);
        startLeft = isNaN(inlineLeft) ? el.offsetLeft : inlineLeft;
        startTop = isNaN(inlineTop) ? el.offsetTop : inlineTop;
        el.classList.add('notfound__chip--dragging');
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var dx = clientX - startX;
        var dy = clientY - startY;

        var scale = parseFloat(canvas.style.transform.replace('scale(', '')) || 1;
        dx = dx / scale;
        dy = dy / scale;

        var newLeft = startLeft + dx;
        var newTop = startTop + dy;
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        newLeft = clamp(newLeft, 0, 1920 - w);
        newTop = clamp(newTop, 0, 1080 - h);
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
        el.classList.remove('notfound__chip--dragging');
      }

      el.addEventListener('mousedown', onPointerDown);
      el.addEventListener('touchstart', onPointerDown, { passive: false });
      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    })(chips[i]);
  }
})();