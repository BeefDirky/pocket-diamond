// ---------- decor (team-specific, rebuilt on team change) ----------
function buildDecor(){
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.scale(K,K);
 const home=TEAMS[S.you],away=TEAMS[S.opp];
 // painted logos in foul ground
 [1,-1].forEach(sd=>{const p=toPx3(sd*97.6,72.1);g.save();g.translate(p.x,p.y);g.rotate(-sd*45*RAD);g.textAlign='center';g.textBaseline='middle';
  const txt=sd>0?`${home.city} ${home.name}`:`${home.kcity} ${home.kname}`;g.font=sd>0?'16px "Press Start 2P", monospace':'26px Jua, sans-serif';
  g.fillStyle='rgba(0,0,0,.18)';g.fillText(txt,1.5,1.5,190);g.fillStyle='rgba(255,255,255,.6)';g.fillText(txt,0,0,190);g.restore()});
 // dugouts: sunken benches cut into the stands, roofed at the back
 [[home,1],[away,-1]].forEach(([T,sd])=>{
  const c=dugoutFrame(sd);
  g.save();g.translate(c.x,c.y);g.rotate(-sd*45*RAD);
  g.fillStyle='#101418';g.fillRect(-79,-18,158,36);
  g.fillStyle='#4a525b';g.fillRect(-75,-15,150,30);
  g.fillStyle='#424950';for(let k=-75;k<75;k+=10)g.fillRect(k,-15,1,30);
  g.fillStyle='#7a5a3a';g.fillRect(-70,1,140,5);g.fillStyle='#5f462d';g.fillRect(-70,5,140,1);
  g.fillStyle='#2a3036';g.fillRect(-79,-18,5,26);g.fillRect(74,-18,5,26);
  g.fillStyle='#596169';for(let k=-14;k<6;k+=4){g.fillRect(-79,k,5,1);g.fillRect(74,k,5,1)}
  g.fillStyle='#a8b0b8';g.fillRect(-75,-15,150,2);for(let k=-72;k<=72;k+=12)g.fillRect(k,-15,2,4);
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-79,6,158,3);
  g.fillStyle=T.cap;g.fillRect(-79,8,158,10);g.fillStyle=T.jersey;g.fillRect(-79,8,158,2);
  g.fillStyle=CREAM;g.font='10px Jua, "Pixelify Sans", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(`${T.kcity} ${T.kname} · ${T.city} ${T.name}`,0,13.5,148);
  g.restore();
 });
 {const c=cheerFrame();g.save();g.translate(c.x,c.y);g.rotate(-45*RAD);
  g.fillStyle='#101418';g.fillRect(-44,-16,88,32);g.fillStyle=home.cap;g.fillRect(-41,-13,82,26);g.fillStyle=home.jersey;g.fillRect(-41,-13,82,3);g.fillRect(-41,10,82,3);
  g.fillStyle='#596169';for(let k=-36;k<40;k+=8)g.fillRect(k,13,5,3);g.restore()}
 drawBanners(g);
 buildCrowd();
 return c;
}

