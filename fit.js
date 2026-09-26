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
