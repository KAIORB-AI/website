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

## 7. No KaiOrb contact email
No public KaiOrb-owned contact channel could be verified. Contact routes through the three
founding companies' sites. When the owner establishes a canonical address (e.g.
hello@kaiorb.com), add it to /contact and /join.

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

## 12. Offerings are presented as KaiOrb's, and open in-page via iframe
Per owner direction (and master prompt §3.4, "one unified KaiOrb capability ecosystem"), the
platform catalog no longer reads as a directory of other companies' sites. Tiles carry the
offering name and descriptor only; the delivering domain appears in the viewer chrome, not on
the tile face. Clicking opens `assets/js/viewer.js` — a full-screen in-page frame with KaiOrb
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
planets seated on a shared SVG arc, each with an elliptical ring echoing the KaiOrb mark and
the country code on the disc — so the "built across three continents" story is told by the
composition itself. Arc geometry: viewBox `0 0 1000 240`, path `M 0 210 Q 500 -90 1000 210`,
rendered at 216px with `preserveAspectRatio="none"`, so orb centres land on the curve at any
width (verified: within 2px). Below 900px it becomes a vertical orbital path. The old `.world`
component is fully removed.

## 14. Nexus chat assistant — curriculum built, widget ships inert pending a key
Nexus (brahmexa.com/nexus.php) is an AI assistant that answers questions about **one specific
business using only that business's own website and documents**. Installed here, that business
is KaiOrb. Its official install is a single script tag:

    <script src="https://brahmexa.com/nexus/widget.js" data-nexus-key="pk_…" defer></script>

It renders its own circular launcher in a shadow DOM and supports `data-nexus-key` (required),
`data-nexus-accent` and `data-nexus-position`.

**Blocker: KaiOrb has no publishable key.** A `pk_` key is issued from the Nexus Console and
cannot be invented — a wrong or absent key yields a dead circle or someone else's business
brain. So `assets/js/nexus.js` ships with `NEXUS_KEY = ''` and **does nothing at all** until a
key is set: no launcher, no request, no broken UI. Setting that one string turns Nexus on
site-wide (it is already loaded on all 14 pages, with KaiOrb gold as the accent).

**No stand-in chat was built.** A hand-rolled Q&A panel dressed as an AI assistant would be a
false claim, and the Nexus demo belongs to a fictional business. Absence over pretence.

