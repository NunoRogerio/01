// Live fires for the prototype.
//  - US: NIFC WFIGS current wildland fire incidents (10 western states in the app)
//  - Portugal: Fogos.pt (relays ANEPC / Proteção Civil occurrences); districts act as "counties"
//  - Ignition candidates: NASA FIRMS VIIRS satellite hotspots for Europe + the Americas (data/hotspots.json),
//    with every country's regions in data/regions.json; both written by the FIRMS GitHub Action
// Replaces the design's sample fires, and the sample ignition candidates once satellite data exists.
window.__wfLiveMap = true;   // tells the map to use live web-map tiles
(function(){
  var US_URL='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query';
  var PT_URL='https://api.fogos.pt/v2/incidents/active';
  var STATES=['CA','AZ','OR','NV','NM','WA','ID','CO','UT','MT'];
  var PT_DISTRICTS=['Aveiro','Beja','Braga','Bragança','Castelo Branco','Coimbra','Évora','Faro','Guarda','Leiria','Lisboa','Portalegre','Porto','Santarém','Setúbal','Viana do Castelo','Vila Real','Viseu','Açores','Madeira'];
  var KEY='wf-live-fires-v12', TTL=5*60*1000;

  function toXY(lat,lon){return [Math.round((lon+118.13)*2345+518),Math.round((34.19-lat)*2829+662)];}
  function ago(ms){var m=Math.max(0,Math.round((Date.now()-ms)/60000));if(m<60)return m+' min ago';var h=Math.round(m/60);return h<48?h+'h ago':Math.round(h/24)+'d ago';}
  function title(s){return String(s||'').toLowerCase().replace(/(^|[\s\-\/(])(\S)/g,function(_,a,c){return a+c.toUpperCase();}).replace(/\b(Do|Da|Dos|Das|De|E)\b/g,function(w){return w.toLowerCase();});}
  function plain(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();}
  var DIST={};PT_DISTRICTS.forEach(function(d){DIST[plain(d)]=d;});
  // ANEPC occurrence states (Fogos.pt statusCode) -> English + tone for the state tag
  var PT_STATE={3:['Despacho','Dispatched','warn'],4:['Despacho de 1º Alerta','First alert dispatched','warn'],5:['Em Curso','Ongoing','hot'],6:['Chegada ao TO','Crews arriving','warn'],
    7:['Em Resolução','Being resolved','amber'],8:['Conclusão','Concluding','ok'],9:['Vigilância','Under surveillance','watch'],10:['Encerrada','Closed','off'],11:['Falso Alarme','False alarm','off'],12:['Falso Alerta','False alert','off']};
  // Fogos.pt / ANEPC fire types ("natureza")
  var PT_TYPE={'mato':'Scrubland','povoamento florestal':'Forest stand','agricola':'Agricultural','queimada':'Controlled burn','queima':'Debris burning','consolidacao de rescaldo':'Mop-up','incendio urbano':'Urban'};
  DIST['acores']='Açores';DIST['regiao autonoma dos acores']='Açores';DIST['madeira']='Madeira';DIST['regiao autonoma da madeira']='Madeira';

  function buildUS(fc){
    var out=[];
    (fc.features||[]).forEach(function(f){
      var p=f.properties||{},g=f.geometry;if(!g||!g.coordinates)return;
      var st=String(p.POOState||'').replace(/^US-/,'');if(!/^[A-Z]{2}$/.test(st))return;
      var pc=p.PercentContained;if(pc!=null&&pc>=100)return;
      var ac=p.IncidentSize!=null?Math.round(p.IncidentSize).toLocaleString('en-US')+' ac':'';
      var note=(pc!=null?'Contained '+Math.round(pc)+'%':(p.FireDiscoveryDateTime?'Reported '+ago(p.FireDiscoveryDateTime):'Active'))+(ac?' · '+ac:'');
      var xy=toXY(g.coordinates[1],g.coordinates[0]);
      var res=p.TotalIncidentPersonnel!=null?{man:p.TotalIncidentPersonnel,status:pc!=null?'Contained '+Math.round(pc)+'%':'',start:p.FireDiscoveryDateTime?new Date(p.FireDiscoveryDateTime).toLocaleDateString([], {day:'numeric',month:'short'}):'',src:'NIFC · WFIGS'}:null;
      // NIFC / CAL FIRE-style stages: Active (with % contained) -> Contained -> Controlled -> Out
      var S=p.FireOutDateTime?['Out','Fire out','off']:p.ControlDateTime?['Controlled','Controlled','watch']:(p.ContainmentDateTime||(pc!=null&&pc>=100))?['Contained','Contained','ok']:['Active',pc?Math.round(pc)+'% contained':'Not contained',pc>=50?'amber':'hot'];
      var info={src:'NIFC · WFIGS',st:S[0],stEn:S[1],tone:S[2],pc:pc!=null?Math.round(pc):null,beh:p.FireBehaviorGeneral||'',cause:p.FireCause||'',
        startMs:p.FireDiscoveryDateTime||null,updMs:p.ModifiedOnDateTime_dt||null,ac:p.IncidentSize!=null?Math.round(p.IncidentSize):null,ha:p.IncidentSize?+(p.IncidentSize*0.4047).toFixed(1):null,
        resolved:S[0]!=='Active',heldMs:p.ContainmentDateTime||p.ControlDateTime||p.FireOutDateTime||null,heldSrc:'containment report',place:[p.POOCounty?p.POOCounty+' County':'',st].filter(Boolean).join(' · ')};
      out.push({r:[st,p.POOCounty||'',p.UniqueFireIdentifier||('US-'+out.length),title(p.IncidentName||'Unnamed'),note,xy[0],xy[1],res,info.ha,info],w:p.IncidentSize||0});
    });
    return out;
  }
  function buildPT(js){
    var out=[];
    (js&&js.data||[]).forEach(function(i){
      var nat=plain(i.natureza),code=String(i.naturezaCode||'');
      var isFire=i.isFire===true||(i.icnf&&i.icnf.incendio===true)||code.indexOf('31')===0||nat.indexOf('incendio')>=0;
      if(!isFire)return;   // fires only: Fogos.pt labels them Mato / Povoamento Florestal / Agrícola (codes 31xx)
      var lat=parseFloat(i.lat),lng=parseFloat(i.lng);if(!isFinite(lat)||!isFinite(lng))return;
      var d=DIST[plain(i.district)]||title(i.district);
      var man=parseInt(i.man,10)||0,air=parseInt(i.aerial,10)||0;
      var note=(i.status||'Active')+(man?' · '+man+' operacionais':'')+(air?' · '+air+' meios aéreos':'');
      var xy=toXY(lat,lng);
      var hm=function(t){var x=new Date(t);return isNaN(x)?'':x.toLocaleString([], {day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});};
      var res={man:man,terrain:parseInt(i.terrain,10)||0,aerial:air,water:parseInt(i.meios_aquaticos,10)||0,status:i.status||'',
        start:i.dateTime&&i.dateTime.sec?hm(i.dateTime.sec*1000):((i.date||'')+' '+(i.hour||'')).trim(),updated:i.updated&&i.updated.sec?hm(i.updated.sec*1000):'',src:'Fogos.pt · ANEPC'};
      var sc=parseInt(i.statusCode,10),S=PT_STATE[sc]||[i.status||'Ativo','Active','hot'],BA=(i.icnf&&i.icnf.burnArea)||null;
      var info={src:'Fogos.pt · ANEPC',st:S[0],stEn:S[1],tone:S[2],type:i.natureza||'',typeEn:PT_TYPE[nat]||'',typeCode:code,
        startMs:i.dateTime&&i.dateTime.sec?i.dateTime.sec*1000:(i.created&&i.created.sec?i.created.sec*1000:null),updMs:i.updated&&i.updated.sec?i.updated.sec*1000:null,
        ha:BA&&BA.total?Math.round(BA.total*10)/10:null,burn:BA&&BA.total?{forest:BA.povoamento||0,scrub:BA.mato||0,farm:BA.agricola||0}:null,
        resolved:sc>=8,heldMs:sc>=8&&i.updated&&i.updated.sec?i.updated.sec*1000:null,heldSrc:'last status update',place:[i.concelho?title(i.concelho):'',d].filter(Boolean).join(' · ')};
      out.push({r:['PT',d,'PT-'+(i.id||out.length),title(i.freguesia||i.concelho||i.location||'Incêndio'),note,xy[0],xy[1],res,info.ha,info],w:man+air*20});
    });
    return out;
  }
  // regions.json: {states:[[id,name,country,[region,...]],...]}  ->  [id,name,n,[[region,0],...],country]
  // Also fills window.__wfGeoBoxes: {'ESP': [w,s,e,n], 'ESP|Galicia': [w,s,e,n], 'NV': ..., 'NV|Washoe': ...} for the map.
  function buildGeo(js){
    var bx={};(js&&js.states||[]).forEach(function(g){if(g[4])bx[g[0]]=g[4];var rb=g[5]||{};Object.keys(rb).forEach(function(n){bx[g[0]+'|'+n]=rb[n];});});
    window.__wfGeoBoxes=bx;
    return (js&&js.states||[]).map(function(g){return [g[0],g[1],g[3].length,g[3].map(function(n){return [n,0];}),g[2]];});
  }
  // hotspots.json: {points:[[st,co,lat,lon,conf,sat,isoTime,frp,n],...]}  ->  candidate rows
  function buildCands(js){
    return (js&&js.points||[]).map(function(p){
      var lat=p[2],lon=p[3],xy=toXY(lat,lon);
      var place='Hotspot '+Math.abs(lat).toFixed(2)+'°'+(lat>=0?'N':'S')+' '+Math.abs(lon).toFixed(2)+'°'+(lon>=0?'E':'W');
      var id='HS-'+Math.round((lat+90)*100)+'-'+Math.round((lon+180)*100);
      return [p[0],p[1],id,place,p[4],'sat:'+p[5],ago(Date.parse(p[6])),xy[0],xy[1],{lat:lat,lon:lon,frp:p[7],sat:p[5],t:p[6],n:p[8]}];
    });
  }
  // One cache, with its own timestamp per source (US fires, Portugal fires, satellite), so a source that
  // loads fast can never mark a slower one as fresh.
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{};}catch(e){return {};}}
  function save(stamp){
    var c=readCache();c[stamp]=Date.now();
    c.rows=window.__wfLiveFires||null;c.cands=window.__wfLiveCands||null;c.geo=window.__wfGeoStates||null;c.boxes=window.__wfGeoBoxes||null;
    try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}
    window.__wfWorld=null;window.__wfGeo=null;
    try{window.dispatchEvent(new Event('wf-sync'));}catch(e){}
  }
  // Replace one source's fires (US, Portugal or British Columbia) and keep the others'.
  var srcOf=function(r){return r[0]==='PT'?'PT':r[0]==='CAN'?'CAN':'US';};
  function publishPart(src,rows){
    var other=(window.__wfLiveFires||[]).filter(function(r){return srcOf(r)!==src;});
    var mine=rows.sort(function(a,b){return b.w-a.w;}).map(function(x){return x.r;});
    window.__wfLiveFires=mine.concat(other);window.__wfLiveAt=Date.now();
    save('t'+src);
  }
  // British Columbia Wildfire Service: active fires with crews / aviation / heavy equipment counts.
  var BC_STAGE={OUT_CNTRL:'Out of control',HOLDING:'Being held',UNDR_CNTRL:'Under control'};
  function buildBC(js){
    var out=[];
    (js&&js.data||[]).forEach(function(i){
      var lat=parseFloat(i.latitude),lng=parseFloat(i.longitude);if(!isFinite(lat)||!isFinite(lng))return;
      var ha=i.incidentSizeMappedHa||i.incidentSizeEstimatedHa, st=BC_STAGE[i.stageOfControlCode]||'Active';
      var note=st+(ha?' · '+Math.round(ha).toLocaleString('en-US')+' ha':'');
      var n=function(v){return v==null?null:(parseInt(v,10)||0);};
      var cnt={crews:n(i.crewResourceCount),aerial:n(i.aviationResourceCount),heavy:n(i.heavyEquipmentResourceCount),imt:n(i.incidentManagementResourceCount),structure:n(i.structureProtectionResourceCount)};
      var has=Object.keys(cnt).some(function(k){return cnt[k]!=null;});
      var upd=i.lastUpdatedTimestamp?new Date(i.lastUpdatedTimestamp).toLocaleString([], {day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'';
      var res=has?{crews:cnt.crews,aerial:cnt.aerial,heavy:cnt.heavy,imt:cnt.imt,structure:cnt.structure,status:st,start:i.discoveryDate?new Date(i.discoveryDate).toLocaleDateString([], {day:'numeric',month:'short'}):'',updated:upd,src:'BC Wildfire Service'}:null;
      var xy=toXY(lat,lng);
      out.push({r:['CAN','British Columbia','BC-'+(i.incidentNumberLabel||out.length),title(i.incidentName||i.incidentNumberLabel||'Wildfire'),note,xy[0],xy[1],res,ha||null],w:ha||0});
    });
    return out;
  }

  // ---------------------------------------------------------------------------------------------
  // Fire behaviour model (model estimate, not official):
  //  - "Now" perimeter: official perimeter (NIFC for the US, BC Wildfire Service for BC) when published;
  //    otherwise NASA FIRMS satellite detections around the fire; otherwise a circle of the reported size.
  //  - Spread: Rothermel (1972) surface fire spread with Anderson (1982) fuel models and Anderson (1983)
  //    elliptical fire shape; each point of the perimeter advances along its outward normal at the
  //    ellipse rate for that direction (Huygens-style), step 10 min.
  //  - Inputs: Open-Meteo hourly forecast (wind, temperature, humidity, rain), Open-Meteo elevation
  //    (slope and upslope direction), OpenStreetMap land cover at the fire (fuel model).
  //  - Suppression: fireline built by the reported resources (production rates below), anchored at the
  //    heel and worked along the flanks; the head is attacked directly only when it runs slower than
  //    20 m/min (faster heads need indirect line: 3x the length). Contained edges stop; contained = no active edge left.
  // ---------------------------------------------------------------------------------------------
  var FM={ // Anderson (1982): tons/acre 1h,10h,100h,live · 1h SAV (1/ft) · live SAV · depth ft · dead moisture of extinction · name · wind adj. factor
    1:[0.74,0,0,0,3500,1500,1.0,0.12,'Grass',0.4], 2:[2.0,1.0,0.5,0.5,3000,1500,1.0,0.15,'Grass and open woodland',0.4],
    4:[5.01,4.01,2.0,5.01,2000,1500,6.0,0.20,'Shrubland',0.4], 6:[1.5,2.5,2.0,0,1750,1500,2.5,0.25,'Heath and low shrubs',0.4],
    9:[2.92,0.41,0.15,0,2500,1500,0.2,0.25,'Broadleaf forest',0.1], 10:[3.01,2.0,5.01,2.0,2000,1500,1.0,0.25,'Forest with understory',0.15]};
  // Rothermel (1972) with Albini (1976) size classes; US units in, R0 ft/min out
  function rothermel(fm,Md,Uft,tanS){
    var f=FM[fm],T=0.0459,Ml=0.9;
    var dead=[[f[0]*T,f[4],Md],[f[1]*T,109,Md+0.01],[f[2]*T,30,Md+0.02]].filter(function(c){return c[0]>0;}),live=f[3]>0?[[f[3]*T,f[5],Ml]]:[];
    var Asum=function(L){return L.reduce(function(a,c){return a+c[1]*c[0]/32;},0);},Ad=Asum(dead),Al=Asum(live),At=Ad+Al;
    var fi=function(L,A){return L.map(function(c){return c[1]*c[0]/32/A;});},fd=fi(dead,Ad),fl=Al?fi(live,Al):[];
    var Fd=Ad/At,Fl=Al/At,sd=dead.reduce(function(a,c,i){return a+fd[i]*c[1];},0),sl=live.reduce(function(a,c,i){return a+fl[i]*c[1];},0),sav=Fd*sd+Fl*sl;
    var w0=dead.concat(live).reduce(function(a,c){return a+c[0];},0),rhoB=w0/f[6],beta=rhoB/32,bop=3.348*Math.pow(sav,-0.8189),rb=beta/bop,A=133*Math.pow(sav,-0.7913);
    var gam=Math.pow(sav,1.5)/(495+0.0594*Math.pow(sav,1.5))*Math.pow(rb,A)*Math.exp(A*(1-rb));
    var wnd=dead.reduce(function(a,c,i){return a+fd[i]*c[0]*(1-0.0555);},0),wnl=live.reduce(function(a,c,i){return a+fl[i]*c[0]*(1-0.0555);},0);
    var Mdead=dead.reduce(function(a,c,i){return a+fd[i]*c[2];},0),mxd=f[7],mxl=mxd;
    if(live.length){var ed=dead.reduce(function(a,c){return a+c[0]*Math.exp(-138/c[1]);},0),el=live.reduce(function(a,c){return a+c[0]*Math.exp(-500/c[1]);},0),
      mf=dead.reduce(function(a,c){return a+c[0]*Math.exp(-138/c[1])*c[2];},0)/ed;mxl=Math.max(mxd,2.9*(ed/el)*(1-mf/mxd)-0.226);}
    var eta=function(M,mx){var r=Math.min(1,M/mx);return Math.max(0,1-2.59*r+5.11*r*r-3.52*r*r*r);},etaS=0.174*Math.pow(0.01,-0.19);
    var IR=gam*8000*etaS*(wnd*eta(Mdead,mxd)+(live.length?wnl*eta(Ml,mxl):0));
    var xi=Math.exp((0.792+0.681*Math.sqrt(sav))*(beta+0.1))/(192+0.2595*sav);
    var sink=function(L,fr){return L.reduce(function(a,c,i){return a+fr[i]*Math.exp(-138/c[1])*(250+1116*c[2]);},0);};
    var hs=rhoB*(Fd*sink(dead,fd)+(live.length?Fl*sink(live,fl):0));
    var R0=IR*xi/hs,C=7.47*Math.exp(-0.133*Math.pow(sav,0.55)),B=0.02526*Math.pow(sav,0.54),E=0.715*Math.exp(-3.59e-4*sav);
    return {R0:R0,phiW:C*Math.pow(Math.max(0,Uft),B)*Math.pow(rb,-E),phiS:5.275*Math.pow(beta,-0.3)*tanS*tanS,C:C,B:B,E:E,rb:rb};
  }
  function emc(tC,rh){var t=tC*9/5+32,h=Math.max(1,Math.min(100,rh));  // Simard (1968), % -> fraction
    var m=h<10?0.03229+0.281073*h-0.000578*h*t:h<50?2.22749+0.160107*h-0.01478*t:21.0606+0.005565*h*h-0.00035*h*t-0.483199*h;return Math.max(0.02,m/100);}
  // spread state for one hour of weather: head rate (m/min), head bearing, length/breadth
  function behaviour(w,terr,fm,urban){
    var Md=emc(w.t,w.rh)+(w.p>0.5?0.12:w.p>0.1?0.05:0);
    var Uft=w.ws*0.87*54.68*FM[fm][9];                          // 10 m wind km/h -> 20 ft -> midflame ft/min
    var r=rothermel(fm,Md,Uft,terr.tan);
    var down=(w.wd+180)%360,rad=Math.PI/180;
    var vx=r.phiW*Math.sin(down*rad)+r.phiS*Math.sin(terr.up*rad),vy=r.phiW*Math.cos(down*rad)+r.phiS*Math.cos(terr.up*rad);
    var phi=Math.hypot(vx,vy),head=phi>1e-6?(Math.atan2(vx,vy)/rad+360)%360:down;
    var Rm=r.R0*(1+phi)*0.3048*(urban?0.3:1);                   // ft/min -> m/min
    var Ue=Math.pow(phi*Math.pow(r.rb,r.E)/r.C,1/r.B)/88;         // effective wind, mph
    var LB=Math.max(1,Math.min(8,0.936*Math.exp(0.2566*Ue)+0.461*Math.exp(-0.1548*Ue)-0.397));
    return {Rm:Rm,head:head,LB:LB,Md:Md};
  }
  function rateAt(b,dirDeg){var e=Math.sqrt(1-1/(b.LB*b.LB)),psi=(dirDeg-b.head)*Math.PI/180;return b.Rm*(1-e)/(1-e*Math.cos(psi));}
  // --- geometry in local metres
  function toLocal(ll,o){return ll.map(function(p){return [(p[1]-o[1])*111320*Math.cos(o[0]*Math.PI/180),(p[0]-o[0])*110540];});}
  function toLL(xy,o){return xy.map(function(p){return [o[0]+p[1]/110540,o[1]+p[0]/(111320*Math.cos(o[0]*Math.PI/180))];});}
  function area(P){var a=0;for(var i=0;i<P.length;i++){var j=(i+1)%P.length;a+=P[i][0]*P[j][1]-P[j][0]*P[i][1];}return a/2;}
  function resample(P,n){var L=[0];for(var i=1;i<=P.length;i++){var a=P[i-1],b=P[i%P.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
    var out=[],tot=L[L.length-1],k=0;for(var s=0;s<n;s++){var d=tot*s/n;while(L[k+1]<d)k++;var a=P[k],b=P[(k+1)%P.length],f=(d-L[k])/((L[k+1]-L[k])||1);out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]);}return out;}
  function hull(pts){pts=pts.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1];});if(pts.length<3)return pts;
    var cr=function(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);},lo=[],up=[];
    pts.forEach(function(p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);});
    for(var i=pts.length-1;i>=0;i--){var p=pts[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
    up.pop();lo.pop();return lo.concat(up);}
  function circle(r,n){var o=[];for(var i=0;i<n;i++){var a=2*Math.PI*i/n;o.push([r*Math.cos(a),r*Math.sin(a)]);}return o;}
  function perim(P){var s=0;for(var i=0;i<P.length;i++){var b=P[(i+1)%P.length];s+=Math.hypot(b[0]-P[i][0],b[1]-P[i][1]);}return s;}
  function compass(d){return ['N','NE','E','SE','S','SW','W','NW'][Math.round(((d%360)+360)%360/45)%8];}
  // --- inputs
  function getJSON(u){return fetch(u).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});}
  function officialPerimeter(f){
    var q=null;
    if(/^BC-/.test(f.id))q='https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0/query?where='+encodeURIComponent("FIRE_NUMBER='"+f.id.slice(3)+"'")+'&outFields=FIRE_SIZE_HECTARES,TRACK_DATE&outSR=4326&geometryPrecision=5&f=geojson';
    else if(/^[A-Z]{2}$/.test(f.st)&&f.st!=='PT')q='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query?where='+encodeURIComponent("attr_UniqueFireIdentifier='"+f.id+"'")+'&outFields=poly_GISAcres,poly_PolygonDateTime&outSR=4326&geometryPrecision=5&f=geojson';
    if(!q)return Promise.resolve(null);
    return getJSON(q).then(function(js){
      var best=null,ba=0;(js.features||[]).forEach(function(ft){var g=ft.geometry||{},polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
        polys.forEach(function(pg){var ring=(pg[0]||[]).map(function(c){return [c[1],c[0]];});var a=Math.abs(area(toLocal(ring,ring[0]||[0,0])));if(a>ba){ba=a;best=ring;}});});
      return best&&best.length>3?{ring:best,src:/^BC-/.test(f.id)?'Official perimeter · BC Wildfire Service':'Official perimeter · NIFC'}:null;
    }).catch(function(){return null;});
  }
  function satellitePerimeter(f,o){
    var near=(window.__wfLiveCands||[]).map(function(c){return c[9];}).filter(function(m){return m&&Math.abs(m.lat-f.lat)<0.08&&Math.abs(m.lon-f.lon)<0.1;})
      .map(function(m){return toLocal([[m.lat,m.lon]],o)[0];}).filter(function(p){return Math.hypot(p[0],p[1])<6000;});
    if(!near.length)return null;
    var pts=[];near.forEach(function(p){circle(375,8).forEach(function(c){pts.push([p[0]+c[0],p[1]+c[1]]);});});  // each VIIRS pixel ≈ 375 m
    return {xy:hull(pts),src:'Satellite detections · NASA FIRMS ('+near.length+')'};
  }
  function fuelAt(f){
    var q='[out:json][timeout:20];is_in('+f.lat.toFixed(5)+','+f.lon.toFixed(5)+')->.a;(area.a["landuse"];area.a["natural"];);out tags;';
    return getJSON('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(q)).then(function(js){
      var T=(js.elements||[]).map(function(e){return e.tags||{};}),has=function(k,v){return T.find(function(t){return v.indexOf(t[k])>=0;});};
      var w=has('natural',['wood'])||has('landuse',['forest']);if(w)return {fm:(w.leaf_type==='broadleaved')?9:10};
      if(has('natural',['scrub']))return {fm:4};if(has('natural',['heath']))return {fm:6};
      if(has('natural',['grassland'])||has('landuse',['meadow','grass','farmland','orchard','vineyard']))return {fm:1};
      if(has('landuse',['residential','commercial','industrial','retail']))return {fm:2,urban:true};
      return {fm:2,guess:true};
    }).catch(function(){return {fm:2,guess:true};});
  }
  function terrainAt(f){
    var d=0.004,dx=d*111320*Math.cos(f.lat*Math.PI/180),dy=d*110540;
    var la=[f.lat,f.lat+d,f.lat-d,f.lat,f.lat],lo=[f.lon,f.lon,f.lon,f.lon+d,f.lon-d];
    return getJSON('https://api.open-meteo.com/v1/elevation?latitude='+la.join(',')+'&longitude='+lo.join(',')).then(function(js){
      var z=js.elevation||[];var gx=(z[3]-z[4])/(2*dx),gy=(z[1]-z[2])/(2*dy);
      return {tan:Math.min(1.5,Math.hypot(gx,gy)),up:(Math.atan2(gx,gy)*180/Math.PI+360)%360,elev:z[0]};
    }).catch(function(){return {tan:0,up:0};});
  }
  function weatherAt(f){
    return getJSON('https://api.open-meteo.com/v1/forecast?latitude='+f.lat.toFixed(4)+'&longitude='+f.lon.toFixed(4)+'&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&forecast_days=4&timezone=UTC').then(function(js){
      var h=js.hourly,now=Date.now(),out=[];
      for(var i=0;i<h.time.length;i++){var t=Date.parse(h.time[i]+'Z');if(t+3600e3<now)continue;out.push({t:h.temperature_2m[i],rh:h.relative_humidity_2m[i],ws:h.wind_speed_10m[i],wd:h.wind_direction_10m[i],p:h.precipitation[i]||0});}
      return out;
    });
  }
  // --- suppression: fireline production (m/h) from reported resources
  function production(res,fm,tan,hourUTC,lonDeg){
    if(!res)return 0;
    var n=function(v){return +v||0;},local=(hourUTC+lonDeg/15+24)%24,day=local>=7&&local<20;
    var m=n(res.man)*(res.terrain!=null?8:12)+n(res.terrain)*100+n(res.crews)*200+n(res.heavy)*500+(day?n(res.aerial)*350:0);
    var fuelK={1:1,2:0.9,4:0.55,6:0.7,9:0.75,10:0.65}[fm]||0.8;
    return m*fuelK*Math.max(0.4,1-Math.atan(tan)*180/Math.PI/40);
  }
  function startContained(f){
    var r=f.res||{},s=String(r.status||f.note||''),m=/Contained (\d+)%/.exec(s);
    if(m)return +m[1]/100;
    if(/Under control/.test(s)||/Conclus/.test(s))return 1;
    if(/Vigil/.test(s))return 0.95;if(/Being held/.test(s))return 0.85;if(/Resolu/.test(s))return 0.6;
    return 0;
  }
  function simulate(f,ring0,src,wx,terr,fuel){
    var o=[f.lat,f.lon],P=ring0.xy||toLocal(ring0.ring,o);
    if(area(P)<0)P=P.slice().reverse();
    P=resample(P,96);
    var per0=perim(P),contained=startContained(f)*per0,done=new Array(P.length).fill(false),snaps={},etr=null,dt=10,maxMin=72*60;
    var t0=new Date(),info=null;
    for(var t=0;t<=maxMin;t+=dt){
      var hi=Math.min(wx.length-1,Math.floor(t/60)),w=wx[hi]||wx[wx.length-1],b=behaviour(w,terr,fuel.fm,fuel.urban);
      if(t===0)info={wind:Math.round(w.ws),from:compass(w.wd),temp:Math.round(w.t),rh:Math.round(w.rh),slope:Math.round(Math.atan(terr.tan)*180/Math.PI),fuel:FM[fuel.fm][8]+(fuel.guess?' (assumed)':''),head:Math.round(b.Rm*10)/10,md:Math.round(b.Md*100)};
      // which edges are held: order from the heel, along both flanks, head last (direct attack only if slow)
      var n=P.length,order=[],back=(b.head+180)%360;
      for(var i=0;i<n;i++){var a=P[(i+n-1)%n],c=P[(i+1)%n],nb=(Math.atan2(c[1]-a[1],-(c[0]-a[0]))*180/Math.PI+360)%360;   // outward normal bearing
        var dh=Math.abs(((nb-b.head+540)%360)-180);order.push({i:i,nb:nb,dh:dh,len:Math.hypot(c[0]-a[0],c[1]-a[1])/2});}
      var perNow=perim(P);
      var hold=order.slice().sort(function(x,y){return y.dh-x.dh;}),left=contained;
      done=new Array(n).fill(false);
      for(var k=0;k<hold.length&&left>0;k++){var q=hold[k],cost=(q.dh<35&&b.Rm>20)?q.len*3:q.len;if(left>=cost){done[q.i]=true;left-=cost;}}   // fast head: indirect attack, 3x the line
      var activeLen=0;order.forEach(function(q){if(!done[q.i])activeLen+=q.len*2;});activeLen/=2;
      if(t%60===0&&t<=180){var ll=toLL(P,o);snaps[t/60]={ring:ll,done:done.slice(),ha:Math.round(Math.abs(area(P))/1e4*10)/10,active:Math.round(100*activeLen/Math.max(1,perNow))};}
      if(activeLen<=perNow*0.02&&etr===null){etr=t;if(t>180)break;}
      if(etr!==null&&t>=180)break;
      // advance active edges
      var np=P.map(function(p,i){if(done[i])return p;var q=order[i],r=rateAt(b,q.nb)*dt,rad=q.nb*Math.PI/180;return [p[0]+Math.sin(rad)*r,p[1]+Math.cos(rad)*r];});
      // light smoothing keeps the front from folding on itself
      P=np.map(function(p,i){if(done[i])return p;var a=np[(i+n-1)%n],c=np[(i+1)%n];return [(a[0]+2*p[0]+c[0])/4,(a[1]+2*p[1]+c[1])/4];});
      if(Math.abs(area(P))<Math.abs(area(np))*0.98)P=np;
      contained+=production(f.res,fuel.fm,terr.tan,(t0.getUTCHours()+t/60)%24,f.lon)*dt/60;
    }
    return {src:src,snaps:snaps,etrMin:etr,etrAt:etr!==null?new Date(t0.getTime()+etr*60000):null,noRes:!f.res,info:info,startPct:Math.round(startContained(f)*100)};
  }
  // Shared by the map card and the fire screen: durations, and whether a fire is held (resolved) rather than alive.
  window.__wfDur=function(ms){if(ms==null||!isFinite(ms)||ms<0)return '';var m=Math.round(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;return d?d+'d '+h+'h':h?h+'h '+mm+'m':mm+' min';};
  window.__wfHeld=function(info,model){
    if(info&&info.resolved)return {official:true,st:info.st,label:info.stEn,took:(info.heldMs&&info.startMs&&info.heldMs>info.startMs)?info.heldMs-info.startMs:null,at:info.heldMs||null,src:info.heldSrc||''};
    var s0=model&&model.snaps&&model.snaps[0];
    if(s0&&s0.active===0)return {official:false,st:info?info.st:'',label:'Edge fully held',took:null,at:null,src:'fire model'};
    return null;
  };
  window.__wfModels=window.__wfModels||{};
  window.__wfFireModel=function(f){        // f: {id, st, lat, lon, ha, res, note}
    var M=window.__wfModels;if(M[f.id])return M[f.id].done?M[f.id]:null;
    M[f.id]={done:false};
    var o=[f.lat,f.lon];
    Promise.all([officialPerimeter(f),weatherAt(f),terrainAt(f),fuelAt(f)]).then(function(r){
      var ring=r[0]||satellitePerimeter(f,o)||{xy:circle(Math.sqrt((f.ha||5)*1e4/Math.PI),48),src:f.ha?'Circle of the reported size ('+f.ha+' ha)':'Assumed 5 ha (size not published)'};
      var out=simulate(f,ring,ring.src,r[1],r[2],r[3]);out.done=true;M[f.id]=out;
      try{window.dispatchEvent(new Event('wf-sync'));}catch(e){}
    }).catch(function(e){console.warn('[fire model] failed',e);M[f.id]={done:true,failed:true};try{window.dispatchEvent(new Event('wf-sync'));}catch(x){}});
    return null;
  };

  var c=readCache(),now=Date.now();
  if(c.rows)window.__wfLiveFires=c.rows;if(c.cands)window.__wfLiveCands=c.cands;if(c.geo)window.__wfGeoStates=c.geo;if(c.boxes)window.__wfGeoBoxes=c.boxes;if(c.tPT||c.tUS||c.tCAN)window.__wfLiveAt=Math.max(c.tPT||0,c.tUS||0,c.tCAN||0);
  var fresh=function(k){return c[k]&&now-c[k]<TTL;};
  var tick=Math.floor(now/60000);
  var jsonOk=function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};

  // Satellite hotspots + regions (same site, written by the FIRMS GitHub Action). Missing files: keep sample candidates.
  if(!fresh('tSat'))Promise.all([fetch('data/regions.json?t='+Math.floor(tick/1440)).then(jsonOk).catch(function(){return null;}),
               fetch('data/hotspots.json?t='+tick).then(jsonOk).catch(function(){return null;})]).then(function(r){
    if(r[0]){var g=buildGeo(r[0]);if(g.length)window.__wfGeoStates=g;}
    if(r[1]&&r[0]){window.__wfLiveCands=buildCands(r[1]);}
    if(r[0]&&r[1])save('tSat');
  });

  // US: NIFC. Failure keeps the previous US fires.
  if(!fresh('tUS')){
    var q='where='+encodeURIComponent("IncidentTypeCategory='WF'")+'&outFields=IncidentName,POOState,POOCounty,IncidentSize,PercentContained,FireDiscoveryDateTime,UniqueFireIdentifier&returnGeometry=true&outSR=4326&resultRecordCount=2000&f=geojson';
    // ask for the personnel count too; if the service doesn't know that field, ask again without it
    var q2=q.replace('UniqueFireIdentifier','UniqueFireIdentifier,TotalIncidentPersonnel,FireBehaviorGeneral,FireCause,ContainmentDateTime,ControlDateTime,FireOutDateTime,ModifiedOnDateTime_dt');
    fetch(US_URL+'?'+q2).then(jsonOk).then(function(js){return js&&js.error?fetch(US_URL+'?'+q).then(jsonOk):js;}).then(buildUS).then(function(rows){publishPart('US',rows);})
      .catch(function(e){console.warn('[live fires] US feed failed',e);});
  }
  // Portugal: the site's own snapshot (refreshed by a GitHub Action every ~10 min), falling back to the live feed.
  // Failure keeps the previous Portugal fires.
  if(!fresh('tPT')){
    fetch('data/pt-fires.json?t='+tick).then(jsonOk).then(function(js){if(!js||!(js.data||[]).length)throw new Error('empty');return js;})
      .catch(function(){return fetch(PT_URL).then(jsonOk);})
      .then(buildPT).then(function(rows){publishPart('PT',rows);})
      .catch(function(e){console.warn('[live fires] Portugal feed failed',e);});
  }
  if(!fresh('tCAN')){
    fetch('data/bc-fires.json?t='+tick).then(jsonOk).then(buildBC).then(function(rows){publishPart('CAN',rows);})
      .catch(function(e){console.warn('[live fires] British Columbia feed failed',e);});
  }
})();
