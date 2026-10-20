// Justified rows: pack paintings into rows of equal height that fill the width.
(function () {
  var containers = Array.prototype.slice.call(document.querySelectorAll('.rows'));
  if (!containers.length) return;

  function layout(c) {
    var figs = Array.prototype.slice.call(c.querySelectorAll(':scope > figure'));
    var W = c.clientWidth;
    var target = parseFloat(getComputedStyle(c).getPropertyValue('--h')) || 300;
    var gap = parseFloat(getComputedStyle(c).columnGap) || 0;
    if (W < 520) { figs.forEach(function (f) { f.style.flex = '0 0 100%'; f.style.width = ''; }); return; }
    if (target > W * 0.6) target = W * 0.6;
    var ars = figs.map(function (f) { return parseFloat(f.style.getPropertyValue('--ar')) || 1; });
    function height(s, n) { return (W - gap * (n - 1)) / s; }
    // Balance all rows at once: choose row breaks that keep every row's
    // height as close as possible to the target (no lonely last painting).
    var n = figs.length, best = [0], prev = [0];
    for (var j = 1; j <= n; j++) {
      best[j] = Infinity;
      var s = 0;
      for (var i = j - 1; i >= 0 && j - i <= 7; i--) {
        s += ars[i];
        var h = height(s, j - i);
        var d = (h - target) / target;
        var cost = best[i] + d * d;
        if (cost < best[j]) { best[j] = cost; prev[j] = i; }
      }
    }
    var rows = [];
    for (var k = n; k > 0; k = prev[k]) {
      var items = [], sum = 0;
      for (var m = prev[k]; m < k; m++) { items.push(m); sum += ars[m]; }
      rows.unshift({ items: items, h: Math.min(height(sum, items.length), target * 1.5) });
    }
    rows.forEach(function (r) {
      r.items.forEach(function (idx) {
        var w = Math.floor(ars[idx] * r.h * 100) / 100;
        figs[idx].style.flex = '0 0 ' + w + 'px';
        figs[idx].style.width = w + 'px';
      });
    });
  }

  function all() { containers.forEach(layout); }
  all();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(all, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
})();

(function () {
  var dialog = document.querySelector('.lightbox');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.work-open'));
  if (!dialog || !buttons.length || typeof dialog.showModal !== 'function') return;

  var img = dialog.querySelector('.lb-img');
  var title = dialog.querySelector('.lb-title');
  var meta = dialog.querySelector('.lb-meta');
  var enquire = dialog.querySelector('.lb-enquire');
  var current = 0;
  var opener = null;

  function show(i) {
    current = (i + buttons.length) % buttons.length;
    var b = buttons[current];
    var thumb = b.querySelector('img');
    img.src = b.dataset.full;
    img.alt = thumb ? thumb.alt : '';
    title.textContent = b.dataset.title;
    meta.textContent = b.dataset.meta;
    var subject = 'Enquiry: ' + b.dataset.title;
    enquire.href = 'mailto:' + window.SITE_EMAIL + '?subject=' + encodeURIComponent(subject);
    // Preload neighbours for quick paging
    [current - 1, current + 1].forEach(function (n) {
      var nb = buttons[(n + buttons.length) % buttons.length];
      var pre = new Image(); pre.src = nb.dataset.full;
    });
  }

  buttons.forEach(function (b, i) {
    b.addEventListener('click', function () {
      opener = b;
      show(i);
      dialog.showModal();
      document.body.classList.add('lb-open');
    });
  });

  dialog.querySelector('.lb-close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  dialog.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(current - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(current + 1); e.preventDefault(); }
  });
  // Click on the empty area around the painting closes the viewer
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.classList.contains('lb-inner') || e.target.classList.contains('lb-fig')) dialog.close();
  });
  dialog.addEventListener('close', function () {
    document.body.classList.remove('lb-open');
    img.src = '';
    if (opener) opener.focus();
  });

  // Swipe on touch screens
  var x0 = null;
  dialog.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
