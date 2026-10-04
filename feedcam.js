// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Helmet camera feed (Oct 3, 22:50): a live helmet camera from a firefighter, shown like the drone feed. It comes out of
// the button that opened it and grows to its place (358 x 202, rounded 16px, dark glass controls); it drags anywhere like the
// tour cards (a 6px slop, a throw keeps it gliding and slowing, a gentle bounce 8px from the edges, no magnet); maximize fills
// the screen; X folds it back into its button. One shared widget for the fire screen and the chats.
(function () {
  if (window.__wfCamFeed) return;
  var SRC = 'assets/helmetcam.mp4?v=1', EASE = 'cubic-bezier(.2,.8,.2,1)';
  var css = document.createElement('style');
  css.textContent =
    '.wf-cf{position:fixed;left:0;top:0;z-index:120;margin:0;overflow:hidden;border-radius:16px;background:#1C1C1E;color:#FFFFFF;box-shadow:0 0 28px rgba(0,0,0,.28);touch-action:none;cursor:grab;transform-origin:0 0;opacity:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif}' +
    '.wf-cf.max{border-radius:0;cursor:default}' +
    '.wf-cf video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.wf-cf .lb{position:absolute;left:16px;top:16px;display:flex;align-items:center;gap:8px;min-height:52px;font-size:15px;font-weight:600;line-height:20px;text-shadow:0 0 2px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.8),0 0 8px rgba(0,0,0,.7);pointer-events:none}' +
    '.wf-cf .lb i{width:6px;height:6px;border-radius:50%;background:#FF453A;flex-shrink:0}' +
    '.wf-cf .lb small{display:block;font-size:13px;font-weight:400;opacity:.9}' +
    '.wf-cf button{position:absolute;display:flex;align-items:center;justify-content:center;width:44px;height:44px;box-sizing:border-box;padding:0;border-radius:50%;background:rgba(0,0,0,.5);border:0;-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#FFFFFF;cursor:pointer}' +
    '.wf-cf .x{right:16px;top:16px}.wf-cf .mx{right:16px;bottom:16px}' +
    '.wf-cf .x svg{transition:transform .6s cubic-bezier(.25,.1,.25,1)}' +
    '.wf-cf .cam{position:absolute;left:16px;bottom:16px;width:200px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%)}.wf-cf.max .cam{bottom:calc(24px + env(safe-area-inset-bottom))}.wf-cf .cam button{position:relative;width:auto;height:auto;padding:0 4px;border-radius:999px;background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}.wf-cf.mini .lb,.wf-cf.mini .cam,.wf-cf.mini .mx,.wf-cf.mini .cross{display:none}.wf-cf.heat video{filter:url(#wf-thermal) contrast(1.15)}' +
    '.wf-cf.max .x{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .lb{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .mx{bottom:calc(24px + env(safe-area-inset-bottom))}';
  (document.head || document.documentElement).appendChild(css);
  // the heat camera: the feed in false colour (dark violet, red, orange, yellow, white from cold to hot)
  var heat = document.createElement('div'); heat.setAttribute('aria-hidden', 'true'); heat.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  heat.innerHTML = '<svg width="0" height="0"><filter id="wf-thermal" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.08 0.3 0.75 1 1 1"/><feFuncG type="table" tableValues="0 0 0.1 0.5 0.88 1"/><feFuncB type="table" tableValues="0.2 0.5 0.3 0 0.1 0.9"/></feComponentTransfer></filter></svg>';
  (document.body || document.documentElement).appendChild(heat);
  var feeds = [], GAP = 4, SWAP = 2340;   // several feeds can be open at once (drone, helmet); they never overlap
  var MAXI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"></path></svg>';
  var MINI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"></path></svg>';
  function size() { var w = Math.min(358, innerWidth - 32); return { w: w, h: Math.round(w * 202 / 358) }; }
  function dims(f) { var s = size(), k = f && f.st ? f.st.sc : 1; return { w: s.w * k, h: s.h * k }; }
  function boundsF(f, k) { var s = size(), kk = k == null ? (f && f.st ? f.st.sc : 1) : k; return { x0: 8, x1: innerWidth - s.w * kk - 8, y0: 8, y1: innerHeight - s.h * kk - 8 }; }
  function others(f) { return feeds.filter(function (g) { return g !== f && !g.el.classList.contains('max'); }); }
  function clampB(f, x, y, k) { var B = boundsF(f, k); return { x: Math.max(B.x0, Math.min(B.x1, x)), y: Math.max(B.y0, Math.min(B.y1, y)) }; }
  // does a w x h feed at (x, y) come within gap of feed g?
  function hits(x, y, w, h, g, gap) { var d = dims(g); return x < g.st.x + d.w + gap && g.st.x < x + w + gap && y < g.st.y + d.h + gap && g.st.y < y + h + gap; }
  // keeps a feed out of the others: pushed out along the shorter way, on the side it came from (it never tunnels through)
  function sep(f, x, y) { var d = dims(f), p = clampB(f, x, y), hx = 0, hy = 0;
    others(f).forEach(function (g) { var e = dims(g), gx = g.st.x, gy = g.st.y;
      var ovX = p.x < gx + e.w + GAP && gx < p.x + d.w + GAP, ovY = p.y < gy + e.h + GAP && gy < p.y + d.h + GAP;
      var leftSide = f.st.x + d.w / 2 < gx + e.w / 2, upSide = f.st.y + d.h / 2 < gy + e.h / 2;
      var cross = (ovY && (leftSide !== (p.x + d.w / 2 < gx + e.w / 2))) || (ovX && (upSide !== (p.y + d.h / 2 < gy + e.h / 2)));   // also when it jumped clean across
      if (!cross && !(ovX && ovY)) return;
      var px = leftSide ? p.x + d.w + GAP - gx : gx + e.w + GAP - p.x, py = upSide ? p.y + d.h + GAP - gy : gy + e.h + GAP - p.y;
      var ax = { x: leftSide ? gx - d.w - GAP : gx + e.w + GAP, y: p.y, h: 'x' }, ay = { x: p.x, y: upSide ? gy - d.h - GAP : gy + e.h + GAP, h: 'y' };
      var order = px < py ? [ax, ay] : [ay, ax], done = false;
      order.forEach(function (c) { if (done) return; var q = clampB(f, c.x, c.y); if (!hits(q.x, q.y, d.w, d.h, g, GAP - 0.5)) { p = q; done = true; if (c.h === 'x') hx = 1; else hy = 1; } });
      if (!done) { p = clampB(f, order[0].x, order[0].y); if (order[0].h === 'x') hx = 1; else hy = 1; } });
    return { x: p.x, y: p.y, hx: hx, hy: hy }; }
  function tf(f, x, y) { return 'translate(' + x + 'px,' + y + 'px)'; }
  function applySize(f) { var d = dims(f); f.el.style.width = d.w + 'px'; f.el.style.height = d.h + 'px'; }   // a shrunk feed is really smaller (not scaled), so its X stays a plain 44px button
  function setPos(f, x, y, anim) { f.st.x = x; f.st.y = y;
    f.el.style.transition = anim ? 'transform .55s ' + EASE + ', opacity .5s cubic-bezier(.4,0,.6,1)' : 'none';
    f.el.style.transform = tf(f, x, y); }
  function put(f, x, y, anim) { var r = sep(f, x, y); setPos(f, r.x, r.y, anim); return r; }
  // a free place for a new feed: where asked, else below or above the ones open
  function free(x, y) { var s = size(), c = [{ x: x, y: y }];
    feeds.forEach(function (g) { var e = dims(g); c.push({ x: x, y: g.st.y + e.h + GAP }, { x: x, y: g.st.y - s.h - GAP }); });
    c.push({ x: x, y: innerHeight - s.h - 96 }, { x: x, y: 64 });
    for (var i = 0; i < c.length; i++) { var q = clampB(null, c[i].x, c[i].y, 1), ok = true; if (Math.abs(q.y - c[i].y) > 1 && i) ok = false; feeds.forEach(function (g) { if (hits(q.x, q.y, s.w, s.h, g, GAP)) ok = false; }); if (ok) return q; }
    return clampB(null, x, y, 1); }
  function close(f) { if (!f) { feeds.slice().forEach(close); return; } if (feeds.indexOf(f) < 0) return;
    var e = f.el, a = f.st.anchor; e.querySelector('.x svg').style.transform = 'rotate(90deg)';
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    var r = a && a.isConnected ? a.getBoundingClientRect() : null, s = dims(f);
    feeds.splice(feeds.indexOf(f), 1); cancelAnimationFrame(f.st.fling || 0);
    e.classList.remove('max'); e.style.width = s.w + 'px'; e.style.height = s.h + 'px';
    e.style.transition = 'transform .45s ' + EASE + ', opacity .45s ' + EASE;
    e.style.transform = r ? 'translate(' + (r.left + r.width / 2 - 32) + 'px,' + (r.top + r.height / 2 - 18) + 'px) scale(' + (64 / s.w) + ')' : 'translate(' + f.st.x + 'px,' + f.st.y + 'px) scale(.9)';
    try { document.documentElement.classList.toggle('wf-black', feeds.some(function (g) { return g.el.classList.contains('max'); })); } catch (x) {}
    e.style.opacity = '0';
    setTimeout(function () { try { e.remove(); } catch (x) {} }, 500); }
  function maxi(f, on) { var el = f.el, st = f.st, s = size(); el.classList.toggle('max', on); el.style.zIndex = on ? 121 : ''; el.style.transition = 'width .45s ' + EASE + ', height .45s ' + EASE + ', transform .45s ' + EASE + ', border-radius .45s ' + EASE;
    try { document.documentElement.classList.toggle('wf-black', on); } catch (x) {}
    if (on) { st.px = st.x; st.py = st.y; el.style.width = (innerWidth + 4) + 'px'; el.style.height = (innerHeight + 4) + 'px'; el.style.transform = 'translate(-2px,-2px)'; }
    else { el.style.width = s.w + 'px'; el.style.height = s.h + 'px'; el.style.transform = 'translate(' + st.px + 'px,' + st.py + 'px)'; st.x = st.px; st.y = st.py; }
    var b = el.querySelector('.mx'); b.innerHTML = on ? MINI : MAXI; b.setAttribute('aria-label', on ? 'Back to the smaller camera feed' : 'Maximize camera feed'); }
  // a hard flick (the speed that ends the tour) toward another feed swaps their places; slower throws bounce off it
  function swapTarget(f, vx, vy) { var sp = Math.hypot(vx, vy), L = sp * 0.3, best = null, bt = 2, d = dims(f);
    others(f).forEach(function (g) { for (var i = 1; i <= 24; i++) { var t = i / 24; if (hits(f.st.x + vx / sp * L * t, f.st.y + vy / sp * L * t, d.w, d.h, g, 0)) { if (t < bt) { bt = t; best = g; } break; } } });
    return best; }
  function swap(f, g, fx, fy) { var ax = g.st.x, ay = g.st.y; cancelAnimationFrame(f.st.fling || 0); cancelAnimationFrame(g.st.fling || 0);
    try { if (navigator.vibrate) navigator.vibrate([8, 40, 8]); } catch (x) {}
    f.el.style.zIndex = 122; g.el.style.zIndex = 121; setPos(f, ax, ay, true); setPos(g, fx, fy, true);
    setTimeout(function () { if (!f.el.classList.contains('max')) f.el.style.zIndex = ''; if (!g.el.classList.contains('max')) g.el.style.zIndex = ''; }, 600); }
  // a swipe up at the speed that ends the tour closes a feed the same way: it flies to the top edge and is swallowed by it
  function flyOut(f, vy) { var st = f.st, el = f.el, d = dims(f), y = st.y, v = Math.min(vy, -700), hit = false, last = 0;
    feeds.splice(feeds.indexOf(f), 1); cancelAnimationFrame(st.fling || 0); el.style.transition = 'none';
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    try { document.documentElement.classList.toggle('wf-black', feeds.some(function (g) { return g.el.classList.contains('max'); })); } catch (x) {}
    var stepX = function (now) { var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (hit) v = Math.min(-280, v * Math.exp(-dt / 0.9)); y += v * dt;
      if (!hit && y <= 0) { hit = true; v *= 0.55; }
      var cut = Math.max(0, -y); el.style.transform = tf(f, st.x, y); el.style.clipPath = cut ? 'inset(' + cut + 'px 0 0 0)' : '';
      if (y + d.h <= 0) { try { el.remove(); } catch (x) {} return; }
      requestAnimationFrame(stepX); };
    requestAnimationFrame(stepX); }
  function open(o) {
    o = o || {}; var key = o.src || SRC, old = feeds.filter(function (g) { return g.st.src === key; })[0];
    if (old) { close(old); if (old.st.who === o.who) return; }   // the same button again closes it
    var s = size(), a = o.anchor && o.anchor.getBoundingClientRect ? o.anchor : null, r = a ? a.getBoundingClientRect() : null;
    var el = document.createElement('figure'), st = { anchor: a, x: 0, y: 0, sc: 1, src: key, who: o.who }, f = { el: el, st: st };
    el.className = 'wf-cf'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', (o.title || 'Helmet camera') + (o.who ? ', ' + o.who : ''));
    el.style.width = s.w + 'px'; el.style.height = s.h + 'px';
    el.innerHTML = '<video src="' + key + '" autoplay muted loop playsinline preload="auto" aria-label="' + (o.title || 'Live helmet camera') + '"></video>' +
      (o.cross ? '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="position:absolute;left:50%;top:50%;margin:-22px 0 0 -22px;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"><circle cx="22" cy="22" r="14" stroke-opacity="0.45"></circle><path d="M22 0v10M22 34v10M0 22h10M34 22h10" stroke-opacity="0.55"></path></g></svg>' : '') +
      '<span class="lb"><i aria-hidden="true"></i><span>' + (o.label || 'Live. Helmet camera') + (o.who ? '<small>' + o.who + '</small>' : '') + '</span></span>' +
      '<button type="button" class="x mbtn" aria-label="Close camera feed"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>' +
      '<div role="group" aria-label="Camera" class="wf-seg cam"><span class="segthumb" aria-hidden="true" style="width:calc((100% - 16px) / 2);transform:translateX(100%)"><span class="segblob"></span></span><button type="button" class="segopt" data-cam="t" aria-selected="false" style="font-size:17px">Thermal</button><button type="button" class="segopt" data-cam="v" aria-selected="true" style="font-size:17px">Visual</button></div>' +
      '<button type="button" class="mx mbtn" aria-label="Maximize camera feed">' + MAXI + '</button>';
    document.body.appendChild(el);
    // starts as a small feed on its button, then glides, growing, to its place: above the button, centred
    var x1 = (innerWidth - s.w) / 2, y1 = r ? r.top - s.h - 16 : innerHeight - s.h - 96; if (y1 < 64) y1 = r ? r.bottom + 16 : 64;
    var mr = a && a.closest ? a.closest('[data-wf-maproot]') : null;   // from a map: inside the map, 16px from its top-left, like the drone feed in the band
    if (mr) { var R = mr.getBoundingClientRect(); x1 = Math.max(8, R.left + 16); y1 = Math.max(8, R.top + 16); }
    var P = free(x1, y1); st.x = P.x; st.y = P.y; feeds.push(f);
    el.style.transition = 'none'; el.style.transform = r ? 'translate(' + (r.left + r.width / 2 - 32) + 'px,' + (r.top + r.height / 2 - 18) + 'px) scale(' + (64 / s.w) + ')' : 'translate(' + P.x + 'px,' + (P.y + 24) + 'px) scale(.9)';
    void el.offsetWidth; requestAnimationFrame(function () { if (feeds.indexOf(f) < 0) return; el.style.opacity = '1'; setPos(f, P.x, P.y, true); });
    try { var v = el.querySelector('video'); v.muted = true; v.play().catch(function () {}); } catch (x) {}
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    el.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); close(f); });
    el.querySelector('.mx').addEventListener('click', function (e) { e.stopPropagation(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} maxi(f, !el.classList.contains('max')); });
    Array.prototype.forEach.call(el.querySelectorAll('.cam .segopt'), function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); var t = b.getAttribute('data-cam') === 't'; try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
      el.classList.toggle('heat', t); el.querySelector('.segthumb').style.transform = 'translateX(' + (t ? 0 : 100) + '%)'; Array.prototype.forEach.call(el.querySelectorAll('.cam .segopt'), function (o) { o.setAttribute('aria-selected', String(o === b)); }); }); });   // Thermal / Visual, as on the first drone feed
    // dragging, as the tour cards
    var D = null;
    var LP = 0, R = 240;   // pushing a feed against a screen edge shrinks it (240px of push = down to 40%); a long press brings it back
    var clearLP = function () { if (LP) { clearTimeout(LP); LP = 0; } };
    var restore = function () { if (st.sc >= 1) return; cancelAnimationFrame(st.fling || 0); st.sc = 1; el.classList.remove('mini'); applySize(f);
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (x) {}
      var r = sep(f, st.x, st.y); setPos(f, r.x, r.y, true); };
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('button') || e.target.closest('.cam') || el.classList.contains('max')) return; cancelAnimationFrame(st.fling || 0); D = { x: e.clientX, y: e.clientY, x0: st.x, y0: st.y, sc0: st.sc, tr: [] }; try { el.setPointerCapture(e.pointerId); } catch (x) {}
      clearLP(); LP = setTimeout(function () { LP = 0; if (D && !D.moved) restore(); }, 550); });
    el.addEventListener('pointermove', function (e) { if (!D) return; var mx = e.clientX - D.x, my = e.clientY - D.y; if (!D.moved && Math.hypot(mx, my) < 6) return; D.moved = true; clearLP();
      var now = performance.now(); D.tr.push([now, e.clientX, e.clientY]); while (D.tr.length > 2 && now - D.tr[0][0] > 90) D.tr.shift();
      var tx = D.x0 + mx, ty = D.y0 + my, B0 = boundsF(f, D.sc0), ov = Math.max(B0.x0 - tx, tx - B0.x1, B0.y0 - ty, ty - B0.y1, 0);
      if (ov > 0) { var k = Math.max(0.4, Math.min(st.sc, D.sc0 - ov / R * 0.6)); if (k < st.sc) { st.sc = k; el.classList.add('mini'); applySize(f); } }   // only ever smaller while pushing
      put(f, tx, ty, false); e.preventDefault(); });
    var up = function () { clearLP(); if (!D || feeds.indexOf(f) < 0) { D = null; return; } var d = D; D = null; if (st.sc < 1) el.classList.add('mini'); var tr = d.tr, A = tr[0], Z = tr[tr.length - 1], vx = 0, vy = 0;
      if (d.moved && A && Z && Z[0] - A[0] > 8 && performance.now() - Z[0] < 80) { vx = (Z[1] - A[1]) / ((Z[0] - A[0]) / 1000); vy = (Z[2] - A[2]) / ((Z[0] - A[0]) / 1000); var sp = Math.hypot(vx, vy); if (sp > 2500) { vx *= 2500 / sp; vy *= 2500 / sp; } }
      var spd = Math.hypot(vx, vy); if (spd < 150) return;
      if (spd >= SWAP) { var g = swapTarget(f, vx, vy); if (g) { swap(f, g, d.x0, d.y0); return; } if (vy < -SWAP && Math.abs(vy) > Math.abs(vx) * 1.5) { flyOut(f, vy); return; } }
      var last = 0;
      var step = function (now) { if (feeds.indexOf(f) < 0) return; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; var k = Math.exp(-dt / 0.3); vx *= k; vy *= k;
        var B = boundsF(f), x = st.x + vx * dt, y = st.y + vy * dt;
        if (x < B.x0) { x = B.x0; vx = -vx * 0.3; } else if (x > B.x1) { x = B.x1; vx = -vx * 0.3; }
        if (y < B.y0) { y = B.y0; vy = -vy * 0.3; } else if (y > B.y1) { y = B.y1; vy = -vy * 0.3; }
        var q = put(f, x, y, false); if (q.hx) vx = -vx * 0.3; if (q.hy) vy = -vy * 0.3;   // bounces off another feed like off an edge
        if (Math.hypot(vx, vy) < 12) { st.fling = 0; return; } st.fling = requestAnimationFrame(step); };
      st.fling = requestAnimationFrame(step); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  addEventListener('pagehide', function () { feeds.forEach(function (g) { try { g.el.remove(); } catch (x) {} }); feeds = []; });
  window.__wfCamFeed = { open: open, close: close, isOpen: function () { return feeds.length > 0; } };
})();
