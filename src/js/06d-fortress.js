// ---------- Suwon: Fortress Field. The bowl is the shared one (06c); past the outfield wall stands a stretch of
// Hwaseong-style fortress wall behind centre, a stone concourse with food stalls behind left field, and a walled
// garden with a rock waterfall and a watchtower behind right field. Ground colours are one pure function of world
// position (fortCol), so the park buffer and the neighbourhood layer meet without a seam; roofs, banners and trees
// are drawn as shapes by fDecor (both layers), the main gate by drawFortress (neighbourhood layer). ----------
const F_ADS=[['수원 화성','#e8dcff'],['WIZARD MART','#ffd23f'],['팔달 은행','#e8dcff'],['HWASEONG','#c9b3ff'],['수원 갈비','#ffd23f'],['MAGIC AIR','#e8dcff'],['행궁 커피','#c9b3ff'],['SUWON TEC','#e8dcff']];
const FC=(()=>{const h=hRGB;return{
 st1:h('#b8ad97'),st2:h('#aa9f88'),st3:h('#c6bca6'),mort:h('#7d735f'),stD:h('#6e6452'),stS:h('#4a4336'),
 walk:h('#cbc1aa'),walk2:h('#c0b69f'),merl:h('#d4cab2'),cren:h('#8a806a'),
 berm:h('#2f5f2c'),berm2:h('#285426'),grass:h('#4f8f3c'),grass2:h('#478535'),
 tr1:h('#244d24'),tr2:h('#2f6230'),tr3:h('#3f7a3c'),trG:h('#1d3b1f'),
 rock:h('#8d8a84'),rock2:h('#a4a19a'),rockD:h('#5f5c58'),pool:h('#3a8fb0'),pool2:h('#4fa8c4'),poolD:h('#2a6f8c'),foam:h('#e8f6fb'),
 tSeat:h('#6a44b8'),tSeat2:h('#5a35a0'),fall:h('#bfe6f2'),pave:h('#cfc4ad'),pave2:h('#c2b79f'),paveJ:h('#a89d86')}})();
// stone masonry: courses `ch` ft tall, blocks 3.5-5 ft long, every other course staggered; a block's own tone, mortar lines
function fStone(s,v,ch,dark){const row=Math.floor(v/ch),off=(row&1)*2.2,L=4.2,bi=Math.floor((s+off)/L),fs=((s+off)%L+L)%L,fv=((v%ch)+ch)%ch;
 if(fs<.35||fv<.3)return dark?FC.stS:FC.mort;const h=vHash(bi+977,row);const c=h%4===0?FC.st2:h%5===0?FC.st3:FC.st1;return dark?hMul(c,.62):c}
// trees seen from above on a loose 14 ft lattice, over dark ground
function fTrees(wx,wy){const cs=16,i=Math.floor(wx/cs),j=Math.floor(wy/cs),h=vHash(i,j);const cx=(i+.5)*cs+((h&7)-3.5),cy=(j+.5)*cs+(((h>>3)&7)-3.5),r=6+(h>>6&3);
 const dx=wx-cx,dy=wy-cy,d2=dx*dx+dy*dy;if(d2<r*r){if(dx+dy<-r*.5)return FC.tr3;if(dx+dy>r*.6)return FC.tr1;return FC.tr2}
 const sx=dx-3,sy=dy-3;if(sx*sx+sy*sy<r*r)return hMul(FC.trG,.85);return FC.trG}
// the sector boundaries, in degrees off centre field (left is negative)
const F_WALL=[-33,23],F_POOL={th:27.5,a:40,rs:10,ra:6.5},F_TOWER={th:35,a:36,hs:16},F_CONC=[-45,-33];
// paving slabs on a 9 ft grid, with a share of people about
function fPave(wx,wy,pp){const sl=vHash(Math.floor(wx/9),Math.floor(wy/9));if((((wx%9)+9)%9)<.7||(((wy%9)+9)%9)<.7)return FC.paveJ;
 const p=vPerson(wx,wy,pp);if(p)return p;return sl%4===0?FC.pave2:FC.pave}
function fortCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 if(!fair||q<0)return null;
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 // ---- square bastions closing each end of the wall, standing proud of it ----
 for(const te of F_WALL){const ds=(th-te)*RAD*r;if(Math.abs(ds)<11&&a>2&&a<46){const e=Math.min(11-Math.abs(ds),a-2,46-a);
  if(e<1.1)return FC.stS;if(e<3.2){const m=(((ds+a)%6)+6)%6;return m<3.6?FC.merl:FC.cren}return fStone(ds,a,1.6,false)}}
 // ---- the fortress wall behind centre ----
 if(th>F_WALL[0]&&th<F_WALL[1]){
  if(a<5){const k=vHash(Math.floor(wx/5),Math.floor(wy/5));return k%7===0?FC.tr2:(Math.floor(s/6)&1)?FC.berm:FC.berm2}// planted strip at the foot of the wall
  if(a<9){const sl=Math.floor(s/16);if(((s%16)+16)%16<1.6&&a>6)return FC.stS;return fStone(s,a,1.6,true)}// the inner face in its own shadow, with arrow slits
  if(a<12){const m=((s%8)+8)%8;return m<5?(a<9.6?FC.stD:FC.merl):FC.cren}// inner parapet: merlons and crenels
  if(a<30){if(((s%5)+5)%5<.3||((a%5)+5)%5<.3)return FC.paveJ;const sl=vHash(Math.floor(s/5)+(Math.floor(a/5)&1)*2,Math.floor(a/5));
   const p=vPerson(wx,wy,5);if(p)return p;return sl%3===0?FC.walk2:FC.walk}// the wall walk
  if(a<34){const m=((s%8)+8)%8;return m<5?(a>33.4?FC.stD:FC.merl):FC.cren}// outer parapet
  if(a<41)return fStone(s,a,1.6,true);// the outer face, falling away into shadow
  if(a<100)return fTrees(wx,wy);
  return null}
 // ---- left field: stepped terraces by the wall, then the stone concourse with its stalls and cherry trees ----
 if(th<=F_WALL[0]){
  if(a<2.5)return FC.stD;
  if(a<15){const rw=Math.floor((a-2.5)/2.5),f=(a-2.5)%2.5;if(f<.5)return FC.walk2;if(((s%22)+22)%22<2)return FC.walk;// stairs every 22 ft
   const p=vPerson(wx,wy,34);if(p)return p;return rw&1?FC.tSeat:FC.tSeat2}
  if(a<16.5)return FC.stS;
  if(a<64)return fPave(wx,wy,7);
  if(a<67)return fStone(s,a,1.6,false);
  if(a<100)return fTrees(wx,wy);
  return null}
 // ---- right field: a paved walk by the wall, then the garden: watchtower on its stone base, a rock waterfall and pool ----
 if(a<2.5)return FC.stD;
 if(a<13)return fPave(wx,wy,9);
 if(a<14.5)return FC.stS;
 {const ds=(th-F_TOWER.th)*RAD*r,da=a-F_TOWER.a,m=Math.max(Math.abs(ds),Math.abs(da));if(m<F_TOWER.hs){const e=F_TOWER.hs-m;
   if(e<1)return FC.stS;if(e<3){const k=(((ds+da)%5)+5)%5;return k<3?FC.merl:FC.cren}return fStone(ds,da,1.5,false)}// crenellated stone platform
  if(Math.abs(ds-7)<F_TOWER.hs&&Math.abs(da+6)<F_TOWER.hs)return hMul((Math.floor((wx+wy)/7)&1)?FC.grass:FC.grass2,.6)}// the tall tower's shadow on the lawn
 {const ds=(th-F_POOL.th)*RAD*r,da=a-F_POOL.a,ph=Math.atan2(da,ds),e=(ds*ds)/(F_POOL.rs*F_POOL.rs)+(da*da)/(F_POOL.ra*F_POOL.ra),rim=1.5+.18*Math.sin(ph*5+1)+.1*Math.sin(ph*9);
  const fx=ds+1;// the fall comes down the rocks behind the pool
  if(e<1){if(Math.abs(fx)<2.4&&da>F_POOL.ra*.45){return ((Math.floor(da*1.3))&1)?FC.foam:FC.pool2}// white water where the fall lands
   const w=Math.sin(wx*.4+wy*.3)+Math.sin(wy*.5-wx*.2);return e>.74?FC.poolD:w>1.25?FC.pool2:FC.pool}
  if(e<rim){const l=-ds*.6-da;return l>3?FC.rock2:l<-3?FC.rockD:FC.rock}// a ring of boulders, lit from the top left
  const oh=da-F_POOL.ra*.6,ow=8.5-oh*.35;// the rock outcrop the water falls from, in ledges
  if(oh>0&&oh<13&&Math.abs(fx)<ow){if(Math.abs(fx)<2.2){const st=Math.floor(oh/3.2);return ((oh%3.2)<.9)?FC.foam:(st&1)?FC.pool2:FC.fall}
   const st=Math.floor(oh/3.2),f=oh%3.2;if(f<.7)return FC.rockD;const l=-fx*.5;return l>2?FC.rock2:(st&1)?FC.rock:hMul(FC.rock,.9)}}
 if(a<64)return (Math.floor((wx+wy)/7)&1)?FC.grass:FC.grass2;
 if(a<67)return fStone(s,a,1.6,false);
 if(a<100)return fTrees(wx,wy);
 return null}
