// ---------- Jeju: an old island village and its tangerine orchards around an open-outfield park ----------
// The country is one pure function of world position (villageCol), so the park buffer (the orchard past the outfield
// wall) and the half-resolution neighborhood layer paint exactly the same pixels and meet without a seam.
// Plots sit on a gently warped grid; every plot is ringed by a black basalt wall (batdam), and every third row and
// column of walls is an olle lane: a dirt path walled on both sides. Thatched houses, tile-roofed hanok, onggi jars,
// the village tree and its pavilion are drawn on top, outside the park buffer only.
const VS=150;// plot spacing (world px): one jittered seed per grid cell, plots are their Voronoi cells
const VC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 path:h('#cbb995'),path2:h('#bfad88'),wall:h('#3a3837'),wall2:h('#55514c'),wall3:h('#28272a'),
 orG:h('#6b7f3a'),orG2:h('#62763a'),orT:h('#2f7a3a'),orT2:h('#3c8f44'),orT3:h('#25663a'),orF:h('#ff9a1f'),orF2:h('#ffd27a'),orFd:h('#d9700e'),orSh:h('#556a30'),
 cedar:h('#2d5530'),cedar2:h('#3b6a3b'),cedar3:h('#22442a'),
 can1:h('#f4d23a'),can2:h('#e8c22c'),canG:h('#8db53e'),
 bar1:h('#a3c75c'),bar2:h('#93b952'),barG1:h('#d8c47a'),barG2:h('#cbb56a'),
 soil:h('#8b6b49'),soil2:h('#7d5f40'),crop:h('#5d9d45'),crop2:h('#78b553'),
 pas1:h('#7fb459'),lawn:h('#86ba5e'),lawnA:h('#7cbd5a'),lawnB:h('#72b352'),pave:h('#d8cbb0'),pave2:h('#cdbfa3'),planter:h('#7a6a58'),lamp:h('#2b2f36'),
 asph:h('#55585b'),asph2:h('#4e5154'),dash:h('#e8d27a'),edgeL:h('#e8e6dc'),side:h('#bdb8ac'),side2:h('#b3aea2'),lot:h('#b9b4a8'),lot2:h('#b1aca0'),curb:h('#8e8a82'),pas2:h('#73a84f'),yard:h('#cdb893'),yard2:h('#c2ad88')}})();
const vHash=(i,j)=>{let h=(i*73856093)^(j*19349663)^0x5bd1e995;h=Math.imul(h^(h>>>15),0x2c1b3c6d);h=Math.imul(h^(h>>>12),0x297a2d39);return(h^(h>>>15))>>>0};
// village cores (world px): the house plots gather around these; the orchards fill the country past the outfield
const V_CORES=()=>[[HX,HY+800,720],[HX-1320,HY-180,640],[HX+1300,HY-120,640],[HX-1250,HY+820,520],[HX+1300,HY+860,520],[HX-980,-760,300],[HX+1060,-700,280]];
const V_MARKS=()=>[[HX-150,HY+880],[HX+130,HY+940]];// the pond, the village tree and its pavilion
const V_SEEDS=new Map();let V_OL=null;
function vNearPark(x,y,pad=185,road=true){if(!V_OL)V_OL=parkOutlineClosed();if(road&&Math.abs(x-HX)<130&&y>HY+500)return true;// the main road
 const c=HX,cy=HY-420,dx=x-c,dy=y-cy,l=Math.hypot(dx,dy)||1;return insidePoly(V_OL,x-dx/l*pad,y-dy/l*pad)}
// the town: a ring of shops, lots and markets right outside the stadium, and the service quarter behind the open outfield
function vTownSeed(x,y,wedge,h){if(!V_OL)V_OL=parkOutlineClosed();
 if(Math.abs(x-HX)<130&&y>HY+500)return false;
 if(wedge)return vNearPark(x,y,250,false)||(vNearPark(x,y,400,false)&&(h>>>21)%3===0);
 if(insidePoly(V_OL,x,y)||vNearPark(x,y,150,false))return false;
 const reach=vNearPark(x,y,310,false),far=vNearPark(x,y,450,false);return reach||(far&&(h>>>21)%3===0)}
function vSeed(i,j){const k=(i+512)*4096+(j+512);let p=V_SEEDS.get(k);if(p)return p;
 const h=vHash(i,j),sx=(i+.18+.64*((h&1023)/1023))*VS,sy=(j+.18+.64*(((h>>>10)&1023)/1023))*VS;
 const x=(sx-HX)*FT,y=(HY-sy)*FT,th=Math.abs(Math.atan2(x,y)/RAD);
 let core=0;for(const[cx,cy,R]of V_CORES()){const d=Math.hypot(sx-cx,sy-cy);core=Math.max(core,Math.exp(-((d/R)**2)))}
 const orch=y>0&&th<56+((h>>>20)%11)-5,inBuf=sx>-VS&&sx<W+VS&&sy>-VS&&sy<H+VS&&th<64&&y>-20,v=((h>>>4)%1000)/1000,w=((h>>>14)%1000)/1000;
 let t;
 const mark=V_MARKS().some(([mx,my])=>Math.hypot(sx-mx,sy-my)<170);
 const wedge=ST&&ST.openTop&&y>0&&th<ST.openTop+4&&Math.hypot(x,y)>fenceDist(th)+30;// past the outfield fence, never on the field
 if(mark)t='lawn';else if(vTownSeed(sx,sy,wedge,h))t='town';else if(v<core*.92&&!inBuf&&!vNearPark(sx,sy))t='house';
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
const V_BLANKET=['#e0473d','#3f82e6','#f5c935','#f1ecdc','#ef6a1f','#7fbf6a','#c9a0dc'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]);
// the open outfield, measured in feet past the fence: the stone wall, a picnic lawn, the promenade, the service road
// tangerines on a tree: five or six fruit spread round the canopy, each a 2x2 block on the even world-pixel grid
// with a lit corner, so the full-size park shows round fruit and the half-size neighborhood a clean single pixel.
// 0 = leaf, 1 = fruit, 2 = its highlight
function vFruit(X,Y,tcx,tcy,seed){const h=vHash(seed%100003,(seed/100003|0)+17),n=5+(h&1),a0=((h>>>3)%628)/100;
 for(let k=0;k<n;k++){const a=a0+k*(6.283/n),r=k===0?0:4.6,ex=2*Math.round((tcx+Math.cos(a)*r)/2),ey=2*Math.round((tcy+Math.sin(a)*r)/2);
  const dx=X-ex,dy=Y-ey;if(dx>=0&&dx<=1&&dy>=0&&dy<=1)return dx===0&&dy===0?2:1}return 0}
