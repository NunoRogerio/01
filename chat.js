// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Incident chats (demonstration). One chat per incident gathers you, the fire owner, and the crew coordinator of each
// fire station involved. The system posts a card at every change of state; scripted coordinators answer your messages
// and your actions in character (each with their own voice, reading what you wrote and the state of the fire), and
// report progress on their own as the fire evolves, so it can be followed from ignition candidate to closed.
// Simulated clock: replies arrive in seconds but are stamped minutes later, and a change of state jumps the fire's
// clock by the hours or days such a stage plausibly takes, so the timeline of the fire reads like a real one.
// Chats are kept on this phone, per signed-in profile. Stations are real (OpenStreetMap); people, vehicles, times and
// the figures of the resolution summary are a scripted demonstration.
(function () {
  if (window.__wfChat) return;
  var role = ''; try { role = localStorage.getItem('wf-role') || ''; } catch (e) {}
  var KEY = 'wf-chats3-' + (role || 'anon'), ACH = 'wf-achv';
  var PT = function () { return window.__wfLang === 'pt'; };
  // The language the role-played crews write in: the app's language (Oct 3, 18:13: more languages)
  var LNAME = function (full) { var l = window.__wfLang || 'en', M = { pt: ['European Portuguese (pt-PT)', 'Portuguese bombeiros'], es: ['Spanish (es-ES)', 'Spanish bomberos'], fr: ['French (fr-FR)', 'French sapeurs-pompiers'],
      de: ['German (de-DE)', 'German Feuerwehr'], ja: ['Japanese (ja-JP)', 'Japanese fire services'] }, m = M[l];
    return m ? m[0] + (full ? ', fireground vocabulary used by ' + m[1] : '') : 'English'; };
  var L = function (en, pt) { return PT() && pt ? pt : (window.__wfJA ? window.__wfJA(en) : en); };
  var MIN = 60000;

  // ---- stages (ANEPC vocabulary), each with its colour, light background and icon --------------------------------
  var STAGES = [
    { en: 'Ignition candidate', pt: 'Candidato a ignição', c: '#3A3A3C', bg: '#F7FCDC', icon: 'cand' },   // the dark outline circle as on the map, on the spectrum's lightest lime (lighter than First alert, which is a true yellow)
    // The stages run along one spectrum: yellow (first alert), orange, red-orange, blue, light green, dark green, grey (closed)
    { en: 'First alert', pt: 'Despacho de 1.º alerta', c: '#6B5200', bg: '#FFF1A0', icon: 'alert' },
    { en: 'Ongoing', pt: 'Em curso', c: '#8A4B00', bg: '#FDE7C4', icon: 'route' },
    { en: 'Crews on scene', pt: 'Chegada ao TO', c: '#B3261E', bg: '#FBE1DC', icon: 'flame' },
    { en: 'Resolving', pt: 'Em resolução', c: '#1F64A6', bg: '#E3EEFB', icon: 'shield' },
    { en: 'Concluding', pt: 'Em conclusão', c: '#2F6B12', bg: '#E2F2D2', icon: 'drop' },
    { en: 'Surveillance', pt: 'Vigilância', c: '#14532D', bg: '#CFE5D6', icon: 'eye' },
    { en: 'Closed', pt: 'Encerrada', c: '#48484A', bg: '#E0E0E5', icon: 'done' }
  ];
  var DISMISSED = { en: 'Dismissed', pt: 'Descartado', c: '#545458', bg: '#ECECEF', icon: 'x' };
  // 24-unit stroke icons (the candidate is an outline circle, like its map marker)
  var ICON = {
    cand: 'M12 5.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13Z',
    alert: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z M10 20.5a2 2 0 0 0 4 0',
    route: 'M2.5 7h11v9.5h-11Z M13.5 10h4l3 3.2v3.3h-7 M5.3 18.6a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0 M15.3 18.6a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0',
    flame: 'M12 2.8c1.2 3.6 5.2 5.6 5.2 10.4a5.2 5.2 0 0 1-10.4 0c0-2.6 1.4-3.8 2-5.2c.9 1.5 1.5 2 2.5 2.1c-.1-2.6-.4-4.6.7-7.3Z',
    shield: 'M12 3l7 2.8v5.4c0 4.4-3 7.9-7 9.8c-4-1.9-7-5.4-7-9.8V5.8Z M9 12l2.2 2.2L15.3 10',
    drop: 'M12 3.2c3.1 4 6.2 7.3 6.2 10.8a6.2 6.2 0 0 1-12.4 0c0-3.5 3.1-6.8 6.2-10.8Z M9.2 14.6a2.9 2.9 0 0 0 2.6 2.6',
    eye: 'M2.5 12s3.5-6.5 9.5-6.5s9.5 6.5 9.5 6.5s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z M12 9.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 1 0 0-5.6Z',
    done: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z M8 12.3l2.8 2.8l5.3-5.6',
    x: 'M7 7l10 10M17 7L7 17',
    trophy: 'M8 3.5h8v5.5a4 4 0 0 1-8 0Z M8 5.5H4.5v1.2A3.3 3.3 0 0 0 8 10 M16 5.5h3.5v1.2A3.3 3.3 0 0 1 16 10 M12 13v3.5 M8 20.5h8 M9.5 16.5h5v4h-5Z'
  };
  function stageOf(ch) { return ch.dismissed ? DISMISSED : STAGES[ch.stage] || STAGES[0]; }
  // ANEPC status code -> chat stage
  function stageFromCode(sc) { sc = Number(sc) || 0; return sc >= 10 ? 7 : sc === 9 ? 6 : sc === 8 ? 5 : sc === 7 ? 4 : sc === 6 ? 3 : sc === 5 ? 2 : sc >= 3 ? 1 : 2; }

  // ---- people ---------------------------------------------------------------------------------------------------
  var NAMES = {
    pt: ['João Matos', 'Ana Sousa', 'Pedro Lopes', 'Marta Ribeiro', 'Rui Carvalho', 'Inês Duarte', 'Tiago Ferreira', 'Sofia Martins', 'Nuno Almeida', 'Carla Neves',
      'Miguel Costa', 'Beatriz Santos', 'André Pereira', 'Rita Gomes', 'Luís Rodrigues', 'Catarina Silva', 'Hugo Fernandes', 'Joana Pinto', 'Ricardo Oliveira', 'Mariana Teixeira',
      'Bruno Correia', 'Filipa Moreira', 'Diogo Cardoso', 'Helena Rocha', 'Paulo Mendes', 'Vera Castro', 'Sérgio Batista', 'Patrícia Lima'],
    us: ['Mike Delgado', 'Sarah Kim', 'James Carter', 'Maria Lopez', 'David Nguyen', 'Emily Ross', 'Chris Walker', 'Ana Ramirez', "Kevin O'Brien", 'Laura Chen',
      'Daniel Brooks', 'Jessica Patel', 'Ryan Mitchell', 'Olivia Grant', 'Marcus Hill', 'Rachel Adams', 'Tom Alvarez', 'Nicole Baker', 'Steve Park', 'Hannah Cole',
      'Jorge Medina', 'Megan Price', 'Eric Foster', 'Lisa Wong', 'Brian Hayes', 'Amy Torres', 'Carlos Reyes', 'Kate Sullivan']
,
    br: ['Lucas Oliveira', 'Juliana Souza', 'Rafael Santos', 'Fernanda Lima', 'Gabriel Costa', 'Camila Rodrigues', 'Thiago Almeida', 'Larissa Pereira', 'Mateus Carvalho', 'Aline Gomes',
      'Felipe Barbosa', 'Bianca Ribeiro', 'Gustavo Araújo', 'Letícia Martins', 'Leonardo Rocha', 'Patrícia Dias', 'Vinícius Moreira', 'Natália Cardoso', 'Eduardo Teixeira', 'Priscila Nunes'],
    es: ['Javier García', 'Lucía Fernández', 'Carlos Martínez', 'María López', 'Alejandro Sánchez', 'Carmen Gómez', 'Pablo Ruiz', 'Elena Díaz', 'Sergio Moreno', 'Laura Jiménez',
      'Diego Álvarez', 'Ana Romero', 'Miguel Torres', 'Marta Navarro', 'Raúl Domínguez', 'Sara Gil', 'Andrés Vázquez', 'Paula Castro', 'Jorge Ramos', 'Isabel Ortega'],
    fr: ['Julien Martin', 'Camille Bernard', 'Nicolas Dubois', 'Claire Thomas', 'Antoine Robert', 'Julie Richard', 'Mathieu Petit', 'Émilie Durand', 'Thomas Leroy', 'Sophie Moreau',
      'Pierre Simon', 'Laura Laurent', 'Romain Lefebvre', 'Manon Michel', 'Hugo Garcia', 'Léa Roux', 'Maxime Fournier', 'Chloé Girard', 'Alexandre Bonnet', 'Sarah Mercier'],
    it: ['Marco Rossi', 'Giulia Russo', 'Luca Ferrari', 'Francesca Esposito', 'Andrea Bianchi', 'Chiara Romano', 'Matteo Colombo', 'Sara Ricci', 'Alessandro Marino', 'Elena Greco',
      'Davide Bruno', 'Martina Gallo', 'Simone Conti', 'Valentina De Luca', 'Federico Costa', 'Alessia Giordano', 'Stefano Mancini', 'Laura Rizzo', 'Giorgio Lombardi', 'Anna Moretti'],
    de: ['Lukas Müller', 'Anna Schmidt', 'Jonas Schneider', 'Lena Fischer', 'Felix Weber', 'Laura Meyer', 'Tobias Wagner', 'Julia Becker', 'Maximilian Schulz', 'Sarah Hoffmann',
      'Florian Koch', 'Katharina Bauer', 'Stefan Richter', 'Lisa Klein', 'Michael Wolf', 'Hannah Schröder', 'Daniel Neumann', 'Marie Schwarz', 'Jan Zimmermann', 'Sophie Braun'],
    el: ['Giorgos Papadopoulos', 'Maria Georgiou', 'Nikos Pappas', 'Eleni Nikolaou', 'Dimitris Vlachos', 'Katerina Oikonomou', 'Kostas Ioannou', 'Sofia Karagianni', 'Yannis Alexiou', 'Despina Makri',
      'Panagiotis Christou', 'Anna Dimitriou', 'Vasilis Petrou', 'Ioanna Antoniou', 'Christos Konstantinou', 'Georgia Stathopoulou', 'Thanasis Kyriakou', 'Eirini Zervou', 'Stavros Lambrou', 'Vicky Economou']
  };
  function initials(n) { return n.split(' ').filter(Boolean).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase(); }
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function shortStation(n) {
    return String(n || '').replace(/^Bombeiros Volunt[aá]rios (de |da |do |das |dos )?/i, 'BV ').replace(/^Associação Humanitária dos /i, '')
      .replace(/Los Angeles County Fire Department/i, 'LACoFD').replace(/Los Angeles Fire Department/i, 'LAFD').replace(/\bFire Station\b/i, 'Station').replace(/\s+/g, ' ').trim();
  }
  function ccOf(st) { return st === 'PT' ? 'pt' : (st === 'BRA' || st === 'AMZ') ? 'br' : /^[A-Z]{2}$/.test(st || '') ? 'us' : { CAN: 'ca', ESP: 'es', FRA: 'fr', ITA: 'it', GRC: 'gr' }[st] || 'pt'; }
  function isUS(c) { return ccOf(c.st) === 'us'; }
  // (Oct 3, 22:03) the person each station puts in the incident chat, by their real title: a company Captain in the US,
  // the crew chief (chefe de equipa) of the fire brigade elsewhere
  function leadRole(c) { return isUS(c) ? { en: 'Captain', pt: 'Capitão' } : { en: 'Crew chief', pt: 'Chefe de equipa' }; }
  // who is in the chat now: once the fire is declared, only the leads of the stations that were sent stay
  function active(c) { return (c.people || []).filter(function (p) { return !p.left; }); }
  // (Oct 4, 00:00) the air side of a fire in progress has its own lead in the chat: the Air Tactical Group Supervisor (US) or
  // the air operations coordinator (Coordenador de Meios Aéreos, Portugal and elsewhere); one per chat, never a station's
  function airLead(c) { var us = isUS(c), n = pickNames(c, 1, 'air')[0];
    return { name: n, code: initials(n), org: us ? (ccOf(c.st) === 'us' && c.st === 'CA' ? 'CAL FIRE Air Attack' : 'Air Attack') : 'ANEPC. Meios aéreos', kind: 'air',
      roleEn: us ? 'Air Tactical Group Supervisor' : 'Air operations coordinator', rolePt: us ? 'Supervisor de meios aéreos' : 'Coordenador de meios aéreos' }; }
  function wantsAir(c) { return !c.dismissed && c.kind !== 'dm' && !!(c.flags && c.flags.air); }   // (Oct 7) the air lead joins only when air resources were ordered (dispatch or Air support)
  function ensureAir(c) { if (!wantsAir(c) || (c.people || []).some(function (p) { return p.kind === 'air'; })) return false; c.people.push(airLead(c)); return true; }
  // Portraits for the team (illustrated, avatar.js), only on fires in California, Nevada and Portugal: each person in
  // their own service's uniform; coordinators wear the command helmet.
  var PHOTO_ST = { CA: 'us', PT: 'pt' };   // only Portugal and California chats show photos (a team of 8 each); the rest show initials
  function faceOfPolice(c) { if (!c.callFace) { c.callFace = ['police-a', 'police-b', 'police-c'][Math.floor(Math.random() * 3)]; try { save(); } catch (e) {} } return c.callFace; }
  function photoOf(c, name) {
    if (c && c.police) return 'assets/faces/' + faceOfPolice(c) + '.jpg?v=1';   // the police captain: a real photo (Unsplash), not a fire service face
    var team = c && PHOTO_ST[c.st];
    if (!team || !name || !window.__wfFacePick) return '';
    // each person in this chat gets a random photo of their gender from the team, never one already used in this chat
    var F = c.face || (c.face = {});
    // (Oct 4, 23:07) never the signed-in profile's own photo, never one another person here already has (older chats that
    // repeated one pick again), and the air lead gets a pilot
    var me = '', P0 = window.__wfPrefs && window.__wfPrefs.person; try { me = (P0 && window.__wfDemoFace && window.__wfDemoFace(P0.name)) || ''; } catch (e) {}
    var dup = F[name] && (F[name] === me || Object.keys(F).some(function (k) { return k !== name && k < name && F[k] === F[name]; }));
    var isAir = (c.people || []).some(function (p) { return p.name === name && p.kind === 'air'; }) || !!(c.air && c.air.pilot === name), wasAir = !!F['~air:' + name];
    if (!F[name] || dup || (isAir && !wasAir)) { var used = Object.keys(F).filter(function (k) { return k !== name && k.charAt(0) !== '~'; }).map(function (k) { return F[k]; }); if (me) used.push(me);
      F[name] = window.__wfFacePick(team, window.__wfGender(name) || (/a$/.test(name.split(' ')[0]) ? 'f' : 'm'), used, isAir); if (isAir) F['~air:' + name] = 1; try { save(); } catch (e) {} }
    return F[name] ? window.__wfFaceUrl(F[name]) : '';
  }
  // Team members carry names from the fire's country
  var LANG = { PT: 'pt', BRA: 'br', AMZ: 'br', ESP: 'es', MEX: 'es', ARG: 'es', CHL: 'es', COL: 'es', PER: 'es', BOL: 'es', ECU: 'es', VEN: 'es', URY: 'es', PRY: 'es', CRI: 'es', GTM: 'es', HND: 'es', NIC: 'es', PAN: 'es', SLV: 'es', CUB: 'es', DOM: 'es', AND: 'es',
    FRA: 'fr', BEL: 'fr', LUX: 'fr', MCO: 'fr', HTI: 'fr', ITA: 'it', SMR: 'it', VAT: 'it', DEU: 'de', AUT: 'de', CHE: 'de', LIE: 'de', GRC: 'el', CYP: 'el' };
  function langOf(c) { return LANG[c.st] || 'us'; }   // US, Canada, UK, Ireland and the rest: English names

  // ---- storage --------------------------------------------------------------------------------------------------
  var DB = null;
  function load() { if (DB) return DB; try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} if (!DB || !DB.chats) DB = { chats: {} }; if (window.__wfFireName) Object.keys(DB.chats).forEach(function (k) { var c = DB.chats[k]; if (c && c.place && c.kind !== 'dm') c.place = window.__wfFireName(c.place); }); return DB; }   /* one name everywhere: a fire known only by its code is an Unnamed fire */
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  function emit() { try { window.dispatchEvent(new Event('wf-chat')); } catch (e) {} }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { DB = null; emit(); } });

  function keyOf(inc) { var id = String(inc.id || ''); if (/^F-/.test(id)) return 'c:' + id.slice(2); return (inc.kind === 'cand' ? 'c:' : 'f:') + id; }

  // ---- the fire's clock -----------------------------------------------------------------------------------------
  function vnow(c) { return c.closedVt || (c.vNow + (Date.now() - c.vAt)); }
  function jump(c, ms) { c.vNow = vnow(c) + (ms || 0); c.vAt = Date.now(); }
  function since(c) { return c.hist && c.hist.length ? c.hist[0].vt : c.vNow; }
  function vary(c, a, b, salt) { return a + hash(c.key + (salt || '')) % Math.max(1, b - a + 1); }   // minutes, stable per chat

  // ---- stations near the incident ---------------------------------------------------------------------------------
  var SF = {};
  function stationsFor(st, lat, lon, cb) {
    var cc = ccOf(st);
    var done = function (rows) {
      var kx = 111.32 * Math.cos(lat * Math.PI / 180);
      var all = rows.map(function (r) { return { ck: r[1] + r[0], name: r[4] || 'Fire station', la: r[2], lo: r[3], km: Math.hypot((r[2] - lat) * 110.57, (r[3] - lon) * kx) }; })
        .filter(function (q) { return isFinite(q.km) && !/aeroporto|airport|base aérea/i.test(q.name); })
        .sort(function (a, b) { return a.km - b.km; })
        .slice(0, 60)   /* (Oct 7, perf) only the nearest few are ever used; de-duplicating the whole country (35,000 US stations) froze the screen */
        /* (Oct 7) one entry per station: the data can list a station twice (its building and its point); same name close by, or
           anything within 150 m, is the same station */
        .filter(function (q, i, A) { var sn = shortStation(q.name); return !A.slice(0, i).some(function (p) { var d = Math.hypot((p.la - q.la) * 110.57, (p.lo - q.lo) * kx); return d < 0.15 || (d < 2 && shortStation(p.name) === sn); }); });
      // Every fire gets a team: the nearest stations within 80 km, else the nearest ones at all (up to 250 km)
      var near = all.filter(function (q) { return q.km < 80; }); if (near.length < 3) near = all.filter(function (q) { return q.km < 250; });
      if (near.length < 2) near = all.slice(0, 2);   // never fewer than two stations (and two station chiefs)
      near = near.slice(0, 4);
      if (near.length < 2) {   // no (or too little) station data for this place: local stations named after the area, marked as such
        var nm0 = (cc === 'pt' || cc === 'br') ? ['Bombeiros Voluntários', 'Bombeiros Municipais', 'Corpo de Bombeiros'] : ['Fire Station 1', 'Fire Station 2', 'Fire Station 3'];
        near = near.concat(nm0.slice(0, 3 - near.length).map(function (n, i) { return { ck: 'loc' + i, name: n, km: 6 + i * 7, local: true }; }));
      }
      cb(near.map(function (q) { var min = Math.round(q.km * 1.3 / 50 * 60) + 3; return { ck: q.ck, name: q.name, short: shortStation(q.name), km: q.km, min: min, la: q.la, lo: q.lo }; }));
    };
    if (SF[cc]) return done(SF[cc]);
    fetch('data/stations-' + cc + '.json').then(function (r) { return r.json(); }).then(function (js) { SF[cc] = js.s || []; done(SF[cc]); }).catch(function () { done([]); });   // a failed load is not remembered: the next chat tries again
  }
  function kmTxt(km) { return km < 10 ? km.toFixed(1) + ' km' : Math.round(km) + ' km'; }

  // ---- forces: one crew per station, led by the station's crew coordinator ------------------------------------------
  function pickNames(c, n, salt) {
    // Walk the whole pool once from a stable starting point; if every name is taken, reuse names rather than loop forever
    var pool = NAMES[langOf(c)] || NAMES.us, used = c.used || (c.used = {}), out = [], i0 = hash(c.key + salt);
    for (var j = 0; j < pool.length && out.length < n; j++) { var nm = pool[(i0 + j) % pool.length]; if (!used[nm]) { used[nm] = 1; out.push(nm); } }
    for (var k = 0; out.length < n; k++) out.push(pool[(i0 + k) % pool.length]);
    return out;
  }
  function vehiclesFor(c, s, i) {
    var num = (String(s.name).match(/(\d{1,3})\b/) || [])[1] || String(10 + hash(s.name) % 80);
    var k = 1 + hash(s.name) % 6, lg = langOf(c);
    if (lg === 'pt') return i === 0 ? ['VFCI 0' + k, 'VLCI 01'] : i === 1 ? ['VFCI 0' + k] : ['VTTF 0' + k];
    if (lg === 'br') return i === 0 ? ['ABTF-0' + k, 'UR-01'] : i === 1 ? ['ABTF-0' + k] : ['AT-0' + k];
    if (lg === 'es') return i === 0 ? ['BRP 0' + k, 'BFP 01'] : i === 1 ? ['BRP 0' + k] : ['Nodriza 0' + k];
    if (lg === 'fr') return i === 0 ? ['CCF 0' + k, 'VLHR 01'] : i === 1 ? ['CCF 0' + k] : ['CCGC 0' + k];
    return i === 0 ? ['Engine ' + num, 'Brush Patrol ' + num] : i === 1 ? ['Engine ' + num] : ['Water Tender ' + num];
  }
  function forceFor(c, si, st) {
    var s = c.stations[si], P = c.people[si];
    // As many people as the vehicles really carry (the coordinator is one of them): a VFCI 5, a VLCI 3, a VTTF 2;
    // a Type 3 engine 3, a Type 6 brush patrol 2, a water tender 2 (ANEPC; NWCG minimum staffing)
    var veh = vehiclesFor(c, s, si), seats = veh.reduce(function (a, v) { return a + (/VFCI|CCF|BRP|ABTF/.test(v) ? 5 : /VLCI|VLHR|BFP|UR-/.test(v) ? 3 : /VTTF|Nodriza|CCGC|AT-|Tender/.test(v) ? 2 : /Brush Patrol/.test(v) ? 2 : /^Engine/.test(v) ? 3 : 3); }, 0);
    var crew = pickNames(c, Math.max(1, seats - 1), 'crew' + si);
    return { si: si, ck: s.ck || '', station: s.short, full: s.name, km: s.km, coord: P ? P.name : '', crew: crew, veh: veh, st: st || 'standby' };
  }
  function setForces(c, from, to) { (c.forces || []).forEach(function (f) { if (!from || from.indexOf(f.st) >= 0) f.st = to; }); }

  // ---- creating a chat --------------------------------------------------------------------------------------------
  function create(inc) {
    var db = load(), k = keyOf(inc);
    if (db.chats[k]) return db.chats[k];
    var now = Date.now();
    var stage = inc.kind === 'cand' ? 0 : stageFromCode(inc.sc);
    var ch = { key: k, kind: inc.kind, incId: inc.id, place: (window.__wfFireName ? window.__wfFireName(inc.place || '') : inc.place || ''), reg: inc.reg || '', st: inc.st || '', lat: +inc.lat || 0, lon: +inc.lon || 0,
      x: inc.x, y: inc.y, note: inc.note || '', conf: inc.conf || null, src: inc.src || '', det: inc.det || null,
      stage: stage, startStage: stage, started: now, vNow: now, vAt: now, hist: [], people: [], stations: [], forces: [], air: null, evac: null,
      msgs: [], queue: [], seenAt: 0, beat: 0, flags: {}, closed: false, dismissed: false, updated: now };
    // The fire's history before this chat opened: a candidate starts at its detection; a fire already in progress gets
    // plausible earlier stages, so its timeline is complete from the first detection.
    if (+inc.ha > 0) ch.realHa = +inc.ha;
    if (inc.past) { ch.past = true; ch.flags.air = !!inc.air; ch.flags.evac = !!inc.evac; if (inc.evac) ch.evac = { people: inc.evac }; }
    if (inc.res && inc.res.man != null) ch.realRes = { man: +inc.res.man || 0, terrain: +inc.res.terrain || 0, aerial: +inc.res.aerial || 0, estF: inc.res.estF || null };
    if (stage === 0) ch.hist.push({ s: 0, vt: Math.min(now, inc.det || now) });
    else if (inc.startMs && inc.startMs < now - 20 * MIN) {
      // A fire already in progress: its history runs from the real start time. Detection, confirmation and the drive
      // take minutes; the rest of the time is shared between the later stages as such fires usually spend it.
      ch.startMs = inc.startMs;
      var cur = inc.curMs && inc.curMs > inc.startMs + 40 * MIN && inc.curMs < now ? inc.curMs : null;   // the official time of the current state
      var D = ((cur || now) - inc.startMs) / MIN, fixed = [8, 3, 18], wts = [0, 0, 0, 150, 240, 300, 600, 0], du = [];
      for (var q = 0; q <= stage; q++) du.push(q < 3 ? fixed[q] + hash(k + q) % 4 : wts[q] * (0.7 + (hash(k + q) % 60) / 100));
      var sF = 0, sW = 0; du.forEach(function (d, q) { if (q < 3) sF += d; else sW += d; });
      if (stage < 3 || D < sF * 1.5) du = du.map(function (d) { return d * D / (sF + sW); });
      else du = du.map(function (d, q) { return q < 3 ? d : d * (D - sF) / sW; });
      if (cur) { var pr = du.slice(0, stage), sp = pr.reduce(function (a, d) { return a + d; }, 0) || 1; du = pr.map(function (d) { return d * D / sp; }).concat([0]); }
      var tt = inc.startMs; ch.hist = du.map(function (d, q) { var h = { s: q, vt: tt }; tt += d * MIN; return h; });
    } else {
      var back = [8, 3, 20, 150, 240, 300, 600], t = now - vary(ch, 12, 40, 'cur') * MIN, H = [{ s: stage, vt: t }];
      for (var s = stage - 1; s >= 0; s--) { t -= (back[s] + hash(k + s) % Math.max(2, back[s])) * MIN; H.unshift({ s: s, vt: t }); }
      ch.hist = H;
    }
    db.chats[k] = ch; save();
    stationsFor(ch.st, ch.lat, ch.lon, function (S) {
      var d = load(), c = d.chats[k]; if (!c) return;
      c.stations = S.slice(0, 4);   // (Oct 3, 22:04) while a candidate: the leads of the four nearest stations
      c.reserve = S[4] || null;
      var nm = pickNames(c, c.stations.length, 'coord');
      c.people = c.stations.map(function (s, i) { return { name: nm[i], code: initials(nm[i]), org: s.short, kind: 'lead' }; });
      if (c.stage >= 2) {   // a fire already in progress: the first two stations are working it
        c.flags.dispatched = true;
        c.people.forEach(function (p, pi) { if (pi >= 2) p.left = true; });   // (Oct 3, 22:03) only the stations working it are in the chat
        ensureAir(c);
        c.forces = c.stations.map(function (s, i) { return forceFor(c, i, i < 2 ? (c.stage === 2 ? 'enroute' : c.stage >= 7 ? 'released' : c.stage === 6 && i ? 'released' : c.stage === 6 ? 'watch' : 'onscene') : 'standby'); });
      }
      var kept = d.sent && d.sent[k]; if (kept) delete d.sent[k];
      if (c.kind === 'fire' && c.startMs && !kept) backfill(c); else start(c);
      if (kept && c.stage <= 1) dispatched(k, kept, 2400);
      if (c.past) closePast(c);
      save(); emit();
    });
    return ch;
  }

  // ---- messages -----------------------------------------------------------------------------------------------------
  // delay: real milliseconds until it appears; adv: minutes the fire's clock moves on before it (plausible time stamps)
  var mid = 0;
  function newId() { mid++; return Date.now().toString(36) + mid; }
  function push(c, m, delay, adv) { m.id = newId(); m.adv = adv == null ? 0 : adv; c.queue.push({ due: Date.now() + (delay || 0), m: m }); c.queue.sort(function (a, b) { return a.due - b.due; }); }
  function sys(c, en, pt, delay, adv) { push(c, { kind: 'sys', en: en, pt: pt }, delay, adv == null ? 1 : adv); }
  function say(c, who, en, pt, delay, adv) { var P = c.people || []; if (P[who] && P[who].left) { var j = P.findIndex(function (p) { return !p.left; }); if (j >= 0) who = j; }
    push(c, { kind: 'msg', from: who, en: en, pt: pt }, delay, adv == null ? vary(c, 2, 7, en.length) : adv); }
  function card(c, obj, delay, adv) { obj.kind = 'card'; push(c, obj, delay, adv == null ? 1 : adv); }
  function setStage(c, s, delay, adv) { push(c, { kind: 'stage', stage: s }, delay, adv || 0);
    // (Oct 4) crews on the fire line: the air lead joins the chat
    if (s >= 3 && !c.dismissed && !(c.people || []).some(function (p) { return p.kind === 'air'; })) { var a = airLead(c); c.people.push(a); sys(c, a.name + ', ' + a.roleEn.toLowerCase() + ', joined', a.name + ', ' + a.rolePt.toLowerCase() + ', entrou na conversa', (delay || 0) + 500, 0); } }
  function lead(c, i) { return Math.min(i, Math.max(0, c.people.length - 1)); }
  function mine(c, en, pt) { c.msgs.push({ id: newId(), kind: 'msg', from: 'me', en: en, pt: pt, t: Date.now(), vt: vnow(c) }); }

  // Scripted beats ---------------------------------------------------------------------------------------------------
  function stageCard(c, s) {
    var S = STAGES[s], st = c.stations;
    var base = { tag: { en: S.en, pt: S.pt }, tagC: S.c, stage: s };
    if (s === 0) return Object.assign(base, { tag: { en: 'Ignition detected', pt: 'Ignição detetada' }, title: { en: 'Heat anomaly', pt: 'Anomalia térmica' },
      body: { en: (c.src || 'Satellite') + (c.det ? ' · ' + hhmm(c.det) : ''), pt: (c.src || 'Satélite').replace('Satellite', 'Satélite') + (c.det ? ' · ' + hhmm(c.det) : '') },
      kpi: c.conf ? { v: c.conf + '%', l: { en: 'Likelihood', pt: 'Probabilidade' }, c: '#3A3A3C' } : null });
    if (s === 1) return Object.assign(base, { tag: { en: 'Ignition confirmed', pt: 'Ignição confirmada' }, title: { en: 'Active fire · ' + c.place, pt: 'Incêndio ativo · ' + c.place },
      body: { en: 'Nearest stations, by straight-line distance and estimated drive time', pt: 'Quartéis mais próximos, por distância em linha reta e tempo estimado' },
      rows: st.map(function (x, i) { return { a: x.short, b: kmTxt(x.km) + ' · ~' + x.min + ' min', r: { en: 'Awaiting', pt: 'A aguardar' }, rc: '#545458', i: i }; }).map(function (r, i, R) { if (c.sentIdx && i === R.length - 1) sentRows(c, R); return r; }) });
    if (s === 2) return Object.assign(base, { title: { en: 'Crews en route', pt: 'Meios a caminho' },
      body: { en: 'First on the fire line in about ' + (st[0] ? st[0].min : 15) + ' min', pt: 'Primeiros na linha de fogo em cerca de ' + (st[0] ? st[0].min : 15) + ' min' }, fire: true });
    if (s === 3) return Object.assign(base, { title: { en: 'Crews on the fire line', pt: 'Equipas na linha de fogo' },
      body: { en: 'Forces, time in each stage and the spread projection are on the fire card', pt: 'Meios, tempo em cada fase e projeção da propagação no cartão do incêndio' }, fire: true });
    if (s === 4) return Object.assign(base, { title: { en: 'Head held · working the flanks', pt: 'Cabeça dominada · a trabalhar os flancos' }, body: { en: 'No further spread reported', pt: 'Sem progressão reportada' }, fire: true });
    if (s === 5) return Object.assign(base, { title: { en: 'Perimeter held · mop-up', pt: 'Perímetro dominado · rescaldo' }, body: { en: 'Crews putting out hotspots along the edge', pt: 'Equipas a extinguir pontos quentes no perímetro' }, fire: true });
    if (s === 6) return Object.assign(base, { title: { en: 'Surveillance', pt: 'Vigilância' }, body: { en: 'One crew watching for rekindles, the others released', pt: 'Uma equipa em vigilância a reacendimentos, as outras libertadas' }, fire: true });
    return Object.assign(base, { title: { en: 'Fire closed', pt: 'Incêndio encerrado' }, body: { en: 'Resolved ' + dur(vnow(c) - since(c)) + ' after the first detection', pt: 'Resolvido ' + dur(vnow(c) - since(c)) + ' depois da primeira deteção' } });
  }


  // ---- a fire already in progress: the conversation that led here ----------------------------------------------------
  // Written once when its chat is first opened: the report, your confirmation and dispatch orders, the crews' arrival
  // and their updates through each stage, stamped along the fire's real timeline, ending in its current state.
  var LONG = {
    3: [[0, 'Night shift took over the line. Crews rotated, fresh engine from the second station.', 'O turno da noite assumiu a linha. Equipas rodadas, veículo fresco do segundo quartel.'],
        [1, 'Morning briefing done. Wind picks up after 11:00, we reinforce the north flank before then.', 'Briefing da manhã feito. O vento aumenta depois das 11:00, reforçamos o flanco norte antes disso.'],
        [2, 'Dozer line finished on the east side. Holding.', 'Linha de máquina concluída a nascente. A segurar.']],
    4: [[1, 'Night quiet on the flanks. Two crews resting, one on patrol.', 'Noite calma nos flancos. Duas equipas a descansar, uma em patrulha.']],
    6: [[0, 'Second day of watch. Nothing on the thermal camera.', 'Segundo dia de vigilância. Nada na câmara térmica.']]
  };
  function backfill(c) {
    var now = Date.now(), s = c.stage, P = c.people, H = c.hist, us = isUS(c);
    var at = function (q) { var h = H.find(function (x) { return x.s === q; }); return h ? h.vt : null; };
    var end = function (q) { var h = H.find(function (x) { return x.s === q + 1; }); return h ? h.vt : now - 4 * MIN; };
    var add = function (m, vt) { m.id = newId(); m.t = now - 1000; m.vt = Math.min(vt, now - 2 * MIN); c.msgs.push(m); };
    var who = function (i) { return Math.min(i, P.length - 1); };
    var msg = function (i, en, pt, vt) { if (P.length) add({ kind: 'msg', from: who(i), en: en, pt: pt }, vt); };
    var me = function (en, pt, vt) { add({ kind: 'msg', from: 'me', en: en, pt: pt }, vt); };
    var cardAt = function (q, vt) { var m = stageCard(c, q); m.kind = 'card'; add(m, vt); return m; };
    var names = P.map(function (p) { return p.org; }).join(', ');
    // Detection
    var c0 = stageCard(c, 0); c0.kind = 'card'; c0.tag = { en: 'Fire reported', pt: 'Incêndio reportado' }; c0.title = { en: c.place, pt: c.place };
    c0.body = { en: c.note || 'Reported to the command centre', pt: c.note || 'Reportado ao comando' }; c0.kpi = null; delete c0.link; add(c0, at(0));
    add({ kind: 'sys', en: 'Called you (fire owner) and the crew coordinators of ' + names, pt: 'Chamados: você (responsável pelo incêndio) e os coordenadores de equipa de ' + names }, at(0) + MIN);
    msg(0, 'Seen. Crew of 5 and ' + (us ? 'an engine' : 'one fire engine') + ' ready at ' + (P[0] || {}).org + '.', 'Visto. Equipa de 5 e um veículo prontos em ' + (P[0] || {}).org + '.', at(0) + 3 * MIN);
    if (P[2]) msg(2, 'Smoke visible from the station, looks like it is growing.', 'Fumo visível do quartel, parece estar a crescer.', at(0) + 5 * MIN);
    if (s >= 1) {
      me('Declaring the fire.', 'Declaro o incêndio.', at(1));
      var c1 = cardAt(1, at(1) + 20000);
      if (c1.rows) c1.rows.forEach(function (r, i) { r.r = s >= 2 ? (i < 2 ? { en: 'Dispatched', pt: 'Despachado' } : { en: 'Standby', pt: 'Prevenção' }) : r.r; r.rc = s >= 2 ? (i < 2 ? '#186B2D' : '#875800') : r.rc; });
      msg(1, 'Available now.', 'Disponíveis agora.', at(1) + MIN);
    }
    if (s >= 2) {
      var st2 = c.stations.slice(0, 2).map(function (x) { return x.short; });
      me('Dispatch: ' + st2.join(' and ') + ' go.' + (c.stations[2] ? ' ' + c.stations[2].short + ' on standby.' : ''), 'Despacho: ' + st2.join(' e ') + ' avançam.' + (c.stations[2] ? ' ' + c.stations[2].short + ' de prevenção.' : ''), at(2) - 30000);
      cardAt(2, at(2));
      msg(0, 'Leaving now. ETA ' + (c.stations[0] ? c.stations[0].min : 15) + ' min.', 'A sair. Chegada prevista em ' + (c.stations[0] ? c.stations[0].min : 15) + ' min.', at(2) + MIN);
    }
    // From the crews' arrival on, updates spread through each stage (more of them the longer it lasted)
    var through = function (q, lines) {
      var a = at(q), b = end(q), used = 0;
      lines.forEach(function (L0, i) { var vt = a + (b - a) * (i + 1) / (lines.length + 1); if (vt < now - 5 * MIN) { msg(L0[0], L0[1], L0[2], vt); used++; } });
      return used;
    };
    var fromProg = function (q) { return (PROGRESS[q] || []).map(function (p) { var a = p[1](c); return [p[0], a[0], a[1]]; }); };
    for (var q = 3; q <= s && q < 7; q++) {
      if (q >= 4) me('Moving the fire to ' + STAGES[q].en + '.', 'Passo o incêndio a ' + STAGES[q].pt + '.', at(q) - 30000);
      cardAt(q, at(q));
      if (q === 3) {
        msg(0, 'On scene. Fire in ' + (us ? 'chaparral and dry grass' : 'pine and eucalyptus') + ', head running with the wind.', 'No local. Fogo em ' + (us ? 'chaparral e erva seca' : 'pinhal e eucaliptal') + ', cabeça a progredir com o vento.', at(3) + 3 * MIN);
        me('Anchor on the road, protect the homes first, then work the head.', 'Ancorem na estrada, protejam primeiro as casas e depois ataquem a cabeça.', at(3) + 6 * MIN);
        msg(1, 'Copy. Homes covered, starting on the flanks.', 'Entendido. Casas protegidas, a começar pelos flancos.', at(3) + 9 * MIN);
        if (c.flags.air) { var heli = us ? 'Helicopter 15' : 'Helicóptero H-21'; c.air = { name: heli, kind: us ? 'Firefighting helicopter · LAFD Air Operations' : 'Helicóptero de ataque inicial · Força Aérea', st: 'released' };
          msg(1, 'We need air support to hold the head before the ridge.', 'Precisamos de meio aéreo para segurar a cabeça antes da cumeada.', at(3) + 20 * MIN);
          me('Air support approved.', 'Meio aéreo aprovado.', at(3) + 22 * MIN);
          add({ kind: 'sys', en: heli + ' on scene · first water drops on the head', pt: heli + ' no local · primeiras descargas na cabeça' }, at(3) + 38 * MIN); }
        if (c.evac) { me('Evacuation order for the homes north-east of the fire.', 'Ordem de evacuação para as casas a nordeste do incêndio.', at(3) + 30 * MIN);
          add({ kind: 'sys', en: (us ? "Sheriff's deputies" : 'Local police (GNR)') + ' moving ' + c.evac.people + ' residents to safety', pt: (us ? 'Xerifes' : 'GNR') + ' a encaminhar ' + c.evac.people + ' moradores para local seguro' }, at(3) + 44 * MIN); }
      }
      if (q === 4) msg(0, 'Head is held. Working both flanks.', 'Cabeça dominada. A trabalhar os dois flancos.', at(4) + 4 * MIN);
      if (q === 5) msg(1, 'Perimeter held. Mop-up along the edge.', 'Perímetro dominado. Rescaldo no perímetro.', at(5) + 5 * MIN);
      if (q === 6) { msg(0, 'We stay on watch. Others released.', 'Ficamos em vigilância. Os outros foram libertados.', at(6) + 8 * MIN); }
      var lines = fromProg(q), long = (end(q) - at(q)) > 10 * 60 * MIN ? (LONG[q] || []) : [];
      var used = through(q, q === s ? lines.slice(0, 1).concat(long) : lines.concat(long));
      if (q === s) { c.prog = c.prog || {}; c.prog[q] = Math.min(1, used); }
    }
    c.msgs.sort(function (a, b) { return a.vt - b.vt; });
    c.seenAt = now; c.updated = now; c.vNow = now; c.vAt = now;
  }


  // ---- past fires, already closed: their chats sit in the Resolved tab with the whole story -------------------------
  function closePast(c) {
    var t7 = (c.hist.find(function (h) { return h.s === 7; }) || {}).vt || Date.now() - 86400000, now = Date.now(), P = c.people;
    var add = function (m, vt) { m.id = newId(); m.t = now - 1000; m.vt = vt; c.msgs.push(m); };
    add({ kind: 'card', tag: { en: 'Ready to close', pt: 'Pronto a encerrar' }, tagC: '#00606A', title: { en: 'Close fire', pt: 'Encerrar incêndio' }, close: true, done: 'close',
      checks: [{ en: 'No active edge or hotspots', pt: 'Sem frente ativa nem pontos quentes' }, { en: c.evac ? 'Evacuation order lifted' : 'No evacuation orders in force', pt: c.evac ? 'Ordem de evacuação levantada' : 'Sem ordens de evacuação em vigor' }, { en: 'All crews accounted for', pt: 'Todas as equipas contabilizadas' }],
      actions: [{ key: 'close', en: 'Close fire', pt: 'Encerrar incêndio', primary: true }] }, t7 - 3 * MIN);
    add({ kind: 'msg', from: 'me', en: 'Declaring the fire closed. Thank you all.', pt: 'Declaro o incêndio encerrado. Obrigado a todos.' }, t7 - MIN);
    c.stage = 7; c.closed = true; c.closedVt = t7; c.vNow = t7; c.vAt = now;
    (c.forces || []).forEach(function (f) { f.st = 'released'; }); if (c.air) c.air.st = 'released';
    var sc = stageCard(c, 7); sc.kind = 'card'; add(sc, t7);
    if (P[0]) add({ kind: 'msg', from: 0, en: 'Thanks everyone. Good work.', pt: 'Obrigado a todos. Bom trabalho.' }, t7 + 2 * MIN);
    add({ kind: 'card', summary: true, tag: { en: 'Fire resolved', pt: 'Incêndio resolvido' }, tagC: '#186B2D' }, t7 + 3 * MIN);
    c.msgs.sort(function (a, b) { return a.vt - b.vt; });
    c.msgs.forEach(function (m) { m.t = Math.min(m.vt || m.t, now - DAY / 2); });   // a past fire: its messages belong to its own days
    c.sum = stats(c); award(c); c.seenAt = now; c.updated = t7;
  }
  var DAY = 86400000;
  var PAST = {
    pt: [{ place: 'Manteigas', reg: 'Guarda', st: 'PT', lat: 40.40, lon: -7.54, d0: 9.4, d1: 7.1, ha: 212, air: 1, evac: 146 }, { place: 'Mação', reg: 'Santarém', st: 'PT', lat: 39.55, lon: -8.00, d0: 4.3, d1: 3.2, ha: 38 }],
    ca: [{ place: 'Castaic', reg: 'Los Angeles', st: 'CA', lat: 34.49, lon: -118.61, d0: 8.2, d1: 6.4, ha: 164, air: 1, evac: 212 }, { place: 'Acton', reg: 'Los Angeles', st: 'CA', lat: 34.47, lon: -118.19, d0: 3.6, d1: 2.9, ha: 27 }],
    nv: [{ place: 'Washoe Valley', reg: 'Washoe', st: 'NV', lat: 39.30, lon: -119.83, d0: 7.5, d1: 5.8, ha: 96, air: 1, evac: 88 }, { place: 'Carson City', reg: 'Carson City', st: 'NV', lat: 39.13, lon: -119.80, d0: 3.1, d1: 2.4, ha: 19 }],
    amz: [{ place: 'Near Manaus', reg: 'Amazonas', st: 'AMZ', lat: -3.05, lon: -60.10, d0: 10.2, d1: 7.6, ha: 480, air: 1 }, { place: 'Near Porto Velho', reg: 'Rondônia', st: 'AMZ', lat: -8.70, lon: -63.85, d0: 5.1, d1: 3.9, ha: 75 }]
  };
  PAST.design = [PAST.pt[0], PAST.ca[0]]; PAST.admin = [PAST.pt[0], PAST.ca[0]];
  function seedPast() {
    var db = load(); if (db.pastSeeded) return; db.pastSeeded = true; save();
    var now = Date.now();
    (PAST[role] || PAST.admin).forEach(function (f, i) {
      create({ kind: 'fire', id: 'SIM-' + (role || 'x') + '-' + i, place: f.place, reg: f.reg, st: f.st, lat: f.lat, lon: f.lon, sc: 10, past: true, air: f.air, evac: f.evac, ha: f.ha,
        x: Math.round((f.lon + 118.13) * 2345 + 518), y: Math.round((34.19 - f.lat) * 2829 + 662), note: '',
        startMs: now - f.d0 * DAY, curMs: now - f.d1 * DAY });
    });
  }


  // ---- training drill: replay a resolved fire from its ignition and try to beat it ---------------------------------------
  function simulate(key) {
    var src = load().chats[key]; if (!src || !src.closed || src.dismissed) return null;
    var S = src.sum || stats(src), n = (load().drills = (load().drills || 0) + 1);
    var inc = { kind: 'cand', id: 'DRILL-' + n + '-' + String(src.incId).slice(-8), place: src.place, reg: src.reg, st: src.st, lat: src.lat, lon: src.lon, x: src.x, y: src.y,
      conf: 72, src: 'Satellite VIIRS NOAA-21', det: Date.now() - 4 * MIN };
    var c = create(inc);
    c.drill = { from: key, res: S.res, ha: S.ha, acres: S.acres, resp: S.resp, us: S.us, t: S.end, place: src.place };
    save();
    // Same stations and the same crew coordinators as the real incident
    var wait = function () { var d = load().chats[c.key]; if (!d) return; if (!d.people.length) return setTimeout(wait, 150);
      // The same stations and coordinators as the real fire; if the real fire has no team on record, the drill keeps its own
      if (src.people && src.people.length && src.stations && src.stations.length) {
        d.stations = src.stations.slice(0, 4); d.reserve = src.reserve || d.reserve; d.used = {};
        d.people = src.people.slice(0, d.stations.length).map(function (p) { d.used[p.name] = 1; return { name: p.name, code: p.code, org: p.org, kind: 'lead' }; });
      }
      (src.forces || []).forEach(function (f) { f.crew.forEach(function (x) { d.used[x] = 1; }); });
      d.msgs.concat(d.queue.map(function (q) { return q.m; })).forEach(function (m) { if (m.kind === 'sys' && /^Called you/.test(m.en)) { var names = d.people.map(function (p) { return p.org; }).join(', '); m.en = 'Training drill against the resolved fire of ' + new Date(S.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · called you (fire owner) and the crew coordinators of ' + names; m.pt = 'Simulação contra o incêndio resolvido de ' + new Date(S.end).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) + ' · chamados: você (responsável) e os coordenadores de equipa de ' + names; } });
      save(); emit(); };
    setTimeout(wait, 150);
    return c.key;
  }

  // (Oct 5, 09:51) Every ignition candidate gets an automatic drone scan: the nearest station sends its surveillance drone
  // as soon as the candidate is detected, and the drone feed counts as evidence beside the satellite pass (simulated).
  // strong: the drone sees smoke and a hot spot (likelihood 50% or more); otherwise only a warm patch, no smoke
  function evidOf(c) {
    var strong = !(c.conf != null && c.conf < 50), st0 = (c.stations || [])[0], from = st0 ? st0.short : null;
    var src = c.src || 'Satellite';
    return { strong: strong, drone: 'D-5', from: from, video: strong ? 'assets/dronefire.mp4?v=1' : 'assets/dronecalm.mp4?v=1',
      rows: [
        { a: { en: 'Satellite', pt: 'Satélite' }, b: { en: 'Heat anomaly. ' + src + (c.det ? ' at ' + hhmm(c.det) : '') + '.', pt: 'Anomalia térmica. ' + src.replace('Satellite', 'Satélite') + (c.det ? ' às ' + hhmm(c.det) : '') + '.' } },
        { a: { en: 'Drone D-5' + (from ? ' from ' + from : ''), pt: 'Drone D-5' + (from ? ' de ' + from : '') }, sim: true,
          b: strong ? { en: 'Smoke and a hot spot on the thermal feed.', pt: 'Fumo e um ponto quente na imagem térmica.' } : { en: 'A warm patch on the thermal feed. No smoke.', pt: 'Uma zona quente na imagem térmica. Sem fumo.' } }
      ] };
  }
  function evidCard(c) {
    return Object.assign(stageCard(c, 0), { ev: true, title: { en: 'Evidence', pt: 'Evidências' }, body: null });
  }
  // a request card from a coordinator, sent once the team has given its reading of the evidence
  function evidRequest(c) {
    var E = evidOf(c), P = c.people || [], by = 0, who = P[by] ? P[by].name : 'Crew coordinator';
    return { req: 'decl', reqDecl: true, by: by, tag: { en: 'Request · ' + who, pt: 'Pedido · ' + who }, tagC: '#B8360A',
      title: E.strong ? { en: 'Declare fire', pt: 'Declarar incêndio' } : { en: 'Dismiss fire', pt: 'Descartar incêndio' },
      body: E.strong ? { en: 'The drone feed and the satellite pass agree: smoke and a hot spot.', pt: 'A imagem do drone e a passagem do satélite coincidem: fumo e um ponto quente.' }
        : { en: 'No smoke or flame on the drone feed.', pt: 'Sem fumo nem chama na imagem do drone.' },
      actions: [{ key: 'reqNo', en: 'Not now', pt: 'Agora não' }, { key: E.strong ? 'reqConfirm' : 'reqDismiss', en: 'Approve', pt: 'Aprovar', primary: true }] };
  }
  // a decision taken another way (a chip, the state card) answers the open request too
  function settleReq(c, declared) {
    (c.msgs || []).concat((c.queue || []).map(function (q) { return q.m; })).forEach(function (m) {
      if (m.reqDecl && !m.done) m.done = (declared && m.actions[1].key === 'reqConfirm') || (!declared && m.actions[1].key === 'reqDismiss') ? m.actions[1].key : 'reqNo'; });
  }
  function start(c) {
    var P = c.people, n = P.length;
    var names = P.map(function (p) { return p.org; }).join(', ');
    if (c.kind === 'cand') {
      // (Oct 5, 09:51) the first card is the evidence, with the drone feed playing; then each coordinator gives a reading
      // of the evidence, the drone feed included; then one of them sends a request card (or you decide first)
      c.flags.drone = true;
      var E = evidOf(c), from = E.from || (P[0] ? P[0].org : 'the nearest station');
      card(c, evidCard(c), 300, 0);
      sys(c, 'Drone D-5 sent automatically from ' + from + ' · over the point', 'Drone D-5 enviado automaticamente de ' + from + ' · sobre o ponto', 700, 0);
      sys(c, 'Called you (fire owner) and the crew coordinators of ' + (names || 'the nearest stations'), 'Chamados: você (responsável pelo incêndio) e os coordenadores de equipa de ' + (names || 'os quartéis mais próximos'), 1100, 1);
      if (E.strong) {
        if (n > 0) say(c, 0, 'Our drone is over it. Thermal shows a hot spot about 30 m across and a thin column of smoke. With the satellite pass, I read it as a real ignition.', 'O nosso drone está sobre o ponto. A térmica mostra um ponto quente com cerca de 30 m e uma coluna de fumo fina. Com a passagem do satélite, leio-o como uma ignição real.', 4500, 2);
        if (n > 1) say(c, 1, 'Agree. The smoke drifts with the wind from the satellite point. No sign of a planned burn.', 'Concordo. O fumo desloca-se com o vento a partir do ponto do satélite. Sem sinal de uma queima autorizada.', 9000, 2);
        if (n > 2) say(c, 2, 'Same reading. We can see smoke from the station too.', 'Mesma leitura. Também vemos fumo do quartel.', 13500, 2);
      } else {
        if (n > 0) say(c, 0, 'Our drone is over the point. A warm patch on the thermal, but no smoke and no flame. Could be sun-heated rock or a vehicle.', 'O nosso drone está sobre o ponto. Uma zona quente na térmica, mas sem fumo nem chama. Pode ser rocha aquecida pelo sol ou um veículo.', 4500, 2);
        if (n > 1) say(c, 1, 'Agree. Nothing on the feed matches a fire.', 'Concordo. Nada na imagem corresponde a um incêndio.', 9000, 2);
        if (n > 2) say(c, 2, 'No smoke seen from our station.', 'Sem fumo visível do nosso quartel.', 13500, 2);
      }
      card(c, evidRequest(c), 17000, 1);
      // (Oct 5, 10:19) all of this happened when the candidate was detected, before anyone opens the chat: the drone took off
      // on its own and the team has already reacted to its feed. The messages are written as past, minutes after detection
      // (fitted into the time since), and count as unread on the candidate's chat button.
      var now0 = Date.now(), base = Math.min(now0 - 2 * MIN, (c.hist[0] && c.hist[0].vt) || now0 - 15 * MIN), span = Math.max(2 * MIN, Math.min(12 * MIN, now0 - MIN - base));
      var Q = c.queue.splice(0, c.queue.length), last = Q.length ? Q[Q.length - 1].due : 1, first = Q.length ? Q[0].due : 0;
      Q.forEach(function (q) { var m = q.m; delete m.adv; m.t = m.vt = Math.round(base + MIN / 2 + (q.due - first) / Math.max(1, last - first) * (span - MIN / 2)); if (m.req) m.nagAt = now0; c.msgs.push(m); });
    } else {
      var s = c.stage;
      sys(c, 'Chat opened for this fire · you (fire owner) and the crew coordinators of ' + (names || 'the nearest stations'), 'Conversa aberta para este incêndio · você (responsável) e os coordenadores de equipa de ' + (names || 'os quartéis mais próximos'), 300, 0);
      card(c, stageCard(c, s), 900, 0);
      entry(c, s, 2500);
    }
    save(); emit();
  }

  // Beats when a stage begins (after its card)
  function entry(c, s, d) {
    var P = c.people; d = d || 0;
    if (s === 1) {
      if (c.flags.dispatched) return;   // orders already sent from the dispatch screen
      if (window.__wfTour && window.__wfTour.active && window.__wfTour.active()) return;   // (Oct 5, 10:21) in the tour the team waits: nothing pushes the Ignition confirmed card (Configure dispatch) up
      if (P[0]) say(c, 0, 'Ready to go on your order.', 'Prontos para sair à sua ordem.', d + 3500, 1);
      if (P[1]) say(c, 1, 'Available now.', 'Disponíveis agora.', d + 6500, 1);
      if (P[2]) say(c, 2, 'We can send one crew, the second stays for cover.', 'Podemos enviar uma equipa, a segunda fica de prevenção.', d + 9500, 2);
    } else if (s === 2) {
      var eta = c.stations[0] ? c.stations[0].min : 15;
      if (!c.acked) {   /* (Oct 5) the leads already confirmed the order on their way: no second "leaving now" */
      if (P[0]) say(c, 0, 'Leaving now. ETA ' + eta + ' min.', 'A sair. Chegada prevista em ' + eta + ' min.', d + 3000, 1);
      if (P[1]) say(c, 1, 'On our way behind them.', 'A caminho, logo atrás.', d + 6000, 2); }
      setStage(c, 3, d + 16000, Math.max(4, eta - 3));
    } else if (s === 3) {
      if (P[0]) say(c, 0, 'On scene. Fire in ' + (isUS(c) ? 'chaparral and dry grass' : 'pine and eucalyptus') + ', head running north-east with the wind.', 'No local. Fogo em ' + (isUS(c) ? 'chaparral e erva seca' : 'pinhal e eucaliptal') + ', cabeça a progredir para nordeste com o vento.', d + 3000, 3);
      if (P[1]) say(c, 1, 'Homes about 1 km north-east. We need air support to hold the head before it gets there.', 'Casas a cerca de 1 km para nordeste. Precisamos de meio aéreo para segurar a cabeça antes de lá chegar.', d + 8000, 6);
      card(c, { req: 'air', by: lead(c, 1), tag: { en: 'Request · ' + (P[1] ? P[1].name : 'Crew coordinator'), pt: 'Pedido · ' + (P[1] ? P[1].name : 'Coordenador de equipa') }, tagC: '#B8360A',
        title: { en: 'Air support', pt: 'Meio aéreo' }, body: { en: 'One helicopter to hold the head before it reaches the homes', pt: 'Um helicóptero para segurar a cabeça antes de chegar às casas' },
        actions: [{ key: 'declineAir', en: 'Not now', pt: 'Agora não' }, { key: 'approveAir', en: 'Approve', pt: 'Aprovar', primary: true }] }, d + 9500, 0);
    } else if (s === 4) {
      if (P[0]) say(c, 0, 'Head is held. Working both flanks, no spread for 20 min.', 'Cabeça dominada. A trabalhar os dois flancos, sem progressão há 20 min.', d + 3000, 4);
    } else if (s === 5) {
      if (P[1]) say(c, lead(c, 1), 'Perimeter held. Starting mop-up along the edge.', 'Perímetro dominado. A iniciar o rescaldo no perímetro.', d + 3000, 5);
    } else if (s === 6) {
      if (P[0]) say(c, 0, 'We stay on watch. Thermal camera shows no hotspots.', 'Ficamos em vigilância. A câmara térmica não mostra pontos quentes.', d + 3000, 8);
      if (P[1]) say(c, 1, 'Released and heading back to the station.', 'Libertados, a regressar ao quartel.', d + 6000, 3);
    }
  }

  // Quick actions for the fire owner, per stage
  function actions(c) {
    if (c.kind === 'dm') return c.topic ? [] : [{ key: 'topic', en: 'Set the topic', pt: 'Definir o tópico', primary: true }];
    if (c.dismissed || c.stage === 7) return [];
    var s = c.stage, A = [];
    if (s === 0) { if (!c.flags.drone) A.push({ key: 'drone', en: 'Send drone', pt: 'Enviar drone' }); A.push({ key: 'dismiss', en: 'Dismiss fire', pt: 'Descartar incêndio' }); A.push({ key: 'confirm', en: 'Declare fire', pt: 'Declarar incêndio', primary: true }); }   // Dismiss then Confirm, as everywhere
    if (s === 1 && !c.flags.dispatched) { A.push({ key: 'dispatch', en: 'Configure dispatch', pt: 'Configurar despacho', primary: true }); if (c.reserve && !c.flags.more) A.push({ key: 'more', en: 'Call another station', pt: 'Chamar outro quartel' }); }
    if (s === 2) A.push({ key: 'update', en: 'Ask for an update', pt: 'Pedir ponto de situação' });
    if (s === 3) { if (!c.flags.air) A.push({ key: 'approveAir', en: 'Air support', pt: 'Meio aéreo' }); if (!c.flags.evac) A.push({ key: 'evac', en: 'Evacuation order', pt: 'Ordem de evacuação', danger: true }); if (!c.flags.drone3) A.push({ key: 'drone3', en: 'Drone', pt: 'Drone' }); if (c.flags.air) A.push({ key: 'next', en: 'Move to Resolving', pt: 'Passar a Em resolução', primary: true }); }
    if (s >= 2 && s <= 4 && c.reserve && !c.flags.more) A.push({ key: 'more', en: 'Deploy another station', pt: 'Empenhar outro quartel' });
    if (s >= 4 && s <= 6 && (c.forces || []).filter(function (f) { return f.st === 'onscene'; }).length > 1) A.push({ key: 'recall', en: 'Recall a crew', pt: 'Recolher uma equipa' });
    if (s === 4) A.push({ key: 'next', en: 'Move to Concluding', pt: 'Passar a Em conclusão', primary: true });
    if (s === 5) A.push({ key: 'next', en: 'Move to Surveillance', pt: 'Passar a Vigilância', primary: true });
    if (s === 6) A.push({ key: 'closeCheck', en: 'Close fire', pt: 'Encerrar incêndio', primary: true });
    return A;
  }

  // How long each stage plausibly lasts before the fire owner moves it on (minutes)
  function drillF(c) {   // a training drill: your decisions speed the fire up or slow it down
    if (!c.drill) return 1;
    var f = 1, n = (c.forces || []).filter(function (x) { return x.st !== 'standby'; }).length;
    if (c.flags.air) f *= 0.8; if (c.flags.airNo) f *= 1.25; if (n >= 3) f *= 0.9; if (c.flags.drone3) f *= 0.95;
    return f;
  }
  function stageSpan(c, to) {
    return drillF(c) * (to === 4 ? vary(c, 85, 170, 's4') : to === 5 ? vary(c, 150, 330, 's5') : to === 6 ? vary(c, 180, 420, 's6') : to === 7 ? vary(c, 840, 1560, 's7') : 1);
  }

  function act(key, a, msgId) {
    var c = load().chats[key]; if (!c) return;
    var P = c.people, us = isUS(c);
    if (msgId) { var m = c.msgs.find(function (x) { return x.id === msgId; }); if (m) m.done = a; }
    var me = function (en, pt) { mine(c, en, pt); };
    if (a === 'reqNo') { me('Not yet. Keep the drone on it.', 'Ainda não. Mantenham o drone no local.'); save(); emit(); return; }
    if (a === 'reqConfirm') a = 'confirm';
    if (a === 'reqDismiss') a = 'dismiss';
    if (a === 'confirm' || a === 'dismiss') settleReq(c, a === 'confirm');
    if (a === 'confirm') {
      me('Declaring the fire.', 'Declaro o incêndio.');
      markConfirmed(c);
      setStage(c, 1, 600, 1);
    } else if (a === 'drone') {
      c.flags.drone = true; me('Sending the drone to check before I confirm.', 'Vou enviar o drone para verificar antes de confirmar.');
      sys(c, 'Drone D-5 taking off · about 6 min to the point', 'Drone D-5 a descolar · cerca de 6 min até ao ponto', 1500, 1);
      card(c, { tag: { en: 'Drone D-5 · on site', pt: 'Drone D-5 · no local' }, tagC: '#0A66CC', title: { en: 'Smoke and open flame seen', pt: 'Fumo e chama visíveis' }, body: { en: 'Thermal image shows an active fire front of about 80 m', pt: 'A imagem térmica mostra uma frente ativa de cerca de 80 m' }, link: { en: 'View', pt: 'Ver' } }, 8000, 6);
      say(c, lead(c, 0), 'That matches what we see. It is a real fire.', 'Confirma o que vemos. É um incêndio real.', 11000, 1);
    } else if (a === 'dismiss') {
      me('Dismissing this candidate: no fire on the ground.', 'Descarto este candidato: sem incêndio no terreno.');
      markDismissed(c); c.dismissed = true; c.closed = true; c.closedVt = vnow(c);
      sys(c, 'Candidate dismissed · the crews are released', 'Candidato descartado · equipas libertadas', 600, 0);
    } else if (a === 'dispatch') {
      me('Dispatch: ' + c.stations.slice(0, 2).map(function (s) { return s.short; }).join(' and ') + ' go. ' + (c.stations[2] ? c.stations[2].short + ' on standby.' : ''),
        'Despacho: ' + c.stations.slice(0, 2).map(function (s) { return s.short; }).join(' e ') + ' avançam. ' + (c.stations[2] ? c.stations[2].short + ' de prevenção.' : ''));
      c.flags.dispatched = true;
      c.forces = c.stations.map(function (s, i) { var f = (c.forces || []).find(function (x) { return x.si === i; }); return f || forceFor(c, i, 'standby'); });
      c.forces.forEach(function (f) { f.st = f.si < 2 || f.extra ? 'enroute' : 'standby'; });
      var cm = c.msgs.filter(function (x) { return x.kind === 'card' && x.stage === 1; }).pop();
      if (cm && cm.rows) cm.rows.forEach(function (r, i) { r.r = i < 2 ? { en: 'Dispatched', pt: 'Despachado' } : { en: 'Standby', pt: 'Prevenção' }; r.rc = i < 2 ? '#186B2D' : '#875800'; });
      setStage(c, 2, 1500, 2);
    } else if (a === 'more') {
      c.flags.more = true; var r = c.reserve; me('Calling ' + r.short + ' as well.', 'Chamo também ' + r.short + '.');
      var n = pickNames(c, 1, 'more')[0]; c.people.push({ name: n, code: initials(n), org: r.short, kind: 'lead' }); c.stations.push(r);
      var f = forceFor(c, c.stations.length - 1, c.stage >= 2 ? (c.stage >= 3 ? 'onscene' : 'enroute') : 'standby'); f.extra = true; c.forces.push(f);
      sys(c, n + ', crew coordinator of ' + r.short + ', joined', n + ', coordenador de equipa de ' + r.short + ', entrou na conversa', 900, 1);
      say(c, c.people.length - 1, 'Available, ' + kmTxt(r.km) + ' away.', 'Disponíveis, a ' + kmTxt(r.km) + '.', 4000, 2);
    } else if (a === 'recall') {
      var rf = (c.forces || []).filter(function (f) { return f.st === 'onscene'; }).pop();
      if (rf) { rf.st = 'released'; me('Recalling ' + rf.station + ': released from the fire, back in service.', 'Recolho ' + rf.station + ': libertado do incêndio, de volta ao serviço.');
        var ri = c.people.findIndex(function (p) { return p.org === rf.station; }); if (ri >= 0) say(c, ri, 'Copy. Packing up and heading back.', 'Entendido. A arrumar e a regressar.', 2500, 3); }
    } else if (a === 'update') {
      me('Update, please.', 'Ponto de situação, por favor.');
      if (P[0]) say(c, 0, 'Almost there, smoke column clearly visible.', 'Quase a chegar, coluna de fumo bem visível.', 2500, 2);
    } else if (a === 'approveAir') {
      if (c.flags.air) return; c.flags.air = true;
      me('Air support approved.', 'Meio aéreo aprovado.');
      var heli = us ? 'Helicopter 15' : 'Helicóptero H-21';
      c.air = { name: heli, kind: us ? 'Firefighting helicopter · LAFD Air Operations' : 'Helicóptero de ataque inicial · Força Aérea', st: 'assigned' };
      sys(c, 'Air operations assigned ' + heli + ' · about 12 min to the fire', 'As operações aéreas atribuíram o ' + heli + ' · cerca de 12 min até ao incêndio', 1200, 3);
      push(c, { kind: 'air', st: 'onscene' }, 7000, 12);
      sys(c, heli + ' on scene · first water drops on the head', heli + ' no local · primeiras descargas na cabeça', 7200, 0);
      if (P[0]) say(c, 0, 'That did it. The head is slowing down.', 'Resultou. A cabeça está a abrandar.', 12000, 9);
    } else if (a === 'declineAir') {
      c.flags.airNo = true; me('Not yet. Hold with ground crews for now.', 'Ainda não. Segurem com meios terrestres por agora.');
      if (P[1]) say(c, 1, 'Understood. We will try, but it is spreading fast.', 'Compreendido. Vamos tentar, mas está a progredir rápido.', 3000, 3);
    } else if (a === 'evacPlan') {
      // From the fire screen's People at risk card: ask the team for an evacuation plan; the nearest coordinator takes it on
      c.flags.evac = true; me('Evacuation plan for the people at risk, please.', 'Plano de evacuação para as pessoas em risco, por favor.');
      c.evac = c.evac || { people: 60 + hash(c.key + 'ev') % 180 };
      try { var EV = JSON.parse(localStorage.getItem('wf-evac') || '{}'); EV[c.incId] = Date.now(); localStorage.setItem('wf-evac', JSON.stringify(EV)); } catch (x) {}
      say(c, 0, "Understood. We're taking measures and evacuating the people at risk " + (c.place ? 'in ' + c.place + ' ' : '') + 'now, ' + c.evac.people + ' residents, with ' + (us ? "the sheriff's deputies" : 'the local police') + '. I will report when everyone is out.',
        'Entendido. Estamos a tomar medidas e a evacuar as pessoas em risco ' + (c.place ? 'em ' + c.place + ' ' : '') + 'agora, ' + c.evac.people + ' moradores, com ' + (us ? 'os xerifes' : 'a GNR') + '. Informo quando estiverem todos fora.', 2400, 2);
    } else if (a === 'evac') {
      c.flags.evac = true; me('Evacuation order for the homes north-east of the fire.', 'Ordem de evacuação para as casas a nordeste do incêndio.');
      try { var EV2 = JSON.parse(localStorage.getItem('wf-evac') || '{}'); EV2[c.incId] = Date.now(); localStorage.setItem('wf-evac', JSON.stringify(EV2)); } catch (x) {}   // the fire screen's People at risk then reads Evacuating
      c.evac = { people: 60 + hash(c.key + 'ev') % 180 };
      card(c, { tag: { en: 'Evacuation order', pt: 'Ordem de evacuação' }, tagC: '#B3001B', title: { en: 'Homes north-east of the fire', pt: 'Casas a nordeste do incêndio' }, body: { en: 'Sent to civil protection and ' + (us ? "the sheriff's department" : 'the local police'), pt: 'Enviada à proteção civil e às forças de segurança locais' } }, 800, 1);
      sys(c, us ? "Sheriff's deputies moving " + c.evac.people + ' residents to the evacuation center' : 'Local police (GNR) moving ' + c.evac.people + ' residents to the parish hall', us ? 'Xerifes a encaminhar ' + c.evac.people + ' moradores para o centro de evacuação' : 'GNR a encaminhar ' + c.evac.people + ' moradores para a junta de freguesia', 5000, 14);
    } else if (a === 'drone3') {
      c.flags.drone3 = true; me('Send a drone over the head to read the fire behaviour.', 'Enviem um drone sobre a cabeça para ler o comportamento do fogo.');
      card(c, { tag: { en: 'Drone D-5 · over the head', pt: 'Drone D-5 · sobre a cabeça' }, tagC: '#0A66CC', title: { en: 'Running upslope', pt: 'A subir a encosta' }, body: { en: 'Spotting up to 50 m ahead of the head', pt: 'Projeções até 50 m à frente da cabeça' }, fire: true }, 6000, 8);
    } else if (a === 'next') {
      var nx = c.stage + 1;
      jump(c, stageSpan(c, nx) * MIN);   // the hours this stage took, before you move it on
      me('Moving the fire to ' + STAGES[nx].en + '.', 'Passo o incêndio a ' + STAGES[nx].pt + '.');
      setStage(c, nx, 800, 0);
    } else if (a === 'closeCheck') {
      c.flags.closeCard = true;
      // (Oct 4) asked again while the "Ready to close" card is still waiting far up the chat: it comes down to the bottom, so closing is never out of reach
      c.msgs = c.msgs.filter(function (m) { return !(m.kind === 'card' && m.close); }); c.queue = c.queue.filter(function (q) { return !(q.m && q.m.kind === 'card' && q.m.close); });
      card(c, { close: true, tag: { en: 'Ready to close', pt: 'Pronto a encerrar' }, tagC: '#00606A', title: { en: 'Close fire', pt: 'Encerrar incêndio' },
        checks: [{ en: 'No active edge or hotspots', pt: 'Sem frente ativa nem pontos quentes' }, { en: c.flags.evac ? 'Evacuation order lifted' : 'No evacuation orders in force', pt: c.flags.evac ? 'Ordem de evacuação levantada' : 'Sem ordens de evacuação em vigor' }, { en: 'All crews accounted for', pt: 'Todas as equipas contabilizadas' }],
        actions: [{ key: 'close', en: 'Close fire', pt: 'Encerrar incêndio', primary: true }] }, 400, 0);
    } else if (a === 'close') {
      jump(c, stageSpan(c, 7) * MIN);
      me('Declaring the fire closed. Thank you all.', 'Declaro o incêndio encerrado. Obrigado a todos.');
      setStage(c, 7, 800, 0);
    }
    c.updated = Date.now(); c.seenAt = Date.now(); save(); emit(); tick();
  }

  // ---- role play: each crew coordinator answers in their own voice, from what you wrote and where the fire is ----------
  // 0: veteran, terse radio style · 1: careful, safety first · 2: younger, upbeat. Answers read the fire's state
  // (stage, area, air support, evacuation, time on scene), so they stay plausible as the fire evolves.
  var VOICE = [
    { ack: ['Copy.', 'Entendido.'], ok: ['Copy that.', 'Recebido.'] },
    { ack: ['Understood.', 'Compreendido.'], ok: ['Understood, will do.', 'Compreendido, vamos fazer isso.'] },
    { ack: ['On it!', 'Já estamos nisso!'], ok: ['Sure thing, on it.', 'Certo, já está.'] }
  ];
  var INTENTS = [
    ['thanks', /\b(thank|thanks|good job|great work|well done)|obrigad|bom trabalho|parab[eé]ns/i],
    ['safety', /\b(safe|safety|injur|hurt|crew ok|everyone ok|fatigue|tired|rest)|segur|ferid|cansa|descans/i],
    ['eta', /\b(eta|arriv|how long|when will|how far)|chegada|chegar|quanto tempo|quando chegam|a que dist/i],
    ['wind', /\b(wind|weather|humidity|temperature|gust)|vento|meteo|humidade|temperatura|rajada/i],
    ['water', /\b(water|hydrant|tanker|tender|refill|foam)|[aá]gua|hidrante|abastec|autotanque/i],
    ['homes', /\b(house|home|homes|evac|residents|people|road)|casa|evacua|morador|popula|estrada/i],
    ['need', /\b(need|resources|reinforce|backup|more crews|support)|precis|meios|refor[cç]o|apoio/i],
    ['order', /\b(hold|flank|attack|defend|protect|move to|go to|cut|line|anchor|focus)|segur|flanco|atac|defend|protej|avanc|linha|cort/i],
    ['status', /\b(update|status|situation|how is|how's|progress|report|sitrep|what do you see)|ponto de situa|situa[cç][aã]o|como est|progress|relat|o que v[eê]|fumo|smoke|pront|ready/i]
  ];
  function intentOf(t) { for (var i = 0; i < INTENTS.length; i++) if (INTENTS[i][1].test(t)) return INTENTS[i][0]; return 'other'; }
  function areaNow(c) {   // hectares burning, growing until the head is held
    if (c.realHa) return c.realHa;   // the published burnt area
    var S = stats(c), H = c.hist || [], on = H.find(function (h) { return h.s === 3; }), held = H.find(function (h) { return h.s === 4; });
    if (c.stage < 3 || !on) return Math.max(0.3, Math.round(S.ha * 0.08 * 10) / 10);
    if (held) return S.ha;
    var f = Math.min(0.95, 0.25 + (vnow(c) - on.vt) / (150 * MIN));
    return Math.round(S.ha * f * 10) / 10;
  }
  function areaTxt(c, pt) { var ha = areaNow(c); return isUS(c) ? Math.round(ha * 2.471) + ' acres' : String(ha).replace('.', pt ? ',' : '.') + ' ha'; }
  function onSceneFor(c) { var H = c.hist || [], on = H.find(function (h) { return h.s === 3; }); return on ? dur(vnow(c) - on.vt) : ''; }
  function reply(c, who, it, text) {
    var s = c.stage, V = VOICE[who % 3], us = isUS(c), P = c.people, eta = c.stations[who] ? c.stations[who].min : 15;
    var dir = ['north-east', 'nordeste'], wind = ['south-west, about 18 km/h with gusts to 30', 'sudoeste, cerca de 18 km/h com rajadas de 30'];
    var r = function (en, pt) { return [V.ack[0] + ' ' + en, V.ack[1] + ' ' + pt]; };
    if (it === 'thanks') return s >= 6 ? ['Thank you. It was a good team effort out here.', 'Obrigado. Foi um bom trabalho de equipa aqui.'] : [V.ok[0] + ' Appreciated, we keep pushing.', V.ok[1] + ' Obrigado, continuamos.'];
    if (it === 'safety') return s < 2 ? r('Crew is rested and ready to go.', 'Equipa descansada e pronta para sair.') : s < 6
      ? r('All ' + (c.forces[who] ? c.forces[who].crew.length + 1 : 5) + ' of us accounted for, no injuries. Rotating on the hose line every 40 min.', 'Os ' + (c.forces[who] ? c.forces[who].crew.length + 1 : 5) + ' contabilizados, sem feridos. Rodamos na linha de mangueira a cada 40 min.')
      : r('Everyone is fine and back or heading back to the station.', 'Todos bem, já no quartel ou a regressar.');
    if (it === 'eta') return s < 2 ? r('We are ' + eta + ' min away once you give the order.', 'Estamos a ' + eta + ' min assim que der a ordem.') : s === 2 ? r('About ' + Math.max(2, eta - 6) + ' min to the fire line.', 'Cerca de ' + Math.max(2, eta - 6) + ' min até à linha de fogo.') : r('We are already on scene, ' + onSceneFor(c) + ' now.', 'Já estamos no local, há ' + onSceneFor(c) + '.');
    if (it === 'wind') return r('Wind from the ' + wind[0] + '. Humidity dropping in the afternoon, that is what drives the head ' + dir[0] + '.', 'Vento de ' + wind[1] + '. A humidade desce à tarde, é isso que empurra a cabeça para ' + dir[1] + '.');
    if (it === 'water') return s < 3 ? r('Tanks full, ' + (us ? 'hydrants mapped along the road' : 'pontos de água identificados') + '.', 'Tanques cheios, pontos de água identificados.') : r((s >= 5 ? 'Plenty for the mop-up.' : 'Half a tank left, ' + (us ? 'the water tender' : 'o autotanque') + ' refills us in 15 min.'), (s >= 5 ? 'Chega bem para o rescaldo.' : 'Meio tanque, o autotanque reabastece-nos em 15 min.'));
    if (it === 'homes') return c.evac ? r(c.evac.people + ' residents moved out, the homes to the ' + dir[0] + ' are being protected.', c.evac.people + ' moradores retirados, as casas a ' + dir[1] + ' estão a ser protegidas.')
      : s >= 4 ? r('No homes at risk any more.', 'Já não há casas em risco.') : r('Homes about 1 km ' + dir[0] + '. If the head is not held in the next hour I would evacuate.', 'Casas a cerca de 1 km a ' + dir[1] + '. Se a cabeça não for dominada na próxima hora, eu evacuaria.');
    if (it === 'need') return s === 3 && !c.flags.air ? r('Air support would make the difference on the head.', 'Um meio aéreo faria a diferença na cabeça.') : s >= 5 ? r('We are fine with what we have for the mop-up.', 'Estamos bem com o que temos para o rescaldo.') : r('We are holding with what we have, will shout if that changes.', 'Estamos a aguentar com o que temos, avisamos se mudar.');
    if (it === 'order') { var q = String(text).trim().replace(/[.!]+$/, ''); return [V.ok[0] + ' "' + q + '". Moving now.', V.ok[1] + ' "' + q + '". A avançar.']; }
    if (it === 'status') {
      if (s === 0) return r('Smoke column still visible from here, drifting ' + dir[0] + '.', 'Coluna de fumo ainda visível daqui, a derivar para ' + dir[1] + '.');
      if (s === 1) return r('Crew kitted up and waiting for your dispatch order.', 'Equipa equipada, à espera da sua ordem de despacho.');
      if (s === 2) return r('En route, ' + Math.max(2, eta - 6) + ' min out, smoke clearly visible ahead.', 'A caminho, a ' + Math.max(2, eta - 6) + ' min, fumo bem visível à frente.');
      if (s === 3) return r('About ' + areaTxt(c) + ' burnt so far. Head running ' + dir[0] + ', we are anchored on the south flank.' + (c.air && c.air.st === 'onscene' ? ' The helicopter is slowing it.' : ''), 'Cerca de ' + areaTxt(c, 1) + ' ardidos até agora. Cabeça a correr para ' + dir[1] + ', estamos ancorados no flanco sul.' + (c.air && c.air.st === 'onscene' ? ' O helicóptero está a abrandá-la.' : ''));
      if (s === 4) return r('Head held at ' + areaTxt(c) + '. Closing the flanks, maybe two hours to go.', 'Cabeça dominada com ' + areaTxt(c, 1) + '. A fechar os flancos, talvez mais duas horas.');
      if (s === 5) return r('Perimeter secure. Hotspots only in the ' + (us ? 'brush' : 'mato') + ' near the road.', 'Perímetro seguro. Só pontos quentes no mato junto à estrada.');
      if (s === 6) return r('Quiet. Thermal camera shows nothing above ambient.', 'Calmo. A câmara térmica não mostra nada acima da temperatura ambiente.');
      return ['All done here. Crew back at the station.', 'Tudo terminado. Equipa de volta ao quartel.'];
    }
    // anything else: acknowledge in context
    return s < 2 ? [V.ok[0] + ' Standing by for your decision.', V.ok[1] + ' A aguardar a sua decisão.'] : s < 6 ? [V.ok[0] + ' We will factor that in on the line.', V.ok[1] + ' Vamos ter isso em conta na linha.'] : [V.ok[0], V.ok[1]];
  }
  // Who answers: whoever you name (by first name or station), else whoever that topic belongs to
  function responder(c, t) {
    var P = c.people, low = String(t).toLowerCase();
    for (var i = 0; i < P.length; i++) { var fn = P[i].name.split(' ')[0].toLowerCase(); if (low.indexOf(fn) >= 0 || (P[i].org && low.indexOf(P[i].org.toLowerCase()) >= 0)) return i; }
    return -1;
  }

  // Orders configured on the fire's dispatch screen: the chat records what was actually sent, the chosen stations'
  // crews go en route (a station not yet in the chat joins with its coordinator), and the fire moves on. Works whether
  // the dispatch screen was opened from the chat or not: orders sent before the chat existed are kept (pend) and posted
  // when it is first opened, so the team has already received them there. delay: ms before the beats start.
  function dispatched(key, orders, delay) {
    var c = load().chats[key]; if (!c || c.dismissed || c.closed || c.stage > 1 || c.flags.dispatched) return;
    c.msgs.forEach(function (m) { if (m.dispCard && !m.done) m.done = 'dispatch'; });   /* the card's Configure dispatch becomes ✓ Crews dispatched */
    var airOrd = (orders || []).some(function (o) { return o && o.id === 'air'; });   /* (Oct 5) air support sent too: its lead joins and confirms like the stations */
    orders = (orders || []).filter(function (o) { return o && o.name && o.id !== 'air'; });
    if (!orders.length && !airOrd) return;
    // (Oct 5) what the coordinators were still about to say before the order (availability replies) lands now, as already read,
    // so after the order the only new messages are their confirmations (one per station and air team)
    var pre = c.queue.filter(function (q) { return q.m && q.m.kind !== 'stage' && q.m.kind !== 'air'; }), t0 = Date.now();
    c.queue = c.queue.filter(function (q) { return !(q.m && q.m.kind !== 'stage' && q.m.kind !== 'air'); });
    pre.forEach(function (q, i) { var m = q.m; delete m.adv; m.t = t0 - (pre.length - i) * 400; m.vt = vnow(c); c.msgs.push(m); });
    if (pre.length) c.seenAt = t0;
    var d = delay || 0;
    var norm = function (t) { return String(t || '').toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ' ').trim(); };
    var sent = [];
    orders.forEach(function (o) {
      var i = c.stations.findIndex(function (st) { var a = norm(st.name), b = norm(o.name); return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0; });
      if (i < 0) {
        c.stations.push({ name: o.name, short: shortStation(o.name), km: o.km || 5, min: o.eta || 10 });
        i = c.stations.length - 1; var nm = pickNames(c, 1, 'd' + i)[0];
        c.people.push({ name: nm, code: initials(nm), org: shortStation(o.name), kind: 'lead' });
        sys(c, nm + ', ' + leadRole(c).en.toLowerCase() + ' of ' + shortStation(o.name) + ', joined', nm + ', ' + leadRole(c).pt.toLowerCase() + ' de ' + shortStation(o.name) + ', entrou na conversa', d + 300, 0);
      }
      var f = (c.forces || []).find(function (x) { return x.si === i; }) || (function () { var ff = forceFor(c, i, 'enroute'); c.forces = (c.forces || []).concat([ff]); return ff; })();
      f.st = 'enroute'; if (o.units && o.units.length) f.veh = o.units.map(function (u) { return u.n + ' × ' + u.label; });
      sent.push({ i: i, txt: c.stations[i].short + (o.units && o.units.length ? ' (' + o.units.map(function (u) { return u.n + ' ' + u.label.toLowerCase(); }).join(', ') + ')' : '') });
    });
    (c.forces || []).forEach(function (f) { if (!sent.some(function (x) { return x.i === f.si; }) && f.st !== 'enroute') f.st = 'standby'; });
    c.flags.dispatched = true; c.sentIdx = sent.map(function (x) { return x.i; });
    // (Oct 3, 22:03) the fire is declared: the chat keeps the leads of the stations sent; the others leave it
    c.people.forEach(function (p, pi) { if (p.left || p.kind === 'air' || sent.some(function (x) { return x.i === pi; })) return; p.left = true;
      sys(c, p.name + ' (' + p.org + ') left the chat: station not sent', p.name + ' (' + p.org + ') saiu da conversa: quartel não enviado', d + 400, 0); });
    // Confirmed outside the chat (alert or drone screen): the chat catches up with the confirmation first
    if (c.stage === 0) {
      push(c, { kind: 'msg', from: 'me', en: 'Declaring the fire.', pt: 'Declaro o incêndio.' }, d, 1);
      setStage(c, 1, d + 600, 1); d += 1600;
    }
    var en = 'Dispatch orders sent: ' + sent.map(function (x) { return x.txt; }).join('; ') + '.', pt = 'Ordens de despacho enviadas: ' + sent.map(function (x) { return x.txt; }).join('; ') + '.';
    if (d) push(c, { kind: 'msg', from: 'me', en: en, pt: pt }, d, 1); else mine(c, en, pt);
    // The stage card lists the stations: those that got an order are marked dispatched, the others on standby
    c.msgs.concat(c.queue.map(function (q) { return q.m; })).forEach(function (m) { if (m.kind === 'card' && m.stage === 1 && m.rows) sentRows(c, m.rows); });
    // (Oct 4) every coordinator whose station got an order confirms it, one after the other, so the chat shows the team has received the orders
    // (Oct 5) every lead that got an order confirms it (stations and the air team), in no particular order, each saying they are heading
    // to the fire; they arrive unread, so the chat's badge counts one per station and air team
    var OK = [['Order received. Rolling now, ETA {m} min.', 'Ordem recebida. A sair agora, chegada em {m} min.'], ['Copy that. Crew on the way to the fire, {m} min out.', 'Recebido. Equipa a caminho do incêndio, a {m} min.'], ['Received. We are moving, about {m} min to the fire line.', 'Recebido. Estamos a mover-nos, cerca de {m} min até à linha de fogo.'], ['Order confirmed. Leaving the station now, {m} min.', 'Ordem confirmada. A sair do quartel, {m} min.']];
    var who = sent.map(function (x) { return { i: x.i < c.people.length ? x.i : 0, m: (c.stations[x.i] && c.stations[x.i].min) || 15 }; });
    if (airOrd) { c.flags.air = true; if (!c.air) { var us0 = isUS(c), hl = us0 ? 'Helicopter 15' : 'Helicóptero H-21'; c.air = { name: hl, kind: us0 ? 'Firefighting helicopter · LAFD Air Operations' : 'Helicóptero de ataque inicial · Força Aérea', st: 'assigned' }; }   /* (Oct 7) air ordered in the dispatch is part of the story: forces, summary, trophy */
      ensureAir(c); var ai = c.people.findIndex(function (p) { return p.kind === 'air'; }); if (ai >= 0) who.push({ i: ai, m: 12, air: true }); }
    for (var z = who.length - 1; z > 0; z--) { var r = Math.floor(Math.random() * (z + 1)), tmp = who[z]; who[z] = who[r]; who[r] = tmp; }
    var at = d + 1200;
    who.forEach(function (w, n) { var o = w.air ? ['Air support received the order. Wheels up, over the fire in {m} min.', 'Meios aéreos receberam a ordem. A descolar, sobre o incêndio em {m} min.'] : OK[n % OK.length];
      say(c, w.i, o[0].replace('{m}', w.m), o[1].replace('{m}', w.m), at, 1); at += 900 + Math.round(Math.random() * 1400); });
    c.acked = true; setStage(c, 2, at + 600, 2);
    c.updated = Date.now(); c.seenAt = Date.now(); save(); emit();
  }
  function sentRows(c, rows) { rows.forEach(function (r, i) { var on = (c.sentIdx || []).indexOf(i) >= 0; r.r = on ? { en: 'Dispatched', pt: 'Despachado' } : { en: 'Standby', pt: 'Prevenção' }; r.rc = on ? '#186B2D' : '#875800'; }); }
  // Orders sent from the dispatch screen for a fire whose chat is not open yet: kept until the chat is created
  function pend(inc, orders) {
    var db = load(), k = keyOf(inc);
    if (db.chats[k]) { dispatched(k, orders); return; }
    db.sent = db.sent || {}; db.sent[k] = orders; save();
  }

  function send(key, text) {
    var c = load().chats[key]; if (!c || !String(text || '').trim()) return;
    text = String(text).trim(); mine(c, text, text);
    if (c.kind === 'dm' && c.police) { if (aiKey()) policeAi(c, text); else policeReply(c, text); c.updated = Date.now(); c.seenAt = Date.now(); save(); emit(); return; }
    if (c.kind === 'dm') { dmReply(c, text); c.updated = Date.now(); c.seenAt = Date.now(); save(); emit(); return; }
    if (!c.dismissed && c.stage < 7 && c.people.length) {
      var rules = function (c) { ruleReply(c, text); };
      if (aiKey()) aiReply(c, text, rules); else rules(c);
    }
    c.updated = Date.now(); c.seenAt = Date.now(); c.idleAt = Date.now(); save(); emit();
  }
  // The in-app answer to a message (also used when a Claude answer was lost because the screen was left mid-call)
  // What the fire's Crews tab shows (water left, crews due relief), saved by the fire screen: the coordinators answer from it
  function crewState(c) { var M = {}; try { M = JSON.parse(localStorage.getItem('wf-crew') || '{}'); } catch (e) {}
    for (var id in M) { if (id === c.incId || keyOf({ id: id, kind: 'fire' }) === c.key) return M[id]; } return null; }
  function whoFor(c, name) { var a = String(name || '').toLowerCase(); for (var i = 0; i < c.people.length; i++) { var o = String(c.people[i].org || '').toLowerCase(); if (o && (a.indexOf(o) >= 0 || o.indexOf(a) >= 0 || a.indexOf(shortStation(name).toLowerCase()) >= 0 && shortStation(name).toLowerCase() === o)) return i; } return -1; }
  var NUM = { en: ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'], pt: ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito'] };
  function nw(n, pt) { var w = (pt ? NUM.pt : NUM.en)[n] || String(n); return w.charAt(0).toUpperCase() + w.slice(1); }
  // Water or relief asked in a fire's chat: each station with a problem answers for its own units, with the same numbers
  function crewReply(c, it) {
    var S = crewState(c); if (!S || !S.st || !S.st.length || c.stage < 3 || c.stage > 5) return false;
    var key = it === 'water' ? 'low' : 'tired', tot = it === 'water' ? 'tenders' : 'crews', bad = S.st.filter(function (x) { return x[key] && x[key].length; }), d = 2000;
    if (!bad.length) { var any = S.st.filter(function (x) { return x[tot]; }); if (!any.length) return false; var w0 = whoFor(c, any[0].name);
      say(c, w0 >= 0 ? w0 : 0, it === 'water' ? 'All ' + any.reduce(function (a, x) { return a + x.tenders; }, 0) + ' water tenders above 20%. No one needs to refill yet.' : 'Every crew is within its shift. No one due for relief yet.',
        it === 'water' ? 'Os ' + any.reduce(function (a, x) { return a + x.tenders; }, 0) + ' autotanques acima de 20%. Ninguém precisa de reabastecer já.' : 'Todas as equipas dentro do turno. Ninguém para render já.', d, 1); return true; }
    bad.forEach(function (x, j) { var w = whoFor(c, x.name); if (w < 0) w = Math.min(c.people.length - 1, j); var k = x[key].length, n = x[tot];
      var en = it === 'water' ? nw(k) + ' of our ' + n + ' water tender' + (n === 1 ? '' : 's') + ' below 20%: ' + x.low.join(', ') + '. ' + (k === 1 ? 'It is' : 'They are') + ' heading to refill.'
        : nw(k) + ' of our ' + n + ' crew' + (n === 1 ? '' : 's') + ' past 12 h on shift: ' + x.tired.join(', ') + '. ' + (k === 1 ? 'It needs' : 'They need') + ' relief.';
      var pt = it === 'water' ? nw(k, 1) + ' dos nossos ' + n + ' autotanques abaixo de 20%: ' + x.low.join(', ') + '. ' + (k === 1 ? 'Vai' : 'Vão') + ' reabastecer.'
        : nw(k, 1) + ' das nossas ' + n + ' equipas com mais de 12 h de turno: ' + x.tired.join(', ') + '. ' + (k === 1 ? 'Precisa' : 'Precisam') + ' de ser rendida' + (k === 1 ? '' : 's') + '.';
      say(c, w, en, pt, d + j * 2600, vary(c, 1, 4, 'w' + j + c.beat)); });
    c.beat++; return true;
  }
  function ruleReply(c, text) {
      (function (c) {
      var it = intentOf(text), named = responder(c, text), n = c.people.length;
      if ((it === 'water' || (it === 'safety' && /fatigue|tired|rest|relief|cansa|descans|rend/i.test(text))) && crewReply(c, it === 'water' ? 'water' : 'relief')) return;
      var byTopic = { safety: 1, water: 2, homes: 1, wind: 0, eta: 0, need: 1, status: 0, order: 0, thanks: 0, other: c.beat % n };
      var who = named >= 0 ? named : Math.min(n - 1, byTopic[it] != null ? byTopic[it] : 0);
      var a = reply(c, who, it, text); c.beat++;
      say(c, who, a[0], a[1], 2000 + (c.beat % 3) * 700, vary(c, 1, 6, 'b' + c.beat));
      if (named < 0 && n > 1 && (it === 'status' || it === 'safety') && c.stage >= 2 && c.stage <= 5) {
        var w2 = (who + 1) % n, b2 = reply(c, w2, it, text);
        if (it === 'status') b2 = c.stage === 2 ? ['Right behind them, same ETA.', 'Logo atrás, mesma hora de chegada.'] : ['Same on our side: ' + (c.stage >= 4 ? 'flank quiet.' : 'north flank still active, we are holding it.'), 'Do nosso lado igual: ' + (c.stage >= 4 ? 'flanco calmo.' : 'flanco norte ainda ativo, estamos a segurá-lo.')];
        say(c, w2, b2[0], b2[1], 5200, vary(c, 1, 4, 'c' + c.beat));
      }
      })(c);
  }



  // ---- direct chats: a station's command team or one of its crew chiefs, outside any incident -------------------------
  // Opened from the station screen. Scripted: you ask for support, they offer the crew they have, you say where, they roll.
  function direct(o) {
    var db = load(), k = 'd:' + o.id;
    if (db.chats[k]) return db.chats[k];
    var now = Date.now(), g = o.people.length > 1;
    var ch = { key: k, kind: 'dm', incId: o.id, place: o.title, reg: o.org || '', st: o.st || '', lat: +o.lat || 0, lon: +o.lon || 0, x: o.x, y: o.y, note: '', offer: o.offer || null, eta: o.eta || 15,
      stage: 0, startStage: 0, started: now, vNow: now, vAt: now, hist: [{ s: 0, vt: now }],
      people: o.people.map(function (p) { return { name: p.name, code: initials(p.name), org: o.org || '', kind: 'lead', roleEn: p.roleEn, rolePt: p.rolePt }; }),
      stations: [{ ck: o.ck || '', name: o.station || o.org || '', short: o.org || '', km: 0, min: 0 }], forces: [], air: null, evac: null,
      msgs: [], queue: [], seenAt: now, beat: 0, flags: {}, closed: false, dismissed: false, updated: now, face: o.face || {}, used: {}, step: 0 };
    o.people.forEach(function (p) { ch.used[p.name] = 1; });
    mine(ch, g ? 'Hello everyone, how are you?' : 'Hello ' + o.people[0].name.split(' ')[0] + ', how are you?', g ? 'Olá a todos, como estão?' : 'Olá ' + o.people[0].name.split(' ')[0] + ', como estás?');
    say(ch, 0, g ? 'Hello! All good, the command team is here. How can we help?' : 'Hello! All good here. How can I help?', g ? 'Olá! Tudo bem, está cá a equipa de comando. Em que podemos ser úteis?' : 'Olá! Tudo bem por aqui. Em que posso ser útil?', 2200, 1);
    db.chats[k] = ch; save(); emit(); return ch;
  }
  // ---- direct chats: the topic is the incident being talked about (a fire or an ignition candidate within 50 km) -------
  function kmBetween(a, b) { var R0 = 6371, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lon - a.lon) * t, x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) * Math.sin(dLo / 2); return 2 * R0 * Math.asin(Math.min(1, Math.sqrt(x))); }
  function nearby(c, maxKm) {
    maxKm = maxKm || 50; var me = { lat: +c.lat, lon: +c.lon }; if (!isFinite(me.lat) || !isFinite(me.lon) || (!me.lat && !me.lon)) return [];
    var out = [];
    (window.__wfLiveFires || []).forEach(function (r) { if (!r || r[5] == null) return; var inc = incFire({ id: r[2], place: r[3], co: r[1], st: r[0], note: r[4], x: r[5], y: r[6], info: r[7] || null }), km = kmBetween(me, inc);
      if (km <= maxKm) out.push({ inc: inc, km: km, kind: 'fire' }); });
    (window.__wfLiveCands || []).forEach(function (r) { if (!r) return; var L0 = r[9] || {}, inc = incCand({ id: r[2], place: r[3], co: r[1], st: r[0], conf: r[4], srcList: String(r[5] || '').replace(/^sat:/, 'Satellite '), x: r[7], y: r[8], live: L0 }), km = kmBetween(me, inc);
      if (km <= maxKm) out.push({ inc: inc, km: km, kind: 'cand' }); });
    return out.sort(function (a, b) { return a.km - b.km; });
  }
  function setTopic(key, inc) {
    var c = load().chats[key]; if (!c || !inc) return;
    var fire = inc.kind === 'fire', P = c.people[0] || {};
    c.topic = { id: inc.id, kind: inc.kind, place: inc.place, reg: inc.reg || '', st: inc.st || '', lat: inc.lat, lon: inc.lon, conf: inc.conf || null, x: inc.x, y: inc.y };
    mine(c, 'Topic: ' + inc.place + '.', 'Tópico: ' + inc.place + '.');
    card(c, { topic: true, tag: { en: 'Topic', pt: 'Tópico' }, tagC: '#3A3A3C', title: { en: (fire ? 'Fire. ' : 'Ignition candidate. ') + inc.place, pt: (fire ? 'Incêndio. ' : 'Candidato a ignição. ') + inc.place },
      body: { en: (inc.reg ? inc.reg + '. ' : '') + Math.round(kmBetween({ lat: +c.lat, lon: +c.lon }, inc)) + ' km from the station' + (!fire && inc.conf ? '. ' + inc.conf + '% likelihood' : ''), pt: (inc.reg ? inc.reg + '. ' : '') + Math.round(kmBetween({ lat: +c.lat, lon: +c.lon }, inc)) + ' km do quartel' + (!fire && inc.conf ? '. ' + inc.conf + '% de probabilidade' : '') },
      link: { en: 'View', pt: 'Ver' }, inc: c.topic }, 300, 0);
    say(c, 0, fire ? 'Copy, ' + inc.place + '. We know the area, tell us what you need there.' : 'Copy, the candidate at ' + inc.place + '. We can go and check it if you want.',
      fire ? 'Entendido, ' + inc.place + '. Conhecemos a zona, diga o que precisa lá.' : 'Entendido, o candidato em ' + inc.place + '. Podemos ir verificar, se quiser.', 2400, 2);
    c.updated = Date.now(); c.seenAt = Date.now(); save(); emit();
  }
  function dmReply(c, text) {
    var t = String(text).toLowerCase(), n = c.people.length, b = c.beat++, O = c.offer || { en: 'a crew of 5 and a fire engine', pt: 'uma equipa de 5 e um veículo' };
    var q = String(text).trim().replace(/[.!?]+$/, '');
    if (/obrigad|thank|valeu|cheers/.test(t)) { say(c, 0, 'Anytime. We keep you posted.', 'Às ordens. Vamos dando notícias.', 1800, 1); return; }
    if (c.step === 0) {   // the ask: they offer what the station has free
      if (c.topic && /(send|crew|team|equipa|enviar|mandar|ajuda|help)/.test(t)) { c.step = 2;   // the topic already says where
        say(c, 0, 'Yes. I can send ' + O.en + ' to ' + c.topic.place + ', out of the station in 5 min, about ' + c.eta + ' min to get there.', 'Sim. Posso enviar ' + O.pt + ' para ' + c.topic.place + ', a sair do quartel em 5 min, cerca de ' + c.eta + ' min até lá.', 2400, 2);
        if (n > 1) say(c, 1, 'Crew kitting up now.', 'Equipa a equipar-se.', 5200, 1); return; }
      c.step = 1;
      say(c, 0, 'Yes, that is possible. I can send ' + O.en + ', out of the station in 5 min. Where do you need us?', 'Sim, é possível. Posso enviar ' + O.pt + ', a sair do quartel em 5 min. Para onde?', 2400, 2);
      if (n > 1) say(c, 1, 'I will get them kitted up now.', 'Vou já pô-los a equipar.', 5200, 1);
      return;
    }
    if (c.step === 1) {   // the place: they roll
      c.step = 2;
      say(c, 0, 'Understood: "' + q + '". Rolling now, about ' + c.eta + ' min out. I will report on arrival.', 'Entendido: "' + q + '". A sair agora, cerca de ' + c.eta + ' min até lá. Dou notícias à chegada.', 2400, 2);
      say(c, n > 1 ? 1 : 0, 'Crew out of the station.', 'Equipa saiu do quartel.', 9000, 5);
      return;
    }
    if (/quanto|when|eta|minut|tempo|how long|chegam|arriv/.test(t)) { say(c, 0, 'About ' + Math.max(3, c.eta - 6) + ' min to go.', 'Faltam cerca de ' + Math.max(3, c.eta - 6) + ' min.', 2000, 1); return; }
    if (/água|agua|water|tanque|tank/.test(t)) { say(c, n > 1 ? 1 : 0, 'Tanks full. A water tender can follow if needed.', 'Tanques cheios. Se for preciso, segue um autotanque.', 2000, 1); return; }
    say(c, b % n, 'Understood.', 'Entendido.', 1800, 1);
  }

  // ---- Claude role play --------------------------------------------------------------------------------------------
  // With an Anthropic API key saved in Preferences (kept only on this phone), the crew coordinators' answers and their
  // unprompted progress updates are written by Claude, in character, from the whole picture of the fire. Without a key,
  // or if a call fails, the in-app replies above take over, so the chat never stalls.
  var AIK = 'wf-ai-key', AIS = 'wf-ai-status', MODELS = ['claude-sonnet-5-5', 'claude-haiku-4-5-20251001'];
  function rawKey() { try { return localStorage.getItem(AIK) || ''; } catch (e) { return ''; } }
  function aiOff() { try { return localStorage.getItem('wf-ai-off') === '1'; } catch (e) { return false; } }
  function aiKey() { return aiOff() ? '' : rawKey(); }   // switched off: the key stays saved, the in-app replies are used
  function aiStatus(st) { if (st) { try { localStorage.setItem(AIS, JSON.stringify(st)); } catch (e) {} try { window.dispatchEvent(new Event('wf-chat')); } catch (e) {} return st; } try { return JSON.parse(localStorage.getItem(AIS) || 'null'); } catch (e) { return null; } }
  function aiCall(system, user, maxTok, cb, mi) {
    var k = aiKey(); mi = mi || 0; if (!k) return cb(new Error('No API key'));
    fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: MODELS[mi], max_tokens: maxTok || 600, system: system, messages: [{ role: 'user', content: user }] }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, code: r.status, j: j }; }); })
      .then(function (x) {
        if (!x.ok) { if ((x.code === 404 || x.code === 400) && mi + 1 < MODELS.length && /model/i.test(JSON.stringify(x.j))) return aiCall(system, user, maxTok, cb, mi + 1); throw new Error((x.j.error && x.j.error.message) || ('HTTP ' + x.code)); }
        var t = (x.j.content || []).map(function (b) { return b.text || ''; }).join('');
        aiStatus({ ok: true, at: Date.now(), model: MODELS[mi] }); cb(null, t);
      })
      .catch(function (e) { aiStatus({ ok: false, at: Date.now(), err: String(e && e.message || e) }); cb(e); });
  }
  function parseJSON(t) { var a = String(t).indexOf('{'), b = String(t).lastIndexOf('}'); if (a < 0 || b < a) return null; try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; } }
  var VOICES = ['a veteran with 25 years on the line: terse radio style, calm, practical, no small talk',
    'careful and safety-first: thinks about crew welfare, escape routes, residents and risk',
    'younger and upbeat: energetic, quick on the tools and the water, keen to get it done'];
  function aiBrief(c) {
    var us = isUS(c), S = stats(c), pt = PT(), H = c.hist || [];
    var tl = H.map(function (h, i) { var nx = H[i + 1]; return STAGES[h.s].en + ' from ' + hhmm(h.vt) + (nx ? ' for ' + dur(nx.vt - h.vt) : ' (current, ' + dur(vnow(c) - h.vt) + ' so far)'); }).join('; ');
    var team = c.people.map(function (p, i) { if (p.left) return ''; var f = (c.forces || []).find(function (x) { return x.si === i; });
      return '#' + i + ' ' + p.name + ', ' + (p.roleEn ? p.roleEn.toLowerCase() : leadRole(c).en.toLowerCase()) + ' of ' + p.org + (c.stations[i] ? ' (' + kmTxt(c.stations[i].km) + ' away, ~' + c.stations[i].min + ' min drive)' : '') +
        (f ? ', crew: ' + f.crew.join(', ') + ', vehicles: ' + f.veh.join(', ') + ', status: ' + f.st : ', not dispatched yet') + '. Voice: ' + VOICES[i % 3] + '.'; }).filter(Boolean).join('\n');
    var tr = c.msgs.slice(-28).map(function (m) {
      var at = '[' + hhmm(m.vt || m.t) + '] ';
      if (m.kind === 'msg') return at + (m.from === 'me' ? 'FIRE OWNER' : (c.people[m.from] || {}).name || '?') + ': ' + (pt ? m.pt || m.en : m.en);
      if (m.kind === 'sys') return at + 'EVENT: ' + m.en;
      if (m.kind === 'card') return at + 'CARD: ' + [m.tag && m.tag.en, m.title && m.title.en, m.body && m.body.en].filter(Boolean).join(' · ');
      return '';
    }).filter(Boolean).join('\n');
    return 'Incident: ' + (c.kind === 'cand' && c.stage === 0 ? 'ignition candidate' : 'wildfire') + ' near ' + c.place + (c.reg ? ', ' + c.reg : '') + ' (' + (us ? 'United States: use miles/acres only if natural, crews say "engine", "brush", "hose lay"' : 'use km and hectares') + ').\n' +
      'Current stage: ' + STAGES[c.stage].en + '. Fire clock now: ' + hhmm(vnow(c)) + ', ' + dur(vnow(c) - since(c)) + ' since the first detection.\n' +
      'Stage timeline: ' + tl + '.\n' +
      'Burnt area now: about ' + areaTxt(c) + '. Wind from the south-west, about 18 km/h gusting 30; the head runs north-east; homes about 1 km north-east.\n' +
      'Air support: ' + (c.air ? c.air.name + ' (' + c.air.st + ')' : c.flags.airNo ? 'declined by the fire owner for now' : 'none') + '. Evacuation: ' + (c.evac ? c.evac.people + ' residents moved out' : 'none ordered') + '.\n' +
      (function () { var S = crewState(c); return S && S.st && S.st.length ? 'Units right now (exact; never contradict them): ' + S.st.map(function (x) { return x.name + ': ' + x.tenders + ' water tender(s)' + (x.low.length ? ', below 20% water: ' + x.low.join(', ') : ', all above 20%') + '; ' + x.crews + ' crew(s)' + (x.tired.length ? ', past 12 h needing relief: ' + x.tired.join(', ') : ''); }).join('. ') + '. When water or relief comes up, each station with a problem answers for its own units.\n' : ''; })() +
      'Team (answer only as these people; index in #):\n' + team + '\n\nRecent chat, oldest first:\n' + tr;
  }
  var AI_SYS = 'You role-play the crew coordinators of fire stations in a wildfire incident chat. This is a realistic training simulation inside a fire command app; the person writing to you is the fire owner (incident commander) who makes all decisions. ' +
    'Stay in character: each coordinator has their own voice (given in the brief). Write like real people on a phone chat during a fire, not like a form: natural, warm and human, with the rhythm and small asides colleagues use with each other, always focused on the job at hand. ' +
    'Match the fire owner: a short order gets a short, crisp answer (1 or 2 sentences); a question, a worry or a chat gets a fuller, conversational answer (3 to 6 sentences) that explains what they see, what they are doing and why. ' +
    'If the fire owner jokes, vents or says something off the wall, react like a real colleague would (a bit of humour, surprise or a straight word), then bring it back to the fire. No emojis, no markdown. ' +
    'Be consistent with the brief: the stage, the forces and where they are, the time elapsed, the burnt area, air support and evacuation. Describe fire behaviour, terrain, water, crew welfare and needs plausibly for this stage. ' +
    'Coordinators may take operational decisions themselves (deploy or recall their own crews, launch the drone, order a local evacuation) and announce them as decisions. Only the fire owner changes the incident stage: never declare the fire held, resolved or closed, and never invent new stations, aircraft or people. ' +
    'If the fire owner names a person or station, that coordinator answers. A crew that is not dispatched is still at its station. Everything you write must be in LANGUAGE. ' +
    'Answer with JSON only, no prose around it: {"replies":[{"who":<team index>,"text":"<message>","minutes":<minutes of fire time before this message, 1 to 15>}]} with one reply, or two when a second coordinator genuinely adds something.';
  function aiSys() { return AI_SYS.replace('LANGUAGE', LNAME(true)); }
  function aiDeliver(key, txt, fallback) {
    var c = load().chats[key]; if (!c) return; c.pending = null;
    var js = parseJSON(txt), R = js && Array.isArray(js.replies) ? js.replies : null;
    if (!R || !R.length) { fallback(c); save(); emit(); return; }
    R.slice(0, 2).forEach(function (r, i) {
      var who = Math.max(0, Math.min(c.people.length - 1, parseInt(r.who, 10) || 0)), t = String(r.text || '').trim().slice(0, 900);
      if (!t) return;
      say(c, who, t, t, 400 + i * 2600, Math.max(1, Math.min(15, parseInt(r.minutes, 10) || 3)));
    });
    c.updated = Date.now(); save(); emit();
  }
  var INF = {};   // answers being written by Claude from this screen
  function aiReply(c, text, fallback) {
    var key = c.key, guess = responder(c, text); c.pending = { who: guess >= 0 ? guess : 0, at: Date.now(), q: text }; INF[key] = 1;
    aiCall(aiSys(), aiBrief(c) + '\n\nThe fire owner just wrote: "' + text + '"\nReply now as the right coordinator(s).', 900, function (err, txt) {
      delete INF[key];
      if (err) { var c2 = load().chats[key]; if (c2) { c2.pending = null; fallback(c2); save(); emit(); } return; }
      aiDeliver(key, txt, fallback);
    });
  }
  function aiUpdate(c, fallback) {
    var key = c.key; c.pending = { who: 0, at: Date.now() };
    aiCall(aiSys(), aiBrief(c) + '\n\nThe fire owner has been quiet for a while. Write ONE unprompted progress update from the coordinator best placed to report, describing how the fire and the work evolved since the last message, as fits the current stage. Use minutes between 8 and 40 for a stage with crews working, up to 180 under surveillance.', 400, function (err, txt) {
      var c2 = load().chats[key]; if (!c2) return;
      if (err) { c2.pending = null; fallback(c2); save(); emit(); return; }
      var js = parseJSON(txt); if (js && js.replies) js.replies = js.replies.slice(0, 1).map(function (r) { r.minutes = Math.max(5, Math.min(c2.stage === 6 ? 240 : 45, parseInt(r.minutes, 10) || 15)); return r; });
      aiDeliver(key, js ? JSON.stringify(js) : txt, fallback);
    });
  }


  // ---- decisions by the crew coordinators ---------------------------------------------------------------------------
  // Anyone on the team can deploy or recall their crews, launch the drone or order a local evacuation, and says so in
  // the chat as a decision. Only the fire owner changes the stage of the fire.
  var DECIS = { 2: [{ who: 1, key: 'deploy2' }], 3: [{ who: 2, key: 'drone' }, { who: 1, key: 'evac' }], 4: [{ who: 0, key: 'relief' }], 5: [{ who: 2, key: 'recall' }] };
  function decision(c, who, title, body, adv) {
    var p = c.people[who] || {};
    card(c, { decision: true, by: who, tag: { en: 'Decision · ' + p.name, pt: 'Decisão · ' + p.name }, tagC: '#0A66CC', title: title, body: body }, 1200, adv || 6);
  }
  function decide(c, d) {
    var who = lead(c, d.who), P = c.people[who]; if (!P) return false;
    var us = isUS(c), f = (c.forces || []).find(function (x) { return x.si === who; });
    if (d.key === 'deploy2') {
      if (!f || f.st === 'standby') return false;
      var v = us ? 'Engine ' + (40 + hash(c.key) % 50) : 'VLCI 0' + (2 + hash(c.key) % 6); f.veh.push(v);
      say(c, who, 'We have a second crew free, sending ' + v + ' as well.', 'Temos uma segunda equipa livre, enviamos também o ' + v + '.', 600, 3);
      decision(c, who, { en: 'Second vehicle deployed', pt: 'Segundo veículo empenhado' }, { en: v + ' from ' + P.org + ' · on the way', pt: v + ' de ' + P.org + ' · a caminho' }, 1);
    } else if (d.key === 'drone') {
      if (c.flags.drone3) return false; c.flags.drone3 = true;
      decision(c, who, { en: 'Drone launched', pt: 'Drone lançado' }, { en: 'D-5 over the head to read the fire behaviour', pt: 'D-5 sobre a cabeça para ler o comportamento do fogo' }, 4);
      card(c, { tag: { en: 'Drone D-5 · over the head', pt: 'Drone D-5 · sobre a cabeça' }, tagC: '#0A66CC', title: { en: 'Running upslope', pt: 'A subir a encosta' }, body: { en: 'Spotting up to 50 m ahead of the head', pt: 'Projeções até 50 m à frente da cabeça' }, fire: true }, 7000, 8);
    } else if (d.key === 'evac') {
      if (c.flags.evac) return false; c.flags.evac = true; c.evac = { people: 60 + hash(c.key + 'ev') % 180 };
      say(c, who, 'The head is getting close to the homes. I am ordering the evacuation of the north-east side now.', 'A cabeça está a aproximar-se das casas. Ordeno já a evacuação do lado nordeste.', 600, 4);
      decision(c, who, { en: 'Evacuation ordered', pt: 'Evacuação ordenada' }, { en: 'Homes north-east of the fire · civil protection and ' + (us ? "the sheriff's department" : 'the local police') + ' informed', pt: 'Casas a nordeste do incêndio · proteção civil e forças de segurança informadas' }, 1);
      sys(c, (us ? "Sheriff's deputies moving " : 'Local police (GNR) moving ') + c.evac.people + ' residents to safety', (us ? 'Xerifes' : 'GNR') + ' a encaminhar ' + c.evac.people + ' moradores para local seguro', 5000, 12);
    } else if (d.key === 'relief') {
      if (!f || f.st !== 'onscene') return false;
      decision(c, who, { en: 'Crew relief', pt: 'Rendição de equipa' }, { en: 'Fresh crew from ' + P.org + ' takes over; the day crew stands down to rest', pt: 'Equipa fresca de ' + P.org + ' assume; a equipa do dia descansa' }, 20);
    } else if (d.key === 'recall') {
      if (!f || (f.st !== 'onscene' && f.st !== 'enroute')) return false; f.st = 'released';
      say(c, who, 'Mop-up is covered here. Recalling our crew to the station so we are ready for the next call.', 'O rescaldo está garantido. Recolhemos a nossa equipa ao quartel para estarmos prontos para a próxima ocorrência.', 600, 10);
      decision(c, who, { en: 'Crew recalled', pt: 'Equipa recolhida' }, { en: P.org + ' released from the fire, back in service', pt: P.org + ' libertado do incêndio, de volta ao serviço' }, 1);
    } else return false;
    return true;
  }

  // Unprompted progress updates while a stage runs: the coordinators report as the fire evolves
  var PROGRESS = {
    3: [[1, function (c) { return ['Spot fire 30 m ahead of the head, we have it.', 'Foco secundário 30 m à frente da cabeça, está controlado.']; }, 12],
        [0, function (c) { return ['About ' + areaTxt(c) + ' now. ' + (c.air && c.air.st === 'onscene' ? 'The drops are working, the head is losing strength.' : 'Still moving ' + 'north-east, we need to hold it before the ridge.'), 'Cerca de ' + areaTxt(c, 1) + ' agora. ' + (c.air && c.air.st === 'onscene' ? 'As descargas estão a resultar, a cabeça está a perder força.' : 'Continua para nordeste, temos de a segurar antes da cumeada.')]; }, 18],
        [2, function (c) { return ['Refilled from the ' + (isUS(c) ? 'water tender' : 'autotanque') + ', back on the line.', 'Reabastecemos no autotanque, de volta à linha.']; }, 15]],
    4: [[0, function (c) { return ['South flank closed. Working the north one.', 'Flanco sul fechado. A trabalhar o norte.']; }, 35],
        [1, function (c) { return ['Crew rotation done, everyone hydrated.', 'Rotação de equipas feita, todos hidratados.']; }, 40]],
    5: [[1, function (c) { return ['Two hotspots left along the road, soaking them now.', 'Faltam dois pontos quentes junto à estrada, a encharcar agora.']; }, 60],
        [0, function (c) { return ['Perimeter walked end to end, nothing smoking.', 'Perímetro percorrido de ponta a ponta, nada a fumegar.']; }, 75]],
    6: [[0, function (c) { return ['Night round done. All cold.', 'Ronda noturna feita. Tudo frio.']; }, 240],
        [0, function (c) { return ['Morning check: no rekindles. Ready to close when you are.', 'Verificação da manhã: sem reacendimentos. Prontos a encerrar quando quiser.']; }, 420]]
  };
  // A request left waiting (a card with Approve / Not now): the one who asked insists, and says again which button to tap.
  // First nudge about 45 s after the card, a firmer second one 90 s later, then they wait.
  function nag(c, now) {
    var m = null; for (var i = c.msgs.length - 1; i >= 0; i--) { var x = c.msgs[i]; if (x.kind === 'card' && x.req && x.actions && x.actions.length && !x.done) { m = x; break; } }
    if (!m) return false;
    if (m.req === 'air' && (c.flags.air || c.flags.airNo)) return false;   // answered from a suggestion instead
    if (m.reqDecl && !c.seenAt) return false;   // nobody has looked yet: no reminder
    var n = m.nag || 0; if (n >= 2 || now - (m.nagAt || m.t || now) < (n ? 90000 : 45000)) return false;
    m.nag = n + 1; m.nagAt = now;
    // (Oct 5, 09:53) the button to tap is the request's primary one (Approve), whatever its place on the card
    var who = m.by != null ? m.by : lead(c, 1), yes = m.actions.filter(function (a) { return a.primary; })[0] || m.actions[0], no = m.actions.filter(function (a) { return a !== yes; })[0], T = m.title || { en: 'this request', pt: 'este pedido' };
    if (m.reqDecl) { var dz = yes.key === 'reqDismiss';
      if (!n) say(c, who, 'We still need your call. Tap Approve on my request above to ' + (dz ? 'dismiss it' : 'declare the fire') + ', or Not now to keep watching.', 'Ainda precisamos da sua decisão. Toque em Aprovar no meu pedido acima para ' + (dz ? 'o descartar' : 'declarar o incêndio') + ', ou em Agora não para continuar a vigiar.', 800, 2);
      else say(c, who, 'The drone is still over the point. Your decision, please: Approve or Not now, on the request card above.', 'O drone continua sobre o ponto. A sua decisão, por favor: Aprovar ou Agora não, no cartão do pedido acima.', 800, 3);
      return true; }
    var te = String(T.en).toLowerCase(), tp = String(T.pt).toLowerCase();
    if (!n) say(c, who, 'I still need your approval for ' + te + '. Tap ' + yes.en + ' on my request above' + (no ? ', or ' + no.en + ' if we hold without it.' : '.'),
      'Continuo a precisar da sua aprovação para o ' + tp + '. Toque em ' + yes.pt + ' no meu pedido acima' + (no ? ', ou em ' + no.pt + ' se seguramos sem ele.' : '.'), 800, 2);
    else say(c, who, 'Commander, the fire keeps moving and I am still waiting on ' + te + '. I need your decision: ' + yes.en + (no ? ' or ' + no.en : '') + ', on the request card above.',
      'Comandante, o fogo continua a avançar e ainda aguardo o ' + tp + '. Preciso da sua decisão: ' + yes.pt + (no ? ' ou ' + no.pt : '') + ', no cartão do pedido acima.', 800, 3);
    return true;
  }
  function idle(c, now) {
    if (c.kind === 'dm') return false;
    if (c.pending && now - c.pending.at > 45000) c.pending = null;
    if (c.closed || c.dismissed || c.queue.length || c.pending) return false;
    var last = Math.max(c.idleAt || 0, (c.msgs[c.msgs.length - 1] || {}).t || 0);
    if (now - last < 22000) return false;
    if (nag(c, now)) { c.idleAt = now; return true; }
    var D0 = (DECIS[c.stage] || []).filter(function (d) { return !(c.dec = c.dec || {})[c.stage + d.key]; });
    for (var i = 0; i < D0.length; i++) { c.dec[c.stage + D0[i].key] = 1; if (decide(c, D0[i])) { c.idleAt = now; return true; } }
    var L0 = PROGRESS[c.stage]; if (!L0) return false;
    var done = (c.prog = c.prog || {})[c.stage] || 0; if (done >= L0.length) return false;
    var p = L0[done]; c.prog[c.stage] = done + 1; c.idleAt = now;
    var scripted = function (cc) { var a = p[1](cc); say(cc, lead(cc, p[0]), a[0], a[1], 1200, p[2]); };
    if (aiKey()) aiUpdate(c, scripted); else scripted(c);
    return true;
  }

  // Confirm / dismiss also update the incident itself, so the map and lists follow the chat
  function markConfirmed(c) {
    if (c.kind !== 'cand') return;
    var d = {}; try { d = JSON.parse(sessionStorage.getItem('wf-confirmed') || '{}') || {}; } catch (e) {}
    if (!d[c.incId]) { d[c.incId] = Date.now(); try { sessionStorage.setItem('wf-confirmed', JSON.stringify(d)); } catch (e) {} window.__wfMem = Object.assign(window.__wfMem || {}, { confirmed: d }); try { window.dispatchEvent(new Event('wf-sync')); } catch (e) {} }
  }
  function markDismissed(c) {
    if (c.kind !== 'cand') return;
    var d = {}; try { d = JSON.parse(sessionStorage.getItem('wf-dismissed') || '{}') || {}; } catch (e) {}
    d[c.incId] = true; try { sessionStorage.setItem('wf-dismissed', JSON.stringify(d)); } catch (e) {} window.__wfMem = Object.assign(window.__wfMem || {}, { dismissed: d }); try { window.dispatchEvent(new Event('wf-sync')); } catch (e) {}
  }

  // ---- a change of state moves the forces with it ---------------------------------------------------------------------
  function onStage(c, s) {
    if (s === 2) setForces(c, ['standby'], 'standby');
    if (s === 3) setForces(c, ['enroute'], 'onscene');
    if (s === 5 && c.air) c.air.st = 'released';
    if (s === 6) { var first = true; (c.forces || []).forEach(function (f) { if (f.st === 'onscene' && first) { f.st = 'watch'; first = false; } else if (f.st !== 'standby') f.st = 'released'; }); }
    if (s === 7) { setForces(c, null, 'released'); if (c.air) c.air.st = 'released'; c.closedVt = vnow(c); c.sum = stats(c); award(c); }
  }

  // ---- the clock: due messages arrive, on whichever screen is open --------------------------------------------------
  function tourMute() { try { return window.__wfTour && window.__wfTour.active && window.__wfTour.active() && window.__wfTour_mute ? window.__wfTour_mute() : ''; } catch (e) { return ''; } }
  function tick() {
    var db = load(), now = Date.now(), changed = false;
    Object.keys(db.chats).forEach(function (k) {
      var c = db.chats[k];
      /* (Oct 5, 10:50) in the tour the team's chatter waits while a step points at something (the evidence, Declare the fire), and is left out after: nothing moves under the cursor */
      var mute = tourMute();
      if (mute && c.queue.length) {
        if (mute === 'holdall') { c.queue.forEach(function (x) { if (x.due <= now + 3000) x.due = now + 3000; }); c.queue.sort(function (a, b) { return a.due - b.due; }); }   /* a step waits for a tap: cards, stages and messages all wait */
        else if (mute === 'drop') c.queue = c.queue.filter(function (x) { return x.m.kind !== 'msg'; });
        else { c.queue.forEach(function (x) { if (x.m.kind === 'msg' && x.due <= now + 3000) x.due = now + 3000; }); c.queue.sort(function (a, b) { return a.due - b.due; }); }
      }
      while (c.queue.length && c.queue[0].due <= now) {
        var q = c.queue.shift(), m = q.m;
        if (c.closed && m.kind !== 'msg' && m.kind !== 'sys') { if (!(m.kind === 'card' && m.summary)) continue; }
        if (m.adv && !c.closedVt) jump(c, m.adv * MIN);
        m.t = q.due; m.vt = vnow(c); delete m.adv;
        if (m.kind === 'stage') {
          if (c.dismissed) continue;
          c.stage = m.stage; c.hist.push({ s: m.stage, vt: m.vt });
          onStage(c, c.stage);
          if (c.stage === 7) c.closed = true;
          var sc = stageCard(c, c.stage); sc.id = newId(); sc.kind = 'card'; sc.t = q.due; sc.vt = m.vt;
          if (c.stage === 1 && !c.flags.dispatched) { sc.actions = [{ key: 'dispatch', en: 'Configure dispatch', pt: 'Configurar despacho' }]; sc.dispCard = true; }   /* (Oct 5) the dispatch is configured from the Ignition confirmed card */
          c.msgs.push(sc);
          if (c.stage < 7) entry(c, c.stage, 0);
          else {
            if (c.people[0]) say(c, 0, 'Thanks everyone. Good work.', 'Obrigado a todos. Bom trabalho.', 2500, 1);
            push(c, { kind: 'card', summary: true, tag: { en: 'Fire resolved', pt: 'Incêndio resolvido' }, tagC: '#186B2D' }, 4000, 0);
          }
        } else if (m.kind === 'air') { if (c.air) c.air.st = m.st; }
        else c.msgs.push(m);
        c.updated = q.due; changed = true;
      }
      // A question left before its answer arrived (the screen that asked was closed): answer it here, so it still lands and counts as unread
      if (c.pending && c.pending.q && !INF[k] && now - c.pending.at > 4000) { var q0 = c.pending.q; c.pending = null; if (aiKey()) aiReply(c, q0, function (cc) { ruleReply(cc, q0); }); else ruleReply(c, q0); changed = true; }
      if (idle(c, now)) changed = true;
    });
    if (changed) { save(); emit(); }
  }
  setInterval(tick, 700);

  // ---- resolution: stats, and the achievement that goes into each firefighter's profile ---------------------------------
  function stageDurs(c) {
    var H = c.hist || [], end = vnow(c);
    return H.map(function (h, i) { return { s: h.s, vt: h.vt, ms: Math.max(0, (H[i + 1] ? H[i + 1].vt : end) - h.vt), cur: !H[i + 1] && !c.closed }; });
  }
  function stats(c) {
    var H = c.hist || [], at = function (s) { var x = H.find(function (h) { return h.s === s; }); return x ? x.vt : null; };
    var t0 = since(c), end = vnow(c), h = hash(c.key);
    var ha = c.drill && c.drill.ha ? Math.round(c.drill.ha * Math.min(2.2, Math.max(0.45, Math.pow(((at(3) != null ? at(3) - since(c) : 0) || c.drill.resp || 1) / (c.drill.resp || 1), 0.7))) * (c.flags.air ? 0.85 : c.flags.airNo ? 1.3 : 1.1) * 10) / 10
      : c.realHa || Math.round((2.5 + h % 23 + (c.flags.airNo ? 12 : 0) + (c.flags.evac ? 5 : 0) + (h % 10) / 10) * 10) / 10;
    var F = (c.forces || []).filter(function (f) { return f.st !== 'standby'; });
    return { t0: t0, end: end, disp: at(2) != null ? at(2) - t0 : null, resp: at(3) != null ? at(3) - t0 : null, res: end - t0,
      ha: ha, acres: Math.round(ha * 2.471), us: isUS(c), pop: c.evac ? c.evac.people : 40 + h % 160, evac: !!c.evac,
      people: F.reduce(function (a, f) { return a + 1 + f.crew.length; }, 0), veh: F.reduce(function (a, f) { return a + f.veh.reduce(function (n, x) { return n + (+((String(x).match(/^(\d+)\s*×/) || [])[1]) || 1); }, 0); }, 0), air: c.air || (c.flags && c.flags.air) ? 1 : 0, stations: F.filter(function (f, i) { return F.findIndex(function (g) { return g.station === f.station; }) === i; }).length, est: !!c.estF };
  }
  // Fire size class (Oct 4): the US scale of NWCG, which CAL FIRE uses (A to G by acres, from the final perimeter); everywhere else the
  // names of the Portuguese ICNF (fogacho under 1 ha, incêndio, grande incêndio from 100 ha), with the size in hectares
  function sizeClass(ha, st) { ha = Number(ha) || 0; var us = ccOf(st) === 'us', fm = function (n) { return Math.round(n).toLocaleString('en-US'); };
    if (us) { var ac = ha / 0.4047, i = [0.25, 10, 100, 300, 1000, 5000].filter(function (x) { return ac >= x; }).length, L = 'ABCDEFG'[i];
      return { code: L, i: i, en: 'Class ' + L + '. ' + fm(ac) + ' ac', pt: 'Classe ' + L + '. ' + fm(ac) + ' ac', tagEn: ['up to 0.25 ac', '0.26 to 9.9 ac', '10 to 99 ac', '100 to 299 ac', '300 to 999 ac', '1,000 to 4,999 ac', '5,000 ac or more'][i], tagPt: ['até 0,25 ac', '0,26 a 9,9 ac', '10 a 99 ac', '100 a 299 ac', '300 a 999 ac', '1 000 a 4 999 ac', '5 000 ac ou mais'][i] }; }
    var j = ha < 1 ? 0 : ha < 100 ? 1 : 2, N = [['Spot fire', 'Fogacho'], ['Fire', 'Incêndio'], ['Large fire', 'Grande incêndio']][j];
    return { code: N[0], i: j, en: N[0] + '. ' + (ha < 10 ? Math.round(ha * 10) / 10 : fm(ha)) + ' ha', pt: N[1] + '. ' + (ha < 10 ? String(Math.round(ha * 10) / 10).replace('.', ',') : fm(ha)) + ' ha', tagEn: ['under 1 ha', '1 to 99 ha', '100 ha or more'][j], tagPt: ['menos de 1 ha', '1 a 99 ha', '100 ha ou mais'][j] }; }
  function fmtDur(ms) { var m = Math.max(1, Math.round(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60; return d ? d + ' d ' + h + ' h' : h ? h + ' h ' + mm + ' min' : mm + ' min'; }
  function loadAch() { try { return JSON.parse(localStorage.getItem(ACH) || '{}') || {}; } catch (e) { return {}; } }
  function award(c) {
    if (c.drill) return;   // training drills do not go into firefighters' profiles
    var A = loadAch(), S = c.sum, me = (window.__wfPrefs && window.__wfPrefs.person) || { name: 'You' };
    var rec = function (name, roleEn, rolePt, station) {
      var list = A[name] || (A[name] = []);
      if (list.some(function (r) { return r.key === c.key; })) return;
      list.push({ key: c.key, place: c.place, reg: c.reg, vt: S.end, res: S.res, resp: S.resp, ha: S.ha, acres: S.acres, us: S.us, pop: S.pop, roleEn: roleEn, rolePt: rolePt, station: station || '' });
    };
    rec(me.name, 'Fire owner', 'Responsável pelo incêndio', '');
    (c.forces || []).filter(function (f) { return f.st !== 'standby'; }).forEach(function (f) {
      if (f.coord) rec(f.coord, 'Crew coordinator', 'Coordenador de equipa', f.station);
      f.crew.forEach(function (n) { rec(n, 'Firefighter', 'Bombeiro', f.station); });
    });
    try { localStorage.setItem(ACH, JSON.stringify(A)); } catch (e) {}
  }
  // Who a person is: their role and station, from the chats and their achievements
  function person(name) {
    var me = (window.__wfPrefs && window.__wfPrefs.person) || {};
    var A = (loadAch()[name] || []).slice().sort(function (a, b) { return b.vt - a.vt; });
    if (me.name && name === me.name) return { name: name, code: me.code || initials(name), photo: me.photo || '', roleEn: 'Fire owner', rolePt: 'Responsável pelo incêndio', station: me.title || '', ach: A, me: true };
    var db = load(), out = null, ch = null;
    Object.keys(db.chats).some(function (k) { ch = db.chats[k];
      return (db.chats[k].forces || []).concat(db.chats[k].people.map(function (p) { return { coord: p.name, station: p.org, crew: [] }; })).some(function (f) {
        var stOf = function () { var S = (ch.stations || []).find(function (q) { return q.short === f.station || q.name === f.full; }) || {}; return { ck: S.ck || f.ck || '', name: S.name || f.full || f.station, short: f.station, la: S.la, lo: S.lo, km: S.km, chat: ch.key }; };
        if (f.coord === name) { out = { roleEn: 'Crew coordinator', rolePt: 'Coordenador de equipa', station: f.station, st: stOf() }; return true; }
        if (f.crew.indexOf(name) >= 0) { out = { roleEn: 'Firefighter', rolePt: 'Bombeiro', station: f.station, st: stOf() }; return true; }
        return false;
      });
    });
    if (!out && A[0]) out = { roleEn: A[0].roleEn, rolePt: A[0].rolePt, station: A[0].station };
    if (!out) ch = null;
    return Object.assign({ name: name, code: initials(name), photo: ch ? photoOf(ch, name) : '', roleEn: 'Firefighter', rolePt: 'Bombeiro', station: '', ach: A }, out || {}, { ach: A });
  }

  // ---- helpers for the screens ----------------------------------------------------------------------------------------
  function hhmm(t) { var d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function dur(ms) { var m = Math.max(1, Math.round(ms / 60000)); if (m < 60) return m + ' min'; if (m < 1440) return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; return Math.floor(m / 1440) + ' d ' + Math.floor((m % 1440) / 60) + ' h'; }
  function clock(ms) { var x = Math.max(0, Math.floor(ms / 1000)); var d = Math.floor(x / 86400); x %= 86400; var h = Math.floor(x / 3600); x %= 3600; var m = Math.floor(x / 60), s = x % 60, p = function (n) { return String(n).padStart(2, '0'); };
    return d ? d + ' d ' + h + ' h ' + p(m) + ' min' : h ? h + ' h ' + p(m) + ' min ' + p(s) + ' s' : m ? m + ' min ' + p(s) + ' s' : s + ' s'; }
  /* (Oct 5, 11:40) a fire owner works on at most 3 incidents at a time: the others are assigned to other fire owners. The three are kept
     (the chat you open or act on joins them, the longest idle one leaves); a closed one is replaced by the next most active. */
  /* (Oct 6) at most 5 incidents per person, the administrator included; each profile (role profiles share an area) keeps its own */
  var RK = (function () { var c = ''; try { c = localStorage.getItem('wf-custom') || ''; } catch (e) {} return c || role || 'anon'; })();
  var MAXOWN = 5, AKEY = 'wf-assigned-' + RK, HKEY = 'wf-assigned-hist-' + RK;
  /* (Oct 5, 20:45) every incident ever assigned here, so the Resolved tab can show the ones that were mine */
  function hist() { try { return JSON.parse(localStorage.getItem(HKEY) || '[]') || []; } catch (e) { return []; } }
  function remember(A) { var H = hist(), ch = false; A.forEach(function (k) { if (H.indexOf(k) < 0) { H.unshift(k); ch = true; } }); if (ch) try { localStorage.setItem(HKEY, JSON.stringify(H.slice(0, 60))); } catch (e) {} }
  function mineKeys() { try { return (JSON.parse(localStorage.getItem(AKEY) || '[]') || []).slice(0, MAXOWN); } catch (e) { return []; } }
  function ownedChats(open, keep, only) {   /* (Oct 6) everyone, the administrator too, holds at most 5; direct messages never take a place. Until the five
     places have been filled once, they fill by themselves; after that a free place is offered (the new assignment card) and never filled silently */
    var fires = open.filter(function (c) { return c.kind !== 'dm'; }), dms = open.filter(function (c) { return c.kind === 'dm'; });
    var seeded = true; try { seeded = localStorage.getItem(AKEY + '-full') === '1'; } catch (e) {}   /* set once the five places have been filled the first time */
    var db = load(), A = mineKeys().filter(function (k) { var c = db.chats[k]; return c && !c.closed && c.kind !== 'dm'; }), by = {};   /* assignments in other areas stay while their fire is open */
    fires.forEach(function (c) { by[c.key] = c; });
    if (!seeded) fires.forEach(function (c) { if (A.length < MAXOWN && A.indexOf(c.key) < 0) A.push(c.key); });
    if (!keep || !seeded) { try { localStorage.setItem(AKEY, JSON.stringify(A)); if (A.length >= MAXOWN) localStorage.setItem(AKEY + '-full', '1'); } catch (e) {} } remember(A);
    return A.filter(function (k) { return by[k]; }).map(function (k) { return by[k]; }).concat(dms); }
  function assign(k) { var A = mineKeys().filter(function (x) { return x !== k; }); A.unshift(k); try { localStorage.setItem(AKEY, JSON.stringify(A.slice(0, MAXOWN))); } catch (e) {} remember(A.slice(0, MAXOWN)); }
  function fresh(c) { return c.msgs.filter(function (m) { return m.t > (c.seenAt || 0) && m.from !== 'me' && m.kind !== 'sys'; }).length; }   /* newer than the last look (the badge itself stays on while a candidate is undecided) */
  function unread(c) { var open0 = c.stage === 0 && !c.dismissed && !c.closed;   /* (Oct 5) an undecided candidate keeps its count however often the chat is opened: only declaring or dismissing clears it */
    return c.msgs.filter(function (m) { return m.t > (open0 ? 0 : (c.seenAt || 0)) && m.from !== 'me' && m.kind !== 'sys' && !(m.kind === 'card' && !(m.actions && m.actions.length) && !m.req); }).length; }   /* (Oct 5) information cards (stage changes) are not counted: the badge counts what people said and what waits for a decision */
  function lastMsg(c) { for (var i = c.msgs.length - 1; i >= 0; i--) { var m = c.msgs[i]; if (m.kind !== 'stage') return m; } return null; }
  function typing(c) { if (tourMute()) return null; if (c.pending && Date.now() - c.pending.at < 45000) return c.people[c.pending.who] || c.people[0]; var q = c.queue[0]; return q && q.m.kind === 'msg' && q.due - Date.now() < 2600 ? c.people[q.m.from] : null; }

  // ---- reporting a night ignition to the local police -------------------------------------------------------------------
  // A fire that started with the sun down is suspicious: one tap opens a chat with an officer of the local force (a county
  // sheriff's deputy in the US, the GNR's nature protection service in Portugal), with the fire's card (place, start time,
  // GPS) and the report already sent; the officer answers and the conversation goes on in character.
  // Photo: Arthur Ogleznev on Unsplash (Unsplash License), https://unsplash.com/photos/X1JI5iiZsmY
  // The police leader for a night ignition report: a captain (or that country's equivalent rank) of the force that
  // investigates fire causes there, named with the department and its area
  function policeOf(st, reg) { var cc = ccOf(st), r = String(reg || '').replace(/ County$/, '').trim();
    if (cc === 'us') return { org: (r ? r + ' County ' : '') + (st === 'CA' ? 'Sheriff\'s Department' : 'Sheriff\'s Office'), roleEn: 'Captain', rolePt: 'Capitão', name: 'Jordan Reyes' };
    if (cc === 'pt') return { org: 'GNR. Comando Territorial' + (r ? ' de ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Rui Martins' };
    if (cc === 'br') return { org: 'Polícia Militar Ambiental' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Carlos Souza' };
    if (cc === 'es') return { org: 'Guardia Civil. SEPRONA' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Javier Morales' };
    if (cc === 'fr') return { org: 'Gendarmerie nationale' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Julien Moreau' };
    if (cc === 'it') return { org: 'Carabinieri Forestali' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Marco Bianchi' };
    if (cc === 'gr') return { org: 'Hellenic Police' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Nikos Papadakis' };
    if (cc === 'ca') return { org: 'RCMP' + (r ? '. ' + r : ''), roleEn: 'Inspector', rolePt: 'Inspetor', name: 'Daniel Tremblay' };
    return { org: 'Police' + (r ? '. ' + r : ''), roleEn: 'Captain', rolePt: 'Capitão', name: 'Jordan Reyes' }; }
  function police(inc) {
    var db = load(), k = 'p:' + inc.id;
    if (db.chats[k] && !db.chats[k].v2) delete db.chats[k];   // a report made before the captain's investigation: started again
    if (db.chats[k]) { var o = db.chats[k], P0 = policeOf(o.st, inc.reg); o.dismissed = false; o.place = inc.night ? 'Night ignition report' : 'Ignition report';   /* reported again: a chat that was put away comes back */ o.reg = inc.place || o.reg; if (o.people[0]) { o.people[0].roleEn = P0.roleEn; o.people[0].rolePt = P0.rolePt; o.people[0].org = P0.org; } save(); return o; }
    var now = Date.now(), P = policeOf(inc.st, inc.reg);
    var ch = { key: k, kind: 'dm', police: true, v2: true, incId: inc.id, place: inc.night ? 'Night ignition report' : 'Ignition report', reg: inc.place, st: inc.st || '', lat: +inc.lat || 0, lon: +inc.lon || 0, x: inc.x, y: inc.y, note: '', eta: 20 + hash(inc.id) % 25,
      stage: 0, startStage: 0, started: now, vNow: now, vAt: now, hist: [{ s: 0, vt: now }], people: [], stations: [], forces: [], air: null, evac: null,
      msgs: [], queue: [], seenAt: now, beat: 0, flags: {}, closed: false, dismissed: false, updated: now, face: {}, used: {}, step: 0 };
    var nm = P.name || pickNames(ch, 1, 'police')[0];
    ch.people = [{ name: nm, code: initials(nm), org: P.org, kind: 'lead', roleEn: P.roleEn, rolePt: P.rolePt }];
    ch.topic = { id: inc.id, kind: 'fire', place: inc.place, reg: inc.reg || '', st: inc.st || '', lat: inc.lat, lon: inc.lon, x: inc.x, y: inc.y };
    var bodyEn = [inc.reg, inc.startTxt ? 'Started ' + inc.startTxt : '', inc.gps].filter(Boolean).join('. ') + '.', bodyPt = [inc.reg, inc.startTxt ? 'Início ' + inc.startTxt : '', inc.gps].filter(Boolean).join('. ') + '.';
    ch.msgs.push({ id: newId(), kind: 'card', from: 'me', topic: true, tag: inc.night ? { en: 'Night ignition', pt: 'Ignição noturna' } : { en: 'Ignition', pt: 'Ignição' }, tagC: '#3A3A3C', title: { en: 'Fire. ' + inc.place, pt: 'Incêndio. ' + inc.place }, body: { en: bodyEn, pt: bodyPt }, link: { en: 'View', pt: 'Ver' }, inc: ch.topic, t: now, vt: now });
    mine(ch, inc.night ? 'Reporting a night ignition, can you please investigate?' : 'Reporting an ignition, can you please investigate?', inc.night ? 'Reporto uma ignição noturna, podem investigar, por favor?' : 'Reporto uma ignição, podem investigar, por favor?');
    say(ch, 0, 'Thank you for reporting it. I have opened a case for the ' + (inc.night ? 'night ' : '') + 'ignition at ' + inc.place + (inc.startTxt ? ', started ' + inc.startTxt : '') + '. A few questions to start: how was it detected, and did your crews see anyone or any vehicle near the point of origin?',
      'Obrigado pela participação. Abri um processo para a ignição ' + (inc.night ? 'noturna ' : '') + 'em ' + inc.place + (inc.startTxt ? ', com início às ' + inc.startTxt : '') + '. Algumas perguntas para começar: como foi detetada, e as equipas viram alguém ou alguma viatura perto do ponto de início?', 2600, 2);
    db.chats[k] = ch; save(); emit(); return ch;
  }
  function policeReply(c, text) {
    var t = String(text).toLowerCase(), q = c.step || 0;
    if (/obrigad|thank|valeu|cheers/.test(t)) { say(c, 0, 'Thank you. I will keep you posted on the case, and please send anything new that your crews find.', 'Obrigado. Vou dando notícias do processo, e envie-me qualquer novidade que as equipas encontrem.', 1800, 1); return; }
    // The captain works through the questions an investigator needs answered, one at a time, acknowledging each answer
    var ack = /sat[eé]lit|satellite|camera|câmara|detet|detect/.test(t) ? ['Noted, detected by ' + (/camera|câmara/.test(t) ? 'camera' : 'satellite') + '.', 'Registado, detetado por ' + (/camera|câmara/.test(t) ? 'câmara' : 'satélite') + '.']
      : /ningu|no one|nobody|não vi|none seen|ninguém/.test(t) ? ['Noted, nobody seen near the origin.', 'Registado, ninguém visto junto ao ponto de início.']
      : /vehic|viatura|carro|car\b|truck|carrinha/.test(t) ? ['That matters. Send me the time and a description of the vehicle as soon as you have it.', 'Isso é importante. Envie-me a hora e a descrição da viatura assim que a tiver.']
      : /lightning|trovoada|raio|storm/.test(t) ? ['Noted on the weather.', 'Registado quanto ao tempo.']
      : /preserv|intact|untouched|intacto|preservad/.test(t) ? ['Good, thank you for keeping the origin intact.', 'Ótimo, obrigado por manter o ponto de início intacto.']
      : /suspe|arson|fogo posto|intencional|deliber/.test(t) ? ['Too early to say. A start at that hour with no lightning is often deliberate, but power lines and machinery happen too.', 'Ainda é cedo para dizer. Um início a essa hora sem trovoada é muitas vezes intencional, mas também há linhas elétricas e máquinas.']
      : ['Understood, it is in the case notes.', 'Entendido, fica nas notas do processo.'];
    var NEXT = [['Was there any lightning or a storm in the area last night?', 'Houve trovoada ou tempestade na zona esta noite?'],
      ['Are there power lines, a road or a track close to the point of origin?', 'Há linhas elétricas, estrada ou caminho perto do ponto de início?'],
      ['Can your crews keep the point of origin untouched until our investigators get there?', 'As equipas conseguem manter o ponto de início intacto até os nossos investigadores lá chegarem?'],
      ['If anyone has photos of the first minutes, please send them. They help the investigation.', 'Se alguém tiver fotografias dos primeiros minutos, envie-as, por favor. Ajudam a investigação.']];
    var nx = NEXT[q] || null; c.step = q + 1;
    say(c, 0, ack[0] + (nx ? ' ' + nx[0] : ' That is all I need for now.'), ack[1] + (nx ? ' ' + nx[1] : ' Por agora é tudo o que preciso.'), 2000, 2);
  }
  var POL_SYS = 'You role-play a police captain of the local force (given in the brief) in a phone chat inside a wildfire command app. This is a realistic training simulation. The person writing to you is the fire owner (incident commander), who has reported an ignition that started at night and asked the police to investigate. ' +
    'You are not a firefighter: you never fight the fire, send crews, talk about driving to the scene or give fire tactics. Your topic is the investigation of a suspicious night ignition: how and when it was detected, people or vehicles seen, access roads and tracks, power lines, lightning and weather, earlier fires in the area, preserving the point of origin, photos, witnesses. ' +
    'Lead the conversation like an investigator: acknowledge what the fire owner tells you and ask one clear follow-up question at a time. Calm, professional, plain human sentences; 1 to 3 sentences. Never name a culprit or a cause without evidence, never invent other people in the chat. No emojis, no markdown. Everything you write must be in LANGUAGE. ' +
    'Answer with JSON only: {"replies":[{"who":0,"text":"<message>","minutes":<minutes before this message, 1 to 20>}]} with one reply.';
  function policeBrief(c) {
    var P = c.people[0] || {}, pt = PT();
    var tr = c.msgs.slice(-24).map(function (m) { var at = '[' + hhmm(m.vt || m.t) + '] ';
      if (m.kind === 'msg') return at + (m.from === 'me' ? 'FIRE OWNER' : P.name) + ': ' + (pt ? m.pt || m.en : m.en);
      if (m.kind === 'card') return at + 'CARD: ' + [m.tag && m.tag.en, m.title && m.title.en, m.body && m.body.en].filter(Boolean).join(' · ');
      return ''; }).filter(Boolean).join('\n');
    return 'You are ' + P.name + ', police captain (' + P.org + '), investigating a night ignition. The fire: ' + c.reg + '.\n\nChat so far, oldest first:\n' + tr;
  }
  function policeAi(c, text) {
    var key = c.key; c.pending = { who: 0, at: Date.now(), q: text }; INF[key] = 1;
    aiCall(POL_SYS.replace('LANGUAGE', LNAME(false)), policeBrief(c) + '\n\nThe fire owner just wrote: "' + text + '"\nReply now.', 500, function (err, txt) {
      delete INF[key]; var c2 = load().chats[key]; if (!c2) return;
      if (err) { c2.pending = null; policeReply(c2, text); save(); emit(); return; }
      aiDeliver(key, txt, function (c3) { policeReply(c3, text); });
    });
  }

  // Building the incident descriptor from a screen's candidate or fire object
  function xyToLL(x, y) { return { lat: 34.19 - (y - 662) / 2829, lon: (x - 518) / 2345 - 118.13 }; }
  function incCand(c) {
    var ll = c.live && isFinite(c.live.lat) ? { lat: c.live.lat, lon: c.live.lon } : xyToLL(c.x, c.y);
    return { kind: 'cand', id: c.id, place: c.place, reg: c.co || c.reg || '', st: c.st || '', lat: ll.lat, lon: ll.lon, conf: c.conf, src: c.srcList || c.src || '', det: c.live && c.live.t ? Date.parse(c.live.t) || null : null, x: c.x, y: c.y };
  }
  function incFire(f) {
    var ll = xyToLL(f.x, f.y), I = f.info || {};
    var sc = /^F-/.test(f.id || '') && !I.sc ? 4 : (I.sc || ({ hot: 5, warn: 5, amber: 7, blue: 7, ok: 8, watch: 9, off: 10 })[I.tone] || 5);   // just confirmed from a candidate: 1st alert
    if (!I.sc && sc === 5 && I.startMs && Date.now() - I.startMs > 90 * MIN) sc = 6;   // fought for hours: crews are on scene
    var src = I.src ? (I.stEn || 'Active') + ' · ' + I.src : '';
    return { kind: 'fire', id: f.id, place: f.place, reg: f.co || '', st: f.st || '', lat: ll.lat, lon: ll.lon, note: src || f.note || '', sc: sc, x: f.x, y: f.y, det: f.det || null, startMs: I.startMs || null, curMs: I.heldMs || null, ha: I.ha || null, res: f.res || null };
  }
  // The fire's stage as one shared component (tags in lists, bands, map tooltips, headers): its stage on the chat's
  // spectrum (ANEPC code, else the feed's tone), the label the source gives (e.g. "45% contained"), and the stage's colours and icon
  function stageIdx(f) { var I = (f && f.info) || {}, sc = /^F-/.test((f && f.id) || '') && !I.sc ? 4 : (I.sc || ({ hot: 5, warn: 5, amber: 7, blue: 7, ok: 8, watch: 9, off: 10 })[I.tone] || 5);
    if (!I.sc && sc === 5 && I.startMs && Date.now() - I.startMs > 90 * MIN) sc = 6; return stageFromCode(sc); }
  function stageTag(f) { var i = stageIdx(f), S = STAGES[i] || STAGES[2], I = (f && f.info) || {}, conf = /^Confirmed from /.test((f && f.note) || '');
    // (Oct 3, 22:23) the label is the stage's own name, so words, colour and icon always agree (the feed's wording, e.g. "Not contained", spans several stages)
    return { i: i, label: PT() ? S.pt : S.en, src: I.stEn || I.st || (conf ? 'Confirmed' : 'Active'), fg: S.c, bg: S.bg, ic: ICON[S.icon], en: S.en }; }
  window.__wfStageTag = stageTag;
  // Chats and their counts follow the selected region: an incident chat belongs to its place; a direct message to its
  // country or state (Portugal never shows Brazil's or the US's messages)
  function inScope(c, SC) { if (!SC || !SC.st || !c || !c.st) return true;
    if (c.kind === 'dm') return c.st === SC.st || (SC.st === 'US' && /^[A-Z]{2}$/.test(c.st) && c.st !== 'PT') || (SC.st === 'AMZ' && c.st === 'BRA');
    return !window.__wfInArea || window.__wfInArea({ st: c.st, co: c.reg }, SC.st, SC.co); }
  window.__wfChat = {
    incCand: incCand, incFire: incFire,
    STAGES: STAGES, ICON: ICON, L: L, hhmm: hhmm, dur: dur, clock: clock, keyOf: keyOf, stageOf: stageOf, actions: actions, unread: unread, lastMsg: lastMsg, typing: typing, fresh: fresh,
    vnow: vnow, since: since, photo: photoOf, evid: evidOf,
    crest: function (c, station) {   // a station of this chat, by short or full name
      var st = (c.stations || []).find(function (x) { return x.short === station || x.name === station; }) || (c.forces || []).find(function (f) { return f.station === station; }) || {};
      return window.__wfCrest ? window.__wfCrest(st.ck || '', st.name || st.full || station) : { url: '', kind: 'drawn', label: '', color: '' };
    }, stageDurs: stageDurs, stats: stats, sizeClass: sizeClass, fmtDur: fmtDur, person: person, isUS: isUS, leadRole: leadRole, active: active, ensureAir: ensureAir,
    inScope: inScope,
    get: function (k) { return load().chats[k] || null; },
    find: function (inc) { return load().chats[keyOf(inc)] || null; },
    list: function () { var db = load(); return Object.keys(db.chats).map(function (k) { return db.chats[k]; }); },
    badge: function (n) { n = Number(n) || 0; return n > 20 ? '20+' : String(n); },   // counts on badges: 20+ past twenty
    // The chat badge counts what the chats list shows: open chats in the selected area (and direct messages), never chats
    // from another area the list cannot reach
    /* (Oct 5) after a fire is finished and the person is back home: the incident newly assigned to them, if any */
    newAssignedPeek: function (snap) { if (snap === null) return null; try { snap = JSON.parse(snap || '[]'); } catch (e) { snap = []; }
      var db = load(), SC = null; try { SC = JSON.parse(sessionStorage.getItem('wf-scope') || 'null'); } catch (e) {} SC = SC || (window.__wfMem || {}).scope || null; var lk = ({ pt: 'PT', ca: 'CA', nv: 'NV', amz: 'AMZ' })[role || ''] || null;
      if (lk && (!SC || SC.st !== lk)) SC = lk === 'CA' ? { st: 'CA', co: 'Los Angeles' } : { st: lk, co: null }; SC = SC && SC.st ? SC : { st: 'CA', co: 'Los Angeles' };
      var op = Object.keys(db.chats).map(function (k) { return db.chats[k]; }).filter(function (c) { return !c.closed && inScope(c, SC); }).sort(function (a, b) { return (unread(b) ? 1 : 0) - (unread(a) ? 1 : 0) || (b.updated || 0) - (a.updated || 0); });
      var n = ownedChats(op, true).filter(function (c) { return snap.indexOf(c.key) < 0; }); return n.length ? n[0].key : null; },
    offer: function () { return offerKey(); }, offerNow: function () { offerRender(); },
    snapAssigned: function () { try { sessionStorage.setItem('wf-assign-snap', JSON.stringify(mineKeys())); } catch (e) {} },
    totalUnread: function () { var db = load(), SC = null; try { SC = JSON.parse(sessionStorage.getItem('wf-scope') || 'null'); } catch (e) {} SC = SC || (window.__wfMem || {}).scope || null; var r0 = null; try { r0 = localStorage.getItem('wf-role'); } catch (e) {} var lk = ({ pt: 'PT', ca: 'CA', nv: 'NV', amz: 'AMZ' })[r0 || ''] || null;
      if (lk && (!SC || SC.st !== lk)) SC = lk === 'CA' ? { st: 'CA', co: 'Los Angeles' } : { st: lk, co: null }; SC = SC && SC.st ? SC : { st: 'CA', co: 'Los Angeles' };   /* as the chats list reads it */
      var inSc = function (c) { return inScope(c, SC); };
      var op = Object.keys(db.chats).map(function (k) { return db.chats[k]; }).filter(function (c) { return !c.closed && inSc(c); }).sort(function (a, b) { return (unread(b) ? 1 : 0) - (unread(a) ? 1 : 0) || (b.updated || 0) - (a.updated || 0); });
      return ownedChats(op, true).reduce(function (a, c) { return a + unread(c); }, 0); },   /* only the incidents assigned to this fire owner count */
    mine: ownedChats, assign: assign, wasMine: function (c) { return !!c && hist().indexOf(c.key) >= 0; },
    nearby: function (key) { var c = load().chats[key]; return c ? nearby(c, 50) : []; }, setTopic: setTopic,
    police: function (inc) { var c = police(inc); try { sessionStorage.setItem('wf-chat-open', c.key); } catch (e) {} return c; },
    callFace: function (key) { var c = load().chats[key]; return c ? faceOfPolice(c) : 'police-a'; },   /* the police leader's face for this report: one of three, chosen at random once, then the same in every call */
    policeChat: function (id) { return load().chats['p:' + id] || null; },
    direct: function (o) { var c = direct(o); try { sessionStorage.setItem('wf-chat-open', c.key); } catch (e) {} return c; },
    names: function (st) { return (NAMES[LANG[st] || 'us'] || NAMES.us).slice(); },
    ensure: function (inc) { return create(inc); },   /* the chat exists (so the orders go to it) without opening it */
    open: function (inc) { var c = create(inc); try { sessionStorage.setItem('wf-chat-open', c.key); } catch (e) {} return c; },
    openList: function () { try { sessionStorage.setItem('wf-chat-open', ''); } catch (e) {} },
    current: function () { try { return sessionStorage.getItem('wf-chat-open') || ''; } catch (e) { return ''; } },
    seen: function (k) { var c = load().chats[k]; if (c) { if (!c.closed && mineKeys().indexOf(k) >= 0) assign(k);   /* (Oct 6) opening an incident never takes a place: only Enroll does */ if (!c.seenAt) (c.msgs || []).forEach(function (m) { if (m.reqDecl && !m.done) m.nagAt = Date.now(); }); c.seenAt = Date.now(); save(); emit(); } },   /* (Oct 5, 10:19) a request written before you came waits 45 s from your first look before the reminder */
    forget: function (k) { var db = load(); if (db.chats[k]) { delete db.chats[k]; save(); emit(); } },   // the tour starts its demo ignition's chat afresh
    send: send, act: act, dispatched: dispatched, pend: pend, simulate: simulate,
    ai: { key: rawKey, on: function () { return !!rawKey() && !aiOff(); }, status: function () { return aiStatus(); },
      setOn: function (v) { try { if (v) localStorage.removeItem('wf-ai-off'); else localStorage.setItem('wf-ai-off', '1'); } catch (e) {} emit(); },
      set: function (k, cb) { k = String(k || '').trim(); try { if (k) localStorage.setItem(AIK, k); else { localStorage.removeItem(AIK); localStorage.removeItem(AIS); } } catch (e) {} emit();
        if (k) { try { localStorage.removeItem('wf-ai-off'); } catch (e) {} } if (k) aiCall('Reply with the single word: ready', 'Ready?', 5, function (err) { if (cb) cb(err); }); else if (cb) cb(null); } },
    // The system calls you when a candidate is detected in your area: one chat is started for the most likely one
    autoStart: function (inc) { var db = load(); if (db.auto || !inc) return; db.auto = true; save(); create(inc); },
    reset: function () { DB = { chats: {} }; save(); emit(); }
  };
  tick();
  if (role) setTimeout(seedPast, 400);   // two past fires per profile, already resolved, for the Resolved tab
  // Chats left without a team (their station lookup failed or found nothing) get one now: stations, coordinators and,
  // for a fire already under way, their crews; a closed fire's summary is counted again with them.
  function heal() {
    var d = load(), fixed = false;
    // A closed fire with a team but no forces on record: its crews are estimated from the team
    Object.keys(d.chats).forEach(function (k) { var c = d.chats[k]; if (!c || c.dismissed || !c.closed || !(c.people && c.people.length) || !(c.stations && c.stations.length) || (c.forces && c.forces.length) || c.stage < 2) return;
      c.forces = c.stations.slice(0, c.people.length).map(function (st0, i) { return forceFor(c, i, i < 2 ? 'released' : 'standby'); }); c.estF = true; c.sum = stats(c); fixed = true; });
    if (fixed) { save(); emit(); }
    Object.keys(d.chats).forEach(function (k) { var c0 = d.chats[k]; if (!c0 || c0.dismissed || (c0.people && c0.people.length)) return;
      stationsFor(c0.st, c0.lat, c0.lon, function (S) { var dd = load(), c = dd.chats[k]; if (!c || (c.people && c.people.length) || !S.length) return;
        c.stations = S.slice(0, 4); c.reserve = S[4] || null;
        var nm = pickNames(c, c.stations.length, 'coord');
        c.people = c.stations.map(function (s, i) { return { name: nm[i], code: initials(nm[i]), org: s.short, kind: 'lead' }; });
        if (c.stage >= 2) { c.flags.dispatched = true;
          c.forces = c.stations.map(function (s, i) { return forceFor(c, i, i < 2 ? (c.stage === 2 ? 'enroute' : c.stage >= 7 ? 'released' : c.stage === 6 && i ? 'released' : c.stage === 6 ? 'watch' : 'onscene') : 'standby'); }); }
        c.estF = true;   // forces estimated afterwards (shown with ~)
        if (c.closed) c.sum = stats(c);
        save(); emit(); }); });
  }
  // Never fewer than two stations and two station chiefs in an open chat: older chats with one get the next nearest
  function healTwo() {
    var d = load();
    Object.keys(d.chats).forEach(function (k) { var c0 = d.chats[k]; if (!c0 || c0.kind === 'dm' || /^p:/.test(k) || c0.dismissed || c0.closed || !c0.people || !c0.people.length || (c0.stations || []).length >= 2) return;
      stationsFor(c0.st, c0.lat, c0.lon, function (S) { var dd = load(), c = dd.chats[k]; if (!c || (c.stations || []).length >= 2) return;
        var have = {}; c.stations.forEach(function (s) { have[s.ck || s.name] = 1; });
        S.filter(function (s) { return !have[s.ck || s.name]; }).slice(0, 2 - c.stations.length).forEach(function (s) {
          var n = pickNames(c, 1, 'more')[0]; c.people.push({ name: n, code: initials(n), org: s.short, kind: 'lead' }); c.stations.push(s); });
        save(); emit(); }); });
  }
  // (Oct 3, 22:04) older chats follow the team rule: a candidate's chat has the leads of the four nearest stations; once the
  // fire is declared, only the leads of the stations sent stay (the others have left)
  function healTeam() {
    var d = load(), fixed = false;
    Object.keys(d.chats).forEach(function (k) { var c = d.chats[k]; if (!c || c.kind === 'dm' || /^p:/.test(k) || c.dismissed || !c.people || !c.people.length) return;
      if (c.flags && c.flags.dispatched && c.sentIdx && c.sentIdx.length) c.people.forEach(function (p, i) { if (!p.left && p.kind !== 'air' && c.sentIdx.indexOf(i) < 0) { p.left = true; fixed = true; } });
      else if (c.flags && c.flags.dispatched && !c.sentIdx && c.stage >= 2) c.people.forEach(function (p, i) { var f = (c.forces || []).find(function (x) { return x.si === i; }); if (!p.left && p.kind !== 'air' && (!f || f.st === 'standby')) { p.left = true; fixed = true; } });
      else if (!c.closed && c.stage === 0 && c.people.length < 4 && c.reserve) { var r = c.reserve; c.reserve = null; var n = pickNames(c, 1, 'more')[0];
        c.people.push({ name: n, code: initials(n), org: r.short, kind: 'lead' }); c.stations.push(r); fixed = true; }
      /* (Oct 7) the team follows the dispatch: an air lead without air resources ordered leaves the team */
      if (c.flags && c.flags.air && !c.air) { var u1 = isUS(c), h1 = u1 ? 'Helicopter 15' : 'Helicóptero H-21'; c.air = { name: h1, kind: u1 ? 'Firefighting helicopter · LAFD Air Operations' : 'Helicóptero de ataque inicial · Força Aérea', st: c.closed ? 'released' : 'assigned' }; fixed = true; }
      if (!(c.flags && c.flags.air) && !c.air) c.people.forEach(function (p) { if (p.kind === 'air' && !p.left) { p.left = true; fixed = true; } });
      if (!c.closed && ensureAir(c)) fixed = true; });
    if (fixed) { save(); emit(); }
  }
  if (role) setTimeout(healTeam, 1500);
  if (role) setTimeout(heal, 900);
  if (role) setTimeout(healTwo, 1200);

  // ---- (Oct 6) New assignment: a floating card offers an incident for a free place (Snooze | Enroll) ----------------------
  // Worked out on the main screen only (after a fire is resolved there is a place again); once offered it stays on every
  // screen, the incident's own page included, until Enroll or Snooze. Tapping the card opens the incident's page.
  var OFK = 'wf-offer', OFS = 'wf-offer-shown', SNZ = 'wf-offer-snooze-' + RK, SNOOZE = 15 * MIN;
  function scopeNow() { var SC = null; try { SC = JSON.parse(sessionStorage.getItem('wf-scope') || 'null'); } catch (e) {} SC = SC || (window.__wfMem || {}).scope || null; var lk = ({ pt: 'PT', ca: 'CA', nv: 'NV', amz: 'AMZ' })[role || ''] || null;
    if (lk && (!SC || SC.st !== lk)) SC = lk === 'CA' ? { st: 'CA', co: 'Los Angeles' } : { st: lk, co: null }; return SC && SC.st ? SC : { st: 'CA', co: 'Los Angeles' }; }
  function isHome() { return /Main\.dc\.html$|\/$/.test(location.pathname); }
  function offerPick() {
    if (!role || tourMute()) return null;
    var until = 0; try { until = +localStorage.getItem(SNZ) || 0; } catch (e) {} if (Date.now() < until) return null;
    var db = load(), A = mineKeys().filter(function (k) { var c = db.chats[k]; return c && !c.closed && c.kind !== 'dm'; });
    if (A.length >= MAXOWN) return null;
    var full = false; try { full = localStorage.getItem(AKEY + '-full') === '1'; } catch (e) {} if (!full) return null;   /* still filling the first five by themselves */
    var SC = scopeNow(), C = Object.keys(db.chats).map(function (k) { return db.chats[k]; }).filter(function (c) { return !c.closed && !c.dismissed && !c.drill && c.kind !== 'dm' && A.indexOf(c.key) < 0 && inScope(c, SC); })
      .sort(function (a, b) { return (unread(b) ? 1 : 0) - (unread(a) ? 1 : 0) || (b.updated || 0) - (a.updated || 0); });
    return C[0] ? C[0].key : null; }
  function incPage(c) {   /* the incident's own page, as the chat's "view" button opens it */
    if (c.kind === 'cand' && c.stage === 0) { window.__wfMem = Object.assign(window.__wfMem || {}, { focus: c.incId }); try { sessionStorage.setItem('wf-focus', c.incId); } catch (e) {} return 'Alert.dc.html'; }
    var id = c.kind === 'cand' ? 'F-' + c.incId : c.incId, v = { id: id, place: c.place, note: c.kind === 'cand' ? 'Confirmed from ' + c.incId : c.note, x: c.x, y: c.y, det: c.det || null, t: Date.now() };
    window.__wfMem = Object.assign(window.__wfMem || {}, { fireView: v }); try { sessionStorage.setItem('wf-fireview', JSON.stringify(v)); } catch (e) {} return 'Dispatch.dc.html'; }
  function onPage(c) { var p = location.pathname; return c.kind === 'cand' && c.stage === 0 ? /Alert\.dc\.html$/.test(p) : /Dispatch\.dc\.html$/.test(p); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function offerKey() { try { return sessionStorage.getItem(OFK) || ''; } catch (e) { return ''; } }
  function offerSet(k) { try { if (k) sessionStorage.setItem(OFK, k); else { sessionStorage.removeItem(OFK); sessionStorage.removeItem(OFS); } } catch (e) {} }
  var ofEl = null, ofBusy = false;
  function offerHide(anim) { var el = ofEl; ofEl = null; if (!el) return; if (!anim) { el.remove(); return; } el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; setTimeout(function () { el.remove(); }, 450); }
  function offerChoose(k, how) {   /* the choice made: the other button goes, the chosen one fills the row in the past tense with a check, then the card folds away */
    if (ofBusy || !ofEl) return; ofBusy = true; var PT = window.__wfLang === 'pt';
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    if (how === 'enroll') { assign(k); emit(); } else { try { localStorage.setItem(SNZ, String(Date.now() + SNOOZE)); } catch (e) {} }
    offerSet('');
    var row = ofEl.querySelector('[data-of-row]'), keep = row && row.querySelector(how === 'enroll' ? '[data-of-enroll]' : '[data-of-snooze]'), drop = row && row.querySelector(how === 'enroll' ? '[data-of-snooze]' : '[data-of-enroll]');
    if (drop) drop.remove();
    if (keep) { keep.style.pointerEvents = 'none';   /* the chosen button keeps its own look, never the disabled one */
      keep.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>' + (how === 'enroll' ? (PT ? 'Assumido' : 'Enrolled') : (PT ? 'Adiado 15 min' : 'Snoozed 15 min')); }
    setTimeout(function () { ofBusy = false; offerHide(true); }, 1400); }
  function offerRender() {
    var k = offerKey();
    if (!k && isHome() && document.visibilityState !== 'hidden') { k = offerPick(); if (k) offerSet(k); }
    var c = k ? load().chats[k] : null;
    if (k && (!c || c.closed || c.dismissed || mineKeys().indexOf(k) >= 0)) { offerSet(''); c = null; }
    if (!c || tourMute() || /Login\.dc\.html$|reset\.html$/.test(location.pathname)) { if (!ofBusy) offerHide(false); return; }
    if (ofBusy) return;
    var PT = window.__wfLang === 'pt', T = function (o) { return o ? (PT ? o.pt || o.en : o.en) : ''; };
    var S = stageOf(c) || {}, u = unread(c), lm = lastMsg(c), who = lm && lm.kind === 'msg' ? (lm.from === 'me' ? (PT ? 'Você' : 'You') : (c.people[lm.from] || {}).name || '') : '';
    var txt = lm ? (lm.kind === 'card' ? T(lm.title) : (PT ? lm.pt || lm.en : lm.en)) : (PT ? 'A chamar as equipas…' : 'Calling the teams…');
    var here = onPage(c), first = false; try { first = sessionStorage.getItem(OFS) !== k; sessionStorage.setItem(OFS, k); } catch (e) {}
    var html =
      /* qualifier band, top row edge to edge */
      '<div style="display: flex; align-items: center; min-height: 44px; padding: 0 16px; background: var(--wf-fill, #E5E5EA); color: var(--wf-ink, #000000); font-size: 17px; font-weight: 600; line-height: 22px">' + (PT ? 'Nova atribuição' : 'New assignment') + '</div>' +
      /* the incident, as its card in the assignments list */
      '<div data-of-go role="' + (here ? 'group' : 'link') + '" tabindex="' + (here ? '-1' : '0') + '" aria-label="' + esc(c.place + (here ? '' : PT ? '. Ver incidente' : '. View incident')) + '" style="display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 8px; align-items: center; padding: 16px 16px 0; cursor: ' + (here ? 'default' : 'pointer') + '">' +
        '<span style="min-width: 0; font-size: 17px; font-weight: 700; line-height: 22px; color: var(--wf-ink, #000000); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">' + esc(c.place) + '</span>' +
        '<span class="wf-stg" style="display: inline-flex; justify-self: end; align-items: center; justify-content: center; gap: 8px; min-height: 28px; padding: 4px 16px; box-sizing: border-box; border-radius: 8px; background: ' + S.bg + '; font-size: 16px; line-height: 20px; font-weight: 600; white-space: nowrap; color: ' + S.c + '"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex-shrink: 0"><path d="' + (ICON[S.icon] || '') + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' + esc(T(S)) + '</span>' +
        '<span style="grid-column: 1 / span 2; min-width: 0; font-size: 16px; line-height: 20px; color: var(--wf-sec, #6E6E73); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden">' + esc((who ? who + ': ' : '') + txt) + '</span>' +
        '<span style="grid-column: 1 / span 2; display: flex; align-items: center; gap: 8px; margin-top: 8px"><span style="min-width: 0; font-size: 16px; font-weight: 700; line-height: 20px; color: var(--wf-ink2, #3A3A3C)">' + (u ? u + ' ' + (PT ? (u === 1 ? 'mensagem por ler' : 'mensagens por ler') : (u === 1 ? 'unread message' : 'unread messages')) + '.' : (PT ? 'Todas as mensagens lidas.' : 'All messages read.')) + '</span>' +
          (here ? '' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--wf-ink2, #3A3A3C)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: auto; flex-shrink: 0"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>') + '</span>' +
      '</div>' +
      /* the choice: secondary left, primary right, one row */
      '<div data-of-row style="display: flex; gap: 16px; padding: 24px 16px 16px"><button type="button" class="btn wf-sec" data-of-snooze style="flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; font: inherit; cursor: pointer">' + (PT ? 'Adiar' : 'Snooze') + '</button><button type="button" class="btn primary" data-of-enroll style="flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; font: inherit; cursor: pointer">' + (PT ? 'Assumir' : 'Enroll') + '</button></div>';
    if (!ofEl) {
      ofEl = document.createElement('div'); ofEl.id = 'wf-offer'; ofEl.setAttribute('role', 'dialog'); ofEl.setAttribute('aria-label', PT ? 'Nova atribuição' : 'New assignment');
      ofEl.style.cssText = 'position: fixed; left: 16px; right: 16px; bottom: 32px; z-index: 400; max-width: 420px; margin: 0 auto; box-sizing: border-box; border-radius: 16px; overflow: hidden; background: var(--wf-surface, #FFFFFF); box-shadow: 0 0 32px rgba(0,0,0,0.22); transition: opacity .45s ease, transform .55s cubic-bezier(.2,.8,.2,1); -webkit-user-select: none; user-select: none';
      if (first) { ofEl.style.opacity = '0'; ofEl.style.transform = 'translateY(24px)'; }
      ofEl.addEventListener('click', function (e) { var t = e.target, k0 = offerKey(), c0 = k0 ? load().chats[k0] : null; if (!c0) return;
        if (t.closest('[data-of-enroll]')) return offerChoose(k0, 'enroll');
        if (t.closest('[data-of-snooze]')) return offerChoose(k0, 'snooze');
        if (t.closest('[data-of-go]') && !onPage(c0)) { try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} var href = incPage(c0); window.location.href = href; } });
      document.body.appendChild(ofEl);
      if (first) requestAnimationFrame(function () { requestAnimationFrame(function () { if (ofEl) { ofEl.style.opacity = '1'; ofEl.style.transform = 'translateY(0px)'; } }); });
    }
    if (ofEl.__html !== html) { ofEl.innerHTML = html; ofEl.__html = html; }
  }
  function offerBoot() { if (!role || !document.body) return; setTimeout(offerRender, 1200);
    window.addEventListener('wf-chat', function () { setTimeout(offerRender, 0); }); window.addEventListener('focus', offerRender); window.addEventListener('pageshow', offerRender);
    document.addEventListener('visibilitychange', offerRender); setInterval(offerRender, 5000); }
  // (Oct 7) one story everywhere: a candidate declared (or dismissed) in its chat stays declared on every screen, also after
  // the app is closed and opened again (the decision lives with the chat, which is kept; the screens' own memory is per session)
  (function syncDecisions() { try { var db = load(), C0 = {}, D0 = {}, add = false;
    try { C0 = JSON.parse(sessionStorage.getItem('wf-confirmed') || '{}') || {}; } catch (e) {} try { D0 = JSON.parse(sessionStorage.getItem('wf-dismissed') || '{}') || {}; } catch (e) {}
    Object.keys(db.chats).forEach(function (k) { var c = db.chats[k]; if (!c || c.kind !== 'cand' || c.incId == null) return;
      if (c.dismissed) { if (!D0[c.incId]) { D0[c.incId] = true; add = true; } }
      else if (c.stage >= 1 && !C0[c.incId]) { C0[c.incId] = (c.hist || []).filter(function (h) { return h.s === 1; }).map(function (h) { return h.vt; })[0] || Date.now(); add = true; } });
    if (add) { try { sessionStorage.setItem('wf-confirmed', JSON.stringify(C0)); sessionStorage.setItem('wf-dismissed', JSON.stringify(D0)); } catch (e) {} window.__wfMem = Object.assign(window.__wfMem || {}, { confirmed: C0, dismissed: D0 }); }
  } catch (e) {} })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', offerBoot); else offerBoot();
})();
