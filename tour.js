// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Quick tour: translucent bubbles that say what to do next, each with a hand-drawn arrow to the control to tap.
// It follows one demo ignition from the main screen to a closed fire, then notifications, chats and settings.
// The step is kept in sessionStorage ('wf-tour'), so the tour carries on across screens. Every bubble has End tour.
// Steps either wait for a tap on the control they point at ('tap'), offer a Next button ('next'), or wait until
// something has happened on screen ('until'). A step whose control can't be found after a while shows Next instead.
// WF_TOUR_ON = false switches the tour off: it never runs or blocks touches, any tour left running is cleared, and the Tour button says it is coming back.
var WF_TOUR_ON = true;
if (!WF_TOUR_ON) { try { sessionStorage.removeItem('wf-tour'); } catch (e) {}
  // While the tour is off, the Tour button stays and opens a dark-glass tooltip saying it is coming back (X or a tap outside closes it)
  var wfTourSoon = function (anchor) {
    var old = document.getElementById('wf-toursoon'); if (old) { old.remove(); return; }
    var pt = window.__wfLang === 'pt', w = document.createElement('div'); w.id = 'wf-toursoon'; w.setAttribute('role', 'dialog'); w.setAttribute('translate', 'no');
    var r = anchor ? anchor.getBoundingClientRect() : { top: innerHeight - 140, left: innerWidth - 80, width: 60 };
    w.style.cssText = 'position:fixed;left:16px;right:16px;bottom:' + Math.max(16, innerHeight - r.top + 12) + 'px;z-index:99995;display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:20px;background:rgba(28,28,30,0.94);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased;opacity:0;transform:translateY(8px);transition:opacity .28s ease,transform .28s cubic-bezier(.2,.8,.2,1)';
    w.innerHTML = '<p style="flex:1 1 auto;margin:0;font-size:15px;line-height:20px;text-wrap:pretty">' + (pt ? 'A visita está em desenvolvimento. Volta quando tivermos a certeza de que o helicóptero o leva em segurança.' : 'Tour is under development. It will return once we\'re sure the chopper gets you by safely.') + '</p>' +
      '<button type="button" class="opt" data-a="x" aria-label="' + (pt ? 'Fechar' : 'Close') + '" style="flex:0 0 44px;width:44px;height:44px;margin:-10px -10px -10px 0;border:0;border-radius:50%;background:rgba(255,255,255,0.14);color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="transition:transform .5s cubic-bezier(.3,.7,.3,1)"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<span aria-hidden="true" style="position:absolute;bottom:-7px;right:' + Math.max(24, innerWidth - (r.left + r.width / 2) - 8) + 'px;width:14px;height:14px;background:rgba(28,28,30,0.94);transform:rotate(45deg);border-radius:0 0 3px 0"></span>';
    var close = function () { document.removeEventListener('pointerdown', off, true); var ic = w.querySelector('svg'); if (ic) ic.style.transform = 'rotate(90deg)'; w.style.opacity = '0'; w.style.transform = 'translateY(8px)'; setTimeout(function () { w.remove(); }, 300); };
    var off = function (e) { if (!w.isConnected) { document.removeEventListener('pointerdown', off, true); return; } if (!w.contains(e.target) && !(anchor && anchor.contains(e.target))) close(); };
    w.querySelector('[data-a=x]').onclick = close;
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.style.opacity = '1'; w.style.transform = 'none'; });
    setTimeout(function () { document.addEventListener('pointerdown', off, true); }, 0);
  };
  window.__wfTour = { start: function () {}, end: function () {}, warn: wfTourSoon, active: function () { return false; } };
  var wfTourGone = function () { ['wf-tour', 'wf-tourwarn', 'wf-tour-css'].forEach(function (id) { var el = document.getElementById(id); if (el) el.remove(); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wfTourGone); else wfTourGone(); }
// Two guides (Oct 3): the "Chopper tour test" demo profile keeps the guide helicopter; every other profile gets a light-blue
// circle (80px) over the control to tap. The circle lets every touch through, so the control under it works as it is.
var WF_TOUR_HELI = (function () { try { return localStorage.getItem('wf-custom') === 'heli'; } catch (e) { return false; } })();
if (WF_TOUR_ON && !window.__wfMenuOnly) (function () {   // never inside the menu frame (menu.js)
  /* (Oct 5) the next screen preloading in the push-up frame never draws the tour (it showed a tiny bubble on a grey panel) */
  var INFRAME = false; try { INFRAME = window.self !== window.top && !!(window.frameElement && window.frameElement.closest && window.frameElement.closest('[data-wf-pushup]')); } catch (e) { INFRAME = false; }
  var KEY = 'wf-tour', PAGE = (location.pathname.split('/').pop() || 'index.html');
  var get = function () { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  var put = function (s) { try { if (s) sessionStorage.setItem(KEY, JSON.stringify(s)); else sessionStorage.removeItem(KEY); } catch (e) {} };
  var PT = function () { return window.__wfLang === 'pt'; };

  // ---- finding controls -------------------------------------------------------------------------------------
  var VH = function () { return window.innerHeight; }, VW = function () { return window.innerWidth; };
  // strict: also check nothing sits on top of it (used where a folded blade clips content that still has a size);
  // elsewhere invisible layers (scroll fades, a map band that forwards taps) would wrongly hide real controls
  function shown(el, strict) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    for (var a = el.parentElement, n = 0; a && a !== document.body && n < 40; a = a.parentElement, n++) { var ac = getComputedStyle(a); if (+ac.opacity === 0 || ac.display === 'none') return false; }   // e.g. a full-screen map kept faded out until opened
    if (r.bottom < 0 || r.top > VH()) return 'off';
    if (r.bottom > VH() - 24 || r.top < 24 || r.left < 0 || r.right > VW()) return 'part';   // partly cut off at an edge: scrolled fully into view   // there, but scrolled away: the tour scrolls it into view
    if (!strict) return true;
    var x = Math.min(VW() - 2, Math.max(2, r.left + r.width / 2)), y = Math.min(VH() - 2, Math.max(2, r.top + Math.min(r.height / 2, 40)));
    var h = document.elementFromPoint(x, y); if (!h) return false;
    if (el.contains(h) || (h.shadowRoot && h === el)) return true;
    var host = h.getRootNode && h.getRootNode().host; return !!(host && el.contains(host));
  }
  function q(sel, filter, strict) { var L = document.querySelectorAll(sel), off = null; for (var i = 0; i < L.length; i++) { if (filter && !filter(L[i])) continue; var s = shown(L[i], strict); if (s === true) return L[i]; if ((s === 'off' || s === 'part') && !off) off = L[i]; } return off; }
  var txt = function (el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); };
  function chip(words) { return q('button.chbtn', function (b) { if (!b.parentElement || b.parentElement.style.maxHeight !== '88px') return false; var t = txt(b); return words.some(function (w) { return t.indexOf(w) >= 0; }); }); }
  var chipRow = function () { var b = q('button.chbtn', function (x) { return x.parentElement && x.parentElement.style.maxHeight === '88px'; }); return b ? b.parentElement : null; };
  var pathBtn = function (d) { return q('button.mbtn', function (b) { var p = b.querySelector('path[d^="' + d + '"]'); return !!p && getComputedStyle(p).display !== 'none'; }); };
  var hdr = function (sel) { return q('header[data-pull="down"] ' + sel); };
  var closeIn = function (sec) { var s = document.querySelector(sec); if (!s) return; var b = [].slice.call(s.querySelectorAll('button')).find(function (x) { return x.querySelector('path[d^="M6 6"]'); }); if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; } };
  var areaOpen = function () { var a = document.querySelector('section[data-swipe-key="sc"]'); return !!a && a.getAttribute('aria-hidden') === 'false'; };
  var areaClose = function () { var b = document.querySelector('section[data-swipe-key="sc"] button[data-swipe-go]'); if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; } };
  // Bring a control into view by scrolling only the containers people can scroll themselves (never the page or a clipped
  // frame: on iPhone that shifted the whole app up, hid the back row and left no way to scroll it back)
  function scrollable(n, ax) { var c = getComputedStyle(n), o = ax === 'y' ? c.overflowY : c.overflowX; return (o === 'auto' || o === 'scroll') && (ax === 'y' ? n.scrollHeight > n.clientHeight + 1 : n.scrollWidth > n.clientWidth + 1); }
  function reveal(el, vOut, hOut) {
    var r = el.getBoundingClientRect(), doneY = !vOut, doneX = !hOut;
    for (var n = el.parentElement; n && n !== document.body && n !== document.documentElement && !(doneX && doneY); n = n.parentElement) {
      var b = n.getBoundingClientRect();
      if (!doneY && scrollable(n, 'y')) { doneY = true; glide(n, 'y', (r.top + r.height / 2) - (Math.max(b.top, 0) + Math.min(b.height, VH()) / 2)); }
      if (!doneX && scrollable(n, 'x')) { doneX = true; glide(n, 'x', (r.left + r.width / 2) - (b.left + b.width / 2)); }
    }
  }
  // Safety: anything that can't be scrolled by hand (the page, clipped frames) is kept at its origin while the tour runs
  function unshift() {
    var a = document.activeElement; if (a && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;   // typing: iPhone moves the page for the keyboard
    [document.scrollingElement, document.documentElement, document.body].forEach(function (n) { if (n && (n.scrollTop || n.scrollLeft)) { n.scrollTop = 0; n.scrollLeft = 0; } });
    var dc = document.getElementById('dc-root'); for (var n = dc; n && n !== document.body; n = n.parentElement) if (n.scrollTop && getComputedStyle(n).overflowY === 'hidden') n.scrollTop = 0;
  }
  // One auto-scroll speed for the whole tour (Oct 3, 20:57): 104 px/s (49% faster than the 70 px/s used before), with a
  // gentle start and finish; any touch, wheel or scroll by the person stops it
  var TOUR_SPEED = 146;   // (Oct 5, 03:37) 40% faster (was 104)
  function glide(n, axis, delta) { if (!n || !delta) return; var p0 = axis === 'x' ? n.scrollLeft : n.scrollTop, dur = Math.max(250, Math.abs(delta) / TOUR_SPEED * 1000), t0 = 0, stop = false;
    var halt = function () { stop = true; ['pointerdown', 'touchstart', 'wheel'].forEach(function (t) { document.removeEventListener(t, halt, true); }); };
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (t) { document.addEventListener(t, halt, { capture: true, passive: true }); });
    var ease = function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
    var step = function (t) { if (stop || !n.isConnected) { halt(); return; } if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), v = p0 + delta * ease(k);
      if (axis === 'x') n.scrollLeft = v; else n.scrollTop = v; if (k < 1) requestAnimationFrame(step); else halt(); };
    requestAnimationFrame(step); }
  var scrollEnd = function (sel) { var e = document.querySelector(sel); if (e) glide(e, 'y', e.scrollHeight - e.clientHeight - e.scrollTop); };

  // The open incident list's most likely candidate (the first row; the list is sorted by likelihood). Only once the
  // list is open (its blade unclipped), judged by the blade itself because the list's top fade covers its first row.
  function listRow() {
    var sec = document.querySelector('section[data-swipe-key="li"]'); if (!sec) return null;
    var cp = getComputedStyle(sec).clipPath || ''; if (!/^inset\(0px/.test(cp) && cp !== 'none') return null;
    var r0 = sec.querySelector('a.sqrow[href="Alert.dc.html"]'); return r0 && shown(r0) ? r0 : null;
  }
  // The map step points at a circle whose summary panel has room to open whole: away from the screen sides and from
  // the top and bottom bands, closest to the upper middle of the map (the bubble then sits clear of the panel)
  // the most likely candidate on the map (highest percent in its label), on screen
  // Show a blade by opening it and folding it back (Oct 3): opens once the circle has arrived, closes 0.5 s after it has opened
  function demoOf(openSel, closeSel) { return { open: openSel, close: closeSel }; }
  var demoRan = -1;
  function runDemo(i, st) {
    if (!st.demo || demoRan === i || get() && get().b) return; demoRan = i;
    var still = function () { var s0 = get(); return !!s0 && s0.i === i; };
    var press = function (sel) { var e = q(sel) || document.querySelector(sel); if (!e) return; selfTap = true; try { e.click(); } catch (x) {} selfTap = false; };
    // the card and the circle fade away while the blade opens, stays 2.5 s and folds back, then fade in again (Oct 3)
    var fade = function (on) { if (root) root.classList.toggle('demo', on); };
    // the circle taps the button first (Oct 3, 17:11): it swells 25% and quickly settles back, then the blade opens
    var tap = function () { try { if (dot) dot.animate([{ scale: '1' }, { scale: '1.25', offset: 0.4, easing: 'cubic-bezier(.2,.8,.3,1)' }, { scale: '1' }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)' }); } catch (x) {} };
    var next = function () { fade(false); dotHold = false; if (root) root.classList.remove('demopick'); if (still()) { go(i + 1); setTimeout(tick, 60); } };
    setTimeout(function () { if (still()) tap(); }, 900);
    setTimeout(function () { if (still()) fade(true); }, 1160);
    setTimeout(function () { if (still()) press(st.demo.open); }, 1200);
    if (st.demo.pick) {
      // (Oct 3, 19:44) in the open blade the circle comes back, goes to the chosen item and taps it; (19:45) it can hold
      // there, then go to the close control and tap it too
      var hold = st.demo.hold || 0, T = 2300;
      var aimAt = function (el) { if (!el || !dot) return; var r = el.getBoundingClientRect(); if (root) root.classList.add('demopick'); dotHold = true; dot.style.left = (r.left + Math.min(40, r.width / 2)) + 'px'; dot.style.top = (r.top + r.height / 2) + 'px'; };
      setTimeout(function () { if (!still()) return; var el = st.demo.pick(); if (!el) return; try { el.scrollIntoView({ block: 'nearest' }); } catch (x) {} setTimeout(function () { if (still()) aimAt(el); }, 120); }, T - 300);
      setTimeout(function () { if (still()) tap(); }, T + 600);
      setTimeout(function () { var el = still() && st.demo.pick(); if (el) { selfTap = true; try { el.click(); } catch (x) {} selfTap = false; } }, T + 860);
      var C = T + 860 + Math.max(540, hold);
      if (st.demo.tapClose) {
        setTimeout(function () { if (still()) aimAt(q(st.demo.close) || document.querySelector(st.demo.close)); }, C);
        setTimeout(function () { if (still()) tap(); }, C + 700);
        setTimeout(function () { if (still()) press(st.demo.close); }, C + 960);
        setTimeout(next, C + 960 + 1100);
      } else {
        setTimeout(function () { var sc = document.querySelector('section[data-swipe-key="sc"]'); if (sc && getComputedStyle(sc).pointerEvents !== 'none') press(st.demo.close); }, C);
        setTimeout(next, C + 600);
      }
      return;
    }
    var aim2 = function (el) { if (!el || !dot) return; var r = el.getBoundingClientRect(); if (root) root.classList.add('demopick'); dotHold = true; dot.style.left = ((r.left + r.right) / 2) + 'px'; dot.style.top = ((r.top + r.bottom) / 2) + 'px'; };
    if (st.demo.tapClose) {
      // (Oct 3, 20:01) after the pause the circle comes back, goes to the close control (the X, or the list's grabber) and taps it
      var C2 = 1200 + 500 + 2500 - 900;
      setTimeout(function () { if (still()) aim2(document.querySelector(st.demo.closeAt || st.demo.close)); }, C2);
      setTimeout(function () { if (still()) tap(); }, C2 + 700);
      setTimeout(function () { if (still()) press(st.demo.close); }, C2 + 960);
      setTimeout(next, C2 + 960 + 700);
      return;
    }
    setTimeout(function () { press(st.demo.close); }, 1200 + 500 + 2500);   // about 0.5 s to open, then 2.5 s open (Oct 3, 17:12; was 1 s)
    // once the blade has folded back, the tour moves on to the next step by itself (Oct 3, 17:11)
    setTimeout(next, 1200 + 500 + 2500 + 550);
  }
  // the state card's Move to <next stage> button, when the card is open
  function stMove() { return q('[data-wf-stmove]'); }
  function stExpand() { var c = q('header + button.chrow[aria-expanded="false"]'); if (c) { selfTap = true; try { c.click(); } catch (e) {} selfTap = false; } }
  // the candidate was confirmed: its Confirm / Dismiss suggestions are gone (checked a moment after the step began)
  function confirmedHere() { return !!seen && Date.now() - seen > 1200 && !chip(['Declare fire', 'Declarar incêndio', '宣言']) && !chip(['Dismiss fire', 'Descartar incêndio']) && !!q('header + button.chrow[aria-expanded]'); }
  function topMarker() {
    var L = [].slice.call(document.querySelectorAll('[data-wf-maproot] button.tipwrap[aria-label*="ignition candidate"]')), best = null, bp = -1;
    L.forEach(function (b) { if (shown(b) !== true) return; var m = /(\d+) percent/.exec(b.getAttribute('aria-label') || ''), v = m ? +m[1] : 0; if (v > bp) { bp = v; best = b; } });
    return best;
  }
  function pickMarker() {
    var sel = document.querySelector('[data-wf-maproot] button.tipwrap.igsel'); if (sel && document.querySelector('[data-wf-pop]') && shown(sel) === true) return sel;
    var L = [].slice.call(document.querySelectorAll('[data-wf-maproot] button.tipwrap')), vw = VW(), vh = VH(), best = null, bs = 1e9;
    L.forEach(function (b) { if (shown(b) !== true) return; var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var sc = Math.abs(y - vh * 0.42) + Math.abs(x - vw / 2) * 0.5 + (x < 120 || x > vw - 120 ? 1000 : 0) + (y < 260 || y > vh - 300 ? 1000 : 0);
      if (sc < bs) { bs = sc; best = b; } });
    return best;
  }

  // own messages in the chat (the Ask the team step waits for one more)
  var meBase = 0; function mine() { return document.querySelectorAll('.chbubR').length; }
  // The demo ignition always starts afresh: a chat left from an earlier tour (chats are kept on the phone, while a
  // confirmation lasts only until the app closes) would skip the confirmation and open a fire the app doesn't know
  function freshDemo() {
    var C = window.__wfChat, k = window.__wfAlertKey || '', id = k.replace(/^c:/, '');
    if (!C || !id || !C.forget) return;
    var conf = null; try { conf = JSON.parse(sessionStorage.getItem('wf-confirmed') || 'null'); } catch (e) {} conf = conf || (window.__wfMem || {}).confirmed || {};
    if (conf[id] || conf['F-' + id]) return;   // confirmed in this session: its chat is current
    var c = C.get(k); if (c && (c.stage > 0 || c.closed || c.dismissed)) C.forget(k);
    // (Oct 5, 03:17) and its earlier orders (a tour taken before): the fire page opens with nothing dispatched, the AI suggestion offered
    try { var A = JSON.parse(localStorage.getItem('wf-orders') || '{}') || {}; [id, 'F-' + id, k].forEach(function (x) { delete A[x]; }); localStorage.setItem('wf-orders', JSON.stringify(A)); } catch (e) {}
  }
  // the fire page map's full-screen control: open (maximize) or close (minimize)
  function fsBtn(open) { var d = open ? 'M14 4h6v6' : 'M4 14h6v6'; return q('button.mbtn', function (b) { var p = b.querySelector('path[d^="' + d + '"]'); return !!p && getComputedStyle(p).display !== 'none'; }); }
  // the full-screen map has been left (exit tapped, or turned upright), with no drone feed open, a moment after the step began
  function leftFull(ms) { if (!seen || Date.now() - seen < (typeof ms === 'number' ? ms : 1500)) return false; return !fsBtn(false) && !!fsBtn(true) && !q('button.mbtn', function (x) { return !!x.querySelector('path[d^="M6 6l12 12"]'); }); }
  function closeDrone() { var f = q('button.mbtn', function (x) { return !!x.querySelector('path[d^="M6 6l12 12"]'); }); if (f) { selfTap = true; try { f.click(); } catch (e) {} selfTap = false; } }
  // ---- the steps --------------------------------------------------------------------------------------------
  // t: the action (title); b: one or two short sentences; mode: 'tap' | 'next' | 'until'
  var S = [
    { page: 'Main.dc.html', mode: 'next', next: ['Start', 'Começar'],
      t: ['Let\'s deal with a fire ignition now', 'Vamos tratar de uma ignição agora'], wip: true,
      b: WF_TOUR_HELI ? ['Follow one ignition from detection to a closed fire. Tap what the helicopter points to, or use ‹ › to move between steps.',
          'Acompanhe uma ignição desde a deteção até ao incêndio encerrado. Toque no que o helicóptero indica, ou use ‹ › para mudar de passo.'] :
          ['Follow one ignition from detection to a closed fire. Tap what the yellow circle marks, or use ‹ › to move between steps.',
          'Acompanhe uma ignição desde a deteção até ao incêndio encerrado. Toque no que o círculo amarelo marca, ou use ‹ › para mudar de passo.'] },
    // Oct 3: the two blade selectors are shown (not opened), then the ignition is opened from the map
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('button[aria-haspopup="dialog"][aria-label^="Area:"]') || q('button[aria-label^="Área:"]'); },
      t: ['Choose a region', 'Escolha uma região'], point: true, area: true, demo: Object.assign(demoOf('button[aria-haspopup="dialog"][aria-label^="Area:"]', 'section[data-swipe-key="sc"] button[data-swipe-go]'), { pick: function () { var sec = document.querySelector('section[data-swipe-key="sc"]'); if (!sec) return null; var B = [].slice.call(sec.querySelectorAll('button,[role=button]')); for (var k = 0; k < B.length; k++) { var t = (B[k].getAttribute('aria-label') || B[k].textContent || ''); if (/^\s*Los Angeles/.test(t) && B[k].offsetHeight) return B[k]; } return null; } }),
      b: ['Tap here any time to change the region. For now we stay here.', 'Toque aqui a qualquer momento para mudar de região. Por agora ficamos aqui.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('section[data-swipe-key="li"] > div:last-child > button.opt'); },
      t: ['Or pick from the list', 'Ou escolha da lista'], point: true, demo: Object.assign(demoOf('section[data-swipe-key="li"] > div:last-child > button.opt', 'section[data-swipe-key="li"] button[data-swipe-go]'), { tapClose: true, closeAt: 'section[data-swipe-key="li"] > span[aria-hidden="true"]' }),   // (Oct 3, 20:01) closes on its grabber
      b: ['Every candidate and fire in this region, the most likely first. Open it any time to pick one.', 'Todos os candidatos e incêndios desta região, os mais prováveis primeiro. Abra-a a qualquer momento para escolher um.'] },
    // (Oct 5) the chats step (it opened the chats panel) was removed
    // (Oct 5) the notifications step (it opened the notifications panel) was removed
    // (Oct 5) the preferences step (it opened the settings menu) was removed
    { page: 'Main.dc.html', mode: 'until', until: function () { return !!q('[data-wf-pop] a[href="Alert.dc.html"]'); }, find: topMarker,
      t: ['Let’s start by selecting a candidate on the map', 'Comecemos por selecionar um candidato no mapa'],
      b: ['We marked the most likely one. Tap it.', 'Marcámos o mais provável. Toque nele.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('[data-wf-pop] a[href="Alert.dc.html"]'); }, also: '[data-wf-pop] a[href="Alert.dc.html"]',
      t: ['Open the demo ignition', 'Abra a ignição de demonstração'],
      b: ['Its summary. Tap View for the whole picture.', 'O resumo. Toque em Ver para ver tudo.'] },

    { page: 'Alert.dc.html', mode: 'next', interact: true, find: function () { return q('[role=list]:has(> [data-wf-kpi][data-g="ign"])') || q('[data-wf-ighdr]'); },
      ach: ['You found your first ignition', 'Encontrou a sua primeira ignição'], then: ['Now let\'s take a closer look.', 'Agora vamos ver de perto.'],
      t: ['Key figures', 'Números principais'], hold: true, tourScroll: true, low: true,
      b: ['Press and hold a card to reorder; tap + to choose which to show.',
          'Prima e mantenha um cartão para reordenar; toque em + para escolher quais mostrar.'] },
    { page: 'Alert.dc.html', mode: 'tap', before: freshDemo, find: function () { return q('[data-wf-ighdr] a[href="Chat.dc.html"]'); },
      t: ['Confirm the ignition in the team chat', 'Confirme a ignição na conversa da equipa'],
      b: ['Declaring a fire is a team call. Tap the chat to talk with the coordinators and station chiefs.', 'Declarar um incêndio é uma decisão da equipa. Toque na conversa para falar com coordenadores e comandantes de quartel.'] },

    // (Oct 5, 03:15) one step: the state card opens by itself and the cursor goes straight to its Move to First alert button
    { page: 'Chat.dc.html', mode: 'until', until: confirmedHere, before: function () { var t = 0, f = function () { if (!q('header + button.chrow[aria-expanded="true"]')) stExpand(); if (++t < 6 && !stMove()) setTimeout(f, 300); }; setTimeout(f, 400); },
      find: function () { return stMove() || q('header + button.chrow[aria-expanded]'); },
      t: ['Declare the fire', 'Declare o incêndio'],
      b: ['Tap Move to First alert to declare it.', 'Toque em Passar a Despacho de 1.º alerta para o declarar.'] },
    // (Oct 5, 02:28) crews are dispatched from the chat: the cursor on the Configure dispatch button of the Ignition confirmed card
    { page: 'Chat.dc.html', mode: 'tap', before: function () { var c = q('header + button.chrow[aria-expanded="true"]'); if (c) { selfTap = true; try { c.click(); } catch (e) {} selfTap = false; } },   /* the state card closes: straight to the chat with the card */
      find: function () { return q('article.chmsg button.chbtn', function (b) { return /^(Configure dispatch|Configurar despacho)/.test(txt(b)) && !b.disabled; }) || chip(['Configure dispatch', 'Configurar despacho']); },
      ach: ['You\'ve confirmed an ignition. Great work!', 'Confirmou uma ignição. Excelente trabalho!'], then: ['Now send crews to it.', 'Agora envie equipas.'],
      t: ['Configure the dispatch', 'Configure o despacho'],
      b: ['Tap Configure dispatch on the card to choose the crews.', 'Toque em Configurar despacho no cartão para escolher as equipas.'] },

    // (Oct 5, 02:01) the fire page opens on its Crews tab with nothing assigned: the AI suggestion first (or a dispatch by hand)
    { page: 'Dispatch.dc.html', mode: 'tap', before: function () { var t = 0, f = function () {
          var tab = q('button[role=tab].segopt', function (x) { return /^(Crews|Equipas)/.test((x.textContent || '').trim()) && x.offsetParent !== null; });
          if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
          if (window.__wfDispPlanReset && !q('button.mbtn.wf-reset[aria-label]', function (b) { return b.offsetParent !== null; })) window.__wfDispPlanReset();
          var g = get(); if (++t < 40 && g && S[g.i] && S[g.i].t && S[g.i].t[0] === 'Use the AI suggestion') setTimeout(f, 300); }; f(); },   /* (Oct 5, 03:17) for as long as this step lasts: nothing chosen yet, the AI suggestion showing */
      find: function () { return q('button.mbtn.wf-reset[aria-label]', function (x) { return x.offsetParent !== null; }); },
      t: ['Use the AI suggestion', 'Use a sugestão da IA'],
      b: ['No crews are assigned yet. Tap AI suggested pack: the nearest stations and air support. You can also build the dispatch yourself with Add resources.', 'Ainda não há equipas atribuídas. Toque no pacote sugerido pela IA: os quartéis mais próximos e meios aéreos. Também pode montar o despacho com Adicionar meios.'] },
    // (Oct 5, 03:39) moves on as soon as the orders start going out (the sending screen shows), however the tap reached the button
    { page: 'Dispatch.dc.html', mode: 'until', interact: true, until: function () { var d = q('section[aria-labelledby="sendTitle"]'); return !!d && d.getAttribute('aria-hidden') === 'false'; }, find: function () {
        // Never a dead end: if the plan is still empty (Send order disabled), the tour fills it with the AI suggested pack itself
        // the Send order button that is on screen (the Crews foot sits inside its own sheet), never the sending dialog's
        var b = q('button.btn.primary', function (x) { return !x.closest('section[aria-labelledby="sendTitle"]') && x.offsetParent !== null && /^(Send order|Enviar ordem)/.test(txt(x)); }, true) || q('button.btn.primary', function (x) { return !x.closest('section[aria-labelledby="sendTitle"]') && x.offsetParent !== null && /^(Send order|Enviar ordem)/.test(txt(x)); });
        if (b && b.getAttribute('aria-disabled') === 'true') { var ai = q('button.mbtn.wf-reset[aria-label]', function (x) { return x.offsetParent !== null; }); if (ai && !ai.__wfAuto) { ai.__wfAuto = 1; ai.click(); } }
        return b; },
      t: ['Send the orders', 'Envie as ordens'],
      b: ['Tap Send order: each station and the air team get their order.', 'Toque em Enviar ordem: cada quartel e os meios aéreos recebem a sua ordem.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('section[aria-labelledby="sendTitle"] button.btn.primary'); },
      ach: ['Crews dispatched. Well done!', 'Equipas enviadas. Muito bem!'], then: ['Here are the orders going out.', 'Aqui estão as ordens a sair.'],
      t: ['Back to the team chat', 'De volta à conversa da equipa'],
      b: ['Tap Team chat. The leads are confirming their orders there.', 'Toque em Chat da equipa. Os chefes estão a confirmar as ordens.'] },

    // (Oct 5, 03:21) the fire moves forward by itself, stage after stage (the cursor stays on its state), until it can be closed
    { page: 'Chat.dc.html', mode: 'until', auto: true, stages: true, noClose: true,
      until: function () { var m = stMove(); return !!chip(['Close fire', 'Encerrar incêndio', 'Move to Closed', 'Passar a Encerrad']) || !!(m && /Closed|Encerrad/.test(m.textContent || '')); },
      find: function () { return q('header + button.chrow[aria-expanded]'); },
      t: ['The fire moves forward', 'O incêndio avança'],
      b: ['Watch it go from stage to stage as the crews work it. You will close it at the end.', 'Veja-o passar de fase em fase enquanto as equipas o combatem. No fim, é você que o encerra.'] },
    { page: 'Chat.dc.html', mode: 'tap', interact: true, find: function () { return chip(['Close fire', 'Encerrar incêndio', 'Move to Closed', 'Passar a Encerrad']) || stMove() || q('header + button.chrow[aria-expanded]'); },
      t: ['Close the fire', 'Encerre o incêndio'],
      b: ['It is under surveillance and holding. Tap Close fire.', 'Está em vigilância e dominado. Toque em Encerrar incêndio.'] },
    // the closing checks run by themselves: no cursor here (it comes back on the summary card)
    { page: 'Chat.dc.html', mode: 'until', until: function () { return !!q('wf-trophy'); }, auto: true, quiet: true,
      find: function () { return null; },
      t: ['Closing the fire', 'A encerrar o incêndio'],
      b: ['The team confirms the closing checks.', 'A equipa confirma as verificações de encerramento.'] },
    { page: 'Chat.dc.html', mode: 'tap', find: function () { return q('wf-trophy'); },
      ach: ['Fire out. Outstanding work!', 'Incêndio extinto. Trabalho notável!'], then: ['Now let\'s see what it took.', 'Agora vamos ver o que foi preciso.'],
      t: ['The fire summary', 'O resumo do incêndio'],
      b: ['Tap the card to open the fire summary.', 'Toque no cartão para abrir o resumo do incêndio.'] },
    { page: 'Chat.dc.html', mode: 'next', find: function () { return q('header.chview'); }, next: ['Finish', 'Terminar'],
      ach: ['Well done. You resolved your first fire.', 'Muito bem. Resolveu o seu primeiro incêndio.'], then: ['Now let\'s do it for real.', 'Agora vamos fazê-lo a sério.'],
      t: ['Explore the summary', 'Explore o resumo'],
      b: ['Time in each stage, the forces used and the result. Scroll down to see it all, then tap Finish.', 'Tempo em cada fase, meios usados e resultado. Deslize para ver tudo e toque em Terminar.'] }
  ];

  // ---- drawing ----------------------------------------------------------------------------------------------
  var jumped = false, root, bub, ring, dot, dotP = null, dotA = null, svg, cur = -1, seen = 0, scrolled = false, ran = false, lastKey = '';
  function css() {
    if (document.getElementById('wf-tour-css')) return;
    var st = document.createElement('style'); st.id = 'wf-tour-css';
    st.textContent = 'html.wf-pushing #wf-tour{opacity:0!important;transition:opacity .2s ease}' + '#wf-tour{position:fixed;inset:0;z-index:99990;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased}' +
      '#wf-tour .tb{position:absolute;box-sizing:border-box;padding:16px;border-radius:20px;background:rgba(28,28,30,0.72);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;pointer-events:auto;opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1)}' +
      '#wf-tour .tb.on{opacity:1;transform:none}' +
      '#wf-tour .tb{touch-action:none;cursor:grab}#wf-tour .tb.drag{cursor:grabbing;transition:none!important}#wf-tour .tb::before{content:"";position:absolute;left:50%;top:6px;width:44px;height:3px;margin-left:-22px;border-radius:2px;background:rgba(255,255,255,0.3)}' +
      '#wf-tour .ta{display:flex;align-items:center;gap:8px;width:100%;max-width:100%;box-sizing:border-box;margin:0 0 4px;padding:8px 16px;border-radius:999px;background:rgba(var(--wf-y-rgb,229,255,0),0.2);box-shadow:inset 0 0 0 1px rgba(var(--wf-y-rgb,229,255,0),0.55);color:var(--wf-y,#E5FF00);font-size:15px;font-weight:600;line-height:20px;position:relative;isolation:isolate;opacity:0}' +
      // the achievement shows last (Oct 3, 18:40): once the card has settled it pops in, its background swells 10% and back,
      // with the prlim sound and a haptic at that same moment
      '#wf-tour .ta.go{animation:wfach .3s cubic-bezier(.3,1.5,.5,1) both}#wf-tour .ta::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:inherit;pointer-events:none}#wf-tour .ta.go::before{animation:wfachBg .5s cubic-bezier(.3,0,.3,1) .05s both}@keyframes wfachBg{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:scale(1)}}' +
      '#wf-tour .ta.still{opacity:1}' + '@keyframes wfach{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:none}}' +
      '#wf-tour .tth{margin:0 0 16px;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86)}' +
      '#wf-tour .tt{margin:0;font-size:17px;font-weight:600;line-height:22px}' +
      '#wf-tour .twip{margin:4px 0 0;font-size:15px;font-weight:600;line-height:20px;color:var(--wf-y,#E5FF00)}' +
      '#wf-tour .tx{margin:4px 0 0;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86);text-wrap:pretty}' +
      '#wf-tour .tf{display:flex;align-items:center;gap:8px;margin-top:16px}' +
      '#wf-tour .tn{flex-grow:1;font-size:13px;line-height:18px;color:rgba(255,255,255,0.6);font-variant-numeric:tabular-nums}' +
      '#wf-tour button{height:40px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '#wf-tour .te{background:rgba(255,255,255,0.14);color:#FFFFFF}' +
      '#wf-tour .tg{background:var(--wf-y,#E5FF00);color:#1C1C1E}' +
      '#wf-tour .tr{position:absolute;box-sizing:border-box;border:2px solid var(--wf-y,#E5FF00);box-shadow:0 0 0 2px rgba(28,28,30,0.55);pointer-events:none;animation:wftp 1.6s ease-in-out infinite}' +
      '@keyframes wftp{0%,100%{opacity:1}50%{opacity:.45}}' +
      '#wf-tour .tgl{position:absolute;top:10%;height:80%;width:18px;-webkit-mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);animation:wftg 3.6s ease-in-out infinite}' +
      '#wf-tour .tgl.l{left:0;background:linear-gradient(90deg,rgba(var(--wf-y-rgb,229,255,0),0.65) 0,rgba(var(--wf-y-rgb,229,255,0),0.65) 1.5px,rgba(var(--wf-y-rgb,229,255,0),0.38) 2.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '#wf-tour .tgl.r{right:0;background:linear-gradient(270deg,rgba(var(--wf-y-rgb,229,255,0),0.65) 0,rgba(var(--wf-y-rgb,229,255,0),0.65) 1.5px,rgba(var(--wf-y-rgb,229,255,0),0.38) 2.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '@keyframes wftg{0%,100%{opacity:1}50%{opacity:.4}}' +
      '#wf-tour .tc{width:40px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.14);color:#FFFFFF}#wf-tour .tc.tg{background:var(--wf-y,#E5FF00);color:#1C1C1E}#wf-tour .tc[disabled]{opacity:.3;cursor:default}' +
      '#wf-tour .tdot{position:absolute;width:80px;height:80px;margin:-40px 0 0 -40px;box-sizing:border-box;border-radius:50%;background:rgba(var(--wf-y-rgb,229,255,0),0.3);box-shadow:inset 0 0 0 2px rgba(var(--wf-y-rgb,229,255,0),0.95),0 0 0 1px rgba(28,28,30,0.35);pointer-events:none;opacity:0;transition:opacity .35s ease,left .5s cubic-bezier(.2,.8,.2,1),top .5s cubic-bezier(.2,.8,.2,1)}' +
      '#wf-tour .tdot.on{opacity:1;animation:wftd 1.8s infinite}' +
      '@keyframes wftd{0%{transform:scale(1);animation-timing-function:ease-in-out}75%{transform:scale(1.1);animation-timing-function:cubic-bezier(.4,0,.6,1)}100%{transform:scale(1)}}' +
      '@media (prefers-reduced-motion:reduce){#wf-tour .tdot.on{animation:none}}' +
      '#wf-tour.demo .tb,#wf-tour.demo .tdot{opacity:0!important;pointer-events:none!important}' +
      '#wf-tour.demo.demopick .tdot{opacity:1!important}' +
      '#wf-tour svg.tsv{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      '#wf-tour .ar{stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:wfta .55s cubic-bezier(.4,0,.2,1) .15s forwards}' +
      '@keyframes wfta{to{stroke-dashoffset:0}}' +
      // Circle-guide profiles (Oct 3): dark glass cards (as the helicopter profile), with these touches:
      (WF_TOUR_HELI ? '' :
      // achievements stand out: the hi-vis yellow, solid, with dark text and a soft glow
      '#wf-tour .ta{background:var(--wf-y,#E5FF00);box-shadow:0 0 0 1px rgba(28,28,30,0.12),0 2px 12px rgba(var(--wf-y-rgb,229,255,0),0.55);color:#1C1C1E}' +
      // the card glows softly all round, pulsing with the screen-edge glow
      // a slightly darker glass that lets the screen underneath show through, softly blurred (Oct 3)
      '#wf-tour .tb{background:rgba(10,10,12,0.72);-webkit-backdrop-filter:blur(12px) saturate(160%);backdrop-filter:blur(12px) saturate(160%)}' +
      '#wf-tour .tb{animation:wftbg 3.6s ease-in-out infinite}' +
      '@keyframes wftbg{0%,100%{box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18),0 0 20px 0 rgba(var(--wf-y-rgb,229,255,0),0.36)}50%{box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18),0 0 20px 0 rgba(var(--wf-y-rgb,229,255,0),0.14)}}' +
      '@media (prefers-reduced-motion:reduce){#wf-tour .tb{animation:none}}' +
      // the screen-edge glows ride with the card: 110% of its height, centred on it (positioned from script)
      // edge glows more evident here: wider, brighter, and never fading below 60%
      // a lens: widest in the middle, tapering to a 4px line at the top and bottom ends (Oct 3); --gk: the magnetism's opacity
      '#wf-tour .tgl{width:31px;animation-name:wftg2;filter:blur(var(--gbl,2px));-webkit-mask-image:radial-gradient(100% 50% at var(--gx) 50%,#000 45%,transparent 100%),linear-gradient(#000,#000);mask-image:radial-gradient(100% 50% at var(--gx) 50%,#000 45%,transparent 100%),linear-gradient(#000,#000);-webkit-mask-size:100% 100%,4px 100%;mask-size:100% 100%,4px 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}@keyframes wftg2{0%,100%{opacity:1;transform:scaleX(1)}50%{opacity:.3;transform:scaleX(.78)}}' +
      '#wf-tour .tgl.l{transform-origin:0 50%;--gx:0%;-webkit-mask-position:0 0,0 0;mask-position:0 0,0 0;background:linear-gradient(90deg,rgba(var(--wf-y-rgb,229,255,0),calc(0.95*var(--gk,1))) 0,rgba(var(--wf-y-rgb,229,255,0),calc(0.95*var(--gk,1))) 2px,rgba(var(--wf-y-rgb,229,255,0),calc(0.6*var(--gk,1))) 3.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '#wf-tour .tgl.r{transform-origin:100% 50%;--gx:100%;-webkit-mask-position:0 0,100% 0;mask-position:0 0,100% 0;background:linear-gradient(270deg,rgba(var(--wf-y-rgb,229,255,0),calc(0.95*var(--gk,1))) 0,rgba(var(--wf-y-rgb,229,255,0),calc(0.95*var(--gk,1))) 2px,rgba(var(--wf-y-rgb,229,255,0),calc(0.6*var(--gk,1))) 3.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '#wf-tour .tgl{transition:top .45s cubic-bezier(.2,.8,.2,1),height .45s cubic-bezier(.2,.8,.2,1),width .3s ease}#wf-tour.drag .tgl{transition:width .15s ease}');
    document.head.appendChild(st);
  }
  function build() {
    if (root && root.isConnected) return; css();
    root = document.createElement('div'); root.id = 'wf-tour'; root.setAttribute('translate', 'no');
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'tsv');
    ring = document.createElement('div'); ring.className = 'tr'; dot = document.createElement('div'); dot.className = 'tdot';
    bub = document.createElement('div'); bub.className = 'tb'; bub.setAttribute('role', 'dialog'); bub.setAttribute('aria-live', 'polite');
    ['l', 'r'].forEach(function (k) { var g = document.createElement('div'); g.className = 'tgl ' + k; root.appendChild(g); });   // tour mode: a soft lime glow along both sides of the screen
    root.appendChild(svg); root.appendChild(ring); root.appendChild(bub); root.appendChild(dot); dotP = null; document.body.appendChild(root); dragOn(bub);
  }
  // The bubble can be dragged out of the way (by its grabber or any part that isn't a button); it stays where it was put
  // for the rest of that step, kept on screen
  var drag = { dx: 0, dy: 0, i: -1 };
  var exiting = false;   // the card is leaving through the top edge (swipe up ends the tour)
  function place(l, t) {
    if (exiting) return;
    var s0 = get(); if (!s0 || drag.i !== s0.i) { drag.dx = 0; drag.dy = 0; }
    var w = bub.offsetWidth, h = bub.offsetHeight, L = Math.min(VW() - w - 8, Math.max(8, l + drag.dx)), T = Math.min(VH() - h - 8, Math.max(8, t + drag.dy));
    bub.style.left = L + 'px'; bub.style.top = T + 'px';
  }
  // Achievement sound (Oct 3, 17:20): a short bright "prlim", a quick rising trill landing on a soft bell note.
  // Web Audio, no file to load; the context is unlocked by the first touch (browsers block sound before one).
  var actx = null, ACH_LEAD = 450;   // the sound leads the achievement card by this much (ms)
  function actxGet() { try { if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {} return actx; }
  ['pointerdown', 'touchend'].forEach(function (ev) { window.addEventListener(ev, function () { actxGet(); }, { capture: true, passive: true }); });
  // (Oct 5, 02:03) the achievement sound: only the "poomm", a low, round note with a warm bass, a soft low-pass and a light echo
  function prlim() {
    if (INFRAME) { try { if (window.parent && window.parent.__wfTourPrlim) { window.parent.__wfTourPrlim(); return; } } catch (e) {} }
    var c = actxGet(); if (!c) return;
    try { var t0 = c.currentTime + 0.01, out = c.createGain(), lp = c.createBiquadFilter(), dl = c.createDelay(), fb = c.createGain(), wet = c.createGain();
      out.gain.value = 0.32; lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.3;
      dl.delayTime.value = 0.23; fb.gain.value = 0.2; wet.gain.value = 0.22;
      lp.connect(out); out.connect(c.destination); out.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(c.destination);
      // "poomm": a low, round note with a soft bass under it
      var t1 = t0, voice = function (type, f, d, peak, att) { var v = c.createOscillator(), vg = c.createGain(); v.type = type; v.frequency.setValueAtTime(f, t1); v.frequency.exponentialRampToValueAtTime(f * 0.97, t1 + d);
        vg.gain.setValueAtTime(0.0001, t1); vg.gain.exponentialRampToValueAtTime(peak, t1 + att); vg.gain.exponentialRampToValueAtTime(0.0001, t1 + d); v.connect(vg); vg.connect(lp); v.start(t1); v.stop(t1 + d + 0.05); };
      voice('sine', 196, 1.4, 0.55, 0.04); voice('sine', 98, 1.2, 0.45, 0.05); voice('triangle', 392, 0.6, 0.08, 0.03);
    } catch (e) {}
  }
  // (Oct 5) a step that opens another screen with an achievement waiting on it: the sound plays on the tap itself (the one
  // moment iOS allows sound), and the screen change waits until it has finished, so it plays as the new screen rises
  document.addEventListener('click', function (e) { try { var a = e.target && e.target.closest && e.target.closest('a[data-wf-split]'); if (!a) return; var s0 = get(); if (!s0) return; var nx = S[s0.i + 1];
    if (!nx || !nx.ach) return;
    // (Oct 5, 03:12) the achievement waits for the next screen: its tag animates on the rising panel with the sound; the screen
    // change waits for it (the panel tells this screen when the tag has played; 2.6s at most)
    window.__wfNavHold = Date.now() + 2600; } catch (x) {} }, true);
  window.__wfTourPrlim = function () { prlim(); };   /* the rising panel's frame asks this screen (which had the tap) to play the sound */
  function dragOn(b) {
    var st = null, fling = 0;
    b.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; cancelAnimationFrame(fling); fling = 0; var s0 = get(); st = { x: e.clientX, y: e.clientY, dx: drag.i === (s0 && s0.i) ? drag.dx : 0, dy: drag.i === (s0 && s0.i) ? drag.dy : 0, i: s0 ? s0.i : -1, moved: false, trail: [] }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) { if (!st) return; var mx = e.clientX - st.x, my = e.clientY - st.y; if (!st.moved && Math.hypot(mx, my) < 6) return; st.moved = true; drag.i = st.i; drag.dx = st.dx + mx; drag.dy = st.dy + my;
      var now = performance.now(); st.trail.push([now, e.clientX, e.clientY]); while (st.trail.length > 2 && now - st.trail[0][0] > 90) st.trail.shift();
      b.classList.add('drag'); place(parseFloat(b.dataset.l || 0), parseFloat(b.dataset.t || 0)); e.preventDefault(); });
    // Inertia (Oct 3): a swipe keeps the card sliding the way it was thrown, decelerating smoothly; screen edges stop it
    // Left and right edges (Oct 3, 13:37): the bubble is nearly as wide as the screen, so there is no room to throw it back;
    // it stretches past the edge like rubber (further the harder it hits, up to 32px) and springs back
    var sideBump = function (v) { try { var d = (v > 0 ? -1 : 1) * Math.min(10, 4 + Math.abs(v) * 0.004); if (b.__wfSB) b.__wfSB.cancel();   // recoils inward, away from the edge (never past it), 4 to 10px (Oct 3, 13:40)
      b.__wfSB = b.animate([{ translate: '0px 0px', easing: 'cubic-bezier(.2,.8,.3,1)' }, { translate: d + 'px 0px', offset: 0.35, easing: 'cubic-bezier(.4,0,.2,1)' }, { translate: '0px 0px' }], { duration: 560 }); } catch (x) {} };
    var throwIt = function (vx, vy, i) {
      var last = 0, l = parseFloat(b.dataset.l || 0), t = parseFloat(b.dataset.t || 0);
      var stepF = function (now) { var s0 = get(); if (!s0 || s0.i !== i || !bub || !bub.isConnected) { fling = 0; return; }
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; var k = Math.exp(-dt / 0.3); vx *= k; vy *= k;
        var bx = drag.dx, by = drag.dy; drag.dx += vx * dt; drag.dy += vy * dt; place(l, t); drag.dx = parseFloat(bub.style.left) - l; drag.dy = parseFloat(bub.style.top) - t;
        if (Math.abs(drag.dx - bx - vx * dt) > 0.5 && Math.abs(vx) > 60) vx = -vx * 0.3; else if (Math.abs(drag.dx - bx) < 0.01) vx = 0; if (Math.abs(drag.dy - by - vy * dt) > 0.5 && Math.abs(vy) > 60) vy = -vy * 0.3; else if (Math.abs(drag.dy - by) < 0.01) vy = 0;   // every edge bounces the same way: the bubble stops 8px from the screen edge and bumps back at 30% of its speed, never past the margin (Oct 3, 14:19)
        if (Math.hypot(vx, vy) < 12) { fling = 0; return; } fling = requestAnimationFrame(stepF); };
      fling = requestAnimationFrame(stepF);
    };
    // Swipe up ends the tour (Oct 3, 22:32): thrown upward, the card flies to the top edge; there it slows a little and slides on
    // into the edge, swallowed by it (cut flat along the edge) until it has gone, and the tour ends
    var exitTop = function (vy) { exiting = true; cancelAnimationFrame(fling); fling = 0; b.classList.add('drag');
      var y = parseFloat(b.style.top) || 0, h = b.offsetHeight, edge = 0, v = Math.min(vy, -700), hit = false, last = 0;
      try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
      var stepX = function (now) { var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
        if (hit) v = Math.min(-280, v * Math.exp(-dt / 0.9)); y += v * dt;
        if (!hit && y <= edge) { hit = true; v *= 0.55; }   // touching the edge: a little slower from here
        var cut = Math.max(0, edge - y); b.style.top = y + 'px'; b.style.clipPath = cut ? 'inset(' + cut + 'px 0 0 0)' : '';
        if (y + h <= edge) { b.style.visibility = 'hidden'; exiting = false; end(); endedCard(); return; }
        requestAnimationFrame(stepX); };
      requestAnimationFrame(stepX); };
    var up = function () { if (!st) return; var s1 = st; if (s1.moved) { tiltLock = s1.i; tiltV = 0; tiltVX = 0; } st = null;   // dropped: it stays where it lands for the rest of this step (tilt off until the next step)
      b.classList.remove('drag');
      var tr = s1.trail, a = tr[0], z = tr[tr.length - 1], vx = 0, vy = 0;
      if (s1.moved && a && z && z[0] - a[0] > 8 && performance.now() - z[0] < 80) { vx = (z[1] - a[1]) / ((z[0] - a[0]) / 1000); vy = (z[2] - a[2]) / ((z[0] - a[0]) / 1000); var sp = Math.hypot(vx, vy); if (sp > 2500) { vx *= 2500 / sp; vy *= 2500 / sp; } }
      if (vy < -2340 && Math.abs(vy) > Math.abs(vx) * 1.5) { exitTop(vy); return; }   // only a very fast swipe up ends the tour through the top (Oct 3, 22:36; Oct 4: 30% faster, 1800 to 2340 px/s); slower throws bounce
      if (Math.hypot(vx, vy) > 150) throwIt(vx, vy, s1.i);
      setTimeout(function () { try { var r = bub.getBoundingClientRect(); if (curEl) tick(); else heliPark(r); } catch (x) {} }, 0); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
  }
  // End tour (Oct 3): back to the main screen, where the guide circle flies home into the Tour button, shrinking to its size
  // The tour always runs in California, Los Angeles (Oct 3, 19:44): the region shown before is kept aside and comes back at the end
  function tourScope(on) { try { var K = 'wf-scope', B = 'wf-scope-pretour';
      if (on) { if (sessionStorage.getItem(B) == null) sessionStorage.setItem(B, sessionStorage.getItem(K) || ''); sessionStorage.setItem(K, JSON.stringify({ st: 'CA', co: 'Los Angeles' })); window.__wfMem = Object.assign(window.__wfMem || {}, { scope: { st: 'CA', co: 'Los Angeles' } }); }
      else { var b = sessionStorage.getItem(B); if (b == null) return; sessionStorage.removeItem(B); var v = null; try { v = b ? JSON.parse(b) : null; } catch (x) {} if (b) sessionStorage.setItem(K, b); else sessionStorage.removeItem(K); window.__wfMem = Object.assign(window.__wfMem || {}, { scope: v }); }
      window.dispatchEvent(new Event('wf-sync')); } catch (e) {} }
  // (Oct 4) after a swipe up ended the tour: a card in the middle of the screen says so; it fades out by itself after 3 s, or with its X
  function endedCard() { try {
      var old = document.getElementById('wf-tour-ended'); if (old) old.remove();
      var c = document.createElement('div'); c.id = 'wf-tour-ended'; c.setAttribute('role', 'status');
      c.style.cssText = 'position:fixed;left:50%;top:50%;z-index:2147483000;width:min(300px,calc(100vw - 32px));box-sizing:border-box;padding:16px;display:flex;align-items:flex-start;gap:16px;border-radius:28px;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);box-shadow:0 8px 32px rgba(0,0,0,.16);font:inherit;color:#000;opacity:0;transform:translate(-50%,-50%) scale(.96);transition:opacity .3s ease,transform .3s ease';
      var t = document.createElement('p'); t.style.cssText = 'margin:0;flex:1 1 auto;min-width:0;padding-top:11px;font-size:17px;line-height:22px;font-weight:400;color:#000';
      t.textContent = PT() ? 'Dispensou o tour. Recomece no ecrã inicial.' : 'You\'ve dismissed the tour. Restart on the Home screen.';
      var x = document.createElement('button'); x.type = 'button'; x.className = 'mbtn'; x.setAttribute('aria-label', PT() ? 'Fechar' : 'Close');
      x.style.cssText = 'flex:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:rgba(118,118,128,.12);color:#1C1C1E;cursor:pointer';
      x.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';
      c.appendChild(t); c.appendChild(x); document.body.appendChild(c);
      var gone = false, bye = function () { if (gone) return; gone = true; c.style.opacity = '0'; c.style.transform = 'translate(-50%,-50%) scale(.96)'; setTimeout(function () { try { c.remove(); } catch (e) {} }, 400); };
      x.addEventListener('click', bye);
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.opacity = '1'; c.style.transform = 'translate(-50%,-50%)'; }); });
      setTimeout(bye, 3000);
    } catch (e) {} }
  function end() {
    var d = dot && dot.classList.contains('on') ? dot.getBoundingClientRect() : null;
    if (d && d.width) { try { sessionStorage.setItem('wf-tourhome', JSON.stringify({ x: d.left + d.width / 2, y: d.top + d.height / 2, t: Date.now() })); } catch (e) {} }
    put(null); tourScope(false); try { sessionStorage.removeItem(DK); } catch (e) {} cur = -1; heliLand();
    if (PAGE !== 'Main.dc.html') { if (root) root.remove(); root = null; location.href = 'Main.dc.html'; return; }
    if (bub) bub.classList.remove('on'); var R0 = root; root = null; setTimeout(function () { if (R0) R0.remove(); }, 350);
    flyHome();
  }
  function flyHome() {
    if (WF_TOUR_HELI) return; var m = null; try { m = JSON.parse(sessionStorage.getItem('wf-tourhome') || 'null'); sessionStorage.removeItem('wf-tourhome'); } catch (e) {}
    if (!m || Date.now() - m.t > 15000) return;
    var go = function (n) { var tb = document.querySelector('[data-wf-tourbtn] .wf-tdot'), r = tb && tb.getBoundingClientRect();
      if (!r || !r.width) { if (n < 40) setTimeout(function () { go(n + 1); }, 100); return; }
      css(); var f = document.createElement('div'); f.className = 'tdot on'; f.style.cssText = 'position:fixed;z-index:99991;animation:none;left:' + m.x + 'px;top:' + m.y + 'px;transition:left .7s cubic-bezier(.2,.8,.2,1),top .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1),opacity .2s ease .6s';
      var host = document.createElement('div'); host.id = 'wf-tour'; host.appendChild(f); document.body.appendChild(host); tb.style.visibility = 'hidden';
      requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height / 2) + 'px'; f.style.transform = 'scale(' + (r.width / 80) + ')'; f.style.opacity = '0'; }); });
      setTimeout(function () { tb.style.visibility = ''; host.remove(); }, 800); };
    go(0);
  }
  function go(i) {
    var s = get(); if (!s) return;
    var st = S[s.i]; if (st && st.done) try { st.done(); } catch (e) {}
    if (i >= S.length) { end(); return; }
    if (S[i].page !== PAGE) heliExit(S[i].page);
    put({ i: i, max: Math.max(i, s.max || 0) }); seen = 0; scrolled = false; ran = false; armed = -1;
  }
  function back(i) { if (i < 1) return; var s0 = get() || {}; var p = i - 1; if (S[p].page !== PAGE) heliExit(S[p].page); put({ i: p, b: 1, max: Math.max(i, s0.max || 0) }); seen = Date.now(); scrolled = false; ran = false; cur = -1; lastKey = ''; if (S[p].page !== PAGE) { try { history.back(); } catch (e) { location.href = S[p].page; } } else tick(); }
  // The entry warning: a dark-glass tooltip just above the Tour button (the tour is still being tuned)
  function warn(anchor) { if (window.__wfTour && window.__wfTour.active && window.__wfTour.active()) return; window.__wfTour.start(); }   // straight in; the sign is on the first card (Oct 3)
  function warnOld(anchor) {
    var old = document.getElementById('wf-tourwarn'); if (old) { old.remove(); return; }
    css(); var pt = PT(), w = document.createElement('div'); w.id = 'wf-tourwarn'; w.setAttribute('role', 'dialog'); w.setAttribute('translate', 'no');
    var r = anchor ? anchor.getBoundingClientRect() : { top: innerHeight - 140, left: innerWidth - 80, width: 60 };
    w.style.cssText = 'position:fixed;left:16px;right:16px;bottom:' + Math.max(16, innerHeight - r.top + 12) + 'px;z-index:99995;padding:16px;border-radius:20px;background:rgba(28,28,30,0.94);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased';
    w.innerHTML = '<p style="margin:0;font-size:17px;font-weight:600;line-height:22px">⚠️ ' + (pt ? 'Visita em construção' : 'Tour under construction') + '</p>' +
      '<p style="margin:4px 0 0;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86);text-wrap:pretty">' + (pt ? 'Estamos a trabalhar nela e ainda tem muitas falhas. Terminar visita está sempre à mão para sair.' : 'We\'re still working on it and it has lots of bugs. End tour is always there to get you out.') + '</p>' +
      '<div style="display:flex;gap:8px;margin-top:16px"><button type="button" data-a="no" style="flex:1 1 0;height:40px;border:0;border-radius:999px;background:rgba(255,255,255,0.14);color:#FFFFFF;font:inherit;font-size:15px;font-weight:600;cursor:pointer">' + (pt ? 'Agora não' : 'Not now') + '</button>' +
      '<button type="button" data-a="go" style="flex:1 1 0;height:40px;border:0;border-radius:999px;background:var(--wf-y,#E5FF00);color:#1C1C1E;font:inherit;font-size:15px;font-weight:600;cursor:pointer">' + (pt ? 'Começar visita' : 'Start tour') + '</button></div>' +
      '<span aria-hidden="true" style="position:absolute;bottom:-7px;right:' + Math.max(24, innerWidth - (r.left + r.width / 2) - 8) + 'px;width:14px;height:14px;background:rgba(28,28,30,0.94);transform:rotate(45deg);border-radius:0 0 3px 0"></span>';
    w.querySelector('[data-a=no]').onclick = function () { w.remove(); };
    w.querySelector('[data-a=go]').onclick = function () { w.remove(); window.__wfTour.start(); };
    document.body.appendChild(w);
    var off = function (e) { if (!w.isConnected) { document.removeEventListener('pointerdown', off, true); return; } if (!w.contains(e.target) && !(anchor && anchor.contains(e.target))) { w.remove(); document.removeEventListener('pointerdown', off, true); } };
    setTimeout(function () { document.addEventListener('pointerdown', off, true); }, 0);
  }
  window.__wfTour = { warn: warn, start: function () { askTilt(); tiltN = null; tiltNG = null; tiltLock = -1; try { var tb = document.querySelector('[data-wf-tourbtn] span[aria-hidden]') || document.querySelector('[data-wf-tourbtn]'), q0 = tb && tb.getBoundingClientRect(); if (q0 && q0.width) sessionStorage.setItem(DK, JSON.stringify({ x: (q0.left + q0.right) / 2, y: (q0.top + q0.bottom) / 2, t: Date.now() })); } catch (e) {} heliTakeOff(); put({ i: 0 }); tourScope(true); seen = 0; scrolled = false; ran = false; tick(); }, end: end, active: function () { return !!get(); } };

  // a hand-drawn arrow: a gently bent stroke with a slight wobble, and an open head, on a white halo
  function arrow(x1, y1, x2, y2, seed) {
    var rnd = function (k) { var v = Math.sin(seed * 9.13 + k * 3.7) * 43758.5453; return v - Math.floor(v); };
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, bend = (rnd(1) > .5 ? 1 : -1) * Math.min(36, len * 0.28);
    var c1x = x1 + dx * 0.25 + nx * bend + (rnd(2) - .5) * 4, c1y = y1 + dy * 0.25 + ny * bend + (rnd(3) - .5) * 4;
    var c2x = x1 + dx * 0.7 + nx * bend * 0.55, c2y = y1 + dy * 0.7 + ny * bend * 0.55;
    var d = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    var a = Math.atan2(y2 - c2y, x2 - c2x), h = 13, w = 0.5;
    var hd = 'M' + (x2 - h * Math.cos(a - w)).toFixed(1) + ' ' + (y2 - h * Math.sin(a - w)).toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + (x2 - h * Math.cos(a + w + 0.08)).toFixed(1) + ' ' + (y2 - h * Math.sin(a + w + 0.08)).toFixed(1);
    var L = Math.round(len * 1.25 + 30);
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + d + '" stroke="rgba(255,255,255,0.92)" stroke-width="7"/><path d="' + hd + '" stroke="rgba(255,255,255,0.92)" stroke-width="7"/>' +
      '<path class="ar" style="--l:' + L + '" d="' + d + '" stroke="#1C1C1E" stroke-width="2.6"/><path class="ar" style="--l:40" d="' + hd + '" stroke="#1C1C1E" stroke-width="2.6"/></g>';
  }
  // The guide circle (circle profiles, Oct 3). It always marks what to tap next: the control on screen, or the card's own
  // Next / Start when the step moves on from the card. It never appears straight on its target: on a new screen it enters
  // from where it was on the previous one (or from the Tour button when the tour starts) and moves there once the screen
  // has loaded and the target has held still for 300 ms; after that it follows the target.
  var DK = 'wf-tourdot', dotHold = false;   // dotHold: the circle is busy elsewhere (tapping the region in the picker)
  function dotAim(x, y) {
    if (WF_TOUR_HELI || !dot || dotHold) return;
    var now = Date.now();
    if (!dotP) { var m = null; try { m = JSON.parse(sessionStorage.getItem(DK) || 'null'); } catch (e) {}
      var sx = m && now - m.t < 15000 ? m.x : VW() / 2, sy = m && now - m.t < 15000 ? m.y : VH() + 60;
      dot.style.transition = 'none'; dot.style.left = sx + 'px'; dot.style.top = sy + 'px'; void dot.offsetWidth; dot.style.transition = '';
      dotP = { x: sx, y: sy, go: false }; dotA = { x: x, y: y, t: now }; dot.classList.add('on'); return; }
    if (!dotP.go) {
      if (!dotA || Math.abs(dotA.x - x) > 2 || Math.abs(dotA.y - y) > 2) { dotA = { x: x, y: y, t: now }; return; }
      if (now - dotA.t < 300 || document.readyState !== 'complete') return;
      dotP.go = true; }
    dotP.x = x; dotP.y = y; dot.style.left = x + 'px'; dot.style.top = y + 'px'; dot.classList.add('on');
    try { sessionStorage.setItem(DK, JSON.stringify({ x: x, y: y, t: now })); } catch (e) {}
  }
  function aimNext() { if (WF_TOUR_HELI || !bub) return; var g = bub.querySelector('.tg'); if (!g || !g.offsetWidth || g.disabled) { if (dot) dot.classList.remove('on'); return; }
    var r = g.getBoundingClientRect(); dotAim((r.left + r.right) / 2, (r.top + r.bottom) / 2); }
  function draw(i, st, el, late, low) {
    build();
    var pt = PT(), L = function (a) { return a ? (pt ? a[1] : a[0]) : ''; }, s0back = !!(get() || {}).b;   // achievements show when reached going forward, not when stepping back
    var key = i + '|' + (armed === i ? 'a' : '') + (el ? 1 : 0) + '|' + (late ? 1 : 0) + '|' + (pt ? 1 : 0);
    if (key !== lastKey) {
      lastKey = key; bub.classList.remove('on');
      var done0 = i < ((get() || {}).max || 0), nx = st.mode === 'next' || late || done0, nl = st.next ? L(st.next) : '';
      var CH = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; };
      var AC = st.ach && !s0back ? '<div class="ta"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg><span></span></div><p class="tth"></p>' : '';
      bub.innerHTML = AC + '<p class="tt"></p><p class="tx"></p><div class="tf"><span class="tn"></span><button type="button" class="te"></button>' +
        '<button type="button" class="tc tb0"' + (i ? '' : ' disabled') + '>' + CH('m15 6-6 6 6 6') + '</button>' +
        (nl && nx ? '<button type="button" class="tg"></button>' : '<button type="button" class="tc' + (nx ? ' tg' : '') + '"' + (nx ? '' : ' disabled') + '>' + CH('m9 6 6 6-6 6') + '</button>') + '</div>';
      var bb = bub.querySelector('.tb0'); bb.setAttribute('aria-label', pt ? 'Passo anterior' : 'Previous step'); bb.onclick = function (ev) { ev.stopPropagation(); back(i); };
      if (AC) { bub.querySelector('.ta span').textContent = L(st.ach); bub.querySelector('.tth').textContent = L(st.then); // (Oct 3, 21:16) an achievement is announced by its sound first: the "prlim" plays before anything changes on screen,
        // then the card appears (ACH_LEAD later), and the chip pops last with its swell
        var snd0 = 0; try { snd0 = +sessionStorage.getItem('wf-ach-snd') || 0; sessionStorage.removeItem('wf-ach-snd'); } catch (e) {}
        var taEl = bub.querySelector('.ta');
        // (Oct 5, 02:26) the sound plays the moment the tag appears; one that already appeared (and sounded) on the tap that brought this screen stays still
        if (!INFRAME && Date.now() - snd0 <= 8000) taEl.classList.add('still');
        else setTimeout(function () { if (!taEl.isConnected) return; taEl.classList.add('go'); prlim(); try { if (navigator.vibrate) navigator.vibrate([10, 60, 14]); } catch (e) {}
          if (INFRAME) { try { sessionStorage.setItem('wf-ach-snd', String(Date.now())); } catch (e) {} try { window.parent.__wfNavHold = Date.now() + 700; } catch (e) {} } }, ACH_LEAD + 520); }
      bub.querySelector('.tt').textContent = L(st.t);
      // the tour's "under construction" sign sits right after the first card's title (it used to be a warning before the tour)
      if (st.wip) { var wp = document.createElement('p'); wp.className = 'twip'; wp.textContent = '\u26A0\uFE0F ' + (pt ? 'Em construção' : 'Under construction'); bub.querySelector('.tt').insertAdjacentElement('afterend', wp); }
      if (st.show && armed === i) bub.querySelector('.tt').textContent = L(st.show.t);
      if (st.legend && armed === i) { bub.querySelector('.tt').textContent = pt ? 'Camada visível' : 'Layer shown'; }
      bub.querySelector('.tx').textContent = late && !el && !st.quiet ? (pt ? 'Este passo não está disponível agora. Toque em › para continuar.' : 'This step isn\'t available right now. Tap › to carry on.') : L(st.b);
      if (st.show && armed === i) bub.querySelector('.tx').textContent = L(st.show.b);
      if (st.legend && armed === i) bub.querySelector('.tx').textContent = pt ? 'Agora voltamos a escondê-la e seguimos, só com as ignições no mapa.' : 'Now we hide it again and move on, with only ignitions on the map.';
      bub.querySelector('.tn').textContent = (i + 1) + (pt ? ' de ' : ' of ') + S.length;
      var e = bub.querySelector('.te'); e.textContent = pt ? 'Terminar visita' : 'End tour'; e.onclick = function (ev) { ev.stopPropagation(); end(); };
      var g = bub.querySelector('.tg'); if (g) { if (nl) g.textContent = nl; else g.setAttribute('aria-label', pt ? 'Seguinte' : 'Next'); g.onclick = function (ev) { ev.stopPropagation(); var s0 = S[i], nxS = S[i + 1]; go(i + 1); if (s0.go && !(done0 && s0.mode !== 'next')) s0.go(); else if (nxS && nxS.page !== PAGE) { var at = location.href; try { history.forward(); } catch (x) {} setTimeout(function () { if (location.href === at) location.href = nxS.page; }, 500); } else tick(); }; }
      var showB = function () { requestAnimationFrame(function () { if (bub) bub.classList.add('on'); }); };
      var arrived = AC && !INFRAME && bub.querySelector('.ta.still');   /* (Oct 5) arrived with the card already shown on the rising panel: it is simply there, no second entrance */
      if (arrived) { bub.style.transition = 'none'; bub.classList.add('on'); requestAnimationFrame(function () { requestAnimationFrame(function () { if (bub) bub.style.transition = ''; }); }); } else if (AC) setTimeout(function () { if (lastKey === key) showB(); }, ACH_LEAD); else showB();
      svg.innerHTML = '';
      svg.__k = '';
    }
    var vw = VW(), vh = VH(), bw = Math.min(320, vw - 32), bh;
    bub.style.width = bw + 'px'; bh = bub.offsetHeight;
    if (low && el && !st.find) el = null;
    if (!el) { ring.style.display = 'none'; setTimeout(aimNext, 0); svg.innerHTML = ''; svg.__k = ''; setTimeout(function () { if (bub) heliPark(bub.getBoundingClientRect()); }, 0); bub.dataset.l = (vw - bw) / 2; bub.dataset.t = low === 'top' ? Math.max(180, vh * 0.4 - bh / 2) : low ? vh - bh - 40 : Math.max(16, (vh - bh) / 2); place(+bub.dataset.l, +bub.dataset.t); return; }
    var r = el.getBoundingClientRect(), big = r.height > vh * 0.45 || r.width > vw * 0.96 && r.height > 160;
    var pad = 6, T = { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
    if (big) { ring.style.display = 'none'; setTimeout(aimNext, 0); svg.innerHTML = ''; setTimeout(function () { if (bub) heliPark(bub.getBoundingClientRect()); }, 0); bub.dataset.l = (vw - bw) / 2; bub.dataset.t = vh - bh - 40; place(+bub.dataset.l, +bub.dataset.t); return; }
    var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
    // blue circle guide: centred on the control, the yellow frame off (the helicopter profile keeps the frame)
    if (!WF_TOUR_HELI) { if (st.mode === 'next' && !st.point) setTimeout(aimNext, 0); else dotAim((r.left + r.right) / 2, (r.top + r.bottom) / 2); }
    ring.style.display = WF_TOUR_HELI ? 'block' : 'none'; var RL = Math.max(3, T.l), RR = Math.min(vw - 3, T.r); ring.style.left = RL + 'px'; ring.style.top = T.t + 'px'; ring.style.width = (RR - RL) + 'px'; ring.style.height = (T.b - T.t) + 'px'; ring.style.borderRadius = Math.min(999, rad + pad) + 'px';
    var gap = 76, below = vh - T.b - 32, above = T.t - 16, up;
    if (below >= bh + gap) up = false; else if (above >= bh + gap) up = true; else up = above > below;
    var cx = (T.l + T.r) / 2, left = Math.min(vw - 16 - bw, Math.max(16, cx - bw / 2));
    var top = up ? Math.max(16, T.t - gap - bh) : Math.min(vh - 32 - bh, T.b + gap);
    // never cover the target or an open map tooltip: try the other side, then the top or bottom of the screen
    var OB = [T].concat([].slice.call(document.querySelectorAll('[data-wf-pop]')).map(function (p) { var q0 = p.getBoundingClientRect(); return q0.width ? { l: q0.left - 8, t: q0.top - 8, r: q0.right + 8, b: q0.bottom + 8 } : null; }).filter(Boolean));
    var hits = function (y) { return OB.some(function (o) { return left < o.r && left + bw > o.l && y < o.b && y + bh > o.t; }); };
    if (hits(top)) { var alts = [up ? Math.min(vh - 32 - bh, T.b + gap) : Math.max(16, T.t - gap - bh), vh - 32 - bh, 16], f = alts.find(function (y) { return !hits(y); }); if (f != null) { up = f + bh / 2 < (T.t + T.b) / 2; top = f; } }
    bub.dataset.l = left; bub.dataset.t = top; place(left, top); top = parseFloat(bub.style.top); left = parseFloat(bub.style.left);
    // the guide helicopter hovers over the control, its bucket pointing at it (no arrow)
    svg.innerHTML = ''; svg.__k = '';
    heliAim(T, { top: top, height: bh, left: left, width: bw }, up);
  }


  // ---- the guide helicopter (Oct 3) ---------------------------------------------------------------------------
  // Instead of an arrow, the Tour button's helicopter takes off (growing 20%) and flies to each control to tap, hovering
  // over it with its water bucket pointing at it (the cable a damped pendulum). It flies from one focus to the next;
  // when the tour changes screen it slides out to one side and comes back in from the opposite side on the next screen.
  var HK = 'wf-heli', ORDER = { 'Main.dc.html': 0, 'Alert.dc.html': 1, 'Chat.dc.html': 2, 'Dispatch.dc.html': 3 };
  var H = null, NSV = 'http://www.w3.org/2000/svg', SC = 1.4, HOOKU = [11.5, 15], BUCK = 8;   // 28px icon at 120%: 1.4px per unit
  var heliPaths = '<path class="wf-rot" d="M2.5 5h15"></path><path class="wf-rot2" d="M9.79 5h0.42"></path><path d="M10 5v3M5 8h8a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3Z M13 8.2V12h3.9M17 11.5h4.5M21.5 9.5v4M7 19h9.5M9 15v4M14 15v4"></path>';
  function tourBtnIcon() { return document.querySelector('[data-wf-tourbtn] .wf-heli'); }
  function heliMake() {
    if (!WF_TOUR_HELI) return { svg: { isConnected: false } };   // blue circle profiles: no helicopter
    if (H && H.svg.isConnected) return H;
    var o = document.createElementNS(NSV, 'svg'); o.id = 'wf-tourheli'; o.setAttribute('aria-hidden', 'true');
    o.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;overflow:visible;pointer-events:none;z-index:99992;color:#2C2C2E';
    // a white halo under every line (drawn as wider white strokes, cheaper than a filter) keeps it readable on maps and photos
    var bk = '<path d="M-3 0L3 0M-1.5 -2L-3 0M1.5 -2L3 0"></path><path d="M-3.8 0h7.6l-1.1 6.4a1.8 1.8 0 0 1 -1.8 1.4h-1.8a1.8 1.8 0 0 1 -1.8 -1.4Z"></path>';
    o.innerHTML = '<line class="lh" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.5"></line><line class="lc" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-opacity="0.4"></line>' +
      '<g class="hb" fill="none" stroke-linejoin="round" stroke-linecap="round"><g stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="3.3">' + bk + '</g><g stroke="currentColor" stroke-width="1.3">' + bk.replace('Z"></path>', 'Z" fill="rgba(var(--wf-y-rgb,229,255,0),.35)"></path>') + '</g></g>' +
      '<g class="hh" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="2.6">' + heliPaths + '</g><g stroke="currentColor" stroke-width="1.3">' + heliPaths + '</g></g>';
    if (!document.getElementById('wf-tourheli-css')) { var cs = document.createElement('style'); cs.id = 'wf-tourheli-css';
      cs.textContent = '#wf-tourheli .wf-rot{animation:wfTRot .3s step-end infinite}#wf-tourheli .wf-rot2{opacity:0;animation:wfTRot2 .3s step-end infinite}@keyframes wfTRot{0%{opacity:1}50%{opacity:0}}@keyframes wfTRot2{0%{opacity:0}50%{opacity:1}}@media (prefers-reduced-motion:reduce){#wf-tourheli .wf-rot,#wf-tourheli .wf-rot2{animation:none}}';
      document.head.appendChild(cs); }
    document.body.appendChild(o);
    var keep = H;
    H = { svg: o, ln: o.querySelector('.lc'), lh: o.querySelector('.lh'), bk: o.querySelector('.hb'), hh: o.querySelector('.hh'),
      x: keep ? keep.x : -60, y: keep ? keep.y : 120, vx: 0, vy: 0, tx: null, ty: null, L: 30, tL: 30, sc: keep ? keep.sc : 1.2, tsc: 1.2,
      flip: keep ? keep.flip : 1, fl: keep ? keep.fl : 1, phi: 0, w: 0, pp: null, pv: null, t: 0, last: 0, gone: false, land: null, exitX: null };
    if (!heliLoop.on) { heliLoop.on = true; requestAnimationFrame(heliLoop); }
    return H;
  }
  // hook point (where the cable leaves the belly) for a bucket tip at (x, y)
  function heliAt(x, y, L) { var h = heliMake(); h.tL = L; h.tx = x; h.ty = y - L - BUCK; h.exitX = null; }
  function heliAim(T, bub0, up) {
    var cx = (T.l + T.r) / 2, tipY = T.t - 2, room = tipY - BUCK - 10 - 24 * 1.4 * 0.2 - 22;   // space above for cable and body
    if (up && bub0) room = Math.min(room, tipY - (bub0.top + bub0.height) - 6);
    if (room >= 10 + 22) { heliAt(cx, tipY, Math.min(34, room - 22)); return; }
    // no room above: hover beside it, the bucket at its side, on whichever side has room
    var vw = VW(), side = T.r + 46 < vw ? 1 : -1, x = side > 0 ? T.r + 8 : T.l - 8;
    heliAt(x, (T.t + T.b) / 2 + 2, 14);
  }
  function heliPark(bub0) { if (!bub0) return; heliAt(bub0.left + bub0.width - 40, bub0.top - 4, 14); }
  function heliExit(toPage) {
    var h = H; if (!h) return; var dir = (ORDER[toPage] == null ? 1 : ORDER[toPage]) >= (ORDER[PAGE] || 0) ? -1 : 1;   // deeper: out to the left, in from the right
    h.exitX = dir < 0 ? -80 : VW() + 80; h.tx = h.exitX; h.ty = h.y;
    try { sessionStorage.setItem(HK, JSON.stringify({ y: h.y, from: dir < 0 ? 'right' : 'left', sc: h.sc, t: Date.now() })); } catch (e) {}
  }
  function heliEnter() {
    var h = heliMake(), m = null; try { m = JSON.parse(sessionStorage.getItem(HK) || 'null'); } catch (e) {}
    if (m && Date.now() - m.t < 15000) { h.x = m.from === 'right' ? VW() + 80 : -80; h.y = m.y; h.flip = h.fl = m.from === 'right' ? 1 : -1; h.sc = h.tsc = 1.2; }
    else { var ic = tourBtnIcon(), r = ic && ic.getBoundingClientRect(); if (r && r.width) { h.x = r.left + HOOKU[0] * 28 / 24; h.y = r.top + HOOKU[1] * 28 / 24; h.sc = 1; h.flip = h.fl = 1; } else { h.x = VW() + 80; h.y = VH() * 0.4; } }
    h.vx = h.vy = 0; h.pp = h.pv = null; try { sessionStorage.removeItem(HK); } catch (e) {}
  }
  function heliTakeOff() { if (!WF_TOUR_HELI) return; var h = heliMake(), ic = tourBtnIcon(), r = ic && ic.getBoundingClientRect(); try { sessionStorage.removeItem(HK); } catch (e) {}
    if (r && r.width) { h.x = r.left + HOOKU[0] * 28 / 24; h.y = r.top + HOOKU[1] * 28 / 24; h.sc = 1; h.flip = h.fl = 1; h.vx = h.vy = 0; h.L = h.tL = 22; h.pp = h.pv = null; }
    h.tsc = 1.2; heliHome(true); }
  function heliHome(hide) { var b = document.querySelector('[data-wf-tourbtn]'); if (!b) return; [].forEach.call(b.querySelectorAll('.wf-heli,.wf-cable'), function (e) { e.style.visibility = hide ? 'hidden' : ''; }); }
  function heliLand() {
    var h = H; if (!h) return; try { sessionStorage.removeItem(HK); } catch (e) {}
    var ic = tourBtnIcon(), r = ic && ic.getBoundingClientRect();
    if (r && r.width) { h.land = true; h.tsc = 1; heliAt(r.left + HOOKU[0] * 28 / 24, r.top + HOOKU[1] * 28 / 24 + 22 + BUCK, 22); }
    else { h.exitX = VW() + 80; h.tx = h.exitX; h.land = true; }
  }
  function heliLoop(now) {
    requestAnimationFrame(heliLoop);
    var h = H; if (!h || !h.svg.isConnected) return;
    var dt = h.last ? Math.min(0.033, (now - h.last) / 1000) : 0.016; h.last = now; if (dt < 0.004) return; h.t += dt;
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!h.land && (h.hid = (h.hid || 0) + 1) % 20 === 1) heliHome(true);   // the button's own helicopter is the one flying
    if (h.tx != null) {
      var bob = h.exitX == null && !h.land ? Math.sin(h.t * 1.7) * 2.5 : 0, k = h.exitX != null ? 14 : 7.5, c = 2 * Math.sqrt(k);   // critically damped: no overshoot
      if (still) { h.x = h.tx; h.y = h.ty + bob; h.vx = h.vy = 0; }
      else { var ax = k * (h.tx - h.x) - c * h.vx, ay = k * (h.ty + bob - h.y) - c * h.vy; h.vx += ax * dt; h.vy += ay * dt;
        var sp = Math.hypot(h.vx, h.vy), mx = 900; if (sp > mx) { h.vx *= mx / sp; h.vy *= mx / sp; } h.x += h.vx * dt; h.y += h.vy * dt; }
    }
    h.sc += (h.tsc - h.sc) * Math.min(1, dt * 5); h.L += (h.tL - h.L) * Math.min(1, dt * 4);
    // it faces where it flies (a quick turn), nose dipping with speed
    if (Math.abs(h.vx) > 70) h.flip = h.vx < 0 ? 1 : -1; h.fl += (h.flip - h.fl) * Math.min(1, dt * 7);
    var tilt = Math.max(-16, Math.min(16, h.fl * h.vx * 0.035));
    h.hh.setAttribute('transform', 'translate(' + h.x.toFixed(2) + ' ' + h.y.toFixed(2) + ') scale(' + (h.fl * SC * h.sc / 1.2).toFixed(3) + ' ' + (SC * h.sc / 1.2).toFixed(3) + ') rotate(' + tilt.toFixed(2) + ') translate(' + -HOOKU[0] + ' ' + -HOOKU[1] + ')');
    // the bucket on its cable: a damped pendulum hung from the hook, swung by the helicopter's own acceleration
    var px = h.x, py = h.y, G = 520, L = Math.max(8, h.L);
    if (still) { h.phi = 0; h.w = 0; }
    else { var axp = 0, ayp = 0; if (h.pp) { var vx0 = (px - h.pp[0]) / dt, vy0 = (py - h.pp[1]) / dt; if (h.pv) { axp = (vx0 - h.pv[0]) / dt; ayp = (vy0 - h.pv[1]) / dt; } h.pv = [vx0, vy0]; } h.pp = [px, py];
      axp = Math.max(-3000, Math.min(3000, axp)); ayp = Math.max(-3000, Math.min(3000, ayp));
      var acc = -((G + ayp) * Math.sin(h.phi) + axp * Math.cos(h.phi)) / L - 1.6 * h.w + 0.35 * Math.sin(h.t * 3.1);
      h.w += acc * dt; h.phi = Math.max(-1.1, Math.min(1.1, h.phi + h.w * dt)); if (!isFinite(h.phi)) { h.phi = 0; h.w = 0; } }
    var bx = px + L * Math.sin(h.phi), by = py + L * Math.cos(h.phi);
    [h.ln, h.lh].forEach(function (l) { l.setAttribute('x1', px.toFixed(2)); l.setAttribute('y1', py.toFixed(2)); l.setAttribute('x2', bx.toFixed(2)); l.setAttribute('y2', by.toFixed(2)); });
    h.bk.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' ' + by.toFixed(2) + ') rotate(' + (-h.phi * 180 / Math.PI).toFixed(2) + ')');
    // landed back on the Tour button: hand over to the button's own helicopter
    if (h.land && h.tx != null && Math.hypot(h.tx - h.x, h.ty - h.y) < 1.5 && Math.abs(h.sc - 1) < 0.02) { h.svg.remove(); H = null; heliHome(false); }
    if (h.land && h.exitX != null && (h.x < -60 || h.x > VW() + 60)) { h.svg.remove(); H = null; heliHome(false); }
  }
  // ---- the loop ---------------------------------------------------------------------------------------------
  function tick() {
    // (Oct 5, 03:12) on the rising panel (the next screen preloaded in a frame) only an achievement card is drawn, so its tag
    // animates there with the sound (played by the screen underneath, the one that had the tap); nothing else runs in the frame
    if (INFRAME) { var s9 = get(), st9 = s9 && S[s9.i]; if (!st9 || !st9.ach || st9.page !== PAGE) return; }
    var s = get(); if (!s) { if (root) end(); return; }
    var i = s.i, st = S[i]; if (!st) { end(); return; }
    if (st.page !== PAGE) {
      // Reached the next screen another way (e.g. View on the map instead of the list): carry on from that screen's
      // first step. Only once per page load, and only to the very next screen of the tour, never further ahead.
      if (!jumped) { jumped = true; var k = i + 1; while (k < S.length && S[k].page === st.page) k++; if (S[k] && S[k].page === PAGE) { put({ i: k }); seen = 0; scrolled = false; ran = false; return tick(); } }
      if (root) { root.remove(); root = null; lastKey = ''; } return;
    }
    jumped = true;
    if (i !== cur && S[i] && !INFRAME) runDemo(i, S[i]);
    if (i !== cur) { holdI = -1; tiltN = null; tiltNG = null; tiltV = 0; tiltVX = 0; cur = i; seen = Date.now(); scrolled = false; ran = false; lastKey = ''; }
    unshift();
    if (!ran && st.before && !INFRAME) { ran = true; try { st.before(); } catch (e) {} }
    // the area picker belongs to the region step only: anywhere else it is closed, so the step's control is in view
    if (PAGE === 'Main.dc.html' && !st.area && areaOpen()) { areaClose(); return; }
    if (st.skip && st.skip()) { go(i + 1); return; }
    if (st.closeAfter && armed === i && !areaOpen()) { go(i + 1); return; }   // the area list was opened and is closed again
    if (st.mode === 'until' && st.until && st.until()) { go(i + 1); return; }
    if (st.auto && Date.now() - (window.__wfTourAuto || 0) > 2600 && Date.now() - seen > 2200) { window.__wfTourAuto = Date.now(); drive(); }
    if (st.show && armed === i) { curEl = null; draw(i, st, null, false, true); return; }
    if (st.hold && holdTick(i, st)) return;
    var el = st.lock && lockEl && lockEl.isConnected && lockI === i ? lockEl : (st.find ? st.find() : null); if (st.lock && el) { lockEl = el; lockI = i; }
    var sh0 = el && shown(el, st.strict); if (el && (sh0 === 'off' || sh0 === 'part') && !scrolled) { scrolled = true; try { var rr = el.getBoundingClientRect(), vOut = rr.bottom > VH() - 24 || rr.top < 24, hOut = rr.left < 0 || rr.right > VW(); reveal(el, vOut, hOut); } catch (e) {} }
    if (el) { var sh1 = shown(el, st.strict); if (sh1 !== true && !(sh1 === 'part' && scrolled)) el = null; }
    var late = st.find && !el && Date.now() - seen > (st.mode === 'until' && !s.b ? 1e9 : s.b ? 1500 : 9000);
    if (st.find && !el && !late) { curEl = null; draw(i, st, null, false, 'top'); return; }   // waiting just above the middle: clear of the header (pinned state, title) and of the controls that sit low   // still waiting for its control: the bubble stays, End tour always reachable
    curEl = el; draw(i, st, el, late, st.low); window.__wfTour.el = el; window.__wfTour.i = i;
  }
  // Hold steps (Oct 3, Key figures): the card is placed once and stays still (no re-placing, no flicker) while the page
  // scrolls by itself, slowly, until the step's last row of cards sits above the tour card (Oct 3, 19:53; it used to go to
  // the end); any touch, wheel or scroll by the person stops it.
  // The circle stays on the area the card talks about, kept on screen.
  var holdI = -1, asRun = null;
  function holdTick(i, st) {
    var el = st.find ? st.find() : null;
    if (holdI !== i) { if (!el || !shown(el)) return false; holdI = i; draw(i, st, null, false, st.low);   // the card sits low and still; the page starts from its top
      for (var n0 = el.parentElement; n0 && n0 !== document.body; n0 = n0.parentElement) if (scrollable(n0, 'y')) { n0.scrollTop = 0; break; } if (st.tourScroll) { var t0 = Date.now(), wait = function () { var s0 = get(); if (!s0 || s0.i !== i) return; var ta = bub && bub.querySelector('.ta');
          // (Oct 3, 19:53) the achievement chip and its sound come first; the page starts scrolling once the chip has landed
          if (ta && !ta.classList.contains('go') && Date.now() - t0 < 4000) { setTimeout(wait, 100); return; } setTimeout(function () { var s1 = get(); if (s1 && s1.i === i) autoScroll(el, i); }, ta ? 900 : 0); };
        setTimeout(wait, 1000); } return true; }
    if (el && !WF_TOUR_HELI) { var r = el.getBoundingClientRect(), y = Math.max(r.top + 40, Math.min(r.bottom - 40, VH() / 2)); var cb = bub ? bub.getBoundingClientRect().top - 56 : VH() - 150; y = Math.max(150, Math.min(cb, y)); dotAim((r.left + r.right) / 2, y); }
    return true;
  }
  function autoScroll(el, i) {
    var sc = null; for (var n = el.parentElement; n && n !== document.body; n = n.parentElement) if (scrollable(n, 'y')) { sc = n; break; }
    if (!sc) return; var stop = false, last = 0, pos = sc.scrollTop;
    // (Oct 3, 20:58) it scrolls until the step's section (its label, e.g. Key figures) sits at the top of the page, just under
    // the fixed header, so the whole group of cards shows above the tour card
    var secEl = el.closest('section[aria-label]') || el, sct = sc.getBoundingClientRect().top;
    var maxPos = Math.max(pos, Math.min(sc.scrollHeight - sc.clientHeight, pos + (secEl.getBoundingClientRect().top - sct - 12)));
    var halt = function () { stop = true; ['pointerdown', 'touchstart', 'wheel'].forEach(function (t) { document.removeEventListener(t, halt, true); }); };
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (t) { document.addEventListener(t, halt, { capture: true, passive: true }); });
    var step = function (t) { var s0 = get(); if (stop || !s0 || s0.i !== i || !sc.isConnected) { halt(); return; }
      if (Math.abs(sc.scrollTop - pos) > 2) { halt(); return; }   // scrolled by hand (momentum, scrollbar): stop
      var dt = last ? Math.min(50, t - last) : 16; last = t; pos = Math.min(maxPos, pos + TOUR_SPEED * dt / 1000); sc.scrollTop = pos;
      if (pos >= maxPos - 0.5) { halt(); return; } requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // Plays the fire owner in the chat: taps the request card's main button, else the suggestion that moves the fire on
  var selfTap = false, lockEl = null, lockI = -1, armed = -1;
  // The control the tour presses next as the fire owner: a card's main action (Approve, Close fire), else a stage chip;
  // a chat still left as a candidate (an earlier tour) is confirmed first. Never Dismiss or anything else.
  function autoNext() {
    var g0 = get(), st1 = g0 && S[g0.i], noClose = st1 && st1.noClose;
    var b = q('article.chmsg [data-fitrow] > button.chbtn:not(.wf-sec)', function (x) { var t = txt(x); return !x.disabled && (/^(Approve|Aprovar)/.test(t) || (!noClose && /^(Close fire|Encerrar incêndio)/.test(t))); });
    if (b) return b;
    var W = ['Declare fire', 'Declarar incêndio', 'Move to', 'Passar a', 'Air support', 'Meio aéreo'].concat(noClose ? [] : ['Close fire', 'Encerrar incêndio']);
    return q('button.chbtn', function (x) { if (!x.parentElement || x.parentElement.style.maxHeight !== '88px') return false; var t = txt(x); return W.some(function (w) { return t.indexOf(w) === 0; }); });
  }
  function drive() { var b = autoNext();
    // (Oct 5, 03:21) moving the fire on by itself: when no suggestion moves it, the state card's own Move to button does (never to Closed)
    if (!b) { var g = get(), st = g && S[g.i]; if (st && st.stages) { var m = stMove(); if (m && !/Closed|Encerrad/.test(m.textContent || '')) b = m; } }
    if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; } }
  // Tour mode is modal: only the bubble and the control it points at take touches (scrolling still works).
  var curEl = null;
  function allowed(e) {
    if (selfTap || !get() || !root || !root.isConnected) return true;
    if (e.target && e.target.closest && e.target.closest('#wf-tourwarn')) return true;
    var s0 = get(), st0 = s0 && S[s0.i]; if (st0 && st0.page !== PAGE) return true;   // the tour has moved to another screen: this one is being left, nothing is blocked
    if (st0 && st0.free && st0.page === PAGE) return true;   // a step to play with the screen freely
    if (st0 && st0.page === PAGE && st0.find && !curEl && !(st0.show && armed === s0.i)) return true;   // nothing to point at yet: never lock the screen
    if (e.target && e.target.closest && e.target.closest('#wf-tour')) return true;
    // iPhone: the app lays an invisible haptic layer (#wf-hapov) over the touched control and passes the tap on to it;
    // judge the tap by the control underneath
    var hv = e.target && e.target.closest && e.target.closest('#wf-hapov');
    if (hv && hv.__t) { if (hv.__t.closest && hv.__t.closest('#wf-tour')) return true; e = { target: hv.__t, clientX: e.clientX, clientY: e.clientY, changedTouches: e.changedTouches }; }
    // the control is looked up again at the moment of the touch: maps and lists redraw their items while touched
    var s = get(), st = s && S[s.i], el = st && st.page === PAGE ? (st.lock && lockEl && lockEl.isConnected ? lockEl : st.find ? st.find() : null) : null; if (!el && curEl && curEl.isConnected) el = curEl;
    if (st && st.also && e.target && e.target.closest && e.target.closest(st.also)) return true;   // e.g. View on the map summary
    if (!el) return false;
    if (st && st.mode === 'next' && !st.interact) return false;
    if (el === e.target || el.contains(e.target)) return true;
    var p = e.changedTouches && e.changedTouches[0] || e, r = el.getBoundingClientRect();
    return p.clientX >= r.left - 4 && p.clientX <= r.right + 4 && p.clientY >= r.top - 4 && p.clientY <= r.bottom + 4;
  }
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click', 'contextmenu'].forEach(function (t) {
    window.addEventListener(t, function (e) { if (allowed(e)) return; e.stopPropagation(); e.stopImmediatePropagation(); if (t === 'click' || t === 'contextmenu') e.preventDefault(); }, { capture: true, passive: false });
  });
  // a tap on the control a 'tap' step points at moves the tour on (the tap itself still does its job)
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#wf-hapov')) return;   // iPhone: the haptic layer's own click; the tap passed on to the control moves the tour on
    var s = get(); if (!s) return; var st = S[s.i]; if (!st || st.mode !== 'tap' || st.page !== PAGE || !st.find || armed === s.i) return;
    var el = st.lock && lockEl && lockEl.isConnected ? lockEl : st.find(); if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;   // a tap on a control that is still disabled doesn't count
    // the tap is on the control, or lands inside its area (some map bands pass taps through to the control underneath)
    var r = el.getBoundingClientRect(), inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && (e.clientX || e.clientY);
    if (el === e.target || el.contains(e.target) || inside) { if (st.closeAfter) { armed = s.i; return; }
      if (st.show) { armed = s.i; var at2 = s.i, sh = st.show; setTimeout(function () { var s3 = get(); if (!s3 || s3.i !== at2) return; selfTap = true; try { sh.close(); } catch (x) {} selfTap = false; go(at2 + 1); tick(); }, sh.ms); return; }
      if (st.legend) { armed = s.i; var at = s.i, chipEl = el.closest ? el : el; setTimeout(function () { var s2 = get(); if (!s2 || s2.i !== at) return; var on = q('[data-wf-leg] button[aria-pressed="true"]', function (b) { return b.getAttribute('aria-label') === chipEl.getAttribute('aria-label') || b === chipEl; }) || chipEl; selfTap = true; try { (chipEl.isConnected ? chipEl : on).click(); } catch (x) {} selfTap = false; go(at + 1); tick(); }, 2400); return; } var was = s.i; go(s.i + 1); setTimeout(tick, 60);
      // 3) never lost: if the tap should have opened the next screen and nothing happened, the step comes back so it can be tapped again
      if (S[was + 1] && S[was + 1].page !== PAGE) setTimeout(function () { var s4 = get(); if (s4 && s4.i === was + 1) { put({ i: was, max: s4.max || was }); cur = -1; lastKey = ''; tick(); } }, 2000); }
  }, true);
  // Edge glows follow the card (circle-guide profiles): 110% of the card's height, centred on it, every frame (drags included)
  var glowF = { v: 1, t: 0 };
  function glowSync() {
    if (WF_TOUR_HELI || !root || !bub || !root.isConnected) return;
    root.classList.toggle('drag', bub.classList.contains('drag'));
    var r = bub.getBoundingClientRect(), G = root.querySelectorAll('.tgl');
    // the card is away (fading out for a blade demo, or between steps): the glows fade away with it and come back with it (Oct 3, 12:45)
    var away = !r.height || !bub.classList.contains('on') || root.classList.contains('demo'), nowF = performance.now(), dtF = glowF.t ? Math.min(0.05, (nowF - glowF.t) / 1000) : 0.016;
    glowF.t = nowF; glowF.v += ((away ? 0 : 1) - glowF.v) * Math.min(1, dtF / 0.12);
    if (away) { for (var j = 0; j < G.length; j++) G[j].style.setProperty('--gk', ((+G[j].dataset.gk || 1.44) * glowF.v).toFixed(3)); return; }
    var h = r.height * 1.1, t = r.top + r.height / 2 - h / 2;   // 110% of the card's height, centred on it
    // Magnetism: the edge the card comes near swells and brightens; the far edge shrinks and dims
    var vw = VW(), k = Math.max(-1, Math.min(1, ((vw - r.right) - r.left) / Math.max(1, vw - r.width - 16)));   // full effect at the 8px limit the card can be dragged to   // +1: card at the left edge, -1: at the right
    for (var i = 0; i < G.length; i++) { var sg = G[i].classList.contains('l') ? k : -k;
      var hh = sg < 0 ? h * (1 + 0.2 * sg) : h * (1 + 0.3 * sg), tt = r.top + r.height / 2 - hh / 2;   // the far edge is also up to 20% shorter, still centred
      G[i].style.top = tt.toFixed(1) + 'px'; G[i].style.height = hh.toFixed(1) + 'px';
      G[i].style.width = (37.2 * (sg > 0 ? (1 + 0.55 * sg) * (1 + 0.2 * sg) * (1 + 0.25 * sg) * (1 + 0.2 * sg) : 1 + 0.6 * sg)).toFixed(1) + 'px'; G[i].style.setProperty('--gbl', (2 * (sg > 0 ? 1 + 0.2 * sg : 1 - 0.1 * sg)).toFixed(2) + 'px'); var gk = 1.44 * (sg > 0 ? 1 + 0.2 * sg : 1 + 0.45 * sg); G[i].dataset.gk = gk; G[i].style.setProperty('--gk', (gk * glowF.v).toFixed(3)); /* both edges +20% wide and +20% opacity (Oct 3) */ }   // near edge: up to +55% wide, +20% opacity; far edge: -60% wide, -45% opacity, -20% tall
  }
  // Tilt (Oct 3): held between 30° and 50° the card stays put; tilted flatter (below 30°, down to -30°) it slides up, more
  // upright (above 50°, to 90° and past) it slides down, faster the further past the band. Never while it is being dragged.
  var TILT_ON = false;   // tilt switched off for now (Oct 3, 13:32): the card moves only by dragging; set true to bring it back
  var tiltB = null, tiltG = null, tiltT = 0, tiltV = 0, tiltVX = 0, tiltN = null, tiltNG = null, tiltLock = -1, tiltBump = 0, tiltBumped = false;
  window.addEventListener('deviceorientation', function (e) { if (e && typeof e.beta === 'number') tiltB = e.beta; if (e && typeof e.gamma === 'number') tiltG = e.gamma; });
  function askTilt() { if (!TILT_ON) return; try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().catch(function () {}); } catch (e) {} }
  function tiltSync(now) {
    var dt = tiltT ? Math.min(0.05, (now - tiltT) / 1000) : 0; tiltT = now;
    if (!TILT_ON) { tiltV = 0; tiltVX = 0; return; }
    if (tiltB == null || !dt || !root || !bub || !root.isConnected || !bub.classList.contains('on') || bub.classList.contains('drag')) { tiltV = 0; tiltVX = 0; return; }
    var sL = get(); if (sL && tiltLock === sL.i) { tiltV = 0; tiltVX = 0; return; }   // dragged in this step: it stays where it was put until the next step
    var b = tiltB, v = 0;
    // still within 10° either side of the resting angle (taken at the start of each step); past it, flatter slides up and more upright slides down, full speed 40° past the still zone (Oct 3, 12:20)
    if (tiltN == null) tiltN = b;
    var d0 = b - tiltN;
    if (d0 < -10) v = -Math.min(1, (-10 - d0) / 40); else if (d0 > 10) v = Math.min(1, (d0 - 10) / 40);
    // the angle sets a target speed (36 px/s just past the band, 1071 px/s at full tilt; +70% at 12:11); the card accelerates towards it and
    // decelerates smoothly back to rest inside the band (Oct 3: max +50%, slowest -10%)
    var spd = function (x) { return x ? (x < 0 ? -1 : 1) * (36 + (1071 - 36) * Math.pow(Math.abs(x), 1.4)) : 0; };
    var target = spd(v);
    // sideways (Oct 3, 12:25): tilting left or right slides the card left or right, with the same still zone and speeds
    var hv = 0;   // sideways tilt removed (Oct 3, 12:55): it clashed with the screen turning
    var targetX = spd(hv);
    // rubber bump (Oct 3, 12:55): hitting the top or bottom throws the card back by an amount set by the impact speed; it then
    // coasts to a stop and goes back to following the tilt
    if (now < tiltBump) { tiltV *= Math.exp(-dt / 0.12); target = 0; }
    else tiltV += (target - tiltV) * Math.min(1, dt / 0.22);
    tiltVX += (targetX - tiltVX) * Math.min(1, dt / 0.22);
    if (Math.abs(tiltVX) < 2 && !targetX) tiltVX = 0;
    if (Math.abs(tiltV) < 2 && !target && now >= tiltBump) tiltV = 0;
    if (!tiltV && !tiltVX) return;
    var s0 = get(); if (!s0) return; if (drag.i !== s0.i) { drag.i = s0.i; drag.dx = 0; drag.dy = 0; }
    var l = +bub.dataset.l, t = +bub.dataset.t; if (!isFinite(l) || !isFinite(t)) return;
    var before = drag.dy, beforeX = drag.dx; drag.dy += tiltV * dt; drag.dx += tiltVX * dt; place(l, t); drag.dy = parseFloat(bub.style.top) - t; drag.dx = parseFloat(bub.style.left) - l;   // kept on screen: no build-up past the edges
    var hitE = Math.abs(drag.dy - before - tiltV * dt) > 0.5;
    var topNow = parseFloat(bub.style.top), farE = topNow > 68 && topNow < VH() - bub.offsetHeight - 68; if (farE) tiltBumped = false;   // one bounce per arrival at an edge
    if (hitE && !tiltBumped && Math.abs(tiltV) > 280 && now >= tiltBump) { tiltV = -tiltV * 0.3; tiltBump = now + 380; tiltBumped = true; }   // bumped a screen edge hard enough to bounce
    else if (hitE && now >= tiltBump) tiltV = 0;   // a soft touch settles against the edge
    if (Math.abs(drag.dx - beforeX) < 0.01 && Math.abs(tiltVX * dt) > 0.5) tiltVX = 0;
  }
  (function gl(now) { try { tiltSync(now || performance.now()); glowSync(); } catch (e) {} requestAnimationFrame(gl); })();
  var last = 0, loop = function (t) { if (t - last > 80) { last = t; try { if (get()) tick(); } catch (e) {} } requestAnimationFrame(loop); };
  var boot = function () { requestAnimationFrame(loop); try { if (get()) heliEnter(); } catch (e) {} try { if (!get() && PAGE === 'Main.dc.html') setTimeout(flyHome, 400); } catch (e) {} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('pageshow', function () { lastKey = ''; cur = -1; });
})();

