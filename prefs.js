// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
/* Map tiles (Oct 4): one provider at a time, chosen in the Maps menu; kept on this phone (default MapTiler) */
window.__wfTiles = { list: [['maptiler', 'MapTiler'], ['osm', 'OpenStreetMap']],
  /* renders (looks) of each provider: [id, name, extension]; only what the free plans give */
  styles: { maptiler: [['openstreetmap', 'Standard', 'jpg'], ['streets-v2', 'Streets', 'png'], ['outdoor-v2', 'Outdoor', 'png'], ['topo-v2', 'Topographic', 'png'], ['satellite', 'Satellite', 'jpg'], ['hybrid', 'Satellite with labels', 'jpg']], osm: [['standard', 'Standard', 'png']] },
  get: function () { var v = ''; try { v = localStorage.getItem('wf-maptiles') || ''; } catch (e) {} return v === 'osm' ? 'osm' : 'maptiler'; },
  style: function () { var p = this.get(), v = ''; try { v = localStorage.getItem('wf-maprender') || ''; } catch (e) {} var L = this.styles[p]; for (var i = 0; i < L.length; i++) if (L[i][0] === v) return v; return p === 'maptiler' ? 'topo-v2' : L[0][0]; },   /* (Oct 5, 07:16) Topographic is the default look */
  share: function () { return 'map=' + this.get() + '&look=' + this.style(); },   /* the shared link carries the map engine and its look */
  set: function (k, st) { try { localStorage.setItem('wf-maptiles', k === 'osm' ? 'osm' : 'maptiler'); if (st) localStorage.setItem('wf-maprender', st); } catch (e) {} try { window.dispatchEvent(new Event('wf-maptiles')); } catch (e) {} },
  host: function () { return this.get() === 'osm' ? 'https://tile.openstreetmap.org/' : 'https://api.maptiler.com/maps/'; },
  url: function (z, x, y) { if (this.get() === 'osm') return 'https://tile.openstreetmap.org/' + z + '/' + x + '/' + y + '.png'; var st = this.style(), L = this.styles.maptiler, ex = 'png'; for (var i = 0; i < L.length; i++) if (L[i][0] === st) ex = L[i][2]; return 'https://api.maptiler.com/maps/' + st + '/256/' + z + '/' + x + '/' + y + ((window.devicePixelRatio || 1) >= 1.5 ? '@2x' : '') + '.' + ex + '?key=' + this.key(); },   /* (Oct 11, 22:40) sharp on phone screens: the double-density tile in the same 256px slot */
  /* (Oct 5, 02:48) the MapTiler key: the app's shared one, or the person's own saved on this phone (Maps menu) */
  KEY0: 'nXogmRs94P1OvRDMdUN6',
  own: function () { try { return localStorage.getItem('wf-mt-key') || ''; } catch (e) { return ''; } },
  key: function () { return this.own() || this.KEY0; },
  /* a key that fails to load (checked once per session, and on every save): its menu icon shows a red dot */
  status: function () { try { return JSON.parse(sessionStorage.getItem('wf-mt-st') || 'null'); } catch (e) { return null; } },
  test: function (k, cb) { var self = this, done = function (ok, err) { var st = { ok: ok, err: err || '', at: Date.now(), key: (k || '').slice(-4) }; try { sessionStorage.setItem('wf-mt-st', JSON.stringify(st)); } catch (e) {} try { window.dispatchEvent(new Event('wf-keys')); } catch (e) {} if (cb) cb(st); };
    try { fetch('https://api.maptiler.com/maps/streets-v2/256/0/0/0.png?key=' + encodeURIComponent(k || self.key()), { cache: 'no-store' }).then(function (r) { done(r.ok, r.ok ? '' : (r.status === 401 || r.status === 403 ? 'key not accepted' : 'HTTP ' + r.status)); }, function () { done(false, 'no connection to MapTiler'); }); } catch (e) { done(false, 'no connection to MapTiler'); } },
  setOwn: function (k, cb) { var self = this; k = (k || '').trim(); try { if (k) localStorage.setItem('wf-mt-key', k); else localStorage.removeItem('wf-mt-key'); } catch (e) {} try { window.dispatchEvent(new Event('wf-maptiles')); } catch (e) {} self.test(self.key(), cb); },
  credit: function () { return this.get() === 'osm' ? 'Map © OpenStreetMap' : 'Map © MapTiler © OpenStreetMap'; } };
/* (Oct 5, 08:15) one status tag for a fire station and its units, everywhere (map tooltip, station header, vehicles, crews):
   Available in the blue tones; busy with fires in orange; the shared tag shape (.wf-ctag: centred, no icon, 4px 16px) */
window.__wfStTag = { ok: { bg: 'rgba(31,111,178,0.22)', fg: '#185A93' }   /* (Oct 10, 11:14) 22% (was 14%): on the Glacier palette's bluish page the 14% tint matched the page and the tag lost its background */, busy: { bg: 'rgba(232,106,0,0.14)', fg: '#A34800' } };
window.__wfNight = function (L) { if (!L) return false; if (L.night != null) return !!L.night; return !!(window.__wfSunAlt && L.lat != null && L.t && window.__wfSunAlt(L.lat, L.lon, Date.parse(L.t)) < -0.833); };   /* a detection made with the sun below the horizon (see live.js) */
/* The clock at the incident's own place, with AM / PM (e.g. "4:05 AM"); the zone is added when it differs from the phone's ("4:05 AM PDT") */
window.__wfTzOf = function (st, lon) { var Z = { PT: 'Europe/Lisbon', BRA: 'America/Sao_Paulo', AMZ: 'America/Manaus', ESP: 'Europe/Madrid', FRA: 'Europe/Paris', ITA: 'Europe/Rome', GRC: 'Europe/Athens', CAN: 'America/Toronto', MEX: 'America/Mexico_City', CHL: 'America/Santiago', ARG: 'America/Argentina/Buenos_Aires',
  CA: 'America/Los_Angeles', NV: 'America/Los_Angeles', OR: 'America/Los_Angeles', WA: 'America/Los_Angeles', AZ: 'America/Phoenix', UT: 'America/Denver', CO: 'America/Denver', NM: 'America/Denver', WY: 'America/Denver', MT: 'America/Denver', ID: 'America/Boise', AK: 'America/Anchorage', HI: 'Pacific/Honolulu',
  TX: 'America/Chicago', OK: 'America/Chicago', KS: 'America/Chicago', NE: 'America/Chicago', SD: 'America/Chicago', ND: 'America/Chicago', MN: 'America/Chicago', IA: 'America/Chicago', MO: 'America/Chicago', AR: 'America/Chicago', LA: 'America/Chicago', MS: 'America/Chicago', AL: 'America/Chicago', TN: 'America/Chicago', WI: 'America/Chicago', IL: 'America/Chicago' };
  if (Z[st]) return Z[st]; if (/^[A-Z]{2}$/.test(st || '')) return 'America/New_York'; if (isFinite(lon)) { var o = -Math.round(lon / 15); return o === 0 ? 'Etc/GMT' : 'Etc/GMT' + (o > 0 ? '+' : '') + o; } return undefined; };
window.__wfClock = function (ms, st, lon) { var tz = window.__wfTzOf(st, lon), mine = ''; try { mine = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
  var o = { hour: 'numeric', minute: '2-digit', hour12: true }; if (tz) o.timeZone = tz; if (tz && tz !== mine) o.timeZoneName = 'short';
  try { return new Date(ms).toLocaleTimeString('en-US', o); } catch (e) { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); } };
