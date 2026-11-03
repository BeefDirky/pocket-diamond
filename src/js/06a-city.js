// ---------- outside the park: the stadium's outer wall and the neighborhood around it ----------
// The park buffer is W x H; the neighborhood reaches EXT().mx/my beyond it and is drawn once per park and time of day
// at half resolution. Neighborhood pixel (cx,cy) is world pixel (cx*2-mx, cy*2-my).
let PARK_OUTLINE=null,OUT_CV=null,OUT_KEY='';
function parkOutline(){
 // a ballpark footprint shaped like a wide V: a pointed (lightly rounded) tip behind home, long straight arms
 // running up and out behind the foul lines to wide wings at the corners, then the roofline angling back in
 // toward center field, with a short flat top. Slight smoothing keeps the corners crisp but not jagged.
 const sx=W/2-6,tipY=H-6,wingY=Math.round(tipY-sx*1.12),wing2Y=wingY-70,shX=W*.27,shY=64,topY=14;
 const half=[[0,tipY],[sx,wingY],[sx,wing2Y],[shX,shY],[shX*.35,topY]];
 let pts=[...half,...half.slice(1).reverse().map(([x,y])=>[-x,y])];
 const chaikin=P=>{const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];
   out.push([a[0]*.85+b[0]*.15,a[1]*.85+b[1]*.15],[a[0]*.15+b[0]*.85,a[1]*.15+b[1]*.85])}return out};
 pts=chaikin(pts);pts=chaikin(pts);
 return pts.map(([x,y])=>({x:HX+x,y}))}
function insidePoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
function outsideFor(){const key=S.you+(S.night?'n':'d')+(STADIUMS[S.you]?STADIUMS[S.you].dims.join(','):'');
 if(OUT_KEY!==key){PARK_OUTLINE=parkOutline();OUT_CV=buildOutside(S.you,!!S.night);OUT_KEY=key}return OUT_CV}
