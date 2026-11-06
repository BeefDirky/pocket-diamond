// ---------- outside the park: the stadium's outer wall and the neighborhood around it ----------
// The park buffer is W x H; the neighborhood reaches EXT().mx/my beyond it and is drawn once per park and time of day
// at half resolution. Neighborhood pixel (cx,cy) is world pixel (cx*2-mx, cy*2-my).
let PARK_OUTLINE=null,OUT_CV=null,OUT_KEY='';
// the original single-deck footprint; the infield grandstand now juts out one more deck past it (Dodger Stadium style)
function outlineFrom(half,right){let pts=[...(right||half),...half.slice(1).reverse().map(([x,y])=>[-x,y])];
 const chaikin=P=>{const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];
   out.push([a[0]*.85+b[0]*.15,a[1]*.85+b[1]*.15],[a[0]*.15+b[0]*.85,a[1]*.15+b[1]*.85])}return out};
 pts=chaikin(pts);pts=chaikin(pts);return pts.map(([x,y])=>({x:HX+x,y}))}
function parkOutlineInner(){return outlineFrom([[0,HY+400],[1000,HY-600],[1000,HY-800],[430,-150],[172,-200]])}
// the ballpark's outer wall: a wide V with a pointed tip behind home. The home-plate grandstand is one deck deeper
// than the rest, so the wall steps back in to the outfield pavilions out by the corners.
function parkOutlineClosed(){if(ST&&ST.harbor)return hOutline();return outlineFrom([[0,HY+580],[1170,HY-590],[1170,HY-690],[1030,HY-760],[1000,HY-820],[430,-150],[172,-200]])}
// Some parks leave the outfield open: the bowl stops in the corners and the country runs right up to the fence.
// The outline keeps its shape (it still decides where the park buffer shows), but the stretch across the outfield is
// flagged open: no outer wall, plaza or roof lights there. Both layers paint the same countryside, so it reads as one.
function parkOutline(){if(ST&&ST.harbor)return hOutline();const B=parkOutlineClosed(),cut=ST&&ST.openTop;if(!cut)return B;
 const ang=q=>Math.atan2(q.x-HX,HY-q.y)/RAD,isOpen=ST.harbor?q=>{const x=(q.x-HX)*FT,y=(HY-q.y)*FT,th=Math.atan2(x,y)/RAD;return hOwn(x,y,th,Math.hypot(x,y),y>0?fenceDist(th):0)>0}:q=>q.y<HY&&Math.abs(ang(q))<cut;
 const out=[];for(let i=0;i<B.length;i++){const a=B[i],b=B[(i+1)%B.length];a.open=isOpen(a);out.push(a);
  if(isOpen(a)!==isOpen(b)){let lo=0,hi=1;for(let k=0;k<30;k++){const m=(lo+hi)/2,q={x:a.x+(b.x-a.x)*m,y:a.y+(b.y-a.y)*m};if(isOpen(q)===isOpen(a))lo=m;else hi=m}
   out.push({x:a.x+(b.x-a.x)*lo,y:a.y+(b.y-a.y)*lo,open:false})}}
 return out}
