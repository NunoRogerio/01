// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// Hi-vis accent, chosen by profile: the 3M yellow of firefighters' reflective stripes (#E5FF00) everywhere, and the
// lime yellow of US fire services (#CCFF00) for the California and Nevada profiles. Screens use var(--wf-y) in CSS,
// rgba(var(--wf-y-rgb), a) for tints, and window.__wfY where a real colour value is needed (SVG fills, canvas).
(function(){
  var US={ca:1,nv:1};
  // Toggle tracks when on: the primary colour 4% darker, so the white thumb reads clearly on it (one definition for every toggle)
  window.__wfTogY=function(){var h=(window.__wfY||'#E5FF00').replace('#','');var c=function(i){var v=Math.round(parseInt(h.substr(i,2),16)*0.96);return ('0'+v.toString(16)).slice(-2);};return '#'+c(0)+c(2)+c(4);};
  window.__wfSetY=function(role){var us=!!US[role||''];window.__wfY=us?'#CCFF00':'#E5FF00';
    var d=document.documentElement.style;d.setProperty('--wf-y',window.__wfY);d.setProperty('--wf-y-rgb',us?'204,255,0':'229,255,0');};
  var r='';try{r=localStorage.getItem('wf-role')||'';}catch(e){}
  window.__wfSetY(r);
})();
// Nature photos, one list for the whole app (loading screen, sign in, alert header, chat header, trophy cards, forest
// headers): forests from above (Unsplash), in a random order. Groups are kept for future sets: photos are shown one group
// at a time in turn (never two of the same group in a row), and the photo from each
// group is picked at random; every page gets a new random order. b dims a bright photo so white text keeps its contrast.
(function(){
  var L=[
    {f:"forest-1.webp",g:'forest',by:"Mari Potter",alt:"Forest canopy from above",b:1},
    {f:"forest-2.webp",g:'forest',by:"Ivan Dimitrov",alt:"Conifer forest from above",b:1},
    {f:"forest-3.webp",g:'forest',by:"Olena Bohovyk",alt:"Dense canopy from above",b:1},
    {f:"forest-4.webp",g:'forest',by:"Kristaps Ungurs",alt:"Dense autumn forest from above",b:0.72},
    {f:"forest-5.webp",g:'forest',by:"Olena Bohovyk",alt:"Pine forest from above",b:0.85},
    {f:"forest-6.webp",g:'forest',by:"John O'Nolan",alt:"Forest canopy from above",b:0.8},
    {f:"forest-7.webp",g:'forest',by:"shayd johnson",alt:"Tall conifers from above",b:1},
    {f:"forest-8.webp",g:'forest',by:"Adam Vradenburg",alt:"Dense forest from above",b:0.9}];
  var G=['forest','macro'].filter(function(g){return L.some(function(p){return p.g===g;});});
  var sh=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;};
  // A random order that spreads the groups evenly through it (a smaller group comes round at even intervals, never two
  // of the same group in a row while the other still has photos); the photo taken from a group is random
  var mix=function(){var by={},tot={},got={},out=[],prev='';G.forEach(function(g){by[g]=sh(L.filter(function(p){return p.g===g;}));tot[g]=by[g].length;got[g]=0;});
    var jit={};G.forEach(function(g){jit[g]=Math.random()*.5;});
    while(out.length<L.length){var c=G.filter(function(g){return by[g].length;}),alt=c.filter(function(g){return g!==prev;});
      var pool=c.filter(function(g){return (got[g]+jit[g])/tot[g]<=Math.min.apply(null,c.map(function(h){return (got[h]+jit[h])/tot[h];}))+1e-9;});
      var g=pool.find(function(x){return x!==prev;})||pool[0];
      if(g===prev&&alt.length&&by[g].length<tot[g]*.5)g=alt[0];
      out.push(by[g].shift());got[g]++;prev=g;}
    return out;};
  var last='';try{last=sessionStorage.getItem('wf-photo-first')||'';}catch(e){}
  var P=mix();if(P.length>1&&P[0].f===last)P=P.slice(1).concat(P.slice(0,1));   // a new screen does not open on the photo the last one opened on
  try{sessionStorage.setItem('wf-photo-first',P[0].f);}catch(e){}
  window.__wfPhotoList=L;window.__wfPhotos=P;window.__wfShuffle=sh;window.__wfPhotoMix=mix;
  window.__wfPhotoUrl=function(p){return 'assets/splash/'+p.f;};
  window.__wfPhotoFilter=function(p){return p.b<1?'brightness('+p.b+')':'none';};
  window.__wfPhotoCredit=function(p){return 'Photo: '+p.by+' / Unsplash';};
  // A random photo of a group (the group of the photo it replaces), not one of those given (for cycling layers)
  window.__wfPhotoOther=function(not,g){var c=L.filter(function(p){return (!g||p.g===g)&&(not||[]).indexOf(p.f)<0;});return c[Math.floor(Math.random()*c.length)]||L[0];};
  // Loading screen: its own order kept across launches, so each launch shows a different photo until all have shown
  var byF=function(f){return L.find(function(x){return x.f===f;});};
  window.__wfSplashPH=function(){var p=null;try{p=JSON.parse(localStorage.getItem('wf-splash-perm2')||'null');}catch(e){}
    var ok=p&&p.length===L.length&&p.every(function(f){return !!byF(f);});
    if(!ok){p=mix().map(function(q){return q.f;});try{localStorage.setItem('wf-splash-perm2',JSON.stringify(p));localStorage.setItem('wf-splash-i','0');}catch(e){}}
    return p.map(function(f){var q=byF(f);return [q.f,q.alt,q.by,q.b];});};
  window.__wfSplashNext=function(i){var n=L.length;if(i+1<n){try{localStorage.setItem('wf-splash-i',String(i+1));}catch(e){}return;}
    var cur=byF((window.__wfSplashPH()[i]||[])[0])||{},p;for(var t=0;t<20;t++){p=mix();if(p[0].g!==cur.g)break;}   // the next round starts on another group
    try{localStorage.setItem('wf-splash-perm2',JSON.stringify(p.map(function(q){return q.f;})));localStorage.setItem('wf-splash-i','0');}catch(e){}};
})();
// The logo's eye blinks: the upper lid (curve through y=12) comes down to the lower one and both meet near y=17.4, then open.
window.__wfBlink=function(path,dur){
  if(!path||path.__blinking)return;path.__blinking=true;dur=dur||360;
  var d0=path.getAttribute('d'),t0=null,ease=function(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;};
  var eye=function(k){var up=12+(17.3-12)*k,lo=19.6+(17.6-19.6)*k;return 'M8.2 15.8Q12 '+up.toFixed(2)+' 15.8 15.8Q12 '+lo.toFixed(2)+' 8.2 15.8Z';};
  var base=d0.replace(/M8\.2 15\.8Q.*$/,'');
  (function step(ts){if(t0===null)t0=ts;var x=Math.min(1,(ts-t0)/dur),k=x<.45?ease(x/.45):1-ease((x-.45)/.55);
    path.setAttribute('d',base+eye(k));if(x<1)requestAnimationFrame(step);else{path.setAttribute('d',d0);path.__blinking=false;}})(performance.now());
};
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
  // Resolves true when a new version is being loaded (the loading screen then waits for it, instead of playing on
  // the old page and being cut short by the reload).
  function check(){
    return fetch('version.txt?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():'';}).then(function(v){
      v=(v||'').trim();if(!v)return false;
      var seen='';try{seen=localStorage.getItem(K)||'';}catch(e){}
      if(seen===v)return false;
      // right after log in the loading screen plays out undisturbed; the new version loads next time the app comes back
      var sf=false;try{sf=sessionStorage.getItem('wf-soft')==='1';}catch(e){}if(sf||window.__wfSoftPage)return false;
      try{localStorage.setItem(K,v);}catch(e){}
      if(!seen)return false;                            // first run: nothing older to replace
      window.__wfUpdating=true;
      var u=location.pathname+'?v='+v+location.hash;     // a new address skips the cached page
      // Screens loaded inside other screens (the map) and the scripts keep their plain address, so refresh
      // the phone's copy of every file first; otherwise the new page could still run an old map.
      var F=['Login.dc.html','Main.dc.html','Alert.dc.html','Drone.dc.html','Dispatch.dc.html','TerrainMap.dc.html','fit.js','i18n.js','prefs.js','live.js','support.js','Station.dc.html','Chat.dc.html','chat.js','trophy.js','avatar.js','index.html'];
      // The new page opens as this one would have: the opening loading screen, or the one after log in, plays there once
      var go=function(){try{if(window.__wfColdPage)sessionStorage.removeItem('wf-cold');}catch(e){}location.replace(u);};
      Promise.race([Promise.all(F.map(function(f){return fetch(f,{cache:'reload'}).catch(function(){});})),new Promise(function(r){setTimeout(r,6000);})]).then(go,go);
      return true;
    }).catch(function(){return false;});
  }
  window.__wfUpd=check();
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
})();
// Loading screen: the logo in hi-vis yellow, still (no animation), the name underneath, until the screen has
// drawn and (on the data screens) the live fires and satellite candidates are in. Never shows empty states.
(function(){
  var needsData=/(Main|Alert|Drone|Dispatch|Station)\.dc\.html/.test(location.pathname)||/\/$/.test(location.pathname);
  var F='M12 21.5a6 6 0 0 1-6-6c0-3.6 3-5.4 3.6-9 2.4 1.8 3.6 3.6 3.6 5.4 1.2-1 1.8-2.4 1.8-3.6 1.9 1.9 3 4.3 3 7.2a6 6 0 0 1-6 6ZM8.2 15.8Q12 12 15.8 15.8Q12 19.6 8.2 15.8Z',G='M12 21.3V24M5.2 25.2Q12 23.3 18.8 23.8';
  // One blink on cue: the upper lid comes down to the lower one and opens again (about a third of a second). Drawn frame by
  // frame in script, which every phone shows (iPhone Safari does not reliably animate an SVG path's shape by itself).
  var BLINK='';
  function blink(root){try{var a=(root||document).querySelectorAll('#wf-load path.base');for(var j=0;j<a.length;j++)window.__wfBlink(a[j]);}catch(e){}}
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
    '#wf-load.photo .name{background:none;color:var(--wf-y);animation:none;text-shadow:0 1px 12px rgba(0,0,0,.45)}'+
    '#wf-load.photo .sub{color:rgba(255,255,255,.85);text-shadow:0 1px 8px rgba(0,0,0,.5)}'+
    '#wf-load.photo .base{fill:var(--wf-y)}#wf-load.photo .ground{stroke:var(--wf-y)}#wf-load.photo svg{filter:drop-shadow(0 2px 10px rgba(0,0,0,.35))}'+
    '#wf-load .cap{position:absolute;left:0;right:0;bottom:calc(28px + env(safe-area-inset-bottom));text-align:center;font:400 13px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:rgba(255,255,255,.8);opacity:0;transition:opacity .7s ease .3s}'+
    '#wf-load.photo .cap{opacity:1}'+
    /* the loading counter, 0% to 100% */
    '#wf-load .pct{margin-top:-6px;font:600 51px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#8E8E93}'+
    '#wf-load.photo .pct{color:var(--wf-y);text-shadow:0 1px 8px rgba(0,0,0,.5)}'+
    /* after log in (hand): the sign-in screen's own layout carries on. Logo, name and line of text stay exactly where and
       as big as they were, the line changes to 'Loading live data', the counter takes the fields' place at the centre */
    '#wf-load.hand{display:block}#wf-load.hand .in{position:absolute;inset:0;display:block;opacity:1;animation:none}'+
    '#wf-load.hand .in>svg,#wf-load.hand .name,#wf-load.hand .sub,#wf-load.hand .cap{position:absolute;margin:0;box-sizing:border-box;text-align:center;white-space:nowrap}'+
    '#wf-load.hand svg{filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))}'+
    '#wf-load.hand .name{letter-spacing:.02em;text-shadow:0 1px 10px rgba(0,0,0,.45)}'+
    '#wf-load.hand .sub{display:grid;color:#FFFFFF;text-shadow:0 1px 8px rgba(0,0,0,.5)}#wf-load.hand .sub>span{grid-area:1/1;transition:opacity .45s cubic-bezier(.4,0,.2,1)}'+
    '#wf-load.hand .pct{position:absolute;left:0;right:0;top:50%;margin:0;transform:translateY(-50%);text-align:center;font-size:143px;line-height:1}'+
    '#wf-load.hand .cap{bottom:auto;color:rgba(255,255,255,.72);transition:none}'+
    '#wf-load.hand .shade{background:linear-gradient(180deg,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.12) 30%,rgba(0,0,0,0.28) 62%,rgba(0,0,0,0.62) 100%)}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='wf-load';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  // Screens with a forest photo behind them start on its dark green, never on the light surface (no flash before the photo)
  if(/Login\.dc\.html/.test(location.pathname)||/\/(01\/)?(index\.html)?$/.test(location.pathname)){el.style.background='#1E2B22';try{document.documentElement.style.background='#1E2B22';}catch(e){}}
  var TPL='<div class="bg"></div><div class="shade"></div><div class="in"><svg width="81" height="99" viewBox="3.4 5 17.2 20.9" aria-hidden="true" style="overflow:visible">'+
    '<path class="base" style="fill: var(--wf-y)" fill-rule="evenodd" d="'+F+'">'+BLINK+'</path>'+
    '<path class="ground" d="'+G+'" fill="none" stroke="'+(window.__wfY||'#E5FF00')+'" stroke-width="1.1" stroke-linecap="round"/></svg>'+
    '<span class="name">Forest Fire Watch</span><span class="sub">Loading live data</span><span class="pct">0%</span></div><div class="cap"></div>';
  el.innerHTML=TPL;
  (document.body||document.documentElement).appendChild(el);
  var PH=window.__wfSplashPH();
  // Sign in hands its photo over (which photo, and how far it had zoomed): the loading screen carries on with that very
  // photo from that zoom at the same steady pace, so the picture never jumps. RATE: the slideshow's zoom per second.
  var RATE=0.3/18,HAND=null;try{HAND=JSON.parse(sessionStorage.getItem('wf-soft-photo')||'null');}catch(e){}
  var handPH=function(h){var q=h&&(window.__wfPhotoList||[]).find(function(x){return x.f===h.f;});return q?[q.f,q.alt,q.by,q.b]:null;};
  var handS=function(h){return h?h.s+RATE*Math.max(0,Date.now()-h.t)/1000:1;};
  var nxt=0;try{nxt=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;}catch(e){}
  // The black-and-white forest, as the loading screen starts: used by the sign-in screen to hand over without a gap.
  var grayLayer=function(ph){var d=document.createElement('div');d.style.cssText='position:absolute;inset:0;background:url(assets/splash/'+ph[0]+') center/cover;filter:saturate(.25) brightness('+(0.8*(ph[3]||1)).toFixed(2)+')';return d;};   // slightly dimmer, most colour gone
  // Places the loading screen's logo, name, line of text and credit exactly where sign in had them (lay, measured there)
  var LOADTXT='Loading live data';
  var handLayout=function(o,lay,first){if(!lay)return false;o.classList.add('hand');
    var put=function(n,r){if(!n||!r)return;n.style.left=r[0]+'px';n.style.top=r[1]+'px';n.style.width=r[2]+'px';n.style.height=r[3]+'px';if(r[4]){n.style.fontSize=r[4]+'px';n.style.lineHeight=r[3]+'px';}};
    put(o.querySelector('.in>svg'),lay.logo);put(o.querySelector('.name'),lay.name);put(o.querySelector('.cap'),lay.cred);
    var sb=o.querySelector('.sub');if(sb&&lay.sub){put(sb,lay.sub);sb.innerHTML='';var a=document.createElement('span'),b=document.createElement('span');a.textContent=lay.sub[5]||'';b.textContent=LOADTXT;
      if(first){b.style.opacity='0';sb.appendChild(a);sb.appendChild(b);setTimeout(function(){a.style.opacity='0';b.style.opacity='1';},60);}   // the line changes softly
      else{sb.appendChild(b);}}
    var cp=o.querySelector('.cap');if(cp&&lay.cred)cp.textContent=lay.cred[5]||'';
    return true;};
  var LAY=null;try{LAY=JSON.parse(sessionStorage.getItem('wf-soft-layout')||'null');}catch(e){}
  window.__wfSoftOut=function(){
    var H0=window.__wfSoftPhoto||null;if(H0){try{sessionStorage.setItem('wf-soft-photo',JSON.stringify(H0));}catch(e){}}
    var L0=window.__wfSoftLayout||null;if(L0){try{sessionStorage.setItem('wf-soft-layout',JSON.stringify(L0));}catch(e){}}
    var o=document.createElement('div');o.id='wf-load';o.className='photo';o.innerHTML=TPL;o.style.opacity='0';o.style.transition='opacity .5s cubic-bezier(.4,0,.2,1)';
    var ph=handPH(H0)||PH[nxt],b=o.querySelector('.bg'),s0=handS(H0),z0=document.createElement('div');z0.style.cssText='position:absolute;inset:0;transform:scale('+s0+');transition:transform 30s linear';z0.appendChild(grayLayer(ph));b.appendChild(z0);b.style.transition='none';b.className='bg on';b.style.transform='none';requestAnimationFrame(function(){z0.style.transform='scale('+(s0+RATE*30)+')';});
    o.querySelector('.in').style.animation='none';o.querySelector('.in').style.opacity='1';o.querySelector('.cap').textContent=ph[1]+' · Photo: '+ph[2]+' / Unsplash';
    if(handLayout(o,L0,true)){var pc0=o.querySelector('.pct');if(pc0)pc0.textContent='0%';}
    document.body.appendChild(o);requestAnimationFrame(function(){requestAnimationFrame(function(){o.style.opacity='1';});});
  };
  // The loading screen shows only right after tapping Log in (the sign-in screen hands its layout over). Anything else
  // (a reload for a new version, a notification, a chat message, reopening the app) goes straight to the screen.
  var soft=false;try{soft=sessionStorage.getItem('wf-soft')==='1'&&!!LAY;sessionStorage.removeItem('wf-soft');}catch(e){}
  if(!soft){try{sessionStorage.removeItem('wf-soft-layout');sessionStorage.removeItem('wf-soft-photo');}catch(e){}}
  if(soft){var ss=document.createElement('style');ss.textContent='#wf-load{transition:opacity .8s cubic-bezier(.4,0,.2,1)}#wf-load .in{animation-duration:.8s;animation-delay:.5s}'+
    '#dc-root{opacity:0;transform:scale(1.012);transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}html.wf-in #dc-root{opacity:1;transform:none}';document.head.appendChild(ss);}
  var ZOOM=null,PHS=soft?handPH(HAND):null;try{sessionStorage.removeItem('wf-soft-photo');}catch(e){}
  if(soft){try{var ph0=PHS||PH[nxt],b0=el.querySelector('.bg'),s1=handS(HAND);ZOOM=document.createElement('div');ZOOM.style.cssText='position:absolute;inset:0;transform:scale('+s1+');transition:transform 30s linear;will-change:transform';
    ZOOM.appendChild(grayLayer(ph0));b0.appendChild(ZOOM);b0.style.transition='none';b0.className='bg on';b0.style.transform='none';el.className='photo';requestAnimationFrame(function(){ZOOM.style.transform='scale('+(s1+RATE*30)+')';});
    var in0=el.querySelector('.in');in0.style.animation='none';in0.style.opacity='1';el.querySelector('.cap').textContent=ph0[1]+' · Photo: '+ph0[2]+' / Unsplash';
    handLayout(el,LAY,false);try{sessionStorage.removeItem('wf-soft-layout');}catch(e){}
    try{var dk=document.createElement('style');dk.id='wf-dark';dk.textContent='html,body{background:#1E2B22!important}';document.head.appendChild(dk);var tc=document.querySelector('meta[name=theme-color]');if(tc){tc.__c=tc.content;tc.content='#1E2B22';}}catch(e){}}catch(e){}}
  var t0=Date.now(),minMs=0;
  // Cold start (first screen of a new app session): show one of the forest photos shipped with the app,
  // a different one each time, for at least ~1.6 s. Screen-to-screen changes keep the plain logo.
  var cold=false;try{cold=!sessionStorage.getItem('wf-cold');sessionStorage.setItem('wf-cold','1');}catch(e){}
  // Opening the app goes straight to its first screen: no opening animation (the loading screen stays only after log in)
  cold=false;
  window.__wfColdPage=cold;window.__wfSoftPage=soft;
  // The loading screen (logo, 'Loading live data', counter) shows only on opening the app and right after log in.
  // Moving between screens inside the app shows no loading: just a plain surface until the screen has drawn.
  if(!cold&&!soft){el.innerHTML='';el.style.transition='opacity .2s ease';}
  // Opening the app: just the logo and its animation (no 'Loading live data', no counter); the counter stays for log in.
  if(cold&&!soft){var sb=el.querySelector('.sub'),pc=el.querySelector('.pct');if(sb)sb.remove();if(pc)pc.remove();}
  if(soft)minMs=Math.max(minMs,3500);   // right after log in: the loading screen stays at least 3.5 s
  // Cold start and log in: a forest photo, slowly zooming in, starts in black and white. A wave of colour spreads out
  // from the logo to the screen edges: at its front the photo is more saturated than normal, easing back to normal
  // behind it. When the whole screen is at normal colour, loading is done.
  var wave=null;
  if(cold||soft){
    if(!soft)minMs=Math.max(minMs,4600);
    var ph=(soft&&PHS)||PH[nxt],im=new Image(),bg=el.querySelector('.bg');
    var mk=function(f){var d=document.createElement('div');d.className='wl';d.style.cssText='position:absolute;inset:0;background:url(assets/splash/'+ph[0]+') center/cover;filter:'+(ph[3]<1?f.replace('none','')+' brightness('+ph[3]+')':f);return d;};
    // one steady zoom-in for the whole loading screen (after log in it is the one already running, carried on from sign in)
    var zoom=ZOOM||document.createElement('div');if(!ZOOM)zoom.style.cssText='position:absolute;inset:0;transform:scale(1);transition:transform 30s linear;will-change:transform';
    var gray=mk('saturate(.25) brightness(.8)'),norm=mk('none'),hot=mk('saturate(1.6) contrast(1.03) brightness(1.03)');
    zoom.appendChild(gray);zoom.appendChild(hot);zoom.appendChild(norm);
    im.onload=function(){if(!el.parentNode)return;
      if(!ZOOM)bg.appendChild(zoom);el.classList.add('photo');if(!el.classList.contains('hand'))el.querySelector('.cap').textContent=ph[1]+' · Photo: '+ph[2]+' / Unsplash';
      var sv=el.querySelector('svg').getBoundingClientRect(),cx=sv.left+sv.width/2,cy=sv.top+sv.height/2;
      if(el.classList.contains('hand')){cx=innerWidth/2;cy=innerHeight/2;}   // after log in: from the centre, behind the counter
      var W=innerWidth,H=innerHeight,R=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy)),band=75;   // R: the farthest screen corner from the logo
      // The colour wave: an organic, rounded but irregular front that keeps changing shape as it spreads out. It is the
      // union of a few soft discs whose centres drift around the logo and whose radii breathe; the saturated band at the
      // front is thin (about half the old width) and twice as soft, so it reads as a glow rather than a line. The glow layer
      // sits under the normal-colour layer, so the band keeps an even width along the whole irregular front.
      var LOB=[0,1,2,3,4].map(function(k){return {a:k/5*Math.PI*2+Math.random()*.9,w:.3+Math.random()*.3,v:.35+Math.random()*.4,p:Math.random()*6.28,q:Math.random()*6.28,s:(Math.random()<.5?-1:1)};});
      // Points along the screen's edges: the counter reads how far the full colour has got towards the last of them,
      // so it says 100% exactly when the colour has reached the whole screen (both end together)
      var EDGE=[];(function(){var n=Math.ceil(W/40),m=Math.ceil(H/40),i;for(i=0;i<=n;i++){EDGE.push([W*i/n,0],[W*i/n,H]);}for(i=1;i<m;i++){EDGE.push([0,H*i/m],[W,H*i/m]);}})();
      var cov0=0;
      var paint=function(r){
        var t=performance.now()/1000,m1=[],m2=[],C=[];
        LOB.forEach(function(L){
          var off=Math.min(90,r*.07+4),ang=L.a+L.s*t*.2+Math.sin(t*L.w+L.p)*.5;   // centres wander around the logo
          var x=cx+Math.cos(ang)*off*(.6+.4*Math.sin(t*L.v+L.q)),y=cy+Math.sin(ang)*off*(.6+.4*Math.cos(t*L.w+L.p));
          var rr=Math.max(0,r*(.965+.025*Math.sin(t*L.v+L.p))),at='circle at '+x.toFixed(1)+'px '+y.toFixed(1)+'px';
          C.push([x,y,Math.max(0,rr-band*1.05)]);   // where the colour reads as full (inside the soft edge), so the count ends just after the colour does
          m1.push('radial-gradient('+at+',#000 '+Math.max(0,rr-band*1.45)+'px,rgba(0,0,0,.5) '+Math.max(0,rr-band*1)+'px,transparent '+Math.max(1,rr-band*.5)+'px)');   // normal colour behind the front
          m2.push('radial-gradient('+at+',#000 '+Math.max(0,rr-band*.15)+'px,rgba(0,0,0,.5) '+Math.max(0,rr+band*.3)+'px,transparent '+Math.max(1,rr+band*.75)+'px)');   // the saturated glow reaching just past it
        });
        norm.style.webkitMaskImage=norm.style.maskImage=m1.join(',');hot.style.webkitMaskImage=hot.style.maskImage=m2.join(',');
        var worst=0;for(var i=0;i<EDGE.length;i++){var e=EDGE[i],d=1e9;for(var j=0;j<C.length;j++){var g=Math.hypot(e[0]-C[j][0],e[1]-C[j][1])-C[j][2];if(g<d)d=g;}if(d>worst)worst=d;}
        cov0=Math.max(cov0,Math.min(1,1-worst/R));if(wave)wave.cov=cov0;};
      paint(0);requestAnimationFrame(function(){bg.className='bg on';if(!ZOOM)zoom.style.transform='scale('+(1+RATE*30)+')';});
      // The wave spreads steadily with time over the loading time; the counter reads its progress, so both stay in step.
      // While live data is still coming it glides to a stop short of the edges, then carries on; every change of pace
      // is smoothed over about a quarter of a second, so it never stutters.
      var t1=performance.now(),dur=Math.max(minMs-(Date.now()-t0),2000),last=t1;
      wave={p:0,done:false};
      (function step(now){
        if(!el.parentNode)return;
        var tp=Math.min(1,(now-t1)/dur),ready=haveData()&&drawn(),goal=ready?tp:Math.min(tp,.88),dt=Math.min(64,now-last);last=now;
        wave.p+=(goal-wave.p)*(1-Math.exp(-dt/220));
        // in step with the counter: at n% the front has covered n% of the way to the farthest corner, and at 100% the
        // normal colour has just reached every corner (the shape's smallest lobe included)
        var q=Math.min(1,wave.p);paint(q*(R+band*1.5)/.94);
        if(((wave.cov||0)>=1||wave.p>.995)&&ready){wave.p=1;wave.cov=1;wave.done=true;wave.at=Date.now();norm.style.webkitMaskImage=norm.style.maskImage='none';return;}
        requestAnimationFrame(step);})(t1);
    };
    var start=function(up){if(!up&&!im.src)im.src='assets/splash/'+ph[0];};
    Promise.race([window.__wfUpd||Promise.resolve(false),new Promise(function(r){setTimeout(function(){r(false);},1200);})]).then(start,function(){start(false);});
    window.__wfSplashNext(nxt);
  }
  // The counter runs 0% to 100% over the loading time; it waits at 90% while live data is still coming,
  // then finishes, and the screen only fades once it reads 100%.
  var pctEl=el.querySelector('.pct'),pv=0,pctDone=!pctEl,blinked65=false;
  /* the flame's eye blinks every 2 s while any loading screen shows (the same rhythm as the map loader) */
  (function(){var bt=setInterval(function(){if(!el.parentNode){clearInterval(bt);return;}blink(el);},2000);})();
  (function count(){
    if(!el.parentNode||!pctEl)return;
    var span=Math.max(minMs,1200),ready=drawn()&&haveData(),goal=Math.min(1,(Date.now()-t0)/span)*100;
    if(!ready)goal=Math.min(goal,90);   // the wave follows the counter, so the counter no longer waits for it
    // counts in jumps of 2 to 5, about every 1/28 of the loading time, never past where loading has got to
    if(wave){pv=wave.done?100:Math.max(pv,Math.min(99,Math.floor((wave.cov||0)*100)));}   // with the colour wave, the counter reads how much of the screen it has reached
    else if((cold||soft)&&Date.now()-t0<2500){pv=0;}   // the photo is still arriving: the count starts with the colour
    else{if(pv<goal){pv=Math.min(goal>=100?100:Math.floor(goal),pv+2+Math.floor(Math.random()*4));}
    if(goal>=100&&pv>=98)pv=100;}
    pctEl.textContent=pv+'%';pctDone=pv>=100;
    setTimeout(count,wave?50:(pv>=100?60:Math.max(90,span/28)));})();
  function drawn(){var r=document.getElementById('dc-root');return !!(r&&r.firstElementChild&&r.getBoundingClientRect().height>0&&r.textContent.trim().length>20);}
  function haveData(){return !needsData||!window.__wfLiveMap||((window.__wfLiveCands||window.__wfSatDone)&&window.__wfLiveFires);}
  (function tick(){
    if(!window.__wfUpdating&&((drawn()&&haveData()&&Date.now()-t0>=minMs&&(!wave||(wave.done&&Date.now()-wave.at>=500))&&pctDone)||Date.now()-t0>17000)){el.className+=' out';if(soft)document.documentElement.classList.add('wf-in');setTimeout(function(){el.remove();if(soft){try{var dk=document.getElementById('wf-dark');if(dk)dk.remove();var tc=document.querySelector('meta[name=theme-color]');if(tc&&tc.__c)tc.content=tc.__c;}catch(e){}}
      // warm the next photo into the cache for the next cold start
      try{var P2=window.__wfSplashPH(),n=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%P2.length;(new Image()).src='assets/splash/'+P2[n][0];}catch(e){}},soft?850:350);return;}
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
    '#wf-fx i{position:absolute;border-radius:50%;background:rgba(118,118,128,.0855);transform:scale(0);opacity:1;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .42s ease}'+
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
    // iPhone (iOS 18+): a web page can only buzz through the system's own switch control. A fresh hidden switch is made,
    // clicked inside the tap and removed at once, the way that is known to work (reusing one element is ignored by iOS).
    try{var l=document.createElement('label');l.id='wf-hap';l.setAttribute('aria-hidden','true');l.style.display='none';var c=document.createElement('input');c.type='checkbox';c.setAttribute('switch','');c.tabIndex=-1;l.appendChild(c);(document.head||document.body).appendChild(l);l.click();l.remove();}catch(e){}
    try{if(isField(a)&&document.activeElement!==a)a.focus({preventScroll:true});}catch(e){}
  }
  // Haptic timed to land later (a toggle thumb clicking into place). Android: one vibration pattern started inside the tap
  // (0 ms on, then a pause, then a short pulse), so it fires on time. iPhone: web pages may only buzz during the tap itself,
  // so it fires on the tap there (the only moment iOS allows).
  function hapticAt(ms){try{if(navigator.vibrate&&navigator.vibrate([0,ms,12]))return;}catch(e){}haptic();}
  window.__wfHapticAt=hapticAt;
  window.__wfHaptic=haptic;   // shared: other parts of the app can give the same tap (e.g. a toggle clicking into place)
  function fade(fast){if(!box)return;var b=box,d=dot;box=dot=null;d.style.transition='transform .5s cubic-bezier(.4,0,.2,1),opacity '+(fast?'.14s':'.42s')+' ease';d.style.opacity='0';setTimeout(function(){b.remove();},fast?180:500);}
  document.addEventListener('pointerdown',function(e){
    var t=e.target&&e.target.closest&&e.target.closest(SEL);if(!t||t.id==='wf-hap'||t.closest('#wf-hap')||skip(t,e.target))return;
    if(t.closest('[role=application]')&&!t.closest('[role=group]'))return;          // map panning stays clean
    fade(true);
    var r=t.getBoundingClientRect();if(r.width<1||r.height<1)return;
    var cs=getComputedStyle(t),k=r.width/(t.offsetWidth||r.width);
    box=document.createElement('div');box.id='wf-fx';
    box.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+(parseFloat(cs.borderTopLeftRadius)||0)*k+'px';
    var x=e.clientX-r.left,y=e.clientY-r.top,R=Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y));
    dot=document.createElement('i');dot.style.cssText='left:'+(x-R)+'px;top:'+(y-R)+'px;width:'+2*R+'px;height:'+2*R+'px;transform:scale('+Math.min(1,24/Math.max(R,1))+')';   // starts as a 48px circle under the finger, then grows to cover the element
    box.appendChild(dot);document.body.appendChild(box);sx=e.clientX;sy=e.clientY;live=true;
    requestAnimationFrame(function(){if(dot)dot.style.transform='scale(1)';});
  },{capture:true,passive:true});
  // iPhone (iOS 26.5+): Safari only buzzes when a real finger taps a real system switch; switches clicked from code are
  // ignored. So when a finger lands on something tappable, an invisible label holding a hidden switch is laid over it for
  // that one tap: the finger's own tap lands on the label (a real tap, so the phone gives its haptic tick) and the tap is
  // then passed on to the element underneath, which behaves exactly as before. Moving the finger (scrolling) removes it.
  var IOS=!navigator.vibrate&&/iP(hone|ad|od)|Macintosh/.test(navigator.userAgent)&&'ontouchend' in document,ov=null,ovT=null,ovX=0,ovY=0;
  function ovOff(){if(ov){var o=ov;ov=null;o.remove();}clearTimeout(ovT);}
  if(IOS){
    document.addEventListener('touchstart',function(e){
      ovOff();if(e.touches.length!==1)return;var p=e.touches[0],tg=e.target;
      var t=tg&&tg.closest&&tg.closest(SEL);if(!t||skip(t,tg)||t.closest('#wf-hapov'))return;
      if(t.closest('[role=application]')&&!t.closest('[role=group]'))return;   // the map pans freely
      var r=t.getBoundingClientRect();if(r.width<1||r.height<1)return;
      var l=document.createElement('label');l.id='wf-hapov';l.setAttribute('aria-hidden','true');
      l.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;z-index:2147483647;opacity:0;-webkit-tap-highlight-color:transparent;margin:0;padding:0';
      var c=document.createElement('input');c.type='checkbox';c.setAttribute('switch','');c.tabIndex=-1;c.style.cssText='position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;margin:0';l.appendChild(c);
      l.__t=t;ovX=p.clientX;ovY=p.clientY;
      l.addEventListener('click',function(ev){
        if(ev.target!==l)return;   // the label's own click (the switch toggles, the phone ticks); the input's echo is ignored
        ev.stopPropagation();var tt=l.__t;ovOff();
        setTimeout(function(){try{window.__wfFwd=true;tt.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:ovX,clientY:ovY}));}finally{window.__wfFwd=false;}},0);
      });
      document.body.appendChild(l);ov=l;ovT=setTimeout(ovOff,1500);
    },{capture:true,passive:true});
    document.addEventListener('touchmove',function(e){if(ov&&e.touches[0]&&Math.hypot(e.touches[0].clientX-ovX,e.touches[0].clientY-ovY)>10)ovOff();},{capture:true,passive:true});
    document.addEventListener('touchcancel',ovOff,{capture:true,passive:true});
    document.addEventListener('scroll',ovOff,{capture:true,passive:true});
  }
  document.addEventListener('pointermove',function(e){if(live&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){live=false;fade(true);}},{capture:true,passive:true});
  document.addEventListener('pointerup',function(){if(live){live=false;setTimeout(function(){fade(false);},120);}},{capture:true,passive:true});
  document.addEventListener('pointercancel',function(){live=false;fade(true);},{capture:true,passive:true});
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest(SEL);if(!t||t.id==='wf-hap'||t.closest('#wf-hap')||t.closest('#wf-hapov')||skip(t,e.target))return;
    if(IOS)return;   // iPhone: the tap itself already ticked through the overlay switch
    if(t.matches('[role=switch]:not(.wf-tog),[data-hap=late]')){hapticAt(215);return;}   // a toggle: the vibration lands with the thumb
    haptic();},{capture:true});
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

