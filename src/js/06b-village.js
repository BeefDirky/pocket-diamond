// ---------- Jeju: an old island village and its tangerine orchards around an open-outfield park ----------
// The country is one pure function of world position (villageCol), so the park buffer (the orchard past the outfield
// wall) and the half-resolution neighborhood layer paint exactly the same pixels and meet without a seam.
// Plots sit on a gently warped grid; every plot is ringed by a black basalt wall (batdam), and every third row and
// column of walls is an olle lane: a dirt path walled on both sides. Thatched houses, tile-roofed hanok, onggi jars,
// the village tree and its pavilion are drawn on top, outside the park buffer only.
const VS=150;// plot spacing (world px): one jittered seed per grid cell, plots are their Voronoi cells
const VC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 path:h('#cbb995'),path2:h('#bfad88'),wall:h('#3a3837'),wall2:h('#55514c'),wall3:h('#28272a'),
 orG:h('#6b7f3a'),orG2:h('#62763a'),orT:h('#2f7a3a'),orT2:h('#3c8f44'),orT3:h('#25663a'),orF:h('#ff9a1f'),orF2:h('#ffc04a'),orSh:h('#556a30'),
 cedar:h('#2d5530'),cedar2:h('#3b6a3b'),cedar3:h('#22442a'),
 can1:h('#f4d23a'),can2:h('#e8c22c'),canG:h('#8db53e'),
 bar1:h('#a3c75c'),bar2:h('#93b952'),barG1:h('#d8c47a'),barG2:h('#cbb56a'),
 soil:h('#8b6b49'),soil2:h('#7d5f40'),crop:h('#5d9d45'),crop2:h('#78b553'),
 pas1:h('#7fb459'),lawn:h('#86ba5e'),pas2:h('#73a84f'),yard:h('#cdb893'),yard2:h('#c2ad88')}})();
const vHash=(i,j)=>{let h=(i*73856093)^(j*19349663)^0x5bd1e995;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return(h^(h>>>15))>>>0};
// village cores (world px): the house plots gather around these; the orchards fill the country past the outfield
const V_CORES=()=>[[HX,HY+800,720],[HX-1320,HY-180,640],[HX+1300,HY-120,640],[HX-1250,HY+820,520],[HX+1300,HY+860,520],[HX-980,-760,300],[HX+1060,-700,280]];
const V_MARKS=()=>[[HX-150,HY+880],[HX+130,HY+940]];// the pond, the village tree and its pavilion
const V_SEEDS=new Map();let V_OL=null;
function vNearPark(x,y){if(!V_OL)V_OL=parkOutlineClosed();if(Math.abs(x-HX)<130&&y>HY+500)return true;// the main road
 const c=HX,cy=HY-420,dx=x-c,dy=y-cy,l=Math.hypot(dx,dy)||1;return insidePoly(V_OL,x-dx/l*185,y-dy/l*185)}
function vSeed(i,j){const k=(i+512)*4096+(j+512);let p=V_SEEDS.get(k);if(p)return p;
 const h=vHash(i,j),sx=(i+.18+.64*((h&1023)/1023))*VS,sy=(j+.18+.64*(((h>>>10)&1023)/1023))*VS;
 const x=(sx-HX)*FT,y=(HY-sy)*FT,th=Math.abs(Math.atan2(x,y)/RAD);
 let core=0;for(const[cx,cy,R]of V_CORES()){const d=Math.hypot(sx-cx,sy-cy);core=Math.max(core,Math.exp(-((d/R)**2)))}
 const orch=y>0&&th<56+((h>>>20)%11)-5,inBuf=sx>-VS&&sx<W+VS&&sy>-VS&&sy<H+VS&&th<64&&y>-20,v=((h>>>4)%1000)/1000,w=((h>>>14)%1000)/1000;
 let t;
 const mark=V_MARKS().some(([mx,my])=>Math.hypot(sx-mx,sy-my)<170);
 if(mark)t='lawn';else if(v<core*.92&&!inBuf&&!vNearPark(sx,sy))t='house';
 else if(orch)t=w<.07?'canola':'orchard';
 else t=w<.16?'canola':w<.34?'barley':w<.5?'veg':w<.72?'orchard':'pasture';
 p={x:sx,y:sy,t,h,wind:((h>>>8)%3)===0,gold:((h>>>11)&3)===0,ang:((h>>>3)%180)*RAD};V_SEEDS.set(k,p);return p}