// the outline's closed stretch as one run of points, starting just past the open gap
function closedRun(P){const n=P.length;let k=P.findIndex(q=>q.open);if(k<0)return P.slice();while(P[k%n].open)k++;const out=[];for(let i=0;i<n;i++){const q=P[(k+i)%n];if(q.open)break;out.push(q)}return out}
// a path along the outline that leaves out the open stretches
function outlinePath(P,tx,ty,c){c.beginPath();for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if(a.open||b.open)continue;c.moveTo(tx(a.x),ty(a.y));c.lineTo(tx(b.x),ty(b.y))}}
const hexRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function insidePoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
// a canvas that was read back pixel by pixel (getImageData) gets parked in main memory by the browser, and then has to
// be re-uploaded to the graphics card every frame it's drawn: an 11 MB upload, 60 times a second, once you zoom out
// far enough to see the neighborhood. Copying it into a fresh canvas that's never read keeps it on the card.
function gpuCopy(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c}
function outsideFor(){const key=S.you+(S.night?'n':'d')+(S.mode==='bp'&&S.phase!=='title'?'e':'')+(STADIUMS[S.you]?STADIUMS[S.you].dims.join(','):'');
 if(OUT_KEY!==key){PARK_OUTLINE=parkOutline();const hit=OUT_CACHE.get(key);if(hit){OUT_CV=hit[0];OUT_FEATHER=hit[1]}else{OUT_CV=gpuCopy(buildOutside(S.you,!!S.night,S.mode==='bp'&&S.phase!=='title'));OUT_FEATHER=buildFeather(OUT_CV);OUT_CACHE.set(key,[OUT_CV,OUT_FEATHER]);if(OUT_CACHE.size>2)OUT_CACHE.delete(OUT_CACHE.keys().next().value)}OUT_KEY=key}return OUT_CV}
// the last two neighborhoods built (a day/night switch or a quick back-and-forth costs nothing the second time)
const OUT_CACHE=new Map();
// the park buffer's straight edges would show as a seam where the extended stands begin: this overlay fades the
// extended stands in over the last stretch of the buffer (static, so it costs one drawImage a frame)
let OUT_FEATHER=null;
function buildFeather(src){const e=EXT_M,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');
 const x0=e.mx/2,y0=e.my/2,x1=(W+e.mx)/2,y1=(H+e.my)/2,B=14;
 const strip=(sx,sy,w,h,gx0,gy0,gx1,gy1)=>{const t=document.createElement('canvas');t.width=w;t.height=h;const q=t.getContext('2d');q.drawImage(src,sx,sy,w,h,0,0,w,h);
  q.globalCompositeOperation='destination-in';const gr=q.createLinearGradient(gx0,gy0,gx1,gy1);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,w,h);g.drawImage(t,sx,sy)};
 strip(x0,y0,B,y1-y0,0,0,B,0);strip(x1-B,y0,B,y1-y0,B,0,0,0);strip(x0,y0,x1-x0,B,0,0,0,B);strip(x0,y1-B,x1-x0,B,0,B,0,0);
 g.globalCompositeOperation='destination-in';g.beginPath();PARK_OUTLINE.forEach((q,i)=>g[i?'lineTo':'moveTo']((q.x+e.mx)/2,(q.y+e.my)/2));g.closePath();g.fill();
 return c}
