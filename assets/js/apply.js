// Applications submit as a pre-composed email — no backend, no third party, nothing stored.
(function () {
  function compose(form) {
    var fd = new FormData(form);
    var seen = {};
    var order = [];
    fd.forEach(function (v, k) {
      var s = String(v).trim();
      if (!s) return;
      if (seen[k]) { seen[k] += ', ' + s; } else { seen[k] = s; order.push(k); }
    });
    var lines = order.map(function (k) { return k + ': ' + seen[k]; });
    var name = seen['Business name'] || seen['Company name'] || 'application';
    var subject = form.dataset.subject.replace('{name}', name);
    return 'mailto:' + form.dataset.apply +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n') + '\n\n- sent from kai247.com/join');
  }
  window.__kaiCompose = compose;
  document.querySelectorAll('form[data-apply]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.after-note');
      if (note) note.hidden = false;
      window.location.href = compose(form);
    });
  });
})();
