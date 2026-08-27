/* KaiOrb → Nexus
 *
 * Nexus is the network's AI assistant: it answers questions about one specific business using
 * only that business's own website and documents. Installed here, that business is KaiOrb.
 *
 * ── TO GO LIVE ────────────────────────────────────────────────────────────────────────────
 * Paste the publishable key for kaiorb.com from the Nexus Console into NEXUS_KEY below.
 * That is the only change required. Until a key is set this file does nothing at all —
 * no launcher, no broken circle, no network request.
 *
 * ── WHAT NEXUS LEARNS FROM ────────────────────────────────────────────────────────────────
 * Nexus crawls the site it is installed on. Its curriculum here is deliberate:
 *   /llms.txt      canonical facts + the "never claim this" guardrails (the important one)
 *   /knowledge/    the same knowledge as human Q&A, with FAQPage structured data
 *   every page     the network, capabilities, offerings, impact agents and join paths
 * Point the Nexus crawler at https://kaiorb.com/ and upload /llms.txt as a document.
 * Keep /llms.txt current — it is the single source Nexus should trust over anything inferred.
 */
(function () {
  var NEXUS_KEY = 'pk_ced3ba4e3289a80726922cc2';  // KaiOrb tenant, allowlisted to kaiorb.com
  var ACCENT    = '#f2c56d';          // KaiOrb gold
  var POSITION  = 'bottom-right';

  if (!NEXUS_KEY) {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.info('[KaiOrb] Nexus is not configured — set NEXUS_KEY in /assets/js/nexus.js');
    }
    return;
  }

  var s = document.createElement('script');
  s.src = 'https://brahmexa.com/nexus/widget.js';
  s.defer = true;
  s.setAttribute('data-nexus-key', NEXUS_KEY);
  s.setAttribute('data-nexus-accent', ACCENT);
  s.setAttribute('data-nexus-position', POSITION);
  document.body.appendChild(s);
})();