const V_NOYARD=new Set();// house plots left empty (a road runs through): their yard is garden instead
const V_SHIRTS=['#e0781c','#ff9a1f','#f1ecdc','#2f7a3a','#3f82e6','#e0473d','#2b2b30','#f5c935','#a8c6d8'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]);
const V_SKIN=[[234,192,150],[214,166,120],[176,124,84],[60,40,30]];
// a fan strolling the concourse, on a 9px grid (null if this pixel isn't one)
function vPerson(wx,wy,pct){const ci=Math.floor(wx/9),cj=Math.floor(wy/9),h=vHash(ci*7+3,cj*13+1);if(h%100>=pct)return null;
 const ox=(h>>>8)%4,oy=(h>>>11)%3,dx=Math.floor(wx)-ci*9-ox,dy=Math.floor(wy)-cj*9-oy;
 if(dx>=1&&dx<=3&&dy>=3&&dy<=5){const c=V_SHIRTS[(h>>>14)%V_SHIRTS.length];return dy===5?c.map(v=>v*.78|0):c}
 if(dx===2&&dy===2)return (h>>>18)&1?V_SKIN[(h>>>19)&1]:[42,30,22];return null}
const V_BOOTH=['#e0473d','#3f82e6','#ef6a1f','#3faa5b','#f5c935','#c9a0dc'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]);
// The outfield pavilion follows one smooth circle (not the fence, which kinks at the gaps), so its lawn, promenade,
// food stands and steel roof keep true proportions all the way along. In feet, centred on the y axis behind home.
let V_PAV=null,V_PAV_K='';
function vPav(){const key=DIMS.join(',');if(V_PAV&&V_PAV_K===key)return V_PAV;V_PAV_K=key;
 const r33=fenceDist(33)+30,px=r33*Math.sin(33*RAD),py=r33*Math.cos(33*RAD),top=452,cy=(top*top-px*px-py*py)/(2*(top-py)),R=top-cy;
 // how far round the circle the roof runs: until it reaches 27 degrees off centre as seen from the plate
 const homeAng=f=>Math.atan2(Math.sin(f)*(R+20),cy+Math.cos(f)*(R+20))/RAD;let lo=0,hi=1.5;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(homeAng(m)<27)lo=m;else hi=m}
 return V_PAV={cy,R,fm:lo}}
// the open outfield: the stone wall behind the fence, a picnic lawn, then the promenade along the pavilion
function vOutfield(wx,wy,q,th,r,fx,fy,d){const n=vHash(Math.floor(wx/3),Math.floor(wy/3));
 if(q<11)return (n&15)<3?VC.wall2:VC.wall;
 const pv=vPav(),f=Math.atan2(fx,fy-pv.cy),s=f*(pv.R-6);// feet along the promenade
 if(d<-13){const ci=Math.floor(s/11),cj=Math.floor(d/8),h=vHash(ci+977,cj+31);
  if(h%5===0){const ls=s-ci*11,lq=d-cj*8;if(ls>2&&ls<8&&lq>1.5&&lq<6){const c=V_BLANKET[(h>>>4)%V_BLANKET.length];return (Math.floor(ls)+Math.floor(lq))&1?c:c.map(v=>v*.86|0)}}
  return Math.floor(d/4)&1?VC.lawnA:VC.lawnB}
 if(d<0){const ss=((s%32)+32)%32;
  if(d>-10&&d<-3&&ss>12&&ss<20){const dx=ss-16,dq=d+6.5,dd=dx*dx+dq*dq;if(dd<9){const ci=Math.floor(s/32),fc=(ci*32+16)/(pv.R-6),tcx=HX+Math.sin(fc)*(pv.R-6.5)/FT,tcy=HY-(pv.cy+Math.cos(fc)*(pv.R-6.5))/FT,fr=vFruit(Math.floor(wx),Math.floor(wy),tcx,tcy,ci*7+3);if(fr)return fr===2?VC.orF2:VC.orF;return dd<3&&dx<0?VC.orT2:VC.orT}if(dd<12.5)return VC.planter}
  if(d<-12)return VC.edgeL;
  if(Math.abs(d+11)<.8&&((s%16)+16)%16<1.2)return VC.lamp;
  const p=vPerson(wx,wy,10);if(p)return p;
  return (Math.floor(s/2.5)+Math.floor(d/2.5))&1?VC.pave:VC.pave2}
 const p=vPerson(wx,wy,5);if(p)return p;
 return (Math.floor(s/4)+Math.floor(d/4))&1?VC.pave:VC.pave2}