// a point a ft past the wall at angle th (world px)
function fAt(th,a){const r=fenceDist(Math.max(-45,Math.min(45,th)))+hPenOff(th)+H_WALLW+a;return{x:HX+Math.sin(th*RAD)*r/FT,y:HY-Math.cos(th*RAD)*r/FT}}
// a Korean hip roof seen from above: charcoal tile courses running round all four sides, light ridges from the corners up
// to the top ridge, pale lifted eaves flaring out at the corners, a soft shadow on the ground
function kRoof(g,cx,cy,w,h,ang,night){g.save();g.translate(Math.round(cx),Math.round(cy));g.rotate(ang||0);const W2=w/2,H2=h/2,fl=Math.max(1.5,Math.min(w,h)*.09),rl=Math.max(0,W2-H2);
 // the shadow the overhang throws, long for a tall building
 g.fillStyle=night?'rgba(4,4,10,.45)':'rgba(10,8,16,.34)';g.fillRect(-W2-fl+5,-H2-fl+6,w+2*fl+2,h+2*fl+1);
 const out=()=>{g.beginPath();g.moveTo(-W2-fl,-H2-fl);g.quadraticCurveTo(0,-H2+fl*.5,W2+fl,-H2-fl);g.quadraticCurveTo(W2-fl*.5,0,W2+fl,H2+fl);g.quadraticCurveTo(0,H2-fl*.5,-W2-fl,H2+fl);g.quadraticCurveTo(-W2+fl*.5,0,-W2-fl,-H2-fl);g.closePath()};
 const P=night?{n:'#2c2c38',s:'#22222c',e:'#262632',w:'#30303c',ch:'#18181f',hi:'#40404e',eave:'#a8a090',rid:'#8e897e'}:
  {n:'#4a4a58',s:'#30303c',e:'#383846',w:'#525262',ch:'#24242e',hi:'#686878',eave:'#ddd3bf',rid:'#d6cfbf'};
 out();g.fillStyle=P.eave;g.fill();// the pale lifted eave line
 // four faces, each with tile channels running from the ridge down to its eave
 const face=(pts,col,dir)=>{g.save();g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))g.lineTo(q[0],q[1]);g.closePath();g.clip();
  g.fillStyle=col;g.fillRect(-W2-fl,-H2-fl,w+2*fl,h+2*fl);
  if(dir==='v')for(let x=Math.floor(-W2);x<W2;x+=2){g.fillStyle=P.ch;g.fillRect(x,-H2,1,h)}else for(let y=Math.floor(-H2);y<H2;y+=2){g.fillStyle=P.ch;g.fillRect(-W2,y,w,1)}
  g.restore()};
 const e=.4;g.save();out();g.clip();
 face([[-W2-fl,-H2-fl],[W2+fl,-H2-fl],[rl,0],[-rl,0]],P.n,'v');face([[-W2-fl,H2+fl],[W2+fl,H2+fl],[rl,0],[-rl,0]],P.s,'v');
 face([[-W2-fl,-H2-fl],[-rl,0],[-W2-fl,H2+fl]],P.w,'h');face([[W2+fl,-H2-fl],[rl,0],[W2+fl,H2+fl]],P.e,'h');
 // the bottom course of round end tiles just inside the eave
 g.strokeStyle=P.hi;g.lineWidth=1;g.strokeRect(-W2+e,-H2+e,w-2*e,h-2*e);
 g.restore();
 // ridges: corner hips and the long top ridge, with raised ends
 g.strokeStyle=P.rid;g.lineWidth=1.4;g.beginPath();g.moveTo(-W2,-H2);g.lineTo(-rl,0);g.lineTo(rl,0);g.lineTo(W2,-H2);g.moveTo(-W2,H2);g.lineTo(-rl,0);g.moveTo(rl,0);g.lineTo(W2,H2);g.stroke();
 if(rl>0){g.lineWidth=2.4;g.beginPath();g.moveTo(-rl,0);g.lineTo(rl,0);g.stroke();g.fillStyle=P.rid;g.fillRect(-rl-2,-2,3,4);g.fillRect(rl-1,-2,3,4)}
 else{g.fillStyle=P.rid;g.fillRect(-1.5,-1.5,3,3)}
 g.strokeStyle='#14121a';g.lineWidth=1;out();g.stroke();g.restore()}
