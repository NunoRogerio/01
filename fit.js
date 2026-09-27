// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
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
// Loading screen: the logo's flame catching fire on a loop, the name underneath, until the screen has
// drawn and (on the data screens) the live fires and satellite candidates are in. Never shows empty states.
(function(){
  var needsData=/(Main|Alert|Drone|Dispatch)\.dc\.html/.test(location.pathname)||/\/$/.test(location.pathname);
  var F='M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z',G='M12 21.3V24M5.2 25.2Q12 23.3 18.8 23.8';
  var st=document.createElement('style');
  st.textContent='#wf-load{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#F2F2F7;transition:opacity .3s ease}'+
    '#wf-load.out{opacity:0;pointer-events:none}'+
    '#wf-load .in{display:flex;flex-direction:column;align-items:center;gap:22px;opacity:0;animation:wfin .4s ease .25s forwards}'+
    '@keyframes wfin{to{opacity:1}}'+
    '@keyframes wfburn{0%,12%{opacity:0}45%,62%{opacity:1}100%{opacity:0}}'+
    '@keyframes wfsweep{from{background-position:120% 0}to{background-position:-120% 0}}'+
    '#wf-load .fire{animation:wfburn 1.8s ease-in-out infinite}'+
    '#wf-load .name{font:600 20px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;letter-spacing:.02em;'+
      'background:linear-gradient(90deg,#8E8E93 0%,#8E8E93 40%,#E8590C 50%,#8E8E93 60%,#8E8E93 100%);background-size:250% 100%;'+
      '-webkit-background-clip:text;background-clip:text;color:transparent;animation:wfsweep 1.8s linear infinite}'+
    '#wf-load .sub{font:400 15px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#8E8E93}'+
    /* cold start: an aerial forest behind the logo */
    '#wf-load .bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.06);transition:opacity .7s ease,transform 6s ease-out}'+
    '#wf-load .bg.on{opacity:1;transform:scale(1)}'+
    '#wf-load .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.05) 35%,rgba(0,0,0,.25) 60%,rgba(0,0,0,.62) 100%);opacity:0;transition:opacity .7s ease}'+
    '#wf-load.photo .shade{opacity:1}#wf-load .in{position:relative}'+
    '#wf-load.photo .name{background:none;color:#FFFFFF;animation:none;text-shadow:0 1px 12px rgba(0,0,0,.45)}'+
    '#wf-load.photo .sub{color:rgba(255,255,255,.85);text-shadow:0 1px 8px rgba(0,0,0,.5)}'+
    '#wf-load.photo .base{fill:#FFFFFF}#wf-load.photo .ground{stroke:#FFFFFF}#wf-load.photo svg{filter:drop-shadow(0 2px 10px rgba(0,0,0,.35))}'+
    '#wf-load .cap{position:absolute;left:0;right:0;bottom:calc(28px + env(safe-area-inset-bottom));text-align:center;font:400 13px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:rgba(255,255,255,.8);opacity:0;transition:opacity .7s ease .3s}'+
    '#wf-load.photo .cap{opacity:1}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='wf-load';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML='<div class="bg"></div><div class="shade"></div><div class="in"><svg width="74" height="90" viewBox="3.4 5 17.2 20.9" aria-hidden="true" style="overflow:visible">'+
    '<defs><radialGradient id="wfLoadFire" cx="0.5" cy="0.85" r="0.75"><stop offset="0" stop-color="#FFE066"/><stop offset="0.35" stop-color="#FFA41B"/><stop offset="0.7" stop-color="#FF5A1F"/><stop offset="1" stop-color="#D7263D"/></radialGradient></defs>'+
    '<path class="base" fill="#8E8E93" fill-rule="evenodd" d="'+F+'"/><path class="fire" fill="url(#wfLoadFire)" fill-rule="evenodd" d="'+F+'"/>'+
    '<path class="ground" d="'+G+'" fill="none" stroke="#8E8E93" stroke-width="1.1" stroke-linecap="round"/></svg>'+
    '<span class="name">Forest Fire Watch</span><span class="sub">Loading live data</span></div><div class="cap"></div>';
  (document.body||document.documentElement).appendChild(el);
  var t0=Date.now(),minMs=0;
  // Cold start (first screen of a new app session): show one of the forest photos shipped with the app,
  // a different one each time, for at least ~1.6 s. Screen-to-screen changes keep the plain logo.
  var PH=[['forest-1.webp','Forest canopy from above','Mari Potter'],['forest-2.webp','Green canopy from above','Dave Hoefler'],['forest-3.webp','Conifer forest from above','Ivan Dimitrov'],
    ['forest-4.webp','Dense canopy from above','Olena Bohovyk'],['forest-5.webp','Misty treetops from above','Axel Czikora'],['forest-6.webp','Forest from the air','John Vowles']];
  var cold=false;try{cold=!sessionStorage.getItem('wf-cold');sessionStorage.setItem('wf-cold','1');}catch(e){}
  var nxt=0;try{nxt=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;}catch(e){}
  if(cold){
    var ph=PH[nxt],im=new Image(),bg=el.querySelector('.bg');
    im.onload=function(){if(!el.parentNode)return;bg.style.backgroundImage='url(assets/splash/'+ph[0]+')';el.className='photo';el.querySelector('.cap').textContent=ph[1]+' · Photo: '+ph[2]+' / Unsplash';requestAnimationFrame(function(){bg.className='bg on';});};
    im.src='assets/splash/'+ph[0];minMs=1600;
    try{localStorage.setItem('wf-splash-i',String((nxt+1)%PH.length));}catch(e){}
  }
  function drawn(){var r=document.getElementById('dc-root');return !!(r&&r.firstElementChild&&r.getBoundingClientRect().height>0&&r.textContent.trim().length>20);}
  function haveData(){return !needsData||!window.__wfLiveMap||((window.__wfLiveCands||window.__wfSatDone)&&window.__wfLiveFires);}
  (function tick(){
    if((drawn()&&haveData()&&Date.now()-t0>=minMs)||Date.now()-t0>15000){el.className+=' out';setTimeout(function(){el.remove();
      // warm the next photo into the cache for the next cold start
      try{var n=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;(new Image()).src='assets/splash/'+PH[n][0];}catch(e){}},350);return;}
    setTimeout(tick,80);
  })();
})();