window.__wfNightAt = function (ms, lat, lon) { return !!(window.__wfSunAlt && isFinite(lat) && isFinite(lon) && ms && window.__wfSunAlt(lat, lon, ms) < -0.833); };   /* the sun below the horizon there and then */
/* Air support badge: one definition for every screen (the station-crest look for aircraft) */
window.__wfAirBadge = function () { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g id="w" fill="#D9A520" stroke="#6B4E00" stroke-width="0.8" stroke-linejoin="round"><path d="M14.5 11.5C9.5 9.3 4.5 8.4.6 8.9c2.6 2.8 6 4.4 9.6 5.2-3.2.6-5.8 1.8-7.8 3.4 3.6.9 7.1.7 10.2-.2-2.1 1.5-3.9 3.4-5.2 5.9 3.2-.3 5.9-1.6 8-3.4Z"/></g><use href="#w" transform="translate(40 0) scale(-1 1)"/><path d="M20 6 28 9.3V18.8c0 5.6-3.2 10-8 12.7-4.8-2.7-8-7.1-8-12.7V9.3Z" fill="#1B2E57" stroke="#FFFFFF" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 12.2l1.6 3.25 3.6.52-2.6 2.53.6 3.57L20 20.4l-3.2 1.67.6-3.57-2.6-2.53 3.6-.52Z" fill="#FFFFFF"/></svg>'); };
/* Helicopter badge: the station-crest look (a shield) with a helicopter, for aircraft in crew lists */
window.__wfHeliBadge = function () { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 3 34 7.5v11.5c0 8.6-5.9 14.6-14 17.5C11.9 33.6 6 27.6 6 19V7.5Z" fill="#1F3A68" stroke="#D9A520" stroke-width="1.6" stroke-linejoin="round"/><g fill="#FFFFFF" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 13.2h19" stroke-width="1.6" fill="none"/><path d="M20 13.2v2.6" stroke-width="1.6" fill="none"/><path d="M14.3 17.6c0-1.1.9-1.8 2-1.8h5.4c3.4 0 6 2.2 6.6 5.2l.2 1.1c.1.7-.4 1.3-1.1 1.3H17.3c-1.7 0-3-1.3-3-3Z" stroke-width="0.6"/><path d="M14.4 19.2H9.6l-1.2-2.6" stroke-width="1.5" fill="none"/><path d="M16.6 26.6h11" stroke-width="1.5" fill="none"/><path d="M18.6 23.6v3M25.2 23.6v3" stroke-width="1.3" fill="none"/></g><path d="M22.4 17.4h3.2c1 .5 1.7 1.3 2 2.3h-5.2Z" fill="#8FB3E8"/></svg>'); };
/* (Oct 9, 12:11) an incident's name: a candidate is called by its place ("Altadena"); once declared a fire it is "Altadena Fire"
   (pt "Incêndio de Altadena"), everywhere. Names that already say fire, or start with Near, are kept */
window.__wfIncName = function (p, fire) { p = String(p || '').trim(); if (!fire || !p || /\bfire\b|\bincêndio\b|^near |^perto de /i.test(p)) return p; return /^pt/i.test(document.documentElement.lang || '') ? 'Incêndio de ' + p : p + ' Fire'; };
/* (Oct 11, 14:45) no unnamed incidents: a fire known only by its code (LAC-350855, V11908) or by no name takes the nearest
   place reference its source gives (US: the point-of-origin town, else the county; BC: the official location line, e.g. "Duck FSR";
   else its region), so it reads "Hemet Fire". __wfNameFix maps a code or an incident id to that reference (live.js fills it) */
window.__wfNameFix = window.__wfNameFix || {};
window.__wfFireName = function (p, ref, id) { p = String(p || '').trim(); if (!(!p || /^[A-Za-z]{2,5}-?\d{3,}$/.test(p) || /^[A-Z]\d{4,}$/i.test(p) || /^unnamed( fire)?$/i.test(p) || /^incêndio sem nome$/i.test(p))) return p;
  var F = window.__wfNameFix, f = (id && F[id]) || F[p.toUpperCase()] || String(ref || '').trim();
  if (!f && id) { var r = (window.__wfLiveFiresAll || []).find(function (x) { return x && x[2] === id; }); if (r && r[3] && r[3] !== p) f = window.__wfFireName(r[3], r[10]); }
  return f || (/unnamed|sem nome/i.test(p) ? '' : p); };
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
    pt: ['RC', 'Rita Cardoso', 'Comandante Nacional de Emergência e Proteção Civil', 'ANEPC. Comando Nacional', 'Portugal', 'https://images.unsplash.com/photo-1771254507173-e40b54571924?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'pt'],
    ca: ['MR', 'Marcus Reyes', 'Chief, Fire and Rescue Division', 'Cal OES', 'California', 'https://images.unsplash.com/photo-1713689824350-929a848279c4?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'en'],
    nv: ['DW', 'Dana Whitfield', 'State Forester Firewarden', 'Nevada Division of Forestry', 'Nevada region only', 'https://images.unsplash.com/photo-1779988208387-d7be2c69194b?w=240&h=240&fit=crop&crop=faces&auto=format&q=70', 'en'],
    amz: ['RN', 'Rafael Nogueira', 'Coordenador de Operações do Prevfogo na Amazônia Legal', 'Ibama · Prevfogo · Manaus', 'Amazônia Legal region only', '', 'en'],
    admin: ['JW', 'James Whitmore', 'Emergency management director', 'Government overview', 'All regions', '', 'en'],
    /* (Oct 6) role profiles, signed in with the California area (wf-role ca) and known by wf-custom */
    coord: ['FO', 'Frank Ortiz', 'Battalion Chief', 'CAL FIRE/Riverside County Fire', 'Temecula', '', 'en'],
    ff: ['DB', 'Daniel Brooks', 'Captain', 'CAL FIRE/Riverside County Fire', 'Temecula', '', 'en'],
    eng: ['LW', 'Lisa Wong', 'Engineer', 'CAL FIRE/Riverside County Fire', 'Temecula', '', 'en'],
    fft: ['BO', 'Ben Ortega', 'Firefighter', 'CAL FIRE/Riverside County Fire', 'Temecula', '', 'en'],
    /* (Oct 11, 18:20) their Portuguese counterparts (wf-role pt) */
    ptco: ['RG', 'Rui Gaspar', 'Comandante', 'Bombeiros Voluntários de Mação', 'Mação', '', 'pt'],
    ptce: ['SA', 'Sofia Antunes', 'Chefe de equipa', 'Bombeiros Voluntários de Mação', 'Mação', '', 'pt'],
    ptbo: ['TM', 'Tiago Martins', 'Bombeiro', 'Bombeiros Voluntários de Mação', 'Mação', '', 'pt'],
    /* (Oct 13) the dispatch profiles: who verifies ignitions and sends the initial attack */
    ecc: ['EV', 'Elena Vasquez', 'Fire Captain, ECC', 'CAL FIRE Santa Clara Unit. Emergency Command Center', 'Santa Clara Unit. Morgan Hill', '', 'en'],
    ptecc: ['CR', 'Cláudia Ribeiro', 'Oficial de operações', 'ANEPC. CSREPC Médio Tejo', 'Portugal', '', 'pt']
  };
  // (Oct 4) each demo profile's description, as on its login profile card (Login.dc.html)
  var SUMS = {
    pt: 'Commands national emergency operations. Sets the alert level, moves reinforcement groups and aerial means between sub-regions, and takes command of a fire when it goes to national level.',
    ca: "Runs California's fire mutual aid. Moves strike teams and engines between counties and fires, activates the state mutual aid plan and works with CAL FIRE and the counties when local resources run out.",
    nv: 'Heads the state wildland fire service. Coordinates with BLM and the Forest Service, approves resource orders across counties, and requests federal help for large fires.',
    amz: 'Coordinates fire prevention and brigade operations across the Legal Amazon. Hires and trains brigades before the dry season, plans prescribed burning, follows INPE hotspots and fire events daily, and sends federal brigades to indigenous lands and protected areas.',
    admin: 'One level above the station captains: follows every fire and ignition in all countries, where forces are and where risk is rising, and calls in help across borders. Also manages user access and data feeds.',
    coord: "Commands Battalion 15 (Temecula): the battalion's stations and their area. Takes command of a fire when it grows past the first engine, places the crews, asks dispatch for more and asks the sheriff for evacuations.",
    ff: "Commands Engine 12 and its crew. Often first on scene: confirms the fire, declares it and commands it until the battalion chief takes over.",
    eng: "Drives and pumps Engine 12. Goes where dispatch sends the engine, keeps the water flowing on the line and keeps the crew informed in the incident chat.",
    fft: "Works the line on Engine 3167, a CAL FIRE Type 3 wildland engine. Goes where dispatch sends the engine, follows the captain's orders and reports from the line in the incident chat.",
    ptco: "Commands the fire brigade and its area. Takes over as COS when a fire grows past the first crew, places the teams and asks the CSREPC for reinforcements, and works with the GNR on evacuations.",
    ptce: "Leads VFCI 01 and its team. Often first on scene: confirms the fire, reports it to the CSREPC and is COS until the commander takes over.",
    ptbo: "Works the line on VFCI 02, a forest fire engine. Goes where the CSREPC sends the team, follows the crew chief's orders and reports from the line in the incident chat.",
    ecc: "Runs the watch at the Emergency Command Center. Verifies smoke reports and camera alerts, sends the initial attack set by the response plan, and dismisses false alarms.",
    ptecc: "Runs the CSREPC's operations room. Verifies alerts from lookout posts, cameras and 112 calls, sends the initial attack and dismisses false alarms."
  };

  // ---- Text size: every pixel font size (and line height) one notch up or down ----
  var SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 34];
  var LINES = [12, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 36, 41];
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
    out.push('.kpi{font-size:' + r(30) + 'px!important}.kpi small,.lbl{font-size:' + r(15) + 'px!important}.ctip b{font-size:' + r(18) + 'px!important}');
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
    // Candidate markers at night (Oct 3, 21:02): the yellow fill at 80% so they stand out on the dark map as much as the light
    // ones do by day; their rim and moon stay dark on the yellow, and the pulse ring turns yellow (a dark ring would vanish)
    o.push('circle[fill="#E5FF00"][style*="fill-opacity: 0.2"]{fill-opacity:.8!important}.tipwrap svg.mk,.tipwrap svg,.fzone>svg.mk{opacity:1!important}.tipwrap svg.mk circle[fill="#E5FF00"]{fill-opacity:.8!important}');
    o.push('circle[fill="#E5FF00"][stroke="#3E3E3E"],circle[fill="#E5FF00"][style*="stroke: #3E3E3E"],[data-wf-maproot] circle[fill="none"][stroke="#3E3E3E"]:not(:has(animate)){stroke:#1C1C1E!important}[data-wf-maproot] circle[fill="none"][stroke="#3E3E3E"]:has(animate),[data-wf-maproot] circle[fill="none"]:has(animateTransform),.wf-pinpulse{stroke:var(--wf-y,#E5FF00)!important}.wf-tdot{background:rgba(var(--wf-y-rgb,229,255,0),0.8)!important}');
    o.push('path[transform="rotate(-25 12 12)"][fill="#1C1C1E"]{fill:#E5E5EA}');   // the night moon next to text turns light at night (Oct 3, 18:31); on the map's yellow markers it stays dark
    [['rgb(242, 242, 247)', '#181818'], ['rgb(255, 255, 255)', '#282828'], ['rgb(238, 238, 240)', '#282828'], ['rgb(229, 229, 234)', '#3E3E3E'],
      ['rgb(227, 227, 232)', '#3E3E3E'], ['rgb(230, 230, 235)', '#1F1F1F'],
      ['rgba(118, 118, 128, 0.12)', 'rgba(118,118,128,0.24)'], ['rgba(60, 60, 67, 0.3)', 'rgba(235,235,245,0.3)'], ['rgba(60, 60, 67, 0.2)', 'rgba(235,235,245,0.2)'], ['rgba(60, 60, 67, 0.12)', 'rgba(235,235,245,0.12)'],
      ['rgba(52, 199, 89, 0.08)', 'rgba(48,209,88,0.16)'], ['rgba(52, 199, 89, 0.12)', 'rgba(48,209,88,0.18)'], ['rgba(204, 153, 0, 0.12)', 'rgba(255,214,10,0.16)'],
      ['rgba(0, 121, 166, 0.1)', 'rgba(90,200,250,0.16)'], ['rgba(0, 113, 227, 0.06)', 'rgba(64,156,255,0.14)']
    ].concat([0.7, 0.72, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.95, 0.97, 0.98].map(function (a) {   // frosted white panels, chips and pills
      return ['rgba(255, 255, 255, ' + a + ')', 'rgba(40,40,40,' + Math.max(a, 0.82) + ')']; }))
    .concat([0.7, 0.78, 0.8, 0.85, 0.88, 0.9, 0.92, 0.94, 0.96, 0.97, 0.98].map(function (a) {   // frosted grey map controls and legend chips
      return ['rgba(242, 242, 247, ' + a + ')', 'rgba(24,24,24,' + Math.max(a, 0.88) + ')']; }))
    .concat([['rgba(242, 242, 247, 0.62)', 'rgba(40,40,40,0.62)'], ['rgba(230, 230, 235, 0.62)', 'rgba(40,40,40,0.62)'], ['rgba(255, 255, 255, 0.62)', 'rgba(40,40,40,0.62)']])   /* (Oct 17, 15:34) one glass: the dark glass at night */   // glass over maps: legend chips and cards (Oct 2)
    .forEach(function (p) { o.push(col('background', p[0], p[1])); o.push(col('background-color', p[0], p[1])); });
    [['rgb(0, 0, 0)', '#FFFFFF'], ['rgba(118, 118, 128, 0.12)', 'rgba(118,118,128,0.24)'], ['rgb(84, 84, 88)', '#B3B3B3'], ['rgb(60, 60, 67)', '#D1D1D6'], ['rgb(72, 72, 74)', '#B3B3B3'], ['rgb(152, 152, 159)', '#A7A7A7'], ['rgb(110, 110, 115)', '#B3B3B3'],
      ['rgb(0, 98, 204)', '#409CFF'], ['rgb(0, 106, 145)', '#5AC8FA'], ['rgb(0, 113, 227)', '#409CFF'], ['rgb(10, 111, 219)', '#409CFF'], ['rgb(30, 122, 52)', '#30D158'],
      ['rgb(122, 86, 0)', '#FFD60A'], ['rgb(58, 58, 60)', '#FFFFFF'], ['rgb(0, 121, 166)', '#5AC8FA'], ['rgb(110, 58, 208)', '#BF5AF2'], ['rgb(44, 44, 46)', '#D1D1D6'], ['rgb(99, 99, 102)', '#B3B3B3'], ['rgb(108, 108, 112)', '#B3B3B3'],
      ['rgb(184, 74, 0)', '#FF9F0A'], ['rgb(184, 54, 10)', '#FF9F0A'], ['rgb(154, 74, 0)', '#FF9F0A'], ['rgb(179, 20, 27)', '#FF6961'], ['rgb(135, 88, 0)', '#FFD60A'], ['rgb(0, 112, 122)', '#40C8E0'], ['rgb(10, 102, 204)', '#409CFF'], ['rgb(163, 72, 0)', '#FF9F0A'], ['rgb(176, 0, 26)', '#FF6961'], ['rgb(122, 63, 224)', '#BF5AF2']
    ].forEach(function (p) { o.push(col('color', p[0], p[1])); });
    o.push('[style*="solid rgba(60, 60, 67"]{border-color:rgba(84,84,88,0.65)!important}');
    o.push('svg [stroke="#545458"]{stroke:#B3B3B3}');
    o.push('[style*="text-shadow: rgb(255, 255, 255)"]{text-shadow:0 0 2px #000,0 0 6px #000!important}');   // map labels and credit: dark halo
    /* One dark palette: page #121212, surface #181818, raised #282828, band/fill #3E3E3E; text #FFFFFF, secondary #B3B3B3, tertiary #A7A7A7, controls #D1D1D6 */
    // The screens' own style sheets
    o.push('html,body{background:#121212!important;color:#FFFFFF}a{color:#409CFF}');
    o.push('.segblob{background:var(--wf-pri-bg)!important}.segopt[aria-checked=true],.segopt[aria-selected=true]{color:var(--wf-pri-fg)!important}.segopt[aria-checked=false],.segopt[aria-selected=false]{color:#D1D1D6!important}');   // the accent is the same hi-vis yellow in both themes
    o.push('.wf-qual{background:#3E3E3E!important;color:#FFFFFF!important}');
    o.push('[role=meter] span[style*="background: #3E3E3E"],.bar[style*="background: #3E3E3E"],.chbar[style*="background: #3E3E3E"]{background:#D1D1D6!important}');   // thin bars read light at night
    o.push('[data-wf-kpicard] path[fill="#3E3E3E"]{fill:#D1D1D6}[data-wf-kpicard] path[stroke="#3E3E3E"],[data-wf-kpicard] svg[stroke="#3E3E3E"]{stroke:#D1D1D6}[data-wf-kpicard] path[stroke="#FFFFFF"]{stroke:#282828}');   // KPI micro charts: the dark grey reads light at night
    o.push('html:root .sheet{background:#181818!important}.kpi small,.lbl,.sqsearch::placeholder,.pw::placeholder{color:#B3B3B3!important}');
    o.push('.tip,.ctip,.igpill,a.card,.stackbtn{background:rgba(40,40,40,0.97)!important;border-color:rgba(84,84,88,0.65)!important;color:#D1D1D6!important}');
    o.push('.igpill::after{background:rgba(40,40,40,0.97)!important;border-color:rgba(84,84,88,0.65)!important}.tip b,.ctip b{color:#FFFFFF!important}');
    o.push('.sqrow::after,.sqtop::before{background:rgba(84,84,88,0.65)!important}.strow{border-top-color:rgba(84,84,88,0.65)!important}');
    o.push('html:root .wf-big,html:root .wf-like,html:root .wf-like-xs{color:#FFFFFF!important}');
    o.push('html:root .wf-note{color:#B3B3B3!important}');
    o.push('.wf-rm{background:rgba(255,69,58,0.10)!important;color:#FF8A80!important;-webkit-text-fill-color:#FF8A80!important}');   // Remove: red tint with red text, 5:1 at night too
    o.push('html:root .wf-title-xs{color:#FFFFFF!important}.wf-seg .segopt{color:#D1D1D6}.wf-tabs .tabopt{color:#B3B3B3}.wf-tabs .tabopt[aria-selected=true]{color:#FFFFFF}.wf-tabs{box-shadow:none}.wf-tabs::before{background:#3E3E3E}.wf-qual{color:#FFFFFF!important}');   // class-set text colours   // big numbers stay readable at night
    o.push('html:root{--wf-pri-bg:#E5E5EA;--wf-pri-fg:#1C1C1E;--wf-band-solid:#3E3E3E;--wf-sec-bg:#6A6A6E;--wf-sec-fg:#F2F2F7;--wf-dis-bg:rgba(106,106,110,0.45);--wf-dis-fg:rgba(242,242,247,0.5);--wf-ter-bg:rgba(var(--wf-y-rgb), 0.12);--wf-ter-fg:#FFFFFF}html:root .wf-danger{background:rgba(255,69,58,0.15)!important;color:#FF8A80!important}');
    o.push('.stepb{background:rgba(118,118,128,0.24)!important;color:#FFFFFF!important}.flap,.flap>.fl{background:#3E3E3E!important}.ghost.round{background:rgba(40,40,40,0.88)!important}');
    o.push('.opt:hover,.sqrow[data-sel=false]:not(.nosep):not([disabled]):hover{background-color:rgba(118,118,128,0.18)!important}');
    // Map: the street tiles turn to a night map; markers and fire shapes keep their colours
    o.push('image[href*="api.maptiler.com"],image[href*="tile.openstreetmap"]{filter:url(#wfNightTiles)}');
    o.push('rect[fill="#F2F2F7"]{fill:#181818}');
    o.push('[aria-label^="Map legend"] path[stroke="#1C1C1E"]{stroke:#E5E5EA}');
    o.push('[data-wf-maploader] path[fill="#3E3E3E"]{fill:#D1D1D6}[data-wf-maploader] path[stroke="#3E3E3E"]{stroke:#D1D1D6}');   /* the loader's flame reads light on the dark grey */
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
      '<feComponentTransfer><feFuncR type="linear" slope="0.52" intercept="0.21"/><feFuncG type="linear" slope="0.52" intercept="0.21"/><feFuncB type="linear" slope="0.54" intercept="0.22"/></feComponentTransfer>' +
      '</filter></svg>';
    document.body.appendChild(d);
  }

  // Button colours, one definition for the whole app: secondary = dark grey with the hi-vis yellow label;
  // tertiary (subtle) = the yellow at 10% with dark text by day and light text at night. (Primary stays hi-vis yellow.)
  // Forest headers take three photos from this visit's random order of nature photos (fit.js)
  // Big KPI size for a row of n numbers across width px: as big as the longest number allows, capped by how many share the row
  window.__wfKpiPx = function (vals, n, width) {
    n = Math.max(1, n || 1); var w = (width || 358) / n - 8, len = Math.max.apply(null, (vals || ['0']).map(function (v) { return String(v).length || 1; }));
    var cap = n === 1 ? 96 : n === 2 ? 88 : n === 3 ? 68 : 52;
    return Math.max(28, Math.min(cap, Math.floor(w / (len * 0.6)))) + 'px';
  };
  var WFP = (function () { var P = (window.__wfPhotos || []).slice(0, 3), D = [{ f: 'forest-1.webp', b: 1 }, { f: 'forest-2.webp', b: 1 }, { f: 'forest-3.webp', b: 1 }]; while (P.length < 3) P.push(D[P.length]); return P; })();
  var BTN = '.sqrow::after{display:none!important}' +
    // The likelihood tag, one component (Oct 3, 20:26): the stage tags' pill; colours from live.js __wfConfTag. Incident list, candidate picker, map
    '.wf-ctag{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:4px 12px;box-sizing:border-box;border-radius:999px;font-size:15px;line-height:20px;font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}' +
    // Stage tags (Oct 3, 18:50; 21:09): the icon sits at the left, 8px in; the label is centred in the space between the icon and the tag's right edge
    /* (Oct 9, 11:03) the stage band in every incident header is the chat's: 52px tall, 16px in, 18px text, icon then stage on the left, time on the right */
    /* (Oct 10, 22:01, app-wide) every round button is dark: dark grey with a white icon (it was light grey with a dark icon); the counters on them get a ring of the page colour so they stay apart */
    ':is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"],[data-round][style*="border-radius: 999px"]):is([style*="rgba(118,118,128,0.12)"],[style*="rgba(118, 118, 128, 0.12)"]),.wf-mb{background:rgba(255, 255, 255, 0.62)!important;color:rgb(58, 58, 60)!important;-webkit-text-fill-color:rgb(58, 58, 60);-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;box-shadow:0 0 16px rgba(0,0,0,0.16)!important;border:0!important}' +   /* (Oct 16, 13:06, app-wide) the round buttons are white glass with dark grey icons and the tooltips' shadow (were the dark #3A3A3C formula) */
    'html.wf-dark :is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"],[data-round][style*="border-radius: 999px"]):is([style*="rgba(118,118,128,0.12)"],[style*="rgba(118, 118, 128, 0.12)"]) svg [stroke]:not([stroke=none]){stroke:rgb(242, 242, 247)}' +
    'html.wf-dark :is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"],[data-round][style*="border-radius: 999px"]):is([style*="rgba(118,118,128,0.12)"],[style*="rgba(118, 118, 128, 0.12)"]),html.wf-dark .wf-mb{background:rgba(40, 40, 40, 0.62)!important;color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)}' +
    /* (Oct 16, 15:52) count badges on red: white numbers (a round button's dark text fill was inherited and unreadable on the red) */ ':root [style*="background: rgb(215, 0, 21)"]{color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important}' +
    ':is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"],[data-round][style*="border-radius: 999px"]):is([style*="rgba(118,118,128,0.12)"],[style*="rgba(118, 118, 128, 0.12)"]) svg :not([stroke=none]):not([stroke=currentColor])[stroke],.wf-mb svg :not([stroke=none]):not([stroke=currentColor])[stroke]{stroke:rgb(58, 58, 60)}' +
    ':is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"],[data-round][style*="border-radius: 999px"]):is([style*="rgba(118,118,128,0.12)"],[style*="rgba(118, 118, 128, 0.12)"]) svg :not([fill=none]):not([fill=currentColor])[fill],.wf-mb svg :not([fill=none]):not([fill=currentColor])[fill]{fill:rgb(58, 58, 60)}' +
    '[style*="top: -12px"][style*="right: -6px"][style*="border-radius: 999px"]{box-shadow:0 0 0 2px var(--wf-page, #F2F2F7)}' +
    '.wf-hmtag,.wf-risk-tag{display:none!important}' +
    'html:not(.wf-menuopen):has(:is(.wf-glass,.scrim,.wf-hap-scrim)[style*="pointer-events: auto"]) .wf-mb:not([data-wf-x]){opacity:0!important;pointer-events:none!important;transition:opacity .2s ease}' +   /* (Oct 10, 22:37) the floating menu button hides under any open blade's overlay */   /* (Oct 10, 22:30) the structures-at-risk triangle is removed everywhere, until a simpler, clearer way to signal it */
    '.wf-hst-fs[aria-expanded=true]{left:16px!important;right:16px!important;max-width:none!important}' +   /* (Oct 10, 22:50) the stage tag opened on a map: full width inside the map's 16px side padding */
    '.wf-hst-fs[aria-expanded=true] .wf-hst,.wf-qual[aria-expanded=true] .wf-hst{display:flex!important;flex:1 1 auto!important;width:100%!important}' +
    '.wf-hst-fs .wf-team,.wf-qual .wf-team{top:0!important;left:0!important;width:100%!important;max-width:none!important}' +   /* its team opens over it: the stage band becomes the first card's header */
    ':is(button,a,[role=button]):is([style*="border-radius: 50%"],[style*="border-radius:50%"]):is([style*="rgba(0,0,0,0.5"],[style*="rgba(0, 0, 0, 0.5"],[style*="rgba(0,0,0,0.6"]){background:rgba(255, 255, 255, 0.62)!important;color:rgb(58, 58, 60)!important;-webkit-text-fill-color:rgb(58, 58, 60);-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;box-shadow:0 0 16px rgba(0,0,0,0.16)!important;border:0!important}' +   /* (Oct 10, 23:28) one dark round button app-wide, the header\'s (#3A3A3C, white icon): map controls too */
    '.wf-bul{display:list-item;list-style:disc outside;margin-left:20px}.wf-bul::marker{color:#8E8E93}' +   /* (Oct 10, 22:08) bullet points for card details, one per line */
    '.wf-stg.wf-stband{justify-content:flex-start!important;padding:0 16px!important;gap:8px}.wf-stg.wf-stband>svg{position:static!important;transform:none!important}' +   /* (Oct 10, 21:56) the stage history bands: the active band's model */
    '.wf-qual>svg:first-child{width:24px!important;height:24px!important}.wf-qual>svg:first-child path[stroke]{vector-effect:non-scaling-stroke;stroke-width:2px}html.wf-black,html.wf-black body{background:#000000!important}html.wf-black .wf-mb{opacity:0!important;pointer-events:none!important}.wf-dlg,section[role=dialog][data-swipe="down"],section[role=alertdialog][data-swipe="down"]{overflow:hidden}.wf-dlg::before,section[role=dialog][data-swipe="down"]::before,section[role=alertdialog][data-swipe="down"]::before{content:"";position:absolute;left:0;right:0;top:0;height:96px;z-index:-1;pointer-events:none;border-top-left-radius:inherit;border-top-right-radius:inherit;background:repeating-linear-gradient(-60deg,rgba(0,0,0,0.07) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.016) 38.75%,rgba(0,0,0,0.0625) 47.5%,rgba(0,0,0,0.14) 56.25%,rgba(0,0,0,0.25) 65%,rgba(0,0,0,0.39) 73.75%,rgba(0,0,0,0.56) 82.5%,rgba(0,0,0,0.77) 91.25%,#000 100%);mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.016) 38.75%,rgba(0,0,0,0.0625) 47.5%,rgba(0,0,0,0.14) 56.25%,rgba(0,0,0,0.25) 65%,rgba(0,0,0,0.39) 73.75%,rgba(0,0,0,0.56) 82.5%,rgba(0,0,0,0.77) 91.25%,#000 100%)}.wf-dlg [data-grab-close],section[role=dialog][data-swipe="down"] [data-grab-close],section[role=alertdialog][data-swipe="down"] [data-grab-close]{padding-top:16px!important}.wf-bi path{transform-box:view-box;transform-origin:12px 12px;transition:transform .2s cubic-bezier(.3,0,.2,1),opacity .12s ease}.wf-bi .b1{transform:translateY(-5px)}.wf-bi .b3{transform:translateY(5px)}[data-wf-x] .wf-bi .b1{transform:rotate(45deg)}[data-wf-x] .wf-bi .b2{opacity:0}[data-wf-x] .wf-bi .b3{transform:rotate(-45deg)}.qtag.wf-stg,.wf-hst-fs .qtag.wf-stg,.wf-qual.hd .qtag.wf-stg,.wf-qual .qtag.wf-stg{padding-left:8px!important;padding-right:16px!important}.wf-stg{position:relative;justify-content:center!important;padding-left:16px!important;padding-right:16px!important}.wf-stg:has(>svg){justify-content:flex-start!important;padding-left:8px!important;column-gap:8px!important}.wf-stg>svg{position:static!important;flex-shrink:0;margin:0!important;transform:none!important}.wf-qual.hd .qtag.wf-stg{min-height:48px!important;padding:0 16px 0 8px!important;font-size:18px!important;line-height:24px!important;justify-content:flex-start!important;gap:8px!important;border-radius:8px!important}.wf-qual.hd .qtag.wf-stg>svg{position:static!important;transform:none!important;width:18px!important;height:18px!important}' +   /* lists: no divider between items, only the line under the list's header */
    /* (Oct 8, 20:55) a count inside a switcher option sits in its own circle, white at 20% (To do 4, Resolved 8, Fires 1...) */
    '.wf-segn{display:inline-flex;align-items:center;justify-content:center;min-width:29px;height:29px;margin-left:8px;padding:0 4px;box-sizing:border-box;border-radius:15px;background:rgba(255,255,255,0.5);font-size:16px;line-height:20px;font-weight:600;font-variant-numeric:tabular-nums;vertical-align:middle}' +
    '.wf-note{font-size:14px!important;line-height:18px!important;font-weight:400!important;color:#6E6E73!important}' +   // estimate / simulation notes: 2px under the annotation
  /* tabs (not a switcher): labels on a hairline, the active one dark and semibold over an 8px lime bar, rounded at both ends, that glides between them; shared by every tab set */
  '[data-wf-kpicard]>span:first-child[style*="min-height: 40px"]{min-height:40px!important}' +   // mini cards: the title sits 40% closer to its value (all cards)
  '.wf-tabs{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);height:48px;box-shadow:none;margin-bottom:16px!important}' +
  '.wf-tabs .tabopt{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;padding:0 8px;border:0;background:transparent;font:inherit;font-size:18px;font-weight:400;color:#6E6E73;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;transition:color .3s ease}' +
  '.wf-tabs .tabopt[aria-selected=true]{color:#1C1C1E;font-weight:600}' +
  '.wf-tabs::before{content:"";position:absolute;z-index:1;left:0;right:0;bottom:0;height:12px;border-radius:6px;background:rgba(118,118,128,0.12);pointer-events:none}' +   /* the track: full width of the tabs, the band's grey, under the lime bar */
  '.wf-tabs>.tabbar{position:absolute;z-index:2;bottom:2px;height:8px;min-height:8px;border-radius:4px;background:var(--wf-y,#E5FF00);box-shadow:0 0 0 0.5px rgba(0,0,0,0.12);transition:transform .42s cubic-bezier(.4,0,.2,1);will-change:transform;pointer-events:none}' +
  '.wf-seg{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);height:48px;padding:4px 8px;box-sizing:border-box;border-radius:999px;background:rgba(118,118,128,0.12)}' +
  '.wf-seg>.segthumb{position:absolute;top:4px;bottom:4px;left:8px;transition:transform .29s cubic-bezier(.4,0,.2,1) .1s;will-change:transform}' +
  '.wf-seg>.segthumb>.segblob{position:absolute;inset:0;border-radius:999px;background:var(--wf-y)}.segblob{background:var(--wf-pri-bg)!important}.segopt[aria-checked=true],.segopt[aria-selected=true]{color:var(--wf-pri-fg)!important;-webkit-text-fill-color:var(--wf-pri-fg)}.segopt[aria-checked=true] .wf-segn,.segopt[aria-selected=true] .wf-segn{background:color-mix(in srgb,var(--wf-pri-fg) 22%,transparent)!important}' +
  '.wf-seg .segopt{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;padding:0 4px;border:0;border-radius:999px;background:transparent;font:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:#3C3C43;font-weight:400;transition:color .3s ease}.wf-seg .segopt:has(>.wf-segn:not([style*="display: none"])){display:grid!important;grid-template-columns:minmax(0,1fr) auto;justify-items:center;align-items:center;column-gap:4px;padding:0 8px!important}.wf-seg .segopt>.wf-segn{justify-self:end;margin-left:0;min-width:0;padding:0;background:transparent!important}' +
  '.wf-seg .segopt[aria-checked=true],.wf-seg .segopt[aria-selected=true]{color:#1C1C1E;font-weight:600}' +   // the switcher of the user preferences, shared by every segmented control in the app
  '*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}input,textarea,select,[contenteditable],[contenteditable] *{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}img,svg{-webkit-user-drag:none}::selection{background:transparent}input::selection,textarea::selection{background:rgba(var(--wf-y-rgb),0.45)}' +   // nothing selects on a long press or drag (map, texts); only text fields do
  '.wf-dot::after{content:"."}html[lang=ja] .wf-dot::after{content:"\u3002"}' +   // full stop at the end of a normal-text or annotation block (outside the translated text)
    /* "Tap me" pulse, shared (to-do cards, the Unconfirmed tag): a steady dark 1.4px outline on the element, and a dark line that grows from it (about 9px) and fades to 0, then rests invisible for a moment before the next one (fading the line's own colour, not the element, so Safari never flashes it black), like the candidate markers on the map. Put <span class="wf-pulse"> inside a position:relative element; --wf-pr sets its corner radius, --wf-pc its colour (dark by default). */
    /* Reset in the card pickers: disabled (faded, not tappable) while the cards are already the defaults */
    '.wf-reset{transition:opacity .25s ease}.wf-reset[aria-disabled="true"]{opacity:.4;pointer-events:none}.wf-rpill.wf-rpill,.wf-rpill.wf-rpill[style]{background:transparent!important;box-shadow:none!important;color:var(--wf-ink,#3A3A3C)!important}' +
    '.wf-pulse{position:absolute;inset:-1.4px;border-radius:var(--wf-pr,17.4px);outline:1.4px solid transparent;outline-offset:-1.4px;pointer-events:none;animation:wfPulse 1.6s linear infinite}@keyframes wfPulse{0%{outline-offset:-1.4px;outline-color:var(--wf-pc,#3A3A3C)}88%{outline-offset:9.3px;outline-color:color-mix(in srgb,var(--wf-pc,#3A3A3C) 0%,transparent)}100%{outline-offset:9.3px;outline-color:transparent}}@media (prefers-reduced-motion: reduce){.wf-pulse{animation:none}}' +
    'html{--wf-panel-r:28px;--wf-panel-sh:0 0 16px rgba(0,0,0,0.16);--wf-safe-b:48px}' +   // shared panel: radius, shadow, 48px clear of the home indicator
    'html .wf-panel{bottom:var(--wf-safe-b)!important;border-radius:0 0 var(--wf-panel-r) var(--wf-panel-r)!important;box-shadow:var(--wf-panel-sh)!important}' +
    // dialogs: a panel that runs to the bottom edge, 24px inside, with its buttons kept 48px clear of the home indicator; no light around it
    'html .wf-dlg{left:8px!important;right:8px!important;bottom:8px!important;padding:30px 24px calc(24px + var(--wf-safe-b))!important;border-radius:48px!important;box-shadow:var(--wf-panel-sh)!important;transition-property:transform,translate!important;transition-duration:.5s,.5s!important}' +
    'html .wf-dlg[aria-hidden="true"]{translate:0 24px!important;box-shadow:none!important}' +
    '.wf-dlg-acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:24px}.wf-dlg-acts.wf-stack{grid-template-columns:1fr}.wf-dlg-acts.wf-stack>*:last-child{order:-1}' +
    // dialogs: 24px around the content, plus 48px clear of the home indicator
    '.seg{transition:left .42s cubic-bezier(.4,0,.2,1) .14s,width .42s cubic-bezier(.4,0,.2,1) .14s!important}' +
    ':root{--wf-pri-bg:#3A3A3C;--wf-pri-fg:#FFFFFF;--wf-sec-bg:#737376;--wf-sec-fg:#FFFFFF;--wf-dis-bg:rgba(115,115,118,0.5);--wf-dis-fg:rgba(255,255,255,0.9);--wf-ter-bg:rgba(var(--wf-y-rgb), 0.12);--wf-ter-fg:#3A3A3C}' +
    ':root .wf-sec,:root .ghost:not(.round){background:var(--wf-sec-bg)!important;color:var(--wf-sec-fg)!important;border-color:transparent!important}' +
    /* Disabled buttons: the secondary formula, faded (grey and its white label both see-through), so nothing disabled looks like a lime action */ ':root .wf-dis,:root .wf-sec:disabled,:root .wf-sec[aria-disabled="true"],:root .wf-pri:disabled,:root .wf-pri[aria-disabled="true"],:root .btn.primary:disabled,:root .btn.primary[aria-disabled="true"],:root .wf-b:disabled,:root button[aria-disabled="true"][style*="background: var(--wf-y)"]{background:var(--wf-dis-bg)!important;color:var(--wf-dis-fg)!important;-webkit-text-fill-color:var(--wf-dis-fg)!important;box-shadow:none!important;opacity:1!important;cursor:default!important;pointer-events:none}' +
    /* Subtle button (.wf-ter, formerly tertiary): full width inside its container with 16px padding all round */ ':root .wf-ter{background:var(--wf-ter-bg)!important;color:var(--wf-ter-fg)!important;-webkit-text-fill-color:var(--wf-ter-fg);text-shadow:none;border-color:transparent!important}' +
    // One button: every text button in the app is 48px tall, 17px semibold, one corner radius; roles are primary, secondary, tertiary
    ':root .btn.wf-ibtn{position:relative;height:auto!important;min-height:64px!important;aspect-ratio:1/1;max-height:120px;box-sizing:border-box;border-radius:24px!important;font-size:13px!important;font-weight:600!important;line-height:18px!important;padding:8px!important;text-decoration:none}' +   /* (Oct 16) icon buttons with a label under the icon (the incident's three decisions): 64px tall at least, label 13px (Oct 16, 08:57: was 15px), icon 28px; (Oct 16, 09:12, trial) square with 24px corners, the icon at the top, the label centred */
    /* (Oct 16, 11:36, trial) the incident's decisions float over the page: no foot strip (no stripe, no surface); the page scrolls under them,
       blurred; each button translucent (its own colour at 72%) with a backdrop blur */
    '[data-wf-actbar][data-wf-float="flex"]{position:absolute!important;left:0;right:0;bottom:var(--wf-actb,32px);z-index:6;padding:0 16px!important;background:transparent!important;pointer-events:none}' +
    '[data-wf-actbar][data-wf-float="flex"]>*{pointer-events:auto}[data-wf-actbar][data-wf-float="flex"]::after,[data-wf-actbar][data-wf-float="flex"]>.wf-stripes{display:none!important}' +
    'section:has(>[data-wf-actbar][data-wf-float="flex"]) [data-wf-page]{padding-bottom:180px!important}' +
    /* (Oct 16, 15:56) no plain strip under the floating decisions: the page (map, then its content) runs to the screen's bottom edge; the decisions keep their 32px from it */ 'section:has(>[data-wf-actbar][data-wf-float="flex"]){padding-bottom:0!important}' +
    /* (Oct 16, 12:41) doubled class so it outranks .btn.primary's box-shadow:none (the Attack button had lost its shadow). (Oct 16, 12:26) no transition at all: they show already drawn, glass and blur included. (Oct 16, 11:47) the decisions wear the app's glass (as the legend chips and cards over the map: frosted, blur 16px, saturate 180%),
       each with its muted tint: Dismiss the neutral glass, (Oct 16, 11:49) all labels white: Dismiss a grey glass, Smoke check a muted orange glass, Initial attack a muted red glass */
    ':root .btn.wf-ibtn.wf-ibtn{transition:none!important;animation:none!important;transform:translateZ(0);-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;box-shadow:0 0 16px rgba(0,0,0,0.16)!important;border:0!important;outline:none!important;background-clip:padding-box}' +
    /* (Oct 16, 11:50) all three white glass with a dark label; the icon carries the decision's colour: Dismiss grey, Smoke check muted orange, Initial attack muted red */
    /* (Oct 17, 05:38; supersedes the dark glass of Oct 16, 21:54) back to white glass in light mode, the label dark grey; the icon keeps the decision's colour, deep enough to read on white */
    ':root .btn.wf-ibtn:not([aria-disabled="true"]){background:rgba(255, 255, 255, 0.62)!important;color:rgb(58, 58, 60)!important;-webkit-text-fill-color:rgb(58, 58, 60)!important}' +
    ':root .btn.wf-ibtn.wf-sec > svg{color:rgb(110, 110, 115)!important}:root .btn.wf-ibtn.wf-ib-chk > svg{color:rgb(201, 110, 34)!important}:root .btn.wf-ibtn.wf-ib-ia > svg{color:rgb(208, 72, 58)!important}' +
    'html.wf-dark .btn.wf-ibtn:not([aria-disabled="true"]){background:rgba(40, 40, 40, 0.62)!important;color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)!important}' +
    'html.wf-dark .btn.wf-ibtn.wf-sec > svg{color:rgb(174, 174, 178)!important}html.wf-dark .btn.wf-ibtn.wf-ib-chk > svg{color:rgb(230, 146, 74)!important}html.wf-dark .btn.wf-ibtn.wf-ib-ia > svg{color:rgb(236, 112, 98)!important}' +
    /* (Oct 16, 11:55) the projection switcher over a map wears the decisions' glass: the white frosted track, dark options; the chosen one stays the dark grey thumb, as glass too */
    /* (Oct 17, 15:23) every switcher (segmented multi-button) is normalised on the incident page's projection switcher: white glass track with the app's drop shadow, the chosen option a dark glass thumb with white text, the others dark */ '.wf-seg{touch-action:pan-y}' +
    /* (Oct 17, 16:51, trial) every multi-button sunk into its glass: an inner shadow instead of the drop shadow */ '.wf-seg.wf-seg{background:rgba(255, 255, 255, 0.62)!important;border:0!important;box-shadow:inset 0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.04)!important;-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important}' +
    /* (Oct 17, 16:52) the decisions 8px from the screen's sides and foot, as the fixed panels */ '.wf-decrow{margin:0 -8px calc(8px - var(--wf-actb, 32px))!important}' + /* (Oct 17, 17:07) the decisions follow the bottom panel's logic: 16px corners, and only the corners on the screen's own round corners take the big 48px (the first square's bottom left, the last square's bottom right) */ ':root .wf-decrow > .btn.wf-ibtn.wf-ibtn{border-radius:16px!important}:root .wf-decrow > .wf-ibtn:not([style*=\"display: none\"]):not(.wf-ibtn:not([style*=\"display: none\"]) ~ .wf-ibtn){border-bottom-left-radius:48px!important}:root .wf-decrow > .wf-ibtn:not([style*=\"display: none\"]):not(:has(~ .wf-ibtn:not([style*=\"display: none\"]))){border-bottom-right-radius:48px!important}' + 'html.wf-dark .wf-seg.wf-seg{box-shadow:inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)!important}' + '.wf-seg>.segthumb>.segblob{background:var(--wf-pri-bg, #3A3A3C)!important;-webkit-backdrop-filter:none;backdrop-filter:none}'   /* (Oct 17, 15:54) the chosen option: the solid dark grey (the primary), never a glass */ +
    '.wf-seg .segopt:is([aria-selected=false],[aria-checked=false]){color:rgb(28, 28, 30)!important;-webkit-text-fill-color:rgb(28, 28, 30)!important}.wf-seg .segopt:is([aria-selected=true],[aria-checked=true]){color:var(--wf-pri-fg, #FFFFFF)!important;-webkit-text-fill-color:var(--wf-pri-fg, #FFFFFF)!important}' +
    'html.wf-dark .wf-seg.wf-seg{background:rgba(40, 40, 40, 0.62)!important}html.wf-dark .wf-seg .segopt:is([aria-selected=false],[aria-checked=false]){color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)!important}' +
    /* (Oct 16, 12:46, trial) the incident header's back and team buttons: white glass, dark grey icon and text, the tooltips' shadow */
    ':root .wf-gbtn.wf-gbtn{background:rgba(255, 255, 255, 0.62)!important;color:rgb(58, 58, 60)!important;-webkit-text-fill-color:rgb(58, 58, 60)!important;-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;box-shadow:0 0 16px rgba(0,0,0,0.16)!important;border:0!important}' +
    'html.wf-dark .wf-gbtn.wf-gbtn{background:rgba(40, 40, 40, 0.62)!important;color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)!important}' +
    /* (Oct 16, 12:55) every confirmation panel wears the incidents list's look: the white glass with the stripe pattern along its top
       (the same band the blades carry), the decisions' panels, the grow-out confirmations and the bottom dialogs alike */
    '.wf-gpanel,.wf-dlg{background:rgba(255, 255, 255, 0.62)!important;-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;isolation:isolate}' +
    '.wf-gpanel::before{content:"";position:absolute;left:0;right:0;top:0;height:96px;z-index:-1;pointer-events:none;border-top-left-radius:inherit;border-top-right-radius:inherit;background:repeating-linear-gradient(-60deg,var(--wf-sp-c,rgba(0,0,0,0.07)) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.25) 65%,#000 100%);mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.25) 65%,#000 100%)}' +
    /* (Oct 17, 13:53) confirmation panels as Spotify's sheets: 8px clear of the screen's sides and foot, every corner rounded 48px, concentric with the phone's own corners */ '.wf-gpanel{border-radius:48px!important}.wf-iapanel.wf-gpanel{left:8px!important;right:8px!important;bottom:8px!important}' +
    'html.wf-dark .wf-gpanel,html.wf-dark .wf-dlg{background:rgba(40, 40, 40, 0.62)!important}' +
    /* (Oct 16, 12:57, app-wide) the mini KPI cards are glass with the tooltips' shadow, as the incident's cards over the map (a press still sets its own shadow) */
    ':root [data-wf-kpicard][data-wf-kpicard]{background:rgba(255, 255, 255, 0.62)!important;-webkit-backdrop-filter:blur(16px) saturate(180%)!important;backdrop-filter:blur(16px) saturate(180%)!important;box-shadow:0 0 16px rgba(0,0,0,0.16)}html.wf-dark [data-wf-kpicard][data-wf-kpicard]{background:rgba(40, 40, 40, 0.62)!important}'   /* (Oct 16, 13:02) doubled so the palette's white mapping can't win */ +
    '[data-wf-band] [data-wf-maproot]{transition:clip-path .5s cubic-bezier(.2,.8,.2,1)!important}' +   /* (Oct 16, 20:10) the quiet map's dim and blur come from a veil over it (backdrop): a filter on the map itself blurred its edges into a white halo round the screen */   /* (Oct 16, 13:55) the quiet map also dims 10% and loses 10% saturation */   /* (Oct 16, 15:38) a smooth change, never 0-1: the map root's inline transition (clip-path) had overridden the filter's; both kept here, the filter from the same function list so Safari interpolates it */
    '[data-wf-ovl]{transition:opacity .7s cubic-bezier(.4,0,.2,1)}.wf-mapquiet [data-wf-ovl]{opacity:0.001!important;pointer-events:none!important}' +   /* (Oct 16, 13:08) a quiet map: only the base map shows; (13:20) faded to 0.001, never 0: Safari stops painting a layer at 0 and the markers and projection redrawn meanwhile never came back */
    ':is(button,a,[role=button]):is([style*="border-radius: 50%"],[data-round]):active{opacity:1!important;transform:scale(.94);transition:transform .12s ease}' +   /* (Oct 16, 13:11) a pressed round button keeps its round shape: no opacity change (Safari drew the blurred backdrop square while fading) */
    /* (Oct 17, 09:35, trial) the decisions' surface: the main screen's incidents blade (white glass, blur 16px, saturate 180%, 24px corners, its soft
       shadow, the stripe pattern along its top), 16px from the screen's sides and foot; the three decisions are tiles inside it (the neutral fill, 16px
       corners, no glass or shadow of their own) */
    '.wf-decsurf{position:relative;isolation:isolate;box-sizing:border-box;padding:16px;align-items:center;justify-content:center;margin:0 -8px calc(8px - var(--wf-actb, 32px));border-radius:48px;overflow:hidden;background:rgba(255, 255, 255, 0.62);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);box-shadow:0 0 16px rgba(0,0,0,0.16)}html.wf-dark .wf-decsurf{background:rgba(40, 40, 40, 0.62)}' +
    /* (Oct 17, 12:21) the tiles keep the decisions' own white glass and drop shadow inside the surface; only their corners follow it (16px) */ ':root .wf-decsurf .btn.wf-ibtn.wf-ibtn{border-radius:24px!important;aspect-ratio:auto!important;height:64px!important;min-height:56px!important;max-height:none!important;gap:4px!important;padding:8px!important}:root .wf-decsurf .btn.wf-ibtn>svg{width:28px;height:28px;flex-shrink:0}'   /* (Oct 17, 15:54) the three decisions smaller: 64px tall (never under 56px, the touch minimum), equal widths, 24px corners, the 28px icon over its one-line label */ +
    '.wf-dec-hide .wf-ibtn:not(.wf-ib-src){opacity:0!important;pointer-events:none!important}' +
    /* (Oct 17, 14:34) the surface hands its glass to the confirmation panel growing out of it (one layer of glass) */ '.wf-surf-src .wf-decsurf{background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.wf-surf-src .wf-decsurf>.wf-spx{opacity:0}' +
    /* (Oct 16, 22:11) the button a panel grows out of hands its glass to the panel in the same frame (one layer of glass, never two), and only its icon and label fade; folding back, the glass comes back in the frame the panel goes and the icon and label fade in */
    ':root .btn.wf-ibtn.wf-ib-src:not([aria-disabled="true"]),html.wf-dark .btn.wf-ibtn.wf-ib-src:not([aria-disabled="true"]){background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;pointer-events:none!important}.wf-ibtn>*{transition:opacity .2s ease}.wf-ibtn.wf-ib-src>*{opacity:0!important}' +
    /* no press dimming on the decision buttons (Oct 16, 22:11) */
    '.wf-ibtn:active,.btn.wf-ibtn:active{opacity:1!important}.wf-ibtn{-webkit-tap-highlight-color:transparent}' +
    /* (Oct 16, 22:35) a decision already taken: its button stays, disabled (fainter glass, icon and label at 40%, not clickable), with a green check top right */
    ':root .btn.wf-ibtn[aria-disabled="true"]{background:rgba(255, 255, 255, 0.42)!important;color:rgb(58, 58, 60)!important;-webkit-text-fill-color:rgb(58, 58, 60)!important;pointer-events:none!important;opacity:1!important}html.wf-dark .btn.wf-ibtn[aria-disabled="true"]{background:rgba(44, 44, 46, 0.42)!important;color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)!important}:root .btn.wf-ibtn[aria-disabled="true"]>:not(.wf-okb){opacity:.4!important}:root .btn.wf-ibtn>span.wf-okb{left:auto!important;right:8px!important;bottom:auto!important;top:8px!important;overflow:visible!important}' +
    /* (Oct 16, 21:59, app-wide) no sideways scroll anywhere: a vertical scroller never scrolls (or rubber-bands) sideways, nor does the page */
    'html,body{overflow-x:hidden;overscroll-behavior-x:none}[style*="overflow-y: auto"]:not([style*="overflow-x"]),[style*="overflow-y: scroll"]:not([style*="overflow-x"]),.wf-snap{overflow-x:hidden!important;overscroll-behavior-x:none}' +
    '.wf-dec-fade .wf-ibtn{transition:opacity .25s ease!important}' +   /* (Oct 16, 21:18) opening a decision panel: its buttons fade out as it grows (never a sudden vanish) */   /* (Oct 16, 13:58) hidden while a decision panel is open or folding */
    /* (Oct 17, 16:27) the icon at the square's exact centre */ ':root .btn.wf-ibtn > svg{stroke-width:1.5px!important;position:absolute!important;top:calc(50% - 16px)!important;left:50%!important;width:42px!important;height:42px!important;margin:0!important;transform:translate(-50%,-50%)!important}' +   /* (Oct 16, 11:35) the icon centred in the space above the label (the label's 18px line and its 16px padding off the foot), so it reads centred with the label under it; 42px */
    /* (Oct 17, 16:32; 16:38 +4px) icon 8px above the centre, clear of the label; label semibold */ ':root .btn.wf-ibtn > span{font-weight:600!important;position:absolute;left:16px;right:16px;bottom:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}' +   /* (Oct 17, 16:45) the label wears a dark grey pill (the primary button's own colours), centred on the foot; the icon 16px above the centre */ ':root .btn.wf-ibtn > span:not(.wf-okb){left:50%;right:auto;transform:translateX(-50%);max-width:calc(100% - 16px);box-sizing:border-box;padding:4px 12px;border-radius:999px;background:var(--wf-pri-bg);color:var(--wf-pri-fg)!important;-webkit-text-fill-color:var(--wf-pri-fg)!important}' +   /* the label on the foot, 16px padding all round, one line */
    ':root .btn:not(.round):not(.wf-cmp):not(.wf-ibtn),:root .wf-b{height:48px!important;min-height:48px;box-sizing:border-box;border-radius:999px!important;font-size:18px!important;font-weight:600!important;line-height:24px!important;padding-top:0!important;padding-bottom:0!important;text-decoration:none}' +
    // Tooltip panels: a text button next to the round chat button takes the chat button's height (44px)
    ':root .wf-b.wf-h44{height:44px!important;min-height:44px!important}' +
    // Title XS (compact surfaces such as map tooltips): the condensed button's font, 16px semibold
    '.wf-title-xs{font-size:16px!important;font-weight:600!important;line-height:20px!important;color:#000000}' +
    // Condensed buttons (compact surfaces such as map tooltips): 32px tall, 16px semibold, same pill and roles
    ':root .wf-b.wf-cond{height:32px!important;min-height:32px!important;font-size:16px!important;line-height:20px!important;padding:0 16px!important}' +
    /* (Oct 9, 10:50) the selected option of every segmented control (multi-button) wears the primary button: dark grey, white label (light grey, dark label at night); its count circle is its label colour at 22% */ /* (Oct 9, 09:05) primary text buttons: dark grey with a white label, whatever the palette (light grey with a dark label in the dark theme) */ ':root .wf-pri,:root .btn.primary,:root .primary,:root .primary.green{background:var(--wf-pri-bg)!important;color:var(--wf-pri-fg)!important;-webkit-text-fill-color:var(--wf-pri-fg);border-color:transparent!important;box-shadow:none!important;animation:none!important}' +
    ':root .wf-danger{background:rgba(255,59,48,0.09)!important;color:#B0001A!important;border-color:transparent!important}' +
    ':root .wf-thumb{background:#FFFFFF!important}' +
    // A likelihood KPI: very big, dark grey (fixed size, whatever the text-size setting)
    // Big KPI numbers across the app (forces, resolution summary, profiles): dark grey, one size
    // Rows of 2 or 3 KPIs go as big as their numbers allow: each row sets --k from window.__wfKpiPx (below)
    '[data-wf-kpicard]{padding:8px!important}' + '.wf-note.wf-simhid{display:none!important}.wf-simstar{position:absolute;bottom:var(--wf-simstar-b,4px);right:var(--wf-simstar-r,8px);z-index:2;font-size:18px;line-height:24px;font-weight:600;color:#C7C7CC!important;pointer-events:none}.wf-dark .wf-simstar{color:#636366!important}.wf-note.wf-simfoot{display:block!important;align-self:flex-end;flex-shrink:0;margin-left:16px;margin-right:40px;font-size:14px;line-height:18px;color:#6E6E73;text-align:right;writing-mode:horizontal-tb;transform:none}' + '.wf-big{color:#3A3A3C!important;font-size:var(--k,44px)!important;line-height:1.05!important;font-weight:700!important;letter-spacing:-.03em}' +
    // Qualifier band (what an item is: ignition detection, active fire, fire station): not a button. Full width, square
    // corners, the map marker's colour, the marker itself before the label. One definition for the whole app.
    /* Status tags in lists: one width for every tag, set by the longest expected label (e.g. Building line), text centred; a longer translation still grows it */
    '.wf-stag{min-width:132px;justify-content:center;text-align:center}' +
    '.wf-qual{display:flex;align-items:center;gap:8px;min-height:36px;padding:0 16px;border-radius:0;background:rgba(118,118,128,0.12);color:#1C1C1E;font-size:18px;line-height:24px;font-weight:600;white-space:nowrap;overflow:hidden;box-sizing:border-box}' +
    '.wf-qual svg{flex-shrink:0;scale:1.2}' +
    '.wf-qual.hd{overflow:visible!important;position:relative;z-index:8;min-height:56px;padding:0 8px 0 16px!important;border-radius:16px!important;transition:padding-left .35s cubic-bezier(.2,.8,.2,1)}.wf-qual.hd.open{padding-left:8px!important}.wf-qual.hd [role=status]:not(.wf-hst),.wf-qual.hd .qtag,.wf-hst-fs .qtag{min-height:40px!important;padding:8px 16px!important;border-radius:8px!important;box-sizing:border-box}:root{--wf-band-solid:#E3E3E8}' +
    /* (Oct 8) every tag fits its container: never wider than the space it sits in; a label too long for it ends in an ellipsis rather than spilling out */
    '.qtag,.wf-ctag,.wf-stag,.wf-hst-fs .wf-hst{max-width:100%;min-width:0}.wf-ctag,.wf-stag{overflow:hidden;text-overflow:ellipsis}.qtag>span{min-width:0;overflow:hidden;text-overflow:ellipsis}' +   /* detail headers: the kind band as tall as the segmented control (52px), its tag as tall as the control's thumb */
    // On a card the band is the top row, edge to edge, with the round X at its end
    /* (Oct 5, 10:08) a header with only its stage tag (the fire page, the candidate page): no band, no dot, no kind */
    '.wf-qual.hd.solo,html .wf-qual.hd.solo{background:transparent!important;padding:0!important;min-height:0!important;border-radius:0!important}.wf-qual.solo>svg:first-child,.wf-qual.solo>span:first-of-type{display:none!important}.wf-qual.solo .wf-hst{margin-left:0!important}' +
    '.wf-qual.top{min-height:56px;padding:8px 8px 8px 16px;border-radius:14px 14px 0 0}.wf-qual.top>span{flex-grow:1;min-width:0;overflow:hidden;text-overflow:ellipsis}' +
    '.wf-like{color:#3A3A3C!important;font-size:150px!important;line-height:.9!important;font-weight:700!important;letter-spacing:-.03em}' +
    // The XS version of the likelihood KPI (map tooltip panels): same look, sized to lead the card without growing it
    '.wf-like-xs{color:#3A3A3C!important;font-size:min(var(--wf-fs,45px),45px)!important;line-height:1!important;font-weight:700!important;letter-spacing:-.03em;font-variant-numeric:tabular-nums}' +
    // The glass overlay behind panels, one definition for the whole app: a slightly dark frosted layer, so the panel's edge
    // reads clearly against what is underneath. Change it here and every overlay changes.
    ':root{--wf-glass-bg:rgba(28,28,30,0.42);--wf-glass-blur:blur(10px) saturate(120%)}' +
    // A page moved out of the way (pointer-events none, e.g. under a full-screen map) takes no taps anywhere inside it: the map's
    // moving layers re-enable taps for their markers, which otherwise blocked the full-screen map's buttons above them
    '.wf-page[style*="pointer-events: none"] *{pointer-events:none!important}' +
    '.wf-glass{background:var(--wf-glass-bg)!important;-webkit-backdrop-filter:var(--wf-glass-blur)!important;backdrop-filter:var(--wf-glass-blur)!important}' +
    // Grabbers (the grey line that opens and closes blades), one rule for the whole app: the line sits 8px from the blade's edge
    // and keeps 40px clear between it and the blade's content. gb = line at the bottom (top blades), gt = line at the top (bottom blades).
    '.wf-grab{box-sizing:border-box!important;height:53px!important;flex-shrink:0}' +
    '[style*="width: 86px; height: 3px"]{opacity:0!important}#wf-tour .tb::before{opacity:0!important}' +   /* (Oct 4) grabbers hidden everywhere; the blades keep their swipe, drag and tap behaviours */
    '.wf-stripes{background:repeating-linear-gradient(-45deg,var(--wf-y,#E5FF00) 0 16.97px,transparent 16.97px 33.94px);opacity:.4}' +   /* the firefighter stripes, shared by every page */
    'html.wf-embed [data-wf-ttl2]{grid-row:1!important;grid-column:1 / 3!important}' +   /* (Oct 9, 12:11) in a blade the back is hidden: the title moves up */
    '*:has(> [data-wf-burger]:not(.wf-mb)),*:has(> [data-wf-burger-spot]){margin-right:-8px!important}' +
    'header[data-pull="down"]:has(> [data-wf-burger-spot]){margin-right:0!important}' +   /* (Oct 16, 12:53) the main top blade is a panel now: its menu button stays inside it, 16px from its edge, 8px from the notifications */   /* (Oct 9, 13:29, app-wide) the header buttons row ends 8px from the screen edge: the menu button rests where the menu column's X is, so it never moves; the notifications keep their 16px gap to it */
    '.wf-grab.gb{height:56px!important;padding:0 0 8px!important;align-items:flex-end!important}' +
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
  // Accessibility, shared by every screen (Oct 3, 23:30)
  BTN += 'html,body,a,button,input,select,textarea,label,summary,[role=button],[role=switch],[role=radio],[role=tab]{touch-action:manipulation}' +   // pinch zoom allowed (no user-scalable=no); no accidental double-tap zoom
    ':focus-visible{outline:2px solid #007AFF;outline-offset:2px}' +   // one focus ring for keyboard and switch-control users
    ':root{--wf-mid-grey:#6E6E73;--wf-mid-grey-tint:#636366}' +   // mid grey on white (5.07:1); on grey, tinted or frosted surfaces the darker one (4.5:1 or more)
    '[data-wf-kpicard] [style*="color: #6e6e73" i],[data-wf-kpicard] [style*="color: rgb(110, 110, 115)"],[data-wf-kpicard] .wf-note,.wf-note.wf-note-t{color:var(--wf-mid-grey-tint)!important}' +   // KPI cards can be tinted (grey, orange): their labels, units and notes take the darker grey
    '.wf-tog{box-shadow:inset 0 0 0 1px #8A8A8E!important}' +   /* (Oct 9, 11:08) switches, app-wide: on = the primary's dark grey, off = light grey (night: light on, dark off) */ '.wf-tog[aria-checked=true],[aria-checked=true][style*="width: 64px; height: 25px"],[aria-checked=true] [style*="width: 64px; height: 25px"]{background:var(--wf-pri-bg)!important}.wf-tog[aria-checked=false],[aria-checked=false][style*="width: 64px; height: 25px"],[aria-checked=false] [style*="width: 64px; height: 25px"]{background:#E5E5EA!important}html.wf-dark .wf-tog[aria-checked=false],html.wf-dark [aria-checked=false][style*="width: 64px; height: 25px"],html.wf-dark [aria-checked=false] [style*="width: 64px; height: 25px"]{background:#48484A!important}' +   // switch tracks, on and off, keep a 3:1 edge
    '.wf-langthumb{box-shadow:none;background:var(--wf-pri-bg,#3A3A3C)!important}.wf-tabs>.tabbar{box-shadow:inset 0 0 0 1px #3A3A3C}' +   // the selected option is marked by more than the lime
    '@media (prefers-reduced-motion: reduce){*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}.wf-credit>span{animation:none!important}.wf-credit>span:first-child{opacity:1}}';

  // ---- Spacing (Oct 3, 18:10): condensed, comfortable (as designed) or spacious ----
  // Every inline padding, margin and gap of 16px or more moves one step along the app's spacing scale: down for condensed,
  // up for spacious (16 <-> 8/24, 24 <-> 16/32, ... 56 <-> 48/64). The close spaces (4 and 8px, which tie related things
  // together) never change, so groups stay groups. Values off the scale are left alone. Kept up as screens re-render.
  var SPL = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80], spDir = 0, spRec = new WeakMap(), spEls = new Set(), spObs = null;
  var SPP = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'row-gap', 'column-gap'];
  function spMap(n) { var a = Math.abs(n), i = SPL.indexOf(a); if (a < 16 || i < 0) return n; var j = i + spDir; if (j < 0 || j >= SPL.length) return n; return (n < 0 ? -1 : 1) * SPL[j]; }
  function spVal(v) { return v.replace(/(-?\d+(?:\.\d+)?)px/g, function (m, n) { return spMap(+n) + 'px'; }); }
  // per element and property: the value as designed (o) and the value written here (w); a property the screen rewrites is
  // taken as its new design value, so nothing is ever shifted twice
  function spEl(el) {
    var st = el.style; if (!st || !el.getAttribute('style')) return; if (el.closest && el.closest('[data-wf-nospace]')) return; if (el.hasAttribute && el.hasAttribute('data-wf-keepsp')) return;   // this element's own spacing kept as designed (Oct 3, 21:27: the menu section's 16px)   // kept as designed (the menu's icon column: always 16px apart)
    var r = spRec.get(el);
    for (var i = 0; i < SPP.length; i++) { var p = SPP[i], v = st.getPropertyValue(p); if (!v) continue;
      if (r && r[p] && r[p].w === v) continue;
      var nv = spDir ? spVal(v) : v;
      if (nv !== v) { if (!r) { r = {}; spRec.set(el, r); spEls.add(el); } r[p] = { o: v, w: nv }; st.setProperty(p, nv, st.getPropertyPriority(p)); }
      else if (r && r[p]) delete r[p]; }
  }
  function spAll(root) { if (!root || !root.querySelectorAll) return; if (root.hasAttribute && root.hasAttribute('style')) spEl(root); root.querySelectorAll('[style]').forEach(spEl); }
  function spApply(mode) {
    var d = mode === 'condensed' ? -1 : mode === 'spacious' ? 1 : 0; if (d === spDir) return;
    spEls.forEach(function (el) { var r = spRec.get(el); if (!r) return; for (var p in r) if (el.style.getPropertyValue(p) === r[p].w) el.style.setProperty(p, r[p].o); spRec.delete(el); });   // back to the design
    spEls.clear(); spDir = d; if (!d) return;
    spAll(document.documentElement);
    if (!spObs && window.MutationObserver) { spObs = new MutationObserver(function (L) { if (!spDir) return; for (var i = 0; i < L.length; i++) { var r = L[i]; if (r.type === 'attributes') spEl(r.target); else for (var k = 0; k < r.addedNodes.length; k++) if (r.addedNodes[k].nodeType === 1) spAll(r.addedNodes[k]); } });
      var go = function () { spObs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] }); spAll(document.documentElement); };
      if (document.body) go(); else document.addEventListener('DOMContentLoaded', go); }
  }
  // ---- Palettes (Oct 4, 22:58): variations of the light theme, kept on this phone (localStorage wf-palette) ----
  // Each palette is three surfaces (page, surface, fill) and three inks (text, strong grey, secondary grey), all checked
  // for contrast (secondary text 4.5:1 or more on every surface). Markers, fire colours, photos and maps are untouched,
  // and every primary colour works on every palette because labels on the primary stay dark.
  /* (Oct 16, 12:36) every screen and blade background is white: each palette's page is its own surface (Snow pure white) */
  var PALS = {
    snow: { name: ['Snow', 'Neve'], page: '#FFFFFF', surface: '#FFFFFF', fill: '#E5E5EA', ink: '#000000', ink2: '#3A3A3C', sec: '#6E6E73' },
    moonstone: { name: ['Moonstone', 'Pedra da lua'], page: '#FBFCFE', surface: '#FBFCFE', fill: '#DEE2EC', ink: '#171A22', ink2: '#343A48', sec: '#5B6273' },
    bone: { name: ['Bone', 'Osso'], page: '#FDFBF7', surface: '#FDFBF7', fill: '#E6E1D7', ink: '#1B1915', ink2: '#3A3630', sec: '#67615A' },
    cork: { name: ['Cork oak', 'Sobreiro'], page: '#F6EEE1', surface: '#F6EEE1', fill: '#D9C6AA', ink: '#000000', ink2: '#2E2418', sec: '#5A4A36' },
    lichen: { name: ['Lichen', 'Líquen'], page: '#F4F8F1', surface: '#F4F8F1', fill: '#D1DDC9', ink: '#0F170D', ink2: '#283423', sec: '#4C5A46' },
    glacier: { name: ['Glacier', 'Glaciar'], page: '#F3F8FC', surface: '#F3F8FC', fill: '#CADAE7', ink: '#0B1520', ink2: '#22334A', sec: '#475A6C' }
  };
  function rgbOf(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)].join(','); }
  function palId() { var v = ''; try { v = localStorage.getItem('wf-palette') || ''; } catch (e) {} return PALS[v] ? v : 'snow'; }
  // Palette variables (Oct 5, 19:32), set for every palette (Snow included): screens that draw their own styles use these, so every
  // screen, new or old, follows the palette chosen in the preferences
  function palVars(P) { return ':root{--wf-page:' + P.page + ';--wf-surface:' + P.surface + ';--wf-fill:' + P.fill + ';--wf-ink:' + P.ink + ';--wf-ink2:' + P.ink2 + ';--wf-sec:' + P.sec + ';--wf-track:' + (P === PALS.snow ? 'rgba(118,118,128,0.12)' : 'rgba(' + rgbOf(P.sec) + ',0.14)') + '}'; }
  function palCss(P) {
    var o = [], pg = rgbOf(P.page), sf = rgbOf(P.surface), fl = rgbOf(P.fill), sc = rgbOf(P.sec);
    [['rgb(242, 242, 247)', P.page], ['rgb(255, 255, 255)', P.surface], ['rgb(238, 238, 240)', P.surface], ['rgb(229, 229, 234)', P.fill], ['rgb(227, 227, 232)', P.fill], ['rgb(230, 230, 235)', P.fill], ['rgb(232, 232, 237)', P.fill],
      ['rgba(118, 118, 128, 0.12)', 'rgba(' + sc + ',0.14)'], ['rgba(242, 242, 247, 0.62)', 'rgba(' + pg + ',0.62)'], ['rgba(230, 230, 235, 0.62)', 'rgba(' + fl + ',0.62)']
    ].concat([0.7, 0.72, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.95, 0.97, 0.98].map(function (a) { return ['rgba(255, 255, 255, ' + a + ')', 'rgba(' + sf + ',' + a + ')']; }))
     .concat([0.7, 0.78, 0.8, 0.85, 0.88, 0.9, 0.92, 0.94, 0.96, 0.97, 0.98].map(function (a) { return ['rgba(242, 242, 247, ' + a + ')', 'rgba(' + pg + ',' + a + ')']; }))
     .forEach(function (q) { o.push(col('background', q[0], q[1])); o.push(col('background-color', q[0], q[1])); });
    [['rgb(0, 0, 0)', P.ink], ['rgb(28, 28, 30)', P.ink], ['rgb(44, 44, 46)', P.ink2], ['rgb(58, 58, 60)', P.ink2], ['rgb(60, 60, 67)', P.ink2], ['rgb(72, 72, 74)', P.ink2],
      ['rgb(84, 84, 88)', P.sec], ['rgb(99, 99, 102)', P.sec], ['rgb(108, 108, 112)', P.sec], ['rgb(110, 110, 115)', P.sec]
    ].forEach(function (q) { o.push(col('color', q[0], q[1])); });
    o.push('html,body{background:' + P.page + '!important;color:' + P.ink + '}html::view-transition{background:' + P.page + '}');
    o.push('.tip,.ctip,.igpill,a.card,.stackbtn,html:root .sheet{background:' + P.surface + '!important}.igpill::after{background:' + P.surface + '!important}');
    o.push('.kpi small,.lbl,.sqsearch::placeholder,.pw::placeholder,html:root .wf-note,.wf-tabs .tabopt{color:' + P.sec + '!important}.wf-tabs .tabopt[aria-selected=true],html:root .wf-title-xs,html:root .wf-big,html:root .wf-like,html:root .wf-like-xs{color:' + P.ink + '!important}.wf-tabs::before{background:' + P.fill + '}');
    o.push(':root{--wf-mid-grey:' + P.sec + ';--wf-mid-grey-tint:' + P.sec + ';--wf-ter-fg:' + P.ink2 + '}');
    return o.join('\n');
  }
  /* (Oct 17, 13:53) the dark theme's variables, Spotify's greys: page #121212, surface #181818, fill #282828, white text, #B3B3B3 secondary */
  var DARKP = { page: '#121212', surface: '#181818', fill: '#282828', ink: '#FFFFFF', ink2: '#E0E0E0', sec: '#B3B3B3' };
  window.__wfPalettes = PALS;
  window.__wfPalette = { get: palId, set: function (k) { try { localStorage.setItem('wf-palette', PALS[k] ? k : 'snow'); } catch (e) {} apply(); try { window.dispatchEvent(new Event('wf-prefs')); } catch (x) {} } };
  // A choice made in the menu (which on most screens is a frame underneath, menu.js) applies to the screen above at once
  try { window.addEventListener('storage', function (e) { if (!e.key || !/^wf-(theme|text|space)-|^wf-(palette|primary)$/.test(e.key)) return; if (e.key === 'wf-primary' && window.__wfSetY) window.__wfSetY(role); apply(); try { window.dispatchEvent(new Event('wf-prefs')); } catch (x) {} }); } catch (e) {}
  // The tour always runs in California, Los Angeles (Oct 3, 19:44): while it runs, every screen treats California as the
  // profile's region, whatever the profile's own region is; when it ends, the profile's own region and choice come back
  window.__wfTourLock = function () { try { return sessionStorage.getItem('wf-tour') ? 'CA' : null; } catch (e) { return null; } };
  function apply() {
    // Dark theme is off for now (Oct 3, 21:13): every screen is light, whatever was chosen before; the dark styles stay for later
    /* (Oct 17, 13:53) the dark theme is on (Spotify's dark greys); text size, spacing and palettes are fixed at their defaults */
    var DARK_ON = true, theme = DARK_ON ? get('theme', 'light') : 'light', size = 'normal';
    try { spApply('comfortable'); } catch (e) {}
    var el = document.getElementById('wf-prefs');
    if (!el) { el = document.createElement('style'); el.id = 'wf-prefs'; (document.head || document.documentElement).appendChild(el); }
    var pal = 'snow', DK = theme === 'dark';
    el.textContent = (DK ? darkCss() : '') + '\nsvg [fill="#E5FF00"],svg [fill="#CCFF00"]{fill:var(--wf-y)}svg [stroke="#E5FF00"],svg [stroke="#CCFF00"]{stroke:var(--wf-y)}\n' + BTN + '\n' + fontCss(size) + '\n' + palVars(DK ? DARKP : PALS[pal]) + (DK ? '' : '\n' + palCss(PALS[pal]));   /* dark: its own variables, no light palette over it */
    var root = document.documentElement;
    root.classList.toggle('wf-dark', theme === 'dark');
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', theme === 'dark' ? '#121212' : PALS[pal].page);
    var sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]'); if (sb) sb.setAttribute('content', 'black-translucent');   /* the map and the blur run under the status bar */
    if (document.body) ensureNightFilter(); else document.addEventListener('DOMContentLoaded', ensureNightFilter);   // both tile filters: night, and the less saturated day map
    // Scroll fades take the new theme's colours at once (measured again now and once colour transitions have settled)
    var refade = function () { if (typeof FSEL === 'undefined' || !FSEL) return; document.querySelectorAll(FSEL).forEach(function (f) { f.__wfCol = null; f.__wfBc = undefined; }); if (window.__wfFade) window.__wfFade(); };
    refade(); setTimeout(refade, 450);
  }

  // Demo profiles are shown in their own service's uniform (illustrated portraits, avatar.js)
  var KITS = { pt: ['anepc', 1], ca: ['calfire', 1], nv: ['nv', 1], amz: ['br', 1], design: ['pt', 0], admin: ['pt', 1], coord: ['calfire', 1], ff: ['calfire', 0], eng: ['calfire', 0], fft: ['calfire', 0], ptco: ['pt', 1], ptce: ['pt', 0], ptbo: ['pt', 0], ecc: ['calfire', 0], ptecc: ['anepc', 0] };
  function uniform(r, name) { var k = KITS[r]; return k && window.__wfAvatar ? window.__wfAvatar(name, k[0], !!k[1]) : ''; }
  var rid = (function () { var c = ''; try { c = localStorage.getItem('wf-custom') || ''; } catch (e) {} return /^(coord|ff|eng|fft|ptco|ptce|ptbo|ecc|ptecc)$/.test(c) ? c : role; })();   /* a role profile shows as itself */
  var RANK = /^(coord|ptco)$/.test(rid) ? 'coord' : /^(ff|eng|fft|ptce|ptbo)$/.test(rid) ? 'ff' : (role === 'admin' || role === 'design') ? 'admin' : role ? 'coord' : '';   /* (Oct 6) administrator, team coordinator or firefighter */
  var who = PEOPLE[rid] || PEOPLE[role] || (role === 'design' ? PEOPLE.admin : null);   // a removed demo profile falls back to the administrator
  // A profile created on this phone (login screen, New profile) signs in with its area's role and shows as itself
  var cu = null; try { var cid = localStorage.getItem('wf-custom'); if (cid) cu = (JSON.parse(localStorage.getItem('wf-custom-profiles') || '[]') || []).find(function (x) { return x && x.id === cid && x.base === role; }) || null; } catch (e) {}
  var sumOf = function (r) { var e = null; try { e = (JSON.parse(localStorage.getItem('wf-profile-edits') || '{}') || {})[r]; } catch (x) {} return e && e.sum != null ? e.sum : (SUMS[r] || ''); };   /* an edit made on the login card wins */
  window.__wfPrefs = {
    role: role,
    person: cu ? { id: role, code: cu.code, name: cu.name, title: cu.title || '', org: cu.org || '', access: 'All features. ' + (who ? who[4] : 'All regions'), photo: cu.photo || '', lang: who ? who[6] : 'en', custom: true, sum: cu.sum || '', demo: false } : who ? { id: rid, code: who[0], name: who[1], title: who[2], org: who[3], access: 'All features. ' + who[4], photo: uniform(rid, who[1]) || who[5], lang: who[6], sum: sumOf(role === 'design' ? 'admin' : rid), demo: true } : null,
    rank: RANK,
    get: function (k) { return k === 'theme' ? get('theme', 'light') : k === 'text' ? get('text', 'normal') : get(k, ''); },
    set: function (k, v) {
      // Applied at once, like the language: no animation on the text size (the switcher's yellow has already landed)
      try { localStorage.setItem(key(k), v); } catch (e) {} apply(); try { window.dispatchEvent(new Event('wf-prefs')); } catch (e) {} }
  };

  // ---- Switchers (segmented multi-buttons): one shared motion for every one in the app ----
  // On a new choice the yellow first grows 6px above and below, then glides to the option, and snaps back to its height
  // on arrival. Any thumb with class .seg or .segthumb gets it (for .segthumb the yellow is its .segblob child).
  var SEG = { grow: 4, lead: 98, total: 434 }   /* (Oct 16, 22:15) the moving thumb swells 4px above and below at most (was 6) */;   /* (Oct 10, 22:15) 30% faster (was 140 / 620 ms) */
  window.__wfSeg = SEG;
  // Header actions on incident screens (chat, notifications, profile), the same three round buttons as the main screen.
  // Notifications and the profile open the main screen's panels; closing the panel comes straight back here.
  window.__wfHdrAct = function () {
    var P = window.__wfPrefs || {}, me = P.person || { code: 'NR', photo: '' }, n = 0;
    try { n = parseInt(sessionStorage.getItem('wf-nt-unread') || '0', 10) || 0; } catch (e) {}
    var go = function (k) { return function () { try { sessionStorage.setItem(k, '1'); sessionStorage.setItem('wf-panel-return', location.href); } catch (e) {} try { location.href = 'Main.dc.html'; } catch (e) {} }; };
    return { code: me.code || '', photoBg: me.photo ? 'url("' + me.photo + '")' : 'none', ntN: n > 20 ? '20+' : String(n), ntD: n ? 'block' : 'none',
      ntAria: n ? 'Notifications, ' + n + ' unread' : 'Notifications', openNt: go('wf-nt-open'), openPf: go('wf-prefs-open'),
      // screens that are not an incident (a station, the drone): the chat opens the list of incident chats, as on the main screen
      ch: (function () { var C = window.__wfChat, u = 0; try { u = C && C.totalUnread ? C.totalUnread() : 0; } catch (e) {}
        return { badgeD: u ? 'block' : 'none', n: C && C.badge ? C.badge(u) : String(u), aria: u ? 'Assignments, ' + u + ' unread' : 'Assignments', open: function (e) { if (e && e.preventDefault) e.preventDefault(); go('wf-ch-open')(); } }; })() };   /* the chats blade on the main screen, as the notifications and the profile */
  };
  function segGrow(th) {
    var el = th.querySelector('.segblob') || th, h = el.offsetHeight, t = el.offsetTop, g = SEG.grow, k = SEG.lead / SEG.total, e = 1 - 42 / SEG.total;
    if (!h || !el.animate) return;
    try { if (el.__wfSegA) el.__wfSegA.cancel(); } catch (x) {}
    el.__wfSegA = el.animate([
      { top: t + 'px', height: h + 'px', easing: 'cubic-bezier(.2,.8,.2,1)' },
      { top: (t - g) + 'px', height: (h + 2 * g) + 'px', offset: k },
      { top: (t - g) + 'px', height: (h + 2 * g) + 'px', offset: e, easing: 'ease-out' },
      { top: t + 'px', height: h + 'px' }
    ], { duration: SEG.total });
  }
  function segPos(th) { return th.style.left + '|' + th.style.transform; }
  function segWatch(root) {
    var list = root.querySelectorAll ? root.querySelectorAll('.seg,.segthumb') : [];
    for (var i = 0; i < list.length; i++) if (list[i].__wfSegP === undefined) list[i].__wfSegP = segPos(list[i]);
  }
  if (window.MutationObserver) {
    var segMo = new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        var n = m.target;
        if (m.type === 'attributes' && n.classList && (n.classList.contains('seg') || n.classList.contains('segthumb'))) {
          var p = segPos(n); if (n.__wfSegP !== undefined && p !== n.__wfSegP && n.isConnected && !n.__wfSegQuiet) segGrow(n);   /* a dragged thumb is already grown: it only shrinks on landing */ n.__wfSegP = p;
        } else if (m.type === 'childList') { m.addedNodes.forEach(function (a) { if (a.nodeType === 1) { segWatch(a); if (a.classList && (a.classList.contains('seg') || a.classList.contains('segthumb'))) a.__wfSegP = segPos(a); } }); }
      });
    });
    var segGo = function () { segWatch(document); segMo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'], subtree: true, childList: true }); };
    if (document.body) segGo(); else document.addEventListener('DOMContentLoaded', segGo);
  }
  // Scrolling panels: while there is more below, the content's last 77px fade out into the panel (a hint that it scrolls);
  // at the very end the fade goes away. One rule for every scrolling list or panel in the app.
  var FSEL = '[style*="overflow-y: auto"],[style*="overflow-y: scroll"],[style*="overflow: auto"],.wf-snap,[data-wf-fadetop]';
  // The fade is laid over the content in the colour of what it sits on (e.g. a white card), so the text fades out
  // while the card and the panel keep crisp edges. 48px + 60% = 77px tall.
  var FH = 54;   // 85px less 20%, then less 20% again
  // One colour per scrolling panel, kept while scrolling: the predominant background of its content (the colour covering
  // the most area among its outermost boxes, e.g. the white cards), else the panel's own colour. Measured once per opening.
  // Only (nearly) opaque colours count: a translucent tint (a touch ripple, a pressed row, a hover) never sets the fade colour.
  // min: the alpha needed (content boxes need a solid colour; the panel itself may be frosted glass, taken without its alpha).
  function alphaOf(c) { var m = /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/.exec(c || ''); return m ? parseFloat(m[1]) : (c && c !== 'transparent' ? 1 : 0); }
  function solid(c, min) { return !!c && c !== 'transparent' && alphaOf(c) >= (min == null ? 0.9 : min); }
  function opaque(c) { return String(c).replace(/^rgba\(([^,]+),([^,]+),([^,)]+),[^)]*\)$/, 'rgb($1,$2,$3)'); }
  function fadeCol(el) {
    var th = document.documentElement.classList.contains('wf-dark');   // a theme change always measures the colour again
    if (el.__wfCol && el.__wfColTh === th) return el.__wfCol;
    el.__wfColTh = th;
    var imgA = 0, area = {}, box = {}, walk = function (n, d) { for (var c = n.firstElementChild; c; c = c.nextElementSibling) {
      if (c.__wfOv) continue; var cs = getComputedStyle(c), bg = cs.backgroundColor;
      if (/wf-rip|ripple/.test(c.className && c.className.baseVal == null ? c.className : '')) continue;
      if (cs.backgroundImage && cs.backgroundImage !== 'none' || /^(IMG|VIDEO|CANVAS)$/.test(c.nodeName)) { var ri = c.getBoundingClientRect(); imgA += ri.width * ri.height; }
      if (solid(bg)) { bg = opaque(bg); var r = c.getBoundingClientRect(), a = r.width * r.height; area[bg] = (area[bg] || 0) + a; var b = box[bg] || (box[bg] = { l: 1e9, r: -1e9 }); b.l = Math.min(b.l, r.left); b.r = Math.max(b.r, r.right); }
      else if (d < 4) walk(c, d + 1); } };
    walk(el, 0);
    var best = null, ba = 0; for (var k in area) if (area[k] > ba) { ba = area[k]; best = k; }
    var q = el, pc = null; while (q && !pc) { var c2 = getComputedStyle(q).backgroundColor; if (solid(c2, 0.5)) pc = opaque(c2); q = q.parentElement; }
    // Mixed content (photo cards, dark cards next to light ones, several card colours): no single colour can be laid over it
    // without painting over something, so the content itself fades out (a mask) and the panel shows through
    var tot = 0, big = 0, er = el.getBoundingClientRect(), ea = Math.max(1, er.width * Math.min(er.height, el.scrollHeight));
    for (var k2 in area) { tot += area[k2]; if (area[k2] > ea * 0.08) big++; }
    var mixed = big > 1 || imgA > ea * 0.08;
    el.__wfCol = best ? { c: best, l: box[best].l, r: box[best].r, mixed: mixed } : { c: pc || 'rgb(242, 242, 247)', l: null, r: null, mixed: mixed };
    return el.__wfCol;
  }
  function shown(el) {
    var r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    var x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
    if (x1 - x0 < 8 || y1 - y0 < 8) return false;
    for (var q = el; q && q.nodeType === 1; q = q.parentElement) { var cs = getComputedStyle(q); if (cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; }
    var pts = [[0.5, 0.5], [0.25, 0.3], [0.75, 0.7]];
    for (var i = 0; i < pts.length; i++) { var h = document.elementFromPoint(x0 + (x1 - x0) * pts[i][0], y0 + (y1 - y0) * pts[i][1]); if (h && (h === el || el.contains(h))) return true; }
    return false;
  }
  // The scroll fade (sfumatto): when a panel has content hidden above or below, the content itself fades out near that
  // edge, so the eye reads "there is more". Nothing hidden on a side, no fade on that side; a panel that doesn't scroll
  // never fades. It is a mask on the scrolling panel, so the panel's own background shows through: the right colour in
  // every theme and on every surface (white cards, grey panels, photos), with nothing laid on top that could go astray.
  // (Oct 11, 12:04) Safari draws a masked scrolling panel at a lower resolution, so the content looked blurred under the fade.
  // When what lies behind the panel is one solid colour, the fade is a gradient of that colour laid over the edge instead
  // (the same look, the content untouched and sharp); only over a map, a photo or glass does the panel keep the mask.
  var CNV = null;
  function rgbOf(c) { try { CNV = CNV || document.createElement('canvas').getContext('2d'); CNV.fillStyle = '#000'; CNV.fillStyle = c; CNV.clearRect(0, 0, 1, 1); CNV.fillRect(0, 0, 1, 1); var d = CNV.getImageData(0, 0, 1, 1).data; return 'rgb(' + d[0] + ', ' + d[1] + ', ' + d[2] + ')'; } catch (e) { return null; } }
  function behindCol(el) {
    for (var q = el; q && q.nodeType === 1; q = q.parentElement) {
      var cs = getComputedStyle(q), bg = cs.backgroundColor;
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && q !== el) return null;
      if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none')) return null;
      var a = bg && bg !== 'transparent' ? (/^color\(/.test(bg) ? (/\/\s*([\d.]+)\)/.exec(bg) ? +/\/\s*([\d.]+)\)/.exec(bg)[1] : 1) : alphaOf(bg)) : 0;
      if (a >= 0.9) return rgbOf(bg);
      if (a > 0.05) return null;
      if (q.nodeName === 'HTML') return null;
    }
    return null;
  }
  function fadeOv(el, side, on, col, hh) {
    var key = side === 'top' ? '__wfFadeTop' : '__wfFadeEl', ov = el[key], par = el.parentElement;
    if (!on || !par || !col) { if (ov) ov.style.opacity = '0'; return; }
    if (!ov) { ov = document.createElement('div'); ov.__wfOv = true; ov.__wfOwn = el; OVS.push(ov); ov.setAttribute('aria-hidden', 'true'); ov.style.cssText = 'position:absolute;pointer-events:none;z-index:2;transition:opacity .2s ease'; el[key] = ov; }
    if (ov.parentElement !== par) { if (getComputedStyle(par).position === 'static') par.style.position = 'relative'; par.appendChild(ov); }
    var r = el.getBoundingClientRect(), pr = par.getBoundingClientRect(), k = pr.width / (par.offsetWidth || pr.width) || 1, cs = getComputedStyle(el);
    var clear = col.replace(/^rgb\(([^)]+)\)$/, 'rgba($1, 0)').replace(/^rgba\(([^,]+),([^,]+),([^,]+),[^)]*\)$/, 'rgba($1,$2,$3, 0)'), topY = Math.floor((r.top - pr.top) / k) + (parseFloat(cs.borderTopWidth) || 0), bot = Math.ceil((r.bottom - pr.top) / k) - (parseFloat(cs.borderBottomWidth) || 0);
    ov.style.left = Math.floor((r.left - pr.left) / k) + 'px'; ov.style.width = Math.ceil(r.width / k) + 'px'; ov.style.height = hh + 'px'; ov.style.top = (side === 'top' ? topY : bot - hh) + 'px';
    ov.style.borderRadius = side === 'top' ? cs.borderTopLeftRadius + ' ' + cs.borderTopRightRadius + ' 0 0' : '0 0 ' + cs.borderBottomRightRadius + ' ' + cs.borderBottomLeftRadius;
    ov.style.background = 'linear-gradient(to ' + (side === 'top' ? 'top' : 'bottom') + ', ' + clear + ' 0, ' + col + ' 100%)'; ov.style.opacity = '1';
  }
  function fadeOne(el) {
    if (el.__wfMaskOwn === undefined) el.__wfMaskOwn = !(el.style.maskImage || el.style.webkitMaskImage);   // leave masks set by a screen alone
    if (!el.__wfMaskOwn) return;
    var cs = getComputedStyle(el), sc = /(auto|scroll)/.test(cs.overflowY) && !!el.offsetParent;
    var more = sc && el.scrollHeight - el.clientHeight - el.scrollTop > 1, less = !!(el.hasAttribute && el.hasAttribute('data-wf-fadeup')) && sc && el.scrollTop > 1;   /* (Oct 12, 21:10) the fade at the bottom only: the top one is gone (the bottom says enough); (Oct 16, 22:27) except where a panel asks for it (data-wf-fadeup): the decision panels' list fades at the top too once scrolled */
    var h = Math.round(Math.min(FH, el.clientHeight * 0.3)), ht = el.classList.contains('wf-snap') ? Math.min(h, 32) : h;   // snapping lists: the top fade fits the 32px band items rest under, never over an item
    var th = document.documentElement.classList.contains('wf-dark') + '|' + (document.documentElement.getAttribute('style') || '').length;
    if ((less || more) && (el.__wfBcTh !== th || el.__wfBc === undefined)) { el.__wfBc = behindCol(el); el.__wfBcTh = th; }
    var col = (less || more) ? el.__wfBc : null;
    /* (Oct 16, 20:28) a panel may name its own fade colour (data-wf-fadecol): the incident page's fade is the cards' drop-shadow tint, not white */
    if (col && el.getAttribute && el.getAttribute('data-wf-fadecol')) col = el.getAttribute('data-wf-fadecol');
    if (col && el.parentElement && el.parentElement.closest('[data-wf-sb="panel"], [data-wf-sb="edge"]')) col = null;   /* (Oct 11, 21:45) over a stripe band: fade the content itself (mask), never paint the surface colour over the band */
    if (col) {
      if (el.__wfM) { el.style.webkitMaskImage = el.style.maskImage = ''; el.__wfM = ''; }
      fadeOv(el, 'top', less, col, ht); fadeOv(el, 'bottom', more, col, h); return;
    }
    fadeOv(el, 'top', false); fadeOv(el, 'bottom', false);
    var g = !(less || more) ? '' : 'linear-gradient(to bottom, ' + (less ? 'transparent 0, #000 ' + ht + 'px' : '#000 0') + ', ' + (more ? '#000 calc(100% - ' + h + 'px), transparent 100%' : '#000 100%') + ')';
    if (g !== el.__wfM) { el.style.webkitMaskImage = el.style.maskImage = g; el.__wfM = g; }
  }
  // Fades whose panel has left the page (a view swapped for another) go with it: no ghost fade over the next view
  var OVS = [];
  function sweep() { OVS = OVS.filter(function (ov) { var el = ov.__wfOwn; if (el && el.isConnected && el.parentElement === ov.parentElement && el.offsetParent) return true;
    if (ov.parentElement) ov.parentElement.removeChild(ov); if (el) { if (el.__wfFadeEl === ov) el.__wfFadeEl = null; if (el.__wfFadeTop === ov) el.__wfFadeTop = null; } return false; }); }
  var fq = false;
  function fadeAll() { if (fq) return; fq = true; requestAnimationFrame(function () { fq = false; sweep(); document.querySelectorAll(FSEL).forEach(fadeOne); }); }
  window.__wfFade = fadeAll;
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.nodeType === 1 && t.matches && t.matches(FSEL)) fadeOne(t); }, true);
  setInterval(function () { var seen = []; OVS.forEach(function (ov) { var el = ov.__wfOwn; if (el && seen.indexOf(el) < 0 && el.isConnected) { seen.push(el); fadeOne(el); } }); }, 250);   // follows panels while they slide (only the panels that have a fade: no page-wide search, maps stay smooth)   // follows panels while they slide
  window.addEventListener('resize', fadeAll);
  if (window.MutationObserver) { var fMo = new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { var n = ms[i].target; if (n && n.nodeType === 1 && ((n.__wfM !== undefined && ms[i].attributeName === 'style') || n.__wfOv)) continue; if (n && n.nodeType === 1 && n.closest && n.closest('[data-wf-maproot]')) continue;   /* a map panning is not a panel moving: no fade work per frame */
      if (ms[i].type === 'childList' && ms[i].addedNodes.length === 1 && ms[i].addedNodes[0].__wfOv) continue; fadeAll(); return; } });
    var fGo = function () { fadeAll(); fMo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'aria-hidden', 'aria-expanded'] }); };
    if (document.body) fGo(); else document.addEventListener('DOMContentLoaded', fGo); }
  setInterval(fadeAll, 1000);   // content that grows by animation (drawers opening) is caught within a second
  /* Round controls: their press (swell + haptic) lives in fit.js, loaded on every screen */
  /* Mini card numbers: shrink the value until value + unit fit inside the card's 8px side padding */
  window.__wfFitKpi = function () { try { fitKpi(); } catch (e) {} };   /* (Oct 16, 22:37) run at once by the KPI reorder, before the moved cards are painted */
  function fitKpi() {
    /* (Oct 5, 02:20; 03:00) One simple rule for every mini card's value: it starts at the Likelihood card's size (32px value,
       15px unit) and, when value + unit don't fit inside the card's 8px padding (clear of a vertical note such as Estimate by
       4px), it shrinks 1px at a time until it does. Below 24px it wraps onto two or more lines instead; only a single word
       still too wide keeps shrinking (to 13px at the least).
       The result lives in one style sheet keyed by a data attribute on each value, not in its inline style: a screen that
       redraws a card (live data) rewrites the inline style, which used to drop the value back to a stray old size. */
    var BASE = 32, WRAP = 24, MIN = 13, ns = document.querySelectorAll('[data-wf-kpicard] .wf-big'), out = [];
    var sh = document.getElementById('wf-kfit'); if (!sh) { sh = document.createElement('style'); sh.id = 'wf-kfit'; (document.head || document.documentElement).appendChild(sh); }
    sh.textContent = '';   // measured afresh, all in this one frame (nothing is painted in between)
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i], row = n.parentElement, card = n.closest('[data-wf-kpicard]');
      if (!row || !card || !card.clientWidth || !(n.textContent || '').trim()) continue;
      if (!n.getAttribute('data-wf-kid')) { n.setAttribute('data-wf-kid', String(++kidN)); row.setAttribute('data-wf-krow', String(kidN)); }
      var id = n.getAttribute('data-wf-kid'); if (row.getAttribute('data-wf-krow') !== id) row.setAttribute('data-wf-krow', id);
      ['font-size', 'white-space', 'text-align'].forEach(function (p) { n.style.removeProperty(p); }); ['max-width', 'justify-content', 'white-space', 'flex-wrap'].forEach(function (p) { row.style.removeProperty(p); });
      row.style.setProperty('white-space', 'nowrap'); row.style.setProperty('flex-wrap', 'nowrap'); n.style.setProperty('white-space', 'nowrap');   // measured on one line
      // everything in screen pixels: z is the page zoom (the card's drawn width over its layout width)
      var cr = card.getBoundingClientRect(), z = cr.width / (card.offsetWidth || cr.width || 1), L = cr.left + 8 * z, R = cr.right - 8 * z, note = card.querySelector('.wf-note');
      if (note && note.offsetWidth && getComputedStyle(note).display !== 'none' && (note.textContent || '').trim()) { var nc = getComputedStyle(note), nw = note.offsetWidth, nh = note.offsetHeight, vert = /vertical/.test(nc.writingMode || nc.webkitWritingMode || ''); var wide = vert ? Math.min(nw, nh) : nw; R = Math.min(R, cr.right - ((parseFloat(nc.right) || 0) + wide + 4) * z); }
      // measured with the elements' own boxes (a text range is placed differently by Safari under the page zoom)
      var parts = function () { return [].slice.call(row.children).filter(function (e) { return e.offsetWidth && getComputedStyle(e).display !== 'none'; }); };
      var fits = function () { var P = parts(), l = Infinity, r = -Infinity; P.forEach(function (e) { var b = e.getBoundingClientRect(); l = Math.min(l, b.left); r = Math.max(r, b.right); }); if (!P.length) return true; return l >= L - 0.5 && r <= R + 0.5; }, k = BASE, wrap = false, mw = 0;
      for (; k >= WRAP; k--) { n.style.setProperty('font-size', k + 'px', 'important'); if (fits()) break; }
      if (k < WRAP) {
        // still too wide at 24px: the value wraps onto two or more lines (centred, inside the padding), and only a word too
        // long for a line on its own keeps shrinking
        wrap = true; var cx = (cr.left + cr.right) / 2; mw = Math.floor(2 * Math.min(R - cx, cx - L) / z);
        n.style.setProperty('white-space', 'normal'); row.style.setProperty('white-space', 'normal'); row.style.setProperty('flex-wrap', 'wrap'); row.style.setProperty('max-width', mw + 'px');
        var wfits = function () { var ok = true; [n, n.nextElementSibling].forEach(function (e) { if (!e || !e.offsetWidth) return; var r = e.getBoundingClientRect(); if (r.left < L - 0.5 || r.right > R + 0.5 || e.scrollWidth > e.clientWidth + 0.5) ok = false; }); return ok; };
        for (k = WRAP; k >= MIN; k--) { n.style.setProperty('font-size', k + 'px', 'important'); if (wfits()) break; }
        k = Math.max(k, MIN);
      }
      ['font-size', 'white-space'].forEach(function (p) { n.style.removeProperty(p); }); ['max-width', 'white-space', 'flex-wrap'].forEach(function (p) { row.style.removeProperty(p); });
      out.push('[data-wf-kpicard] [data-wf-kid="' + id + '"]{font-size:' + k + 'px!important;white-space:' + (wrap ? 'normal;text-align:center' : 'nowrap') + '!important}' +
        '[data-wf-kpicard] [data-wf-krow="' + id + '"]{white-space:' + (wrap ? 'normal' : 'nowrap') + '!important;flex-wrap:' + (wrap ? 'wrap;justify-content:center;max-width:' + mw + 'px' : 'nowrap') + '!important}');
    }
    sh.textContent = out.join('');
  }
  var kidN = 0;
  /* (Oct 5, 03:07) Simulated values, one word and one sign app-wide: no "Estimate" or "Simulation" label next to a value (and
     never written vertically). A widget holding simulated values gets a * in its top right corner; a screen with any of them
     ends with "* Simulation" on the right (40px from the edge), 56px under the last content and 8px from the bottom. Groups marked as a whole
     (a heading's note) mark each of their cards. Done here, on every screen, from the notes the screens already write. */
  var SIMW = /^(estimate|estimated|estimates|simulation|simulated|estimativa|estimado|estimada|estimación|estimacion|simulação|simulado|simulada|simulación|simulacion|estimation|estimé|estimée|simulé|simulée|stima|stimato|simulazione|simulato|schätzung|geschätzt|simuliert|推定|推定値|シミュレーション|估计|模拟)\.?$/i;   /* every language the app shows (Oct 5, 06:51: Spanish was missing) */
  function simCard(el) { var e = el, n = 0; while (e && e !== document.body && n < 8) { if (e.hasAttribute && (e.hasAttribute('data-wf-kpicard') || e.hasAttribute('data-wf-card'))) return e; var cs = getComputedStyle(e); if ((parseFloat(cs.borderTopLeftRadius) || 0) >= 12 && cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && e.offsetWidth < window.innerWidth) return e; e = e.parentElement; n++; } return null; }
  function star(card) { if (!card || card.querySelector(':scope > .wf-simstar')) return; if (getComputedStyle(card).position === 'static') card.style.position = 'relative'; var t = document.createElement('span'); t.className = 'wf-simstar'; t.setAttribute('aria-label', document.documentElement.lang === 'pt' || window.__wfLang === 'pt' ? 'Simulação' : 'Simulation'); t.textContent = '*'; card.appendChild(t); }
  function scroller(el) { var e = el && el.parentElement; while (e && e !== document.body) { var cs = getComputedStyle(e); if (/auto|scroll/.test(cs.overflowY) && !e.closest('[data-wf-maproot]')) return e; e = e.parentElement; } return null; }
  window.__wfSimMark = function () { try { simMark(); } catch (e) {} };   // screens that build their own markup ask for the footnote (statistics)
  /* (Oct 9, 10:41) The * sits snug in the card's bottom-right corner, whatever the card's own padding: its visible ink is the
     same distance from the right edge and from the bottom edge, the smaller of the two gaps it had (the right one). Measured
     from the glyph itself in the font in use, so it holds on every device and text size. */
  var starFix = '';
  function simStarPos() {
    var el = document.querySelector('.wf-simstar'); if (!el) return;
    var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 18, lh = parseFloat(cs.lineHeight) || fs * 24 / 18, key = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily + '|' + lh;
    if (key === starFix) return;
    var c = document.createElement('canvas').getContext('2d'); if (!c) return; c.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var m = c.measureText('*'); if (m.actualBoundingBoxRight == null || m.fontBoundingBoxAscent == null) return;
    var inkR = m.width - m.actualBoundingBoxRight,                                                  // empty space right of the ink, inside the box
        base = (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent,
        inkB = lh - (base + m.actualBoundingBoxDescent),                                            // empty space under the ink, inside the box
        d = Math.min(8 + inkR, 4 + inkB);                                      // the smaller visible gap of the old placement
    var r = document.documentElement.style; r.setProperty('--wf-simstar-r', (d - inkR).toFixed(2) + 'px'); r.setProperty('--wf-simstar-b', (d - inkB).toFixed(2) + 'px');
    starFix = key;
  }
  function simMark() {
    try { simStarPos(); } catch (e) {}
    var N = document.querySelectorAll('.wf-note'), first = null;
    for (var i = 0; i < N.length; i++) { var nt = N[i]; if (nt.classList.contains('wf-simfoot')) continue; var tx = (nt.textContent || '').trim(); if (!SIMW.test(tx)) continue;
      if (!nt.classList.contains('wf-simhid')) nt.classList.add('wf-simhid');
      var vis = nt.offsetParent !== null || getComputedStyle(nt).display !== 'none';
      var card = nt.closest('[data-wf-kpicard]') || simCard(nt.parentElement);
      if (card && !card.contains(nt.closest('section') || document.body)) { star(card); first = first || card; continue; }
      // a heading's note: every card of its group
      var grp = nt.closest('section') || nt.parentElement && nt.parentElement.parentElement; if (!grp) continue;
      var cs2 = grp.querySelectorAll('[data-wf-kpicard]'); for (var j = 0; j < cs2.length; j++) { star(cs2[j]); first = first || cs2[j]; } }
    // the screen's footnote, once per scroller that holds a starred widget
    var S = document.querySelectorAll('.wf-simstar'), seen = [];
    for (var k = 0; k < S.length; k++) { if (!S[k].offsetParent) continue; var sc = scroller(S[k]); if (!sc || seen.indexOf(sc) >= 0) continue; seen.push(sc);
      var f = sc.querySelector(':scope > .wf-simfoot'); if (!f) { f = document.createElement('span'); f.className = 'wf-note wf-simfoot'; f.textContent = ({ pt: '* Simulação', es: '* Simulación', fr: '* Simulation', it: '* Simulazione', de: '* Simulation', ja: '* シミュレーション' })[window.__wfLang] || '* Simulation'; sc.appendChild(f); }
      else if (f !== sc.lastElementChild) sc.appendChild(f);
      sc.setAttribute('data-wf-nopb', '1'); sc.style.setProperty('padding-bottom', '8px', 'important');
      // 56px between the last content and the footnote, whatever gap the screen's own layout adds
      var prev = f.previousElementSibling; while (prev && (!prev.offsetHeight || getComputedStyle(prev).position === 'absolute')) prev = prev.previousElementSibling;
      /* (Oct 11, 15:00) measured without ever zeroing the margin: setting it to 0 for a moment shortened the page, so at the very
         bottom the browser pulled the scroll up and the footnote slipped out of view (the page seemed to scroll up on its own).
         The margin is written only when it really changes. */
      var m0 = parseFloat(f.style.marginTop) || 0, want = m0;
      if (prev) { var z = sc.getBoundingClientRect().width / (sc.offsetWidth || 1) || 1, gap = (f.getBoundingClientRect().top - prev.getBoundingClientRect().bottom) / z - m0; want = Math.round(56 - gap); }
      // (Oct 5, 20:04) short content: the footnote still sits at the bottom of the screen, 8px from the edge
      var room = sc.clientHeight - (sc.scrollHeight - m0 + want); if (room > 0) want += room;
      if (Math.abs(want - m0) >= 1) f.style.marginTop = want + 'px'; }
  }
  /* Touch screens keep :hover on the last tapped element (iOS): no hover fill or glow there, only the tap feedback */
  var HS = window.WeakSet ? new WeakSet() : null, touchOnly = window.matchMedia && matchMedia('(hover: none)').matches;
  function noStickyHover() {
    if (!touchOnly || !HS) return;
    var strip = function (rules) { for (var j = 0; j < rules.length; j++) { var r = rules[j];
      if (r.cssRules && r.media && /hover:\s*hover/.test(r.media.mediaText)) continue;
      if (r.cssRules && !r.selectorText) { strip(r.cssRules); continue; }
      if (r.selectorText && r.selectorText.indexOf(':hover') >= 0 && r.style) ['background', 'background-color', 'background-image', 'box-shadow', 'border-color'].forEach(function (p) { if (r.style.getPropertyValue(p)) r.style.removeProperty(p); }); } };
    for (var i = 0; i < document.styleSheets.length; i++) { var sh = document.styleSheets[i], rl = null; try { rl = sh.cssRules; } catch (e) { continue; } if (!rl || (HS.has(sh) && sh.__wfN === rl.length)) continue; strip(rl); HS.add(sh); sh.__wfN = rl.length; }
  }
  /* Light on purpose: maps change the page on every frame while panning, so only changes to cards or new style sheets
     are acted on, at most every 150 ms (the map itself is never measured) */
  /* (Oct 9, 11:03) Every blade gets its round X back in its top-right corner (44px, 16px from the right), as the notifications
     panel: it closes the blade exactly as its grabber does (tap, swipe or tap outside still work). Added here once for every
     blade, top or bottom, on every screen, so new blades follow. */
  function bladeX() {
    var G = document.querySelectorAll('[role=button][aria-label^="Close"],[role=button][aria-label^="Fechar"],.wf-grab');
    for (var i = 0; i < G.length; i++) { var g = G[i]; if (g.tagName === 'BUTTON' || g.__wfX) continue;
      var box = g.closest('section,[role=dialog]') || g.parentElement; if (!box || box === document.body) continue;
      if (box.querySelector(':scope > .wf-bladex')) { g.__wfX = 1; continue; }
      var own = Array.prototype.some.call(box.querySelectorAll('button[aria-label]'), function (b) { return /^(close|fechar)/i.test(b.getAttribute('aria-label')) && !b.classList.contains('wf-bladex') && b.closest('section,[role=dialog]') === box.closest('section,[role=dialog]'); });
      g.__wfX = 1; if (own) continue;
      if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
      var r = box.getBoundingClientRect(), gr = g.getBoundingClientRect(), topBlade = gr.top > r.top + r.height / 2;
      /* (Oct 11, 20:35) a blade that rises from below has no X: its grabber at the top closes it (tap or swipe down), as the bottom dialogs */
      if (!topBlade && gr.height) continue;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt wf-bladex';
      b.setAttribute('aria-label', document.documentElement.lang === 'pt' || window.__wfLang === 'pt' ? 'Fechar' : 'Close');
      b.style.cssText = 'position:absolute;z-index:20;right:16px;top:' + (topBlade ? 'calc(var(--wf-top, 0px) + 16px)' : '16px') + ';display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:rgba(118,118,128,0.12);color:#3C3C43;cursor:pointer';
      b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="transition:transform .45s cubic-bezier(.3,.9,.25,1)"><path d="M6 6l12 12M18 6 6 18"></path></svg>';
      (function (grab, btn) { btn.addEventListener('click', function (e) { e.stopPropagation(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} var sv = btn.firstChild; if (sv) sv.style.transform = 'rotate(90deg)';
        setTimeout(function () { grab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); setTimeout(function () { if (sv) sv.style.transform = ''; }, 500); }, 200); }); })(g, b);
      box.appendChild(b); }
  }
  /* (Oct 9, 12:00) every blade's X sits vertically centred on the blade's title (its first line) */
  function bladeXAlign() { var B = document.querySelectorAll('.wf-bladex'); for (var i = 0; i < B.length; i++) { var b = B[i], box = b.parentElement; if (!box || !b.offsetParent) continue;
      var h = Array.prototype.find.call(box.querySelectorAll('h1,h2,.wf-title-m'), function (e) { return e.offsetParent && e.offsetWidth > 2 && e.offsetHeight > 2; }); if (!h) continue;   /* (Oct 9, 16:25) the visible title: a visually hidden heading (the incidents list's) would put the X at the blade's edge */ var br = box.getBoundingClientRect(), k = br.height / (box.offsetHeight || br.height) || 1, hr = h.getBoundingClientRect(), lh = parseFloat(getComputedStyle(h).lineHeight) || 32;
      var top = Math.round((hr.top - br.top) / k + lh / 2 - 22); if (Math.abs(top - (parseFloat(b.style.top) || 0)) > 0.5 || /calc/.test(b.style.top)) b.style.top = top + 'px'; } }
  setInterval(function () { try { bladeX(); } catch (e) {} }, 700);
  /* (Oct 11, 20:35) the X follows its title in the same frame: aligned on every frame, so it never lags behind and jumps when a blade
     folds or unfolds */
  (function xLoop() { try { bladeXAlign(); } catch (e) {} requestAnimationFrame(xLoop); })();
  var kT = 0, kMo = null, kGo = function () { if (!kT) kT = setTimeout(function () { kT = 0; noStickyHover(); try { simMark(); } catch (e) {} fitKpi(); if (kMo) kMo.takeRecords(); }, 150); };   /* our own changes are not news */
  var kHit = function (ms) { for (var i = 0; i < ms.length; i++) { var m = ms[i], t = m.target && m.target.nodeType === 1 ? m.target : m.target && m.target.parentElement;
      if (!t) continue; if (t.closest && t.closest('[data-wf-kpicard]')) return true;
      for (var j = 0; j < m.addedNodes.length; j++) { var n = m.addedNodes[j]; if (n.nodeType !== 1) continue; if (n.tagName === 'STYLE' || n.tagName === 'LINK' || (n.querySelector && n.querySelector('[data-wf-kpicard]')) || (n.hasAttribute && n.hasAttribute('data-wf-kpicard'))) return true; } }
    return false; };
  if (window.MutationObserver) { kMo = new MutationObserver(function (ms) { if (kHit(ms)) kGo(); }); var kStart = function () { kMo.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); kGo(); }; if (document.body) kStart(); else document.addEventListener('DOMContentLoaded', kStart); }
  window.addEventListener('resize', kGo); if (document.fonts && document.fonts.ready) document.fonts.ready.then(kGo); setInterval(kGo, 2000);
  apply();
})();
// Card pickers (the + tile's list of a card group), shared by every screen: the cards that are on come first, in the same
// order as on the screen, and can be reordered here with a long press and a drag; the cards that are off follow, A to Z.
(function () {
  var SK = function (g) { return g === 'kpi' ? 'wf-kpi-order' : 'wf-order-' + g; };
  // (Oct 7, 21:52, standing) while a picker is open its rows never move: the order is set when it opens (on first, then off
  // A to Z) and kept until it closes, so a tap never shifts the list under the finger (a switch turned off stays where it is)
  var FROZEN = {};
  window.__wfPickSort = function (g, items, isOn, open) {
    if (!open) { if (g) delete FROZEN[g]; else FROZEN = {}; }   /* closed (or no group open): sorted afresh next time */
    if (open && FROZEN[g]) { var F = FROZEN[g], keys = items.map(function (m) { return m.key; }), kept = F.filter(function (k) { return keys.indexOf(k) >= 0; }), extra = keys.filter(function (k) { return kept.indexOf(k) < 0; });
      if (!extra.length) return kept.map(function (k) { return items.find(function (m) { return m.key === k; }); }); }
    var res = sortNow(g, items, isOn); if (open) FROZEN[g] = res.map(function (m) { return m.key; }); return res; };
  window.__wfPickUnfreeze = function (g) { delete FROZEN[g]; };   // after a reorder by drag, the new order shows at once
  function sortNow(g, items, isOn) {
    var ord = null; try { ord = JSON.parse(localStorage.getItem(SK(g)) || 'null'); } catch (e) {}
    ord = Array.isArray(ord) ? ord : items.map(function (m) { return m.key; });
    var ix = function (k) { var i = ord.indexOf(k); return i < 0 ? 999 + items.findIndex(function (m) { return m.key === k; }) : i; };
    var on = items.filter(function (m) { return isOn(m.key); }).sort(function (a, b) { return ix(a.key) - ix(b.key); });
    var off = items.filter(function (m) { return !isOn(m.key); }).sort(function (a, b) { return String(a.l).localeCompare(String(b.l)); });
    return on.concat(off);
  }
  if (!window.__wfPkTM) { window.__wfPkTM = true; document.addEventListener('touchmove', function (e) { if (window.__wfPkLift) e.preventDefault(); }, { passive: false, capture: true }); }
  window.__wfPickDrag = function (comp, g, key, onKeys) {
    var D = comp.__pkD || null;   /* (Oct 7, 22:00) the press lives on the screen, so a refresh mid-drag never drops it */
    var rows = function (el) { var box = el.parentElement; return Array.prototype.slice.call(box.querySelectorAll('[data-pk-on="true"]')); };
    var clear = function (el) { rows(el).forEach(function (r) { r.style.transform = ''; r.style.transition = ''; r.style.zIndex = ''; r.style.boxShadow = ''; }); };
    return {
      gripV: onKeys.indexOf(key) < 0 ? 'hidden' : 'visible',
      down: function (e) { if (onKeys.indexOf(key) < 0) return; var el = e.currentTarget, k = (el.getBoundingClientRect().height / (el.offsetHeight || 1)) || 1;
        D = comp.__pkD = { el: el, y0: e.clientY, x0: e.clientX, k: k, lifted: false, pid: e.pointerId };
        var gr = !!(e.target && e.target.closest && e.target.closest('[data-pk-grip]'));   /* the handle lifts the row at once, no hold */
        clearTimeout(comp.__pkT); comp.__pkT = setTimeout(function () { if (!D) return; D.lifted = true; window.__wfPkLift = true; var L = rows(el); D.idx = L.indexOf(el); D.to = D.idx; D.h = el.offsetHeight;
          try { el.setPointerCapture(D.pid); } catch (x) {} try { (window.__wfHaptic || function () { if (navigator.vibrate) navigator.vibrate(12); })(); } catch (x) {}
          el.style.zIndex = '3'; el.style.boxShadow = '0 0 16px rgba(0,0,0,0.16)'; el.style.transition = 'box-shadow .2s ease'; }, gr ? 0 : 250); },
      move: function (e) { D = comp.__pkD || null; if (!D) return; var dy = (e.clientY - D.y0) / D.k;
        if (!D.lifted) { if (Math.abs(dy) > 8 || Math.abs(e.clientX - D.x0) > 8) { clearTimeout(comp.__pkT); D = comp.__pkD = null; } return; }
        var L = rows(D.el), n = L.length, to = Math.max(0, Math.min(n - 1, D.idx + Math.round(dy / D.h)));
        D.el.style.transform = 'translateY(' + Math.max(-D.idx * D.h, Math.min((n - 1 - D.idx) * D.h, dy)) + 'px) scale(1.02)';
        if (to !== D.to) { D.to = to; try { if (navigator.vibrate) navigator.vibrate(6); } catch (x) {} }
        L.forEach(function (r, i) { if (r === D.el) return; var s = 0; if (D.idx < D.to && i > D.idx && i <= D.to) s = -D.h; if (D.idx > D.to && i < D.idx && i >= D.to) s = D.h; r.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)'; r.style.transform = s ? 'translateY(' + s + 'px)' : ''; }); },
      up: function () { clearTimeout(comp.__pkT); var d = comp.__pkD || D; D = comp.__pkD = null; if (!d || !d.lifted) return; window.__wfPkLift = false;
        // the click that ends a drag must not flip the switch under the finger
        var stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener('click', stop, true); }; document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 400);
        var keys = onKeys.slice(), from = keys.indexOf(key); keys.splice(from, 1); keys.splice(d.to, 0, key);
        var ord = null; try { ord = JSON.parse(localStorage.getItem(SK(g)) || 'null'); } catch (x) {} ord = Array.isArray(ord) ? ord : [];
        var rest = ord.filter(function (k) { return keys.indexOf(k) < 0; }); try { localStorage.setItem(SK(g), JSON.stringify(keys.concat(rest))); } catch (x) {}
        clear(d.el); delete FROZEN[g]; try { comp.forceUpdate(); } catch (x) {} }
    };
  };
})();

