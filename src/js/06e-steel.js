// ---------- Changwon: Fossil Yard. The bowl is the shared one (06c) dressed in exposed dark-green steel: a braced glass
// facade, a long panelled canopy over the left grandstand, separate roof sections with open framing on the right, a
// trussed roof behind home. The stands wrap round to left- and right-centre; between them, behind the wall and the board,
// lies Rex Yard: a dark planted forest with a rock ridge and outcrops, one of them holding a fossil skeleton, and a big
// open steel truss arcs over the back of it from one stand to the other. Ground colours are one pure function of world
// position (steelCol); the truss, fossil and trees are shapes (sDecor, both layers); the entrance and plaza are drawn on the
// neighbourhood layer (drawSteel); night spotlights are laid over the frame (drawSteelLights). ----------
const S_ADS=[['창원 기계','#e8f0e0'],['REX MOTORS','#e2b93a'],['진해 벚꽃','#ffc2d6'],['STEEL WORKS','#e8f0e0'],['마산 아구찜','#e2b93a'],['DINO DIG','#e8f0e0'],['창원 은행','#b9e6c9'],['GEAR UP','#e8f0e0']];
const SC=(()=>{const h=hRGB;return{
 colL:h('#336a4f'),colD:h('#16342a'),brL:h('#3b765a'),brD:h('#1f4636'),beam:h('#24493a'),mull:h('#14261e'),hi:h('#5a9a78'),
 gD:h('#24363c'),gD2:h('#1d2d33'),gRef:h('#3e5a63'),
 rk1:h('#857a6a'),rk2:h('#9a8e7b'),rk3:h('#6e6457'),rkD:h('#4a4239'),rkS:h('#332d27'),rkH:h('#b3a690'),
 moss:h('#1f3a24'),moss2:h('#25442a'),fern:h('#2f5a32'),
 t1:h('#173a20'),t2:h('#1f4a28'),t3:h('#2c5e33'),t4:h('#3a7040'),tS:h('#0e2214'),
 path:h('#6f7672'),path2:h('#656c68'),pathJ:h('#555b58'),hedge:h('#1c3d24'),hedge2:h('#244b2c')}})();
// ---- the bowl's steel facade (called from hBowl): columns every bay, a big X brace in each bay over recessed glass ----
function sFacade(k,T,sF){const bw=18,m=((sF%bw)+bw)%bw;
 if(k<5.6){// the top girder that carries the roof: lit top, shaded face, a node plate over every column
  if(m<2.4&&k>2)return SC.hi;return k<3.4?SC.colL:SC.colD}
 const H=Math.max(2,T-7),v=clamp((k-5.6)/H,0,1);
 if(m<2.4)return m<1.2?SC.colL:SC.colD;// the columns, a lit face and a shaded one
 const u=(m-2.4)/(bw-2.4),d1=(u-v)*(bw-2.4),d2=(u+v-1)*(bw-2.4);
 if(Math.abs(d1)<.7||Math.abs(d2)<.7)return (d1+d2<0)?SC.brL:SC.brD;// the X brace
 const fl=((k-5.6)%4.6+4.6)%4.6,band=Math.floor((k-5.6)/4.6);if(fl<.7)return SC.beam;// a floor beam each level
 const sh=(d1>.7&&d1<1.9)||(d2>.7&&d2<1.9)||fl<1.5||m<3.6;// shadow from the brace, the beam above and the column
 if(((m-2.4)%3.2+3.2)%3.2<.35)return SC.mull;
 H_EMIS=H_NIGHT;
 if(H_NIGHT){const dim=(vHash(Math.floor(sF/bw),band)&7)===0;let c=dim?hMul(HB.glassN,.45):band&1?HB.glassN2:HB.glassN;return sh?hMul(c,.62):c}
 const c=(u+v*.4)%1<.18?SC.gRef:band&1?SC.gD2:SC.gD;return sh?hMul(c,.7):c}
