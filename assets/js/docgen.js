/* KAI247 — line-item document builder.
 *
 * Drives both the Quote & Estimate Generator and the Purchase Order
 * Generator. The two documents differ in wording, numbering and which date
 * field matters; the arithmetic and the printable layout are identical, so
 * they share this file rather than drifting apart in two copies.
 *
 * A page configures it with window.KAI_DOC = { kind: 'quote' | 'po' }.
 *
 * OUTPUT IS PRINT, NOT A PDF LIBRARY. The browser's own "Save as PDF" is a
 * real PDF writer that every visitor already has, and shipping a second one
 * to do the same job would cost a megabyte for nothing. A print stylesheet
 * gives a clean single-purpose page.
 */
(function () {
  'use strict';

  var CFG = {
    quote: {
      title: 'Quote', noun: 'quote', prefix: 'Q-',
      dateLabel: 'Valid until',
      partyFrom: 'From', partyTo: 'To (client)',
      termsDefault: 'Prices held until the date above. Work begins on written acceptance.',
      cta: 'Accept this quote'
    },
    po: {
      title: 'Purchase Order', noun: 'purchase order', prefix: 'PO-',
      dateLabel: 'Delivery by',
      partyFrom: 'Buyer', partyTo: 'Supplier',
      termsDefault: 'Reference this PO number on all invoices and delivery notes.',
      cta: 'Confirm receipt'
    },
    /* The third document in the chain. A quote is what you offer, a PO is
       what the buyer commits to, an invoice is what says it has been supplied
       and is now payable — same arithmetic, different wording and a due date
       that is a payment deadline rather than a validity window. */
    invoice: {
      title: 'Invoice', noun: 'invoice', prefix: 'INV-',
      dateLabel: 'Payment due',
      partyFrom: 'From', partyTo: 'Bill to',
      termsDefault: 'Payment due within 30 days. Please quote the invoice number with payment.',
      cta: 'Pay this invoice'
    }
  };

  var SYM = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: '$', AUD: '$', AED: 'AED ', SGD: '$' };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* Money is held in whole cents throughout. Doing the arithmetic in floats
     and rounding at the end is how a total ends up a penny out from the sum
     of its own lines, which is exactly the bug someone notices on an invoice. */
  function cents(v) { return Math.round((parseFloat(v) || 0) * 100); }
  function fromCents(c) { return c / 100; }

  function compute(rows, discountPct, taxPct) {
    var subtotal = 0;
    var lines = rows.map(function (r) {
      var qty = parseFloat(r.qty) || 0;
      var unit = cents(r.unit);
      var line = Math.round(qty * unit);
      subtotal += line;
      return { desc: r.desc, qty: qty, unit: unit, line: line };
    });
    var discount = Math.round(subtotal * (parseFloat(discountPct) || 0) / 100);
    var taxable = subtotal - discount;
    var tax = Math.round(taxable * (parseFloat(taxPct) || 0) / 100);
    return { lines: lines, subtotal: subtotal, discount: discount, taxable: taxable, tax: tax, total: taxable + tax };
  }

  function init() {
    var kind = (window.KAI_DOC && window.KAI_DOC.kind) || 'quote';
    var cfg = CFG[kind];

    var rowsEl = $('rows'), addBtn = $('addRow'), out = $('preview');
    var cur = $('cur'), disc = $('disc'), tax = $('tax');

    function money(c) {
      var s = SYM[cur.value] || '';
      var neg = c < 0;
      var v = Math.abs(fromCents(c)).toFixed(2);
      return (neg ? '-' : '') + s + v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function readRows() {
      return [].map.call(rowsEl.querySelectorAll('.dg-row'), function (r) {
        return {
          desc: r.querySelector('.dg-desc').value.trim(),
          qty: r.querySelector('.dg-qty').value,
          unit: r.querySelector('.dg-unit').value
        };
      }).filter(function (r) { return r.desc || parseFloat(r.qty) || parseFloat(r.unit); });
    }

    function addRow(desc, qty, unit) {
      var row = el('div', 'dg-row');
      row.innerHTML =
        '<input class="dg-desc" type="text" placeholder="Description" aria-label="Description">' +
        '<input class="dg-qty" type="number" step="any" min="0" value="1" aria-label="Quantity">' +
        '<input class="dg-unit" type="number" step="0.01" min="0" value="0" aria-label="Unit price">' +
        '<span class="dg-line" aria-live="off">—</span>' +
        '<button type="button" class="dg-del" aria-label="Remove line">×</button>';
      row.querySelector('.dg-desc').value = desc || '';
      if (qty != null) row.querySelector('.dg-qty').value = qty;
      if (unit != null) row.querySelector('.dg-unit').value = unit;
      row.querySelector('.dg-del').addEventListener('click', function () {
        row.remove();
        if (!rowsEl.querySelector('.dg-row')) addRow();
        render();
      });
      row.addEventListener('input', render);
      rowsEl.appendChild(row);
      return row;
    }

    function render() {
      var rows = readRows();
      var t = compute(rows, disc.value, tax.value);

      // Per-line totals back into the editor.
      var editorRows = rowsEl.querySelectorAll('.dg-row');
      var ri = 0;
      [].forEach.call(editorRows, function (r) {
        var d = r.querySelector('.dg-desc').value.trim();
        var q = r.querySelector('.dg-qty').value, u = r.querySelector('.dg-unit').value;
        if (!(d || parseFloat(q) || parseFloat(u))) { r.querySelector('.dg-line').textContent = '—'; return; }
        r.querySelector('.dg-line').textContent = money(t.lines[ri] ? t.lines[ri].line : 0);
        ri++;
      });

      out.textContent = '';

      var head = el('div', 'dg-doc-head');
      var left = el('div');
      left.appendChild(el('h3', 'dg-doc-title', cfg.title));
      left.appendChild(el('p', 'dg-doc-num', ($('num').value || (cfg.prefix + '0001'))));
      head.appendChild(left);
      var right = el('div', 'dg-doc-dates');
      right.appendChild(el('p', null, 'Issued ' + ($('issued').value || '—')));
      right.appendChild(el('p', null, cfg.dateLabel + ' ' + ($('due').value || '—')));
      head.appendChild(right);
      out.appendChild(head);

      var parties = el('div', 'dg-parties');
      [['from', cfg.partyFrom], ['to', cfg.partyTo]].forEach(function (p) {
        var box = el('div');
        box.appendChild(el('div', 'dg-party-label', p[1]));
        var v = $(p[0]).value.trim() || '—';
        v.split('\n').forEach(function (ln) { box.appendChild(el('p', null, ln)); });
        parties.appendChild(box);
      });
      out.appendChild(parties);

      var table = el('table', 'dg-table');
      var thead = el('thead');
      var trh = el('tr');
      ['Description', 'Qty', 'Unit', 'Amount'].forEach(function (h, i) {
        var th = el('th', i > 0 ? 'num' : null, h); trh.appendChild(th);
      });
      thead.appendChild(trh); table.appendChild(thead);
      var tbody = el('tbody');
      if (!t.lines.length) {
        var tr0 = el('tr');
        var td0 = el('td', null, 'No lines yet.');
        td0.colSpan = 4; tr0.appendChild(td0); tbody.appendChild(tr0);
      }
      t.lines.forEach(function (l) {
        var tr = el('tr');
        tr.appendChild(el('td', null, l.desc || '—'));
        tr.appendChild(el('td', 'num', String(l.qty)));
        tr.appendChild(el('td', 'num', money(l.unit)));
        tr.appendChild(el('td', 'num', money(l.line)));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      out.appendChild(table);

      var totals = el('div', 'dg-totals');
      function totalRow(label, value, strong) {
        var r = el('div', 'dg-total-row' + (strong ? ' is-grand' : ''));
        r.appendChild(el('span', null, label));
        r.appendChild(el('span', null, value));
        totals.appendChild(r);
      }
      totalRow('Subtotal', money(t.subtotal));
      if (t.discount) totalRow('Discount ' + (parseFloat(disc.value) || 0) + '%', '-' + money(t.discount));
      if (t.tax) totalRow('Tax ' + (parseFloat(tax.value) || 0) + '%', money(t.tax));
      totalRow('Total', money(t.total), true);
      out.appendChild(totals);

      var terms = $('terms').value.trim();
      if (terms) {
        var tw = el('div', 'dg-terms');
        tw.appendChild(el('div', 'dg-party-label', 'Terms'));
        terms.split('\n').forEach(function (ln) { tw.appendChild(el('p', null, ln)); });
        out.appendChild(tw);
      }

      $('sCount').textContent = String(t.lines.length);
      $('sSub').textContent = money(t.subtotal);
      $('sTotal').textContent = money(t.total);
    }

    /* ---- wire up ---- */
    $('docTitle').textContent = cfg.title;
    $('labFrom').textContent = cfg.partyFrom;
    $('labTo').textContent = cfg.partyTo;
    $('labDue').textContent = cfg.dateLabel;
    $('terms').value = cfg.termsDefault;
    $('num').value = cfg.prefix + '0001';
    var today = new Date();
    var iso = function (d) { return d.toISOString().slice(0, 10); };
    $('issued').value = iso(today);
    $('due').value = iso(new Date(today.getTime() + 30 * 86400000));

    addBtn.addEventListener('click', function () { addRow(); render(); });
    ['num', 'issued', 'due', 'from', 'to', 'terms'].forEach(function (id) {
      $(id).addEventListener('input', render);
    });
    [cur, disc, tax].forEach(function (e) { e.addEventListener('input', render); e.addEventListener('change', render); });

    $('print').addEventListener('click', function () { window.print(); });
    $('reset').addEventListener('click', function () {
      rowsEl.textContent = '';
      addRow('', 1, 0);
      render();
    });

    addRow(kind === 'po' ? 'Widget, 25mm, stainless' : 'Discovery and scoping', 1, kind === 'po' ? 4.5 : 1200);
    addRow(kind === 'po' ? 'Freight' : 'Implementation', kind === 'po' ? 1 : 8, kind === 'po' ? 120 : 95);
    render();

    // Exposed for the page's own tests.
    window.KAI_DOC_COMPUTE = compute;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
