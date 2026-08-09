# Capabilities page — the workflow flow design

**Files:** `capabilities/index.html` · `assets/js/cst-data.js` (the shapes) ·
`assets/js/constellations.js` (the renderer) · `assets/css/constellations.css`
**Established:** 2026-08-08, replacing the horizontal card-chain rendering.

---

## 1. Why the panel was rebuilt

The first rendering drew every workflow as a left-to-right chain of cards
joined by horizontal connectors. On desktop the panel sits **beside** the
wheel and is only ~460–520px wide — and a horizontal chain that does not fit
line-wraps like text. Measured on the live page at a 1280px viewport, the
three-step Education chain broke after its second card: the third card jumped
to a new line at the far left, with the connector after card two dangling into
nothing. A flow diagram that wraps mid-arrow reads as broken, which is what
"looks weird" was.

Two smaller problems compounded it: parallel branches rendered as an indented
dashed list (single-card "lanes" looked like bullets, not simultaneous work),
and Education was the sparsest constellation on the page — two workflows, one
of them three nodes.

## 2. The fix: flows read top to bottom

A vertical flow cannot wrap. Every layout now descends a **spine** — a rail
fixed at x=14px (the centre of the 28px icon chips). Every connector,
junction stub and bus bar is drawn against that same coordinate, which is what
makes forks and joins look like plumbing rather than decoration.

The grammar has exactly two vocabularies, and they must not look alike:

| Meaning | Drawn as | Class |
|---|---|---|
| One-after-another work | A row **on** the spine: icon chip on the rail, kind + label beside it. No border. | `.cst-step` |
| Simultaneous work | A **centred mini-card** in a column: chip on top, label under it. Bordered, on `--bg0`. | `.cst-cell` |

The contrast is the point — sequence is airy, parallelism is contained. If a
future change styles them alike, the diagrams stop saying anything.

### The five layouts, in this language

- **chain** — rows down the spine, 20px dashed segments between them.
- **branch** — spine rows, then a *fork bus* (horizontal dashed bar running
  from the spine at x=13 to the centre of the last lane column), lanes as
  centred columns hanging from it by stubs, then a *join bus*, then spine
  rows again. `--lanes` (set by the renderer) drives both the grid columns
  and the bus end-point: `right: calc(50% / var(--lanes))` lands the bar on
  the last column's centre.
- **fanin** — like branch lanes but sources only converge, so there is no
  fork bus above them (`.cst-lanes-in`), only the join underneath.
- **grid** — independent checks in an auto-fit grid over a full-width
  *collector bar*; deliberately no per-cell stubs, because no order is implied.
- **loop** — spine rows plus a dashed *return bracket* on the right
  (`.cst-back`), arrowhead where it rejoins the top, with the retry condition
  as a pill pinned to the bracket's vertical line (`.cst-back-label`). Loop
  steps get `padding-right` so text never enters the bracket zone.

### Narrow screens (≤560px)

Columns of centred cards get too thin, so parallel sections fold into a
**bracketed list off the spine**: the lanes container becomes a single column
with a dashed left border at the spine's x, each lane connected by a
horizontal stub, and cells switch to row orientation (chip left, label right,
kind hidden — the chip colour still carries it). Still visibly a fork; one
lane per row.

## 3. The animation grammar

Unchanged in spirit from the first version: nodes light **in turn**, so a
panel reads as a system working steadily, not a loading spinner.

- Every node carries `--i` (its position in the light-up order) and `--cycle`
  (full loop length, `total nodes × 1.05s + 4.5s`, computed per workflow so a
  three-step flow does not idle waiting for a nine-step one).
- Spine rows flash a soft gold background (`cst-row-lite`); chips get a gold
  ring (`cst-dot-lite`); cells flash border + lift (`cst-cell-lite`); segments
  run a travelling gold dot downward (`cst-travel`), offset +0.35s so the dot
  leaves a node just after it lights.
- Parallel lanes **share** indices — parallel means simultaneous. Fan-in
  sources are the exception: they light one after another (arrivals), then
  merge.
- `prefers-reduced-motion` kills all of it; the travelling dot parks at the
  segment's midpoint.

## 4. The kind vocabulary

Six node kinds, one hue per role, applied to the chip via `[data-kind]`:
`trigger` (blue bolt) · `ai` (gold) · `action` (grey arrow) · `check`
(violet shield) · `human` (blue figure) · `output` (green check). These are
the semantic legend of every diagram; do not add a kind without a colour and
an icon in `KIND_ICON`.

## 5. Adding or editing a workflow

Shapes live in `assets/js/cst-data.js` as data — no renderer changes needed.
Pick the layout that matches the real topology (`chain`, `branch`, `loop`,
`fanin`, `grid`); the file header documents each field. Then bump the `?v=`
query on **all three** constellation assets in `capabilities/index.html` —
they version together.

Rules that outrank aesthetics, restated from the data file:

1. Workflows are **illustrative** — the shape of automation in an area, not a
   claim that KAI247 runs that pipeline for a customer today. The badge above
   the diagrams says so. Never drop it.
2. Do not add a workflow describing something the network cannot build.
   (The Education "Lesson to every SWAN board" loop, added with this
   redesign, is grounded in the SWAN interactive-board capability the page
   already claims.)

## 6. Deep links

`/capabilities/#<family-id>` opens that constellation on load, and — since
this redesign — also via `hashchange`, so in-page links to `#education` work
without a reload. `select()`/`deselect()` write the hash with
`replaceState`, which does not fire `hashchange`, so there is no re-entry
loop.

## 7. How this was verified

No-JS fallback (the `<noscript>` card grid) is untouched. The rendered page
was checked at 1280×800 and 375×812: all eight constellations open with zero
horizontal overflow, branch lanes measure as equal-width columns
(desktop) / stacked bracketed rows (mobile), the loop label never overlaps
step text, and the console is clean. The old failure — a chain card
wrapping to a second line — is structurally impossible in a vertical flow.
