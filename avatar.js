// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Illustrated firefighter portraits (drawn here as SVG, no photos): each person in the uniform and helmet of their own
// service, with an appearance that reflects the population where they serve. Used for the incident chat teams on
// California, Nevada and Portugal fires, and for the demo profiles.
(function () {
  if (window.__wfAvatar) return;
  // Services: helmet, jacket or shirt, reflective stripes, collar, background
  var KIT = {
    // Portuguese volunteer and municipal firefighters (bombeiros): navy forest jacket with yellow and silver bands
    pt: { jacket: '#1F2B45', stripe: '#D7F41A', stripe2: '#C9CED6', collar: '#172036', helmet: '#F2C200', chief: '#F4F4F2', bg: '#DCE3EE', badge: '#C8102E' },
    // ANEPC command (national civil protection): navy with orange bands, white helmet
    anepc: { jacket: '#1B2440', stripe: '#F08A24', stripe2: '#C9CED6', collar: '#141B30', helmet: '#F4F4F2', chief: '#F4F4F2', bg: '#DCE3EE', badge: '#0A4DA2' },
    // US wildland crews (LAFD, LA County, CAL FIRE, Nevada Division of Forestry): yellow Nomex shirt, goggles on the helmet
    us: { jacket: '#E3B92E', stripe: null, collar: '#C99F1C', helmet: '#F2C200', chief: '#C8102E', bg: '#EFE6CF', badge: '#7A1F12', goggles: true },
    calfire: { jacket: '#E3B92E', stripe: null, collar: '#C99F1C', helmet: '#F4F4F2', chief: '#F4F4F2', bg: '#EFE6CF', badge: '#B0001A', goggles: true },
    nv: { jacket: '#E3B92E', stripe: null, collar: '#C99F1C', helmet: '#F2C200', chief: '#F4F4F2', bg: '#E6E9D5', badge: '#0B4F8A', goggles: true },
    // Brazilian federal brigades (Ibama · Prevfogo): yellow shirt, green shoulders
    br: { jacket: '#E3B92E', stripe: '#2E6B3A', collar: '#2E6B3A', helmet: '#F2C200', chief: '#F4F4F2', bg: '#DDE8D6', badge: '#2E6B3A', goggles: true }
  };
  function shade(h, k) { var c = [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); return '#' + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0'); }).join(''); }
  // p: { g: 'm'|'f', skin, hair, style: 'short'|'bald'|'long'|'bun'|'curly', beard: ''|'stubble'|'full', glasses: colour|'', kit, chief }
  function svg(p) {
    var K = KIT[p.kit] || KIT.us, sk = p.skin || '#E8C4A6', hr = p.hair || '#2B211C', hel = p.chief ? K.chief : K.helmet, sd = shade(sk, 0.88);
    var o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="9 11 46 46"><rect width="64" height="64" fill="' + K.bg + '"/>');
    // hair behind (long hair and buns show below the helmet)
    if (p.style === 'long') o.push('<path d="M19 30 C18 44 20 52 24 55 L40 55 C44 52 46 44 45 30 Z" fill="' + hr + '"/>');
    if (p.style === 'curly') o.push('<path d="M18 30 C15 40 18 48 22 50 L42 50 C46 48 49 40 46 30 Z" fill="' + hr + '"/>');
    // body: jacket or shirt, collar, reflective bands
    o.push('<path d="M3 64 C5 52 15 47 32 47 C49 47 59 52 61 64 Z" fill="' + K.jacket + '"/>');
    o.push('<rect x="27" y="41" width="10" height="8" rx="3" fill="' + sd + '"/>');
    // turnout coat: stand-up collar, zip and storm flap (not a sailor's V)
    o.push('<path d="M19.5 50.5 C23 46.2 41 46.2 44.5 50.5 L43 53.2 C39 50.4 25 50.4 21 53.2 Z" fill="' + K.collar + '"/>');
    o.push('<rect x="30.4" y="52" width="3.2" height="12" fill="' + shade(K.jacket, 0.82) + '"/><rect x="31.7" y="52" width="0.6" height="12" fill="' + shade(K.jacket, 0.6) + '"/>');
    if (K.goggles) o.push('<path d="M17 52 L26.5 60.5 M47 52 L37.5 60.5" stroke="#2B2B2D" stroke-width="2.4" stroke-linecap="round"/><rect x="23.5" y="58" width="6" height="6" rx="1" fill="#2B2B2D"/><rect x="45.5" y="50.5" width="3.2" height="5.5" rx="1" fill="#1C1C1E"/>');
    if (K.stripe) { o.push('<path d="M5.5 58 C12 55.5 20 54.8 32 54.8 C44 54.8 52 55.5 58.5 58 L59.4 61 C52 58.6 44 58 32 58 C20 58 12 58.6 4.6 61 Z" fill="' + K.stripe + '"/>');
      if (K.stripe2) o.push('<path d="M5 60.2 C12 58.2 20 57.6 32 57.6 C44 57.6 52 58.2 59 60.2 L59.3 61 C52 59 44 58.4 32 58.4 C20 58.4 12 59 4.7 61 Z" fill="' + K.stripe2 + '"/>'); }
    o.push('<rect x="41" y="52" width="6" height="5" rx="1" fill="' + K.badge + '"/>');
    // face
    o.push('<ellipse cx="20.6" cy="34" rx="2" ry="3" fill="' + sd + '"/><ellipse cx="43.4" cy="34" rx="2" ry="3" fill="' + sd + '"/>');
    o.push('<ellipse cx="32" cy="33.5" rx="11" ry="12.8" fill="' + sk + '"/>');
    // hair visible at the sides under the helmet
    if (p.style === 'short' || p.style === 'curly') o.push('<path d="M21.2 26 L21.2 33 L23 30 L23 26 Z M42.8 26 L42.8 33 L41 30 L41 26 Z" fill="' + hr + '"/>');
    if (p.style === 'long' || p.style === 'bun') o.push('<path d="M21 26 C20.6 31 21 36 22.6 38 L23.4 27 Z M43 26 C43.4 31 43 36 41.4 38 L40.6 27 Z" fill="' + hr + '"/>');
    // beard
    if (p.beard === 'full') o.push('<path d="M21.4 34 C21.6 42 26 46.4 32 46.4 C38 46.4 42.4 42 42.6 34 C40.5 38.5 37 40 32 40 C27 40 23.5 38.5 21.4 34 Z" fill="' + hr + '"/><path d="M28 39.4 Q32 37.6 36 39.4 Q32 38.8 28 39.4 Z" fill="' + hr + '"/>');
    if (p.beard === 'stubble') o.push('<path d="M22 35 C22.4 42 26.4 46 32 46 C37.6 46 41.6 42 42 35 C40 39 37 40.6 32 40.6 C27 40.6 24 39 22 35 Z" fill="' + hr + '" opacity="0.35"/>');
    // eyes, brows, nose, mouth
    o.push('<ellipse cx="27.6" cy="33" rx="1.3" ry="1.5" fill="#2A2320"/><ellipse cx="36.4" cy="33" rx="1.3" ry="1.5" fill="#2A2320"/>');
    o.push('<path d="M25 29.8 Q27.6 28.6 30 29.6 M34 29.6 Q36.4 28.6 39 29.8" stroke="' + shade(hr, 0.9) + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>');
    o.push('<path d="M32 34 L31 38 L32.6 38.3" stroke="' + shade(sk, 0.72) + '" stroke-width="0.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
    o.push('<path d="M29 41.3 Q32 43 35 41.3" stroke="' + (p.beard === 'full' ? shade(hr, 0.6) : '#9A4E45') + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>');
    if (p.glasses) o.push('<g fill="none" stroke="' + p.glasses + '" stroke-width="1.2"><circle cx="27.6" cy="33" r="3.6"/><circle cx="36.4" cy="33" r="3.6"/><path d="M31.2 33 L32.8 33 M24 32.4 L21.4 31.6 M40 32.4 L42.6 31.6"/></g>');
    // helmet: dome, brim, front badge, wildland goggles
    o.push('<path d="M17.5 28 C17.5 13.5 46.5 13.5 46.5 28 Z" fill="' + hel + '"/>');
    o.push('<path d="M29.8 13.6 C30.8 12.4 33.2 12.4 34.2 13.6 L34.8 27.6 L29.2 27.6 Z" fill="' + shade(hel, 0.84) + '"/><path d="M31 14 L33 14 L33.3 27 L30.7 27 Z" fill="' + shade(hel, 1.08) + '" opacity="0.6"/>');
    o.push('<ellipse cx="32" cy="28.2" rx="17.6" ry="3.2" fill="' + shade(hel, 0.86) + '"/>');
    if (K.goggles) o.push('<rect x="20" y="22.6" width="24" height="3.4" rx="1.7" fill="#3A3A3C"/><rect x="24.5" y="21.8" width="6" height="5" rx="2" fill="#7FA6B8"/><rect x="33.5" y="21.8" width="6" height="5" rx="2" fill="#7FA6B8"/>');
    else { o.push('<path d="M20.5 24 C22 19.8 42 19.8 43.5 24 L43 26.6 C38 24.8 26 24.8 21 26.6 Z" fill="#CFE3EE" opacity="0.75" stroke="' + shade(hel, 0.7) + '" stroke-width="0.6"/>');   // raised face visor
      o.push('<path d="M29.6 17.6 L32 16.4 L34.4 17.6 L34.4 20.6 L32 22 L29.6 20.6 Z" fill="' + K.badge + '"/>'); }
    // chin strap
    o.push('<path d="M20.6 29.5 C21.4 38.5 25.6 45 32 46.3 C38.4 45 42.6 38.5 43.4 29.5" fill="none" stroke="#2B2B2D" stroke-width="1" opacity="0.85"/>');
    o.push('</svg>');
    return 'data:image/svg+xml,' + encodeURIComponent(o.join(''));
  }

  // Appearance per person. Portugal: Southern European. California and Nevada: the states' real mix, read from the name.
  var S = { f1: '#F3D6C1', f2: '#EDCBAF', f3: '#E4BE9C', m1: '#D9AD86', m2: '#C98F63', m3: '#B07B55', d1: '#8A5A3C', d2: '#6B4630', d3: '#5A3A28',
    ea1: '#EFD0AE', ea2: '#E6C29C' };
  var H = { blk: '#1E1A18', dbr: '#3B2A20', br: '#5A3F2C', lbr: '#8A6A48', bl: '#D8B570', red: '#9A4A28', aub: '#7A3A22', gry: '#B8B4AE' };
  var PEOPLE = {
    // Portugal
    'João Matos': ['m', S.m1, H.dbr, 'short', 'stubble'], 'Ana Sousa': ['f', S.f3, H.dbr, 'bun'], 'Pedro Lopes': ['m', S.f3, H.blk, 'short', 'full'], 'Marta Ribeiro': ['f', S.f2, H.br, 'long'],
    'Rui Carvalho': ['m', S.m1, H.blk, 'short'], 'Inês Duarte': ['f', S.m1, H.blk, 'bun'], 'Tiago Ferreira': ['m', S.f2, H.br, 'short', 'stubble'], 'Sofia Martins': ['f', S.f2, H.lbr, 'long'],
    'Nuno Almeida': ['m', S.f3, H.dbr, 'short', 'full'], 'Carla Neves': ['f', S.f3, H.dbr, 'long'], 'Miguel Costa': ['m', S.m1, H.blk, 'short'], 'Beatriz Santos': ['f', S.f2, H.dbr, 'bun'],
    'André Pereira': ['m', S.f3, H.br, 'short', 'stubble'], 'Rita Gomes': ['f', S.m1, H.blk, 'long'], 'Luís Rodrigues': ['m', S.m2, H.blk, 'short', 'full'], 'Catarina Silva': ['f', S.f3, H.br, 'bun'],
    'Hugo Fernandes': ['m', S.f2, H.dbr, 'short'], 'Joana Pinto': ['f', S.f2, H.lbr, 'long'], 'Ricardo Oliveira': ['m', S.m1, H.blk, 'short', 'stubble'], 'Mariana Teixeira': ['f', S.f3, H.dbr, 'long'],
    'Bruno Correia': ['m', S.f3, H.br, 'short'], 'Filipa Moreira': ['f', S.f2, H.br, 'bun'], 'Diogo Cardoso': ['m', S.m1, H.dbr, 'short', 'full'], 'Helena Rocha': ['f', S.f3, H.gry, 'bun'],
    'Paulo Mendes': ['m', S.f3, H.gry, 'short', 'stubble'], 'Vera Castro': ['f', S.m1, H.blk, 'long'], 'Sérgio Batista': ['m', S.m2, H.blk, 'short'], 'Patrícia Lima': ['f', S.f2, H.dbr, 'long'],
    // California and Nevada
    'Mike Delgado': ['m', S.m2, H.blk, 'short', 'stubble'], 'Sarah Kim': ['f', S.ea1, H.blk, 'long'], 'James Carter': ['m', S.d2, H.blk, 'short', 'stubble'], 'Maria Lopez': ['f', S.m2, H.dbr, 'long'],
    'David Nguyen': ['m', S.ea2, H.blk, 'short'], 'Emily Ross': ['f', S.f1, H.bl, 'long'], 'Chris Walker': ['m', S.f2, H.br, 'short', 'stubble'], 'Ana Ramirez': ['f', S.m3, H.blk, 'bun'],
    "Kevin O'Brien": ['m', S.f1, H.red, 'short', 'full'], 'Laura Chen': ['f', S.ea1, H.blk, 'bun'], 'Daniel Brooks': ['m', S.d1, H.blk, 'short'], 'Jessica Patel': ['f', S.m3, H.blk, 'long'],
    'Ryan Mitchell': ['m', S.f2, H.lbr, 'short'], 'Olivia Grant': ['f', S.d3, H.blk, 'curly'], 'Marcus Hill': ['m', S.d2, H.blk, 'short', 'full'], 'Rachel Adams': ['f', S.f1, H.aub, 'long'],
    'Tom Alvarez': ['m', S.m2, H.dbr, 'short', 'full'], 'Nicole Baker': ['f', S.f1, H.bl, 'bun'], 'Steve Park': ['m', S.ea2, H.blk, 'short'], 'Hannah Cole': ['f', S.f2, H.lbr, 'long'],
    'Jorge Medina': ['m', S.m3, H.blk, 'short', 'stubble'], 'Megan Price': ['f', S.f2, H.br, 'bun'], 'Eric Foster': ['m', S.f2, H.br, 'short'], 'Lisa Wong': ['f', S.ea2, H.blk, 'long'],
    'Brian Hayes': ['m', S.f1, H.lbr, 'short', 'stubble'], 'Amy Torres': ['f', S.m2, H.dbr, 'long'], 'Carlos Reyes': ['m', S.m3, H.blk, 'short', 'full'], 'Kate Sullivan': ['f', S.f1, H.red, 'bun'],
    // Demo profiles
    'Nuno Rogerio': ['m', S.f2, H.gry, 'bald', 'full', '#2B2B2B'], 'Susana Vasconcellos': ['f', S.f1, H.aub, 'bun', '', '#8E2A2A'], 'Rita Cardoso': ['f', S.f3, H.dbr, 'bun'],
    'Marcus Reyes': ['m', S.m2, H.blk, 'short', 'stubble'], 'Dana Whitfield': ['f', S.f1, H.lbr, 'bun'], 'Rafael Nogueira': ['m', S.m2, H.blk, 'short', 'full']
  };
  // One colour per station, shared by every screen: the station's header tint and its people's portrait outline.
  // (Blue stays for air support; the fire owner keeps the hi-vis yellow.)
  window.__wfStationCol = ['#FF7A1A', '#B45CFF', '#00B39F', '#FF4FA0', '#7BC043', '#E0A800'];
  window.__wfTint = function (hex, a) { return 'rgba(' + [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }).join(',') + ',' + a + ')'; };
  // ---- station crests ----------------------------------------------------------------------------------------------
  // data/crests.json (weekly from Wikidata / Wikimedia Commons): the service's logo in California, the corporation's
  // logo or its town's arms in Portugal. Where none is found, a shield is drawn from the station's own data
  // (its service or corporation initials, its town and number), never imitating an official crest.
  window.__wfCrests = null;
  try { fetch('data/crests.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (js) { window.__wfCrests = js.s || {}; try { window.dispatchEvent(new Event('wf-sync')); } catch (e) {} })
    .catch(function () { window.__wfCrests = {}; }); } catch (e) { window.__wfCrests = {}; }
  var HER = [['#B0001A', '#F2C200'], ['#1F2B45', '#D7F41A'], ['#2E6B3A', '#F4F4F2'], ['#7A1F12', '#F2C200'], ['#0B4F8A', '#F4F4F2'], ['#4A2A6B', '#F2C200']];
  function hsh(t) { var h = 0; t = String(t || ''); for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function normName(name) { return String(name || 'Fire station').trim().replace(/^BV\s+/, 'Bombeiros Voluntários de ').replace(/^BM\s+/, 'Bombeiros Municipais de ').replace(/^BS\s+/, 'Bombeiros Sapadores de '); }
  // A crest colour strong enough for an outline: very light colours are deepened
  function usable(hex) {
    if (!/^#[0-9A-F]{6}$/i.test(hex || '')) return '';
    var c = [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }), l = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    if (l > 0.72) c = c.map(function (v) { return Math.round(v * 0.62 / l); });
    return '#' + c.map(function (v) { return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }
  function drawn(name) {
    var n = normName(name), num = (n.match(/(\d{1,3})\s*$/) || n.match(/#\s*(\d{1,3})/) || n.match(/\b(\d{1,3})\b/) || [])[1] || '';
    var top = '', mid = '';
    var pt = /bombeiros/i.exec(n);
    if (pt) {
      top = /municipa/i.test(n) ? 'BM' : /sapador/i.test(n) ? 'BS' : 'BV';
      var town = n.replace(/^.*?bombeiros\s+(volunt[aá]rios|municipais|sapadores)?\s*(de|da|do|dos|das)?\s*/i, '').replace(/^(a|o)\s+/i, '');
      var w = town.split(/[\s-]+/).filter(function (x) { return x && !/^(de|da|do|dos|das|e)$/i.test(x); });
      mid = w.length > 1 ? (w[0][0] + w[1][0]) : (w[0] || n).slice(0, 2);
    } else {
      var ag = n.replace(/\b(fire\s+)?station\b.*$/i, '').replace(/[^A-Za-zÀ-ÿ\s-]/g, '').trim();
      var ini = ag.split(/[\s-]+/).filter(function (x) { return x && !/^(of|and|the|de|la|county's)$/i.test(x); }).map(function (x) { return (x.match(/[A-Z]/g) || []).length > 1 ? x.replace(/[^A-Z]/g, '') : x[0]; }).join('').toUpperCase();
      if (!ini) ini = 'FS';
      top = ini.length > 5 ? ini.slice(0, 5) : ini; mid = num || ini.slice(0, 2); if (num) num = '';
    }
    mid = mid.toUpperCase();
    var c = HER[hsh(n) % HER.length];
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<path d="M32 3 L56 10 V30 C56 45 45 55 32 61 C19 55 8 45 8 30 V10 Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.5"/>' +
      '<path d="M8.9 10.6 L32 3.9 L55.1 10.6 V20 H8.9 Z" fill="' + c[1] + '"/>' +
      '<text x="32" y="17.4" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="9" font-weight="800" letter-spacing="0.5" fill="' + c[0] + '">' + esc(top) + '</text>' +
      '<text x="32" y="' + (num ? 40 : 43) + '" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="' + (mid.length > 2 ? 15 : 19) + '" font-weight="800" fill="' + c[1] + '">' + esc(mid) + '</text>' +
      (num ? '<text x="32" y="52" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="9" font-weight="700" fill="' + c[1] + '">' + esc(num) + '</text>' : '') + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(o);
  }
  // key: OSM 'n123' / 'w123' when known; name: the station's name
  window.__wfCrest = function (key, name) {
    var C = window.__wfCrests || {}, hit = key ? C[key] : null;
    if (hit) return { url: hit[0], kind: hit[1], label: hit[2] || '', color: usable(hit[3]) };
    return { url: drawn(name), kind: 'drawn', label: '', color: HER[hsh(normName(name)) % HER.length][0] };
  };
  // A real crest that cannot load (offline, blocked) is replaced by the drawn one: every crest image carries data-crest="<station name>"
  try { window.addEventListener('error', function (e) { var t = e.target; if (t && t.tagName === 'IMG' && t.getAttribute && t.getAttribute('data-crest') && !/^data:/.test(t.src)) t.src = window.__wfCrest('', t.getAttribute('data-crest')).url; }, true); } catch (e) {}
  var CACHE = {};
  // kit: 'pt' | 'anepc' | 'us' | 'calfire' | 'nv' | 'br'; chief: a coordinator or commander (helmet by rank)
  window.__wfAvatar = function (name, kit, chief) {
    var q = PEOPLE[name]; if (!q) return '';
    var k = name + '|' + kit + '|' + (chief ? 1 : 0);
    return CACHE[k] || (CACHE[k] = svg({ g: q[0], skin: q[1], hair: q[2], style: q[3], beard: q[4] || '', glasses: q[5] || '', kit: kit, chief: !!chief }));
  };
})();
