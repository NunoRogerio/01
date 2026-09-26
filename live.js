// Live fires from NIFC WFIGS (current US wildland fire incidents).
// Replaces the design's sample fires; candidates stay as sample data.
(function(){
  var URL='https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query';
  var STATES=['CA','AZ','OR','NV','NM','WA','ID','CO','UT','MT'];
  var KEY='wf-live-fires', TTL=5*60*1000;
  function toXY(lat,lon){return [Math.round((lon+118.13)*2345+518),Math.round((34.19-lat)*2829+662)];}
  function ago(ms){var m=Math.round((Date.now()-ms)/60000);if(m<60)return m+' min ago';var h=Math.round(m/60);return h<48?h+'h ago':Math.round(h/24)+'d ago';}
  function build(fc){
    var out=[];
    (fc.features||[]).forEach(function(f){
      var p=f.properties||{},g=f.geometry;if(!g||!g.coordinates)return;
      var st=String(p.POOState||'').replace(/^US-/,'');if(STATES.indexOf(st)<0)return;
      var pc=p.PercentContained;if(pc!=null&&pc>=100)return;
      var ac=p.IncidentSize!=null?Math.round(p.IncidentSize).toLocaleString('en-US')+' ac':'';
      var note=(pc!=null?'Contained '+Math.round(pc)+'%':(p.FireDiscoveryDateTime?'Reported '+ago(p.FireDiscoveryDateTime):'Active'))+(ac?' · '+ac:'');
      var xy=toXY(g.coordinates[1],g.coordinates[0]);
      out.push([st,p.POOCounty||'',p.UniqueFireIdentifier||('F-'+out.length),(p.IncidentName||'Unnamed').toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase();}),note,xy[0],xy[1],p.IncidentSize||0]);
    });
    out.sort(function(a,b){return b[7]-a[7];});
    return out.map(function(r){return r.slice(0,7);});
  }
  try{var c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&c.rows)window.__wfLiveFires=c.rows;if(c&&Date.now()-c.t<TTL)return;}catch(e){}
  var q='where='+encodeURIComponent("IncidentTypeCategory='WF'")+'&outFields=IncidentName,POOState,POOCounty,IncidentSize,PercentContained,FireDiscoveryDateTime,UniqueFireIdentifier&returnGeometry=true&outSR=4326&resultRecordCount=2000&f=geojson';
  fetch(URL+'?'+q).then(function(r){return r.json();}).then(function(fc){
    var rows=build(fc);
    window.__wfLiveFires=rows;window.__wfWorld=null;
    try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),rows:rows}));}catch(e){}
    try{window.dispatchEvent(new Event('wf-sync'));}catch(e){}
  }).catch(function(e){console.warn('[live fires] failed, using sample data',e);});
})();