// purple banner with a gold star, seen from above as a short cloth strip on the wall
function fBanner(g,x,y,ang){g.save();g.translate(x,y);g.rotate(ang);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-4,1,9,5);g.fillStyle='#4a2a8a';g.fillRect(-5,-2,10,5);g.fillStyle='#6a44b8';g.fillRect(-5,-2,10,1);g.fillStyle='#ffd23f';g.fillRect(-1,-1,2,2);g.restore()}
// everything drawn as shapes past the outfield wall (world px; both layers)
function fDecor(g){
 // wall-top flags and banners hung on the inner face, skipping the scoreboard
 for(let th=-30;th<=21;th+=4.5){if(Math.abs(th)<9)continue;const p=fAt(th,7);fBanner(g,p.x,p.y,th*RAD)}
 for(const th of[-24,-14,13,20]){const p=fAt(th,32);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(p.x+2,p.y+2,3,3);g.fillStyle='#2b2630';g.fillRect(p.x-1,p.y-1,3,3);g.fillStyle='#6a44b8';g.fillRect(p.x+2,p.y-5,7,4);g.fillStyle='#ffd23f';g.fillRect(p.x+4,p.y-4,1,1)}
 // the watchtower: its roof over the stone base
 {const p=fAt(F_TOWER.th,F_TOWER.a),sz=F_TOWER.hs*1.3/FT;kRoof(g,p.x,p.y,sz,sz,F_TOWER.th*RAD,false);kRoof(g,p.x-1,p.y-2,sz*.5,sz*.5,F_TOWER.th*RAD,false)}
 // food stalls on the left-field concourse: small buildings under dark purple hip roofs, tables with parasols between
 for(const[th,a]of[[-41,30],[-37.5,30],[-41,52]]){const p=fAt(th,a);g.save();g.translate(p.x,p.y);g.rotate(-th*RAD);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-15,-9,34,22);
  g.fillStyle='#2a1a48';g.fillRect(-17,-11,34,22);g.fillStyle='#3d2670';g.fillRect(-15,-9,30,8);g.fillStyle='#2f1d56';g.fillRect(-15,-1,30,8);g.fillStyle='#8a6ad0';g.fillRect(-17,-1,34,1);
  for(let k=-16;k<16;k+=4){g.fillStyle=(k/4)&1?'#f2e8ff':'#5a35a0';g.fillRect(k,11,4,4)}g.restore()}
 for(const[th,a]of[[-39,42],[-43,42],[-35.5,42],[-37,58],[-43.5,59]]){const p=fAt(th,a);fParasol(g,p.x,p.y)}
 for(const[th,a]of[[-44,21],[-34.5,22],[-39,62],[-35,52]]){const p=fAt(th,a);hBlossom(g,p.x,p.y,7,false)}
 // the garden's trees and shrubs
 for(const[th,a,r,pink]of[[25.5,22,6,0],[31,58,8,1],[38.5,58,7,0],[24.5,56,6,0],[30.5,22,5,1],[40.5,20,5,0],[42,40,6,1],[32,30,3,0],[23.5,40,4,0],[31.5,47,3,1],[25,48,3,0]]){const p=fAt(th,a);if(pink)hBlossom(g,p.x,p.y,r,false);else hGreenTree(g,p.x,p.y,r,false)}}
