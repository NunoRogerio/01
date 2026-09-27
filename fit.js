// Scale the 390×844 phone screen to fill whatever phone opens it.
// The designs keep a blank strip at the top for the status bar. The phone already reserves its own
// status bar (Safari and the home-screen app), so that strip is cropped here: the app then fills the
// screen edge to edge and nothing ever sits under the camera or the status bar.
(function(){
  var W=390,H=844,TOP=52,VH=H-TOP;
  var st=document.createElement('style');
  st.textContent='html,body{background:#F2F2F7;overflow:hidden;height:100%;margin:0;overscroll-behavior:none}'+
    '#dc-root{zoom:var(--fit,1);width:'+W+'px;height:'+H+'px;margin:0 auto;overflow:hidden;position:relative;top:-'+TOP+'px}';
  document.head.appendChild(st);
  function fit(){
    var s=Math.min(window.innerWidth/W,window.innerHeight/VH);
    document.documentElement.style.setProperty('--fit',String(s));
  }
  fit();window.addEventListener('resize',fit);window.addEventListener('orientationchange',fit);
})();
// Self-update: the home-screen app can keep an old copy for a while. On open and whenever it comes back
// to the front, read version.txt past every cache; if a new version is out, reload onto it once.
(function(){
  var K='wf-app-version';
  function check(){
    fetch('version.txt?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():'';}).then(function(v){
      v=(v||'').trim();if(!v)return;
      var seen='';try{seen=localStorage.getItem(K)||'';}catch(e){}
      if(seen===v)return;
      try{localStorage.setItem(K,v);}catch(e){}
      if(!seen)return;                                  // first run: nothing older to replace
      var u=location.pathname+'?v='+v+location.hash;     // a new address skips the cached page
      location.replace(u);
    }).catch(function(){});
  }
  check();
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
})();

