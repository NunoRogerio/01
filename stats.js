/* Statistics (Oct 5): the main screen's dashboard. A round button on the map's controls opens it: a panel rises over the map and
   hides the incident blade (the top blade stays, for the region). Cards with simulated numbers for the selected region and period:
   charts chosen for what they say, in the mini KPIs' mood (lime, greys). Press and hold a card to reorder; the + tile shows or
   hides charts; the X closes. Everything here is simulated and says so ("* Simulation"). */
(function () {
  if (window.__wfStats) return;
  var LS = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  var K_ORDER = 'wf-stats-order', K_HIDE = 'wf-stats-hide', K_RANGE = 'wf-stats-range';
  var LIME = 'var(--wf-y,#E5FF00)', LIME_D = 'color-mix(in srgb,var(--wf-y,#E5FF00) 78%,#1C1C1E)', LIME_L = 'color-mix(in srgb,var(--wf-y,#E5FF00) 45%,#FFFFFF)',   // the primary colour chosen in preferences (and its darker and lighter steps)
      INK = '#3A3A3C', G1 = '#8E8E93', G2 = '#C7C7CC', TRACK = 'var(--wf-track,rgba(118,118,128,0.12))';
  var EASE = 'cubic-bezier(.2,.8,.2,1)';

  // ---- numbers (simulated, steady per area and period) ---------------------------------------------------------------
  function seedOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(s) { var a = seedOf(s); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var RANGES = [
    { id: 'm', label: '1 month', word: 'Last month', n: 30, step: 'day', mult: 1 },
    { id: 'h', label: '6 months', word: 'Last 6 months', n: 26, step: 'week', mult: 5.5 },
    { id: 'y', label: '1 year', word: 'Last year', n: 12, step: 'month', mult: 11 }
  ];
  var FIRES_PT = ['Serra da Estrela', 'Monchique', 'Arouca', 'Pampilhosa da Serra', 'Sertã', 'Oleiros', 'Mação', 'Odemira', 'Vila de Rei', 'Proença-a-Nova', 'Sever do Vouga', 'Ponte da Barca'];
  var FIRES = ['Maceira', 'Green Valley', 'Tujunga', 'Santa Clarita', 'Topanga', 'Eaton Canyon', 'Big Tujunga', 'Cajon Pass', 'Lytle Creek', 'Temescal Cyn', 'North ridge', 'Mt Wilson Rd'];
  var STATIONS_PT = ['Bombeiros Voluntários de Arouca', 'Bombeiros Sapadores do Porto', 'Bombeiros de Monchique', 'Bombeiros de Sertã', 'Bombeiros de Mação', 'Bombeiros de Odemira', 'Bombeiros de Seia', 'Bombeiros de Oleiros'];
  var STATIONS = ['LAFD Station 18', 'Station #73', 'LAFD Station 8', 'Texas Canyon FCS', 'LACoFD Station 157', 'Green Valley Station', 'San Francisquito Station', 'LAFD Station 91'];
  var STAGES = ['First alert', 'Ongoing', 'Crews on scene', 'Resolving', 'Concluding', 'Surveillance'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmt1(n) { return (Math.round(n * 10) / 10).toString(); }
  function pick(R, list, k) { var a = list.slice(), out = []; while (out.length < k && a.length) out.push(a.splice(Math.floor(R() * a.length), 1)[0]); return out; }
  function xLabels(rg) {
    var now = new Date(), d0 = new Date(now), first, last = 'Today';
    if (rg.step === 'day') { d0.setDate(d0.getDate() - (rg.n - 1)); first = d0.getDate() + ' ' + MON[d0.getMonth()]; }
    else if (rg.step === 'week') { d0.setDate(d0.getDate() - (rg.n - 1) * 7); first = d0.getDate() + ' ' + MON[d0.getMonth()]; }
    else { d0.setMonth(d0.getMonth() - (rg.n - 1)); first = MON[d0.getMonth()] + ' ' + String(d0.getFullYear()).slice(2); last = MON[now.getMonth()] + ' ' + String(now.getFullYear()).slice(2); }
    return [first, last];
  }
  // a label for each point of the period (tooltips): days, weeks or months, the last one now
  var PTS = [];
  function ptLabels(rg) {
    var now = new Date(), o = [];
    for (var i = 0; i < rg.n; i++) { var d = new Date(now), back = rg.n - 1 - i;
      if (rg.step === 'day') { d.setDate(d.getDate() - back); o.push(back ? d.getDate() + ' ' + MON[d.getMonth()] : 'Today'); }
      else if (rg.step === 'week') { d.setDate(d.getDate() - back * 7); o.push(back ? 'Week of ' + d.getDate() + ' ' + MON[d.getMonth()] : 'This week'); }
      else { d.setMonth(d.getMonth() - back); o.push(MON[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2)); } }
    return o;
  }
  // a tooltip target: data-tip "bold line|second line"; data-cx/data-cy anchor it (chart units) and data-dot marks a point on a line
  function tipA(t1, t2, cx, cy, dot) { return ' data-tip="' + esc(t1 + '|' + (t2 || '')) + '"' + (cx != null ? ' data-cx="' + cx.toFixed(1) + '" data-cy="' + cy.toFixed(1) + '"' : '') + (dot ? ' data-dot="1"' : ''); }
  function slots(n, h, f) {   // one invisible full-height slot per point, easy to tap; shaded while its tooltip shows
    var bot = h - 20, st = n > 1 ? W / (n - 1) : W, o = '';
    for (var i = 0; i < n; i++) { var x = n > 1 ? i * st : 0, a = Math.max(0, x - st / 2), b = Math.min(W, x + st / 2), q = f(i, x); o += '<rect class="tslot" x="' + a.toFixed(1) + '" y="0" width="' + (b - a).toFixed(1) + '" height="' + bot + '"' + q + '/>'; }
    return o;
  }
  function series(R, n, base, amp, trend) { var o = [], v; for (var i = 0; i < n; i++) { v = base * (1 + trend * (i / n - 0.5)) + (R() - 0.5) * amp * base; if (R() > 0.9) v *= 1.8; o.push(Math.max(0, v)); } return o; }
  function cum(a) { var s = 0; return a.map(function (v) { return (s += v); }); }
  function delta(R) { var d = Math.round((R() * 40 - 12)); return (d >= 0 ? 'Up ' : 'Down ') + Math.abs(d) + '% on the period before.'; }

  // ---- charts (SVG and bars, one look) ---------------------------------------------------------------------------------
  var W = 326;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function grid(h, pad, maxLbl) {
    var o = '';
    for (var i = 0; i < 3; i++) { var y = pad + (h - pad - 20) * i / 2; o += '<line x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="rgba(60,60,67,0.10)" stroke-width="1"' + (i < 2 ? ' stroke-dasharray="3 4"' : '') + '/>'; }
    return o + (maxLbl ? '<text x="0" y="11" style="fill:var(--wf-sec,#6E6E73)" font-size="13">' + esc(maxLbl) + '</text>' : '');
  }
  function xAxis(h, lbls) { return '<text x="0" y="' + (h - 2) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13">' + esc(lbls[0]) + '</text><text x="' + W + '" y="' + (h - 2) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13" text-anchor="end">' + esc(lbls[1]) + '</text>'; }
  function pathOf(vals, max, h, pad) { var bot = h - 20, top = pad + 14; return vals.map(function (v, i) { var x = vals.length > 1 ? i * W / (vals.length - 1) : 0, y = bot - (bot - top) * (v / (max || 1)); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' '); }
  var AG = 0;   // line charts: no fill under the line; each line casts a soft shadow in its own colour (the single line: the primary), centred on it (0 offset), 9px blur
  function lineShadow(p, h, id, col) {   // only under its line (clipped to the area below it), at most 80% strong, 7.2px blur
    var bot = h - 20;
    return '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-24" y="-24" width="' + (W + 48) + '" height="' + (h + 48) + '"><feGaussianBlur stdDeviation="7.2"/></filter><clipPath id="' + id + 'c"><path d="' + p + ' L' + W + ' ' + bot + ' L0 ' + bot + 'Z"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + 'c)" pointer-events="none" opacity="0.8"><path d="' + p + '" fill="none" style="stroke:' + (col || LIME) + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" filter="url(#' + id + ')"/></g>';
  }

  function area(vals, lbls, unit) {
    var h = 105, max = Math.min(unit === '%' ? 100 : 1e12, Math.max.apply(null, vals) * 1.05), p = pathOf(vals, max, h, 0), bot = h - 20;
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" width="100%" role="img" aria-label="' + esc(unit) + ' through time" style="display:block">' + grid(h, 0, fmt(max) + ' ' + unit) +
      lineShadow(p, h, 'wfag' + (++AG)) + slots(vals.length, h, function (i, x) { var y = bot - (bot - 14) * (vals[i] / (max || 1)); return tipA(unit === '%' ? Math.round(vals[i]) + '%' : fmt(vals[i]) + ' ' + unit, PTS[i] || '', x, y, true); }) + '<path d="' + p + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>' + xAxis(h, lbls) + '</svg>';
  }
  function lines(sets, lbls, unit) {
    var h = 105, max = 0; sets.forEach(function (s) { max = Math.max(max, Math.max.apply(null, s.v)); }); max *= 1.05;
    var cols = [INK, LIME_D, G1];
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" width="100%" role="img" aria-label="' + esc(unit) + ' through time" style="display:block">' + grid(h, 0, fmt(max) + ' ' + unit) +
      sets.map(function (s, i) { return lineShadow(pathOf(s.v, max, h, 0), h, 'wfls' + (++AG), cols[i]); }).join('') + slots(sets[0].v.length, h, function (i, x) { return tipA(PTS[i] || '', sets.map(function (s) { return s.n + ' ' + fmt(s.v[i]); }).join('. ') + '.', x, 14); }) + sets.map(function (s, i) { return '<path pointer-events="none" d="' + pathOf(s.v, max, h, 0) + '" fill="none" style="stroke:' + cols[i] + '" stroke-width="' + (i === 1 ? 3 : 2) + '" stroke-linejoin="round" stroke-linecap="round"' + (i === 2 ? ' stroke-dasharray="1 5"' : '') + '/>'; }).join('') + xAxis(h, lbls) + '</svg>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">' + sets.map(function (s, i) { return '<span style="display:inline-flex;align-items:center;gap:8px;font-size:16px;line-height:20px;color:#3A3A3C"><span aria-hidden="true" style="width:16px;height:3px;border-radius:2px;background:' + cols[i] + '"></span>' + esc(s.n) + '</span>'; }).join('') + '</div>';
  }
  function columns(vals, labels, hl, unit, tickLbls, tipLbls) {
    hl = vals.indexOf(Math.max.apply(null, vals));   // the biggest value is always the dark grey one, in every column chart
    var h = 105, max = Math.max.apply(null, vals) * 1.05, bot = h - 20, n = vals.length, gap = n > 14 ? 3 : 8, bw = (W - gap * (n - 1)) / n, o = '';
    vals.forEach(function (v, i) { var bh = Math.max(2, (bot - 16) * v / max), x = i * (bw + gap); var tl = (tipLbls && tipLbls[i]) || labels[i] || (vals.length === PTS.length ? PTS[i] : ''); o += '<rect class="tslot" x="' + (x - gap / 2).toFixed(1) + '" y="0" width="' + (bw + gap).toFixed(1) + '" height="' + bot + '"' + tipA(fmt(v) + ' ' + unit, tl, x + bw / 2, bot - bh) + '/>'; o += '<rect pointer-events="none" x="' + x.toFixed(1) + '" y="' + (bot - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="' + Math.min(4, bw / 2).toFixed(1) + '" style="fill:' + (i === hl ? INK : LIME) + '"/>'; });
    var lb = '';
    if (tickLbls) tickLbls.forEach(function (t) { var x = t[0] * (bw + gap) + bw / 2; lb += '<text x="' + x.toFixed(1) + '" y="' + (h - 2) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13" text-anchor="' + (t[0] === 0 ? 'start' : t[0] === n - 1 ? 'end' : 'middle') + '">' + esc(t[1]) + '</text>'; });
    else labels.forEach(function (t, i) { var x = i * (bw + gap) + bw / 2; lb += '<text x="' + x.toFixed(1) + '" y="' + (h - 2) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13" text-anchor="middle">' + esc(t) + '</text>'; });
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" width="100%" role="img" aria-label="' + esc(unit) + '" style="display:block">' + grid(h, 0, fmt(max) + ' ' + unit) + o + lb + '</svg>';
  }
  function hbars(items, max, best) {
    return '<div style="display:flex;flex-direction:column;gap:16px">' + items.map(function (it, i) {
      return '<div><div style="display:flex;justify-content:space-between;gap:16px;font-size:16px;line-height:20px;color:#3A3A3C"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' + (i === best ? 'font-weight:600' : '') + '">' + esc(it.l) + '</span><span style="flex-shrink:0;font-variant-numeric:tabular-nums">' + esc(it.t) + '</span></div>' +
        '<div aria-hidden="true" style="height:8px;margin-top:8px;border-radius:4px;background:' + TRACK + ';overflow:hidden"><div style="width:' + Math.max(2, 100 * it.v / max).toFixed(1) + '%;height:100%;border-radius:4px;background:' + INK + '"></div></div></div>';
    }).join('') + '</div>';
  }
  function donut(parts, abs) {
    var tot = parts.reduce(function (a, p) { return a + p.v; }, 0), r = 50, c = 2 * Math.PI * r, off = 0, cols = parts.some(function (p) { return p.c; }) ? parts.map(function (p) { return p.c; }) : [LIME, INK, G1, G2, '#E5E5EA'];
    var svg = '<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Detection sources" style="display:block;flex-shrink:0;transform:rotate(-90deg)"><circle cx="60" cy="60" r="' + r + '" fill="none" style="stroke:' + TRACK + '" stroke-width="8"/>' +
      parts.map(function (p, i) { var len = c * p.v / tot, o = '<circle class="tseg"' + tipA(p.n, Math.round(100 * p.v / tot) + '%' + (abs ? '. ' + fmt(p.v) : '') + '.') + ' cx="60" cy="60" r="' + r + '" fill="none" style="stroke:' + cols[i % cols.length] + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + Math.max(0.01, len - 12).toFixed(2) + ' ' + (c - Math.max(0.01, len - 12)).toFixed(2) + '" stroke-dashoffset="' + (-(off + 6)).toFixed(2) + '"/>'; off += len; return o; }).join('') + '</svg>';
    var leg = '<div style="display:flex;flex-direction:column;gap:8px;min-width:0;flex:1">' + parts.map(function (p, i) { return '<span style="display:flex;align-items:center;gap:8px;font-size:16px;line-height:20px;color:#3A3A3C"><span aria-hidden="true" style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:' + cols[i % cols.length] + ';' + (i === 4 ? 'box-shadow:inset 0 0 0 1px rgba(60,60,67,.2)' : '') + '"></span><span style="flex:1;min-width:0">' + esc(p.n) + '</span><span style="font-variant-numeric:tabular-nums">' + Math.round(100 * p.v / tot) + '%</span>' + (abs ? '<span style="min-width:40px;text-align:right;font-variant-numeric:tabular-nums">' + fmt(p.v) + '</span>' : '') + '</span>'; }).join('') + '</div>';
    return '<div style="display:flex;align-items:center;gap:24px">' + svg + leg + '</div>';
  }


  // a heat map of the selected region: a grid of cells, darker where there is more (simulated, steady per area and period)
  var HEAT = ['rgba(118,118,128,0.12)', LIME_L, LIME, LIME_D, INK];
  // one horizontal stacked bar of two parts, each with its share and its number
  function stack(a, b) {
    var tot = a.v + b.v, pa = Math.round(100 * a.v / tot), pb = 100 - pa;
    var row = function (x, p, col, ring) { return '<div style="display:flex;align-items:center;gap:8px;font-size:16px;line-height:20px;color:#3A3A3C"><span aria-hidden="true" style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:' + col + '"></span><span style="flex:1;min-width:0">' + esc(x.n) + '</span><span style="font-variant-numeric:tabular-nums">' + p + '%</span><span style="min-width:56px;text-align:right;font-variant-numeric:tabular-nums">' + fmt(x.v) + '</span></div>'; };
    return '<div aria-hidden="true" style="display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden"><div style="width:' + pa + '%;border-radius:4px;background:' + LIME + '"></div><div style="flex:1;border-radius:4px;background:' + INK + '"></div></div>' +   // 8px like every bar chart; the shares are in the rows below
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">' + row(a, pa, LIME) + row(b, pb, INK) + '</div>';
  }


  // time of day against likelihood: the heat map's rounded squares and colours, sized and shaded by how many candidates fall in each slot
  function bubbles(R, X) {
    var cols = 12, rows = 5, pl = 36, pw = W - pl, cw = pw / cols, rh = 30, H = rows * rh + 24, v = [], mx = 0, i, j;
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) { var hr = i * 2 + 1, t = (0.25 + 1.0 * Math.exp(-Math.pow((hr - 15) / 4.5, 2))) * (0.35 + 0.65 * Math.exp(-Math.pow((j - 2.2) / 1.6, 2))) * (0.7 + R() * 0.6); v.push(t); mx = Math.max(mx, t); }
    var o = '', q = 0, best = 0, bi = 0, colSum = []; for (i = 0; i < cols; i++) colSum.push(0);
    for (j = rows - 1; j >= 0; j--) { o += '<line x1="' + pl + '" x2="' + W + '" y1="' + ((rows - 1 - j) * rh + rh / 2) + '" y2="' + ((rows - 1 - j) * rh + rh / 2) + '" stroke="rgba(60,60,67,0.10)" stroke-dasharray="3 4"/>'; }
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) { var f = v[q++] / mx; colSum[i] += f;
      var b = f < 0.15 ? 0 : f < 0.35 ? 1 : f < 0.6 ? 2 : f < 0.82 ? 3 : 4, sz = Math.max(8, 26 * Math.sqrt(f)), cx = pl + i * cw + cw / 2, cy = (rows - 1 - j) * rh + rh / 2;
      o += '<rect class="tsq"' + tipA((i * 2) + ':00 to ' + (i * 2 + 2) + ':00', (j * 20) + ' to ' + (j * 20 + 20) + '% likelihood. ' + ['Very few', 'Few', 'Some', 'Many', 'Most'][b] + ' candidates.', cx, cy - sz / 2) + ' x="' + (cx - sz / 2).toFixed(1) + '" y="' + (cy - sz / 2).toFixed(1) + '" width="' + sz.toFixed(1) + '" height="' + sz.toFixed(1) + '" rx="4" style="fill:' + HEAT[b] + '"/>';
      o += '<rect class="tslot"' + tipA((i * 2) + ':00 to ' + (i * 2 + 2) + ':00', (j * 20) + ' to ' + (j * 20 + 20) + '% likelihood. ' + ['Very few', 'Few', 'Some', 'Many', 'Most'][b] + ' candidates.', cx, cy - sz / 2) + ' x="' + (cx - cw / 2).toFixed(1) + '" y="' + (cy - rh / 2).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + rh + '" fill="#000" fill-opacity="0" data-sq="1"/>'; }
    colSum.forEach(function (c, k) { if (c > best) { best = c; bi = k; } });
    var ty = function (y, t) { return '<text x="0" y="' + (y + 4) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13">' + t + '</text>'; };
    var lbl = [[0, '0 h'], [3, '6 h'], [6, '12 h'], [9, '18 h'], [12, '24 h']].map(function (a) { return '<text x="' + (pl + a[0] * cw).toFixed(1) + '" y="' + (H - 2) + '" style="fill:var(--wf-sec,#6E6E73)" font-size="13" text-anchor="' + (a[0] === 0 ? 'start' : a[0] === 12 ? 'end' : 'middle') + '">' + a[1] + '</text>'; }).join('');
    var leg = '<div style="display:flex;align-items:center;gap:8px;margin-top:16px;font-size:13px;line-height:16px;color:#6E6E73"><span>Fewer</span>' + HEAT.map(function (f, k) { var z = [8, 13, 18, 22, 26][k]; return '<span aria-hidden="true" style="width:' + z + 'px;height:' + z + 'px;flex-shrink:0;border-radius:4px;background:' + f + '"></span>'; }).join('') + '<span>More</span></div>';
    return { peak: (bi * 2) + ':00 to ' + (bi * 2 + 2) + ':00', h: '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Candidates by time of day and likelihood" style="display:block">' + o + ty(rh / 2, '100%') + ty(rows * rh - rh / 2, '0%') + lbl + '</svg>' + leg };
  }

  // ---- the charts on offer -----------------------------------------------------------------------------------------------
  // each returns { v: big value, u: its unit, n: note under it, h: the chart's html }
  var DEFS = [
    { k: 'region', t: 'Ignition candidates and burned area', on: 1, f: function (R, rg, X) { var c = Math.round(R() * 20 + 150 * X.sc * rg.mult / 2), a = Math.round((R() * 0.2 + 0.9) * 1600 * X.sc * rg.mult * X.ak), h = regionHeat(rg, X); return { v: fmt(c), u: 'candidates', n: fmt(a) + ' ' + X.au + ' burned in ' + regionLabel() + '.', h: h || '<div style="font-size:16px;line-height:20px;color:#6E6E73">No outline for this area yet.</div>' }; } },
    { k: 'split', t: 'Candidates confirmed or dismissed', on: 1, top: 1, f: function (R, rg, X) { var tot = Math.round(140 * X.sc * rg.mult * (0.9 + R() * 0.2)), cf = Math.round(tot * (0.5 + R() * 0.2)); return { v: fmt(tot), u: 'candidates', n: '', h: stack({ n: 'Confirmed as fires', v: cf }, { n: 'Dismissed', v: tot - cf }) }; } },
    { k: 'burned', t: 'Burned area', on: 1, f: function (R, rg, X) { var s = series(R, rg.n, 260 * X.sc * rg.mult * X.ak / (rg.n / 12), 1.4, 0.3), c = cum(s); return { v: fmt(c[c.length - 1]), u: X.au, n: delta(R), h: area(c, X.x, X.au) }; } },
    { k: 'top5', t: 'Top 5 fires by area burned', on: 1, f: function (R, rg, X) { var names = pick(R, X.fires, 5), top = 900 * X.sc * rg.mult * X.ak, a = names.map(function (n, i) { return { l: n, a: top * Math.pow(0.66, i) * (0.9 + R() * 0.2) }; }); return { v: fmt(a.reduce(function (t, x) { return t + x.a; }, 0)), u: X.au, n: a[0].l + ' was the largest.', h: hbars(a.map(function (x) { return { l: x.l, v: x.a, t: fmt(x.a) + ' ' + X.au }; }), a[0].a, 0) }; } },
    { k: 'mitig', t: 'Fastest time to mitigation', on: 1, f: function (R, rg, X) { var names = pick(R, X.fires, 5), a = names.map(function (n, i) { return { l: n, a: 2 + i * 1.3 + R() * 1.2 }; }); return { v: fmt1(a[0].a), u: 'h', n: a[0].l + ' was the fastest.', h: hbars(a.map(function (x) { return { l: x.l, v: x.a, t: fmt1(x.a) + ' h' }; }), a[4].a * 1.1, 0) }; } },
    { k: 'evac', t: 'People evacuated', on: 1, f: function (R, rg, X) { var s = series(R, rg.n, 140 * X.sc * rg.mult / (rg.n / 12), 1.6, 0.2), tot = s.reduce(function (a, b) { return a + b; }, 0), hi = s.indexOf(Math.max.apply(null, s)); return { v: fmt(tot), u: 'people', n: delta(R), h: columns(s, [], hi, 'people', [[0, X.x[0]], [rg.n - 1, X.x[1]]]) }; } },
    { k: 'proj', t: 'Projection accuracy', on: 1, f: function (R, rg, X) { var names = pick(R, X.fires, 5), a = names.map(function (n) { return { l: n, a: 62 + R() * 34 }; }).sort(function (x, y) { return y.a - x.a; }), avg = a.reduce(function (s, x) { return s + x.a; }, 0) / a.length; return { v: Math.round(avg), u: '%', n: 'Against the real perimeter. 5 fires.', h: hbars(a.map(function (x) { return { l: x.l, v: x.a, t: Math.round(x.a) + '%' }; }), 100, 0) }; } },
    { k: 'size', t: 'Fires by size class', on: 1, f: function (R, rg, X) { var base = 40 * X.sc * rg.mult / 3, c = [base * 1.9, base * 2.6, base * 1.5, base * 0.7, base * 0.32, base * 0.13, base * 0.05].map(function (v) { return Math.max(1, Math.round(v * (0.85 + R() * 0.3))); }), tot = c.reduce(function (a, b) { return a + b; }, 0); return { v: fmt(tot), u: 'fires', n: (X.au === 'ha' ? 'A is under 0.1 ha. G is over 2,000 ha.' : 'A is under 0.25 ac. G is over 5,000 ac.'), h: columns(c, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], c.indexOf(Math.max.apply(null, c)), 'fires', null, ['Class A', 'Class B', 'Class C', 'Class D', 'Class E', 'Class F', 'Class G']) }; } },
    { k: 'stage', t: 'Time spent in each stage', on: 1, f: function (R, rg, X) { var a = [1.5, 5.5, 9, 6, 7, 18].map(function (v) { return v * (0.8 + R() * 0.4); }), tot = a.reduce(function (s, v) { return s + v; }, 0); return { v: fmt(tot), u: 'h per fire', n: 'First alert to closed.', h: hbars(a.map(function (v, i) { return { l: STAGES[i], v: v, t: fmt1(v) + ' h' }; }), Math.max.apply(null, a), a.indexOf(Math.max.apply(null, a))) }; } },
    { k: 'res', t: 'Resources in use', on: 1, f: function (R, rg, X) { var cr = series(R, rg.n, 36 * X.sc, 0.7, 0.2).map(Math.round), ve = series(R, rg.n, 18 * X.sc, 0.7, 0.2).map(Math.round), ai = series(R, rg.n, 3 * X.sc, 1, 0).map(Math.round); return { v: fmt(Math.max.apply(null, cr)), u: 'crews at peak', n: delta(R), h: lines([{ n: 'Crews', v: cr }, { n: 'Vehicles', v: ve }, { n: 'Aircraft', v: ai }], X.x, '') }; } },
    { k: 'resp', t: 'Station speed of response', on: 1, f: function (R, rg, X) { var names = pick(R, X.sta, 5), a = names.map(function (n, i) { return { l: n, a: 5.5 + i * 1.7 + R() * 1.4 }; }); return { v: fmt1(a[2].a), u: 'min median', n: a[0].l + ' was the fastest.', h: hbars(a.map(function (x) { return { l: x.l, v: x.a, t: fmt1(x.a) + ' min' }; }), a[4].a * 1.1, 0) }; } },
    { k: 'src', t: 'Detection sources', on: 0, f: function (R) { var p = [['Satellite', 38], ['Cameras on the ground', 24], ['Drones', 14], ['Calls to 911', 14], ['Cars and phones', 10]].map(function (x) { return { n: x[0], v: x[1] * (0.8 + R() * 0.4) }; }); return { v: p.length, u: 'sources', n: 'Which saw each candidate first.', h: donut(p) }; } },
    { k: 'night', t: 'Night and day ignitions', on: 1, top: 1, f: function (R, rg, X) { var tot = Math.round(150 * X.sc * rg.mult * (0.9 + R() * 0.2)), ni = Math.round(tot * (0.24 + R() * 0.12)); return { v: fmt(tot), u: 'ignitions', n: '', h: donut([{ n: 'Night', v: ni, c: '#1C1C1E' }, { n: 'Day', v: tot - ni, c: LIME }], true) }; } },
    { k: 'tod', t: 'Time of day and likelihood', on: 1, top: 1, f: function (R, rg, X) { var b = bubbles(R, X); return { v: b.peak.split(' to ')[0], u: 'busiest slot', n: '', h: b.h }; } },
    { k: 'conf', t: 'Candidate conversion rate', on: 1, top: 1, f: function (R, rg, X) { var s = series(R, rg.n, 58, 0.18, 0.2).map(function (v) { return Math.min(96, v); }), avg = s.reduce(function (a, b) { return a + b; }, 0) / s.length; return { v: Math.round(avg), u: '%', n: delta(R), h: area(s, X.x, '%') }; } },
    { k: 'hour', t: 'Detections by hour of the day', on: 0, f: function (R) { var s = [], i, v; for (i = 0; i < 24; i++) { v = 6 + 12 * Math.exp(-Math.pow((i - 15) / 4.5, 2)) + R() * 3; if (i >= 21 || i < 6) v *= 0.7; s.push(v); } var pk = s.indexOf(Math.max.apply(null, s)); return { v: pk + ':00', u: 'busiest hour', n: 'Local time.', h: (function () { var h = columns(s, [], -1, 'detections', [[0, '0 h'], [6, '6 h'], [12, '12 h'], [18, '18 h'], [23, '23 h']], s.map(function (v, i) { return i + ':00 to ' + (i + 1) + ':00'; })); return h; })() }; } },
    { k: 'decl', t: 'Time to declare a fire', on: 0, f: function (R) { var c = [18, 34, 26, 14, 8].map(function (v) { return Math.round(v * (0.8 + R() * 0.4)); }), tot = c.reduce(function (a, b) { return a + b; }, 0); return { v: Math.round(100 * (c[0] + c[1]) / tot), u: '% within 30 min', n: '', h: columns(c, ['< 10 min', '10 to 30', '30 to 60', '1 to 2 h', '> 2 h'], 1, 'fires') }; } }
  ];
  var BYK = {}; DEFS.forEach(function (d) { BYK[d.k] = d; });

  // ---- state -----------------------------------------------------------------------------------------------------------
  var S = { lay: LS('wf-stats-lay') || { c: 1, b: 1 }, open: false, el: null, range: LS(K_RANGE) || 'm', order: null, hide: null, sheet: false, region: '' };
  function order() { var o = (LS(K_ORDER) || []).filter(function (k) { return BYK[k]; }); var tp = [], had = o.length > 0; DEFS.forEach(function (d) { if (o.indexOf(d.k) < 0) { if (d.top) tp.push(d.k); else o.push(d.k); } }); var L = tp.concat(o);
    if (!LS('wf-stats-v2')) { LS('wf-stats-v2', 1); var r = L.indexOf('region'); if (r >= 0) { L.splice(r, 1); L.splice(4, 0, 'region'); } if (had) LS(K_ORDER, L); }   /* (Oct 5) the region map goes to 5th place, once */
    return L; }
  function hidden() { var h = LS(K_HIDE); if (!h) { h = DEFS.filter(function (d) { return !d.on; }).map(function (d) { return d.k; }); } return h; }
  function regionName() { var h = document.querySelector('h1'); var t = h ? (h.textContent || '') : ''; t = t.replace(/^(Incidents in|Incidentes em)\s*/i, '').trim(); return t || 'this area'; }

  // ---- DOM -------------------------------------------------------------------------------------------------------------
  var css = document.createElement('style');
  css.textContent = 'html.wf-stats div:has(> section[data-swipe-key="li"]){visibility:hidden!important;pointer-events:none!important}' +
    '.wfs{position:absolute;z-index:1;display:flex;flex-direction:column;box-sizing:border-box;background:var(--wf-page,#F2F2F7);transform:translateY(105%);transition:transform .5s ' + EASE + ';visibility:hidden;touch-action:pan-y}' +
    '.wfs.on{transform:none;visibility:visible}.wfs.out{visibility:visible}.wfs.hide{visibility:hidden}' +
    '.wfs .sc{flex:1 1 auto;min-height:0;overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain;padding:8px 16px 0;-webkit-overflow-scrolling:touch}.wfs .sc::-webkit-scrollbar{display:none}' +
    '.wfs .cd{position:relative;background:var(--wf-surface,#FFFFFF);border-radius:16px;box-shadow:0 0 10px rgba(0,0,0,.08);padding:16px 16px 24px;margin-bottom:24px;transition:transform .25s ' + EASE + ',box-shadow .2s ease;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.wfs .cd.lift{z-index:3;box-shadow:0 0 24px rgba(0,0,0,.16);transition:box-shadow .2s ease}' +
    '.wfs .xb{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex-shrink:0;padding:0;border:0;border-radius:50%;background:var(--wf-track,rgba(118,118,128,.12));color:var(--wf-ink2,#3C3C43);cursor:pointer}' +
    '.wfs .xb svg{transition:transform .6s cubic-bezier(.25,.1,.25,1)}.wfs .xb.rot svg{transform:rotate(90deg)}' +
    '.wfs .add{display:flex;align-items:center;justify-content:center;width:56px;height:56px;padding:0;border:0;border-radius:8px;background:var(--wf-track,rgba(118,118,128,.12));color:var(--wf-ink2,#3C3C43);cursor:pointer}' +
    '.wfs .sh{position:absolute;left:0;right:0;bottom:0;z-index:6;max-height:78%;display:flex;flex-direction:column;box-sizing:border-box;border-radius:28px 28px 0 0;background:var(--wf-page,#F2F2F7);box-shadow:0 0 24px rgba(0,0,0,.16);transform:translateY(105%);transition:transform .45s ' + EASE + ';overflow:hidden}.wfs .sh.on{transform:none}' +
    '.wfs .scr{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .35s ease}.wfs .scr.on{opacity:1;pointer-events:auto}' +
    '.wfs .sw{position:relative;width:51px;height:31px;flex-shrink:0;border-radius:999px;border:1px solid rgba(60,60,67,.35);box-sizing:border-box;background:rgba(120,120,128,.24);transition:background .2s ease}.wfs .sw i{position:absolute;top:1px;left:1px;width:34px;height:27px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s ease}.wfs .sw.on{background:' + LIME + '}.wfs .sw.on i{transform:translateX(13px)}' +
        '.wfs .cd svg text{font-family:inherit}' +
    '.wfs .tslot{fill:#000;fill-opacity:0;cursor:pointer;transition:fill-opacity .2s ease}.wfs .tslot.on{fill:#767680;fill-opacity:.12}.wfs .tsq,.wfs .tseg{cursor:pointer}.wfs .tseg{transition:stroke-width .2s ease}.wfs .tseg.on{stroke-width:12}' +
    '.wfs .wfs-tip{position:absolute;z-index:7;display:flex;flex-direction:column;width:max-content;max-width:260px;padding:8px 16px;border-radius:12px;background:#3A3A3C;color:#FFFFFF;font-size:16px;line-height:20px;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .2s ease,transform .2s ease}.wfs .wfs-tip.on{opacity:1;transform:none}.wfs .wfs-tip b{font-weight:600}';
  document.head.appendChild(css);

  function host() { var tb = document.querySelector('[data-wf-topbg]'); if (!tb) return null; var blade = tb.parentElement, col = blade && blade.parentElement; return col && col.parentElement ? { tb: tb, col: col, par: col.parentElement } : null; }
  function place() {
    var H = host(); if (!H || !S.el) return;
    var cr = H.col.getBoundingClientRect(), br = H.tb.getBoundingClientRect(), k = cr.width / (H.col.offsetWidth || cr.width) || 1;
    var top = (br.bottom - cr.top) / k + H.col.offsetTop - 28;
    S.el.style.left = H.col.offsetLeft + 'px'; S.el.style.width = H.col.offsetWidth + 'px'; S.el.style.top = top + 'px'; S.el.style.bottom = '0px';
  }
  function build() {
    var H = host(); if (!H) return false;
    if (S.el && S.el.isConnected) return true;
    var el = document.createElement('section'); el.className = 'wfs'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Statistics'); el.setAttribute('data-wf-keepsp', '1');
    H.par.appendChild(el); S.el = el; place();
    if (window.ResizeObserver) { try { new ResizeObserver(place).observe(H.tb); } catch (e) {} }
    window.addEventListener('resize', place);
    try { var h1 = document.querySelector('h1'); if (h1 && window.MutationObserver) new MutationObserver(function () { if (S.open && regionName() !== S.region) render(true); }).observe(h1, { childList: true, characterData: true, subtree: true }); } catch (e) {}
    return true;
  }
  function chev() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'; }
  function cardHtml(d, rg, X) {
    var R = rng(S.region + '|' + rg.id + '|' + d.k), o = d.f(R, rg, X);
    return '<article class="cd" data-k="' + d.k + '" aria-label="' + esc(d.t) + '"><span aria-hidden="true" style="position:absolute;top:12px;right:16px;font-size:16px;line-height:20px;color:#6E6E73">*</span>' +
      '<div style="font-size:16px;font-weight:600;line-height:20px;color:#6E6E73;padding-right:24px">' + esc(d.t) + '</div>' +
      '<div style="display:flex;align-items:baseline;gap:8px;margin-top:4px"><span style="font-size:32px;line-height:40px;font-weight:700;letter-spacing:-.01em;color:#1C1C1E;font-variant-numeric:tabular-nums">' + esc(o.v) + '</span><span style="font-size:16px;line-height:20px;color:#6E6E73">' + esc(o.u) + '</span></div>' +
      (o.n ? '<div style="font-size:16px;line-height:20px;color:#6E6E73;margin-bottom:16px">' + esc(o.n) + '</div>' : '<div style="height:16px"></div>') + o.h + '</article>';
  }

  // the header: the selected region's shape in light grey with two blurred heat layers on it (simulated):
  // lime where ignition candidates appear, dark grey where the burned area is
  // Outlines the map does not draw: the map's own shapes cover the western United States only, other countries have just a box,
  // drawn as a plain rectangle (never an oval: a round shape reads as a made-up region).
  // Mainland Portugal, simplified (lat, lon), drawn clockwise from the Minho mouth.
  // Lower 48 United States, simplified (lat, lon), clockwise from Cape Flattery.
  var OUT = { US: [[48.38, -124.72], [49.0, -123.0], [49.0, -95.15], [48.0, -89.6], [46.5, -84.5], [45.9, -83.5], [43.0, -82.4], [42.0, -83.1], [41.7, -83.5], [42.5, -79.8], [43.3, -79.0], [43.6, -76.3], [45.0, -74.7], [45.0, -71.5], [45.3, -71.1], [47.4, -69.2], [47.1, -67.8], [45.2, -67.4], [44.8, -66.95], [43.6, -70.2], [42.6, -70.6], [41.7, -70.0], [41.3, -71.9], [40.6, -74.0], [39.0, -74.8], [38.0, -75.2], [36.9, -76.0], [35.2, -75.5], [34.7, -76.7], [33.9, -78.0], [32.0, -80.9], [30.4, -81.4], [28.4, -80.6], [26.7, -80.0], [25.2, -80.4], [25.1, -81.1], [26.6, -82.1], [27.9, -82.8], [29.1, -83.0], [30.1, -84.0], [29.7, -85.3], [30.4, -86.5], [30.3, -88.0], [30.4, -89.4], [29.0, -89.2], [29.5, -91.0], [29.7, -93.8], [28.7, -95.6], [27.6, -97.2], [26.0, -97.2], [26.4, -98.7], [27.5, -99.5], [29.4, -101.0], [29.8, -102.4], [29.0, -103.2], [30.6, -104.7], [31.8, -106.5], [31.8, -108.2], [31.3, -108.2], [31.3, -111.1], [32.5, -114.8], [32.7, -117.1], [34.0, -118.5], [34.4, -120.5], [36.3, -121.9], [37.8, -122.5], [40.4, -124.4], [42.0, -124.2], [46.2, -124.0]], PT: [[41.87, -8.87], [42.03, -8.64], [42.15, -8.2], [41.95, -7.45], [41.85, -6.75], [41.98, -6.2], [41.5, -6.27], [41.15, -6.9], [40.85, -6.85], [40.5, -6.95], [40.25, -7.0], [39.9, -7.05], [39.6, -7.35], [39.4, -7.35], [38.88, -7.17], [38.5, -7.1], [38.2, -7.3], [37.95, -7.45], [37.5, -7.5], [37.17, -7.4], [37.02, -7.8], [37.05, -8.6], [37.02, -8.99], [37.5, -8.8], [37.95, -8.87], [38.2, -8.8], [38.52, -8.9], [38.45, -9.2], [38.7, -9.5], [38.78, -9.5], [39.35, -9.4], [39.6, -9.08], [40.15, -8.87], [40.64, -8.75], [41.15, -8.68], [41.7, -8.85]] };
  function outline(st) {
    var L = OUT[st]; if (!L) return null; var k = Math.cos(39.5 * Math.PI / 180), pts = L.map(function (q) { return [q[1] * k * 100, -q[0] * 100]; }), a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    pts.forEach(function (q) { a = Math.min(a, q[0]); b = Math.min(b, q[1]); c = Math.max(c, q[0]); d = Math.max(d, q[1]); });
    return { pts: pts, box: [a, b, c, d], d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z' };
  }
  function regionLabel() { var G = window.__wfGeo, sc = null; try { sc = JSON.parse(sessionStorage.getItem('wf-scope') || 'null'); } catch (e) {} sc = (sc && sc.st) ? sc : (window.__wfMem || {}).scope || null; var role = ''; try { role = localStorage.getItem('wf-role') || ''; } catch (e) {} var lk = ({ pt: 'PT', ca: 'CA', nv: 'NV', amz: 'AMZ' })[role] || null; var st = lk || (sc && sc.st) || 'CA'; return (G && G.states && G.states[st] && G.states[st].label) || S.region; }
  function regionHeat(rg, X) {
    var G = window.__wfGeo, sc = null, role = ''; try { role = localStorage.getItem('wf-role') || ''; } catch (e) {} try { sc = JSON.parse(sessionStorage.getItem('wf-scope') || 'null'); } catch (e) {}
    sc = sc || (window.__wfMem || {}).scope || null; var lk = ({ pt: 'PT', ca: 'CA', nv: 'NV', amz: 'AMZ' })[role] || null; if (lk && (!sc || sc.st !== lk)) sc = lk === 'CA' ? { st: 'CA', co: 'Los Angeles' } : { st: lk, co: null }; sc = sc && sc.st ? sc : { st: 'CA', co: 'Los Angeles' };
    var g = G && sc && G.states && G.states[sc.st];   /* the whole state or country, whichever county or district is picked */
    if (sc && !(g && g.d)) { var og = outline(sc.st); if (og) g = og; }   /* no outline drawn by the map: use ours */ if (!g || !g.box) return '';
    var b = g.box, bw = Math.max(1, b[2] - b[0]), bh = Math.max(1, b[3] - b[1]), pad = Math.max(bw, bh) * 0.06, vw = bw + 2 * pad, vh = bh + 2 * pad, vx = b[0] - pad, vy = b[1] - pad;
    var pts = g.pts, ins = function (x, y) { if (!pts) return true; var c = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { if ((pts[i][1] > y) !== (pts[j][1] > y) && x < (pts[j][0] - pts[i][0]) * (y - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c; } return c; };
    var R = rng(S.region + '|' + rg.id + '|heat'), mxd = Math.max(bw, bh), spots = function (nc, per, r0, r1, wt, spread) { var o = [], t = 0, c = 0; while (c < nc && t++ < 4000) { var x = b[0] + R() * bw, y = b[1] + R() * bh; if (!ins(x, y)) continue; c++;
        for (var k = 0; k < per; k++) { var a = R() * 6.283, d = R() * R() * mxd * spread, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (ins(px, py)) o.push([px, py, mxd * (r0 + R() * (r1 - r0)), wt * (0.4 + R() * 0.6)]); } } return o; };
    var hotC = spots(10, 26, 0.005, 0.016, 0.7, 0.1), hotB = spots(6, 20, 0.0065, 0.018, 0.65, 0.08), cl = 'wfhc' + (seedOf(S.region) % 9999), blur = mxd * 0.0065, hh = Math.min(300, Math.round(326 * vh / vw));
    var blobs = function (a, col) { return a.map(function (q) { return '<circle cx="' + q[0].toFixed(0) + '" cy="' + q[1].toFixed(0) + '" r="' + q[2].toFixed(0) + '" style="fill:' + col + '" fill-opacity="' + q[3].toFixed(2) + '"/>'; }).join(''); };
    var shape = g.d ? '<path d="' + g.d + '"/>' : '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + bw + '" height="' + bh + '"/>';
    var svg = '<svg viewBox="' + vx.toFixed(0) + ' ' + vy.toFixed(0) + ' ' + vw.toFixed(0) + ' ' + vh.toFixed(0) + '" width="100%" height="' + hh + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ignition candidates and burned area across ' + esc(regionLabel()) + '" style="display:block">' +
      '<defs><clipPath id="' + cl + '">' + shape + '</clipPath><filter id="' + cl + 'b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="' + blur.toFixed(0) + '"/></filter></defs>' +
      '<g fill="#DADADF" stroke="#C7C7CC" stroke-width="' + (Math.max(bw, bh) / 400).toFixed(1) + '" stroke-linejoin="round">' + shape + '</g>' +
      '<g clip-path="url(#' + cl + ')"><g filter="url(#' + cl + 'b)">' + (S.lay.b ? blobs(hotB, '#1C1C1E') : '') + (S.lay.c ? blobs(hotC, LIME) : '') + '</g></g></svg>';
    var key = function (k, c, t) { var on = S.lay[k]; return '<button type="button" data-lg="' + k + '" aria-pressed="' + (!!on) + '" style="display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 16px 0 12px;border:0;border-radius:999px;background:rgba(118,118,128,.12);font:inherit;font-size:16px;line-height:20px;color:' + (on ? '#3A3A3C' : '#8E8E93') + ';cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:50%;box-sizing:border-box;background:' + (on ? c : 'transparent') + ';border:' + (on ? '0' : '1.5px solid #8E8E93') + '"></span>' + t + '</button>'; };
    return svg + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + key('c', LIME, 'Ignition candidates') + key('b', '#1C1C1E', 'Burned area') + '</div>';
  }
  function ctxX(rg) { PTS = ptLabels(rg); var ptq = /portugal/i.test(regionLabel()); return { x: xLabels(rg), sc: 0.55 + (seedOf(S.region) % 100) / 100, ak: ptq ? 0.4047 : 1, au: ptq ? 'ha' : 'ac', fires: ptq ? FIRES_PT : FIRES, sta: ptq ? STATIONS_PT : STATIONS }; }
  function render(keepScroll) {
    if (!S.el) return;
    S.region = regionName();
    var rg = RANGES.filter(function (r) { return r.id === S.range; })[0] || RANGES[0], ri = RANGES.indexOf(rg);
    var X = ctxX(rg);
    var hid = hidden(), keys = order().filter(function (k) { return hid.indexOf(k) < 0; });
    var prev = S.el.querySelector('.sc'), st = prev && keepScroll ? prev.scrollTop : 0;
    S.el.innerHTML =
      '<div style="flex-shrink:0;padding:44px 16px 16px;display:flex;flex-direction:column;gap:16px">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px"><div style="display:flex;flex-direction:column;gap:4px;min-width:0"><h2 style="margin:0;font-size:17px;font-weight:700;line-height:22px;color:#000">Statistics</h2><span data-sub="1" style="font-size:17px;line-height:22px;color:#000">' + esc(S.region) + '. ' + esc(rg.word) + '.</span></div>' +
        '<button type="button" class="xb" data-act="close" aria-label="Close">' + chev() + '</button></div>' +
        '<div class="wf-seg" role="tablist" aria-label="Period"><span class="segthumb" aria-hidden="true" style="width:calc((100% - 16px) / 3);transform:translateX(' + (ri * 100) + '%)"><span class="segblob"></span></span>' + RANGES.map(function (r) { return '<button type="button" role="tab" class="segopt" data-r="' + r.id + '" aria-selected="' + (r.id === S.range) + '" style="font-size:17px"><span style="display:inline-grid"><span style="grid-area:1/1">' + r.label + '</span><span aria-hidden="true" style="grid-area:1/1;visibility:hidden;font-weight:600">' + r.label + '</span></span></button>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="sc"><div data-list="1">' + keys.map(function (k) { return cardHtml(BYK[k], rg, X); }).join('') + '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin:8px 0 0"><button type="button" class="add" data-act="add" aria-label="Add or remove charts"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><span style="font-size:16px;line-height:20px;color:#6E6E73;text-align:right">* Simulation</span></div>' +
        '<div aria-hidden="true" style="height:104px"></div></div>' +
      '<div class="scr" data-act="shut"></div><div class="sh" role="dialog" aria-label="Charts" aria-hidden="true"></div>';
    var sc = S.el.querySelector('.sc'); if (sc) sc.scrollTop = st;
    wire();
  }
  function sheetHtml() {
    var hid = hidden(), ks = order();
    return '<div class="wf-stripes" aria-hidden="true" style="flex-shrink:0;position:relative;height:8px"></div>' +
      '<div role="button" tabindex="0" aria-label="Close" data-act="shut" style="flex-shrink:0;display:flex;justify-content:center;padding:8px 0 16px;cursor:pointer"><span style="width: 86px; height: 3px; border-radius: 999px; background: rgba(60,60,67,.2)"></span></div>' +
      '<div style="flex-shrink:0;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:0 16px 24px"><div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:26px;font-weight:600;letter-spacing:-.01em;line-height:32px;color:#000">Charts</h2><span style="font-size:17px;line-height:22px;color:#000">Show or hide charts.</span><span style="font-size:17px;line-height:22px;color:#000">Drag to reorder.</span></div>' +
      '<span style="display:flex;align-items:center;gap:8px;flex-shrink:0"><button type="button" data-act="reset" class="wf-reset wf-rpill" aria-disabled="' + (LS(K_ORDER) || LS(K_HIDE) || (LS('wf-stats-lay') && (!S.lay.c || !S.lay.b)) ? 'false' : 'true') + '" style="height:32px;padding:0 16px;border:0;border-radius:999px;background:rgba(118,118,128,.12);color:#3A3A3C;font:inherit;font-size:16px;font-weight:600;cursor:pointer">Reset</button><button type="button" class="xb" data-act="shut" aria-label="Done" style="margin-top:-6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform:none"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></span></div>' +
      '<div style="flex:1 1 auto;min-height:0;overflow-y:auto;scrollbar-width:none;padding:0 16px 56px"><div style="background:#FFFFFF;border-radius:16px;padding:8px 16px;box-shadow:0 0 10px rgba(0,0,0,.08)">' +
      ks.map(function (k) { var on = hid.indexOf(k) < 0; return '<div role="switch" tabindex="0" aria-checked="' + on + '" data-tg="' + k + '" style="position:relative;display:flex;align-items:center;gap:8px;height:60px;box-sizing:border-box;cursor:pointer"><span class="gp" data-gp="' + k + '" aria-label="Drag to reorder" style="display:flex;align-items:center;justify-content:center;width:32px;height:44px;margin-left:-8px;flex-shrink:0;color:#8E8E93;touch-action:none;cursor:grab"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/><circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/><circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/></svg></span><span style="flex:1 1 auto;min-width:0;font-size:17px;line-height:22px;color:#000">' + esc(BYK[k].t) + '</span><span class="sw' + (on ? ' on' : '') + '"><i></i></span></div>'; }).join('') + '</div></div>';
  }
  function showSheet(on) {
    S.sheet = on; var sh = S.el.querySelector('.sh'), sc = S.el.querySelector('.scr'); if (!sh) return;
    if (on) sh.innerHTML = sheetHtml(); norm(sh);
    sh.classList.toggle('on', on); sc.classList.toggle('on', on); sh.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) wireSheet();
  }
  function wireSheet() {
    var sh = S.el.querySelector('.sh');
    Array.prototype.forEach.call(sh.querySelectorAll('[data-act=shut]'), function (b) { b.onclick = function () { buzz(8); showSheet(false); render(true); }; });
    sh.querySelector('[data-act=reset]').onclick = function () { LS(K_ORDER, null); LS(K_HIDE, null); S.lay = { c: 1, b: 1 }; try { localStorage.removeItem('wf-stats-lay'); } catch (e) {} try { localStorage.removeItem(K_ORDER); localStorage.removeItem(K_HIDE); } catch (e) {} buzz(8); sh.innerHTML = sheetHtml(); norm(sh); wireSheet(); };
    gripWire(sh);
    Array.prototype.forEach.call(sh.querySelectorAll('[data-tg]'), function (r) {
      var go = function () { var k = r.getAttribute('data-tg'), h = hidden().slice(), i = h.indexOf(k), shown = order().filter(function (x) { return h.indexOf(x) < 0; });
        if (i < 0 && shown.length <= 1) return;   // the last chart stays
        if (i >= 0) h.splice(i, 1); else h.push(k); LS(K_HIDE, h); buzz(8); var y = sh.querySelector('div[style*="overflow-y"]').scrollTop; sh.innerHTML = sheetHtml(); norm(sh); wireSheet(); sh.querySelector('div[style*="overflow-y"]').scrollTop = y; };
      r.onclick = go; r.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
  }
  // the Charts list: drag a row by its handle (no hold needed) to put it in a new place
  function gripWire(sh) {
    var box = sh.querySelector('div[style*="overflow-y"]'), rows = function () { return Array.prototype.slice.call(sh.querySelectorAll('[data-tg]')); };
    Array.prototype.forEach.call(sh.querySelectorAll('[data-gp]'), function (g) {
      var d = null;
      g.onclick = function (e) { e.stopPropagation(); };
      g.onpointerdown = function (e) { e.preventDefault(); e.stopPropagation(); var R = rows(), r = g.parentNode; d = { r: r, i: R.indexOf(r), to: R.indexOf(r), y0: e.clientY, h: r.offsetHeight, n: R.length, s0: box.scrollTop };
        try { g.setPointerCapture(e.pointerId); } catch (x) {} r.style.zIndex = 3; r.style.background = '#FFFFFF'; r.style.boxShadow = '0 4px 20px rgba(0,0,0,.18)'; r.style.transition = 'box-shadow .2s ease'; buzz(12); };
      g.onpointermove = function (e) { if (!d) return; var dy = e.clientY - d.y0 + (box.scrollTop - d.s0), to = Math.max(0, Math.min(d.n - 1, Math.round(d.i + dy / d.h))); d.to = to;
        d.r.style.transform = 'translateY(' + dy.toFixed(1) + 'px)';
        rows().forEach(function (x, j) { if (x === d.r) return; var sft = 0; if (d.i < to && j > d.i && j <= to) sft = -d.h; else if (d.i > to && j < d.i && j >= to) sft = d.h; x.style.transition = 'transform .2s ease'; x.style.transform = sft ? 'translateY(' + sft + 'px)' : ''; });
        var br = box.getBoundingClientRect(); if (e.clientY > br.bottom - 40) box.scrollTop += 8; else if (e.clientY < br.top + 40) box.scrollTop -= 8; };
      var end = function () { if (!d) return; var dd = d; d = null; var ks = rows().map(function (x) { return x.getAttribute('data-tg'); }), k = ks.splice(dd.i, 1)[0]; ks.splice(dd.to, 0, k); LS(K_ORDER, ks); buzz(10);
        var y = box.scrollTop; sh.innerHTML = sheetHtml(); norm(sh); wireSheet(); sh.querySelector('div[style*="overflow-y"]').scrollTop = y; };
      g.onpointerup = end; g.onpointercancel = end;
    });
  }
  function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n); } catch (e) {} }
  function wire() {
    var el = S.el;
    el.querySelector('[data-act=close]').onclick = close;
    el.querySelector('[data-act=add]').onclick = function () { buzz(8); showSheet(true); };
    el.querySelector('[data-act=shut]').onclick = function () { showSheet(false); render(true); };
    Array.prototype.forEach.call(el.querySelectorAll('[data-r]'), function (b) { b.onclick = function () { var id = b.getAttribute('data-r'); if (id === S.range) return; S.range = id; LS(K_RANGE, S.range); buzz(8); period(); }; });
    cardsWire();
  }
  // a new period: the shared switcher glides in place (the prefs motion) and only the cards redraw, keeping the scroll
  function period() {
    var rg = RANGES.filter(function (r) { return r.id === S.range; })[0] || RANGES[0], ri = RANGES.indexOf(rg), X = ctxX(rg);
    var th = S.el.querySelector('.wf-seg .segthumb'); if (th) th.style.transform = 'translateX(' + (ri * 100) + '%)';
    Array.prototype.forEach.call(S.el.querySelectorAll('[data-r]'), function (x) { x.setAttribute('aria-selected', String(x.getAttribute('data-r') === S.range)); });
    var sub = S.el.querySelector('[data-sub]'); if (sub) sub.textContent = S.region + '. ' + rg.word + '.';
    var old = S.el.querySelector('[data-list]'), hid = hidden(), keys = order().filter(function (k) { return hid.indexOf(k) < 0; }), nw = document.createElement('div');
    nw.setAttribute('data-list', '1'); nw.innerHTML = keys.map(function (k) { return cardHtml(BYK[k], rg, X); }).join(''); old.parentNode.replaceChild(nw, old);
    cardsWire();
  }
  // chart tooltips (the chat photo tooltip's look): a tap on a mark shows its value, above it; a tap elsewhere, a scroll or a new period hides it
  var TIP = { el: null, on: null, dot: null };
  function tipHide() {
    if (TIP.on) TIP.on.forEach(function (x) { x.classList.remove('on'); }); TIP.on = null;
    if (TIP.dot) { TIP.dot.remove(); TIP.dot = null; }
    if (TIP.el) TIP.el.classList.remove('on');
  }
  function tipShow(t, e) {
    var host = S.el, svg = t.ownerSVGElement, hb = host.getBoundingClientRect(), ax, ay;
    if (TIP.on && TIP.on.indexOf(t) >= 0) { tipHide(); return; }
    tipHide();
    if (!TIP.el || !TIP.el.isConnected) { TIP.el = document.createElement('div'); TIP.el.className = 'wfs-tip'; TIP.el.setAttribute('role', 'tooltip'); TIP.el.setAttribute('aria-live', 'polite'); host.appendChild(TIP.el); }
    var parts = t.getAttribute('data-tip').split('|');
    TIP.el.innerHTML = '<b style="font-size:16px;line-height:20px">' + esc(parts[0]) + '</b>' + (parts[1] ? '<span style="font-size:16px;line-height:20px">' + esc(parts[1]) + '</span>' : ''); norm(TIP.el);
    if (svg && t.hasAttribute('data-cx')) { var pt = svg.createSVGPoint(), m = svg.getScreenCTM(); pt.x = +t.getAttribute('data-cx'); pt.y = +t.getAttribute('data-cy'); pt = pt.matrixTransform(m); ax = pt.x; ay = pt.y;
      if (t.hasAttribute('data-dot')) { var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', t.getAttribute('data-cx')); c.setAttribute('cy', t.getAttribute('data-cy')); c.setAttribute('r', '5'); c.setAttribute('fill', '#FFFFFF'); c.setAttribute('stroke', INK); c.setAttribute('stroke-width', '2'); c.setAttribute('pointer-events', 'none'); svg.appendChild(c); TIP.dot = c; } }
    else { var rb = t.getBoundingClientRect(); ax = e && e.clientX ? e.clientX : rb.left + rb.width / 2; ay = e && e.clientY ? e.clientY : rb.top; }
    var on = [t]; if (t.getAttribute('data-sq')) { var sq = t.previousElementSibling; if (sq && sq.classList.contains('tsq')) on.push(sq); }
    if (t.classList.contains('tseg') || t.classList.contains('tslot')) t.classList.add('on'); TIP.on = on;
    var tw = TIP.el.offsetWidth, th = TIP.el.offsetHeight, sc = host.querySelector('.sc'), sb = sc ? sc.getBoundingClientRect() : hb;
    var x = Math.max(16, Math.min(hb.width - 16 - tw, ax - hb.left - tw / 2)), y = ay - hb.top - th - 12;
    if (y < sb.top - hb.top + 8) y = ay - hb.top + 16;   // no room above: under the point
    TIP.el.style.left = x + 'px'; TIP.el.style.top = y + 'px';
    void TIP.el.offsetWidth; TIP.el.classList.add('on');
    try { if (window.__wfHaptic) window.__wfHaptic(); else buzz(8); } catch (x2) {}
  }
  function tipWire() {
    var sc = S.el.querySelector('.sc'); if (!sc || sc.__wfTip) return; sc.__wfTip = 1;
    sc.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-tip]'); if (t) { e.stopPropagation(); tipShow(t, e); } else tipHide(); });
    sc.addEventListener('scroll', tipHide, { passive: true });
    if (!S.el.__wfTip) { S.el.__wfTip = 1; S.el.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('[data-tip]'))) tipHide(); }); }
  }
  // Inline styles written here as plain text are rewritten in the browser's own form ("font-size: 16px", "rgb(…)"), the form the
  // preferences match, so the chosen palette, text size and spacing reach the statistics like every other screen
  function norm(root) { if (!root) return; var L = root.querySelectorAll ? root.querySelectorAll('[style]') : []; Array.prototype.forEach.call(L, function (el) { var t = el.style && el.style.cssText; if (t && t !== el.getAttribute('style')) el.setAttribute('style', t); }); if (root.getAttribute && root.getAttribute('style') && root.style.cssText) root.setAttribute('style', root.style.cssText); }
  function cardsWire() {
    norm(S.el); tipHide(); tipWire();
    Array.prototype.forEach.call(S.el.querySelectorAll('[data-lg]'), function (b) { b.onclick = function (e) { e.stopPropagation(); var k = b.getAttribute('data-lg'); S.lay[k] = S.lay[k] ? 0 : 1; LS('wf-stats-lay', S.lay); buzz(8); render(true); }; });
    dragWire();
  }
  // press and hold (250 ms) lifts a card; moving it up or down makes room; letting go keeps the new order
  function dragWire() {
    var list = S.el.querySelector('[data-list]'), d = null, timer = 0;
    var cards = function () { return Array.prototype.slice.call(list.querySelectorAll('.cd')); };
    var tm = function (e) { if (d && d.lifted) e.preventDefault(); };
    list.addEventListener('touchmove', tm, { passive: false });
    list.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    list.addEventListener('pointerdown', function (e) {
      var c = e.target.closest && e.target.closest('.cd'); if (!c || e.button > 0) return;
      d = { c: c, y0: e.clientY, id: e.pointerId, lifted: false };
      timer = setTimeout(function () { if (!d) return; d.lifted = true; var L = cards(); d.idx = L.indexOf(c); d.to = d.idx; d.tops = L.map(function (x) { var r = x.getBoundingClientRect(); return { t: r.top, h: r.height }; });
        c.classList.add('lift'); c.style.transition = 'box-shadow .2s ease'; c.style.transform = 'scale(1.02)'; try { c.setPointerCapture(d.id); } catch (x) {} buzz(12); }, 250);
    });
    list.addEventListener('pointermove', function (e) {
      if (!d) return; if (!d.lifted) { if (Math.abs(e.clientY - d.y0) > 8) { clearTimeout(timer); d = null; } return; }
      var dy = e.clientY - d.y0, L = cards(), me = d.tops[d.idx], mid = me.t + me.h / 2 + dy, to = d.idx;
      d.tops.forEach(function (t, j) { if (mid > t.t && mid < t.t + t.h) to = j; }); d.to = to;
      d.c.style.transform = 'translateY(' + dy.toFixed(1) + 'px) scale(1.02)';
      L.forEach(function (x, j) { if (j === d.idx) return; var shift = 0; if (d.idx < d.to && j > d.idx && j <= d.to) shift = -(me.h + 24); else if (d.idx > d.to && j < d.idx && j >= d.to) shift = me.h + 24; x.style.transform = shift ? 'translateY(' + shift + 'px)' : ''; });
    });
    var end = function () {
      clearTimeout(timer); if (!d) return; var dd = d; d = null; if (!dd.lifted) return;
      var ks = cards().map(function (x) { return x.getAttribute('data-k'); }), k = ks.splice(dd.idx, 1)[0]; ks.splice(dd.to, 0, k);
      var all = order().filter(function (x) { return ks.indexOf(x) < 0; }); LS(K_ORDER, ks.concat(all)); buzz(10);
      var sc = S.el.querySelector('.sc'); render(true);
    };
    list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
  }

  // Coming back to the app (Oct 5): iOS may reload a page it put to sleep; the panel remembers, for this session only, that it was open
  // and where it was scrolled, and comes back in place with no motion. Closing the app ends the session (fresh start on the main
  // screen); the reset link and the update check don't depend on it.
  var K_OPEN = 'wf-stats-open';
  function SS(v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(K_OPEN) || 'null'); if (v === null) sessionStorage.removeItem(K_OPEN); else sessionStorage.setItem(K_OPEN, JSON.stringify(v)); } catch (e) {} return null; }
  function keep() { if (!S.open || !S.el) return; var sc = S.el.querySelector('.sc'); SS({ y: sc ? sc.scrollTop : 0 }); }
  function open(back) {
    if (!build()) return false; place(); S.open = true; S.region = ''; render(false);
    document.documentElement.classList.add('wf-stats');
    var el = S.el; el.classList.remove('hide'); el.classList.remove('out');
    if (back) { el.style.transition = 'none'; el.classList.add('on'); void el.offsetWidth; el.style.transition = ''; var sc = el.querySelector('.sc'); if (sc && back.y) sc.scrollTop = back.y; }
    else { void el.offsetWidth; el.classList.add('on'); }
    var sc2 = el.querySelector('.sc'); if (sc2 && !sc2.__wfKeep) { sc2.__wfKeep = 1; var kt = 0; sc2.addEventListener('scroll', function () { clearTimeout(kt); kt = setTimeout(keep, 200); }, { passive: true }); }
    keep(); return true;
  }
  try { window.addEventListener('pagehide', keep); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') keep(); }); } catch (e) {}
  (function comeBack() { var st = SS(); if (!st) return; var n = 0; (function wait() { if (open(st)) return; if (++n < 50) setTimeout(wait, 100); else SS(null); })(); })();
  function close() {
    tipHide(); SS(null);
    if (!S.el) return; S.open = false; var x = S.el.querySelector('[data-act=close]'); if (x) x.classList.add('rot'); buzz(8);
    S.el.classList.add('out'); S.el.classList.remove('on'); var el = S.el;
    setTimeout(function () { if (!S.open) { document.documentElement.classList.remove('wf-stats'); el.classList.remove('out'); el.classList.add('hide'); } }, 520);
  }
  window.__wfStats = { open: open, close: close, active: function () { return S.open; } };
})();
