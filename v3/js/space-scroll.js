(function () {
  var target = 'space-floor.html';
  var navigated = false;
  var threshold = 50;
  var accum = 0;

  function goNext() {
    if (navigated) return;
    navigated = true;
    window.location.href = target;
  }

  window.addEventListener('wheel', function (event) {
    if (navigated) return;
    accum += event.deltaY;
    if (accum >= threshold) {
      goNext();
    }
  }, { passive: true });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      goNext();
    }
  });
})();
