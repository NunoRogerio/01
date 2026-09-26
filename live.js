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
  var KEY='wf-live-fires-v10', TTL=5*60*1000;

  function toXY(lat,lon){return [Math.round((lon+118.13)*2345+518),Math.round((34.19-lat)*2829+662)];}
  function ago(ms){var m=Math.max(0,Math.round((Date.now()-ms)/60000));if(m<60)return m+' min ago';var h=Math.round(m/60);return h<48?h+'h ago':Math.round(h/24)+'d ago';}
  function title(s){return String(s||'').toLowerCase().replace(/(^|[\s\-\/(])(\S)/g,function(_,a,c){return a+c.toUpperCase();}).replace(/\b(Do|Da|Dos|Das|De|E)\b/g,function(w){return w.toLowerCase();});}
  function plain(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();}
  var DIST={};PT_DISTRICTS.forEach(function(d){DIST[plain(d)]=d;});
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
      out.push({r:[st,p.POOCounty||'',p.UniqueFireIdentifier||('US-'+out.length),title(p.IncidentName||'Unnamed'),note,xy[0],xy[1],res],w:p.IncidentSize||0});
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
      out.push({r:['PT',d,'PT-'+(i.id||out.length),title(i.freguesia||i.concelho||i.location||'Incêndio'),note,xy[0],xy[1],res],w:man+air*20});
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
      out.push({r:['CAN','British Columbia','BC-'+(i.incidentNumberLabel||out.length),title(i.incidentName||i.incidentNumberLabel||'Wildfire'),note,xy[0],xy[1],res],w:ha||0});
    });
    return out;
  }

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
    var q2=q.replace('UniqueFireIdentifier','UniqueFireIdentifier,TotalIncidentPersonnel');
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
