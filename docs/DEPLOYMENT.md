# Deployment — kai247.com

## Serving path (recorded 2026-08-08)

| Piece | Where it lives |
|---|---|
| Content | This repo (`kai247-ai/kai247-web`), branch `main`, root folder |
| Hosting | GitHub Pages (branch-based, no Actions workflow) |
| Custom domain | `CNAME` file in repo root → `kai247.com`, plus Pages custom-domain setting |
| DNS | Cloudflare: apex `kai247.com` A → 185.199.108/109/110/111.153 (GitHub Pages); `www` CNAME → GitHub Pages |
| TLS | GitHub Pages-issued certificate for kai247.com (enforce HTTPS once provisioned) |

Note: the `www` CNAME currently targets `whizyoga-ai.github.io`. GitHub routes custom domains
by Host header so this works, but `kai247-ai.github.io` (the org that owns the repo) is the
cleaner target — change it in Cloudflare when convenient. Consider also verifying the domain
for the `kai247-ai` org (Settings → Pages → verified domains) to prevent domain takeover.

## To update the site

1. Edit files, keeping `docs/CONTENT-INVENTORY.md` honest about any new factual claim.
2. Push to `main`. Pages redeploys automatically within a minute or two.

## To add a network brand

1. Verify the brand's site is live and read what it actually does.
2. Add its entry to `network/index.html` and the homepage `worlds` list; add an orbital node
   to the homepage cosmos SVG if desired; add it to the JSON-LD `member` array in `index.html`.
3. Record the verification in `docs/CONTENT-INVENTORY.md`.
4. Never remove the Open Orbit seat — the universe always keeps one seat empty.
