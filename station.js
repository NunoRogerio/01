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
  // (Oct 8, 19:10) and the team lead's own crew, fixed, so nobody in it turns up elsewhere as another station's captain
  var CREW11B = ['Kevin Marsh', 'Ana Ruiz', 'Ben Ortega'];   /* (Oct 8, 21:54) Station 11's second crew (Brush 11), led by Lieutenant Kevin Marsh */
  var CREW11 = ['Daniel Brooks', 'Laura Chen', 'Tom Alvarez', 'Lisa Wong'], ST11P = { 'Laura Chen': 'train', 'Tom Alvarez': 'sick' };   /* the shift: Chen in training, Alvarez on sick leave */
  window.__wfStaffOf = function (id) { return String(id) === String(ST11.id) ? { captain: 'Frank Ortiz', lead: 'Daniel Brooks', lead2: 'Kevin Marsh', crew2: CREW11B.slice(), crew: CREW11.slice(), state: Object.assign({}, ST11P),
    onDuty: CREW11.filter(function (n) { return !ST11P[n]; }) } : null; };
  /* (Oct 9, 06:52) Station 11's fleet, one list for every screen (the station's Resources, the crews, the captain's dispatch):
     a plausible LA County engine company station in the foothills (no hand crew and no aircraft of its own: hand crews live
     at the fire camps, helicopters at the county's air operations). Who rides each unit, from the station's own roster. */
  /* (Oct 9, 11:09) the station fleet icons (command, engine, patrol, tender, squad...): the station resource list and the dispatch blade show the same ones */
  window.__wfFleetIC = {
    cmd: 'M3 15.5v-3l2.2-4.5h9.6l2.7 4.5h3.5v3Z M6.5 17.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0 M15 17.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0 M10 5h3 M11.5 5v3',
    eng: 'M2.5 8.5h10v8h-10Z M12.5 11h4.3l2.7 3v2.5h-7Z M3.5 6.5h8 M5.5 6.5v2 M8 6.5v2 M10.5 6.5v2 M4.5 17.8a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M14.5 17.8a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0',
    pick: 'M2.5 12h8.5V8.5h5l3 3.5h2.5v4h-19Z M5 16.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M15 16.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M4 12V9.5h5V12',
    tank: 'M5 8h7.5a2.5 2.5 0 0 1 2.5 2.5v5H2.5v-5A2.5 2.5 0 0 1 5 8Z M15 11h3l2.5 3v1.5H15 M5 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M15.5 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0',
    bus: 'M2.5 7h15l3 4v5h-18Z M5 10h3 M10 10h3 M5.5 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M15 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0',
    amb: 'M2.5 7h11v9h-11Z M13.5 10h4l3 3.2V16h-7 M6 11.5h4 M8 9.5v4 M5 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0 M15.5 17.3a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0',
    heli: 'M3 5.5h14 M10 5.5v2.5 M7 8h6.5a3.5 3.5 0 0 1 0 7H10a4 4 0 0 1-3-7Z M17 11.5h4.5 M21.5 9.5v4 M7.5 18.5h8 M9.5 15v3.5 M13.5 15v3.5',
    crew: 'M9 11a3 3 0 1 0 0-6a3 3 0 1 0 0 6Z M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M15.5 10.5a2.5 2.5 0 1 0 0-5 M17.5 14c2 .4 3.5 2.2 3.5 5'
  };
  var FLEET11 = [
    { id: 'battalion', name: 'Battalion 11', ic: 'cmd', en: 'Command vehicle. Battalion chief Robert Hale.', pt: 'Veículo de comando. Chefe de batalhão Robert Hale.', crew: ['Robert Hale'], rank: { en: 'Battalion chief', pt: 'Chefe de batalhão' } },
    { id: 'engine', name: 'Engine 11', ic: 'eng', en: 'Type 1 engine. 500 gal. 4 seats.', pt: 'Autobomba tipo 1. 1 900 L. 4 lugares.', lt: 'Daniel Brooks', crew: CREW11.filter(function (n) { return !ST11P[n]; }) },
    { id: 'brush', name: 'Brush 11', ic: 'eng', en: 'Type 3 wildland engine. 500 gal. 4 seats.', pt: 'Autobomba florestal tipo 3. 1 900 L. 4 lugares.', lt: 'Kevin Marsh', crew: CREW11B.slice() },
    { id: 'patrol', name: 'Patrol 11', ic: 'pick', en: 'Type 6 engine. 300 gal. 3 seats.', pt: 'Autobomba tipo 6. 1 100 L. 3 lugares.', crew: ['Marcus Reed', 'Sofia Lin'] },
    { id: 'tender', name: 'Water Tender 11', ic: 'tank', en: 'Water tender. 2,000 gal. 2 seats.', pt: 'Autotanque. 7 500 L. 2 lugares.', crew: [], st: 'maint', days: 3 },
    { id: 'squad', name: 'Squad 11', ic: 'amb', en: 'Paramedic squad. 2 seats.', pt: 'Equipa de paramédicos. 2 lugares.', crew: ['Grace Kim', 'Omar Haddad'] }];
  window.__wfFleet = function (id) { return String(id) === String(ST11.id) ? FLEET11.map(function (u) { return Object.assign({}, u, { crew: u.crew.slice() }); }) : null; };
  // Names that belong to the profile station: the incident chats never give them to anyone else
  window.__wfReservedNames = function () { var R = { 'Frank Ortiz': 1 }; CREW11.concat(CREW11B).forEach(function (n) { R[n] = 1; }); FLEET11.forEach(function (u) { u.crew.forEach(function (n) { R[n] = 1; }); }); try { (JSON.parse(localStorage.getItem('wf-st-reserved') || '[]') || []).forEach(function (n) { R[n] = 1; }); } catch (e) {} return R; };
  // (Oct 8, 14:35) Simulated incidents in the station's area, so the captain and the team lead always have a story to work:
  // one fire (a copy of a real Los Angeles County fire's data, moved into the area and renamed) and one ignition candidate
  // (a copy of a real satellite detection, moved into the area). Marked sim: shown with the simulation star. Station profiles only.
  var SIMF = { id: 'SIM-ST11-F1', name: 'Rubio Fire', near: 'Rubio Canyon, above Altadena', lat: 34.2005, lon: -118.1225, ac: 38, pc: 0, minAgo: 52 };
  var SIMC = { lat: 34.2052, lon: -118.1498, place: 'Altadena', near: '2.5 km northwest of Altadena', conf: 88, minAgo: 12 };
  /* (Oct 8, 22:21; 22:48) New simulated incidents in the area: when the station's To do has no incident and the screen has been
     left alone for 5 s, a new round comes up: 1 to 2 fires (at First alert) and 1 to 3 ignition candidates, picked at random
     from the places below, with a notification banner for each. Rounds are kept on this phone (wf-sim-rounds); round 0 is the
     Rubio Fire and the Altadena candidate. Each fire follows its own lifecycle from the captain's dispatch. */
  var PF = [
    { name: 'Farnsworth Fire', near: 'Farnsworth Park, Altadena', lat: 34.2045, lon: -118.1385, ac: 4 },
    { name: 'Loma Alta Fire', near: 'Loma Alta Drive, Altadena', lat: 34.1990, lon: -118.1580, ac: 6 },
    { name: 'Lake Fire', near: 'North Lake Avenue, Altadena', lat: 34.1880, lon: -118.1310, ac: 3 },
    { name: 'Millard Fire', near: 'Millard Canyon, north Altadena', lat: 34.2085, lon: -118.1560, ac: 5 },
    { name: 'Mendocino Fire', near: 'Mendocino Street, Altadena', lat: 34.1930, lon: -118.1450, ac: 2 },
    { name: 'Woodbury Fire', near: 'Woodbury Road, Altadena', lat: 34.1850, lon: -118.1420, ac: 3 },
    { name: 'Allen Fire', near: 'Allen Avenue, east Altadena', lat: 34.1900, lon: -118.1130, ac: 7 },
    { name: 'Chaney Fire', near: 'Chaney Trail, above Altadena', lat: 34.2120, lon: -118.1480, ac: 9 },
    { name: 'Lincoln Fire', near: 'Lincoln Avenue, west Altadena', lat: 34.1880, lon: -118.1600, ac: 4 },
    { name: 'Marengo Fire', near: 'Marengo Avenue, Altadena', lat: 34.1890, lon: -118.1470, ac: 3 },
    { name: 'Canyon Crest Fire', near: 'Canyon Crest Road, east Altadena', lat: 34.1960, lon: -118.1150, ac: 6 },
    { name: 'Poppy Peak Fire', near: 'Poppy Peak Drive, Altadena', lat: 34.1990, lon: -118.1410, ac: 5 },
    { name: 'Sphinx Fire', near: 'Sphinx Rock trail, above Altadena', lat: 34.2110, lon: -118.1520, ac: 8 },
    { name: 'Glen Canyon Fire', near: 'Glen Canyon Road, Altadena', lat: 34.1930, lon: -118.1290, ac: 4 }];
  /* (Oct 9, 13:47) every candidate has its own place name, so no two incidents ever share a name ("Altadena" only for the first) */
  var PC = [
    { name: 'Millard Canyon', near: 'Millard Canyon, north Altadena', lat: 34.2090, lon: -118.1600 },
    { name: 'Echo Mountain', near: 'Echo Mountain trail, above Altadena', lat: 34.2100, lon: -118.1300 },
    { name: 'Arroyo Seco', near: 'Arroyo Seco edge, west Altadena', lat: 34.1960, lon: -118.1620 },
    { name: 'Eaton Canyon', near: 'Eaton Canyon edge, east Altadena', lat: 34.1950, lon: -118.1080 },
    { name: 'Altadena Golf Course', near: 'Altadena Golf Course', lat: 34.1840, lon: -118.1270 },
    { name: 'Zane Grey Terrace', near: 'Zane Grey Terrace, north Altadena', lat: 34.2060, lon: -118.1440 },
    { name: 'Altadena Drive', near: 'Altadena Drive, east Altadena', lat: 34.1870, lon: -118.1180 },
    { name: 'Christmas Tree Lane', near: 'Christmas Tree Lane, Altadena', lat: 34.1860, lon: -118.1530 },
    { name: 'Rubio Canyon', near: 'Rubio Canyon trailhead, Altadena', lat: 34.2040, lon: -118.1230 },
    { name: 'Las Flores Canyon', near: 'Las Flores Canyon, north Altadena', lat: 34.2070, lon: -118.1340 },
    { name: 'Hahamongna', near: 'Hahamongna Watershed Park, west Altadena', lat: 34.2000, lon: -118.1700 },
    { name: 'Sunset Ridge', near: 'Sunset Ridge trail, above Altadena', lat: 34.2150, lon: -118.1440 },
    { name: 'Kinneloa Mesa', near: 'Kinneloa Mesa, east Altadena', lat: 34.1980, lon: -118.1040 },
    { name: 'Mount Lowe Road', near: 'Mount Lowe Road, above Altadena', lat: 34.2130, lon: -118.1380 }];
  var LET = ['', 'b', 'c'];
  function rounds() { var R = []; try { R = JSON.parse(localStorage.getItem('wf-sim-rounds') || '[]') || []; } catch (e) {} return Array.isArray(R) ? R : []; }
  /* (Oct 8, 22:43) the first pair's clock is kept too (when this phone first saw it), so signing out and in again never restarts the story */
  function t0() { var t = 0; try { t = +localStorage.getItem('wf-sim-t0') || 0; if (!t) { t = Date.now(); localStorage.setItem('wf-sim-t0', String(t)); } } catch (e) { t = Date.now(); } return t; }
  // every simulated fire and candidate so far, round by round (rounds saved before 22:48 had one of each)
  function fireDefs(R) { var out = [{ n: 0, id: SIMF.id, name: SIMF.name, near: SIMF.near, lat: SIMF.lat, lon: SIMF.lon, ac: SIMF.ac, pc: SIMF.pc, sc: 6, st: 'Active', stEn: SIMF.pc + '% contained', startMs: t0() - SIMF.minAgo * 6e4, minAgo: SIMF.minAgo }];
    R.forEach(function (q, i) { var n = i + 1, at = q.at || Date.now(), F = q.f || [(n - 1) % 3];
      F.forEach(function (fi, k) { var v = PF[fi % PF.length], a = (q.fa && q.fa[k]) || at + k; out.push({ n: n, id: 'SIM-ST11-F' + (n + 1) + LET[k], name: v.name, near: v.near, lat: v.lat, lon: v.lon, ac: v.ac, pc: 0, sc: 4, st: 'New', stEn: 'First alert', startMs: a - 6 * 6e4, at: a }); }); });
    return out; }
  function candDefs(R) { var out = [{ n: 0, id: 'HS-SIM-ST11', lat: SIMC.lat, lon: SIMC.lon, place: SIMC.place, near: SIMC.near, conf: SIMC.conf, t: t0() - SIMC.minAgo * 6e4, minAgo: SIMC.minAgo }];
    R.forEach(function (q, i) { var n = i + 1, at = q.at || Date.now(), K = q.c || [(n - 1) % 3];
      K.forEach(function (ci, k) { var v = PC[ci % PC.length], a = (q.ca && q.ca[k]) || at + 10 + k; out.push({ n: n, id: 'HS-SIM-ST11-' + (n + 1) + LET[k], lat: v.lat, lon: v.lon, place: v.name || 'Altadena', near: v.near, conf: (q.conf && q.conf[k]) || [81, 76, 84][(n - 1) % 3], t: a - 2 * 6e4, at: a }); }); });
    return out; }
  function chatOf(kind, id) { var C = window.__wfChat; return C && C.find ? C.find({ id: id, kind: kind }) : null; }
  window.__wfSim = function () { var M = window.__wfMine ? window.__wfMine() : null; if (!M) return;
    var F = window.__wfLiveFires, C = window.__wfLiveCands, now = Date.now(), R = rounds();
    fireDefs(R).forEach(function (D) { var n = D.n, fc = chatOf('fire', D.id);
      if (F) { var ex = F.find(function (r) { return r && r[2] === D.id; });
        if (!ex) {
          var T = F.find(function (r) { return r && r[0] === 'CA' && /^Los Angeles/.test(r[1] || '') && !/^SIM-/.test(r[2] || ''); }) || F.find(function (r) { return r && r[0] === 'CA'; }) || F[0];
          var r = T ? JSON.parse(JSON.stringify(T)) : ['CA', 'Los Angeles', '', '', '', 0, 0, { man: 0, terrain: 0, aerial: 0, est: true }, 0, {}, ''];
          var ha = Math.round(D.ac * 0.4047 * 10) / 10, k = T && T[8] ? Math.max(0.05, ha / T[8]) : 1;
          r[0] = 'CA'; r[1] = 'Los Angeles'; r[2] = D.id; r[3] = D.name; r[4] = (n ? 'New' : 'Contained ' + D.pc + '%') + ' · ' + D.ac + ' ac';
          r[5] = Math.round(X(D.lon)); r[6] = Math.round(Y(D.lat)); r[8] = ha; r[10] = D.near;
          if (r[7] && typeof r[7] === 'object') ['man', 'terrain', 'aerial'].forEach(function (q) { if (typeof r[7][q] === 'number') r[7][q] = Math.max(q === 'aerial' ? 0 : 1, Math.round(r[7][q] * k)); });
          r[9] = Object.assign({}, r[9] || {}, { src: 'Simulation', st: D.st, stEn: D.stEn, tone: 'red', sc: D.sc, pc: D.pc, startMs: D.startMs || now - D.minAgo * 6e4, updMs: D.at || now - 6e4 * 4, ac: D.ac, ha: ha, resolved: false, heldMs: null, heldSrc: '', place: 'Los Angeles County · CA', url: '', sim: true, simAt: D.at || 0, lat: D.lat, lon: D.lon });
          F.push(r); ex = r; }
        if (ex[9]) { ex[9].resolved = !!(fc && fc.closed); if (fc && fc.closed) { ex[9].heldMs = ex[9].heldMs || fc.updated || now; ex[9].heldSrc = 'chat'; } }   /* a closed simulated fire leaves the lists; its chat keeps the record */
        /* (Oct 10, 21:09) resolved, it stays on the map as a resolved fire for 7 days, then leaves it */
        if (fc && fc.closed && now - (fc.updated || now) > 7 * 864e5) { var ix2 = F.indexOf(ex); if (ix2 >= 0) F.splice(ix2, 1); } } });
    candDefs(R).forEach(function (Q) { var cc = chatOf('cand', Q.id);
      if (C && !(cc && (cc.closed || cc.dismissed)) && !C.some(function (r) { return r && r[2] === Q.id; })) {
        var TC = C.find(function (r) { return r && r[0] === 'CA' && !/^HS-SIM-/.test(r[2] || ''); }) || C[0];
        var c = TC ? JSON.parse(JSON.stringify(TC)) : ['CA', 'Los Angeles', '', '', 0, 'sat:VIIRS NOAA-20', '', 0, 0, {}];
        var tms = Q.t || now - Q.minAgo * 6e4, t = new Date(tms).toISOString().slice(0, 16) + 'Z', ago = Math.max(1, Math.round((now - tms) / 6e4));
        c[0] = 'CA'; c[1] = 'Los Angeles'; c[2] = Q.id; c[3] = Q.place; c[4] = Q.conf; c[6] = ago + ' min ago'; c[7] = Math.round(X(Q.lon)); c[8] = Math.round(Y(Q.lat));
        c[9] = Object.assign({}, c[9] || {}, { lat: Q.lat, lon: Q.lon, t: t, ll: Q.lat.toFixed(2) + '°N ' + Math.abs(Q.lon).toFixed(2) + '°W', near: Q.near, night: window.__wfSunAlt ? window.__wfSunAlt(Q.lat, Q.lon, now) < -0.833 : false, sim: true, simAt: Q.at || 0 });
        C.push(c); }
      else if (C && cc && (cc.closed || cc.dismissed)) { var ix = C.findIndex(function (r) { return r && r[2] === Q.id; }); if (ix >= 0) C.splice(ix, 1); } });   /* dismissed or closed: Resolved lists it from its chat */
    setTimeout(function () { try { window.__wfSimChat(); } catch (e) {} }, 0); };
  // (Oct 8, 17:55) The simulated fire is being fought, so the story agrees everywhere: crews on scene (stage 3), Station 11 among
  // the two stations working it (its first crew, the team lead's Engine 11 crew, on scene), its incident record made at once (not
  // only when someone opens the fire), and the team lead's order already confirmed (he has been on scene since).
  // (Oct 8, 22:21) each new round's fire gets its record too, at First alert: the captain dispatches it from there
  window.__wfSimChat = function () { var C = window.__wfChat, M = window.__wfMine ? window.__wfMine() : null; if (!C || !C.ensure || !M) return;
    /* (Oct 9, 13:47) candidates saved under the shared name "Altadena" take their own place name */
    if (C.rename) candDefs(rounds()).forEach(function (Q) { if (!Q.n) return; var cc = chatOf('cand', Q.id); if (cc && cc.place !== Q.place) C.rename(cc.key, Q.place); });
    fireDefs(rounds()).forEach(function (D) {
      var r = (window.__wfLiveFires || []).find(function (q) { return q && q[2] === D.id; }); if (!r || C.find({ id: D.id, kind: 'fire' })) return;
      var I = r[9] || {}, c = C.ensure({ kind: 'fire', id: D.id, place: D.name, reg: 'Los Angeles', st: 'CA', lat: D.lat, lon: D.lon, note: (I.stEn || 'Active') + ' · Simulation', sc: D.sc, x: r[5], y: r[6], startMs: I.startMs, ha: I.ha, res: r[7] || null });
      if (!D.n && c && window.__wfDeploy && window.__wfDeploy.ack) window.__wfDeploy.ack(c.key); }); };
  // A new round: 1-2 fires and 1-3 candidates at places not in use; returns what came up (for the banners)
  window.__wfSimSpawn = function (extra) { var R = rounds(), now = Date.now(), live = {}, rnd = function (n) { return Math.floor(Math.random() * n); };
    /* (Oct 9, 13:47) a place already used (live, closed or dismissed) is never picked again, so the lists never show two incidents with one name */
    fireDefs(R).forEach(function (d) { live['f' + d.name] = 1; });
    candDefs(R).forEach(function (d) { live['c' + d.near] = 1; live['c' + d.place] = 1; });
    var pick = function (P, key, n) { var idx = P.map(function (x, i) { return i; }).filter(function (i) { return !live[key + P[i].name] && !live[key + P[i].near]; }), out = [];
      while (out.length < n && idx.length) out.push(idx.splice(rnd(idx.length), 1)[0]); return out; };
    var f = pick(PF, 'f', 1 + rnd(2)), c = pick(PC, 'c', 1 + rnd(3)); if (!f.length && !c.length) return [];
    /* (Oct 9, 11:00) a round no longer lands all at once: its incidents come up one by one, the first now, each next one
       0 to 10 s (at random) after the one before, each with its own notification; an extra (a help request) joins the queue */
    var Q = f.map(function (i) { return { t: 'f', i: i }; }).concat(c.map(function (i) { return { t: 'c', i: i, conf: 62 + rnd(34) }; }));
    for (var z = Q.length - 1; z > 0; z--) { var y = rnd(z + 1), tmp = Q[z]; Q[z] = Q[y]; Q[y] = tmp; }
    if (typeof extra === 'function') Q.splice(1 + rnd(Q.length), 0, { t: 'x', fn: extra });
    R.push({ at: now, f: [], c: [], conf: [], fa: [], ca: [] }); var ri = R.length - 1; try { localStorage.setItem('wf-sim-rounds', JSON.stringify(R)); } catch (e) {}
    var add = function (it) {
      if (it.t === 'x') { var x = null; try { x = it.fn(); } catch (e) {} return x ? [x] : []; }
      var R2 = rounds(), q = R2[ri]; if (!q) return []; var t = Date.now(), n = ri + 1;
      if (it.t === 'f') { q.f.push(it.i); (q.fa = q.fa || []).push(t); } else { q.c.push(it.i); (q.conf = q.conf || []).push(it.conf); (q.ca = q.ca || []).push(t); }
      try { localStorage.setItem('wf-sim-rounds', JSON.stringify(R2)); } catch (e) {}
      try { window.__wfSim(); window.__wfWorld = null; window.__wfGeo = null; window.dispatchEvent(new Event('wf-sync')); } catch (e) {}
      if (it.t === 'f') { var D = fireDefs(R2).filter(function (d) { return d.n === n; }).pop(); return D ? [{ kind: 'fire', d: D }] : []; }
      var Cd = candDefs(R2).filter(function (d) { return d.n === n; }).pop(); return Cd ? [{ kind: 'cand', d: Cd }] : []; };
    var first = add(Q.shift());
    (function next() { if (!Q.length) return; setTimeout(function () { var it = Q.shift(); try { banners(add(it)); } catch (e) {} next(); }, rnd(10001)); })();
    return first; };
  /* Notification banners, as the phone's own: they drop in from the top one under the other, glass, the incident's marker, what
     happened and "now"; a tap opens the incident's chat, a swipe up puts them away (they never leave on their own). Their notifications stay in the bell. */
  function banners(list) { var host = document.getElementById('dc-root'); if (!host || !list.length) return; var PT = window.__wfLang === 'pt';
    var box = document.getElementById('wf-nbx'); if (!box) { box = document.createElement('div'); box.id = 'wf-nbx'; box.style.cssText = 'position:absolute;left:8px;right:8px;top:calc(var(--wf-top, 0px) + 56px);z-index:2147481000;display:flex;flex-direction:column;gap:8px;pointer-events:none'; host.appendChild(box); }
    /* (Oct 9, 13:52) 24px under the screen's fixed header bar (never over it); many of them overlap gradually, each next one showing 24px under the one before */
    (function place() { var H = host.querySelector('.wf-darkhdr') || host.querySelector('[data-wf-keepsp]'), k = host.getBoundingClientRect().height / (host.offsetHeight || 1) || 1;
      if (H) box.style.top = Math.round((H.getBoundingClientRect().bottom - host.getBoundingClientRect().top) / k + 24) + 'px';
      Array.prototype.forEach.call(box.children, function (c, j) { c.style.marginTop = j >= 3 ? (-(c.offsetHeight || 96) + 16) + 'px' : ''; c.style.zIndex = String(10 + j); c.style.position = 'relative'; });
      if (!box.__pl) { box.__pl = setInterval(place, 500); } })();
    list.forEach(function (it, i) { setTimeout(function () { var d = it.d, fire = it.kind === 'fire', C = window.__wfChat;
      var b = document.createElement('div'); b.setAttribute('role', 'button'); b.setAttribute('tabindex', '0'); d = d || {};
      b.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:16px;padding:16px;border-radius:24px;background:color-mix(in srgb, var(--wf-surface, #FFFFFF) 72%, transparent);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.16);transform:translateY(-140%);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .4s ease;cursor:pointer;touch-action:none';
      var mk = fire ? '<circle cx="7" cy="7" r="4.8" fill="#E8590C"></circle>' : '<circle cx="7" cy="7" r="4.8" fill="color-mix(in srgb, var(--wf-y, #E5FF00) 80%, transparent)" stroke="#3A3A3C" stroke-width="1.6"></circle>';
      var hq = it.kind === 'help', hc = it.c || {}, hp = (hc.people || [])[0] || {};
      var ttl = hq ? (PT ? 'Pedido de ajuda. ' : 'Help request. ') + (hc.reg || hp.name || '') : fire ? d.name + (PT ? ': Primeiro alerta' : ': First alert') : (PT ? 'Nova deteção de ignição' : 'New ignition detection');
      var txt = hq ? hp.name + ': ' + (PT ? 'Podem enviar um veículo e uma equipa para o ' : 'Could you send an engine and a crew to the ') + ((hc.topic || {}).place || '') + '?' : fire ? d.near + '. ' + d.ac + ' ac.' : (d.place || 'Altadena') + '. ' + d.conf + (PT ? '% de probabilidade. ' : '% likelihood. ') + d.near + '.';
      b.innerHTML = '<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex-shrink:0;border-radius:50%;background:' + (fire ? '#FCE9E1' : '#ECECEF') + '"><svg width="20" height="20" viewBox="0 0 14 14">' + mk + '</svg></span>' +
        '<span style="display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 auto"><span style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:16px;line-height:20px;font-weight:600;color:var(--wf-ink, #1C1C1E);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ttl + '</b><span style="font-size:13px;line-height:20px;color:var(--wf-ink2, #6E6E73);flex-shrink:0">' + (PT ? 'agora' : 'now') + '</span></span>' +
        '<span style="font-size:16px;line-height:20px;color:var(--wf-ink, #3A3A3C);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden">' + txt + '</span></span>';
      b.setAttribute('aria-label', ttl + '. ' + txt);
      var gone = false, out = function () { if (gone) return; gone = true; b.style.transform = 'translateY(-140%)'; b.style.opacity = '0'; setTimeout(function () { b.remove(); }, 520); };
      var y0 = null; b.addEventListener('pointerdown', function (e) { y0 = e.clientY; }); b.addEventListener('pointerup', function (e) { var dy = y0 == null ? 0 : e.clientY - y0; y0 = null; if (dy < -20) { out(); return; }
        out(); try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {}
        try { if (!C) return; var c = hq ? hc : fire ? C.find({ id: d.id, kind: 'fire' }) : null;
          if (!c && !fire && !hq && C.incCand && C.open) { var r = (window.__wfLiveCands || []).find(function (q) { return q && q[2] === d.id; }); if (r) c = C.open(C.incCand({ id: r[2], place: r[3], conf: r[4], src: r[5], x: r[7], y: r[8], live: r[9] || null, st: r[0], co: r[1] })); }
          if (c) { sessionStorage.setItem('wf-chat-open', c.key); location.href = 'Chat.dc.html'; } } catch (x) {} });
      box.appendChild(b); requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.transform = 'none'; b.style.opacity = '1'; }); });
      try { if (navigator.vibrate) navigator.vibrate([10, 60, 10]); } catch (x) {}
      /* (Oct 9, 13:52) no auto-dismiss: a banner stays until it is put away (swipe up) or tapped to open its incident */ }, i * 700); }); }
  // Left alone 5 s on the station's home with no incident to do: the next round comes up
  (function () { if (!/Station\.dc\.html/.test(location.pathname) || !/[?&]home=1/.test(location.search)) return;
    var last = Date.now(), busy = false, poke = function () { last = Date.now(); };
    ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'].forEach(function (ev) { window.addEventListener(ev, poke, { passive: true, capture: true }); });
    setInterval(function () { if (busy || document.visibilityState === 'hidden' || Date.now() - last < 5000) return; if (!(window.__wfMine && window.__wfMine())) return;
      if (window.__wfTodoInc == null || window.__wfTodoInc > 0) return; if (document.querySelector('.wf-cfm,[data-wf-tour-on]')) return;
      busy = true; var L = [], help = window.__wfHelpIn && Math.random() < 0.5 ? function () { var hc = window.__wfHelpIn(); return hc ? { kind: 'help', c: hc } : null; } : null; try { L = window.__wfSimSpawn(help) || []; } catch (e) {}   /* (Oct 8, 22:52) sometimes the station on a fire outside our area asks us for help */
      banners(L); last = Date.now(); setTimeout(function () { busy = false; }, 3000); }, 1000); })();
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
  // (Oct 8, 18:50) supersedes "team leads are not in them": the team lead on the fire is an active member (writes, reports; does not decide)
  window.__wfChatAllowed = function (c) { if (!c) return true;
    /* (Oct 8, 21:54) two crews on the fire (two stations, or one station's two crews with their lieutenants and its captain) */
    var S = {}; (c.forces || []).forEach(function (f, i) { if (f.st !== 'standby' && f.st !== 'released') S[(f.ck || f.station) + (f.second ? ':2' : '')] = 1; });
    var n = Object.keys(S).length; if ((c.flags && c.flags.dispatched) || n) return n >= 2; return true; };
  window.addEventListener('wf-starea', function () { MEMO = {}; });
})();
