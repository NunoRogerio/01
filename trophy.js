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
  var PHOTO = {
    s: [['assets/crews/crew-s.jpg?v=1', 'Photo: Everglades National Park / U.S. National Park Service'], ['assets/crews/crew-s2.jpg?v=1', 'Photo: USDA / U.S. Forest Service'], ['assets/crews/crew-s3.jpg?v=1', 'Photo: U.S. Marine Corps / Lance Cpl. Hannah Hollerud'], ['assets/crews/crew-s4.jpg?v=1', 'Photo: U.S. Space Force / Airman Wyatt Stabler']],
    m: [['assets/crews/crew-m.jpg?v=1', 'Photo: U.S. Army / Balmina Sehra'], ['assets/crews/crew-m2.jpg?v=1', 'Photo: Region 5 Photography. CC BY 2.0'], ['assets/crews/crew-m3.jpg?v=1', 'Photo: Michael Rieger / FEMA']],
    l: [['assets/crews/crew-l.jpg?v=1', 'Photo: U.S. Navy / Brianna Bonilla'], ['assets/crews/crew-l2.jpg?v=1', 'Photo: Vlada Republike Slovenije'], ['assets/crews/crew-l3.jpg?v=1', 'Photo: U.S. Air Force / Airman 1st Class Nichelle Griffiths'], ['assets/crews/crew-l4.jpg?v=1', 'Photo: Bureau of Land Management California']] };
  // (Oct 5) the aerial team's own people with their aircraft: pilots in front of their helicopters, ground crews at work
  var UX = function (id) { return 'https://images.unsplash.com/' + id + '?w=900&q=70&auto=format&fit=crop'; }, PX = function (id) { return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=900'; };
  var AIRPEOPLE = [[UX('photo-1761357294320-af17a49848d4'), 'Photo: luke fancher / Unsplash'], [UX('photo-1761357294010-062e0df6d3a0'), 'Photo: luke fancher / Unsplash'], [UX('photo-1780768160920-fcca9193b7bc'), 'Photo: Niklas Jonasson / Unsplash'],
    [UX('photo-1772140994501-a12bbc57a1e5'), 'Photo: Navy Medicine / Unsplash'], [PX(15974654), 'Photo: Toulouse / Pexels'], [PX(33954113), 'Photo: sametkarakocofficial / Pexels'], [PX(9691823), 'Photo: mutecevvil / Pexels']];
  var AIRP = [['assets/air/air-h1.jpg?v=1', 'Photo: Alan Radecki. CC BY 2.5'], ['assets/air/air-h2.jpg?v=1', 'Photo: Jim Bahn. CC BY 2.0'], ['assets/air/air-h3.jpg?v=1', 'Photo: U.S. Forest Service'],
    ['assets/air/air-p1.jpg?v=1', 'Photo: Lisa Cox / U.S. Forest Service'], ['assets/air/air-p2.jpg?v=1', 'Photo: Michael Rieger / FEMA'], ['assets/air/air-p3.jpg?v=1', 'Photo: Adam Dubrowa / FEMA']];
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
  // (Oct 5, 10:03) the photo carousel's own look, shared by the resolution card and the evidence photos (wf-slides)
  var SLCSS =
    '.sl{position:absolute;inset:0;z-index:-2;overflow:hidden}.tk{display:flex;height:100%;will-change:transform}.tk.go{transition:transform .9s cubic-bezier(.4,0,.2,1)}' +
    '.ph{flex:0 0 auto;height:100%;background-color:#1E2B22;background-size:cover;background-position:center 22%}' +
    '.dots{position:absolute;left:0;right:0;top:12px;display:flex;justify-content:center;align-items:center;gap:8px;pointer-events:none}.dots i{display:block;width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.5);transition:width .4s cubic-bezier(.2,.8,.2,1),background-color .4s ease}.dots i.on{width:20px;background:#FFFFFF}';
  var CSS = SLCSS +
    ':host{display:block}' +
    '.card{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;gap:4px;min-height:320px;touch-action:pan-y;padding:16px 16px 24px;border-radius:20px;background:#1E2B22;color:#FFFFFF;text-align:left;font:inherit;cursor:inherit}' +
    /* (Oct 5, 16:51) the bottom half darker so the text reads on any photo; the top as before */
    '.sh{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.32) 0%,rgba(0,0,0,.05) 28%,rgba(0,0,0,.34) 44%,rgba(0,0,0,.72) 60%,rgba(0,0,0,.84) 80%,rgba(0,0,0,.88) 100%)}' +
    /* (Oct 5, 03:34) the pagination as Apple draws it now: plain white shapes, no shadow; the pages not shown are 8px circles, the one
       shown a 20px line with fully rounded ends; it stretches and shrinks as the pictures change */
    '.bd{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;margin-bottom:auto}' +
    /* (Oct 5, 16:51) the crests sit 16px under the pagination dots (12px + 8px dots + 16px = 36px from the top) and are 48px (was 60px) */
    '.dots:not([hidden])~.bd{margin-top:20px}' +
    '.bd img{display:block;box-sizing:border-box;width:min(48px,calc((100% - (var(--pr) - 1) * 8px) / var(--pr)));aspect-ratio:1;max-width:48px;object-fit:contain;background:none;filter:drop-shadow(0 0 8px rgba(0,0,0,.45))}' +
    '.kicker{font-size:16px;line-height:18px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.headline{font-size:26px;font-weight:700;line-height:30px;letter-spacing:.01em;color:var(--wf-y);text-shadow:0 0 12px rgba(0,0,0,.45)}' +
    '.fire{font-size:20px;font-weight:700;line-height:24px;color:#FFFFFF;text-wrap:balance;text-shadow:0 0 10px rgba(0,0,0,.5)}' +
    '.meta{font-size:16px;line-height:20px;color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.size{align-self:flex-start;padding:4px 16px;border-radius:8px;background:rgba(242,242,247,.62);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#1C1C1E;font-size:16px;line-height:20px;font-weight:600}' +
    '.act{display:flex;align-items:center;justify-content:center;align-self:stretch;height:48px;margin-top:12px;border-radius:999px;background:var(--wf-y);color:#1C1C1E;font-size:17px;font-weight:600}' +
    '.credit{margin-top:4px;font-size:12px;line-height:14px;color:rgba(255,255,255,.78);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.st{position:absolute;left:0;right:0;bottom:0;height:8px;background:repeating-linear-gradient(-45deg,var(--wf-y,#E5FF00) 0 16.97px,transparent 16.97px 33.94px);opacity:.6}' +
    /* (Oct 5, 16:58, Susana's idea) the crest of the station whose photo comes in swells once and settles, so each photo names its station */
    /* (Oct 5, 17:06 and 17:12, Susana) the crests rest at 60% and 5% darker; the one of the photo on screen at 100%, the change done as the pulse peaks (0.28 s) */
    '.bd img{opacity:.6;filter:brightness(.95) drop-shadow(0 0 8px rgba(0,0,0,.45));transition:opacity .2s ease .08s,filter .2s ease .08s}.bd img.on{opacity:1;filter:brightness(1) drop-shadow(0 0 8px rgba(0,0,0,.45))}' +
    '.bd img.pop{animation:pop .7s cubic-bezier(.3,0,.3,1)}@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}' +
    '[hidden]{display:none!important}' +
    '@media (prefers-reduced-motion:reduce){.tk.go{transition:none}.bd img.pop{animation:none}}';

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
    /* (Oct 5) the big yellow line names the fire's place (it replaced "Well done"); no separate place line */
    [['kicker', '.kicker'], ['fire', '.headline'], ['meta', '.meta'], ['size', '.size'], ['action', '.act']].forEach(function (a) {
      var el = r.querySelector(a[1]), v = self.getAttribute(a[0]) || (a[0] === 'fire' ? self.getAttribute('headline') || '' : ''); if (el.textContent !== v) el.textContent = v; el.hidden = !v; });
    r.querySelector('.fire').hidden = true;
    var C = []; try { C = JSON.parse(self.getAttribute('crests') || '[]') || []; } catch (e) {}
    var air = self.getAttribute('air') === '1', seed = hash(self.getAttribute('fire') || ''), n = parseInt(self.getAttribute('n') || '0', 10) || 0;
    // the photos: one per station (the size of the crew follows the number of stations), one of aircraft when air support helped
    var k = n >= 6 ? 'l' : n >= 3 ? 'm' : 's', pool = PHOTO[k], ns = Math.max(1, Math.max(n, C.length)), S = [];
    for (var i = 0; i < ns; i++) S.push(pool[(seed + i) % pool.length]);
    if (air) S.push(AIRPEOPLE[(seed >>> 3) % AIRPEOPLE.length]);   /* the air team: its people by their aircraft */
    var sk = S.map(function (x) { return x[0]; }).join('|');
    // photo i belongs to crest i (one photo per station); the air team's photo to the air badge (last); extra photos to none
    this._map = S.map(function (x, i) { return air && i === S.length - 1 ? C.length : i < C.length ? i : -1; });
    var fresh = false; if (sk !== this._sk) { this._sk = sk; this.slides(S); fresh = true; }
    var cr = r.querySelector('.credit'); cr.hidden = self.getAttribute('credit') !== '1'; this._cr = S.map(function (x) { return x[1]; }); cr.textContent = this._cr[this._i || 0] || '';
    // the crests of every station, then the air team's badge (original, from the fire's name), all shown
    var A = C.slice(); if (air) A.push({ n: 'Air support', air: 1, u: window.__wfAirBadge ? window.__wfAirBadge() : BADGES[seed % BADGES.length] });   /* (Oct 5) the same air badge as the crews and dispatch screens */
    var bd = r.querySelector('.bd'), key = JSON.stringify(A); if (bd.getAttribute('data-k') !== key) { bd.setAttribute('data-k', key);
      bd.style.setProperty('--pr', A.length <= 2 ? Math.max(1, A.length) : A.length <= 6 ? 3 : 4);
      bd.innerHTML = A.map(function (c) { return '<img src="' + esc(c.u) + '" data-crest="' + esc(c.n) + '" alt="' + esc(c.n) + '" title="' + esc(c.n) + '">'; }).join('');
      /* (Oct 6) crests on a transparent background (avatar.js clears a light square around them) */
      Array.prototype.forEach.call(bd.querySelectorAll('img'), function (im) { var f = function () { if (window.__wfCrestImg) window.__wfCrestImg(im); }; im.addEventListener('load', f); if (im.complete && im.naturalWidth) f(); }); }
    bd.hidden = !bd.innerHTML;
    if (fresh) this._pop(this._i || 0);
  };
  Trophy.prototype._pop = function (i) { var q = (this._map || [])[i], all = this._root.querySelectorAll('.bd img'), im = q >= 0 ? all[q] : null;
    Array.prototype.forEach.call(all, function (x) { x.classList.remove('pop'); if (x !== im) x.classList.remove('on'); }); if (!im) return; void im.offsetWidth; im.classList.add('pop', 'on'); };
  // the photos slide to the left on their own, 4 s each, in a loop (the first is repeated after the last, then the track jumps back unseen)
  // the carousel's behaviour, one definition for every carousel: self keeps its state, r is its shadow root, sw the element swiped
  function slideshow(self, r, S, sw) {
    var tk = r.querySelector('.tk'), dots = r.querySelector('.dots'), N = S.length, T = N > 1 ? S.concat([S[0]]) : S;
    clearInterval(self._iv); self._i = 0;
    tk.className = 'tk'; tk.style.width = (T.length * 100) + '%'; tk.style.transform = 'none';
    tk.innerHTML = T.map(function (x) { return '<span class="ph" style="width:' + (100 / T.length) + '%;background-image:url(' + x[0] + ')"></span>'; }).join('');
    dots.innerHTML = N > 1 ? S.map(function (x, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') : ''; dots.hidden = N < 2;
    if (N < 2) return;
    var go = function (i) { self._i = ((i % N) + N) % N; var cr = r.querySelector('.credit'); if (cr) cr.textContent = (self._cr || [])[self._i] || '';
      Array.prototype.forEach.call(dots.children, function (d, q) { d.classList.toggle('on', q === self._i); }); if (self._pop) self._pop(self._i); };
    // move the track to picture p (0..N, N being the copy of the first, which then jumps home unseen)
    // (Oct 5) never past the end: a step that lands while the copy of the first is still waiting to jump home (a swipe, or timers
    // catching up after the phone wakes) first jumps home unseen, then moves on; before, the track slid into empty space for good
    var to = function (p) { clearTimeout(self._jt);
      if (p > N) { tk.classList.remove('go'); tk.style.transform = 'none'; void tk.offsetWidth; p = 1; }
      p = Math.max(0, Math.min(N, p)); tk._p = p; tk.classList.add('go'); tk.style.transform = 'translateX(-' + (p * 100 / T.length) + '%)'; go(p);
      clearTimeout(self._jt); if (p === N) self._jt = setTimeout(function () { tk.classList.remove('go'); tk._p = 0; tk.style.transform = 'none'; }, 950); };
    var next = function () { to((tk._p || 0) + 1); };
    var prev = function () { var p = tk._p || 0; if (p === 0) { tk.classList.remove('go'); tk.style.transform = 'translateX(-' + (N * 100 / T.length) + '%)'; void tk.offsetWidth; p = N; } to(p - 1); };
    var auto = function () { clearInterval(self._iv); self._iv = setInterval(function () { if (!self.isConnected) { clearInterval(self._iv); return; } next(); }, 4000); };
    auto();
    // (Oct 5, 03:34) a swipe left or right cycles the pictures (the card's tap still opens the summary; a swipe never does)
    var card = sw;
    if (card && !card.__wfSw) { card.__wfSw = 1; var x0 = null, y0 = 0, sw = 0;
      card.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; }, { passive: true });
      card.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { sw = Date.now(); try { if (navigator.vibrate) navigator.vibrate(6); } catch (x) {} if (dx < 0) self._next(); else self._prev(); } }, { passive: true });
      card.addEventListener('pointercancel', function () { x0 = null; }, { passive: true });
      card.addEventListener('click', function (e) { if (Date.now() - sw < 400) { e.stopPropagation(); e.preventDefault(); } }, true); }
    self._next = function () { next(); auto(); }; self._prev = function () { prev(); auto(); };
  }
  Trophy.prototype.slides = function (S) { slideshow(this, this._root, S, this._root.querySelector('.card')); };
  // <wf-slides photos='[["src","credit"],…]'>: the same carousel on its own (Oct 5, 10:03: the evidence photos from cars and
  // phones), up to 5 pictures, sliding by themselves every 4 s, the dots on top, a swipe cycles them
  function Slides() { return Reflect.construct(HTMLElement, [], Slides); }
  Slides.prototype = Object.create(HTMLElement.prototype); Slides.prototype.constructor = Slides;
  Object.defineProperty(Slides, 'observedAttributes', { get: function () { return ['photos']; } });
  Slides.prototype.connectedCallback = function () {
    if (!this._root) { this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = '<style>' + SLCSS + ':host{display:block;position:relative}.box{position:absolute;inset:0;isolation:isolate;overflow:hidden;border-radius:inherit;touch-action:pan-y;background:#1E2B22}.sh{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 30%)}</style><div class="box"><div class="sl"><div class="tk"></div></div><span class="sh" aria-hidden="true"></span><div class="dots" aria-hidden="true"></div></div>'; }
    this._k = ''; this.fill(); };
  Slides.prototype.disconnectedCallback = function () { clearInterval(this._iv); this._iv = 0; this._k = ''; };
  Slides.prototype.attributeChangedCallback = function () { if (this._root) this.fill(); };
  Slides.prototype.fill = function () { var P = []; try { P = JSON.parse(this.getAttribute('photos') || '[]') || []; } catch (e) {}
    P = P.slice(0, 5).map(function (x) { return typeof x === 'string' ? [x, ''] : x; }); var k = JSON.stringify(P); if (k === this._k) return; this._k = k;
    slideshow(this, this._root, P, this._root.querySelector('.box')); };
  if (!customElements.get('wf-slides')) customElements.define('wf-slides', Slides);
  customElements.define('wf-trophy', Trophy);
})();
