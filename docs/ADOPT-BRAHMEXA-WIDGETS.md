# Prompt: adopt the Brahmexa widgets on kaiorb.com

**Canonical location:** `docs/ADOPT-BRAHMEXA-WIDGETS.md` — hand this to Antigravity (or any agent).
**Catalog:** <https://brahmexa.com/widgets/> · **Contract:** `Brahmando-ai/Brahmando` → `docs/products/widgets/EMBED-CONTRACT.md`
**State checked:** 2026-08-12 against the live catalog API. Re-check before starting — these numbers age.

---

## Read this before you start: most of it is not adoptable yet

Brahmexa publishes 15 embeddable widgets. **Six are connected to a data source; nine are not.**
That is not a criticism of them — it is the honest state, and it decides what you can ship.

> Updated 2026-08-12: `ngsysops-enquiry` was added (`working`, connected) and is embedded on
> `/ecosystem/`. It is an intake backed by the Brahmexa lead inbox, not an operations dashboard —
> NG SysOps has no live data source yet, and a widget that invented one would fail the same
> `connected` test this document is built around. The count moved 14→15 and connected 4→6
> (`abhyas-practice` also reports connected since this file was last checked).

Verify for yourself rather than trusting this file:

```bash
curl -s https://brahmexa.com/api/widgets/catalog | jq -r '.data.widgets[] | "\(.slug)\t\(.status)\tconnected=\(.connected)"'
```

A widget whose `connected` is `false` **will render a "this widget is not connected to its data
source yet" notice on your page.** That is the widget behaving correctly — it never invents data —
but it is not something to put in front of a visitor. **Do not embed a widget whose `connected` is
`false`, and do not hide the notice with CSS.**

### Two blockers you cannot clear yourself

1. **`BRX_WIDGETS_ADMIN_TOKEN` is unset on brahmexa.com.** Partner provisioning returns
   `503 admin_disabled`, so **no embed key can be minted for kaiorb.com at all.** Until an operator
   sets that env var, nothing in this document can be executed. Stop and report.
2. **kaiorb.com needs a partner record.** Once the token exists, an operator provisions one:

   ```bash
   curl -s -X POST https://brahmexa.com/api/widgets/admin/partners \
     -H "Authorization: Bearer $BRX_WIDGETS_ADMIN_TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{ "org": "KaiOrb",
           "widgets": ["space-proposal"],
           "domains": ["kaiorb.com", "*.kaiorb.com", "localhost"],
           "settings": { "_shared": { "accent": "#f2c56d", "mode": "auto" },
                         "space-proposal": { "heading": "Tell us what you are building" } } }'
   ```

   The response returns the `pk_` key **once**. An empty domain list makes the key inert by design,
   and the key only ever works for the widget slugs named in `widgets`.

---

## What to actually do

### 1 · Nexus is a different system — do this one first, it is the highest value

`nexus-chat` is the only widget marked `verified`, and kaiorb.com is **already wired for it**.
`assets/js/nexus.js` loads on every page and does nothing because `NEXUS_KEY` is empty.

It does **not** use the widget loader or the partner key above. It needs a publishable key from the
**Nexus Console** for a kaiorb.com tenant. One line:

```js
var NEXUS_KEY = 'pk_...';   // from the Nexus Console, not from /api/widgets/admin/partners
```

Then point the Nexus crawler at `https://kaiorb.com/` and upload the knowledge document. Note that
`/llms.txt` is deliberately **unpublished** — it lives outside every repo at
`C:\whizyoga\kai247-nexus-knowledge.md` and must be uploaded to the Console directly, never
committed or served. The deploy fails if it reappears in the tree.

### 2 · Embed `space-proposal` on the join path

Of the four connected widgets, this is the only one that fits a network site. The other three
(`restaurant-reserve`, `landscaping-quote`, `hvac-service-request`) are vertical intake forms that
belong on member businesses' own sites, not on kaiorb.com. **Do not embed them here.**

Put it on `/join/` (and consider `/contact/`, which currently routes people out to the three
founding companies' sites because KaiOrb has no contact address of its own):

```html
<div id="brahmexa-space-proposal"></div>
<script src="https://brahmexa.com/widgets/loader.js"
        data-brahmexa-widget="space-proposal"
        data-brahmexa-key="pk_YOUR_KEY"
        data-brahmexa-mount="#brahmexa-space-proposal"
        data-brahmexa-accent="#f2c56d" defer></script>
```

**Tell the visitor the truth about what happens next.** Submissions land in the Brahmexa lead inbox.
There is no email notification and no partner console — someone pulls them with
`GET /api/widgets/admin/leads`. So the surrounding copy must not promise a reply time nobody is
committed to. "We read every one" is honest; "we reply within 24 hours" is not, unless someone has
agreed to that.

### 3 · Leave the other ten alone until they connect

`reach-audit`, `reach-presence`, `comet-catalog`, `orbit-events`, `orbit-ticket`,
`restaurant-menu`, `hvac-assistant`, `lens-metrics`, `abhyas-practice` — all `partial`, all
`connected=false`. Each becomes live when an operator sets that service's base URL and token on
brahmexa.com (`BRX_REACH_BASE`, `BRX_GATEWAY_BASE`, and so on). No redeploy is needed on either
side; the badge on <https://brahmexa.com/widgets/> flips on the next request.

When `orbit-events` connects it is the obvious next adoption for kaiorb.com.

---

## The bigger reason this matters

`assets/js/viewer.js` currently opens member-company pages **inside an iframe** with KaiOrb chrome
around them — `data-url="https://brahmexa.com/csr-agent.php?slug=fafsa"` and eight more like it.
That was always described as interim: *"until each org supplies a widget — then only `data-url`
changes."*

Brahmexa has now supplied widgets. So the direction of travel is to replace those iframe tiles with
real embeds, one at a time, **as each widget actually connects**. An embedded widget beats an iframe
on every axis that matters here: it inherits KaiOrb's accent, it is keyboard and screen-reader
native rather than a nested document, it cannot be broken by the other site's framing headers, and
it needs one CSP host instead of trusting a whole origin.

Do not convert a tile whose widget is not connected. An iframe showing a real page beats a widget
saying it has no data.

---

## Rules that do not bend

- **kaiorb.com has no CSP header today.** If one is ever added it needs exactly
  `script-src https://brahmexa.com` and `connect-src https://brahmexa.com` — the widget makes no
  other external request, loads no CDN and sets no cookie.
- **Every widget renders in a closed Shadow DOM.** It cannot leak styles into the site and the site
  cannot style it. Theme it through the partner record's `accent` / `mode` settings, or the
  `data-brahmexa-accent` attribute — never by trying to reach inside it.
- **The `pk_` key is public by design.** It is gated by the domain allowlist and the enabled-widget
  list, so it is safe in page source. It is not a secret and does not need hiding.
- **Truth discipline applies to widgets too** (`docs/AGENTS.md` §5). A widget that says it is not
  connected is telling the truth; the fix is to connect it or remove it, never to dress it up.
- **Do not commit `/llms.txt`,** and do not put a host address in any file — this repo is public.

## Definition of done

- [ ] Live catalog re-checked; only `connected=true` widgets embedded
- [ ] `NEXUS_KEY` set, launcher appears, and it answers a kai247 question from the site's own content
- [ ] `space-proposal` renders on `/join/`, a test submission returns a reference id, and someone has
      confirmed they can retrieve it from the lead inbox
- [ ] Surrounding copy promises nothing about response times that nobody owns
- [ ] `npm run build` run if `src/` changed, output committed, prerender drift zero
- [ ] Verified on the deployed site, not just locally
