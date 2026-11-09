// ---------- Ulsan: whale bay, shipyard and the harbor traffic ----------
function spout(g,q,ph,big){const a=ph;for(let k=0;k<(big?20:14);k++){const s=(k*37%11)/11,h=a*(big?44:34)*(.5+s*.6),dx=(k%2?1:-1)*s*a*(big?18:14);g.globalAlpha=Math.max(0,1-a)*.9;g.fillStyle=k%3?'#e8f6ff':'#9fd8f6';g.fillRect(Math.round(q.x+dx),Math.round(q.y-h),3,3)}g.globalAlpha=1}
function drawUlsan(g,now){
 const sec=now/1000;
 // resident whale breathes every few seconds
 const hb=!!ST.harbor;
 if(false){// (the harbor park has no whale in its sea) so the resident whale is drawn here rather than painted into the bay
  const w=toPx(WHALE.x,WHALE.y),L=30/FT,Wd=9/FT,bob=Math.sin(sec*.6)*1.5;g.fillStyle='rgba(10,30,50,.35)';g.beginPath();g.ellipse(w.x+4,w.y+5,L,Wd,0,0,7);g.fill();
  g.fillStyle='#3b4f62';g.beginPath();g.ellipse(w.x,w.y+bob,L,Wd,0,0,7);g.fill();g.fillStyle='#4c6378';g.beginPath();g.ellipse(w.x-L*.15,w.y-Wd*.35+bob,L*.75,Wd*.45,0,0,7);g.fill();
  g.fillStyle='#3b4f62';g.beginPath();g.moveTo(w.x+L*.92,w.y+bob);g.lineTo(w.x+L*1.35,w.y-Wd*1.1+bob);g.lineTo(w.x+L*1.2,w.y+bob);g.lineTo(w.x+L*1.35,w.y+Wd*1.1+bob);g.closePath();g.fill();
  g.fillStyle='rgba(232,246,255,.5)';for(let k=0;k<8;k++){const a=k/8*6.28+sec;g.fillRect(Math.round(w.x+Math.cos(a)*(L+6)),Math.round(w.y+Math.sin(a)*(Wd+5)),3,1)}}
 if(!hb){const ph=sec%5.5;if(ph<1.4)spout(g,toPx(WHALE.x-22,WHALE.y+3),ph/1.4)}
 // the harbor park's shipyard: a long dry dock with a ship taking shape, under a yellow goliath crane
 if(hb){const d=toPx(-600,690),x0=Math.round(d.x),y0=Math.round(d.y),DW=300,DH=140;
  g.fillStyle='#6b747d';g.fillRect(x0-8,y0-8,DW+16,DH+16);g.fillStyle='#4a545e';g.fillRect(x0-3,y0-3,DW+6,DH+6);g.fillStyle='#235f86';g.fillRect(x0,y0,DW,DH);
  g.fillStyle='#2d6f98';for(let k=6;k<DH;k+=12)g.fillRect(x0,y0+k,DW,2);
  // the hull: dark topsides, red underbody showing at the bow, a grey deck with hatches, white bridge at the stern
  const hx=x0+22,hy=y0+30,HW=240,HH=80;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(hx+5,hy+6,HW,HH);
  g.fillStyle='#8f2a24';g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+HW-40,hy);g.quadraticCurveTo(hx+HW+8,hy+HH/2,hx+HW-40,hy+HH);g.lineTo(hx,hy+HH);g.closePath();g.fill();
  g.fillStyle='#1d2a36';g.beginPath();g.moveTo(hx+3,hy+4);g.lineTo(hx+HW-42,hy+4);g.quadraticCurveTo(hx+HW,hy+HH/2,hx+HW-42,hy+HH-4);g.lineTo(hx+3,hy+HH-4);g.closePath();g.fill();
  g.fillStyle='#8a949c';g.fillRect(hx+8,hy+10,HW-70,HH-20);g.fillStyle='#6f7a83';for(let k=0;k<8;k++)g.fillRect(hx+46+k*20,hy+16,15,HH-32);
  g.fillStyle='#e8e4dc';g.fillRect(hx+8,hy+12,30,HH-24);g.fillStyle='#2a3a5a';g.fillRect(hx+12,hy+18,22,4);g.fillStyle='#c94a3a';g.fillRect(hx+40,hy+HH/2-5,8,10);
  // the crane's rails along both sides of the dock
  g.fillStyle='#2b2f36';g.fillRect(x0-6,y0-6,DW+12,3);g.fillRect(x0-6,y0+DH+3,DW+12,3);
  const cx=Math.round(x0+40+((Math.sin(sec*.05)+1)/2)*(DW-90)),GW=24,top=y0-18,bot=y0+DH+18;
  g.fillStyle='rgba(6,18,30,.3)';g.fillRect(cx+34,top+22,GW,bot-top);// its shadow on the dock
  g.fillStyle='#c99a00';g.fillRect(cx-4,top-4,GW+8,8);g.fillRect(cx-4,bot-4,GW+8,8);// legs and bogies
  g.fillStyle='#f5c518';g.fillRect(cx,top,GW,bot-top);g.fillStyle='#c99a00';g.fillRect(cx+GW-4,top,4,bot-top);
  g.fillStyle='#d9ab08';for(let y=top+6;y<bot-6;y+=10){g.fillRect(cx+4,y,GW-10,1);g.fillRect(cx+4,y,1,10);g.fillRect(cx+GW-7,y,1,10)}
  g.fillStyle='#14325a';g.fillRect(cx+2,top+16,GW-6,10);g.fillStyle='#f4f1e8';g.fillRect(cx+5,top+19,GW-12,4);// the yard's name board
  const ty=Math.round(y0+20+((Math.sin(sec*.23)+1)/2)*(DH-40));g.fillStyle='#e0473d';g.fillRect(cx-3,ty,GW+6,12);g.fillStyle='#1b1f24';g.fillRect(cx+GW/2-1,ty+12,2,8);g.fillStyle='#ffbf3c';g.fillRect(cx+GW/2-4,ty+20,8,5)}
 else{// (the old park's shipyard on the right: dry dock, a hull being built, and a gantry crane sliding along its rails)
 {const d=toPx(-226,412);const x0=Math.round(d.x),y0=Math.round(d.y);
  g.fillStyle='#5d6873';g.fillRect(x0-6,y0-40,150,84);g.fillStyle='#4a545e';g.fillRect(x0-2,y0-36,142,76);
  g.fillStyle='#2a6e9a';g.fillRect(x0+2,y0-32,134,68);
  // hull under construction (top-down): red bottom paint, grey deck, blocks being set
  g.fillStyle='#8f2a24';g.beginPath();g.moveTo(x0+12,y0-16);g.lineTo(x0+104,y0-16);g.quadraticCurveTo(x0+128,y0+2,x0+104,y0+20);g.lineTo(x0+12,y0+20);g.closePath();g.fill();
  g.fillStyle='#9aa5ae';g.fillRect(x0+16,y0-12,86,28);g.fillStyle='#7f8b95';for(let k=0;k<7;k++)g.fillRect(x0+20+k*12,y0-9,9,22);
  g.fillStyle='#e8e2d2';g.fillRect(x0+18,y0-8,16,20);g.fillStyle='#2b2f36';g.fillRect(x0+22,y0-4,8,3);
  // crane rails
  g.fillStyle='#2b2f36';g.fillRect(x0-4,y0-38,146,3);g.fillRect(x0-4,y0+37,146,3);
  const cx=Math.round(x0+20+((Math.sin(sec*.09)+1)/2)*96);
  g.fillStyle='rgba(6,18,10,.32)';g.fillRect(cx+6,y0-34,14,80);
  g.fillStyle='#d23a2e';g.fillRect(cx,y0-42,14,86);g.fillStyle='#f4f1e8';for(let k=0;k<86;k+=12)g.fillRect(cx,y0-42+k,14,5);
  g.fillStyle='#1b1f24';g.fillRect(cx-3,y0-44,20,5);g.fillRect(cx-3,y0+38,20,5);
  const ty=Math.round(y0-6+Math.sin(sec*.37)*18);g.fillStyle='#ffbf3c';g.fillRect(cx+2,ty,10,8);g.fillStyle='#1b1f24';g.fillRect(cx+6,ty+8,2,6)}
 }
 // a container ship crosses the bay
 {const u=((sec/150)%1),x=hb?-300+u*630:-250+u*500,q=toPx(x,hb?610:441);const qx=Math.round(q.x),qy=Math.round(q.y);
  g.fillStyle='rgba(255,255,255,.35)';for(let k=1;k<6;k++)g.fillRect(qx-30-k*7,qy-2+(k&1),5,1);
  g.fillStyle='#1d2a36';g.beginPath();g.moveTo(qx-30,qy-7);g.lineTo(qx+22,qy-7);g.lineTo(qx+32,qy);g.lineTo(qx+22,qy+7);g.lineTo(qx-30,qy+7);g.closePath();g.fill();
  const cc=['#d23a2e','#3f82e6','#f5c935','#3faa5b','#ef6a1f','#9aa5ae'];for(let k=0;k<6;k++)for(let j=0;j<2;j++){g.fillStyle=cc[(k*3+j*5)%6];g.fillRect(qx-20+k*6,qy-5+j*5,5,4)}
  g.fillStyle='#f4f1e8';g.fillRect(qx-28,qy-5,6,10);g.fillStyle='#1b1f24';g.fillRect(qx-27,qy-2,4,2)}
 // a second whale breaches every so often in the left-center bay
 if(!hb){const cyc=13,ph=sec%cyc;if(ph<2.6){const k=Math.floor(sec/cyc),th=-16+((k*53)%26),r=fenceDist(th)+30,wp=hb?toPx(-150+((k*53)%300),640+((k*31)%110)):toPx(Math.sin(th*RAD)*r,Math.cos(th*RAD)*r);
   const a=ph/2.6,up=Math.sin(Math.min(1,a*1.6)*Math.PI);
   if(a<.62){const L=8+up*22,Wd=4+up*7;g.fillStyle='#3b4f62';g.beginPath();g.ellipse(wp.x,wp.y-up*6,L,Wd,-.5,0,Math.PI*2);g.fill();g.fillStyle='#c9d6df';g.beginPath();g.ellipse(wp.x+2,wp.y-up*6+1,L*.6,Wd*.45,-.5,0,Math.PI*2);g.fill()}
   if(a>.5){const s=(a-.5)/.5;g.strokeStyle=`rgba(232,246,255,${(1-s)*.9})`;g.lineWidth=3;g.beginPath();g.ellipse(wp.x,wp.y,10+s*34,5+s*16,0,0,Math.PI*2);g.stroke();
    for(let j=0;j<12;j++){const an=j/12*Math.PI*2;g.fillStyle=`rgba(232,246,255,${1-s})`;g.fillRect(Math.round(wp.x+Math.cos(an)*(14+s*26)),Math.round(wp.y+Math.sin(an)*(7+s*12)-Math.sin(s*Math.PI)*10),3,3)}}
   if(a>.2&&a<.6)spout(g,{x:wp.x-12,y:wp.y-10},(a-.2)/.4,true)}}
}
let WHALE={x:-120,y:400},PARK_C=null,PARK_MOW=null;
function buildField(){H_NIGHT=false;
 {const th=12,r=fenceDist(th)+30;WHALE=ST.harbor?{x:-60,y:660}:{x:Math.sin(th*RAD)*r,y:Math.cos(th*RAD)*r}}
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d');const img=g.createImageData(W,H),d=img.data;
 const rng=mulberry32(11);
 const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 const C={g1:hex(ST.grass[0]),g2:hex(ST.grass[1]),g3:hex(ST.grass[2]),d1:hex('#c48c56'),d2:hex('#b8804a'),d3:hex('#cc9763'),tr:hex('#a26a3c'),tr2:hex('#956135'),
  conc:hex('#3a4650'),seat:hex('#2d4f6e'),seat2:hex('#28465f'),aisle:hex('#4a5560'),pad:hex(ST.pad),pad2:hex(ST.pad2),sea:hex('#1d5f8f'),sea2:hex('#174f78'),wave:hex('#7fbfe3'),wh1:hex('#4c6378'),dugA:hex('#6b737b'),dugB:hex('#646c74'),dugE:hex('#3c434a'),wh2:hex('#3b4f62'),whB:hex('#c9d6df'),orG:hex('#6b7f3a'),orG2:hex('#62763a'),orT:hex('#2f7a3a'),orT2:hex('#3c8f44'),orF:hex('#ff9a1f'),bas:hex('#38383d'),bas2:hex('#2a2a2e'),lawn1:hex('#5aa94c'),lawn2:hex('#52a145'),deck:hex('#9a7350'),deck2:hex('#86623f'),table:hex('#e8e1cf'),pool:hex('#45b8e0'),poolHi:hex('#9be0f5'),tile:hex('#e8e4da'),tile2:hex('#d6d1c4'),st1:hex('#8a8f94'),st2:hex('#7a7f85'),mortar:hex('#5a5e62'),tr1:hex('#2f6b2f'),tr2:hex('#245a27'),tr3:hex('#1c4a20'),trHi:hex('#3f8040'),hy1:hex('#e0b52a'),hy2:hex('#c9a227'),hyE:hex('#2b2b30'),chalk:hex('#f3eee0'),pole:hex('#ffd23f')};
 const shirts=['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f38d2e','#f1ecdc','#6c7a86','#a8c6d8','#2b2b30','#7fbf6a','#c9a0dc'].map(hex);
 const skins=SKINS.map(hex);
 const inside=new Uint8Array(W*H),fairBig=new Uint8Array(W*H);
 const put=(px,py,col)=>{if(px<0||py<0||px>=W||py>=H)return;const i=(py*W+px)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255};
 // pass 1: in-park mask
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){
  const x=(px+.5-HX)*FT,y=(HY-(py+.5))*FT;const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
  const fair=Math.abs(th)<=45&&y>=0;
  const perp=(Math.abs(x)-y)/Math.SQRT2,along=(Math.abs(x)+y)/Math.SQRT2;
  const inP=fair?r<fenceDist(th):((perp<40&&along<328&&along>-5)||r<34);
  inside[py*W+px]=inP?1:0;fairBig[py*W+px]=fair&&r>200?1:0;
 }
 const chamfer=zeroIf=>{const A=new Int32Array(W*H);for(let i=0;i<W*H;i++)A[i]=zeroIf(i)?0:1e8;
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const i=py*W+px;if(!A[i])continue;let v=A[i];
   if(px>0)v=Math.min(v,A[i-1]+3);if(py>0){v=Math.min(v,A[i-W]+3);if(px>0)v=Math.min(v,A[i-W-1]+4);if(px<W-1)v=Math.min(v,A[i-W+1]+4)}A[i]=v}
  for(let py=H-1;py>=0;py--)for(let px=W-1;px>=0;px--){const i=py*W+px;if(!A[i])continue;let v=A[i];
   if(px<W-1)v=Math.min(v,A[i+1]+3);if(py<H-1){v=Math.min(v,A[i+W]+3);if(px<W-1)v=Math.min(v,A[i+W+1]+4);if(px>0)v=Math.min(v,A[i+W-1]+4)}A[i]=v}
  return A};
 const D=chamfer(i=>!inside[i]);
 const DO=chamfer(i=>inside[i]);
 const seatMask=new Uint8Array(W*H);
 Object.assign(C,{rail:hex('#5b6570'),conc:hex('#6b7480'),conc2:hex('#7a838e'),riser:hex('#26323b'),riserU:hex('#1c242c'),
  seat:hex(ST.seat[0]),seat2:hex(ST.seat[1]),seatU:hex(ST.seatU[0]),seatU2:hex(ST.seatU[1]),aisle:hex('#4d5761')});
 PARK_C=C;
 const DUGC={1:dugoutFrame(1),'-1':dugoutFrame(-1)};
 const mowK=(x,y,r)=>ST.mow==='wave'?Math.floor((y+Math.sin(x*.06)*7)/17)&1:ST.mow==='stripe'?Math.floor(y/18)&1:ST.mow==='arc'?Math.floor(r/22)&1:ST.mow==='diag'?Math.floor((x+y)/20)&1:(Math.floor((x+y)/26)+Math.floor((x-y)/26))&1;
 PARK_MOW=mowK;
 // the harbor park: find the 8px tiles that are open sea through and through (they need only the water colour)
 let HSEA=null;const HSW=Math.ceil(W/8);if(ST.harbor){const LW=Math.ceil(W/4)+1,LH=Math.ceil(H/4)+1,lat=new Uint8Array(LW*LH);
  for(let ly=0;ly<LH;ly++)for(let lx=0;lx<LW;lx++){harborCol(Math.min(W-1,lx*4)+.5,Math.min(H-1,ly*4)+.5);lat[ly*LW+lx]=H_KIND===1&&!H_SHADE?1:0}
  HSEA=new Uint8Array(HSW*Math.ceil(H/8));for(let ty=0;ty<Math.ceil(H/8);ty++)for(let tx=0;tx<HSW;tx++){let n=0;for(let a=0;a<=2;a++)for(let b=0;b<=2;b++)n+=lat[Math.min(LH-1,ty*2+b)*LW+Math.min(LW-1,tx*2+a)];if(n===9)HSEA[ty*HSW+tx]=1}}
 // pass 2: paint
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){
  const i=py*W+px;const x=(px+.5-HX)*FT,y=(HY-(py+.5))*FT;const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
  let col;
  const ath=Math.abs(th),fdh=fenceDist(th);
  let dug=0;if(!inside[i]){const kx=px/K,ky=py/K;for(const sd of[1,-1]){const c=DUGC[sd],dx=kx-c.x,dy=ky-c.y,a=sd*45*RAD,lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);
   if(Math.abs(lx)<92&&ly>-22&&ly<30){dug=(Math.abs(lx)>88||ly>26)?2:1;break}}}
  const inPen=!inside[i]&&y>0&&ath>=29&&ath<=41&&r>=fdh&&r<fdh+18;
  let feat=null;
  if(ST.bowl&&!inside[i]&&!inPen&&!dug)feat='harbor';
  else if(!inside[i]&&!inPen&&y>0){
   if(ST.feature==='ocean'&&ath<33&&r>fdh+26)feat='ocean';
   else if(ST.feature==='lawn'&&th>7&&th<27&&r>fdh+4&&r<fdh+80)feat='lawn';
   else if(ST.feature==='deck'&&th<-7&&th>-27&&r>fdh+4&&r<fdh+60)feat='deck';
   else if(ST.feature==='pool'&&th>8&&th<30&&r>fdh+6&&r<fdh+52)feat='pool';
   else if(ST.feature==='fortress'&&th<-4&&th>-34&&r>fdh+10&&r<fdh+48)feat='fort';
   else if(ST.feature==='trees'&&ath<17&&r>fdh+8)feat='trees';
   else if(ST.feature==='honey'&&ath<34&&r>fdh+3&&r<fdh+60)feat='honey';
   else if(ST.feature==='whale'&&!ST.harbor&&ath<36&&r>fdh+14)feat='whale';
   else if(ST.feature==='orchard'&&ath<36&&r>fdh+4&&!inPen)feat='orchard';
  }
  if(feat==='ocean'){const w=Math.sin(x*.11+Math.sin(y*.05)*2.2)+Math.sin(y*.23+x*.02);col=w>1.35?C.wave:w<-1.1?C.sea2:C.sea}
  else if(feat==='lawn'){col=(((px>>4)+(py>>4))&1)?C.lawn1:C.lawn2;seatMask[i]=2}
  else if(feat==='deck'){const tx=px%30,ty=py%30;if(tx<8&&ty<8)col=C.table;else{col=(py%4===0)?C.deck2:C.deck;seatMask[i]=3}}
  else if(feat==='pool'){if(r<fdh+9||r>fdh+49)col=((px>>2)+(py>>2))&1?C.tile:C.tile2;else{const w=Math.sin(x*.42+y*.31)+Math.sin(y*.53-x*.19);col=w>1.35?C.poolHi:C.pool;seatMask[i]=4}}
  else if(feat==='fort'){const rw=Math.floor(py/7),off=(rw&1)*7;col=(py%7===0||(px+off)%14===0)?C.mortar:(((px+off)/14|0)+rw)%3===0?C.st2:C.st1;if(r<fdh+13&&((px>>3)&1))col=C.st2}
  else if(feat==='trees'){const n=Math.sin(x*.21)*Math.cos(y*.19)+Math.sin(x*.07+y*.11)+Math.sin(x*.5+y*.45)*.35;col=n>.75?C.tr1:n>-.1?C.tr2:C.tr3;if(n>1.2)col=C.trHi}
  else if(feat==='harbor'){if(HSEA&&HSEA[(py>>3)*HSW+(px>>3)])col=hSeaCol(x,y,px+.5,py+.5);else{col=harborCol(px+.5,py+.5)||(ST.bowl==='mudung'?(S.night?[40,38,38]:[201,193,178]):ST.bowl==='orbit'?(S.night?[30,34,44]:[150,156,166]):ST.bowl==='brick'?((HY-py)*FT>120?fTrees(px+.5,py+.5):S.night?[44,46,54]:[214,210,200]):ST.bowl==='steel'?(S.night?[44,46,54]:[214,210,200]):[200,198,192]);if(H_SEAT)seatMask[i]=H_ROWF>.16&&H_ROWF<.52?5:1}}
  else if(feat==='whale'){const w=Math.sin(x*.11+Math.sin(y*.05)*2.2)+Math.sin(y*.23+x*.02);col=w>1.35?C.wave:w<-1.1?C.sea2:C.sea;
   const wx=WHALE.x,wy=WHALE.y,dx=x-wx,dy=y-wy,e=(dx/30)**2+(dy/(9-Math.max(0,dx)*.12))**2;
   if(e<1)col=dy<-3&&e>.35?C.whB:C.wh1;else{const tx=x-(wx+30),ty=y-wy;if(tx>0&&tx<12&&Math.abs(ty)<tx*.85&&Math.abs(ty)>tx*.25)col=C.wh2}}
  else if(feat==='orchard'&&ST.openTop&&r>=fdh+11&&ath<ST.openTop){col=r*(ST.openTop-ath)*RAD<3.5?C.conc:villageCol(px+.5,py+.5)}
  else if(feat==='orchard'){if(r<fdh+11){const rw=Math.floor(py/6),off=(rw&1)*5;col=(py%6===0||(px+off)%10===0)?C.bas2:C.bas}
   else{const cy=Math.floor(py/22),cx=Math.floor((px+(cy&1)*11)/22),lx=(px+(cy&1)*11)-cx*22-11,ly=py-cy*22-11,d2=lx*lx+ly*ly;
    if(d2<64){col=d2<20&&lx<0&&ly<0?C.orT2:C.orT;if(((lx*7+ly*13+cx*5+cy*3)&15)===0||((lx*3-ly*11+cx)&31)===1)col=C.orF}else col=(py>>1)&1?C.orG:C.orG2}}
  else if(feat==='honey'){const rw=Math.floor(py/9),off=(rw&1)*6,lx=(px+off)%12,ly=py%9;if(lx<1||ly<1)col=C.hyE;else{col=((((px+off)/12|0)+rw)%3===0)?C.hy1:C.hy2;seatMask[i]=1}}
  else if(dug){col=dug===2?C.dugE:(((px>>2)+(py>>2))&1?C.dugA:C.dugB)}
  else if(inPen){
   const edge=r<fdh+1.6||r>fdh+16.4||r*Math.min(ath-29,41-ath)*RAD<1.6;
   if(edge)col=C.pad;else{const k=(Math.floor((x+y)/12)+Math.floor((x-y)/12))&1;col=k?C.g1:C.g2}
  }else if(!inside[i]){
   // tiered stands: rail, lower bowl, concourse, upper deck; rows follow the wall, stairs run toward home
   const dO=DO[i]/3/K;
   if(dO<3)col=C.rail;
   else if(dO>=112&&dO<124)col=((px*3+py*5)%11===0)?C.conc2:C.conc;
   else{
    const upper=dO>=124;const rp=(Math.hypot(px-HX,py-HY)/K)||1;const ang=Math.atan2(px-HX,HY-py)/RAD;
    const m=((ang%10)+10)%10;const aisle=Math.abs(m-5)<(2.2/rp)/RAD;
    if(aisle)col=C.aisle;
    else{const row=Math.floor((dO-3)/6),rr=(dO-3)-row*6;
     if(rr>=5)col=upper?C.riserU:C.riser;
     else{col=ST.bowl?hSeat(ang,row,upper):upper?((row&1)?C.seatU:C.seatU2):((row&1)?C.seat:C.seat2);seatMask[i]=1}}
   }
  }else{
   const fair=Math.abs(th)<=45&&y>=0;
   let dOut=ST.bowl&&fair?(fenceDist(th)-r)/FT/K:D[i]/3/K,wallT=fairBig[i]?ST.wallFt*2:6;
   if(ST.bowl&&!fair){// foul ground in the bowl parks: measure straight to the stands' front (the box along each line) so the wall runs clean round the corner
    const sd=x>=0?1:-1,al=(sd*x+y)/Math.SQRT2,pe=(sd*x-y)/Math.SQRT2;if(pe>=0&&al>-5){const e1=40-pe,e2=fenceDist(sd*45)-al;dOut=Math.min(e1,e2)/FT/K;wallT=e2<e1?ST.wallFt*2:6;if(e2<0&&e1>0)dOut=-1}}// the end wall lines up with the outfield wall at the pole// the bowl parks measure the wall straight from the fence line, so its top line runs clean
   if(ST.bowl&&dOut<0)col=hMul(HB.pad1,.8);
   else if(dOut<wallT&&ST.bowl&&(fair||dOut<wallT)){// the Whales' padded wall: royal and navy panels with seams, a yellow line along the top, a lit lip
    const sF=r*th*RAD,m=((sF%18)+18)%18,id=Math.floor(sF/18);
    col=dOut<1.4?HB.wallY:dOut<2.4?HB.wallCap:m<.9?HB.seam:dOut>wallT-2.5?hMul((id&1)?HB.pad2:HB.pad1,.72):(id&1)?HB.pad2:HB.pad1}
   else if(dOut<wallT)col=dOut<1.5?C.pad2:C.pad;
   else if((fair&&r>fenceDist(th)-14-8*0)||(!fair&&dOut<wallT+(ST.bowl?14/FT/K-wallT+wallT:12)))col=rng()<.2?C.tr2:C.tr;
   else{
    const dm=Math.hypot(x,y-60.5);
    const grassIn=Math.abs(x)+Math.abs(y-63.64)<63.64-9;
    const dirt=(dm<95&&Math.abs(th)<=50&&y>-2&&!grassIn)||r<13||dm<9;
    if(dirt){const n=rng();col=n<.14?C.d2:n<.2?C.d3:C.d1}
    else{const k=mowK(x,y,r);col=k?C.g1:C.g2;if(rng()<.05)col=C.g3}
   }
  }
  if(col!=='skip')put(px,py,col);
 }
 // seat fans on a grid over seat pixels
 FANS=[];
 if(ST.bowl){// the bowl parks: a fan on (nearly) every seat, sitting on the row's centre line, one per 5px cell so they pack like a real crowd
  for(let cy=0;cy<H-5;cy+=5)for(let cx=0;cx<W-5;cx+=5){let px=-1,py=-1;for(const[ox,oy]of[[2,2],[1,2],[3,2],[2,1],[2,3],[1,1],[3,3],[1,3],[3,1],[0,2],[4,2],[2,0],[2,4]]){const i=(cy+oy)*W+cx+ox;if(seatMask[i]===5){px=cx+ox;py=cy+oy;break}}
   if(px<0)continue;const ang=Math.atan2(px-HX,HY-py)/RAD,bh=Math.abs(ang)>128;if(rng()>(bh?.95:.8))continue;const j=(py*W+px)*4;FANS.push({x:px,y:py,bg:`rgb(${d[j]},${d[j+1]},${d[j+2]})`,ang,sm:1})}}
 else for(let py=5;py<H-5;py+=8)for(let px=5;px<W-5;px+=8){
  // behind home plate the seats are full: every seat gets a fan (elsewhere a few are empty)
  const i=py*W+px,bh=Math.abs(Math.atan2(px-HX,HY-py)/RAD)>128;if(!seatMask[i]||(!bh&&(!seatMask[i-3]||!seatMask[i+3])))continue;
  const sm=seatMask[i];if(!bh&&rng()>(sm===2?.22:sm===3?.32:sm===4?.16:.88))continue;
  const j=i*4;FANS.push({x:px,y:py,bg:`rgb(${d[j]},${d[j+1]},${d[j+2]})`,ang:Math.atan2(px-HX,HY-py)/RAD,lawn:sm===2,deck:sm===3,pool:sm===4});
 }
 // concourse ring (for pennants/banners) and aisle stairways (for vendors)
 CONC=[];AISLES=[];RAIL=[];
 const dAt=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return null;const i=y*W+x;return inside[i]?-1:DO[i]/3/K};
 for(let a=-178;a<=178;a++){const sn=Math.sin(a*RAD),cs=Math.cos(a*RAD);
  for(let r=40;r<2400;r++){const x=HX+sn*r,y=HY-cs*r;const dd=dAt(x,y);if(dd===null)break;if(dd>=117&&dd<=119){CONC.push({x,y,ang:a});break}}
  for(let r=40;r<2400;r++){const x=HX+sn*r,y=HY-cs*r;const dd=dAt(x,y);if(dd===null)break;if(dd>=7&&dd<=9){RAIL.push({x,y,ang:a});break}}}
 for(let a=-125;a<=125;a+=10){const sn=Math.sin(a*RAD),cs=Math.cos(a*RAD);let r0=null,r1=null;
  for(let r=40;r<2400;r++){const x=HX+sn*r,y=HY-cs*r;const dd=dAt(x,y);if(dd===null)break;if(r0===null&&dd>5)r0=r;if(r0!==null&&dd>=108){r1=r;break}}
  if(Math.abs(a)>=27&&Math.abs(a)<=43)continue;if(r0!==null&&r1!==null&&r1-r0>40)AISLES.push({a,r0:r0+4,r1:r1-4})}
 // foul lines (2px) + poles
 for(const s of[1,-1]){
  for(let i=0;i<W;i++){
   const px=HX+s*i,py=HY-i;if(px<0||px>=W||py<0)break;
   const k=py*W+px;
   if(!inside[k]||D[k]/3/K<(i>300*K?16:6))break;
   put(px,py,C.chalk);put(px,py-1,C.chalk);
  }
 }
 g.putImageData(img,0,0);
 // chalk + bases
 const P=(x,y)=>toPx(x,y);
 g.fillStyle='#f3eee0';
 const diamondAt=(wx,wy)=>{const p=P(wx,wy);const cx=Math.round(p.x),cy=Math.round(p.y);for(let k=-4;k<=4;k++){const w=4-Math.abs(k);g.fillRect(cx-w,cy+k,w*2+1,1)}};
 diamondAt(BASES[1].x,BASES[1].y);diamondAt(BASES[2].x,BASES[2].y);diamondAt(BASES[3].x,BASES[3].y);
 const hp=P(0,0);const hx=Math.round(hp.x),hy=Math.round(hp.y);
 g.fillRect(hx-4,hy-4,9,4);g.fillRect(hx-3,hy,7,1);g.fillRect(hx-2,hy+1,5,1);g.fillRect(hx-1,hy+2,3,1);g.fillRect(hx,hy+3,1,1);
 const rb=P(0,60.5);g.fillRect(Math.round(rb.x)-3,Math.round(rb.y),6,2);
 const boxOutline=(x0,x1)=>{const a=P(x0,3),b=P(x1,-3);g.strokeStyle='rgba(243,238,224,.85)';g.lineWidth=1;g.strokeRect(Math.round(Math.min(a.x,b.x))+.5,Math.round(a.y)+.5,Math.round(Math.abs(b.x-a.x)),Math.round(b.y-a.y))};
 boxOutline(-5.2,-1.2);boxOutline(1.2,5.2);
 // on-deck circles
 for(const s of[1,-1]){const p=P(s*38,-6);g.strokeStyle='rgba(243,238,224,.7)';g.beginPath();g.arc(p.x,p.y,7,0,Math.PI*2);g.stroke()}
 // distance markers on the warning track
 if(!ST.bowl)[[-43,DIMS[0]],[-22,DIMS[1]],[0,DIMS[2]],[22,DIMS[3]],[43,DIMS[4]]].forEach(([th,t])=>{// (the harbor park paints them on its wall)
  const r=fenceDist(th)-13;const p=P(r*Math.sin(th*RAD),r*Math.cos(th*RAD));
  g.save();g.translate(p.x,p.y);g.rotate(th*RAD);g.fillStyle='#ffd23f';g.font='bold 18px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(t,0,0);g.restore();
 });
 // bullpen mounds and plates beyond the outfield fence
 for(const sd of[1,-1]){const pm=penSpot(sd,32),pc=penSpot(sd,38.2);const m=P(pm.x,pm.y),k=P(pc.x,pc.y);
  g.fillStyle='#c48c56';g.beginPath();g.arc(m.x,m.y,15,0,Math.PI*2);g.fill();g.beginPath();g.arc(k.x,k.y,10,0,Math.PI*2);g.fill();
  g.fillStyle='#f3eee0';g.fillRect(Math.round(m.x)-3,Math.round(m.y),6,2);g.fillRect(Math.round(k.x)-2,Math.round(k.y)+3,5,3);}
 if(ST.village)vTownDraw(g,null);// the buildings behind the open outfield
 if(ST.bowl)hDecor(g);
 return c;
}

