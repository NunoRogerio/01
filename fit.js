// Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
// (Oct 16, 19:05) Storage health, first thing on every screen: if this phone's storage refuses a small write (full: big caches
// kept by older versions), the largest reloadable entries are dropped until it accepts again, so the sign-in can always be saved.
(function(){var ok=function(){try{localStorage.setItem('wf-probe',String(Date.now()));localStorage.removeItem('wf-probe');return true;}catch(e){return false;}};
  try{if(ok())return;var KEEP=/^(wf-role|wf-last-user|wf-custom|wf-custom-profiles|wf-profile-edits|wf-profile-hidden|wf-mt-key|wf-ai-key|wf-ai-off|wf-invited-by|wf-primary|wf-app-version)$/,L=[];
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(!KEEP.test(k))L.push([k,(localStorage.getItem(k)||'').length]);}
    L.sort(function(a,b){return b[1]-a[1];});var gone=[];for(var j=0;j<L.length&&!ok();j++){localStorage.removeItem(L[j][0]);gone.push(L[j][0]+' '+Math.round(L[j][1]/1000)+'k');}
    window.__wfFreed=gone.join(', ');try{sessionStorage.setItem('wf-freed',window.__wfFreed);}catch(x){}}catch(e){}})();
// (Oct 7, 19:40) Station profiles (captain, team lead) have their station as their home screen instead of the region map.
function wfHomeUrl(){try{var r=localStorage.getItem('wf-role')||'',c=localStorage.getItem('wf-custom')||'';if(r&&/^(coord|ff|eng|fft|ptco|ptce|ptbo)$/.test(c))return 'Station.dc.html?home=1';}catch(e){}return 'Main.dc.html';}
/* (Oct 14, 17:10) the dispatch profiles' decisions on each incident (sent, smoke check, dismissed, confirmed) last as long as its chats:
   kept on this phone with the profile, not only for the session, so a candidate on the map and its incident screen always tell the same
   story after the app is closed and opened again */
(function(){try{var c=localStorage.getItem('wf-custom')||'';if(!/^(ecc|ptecc)$/.test(c))return;var K=['wf-verify','wf-confirmed','wf-dismissed'],LK=function(k){return k+'-keep-'+c;};
  K.forEach(function(k){if(sessionStorage.getItem(k)==null){var v=localStorage.getItem(LK(k));if(v!=null)sessionStorage.setItem(k,v);}});
  var S=Storage.prototype,set=S.setItem,rem=S.removeItem;if(S.__wfKeep)return;S.__wfKeep=1;
  S.setItem=function(k,v){set.call(this,k,v);try{if(this===window.sessionStorage&&K.indexOf(k)>=0&&(localStorage.getItem('wf-custom')||'')===c)set.call(localStorage,LK(k),v);}catch(e){}};
  S.removeItem=function(k){rem.call(this,k);try{if(this===window.sessionStorage&&K.indexOf(k)>=0&&(localStorage.getItem('wf-custom')||'')===c)rem.call(localStorage,LK(k));}catch(e){}};}catch(e){}})();
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
  window.__wfSetY=function(role){var c=window.__wfYDefault(role);window.__wfY=c;   /* (Oct 17, 13:53) no own primary colour any more: always the profile's */
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
    for(var i=0;i<L.length;i++){var el=L[i];if(el.tagName==='TEXTAREA'||el.closest('[data-wf-maproot]')||el.hasAttribute('data-wf-nopb'))continue;var hb=el.parentElement,gbx=null;for(var q=0;q<2&&hb&&!gbx;q++){gbx=hb.querySelector(':scope > .wf-grab.gb');hb=hb.parentElement;}if(gbx&&(el.compareDocumentPosition(gbx)&4)){el.style.setProperty('padding-bottom','0px','important');continue;}/* (Oct 9, 12:00) a top blade's own end: 56px from its last element to its bottom edge, held by the grabber band */var cs=getComputedStyle(el);if(!/auto|scroll/.test(cs.overflowY))continue;
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
  function under(){var u=false;try{var pq=document.createElement('div');pq.style.cssText='position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';(document.body||document.documentElement).appendChild(pq);var inTop=parseFloat(getComputedStyle(pq).paddingTop)||0;pq.remove();if(!SA&&inTop>20&&innerHeight>innerWidth)return true;   /* (Oct 17, 15:57) a browser tab that also runs under the status bar (Safari on iOS 26, viewport-fit=cover, a top safe area): the frame starts at the screen's top, so the map (or the top panel) is painted under the clock, never a white bar */
    if(SA){var pr=document.createElement('div');pr.style.cssText='position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';(document.body||document.documentElement).appendChild(pr);u=(parseFloat(getComputedStyle(pr).paddingTop)||0)>20;pr.remove();if(!u&&innerHeight>innerWidth&&innerHeight>=Math.max(screen.width,screen.height)-2)u=true;   /* (Oct 5, 20:45) upright only: held sideways the screen's long side always fits, which wrongly read as 'under the status bar' and pushed every screen 52px down */}}catch(e){}return u;}
  var UNDER=under();
  var EMB0=window.top!==window&&/[?&]embed=1/.test(location.search);   /* (Oct 8, 22:02) in the chat's incident blade: no browser bar to hide */
  var W=390,H=844,TOP=(UNDER||EMB0)?0:52,VH=H-TOP,MAXS=1.6;window.__wfTOP=TOP;try{document.documentElement.style.setProperty('--wf-top',TOP+'px');}catch(e){}   /* the frame's top hidden behind the browser's bar: tall sheets keep their 48px clear below what is really visible */
  /* Desktop browsers (Chrome, Safari, Firefox on a computer: a mouse, no touch) show the app as the phone it is, centred and
     scaled to the window's height, instead of stretching to a wide window (and never treat the wide window as a phone
     turned sideways) */
  var DESK=false;try{DESK=!!(matchMedia('(hover: hover) and (pointer: fine)').matches&&!('ontouchstart' in window)&&!(navigator.maxTouchPoints>0))||/OculusBrowser|Quest|Pico|Wolvic/i.test(navigator.userAgent);}catch(e){}window.__wfDesk=DESK;   /* VR headset browsers (Meta Quest) too: a floating window, so the phone frame */
  var m=document.querySelector('meta[name="wf-layout"]'),fluid=!DESK&&!!(m&&m.getAttribute('content')==='fluid');   /* (Oct 8, 22:02) in the chat's incident blade the page is the whole phone screen, scaled to fit the blade */
  var st=document.createElement('style');
  st.textContent='html,body{background:#F2F2F7;overflow:hidden;height:100%;margin:0;overscroll-behavior:none}*{scrollbar-width:none}*::-webkit-scrollbar{display:none;width:0;height:0}'+   /* no scrollbars in any browser (desktop Safari and Chrome draw them) */
    
    '#dc-root{zoom:var(--fit,1);width:var(--wf-w,'+W+'px);height:var(--wf-h,'+H+'px);margin:0 0 0 var(--wf-ml,0px);overflow:hidden;position:relative;top:-'+TOP+'px}';
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
    rotSty.textContent='html.wf-rot #dc-root{top:0!important}html.wf-rot{--wf-top:0px!important}html.wf-rot,html.wf-rot body{overflow:hidden}html.wf-rot body{position:fixed;left:0;top:0;width:'+ih+'px;height:'+iw+'px;transform-origin:0 0;transform:'+tf+'}';
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
      if(EMB0&&!R){s=iw/W;var hE=Math.min(H,Math.max(480,Math.round(ih/s)));vp={w:W,h:hE,land:false,s:s,sl:0,sr:0};r.removeProperty('--wf-w');if(hE<H)r.setProperty('--wf-h',hE+'px');else r.removeProperty('--wf-h');   /* (Oct 12, 05:03) in a blade the page is exactly the blade's height: its own scroller reaches the very end (the document never scrolls, so nothing snaps back) */try{document.documentElement.style.overflowY='auto';document.body.style.overflowY='auto';}catch(e){}r.setProperty('--fit',String(s));window.__wfVP=vp;var ke=vp.w+'x'+vp.h;if(ke!==last){var f0=!last;last=ke;if(!f0)try{window.dispatchEvent(new Event('wf-vp'));}catch(e){}}return;}   /* (Oct 8, 22:43) in a blade the page fills the blade's width (its own 16px margins, edge-to-edge map) keeps its own height: the blade scrolls what does not fit, no side gaps from fitting the whole height */
      s=Math.min(iw/W,ih/(R?H:VH));   /* (Oct 8, 22:26) turned sideways the page's top lies along the side of the phone, under no browser bar or status bar: nothing of it is cut, so the header keeps the same distance from the edge as upright */
      vp={w:W,h:H,land:false,s:s,sl:0,sr:0};r.removeProperty('--wf-w');r.removeProperty('--wf-h');
    }
    r.setProperty('--fit',String(s));
    /* (Oct 15, 14:02) the page is centred by an explicit left margin, not margin:auto: Safari resolves an auto margin before the zoom, so a zoomed page that fills the width (the incident page inside the chat, 390 px zoomed to the phone) sat about 6 px right of centre and lost 6 px on the right */
    (function(){var ml=Math.max(0,(iw-(vp.w||W)*s)/2);if(ml<1)ml=0;r.setProperty('--wf-ml',(ml/s).toFixed(2)+'px');})();
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
  try{var fr0=false;try{fr0=window.self!==window.top;}catch(e){fr0=true;}var pu=sessionStorage.getItem('wf-pu-state');if(pu&&!fr0){sessionStorage.removeItem('wf-pu-state');var P=JSON.parse(pu);['wf-scope','wf-nav','wf-list','wf-fireview','wf-focus','wf-verify','wf-chat-open','wf-chat-ib'].forEach(function(k){if(P[k]!=null&&sessionStorage.getItem(k)==null)sessionStorage.setItem(k,P[k]);});}}catch(e){}   // (Oct 4) arriving by the View push-up: the tapped item the loading frame already used
  /* (Oct 5, 02:52) Push-up arrival: the still copy of the risen screen covers this page from its first frame (a script-free frame
     drawn from the copy), and dissolves in 0.2s once the live page has drawn itself, so the screen never goes blank or flickers */
  try{(function(){var fr=false;try{fr=window.self!==window.top;}catch(e){fr=true;}if(fr)return;var sn=sessionStorage.getItem('wf-pu-snap'),t=+sessionStorage.getItem('wf-pu-arrive')||0;sessionStorage.removeItem('wf-pu-snap');if(!sn||Date.now()-t>10000)return;
    var ov=document.createElement('iframe');ov.setAttribute('aria-hidden','true');ov.setAttribute('tabindex','-1');ov.setAttribute('sandbox','allow-same-origin');ov.setAttribute('data-wf-pusnap','1');
    ov.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;border:0;margin:0;z-index:2147483000;pointer-events:none;background:'+(/wf-dark/.test(sn.slice(0,400))?'#121212':'#F2F2F7')+';transition:opacity .2s ease';ov.srcdoc=sn;(document.body||document.documentElement).appendChild(ov);
    var T0=Date.now(),ok=function(){var r=document.getElementById('dc-root');if(!(!document.getElementById('wf-load')&&r&&r.firstElementChild&&r.textContent.trim().length>20))return false;
      /* (Oct 14, 17:45) the frames inside the screen (the incident page inside its chat) drawn too, so the still picture never gives way to a grey panel */
      var fr0=[].slice.call(document.querySelectorAll('iframe')).filter(function(x){return x.offsetWidth&&x.getAttribute('src')&&!/^(about|data|javascript):/i.test(x.getAttribute('src'))&&!x.hasAttribute('data-wf-pusnap');});if(!fr0.length&&/<iframe[^>]*srcdoc=/.test(sn)&&Date.now()-T0<2500)return false;for(var z=0;z<fr0.length;z++){try{var cd=fr0[z].contentDocument,rr=cd&&cd.getElementById('dc-root');if(!cd||cd.location.href==='about:blank'||cd.readyState!=='complete'||!rr||!rr.firstElementChild||rr.textContent.trim().length<=20||cd.getElementById('wf-load')||cd.documentElement.classList.contains('wf-hold'))return false;}catch(x){}}var tr=null;try{tr=sessionStorage.getItem('wf-tour');}catch(e){}return !tr||!/wf-tour/.test(sn)||!!document.querySelector('#wf-tour .tb.on');};   /* with the tour on, also its card */
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
      var F=['Login.dc.html','Main.dc.html','Drone.dc.html','Dispatch.dc.html','TerrainMap.dc.html','fit.js','i18n.js','prefs.js','live.js','support.js','Station.dc.html','Chat.dc.html','chat.js','trophy.js','avatar.js','station.js','About.dc.html','tour.js','stats.js','index.html'];
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
    '#wf-load.photo .name{background:none;color:#FFFFFF;animation:none;text-shadow:0 0 12px rgba(0,0,0,.45)}'+
    '#wf-load.photo .sub{color:rgba(255,255,255,.85);text-shadow:0 0 8px rgba(0,0,0,.5)}'+
    '#wf-load.photo .base{fill:var(--wf-y)}#wf-load.photo .ground{stroke:var(--wf-y)}#wf-load.photo svg{filter:drop-shadow(0 0 16px rgba(0,0,0,0.16))}'+
    '#wf-load .cap{position:absolute;left:0;right:0;bottom:calc(28px + env(safe-area-inset-bottom));text-align:center;font:400 14px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:rgba(255,255,255,.8);opacity:0;transition:opacity .7s ease .3s}'+
    '#wf-load.photo .cap{opacity:1}'+
    /* (Oct 5, 02:40) the firefighter stripes along the bottom edge, as on the login */
    '#wf-load .stp{display:none}#wf-load.photo .stp{display:block;position:absolute;left:0;right:0;bottom:0;height:96px;z-index:2;background:repeating-linear-gradient(-60deg,rgba(255,255,255,0.12) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:linear-gradient(to bottom,transparent 0,transparent 30%,rgba(0,0,0,.14) 56%,rgba(0,0,0,.39) 74%,rgba(0,0,0,.77) 91%,#000 100%);mask-image:linear-gradient(to bottom,transparent 0,transparent 30%,rgba(0,0,0,.14) 56%,rgba(0,0,0,.39) 74%,rgba(0,0,0,.77) 91%,#000 100%)}'+
    /* the loading counter, 0% to 100% */
    '#wf-load .pct{margin-top:-6px;font:600 51px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#8E8E93}'+
    '#wf-load.photo .pct{color:#FFFFFF;text-shadow:0 0 8px rgba(0,0,0,.5)}'+
    /* after log in (hand): the sign-in screen's own layout carries on. Logo, name and line of text stay exactly where and
       as big as they were, the line changes to 'Loading live data', the counter takes the fields' place at the centre */
    '#wf-load.hand{display:block}#wf-load.hand .in{position:absolute;inset:0;display:block;opacity:1;animation:none}'+
    '#wf-load.hand .in>svg,#wf-load.hand .name,#wf-load.hand .sub,#wf-load.hand .cap{position:absolute;margin:0;box-sizing:border-box;text-align:center;white-space:nowrap}'+
    '#wf-load.hand svg{filter:drop-shadow(0 0 16px rgba(0,0,0,0.16))}'+
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
    box.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+(/%$/.test(cs.borderTopLeftRadius)?cs.borderTopLeftRadius:((parseFloat(cs.borderTopLeftRadius)||0)*k+'px'))+(Math.abs(r.width-r.height)<2&&parseFloat(cs.borderTopLeftRadius)>=r.height/2/k-1?';border-radius:50%':'');
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
  /* (Oct 16, 12:03) a panel that grows out of the control that opened it and folds back into it: a clip that widens from the control's
   shape to the whole panel (no scaling, nothing bounces); the panel's content fades in once it is open and out before it folds */
try{document.addEventListener('pointerdown',function(e){try{var b=e.target&&e.target.closest&&e.target.closest('.wf-ibtn,.btn');if(b){window.__wfLastTap=b;window.__wfLastTapT=Date.now();}}catch(x){}},true);}catch(x){}   /* the control last pressed, for panels that grow out of it */
var gcss=function(){if(document.getElementById('wf-grow-css'))return;var st=document.createElement('style');st.id='wf-grow-css';st.textContent='.wf-grow-out>*:not(.wf-gstripe){opacity:0!important;visibility:hidden!important;transition:none!important}.wf-gpanel.wf-hasgs::before{display:none!important}.wf-gstripe{position:absolute;left:0;right:0;top:0;height:96px;z-index:-1;pointer-events:none;border-top-left-radius:inherit;border-top-right-radius:inherit;background:repeating-linear-gradient(-60deg,var(--wf-sp-c,rgba(0,0,0,0.07)) 0 8.49px,transparent 8.49px 16.97px);-webkit-mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.25) 65%,#000 100%);mask-image:linear-gradient(to top,transparent 0,transparent 30%,rgba(0,0,0,0.25) 65%,#000 100%)}';(document.head||document.documentElement).appendChild(st);};
var gstripe=function(panel){var g=panel.querySelector(':scope>.wf-gstripe');if(!g){g=document.createElement('span');g.className='wf-gstripe';g.setAttribute('aria-hidden','true');panel.insertBefore(g,panel.firstChild);}panel.classList.add('wf-hasgs');return g;};   /* (Oct 17, 15:20) the panel's stripe band rides the growing (and folding) top edge, never hidden */
window.__wfGrow=function(panel,from,open,done,near){try{if(!panel){if(done)done();return;}var pr=panel.getBoundingClientRect(),F=from&&from.getBoundingClientRect?from.getBoundingClientRect():from,k=(pr.width/(panel.offsetWidth||pr.width))||1;
  var at=F&&F.width?'inset('+Math.max(0,(F.top-pr.top)/k).toFixed(1)+'px '+Math.max(0,(pr.right-F.right)/k).toFixed(1)+'px '+Math.max(0,(pr.bottom-F.bottom)/k).toFixed(1)+'px '+Math.max(0,(F.left-pr.left)/k).toFixed(1)+'px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)':'inset(100% 0px 0px 0px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)',full='inset(0px 0px 0px 0px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)';
  gcss();var GS=gstripe(panel),t0=F&&F.width?Math.max(0,(F.top-pr.top)/k):pr.height/k;var kids=[].slice.call(panel.children).filter(function(e){return e!==GS;});
  if(open){panel.classList.remove('wf-grow-out');panel.style.transition='none';panel.style.opacity='';panel.style.clipPath=at;panel.style.visibility='visible';kids.forEach(function(e){e.style.transition='none';e.style.opacity='0';});void panel.offsetWidth;
    GS.style.transition='none';GS.style.transform='translateY('+t0.toFixed(1)+'px)';void GS.offsetWidth;requestAnimationFrame(function(){panel.style.willChange='clip-path';panel.style.transition='clip-path .38s cubic-bezier(.4,0,.2,1)';panel.style.clipPath=full;GS.style.transition='transform .38s cubic-bezier(.4,0,.2,1)';GS.style.transform='translateY(0px)';setTimeout(function(){kids.forEach(function(e){e.style.transition='opacity .2s ease';e.style.opacity='1';});},200);setTimeout(function(){panel.style.transition='none';panel.style.clipPath='none';if(done)done();},400);});}   /* (Oct 17, 15:22) unclipped once open: a clip would cut its drop shadow */   /* (Oct 17, 15:20) faster: .38s (was .5s) */
  else{/* (Oct 16, 20:32) the content (Cancel and the primary included) leaves the moment the fold starts, held hidden by a class so no redraw brings it back before the panel is a button again */gcss();panel.style.willChange='clip-path';panel.classList.add('wf-grow-out');kids.forEach(function(e){e.style.transition='none';e.style.opacity='0';});panel.style.transition='none';panel.style.clipPath=full;void panel.offsetWidth;panel.style.transition='clip-path .45s cubic-bezier(.45,0,.2,1)';panel.style.clipPath=at;GS.style.transition='transform .45s cubic-bezier(.45,0,.2,1)';GS.style.transform='translateY('+t0.toFixed(1)+'px)';/* (Oct 16, 21:18) no pop at the end: the control it folds into is shown under it just before it lands and the panel melts away over it (no object vanishing and reappearing) */setTimeout(function(){panel.style.visibility='hidden';panel.style.willChange='';GS.style.transition='none';GS.style.transform='';try{if(near)near();}catch(x){}if(done)done();},460);}}   /* (Oct 16, 22:11) the panel lands as the button's own glass and hands it back in the same frame */   /* (Oct 16, 13:58) a gentler fold: content out first, then a slower clip */catch(x){if(done)done();}};
window.__wfConfirm=function(o){
    o=o||{};var root=document.querySelector('[data-wfroot]')||document.body;
    var old=root.querySelector('.wf-cfm');if(old)old.remove();
    var w=document.createElement('div');w.className='wf-cfm';w.style.cssText='position:absolute;inset:0;z-index:2147482000';   /* (Oct 8, 22:28) a dialog is on top of everything */
    var sc=document.createElement('div');sc.setAttribute('aria-hidden','true');sc.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.32);opacity:0;transition:opacity .35s ease';
    var p=document.createElement('section');p.className='wf-dlg';p.setAttribute('role','alertdialog');p.setAttribute('aria-modal','true');p.setAttribute('data-swipe','down');
    p.style.cssText='position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;box-sizing:border-box;padding:32px 24px 80px;border-radius:var(--wf-r, 16px) var(--wf-r, 16px) 0 0;background:#F2F2F7;box-shadow:0 0 16px rgba(0,0,0,0.16);transform:translateY(105%);transition:transform .5s cubic-bezier(.2,.8,.2,1);font-family:inherit';
    var h=document.createElement('h2');h.textContent=o.title||'';h.style.cssText='margin:0;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.01em;color:#000000';
    var b=document.createElement('p');b.textContent=o.body||'';b.style.cssText='margin:4px 0 0;font-size:18px;line-height:24px;color:#000000';if(!o.body)b.style.display='none';
    var a=document.createElement('div');a.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:24px';
    var btn=function(txt,pri){var e=document.createElement('button');e.type='button';e.textContent=txt;e.style.cssText='display:flex;align-items:center;justify-content:center;height:48px;padding:0 16px;border:0;border-radius:999px;font:inherit;font-size:18px;font-weight:600;cursor:pointer;'+(pri?'background:var(--wf-pri-bg,#3A3A3C);color:var(--wf-pri-fg,#FFFFFF);-webkit-text-fill-color:var(--wf-pri-fg,#FFFFFF);box-shadow:none':'background:var(--wf-sec-bg,#737376);color:var(--wf-sec-fg,#FFFFFF);-webkit-text-fill-color:var(--wf-sec-fg,#FFFFFF)');return e;};
    var no=btn(o.cancel||'Cancel',false),yes=btn(o.ok||'OK',true);if(/^(Not now|Agora não|Not yet|Ainda não)$/.test(o.cancel||'')){no.className='wf-rpill';no.style.background='transparent';no.style.color='var(--wf-ink,#3A3A3C)';}   /* (Oct 7) Not now is a ghost button everywhere */no.setAttribute('data-swipe-go','1');if(o.cancel===false)a.style.gridTemplateColumns='minmax(0,1fr)';else a.appendChild(no);a.appendChild(yes);   // cancel:false = one full-width primary (an information dialog)
    p.appendChild(h);p.appendChild(b);p.appendChild(a);w.appendChild(sc);w.appendChild(p);root.appendChild(w);
    var done=false,close=function(ok){if(done)return;done=true;try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}sc.style.opacity='0';p.style.transform='translateY(105%)';setTimeout(function(){w.remove();},520);try{(ok?o.onOk:o.onCancel)&&(ok?o.onOk:o.onCancel)();}catch(x){}};
    sc.onclick=function(){close(false);};no.onclick=function(){close(false);};yes.onclick=function(){close(true);};
    /* (Oct 16, 11:53) o.fromRect (viewport px of this window), o.icon (svg markup), o.bg: the dialog grows out of the button that asked, as a panel on
       that button's own glass: it opens from the button's shape (a clip that widens, no scaling, nothing bounces), its icon on top, the same
       title, line and buttons; Cancel folds it back into the button */
    if(o.fromRect){var R0=root.getBoundingClientRect(),kk=(R0.width/(root.offsetWidth||R0.width))||1,F=o.fromRect,fl=(F.left-R0.left)/kk,ft=(F.top-R0.top)/kk,fw=F.width/kk,fh=F.height/kk,RH=R0.height/kk,RW=R0.width/kk;
      p.className='wf-gpanel wf-dlg-grow';p.removeAttribute('data-swipe');sc.style.background='rgba(0,0,0,0.16)';
      p.style.cssText='position:absolute;left:'+Math.min(16,Math.max(8,fl))+'px;right:'+Math.min(16,Math.max(8,RW-fl-fw))+'px;bottom:'+Math.max(8,RH-(ft+fh))+'px;display:flex;flex-direction:column;box-sizing:border-box;padding:24px;border-radius:var(--wf-r, 16px);background:'+(o.bg||'rgba(255,255,255,0.62)')+';-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);box-shadow:0 0 16px rgba(0,0,0,0.16);font-family:inherit;transition:clip-path .45s cubic-bezier(.4,0,.2,1);will-change:clip-path';
      if(o.fg){h.style.color=o.fg;b.style.color=o.fg;}
      var C=[].slice.call(p.children);C.forEach(function(e){e.style.opacity='0';e.style.transition='opacity .2s ease';});gcss();var GS=gstripe(p);
      if(o.icon){var ic=document.createElement('div');ic.setAttribute('aria-hidden','true');ic.innerHTML=o.icon;ic.style.cssText='display:flex;margin:0 0 16px;opacity:0;transition:opacity .25s ease;color:'+(o.iconColor||'currentColor');var sv=ic.querySelector('svg');if(sv){sv.setAttribute('width','42');sv.setAttribute('height','42');sv.style.cssText='stroke-width:1.5px';}p.insertBefore(ic,h);C.unshift(ic);}
      var clipAt=function(){var pr=p.getBoundingClientRect(),pl=(pr.left-R0.left)/kk,pt=(pr.top-R0.top)/kk,pw=pr.width/kk,ph=pr.height/kk;return 'inset('+Math.max(0,ft-pt).toFixed(1)+'px '+Math.max(0,pl+pw-(fl+fw)).toFixed(1)+'px '+Math.max(0,pt+ph-(ft+fh)).toFixed(1)+'px '+Math.max(0,fl-pl).toFixed(1)+'px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)';};
      var topAt=function(){var pr=p.getBoundingClientRect();return Math.max(0,ft-(pr.top-R0.top)/kk);};p.style.transition='none';p.style.clipPath=clipAt();GS.style.transition='none';GS.style.transform='translateY('+topAt().toFixed(1)+'px)';void p.offsetWidth;p.style.transition='clip-path .34s cubic-bezier(.4,0,.2,1)';GS.style.transition='transform .34s cubic-bezier(.4,0,.2,1)';
      close=function(ok){if(done)return;done=true;try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}sc.style.opacity='0';gcss();p.classList.add('wf-grow-out');C.forEach(function(e){e.style.transition='none';e.style.opacity='0';});p.style.transition='none';p.style.clipPath='inset(0px 0px 0px 0px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)';void p.offsetWidth;p.style.transition='clip-path .38s cubic-bezier(.45,0,.2,1)';GS.style.transition='transform .38s cubic-bezier(.45,0,.2,1)';p.style.clipPath=clipAt();GS.style.transform='translateY('+topAt().toFixed(1)+'px)';setTimeout(function(){w.remove();},400);try{(ok?o.onOk:o.onCancel)&&(ok?o.onOk:o.onCancel)();}catch(x){}};
      sc.onclick=function(){close(false);};no.onclick=function(){close(false);};yes.onclick=function(){close(true);};
      requestAnimationFrame(function(){requestAnimationFrame(function(){sc.style.opacity='1';p.style.clipPath='inset(0px 0px 0px 0px round var(--wf-r, 16px) var(--wf-r, 16px) 48px 48px)';GS.style.transform='translateY(0px)';setTimeout(function(){C.forEach(function(e){e.style.opacity='1';});},170);setTimeout(function(){if(done)return;p.style.transition='none';p.style.clipPath='none';},360);});});
      return {close:close};}
    requestAnimationFrame(function(){requestAnimationFrame(function(){sc.style.opacity='1';p.style.transform='translateY(0)';});});
    return {close:close};
  };
})();

