(function () {
  function resolveLink(page) {
    var path = window.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/') + 1);
    return dir + page;
  }

  var drawer = document.querySelector('.menu-drawer');
  var hasExisting = !!drawer;

  var lightPages = ['about-book.html', 'space-game-hall.html', 'space-third-floor.html', 'shop.html'];
  var pathname = window.location.pathname;
  var isLight = lightPages.some(function (p) { return pathname.indexOf(p) !== -1; });

  if (!hasExisting) {
    var aboutLink = resolveLink('about.html');
    var spaceLink = resolveLink('space.html');
    var bookLink  = resolveLink('book.html');
    var shopLink  = resolveLink('shop.html');
    var eventsLink = resolveLink('events.html');

    drawer = document.createElement('div');
    drawer.className = 'menu-drawer menu-drawer--hidden';
    drawer.innerHTML =
      '<div class="menu-panel">' +
        '<div class="menu-panel__brand">' +
          '<img class="menu-panel__brand-logo" src="' + resolveLink('img/logo.png') + '" alt="" width="140" height="140" decoding="async">' +
          '<p class="menu-panel__brand-title">Казино желаний</p>' +
        '</div>' +
        '<div class="menu-panel__intro">' +
          '<p class="menu-panel__desc">«ЖЕЛАЙ» — это&nbsp;салон искушений, где&nbsp;люди ставят на&nbsp;исполнение своих желаний не&nbsp;деньги, а&nbsp;время жизни, память и&nbsp;свободу.</p>' +
          '<div class="menu-panel__ctas">' +
            '<a class="menu-panel__cta" href="#">' +
              '<span>сделай ставку</span>' +
              '<img src="' + resolveLink('img/arrow-white.svg') + '" alt="" width="30" height="30" decoding="async">' +
            '</a>' +
            '<a class="menu-panel__cta" href="#">' +
              '<span>испытай азарт</span>' +
              '<img src="' + resolveLink('img/arrow-white.svg') + '" alt="" width="30" height="30" decoding="async">' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<nav class="menu-panel__tabs" aria-label="Разделы">' +
          '<a class="menu-tab" href="' + aboutLink + '">о желай</a>' +
          '<a class="menu-tab" href="' + spaceLink + '">пространство</a>' +
          '<a class="menu-tab" href="' + shopLink + '">Магазин</a>' +
          '<a class="menu-tab" href="' + eventsLink + '">События</a>' +
          '<a class="menu-tab" href="' + bookLink + '">книга</a>' +
        '</nav>' +
        '<div class="menu-panel__social">' +
          '<a class="menu-panel__social-link" href="#" aria-label="Behance">' +
            '<img src="' + resolveLink('img/social-1.svg') + '" alt="" width="40" height="40" decoding="async">' +
          '</a>' +
          '<a class="menu-panel__social-link" href="#" aria-label="VK">' +
            '<img src="' + resolveLink('img/social-2.svg') + '" alt="" width="40" height="40" decoding="async">' +
          '</a>' +
          '<a class="menu-panel__social-link" href="#" aria-label="Telegram">' +
            '<img src="' + resolveLink('img/social-3.svg') + '" alt="" width="40" height="40" decoding="async">' +
          '</a>' +
        '</div>' +
        '<div class="menu-panel__subscribe">' +
          '<p class="menu-panel__subscribe-title">Будь ближе к ЖЕЛАЙ</p>' +
          '<form class="menu-panel__email-form" action="#" method="post">' +
            '<label class="menu-panel__email-field">' +
              '<input type="email" name="email" placeholder="Email" autocomplete="email">' +
              '<img src="' + resolveLink('img/arrow-email.svg') + '" alt="" width="35" height="35" decoding="async">' +
            '</label>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<button class="menu-drawer__close" type="button" aria-label="Закрыть меню">' +
        '<span class="menu-drawer__close-cross"></span>' +
      '</button>';

    var canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.appendChild(drawer);
    } else {
      document.body.appendChild(drawer);
    }
  }

  if (isLight) {
    drawer.classList.add('menu-drawer--light');
  }

  var triggers = document.querySelectorAll('.menu-btn, .about-content__menu');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      drawer.classList.remove('menu-drawer--hidden');
      btn.style.display = 'none';
    });
  });

  function closeDrawer() {
    drawer.classList.add('menu-drawer--hidden');
    triggers.forEach(function (btn) {
      btn.style.display = '';
    });
  }

  var closeBtn = drawer.querySelector('.menu-drawer__close');
  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    closeDrawer();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.classList.contains('menu-drawer--hidden')) {
      closeDrawer();
    }
  });

  document.addEventListener('click', function (e) {
    var logo = e.target.closest('.page__logo, .shop-logo');
    if (logo) {
      e.preventDefault();
      window.location.href = resolveLink('index.html');
    }
  });
})();