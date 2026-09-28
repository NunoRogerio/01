// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Scale the 390×844 phone screen to fill whatever phone opens it.
// The designs keep a blank strip at the top for the status bar. The phone already reserves its own
// status bar (Safari and the home-screen app), so that strip is cropped here: the app then fills the
// screen edge to edge and nothing ever sits under the camera or the status bar.
// Screens that declare <meta name="wf-layout" content="fluid"> fill any screen instead: they read the
// screen size from window.__wfVP ({w, h, land, s, sl, sr}, in design pixels) and re-render on 'wf-vp'.
// Scale: the short side of the screen maps to 390 design pixels (so text stays phone-sized), up to 1.6×
// on large screens such as a TV. The other screens keep the fixed 390×844 phone frame for now.
(function(){
  var W=390,H=844,TOP=52,VH=H-TOP,MAXS=1.6;
  var m=document.querySelector('meta[name="wf-layout"]'),fluid=!!(m&&m.getAttribute('content')==='fluid');
  // The eye blinks every 8 s: the upper lid comes down to the lower one and opens again
  var BLINK='<animate attributeName="d" dur="8s" begin="1.5s" repeatCount="indefinite" keyTimes="0;0.955;0.972;0.992;1" values="M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z;M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z;M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 17.3 15.8 15.8Q12 17.6 8.2 15.8Z;M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z;M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z" calcMode="spline" keySplines="0 0 1 1;.4 0 .6 1;.4 0 .6 1;0 0 1 1"></animate>';
  var st=document.createElement('style');
  st.textContent='html,body{background:#F2F2F7;overflow:hidden;height:100%;margin:0;overscroll-behavior:none}'+
    '#dc-root{zoom:var(--fit,1);width:var(--wf-w,'+W+'px);height:var(--wf-h,'+H+'px);margin:0 auto;overflow:hidden;position:relative;top:-'+TOP+'px}';
  document.head.appendChild(st);
  var probe=null;
  function insets(){
    try{
      if(!probe){probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)';(document.body||document.documentElement).appendChild(probe);}
      var cs=getComputedStyle(probe);return [parseFloat(cs.paddingLeft)||0,parseFloat(cs.paddingRight)||0];
    }catch(e){return [0,0];}
  }
  var last='';
  function fit(){
    var iw=window.innerWidth,ih=window.innerHeight,r=document.documentElement.style,s,vp;
    if(fluid){
      s=Math.min(Math.min(iw,ih)/W,MAXS);
      var ins=insets();
      vp={w:Math.round(iw/s),h:Math.round(ih/s)+TOP,land:iw>ih,s:s,sl:Math.round(ins[0]/s),sr:Math.round(ins[1]/s)};
      r.setProperty('--wf-w',vp.w+'px');r.setProperty('--wf-h',vp.h+'px');
    }else{
      s=Math.min(iw/W,ih/VH);
      vp={w:W,h:H,land:false,s:s,sl:0,sr:0};
    }
    r.setProperty('--fit',String(s));
    window.__wfVP=vp;
    var key=vp.w+'x'+vp.h+':'+vp.sl+':'+vp.sr;
    if(key!==last){var first=!last;last=key;if(!first)try{window.dispatchEvent(new Event('wf-vp'));}catch(e){}}
  }
  fit();
  var t=0;function later(){fit();clearTimeout(t);t=setTimeout(fit,350);}
  window.addEventListener('resize',later);window.addEventListener('orientationchange',later);
  document.addEventListener('DOMContentLoaded',fit);
})();
// Crash guard: if the last screen died without closing normally (Safari's "A problem repeatedly occurred"),
// forget the area and screen it was showing, so the app reopens on the default view instead of crashing again.
(function(){
  var K='wf-alive';
  try{
    if(sessionStorage.getItem(K)||localStorage.getItem(K)){['wf-scope','wf-nav','wf-list','wf-fireview','wf-focus'].forEach(function(k){sessionStorage.removeItem(k);});}
    var on=function(){try{sessionStorage.setItem(K,'1');localStorage.setItem(K,'1');}catch(e){}};
    var off=function(){try{sessionStorage.removeItem(K);localStorage.removeItem(K);}catch(e){}};
    on();
    window.addEventListener('pagehide',off);window.addEventListener('pageshow',on);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')off();else on();});
  }catch(e){}
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
      // Screens loaded inside other screens (the map) and the scripts keep their plain address, so refresh
      // the phone's copy of every file first; otherwise the new page could still run an old map.
      var F=['Login.dc.html','Main.dc.html','Alert.dc.html','Drone.dc.html','Dispatch.dc.html','TerrainMap.dc.html','Report.dc.html','ReportSent.dc.html','SimSetup.dc.html','SimPlay.dc.html','fit.js','i18n.js','prefs.js','live.js','support.js','Station.dc.html'];
      var go=function(){location.replace(u);};
      Promise.race([Promise.all(F.map(function(f){return fetch(f,{cache:'reload'}).catch(function(){});})),new Promise(function(r){setTimeout(r,6000);})]).then(go,go);
    }).catch(function(){});
  }
  check();
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
})();
// Loading screen: the logo in hi-vis yellow, still (no animation), the name underneath, until the screen has
// drawn and (on the data screens) the live fires and satellite candidates are in. Never shows empty states.
(function(){
  var needsData=/(Main|Alert|Drone|Dispatch|Station)\.dc\.html/.test(location.pathname)||/\/$/.test(location.pathname);
  var F='M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z',G='M12 21.3V24M5.2 25.2Q12 23.3 18.8 23.8';
  var st=document.createElement('style');
  st.textContent='@view-transition{navigation:auto}#wf-load{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#F2F2F7;transition:opacity .3s ease}'+
    '#wf-load.out{opacity:0;pointer-events:none}'+
    '#wf-load .in{display:flex;flex-direction:column;align-items:center;gap:22px;opacity:0;animation:wfin .4s ease .25s forwards}'+
    '@keyframes wfin{to{opacity:1}}'+
    '@keyframes wfburn{0%,12%{opacity:0}45%,62%{opacity:1}100%{opacity:0}}'+
    '@keyframes wfsweep{from{background-position:120% 0}to{background-position:-120% 0}}'+
    '#wf-load .name{font:600 20px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;letter-spacing:.02em;'+
      'background:linear-gradient(90deg,#8E8E93 0%,#8E8E93 40%,#E8590C 50%,#8E8E93 60%,#8E8E93 100%);background-size:250% 100%;'+
      '-webkit-background-clip:text;background-clip:text;color:transparent;animation:wfsweep 1.8s linear infinite}'+
    '#wf-load .sub{font:400 15px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#8E8E93}'+
    /* cold start: an aerial forest behind the logo */
    '#wf-load .bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.06);transition:opacity .7s ease,transform 6s ease-out}'+
    '#wf-load .bg.on{opacity:1;transform:scale(1)}'+
    '#wf-load .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.05) 35%,rgba(0,0,0,.25) 60%,rgba(0,0,0,.62) 100%);opacity:0;transition:opacity .7s ease}'+
    '#wf-load.photo .shade{opacity:1}#wf-load .in{position:relative}'+
    '#wf-load.photo .name{background:none;color:#D7F41A;animation:none;text-shadow:0 1px 12px rgba(0,0,0,.45)}'+
    '#wf-load.photo .sub{color:rgba(255,255,255,.85);text-shadow:0 1px 8px rgba(0,0,0,.5)}'+
    '#wf-load.photo .base{fill:#D7F41A}#wf-load.photo .ground{stroke:#D7F41A}#wf-load.photo svg{filter:drop-shadow(0 2px 10px rgba(0,0,0,.35))}'+
    '#wf-load .cap{position:absolute;left:0;right:0;bottom:calc(28px + env(safe-area-inset-bottom));text-align:center;font:400 13px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:rgba(255,255,255,.8);opacity:0;transition:opacity .7s ease .3s}'+
    '#wf-load.photo .cap{opacity:1}'+
    /* the loading counter, 0% to 100% */
    '#wf-load .pct{margin-top:-14px;font:600 17px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#8E8E93}'+
    '#wf-load.photo .pct{color:#D7F41A;text-shadow:0 1px 8px rgba(0,0,0,.5)}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='wf-load';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  var TPL='<div class="bg"></div><div class="shade"></div><div class="in"><svg width="81" height="99" viewBox="3.4 5 17.2 20.9" aria-hidden="true" style="overflow:visible">'+
    '<path class="base" fill="#D7F41A" fill-rule="evenodd" d="'+F+'">'+BLINK+'</path>'+
    '<path class="ground" d="'+G+'" fill="none" stroke="#D7F41A" stroke-width="1.1" stroke-linecap="round"/></svg>'+
    '<span class="name">Forest Fire Watch</span><span class="sub">Loading live data</span><span class="pct">0%</span></div><div class="cap"></div>';
  el.innerHTML=TPL;
  (document.body||document.documentElement).appendChild(el);
  var PH=[['forest-1.webp','Forest canopy from above','Mari Potter'],['forest-2.webp','Conifer forest from above','Ivan Dimitrov'],['forest-3.webp','Dense canopy from above','Olena Bohovyk']];
  var nxt=0;try{nxt=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;}catch(e){}
  // The black-and-white forest, as the loading screen starts: used by the sign-in screen to hand over without a gap.
  var grayLayer=function(ph){var d=document.createElement('div');d.style.cssText='position:absolute;inset:0;background:url(assets/splash/'+ph[0]+') center/cover;filter:grayscale(1) brightness(.92)';return d;};
  window.__wfSoftOut=function(){
    var o=document.createElement('div');o.id='wf-load';o.className='photo';o.innerHTML=TPL;o.style.opacity='0';o.style.transition='opacity .4s cubic-bezier(.4,0,.2,1)';
    var ph=PH[nxt],b=o.querySelector('.bg');b.appendChild(grayLayer(ph));b.style.transition='none';b.className='bg on';b.style.transform='scale(1)';
    o.querySelector('.in').style.animation='none';o.querySelector('.in').style.opacity='1';o.querySelector('.cap').textContent=ph[1]+' · Photo: '+ph[2]+' / Unsplash';
    document.body.appendChild(o);requestAnimationFrame(function(){requestAnimationFrame(function(){o.style.opacity='1';});});
  };
  var soft=false;try{soft=sessionStorage.getItem('wf-soft')==='1';sessionStorage.removeItem('wf-soft');}catch(e){}
  if(soft){var ss=document.createElement('style');ss.textContent='#wf-load{transition:opacity .4s cubic-bezier(.4,0,.2,1)}#wf-load .in{animation-duration:.8s;animation-delay:.5s}'+
    '#dc-root{opacity:0;transform:scale(1.012);transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}html.wf-in #dc-root{opacity:1;transform:none}';document.head.appendChild(ss);}
  if(soft){try{var ph0=PH[nxt],b0=el.querySelector('.bg');b0.appendChild(grayLayer(ph0));b0.style.transition='none';b0.className='bg on';b0.style.transform='scale(1)';el.className='photo';
    var in0=el.querySelector('.in');in0.style.animation='none';in0.style.opacity='1';el.querySelector('.cap').textContent=ph0[1]+' · Photo: '+ph0[2]+' / Unsplash';}catch(e){}}
  var t0=Date.now(),minMs=0;
  // Cold start (first screen of a new app session): show one of the forest photos shipped with the app,
  // a different one each time, for at least ~1.6 s. Screen-to-screen changes keep the plain logo.
  var cold=false;try{cold=!sessionStorage.getItem('wf-cold');sessionStorage.setItem('wf-cold','1');}catch(e){}
  // The loading screen (logo, 'Loading live data', counter) shows only on opening the app and right after log in.
  // Moving between screens inside the app shows no loading: just a plain surface until the screen has drawn.
  if(!cold&&!soft){el.innerHTML='';el.style.transition='opacity .2s ease';}
  if(soft)minMs=Math.max(minMs,5000);   // right after log in: the loading screen stays at least 5 s
  // Cold start and log in: a forest photo, slowly zooming in, starts in black and white. A wave of colour spreads out
  // from the logo to the screen edges: at its front the photo is more saturated than normal, easing back to normal
  // behind it. When the whole screen is at normal colour, loading is done.
  var wave=null;
  if(cold||soft){
    if(!soft)minMs=Math.max(minMs,4600);
    var ph=PH[nxt],im=new Image(),bg=el.querySelector('.bg');
    var mk=function(f){var d=document.createElement('div');d.className='wl';d.style.cssText='position:absolute;inset:0;background:url(assets/splash/'+ph[0]+') center/cover;filter:'+f;return d;};
    var zoom=document.createElement('div');zoom.style.cssText='position:absolute;inset:0;transform:scale(1);transition:transform 9s cubic-bezier(.2,.6,.3,1);will-change:transform';
    var gray=mk('grayscale(1) brightness(.92)'),norm=mk('none'),hot=mk('saturate(3) contrast(1.08) brightness(1.08)');
    zoom.appendChild(gray);zoom.appendChild(norm);zoom.appendChild(hot);
    im.onload=function(){if(!el.parentNode)return;
      bg.appendChild(zoom);el.className='photo';el.querySelector('.cap').textContent=ph[1]+' · Photo: '+ph[2]+' / Unsplash';
      var sv=el.querySelector('svg').getBoundingClientRect(),cx=sv.left+sv.width/2,cy=sv.top+sv.height/2;
      var W=innerWidth,H=innerHeight,R=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy))+120,band=150;
      var at='circle at '+cx+'px '+cy+'px';
      var paint=function(r){
        var m1='radial-gradient('+at+',#000 '+Math.max(0,r-band)+'px,transparent '+(r-band*0.35)+'px)';
        var m2='radial-gradient('+at+',transparent '+Math.max(0,r-band)+'px,#000 '+(r-band*0.45)+'px,#000 '+(r-18)+'px,transparent '+(r+30)+'px)';
        norm.style.webkitMaskImage=norm.style.maskImage=m1;hot.style.webkitMaskImage=hot.style.maskImage=m2;};
      paint(0);requestAnimationFrame(function(){bg.className='bg on';zoom.style.transform='scale(1.12)';});
      var t1=performance.now(),dur=Math.max(minMs-(Date.now()-t0)-300,2400);
      wave={p:0,done:false};
      (function step(now){
        if(!el.parentNode)return;
        // the wave runs over the minimum time; while live data is still coming it slows and waits short of the edges
        var tp=Math.min(1,(now-t1)/dur),ready=haveData()&&drawn(),goal=ready?tp:Math.min(tp,.82);
        wave.p+=(goal-wave.p)*.25;
        var q=wave.p,e=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;paint(e*(R+band));   // ease in and out
        if(wave.p>.995&&ready&&tp>=1){wave.done=true;paint(R+band*2);return;}
        requestAnimationFrame(step);})(t1);
    };
    im.src='assets/splash/'+ph[0];
    try{localStorage.setItem('wf-splash-i',String((nxt+1)%PH.length));}catch(e){}
  }
  // The counter runs 0% to 100% over the loading time; it waits at 90% while live data is still coming,
  // then finishes, and the screen only fades once it reads 100%.
  var pctEl=el.querySelector('.pct'),pv=0,pctDone=!pctEl;   // no counter between screens: nothing to wait for
  (function count(){
    if(!el.parentNode||!pctEl)return;
    var span=Math.max(minMs,1200),ready=drawn()&&haveData(),goal=Math.min(1,(Date.now()-t0)/span)*100;
    if(!ready||(wave&&!wave.done&&goal>=100))goal=Math.min(goal,ready?99:90);
    // counts in jumps of 2 to 5, about every 1/28 of the loading time, never past where loading has got to
    if(pv<goal){pv=Math.min(goal>=100?100:Math.floor(goal),pv+2+Math.floor(Math.random()*4));}
    if(goal>=100&&pv>=98)pv=100;
    pctEl.textContent=pv+'%';pctDone=pv>=100;
    setTimeout(count,pv>=100?60:Math.max(90,span/28));})();
  function drawn(){var r=document.getElementById('dc-root');return !!(r&&r.firstElementChild&&r.getBoundingClientRect().height>0&&r.textContent.trim().length>20);}
  function haveData(){return !needsData||!window.__wfLiveMap||((window.__wfLiveCands||window.__wfSatDone)&&window.__wfLiveFires);}
  (function tick(){
    if((drawn()&&haveData()&&Date.now()-t0>=minMs&&(!wave||wave.done)&&pctDone)||Date.now()-t0>17000){el.className+=' out';if(soft)document.documentElement.classList.add('wf-in');setTimeout(function(){el.remove();
      // warm the next photo into the cache for the next cold start
      try{var n=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;(new Image()).src='assets/splash/'+PH[n][0];}catch(e){}},soft?450:350);return;}
    setTimeout(tick,80);
  })();
})();

