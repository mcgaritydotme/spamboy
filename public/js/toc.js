/* toc.js — builds the table of contents from article headings,
   keeps it aligned to the post title, and highlights the active
   section on scroll (scroll-spy, including the final section). */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.querySelector('.sb-body');
    var toc = document.querySelector('.sb-toc');
    if (!body || !toc) return;

    var headings = [].filter.call(
      body.querySelectorAll('h2, h3'),
      function (h) { return !h.closest('.footnotes'); }
    );
    if (!headings.length) { toc.style.display = 'none'; return; }

    var used = {};
    function slugify(text) {
      var s = text.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (used[s] != null) { used[s]++; s = s + '-' + used[s]; } else { used[s] = 0; }
      return s || 'section';
    }

    var ul = document.createElement('ul');
    var links = [];
    var pinned = null;
    headings.forEach(function (h) {
      if (!h.id) h.id = slugify(h.textContent);
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if (h.tagName.toLowerCase() === 'h3') a.classList.add('lvl-3');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        // Pin the clicked section as active. Programmatic smooth-scroll
        // fires scroll events, so we keep the pin until the user scrolls
        // by their own action (cleared by the wheel/touch/key listeners).
        pinned = h;
        setActive(h);
        var top = h.getBoundingClientRect().top + window.pageYOffset - 84;
        window.scrollTo({ top: top, behavior: 'smooth' });
        history.replaceState(null, '', '#' + h.id);
      });
      var li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
      links.push({ el: a, target: h });
    });
    toc.innerHTML = '';
    toc.appendChild(ul);

    function setActive(target) {
      links.forEach(function (l) {
        l.el.classList.toggle('is-active', l.target === target);
      });
    }

    function update() {
      if (pinned) { setActive(pinned); return; }
      var scrollY = window.pageYOffset;
      var marker = scrollY + 110;
      var active = links[0].target;
      for (var i = 0; i < links.length; i++) {
        if (links[i].target.offsetTop <= marker) active = links[i].target;
      }
      // When the page is scrolled to the bottom, force the last section
      // active even if its heading never reaches the marker line.
      var atBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 2);
      if (atBottom) active = links[links.length - 1].target;
      setActive(active);
    }

    // Align the top of the ToC with the top of the post title.
    function alignToc() {
      var title = document.querySelector('.sb-article-title');
      if (!title) return;
      toc.style.marginTop = '0px';
      var diff = title.getBoundingClientRect().top - toc.getBoundingClientRect().top;
      if (diff > 0) toc.style.marginTop = diff + 'px';
    }

    alignToc();
    update();

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    // A real user-initiated scroll releases the click-pin.
    ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { pinned = null; }, { passive: true });
    });

    window.addEventListener('resize', function () { alignToc(); update(); });
    window.addEventListener('load', function () { alignToc(); update(); });
  });
})();
