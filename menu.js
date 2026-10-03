// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The menu on every screen (Oct 3, 18:34). The menu button stays put; the screen slides left from under it to uncover the
// menu, and slides back to the same screen to close it (it never goes to the main screen). The menu itself is the main
// screen's menu, loaded underneath in menu-only mode (Main.dc.html?menu=1), so there is one menu for the whole app.
// The main screen has its own copy of this behaviour built in; this file is for the other screens.
(function () {
  if (window.top !== window || /Main\.dc\.html/.test(location.pathname)) return;
  var DUR = 1100, EASE = 'cubic-bezier(.37,0,.63,1)', MW = 564, SH = '0 0 12px rgba(0,0,0,0.08)';
  var mode = '', ifr = null, ready = false, btn = null, want = null;
  var css = document.createElement('style');
  css.textContent = 'html.wf-menujs [data-wf-burger]:not(.wf-mb){visibility:hidden!important}' +
    '.wf-mb{position:absolute;z-index:200;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:rgba(118,118,128,0.12);color:#3C3C43;cursor:pointer}';
  (document.head || document.documentElement).appendChild(css);
  document.documentElement.classList.add('wf-menujs');
  function host() { return document.getElementById('dc-root'); }
  function page() { var h = host(); if (!h) return null; for (var c = h.firstElementChild; c; c = c.nextElementSibling) if (!c.classList.contains('wf-mb')) return c; return null; }
  function spot() { return document.querySelector('[data-wf-burger]:not(.wf-mb)'); }
  function k() { var h = host(); return h && h.offsetWidth ? h.getBoundingClientRect().width / h.offsetWidth : 1; }
  // where the button rests: on the screen's own menu button, in the top bar
  function rest() { var s = spot(), h = host(); if (!s || !h) return null; var r = s.getBoundingClientRect(), R = h.getBoundingClientRect(), z = k();
    return { l: (r.left - R.left) / z, t: (r.top - R.top) / z }; }
  function place() { if (!btn || mode) return; var p = rest(); if (!p) { btn.style.display = 'none'; return; } btn.style.display = 'flex'; btn.style.left = p.l + 'px'; btn.style.top = p.t + 'px'; btn.__dx = (host().offsetWidth - 8 - 44) - p.l; }
  function make() {
    var h = host(); if (!h || btn || !spot()) return;
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'wf-mb opt'; btn.setAttribute('data-wf-burger', '1'); btn.setAttribute('aria-label', 'Preferences');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"></path></svg>';
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggle(); });
    h.appendChild(btn); place();
    // preload the menu once the screen has settled, so it is already in place when the screen slides away
    setTimeout(frame, 1500);
  }
  function frame() {
    if (ifr) return ifr;
    ifr = document.createElement('iframe'); ifr.src = 'Main.dc.html?menu=1'; ifr.title = 'Menu'; ifr.setAttribute('allow', 'web-share; clipboard-write');
    ifr.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;border:0;z-index:0;visibility:hidden;background:#F2F2F7';
    ifr.addEventListener('load', function () { ready = true; if (want) { var w = want; want = null; w(); } });
    document.body.insertBefore(ifr, document.body.firstChild);
    var h = host(); if (h) { h.style.position = 'relative'; h.style.zIndex = '1'; }
    return ifr;
  }
  function send(m) { try { ifr.contentWindow.postMessage({ wfMenu: m }, location.origin); } catch (e) {} }
  // the button travels to (or from) the menu's icon column and locks with a "clack", as on the main screen
  function clack(to) { if (!btn) return; var p = rest(); if (!p) return; var dx = btn.__dx || 12, d = to ? 1 : -1;
    // its place is set directly (8px from the edge with the menu showing); the move is drawn on top, from its old spot
    btn.style.left = (to ? p.l + dx : p.l) + 'px'; if (!btn.animate) return;
    btn.animate([{ translate: (to ? -dx : dx) + 'px 0', easing: 'cubic-bezier(.6,0,1,.6)' }, { translate: (2 * d) + 'px 0', offset: 0.72, easing: 'cubic-bezier(.2,.8,.4,1)' }, { translate: (-d) + 'px 0', offset: 0.86 }, { translate: '0px 0' }], { duration: 450, delay: 560, fill: 'backwards' }); }
  // while the menu shows, touches go through the screen's frame to the menu underneath (the screen itself and the button keep theirs)
  function through(on) { var h = host(), p = page(); if (h) h.style.pointerEvents = on ? 'none' : ''; if (p) p.style.pointerEvents = on ? 'auto' : ''; if (btn) btn.style.pointerEvents = 'auto'; }
  function slide(x) { var p = page(); if (!p) return; p.style.transition = 'transform ' + DUR + 'ms ' + EASE; p.style.transform = x ? 'translateX(' + x + 'px)' : ''; p.style.boxShadow = x ? SH : ''; p.style.willChange = 'transform'; }
  function mw() { var h = host(); return Math.min(h ? h.offsetWidth : 390, MW); }
  function open() {
    frame(); if (!ready) { want = open; return; }
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    place(); mode = 'open'; through(true); ifr.style.visibility = 'visible'; send('open'); slide(-(mw() + 32)); clack(true);
  }
  function close() {
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    mode = ''; send('close'); slide(0); clack(false); through(false);
    setTimeout(function () { if (!mode && ifr) ifr.style.visibility = 'hidden'; var p = page(); if (p && !mode) { p.style.boxShadow = ''; p.style.willChange = ''; } }, DUR + 50);
  }
  function toggle() { if (mode) close(); else open(); }
  // the menu tells which way it is: a section open, or folded to its icon column
  window.addEventListener('message', function (e) { if (e.origin !== location.origin || !e.data || !e.data.wfMenu) return; var m = e.data.wfMenu;
    if (m === 'rail' && mode) { mode = 'rail'; slide(-60); } else if (m === 'open' && mode) { mode = 'open'; slide(-(mw() + 32)); } else if (m === 'close' && mode) close(); });
  // keep the button on its spot while the screen is showing (the screen can re-render or resize)
  function tick() { if (!btn) make(); else if (!mode) place(); }
  if (document.readyState !== 'loading') setTimeout(tick, 300); else document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 300); });
  setInterval(tick, 600); window.addEventListener('resize', function () { setTimeout(tick, 120); });
  window.__wfMenu = { open: open, close: close, toggle: toggle };
})();
