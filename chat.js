// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Incident chats (demonstration). One chat per incident gathers the coordinator (you) and the team leads of the
// nearest fire stations. The system posts a card at every change of state; scripted team members answer your messages
// and your actions with realistic delays, so a fire can be followed from ignition candidate to closed.
// Chats are kept on this phone, per signed-in profile. Stations are real (OpenStreetMap); people and their messages are
// a scripted demonstration.
(function () {
  if (window.__wfChat) return;
  var role = ''; try { role = localStorage.getItem('wf-role') || ''; } catch (e) {}
  var KEY = 'wf-chats-' + (role || 'anon');
  var PT = function () { return window.__wfLang === 'pt'; };
  var L = function (en, pt) { return PT() && pt ? pt : en; };

  // ---- stages (ANEPC vocabulary) --------------------------------------------------------------------------------
  var STAGES = [
    { en: 'Ignition candidate', pt: 'Candidato a ignição', c: '#0A66CC', icon: 'tri' },
    { en: 'Dispatched · 1st alert', pt: 'Despacho de 1.º alerta', c: '#B84A00', icon: 'fire' },
    { en: 'Ongoing', pt: 'Em curso', c: '#B84A00', icon: 'live' },
    { en: 'Crews on scene', pt: 'Chegada ao TO', c: '#B84A00', icon: 'live' },
    { en: 'Being resolved', pt: 'Em resolução', c: '#7A5600', icon: 'fire' },
    { en: 'Concluding', pt: 'Em conclusão', c: '#1E7A34', icon: 'fire' },
    { en: 'Under surveillance', pt: 'Vigilância', c: '#00707A', icon: 'fire' },
    { en: 'Closed', pt: 'Encerrada', c: '#636366', icon: 'done' }
  ];
  var DISMISSED = { en: 'Dismissed', pt: 'Descartado', c: '#636366', icon: 'done' };
  function stageOf(ch) { return ch.dismissed ? DISMISSED : STAGES[ch.stage] || STAGES[0]; }
  // ANEPC status code -> chat stage
  function stageFromCode(sc) { sc = Number(sc) || 0; return sc >= 10 ? 7 : sc === 9 ? 6 : sc === 8 ? 5 : sc === 7 ? 4 : sc === 6 ? 3 : sc === 5 ? 2 : sc >= 3 ? 1 : 2; }

  // ---- people ---------------------------------------------------------------------------------------------------
  var NAMES = ['João Matos', 'Ana Sousa', 'Pedro Lopes', 'Marta Ribeiro', 'Rui Carvalho', 'Inês Duarte', 'Tiago Ferreira', 'Sofia Martins', 'Nuno Almeida', 'Carla Neves'];
  function initials(n) { return n.split(' ').map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase(); }
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function shortStation(n) { return String(n || '').replace(/^Bombeiros Volunt[aá]rios (de |da |do |das |dos )?/i, 'BV ').replace(/^Associação Humanitária dos /i, ''); }

  // ---- storage --------------------------------------------------------------------------------------------------
  var DB = null;
  function load() { if (DB) return DB; try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} if (!DB || !DB.chats) DB = { chats: {} }; return DB; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  function emit() { try { window.dispatchEvent(new Event('wf-chat')); } catch (e) {} }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { DB = null; emit(); } });

  function keyOf(inc) { var id = String(inc.id || ''); if (/^F-/.test(id)) return 'c:' + id.slice(2); return (inc.kind === 'cand' ? 'c:' : 'f:') + id; }

  // ---- stations near the incident ---------------------------------------------------------------------------------
  var SF = {};
  function stationsFor(st, lat, lon, cb) {
    var cc = st === 'PT' ? 'pt' : (st === 'BRA' || st === 'AMZ') ? 'br' : /^[A-Z]{2}$/.test(st || '') ? 'us' : 'pt';
    var done = function (rows) {
      var kx = 111.32 * Math.cos(lat * Math.PI / 180);
      var near = rows.map(function (r) { return { name: r[4] || 'Fire station', km: Math.hypot((r[2] - lat) * 110.57, (r[3] - lon) * kx) }; })
        .filter(function (q) { return q.km < 80 && !/aeroporto|airport|base aérea/i.test(q.name); })
        .sort(function (a, b) { return a.km - b.km; }).slice(0, 4);
      cb(near.map(function (q) { var min = Math.round(q.km * 1.3 / 50 * 60) + 3; return { name: q.name, short: shortStation(q.name), km: q.km, min: min }; }));
    };
    if (SF[cc]) return done(SF[cc]);
    fetch('data/stations-' + cc + '.json').then(function (r) { return r.json(); }).then(function (js) { SF[cc] = js.s || []; done(SF[cc]); }).catch(function () { SF[cc] = []; done([]); });
  }
  function kmTxt(km) { return km < 10 ? km.toFixed(1) + ' km' : Math.round(km) + ' km'; }

  // ---- creating a chat --------------------------------------------------------------------------------------------
  function create(inc) {
    var db = load(), k = keyOf(inc);
    if (db.chats[k]) return db.chats[k];
    var now = Date.now();
    var stage = inc.kind === 'cand' ? 0 : stageFromCode(inc.sc);
    var ch = { key: k, kind: inc.kind, incId: inc.id, place: inc.place || '', reg: inc.reg || '', st: inc.st || '', lat: +inc.lat || 0, lon: +inc.lon || 0,
      x: inc.x, y: inc.y, note: inc.note || '', conf: inc.conf || null, src: inc.src || '', det: inc.det || null,
      stage: stage, startStage: stage, started: now, people: [], stations: [], msgs: [], queue: [], seenAt: 0, beat: 0, flags: {}, closed: false, dismissed: false, updated: now };
    db.chats[k] = ch; save();
    stationsFor(ch.st, ch.lat, ch.lon, function (S) {
      var d = load(), c = d.chats[k]; if (!c) return;
      var h = hash(k), used = {};
      c.stations = S.slice(0, 3);
      c.reserve = S[3] || null;
      c.people = c.stations.map(function (s, i) { var n = NAMES[(h + i * 3) % NAMES.length]; while (used[n]) n = NAMES[(NAMES.indexOf(n) + 1) % NAMES.length]; used[n] = 1; return { name: n, code: initials(n), org: s.short, kind: 'lead' }; });
      save(); start(c);
    });
    return ch;
  }

  // ---- messages -----------------------------------------------------------------------------------------------------
  var mid = 0;
  function newId() { mid++; return Date.now().toString(36) + mid; }
  function push(c, m, delay) { m.id = newId(); c.queue.push({ due: Date.now() + (delay || 0), m: m }); c.queue.sort(function (a, b) { return a.due - b.due; }); }
  function sys(c, en, pt, delay) { push(c, { kind: 'sys', en: en, pt: pt }, delay); }
  function say(c, who, en, pt, delay) { push(c, { kind: 'msg', from: who, en: en, pt: pt }, delay); }
  function card(c, obj, delay) { obj.kind = 'card'; push(c, obj, delay); }
  function setStage(c, s, delay) { push(c, { kind: 'stage', stage: s }, delay); }
  function lead(c, i) { return Math.min(i, Math.max(0, c.people.length - 1)); }

  // Scripted beats ---------------------------------------------------------------------------------------------------
  function stageCard(c, s) {
    var S = STAGES[s], st = c.stations, P = c.people;
    var base = { tag: { en: S.en, pt: S.pt }, tagC: S.c, stage: s };
    if (s === 0) return Object.assign(base, { tag: { en: 'Ignition detected', pt: 'Ignição detetada' }, title: { en: 'Heat anomaly', pt: 'Anomalia térmica' },
      body: { en: (c.src || 'Satellite') + (c.det ? ' · ' + hhmm(c.det) : ''), pt: (c.src || 'Satélite').replace('Satellite', 'Satélite') + (c.det ? ' · ' + hhmm(c.det) : '') },
      kpi: c.conf ? { v: c.conf + '%', l: { en: 'Likelihood', pt: 'Probabilidade' }, c: '#0A66CC' } : null, link: { en: 'Open candidate', pt: 'Abrir candidato' } });
    if (s === 1) return Object.assign(base, { tag: { en: 'Ignition confirmed', pt: 'Ignição confirmada' }, title: { en: 'Active fire · ' + c.place, pt: 'Incêndio ativo · ' + c.place },
      body: { en: 'Nearest stations, by straight-line distance and estimated drive time', pt: 'Quartéis mais próximos, por distância em linha reta e tempo estimado' },
      rows: st.map(function (x, i) { return { a: x.short, b: kmTxt(x.km) + ' · ~' + x.min + ' min', r: { en: 'Awaiting', pt: 'A aguardar' }, rc: '#545458', i: i }; }),
      link: { en: 'Open fire', pt: 'Abrir incêndio' } });
    if (s === 2) return Object.assign(base, { title: { en: 'Crews en route', pt: 'Meios a caminho' },
      body: { en: 'First on the fire line in about ' + (st[0] ? st[0].min : 15) + ' min', pt: 'Primeiros na linha de fogo em cerca de ' + (st[0] ? st[0].min : 15) + ' min' }, link: { en: 'Open fire', pt: 'Abrir incêndio' } });
    if (s === 3) return Object.assign(base, { title: { en: 'Crews on the fire line', pt: 'Equipas na linha de fogo' },
      body: { en: 'Forces, weather and projection on the fire screen', pt: 'Meios, meteorologia e projeção no ecrã do incêndio' }, link: { en: 'Forces, weather and projection', pt: 'Meios, meteorologia e projeção' } });
    if (s === 4) return Object.assign(base, { title: { en: 'Head held · working the flanks', pt: 'Cabeça dominada · a trabalhar os flancos' }, body: { en: 'No further spread reported', pt: 'Sem progressão reportada' }, link: { en: 'Open fire', pt: 'Abrir incêndio' } });
    if (s === 5) return Object.assign(base, { title: { en: 'Perimeter held · mop-up', pt: 'Perímetro dominado · rescaldo' }, body: { en: 'Crews putting out hotspots along the edge', pt: 'Equipas a extinguir pontos quentes no perímetro' }, link: { en: 'Open fire', pt: 'Abrir incêndio' } });
    if (s === 6) return Object.assign(base, { title: { en: 'Under surveillance', pt: 'Em vigilância' }, body: { en: 'One crew watching for rekindles', pt: 'Uma equipa em vigilância a reacendimentos' }, link: { en: 'Open fire', pt: 'Abrir incêndio' } });
    return Object.assign(base, { title: { en: 'Fire closed', pt: 'Incêndio encerrado' }, body: { en: 'Closed ' + dur(Date.now() - c.started) + ' after this chat opened', pt: 'Encerrado ' + dur(Date.now() - c.started) + ' depois de abrir esta conversa' } });
  }

  function start(c) {
    var P = c.people, n = P.length;
    var names = P.map(function (p) { return p.org; }).join(', ');
    if (c.kind === 'cand') {
      card(c, stageCard(c, 0), 300);
      sys(c, 'Called you (coordinator) and the team leads of ' + (names || 'the nearest stations'), 'Chamados: você (coordenação) e os chefes de equipa de ' + (names || 'os quartéis mais próximos'), 900);
      if (n > 0) say(c, 0, 'Seen. We have a crew of 5 and one fire engine ready at ' + P[0].org + '.', 'Visto. Temos uma equipa de 5 e um veículo prontos em ' + P[0].org + '.', 4500);
      if (n > 1) say(c, 1, 'Available in about 10 min, finishing another call.', 'Disponíveis dentro de 10 min, a terminar outra ocorrência.', 9000);
      if (n > 2) say(c, 2, 'We can see smoke from the station, towards the north-east.', 'Vemos fumo do quartel, para nordeste.', 15000);
    } else {
      var s = c.stage;
      sys(c, 'Chat opened for this fire · you and the team leads of ' + (names || 'the nearest stations'), 'Conversa aberta para este incêndio · você e os chefes de equipa de ' + (names || 'os quartéis mais próximos'), 300);
      card(c, stageCard(c, s), 900);
      entry(c, s, 2500);
    }
    save(); emit();
  }

  // Beats when a stage begins (after its card)
  function entry(c, s, d) {
    var P = c.people; d = d || 0;
    if (s === 1) {
      if (P[0]) say(c, 0, 'Ready to go on your order.', 'Prontos para sair à sua ordem.', d + 3500);
      if (P[1]) say(c, 1, 'Available now.', 'Disponíveis agora.', d + 6500);
      if (P[2]) say(c, 2, 'We can send one crew, the second stays for cover.', 'Podemos enviar uma equipa, a segunda fica de prevenção.', d + 9500);
    } else if (s === 2) {
      if (P[0]) say(c, 0, 'Leaving now. ETA ' + (c.stations[0] ? c.stations[0].min : 15) + ' min.', 'A sair. Chegada prevista em ' + (c.stations[0] ? c.stations[0].min : 15) + ' min.', d + 3000);
      if (P[1]) say(c, 1, 'On our way behind them.', 'A caminho, logo atrás.', d + 6000);
      c.flags.autoArrive = true;
      setStage(c, 3, d + 16000);
    } else if (s === 3) {
      if (P[0]) say(c, 0, 'On scene. Fire in pine and eucalyptus, head running north-east with the wind.', 'No local. Fogo em pinhal e eucaliptal, cabeça a progredir para nordeste com o vento.', d + 3000);
      if (P[1]) say(c, 1, 'Houses about 1 km north-east. We need air support to hold the head before it gets there.', 'Casas a cerca de 1 km para nordeste. Precisamos de meio aéreo para segurar a cabeça antes de lá chegar.', d + 8000);
      card(c, { req: 'air', tag: { en: 'Request · ' + (P[1] ? P[1].name : 'Team lead'), pt: 'Pedido · ' + (P[1] ? P[1].name : 'Chefe de equipa') }, tagC: '#B84A00',
        title: { en: 'Air support', pt: 'Meio aéreo' }, body: { en: 'One helicopter to hold the head before it reaches the houses', pt: 'Um helicóptero para segurar a cabeça antes de chegar às casas' },
        actions: [{ key: 'approveAir', en: 'Approve', pt: 'Aprovar', primary: true }, { key: 'declineAir', en: 'Not now', pt: 'Agora não' }] }, d + 9500);
    } else if (s === 4) {
      if (P[0]) say(c, 0, 'Head is held. Working both flanks, no spread for 20 min.', 'Cabeça dominada. A trabalhar os dois flancos, sem progressão há 20 min.', d + 3000);
    } else if (s === 5) {
      if (P[1]) say(c, 1, 'Perimeter held. Starting mop-up along the edge.', 'Perímetro dominado. A iniciar o rescaldo no perímetro.', d + 3000);
    } else if (s === 6) {
      if (P[0]) say(c, 0, 'One crew stays on watch. Thermal camera shows no hotspots.', 'Fica uma equipa em vigilância. A câmara térmica não mostra pontos quentes.', d + 3000);
    }
  }

  // Answers to the coordinator's free messages, per stage (they cycle)
  var REPLIES = {
    0: [[0, 'Copy. Standing by for your decision.', 'Entendido. Aguardamos a sua decisão.'], [2, 'Smoke is getting thicker, looks like it is growing.', 'O fumo está a ficar mais denso, parece estar a crescer.'], [1, 'Crew ready here too.', 'Equipa pronta aqui também.']],
    1: [[0, 'Copy. Waiting for the dispatch order.', 'Entendido. A aguardar a ordem de despacho.'], [1, 'Understood.', 'Compreendido.']],
    2: [[0, 'Copy. 5 min out.', 'Entendido. A 5 min.'], [1, 'Road is clear, no delays.', 'Estrada livre, sem atrasos.']],
    3: [[0, 'Copy. Holding the south flank.', 'Entendido. A segurar o flanco sul.'], [1, 'Wind picking up from the south-west.', 'O vento está a aumentar de sudoeste.'], [2, 'Water supply is fine for now.', 'Abastecimento de água sem problemas por agora.']],
    4: [[0, 'Copy. Flanks almost closed.', 'Entendido. Flancos quase fechados.'], [1, 'No new spot fires.', 'Sem novos focos secundários.']],
    5: [[1, 'Copy. Mop-up going well.', 'Entendido. Rescaldo a correr bem.'], [0, 'A few hotspots near the road, on it.', 'Alguns pontos quentes junto à estrada, estamos a tratar.']],
    6: [[0, 'Copy. All quiet.', 'Entendido. Tudo calmo.']],
    7: [[0, 'Thanks everyone. Good work.', 'Obrigado a todos. Bom trabalho.']]
  };

  // Quick actions for the coordinator, per stage
  function actions(c) {
    if (c.dismissed || c.stage === 7) return [];
    var s = c.stage, A = [];
    if (s === 0) { A.push({ key: 'confirm', en: 'Confirm fire', pt: 'Confirmar incêndio', primary: true }); if (!c.flags.drone) A.push({ key: 'drone', en: 'Verify by drone', pt: 'Verificar por drone' }); A.push({ key: 'dismiss', en: 'Dismiss', pt: 'Descartar' }); }
    if (s === 1) { A.push({ key: 'dispatch', en: 'Send dispatch orders', pt: 'Enviar ordens de despacho', primary: true }); if (c.reserve && !c.flags.more) A.push({ key: 'more', en: 'Call another station', pt: 'Chamar outro quartel' }); }
    if (s === 2) A.push({ key: 'update', en: 'Ask for an update', pt: 'Pedir ponto de situação' });
    if (s === 3) { if (!c.flags.air) A.push({ key: 'approveAir', en: 'Air support', pt: 'Meio aéreo' }); if (!c.flags.evac) A.push({ key: 'evac', en: 'Evacuation order', pt: 'Ordem de evacuação', danger: true }); if (!c.flags.drone3) A.push({ key: 'drone3', en: 'Drone', pt: 'Drone' }); if (c.flags.air) A.push({ key: 'next', en: 'Move to Being resolved', pt: 'Passar a Em resolução', primary: true }); }
    if (s === 4) A.push({ key: 'next', en: 'Move to Concluding', pt: 'Passar a Em conclusão', primary: true });
    if (s === 5) A.push({ key: 'next', en: 'Move to Under surveillance', pt: 'Passar a Vigilância', primary: true });
    if (s === 6 && !c.flags.closeCard) A.push({ key: 'closeCheck', en: 'Close the fire', pt: 'Encerrar o incêndio', primary: true });
    return A;
  }

  function act(key, a, msgId) {
    var c = load().chats[key]; if (!c) return;
    var P = c.people;
    if (msgId) { var m = c.msgs.find(function (x) { return x.id === msgId; }); if (m) m.done = a; }
    var me = function (en, pt) { c.msgs.push({ id: newId(), kind: 'msg', from: 'me', en: en, pt: pt, t: Date.now() }); };
    if (a === 'confirm') {
      me('Confirming the fire.', 'Confirmo o incêndio.');
      markConfirmed(c);
      setStage(c, 1, 600);
    } else if (a === 'drone') {
      c.flags.drone = true; me('Sending the drone to check before I confirm.', 'Vou enviar o drone para verificar antes de confirmar.');
      c.people.push({ name: 'Carla Neves', code: 'CN', org: L('Drone team', 'Equipa de drone'), kind: 'drone' });
      var di = c.people.length - 1;
      sys(c, 'Carla Neves (drone team) joined', 'Carla Neves (equipa de drone) entrou na conversa', 800);
      say(c, di, 'Drone D-5 taking off, about 6 min to the point.', 'Drone D-5 a descolar, cerca de 6 min até ao ponto.', 3500);
      card(c, { tag: { en: 'Drone D-5 · on site', pt: 'Drone D-5 · no local' }, tagC: '#0A66CC', title: { en: 'Smoke and open flame seen', pt: 'Fumo e chama visíveis' }, body: { en: 'Thermal image shows an active fire front of about 80 m', pt: 'A imagem térmica mostra uma frente ativa de cerca de 80 m' }, link: { en: 'Open candidate', pt: 'Abrir candidato' } }, 11000);
      say(c, di, 'It is a real fire. I recommend confirming.', 'É um incêndio real. Recomendo confirmar.', 13000);
    } else if (a === 'dismiss') {
      me('Dismissing this candidate: no fire on the ground.', 'Descarto este candidato: sem incêndio no terreno.');
      markDismissed(c); c.dismissed = true; c.closed = true;
      sys(c, 'Candidate dismissed · the teams are released', 'Candidato descartado · equipas libertadas', 600);
    } else if (a === 'dispatch') {
      me('Dispatch: ' + c.stations.slice(0, 2).map(function (s) { return s.short; }).join(' and ') + ' go. ' + (c.stations[2] ? c.stations[2].short + ' on standby.' : ''),
        'Despacho: ' + c.stations.slice(0, 2).map(function (s) { return s.short; }).join(' e ') + ' avançam. ' + (c.stations[2] ? c.stations[2].short + ' de prevenção.' : ''));
      c.flags.dispatched = true;
      var cm = c.msgs.filter(function (x) { return x.kind === 'card' && x.stage === 1; }).pop();
      if (cm && cm.rows) cm.rows.forEach(function (r, i) { r.r = i < 2 ? { en: 'Dispatched', pt: 'Despachado' } : { en: 'Standby', pt: 'Prevenção' }; r.rc = i < 2 ? '#1E7A34' : '#7A5600'; });
      setStage(c, 2, 1500);
    } else if (a === 'more') {
      c.flags.more = true; var r = c.reserve; me('Calling ' + r.short + ' as well.', 'Chamo também ' + r.short + '.');
      var n = NAMES[(hash(c.key) + 7) % NAMES.length]; c.people.push({ name: n, code: initials(n), org: r.short, kind: 'lead' }); c.stations.push(r);
      sys(c, n + ' (' + r.short + ') joined', n + ' (' + r.short + ') entrou na conversa', 900);
      say(c, c.people.length - 1, 'Available, ' + kmTxt(r.km) + ' away.', 'Disponíveis, a ' + kmTxt(r.km) + '.', 4000);
    } else if (a === 'update') {
      me('Update, please.', 'Ponto de situação, por favor.');
      if (P[0]) say(c, 0, 'Almost there, smoke column clearly visible.', 'Quase a chegar, coluna de fumo bem visível.', 2500);
    } else if (a === 'approveAir') {
      if (c.flags.air) return; c.flags.air = true;
      me('Air support approved.', 'Meio aéreo aprovado.');
      c.people.push({ name: 'CDOS Leiria', code: 'CD', org: L('Air operations', 'Operações aéreas'), kind: 'ops' });
      var oi = c.people.length - 1;
      sys(c, 'Air operations joined', 'Operações aéreas entrou na conversa', 700);
      say(c, oi, 'Helicopter assigned, about 12 min to the fire.', 'Helicóptero atribuído, cerca de 12 min até ao incêndio.', 3500);
      say(c, oi, 'Helicopter on scene. First water drops on the head.', 'Helicóptero no local. Primeiras descargas na cabeça.', 13000);
      if (P[0]) say(c, 0, 'That did it. The head is slowing down.', 'Resultou. A cabeça está a abrandar.', 18000);
    } else if (a === 'declineAir') {
      c.flags.airNo = true; me('Not yet. Hold with ground crews for now.', 'Ainda não. Segurem com meios terrestres por agora.');
      if (P[1]) say(c, 1, 'Understood. We will try, but it is spreading fast.', 'Compreendido. Vamos tentar, mas está a progredir rápido.', 3000);
    } else if (a === 'evac') {
      c.flags.evac = true; me('Evacuation order for the houses north-east of the fire.', 'Ordem de evacuação para as casas a nordeste do incêndio.');
      card(c, { tag: { en: 'Evacuation order', pt: 'Ordem de evacuação' }, tagC: '#B3001B', title: { en: 'Houses north-east of the fire', pt: 'Casas a nordeste do incêndio' }, body: { en: 'Sent to civil protection and the local police', pt: 'Enviada à proteção civil e às forças de segurança locais' } }, 800);
      c.people.push({ name: 'GNR', code: 'GN', org: L('Local police', 'Forças de segurança'), kind: 'ops' });
      say(c, c.people.length - 1, 'Received. Moving residents to the parish hall.', 'Recebido. A encaminhar os moradores para a junta de freguesia.', 5000);
    } else if (a === 'drone3') {
      c.flags.drone3 = true; me('Send a drone over the head to read the fire behaviour.', 'Enviem um drone sobre a cabeça para ler o comportamento do fogo.');
      say(c, lead(c, 0), 'Drone footage: the head is running upslope, spotting up to 50 m ahead.', 'Imagens do drone: a cabeça sobe a encosta, com projeções até 50 m à frente.', 7000);
    } else if (a === 'next') {
      var nx = c.stage + 1; me('Moving the fire to ' + STAGES[nx].en + '.', 'Passo o incêndio a ' + STAGES[nx].pt + '.');
      setStage(c, nx, 800);
    } else if (a === 'closeCheck') {
      c.flags.closeCard = true;
      card(c, { close: true, tag: { en: 'Ready to close', pt: 'Pronto a encerrar' }, tagC: '#00707A', title: { en: 'Close the fire', pt: 'Encerrar o incêndio' },
        checks: [{ en: 'No active edge or hotspots', pt: 'Sem frente ativa nem pontos quentes' }, { en: c.flags.evac ? 'Evacuation order lifted' : 'No evacuation orders in force', pt: c.flags.evac ? 'Ordem de evacuação levantada' : 'Sem ordens de evacuação em vigor' }, { en: 'All crews accounted for', pt: 'Todas as equipas contabilizadas' }],
        actions: [{ key: 'close', en: 'Declare fire closed', pt: 'Declarar incêndio encerrado', primary: true }] }, 400);
    } else if (a === 'close') {
      me('Declaring the fire closed. Thank you all.', 'Declaro o incêndio encerrado. Obrigado a todos.');
      setStage(c, 7, 800);
    }
    c.updated = Date.now(); c.seenAt = Date.now(); save(); emit(); tick();
  }

  function send(key, text) {
    var c = load().chats[key]; if (!c || !String(text || '').trim()) return;
    c.msgs.push({ id: newId(), kind: 'msg', from: 'me', en: String(text).trim(), pt: String(text).trim(), t: Date.now() });
    var R = REPLIES[c.stage] || [];
    if (R.length && !c.dismissed) { var r = R[c.beat % R.length]; c.beat++; if (c.people[r[0]]) say(c, r[0], r[1], r[2], 2500 + (c.beat % 3) * 900); }
    c.updated = Date.now(); c.seenAt = Date.now(); save(); emit();
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

  // ---- the clock: due messages arrive, on whichever screen is open --------------------------------------------------
  function tick() {
    var db = load(), now = Date.now(), changed = false;
    Object.keys(db.chats).forEach(function (k) {
      var c = db.chats[k];
      while (c.queue.length && c.queue[0].due <= now) {
        var q = c.queue.shift(), m = q.m; m.t = q.due;
        if (m.kind === 'stage') {
          if (c.dismissed) continue;
          c.stage = m.stage; if (c.stage === 7) c.closed = true;
          var sc = stageCard(c, c.stage); sc.id = newId(); sc.kind = 'card'; sc.t = q.due; c.msgs.push(sc);
          if (c.stage < 7) entry(c, c.stage, 0);
          if (c.stage === 7 && c.people[0]) say(c, 0, 'Thanks everyone. Good work.', 'Obrigado a todos. Bom trabalho.', 2500);
        } else c.msgs.push(m);
        c.updated = q.due; changed = true;
      }
    });
    if (changed) { save(); emit(); }
  }
  setInterval(tick, 700);

  // ---- helpers for the screens ----------------------------------------------------------------------------------------
  function hhmm(t) { var d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function dur(ms) { var m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; }
  function unread(c) { return c.msgs.filter(function (m) { return m.t > (c.seenAt || 0) && m.from !== 'me' && m.kind !== 'sys'; }).length; }
  function lastMsg(c) { for (var i = c.msgs.length - 1; i >= 0; i--) { var m = c.msgs[i]; if (m.kind !== 'stage') return m; } return null; }
  function typing(c) { var q = c.queue[0]; return q && q.m.kind === 'msg' && q.due - Date.now() < 2600 ? c.people[q.m.from] : null; }

  // Building the incident descriptor from a screen's candidate or fire object
  function xyToLL(x, y) { return { lat: 34.19 - (y - 662) / 2829, lon: (x - 518) / 2345 - 118.13 }; }
  function incCand(c) {
    var ll = c.live && isFinite(c.live.lat) ? { lat: c.live.lat, lon: c.live.lon } : xyToLL(c.x, c.y);
    return { kind: 'cand', id: c.id, place: c.place, reg: c.co || c.reg || '', st: c.st || '', lat: ll.lat, lon: ll.lon, conf: c.conf, src: c.srcList || c.src || '', det: c.live && c.live.t ? Date.parse(c.live.t) || null : null, x: c.x, y: c.y };
  }
  function incFire(f) {
    var ll = xyToLL(f.x, f.y), I = f.info || {};
    var sc = /^F-/.test(f.id || '') && !I.sc ? 4 : (I.sc || ({ hot: 5, warn: 5, amber: 7, ok: 8, watch: 9, off: 10 })[I.tone] || 5);   // just confirmed from a candidate: 1st alert
    return { kind: 'fire', id: f.id, place: f.place, reg: f.co || '', st: f.st || '', lat: ll.lat, lon: ll.lon, note: f.note || '', sc: sc, x: f.x, y: f.y, det: f.det || null };
  }
  window.__wfChat = {
    incCand: incCand, incFire: incFire,
    STAGES: STAGES, L: L, hhmm: hhmm, dur: dur, keyOf: keyOf, stageOf: stageOf, actions: actions, unread: unread, lastMsg: lastMsg, typing: typing,
    get: function (k) { return load().chats[k] || null; },
    find: function (inc) { return load().chats[keyOf(inc)] || null; },
    list: function () { var db = load(); return Object.keys(db.chats).map(function (k) { return db.chats[k]; }); },
    totalUnread: function () { var db = load(); return Object.keys(db.chats).reduce(function (a, k) { return a + unread(db.chats[k]); }, 0); },
    open: function (inc) { var c = create(inc); try { sessionStorage.setItem('wf-chat-open', c.key); } catch (e) {} return c; },
    openList: function () { try { sessionStorage.setItem('wf-chat-open', ''); } catch (e) {} },
    current: function () { try { return sessionStorage.getItem('wf-chat-open') || ''; } catch (e) { return ''; } },
    seen: function (k) { var c = load().chats[k]; if (c) { c.seenAt = Date.now(); save(); emit(); } },
    send: send, act: act,
    // The system calls you when a candidate is detected in your area: one chat is started for the most likely one
    autoStart: function (inc) { var db = load(); if (db.auto || !inc) return; db.auto = true; save(); create(inc); },
    reset: function () { DB = { chats: {} }; save(); emit(); }
  };
  tick();
})();