// (Oct 12, 12:50) Phone notifications: a notifications-only service worker (sw.js, no caching), and window.__wfNotify(title, body, url).
// On iPhone a web app can notify only once it is on the Home Screen (iOS 16.4 or later) and the person has allowed it; the
// permission is asked on a tap (window.__wfAskNotify), never on its own. Without it the app's own banner still shows.
(function(){
  try{if('serviceWorker' in navigator&&!/[?&](under|embed)=1/.test(location.search))navigator.serviceWorker.register('sw.js').catch(function(){});}catch(e){}
  window.__wfAskNotify=function(){try{if(window.Notification&&Notification.permission==='default'){var r=Notification.requestPermission();if(r&&r.catch)r.catch(function(){});}}catch(e){}};
  window.__wfNotify=function(title,body,url){try{if(!window.Notification||Notification.permission!=='granted')return false;var o={body:body||'',icon:'icon-192.png?v=4',badge:'icon-192.png?v=4',tag:'wf-'+(url||title),data:{url:url||'Main.dc.html'}};
    if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(function(r){return r.showNotification(title,o);}).catch(function(){try{new Notification(title,o);}catch(x){}});}else new Notification(title,o);return true;}catch(e){return false;}};
})();

// (Oct 12, 12:45) Action menu: the composer's + opens it (as Claude's composer). The confirmation dialog's panel, rising from the
// bottom over the dark scrim, with its title and the actions grouped as an inset list (white rows, full-width dividers), each
// row its icon (•→ an order, •‑‑‑ a request, none for a report) and label. Tap a row to run it; tap the scrim or swipe down to close.
// window.__wfActMenu({ title, groups: [{ title, items: [{ label, icon: 'st'|'rq'|'', go }] }] })
(function(){
  var ICS={st:'<circle cx="4" cy="7" r="3.5" fill="currentColor"></circle><path d="M9 7h11M15.5 2.5 20 7l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>',
    rq:'<circle cx="4" cy="7" r="3.5" fill="currentColor"></circle><path d="M9 7h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2.5 2.25"></path>',
    rp:'<circle cx="4" cy="7" r="3.5" fill="currentColor"></circle>'};
  window.__wfActMenu=function(o){
    o=o||{};var root=document.querySelector('[data-wfroot]')||document.body;
    var old=root.querySelector('.wf-amenu');if(old)old.remove();
    var w=document.createElement('div');w.className='wf-amenu';w.style.cssText='position:absolute;inset:0;z-index:2147481000';
    var sc=document.createElement('div');sc.setAttribute('aria-hidden','true');sc.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.32);opacity:0;transition:opacity .35s ease';
    var p=document.createElement('section');p.className='wf-dlg';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('data-swipe','down');p.setAttribute('aria-label',o.title||'');
    p.style.cssText='position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:24px;box-sizing:border-box;max-height:80%;overflow-y:auto;overscroll-behavior:contain;padding:32px 16px 80px;border-radius:var(--wf-r, 16px) var(--wf-r, 16px) 0 0;background:var(--wf-page,#F2F2F7);box-shadow:0 0 16px rgba(0,0,0,0.16);transform:translateY(105%);transition:transform .5s cubic-bezier(.2,.8,.2,1);font-family:inherit';
    var gb=document.createElement('button');gb.type='button';gb.setAttribute('aria-label','Close');gb.setAttribute('data-swipe-go','1');gb.style.cssText='position:absolute;left:50%;top:0;width:96px;height:24px;margin-left:-48px;padding:0;border:0;background:transparent;cursor:pointer';gb.innerHTML='<span aria-hidden="true" style="display:block;width:36px;height:5px;margin:10px auto 0;border-radius:3px;background:rgba(60,60,67,0.3)"></span>';p.appendChild(gb);
    var h=document.createElement('h2');h.textContent=o.title||'';h.style.cssText='margin:0 8px;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.01em;color:var(--wf-ink,#000000)';p.appendChild(h);
    var done=false,close=function(fn){if(done)return;done=true;sc.style.opacity='0';p.style.transform='translateY(105%)';setTimeout(function(){w.remove();},520);if(fn)setTimeout(function(){try{fn();}catch(x){}},120);};
    (o.groups||[]).forEach(function(g){if(!g.items||!g.items.length)return;var box=document.createElement('div');box.style.cssText='display:flex;flex-direction:column;gap:8px';
      if(g.title){var t=document.createElement('h3');t.textContent=g.title;t.style.cssText='margin:0 8px;font-size:15px;line-height:20px;font-weight:400;color:var(--wf-sec,#6E6E73)';box.appendChild(t);}
      var ul=document.createElement('div');ul.setAttribute('role','list');ul.style.cssText='display:flex;flex-direction:column;border-radius:var(--wf-r, 16px);overflow:hidden;background:var(--wf-surface,#FFFFFF)';
      g.items.forEach(function(it,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','listitem');b.className='chbtn';
        b.style.cssText='display:flex;align-items:center;gap:16px;min-height:52px;padding:0 16px;border:0;'+(i?'border-top:1px solid rgba(60,60,67,0.12);':'')+'background:transparent;color:var(--wf-ink,#000000);font:inherit;font-size:17px;line-height:22px;text-align:left;cursor:pointer';
        var ic=ICS[it.icon]||ICS.rp;b.innerHTML='<svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true" style="flex-shrink:0;color:var(--wf-ink2,#3A3A3C)">'+ic+'</svg>';
        var sp=document.createElement('span');sp.textContent=it.label;b.appendChild(sp);b.onclick=function(){try{if(navigator.vibrate)navigator.vibrate(8);}catch(x){}if(it.notify&&window.__wfAskNotify)window.__wfAskNotify();close(it.go);};   /* asked on this tap (a gesture), as iOS requires */ul.appendChild(b);});
      box.appendChild(ul);p.appendChild(box);});
    if(!(o.groups||[]).some(function(g){return g.items&&g.items.length;})){var em=document.createElement('p');em.textContent=o.empty||'';em.style.cssText='margin:0 8px;font-size:17px;line-height:22px;color:var(--wf-sec,#6E6E73)';p.appendChild(em);}
    w.appendChild(sc);w.appendChild(p);root.appendChild(w);sc.onclick=function(){close();};gb.onclick=function(){close();};
    requestAnimationFrame(function(){requestAnimationFrame(function(){sc.style.opacity='1';p.style.transform='translateY(0)';});});
    return {close:close};
  };
})();

