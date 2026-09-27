// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Language: European Portuguese for the Portugal profile, English for all other profiles.
// It translates the finished screens in place, so every page stays written in one language underneath.
(function(){
  // For now the language follows the profile: Rita Cardoso (Portugal) sees the app in Portuguese; everyone else in English.
  var lang='en';
  // The profile sets the default; the preferences panel can switch a Portuguese profile to English (kept per profile).
  try{var role=localStorage.getItem('wf-role')||'';if(role==='pt'&&localStorage.getItem('wf-lang-'+role)!=='en')lang='pt';}catch(e){}
  window.__wfLang=lang;
  window.__wfSetLang=function(l){try{localStorage.setItem('wf-lang-'+(localStorage.getItem('wf-role')||''),l);}catch(e){}location.reload();};
  if(lang!=='pt')return;
  try{document.documentElement.lang='pt-PT';}catch(e){}

  // ---- exact phrases -----------------------------------------------------------------------------------------
  var X={
    'Forest Fire Watch':'Forest Fire Watch','Log in':'Entrar','Log in to your account':'Entre na sua conta','Username':'Utilizador','Password':'Palavra-passe',
    'Choose a profile':'Escolha um perfil','Choose a demo profile':'Escolha um perfil de demonstração','All features enabled':'Todas as funcionalidades ativas','contained':'contido','No containment estimate yet':'Ainda sem previsão de contenção','ANEPC gives only the time of the latest change: the counter runs from that update':'A ANEPC só indica a hora da última mudança: o contador conta a partir dessa atualização','since the latest update · ':'desde a última atualização · ','Filled in when you choose a profile':'Preenchida quando escolher um perfil','Tap Username to choose a demo profile.':'Toque em Utilizador para escolher um perfil de demonstração.',
    'Demo login to show user roles: each profile limits which areas a user can see and which features they can use.':'Acesso de demonstração para mostrar funções de utilizador: cada perfil limita as áreas que cada utilizador vê e as funcionalidades que pode usar.',
    'Demo users · each role sets the areas and features':'Utilizadores de demonstração · cada função define as áreas e as funcionalidades',
    'Sign out':'Terminar sessão','Preferences':'Preferências','Access to all features · Portugal region only':'Acesso a todas as funcionalidades · Apenas a região de Portugal','Recommended stations':'Quartéis recomendados','Suggested stations':'Quartéis sugeridos','Send dispatch':'Enviar despacho','Reinforce':'Reforçar','Orders from this app':'Ordens enviadas nesta app','Stations':'Quartéis','Units':'Meios','Air support':'Apoio aéreo','Stations on this fire':'Quartéis neste incêndio','Not published per station · none dispatched from this app yet':'Não publicado por quartel · nenhum despachado nesta app','All crews already on this fire':'Todas as equipas já neste incêndio','Ground crews':'Equipas de solo','Water tenders':'Autotanques','Send dispatch order':'Enviar ordem de despacho','Send dispatch orders':'Enviar ordens de despacho','Sending dispatch order':'A enviar ordem de despacho','Sending dispatch orders':'A enviar ordens de despacho','Dispatch order sent':'Ordem de despacho enviada','Dispatch orders sent':'Ordens de despacho enviadas','Order received by the coordinator':'Ordem recebida pelo comandante','Sending order…':'A enviar ordem…','Waiting':'Em espera','Demo: no real order is sent':'Demonstração: nenhuma ordem real é enviada','Crew availability not published':'Disponibilidade de equipas não publicada','No ignition candidates':'Sem candidatos a ignição','No active fires':'Sem incêndios ativos','Time to fire line':'Tempo até à linha de fogo','Select station':'Escolher quartel','Choose one or more · sorted by time to the fire line':'Escolha um ou mais · ordenados pelo tempo até à linha de fogo','Finding recommended stations…':'A procurar quartéis recomendados…','Within an ideal first attack · which stations sent crews is not published':'Ao alcance de um primeiro ataque ideal · não se publica que quartéis enviaram meios','Close preferences':'Fechar preferências','Language':'Idioma','Theme':'Tema','Light':'Claro','Dark':'Escuro','Text size':'Tamanho do texto','Condensed':'Compacto','Normal':'Normal','Comfortable':'Confortável','Connect data sources':'Ligar fontes de dados','Invite team members':'Convidar membros da equipa','Portugal only':'Apenas Portugal','Loading…':'A carregar…','Close':'Fechar','View':'Ver','Cancel':'Cancelar','Apply':'Aplicar','Done':'Concluído','Undo':'Desfazer','Adjust':'Ajustar','Now':'Agora','Not yet':'Ainda não',
    'Loading live data':'A carregar dados em direto','Loading live fires…':'A carregar incêndios em direto…','Calculating…':'A calcular…','Estimating…':'A estimar…',
    'Platform administrator':'Administrador da plataforma','Deputy Director, Fire Protection':'Diretor-adjunto, Proteção contra Incêndios','State Forester Firewarden':'Engenheira Florestal do Estado',
    'Leads the national wildfire command. Sets the national alert level, moves reinforcement groups and aerial means between districts, and decides when a fire goes to national command.':'Lidera o comando nacional de incêndios rurais. Define o nível de alerta nacional, movimenta grupos de reforço e meios aéreos entre distritos e decide quando um incêndio passa para o comando nacional.',
    'Directs statewide fire operations. Sets priorities between competing fires, moves strike teams and air tankers between units, and requests mutual aid through Cal OES.':'Dirige as operações de combate em todo o estado. Define prioridades entre incêndios, movimenta equipas de intervenção e aviões-tanque entre unidades e pede apoio mútuo através do Cal OES.',
    'Heads the state wildland fire service. Coordinates with BLM and the Forest Service, approves resource orders across counties, and requests federal help for large fires.':'Dirige o serviço estadual de incêndios rurais. Coordena com o BLM e o Forest Service, aprova pedidos de meios entre condados e pede apoio federal para grandes incêndios.',
    'Coordinates fire prevention and brigade operations across the Legal Amazon. Hires and trains brigades before the dry season, plans prescribed burning, follows INPE hotspots and fire events daily, and sends federal brigades to indigenous lands and protected areas.':'Coordena a prevenção de incêndios e as operações das brigadas na Amazônia Legal. Contrata e forma brigadas antes da época seca, planeia queimas prescritas, acompanha diariamente os focos e eventos de fogo do INPE e envia brigadas federais para terras indígenas e áreas protegidas.',
    'Oversees the platform across every country: user access, data feeds and model health. Supports the commanders when a fire crosses a border.':'Supervisiona a plataforma em todos os países: acessos, fontes de dados e saúde dos modelos. Apoia os comandantes quando um incêndio atravessa uma fronteira.',
    'Sees all countries and regions':'Vê todos os países e regiões','Access: all countries and regions':'Acesso: todos os países e regiões','All countries':'Todos os países','Portugal only':'Apenas Portugal',
    'Incidents':'Incidentes','Incidents in':'Incidentes em','Ignition candidates':'Candidatos a ignição','Ignition candidate':'Candidato a ignição','Active fires':'Incêndios ativos','Active fire':'Incêndio ativo','No active fires':'Sem incêndios ativos',
    'Fire stations':'Quartéis de bombeiros','Fire station':'Quartel de bombeiros','Burned area':'Área ardida','Active edge':'Frente ativa','Burning edge':'Frente a arder','Held line':'Linha dominada',
    'District':'Distrito','County':'Condado','State':'Estado','Country':'País','Region':'Região','Area':'Área','Choose a country':'Escolha um país','United States':'Estados Unidos','Europe':'Europa','Americas':'Américas',
    'Back to countries':'Voltar aos países','Back to United States':'Voltar aos Estados Unidos','Back to Brazil':'Voltar ao Brasil','Close area picker':'Fechar seletor de área','Map controls':'Controlos do mapa','Collapse map controls':'Recolher controlos do mapa',
    'Full screen':'Ecrã inteiro','Exit full screen':'Sair do ecrã inteiro','Raise the panel over the map':'Subir o painel sobre o mapa','Lower the panel':'Baixar o painel',
    'Map':'Mapa','Map © OpenStreetMap':'Mapa © OpenStreetMap','Terrain map':'Mapa de terreno','Street':'Ruas','Vector':'Vetorial','Vector map':'Mapa vetorial',
    'Fire simulator':'Simulador de incêndios','Play a fire scenario and command the forces':'Simule um cenário e comande os meios','Real data':'Dados reais','Simulated':'Simulado','Simulated projection':'Projeção simulada',
    'Fires on cleared land':'Incêndios em terra desmatada','deforestation fires':'incêndios de desmatamento','hectares burning':'hectares a arder','Who finances forest-risk farming in Brazil':'Quem financia a agropecuária de risco florestal no Brasil',
    'Their conclusion: voluntary pledges have not stopped the finance, so banks should be legally liable for deforestation they fund.':'A conclusão: os compromissos voluntários não travaram o financiamento, por isso os bancos devem ser legalmente responsáveis pelo desmatamento que financiam.',
    'Restore demo alerts':'Repor alertas de demonstração','No active alerts':'Sem alertas ativos','Nothing to review':'Nada para rever','No ignition candidates':'Sem candidatos a ignição',
    // candidate screen
    'AI validation':'Validação por IA','AI likelihood':'Probabilidade IA','Likelihood':'Probabilidade','Evidence':'Evidências','Unverified':'Por verificar','Being checked':'Em verificação','Verifying':'Em verificação',
    'Strong heat signal':'Sinal térmico forte','Heat anomaly':'Anomalia térmica','Weak heat signal':'Sinal térmico fraco','Smoke plume likely':'Coluna de fumo provável','Possible smoke':'Possível fumo','Possible fire start':'Possível início de incêndio',
    'Not yet confirmed on the ground':'Ainda não confirmado no terreno','One detection':'Uma deteção','Estimated ignition point':'Ponto de ignição estimado','Heat is inside the dashed circle · ±375 m':'O calor está dentro do círculo tracejado · ±375 m',
    'Confirm fire':'Confirmar incêndio','Verify by drone':'Enviar drone','Dismiss':'Descartar','Dismiss ignition':'Descartar ignição','Go back':'Voltar','Confirm this fire?':'Confirmar este incêndio?','Dismiss this candidate?':'Descartar este candidato?',
    'Confirm and size response':'Confirmar e dimensionar resposta','False alarm':'Falso alarme','Controlled burn':'Queima controlada','Satellite detection point':'Ponto de deteção por satélite',
    "You're declaring":'Está a declarar','a real ignition, based on the evidence you reviewed:':'uma ignição real, com base nas evidências que reviu:','will be closed and removed from the map.':'será fechado e retirado do mapa.',
    'likelihood':'probabilidade','confidence':'confiança','validation level':'nível de validação','candidates':'candidatos','fires':'incêndios','units':'meios','AI':'IA','AI and camera network':'IA e rede de câmaras',
    // drone
    'Drone verification':'Verificação por drone','On scene':'No local','On scene now':'No local agora','Returning to base':'A regressar à base','Live video from the fire':'Vídeo em direto do incêndio',
    'Thermal':'Térmico','Visual':'Visível','Video':'Vídeo','Photo':'Fotografia','Flames':'Chamas','Smoke':'Fumo','Peak':'Pico','Peak temperature':'Temperatura máxima','Spread':'Propagação',
    'Live video and thermal on arrival':'Vídeo e térmico em direto à chegada','Already airborne · live video on arrival':'Já em voo · vídeo em direto à chegada','Live footage for crews, no need to wait for it':'Imagens em direto para as equipas, sem necessidade de esperar',
    // dispatch
    'Dispatch':'Despacho','Dispatch sizing':'Dimensionamento do despacho','Fire situation':'Situação do incêndio','Forces dispatched':'Meios empenhados','Forces on scene':'Meios no local','Forces on the way':'Meios a caminho',
    'Choose a station':'Escolha um quartel','Configure dispatch':'Configurar despacho','Alarm to fire line':'Do alarme à linha de fogo','First on the line':'Primeiro na linha','Suggested':'Sugerido','Best':'Melhor','Busy':'Ocupado',
    'Ground crews':'Equipas de solo','Water tenders':'Autotanques','Helicopters':'Helicópteros','Air tankers':'Aviões-tanque','Drone swarms':'Enxames de drones','Jet tanker':'Avião-tanque a jato',
    'Response decided':'Resposta decidida','Time':'Tempo','Time to':'Tempo até','Total':'Total','Situation':'Situação','Status':'Estado','Started':'Início','Resolved':'Resolvido','Held':'Dominado','Fire held':'Incêndio dominado','Resources on scene':'Meios no local','This fire':'Este incêndio','On scene':'No local','Nearest fire stations':'Quartéis mais próximos','Fire station · straight-line distance':'Quartel · distância em linha reta','Not necessarily on this fire · which stations sent crews is not published':'Não necessariamente neste incêndio · não é publicado que quartéis enviaram equipas',
    'Resources not published':'Meios não publicados','Resources are not published for this fire':'Os meios não são publicados para este incêndio','Not published':'Não publicado','Not available':'Indisponível','Unavailable':'Indisponível',
    'Time to resolve':'Tempo até resolver','Time it took to resolve':'Tempo que levou a resolver','Expected resolution':'Resolução prevista','Expected containment':'Contenção prevista','Open fire':'Abrir incêndio',
    'Active fronts':'Frentes ativas','Days with fire':'Dias com fogo','Days without rain':'Dias sem chuva','Fire risk':'Risco de incêndio','Protected areas and indigenous lands':'Áreas protegidas e terras indígenas','Deforestation fire':'Incêndio de desmatamento',
    'Under observation':'Em observação','New isolated front':'Nova frente isolada','Under surveillance':'Em vigilância','Concluding':'Em conclusão','Being resolved':'Em resolução','Ongoing':'Em curso','Contained':'Contido','Controlled':'Controlado','Fire out':'Extinto','Not contained':'Não contido','Out of control':'Descontrolado',
    // station
    'Fires near this station':'Incêndios perto deste quartel','Station':'Quartel','Crews and vehicles':'Equipas e viaturas','Call':'Ligar','Directions':'Direções',
    'Operator':'Entidade','Type':'Tipo','Code':'Código','Address':'Morada','Phone':'Telefone','Email':'Email','Website':'Site','Hours':'Horário','Since':'Desde','Location':'Localização',
    'Volunteer':'Voluntários','Professional':'Profissionais','Municipal':'Municipais','Airport':'Aeroporto','Forestry':'Sapadores florestais','Private':'Privado','Public service':'Serviço público',
    'No active fires within 25 km':'Sem incêndios ativos num raio de 25 km','No fires within 60 km.':'Sem incêndios num raio de 60 km.','No station selected. Open a fire station from the map.':'Nenhum quartel selecionado. Abra um quartel a partir do mapa.',
    'Straight-line distance; drive time estimated at 50 km/h on roads.':'Distância em linha reta; tempo de viagem estimado a 50 km/h por estrada.',
    "Not published in open data. Linking the station's roster would show crews on duty, vehicles and readiness here.":'Não publicado em dados abertos. Ligar a escala do quartel mostraria aqui as equipas de serviço, as viaturas e a prontidão.',
    'Station details from OpenStreetMap contributors ·':'Dados do quartel dos contribuidores do OpenStreetMap ·','Location from OpenStreetMap':'Localização do OpenStreetMap',
    // citizen report
    'Report a fire':'Reportar um incêndio','Report received':'Alerta recebido','Send report':'Enviar alerta','Point at the smoke and take a photo.':'Aponte para o fumo e tire uma fotografia.','Stay safe':'Mantenha-se em segurança',
    "Don't move closer for more photos. Keep a clear way out, away from the wind.":'Não se aproxime para tirar mais fotografias. Mantenha uma saída livre, longe do vento.',
    'Your photo is being checked against nearby cameras and sensors. A coordinator decides what to send.':'A sua fotografia está a ser cruzada com câmaras e sensores próximos. Um coordenador decide o que enviar.',
    'Active':'Ativo','All on scene':'Todos no local','Also send drone':'Enviar também drone','Forces ·':'Meios ·','North ridge':'Cumeada norte','Spread in':'Propagação em','in':'em','for +':'para +',
    'crews needed for +':'equipas necessárias para +','fire line':'linha de fogo','units ·':'meios ·','units · first on scene':'meios · primeiro no local','From the helibase':'Da base de helicópteros',
    'Ranked by time to the fire line. Select one or more stations.':'Ordenados pelo tempo até à linha de fogo. Escolha um ou mais quartéis.',
    'Where the sources’ lines of sight cross.':'Onde se cruzam as linhas de visão das fontes.','Drone verification in progress':'Verificação por drone em curso',
    'USD 206.7 bn of forest-risk credit since 2016 went through Brazil\'s agriculture finance programme. Largest lenders: Banco do Brasil 99.8 bn · Sicredi 19.5 bn · Bradesco 17.7 bn · Itaú 14.6 bn · Caixa 12.8 bn · Banco da Amazônia 8.3 bn.':'206,7 mil milhões de USD em crédito de risco florestal passaram desde 2016 pelo programa de crédito agrícola do Brasil. Maiores credores: Banco do Brasil 99,8 · Sicredi 19,5 · Bradesco 17,7 · Itaú 14,6 · Caixa 12,8 · Banco da Amazônia 8,3 (mil milhões).',
    'Forests & Finance, Banking on Biodiversity Collapse (Nov 2025) · USD, loans and underwriting, Brazil-wide':'Forests & Finance, Banking on Biodiversity Collapse (nov 2025) · USD, empréstimos e subscrição, todo o Brasil',
    'Nevada Division of Forestry · US':'Nevada Division of Forestry · US','Fire origin':'Origem do incêndio','Wind':'Vento',
    'Fighting this fire':'A combater este incêndio','Fighting':'A combater','Personnel':'Operacionais','Ground vehicles':'Viaturas terrestres','on scene':'no local','Fire model':'Modelo do incêndio',
    'Weather or map services did not answer; try again later':'Os serviços de meteorologia ou de mapas não responderam; tente mais tarde','Aircraft':'Meios aéreos','Crews':'Equipas',
    'Perimeter not mapped':'Perímetro não cartografado','Resources on scene and nearest fire stations':'Meios no local e quartéis mais próximos',
    'We will notify you':'Vamos notificá-lo','Received':'Recebido','What do you see?':'O que vê?','How far away is it?':'A que distância está?','New photo':'Nova fotografia','Wildfire Response':'Resposta a Incêndios'
  };
  // ---- patterns (whole text) -----------------------------------------------------------------------------------
  var DIR={north:'norte',south:'sul',east:'este',west:'oeste',northeast:'nordeste',northwest:'noroeste',southeast:'sudeste',southwest:'sudoeste'};
  var MON={Jan:'jan',Feb:'fev',Mar:'mar',Apr:'abr',May:'mai',Jun:'jun',Jul:'jul',Aug:'ago',Sep:'set',Sept:'set',Oct:'out',Nov:'nov',Dec:'dez'};
  function pl(n,one,many){return (String(n).replace(/[.,\s]/g,'')==='1')?one:many;}
  var R=[
    [/^([\d.,]+) (I|i)gnition candidates?$/,function(m,n){return n+' '+pl(n,'candidato','candidatos')+' a ignição';}],
    [/^([\d.,]+) active fires?$/,function(m,n){return n+' '+pl(n,'incêndio ativo','incêndios ativos');}],
    [/^([\d.,]+) ignition candidates? and ([\d.,]+) fires?$/,function(m,a,b){return a+' '+pl(a,'candidato','candidatos')+' a ignição e '+b+' '+pl(b,'incêndio','incêndios');}],
    [/^(Sees )?([\d.,]+) (counties|districts|states)$/,function(m,s,n,u){return (s?'Vê ':'')+n+' '+({counties:'condados',districts:'distritos',states:'estados'})[u];}],
    [/^Search ([\d.,]+) (countries|districts|counties|states)$/,function(m,n,u){return 'Pesquisar '+n+' '+({countries:'países',districts:'distritos',counties:'condados',states:'estados'})[u];}],
    [/^([\d.,]+) sources?$/,function(m,n){return n+' '+pl(n,'fonte','fontes');}],
    [/^Show ([\d.,]+) more · ([\d.,]+) left$/,'Mostrar mais $1 · faltam $2'],
    [/^([\d.,]+(?:\.\d+)?) km (north|south|east|west|northeast|northwest|southeast|southwest) of (.+)$/,function(m,n,d,p){return n+' km a '+DIR[d]+' de '+p;}],
    [/^Fire radiative power ([\d.,]+) MW(?: · ([\d.,]+) detections within 3 km)?$/,function(m,a,b){return 'Potência radiativa do fogo '+a+' MW'+(b?' · '+b+' deteções num raio de 3 km':'');}],
    [/^([\d.,]+) detections within 3 km$/,'$1 deteções num raio de 3 km'],
    [/^Heat detected by (.+?)(?: at (.+))?$/,function(m,s,t){return 'Calor detetado pelo '+s+(t?' às '+t:'');}],
    [/^([\d.,]+) km to scene$/,'A $1 km do local'],[/^On route · ([\d.,]+) min to scene$/,'A caminho · a $1 min do local'],[/^En route · arriving in (.+)$/,'A caminho · chega em $1'],
    [/^([\d.,]+) of ([\d.,]+) still free$/,'$1 de $2 ainda livres'],[/^([\d.,]+) free crews$/,'$1 equipas livres'],
    [/^Active ([\dhm ]+)$/,'Ativo há $1'],
    [/^Reported by (.+)$/,'Reportado por $1'],[/^On this fire: (.+)$/,'Neste incêndio: $1'],[/^(.+) · order sent (.+)$/,'$1 · ordem enviada $2'],[/^order sent (.+)$/,'ordem enviada $1'],[/^To station coordinators · (.+)$/,'Para os comandantes dos quartéis · $1'],[/^((?:\d+d )?\d+h \d+m) active$/,'$1 ativo'],[/^Started (.+)$/,'Início $1'],[/^Expected containment ~(.+)$/,'Contenção prevista ~$1'],[/^Held since (.+)$/,'Dominado desde $1'],[/^Held for (.+)$/,'Dominado há $1'],[/^Active for (.+)$/,'Ativo durante $1'],[/^Edge fully contained$/,'Perímetro totalmente contido'],
    [/^Started (.+?) · held (by )?(.+?)( · now (.+))?$/,function(m,a,by,b,x,st){return 'Início '+a+' · dominado '+(by?'até às ':'às ')+b+(st?' · agora '+(X[st.charAt(0).toUpperCase()+st.slice(1)]||st).toLowerCase():'');}],
    [/^(PT-\S+|BR-\S+|\S+-\S+) · (.+) · (\d+) units$/,'$1 · $2 · $3 meios'],[/^Live · (.+)$/,'Em direto · $1'],[/^Updated (.+)$/,'Atualizado $1'],[/^Contained (\d+)%$/,'Contido a $1%'],[/^Reported (.+)$/,'Reportado $1'],
    [/^© (\d+) Nuno Rogerio\. All rights reserved\.$/,'© $1 Nuno Rogerio. Todos os direitos reservados.'],[/^Photo: (.+) \/ Unsplash$/,'Fotografia: $1 / Unsplash'],
    [/^Spread T\+(\d)$/,'Propagação T+$1'],[/^(\d) · Select station$/,'$1 · Escolher quartel'],[/^(\d) · Configure dispatch$/,'$1 · Configurar despacho'],
    [/^(\d+) of (\d+) active fires in the Legal Amazon burn mostly on land cleared in recent years, the clearing-then-burning pattern that turns forest into pasture and cropland\.$/,'$1 de $2 incêndios ativos na Amazônia Legal ardem sobretudo em terra desmatada nos últimos anos, o padrão de desmatar e queimar que transforma floresta em pasto e cultivo.'],
    [/^(\d+) de (\d+) active fires in the Legal Amazon burn mostly on land cleared in recent years, the clearing-then-burning pattern that turns forest into pasture and cropland\.$/,'$1 de $2 incêndios ativos na Amazônia Legal ardem sobretudo em terra desmatada nos últimos anos, o padrão de desmatar e queimar que transforma floresta em pasto e cultivo.'],
    [/^All crews on (.+)$/,'Todas as equipas em $1'],[/^Confirmed at (.+) on the north ridge\.$/,'Confirmado às $1 na cumeada norte.'],
    [/^Closest with (\d+) free crews · (.+)$/,'Mais próximo com $1 equipas livres · $2'],[/^Station: (.+)$/,'Quartel: $1'],
    [/^will be closed and drone (.+) will return to base\.$/,'será fechado e o drone $1 regressará à base.'],
    [/^(.+) · Resources on scene at (.+) · (\d+) units$/,'$1 · Meios no local em $2 · $3 meios'],[/^On scene · (.+)$/,'No local · $1'],[/^Fire (PT-\S+|BR-\S+|\S+-\S+)$/,'Incêndio $1'],
    [/^([\d.,]+) × (.+)$/,function(m,n,u){return n+' × '+(X[u]||u);}]
  ];
  // ---- fragments inside longer text (applied when no exact/pattern match) ---------------------------------------
  var F=[
    [/\bTap to review\./g,'Toque para abrir.'],[/\bTap to see forces dispatched\./g,'Toque para ver os meios empenhados.'],[/\bTap the crosshair to cycle to it\./g,'Toque na mira para ir até ele.'],
    [/(\d+)% likelihood/g,'$1% de probabilidade'],[/\bNear (?=[A-ZÀ-Ý])/g,'Perto de '],[/\b(\d+) of (\d+)\b/g,'$1 de $2'],[/\bActive fire\b/g,'Incêndio ativo'],[/\bSatellite\b/g,'Satélite'],
    [/ · (\d+) min ago\b/g,' · há $1 min'],[/ · (\d+)h ago\b/g,' · há $1 h'],[/\bAccess: /g,'Acesso: '],[/ only$/,' apenas'],[/\bPlatform administrator\b/g,'Administrador da plataforma'],
    [/\b(\d+) crews\b/g,'$1 equipas'],[/\b(\d+) tenders\b/g,'$1 autotanques'],[/\b1 helicopter\b/g,'1 helicóptero'],[/\b(\d+) helicopters\b/g,'$1 helicópteros'],
    [/\b1 air tanker\b/g,'1 avião-tanque'],[/\b(\d+) air tankers\b/g,'$1 aviões-tanque'],[/\b1 drone swarm\b/g,'1 enxame de drones'],[/\b(\d+) drone swarms\b/g,'$1 enxames de drones'],
    [/\bcrews free\b/g,'equipas livres'],[/\bcrews needed\b/g,'equipas necessárias'],[/\bonly (\d)/g,'só $1'],[/^From the (.+) swarm unit$/,'Da unidade de enxame $1'],[/ swarm unit\b/g,' unidade de enxame'],
    [/^From (?=ST-|Fox|San )/,'De '],[/ \+ aid\b/g,' + apoio'],[/ and mutual aid\b/g,' e apoio mútuo'],[/\bair base\b/g,'base aérea'],[/ only\.$/,' apenas.'],
    [/\b(\d{1,2}):(\d{2}) (AM|PM)\b/g,function(m,h,mm,ap){h=+h%12+(ap==='PM'?12:0);return String(h).padStart(2,'0')+':'+mm;}],
    [/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec) (\d{1,2})\b/g,function(m,mo,d){return d+' '+MON[mo];}],
    [/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\b/g,function(m,d,mo){return d+' '+MON[mo];}]
  ];
  var cache=new Map();
  function tr(s){
    var k=s.trim();if(!k||k.length>600)return s;
    if(cache.has(k))return rewrap(s,cache.get(k));
    var out=null;
    if(Object.prototype.hasOwnProperty.call(X,k))out=X[k];
    if(out===null){for(var i=0;i<R.length;i++){var m=k.match(R[i][0]);if(m){out=typeof R[i][1]==='function'?R[i][1].apply(null,m):k.replace(R[i][0],R[i][1]);break;}}}
    if(out===null){var t=k;for(var j=0;j<F.length;j++)t=t.replace(F[j][0],F[j][1]);
      // translate each line/segment that is itself a known phrase
      t=t.split('\n').map(function(line){var q=line.trim();return Object.prototype.hasOwnProperty.call(X,q)?line.replace(q,X[q]):line;}).join('\n');
      out=t;}
    if(cache.size>8000)cache.clear();cache.set(k,out);return rewrap(s,out);
  }
  function rewrap(orig,out){var a=orig.match(/^\s*/)[0],b=orig.match(/\s*$/)[0];return a+out+b;}
  var done=new WeakMap();
  function node(n){
    if(n.nodeType===3){var p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName))return;var v=n.nodeValue;if(done.get(n)===v)return;var t=tr(v);if(t!==v)n.nodeValue=t;done.set(n,n.nodeValue);return;}
    if(n.nodeType!==1)return;
    if(/^(SCRIPT|STYLE)$/.test(n.nodeName))return;
    if(n.hasAttribute&&n.hasAttribute('placeholder')){var ph=n.getAttribute('placeholder'),tp=tr(ph);if(tp!==ph)n.setAttribute('placeholder',tp);}
    if(n.hasAttribute&&n.hasAttribute('aria-label')){var al=n.getAttribute('aria-label'),ta=tr(al);if(ta!==al)n.setAttribute('aria-label',ta);}
    var c=n.firstChild;while(c){node(c);c=c.nextSibling;}
  }
  var queued=false,pend=new Set();
  function flush(){queued=false;var list=Array.from(pend);pend.clear();list.forEach(function(n){if(n.isConnected)node(n);});}
  function start(){
    node(document.body);
    new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')pend.add(m.target);else if(m.type==='attributes')pend.add(m.target);else m.addedNodes.forEach(function(a){pend.add(a);});});
      if(!queued){queued=true;(window.queueMicrotask||setTimeout)(flush);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label']});
    try{document.title=tr(document.title);}catch(e){}
  }
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
