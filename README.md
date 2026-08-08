# kai247-web

The production website for **kai247.com** — KAI247, a companion ecosystem. *Always with you.*

## Architecture

Deliberately build-free: hand-crafted static HTML/CSS/SVG, one small JS file (the hour-tint).
The universe metaphor is the information architecture — see `docs/DECISIONS.md` for what was
chosen and why, and `KAI247_CLAUDE_FABLE5_MASTER_PROMPT.md` history in the owner's workspace
for the governing brief.

- `index.html` — the Awakening (homepage cosmos, star-chart-first, animated by CSS only)
- `ecosystem/ capabilities/ brahmando/ network/ impact/ utilities/ join/ about/ contact/` — one folder per route
- `assets/css/site.css` — the entire design system (deep-space dark primary, day-side light mode)
- `assets/js/cosmos.js` — ambient tint follows the visitor's local hour
- `CNAME` — `kai247.com` (GitHub Pages custom domain)

## Truth discipline

Every factual descriptor on the site was verified against the live public sites of the
network's companies on 2026-08-08 — see `docs/CONTENT-INVENTORY.md`. Unverifiable facts are
absent, not invented. Keep it that way.

## Deploying

Push to `main`. GitHub Pages serves the repository root. Details: `docs/DEPLOYMENT.md`.
