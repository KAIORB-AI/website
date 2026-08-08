// The hour you arrive — the universe's ambient tint follows the visitor's local time.
// Never at the cost of contrast: only the faint background wash changes.
(function () {
  var h = new Date().getHours();
  var night = h >= 21 || h < 5;
  var dawn = h >= 5 && h < 9;
  var dusk = h >= 17 && h < 21;
  var hue = night ? 258 : dawn ? 36 : dusk ? 22 : 215;
  var alpha = night ? 0.13 : (dawn || dusk) ? 0.11 : 0.07;
  var root = document.documentElement;
  root.style.setProperty('--tint-h', hue);
  root.style.setProperty('--tint-a', alpha);
})();
