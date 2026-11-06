// ---------- crowd: seated and on-their-feet versions, dressed for the matchup ----------
function drawFan(g,f,L,up){
 const x=f.x,y=f.y-(up?2:0),kid=L.kid,sw=kid?4:6,sh=kid?3:4,sx=x-(sw>>1);
 g.fillStyle=L.shirt;g.fillRect(sx,y-1,sw,sh);
 if(L.stripe){g.fillStyle=L.stripe;g.fillRect(sx,y,sw,1)}
 if(L.num){g.fillStyle='#f4f1e8';g.fillRect(x-1,y,1,2);g.fillRect(x+1,y,1,2)}
 g.fillStyle='rgba(0,0,0,.22)';g.fillRect(sx,y+sh-2,sw,1);
 const hy=y-(kid?3:4);
 g.fillStyle=L.skin;g.fillRect(x-1,hy,3,3);
 if(L.bag){g.fillStyle='#ff8a1f';g.fillRect(x-2,hy-2,5,3);g.fillStyle='#ffb05a';g.fillRect(x-1,hy-2,2,1)}
 else if(L.cap){g.fillStyle=L.cap;g.fillRect(x-1,hy,3,1);g.fillRect(x-2,hy+1,1,1)}
 else{g.fillStyle=L.hair;g.fillRect(x-1,hy,3,1);if(L.long){g.fillRect(x-2,hy,1,3);g.fillRect(x+2,hy,1,3)}}
 if(L.shades){g.fillStyle='#111';g.fillRect(x-1,hy+1,3,1)}
 if(up){g.fillStyle=L.skin;g.fillRect(sx-1,y-5,1,3);g.fillRect(sx+sw,y-5,1,3)}
 if(L.item==='cup'){const cy=up?y-6:y;g.fillStyle='#ececec';g.fillRect(sx+sw,cy,1,2);g.fillStyle='#c7262e';g.fillRect(sx+sw,cy,1,1)}
 else if(L.item==='popcorn'){g.fillStyle='#c7262e';g.fillRect(sx-2,y,2,2);g.fillStyle='#fff1b8';g.fillRect(sx-2,y-1,2,1)}
 else if(L.item==='sticks'){const sy=up?y-11:y-6;g.fillStyle=L.fcol;g.fillRect(sx-1,sy,1,6);g.fillRect(sx+sw,sy,1,6);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(sx-1,sy,1,1);g.fillRect(sx+sw,sy,1,1)}
 else if(L.item==='finger'){const fy=up?y-9:y-4;g.fillStyle=L.fcol;g.fillRect(sx+sw,fy,2,4);g.fillRect(sx+sw+1,fy-2,1,2)}
 if(L.sign){g.fillStyle=CREAM;g.fillRect(x-4,y-(up?10:8),8,4);g.fillStyle=L.shirt;g.fillRect(x-3,y-(up?9:7),6,2)}
}
function buildCrowd(){
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
 const A=mk(),B=mk();const ga=A.getContext('2d'),gb=B.getContext('2d');
 const home=TEAMS[S.you],away=TEAMS[S.opp];
 const rnd=mulberry32(hash(S.you+S.opp));
 const misc=['#e8d7c3','#f1ecdc','#6c7a86','#a8c6d8','#2b2b30','#c9a0dc','#7fbf6a','#d98c8c','#f4d58d'];
 const looks=FANS.map(f=>{
  const awaySide=f.ang<-50&&f.ang>-135;const r=rnd();
  const pHome=awaySide?.28:.6,pAway=awaySide?.45:.1;
  let shirt,cap=null;
  if(r<pHome){shirt=home.jersey;if(rnd()<.5)cap=home.cap}
  else if(r<pHome+pAway){shirt=away.jersey;if(rnd()<.5)cap=away.cap}
  else shirt=misc[(rnd()*misc.length)|0];
  const team=shirt===home.jersey||shirt===away.jersey;
  const it=rnd();
  return{shirt,cap,skin:SKINS[(rnd()*SKINS.length)|0],sign:rnd()<.014,kid:rnd()<.1,long:rnd()<.3,shades:rnd()<.08,
   hair:['#2a1d14','#4a3020','#7a5230','#c9a060','#1a1a1a','#8a8a8a'][(rnd()*6)|0],
   stripe:!team&&rnd()<.15?(rnd()<.5?'#f4f1e8':'#2b2b30'):null,num:team&&rnd()<.5,
   item:it<.12?'cup':it<.17?'popcorn':it<.2?'finger':it<.32?'sticks':null,bag:!!ST.bags&&rnd()<.35,blanket:['#e0473d','#3f82e6','#f5c935','#f4f1e8'][(rnd()*4)|0],fcol:shirt===away.jersey?away.jersey:home.jersey};
 });
 for(const g of[ga,gb])FANS.forEach((f,k)=>{if(f.lawn){g.fillStyle=looks[k].blanket;g.fillRect(f.x-6,f.y-5,12,10);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(f.x-6,f.y-2,12,1)}});
 const swim=(g,f,L,up)=>{g.fillStyle=L.blanket;g.fillRect(f.x-3,f.y-2,7,5);g.fillStyle='#45b8e0';g.fillRect(f.x-1,f.y-1,3,3);g.fillStyle=L.skin;g.fillRect(f.x-1,f.y-2-(up?1:0),3,3);if(up){g.fillRect(f.x-3,f.y-5,1,3);g.fillRect(f.x+3,f.y-5,1,3)}};
 FANS.forEach((f,k)=>{if(f.pool)swim(ga,f,looks[k],false);else drawFan(ga,f,looks[k],!!f.deck);if(!f.lawn){gb.fillStyle=f.bg;gb.fillRect(f.x-4,f.y-4,8,8)}});
 FANS.forEach((f,k)=>{if(f.pool)swim(gb,f,looks[k],true);else drawFan(gb,f,looks[k],true)});
 CROWD_A=A;CROWD_B=B;
 FLAGFANS=[];
 for(let k=0;k<70&&FANS.length;k++){const f=FANS[(rnd()*FANS.length)|0];const awaySide=f.ang<-50&&f.ang>-135;
  const T=(awaySide?rnd()<.6:rnd()<.15)?away:home;FLAGFANS.push({x:f.x,y:f.y,a:T.jersey,b:T.cap,ph:rnd()*6})}
}
function drawBanners(g){
 const home=TEAMS[S.you],away=TEAMS[S.opp];
 const sl=(CLUB_INFO[S.you]&&CLUB_INFO[S.you].slogans)||[];
 const list=[[50,sl[0]||`${home.kname} 화이팅!`,home,1],[24,`LET'S GO ${home.name}!`,home],[-50,`${away.kname} 원정 응원단`,away,1],[-24,`${away.city} TRAVELS`,away],[9,sl[1]||`최강 ${home.kname}`,home,1],[-9,`${home.mascot.toUpperCase()} FAN CLUB`,home]];// (the two over the bullpens are gone: they covered the pens)
 for(const[ang,txt0,T,kr]of list){
  const txt=txt0;
  let best=null,bd=99;for(const c of RAIL){const d=Math.abs(c.ang-ang);if(d<bd){bd=d;best=c}}
  if(!best||bd>2)continue;
  const dx=best.x-HX,dy=best.y-HY,l=Math.hypot(dx,dy);const px=(best.x+dx/l*16)/K,py=(best.y+dy/l*16)/K;
  const rot=Math.abs(ang)>45?(ang>0?-45:45):ang;
  g.save();g.translate(px,py);g.rotate(rot*RAD);
  g.font=kr?'12px Jua, sans-serif':'bold 10px "Pixelify Sans", monospace';const w=Math.min(150,g.measureText(txt).width+14);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-w/2+2,-5,w,16);
  g.fillStyle='#f4f1e8';g.fillRect(-w/2,-7,w,15);
  g.fillStyle='#e6e0d0';for(let xx=-w/2;xx<w/2;xx+=6)g.fillRect(xx,7,3,2);
  g.fillStyle=T?T.cap:'#c7262e';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,.5,w-8);
  g.fillStyle='#1b1f24';g.fillRect(-w/2,-8,1,2);g.fillRect(w/2-1,-8,1,2);
  g.restore();
 }
}
