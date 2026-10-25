/* Tokens — a floating panel for the app's makers (Oct 25).
   A pirate flag opens a black panel that lists every visual value the app actually uses — colours, text styles, corners, spaces,
   buttons and fields — read live from the page's own style sheets, and lets each one be changed on the spot.
   Changes apply at once, are kept on this device (per app and theme) and can be copied to hand over.
   Nothing here is app-specific: an app can add its own groups through window.TOKP.extras().
   Settings (window.TOKP, before this file loads): { lang: 'pt'|'en', always: bool, when: () => bool, key: 'name', extras: () => [...], fonts: [...], reveal: el => ms, flag: { left, top } }
   The flag and the panel live in their own frames: a tap on them never reaches the app (which would take it for a tap outside its panels and close them). */
(function () {
  'use strict';
  const CFG = window.TOKP || {}, EN = CFG.lang === 'en';
  const L = EN
    ? { title: 'Tokens', colours: 'Colours', text: 'Text', corners: 'Corners', spaces: 'Spaces', controls: 'Buttons and fields', vars: 'Variables', values: 'Values in use', styles: 'Text styles in use',
        copy: 'Copy changes', copied: 'Changes copied.', reset: 'Reset', resetQ: 'Undo every change on this device?', none: 'Nothing here.', uses: n => n + (n === 1 ? ' element' : ' elements'), off: 'Off the 4px grid', close: 'Close', size: 'Size', weight: 'Weight', lh: 'Line height', ls: 'Letter spacing', nochg: 'No changes yet.', scanning: 'Reading the styles…' }
    : { title: 'Tokens', colours: 'Cores', text: 'Texto', corners: 'Cantos', spaces: 'Espaços', controls: 'Botões e campos', vars: 'Variáveis', values: 'Valores em uso', styles: 'Estilos de texto em uso',
        copy: 'Copiar alterações', copied: 'Alterações copiadas.', reset: 'Repor', resetQ: 'Desfazer todas as alterações neste aparelho?', none: 'Nada aqui.', uses: n => n + (n === 1 ? ' elemento' : ' elementos'), off: 'Fora da grelha de 4px', close: 'Fechar', size: 'Tamanho', weight: 'Peso', lh: 'Entrelinha', ls: 'Espaçamento', nochg: 'Ainda sem alterações.', scanning: 'A ler os estilos…' };

  /* ---------- where it is on: ?dev=1 turns it on for this device, ?dev=0 off; CFG.always shows it always ---------- */
  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  try { const q = new URLSearchParams(location.search).get('dev'); if (q === '1') LS.set('tokp-on', '1'); if (q === '0') LS.set('tokp-on', null); } catch (e) {}
  if (!CFG.always && LS.get('tokp-on') !== '1') return;

  const APP = CFG.key || location.host + location.pathname.replace(/\/[^/]*$/, '');
  const themeSig = () => [...document.documentElement.classList].filter(c => /^th|theme|dark|light|dawn|wicked/i.test(c)).sort().join('.') || 'base';
  const KEY = () => 'tokp:' + APP + ':' + themeSig();

  /* ---------- reading the style sheets ---------- */
  const COLOR_P = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left)(-color)?|border-color|outline|outline-color|fill|stroke|box-shadow|text-decoration|text-decoration-color|caret-color|accent-color|column-rule-color|text-shadow)$/;
  const TEXT_P = /^(font-size|line-height|font-weight|letter-spacing)$/;
  const RAD_P = /^border(-(top|bottom)-(left|right))?-radius$/;
  const SPACE_P = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block)(-start|-end)?)?$/;
  const CTRL_SEL = /\b(btn|button|input|textarea|select|field|seg|pill|tgl|toggle|chip)\b/i;
  const CTRL_P = /^(font-size|font-weight|line-height|letter-spacing|border-radius|border|border-color|border-width|padding|padding-(top|right|bottom|left)|min-height|height|min-width|background|background-color|color|outline|text-decoration|text-decoration-thickness|text-underline-offset)$/;
  const COL_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;
  const PX_RE = /-?\d*\.?\d+px\b/g;
  const DYN = /:(hover|active|focus|focus-visible|focus-within|visited|link|target|checked|disabled|enabled|placeholder-shown|indeterminate)\b/g;
  const PSEUDO_EL = /::?(before|after|placeholder|selection|marker|backdrop|first-letter|first-line|-webkit-[a-z-]+|-moz-[a-z-]+)/g;
  const selCache = new Map();
  function splitSel(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); }
  function inUse(sel) {
    if (selCache.has(sel)) return selCache.get(sel);
    let ok = false;
    for (const part of splitSel(sel)) {
      const q = part.replace(PSEUDO_EL, '').replace(DYN, '').replace(/:not\(\)/g, '').trim() || '*';
      try { if (document.querySelector(q)) { ok = true; break; } } catch (e) { /* a selector the browser can't query: count it in */ ok = true; break; }
    }
    selCache.set(sel, ok); return ok;
  }
  function eachRule(list, fn) {
    for (const r of list) {
      if (r.type === 1) fn(r);
      else if (r.cssRules && (r.type !== 4 || !r.conditionText || matchMedia(r.conditionText).matches)) eachRule(r.cssRules, fn);
    }
  }
  const cvs = document.createElement('canvas').getContext('2d');
  function colKey(t) { try { cvs.fillStyle = '#000'; cvs.fillStyle = t; const v = cvs.fillStyle; return v; } catch (e) { return t.toLowerCase(); } }   // '#rrggbb' or 'rgba(r, g, b, a)'
  function toHex(k) { if (k[0] === '#') return k; const m = k.match(/[\d.]+/g); if (!m) return '#000000'; return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); }

  let DB = null, DB_U = null;
  function computedUse() {
    const c = new Map(), t = new Map(), rr = new Map(), sp = new Map(), sty = new Map(), ff = new Map(); let cur = null; const add = (m, k) => { if (!k) return; let a = m.get(k); if (!a) m.set(k, a = []); if (a[a.length - 1] !== cur) a.push(cur); };
    const col = v => { if (!v || v === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(v)) return ''; return colKey(v); };
    const look = (st, el, isSvg, ownText) => {
      if (ownText) add(c, col(st.color));
      add(c, col(st.backgroundColor));
      (st.backgroundImage.match(COL_RE) || []).forEach(x => add(c, col(x))); COL_RE.lastIndex = 0;
      ['Top', 'Right', 'Bottom', 'Left'].forEach(sd => { if (parseFloat(st['border' + sd + 'Width']) > 0 && st['border' + sd + 'Style'] !== 'none') add(c, col(st['border' + sd + 'Color'])); });
      if (st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0) add(c, col(st.outlineColor));
      if (isSvg) { if (st.fill && st.fill !== 'none' && !/url/.test(st.fill)) add(c, col(st.fill)); if (st.stroke && st.stroke !== 'none' && !/url/.test(st.stroke)) add(c, col(st.stroke)); }
      if (st.boxShadow !== 'none') (st.boxShadow.match(COL_RE) || []).forEach(x => add(c, col(x))); COL_RE.lastIndex = 0;
      if (st.textDecorationLine && st.textDecorationLine !== 'none' && ownText) add(c, col(st.textDecorationColor));
      if (ownText) { add(ff, (st.fontFamily.split(',')[0] || '').trim().replace(/["']/g, '')); add(sty, st.fontSize + ' / ' + st.lineHeight + ' / ' + st.fontWeight); add(t, 'font-size|' + st.fontSize); add(t, 'font-weight|' + st.fontWeight); add(t, 'line-height|' + st.lineHeight); if (st.letterSpacing !== 'normal') add(t, 'letter-spacing|' + st.letterSpacing); }
      ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'].forEach(k => { const v = st['border' + k + 'Radius']; if (v && v !== '0px') (v.match(/-?\d*\.?\d+(px|%)/g) || []).forEach(x => add(rr, x)); });
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'rowGap', 'columnGap'].forEach(k => { const v = st[k]; if (v && /px$/.test(v) && v !== '0px') add(sp, v.replace('-', '')); }); };
    const all = document.querySelectorAll('html, body, body *');
    for (const el of all) {
      if (el.closest('.tokp,.leaflet-tile-pane,script,style,head')) continue;
      if (!el.getClientRects().length && el !== document.documentElement) continue;   /* not on the page (display: none here or above) */
      const st = getComputedStyle(el), isSvg = el instanceof SVGElement, ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      if (st.visibility === 'hidden' && !ownText) { /* still part of the theme */ }
      cur = el; look(st, el, isSvg, ownText);
      for (const ps of ['::before', '::after']) { const p = getComputedStyle(el, ps); if (p.content && p.content !== 'none' && p.display !== 'none') look(p, el, false, p.content !== '""' && p.content !== "''"); }
    }
    return { c, t, r: rr, s: sp, sty, ff };
  }   // { groups: Map(id -> group), vars: Map(name -> var) }
  function scan() {
    selCache.clear();
    const groups = new Map(), vars = new Map(), styles = new Map();
    const G = (id, o) => { let g = groups.get(id); if (!g) { g = Object.assign({ id, occ: [] }, o); groups.set(id, g); } return g; };
    const sheets = [...document.styleSheets];
    for (const sh of sheets) {
      let rules; try { rules = sh.cssRules; } catch (e) { continue; }   // another site's style sheet (the map's): not ours to read
      if (!rules) continue;
      eachRule(rules, rule => {
        const sel = rule.selectorText || ''; if (!sel || !inUse(sel)) return;
        const st = rule.style, isCtrl = CTRL_SEL.test(sel);
        let fs = '', lh = '', fw = '';
        for (let i = 0; i < st.length; i++) {
          const p = st[i], v = st.getPropertyValue(p), pr = st.getPropertyPriority(p);
          if (!v) continue;
          if (p.startsWith('--')) {   // a variable's definition
            let x = vars.get(p); if (!x) { x = { name: p, defs: [], uses: new Set() }; vars.set(p, x); } x.defs.push({ rule, prio: pr }); continue;
          }
          (v.match(/var\(--[\w-]+/g) || []).forEach(m => { const n = m.slice(4); let x = vars.get(n); if (!x) { x = { name: n, defs: [], uses: new Set() }; vars.set(n, x); }
            x.uses.add(COLOR_P.test(p) ? 'colour' : TEXT_P.test(p) ? 'text' : RAD_P.test(p) ? 'corner' : SPACE_P.test(p) ? 'space' : 'other'); });
          if (COLOR_P.test(p)) (v.match(COL_RE) || []).forEach(t => { const k = colKey(t); G('c|' + k, { tab: 'colours', key: k }).occ.push({ rule, p, pr, tok: t }); });
          if (TEXT_P.test(p) && !/var\(/.test(v)) G('t|' + p + '|' + v, { tab: 'text', prop: p, key: v }).occ.push({ rule, p, pr, tok: v, whole: true });
          if (p === 'font-size') fs = v; if (p === 'line-height') lh = v; if (p === 'font-weight') fw = v;
          if (RAD_P.test(p)) (v.match(PX_RE) || (/%/.test(v) ? v.match(/\d+%/g) : []) || []).forEach(t => G('r|' + t, { tab: 'corners', key: t }).occ.push({ rule, p, pr, tok: t }));
          if (SPACE_P.test(p)) (v.match(PX_RE) || []).forEach(t => { if (t === '0px') return; G('s|' + t.replace('-', ''), { tab: 'spaces', key: t.replace('-', '') }).occ.push({ rule, p, pr, tok: t }); });
          if (isCtrl && CTRL_P.test(p) && !p.startsWith('--')) {
            if (COLOR_P.test(p)) (v.match(COL_RE) || []).forEach(t => { const k = colKey(t); G('k|c|' + k, { tab: 'controls', sub: 'colour', key: k }).occ.push({ rule, p, pr, tok: t }); });
            else if (TEXT_P.test(p)) { if (!/var\(/.test(v)) G('k|t|' + p + '|' + v, { tab: 'controls', sub: 'text', prop: p, key: v }).occ.push({ rule, p, pr, tok: v, whole: true }); }
            else (v.match(PX_RE) || []).forEach(t => { if (t === '0px') return; const sub = RAD_P.test(p) ? 'corner' : /height|width/.test(p) ? 'size' : 'space'; G('k|' + sub + '|' + t, { tab: 'controls', sub, key: t }).occ.push({ rule, p, pr, tok: t }); });
          }
        }
        if (fs) { const k = [fs, lh || '—', fw || '—'].join(' / '); styles.set(k, (styles.get(k) || 0) + 1); }
      });
    }
    /* each variable: its value now (on the page's root), its kind from what it holds or where it is used */
    const rs = getComputedStyle(document.documentElement);
    vars.forEach(x => { x.value = (rs.getPropertyValue(x.name) || '').trim() || (x.defs[0] ? x.defs[0].rule.style.getPropertyValue(x.name).trim() : '');
      x.kind = COL_RE.test(x.value) && x.value.match(COL_RE)[0] === x.value ? 'colour' : (COL_RE.lastIndex = 0, x.uses.has('colour') && !/px/.test(x.value) ? 'colour' : x.uses.has('text') ? 'text' : x.uses.has('corner') ? 'corner' : x.uses.has('space') ? 'space' : /px$/.test(x.value) ? 'space' : 'other');
      COL_RE.lastIndex = 0; });
    groups.forEach(g => { g.cur = g.key; g.n = g.occ.length; });
    /* what really shows: the computed styles of the elements on this page, in this theme (a rule that another rule overrides doesn't count) */
    const U = computedUse();
    groups.forEach(g => { g.els = (g.tab === 'colours' || g.sub === 'colour' ? U.c.get(g.key) : g.tab === 'text' || g.sub === 'text' ? U.t.get(g.prop + '|' + g.key)
      : g.tab === 'corners' || g.sub === 'corner' ? U.r.get(g.key) : U.s.get(g.key)) || []; g.live = g.els.length; });
    /* a variable counts when its value really shows (a blue that nothing on this page wears is not this theme's) */
    vars.forEach(x => { const v = x.value; x.els = (x.kind === 'colour' ? U.c.get(colKey(v)) : x.kind === 'text' ? (U.t.get('font-size|' + v) || U.t.get('line-height|' + v) || U.t.get('font-weight|' + v)) : x.kind === 'corner' ? U.r.get(v) : x.kind === 'space' ? U.s.get(v) : null) || []; });
    DB_U = U;
    DB = { groups, vars, styles };
  }

  /* ---------- changing a value: rewrite it in every rule that uses it ---------- */
  function setGroup(g, val) {
    if (!val || val === g.cur) return;
    g.occ.forEach(o => { const v = o.rule.style.getPropertyValue(o.p); let nv;
      if (o.whole) nv = val;
      else { const t = o.now || o.tok; const i = v.indexOf(t); if (i < 0) return; nv = v.slice(0, i) + (o.tok.startsWith('-') && g.tab === 'spaces' ? '-' + val.replace(/^-/, '') : val) + v.slice(i + t.length); o.now = o.tok.startsWith('-') && g.tab === 'spaces' ? '-' + val.replace(/^-/, '') : val; }
      o.rule.style.setProperty(o.p, nv, o.pr); });
    g.cur = val; remember('g', g.id, val);
  }
  function setVar(x, val) {
    if (val == null || val === x.value) return;
    document.documentElement.style.setProperty(x.name, val);
    x.defs.forEach(d => d.rule.style.setProperty(x.name, val, d.prio));
    x.value = val; remember('v', x.name, val);
  }
  /* a font to try: loaded from its link, laid over the app's own letter everywhere (icons are drawings, they stay) */
  function setFont(f) { let st = document.getElementById('tokp-font'), ln = document.getElementById('tokp-fontl');
    if (!f) { if (st) st.remove(); if (ln) ln.remove(); remember('f', 'font', ''); return; }
    if (f.href) { if (!ln) { ln = document.createElement('link'); ln.id = 'tokp-fontl'; ln.rel = 'stylesheet'; document.head.appendChild(ln); } ln.href = f.href; }
    if (!st) { st = document.createElement('style'); st.id = 'tokp-font'; document.head.appendChild(st); }
    st.textContent = 'html:not(#tp1):not(#tp2):not(#tp3) body,html:not(#tp1):not(#tp2):not(#tp3) body *:not(svg):not(svg *){font-family:' + f.family + ' !important}'; remember('f', 'font', f.name); }
  /* changes are kept per app and theme, and come back when the page opens again */
  function load() { try { return JSON.parse(LS.get(KEY()) || '{}'); } catch (e) { return {}; } }
  function remember(t, id, val) { const s = load(); s[t + ':' + id] = val; LS.set(KEY(), JSON.stringify(s)); }
  function reapply() {
    const s = load(); if (!Object.keys(s).length) return; if (!DB) scan();
    Object.keys(s).forEach(k => { const i = k.indexOf(':'), t = k.slice(0, i), id = k.slice(i + 1), v = s[k];
      if (t === 'g') { const g = DB.groups.get(id); if (g) setGroup(g, v); }
      else if (t === 'v') { const x = DB.vars.get(id) || { name: id, defs: [], value: '' }; setVar(x, v); }
      else if (t === 'f') { const fo = (CFG.fonts || []).find(x => x.name === v); if (fo) setFont(fo); }
      else if (t === 'x') { const it = extraItem(id); if (it) { try { it.set(v); it.value = v; } catch (e) {} } } });
  }
  function extraGroups() { try { return (CFG.extras && CFG.extras()) || []; } catch (e) { return []; } }
  function extraItem(id) { for (const g of extraGroups()) for (const it of g.items || []) if ((g.title + '/' + it.label) === id) return it; return null; }

  /* ---------- the flag and the panel: each in a frame of its own (the app's styles and taps never mix with them) ---------- */
  const CSS = `
    *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;-webkit-tap-highlight-color:transparent}
    .flag{position:absolute;inset:0;width:48px;height:48px;border-radius:50%;background:#0B0B0B;color:#F2F2F2;border:0;display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none}
    .flag svg{width:28px;height:28px}
    .pn{position:absolute;inset:0;display:flex;flex-direction:column;background:#0B0B0B;color:#EDEDED;border-radius:12px;overflow:hidden;font-size:13px;line-height:20px}
    .hd{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 16px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;border-bottom:1px solid #222}
    .hd h1{font-size:15px;font-weight:600;flex:1;color:#FFF}
    .hd small{font-size:11px;color:#8C8C8C;font-weight:400;margin-left:8px}
    .ib{width:40px;height:40px;border:0;border-radius:8px;background:transparent;color:#EDEDED;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .tabs{display:flex;gap:4px;padding:8px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid #222;flex:none}
    .tabs::-webkit-scrollbar{display:none}
    .tb{flex:none;height:32px;padding:0 12px;border-radius:16px;border:0;background:#1A1A1A;color:#BDBDBD;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap}
    .tb.on{background:#F2F2F2;color:#0B0B0B}
    .bd{flex:1;overflow:auto;padding:8px 16px 24px;-webkit-overflow-scrolling:touch}
    h2{font-size:11px;font-weight:600;color:#8C8C8C;margin:16px 0 8px}
    .row{display:flex;align-items:center;gap:8px;min-height:44px;border-bottom:1px solid #1A1A1A}
    .pv{flex:none;width:32px;height:32px;display:flex;align-items:center;justify-content:center;position:relative}
    .sw{width:28px;height:28px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);background:#000}
    .nm{flex:1;min-width:0;display:flex;flex-direction:column}
    .nm b{font-weight:500;color:#EDEDED;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .nm span{font-size:11px;color:#8C8C8C}
    .nm span.bad{color:#FF8A80}
    .in{width:96px;height:32px;border:1px solid #2A2A2A;border-radius:6px;background:#151515;color:#FFF;font:12px ui-monospace,SFMono-Regular,Menlo,monospace;padding:0 8px;outline:0}
    .in:focus{border-color:#F2F2F2}
    .st{display:flex;align-items:center;gap:4px}
    .st button{width:28px;height:32px;border:0;border-radius:6px;background:#1A1A1A;color:#EDEDED;font-size:16px;cursor:pointer}
    .st .in{width:72px;text-align:center}
    .aa{font-weight:600;color:#FFF;line-height:1;overflow:hidden;white-space:nowrap}
    .bar{height:8px;background:#F2F2F2;border-radius:2px;max-width:32px}
    .sq{width:28px;height:28px;border:1.5px solid #F2F2F2}
    .sty{padding:8px 0;border-bottom:1px solid #1A1A1A}
    .sty p{color:#FFF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sty span{font-size:11px;color:#8C8C8C;font-family:ui-monospace,Menlo,monospace}
    .ft{display:flex;gap:8px;padding:8px 16px;border-top:1px solid #222;flex:none}
    .ft button{height:36px;padding:0 12px;border-radius:18px;border:1px solid #333;background:transparent;color:#EDEDED;font-size:12px;cursor:pointer}
    .ft button:first-child{background:#F2F2F2;color:#0B0B0B;border-color:#F2F2F2}
    .rz{position:absolute;right:0;bottom:0;width:28px;height:28px;cursor:nwse-resize;touch-action:none}
    .rz::after{content:'';position:absolute;right:6px;bottom:6px;width:10px;height:10px;border-right:2px solid #666;border-bottom:2px solid #666}
    .msg{color:#8C8C8C;padding:16px 0}
    .cnt{cursor:pointer;text-decoration:underline;text-decoration-color:#444;text-underline-offset:3px}
    .fo{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;min-height:52px;padding:8px 12px;margin:0 0 4px;border:1px solid #222;border-radius:8px;background:#121212;color:#EDEDED;text-align:left;cursor:pointer}
    .fo b{font-size:18px;font-weight:700;line-height:24px}
    .fo span{font-size:11px;color:#8C8C8C}
    .fo.on{border-color:#F2F2F2}`;
  const FLAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V3"/><path d="M4 4h15l-2.5 4.5L19 13H4"/><circle cx="11.5" cy="7.6" r="2"/><path d="M10.6 9.4v.9M12.4 9.4v.9"/><path d="M8.6 10.9l5.8 1.4M14.4 10.9l-5.8 1.4"/></svg>';
  /* each piece in a host of its own with a shadow root (the app's styles never reach it; the app is told to leave taps on '.tokp' alone) */
  function frame(w, h, html) { const fr = document.createElement('div'); fr.className = 'tokp'; fr.setAttribute('aria-label', 'Tokens');
    fr.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:' + h + 'px;margin:0;padding:0;z-index:2147483000;overflow:hidden';
    document.body.appendChild(fr); const d = fr.attachShadow({ mode: 'open' }); d.innerHTML = '<style>:host{all:initial}' + CSS + '</style>' + html; d.head = d; d.createElement = t => document.createElement(t); d.fonts = document.fonts; return { fr, d }; }
  /* the outline, its label and the little messages sit on the page itself, never in the way of a tap */
  const over = (id, css) => { const e = document.createElement('div'); e.id = id; e.className = 'tokp'; e.style.cssText = 'position:fixed;pointer-events:none;z-index:2147482999;' + css; return e; };
  const HL = over('tokp-hl', 'display:none;border:2px solid #FF2BD6;box-shadow:0 0 0 9999px rgba(0,0,0,.18);border-radius:2px');
  const HLB = over('tokp-hlb', 'left:50%;top:16px;transform:translateX(-50%);max-width:calc(100% - 32px);background:#0B0B0B;color:#FFF;font:12px/20px ui-monospace,Menlo,monospace;padding:8px 12px;border-radius:16px;opacity:0;transition:opacity .2s;white-space:normal;overflow-wrap:anywhere');
  const LIFT = over('tokp-lift', 'display:none;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35);border-radius:2px');
  /* Oct 25: an element that can't be seen (hidden, behind another layer, off screen, size 0) is brought up: its parents are unhidden for an instant,
     it is copied with every style it wears, and the copy is shown on top of everything, where it sits (or in the middle when that is off screen) */
  function lift(el) {
    const tool = n => n && n.closest && n.closest('.tokp');
    const seen = () => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return false;
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return false; }
      const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const top = (document.elementsFromPoint(x, y) || []).find(n => !tool(n)); return !top || top === el || el.contains(top) || top.contains(el) && !top.children.length; };
    if (seen()) return null;
    const undo = [];
    for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a), st = a.getAttribute('style'), hid = a.hasAttribute('hidden'); let ch = false;
      if (hid) { a.removeAttribute('hidden'); ch = true; }
      if (cs.display === 'none' || getComputedStyle(a).display === 'none') { a.style.setProperty('display', /^(SPAN|A|B|I|EM|STRONG|LABEL)$/.test(a.tagName) ? 'inline-block' : 'block', 'important'); ch = true; }
      if (cs.visibility === 'hidden') { a.style.setProperty('visibility', 'visible', 'important'); ch = true; }
      if (+cs.opacity < .05) { a.style.setProperty('opacity', '1', 'important'); ch = true; }
      if (ch) undo.push([a, st, hid]); }
    const r = el.getBoundingClientRect(); let n = 0;
    const copy = src => { if (src.nodeType === 3) return src.cloneNode(); if (src.nodeType !== 1 || ++n > 400) return null; const d = src.cloneNode(false), cs = getComputedStyle(src); let t = '';
      for (let i = 0; i < cs.length; i++) t += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';'; d.setAttribute('style', t + 'animation:none;transition:none;pointer-events:none'); d.removeAttribute('id');
      src.childNodes.forEach(c => { const k = copy(c); if (k) d.appendChild(k); }); return d; };
    const node = copy(el);
    let bg = 'rgb(255, 255, 255)'; for (let a = el; a; a = a.parentElement) { const b = getComputedStyle(a).backgroundColor; if (b && !/rgba\(.*,\s*0\)$|transparent/.test(b)) { bg = b; break; } }
    undo.forEach(([a, st, hid]) => { if (st == null) a.removeAttribute('style'); else a.setAttribute('style', st); if (hid) a.setAttribute('hidden', ''); });
    if (!node) return null;
    const on = r.width >= 1 && r.height >= 1 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    Object.assign(node.style, { position: 'static', margin: '0', transform: 'none', left: 'auto', top: 'auto', right: 'auto', bottom: 'auto', opacity: '1', visibility: 'visible', maxWidth: 'none', maxHeight: 'none',
      width: r.width >= 1 ? 'auto' : 'max-content', minWidth: Math.max(r.width, 24) + 'px', height: 'auto', minHeight: Math.max(r.height, 16) + 'px', boxSizing: 'border-box' });
    LIFT.innerHTML = ''; LIFT.appendChild(node);
    Object.assign(LIFT.style, { display: 'block', background: bg, width: 'max-content', height: 'auto', left: '0px', top: '0px' });
    node.style.transformOrigin = '0 0';
    const w = Math.max(node.offsetWidth, 24), h = Math.max(node.offsetHeight, 16), k = Math.min(1, (innerWidth - 32) / w, (innerHeight * .5) / h);
    if (k < 1) node.style.transform = 'scale(' + k + ')';
    Object.assign(LIFT.style, { width: w * k + 'px', height: h * k + 'px', left: (on ? Math.min(r.left, innerWidth - w * k - 8) : (innerWidth - w * k) / 2) + 'px', top: (on ? r.top : (innerHeight - h * k) / 2) + 'px' });
    return true; }
  window.__tokpLift = el => lift(el);
  const TOAST = over('tokp-toast', 'left:50%;bottom:24px;transform:translateX(-50%);background:#F2F2F2;color:#0B0B0B;padding:8px 16px;border-radius:16px;font:12px/20px -apple-system,sans-serif;opacity:0;transition:opacity .2s');
  const toast = t => { TOAST.textContent = t; TOAST.style.opacity = '1'; clearTimeout(TOAST._t); TOAST._t = setTimeout(() => TOAST.style.opacity = '0', 1600); };
  let F = null, P = null, $ = id => P.d.getElementById(id);
  const TABS = [['colours', L.colours], ['text', L.text], ['corners', L.corners], ['spaces', L.spaces], ['controls', L.controls]];
  let tab = LS.get('tokp-tab') || 'colours';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* geometry: the panel and the flag stay where they were left */
  const geo = (() => { try { return JSON.parse(LS.get('tokp-geo') || 'null'); } catch (e) { return null; } })() || {};
  let isOpen = false;
  function place() {
    const W = innerWidth, H = innerHeight, w = Math.min(geo.w || 360, W - 16), h = Math.min(geo.h || Math.round(H * .6), H - 16);
    const x = Math.max(8, Math.min(geo.x != null ? geo.x : W - w - 8, W - w - 8)), y = Math.max(8, Math.min(geo.y != null ? geo.y : H - h - 8, H - h - 8));
    if (P) Object.assign(P.fr.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', display: isOpen ? 'block' : 'none', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,.45)' });
    const fx = geo.fx != null ? geo.fx : (CFG.flag && CFG.flag.left != null ? CFG.flag.left : 8), fy = geo.fy != null ? geo.fy : (CFG.flag && CFG.flag.top != null ? CFG.flag.top : Math.round(H * .5));
    if (F) Object.assign(F.fr.style, { left: Math.max(4, Math.min(fx, W - 52)) + 'px', top: Math.max(4, Math.min(fy, H - 52)) + 'px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,.25)' });
  }
  const saveGeo = () => LS.set('tokp-geo', JSON.stringify(geo));
  /* dragging inside a frame that moves with the finger: measured on the screen, not in the frame */
  function dragger(el, onMove, onEnd, onTap) {
    el.addEventListener('pointerdown', e => { if (e.target.closest('.ib')) return; e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} const sx = e.screenX, sy = e.screenY; let moved = false;
      const mv = ev => { const dx = ev.screenX - sx, dy = ev.screenY - sy; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; if (moved) onMove(dx, dy); };
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); if (moved) onEnd(); else if (onTap) onTap(); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); });
  }
  function build() {
    F = frame(48, 48, '<button class="flag" id="flag" aria-label="Tokens">' + FLAG_SVG + '</button>');
    F.fr.style.zIndex = '2147483001';   /* the flag always above the panel, so it can always close it */
    P = frame(360, 400, '<section class="pn" id="pn" role="dialog" aria-label="Tokens"><div class="hd" id="hd"><h1>' + L.title + '<small id="th"></small></h1><button class="ib" id="x" aria-label="' + L.close + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<nav class="tabs" id="tabs"></nav><div class="bd" id="bd"></div><div class="ft"><button id="cp">' + L.copy + '</button><button id="rs">' + L.reset + '</button></div><div class="rz" id="rz"></div></section>');
    document.body.append(LIFT, HL, HLB, TOAST);
    { let b = null; dragger(F.d.getElementById('flag'), (dx, dy) => { if (!b) b = F.fr.getBoundingClientRect(); geo.fx = b.left + dx; geo.fy = b.top + dy; place(); }, () => { b = null; saveGeo(); }, () => toggle()); }
    { let b = null; dragger($('hd'), (dx, dy) => { if (!b) b = P.fr.getBoundingClientRect(); geo.x = b.left + dx; geo.y = b.top + dy; place(); }, () => { b = null; saveGeo(); }); }
    { let b = null; dragger($('rz'), (dx, dy) => { if (!b) b = P.fr.getBoundingClientRect(); geo.x = b.left; geo.y = b.top; geo.w = Math.max(280, b.width + dx); geo.h = Math.max(240, b.height + dy); place(); }, () => { b = null; saveGeo(); }); }
    $('x').onclick = () => toggle(false);
    $('tabs').innerHTML = TABS.map(([k, n]) => '<button class="tb" data-t="' + k + '">' + n + '</button>').join('');
    $('tabs').onclick = e => { const b = e.target.closest('.tb'); if (!b) return; tab = b.dataset.t; LS.set('tokp-tab', tab); draw(); };
    wire(); place(); addEventListener('resize', place);
  }
  function toggle(on) { isOpen = on == null ? !isOpen : on; place(); LS.set('tokp-open', isOpen ? '1' : null); if (isOpen) { fontsUp(); $('bd').innerHTML = '<p class="msg">' + L.scanning + '</p>'; setTimeout(() => { scan(); draw(); }, 30); } }

  /* ---------- drawing a tab: only what this theme really shows ---------- */
  const pxOf = v => parseFloat(v);
  function rowLen(id, label, sub, val, kind, bad) {
    const n = pxOf(val), pv = kind === 'text' ? '<span class="aa" style="font-size:' + Math.min(28, Math.max(8, n || 13)) + 'px">Aa</span>' : kind === 'corner' ? '<span class="sq" style="border-radius:' + Math.min(14, n || 0) + 'px"></span>' : kind === 'space' ? '<span class="bar" style="width:' + Math.min(32, Math.max(2, n || 0)) + 'px"></span>' : '';
    return '<div class="row" data-id="' + esc(id) + '"><span class="pv">' + pv + '</span><span class="nm"><b>' + esc(label) + '</b><span class="cnt' + (bad ? ' bad' : '') + '">' + esc(sub) + '</span></span>' +
      '<span class="st"><button data-d="-1">−</button><input class="in" value="' + esc(val) + '"><button data-d="1">+</button></span></div>';
  }
  function rowCol(id, label, sub, val) {
    const hex = toHex(colKey(val));
    return '<div class="row" data-id="' + esc(id) + '"><span class="pv"><span class="sw" style="background:' + esc(val) + '"></span><input type="color" value="' + hex + '" style="position:absolute;inset:0;opacity:0;width:32px;height:32px;border:0;padding:0"></span><span class="nm"><b>' + esc(label) + '</b><span class="cnt">' + esc(sub) + '</span></span><input class="in" value="' + esc(val) + '"></div>';
  }
  const offGrid = v => { const n = Math.abs(pxOf(v)); return /px$/.test(v) && n > 0 && n % 4 !== 0 && n !== 1 && n !== 2; };
  const sortLen = (a, b) => pxOf(a.cur) - pxOf(b.cur);
  let IDX = {};
  function draw() {
    if (!DB) scan();
    $('th').textContent = themeSig() === 'base' ? '' : themeSig();
    P.d.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    IDX = {}; let h = '';
    const vs = [...DB.vars.values()].filter(x => x.value && x.uses.size && x.els && x.els.length && (tab === 'colours' ? x.kind === 'colour' : tab === 'text' ? x.kind === 'text' : tab === 'corners' ? x.kind === 'corner' : tab === 'spaces' ? x.kind === 'space' : false)).sort((a, b) => a.name.localeCompare(b.name));
    const gs = [...DB.groups.values()].filter(g => g.tab === tab && g.live > 0);
    extraGroups().filter(g => g.tab === tab).forEach(g => { h += '<h2>' + esc(g.title) + '</h2>'; (g.items || []).forEach(it => { const id = 'x:' + g.title + '/' + it.label; IDX[id] = { x: it, g }; h += it.kind === 'colour' || g.tab === 'colours' ? rowCol(id, it.label, '', it.value) : rowLen(id, it.label, '', it.value, g.tab === 'text' ? 'text' : 'space'); }); });
    if (tab === 'text' && DB_U && DB_U.ff.size) { h += '<h2>' + (EN ? 'Fonts in use' : 'Letras em uso') + '</h2>'; [...DB_U.ff.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([k, arr]) => { const id = 'ff:' + k; IDX[id] = { els: arr };
      h += '<div class="sty" data-id="' + esc(id) + '"><p style="font-family:\'' + esc(k) + '\';font-size:18px">' + esc(k) + '</p><span class="cnt">' + L.uses(arr.length) + '</span></div>'; }); }
    if (tab === 'text' && CFG.fonts && CFG.fonts.length) { const cur = load()['f:font'] || '';
      h += '<h2>' + (EN ? 'Try a font' : 'Experimentar uma letra') + '</h2>' + [{ name: '', label: EN ? 'The app\'s own' : 'A da app' }].concat(CFG.fonts).map(f => '<button class="fo' + (cur === f.name ? ' on' : '') + '" data-f="' + esc(f.name) + '"><b style="font-family:' + esc(f.family || 'inherit') + '">' + esc(f.label || f.name) + '</b>' + (f.note ? '<span>' + esc(f.note) + '</span>' : '') + '</button>').join(''); }
    if (false && vs.length) { h += '<h2>' + L.vars + '</h2>';   /* Oct 25: no variables: only the values that show */ vs.forEach(x => { const id = 'v:' + x.name; IDX[id] = { v: x, els: x.els }; h += x.kind === 'colour' ? rowCol(id, x.name, L.uses(x.els.length), x.value) : rowLen(id, x.name, L.uses(x.els.length), x.value, x.kind, offGrid(x.value) && x.kind === 'space'); }); }
    if (tab === 'text' && DB_U && DB_U.sty.size) { h += '<h2>' + L.styles + '</h2>'; [...DB_U.sty.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 40).forEach(([k, arr]) => { const sid = 's:' + k; IDX[sid] = { els: arr }; const [fs, lh, fw] = k.split(' / ');
      h += '<div class="sty" data-id="' + esc(sid) + '"><p style="font-size:' + esc(fs) + ';font-weight:' + esc(fw) + '">Pocket Aa 123</p><span class="cnt">' + esc(k) + '. ' + L.uses(arr.length) + '</span></div>'; }); }
    if (gs.length) {
      h += '<h2>' + L.values + '</h2>';
      if (tab === 'colours') gs.sort((a, b) => b.live - a.live).forEach(g => { const id = 'g:' + g.id; IDX[id] = { g, els: g.els }; h += rowCol(id, toHex(g.key) + (g.key.startsWith('rgba') ? ' ' + g.key.match(/[\d.]+\)$/)[0].slice(0, -1) : ''), L.uses(g.live), g.cur); });
      else if (tab === 'text') { const by = {}; gs.forEach(g => (by[g.prop] = by[g.prop] || []).push(g));
        [['font-size', L.size], ['line-height', L.lh], ['font-weight', L.weight], ['letter-spacing', L.ls]].forEach(([p, nm]) => { if (!by[p]) return; h += '<h2>' + nm + '</h2>'; by[p].sort((a, b) => pxOf(a.cur) - pxOf(b.cur)).forEach(g => { const id = 'g:' + g.id; IDX[id] = { g, els: g.els }; h += rowLen(id, g.cur, L.uses(g.live), g.cur, p === 'font-size' ? 'text' : ''); }); }); }
      else if (tab === 'controls') { const by = {}; gs.forEach(g => (by[g.sub] = by[g.sub] || []).push(g));
        [['colour', L.colours], ['text', L.text], ['corner', L.corners], ['space', L.spaces], ['size', L.size]].forEach(([sb, nm]) => { if (!by[sb]) return; h += '<h2>' + nm + '</h2>';
          by[sb].sort(sb === 'colour' ? (a, b) => b.live - a.live : sortLen).forEach(g => { const id = 'g:' + g.id; IDX[id] = { g, els: g.els }; h += sb === 'colour' ? rowCol(id, toHex(g.key), L.uses(g.live), g.cur) : rowLen(id, sb === 'text' ? g.prop + ' ' + g.key : g.key, L.uses(g.live), g.cur, sb === 'text' ? '' : sb, sb === 'space' && offGrid(g.cur)); }); }); }
      else gs.sort(sortLen).forEach(g => { const id = 'g:' + g.id; IDX[id] = { g, els: g.els }; const bad = tab === 'spaces' && offGrid(g.cur); h += rowLen(id, g.key, L.uses(g.live) + (bad ? '. ' + L.off : ''), g.cur, tab === 'corners' ? 'corner' : 'space', bad); });
    }
    $('bd').innerHTML = h || '<p class="msg">' + L.none + '</p>';
  }
  function apply(id, val) { const o = IDX[id]; if (!o) return; if (o.g && !o.x) setGroup(o.g, val); else if (o.v) setVar(o.v, val); else if (o.x) { try { o.x.set(val); o.x.value = val; remember('x', o.g.title + '/' + o.x.label, val); } catch (e) {} } }
  function step(v, d) { const m = String(v).match(/^(-?\d*\.?\d+)([a-z%]*)$/i); if (!m) { const n = parseFloat(v); return isNaN(n) ? v : String(n + d); } const n = +m[1], u = m[2]; const s = u === '' && n > 99 ? 100 : u === 'em' || u === 'rem' ? .05 : 1; return (Math.round((n + d * s) * 100) / 100) + u; }
  /* tap the count: the page shows each element wearing that value, one per tap (opening its panel when it is closed) */
  let SHOW = { id: '', i: -1, raf: 0, t: 0 };
  function showEl(id) { const o = IDX[id]; if (!o || !o.els || !o.els.length) return; if (SHOW.id !== id) SHOW = { id, i: -1, raf: 0, t: 0 }; SHOW.i = (SHOW.i + 1) % o.els.length;
    const el = o.els[SHOW.i], hl = HL, lb = HLB;
    const nm = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    let up = el.parentElement; while (up && !up.id) up = up.parentElement; const where = up && up !== el ? (EN ? ' in #' : ' em #') + up.id : '';
    cancelAnimationFrame(SHOW.raf); clearTimeout(SHOW.t); LIFT.style.display = 'none'; let t0 = performance.now();
    const hidden = () => { const r = el.getBoundingClientRect(); if (!r.width && !r.height) return true; for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.visibility === 'hidden' || +cs.opacity < .05) return true; } return false; };
    let up2 = false;
    const follow = () => { const r = up2 ? LIFT.getBoundingClientRect() : el.getBoundingClientRect(), off = !up2 && hidden();
      hl.style.display = off ? 'none' : 'block'; Object.assign(hl.style, { left: r.left - 3 + 'px', top: r.top - 3 + 'px', width: r.width + 6 + 'px', height: r.height + 6 + 'px' });
      lb.textContent = (SHOW.i + 1) + '/' + o.els.length + '  ' + nm + where + (up2 ? (!el.textContent.trim() && !el.querySelector('img,svg,canvas,video') ? (EN ? '  (hidden and empty now)' : '  (escondido e vazio agora)') : (EN ? '  (hidden: brought up)' : '  (escondido: trazido para cima)')) : off ? (EN ? '  (hidden now)' : '  (escondido agora)') : ''); lb.style.opacity = '1';
      if (performance.now() - t0 < 1200) SHOW.raf = requestAnimationFrame(follow); };
    const go = () => { try { el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); } catch (x) {} setTimeout(() => { try { up2 = !!lift(el); } catch (x) { up2 = false; } t0 = performance.now(); follow(); }, 450); SHOW.t = setTimeout(() => { hl.style.display = 'none'; lb.style.opacity = '0'; LIFT.style.display = 'none'; }, 5000); };
    let ms = 0; if (CFG.reveal) try { ms = CFG.reveal(el) || 0; } catch (x) {}
    if (ms) { lb.textContent = EN ? 'Opening its panel…' : 'A abrir o painel…'; lb.style.opacity = '1'; hl.style.display = 'none'; SHOW.t = setTimeout(go, ms); } else go(); }
  function wire() {
    $('bd').addEventListener('click', e => { const cn = e.target.closest('.cnt'); if (cn) { const row = cn.closest('[data-id]'); if (row) { showEl(row.dataset.id); return; } }
      const fb = e.target.closest('.fo'); if (fb) { const fo = (CFG.fonts || []).find(x => x.name === fb.dataset.f); setFont(fo || null); P.d.querySelectorAll('.fo').forEach(x => x.classList.toggle('on', x === fb)); setTimeout(() => { scan(); }, 500); return; }
      const b = e.target.closest('.st button'); if (!b) return; const row = b.closest('.row'), inp = row.querySelector('.in'); inp.value = step(inp.value, +b.dataset.d); apply(row.dataset.id, inp.value); refreshRow(row, inp.value); });
    $('bd').addEventListener('change', e => { const row = e.target.closest('.row'); if (!row) return;
      if (e.target.type === 'color') { const inp = row.querySelector('.in'); inp.value = e.target.value; apply(row.dataset.id, e.target.value); refreshRow(row, e.target.value); }
      else if (e.target.classList.contains('in')) { apply(row.dataset.id, e.target.value.trim()); refreshRow(row, e.target.value.trim()); } });
    $('bd').addEventListener('input', e => { if (e.target.type !== 'color') return; const row = e.target.closest('.row'); row.querySelector('.in').value = e.target.value; apply(row.dataset.id, e.target.value); refreshRow(row, e.target.value); });
    $('bd').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('in')) e.target.blur(); });
    /* copy: every change on this device, as text to hand over (to Claude, say) */
    $('cp').onclick = async () => { const s = load(), ks = Object.keys(s);
      const txt = ks.length ? (EN ? 'Token changes' : 'Alterações de tokens') + ' (' + APP + ', ' + themeSig() + '):\n' + ks.map(k => { const t = k[0], id = k.slice(2), g = t === 'g' && DB && DB.groups.get(id);
        return '- ' + (t === 'v' || t === 'x' || t === 'f' ? id : g ? (g.tab + ' ' + (g.prop || '') + ' ' + g.key).replace(/\s+/g, ' ') : id) + ' → ' + s[k]; }).join('\n') : L.nochg;
      try { await navigator.clipboard.writeText(txt); toast(ks.length ? L.copied : L.nochg); } catch (e) { prompt(L.copy, txt); } };
    $('rs').onclick = () => { if (!confirm(L.resetQ)) return; LS.set(KEY(), null); location.reload(); };
  }
  function refreshRow(row, v) { const sw = row.querySelector('.sw'); if (sw) sw.style.background = v; const aa = row.querySelector('.aa'); if (aa) aa.style.fontSize = Math.min(28, Math.max(8, pxOf(v) || 13)) + 'px';
    const sq = row.querySelector('.sq'); if (sq) sq.style.borderRadius = Math.min(14, pxOf(v) || 0) + 'px'; const bar = row.querySelector('.bar'); if (bar) bar.style.width = Math.min(32, Math.max(2, pxOf(v) || 0)) + 'px'; }
  /* the fonts to try load when the panel opens: on the page (to apply) and in the panel (for their samples) */
  function fontsUp() { (CFG.fonts || []).forEach(f => { if (!f.href) return; [document, P.d].forEach(d => { if (d.querySelector('link[data-tokpf="' + f.name + '"]')) return; const l = d.createElement('link'); l.rel = 'stylesheet'; l.href = f.href; l.dataset.tokpf = f.name; d.head.appendChild(l);
      if (d === P.d) l.onload = () => { try { P.d.fonts.load('700 18px "' + f.name + '"').then(() => { if (tab === 'text' && isOpen) draw(); }); } catch (e) {} }; }); }); }
  function start() { if (CFG.when && !CFG.when()) return; build(); setTimeout(() => { try { scan(); reapply(); } catch (e) {} if (LS.get('tokp-open') === '1') toggle(true); }, 1200); }
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
  window.TOKP_PANEL = { open: () => toggle(true), close: () => toggle(false), rescan: () => { scan(); draw(); } };
})();
