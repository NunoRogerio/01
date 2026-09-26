// Live fires for the prototype.
//  - US: NIFC WFIGS current wildland fire incidents (10 western states in the app)
//  - Portugal: Fogos.pt (relays ANEPC / Proteção Civil occurrences); districts act as "counties"
// Replaces the design's sample fires; ignition candidates stay as sample data.
window.__wfLiveMap = true;   // tells the map to use live web-map tiles
(function(){
  var US_URL='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query';
  var PT_URL='https://api.fogos.pt/v2/incidents/active';
  var STATES=['CA','AZ','OR','NV','NM','WA','ID','CO','UT','MT'];
  var PT_DISTRICTS=['Aveiro','Beja','Braga','Bragança','Castelo Branco','Coimbra','Évora','Faro','Guarda','Leiria','Lisboa','Portalegre','Porto','Santarém','Setúbal','Viana do Castelo','Vila Real','Viseu','Açores','Madeira'];
  var KEY='wf-live-fires-v4', TTL=5*60*1000;

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
      var st=String(p.POOState||'').replace(/^US-/,'');if(STATES.indexOf(st)<0)return;
      var pc=p.PercentContained;if(pc!=null&&pc>=100)return;
      var ac=p.IncidentSize!=null?Math.round(p.IncidentSize).toLocaleString('en-US')+' ac':'';
      var note=(pc!=null?'Contained '+Math.round(pc)+'%':(p.FireDiscoveryDateTime?'Reported '+ago(p.FireDiscoveryDateTime):'Active'))+(ac?' · '+ac:'');
      var xy=toXY(g.coordinates[1],g.coordinates[0]);
      out.push({r:[st,p.POOCounty||'',p.UniqueFireIdentifier||('US-'+out.length),title(p.IncidentName||'Unnamed'),note,xy[0],xy[1]],w:p.IncidentSize||0});
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
      out.push({r:['PT',d,'PT-'+(i.id||out.length),title(i.freguesia||i.concelho||i.location||'Incêndio'),note,xy[0],xy[1]],w:man+air*20});
    });
    return out;
  }
  function publish(rows){
    window.__wfLiveFires=rows;window.__wfWorld=null;
    try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),rows:rows}));}catch(e){}
    try{window.dispatchEvent(new Event('wf-sync'));}catch(e){}
  }

  try{var c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&c.rows)window.__wfLiveFires=c.rows;if(c&&Date.now()-c.t<TTL)return;}catch(e){}

  var q='where='+encodeURIComponent("IncidentTypeCategory='WF'")+'&outFields=IncidentName,POOState,POOCounty,IncidentSize,PercentContained,FireDiscoveryDateTime,UniqueFireIdentifier&returnGeometry=true&outSR=4326&resultRecordCount=2000&f=geojson';
  var us=fetch(US_URL+'?'+q).then(function(r){return r.json();}).then(buildUS).catch(function(e){console.warn('[live fires] US feed failed',e);return null;});
  var jsonOk=function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
  // Portugal: the site's own snapshot (refreshed by a GitHub Action every ~10 min), falling back to the live feed.
  var pt=fetch('data/pt-fires.json?t='+Math.floor(Date.now()/60000)).then(jsonOk).then(function(js){if(!js||!(js.data||[]).length)throw new Error('empty');return js;})
    .catch(function(){return fetch(PT_URL).then(jsonOk);})
    .then(buildPT).catch(function(e){console.warn('[live fires] Portugal feed failed',e);return null;});
  Promise.all([us,pt]).then(function(res){
    if(!res[0]&&!res[1])return;   // both failed: keep cache / sample data
    var prev=window.__wfLiveFires||[];
    var keep=function(ok,isPT){return ok?[]:prev.filter(function(r){return (r[0]==='PT')===isPT;});};
    var all=(res[0]||[]).concat(res[1]||[]).sort(function(a,b){return b.w-a.w;}).map(function(x){return x.r;});
    publish(all.concat(keep(res[0],false),keep(res[1],true)));
  });
})();
