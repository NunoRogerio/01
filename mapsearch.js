// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Find a place on the map (Oct 3, 23:26; Oct 4: box anchored on the button's centre so its right end sits on the round-button column, button hidden while open): the map's search button grows into a search box (dark map-control glass, 44px tall,
// fully rounded) that floats over the map and can be dragged anywhere on it. Typing lists matching places from the third
// character; a tap flies the map there. X folds the box back into its button. One shared widget for every map.
(function () {
  if (window.__wfMapSearch) return;
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  var css = document.createElement('style');
  css.textContent =
    '.wf-ms{position:fixed;left:0;top:0;z-index:110;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#FFFFFF;touch-action:none}' +
    '.wf-ms .bx{position:relative;display:flex;align-items:center;height:44px;box-sizing:border-box;border-radius:22px;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);overflow:hidden;box-shadow:0 0 16px rgba(0,0,0,.16);cursor:grab}' +
    '.wf-ms .ic{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex-shrink:0}' +
    '.wf-ms input{flex:1 1 auto;min-width:0;height:44px;padding:0;border:0;outline:0;background:transparent;color:#FFFFFF;font:inherit;font-size:17px;caret-color:var(--wf-y,#E5FF00);opacity:0;transition:opacity .25s ease .12s;touch-action:auto}' +
    '.wf-ms input::placeholder{color:rgba(255,255,255,.72)}' +
    '.wf-ms.on input{opacity:1}' +
    '.wf-ms .x{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex-shrink:0;padding:0;border:0;background:transparent;color:#FFFFFF;cursor:pointer;opacity:0;transition:opacity .25s ease .12s}' +
    '.wf-ms.on .x{opacity:1}.wf-ms .x svg{transition:transform .6s cubic-bezier(.25,.1,.25,1)}' +
    '.wf-ms .ls{position:absolute;left:0;right:0;margin:0;padding:8px 0;list-style:none;border-radius:20px;background:rgba(0,0,0,.62);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);box-shadow:0 0 16px rgba(0,0,0,.16);max-height:288px;overflow-y:auto;touch-action:pan-y;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .25s ' + EASE + ';pointer-events:none}' +
    '.wf-ms .ls.on{opacity:1;transform:none;pointer-events:auto}' +
    '.wf-ms .ls button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:8px 16px;border:0;background:transparent;color:#FFFFFF;font:inherit;text-align:left;cursor:pointer}' +
    '.wf-ms .ls b{font-size:17px;line-height:22px;font-weight:600}.wf-ms .ls span{font-size:15px;line-height:20px;color:rgba(255,255,255,.78)}' +
    '.wf-ms .ls p{margin:0;padding:8px 16px;font-size:15px;line-height:20px;color:rgba(255,255,255,.78)}';
  (document.head || document.documentElement).appendChild(css);
  var el = null, st = null;
  var MAG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg>';
  function home(a) { var r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; return { left: cx - 22, top: cy - 22, width: 44 }; }
  function showAnchor(a, on) { if (!a || !a.style) return; a.style.transition = on ? 'opacity .2s ease' : 'none'; a.style.opacity = on ? '' : '0'; a.style.pointerEvents = on ? '' : 'none'; }
  var PT = function () { return window.__wfLang === 'pt'; };
  function area() { var m = st && st.map; var r = m && m.isConnected ? m.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
    return { x0: Math.max(8, r.left + 8), y0: Math.max(8, r.top + 8), x1: Math.min(innerWidth, r.right) - 8, y1: Math.min(innerHeight, r.bottom) - 8 }; }
  function place(x, y) { var A = area(), w = st.w; st.x = Math.max(A.x0, Math.min(A.x1 - w, x)); st.y = Math.max(A.y0, Math.min(A.y1 - 44, y));
    el.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px)'; listSide(); }
  function listSide() { var ls = el.querySelector('.ls'), A = area(), below = A.y1 - (st.y + 44), above = st.y - A.y0;
    if (below >= 180 || below >= above) { ls.style.top = '52px'; ls.style.bottom = 'auto'; ls.style.maxHeight = Math.max(120, Math.min(288, below - 8)) + 'px'; }
    else { ls.style.bottom = '52px'; ls.style.top = 'auto'; ls.style.maxHeight = Math.max(120, Math.min(288, above - 8)) + 'px'; } }
  function close() { if (!el) return; var e = el, s = st, bx = e.querySelector('.bx'); el = null; st = null;
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    try { e.querySelector('input').blur(); } catch (x) {}
    e.classList.remove('on'); e.querySelector('.ls').classList.remove('on'); e.querySelector('.x svg').style.transform = 'rotate(90deg)';
    var r = s.anchor && s.anchor.isConnected ? home(s.anchor) : null;
    bx.style.transition = 'width .4s ' + EASE + ', opacity .3s ease .15s'; e.style.transition = 'transform .4s ' + EASE;
    bx.style.width = '44px'; if (r) e.style.transform = 'translate(' + r.left + 'px,' + r.top + 'px)';
    setTimeout(function () { bx.style.opacity = '0'; }, 120);
    setTimeout(function () { showAnchor(s.anchor, true); }, 400);
    setTimeout(function () { try { e.remove(); } catch (x) {} }, 520); }
  function render(list, msg) { if (!el) return; var ls = el.querySelector('.ls'); ls.innerHTML = '';
    if (msg) { var p = document.createElement('p'); p.textContent = msg; ls.appendChild(p); }
    (list || []).forEach(function (r) { var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', r.name + (r.sub ? ', ' + r.sub : '') + (PT() ? '. Mostrar no mapa' : '. Show on the map'));
      var n = document.createElement('b'); n.textContent = r.name; b.appendChild(n); if (r.sub) { var su = document.createElement('span'); su.textContent = r.sub; b.appendChild(su); }
      b.addEventListener('click', function (ev) { ev.stopPropagation(); var g = st && st.go; close(); if (g) setTimeout(function () { g(r); }, 300); });
      li.appendChild(b); ls.appendChild(li); });
    ls.classList.toggle('on', !!(msg || (list && list.length))); }
  function onInput() { if (!el) return; var q = el.querySelector('input').value; clearTimeout(st.t);
    if (q.trim().length < 3) { render([], ''); return; }   // suggestions start at the third character
    var me = st; me.t = setTimeout(function () { render([], PT() ? 'A procurar…' : 'Searching…');
      Promise.resolve(me.query ? me.query(q) : []).then(function (res) { if (el && st === me && el.querySelector('input').value === q) render(res.list || res, (res.list || res).length ? '' : (res.off ? (PT() ? 'A pesquisa precisa de ligação.' : 'Search needs a connection.') : (PT() ? 'Nenhum local encontrado.' : 'No places found.'))); })
        .catch(function () { if (el && st === me) render([], PT() ? 'A pesquisa precisa de ligação.' : 'Search needs a connection.'); }); }, 300); }
  function open(o) {
    o = o || {}; if (el) { close(); return; }   // the button again folds it
    var a = o.anchor && o.anchor.getBoundingClientRect ? o.anchor : null, r = a ? home(a) : { left: innerWidth - 60, top: innerHeight / 2, width: 44 };
    el = document.createElement('div'); el.className = 'wf-ms'; el.setAttribute('role', 'search');
    el.innerHTML = '<div class="bx"><span class="ic" aria-hidden="true">' + MAG + '</span><input type="search" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="' + (PT() ? 'Procurar um local' : 'Find a place') + '" placeholder="' + (PT() ? 'Procurar um local' : 'Find a place') + '">' +
      '<button type="button" class="x mbtn" aria-label="' + (PT() ? 'Fechar a pesquisa' : 'Close search') + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button></div><ul class="ls" role="listbox"></ul>';
    document.body.appendChild(el); showAnchor(a, false);   // the box takes the button's place: the button under it hides
    st = { anchor: a, map: a && a.closest ? a.closest('[data-wf-maproot]') : null, query: o.query, go: o.go, w: Math.min(358, innerWidth - 32), x: r.left, y: r.top };
    var bx = el.querySelector('.bx'), inp = el.querySelector('input');
    // starts as the round button and grows leftwards from it into the full box
    bx.style.width = '44px'; el.style.transform = 'translate(' + r.left + 'px,' + r.top + 'px)';
    var x1 = r.left + 44 - st.w, y1 = r.top;
    void el.offsetWidth;
    requestAnimationFrame(function () { if (!el) return; bx.style.transition = 'width .45s ' + EASE; el.style.transition = 'transform .45s ' + EASE; bx.style.width = st.w + 'px'; el.classList.add('on'); place(x1, y1);
      setTimeout(function () { if (el) { el.style.transition = 'none'; bx.style.transition = 'none'; } }, 480); });
    try { inp.focus({ preventScroll: true }); } catch (x) {}
    // the tap that opened it still sends its mouse events onto the growing box: keep the text field focused (keyboard up)
    [60, 250, 500].forEach(function (ms) { setTimeout(function () { if (el && document.activeElement !== inp) { try { inp.focus({ preventScroll: true }); } catch (x) {} } }, ms); });
    bx.addEventListener('mousedown', function (e) { if (!e.target.closest('input')) e.preventDefault(); });
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    inp.addEventListener('input', onInput);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); else if (e.key === 'Enter') { var f = el && el.querySelector('.ls button'); if (f) f.click(); } });
    el.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); close(); });
    // drag the box anywhere on the map (from anywhere but the text field and the X)
    var D = null;
    bx.addEventListener('pointerdown', function (e) { if (e.target.closest('input,button')) return; D = { x: e.clientX, y: e.clientY, x0: st.x, y0: st.y }; try { bx.setPointerCapture(e.pointerId); } catch (x) {} bx.style.cursor = 'grabbing'; });
    bx.addEventListener('pointermove', function (e) { if (!D || !st) return; var mx = e.clientX - D.x, my = e.clientY - D.y; if (!D.moved && Math.hypot(mx, my) < 6) return; D.moved = true; place(D.x0 + mx, D.y0 + my); e.preventDefault(); });
    var up = function () { if (D && !D.moved && el) { try { inp.focus({ preventScroll: true }); } catch (x) {} } D = null; bx.style.cursor = ''; };
    bx.addEventListener('pointerup', up); bx.addEventListener('pointercancel', up);
  }
  addEventListener('pagehide', function () { if (el) { showAnchor(st && st.anchor, true); try { el.remove(); } catch (x) {} el = null; st = null; } });
  window.__wfMapSearch = { open: open, close: close, isOpen: function () { return !!el; } };
})();
