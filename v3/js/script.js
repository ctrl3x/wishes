(function () {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;

  var DESIGN_WIDTH = 1920;
  var DESIGN_HEIGHT = 1080;

  function scaleCanvas() {
    var scale = Math.min(
      window.innerWidth / DESIGN_WIDTH,
      window.innerHeight / DESIGN_HEIGHT
    );
    canvas.style.transform = 'scale(' + scale + ')';
  }

  scaleCanvas();
  window.addEventListener('resize', scaleCanvas);

  var covers = document.querySelector('.book-covers');
  var gridCells = document.querySelectorAll('.book-grid__cell img');
  var canvasEl = document.getElementById('canvas');
  var zoomOverlay = document.querySelector('.book-zoom-overlay');
  var zoomImg = document.querySelector('.book-zoom-img img');
  if (covers && gridCells.length && canvasEl && zoomOverlay && zoomImg) {
    covers.addEventListener('click', function (e) {
      var card = e.target.closest('.book-covers__card');
      if (!card) return;
      var idx = Array.prototype.indexOf.call(covers.children, card);
      if (idx < 0 || idx >= gridCells.length) return;
      zoomImg.src = gridCells[idx].src;
      canvasEl.classList.add('canvas-zoomed');
    });

    zoomOverlay.addEventListener('click', function () {
      canvasEl.classList.remove('canvas-zoomed');
      zoomImg.src = '';
    });

    zoomImg.parentElement.addEventListener('click', function () {
      canvasEl.classList.remove('canvas-zoomed');
      zoomImg.src = '';
    });
  }
})();