// the two nearest seeds and the distance to the wall between them
// seeds cached in a flat grid (the neighborhood spans about -12..20 cells each way)
const VG0=-24,VGN=64,V_GRID=new Array(VGN*VGN);
function vSeedG(i,j){const ii=i-VG0,jj=j-VG0;if(ii<0||jj<0||ii>=VGN||jj>=VGN)return vSeed(i,j);const k=ii*VGN+jj;return V_GRID[k]||(V_GRID[k]=vSeed(i,j))}
const VN={a:null,b:null,e:0};// the answer, reused (this runs for every pixel of the neighborhood)
function vNear(x,y){const i=Math.floor(x/VS),j=Math.floor(y/VS);let a=null,b=null,da=1e18,db=1e18;
 for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const p=vSeedG(i+di,j+dj),dx=p.x-x,dy=p.y-y,d=dx*dx+dy*dy;if(d<da){db=da;b=a;da=d;a=p}else if(d<db){db=d;b=p}}
 VN.a=a;VN.b=b;VN.e=(db-da)/(2*(Math.hypot(b.x-a.x,b.y-a.y)||1));return VN}
// which walls are olle lanes: the edge between two plots, chosen by the pair (more of them in the villages)
const vLane=(a,b)=>{const h=vHash(Math.min(a.h,b.h)%100003,Math.max(a.h,b.h)%100003);return (a.t==='house'&&b.t==='house')?h%2===0:(a.t==='house'||b.t==='house')?h%3===0:h%7===0};
const V_TREES=new Map();
function vTreeOK(tcx,tcy,a){const k=Math.round(tcx)*8192+Math.round(tcy);let v=V_TREES.get(k);if(v===undefined){const n=vNear(tcx,tcy);v=n.a===a&&n.e>11&&!(a.wind&&vWindband(a,tcx,tcy)<22);V_TREES.set(k,v)}return v}
// windbreak: a row of cedars along the plot's north side, as the island's orchards plant against the winter wind
function vWindband(a,x,y){return y-(a.y-VS*.42)}
function villageCol(wx,wy){
 const x=wx+2.2*Math.sin(wy*.21)+1.6*Math.sin(wy*.07+wx*.05),y=wy+2.2*Math.sin(wx*.19)+1.4*Math.sin(wx*.06-wy*.04);// rough-laid stone
 const n0=vNear(x,y),a=n0.a,b=n0.b,e=n0.e;
 if(vLane(a,b)){if(e<5.5){const n=(Math.floor(wx/3)*7+Math.floor(wy/3)*13)&7;return n===0?VC.path2:VC.path}
  if(e<9){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}}
 else if(e<3.4){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}
 const P=a,s=wx*Math.cos(P.ang)+wy*Math.sin(P.ang),t=-wx*Math.sin(P.ang)+wy*Math.cos(P.ang);
 if(P.t==='orchard'){
  if(P.wind){const wb=vWindband(P,wx,wy);if(wb>=-30&&wb<12&&e>9){if(wb<-28)return VC.cedar3;const n=Math.sin(wx*.9)+Math.sin(wx*.37+wy*.5);return n>.9?VC.cedar2:VC.cedar}}
  const q=Math.floor(wy),p2=Math.floor(wx),cy2=Math.floor(q/22),cx2=Math.floor((p2+(cy2&1)*11)/22),lx=(p2+(cy2&1)*11)-cx2*22-11,ly=q-cy2*22-11,d2=lx*lx+ly*ly;
  const tcx=cx2*22+11-(cy2&1)*11,tcy=cy2*22+11,ok=vTreeOK(tcx,tcy,P);
  if(ok&&d2<64){if(((lx*7+ly*13+cx2*5+cy2*3)&15)===0||((lx*3-ly*11+cx2)&31)===1)return lx<0&&ly<0?VC.orF2:VC.orF;
   if(d2<20&&lx<0&&ly<0)return VC.orT2;if(d2>=40&&lx+ly>3)return VC.orT3;return VC.orT}
  if(ok){const sx=lx-3,sy=ly-3;if(sx*sx+sy*sy<56)return VC.orSh}
  return (q>>1)&1?VC.orG:VC.orG2}
 if(P.t==='canola'){const st=Math.floor((t+Math.sin(s*.04)*4)/4)&1,n=vHash(Math.floor(wx/2),Math.floor(wy/2))&31;return n===0?VC.canG:st?VC.can1:VC.can2}
 if(P.t==='barley'){const st=Math.floor(t/6)&1;return P.gold?(st?VC.barG1:VC.barG2):(st?VC.bar1:VC.bar2)}
 if(P.t==='house'){const rr=vYard(P),ax=Math.abs(wx-P.x)-rr.w/2,ay=Math.abs(wy-P.y)-rr.h/2;
  if(ax<10&&ay<10){// the house's own stone wall, with a gap for the gate on the lane side
   if(ax>4||ay>4){const gate=ay>4&&wy>P.y&&Math.abs(wx-P.x-(P.h%3-1)*rr.w*.25)<10;if(!gate){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}}
   const n=vHash(Math.floor(wx/2),Math.floor(wy/2))&15;return n===0?VC.yard2:VC.yard}
  if(P.h&16){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.pas1}}
 if(P.t==='lawn'){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.lawn}
 if(P.t==='veg'||P.t==='house'){const st=Math.floor(t/5);if(st&1){const n=(Math.floor(s/3)+st)&1;return n?VC.crop:VC.crop2}return (Math.floor(s/2)&1)?VC.soil:VC.soil2}
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.pas1}
// a house plot's yard (world px, centred on its seed): it fits inside the plot's largest clear circle
const V_YARD=new Map();
function vYard(P){let r=V_YARD.get(P);if(r)return r;const i=Math.floor(P.x/VS),j=Math.floor(P.y/VS);let m=1e9;
 for(let di=-2;di<=2;di++)for(let dj=-2;dj<=2;dj++){if(!di&&!dj)continue;const q=vSeed(i+di,j+dj);m=Math.min(m,Math.hypot(q.x-P.x,q.y-P.y))}
 const R=m/2-10;r={R,w:R*1.5,h:R*1.15};V_YARD.set(P,r);return r}