// ---- the roofs (called from hBowl past the roof's inner edge): k ft in from the edge, Rd ft deep ----
// members drawn on a roof cast a short shadow down and to the right
function sMemb(k,s,Rd,home,L){
 if(home){const c1=Rd*.28,c2=Rd*.72,tri=Math.abs(((s/14)%2+2)%2-1),zig=c1+(c2-c1)*tri;
  if(Math.abs(k-c1)<.8||Math.abs(k-c2)<.8)return 1;if(k>c1&&k<c2&&Math.abs(k-zig)<.75)return 2;if(((s%28)+28)%28<1.3)return 2;return 0}
 if(L){const e0=Rd-3.6;if(k>e0){if(Math.abs(k-e0)<.6||k>Rd-.7)return 1;const tri=Math.abs(((s/7)%2+2)%2-1);if(Math.abs(k-(e0+.6+tri*2.3))<.6)return 2}return 0}
 return 0}
function sRoof(k,Rd,phi,sF,gapSeat){
 const home=Math.abs(phi)>150,L=phi<0;
 if(k<.8)return HB.gutter;
 // the right side: separate roof sections, with open steel framing over the seats in the gaps between them
 if(!L&&!home){const seg=((sF%58)+58)%58;if(seg<9){if(seg<1.3||seg>7.7)return seg<1.3?SC.colL:SC.colD;const t=(seg-1.3)/6.4,dg=Math.abs(k/Rd-t)*Rd,dg2=Math.abs(k/Rd-(1-t))*Rd;
   if(Math.abs(k-Rd*.5)<.6||dg<.6||dg2<.6)return SC.brL;if(Math.abs(k-Rd*.5+.9)<.5)return hMul(gapSeat(),.35);return hMul(gapSeat(),.62)}
  if(seg<10.2||seg>56.8)return SC.colD}
 const mb=sMemb(k,sF,Rd,home,L);if(mb)return mb===1?SC.colL:SC.brL;
 if(sMemb(k-.9,sF-.9,Rd,home,L))return hMul(HB.roof2,.66);// the members' shadow on the panels
 if(k<1.8)return HB.roofEdge;if(k>Rd-1)return HB.gutter;
 // light-grey metal panels 16 ft wide, ribbed, each its own tone
 const pw=L?20:16,pm=((sF%pw)+pw)%pw;if(pm<.9)return [70,76,82];if(pm<1.5)return hMul(HB.roof,1.06);// a dark joint, a lit lip
 const pr=Math.floor(k/(Rd/2.2));if(Math.abs(k-Rd/2.2)<.4&&!home)return [96,102,108];// the panels lap halfway up
 if(((pm%4)+4)%4<.45)return hMul(HB.rib,1.02);
 const h=vHash(Math.floor(sF/pw)+(home?77:L?11:33),3+pr),c=h%3===0?hMul(HB.roof,.92):h%3===1?HB.roof2:HB.roof;return hMul(c,1-.12*(k/Rd))}

// ---- Rex Yard: the truss line and the ground under it ----
let S_TR=null,S_TR_K='';
function sTruss(){const key=DIMS.join(',')+H_THEME;if(S_TR&&S_TR_K===key)return S_TR;S_TR_K=key;
 const end=ph=>{const R=hRout(ph)-10;return{x:H_CC.x+Math.sin(ph*RAD)*R,y:H_CC.y+Math.cos(ph*RAD)*R}};
 const A=end(-47),B=end(51),M={x:8,y:fenceDist(0)+H_WALLW+128},C={x:2*M.x-(A.x+B.x)/2,y:2*M.y-(A.y+B.y)/2};
 const P=[];for(let i=0;i<=240;i++){const t=i/240,u=1-t;P.push({x:u*u*A.x+2*u*t*C.x+t*t*B.x,y:u*u*A.y+2*u*t*C.y+t*t*B.y})}
 // the truss's distance from the bowl centre, tabulated by angle (half-degree steps from -70 to 70)
 const tab=new Float32Array(281).fill(-1);for(const p of P){const ph=hPhi(p.x,p.y),i=Math.round((ph+70)*2);if(i>=0&&i<281)tab[i]=Math.hypot(p.x-H_CC.x,p.y-H_CC.y)}
 for(let i=1;i<281;i++)if(tab[i]<0&&tab[i-1]>=0){let j=i;while(j<281&&tab[j]<0)j++;if(j<281){for(let q=i;q<j;q++)tab[q]=tab[i-1]+(tab[j]-tab[i-1])*(q-i+1)/(j-i+1)}i=j}
 return S_TR={P,tab}}