// Closed panels are out of reach (Oct 3, 23:30): every sheet, dialog, dropdown or menu section marked aria-hidden="true"
// is also made inert, so neither a screen reader, the keyboard nor a stray tap can reach what is off screen
(function () {
  var SEL = '[role=dialog],[role=alertdialog],[aria-modal],[data-wf-dd],[data-wf-menusec],.sheet,.wf-dlg,.wf-panel';
  function sync(el) { if (!el.hasAttribute('aria-hidden')) { if (el.__wfInert) { el.inert = false; el.__wfInert = false; } return; } var h = el.getAttribute('aria-hidden') === 'true'; if (el.inert !== h) el.inert = h; el.__wfInert = h; }
  function all() { document.querySelectorAll(SEL).forEach(sync); }
  var q = 0; function later() { if (q) return; q = 1; (window.requestAnimationFrame || setTimeout)(function () { q = 0; all(); }); }
  function go() { if (!window.MutationObserver) return; all();
    new MutationObserver(function (L) { for (var i = 0; i < L.length; i++) { var r = L[i]; if (r.type === 'attributes') { if (r.target.matches && r.target.matches(SEL)) sync(r.target); } else if (r.addedNodes.length) later(); } })
      .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-hidden'] }); }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
/* (Oct 10, 21:42) incident card lines: one topic per line, never cut (they wrap), the values in bold. A line is split into
   regular text and up to three bold values (sizes, durations, distances, drive times: "8 ac", "1 d 5 h", "3.0 km", "~5 min") */
if (!window.__wfSegs) window.__wfSegs = function (t) { t = String(t || ''); var re = /~?\d[\d.,]*\s?(?:ac|ha|km|mi|min|h|d|s|%)(?![a-zA-Z\u00C0-\u017F])(?:\s\d+\s?(?:h|min|s)(?![a-zA-Z]))*/g, o = { a0: '', b0: '', a1: '', b1: '', a2: '', b2: '', a3: '' }, i = 0, last = 0, m;
  while ((m = re.exec(t)) && i < 3) { o['a' + i] = t.slice(last, m.index); o['b' + i] = m[0]; last = m.index + m[0].length; i++; }
  o['a' + i] = t.slice(last); return o; };


/* (Oct 11, 11:37) The Stripe Pattern replaces the thin firefighter strips: the 8px stripe strip at a blade's, sheet's or panel's edge is gone,
   and the blade's header carries the Stripe Pattern instead, as the station header does: diagonal bands (8.5px, equal gaps, 60 degrees) in a
   grey a little darker than the page (3% black), clear over the top 30% of the header and rising (ease-in, t squared) to full at its foot.
   The header is the blade's top down to 16px under its title. */
(function () {
  var MASK = 'linear-gradient(to bottom, transparent 0, transparent 30%, rgba(0,0,0,0.016) 38.75%, rgba(0,0,0,0.0625) 47.5%, rgba(0,0,0,0.14) 56.25%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.39) 73.75%, rgba(0,0,0,0.56) 82.5%, rgba(0,0,0,0.77) 91.25%, #000 100%)';
  var MASKB = MASK.replace('to bottom', 'to top');
  /* (Oct 11, 13:23) the end of a screen's scroll: a shorter clear part (10%), then from 20% rising to full at the foot */
  var MASKE = 'linear-gradient(to bottom, transparent 0, transparent 10%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.85) 85%, #000 100%)';
  var css = document.createElement('style');
  /* (Oct 12, 13:15, app-wide) one stripe pattern: the same colour, opacity and size everywhere (black at 7%, white at 9% in dark; bands
     8.49px at 60 degrees). Normal (-60deg) at the foot of what sits at or comes from the top (screen headers, top blades, panels' feet);
     flipped (60deg) at the top of what sits at or comes from the bottom (sheets, dialogs, the composer and other bars at the foot) */
  var SPN = 'repeating-linear-gradient(-60deg,var(--wf-sp-c) 0 8.49px,transparent 8.49px 16.97px)', SPF = 'repeating-linear-gradient(60deg,var(--wf-sp-c) 0 8.49px,transparent 8.49px 16.97px)';
  css.textContent = ':root{--wf-sp-c:rgba(0,0,0,0.07)}html.wf-dark{--wf-sp-c:rgba(255,255,255,0.09)}' +
    '[data-wf-sp]{background:' + SPN + '!important}[data-wf-sb]::after,[data-wf-se]::after{background:' + SPN + '!important}' +
    '.wf-dlg::before,section[role=dialog][data-swipe="down"]::before,section[role=alertdialog][data-swipe="down"]::before,.wf-spx,.wf-stripes[data-wf-ride],[data-wf-sb="bar"]::after{background:' + SPF + '!important}' +
    '.wf-stripes:not([data-wf-sp]):not([data-wf-ride]){display:none!important}' +
    '.wf-stripes[data-wf-ride]{display:block!important;height:96px!important;z-index:-1!important;opacity:1!important;border-top-left-radius:28px;border-top-right-radius:28px;background:repeating-linear-gradient(-60deg,rgba(0,0,0,0.07) 0 8.49px,transparent 8.49px 16.97px)!important;-webkit-mask-image:' + MASKB + ';mask-image:' + MASKB + '}' +
    'html.wf-dark .wf-stripes[data-wf-ride]{background:repeating-linear-gradient(-60deg,rgba(255,255,255,0.09) 0 8.49px,transparent 8.49px 16.97px)!important}' +
    '.wf-spx{position:absolute;left:0;right:0;top:0;z-index:-1;pointer-events:none;border-top-left-radius:inherit;border-top-right-radius:inherit;background:repeating-linear-gradient(-60deg,rgba(0,0,0,0.07) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:' + MASKB + ';mask-image:' + MASKB + '}' +
    'html.wf-dark .wf-spx{background:repeating-linear-gradient(-60deg,rgba(255,255,255,0.09) 0 8.49px,transparent 8.49px 16.97px)}' +
    /* (Oct 11, 12:59) the same pattern at the foot, mirrored: on every fixed bar under a scrolling panel (the chat's composer, a screen's
       action bar) and at the bottom of every panel; strongest at the band's top, clearing towards the bottom edge */
    /* (Oct 11, 13:28) the foot bands are pseudo-elements of their host (a data attribute marks it): nothing is added to the page, so a
       screen redrawing its content can never remove a band and make it flicker or jump */
    '[data-wf-sb]{isolation:isolate}[data-wf-sb="bar"]{position:relative}' +
    '[data-wf-sb]::after{content:"";position:absolute;left:0;right:0;bottom:0;z-index:-1;pointer-events:none;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit;background:repeating-linear-gradient(-60deg,rgba(0,0,0,0.07) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:' + MASK + ';mask-image:' + MASK + '}' +
    '[data-wf-sb="bar"]::after{top:0}[data-wf-sb="panel"]::after{height:96px}[data-wf-sb="edge"]::after{height:64px;z-index:4}' +
    '[data-wf-se]{isolation:isolate}[data-wf-se]::after{content:"";display:block;flex:none;position:relative;z-index:-1;height:96px;margin-top:var(--wf-se-mt,-96px);margin-bottom:var(--wf-se-mb,0px);pointer-events:none;background:repeating-linear-gradient(-60deg,rgba(0,0,0,0.07) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:' + MASKE + ';mask-image:' + MASKE + '}' +
    'html.wf-dark [data-wf-sb]::after,html.wf-dark [data-wf-se]::after{background:repeating-linear-gradient(-60deg,rgba(255,255,255,0.09) 0 8.49px,transparent 8.49px 16.97px)}' +
  (document.head || document.documentElement).appendChild(css);
  function blade(el) { for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) { if (p.getAttribute('role') === 'dialog' || p.tagName === 'SECTION' || /\b(sheet|blade)\b/.test(p.className || '')) return p; } return null; }
  function run() { try {
    var S = document.querySelectorAll('.wf-stripes:not([data-wf-sp])');
    for (var i = 0; i < S.length; i++) { var b = blade(S[i]); if (!b || b.matches('.wf-dlg, section[role=dialog][data-swipe="down"], section[role=alertdialog][data-swipe="down"]')) continue;   /* dialogs carry the pattern through their own ::before */ var x = b.querySelector(':scope > .wf-spx');
      if (!x) { x = document.createElement('span'); x.className = 'wf-spx'; x.setAttribute('aria-hidden', 'true'); b.insertBefore(x, b.firstChild); }
      /* (Oct 11, 19:50) a blade that rises from below and rides its own top edge (the main screen's bottom blade): the pattern sits on that
         edge and moves with it, as the old strip did; its header is the edge down to the summary, so a fixed 96px band */
      /* (Oct 11, 20:00) open or closed, it stays on the edge: the strip's top is followed whatever it is (0px when the blade is open) */
      /* (Oct 11, 20:30) the riding strip itself carries the pattern: it already moves with the blade's edge in the same frame (same top, same
         transition), so the pattern is part of the blade's surface and never slides on its own */
      var tp = S[i].style.top; if (tp) { x.__ride = true; x.style.display = 'none'; if (!S[i].hasAttribute('data-wf-ride')) S[i].setAttribute('data-wf-ride', '1'); continue; }
      var h = b.querySelector('h1, h2'), bh = b.getBoundingClientRect(); if (!h || !bh.height) continue; var k = b.offsetHeight ? bh.height / b.offsetHeight : 1;
      if (h.offsetHeight <= 1) { if (x.__h !== 96) { x.__h = 96; x.style.height = '96px'; } continue; }   /* a hidden heading (screen readers only): the 96px band */
      var blk = h.parentElement && h.parentElement !== b ? h.parentElement : h, hh = Math.max(56, Math.round((blk.getBoundingClientRect().bottom - bh.top) / k) + 16);
      if (x.__h !== hh) { x.__h = hh; x.style.height = hh + 'px'; } } } catch (e) {} }
  /* foot bands: fixed bars (the element right after a scrolling panel, at the foot of the screen or blade, holding controls) take a band
     their own height; panels (blades, sheets) without such a bar take a 96px band at their bottom */
  function addB(host, hh, edge) { var v = edge ? 'edge' : hh === 96 ? 'panel' : 'bar'; if (host.getAttribute('data-wf-sb') !== v) host.setAttribute('data-wf-sb', v);
    var old = host.querySelector(':scope > .wf-spb'); if (old) old.remove(); }
  function runB() { try {
    var H = window.innerHeight, bars = [];
    document.querySelectorAll('[style*="overflow-y: auto"],[style*="overflow-y: scroll"],[style*="overflow: auto"],.chscroll,.wf-snap').forEach(function (sc) {
      if (!sc.offsetHeight) return; var n = null;
      for (var a = sc, d = 0; a && d < 4 && !n; a = a.parentElement, d++) { n = a.nextElementSibling; while (n && (n.__wfOv || !n.offsetHeight || /^(absolute|fixed)$/.test(getComputedStyle(n).position))) n = n.nextElementSibling; }   /* the panel may sit in a wrapper */
      if (!n) return; var r = n.getBoundingClientRect(), pr = (n.parentElement || n).getBoundingClientRect();
      if (r.height < 48 || r.height > 280 || r.top < H * 0.45 || Math.abs(r.bottom - pr.bottom) > 2 || r.width < pr.width - 2) return;
      if (!n.querySelector('button, a, input, textarea, [role=button]')) return;
      var rb = n.closest && n.closest('section'), rx = rb && rb.querySelector(':scope > .wf-spx'); if ((rx && rx.__ride) || n.closest('.wf-dlg, section[data-swipe="down"]')) { if (n.hasAttribute('data-wf-sb')) n.removeAttribute('data-wf-sb'); return; }   /* (Oct 11, 20:05) inside a blade from below: its pattern is at its top only */
      bars.push(n); addB(n, Math.round(n.offsetHeight)); });
    var tops = [];
    document.querySelectorAll('.wf-stripes:not([data-wf-sp])').forEach(function (t) { var st0 = t.getAttribute('style') || ''; if (!/bottom:\s*0(px)?;/.test(st0) || /(^|;\s*)top:\s*0(px)?;/.test(st0)) return;   /* (Oct 11, 20:05) a strip down a side (the menu column's) is not a bottom edge */ var b = t.parentElement; if (!b) return; tops.push(b); addB(b, 64, true); });
    document.querySelectorAll('.wf-spx').forEach(function (t) { var b = t.parentElement; if (!b || !b.offsetHeight || tops.indexOf(b) >= 0) return;
      if (t.__ride) { if (b.hasAttribute('data-wf-sb')) b.removeAttribute('data-wf-sb'); return; }   /* (Oct 11, 20:00) a blade from below: the pattern at its top only, never also at its foot */
      if (bars.some(function (x) { return b.contains(x); })) return; addB(b, 96); });
    /* (Oct 11, 20:45) dialogs and sheets from below have one pattern only, at their top (their ::before): never a band at their foot */
    document.querySelectorAll('.wf-dlg, section[data-swipe="down"]').forEach(function (d) { if (d.hasAttribute('data-wf-sb')) d.removeAttribute('data-wf-sb'); d.querySelectorAll('[data-wf-sb]').forEach(function (x) { x.removeAttribute('data-wf-sb'); }); });
    /* the end of each screen's scroll (screens that scroll; not the chat, not blades or dialogs): the band over the last 96px of the content */
    document.querySelectorAll('[style*="overflow-y: auto"],[style*="overflow-y: scroll"],[style*="overflow: auto"],.wf-snap').forEach(function (sc) {
      var bl = sc.closest('.sheet, .blade'), pgB = !!(bl && bl.hasAttribute('data-sb') && bl.offsetHeight > H * 0.6), dl = sc.closest('[role=dialog], [role=alertdialog], .wf-dlg, .chblade'), ok = sc.offsetHeight > H * 0.5 && sc.scrollHeight > sc.clientHeight + 1 && !sc.classList.contains('chscroll') && !sc.closest('[data-wf-menusec]') && !sc.closest('section[data-swipe="down"], .wf-dlg')   /* (Oct 11, 21:55) blades from below: one pattern, at their top */ && (!dl || pgB && dl === bl) && (!bl || pgB);   /* (Oct 11, 15:00) the fire page's tall page blade counts as a screen */
      var old = sc.querySelector(':scope > .wf-spe'); if (old) old.remove();
      if (!ok) { if (sc.hasAttribute('data-wf-se')) sc.removeAttribute('data-wf-se'); return; }
      var cs = getComputedStyle(sc), pb = parseFloat(cs.paddingBottom) || 0, gap = /flex|grid/.test(cs.display) ? (parseFloat(cs.rowGap) || 0) : 0;
      var mt = '-' + Math.max(0, 96 - pb + gap) + 'px', mb = '-' + pb + 'px';
      if (sc.style.getPropertyValue('--wf-se-mt') !== mt) sc.style.setProperty('--wf-se-mt', mt); if (sc.style.getPropertyValue('--wf-se-mb') !== mb) sc.style.setProperty('--wf-se-mb', mb);
      if (!sc.hasAttribute('data-wf-se')) sc.setAttribute('data-wf-se', '1'); });
  } catch (e) {} }
  setInterval(function () { run(); runB(); }, 700); if (document.readyState !== 'loading') { run(); runB(); } else document.addEventListener('DOMContentLoaded', function () { run(); runB(); });
})();

/* (Oct 11, 14:55, app-wide) Icons in tags and button tags: the drawn icon (its ink, stroke included), not its 24px box, sits 8px from
   the tag's left edge and 8px from its label. Each icon's empty margins inside its viewBox are measured and taken back with negative
   margins, so every tag (stage bands and buttons, header stage tags, small tags, chips, candidate tags, map pills) reads the same
   whatever the icon (flame, moon, asterisk, shield). Re-measured when an icon changes. */
(function () {
  var SEL = '.wf-stg>svg:first-child,.qtag>svg:first-child,.wf-ctag>svg:first-child,[style*="padding: 0 16px 0 8px"]>svg:first-child,[style*="padding: 0px 16px 0px 8px"]>svg:first-child';
  function ink(svg) {
    try {
      var vb = svg.viewBox && svg.viewBox.baseVal, W = vb && vb.width ? vb.width : 24, X0 = vb ? vb.x : 0, k = svg.getBoundingClientRect().width / (svg.offsetWidth || svg.clientWidth || 1);
      var w = svg.clientWidth || parseFloat(svg.getAttribute('width')) || 24; if (!w || getComputedStyle(svg).display === 'none') return;
      var x0 = Infinity, x1 = -Infinity;
      svg.querySelectorAll('path,circle,ellipse,rect,line,polyline,polygon').forEach(function (s) {
        if (s.closest('defs,clipPath,mask')) return; var b; try { b = s.getBBox(); } catch (e) { return; } if (!b || (!b.width && !b.height)) return;
        var cs = getComputedStyle(s), sw = cs.stroke && cs.stroke !== 'none' ? (parseFloat(s.getAttribute('stroke-width') || cs.strokeWidth) || 0) / 2 : 0;
        x0 = Math.min(x0, b.x - sw); x1 = Math.max(x1, b.x + b.width + sw); });
      if (!isFinite(x0)) return; var u = w / W, L = Math.max(0, (x0 - X0) * u), R = Math.max(0, (X0 + W - x1) * u);
      var ml = (-L).toFixed(2) + 'px', mr = (-R).toFixed(2) + 'px';
      if (svg.style.marginLeft !== ml) svg.style.setProperty('margin-left', ml, 'important');
      if (svg.style.marginRight !== mr) svg.style.setProperty('margin-right', mr, 'important');
    } catch (e) {}
  }
  /* (Oct 11, 18:50) off: icons keep their box so labels line up in every tag (DESIGN.md, "Tag inside") */
  var q = false; function run() { q = false; }
  function later() { if (!q) { q = true; requestAnimationFrame(run); } }
  function go() { later(); try { new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['d', 'style', 'class'] }); } catch (e) {} }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();

/* (Oct 11, 15:00, app-wide) Header stripe pattern on every screen header that carries it (incident pages, as on the station home): the
   stripes run up to the camera and fade in, 0% over the top 30% (the strip under the clock included), rising as t squared to 100% at
   the header's foot. The station page measures its own; this covers the others. */
(function () {
  function tick() { try { document.querySelectorAll('[data-wf-sp]').forEach(function (sp) { if (sp.closest('[data-wf-sthdr]')) return;
    var r = sp.getBoundingClientRect(); if (!r.height) return; var B = document.body, br = B.getBoundingClientRect(), k = sp.offsetWidth ? r.width / sp.offsetWidth : 1, gap = Math.max(0, r.top - br.top);
    var tot = r.bottom - r.top + gap, x0 = (0.3 * tot - gap) / k, hpx = r.height / k, x1 = Math.max(0, x0), st = [];
    for (var q = 0; q <= 8; q++) { var t = q / 8, y = x0 + (hpx - x0) * t; if (y < 0) continue; st.push('rgba(0,0,0,' + (t * t).toFixed(3) + ') ' + y.toFixed(1) + 'px'); }
    var M = 'linear-gradient(to bottom, ' + (x1 > 0 ? 'transparent 0, ' : '') + st.join(', ') + ')';
    if (sp.__wfSpM !== M) { sp.__wfSpM = M; sp.style.webkitMaskImage = sp.style.maskImage = M; } }); } catch (e) {} }
  setInterval(tick, 500); document.addEventListener('DOMContentLoaded', tick); window.addEventListener('load', tick);
})();

/* (Oct 11, 16:55, app-wide) the candidates' moon is filled (solid), on tags, buttons, rounds and map markers alike */
(function () { try { var st = document.createElement('style'); st.textContent = 'svg path[d="M15.5 3.7A9 9 0 1 0 15.5 20.3A8.3 8.3 0 0 1 15.5 3.7Z"],svg path[d="M11.66 3A9 9 0 1 0 18.68 18.04A8.3 8.3 0 0 1 11.66 3Z"]{fill:currentColor!important;stroke:none!important}svg circle+g path[d="M15.5 3.7A9 9 0 1 0 15.5 20.3A8.3 8.3 0 0 1 15.5 3.7Z"],svg circle+g path[d="M11.66 3A9 9 0 1 0 18.68 18.04A8.3 8.3 0 0 1 11.66 3Z"]{fill:#3A3A3C!important;stroke:none!important}';
  (document.head || document.documentElement).appendChild(st); } catch (e) {} })();
