/* KAI247 Utilities — intent router.
 *
 * Deterministic on purpose. It matches the request against declared patterns,
 * extracts the parameters it can prove are there, and opens the tool with them
 * pre-filled. It never guesses at a tool it does not have: an unmatched request
 * says so, and a request for something not built yet says that instead of
 * routing to a page that does not exist.
 *
 * This is the local half of the Nexus assistant bar. When a Nexus key is issued
 * for kai247.com, anything unmatched here is what should be handed to Nexus —
 * see assets/js/nexus.js.
 */
(function () {
  var UNIT = { b: 1 / 1024, kb: 1, k: 1, mb: 1024, m: 1024, gb: 1048576, g: 1048576 };

  // Every route the bar can open. `built:false` routes are answered honestly
  // rather than navigated to.
  var ROUTES = [
    {
      id: 'photo', built: true, path: '/utility/photo-size-targeter/',
      label: 'Photo Size Targeter',
      test: /\b(photo|image|picture|jpe?g|png|webp|screenshot)\b/i,
      // "image" also appears in PDF asks, so PDF is matched first below.
      params: function (q) {
        var kb = sizeKB(q);
        return kb ? { target: Math.round(kb) } : {};
      }
    },
    {
      id: 'pdf', built: true, path: '/utility/pdf-size-reducer/',
      label: 'PDF Size Reducer',
      test: /\bpdf\b/i
    },
    {
      id: 'cidr', built: true, path: '/utility/cidr-calculator/',
      label: 'IT & Subnet CIDR Calculator',
      test: /\b(cidr|subnet|netmask|ip\s*range|ipv4|ipv6|hosts?|devices?)\b/i,
      params: function (q) {
        var p = {};
        var hosts = q.match(/(\d[\d,]*)\s*(?:hosts?|devices?|ips?|addresses|machines|clients)/i);
        if (hosts) p.hosts = hosts[1].replace(/,/g, '');
        var cidr = q.match(/((?:\d{1,3}\.){3}\d{1,3}\s*\/\s*\d{1,2})/);
        if (cidr) p.cidr = cidr[1].replace(/\s+/g, '');
        return p;
      }
    },
    {
      id: 'utm', built: true, path: '/utility/web-essentials/#utm',
      label: 'UTM Builder',
      test: /\butm|campaign (link|url|tracking)|track(ing)? link\b/i,
      params: function (q) { var u = url(q); return u ? { url: u } : {}; }
    },
    {
      id: 'slug', built: true, path: '/utility/web-essentials/#slug',
      label: 'Slug Generator',
      test: /\bslug|permalink|url[- ]?safe\b/i
    },
    {
      id: 'robots', built: true, path: '/utility/web-essentials/#robots',
      label: 'robots.txt Generator & Validator',
      test: /\brobots(\.txt)?|crawler rules?|disallow\b/i
    },
    {
      id: 'sitemap', built: true, path: '/utility/web-essentials/#sitemap',
      label: 'Sitemap XML Validator',
      test: /\bsitemap\b/i
    },
    {
      id: 'qr', built: false, path: '/utility/web-essentials/#qr',
      label: 'QR Code Generator',
      test: /\bqr\b|\bqr[- ]?code\b/i
    },
    {
      id: 'finance', built: true, path: '/utility/business-finance-analyzer/',
      label: 'Business Finance Analyzer',
      test: /\b(p&l|p and l|profit|loss|balance sheet|ebitda|margin|burn rate|revenue|financial|accounts?)\b/i
    },
    {
      id: 'quote', built: false, path: '/utility/quote-generator/',
      label: 'Quote & Estimate Generator',
      test: /\b(quote|quotation|estimate|proposal price)\b/i
    },
    {
      id: 'po', built: false, path: '/utility/purchase-order-generator/',
      label: 'Purchase Order Generator',
      test: /\b(purchase order|\bpo\b|procurement)\b/i
    },
    {
      id: 'marketing', built: false, path: '/utility/web-marketing-toolkit/',
      label: 'Web & Marketing Toolkit',
      test: /\b(meta tags?|serp|open graph|og:|twitter card|schema|json-?ld|canonical|redirect|favicon|keyword)\b/i
    },
    {
      id: 'video2audio', built: true, path: '/utility/video-to-audio/',
      label: 'Video to Audio Converter',
      // Deliberately matches the container/extension words people actually
      // type ("mp4 to wav", "rip the audio", "convert mov to mp3") rather than
      // the bare word "audio", which appears in plenty of unrelated asks.
      test: /\b(mp4|mov|webm|mkv|m4v|avi)\b|\b(video|screen ?recording|recording)\s*(to|into|→)\s*(audio|wav|mp3|sound)\b|\b(extract|rip|strip|pull|separate|get)\s+(the\s+)?audio\b|\baudio\s+(from|out of)\s+(a\s+)?(video|mp4|recording)\b|\bto\s*\.?wav\b/i,
      params: function (q) {
        var p = {};
        // "16k for transcription" / "44.1 kHz" — only set what was actually said.
        var hz = q.match(/(\d{2,3}(?:[.,]\d)?)\s*k(?:hz)?\b/i);
        if (hz) { p.rate = Math.round(parseFloat(hz[1].replace(',', '.')) * 1000); }
        if (/\bmono\b/i.test(q)) { p.channels = 1; }
        else if (/\bstereo\b/i.test(q)) { p.channels = 2; }
        if (/\btranscri|speech|whisper|subtitle|caption/i.test(q)) { p.rate = p.rate || 16000; p.channels = p.channels || 1; }
        return p;
      }
    }
  ];

  // PDF before photo: "shrink this PDF image" is a PDF request.
  // video2audio before photo too: "extract the audio from this recording" must
  // not be swallowed by the photo route's broad media words.
  var ORDER = ['pdf', 'qr', 'utm', 'sitemap', 'robots', 'slug', 'cidr', 'video2audio', 'finance', 'quote', 'po', 'marketing', 'photo'];

  function sizeKB(q) {
    var m = q.match(/(\d+(?:\.\d+)?)\s*(kb|mb|gb|k|m|g|b)\b/i);
    if (!m) return null;
    return parseFloat(m[1]) * (UNIT[m[2].toLowerCase()] || 1);
  }

  function url(q) {
    var m = q.match(/https?:\/\/[^\s"'<>]+/i);
    if (m) return m[0];
    m = q.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s"'<>]*)?/i);
    return m ? 'https://' + m[0] : null;
  }

  function match(q) {
    for (var i = 0; i < ORDER.length; i++) {
      var r = find(ORDER[i]);
      if (r && r.test.test(q)) return r;
    }
    return null;
  }

  function find(id) {
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i].id === id) return ROUTES[i];
    return null;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function route(q, answer) {
    q = (q || '').trim();
    if (!q) return;
    var r = match(q);

    if (!r) {
      answer.hidden = false;
      answer.innerHTML = '<p class="route">No utility here matches that yet. ' +
        'The suite covers images, subnets, campaign links, slugs, robots.txt and sitemaps today — ' +
        '<a href="#suites">see all eight suites</a>.</p>';
      return;
    }

    if (!r.built) {
      answer.hidden = false;
      answer.innerHTML = '<p class="route"><strong>' + esc(r.label) + '</strong> is the right tool for that, ' +
        'and it is still in development — so this bar will not send you to a page that cannot do it yet.</p>' +
        '<p class="params">Tools that work today: Photo Size Targeter, CIDR Calculator, UTM Builder, ' +
        'Slug Generator, robots.txt and Sitemap validators.</p>';
      return;
    }

    var params = r.params ? r.params(q) : {};
    var keys = Object.keys(params);
    var hash = '';
    var path = r.path;
    var hi = path.indexOf('#');
    if (hi >= 0) { hash = path.slice(hi); path = path.slice(0, hi); }
    var qs = keys.map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    var href = path + (qs ? '?' + qs : '') + hash;

    answer.hidden = false;
    answer.innerHTML = '<p class="route">Opening <strong>' + esc(r.label) + '</strong>…</p>' +
      (keys.length
        ? '<p class="params">Pre-filled: ' + keys.map(function (k) {
            return '<code>' + esc(k) + ' = ' + esc(params[k]) + '</code>';
          }).join(' · ') + '</p>'
        : '');
    setTimeout(function () { window.location.href = href; }, 450);
  }

  // Read a pre-filled parameter on a tool page.
  window.kaiParam = function (name) {
    return new URLSearchParams(window.location.search).get(name);
  };

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('askForm');
    if (!form) return;
    var input = document.getElementById('askInput');
    var answer = document.getElementById('askAnswer');
    form.addEventListener('submit', function (e) { e.preventDefault(); route(input.value, answer); });
    document.querySelectorAll('.u-chip[data-ask]').forEach(function (c) {
      c.addEventListener('click', function () {
        input.value = c.dataset.ask;
        input.focus();
        route(c.dataset.ask, answer);
      });
    });
  });
})();
