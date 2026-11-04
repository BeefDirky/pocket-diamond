// ---------- sprites ----------
function drawGuy(g,x,y,T,o){
 o=o||{};const px=Math.round(x)-3,py=Math.round(y)-11;
 g.fillStyle='rgba(6,18,10,.32)';g.fillRect(px,Math.round(y)+1,7,1);g.fillRect(px+1,Math.round(y)+2,5,1);
 const map=o.map||(o.run?(o.frame?RUNB:RUNA):BODY);
 const yOff=map.length===9?3:0;
 blit(g,map,{c:T.cap,b:T.brim,s:o.skin||SKINS[1],j:T.jersey,p:o.pants||'#eeeae0',k:'#1a1a1a',m:'#2b2b2e',g:'#3a3a40'},px,py+yOff);
}
function drawMascot(g,key,x,y,lift){
 const M=MASCOTS[key];const w=M.m[0].length,h=M.m.length;
 const px=Math.round(x)-Math.floor(w/2),py=Math.round(y)-h+1-Math.round(lift);
 g.fillStyle='rgba(6,18,10,.32)';g.fillRect(Math.round(x)-4,Math.round(y)+1,9,2);
 blit(g,M.m,M.c,px,py);
}
function drawBall(g,x,y,h,spin,big){
 const sx=Math.round(x),sy=Math.round(y);
 const lift=h/FT,oy=Math.round(lift*.5),ox=Math.round(-lift*.2);
 if(h>1){const sw=Math.min(8,3+Math.floor(h/20));g.fillStyle=`rgba(6,18,10,${h>40?.28:.4})`;g.fillRect(sx-(sw>>1),sy,sw,2)}
 const sz=Math.min(9,3+Math.floor(h/11)+(big||0));const bx=sx+ox-(sz>>1),by=sy-oy-(sz>>1);
 if(sz>=5){g.fillStyle='rgba(20,24,28,.5)';g.fillRect(bx-1,by+1,sz+2,sz-2);g.fillRect(bx+1,by-1,sz-2,sz+2)}
 g.fillStyle='#ffffff';g.fillRect(bx,by+1,sz,sz-2);g.fillRect(bx+1,by,sz-2,sz);
 if(sz>=5){g.fillStyle='#d4402f';g.fillRect(bx+1,by+2,1,sz-4);g.fillRect(bx+sz-2,by+2,1,sz-4)}
 if(spin!=null){g.fillStyle='#d4402f';const o=[[0,-1],[1,0],[0,1],[-1,0]][spin%4];g.fillRect(sx+ox+o[0],sy-oy+o[1],1,1)}
}
function drawBat(g,bx,by,ang,hand,col){
 col=col||'#d9b07a';
 const hx=bx+(hand==='R'?1:-1),hy=by-6;
 for(let k=1;k<=10;k++){const x=Math.round(hx+Math.cos(ang)*k),y=Math.round(hy+Math.sin(ang)*k*.8);g.fillStyle=k<3?'#6b4426':'#d9b07a';g.fillRect(x,y,1,1);if(k>5)g.fillRect(x,y+1,1,1)}
}