// ---- the pieces of a village, in canvas pixels ----
function vThatch(g,x,y,w,h,night,rr){// a low rounded thatch, roped down in a net against the island wind
 const base=night?'#454030':'#c9ae74',dark=night?'#353024':'#a68d58',lite=night?'#544c38':'#dcc590',rope=night?'#2e2a20':'rgba(110,86,46,.55)';
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.roundRect(x+2,y+2,w,h,Math.min(w,h)*.42);g.fill();
 g.fillStyle=dark;g.beginPath();g.roundRect(x,y,w,h,Math.min(w,h)*.42);g.fill();
 g.fillStyle=base;g.beginPath();g.roundRect(x+1,y+1,w-2,h-3,Math.min(w,h)*.4);g.fill();
 g.fillStyle=lite;g.beginPath();g.roundRect(x+2,y+1.5,w-6,h*.4,Math.min(w,h)*.3);g.fill();
 g.save();g.beginPath();g.roundRect(x,y,w,h,Math.min(w,h)*.42);g.clip();g.fillStyle=rope;
 for(let q=x+3;q<x+w;q+=4)g.fillRect(Math.round(q),y,1,h);for(let q=y+3;q<y+h;q+=4)g.fillRect(x,Math.round(q),w,1);g.restore()}
function vTile(g,x,y,w,h,night){// a giwa roof: ribbed tiles running off a white-capped ridge, eaves that lift at the corners
 const t1=night?'#2a2e34':'#5b626b',t2=night?'#32373e':'#6e7680',edge=night?'#1c1f24':'#3c4148',cap=night?'#8a8780':'#e2ded2';
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+2,y+2,w,h);
 g.fillStyle=edge;g.fillRect(x-1,y-1,w+2,h+2);g.fillRect(x-2,y-2,2,2);g.fillRect(x+w,y-2,2,2);g.fillRect(x-2,y+h,2,2);g.fillRect(x+w,y+h,2,2);
 for(let q=0;q<w;q++){g.fillStyle=q&1?t1:t2;g.fillRect(x+q,y,1,h)}
 g.fillStyle=edge;g.fillRect(x+2,y+h/2-1,w-4,2);g.fillStyle=cap;g.fillRect(x+2,y+h/2-1,w-4,1);g.fillRect(x+1,y+h/2-1.5,2,3);g.fillRect(x+w-3,y+h/2-1.5,2,3);
 g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,y,w,h/2-1)}
