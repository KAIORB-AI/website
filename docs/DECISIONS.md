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

## 11. Free-plan wording is founding-period framing, no fixed terms
The owner directed a free plan now with charging later. To avoid overpromising legal terms
(§3.3), the site says: free during the founding period; hosting/infrastructure/capability
included; paid plans later with founding brands hearing first; terms shaped brand by brand.
No prices, dates, or contractual commitments are stated.