// the pavilion itself, pre-drawn at full resolution (day, and a lit night version) and laid over the park each frame
let V_PAVC=null,V_PAVC_K='';
function vPavCanvas(night){const key=S.you+DIMS.join(',')+(night?'n':'d');if(V_PAVC&&V_PAVC_K===key)return V_PAVC;V_PAVC_K=key;
 const pv=vPav(),pt=(f,d)=>({x:HX+Math.sin(f)*(pv.R+d)/FT,y:HY-(pv.cy+Math.cos(f)*(pv.R+d))/FT});
 const fm=pv.fm,sm=t=>t*t*(3-2*t),w=f=>{const a=Math.abs(f)/fm,t=clamp((1-a)/.3,0,1),gx=Math.abs(Math.sin(f)*pv.R/FT),gt=clamp((gx-118)/60,0,1);return sm(t)*sm(gt)};// tapers to nothing at the ends, and opens around the scoreboard's legs
 const A=pt(-fm,0),B=pt(fm,0),T=pt(0,40);const x0=Math.floor(Math.min(A.x,B.x)-30),x1=Math.ceil(Math.max(A.x,B.x)+40),y0=Math.floor(T.y-30),y1=Math.ceil(Math.max(A.y,B.y)+40);
 const c=document.createElement('canvas');c.width=x1-x0;c.height=y1-y0;const g=c.getContext('2d');g.translate(-x0,-y0);
 const rr=mulberry32(4242),N=180,F=k=>-fm+2*fm*k/N;
 const dOut=f=>12+24*w(f);
 const band=(din,dout,ox,oy)=>{g.beginPath();for(let k=0;k<=N;k++){const q=pt(F(k),din(F(k)));g[k?'lineTo':'moveTo'](q.x+ox,q.y+oy)}for(let k=N;k>=0;k--){const q=pt(F(k),dout(F(k)));g.lineTo(q.x+ox,q.y+oy)}g.closePath()};
 // the roof's shadow on the plaza, then the concourse floor under it
 band(f=>12*w(f),dOut,10,7);g.fillStyle='rgba(0,0,0,.2)';g.fill();
 band(f=>12+(1-w(f))*.5,dOut,0,0);g.fillStyle='#736c60';g.fill();
 g.save();band(f=>12,dOut,0,0);g.clip();g.fillStyle='#6a6458';for(let k=0;k<N;k+=2){const a=pt(F(k),0),b=pt(F(k),60);g.fillRect(a.x,a.y,1,1)}
 // fans on the concourse
 for(let k=0;k<420;k++){const f=-fm+rr()*2*fm,d=13+rr()*(dOut(f)-14),q=pt(f,d);const sh=V_SHIRTS[(rr()*V_SHIRTS.length)|0];g.fillStyle=`rgb(${sh})`;g.fillRect(Math.round(q.x)-1,Math.round(q.y),3,3);g.fillStyle=rr()<.5?'#2a1e16':'#d9a878';g.fillRect(Math.round(q.x),Math.round(q.y)-1,1,1)}
 g.restore();
 // the steel: two chords, a zig-zag of diagonals, radial ribs, and columns at the panel points
 const steel=(pts,wd,col)=>{g.strokeStyle=col;g.lineWidth=wd;g.beginPath();pts.forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y));g.stroke()};
 const P=9/(pv.R+12),K2=Math.floor(fm/P);g.lineCap='round';g.lineJoin='round';
 const inner=[],outer=[];for(let k=0;k<=N;k++){const f=F(k);inner.push(pt(f,12));outer.push(pt(f,dOut(f)))}
 g.strokeStyle='#4a525c';g.lineWidth=1.6;g.beginPath();
 for(let k=-K2;k<K2;k++){const f0=k*P,f1=(k+1)*P,a=pt(f0,k&1?dOut(f0):12),b=pt(f1,k&1?12:dOut(f1));if(w(f0)<.05&&w(f1)<.05)continue;g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}g.stroke();
 g.strokeStyle='#59626c';g.lineWidth=1.2;g.beginPath();for(let k=-K2;k<=K2;k+=2){const f=k*P;if(w(f)<.05)continue;const a=pt(f,12),b=pt(f,dOut(f));g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}g.stroke();
 steel(inner,3.4,'#3e454e');steel(inner,1.2,'#7a848f');
 steel(outer,5,'#2b3038');steel(outer,1.6,night?'#ffe2b8':'#ffcf9a');// fascia with its neon tube
 g.fillStyle='#262b31';for(let k=-K2;k<=K2;k+=4){const f=k*P;if(w(f)<.2)continue;for(const d of[12,dOut(f)]){const q=pt(f,d);g.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,4,4)}}
 // the food stands along the front, facing the promenade and the field
 const BL=20/(pv.R+5);for(let k=-Math.floor(fm/BL);k<Math.floor(fm/BL);k++){const f=(k+.5)*BL;if(w(f)<.55)continue;const col=V_BOOTH[vHash(k+40,77)%V_BOOTH.length],cs=`rgb(${col})`,dk=`rgb(${col.map(v=>v*.7|0)})`;
  const q=pt(f,6);g.save();g.translate(q.x,q.y);g.rotate(f);const bw=16/FT,bd=11/FT;
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(-bw/2+3,-bd/2+2,bw,bd);
  g.fillStyle=dk;g.fillRect(-bw/2,-bd/2,bw,bd*.55);g.fillStyle=`rgb(${col.map(v=>v*.82|0)})`;g.fillRect(-bw/2+2,-bd/2+2,bw-4,bd*.55-4);// kiosk roof
  for(let x=0;x<bw;x+=5){g.fillStyle=(x/5)&1?'#f4f1e8':cs;g.fillRect(-bw/2+x,-bd/2+bd*.55,Math.min(5,bw-x),bd*.33)}// striped awning
  g.fillStyle='#e8e1cf';g.fillRect(-bw/2,bd/2-bd*.12,bw,bd*.12);g.fillStyle='#ff9a1f';for(let x=4;x<bw-4;x+=7)g.fillRect(-bw/2+x,bd/2-bd*.1,3,2);
  g.restore()}
 if(night){// lit the way the park is lit, then the concourse's own light
  const m=document.createElement('canvas');m.width=c.width;m.height=c.height;m.getContext('2d').drawImage(c,0,0);
  g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='multiply';g.fillStyle='#6a73a0';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='destination-in';g.drawImage(m,0,0);g.restore();
  g.save();g.globalCompositeOperation='lighter';
  for(let k=0;k<=N;k+=3){const f=F(k);if(w(f)<.1)continue;const q=pt(f,12+dOut(f)/2-6),rad=16+dOut(f)*1.4;const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,rad);gr.addColorStop(0,'rgba(255,205,140,.13)');gr.addColorStop(1,'rgba(255,205,140,0)');g.fillStyle=gr;g.fillRect(q.x-rad,q.y-rad,rad*2,rad*2)}
  for(let k=-Math.floor(fm/BL);k<Math.floor(fm/BL);k++){const f=(k+.5)*BL;if(w(f)<.55)continue;const q=pt(f,1);const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,30);gr.addColorStop(0,'rgba(255,190,110,.35)');gr.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=gr;g.fillRect(q.x-30,q.y-30,60,60)}
  g.restore()}
 V_PAVC={c,x0,y0,outer,ow:Array.from({length:N+1},(_,k)=>w(F(k)))};return V_PAVC}
