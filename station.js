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
  window.__wfHomeUrl = function () { return window.__wfMine() ? 'Station.dc.html?home=1' : 'Main.dc.html'; };

  // ---- the station's area (OpenStreetMap boundary), kept 30 days on this phone ----
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
  function q(s) { return fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(s)).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  window.__wfStationArea = function (st) {
    if (!st) return null; var id = String(st.id);
    if (AREA[id]) return AREA[id];
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
  // One tag for both places (the list and the map tooltip), so the list says what the map's ring says
  window.__wfAidTag = function () { var PT = window.__wfLang === 'pt'; return { label: PT ? 'Auxílio' : 'Mutual aid', fg: '#3A3A3C', bg: 'rgba(118,118,128,0.14)' }; };
  window.addEventListener('wf-starea', function () { MEMO = {}; });
})();
