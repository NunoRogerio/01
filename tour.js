// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Quick tour: translucent bubbles that say what to do next, each with a hand-drawn arrow to the control to tap.
// It follows one demo ignition from the main screen to a closed fire, then notifications, chats and settings.
// The step is kept in sessionStorage ('wf-tour'), so the tour carries on across screens. Every bubble has End tour.
// Steps either wait for a tap on the control they point at ('tap'), offer a Next button ('next'), or wait until
// something has happened on screen ('until'). A step whose control can't be found after a while shows Next instead.
// WF_TOUR_ON = false switches the tour off: it never runs or blocks touches, any tour left running is cleared, and the Tour button says it is coming back.
var WF_TOUR_ON = true;
if (!WF_TOUR_ON) { try { sessionStorage.removeItem('wf-tour'); } catch (e) {}
  // While the tour is off, the Tour button stays and opens a dark-glass tooltip saying it is coming back (X or a tap outside closes it)
  var wfTourSoon = function (anchor) {
    var old = document.getElementById('wf-toursoon'); if (old) { old.remove(); return; }
    var pt = window.__wfLang === 'pt', w = document.createElement('div'); w.id = 'wf-toursoon'; w.setAttribute('role', 'dialog'); w.setAttribute('translate', 'no');
    var r = anchor ? anchor.getBoundingClientRect() : { top: innerHeight - 140, left: innerWidth - 80, width: 60 };
    w.style.cssText = 'position:fixed;left:16px;right:16px;bottom:' + Math.max(16, innerHeight - r.top + 12) + 'px;z-index:99995;display:flex;align-items:flex-start;gap:16px;padding:16px;border-radius:20px;background:rgba(28,28,30,0.94);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased;opacity:0;transform:translateY(8px);transition:opacity .28s ease,transform .28s cubic-bezier(.2,.8,.2,1)';
    w.innerHTML = '<p style="flex:1 1 auto;margin:0;font-size:15px;line-height:20px;text-wrap:pretty">' + (pt ? 'A visita está em desenvolvimento. Volta quando tivermos a certeza de que o helicóptero o leva em segurança.' : 'Tour is under development. It will return once we\'re sure the chopper gets you by safely.') + '</p>' +
      '<button type="button" class="opt" data-a="x" aria-label="' + (pt ? 'Fechar' : 'Close') + '" style="flex:0 0 44px;width:44px;height:44px;margin:-10px -10px -10px 0;border:0;border-radius:50%;background:rgba(255,255,255,0.14);color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="transition:transform .5s cubic-bezier(.3,.7,.3,1)"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<span aria-hidden="true" style="position:absolute;bottom:-7px;right:' + Math.max(24, innerWidth - (r.left + r.width / 2) - 8) + 'px;width:14px;height:14px;background:rgba(28,28,30,0.94);transform:rotate(45deg);border-radius:0 0 3px 0"></span>';
    var close = function () { document.removeEventListener('pointerdown', off, true); var ic = w.querySelector('svg'); if (ic) ic.style.transform = 'rotate(90deg)'; w.style.opacity = '0'; w.style.transform = 'translateY(8px)'; setTimeout(function () { w.remove(); }, 300); };
    var off = function (e) { if (!w.isConnected) { document.removeEventListener('pointerdown', off, true); return; } if (!w.contains(e.target) && !(anchor && anchor.contains(e.target))) close(); };
    w.querySelector('[data-a=x]').onclick = close;
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.style.opacity = '1'; w.style.transform = 'none'; });
    setTimeout(function () { document.addEventListener('pointerdown', off, true); }, 0);
  };
  window.__wfTour = { start: function () {}, end: function () {}, warn: wfTourSoon, active: function () { return false; } };
  var wfTourGone = function () { ['wf-tour', 'wf-tourwarn', 'wf-tour-css'].forEach(function (id) { var el = document.getElementById(id); if (el) el.remove(); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wfTourGone); else wfTourGone(); }
if (WF_TOUR_ON) (function () {
  var KEY = 'wf-tour', PAGE = (location.pathname.split('/').pop() || 'index.html');
  var get = function () { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  var put = function (s) { try { if (s) sessionStorage.setItem(KEY, JSON.stringify(s)); else sessionStorage.removeItem(KEY); } catch (e) {} };
  var PT = function () { return window.__wfLang === 'pt'; };

  // ---- finding controls -------------------------------------------------------------------------------------
  var VH = function () { return window.innerHeight; }, VW = function () { return window.innerWidth; };
  // strict: also check nothing sits on top of it (used where a folded blade clips content that still has a size);
  // elsewhere invisible layers (scroll fades, a map band that forwards taps) would wrongly hide real controls
  function shown(el, strict) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    for (var a = el.parentElement, n = 0; a && a !== document.body && n < 40; a = a.parentElement, n++) { var ac = getComputedStyle(a); if (+ac.opacity === 0 || ac.display === 'none') return false; }   // e.g. a full-screen map kept faded out until opened
    if (r.bottom < 0 || r.top > VH()) return 'off';
    if (r.bottom > VH() - 24 || r.top < 24 || r.left < 0 || r.right > VW()) return 'part';   // partly cut off at an edge: scrolled fully into view   // there, but scrolled away: the tour scrolls it into view
    if (!strict) return true;
    var x = Math.min(VW() - 2, Math.max(2, r.left + r.width / 2)), y = Math.min(VH() - 2, Math.max(2, r.top + Math.min(r.height / 2, 40)));
    var h = document.elementFromPoint(x, y); if (!h) return false;
    if (el.contains(h) || (h.shadowRoot && h === el)) return true;
    var host = h.getRootNode && h.getRootNode().host; return !!(host && el.contains(host));
  }
  function q(sel, filter, strict) { var L = document.querySelectorAll(sel), off = null; for (var i = 0; i < L.length; i++) { if (filter && !filter(L[i])) continue; var s = shown(L[i], strict); if (s === true) return L[i]; if ((s === 'off' || s === 'part') && !off) off = L[i]; } return off; }
  var txt = function (el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); };
  function chip(words) { return q('button.chbtn', function (b) { if (!b.parentElement || b.parentElement.style.maxHeight !== '88px') return false; var t = txt(b); return words.some(function (w) { return t.indexOf(w) >= 0; }); }); }
  var chipRow = function () { var b = q('button.chbtn', function (x) { return x.parentElement && x.parentElement.style.maxHeight === '88px'; }); return b ? b.parentElement : null; };
  var pathBtn = function (d) { return q('button.mbtn', function (b) { var p = b.querySelector('path[d^="' + d + '"]'); return !!p && getComputedStyle(p).display !== 'none'; }); };
  var hdr = function (sel) { return q('header[data-pull="down"] ' + sel); };
  var closeIn = function (sec) { var s = document.querySelector(sec); if (!s) return; var b = [].slice.call(s.querySelectorAll('button')).find(function (x) { return x.querySelector('path[d^="M6 6"]'); }); if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; } };
  var areaOpen = function () { var a = document.querySelector('section[data-swipe-key="sc"]'); return !!a && a.getAttribute('aria-hidden') === 'false'; };
  var areaClose = function () { var b = document.querySelector('section[data-swipe-key="sc"] button[data-swipe-go]'); if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; } };
  var scrollEnd = function (sel) { var e = document.querySelector(sel); if (e) e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' }); };

  // The open incident list's most likely candidate (the first row; the list is sorted by likelihood). Only once the
  // list is open (its blade unclipped), judged by the blade itself because the list's top fade covers its first row.
  function listRow() {
    var sec = document.querySelector('section[data-swipe-key="li"]'); if (!sec) return null;
    var cp = getComputedStyle(sec).clipPath || ''; if (!/^inset\(0px/.test(cp) && cp !== 'none') return null;
    var r0 = sec.querySelector('a.sqrow[href="Alert.dc.html"]'); return r0 && shown(r0) ? r0 : null;
  }
  // The map step points at a circle whose summary panel has room to open whole: away from the screen sides and from
  // the top and bottom bands, closest to the upper middle of the map (the bubble then sits clear of the panel)
  function pickMarker() {
    var sel = document.querySelector('[data-wf-maproot] button.tipwrap.igsel'); if (sel && document.querySelector('[data-wf-pop]') && shown(sel) === true) return sel;
    var L = [].slice.call(document.querySelectorAll('[data-wf-maproot] button.tipwrap')), vw = VW(), vh = VH(), best = null, bs = 1e9;
    L.forEach(function (b) { if (shown(b) !== true) return; var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var sc = Math.abs(y - vh * 0.42) + Math.abs(x - vw / 2) * 0.5 + (x < 120 || x > vw - 120 ? 1000 : 0) + (y < 260 || y > vh - 300 ? 1000 : 0);
      if (sc < bs) { bs = sc; best = b; } });
    return best;
  }

  // ---- the steps --------------------------------------------------------------------------------------------
  // t: the action (title); b: one or two short sentences; mode: 'tap' | 'next' | 'until'
  var S = [
    { page: 'Main.dc.html', mode: 'next', next: ['Start', 'Começar'],
      t: ['Quick tour', 'Visita rápida'],
      b: ['Follow one ignition from detection to a closed fire. Tap what the arrow points to, or use ‹ › to move between steps.',
          'Acompanhe uma ignição desde a deteção até ao incêndio encerrado. Toque no que a seta indica, ou use ‹ › para mudar de passo.'] },
    { page: 'Main.dc.html', mode: 'tap', closeAfter: true, find: function () { return hdr('> button.opt[aria-expanded]'); }, area: true, also: 'section[data-swipe-key="sc"]',   // the area picker can be used here; it closes when the tour moves on
      t: ['Choose a region', 'Escolha uma região'],
      b: ['Tap the area name, then pick a country, state or district (or close the list).', 'Toque no nome da área e escolha um país, estado ou distrito (ou feche a lista).'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('[data-wf-leg] button[aria-pressed="false"]'); }, legend: true, lock: true,
      t: ['Show more on the map', 'Mostre mais no mapa'],
      b: ['Grey chips are hidden layers, like active fires or fire stations. Tap one to show it.',
          'As etiquetas cinzentas são camadas escondidas, como incêndios ativos ou quartéis. Toque numa para a mostrar.'] },
    { page: 'Main.dc.html', mode: 'tap', find: pickMarker, also: '[data-wf-pop] a.wf-pri',
      t: ['Pick an incident on the map', 'Escolha um incidente no mapa'],
      b: ['Tap any circle for a short summary, then View.', 'Toque num círculo para um resumo, depois em Ver.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('section[data-swipe-key="li"] > div:last-child > button.opt'); },
      skip: function () { return !!listRow(); },
      t: ['…or from the list', '…ou na lista'],
      b: ['Tap here to open every candidate and fire in this region.', 'Toque aqui para abrir todos os candidatos e incêndios desta região.'] },
    { page: 'Main.dc.html', mode: 'tap', find: listRow, lock: true, also: 'section[data-swipe-key="li"] a.sqrow[href="Alert.dc.html"]',   // any candidate row carries on
      t: ['Open the demo ignition', 'Abra a ignição de demonstração'],
      b: ['We chose the most likely candidate for this tour. Tap it.', 'Escolhemos o candidato mais provável para esta visita. Toque nele.'] },

    { page: 'Alert.dc.html', mode: 'next', interact: true, find: function () { return q('[role=list]:has(> [data-wf-kpi][data-g="ign"])') || q('[data-wf-ighdr]'); },
      ach: ['You found your first ignition', 'Encontrou a sua primeira ignição'], then: ['Now let\'s take a closer look.', 'Agora vamos ver de perto.'],
      t: ['Key figures', 'Números principais'],
      b: ['Likelihood, heat power and people at risk first, to decide fast. Press and hold a card to reorder; tap + to choose which to show.',
          'Probabilidade, potência térmica e pessoas em risco primeiro, para decidir depressa. Prima e mantenha um cartão para reordenar; toque em + para escolher quais mostrar.'] },
    { page: 'Alert.dc.html', mode: 'next', find: function () { return q('button.qtag'); },
      t: ['Confirm or dismiss here', 'Confirme ou descarte aqui'],
      b: ['This tag confirms the fire. In this tour we confirm it with the team, in the chat.', 'Esta etiqueta confirma o incêndio. Nesta visita confirmamos com a equipa, na conversa.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M14 4h6v6'); },
      t: ['See the map full screen', 'Veja o mapa em ecrã inteiro'],
      b: ['Tap to open the map full screen.', 'Toque para abrir o mapa em ecrã inteiro.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M4 14h6v6'); },
      t: ['Back to the page', 'Voltar à página'],
      b: ['Pan and zoom freely. Then tap here to return.', 'Mova e aproxime à vontade. Depois toque aqui para voltar.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M2.5 6h6M15.5 6h6'); }, show: { ms: 4500, t: ['Live drone feed', 'Imagem do drone em direto'], b: ['Smoke and flame seen from above. We close it in a moment to see the spread.', 'Fumo e chama vistos de cima. Fechamos já para ver a propagação.'], close: function () { var b = q('button.mbtn', function (x) { return !!x.querySelector('path[d^="M6 6l12 12"]'); }); if (b) b.click(); } },
      t: ['Send a drone', 'Envie um drone'],
      b: ['Its live feed replaces the map, to check the smoke from above.', 'A imagem em direto substitui o mapa, para ver o fumo de cima.'] },
    { page: 'Alert.dc.html', mode: 'tap', before: function () { var f = q('button.mbtn', function (x) { return !!x.querySelector('path[d^="M6 6l12 12"]'); }); if (f) { selfTap = true; f.click(); selfTap = false; } var m = pathBtn('M4 14h6v6'); if (m) { selfTap = true; m.click(); selfTap = false; } }, find: function () { return q('div[role=tablist].wf-seg'); },
      ach: ['Drone in the air. Nice!', 'Drone no ar. Boa!'], then: ['Now let\'s see where it can spread.', 'Agora vamos ver para onde pode avançar.'],
      t: ['See where it can spread', 'Veja para onde pode avançar'],
      b: ['Tap +1 h, +3 h or +6 h to see the projection.', 'Toque em +1 h, +3 h ou +6 h para ver a projeção.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return q('[data-wf-ighdr] a[href="Chat.dc.html"]'); },
      t: ['Talk with the team', 'Fale com a equipa'],
      b: ['One chat per incident gathers coordinators and station chiefs.', 'Uma conversa por incidente junta coordenadores e comandantes de quartel.'] },

    { page: 'Chat.dc.html', mode: 'next', find: function () { return q('header + button.chrow[aria-expanded]'); },
      t: ["The incident's state", 'O estado do incidente'],
      b: ['Always pinned at the top. Tap it any time for the timeline and projection.', 'Sempre no topo. Toque a qualquer momento para ver a cronologia e a projeção.'] },
    { page: 'Chat.dc.html', mode: 'tap', find: function () { return chip(['Confirm fire', 'Confirmar incêndio', '確認']); },
      t: ['Confirm the fire', 'Confirme o incêndio'],
      b: ['The team agrees it is a real fire.', 'A equipa confirma que é um incêndio real.'] },
    { page: 'Chat.dc.html', mode: 'tap', find: function () { return chip(['Configure dispatch', 'Configurar despacho', '出動']); },
      ach: ['You\'ve confirmed an ignition. Great work!', 'Confirmou uma ignição. Excelente trabalho!'], then: ['Now let\'s deal with the fire.', 'Agora vamos tratar do incêndio.'],
      t: ['Assign resources', 'Atribua meios'],
      b: ['Choose which stations send crews.', 'Escolha que quartéis enviam equipas.'] },

    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('button.mbtn.wf-reset[aria-label]', function (b) { return b.offsetParent !== null; }); },
      t: ['Use the suggested resources', 'Use os meios sugeridos'],
      b: ['One tap fills the plan. Add resources lets you choose stations yourself.', 'Um toque preenche o plano. Adicionar meios deixa escolher os quartéis.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () {
        // Never a dead end: if the plan is still empty (Send order disabled), the tour fills it with the AI suggested pack itself
        var b = q('button.btn.primary', function (x) { return !x.closest('section[role=dialog]') && x.offsetParent !== null; });
        if (b && b.getAttribute('aria-disabled') === 'true') { var ai = q('button.mbtn.wf-reset[aria-label]', function (x) { return x.offsetParent !== null; }); if (ai && !ai.__wfAuto) { ai.__wfAuto = 1; ai.click(); } }
        return b; },
      t: ['Send the orders', 'Envie as ordens'],
      b: ['Each station gets its order.', 'Cada quartel recebe a sua ordem.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('section[aria-labelledby="sendTitle"] button.btn.primary'); },
      ach: ['Crews dispatched. Well done!', 'Equipas enviadas. Muito bem!'], then: ['Now back to the team.', 'Agora de volta à equipa.'],
      t: ['Back to the chat', 'Volte à conversa'],
      b: ['Tap Return once every order is through.', 'Toque em Voltar quando todas as ordens tiverem passado.'] },

    { page: 'Chat.dc.html', mode: 'next', find: chipRow, next: ['Fire page', 'Página do incêndio'],
      go: function () { location.href = 'Dispatch.dc.html'; },
      t: ['The crews are on their way', 'As equipas estão a caminho'],
      b: ['Status cards follow each change. Now a look at the fire page.', 'Os cartões de estado acompanham cada mudança. Agora, a página do incêndio.'] },
    { page: 'Dispatch.dc.html', mode: 'next', find: function () { return q('div[role=tablist].wf-tabs'); },
      t: ['Situation and resources', 'Situação e meios'],
      b: ['Situation shows the figures. Crews shows the stations and units on this fire.', 'Situação mostra os números. Equipas mostra os quartéis e meios neste incêndio.'] },
    { page: 'Dispatch.dc.html', mode: 'next', interact: true, find: function () { return q('[data-wf-kpis] [data-wf-kpicard]'); },
      t: ['Make it yours', 'Adapte à sua maneira'],
      b: ['Press and hold a card, then drag it to reorder.', 'Prima e mantenha um cartão, depois arraste-o para reordenar.'] },
    { page: 'Dispatch.dc.html', mode: 'next', find: function () { return q('[data-wf-kpis] > button[data-round]'); },
      t: ['Choose what to see', 'Escolha o que ver'],
      b: ['Tap + to add or remove cards.', 'Toque em + para adicionar ou retirar cartões.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { var L = document.querySelectorAll('div[role=tablist].wf-tabs button.tabopt'); return L[1] && shown(L[1]) ? L[1] : null; },
      t: ['See the resources', 'Veja os meios'],
      b: ['Tap Crews to see who is on the way.', 'Toque em Equipas para ver quem está a caminho.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('[data-wf-hdr] a[href="Chat.dc.html"]'); },
      t: ['Back to the team', 'De volta à equipa'],
      b: ['Tap to return to the chat.', 'Toque para voltar à conversa.'] },

    { page: 'Chat.dc.html', mode: 'until', until: function () { return !!q('wf-trophy'); }, auto: true,
      find: function () { return q('article.chmsg [data-fitrow] > button.chbtn:not(.wf-sec)', function (b) { return !b.disabled; }) || chipRow(); },
      t: ['Watch the fire move forward', 'Veja o incêndio avançar'],
      b: ['The tour plays the fire owner for you: it approves air support and moves the stages on until the fire is closed. Status cards show each change.',
          'A visita faz de responsável pelo incêndio: aprova o meio aéreo e avança as fases até o incêndio ser encerrado. Os cartões de estado mostram cada mudança.'] },
    { page: 'Chat.dc.html', mode: 'tap', find: function () { return q('wf-trophy'); },
      ach: ['Fire out. Outstanding work!', 'Incêndio extinto. Trabalho notável!'], then: ['Now let\'s see what it took.', 'Agora vamos ver o que foi preciso.'],
      t: ['Fire closed', 'Incêndio encerrado'],
      b: ['Tap to see the summary.', 'Toque para ver o resumo.'] },
    { page: 'Chat.dc.html', mode: 'next', find: function () { return q('header.chview'); }, next: ['Home', 'Início'],
      go: function () { location.href = 'Main.dc.html'; },
      t: ['The fire summary', 'O resumo do incêndio'],
      b: ['Time in each stage, the forces used and the result. Scroll down to see it all.', 'Tempo em cada fase, meios usados e resultado. Deslize para baixo para ver tudo.'] },

    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('header[data-pull="down"] button', function (b) { return !!b.querySelector('path[d^="M6 16.5V11"]'); }); },
      t: ['Notifications', 'Notificações'],
      b: ['New ignitions, requests and status changes.', 'Novas ignições, pedidos e mudanças de estado.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('section[data-swipe-key="nt"]'); }, done: function () { closeIn('section[data-swipe-key="nt"]'); },
      t: ['Every alert in one place', 'Todos os alertas num só sítio'],
      b: ['Tap one to open its incident.', 'Toque num para abrir o incidente.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return hdr('> a[href="Chat.dc.html"]'); },
      t: ['Active chats', 'Conversas ativas'],
      b: ['Every incident chat you are in.', 'Todas as conversas de incidentes em que participa.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { var L = document.querySelectorAll('section[data-swipe-key="cb"] button[role=tab]'); return L[1] && shown(L[1]) === true ? L[1] : null; },
      t: ['Open or resolved', 'Abertas ou resolvidas'],
      b: ['Open chats are under way. Tap Resolved to find the fire you just closed.', 'As abertas estão em curso. Toque em Resolvidas para ver o incêndio que acabou de encerrar.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('section[data-swipe-key="cb"] a.chrow'); }, done: function () { closeIn('section[data-swipe-key="cb"]'); },
      t: ['Your fire, kept', 'O seu incêndio, guardado'],
      b: ['Each resolved chat keeps its history and summary, a benchmark for the next one.', 'Cada conversa resolvida guarda a história e o resumo, uma referência para a próxima.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return hdr('button.avbtn'); },
      t: ['Your settings', 'As suas definições'],
      b: ['Language, theme, text size, chats and data.', 'Idioma, tema, tamanho do texto, conversas e dados.'] },
    { page: 'Main.dc.html', mode: 'tap', before: function () { scrollEnd('[data-wf-fadetop]'); },
      find: function () { return q('[data-wf-fadetop] > div > button[aria-expanded]', function (b) { return !!b.parentElement.querySelector('ul'); }); },
      t: ['Connected data sources', 'Fontes de dados ligadas'],
      b: ['Every source the app reads. Tap to see them.', 'Todas as fontes que a app lê. Toque para as ver.'] },
    { page: 'Main.dc.html', mode: 'next', low: true, next: ['Finish', 'Terminar'], before: function () { setTimeout(function () { scrollEnd('[data-wf-fadetop]'); }, 450); },
      ach: ['Tour complete. You\'re ready!', 'Visita concluída. Está pronto!'], then: ['Now explore on your own.', 'Agora explore por si.'],
      t: ["That's the tour", 'Fim da visita'],
      b: ['Scroll down to see every source and when it last loaded. Thank you for exploring.', 'Deslize para baixo para ver cada fonte e quando foi carregada. Obrigado por explorar.'] }
  ];

  // ---- drawing ----------------------------------------------------------------------------------------------
  var jumped = false, root, bub, ring, svg, cur = -1, seen = 0, scrolled = false, ran = false, lastKey = '';
  function css() {
    if (document.getElementById('wf-tour-css')) return;
    var st = document.createElement('style'); st.id = 'wf-tour-css';
    st.textContent = '#wf-tour{position:fixed;inset:0;z-index:99990;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased}' +
      '#wf-tour .tb{position:absolute;box-sizing:border-box;padding:16px;border-radius:20px;background:rgba(28,28,30,0.72);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;pointer-events:auto;opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1)}' +
      '#wf-tour .tb.on{opacity:1;transform:none}' +
      '#wf-tour .ta{display:inline-flex;align-items:center;gap:6px;max-width:100%;box-sizing:border-box;margin:0 0 4px;padding:6px 12px;border-radius:999px;background:rgba(var(--wf-y-rgb,229,255,0),0.2);box-shadow:inset 0 0 0 1px rgba(var(--wf-y-rgb,229,255,0),0.55);color:var(--wf-y,#E5FF00);font-size:15px;font-weight:600;line-height:20px;animation:wfach .6s cubic-bezier(.3,1.5,.5,1) both}' +
      '@keyframes wfach{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:none}}' +
      '#wf-tour .tth{margin:0 0 16px;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86)}' +
      '#wf-tour .tt{margin:0;font-size:17px;font-weight:600;line-height:22px}' +
      '#wf-tour .tx{margin:4px 0 0;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86);text-wrap:pretty}' +
      '#wf-tour .tf{display:flex;align-items:center;gap:8px;margin-top:16px}' +
      '#wf-tour .tn{flex-grow:1;font-size:13px;line-height:18px;color:rgba(255,255,255,0.6);font-variant-numeric:tabular-nums}' +
      '#wf-tour button{height:40px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '#wf-tour .te{background:rgba(255,255,255,0.14);color:#FFFFFF}' +
      '#wf-tour .tg{background:var(--wf-y,#E5FF00);color:#1C1C1E}' +
      '#wf-tour .tr{position:absolute;box-sizing:border-box;border:2px solid var(--wf-y,#E5FF00);box-shadow:0 0 0 2px rgba(28,28,30,0.55);pointer-events:none;animation:wftp 1.6s ease-in-out infinite}' +
      '@keyframes wftp{0%,100%{opacity:1}50%{opacity:.45}}' +
      '#wf-tour .tgl{position:absolute;top:10%;height:80%;width:18px;-webkit-mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);animation:wftg 3.6s ease-in-out infinite}' +
      '#wf-tour .tgl.l{left:0;background:linear-gradient(90deg,rgba(var(--wf-y-rgb,229,255,0),0.65) 0,rgba(var(--wf-y-rgb,229,255,0),0.65) 1.5px,rgba(var(--wf-y-rgb,229,255,0),0.38) 2.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '#wf-tour .tgl.r{right:0;background:linear-gradient(270deg,rgba(var(--wf-y-rgb,229,255,0),0.65) 0,rgba(var(--wf-y-rgb,229,255,0),0.65) 1.5px,rgba(var(--wf-y-rgb,229,255,0),0.38) 2.5px,rgba(var(--wf-y-rgb,229,255,0),0) 100%)}' +
      '@keyframes wftg{0%,100%{opacity:1}50%{opacity:.4}}' +
      '#wf-tour .tc{width:40px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.14);color:#FFFFFF}#wf-tour .tc.tg{background:var(--wf-y,#E5FF00);color:#1C1C1E}#wf-tour .tc[disabled]{opacity:.3;cursor:default}' +
      '#wf-tour svg.tsv{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      '#wf-tour .ar{stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:wfta .55s cubic-bezier(.4,0,.2,1) .15s forwards}' +
      '@keyframes wfta{to{stroke-dashoffset:0}}';
    document.head.appendChild(st);
  }
  function build() {
    if (root && root.isConnected) return; css();
    root = document.createElement('div'); root.id = 'wf-tour'; root.setAttribute('translate', 'no');
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'tsv');
    ring = document.createElement('div'); ring.className = 'tr';
    bub = document.createElement('div'); bub.className = 'tb'; bub.setAttribute('role', 'dialog'); bub.setAttribute('aria-live', 'polite');
    ['l', 'r'].forEach(function (k) { var g = document.createElement('div'); g.className = 'tgl ' + k; root.appendChild(g); });   // tour mode: a soft lime glow along both sides of the screen
    root.appendChild(svg); root.appendChild(ring); root.appendChild(bub); document.body.appendChild(root);
  }
  function end() { put(null); if (root) root.remove(); root = null; cur = -1; }
  function go(i) {
    var s = get(); if (!s) return;
    var st = S[s.i]; if (st && st.done) try { st.done(); } catch (e) {}
    if (i >= S.length) { end(); return; }
    put({ i: i, max: Math.max(i, s.max || 0) }); seen = 0; scrolled = false; ran = false; armed = -1;
  }
  function back(i) { if (i < 1) return; var s0 = get() || {}; var p = i - 1; put({ i: p, b: 1, max: Math.max(i, s0.max || 0) }); seen = Date.now(); scrolled = false; ran = false; cur = -1; lastKey = ''; if (S[p].page !== PAGE) { try { history.back(); } catch (e) { location.href = S[p].page; } } else tick(); }
  // The entry warning: a dark-glass tooltip just above the Tour button (the tour is still being tuned)
  function warn(anchor) {
    var old = document.getElementById('wf-tourwarn'); if (old) { old.remove(); return; }
    css(); var pt = PT(), w = document.createElement('div'); w.id = 'wf-tourwarn'; w.setAttribute('role', 'dialog'); w.setAttribute('translate', 'no');
    var r = anchor ? anchor.getBoundingClientRect() : { top: innerHeight - 140, left: innerWidth - 80, width: 60 };
    w.style.cssText = 'position:fixed;left:16px;right:16px;bottom:' + Math.max(16, innerHeight - r.top + 12) + 'px;z-index:99995;padding:16px;border-radius:20px;background:rgba(28,28,30,0.94);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 8px 32px rgba(0,0,0,0.28),inset 0 0 0 0.5px rgba(255,255,255,0.18);color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",system-ui,sans-serif;-webkit-font-smoothing:antialiased';
    w.innerHTML = '<p style="margin:0;font-size:17px;font-weight:600;line-height:22px">⚠️ ' + (pt ? 'Visita em construção' : 'Tour under construction') + '</p>' +
      '<p style="margin:4px 0 0;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86);text-wrap:pretty">' + (pt ? 'Estamos a trabalhar nela e ainda tem muitas falhas. Terminar visita está sempre à mão para sair.' : 'We\'re still working on it and it has lots of bugs. End tour is always there to get you out.') + '</p>' +
      '<div style="display:flex;gap:8px;margin-top:16px"><button type="button" data-a="no" style="flex:1 1 0;height:40px;border:0;border-radius:999px;background:rgba(255,255,255,0.14);color:#FFFFFF;font:inherit;font-size:15px;font-weight:600;cursor:pointer">' + (pt ? 'Agora não' : 'Not now') + '</button>' +
      '<button type="button" data-a="go" style="flex:1 1 0;height:40px;border:0;border-radius:999px;background:var(--wf-y,#E5FF00);color:#1C1C1E;font:inherit;font-size:15px;font-weight:600;cursor:pointer">' + (pt ? 'Começar visita' : 'Start tour') + '</button></div>' +
      '<span aria-hidden="true" style="position:absolute;bottom:-7px;right:' + Math.max(24, innerWidth - (r.left + r.width / 2) - 8) + 'px;width:14px;height:14px;background:rgba(28,28,30,0.94);transform:rotate(45deg);border-radius:0 0 3px 0"></span>';
    w.querySelector('[data-a=no]').onclick = function () { w.remove(); };
    w.querySelector('[data-a=go]').onclick = function () { w.remove(); window.__wfTour.start(); };
    document.body.appendChild(w);
    var off = function (e) { if (!w.isConnected) { document.removeEventListener('pointerdown', off, true); return; } if (!w.contains(e.target) && !(anchor && anchor.contains(e.target))) { w.remove(); document.removeEventListener('pointerdown', off, true); } };
    setTimeout(function () { document.addEventListener('pointerdown', off, true); }, 0);
  }
  window.__wfTour = { warn: warn, start: function () { put({ i: 0 }); seen = 0; scrolled = false; ran = false; tick(); }, end: end, active: function () { return !!get(); } };

  // a hand-drawn arrow: a gently bent stroke with a slight wobble, and an open head, on a white halo
  function arrow(x1, y1, x2, y2, seed) {
    var rnd = function (k) { var v = Math.sin(seed * 9.13 + k * 3.7) * 43758.5453; return v - Math.floor(v); };
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, bend = (rnd(1) > .5 ? 1 : -1) * Math.min(36, len * 0.28);
    var c1x = x1 + dx * 0.25 + nx * bend + (rnd(2) - .5) * 4, c1y = y1 + dy * 0.25 + ny * bend + (rnd(3) - .5) * 4;
    var c2x = x1 + dx * 0.7 + nx * bend * 0.55, c2y = y1 + dy * 0.7 + ny * bend * 0.55;
    var d = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    var a = Math.atan2(y2 - c2y, x2 - c2x), h = 13, w = 0.5;
    var hd = 'M' + (x2 - h * Math.cos(a - w)).toFixed(1) + ' ' + (y2 - h * Math.sin(a - w)).toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + (x2 - h * Math.cos(a + w + 0.08)).toFixed(1) + ' ' + (y2 - h * Math.sin(a + w + 0.08)).toFixed(1);
    var L = Math.round(len * 1.25 + 30);
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + d + '" stroke="rgba(255,255,255,0.92)" stroke-width="7"/><path d="' + hd + '" stroke="rgba(255,255,255,0.92)" stroke-width="7"/>' +
      '<path class="ar" style="--l:' + L + '" d="' + d + '" stroke="#1C1C1E" stroke-width="2.6"/><path class="ar" style="--l:40" d="' + hd + '" stroke="#1C1C1E" stroke-width="2.6"/></g>';
  }
  function draw(i, st, el, late, low) {
    build();
    var pt = PT(), L = function (a) { return a ? (pt ? a[1] : a[0]) : ''; }, s0back = !!(get() || {}).b;   // achievements show when reached going forward, not when stepping back
    var key = i + '|' + (armed === i ? 'a' : '') + (el ? 1 : 0) + '|' + (late ? 1 : 0) + '|' + (pt ? 1 : 0);
    if (key !== lastKey) {
      lastKey = key; bub.classList.remove('on');
      var done0 = i < ((get() || {}).max || 0), nx = st.mode === 'next' || late || done0, nl = st.next ? L(st.next) : '';
      var CH = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; };
      var AC = st.ach && !s0back ? '<div class="ta"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg><span></span></div><p class="tth"></p>' : '';
      bub.innerHTML = AC + '<p class="tt"></p><p class="tx"></p><div class="tf"><span class="tn"></span><button type="button" class="te"></button>' +
        '<button type="button" class="tc tb0"' + (i ? '' : ' disabled') + '>' + CH('m15 6-6 6 6 6') + '</button>' +
        (nl && nx ? '<button type="button" class="tg"></button>' : '<button type="button" class="tc' + (nx ? ' tg' : '') + '"' + (nx ? '' : ' disabled') + '>' + CH('m9 6 6 6-6 6') + '</button>') + '</div>';
      var bb = bub.querySelector('.tb0'); bb.setAttribute('aria-label', pt ? 'Passo anterior' : 'Previous step'); bb.onclick = function (ev) { ev.stopPropagation(); back(i); };
      if (AC) { bub.querySelector('.ta span').textContent = L(st.ach); bub.querySelector('.tth').textContent = L(st.then); try { if (navigator.vibrate) navigator.vibrate([10, 60, 14]); } catch (e) {} }
      bub.querySelector('.tt').textContent = L(st.t);
      if (st.show && armed === i) bub.querySelector('.tt').textContent = L(st.show.t);
      if (st.legend && armed === i) { bub.querySelector('.tt').textContent = pt ? 'Camada visível' : 'Layer shown'; }
      bub.querySelector('.tx').textContent = late && !el ? (pt ? 'Este passo não está disponível agora. Toque em › para continuar.' : 'This step isn\'t available right now. Tap › to carry on.') : L(st.b);
      if (st.show && armed === i) bub.querySelector('.tx').textContent = L(st.show.b);
      if (st.legend && armed === i) bub.querySelector('.tx').textContent = pt ? 'Agora voltamos a escondê-la e seguimos, só com as ignições no mapa.' : 'Now we hide it again and move on, with only ignitions on the map.';
      bub.querySelector('.tn').textContent = (i + 1) + (pt ? ' de ' : ' of ') + S.length;
      var e = bub.querySelector('.te'); e.textContent = pt ? 'Terminar visita' : 'End tour'; e.onclick = function (ev) { ev.stopPropagation(); end(); };
      var g = bub.querySelector('.tg'); if (g) { if (nl) g.textContent = nl; else g.setAttribute('aria-label', pt ? 'Seguinte' : 'Next'); g.onclick = function (ev) { ev.stopPropagation(); var s0 = S[i], nxS = S[i + 1]; go(i + 1); if (s0.go && !(done0 && s0.mode !== 'next')) s0.go(); else if (nxS && nxS.page !== PAGE) { var at = location.href; try { history.forward(); } catch (x) {} setTimeout(function () { if (location.href === at) location.href = nxS.page; }, 500); } else tick(); }; }
      requestAnimationFrame(function () { if (bub) bub.classList.add('on'); });
      svg.innerHTML = '';
      svg.__k = '';
    }
    var vw = VW(), vh = VH(), bw = Math.min(320, vw - 32), bh;
    bub.style.width = bw + 'px'; bh = bub.offsetHeight;
    if (low && el && !st.find) el = null;
    if (!el) { ring.style.display = 'none'; svg.innerHTML = ''; svg.__k = ''; bub.style.left = ((vw - bw) / 2) + 'px'; bub.style.top = (low ? vh - bh - 40 : Math.max(16, (vh - bh) / 2)) + 'px'; return; }
    var r = el.getBoundingClientRect(), big = r.height > vh * 0.45 || r.width > vw * 0.96 && r.height > 160;
    var pad = 6, T = { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
    if (big) { ring.style.display = 'none'; svg.innerHTML = ''; bub.style.left = ((vw - bw) / 2) + 'px'; bub.style.top = (vh - bh - 40) + 'px'; return; }
    var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
    ring.style.display = 'block'; var RL = Math.max(3, T.l), RR = Math.min(vw - 3, T.r); ring.style.left = RL + 'px'; ring.style.top = T.t + 'px'; ring.style.width = (RR - RL) + 'px'; ring.style.height = (T.b - T.t) + 'px'; ring.style.borderRadius = Math.min(999, rad + pad) + 'px';
    var gap = 76, below = vh - T.b - 32, above = T.t - 16, up;
    if (below >= bh + gap) up = false; else if (above >= bh + gap) up = true; else up = above > below;
    var cx = (T.l + T.r) / 2, left = Math.min(vw - 16 - bw, Math.max(16, cx - bw / 2));
    var top = up ? Math.max(16, T.t - gap - bh) : Math.min(vh - 32 - bh, T.b + gap);
    // never cover the target or an open map tooltip: try the other side, then the top or bottom of the screen
    var OB = [T].concat([].slice.call(document.querySelectorAll('[data-wf-pop]')).map(function (p) { var q0 = p.getBoundingClientRect(); return q0.width ? { l: q0.left - 8, t: q0.top - 8, r: q0.right + 8, b: q0.bottom + 8 } : null; }).filter(Boolean));
    var hits = function (y) { return OB.some(function (o) { return left < o.r && left + bw > o.l && y < o.b && y + bh > o.t; }); };
    if (hits(top)) { var alts = [up ? Math.min(vh - 32 - bh, T.b + gap) : Math.max(16, T.t - gap - bh), vh - 32 - bh, 16], f = alts.find(function (y) { return !hits(y); }); if (f != null) { up = f + bh / 2 < (T.t + T.b) / 2; top = f; } }
    bub.style.left = left + 'px'; bub.style.top = top + 'px';
    var sx = Math.min(left + bw - 36, Math.max(left + 36, cx + (cx < vw / 2 ? 24 : -24))), sy = up ? top + bh + 8 : top - 8;
    var ex = cx, ey = up ? T.t - 8 : T.b + 8;
    if (Math.abs(ey - sy) < 24) { svg.innerHTML = ''; svg.__k = ''; return; }
    var k = [sx, sy, ex, ey].map(function (v) { return Math.round(v); }).join(',');
    if (svg.__k !== k) { var fresh = !svg.__k; svg.__k = k; svg.innerHTML = arrow(sx, sy, ex, ey, i + 1); if (!fresh) [].forEach.call(svg.querySelectorAll('.ar'), function (p) { p.style.animation = 'none'; p.style.strokeDashoffset = '0'; }); }
  }

  // ---- the loop ---------------------------------------------------------------------------------------------
  function tick() {
    var s = get(); if (!s) { if (root) end(); return; }
    var i = s.i, st = S[i]; if (!st) { end(); return; }
    if (st.page !== PAGE) {
      // Reached the next screen another way (e.g. View on the map instead of the list): carry on from that screen's
      // first step. Only once per page load, and only to the very next screen of the tour, never further ahead.
      if (!jumped) { jumped = true; var k = i + 1; while (k < S.length && S[k].page === st.page) k++; if (S[k] && S[k].page === PAGE) { put({ i: k }); seen = 0; scrolled = false; ran = false; return tick(); } }
      if (root) { root.remove(); root = null; lastKey = ''; } return;
    }
    jumped = true;
    if (i !== cur) { cur = i; seen = Date.now(); scrolled = false; ran = false; lastKey = ''; }
    if (!ran && st.before) { ran = true; try { st.before(); } catch (e) {} }
    // the area picker belongs to the region step only: anywhere else it is closed, so the step's control is in view
    if (PAGE === 'Main.dc.html' && !st.area && areaOpen()) { areaClose(); return; }
    if (st.skip && st.skip()) { go(i + 1); return; }
    if (st.closeAfter && armed === i && !areaOpen()) { go(i + 1); return; }   // the area list was opened and is closed again
    if (st.mode === 'until' && st.until && st.until()) { go(i + 1); return; }
    if (st.auto && Date.now() - (window.__wfTourAuto || 0) > 2600 && Date.now() - seen > 2200) { window.__wfTourAuto = Date.now(); drive(); }
    if (st.show && armed === i) { curEl = null; draw(i, st, null, false, true); return; }
    var el = st.lock && lockEl && lockEl.isConnected && lockI === i ? lockEl : (st.find ? st.find() : null); if (st.lock && el) { lockEl = el; lockI = i; }
    var sh0 = el && shown(el, st.strict); if (el && (sh0 === 'off' || sh0 === 'part') && !scrolled) { scrolled = true; try { var rr = el.getBoundingClientRect(), vOut = rr.bottom > VH() - 24 || rr.top < 24, hOut = rr.left < 0 || rr.right > VW(); el.scrollIntoView({ block: vOut ? 'center' : 'nearest', inline: hOut ? 'center' : 'nearest', behavior: 'smooth' }); } catch (e) {} }
    if (el) { var sh1 = shown(el, st.strict); if (sh1 !== true && !(sh1 === 'part' && scrolled)) el = null; }
    var late = st.find && !el && Date.now() - seen > (st.mode === 'until' && !s.b ? 1e9 : s.b ? 1500 : 9000);
    if (st.find && !el && !late) { curEl = null; draw(i, st, null, false, true); return; }   // still waiting for its control: the bubble stays, End tour always reachable
    curEl = el; draw(i, st, el, late, st.low); window.__wfTour.el = el; window.__wfTour.i = i;
  }
  // Plays the fire owner in the chat: taps the request card's main button, else the suggestion that moves the fire on
  var selfTap = false, lockEl = null, lockI = -1, armed = -1;
  function drive() {
    var b = q('article.chmsg [data-fitrow] > button.chbtn:not(.wf-sec)', function (x) { return !x.disabled; });
    if (!b) { var W = ['Move to', 'Passar a', 'Air support', 'Meio aéreo', 'Close fire', 'Encerrar incêndio'];
      b = q('button.chbtn', function (x) { if (!x.parentElement || x.parentElement.style.maxHeight !== '88px') return false; var t = txt(x); return W.some(function (w) { return t.indexOf(w) === 0; }); }); }
    if (b) { selfTap = true; try { b.click(); } catch (e) {} selfTap = false; }
  }
  // Tour mode is modal: only the bubble and the control it points at take touches (scrolling still works).
  var curEl = null;
  function allowed(e) {
    if (selfTap || !get() || !root || !root.isConnected) return true;
    if (e.target && e.target.closest && e.target.closest('#wf-tourwarn')) return true;
    var s0 = get(), st0 = s0 && S[s0.i]; if (st0 && st0.page === PAGE && st0.find && !curEl && !(st0.show && armed === s0.i)) return true;   // nothing to point at yet: never lock the screen
    if (e.target && e.target.closest && e.target.closest('#wf-tour')) return true;
    // iPhone: the app lays an invisible haptic layer (#wf-hapov) over the touched control and passes the tap on to it;
    // judge the tap by the control underneath
    var hv = e.target && e.target.closest && e.target.closest('#wf-hapov');
    if (hv && hv.__t) { if (hv.__t.closest && hv.__t.closest('#wf-tour')) return true; e = { target: hv.__t, clientX: e.clientX, clientY: e.clientY, changedTouches: e.changedTouches }; }
    // the control is looked up again at the moment of the touch: maps and lists redraw their items while touched
    var s = get(), st = s && S[s.i], el = st && st.page === PAGE ? (st.lock && lockEl && lockEl.isConnected ? lockEl : st.find ? st.find() : null) : null; if (!el && curEl && curEl.isConnected) el = curEl;
    if (st && st.also && e.target && e.target.closest && e.target.closest(st.also)) return true;   // e.g. View on the map summary
    if (!el) return false;
    if (st && st.mode === 'next' && !st.interact) return false;
    if (el === e.target || el.contains(e.target)) return true;
    var p = e.changedTouches && e.changedTouches[0] || e, r = el.getBoundingClientRect();
    return p.clientX >= r.left - 4 && p.clientX <= r.right + 4 && p.clientY >= r.top - 4 && p.clientY <= r.bottom + 4;
  }
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click', 'contextmenu'].forEach(function (t) {
    window.addEventListener(t, function (e) { if (allowed(e)) return; e.stopPropagation(); e.stopImmediatePropagation(); if (t === 'click' || t === 'contextmenu') e.preventDefault(); }, { capture: true, passive: false });
  });
  // a tap on the control a 'tap' step points at moves the tour on (the tap itself still does its job)
  document.addEventListener('click', function (e) {
    var s = get(); if (!s) return; var st = S[s.i]; if (!st || st.mode !== 'tap' || st.page !== PAGE || !st.find || armed === s.i) return;
    var el = st.lock && lockEl && lockEl.isConnected ? lockEl : st.find(); if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;   // a tap on a control that is still disabled doesn't count
    // the tap is on the control, or lands inside its area (some map bands pass taps through to the control underneath)
    var r = el.getBoundingClientRect(), inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && (e.clientX || e.clientY);
    if (el === e.target || el.contains(e.target) || inside) { if (st.closeAfter) { armed = s.i; return; }
      if (st.show) { armed = s.i; var at2 = s.i, sh = st.show; setTimeout(function () { var s3 = get(); if (!s3 || s3.i !== at2) return; selfTap = true; try { sh.close(); } catch (x) {} selfTap = false; go(at2 + 1); tick(); }, sh.ms); return; }
      if (st.legend) { armed = s.i; var at = s.i, chipEl = el.closest ? el : el; setTimeout(function () { var s2 = get(); if (!s2 || s2.i !== at) return; var on = q('[data-wf-leg] button[aria-pressed="true"]', function (b) { return b.getAttribute('aria-label') === chipEl.getAttribute('aria-label') || b === chipEl; }) || chipEl; selfTap = true; try { (chipEl.isConnected ? chipEl : on).click(); } catch (x) {} selfTap = false; go(at + 1); tick(); }, 2400); return; } go(s.i + 1); setTimeout(tick, 60); }
  }, true);
  var last = 0, loop = function (t) { if (t - last > 80) { last = t; try { if (get()) tick(); } catch (e) {} } requestAnimationFrame(loop); };
  var boot = function () { requestAnimationFrame(loop); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('pageshow', function () { lastKey = ''; cur = -1; });
})();