function drawNeon(c,vx0,vy0,scale,now){if(!ST||!ST.village||S.phase==='title')return;const night=!!S.night,P=vPavCanvas(night);
 c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.imageSmoothingEnabled=scale<1.6;c.drawImage(P.c,P.x0,P.y0);
 if(night){c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';const show=S.lightShow&&now-S.lightShow<6000,O=P.outer,n=O.length,seg=12;
  for(let i=0;i<n-1;i+=seg){let col='255,138,40';if(show){const k=Math.floor((now-S.lightShow)/120+i/seg)%4;col=['255,138,40','255,70,170','80,220,255','255,230,90'][k]}
   const t=Math.min(P.ow[i],P.ow[Math.min(n-1,i+seg)]);if(t<=.05)continue;const p=new Path2D();for(let j=i;j<=Math.min(n-1,i+seg);j++)j===i?p.moveTo(O[j].x,O[j].y):p.lineTo(O[j].x,O[j].y);
   c.strokeStyle=`rgba(${col},${.16*t})`;c.lineWidth=14;c.stroke(p);c.strokeStyle=`rgba(${col},${.42*t})`;c.lineWidth=5;c.stroke(p);c.strokeStyle=`rgba(255,240,220,${.9*t})`;c.lineWidth=1.4;c.stroke(p)}}
 c.restore()}
// what a town plot holds, and its look, pixel by pixel in the plot's own rotated frame
function vKind(P){if(P.kind)return P.kind;const fx=(P.x-HX)*FT,fy=(HY-P.y)*FT,wedge=fy>0&&Math.abs(Math.atan2(fx,fy)/RAD)<(ST.openTop||0)+8,k=(P.h>>>6)%100;
 if(P===vHall())return P.kind='hall';
 return P.kind=wedge?(k<26?'green':k<46?'pack':k<62?'block':k<74?'lot':k<86?'market':'park'):(k<58?'block':k<72?'lot':k<82?'market':k<92?'park':'pack')}
let V_HALL;function vHall(){if(V_HALL!==undefined)return V_HALL;V_HALL=null;let hd=1e9;const ci=Math.floor(HX/VS),cj=Math.floor(-280/VS);
 for(let i=ci-2;i<=ci+2;i++)for(let j=cj-2;j<=cj+2;j++){const P=vSeedG(i,j);if(P.t!=='town')continue;const d=Math.hypot(P.x-HX,P.y+280);if(d<hd){hd=d;V_HALL=P}}return V_HALL}
const V_RGB={};const vRGB=x=>V_RGB[x]||(V_RGB[x]=[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]);
const vDark=(c,f)=>[c[0]*f|0,c[1]*f|0,c[2]*f|0];
// is (x,y) under a roof? (buildings only; used to cast their shadows down and to the right)
function vRoofAt(x,y){const q=vNear(x,y),P=q.a;if(P.t!=='town'||q.e<12)return false;const K=vKind(P);if(K!=='block'&&K!=='pack'&&K!=='hall')return false;if(K!=='block')return true;
 const A=(P.h>>>13)&1?Math.PI/2:0,c=Math.cos(A),sn=Math.sin(A),dx=x-P.x,dy=y-P.y,ls=dx*c+dy*sn+600,lt=-dx*sn+dy*c+600,span=34+(P.h>>>9)%28,id=Math.floor(ls/span),span2=26+(vHash(id,P.h%977)%30),lt2=lt+vHash(id+5,P.h%991)%40;if(ls%span<3||lt2%span2<3)return false;return vHash(id*131+Math.floor(lt2/span2),P.h%9973)%100>=16}
