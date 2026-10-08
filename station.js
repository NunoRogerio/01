// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// (Oct 7) A station's captain and team lead: their station, its area, and the incidents that are theirs.
//  - Each profile carries a station, its area and a level (captain / team lead). The station is real (OpenStreetMap).
//  - The area is fixed: in Portugal the station's municipality (its parishes); in the US the community the station serves
//    (OpenStreetMap boundary: census place or city). Incidents inside it belong to the station.
//  - Mutual aid on top: an incident outside the area for which this station is one of the two closest units responds
//    across the border (the closest unit answers when the incident sits on the border or the home station lacks forces).
(function () {
  // [id, type, name, lat, lon, operator] of each role profile's station; both profiles share Station 11 (Altadena)
  var ST11 = { id: 1353638773, type: 'way', name: 'Los Angeles County Fire Department Station 11', lat: 34.18855, lon: -118.13296,
    tags: { operator: 'Los Angeles County Fire Department' }, cc: 'us', st: 'CA' };
  var ME = {
    coord: { level: 'captain', station: ST11, crew: null },
    ff: { level: 'lead', station: ST11, crew: 0 }   // the team lead leads the station's first crew (its engine)
  };
  var X = function (lon) { return (lon + 118.13) * 2345 + 518; }, Y = function (lat) { return (34.19 - lat) * 2829 + 662; };
  var LON = function (x) { return (x - 518) / 2345 - 118.13; }, LAT = function (y) { return 34.19 - (y - 662) / 2829; };
  function rid() { var c = ''; try { c = localStorage.getItem('wf-custom') || ''; } catch (e) {} return c; }
  function signed() { var r = ''; try { r = localStorage.getItem('wf-role') || ''; } catch (e) {} return r; }
  // The station profile signed in on this phone, or null (administrator and regional profiles)
  window.__wfMine = function () { var k = rid(); if (!signed() || !ME[k]) return null; var m = ME[k], s = m.station;
    return { key: k, level: m.level, crew: m.crew, station: Object.assign({}, s, { x: Math.round(X(s.lon)), y: Math.round(Y(s.lat)) }) }; };
  // Who leads the profile stations, so every screen tells the same story (the captain commands, the team lead leads the first crew)
  window.__wfStaffOf = function (id) { return String(id) === String(ST11.id) ? { captain: 'Elena Ortiz', lead: 'Daniel Brooks' } : null; };
  // (Oct 8, 14:35) Simulated incidents in the station's area, so the captain and the team lead always have a story to work:
  // one fire (a copy of a real Los Angeles County fire's data, moved into the area and renamed) and one ignition candidate
  // (a copy of a real satellite detection, moved into the area). Marked sim: shown with the simulation star. Station profiles only.
  var SIMF = { id: 'SIM-ST11-F1', name: 'Rubio Fire', near: 'Rubio Canyon, above Altadena', lat: 34.2005, lon: -118.1225, ac: 38, pc: 0, minAgo: 52 };
  var SIMC = { lat: 34.2052, lon: -118.1498, place: 'Altadena', near: '2.5 km northwest of Altadena', conf: 88, minAgo: 12 };
  window.__wfSim = function () { var M = window.__wfMine ? window.__wfMine() : null; if (!M) return;
    var F = window.__wfLiveFires, C = window.__wfLiveCands, now = Date.now();
    if (F && !F.some(function (r) { return r && r[2] === SIMF.id; })) {
      var T = F.find(function (r) { return r && r[0] === 'CA' && /^Los Angeles/.test(r[1] || ''); }) || F.find(function (r) { return r && r[0] === 'CA'; }) || F[0];
      var r = T ? JSON.parse(JSON.stringify(T)) : ['CA', 'Los Angeles', '', '', '', 0, 0, { man: 0, terrain: 0, aerial: 0, est: true }, 0, {}, ''];
      var ha = Math.round(SIMF.ac * 0.4047 * 10) / 10, k = T && T[8] ? Math.max(0.05, ha / T[8]) : 1;
      r[0] = 'CA'; r[1] = 'Los Angeles'; r[2] = SIMF.id; r[3] = SIMF.name; r[4] = 'Contained ' + SIMF.pc + '% · ' + SIMF.ac + ' ac';
      r[5] = Math.round(X(SIMF.lon)); r[6] = Math.round(Y(SIMF.lat)); r[8] = ha; r[10] = SIMF.near;
      if (r[7] && typeof r[7] === 'object') ['man', 'terrain', 'aerial'].forEach(function (q) { if (typeof r[7][q] === 'number') r[7][q] = Math.max(q === 'aerial' ? 0 : 1, Math.round(r[7][q] * k)); });
      r[9] = Object.assign({}, r[9] || {}, { src: 'Simulation', st: 'Active', stEn: SIMF.pc + '% contained', tone: 'red', pc: SIMF.pc, startMs: now - SIMF.minAgo * 6e4, updMs: now - 6e4 * 4, ac: SIMF.ac, ha: ha, resolved: false, heldMs: null, heldSrc: '', place: 'Los Angeles County · CA', url: '', sim: true, lat: SIMF.lat, lon: SIMF.lon });
      F.push(r); }
    if (C && !C.some(function (r) { return r && r[2] === 'HS-SIM-ST11'; })) {
      var TC = C.find(function (r) { return r && r[0] === 'CA'; }) || C[0];
      var c = TC ? JSON.parse(JSON.stringify(TC)) : ['CA', 'Los Angeles', '', '', 0, 'sat:VIIRS NOAA-20', '', 0, 0, {}];
      var t = new Date(now - SIMC.minAgo * 6e4).toISOString().slice(0, 16) + 'Z';
      c[0] = 'CA'; c[1] = 'Los Angeles'; c[2] = 'HS-SIM-ST11'; c[3] = SIMC.place; c[4] = SIMC.conf; c[6] = SIMC.minAgo + ' min ago'; c[7] = Math.round(X(SIMC.lon)); c[8] = Math.round(Y(SIMC.lat));
      c[9] = Object.assign({}, c[9] || {}, { lat: SIMC.lat, lon: SIMC.lon, t: t, ll: SIMC.lat.toFixed(2) + '°N ' + Math.abs(SIMC.lon).toFixed(2) + '°W', near: SIMC.near, night: window.__wfSunAlt ? window.__wfSunAlt(SIMC.lat, SIMC.lon, now) < -0.833 : false, sim: true });
      C.push(c); } };
  window.__wfHomeUrl = function () { return window.__wfMine() ? 'Station.dc.html?home=1' : 'Main.dc.html'; };

  // ---- the station's area, kept 30 days on this phone ----
  // (Oct 7, 21:53) the profile stations' areas ship with the app, so they show at once: Station 11's is the Altadena census
  // place (US Census TIGER/Line 2019, Altadena CDP, GEOID 0601290). Any other station's area comes from OpenStreetMap.
  var BUNDLED = { '1353638773': { t: 9e15, name: 'Altadena', kind: 'community', src: 'US Census TIGER/Line 2019', rings: [[[34.1848,-118.17062],[34.18498,-118.1706],[34.18564,-118.17038],[34.18568,-118.16999],[34.18548,-118.16971],[34.18544,-118.16891],[34.18551,-118.16861],[34.18738,-118.16863],[34.18819,-118.16864],[34.18878,-118.16858],[34.18881,-118.16825],[34.18881,-118.16793],[34.18881,-118.16764],[34.1892,-118.1675],[34.1897,-118.1675],[34.19019,-118.1675],[34.19053,-118.16751],[34.19026,-118.16687],[34.19069,-118.16667],[34.19123,-118.1665],[34.19168,-118.16729],[34.19206,-118.16843],[34.19244,-118.16849],[34.19287,-118.16849],[34.19338,-118.16842],[34.19383,-118.16822],[34.19416,-118.16793],[34.19588,-118.16708],[34.19622,-118.1668],[34.1966,-118.16659],[34.20024,-118.16485],[34.20082,-118.16444],[34.20101,-118.16431],[34.20124,-118.16415],[34.20142,-118.16402],[34.20164,-118.16258],[34.1992,-118.16186],[34.19875,-118.16012],[34.20001,-118.15955],[34.20081,-118.16035],[34.20127,-118.16081],[34.20172,-118.16085],[34.20168,-118.16133],[34.20185,-118.16151],[34.20212,-118.16163],[34.20233,-118.1618],[34.20261,-118.16204],[34.20362,-118.1627],[34.20389,-118.16271],[34.20445,-118.16273],[34.20461,-118.16282],[34.2048,-118.16335],[34.20484,-118.16376],[34.20585,-118.16452],[34.20706,-118.16549],[34.20737,-118.16564],[34.20802,-118.16556],[34.20807,-118.16571],[34.2086,-118.16604],[34.20887,-118.16604],[34.20952,-118.16604],[34.20991,-118.16604],[34.21043,-118.1664],[34.21072,-118.16665],[34.21104,-118.16695],[34.21181,-118.16699],[34.21176,-118.16595],[34.21217,-118.16557],[34.21227,-118.16513],[34.21233,-118.16509],[34.21258,-118.16519],[34.21294,-118.16485],[34.21315,-118.16485],[34.21339,-118.16489],[34.21454,-118.16422],[34.2149,-118.1638],[34.21522,-118.16343],[34.21537,-118.16432],[34.21576,-118.16369],[34.21622,-118.16389],[34.21643,-118.16335],[34.21686,-118.16229],[34.21692,-118.16048],[34.21603,-118.15626],[34.21498,-118.14525],[34.21459,-118.13823],[34.21274,-118.13287],[34.20869,-118.12559],[34.20747,-118.1235],[34.20318,-118.11666],[34.20146,-118.11437],[34.19486,-118.10481],[34.19336,-118.10489],[34.1933,-118.10531],[34.19322,-118.1068],[34.19238,-118.10598],[34.19171,-118.10541],[34.1914,-118.10516],[34.19087,-118.10482],[34.19071,-118.10459],[34.19032,-118.10492],[34.18974,-118.10494],[34.18921,-118.10486],[34.18852,-118.1044],[34.18793,-118.10384],[34.18718,-118.10378],[34.18666,-118.10361],[34.18665,-118.10314],[34.18648,-118.1032],[34.18567,-118.10252],[34.18519,-118.10214],[34.18492,-118.10244],[34.18416,-118.10157],[34.18393,-118.10114],[34.18367,-118.10067],[34.18342,-118.10045],[34.1832,-118.10035],[34.18267,-118.10031],[34.17824,-118.09938],[34.17578,-118.09829],[34.17563,-118.09543],[34.17543,-118.095],[34.1751,-118.095],[34.17462,-118.09529],[34.17451,-118.09552],[34.17407,-118.09557],[34.17369,-118.09561],[34.172,-118.09661],[34.17132,-118.09637],[34.17072,-118.09613],[34.17044,-118.09559],[34.16992,-118.09521],[34.16969,-118.09522],[34.16916,-118.09576],[34.16915,-118.09714],[34.16861,-118.0978],[34.16805,-118.09833],[34.16756,-118.09867],[34.16756,-118.099],[34.16756,-118.09924],[34.16756,-118.0995],[34.16756,-118.1],[34.16756,-118.10023],[34.16756,-118.10051],[34.16756,-118.10082],[34.16756,-118.10122],[34.16757,-118.10152],[34.16757,-118.10182],[34.16757,-118.10223],[34.16757,-118.10282],[34.16757,-118.10348],[34.16757,-118.10409],[34.16757,-118.10471],[34.16757,-118.10533],[34.16758,-118.10592],[34.16758,-118.10635],[34.16758,-118.10665],[34.16758,-118.10685],[34.16758,-118.10716],[34.16758,-118.10749],[34.16758,-118.10776],[34.16758,-118.10809],[34.16759,-118.10848],[34.16759,-118.10884],[34.16759,-118.10912],[34.16759,-118.10937],[34.16859,-118.10936],[34.16859,-118.11055],[34.1686,-118.11105],[34.1686,-118.11154],[34.16914,-118.11123],[34.17039,-118.11141],[34.16962,-118.11426],[34.16961,-118.11696],[34.16982,-118.11696],[34.17001,-118.11696],[34.17023,-118.11697],[34.17043,-118.11697],[34.17065,-118.11697],[34.17084,-118.11697],[34.17106,-118.11697],[34.17121,-118.11698],[34.17139,-118.11698],[34.17376,-118.11661],[34.1751,-118.11662],[34.17531,-118.11736],[34.17594,-118.11835],[34.17546,-118.1185],[34.1753,-118.11873],[34.17529,-118.119],[34.17529,-118.11923],[34.17529,-118.11949],[34.17529,-118.11972],[34.17529,-118.11999],[34.17528,-118.12022],[34.17528,-118.12049],[34.17528,-118.12065],[34.17528,-118.12095],[34.17527,-118.12147],[34.17551,-118.12242],[34.17521,-118.12254],[34.17511,-118.12324],[34.1751,-118.12377],[34.1751,-118.12426],[34.17509,-118.12476],[34.17509,-118.12522],[34.17509,-118.12569],[34.17508,-118.12625],[34.17524,-118.12772],[34.17524,-118.128],[34.17524,-118.12825],[34.17524,-118.12848],[34.17652,-118.12863],[34.17693,-118.13189],[34.17811,-118.13452],[34.18008,-118.13891],[34.18156,-118.1422],[34.18155,-118.14333],[34.18155,-118.14403],[34.18154,-118.14514],[34.18154,-118.14606],[34.18154,-118.14634],[34.18153,-118.14766],[34.18153,-118.14844],[34.18152,-118.14934],[34.18152,-118.15],[34.18151,-118.15061],[34.18151,-118.15226],[34.1815,-118.15374],[34.18149,-118.1553],[34.18148,-118.1561],[34.18148,-118.15663],[34.18148,-118.15716],[34.18147,-118.15834],[34.18147,-118.15907],[34.18144,-118.15967],[34.18145,-118.16334],[34.18144,-118.16403],[34.18237,-118.16412],[34.18307,-118.16741],[34.18178,-118.16736],[34.18146,-118.16728],[34.18143,-118.16747],[34.18143,-118.16896],[34.18143,-118.16959],[34.1826,-118.17006],[34.18355,-118.17035],[34.18373,-118.17035],[34.18408,-118.17045],[34.18435,-118.17054],[34.18444,-118.17057],[34.18451,-118.17059],[34.18459,-118.1706],[34.18467,-118.17061],[34.1848,-118.17062]],[[34.18939,-118.17164],[34.1895,-118.17156],[34.18957,-118.17151],[34.18958,-118.1715],[34.18966,-118.17137],[34.18971,-118.17128],[34.18976,-118.1712],[34.18987,-118.17103],[34.19007,-118.17069],[34.19012,-118.17061],[34.19016,-118.1706],[34.19058,-118.17057],[34.19067,-118.17056],[34.19074,-118.17055],[34.19076,-118.17055],[34.19112,-118.17052],[34.19113,-118.17052],[34.19157,-118.17011],[34.19165,-118.17003],[34.19174,-118.16995],[34.19188,-118.16981],[34.19215,-118.16955],[34.19233,-118.16939],[34.19242,-118.1693],[34.19238,-118.16929],[34.19246,-118.16922],[34.19067,-118.16859],[34.18968,-118.16858],[34.18924,-118.16858],[34.18919,-118.16858],[34.18919,-118.16872],[34.18919,-118.16875],[34.18919,-118.16887],[34.18919,-118.169],[34.18919,-118.16903],[34.18919,-118.1692],[34.18919,-118.16924],[34.18919,-118.16936],[34.18919,-118.16948],[34.18918,-118.16953],[34.18918,-118.16969],[34.18918,-118.16971],[34.18918,-118.16977],[34.18918,-118.16985],[34.18918,-118.16995],[34.18918,-118.17002],[34.18918,-118.17018],[34.18918,-118.17035],[34.18918,-118.17043],[34.18918,-118.17051],[34.18917,-118.17069],[34.18923,-118.17069],[34.18924,-118.17088],[34.18925,-118.17098],[34.18925,-118.17107],[34.18926,-118.17118],[34.18929,-118.17172],[34.18939,-118.17164]]] } };
  var AK = 'wf-starea-', AREA = {}, WAIT = {};
  function emit() { try { window.dispatchEvent(new Event('wf-starea')); } catch (e) {} }
  function stitch(members) {   // outer ways of a relation into closed rings of [lat, lon]
    var W = members.filter(function (m) { return m.type === 'way' && m.role !== 'inner' && m.geometry && m.geometry.length > 1; })
      .map(function (m) { return m.geometry.map(function (g) { return [g.lat, g.lon]; }); });
    var same = function (a, b) { return Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7; }, rings = [];
    while (W.length) { var r = W.shift().slice(), grew = true;
      while (!same(r[0], r[r.length - 1]) && grew) { grew = false;
        for (var i = 0; i < W.length; i++) { var w = W[i], e = r[r.length - 1];
          if (same(w[0], e)) { r = r.concat(w.slice(1)); } else if (same(w[w.length - 1], e)) { r = r.concat(w.slice(0, -1).reverse()); }
          else if (same(w[w.length - 1], r[0])) { r = w.slice(0, -1).concat(r); } else if (same(w[0], r[0])) { r = w.slice(1).reverse().concat(r); } else continue;
          W.splice(i, 1); grew = true; break; } }
      if (r.length > 3) rings.push(r); }
    return rings; }
  function thin(r, maxPts) { if (r.length <= maxPts) return r; var k = Math.ceil(r.length / maxPts), o = []; for (var i = 0; i < r.length; i += k) o.push(r[i]); o.push(r[r.length - 1]); return o; }
  function pickRel(els, pt) {   // Portugal: the municipality (admin level 7); elsewhere the smallest community: census place, else city
    var R = els.filter(function (e) { return e.type === 'relation' && e.tags; }), lv = function (e) { return +e.tags.admin_level || 0; };
    if (pt) return R.find(function (e) { return e.tags.boundary === 'administrative' && lv(e) === 7; }) || null;
    return R.find(function (e) { return e.tags.boundary === 'census'; }) || R.filter(function (e) { return e.tags.boundary === 'administrative' && lv(e) >= 8; }).sort(function (a, b) { return lv(b) - lv(a); })[0]
      || R.find(function (e) { return e.tags.boundary === 'administrative' && lv(e) === 6; }) || null; }
  var MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  function q(s) { var one = function (u) { return new Promise(function (ok, no) { var t = setTimeout(function () { no(new Error('timeout')); }, 20000);
      fetch(u + '?data=' + encodeURIComponent(s)).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) { clearTimeout(t); ok(j); }, function (e) { clearTimeout(t); no(e); }); }); };
    return new Promise(function (ok, no) { var left = MIRRORS.length; MIRRORS.forEach(function (u) { one(u).then(ok, function () { if (--left === 0) no(new Error('no mirror')); }); }); }); }   /* the first mirror to answer wins */
  window.__wfStationArea = function (st) {
    if (!st) return null; var id = String(st.id);
    if (AREA[id]) return AREA[id];
    if (BUNDLED[id]) { AREA[id] = BUNDLED[id]; return AREA[id]; }
    try { var c = JSON.parse(localStorage.getItem(AK + id) || 'null'); if (c && c.rings && Date.now() - c.t < 30 * 864e5) { AREA[id] = c; return c; } } catch (e) {}
    if (WAIT[id]) return null; WAIT[id] = 1;
    var pt = st.cc === 'pt' || (st.lat > 36 && st.lat < 42.2 && st.lon > -9.6 && st.lon < -6);
    q('[out:json][timeout:25];is_in(' + st.lat + ',' + st.lon + ')->.a;(rel(pivot.a)["boundary"="administrative"];rel(pivot.a)["boundary"="census"];);out tags;')
      .then(function (js) { var rel = pickRel(js.elements || [], pt); if (!rel) throw new Error('no boundary');
        return q('[out:json][timeout:25];rel(' + rel.id + ');out geom;').then(function (g) { var e = (g.elements || [])[0]; if (!e) throw new Error('no geometry');
          var rings = stitch(e.members || []).map(function (r) { return thin(r, 400); });
          var a = { t: Date.now(), name: (rel.tags['name:' + (pt ? 'pt' : 'en')] || rel.tags.name || ''), kind: pt ? 'municipality' : rel.tags.boundary === 'census' ? 'community' : 'city', rings: rings };
          AREA[id] = a; try { localStorage.setItem(AK + id, JSON.stringify(a)); } catch (x) {} emit(); }); })
      .catch(function () { setTimeout(function () { delete WAIT[id]; }, 60000); });   /* no answer: tried again a minute later */
    return null; };
  window.__wfStationAreaSet = function (st, a) { AREA[String(st.id)] = a; emit(); };   // tests and previews

  function inRing(p, r) { var c = false; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var a = r[i], b = r[j];
    if ((a[0] > p[0]) !== (b[0] > p[0]) && p[1] < (b[1] - a[1]) * (p[0] - a[0]) / (b[0] - a[0]) + a[1]) c = !c; } return c; }
  function inArea(a, lat, lon) { if (!a || !a.rings) return false; for (var i = 0; i < a.rings.length; i++) if (inRing([lat, lon], a.rings[i])) return true; return false; }
  function km(a, b, c, d) { var kx = 111.32 * Math.cos(a * Math.PI / 180); return Math.hypot((c - a) * 110.57, (d - b) * kx); }
  window.__wfInStationArea = function (st, lat, lon) { return inArea(window.__wfStationArea(st), lat, lon); };
  // The area as one SVG path in the map's own units
  window.__wfStationAreaPath = function (st) { var a = window.__wfStationArea(st); if (!a) return '';
    return a.rings.map(function (r) { return 'M' + r.map(function (q) { return X(q[1]).toFixed(1) + ' ' + Y(q[0]).toFixed(1); }).join('L') + 'Z'; }).join(''); };

  // ---- stations of the country, for the closest-unit (mutual aid) check ----
  var SF = {}, SW = {};
  function stations(cc) { if (SF[cc]) return SF[cc]; if (!SW[cc]) { SW[cc] = 1; fetch('data/stations-' + cc + '.json').then(function (r) { return r.json(); }).then(function (js) { SF[cc] = js.s || []; emit(); }).catch(function () { delete SW[cc]; }); } return null; }
  // 'zone' (inside the station's area), 'aid' (outside it, and this station is one of its two closest units), or ''
  var MEMO = {};
  window.__wfIncidentFor = function (lat, lon, st) { st = st || ((window.__wfMine() || {}).station); if (!st || !isFinite(lat) || !isFinite(lon)) return '';
    var a = window.__wfStationArea(st); if (inArea(a, lat, lon)) return 'zone';
    var d0 = km(st.lat, st.lon, lat, lon); if (d0 > 25) return '';   // too far for a closest-unit response
    var S = stations(st.cc || 'us'); if (!S) return '';
    var k = lat.toFixed(4) + ',' + lon.toFixed(4); if (MEMO[k] != null) return MEMO[k];
    var near = 0; for (var i = 0; i < S.length; i++) { var r = S[i]; if (Math.abs(r[2] - lat) > 0.3 || Math.abs(r[3] - lon) > 0.4 || /airport|aeroporto/i.test(r[4] || '')) continue;
      var d = km(lat, lon, r[2], r[3]); if (d < d0 - 0.15 && String(r[0]) !== String(st.id)) near++; if (near >= 2) break; }
    return (MEMO[k] = near < 2 ? 'aid' : ''); };
  window.__wfIncLatLon = function (x, y) { return [LAT(y), LON(x)]; };
  // (Oct 8) The station responsible for a place outside this station's area: the nearest other station (not an airport base), or null while loading
  window.__wfNearestStation = function (lat, lon, exceptId, cc) { var S = stations(cc || 'us'); if (!S || !isFinite(lat) || !isFinite(lon)) return null; var best = null, bd = 1e9;
    for (var i = 0; i < S.length; i++) { var r = S[i]; if (String(r[0]) === String(exceptId) || /airport|aeroporto|heliport|heliporto/i.test(r[4] || '') || Math.abs(r[2] - lat) > 1 || Math.abs(r[3] - lon) > 1.2) continue;
      var d = km(lat, lon, r[2], r[3]); if (d < bd) { bd = d; best = r; } }
    return best ? { id: best[0], type: best[1], lat: best[2], lon: best[3], name: best[4] || 'Fire station', km: bd } : null; };
  // An incident chat is this station's (its area or mutual aid), from where the incident is
  window.__wfChatIsOurs = function (c, st) { if (!c) return false; var ll = c.x != null && c.y != null ? [LAT(c.y), LON(c.x)] : [c.lat, c.lon]; return !!window.__wfIncidentFor(ll[0], ll[1], st); };
  // One tag for both places (the list and the map tooltip), so the list says what the map's ring says
  window.__wfAidTag = function () { var PT = window.__wfLang === 'pt'; return { label: PT ? 'Auxílio' : 'Mutual aid', fg: '#3A3A3C', bg: 'rgba(118,118,128,0.14)' }; };
  // (Oct 7, 19:40) Incident chats are between station captains, and only when two or more stations are on the fire. Team leads
  // are not in them (they get the order and confirm it). A fire worked by one station has no chat. (Supersedes "never fewer
  // than two stations": the second station is not forced.) Before any order (a candidate) the nearest stations' leads talk.
  window.__wfChatAllowed = function (c) { var k = rid(); if (signed() && k === 'ff') return false; if (!c) return true;
    var S = {}; (c.forces || []).forEach(function (f) { if (f.st !== 'standby' && f.st !== 'released') S[f.ck || f.station] = 1; });
    var n = Object.keys(S).length; if ((c.flags && c.flags.dispatched) || n) return n >= 2; return true; };
  window.addEventListener('wf-starea', function () { MEMO = {}; });
})();