function sTrR(phi){const T=sTruss(),i=(phi+70)*2,i0=Math.floor(i);if(i0<0||i0>=280)return -1;const a=T.tab[i0],b=T.tab[i0+1];if(a<0||b<0)return -1;return a+(b-a)*(i-i0)}
// the rocks of Rex Yard, in (degrees off centre, ft past the wall, half-length, half-depth): the ridge pieces behind the board,
// outcrops left and right, and the big fossil rock on the right
const S_ROCKS=[[-26,46,20,11],[-33,30,11,8],[24,30,24,15],[33,52,13,9],[-18,70,12,8],[12,80,10,7],[-6,88,9,6]];
const S_FOSSIL={th:23,a:31};
// a rock face: big irregular blocks, lit on the upper left
function sRock(s,v,e){const ch=3.4,row=Math.floor(v/ch),off=(row&1)*2.7+(row%3)*1.1,L=5.5+(vHash(row,91)&3),bi=Math.floor((s+off)/L),fs=((s+off)%L+L)%L,fv=((v%ch)+ch)%ch;
 if(fs<.45||fv<.4)return SC.rkS;const h=vHash(bi+311,row);let c=h%4===0?SC.rk2:h%5===0?SC.rk3:SC.rk1;if(fv>ch-.7||fs>L-.7)c=hMul(c,1.15);else if(fv<.9)c=hMul(c,.82);return e<1.2?hMul(c,.7):c}
// trees seen from above: big canopies on a loose 30 px lattice with long shadows, smaller ones between, moss and ferns below
// a heap of boulders: the nearest of a jittered lattice of centres, each stone lit from the upper left, dark cracks between
function sBoulder(wx,wy){const cs=13,i=Math.floor(wx/cs),j=Math.floor(wy/cs);let d1=1e9,d2=1e9,bx=0,by=0,bh=0;
 for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const h=vHash(i+di+733,j+dj+211),cx=(i+di+.5)*cs+((h&7)-3.5)*1.3,cy=(j+dj+.5)*cs+(((h>>3)&7)-3.5)*1.3,d=Math.hypot(wx-cx,wy-cy);
  if(d<d1){d2=d1;d1=d;bx=cx;by=cy;bh=h}else if(d<d2)d2=d}
 if(d2-d1<1.3)return SC.rkS;const l=((wx-bx)+(wy-by))/cs;let c=bh%3===0?SC.rk2:bh%3===1?SC.rk1:SC.rk3;if(l<-.35)c=d2-d1<3?c:hMul(c,1.16);else if(l>.3)c=hMul(c,.74);return c}
function sTrees(wx,wy){
 {const cs=30,i=Math.floor(wx/cs),j=Math.floor(wy/cs);for(let di=0;di<2;di++)for(let dj=0;dj<2;dj++){const ii=i-di,jj=j-dj,h=vHash(ii*3+1,jj*7+2);if(h%5===0)continue;
   const cx=(ii+.5)*cs+((h&15)-7.5),cy=(jj+.5)*cs+(((h>>4)&15)-7.5),r=11+(h>>8&3)*1.5,dx=wx-cx,dy=wy-cy,d2=dx*dx+dy*dy;
   if(d2<r*r){const l=dx+dy;const b=(((Math.floor(wx/3)+Math.floor(wy/3))&1)&&d2>r*r*.5);return l<-r*.6?SC.t4:l<-r*.1?(b?SC.t3:SC.t3):l>r*.7?SC.t1:SC.t2}}}
 {const cs=30,i=Math.floor((wx-8)/cs),j=Math.floor((wy-7)/cs);const h=vHash(i*3+1,j*7+2);if(h%5){const cx=(i+.5)*cs+((h&15)-7.5)+8,cy=(j+.5)*cs+(((h>>4)&15)-7.5)+7,r=11+(h>>8&3)*1.5;if((wx-cx)**2+(wy-cy)**2<r*r)return SC.tS}}
 {const cs=14,i=Math.floor(wx/cs),j=Math.floor(wy/cs),h=vHash(i+501,j+77),cx=(i+.5)*cs+((h&7)-3.5),cy=(j+.5)*cs+(((h>>3)&7)-3.5),r=4+(h>>6&3);const dx=wx-cx,dy=wy-cy;
  if(dx*dx+dy*dy<r*r)return dx+dy<-r*.4?SC.t3:SC.t2}
 const f=vHash(Math.floor(wx/4),Math.floor(wy/4));return f%9===0?SC.fern:(f&1)?SC.moss:SC.moss2}
function steelCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 const phi=hPhi(x,y),TR=sTrR(phi);if(TR<0)return null;const rc=Math.hypot(x-H_CC.x,y-H_CC.y);
 if(rc>TR+16)return null;
 if(rc>TR-5){const t=rc-TR+5;if(t<1||t>20)return SC.pathJ;if(((Math.floor(phi*rc*RAD/10))&1)&&t>9.5&&t<10.5)return SC.path2;const p=vPerson(wx,wy,4);if(p)return p;return (n&7)?SC.path:SC.path2}// the service walk round the back
 if(!fair||q<0)return sTrees(wx,wy);
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 if(a<4)return a<1?SC.hedge:(n&3)?SC.hedge:SC.hedge2;// a clipped hedge along the back of the wall
 // the ridge behind the board: a stacked-rock retaining wall, mossy on top
 if(ath<19){const top=34+4*Math.cos(th*.35)-Math.max(0,ath-12)*1.2;if(a>8&&a<top){if(a>top-2)return (n&1)?SC.moss2:SC.fern;if(a<9.3)return SC.rkD;return sRock(s,a,Math.min(a-8,top-a))}}
 for(const[t0,a0,rs,ra]of S_ROCKS){const ds=(th-t0)*RAD*r,da=a-a0,e=(ds*ds)/(rs*rs)+(da*da)/(ra*ra);if(e<1.25){const rim=1+.12*Math.sin(Math.atan2(da,ds)*4+t0);
   if(e<rim){const l=-ds/rs-da/ra;let c=sBoulder(wx,wy);if(l<-.6)c=hMul(c,.8);if(e>rim*.82)c=hMul(c,.86);return c}
   if(e<rim*1.18&&(ds+da>0))return SC.tS}}// a short shadow on the low side
 return sTrees(wx,wy)}

// ---- shapes past the wall (world px; both layers) ----
const S_FOSSIL_PX=[// a rex skeleton in profile, set into the rock (B bone, b bone shade)
 '..........................bbbb....',
 '........................bBBBBBb...',
 '.......................bBB.BBBBB..',
 '........B..B..B..B....bBBBBBBBbBB.',
 '.....bBBBBBBBBBBBBBBBBBBBBBB..b.B.',
 '...bBBB.B.B.B.B.B.BBBBBB...bB.....',
 '.bBB....B.B.B.B.B.BB.......B.B....',
 'bB......b.b.b.b...BB......B.......',
 'B.................bBB.............',
 '...................BBb............',
 '..................bB.B............',
 '.................bB...B...........',
 '................BB....BB..........',
 '...............BBB...BBB..........'];