const vShadowed=(x,y)=>vRoofAt(x-6,y-5)||vRoofAt(x-3,y-2.5);
function vTownCol(P,wx,wy,e){const K=vKind(P),A=(P.h>>>13)&1?Math.PI/2:0,c=Math.cos(A),sn=Math.sin(A),dx=wx-P.x,dy=wy-P.y,ls=dx*c+dy*sn+600,lt=-dx*sn+dy*c+600,n=vHash(Math.floor(wx/2),Math.floor(wy/2))&15;
 if(K==='block'||K==='pack'||K==='hall'){const span=K==='block'?34+(P.h>>>9)%28:999,m=ls%span,id=Math.floor(ls/span);
  const span2=K==='block'?26+(vHash(id,P.h%977)%30):999,lt2=lt+(K==='block'?vHash(id+5,P.h%991)%40:0),m2=lt2%span2,id2=Math.floor(lt2/span2),th=vHash(id*131+id2,P.h%9973);
  if(K==='block'&&m>=3&&m2>=3){const u=th%100;if(u<10){const cp=(ls|0)%9,lm=(lt2|0)%20,sh2=vHash(Math.floor(ls/9),Math.floor(lt2/20)+th%97);if(lm<1)return VC.edgeL;if(cp<1&&lm<13)return VC.edgeL;if(sh2%3&&cp>1&&cp<8&&lm>2&&lm<12)return lm>3&&lm<6?[40,52,64]:vRGB(['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24','#d9b04a'][(sh2>>>4)%6]);return VC.asph}// a little car park
   if(u<16){const tx=m-span/2,ty=m2-span2/2;return tx*tx+ty*ty<40?(tx<0&&ty<0?VC.orT2:VC.orT):VC.lawnA}}// a courtyard tree
  if(K==='block'&&(m<3||m2<3))return vShadowed(wx,wy)?vDark(VC.side2,.72):VC.side2;// alleys between the buildings
  const col=K==='hall'?vRGB('#e0781c'):K==='pack'?vRGB('#9aa3ab'):vRGB(V_ROOFS[th%V_ROOFS.length]);
  if(e<12||(K==='block'&&(m<4||m>span-2||m2<4||m2>span2-2)))return vDark(col,.7);// parapet
  if(K==='block'&&(m<5||m2<5))return vDark(col,.86);// the roof's shaded lip
  if(e<13.5)return vDark(col,1.08>1?1:1);
  if(K!=='block'&&lt%14<5&&e>18)return K==='hall'?vRGB('#f3a24a'):vRGB('#bfc8cf');// skylights
  return n===0?vDark(col,.95):col}
 if(K==='lot'){const rp=lt%46,cp=ls%11;if(rp>=18&&rp<28)return VC.asph;
  if(cp<1)return VC.edgeL;const row=Math.floor(lt/46)*2+(rp<18?0:1),colI=Math.floor(ls/11),h=vHash(row+P.h%977,colI);
  const inner=(rp<18?rp:rp-28),car=h%3!==0&&cp>2&&cp<9&&inner>2&&inner<16&&e>12;
  if(car){const cc=vRGB(['#c94a3a','#e8e4dc','#2a3a5a','#9aa3ad','#1b1f24','#d9b04a','#3f7a5a'][(h>>>4)%7]);return (inner>5&&inner<8)?[40,52,64]:cc}
  return n===0?VC.asph2:VC.asph}
 if(K==='green'){const m=ls%18;if(m>=14||e<12)return n<3?VC.soil2:VC.soil;if(lt%6<1)return vRGB('#b8c6cc');if(m>=6&&m<8)return vRGB('#f4f8f8');return (n&3)===0?vRGB('#cfdcd2'):vRGB('#dde8e0')}
 if(K==='park'){const d=Math.hypot((ls-600)/1.25,lt-600);if(Math.abs(d-30)<2.6)return VC.pave;return (n&7)===0?VC.lawnB:VC.lawnA}
 return (Math.floor(ls/6)+Math.floor(lt/6))&1?VC.pave:VC.pave2}// the market square
