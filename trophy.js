// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// The resolution card: one widget for every "fire resolved" card in the app (the card in the incident chat and the
// resolution summary). Change it here and every card changes. (Oct 4, 17:50: the trophy, the fireworks and the moving nature
// photos are gone; the card now shows the forces that did the job.)
//   <wf-trophy kicker="Fire resolved" headline="Well done" fire="Bouquet Fire" meta="Closed 4 Oct. 2 d 14 h"
//              size="Class D. 135 ac" crests='[{"u":"…","n":"Station 1"}]' air="1" n="3" action="See the summary" credit="1"></wf-trophy>
// - a group photo of firefighters with their engines behind, as the background: a small crew for 1 or 2 stations, a medium one
//   for 3 to 5, a large one for 6 or more (the photo follows the number of stations that took part)
// - the badges of the stations that collaborated, and an air support badge when aircraft helped
// - the message of well done, the fire's name, when it closed and how long it took, and its size class
// - the hazard stripe along the bottom edge, as on the blades
// - action: an optional full-width button label; a tap anywhere on the card reaches the page's own onClick
(function () {
  if (window.customElements && customElements.get('wf-trophy')) return;
  var PHOTO = { s: ['assets/crews/crew-s.jpg?v=1', 'Photo: Everglades National Park / U.S. National Park Service'], m: ['assets/crews/crew-m.jpg?v=1', 'Photo: U.S. Army / Balmina Sehra'], l: ['assets/crews/crew-l.jpg?v=1', 'Photo: U.S. Navy / Brianna Bonilla'] };
  var HELI = 'M3 7h18M12 7v3 M6 14a6 4 0 0 1 6-4h3.5a3.5 3.5 0 0 1 3.5 3.5V15H6Z M19 13.5l3-1.5 M9 18h8';
  var CSS =
    ':host{display:block}' +
    '.card{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;gap:8px;min-height:432px;padding:16px 16px 32px;border-radius:20px;background:#1E2B22;color:#FFFFFF;text-align:left;font:inherit;cursor:inherit}' +
    '.ph{position:absolute;inset:0;z-index:-2;background-size:cover;background-position:center 22%;opacity:0;transition:opacity .9s ease}.ph.on{opacity:1}' +
    '.sh{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.40) 0%,rgba(0,0,0,.06) 28%,rgba(0,0,0,.30) 46%,rgba(0,0,0,.74) 66%,rgba(0,0,0,.88) 100%)}' +
    '.bd{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:auto}' +
    '.bd img,.bd b{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:40px;height:40px;border-radius:50%;background:#FFFFFF;padding:4px;object-fit:contain;box-shadow:0 0 12px rgba(0,0,0,.35)}' +
    '.bd b{padding:0;font-size:15px;font-weight:600;color:#1C1C1E}' +
    '.bd .air{background:var(--wf-y);color:#1C1C1E}' +
    '.kicker{font-size:15px;line-height:18px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.headline{font-size:26px;font-weight:700;line-height:30px;letter-spacing:.01em;color:var(--wf-y);text-shadow:0 0 12px rgba(0,0,0,.45)}' +
    '.fire{font-size:20px;font-weight:700;line-height:24px;color:#FFFFFF;text-wrap:balance;text-shadow:0 0 10px rgba(0,0,0,.5)}' +
    '.meta{font-size:15px;line-height:20px;color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5)}' +
    '.size{align-self:flex-start;padding:4px 16px;border-radius:999px;background:rgba(242,242,247,.62);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#1C1C1E;font-size:15px;line-height:20px;font-weight:600}' +
    '.act{display:flex;align-items:center;justify-content:center;align-self:stretch;height:48px;margin-top:8px;border-radius:999px;background:var(--wf-y);color:#1C1C1E;font-size:17px;font-weight:600}' +
    '.credit{margin-top:4px;font-size:12px;line-height:14px;color:rgba(255,255,255,.78)}' +
    '.st{position:absolute;left:0;right:0;bottom:0;height:8px;background:repeating-linear-gradient(-45deg,var(--wf-y,#E5FF00) 0 16.97px,transparent 16.97px 33.94px);opacity:.9}' +
    '[hidden]{display:none!important}' +
    '@media (prefers-reduced-motion:reduce){.ph{transition:none}}';

  function Trophy() { return Reflect.construct(HTMLElement, [], Trophy); }
  Trophy.prototype = Object.create(HTMLElement.prototype);
  Trophy.prototype.constructor = Trophy;
  Object.defineProperty(Trophy, 'observedAttributes', { get: function () { return ['kicker', 'headline', 'fire', 'meta', 'size', 'crests', 'air', 'n', 'action', 'credit']; } });

  Trophy.prototype.connectedCallback = function () {
    if (!this._root) {
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = '<style>' + CSS + '</style><div class="card"><span class="ph" aria-hidden="true"></span><span class="sh" aria-hidden="true"></span>' +
        '<span class="bd"></span><span class="kicker"></span><span class="headline"></span><span class="fire"></span><span class="meta"></span><span class="size"></span><span class="act"></span><span class="credit"></span><span class="st" aria-hidden="true"></span></div>';
    }
    this.fill();
  };
  Trophy.prototype.attributeChangedCallback = function () { if (this._root) this.fill(); };
  Trophy.prototype.fill = function () {
    var r = this._root, self = this, esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    [['kicker', '.kicker'], ['headline', '.headline'], ['fire', '.fire'], ['meta', '.meta'], ['size', '.size'], ['action', '.act']].forEach(function (a) {
      var el = r.querySelector(a[1]), v = self.getAttribute(a[0]) || ''; if (el.textContent !== v) el.textContent = v; el.hidden = !v; });
    // the photo follows the number of stations: 1 or 2 a small crew, 3 to 5 a medium one, 6 or more a large one
    var n = parseInt(self.getAttribute('n') || '0', 10) || 0, k = n >= 6 ? 'l' : n >= 3 ? 'm' : 's', ph = r.querySelector('.ph'), cr = r.querySelector('.credit');
    if (ph.getAttribute('data-k') !== k) { ph.setAttribute('data-k', k); ph.classList.remove('on'); var im = new Image(), on = function () { if (ph.getAttribute('data-k') === k) { ph.style.backgroundImage = 'url(' + PHOTO[k][0] + ')'; ph.classList.add('on'); } }; im.onload = on; im.src = PHOTO[k][0]; }
    cr.textContent = PHOTO[k][1]; cr.hidden = self.getAttribute('credit') !== '1';
    // badges: the crests of the stations that took part (up to six, then a count), then the air support badge
    var C = []; try { C = JSON.parse(self.getAttribute('crests') || '[]') || []; } catch (e) {}
    var bd = r.querySelector('.bd'), key = self.getAttribute('crests') + '|' + self.getAttribute('air'); if (bd.getAttribute('data-k') === key) return; bd.setAttribute('data-k', key);
    bd.innerHTML = C.slice(0, 6).map(function (c) { return '<img src="' + esc(c.u) + '" alt="' + esc(c.n) + '" title="' + esc(c.n) + '">'; }).join('') +
      (C.length > 6 ? '<b aria-label="' + (C.length - 6) + ' more stations">+' + (C.length - 6) + '</b>' : '') +
      (self.getAttribute('air') === '1' ? '<b class="air" role="img" aria-label="Air support" title="Air support"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + HELI + '"/></svg></b>' : '');
    bd.hidden = !bd.innerHTML;
  };
  customElements.define('wf-trophy', Trophy);
})();
