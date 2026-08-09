# Capabilities page — the workflow flow design

**Files:** `capabilities/index.html` · `assets/js/cst-data.js` (the shapes) ·
`assets/js/constellations.js` (the renderer) · `assets/css/constellations.css`
**Established:** 2026-08-08. Two revisions the same day: first replacing the
original horizontal card-chains (which line-wrapped), then — on the owner's
direction — moving the panel below the wheel and turning wide-screen flows
horizontal again, properly this time.

---

## 1. History: why it looks the way it does

**Rev 1 (broken):** workflows drew as left-to-right chains of cards beside
the wheel, in a ~460px side panel. Chains line-wrapped like text — a
three-step flow broke mid-arrow with a connector dangling into nothing — and
single-card "parallel lanes" read as an indented bullet list.

**Rev 2:** flows turned vertical (a spine that cannot wrap), still in the
side-by-side layout.

**Rev 3 (current):** the owner directed that workflows read better wide:
*the panel now always opens FULL-WIDTH BELOW the wheel* (the side-by-side
`is-open` mode is gone), and on wide screens flows run horizontally again —
but engineered so wrapping is impossible. The vertical spine survives as the
phone rendering. Do not reintroduce a thin side panel; that constraint is
what broke Rev 1.

## 2. One DOM, two renderings

The renderer emits one structure; CSS switches orientation at **720px**.

### 720px and up — horizontal, n8n-style
- Every node is the same card (icon chip, kind, label, centred), flexible
  between 120–168px so mid-length chains compress to fit the panel.
- Nodes sit on a horizontal rail; `.cst-flow` is `overflow-x: auto`, so a
  flow longer than the panel scrolls **inside its own container** — the page
  never scrolls sideways. That in-container scroll is deliberate; do not
  "fix" it by letting the flow wrap.
- **The panel breaks out of the 1080px container above 1200px**, widening to
  `min(1320px, 100vw - 3rem)` via `left: 50%; transform: translateX(-50%)`.
  At 1440px every flow in all eight constellations fits with no scrolling at
  all; the two longest (Software's 8-node chain, AI's 11-node branch) only
  scroll on narrower desktops. `100vw` includes the scrollbar — hence the
  3rem inset, which is what keeps the page from gaining a horizontal
  scrollbar of its own.
- **branch**: lanes stack vertically between a vertical *fork bar* and *join
  bar* (`.cst-lanes::before/::after`, spanning first-lane-centre to
  last-lane-centre via `top/bottom: calc(50% / var(--lanes))`), each lane
  hung on the bars by 14px stubs. **fanin** is the same minus the fork bar.
- **grid**: checks in an auto-fit grid with a vertical collector bar on the
  right.
- **loop**: the return path is a dashed bracket UNDER the run
  (left/right/bottom borders, arrowhead pointing back up into the start),
  retry label centred on the bottom edge. `.cst-loop` carries
  `margin-top: 34px` mirroring its `padding-bottom: 34px` so the run stays
  centred on the rail next to its exit segment and tail.
- Geometry carries the semantics here: what stacks between bars is parallel,
  what sits on the rail is sequence.

**Scroll must be visible.** A flow that scrolls with no affordance looks
truncated — the same "this diagram is broken" impression the original bug
gave. `wireScrollHints()` in the renderer maintains three classes per flow:
`can-scroll` (more than fits), `at-start` and `at-end` (which ends are
already visible). CSS fades whichever edge still has pipeline behind it via
`mask-image`, and shows a "scroll to follow the flow →" hint in the workflow
header. State updates on scroll, on `ResizeObserver`, and on window `resize`
(the last is the fallback for browsers without `ResizeObserver`).

> **Ordering trap:** `wireScrollHints()` **must** be called *after*
> `panel.hidden = false`. A hidden panel is `display: none`, so every
> measurement inside it reads zero and every flow looks like it fits —
> calling it from `renderPanel()` silently disabled the hint everywhere.
> This was caught in testing; keep the call in `select()`.

