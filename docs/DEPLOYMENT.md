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

---

---

## 2026-08-08 — kai247.com moves to the GPU server, from THIS repo

The site is deployed by `.github/workflows/deploy-kai247.yml` on a **GitHub-hosted** runner
(free for public repos) which reaches the server over SSH — the same route
`deploy-brahmexa-com.yml` uses. A self-hosted runner is deliberately NOT used here: this repo
is public, and a fork's pull request would execute arbitrary code on the GPU server.

One repo, one source of truth. During cutover it feeds two origins at once — GitHub Pages
(still answering the public) and the GPU server — so they cannot drift.

| Piece | Where |
|---|---|
| Content | this repo, root |
| Web server | Apache pod, docroot in `WEB_ROOT`; this site is its `./kai247/` subdirectory |
| Host routing | internal rewrite in `Brahmando-ai/Brahmando` → `brahmexa-web/.htaccess` |
| Public routing (pending) | Cloudflare Tunnel → `manjulab-web.brahmando.svc.cluster.local:80` |

### Required secrets

`SSH_HOST`, `SSH_PORT`, `SSH_USER` and `WEB_ROOT` are set as repo secrets. `DEPLOYER_SSH_KEY`
already exists as a **kai247-ai org secret**, so nothing further is needed. Host details are
secrets rather than literals because this repo is public.

That key can write the shared docroot serving brahmexa.com, funsizegp.com and manjulab.com, so
a leak is not scoped to this site. The workflow never runs on untrusted refs (`push` to main
and manual dispatch only — do not add a `pull_request` trigger), and GitHub withholds secrets
from fork PRs. Worth scoping the key server-side to `./kai247/` the next time anyone has
access to that box.

### Finishing the cutover

1. ✅ Done — the workflow deploys green on every push to `main`.
2. Zero Trust → Networks → Tunnels → Public Hostnames → add `kai247.com` →
   `HTTP → manjulab-web.brahmando.svc.cluster.local:80`.
3. Cloudflare DNS → delete the four Pages A records (185.199.108–111.153) and the `www` CNAME
   to `whizyoga-ai.github.io`; they conflict with the record the tunnel creates.
4. Re-run the workflow — `Verify what the server actually serves` stops saying
   `served by: GitHub.com`.
5. Disable Pages: `gh api -X DELETE repos/kai247-ai/kai247-web/pages`. Keep the repo public;
   nothing here needs to be private now that the deploy holds no secrets in plaintext.

### Things that will bite

- **If kai247.com serves the Brahmexa site**, the files are fine — the host rewrite was dropped
  from `brahmexa-web/.htaccess` in the Brahmando repo, which is re-extracted over the docroot
  on every brahmexa.com deploy and can regress from another repository.
- **Never add a clean/delete step to `deploy-brahmexa-com.yml`** — it untars over the shared
  docroot and never deletes, which is the only reason `./kai247/` and `./funsizegp/` survive it.
- **`llms.txt` must never return.** The deploy fails if it is in the tree or on the server.

