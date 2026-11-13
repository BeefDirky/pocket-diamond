// ---------- Bread Bowl Park, the neighbourhood layer: the main entrance behind home (a curved glass hall under a rounded
// roof, the Bears' emblem over DAEJEON BEARS, the arched BREAD BOWL PARK portal, bakery fronts either side), its plaza and
// street; and beyond the ring the Expo bridge's twin arches over the Gapcheon, Hanbit Tower, and the Daedeok and Expo
// campus buildings. Drawn once by day and once by night (the night pass keeps only its warm light). ----------
function drawBread(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=Math.round(cx(HX)),gy=Math.round(tip.y);
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))},N=(d,n)=>night?n:d;
 const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)}),U=1/(FT*2);// feet to this layer's pixels
 // ---- beyond the ring ----
 // campus buildings: a roof from above with its front face showing below it, a shadow down and right
 const bld=(xf,yf,wf,df,fl,kind,name)=>{const p=P(xf,yf),w=wf*U,d=df*U,fh=fl*2.6*U;
  R(p.x+5,p.y+5,w,d+fh,'rgba(0,0,0,.28)');
  const roof=kind==='lab'?N('#c2c6cc','#3c4250'):kind==='expo'?N('#d6dade','#444a58'):N('#b4bac4','#383e4c');
  R(p.x,p.y,w,d,roof);R(p.x,p.y,w,1,N('#eef1f5','#5a6274'));R(p.x,p.y+d-1,w,1,N('#7c8494','#20242e'));
  if(kind==='lab'){for(let x=p.x+4;x<p.x+w-6;x+=9)for(let y=p.y+4;y<p.y+d-5;y+=7){R(x,y,6,4,N('#1c2e66','#101a38'));R(x,y,6,1,N('#3b5cae','#1c2e66'))}}
  else if(kind==='expo'){g.strokeStyle=N('#f4ead8','#6a7080');g.lineWidth=1;g.beginPath();for(let x=-d;x<w;x+=8){g.moveTo(p.x+Math.max(0,x),p.y+Math.max(0,-x));g.lineTo(p.x+Math.min(w,x+d),p.y+Math.min(d,w-x))}g.stroke();
   R(p.x+w*.3,p.y+d*.25,w*.4,d*.5,night?'#ffbe5c':'#2c4468');if(night)R(p.x+w*.3,p.y+d*.25,w*.4,1,'#ffe49a');else R(p.x+w*.3,p.y+d*.25,w*.4,2,'#5a7ea8')}
  else{for(let x=p.x+3;x<p.x+w-3;x+=4)R(x,p.y+2,1,d-4,N('#a2a8b4','#2c3240'));R(p.x+w*.6,p.y+3,7,5,N('#7c8494','#262a36'))}
  // the front: floors of glass between frames
  for(let f=0;f<fl;f++){const y=p.y+d+f*2.6*U;R(p.x,y,w,2.6*U,night?(f===fl-1?'#ffe49a':'#ffbe5c'):(f&1?'#243a5a':'#2c4468'));R(p.x,y,w,1,N('#aab2be','#2a3040'))}
  for(let x=p.x;x<p.x+w;x+=5)R(x,p.y+d,1,fh,N(kind==='lab'?'#b9bdc4':'#56607a','#2a3040'));
  if(night)for(let x=p.x+2;x<p.x+w-2;x+=5)if(vHash(Math.round(x),Math.round(p.y))%4===0)R(x,p.y+d+1,3,fh-2,'#1c2238');
  if(name){g.fillStyle=N('#14244e','#0c1634');g.fillRect(Math.round(p.x+w/2-name.length*2.2-4),Math.round(p.y+d/2-5),Math.round(name.length*4.4+8),10);g.fillStyle=night?'#ffd890':'#f4ead8';g.font='bold 7px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(name,Math.round(p.x+w/2),Math.round(p.y+d/2)+.5)}};
 // the Daedeok side (left) and the Expo side (right), and the far bank
 bld(-640,470,150,56,4,'lab','DAEDEOK INNOPOLIS');bld(-600,372,96,44,3,'lab');bld(-470,548,84,40,3,'tech');bld(-640,590,110,40,3,'lab');
 bld(500,480,150,54,4,'expo','EXPO SCIENCE PARK');bld(520,380,104,44,3,'expo');bld(400,566,80,38,3,'tech');bld(560,596,96,40,2,'expo');
 for(const[x,w,kd]of[[-560,120,'lab'],[-380,90,'tech'],[-60,110,'tech'],[110,130,'expo'],[330,90,'lab'],[470,140,'tech']])bld(x,djRivY(x)+40+9+110,w,34,3,kd);
 // an atom on the Innopolis lawn
 {const p=P(-548,430);g.strokeStyle=N('#f4ead8','#6a7080');g.lineWidth=1;for(const a of[0,1.05,2.1]){g.beginPath();g.ellipse(p.x,p.y,13,5,a,0,7);g.stroke()}R(p.x-1,p.y-1,3,3,'#d0202e')}
 // the Expo bridge: twin arches over the deck, leaning away from the camera, hangers down to the road, their shadow on the water
 {const ry=djRivY(DJ_BR.x),a=P(DJ_BR.x,ry-60),b=P(DJ_BR.x,ry+60),L=a.y-b.y,rise=52*U;
  for(const[off,col,sh]of[[DJ_BR.w*U+1,N('#f4f1ea','#8a8e9a'),true],[-DJ_BR.w*U-1,N('#f4f1ea','#8a8e9a'),false]]){
   if(sh){g.strokeStyle='rgba(8,20,34,.3)';g.lineWidth=3;g.beginPath();for(let t=0;t<=1.001;t+=.04){const hgt=Math.sin(t*Math.PI)*rise,x=a.x+off+hgt*.8,y=a.y-L*t+hgt*.25;t?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
   g.strokeStyle=N('#8a94a2','#3a4050');g.lineWidth=1;g.beginPath();for(let t=.08;t<.95;t+=.08){const hgt=Math.sin(t*Math.PI)*rise;g.moveTo(a.x+off,a.y-L*t);g.lineTo(a.x+off-hgt*.55,a.y-L*t-hgt*.5)}g.stroke();
   g.strokeStyle=col;g.lineWidth=4;g.beginPath();for(let t=0;t<=1.001;t+=.04){const hgt=Math.sin(t*Math.PI)*rise,x=a.x+off-hgt*.55,y=a.y-L*t-hgt*.5;t?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
   g.strokeStyle=off>0?'#d0202e':'#3b5cae';g.lineWidth=1;g.beginPath();for(let t=0;t<=1.001;t+=.04){const hgt=Math.sin(t*Math.PI)*rise,x=a.x+off-hgt*.55+1,y=a.y-L*t-hgt*.5+1;t?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
   if(night)for(let t=.1;t<.95;t+=.12){const hgt=Math.sin(t*Math.PI)*rise;R(a.x+off-hgt*.55-1,a.y-L*t-hgt*.5-1,2,2,'#ffe49a')}}}
 // Hanbit Tower: a ring court, three legs sweeping up into the shaft, the saucer of the observation deck, the spire
 {const p=P(DJ_TW.x,DJ_TW.y),lx=-.5,ly=-.86,Ht=84;const at=t=>({x:p.x+lx*Ht*t,y:p.y+ly*Ht*t});
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=4;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+Ht*.7,p.y+Ht*.32);g.stroke();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(p.x+Ht*.48,p.y+Ht*.22,9,4,.4,0,7);g.fill();
  const s0=at(.42);for(const[dx,dy]of[[-9,3],[9,4],[0,-8]]){g.strokeStyle=N('#e8ecf0','#7c8494');g.lineWidth=3;g.beginPath();g.moveTo(p.x+dx,p.y+dy);g.quadraticCurveTo(p.x+dx*.3+lx*8,p.y+dy*.3+ly*8,s0.x,s0.y);g.stroke()}
  const s1=at(1);g.strokeStyle=N('#f4f6f8','#9aa2b0');g.lineWidth=6;g.beginPath();g.moveTo(s0.x,s0.y);g.lineTo(s1.x,s1.y);g.stroke();g.strokeStyle=N('#aab2be','#4a5262');g.lineWidth=2;g.beginPath();g.moveTo(s0.x+2.5,s0.y+.5);g.lineTo(s1.x+2.5,s1.y+.5);g.stroke();
  const d0=at(.66);g.fillStyle=N('#8a94a2','#2a3040');g.beginPath();g.ellipse(d0.x,d0.y+3,19,9,0,0,7);g.fill();g.fillStyle=N('#eef1f5','#8a94a2');g.beginPath();g.ellipse(d0.x,d0.y,19,9,0,0,7);g.fill();
  g.fillStyle=night?'#ffe49a':'#2c4468';g.beginPath();g.ellipse(d0.x,d0.y,15,6.5,0,0,7);g.fill();g.fillStyle=N('#f4f6f8','#9aa2b0');g.beginPath();g.ellipse(d0.x,d0.y-1,10,4,0,0,7);g.fill();
  const d1=at(.8);g.fillStyle=N('#dfe4ea','#7c8494');g.beginPath();g.ellipse(d1.x,d1.y,9,4,0,0,7);g.fill();
  const tp=at(1.22);g.strokeStyle=N('#f4f6f8','#9aa2b0');g.lineWidth=1;g.beginPath();g.moveTo(s1.x,s1.y);g.lineTo(tp.x,tp.y);g.stroke();R(tp.x-1,tp.y-1,2,2,night?'#ff5a4a':'#d0202e')}
 // ---- the plaza: pale slabs fanning from the doors, a ring of warm paving (the bowl), planters, banners, lamps ----
 const PV=night?['#343846','#2c303c','#454a5a','#5a4830']:['#d2d0ca','#c2c0b8','#e6e4de','#c9a878'];
 g.fillStyle=PV[0];g.beginPath();g.moveTo(gx-190,gy-10);g.lineTo(gx+190,gy-10);g.lineTo(gx+232,gy+124);g.lineTo(gx-232,gy+124);g.closePath();g.fill();
 g.save();g.clip();for(let y=gy-10;y<gy+128;y+=7)R(gx-240,y,480,1,PV[1]);for(let y=gy-10,r2=0;y<gy+128;y+=7,r2++)for(let x=gx-240+(r2&1)*7;x<gx+240;x+=14)R(x,y,1,7,PV[1]);
  // the bread bowl set into the paving: concentric warm rings round the doors
  for(const rr of[44,60,76]){g.strokeStyle=PV[3];g.lineWidth=rr===60?3:2;g.beginPath();g.ellipse(gx,gy+30,rr*1.5,rr,0,0,Math.PI);g.stroke()}g.restore();
 R(gx-26,gy+24,52,100,PV[2]);for(let y=gy+28;y<gy+124;y+=8)R(gx-26,y,52,1,N('#d4d2cb','#3a3e4c'));
 for(const sd of[-1,1])for(let r2=0;r2<2;r2++)for(let k2=0;k2<4;k2++){const tx=gx+sd*(70+r2*52+k2*8),ty=gy+34+k2*22;R(tx-6,ty-5,12,10,N('#8a8e96','#24262e'));R(tx-6,ty-5,12,1,N('#e6e4de','#3a3e4c'));((k2+r2)%3===0?hBlossom:hGreenTree)(g,tx,ty,7,night)}
 for(const sd of[-1,1])for(let k2=0;k2<4;k2++){const lx=gx+sd*42,ly=gy+30+k2*24;R(lx+1,ly+1,2,2,'rgba(0,0,0,.35)');R(lx-1,ly-1,3,3,'#1e2230');R(lx,ly,1,1,night?'#ffe7a8':'#d9d4c0')}
 // tall team banners along the walk
 for(const sd of[-1,1])for(let k2=0;k2<3;k2++){const bx=gx+sd*(34+k2*0)-3,by=gy+44+k2*26;R(bx+2,by+2,7,16,'rgba(0,0,0,.3)');R(bx+3,by-3,1,20,'#9aa0a8');R(bx,by,7,15,k2&1?'#d0202e':'#14244e');R(bx,by,7,1,'#f4ead8');R(bx+2,by+4,3,3,'#f4ead8');R(bx+1,by+10,5,1,'#f4ead8')}
 // the street across the front: crosswalks, a bus stop with a bus at it, streetlights
 {const ry=gy+126;R(gx-290,ry,580,14,N('#55595e','#24262a'));R(gx-290,ry,580,1,N('#c9c5bb','#3a3a3a'));R(gx-290,ry+13,580,1,N('#c9c5bb','#3a3a3a'));for(let x=gx-286;x<gx+286;x+=10)R(x,ry+6.5,5,1,N('#e8d27a','#6a6040'));
  for(const cxw of[gx,gx-160,gx+160])for(let x=cxw-14;x<cxw+14;x+=4)R(x,ry+1,2,12,N('#ece9e0','#5a5a58'));
  for(let x=gx-280;x<gx+280;x+=36){R(x,ry-3,2,2,'#1e2024');R(x,ry-3,1,1,night?'#ffe7a8':'#c9c5bb');R(x+12,ry+16,2,2,'#1e2024');R(x+12,ry+16,1,1,night?'#ffe7a8':'#c9c5bb')}
  const bsx=gx-112;R(bsx+2,ry-9,22,6,'rgba(0,0,0,.3)');R(bsx,ry-11,22,6,N('#3a4258','#1c2030'));R(bsx,ry-11,22,1,'#d0202e');R(bsx+2,ry-9,18,3,night?'#ffd48a':'#5a7ea8');
  R(bsx-36,ry+2,26,9,N('#2f55b0','#1a2c5c'));R(bsx-36,ry+2,26,1,N('#f4ead8','#6a6a70'));for(let x=bsx-34;x<bsx-12;x+=5)R(x,ry+4,4,3,night?'#ffd98a':'#bcd6e8')}
 // ---- the front follows the bowl round: glass bays between silver piers under a pale roof, awnings at their feet ----
 const RH=14,FH=22,FY=gy+6;
 {const ctr={x:gx,y:cy(HY)};const pts=OL.filter(q=>q.y>ctr.y+20&&Math.abs(q.x-gx)>40);
  const bays=[];for(const sd of[-1,1]){const side=pts.filter(q=>(q.x-gx)*sd>0).sort((a2,b2)=>Math.abs(a2.x-gx)-Math.abs(b2.x-gx));let acc=0,last=null;
   for(const q of side){if(last)acc+=Math.hypot(q.x-last.x,q.y-last.y);last=q;if(acc>=24||bays.filter(b2=>b2.sd===sd).length===0&&Math.abs(q.x-gx)>78){if(acc>230)break;bays.push({q,sd,i:bays.length});acc=0}}}
  for(const pass of[0,1])for(const{q,sd,i}of bays){const dx=q.x-ctr.x,dy=q.y-ctr.y,l=Math.hypot(dx,dy),nx=dx/l,ny=dy/l,ang=Math.atan2(ny,nx)-Math.PI/2;
   g.save();g.translate(Math.round(q.x+nx*2),Math.round(q.y+ny*2));g.rotate(ang);
   if(pass===0){R(-12+5,-RH+4,25,RH+FH+2,'rgba(10,8,12,.3)');g.restore();continue}
   R(-13,-RH,26,RH,N('#d0d5dc','#4a5060'));R(-13,-RH,26,1,N('#eef1f5','#6a7080'));for(let x=-12;x<13;x+=3)R(x,-RH+1,1,RH-2,N('#bcc4ce','#3e4452'));R(-9,-RH+4,18,5,N('#5a7ea8','#243a5a'));R(-13,-2,26,2,'#d0202e');
   R(-13,0,26,FH,N('#c9d0d8','#3a4050'));R(-10,2,20,FH-9,night?'#ffbe5c':'#2c4468');if(night){R(-10,2,20,1,'#ffe49a');for(let y=6;y<FH-8;y+=4)R(-10,y,20,1,'#f2a440')}else R(-10,2,20,3,'#5a7ea8');
   for(let x=-10;x<=10;x+=5)R(x,2,1,FH-9,N('#1c2a4a','#101830'));
   // the shopfront at its foot: a striped awning (red and cream for the bakeries, navy for the rest), a lit window
   for(let x=-11;x<11;x+=4){R(x,FH-7,2,3,i%3===0?'#d0202e':'#14244e');R(x+2,FH-7,2,3,'#f4ead8')}R(-10,FH-4,20,3,night?'#ffe49a':'#3a4a5c');R(-13,FH-1,26,1,N('#8a8e96','#24262e'));
   if(i%3===0){R(-4,-RH-5,8,5,N('#f4ead8','#8a8474'));R(-3,-RH-4,6,1,'#c98a3c');R(-2,-RH-3,4,2,'#e2a858')}// a loaf on the bakery's sign
   R(-15,-RH-1,3,RH+FH+1,N('#eef1f5','#5a6274'));R(12,-RH-1,3,RH+FH+1,N('#8a94a2','#2a3040'));
   g.restore()}}
 // ---- the centre: the Bread Bowl. A glass hall under a rounded silver roof, wings stepping down either side ----
 const W2=62,CT=FY-FH-RH-26;
 R(gx-W2-34+8,CT+10,(W2+34)*2,FY-CT,'rgba(0,0,0,.3)');
 // the wings: glass under flat pale roofs
 for(const sd of[-1,1]){const wx0=sd<0?gx-W2-36:gx+W2,ww=36,wt=CT+16;
  R(wx0,wt,ww,12,N('#d0d5dc','#4a5060'));R(wx0,wt,ww,1,N('#eef1f5','#6a7080'));for(let x=wx0+1;x<wx0+ww;x+=4)R(x,wt+1,1,10,N('#bcc4ce','#3e4452'));R(wx0,wt+11,ww,1,'#d0202e');
  R(wx0,wt+12,ww,FY-wt-12,night?'#ffbe5c':'#2c4468');if(night)for(let y=wt+15;y<FY-3;y+=5)R(wx0,y,ww,1,'#f2a440');else R(wx0,wt+12,ww,3,'#5a7ea8');
  for(let x=wx0;x<=wx0+ww;x+=6)R(x,wt+12,1,FY-wt-12,N('#1c2a4a','#101830'));R(wx0,wt+12+Math.round((FY-wt-12)*.5),ww,1,N('#1c2a4a','#101830'));
  for(let x=wx0+1;x<wx0+ww-1;x+=4){R(x,FY-8,2,3,'#d0202e');R(x+2,FY-8,2,3,'#f4ead8')}R(wx0,FY-2,ww,2,N('#8a8e96','#24262e'))}
 // the rounded roof: a silver dome flattened from above, ribs fanning over a band of glass, a red line at its eave
 g.fillStyle=N('#c3c9d2','#444a5a');g.beginPath();g.ellipse(gx,CT+20,W2+4,24,0,Math.PI,0);g.closePath();g.fill();
 g.fillStyle=N('#d6dbe2','#525868');g.beginPath();g.ellipse(gx,CT+20,W2,21,0,Math.PI,0);g.closePath();g.fill();
 g.fillStyle=N('#5a7ea8','#243a5a');g.beginPath();g.ellipse(gx,CT+20,W2-10,14,0,Math.PI,0);g.closePath();g.fill();g.fillStyle=N('#d6dbe2','#525868');g.beginPath();g.ellipse(gx,CT+20,W2-22,8,0,Math.PI,0);g.closePath();g.fill();
 g.strokeStyle=N('#8a94a2','#2a3040');g.lineWidth=1;g.beginPath();for(let a=-78;a<=78;a+=13){const ar=a*RAD;g.moveTo(gx,CT+20);g.lineTo(gx+Math.sin(ar)*W2,CT+20-Math.cos(ar)*21)}g.stroke();
 g.strokeStyle=N('#eef1f5','#6a7080');g.lineWidth=1;g.beginPath();g.ellipse(gx,CT+20,W2+4,24,0,Math.PI,0);g.stroke();
 R(gx-W2-4,CT+19,(W2+4)*2,2,'#d0202e');R(gx-W2-4,CT+21,(W2+4)*2,2,N('#1c2a4a','#101830'));
 // the glass hall: tall panes in deep-blue frames, a mezzanine line, warm inside at night
 const gy0=CT+23,gh=FY-gy0-10;R(gx-W2,gy0,W2*2,gh,night?'#ffbe5c':'#2c4468');
 if(night){for(let y=gy0+2;y<gy0+gh;y+=5)R(gx-W2,y,W2*2,1,'#f2a440');R(gx-W2,gy0,W2*2,2,'#ffe49a')}else{for(let x=gx-W2;x<gx+W2;x+=16)R(x+3,gy0,5,gh,'#5a7ea8');R(gx-W2,gy0,W2*2,2,'#243a5a')}
 for(let x=gx-W2;x<=gx+W2;x+=8){R(x,gy0,2,gh,N('#1c2a4a','#101830'));R(x,gy0,1,gh,N('#aab2be','#3a4258'))}R(gx-W2,gy0+Math.round(gh*.5),W2*2,2,N('#1c2a4a','#101830'));
 // DAEJEON BEARS across the glass on a navy band
 R(gx-52,gy0+4,104,14,'#14244e');R(gx-52,gy0+4,104,1,'#d0202e');R(gx-52,gy0+17,104,1,'#0c1634');
 g.textAlign='center';g.textBaseline='middle';g.fillStyle=night?'#ffe49a':'#f4ead8';g.font='bold 10px "Pixelify Sans", monospace';g.fillText('DAEJEON BEARS',gx,gy0+11.5);
 // the portal: a low arch in warm stone, BREAD BOWL PARK lit along it, the doors under it
 const py0=FY-10;g.fillStyle=N('#c9a878','#6a5236');g.beginPath();g.moveTo(gx-50,FY);g.lineTo(gx-50,py0-2);g.quadraticCurveTo(gx,py0-22,gx+50,py0-2);g.lineTo(gx+50,FY);g.closePath();g.fill();
 g.fillStyle=N('#8a6a44','#3a2c1c');g.beginPath();g.moveTo(gx-44,FY);g.lineTo(gx-44,py0+1);g.quadraticCurveTo(gx,py0-12,gx+44,py0+1);g.lineTo(gx+44,FY);g.closePath();g.fill();
 g.fillStyle=night?'#ffe49a':'#3a4a5c';g.beginPath();g.moveTo(gx-41,FY);g.lineTo(gx-41,py0+3);g.quadraticCurveTo(gx,py0-8,gx+41,py0+3);g.lineTo(gx+41,FY);g.closePath();g.fill();
 for(let i=0;i<7;i++){const dx=gx-39+i*12;R(dx,FY-7,1,7,'#1a1c20');R(dx+5.5,FY-6,1,6,N('#56607a','#2a3040'))}R(gx-41,FY-8,82,1,'#1a1c20');
 g.fillStyle=night?'#ffe49a':'#3a2410';g.font='bold 7px "Pixelify Sans", monospace';g.fillText('BREAD BOWL PARK',gx,py0-7.5);
 // wheat either side of the name
 for(const sd of[-1,1]){const wxp=gx+sd*40;R(wxp,py0-10,1,6,'#e2a858');for(let k2=0;k2<3;k2++){R(wxp-2,py0-10+k2*2,2,1,'#e2a858');R(wxp+1,py0-9+k2*2,2,1,'#e2a858')}}
 // the emblem over it all, in a navy medallion on the roof's edge
 if(LOGO[k]){g.imageSmoothingEnabled=false;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(gx+2,CT+12,16,0,7);g.fill();g.fillStyle='#14244e';g.beginPath();g.arc(gx,CT+10,16,0,7);g.fill();g.strokeStyle='#f4ead8';g.lineWidth=2;g.stroke();g.strokeStyle='#d0202e';g.lineWidth=1;g.beginPath();g.arc(gx,CT+10,13.5,0,7);g.stroke();g.drawImage(LOGO[k],gx-12,CT-2,24,24)}
 // people at the doors and across the plaza
 const pc=['#14244e','#d0202e','#f4ead8','#3b5cae','#2a2a30','#e8b44a'];for(let i=0;i<70;i++){const h=vHash(i,1311),px=gx-110+(h%220),py=FY+6+((h>>>8)%108);if(Math.abs(px-gx)>40&&((h>>>4)&1))continue;R(px,py,1,2,pc[h%pc.length]);R(px,py-1,1,1,night?'#6a5040':'#e8c8a8')}}
