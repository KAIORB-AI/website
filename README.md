# KAIORB Website

Production website for https://kaiorb.com.

KAIORB is the brand/company/provider network.

This is not the KAI247 SaaS platform.
KAI247 lives at https://kai247.com.

GitHub: [`KAIORB-AI/website`](https://github.com/KAIORB-AI/website).
KAI247 application source: `KAIORB-AI/kai247` (private).

*Small changes. Always. 24×7.*

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

See `docs/DEPLOYMENT.md` and `docs/AGENTS.md`. There is no push-triggered GitHub Actions deploy in this repository; infrastructure identifiers (`kai247-web` containers, GitLab `kai-production/kai247/kai247-web`) are unchanged.
