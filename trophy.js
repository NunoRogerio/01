// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The trophy card: one widget for every "fire resolved" card in the app (the card in the incident chat and the
// resolution summary). Change it here and every trophy card changes.
//   <wf-trophy kicker="Fire resolved · 07:06" headline="Resolved in 2 d 14 h" sub="~10 people · ~3 vehicles"
//              action="See the summary" credit="1"></wf-trophy>
// - forest photos cycling like the login screen (two zoom in, one zooms out), the credit following the photo
// - the small Forest Fire Watch logo on top, as on the login screen (yellow on the photo, soft shadows, no blink)
// - the trophy in its yellow circle, turning a full circle on its vertical axis every 8 s
// - yellow fireworks: sparks leave the trophy's circle at full opacity and fade out at the photo's edges;
//   a 5 s show every 10 s, starting straight away
// - action: an optional full-width button label; a tap anywhere on the card reaches the page's own onClick
(function () {
  if (window.customElements && customElements.get('wf-trophy')) return;
  var LOGO = 'M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z';
  var TROPHY = 'M8 3.5h8v5.5a4 4 0 0 1-8 0Z M8 5.5H4.5v1.2A3.3 3.3 0 0 0 8 10 M16 5.5h3.5v1.2A3.3 3.3 0 0 1 16 10 M12 13v3.5 M8 20.5h8 M9.5 16.5h5v4h-5Z';
  var PH = [['forest-1.webp', 'Mari Potter', 0], ['forest-2.webp', 'Ivan Dimitrov', 1], ['forest-3.webp', 'Olena Bohovyk', 0]];   // 1 = zooms out
  var CSS =
    ':host{display:block}' +
    '.card{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;border-radius:20px;background:#1E2B22;color:#FFFFFF;text-align:center;font:inherit;cursor:inherit}' +
    '.forest{position:absolute;inset:0;z-index:-2;overflow:hidden;pointer-events:none}' +
    '.forest i{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;animation:o 33s linear infinite,zi 33s linear infinite}' +
    '.forest i.out{animation-name:o,zo}' +
    '.forest b{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.42) 45%,rgba(0,0,0,0.66) 100%)}' +
    '@keyframes o{0%{opacity:0}4.8%{opacity:1}33.3%{opacity:1}38.2%{opacity:0}100%{opacity:0}}' +
    '@keyframes zi{0%{transform:scale(1);animation-timing-function:cubic-bezier(.3,.1,.3,1)}38%{transform:scale(1.3)}100%{transform:scale(1.3)}}' +
    '@keyframes zo{0%{transform:scale(1.3);animation-timing-function:cubic-bezier(.3,.1,.3,1)}38%{transform:scale(1)}100%{transform:scale(1)}}' +
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
    '.credit span{grid-area:1/1;opacity:0;animation:o 33s linear infinite}' +
    '[hidden]{display:none!important}' +
    '@media (prefers-reduced-motion:reduce){.forest i,.cup svg,.credit span{animation:none}.forest i:first-child,.credit span:first-child{opacity:1}}';

  function Trophy() { return Reflect.construct(HTMLElement, [], Trophy); }
  Trophy.prototype = Object.create(HTMLElement.prototype);
  Trophy.prototype.constructor = Trophy;
  Object.defineProperty(Trophy, 'observedAttributes', { get: function () { return ['kicker', 'headline', 'sub', 'action', 'credit']; } });

  Trophy.prototype.connectedCallback = function () {
    if (!this._root) {
      var r = this._root = this.attachShadow({ mode: 'open' });
      r.innerHTML = '<style>' + CSS + '</style><div class="card">' +
        '<span class="forest" aria-hidden="true">' + PH.map(function (p, i) { return '<i class="' + (p[2] ? 'out' : '') + '" style="background-image:url(assets/splash/' + p[0] + ');animation-delay:' + (i * 11) + 's"></i>'; }).join('') + '<b></b></span>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<span class="logo" aria-hidden="true"><svg width="15" height="18" viewBox="3.4 5 17.2 20.9"><path fill="currentColor" fill-rule="evenodd" d="' + LOGO + '"/><path d="M12 21.3V24M5.2 25.2Q12 23.3 18.8 23.8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Forest Fire Watch</span>' +
        '<span class="cup" aria-hidden="true"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="' + TROPHY + '"/></svg></span>' +
        '<span class="kicker"></span><span class="headline"></span><span class="sub"></span><span class="act"></span>' +
        '<span class="credit">' + PH.map(function (p, i) { return '<span style="animation-delay:' + (i * 11) + 's">Photo: ' + p[1] + ' / Unsplash</span>'; }).join('') + '</span></div>';
      this._cv = r.querySelector('canvas'); this._cup = r.querySelector('.cup'); this._card = r.querySelector('.card');
    }
    this.fill(); this.startSparks();
  };
  Trophy.prototype.disconnectedCallback = function () { clearInterval(this._iv); this._iv = 0; this._run = false; };
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
    var burst = function () {
      var R = self._card.getBoundingClientRect(), T = self._cup.getBoundingClientRect(); if (!R.width) return;
      var cx = T.left + T.width / 2 - R.left, cy = T.top + T.height / 2 - R.top, r0 = T.width / 2, now = performance.now();
      for (var i = 0; i < 46; i++) {
        var a = Math.random() * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
        var tx = dx > 0 ? (R.width - cx) / dx : dx < 0 ? -cx / dx : 1e9, ty = dy > 0 ? (R.height - cy) / dy : dy < 0 ? -cy / dy : 1e9;   // to the photo's edge
        parts.push({ x0: cx + dx * r0, y0: cy + dy * r0, dx: dx, dy: dy, d: Math.max(10, Math.min(tx, ty) - r0), born: now, life: 1500 + Math.random() * 900, r: 1.4 + Math.random() * 1.8 });
      }
    };
    var show = function () { burst(); setTimeout(burst, 1100); setTimeout(burst, 2200); };   // three bursts, all faded out within 5 s
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { setTimeout(show, 300); this._iv = setInterval(show, 10000); }
    var draw = function () {
      if (!self._run) return;
      var cv = self._cv, R = self._card.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, W = Math.round(R.width * dpr), H = Math.round(R.height * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, R.width, R.height);
      var now = performance.now();
      parts = parts.filter(function (q) { return now - q.born < q.life; });
      g.fillStyle = '#D7F41A'; g.shadowColor = 'rgba(215,244,26,0.8)'; g.shadowBlur = 6;
      parts.forEach(function (q) { var t = (now - q.born) / q.life, e = 1 - Math.pow(1 - t, 2);
        g.globalAlpha = Math.max(0, 1 - e); g.beginPath(); g.arc(q.x0 + q.dx * q.d * e, q.y0 + q.dy * q.d * e, q.r, 0, Math.PI * 2); g.fill(); });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  customElements.define('wf-trophy', Trophy);
})();
