(function () {
  var target = 'space-about-building.html';
  var navigated = false;

  function goNext() {
    if (navigated) return;
    navigated = true;
    window.location.href = target;
  }

  window.addEventListener('wheel', function (event) {
    if (event.deltaY > 0) {
      goNext();
    }
  }, { passive: true });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
      goNext();
    }
  });
})();