// Install offer (Oct 3): a shared link (Share with other people: …/#install; the administrator's …/#invite=…) offers to put
// the app on the Home Screen when it opens in a browser tab. Android and desktop Chrome: the browser's own install
// prompt behind an Install button (Not now | Install). iPhone and iPad (Safari, Chrome): no page can install there, so a
// one-button dialog says where Add to Home Screen is. Shown once per opened link, never inside the installed app; on
// Android, Chrome opens links into the installed app on its own, so the offer never shows there.
/* (Oct 9, 13:42) a page shown only as a still backdrop under another screen's panel (?under=1) never moves: no transitions, no animations, no media */
(function(){if(!/[?&]under=1/.test(location.search))return;try{var z=document.createElement('style');z.textContent='*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}video{display:none!important}';(document.head||document.documentElement).appendChild(z);
  var stop=function(){try{document.getAnimations().forEach(function(a){a.finish&&a.finish();});}catch(e){}};var iv=setInterval(stop,250);
  /* (Oct 9, 15:48) once laid out, the backdrop is frozen for good: every timer and frame loop stops, so nothing under the panel re-renders or flickers */
  var freeze=function(){try{stop();clearInterval(iv);var hi=setTimeout(function(){},0);for(var i=0;i<=hi;i++){clearTimeout(i);clearInterval(i);}var no=function(){return 0;};window.setTimeout=no;window.setInterval=no;window.requestAnimationFrame=no;
    window.__wfFrozen=true;}catch(e){}};
  var arm=function(){setTimeout(freeze,1800);};if(document.readyState==='complete')arm();else window.addEventListener('load',arm);}catch(e){}})();
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
      cancel:T('Not yet','Ainda não'),ok:T('Install','Instalar'),onOk:function(){try{var e=evt;evt=null;e.prompt();}catch(x){}}});
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
    /* (Oct 9, 16:21) after the press a round button returns to its resting state: no focus or pressed look left behind */
    (function(b){setTimeout(function(){try{var f=document.activeElement;if(f&&(f===b||b.contains(f)||f.contains(b)))f.blur();}catch(x){}},520);})(el);
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
  /* (Oct 9, 13:38, standing) the strip under the clock and the camera always wears the colour of the screen's fixed top bar (a dark station header makes it dark), never a band of its own */
  function hdr(){try{var x=Math.round(innerWidth/2),e=document.elementFromPoint(x,Math.max(1,(window.__wfTOP||0)?2:60));while(e&&e!==document.documentElement){var b=getComputedStyle(e).backgroundColor;if(b&&b!=='transparent'&&!/rgba\([^)]*,\s*0\)$/.test(b)){var m=b.match(/rgba?\(([^)]+)\)/);if(m){var p=m[1].split(',').map(parseFloat);if(p.length<4||p[3]>=0.95)return 'rgb('+Math.round(p[0])+', '+Math.round(p[1])+', '+Math.round(p[2])+')';}}e=e.parentElement;}}catch(x){}return '';}
  function probe(){var on=window.__wfTOP!==0&&innerHeight>innerWidth;root.classList.toggle('wf-bar',on);set(on&&photo()?BAR:(on?hdr():''));}
  // before the first paint: screens with a photo start black
  if(photo()){root.classList.add('wf-bar');set(BAR);}
  var T=0;function soon(){clearTimeout(T);T=setTimeout(probe,60);}
  window.addEventListener('wf-vp',soon);window.addEventListener('resize',soon);window.addEventListener('pageshow',soon);
  // the loading screen leaving is the one change to watch for
  window.addEventListener('load',function(){probe();var iv=setInterval(function(){probe();if(!photo())clearInterval(iv);},300);setInterval(probe,700);});   /* the top bar can change (a blade, a dark header): the strip follows */
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
  function start(){try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&t.nodeType===1&&t.hasAttribute&&t.hasAttribute('data-wf-eqw')&&ms[i].type==='attributes')continue;if(t&&t.nodeType===1&&t.classList&&t.classList.contains('wf-dlg-acts')&&ms[i].attributeName==='class')continue;   /* (Oct 9, 16:19) its own stack check toggles this class: reacting to it looped every frame and made everything repaint (the flicker under the blades) */later();return;}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class','hidden','aria-hidden']});}catch(x){}later();window.addEventListener('resize',later);try{var ro=new ResizeObserver(later),obs=function(){var r=document.getElementById('dc-root'),pg=r&&r.firstElementChild;if(pg&&pg!==obs.el){if(obs.el)ro.unobserve(obs.el);ro.observe(pg);obs.el=pg;}};obs();setInterval(obs,1500);}catch(x){}}   /* (Oct 9, 17:51) the screen resizing (the settings column) re-measures equal-width tags frame by frame: no jump at the end */
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
  var KEY='wf-back-nav', mark=function(){try{sessionStorage.setItem(KEY,String(Date.now()));sessionStorage.setItem('wf-vt-back',String(Date.now()));/* (Oct 16, 09:17) leaving an incident (it rose from the bottom), the screen behind comes back from the top */sessionStorage.setItem('wf-vt-backdir',/(Dispatch|Chat)\.dc\.html/.test(location.pathname)?'down':'');}catch(x){}};
  // Back (Oct 3, 22:06; 22:41 from the left): the screen you go back to slides in from the left over the current one, which darkens 20%
  // as it is covered, exactly like the sections of the settings menu (same 0.53s, same ease). Other screen changes keep their dissolve.
  try{var vs=document.createElement('style');vs.textContent='html:active-view-transition-type(wfback)::view-transition-old(root){animation:wfvtDim .53s cubic-bezier(.37,0,.63,1) both}html:active-view-transition-type(wfback)::view-transition-new(root){animation:wfvtIn .53s cubic-bezier(.37,0,.63,1) both}html:active-view-transition-type(wfbackdown)::view-transition-old(root){animation:wfvtDim .53s cubic-bezier(.37,0,.63,1) both}html:active-view-transition-type(wfbackdown)::view-transition-new(root){animation:wfvtDown .53s cubic-bezier(.37,0,.63,1) both}@keyframes wfvtDown{from{transform:translateY(-100%)}to{transform:none}}@keyframes wfvtDim{from{filter:brightness(1)}to{filter:brightness(.8)}}@keyframes wfvtIn{from{transform:translateX(-100%)}to{transform:none}}';(document.head||document.documentElement).appendChild(vs);}catch(x){}
  // (Oct 4, replaces the split) View on a map card: the destination screen pushes up from the bottom over the current one (0.53s). It is
  // loaded in a frame first (the card's label says Loading while it does); if it needs more time it starts from grey and its content fades
  // in as it rises. When it has covered the screen the real page opens in its place: no grey screen in between.
  var PU_E='cubic-bezier(.37,0,.63,1)',PU_D=530;
  function puGrey(){return document.documentElement.classList.contains('wf-dark')?'#121212':'#F2F2F7';}   /* (Oct 5) the rising panel is the app surface, not a grey slab, until the next screen fades in */
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[data-wf-split]');if(!a||a.__wfPu)return;
    if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey)return;var dc=document.getElementById('dc-root');if(!dc||!window.Element||!dc.animate)return;
    a.__wfPu=1;e.preventDefault();var href=a.href,gone=false,snap=null;try{document.documentElement.classList.add('wf-pushing');}catch(x){}   /* (Oct 5) the tour's bubble and glow leave as the next screen rises (they drew over the rising panel) */
    var navigate=function(){if(gone)return;var hold=(window.__wfNavHold||0)-Date.now();if(hold>0){setTimeout(navigate,Math.min(hold,80));return;}gone=true;   /* the frame took the one-shot state (the tapped item) while it loaded: the real page gets it back */
      try{var PH=window.__wfPuHost;if(PH){window.__wfPuHost=null;href=new URL('Chat.dc.html',location.href).href;snap=snap||{};snap['wf-chat-open']=PH.open;snap['wf-chat-ib']=PH.ib;snap['wf-fireview']=PH.fv;}}catch(x){}   /* (Oct 13, 21:24) the incident handed over to its chat inside the rising panel: open the chat directly */
      try{if(snap)sessionStorage.setItem('wf-pu-state',JSON.stringify(snap));}catch(x){}   /* read once by the real page (fit.js top), where the frame cannot reach it */
      /* (Oct 5, 02:52) a still copy of the risen screen (its drawn markup and styles, no scripts), shown by the real page from its
         very first frame until it has drawn itself: no blank screen, no flicker, on phones without view transitions too */
      /* (Oct 13, 21:24) a frame inside the risen screen (the incident page inside the chat) is pictured too, as a still srcdoc frame, so no empty area shows while the real page draws */
      try{var fd=window.__wfPuFrame&&window.__wfPuFrame.contentDocument;var esc=function(t){return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;');};
        var pic=function(d,base,lvl){var css=[].map.call(d.querySelectorAll('style'),function(x){return x.textContent;}).join('\n'),lk=[].map.call(d.querySelectorAll('link[rel=stylesheet]'),function(l){return '<link rel="stylesheet" href="'+l.href+'">';}).join(''),IF=[].slice.call(d.body.querySelectorAll('iframe')),k=0;
          var bd=d.body.innerHTML.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<iframe([^>]*)>[\s\S]*?<\/iframe>/gi,function(m0,at){var fr=IF[k++],inner='';try{var cd=fr&&lvl<1&&fr.contentDocument;if(cd&&cd.body&&cd.getElementById('dc-root'))inner=pic(cd,cd.location.href,lvl+1);}catch(x){}
            return inner?'<iframe'+at.replace(/\ssrc="[^"]*"/i,'')+' srcdoc="'+esc(inner)+'"></iframe>':'';}).replace(/class="ta go"/g,'class="ta still"');
          var hs=d.documentElement;return '<!doctype html><html class="'+(hs.className||'')+'" style="'+(hs.getAttribute('style')||'').replace(/"/g,'&quot;')+'"><head><meta charset="utf-8"><base href="'+base+'">'+lk+'<style>'+css+'</style></head><body style="'+(d.body.getAttribute('style')||'').replace(/"/g,'&quot;')+'">'+bd+'</body></html>';};
        if(fd&&fd.body){var html=pic(fd,location.href,0);if(html.length<3000000)sessionStorage.setItem('wf-pu-snap',html);}}catch(x){}
      try{sessionStorage.setItem('wf-pu-arrive',String(Date.now()));}catch(x){}   /* the real page holds this last picture until it has drawn itself */
      window.location.href=href;};
    setTimeout(function(){   /* after the card's own handlers have set the destination up */
      /* (Oct 13, 21:24) an incident opens in its host, the chat page (on its map view): go there directly, so the panel rises with the final screen and never shows the incident page hiding while it hands over */
      try{if(/Dispatch\.dc\.html(\?|#|$)/.test(href)&&!/embed=1/.test(href)&&window.__wfChat&&window.__wfChat.find){var fo=sessionStorage.getItem('wf-focus')||((window.__wfMem||{}).focus)||'',v=fo?{id:fo,cand:1}:JSON.parse(sessionStorage.getItem('wf-fireview')||'null');
        if(v&&v.id){var hc=window.__wfChat.find({kind:'fire',id:String(v.id),place:v.place});if(hc&&hc.kind!=='dm'){v.t=Date.now();sessionStorage.setItem('wf-fireview',JSON.stringify(v));if(fo){sessionStorage.removeItem('wf-focus');if(window.__wfMem)window.__wfMem.focus=null;}
          sessionStorage.setItem('wf-chat-open',hc.key);sessionStorage.setItem('wf-chat-ib','Dispatch.dc.html');href=href.replace(/Dispatch\.dc\.html[^]*$/,'Chat.dc.html');}}}}catch(x){}
      try{snap={};for(var q=0;q<sessionStorage.length;q++){var kk=sessionStorage.key(q);snap[kk]=sessionStorage.getItem(kk);}}catch(x){}   /* now, after the card's handlers */
      try{var lb=(a.textContent||'').trim(),L={'View':'Loading…','Ver':'A carregar…'};if(lb){a.__wfLb={h:a.innerHTML,s:a.getAttribute('style')||''};
          /* (Oct 14, 18:10) Loading… is laid over the button, its own content kept underneath: the button keeps its exact size and place (rebuilding its inside moved it a couple of pixels) */
          var acs=getComputedStyle(a);if(acs.position==='static')a.style.position='relative';var sp=document.createElement('span');sp.setAttribute('data-wf-ldlbl','1');
          sp.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:inherit;pointer-events:none;white-space:nowrap;overflow:hidden;background:'+acs.backgroundColor+';color:'+acs.color+';font:'+acs.font+';letter-spacing:'+acs.letterSpacing;
          sp.textContent=L[lb]||(window.__wfLang==='pt'?'A carregar…':'Loading…');a.appendChild(sp);a.setAttribute('aria-busy','true');}
        /* (Oct 13, 21:24) the map card stays put while Loading… shows: a still copy at its exact place and size, the live card hidden under it, whatever the map or the page does meanwhile */
        try{var pc=a.closest('[data-wf-pop]');if(pc&&pc.parentNode){var cl=pc.cloneNode(true);cl.setAttribute('data-wf-pushup','1');cl.setAttribute('data-wf-popstill','1');cl.setAttribute('aria-hidden','true');
          /* (Oct 14, 22:40) the still copy sits beside the card, in the same place of the map (same parent, same classes and styles), so it is exactly the card: no width change, no reflow; the live card is hidden under it */
          cl.style.setProperty('transition','none','important');cl.style.setProperty('animation','none','important');cl.style.setProperty('pointer-events','none','important');
          pc.parentNode.insertBefore(cl,pc.nextSibling);pc.style.setProperty('visibility','hidden','important');document.documentElement.classList.add('wf-popstill');if(!document.getElementById('wf-popstill-css')){var ps=document.createElement('style');ps.id='wf-popstill-css';ps.textContent='html.wf-popstill [data-wf-pop]:not([data-wf-popstill]){visibility:hidden!important}';document.head.appendChild(ps);}}}catch(x){}   /* (Oct 13, 13:52) the button keeps its size: only its label changes to Loading…, centred in it */   /* the label says so while the next screen loads */
        var w=document.createElement('div'),f=document.createElement('iframe'),dim=document.createElement('div'),T0=Date.now(),loaded=false,rose=false,lift=false;
        w.setAttribute('aria-hidden','true');w.setAttribute('data-wf-pushup','1');w.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:300;overflow:hidden;pointer-events:none;background:'+puGrey()+';transform:translateY(100%);box-shadow:0 0 16px rgba(0,0,0,0.16)';
        f.setAttribute('tabindex','-1');f.style.cssText='position:absolute;left:0;top:0;width:1px;min-width:100%;height:100%;border:0;opacity:0;background:transparent';w.appendChild(f);window.__wfPuFrame=f;
        dim.setAttribute('data-wf-pushup','1');dim.style.cssText='position:fixed;inset:0;background:#000;opacity:0;z-index:299;pointer-events:none';document.body.appendChild(dim);document.body.appendChild(w);
        var fade=function(){if(loaded&&!f.__in){f.__in=1;f.animate([{opacity:0},{opacity:1}],{duration:rose?320:120,easing:'ease-out',fill:'forwards'});}};
        var rise=function(){if(rose)return;rose=true;fade();var an=w.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:PU_D,easing:PU_E,fill:'forwards'});dim.animate([{opacity:0},{opacity:.2}],{duration:PU_D,easing:PU_E,fill:'forwards'});
          an.onfinish=function(){var wait=function(){if(loaded||Date.now()-T0>6000)navigate();else setTimeout(wait,60);};wait();};};
        var drawn=function(d){var r=d&&d.readyState==='complete'&&d.getElementById('dc-root');return !!(r&&r.firstElementChild&&r.textContent.trim().length>20&&!d.getElementById('wf-load')&&!d.documentElement.classList.contains('wf-hold'));};   /* a page held invisible (handing over) is not drawn */
        /* (Oct 13, 21:24) the panel rises with the next screen already drawn, frames inside it included (the incident page inside the chat): never an empty panel; the button's Loading… covers the wait */
        var poll=function(){try{var d=f.contentDocument;if(!loaded&&drawn(d)){var ok=true;[].forEach.call(d.querySelectorAll('iframe'),function(x){try{if(!x.offsetWidth||!x.getAttribute('src')||/^(about|data|javascript):/i.test(x.getAttribute('src')))return;   /* (Oct 14, 18:10) an empty helper frame (about:blank) is not a page to wait for: it held the panel 6 s and it rose blank */var cd=x.contentDocument;if(cd&&cd.location.href!=='about:blank'&&!drawn(cd))ok=false;else if(!cd||cd.location.href==='about:blank')ok=false;}catch(y){}});if(ok){loaded=true;fade();}}}catch(x){}
          if(!rose&&loaded&&Date.now()-T0>250)rise();   /* (Oct 5, 02:52) the panel rises only with the next screen drawn on it: never a blank panel */if(Date.now()-T0>6000&&!loaded){rise();return;}if(!gone)setTimeout(poll,70);};
        f.src=href;if(window.__wfShared&&window.__wfShared(a,w,f,dim,navigate,drawn))return;setTimeout(poll,100);}catch(x){navigate();}},0);},true);
  addEventListener('pageshow',function(){try{document.documentElement.classList.remove('wf-pushing');document.documentElement.classList.remove('wf-popstill');document.querySelectorAll('[data-wf-pop]').forEach(function(n){n.style.removeProperty('visibility');});}catch(x){}try{document.querySelectorAll('a[data-wf-split]').forEach(function(n){n.__wfPu=0;if(n.__wfLb){if(typeof n.__wfLb==='object'){n.innerHTML=n.__wfLb.h;n.setAttribute('style',n.__wfLb.s);}else n.textContent=n.__wfLb;n.__wfLb=null;}n.removeAttribute('aria-busy');});document.documentElement.classList.add('wf-back');try{dispatchEvent(new Event('wf-popclose'));}catch(x){}document.querySelectorAll('[data-wf-pushup]').forEach(function(n){n.remove();});document.documentElement.style.background='';document.body.style.background='';}catch(x){}});   /* coming back from the phone's cache: the screen whole again */
  // (Oct 4, 21:50) The push-up arrival: the last picture of the risen screen stays over the real page until it has drawn itself
  // (the live page, held invisible above it, waits for its plain loading surface to go), then appears in a short 0.2s dissolve between two identical pictures, so no blank flash.
  // (Oct 4, 22:52) the transition's own backdrop takes the app's surface colour, so the area under the clock never shows black while one screen hands over to the next
  try{var pus=document.createElement('style');pus.textContent='html::view-transition{background:#F2F2F7}html.wf-dark::view-transition{background:#121212}'+'html:active-view-transition-type(wfpu)::view-transition-old(root){animation:none;opacity:1}html:active-view-transition-type(wfpu)::view-transition-new(root){animation:wfpuHold 3s linear both}@keyframes wfpuHold{0%,93%{opacity:0}100%{opacity:1}}';(document.head||document.documentElement).appendChild(pus);}catch(x){}
  addEventListener('pagereveal',function(e){var t=0,fr=false;try{fr=window.self!==window.top;}catch(x){fr=true;}if(fr)return;try{t=+sessionStorage.getItem('wf-pu-arrive')||0;sessionStorage.removeItem('wf-pu-arrive');}catch(x){}
    if(!(e.viewTransition&&Date.now()-t<10000))return;var vt=e.viewTransition;try{vt.types.add('wfpu');}catch(x){}
    vt.ready.then(function(){var T0=Date.now(),an=null;try{an=document.getAnimations().filter(function(a){return a.effect&&a.effect.pseudoElement==='::view-transition-new(root)';})[0]||null;}catch(x){}
      var ok=function(){var r=document.getElementById('dc-root');return !document.getElementById('wf-load')&&r&&r.firstElementChild&&r.textContent.trim().length>20;};
      (function wait(){if(ok()||Date.now()-T0>2600){requestAnimationFrame(function(){requestAnimationFrame(function(){   /* drawn and painted: dissolve over the last 7% (0.21s) */
        try{if(an){var d=an.effect.getComputedTiming().duration;if(an.currentTime<d*.93)an.currentTime=d*.93;}else vt.skipTransition();}catch(x){try{vt.skipTransition();}catch(y){}}});});return;}setTimeout(wait,40);})();}).catch(function(){});},true);
  addEventListener('pagereveal',function(e){if(!e.viewTransition)return;var t=0;try{t=+sessionStorage.getItem('wf-vt-back')||0;sessionStorage.removeItem('wf-vt-back');}catch(x){}if(Date.now()-t<15000){var dn='';try{dn=sessionStorage.getItem('wf-vt-backdir')||'';sessionStorage.removeItem('wf-vt-backdir');}catch(x){}try{e.viewTransition.types.add(dn==='down'?'wfbackdown':'wfback');}catch(x){}return;}});
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
  var hm=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);   /* (Oct 11) 24-hour clock everywhere */
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
  var G = { 1: 1.6, 3: 2, 6: 3.6 }, HZ = [1, 3, 6], MEM = {}, TTL = 6 * 3600e3, LK = 'wf-homes8-', MIN_B = 3;
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
    if (!id) return null; if (RR && RR[0] && RR[6]) (window.__wfHomesRR || (window.__wfHomesRR = {}))[id] = RR;   /* (Oct 11, 22:50) the shapes as drawn now, so the red only marks what they reach */
    var sig = RR && RR[6] ? 'r' + RR[6].length + ':' + RR[6][0].map(function (v) { return v.toFixed(4); }).join(',') + ':' + RR[6][Math.floor(RR[6].length / 2)].map(function (v) { return v.toFixed(4); }).join(',') : (ll && ll.length ? 'l' + ll.length + ':' + ll[0].join(',') : 'p' + (px && px.length ? px[0].join(',') : ''));
    var m = MEM[id]; if (m && m.sig === sig) return m.st === 'done' ? m.res : null;
    /* (Oct 11, 08:52) screens draw the same fire from slightly different outlines: one query at a time per fire, and a result under 10 min old serves them all (no refetch storm, which left no building red) */
    if (m && m.st === 'loading' && Date.now() - (m.at || 0) < 45000) return null; if (m && m.st === 'done' && m.res && Date.now() - (m.res.t || 0) < 600000) return m.res;
    var c = load(id); if (c && c.sig === sig) { MEM[id] = { sig: sig, st: 'done', res: c }; return c; }
    var R = RR || rings(id, ll, px); if (!R[0] || !R[6]) return null;
    MEM[id] = { sig: sig, st: 'loading', at: Date.now() };
    /* (Oct 10, 22:48) the buildings' own footprints first (out geom, heavier); if the server cannot answer in time, their centres (lighter) */
    var run = function (GEO) { var q = '[out:json][timeout:40];' + [0].concat(HZ).map(function (h) { return 'way["building"]["building"!~"' + NOT + '"](poly:"' + poly(R[h]) + '");out count;'; }).join('') +
      'node["place"~"^(city|town|village|hamlet|suburb|neighbourhood|quarter)$"](poly:"' + poly(R[6]) + '");out body 40;' +
      /* (Oct 7) where they are: residential areas and the buildings themselves, drawn in red under the projection */
      'way["landuse"="residential"](poly:"' + poly(R[6]) + '");out geom 40;' +
      /* (Oct 9) the buildings per horizon, the earliest first, so a dense area never leaves the nearest ones out of the red (one
         capped list for +6 h could miss every building of +1 h) */
      HZ.map(function (h) { return 'way["building"]["building"!~"' + NOT + '"](poly:"' + poly(R[h]) + '");out ' + 'geom ' + (h === 1 ? (GEO === 2 ? 120 : 300) : (GEO === 2 ? 80 : 200)) + ';'; }).join('') +
      /* (Oct 10, 21:50) water to refill from, within 3 km of the fire: hydrants, tanks, ponds, reservoirs, lakes */
      (function () { var c = R[0].reduce(function (a, q) { return [a[0] + q[0] / R[0].length, a[1] + q[1] / R[0].length]; }, [0, 0]), A = '(around:3000,' + c[0].toFixed(5) + ',' + c[1].toFixed(5) + ')';
        return '(node["emergency"~"^(fire_hydrant|water_tank|fire_water_pond|suction_point)$"]' + A + ';node["man_made"="water_tank"]' + A + ';way["man_made"~"^(water_tank|reservoir_covered)$"]' + A + ';way["natural"="water"]' + A + ';way["landuse"="reservoir"]' + A + ';way["leisure"="swimming_pool"]["access"!="private"]' + A + ';);out center 80;'; })();
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (js) {
        var E = js.elements || [], cnt = E.filter(function (e) { return e.type === 'count'; }).map(function (e) { return +((e.tags || {}).ways || (e.tags || {}).total || 0); });
        var pl = E.filter(function (e) { return e.type === 'node' && e.tags && e.tags.name; });
        var res = { sig: sig, t: Date.now(), n: {}, b: {}, place: {}, at: {}, first: null };
        HZ.forEach(function (h, i) { var nb = Math.max(0, (cnt[i + 1] || 0) - (cnt[0] || 0)), p = pl.filter(function (e) { var P = [e.lat, e.lon]; return inside(P, R[h]) && !inside(P, R[0]); });
          res.b[h] = nb; res.place[h] = p.length ? p[0].tags.name : ''; res.at[h] = nb >= MIN_B || p.length > 0;
          /* (Oct 9) the projection only grows: what is at risk at a horizon stays at risk at the later ones (never fewer structures) */
          if (i > 0) { var hp = HZ[i - 1]; res.b[h] = Math.max(res.b[h], res.b[hp]); res.at[h] = res.at[h] || res.at[hp]; if (!res.place[h]) res.place[h] = res.place[hp]; }
          if (res.at[h] && res.first == null) res.first = h; });
        var hOf = function (P) { if (inside(P, R[0])) return 0.5;   /* (Oct 11, 08:52) a building the fire already covers is at risk now (0.5: before +1 h) */ for (var k = 0; k < HZ.length; k++) if (inside(P, R[HZ[k]])) return HZ[k]; return 0; }, r5 = function (v) { return Math.round(v * 1e5) / 1e5; };
        var seen = {}; res.pts = E.filter(function (e) { if (e.type !== 'way' || !(e.center || e.geometry) || !e.tags || !e.tags.building || seen[e.id]) return false; seen[e.id] = 1; return true; }).map(function (e) { var G0 = e.geometry && e.geometry.length > 2 ? e.geometry : null, P = e.center ? [e.center.lat, e.center.lon] : [G0.reduce(function (a, q) { return a + q.lat; }, 0) / G0.length, G0.reduce(function (a, q) { return a + q.lon; }, 0) / G0.length];
          /* (Oct 10, 21:50) each building's own footprint, painted red (no longer a round) */ return [r5(P[0]), r5(P[1]), hOf(P), G0 ? thin(G0.map(function (q) { return [r5(q.lat), r5(q.lon)]; }), 16) : null]; }).filter(function (q) { return q[2]; });
        res.water = E.filter(function (e) { return e.tags && (e.lat != null || e.center) && (e.tags.emergency || e.tags.man_made || e.tags.natural === 'water' || e.tags.landuse === 'reservoir' || e.tags.leisure === 'swimming_pool'); }).map(function (e) { var P = e.center ? [e.center.lat, e.center.lon] : [e.lat, e.lon]; return [r5(P[0]), r5(P[1]), e.tags.emergency || e.tags.man_made || e.tags.natural || e.tags.landuse || e.tags.leisure]; }).slice(0, 80);
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
          var T = (res.pts || []).filter(function (q) { return q[2] >= 1; }).map(function (q) { return eta([q[0], q[1]], q[2]); });
          pl.forEach(function (e) { var P = [e.lat, e.lon], h = 0; if (inside(P, R[0])) return; for (var z = 0; z < HZ.length; z++) if (inside(P, R[HZ[z]])) { h = HZ[z]; break; } if (h) T.push(eta(P, h)); });
          if (T.length && res.first != null) { res.eta = Math.min.apply(null, T); res.nAt = Math.max((res.pts || []).filter(function (q) { return q[2] && q[2] <= res.first; }).length, res.b[res.first] || 0);   /* (Oct 9) the drawn list is capped: never fewer than the count */ } })();
        MEM[id] = { sig: sig, st: 'done', res: res }; try { localStorage.setItem(LK + id, JSON.stringify(res)); } catch (e) {} emit();
      }).catch(function () { if (GEO === true) { run(2); return; }   /* (Oct 16) buildings are always their own shapes, never rounds: a lighter footprint query, not centres */ MEM[id] = { sig: sig, st: 'fail' }; setTimeout(function () { if (MEM[id] && MEM[id].st === 'fail') delete MEM[id]; }, 60000); });   /* no answer, no warning: tried again a minute later */
    }; run(true);
    return null; };
  // (Oct 7) the populated areas reached by the projection up to horizon h, as one SVG path in the map's own units
  // (residential areas, and a 24 m round per building so isolated houses show too); one path, so overlaps stay one red
  window.__wfHomesPath = function (id, h) { var res = window.__wfHomesGet(id); h = h || 0.5;   /* (Oct 11, 08:52) at Now, the buildings inside the burning area are red too */ if (!res || (!res.pts && !res.areas)) return '';
    var X = function (lo) { return (lo + 118.13) * 2345 + 518; }, Y = function (la) { return (34.19 - la) * 2829 + 662; }, d = '';
    /* (Oct 11, 22:50) at risk = inside the projected shape of that horizon or within 100 m of its edge, checked against the shape
       drawn now (a result fetched for an earlier, different shape never paints buildings far outside it) */
    var RC = (window.__wfHomesRR || {})[id], ring = RC ? RC[h < 1 ? 0 : h] || RC[6] : null;
    var near = function (P) { if (!ring) return true; if (inside(P, ring)) return true; var k = Math.cos(P[0] * Math.PI / 180), B = 100 / 111320;
      for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) { var ax = (ring[j][1] - P[1]) * k, ay = ring[j][0] - P[0], bx = (ring[i][1] - P[1]) * k, by = ring[i][0] - P[0], ex = bx - ax, ey = by - ay, L = ex * ex + ey * ey, u = L ? Math.max(0, Math.min(1, -(ax * ex + ay * ey) / L)) : 0, qx = ax + u * ex, qy = ay + u * ey;
        if (qx * qx + qy * qy <= B * B) return true; } return false; };
    /* (Oct 10, 21:50) the buildings at risk themselves, each footprint in red (residential areas and rounds no longer drawn) */
    (res.pts || []).forEach(function (q) { if (q[2] > h || !near([q[0], q[1]])) return; if (q[3] && q[3].length > 2) { d += 'M' + q[3].map(function (v) { return X(v[1]).toFixed(2) + ' ' + Y(v[0]).toFixed(2); }).join('L') + 'Z'; return; } /* (Oct 16) no footprint, nothing drawn: buildings are shapes, never rounds */ });
    return d; };
  /* (Oct 10, 21:50) the water points around the fire a crew can refill from, as small blue rounds in the map's own units */
  window.__wfWaterPath = function (id) { var res = window.__wfHomesGet(id); if (!res || !res.water || !res.water.length) return '';
    var X = function (lo) { return (lo + 118.13) * 2345 + 518; }, Y = function (la) { return (34.19 - la) * 2829 + 662; }, d = '', r = 22 / 111320 * 2829;
    res.water.forEach(function (q) { var x = X(q[1]), y = Y(q[0]); d += 'M' + (x - r).toFixed(2) + ' ' + y.toFixed(2) + 'a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (2 * r).toFixed(2) + ' 0a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (-2 * r).toFixed(2) + ' 0'; });
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
    s.textContent = '#wf-homes{box-shadow:0 0 16px rgba(0,0,0,0.16)}';   /* (Oct 7) a frosted notification panel, no red glow */
    document.head.appendChild(s); }
  // (Oct 7) the people-at-risk badge on the title line: a rounded red triangle with "!"; a tap shows a small tooltip
  // ("People at risk" over the warning's words) that grows from the badge; a tap on the tooltip opens that horizon, a tap outside closes it
  (function () {
    try { var s = document.createElement('style'); s.textContent = ':root .btn.wf-hmok,:root .btn.wf-hmok:hover,:root .btn.wf-hmok:active{background:rgb(215, 0, 21)!important;color:rgb(255, 255, 255)!important}' +   /* (Oct 8) the warning's OK in the warning's red, like its triangle; white text 5.3:1 */ '.wf-hmtag{position:relative}.wf-hmtag>svg{position:absolute;inset:14%;width:72%!important;height:72%!important}.wf-hmtag{-webkit-tap-highlight-color:transparent;touch-action:none;transition:opacity .25s ease,transform .3s cubic-bezier(.2,.8,.2,1),background-color .25s ease}' + ':root .wf-hmtag[data-docked="0"]{pointer-events:none}:root ' + 'html.wf-hm-docking .wf-hmtag{visibility:hidden}html.wf-hm-drag .wf-hmtag[data-docked="0"]{opacity:1}html.wf-hm-near .wf-hmtag[data-docked="0"]{transform:scale(1.15);background:rgba(118,118,128,0.24)!important}.wf-hmtag.wf-hm-hide{visibility:hidden}' + '#wf-hmtip{position:fixed;z-index:420;max-width:260px;box-sizing:border-box;padding:16px;border-radius:var(--wf-r, 16px);background:var(--wf-surface,#FFFFFF);color:var(--wf-ink,#1C1C1E);box-shadow:0 0 16px rgba(0,0,0,0.16);transform-origin:top right;transform:scale(.6);opacity:0;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s ease;-webkit-user-select:none;user-select:none}#wf-hmtip.on{transform:none;opacity:1}#wf-hmtip b{display:block;font-size:16px;line-height:20px;font-weight:600}#wf-hmtip span{display:block;margin-top:4px;font-size:16px;line-height:20px;color:var(--wf-sec,#545458)}'; (document.head || document.documentElement).appendChild(s); } catch (e) {}
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
      dx = Math.min(W - 8 - r.right, Math.max(8 - r.left, dx)); dy = Math.min(H - 8 - r.bottom, Math.max(window.__wfTopLim() - r.top, dy)); p.style.translate = dx + 'px ' + dy + 'px'; };
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
  window.__wfHomesAlert = function (o) { o = null;   /* (Oct 13, 06:50) the floating "structures at risk" warning with its OK is left out of the story for now */
    if (docking) return;
    if (!o) { if (el) { var e0 = el; el = null; sig0 = ''; e0.style.opacity = '0'; e0.style.transform = 'translateY(-16px)'; setTimeout(function () { e0.remove(); }, 400); } return; }
    css(); tap = o.go; ack = o.ack; var PT = window.__wfLang === 'pt';
    var off = null, bot = 0;
    if (!el) { el = document.createElement('div'); el.id = 'wf-homes'; el.className = 'wf-glass'; el.setAttribute('role', 'alert');
      el.style.cssText = 'position: fixed; left: 16px; right: 16px; top: calc(env(safe-area-inset-top, 0px) + 8px); z-index: 410; max-width: 420px; margin: 0 auto; display: flex; align-items: center; gap: 16px; box-sizing: border-box; min-height: 80px; padding: 16px; border-radius: var(--wf-r, 16px); color: var(--wf-ink, rgb(28, 28, 30)); opacity: 0; transform: translateY(-16px); transition: opacity .4s ease, transform .5s cubic-bezier(.2,.8,.2,1), top .4s ease; -webkit-user-select: none; user-select: none';
      /* (Oct 9, 16:27) on a screen with a map band (the candidate's page) the warning rests 16px inside the map's top edge, and fades in 56px lower, sliding up into place */
      try { var mb = [].find.call(document.querySelectorAll('[data-wf-mapband]'), function (m) { var r = m.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.top < innerHeight - 160; }); if (mb) { var k0 = (document.getElementById('dc-root') || document.body).getBoundingClientRect().width / ((document.getElementById('dc-root') || document.body).offsetWidth || 1) || 1; el.style.top = Math.round(mb.getBoundingClientRect().top + 16 * k0) + 'px'; el.style.transform = 'translateY(56px)'; } } catch (x) {}
      el.style.touchAction = 'none'; el.style.cursor = 'grab'; drag(el);
      el.addEventListener('click', function (e) { if (el && el.__moved) { el.__moved = false; return; } try { if (navigator.vibrate) navigator.vibrate(10); } catch (x) {}
        if (e.target.closest('[data-hm-ack]')) { dock(); return; }   /* OK: into the badge's place too */
        if (tap) tap(); });
      document.body.appendChild(el);
      if (pull && pull.on) { var e1 = el; e1.style.transition = 'none'; e1.style.opacity = '1'; e1.style.transform = 'scale(.4)'; e1.style.transformOrigin = '34px 50%'; requestAnimationFrame(function () { e1.style.transition = 'opacity .4s ease, transform .35s cubic-bezier(.2,.8,.2,1), bottom .4s ease'; e1.style.transform = 'none'; }); }
      else requestAnimationFrame(function () { requestAnimationFrame(function () { if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0px)'; } }); }); }

    var s = o.title + '|' + o.sub; if (s !== sig0) { sig0 = s;
      el.innerHTML = '<svg width="36" height="32" viewBox="0 0 36 32" aria-hidden="true" style="flex-shrink: 0"><path d="M18 5 32.5 28.5H3.5Z" fill="rgb(215, 0, 21)" stroke="rgb(215, 0, 21)" stroke-width="5" stroke-linejoin="round"></path><rect x="16.5" y="11" width="3" height="10" rx="1.5" fill="rgb(255, 255, 255)"></rect><circle cx="18" cy="24.6" r="1.8" fill="rgb(255, 255, 255)"></circle></svg><span role="button" tabindex="0" aria-label="' + (o.title + '. ' + o.sub).replace(/"/g, '&quot;') + '" style="display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; cursor: pointer"><span style="font-size: 17px; font-weight: 600; line-height: 22px">' + o.title + '</span>' + (o.sub ? '<span style="font-size: 16px; font-weight: 400; line-height: 20px; color: var(--wf-ink2, rgb(84, 84, 88))">' + o.sub + '</span>' : '') + '</span>' +
        '<button type="button" class="btn wf-hmok" data-hm-ack style="flex-shrink: 0; padding: 0 16px; border: 0; font: inherit; cursor: pointer; background: rgb(215, 0, 21) !important; color: rgb(255, 255, 255) !important; -webkit-text-fill-color: rgb(255, 255, 255)">' + 'OK' + '</button>'; }
    if (pull && pull.on && pull.cx != null && el.__to) el.__to(pull.cx, pull.cy); };
  /* (Oct 8, 23:32) the all-clear and the floating notes float like the structures warning: drag them anywhere (not by a
     button), throw them and they glide to a stop, kept 8px inside the screen; they never dock */
  /* (Oct 9, 13:19) every floating notification (houses at risk, houses safe, someone joined, dispatch) sits at the top of the screen,
     8px under the status bar, 80px tall at least; several stack downwards, 8px apart, and they drop in from the top */
  /* (Oct 9, 13:34) floating panels stop (and bounce) at the fixed status-bar strip, never under it */
  window.__wfTopLim = function () { var v = window.__wfTopLimV; if (v == null || Date.now() - (window.__wfTopLimT || 0) > 2000) { try { var pr = document.createElement('div'); pr.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)'; document.body.appendChild(pr); v = parseFloat(getComputedStyle(pr).paddingTop) || 0; pr.remove(); } catch (e) { v = 0; } window.__wfTopLimV = v; window.__wfTopLimT = Date.now(); } return v + 8; };
  function TOPOFF(me) { var h = 0; ['wf-homes', 'wf-homes-safe'].forEach(function (id) { var e = document.getElementById(id); if (e && e !== me && e.offsetHeight) h += e.offsetHeight + 8; }); return h; }
  function floaty(p, onHold) { var st = null, fl = 0, dx = 0, dy = 0;
    var clamp = function () { p.style.translate = '0px 0px'; var r = p.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
      dx = Math.min(W - 8 - r.right, Math.max(8 - r.left, dx)); dy = Math.min(H - 8 - r.bottom, Math.max(window.__wfTopLim() - r.top, dy)); p.style.translate = dx + 'px ' + dy + 'px'; };
    p.style.touchAction = 'none'; p.style.cursor = 'grab';
    p.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; cancelAnimationFrame(fl); st = { x: e.clientX, y: e.clientY, dx: dx, dy: dy, moved: false, tr: [] }; if (onHold) onHold(true); try { p.setPointerCapture(e.pointerId); } catch (x) {} });
    p.addEventListener('pointermove', function (e) { if (!st) return; var mx = e.clientX - st.x, my = e.clientY - st.y; if (!st.moved && Math.hypot(mx, my) < 6) return;
      st.moved = true; p.style.cursor = 'grabbing'; dx = st.dx + mx; dy = st.dy + my; clamp(); var t = performance.now(); st.tr.push([t, e.clientX, e.clientY]); while (st.tr.length > 2 && t - st.tr[0][0] > 90) st.tr.shift(); e.preventDefault(); });
    var up = function () { if (!st) return; var s0 = st; st = null; p.style.cursor = 'grab'; if (onHold) onHold(false); if (!s0.moved) return;
      var a = s0.tr[0], z = s0.tr[s0.tr.length - 1], dt = a && z ? Math.max(16, z[0] - a[0]) : 16, vx = a && z ? (z[1] - a[1]) / dt * 16 : 0, vy = a && z ? (z[2] - a[2]) / dt * 16 : 0;
      (function glide() { vx *= 0.92; vy *= 0.92; if (Math.hypot(vx, vy) < 0.3) return; dx += vx; dy += vy; clamp(); fl = requestAnimationFrame(glide); })(); };
    p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up); }
  /* (Oct 8, 23:30) a floating note, the same glass card as the structures warning, that goes by itself after 3 s (someone joined) */
  window.__wfFloatNote = function (o) { if (!o) return; var w = document.createElement('div'); w.className = 'wf-glass wf-fnote'; w.setAttribute('role', 'status');
    w.style.cssText = 'position: fixed; left: 16px; right: 16px; top: calc(env(safe-area-inset-top, 0px) + 8px + ' + TOPOFF() + 'px); z-index: 411; max-width: 420px; margin: 0 auto; display: flex; align-items: center; gap: 16px; box-sizing: border-box; min-height: 80px; padding: 16px; border-radius: var(--wf-r, 16px); color: var(--wf-ink, rgb(28, 28, 30)); opacity: 0; transform: translateY(-16px); transition: opacity .4s ease, transform .5s cubic-bezier(.2,.8,.2,1); -webkit-user-select: none; user-select: none';
    var esc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    w.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style="flex-shrink: 0"><circle cx="18" cy="18" r="16" fill="rgb(28, 28, 30)"></circle><path d="M15 17a3.6 3.6 0 1 0 0-7.2a3.6 3.6 0 0 0 0 7.2Z M8.5 26a6.5 6.5 0 0 1 13 0 M25 12v7 M21.5 15.5h7" fill="none" stroke="rgb(255, 255, 255)" stroke-width="2" stroke-linecap="round"></path></svg>' +
      '<span style="display: flex; flex-direction: column; gap: 4px; flex: 1 1 auto; min-width: 0"><b style="font-size: 17px; line-height: 22px; font-weight: 600">' + esc(o.title) + '</b>' + (o.sub ? '<span style="font-size: 16px; line-height: 20px">' + esc(o.sub) + '</span>' : '') + '</span>';
    document.body.appendChild(w); requestAnimationFrame(function () { requestAnimationFrame(function () { w.style.opacity = '1'; w.style.transform = 'translateY(0px)'; }); });
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (x) {}
    var held = false, due = Date.now() + 3000, go = function () { if (held || Date.now() < due) return; clearInterval(tk); w.style.opacity = '0'; w.style.transform = 'translateY(-16px)'; setTimeout(function () { w.remove(); }, 450); }, tk = setInterval(go, 200);
    floaty(w, function (h) { held = h; if (!h) due = Math.max(due, Date.now() + 1200); }); };   /* held, it waits; let go, it leaves a moment later */
  /* (Oct 8, 23:04) the all-clear: once the fire is being controlled, the same floating card in green, a round check instead of
     the triangle, "Structures are now safe" and a green OK; shown once per fire (kept on this phone) */
  var safeEl = null, safeId = '';
  window.__wfHomesSafe = function (o) { o = null;   /* (Oct 11, 00:35) the "Structures are now safe" notification is left out of the story for now */ var seen = {}; try { seen = JSON.parse(localStorage.getItem('wf-homes-safe') || '{}') || {}; } catch (x) {}
    if (!o || seen[o.id]) { if (safeEl) { var e0 = safeEl; safeEl = null; safeId = ''; e0.style.opacity = '0'; e0.style.transform = 'translateY(-16px)'; setTimeout(function () { e0.remove(); }, 400); } return; }
    if (safeEl && safeId === o.id) return; if (safeEl) safeEl.remove(); safeId = o.id;
    var w = safeEl = document.createElement('div'); w.id = 'wf-homes-safe'; w.className = 'wf-glass'; w.setAttribute('role', 'status');
    w.style.cssText = 'position: fixed; left: 16px; right: 16px; top: calc(env(safe-area-inset-top, 0px) + 8px + ' + TOPOFF() + 'px); z-index: 410; max-width: 420px; margin: 0 auto; display: flex; align-items: center; gap: 16px; box-sizing: border-box; min-height: 80px; padding: 16px; border-radius: var(--wf-r, 16px); color: var(--wf-ink, rgb(28, 28, 30)); opacity: 0; transform: translateY(-16px); transition: opacity .4s ease, transform .5s cubic-bezier(.2,.8,.2,1); -webkit-user-select: none; user-select: none';
    var esc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    w.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style="flex-shrink: 0"><circle cx="18" cy="18" r="16" fill="rgb(36, 138, 61)"></circle><path d="M10.5 18.5l5 5L26 13" fill="none" stroke="rgb(255, 255, 255)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
      '<span style="display: flex; flex-direction: column; gap: 4px; flex: 1 1 auto; min-width: 0"><b style="font-size: 17px; line-height: 22px; font-weight: 600">' + esc(o.title) + '</b>' + (o.sub ? '<span style="font-size: 16px; line-height: 20px">' + esc(o.sub) + '</span>' : '') + '</span>' +
      '<button type="button" class="btn wf-safeok" style="flex-shrink: 0; padding: 0 16px; border: 0; font: inherit; cursor: pointer; background: rgb(36, 138, 61) !important; color: rgb(255, 255, 255) !important; -webkit-text-fill-color: rgb(255, 255, 255)">OK</button>';
    w.querySelector('button').addEventListener('click', function () { try { if (navigator.vibrate) navigator.vibrate(10); } catch (x) {} var S = {}; try { S = JSON.parse(localStorage.getItem('wf-homes-safe') || '{}') || {}; } catch (x) {} S[o.id] = Date.now(); try { localStorage.setItem('wf-homes-safe', JSON.stringify(S)); } catch (x) {} window.__wfHomesSafe(null); });
    floaty(w); document.body.appendChild(w); requestAnimationFrame(function () { requestAnimationFrame(function () { if (safeEl === w) { w.style.opacity = '1'; w.style.transform = 'translateY(0px)'; } }); });
    try { if (navigator.vibrate) navigator.vibrate([10, 40, 10]); } catch (x) {} };
  try { var sk = document.createElement('style'); sk.textContent = ':root .btn.wf-safeok,:root .btn.wf-safeok:hover,:root .btn.wf-safeok:active{background:rgb(36, 138, 61)!important;color:rgb(255, 255, 255)!important}'; (document.head || document.documentElement).appendChild(sk); } catch (x) {}
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
          const kc = d.el.querySelector('[data-wf-kpicard]'); if (kc) kc.style.boxShadow = '0 0 16px rgba(0,0,0,0.16)';
          d.el.style.zIndex = '3'; d.el.style.transition = 'transform .22s cubic-bezier(.34,1.4,.5,1)'; d.el.style.transform = 'scale(1.04)'; window.__wfKpiLift = true; cards().forEach((c) => { if (c !== d.el) c.style.transition = 'transform .42s cubic-bezier(.34,1.3,.5,1)'; }); }, 250); },   /* (Oct 16, 21:42) a soft lift; the others glide to their new places with a gentle settle */
      move: (e) => { const d = self._kd; if (!d || d.key !== key) return;
        if (!d.lifted) { if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 8) { clearTimeout(self._kpT); self._kd = null; } return; }
        const dx = (e.clientX - d.x0) / d.k, dy = (e.clientY - d.y0) / d.k, L = cards(), me = d.slots[d.idx], px = me[0] + dx, py = me[1] + dy;
        let best = d.idx, bd = 1e9; d.slots.forEach((q, j) => { const dd = Math.hypot(q[0] - px, q[1] - py); if (dd < bd) { bd = dd; best = j; } }); d.to = best;
        e.preventDefault && e.preventDefault();
        if (!d.mv) { d.mv = 1; d.el.style.transition = 'none'; } d.el.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(1.04)';
        const order = L.map((_, j) => j); order.splice(d.idx, 1); order.splice(d.to, 0, d.idx);
        order.forEach((j, pos) => { if (j === d.idx) return; const c = L[j], a = d.slots[j], b = d.slots[pos]; c.style.transform = pos !== j ? 'translate(' + (b[0] - a[0]).toFixed(1) + 'px, ' + (b[1] - a[1]).toFixed(1) + 'px)' : ''; }); },
      up: () => { clearTimeout(self._kpT); window.__wfKpiLift = false; const d = self._kd; self._kd = null; if (d && !d.lifted && d.key === key && typeof onTap === 'function') { onTap(); return; } if (!d || !d.lifted) return; try { (window.__wfHaptic || (() => { if (navigator.vibrate) navigator.vibrate(10); }))(); } catch (x) {}
        const L = cards().map((c) => c.getAttribute('data-wf-kpi')), from = d.idx, to = d.to; if (to !== from) { const [x] = L.splice(from, 1); L.splice(to, 0, x); }
        let all = null; try { all = JSON.parse(localStorage.getItem(SK) || 'null'); } catch (x) {} all = Array.isArray(all) ? all : []; const rest = all.filter((q) => L.indexOf(q) < 0);
        try { localStorage.setItem(SK, JSON.stringify(L.concat(rest))); } catch (x) {}
        window.__wfKpiDrop = Date.now();
        /* (Oct 16, 21:42) the drop lands softly: each card glides from where it shows to its new place and settles with a gentle bounce (FLIP), the lifted one included */
        const B0 = {}; cards().forEach((c) => { const r = c.getBoundingClientRect(); B0[c.getAttribute('data-wf-kpi')] = [r.left, r.top]; });
        reset(); cards().forEach((c) => { c.style.transition = 'none'; }); self.forceUpdate();
        requestAnimationFrame(() => { try { if (window.__wfFitKpi) window.__wfFitKpi(); } catch (x) {} });   /* (Oct 16, 22:37) the values are fitted to their new cards before they show: no text jumping after the drop */
        requestAnimationFrame(() => requestAnimationFrame(() => { try { if (window.__wfFitKpi) window.__wfFitKpi(); } catch (x) {} cards().forEach((c) => { c.style.transition = ''; const b = B0[c.getAttribute('data-wf-kpi')]; if (!b) return; const r = c.getBoundingClientRect(), dx = (b[0] - r.left) / d.k, dy = (b[1] - r.top) / d.k; if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
          try { c.style.zIndex = c.getAttribute('data-wf-kpi') === d.key ? '3' : ''; const an = c.animate([{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.34,1.3,.5,1)' }); an.onfinish = () => { c.style.zIndex = ''; }; } catch (x) {} }); })); }
    };
};
/* a card that was just moved is not also tapped (a unit switch or link inside it) */
document.addEventListener('click', function (e) { if (Date.now() - (window.__wfKpiDrop || 0) < 450 && e.target && e.target.closest && e.target.closest('[data-wf-kpi]')) { e.preventDefault(); e.stopPropagation(); } }, true);

// (Oct 8, 21:48, app-wide) A map in full screen hides the preferences (menu) button: only the map and its own controls show.
(function () { if (window.__wfMbFull || typeof document === 'undefined') return;
  var st = document.createElement('style'); st.textContent = '.wf-mb,button[data-wf-burger]{transition:opacity .3s ease}html.wf-mapfull .wf-mb,html.wf-mapfull button[data-wf-burger]{opacity:0!important;pointer-events:none!important}'; (document.head || document.documentElement).appendChild(st);
  window.__wfMbFull = setInterval(function () { var on = false, W = innerWidth, H = innerHeight, menuOpen = !!document.querySelector('button[data-wf-x], .wf-mb[data-wf-x]');
    Array.prototype.forEach.call(document.querySelectorAll('[data-wf-maproot][data-wf-isfull="1"]'), function (m) { if (on || !m.offsetWidth) return; var r = m.getBoundingClientRect(), big = Math.max(r.width, r.height) >= Math.max(W, H) * 0.85 && Math.min(r.width, r.height) >= Math.min(W, H) * 0.9;
      if (big && r.top < H && r.bottom > 0 && getComputedStyle(m).visibility !== 'hidden') on = true; });
    document.documentElement.classList.toggle('wf-mapfull', on && !menuOpen);
    /* (Oct 9, 17:55) a screen shown inside a blade (an iframe): its full-screen map tells the screen around it, which lets the frame fill the whole screen */
    if (window.top !== window && on !== window.__wfMapFullSent) { window.__wfMapFullSent = on; try { window.parent.postMessage({ wfMapFull: on }, location.origin); } catch (x) {} } }, 250);
  /* the other side: a frame whose map went full screen covers the whole screen (out of its blade), and goes back when the map is minimised */
  window.addEventListener('message', function (e) { if (e.origin !== location.origin || !e.data || typeof e.data.wfMapFull !== 'boolean') return;
    var fr = Array.prototype.find.call(document.querySelectorAll('iframe'), function (f) { return f.contentWindow === e.source; }); if (!fr) return;
    if (e.data.wfMapFull) { if (fr.__wfFull) return; var saved = [], a = fr.parentElement;
      for (; a && a !== document.documentElement && a.id !== 'dc-root'; a = a.parentElement) {   /* the screen's own scaling frame stays: the map fills that frame, which is the whole screen */ var cs = getComputedStyle(a); if (cs.transform !== 'none' || cs.overflow !== 'visible' || cs.clipPath !== 'none' || cs.filter !== 'none' || cs.contain !== 'none') { saved.push([a, a.style.transform, a.style.overflow, a.style.clipPath, a.style.webkitClipPath, a.style.filter, a.style.contain]); a.style.transform = 'none'; a.style.overflow = 'visible'; a.style.clipPath = 'none'; a.style.webkitClipPath = 'none'; a.style.filter = 'none'; a.style.contain = 'none'; } }
      fr.__wfFull = { saved: saved, css: fr.getAttribute('style') || '' }; fr.style.cssText += ';position:fixed!important;left:0!important;top:0!important;width:100%!important;height:100%!important;z-index:2147483000!important;border-radius:0!important';
      if (window.parent !== window) { try { window.parent.postMessage({ wfMapFull: true }, location.origin); } catch (x) {} } }
    else if (fr.__wfFull) { var F = fr.__wfFull; fr.__wfFull = null; fr.setAttribute('style', F.css); F.saved.forEach(function (q) { q[0].style.transform = q[1]; q[0].style.overflow = q[2]; q[0].style.clipPath = q[3]; q[0].style.webkitClipPath = q[4]; q[0].style.filter = q[5]; q[0].style.contain = q[6]; });
      if (window.parent !== window) { try { window.parent.postMessage({ wfMapFull: false }, location.origin); } catch (x) {} } } });
})();

// (Oct 8, 21:57) An incident page shown in a blade over the chat (?embed=1, in a frame): only its content. No back, menu, chat or
// notifications buttons, and its title no longer leads away (the blade's own back arrow folds it back into the chat).
(function () { try { if (window.top === window || !/[?&]embed=1/.test(location.search)) return; document.documentElement.classList.add('wf-embed');
  var st = document.createElement('style'); st.textContent = 'html.wf-embed [data-wf-back],html.wf-embed .wf-mb,html.wf-embed button[data-wf-burger],html.wf-embed [data-wf-burger-spot],html.wf-embed a[href^="Chat.dc.html"],html.wf-embed [aria-label^="Notifications"],html.wf-embed [aria-label^="Assignments"],html.wf-embed [aria-label="Preferences"],html.wf-embed [data-wf-teamchat]{display:none!important}html.wf-embed [data-wf-chev]{pointer-events:none!important}html.wf-embed [data-wf-chev]::before{display:none!important}'; (document.head || document.documentElement).appendChild(st);
  /* links that would leave the incident open in the whole app, not inside the blade */
  document.addEventListener('click', function (e) { var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a || /^#|^javascript/.test(a.getAttribute('href') || '')) return; if (a.closest('[data-wf-back]')) { try { if (window.top.__wfFlyBack && window.top.__wfFlyBack(null, a)) { e.preventDefault(); e.stopImmediatePropagation(); return; } } catch (x) {} } var h = a.getAttribute('href'); if (/^(Dispatch|Alert)\.dc\.html/.test(h)) return; e.preventDefault(); e.stopPropagation(); try { window.top.location.href = h; } catch (x) {} }, true);
} catch (e) {} })();

/* (Oct 15, 14:04) the confirmation halo: when a captain confirms a fire on scene, the screen's edge glows like Siri's, in red, orange and purple, turning slowly; it fades in, holds, fades out (about 4 s) and never takes a touch */
window.__wfHalo=function(hold){try{var d=document;if(!d.getElementById('wf-halo-css')){var c=d.createElement('style');c.id='wf-halo-css';c.textContent='@property --wf-ha{syntax:"<angle>";inherits:false;initial-value:0deg}'+
'.wf-halo{position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;transition:opacity .8s cubic-bezier(.45,0,.2,1)}.wf-halo.on{opacity:1}'+
'.wf-halo i{position:absolute;inset:0;border-radius:var(--wf-r, 16px);padding:4px;background:conic-gradient(from var(--wf-ha),#FF3B30,#FF9500,#AF52DE,#FF2D55,#FF6A00,#8E44EC,#FF3B30);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:wf-ha 3.2s linear infinite}'+
'.wf-halo b{position:absolute;inset:0;filter:blur(14px);opacity:.9}.wf-halo b i{padding:16px}'+
'@keyframes wf-ha{to{--wf-ha:360deg}}@media (prefers-reduced-motion: reduce){.wf-halo i{animation:none}}';(d.head||d.documentElement).appendChild(c);}
var o=d.querySelector('.wf-halo');if(o)o.remove();var h=d.createElement('div');h.className='wf-halo';h.setAttribute('aria-hidden','true');h.innerHTML='<i></i><b><i></i></b>';d.body.appendChild(h);
requestAnimationFrame(function(){requestAnimationFrame(function(){h.classList.add('on');});});if(!hold){setTimeout(function(){h.classList.remove('on');},3200);setTimeout(function(){h.remove();},4200);}
try{if(navigator.vibrate)navigator.vibrate([12,60,12]);}catch(e){}}catch(e){}};
/* (Oct 15, 14:13) a held halo stays until the captain's card is touched (tapped or dragged); then it fades out (0.8 s) */
window.__wfHaloOff=function(){try{var h=document.querySelector('.wf-halo');if(!h)return;h.classList.remove('on');setTimeout(function(){if(h.parentNode)h.remove();},900);}catch(e){}};

// (Oct 16) Water is not fuel: a fire's outline and its projections never sit on water. Around an incident the app reads the
// water from OpenStreetMap (lakes, reservoirs, riverbanks as polygons, islands kept; the sea from the coastline, land on its
// left) and gives the maps a mask in their own units, so every fire shape stops at the shore. Kept 7 days per area on this phone.
(function () {
  var MEM = {}, TTL = 7 * 864e5, LK = 'wf-water2-', DLAT = 0.09, DLON = 0.11, N = 512;
  var X = function (lo) { return (lo + 118.13) * 2345 + 518; }, Y = function (la) { return (34.19 - la) * 2829 + 662; };
  function keyOf(la, lo) { return (Math.round(la / 0.05) * 0.05).toFixed(2) + ',' + (Math.round(lo / 0.05) * 0.05).toFixed(2); }
  function join(ws) { var rings = [], open = []; ws.forEach(function (w) { if (w.length < 2) return; var a = w[0], b = w[w.length - 1]; if (a[0] === b[0] && a[1] === b[1]) rings.push(w); else open.push(w.slice()); });
    while (open.length) { var cur = open.shift(), grown = true;
      while (grown) { grown = false; var e = cur[cur.length - 1], s = cur[0]; if (e[0] === s[0] && e[1] === s[1]) break;
        for (var i = 0; i < open.length; i++) { var o = open[i], oa = o[0], ob = o[o.length - 1];
          if (oa[0] === e[0] && oa[1] === e[1]) { cur = cur.concat(o.slice(1)); } else if (ob[0] === e[0] && ob[1] === e[1]) { cur = cur.concat(o.slice().reverse().slice(1)); }
          else if (ob[0] === s[0] && ob[1] === s[1]) { cur = o.slice(0, -1).concat(cur); } else if (oa[0] === s[0] && oa[1] === s[1]) { cur = o.slice().reverse().slice(0, -1).concat(cur); } else continue;
          open.splice(i, 1); grown = true; break; } }
      rings.push(cur); }
    return rings; }
  function ringD(r) { return 'M' + r.map(function (q) { return X(q[1]).toFixed(1) + ' ' + Y(q[0]).toFixed(1); }).join('L') + 'Z'; }
  // the sea: the coastline drawn into a fine grid (two cells thick), seeded on its right (the water side), filled up to it
  function seaD(lines, S, W) { if (!lines.length) return '';
    var g = new Uint8Array(N * N), cw = 2 * DLON / N, ch = 2 * DLAT / N, ci = function (lo) { return Math.floor((lo - W) / cw); }, cj = function (la) { return Math.floor((la - S) / ch); };
    var mark = function (i, j) { if (i >= 0 && j >= 0 && i < N && j < N) g[j * N + i] = 1; }, seeds = [];
    lines.forEach(function (L) { for (var k = 1; k < L.length; k++) { var a = L[k - 1], b = L[k], dla = b[0] - a[0], dlo = b[1] - a[1], n = Math.max(1, Math.ceil(Math.max(Math.abs(dlo) / cw, Math.abs(dla) / ch) * 2));
      for (var t = 0; t <= n; t++) { var la = a[0] + dla * t / n, lo = a[1] + dlo * t / n, i = ci(lo), j = cj(la); mark(i, j); mark(i + 1, j); mark(i, j + 1); }
      var len = Math.hypot(dlo / cw, dla / ch) || 1, ra = -dlo / cw / len, ro = dla / ch / len;   /* the right of the way's direction, in cells (north up) */
      var mla = (a[0] + b[0]) / 2, mlo = (a[1] + b[1]) / 2; seeds.push([ci(mlo) + Math.round(ro * 3), cj(mla) + Math.round(ra * 3)]); } });
    var q = []; seeds.forEach(function (s) { var i = s[0], j = s[1]; if (i >= 0 && j >= 0 && i < N && j < N && !g[j * N + i]) { g[j * N + i] = 2; q.push(j * N + i); } });
    while (q.length) { var c = q.pop(), i = c % N, j = (c - i) / N; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var a = i + d[0], b = j + d[1]; if (a < 0 || b < 0 || a >= N || b >= N) return; var k = b * N + a; if (!g[k]) { g[k] = 2; q.push(k); } }); }
    for (var k2 = 0; k2 < N * N; k2++) if (g[k2] === 1) { var i2 = k2 % N, j2 = (k2 - i2) / N; if ((i2 > 0 && g[k2 - 1] === 2) || (i2 < N - 1 && g[k2 + 1] === 2) || (j2 > 0 && g[k2 - N] === 2) || (j2 < N - 1 && g[k2 + N] === 2)) g[k2] = 3; }
    var d = ''; for (var j3 = 0; j3 < N; j3++) { var run = -1; for (var i3 = 0; i3 <= N; i3++) { var w = i3 < N && g[j3 * N + i3] >= 2; if (w && run < 0) run = i3; if (!w && run >= 0) { var x0 = X(W + run * cw), x1 = X(W + i3 * cw), y0 = Y(S + (j3 + 1) * ch), y1 = Y(S + j3 * ch); d += 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'H' + x1.toFixed(1) + 'V' + y1.toFixed(1) + 'H' + x0.toFixed(1) + 'Z'; run = -1; } } }
    return d; }
  function load(k) { try { var v = JSON.parse(localStorage.getItem(LK + k) || 'null'); if (v && Date.now() - v.t < TTL) return v; } catch (e) {} return null; }
  // the water around a point, as { lakes, sea } SVG paths in map units (lakes with fill-rule evenodd, so islands stay land); null while loading
  window.__wfWater = function (la, lo) { if (!(Math.abs(la) < 85) || !isFinite(lo)) return null; var k = keyOf(la, lo), m = MEM[k];
    if (m) return m.st === 'done' ? m.res : null; var c = load(k); if (c) { MEM[k] = { st: 'done', res: c }; return c; }
    MEM[k] = { st: 'loading' }; var c0 = k.split(',').map(Number), S = c0[0] - DLAT, Nn = c0[0] + DLAT, W = c0[1] - DLON, E = c0[1] + DLON, B = S.toFixed(4) + ',' + W.toFixed(4) + ',' + Nn.toFixed(4) + ',' + E.toFixed(4);
    var q = '[out:json][timeout:40][bbox:' + B + '];(way["natural"="water"];relation["natural"="water"];way["landuse"="reservoir"];relation["landuse"="reservoir"];way["waterway"="riverbank"];);out geom;way["natural"="coastline"];out geom(' + B + ');';
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (js) {
        var E0 = js.elements || [], lakes = '', coast = [], pt = function (g) { return (g || []).filter(Boolean).map(function (p) { return [p.lat, p.lon]; }); };
        E0.forEach(function (e) { var tg = e.tags || {};
          if (tg.natural === 'coastline') { var L = pt(e.geometry); if (L.length > 1) coast.push(L); return; }
          if (e.type === 'way') { var r = pt(e.geometry); if (r.length > 2) lakes += ringD(r); return; }
          if (e.type === 'relation') join((e.members || []).filter(function (mb) { return mb.type === 'way' && mb.geometry; }).map(function (mb) { return pt(mb.geometry); })).forEach(function (r) { if (r.length > 2) lakes += ringD(r); }); });
        /* coastline pieces cut at the box are joined first, so the sea side is read along whole stretches */
        var res = { t: Date.now(), lakes: lakes, sea: seaD(coast, S, W) };   /* (Oct 16, 13:16) coastline ways are read one by one, never joined: joining reversed some, which flipped their sea side and masked the land (the projections vanished) */
        MEM[k] = { st: 'done', res: res }; try { localStorage.setItem(LK + k, JSON.stringify(res)); } catch (e) {} try { window.dispatchEvent(new Event('wf-sync')); } catch (e) {}
      }).catch(function () { MEM[k] = { st: 'fail' }; setTimeout(function () { if (MEM[k] && MEM[k].st === 'fail') delete MEM[k]; }, 60000); });
    return null; };
})();

// (Oct 16, 15:58) Counting numbers: an element with data-wf-count shows its number counting from the last value to the new one
// whenever the value changes (up or down), easing in and out over 0.9s. Under 10 it keeps one decimal (a comma in Portuguese).
(function(){
  var fmt=function(v){var pt=window.__wfLang==='pt';if(v<10){var t=(Math.round(v*10)/10).toFixed(1).replace(/\.0$/,'');return pt?t.replace('.',','):t;}return Math.round(v).toLocaleString(pt?'pt-PT':'en-US');};
  /* (Oct 16, 19:09) a projected area takes the colour of its fire size class (NWCG, by acres) as it counts: grey up to class B, then
     amber (C, 10 ac), orange (D, 100 ac), red orange (E, 300 ac), red from class F (1,000 ac), the fifth level */
  var SZ=[[1000,'rgb(215, 0, 21)'],[300,'rgb(196, 46, 15)'],[100,'rgb(181, 74, 0)'],[10,'rgb(138, 97, 0)'],[0,'rgb(72, 72, 74)']];
  var tint=function(el,v){var h=el.closest&&el.closest('[data-wf-sizecls]');if(!h)return;var ac=v*(parseFloat(h.getAttribute('data-wf-sizecls'))||1),c=SZ[SZ.length-1][1];for(var i=0;i<SZ.length;i++){if(ac>=SZ[i][0]){c=SZ[i][1];break;}}if(h.style.color!==c)h.style.color=c;var t=h.parentNode&&h.parentNode.querySelector('[data-wf-sizetag]');if(t){var L='ABCDEFG'.charAt([0.25,10,100,300,1000,5000].filter(function(x){return ac>=x;}).length);if(t.textContent!==L){t.textContent=L;t.setAttribute('aria-label',(window.__wfLang==='pt'?'Classe ':'Size class ')+L);}if(t.style.background!==c)t.style.background=c;}};   /* (Oct 17) the size class tag beside it changes letter and colour as the number counts */
  var run=function(el){var to=parseFloat(el.getAttribute('data-wf-count'));if(!isFinite(to))return;var from=el.__wfCv;el.__wfCv=to;
    if(from==null||from===to){el.textContent=fmt(to);tint(el,to);return;}cancelAnimationFrame(el.__wfCr||0);var T0=performance.now(),D=900;
    (function step(t){var k=Math.min(1,(t-T0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,cur=from+(to-from)*e;el.textContent=fmt(cur);tint(el,cur);if(k<1)el.__wfCr=requestAnimationFrame(step);})(T0);};
  var scan=function(){try{document.querySelectorAll('[data-wf-count]').forEach(function(el){var v=parseFloat(el.getAttribute('data-wf-count'));if(el.__wfCv!==v)run(el);});}catch(x){}};
  var start=function(){try{new MutationObserver(function(M){for(var i=0;i<M.length;i++){var m=M[i];if(m.type==='attributes'&&m.attributeName==='data-wf-count'){run(m.target);}else if(m.type==='childList'){scan();return;}}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-wf-count']});}catch(x){}scan();};
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();

// (Oct 16, 15:49) Shared map, main screen -> incident: no panel rising. The tapped tooltip fades, everything over the main map leaves
// (what sits in the top half slides up, the rest slides down, the header too) and the map itself flies to where the incident screen
// will show it, while that screen loads unseen. When it is ready the map lands on its exact framing, the incident's map takes over
// (a short dissolve between two identical pictures) and its own surfaces come in over it: the header slides down from the top,
// everything from the lower half slides up from below. Then the real page opens in its place (the still picture covers the hand-over).
(function(){
  var EASE='cubic-bezier(.37,0,.63,1)',SLIDE=530,EST='wf-shared-est';
  var ez=function(k){return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;};
  // the frame chain up to the top window: an element's rect in top-window pixels
  var topRect=function(el){var r=el.getBoundingClientRect(),x=r.left,y=r.top,w=r.width,h=r.height,win=el.ownerDocument.defaultView;
    while(win&&win!==window.top&&win.frameElement){var fe=win.frameElement,fr=fe.getBoundingClientRect(),k=fr.width/(win.innerWidth||fr.width||1);x=fr.left+x*k;y=fr.top+y*k;w*=k;h*=k;win=fe.ownerDocument.defaultView;}
    return {left:x,top:y,width:w,height:h,right:x+w,bottom:y+h};};
  var shown=function(el){if(!el||!el.getBoundingClientRect)return false;var r=el.getBoundingClientRect();if(!(r.width>1&&r.height>1))return false;var cs=el.ownerDocument.defaultView.getComputedStyle(el);return cs.visibility!=='hidden'&&cs.display!=='none'&&parseFloat(cs.opacity)>0.01;};
  // the surfaces over a map: every visible element off the path from the page's body to the map (and the map's own controls),
  // each with the way it travels (up for the top half of the screen, down for the rest)
  var paints=function(el){try{var W0=el.ownerDocument.defaultView,cs=W0.getComputedStyle(el),bg=cs.backgroundColor;if(bg&&!/rgba\([^)]*,\s*0\)|transparent/.test(bg))return true;if(cs.backgroundImage!=='none'||(cs.backdropFilter&&cs.backdropFilter!=='none')||(cs.webkitBackdropFilter&&cs.webkitBackdropFilter!=='none')||cs.boxShadow!=='none')return true;
    for(var i=0;i<2;i++){var ps=W0.getComputedStyle(el,i?'::after':'::before');if(ps.content&&ps.content!=='none'&&(ps.backgroundImage!=='none'||!/rgba\([^)]*,\s*0\)|transparent/.test(ps.backgroundColor)))return true;}}catch(x){}return false;};   /* a holder that draws something itself (a sheet's glass, its stripes) travels whole */
  var collector=function(out){var SH=(window.top.innerHeight||844),mid=SH/2;
    var add=function(el,dp){dp=dp||0;if(!shown(el))return;var cs=el.ownerDocument.defaultView.getComputedStyle(el);if(cs.pointerEvents==='none'&&!el.children.length&&!el.textContent.trim())return;   /* a plain veil (the map's vignette) stays */
      var r=topRect(el);if(r.bottom<=0||r.top>=SH||r.right<=0||r.left>=(window.top.innerWidth||390))return;   /* off screen: nothing to see travel */
      if(r.height>SH*0.6&&el.children.length&&dp<5&&!paints(el)){[].forEach.call(el.children,function(c){if(c.tagName!=='SCRIPT'&&c.tagName!=='STYLE')add(c,dp+1);});return;}   /* a screen-high holder (the panels column): its pieces travel each their own way */
      var k=r.height/(el.offsetHeight||r.height||1)||1,up=(r.top+r.bottom)/2<mid;   /* screen pixels per CSS pixel of the element (frames and the page zoom included) */out.push({el:el,dy:up?-(r.bottom+32)/k:(SH-r.top+32)/k});};
    return add;};
  var peel=function(target,out){var add=collector(out),e=target;while(e&&e.parentElement&&e!==e.ownerDocument.body){var par=e.parentElement;[].forEach.call(par.children,function(c){if(c!==e&&c.tagName!=='SCRIPT'&&c.tagName!=='STYLE')add(c);});e=par;}return out;};
  var mapPeel=function(root,out){var add=collector(out);[].forEach.call(root.children,function(c){if(!c.hasAttribute('data-wf-gl'))add(c);});return out;};
  var slide=function(L,dir){return L.map(function(q){var a0='0 0',a1='0 '+q.dy.toFixed(1)+'px';try{return q.el.animate(dir==='out'?[{translate:a0},{translate:a1}]:[{translate:a1},{translate:a0}],{duration:SLIDE,easing:EASE,fill:'both'});}catch(x){return null;}}).filter(Boolean);};
  /* (Oct 16, 20:26) Full screen in place, on the incident page: the map does not move at all; everything over it (the incident's header,
     its cards, the decisions, the projection) slides away as on the way back (top half up, the rest down), leaving the map and its own
     controls; leaving full screen they slide back in. window.__wfPeelFull(mapRoot, on) */
  window.__wfPeelFull=function(DM,on){try{if(!DM)return;if(on){if(DM.__wfPF)return;var L=[];peel(DM,L);try{var fe=DM.ownerDocument.defaultView.frameElement;while(fe){peel(fe,L);fe=fe.ownerDocument.defaultView.frameElement;}}catch(x){}
      L.forEach(function(q){q.pe=q.el.style.pointerEvents;q.el.style.pointerEvents='none';});DM.__wfPF={L:L,A:slide(L,'out')};}
    else{var P=DM.__wfPF;if(!P)return;DM.__wfPF=null;(P.A||[]).forEach(function(a){try{a.cancel();}catch(x){}});var B=slide(P.L,'in');P.L.forEach(function(q){q.el.style.pointerEvents=q.pe||'';});
      setTimeout(function(){B.forEach(function(a){try{a.cancel();}catch(x){}});},SLIDE+60);}}catch(x){}};
  // the incident screen's map: the largest visible map in the frame and the frames inside it
  var findMap=function(doc,depth){var best=null,area=0;try{[].forEach.call(doc.querySelectorAll('[data-wf-maproot]'),function(m){if(!m.__wfMap||!shown(m))return;var lr=m.getBoundingClientRect(),hit=null;try{hit=doc.elementFromPoint(lr.left+lr.width/2,Math.max(lr.top,0)+Math.min(lr.height,doc.defaultView.innerHeight)*0.3);}catch(x){}if(!hit||!m.contains(hit))return;   /* the map really on show there, not one waiting under it */var r=topRect(m),a=r.width*r.height;if(a>area){area=a;best=m;}});
      if(depth<3)[].forEach.call(doc.querySelectorAll('iframe'),function(fr){try{var cd=fr.contentDocument;if(cd&&shown(fr)){var b=findMap(cd,depth+1);if(b){var r=topRect(b),a=r.width*r.height;if(a>area){area=a;best=b;}}}}catch(x){}});}catch(x){}return best;};
  var BACK='wf-shared-from',BACKT='wf-shared-back';
  var flyCss=function(){if(document.getElementById('wf-fly-css'))return;var st=document.createElement('style');st.id='wf-fly-css';st.textContent='html.wf-flying [data-wf-maproot] .wf-ctag{display:none!important}';(document.head||document.documentElement).appendChild(st);};
  var recentBack=function(){try{var t=+sessionStorage.getItem(BACKT)||0;return Date.now()-t<15000;}catch(x){return false;}};
  /* a map flies to a view: one world point (the incident) glides straight on screen while the zoom changes in log steps */
  var flyMap=function(M,P,to,ms,cb){var Wm=M.W(),Hm=M.H(),loc=function(v){return {x:(P[0]-v.cx)*v.s+Wm/2,y:(P[1]-v.cy)*v.s+Hm/2};},from=M.view(),p0=loc(from),p1=loc(to),l0=Math.log(from.s),l1=Math.log(to.s),t0=performance.now();M._gest=true;try{M.stopGlide&&M.stopGlide();}catch(x){}
    (function step(t){var k=Math.min(1,(t-t0)/ms),e=ez(k),sv=Math.exp(l0+(l1-l0)*e),x=p0.x+(p1.x-p0.x)*e,y=p0.y+(p1.y-p0.y)*e;try{M.setView(P[0]-(x-Wm/2)/sv,P[1]-(y-Hm/2)/sv,sv);}catch(z){}
      if(k<1)requestAnimationFrame(step);else{try{clearTimeout(M._rgT);M.endGest();}catch(z){}if(cb)cb();}})(t0);};
  // (Oct 16, 19:13) The way back, incident -> main screen: the incident's surfaces leave (header up, the rest down), its map zooms out to
  // the main screen's view, then the main screen comes back with its surfaces sliding in over the same map (the way in, reversed).
  /* (Oct 16, 21:18) every back on an incident screen zooms out (never the old pull-down): the header back, and the backs inside the incident
     page's frame (No action closed, Done...), which hand it to the top window. Without the way-in record (opened from a notification or a
     list, or another incident's record), the map zooms out around where it is before the main screen comes back over it. */
  window.__wfFlyBack=function(e,a){try{if(window.top!==window||!/\/(Chat|Dispatch)\.dc\.html$/.test(location.pathname))return false;
    var ref='';try{ref=document.referrer?new URL(document.referrer).pathname:'';}catch(x){}var toMain=/\/Main\.dc\.html$/.test(ref)&&history.length>=2;if(!toMain&&ref)return false;   /* a real back to another screen keeps its own way */
    var DM=findMap(document,0),DI=DM&&DM.__wfMap;if(!DI)return false;
    if(e){e.preventDefault();e.stopImmediatePropagation();}if(window.__wfGoingBack)return true;window.__wfGoingBack=1;try{navigator.vibrate&&navigator.vibrate(8);}catch(x){}
    var B=null;try{B=JSON.parse(sessionStorage.getItem(BACK)||'null');}catch(x){}var v=DI.view();
    if(B&&B.v){var Wd=DI.W(),Hd=DI.H(),ix=(B.px-v.cx)*v.s+Wd/2,iy=(B.py-v.cy)*v.s+Hd/2;if(ix<-Wd*0.25||ix>Wd*1.25||iy<-Hd*0.25||iy>Hd*1.25)B=null;}   /* another incident's record */
    var L=[];try{peel(DM,L);mapPeel(DM,L);var fe=DM.ownerDocument.defaultView.frameElement;while(fe){peel(fe,L);fe=fe.ownerDocument.defaultView.frameElement;}}catch(x){}
    slide(L,'out');try{flyCss.call(null);}catch(x){}
    var leave=function(){try{sessionStorage.setItem(BACKT,String(Date.now()));sessionStorage.setItem('wf-pu-arrive',String(Date.now()));}catch(x){}if(toMain)history.back();else location.href='Main.dc.html';};
    setTimeout(function(){try{if(B&&B.v){var rD=topRect(DM),kD=rD.width/(DI.W()||1),kM=B.r.width/(B.W||1),Q=kM*B.v.s,sD=Q/kD;
        var cx=B.v.cx+((rD.left+kD*DI.W()/2)-(B.r.left+kM*B.W/2))/Q,cy=B.v.cy+((rD.top+kD*DI.H()/2)-(B.r.top+kM*B.H/2))/Q;
        flyMap(DI,[B.px,B.py],{cx:cx,cy:cy,s:sD},900,leave);}
      else flyMap(DI,[v.cx,v.cy],{cx:v.cx,cy:v.cy,s:v.s/10},900,leave);   /* the last picture of this screen stays until the main screen has drawn (the push-up arrival's hold) */}catch(x){leave();}},SLIDE*0.6);return true;}catch(x){return false;}};
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('[data-wf-back]');if(!a)return;
    if(window.top!==window){try{if(window.top.__wfFlyBack&&window.top.__wfFlyBack(null,a)){e.preventDefault();e.stopImmediatePropagation();}}catch(x){}return;}
    window.__wfFlyBack(e,a);},true);
  addEventListener('pageshow',function(){window.__wfGoingBack=0;});
  // arriving back on the main screen: no view transition of its own (the maps already match), and on a fresh load the surfaces slide in here
  addEventListener('pagereveal',function(e){try{if(e.viewTransition)window.__wfVTdone=e.viewTransition.finished;}catch(x){}});   /* the surfaces slide in once the arrival's dissolve is over */
  (function(){if(!/\/Main\.dc\.html$/.test(location.pathname)||window.top!==window)return;var t0=Date.now();
    /* until they slide in, the main screen shows only its map (no header or blades flashing in place first) */
    if(recentBack()){try{var hs=document.createElement('style');hs.id='wf-backin-css';hs.textContent='html.wf-backin #dc-root{visibility:hidden!important}html.wf-backin [data-wf-maproot]{visibility:visible!important}html.wf-backin [data-wf-maproot] .wf-ctag{display:none!important}';(document.head||document.documentElement).appendChild(hs);document.documentElement.classList.add('wf-backin');setTimeout(function(){document.documentElement.classList.remove('wf-backin');},12000);   /* a safety net only */}catch(x){}}
    var go=function(){if(window.__wfSharedUndo||!recentBack())return;var MR=document.querySelector('[data-wf-maproot]'),MI=MR&&MR.__wfMap;if(!MI){if(Date.now()-t0<4000)setTimeout(go,60);return;}
      var B=null;try{B=JSON.parse(sessionStorage.getItem(BACK)||'null');}catch(x){}try{if(B&&B.v){MI._pv=Object.assign({},MI._pv||{},B.v);MI.setState({cx:B.v.cx,cy:B.v.cy,s:B.v.s});}}catch(x){}
      var VT=window.__wfVTdone;(VT&&VT.then?VT.then(function(){},function(){}):Promise.resolve()).then(function(){setTimeout(function(){document.documentElement.classList.remove('wf-backin');var L=[];try{peel(MR,L);mapPeel(MR,L);}catch(x){}var A=slide(L,'in');   /* shown and moved out in the same frame, then in */
        setTimeout(function(){A.forEach(function(an){try{an.cancel();}catch(x){}});},SLIDE+40);try{sessionStorage.removeItem(BACKT);}catch(x){}},VT?60:350);});};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(go,0);});else setTimeout(go,0);})();
  window.__wfShared=function(a,w,f,dim,navigate,drawn){
    try{if(!/\/Main\.dc\.html$/.test(location.pathname)||window.top!==window)return false;var pop=a.closest('[data-wf-pop]');if(!pop)return false;
      var MR=pop.closest('[data-wf-maproot]')||document.querySelector('[data-wf-maproot]'),MI=MR&&MR.__wfMap;if(!MI||!MI.view)return false;
      var st=MI.state||{},sel=st.selId,L0=[].concat(MI.props.ignitions||[],MI.props.fires||[]),it=L0.filter(function(g){return g&&g.id===sel;})[0];if(!it||!isFinite(it.x)||!isFinite(it.y))return false;
    }catch(x){return false;}
    var PX=Number(it.x),PY=Number(it.y),v0=MI.view(),W=MI.W(),H=MI.H(),done=false,T0=Date.now();
    flyCss();document.documentElement.classList.add('wf-flying');   /* (Oct 16, 19:13) no confidence tags on the markers while the map zooms in */
    try{var R00=topRect(MR);sessionStorage.setItem(BACK,JSON.stringify({t:Date.now(),px:PX,py:PY,v:v0,W:W,H:H,r:{left:R00.left,top:R00.top,width:R00.width}}));}catch(x){}
    w.style.transform='none';w.style.background='transparent';w.style.boxShadow='none';w.style.zIndex='-1';f.style.opacity='1';dim.style.display='none';   /* (Oct 16, 18:55) the incident loads fully drawn behind the main screen (an invisible frame is not drawn on iPhone: it never got ready) */
    var mapR=function(){return topRect(MR);};
    // the main map's view that puts the marker at local point (lx, ly) at scale s
    var viewAt=function(lx,ly,s){return {cx:PX-(lx-W/2)/s,cy:PY-(ly-H/2)/s,s:s};};
    var localOf=function(v){return {x:(PX-v.cx)*v.s+W/2,y:(PY-v.cy)*v.s+H/2};};
    /* (Oct 17, 17:25) ONE flight, never a second one: it heads for a first guess of the incident's framing, and the moment the incident
       screen gives the exact framing the remaining path bends onto it: a correction added on top of the running flight, starting with
       no speed of its own and ending at rest on the exact view (a smootherstep), so the motion never stops, restarts or jumps at the end.
       The marker glides on screen and the zoom moves in log steps, as before. */
    var fl=null,FLY_MS=1100;
    var sst=function(u){u=Math.max(0,Math.min(1,u));return u*u*u*(u*(u*6-15)+10);};
    var fly=function(to,ms){var from=MI.view(),p0=localOf(from),pg=localOf(to),l0=Math.log(from.s),lg=Math.log(to.s),t0=performance.now(),me={t0:t0,ms:ms,cb:null,c:null};fl=me;MI._gest=true;if(MI.stopGlide)try{MI.stopGlide();}catch(x){}
      me.retarget=function(to2,cb){var t=performance.now(),p1=localOf(to2),l1=Math.log(to2.s),left=Math.max(0,me.t0+me.ms-t);me.c={t:t,d:Math.max(left,520),dx:p1.x-pg.x,dy:p1.y-pg.y,dl:l1-lg};me.cb=cb;};
      (function step(t){if(fl!==me)return;var k=Math.min(1,(t-t0)/ms),e=ez(k),x=p0.x+(pg.x-p0.x)*e,y=p0.y+(pg.y-p0.y)*e,l=l0+(lg-l0)*e,C=me.c,w=C?sst((t-C.t)/C.d):0;
        if(C){x+=C.dx*w;y+=C.dy*w;l+=C.dl*w;}var v=viewAt(x,y,Math.exp(l));try{MI.setView(v.cx,v.cy,v.s);}catch(z){}
        if(k<1||(C&&w<1)||!C)requestAnimationFrame(step);if(k>=1&&C&&w>=1){fl=null;try{clearTimeout(MI._rgT);MI.endGest();}catch(z){}if(me.cb)me.cb();}})(t0);
      return me;};
    // 1. the tooltip fades, the main screen's surfaces leave, the map heads for the incident's framing (last time's, or a fair guess)
    try{document.querySelectorAll('[data-wf-pop]').forEach(function(n){n.animate([{opacity:1},{opacity:0}],{duration:200,easing:'ease-out',fill:'forwards'});});}catch(x){}
    var outL=[];try{peel(MR,outL);mapPeel(MR,outL);}catch(x){}var outA=slide(outL,'out');
    var R0=mapR(),kM=R0.width/W||1,est=null;try{est=JSON.parse(sessionStorage.getItem(EST)||'null');}catch(x){}
    var g=est&&est.q>0?est:{x:(window.top.innerWidth||390)/2,y:(window.top.innerHeight||844)*0.35,q:Math.min(24,v0.s*6)*kM};   /* q: screen pixels per world unit */
    var FL=fly(viewAt((g.x-R0.left)/kM,(g.y-R0.top)/kM,g.q/kM),FLY_MS);
    /* back on this screen from the phone's cache: the map is set back where it was, and the surfaces that left come back in (the way out, reversed) */
    try{window.__wfSharedUndo=function(){try{fl=null;MI._gest=false;MI._pv=Object.assign({},MI._pv||{},v0);MI.setState({cx:v0.cx,cy:v0.cy,s:v0.s,selId:'__none',pop:null});
      document.querySelectorAll('[data-wf-pop]').forEach(function(n){n.getAnimations().forEach(function(an){an.cancel();});});
      var rev=recentBack();outA.forEach(function(an){try{if(rev){an.playbackRate=1;an.reverse();an.onfinish=function(){an.cancel();};}else an.cancel();}catch(x){}});
      setTimeout(function(){document.documentElement.classList.remove('wf-flying');},rev?SLIDE+40:0);}catch(x){}};}catch(x){}
    // 2. the incident screen ready: land exactly on its map's framing, then hand over
    var drawn2=function(d){var r=d&&d.readyState!=='loading'&&d.getElementById('dc-root');return !!(r&&r.firstElementChild&&r.textContent.trim().length>20&&!d.getElementById('wf-load')&&!d.documentElement.classList.contains('wf-hold')&&d.defaultView.__wfVP&&Math.abs(r.getBoundingClientRect().width-d.defaultView.innerWidth)<3);};   /* drawn and fitted to its frame, its map tiles may still be arriving (the map underneath has them) */
    var ready=function(){try{var d=f.contentDocument;if(!drawn2(d))return false;var ok=true;[].forEach.call(d.querySelectorAll('iframe'),function(x){try{if(!x.offsetWidth||!x.getAttribute('src')||/^(about|data|javascript):/i.test(x.getAttribute('src')))return;var cd=x.contentDocument;if(!cd||cd.location.href==='about:blank'||!drawn2(cd))ok=false;}catch(y){}});return ok&&!!findMap(d,0);}catch(x){return false;}};
    var land=function(){if(done)return;done=true;var DM=findMap(f.contentDocument,0),DI=DM&&DM.__wfMap;
      if(!DI){finish(null);return;}
      var rD=topRect(DM),kD=rD.width/(DI.W()||1),vD=DI.view(),Q=kD*vD.s,rM=mapR(),kM2=rM.width/W||1,sM=Q/kM2;
      var cx=vD.cx+((rM.left+kM2*W/2)-(rD.left+kD*DI.W()/2))/Q,cy=vD.cy+((rM.top+kM2*H/2)-(rD.top+kD*DI.H()/2))/Q;
      try{var mp=localOf({cx:cx,cy:cy,s:sM});sessionStorage.setItem(EST,JSON.stringify({x:rM.left+mp.x*kM2,y:rM.top+mp.y*kM2,q:Q}));}catch(x){}
      FL.retarget({cx:cx,cy:cy,s:sM},function(){finish(DM);});};   /* the running flight bends onto the exact framing: no second flight */
    // 3. the incident's map takes over; its header slides down, its lower surfaces slide up
    var finish=function(DM){var inL=[];try{if(DM){peel(DM,inL);mapPeel(DM,inL);var e=DM.ownerDocument.defaultView.frameElement;while(e&&e!==f){peel(e,inL);e=e.ownerDocument.defaultView.frameElement;}}}catch(x){}
      var inA=slide(inL,'in');inA.forEach(function(an){try{an.pause();an.currentTime=0;}catch(x){}});
      w.style.zIndex='300';f.style.opacity='1';try{f.getAnimations().forEach(function(an){an.cancel();});}catch(x){}
      var fd=w.animate([{opacity:0},{opacity:1}],{duration:220,easing:'ease-out',fill:'backwards'});
      inA.forEach(function(an){try{an.play();}catch(x){}});
      setTimeout(function(){inA.forEach(function(an){try{an.cancel();}catch(x){}});navigate();},SLIDE+40);};
    var poll=function(){if(done)return;if(ready()&&Date.now()-T0>250){land();return;}if(Date.now()-T0>8000){done=true;finish(findMap(f.contentDocument,0));return;}setTimeout(poll,70);};
    setTimeout(poll,100);
    return true;};
  addEventListener('pageshow',function(e){try{if(window.__wfSharedUndo){window.__wfSharedUndo();window.__wfSharedUndo=null;try{sessionStorage.removeItem(BACKT);}catch(x){}}}catch(x){}});
})();

// (Oct 16, 18:40, temporary) Sign-in check: an error on any screen, or the main screen finding nobody signed in, is noted;
// the login screen then shows that note in a small line at its foot (a tap hides it), so a failed sign-in says why.
(function(){
  try{window.addEventListener('error',function(e){try{if(e&&e.message)localStorage.setItem('wf-lasterr',JSON.stringify({t:Date.now(),m:String(e.message).slice(0,160)+' ('+String(e.filename||'').split('/').pop().split('?')[0]+':'+(e.lineno||0)+')',p:location.pathname.split('/').pop()}));}catch(x){}});
    window.addEventListener('unhandledrejection',function(e){try{var r=e&&e.reason;localStorage.setItem('wf-lasterr',JSON.stringify({t:Date.now(),m:'Promise: '+String(r&&r.message||r).slice(0,160),p:location.pathname.split('/').pop()}));}catch(x){}});}catch(x){}
  if(!/\/Login\.dc\.html$/.test(location.pathname)||window.top!==window)return;
  var show=function(){try{var L=[],now=Date.now();var W=/[?&]why=([^&]+)/.exec(location.search);if(W)L.push(decodeURIComponent(W[1]));var fr='';try{fr=sessionStorage.getItem('wf-freed')||'';}catch(x){}if(fr)L.push('freed '+fr);
    var tot=0;try{for(var q=0;q<localStorage.length;q++){var kq=localStorage.key(q);tot+=kq.length+(localStorage.getItem(kq)||'').length;}}catch(x){}var wr='ok';try{localStorage.setItem('wf-probe','1');localStorage.removeItem('wf-probe');}catch(x){wr='FULL';}if(L.length||wr!=='ok')L.push('storage '+Math.round(tot/1000)+'k chars, write '+wr);['wf-why','wf-lasterr'].forEach(function(k){var v=JSON.parse(localStorage.getItem(k)||'null');if(v&&now-v.t<5*60000)L.push((v.p?v.p.replace('.dc.html','')+': ':'')+v.m);});if(!L.length)return;
    var d=document.createElement('div');d.setAttribute('role','status');d.style.cssText='position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;padding:8px 16px;border-radius:var(--wf-r, 16px);background:rgba(28,28,30,0.85);color:rgb(255, 255, 255);font:13px/18px -apple-system,system-ui,sans-serif;word-break:break-word';
    d.textContent='Last sign-in issue: '+L.join(' | ');d.onclick=function(){d.remove();try{localStorage.removeItem('wf-why');localStorage.removeItem('wf-lasterr');}catch(x){}};document.body.appendChild(d);}catch(x){}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(show,800);});else setTimeout(show,800);
})();
// (Oct 16, 21:25) the incident arrival hint runs once per opening: back on the main screen, the next opening of an incident hints again
(function(){try{if(/\/Main\.dc\.html$/.test(location.pathname)&&window.top===window)sessionStorage.removeItem('wf-hint-done');}catch(e){}})();

// (Oct 17, 15:23; 15:58 every switcher, any option widths) Every switcher (segmented multi-button, .wf-seg): besides a tap, the chosen
// option can be dragged. Pressing it grows its dark grey thumb to its full glide size (4px above and below) and it stays that size
// through the whole drag; the label under it turns white live (as the chosen one). It then
// follows the finger anywhere along the track (a haptic tick at each option it passes) and on release snaps firmly to the nearest
// option (0.18 s, eases in and stays: no bounce, no second grow), and only then shrinks back to rest, choosing it with that option's own tap, so every switcher keeps its own behaviour. The thumb is
// moved with the CSS translate property, on top of the transform the screen sets, so a re-render never fights the finger.
(function(){
  var css=document.createElement('style');css.textContent='.wf-seg>.segthumb>.segblob{transition:inset .18s ease-out}.wf-seggrab>.segthumb>.segblob{inset:-4px 0!important}.wf-seg>.segthumb{translate:0 0}.wf-segdrag>.segthumb,.wf-segland>.segthumb{transition:none!important}html .wf-seg.wf-seglive .segopt{transition:color .12s ease}html .wf-seg.wf-seglive .segopt:not(.wf-seghot){color:rgb(28, 28, 30)!important;-webkit-text-fill-color:rgb(28, 28, 30)!important;font-weight:400}html.wf-dark .wf-seg.wf-seglive .segopt:not(.wf-seghot){color:rgb(242, 242, 247)!important;-webkit-text-fill-color:rgb(242, 242, 247)!important}html .wf-seg.wf-seglive .segopt.wf-seghot{color:var(--wf-pri-fg, #FFFFFF)!important;-webkit-text-fill-color:var(--wf-pri-fg, #FFFFFF)!important;font-weight:600}';(document.head||document.documentElement).appendChild(css);
  var D=null,mute=0;
  var opts=function(el){return [].slice.call(el.querySelectorAll('.segopt')).filter(function(o){return o.offsetWidth>0;});};
  var hot=function(d,n){d.O.forEach(function(o,i){o.classList.toggle('wf-seghot',i===n);});};
  var near=function(d,cx){var b=0,bd=1e9;d.C.forEach(function(c,i){var q=Math.abs(c-cx);if(q<bd){bd=q;b=i;}});return b;};
  document.addEventListener('pointerdown',function(e){try{if(D||(e.button&&e.button!==0))return;var el=e.target&&e.target.closest&&e.target.closest('.wf-seg');if(!el)return;var th=el.querySelector(':scope>.segthumb');if(!th)return;var O=opts(el);if(O.length<2)return;
    var tr=th.getBoundingClientRect();if(e.clientX<tr.left-4||e.clientX>tr.right+4||e.clientY<tr.top-8||e.clientY>tr.bottom+8)return;
    var C=O.map(function(o){var r=o.getBoundingClientRect();return r.left+r.width/2;}),c0=tr.left+tr.width/2;
    D={el:el,th:th,O:O,C:C,c0:c0,l0:tr.left,cur:0,x0:e.clientX,t:0,last:0,mv:false,id:e.pointerId};D.cur=D.last=near(D,c0);
    el.classList.add('wf-seggrab');try{if(navigator.vibrate)navigator.vibrate(6);}catch(x){}try{el.setPointerCapture(e.pointerId);}catch(x){}}catch(x){D=null;}},true);
  /* the press on the thumb owns the gesture: the page never scrolls under it (iOS would otherwise take the touch and cancel the drag) */
  document.addEventListener('touchmove',function(e){if(D)e.preventDefault();},{capture:true,passive:false});
  document.addEventListener('pointermove',function(e){if(!D||e.pointerId!==D.id)return;var dx=e.clientX-D.x0;if(!D.mv){if(Math.abs(dx)<4)return;D.mv=true;D.el.classList.remove('wf-segsnap');D.el.classList.add('wf-segdrag','wf-seglive');hot(D,D.cur);}
    e.preventDefault();e.stopPropagation();var lo=D.C[0]-D.c0,hi=D.C[D.C.length-1]-D.c0;D.t=Math.max(lo,Math.min(hi,dx));D.th.style.translate=D.t.toFixed(1)+'px 0';var n=near(D,D.c0+D.t);if(n!==D.last){D.last=n;hot(D,n);try{if(navigator.vibrate)navigator.vibrate(6);}catch(x){}}},{capture:true,passive:false});
  /* the thumb is held by a style sheet (transform off, its own translate), so the screen's re-render after the choice can never move it */
  var HS=document.createElement('style');(document.head||document.documentElement).appendChild(HS);
  var holdAt=function(x,glide){HS.textContent='.wf-seghold>.segthumb{transform:none!important;translate:'+x.toFixed(1)+'px 0!important;transition:'+(glide?'translate .18s cubic-bezier(.2,0,0,1)':'none')+'!important}';};
  var end=function(e){if(!D||(e&&e.pointerId!==D.id))return;var d=D;D=null;if(!d.mv){d.el.classList.remove('wf-seggrab');return;}if(e){e.stopPropagation();}mute=Date.now();
    var n=near(d,d.c0+d.t),el=d.el,th=d.th,want=d.l0+d.t,t0=performance.now();
    try{if(navigator.vibrate)navigator.vibrate(14);}catch(x){}
    /* freeze the thumb exactly where the finger left it */
    holdAt(0,false);th.style.translate='';el.classList.add('wf-seghold');var x0=want-th.getBoundingClientRect().left;holdAt(x0,false);el.classList.remove('wf-segdrag');
    var tf0=th.style.transform+'|'+th.style.width;
    /* glide once to where the screen put it, then hand the thumb back and shrink it to rest */
    var snap=function(){var cur=th.getBoundingClientRect().left;el.classList.add('wf-segland');el.classList.remove('wf-seghold');var fl=th.getBoundingClientRect().left;el.classList.add('wf-seghold');void th.offsetWidth;el.classList.remove('wf-segland');
      holdAt(x0+(fl-cur),true);setTimeout(function(){el.classList.add('wf-segland');el.classList.remove('wf-seghold','wf-seggrab','wf-seglive');void th.offsetWidth;requestAnimationFrame(function(){el.classList.remove('wf-segland');});HS.textContent='';d.O.forEach(function(o){o.classList.remove('wf-seghot');});th.__wfSegQuiet=false;},200);};
    if(n===d.cur){requestAnimationFrame(snap);return;}
    th.__wfSegQuiet=true;mute=0;try{d.O[n].click();}catch(x){}mute=Date.now();
    (function wait(){var tf=th.style.transform+'|'+th.style.width;if(tf!==tf0||performance.now()-t0>400){requestAnimationFrame(snap);return;}requestAnimationFrame(wait);})();};
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',function(e){if(D&&e.pointerId===D.id){var d=D;D=null;d.el.classList.remove('wf-seggrab','wf-segdrag','wf-seglive');d.th.style.translate='';d.O.forEach(function(o){o.classList.remove('wf-seghot');});}},true);
  /* the browser's own click after a drag is not a choice: only the drag's snap chooses */
  document.addEventListener('click',function(e){if(mute&&Date.now()-mute<350&&e.target&&e.target.closest&&e.target.closest('.wf-seg')){e.stopPropagation();e.preventDefault();}},true);
})();
