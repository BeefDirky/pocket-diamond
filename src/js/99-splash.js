// ---------- the Imugi Labs splash: it paints before anything else loads and the logo fades in. The name fades in only once
// the game code has finished starting up (phones are too busy to animate before that) and its typeface has arrived, gets a
// moment on screen, then the whole splash fades away ----------
{const sp=document.getElementById('splash');if(sp){let done=false,namedAt=null;
 const go=()=>{if(done)return;done=true;sp.classList.add('gone');setTimeout(()=>sp.remove(),700)};
 const tick=()=>{if(done)return;
  if(namedAt==null){if(window.__spReady!=null){sp.classList.add('named');namedAt=performance.now()}}
  else if(performance.now()-namedAt>1500)return go();
  setTimeout(tick,60)};
 requestAnimationFrame(()=>requestAnimationFrame(tick));setTimeout(go,9000)}}