function sXY(th,a){const r=fenceDist(Math.max(-45,Math.min(45,th)))+hPenOff(th)+H_WALLW+a;return{x:HX+Math.sin(th*RAD)*r/FT,y:HY-Math.cos(th*RAD)*r/FT}}
function sDecor(g){const night=!!H_NIGHT;
 // the fossil, laid into a dressed slab on the big right-hand rock
 {const p=sXY(S_FOSSIL.th,S_FOSSIL.a),cw=2,W=S_FOSSIL_PX[0].length*cw,Hh=S_FOSSIL_PX.length*cw,x0=Math.round(p.x-W/2),y0=Math.round(p.y-Hh/2);
  g.fillStyle='#3a332b';g.fillRect(x0-5,y0-5,W+10,Hh+10);g.fillStyle='#5a5044';g.fillRect(x0-4,y0-4,W+8,Hh+8);g.fillStyle='#4a4238';g.fillRect(x0-4,y0+Hh+2,W+8,2);
  S_FOSSIL_PX.forEach((row,j)=>{for(let i=0;i<row.length;i++){const c=row[i];if(c==='.')continue;g.fillStyle=c==='B'?'#e6dcc4':'#a8987a';g.fillRect(x0+i*cw,y0+j*cw,cw,cw);g.fillStyle='rgba(30,24,18,.5)';g.fillRect(x0+i*cw+1,y0+j*cw+cw,cw,1)}})}
 // a few tall trees standing out of the canopy
 for(const[th,a,r]of[[-30,92,9],[-12,104,8],[6,108,10],[20,96,8],[30,74,7],[-22,24,6],[14,40,6],[-38,60,7]]){const p=sXY(th,a);hGreenTree(g,p.x,p.y,r,false)}
 // spotlight housings by the rocks
 for(const[th,a]of S_SPOTS){const p=sXY(th,a);g.fillStyle='#1a1f1c';g.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,3,3);g.fillStyle='#d9c9a0';g.fillRect(Math.round(p.x),Math.round(p.y)-1,1,1)}
 // the outfield truss: a pair of chords with a zigzag web, cross ties at the nodes and footings where it lands, with its shadow
 const T=sTruss(),pts=T.P.map(p=>({x:HX+p.x/FT,y:HY-p.y/FT}));
 const nrm=i=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return{x:-dy/l,y:dx/l}};
 const off=(i,o)=>{const n2=nrm(i);return{x:pts[i].x+n2.x*o,y:pts[i].y+n2.y*o}};const HW=18;// half the truss depth (px)
 const L=[];let acc=0;for(let i=0;i<pts.length;i++){if(i)acc+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);L.push(acc)}
 const nodes=[];{const n=Math.round(acc/40);for(let k=0;k<=n;k++){const tgt=acc*k/n;let i=0;while(i<L.length-1&&L[i]<tgt)i++;nodes.push(i)}}
 const draw=(dx,dy,colA,colB,w)=>{g.lineCap='square';
  for(const o of[-HW,HW]){g.strokeStyle=colA;g.lineWidth=w;g.beginPath();pts.forEach((p,i)=>{const q=off(i,o);g[i?'lineTo':'moveTo'](q.x+dx,q.y+dy)});g.stroke()}
  g.strokeStyle=colB;g.lineWidth=w*.7;g.beginPath();nodes.forEach((i,k)=>{const q=off(i,k&1?HW:-HW);g[k?'lineTo':'moveTo'](q.x+dx,q.y+dy)});g.stroke();
  g.beginPath();nodes.forEach(i=>{const a=off(i,-HW),b=off(i,HW);g.moveTo(a.x+dx,a.y+dy);g.lineTo(b.x+dx,b.y+dy)});g.stroke()};
 draw(10,9,'rgba(0,0,0,.26)','rgba(0,0,0,.2)',4);
 draw(0,0,'#163428','#1e4434',4);draw(-.8,-.8,'#3f7d5e','#336a4f',1.4);
 nodes.forEach((i,k)=>{for(const o of[-HW,HW]){const q=off(i,o);g.fillStyle='#0f241b';g.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,5,5);g.fillStyle='#5a9a78';g.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,2,2)}});
 for(const i of[nodes[0],nodes[nodes.length-1],nodes[Math.round(nodes.length*.3)],nodes[Math.round(nodes.length*.7)]]){const q=pts[i];g.fillStyle='rgba(0,0,0,.3)';g.fillRect(q.x-4,q.y-2,22,14);g.fillStyle='#4a524e';g.fillRect(q.x-7,q.y-7,14,14);g.fillStyle='#1e4434';g.fillRect(q.x-5,q.y-5,10,10);g.fillStyle='#3f7d5e';g.fillRect(q.x-5,q.y-5,10,2)}}
