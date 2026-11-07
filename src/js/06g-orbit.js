// ---------- Incheon: Orbit Park. The shared bowl (06c) in silver metal and glass: a facade of metal panels with long glass
// bands and a magenta line along the top, roofs of silver panels with skylights. Past the outfield wall: the mission-control
// building behind centre (its roof, skylights, plant and a round control room; the board is mounted on its front), Orbit Hill
// behind left (a sloped picnic lawn in three terraces with paths, blankets and pink trees), and the aerospace concourse behind
// right (a glass-fronted restaurant block, a terrace over the wall, an upper walk). Round all of it, the two halves of the
// retractable roof sit parked open: two great curved silver vaults rising from each side and almost meeting behind the board.
// The coast lies far off to the upper left, with the port; Songdo's towers and an airliner on approach are drawn on the
// neighbourhood layer. Every colour is a pure function of world position (orbitCol); signs, blankets and trees are shapes. ----------
const O_ADS=[['인천 공항','#f4f1f8'],['COSMOS AIR','#ff6fa0'],['송도 타워','#f4f1f8'],['ORBIT RAMEN','#ffc878'],['인천 항만','#f4f1f8'],['NEBULA SODA','#ff6fa0'],['월미도','#ffc878'],['LAUNCH BANK','#f4f1f8']];
const OC=(()=>{const h=hRGB;return{
 sil:h('#d3d8df'),sil2:h('#c3c9d1'),sil3:h('#b0b7c1'),silL:h('#eef1f5'),silD:h('#8e96a2'),seam:h('#7d8591'),
 stl:h('#3a3f4a'),stlL:h('#5a616d'),stlD:h('#22262e'),und:h('#1b1f28'),und2:h('#262b36'),mag:h('#e94e77'),magL:h('#ff8ab0'),
 gl:h('#2e4260'),gl2:h('#3a5274'),glR:h('#6a86aa'),glN:h('#ffc878'),glN2:h('#ffb35a'),
 lawn:h('#4fa24a'),lawn2:h('#5aad52'),lawn3:h('#6ab95e'),lawnD:h('#3e8a3c'),wallS:h('#a9a39a'),wallS2:h('#8e887f'),path:h('#cfc6b4'),path2:h('#bdb4a2'),
 deck:h('#4a4f5c'),deck2:h('#424754'),pave:h('#b9bcc2'),pave2:h('#aeb1b8'),paveJ:h('#9599a1'),
 roofB:h('#5c626e'),roofB2:h('#545a66'),unit:h('#8a929e'),unitD:h('#6a717c')}})();
// ---- the bowl's facade: silver panels with long horizontal glass bands, a magenta line along the top ----
function oFacade(k,T,sF){
 if(k<1.6)return OC.mag;if(k<2.4)return OC.silL;
 const v=k-2.4,fl=((v%5)+5)%5,band=Math.floor(v/5),pm=((sF%9)+9)%9;
 if(pm<.5)return OC.seam;// panel joints
 if(fl>1.4&&fl<4){if(((sF%3.6)+3.6)%3.6<.35)return OC.stl;H_EMIS=H_NIGHT;// a glass band each floor
  if(H_NIGHT){const dim=(vHash(Math.floor(sF/18),band)&7)===0;return dim?hMul(OC.glN,.45):band&1?OC.glN2:OC.glN}
  return fl<2?OC.gl2:(sF*.07+fl*.3)%1<.12?OC.glR:OC.gl}
 if(fl<=1.4)return fl<.5?OC.silD:OC.sil2;return OC.sil}
// ---- the bowl's roofs: silver panels with ribs and rows of skylights, a magenta strip along the inner edge ----
function oRoof(k,Rd,phi,sF){
 if(k<.7)return OC.mag;if(k<1.8)return OC.stl;if(k>Rd-1)return OC.silD;
 const rib=((sF%24)+24)%24;if(rib<1)return rib<.5?OC.stlL:OC.stl;
 if(((sF%4)+4)%4<.35)return OC.seam;
 const t=(k-1.8)/Math.max(1,Rd-2.8),sk=t>.3&&t<.62&&((sF%24)+24)%24>4&&((sF%24)+24)%24<20;
 if(sk){if(((sF%4)+4)%4<.8)return OC.stl;H_EMIS=H_NIGHT;return H_NIGHT?OC.glN2:OC.gl2}// skylights
 return t<.3?OC.silL:t<.8?OC.sil:OC.sil2}
