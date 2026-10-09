// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The menu on every screen (Oct 3, 18:34). The menu button stays put; the screen slides right from under it to uncover the
// menu, and slides back to the same screen to close it (it never goes to the main screen). The menu itself is the main
// screen's menu, loaded underneath in menu-only mode (Main.dc.html?menu=1), so there is one menu for the whole app.
// The main screen has its own copy of this behaviour built in; this file is for the other screens.
(function () {
  if (window.top !== window || /Main\.dc\.html/.test(location.pathname)) return;
  var DUR = 350,   /* (Oct 9, 18:27) as quick as the other sliding panels (was 530) */ BD = 247,   // the screen's slide, 40% faster (Oct 3, 21:44); the button's move stays as locked
      EASE = 'cubic-bezier(.37,0,.63,1)', MW = 564, SH = '0 0 12px rgba(0,0,0,0.08)';
  var mode = '', ifr = null, ready = false, btn = null, want = null;
  var css = document.createElement('style');
  css.textContent = 'html.wf-menujs [data-wf-burger]:not(.wf-mb){visibility:hidden!important}' +   /* (Oct 9, 17:15) the floating button is the one that shows, menu open or not */   /* (Oct 9, 15:42) while the menu shows, the screen's own menu button stays put in its header and the column covers it */
    /* (Oct 8, 17:50) folded to the icon column, the menu's button lives in the column: its empty spot in the header closes, so the
       header's other buttons (notifications) sit on the screen's right edge and the title gets the room */
    'html.wf-menuopen [data-wf-burger]:not(.wf-mb){margin-right:calc(var(--wf-w, 390px) - var(--wf-w0, 390px))!important}' +   /* (Oct 9, 17:38) the header button's empty spot gives back exactly the width the screen loses, frame by frame: the notifications and the X never move */   /* (Oct 9, 15:42) folded to the column: the header button keeps its spot (under the column), nothing in the header moves */
    '@property --wf-w{syntax:"<length>";inherits:true;initial-value:390px}' +   /* (Oct 9, 19:40) the width before the resize too: Safari treats registered lengths alike, so their difference stays exact */
    '@property --wf-w0{syntax:"<length>";inherits:true;initial-value:390px}' +   /* (Oct 9, 15:50) the screen width can ease, so the content reflows along with the resize */
    '.wf-mb[data-wf-x]{background:#1C1C1E!important;color:#FFFFFF!important}' +   /* (Oct 9, 18:27) with the settings open, the X is a black round button */
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
  var moving = 0;   // while the screen slides back, the button is on its way: leave it be
  function place() { if (!btn || mode || Date.now() < moving) return; var p = rest(); if (!p) { btn.style.display = 'none'; return; } btn.style.display = 'flex'; btn.style.left = p.l + 'px'; btn.style.top = p.t + 'px'; btn.__restL = p.l; btn.__dx = (host().offsetWidth - 8 - 44) - p.l; }
  function make() {
    var h = host(); if (!h || btn || !spot()) return;
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'wf-mb opt'; btn.setAttribute('data-wf-burger', '1'); btn.setAttribute('aria-label', 'Preferences');
    btn.innerHTML = '<svg class="wf-bi" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path class="b1" d="M5 12h14"></path><path class="b2" d="M5 12h14"></path><path class="b3" d="M5 12h14"></path></svg>';
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
  // the button slides with the screen to its place (same ease and time), then locks with a small clack (Oct 3, 19:49)
  var ct = 0;
  // closing: the button waits until the screen's edge reaches the icon column (Oct 3, 20:13)
  function back() { var t = mw() + 32, f = Math.max(0, Math.min(1, (t - 60) / t)); return Math.round(Math.acos(1 - 2 * f) / Math.PI * DUR); }
  function clack(to) { if (!btn) return; var h = host(), d = to ? 1 : -1, restL = btn.__restL;
    if (restL == null) { var p = rest(); if (!p) return; restL = btn.__restL = p.l; }
    if (!to) btn.removeAttribute('data-wf-x');   // (Oct 3, 21:36) back to three lines at once when tapped to close
    btn.style.transition = 'left ' + BD + 'ms ' + EASE + ' ' + (to ? 0 : back()) + 'ms';   // the screen's own motion (Oct 3, 20:29)   // twice as fast as the screen (Oct 3, 19:58)
    btn.style.left = (to ? (h.offsetWidth - 8 - 44) : restL) + 'px';
    clearTimeout(ct); ct = setTimeout(function () { btn.style.transition = ''; if (!to) btn.__restL = null; try { if (btn.animate) btn.animate([{ translate: '0px 0' }, { translate: (2 * d) + 'px 0', offset: 0.4 }, { translate: (-d) + 'px 0', offset: 0.75 }, { translate: '0px 0' }], { duration: 200, easing: 'ease-out' }); if (navigator.vibrate) navigator.vibrate(6); } catch (e) {} if (to && mode) btn.setAttribute('data-wf-x', '1'); }, (to ? 0 : back()) + BD - 40); }
  // while the menu shows, touches go through the screen's frame to the menu underneath (the screen itself and the button keep theirs)
  function through(on) { var h = host(), p = page(); if (h) h.style.pointerEvents = on ? 'none' : ''; if (p) p.style.pointerEvents = on ? 'auto' : ''; if (btn) btn.style.pointerEvents = 'auto'; }
  // (Oct 4, 15:56) as on the main screen: the screen slides to the RIGHT and rests under the icon column (cut at the column's edge,
  // wiping the column in as it goes); folded to the column it stays in place, cut at the column; closing, it slides back from the right
  // (Oct 8, 14:30) the icon column stays on top and still: while a section is open or the menu is folded to its icons, the screen's
  // frame (not the sliding screen) is cut at the column's left edge, so the screen slides out from under the column and can never
  // pass over it, whatever the browser does with the slide. The cut leaves a window for the menu button, which lives in the column.
  var hcT = 0;
  function hclip(on) { var h = host(); if (!h) return; clearTimeout(hcT);
    if (!on) { h.style.clipPath = h.style.webkitClipPath = ''; return; }
    var W = dw(), H = h.offsetHeight, t = btn ? (parseFloat(btn.style.top) || 0) : 0, c = W - 60;
    var poly = 'polygon(-24px -80px, ' + c + 'px -80px, ' + c + 'px ' + (t - 8) + 'px, ' + W + 'px ' + (t - 8) + 'px, ' + W + 'px ' + (t + 52) + 'px, ' + c + 'px ' + (t + 52) + 'px, ' + c + 'px ' + H + 'px, -24px ' + H + 'px)';   /* (Oct 9, 15:49) the cut reaches above the top, so the header's colour still fills the strip under the clock */
    h.style.clipPath = h.style.webkitClipPath = poly; }
  function slide(m) { var p = page(); if (!p) return; var W = p.offsetWidth || 390, D = m === 'open' ? Math.max(0, mw() - 60) : 0, R = m === 'open' ? D + 60 : m === 'rail' ? 60 : 0;
    var ease = DUR + 'ms ' + EASE; p.style.willChange = 'transform, clip-path';
    if (m && !p.style.clipPath) { p.style.transition = 'none'; p.style.clipPath = p.style.webkitClipPath = 'inset(-80px 0px 0px -24px)'; void p.offsetWidth; }
    p.style.transition = 'transform ' + ease + ', clip-path ' + ease + ', -webkit-clip-path ' + ease;
    rail(m === 'rail', p);
    if (!m) hclip(false); else if (m === 'open' || p.__wfFolded) hclip(true); else hcT = setTimeout(function () { if (mode) hclip(true); }, DUR);   /* first fold from closed: the narrowing screen uncovers the column itself, then the cut holds it */
    p.__wfFolded = !!m;
    p.style.transform = D ? 'translateX(' + D + 'px)' : ''; p.style.boxShadow = m ? SH : '';
    if (m === 'rail') p.style.clipPath = p.style.webkitClipPath = 'inset(-80px 0px 0px -24px)'; else if (m) p.style.clipPath = p.style.webkitClipPath = 'inset(-80px ' + R + 'px 0px -24px)'; else { p.style.clipPath = p.style.webkitClipPath = 'inset(-80px 0px 0px -24px)'; setTimeout(function () { if (!mode && p) { p.style.clipPath = p.style.webkitClipPath = ''; } }, DUR + 60); } }
  // (Oct 4, 16:10) folded to the icon column, the screen is really resized to the visible 330px (not cropped): its width variable and the
  // viewport the screens read both shrink, and everything that reads them (maps, bands, rows) lays out again, as on the main screen
  var vp0 = null, dlgRail = false;
  /* (Oct 9, 19:40) the screen's width in design pixels, as fit.js lays it out (not offsetWidth: Safari reads it through the frame's zoom,
     which left the narrowed screen wider than the space beside the icon column, its right margin hidden under the column) */
  function dw() { var V = vp0 || window.__wfVP; return (V && V.w) || (host() ? host().offsetWidth : 390); }
  function rail(on, p) { var V = window.__wfVP; if (!V) return; var HW = dw();
    // (Oct 8, 14:25) the resize animates: the screen's width eases in step with the slide, uncovering the icon column as it narrows
    // (and covering it again as it widens). Shrinking, the content lays out narrow once the screen has arrived; widening, at once
    // (the growing screen reveals it), so nothing reflows mid-motion.
    clearTimeout(rail.t); var ease = DUR + 'ms ' + EASE;
    if (on) { if (!vp0) vp0 = V; if (V.rail) return; if (!p.style.width) { p.style.width = HW + 'px'; void p.offsetWidth; } p.style.overflow = 'hidden';
      p.style.setProperty('--wf-w', HW + 'px'); p.style.setProperty('--wf-w0', HW + 'px'); void p.offsetWidth;
      /* (Oct 9, 15:50) the content reflows with the resize (its width eases with the screen's), instead of waiting and jumping at the end */
      p.style.transition = (p.style.transition ? p.style.transition + ', ' : '') + 'width ' + ease + ', --wf-w ' + ease; p.style.width = (HW - 60) + 'px'; p.style.setProperty('--wf-w', (HW - 60) + 'px');
      rail.t = setTimeout(function () { if (mode !== 'rail') return; window.__wfVP = Object.assign({}, vp0, { w: HW - 60, rail: true }); p.style.setProperty('--wf-w', (HW - 60) + 'px'); document.documentElement.classList.add('wf-rail'); try { window.dispatchEvent(new Event('wf-rail')); } catch (e) {} }, DUR); return; }
    else if (vp0) { window.__wfVP = vp0; vp0 = null; document.documentElement.classList.remove('wf-rail'); try { window.dispatchEvent(new Event('wf-rail')); } catch (e) {}
      p.style.transition = (p.style.transition ? p.style.transition + ', ' : '') + 'width ' + ease + ', --wf-w ' + ease; p.style.width = HW + 'px'; p.style.setProperty('--wf-w', HW + 'px');
      rail.t = setTimeout(function () { if (mode === 'rail') return; p.style.width = ''; p.style.overflow = ''; p.style.removeProperty('--wf-w'); }, DUR + 40); } }
  function mw() { var h = host(); return Math.min(h ? h.offsetWidth : 390, MW); }
  function open() {
    frame(); if (!ready) { want = open; return; }
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    // (Oct 8, 08:40) captain and team lead: the menu opens on its icon column only, no section pulled open; a tap on an icon opens it
    var r = false; try { r = !!(window.__wfMine && window.__wfMine()); } catch (e) {}
    document.documentElement.classList.add('wf-menuopen');   /* (Oct 9, 13:27) the button is in the menu's column: screens style it for the column, not their header */
    place(); mode = r ? 'rail' : 'open'; through(true); ifr.style.visibility = 'visible'; send(r ? 'openrail' : 'open');
    /* (Oct 9, 17:15) the button stays on top, where it is, and turns into the X as the column comes in; the pill-shaped column starts 32px under it */
    if (btn) { clearTimeout(btn.__zT); btn.style.transition = ''; btn.style.zIndex = ''; btn.setAttribute('data-wf-x', '1'); try { ifr.contentWindow.postMessage({ wfMenu: 'btop', t: Math.round(parseFloat(btn.style.top) || 0) }, location.origin); } catch (e) {} }
    holdCtl(); slide(mode);
  }
  /* (Oct 9, 18:27) the header's other round buttons (notifications) never move while the screen narrows or widens: each frame they are held at the
     place they had on screen when the motion began (any drift from the reflow is cancelled), until the motion has ended */
  var holdT = 0; function holdCtl() { var sp = spot(), row = sp && sp.parentElement; if (!row) return; cancelAnimationFrame(holdT);
    var B = Array.prototype.filter.call(row.querySelectorAll('button, a'), function (b) { return b !== sp && b.offsetWidth; }), x0 = B.map(function (b) { b.style.translate = ''; return b.getBoundingClientRect().left; }), t0 = performance.now();
    (function f() { B.forEach(function (b, i) { var cur = parseFloat((b.style.translate || '0').split(' ')[0]) || 0, d = x0[i] - (b.getBoundingClientRect().left - cur); b.style.translate = Math.abs(d) < 0.25 ? '' : d.toFixed(2) + 'px 0px'; });
      if (performance.now() - t0 < DUR + 260) holdT = requestAnimationFrame(f); else B.forEach(function (b) { b.style.translate = ''; }); })(); }
  function close() { holdCtl();
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    mode = ''; moving = Date.now() + DUR + 100; send('close'); slide(''); through(false);
    /* (Oct 9, 15:42) the screen slides back over the column's X; once it has covered it, the button is the header's menu button again */
    if (btn) { clearTimeout(btn.__zT); btn.removeAttribute('data-wf-x'); btn.__zT = setTimeout(function () { if (mode) return; document.documentElement.classList.remove('wf-menuopen'); place(); }, DUR + 20); }   /* (Oct 9, 17:15) back to three lines at once, in place */
    else setTimeout(function () { if (!mode) document.documentElement.classList.remove('wf-menuopen'); }, DUR + 20);
    setTimeout(function () { if (!mode && ifr) ifr.style.visibility = 'hidden'; var p = page(); if (p && !mode) { p.style.boxShadow = ''; p.style.willChange = ''; } }, DUR + 50);
  }
  function toggle() { if (mode) close(); else open(); }
  // the menu tells which way it is: a section open, or folded to its icon column
  window.addEventListener('message', function (e) { if (e.origin !== location.origin || !e.data || !e.data.wfMenu) return; var m = e.data.wfMenu;
    if (m === 'dlgon' || m === 'dlgoff') { if (btn) { btn.style.opacity = m === 'dlgon' ? '0' : ''; btn.style.pointerEvents = m === 'dlgon' ? 'none' : 'auto'; }
      /* (Oct 8, 14:00) a dialog in the menu while the screen rests on the icon column: the screen slides out all the way so the dialog shows whole; it comes back to the column when the dialog closes */
      if (m === 'dlgon' && mode === 'rail') { dlgRail = true; mode = 'open'; slide('open'); } else if (m === 'dlgoff' && dlgRail) { dlgRail = false; if (mode) { mode = 'rail'; slide('rail'); } }
      /* (Oct 8, 22:28) a dialog is on top of everything: while it shows, the menu (where it lives) rises above the screen's edge and the button */
      if (ifr) { clearTimeout(ifr.__zT); if (m === 'dlgon') ifr.style.zIndex = '300'; else ifr.__zT = setTimeout(function () { ifr.style.zIndex = '0'; }, 450); }
      return; }   // (Oct 4) a dialog in the menu: the button gives way
    if (m === 'rail' && mode) { mode = 'rail'; slide('rail'); } else if (m === 'open' && mode) { mode = 'open'; slide('open'); } else if (m === 'close' && mode) close(); });
  // keep the button on its spot while the screen is showing (the screen can re-render or resize)
  function tick() { if (!btn) make(); else if (!mode) place(); }
  if (document.readyState !== 'loading') setTimeout(tick, 300); else document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 300); });
  setInterval(tick, 600); window.addEventListener('resize', function () { setTimeout(tick, 120); });
  window.__wfMenu = { open: open, close: close, toggle: toggle };
})();