const S_SPOTS=[[-26,32],[-33,20],[-20,46],[24,14],[30,24],[16,38],[33,42],[-10,20],[10,20],[-4,58],[-16,62]];
// ---- the neighbourhood layer (half resolution): the main entrance behind home and its plaza ----
function drawSteel(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=Math.round(cx(HX)),gy=Math.round(tip.y);
 // the plaza: big slabs, a lighter walk to the doors, lawn beds with trees down both sides, lamp posts, steps to the street
 const PV=night?['#4b4e55','#42454c','#5a5d63','#50535a','#3a3d43']:['#a9aba6','#989a95','#c2c3bd','#b3b4ae','#8a8c87'];
 g.fillStyle=PV[0];g.beginPath();g.moveTo(gx-150,gy-10);g.lineTo(gx+150,gy-10);g.lineTo(gx+196,gy+132);g.lineTo(gx-196,gy+132);g.closePath();g.fill();
 g.save();g.clip();g.fillStyle=PV[1];for(let y=gy-10;y<gy+140;y+=9)g.fillRect(gx-210,y,420,1);for(let x=gx-210;x<gx+210;x+=13)g.fillRect(x,gy-10,1,150);g.restore();
 g.fillStyle=PV[2];g.fillRect(gx-30,gy,60,132);g.fillStyle=PV[3];for(let y=gy+2;y<gy+132;y+=8)g.fillRect(gx-30,y,60,1);
 for(let y=gy+121;y<gy+132;y+=3){g.fillStyle=PV[4];g.fillRect(gx-190,y,380,1)}// steps
 for(const sd of[-1,1]){// a long lawn bed on each side, a double row of trees in it, a cherry tree at each end
  const bx0=sd<0?gx-128:gx+52,bw=76,by0=gy+14,bh=96;g.fillStyle=night?'#22301f':'#4d6b3c';g.fillRect(bx0,by0,bw,bh);g.fillStyle=night?'#2a3a26':'#5b7c47';g.fillRect(bx0,by0,bw,2);
  g.fillStyle=night?'#3a3c40':'#c9cac4';g.fillRect(bx0-2,by0-2,bw+4,2);g.fillRect(bx0-2,by0+bh,bw+4,2);g.fillRect(bx0-2,by0,2,bh);g.fillRect(bx0+bw,by0,2,bh);
  for(let r2=0;r2<2;r2++)for(let k2=0;k2<4;k2++){const tx=bx0+19+r2*38,ty=by0+12+k2*24,pink=(k2===0||k2===3)&&r2===(sd<0?0:1);(pink?hBlossom:hGreenTree)(g,tx,ty,9,night)}
  for(let k2=0;k2<4;k2++){const lx=gx+sd*40,ly=gy+20+k2*30;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(lx+1,ly+1,3,2);g.fillStyle='#1e2a24';g.fillRect(lx-1,ly-1,3,3);g.fillStyle=night?'#ffe0a0':'#d9d4c0';g.fillRect(lx,ly,1,1)}}
 // the fossil footprint stone at the heart of the plaza, in a ring of low planting
 {const sx=gx,sy=gy+70;g.fillStyle=night?'#1f2c1d':'#2f4a2c';g.beginPath();g.ellipse(sx,sy,22,16,0,0,7);g.fill();g.fillStyle=night?'#2c3d29':'#3d5e38';for(let a=0;a<7;a+=.45)g.fillRect(Math.round(sx+Math.cos(a)*19)-1,Math.round(sy+Math.sin(a)*13)-1,2,2);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(sx+4,sy+4,13,9,.2,0,7);g.fill();g.fillStyle='#8f8676';g.beginPath();g.ellipse(sx,sy,13,9,.2,0,7);g.fill();
  g.fillStyle='#a89e8c';g.beginPath();g.ellipse(sx-3,sy-3,8,5,.2,0,7);g.fill();
  g.fillStyle='#4e463b';g.fillRect(sx-2,sy,4,3);for(const[dx,dy]of[[-4,-5],[0,-6],[4,-5]])g.fillRect(sx+dx-1,sy+dy,2,5)}
 // the entrance block projecting from the facade: braced steel bays over amber glass, a trussed roof slab
 const EW=230,ED=40,ex0=gx-EW/2,ey0=gy-ED+6;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(ex0+6,ey0+6,EW,ED);
 g.fillStyle=night?'#ffc46a':'#2e434a';g.fillRect(ex0,ey0+14,EW,ED-14);
 if(night){g.fillStyle='#ffb04a';for(let x=ex0;x<ex0+EW;x+=23)g.fillRect(x+2,ey0+28,19,1)}
 for(let x=ex0,b=0;x<ex0+EW;x+=23,b++){g.fillStyle='#14261e';for(let mx=x+6;mx<x+23;mx+=6)g.fillRect(mx,ey0+14,1,ED-14);
  g.strokeStyle='#2c5c44';g.lineWidth=2;g.beginPath();g.moveTo(x+3,ey0+14);g.lineTo(x+23,ey0+ED);g.moveTo(x+23,ey0+14);g.lineTo(x+3,ey0+ED);g.stroke();
  g.fillStyle='#336a4f';g.fillRect(x,ey0+10,3,ED-10);g.fillStyle='#16342a';g.fillRect(x+3,ey0+10,1,ED-10)}
 g.fillStyle='#336a4f';g.fillRect(ex0+EW-3,ey0+10,3,ED-10);
 g.fillStyle='#b9bec3';g.fillRect(ex0-6,ey0,EW+12,14);g.fillStyle='#e2e5e8';g.fillRect(ex0-6,ey0,EW+12,2);g.fillStyle='#5d646b';g.fillRect(ex0-6,ey0+12,EW+12,2);
 g.strokeStyle='#1e4434';g.lineWidth=2;g.beginPath();g.moveTo(ex0-6,ey0+7);for(let x=ex0-6,k2=0;x<=ex0+EW+6;x+=12,k2++)g.lineTo(x,ey0+(k2&1?3:11));g.stroke();
 g.fillStyle='#3f7d5e';for(let x=ex0-6;x<=ex0+EW+6;x+=24)g.fillRect(x-1,ey0+1,3,12);
 // the doors under a dark sign: FOSSIL YARD over CHANGWON REXES
 g.fillStyle='#0d1a14';g.fillRect(gx-62,ey0+15,124,22);g.fillStyle='#2c5c44';g.fillRect(gx-62,ey0+15,124,1);g.fillRect(gx-62,ey0+36,124,1);
 g.textAlign='center';g.textBaseline='middle';g.fillStyle='#c9d6cd';g.font='bold 7px "Pixelify Sans", monospace';g.fillText('FOSSIL YARD',gx,ey0+20);
 g.fillStyle=night?'#fff1cf':'#f1ead6';g.font='bold 10px "Pixelify Sans", monospace';g.fillText('CHANGWON REXES',gx,ey0+30);
 if(LOGO[k]){g.imageSmoothingEnabled=false;g.drawImage(LOGO[k],gx-80,ey0+15,16,16);g.drawImage(LOGO[k],gx+64,ey0+15,16,16)}
 // green banners with an R either side
 for(const sd of[-1,1]){const bx=gx+sd*96-6,by=ey0+8;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(bx+3,by+3,12,30);g.fillStyle='#1d4a34';g.fillRect(bx,by,12,28);g.beginPath();g.moveTo(bx,by+28);g.lineTo(bx+6,by+33);g.lineTo(bx+12,by+28);g.fill();
  g.fillStyle='#2f6e4f';g.fillRect(bx,by,12,2);g.fillStyle='#e8f0e0';g.font='bold 9px "Pixelify Sans", monospace';g.fillText('R',bx+6,by+15)}}
