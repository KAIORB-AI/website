/* KAI247 — Capabilities constellation.
 *
 * Eight capability families on an orbit around the core. Click one and a panel
 * opens underneath showing the agentic workflows that live in that
 * constellation, drawn n8n-style: a chain of nodes that lights up stage by
 * stage so you can watch the automation move.
 *
 * HONESTY
 * -------
 * The workflows are ILLUSTRATIVE. They show the shape of automation in each
 * area; they are not a claim that KAI247 runs these exact pipelines for you
 * today, and the panel says so in the badge above them. Do not quietly drop
 * that badge, and do not add a workflow describing something the network
 * cannot actually build.
 *
 * Build-free: vanilla ES2017 and SVG, no bundler, no dependency. Renders on
 * DOMContentLoaded and degrades to the plain card list already in the HTML if
 * JavaScript never runs.
 */
(function () {
  'use strict';

  /* Glyph paths, drawn in a 24×24 box. Stroke-only so they inherit colour. */
  var ICON = {
    ai:        'M12 3v3m0 12v3M3 12h3m12 0h3M6.3 6.3l2.1 2.1m7.2 7.2l2.1 2.1m0-11.4l-2.1 2.1M8.4 15.6l-2.1 2.1M12 9a3 3 0 100 6 3 3 0 000-6z',
    software:  'M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16',
    commerce:  'M4 6h16l-1.6 9H6.6zM6.6 15L5 6M9 20h.01M17 20h.01',
    growth:    'M4 19h16M6 16V9m5 7V5m5 11v-5',
    cloud:     'M7 18a4 4 0 010-8 5 5 0 019.6-1.3A3.5 3.5 0 0117 18z',
    education: 'M3 8l9-4 9 4-9 4zM7 11v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5',
    events:    'M4 8h16v12H4zM4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M9 3v3M15 3v3M8 13h3',
    data:      'M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zM4 6v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2'
  };

  var KIND_ICON = {
    trigger: 'M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z',
    ai:      'M12 3v3m0 12v3M3 12h3m12 0h3M12 9a3 3 0 100 6 3 3 0 000-6z',
    action:  'M4 12h11m0 0l-4-4m4 4l-4 4M18 5v14',
    check:   'M12 3l8 5v8l-8 5-8-5V8z',
    human:   'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
    output:  'M20 6L9 17l-5-5'
  };

  /* The eight constellations and their workflows live in cst-data.js, loaded
   * before this file. Kept apart so the shapes can be edited without
   * scrolling past the renderer. */
  var FAMILIES = window.KAI_CONSTELLATIONS || [];

  /* ------------------------------- helpers ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function iconSvg(path, size) {
    var s = svgEl('svg', { viewBox: '0 0 24 24', width: size || 24, height: size || 24, 'aria-hidden': 'true' });
    s.appendChild(svgEl('path', { d: path, fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    return s;
  }

  function pointOn(cx, cy, r, angleDeg) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  /* ------------------------------ the stage ----------------------------- */
  function buildStage(mount, onSelect) {
    // Bigger discs than the first pass, and a viewBox with room for labels
    // that sit BELOW them. They used to be drawn at cy+16, which is inside a
    // 38px disc, so every name overlapped its own circle.
    var W = 780, H = 780, CX = 390, CY = 390, R = 248;
    // Node radius is deliberately large against the orbit: in the two-column
    // layout the stage is only ~460px wide, so a disc sized for a full-width
    // wheel comes out tiny once the SVG scales down.
    var NODE_R = 68, RING_R = 81, LABEL_GAP = 18;

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H, class: 'cst-svg',
      role: 'group', 'aria-label': 'Eight capability constellations around the intelligence core'
    });

    var defs = svgEl('defs');
    var grad = svgEl('radialGradient', { id: 'cstCore', cx: '50%', cy: '50%', r: '50%' });
    [['0%', '#ffeec2'], ['60%', '#eebc61'], ['100%', '#b07d24']].forEach(function (s) {
      grad.appendChild(svgEl('stop', { offset: s[0], 'stop-color': s[1] }));
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Spokes first so nodes sit above them.
    var spokes = {};
    FAMILIES.forEach(function (f) {
      var p = pointOn(CX, CY, R, f.angle);
      var line = svgEl('line', { x1: CX, y1: CY, x2: p.x, y2: p.y, class: 'cst-spoke' });
      spokes[f.id] = line;
      svg.appendChild(line);
    });

    // Orbits.
    var rotor = svgEl('g', { class: 'cst-rotor', 'aria-hidden': 'true' });
    rotor.appendChild(svgEl('circle', { cx: CX, cy: CY, r: R + 26, class: 'cst-orbit dashed' }));
    svg.appendChild(rotor);
    svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: R, class: 'cst-orbit' }));
    svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 120, class: 'cst-orbit dashed' }));

    // Core.
    var core = svgEl('g', { 'aria-hidden': 'true' });
    core.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 74, fill: 'url(#cstCore)', class: 'cst-core-glow' }));
    core.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 84, fill: 'none', stroke: 'var(--gold)',
      'stroke-width': '1.4', 'stroke-dasharray': '3 6', opacity: '.7' }));
    var t1 = svgEl('text', { x: CX, y: CY + 1, class: 'cst-core-label', fill: '#14100a' });
    t1.textContent = 'BRAHMANDO';
    var t2 = svgEl('text', { x: CX, y: CY + 17, class: 'cst-core-sub', fill: '#2d2212' });
    t2.textContent = 'the intelligence core';
    core.appendChild(t1); core.appendChild(t2);
    svg.appendChild(core);

    // Nodes.
    var nodes = {};
    FAMILIES.forEach(function (f, i) {
      var p = pointOn(CX, CY, R, f.angle);
      var g = svgEl('g', {
        class: 'cst-node', tabindex: '0', role: 'tab',
        'aria-selected': 'false', 'aria-controls': 'cst-panel',
        'data-id': f.id
      });
      g.appendChild(svgEl('title', {})).textContent = f.name;
      g.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: RING_R, class: 'ring' }));
      g.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: NODE_R, class: 'disc' }));

      var ic = iconSvg(ICON[f.icon], 30);
      ic.setAttribute('x', p.x - 15);
      ic.setAttribute('y', p.y - 19);
      ic.querySelector('path').setAttribute('class', 'glyph');
      ic.querySelector('path').removeAttribute('stroke');
      g.appendChild(ic);

      // Two-line label under the disc.
      var words = f.name.split(' ');
      var l1 = words.slice(0, 1).join(' ');
      var l2 = words.slice(1).join(' ');
      var yBase = p.y + NODE_R + LABEL_GAP;
      [l1, l2].forEach(function (line, k) {
        if (!line) { return; }
        var t = svgEl('text', { x: p.x, y: yBase + k * 15, class: 'name' });
        t.textContent = line;
        g.appendChild(t);
      });

      g.addEventListener('click', function () { onSelect(f.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault(); focusNode(FAMILIES[(i + 1) % FAMILIES.length].id);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault(); focusNode(FAMILIES[(i - 1 + FAMILIES.length) % FAMILIES.length].id);
        }
      });

      nodes[f.id] = g;
      svg.appendChild(g);
    });

    function focusNode(id) { if (nodes[id]) { nodes[id].focus(); } }

    mount.appendChild(svg);
    return { nodes: nodes, spokes: spokes };
  }

  /* ------------------------------ the panel ----------------------------- */
  /* Flows read TOP TO BOTTOM. The panel is ~460px wide when it sits beside
   * the wheel, and the old left-to-right chains line-wrapped mid-arrow at that
   * width — a flow diagram that wraps looks broken. A vertical spine never
   * wraps at any width.
   *
   * Two vocabularies, on purpose:
   *   stepRow  — a row ON the spine: icon chip on the rail, label beside it.
   *              One-after-another work.
   *   cellCard — a centred mini-card used in parallel sections (lanes, fans,
   *              grids). Side-by-side work looks different from sequence.
   * `i` drives the light-up order; `cycle` is the full loop length. */
  function stepRow(kind, label, i, cycle) {
    var row = el('div', 'cst-step');
    row.setAttribute('data-kind', kind);
    row.style.setProperty('--i', i);
    row.style.setProperty('--cycle', cycle);
    var dot = el('span', 'cst-dot');
    dot.appendChild(iconSvg(KIND_ICON[kind] || KIND_ICON.action, 13));
    row.appendChild(dot);
    var text = el('div', 'cst-step-text');
    text.appendChild(el('span', 'cst-kind', kind));
    text.appendChild(el('div', 'cst-label', label));
    row.appendChild(text);
    return row;
  }

  function cellCard(kind, label, i, cycle) {
    var cell = el('div', 'cst-cell');
    cell.setAttribute('data-kind', kind);
    cell.style.setProperty('--i', i);
    cell.style.setProperty('--cycle', cycle);
    var dot = el('span', 'cst-dot');
    dot.appendChild(iconSvg(KIND_ICON[kind] || KIND_ICON.action, 13));
    cell.appendChild(dot);
    cell.appendChild(el('span', 'cst-kind', kind));
    cell.appendChild(el('div', 'cst-label', label));
    return cell;
  }

  /* A vertical connector segment with a dot that travels down it. */
  function seg(i, cycle, cls) {
    var s = el('span', 'cst-seg' + (cls ? ' ' + cls : ''));
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    s.style.setProperty('--cycle', cycle);
    return s;
  }

  /* A straight run of steps down the spine. Returns the column and the next
   * free index, so a layout keeps the animation in order across sections. */
  function runStack(steps, from, cycle) {
    var col = el('div', 'cst-stack');
    steps.forEach(function (s, k) {
      col.appendChild(stepRow(s[0], s[1], from + k, cycle));
      if (k < steps.length - 1) { col.appendChild(seg(from + k, cycle)); }
    });
    return { node: col, next: from + steps.length };
  }

  /* Parallel lanes: centred columns forked off the spine under a bus bar and
   * merged back under a second one. Lanes share animation indices, because
   * parallel means simultaneous. */
  function laneBlock(lanes, from, cycle) {
    var block = el('div', 'cst-lanes');
    block.style.setProperty('--lanes', lanes.length);
    var deepest = 0;
    lanes.forEach(function (lane) {
      var col = el('div', 'cst-lane');
      lane.forEach(function (s, k) {
        col.appendChild(cellCard(s[0], s[1], from + k, cycle));
        if (k < lane.length - 1) { col.appendChild(seg(from + k, cycle, 'cst-seg-lane')); }
      });
      block.appendChild(col);
      deepest = Math.max(deepest, lane.length);
    });
    return { node: block, next: from + deepest };
  }

  /* Total node count decides how long one cycle runs, so a three-step flow
   * does not sit idle waiting for a nine-step one to finish. */
  function countNodes(wf) {
    var n = 0;
    if (wf.steps) { n += wf.steps.length; }
    if (wf.pre) { n += wf.pre.length; }
    if (wf.post) { n += wf.post.length; }
    if (wf.tail) { n += wf.tail.length; }
    if (wf.sources) { n += wf.sources.length; }
    if (wf.tasks) { n += wf.tasks.length; }
    if (wf.lanes) { n += Math.max.apply(null, wf.lanes.map(function (l) { return l.length; })); }
    return n;
  }

  var LAYOUT_NOTE = {
    chain:  'Sequential',
    branch: 'Parallel branches',
    loop:   'Retries until it passes',
    fanin:  'Many sources, one pipeline',
    grid:   'Independent checks'
  };

  function renderWorkflow(wf) {
    var wrap = el('div', 'cst-wf');
    wrap.setAttribute('data-layout', wf.layout || 'chain');

    var total = countNodes(wf);
    var cycle = (total * 1.05 + 4.5).toFixed(2) + 's';

    var head = el('div', 'cst-wf-head');
    head.appendChild(el('h3', null, wf.name));
    var tags = el('div', 'cst-wf-tags');
    var trig = el('span', 'cst-wf-trigger');
    trig.appendChild(iconSvg(KIND_ICON.trigger, 10));
    trig.appendChild(document.createTextNode(wf.trigger));
    tags.appendChild(trig);
    tags.appendChild(el('span', 'cst-wf-shape', LAYOUT_NOTE[wf.layout] || 'Sequential'));
    head.appendChild(tags);
    wrap.appendChild(head);

    var body = el('div', 'cst-flow');
    var i = 0;

    if (wf.layout === 'branch') {
      var pre = runStack(wf.pre || [], i, cycle);
      body.appendChild(pre.node); i = pre.next;
      body.appendChild(seg(i - 1, cycle, 'cst-seg-junction'));
      var lanes = laneBlock(wf.lanes || [], i, cycle);
      body.appendChild(lanes.node); i = lanes.next;
      body.appendChild(seg(i - 1, cycle, 'cst-seg-junction'));
      var post = runStack(wf.post || [], i, cycle);
      body.appendChild(post.node);

    } else if (wf.layout === 'fanin') {
      // Sources are parallel feeds, but they light one after another —
      // arrivals, then the merge.
      var srcBlock = el('div', 'cst-lanes cst-lanes-in');
      srcBlock.style.setProperty('--lanes', (wf.sources || []).length);
      (wf.sources || []).forEach(function (s, k) {
        var col = el('div', 'cst-lane');
        col.appendChild(cellCard(s[0], s[1], k, cycle));
        srcBlock.appendChild(col);
      });
      body.appendChild(srcBlock);
      i = (wf.sources || []).length;
      body.appendChild(seg(i - 1, cycle, 'cst-seg-junction'));
      var main = runStack(wf.steps || [], i, cycle);
      body.appendChild(main.node);

    } else if (wf.layout === 'grid') {
      var grid = el('div', 'cst-grid');
      (wf.tasks || []).forEach(function (t, k) {
        grid.appendChild(cellCard(t[0], t[1], k, cycle));
      });
      body.appendChild(grid);
      i = (wf.tasks || []).length;
      body.appendChild(seg(i - 1, cycle, 'cst-seg-junction'));
      var gpost = runStack(wf.post || [], i, cycle);
      body.appendChild(gpost.node);

    } else if (wf.layout === 'loop') {
      var loopWrap = el('div', 'cst-loop');
      var main2 = runStack(wf.steps || [], i, cycle);
      loopWrap.appendChild(main2.node);
      i = main2.next;
      var back = el('div', 'cst-back');
      back.appendChild(el('span', 'cst-back-label', wf.back || 'Retry'));
      back.setAttribute('aria-label', 'Loops back: ' + (wf.back || 'retry'));
      loopWrap.appendChild(back);
      body.appendChild(loopWrap);
      body.appendChild(seg(i - 1, cycle, 'cst-seg-junction'));
      var tail = runStack(wf.tail || [], i, cycle);
      body.appendChild(tail.node);

    } else {
      body.appendChild(runStack(wf.steps || [], 0, cycle).node);
    }

    wrap.appendChild(body);
    return wrap;
  }

  function renderPanel(panel, family) {
    panel.textContent = '';

    var head = el('div', 'cst-panel-head');
    var mark = el('div', 'cst-panel-mark');
    mark.setAttribute('aria-hidden', 'true');
    mark.appendChild(iconSvg(ICON[family.icon], 20));
    head.appendChild(mark);

    var title = el('div', 'cst-panel-title');
    title.appendChild(el('h2', null, family.name));
    title.appendChild(el('p', null, family.blurb));
    head.appendChild(title);

    var close = el('button', 'cst-panel-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close ' + family.name);
    head.appendChild(close);
    panel.appendChild(head);

    var body = el('div', 'cst-panel-body');
    var badge = el('span', 'cst-illustrative');
    badge.appendChild(iconSvg('M12 9v4m0 3v.5M12 3l9 16H3z', 12));
    badge.appendChild(document.createTextNode('Illustrative workflows — the shape of automation here, not a live pipeline'));
    body.appendChild(badge);

    family.workflows.forEach(function (wf) { body.appendChild(renderWorkflow(wf)); });
    panel.appendChild(body);

    return close;
  }

  /* -------------------------------- boot -------------------------------- */
  function init() {
    var mount = document.getElementById('cst-stage');
    var panel = document.getElementById('cst-panel');
    var layout = document.getElementById('cst-layout');
    if (!mount || !panel) { return; }

    // The plain card list is the no-JS view; replace it now that JS is here.


    var selected = null;
    var stage;

    function select(id) {
      var family = FAMILIES.filter(function (f) { return f.id === id; })[0];
      if (!family) { return; }

      if (selected === id) { deselect(); return; }
      selected = id;

      Object.keys(stage.nodes).forEach(function (k) {
        stage.nodes[k].setAttribute('aria-selected', String(k === id));
        stage.spokes[k].classList.toggle('is-active', k === id);
      });

      var close = renderPanel(panel, family);
      panel.hidden = false;
      if (layout) { layout.classList.add('is-open'); }
      close.addEventListener('click', function () {
        deselect();
        if (stage.nodes[id]) { stage.nodes[id].focus(); }
      });

      if (location.hash !== '#' + id) {
        history.replaceState(null, '', '#' + id);
      }
      // Only chase the panel when it is stacked underneath; side by side it
      // is already in view and scrolling would be disorienting.
      if (!layout || !layout.classList.contains('is-open') ||
          window.matchMedia('(max-width: 1039px)').matches) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function deselect() {
      selected = null;
      panel.hidden = true;
      panel.textContent = '';
      if (layout) { layout.classList.remove('is-open'); }
      Object.keys(stage.nodes).forEach(function (k) {
        stage.nodes[k].setAttribute('aria-selected', 'false');
        stage.spokes[k].classList.remove('is-active');
      });
      history.replaceState(null, '', location.pathname);
    }

    stage = buildStage(mount, select);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && selected) { deselect(); }
    });

    // Deep link: /capabilities/#growth opens that constellation. The old page
    // used these same ids as anchors, so existing links keep working.
    function openFromHash() {
      var hash = (location.hash || '').replace('#', '');
      if (hash && FAMILIES.some(function (f) { return f.id === hash; })) {
        if (selected !== hash) { select(hash); }
      } else if (selected) {
        deselect();
      }
    }
    openFromHash();

    // A hash-only navigation does not reload the document, so a link to
    // /capabilities/#education clicked while already on the page must be
    // handled here. replaceState does not fire hashchange, so select() and
    // deselect() cannot re-enter this.
    window.addEventListener('hashchange', openFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
