// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// (Oct 7, 19:40) Station profiles (captain, team lead) have their station as their home screen instead of the region map.
function wfHomeUrl(){try{var r=localStorage.getItem('wf-role')||'',c=localStorage.getItem('wf-custom')||'';if(r&&(c==='coord'||c==='ff'))return 'Station.dc.html?home=1';}catch(e){}return 'Main.dc.html';}
(function(){try{if(!/\/Main\.dc\.html$/.test(location.pathname)||/[?&]menu=1/.test(location.search))return;var H=wfHomeUrl();if(H==='Main.dc.html')return;
  /* the main screen still opens for its own panels (notifications, preferences) asked from another screen */
  var S=sessionStorage;if(S.getItem('wf-nt-open')||S.getItem('wf-prefs-open'))return;location.replace(H);}catch(e){}})();
/* (Oct 8) back on the main screen from the browser's memory (after a notification led elsewhere): a station profile goes home */
addEventListener('pageshow',function(e){try{if(!e.persisted||!/\/Main\.dc\.html$/.test(location.pathname)||/[?&]menu=1/.test(location.search))return;var H=wfHomeUrl();if(H!=='Main.dc.html'){sessionStorage.removeItem('wf-panel-return');location.replace(H);}}catch(x){}});
// Hi-vis accent, chosen by profile: the 3M yellow of firefighters' reflective stripes (#E5FF00) everywhere, and the
// lime yellow of US fire services (#CCFF00) for the California and Nevada profiles. Screens use var(--wf-y) in CSS,
// rgba(var(--wf-y-rgb), a) for tints, and window.__wfY where a real colour value is needed (SVG fills, canvas).
(function(){
  var US={ca:1,nv:1};
  // Toggle tracks when on: the primary colour 4% darker, so the white thumb reads clearly on it (one definition for every toggle)
  window.__wfTogY=function(){var h=(window.__wfY||'#E5FF00').replace('#','');var c=function(i){var v=Math.round(parseInt(h.substr(i,2),16)*0.96);return ('0'+v.toString(16)).slice(-2);};return '#'+c(0)+c(2)+c(4);};
  // (Oct 4, 22:58) a primary colour chosen in Appearance (kept on this phone, localStorage wf-primary) replaces the profile's
  window.__wfYDefault=function(role){return US[role||'']?'#CCFF00':'#E5FF00';};
  // (Oct 5) Every primary colour keeps its dark labels (#1C1C1E) at 4.5:1 or more (WCAG AA text). __wfSafeY lifts a colour that
  // falls short towards white, keeping its hue, until it passes (also catches colours picked before the safe picker existed).
  window.__wfContrastY=function(h){var L=function(x){var c=[1,3,5].map(function(i){var v=parseInt(x.substr(i,2),16)/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};return (L(h)+0.05)/(L('#1C1C1E')+0.05);};
  window.__wfSafeY=function(h){h=String(h||'').toUpperCase();if(!/^#[0-9A-F]{6}$/.test(h))return h;var c=[1,3,5].map(function(i){return parseInt(h.substr(i,2),16);}),x=function(){return ('#'+c.map(function(v){return ('0'+v.toString(16)).slice(-2);}).join('')).toUpperCase();};for(var k=0;k<60&&window.__wfContrastY(x())<4.5;k++)c=c.map(function(v){return Math.min(255,Math.round(v+(255-v)*0.08)+1);});return x();};
  window.__wfSetY=function(role){var c=window.__wfYDefault(role),own='';try{own=localStorage.getItem('wf-primary')||'';}catch(e){}if(/^#[0-9A-Fa-f]{6}$/.test(own))c=window.__wfSafeY(own);window.__wfY=c;
    var h=c.replace('#',''),rgb=[0,2,4].map(function(i){return parseInt(h.substr(i,2),16);}).join(',');
    var d=document.documentElement.style;d.setProperty('--wf-y',c);d.setProperty('--wf-y-rgb',rgb);};
  var r='';try{r=localStorage.getItem('wf-role')||'';}catch(e){}
  window.__wfSetY(r);
})();
// (Oct 4, 23:30) One framing for every map of a fire: the fire's polygon centred, about 60% of the clear width (never under
// 50%), the whole polygon within 90% of the clear height, and at least 70% of the +6 h projection (g6) still in view.
// pts / g6: [[x, y]] in map units; W, H: the clear part of the map in screen px. Returns { z, cx, cy }.
window.__wfFrameFire=function(pts,g6,W,H){if(!pts||!pts.length)return null;var xs=pts.map(function(q){return q[0];}),ys=pts.map(function(q){return q[1];}),x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys),cx=(x0+x1)/2,cy=(y0+y1)/2,bw=Math.max(1,x1-x0),bh=Math.max(1,y1-y0);
  var z=Math.min(W*0.6/bw,H*0.9/bh);
  if(g6&&g6.length){var hx=2,hy=2;g6.forEach(function(q){hx=Math.max(hx,Math.abs(q[0]-cx));hy=Math.max(hy,Math.abs(q[1]-cy));});z=Math.min(z,Math.min(W/2/(0.7*hx),H/2/(0.7*hy)));}
  return {z:Math.max(0.0015,Math.min(40,z)),cx:cx,cy:cy};};
// (Oct 5, 07:58) the page itself never scrolls: the screens scroll inside their own containers. iOS (and scrollIntoView, focus)
// could still shift the document or the screen's frame when content changes height (e.g. a Crews tab), which slid the bottom
// sheets kept just below the frame (Key figures picker) into view. Any such shift is put straight back.
(function(){
  var fix=function(el){try{if(el&&(el.scrollTop||el.scrollLeft)){el.scrollTop=0;el.scrollLeft=0;}}catch(x){}};
  var pin=function(e){var t=e&&e.target;if(t===document||t===document.documentElement||t===document.body){fix(document.scrollingElement||document.documentElement);fix(document.body);if(window.scrollY||window.scrollX)window.scrollTo(0,0);return;}
    if(t&&t.nodeType===1&&(t.id==='dc-root'||t.hasAttribute('data-wfroot')||t.classList.contains('sc-host')||(t.parentElement&&t.parentElement.classList.contains('sc-host')&&t.parentElement.parentElement&&t.parentElement.parentElement.id==='dc-root')))fix(t);};   /* the screen's frame (overflow hidden on every screen) */
  try{if(window.self===window.top||!(window.frameElement&&window.frameElement.closest&&window.frameElement.closest('[data-wf-pushup]')))document.addEventListener('scroll',pin,{capture:true,passive:true});}catch(x){document.addEventListener('scroll',pin,{capture:true,passive:true});}
})();
// (Oct 5) every scrolling screen, panel and list ends with at least 56px of room under its last item (larger paddings are
// kept, e.g. a list that clears a keyboard or a foot button). Re-applied whenever a screen redraws its styles.
(function(){
  var T=0,MIN=56;
  function fix(){T=0;try{var L=document.querySelectorAll('[style*="overflow-y: auto"],[style*="overflow-y: scroll"],[style*="overflow: auto"],.chscroll,[data-wf-fadetop]');
    for(var i=0;i<L.length;i++){var el=L[i];if(el.tagName==='TEXTAREA'||el.closest('[data-wf-maproot]')||el.hasAttribute('data-wf-nopb'))continue;var cs=getComputedStyle(el);if(!/auto|scroll/.test(cs.overflowY))continue;
      if(el.style.getPropertyPriority('padding-bottom')==='important'&&parseFloat(el.style.paddingBottom)>=MIN)continue;if((parseFloat(cs.paddingBottom)||0)<MIN)el.style.setProperty('padding-bottom',MIN+'px','important');}}catch(e){}}
  function soon(){if(!T)T=setTimeout(fix,60);}
  /* map pans and zooms rewrite styles many times a second: those never schedule a pass */
  try{new MutationObserver(function(R){for(var i=0;i<R.length;i++){var t=R[i].target;if(t.nodeType===1&&t.closest&&t.closest('[data-wf-maproot],[data-wf-gl],.wf-cf'))continue;soon();return;}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});}catch(e){}
  window.addEventListener('load',soon);
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
  /* Installed on the home screen, the page runs under the status bar (translucent): the frame's own top 52px show there, so maps and blurs continue under the clock and the camera; in a browser tab the bar is the browser's */
  var SA=(window.navigator.standalone===true)||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  /* only when the page really runs under the status bar (a top safe area): an app installed before the change keeps the old bar */
  function under(){var u=false;try{if(SA){var pr=document.createElement('div');pr.style.cssText='position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';(document.body||document.documentElement).appendChild(pr);u=(parseFloat(getComputedStyle(pr).paddingTop)||0)>20;pr.remove();if(!u&&innerHeight>innerWidth&&innerHeight>=Math.max(screen.width,screen.height)-2)u=true;   /* (Oct 5, 20:45) upright only: held sideways the screen's long side always fits, which wrongly read as 'under the status bar' and pushed every screen 52px down */}}catch(e){}return u;}
  var UNDER=under();
  var W=390,H=844,TOP=UNDER?0:52,VH=H-TOP,MAXS=1.6;window.__wfTOP=TOP;try{document.documentElement.style.setProperty('--wf-top',TOP+'px');}catch(e){}   /* the frame's top hidden behind the browser's bar: tall sheets keep their 48px clear below what is really visible */
  /* Desktop browsers (Chrome, Safari, Firefox on a computer: a mouse, no touch) show the app as the phone it is, centred and
     scaled to the window's height, instead of stretching to a wide window (and never treat the wide window as a phone
     turned sideways) */
  var DESK=false;try{DESK=!!(matchMedia('(hover: hover) and (pointer: fine)').matches&&!('ontouchstart' in window)&&!(navigator.maxTouchPoints>0))||/OculusBrowser|Quest|Pico|Wolvic/i.test(navigator.userAgent);}catch(e){}window.__wfDesk=DESK;   /* VR headset browsers (Meta Quest) too: a floating window, so the phone frame */
  var m=document.querySelector('meta[name="wf-layout"]'),fluid=!DESK&&!!(m&&m.getAttribute('content')==='fluid');
  var st=document.createElement('style');
  st.textContent='html,body{background:#F2F2F7;overflow:hidden;height:100%;margin:0;overscroll-behavior:none}*{scrollbar-width:none}*::-webkit-scrollbar{display:none;width:0;height:0}'+   /* no scrollbars in any browser (desktop Safari and Chrome draw them) */
    
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
  // (Oct 5) Rotation: screens with a map (the main screen, a candidate, a fire) turn with the phone, landscape being their
  // full-screen map; every other screen keeps its content upright as the phone holds it: the page is turned back the other
  // way, so it reads exactly as in portrait whatever way the phone is turned.
  var rotSty=null;
  function unrotate(iw,ih){var a=typeof window.orientation==='number'?window.orientation:(screen.orientation?(screen.orientation.angle>180?screen.orientation.angle-360:screen.orientation.angle):0);
    if(!a&&iw>ih&&!DESK){try{var ty=screen.orientation&&screen.orientation.type||'';a=/secondary/.test(ty)?-90:90;}catch(e){a=90;}}   // (Oct 7) no angle reported: still keep the screen upright
    try{if(!DESK&&screen.orientation&&screen.orientation.lock&&!window.__wfFluidLand&&!fluid)screen.orientation.lock('portrait').catch(function(){});}catch(e){}   // where the browser allows (installed on Android), lock it outright
    if(!rotSty){rotSty=document.createElement('style');rotSty.id='wf-rot';document.head.appendChild(rotSty);}
    if(!(iw>ih)||DESK||!a){rotSty.textContent='';document.documentElement.classList.remove('wf-rot');window.__wfRotA=0;return null;}
    /* (Oct 8, 21:32) the screen turns against the phone, so its top (the header) stays on the side of the camera and the clock:
       phone turned left (a 90) -> the page turns -90; phone turned right (a -90) -> the page turns 90 */
    var rd=a>0?-1:1,tf=rd>0?'translateX('+iw+'px) rotate(90deg)':'translateY('+ih+'px) rotate(-90deg)';
    rotSty.textContent='html.wf-rot,html.wf-rot body{overflow:hidden}html.wf-rot body{position:fixed;left:0;top:0;width:'+ih+'px;height:'+iw+'px;transform-origin:0 0;transform:'+tf+'}';
    document.documentElement.classList.add('wf-rot');window.__wfRotA=rd;window.__wfRotWH=[iw,ih];return [ih,iw];}
  function fit(){
    var iw=window.innerWidth,ih=window.innerHeight,r=document.documentElement.style,s,vp;
    var flu=fluid||(!DESK&&!!window.__wfFluidLand&&iw>ih);
    var R=(flu&&!window.__wfHoldUp)?unrotate(0,1):unrotate(iw,ih);   // (Oct 5) a panel over a map screen (statistics) can hold it upright: window.__wfHoldUp, then a 'resize' event
    if(R){iw=R[0];ih=R[1];}   // (Oct 7, fix: this line had slipped into the comment above, so turned screens were drawn landscape-sized) a fixed screen can ask to fill the screen in landscape (the candidate's full-screen map)
    if(flu){
      s=Math.min(Math.min(iw,ih)/W,MAXS);
      var ins=insets();
      vp={w:Math.round(iw/s),h:Math.round(ih/s)+TOP,land:iw>ih,s:s,sl:Math.round(ins[0]/s),sr:Math.round(ins[1]/s)};
      r.setProperty('--wf-w',vp.w+'px');r.setProperty('--wf-h',vp.h+'px');
    }else{
      s=Math.min(iw/W,ih/VH);
      vp={w:W,h:H,land:false,s:s,sl:0,sr:0};r.removeProperty('--wf-w');r.removeProperty('--wf-h');
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
  // Too early, the phone may not report the status bar yet: once the page is laid out, check again. Running under the
  // status bar, the screen's own top shows there (photos and maps fill the whole screen, up behind the camera).
  function recheck(){if(TOP===0||!under())return;TOP=0;VH=H;window.__wfTOP=0;try{document.documentElement.style.setProperty('--wf-top','0px');}catch(e){}st.textContent=st.textContent.replace(/top:-52px/,'top:-0px');last='';fit();try{window.dispatchEvent(new Event('wf-vp'));window.dispatchEvent(new Event('wf-sync'));}catch(e){}}
  document.addEventListener('DOMContentLoaded',recheck);window.addEventListener('load',function(){recheck();setTimeout(recheck,300);});
})();
// Crash guard: if the last screen died without closing normally (Safari's "A problem repeatedly occurred"),
// forget the area and screen it was showing, so the app reopens on the default view instead of crashing again.
(function(){
  // (Oct 4) What the page was opened with (area, tapped item, screen): kept, so a version update that reloads the page does not lose it
  try{var fr0=false;try{fr0=window.self!==window.top;}catch(e){fr0=true;}var pu=sessionStorage.getItem('wf-pu-state');if(pu&&!fr0){sessionStorage.removeItem('wf-pu-state');var P=JSON.parse(pu);['wf-scope','wf-nav','wf-list','wf-fireview','wf-focus','wf-verify'].forEach(function(k){if(P[k]!=null&&sessionStorage.getItem(k)==null)sessionStorage.setItem(k,P[k]);});}}catch(e){}   // (Oct 4) arriving by the View push-up: the tapped item the loading frame already used
  /* (Oct 5, 02:52) Push-up arrival: the still copy of the risen screen covers this page from its first frame (a script-free frame
     drawn from the copy), and dissolves in 0.2s once the live page has drawn itself, so the screen never goes blank or flickers */
  try{(function(){var fr=false;try{fr=window.self!==window.top;}catch(e){fr=true;}if(fr)return;var sn=sessionStorage.getItem('wf-pu-snap'),t=+sessionStorage.getItem('wf-pu-arrive')||0;sessionStorage.removeItem('wf-pu-snap');if(!sn||Date.now()-t>10000)return;
    var ov=document.createElement('iframe');ov.setAttribute('aria-hidden','true');ov.setAttribute('tabindex','-1');ov.setAttribute('sandbox','allow-same-origin');ov.setAttribute('data-wf-pusnap','1');
    ov.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;border:0;margin:0;z-index:2147483000;pointer-events:none;background:'+(/wf-dark/.test(sn.slice(0,400))?'#262629':'#F2F2F7')+';transition:opacity .2s ease';ov.srcdoc=sn;(document.body||document.documentElement).appendChild(ov);
    var T0=Date.now(),ok=function(){var r=document.getElementById('dc-root');if(!(!document.getElementById('wf-load')&&r&&r.firstElementChild&&r.textContent.trim().length>20))return false;var tr=null;try{tr=sessionStorage.getItem('wf-tour');}catch(e){}return !tr||!/wf-tour/.test(sn)||!!document.querySelector('#wf-tour .tb.on');};   /* with the tour on, also its card */
    (function wait(){if(ok()||Date.now()-T0>4000){setTimeout(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){ov.style.opacity='0';setTimeout(function(){ov.remove();},260);});});},Date.now()-T0>4000?0:180);return;}setTimeout(wait,40);})();})();}catch(e){}
  try{var S={};['wf-scope','wf-nav','wf-list','wf-fireview','wf-focus','wf-verify'].forEach(function(k){var v=sessionStorage.getItem(k);if(v!=null)S[k]=v;});window.__wfSnap=S;}catch(e){}
  var K='wf-alive';
  try{
    var upd=sessionStorage.getItem('wf-updating');if(upd)sessionStorage.removeItem('wf-updating');   // reloaded by the self-update: not a crash
    var framed=false;try{framed=window.self!==window.top;}catch(e){framed=true;}   // (Oct 4) the menu is loaded in an iframe: it must not take the parent's live flag for a crash and wipe the area and the tapped item (the Green Valley bug)
    if(!upd&&!framed&&(sessionStorage.getItem(K)||localStorage.getItem(K))){['wf-scope','wf-nav','wf-list','wf-fireview','wf-focus'].forEach(function(k){sessionStorage.removeItem(k);});}
    var on=function(){try{sessionStorage.setItem(K,'1');localStorage.setItem(K,'1');}catch(e){}};
    var off=function(){try{sessionStorage.removeItem(K);localStorage.removeItem(K);}catch(e){}};
    if(!framed){on();
    window.addEventListener('pagehide',off);window.addEventListener('pageshow',on);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')off();else on();});}
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
      var q0=location.search.replace(/([?&])v=[^&]*&?/,'$1').replace(/[?&]$/,'');var u=location.pathname+(q0?q0+'&':'?')+'v='+v+location.hash;     // a new address skips the cached page (its other parameters kept: the station home)
      // Screens loaded inside other screens (the map) and the scripts keep their plain address, so refresh
      // the phone's copy of every file first; otherwise the new page could still run an old map.
      var F=['Login.dc.html','Main.dc.html','Alert.dc.html','Drone.dc.html','Dispatch.dc.html','TerrainMap.dc.html','fit.js','i18n.js','prefs.js','live.js','support.js','Station.dc.html','Chat.dc.html','chat.js','trophy.js','avatar.js','station.js','About.dc.html','tour.js','stats.js','index.html'];
      // The new page opens as this one would have: the opening loading screen, or the one after log in, plays there once
      var go=function(){try{if(window.__wfColdPage)sessionStorage.removeItem('wf-cold');var S=window.__wfSnap||{};Object.keys(S).forEach(function(k){if(sessionStorage.getItem(k)==null)sessionStorage.setItem(k,S[k]);});sessionStorage.setItem('wf-updating','1');}catch(e){}location.replace(u);};   // (Oct 4) the new page opens on the same area and item (Green Valley bug: every first tap after a new version lost the tapped item)
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
  st.textContent='@view-transition{navigation:auto}#wf-load{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:#F2F2F7;transition:opacity .3s ease}'+
    '#wf-load.out{opacity:0;pointer-events:none}#wf-load.photo{background:#000!important}'+
    '#wf-load .in{display:flex;flex-direction:column;align-items:center;gap:24px;opacity:0;animation:wfin .4s ease .25s forwards}'+
    '@keyframes wfin{to{opacity:1}}'+
    '@keyframes wfburn{0%,12%{opacity:0}45%,62%{opacity:1}100%{opacity:0}}'+
    '@keyframes wfsweep{from{background-position:120% 0}to{background-position:-120% 0}}'+
    '#wf-load .name{font:600 20px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;letter-spacing:.02em;'+
      'background:linear-gradient(90deg,#8E8E93 0%,#8E8E93 40%,#E8590C 50%,#8E8E93 60%,#8E8E93 100%);background-size:250% 100%;'+
      '-webkit-background-clip:text;background-clip:text;color:transparent;animation:wfsweep 1.8s linear infinite}'+
    '#wf-load .sub{font:400 16px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#8E8E93}'+
    /* cold start: an aerial forest behind the logo */
    '#wf-load .bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.06);transition:opacity .7s ease,transform 6s ease-out}'+
    '#wf-load .bg.on{opacity:1;transform:scale(1)}'+
    '#wf-load .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.05) 35%,rgba(0,0,0,.25) 60%,rgba(0,0,0,.62) 100%);opacity:0;transition:opacity .7s ease}'+
    '#wf-load.photo .shade{opacity:1}#wf-load .in{position:relative}'+
    '#wf-load.photo .name{background:none;color:var(--wf-y);animation:none;text-shadow:0 0 12px rgba(0,0,0,.45)}'+
    '#wf-load.photo .sub{color:rgba(255,255,255,.85);text-shadow:0 0 8px rgba(0,0,0,.5)}'+
    '#wf-load.photo .base{fill:var(--wf-y)}#wf-load.photo .ground{stroke:var(--wf-y)}#wf-load.photo svg{filter:drop-shadow(0 0 10px rgba(0,0,0,.35))}'+
    '#wf-load .cap{position:absolute;left:0;right:0;bottom:calc(28px + env(safe-area-inset-bottom));text-align:center;font:400 13px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:rgba(255,255,255,.8);opacity:0;transition:opacity .7s ease .3s}'+
    '#wf-load.photo .cap{opacity:1}'+
    /* (Oct 5, 02:40) the firefighter stripes along the bottom edge, as on the login */
    '#wf-load .stp{display:none}#wf-load.photo .stp{display:block;position:absolute;left:0;right:0;bottom:0;height:8px;z-index:2;background:repeating-linear-gradient(-45deg,var(--wf-y,#E5FF00) 0 16.97px,transparent 16.97px 33.94px);opacity:.4}'+
    /* the loading counter, 0% to 100% */
    '#wf-load .pct{margin-top:-6px;font:600 51px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#8E8E93}'+
    '#wf-load.photo .pct{color:var(--wf-y);text-shadow:0 0 8px rgba(0,0,0,.5)}'+
    /* after log in (hand): the sign-in screen's own layout carries on. Logo, name and line of text stay exactly where and
       as big as they were, the line changes to 'Loading live data', the counter takes the fields' place at the centre */
    '#wf-load.hand{display:block}#wf-load.hand .in{position:absolute;inset:0;display:block;opacity:1;animation:none}'+
    '#wf-load.hand .in>svg,#wf-load.hand .name,#wf-load.hand .sub,#wf-load.hand .cap{position:absolute;margin:0;box-sizing:border-box;text-align:center;white-space:nowrap}'+
    '#wf-load.hand svg{filter:drop-shadow(0 0 8px rgba(0,0,0,.35))}'+
    '#wf-load.hand .name{letter-spacing:.02em;text-shadow:0 0 10px rgba(0,0,0,.45)}'+
    '#wf-load.hand .sub{display:grid;color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5)}#wf-load.hand .sub>span{grid-area:1/1;transition:opacity .45s cubic-bezier(.4,0,.2,1)}'+
    '#wf-load.hand .pct{position:absolute;left:0;right:0;top:50%;margin:0;transform:translateY(-50%);text-align:center;font-size:143px;line-height:1}'+
    '#wf-load.hand .sub2{position:absolute;left:0;right:0;top:calc(50% + 80px);margin:0;text-align:center;white-space:nowrap;font:400 18px/24px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5);transition:opacity .45s cubic-bezier(.4,0,.2,1)}'+
    '#wf-load.hand .cap{bottom:auto;color:rgba(255,255,255,.72);transition:none}'+
    '#wf-load.hand .shade{background:linear-gradient(180deg,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.12) 30%,rgba(0,0,0,0.28) 62%,rgba(0,0,0,0.62) 100%)}';
  document.head.appendChild(st);
  var el=document.createElement('div');el.id='wf-load';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  // Screens with a forest photo behind them start on its dark green, never on the light surface (no flash before the photo)
  if(/Login\.dc\.html/.test(location.pathname)||/\/(01\/)?(index\.html)?$/.test(location.pathname)){el.style.background='#000000';try{document.documentElement.style.background='#000000';}catch(e){}}
  var TPL='<div class="bg"></div><div class="shade"></div><div class="stp" aria-hidden="true"></div><div class="in"><svg width="81" height="99" viewBox="3.4 5 17.2 20.9" aria-hidden="true" style="overflow:visible">'+
    '<path class="base" style="fill: var(--wf-y)" fill-rule="evenodd" d="'+F+'">'+BLINK+'</path>'+
    '<path class="ground" d="'+G+'" fill="none" stroke="'+(window.__wfY||'#E5FF00')+'" stroke-width="1.1" stroke-linecap="round"/></svg>'+
    '<span class="name">Forest Fire Watch</span><span class="sub">Loading live data</span><span class="pct">0%</span></div><div class="cap"></div>';
  el.innerHTML=TPL;
  (document.body||document.documentElement).appendChild(el);
  var PH=window.__wfSplashPH();
  // Sign in hands its photo over (which photo, and how far it had zoomed): the loading screen carries on with that very
  // photo from that zoom at the same steady pace, so the picture never jumps. RATE: the slideshow's zoom per second.
  var RATE=0.33/18,HAND=null;try{HAND=JSON.parse(sessionStorage.getItem('wf-soft-photo')||'null');}catch(e){}
  var handPH=function(h){var q=h&&(window.__wfPhotoList||[]).find(function(x){return x.f===h.f;});return q?[q.f,q.alt,q.by,q.b]:null;};
  var handS=function(h){return h?h.s+RATE*Math.max(0,Date.now()-h.t)/1000:1;};
  var nxt=0;try{nxt=(parseInt(localStorage.getItem('wf-splash-i')||'0',10)||0)%PH.length;}catch(e){}
  // The black-and-white forest, as the loading screen starts: used by the sign-in screen to hand over without a gap.
  var grayLayer=function(ph){var d=document.createElement('div');d.style.cssText='position:absolute;inset:0;background:url(assets/splash/'+ph[0]+') center/cover;filter:saturate(0) brightness('+(0.8*(ph[3]||1)).toFixed(2)+')';return d;};   // no colour at all, 20% darker than the photo; it reaches full colour and lightness at 100%
  // Places the loading screen's logo, name, line of text and credit exactly where sign in had them (lay, measured there)
  var LOADTXT='Loading live data';
  var handLayout=function(o,lay,first){if(!lay)return false;o.classList.add('hand');
    var put=function(n,r){if(!n||!r)return;n.style.left=r[0]+'px';n.style.top=r[1]+'px';n.style.width=r[2]+'px';n.style.height=r[3]+'px';if(r[4]){n.style.fontSize=r[4]+'px';n.style.lineHeight=r[3]+'px';}};
    put(o.querySelector('.in>svg'),lay.logo);put(o.querySelector('.name'),lay.name);put(o.querySelector('.cap'),lay.cred);
    // (Oct 3, 22:16) 'Loading live data' sits under the counter; the sign-in line fades out where it was, the logo stays put
    var sb=o.querySelector('.sub');if(sb&&lay.sub){put(sb,lay.sub);sb.innerHTML='';var a=document.createElement('span'),b=o.querySelector('.sub2');a.textContent=lay.sub[5]||'';
      if(!b){b=document.createElement('span');b.className='sub2';o.querySelector('.in').appendChild(b);}b.textContent=LOADTXT;if(lay.sub[4])b.style.fontSize=lay.sub[4]+'px';
      if(first){b.style.opacity='0';sb.appendChild(a);setTimeout(function(){a.style.opacity='0';b.style.opacity='1';},60);}   // the line changes softly
      else{b.style.opacity='1';}}
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
    try{var dk=document.createElement('style');dk.id='wf-dark';dk.textContent='html,body{background:#000000!important}';document.head.appendChild(dk);var tc=document.querySelector('meta[name=theme-color]');if(tc){tc.__c=tc.content;tc.content='#000000';}}catch(e){}}catch(e){}}
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
    var gray=mk('saturate(0) brightness(.8)'),norm=mk('none'),hot=mk('saturate(1.6) contrast(1.03) brightness(1.03)');
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
      var paint=function(r,q){q=q||0;
        // the black-and-white photo ahead of the wave starts 20% darker and brightens with the count to its normal lightness at 100%
        var gb=(0.8+0.2*Math.min(1,q))*(ph[3]||1);gray.style.filter='saturate(0) brightness('+gb.toFixed(3)+')';var qq=q*q,b=band*(1-.85*qq),sm=1-.95*qq,brt=1-.95*qq;   // towards the end the front gathers into a thin, round ring, so the colour settles just as the count reaches 98%
        var t=performance.now()/1000,m1=[],m2=[],C=[];
        LOB.forEach(function(L){
          var off=Math.min(90,r*.07+4)*sm,ang=L.a+L.s*t*.2+Math.sin(t*L.w+L.p)*.5;   // centres wander around the logo
          var x=cx+Math.cos(ang)*off*(.6+.4*Math.sin(t*L.v+L.q)),y=cy+Math.sin(ang)*off*(.6+.4*Math.cos(t*L.w+L.p));
          var rr=Math.max(0,r*(.965+.025*brt*Math.sin(t*L.v+L.p))),at='circle at '+x.toFixed(1)+'px '+y.toFixed(1)+'px';
          C.push([x,y,Math.max(0,rr-b*1.05)]);   // where the colour reads as full (inside the soft edge), so the count ends just after the colour does
          m1.push('radial-gradient('+at+',#000 '+Math.max(0,rr-b*1.45)+'px,rgba(0,0,0,.5) '+Math.max(0,rr-b*1)+'px,transparent '+Math.max(1,rr-b*.5)+'px)');   // normal colour behind the front
          m2.push('radial-gradient('+at+',#000 '+Math.max(0,rr-b*.15)+'px,rgba(0,0,0,.5) '+Math.max(0,rr+b*.3)+'px,transparent '+Math.max(1,rr+b*.75)+'px)');   // the saturated glow reaching just past it
        });
        norm.style.webkitMaskImage=norm.style.maskImage=m1.join(',');hot.style.webkitMaskImage=hot.style.maskImage=m2.join(',');
        var worst=0;for(var i=0;i<EDGE.length;i++){var e=EDGE[i],d=1e9;for(var j=0;j<C.length;j++){var g=Math.hypot(e[0]-C[j][0],e[1]-C[j][1])-C[j][2];if(g<d)d=g;}if(d>worst)worst=d;}
        cov0=Math.max(cov0,Math.min(1,1-worst/R));if(wave)wave.cov=cov0;};
      paint(0);requestAnimationFrame(function(){bg.className='bg on';if(!ZOOM)zoom.style.transform='scale('+(1+RATE*30)+')';});
      // The wave spreads steadily with time over the loading time; the counter reads its progress, so both stay in step.
      // While live data is still coming it glides to a stop short of the edges, then carries on; every change of pace
      // is smoothed over about a quarter of a second, so it never stutters.
      var t1=performance.now(),dur=Math.max(minMs-(Date.now()-t0),2000)*1.15,   /* 15% slower wave */ last=t1;
      wave={p:0,done:false};var END=1.1;   // the count runs on to 110% (shown as 100%): the colour covers the whole screen only at 110, so it never ends before the count
      (function step(now){
        if(!el.parentNode)return;
        var tp=Math.min(END,(now-t1)/dur),ready=haveData()&&drawn(),goal=ready?tp:Math.min(tp,.88),dt=Math.min(64,now-last);last=now;
        wave.p+=(goal-wave.p)*(1-Math.exp(-dt/220));if(goal>=END&&END-wave.p<.004)wave.p=END;
        // in step with the counter: at n% the front has covered n% of the way to the farthest corner, and at 100% the
        // normal colour has just reached every corner (the shape's smallest lobe included)
        // the front's full colour reaches every corner exactly at 110 on the count (100% shown), so the colour never finishes
        // before the counter does
        var REND=(R+90*.05+band*.15*1.45)/(.965-.025*.05),q=Math.min(1,wave.p/END);if(q<1)paint(q*REND,q);else if(!wave.full){wave.full=true;norm.style.webkitMaskImage=norm.style.maskImage='none';hot.style.opacity='0';}
        if(wave.p>=END-.002&&ready){wave.p=END;wave.cov=1;wave.done=true;wave.at=Date.now();norm.style.webkitMaskImage=norm.style.maskImage='none';return;}
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
    if(wave){pv=wave.done?100:Math.max(pv,Math.min(100,Math.floor(wave.p*100+1e-6)));}   // with the colour wave, the counter reads the wave's progress; it shows 100% from 100 to 110, and the wave covers the whole screen at 110
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

// No snapping anywhere (Oct 2): every scrolling list coasts freely with the phone's own momentum and stays where it stops.
// Touch feedback for everything tappable: a soft highlight grows from the finger across the control and fades,
// plus a light tap on the phone (vibration where the browser allows it; on iPhone, the system haptic that
// Safari gives a switch control, which is the only haptic web pages can reach).
(function(){
  var SEL2='.scrim,.wf-hap-scrim';
  var SEL='a[href],button:not([disabled]),[role=button],[role=option],[role=tab],[role=switch],label,summary,.opt,.sqrow,[data-avtip],[tabindex="0"]';   // cards that are dragged (press, hold, move) give their own haptic: no tap overlay on them
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
    if(t.closest('[role=application]')&&!t.closest('[role=group],[role=dialog],.mbtn'))return;   // map panning stays clean: markers pan; its controls, legend and tooltip panels tap and tick
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
  // A grabber (or any drag zone) that calls setPointerCapture on a finger would make the tap's click land on itself, never on the
  // invisible switch laid over it, so the phone gave no tick. A finger is captured by the element it touched anyway, so on iPhone
  // the explicit capture is skipped for touch: the drag works the same and the tap now ticks.
  if(IOS){var PT={},oc=Element.prototype.setPointerCapture;
    document.addEventListener('pointerdown',function(e){PT[e.pointerId]=e.pointerType;},{capture:true,passive:true});
    Element.prototype.setPointerCapture=function(id){if(PT[id]==='touch')return;return oc.apply(this,arguments);};}
  if(IOS){
    document.addEventListener('touchstart',function(e){
      ovOff();if(e.touches.length!==1)return;var p=e.touches[0],tg=e.target;
      // A text field (e.g. Write a message, search): the tap ticks too, then focuses the field inside the same tap so the keyboard opens
      var fl=tg&&tg.closest?(tg.closest(FIELD)||((tg.closest('label')||{}).querySelector?tg.closest('label').querySelector(FIELD):null)):null;
      if(fl&&document.activeElement===fl)return;   // already typing: taps move the caret, untouched
      var t=fl||(tg&&tg.closest&&tg.closest(SEL)||tg.closest(SEL2));if(!t||(!fl&&skip(t,tg))||t.closest('#wf-hapov'))return;
      if(tg.closest('[data-wf-kpi]'))return;
      // inside a row that scrolls sideways (map legends, chips): the overlay would take the swipe and the row could not scroll
      for(var hs=tg;hs&&hs!==document.body;hs=hs.parentElement){var ox=getComputedStyle(hs).overflowX;if((ox==='auto'||ox==='scroll')&&hs.scrollWidth>hs.clientWidth+1)return;}   // a mini card may be pressed and held to move it: the overlay would take the drag   // the map too: markers tick as well (a pan removes the overlay at once)
      var r=t.getBoundingClientRect();if(r.width<1||r.height<1)return;
      var l=document.createElement('label');l.id='wf-hapov';l.setAttribute('aria-hidden','true');
      l.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;z-index:2147483647;opacity:0;-webkit-tap-highlight-color:transparent;margin:0;padding:0';
      var c=document.createElement('input');c.type='checkbox';c.setAttribute('switch','');c.tabIndex=-1;c.style.cssText='position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;margin:0';l.appendChild(c);
      l.__t=t;ovX=p.clientX;ovY=p.clientY;
      l.addEventListener('click',function(ev){
        if(ev.target!==l)return;   // the label's own click (the switch toggles, the phone ticks); the input's echo is ignored
        ev.stopPropagation();var tt=l.__t;ovOff();
        if(tt.matches&&tt.matches(FIELD)){try{tt.focus();}catch(x){}return;}   // a field: focus it now, inside the tap
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
  document.addEventListener('click',function(e){if(!IOS&&isField(e.target)&&document.activeElement!==e.target.closest(FIELD)){try{navigator.vibrate&&navigator.vibrate(8);}catch(x){}}   // a text field ticks too
    var t=e.target&&e.target.closest&&e.target.closest(SEL)||e.target.closest(SEL2);if(!t||t.id==='wf-hap'||t.closest('#wf-hap')||t.closest('#wf-hapov')||skip(t,e.target))return;
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
  window.__wfBackOrHome=function(){var ref='';try{ref=document.referrer?new URL(document.referrer).origin:'';}catch(x){}if(history.length>1&&ref===location.origin){history.back();return;}var H=wfHomeUrl();try{location.replace(H);}catch(x){location.href=H;}};
  // (Oct 7) Home through the incident name: on the incident screens (candidate, fire) and the incident chat there is no round back;
  // a tap on the incident's name (data-wf-home) returns to the main screen: a real back when the main screen is the one just before
  // (its place is kept), otherwise the main screen opens. Controls inside the name (the houses-warning tag) keep their own tap.
  // (Oct 7, 09:29: dark grey, 16% bigger, 4.6 x 8.1px) a small left chevron, in the 16px between the screen edge and the incident name ([data-wf-chev]), saying the name goes back
  try{var cv=document.createElement('style');cv.textContent='[data-wf-chev]{position:relative}[data-wf-chev]::before{content:"";position:absolute;left:-12.23px;top:calc(var(--wf-chev-y,16px) - 6.34px);width:7.24px;height:12.67px;background:#3A3A3C;pointer-events:none;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 14%27%3E%3Cpath d=%27M6.5 1.5 1.5 7l5 5.5%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 14%27%3E%3Cpath d=%27M6.5 1.5 1.5 7l5 5.5%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/contain no-repeat}html.wf-dark [data-wf-chev]::before{background:#D1D1D6}';(document.head||document.documentElement).appendChild(cv);}catch(x){}
  window.__wfHome=function(){var r=null;try{r=document.referrer?new URL(document.referrer):null;}catch(x){}
    var H=wfHomeUrl();if(history.length>1&&r&&r.origin===location.origin&&(/\/Main\.dc\.html$/.test(r.pathname)||(H!=='Main.dc.html'&&/\/Station\.dc\.html$/.test(r.pathname)&&/[?&]home=1/.test(r.search)))){history.back();return;}location.href=H;};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('[data-wf-home]');if(!a||e.defaultPrevented)return;
    var inner=e.target.closest('a,button,input,[role=button]');if(inner&&inner!==a&&a.contains(inner))return;
    e.preventDefault();setTimeout(function(){window.__wfHome();},0);
  },false);
  document.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var a=e.target&&e.target.getAttribute&&e.target.getAttribute('data-wf-home')!=null?e.target:null;if(!a||a.tagName==='BUTTON'||a.tagName==='A')return;e.preventDefault();a.click();},false);
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
// Taps are untouched. Rule: on a blade whose content scrolls (a list, a long panel) a swipe on the content scrolls it and
// never closes the blade; its grabber and its empty spaces (header, footer, space around and below the rows) swipe the blade. The page can show the drag itself through window.__wfSwipeDrag(key, dy); otherwise the
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
    var gc=t.closest('[data-grab-close]'),gb=gc&&gc.closest('[data-swipe]');   // a dialog's grabber: drags the dialog down even when its list scrolls; a tap on it closes (its own onClick)
    if(gb){var p0=e.touches[0];S={el:gb,mode:'close',dir:gb.getAttribute('data-swipe'),x:p0.clientX,y:p0.clientY,t:performance.now(),sc:null,on:false,dy:0,k:1,fired:false};try{var r0=gb.closest('[data-wfroot]');if(r0)S.k=r0.getBoundingClientRect().width/((window.__wfVP||{}).w||390)||1;}catch(x){}return;}
    if(t.closest('.wf-grab,input,textarea,select,[data-noswipe]'))return;   // the grabber keeps its own drag; fields keep theirs
    var el=t.closest('[data-swipe],[data-pull]');if(!el)return;
    var sc0=scroller(t,el);if(sc0&&t!==sc0)return;   // on the scrolling content itself (its rows) the swipe scrolls; the blade's empty spaces (around the list, below its last row) still swipe the blade
    var mode=el.hasAttribute('data-swipe')?'close':'pull',p=e.touches[0];
    S={el:el,mode:mode,dir:el.getAttribute(mode==='close'?'data-swipe':'data-pull'),x:p.clientX,y:p.clientY,t:performance.now(),sc:sc0,on:false,dy:0,k:1,fired:false};
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

// Confirmation dialog, the app's one shared model (as "Confirm fire?" on the ignition candidate): a panel rising from the
// bottom edge over a dark scrim, 28px top corners, the panel shadow, 30px top / 24px sides / 32px (+48px clear of the home
// indicator) bottom; title (17px semibold) and text (17px regular), 24px, then two pill buttons side by side, 48px tall:
// secondary (dark, hi-vis text) to step back and the primary (hi-vis) to go ahead. Tap the scrim or swipe down to cancel.
// window.__wfConfirm({ title, body, cancel, ok, onOk, onCancel })
(function(){
  window.__wfConfirm=function(o){
    o=o||{};var root=document.querySelector('[data-wfroot]')||document.body;
    var old=root.querySelector('.wf-cfm');if(old)old.remove();
    var w=document.createElement('div');w.className='wf-cfm';w.style.cssText='position:absolute;inset:0;z-index:90';
    var sc=document.createElement('div');sc.setAttribute('aria-hidden','true');sc.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.32);opacity:0;transition:opacity .35s ease';
    var p=document.createElement('section');p.className='wf-dlg';p.setAttribute('role','alertdialog');p.setAttribute('aria-modal','true');p.setAttribute('data-swipe','down');
    p.style.cssText='position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;box-sizing:border-box;padding:32px 24px 80px;border-radius:28px 28px 0 0;background:#F2F2F7;box-shadow:0 0 40px rgba(0,0,0,.14);transform:translateY(105%);transition:transform .5s cubic-bezier(.2,.8,.2,1);font-family:inherit';
    var h=document.createElement('h2');h.textContent=o.title||'';h.style.cssText='margin:0;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.01em;color:#000000';
    var b=document.createElement('p');b.textContent=o.body||'';b.style.cssText='margin:4px 0 0;font-size:18px;line-height:24px;color:#000000';if(!o.body)b.style.display='none';
    var a=document.createElement('div');a.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:24px';
    var btn=function(txt,pri){var e=document.createElement('button');e.type='button';e.textContent=txt;e.style.cssText='display:flex;align-items:center;justify-content:center;height:48px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:18px;font-weight:600;cursor:pointer;'+(pri?'background:var(--wf-y,#E5FF00);color:#1C1C1E;-webkit-text-fill-color:#1C1C1E;box-shadow:none':'background:var(--wf-sec-bg,#737376);color:var(--wf-sec-fg,#FFFFFF);-webkit-text-fill-color:var(--wf-sec-fg,#FFFFFF)');return e;};
    var no=btn(o.cancel||'Cancel',false),yes=btn(o.ok||'OK',true);if(/^(Not now|Agora não)$/.test(o.cancel||'')){no.className='wf-rpill';no.style.background='transparent';no.style.color='var(--wf-ink,#3A3A3C)';}   /* (Oct 7) Not now is a ghost button everywhere */no.setAttribute('data-swipe-go','1');if(o.cancel===false)a.style.gridTemplateColumns='minmax(0,1fr)';else a.appendChild(no);a.appendChild(yes);   // cancel:false = one full-width primary (an information dialog)
    p.appendChild(h);p.appendChild(b);p.appendChild(a);w.appendChild(sc);w.appendChild(p);root.appendChild(w);
    var done=false,close=function(ok){if(done)return;done=true;try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}sc.style.opacity='0';p.style.transform='translateY(105%)';setTimeout(function(){w.remove();},520);try{(ok?o.onOk:o.onCancel)&&(ok?o.onOk:o.onCancel)();}catch(x){}};
    sc.onclick=function(){close(false);};no.onclick=function(){close(false);};yes.onclick=function(){close(true);};
    requestAnimationFrame(function(){requestAnimationFrame(function(){sc.style.opacity='1';p.style.transform='translateY(0)';});});
    return {close:close};
  };
})();

// Install offer (Oct 3): a shared link (Share with other people: …/#install; the administrator's …/#invite=…) offers to put
// the app on the Home Screen when it opens in a browser tab. Android and desktop Chrome: the browser's own install
// prompt behind an Install button (Not now | Install). iPhone and iPad (Safari, Chrome): no page can install there, so a
// one-button dialog says where Add to Home Screen is. Shown once per opened link, never inside the installed app; on
// Android, Chrome opens links into the installed app on its own, so the offer never shows there.
(function(){
  var SA=(window.navigator.standalone===true)||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  var want=false;try{want=sessionStorage.getItem('wf-install')==='1';}catch(e){}
  var ua=navigator.userAgent||'',IOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),CRI=/CriOS/.test(ua);
  var evt=null,shown=false;
  var pt=function(){var l=window.__wfLang||(document.documentElement.lang||navigator.language||'');return /^pt/i.test(l);};
  var T=function(en,p){return pt()?p:(window.__wfJA?window.__wfJA(en):en);};
  var done=function(){try{sessionStorage.removeItem('wf-install');}catch(e){}};
  function show(){
    if(shown||SA||!want||!window.__wfConfirm)return;
    if(IOS){shown=true;done();
      window.__wfConfirm({title:T('Add to Home Screen','Adicionar ao ecrã principal'),
        body:CRI?T('Tap Share in the address bar, then Add to Home Screen.','Toque em Partilhar na barra de endereço e depois em Adicionar ao ecrã principal.')
                :T('Tap Share (in the … menu), then Add to Home Screen.','Toque em Partilhar (no menu …) e depois em Adicionar ao ecrã principal.'),
        cancel:false,ok:T('OK','OK')});return;}
    if(!evt)return;shown=true;done();
    window.__wfConfirm({title:T('Install Fire Watch','Instalar Fire Watch'),body:T('Open it from your Home Screen, full screen.','Abra-a no ecrã principal, em ecrã inteiro.'),
      cancel:T('Not now','Agora não'),ok:T('Install','Instalar'),onOk:function(){try{var e=evt;evt=null;e.prompt();}catch(x){}}});
  }
  // Chrome hands over its install prompt; held back only when this page was opened from a shared link
  window.addEventListener('beforeinstallprompt',function(e){if(!want||SA)return;e.preventDefault();evt=e;setTimeout(show,1200);});
  window.addEventListener('appinstalled',function(){evt=null;done();});
  if(want&&!SA&&IOS){var go=function(){setTimeout(show,1200);};if(document.readyState==='complete')go();else window.addEventListener('load',go);}
})();

// Round controls, every screen (close X, back, chat, bell, avatars, counts, map buttons): a press gives a light haptic and
// swells the button by --wf-round-pop (30%) quickly, then lets it settle back slowly, while a 2px dark grey outline pulses out once (to 150%, fading); on a dark button the outline is the same 2px, starts at the swollen edge, and the button does not dim. Any round button made later gets it
// for free: a button, link or role=button that is a circle up to 72px. Uses the separate 'scale' property, so a page's own
// transforms and press styles stay as they are.
(function(){
  document.addEventListener('pointerdown',function(e){
    var el=e.target&&e.target.closest?e.target.closest('button,a,[role=button]'):null;if(!el||!el.animate)return;
    var inner=el.querySelector&&el.querySelector('[data-round-in]');if(inner&&!el.disabled)el=inner;   // a row whose round end button (e.g. the drill-in arrow) reacts when the row is pressed
    var r=el.getBoundingClientRect(),pill=el.hasAttribute('data-round');if(!r.width)return;   // data-round: a pill that behaves like the round buttons
    if(!pill){if(r.width>72||Math.abs(r.width-r.height)>2)return;var br=parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;if(br<r.width*0.4)return;}   // round, or nearly (some screens give round buttons a 20px corner)
    var k=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wf-round-pop'))||1.3;
    try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}
    // An X (close) button, and the + that adds cards, also turn a gentle quarter turn, as the notifications X does (unless the page already turns it)
    try{var sv=el.querySelector('svg'),pd=sv&&sv.querySelector('path'),d=pd?pd.getAttribute('d')||'':'';
      if(sv&&(/^M\s?[67][ ,]?[67]\s?l\s?1[02]/i.test(d)||/^M12 5v14M5 12h14/.test(d))&&!/rotate/.test(sv.getAttribute('style')||'')){if(sv.__wfRot)sv.__wfRot.cancel();sv.__wfRot=sv.animate([{rotate:'0deg'},{rotate:'90deg'}],{duration:600,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'});setTimeout(function(){try{sv.__wfRot&&sv.__wfRot.cancel();}catch(x){}},1400);}}catch(x){}
    try{if(el.__wfPop)el.__wfPop.cancel();el.__wfPop=el.animate([{scale:'1',easing:'cubic-bezier(.2,.9,.3,1)'},{scale:String(k),offset:0.18,easing:'cubic-bezier(.4,0,.2,1)'},{scale:'1'}],{duration:480});}catch(x){}
    // and a 2px dark grey outline pulses out once from its edge: fully visible at the start, 50% larger at the end, where it has faded out
    try{var bgc=(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)||[]).map(Number),dkb=bgc.length>2&&(bgc[3]==null||bgc[3]>0.4)&&(0.299*bgc[0]+0.587*bgc[1]+0.114*bgc[2])<90;   // a dark round button (map controls, drone feed)
      if(dkb)el.classList.add('wf-dkbtn');
      var g=document.createElement('i'),dk=document.documentElement.classList.contains('wf-dark'),rad=pill?(r.height/2)+'px':'50%',W=r.width,H=r.height,X=r.left,Y=r.top,G=0.5;
      // a dark button would hide its dark line while it swells (the line is drawn over it, dark on dark): the line starts at the swollen edge instead, so it shows from the first moment and still ends 50% beyond the button
      if(dkb){var Wn=W*k,Hn=H*k;X-=(Wn-W)/2;Y-=(Hn-H)/2;W=Wn;H=Hn;G=(k+0.5)/k-1;}
     
      g.setAttribute('aria-hidden','true');g.style.cssText='position:fixed;z-index:2147483000;pointer-events:none;box-sizing:border-box;border:2px solid '+(dk?'#E8E8ED':'#3A3A3C')+';border-radius:'+rad+';left:'+X+'px;top:'+Y+'px;width:'+W+'px;height:'+H+'px';
      document.body.appendChild(g);var a=g.animate([{left:X+'px',top:Y+'px',width:W+'px',height:H+'px',opacity:1},{left:(X-W*G/2)+'px',top:(Y-H*G/2)+'px',width:(W*(1+G))+'px',height:(H*(1+G))+'px',opacity:0}],{duration:600,easing:'cubic-bezier(.2,.6,.35,1)',fill:'forwards'});
      a.onfinish=function(){g.remove();};setTimeout(function(){if(g.parentNode)g.remove();},900);}catch(x){}
  },{passive:true,capture:true});
  try{document.documentElement.style.setProperty('--wf-round-pop','1.3');}catch(x){}
  // Dark round buttons press like the light ones at the top: no dimming while held (their pulse is the 1px dark grey line)
  try{var ds=document.createElement('style');ds.textContent='.wf-dkbtn:active{opacity:1!important}';(document.head||document.documentElement).appendChild(ds);}catch(x){}
  // A round button that is a plain link (the main screen's chat, for one) would leave the page before the swell and pulse
  // show: when no screen code handled the tap, the page changes a moment later instead (after every handler has run).
  window.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var el=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!el||el.target||el.hasAttribute('download')||el.hasAttribute('data-wf-back'))return;
    var h=el.getAttribute('href')||'';if(!h||h.charAt(0)==='#'||/^(mailto|tel|javascript):/i.test(h))return;
    var r=el.getBoundingClientRect();if(!el.hasAttribute('data-round')){if(!r.width||r.width>72||Math.abs(r.width-r.height)>2)return;var br=parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;if(br<r.width*0.4)return;}
    e.preventDefault();var to=el.href;setTimeout(function(){try{location.href=to;}catch(x){}},260);
  });
})();
// Installed iPhone app: the status bar is opaque (iOS 26 cuts a strip off the bottom of the screen when the page runs
// under it, WebKit bug 301108), so the page always reaches the bottom edge. iOS paints the bar from the screen's own
// top layers. On sign in and loading it is black (their photo layers and the page are black underneath the photo); inside
// the app nothing is added, so the bar follows the screen and changes only once when a blade or panel covers the top.
(function(){
  var SA=(window.navigator.standalone===true)||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  if(!SA)return;
  var BAR='#000000',root=document.documentElement,sty=null,cur='',tc0=null;
  function meta(){return document.querySelector('meta[name="theme-color"]');}
  function set(c){if(c===cur)return;cur=c;if(!sty){sty=document.createElement('style');sty.id='wf-bar';document.head.appendChild(sty);}
    sty.textContent=c?'html.wf-bar,html.wf-bar body{background-color:'+c+'!important}':'';
    var m=meta();if(m){if(c){if(tc0===null)tc0=m.getAttribute('content');m.setAttribute('content',c);}else if(tc0!==null){m.setAttribute('content',tc0);tc0=null;}}}
  function photo(){var l=document.getElementById('wf-load');if(l&&/\b(photo|hand)\b/.test(l.className)&&!/\bout\b/.test(l.className))return true;return !!document.getElementById('wf-login-bg')||/Login\.dc\.html/.test(location.pathname);}
  function probe(){var on=window.__wfTOP!==0&&innerHeight>innerWidth;root.classList.toggle('wf-bar',on);set(on&&photo()?BAR:'');}
  // before the first paint: screens with a photo start black
  if(photo()){root.classList.add('wf-bar');set(BAR);}
  var T=0;function soon(){clearTimeout(T);T=setTimeout(probe,60);}
  window.addEventListener('wf-vp',soon);window.addEventListener('resize',soon);window.addEventListener('pageshow',soon);
  // the loading screen leaving is the one change to watch for
  window.addEventListener('load',function(){probe();var iv=setInterval(function(){probe();if(!photo())clearInterval(iv);},300);});
})();
// Mini cards: the title sits 40% closer to its value (12px under a one-line title instead of 20px, via the 32px title box
// in prefs.js). A title that wraps to two lines tightens its leading to fit the same 32px, so values line up across a row.
(function(){
  var T=0;
  function fix(){T=0;try{document.querySelectorAll('[data-wf-kpicard]').forEach(function(c){var l=c.firstElementChild;if(!l||l.tagName!=='SPAN'||!/min-height:\s*40px/.test(l.getAttribute('style')||''))return;
      if(l.style.getPropertyValue('line-height')==='16px')l.style.removeProperty('line-height');
      var r=document.createRange();r.selectNodeContents(l);var R0=r.getBoundingClientRect();if((document.documentElement.classList.contains('wf-rot')?R0.width:R0.height)>26)l.style.setProperty('line-height','16px','important');});}catch(e){}}
  function soon(){if(!T)T=setTimeout(fix,80);}
  try{new MutationObserver(soon).observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch(e){}
  window.addEventListener('resize',soon);window.addEventListener('load',soon);
})();

// Equal widths: every element marked data-wf-eqw="<group>" (e.g. the status tags of a list) takes the width of the widest
// in its group, measured after rendering and translation, so tags line up whatever their language.
(function(){
  var busy=false;
  // Dialog action pairs (Oct 3, 22:07): when a label would wrap (e.g. "Terminar sessão"), the two buttons stack, each full width
  function acts(){var A=document.querySelectorAll('.wf-dlg-acts');for(var i=0;i<A.length;i++){var a=A[i];if(!a.offsetWidth)continue;a.classList.remove('wf-stack');var B=a.querySelectorAll('button'),wrap=false;for(var j=0;j<B.length;j++){var b=B[j];if(!b.offsetWidth)continue;var r=document.createRange();r.selectNodeContents(b);var R=r.getClientRects(),tops={};for(var q=0;q<R.length;q++)if(R[q].width>1)tops[Math.round(R[q].top)]=1;if(Object.keys(tops).length>1)wrap=true;}if(wrap)a.classList.add('wf-stack');}}
  function run(){try{acts();}catch(x){}busy=false;var g={},l=document.querySelectorAll('[data-wf-eqw]');for(var i=0;i<l.length;i++){var k=l[i].getAttribute('data-wf-eqw');(g[k]=g[k]||[]).push(l[i]);}
    // measured in one pass (all minimums lifted together, then every width read with a single layout), so long lists
    // (thousands of rows, e.g. Brazil) don't force one layout per tag
    if(!l.length)return;var W={},old=[];for(var j=0;j<l.length;j++){old.push(l[j].style.minWidth);l[j].style.minWidth='';}
    Object.keys(g).forEach(function(k){var m=0;g[k].forEach(function(e){m=Math.max(m,e.offsetWidth);});W[k]=m;});
    for(j=0;j<l.length;j++)l[j].style.minWidth=old[j];
    Object.keys(g).forEach(function(k){var m=W[k];if(m)g[k].forEach(function(e){if(e.style.minWidth!==m+'px')e.style.minWidth=m+'px';});});}   // a group still hidden measures 0 and is left as is; showing it (a style or class change) measures again
  function later(){if(busy)return;busy=true;requestAnimationFrame(run);}
  function start(){try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&t.nodeType===1&&t.hasAttribute&&t.hasAttribute('data-wf-eqw')&&ms[i].type==='attributes')continue;later();return;}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class','hidden','aria-hidden']});}catch(x){}later();window.addEventListener('resize',later);}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();

// The projected fire shape (Projection, fire page): the outline grown unevenly, most downwind, sized to GR x its area,
// seeded by the fire so it is stable. One definition shared by the map (drawing) and the fire page (framing the +6 h shape).
// (Oct 7, 22:02) A fire with no mapped perimeter is drawn as an irregular polygon, never an ideal ellipse: the wind-stretched
// oval (-35°) with a ragged edge, stable per fire (seeded by its position). fx, fy: the fire on the map (defaults 610, 290);
// o.origin draws it at the illustrative origin (598, 298) for maps that move it with a transform; o.rx, o.ry, o.cx, o.cy size it.
window.__wfFireRing = function (fx, fy, o) { o = o || {}; fx = Number(fx) || 610; fy = Number(fy) || 290;
  var h = 11, sd = String(Math.round(fx)) + ',' + String(Math.round(fy)); for (var i0 = 0; i0 < sd.length; i0++) h = (h * 31 + sd.charCodeAt(i0)) >>> 0;
  var ph = function (k) { var x = Math.sin(h * 0.0013 + k * 7.31) * 43758.5453; return (x - Math.floor(x)) * 6.2832; };
  var cx = (o.cx != null ? o.cx : 598) + (o.origin ? 0 : fx - 610), cy = (o.cy != null ? o.cy : 298) + (o.origin ? 0 : fy - 290), rx = o.rx || 26, ry = o.ry || 14, a = -35 * Math.PI / 180, N = 72, out = [];
  for (var i = 0; i < N; i++) { var t = i / N * 6.2832, m = 1 + 0.13 * Math.sin(2 * t + ph(1)) + 0.09 * Math.sin(3 * t + ph(2)) + 0.06 * Math.sin(5 * t + ph(3)) + 0.04 * Math.sin(8 * t + ph(4)) + 0.025 * Math.sin(13 * t + ph(5));
    m = Math.max(0.72, Math.min(1.28, m)); var u = rx * m * Math.cos(t), v = ry * m * Math.sin(t); out.push([cx + u * Math.cos(a) - v * Math.sin(a), cy + u * Math.sin(a) + v * Math.cos(a)]); }
  return out; };
window.__wfRingD = function (r) { return r && r.length ? 'M' + r.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z' : ''; };
window.__wfGrowXY = function (pts, GR, seedSrc) { if (!(GR > 1) || !pts || pts.length < 3) return null;
  let h = 7; for (const ch of String(seedSrc || 'f')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const gSeed = h;
  const rr = (k) => { const x = Math.sin(gSeed * 0.001 + k * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const hk = Math.round(GR * 10), ph = [rr(1) * 6.28 + hk * 0.7, rr(2) * 6.28 + hk * 1.1, rr(3) * 6.28 + hk * 1.7], wdir = rr(4) * 6.28, wind = Math.min(1.4, 0.35 + (GR - 1) * 0.45);
  const area = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const u = q[i], v = q[(i + 1) % q.length]; a += u[0] * v[1] - v[0] * u[1]; } return Math.abs(a) / 2; };
  const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cy = pts.reduce((a, q) => a + q[1], 0) / pts.length;
  const warped = pts.map((q) => { const dx = q[0] - cx, dy = q[1] - cy, t = Math.atan2(dy, dx);
    const n = 0.5 * Math.sin(2 * t + ph[0]) + 0.3 * Math.sin(3 * t + ph[1]) + 0.2 * Math.sin(5 * t + ph[2]), b = Math.pow(Math.max(0, Math.cos(t - wdir)), 2);
    const m = 1 + 0.16 * n + wind * b; return [cx + dx * m, cy + dy * m]; });
  const k = Math.sqrt(GR * area(pts) / Math.max(1e-12, area(warped)));
  return warped.map((q, i) => { const o = pts[i], dx0 = o[0] - cx, dy0 = o[1] - cy, dx = (q[0] - cx) * k, dy = (q[1] - cy) * k, r0 = Math.hypot(dx0, dy0), r1 = Math.hypot(dx, dy);
    const f = r0 && r1 < r0 * 1.05 ? r0 * 1.05 / r1 : 1; return [cx + dx * f, cy + dy * f]; }); };

// Scroll on return (app-wide): a screen or panel you come back to opens at its top (the chat excepted: data-wf-keepscroll
// keeps its place), except when you came back with a back
// control (data-wf-back, or a screen's own back through __wfBackOrHome), where the place you left is useful and kept.
(function(){
  var KEY='wf-back-nav', mark=function(){try{sessionStorage.setItem(KEY,String(Date.now()));sessionStorage.setItem('wf-vt-back',String(Date.now()));}catch(x){}};
  // Back (Oct 3, 22:06; 22:41 from the left): the screen you go back to slides in from the left over the current one, which darkens 20%
  // as it is covered, exactly like the sections of the settings menu (same 0.53s, same ease). Other screen changes keep their dissolve.
  try{var vs=document.createElement('style');vs.textContent='html:active-view-transition-type(wfback)::view-transition-old(root){animation:wfvtDim .53s cubic-bezier(.37,0,.63,1) both}html:active-view-transition-type(wfback)::view-transition-new(root){animation:wfvtIn .53s cubic-bezier(.37,0,.63,1) both}@keyframes wfvtDim{from{filter:brightness(1)}to{filter:brightness(.8)}}@keyframes wfvtIn{from{transform:translateX(-100%)}to{transform:none}}';(document.head||document.documentElement).appendChild(vs);}catch(x){}
  // (Oct 4, replaces the split) View on a map card: the destination screen pushes up from the bottom over the current one (0.53s). It is
  // loaded in a frame first (the card's label says Loading while it does); if it needs more time it starts from grey and its content fades
  // in as it rises. When it has covered the screen the real page opens in its place: no grey screen in between.
  var PU_E='cubic-bezier(.37,0,.63,1)',PU_D=530;
  function puGrey(){return document.documentElement.classList.contains('wf-dark')?'#262629':'#F2F2F7';}   /* (Oct 5) the rising panel is the app surface, not a grey slab, until the next screen fades in */
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[data-wf-split]');if(!a||a.__wfPu)return;
    if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey)return;var dc=document.getElementById('dc-root');if(!dc||!window.Element||!dc.animate)return;
    a.__wfPu=1;e.preventDefault();var href=a.href,gone=false,snap=null;try{document.documentElement.classList.add('wf-pushing');}catch(x){}   /* (Oct 5) the tour's bubble and glow leave as the next screen rises (they drew over the rising panel) */
    var navigate=function(){if(gone)return;var hold=(window.__wfNavHold||0)-Date.now();if(hold>0){setTimeout(navigate,Math.min(hold,80));return;}gone=true;   /* the frame took the one-shot state (the tapped item) while it loaded: the real page gets it back */
      try{if(snap)sessionStorage.setItem('wf-pu-state',JSON.stringify(snap));}catch(x){}   /* read once by the real page (fit.js top), where the frame cannot reach it */
      /* (Oct 5, 02:52) a still copy of the risen screen (its drawn markup and styles, no scripts), shown by the real page from its
         very first frame until it has drawn itself: no blank screen, no flicker, on phones without view transitions too */
      try{var fd=window.__wfPuFrame&&window.__wfPuFrame.contentDocument;if(fd&&fd.body){var css=[].map.call(fd.querySelectorAll('style'),function(x){return x.textContent;}).join('\n'),lk=[].map.call(fd.querySelectorAll('link[rel=stylesheet]'),function(l){return '<link rel="stylesheet" href="'+l.href+'">';}).join(''),bd=fd.body.innerHTML.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<iframe[\s\S]*?<\/iframe>/gi,'').replace(/class="ta go"/g,'class="ta still"');
        var hs=fd.documentElement,html='<!doctype html><html class="'+(hs.className||'')+'" style="'+(hs.getAttribute('style')||'').replace(/"/g,'&quot;')+'"><head><meta charset="utf-8"><base href="'+location.href+'">'+lk+'<style>'+css+'</style></head><body style="'+(fd.body.getAttribute('style')||'').replace(/"/g,'&quot;')+'">'+bd+'</body></html>';
        if(html.length<3000000)sessionStorage.setItem('wf-pu-snap',html);}}catch(x){}
      try{sessionStorage.setItem('wf-pu-arrive',String(Date.now()));}catch(x){}   /* the real page holds this last picture until it has drawn itself */
      window.location.href=href;};
    setTimeout(function(){   /* after the card's own handlers have set the destination up */
      try{snap={};for(var q=0;q<sessionStorage.length;q++){var kk=sessionStorage.key(q);snap[kk]=sessionStorage.getItem(kk);}}catch(x){}   /* now, after the card's handlers */
      try{var lb=(a.textContent||'').trim(),L={'View':'Loading…','Ver':'A carregar…'};if(lb){a.__wfLb=lb;a.textContent=L[lb]||'…';a.setAttribute('aria-busy','true');}   /* the label says so while the next screen loads */
        var w=document.createElement('div'),f=document.createElement('iframe'),dim=document.createElement('div'),T0=Date.now(),loaded=false,rose=false,lift=false;
        w.setAttribute('aria-hidden','true');w.setAttribute('data-wf-pushup','1');w.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:300;overflow:hidden;pointer-events:none;background:'+puGrey()+';transform:translateY(100%);box-shadow:0 0 28px rgba(0,0,0,.25)';
        f.setAttribute('tabindex','-1');f.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;border:0;opacity:0;background:transparent';w.appendChild(f);window.__wfPuFrame=f;
        dim.setAttribute('data-wf-pushup','1');dim.style.cssText='position:fixed;inset:0;background:#000;opacity:0;z-index:299;pointer-events:none';document.body.appendChild(dim);document.body.appendChild(w);
        var fade=function(){if(loaded&&!f.__in){f.__in=1;f.animate([{opacity:0},{opacity:1}],{duration:rose?320:120,easing:'ease-out',fill:'forwards'});}};
        var rise=function(){if(rose)return;rose=true;fade();var an=w.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:PU_D,easing:PU_E,fill:'forwards'});dim.animate([{opacity:0},{opacity:.2}],{duration:PU_D,easing:PU_E,fill:'forwards'});
          an.onfinish=function(){var wait=function(){if(loaded||Date.now()-T0>2500)navigate();else setTimeout(wait,60);};wait();};};
        var poll=function(){try{var d=f.contentDocument;if(!loaded&&d&&d.readyState==='complete'){var r=d.getElementById('dc-root');if(r&&r.firstElementChild){loaded=true;fade();}}}catch(x){}
          if(!rose&&loaded&&Date.now()-T0>250)rise();   /* (Oct 5, 02:52) the panel rises only with the next screen drawn on it: never a blank panel */if(Date.now()-T0>2500&&!loaded){rise();return;}if(!gone)setTimeout(poll,70);};
        f.src=href;setTimeout(poll,100);}catch(x){navigate();}},0);},true);
  addEventListener('pageshow',function(){try{document.documentElement.classList.remove('wf-pushing');}catch(x){}try{document.querySelectorAll('a[data-wf-split]').forEach(function(n){n.__wfPu=0;if(n.__wfLb){n.textContent=n.__wfLb;n.__wfLb=null;}n.removeAttribute('aria-busy');});document.documentElement.classList.add('wf-back');try{dispatchEvent(new Event('wf-popclose'));}catch(x){}document.querySelectorAll('[data-wf-pushup]').forEach(function(n){n.remove();});document.documentElement.style.background='';document.body.style.background='';}catch(x){}});   /* coming back from the phone's cache: the screen whole again */
  // (Oct 4, 21:50) The push-up arrival: the last picture of the risen screen stays over the real page until it has drawn itself
  // (the live page, held invisible above it, waits for its plain loading surface to go), then appears in a short 0.2s dissolve between two identical pictures, so no blank flash.
  // (Oct 4, 22:52) the transition's own backdrop takes the app's surface colour, so the area under the clock never shows black while one screen hands over to the next
  try{var pus=document.createElement('style');pus.textContent='html::view-transition{background:#F2F2F7}html.wf-dark::view-transition{background:#262629}'+'html:active-view-transition-type(wfpu)::view-transition-old(root){animation:none;opacity:1}html:active-view-transition-type(wfpu)::view-transition-new(root){animation:wfpuHold 3s linear both}@keyframes wfpuHold{0%,93%{opacity:0}100%{opacity:1}}';(document.head||document.documentElement).appendChild(pus);}catch(x){}
  addEventListener('pagereveal',function(e){var t=0,fr=false;try{fr=window.self!==window.top;}catch(x){fr=true;}if(fr)return;try{t=+sessionStorage.getItem('wf-pu-arrive')||0;sessionStorage.removeItem('wf-pu-arrive');}catch(x){}
    if(!(e.viewTransition&&Date.now()-t<10000))return;var vt=e.viewTransition;try{vt.types.add('wfpu');}catch(x){}
    vt.ready.then(function(){var T0=Date.now(),an=null;try{an=document.getAnimations().filter(function(a){return a.effect&&a.effect.pseudoElement==='::view-transition-new(root)';})[0]||null;}catch(x){}
      var ok=function(){var r=document.getElementById('dc-root');return !document.getElementById('wf-load')&&r&&r.firstElementChild&&r.textContent.trim().length>20;};
      (function wait(){if(ok()||Date.now()-T0>2600){requestAnimationFrame(function(){requestAnimationFrame(function(){   /* drawn and painted: dissolve over the last 7% (0.21s) */
        try{if(an){var d=an.effect.getComputedTiming().duration;if(an.currentTime<d*.93)an.currentTime=d*.93;}else vt.skipTransition();}catch(x){try{vt.skipTransition();}catch(y){}}});});return;}setTimeout(wait,40);})();}).catch(function(){});},true);
  addEventListener('pagereveal',function(e){if(!e.viewTransition)return;var t=0;try{t=+sessionStorage.getItem('wf-vt-back')||0;sessionStorage.removeItem('wf-vt-back');}catch(x){}if(Date.now()-t<15000){try{e.viewTransition.types.add('wfback');}catch(x){}return;}});
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-wf-back]');if(a)mark();},true);
  var oh=window.__wfHome;if(typeof oh==='function'){window.__wfHome=function(){mark();return oh.apply(this,arguments);};}   /* the incident name's way home is a back too */
  var ob=window.__wfBackOrHome;if(typeof ob==='function'){window.__wfBackOrHome=function(){mark();return ob.apply(this,arguments);};}
  var top=function(root){try{var L=(root||document).querySelectorAll('*');for(var i=0;i<L.length;i++){var el=L[i];if(el.closest&&el.closest('[data-wf-maproot],[data-wf-keepscroll]'))continue;if(el.scrollTop>0)el.scrollTop=0;if(el.scrollLeft>0&&el.getAttribute('role')!=='tablist')el.scrollLeft=0;}if(!root)window.scrollTo(0,0);}catch(x){}};
  // the place on each screen, remembered when leaving it, for a return through a back control that reloads the screen
  var SK='wf-scroll:'+location.pathname,keyOf=function(el){return el.getAttribute('data-wf-page')!=null?'page':(el.getAttribute('role')||el.tagName)+'|'+(el.getAttribute('aria-label')||'')+'|'+(el.id||'');};
  addEventListener('pagehide',function(){try{var out=[],L=document.querySelectorAll('*');for(var i=0;i<L.length;i++){var el=L[i];if(el.scrollTop>0||el.scrollLeft>0)out.push([keyOf(el),el.scrollTop,el.scrollLeft]);}out.push(['win',scrollY,scrollX]);sessionStorage.setItem(SK,JSON.stringify(out));}catch(x){}});
  var restore=function(){var A=[];try{A=JSON.parse(sessionStorage.getItem(SK)||'[]');}catch(x){}if(!A.length)return;var t0=Date.now();
    (function step(){var left=0;A.forEach(function(q){if(q.done)return;if(q[0]==='win'){scrollTo(q[2],q[1]);q.done=1;return;}var L=document.querySelectorAll('*'),el=null;for(var i=0;i<L.length;i++){if((L[i].scrollHeight>L[i].clientHeight||L[i].scrollWidth>L[i].clientWidth)&&keyOf(L[i])===q[0]){el=L[i];break;}}
      if(el&&el.scrollHeight-el.clientHeight>=q[1]-1&&el.scrollWidth-el.clientWidth>=q[2]-1){el.scrollTop=q[1];el.scrollLeft=q[2];q.done=1;}else left++;});
      if(left&&Date.now()-t0<2500)setTimeout(step,80);})();};
  var arrive=function(ev){var t=0;try{t=+sessionStorage.getItem(KEY)||0;sessionStorage.removeItem(KEY);}catch(x){}if(Date.now()-t<15000){if(!(ev&&ev.persisted))restore();return;}   /* came back with a back control: keep the place */
    top();requestAnimationFrame(function(){top();});};
  try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(x){}
  addEventListener('pageshow',arrive);
  // Panels (dialogs, sheets, blades) that open again start at their top too
  var shown=new WeakMap(),vis=function(el){var s=el.style||{};return el.getAttribute('aria-hidden')!=='true'&&s.display!=='none'&&s.visibility!=='hidden';};
  var start=function(){try{new MutationObserver(function(M){for(var i=0;i<M.length;i++){var el=M[i].target;if(!el.getAttribute)continue;var r=el.getAttribute('role');if(r!=='dialog'&&r!=='alertdialog')continue;
      var now=vis(el),was=shown.has(el)?shown.get(el):now;shown.set(el,now);if(now&&!was)top(el);}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-hidden','style']});
    var D=document.querySelectorAll('[role=dialog],[role=alertdialog]');for(var j=0;j<D.length;j++)shown.set(D[j],vis(D[j]));}catch(x){}};
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();

// The build line's date, shared by Login and About: the date and time of the app's last design change (version.txt, a
// Unix time), shown in the viewer's own time zone and clock style. "Last update: 2 Oct 2026, at 15:53" (a US phone shows
// its own time, e.g. "7:53 AM"); PT "Última atualização: 2 out 2026, às 15:53".
window.__wfVerTxt=function(t,lang){var d=new Date(t*1000);if(isNaN(d))return '';lang=lang||window.__wfLang||'en';
  var M={en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],pt:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']};
  var hm;try{hm=new Intl.DateTimeFormat(lang==='pt'?'pt-PT':lang==='ja'?'ja-JP':undefined,{hour:'numeric',minute:'2-digit'}).format(d);}catch(e){hm=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
  if(lang==='ja')return '最終更新: '+d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+hm;
  return (lang==='pt'?'Última atualização: ':'Last update: ')+d.getDate()+' '+M[lang==='pt'?'pt':'en'][d.getMonth()]+' '+d.getFullYear()+(lang==='pt'?', às ':', at ')+hm;};
// (Oct 5) Tap the status bar to scroll to the top, as in iOS apps: in the installed app (the page runs under the status bar),
// a tap on the top edge, the status bar's own height, glides the panel or list being read back to its top, on every screen,
// panel, sheet and list. Taps on a control there are left alone. Every frame (the menu, sheets in frames) hands its taps to
// the top window, which finds the scrolled content under the middle of the screen, through frames, and glides it up.
(function(){
  var TOPW;try{TOPW=window.top;void TOPW.document;}catch(e){TOPW=window;}
  var CTRL='button,a,input,textarea,select,label,[role=button],[role=radio],[role=switch],[role=tab],[contenteditable=true]';
  // the point in the top window's viewport for a point in this document
  function toTop(x,y){var w=window;try{while(w!==TOPW&&w.frameElement){var r=w.frameElement.getBoundingClientRect(),sx=r.width/(w.innerWidth||r.width||1),sy=r.height/(w.innerHeight||r.height||1);x=r.left+x*sx;y=r.top+y*sy;w=w.parent;}}catch(e){}return [x,y];}
  if(window===TOPW){
    var zoneH=-1;
    function zone(){if(window.__wfTOP!==0)return 0;if(zoneH<0){try{var p=document.createElement('div');p.style.cssText='position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';document.documentElement.appendChild(p);zoneH=parseFloat(getComputedStyle(p).paddingTop)||0;p.remove();}catch(e){zoneH=0;}if(zoneH<20)zoneH=20;}return zoneH;}
    addEventListener('resize',function(){zoneH=-1;});addEventListener('orientationchange',function(){zoneH=-1;});
    function scrollable(el){if(!el||el.nodeType!==1)return false;var cs;try{cs=el.ownerDocument.defaultView.getComputedStyle(el);}catch(e){return false;}return /(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1;}
    // the scrolled containers under a point, from the innermost out, looking into frames
    function under(doc,x,y,out){var el;try{el=doc.elementFromPoint(x,y);}catch(e){return;}
      if(el&&el.tagName==='IFRAME'){try{var r=el.getBoundingClientRect(),d=el.contentDocument;if(d){var w=el.contentWindow;under(d,(x-r.left)*(w.innerWidth/r.width),(y-r.top)*(w.innerHeight/r.height),out);}}catch(e){}}
      for(var n=el;n&&n.nodeType===1;n=n.parentElement)if(scrollable(n)&&n.scrollTop>0&&out.indexOf(n)<0)out.push(n);
      var se=doc.scrollingElement;if(se&&se.scrollTop>0&&out.indexOf(se)<0)out.push(se);}
    // a quick, nimble glide (about 0.35 s, easing out); from far down it jumps to a screen and a half above the top, then glides
    function glide(el){var from=el.scrollTop;if(from<=0)return;var cs=el.ownerDocument.defaultView.getComputedStyle(el),snap=el.style.scrollSnapType,ov=el.style.overflowY,sb=el.style.scrollBehavior;
      el.style.scrollBehavior='auto';el.style.scrollSnapType='none';el.style.overflowY='hidden';   // stops a coasting scroll at once
      var lim=el.clientHeight*1.5;if(from>lim){el.scrollTop=lim;from=lim;}
      var t0=0,dur=350;function step(t){if(!t0){t0=t;el.style.overflowY=ov;}var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.scrollTop=Math.round(from*(1-e));
        if(k<1)requestAnimationFrame(step);else{el.scrollTop=0;el.style.scrollSnapType=snap;el.style.scrollBehavior=sb;}}
      requestAnimationFrame(step);}
    window.__wfTopTap=function(x,y){var z=zone();if(!z||y>z)return false;var W=innerWidth,H=innerHeight,out=[];
      [[W/2,H/2],[W/2,H*0.3],[W/2,H*0.7],[W*0.3,H/2]].forEach(function(p){under(document,p[0],p[1],out);});
      if(!out.length)return false;try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}out.forEach(glide);return true;};
  }
  // taps: a short touch that hardly moves, not on a control
  var d0=null;
  document.addEventListener('pointerdown',function(e){d0=null;if(e.pointerType==='mouse'&&e.button!==0)return;try{if(e.target&&e.target.closest&&e.target.closest(CTRL))return;}catch(x){}d0=[e.clientX,e.clientY,Date.now()];},{capture:true,passive:true});
  document.addEventListener('pointerup',function(e){var o=d0;d0=null;if(!o||Date.now()-o[2]>500||Math.hypot(e.clientX-o[0],e.clientY-o[1])>10)return;var p=toTop(e.clientX,e.clientY);try{if(TOPW.__wfTopTap)TOPW.__wfTopTap(p[0],p[1]);}catch(x){}},{capture:true,passive:true});
})();

// (Oct 6) Houses in reach of a fire's projection: each projected shape (+1 / +3 / +6 h, the same shapes the map draws) is
// checked against OpenStreetMap (Overpass): buildings that are homes or could be (sheds, barns, industry left out) and named
// places inside it, beyond those already inside the current outline. Real map data; the projected shapes themselves are
// the app's projection. A horizon that reaches houses gets a red dot on the projection switcher; the fire's screen shows a
// pulsing red warning that opens the earliest one. Results are kept for 6 hours per fire on this phone.
(function () {
  var G = { 1: 1.6, 3: 2, 6: 3.6 }, HZ = [1, 3, 6], MEM = {}, TTL = 6 * 3600e3, LK = 'wf-homes4-', MIN_B = 3;
  var NOT = '^(garage|garages|shed|barn|farm_auxiliary|greenhouse|industrial|warehouse|roof|carport|hangar|silo|storage_tank|construction|ruins|service|transformer_tower|bunker|kiosk|toilets|cowshed|stable|sty|bridge)$';
  function toLL(x, y) { return [34.19 - (y - 662) / 2829, (x - 518) / 2345 - 118.13]; }
  function rings(id, ll, px) {
    var out = {};
    if (!window.__wfGrowXY) return out;
    if (ll && ll.length > 2) { var c = Math.cos((ll[0][0] || 0) * Math.PI / 180) || 1, b = ll.map(function (q) { return [q[1] * c, q[0]]; }); out[0] = ll;
      HZ.forEach(function (h) { var g = window.__wfGrowXY(b, G[h], id); if (g) out[h] = g.map(function (q) { return [q[1], q[0] / c]; }); }); }
    else if (px && px.length > 2) { out[0] = px.map(function (q) { return toLL(q[0], q[1]); });
      HZ.forEach(function (h) { var g = window.__wfGrowXY(px, G[h], id); if (g) out[h] = g.map(function (q) { return toLL(q[0], q[1]); }); }); }
    return out; }
  function thin(r, n) { if (r.length <= n) return r; var o = [], st = r.length / n; for (var i = 0; i < n; i++) o.push(r[Math.floor(i * st)]); return o; }
  function poly(r) { return thin(r, 40).map(function (q) { return q[0].toFixed(5) + ' ' + q[1].toFixed(5); }).join(' '); }
  function inside(p, r) { var a = false; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var yi = r[i][0], xi = r[i][1], yj = r[j][0], xj = r[j][1];
    if (((yi > p[0]) !== (yj > p[0])) && (p[1] < (xj - xi) * (p[0] - yi) / ((yj - yi) || 1e-12) + xi)) a = !a; } return a; }
  function emit() { try { window.dispatchEvent(new Event('wf-homes')); } catch (e) {} }
  function load(id) { try { var v = JSON.parse(localStorage.getItem(LK + id) || 'null'); if (v && Date.now() - v.t < TTL) return v; } catch (e) {} return null; }
  // id: the fire; ll: its current outline [[lat, lon]…] when mapped; px: else the map's illustrative outline in map pixels
  // RR: the shapes themselves ({ 0, 1, 3, 6 } in [lat, lon]) when the caller draws its own (an ignition candidate's projection)
  window.__wfHomesCheck = function (id, ll, px, RR) {
    if (!id) return null; var sig = RR && RR[6] ? 'r' + RR[6].length + ':' + RR[6][0].map(function (v) { return v.toFixed(4); }).join(',') + ':' + RR[6][Math.floor(RR[6].length / 2)].map(function (v) { return v.toFixed(4); }).join(',') : (ll && ll.length ? 'l' + ll.length + ':' + ll[0].join(',') : 'p' + (px && px.length ? px[0].join(',') : ''));
    var m = MEM[id]; if (m && m.sig === sig) return m.st === 'done' ? m.res : null;
    var c = load(id); if (c && c.sig === sig) { MEM[id] = { sig: sig, st: 'done', res: c }; return c; }
    var R = RR || rings(id, ll, px); if (!R[0] || !R[6]) return null;
    MEM[id] = { sig: sig, st: 'loading' };
    var q = '[out:json][timeout:25];' + [0].concat(HZ).map(function (h) { return 'way["building"]["building"!~"' + NOT + '"](poly:"' + poly(R[h]) + '");out count;'; }).join('') +
      'node["place"~"^(city|town|village|hamlet|suburb|neighbourhood|quarter)$"](poly:"' + poly(R[6]) + '");out body 40;' +
      /* (Oct 7) where they are: residential areas and the buildings themselves, drawn in red under the projection */
      'way["landuse"="residential"](poly:"' + poly(R[6]) + '");out geom 40;way["building"]["building"!~"' + NOT + '"](poly:"' + poly(R[6]) + '");out center 600;';
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (js) {
        var E = js.elements || [], cnt = E.filter(function (e) { return e.type === 'count'; }).map(function (e) { return +((e.tags || {}).ways || (e.tags || {}).total || 0); });
        var pl = E.filter(function (e) { return e.type === 'node' && e.tags && e.tags.name; });
        var res = { sig: sig, t: Date.now(), n: {}, b: {}, place: {}, at: {}, first: null };
        HZ.forEach(function (h, i) { var nb = Math.max(0, (cnt[i + 1] || 0) - (cnt[0] || 0)), p = pl.filter(function (e) { var P = [e.lat, e.lon]; return inside(P, R[h]) && !inside(P, R[0]); });
          res.b[h] = nb; res.place[h] = p.length ? p[0].tags.name : ''; res.at[h] = nb >= MIN_B || p.length > 0; if (res.at[h] && res.first == null) res.first = h; });
        var hOf = function (P) { if (inside(P, R[0])) return 0; for (var k = 0; k < HZ.length; k++) if (inside(P, R[HZ[k]])) return HZ[k]; return 0; }, r5 = function (v) { return Math.round(v * 1e5) / 1e5; };
        res.pts = E.filter(function (e) { return e.type === 'way' && e.center && e.tags && e.tags.building; }).map(function (e) { var P = [e.center.lat, e.center.lon]; return [r5(P[0]), r5(P[1]), hOf(P)]; }).filter(function (q) { return q[2]; });
        res.areas = E.filter(function (e) { return e.type === 'way' && e.geometry && e.tags && e.tags.landuse === 'residential'; }).map(function (e) { var g = thin(e.geometry.map(function (q) { return [r5(q.lat), r5(q.lon)]; }), 32), hs = g.map(hOf).filter(Boolean);
          return { h: hs.length ? Math.min.apply(null, hs) : 0, r: g }; }).filter(function (a) { return a.h; });
        /* (Oct 7) a precise time, not the horizon: each structure's arrival is read between the two projected shapes around it
           (from the fire's centre, how far it sits between the earlier outline and the later one); the earliest one leads,
           with the structures reached by the end of that horizon as the count */
        (function () { var c0 = R[0].reduce(function (a, q) { return [a[0] + q[0] / R[0].length, a[1] + q[1] / R[0].length]; }, [0, 0]), k = Math.cos(c0[0] * Math.PI / 180) || 1;
          var xy = function (q) { return [(q[1] - c0[1]) * k, q[0] - c0[0]]; };
          var reach = function (r, ux, uy) { var m = 0; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var a = xy(r[j]), b = xy(r[i]), ex = b[0] - a[0], ey = b[1] - a[1], den = ux * ey - uy * ex; if (Math.abs(den) < 1e-15) continue;
            var t = (a[0] * ey - a[1] * ex) / den, s = (a[0] * uy - a[1] * ux) / den; if (t > 0 && s >= 0 && s <= 1) m = Math.max(m, t); } return m; };
          var eta = function (P, h) { var v = xy(P), d = Math.hypot(v[0], v[1]); if (!d) return 0; var ux = v[0] / d, uy = v[1] / d, i = HZ.indexOf(h), hp = i > 0 ? HZ[i - 1] : 0;
            var rp = reach(R[hp], ux, uy), rh = reach(R[h], ux, uy), fr = rh > rp ? Math.min(1, Math.max(0, (d - rp) / (rh - rp))) : 1; return hp + (h - hp) * fr; };
          var T = (res.pts || []).map(function (q) { return eta([q[0], q[1]], q[2]); });
          pl.forEach(function (e) { var P = [e.lat, e.lon], h = 0; if (inside(P, R[0])) return; for (var z = 0; z < HZ.length; z++) if (inside(P, R[HZ[z]])) { h = HZ[z]; break; } if (h) T.push(eta(P, h)); });
          if (T.length && res.first != null) { res.eta = Math.min.apply(null, T); res.nAt = (res.pts || []).filter(function (q) { return q[2] && q[2] <= res.first; }).length || res.b[res.first] || 0; } })();
        MEM[id] = { sig: sig, st: 'done', res: res }; try { localStorage.setItem(LK + id, JSON.stringify(res)); } catch (e) {} emit();
      }).catch(function () { MEM[id] = { sig: sig, st: 'fail' }; setTimeout(function () { if (MEM[id] && MEM[id].st === 'fail') delete MEM[id]; }, 60000); });   /* no answer, no warning: tried again a minute later */
    return null; };
  // (Oct 7) the populated areas reached by the projection up to horizon h, as one SVG path in the map's own units
  // (residential areas, and a 24 m round per building so isolated houses show too); one path, so overlaps stay one red
  window.__wfHomesPath = function (id, h) { var res = window.__wfHomesGet(id); if (!res || !h || (!res.pts && !res.areas)) return '';
    var X = function (lo) { return (lo + 118.13) * 2345 + 518; }, Y = function (la) { return (34.19 - la) * 2829 + 662; }, d = '';
    (res.areas || []).forEach(function (a) { if (a.h <= h && a.r.length > 2) d += 'M' + a.r.map(function (q) { return X(q[1]).toFixed(1) + ' ' + Y(q[0]).toFixed(1); }).join('L') + 'Z'; });
    (res.pts || []).forEach(function (q) { if (q[2] > h) return; var x = X(q[1]), y = Y(q[0]), r = 24 / 111320 * 2829;   /* (Oct 8, 18:58) 40% smaller round per building (was 40 m) */ d += 'M' + (x - r).toFixed(2) + ' ' + y.toFixed(2) + 'a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (2 * r).toFixed(2) + ' 0a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (-2 * r).toFixed(2) + ' 0'; });
    return d; };
  window.__wfHomesGet = function (id) { var m = MEM[id]; if (m && m.st === 'done') return m.res; var c = load(id); return c || null; };
  // Understood: the floating warning goes for this incident; the tag on its page stays. It comes back if houses come into reach sooner.
  var AK = 'wf-homes-ack';
  function acks() { try { return JSON.parse(localStorage.getItem(AK) || '{}') || {}; } catch (e) { return {}; } }
  window.__wfHomesAck = function (id, h) { var A = acks(); A[id] = h; try { localStorage.setItem(AK, JSON.stringify(A)); } catch (e) {} emit(); };
  window.__wfHomesUnack = function (id) { var A = acks(); delete A[id]; try { localStorage.setItem(AK, JSON.stringify(A)); } catch (e) {} emit(); };
  window.__wfHomesAcked = function (id, res) { var a = acks()[id]; return a != null && res && res.first != null && res.first >= a; };
  // The warning: a red pill floating over the screen (32px from the bottom, above the new assignment card when it shows),
  // a soft red glow of its own colour pulsing round it. o: { h, title, sub, aria, go } or null to remove it.
  function css() { if (document.getElementById('wf-homes-css')) return; var s = document.createElement('style'); s.id = 'wf-homes-css';
    s.textContent = '#wf-homes{box-shadow:0 0 30px rgba(0,0,0,0.16)}';   /* (Oct 7) a frosted notification panel, no red glow */
    document.head.appendChild(s); }
  // (Oct 7) the people-at-risk badge on the title line: a rounded red triangle with "!"; a tap shows a small tooltip
  // ("People at risk" over the warning's words) that grows from the badge; a tap on the tooltip opens that horizon, a tap outside closes it
  (function () {
    try { var s = document.createElement('style'); s.textContent = ':root .btn.wf-hmok,:root .btn.wf-hmok:hover,:root .btn.wf-hmok:active{background:rgb(215, 0, 21)!important;color:rgb(255, 255, 255)!important}' +   /* (Oct 8) the warning's OK in the warning's red, like its triangle; white text 5.3:1 */ '.wf-hmtag{position:relative}.wf-hmtag>svg{position:absolute;inset:14%;width:72%!important;height:72%!important}.wf-hmtag{-webkit-tap-highlight-color:transparent;touch-action:none;transition:opacity .25s ease,transform .3s cubic-bezier(.2,.8,.2,1),background-color .25s ease}' + ':root .wf-hmtag[data-docked="0"]{pointer-events:none}:root ' + 'html.wf-hm-docking .wf-hmtag{visibility:hidden}html.wf-hm-drag .wf-hmtag[data-docked="0"]{opacity:1}html.wf-hm-near .wf-hmtag[data-docked="0"]{transform:scale(1.15);background:rgba(118,118,128,0.24)!important}.wf-hmtag.wf-hm-hide{visibility:hidden}' + '#wf-hmtip{position:fixed;z-index:420;max-width:260px;box-sizing:border-box;padding:16px;border-radius:16px;background:var(--wf-surface,#FFFFFF);color:var(--wf-ink,#1C1C1E);box-shadow:0 0 30px rgba(0,0,0,.16);transform-origin:top right;transform:scale(.6);opacity:0;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s ease;-webkit-user-select:none;user-select:none}#wf-hmtip.on{transform:none;opacity:1}#wf-hmtip b{display:block;font-size:16px;line-height:20px;font-weight:600}#wf-hmtip span{display:block;margin-top:4px;font-size:16px;line-height:20px;color:var(--wf-sec,#545458)}'; (document.head || document.documentElement).appendChild(s); } catch (e) {}
    /* (Oct 7, 21:04, standing) the triangle is exactly as tall as the stage tag beside it, on every screen: the badge stretches to the
       tag's row, its drawing fills that box (trimmed to the triangle) and its width follows the triangle's proportions */
    var fq = 0; function fitB() { fq = 0; var B = document.querySelectorAll('.wf-hmtag'); for (var i = 0; i < B.length; i++) { var b = B[i], t = b.previousElementSibling;
        /* (Oct 7, 22:05) the height of the stage tag beside it, set outright (not left to the row, which Safari can size differently) */
        if (b.parentElement && b.parentElement.style.alignItems !== 'center') b.parentElement.style.alignItems = 'center';   /* the tag keeps its own height: nothing stretches it */
        /* (Oct 8) a band that unfolds (the chat's stage band): its tag row, not the whole band, so the badge never grows with it and stays level with the row */
        var row = t && t.matches && t.matches('[data-wf-stband]') ? t.firstElementChild : null, tg = t && t.querySelector ? (t.querySelector('.qtag') || row || t) : null, h = tg ? tg.offsetHeight : b.offsetHeight;   /* (Oct 8, 21:32) layout height, not the on-screen box: on a turned screen the box's height is its width */ if (!(h > 0)) continue;
        var hs = h.toFixed(2) + 'px', w = (h * 34 / 28.5).toFixed(2) + 'px', al = row ? 'flex-start' : 'center'; if (b.style.height !== hs || b.style.alignSelf !== al) { b.style.height = hs; b.style.alignSelf = al; } if (b.style.width !== w) b.style.width = w; } }
    function askFit() { if (!fq) { fq = 1; requestAnimationFrame(fitB); } }
    try { new MutationObserver(askFit).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] }); } catch (e) {}
    addEventListener('resize', askFit); addEventListener('load', askFit);
    var tip = null, src = null;
    function close() { if (!tip) return; var t = tip; tip = null; src = null; t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }
    function open(b) {
      close(); src = b; var PT = window.__wfLang === 'pt', go = b.querySelector('[data-hm-go]'), sub = b.getAttribute('data-tip-sub') || '', ttl = b.getAttribute('data-tip-title') || (PT ? 'Habitações ameaçadas' : 'Structures threatened');
      tip = document.createElement('div'); tip.id = 'wf-hmtip'; tip.setAttribute('role', 'tooltip');
      tip.innerHTML = '<b>' + ttl.replace(/</g, '&lt;') + '</b>' + (sub ? '<span>' + sub.replace(/</g, '&lt;') + '</span>' : '');   /* (Oct 7) the same words as the floating warning */
      if (go) tip.style.cursor = 'pointer';
      tip.addEventListener('click', function (e) { e.stopPropagation(); var g = go; close(); if (g) g.click(); });
      document.body.appendChild(tip);
      var r = b.getBoundingClientRect(); tip.style.top = Math.round(r.bottom + 8) + 'px'; tip.style.right = Math.max(16, Math.round(window.innerWidth - r.right)) + 'px';
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (tip) tip.classList.add('on'); }); });
    }
    document.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-hm-go]')) return;   /* the tooltip's own call through to the page */
      var b = e.target && e.target.closest ? e.target.closest('.wf-hmtag') : null;
      if (b) { e.stopPropagation(); e.preventDefault(); if (b.__moved || b.getAttribute('data-docked') !== '1') return; try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} if (src === b) close(); else open(b); return; }
      if (tip && !(e.target.closest && e.target.closest('#wf-hmtip'))) close();
    }, true);
    document.addEventListener('scroll', close, true); window.addEventListener('resize', close);
  })();
  var el = null, tap = null, ack = null, sig0 = '', pull = null;
  // (Oct 7) the dock: the badge's place on the title line. Drag the warning onto it and it is sucked in, becoming the badge
  // (the warning's glass, the triangle in red); drag the badge out and the full warning comes back under the finger.
  function zone() { var Z = document.querySelectorAll('.wf-hmtag'); for (var i = 0; i < Z.length; i++) { var r = Z[i].getBoundingClientRect(); if (r.width > 0) return Z[i]; } return null; }
  var nearOn = false;
  function near(x, y, on) { var z = on ? zone() : null, r = z ? z.getBoundingClientRect() : null, n = !!(r && Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < 72);
    document.documentElement.classList.toggle('wf-hm-drag', !!(on && z)); document.documentElement.classList.toggle('wf-hm-near', n);
    if (n !== nearOn) { nearOn = n; if (n) { try { if (navigator.vibrate) navigator.vibrate(6); } catch (x) {} } } return n; }
  var docking = false;
  function dock() { var z = zone(), p = el; if (!p) return; var f0 = ack; el = null; sig0 = ''; p.id = 'wf-homes-morph';
    if (!z) { near(0, 0, false); if (f0) f0(); p.remove(); return; }
    /* (Oct 7) robust: the page learns it is docked at once (its badge stays hidden until the morph lands), nothing can
       bring a second warning up meanwhile, and the morph is always cleared, whatever happens */
    docking = true; document.documentElement.classList.add('wf-hm-docking'); try { if (f0) f0(); } catch (x) {}
    try { if (navigator.vibrate) navigator.vibrate([8, 40, 16]); } catch (x) {}
    var r = p.getBoundingClientRect(), zr = z.getBoundingClientRect(), ic = p.querySelector('svg');
    p.style.transition = 'none'; p.style.translate = '0px 0px'; p.style.transform = 'none'; p.style.left = r.left + 'px'; p.style.top = r.top + 'px'; p.style.right = 'auto'; p.style.bottom = 'auto'; p.style.width = r.width + 'px'; p.style.height = r.height + 'px'; p.style.maxWidth = 'none'; p.style.margin = '0'; p.style.minHeight = '0'; p.style.pointerEvents = 'none';
    [].forEach.call(p.children, function (c) { if (c !== ic) { c.style.transition = 'opacity .12s ease'; c.style.opacity = '0'; c.style.position = 'absolute'; c.style.pointerEvents = 'none'; } });   /* out of the flow: the triangle stays centred as the panel closes in */
    p.style.justifyContent = 'center'; p.style.gap = '0px';
    requestAnimationFrame(function () { requestAnimationFrame(function () { var E = '.45s cubic-bezier(.4,0,.2,1)';
      p.style.transition = 'left ' + E + ',top ' + E + ',width ' + E + ',height ' + E + ',border-radius ' + E + ',padding ' + E;
      p.style.left = zr.left + 'px'; p.style.top = zr.top + 'px'; p.style.width = zr.width + 'px'; p.style.height = zr.height + 'px'; p.style.padding = '0px'; p.style.borderRadius = '16px';
      ic.style.transition = 'transform ' + E; ic.style.transformOrigin = '50% 50%'; ic.style.transform = 'scale(' + Math.min((zr.width - 8) / 36, (zr.height - 8) / 32) + ')';
      p.style.transition += ',background-color ' + E + ',box-shadow ' + E; p.classList.remove('wf-glass'); p.style.background = 'transparent'; p.style.boxShadow = 'none'; p.style.webkitBackdropFilter = 'none'; p.style.backdropFilter = 'none'; }); });   /* (Oct 7) it lands as the bare triangle: the glass melts away */
    setTimeout(function () { try { near(0, 0, false); } catch (x) {} try { p.remove(); } catch (x) {} docking = false; document.documentElement.classList.remove('wf-hm-docking'); setTimeout(function () { var b = zone(); try { if (b) b.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' }); if (navigator.vibrate) navigator.vibrate(10); } catch (x) {} }, 30); }, 470); }
  // pulling the badge out: past 10px it pops (a tick), the warning comes back under the finger and follows it
  document.addEventListener('pointerdown', function (e) { var b = e.target && e.target.closest ? e.target.closest('.wf-hmtag[data-docked="1"]') : null; if (!b) return;
    pull = { b: b, x: e.clientX, y: e.clientY, on: false }; b.__moved = false; }, true);
  document.addEventListener('pointermove', function (e) { if (!pull) return;
    if (!pull.on) { if (Math.hypot(e.clientX - pull.x, e.clientY - pull.y) < 10) return; pull.on = true; pull.b.__moved = true; var id = pull.b.getAttribute('data-hm-id');
      try { if (navigator.vibrate) navigator.vibrate([12, 30, 8]); } catch (x) {} pull.b.classList.add('wf-hm-hide'); if (window.__wfHomesUnack) window.__wfHomesUnack(id); }
    pull.cx = e.clientX; pull.cy = e.clientY; if (el && el.__to) el.__to(e.clientX, e.clientY); near(e.clientX, e.clientY, true); e.preventDefault(); }, { capture: true, passive: false });
  var pullUp = function (e) { if (!pull) return; var P = pull; pull = null; P.b.classList.remove('wf-hm-hide'); setTimeout(function () { P.b.__moved = false; }, 350); if (!P.on) return;
    if (el && near(e.clientX, e.clientY, true)) dock(); else near(0, 0, false); };
  document.addEventListener('pointerup', pullUp, true); document.addEventListener('pointercancel', pullUp, true);
  // (Oct 7) the warning floats like the app's other floating panels (the tour bubble): drag it anywhere but its button,
  // throw it and it glides to a stop; it stays where it was put, kept 8px inside the screen
  function drag(p) {
    var st = null, fl = 0, dx = 0, dy = 0;
    var clamp = function () { p.style.translate = '0px 0px'; var r = p.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
      dx = Math.min(W - 8 - r.right, Math.max(8 - r.left, dx)); dy = Math.min(H - 8 - r.bottom, Math.max(8 - r.top, dy)); p.style.translate = dx + 'px ' + dy + 'px'; };
    p.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; cancelAnimationFrame(fl); st = { x: e.clientX, y: e.clientY, dx: dx, dy: dy, moved: false, tr: [] }; try { p.setPointerCapture(e.pointerId); } catch (x) {} });
    p.__to = function (x, y) { p.style.translate = '0px 0px'; var r = p.getBoundingClientRect(); dx = x - (r.left + 34); dy = y - (r.top + r.height / 2); clamp(); };   /* the triangle under the finger */
    p.addEventListener('pointermove', function (e) { if (!st) return; var mx = e.clientX - st.x, my = e.clientY - st.y; if (!st.moved && Math.hypot(mx, my) < 6) return;
      st.moved = true; p.style.cursor = 'grabbing'; dx = st.dx + mx; dy = st.dy + my; clamp(); near(e.clientX, e.clientY, true); var t = performance.now(); st.tr.push([t, e.clientX, e.clientY]); while (st.tr.length > 2 && t - st.tr[0][0] > 90) st.tr.shift(); e.preventDefault(); });
    var up = function (e) { if (!st) return; var s = st; st = null; p.style.cursor = 'grab'; if (!s.moved) return; p.__moved = true; setTimeout(function () { p.__moved = false; }, 350);
      if (e && e.type === 'pointerup' && near(e.clientX, e.clientY, true)) { dock(); return; } near(0, 0, false);
      var a = s.tr[0], z = s.tr[s.tr.length - 1], dt = a && z ? Math.max(16, z[0] - a[0]) : 16, vx = a && z ? (z[1] - a[1]) / dt * 16 : 0, vy = a && z ? (z[2] - a[2]) / dt * 16 : 0;
      (function glide() { vx *= 0.92; vy *= 0.92; if (Math.hypot(vx, vy) < 0.3) return; dx += vx; dy += vy; clamp(); fl = requestAnimationFrame(glide); })(); };
    p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up);
    window.addEventListener('resize', function () { if (p.isConnected) clamp(); });
  }
  window.__wfHomesAlert = function (o) {
    if (docking) return;
    if (!o) { if (el) { var e0 = el; el = null; sig0 = ''; e0.style.opacity = '0'; e0.style.transform = 'translateY(16px)'; setTimeout(function () { e0.remove(); }, 400); } return; }
    css(); tap = o.go; ack = o.ack; var PT = window.__wfLang === 'pt';
    var off = document.getElementById('wf-offer'), bot = 32 + (off && off.offsetHeight ? off.offsetHeight + 16 : 0);
    if (!el) { el = document.createElement('div'); el.id = 'wf-homes'; el.className = 'wf-glass'; el.setAttribute('role', 'alert');
      el.style.cssText = 'position: fixed; left: 16px; right: 16px; bottom: ' + bot + 'px; z-index: 410; max-width: 420px; margin: 0 auto; display: flex; align-items: center; gap: 16px; box-sizing: border-box; min-height: 64px; padding: 16px; border-radius: 16px; color: var(--wf-ink, rgb(28, 28, 30)); opacity: 0; transform: translateY(16px); transition: opacity .4s ease, transform .5s cubic-bezier(.2,.8,.2,1), bottom .4s ease; -webkit-user-select: none; user-select: none';
      el.style.touchAction = 'none'; el.style.cursor = 'grab'; drag(el);
      el.addEventListener('click', function (e) { if (el && el.__moved) { el.__moved = false; return; } try { if (navigator.vibrate) navigator.vibrate(10); } catch (x) {}
        if (e.target.closest('[data-hm-ack]')) { dock(); return; }   /* OK: into the badge's place too */
        if (tap) tap(); });
      document.body.appendChild(el);
      if (pull && pull.on) { var e1 = el; e1.style.transition = 'none'; e1.style.opacity = '1'; e1.style.transform = 'scale(.4)'; e1.style.transformOrigin = '34px 50%'; requestAnimationFrame(function () { e1.style.transition = 'opacity .4s ease, transform .35s cubic-bezier(.2,.8,.2,1), bottom .4s ease'; e1.style.transform = 'none'; }); }
      else requestAnimationFrame(function () { requestAnimationFrame(function () { if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0px)'; } }); }); }
    el.style.bottom = bot + 'px';
    var s = o.title + '|' + o.sub; if (s !== sig0) { sig0 = s;
      el.innerHTML = '<svg width="36" height="32" viewBox="0 0 36 32" aria-hidden="true" style="flex-shrink: 0"><path d="M18 5 32.5 28.5H3.5Z" fill="rgb(215, 0, 21)" stroke="rgb(215, 0, 21)" stroke-width="5" stroke-linejoin="round"></path><rect x="16.5" y="11" width="3" height="10" rx="1.5" fill="rgb(255, 255, 255)"></rect><circle cx="18" cy="24.6" r="1.8" fill="rgb(255, 255, 255)"></circle></svg><span role="button" tabindex="0" aria-label="' + (o.title + '. ' + o.sub).replace(/"/g, '&quot;') + '" style="display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; cursor: pointer"><span style="font-size: 18px; font-weight: 600; line-height: 24px">' + o.title + '</span>' + (o.sub ? '<span style="font-size: 16px; font-weight: 400; line-height: 20px; color: var(--wf-ink2, rgb(84, 84, 88))">' + o.sub + '</span>' : '') + '</span>' +
        '<button type="button" class="btn wf-sec wf-hmok" data-hm-ack style="flex-shrink: 0; padding: 0 16px; border: 0; font: inherit; cursor: pointer">' + 'OK' + '</button>'; }
    if (pull && pull.on && pull.cx != null && el.__to) el.__to(pull.cx, pull.cy); };
  // the warning's words, shared by the fire page and the chat's fire card: the earliest horizon, then its buildings and place
  // (Oct 7) what first, then when, precise (not the projection's horizon): "~8 structures at risk in 2 h 10 min"; the place
  // alone under it. The time counts down from when the projection was read; to the nearest 5 min.
  // (Oct 7, 22:04, standing) text on glass stays readable: what lies under a glass panel is sampled (a video frame, the
  // page's own colour), blended with the glass tint; when dark ink would fall under 4.5:1 there, the text turns white.
  var LUM = function (c) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  var CR = function (a, b) { var x = LUM(a), y = LUM(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  var cvs = null;
  function under(el, x, y) { var L = document.elementsFromPoint(x, y) || [];
    for (var i = 0; i < L.length; i++) { var e = L[i]; if (e === el || el.contains(e)) continue;
      if (e.tagName === 'VIDEO' || e.tagName === 'IMG') { try { cvs = cvs || document.createElement('canvas'); cvs.width = cvs.height = 1; var r = e.getBoundingClientRect(), w = e.videoWidth || e.naturalWidth, h = e.videoHeight || e.naturalHeight; if (!w || !h) continue;
          var cx = ctxOf(); cx.drawImage(e, (x - r.left) / r.width * w, (y - r.top) / r.height * h, 2, 2, 0, 0, 1, 1); var d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; } catch (x1) { continue; } }   /* a tile that cannot be read: look further down */
      for (var a = e; a; a = a.parentElement) { var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(a).backgroundColor || ''); if (m) { var v = m[1].split(',').map(Number); if (v.length < 4 || v[3] > 0.5) return [v[0], v[1], v[2]]; } }
      return null; }
    return null; }
  function ctxOf() { return cvs.getContext('2d', { willReadFrequently: true }); }
  window.__wfGlassInk = function (el) { if (!el || !el.getBoundingClientRect) return; var r = el.getBoundingClientRect(); if (!r.width) return;
    var P = [[0.2, 0.3], [0.5, 0.3], [0.8, 0.3], [0.2, 0.7], [0.5, 0.7], [0.8, 0.7]], worst = 99, ink = [28, 28, 30];
    P.forEach(function (q) { var c = under(el, r.left + r.width * q[0], r.top + r.height * q[1]); if (!c) return; var g = [c[0] * 0.76 + 60 * 0.24, c[1] * 0.76 + 60 * 0.24, c[2] * 0.76 + 67 * 0.24]; worst = Math.min(worst, CR(ink, g)); });
    el.classList.toggle('wf-ondark', worst < 4.5); };
  try { var sd = document.createElement('style'); sd.textContent = '.wf-ondark,.wf-ondark span,.wf-ondark b{color:#FFFFFF!important}.wf-ondark span span{color:rgba(255,255,255,0.88)!important}'; (document.head || document.documentElement).appendChild(sd); } catch (e) {}
  setInterval(function () { var w = document.getElementById('wf-homes'); if (w) window.__wfGlassInk(w); }, 500);
  window.__wfHomesText = function (res, pt) { if (!res || res.first == null) return null; var h = res.first, p = res.place[h] || '', b = res.nAt || res.b[h] || 0;
    var hrs = res.eta != null ? Math.max(0, res.eta - (Date.now() - (res.t || Date.now())) / 3600e3) : h, m = Math.round(hrs * 60 / 5) * 5;
    var when = m <= 0 ? (pt ? ' agora' : ' now') : (pt ? ' em ' : ' in ') + (m >= 60 ? Math.floor(m / 60) + '\u00a0h' + (m % 60 ? '\u00a0' + (m % 60) + '\u00a0min' : '') : m + '\u00a0min')   /* the time never splits across lines */;
    var what = b ? '~' + b + (pt ? (b === 1 ? ' habitação em risco' : ' habitações em risco') : (b === 1 ? ' structure at risk' : ' structures at risk')) : (pt ? 'Habitações em risco' : 'Structures at risk');
    return { h: h, title: what + when, sub: p ? p + '.' : '', tag: what + when }; };
})();
// (Oct 7) the unit icons, one set for the whole app (Crews tab units, summary vehicles): 24px line drawings, stroke 1.8
window.__wfUnitIC = { crew: 'M8.5 7.2a3.5 3.5 0 0 1 7 0M7 7.2h10M12 7.2v0M9.2 8.6a2.8 2.8 0 0 0 5.6 0M5.5 20.5v-1.8a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v1.8',
            tender: 'M5.5 6.5h6a3 3 0 0 1 3 3v.5a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-.5a3 3 0 0 1 3-3Z M8.5 7.9c.8 1 1.3 1.7 1.3 2.3a1.3 1.3 0 0 1-2.6 0c0-.6.5-1.3 1.3-2.3Z M2.5 15.5h1.8M8.6 15.5h6.8M19.6 15.5h1.4v-3.3L18.6 8.5h-3.1v7 M6.5 13v2.5 M4.4 16.8a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M15.4 16.8a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
            engine: 'M2.5 7.5h11v9h-11Z M13.5 10.5h4l3 3v3h-7 M5.3 18.4a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0 M15.3 18.4a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0 M2.5 5.5l9-1.5M5 5.1l.4 2.4M8.5 4.5l.4 2.4',
            heli: 'M3 5h16M11 5v3 M6.5 8H13a5 5 0 0 1 5 5 2.5 2.5 0 0 1-2.5 2.5H9A4.5 4.5 0 0 1 4.5 11 3 3 0 0 1 6.5 8Z M17.8 12H22.5M22.5 10v4 M8 15.5v3M14.5 15.5v3M5 18.5h12.5', tanker: 'M12 2c.8 0 1.3.9 1.3 2v5.5h8.2v2.3l-8.2 1.4v5.4l2.9 1.8V22H7.8v-1.6l2.9-1.8v-5.4l-8.2-1.4V9.5h8.2V4c0-1.1.5-2 1.3-2Z M6 9.5V7.5M18 9.5V7.5 M4.5 7.5h3M16.5 7.5h3', plane: 'M12 2.5c.9 0 1.4 1.4 1.4 2.8v4.3l7.1 4.2v1.9l-7.1-2.3v4.1l2.3 1.8v1.4L12 19.8l-3.7.9v-1.4l2.3-1.8v-4.1l-7.1 2.3v-1.9l7.1-4.2V5.3c0-1.4.5-2.8 1.4-2.8Z' };
// (Oct 7) back on a screen (from an incident): no map card left open, never a "Loading…" label; the cards come back on the next tap
(function(){try{var s=document.createElement('style');s.textContent='html.wf-back .wfpop{display:none!important}';(document.head||document.documentElement).appendChild(s);
  addEventListener('pointerdown',function(){document.documentElement.classList.remove('wf-back');},true);}catch(e){}})();

// (Oct 8, standing) Mini KPI cards: one shared reorder for every group in the app. Press and hold (250 ms) lifts a card; moving it
// over another place makes room there; letting go keeps the new order (localStorage SK). Cards: [data-wf-kpi][data-g=grp].
window.__wfKpiDrag = function (self, key, grp, onTap, SK) {
    // While a card is lifted the page must not scroll, so it can move up and down too (touch-action is fixed at touch start,
    // so the scroll is stopped here, on each touch move, only while a card is held)
    if (!window.__wfKpiTM) { window.__wfKpiTM = true; document.addEventListener('touchmove', (e) => { if (window.__wfKpiLift) e.preventDefault(); }, { passive: false, capture: true }); }
    /* in the order they show (layout position, transforms aside), so a group laid out with CSS order works too */
    const cards = () => [...document.querySelectorAll('[data-wf-kpi][data-g="' + grp + '"]')].sort((a, b) => (a.offsetTop - b.offsetTop) || (a.offsetLeft - b.offsetLeft));
    const reset = () => cards().forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; c.style.transition = ''; const k = c.querySelector('[data-wf-kpicard]'); if (k) k.style.boxShadow = ''; });
    return {
      noMenu: (e) => { try { e.preventDefault(); } catch (x) {} },
      down: (e) => { const el = e.currentTarget, x0 = e.clientX, y0 = e.clientY; let k = 1; try { const R = el.closest('[data-wfroot]').getBoundingClientRect(); k = R.width / 390 || 1; } catch (x) {}
        clearTimeout(self._kpT); self._kd = { key, el, x0, y0, k, lifted: false, pid: e.pointerId }; try { (window.__wfHaptic || (() => { if (navigator.vibrate) navigator.vibrate(10); }))(); } catch (x) {}   // iPhone buzzes only inside the touch itself: at the press and at the drop
        self._kpT = setTimeout(() => { const d = self._kd; if (!d || d.key !== key) return; d.lifted = true; const L = cards(); d.idx = L.indexOf(d.el); d.to = d.idx;
          d.slots = L.map((c) => { const r = c.getBoundingClientRect(); return [(r.left + r.width / 2) / d.k, (r.top + r.height / 2) / d.k]; });
          try { d.el.setPointerCapture(d.pid); } catch (x) {} try { if (navigator.vibrate) navigator.vibrate(12); } catch (x) {}
          const kc = d.el.querySelector('[data-wf-kpicard]'); if (kc) kc.style.boxShadow = '0 0 24px rgba(0,0,0,0.16)';
          d.el.style.zIndex = '3'; d.el.style.transition = 'none'; d.el.style.transform = 'scale(1.04)'; window.__wfKpiLift = true; }, 250); },
      move: (e) => { const d = self._kd; if (!d || d.key !== key) return;
        if (!d.lifted) { if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 8) { clearTimeout(self._kpT); self._kd = null; } return; }
        const dx = (e.clientX - d.x0) / d.k, dy = (e.clientY - d.y0) / d.k, L = cards(), me = d.slots[d.idx], px = me[0] + dx, py = me[1] + dy;
        let best = d.idx, bd = 1e9; d.slots.forEach((q, j) => { const dd = Math.hypot(q[0] - px, q[1] - py); if (dd < bd) { bd = dd; best = j; } }); d.to = best;
        e.preventDefault && e.preventDefault();
        d.el.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(1.04)';
        const order = L.map((_, j) => j); order.splice(d.idx, 1); order.splice(d.to, 0, d.idx);
        order.forEach((j, pos) => { if (j === d.idx) return; const c = L[j], a = d.slots[j], b = d.slots[pos]; c.style.transform = pos !== j ? 'translate(' + (b[0] - a[0]).toFixed(1) + 'px, ' + (b[1] - a[1]).toFixed(1) + 'px)' : ''; }); },
      up: () => { clearTimeout(self._kpT); window.__wfKpiLift = false; const d = self._kd; self._kd = null; if (d && !d.lifted && d.key === key && typeof onTap === 'function') { onTap(); return; } if (!d || !d.lifted) return; try { (window.__wfHaptic || (() => { if (navigator.vibrate) navigator.vibrate(10); }))(); } catch (x) {}
        const L = cards().map((c) => c.getAttribute('data-wf-kpi')), from = d.idx, to = d.to; if (to !== from) { const [x] = L.splice(from, 1); L.splice(to, 0, x); }
        let all = null; try { all = JSON.parse(localStorage.getItem(SK) || 'null'); } catch (x) {} all = Array.isArray(all) ? all : []; const rest = all.filter((q) => L.indexOf(q) < 0);
        try { localStorage.setItem(SK, JSON.stringify(L.concat(rest))); } catch (x) {}
        window.__wfKpiDrop = Date.now(); reset(); self.forceUpdate(); }
    };
};
/* a card that was just moved is not also tapped (a unit switch or link inside it) */
document.addEventListener('click', function (e) { if (Date.now() - (window.__wfKpiDrop || 0) < 450 && e.target && e.target.closest && e.target.closest('[data-wf-kpi]')) { e.preventDefault(); e.stopPropagation(); } }, true);
