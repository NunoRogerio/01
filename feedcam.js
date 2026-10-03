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
    '.wf-cf.max .x{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .lb{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .mx{bottom:calc(24px + env(safe-area-inset-bottom))}';
  (document.head || document.documentElement).appendChild(css);
  var el = null, st = null;
  var MAXI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"></path></svg>';
  var MINI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"></path></svg>';
  function size() { var w = Math.min(358, innerWidth - 32); return { w: w, h: Math.round(w * 202 / 358) }; }
  function bounds() { var s = size(); return { x0: 8, x1: innerWidth - s.w - 8, y0: 8, y1: innerHeight - s.h - 8 }; }
  function put(x, y, anim) { var B = bounds(); st.x = Math.max(B.x0, Math.min(B.x1, x)); st.y = Math.max(B.y0, Math.min(B.y1, y));
    el.style.transition = anim ? 'transform .55s ' + EASE + ', opacity .5s cubic-bezier(.4,0,.6,1)' : 'none';
    el.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px)'; }
  function close() { if (!el) return; var e = el, a = st.anchor; e.querySelector('.x svg').style.transform = 'rotate(90deg)';
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    var r = a && a.isConnected ? a.getBoundingClientRect() : null, s = size();
    e.classList.remove('max'); e.style.width = s.w + 'px'; e.style.height = s.h + 'px';
    e.style.transition = 'transform .45s ' + EASE + ', opacity .45s ' + EASE;
    e.style.transform = r ? 'translate(' + (r.left + r.width / 2 - 32) + 'px,' + (r.top + r.height / 2 - 18) + 'px) scale(' + (64 / s.w) + ')' : 'translate(' + st.x + 'px,' + st.y + 'px) scale(.9)';
    try { document.documentElement.classList.remove('wf-black'); } catch (x) {}
    e.style.opacity = '0'; el = null; cancelAnimationFrame(st.fling || 0); st = null;
    setTimeout(function () { try { e.remove(); } catch (x) {} }, 500); }
  function maxi(on) { if (!el) return; var s = size(); el.classList.toggle('max', on); el.style.transition = 'width .45s ' + EASE + ', height .45s ' + EASE + ', transform .45s ' + EASE + ', border-radius .45s ' + EASE;
    try { document.documentElement.classList.toggle('wf-black', on); } catch (x) {}
    if (on) { st.px = st.x; st.py = st.y; el.style.width = (innerWidth + 4) + 'px'; el.style.height = (innerHeight + 4) + 'px'; el.style.transform = 'translate(-2px,-2px)'; }
    else { el.style.width = s.w + 'px'; el.style.height = s.h + 'px'; el.style.transform = 'translate(' + st.px + 'px,' + st.py + 'px)'; st.x = st.px; st.y = st.py; }
    var b = el.querySelector('.mx'); b.innerHTML = on ? MINI : MAXI; b.setAttribute('aria-label', on ? 'Back to the smaller camera feed' : 'Maximize camera feed'); }
  function open(o) {
    o = o || {}; if (el) { var same = st && st.src === (o.src || SRC); close(); if (same) return; }   // the same button again closes it
    var s = size(), a = o.anchor && o.anchor.getBoundingClientRect ? o.anchor : null, r = a ? a.getBoundingClientRect() : null;
    el = document.createElement('figure'); el.className = 'wf-cf'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', (o.title || 'Helmet camera') + (o.who ? ', ' + o.who : ''));
    el.style.width = s.w + 'px'; el.style.height = s.h + 'px';
    el.innerHTML = '<video src="' + (o.src || SRC) + '" autoplay muted loop playsinline preload="auto" aria-label="' + (o.title || 'Live helmet camera') + '"></video>' +
      (o.cross ? '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="position:absolute;left:50%;top:50%;margin:-22px 0 0 -22px;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"><circle cx="22" cy="22" r="14" stroke-opacity="0.45"></circle><path d="M22 0v10M22 34v10M0 22h10M34 22h10" stroke-opacity="0.55"></path></g></svg>' : '') +
      '<span class="lb"><i aria-hidden="true"></i><span>' + (o.label || 'Live. Helmet camera') + (o.who ? '<small>' + o.who + '</small>' : '') + '</span></span>' +
      '<button type="button" class="x mbtn" aria-label="Close camera feed"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>' +
      '<button type="button" class="mx mbtn" aria-label="Maximize camera feed">' + MAXI + '</button>';
    document.body.appendChild(el);
    st = { anchor: a, x: 0, y: 0, src: o.src || SRC };
    // starts as a small feed on its button, then glides, growing, to its place: above the button, centred
    var x1 = (innerWidth - s.w) / 2, y1 = r ? r.top - s.h - 16 : innerHeight - s.h - 96; if (y1 < 64) y1 = r ? r.bottom + 16 : 64;
    var mr = a && a.closest ? a.closest('[data-wf-maproot]') : null;   // from a map: inside the map, 16px from its top-left, like the drone feed in the band
    if (mr) { var R = mr.getBoundingClientRect(); x1 = Math.max(8, R.left + 16); y1 = Math.max(8, R.top + 16); }
    el.style.transition = 'none'; el.style.transform = r ? 'translate(' + (r.left + r.width / 2 - 32) + 'px,' + (r.top + r.height / 2 - 18) + 'px) scale(' + (64 / s.w) + ')' : 'translate(' + x1 + 'px,' + (y1 + 24) + 'px) scale(.9)';
    void el.offsetWidth; requestAnimationFrame(function () { if (!el) return; el.style.opacity = '1'; put(x1, y1, true); });
    try { var v = el.querySelector('video'); v.muted = true; v.play().catch(function () {}); } catch (x) {}
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    el.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); close(); });
    el.querySelector('.mx').addEventListener('click', function (e) { e.stopPropagation(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} maxi(!el.classList.contains('max')); });
    // dragging, as the tour cards
    var D = null;
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('button') || el.classList.contains('max')) return; cancelAnimationFrame(st.fling || 0); D = { x: e.clientX, y: e.clientY, x0: st.x, y0: st.y, tr: [] }; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', function (e) { if (!D) return; var mx = e.clientX - D.x, my = e.clientY - D.y; if (!D.moved && Math.hypot(mx, my) < 6) return; D.moved = true;
      var now = performance.now(); D.tr.push([now, e.clientX, e.clientY]); while (D.tr.length > 2 && now - D.tr[0][0] > 90) D.tr.shift(); put(D.x0 + mx, D.y0 + my, false); e.preventDefault(); });
    var up = function () { if (!D || !st) { D = null; return; } var d = D; D = null; var tr = d.tr, A = tr[0], Z = tr[tr.length - 1], vx = 0, vy = 0;
      if (d.moved && A && Z && Z[0] - A[0] > 8 && performance.now() - Z[0] < 80) { vx = (Z[1] - A[1]) / ((Z[0] - A[0]) / 1000); vy = (Z[2] - A[2]) / ((Z[0] - A[0]) / 1000); var sp = Math.hypot(vx, vy); if (sp > 2500) { vx *= 2500 / sp; vy *= 2500 / sp; } }
      if (Math.hypot(vx, vy) < 150) return; var last = 0;
      var step = function (now) { if (!st) return; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; var k = Math.exp(-dt / 0.3); vx *= k; vy *= k;
        var B = bounds(), x = st.x + vx * dt, y = st.y + vy * dt;
        if (x < B.x0) { x = B.x0; vx = -vx * 0.3; } else if (x > B.x1) { x = B.x1; vx = -vx * 0.3; }
        if (y < B.y0) { y = B.y0; vy = -vy * 0.3; } else if (y > B.y1) { y = B.y1; vy = -vy * 0.3; }
        put(x, y, false); if (Math.hypot(vx, vy) < 12) { st.fling = 0; return; } st.fling = requestAnimationFrame(step); };
      st.fling = requestAnimationFrame(step); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  addEventListener('pagehide', function () { if (el) { try { el.remove(); } catch (x) {} el = null; st = null; } });
  window.__wfCamFeed = { open: open, close: close, isOpen: function () { return !!el; } };
})();
