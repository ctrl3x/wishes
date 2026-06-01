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

  var eventsList = document.getElementById('events-list');
  var poster = document.getElementById('events-poster');
  var posterImg = document.querySelector('.events-poster__img');
  if (eventsList && poster && posterImg) {
    var leaveTimer;

    eventsList.addEventListener('mouseenter', function (e) {
      var item = e.target.closest('.events-item');
      if (!item) return;
      var num = item.getAttribute('data-event');
      if (!num) return;
      clearTimeout(leaveTimer);
      posterImg.src = 'img/events/event' + num + '.png';
      posterImg.classList.add('events-poster__img--visible');
    }, true);

    eventsList.addEventListener('mouseleave', function () {
      leaveTimer = setTimeout(function () {
        posterImg.classList.remove('events-poster__img--visible');
      }, 80);
    });
  }
})();
