# Decisions — divergences from the master prompt

Per the master prompt's §0, every divergence is recorded here with its reason.

## 1. GitHub Pages instead of the self-hosted gpuserver runner
The owner directed: "my repo is ready … with cloudflare and github pages - make it live."
This supersedes master prompt §10 (Deployment Reality). Cloudflare provides DNS
(apex A records → GitHub Pages IPs, `www` CNAME → GitHub Pages); GitHub Pages serves
the repo root from `main`. No Actions workflow is needed — branch-based Pages deploys on push.

## 2. No build step; the universe graph is not yet mechanical
§2.2 calls for a `universe.ts` single source of truth from which nav/pages/JSON-LD derive.
At 7 entities and 10 pages, a build pipeline costs more than it saves. The graph currently
lives as consistent hand-written HTML + the JSON-LD block in `index.html`.
**Revisit when the network passes ~10 entities** — then introduce a generator so adding a
brand is one data commit.

## 3. Copy-budget and truth lints are manual, not CI
§9.4 asks for CI lints. With no build step there is no CI; budgets were enforced by hand at
authoring time. Add CI when a build step arrives (see 2).

## 4. No Open Graph images
Generated per-entity OG cards (§2.2) need a raster pipeline. Deferred; pages ship with
og:title/og:description only.

## 5. Google Fonts (Space Grotesk + Inter) via CDN
Self-hosting fonts would avoid a third-party request; CDN chosen for launch simplicity with
preconnect. Swap to self-hosted woff2 if performance measurement demands it.

## 6. Easy Q2C has no descriptor
easyq2c.com returned Cloudflare error 525 (origin SSL failure) on 2026-08-08 — its offering
could not be verified, so per §3 the brand renders as name + country + link only.
Add a descriptor when the site is reachable. (Also: tell the owner their origin cert is broken.)

## 7. No KAI247 contact email
No public KAI247-owned contact channel could be verified. Contact routes through the three
founding companies' sites. When the owner establishes a canonical address (e.g.
hello@kai247.com), add it to /contact and /join.

## 8. ORBIT is described as "intelligent web hosting"
brahmexa.com currently presents ORBIT as intelligent web hosting (not event ticketing, as
earlier internal notes suggested). The live public site wins per §3.2. If ORBIT's public
positioning changes, update /capabilities.

## 9. "Funsize GP" as the cosmos label
"Global & Funsize Productions" is too long for an orbital label; shortened on the homepage
SVG only, with the full name in the aria-label and everywhere else.

## 10. Application intake via pre-composed email (mailto), interim address
GitHub Pages has no backend, so /join/brand/ and /join/provider/ submit by opening the
applicant's own mail client with the form serialized into the body (`assets/js/apply.js`).
Nothing is stored on the site; providers attach their offering document (Excel, PDF, any
shape) in the email itself. **Interim intake address: tech@inducersolutions.com** — chosen
because it is the owner's known business address at a founding company; the owner should
confirm or replace it (it appears in the two `data-apply` attributes and the two visible
"prefer plain email" links). Upgrade path when volume justifies it: a Cloudflare Worker
form endpoint or a form service, which would also enable real file upload.

## 12. Offerings are presented as KAI247's, and open in-page via iframe
Per owner direction (and master prompt §3.4, "one unified KAI247 capability ecosystem"), the
platform catalog no longer reads as a directory of other companies' sites. Tiles carry the
offering name and descriptor only; the delivering domain appears in the viewer chrome, not on
the tile face. Clicking opens `assets/js/viewer.js` — a full-screen in-page frame with KAI247
chrome (Esc / Close / "Open in new tab" / `#open=<slug>` deep link). Links clicked inside the
frame stay inside the frame, so the visitor never leaves the orbit.

**Embeddability was verified on 2026-08-08**: none of brahmexa.com, brahmando.com,
jsisoftwaresolutions.com, inducersolutions.com, primovive.com, skincareisha.com or
funsizegp.com send `X-Frame-Options` or a CSP `frame-ancestors` directive. **Re-check before
adding any new domain** — if a site starts refusing frames the viewer shows a blank stage, so
the "Open in new tab" fallback in the chrome is mandatory, not optional.

Interim only: each tile frames the delivering site. When per-offering widgets arrive from the
individual orgs, **only the tile's `data-url` changes** — no other code moves.

