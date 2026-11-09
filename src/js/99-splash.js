// ---------- the Imugi Labs splash: it paints before anything else loads, fades in, and fades out once the game has drawn
// its first frame (held at least long enough for the fade-in to finish so it never just flickers) ----------
{const sp=document.getElementById('splash');if(sp){const t0=performance.now();let done=false;
 const go=()=>{if(done)return;done=true;sp.classList.add('gone');setTimeout(()=>sp.remove(),700)};
 requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(go,Math.max(0,1100-(performance.now()-t0)))));setTimeout(go,8000)}}
