// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Helmet camera feed (Oct 3, 22:50): a live helmet camera from a firefighter, shown like the drone feed. It comes out of
// the button that opened it and grows to its place (358 x 202, rounded 16px, dark glass controls); it drags anywhere like the
// tour cards (a 6px slop, a throw keeps it gliding and slowing, a gentle bounce 8px from the edges, no magnet); maximize fills
// the screen; X folds it back into its button. One shared widget for the fire screen and the chats.
(function () {
  if (window.__wfCamFeed) return;
  var SRC = 'assets/helmetcam.mp4?v=1', THERMAL = { 'assets/helmetcalm.mp4': 'assets/helmetcalm-thermal.mp4?v=1', 'assets/dronecalm.mp4': 'assets/dronecalm-thermal.mp4?v=1', 'assets/helmetcam.mp4': 'assets/helmetcam-thermal.mp4?v=1', 'assets/dronefire.mp4': 'assets/dronefire-thermal.mp4?v=1', 'assets/5e964d02f1b03f33559b28d2b0ae2dbc.mp4': 'assets/55e87eb26c8f2696b2ffa1e5aa129029.mp4' }, EASE = 'cubic-bezier(.2,.8,.2,1)';
  var css = document.createElement('style');
  css.textContent =
    '.wf-cf{position:fixed;left:0;top:0;z-index:120;margin:0;overflow:hidden;border-radius:16px;background:#1C1C1E;color:#FFFFFF;box-shadow:0 0 28px rgba(0,0,0,.28);touch-action:none;cursor:grab;transform-origin:0 0;opacity:0;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif}' +
    '.wf-cf.max{border-radius:0;cursor:default}' +
    '.wf-cf video.tv{transition:opacity .45s ease}.wf-cf video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.wf-cf .lb{position:absolute;left:16px;top:16px;display:flex;align-items:center;gap:8px;min-height:52px;font-size:16px;font-weight:600;line-height:20px;text-shadow:0 0 2px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.8),0 0 8px rgba(0,0,0,.7);pointer-events:none}' +
    '.wf-cf .lb i{width:6px;height:6px;border-radius:50%;background:#FF453A;flex-shrink:0}' +
    '.wf-cf .lb small{display:block;font-size:13px;font-weight:400;opacity:.9}' +
    '.wf-cf button{position:absolute;display:flex;align-items:center;justify-content:center;width:44px;height:44px;box-sizing:border-box;padding:0;border-radius:50%;background:rgba(0,0,0,.5);border:0;-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#FFFFFF;cursor:pointer}' +
    '.wf-cf .x{right:16px;top:16px}'+
    /* (Oct 8, 19:10) the call's voice: the mic (optional) bottom-left, the caption of who is speaking along the bottom */ '.wf-cf .mic{left:16px;bottom:16px}.wf-cf .mic.on{background:var(--wf-y,#E5FF00);color:#1C1C1E;-webkit-backdrop-filter:none;backdrop-filter:none}.wf-cf .vcap{position:absolute;left:68px;right:68px;bottom:16px;max-height:44px;overflow:hidden;font-size:13px;line-height:16px;color:#FFFFFF;text-shadow:0 0 2px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.8);opacity:0;transition:opacity .3s ease;pointer-events:none}.wf-cf .vcap.on{opacity:1}.wf-cf .mw{position:absolute;inset:0;border-radius:16px;overflow:hidden;isolation:isolate;transform:translateZ(0);-webkit-mask-image:-webkit-radial-gradient(white,black)}.wf-cf .hu{background:#D70015;-webkit-backdrop-filter:none;backdrop-filter:none}.wf-cf .mx{right:16px;bottom:16px}' +
    '.wf-cf .x svg{transition:transform .6s cubic-bezier(.25,.1,.25,1)}' +
    '.wf-cf .cam{position:absolute;left:16px;bottom:16px;width:200px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%)}.wf-cf.max .cam{bottom:calc(24px + env(safe-area-inset-bottom))}.wf-cf .cam button{position:relative;width:auto;height:auto;padding:0 4px;border-radius:999px;background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}.wf-cf.mini .lb,.wf-cf.mini .cam,.wf-cf.mini .cross{display:none}.wf-cf.nomx .mx{display:none}.wf-cf.heat video{filter:url(#wf-thermal) contrast(1.15)}' +
    '.wf-cf.max .x{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .lb{top:calc(16px + env(safe-area-inset-top))}.wf-cf.max .mx{bottom:calc(24px + env(safe-area-inset-bottom))}';
  /* (Oct 5, 11:05) a video call sits in an 8px dark grey frame, so it stands out from the page */
  css.textContent += '.wf-cf.call .mw{padding:8px;background:#2C2C2E;box-sizing:border-box}.wf-cf.call .gr{inset:8px;border-radius:8px;overflow:hidden}.wf-cf.call .mw>img.pf{clip-path:inset(8px round 8px)}.wf-cf.call .mw>img.pg{clip-path:inset(32px round 8px)}';
  css.textContent += '[data-wf-oncall]{background:#8E8E93!important}[data-call]{transition:background-color .25s ease}.wf-cf.ev .lb i,.wf-cf.ev .cam{display:none}.wf-cf .ei{container-type:size;background:#1C1C1E}.wf-cf .ei img{position:absolute;width:100%;max-width:none;height:auto;aspect-ratio:1;object-fit:cover;left:0;top:0}.wf-cf .ei:not(:has(.rg)) img{inset:0;width:100%;height:100%;aspect-ratio:auto}.wf-cf .ei .rg{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border:2px solid #FF453A;border-radius:50%;box-sizing:border-box}.wf-cf .lb{right:76px}.wf-cf.call .cam{display:none}.wf-cf .pf{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;transform:scale(1.08);transition:opacity .9s ease,transform 6s ease-out}.wf-cf.on .pf,.wf-cf.on .pg{opacity:1;transform:scale(1)}.wf-cf .pg{position:absolute;inset:-24px;width:calc(100% + 48px);height:calc(100% + 48px);object-fit:cover;filter:blur(22px) brightness(.62);opacity:0;transition:opacity .9s ease}.wf-cf.on .pg{transform:none}.wf-cf .gr{position:absolute;inset:0;display:grid;gap:2px;background:#000;opacity:0;transition:opacity .5s ease}.wf-cf.on .gr{opacity:1}.wf-cf .gt{position:relative;overflow:hidden;min-width:0;min-height:0;background:#2C2C2E;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.94);transition:opacity .5s ease var(--d),transform .5s cubic-bezier(.2,.8,.2,1) var(--d)}.wf-cf.on .gt{opacity:1;transform:none}.wf-cf .gt img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.wf-cf .gt i{position:relative;width:44px;height:44px;border-radius:50%;background:#48484A;color:#FFFFFF;font:600 17px/44px -apple-system,system-ui,sans-serif;text-align:center;font-style:normal}.wf-cf .gt b{position:absolute;left:4px;bottom:4px;max-width:calc(100% - 8px);padding:0 8px;border-radius:8px;background:rgba(28,28,30,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#FFFFFF;font-size:16px;line-height:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wf-cf .gt::after{content:\'\';position:absolute;inset:0;box-shadow:inset 0 0 0 0 var(--wf-y,#E5FF00);transition:box-shadow .3s ease;pointer-events:none}.wf-cf .gt.sp::after{box-shadow:inset 0 0 0 3px var(--wf-y,#E5FF00)}' +
    '.wf-cf .cl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:radial-gradient(120% 120% at 50% 40%,#3A3F4A 0%,#15171C 70%);transition:opacity .9s ease}.wf-cf.on .cl{opacity:0;pointer-events:none}' +
    '.wf-cf .cl .av{position:relative;display:flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.12);color:#FFFFFF}' +
    '.wf-cf .cl .av:before,.wf-cf .cl .av:after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,255,255,.35);animation:wfring 2s ease-out infinite}.wf-cf .cl .av:after{animation-delay:1s}' +
    '.wf-cf .cl.cn .av:before,.wf-cf .cl.cn .av:after{animation:none;opacity:0}' +
    '@keyframes wfring{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.1);opacity:0}}' +
    '.wf-cf .cl span{font-size:16px;line-height:20px;font-weight:600;text-shadow:0 0 4px rgba(0,0,0,.6)}.wf-cf.mini .cl span{display:none}';
  (document.head || document.documentElement).appendChild(css);
  // the heat camera: the feed in false colour (dark violet, red, orange, yellow, white from cold to hot)
  var heat = document.createElement('div'); heat.setAttribute('aria-hidden', 'true'); heat.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  heat.innerHTML = '<svg width="0" height="0"><filter id="wf-thermal" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.08 0.3 0.75 1 1 1"/><feFuncG type="table" tableValues="0 0 0.1 0.5 0.88 1"/><feFuncB type="table" tableValues="0.2 0.5 0.3 0 0.1 0.9"/></feComponentTransfer></filter></svg>';
  (document.body || document.documentElement).appendChild(heat);
  var feeds = [], GAP = 4, SWAP = 2340;   // several feeds can be open at once (drone, helmet); they never overlap
  var MAXI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"></path></svg>';
  var MINI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"></path></svg>';
  // (Oct 4) a group video call: the panel divided into one rectangle per person (their photo, or their initials), joining one after another
  function gridOf(G) { var n = G.length, cols = n <= 2 ? n : n <= 4 ? 2 : n <= 6 ? 3 : 3, rows = Math.ceil(n / cols), esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    return '<div class="gr" style="grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(' + rows + ',minmax(0,1fr))">' + G.map(function (g, i) {
      var rem = n % cols, tail = rem && i >= n - rem, span = tail ? 6 / rem : 6 / cols;   // the last, shorter row shares the width evenly
      return '<div class="gt" style="--d:' + (i * 260) + 'ms;grid-column:span ' + span + '">' + (g.photo ? '<img alt="' + esc(g.name) + '" src="' + esc(g.photo) + '">' : '<i aria-hidden="true">' + esc(g.code || (g.name || '?').charAt(0)) + '</i>') + '<b>' + esc((g.name || '').split(' ')[0]) + '</b></div>'; }).join('') + '</div>'; }
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
  // (Oct 4, 23:03) never left overlapping: when a feed rests on another (or closer than the gap), it moves to the nearest
  // place beside any open feed or along the edges that keeps the gap from all of them
  function overlaps(f, x, y) { var d = dims(f); return others(f).some(function (g) { return hits(x, y, d.w, d.h, g, GAP - 0.5); }); }
  function nearest(f, x, y) { var d = dims(f), B = boundsF(f), c = [{ x: x, y: y }, { x: x, y: B.y0 }, { x: x, y: B.y1 }, { x: B.x0, y: y }, { x: B.x1, y: y }];
    others(f).forEach(function (g) { var e = dims(g); [x, B.x0, B.x1, g.st.x].forEach(function (cx) { c.push({ x: cx, y: g.st.y + e.h + GAP }, { x: cx, y: g.st.y - d.h - GAP }); }); [y, B.y0, B.y1, g.st.y].forEach(function (cy) { c.push({ x: g.st.x + e.w + GAP, y: cy }, { x: g.st.x - d.w - GAP, y: cy }); }); });
    var best = null, bd = 1e9; c.forEach(function (q) { q = clampB(f, q.x, q.y); if (overlaps(f, q.x, q.y)) return; var dd = Math.hypot(q.x - x, q.y - y); if (dd < bd) { bd = dd; best = q; } });
    return best || clampB(f, x, y); }
  function settle(f) { if (feeds.indexOf(f) < 0 || f.el.classList.contains('max') || !overlaps(f, f.st.x, f.st.y)) return; var q = nearest(f, f.st.x, f.st.y); setPos(f, q.x, q.y, true); }
  function tf(f, x, y) { return 'translate(' + x + 'px,' + y + 'px)'; }
  function applySize(f) { var d = dims(f); f.el.style.width = d.w + 'px'; f.el.style.height = d.h + 'px'; f.el.classList.toggle('nomx', !f.el.classList.contains('max') && d.h < 122); }   /* (Oct 5) the expand button stays until it would touch (2px) the X or hang-up above it: 16 + 44 + 2 + 44 + 16 */   // a shrunk feed is really smaller (not scaled), so its X stays a plain 44px button
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

  // (Oct 8, 19:10) Voice in video calls: the team speaks its lines aloud (the phone's own voices), each person with a voice of their
  // own gender and their own pitch, captioned on the card; the user can answer by tapping the chat's suggestions, or by voice with
  // the mic button (where the browser has speech recognition). Everything said is written in the incident chat too.
  var FV = /samantha|karen|moira|tessa|victoria|allison|ava|susan|zoe|serena|fiona|nicky|kate|joana|catarina|luciana|fernanda|female|mulher|monica|paulina|amelie|anna|helena|sara|ines|google uk english female|google us english/i,
      MV = /alex|daniel|fred|rishi|aaron|arthur|tom|oliver|gordon|lee|male|duarte|felipe|diego|jorge|thomas|reed|eddy|grandpa|ralph|google uk english male/i;
  function vList(PT) { var V = (window.speechSynthesis && speechSynthesis.getVoices()) || [], k = PT ? /^pt[-_]pt/i : /^en[-_]/i;
    var L = V.filter(function (v) { return k.test(v.lang || ''); }); if (!L.length && PT) L = V.filter(function (v) { return /^pt/i.test(v.lang || ''); }); return L; }
  function vFor(name, idx, PT) { var g = (window.__wfGender && window.__wfGender(name)) || (/a$/.test(String(name).split(' ')[0]) ? 'f' : 'm'), L = vList(PT);
    var mine = L.filter(function (v) { return g === 'f' ? FV.test(v.name) && !MV.test(v.name) : MV.test(v.name) && !FV.test(v.name); });
    var v = mine.length ? mine[idx % mine.length] : (L.length ? L[0] : null);
    /* a voice of the wrong gender, or the only voice there is, is pitched towards theirs; each person a little different */
    var p = (g === 'f' ? 1.12 : 0.86) + ((idx % 3) - 1) * 0.06; if (mine.length) p = 1 + ((idx % 3) - 1) * 0.06;
    return { v: v, pitch: p, rate: 0.98 + (idx % 2) * 0.04 }; }
  function vStart(f, key, el) { var C = window.__wfChat; if (!C || !key || !window.speechSynthesis) return; var PT = window.__wfLang === 'pt', seen = {};
    var c0 = C.get(key); (c0 && c0.msgs || []).forEach(function (m) { seen[m.id] = 1; });
    var cap = document.createElement('div'); cap.className = 'vcap'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
    var say = function (p, i, text) { if (f.quiet) return;   /* (Oct 8, 21:11) you are writing or dictating: the team stays quiet (their words still land in the chat) */
      var u = new SpeechSynthesisUtterance(text), V = vFor(p.name || '', i, PT); u.lang = PT ? 'pt-PT' : 'en-US'; if (V.v) u.voice = V.v; u.pitch = V.pitch; u.rate = V.rate;
      u.onstart = function () { cap.textContent = (p.name || '').split(' ')[0] + ': ' + text; cap.classList.add('on');
        var gt = el.querySelectorAll('.gt'); Array.prototype.forEach.call(gt, function (t) { t.classList.toggle('sp', (t.querySelector('b') || {}).textContent === (p.name || '').split(' ')[0]); }); };
      /* one voice at a time, then a breath before the next (the chat holds its next bubble meanwhile) */
      window.__wfVoiceBusy = true; clearTimeout(f.vP);
      u.onend = u.onerror = function () { cap.classList.remove('on'); clearTimeout(f.vP); f.vP = setTimeout(function () { if (!speechSynthesis.speaking) window.__wfVoiceBusy = false; }, 1100 + Math.random() * 700); };
      f.vP = setTimeout(function () { window.__wfVoiceBusy = false; }, 15000 + text.length * 80);   /* never stuck if a voice fails silently */
      speechSynthesis.speak(u); };
    f.vOn = function () { var c = C.get(key); if (!c) return; (c.msgs || []).forEach(function (m) { if (seen[m.id]) return; seen[m.id] = 1; if (m.kind !== 'msg' || m.from === 'me') return;
      var i = typeof m.from === 'number' ? m.from : 0, p = (c.people || [])[i] || { name: '' }; say(p, i, PT ? m.pt : m.en); }); };
    addEventListener('wf-chat', f.vOn); f.vT = setInterval(f.vOn, 1200);
    /* (Oct 8, 21:11) you start writing or dictating in the chat box: the voices stop at once and stay quiet until you leave it */
    f.vIn = function (e) { var t = e.target; if (!t || !t.closest || !t.closest('[data-wf-composer]')) return; f.quiet = true; try { speechSynthesis.cancel(); } catch (x) {} cap.classList.remove('on'); window.__wfVoiceBusy = false; };
    f.vOut = function (e) { var t = e.target; if (!t || !t.closest || !t.closest('[data-wf-composer]')) return; setTimeout(function () { var a = document.activeElement; if (!(a && a.closest && a.closest('[data-wf-composer]'))) f.quiet = false; }, 300); };
    document.addEventListener('focusin', f.vIn); document.addEventListener('focusout', f.vOut);
    /* calling the team is asking where things stand: they answer aloud */
    window.__wfVoiceKey = key; window.__wfVoiceBusy = false;
    setTimeout(function () { try { if (C.callStart) C.callStart(key); } catch (x) {} }, 600);
    /* the mic: optional, only where the browser can listen */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
    var mic = document.createElement('button'); mic.type = 'button'; mic.className = 'mic mbtn'; mic.setAttribute('aria-label', PT ? 'Falar' : 'Speak'); mic.setAttribute('aria-pressed', 'false');
    mic.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"></path></svg>';
    el.appendChild(mic); var rec = null;
    mic.addEventListener('click', function (e) { e.stopPropagation(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
      if (rec) { try { rec.stop(); } catch (x) {} return; }
      try { speechSynthesis.cancel(); } catch (x) {} rec = new SR(); rec.lang = PT ? 'pt-PT' : 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
      mic.setAttribute('aria-pressed', 'true'); mic.classList.add('on'); window.__wfVoiceBusy = true; f.quiet = true;
      rec.onresult = function (ev) { var t = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : ''; if (t && t.trim()) { try { C.send(key, t.trim().charAt(0).toUpperCase() + t.trim().slice(1)); } catch (x) {} } };
      rec.onend = rec.onerror = function () { window.__wfVoiceBusy = false; f.quiet = false; rec = null; mic.setAttribute('aria-pressed', 'false'); mic.classList.remove('on'); };
      try { rec.start(); } catch (x) { rec = null; mic.classList.remove('on'); } });
    f.vRec = function () { if (rec) try { rec.abort(); } catch (x) {} }; }
  // (Oct 8, 21:09) call sounds, made here (Web Audio): an outgoing ring, a soft rising three-note chime as in Teams or Zoom,
  // repeated until the call connects; a bright "plim" when you hang up
  function ac() { try { var A = window.__wfAC || (window.__wfAC = new (window.AudioContext || window.webkitAudioContext)()); if (A.state === 'suspended') A.resume(); return A; } catch (e) { return null; } }
  function note(A, t, hz, dur, vol) { var o = A.createOscillator(), o2 = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = hz; o2.frequency.value = hz * 2;
    var g2 = A.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(A.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); }
  function ringOnce() { var A = ac(); if (!A) return; var t = A.currentTime + 0.02; [659.3, 830.6, 987.8].forEach(function (hz, i) { note(A, t + i * 0.16, hz, 0.42, 0.16); }); }
  function ringStart(f) { ringOnce(); f.ring = setInterval(ringOnce, 1500); }
  function ringStop(f) { if (f && f.ring) { clearInterval(f.ring); f.ring = null; } }
  function plim() { var A = ac(); if (!A) return; var t = A.currentTime + 0.02; note(A, t, 1318.5, 0.7, 0.18); note(A, t + 0.09, 1975.5, 0.55, 0.1); }
  // (Oct 8, 21:11) typing with a call card up: the card moves above the chat box (16px over it) so what you write stays in view;
  // it goes back where it was when the keyboard closes
  (function () { var vv = window.visualViewport;
    function clear() { var c = document.querySelector('[data-wf-composer]'), a = document.activeElement, typing = c && a && c.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName);
      feeds.forEach(function (f) { if (!f.el || f.el.classList.contains('max')) return; var d = dims(f);
        if (typing) { var r = c.getBoundingClientRect(), top = (vv ? vv.offsetTop : 0) + 8, y = Math.max(top, r.top - 16 - d.h); if (f.st.y + d.h > r.top - 8) { if (!f.pre) f.pre = { x: f.st.x, y: f.st.y }; setPos(f, f.st.x, y, true); } }
        else if (f.pre) { var p = f.pre; f.pre = null; setPos(f, p.x, p.y, true); } }); }
    var q = 0; function soon() { clearTimeout(q); q = setTimeout(clear, 120); setTimeout(clear, 450); }
    document.addEventListener('focusin', soon); document.addEventListener('focusout', soon); if (vv) vv.addEventListener('resize', soon); })();
  function vStop(f) { if (f.vIn) { document.removeEventListener('focusin', f.vIn); document.removeEventListener('focusout', f.vOut); } if (f.vOn) removeEventListener('wf-chat', f.vOn); clearInterval(f.vT); clearTimeout(f.vP); window.__wfVoiceKey = null; window.__wfVoiceBusy = false; if (f.vRec) f.vRec(); try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (x) {} }
  function close(f) { if (!f) { feeds.slice().forEach(close); return; } if (feeds.indexOf(f) < 0) return; (f.timers || []).forEach(clearTimeout); ringStop(f); vStop(f);
    var e = f.el, a = f.st.anchor; if (!e.querySelector('.hu')) e.querySelector('.x svg').style.transform = 'rotate(90deg)';
    if (f.callBtn) { try { f.callBtn.removeAttribute('data-wf-oncall'); } catch (x) {} }   // the call button is green again the moment the call ends
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
  function flyOut(f, vy) { var st = f.st, el = f.el, d = dims(f), y = st.y, v = Math.min(vy, -700) * 0.6, hit = false, last = 0;   /* (Oct 4, 23:04) 40% slower, so the exit reads as intended */
    feeds.splice(feeds.indexOf(f), 1); cancelAnimationFrame(st.fling || 0); el.style.transition = 'none';
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    try { document.documentElement.classList.toggle('wf-black', feeds.some(function (g) { return g.el.classList.contains('max'); })); } catch (x) {}
    var stepX = function (now) { var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (hit) v = Math.min(-168, v * Math.exp(-dt / 0.9)); y += v * dt;
      if (!hit && y <= 0) { hit = true; v *= 0.55; }
      var cut = Math.max(0, -y); el.style.transform = tf(f, st.x, y); el.style.clipPath = cut ? 'inset(' + cut + 'px 0 0 0)' : '';
      if (y + d.h <= 0) { try { el.remove(); } catch (x) {} return; }
      requestAnimationFrame(stepX); };
    requestAnimationFrame(stepX); }
  function open(o) {
    o = o || {};
    // (Oct 5, 07:26) a fire under control (Concluding, Surveillance, closed or held) shows the calm daytime clips, never the burning night
    if (o.calm && !o.call && !o.image) { if (!o.src || /helmetcam/.test(o.src)) o.src = 'assets/helmetcalm.mp4?v=1'; else if (/dronefire/.test(o.src)) o.src = 'assets/dronecalm.mp4?v=1'; }
    var CALL = o.call || null, key = CALL ? 'call:' + (CALL.id || 'police') : o.image ? 'img:' + o.image.src : (o.src || SRC), old = feeds.filter(function (g) { return g.st.src === key; })[0];
    if (old) { close(old); if (old.st.who === o.who) return; }   // the same button again closes it
    var s = size(), a = o.anchor && o.anchor.getBoundingClientRect ? o.anchor : null, r = a ? a.getBoundingClientRect() : null;
    var el = document.createElement('figure'), st = { anchor: a, x: 0, y: 0, sc: 1, src: key, who: o.who }, f = { el: el, st: st };
    el.className = 'wf-cf' + (CALL ? ' call' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', (o.title || 'Helmet camera') + (o.who ? ', ' + o.who : ''));
    el.style.width = s.w + 'px'; el.style.height = s.h + 'px';
    var TS = o.thermalSrc || THERMAL[String(key).split('?')[0]] || '';
    var IMG = o.image || null, imgHtml = IMG ? '<div class="mw ei"><img alt="' + (IMG.alt || '') + '" src="' + IMG.src + '"' + (IMG.src2 ? ' onerror="if(!this.__f){this.__f=1;this.src=\'' + IMG.src2 + '\'}"' : '') + (IMG.ring ? ' style="width:140cqw;left:calc(50cqw - ' + (IMG.rx * 1.4).toFixed(2) + 'cqw);top:calc(50cqh - ' + (IMG.ry * 1.4).toFixed(2) + 'cqw)"' : '') + '>' + (IMG.ring ? '<span class="rg" aria-hidden="true"></span>' : '') + (IMG.smoke ? '<svg aria-hidden="true" viewBox="0 0 358 202" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><defs><filter id="wfSmkF" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"></feGaussianBlur></filter></defs><path d="M210 190c-12-40 20-60 10-100s20-60 60-80c-10 40-30 50-20 90s-10 70-50 90Z" fill="rgba(235,235,240,0.8)" filter="url(#wfSmkF)"></path></svg>' : '') + '</div>' : '';
    if (IMG) el.classList.add('ev');
    el.innerHTML = (IMG ? imgHtml : CALL ? '<div class="mw">' + (CALL.grid ? gridOf(CALL.grid) : '<img class="pg" alt="" aria-hidden="true" src="' + (CALL.photo || '') + '"><img class="pf" alt="' + (CALL.alt || '') + '" src="' + (CALL.photo || '') + '">') + '<div class="cl"><div class="av"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg></div><span class="ct">' + (CALL.calling || 'Calling') + '</span></div></div>' : '<video src="' + key + '" autoplay muted loop playsinline preload="auto" aria-label="' + (o.title || 'Live helmet camera') + '"></video>') +
      (TS && !CALL && !IMG ? '<video class="tv" src="' + TS + '" autoplay muted loop playsinline preload="auto" aria-label="' + (o.title || 'Live helmet camera') + ', thermal" style="opacity:0"></video>' : '') +
      (o.cross ? '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="position:absolute;left:50%;top:50%;margin:-22px 0 0 -22px;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"><circle cx="22" cy="22" r="14" stroke-opacity="0.45"></circle><path d="M22 0v10M22 34v10M0 22h10M34 22h10" stroke-opacity="0.55"></path></g></svg>' : '') +
      '<span class="lb"><i aria-hidden="true"></i><span><b class="lt" style="font:inherit">' + (o.label || 'Live. Helmet camera') + '</b>' + (o.who ? '<small>' + o.who + '</small>' : '') + '</span></span>' +
      (CALL ? '<button type="button" class="x hu mbtn" aria-label="' + (CALL.hangup || 'End call') + '"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round" aria-hidden="true" style="transform:rotate(135deg)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>' : '<button type="button" class="x mbtn" aria-label="Close camera feed"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>') +
      (CALL || IMG ? '' : '<div role="group" aria-label="Camera" class="wf-seg cam"><span class="segthumb" aria-hidden="true" style="width:calc((100% - 16px) / 2);transform:translateX(100%)"><span class="segblob"></span></span><button type="button" class="segopt" data-cam="t" aria-selected="false" style="font-size:17px">Thermal</button><button type="button" class="segopt" data-cam="v" aria-selected="true" style="font-size:17px">Visual</button></div>') +
      '<button type="button" class="mx mbtn" aria-label="Maximize camera feed">' + MAXI + '</button>';
    document.body.appendChild(el);
    /* iPhone speaks only after a tap: an empty line now, inside the tap that opened the call */
    if (CALL && window.speechSynthesis) { try { var u0 = new SpeechSynthesisUtterance(' '); u0.volume = 0; speechSynthesis.speak(u0); speechSynthesis.getVoices(); } catch (x) {} }
    if (CALL) { var ob = a || document.querySelector('[data-call]'); if (ob) { f.callBtn = ob; ob.setAttribute('data-wf-oncall', '1'); } ringStart(f); }   // while the call card is up the call button is mid grey
    // a video call: rings (calling), then connects, then the other person's picture fades in
    if (CALL) { var ct = el.querySelector('.ct'), cl = el.querySelector('.cl'), lt = el.querySelector('.lt'), im = el.querySelector('.pf');
      var tm = [setTimeout(function () { ringStop(f); if (ct) ct.textContent = CALL.connecting || 'Connecting'; if (cl) cl.classList.add('cn'); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} }, 2600),
        setTimeout(function () { try { vStart(f, CALL.id, el); } catch (x) {} if (CALL.grid) { el.classList.add('on'); var gt = el.querySelectorAll('.gt'), k = 0; if (gt.length) { gt[0].classList.add('sp'); f.timers.push(setInterval(function () { if (gt[k]) gt[k].classList.remove('sp'); k = (k + 1 + Math.floor(Math.random() * Math.max(1, gt.length - 1))) % gt.length; gt[k].classList.add('sp'); }, 1800)); } } else if (im && im.complete && im.naturalWidth) el.classList.add('on'); else if (im) im.addEventListener('load', function () { el.classList.add('on'); }); if (lt) lt.textContent = CALL.live || 'Live. Video call'; try { if (navigator.vibrate) navigator.vibrate([8, 40, 8]); } catch (x) {} }, 4300)];
      if (im) im.addEventListener('error', function () { if (cl) { cl.style.opacity = '1'; } if (ct) ct.textContent = CALL.noPhoto || ''; });
      f.timers = tm; }
    // starts as a small feed on its button, then glides, growing, to its place: above the button, centred
    var x1 = (innerWidth - s.w) / 2, y1 = r ? r.top - s.h - 16 : innerHeight - s.h - 96; if (y1 < 64) y1 = r ? r.bottom + 16 : 64;
    var mr = a && a.closest ? a.closest('[data-wf-maproot]') : null;   // from a map: inside the map, 16px from its top-left, like the drone feed in the band
    if (mr) { var R = mr.getBoundingClientRect(); x1 = Math.max(8, R.left + 16); y1 = Math.max(8, R.top + 16); }
    var P = free(x1, y1); st.x = P.x; st.y = P.y; feeds.push(f);
    el.style.transition = 'none'; el.style.transform = r ? 'translate(' + (r.left + r.width / 2 - 32) + 'px,' + (r.top + r.height / 2 - 18) + 'px) scale(' + (64 / s.w) + ')' : 'translate(' + P.x + 'px,' + (P.y + 24) + 'px) scale(.9)';
    void el.offsetWidth; requestAnimationFrame(function () { if (feeds.indexOf(f) < 0) return; el.style.opacity = '1'; setPos(f, P.x, P.y, true); });
    try { Array.prototype.forEach.call(el.querySelectorAll('video'), function (v) { v.muted = true; v.play().catch(function () {}); }); } catch (x) {}
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
    el.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); if (!CALL) { close(f); return; }
      /* hanging up: the button is green at once, the card swells 10% and settles quickly (about its centre), then scales down into the button */
      if (f.hanging) return; f.hanging = 1; ringStop(f); plim(); try { if (f.callBtn) f.callBtn.removeAttribute('data-wf-oncall'); } catch (x) {}
      try { var q = el.getBoundingClientRect(), k = 1.1, cx = q.left + q.width / 2, cy = q.top + q.height / 2; el.animate([{ scale: '1', translate: '0 0' }, { scale: String(k), translate: (cx * (1 - k)) + 'px ' + (cy * (1 - k)) + 'px', offset: 0.5 }, { scale: '1', translate: '0 0' }], { duration: 200, easing: 'ease-in-out' }); } catch (x) {}
      setTimeout(function () { close(f); }, 200); });
    el.querySelector('.mx').addEventListener('click', function (e) { e.stopPropagation(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} maxi(f, !el.classList.contains('max')); });
    Array.prototype.forEach.call(el.querySelectorAll('.cam .segopt'), function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); var t = b.getAttribute('data-cam') === 't'; try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
      /* real thermal footage when the feed has it, else the false-colour view */ var tv = el.querySelector('.tv'); if (tv) { tv.style.opacity = t ? '1' : '0'; } else el.classList.toggle('heat', t); el.querySelector('.segthumb').style.transform = 'translateX(' + (t ? 0 : 100) + '%)'; Array.prototype.forEach.call(el.querySelectorAll('.cam .segopt'), function (o) { o.setAttribute('aria-selected', String(o === b)); }); }); });   // Thermal / Visual, as on the first drone feed
    // dragging, as the tour cards
    var D = null;
    var LP = 0, R = 240;   // pushing a feed against a screen edge shrinks it (240px of push = down to 40%); a long press brings it back
    var clearLP = function () { if (LP) { clearTimeout(LP); LP = 0; } };
    var restore = function () { if (st.sc >= 1) return; cancelAnimationFrame(st.fling || 0); st.sc = 1; el.classList.remove('mini'); applySize(f);
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (x) {}
      var q = nearest(f, st.x, st.y); setPos(f, q.x, q.y, true);
      /* (Oct 4, 23:03) the hang-up bounce (swells 10% and settles quickly about its centre), but the feed stays */
      try { var d0 = dims(f), k = 1.1, cx = q.x + d0.w / 2, cy = q.y + d0.h / 2;   /* scaled about its own centre (the feed's origin is the screen's top left) */ el.animate([{ scale: '1', translate: '0 0' }, { scale: String(k), translate: (cx * (1 - k)) + 'px ' + (cy * (1 - k)) + 'px', offset: 0.5 }, { scale: '1', translate: '0 0' }], { duration: 200, easing: 'ease-in-out' }); } catch (x) {} };
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('button') || e.target.closest('.cam') || el.classList.contains('max')) return; cancelAnimationFrame(st.fling || 0); D = { x: e.clientX, y: e.clientY, x0: st.x, y0: st.y, sc0: st.sc, tr: [] }; try { el.setPointerCapture(e.pointerId); } catch (x) {}
      clearLP(); LP = setTimeout(function () { LP = 0; if (D && !D.moved) restore(); }, 550); });
    el.addEventListener('pointermove', function (e) { if (!D) return; var mx = e.clientX - D.x, my = e.clientY - D.y; if (!D.moved && Math.hypot(mx, my) < 6) return; D.moved = true; clearLP();
      var now = performance.now(); D.tr.push([now, e.clientX, e.clientY]); while (D.tr.length > 2 && now - D.tr[0][0] > 90) D.tr.shift();
      var tx = D.x0 + mx, ty = D.y0 + my, B0 = boundsF(f, D.sc0), ov = Math.max(B0.x0 - tx, tx - B0.x1, B0.y0 - ty, ty - B0.y1, 0);
      if (ov > 0) { var k = Math.max(0.4, Math.min(st.sc, D.sc0 - ov / R * 0.6)); if (k < st.sc) { st.sc = k; el.classList.add('mini'); applySize(f); } }   // only ever smaller while pushing
      put(f, tx, ty, false); e.preventDefault(); });
    var up = function () { clearLP(); if (!D || feeds.indexOf(f) < 0) { D = null; return; } var d = D; D = null; if (st.sc < 1) el.classList.add('mini'); var tr = d.tr, A = tr[0], Z = tr[tr.length - 1], vx = 0, vy = 0;
      if (d.moved && A && Z && Z[0] - A[0] > 8 && performance.now() - Z[0] < 80) { vx = (Z[1] - A[1]) / ((Z[0] - A[0]) / 1000); vy = (Z[2] - A[2]) / ((Z[0] - A[0]) / 1000); var sp = Math.hypot(vx, vy); if (sp > 2500) { vx *= 2500 / sp; vy *= 2500 / sp; } }
      var spd = Math.hypot(vx, vy); if (spd < 150) { settle(f); return; }
      if (spd >= SWAP) { var g = swapTarget(f, vx, vy); if (g) { swap(f, g, d.x0, d.y0); return; } if (vy < -SWAP && Math.abs(vy) > Math.abs(vx) * 1.5) { flyOut(f, vy); return; } }
      var last = 0;
      var step = function (now) { if (feeds.indexOf(f) < 0) return; var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; var k = Math.exp(-dt / 0.3); vx *= k; vy *= k;
        var B = boundsF(f), x = st.x + vx * dt, y = st.y + vy * dt;
        if (x < B.x0) { x = B.x0; vx = -vx * 0.3; } else if (x > B.x1) { x = B.x1; vx = -vx * 0.3; }
        if (y < B.y0) { y = B.y0; vy = -vy * 0.3; } else if (y > B.y1) { y = B.y1; vy = -vy * 0.3; }
        var q = put(f, x, y, false); if (q.hx) vx = -vx * 0.3; if (q.hy) vy = -vy * 0.3;   // bounces off another feed like off an edge
        if (Math.hypot(vx, vy) < 12) { st.fling = 0; settle(f); return; } st.fling = requestAnimationFrame(step); };
      st.fling = requestAnimationFrame(step); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  addEventListener('pagehide', function () { feeds.forEach(function (g) { try { g.el.remove(); } catch (x) {} }); feeds = []; });
  window.__wfCamFeed = { open: open, close: close, isOpen: function () { return feeds.length > 0; } };
})();
