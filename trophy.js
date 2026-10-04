// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The resolution card: one widget for every "fire resolved" card in the app (the card in the incident chat and the
// resolution summary). Change it here and every card changes. (Oct 4, 17:50: the trophy, the fireworks and the moving nature
// photos are gone; the card now shows the forces that did the job.)
//   <wf-trophy kicker="Fire resolved" headline="Well done" fire="Bouquet Fire" meta="Closed 4 Oct. 2 d 14 h"
//              size="Class D. 135 ac" crests='[{"u":"…","n":"Station 1"}]' air="1" n="3" action="See the summary" credit="1"></wf-trophy>
// - a group photo of firefighters with their engines behind, as the background: a small crew for 1 or 2 stations, a medium one
//   for 3 to 5, a large one for 6 or more (the photo follows the number of stations that took part). Oct 4: one photo per station,
//   and one of aircraft when air support helped; with more than one the photos slide to the left on their own, 4 s each, in a loop,
//   with round dots at the top. Each fire picks its own photos (from the fire's name).
// - the crests of every station that collaborated and, when aircraft helped, the air team's badge (it has no crest of its own:
//   one of five original squadron badges, picked from the fire's name): 120px, no circle, a soft drop shadow
// - the message of well done, the fire's name, when it closed and how long it took, and its size class
// - the hazard stripe along the bottom edge, as on the blades
// - action: an optional full-width button label; a tap anywhere on the card reaches the page's own onClick
(function () {
  if (window.customElements && customElements.get('wf-trophy')) return;
  // crew photos by size (credits shown for the photo on screen); aerial photos: 3 helicopters then 3 planes
  var PHOTO = { s: [['assets/crews/crew-s.jpg?v=1', 'Photo: Everglades National Park / U.S. National Park Service']], m: [['assets/crews/crew-m.jpg?v=1', 'Photo: U.S. Army / Balmina Sehra']], l: [['assets/crews/crew-l.jpg?v=1', 'Photo: U.S. Navy / Brianna Bonilla']] };
  var AIRP = [];
  var hash = function (t) { var h = 7; t = String(t || ''); for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
  // five original squadron-style badges for aerial teams (drawn here, no real insignia)
  var BADGES = [
    '<circle cx="60" cy="60" r="56" fill="#B3141B"/><circle cx="60" cy="60" r="46" fill="#FFFFFF"/><g fill="#1C1C1E"><rect x="56" y="18" width="8" height="84" rx="4"/><rect x="18" y="56" width="84" height="8" rx="4"/><circle cx="60" cy="60" r="12"/></g><circle cx="60" cy="60" r="5" fill="#E5FF00"/>',
    '<path d="M60 6 106 22v44c0 24-20 40-46 50C34 106 14 90 14 66V22Z" fill="#1C3A5E"/><path d="M60 24c-8 14-24 20-40 18 8 12 22 18 40 16 18 2 32-4 40-16-16 2-32-4-40-18Z" fill="#F2C94C"/><path d="M60 62c10 6 12 18 0 30-12-12-10-24 0-30Z" fill="#E8590C"/>',
    '<path d="M60 4 108 32v56L60 116 12 88V32Z" fill="#14532D"/><path d="M24 44 60 76 96 44 84 40 60 60 36 40Z" fill="#F2F2F7"/><path d="M52 78h16l-8 16Z" fill="#E5FF00"/><circle cx="45" cy="52" r="4" fill="#E5FF00"/><circle cx="75" cy="52" r="4" fill="#E5FF00"/>',
    '<circle cx="60" cy="60" r="56" fill="#0A66CC"/><circle cx="60" cy="60" r="48" fill="none" stroke="#F2C94C" stroke-width="4"/><path d="M60 22c14 20 24 32 24 46a24 24 0 0 1-48 0c0-14 10-26 24-46Z" fill="#FFFFFF"/><path d="M36 84c8-6 16-6 24 0s16 6 24 0" fill="none" stroke="#0A66CC" stroke-width="4" stroke-linecap="round"/>',
    '<circle cx="60" cy="60" r="56" fill="#1C1C1E"/><circle cx="60" cy="60" r="48" fill="none" stroke="#E5FF00" stroke-width="4"/><path d="m60 26 9.9 20.1 22.2 3.2-16 15.7 3.8 22L60 76.4 40.1 87l3.8-22-16-15.7 22.2-3.2Z" fill="#E5FF00"/><path d="M14 64c12-4 20-2 26 6M106 64c-12-4-20-2-26 6" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>'
  ].map(function (g) { return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' + g + '</svg>'); });
  var HELI = 'M3 7h18M12 7v3 M6 14a6 4 0 0 1 6-4h3.5a3.5 3.5 0 0 1 3.5 3.5V15H6Z M19 13.5l3-1.5 M9 18h8';
  var CSS =
    ':host{display:block}' +
    '.card{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;gap:8px;min-height:432px;padding:32px 16px 32px;border-radius:20px;background:#1E2B22;color:#FFFFFF;text-align:left;font:inherit;cursor:inherit}' +
    '.sl{position:absolute;inset:0;z-index:-2;overflow:hidden}.tk{display:flex;height:100%;will-change:transform}.tk.go{transition:transform .9s cubic-bezier(.4,0,.2,1)}' +
    '.ph{flex:0 0 auto;height:100%;background-color:#1E2B22;background-size:cover;background-position:center 22%}' +
    '.sh{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.40) 0%,rgba(0,0,0,.06) 28%,rgba(0,0,0,.30) 46%,rgba(0,0,0,.74) 66%,rgba(0,0,0,.88) 100%)}' +
    '.dots{position:absolute;left:0;right:0;top:12px;display:flex;justify-content:center;gap:8px;pointer-events:none}.dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.45);box-shadow:0 0 6px rgba(0,0,0,.35);transition:background .3s ease,transform .3s ease}.dots i.on{background:#FFFFFF;transform:scale(1.25)}' +
    '.bd{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;margin-bottom:auto}' +
    '.bd img{display:block;box-sizing:border-box;width:min(120px,calc((100% - (var(--pr) - 1) * 8px) / var(--pr)));aspect-ratio:1;max-width:120px;object-fit:contain;background:none;filter:drop-shadow(0 0 8px rgba(0,0,0,.45))}' +
    '.kicker{font-size:15px;line-height:18px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.headline{font-size:26px;font-weight:700;line-height:30px;letter-spacing:.01em;color:var(--wf-y);text-shadow:0 0 12px rgba(0,0,0,.45)}' +
    '.fire{font-size:20px;font-weight:700;line-height:24px;color:#FFFFFF;text-wrap:balance;text-shadow:0 0 10px rgba(0,0,0,.5)}' +
    '.meta{font-size:15px;line-height:20px;color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.size{align-self:flex-start;padding:4px 16px;border-radius:999px;background:rgba(242,242,247,.62);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#1C1C1E;font-size:15px;line-height:20px;font-weight:600}' +
    '.act{display:flex;align-items:center;justify-content:center;align-self:stretch;height:48px;margin-top:8px;border-radius:999px;background:var(--wf-y);color:#1C1C1E;font-size:17px;font-weight:600}' +
    '.credit{margin-top:4px;font-size:12px;line-height:14px;color:rgba(255,255,255,.78)}' +
    '.st{position:absolute;left:0;right:0;bottom:0;height:8px;background:repeating-linear-gradient(-45deg,var(--wf-y,#E5FF00) 0 16.97px,transparent 16.97px 33.94px);opacity:.9}' +
    '[hidden]{display:none!important}' +
    '@media (prefers-reduced-motion:reduce){.tk.go{transition:none}}';

  function Trophy() { return Reflect.construct(HTMLElement, [], Trophy); }
  Trophy.prototype = Object.create(HTMLElement.prototype);
  Trophy.prototype.constructor = Trophy;
  Object.defineProperty(Trophy, 'observedAttributes', { get: function () { return ['kicker', 'headline', 'fire', 'meta', 'size', 'crests', 'air', 'n', 'action', 'credit']; } });

  Trophy.prototype.connectedCallback = function () {
    if (!this._root) {
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = '<style>' + CSS + '</style><div class="card"><div class="sl" aria-hidden="true"><div class="tk"></div></div><span class="sh" aria-hidden="true"></span><div class="dots" aria-hidden="true"></div>' +
        '<span class="bd"></span><span class="kicker"></span><span class="headline"></span><span class="fire"></span><span class="meta"></span><span class="size"></span><span class="act"></span><span class="credit"></span><span class="st" aria-hidden="true"></span></div>';
    }
    this.fill();
  };
  Trophy.prototype.disconnectedCallback = function () { clearInterval(this._iv); this._iv = 0; this._sk = ''; };
  Trophy.prototype.attributeChangedCallback = function () { if (this._root) this.fill(); };
  Trophy.prototype.fill = function () {
    var r = this._root, self = this, esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    [['kicker', '.kicker'], ['headline', '.headline'], ['fire', '.fire'], ['meta', '.meta'], ['size', '.size'], ['action', '.act']].forEach(function (a) {
      var el = r.querySelector(a[1]), v = self.getAttribute(a[0]) || ''; if (el.textContent !== v) el.textContent = v; el.hidden = !v; });
    var C = []; try { C = JSON.parse(self.getAttribute('crests') || '[]') || []; } catch (e) {}
    var air = self.getAttribute('air') === '1', seed = hash(self.getAttribute('fire') || ''), n = parseInt(self.getAttribute('n') || '0', 10) || 0;
    // the photos: one per station (the size of the crew follows the number of stations), one of aircraft when air support helped
    var k = n >= 6 ? 'l' : n >= 3 ? 'm' : 's', pool = PHOTO[k], ns = Math.max(1, Math.max(n, C.length)), S = [];
    for (var i = 0; i < ns; i++) S.push(pool[(seed + i) % pool.length]);
    if (air && AIRP.length) S.push(AIRP[(seed >> 3) % AIRP.length]);
    var sk = S.map(function (x) { return x[0]; }).join('|');
    if (sk !== this._sk) { this._sk = sk; this.slides(S); }
    var cr = r.querySelector('.credit'); cr.hidden = self.getAttribute('credit') !== '1'; this._cr = S.map(function (x) { return x[1]; }); cr.textContent = this._cr[this._i || 0] || '';
    // the crests of every station, then the air team's badge (original, from the fire's name), all shown
    var A = C.slice(); if (air) A.push({ n: 'Air support', air: 1, u: BADGES[seed % BADGES.length] });
    var bd = r.querySelector('.bd'), key = JSON.stringify(A); if (bd.getAttribute('data-k') !== key) { bd.setAttribute('data-k', key);
      bd.style.setProperty('--pr', A.length <= 2 ? Math.max(1, A.length) : A.length <= 6 ? 3 : 4);
      bd.innerHTML = A.map(function (c) { return '<img src="' + esc(c.u) + '" alt="' + esc(c.n) + '" title="' + esc(c.n) + '">'; }).join(''); }
    bd.hidden = !bd.innerHTML;
  };
  // the photos slide to the left on their own, 4 s each, in a loop (the first is repeated after the last, then the track jumps back unseen)
  Trophy.prototype.slides = function (S) {
    var r = this._root, tk = r.querySelector('.tk'), dots = r.querySelector('.dots'), self = this, N = S.length, T = N > 1 ? S.concat([S[0]]) : S;
    clearInterval(this._iv); this._i = 0;
    tk.className = 'tk'; tk.style.width = (T.length * 100) + '%'; tk.style.transform = 'none';
    tk.innerHTML = T.map(function (x) { return '<span class="ph" style="width:' + (100 / T.length) + '%;background-image:url(' + x[0] + ')"></span>'; }).join('');
    dots.innerHTML = N > 1 ? S.map(function (x, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') : ''; dots.hidden = N < 2;
    if (N < 2) return;
    var go = function (i) { self._i = i % N; var cr = r.querySelector('.credit'); if (cr) cr.textContent = (self._cr || [])[self._i] || '';
      Array.prototype.forEach.call(dots.children, function (d, q) { d.classList.toggle('on', q === self._i); }); };
    this._iv = setInterval(function () {
      if (!self.isConnected) { clearInterval(self._iv); return; }
      var next = (tk._p || 0) + 1; tk._p = next; tk.classList.add('go'); tk.style.transform = 'translateX(-' + (next * 100 / T.length) + '%)'; go(next);
      if (next === N) setTimeout(function () { tk.classList.remove('go'); tk._p = 0; tk.style.transform = 'none'; }, 950);
    }, 4000);
  };
  customElements.define('wf-trophy', Trophy);
})();