// The guide on its own (Oct 4): no card, no steps. The light circle sits on one control, swells now and then as if tapping it, and
// follows it when the page scrolls (it stays on a fixed header control). It stops when the control is tapped, or off() is called.
//   window.__wfNudge.on(selector, flagKey)  flagKey: the sessionStorage flag that keeps it alive across screens until the control is used
(function () {
  if (window.__wfMenuOnly || window.__wfNudge || typeof document === 'undefined') return;
  var el = null, dot = null, gl = [], raf = 0, sel = '', flag = '', last = 0, shown = false;
  function css() { if (document.getElementById('wf-nudge-css')) return; var st = document.createElement('style'); st.id = 'wf-nudge-css';
    st.textContent = '#wf-nudge{position:fixed;left:0;top:0;z-index:99990;width:80px;height:80px;margin:-40px 0 0 -40px;box-sizing:border-box;border-radius:50%;background:rgba(var(--wf-y-rgb,229,255,0),0.3);box-shadow:inset 0 0 0 2px rgba(var(--wf-y-rgb,229,255,0),0.95),0 0 0 1px rgba(28,28,30,0.35);pointer-events:none;opacity:0;transition:opacity .35s ease;animation:wfnd 1.8s infinite}#wf-nudge.on{opacity:1}' +
      '.wf-ndg{position:fixed;z-index:99989;width:31px;height:0;opacity:0;pointer-events:none;filter:blur(2px);transition:opacity .35s ease,height .35s ease,top .35s ease}.wf-ndg.on{opacity:1;animation:wfndg 1.8s ease-in-out infinite}.wf-ndg.l{left:0;background:linear-gradient(90deg,rgba(var(--wf-y-rgb,229,255,0),.95) 0,rgba(var(--wf-y-rgb,229,255,0),.55) 4px,transparent 100%)}.wf-ndg.r{right:0;background:linear-gradient(270deg,rgba(var(--wf-y-rgb,229,255,0),.95) 0,rgba(var(--wf-y-rgb,229,255,0),.55) 4px,transparent 100%)}@keyframes wfndg{0%,100%{opacity:1}50%{opacity:.4}}@media (prefers-reduced-motion:reduce){.wf-ndg.on{animation:none}}' +
      '@keyframes wfnd{0%,100%{transform:translate(var(--x),var(--y)) scale(1)}50%{transform:translate(var(--x),var(--y)) scale(1.1)}}@media (prefers-reduced-motion:reduce){#wf-nudge{animation:none;transform:translate(var(--x),var(--y))}}';
    document.head.appendChild(st); }
  function find() { var L = document.querySelectorAll(sel); for (var i = 0; i < L.length; i++) { var r = L[i].getBoundingClientRect(); if (r.width > 4 && r.height > 4 && getComputedStyle(L[i]).visibility !== 'hidden') return L[i]; } return null; }
  function frame() {
    raf = requestAnimationFrame(frame);
    if (flag) { try { if (!sessionStorage.getItem(flag)) return off(); } catch (e) {} }
    var e = el && el.isConnected ? el : (el = find()); if (!e) { dot.classList.remove('on'); edge(0); return; }
    var r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, ok = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    if (ok) { var h = document.elementFromPoint(Math.min(innerWidth - 2, Math.max(2, x)), Math.min(innerHeight - 2, Math.max(2, y))); ok = !!h && (e === h || e.contains(h)); }   // a sheet or panel over it: the circle waits
    // the control is scrolled out of view: the screen's vertical edges glow on the side it is on (top or bottom) until it is back
    edge(r.bottom <= 0 ? -1 : r.top >= innerHeight ? 1 : 0);
    dot.style.setProperty('--x', x + 'px'); dot.style.setProperty('--y', y + 'px'); dot.classList.toggle('on', ok);
    var n = Date.now(); if (ok && n - last > 2600) { last = n; try { dot.animate([{ opacity: 1 }, { opacity: 0.55, offset: 0.4 }, { opacity: 1 }], { duration: 260 }); var ic = e.querySelector('svg'); if (ic && ic.animate) ic.animate([{ scale: '1' }, { scale: '1.25', offset: 0.4, easing: 'cubic-bezier(.2,.8,.3,1)' }, { scale: '1' }], { duration: 260 }); } catch (x2) {} }
  }
  function edge(d) { gl.forEach(function (g) { g.classList.toggle('on', d !== 0); if (d) { g.style.top = d < 0 ? '0' : (innerHeight * 0.6) + 'px'; g.style.height = (innerHeight * 0.4) + 'px'; } else g.style.height = '0'; }); }
  function used(ev) { if (ev && ev.target && ev.target.closest && ev.target.closest(sel)) off(true); }
  function off(clear) { cancelAnimationFrame(raf); raf = 0; if (dot) { dot.remove(); dot = null; } gl.forEach(function (g) { g.remove(); }); gl = []; document.removeEventListener('pointerdown', used, true); el = null; if (clear && flag) { try { sessionStorage.removeItem(flag); } catch (e) {} } }
  window.__wfNudge = {
    on: function (s, k) { if (raf) return; sel = s; flag = k || ''; css(); dot = document.createElement('div'); dot.id = 'wf-nudge'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot);
      gl = ['l', 'r'].map(function (k) { var g = document.createElement('div'); g.className = 'wf-ndg ' + k; g.setAttribute('aria-hidden', 'true'); document.body.appendChild(g); return g; });
      document.addEventListener('pointerdown', used, true); last = Date.now() - 1800; raf = requestAnimationFrame(frame); },
    off: function () { off(true); }
  };
})();