function villageCol(wx,wy){
 if(ST&&ST.openTop){const fx=(wx-HX)*FT,fy=(HY-wy)*FT;if(fy>0){const th=Math.atan2(fx,fy)/RAD;if(Math.abs(th)<ST.openTop){const r=Math.hypot(fx,fy),q=r-fenceDist(th);const pv=vPav(),dd=Math.hypot(fx,fy-pv.cy)-pv.R;if(q<88||dd<50)return vOutfield(wx,wy,q,th,r,fx,fy,dd)}}}
 const x=wx+2.2*Math.sin(wy*.21)+1.6*Math.sin(wy*.07+wx*.05),y=wy+2.2*Math.sin(wx*.19)+1.4*Math.sin(wx*.06-wy*.04);// rough-laid stone
 let n0=vNear(x,y),a=n0.a,b=n0.b,e=n0.e;
 if(a.t==='town'||b.t==='town'){n0=vNear(wx,wy);a=n0.a;b=n0.b;e=n0.e}// town streets are laid straight
 if(a.t==='town'||b.t==='town'){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;
  if(a.t==='town'&&b.t==='town'){const c0=e<6?(n===0?VC.asph2:VC.asph):e<7?VC.curb:e<10?(n<2?VC.side2:VC.side):null;if(c0)return vShadowed(wx,wy)?vDark(c0,.72):c0}
  else{if(e<4)return n<2?VC.side2:VC.side;if(e<7)return n<3?VC.wall2:VC.wall}}
 if(vLane(a,b)){if(e<5.5){const n=(Math.floor(wx/3)*7+Math.floor(wy/3)*13)&7;return n===0?VC.path2:VC.path}
  if(e<9){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}}
 else if(e<3.4){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}
 const P=a,s=wx*Math.cos(P.ang)+wy*Math.sin(P.ang),t=-wx*Math.sin(P.ang)+wy*Math.cos(P.ang);
 if(P.t==='town')return vTownCol(P,wx,wy,e);
 if(P.t==='orchard'){
  if(P.wind){const wb=vWindband(P,wx,wy);if(wb>=-30&&wb<12&&e>9){if(wb<-28)return VC.cedar3;const n=Math.sin(wx*.9)+Math.sin(wx*.37+wy*.5);return n>.9?VC.cedar2:VC.cedar}}
  const q=Math.floor(wy),p2=Math.floor(wx),cy2=Math.floor(q/22),cx2=Math.floor((p2+(cy2&1)*11)/22),lx=(p2+(cy2&1)*11)-cx2*22-11,ly=q-cy2*22-11,d2=lx*lx+ly*ly;
  const tcx=cx2*22+11-(cy2&1)*11,tcy=cy2*22+11,ok=vTreeOK(tcx,tcy,P);
  if(ok&&d2<64){const fr=vFruit(p2,q,tcx,tcy,cx2*7919+cy2*104729);if(fr)return fr===2?VC.orF2:VC.orF;
   if(d2<20&&lx<0&&ly<0)return VC.orT2;if(d2>=40&&lx+ly>3)return VC.orT3;return VC.orT}
  if(ok){const sx=lx-3,sy=ly-3;if(sx*sx+sy*sy<56)return VC.orSh}
  return (q>>1)&1?VC.orG:VC.orG2}
 if(P.t==='canola'){const st=Math.floor((t+Math.sin(s*.04)*4)/4)&1,n=vHash(Math.floor(wx/2),Math.floor(wy/2))&31;return n===0?VC.canG:st?VC.can1:VC.can2}
 if(P.t==='barley'){const st=Math.floor(t/6)&1;return P.gold?(st?VC.barG1:VC.barG2):(st?VC.bar1:VC.bar2)}
 if(P.t==='house'){const rr=vYard(P),ax=Math.abs(wx-P.x)-rr.w/2+(V_NOYARD.has(P)?1e4:0),ay=Math.abs(wy-P.y)-rr.h/2;
  if(ax<10&&ay<10){// the house's own stone wall, with a gap for the gate on the lane side
   if(ax>4||ay>4){const gate=ay>4&&wy>P.y&&Math.abs(wx-P.x-(P.h%3-1)*rr.w*.25)<10;if(!gate){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&15;return n<3?VC.wall2:n===15?VC.wall3:VC.wall}}
   const n=vHash(Math.floor(wx/2),Math.floor(wy/2))&15;return n===0?VC.yard2:VC.yard}
  if(P.h&16){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.pas1}}
 if(P.t==='lawn'){const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.lawn}
 if(P.t==='veg'||P.t==='house'){const st=Math.floor(t/5);if(st&1){const n=(Math.floor(s/3)+st)&1;return n?VC.crop:VC.crop2}return (Math.floor(s/2)&1)?VC.soil:VC.soil2}
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3))&7;return n===0?VC.pas2:VC.pas1}
// a town plot's lot: the biggest centred rectangle whose corners stay clear of the streets around it
const V_LOT=new Map();
function vLot(P){let r=V_LOT.get(P);if(r)return r;const Y=vYard(P);let w=Y.R*2.6,h=Y.R*2.2;
 for(let k=0;k<14;k++){const ok=[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]].every(([a,b])=>{const n=vNear(P.x+a*w/2,P.y+b*h/2);return n.a===P&&n.e>12});if(ok)break;w*=.92;h*=.92}
 r={w,h,R:Y.R};V_LOT.set(P,r);return r}
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
 const CR=closedRun(OL),V_EXT=[];let V_ROAD=null,roadLater=false;
 g.save();g.beginPath();CR.forEach((q,i)=>{const p=off(q,30);g[i?'lineTo':'moveTo'](p.x,p.y)});for(let i=CR.length-1;i>=0;i--)g.lineTo(CR[i].x,CR[i].y);g.closePath();g.fillStyle=night?'#2a2a2c':'#c8c0ae';g.fill();
 g.clip();g.fillStyle=night?'#232325':'#b9b09c';for(let y=0;y<CH;y+=6)for(let x=(y/6&1)*5;x<CW;x+=10)g.fillRect(x,y,1,6);for(let y=0;y<CH;y+=6)g.fillRect(0,y,CW,1);g.restore();
 // the paved road: around the closed part of the bowl, then out along the lanes of the outfield country on both ends
 g.save();g.lineCap='round';g.lineJoin='round';const road=night?'#1c1d20':'#6a6b6c',edgeC=night?'#2c2d30':'#8d8e8c';
 const RP=new Path2D();CR.forEach((q,i)=>{const p=off(q,42);RP[i?'lineTo':'moveTo'](p.x,p.y)});
 {// past the end of the stands the road runs on out through the orchards
  for(const[a2,b2]of[[CR[1],CR[0]],[CR[CR.length-2],CR[CR.length-1]]]){const p=off(b2,42),dx=p.x-ctr.x,dy=p.y-ctr.y,l=Math.hypot(dx,dy);RP.moveTo(p.x,p.y);RP.lineTo(p.x+dx/l*1400,p.y+dy/l*1400);V_EXT.push([p.x,p.y,p.x+dx/l*1400,p.y+dy/l*1400])}}
 V_ROAD=[RP,edgeC,road];g.strokeStyle=edgeC;g.lineWidth=13;g.stroke(RP);g.strokeStyle=road;g.lineWidth=10;g.stroke(RP);g.setLineDash([3,4]);g.strokeStyle=night?'#6b6030':'#e8d27a';g.lineWidth=1;g.stroke(RP);g.setLineDash([]);
 // the main road out of the village, straight down from the plate gate
 const bot=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),rx=cx(HX),ry0=bot.y+30;
 g.fillStyle=edgeC;g.fillRect(rx-6.5,ry0,13,CH-ry0);g.fillStyle=road;g.fillRect(rx-5,ry0,10,CH-ry0);g.fillStyle=night?'#6b6030':'#e8d27a';for(let y=ry0;y<CH;y+=8)g.fillRect(rx-.5,y,1,4);
 g.restore();
 const busy=(x,y,w,h)=>{// keep buildings off the apron, the roads and the park buffer
  const segD=(px,py,[ax,ay,bx,by])=>{const vx=bx-ax,vy=by-ay,t=clamp(((px-ax)*vx+(py-ay)*vy)/(vx*vx+vy*vy),0,1);return Math.hypot(px-ax-vx*t,py-ay-vy*t)};
  for(const S2 of V_EXT)if(segD(x+w/2,y+h/2,S2)<Math.hypot(w,h)/2+8)return true;
  if(Math.abs(x+w/2-rx)<w/2+10&&y+h>ry0-4)return true;
  const bx0=cx(0),by0=cy(0),bx1=cx(W),by1=cy(H);if(x+w>bx0-6&&x<bx1+6&&y+h>by0-6&&y<by1+6&&insidePoly(OL,x+w/2,y+h/2))return true;
  for(const[qx,qy]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h],[x+w/2,y+h/2]])if(insidePoly(OL,qx,qy))return true;
  return false};
 // ---- the houses: an anchae and a bakkeori facing each other across the yard, sometimes a third wing ----
 const i0=Math.floor(-e.mx/VS)-2,i1=Math.ceil((W+e.mx)/VS)+2,j0=Math.floor(-e.my/VS)-2,j1=Math.ceil((H+e.my)/VS)+2;
 const lamps=[];
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const P=vSeed(i,j);if(P.t!=='house')continue;const Y=vYard(P);
  const R={x:(P.x-Y.w/2+e.mx)/2,y:(P.y-Y.h/2+e.my)/2,w:Y.w/2,h:Y.h/2};
  if(R.w<14||R.x<-R.w||R.y<-R.h||R.x>CW||R.y>CH)continue;
  if(busy(R.x,R.y,R.w,R.h)){// no house where the road runs: grass the yard over instead
   if(!insidePoly(OL,R.x+R.w/2,R.y+R.h/2)){V_NOYARD.add(P);const x0=Math.max(0,Math.floor(R.x-7)),y0=Math.max(0,Math.floor(R.y-7)),x1=Math.min(CW,Math.ceil(R.x+R.w+7)),y1=Math.min(CH,Math.ceil(R.y+R.h+7));
    const im=g.getImageData(x0,y0,x1-x0,y1-y0),dd=im.data;let j=0;for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++,j+=4){const c=villageCol((px+.5)*2-e.mx,(py+.5)*2-e.my);dd[j]=c[0]*lt[0]/255;dd[j+1]=c[1]*lt[1]/255;dd[j+2]=c[2]*lt[2]/255;dd[j+3]=255}
    g.putImageData(im,x0,y0);roadLater=true}continue}
  const hr=mulberry32(P.h),core=Math.hypot(P.x-HX,P.y-(HY+760))<700,tile=hr()<(core?.4:.15);
  const mw=Math.round(R.w*(.84+hr()*.16)),mh=Math.max(7,Math.round(R.h*.38)),mx=Math.round(R.x+(R.w-mw)*hr()),my=Math.round(R.y);
  const roof=(x,y,w,h)=>tile?vTile(g,x+1,y+1,w-2,h-2,night):vThatch(g,x,y,w,h,night,hr);
  roof(mx,my,mw,mh);lamps.push([mx+mw/2,my+mh+1,mw]);
  const sw=Math.round(R.w*(.6+hr()*.25)),sh=Math.max(6,Math.round(R.h*.3)),sx=Math.round(R.x+(R.w-sw)*hr()),sy=Math.round(R.y+R.h-sh);
  if(hr()<.85){roof(sx,sy,sw,sh);lamps.push([sx+sw/2,sy-1,sw])}
  const yy=(my+mh+sy)/2;
  if(hr()<.75)vJars(g,Math.round(R.x+R.w*(.15+hr()*.4)),Math.round(yy-3),3+((hr()*2)|0),night,hr);
  if(hr()<.7)vTree(g,Math.round(R.x+R.w*(hr()<.5?.08:.92)),Math.round(yy+1),4,night,hr()<.6?'#ff9a1f':'#e8561c')}
 if(roadLater){g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=V_ROAD[1];g.lineWidth=13;g.stroke(V_ROAD[0]);g.strokeStyle=V_ROAD[2];g.lineWidth=10;g.stroke(V_ROAD[0]);g.setLineDash([3,4]);g.strokeStyle=night?'#6b6030':'#e8d27a';g.lineWidth=1;g.stroke(V_ROAD[0]);g.restore()}
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
// ---- the town's buildings, drawn in world pixels: once into the park buffer (the ones behind the open outfield)
// and once into the neighborhood layer, so a building that straddles the two lines up exactly ----
const V_ROOFS=['#d9d5ca','#c9c4b8','#e4e1d8','#b9b6ae','#5f9a78','#6f8fa8','#a8b39a','#cfc6b0','#b5654a','#7a9a6a','#d4cbb8','#8fa3b5'];
function vTownPlots(){const out=[],i0=Math.floor(-EXT_M.mx/VS)-1,i1=Math.ceil((W+EXT_M.mx)/VS)+1,j0=Math.floor(-EXT_M.my/VS)-1,j1=Math.ceil((H+EXT_M.my)/VS)+1;
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const P=vSeedG(i,j);if(P.t==='town')out.push(P)}return out}
// spots well inside a plot (clear of its streets and of the outfield road), for the things that sit on it
function vSpots(P,n,minE,rr){const out=[];for(let k=0;k<n*6&&out.length<n;k++){const x=P.x+(rr()-.5)*VS*.9,y=P.y+(rr()-.5)*VS*.9,q=vNear(x,y);if(q.a!==P||q.e<minE)continue;
  {const fx=(x-HX)*FT,fy=(HY-y)*FT,th=Math.atan2(fx,fy)/RAD;if(fy>-40&&Math.abs(th)<=48&&Math.hypot(fx,fy)<fenceDist(th)+30)continue}
  if(ST.openTop){const fx=(x-HX)*FT,fy=(HY-y)*FT,th=Math.atan2(fx,fy)/RAD;if(fy>0&&Math.abs(th)<ST.openTop&&(Math.hypot(fx,fy)-fenceDist(th)<96||Math.hypot(fx,fy-vPav().cy)-vPav().R<58))continue}
  out.push([x,y,q.e])}return out}