function fParasol(g,x,y){const r=8;g.fillStyle='rgba(16,10,24,.3)';g.beginPath();g.arc(x+4,y+3,r,0,7);g.fill();
 for(let k=0;k<8;k++){const a0=k*Math.PI/4;g.fillStyle=k&1?'#f2e8ff':'#5a35a0';g.beginPath();g.moveTo(x,y);g.arc(x,y,r,a0,a0+Math.PI/4);g.closePath();g.fill()}g.fillStyle='#2b2630';g.fillRect(Math.round(x-1),Math.round(y-1),2,2)}
// ---- the neighbourhood layer (half resolution): the grand gate behind home plate and its plaza ----
function drawFortress(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=cx(HX),gy=tip.y;
 // the plaza: big pale slabs, a purple-paved path to the gate, planted beds, cherry trees and banner poles
 g.fillStyle='#c9bea6';g.beginPath();g.moveTo(gx-120,gy-6);g.lineTo(gx+120,gy-6);g.lineTo(gx+150,gy+120);g.lineTo(gx-150,gy+120);g.closePath();g.fill();
 g.save();g.clip();g.fillStyle='#b4a990';for(let y=gy;y<gy+125;y+=7)g.fillRect(gx-160,y,320,1);for(let x=gx-160;x<gx+160;x+=11)g.fillRect(x,gy,1,125);g.restore();
 g.fillStyle='#6a4a9a';g.fillRect(gx-16,gy+8,32,114);g.fillStyle='#7c5ab0';for(let y=gy+10;y<gy+120;y+=6)g.fillRect(gx-16,y,32,1);
 for(const sd of[-1,1]){for(let k=0;k<4;k++){const bx=gx+sd*(44+k*24),by=gy+48+k*16;g.fillStyle='#4f7a3a';g.fillRect(bx-10,by-6,20,12);hBlossom(g,bx,by,6,false)}
  for(let k=0;k<3;k++){const px=gx+sd*(26+k*30),py=gy+28+k*30;g.fillStyle='#2b2630';g.fillRect(px,py-8,1,9);g.fillStyle='#4a2a8a';g.fillRect(px+1,py-8,4,7);g.fillStyle='#ffd23f';g.fillRect(px+2,py-6,1,1)}}
 // the gatehouse: a broad stone block with three arched gateways, square bastions either side, a two-tier pavilion roof
 const GW=150,GH=46,sx0=gx-GW/2,sy0=gy-40;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(sx0+6,sy0+6,GW,GH);
 const stone=(x0,y0,w,h)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=fStone(x*.9,y*.9,1.6,false);g.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;g.fillRect(x0+x,y0+y,1,1)}};
 for(const sd of[-1,1]){const bx=gx+sd*(GW/2+12)-15;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(bx+5,sy0+5,30,34);stone(bx,sy0-2,30,34);
  for(let x=bx;x<bx+30;x+=5){g.fillStyle='#d4cab2';g.fillRect(x,sy0-4,3,3)}}
 stone(sx0,sy0,GW,GH);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(sx0,sy0+GH-5,GW,5);
 for(const ax of[-46,0,46]){const w=ax?16:24;g.fillStyle='#d8cdb6';g.fillRect(gx+ax-w/2-2,gy-6,w+4,16);g.beginPath();g.arc(gx+ax,gy-6,w/2+2,Math.PI,0);g.fill();
  g.fillStyle='#1c1622';g.fillRect(gx+ax-w/2,gy-6,w,16);g.beginPath();g.arc(gx+ax,gy-6,w/2,Math.PI,0);g.fill();if(night){g.fillStyle='#ffcf7a';g.fillRect(gx+ax-w/2+2,gy-2,w-4,10)}}
 for(const sd of[-1,1]){g.fillStyle='#4a2a8a';g.fillRect(gx+sd*23-4,gy-30,8,18);g.fillStyle='#ffd23f';g.fillRect(gx+sd*23-1,gy-24,2,2)}
 kRoof(g,gx,gy-44,138,30,0,night);kRoof(g,gx,gy-47,80,16,0,night);
 for(const sd of[-1,1])kRoof(g,gx+sd*(GW/2+12),sy0+12,24,20,0,night);
 g.fillStyle='#4a2a8a';g.fillRect(gx-10,gy-34,20,24);g.fillStyle='#6a44b8';g.fillRect(gx-10,gy-34,20,2);g.beginPath();g.moveTo(gx-10,gy-10);g.lineTo(gx,gy-5);g.lineTo(gx+10,gy-10);g.fill();
 if(LOGO[k]){g.imageSmoothingEnabled=false;g.drawImage(LOGO[k],gx-8,gy-31,16,16)}}
