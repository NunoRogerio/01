// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Quick tour: translucent bubbles that say what to do next, each with a hand-drawn arrow to the control to tap.
// It follows one demo ignition from the main screen to a closed fire, then notifications, chats and settings.
// The step is kept in sessionStorage ('wf-tour'), so the tour carries on across screens. Every bubble has End tour.
// Steps either wait for a tap on the control they point at ('tap'), offer a Next button ('next'), or wait until
// something has happened on screen ('until'). A step whose control can't be found after a while shows Next instead.
(function () {
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
    if (r.bottom > VH() - 24 || r.top < 24) return 'part';   // partly cut off at an edge: scrolled fully into view   // there, but scrolled away: the tour scrolls it into view
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
  var closeIn = function (sec) { var s = document.querySelector(sec); if (!s) return; var b = [].slice.call(s.querySelectorAll('button')).find(function (x) { return x.querySelector('path[d^="M6 6"]'); }); if (b) b.click(); };
  var scrollEnd = function (sel) { var e = document.querySelector(sel); if (e) e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' }); };

  // ---- the steps --------------------------------------------------------------------------------------------
  // t: the action (title); b: one or two short sentences; mode: 'tap' | 'next' | 'until'
  var S = [
    { page: 'Main.dc.html', mode: 'next', next: ['Start', 'Começar'],
      t: ['Quick tour', 'Visita rápida'],
      b: ['Follow one ignition from detection to a closed fire. Tap what the arrow points to; some steps only need Next.',
          'Acompanhe uma ignição desde a deteção até ao incêndio encerrado. Toque no que a seta indica; alguns passos só pedem Seguinte.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return hdr('> button.opt[aria-expanded]'); },
      t: ['Choose a region', 'Escolha uma região'],
      b: ['Tap the area name to switch country, state or district.', 'Toque no nome da área para mudar de país, estado ou distrito.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('[data-wf-leg]'); },
      t: ['Choose what the map shows', 'Escolha o que o mapa mostra'],
      b: ['Tap a chip to show or hide ignition candidates, active fires, resolved fires and fire stations.',
          'Toque numa etiqueta para mostrar ou esconder candidatos a ignição, incêndios ativos, resolvidos e quartéis.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('[data-wf-maproot] button.tipwrap'); },
      t: ['Pick an incident on the map', 'Escolha um incidente no mapa'],
      b: ['Tap any circle for a short summary, then View.', 'Toque num círculo para um resumo, depois em Ver.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('section[data-swipe-key="li"] > div:last-child > button.opt'); },
      skip: function () { return shown(q('section[data-swipe-key="li"] a.sqrow', null, true), true) === true; },
      t: ['…or from the list', '…ou na lista'],
      b: ['Tap here to open every candidate and fire in this region.', 'Toque aqui para abrir todos os candidatos e incêndios desta região.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('section[data-swipe-key="li"] a.sqrow[href="Alert.dc.html"]', null, true); }, strict: true,
      t: ['Open the demo ignition', 'Abra a ignição de demonstração'],
      b: ['We chose the most likely candidate for this tour. Tap it.', 'Escolhemos o candidato mais provável para esta visita. Toque nele.'] },

    { page: 'Alert.dc.html', mode: 'next', find: function () { return q('[data-wf-ighdr]'); },
      t: ['The ignition candidate', 'O candidato a ignição'],
      b: ['Likelihood, place and detection time come first, so you can decide fast.', 'Probabilidade, local e hora da deteção primeiro, para decidir depressa.'] },
    { page: 'Alert.dc.html', mode: 'next', find: function () { return q('button.qtag'); },
      t: ['Confirm or dismiss here', 'Confirme ou descarte aqui'],
      b: ['This tag confirms the fire. In this tour we confirm it with the team, in the chat.', 'Esta etiqueta confirma o incêndio. Nesta visita confirmamos com a equipa, na conversa.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M14 4h6v6'); },
      t: ['See the map full screen', 'Veja o mapa em ecrã inteiro'],
      b: ['Tap to open the map full screen.', 'Toque para abrir o mapa em ecrã inteiro.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M4 14h6v6'); },
      t: ['Back to the page', 'Voltar à página'],
      b: ['Pan and zoom freely. Then tap here to return.', 'Mova e aproxime à vontade. Depois toque aqui para voltar.'] },
    { page: 'Alert.dc.html', mode: 'tap', find: function () { return pathBtn('M2.5 6h6M15.5 6h6'); },
      t: ['Send a drone', 'Envie um drone'],
      b: ['Its live feed replaces the map, to check the smoke from above.', 'A imagem em direto substitui o mapa, para ver o fumo de cima.'] },
    { page: 'Alert.dc.html', mode: 'next', find: function () { return q('div[role=tablist].wf-seg'); },
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
      t: ['Assign resources', 'Atribua meios'],
      b: ['Choose which stations send crews.', 'Escolha que quartéis enviam equipas.'] },

    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('button.mbtn.wf-reset', function (b) { return !b.hasAttribute('aria-disabled'); }); },
      t: ['Use the suggested resources', 'Use os meios sugeridos'],
      b: ['One tap fills the plan. Add resources lets you choose stations yourself.', 'Um toque preenche o plano. Adicionar meios deixa escolher os quartéis.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('button.btn.primary', function (b) { return !b.closest('section[role=dialog]'); }); },
      t: ['Send the orders', 'Envie as ordens'],
      b: ['Each station gets its order.', 'Cada quartel recebe a sua ordem.'] },
    { page: 'Dispatch.dc.html', mode: 'tap', find: function () { return q('section[aria-labelledby="sendTitle"] button.btn.primary'); },
      t: ['Back to the chat', 'Volte à conversa'],
      b: ['Tap Return once every order is through.', 'Toque em Voltar quando todas as ordens tiverem passado.'] },

    { page: 'Chat.dc.html', mode: 'next', find: chipRow, next: ['Fire page', 'Página do incêndio'],
      go: function () { location.href = 'Dispatch.dc.html'; },
      t: ['The crews are on their way', 'As equipas estão a caminho'],
      b: ['Status cards follow each change. Now a look at the fire page.', 'Os cartões de estado acompanham cada mudança. Agora, a página do incêndio.'] },
    { page: 'Dispatch.dc.html', mode: 'next', find: function () { return q('div[role=tablist].wf-tabs'); },
      t: ['Situation and resources', 'Situação e meios'],
      b: ['Situation shows the figures. Crews shows the stations and units on this fire.', 'Situação mostra os números. Equipas mostra os quartéis e meios neste incêndio.'] },
    { page: 'Dispatch.dc.html', mode: 'next', find: function () { return q('[data-wf-kpis] [data-wf-kpicard]'); },
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

    { page: 'Chat.dc.html', mode: 'until', until: function () { return !!q('wf-trophy'); },
      find: function () { return q('article.chmsg [data-fitrow] > button.chbtn:not(.wf-sec)') || chipRow(); },
      t: ['Move the fire forward', 'Faça o incêndio avançar'],
      b: ['Tap the suggested replies, approve air support when asked, and close the fire. Some steps take a few seconds.',
          'Toque nas respostas sugeridas, aprove o meio aéreo quando pedido e encerre o incêndio. Alguns passos demoram uns segundos.'] },
    { page: 'Chat.dc.html', mode: 'tap', find: function () { return q('wf-trophy'); },
      t: ['Fire closed', 'Incêndio encerrado'],
      b: ['Tap to see the summary.', 'Toque para ver o resumo.'] },
    { page: 'Chat.dc.html', mode: 'next', find: function () { return q('header.chview'); }, next: ['Home', 'Início'],
      go: function () { location.href = 'Main.dc.html'; },
      t: ['The fire summary', 'O resumo do incêndio'],
      b: ['Time in each stage, the forces used and the result. Scroll down to see it all.', 'Tempo em cada fase, meios usados e resultado. Deslize para baixo para ver tudo.'] },

    { page: 'Main.dc.html', mode: 'tap', find: function () { return q('header[data-pull="down"] button.opt[aria-haspopup="dialog"]', function (b) { return !b.classList.contains('avbtn') && !b.querySelector('.wf-title-m'); }); },
      t: ['Notifications', 'Notificações'],
      b: ['New ignitions, requests and status changes.', 'Novas ignições, pedidos e mudanças de estado.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('section[data-swipe-key="nt"]'); }, done: function () { closeIn('section[data-swipe-key="nt"]'); },
      t: ['Every alert in one place', 'Todos os alertas num só sítio'],
      b: ['Tap one to open its incident.', 'Toque num para abrir o incidente.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return hdr('> a[href="Chat.dc.html"]'); },
      t: ['Active chats', 'Conversas ativas'],
      b: ['Every incident chat you are in.', 'Todas as conversas de incidentes em que participa.'] },
    { page: 'Main.dc.html', mode: 'next', find: function () { return q('section[data-swipe-key="cb"]'); }, done: function () { closeIn('section[data-swipe-key="cb"]'); },
      t: ['Pick up where you left off', 'Retome onde ficou'],
      b: ['Open any chat to carry on.', 'Abra qualquer conversa para continuar.'] },
    { page: 'Main.dc.html', mode: 'tap', find: function () { return hdr('button.avbtn'); },
      t: ['Your settings', 'As suas definições'],
      b: ['Language, theme, text size, chats and data.', 'Idioma, tema, tamanho do texto, conversas e dados.'] },
    { page: 'Main.dc.html', mode: 'tap', before: function () { scrollEnd('[data-wf-fadetop]'); },
      find: function () { return q('[data-wf-fadetop] > div > button[aria-expanded]', function (b) { return !!b.parentElement.querySelector('ul'); }); },
      t: ['Connected data sources', 'Fontes de dados ligadas'],
      b: ['Every source the app reads. Tap to see them.', 'Todas as fontes que a app lê. Toque para as ver.'] },
    { page: 'Main.dc.html', mode: 'next', next: ['Finish', 'Terminar'], before: function () { setTimeout(function () { scrollEnd('[data-wf-fadetop]'); }, 450); },
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
      '#wf-tour .tt{margin:0;font-size:17px;font-weight:600;line-height:22px}' +
      '#wf-tour .tx{margin:4px 0 0;font-size:15px;line-height:20px;color:rgba(255,255,255,0.86);text-wrap:pretty}' +
      '#wf-tour .tf{display:flex;align-items:center;gap:8px;margin-top:16px}' +
      '#wf-tour .tn{flex-grow:1;font-size:13px;line-height:18px;color:rgba(255,255,255,0.6);font-variant-numeric:tabular-nums}' +
      '#wf-tour button{height:40px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '#wf-tour .te{background:rgba(255,255,255,0.14);color:#FFFFFF}' +
      '#wf-tour .tg{background:var(--wf-y,#E5FF00);color:#1C1C1E}' +
      '#wf-tour .tr{position:absolute;box-sizing:border-box;border:2px solid var(--wf-y,#E5FF00);box-shadow:0 0 0 2px rgba(28,28,30,0.55);pointer-events:none;animation:wftp 1.6s ease-in-out infinite}' +
      '@keyframes wftp{0%,100%{opacity:1}50%{opacity:.45}}' +
      '#wf-tour svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      '#wf-tour .ar{stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:wfta .55s cubic-bezier(.4,0,.2,1) .15s forwards}' +
      '@keyframes wfta{to{stroke-dashoffset:0}}';
    document.head.appendChild(st);
  }
  function build() {
    if (root && root.isConnected) return; css();
    root = document.createElement('div'); root.id = 'wf-tour'; root.setAttribute('translate', 'no');
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring = document.createElement('div'); ring.className = 'tr';
    bub = document.createElement('div'); bub.className = 'tb'; bub.setAttribute('role', 'dialog'); bub.setAttribute('aria-live', 'polite');
    root.appendChild(svg); root.appendChild(ring); root.appendChild(bub); document.body.appendChild(root);
  }
  function end() { put(null); if (root) root.remove(); root = null; cur = -1; }
  function go(i) {
    var s = get(); if (!s) return;
    var st = S[s.i]; if (st && st.done) try { st.done(); } catch (e) {}
    if (i >= S.length) { end(); return; }
    put({ i: i }); seen = 0; scrolled = false; ran = false;
  }
  window.__wfTour = { start: function () { put({ i: 0 }); seen = 0; scrolled = false; ran = false; tick(); }, end: end, active: function () { return !!get(); } };

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
  function draw(i, st, el, late) {
    build();
    var pt = PT(), L = function (a) { return a ? (pt ? a[1] : a[0]) : ''; };
    var key = i + '|' + (el ? 1 : 0) + '|' + (late ? 1 : 0) + '|' + (pt ? 1 : 0);
    if (key !== lastKey) {
      lastKey = key; bub.classList.remove('on');
      var nx = st.mode === 'next' || late, nl = st.next ? L(st.next) : (pt ? 'Seguinte' : 'Next');
      bub.innerHTML = '<p class="tt"></p><p class="tx"></p><div class="tf"><span class="tn"></span><button type="button" class="te"></button>' + (nx ? '<button type="button" class="tg"></button>' : '') + '</div>';
      bub.querySelector('.tt').textContent = L(st.t);
      bub.querySelector('.tx').textContent = late && !el ? (pt ? 'Este passo não está disponível neste ecrã. Toque em Seguinte para continuar.' : 'This step isn\'t available on this screen. Tap Next to carry on.') : L(st.b);
      bub.querySelector('.tn').textContent = (i + 1) + (pt ? ' de ' : ' of ') + S.length;
      var e = bub.querySelector('.te'); e.textContent = pt ? 'Terminar visita' : 'End tour'; e.onclick = function (ev) { ev.stopPropagation(); end(); };
      var g = bub.querySelector('.tg'); if (g) { g.textContent = nl; g.onclick = function (ev) { ev.stopPropagation(); var s0 = S[i]; go(i + 1); if (s0.go) s0.go(); else tick(); }; }
      requestAnimationFrame(function () { if (bub) bub.classList.add('on'); });
      svg.innerHTML = '';
      svg.__k = '';
    }
    var vw = VW(), vh = VH(), bw = Math.min(320, vw - 32), bh;
    bub.style.width = bw + 'px'; bh = bub.offsetHeight;
    if (!el) { ring.style.display = 'none'; svg.innerHTML = ''; bub.style.left = ((vw - bw) / 2) + 'px'; bub.style.top = Math.max(16, (vh - bh) / 2) + 'px'; return; }
    var r = el.getBoundingClientRect(), big = r.height > vh * 0.45 || r.width > vw * 0.96 && r.height > 160;
    var pad = 6, T = { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
    if (big) { ring.style.display = 'none'; svg.innerHTML = ''; bub.style.left = ((vw - bw) / 2) + 'px'; bub.style.top = (vh - bh - 40) + 'px'; return; }
    var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
    ring.style.display = 'block'; ring.style.left = T.l + 'px'; ring.style.top = T.t + 'px'; ring.style.width = (T.r - T.l) + 'px'; ring.style.height = (T.b - T.t) + 'px'; ring.style.borderRadius = Math.min(999, rad + pad) + 'px';
    var gap = 76, below = vh - T.b - 32, above = T.t - 16, up;
    if (below >= bh + gap) up = false; else if (above >= bh + gap) up = true; else up = above > below;
    var cx = (T.l + T.r) / 2, left = Math.min(vw - 16 - bw, Math.max(16, cx - bw / 2));
    var top = up ? Math.max(16, T.t - gap - bh) : Math.min(vh - 32 - bh, T.b + gap);
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
    if (st.skip && st.skip()) { go(i + 1); return; }
    if (st.mode === 'until' && st.until && st.until()) { go(i + 1); return; }
    var el = st.find ? st.find() : null;
    var sh0 = el && shown(el, st.strict); if (el && (sh0 === 'off' || sh0 === 'part') && !scrolled) { scrolled = true; try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
    if (el) { var sh1 = shown(el, st.strict); if (sh1 !== true && !(sh1 === 'part' && scrolled)) el = null; }
    var late = st.find && !el && Date.now() - seen > (st.mode === 'until' ? 1e9 : 9000);
    if (st.find && !el && !late) { if (root) { bub.classList.remove('on'); ring.style.display = 'none'; svg.innerHTML = ''; svg.__k = ''; lastKey = ''; } return; }
    draw(i, st, el, late); window.__wfTour.el = el; window.__wfTour.i = i;
  }
  // a tap on the control a 'tap' step points at moves the tour on (the tap itself still does its job)
  document.addEventListener('click', function (e) {
    var s = get(); if (!s) return; var st = S[s.i]; if (!st || st.mode !== 'tap' || st.page !== PAGE || !st.find) return;
    var el = st.find(); if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;   // a tap on a control that is still disabled doesn't count
    // the tap is on the control, or lands inside its area (some map bands pass taps through to the control underneath)
    var r = el.getBoundingClientRect(), inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && (e.clientX || e.clientY);
    if (el === e.target || el.contains(e.target) || inside) { go(s.i + 1); setTimeout(tick, 60); }
  }, true);
  var last = 0, loop = function (t) { if (t - last > 80) { last = t; try { if (get()) tick(); } catch (e) {} } requestAnimationFrame(loop); };
  var boot = function () { requestAnimationFrame(loop); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('pageshow', function () { lastKey = ''; cur = -1; });
})();