## 13. Founding trinity rendered as an orbital composition, not cards
The company list was a rectangular card stack, which the brief explicitly rules out ("minimal
rectangular-card overload", "minimal corporate-grid feeling"). Replaced with `.trinity`: three
planets seated on a shared SVG arc, each with an elliptical ring echoing the KAI247 mark and
the country code on the disc — so the "built across three continents" story is told by the
composition itself. Arc geometry: viewBox `0 0 1000 240`, path `M 0 210 Q 500 -90 1000 210`,
rendered at 216px with `preserveAspectRatio="none"`, so orb centres land on the curve at any
width (verified: within 2px). Below 900px it becomes a vertical orbital path. The old `.world`
component is fully removed.

## 14. Nexus chat assistant — curriculum built, widget ships inert pending a key
Nexus (brahmexa.com/nexus.php) is an AI assistant that answers questions about **one specific
business using only that business's own website and documents**. Installed here, that business
is KAI247. Its official install is a single script tag:

    <script src="https://brahmexa.com/nexus/widget.js" data-nexus-key="pk_…" defer></script>

It renders its own circular launcher in a shadow DOM and supports `data-nexus-key` (required),
`data-nexus-accent` and `data-nexus-position`.

**Blocker: KAI247 has no publishable key.** A `pk_` key is issued from the Nexus Console and
cannot be invented — a wrong or absent key yields a dead circle or someone else's business
brain. So `assets/js/nexus.js` ships with `NEXUS_KEY = ''` and **does nothing at all** until a
key is set: no launcher, no request, no broken UI. Setting that one string turns Nexus on
site-wide (it is already loaded on all 14 pages, with KAI247 gold as the accent).

**No stand-in chat was built.** A hand-rolled Q&A panel dressed as an AI assistant would be a
false claim, and the Nexus demo belongs to a fictional business. Absence over pretence.

**What WAS delivered is the education**, which is the part that actually determines answer
quality — Nexus learns by crawling:
- `/llms.txt` — canonical KAI247 facts *and* an explicit "never claim this" section (no invented
  metrics, no "subsidiary", no prices, no KAI247 email, CSR agents are guidance-only, say "I
  don't know" rather than guess). This is the guardrail document; keep it current.
- `/knowledge/` — the same knowledge as human Q&A with `FAQPage` structured data, which also
  serves answer engines and AI assistants generally (master prompt §15).

To activate: set the key, point the Nexus crawler at https://kai247.com/, and upload
`/llms.txt` as a document so it outranks anything inferred.

## 15. /knowledge/ exceeds the 350-word page budget
Master prompt §5 caps rendered prose per page. An FAQ page is inherently textual and exists to
be read by both humans and crawlers, so the budget is waived here only. Every other page still
holds to it.

## 11. Free-plan wording is founding-period framing, no fixed terms
The owner directed a free plan now with charging later. To avoid overpromising legal terms
(§3.3), the site says: free during the founding period; hosting/infrastructure/capability
included; paid plans later with founding brands hearing first; terms shaped brand by brand.
No prices, dates, or contractual commitments are stated.

## 18. Brahmexa's offering list replaced by the widget catalog, grouped business vs service
Owner direction. The previous "KAI247 offerings" tiles (Brahmando, Nexus, ORBIT, REACH, ANYO
Academy, SMB Engine, SWAN, Abhyas, School ERP, Chat X) were a product list; they are replaced
by the fourteen embeddable widgets, which are the thing a visitor can actually put on a page.

Grouped by the owner's rule — "restaurant is business but REACH is service":
- **Services** (what the network runs): NEXUS, REACH, COMET, ORBIT, LENS, SPACE — 8 widgets.
- **Businesses** (what a business puts on its own site): Restaurant, HVAC Support,
  Landscaping, Education — 6 widgets.

**Education sits under Businesses**, alongside restaurant and landscaping, because the Abhyas
widget serves school, tutor and publisher sites — the customer's own vertical. It could equally
be read as a service line (brahmexa.com lists `/services/education`); if it should move, it is
one `qa-group` boundary in `capabilities/index.html`.

Statuses are rendered verbatim from the platform (`verified` / `working` / `partial`) rather
than smoothed into marketing language, and a note explains what each means. Ten of the fourteen
are `partial`; presenting them as live is the specific failure the widget platform's own tests
exist to prevent.

Tiles open each widget's `preview.php` in the in-page viewer rather than embedding it, because
embedding needs a partner key with kai247.com on its allowlist and KAI247 has none. When a key
is issued, an embedded widget replaces the preview tile — the loader snippet is one line.