// ---- the retractable roof, parked open: a curved vault on each side, a ft past the wall, from the poles to near centre ----
const O_ROOF={a0:46,a1:102,tEnd:3.5};
function oVault(a,s,th){
 const A=a-O_ROOF.a0,W=O_ROOF.a1-O_ROOF.a0,t=A/W,ath=Math.abs(th),end=(ath-O_ROOF.tEnd)*RAD*(fenceDist(Math.min(45,ath))+a);
 if(end<0)return null;
 if(end<2.4)return end<1.2?OC.stlD:OC.stl;// the end of the vault: its steel arch rib
 if(A<1.4)return OC.mag;// a magenta strip along the leading edge
 if(A<4.2){const m=((s%6)+6)%6;return m<.8?OC.stlL:OC.und}// the dark underside and its truss, seen at the leading edge
 if(A<5.2)return OC.stlD;
 const rib=((s%30)+30)%30;if(rib<1.3)return rib<.6?OC.stlL:OC.stl;// the main arch ribs
 if(((s%6)+6)%6<.3||((A%7)+7)%7<.3)return OC.seam;// panel seams both ways
 // skylight rows high on the vault
 if(t>.32&&t<.58&&rib>4&&rib<26&&((A%7)+7)%7>1.2){if(((s%6)+6)%6<.9)return OC.stl;H_EMIS=H_NIGHT;return H_NIGHT?OC.glN:((s*.05+A*.1)%1<.15?OC.glR:OC.gl)}
 // the vault's curve, in four tones: lit as it rises, brightest at the crown, falling into shade at the back
 return t<.2?OC.sil3:t<.32?OC.sil2:t<.7?(t<.5?OC.silL:OC.sil):t<.88?OC.sil2:OC.silD}
// ---- Orbit Hill: the picnic lawn ----
function oLawn(a,s,wx,wy){
 const ter=[16,29];for(const tA of ter){if(Math.abs(a-tA)<.8)return OC.wallS;if(a>tA+.8&&a<tA+2)return OC.lawnD}// low retaining walls and their shadow
 if(Math.abs(((s+a*1.3)%70+70)%70-35)<1.8)return((Math.floor(a/2))&1)?OC.path:OC.path2;// a path climbing the hill on the diagonal
 const tier=a<16?0:a<29?1:2,n=vHash(Math.floor(wx/3),Math.floor(wy/3));
 const c=[OC.lawn,OC.lawn2,OC.lawn3][tier];return (n%11===0)?hMul(c,.9):(Math.floor((s+a)/5)&1)?c:hMul(c,.96)}
// ---- the aerospace concourse ----
function oConc(a,s,wx,wy){
 if(a<5){if(((s%3)+3)%3<.4)return OC.stl;const p=vPerson(wx,wy,26);if(p)return p;return OC.deck}// the terrace on the wall, its rail posts
 if(a<6)return OC.silL;
 if(a<9){if(((s%18)+18)%18<1.2)return OC.stl;H_EMIS=H_NIGHT;return H_NIGHT?((Math.floor(s/6)&1)?OC.glN:OC.glN2):((s*.08)%1<.15?OC.glR:OC.gl)}// glass-fronted restaurants
 if(a<10)return OC.stlD;
 if(a<28){// their roof: grey membrane, rooftop units, a long skylight
  const u=((s%26)+26)%26;if(u<1)return OC.stl;if(Math.abs(a-19)<1.6&&u>3&&u<23){H_EMIS=H_NIGHT;return H_NIGHT?OC.glN2:OC.gl2}
  if(a>12&&a<15&&u>6&&u<10)return a<12.6?OC.unitD:OC.unit;return (Math.floor(a/3)&1)?OC.roofB:OC.roofB2}
 if(a<29.4)return OC.mag;
 if(a<40){const p=vPerson(wx,wy,10);if(p)return p;if((((s%9)+9)%9)<.35||(((a%9)+9)%9)<.35)return OC.paveJ;return (vHash(Math.floor(s/9),Math.floor(a/9))&3)?OC.pave:OC.pave2}// the upper walk
 if(((s%18)+18)%18<1.5)return OC.stl;return OC.stlD}// the steel frame carrying the vault's foot
