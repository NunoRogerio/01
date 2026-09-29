// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// User preferences: theme (light / dark) and text size (condensed / normal / comfortable).
// The screens are written with inline light-theme colours and pixel font sizes, so the preferences are applied as
// one override style sheet: every known colour and size is matched where the browser writes it and swapped.
// Changes apply at once, on every screen, and are kept per signed-in profile.
(function () {
  var role = '';
  try { role = localStorage.getItem('wf-role') || ''; } catch (e) {}
  function key(k) { return 'wf-' + k + (role ? '-' + role : ''); }
  function get(k, d) { try { return localStorage.getItem(key(k)) || d; } catch (e) { return d; } }

  // Demo profiles (the same people as the login screen): [id, initials, name, title, organisation, access, photo, language]
  var PEOPLE = {
    pt: ['RC', 'Rita Cardoso', 'Comandante Nacional de Emergência e Proteção Civil', 'ANEPC · Comando Nacional', 'Portugal region only', 'https://images.unsplash.com/photo-1771254507173-e40b54571924?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'pt'],
    ca: ['MR', 'Marcus Reyes', 'Deputy Director, Fire Protection', 'CAL FIRE · Sacramento', 'California region only', 'https://images.unsplash.com/photo-1713689824350-929a848279c4?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'en'],
    nv: ['DW', 'Dana Whitfield', 'State Forester Firewarden', 'Nevada Division of Forestry', 'Nevada region only', 'https://images.unsplash.com/photo-1779988208387-d7be2c69194b?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'en'],
    amz: ['RN', 'Rafael Nogueira', 'Coordenador de Operações do Prevfogo na Amazônia Legal', 'Ibama · Prevfogo · Manaus', 'Amazônia Legal region only', '', 'en'],
    design: ['SV', 'Susana Vasconcellos', 'Lead product designer', 'Forest Fire Watch', 'All regions', 'assets/people/susana.jpg?v=1', 'pt'],
    admin: ['NR', 'Nuno Rogerio', 'Platform administrator', 'Forest Fire Watch', 'All regions', 'assets/people/nuno.jpg?v=2', 'en']
  };

  // ---- Text size: every pixel font size (and line height) one notch up or down ----
  var SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 28, 30, 34];
  var LINES = [12, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 36];
  var STEP = { comfortable: 1.1, condensed: 0.92 };
  function fontCss(mode) {
    var f = STEP[mode]; if (!f) return '';
    var r = function (v) { return Math.round(v * f); }, out = [];
    SIZES.forEach(function (v) {
      out.push('[style*="font-size: ' + v + 'px"]{font-size:' + r(v) + 'px!important}');
      out.push('text[font-size="' + v + '"]{font-size:' + r(v) + 'px!important}');
    });
    LINES.forEach(function (v) { out.push('[style*="line-height: ' + v + 'px"]{line-height:' + r(v) + 'px!important}'); });
    // Sizes the screens set in their own style sheets
    out.push('.kpi{font-size:' + r(30) + 'px!important}.kpi small,.lbl{font-size:' + r(15) + 'px!important}.ctip b{font-size:' + r(17) + 'px!important}');
    return out.join('\n');
  }

  // ---- Dark theme: iOS dark system colours in place of the light ones ----
  // Inline colours reach the page as rgb()/rgba() text, so they are matched in that form.
  function col(prop, from, to) {   // 'color' must not match background-color / border-color
    if (prop === 'color') return '[style^="color: ' + from + '"],[style*="; color: ' + from + '"]{color:' + to + '!important}';
    return '[style*="' + prop + ': ' + from + '"]{' + prop + ':' + to + '!important}';
  }
  function darkCss() {
    var o = [];
    [['rgb(242, 242, 247)', '#262629'], ['rgb(255, 255, 255)', '#333336'], ['rgb(238, 238, 240)', '#333336'], ['rgb(229, 229, 234)', '#404043'],
      ['rgb(227, 227, 232)', '#404043'],
      ['rgba(118, 118, 128, 0.12)', 'rgba(118,118,128,0.24)'], ['rgba(60, 60, 67, 0.3)', 'rgba(235,235,245,0.3)'], ['rgba(60, 60, 67, 0.12)', 'rgba(235,235,245,0.12)'],
      ['rgba(52, 199, 89, 0.08)', 'rgba(48,209,88,0.16)'], ['rgba(52, 199, 89, 0.12)', 'rgba(48,209,88,0.18)'], ['rgba(204, 153, 0, 0.12)', 'rgba(255,214,10,0.16)'],
      ['rgba(0, 121, 166, 0.1)', 'rgba(90,200,250,0.16)'], ['rgba(0, 113, 227, 0.06)', 'rgba(64,156,255,0.14)']
    ].concat([0.7, 0.72, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.95, 0.97, 0.98].map(function (a) {   // frosted white panels, chips and pills
      return ['rgba(255, 255, 255, ' + a + ')', 'rgba(51,51,54,' + Math.max(a, 0.82) + ')']; }))
    .concat([0.7, 0.78, 0.8, 0.85, 0.88, 0.9, 0.92, 0.94, 0.96, 0.97, 0.98].map(function (a) {   // frosted grey map controls and legend chips
      return ['rgba(242, 242, 247, ' + a + ')', 'rgba(38,38,41,' + Math.max(a, 0.88) + ')']; }))
    .forEach(function (p) { o.push(col('background', p[0], p[1])); o.push(col('background-color', p[0], p[1])); });
    [['rgb(0, 0, 0)', '#E8E8ED'], ['rgb(84, 84, 88)', '#AEAEB2'], ['rgb(60, 60, 67)', '#D1D1D6'], ['rgb(72, 72, 74)', '#AEAEB2'], ['rgb(152, 152, 159)', '#8E8E93'],
      ['rgb(0, 98, 204)', '#409CFF'], ['rgb(0, 106, 145)', '#5AC8FA'], ['rgb(0, 113, 227)', '#409CFF'], ['rgb(10, 111, 219)', '#409CFF'], ['rgb(30, 122, 52)', '#30D158'],
      ['rgb(122, 86, 0)', '#FFD60A'], ['rgb(163, 72, 0)', '#FF9F0A'], ['rgb(176, 0, 26)', '#FF6961'], ['rgb(122, 63, 224)', '#BF5AF2']
    ].forEach(function (p) { o.push(col('color', p[0], p[1])); });
    o.push('[style*="solid rgba(60, 60, 67"]{border-color:rgba(84,84,88,0.65)!important}');
    o.push('svg [stroke="#545458"]{stroke:#AEAEB2}');
    o.push('[style*="text-shadow: rgb(255, 255, 255)"]{text-shadow:0 0 2px #000,0 0 6px #000!important}');   // map labels and credit: dark halo
    // The screens' own style sheets
    o.push('html,body{background:#1E1E20!important;color:#E8E8ED}a{color:#409CFF}');
    o.push('.segthumb{background:#636366!important}');
    o.push('.sheet{background:#262629!important}.kpi small,.lbl,.sqsearch::placeholder,.pw::placeholder{color:#AEAEB2!important}');
    o.push('.tip,.ctip,.igpill,a.card,.stackbtn{background:rgba(51,51,54,0.97)!important;border-color:rgba(84,84,88,0.65)!important;color:#D1D1D6!important}');
    o.push('.igpill::after{background:rgba(51,51,54,0.97)!important;border-color:rgba(84,84,88,0.65)!important}.tip b,.ctip b{color:#E8E8ED!important}');
    o.push('.sqrow::after,.sqtop::before{background:rgba(84,84,88,0.65)!important}.strow{border-top-color:rgba(84,84,88,0.65)!important}');
    o.push('html:root .wf-big,html:root .wf-like{color:#E5E5EA!important}');   // big numbers stay readable at night
    o.push('html:root{--wf-sec-bg:#48484A;--wf-ter-bg:rgba(215,244,26,0.07);--wf-ter-fg:#E8E8ED}html:root .wf-danger{background:rgba(255,69,58,0.2)!important;color:#FF8A80!important}');
    o.push('.stepb{background:rgba(118,118,128,0.24)!important;color:#E8E8ED!important}.flap,.flap>.fl{background:#404043!important}.ghost.round{background:rgba(51,51,54,0.88)!important}');
    o.push('.opt:hover,.sqrow[data-sel=false]:not(.nosep):not([disabled]):hover{background-color:rgba(118,118,128,0.18)!important}');
    // Map: the street tiles turn to a night map; markers and fire shapes keep their colours
    o.push('image[href*="tile.openstreetmap"]{filter:url(#wfNightTiles)}');
    o.push('rect[fill="#F2F2F7"]{fill:#262629}');
    o.push('path[fill-rule="evenodd"][fill="#FFFFFF"]{fill:#141416;fill-opacity:0.2}');   // outside the chosen region: a light dim, not a bright veil
    return o.join('\n');
  }

  function ensureNightFilter() {
    if (document.getElementById('wfNightTiles') || !document.body) return;
    var d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0"><filter id="wfNightTiles" color-interpolation-filters="sRGB">' +
      '<feComponentTransfer><feFuncR type="table" tableValues="1 0"/><feFuncG type="table" tableValues="1 0"/><feFuncB type="table" tableValues="1 0"/></feComponentTransfer>' +
      '<feColorMatrix type="hueRotate" values="180"/><feColorMatrix type="saturate" values="0.55"/>' +
      '<feComponentTransfer><feFuncR type="linear" slope="0.62" intercept="0.25"/><feFuncG type="linear" slope="0.62" intercept="0.25"/><feFuncB type="linear" slope="0.64" intercept="0.26"/></feComponentTransfer>' +
      '</filter></svg>';
    document.body.appendChild(d);
  }

  // Button colours, one definition for the whole app: secondary = dark grey with the hi-vis yellow label;
  // tertiary (subtle) = the yellow at 10% with dark text by day and light text at night. (Primary stays hi-vis yellow.)
  // Forest headers take three photos from this visit's random order of nature photos (fit.js)
  var WFP = (function () { var P = (window.__wfPhotos || []).slice(0, 3), D = [{ f: 'forest-1.webp', b: 1 }, { f: 'forest-2.webp', b: 1 }, { f: 'forest-3.webp', b: 1 }]; while (P.length < 3) P.push(D[P.length]); return P; })();
  var BTN = ':root{--wf-sec-bg:#2C2C2E;--wf-sec-fg:#D7F41A;--wf-ter-bg:rgba(215,244,26,0.07);--wf-ter-fg:#3A3A3C}' +
    ':root .wf-sec,:root .ghost:not(.round){background:var(--wf-sec-bg)!important;color:var(--wf-sec-fg)!important;border-color:transparent!important}' +
    ':root .wf-ter{background:var(--wf-ter-bg)!important;color:var(--wf-ter-fg)!important;-webkit-text-fill-color:var(--wf-ter-fg);text-shadow:none;border-color:transparent!important}' +
    // One button: every text button in the app is 48px tall, 17px semibold, one corner radius; roles are primary, secondary, tertiary
    ':root .btn:not(.round):not(.wf-cmp),:root .wf-b{height:48px!important;min-height:48px;box-sizing:border-box;border-radius:10px!important;font-size:17px!important;font-weight:600!important;line-height:22px!important;padding-top:0!important;padding-bottom:0!important;text-decoration:none}' +
    ':root .wf-pri,:root .btn.primary{background:#D7F41A!important;color:#1C1C1E!important;-webkit-text-fill-color:#1C1C1E;border-color:transparent!important;box-shadow:none!important;animation:none!important}' +
    ':root .wf-danger{background:rgba(255,59,48,0.14)!important;color:#B0001A!important;border-color:transparent!important}' +
    ':root .wf-thumb{background:#FFFFFF!important}' +
    // A likelihood KPI: very big, dark grey (fixed size, whatever the text-size setting)
    // Big KPI numbers across the app (forces, resolution summary, profiles): dark grey, one size
    '.wf-big{color:#3A3A3C!important;font-size:44px!important;line-height:1.05!important;font-weight:700!important;letter-spacing:-.03em}' +
    '.wf-like{color:#3A3A3C!important;font-size:150px!important;line-height:.9!important;font-weight:700!important;letter-spacing:-.03em}' +
    // The glass overlay behind panels, one definition for the whole app: a slightly dark frosted layer, so the panel's edge
    // reads clearly against what is underneath. Change it here and every overlay changes.
    ':root{--wf-glass-bg:rgba(60,60,67,0.24);--wf-glass-blur:blur(10px) saturate(120%)}' +
    '.wf-glass{background:var(--wf-glass-bg)!important;-webkit-backdrop-filter:var(--wf-glass-blur)!important;backdrop-filter:var(--wf-glass-blur)!important}' +
    // Grabbers (the grey line that opens and closes blades), one rule for the whole app: the line sits 8px from the blade's edge
    // and keeps 40px clear between it and the blade's content. gb = line at the bottom (top blades), gt = line at the top (bottom blades).
    '.wf-grab{box-sizing:border-box!important;height:53px!important;flex-shrink:0}' +
    '.wf-grab.gb{padding:0 0 8px!important;align-items:flex-end!important}' +
    '.wf-grab.gt{padding:8px 0 0!important;align-items:flex-start!important}' +
    // Forest headers, one definition for the whole app: the aerial forest photos zoom in slowly as on the login screen.
    // .wf-fhost goes on the header; inside it <span class="wf-forest"><i></i><i></i><i></i><b></b></span> cycles the three photos
    // (a new one every 8 s, cross-fading); <span class="wf-forest one"><i style="background-image:…"></i><b></b></span> zooms a single photo.
    '.wf-fhost{position:relative;isolation:isolate;overflow:hidden}' +
    '.wf-forest{position:absolute;inset:0;z-index:-1;overflow:hidden;background:#1E2B22;pointer-events:none;border-radius:inherit}' +
    '.wf-forest>i{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1);will-change:transform,opacity;animation:wfKenO 33s linear infinite,wfKenS 33s linear infinite}' +
    '.wf-forest>i:nth-of-type(1){background-image:url(assets/splash/' + WFP[0].f + ');filter:' + (WFP[0].b < 1 ? 'brightness(' + WFP[0].b + ')' : 'none') + '}' +
    '.wf-forest>i:nth-of-type(2){background-image:url(assets/splash/' + WFP[1].f + ');filter:' + (WFP[1].b < 1 ? 'brightness(' + WFP[1].b + ')' : 'none') + ';animation-delay:11s,11s;animation-name:wfKenO,wfKenSo}' +
    '.wf-forest>i:nth-of-type(3){background-image:url(assets/splash/' + WFP[2].f + ');filter:' + (WFP[2].b < 1 ? 'brightness(' + WFP[2].b + ')' : 'none') + ';animation-delay:22s,22s}' +
    '.wf-forest.one>i{opacity:1;animation:wfKenOne 12.6s cubic-bezier(.3,.1,.3,1) infinite alternate}' +
    // The photo credit under a cycling forest follows the photo on screen (same timing as the photos)
    '.wf-credit>span{grid-area:1/1;opacity:0;animation:wfKenO 33s linear infinite}.wf-credit>span:nth-child(2){animation-delay:11s}.wf-credit>span:nth-child(3){animation-delay:22s}' +
    '.wf-forest>b{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.14) 32%,rgba(0,0,0,0.30) 64%,rgba(0,0,0,0.58) 100%)}' +
    '.wf-forest.one>b{background:linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.42) 45%,rgba(0,0,0,0.66) 100%)}' +
    '@keyframes wfKenO{0%{opacity:0}4.8%{opacity:1}33.3%{opacity:1}38.2%{opacity:0}100%{opacity:0}}' +
    '@keyframes wfKenS{0%{transform:scale(1);animation-timing-function:cubic-bezier(.3,.1,.3,1)}38%{transform:scale(1.3)}100%{transform:scale(1.3)}}' +
    '@keyframes wfKenSo{0%{transform:scale(1.3);animation-timing-function:cubic-bezier(.3,.1,.3,1)}38%{transform:scale(1)}100%{transform:scale(1)}}' +
    '@keyframes wfKenOne{from{transform:scale(1)}to{transform:scale(1.3)}}' +
    '@media (prefers-reduced-motion:reduce){.wf-forest>i{animation:none!important}.wf-forest>i:nth-of-type(1){opacity:1}}';   // switch thumbs stay white in both themes
  function apply() {
    var theme = get('theme', 'light'), size = get('text', 'normal');
    var el = document.getElementById('wf-prefs');
    if (!el) { el = document.createElement('style'); el.id = 'wf-prefs'; (document.head || document.documentElement).appendChild(el); }
    el.textContent = (theme === 'dark' ? darkCss() : '') + '\n' + BTN + '\n' + fontCss(size);
    var root = document.documentElement;
    root.classList.toggle('wf-dark', theme === 'dark');
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', theme === 'dark' ? '#262629' : '#F2F2F7');
    var sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]'); if (sb) sb.setAttribute('content', theme === 'dark' ? 'black' : 'default');
    if (theme === 'dark') { if (document.body) ensureNightFilter(); else document.addEventListener('DOMContentLoaded', ensureNightFilter); }
  }

  // Demo profiles are shown in their own service's uniform (illustrated portraits, avatar.js)
  var KITS = { pt: ['anepc', 1], ca: ['calfire', 1], nv: ['nv', 1], amz: ['br', 1], design: ['pt', 0], admin: ['pt', 1] };
  function uniform(r, name) { var k = KITS[r]; return k && window.__wfAvatar ? window.__wfAvatar(name, k[0], !!k[1]) : ''; }
  var who = PEOPLE[role] || null;
  window.__wfPrefs = {
    role: role,
    person: who ? { id: role, code: who[0], name: who[1], title: who[2], org: who[3], access: 'Access to all features · ' + who[4], photo: uniform(role, who[1]) || who[5], lang: who[6] } : null,
    get: function (k) { return k === 'theme' ? get('theme', 'light') : k === 'text' ? get('text', 'normal') : get(k, ''); },
    set: function (k, v) { try { localStorage.setItem(key(k), v); } catch (e) {} apply(); }
  };
  apply();
})();
