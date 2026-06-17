/* theme.js — dark mode toggle (+ localStorage) and mobile menu */
(function () {
  var STORAGE_KEY = 'sb-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    document.querySelectorAll('[data-theme-label]').forEach(function (el) {
      el.textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
  }
  function toggle() {
    apply(current() === 'dark' ? 'light' : 'dark');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // sync labels with the theme restored by the no-flash head script
    apply(current());

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });

    /* ---- Mobile hamburger menu ---- */
    var header = document.querySelector('.sb-header');
    var burger = document.querySelector('.sb-hamburger');
    if (header && burger) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        header.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', header.classList.contains('is-open'));
      });
      // close on nav link tap
      document.querySelectorAll('.sb-mobile-menu a').forEach(function (a) {
        a.addEventListener('click', function () { header.classList.remove('is-open'); });
      });
      // close on outside tap
      document.addEventListener('click', function (e) {
        if (header.classList.contains('is-open') && !header.contains(e.target)) {
          header.classList.remove('is-open');
        }
      });
    }
  });
})();
