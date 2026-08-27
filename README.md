# kai247-web

The production website for **kaiorb.com** — KaiOrb, a companion ecosystem. *Small changes. Always. 24×7.*

## Architecture

Modern static website built with clean CSS, lightweight SVG geometry, and Vite-powered React islands (`src/`) for interactive spatial models.

- `index.html` — the Awakening (homepage cosmos hero section)
- `ecosystem/ capabilities/ brahmando/ network/ impact/ utility/ utilities/ join/ about/ contact/` — one folder per route
- `src/` — React islands (e.g. `Trinity.tsx`, `CountryOrb.tsx`) compiled to `assets/build/` and pre-rendered into static HTML during build
- `assets/css/site.css` — main design system (deep-space dark mode & day-side light mode)
- `assets/js/cosmos.js` — ambient tint follows the visitor's local hour

## Truth Discipline

Every factual descriptor on the site was verified against the live public sites of the network's companies. Unverifiable facts are absent, not invented. Keep it that way.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy-kai247.yml`, which builds React islands (`npm run build`), verifies pre-rendered HTML, and syncs the site to the production server. See `docs/DEPLOYMENT.md` and `docs/AGENTS.md` for details.
