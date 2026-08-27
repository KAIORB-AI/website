# Working on kaiorb.com — instructions for coding agents

**Canonical location:** `docs/AGENTS.md` (Antigravity, Claude, Codex, Cursor — all of you)
**Related:** [DEPLOYMENT.md](DEPLOYMENT.md) · [DECISIONS.md](DECISIONS.md) · [CONTENT-INVENTORY.md](CONTENT-INVENTORY.md) · [CAPABILITIES-FLOW-DESIGN.md](CAPABILITIES-FLOW-DESIGN.md)

This file is excluded from the deploy tarball and from the deploy trigger, so
editing it publishes nothing and deploys nothing.

---

## 0. First, make sure you are in the right repository

**kaiorb.com is served from `kai247-ai/kai247-web` — this repo.**
Local clone: `C:\whizyoga\repos\kai247-web`.

There is a second repository that is easy to mistake for this one:

| Repo | What it is | Does editing it change kaiorb.com? |
|---|---|---|
| `kai247-ai/kai247-web` (this one) | The website. Static HTML/CSS/SVG at the repo root, plus React islands. | **Yes** |
| `kai247-ai/Utilities` | A separate React monorepo of utility apps. Its pipeline builds a container and deploys it to a GPU server on port 8000. | **No** |

`kai247-ai/Utilities` contains commits with messages like *"preserve and elevate
Fable 5 circular orbital theme on kaiorb.com landing page"*. **Those changes do
not reach kaiorb.com.** They alter that monorepo's own `packages/ui`, which is
served by a container, not by this site. Note also that this repo already has
its own utilities pages at `/utility/` and `/utilities/`, unrelated to that
monorepo.

If the task is "change something a visitor sees on kaiorb.com", the change
belongs **here**.

---

## 1. Where things live

- Site content is at the **repo root**, one folder per route:
  `index.html`, `ecosystem/`, `capabilities/`, `brahmando/`, `network/`,
  `impact/`, `utility/`, `utilities/`, `join/`, `about/`, `contact/`,
  `knowledge/`
- `assets/css/site.css` — the design system. `assets/css/utility.css` is
  standalone for `/utility/` and deliberately does **not** load `site.css`
- `assets/js/` — small vanilla scripts (hour tint, viewer, nexus loader)
- `src/` — React island **source** (TypeScript). Not shipped.
- `assets/build/` — compiled island output. **Shipped, and committed.**
- `docs/` — documentation. Not shipped.

---

## 2. How to commit and deploy

Pushing to `main` **is** the deploy. There is no staging step.

```bash
cd C:\whizyoga\antigravity\kai247-web
git checkout main
git pull --ff-only
# ... make your changes ...
npm run build          # REQUIRED if you touched src/ — see §3
git add -A
git commit -m "Describe what a visitor now sees, and why"
git push origin main
```

`.github/workflows/deploy-kai247.yml` then runs on a GitHub-hosted runner,
rebuilds the islands, tars the site and rsyncs it over SSH into the `./kai247/`
subdirectory of the shared docroot on the GPU server.

**Do not add a `pull_request` trigger to that workflow.** This repo is public.
A workflow that never runs on an untrusted ref cannot leak the deploy key, and
that is deliberate. For the same reason, never attach a self-hosted runner here.

These paths do **not** trigger a deploy: `docs/**`, `README.md`, `.gitignore`.
Documentation-only commits are therefore free.

---

## 3. If you touched `src/`, you must run the build before committing

The React islands are prerendered: `npm run build` compiles the client bundle
to `assets/build/`, builds an SSR bundle to `.ssr/` (gitignored), then
`scripts/prerender.mjs` bakes the component's rendered markup into the static
page between `<!-- island:NAME -->` markers.

```bash
npm run build
git add assets/build src <the page that contains the island>
```

CI re-runs the same build and **fails the deploy** if the prerendered markup is
missing:

```
test -f assets/build/trinity.js
grep -q 'k-trinity' network/index.html
```

So committing a changed component without running the build produces a red
deploy, not a silently stale page. Run it locally and commit the output.

Adding a company to the trinity island is one entry in `src/data/network.ts`;
a country is one entry in `src/data/countries.ts`. Then rebuild.

---

## 4. Things that must never be committed

- **`llms.txt`** — gitignored, and CI has a dedicated step that fails the deploy
  if it reappears in the tree or on the server. The Nexus knowledge document it
  came from contains internal "never claim this" guardrails and lives outside
  every repo, at `C:\whizyoga\kai247-nexus-knowledge.md`. Do not recreate it here.
- `node_modules/`, `.ssr/` — gitignored build inputs/outputs.
- Any real server address, port, user or docroot. **This repo is public.** Host
  details are GitHub Actions secrets (`SSH_HOST`, `SSH_PORT`, `SSH_USER`,
  `WEB_ROOT`, `DEPLOYER_SSH_KEY`), never literals in a file. Writing one into
  the workflow is free reconnaissance for anyone reading the repo.

---

## 5. Truth discipline — the rule that outranks looking good

Every factual descriptor on this site was verified against the live public sites
of the network's companies (see `docs/CONTENT-INVENTORY.md`). **Unverifiable
facts are absent, not invented.** Do not add a statistic, a client name, a
capability or a claim you cannot point at a source for. If a member site's
catalog is being represented, enumerate what is actually there rather than
summarising it, and carry any disclaimer that travels with it.

Known gaps you must not paper over: **easyq2c.com is currently broken**
(Cloudflare 525), and **there is no KAIORB contact email** — `/contact` routes
through the founding companies' sites.

---

## 6. Presentation rules the owner enforces

1. **Never render network entities as rectangular card stacks.** Founding
   companies are an orbital composition — planets on a shared arc. The trinity
   is a point-**down** triangle; an apex reads as rank, and the companies are
   peers.
2. **Catalogs must read as one KAIORB offering set**, never a directory of
   member-company links. Tiles open the destination inside the page via
   `assets/js/viewer.js`.

---

## 7. After you push, verify

The workflow has a final step that checks what the server actually serves, but
green Actions means the files shipped — not that the page is right.

```bash
curl -sI https://kaiorb.com/ | head -3
```

If kaiorb.com starts serving the **Brahmexa** site, the files here are fine and
the routing broke **in another repository**: the host is matched by an internal
rewrite in `Brahmando-ai/Brahmando` → `brahmexa-web/.htaccess`. Equally, never
add a clean or delete step to that repo's `deploy-brahmexa-com.yml` — it untars
over the shared docroot without deleting, and that is the only reason
`./kai247/` survives a brahmexa.com deploy.

---

## 8. One known inconsistency

`README.md` still describes the site as "deliberately build-free" and names
GitHub Pages as the origin. Both are now out of date: React islands introduced a
build step, and the live origin is the GPU server via the Cloudflare tunnel. The
Pages origin may still be serving in parallel. Fix the README when you next
touch it; do not use it as the authority on how this deploys — `docs/DEPLOYMENT.md`
and the workflow itself are.