### Below 720px — the vertical spine
- Flows descend a rail fixed at x=14px (chip centre); sequential steps are
  airy rows (chip left, label right), parallel sections fold into a
  bracketed list off the spine (dashed left border + horizontal stubs),
  cells in row orientation with the kind label hidden (chip colour still
  carries it).
- Loops keep a right-side return bracket with the retry pill pinned to it.
- In this rendering, sequence and parallelism deliberately do NOT look
  alike — rows vs bordered cells.

## 3. The animation grammar

Nodes light **in turn** — a system working steadily, not a spinner.

- Every node carries `--i` (light-up order) and `--cycle` (loop length,
  `total nodes × 1.05s + 4.5s`, per workflow).
- Desktop cards flash border + lift (`cst-cell-lite`); mobile spine rows
  flash a soft background (`cst-row-lite`) and chips a gold ring
  (`cst-dot-lite`). Connector segments run a travelling gold dot —
  `cst-travel` (down) on mobile, `cst-travel-h` (rightward) on desktop —
  offset +0.35s so the dot leaves a node just after it lights.
- Parallel lanes share indices (parallel = simultaneous); fan-in sources
  light one after another (arrivals), then merge.
- `prefers-reduced-motion` disables everything; the dot parks mid-segment.

## 4. The kind vocabulary

Six node kinds, one hue per role, applied to the chip via `[data-kind]`:
`trigger` (blue bolt) · `ai` (gold) · `action` (grey arrow) · `check`
(violet shield) · `human` (blue figure) · `output` (green check). Do not add
a kind without a colour and an icon in `KIND_ICON`.

## 5. Content register

**AI & Intelligence is written technical on purpose** (owner direction,
2026-08-08): hybrid retrieval BM25 + vectors, cross-encoder rerank,
text-to-SQL, groundedness gates, chunk-and-embed with Recall@10 eval,
LLM-as-judge prompt regression gating. Keep that register when editing it —
this constellation is the flagship and its audience is engineers. Other
constellations stay in plain operational language (their audiences are
school heads, event producers, controllers).

## 6. Adding or editing a workflow

Shapes live in `assets/js/cst-data.js` as data — no renderer changes needed.
Pick the layout that matches the real topology (`chain`, `branch`, `loop`,
`fanin`, `grid`); the file header documents each field. Then bump the `?v=`
query on **all three** constellation assets in `capabilities/index.html` —
they version together.

Rules that outrank aesthetics, restated from the data file:

1. Workflows are **illustrative** — the shape of automation in an area, not
   a claim that KAI247 runs that pipeline for a customer today. The badge
   above the diagrams says so. Never drop it.
2. Do not add a workflow describing something the network cannot build.

## 7. Deep links

`/capabilities/#<family-id>` opens that constellation on load and via
`hashchange`, so in-page links work without a reload. `select()`/
`deselect()` write the hash with `replaceState`, which does not fire
`hashchange`, so there is no re-entry loop. Opening always scrolls the
panel into view (it unfolds below the wheel).

## 8. How this was verified

No-JS fallback (the `<noscript>` card grid) is untouched. Checked at
1440×900, 1280×800, 900×800 and 375×812:

- All eight constellations open at every width; console clean throughout.
- Desktop: every node in a flow shares one rail y-centre (the wrap bug is
  measurably absent). At 1440 all 19 flows fit with zero scrolling; at 900
  the long ones scroll and the hint/fade appear, with the fade correctly
  tracking start → middle → end.
- The scroll hint is asserted *both ways*: visible exactly when a flow
  overflows, hidden exactly when it fits.
- Mobile: the vertical spine returns, no element escapes the panel, no hint
  ever shows (vertical flows cannot overflow).
- The page itself never gains a horizontal scrollbar at any width.

One testing artifact worth knowing: the browser-pane resize tool changes the
emulated viewport **without dispatching a `resize` event**, so scroll-hint
state looks stale after a programmatic resize. Dispatching `resize` manually
(or reloading at the target width) shows the logic is correct — real browser
resizes fire the event normally.