function vBuilding(g,x,y,w,h,col,ht,rr,glows){// a flat-roofed low-rise: parapet, water tank, AC units, stair hut
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.moveTo(x+w,y);g.lineTo(x+w+ht*.7,y+ht*.45);g.lineTo(x+w+ht*.7,y+h+ht*.45);g.lineTo(x+ht*.7,y+h+ht*.45);g.lineTo(x,y+h);g.closePath();g.fill();
 g.fillStyle=shade(col,-.25);g.fillRect(x,y,w,h);g.fillStyle=col;g.fillRect(x+2,y+2,w-4,h-4);g.fillStyle=shade(col,.12);g.fillRect(x+2,y+2,w-4,2);
 if(w>14&&h>12){const tx=x+4+Math.floor(rr()*(w-14)),ty=y+4+Math.floor(rr()*(h-12));g.fillStyle='#2d5f9a';g.beginPath();g.arc(tx+3,ty+3,3.2,0,7);g.fill();g.fillStyle='#4f86c6';g.beginPath();g.arc(tx+2.4,ty+2.4,1.6,0,7);g.fill()}
 for(let k=0;k<1+((rr()*3)|0);k++){const ax=x+3+Math.floor(rr()*(w-8)),ay=y+3+Math.floor(rr()*(h-7));g.fillStyle='#8a9096';g.fillRect(ax,ay,4,3);g.fillStyle='#5f656b';g.fillRect(ax+1,ay+1,2,1)}
 if(w>20&&rr()<.6){const sx=x+w-9,sy=y+3;g.fillStyle=shade(col,-.12);g.fillRect(sx,sy,6,6);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(sx+6,sy+1,2,6)}
 if(glows)for(let k=0;k<Math.max(1,w/14|0);k++)glows.push([x+4+rr()*(w-8),y+h+1])}