// ---- night: warm spotlights on the rocks and trees, the fossil, the entrance and plaza ----
let S_NL=null,S_NL_K='';
function drawSteelLights(c,vx0,vy0,scale,now){if(!ST||ST.bowl!=='steel'||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!S_NL||S_NL_K!==key){S_NL_K=key;const pts=[];for(let th=-45;th<=45;th+=1)pts.push(sXY(th,0));const x0=Math.min(...pts.map(p=>p.x))-420,y0=Math.min(...pts.map(p=>p.y))-420,x1=Math.max(...pts.map(p=>p.x))+420,y1=Math.max(...pts.map(p=>p.y))+80;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  // Rex Yard sits dark under the night sky (multiplied in), so the spotlights read
  const tc=document.createElement('canvas');tc.width=cv.width;tc.height=cv.height;const t=tc.getContext('2d');t.scale(S2,S2);t.translate(-x0,-y0);t.fillStyle='rgb(112,120,124)';
  {const T=sTruss();t.beginPath();for(let th=-46;th<=46;th+=1){const p=sXY(th,3);t.lineTo(p.x,p.y)}for(let i=T.P.length-1;i>=0;i--){const p=T.P[i];t.lineTo(HX+p.x/FT,HY-p.y/FT)}t.closePath();t.fill()}
  for(const[th,a]of S_SPOTS){const p=sXY(th,a);glow(p.x,p.y,40,'255,170,80',.4)}
  {const p=sXY(S_FOSSIL.th,S_FOSSIL.a);glow(p.x,p.y,62,'255,214,150',.5)}
  for(let th=-16;th<=16;th+=4){const p=sXY(th,12);glow(p.x,p.y,30,'255,176,80',.32)}
  S_NL={cv,tc,x0,y0,x1,y1};
  {const OL=hOutline(),tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gc=document.createElement('canvas');gc.width=480;gc.height=360;const q=gc.getContext('2d'),gl=(x,y,r,col,a)=>{const gr=q.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);q.fillStyle=gr;q.fillRect(x-r,y-r,r*2,r*2)};
   gl(240,50,170,'255,196,110',.42);gl(240,170,46,'255,220,160',.45);for(const sd of[-1,1])for(let k=0;k<4;k++)gl(240+sd*(46+k*28),86+k*28,26,'255,224,160',.32);S_NL.gate={cv:gc,x:tip.x-480,y:tip.y-100}}}
 const N=S_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='multiply';c.drawImage(N.tc,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);c.globalCompositeOperation='lighter';c.drawImage(N.cv,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);if(N.gate)c.drawImage(N.gate.cv,N.gate.x,N.gate.y,960,720);c.restore()}