function vJars(g,x,y,n,night,rr){// jangdokdae: onggi jars of soy and bean paste on a stone platform
 g.fillStyle=night?'#3c3a38':'#8d877d';g.fillRect(x-1,y-1,n*4+1,9);
 for(let q=0;q<n;q++)for(let r2=0;r2<2;r2++){const jx=x+q*4+1,jy=y+r2*4+1;g.fillStyle=night?'#2e1c12':'#6b3d22';g.fillRect(jx,jy,3,3);g.fillStyle=night?'#3e2a1c':'#9a5a32';g.fillRect(jx,jy,1,1)}}
function vTree(g,x,y,r,night,fruit){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+2,y+2,r,0,7);g.fill();
 g.fillStyle=night?'#163020':'#3a7a34';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle=night?'#1e3a26':'#4f9446';g.beginPath();g.arc(x-r*.3,y-r*.3,r*.55,0,7);g.fill();
 if(fruit){g.fillStyle=night?'#6a4a20':fruit;for(let q=0;q<5;q++){const a=q*2.4,d=r*.6;g.fillRect(Math.round(x+Math.cos(a)*d),Math.round(y+Math.sin(a)*d),1,1)}}}
function vStatue(g,x,y,night){// dolhareubang: a stone grandfather in his brimmed hat, carved from the same black basalt as the walls
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-1,y,5,4);g.fillStyle=night?'#2a2a2c':'#4a4845';g.fillRect(x-2,y-2,5,5);g.fillStyle=night?'#3a3a3c':'#6a6762';g.fillRect(x-1,y-1,3,3);g.fillStyle=night?'#4a4a4c':'#87837c';g.fillRect(x-1,y-1,1,1)}
function drawVillage(g,k,night,CW,CH,cx,cy,OL,rr,e){
 const lt=night?[0x5a,0x64,0x94]:[0xff,0xf7,0xea];
 // ---- the ground: every pixel from the shared country function, with the park's light on it ----
 {// (the bowl itself gets painted over by the stands pass, so it's skipped here)
  const mc=document.createElement('canvas');mc.width=CW;mc.height=CH;const mg=mc.getContext('2d');mg.beginPath();OL.forEach((q,i)=>mg[i?'lineTo':'moveTo'](q.x,q.y));mg.closePath();mg.fill();const md=mg.getImageData(0,0,CW,CH).data;
  const img=g.createImageData(CW,CH),d=img.data;let j=0;
  for(let py=0;py<CH;py++){const wy=(py+.5)*2-e.my;for(let px=0;px<CW;px++,j+=4){if(md[j+3]>250)continue;const c=villageCol((px+.5)*2-e.mx,wy);d[j]=c[0]*lt[0]/255;d[j+1]=c[1]*lt[1]/255;d[j+2]=c[2]*lt[2]/255;d[j+3]=255}}
  g.putImageData(img,0,0)}
 const ctr={x:cx(HX),y:cy(HY)};
 // a stone-paved apron around the bowl (none along the open outfield), and the country road that circles it
 const off=(q,o)=>{const dx=q.x-ctr.x,dy=q.y-ctr.y,l=Math.hypot(dx,dy)||1;return{x:q.x+dx/l*o,y:q.y+dy/l*o}};
 const open=q=>q.open;
 const CR=closedRun(OL);
 g.save();g.beginPath();CR.forEach((q,i)=>{const p=off(q,30);g[i?'lineTo':'moveTo'](p.x,p.y)});for(let i=CR.length-1;i>=0;i--)g.lineTo(CR[i].x,CR[i].y);g.closePath();g.fillStyle=night?'#2a2a2c':'#c8c0ae';g.fill();
 g.clip();g.fillStyle=night?'#232325':'#b9b09c';for(let y=0;y<CH;y+=6)for(let x=(y/6&1)*5;x<CW;x+=10)g.fillRect(x,y,1,6);for(let y=0;y<CH;y+=6)g.fillRect(0,y,CW,1);g.restore();
 // the paved road: around the closed part of the bowl, then out along the lanes of the outfield country on both ends
 g.save();g.lineCap='round';g.lineJoin='round';const road=night?'#1c1d20':'#6a6b6c',edgeC=night?'#2c2d30':'#8d8e8c';
 const RP=new Path2D();CR.forEach((q,i)=>{const p=off(q,42);RP[i?'lineTo':'moveTo'](p.x,p.y)});
 {// past the end of the stands the road runs on out through the orchards
  for(const[a2,b2]of[[CR[1],CR[0]],[CR[CR.length-2],CR[CR.length-1]]]){const p=off(b2,42),dx=p.x-ctr.x,dy=p.y-ctr.y,l=Math.hypot(dx,dy);RP.moveTo(p.x,p.y);RP.lineTo(p.x+dx/l*1400,p.y+dy/l*1400)}}
 g.strokeStyle=edgeC;g.lineWidth=13;g.stroke(RP);g.strokeStyle=road;g.lineWidth=10;g.stroke(RP);g.setLineDash([3,4]);g.strokeStyle=night?'#6b6030':'#e8d27a';g.lineWidth=1;g.stroke(RP);g.setLineDash([]);
 // the main road out of the village, straight down from the plate gate
 const bot=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),rx=cx(HX),ry0=bot.y+30;
 g.fillStyle=edgeC;g.fillRect(rx-6.5,ry0,13,CH-ry0);g.fillStyle=road;g.fillRect(rx-5,ry0,10,CH-ry0);g.fillStyle=night?'#6b6030':'#e8d27a';for(let y=ry0;y<CH;y+=8)g.fillRect(rx-.5,y,1,4);
 g.restore();
 const busy=(x,y,w,h)=>{// keep buildings off the apron, the roads and the park buffer
  if(Math.abs(x+w/2-rx)<w/2+10&&y+h>ry0-4)return true;
  const bx0=cx(0),by0=cy(0),bx1=cx(W),by1=cy(H);if(x+w>bx0-6&&x<bx1+6&&y+h>by0-6&&y<by1+6&&insidePoly(OL,x+w/2,y+h/2))return true;
  for(const[qx,qy]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h],[x+w/2,y+h/2]])if(insidePoly(OL,qx,qy))return true;
  return false};
 // ---- the houses: an anchae and a bakkeori facing each other across the yard, sometimes a third wing ----
 const i0=Math.floor(-e.mx/VS)-2,i1=Math.ceil((W+e.mx)/VS)+2,j0=Math.floor(-e.my/VS)-2,j1=Math.ceil((H+e.my)/VS)+2;
 const lamps=[];
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const P=vSeed(i,j);if(P.t!=='house')continue;const Y=vYard(P);
  const R={x:(P.x-Y.w/2+e.mx)/2,y:(P.y-Y.h/2+e.my)/2,w:Y.w/2,h:Y.h/2};
  if(R.w<14||R.x<-R.w||R.y<-R.h||R.x>CW||R.y>CH||busy(R.x,R.y,R.w,R.h))continue;
  const hr=mulberry32(P.h),core=Math.hypot(P.x-HX,P.y-(HY+760))<700,tile=hr()<(core?.4:.15);
  const mw=Math.round(R.w*(.84+hr()*.16)),mh=Math.max(7,Math.round(R.h*.38)),mx=Math.round(R.x+(R.w-mw)*hr()),my=Math.round(R.y);
  const roof=(x,y,w,h)=>tile?vTile(g,x+1,y+1,w-2,h-2,night):vThatch(g,x,y,w,h,night,hr);
  roof(mx,my,mw,mh);lamps.push([mx+mw/2,my+mh+1,mw]);
  const sw=Math.round(R.w*(.6+hr()*.25)),sh=Math.max(6,Math.round(R.h*.3)),sx=Math.round(R.x+(R.w-sw)*hr()),sy=Math.round(R.y+R.h-sh);
  if(hr()<.85){roof(sx,sy,sw,sh);lamps.push([sx+sw/2,sy-1,sw])}
  const yy=(my+mh+sy)/2;
  if(hr()<.75)vJars(g,Math.round(R.x+R.w*(.15+hr()*.4)),Math.round(yy-3),3+((hr()*2)|0),night,hr);
  if(hr()<.7)vTree(g,Math.round(R.x+R.w*(hr()<.5?.08:.92)),Math.round(yy+1),4,night,hr()<.6?'#ff9a1f':'#e8561c')}
 // ---- the village tree: an old zelkova on a stone platform where the lanes meet, a pavilion beside it ----
 {const M=V_MARKS(),tx=(M[1][0]+e.mx)/2,ty=(M[1][1]+e.my)/2;if(!busy(tx-30,ty-30,60,60)||true){
   g.fillStyle=night?'#2c2b2a':'#9a948a';g.beginPath();g.arc(tx,ty,22,0,7);g.fill();g.fillStyle=night?'#242322':'#857f75';g.beginPath();g.arc(tx,ty,22,0,7);g.lineWidth=2;g.strokeStyle=g.fillStyle;g.stroke();
   g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(tx+5,ty+5,26,0,7);g.fill();
   for(const[dx,dy,r,c]of[[0,0,26,night?'#163020':'#2f6b2f'],[-7,-6,15,night?'#1c3a24':'#3f8040'],[8,-3,13,night?'#1a3422':'#367538'],[-2,8,14,night?'#163020':'#2c642d'],[-10,-10,6,night?'#22422a':'#55a24c']]){g.fillStyle=c;g.beginPath();g.arc(tx+dx,ty+dy,r,0,7);g.fill()}
   vTile(g,tx+30,ty-8,20,20,night)}}
 // ---- a lotus pond on the other side of the road ----
 {const M=V_MARKS(),px=(M[0][0]+e.mx)/2,py=(M[0][1]+e.my)/2;g.fillStyle=night?'#2a2a2c':'#3a3837';g.beginPath();g.ellipse(px,py,30,18,0,0,7);g.fill();
  g.fillStyle=night?'#0c1a2a':'#4f8fb0';g.beginPath();g.ellipse(px,py,27,15,0,0,7);g.fill();g.fillStyle=night?'#12243a':'#6fb0cc';g.beginPath();g.ellipse(px-6,py-4,12,5,0,0,7);g.fill();
  for(let q=0;q<9;q++){const a=q*1.9,d=8+(q*7)%14;const lx=Math.round(px+Math.cos(a)*d*1.4),ly=Math.round(py+Math.sin(a)*d*.7);g.fillStyle=night?'#173a20':'#4f9a46';g.fillRect(lx,ly,3,2);if(q%3===0){g.fillStyle=night?'#6a4a5a':'#f4a6c0';g.fillRect(lx+1,ly,1,1)}}}
 // ---- dolhareubang guarding the gate, and the stone-pillar gate (jeongnang) of the village ----
 vStatue(g,Math.round(rx-12),Math.round(ry0+6),night);vStatue(g,Math.round(rx+11),Math.round(ry0+6),night);
 for(const sd of[-1,1]){const gx=Math.round(rx+sd*13),gy=Math.round(ry0+40);g.fillStyle=night?'#2a2a2c':'#4a4845';g.fillRect(gx-1,gy-1,3,3);g.fillStyle=night?'#3a3a3c':'#6a6762';g.fillRect(gx-1,gy-1,3,1);
  g.fillStyle=night?'#4a3a28':'#9a7a4a';for(let q=0;q<3;q++)g.fillRect(gx+(sd<0?2:-5),gy-2+q*2,4,1)}
 // ---- night: paper doors glow under the eaves, and lanterns hang along the lanes ----
 if(night){g.save();g.globalCompositeOperation='lighter';
  for(const[x,y,w]of lamps){const gr=g.createRadialGradient(x,y,0,x,y,w*.6);gr.addColorStop(0,'rgba(255,190,110,.35)');gr.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=gr;g.fillRect(x-w*.6,y-w*.6,w*1.2,w*1.2);
   g.fillStyle='rgba(255,214,140,.9)';for(let q=-w*.3;q<w*.3;q+=4)g.fillRect(Math.round(x+q),Math.round(y),2,1)}
  for(let q=0;q<200;q++){const wx=(rr()*(CW*2))-e.mx,wy=(rr()*(CH*2))-e.my,n=vNear(wx,wy);if(!vLane(n.a,n.b)||n.e>3||(n.a.t!=='house'&&n.b.t!=='house'))continue;
   const x=(wx+e.mx)/2,y=(wy+e.my)/2;if(insidePoly(OL,x,y))continue;const gr=g.createRadialGradient(x,y,0,x,y,9);gr.addColorStop(0,'rgba(255,150,80,.45)');gr.addColorStop(1,'rgba(255,150,80,0)');g.fillStyle=gr;g.fillRect(x-9,y-9,18,18);g.fillStyle='#ff8a4a';g.fillRect(Math.round(x),Math.round(y),1,1)}
  g.restore()}
}
