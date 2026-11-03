// ---------- the city around the ballpark (Seoul for now): seen when the camera is wider than the park ----------
// Drawn once per park/time of day at half resolution. City pixel (cx,cy) is world pixel (cx*2-CITY_M, cy*2).
const CITY_M=1100;let CITY=null,CITY_KEY='';
function cityFor(){if(S.you!=='seoul'||S.mode==='bp')return null;const key=S.you+(S.night?'n':'d');if(CITY_KEY!==key){CITY=buildCity(!!S.night);CITY_KEY=key}return CITY}
function buildCity(night){
 const CW=Math.round((W+CITY_M*2)/2),CH=Math.round(H/2),c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
 const rr=mulberry32(hash('seoul-city')),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const L0=0,L1=CITY_M/2,R0=(CITY_M+W)/2,R1=CW;// left strip [L0,L1), right strip [R0,R1)
 const col=night?{ground:'#1a1f26',road:'#0e1116',lane:'#3a3420',block:'#20262e',park:'#14241a',water:'#0b1a33',bank:'#1a2a22',roofs:['#242a33','#2b313b','#1f242c','#30343c','#262b22']}
  :{ground:'#9aa1a6',road:'#5b6167',lane:'#e8e2c8',block:'#b9bdbf',park:'#5f9a4c',water:'#3d7fb8',bank:'#7fae62',roofs:['#c9c6bd','#a9b1b8','#d8d0c0','#8f98a2','#b7a48c','#cfd6dc','#9aa38a']};
 R(0,0,CW,CH,col.ground);
 // ---- left strip: the Han River flowing top to bottom, riverside parks, bridges ----
 const rvX=L1-236,rvW=124;// the river runs just west of the park so it shows in a widescreen viewR(rvX-26,0,26,CH,col.bank);R(rvX+rvW,0,26,CH,col.bank);
 for(let i=0;i<60;i++){R(rvX-24+rr()*22,rr()*CH,3,3,night?'#1d3324':'#3f7a37');R(rvX+rvW+2+rr()*22,rr()*CH,3,3,night?'#1d3324':'#3f7a37')}
 R(rvX,0,rvW,CH,col.water);
 g.globalAlpha=night?.35:.25;for(let i=0;i<80;i++)R(rvX+rr()*rvW,rr()*CH,4+rr()*8,1,night?'#6a7fb0':'#d8ecff');g.globalAlpha=1;
 const bridges=[90,300,520];
 bridges.forEach((by,bi)=>{R(rvX-30,by,rvW+60,12,night?'#2a2f38':'#8d939a');R(rvX-30,by,rvW+60,1,night?'#3b414c':'#b7bcc1');R(rvX-30,by+11,rvW+60,1,'#00000040');
  for(let x=rvX-28;x<rvX+rvW+28;x+=6){R(x,by+5,3,1,col.lane)}
  if(night){const lc=bi===1?['#ff6fb5','#ffe36b','#6fffd2','#6fb8ff']:['#ffd27a'];for(let x=rvX-28,k=0;x<rvX+rvW+28;x+=5,k++){R(x,by-1,1,1,lc[k%lc.length]);R(x,by+12,1,1,lc[(k+2)%lc.length])}
   if(bi===1){g.globalAlpha=.25;for(let x=rvX;x<rvX+rvW;x+=3)R(x,by+13,2,6+((x*7)%9),['#ff6fb5','#ffe36b','#6fffd2','#6fb8ff'][(x/3|0)%4]);g.globalAlpha=1}}});
 // blocks of the left strip (between the river and the park)
 const blocks=(x0,x1,seedTag,dense)=>{for(let y=4;y<CH-4;){const bh=26+Math.floor(rr()*34);for(let x=x0;x<x1-10;){const bw=24+Math.floor(rr()*40),w2=Math.min(bw,x1-x-6);
     R(x,y,w2,bh,col.block);
     // buildings inside the block, each with a shadow to the lower right
     for(let k=0;k<(dense?3:2);k++){const w=6+rr()*(w2-10),h=6+rr()*(bh-10),bx=x+2+rr()*(w2-w-4),byy=y+2+rr()*(bh-h-4),tall=dense?2+rr()*6:1+rr()*3;
      R(bx+tall,byy+tall,w,h,night?'#0a0c10':'#00000030');const rc=col.roofs[Math.floor(rr()*col.roofs.length)];R(bx,byy,w,h,rc);R(bx,byy,w,1,night?'#3a404a':'#ffffff60');
      if(night){for(let wy=byy+2;wy<byy+h-1;wy+=3)for(let wx=bx+2;wx<bx+w-1;wx+=3)if(rr()<.4)R(wx,wy,1,1,rr()<.85?'#ffd98a':'#bfe3ff')}
      else if(rr()<.35){R(bx+2,byy+2,3,2,'#7e8a94');R(bx+w-5,byy+h-4,3,2,'#6f7b84')}}
     if(rr()<.18){R(x+2,y+2,w2-4,bh-4,col.park);for(let t=0;t<6;t++){g.fillStyle=night?'#183020':'#3f8a3c';g.beginPath();g.arc(x+4+rr()*(w2-8),y+4+rr()*(bh-8),2.5,0,Math.PI*2);g.fill()}}
     x+=w2+8}
    y+=bh+8}};
 blocks(rvX+rvW+30,L1-14,'L',false);blocks(4,rvX-30,'L2',false);
 // ---- right strip: downtown, a supertall tower and the hill with the broadcast tower ----
 blocks(R0+14,R1-4,'R',true);
 // the hill (Namsan-style) with its tower near the top right
 {const hx=R0+150,hy=CH*.24,hr=62;const gr=g.createRadialGradient(hx,hy,10,hx,hy,hr);gr.addColorStop(0,night?'#1d3a24':'#5f9a4c');gr.addColorStop(1,night?'#14241a':'#4f8a40');g.fillStyle=gr;g.beginPath();g.ellipse(hx,hy,hr,hr*.8,0,0,Math.PI*2);g.fill();
  for(let t=0;t<70;t++){const a=rr()*6.28,d=rr()*hr*.9;g.fillStyle=night?'#183020':'#3f7a37';g.beginPath();g.arc(hx+Math.cos(a)*d,hy+Math.sin(a)*d*.8,3,0,Math.PI*2);g.fill()}
  g.strokeStyle=night?'#2a2f38':'#c9bba0';g.lineWidth=2;g.beginPath();g.moveTo(hx-hr,hy+20);g.quadraticCurveTo(hx-20,hy+10,hx,hy);g.stroke();
  // tower: round deck seen from above, a long shadow, a red beacon
  g.fillStyle=night?'#05070b':'#00000040';g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+70,hy+52);g.lineTo(hx+66,hy+56);g.lineTo(hx-3,hy+3);g.fill();
  R(hx-7,hy-7,14,14,night?'#d8dde6':'#e8e4dc');g.fillStyle=night?'#9fb4d8':'#c9d4de';g.beginPath();g.arc(hx,hy,5,0,Math.PI*2);g.fill();R(hx-1,hy-1,2,2,'#e0473d');
  if(night){const bl=g.createRadialGradient(hx,hy,2,hx,hy,26);bl.addColorStop(0,'rgba(255,220,150,.45)');bl.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=bl;g.fillRect(hx-26,hy-26,52,52)}}
 // the supertall: a tapering square with a very long shadow
 {const tx=R0+92,ty=CH*.64;g.fillStyle=night?'#05070b':'#00000048';g.beginPath();g.moveTo(tx-8,ty-8);g.lineTo(tx+8,ty-8);g.lineTo(tx+150,ty+110);g.lineTo(tx+134,ty+120);g.closePath();g.fill();
  for(let k=0;k<4;k++){const s=16-k*3.5;R(tx-s,ty-s,s*2,s*2,night?['#2a3140','#344050','#3e4c60','#53657e'][k]:['#9fb0bf','#b3c2cf','#c7d4de','#e1e8ee'][k])}
  R(tx-1,ty-1,2,2,night?'#ffffff':'#7e8a94');if(night){const bl=g.createRadialGradient(tx,ty,2,tx,ty,30);bl.addColorStop(0,'rgba(160,200,255,.4)');bl.addColorStop(1,'rgba(160,200,255,0)');g.fillStyle=bl;g.fillRect(tx-30,ty-30,60,60)}}
 // ---- avenues: a big road hugging each side of the park, cross streets every block or two ----
 const vroad=(x,w)=>{R(x,0,w,CH,col.road);for(let y=0;y<CH;y+=8)R(x+w/2-.5,y,1,4,col.lane);if(night)for(let y=4;y<CH;y+=14){R(x-1,y,1,1,'#ffe0a0');R(x+w,y+7,1,1,'#ffe0a0')}};
 const hroad=(x0,x1,y,h)=>{R(x0,y,x1-x0,h,col.road);for(let x=x0;x<x1;x+=8)R(x,y+h/2-.5,4,1,col.lane)};
 vroad(L1-12,10);vroad(R0+2,10);vroad(rvX-38,8);
 for(const y of[60,230,410,600])hroad(rvX+rvW+30,L1-12,y,6);for(const y of[150,350,560])hroad(R0+12,R1,y,7);
 // stadium plazas and parking right outside the park walls, with cars
 const lot=(x,y,w,h)=>{R(x,y,w,h,night?'#15191f':'#7d848a');for(let yy=y+3;yy<y+h-3;yy+=7)for(let xx=x+3;xx<x+w-5;xx+=5){R(xx,yy,1,5,night?'#2a2f36':'#c9cdd0');if(rr()<.55){const cc=['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24','#d9b04a'][Math.floor(rr()*6)];R(xx+1,yy+1,3,4,cc);if(night)R(xx+1,yy+1,3,1,'#00000060')}}};
 lot(L1-60,CH-150,46,140);lot(R0+18,CH-170,50,160);
 // moving-traffic lights baked as streaks at night, little cars by day
 for(let i=0;i<90;i++){const onL=rr()<.5,x=onL?(L1-12+2+(rr()<.5?0:5)):(R0+4+(rr()<.5?0:5)),y=rr()*CH;
  if(night){R(x,y,1,3,rr()<.5?'#fff3c8':'#ff4a3a')}else R(x,y,2,4,['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24'][Math.floor(rr()*5)])}
 // soft fade into the park's outer wall
 for(const[x0,dir]of[[L1,-1],[R0,1]]){const gr=g.createLinearGradient(x0,0,x0+dir*30,0);gr.addColorStop(0,night?'rgba(5,8,12,.85)':'rgba(40,45,50,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(Math.min(x0,x0+dir*30),0,30,CH)}
 if(night){g.globalAlpha=.25;g.fillStyle='#0b1430';g.fillRect(0,0,CW,CH);g.globalAlpha=1}
 return c}