// ---- the board (K units): a dark-green steel frame carried on braced steel legs, a truss along its crown ----
function drawJumboSteel(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,night=!!S.night,fy=(HY-fenceDist(0)/FT)/K,yb=fy-8,yt=y0+h+2,legs=[x0+22,cx,x0+w-22];
 g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.moveTo(x0+8,yb+1);g.lineTo(x0+w-8,yb+1);g.lineTo(x0+w+34,yb+14);g.lineTo(x0+46,yb+14);g.closePath();g.fill();
 const by1=yt+(yb-yt)*.3,by2=yt+(yb-yt)*.62;g.strokeStyle=night?'#244a39':'#2c5c44';g.lineWidth=1.6;g.beginPath();g.moveTo(legs[0],by1);g.lineTo(legs[2],by1);g.moveTo(legs[0],by2);g.lineTo(legs[2],by2);
 for(let x=legs[0],k=0;x<legs[2]-1;x+=12,k++){g.moveTo(x,k&1?by1:by2);g.lineTo(Math.min(legs[2],x+12),k&1?by2:by1)}g.stroke();
 for(const lx of legs){g.fillStyle=night?'#2c5c44':'#3b765a';g.fillRect(lx-4,yt,4,yb-yt);g.fillStyle=night?'#102a1f':'#16342a';g.fillRect(lx,yt,4,yb-yt);
  g.strokeStyle='rgba(8,20,14,.8)';g.lineWidth=.7;g.beginPath();for(let y=yt;y<yb-1;y+=6){g.moveTo(lx-4,y);g.lineTo(lx+4,y+6);g.moveTo(lx+4,y);g.lineTo(lx-4,y+6)}g.stroke();
  g.fillStyle='#4a524e';g.fillRect(lx-8,yb-2,16,5);g.fillStyle='#6b746f';g.fillRect(lx-8,yb-2,16,1.5)}
 drawJumbo0(g,now,true);
 g.strokeStyle='#2c5c44';g.lineWidth=3;g.strokeRect(x0-3.5,y0-3.5,w+7,h+7);g.strokeStyle='#4a8a6a';g.lineWidth=1;g.strokeRect(x0-5,y0-5,w+10,h+10);
 // the crown truss, running past the board's ends
 const ty=y0-12;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x0-12+5,ty+4,w+24,9);g.strokeStyle='#1e4434';g.lineWidth=1.6;g.beginPath();g.moveTo(x0-12,ty);g.lineTo(x0+w+12,ty);g.moveTo(x0-12,ty+7);g.lineTo(x0+w+12,ty+7);
 for(let x=x0-12,k=0;x<x0+w+12;x+=8,k++){g.moveTo(x,k&1?ty:ty+7);g.lineTo(x+8,k&1?ty+7:ty)}g.stroke();g.strokeStyle='#4a8a6a';g.lineWidth=.8;g.beginPath();g.moveTo(x0-12,ty-.6);g.lineTo(x0+w+12,ty-.6);g.stroke();
 for(const sx of[x0-12,x0+w+8]){g.fillStyle='#16342a';g.fillRect(sx,ty-2,4,h+20);g.fillStyle='#3b765a';g.fillRect(sx,ty-2,1.5,h+20)}}