// Lists marked wf-snap scroll and coast exactly like normal, untouched. Only once the motion has come to rest,
// if the top item is left half shown, the list eases to a whole item (80% rule, below).
// The last position of the list always stays reachable.
(function(){
  function stops(L){
    var max=L.scrollHeight-L.clientHeight,out=[],k=L.children,off=parseFloat(L.getAttribute('data-snap-off'))||0;
    for(var i=0;i<k.length;i++){var c=k[i];if(!c.offsetHeight)continue;out.push(Math.max(0,Math.min(max,(c.offsetParent===L?c.offsetTop:c.offsetTop-L.offsetTop)-off)));}
    out.push(max);return out;
  }
  function state(L){if(!L.__sn){L.__sn={raf:0,touch:false,quiet:0,own:false};if(getComputedStyle(L).position==='static')L.style.position='relative';}return L.__sn;}
  function stop(S){if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;S.own=false;}
  function settle(L){
    var S=state(L);if(S.raf||S.touch)return;
    var y=L.scrollTop,T=stops(L);if(!T.length)return;
    // 80% rule: if less than 80% of the top item has scrolled away, bring that item back fully;
    // if more has gone (only its last 20% still shows), move on to the next item. The very end stays reachable.
    T=T.slice().sort(function(a,b){return a-b;});
    var i=0;while(i<T.length-1&&T[i+1]<=y+0.5)i++;
    var a=T[i],b=i<T.length-1?T[i+1]:a,to=(b>a&&(y-a)/(b-a)>0.8)?b:a;
    if(Math.abs(to-y)<1)return;
    var from=y,d=to-from,dur=Math.max(200,Math.min(340,160+2*Math.abs(d))),t0=null;S.own=true;
    function step(now){
      if(S.touch){stop(S);return;}
      if(t0===null)t0=now;var t=Math.min(1,(now-t0)/dur),e=t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;   // gentle ease in and out
      L.scrollTop=from+d*e;
      if(t<1){S.raf=requestAnimationFrame(step);return;}
      L.scrollTop=to;S.raf=0;setTimeout(function(){S.own=false;},60);
    }
    S.raf=requestAnimationFrame(step);
  }
  function rest(L,ms){var S=state(L);clearTimeout(S.quiet);S.quiet=setTimeout(function(){settle(L);},ms);}
  document.addEventListener('touchstart',function(e){var L=e.target&&e.target.closest&&e.target.closest('.wf-snap');if(!L)return;var S=state(L);stop(S);S.touch=true;clearTimeout(S.quiet);},{passive:true,capture:true});
  document.addEventListener('touchend',function(e){var L=e.target&&e.target.closest&&e.target.closest('.wf-snap');if(!L)return;var S=state(L);S.touch=false;rest(L,160);},{passive:true,capture:true});
  document.addEventListener('scroll',function(e){
    var L=e.target;if(!L||!L.classList||!L.classList.contains('wf-snap'))return;var S=state(L);
    if(S.own||S.touch)return;                                   // our own glide, or the finger is still down
    rest(L,140);                                                // wait until the coasting has fully died out
  },{passive:true,capture:true});
})();
// Touch feedback for everything tappable: a soft highlight grows from the finger across the control and fades,
// plus a light tap on the phone (vibration where the browser allows it; on iPhone, the system haptic that
// Safari gives a switch control, which is the only haptic web pages can reach).
(function(){
  var SEL='a[href],button:not([disabled]),[role=button],[role=option],[role=tab],[role=switch],label,summary,.opt,.sqrow';
  var st=document.createElement('style');
  st.textContent='#wf-fx{position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:99998}'+
    '#wf-fx i{position:absolute;border-radius:50%;background:rgba(118,118,128,.22);transform:scale(0);opacity:1;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .35s ease}'+
    '#wf-hap{position:fixed;left:-99px;top:-99px;width:1px;height:1px;opacity:0;pointer-events:none}';
  document.head.appendChild(st);
  var box=null,dot=null,sx=0,sy=0,live=false,hap=null;
  var FIELD='input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),textarea,select,[contenteditable=true]';
  function isField(el){return !!(el&&el.closest&&el.closest(FIELD));}
  // A label that wraps a text field (e.g. a search box) is not a button: no ripple, no haptic, so focus stays in the field
  function skip(t,target){if(isField(target))return true;return t.tagName==='LABEL'&&!!t.querySelector(FIELD)&&!(target.closest&&target.closest('button'));}
  function haptic(){
    try{if(navigator.vibrate&&navigator.vibrate(8))return;}catch(e){}
    var a=document.activeElement;
    try{if(!hap){hap=document.createElement('label');hap.id='wf-hap';hap.setAttribute('aria-hidden','true');var c=document.createElement('input');c.type='checkbox';c.setAttribute('switch','');c.tabIndex=-1;hap.appendChild(c);document.body.appendChild(hap);}hap.click();}catch(e){}
    try{if(isField(a)&&document.activeElement!==a)a.focus({preventScroll:true});}catch(e){}
  }
  function fade(fast){if(!box)return;var b=box,d=dot;box=dot=null;d.style.transition='transform .42s cubic-bezier(.2,.8,.2,1),opacity '+(fast?'.12s':'.35s')+' ease';d.style.opacity='0';setTimeout(function(){b.remove();},fast?150:420);}
  document.addEventListener('pointerdown',function(e){
    var t=e.target&&e.target.closest&&e.target.closest(SEL);if(!t||t.id==='wf-hap'||t.closest('#wf-hap')||skip(t,e.target))return;
    if(t.closest('[role=application]')&&!t.closest('[role=group]'))return;          // map panning stays clean
    fade(true);
    var r=t.getBoundingClientRect();if(r.width<1||r.height<1)return;
    var cs=getComputedStyle(t),k=r.width/(t.offsetWidth||r.width);
    box=document.createElement('div');box.id='wf-fx';
    box.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+(parseFloat(cs.borderTopLeftRadius)||0)*k+'px';
    var x=e.clientX-r.left,y=e.clientY-r.top,R=Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y));
    dot=document.createElement('i');dot.style.cssText='left:'+(x-R)+'px;top:'+(y-R)+'px;width:'+2*R+'px;height:'+2*R+'px';
    box.appendChild(dot);document.body.appendChild(box);sx=e.clientX;sy=e.clientY;live=true;
    requestAnimationFrame(function(){if(dot)dot.style.transform='scale(1)';});
  },{capture:true,passive:true});
  document.addEventListener('pointermove',function(e){if(live&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){live=false;fade(true);}},{capture:true,passive:true});
  document.addEventListener('pointerup',function(){if(live){live=false;setTimeout(function(){fade(false);},120);}},{capture:true,passive:true});
  document.addEventListener('pointercancel',function(){live=false;fade(true);},{capture:true,passive:true});
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest(SEL);if(!t||t.id==='wf-hap'||t.closest('#wf-hap')||skip(t,e.target))return;haptic();},{capture:true});
})();

// Back, everywhere: every back control (data-wf-back) returns to the screen visited just before, as the phone's own
// back would; its link is only used when the app was opened straight on that screen.
(function(){
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('[data-wf-back]');if(!a||e.defaultPrevented)return;   // a screen that handled its own back already
    var ref='';try{ref=document.referrer?new URL(document.referrer).origin:'';}catch(x){}
    if(history.length>1&&ref===location.origin){e.preventDefault();setTimeout(function(){history.back();},0);}
  },false);
  // A screen returned to that no longer applies (its candidate was confirmed or dismissed) steps back once more.
  window.__wfBackOrHome=function(){var ref='';try{ref=document.referrer?new URL(document.referrer).origin:'';}catch(x){}if(history.length>1&&ref===location.origin){history.back();return;}try{location.replace('Main.dc.html');}catch(x){location.href='Main.dc.html';}};
  // coming back (from the phone's cache): screens refresh their live state
  addEventListener('pageshow',function(ev){if(ev.persisted){try{dispatchEvent(new Event('wf-sync'));}catch(x){}}});
})();
