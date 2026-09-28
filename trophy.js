// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The trophy card: one widget for every "fire resolved" card in the app (the card in the incident chat and the
// resolution summary). Change it here and every trophy card changes.
//   <wf-trophy kicker="Fire resolved · 07:06" headline="Resolved in 2 d 14 h" sub="~10 people · ~3 vehicles"
//              action="See the summary" credit="1"></wf-trophy>
// - nature photos (forests, leaves, flowers, forest lakes) in random order, cycling like the login screen (two zoom in,
//   one zooms out), the credit following the photo
// - the small Forest Fire Watch logo on top, as on the login screen (yellow on the photo, soft shadows, no blink)
// - the trophy in its yellow circle, turning a full circle on its vertical axis every 8 s
// - yellow fireworks: sparks leave the trophy's circle at full opacity and fade out at the photo's edges;
//   one burst streaming for the whole of each turn of the trophy (every 8 s), no two bursts alike
// - action: an optional full-width button label; a tap anywhere on the card reaches the page's own onClick
(function () {
  if (window.customElements && customElements.get('wf-trophy')) return;
  var LOGO = 'M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z';
  var TROPHY = 'M8 3.5h8v5.5a4 4 0 0 1-8 0Z M8 5.5H4.5v1.2A3.3 3.3 0 0 0 8 10 M16 5.5h3.5v1.2A3.3 3.3 0 0 1 16 10 M12 13v3.5 M8 20.5h8 M9.5 16.5h5v4h-5Z';
  // Nature photos (fit.js): each card starts with one random photo from each group (forest, macro, village), and each
  // layer takes a new random photo of its group every time it comes round again (while hidden), so the groups take
  // turns and the photos never repeat in a fixed order. Every other layer zooms out.
  var POOL = function () { return window.__wfPhotoList || [{ f: 'forest-1.webp', by: 'Mari Potter', b: 1 }, { f: 'forest-2.webp', by: 'Ivan Dimitrov', b: 1 }, { f: 'forest-3.webp', by: 'Olena Bohovyk', b: 1 }]; };
  var pick3 = function () { var a = window.__wfPhotoMix ? window.__wfPhotoMix() : POOL().slice(); while (a.length < 4) a = a.concat(a); return a.slice(0, 4); };   // four layers, the groups taking turns
  var bgOf = function (p) { return 'background-image:url(assets/splash/' + p.f + ');filter:' + (p.b < 1 ? 'brightness(' + p.b + ')' : 'none'); };
  var CSS =
    ':host{display:block}' +
    '.card{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:20px;background:#1E2B22;color:#FFFFFF;text-align:center;font:inherit;cursor:inherit}' +
    '.forest{position:absolute;inset:0;z-index:-2;overflow:hidden;pointer-events:none}' +
    '.forest i{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;animation:f 44s linear infinite,zi 44s linear infinite}' +
    '.forest i.out{animation-name:f,zo}' +
    '.forest b{position:absolute;inset:0;z-index:3;background:linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.42) 45%,rgba(0,0,0,0.66) 100%)}' +
    '@keyframes f{0%{opacity:1;z-index:1}25%{opacity:1;z-index:2;animation-timing-function:cubic-bezier(.45,0,.55,1)}34.09%{opacity:0;z-index:2}34.2%{opacity:0;z-index:0}100%{opacity:0;z-index:0}}' +
    '@keyframes o{0%{opacity:0}9.09%{opacity:1}25%{opacity:1}34.09%{opacity:0}100%{opacity:0}}' +
    '@keyframes zi{0%{transform:scale(1);animation-timing-function:cubic-bezier(.3,.1,.3,1)}35%{transform:scale(1.3)}100%{transform:scale(1.3)}}' +
    '@keyframes zo{0%{transform:scale(1.3);animation-timing-function:cubic-bezier(.3,.1,.3,1)}35%{transform:scale(1)}100%{transform:scale(1)}}' +
    'canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}' +
    '.logo{display:flex;align-items:center;gap:6px;margin-bottom:8px;color:#D7F41A;font-size:15px;font-weight:600;letter-spacing:.02em;line-height:20px;text-shadow:0 1px 10px rgba(0,0,0,.45)}' +
    '.logo svg{flex-shrink:0;display:block;overflow:visible;filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))}' +
    '.cup{display:flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:#D7F41A;box-shadow:0 8px 24px rgba(0,0,0,.35);perspective:200px;animation:in .9s cubic-bezier(.2,.8,.2,1) both}' +
    '.cup svg{animation:spin 8s cubic-bezier(.45,0,.25,1) 1.2s infinite}' +
    '@keyframes spin{0%{transform:rotateY(0)}14%{transform:rotateY(360deg)}100%{transform:rotateY(360deg)}}' +
    '@keyframes in{0%{transform:scale(.6) rotate(-8deg);opacity:0}60%{transform:scale(1.08) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}' +
    '.kicker{margin-top:8px;font-size:15px;line-height:18px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 1px 8px rgba(0,0,0,.5)}' +
    '.headline{font-size:26px;font-weight:700;line-height:30px;letter-spacing:.01em;color:#D7F41A;text-wrap:balance;text-shadow:0 1px 12px rgba(0,0,0,.45)}' +
    '.sub{font-size:15px;line-height:20px;color:#FFFFFF;text-shadow:0 1px 8px rgba(0,0,0,.5)}' +
    '.act{display:flex;align-items:center;justify-content:center;align-self:stretch;height:44px;margin-top:8px;border-radius:10px;background:#D7F41A;color:#1C1C1E;font-size:17px;font-weight:600}' +
    '.credit{position:relative;display:grid;margin-top:12px;font-size:12px;line-height:14px;color:rgba(255,255,255,.72)}' +
    '.credit span{grid-area:1/1;opacity:0;animation:o 44s linear infinite}' +
    '[hidden]{display:none!important}' +
    '@media (prefers-reduced-motion:reduce){.forest i,.cup svg,.credit span{animation:none}.forest i:first-child,.credit span:first-child{opacity:1}}';

  function Trophy() { return Reflect.construct(HTMLElement, [], Trophy); }
  Trophy.prototype = Object.create(HTMLElement.prototype);
  Trophy.prototype.constructor = Trophy;
  Object.defineProperty(Trophy, 'observedAttributes', { get: function () { return ['kicker', 'headline', 'sub', 'action', 'credit']; } });

  Trophy.prototype.connectedCallback = function () {
    if (!this._root) {
      var r = this._root = this.attachShadow({ mode: 'open' }), PH;
      r.innerHTML = '<style>' + CSS + '</style><div class="card">' +
        '<span class="forest" aria-hidden="true">' + (PH = pick3()).map(function (p, i) { return '<i class="' + (i % 2 ? 'out' : '') + '" style="' + bgOf(p) + ';animation-delay:' + (i * 11) + 's"></i>'; }).join('') + '<b></b></span>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<span class="logo" aria-hidden="true"><svg width="15" height="18" viewBox="3.4 5 17.2 20.9"><path fill="currentColor" fill-rule="evenodd" d="' + LOGO + '"/><path d="M12 21.3V24M5.2 25.2Q12 23.3 18.8 23.8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Forest Fire Watch</span>' +
        '<span class="cup" aria-hidden="true"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="' + TROPHY + '"/></svg></span>' +
        '<span class="kicker"></span><span class="headline"></span><span class="sub"></span><span class="act"></span>' +
        '<span class="credit">' + PH.map(function (p, i) { return '<span style="animation-delay:' + (i * 11) + 's">Photo: ' + p.by + ' / Unsplash</span>'; }).join('') + '</span></div>';
      this._cv = r.querySelector('canvas'); this._cup = r.querySelector('.cup'); this._card = r.querySelector('.card');
      // A layer that has just faded out comes round again with a new photo, not one on screen or about to show
      var layers = [].slice.call(r.querySelectorAll('.forest i')), credits = [].slice.call(r.querySelectorAll('.credit span')), shown = PH.map(function (p) { return p.f; }), groups = PH.map(function (p) { return p.g; });
      var ahead = function (i) { var p = window.__wfPhotoOther ? window.__wfPhotoOther(shown, groups[i]) : null; if (p) (new Image()).src = 'assets/splash/' + p.f; return p; }, nextP = layers.map(function (el, i) { return ahead(i); });
      layers.forEach(function (el, i) { el.addEventListener('animationiteration', function (e) {
        if (e.animationName !== 'f' || !nextP[i]) return;
        var p = nextP[i]; shown[i] = p.f; el.style.backgroundImage = 'url(assets/splash/' + p.f + ')'; el.style.filter = p.b < 1 ? 'brightness(' + p.b + ')' : 'none';
        if (credits[i]) credits[i].textContent = 'Photo: ' + p.by + ' / Unsplash'; nextP[i] = ahead(i); }); });
    }
    this.fill(); this.startSparks();
  };
  Trophy.prototype.disconnectedCallback = function () { this._run = false; };
  Trophy.prototype.attributeChangedCallback = function () { if (this._root) this.fill(); };
  Trophy.prototype.fill = function () {
    var r = this._root, self = this;
    [['kicker', '.kicker'], ['headline', '.headline'], ['sub', '.sub'], ['action', '.act']].forEach(function (a) {
      var el = r.querySelector(a[1]), v = self.getAttribute(a[0]) || ''; if (el.textContent !== v) el.textContent = v; el.hidden = !v; });
    r.querySelector('.credit').hidden = this.getAttribute('credit') !== '1';
  };
  Trophy.prototype.startSparks = function () {
    if (this._run) return; this._run = true;
    var self = this, parts = [];
    // One burst per turn of the trophy: sparks stream out from the moment it starts turning until it stops (the turn is
    // 14% of the 8 s spin). Every burst is different: its own shape, spark count, reach, speed, sweep, curl and rhythm,
    // and each spark its own size (radius 2 px up to 4.5 px), so no two bursts look the same.
    var rnd = function (a, b) { return a + Math.random() * (b - a); }, last = '', TURN = 8000 * 0.14;
    var show = function () {
      var R = self._card.getBoundingClientRect(), T = self._cup.getBoundingClientRect(); if (!R.width) return;
      var cx = T.left + T.width / 2 - R.left, cy = T.top + T.height / 2 - R.top, r0 = T.width / 2, t0 = performance.now();
      var shapes = ['scatter', 'ring', 'rings', 'spiral', 'fan'].filter(function (k) { return k !== last; }), shape = shapes[Math.floor(Math.random() * shapes.length)]; last = shape;
      var n = Math.round(rnd(320, 385)), rot = rnd(0, Math.PI * 2), reach = rnd(0.7, 1), life = rnd(1300, 2000), curl = shape === 'spiral' ? rnd(18, 36) * (Math.random() < 0.5 ? -1 : 1) : rnd(-8, 8);
      var sweep = (Math.random() < 0.5 ? -1 : 1) * rnd(0.5, 2) * Math.PI * 2, fanDir = rnd(0, Math.PI * 2), fanW = rnd(Math.PI * 0.9, Math.PI * 1.5);
      var pulses = Math.floor(rnd(0, 4)), depth = rnd(0.3, 0.8), ph = rnd(0, Math.PI * 2);   // the stream's rhythm: steady, or in 1 to 3 swells
      var ring = Math.round(rnd(14, 26));   // sparks per ring for the ring shapes
      for (var i = 0; i < n; i++) {
        var u = i / n;
        if (pulses) u = u - depth * Math.sin(u * pulses * Math.PI * 2 + ph) / (pulses * Math.PI * 2) * 0.5;   // bunch sparks into swells
        u = Math.min(1, Math.max(0, u));
        var turn = rot + sweep * u, j = i % ring;
        var a = shape === 'ring' ? turn + j / ring * Math.PI * 2 + rnd(-0.05, 0.05)
          : shape === 'spiral' ? turn + (i % 3) * Math.PI * 2 / 3 + rnd(-0.08, 0.08)
          : shape === 'rings' ? turn + j / ring * Math.PI * 2 + (Math.floor(i / ring) % 2) * Math.PI / ring
          : shape === 'fan' ? fanDir + sweep * 0.25 * u + rnd(-fanW / 2, fanW / 2) : Math.random() * Math.PI * 2;
        var dx = Math.cos(a), dy = Math.sin(a);
        var tx = dx > 0 ? (R.width - cx) / dx : dx < 0 ? -cx / dx : 1e9, ty = dy > 0 ? (R.height - cy) / dy : dy < 0 ? -cy / dy : 1e9;   // to the photo's edge
        var edge = Math.max(10, Math.min(tx, ty) - r0), k = shape === 'rings' ? (Math.floor(i / ring) % 2 ? rnd(0.5, 0.65) : 1) : shape === 'scatter' || shape === 'fan' ? rnd(0.55, 1) : rnd(0.9, 1);
        parts.push({ x0: cx + dx * r0, y0: cy + dy * r0, dx: dx, dy: dy, d: edge * reach * k, curl: curl * rnd(0.7, 1.3), born: t0 + u * TURN, life: life * rnd(0.8, 1.2), r: rnd(2, 4.5) });
      }
    };
    if (!this._lis && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      this._lis = true; var sv = this._cup.querySelector('svg'), onTurn = function (e) { if (e.animationName === 'spin' && self._run) show(); };
      sv.addEventListener('animationstart', onTurn); sv.addEventListener('animationiteration', onTurn);
    }
    var SPR = document.createElement('canvas'); (function () { var z = 64, c = SPR.getContext('2d'); SPR.width = SPR.height = z;
      var rr = z / 2 * (4.5 * 2) / (4.5 * 2 + 12); c.shadowColor = 'rgba(215,244,26,0.8)'; c.shadowBlur = z / (4.5 * 2 + 12) * 6; c.fillStyle = '#D7F41A'; c.beginPath(); c.arc(z / 2, z / 2, rr, 0, Math.PI * 2); c.fill(); })();   // one glowing spark, drawn once and reused
    var draw = function () {
      if (!self._run) return;
      var cv = self._cv, R = self._card.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, W = Math.round(R.width * dpr), H = Math.round(R.height * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, R.width, R.height);
      var now = performance.now();
      parts = parts.filter(function (q) { return now - q.born < q.life; });
      var live = parts.filter(function (q) { return now >= q.born; });

      live.forEach(function (q) { var t = (now - q.born) / q.life, e = 1 - Math.pow(1 - t, 2), w = q.curl * e * e, S = q.r * 21 / 4.5;   // curl: a sideways drift; the sprite scales with the spark
        g.globalAlpha = Math.max(0, 1 - e); g.drawImage(SPR, q.x0 + q.dx * q.d * e - q.dy * w - S / 2, q.y0 + q.dy * q.d * e + q.dx * w - S / 2, S, S); });
      g.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  customElements.define('wf-trophy', Trophy);
})();
