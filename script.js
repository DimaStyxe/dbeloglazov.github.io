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