function buildOutside(k,night){
 const e=EXT_M,CW=Math.round((W+2*e.mx)/2),CH=Math.round((H+2*e.my)/2),c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
 const rr=mulberry32(hash(k+'-outside')),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const cx=x=>(x+e.mx)/2,cy=y=>(y+e.my)/2,T=TEAMS[k];
 const seoul=k==='seoul',coast=k==='busan'||k==='incheon'||k==='ulsan';
 const col=night?{ground:'#171c22',road:'#0d1015',lane:'#3a3420',block:'#1d232b',plaza:'#232830',park:'#13231a',water:'#0a1a33',bank:'#18291f',roofs:['#242a33','#2b313b','#1f242c','#30343c','#262b22']}
  :{ground:'#a3a9ad',road:'#5b6167',lane:'#ece6cc',block:'#bcc0c2',plaza:'#d6d2c8',park:'#62a04e',water:'#3d7fb8',bank:'#86b46a',roofs:['#c9c6bd','#a9b1b8','#d8d0c0','#8f98a2','#b7a48c','#cfd6dc','#9aa38a']};
 R(0,0,CW,CH,col.ground);
 const OL=PARK_OUTLINE.map(q=>({x:cx(q.x),y:cy(q.y)}));
 const near=(x,y,pad)=>{if(insidePoly(OL,x,y))return true;for(let a=0;a<6.28;a+=.8)if(insidePoly(OL,x+Math.cos(a)*pad,y+Math.sin(a)*pad))return true;return false};
 // water band along the top: the Han River for Seoul, the sea for the coastal clubs
 const wTop=cy(-330),wBot=cy(-95),hasWater=seoul||coast;
 const inWater=(y,h)=>hasWater&&y+h>wTop-14&&y<wBot+14;
 // plaza ring: concrete apron with trees around the outer wall
 g.save();g.beginPath();OL.forEach((q,i)=>{const dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=34;g[i?'lineTo':'moveTo'](q.x+dx/l*o,q.y+dy/l*o)});g.closePath();g.fillStyle=col.plaza;g.fill();g.restore();
 // ring road just outside the plaza
 g.save();g.beginPath();OL.forEach((q,i)=>{const dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=48;g[i?'lineTo':'moveTo'](q.x+dx/l*o,q.y+dy/l*o)});g.closePath();g.strokeStyle=col.road;g.lineWidth=14;g.stroke();
 g.setLineDash([4,5]);g.strokeStyle=col.lane;g.lineWidth=1;g.stroke();g.restore();
 // plaza trees + lamp posts
 for(let i=0;i<OL.length;i+=2){const q=OL[i],dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=20+rr()*8,x=q.x+dx/l*o,y=q.y+dy/l*o;
  if(rr()<.7){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+2,y+2,4,0,7);g.fill();g.fillStyle=night?'#183020':'#3f8a3c';g.beginPath();g.arc(x,y,4,0,7);g.fill();g.fillStyle=night?'#22402a':'#5aa64c';g.beginPath();g.arc(x-1,y-1,2,0,7);g.fill()}
  else if(night){const gr=g.createRadialGradient(x,y,0,x,y,10);gr.addColorStop(0,'rgba(255,225,150,.5)');gr.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=gr;g.fillRect(x-10,y-10,20,20)}}
 // avenues: a grid around the park
 const roadsV=[],roadsH=[];for(let x=18;x<CW;x+=90+Math.floor(rr()*40))roadsV.push(x);for(let y=16;y<CH;y+=80+Math.floor(rr()*36))roadsH.push(y);
 // city blocks between the avenues, skipping the park, the plaza and the water
 for(let bi=0;bi<roadsV.length;bi++)for(let bj=0;bj<roadsH.length;bj++){const x0=roadsV[bi]+7,y0=roadsH[bj]+7,x1=(roadsV[bi+1]||CW+7)-5,y1=(roadsH[bj+1]||CH+7)-5;if(x1-x0<16||y1-y0<16)continue;
  // split each block into lots
  for(let y=y0;y<y1-8;){const lh=Math.min(y1-y,14+Math.floor(rr()*22));for(let x=x0;x<x1-8;){const lw=Math.min(x1-x,14+Math.floor(rr()*26));
    if(!near(x+lw/2,y+lh/2,Math.max(lw,lh)*.6+46)&&!inWater(y,lh)){
     const kind=rr();
     if(kind<.12){R(x,y,lw-3,lh-3,col.park);for(let t=0;t<4;t++){g.fillStyle=night?'#183020':'#3f8a3c';g.beginPath();g.arc(x+3+rr()*(lw-8),y+3+rr()*(lh-8),2.5,0,7);g.fill()}}
     else if(kind<.2){R(x,y,lw-3,lh-3,night?'#14181d':'#868c91');for(let yy=y+2;yy<y+lh-5;yy+=5)for(let xx=x+2;xx<x+lw-6;xx+=4)if(rr()<.5)R(xx,yy,2,3,['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#d9b04a'][Math.floor(rr()*5)])}
     else{const tall=1+rr()*(seoul?7:4),w=lw-3,h=lh-3;R(x+tall,y+tall,w,h,night?'#07090c':'rgba(0,0,0,.22)');const rc=col.roofs[Math.floor(rr()*col.roofs.length)];R(x,y,w,h,rc);R(x,y,w,1,night?'#3a404a':'rgba(255,255,255,.4)');
      if(night){for(let wy=y+2;wy<y+h-1;wy+=3)for(let wx=x+2;wx<x+w-1;wx+=3)if(rr()<.38)R(wx,wy,1,1,rr()<.85?'#ffd98a':'#bfe3ff')}
      else if(rr()<.4){R(x+2,y+2,3,2,'#7e8a94');if(w>10)R(x+w-5,y+h-4,3,2,'#6f7b84')}}}
    x+=lw}y+=lh}}
 // draw the avenues over the lots (they stop at the plaza and the water)
 for(const x of roadsV)for(let y=0;y<CH;y+=2)if(!near(x+3,y,40)&&!inWater(y,2)){R(x,y,6,2,col.road);if(y%8===0)R(x+2.5,y,1,1,col.lane);if(night&&y%14===0){R(x-1,y,1,1,'#ffe0a0');R(x+6,y,1,1,'#ffe0a0')}}
 for(const y of roadsH)for(let x=0;x<CW;x+=2)if(!near(x,y+3,40)&&!inWater(y,6)){R(x,y,2,6,col.road);if(x%8===0)R(x,y+2.5,1,1,col.lane)}
 // traffic
 for(let i=0;i<160;i++){const vert=rr()<.5,x=vert?roadsV[Math.floor(rr()*roadsV.length)]+1+(rr()<.5?0:3):rr()*CW,y=vert?rr()*CH:roadsH[Math.floor(rr()*roadsH.length)]+1+(rr()<.5?0:3);
  if(near(x,y,40)||inWater(y,1))continue;if(night)R(x,y,vert?1:3,vert?3:1,rr()<.5?'#fff3c8':'#ff4a3a');else R(x,y,vert?2:4,vert?4:2,['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24'][Math.floor(rr()*5)])}
 // big parking lots on the first- and third-base sides
 for(const sd of[-1,1]){const p=toPx(sd*300,-60),x=cx(p.x)+(sd<0?-70:0),y=cy(p.y);if(near(x+35,y+40,10))continue;R(x,y,70,90,night?'#14181d':'#80878c');
  for(let yy=y+3;yy<y+87;yy+=7)for(let xx=x+3;xx<x+66;xx+=5){R(xx,yy,1,5,night?'#2a2f36':'#cfd2d4');if(rr()<.6)R(xx+1,yy+1,3,4,['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24','#d9b04a'][Math.floor(rr()*6)])}}
 // ---- water along the top ----
 if(hasWater){R(0,wTop-12,CW,12,col.bank);R(0,wBot,CW,12,col.bank);for(let i=0;i<120;i++){R(rr()*CW,wTop-11+rr()*9,3,3,night?'#1d3324':'#3f7a37');R(rr()*CW,wBot+1+rr()*9,3,3,night?'#1d3324':'#3f7a37')}
  const wg2=g.createLinearGradient(0,wTop,0,wBot);wg2.addColorStop(0,shade(col.water,-.15));wg2.addColorStop(1,col.water);g.fillStyle=wg2;g.fillRect(0,wTop,CW,wBot-wTop);
  g.globalAlpha=night?.35:.25;for(let i=0;i<160;i++)R(rr()*CW,wTop+rr()*(wBot-wTop),5+rr()*9,1,night?'#6a7fb0':'#d8ecff');g.globalAlpha=1;
  if(seoul){// bridges across the Han, one lit in rainbow colors at night
   [cx(-420),cx(260),cx(1020),cx(1700)].forEach((bx,bi)=>{R(bx,wTop-14,12,wBot-wTop+28,night?'#2a2f38':'#8d939a');R(bx,wTop-14,1,wBot-wTop+28,night?'#3b414c':'#b7bcc1');R(bx+11,wTop-14,1,wBot-wTop+28,'rgba(0,0,0,.25)');
    for(let y=wTop-12;y<wBot+14;y+=6)R(bx+5.5,y,1,3,col.lane);
    if(night){const lc=bi===1?['#ff6fb5','#ffe36b','#6fffd2','#6fb8ff']:['#ffd27a'];for(let y=wTop-12,q=0;y<wBot+14;y+=4,q++){R(bx-1,y,1,1,lc[q%lc.length]);R(bx+12,y,1,1,lc[(q+2)%lc.length])}
     if(bi===1){g.globalAlpha=.3;for(let y=wTop;y<wBot;y+=3)R(bx+13,y,7+((y*7)%9),2,lc[(y/3|0)%4]);g.globalAlpha=1}}});
   // a sightseeing boat
   R(cx(-60),wTop+30,18,6,night?'#3a3f4a':'#f4f1e8');R(cx(-60)+4,wTop+31,8,3,night?'#ffd98a':'#c94a3a')}
  else{for(let i=0;i<5;i++){const bx=rr()*CW,by=wTop+10+rr()*(wBot-wTop-20);R(bx,by,14,5,night?'#3a3f4a':'#e8e4dc');R(bx+3,by-2,5,2,'#c94a3a');if(night)R(bx+1,by+1,1,1,'#ffd98a')}}}
 // ---- Seoul landmarks: the tower on its wooded hill across the river, and a supertall downtown ----
 if(seoul){
  {const hx=cx(1650),hy=cy(-760<-e.my?-600:-610)+0,hr=58;const hy2=Math.max(30,wTop-70);const gr=g.createRadialGradient(hx,hy2,8,hx,hy2,hr);gr.addColorStop(0,night?'#1d3a24':'#5f9a4c');gr.addColorStop(1,night?'#14241a':'#4f8a40');g.fillStyle=gr;g.beginPath();g.ellipse(hx,hy2,hr*1.3,hr*.7,0,0,7);g.fill();
   for(let t=0;t<60;t++){const a=rr()*6.28,d=rr()*hr;g.fillStyle=night?'#183020':'#3f7a37';g.beginPath();g.arc(hx+Math.cos(a)*d*1.2,hy2+Math.sin(a)*d*.6,3,0,7);g.fill()}
   g.fillStyle=night?'#05070b':'rgba(0,0,0,.28)';g.beginPath();g.moveTo(hx,hy2);g.lineTo(hx+60,hy2+40);g.lineTo(hx+56,hy2+44);g.lineTo(hx-3,hy2+3);g.fill();
   R(hx-7,hy2-7,14,14,night?'#d8dde6':'#ece8e0');g.fillStyle=night?'#9fb4d8':'#c9d4de';g.beginPath();g.arc(hx,hy2,5,0,7);g.fill();R(hx-1,hy2-1,2,2,'#e0473d');
   if(night){const bl=g.createRadialGradient(hx,hy2,2,hx,hy2,26);bl.addColorStop(0,'rgba(255,220,150,.45)');bl.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=bl;g.fillRect(hx-26,hy2-26,52,52)}}
  {const tx=cx(W+330),ty=cy(380);g.fillStyle=night?'#05070b':'rgba(0,0,0,.3)';g.beginPath();g.moveTo(tx-9,ty-9);g.lineTo(tx+9,ty-9);g.lineTo(tx+140,ty+100);g.lineTo(tx+124,ty+110);g.closePath();g.fill();
   for(let q=0;q<4;q++){const s=17-q*3.8;R(tx-s,ty-s,s*2,s*2,night?['#2a3140','#344050','#3e4c60','#53657e'][q]:['#9fb0bf','#b3c2cf','#c7d4de','#e1e8ee'][q])}
   if(night){const bl=g.createRadialGradient(tx,ty,2,tx,ty,30);bl.addColorStop(0,'rgba(160,200,255,.4)');bl.addColorStop(1,'rgba(160,200,255,0)');g.fillStyle=bl;g.fillRect(tx-30,ty-30,60,60)}}
  // a subway entrance and a row of food stalls on the plaza behind home
  {const p=toPx(0,-95),x=cx(p.x),y=cy(p.y)+6;R(x-30,y,60,8,night?'#2a2f38':'#e8e4dc');for(let q=0;q<6;q++)R(x-28+q*10,y+1,8,5,[T.jersey,'#e0473d','#ffbf3c',T.cap,'#3faa5b','#e8e4dc'][q]);
   R(x+40,y-2,10,10,'#2f7a3a');R(x+42,y,6,6,night?'#ffd98a':'#f4f1e8')}}
 if(night){g.globalAlpha=.22;g.fillStyle='#0b1430';g.fillRect(0,0,CW,CH);g.globalAlpha=1}
 return c}