// Whole-blade swipe, on every blade of the app:
// - an open blade marked data-swipe="up" (a sheet that drops from the top) or "down" (one that rises from the bottom)
//   follows the finger from anywhere on it, not only its grabber, and a swipe of 60 px (or a quick flick) closes it
//   through its own close control ([data-swipe-go], else its grabber);
// - a collapsed blade marked data-pull="down" or "up" opens with a 22 px drag in that direction from anywhere on it
//   (through its [data-pull-go] control);
// - a blade marked data-pull="toggle" (raises and lowers, its [data-pull-go] control says aria-expanded) is raised by a
//   swipe up and lowered by a swipe down, from anywhere on it.
// Taps are untouched. Rule: the whole-surface swipe only applies to blades with no internal scroll. A blade whose
// content scrolls (a list, a long panel) is swiped by its grabber only, so scrolling up and down never closes it. The page can show the drag itself through window.__wfSwipeDrag(key, dy); otherwise the
// blade is moved directly and settles back smoothly.
(function(){
  var S=null;
  function scroller(t,root){for(var n=t;n;n=n.parentElement){var cs=getComputedStyle(n);if(/(auto|scroll)/.test(cs.overflowY)&&n.scrollHeight>n.clientHeight+1)return n;if(n===root)break;}return null;}
  var SCR='[style*="overflow-y: auto"],[style*="overflow-y: scroll"],[style*="overflow: auto"],[style*="overflow: scroll"],.wf-snap';
  function scrolls(n){var cs=getComputedStyle(n);return /(auto|scroll)/.test(cs.overflowY)&&n.scrollHeight>n.clientHeight+1;}
  function inner(el){var l=el.querySelectorAll(SCR);for(var i=0;i<l.length;i++)if(scrolls(l[i]))return true;return false;}   // any content that scrolls right now
  function own(el){return !(el.getAttribute('data-swipe-key')&&window.__wfSwipeDrag);}
  function paint(el,dy){var k=el.getAttribute('data-swipe-key');if(!own(el))window.__wfSwipeDrag(k,dy);else el.style.translate='0 '+dy+'px';}
  function press(g){if(!g)return;if(g.matches('button,a,[data-swipe-go],[data-pull-go]')&&!g.matches('.wf-grab,[data-pull-go=key]')){g.click();return;}
    try{g.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));}catch(x){}}   // a grabber closes on Enter
  function haptic(){try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}}
  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==1)return;var t=e.target;if(!t||!t.closest)return;
    if(t.closest('.wf-grab,input,textarea,select,[data-noswipe]'))return;   // the grabber keeps its own drag; fields keep theirs
    var el=t.closest('[data-swipe],[data-pull]');if(!el)return;
    if(scroller(t,el)||inner(el))return;   // scrolling content: the grabber alone swipes this blade
    var mode=el.hasAttribute('data-swipe')?'close':'pull',p=e.touches[0];
    S={el:el,mode:mode,dir:el.getAttribute(mode==='close'?'data-swipe':'data-pull'),x:p.clientX,y:p.clientY,t:performance.now(),sc:scroller(t,el),on:false,dy:0,k:1,fired:false};
    try{var r=el.closest('[data-wfroot]');if(r)S.k=r.getBoundingClientRect().width/((window.__wfVP||{}).w||390)||1;}catch(x){}
  },{passive:true,capture:true});
  document.addEventListener('touchmove',function(e){
    if(!S)return;var p=e.touches[0],dx=p.clientX-S.x,dy=p.clientY-S.y;
    if(!S.on){
      if(Math.abs(dy)<10&&Math.abs(dx)<10)return;
      if(Math.abs(dx)>Math.abs(dy)){S=null;return;}                      // sideways: a chip row or a map, not the blade
      var sc=S.sc;
      if(S.mode==='pull'){
        var g0=S.el.querySelector('[data-pull-go]')||S.el,ex=g0.getAttribute('aria-expanded')==='true';
        var want=S.dir==='toggle'?(dy<0?!ex:ex):(S.dir==='down'?dy>0:dy<0);if(!want){S=null;return;}
        if(sc){var atE=dy>0?sc.scrollTop<=0:sc.scrollTop+sc.clientHeight>=sc.scrollHeight-1;if(!atE){S=null;return;}}
      }else{
        var closing=S.dir==='up'?dy<0:dy>0;if(!closing){S=null;return;}
        if(sc){var atEnd=S.dir==='up'?sc.scrollTop+sc.clientHeight>=sc.scrollHeight-1:sc.scrollTop<=0;if(!atEnd){S=null;return;}}
      }
      S.on=true;S.y=p.clientY;S.sdy=dy>0?1:-1;dy=0;
      if(S.mode==='close'&&own(S.el)){S.tr=S.el.style.transition||'';}
    }
    e.preventDefault();
    dy=(p.clientY-S.y)/S.k;
    if(S.mode==='pull'){if(!S.fired&&Math.abs(dy)>22&&(dy>0?1:-1)===S.sdy){S.fired=true;haptic();press(S.el.querySelector('[data-pull-go]'));}return;}
    dy=S.dir==='up'?Math.min(0,dy):Math.max(0,dy);S.dy=dy;paint(S.el,dy);
  },{passive:false,capture:true});
  function swallow(g){var stop=function(ev){if(g&&ev.target===g)return;ev.stopPropagation();ev.preventDefault();};document.addEventListener('click',stop,true);setTimeout(function(){document.removeEventListener('click',stop,true);},350);}
  function end(){
    if(!S)return;var s=S;S=null;if(!s.on)return;
    if(s.mode==='pull'){swallow(null);return;}
    var v=Math.abs(s.dy)/Math.max(1,performance.now()-s.t),go=Math.abs(s.dy)>60||(Math.abs(s.dy)>20&&v>0.5);
    var g=go?(s.el.querySelector('[data-swipe-go]')||s.el.querySelector('.wf-grab')||s.el.querySelector('[role=button][aria-label^="Close"]')):null;
    if(!own(s.el))paint(s.el,0);
    else if(g){setTimeout(function(){s.el.style.translate='';},700);}   // closing: it leaves from where the finger let go
    else{var el=s.el;el.style.transition=(s.tr?s.tr+', ':'')+'translate .35s cubic-bezier(.2,.8,.2,1)';el.style.translate='';setTimeout(function(){el.style.transition=s.tr;},400);}   // not far enough: settles back
    swallow(g);
    if(g){haptic();setTimeout(function(){press(g);},0);}
  }
  document.addEventListener('touchend',end,{capture:true});document.addEventListener('touchcancel',end,{capture:true});
})();