// ---- mission control ----
function oMC(a,s){
 if(a<3)return OC.stlD;
 if(a<12){const fl=((a-3)%3+3)%3;if(fl<.6)return OC.stl;if(((s%5)+5)%5<.5)return OC.stlL;H_EMIS=H_NIGHT;return H_NIGHT?(fl<1.4?OC.glN2:OC.glN):(fl<1.4?OC.gl2:OC.gl)}// floors of glass behind the board
 if(a<13)return OC.silL;
 const u=((s%14)+14)%14;if(u<.7)return OC.stl;
 if(a>18&&a<22&&u>2&&u<12){H_EMIS=H_NIGHT;return H_NIGHT?OC.glN:OC.gl2}// a skylight row
 if(a>30&&a<38&&((s%28)+28)%28>4&&((s%28)+28)%28<11)return a<31?OC.unitD:OC.unit;// rooftop plant
 if(a>54)return OC.stlD;return (Math.floor(a/4)&1)?OC.sil:OC.sil2}
function orbitCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 if(!fair||q<0){const c=bCoastCol(x,y,wx,wy);if(c)return c;return null}
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 if(a>=O_ROOF.a0-2&&a<O_ROOF.a0&&ath>O_ROOF.tEnd)return OC.und;// the shadow under the vault's edge
 if(a>=O_ROOF.a0&&a<O_ROOF.a1){const v=oVault(a,s,th);if(v)return v}
 if(a>=O_ROOF.a1){const c=bCoastCol(x,y,wx,wy);if(c)return c;return null}
 if(ath<10&&a<58)return oMC(a,s);
 if(ath<10){const p=vPerson(wx,wy,8);if(p)return p;return (Math.floor(s/9)&1)?OC.pave:OC.pave2}
 if(th<0){if(a<3)return a<1?OC.wallS2:OC.wallS;return oLawn(a,s,wx,wy)}
 return oConc(a,s,wx,wy)}