function vTownDraw(g,glows){if(!V_OL)V_OL=parkOutlineClosed();
 for(const P of vTownPlots()){const K=vKind(P),rr=mulberry32(P.h^0x9e37);
  if(K==='block'){for(const[x,y]of vSpots(P,4,22,rr)){if(rr()<.5){g.fillStyle='#2d5f9a';g.beginPath();g.arc(x,y,3.2,0,7);g.fill();g.fillStyle='#4f86c6';g.beginPath();g.arc(x-.6,y-.6,1.6,0,7);g.fill()}
    else{g.fillStyle='#8a9096';g.fillRect(Math.round(x),Math.round(y),4,3);g.fillStyle='#5f656b';g.fillRect(Math.round(x)+1,Math.round(y)+1,2,1)}}
   if(glows)for(const[x,y]of vSpots(P,5,10,rr))glows.push([x,y])}
  else if(K==='hall'){const[x,y]=[P.x,P.y];g.fillStyle='#2f7a3a';g.beginPath();g.arc(x,y,10,0,7);g.fill();g.fillStyle='#ff9a1f';g.beginPath();g.arc(x,y,8,0,7);g.fill();g.fillStyle='#ffc04a';g.fillRect(Math.round(x-5),Math.round(y-5),3,2);g.fillStyle='#3c8f44';g.fillRect(Math.round(x-1),Math.round(y-11),4,3);if(glows)for(const s2 of vSpots(P,6,10,rr))glows.push(s2)}
  else if(K==='park'){for(const[x,y]of vSpots(P,6,16,rr)){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.arc(x+3,y+3,6,0,7);g.fill();g.fillStyle='#2f6b2f';g.beginPath();g.arc(x,y,6,0,7);g.fill();g.fillStyle='#3f8040';g.beginPath();g.arc(x-2,y-2,3,0,7);g.fill()}}
  else if(K==='market'){for(const[x,y]of vSpots(P,9,18,rr)){const sx=Math.round(x-6),sy=Math.round(y-5),c=['#e0473d','#3f82e6','#ef6a1f','#3faa5b'][(rr()*4)|0];
    g.fillStyle='rgba(0,0,0,.2)';g.fillRect(sx+2,sy+2,13,11);for(let q=0;q<13;q+=2){g.fillStyle=q%4?'#f4f1e8':c;g.fillRect(sx+q,sy,2,11)}g.fillStyle='#ff9a1f';for(let q=0;q<3;q++)g.fillRect(sx+2+q*4,sy+12,3,2)}
   if(glows)for(const s2 of vSpots(P,3,12,rr))glows.push(s2)}
}}
