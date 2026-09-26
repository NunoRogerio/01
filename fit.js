// Scale the 390×844 phone screen to fit whatever phone opens it.
(function(){
  var W=390,H=844,st=document.createElement('style');
  st.textContent='html,body{background:#F2F2F7;overflow:hidden;height:100%;margin:0;overscroll-behavior:none}'+
    '#dc-root{zoom:var(--fit,1);width:'+W+'px;height:'+H+'px;margin:0 auto;overflow:hidden}';
  document.head.appendChild(st);
  function fit(){
    var s=Math.min(window.innerWidth/W,window.innerHeight/H);
    document.documentElement.style.setProperty('--fit',String(s));
  }
  fit();window.addEventListener('resize',fit);window.addEventListener('orientationchange',fit);
})();