// ---- shapes past the wall: blankets and families on the hill, pink trees, the hill's sign, a food stand; the control room ----
function oXY(th,a){const r=fenceDist(Math.max(-45,Math.min(45,th)))+hPenOff(th)+H_WALLW+a;return{x:Math.round(HX+Math.sin(th*RAD)*r/FT),y:Math.round(HY-Math.cos(th*RAD)*r/FT)}}
function oDecor(g){
 const BL=['#e94e77','#2f6fd0','#f5c935','#f4f1e8','#3faa5b','#ff8a3d'],rr=mulberry32(7171),SK=['#f2d3b1','#e0b48c','#c58c5e','#8a5a3a'];
 for(let k=0;k<26;k++){const th=-42+rr()*30,a=5+rr()*34;if(Math.abs(a-16)<3||Math.abs(a-29)<3)continue;const p=oXY(th,a),c=BL[(rr()*BL.length)|0];g.save();g.translate(p.x,p.y);g.rotate((th+rr()*20-10)*RAD);
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-4,-2,10,7);g.fillStyle=c;g.fillRect(-5,-3,10,7);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-5,0,10,1);
  const nP=1+((rr()*3)|0);for(let i=0;i<nP;i++){const ox=-3+i*3;g.fillStyle=BL[(rr()*BL.length)|0];g.fillRect(ox,-2,2,2);g.fillStyle=SK[(rr()*4)|0];g.fillRect(ox,-3,2,1)}g.restore()}
 for(const[th,a,r]of[[-43,9,7],[-34,22,8],[-24,8,6],[-15,22,7],[-38,36,8],[-20,36,7],[-29,13,5]]){const p=oXY(th,a);hBlossom(g,p.x,p.y,r,false)}
 // a food stand on the hill
 {const p=oXY(-40,30);g.save();g.translate(p.x,p.y);g.rotate(-40*RAD);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-11,-5,26,14);g.fillStyle='#1d2a5e';g.fillRect(-13,-7,26,12);g.fillStyle='#e94e77';for(let x=-13;x<13;x+=4)g.fillRect(x,5,2,3);g.fillStyle='#f4f1f8';g.fillRect(-13,-7,26,1);g.restore()}
 // the hill's sign
 {const p=oXY(-27,3.5);g.save();g.translate(p.x,p.y);g.rotate(-27*RAD);g.fillStyle='#141c44';g.fillRect(-34,-6,68,12);g.fillStyle='#e94e77';g.fillRect(-34,-6,68,1);g.fillStyle='#f4f1f8';g.font='bold 8px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('ORBIT HILL · PICNIC LAWN',0,.5,64);g.restore()}
 // the round control room on mission control's roof
 {const p=oXY(0,44);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.arc(p.x+5,p.y+4,15,0,7);g.fill();g.fillStyle='#8e96a2';g.beginPath();g.arc(p.x,p.y,15,0,7);g.fill();
  g.fillStyle='#2e4260';g.beginPath();g.arc(p.x,p.y,12,0,7);g.fill();g.fillStyle='#d3d8df';g.beginPath();g.arc(p.x,p.y,9,0,7);g.fill();g.fillStyle='#eef1f5';g.beginPath();g.arc(p.x-2,p.y-2,5,0,7);g.fill();
  g.fillStyle='#e94e77';g.fillRect(p.x-1,p.y-1,2,2);g.strokeStyle='#5a616d';g.lineWidth=1;g.beginPath();g.moveTo(p.x,p.y-9);g.lineTo(p.x,p.y-20);g.stroke();g.fillStyle='#e94e77';g.fillRect(p.x-1,p.y-21,2,2)}
 // the name along the right-field concourse roof
 {const p=oXY(24,17);g.save();g.translate(p.x,p.y);g.rotate(24*RAD);g.fillStyle='#f4f1f8';g.font='bold 10px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('LAUNCH DECK',0,0);g.restore()}}
// ---- the neighbourhood layer: the main entrance, Songdo's towers, the port, an airliner on approach ----
function drawOrbit(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=Math.round(cx(HX)),gy=Math.round(tip.y);const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 // the plaza: pale slabs, a magenta-lined walk, planters, lamp posts
 const PV=night?['#33363f','#2c2f37','#41444d']:['#c9ccd2','#b9bcc3','#e1e3e7'];
 g.fillStyle=PV[0];g.beginPath();g.moveTo(gx-170,gy-8);g.lineTo(gx+170,gy-8);g.lineTo(gx+210,gy+120);g.lineTo(gx-210,gy+120);g.closePath();g.fill();
 g.save();g.clip();for(let y=gy-8;y<gy+124;y+=8)R(gx-220,y,440,1,PV[1]);for(let x=gx-220;x<gx+220;x+=16)R(x,gy-8,1,132,PV[1]);g.restore();
 R(gx-24,gy,48,120,PV[2]);R(gx-26,gy,2,120,'#e94e77');R(gx+24,gy,2,120,'#e94e77');
 for(const sd of[-1,1])for(let k2=0;k2<4;k2++){const tx=gx+sd*(70+k2*26),ty=gy+30+k2*20;R(tx-7,ty-5,14,10,night?'#22262e':'#8e96a2');(k2===1?hBlossom:hGreenTree)(g,tx,ty,7,night)}
 for(const sd of[-1,1])for(let k2=0;k2<4;k2++){const lx=gx+sd*40,ly=gy+18+k2*26;R(lx+1,ly+1,2,2,'rgba(0,0,0,.35)');R(lx-1,ly-1,3,3,'#22262e');R(lx,ly,1,1,night?'#ffd8a0':'#d3d8df')}
 // the entrance hall: a broad silver roof over a glass curtain wall, steel fins, the club's circle logo above the doors
 const W2=120,y0=gy-36;R(gx-W2+6,y0+6,W2*2,40,'rgba(0,0,0,.32)');
 R(gx-W2,y0,W2*2,12,night?'#8e96a2':'#d3d8df');R(gx-W2,y0,W2*2,1,'#eef1f5');R(gx-W2,y0+11,W2*2,1,'#5a616d');for(let x=gx-W2;x<gx+W2;x+=12)R(x,y0+1,1,10,night?'#7d8591':'#b0b7c1');
 R(gx-W2,y0+12,W2*2,2,'#e94e77');
 R(gx-W2,y0+14,W2*2,26,night?'#ffc878':'#2e4260');if(night)for(let y=y0+18;y<y0+40;y+=5)R(gx-W2,y,W2*2,1,'#ffb35a');else for(let x=gx-W2;x<gx+W2;x+=19)R(x+3,y0+14,4,26,'#3a5274');
 for(let x=gx-W2;x<=gx+W2;x+=12){R(x,y0+14,2,26,'#3a3f4a');R(x,y0+14,1,26,'#5a616d')}
 R(gx-W2,y0+38,W2*2,2,'#22262e');
 g.fillStyle='#141c44';g.fillRect(gx-56,y0+17,112,20);g.fillStyle='#e94e77';g.fillRect(gx-56,y0+17,112,1);
 g.textAlign='center';g.textBaseline='middle';g.fillStyle=night?'#ffe6f0':'#f4f1f8';g.font='bold 9px "Pixelify Sans", monospace';g.fillText('ORBIT PARK',gx,y0+23);g.fillStyle='#ff8ab0';g.font='7px "Pixelify Sans", monospace';g.fillText('INCHEON COSMOS',gx,y0+32);
 if(LOGO[k]){g.imageSmoothingEnabled=false;g.fillStyle='#141c44';g.beginPath();g.arc(gx,y0-2,12,0,7);g.fill();g.strokeStyle='#e94e77';g.lineWidth=2;g.stroke();g.drawImage(LOGO[k],gx-9,y0-11,18,18)}
 // tall banners with a planet and its ring
 for(const sd of[-1,1])for(const off of[78,100]){const bx=gx+sd*off-5;R(bx+2,y0+16,10,26,'rgba(0,0,0,.3)');R(bx,y0+14,10,24,'#141c44');R(bx,y0+14,10,2,'#e94e77');g.fillStyle='#ff8ab0';g.beginPath();g.arc(bx+5,y0+25,3,0,7);g.fill();R(bx+1,y0+25,8,1,'#f4f1f8')}
 // Songdo's towers off to the right, tall glass with long shadows
 const T=[[CW*.78,cy(HY-1400),14,'#4a6a90'],[CW*.84,cy(HY-1300),18,'#3e5c80'],[CW*.9,cy(HY-1450),12,'#56789e'],[CW*.82,cy(HY-1150),10,'#5a7896']];
 for(const[tx,ty,s,c]of T){if(tx<0||ty<0||ty>CH)continue;g.fillStyle=night?'rgba(0,0,0,.5)':'rgba(10,20,30,.28)';g.beginPath();g.moveTo(tx-s/2,ty-s/2);g.lineTo(tx+s/2,ty-s/2);g.lineTo(tx+s/2+70,ty+s/2+46);g.lineTo(tx-s/2+70,ty+s/2+46);g.closePath();g.fill();
  R(tx-s/2,ty-s/2,s,s,night?shade(c,-.45):c);R(tx-s/2,ty-s/2,s,2,night?'#ffc878':'#b8d0e8');R(tx-s/2,ty-s/2,2,s,night?shade(c,-.2):shade(c,.25));if(night)for(let yy=ty-s/2+3;yy<ty+s/2;yy+=3)for(let xx=tx-s/2+3;xx<tx+s/2-1;xx+=3)if(((xx*7+yy*3)|0)%5)R(xx,yy,1,1,'#ffd98a')}
 // an airliner on approach to the airport, far off over the water
 {const ax=CW*.1,ay=CH*.08;g.save();g.translate(ax,ay);g.rotate(-.5);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(14,20,22,3);g.fillStyle='#eef1f5';g.fillRect(-11,-1,22,3);g.fillRect(-2,-9,4,18);g.fillRect(-11,-4,2,8);g.fillStyle='#e94e77';g.fillRect(-11,-4,2,3);if(night){g.fillStyle='#ff4a4a';g.fillRect(-2,-9,1,1);g.fillStyle='#4aff7a';g.fillRect(1,8,1,1)}g.restore()}}
// ---- night: magenta accents along the vault edges and the entrance, warm light from the concourse and the hill's lamps ----
let O_NL=null,O_NL_K='';
function drawOrbitLights(c,vx0,vy0,scale,now){if(!ST||ST.bowl!=='orbit'||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!O_NL||O_NL_K!==key){O_NL_K=key;const pts=[];for(let th=-45;th<=45;th+=1)pts.push(oXY(th,0));const x0=Math.min(...pts.map(p=>p.x))-420,y0=Math.min(...pts.map(p=>p.y))-420,x1=Math.max(...pts.map(p=>p.x))+420,y1=Math.max(...pts.map(p=>p.y))+80;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  for(let th=-44;th<=44;th+=3){if(Math.abs(th)<O_ROOF.tEnd+1)continue;const p=oXY(th,O_ROOF.a0+1);glow(p.x,p.y,26,'233,78,119',.28)}
  for(let th=12;th<44;th+=4){const p=oXY(th,7);glow(p.x,p.y,30,'255,200,120',.3)}
  for(let th=-42;th<-12;th+=5){const p=oXY(th,22);glow(p.x,p.y,26,'255,214,160',.18)}
  {const p=oXY(0,8);glow(p.x,p.y,80,'255,200,130',.25)}
  O_NL={cv,x0,y0,x1,y1}}
 const N=O_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='lighter';c.drawImage(N.cv,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);c.restore()}
// ---- the board (K units): set into mission control's front, ORBIT PARK lit above it, INCHEON COSMOS below, a countdown and an orbit ----
function drawJumboOrbit(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,night=!!S.night;
 // the building's front around the board: silver cladding, steel fins
 const bx=x0-40,bw=w+80,by=y0-30,bh=h+48;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(bx+6,by+6,bw,bh);g.fillStyle=night?'#8e96a2':'#c3c9d1';g.fillRect(bx,by,bw,bh);
 for(let x=bx;x<bx+bw;x+=10){g.fillStyle=night?'#7d8591':'#b0b7c1';g.fillRect(x,by,1,bh)}g.fillStyle='#eef1f5';g.fillRect(bx,by,bw,1);g.fillStyle='#5a616d';g.fillRect(bx,by+bh-2,bw,2);
 drawJumbo0(g,now,true);
 g.strokeStyle='#e94e77';g.lineWidth=2;g.strokeRect(x0-3,y0-3,w+6,h+6);g.strokeStyle='#22262e';g.lineWidth=1;g.strokeRect(x0-5,y0-5,w+10,h+10);
 // the lit sign above, the name below
 g.fillStyle='#141c44';g.fillRect(cx-58,y0-26,116,17);g.fillStyle='#e94e77';g.fillRect(cx-58,y0-26,116,1);g.fillRect(cx-58,y0-10,116,1);
 g.textAlign='center';g.textBaseline='middle';g.font='bold 13px "Pixelify Sans", monospace';g.fillStyle=night||Math.floor(now/900)%2?'#ff8ab0':'#f4f1f8';g.fillText('ORBIT PARK',cx,y0-17);
 g.fillStyle='#141c44';g.fillRect(cx-50,y0+h+5,100,11);g.fillStyle='#f4f1f8';g.font='bold 8px "Pixelify Sans", monospace';g.fillText('INCHEON COSMOS',cx,y0+h+11);
 // side panels: a launch countdown on the left, an orbit on the right
 const lp=x0-36,rp=x0+w+6;g.fillStyle='#05080a';g.fillRect(lp,y0,30,h);g.fillRect(rp,y0,30,h);g.strokeStyle='#e94e77';g.lineWidth=1;g.strokeRect(lp+.5,y0+.5,29,h-1);g.strokeRect(rp+.5,y0+.5,29,h-1);
 const cd=10-Math.floor(now/1000)%11;g.fillStyle='#ff8ab0';g.font='7px "Press Start 2P", monospace';g.fillText('T-',lp+15,y0+12);g.fillStyle='#f4f1f8';g.font='12px "Press Start 2P", monospace';g.fillText(String(cd).padStart(2,'0'),lp+15,y0+30);
 g.fillStyle='#e94e77';g.fillRect(lp+13,y0+44,4,12);g.beginPath();g.moveTo(lp+12,y0+44);g.lineTo(lp+15,y0+38);g.lineTo(lp+18,y0+44);g.fill();if(cd===0){g.fillStyle='#ffc878';g.fillRect(lp+13,y0+56,4,4)}
 const oc={x:rp+15,y:y0+h/2};g.strokeStyle='#4a6a90';g.beginPath();g.ellipse(oc.x,oc.y,11,6,-.4,0,7);g.stroke();g.fillStyle='#2f6fd0';g.beginPath();g.arc(oc.x,oc.y,4,0,7);g.fill();
 const an=now/900;g.fillStyle='#ff8ab0';g.fillRect(Math.round(oc.x+Math.cos(an)*11*Math.cos(-.4)-Math.sin(an)*6*Math.sin(-.4))-1,Math.round(oc.y+Math.cos(an)*11*Math.sin(-.4)+Math.sin(an)*6*Math.cos(-.4))-1,2,2)}
