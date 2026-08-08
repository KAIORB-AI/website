// Offering viewer — opens a KAI247 offering inside the page, so the visitor stays in orbit.
// Interim: the frame carries the delivering site. Later it carries that offering's widget;
// only the data-url on each tile changes.
(function () {
  var viewer, frame, titleEl, domainEl, newTabEl, loadingEl, lastFocus;

  function build() {
    viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.hidden = true;
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'KAI247 offering');
    viewer.innerHTML =
      '<div class="viewer-chrome">' +
        '<span class="viewer-mark">' +
          '<svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">' +
            '<ellipse cx="32" cy="32" rx="27" ry="13.5" fill="none" stroke="var(--blue)" stroke-width="5" transform="rotate(-24 32 32)"/>' +
            '<circle cx="32" cy="32" r="11" fill="var(--gold)"/>' +
          '</svg>KAI247</span>' +
        '<span class="viewer-title" id="viewerTitle"></span>' +
        '<span class="viewer-actions">' +
          '<a class="viewer-btn" id="viewerNewTab" target="_blank" rel="noopener">Open in new tab ↗</a>' +
          '<button class="viewer-btn" id="viewerClose" type="button">Close ✕</button>' +
        '</span>' +
      '</div>' +
      '<div class="viewer-stage">' +
        '<div class="viewer-loading" id="viewerLoading"><span><span class="pip"></span></span></div>' +
        '<iframe id="viewerFrame" title="Offering" ' +
          'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" ' +
          'referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      '</div>';
    document.body.appendChild(viewer);
    frame = viewer.querySelector('#viewerFrame');
    titleEl = viewer.querySelector('#viewerTitle');
    newTabEl = viewer.querySelector('#viewerNewTab');
    loadingEl = viewer.querySelector('#viewerLoading');
    viewer.querySelector('#viewerClose').addEventListener('click', function () { close(true); });
    frame.addEventListener('load', function () { loadingEl.hidden = true; });
  }

  function open(tile, pushHash) {
    if (!viewer) build();
    var url = tile.dataset.url;
    var name = tile.dataset.name;
    var host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    lastFocus = document.activeElement;
    titleEl.innerHTML = '';
    titleEl.appendChild(document.createTextNode(name));
    var s = document.createElement('span');
    s.textContent = host;
    titleEl.appendChild(s);
    newTabEl.href = url;
    loadingEl.hidden = false;
    frame.src = url;
    frame.title = name;
    viewer.hidden = false;
    document.body.classList.add('viewer-open');
    viewer.querySelector('#viewerClose').focus();
    if (pushHash && tile.dataset.slug) {
      history.pushState({ offering: tile.dataset.slug }, '', '#open=' + tile.dataset.slug);
    }
  }

  function close(popHistory) {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    frame.src = 'about:blank';
    document.body.classList.remove('viewer-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (popHistory && location.hash.indexOf('#open=') === 0) history.pushState(null, '', location.pathname);
  }

  document.addEventListener('click', function (e) {
    var tile = e.target.closest && e.target.closest('[data-url][data-name]');
    if (!tile) return;
    e.preventDefault();
    open(tile, true);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close(true);
  });

  window.addEventListener('popstate', function () {
    var m = location.hash.match(/^#open=(.+)$/);
    if (!m) return close(false);
    var tile = document.querySelector('[data-slug="' + CSS.escape(m[1]) + '"]');
    if (tile) open(tile, false);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var m = location.hash.match(/^#open=(.+)$/);
    if (!m) return;
    var tile = document.querySelector('[data-slug="' + CSS.escape(m[1]) + '"]');
    if (tile) open(tile, false);
  });
})();
