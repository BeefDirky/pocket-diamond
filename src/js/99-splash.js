// ---------- the Imugi Labs splash: it paints before anything else loads, and fades out once the game has drawn its first frame ----------
{const sp=document.getElementById('splash');if(sp){const go=()=>{sp.classList.add('gone');setTimeout(()=>sp.remove(),600)};
 requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,8000)/* never stuck behind it */}}
