/* lightbox.js — click a post image to open it full-screen. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var wraps = document.querySelectorAll('.sb-img-wrap');
    if (!wraps.length) return;

    var overlay = document.createElement('div');
    overlay.className = 'sb-lightbox';
    overlay.innerHTML =
      '<button class="sb-lightbox-close" aria-label="Close">\u00d7</button>' +
      '<img alt="">';
    document.body.appendChild(overlay);

    var bigImg = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.sb-lightbox-close');

    function open(src, alt) {
      bigImg.src = src;
      bigImg.alt = alt || '';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      bigImg.src = '';
    }

    wraps.forEach(function (wrap) {
      var img = wrap.querySelector('img');
      if (!img) return;
      wrap.addEventListener('click', function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === closeBtn) close();
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  });
})();
