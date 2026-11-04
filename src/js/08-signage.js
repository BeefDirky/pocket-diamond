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
 [[44,222],[916,222],[104,872],[856,872]].forEach(([tx,ty])=>{
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
function drawLandmark(g,night){const I=CLUB_INFO[S.you];if(!I||!I.landmark)return;const T=TEAMS[S.you];
 const X=22,Y=6,Wd=150,Ht=74;g.save();
 g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+4,Y+4,Wd,Ht);                        // shadow on the seats
 g.fillStyle='#3a4148';g.fillRect(X+20,Y+Ht,4,10);g.fillRect(X+Wd-24,Y+Ht,4,10);  // legs
 g.fillStyle='#14181c';g.fillRect(X-3,Y-3,Wd+6,Ht+6);
 const sky=g.createLinearGradient(0,Y,0,Y+Ht);
 if(night){sky.addColorStop(0,'#24357a');sky.addColorStop(1,'#7a6aa8')}else{sky.addColorStop(0,'#6fb7ec');sky.addColorStop(1,'#cfe9f7')}
 g.fillStyle=sky;g.fillRect(X,Y,Wd,Ht);
 g.beginPath();g.rect(X,Y,Wd,Ht);g.clip();
 const gnd=Y+Ht-12,sil=night?'#0b0f1e':'#3b4a5c',R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(X+x,y,w,h)};
 if(night)for(let i=0;i<14;i++){const h=hash('st'+i);R(h%Wd,Y+2+(h>>5)%30,1,1,'#e9ecf7')}
 const lit=night?'#ffd86b':'#c9d4de';
 const skyline=(x0,x1,c)=>{for(let x=x0;x<x1;x+=7){const h=12+hash('b'+x+S.you)%22;R(x,gnd-h,6,h,c);if(night)for(let yy=gnd-h+3;yy<gnd-2;yy+=4)if(hash('w'+x+yy)%3)R(x+2,yy,1,1,lit)}};
 const water=c=>{R(0,gnd,Wd,12,c);g.globalAlpha=.4;for(let i=0;i<10;i++)R((i*17+5)%Wd,gnd+3+(i%3)*3,6,1,'#e8f4ff');g.globalAlpha=1};
 switch(I.landmark){
  case'tower':{R(0,gnd-6,Wd,6,sil);g.fillStyle=night?'#1d2a3f':'#4f7a4a';g.beginPath();g.moveTo(X+60,gnd);g.quadraticCurveTo(X+100,gnd-30,X+140,gnd);g.fill();
   R(99,gnd-60,3,40,'#e8e4dc');R(95,gnd-50,11,5,'#d24a3a');R(97,gnd-54,7,4,'#e8e4dc');R(100,gnd-68,1,9,'#e8e4dc');skyline(0,70,sil);water(night?'#1b2d55':'#5aa0d8');break}
  case'bridge':{water(night?'#132a52':'#3f8fd0');R(0,gnd-4,Wd,2,night?'#59618a':'#e7e2d6');
   for(const px of[45,105]){R(px,gnd-40,3,38,night?'#9aa3c8':'#f0ece4');R(px,gnd-40,3,2,'#c94a3a')}
   g.strokeStyle=night?'#c9a6ff':'#f4f1e8';g.lineWidth=.8;g.beginPath();g.moveTo(X,gnd-12);g.quadraticCurveTo(X+46,gnd-46,X+46,gnd-39);g.quadraticCurveTo(X+76,gnd-8,X+106,gnd-39);g.quadraticCurveTo(X+150,gnd-20,X+Wd,gnd-12);g.stroke();
   if(night){g.globalAlpha=.5;for(let x=0;x<Wd;x+=4)R(x,gnd-4,2,1,['#ff6fb5','#6fc9ff','#ffe36b'][x/4%3]);g.globalAlpha=1}break}
  case'cranes':{water(night?'#1b2d55':'#4c8fc4');for(const cx of[18,62,108]){const c='#d24a3a';R(cx,gnd-34,3,34,c);R(cx+18,gnd-34,3,34,c);R(cx-6,gnd-36,38,3,c);R(cx-10,gnd-42,5,8,c)}
   R(70,Y+12,22,3,'#e8e4dc');R(78,Y+9,3,9,'#e8e4dc');R(88,Y+10,3,3,'#e8e4dc');break}
  case'mountain':{g.fillStyle=night?'#0f1528':'#5b7d63';g.beginPath();g.moveTo(X,gnd);g.lineTo(X+40,gnd-30);g.lineTo(X+70,gnd-44);g.lineTo(X+96,gnd-38);g.lineTo(X+130,gnd-26);g.lineTo(X+Wd,gnd-16);g.lineTo(X+Wd,gnd);g.fill();
   for(const px of[64,70,76,84])R(px,gnd-46-(px%3)*2,4,8,night?'#3a4566':'#9aa49c');R(0,gnd,Wd,12,night?'#10182a':'#3d6a3d');skyline(4,50,sil);break}
  case'sun':{g.fillStyle=night?'#f2e6c2':'#ffb43a';g.beginPath();g.arc(X+112,Y+24,14,0,Math.PI*2);g.fill();
   if(!night){g.globalAlpha=.35;for(let i=0;i<4;i++)R(10+i*28,gnd-30+(i%2)*4,22,1,'#fff6d0');g.globalAlpha=1}
   R(0,gnd,Wd,12,night?'#1b2a1a':'#5f8a3c');for(const tx of[14,40,66,92,124]){g.fillStyle=night?'#22351f':'#3f7d34';g.beginPath();g.arc(X+tx,gnd-8,8,0,Math.PI*2);g.fill();for(let k=0;k<3;k++)R(tx-5+k*4,gnd-11+(k%2)*4,2,2,'#d63a2e')}break}
  case'expo':{skyline(0,Wd,sil);R(70,gnd-56,5,56,'#d8dde2');g.fillStyle='#d8dde2';g.beginPath();g.moveTo(X+72.5,gnd-70);g.lineTo(X+68,gnd-56);g.lineTo(X+77,gnd-56);g.fill();
   g.fillStyle=night?'#6fd0ff':'#3f8fd0';g.beginPath();g.arc(X+72.5,gnd-44,5,0,Math.PI*2);g.fill();R(0,gnd,Wd,12,night?'#14223a':'#4b8a58');break}
  case'gate':{R(0,gnd,Wd,12,night?'#1d2418':'#6b8a4a');const wall=night?'#5a5448':'#b8ab92';R(0,gnd-12,Wd,12,wall);for(let x=0;x<Wd;x+=8)R(x,gnd-15,5,3,wall);
   R(52,gnd-34,46,22,night?'#6a5f50':'#c9bba0');R(68,gnd-24,14,12,'#1a1410');g.fillStyle=night?'#2a2a33':'#3a4a5a';g.beginPath();g.moveTo(X+44,gnd-32);g.quadraticCurveTo(X+75,gnd-42,X+106,gnd-32);g.lineTo(X+100,gnd-38);g.quadraticCurveTo(X+75,gnd-48,X+50,gnd-38);g.fill();
   R(52,gnd-34,46,2,'#2f7a5a');break}
  case'blossom':{R(0,gnd,Wd,12,night?'#1d2418':'#6b9a4a');R(0,gnd+5,Wd,3,night?'#2a2a33':'#8a8f96');for(const tx of[10,34,58,82,106,130]){R(tx-1,gnd-12,3,12,'#5a3a2a');g.fillStyle=night?'#c48aa8':'#f7b6d2';g.beginPath();g.arc(X+tx,gnd-16,10,0,Math.PI*2);g.fill();g.fillStyle=night?'#e0a9c4':'#ffd5e6';g.beginPath();g.arc(X+tx-3,gnd-19,5,0,Math.PI*2);g.fill()}
   if(!night)for(let i=0;i<16;i++){const h=hash('pt'+i);R(h%Wd,Y+10+(h>>4)%40,2,1,'#ffc7dc')}break}
  case'whale':{water(night?'#14305a':'#2f7fc0');g.fillStyle=night?'#2a4a7a':'#1f4f8a';g.beginPath();g.moveTo(X+70,gnd+2);g.quadraticCurveTo(X+74,gnd-16,X+62,gnd-24);g.lineTo(X+74,gnd-20);g.lineTo(X+86,gnd-26);g.quadraticCurveTo(X+76,gnd-14,X+80,gnd+2);g.fill();
   R(104,gnd-14,34,8,night?'#3a3f4a':'#d24a3a');R(110,gnd-24,4,10,'#e8e4dc');R(120,gnd-20,12,6,'#e8e4dc');skyline(0,40,sil);break}
  case'halla':{g.fillStyle=night?'#0f1528':'#5d6f86';g.beginPath();g.moveTo(X,gnd);g.quadraticCurveTo(X+75,gnd-60,X+Wd,gnd);g.fill();R(66,gnd-30,18,3,night?'#cfd6e6':'#f4f6f8');
   R(0,gnd,Wd,12,night?'#18241a':'#3f6e34');for(const tx of[16,42,108,132]){g.fillStyle=night?'#22351f':'#2f6b2c';g.beginPath();g.arc(X+tx,gnd-6,7,0,Math.PI*2);g.fill();for(let k=0;k<3;k++)R(tx-4+k*3,gnd-9+(k%2)*4,2,2,'#f28a1e')}
   R(70,gnd-12,8,12,'#4a4a4e');R(71,gnd-15,6,4,'#5a5a5e');R(71,gnd-8,6,1,'#2e2e32');break}
 }
 g.restore();
 // the club's name across the bottom of the board
 g.fillStyle=T.cap;g.fillRect(X,Y+Ht-9,Wd,9);g.fillStyle=T.jersey;g.fillRect(X,Y+Ht-9,Wd,1);
 g.fillStyle=CREAM;g.font='8px Jua, "Pixelify Sans", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(`${T.kcity} · ${T.city} · ${(I.nick||'').toUpperCase()}`,X+Wd/2,Y+Ht-4.2,Wd-8);
}