// ---- night: warm uplight washing the fortress stone, the tower, the stalls and the gate, laid over the frame ----
let F_NL=null,F_NL_K='';
function drawFortLights(c,vx0,vy0,scale,now){if(!ST||ST.bowl!=='fortress'||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!F_NL||F_NL_K!==key){F_NL_K=key;const pts=[];for(let th=-44;th<=44;th+=1)pts.push(fAt(th,0));const x0=Math.min(...pts.map(p=>p.x))-260,y0=Math.min(...pts.map(p=>p.y))-260,x1=Math.max(...pts.map(p=>p.x))+260,y1=Math.max(...pts.map(p=>p.y))+80;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  // uplights at the foot of the wall every few degrees: a gold wash up the inner face and across the wall walk
  for(let th=F_WALL[0]+1;th<F_WALL[1];th+=2.2){const p=fAt(th,6),q=fAt(th,20);glow(p.x,p.y,30,'255,170,70',.5);glow(q.x,q.y,44,'255,190,110',.14)}
  {const p=fAt(F_TOWER.th,F_TOWER.a);glow(p.x,p.y,70,'255,200,120',.34)}
  {const p=fAt(F_POOL.th,F_POOL.a);glow(p.x,p.y,40,'120,200,255',.22)}
  for(const[th,a]of[[-41,30],[-37.5,30],[-41,52],[-39,42]]){const p=fAt(th,a);glow(p.x,p.y,44,'255,184,110',.32)}
  // a warm cast over the stone itself (multiplied in, so the masonry keeps its pattern)
  const tc=document.createElement('canvas');tc.width=cv.width;tc.height=cv.height;const t=tc.getContext('2d');t.scale(S2,S2);t.translate(-x0,-y0);t.fillStyle='rgb(255,206,140)';
  const band=(t0,t1,a0,a1)=>{t.beginPath();for(let th=t0;th<=t1+.01;th+=.5){const p=fAt(th,a0);t.lineTo(p.x,p.y)}for(let th=t1;th>=t0-.01;th-=.5){const p=fAt(th,a1);t.lineTo(p.x,p.y)}t.closePath();t.fill()};
  band(F_WALL[0]-1.8,F_WALL[1]+1.8,4,46)
  F_NL={cv,tc,x0,y0,x1,y1}
  // the gate and its plaza, on a canvas of their own
  {const OL=hOutline(),tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gc=document.createElement('canvas');gc.width=360;gc.height=300;const q=gc.getContext('2d'),gl=(x,y,r,col,a)=>{const gr=q.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);q.fillStyle=gr;q.fillRect(x-r,y-r,r*2,r*2)};
   gl(180,40,120,'255,200,120',.45);for(const sd of[-1,1])for(let k=0;k<3;k++)gl(180+sd*(52+k*60),96+k*60,40,'255,214,150',.3);gl(180,130,70,'176,124,255',.18);F_NL.gate={cv:gc,x:tip.x-360,y:tip.y-80}}}
 const N=F_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='multiply';c.drawImage(N.tc,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);c.globalCompositeOperation='lighter';c.drawImage(N.cv,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);if(N.gate)c.drawImage(N.gate.cv,N.gate.x,N.gate.y,720,600);c.restore()}
