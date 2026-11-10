// ---------- signage layer: light towers + corner billboards (drawn over the crowd) ----------
function buildSigns(){
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.scale(K,K);
 // tall foul poles with a fair-side screen and a cast shadow
 for(const sd of[1,-1]){const r=fenceDist(sd*45),b=toPx3(sd*r*Math.SQRT1_2,r*Math.SQRT1_2);const H2=78;
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.moveTo(b.x-1.5,b.y);g.lineTo(b.x+1.5,b.y);g.lineTo(b.x+40,b.y+26);g.lineTo(b.x+37,b.y+28);g.closePath();g.fill();
  g.fillStyle='rgba(255,210,63,.4)';g.fillRect(sd>0?b.x-7:b.x+1.5,b.y-H2+10,5.5,H2-22);
  g.fillStyle='#ffd23f';g.fillRect(b.x-1.5,b.y-H2,3,H2);g.fillStyle='#c9a21b';g.fillRect(b.x+.8,b.y-H2,.9,H2);
  g.fillStyle='#ffe57a';g.beginPath();g.arc(b.x,b.y-H2,2.6,0,Math.PI*2);g.fill();g.fillStyle='#59636d';g.fillRect(b.x-3,b.y-1,6,3)}
 // backstop netting behind the plate (every park): a curtain of net standing on the wall around home, hung from
 // a cable strung across the tops of the four poles. Seen from above with height, the top of the curtain sits
 // higher up the screen than its base, so it reaches in over the plate area.
 {const hp=toPx3(0,0),R=70,HT=34,A0=-44,A1=44,at=(a,f)=>({x:hp.x+Math.cos((90+a)*RAD)*R,y:hp.y+Math.sin((90+a)*RAD)*R-HT*f});
  const edge=(f,dir)=>{const out=[];for(let a=dir>0?A0:A1;dir>0?a<=A1+.01:a>=A0-.01;a+=2*dir)out.push(at(a,f));return out};
  // the curtain itself: a faint sheet so it reads as a surface, darker toward the bottom where the mesh bunches up
  {const top=edge(1,1),bot=edge(0,-1),gr=g.createLinearGradient(0,hp.y+R-HT,0,hp.y+R);gr.addColorStop(0,'rgba(20,24,28,.06)');gr.addColorStop(1,'rgba(20,24,28,.16)');
   g.fillStyle=gr;g.beginPath();[...top,...bot].forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.closePath();g.fill()}
  // mesh: horizontal strands following the curve, vertical strands dropping from the top cable to the wall
  g.strokeStyle='rgba(18,22,26,.34)';g.lineWidth=.6;
  for(let f=1/7;f<.99;f+=1/7){g.beginPath();edge(f,1).forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.stroke()}
  for(let a=A0;a<=A1+.01;a+=3.5){const t=at(a,1),b2=at(a,0);g.beginPath();g.moveTo(t.x,t.y);g.lineTo(b2.x,b2.y);g.stroke()}
  // cables: a heavy one across the pole tops, a lighter one along the wall
  g.strokeStyle='rgba(30,34,40,.85)';g.lineWidth=1.3;g.beginPath();edge(1,1).forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.stroke();
  g.strokeStyle='rgba(30,34,40,.55)';g.lineWidth=.9;g.beginPath();edge(0,1).forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.stroke();
  // poles at both ends and two in between, each with a shadow on the ground and a cap on top
  for(const a of[A0,-15,15,A1]){const b2=at(a,0),t=at(a,1);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(b2.x,b2.y,14,2);
   g.fillStyle='#3a4048';g.fillRect(b2.x-1,t.y,2,b2.y-t.y);g.fillStyle='#59626c';g.fillRect(b2.x-1,t.y,1,b2.y-t.y);g.fillStyle='#2a2f36';g.fillRect(b2.x-1.5,t.y-1,3,2)}}
 // light towers, drawn with height: the overhead camera sees each mast lean away from the field,
 // so the lamp bank sits outward of the base, with lit and shaded faces and a cast shadow
 TOWERS=[];const CX=HX/K,CY=H/K*.53,LEAN=.12,night=!!S.night;
 (ST.bowl==='mudung'?[[CX-215,52],[CX+215,52],[104,872],[856,872]]:ST.bowl==='orbit'?[[CX-200,40],[CX+200,40],[104,872],[856,872]]:ST.bowl==='brick'?[[CX-190,64],[CX+200,64],[104,872],[856,872]]:ST.bowl==='steel'?[[CX-150,58],[CX+150,58],[104,872],[856,872]]:ST.bowl==='fortress'?[[CX-215,92],[CX+205,96],[104,872],[856,872]]:ST.harbor?[[CX-175,70],[CX+175,70],[104,872],[856,872]]:[[44,222],[916,222],[104,872],[856,872]]).forEach(([tx,ty])=>{
  const bx=CX+(tx-CX)/(1+LEAN),by=CY+(ty-CY)/(1+LEAN);      // ground footprint
  const ox=tx-bx,oy=ty-by,ol=Math.hypot(ox,oy),ux=ox/ol,uy=oy/ol,nx=-uy,ny=ux;
  // cast shadow (sun from the upper left by day, faint spill by night)
  const sh=night?.1:.26,sx=bx+70,sy=by+44;
  g.fillStyle=`rgba(0,0,0,${sh})`;g.beginPath();g.moveTo(bx-3,by);g.lineTo(bx+3,by);g.lineTo(sx+2,sy);g.lineTo(sx-2,sy);g.closePath();g.fill();
  g.save();g.translate(sx,sy);g.rotate(Math.atan2(HY/K-ty,HX/K-tx)+Math.PI/2);g.fillRect(-24,-9,48,16);g.restore();
  // concrete footing
  g.fillStyle='#4a525b';g.fillRect(bx-7,by-3,14,7);g.fillStyle='#6b747d';g.fillRect(bx-7,by-3,14,2);
  // mast: tapered, two faces, lattice
  const w0=6,w1=3.4;
  g.fillStyle=night?'#6d7884':'#9aa6b0';g.beginPath();g.moveTo(bx-nx*w0,by-ny*w0);g.lineTo(bx,by);g.lineTo(tx,ty);g.lineTo(tx-nx*w1,ty-ny*w1);g.closePath();g.fill();
  g.fillStyle=night?'#3c4650':'#56606a';g.beginPath();g.moveTo(bx,by);g.lineTo(bx+nx*w0,by+ny*w0);g.lineTo(tx+nx*w1,ty+ny*w1);g.lineTo(tx,ty);g.closePath();g.fill();
  g.strokeStyle='rgba(30,36,42,.75)';g.lineWidth=.7;g.beginPath();
  for(let k=0;k<9;k++){const a=k/9,b2=(k+1)/9,wa=lerp(w0,w1,a),wb=lerp(w0,w1,b2);
   const ax=lerp(bx,tx,a),ay=lerp(by,ty,a),cx2=lerp(bx,tx,b2),cy2=lerp(by,ty,b2);
   g.moveTo(ax-nx*wa,ay-ny*wa);g.lineTo(cx2+nx*wb,cy2+ny*wb);g.moveTo(ax+nx*wa,ay+ny*wa);g.lineTo(cx2-nx*wb,cy2-ny*wb)}g.stroke();
  // lamp bank: back plate offset outward (depth), side faces, then the lamp face pointed at home plate
  const a=Math.atan2(HY/K-ty,HX/K-tx);
  g.save();g.translate(tx,ty);g.rotate(a+Math.PI/2);
  const dx=0,dy=7;                       // depth toward the back (outward)
  g.fillStyle='#14181d';g.fillRect(-26+dx,-10+dy,52,20);
  g.fillStyle='#2b3138';g.beginPath();g.moveTo(-26,10);g.lineTo(-26+dx,10+dy);g.lineTo(26+dx,10+dy);g.lineTo(26,10);g.closePath();g.fill();
  g.fillStyle='#3a424b';g.fillRect(-27,-11,54,22);
  g.fillStyle='#1d2228';g.fillRect(-25,-9,50,18);
  for(let r=0;r<3;r++)for(let k=0;k<6;k++){const lx=-23+k*8,ly=-8+r*5.6;
   if(night){g.fillStyle=(r+k)%2?'#fffdf0':'#fff3c4';g.fillRect(lx,ly,6.5,4.4);g.fillStyle='rgba(255,255,255,.9)';g.fillRect(lx+1,ly+.8,2.5,1.4)}
   else{g.fillStyle=(r+k)%2?'#b9c3cb':'#a5b0b9';g.fillRect(lx,ly,6.5,4.4);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(lx+.6,ly+.5,2,1)}}
  g.fillStyle='#8b96a0';g.fillRect(-27,-13,54,2);g.fillStyle='#59636d';for(let k=-24;k<=24;k+=6)g.fillRect(k,-13,1,2);   // catwalk rail
  g.restore();
  if(night){const gr=g.createRadialGradient(tx,ty,4,tx,ty,64);gr.addColorStop(0,'rgba(255,246,210,.45)');gr.addColorStop(1,'rgba(255,246,210,0)');g.fillStyle=gr;g.fillRect(tx-64,ty-64,128,128)}
  TOWERS.push({x:tx*K,y:ty*K,kx:tx,ky:ty,a});
 });
 // (the city mural billboard was retired; the neighborhood outside the park carries the city now)
 return c;
}

// ---------- city mural: a giant billboard in the left-field upper deck showing the home city's landmark ----------