**What WAS delivered is the education**, which is the part that actually determines answer
quality — Nexus learns by crawling:
- `/llms.txt` — canonical KaiOrb facts *and* an explicit "never claim this" section (no invented
  metrics, no "subsidiary", no prices, no KaiOrb email, CSR agents are guidance-only, say "I
  don't know" rather than guess). This is the guardrail document; keep it current.
- `/knowledge/` — the same knowledge as human Q&A with `FAQPage` structured data, which also
  serves answer engines and AI assistants generally (master prompt §15).

To activate: set the key, point the Nexus crawler at https://kaiorb.com/, and upload
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
Owner direction. The previous "KaiOrb offerings" tiles (Brahmando, Nexus, ORBIT, REACH, ANYO
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
embedding needs a partner key with kaiorb.com on its allowlist and KaiOrb has none. When a key
is issued, an embedded widget replaces the preview tile — the loader snippet is one line.

## 19. Education removed from the widget catalog
Owner direction. The `abhyas-practice` tile is gone; the catalog is now 13 widgets, and
Businesses is restaurant, HVAC and landscaping. Education remains a capability constellation
(SWAN boards, smart classrooms) — only the widget was removed.

## 20. /utility built in vanilla JS, not React
The brief asked for React/TypeScript components. This site is deliberately build-free static
HTML deployed as a tarball over SSH; introducing React means a build pipeline, a node_modules
tree in CI, and a framework payload against a ≤200 KB JS budget — for tools whose whole shape
is form → compute → render. Each tool is instead a self-contained page with an inline ES5
module, which is also why they work with no network at all. Reversible: if a suite arrives that
genuinely needs component state (the finance analyzer is the likely one), a build step can be
added then without touching the pages that do not need it.

## 21. /utility ships three suites, five marked in development
The brief listed eight suites. Three are built and verified end to end in a browser:
Photo Size Targeter (3.53 MB → 198.5 KB at full resolution), CIDR Calculator (IPv4/IPv6 via
BigInt, RFC 3021 /31 handling, overlap detection) and Web Essentials (UTM, slug, robots.txt,
sitemap). The other five are rendered as **in development** rather than linked to empty pages
— the site's "no dead worlds" rule.

PDF size reduction and the XLSX half of the finance analyzer both need a WebAssembly or parser
dependency; shipping a PDF tool that silently rasterises text would be worse than not shipping
one. QR generation is deliberately deferred rather than guessed at: a QR encoder cannot be
verified correct without a decoder to check it against, and an unscannable QR code is a failure
that looks like success.

## 22. The assistant bar is a deterministic router, not an LLM
`assets/js/utility-router.js` matches declared patterns, extracts only parameters it can prove
are present (size targets, device counts, URLs, CIDR blocks) and opens the tool pre-filled. It
never routes to an unbuilt tool — it names the tool and says it is in development. This is the
local half of the Nexus bar; when a Nexus key exists for kaiorb.com, unmatched requests are
what should be handed to it.

## 23. /utility and /utilities are two different things
`/utilities/` is the Instrument Ring — tools contributed by the network (School ERP, ORBIT
starter analysis, Brahmando Marketplace). `/utility/` is KaiOrb's own browser-side suite. Main
navigation now points at `/utility/`, and the two cross-link. **This is a confusing pair of
URLs** and worth merging under one name when the owner picks one.

## 24. The founding trinity is a point-DOWN triangle
Owner direction: triangle, and no country in the middle or at the top. An upward triangle puts
one country at the apex, and an apex reads as rank — wrong for three companies that deliver as
one network. Pointing down leaves the top edge flat: two countries sit at exactly the same
height (verified: both orb centres at y=54), the third sits below, and the centroid is the
KaiOrb mark rather than any country. The middle of the network is the network.

Countries render as their own map silhouette **filled with their flag colours**, inside the
flattened elliptical ring from the KaiOrb logo. Filling the map with the flag — rather than
drawing a white map over flag bands — is what keeps it legible: there is no band the silhouette
can disappear against, in either theme. The paths are deliberately simplified; at 76px a
survey-accurate coastline is noise. Canada's path is centred on y=45 rather than y=50 because
it is far wider than tall and otherwise floats above the middle of its orb.

## 25. React arrives as islands, not a rewrite
Owner direction, superseding decision #20 for components that will grow. The marketing pages
stay static HTML — they must render with no JavaScript, and the deploy is a tarball of files,
not a server. React mounts only where a component grows.

The first island is the trinity, and it earns React twice over: adding a company is one entry
in `src/data/network.ts` (a new country is one entry in `src/data/countries.ts`), and the
triangle's edges are **measured from the rendered orbs** via `useLayoutEffect` + `ResizeObserver`
rather than hard-coded percentages, so they stay attached at any width, font size or zoom.

`npm run build` does three things: bundles the client island, builds an SSR copy of the same
component, and runs `scripts/prerender.mjs` to bake that markup between `<!-- island:trinity -->`
markers in the HTML. That is what stops the island and its no-JS fallback from drifting: both
come from one component, so the crawlable HTML updates in the same commit. CI re-runs the build
before deploying and fails if the prerender did not land.

Cost, stated plainly: react + react-dom is 198 kB raw / **62.7 kB gzipped** for one component.
That is real, and only worth it because more islands are coming. If the island count stays at
one, this should be reverted rather than defended.

## 26. NG SysOps arrives as an enquiry, not a dashboard
Added 2026-08-12. NG SysOps — Brahmexa's Enterprise Operations Intelligence offering — is on
`/ecosystem/` as a Brahmexa widget beside the two ORBIT ones, using the same partner key.

The obvious widget would have been an operations board: incidents, blast radius, "what changed".
There is no NG SysOps service behind any of that yet, so such a widget would be `placeholder`,
which the Brahmexa catalog bars from the shareable set, and `connected=false`, which
`docs/ADOPT-BRAHMEXA-WIDGETS.md` tells us never to embed. Shipping one anyway with invented
incidents would also contradict the single thing the product argues — that an operations
conclusion is worth nothing without the evidence behind it. A product whose first impression on
the network's front door is fabricated operations data has lost that argument before it starts.

So the widget is `ngsysops-enquiry`: an intake that captures a qualified operations brief into
the Brahmexa lead inbox and reports success only when the lead was durably stored. That is
`working` and connected on the same terms as `space-proposal`. What is actually on offer today
is the design partnership, and this is the honest surface for it.

Blue (`#7aaefc`) rather than the ORBIT gold, so the two network capabilities on that page stay
visually distinct. When the NG SysOps API exists, a live operations widget joins the band — it
does not replace this one.