function buildOutside(k,night,empty){// empty: batting practice, nobody in the seats
H_CITYN.apt=H_CITYN.school=H_CITYN.park=H_CITYN.com=0;
 const e=EXT_M,CW=Math.round((W+2*e.mx)/2),CH=Math.round((H+2*e.my)/2),c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
 const rr=mulberry32(hash(k+'-outside')),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const cx=x=>(x+e.mx)/2,cy=y=>(y+e.my)/2,T=TEAMS[k];
 const seoul=k==='seoul',coast=k==='busan'||k==='incheon'||k==='ulsan';
 const col=night?{ground:'#171c22',road:'#0d1015',lane:'#3a3420',block:'#1d232b',plaza:'#232830',park:'#13231a',water:'#0a1a33',bank:'#18291f',roofs:['#242a33','#2b313b','#1f242c','#30343c','#262b22']}
  :{ground:'#a3a9ad',road:'#5b6167',lane:'#ece6cc',block:'#bcc0c2',plaza:'#d6d2c8',park:'#62a04e',water:'#3d7fb8',bank:'#86b46a',roofs:['#c9c6bd','#a9b1b8','#d8d0c0','#8f98a2','#b7a48c','#cfd6dc','#9aa38a']};
 R(0,0,CW,CH,col.ground);
 const OL=PARK_OUTLINE.map(q=>({x:cx(q.x),y:cy(q.y),open:q.open}));
 const near=(x,y,pad)=>{if(insidePoly(OL,x,y))return true;for(let a=0;a<6.28;a+=.8)if(insidePoly(OL,x+Math.cos(a)*pad,y+Math.sin(a)*pad))return true;return false};
 if(STADIUMS[k].village)drawVillage(g,k,night,CW,CH,cx,cy,OL,rr,e);else{
 // water band along the top: the Han River for Seoul, the sea for the coastal clubs
 const wTop=cy(-660),wBot=cy(-420),hasWater=(seoul||coast)&&!STADIUMS[k].harbor;
 const inWater=(y,h)=>hasWater&&y+h>wTop-14&&y<wBot+14;
 // plaza ring: concrete apron with trees around the outer wall
 g.save();g.beginPath();OL.forEach((q,i)=>{const dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=34;g[i?'lineTo':'moveTo'](q.x+dx/l*o,q.y+dy/l*o)});g.closePath();g.fillStyle=col.plaza;g.fill();g.restore();
 // ring road just outside the plaza
 g.save();g.beginPath();OL.forEach((q,i)=>{const dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=48;g[i?'lineTo':'moveTo'](q.x+dx/l*o,q.y+dy/l*o)});g.closePath();g.strokeStyle=col.road;g.lineWidth=14;g.stroke();
 g.setLineDash([4,5]);g.strokeStyle=col.lane;g.lineWidth=1;g.stroke();g.restore();
 // plaza trees + lamp posts
 for(let i=0;i<OL.length;i+=2){const q=OL[i],dx=q.x-cx(HX),dy=q.y-cy(HY),l=Math.hypot(dx,dy)||1,o=20+rr()*8,x=q.x+dx/l*o,y=q.y+dy/l*o;
  if(rr()<.7){if(STADIUMS[k].harbor&&rr()<.6)hBlossom(g,x,y,4,night);else{hGreenTree(g,x,y,4,night)}}
  else if(night){const gr=g.createRadialGradient(x,y,0,x,y,10);gr.addColorStop(0,'rgba(255,225,150,.5)');gr.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=gr;g.fillRect(x-10,y-10,20,20)}}
 // avenues: a grid around the park
 const roadsV=[],roadsH=[];for(let x=18;x<CW;x+=90+Math.floor(rr()*40))roadsV.push(x);for(let y=16;y<CH;y+=80+Math.floor(rr()*36))roadsH.push(y);
 // city blocks between the avenues, skipping the park, the plaza and the water
 for(let bi=0;bi<roadsV.length;bi++)for(let bj=0;bj<roadsH.length;bj++){const x0=roadsV[bi]+7,y0=roadsH[bj]+7,x1=(roadsV[bi+1]||CW+7)-5,y1=(roadsH[bj+1]||CH+7)-5;if(x1-x0<16||y1-y0<16)continue;
  if(STADIUMS[k].harbor){const cl=[[x0,y0],[x1,y0],[x0,y1],[x1,y1],[(x0+x1)/2,(y0+y1)/2]].every(([x,y])=>!near(x,y,40)&&!inWater(y,1));if(cl){hCityBlock(g,x0,y0,x1,y1,night,rr);continue}}
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
 // the harbor city's avenues are lined with cherry trees, and city buses run them
 if(STADIUMS[k].harbor){for(const x of roadsV)for(let y=6;y<CH;y+=15)for(const sd of[-3,9])if(!near(x+sd,y,44)){const pink=((x*7+y*13)>>2)%5<3;if(pink)hBlossom(g,x+sd,y,3,night);else hGreenTree(g,x+sd,y,3,night)}
  for(const y of roadsH)for(let x=10;x<CW;x+=15)for(const sd of[-3,9])if(!near(x,y+sd,44)){const pink=((x*11+y*5)>>2)%5<3;if(pink)hBlossom(g,x,y+sd,3,night);else hGreenTree(g,x,y+sd,3,night)}
  for(let i=0;i<26;i++){const vert=rr()<.5,x=vert?roadsV[Math.floor(rr()*roadsV.length)]+1:rr()*CW,y=vert?rr()*CH:roadsH[Math.floor(rr()*roadsH.length)]+1;if(near(x,y,44))continue;
   g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+1,y+1,vert?4:11,vert?11:4);g.fillStyle='#2f6fd0';g.fillRect(x,y,vert?4:11,vert?11:4);g.fillStyle=night?'#ffe0a0':'#bfe3ff';if(vert)for(let q=1;q<10;q+=2)g.fillRect(x+.5,y+q,3,1);else for(let q=1;q<10;q+=2)g.fillRect(x+q,y+.5,1,3)}}
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
 if(night){g.globalAlpha=.22;g.fillStyle='#0b1430';g.fillRect(0,0,CW,CH);g.globalAlpha=1}}
if(STADIUMS[k].harbor){H_NIGHT=night;// the sea, the shipyard shore and the pier, lit like the park (the bowl itself is painted below)
  const mc=document.createElement('canvas');mc.width=CW;mc.height=CH;const mg=mc.getContext('2d');mg.beginPath();OL.forEach((q,i)=>mg[i?'lineTo':'moveTo'](q.x,q.y));mg.closePath();mg.fill();const md=mg.getImageData(0,0,CW,CH).data;
  const lt=night?[0x5a,0x64,0x94]:[0xff,0xf7,0xea],img=g.getImageData(0,0,CW,CH),d=img.data;
  // most of the canvas is plain city: sample each 8px tile on a 3x3 grid and skip it whole when nothing harbor-ish is there
  const TS=8,TW=Math.ceil(CW/TS),skip=new Uint8Array(TW*Math.ceil(CH/TS)),LW=Math.ceil(CW/4)+1,LH=Math.ceil(CH/4)+1,lat=new Uint8Array(LW*LH);
  for(let ly=0;ly<LH;ly++)for(let lx=0;lx<LW;lx++){const px=Math.min(CW-1,lx*4),py=Math.min(CH-1,ly*4);if(md[(py*CW+px)*4+3]>200){lat[ly*LW+lx]=0;continue}const c=harborCol((px+.5)*2-e.mx,(py+.5)*2-e.my);lat[ly*LW+lx]=H_SHADE?2:H_KIND===1?1:c?2:0}
  for(let ty=0;ty*TS<CH;ty++)for(let tx=0;tx<TW;tx++){let any=false,sea=0;for(let a2=0;a2<=2;a2++)for(let b2=0;b2<=2;b2++){const v=lat[Math.min(LH-1,ty*2+b2)*LW+Math.min(LW-1,tx*2+a2)];if(v===2)any=true;else if(v===1)sea++}if(!any)skip[ty*TW+tx]=sea===9?2:sea?0:1;if(!any&&sea&&sea<9)skip[ty*TW+tx]=0}
  for(let py=0;py<CH;py++){const wy=(py+.5)*2-e.my,trow=((py/TS)|0)*TW;for(let px=0;px<CW;px++){const sk=skip[trow+((px/TS)|0)];if(sk===1)continue;const j=(py*CW+px)*4;if(md[j+3]>200)continue;const wx=(px+.5)*2-e.mx;let c;if(sk===2){c=hSeaCol((wx-HX)*FT,(HY-wy)*FT,wx,wy);H_EMIS=false;H_SHADE=false}else c=harborCol(wx,wy);if(!c){if(H_SHADE){d[j]*=.7;d[j+1]*=.7;d[j+2]*=.74}continue}const em=H_EMIS&&night;d[j]=em?c[0]:c[0]*lt[0]/255;d[j+1]=em?c[1]:c[1]*lt[1]/255;d[j+2]=em?c[2]:c[2]*lt[2]/255;d[j+3]=255}}
  g.putImageData(img,0,0)}// the city dims at night; the stadium stays lit (the village is lit like the park)

 // ---- the stands keep going past the park buffer, out to the outer wall ----
 // Painted with the same rules the park buffer uses (rows that follow the wall, risers, aisles toward home, the upper
 // deck colors, the outfield features) and the same crowd on the same 8px grid, so the two halves read as one bowl.
 {const ST=STADIUMS[k],C=PARK_C,img=g.getImageData(0,0,CW,CH),d=img.data,N=CW*CH;
  const mc=document.createElement('canvas');mc.width=CW;mc.height=CH;const mg=mc.getContext('2d');mg.beginPath();OL.forEach((q,i)=>mg[i?'lineTo':'moveTo'](q.x,q.y));mg.closePath();mg.fill();
  const md=mg.getImageData(0,0,CW,CH).data;
  const IL=parkOutlineInner().map(q=>({x:cx(q.x),y:cy(q.y)}));
  const ic=document.createElement('canvas');ic.width=CW;ic.height=CH;const ig=ic.getContext('2d');ig.beginPath();IL.forEach((q,i)=>ig[i?'lineTo':'moveTo'](q.x,q.y));ig.closePath();ig.fillStyle='#000';ig.fill();
  ig.strokeStyle='#ff0000';ig.lineWidth=9;ig.stroke();
  const imd=ig.getImageData(0,0,CW,CH).data;// alpha: inside the old wall; red: the walkway ring along it
  const C3a=hexRGB(shade(ST.seat[0],-.18)),C3b=hexRGB(shade(ST.seat[1],-.18));
  const wX=px=>(px+.5)*2-e.mx,wY=py=>(py+.5)*2-e.my;
  // the playing field mask (same test as the park buffer), then the distance from it
  const A=new Int32Array(N),HB0=ST.harbor;// (the harbor park paints its own stands and needs none of this)
  if(!HB0)for(let py=0;py<CH;py++){const wy=wY(py),y=(HY-wy)*FT;for(let px=0;px<CW;px++){const x=(wX(px)-HX)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
   const fair=Math.abs(th)<=45&&y>=0,perp=(Math.abs(x)-y)/Math.SQRT2,along=(Math.abs(x)+y)/Math.SQRT2;
   A[py*CW+px]=(fair?r<fenceDist(th):((perp<40&&along<328&&along>-5)||r<34))?0:1e8}}
  if(!HB0)for(let py=0;py<CH;py++)for(let px=0;px<CW;px++){const i=py*CW+px;if(!A[i])continue;let v=A[i];
   if(px>0)v=Math.min(v,A[i-1]+3);if(py>0){v=Math.min(v,A[i-CW]+3);if(px>0)v=Math.min(v,A[i-CW-1]+4);if(px<CW-1)v=Math.min(v,A[i-CW+1]+4)}A[i]=v}
  if(!HB0)for(let py=CH-1;py>=0;py--)for(let px=CW-1;px>=0;px--){const i=py*CW+px;if(!A[i])continue;let v=A[i];
   if(px<CW-1)v=Math.min(v,A[i+1]+3);if(py<CH-1){v=Math.min(v,A[i+CW]+3);if(px<CW-1)v=Math.min(v,A[i+CW+1]+4);if(px>0)v=Math.min(v,A[i+CW-1]+4)}A[i]=v}
  // and the distance from the stands, for the stretch of outfield grass that pokes past the buffer near the poles
  const DI=new Int32Array(N);if(!HB0)for(let i=0;i<N;i++)DI[i]=A[i]?0:1e8;
  if(!HB0)for(let py=0;py<CH;py++)for(let px=0;px<CW;px++){const i=py*CW+px;if(!DI[i])continue;let v=DI[i];
   if(px>0)v=Math.min(v,DI[i-1]+3);if(py>0){v=Math.min(v,DI[i-CW]+3);if(px>0)v=Math.min(v,DI[i-CW-1]+4);if(px<CW-1)v=Math.min(v,DI[i-CW+1]+4)}DI[i]=v}
  if(!HB0)for(let py=CH-1;py>=0;py--)for(let px=CW-1;px>=0;px--){const i=py*CW+px;if(!DI[i])continue;let v=DI[i];
   if(px<CW-1)v=Math.min(v,DI[i+1]+3);if(py<CH-1){v=Math.min(v,DI[i+CW]+3);if(px<CW-1)v=Math.min(v,DI[i+CW+1]+4);if(px>0)v=Math.min(v,DI[i+CW-1]+4)}DI[i]=v}
 const seatM=new Uint8Array(N),EMIS=new Uint8Array(N);if(ST.harbor)H_NIGHT=night;
  // only the stretch outside the buffer (plus the strip the feather fades across) needs painting
  const bx0=cx(0)+16,by0=cy(0)+16,bx1=cx(W)-16,by1=cy(H)-16;
  const put=(i,c)=>{const j=i*4;d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];d[j+3]=255};
  for(let py=0;py<CH;py++){const wy=wY(py),y=(HY-wy)*FT;for(let px=0;px<CW;px++){const i=py*CW+px;if(md[i*4+3]<128)continue;if(px>bx0&&px<bx1&&py>by0&&py<by1)continue;
   const wx=wX(px),x=(wx-HX)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th),fdh=fenceDist(th);let col=null,feat=null;
   if(ST.harbor){col=harborCol(wx,wy);if(!col)col=H_SHADE?[140,139,134]:[200,198,192];if(H_SEAT&&!empty)seatM[i]=1;if(H_EMIS)EMIS[i]=1;put(i,col);continue}
   if(y>0){if(ST.feature==='ocean'&&ath<33&&r>fdh+26)feat='sea';
    else if(ST.feature==='trees'&&ath<17&&r>fdh+8)feat='trees';
    else if(ST.feature==='whale'&&!ST.harbor&&ath<36&&r>fdh+14)feat='sea';
    else if(ST.feature==='orchard'&&ath<36&&r>fdh+11)feat=ST.openTop&&ath<ST.openTop?'country':'orchard'}
   const j4=i*4,onRing=imd[j4]>200&&imd[j4+3]>128,inOld=imd[j4+3]>128&&!onRing;
   if(!feat&&onRing&&A[i]&&md[j4+3]>128){put(i,C.conc);continue}
   if(!feat&&!inOld&&!onRing&&A[i]){// the new top deck: same rows and aisles, a darker shade of the lower bowl's color
    const dO=A[i]/3*2/K,rp=(Math.hypot(wx-HX,wy-HY)/K)||1,ang=Math.atan2(wx-HX,HY-wy)/RAD,m=((ang%10)+10)%10;
    if(Math.abs(m-5)<(2.2/rp)/RAD)col=C.aisle;else{const row=Math.floor((dO-3)/6),rr2=(dO-3)-row*6;if(rr2>=4.6)col=C.riserU;else{col=ST.harbor?hSeat(ang,row,true):(row&1)?C3a:C3b;seatM[i]=1}}
    put(i,col);continue}
   if(feat==='sea'){const w=Math.sin(x*.11+Math.sin(y*.05)*2.2)+Math.sin(y*.23+x*.02);col=w>1.35?C.wave:w<-1.1?C.sea2:C.sea}
   else if(feat==='trees'){const n=Math.sin(x*.21)*Math.cos(y*.19)+Math.sin(x*.07+y*.11)+Math.sin(x*.5+y*.45)*.35;col=n>.75?C.tr1:n>-.1?C.tr2:C.tr3;if(n>1.2)col=C.trHi}
   else if(feat==='harbor'){col=harborCol(wx,wy)||C.sea;if(H_SEAT&&!empty)seatM[i]=1}
   else if(feat==='country'){col=r*(ST.openTop-ath)*RAD<3.5?C.conc:villageCol(wx,wy)}
   else if(feat==='orchard'){const q=Math.round(wy),p2=Math.round(wx),cy2=Math.floor(q/22),cx2=Math.floor((p2+(cy2&1)*11)/22),lx=(p2+(cy2&1)*11)-cx2*22-11,ly=q-cy2*22-11,d2=lx*lx+ly*ly;
    if(d2<64){col=d2<20&&lx<0&&ly<0?C.orT2:C.orT;if(((lx*7+ly*13+cx2*5+cy2*3)&15)===0)col=C.orF}else col=(q>>1)&1?C.orG:C.orG2}
   else if(!A[i]){const dOut=DI[i]/3*2/K,fair=ath<=45&&y>=0,wallT=fair&&r>200?ST.wallFt*2:6;
    col=dOut<wallT?(dOut<1.5?C.pad2:C.pad):(fair&&r>fdh-14)||(!fair&&dOut<wallT+12)?C.tr:(PARK_MOW(x,y,r)?C.g1:C.g2)}
   else{const dO=A[i]/3*2/K;
    if(dO<3)col=C.rail;
    else if(dO>=112&&dO<124)col=C.conc;
    else{const upper=dO>=124,rp=(Math.hypot(wx-HX,wy-HY)/K)||1,ang=Math.atan2(wx-HX,HY-wy)/RAD,m=((ang%10)+10)%10;
     if(Math.abs(m-5)<(2.2/rp)/RAD)col=C.aisle;
     else{const row=Math.floor((dO-3)/6),rr2=(dO-3)-row*6;
      if(rr2>=4.6)col=upper?C.riserU:C.riser;else{col=ST.harbor?hSeat(ang,row,upper):upper?((row&1)?C.seatU:C.seatU2):((row&1)?C.seat:C.seat2);seatM[i]=1}}}}
   put(i,col)}}
 
  // the crowd: same grid and density as the park, same club colors, drawn at this layer's half scale
  const home=TEAMS[k],away=TEAMS[S.opp]||home,misc=['#e8d7c3','#f1ecdc','#6c7a86','#a8c6d8','#2b2b30','#c9a0dc','#7fbf6a','#d98c8c','#f4d58d'].map(hexRGB);
  const hj=hexRGB(home.jersey),hc=hexRGB(home.cap),aj=hexRGB(away.jersey),ac=hexRGB(away.cap),sks=SKINS.map(hexRGB),hairs=['#2a1d14','#4a3020','#7a5230','#1a1a1a','#8a8a8a'].map(hexRGB),shadeC=c=>c.map(v=>v*.78|0);
  const px4=(x,y,c)=>{if(x<0||y<0||x>=CW||y>=CH)return;const i=y*CW+x;if(md[i*4+3]<128)return;put(i,c)};
  const g0x=((5+e.mx)/2)%4,g0y=((5+e.my)/2)%4;
  if(!empty)for(let py=g0y|0;py<CH-2;py+=4)for(let px=g0x|0;px<CW-2;px+=4){const i=py*CW+px;if(!seatM[i]||!seatM[i-1]||!seatM[i+1])continue;if(px>bx0+4&&px<bx1-4&&py>by0+4&&py<by1-4)continue;const bh=Math.abs(Math.atan2(wX(px)-HX,HY-wY(py))/RAD)>128;if(!bh&&rr()>.88)continue;// full rows behind the plate
   const wx=wX(px),wy=wY(py),ang=Math.atan2(wx-HX,HY-wy)/RAD,awaySide=ang<-50&&ang>-135,pr=rr(),pH=awaySide?.28:.6,pA=awaySide?.45:.1;
   let sh,cap=null;if(pr<pH){sh=hj;if(rr()<.5)cap=hc}else if(pr<pH+pA){sh=aj;if(rr()<.5)cap=ac}else sh=misc[(rr()*misc.length)|0];
   const sk=sks[(rr()*sks.length)|0];
   px4(px-1,py,sh);px4(px,py,sh);px4(px+1,py,sh);px4(px-1,py+1,shadeC(sh));px4(px,py+1,shadeC(sh));px4(px+1,py+1,shadeC(sh));
   px4(px,py-1,sk);px4(px,py-2,cap||hairs[(rr()*hairs.length)|0]);if(rr()<.5)px4(px-1,py-1,sk)}
  // light: the same multiply the park gets, so day and night match across the seam
  const lt=night?[0x5a,0x64,0x94]:[0xff,0xf7,0xea];
  for(let i=0;i<N;i++){if(md[i*4+3]<128||(night&&EMIS[i]))continue;const py=(i/CW)|0,px=i-py*CW;if(px>bx0&&px<bx1&&py>by0&&py<by1)continue;const j=i*4;d[j]=d[j]*lt[0]/255;d[j+1]=d[j+1]*lt[1]/255;d[j+2]=d[j+2]*lt[2]/255}
  g.putImageData(img,0,0);
  // a soft shadow where the roof overhangs the top rows
  g.save();g.beginPath();OL.forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.closePath();g.clip();
  g.lineWidth=10;g.strokeStyle='rgba(0,0,0,.18)';if(ST.openTop)outlinePath(OL,x=>x,y=>y,g);else{g.beginPath();OL.forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.closePath()}g.stroke();g.restore()}
  if(ST.harbor){{const L=document.createElement('canvas');L.width=CW;L.height=CH;const lg=L.getContext('2d');lg.setTransform(.5,0,0,.5,e.mx/2,e.my/2);hDecor(lg);
    if(night){const M=document.createElement('canvas');M.width=CW;M.height=CH;M.getContext('2d').drawImage(L,0,0);lg.setTransform(1,0,0,1,0,0);lg.globalCompositeOperation='multiply';lg.fillStyle='#5a6494';lg.fillRect(0,0,CW,CH);lg.globalCompositeOperation='destination-in';lg.drawImage(M,0,0)}g.drawImage(L,0,0)}
   // the shore's buildings, ships and the gate, drawn by day and then lit like the rest of this layer
   const L=document.createElement('canvas');L.width=CW;L.height=CH;const lg=L.getContext('2d');drawHarbor(lg,k,false,CW,CH,cx,cy,OL,e);
   if(night){const M=document.createElement('canvas');M.width=CW;M.height=CH;M.getContext('2d').drawImage(L,0,0);lg.globalCompositeOperation='multiply';lg.fillStyle='#5a6494';lg.fillRect(0,0,CW,CH);lg.globalCompositeOperation='destination-in';lg.drawImage(M,0,0)}
   g.drawImage(L,0,0);if(night)drawHarborGlow(g,cx,cy,OL)}
  if(ST.village){// the town's buildings, lit like everything else on this layer
   const L=document.createElement('canvas');L.width=CW;L.height=CH;const lg=L.getContext('2d');lg.setTransform(.5,0,0,.5,e.mx/2,e.my/2);const glows=[];vTownDraw(lg,night?glows:null);
   const M=document.createElement('canvas');M.width=CW;M.height=CH;M.getContext('2d').drawImage(L,0,0);lg.setTransform(1,0,0,1,0,0);
   lg.globalCompositeOperation='multiply';lg.fillStyle=night?'#5a6494':'#fff7ea';lg.fillRect(0,0,CW,CH);lg.globalCompositeOperation='destination-in';lg.drawImage(M,0,0);g.drawImage(L,0,0);
   if(night){g.save();g.globalCompositeOperation='lighter';for(const[wx,wy]of glows){const x=(wx+e.mx)/2,y=(wy+e.my)/2;const gr=g.createRadialGradient(x,y,0,x,y,7);gr.addColorStop(0,'rgba(255,214,150,.45)');gr.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=gr;g.fillRect(x-7,y-7,14,14);g.fillStyle='rgba(255,230,170,.9)';g.fillRect(Math.round(x)-1,Math.round(y),2,1)}
    // streetlights along the town roads
    g.restore()}}
return c}
