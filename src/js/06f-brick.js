// ---------- Busan: Harbor Field. The shared bowl (06c) in brick and dark steel: a facade of brick piers, steel floor bands and
// big glass bays broken into sections by brick towers, segmented charcoal roofs on exposed beams over the upper decks,
// orange and navy seats. The stands stop short on the left-field side and run on a little further on the right. Past the
// outfield wall: food-and-drink terraces behind left-centre, a planted batter's eye under the board, and behind right field
// a short navy steel truss footbridge with shops underneath and a row of brick kiosks beyond. The sea lies off to the upper
// left, kept back from the park by a coastal road, a tree-lined promenade, a seawall and a band of tetrapods.
// Every colour is a pure function of world position (brickCol); seagulls, the bridge sign and the entrance are shapes. ----------
const B_ADS=[['부산 은행','#ffcc48'],['GULL AIR','#e8eef5'],['광안리','#ffb04a'],['HARBOR LOGISTICS','#e8eef5'],['어묵 BAR','#ffcc48'],['SEA SALT SODA','#e8eef5'],['BUSAN SEAGULLS','#e8eef5'],['','#e8eef5']];
const BC=(()=>{const h=hRGB;return{
 brick:h('#9a4430'),brick2:h('#8c3c2a'),brick3:h('#a84d35'),brickL:h('#b85a3e'),mort:h('#6e4a40'),stD:h('#22262c'),stL:h('#4a5260'),cap:h('#2a2e34'),capL:h('#7a828e'),
 gD:h('#33475c'),gD2:h('#2a3c50'),gRef:h('#4e6680'),
 navy:h('#1c2b4a'),navyL:h('#3a5482'),navyD:h('#101a30'),deck:h('#8a6a4c'),deck2:h('#7e6044'),deckJ:h('#5a4430'),deckL:h('#9a7448'),under:h('#16181f'),under2:h('#1d2029'),
 kRoof:h('#3a3f47'),kRoof2:h('#454b54'),kRidge:h('#6a717c'),shop:h('#ffcf7a'),shopD:h('#8a6a3a'),
 conc:h('#a7a39b'),conc2:h('#9b978f'),concJ:h('#8a867e'),paver:h('#9c6a58'),paver2:h('#8e5f4e'),
 terr:h('#8a6a48'),terr2:h('#7a5c3e'),terrJ:h('#5e4630'),umbO:h('#f4f1ea'),umbO2:h('#d9d3c6'),umbN:h('#ffd9a0'),umbN2:h('#e6bd80'),tbl:h('#e8e4dc'),
 hedge:h('#1f3d2a'),hedge2:h('#284c34'),
 road:h('#4e535a'),lane:h('#ece6cc'),curb:h('#c9c5bb'),promL:h('#8a7650'),prom:h('#b8ad9c'),prom2:h('#ada290'),promJ:h('#9a8f7e'),tr1:h('#2f6a32'),tr2:h('#3f8a3c'),tr3:h('#55a04a'),trS:h('#1f3a22'),
 ring:h('#d6d2c8'),pink:h('#f2a6c4'),pink2:h('#e58bb0'),lamp:h('#ffe7a8'),wallT:h('#cfcac0'),wallT2:h('#bdb8ae'),wallF:h('#55534f'),railW:h('#e8e4dc'),
 tet:h('#b4b0a8'),tet2:h('#9a968e'),tetD:h('#6e6a64'),sea:h('#1f4f86'),sea2:h('#1a4478'),sea3:h('#163a68'),crest:h('#6fa3d8'),foam:h('#d8ecff'),refl:h('#ffcf7a')}})();
// ---- the bowl's facade (called from hBowl): sections of brick piers and steel-framed glass bays, cut by brick towers ----
function bPave(s,a){const row=Math.floor(a/2),off=(row&1)*2,fu=(((s+off)%4)+4)%4;if((((a%2)+2)%2)<.3||fu<.3)return BC.concJ;return vHash(Math.floor((s+off)/4),row)%5===0?BC.paver2:BC.paver}
function bBrick(u,v,lit){const ch=1.5,row=Math.floor(v/ch),off=(row&1)*1.5,fv=((v%ch)+ch)%ch,fu=(((u+off)%3)+3)%3;
 if(fv<.3||fu<.3)return BC.mort;const h=vHash(Math.floor((u+off)/3),row);let c=h%3===0?BC.brick2:h%5===0?BC.brick3:BC.brick;return lit?hMul(c,1.12):c}
function bFacade(k,T,sF){const SEC=92,m92=((sF%SEC)+SEC)%SEC;
 if(k<2.4)return k<.8?BC.capL:BC.cap;// the dark steel cornice with its lit edge
 if(k<5.6)return bBrick(sF,k,false);// a brick frieze under it
 const v=k-5.6,fl=((v%5.2)+5.2)%5.2,band=Math.floor(v/5.2);
 // the brick towers that break the front into sections, with a column of narrow arched windows
 if(m92<9){const lit=m92<4.5,wc=Math.abs(m92-4.5)<1.1&&fl>1.4&&fl<4.6;if(wc){H_EMIS=H_NIGHT;return H_NIGHT?HB.glassN:BC.gD2}if(m92<.7||m92>8.3)return BC.stD;return bBrick(sF,k,lit)}
 const m=((m92-9)%20.75+20.75)%20.75;
 if(m<2.6)return m<.9?BC.stL:bBrick(sF,k,m<1.6);// a brick pier between bays
 if(fl<.8)return BC.stD;// the dark steel floor band
 const wm=m-2.6;if(((wm%3.6)+3.6)%3.6<.35)return BC.mull;// mullions
 // the top floor's windows are arched
 if(band===0){const cx=9.1,rr=8.2,dy=4.4-fl,dx=wm-cx;if(dy>0&&dx*dx+dy*dy*4>rr*rr)return bBrick(sF,k,false)}
 const sh=fl<1.5||wm<.9;H_EMIS=H_NIGHT;
 if(H_NIGHT){const dim=(vHash(Math.floor(sF/20.75),band)&7)===0;const c=dim?hMul(HB.glassN,.4):band&1?HB.glassN2:HB.glassN;return sh?hMul(c,.6):c}
 const c=(wm*.13+fl*.2)%1<.15?BC.gRef:band&1?BC.gD2:BC.gD;return sh?hMul(c,.72):c}
// ---- the roofs: charcoal panels in sections, a lit fascia showing their thickness, exposed beams with their shadows ----
function bRoof(k,Rd,phi,sF,gapSeat){
 // separate roof pavilions, each a shallow gable: the lit inner slope, a ridge, the shaded outer slope; between them the
 // seats show through under an open steel truss
 const SEG=74,sm=((sF%SEG)+SEG)%SEG;
 if(sm<10){if(sm<1.2||sm>8.8)return sm<1.2?BC.stL:BC.stD;const t=(sm-1.2)/7.6,dg=Math.abs(k/Rd-t)*Rd,dg2=Math.abs(k/Rd-(1-t))*Rd;
  if(k<1.2||Math.abs(k-Rd*.5)<.55||dg<.55||dg2<.55)return BC.stL;if(Math.abs(k-Rd*.5)<1.3||dg<1.3)return hMul(gapSeat(),.3);return hMul(gapSeat(),.62)}
 if(sm<11.2)return hMul(BC.stD,.8);// the end of a pavilion, in shade
 if(k<.7)return BC.capL;if(k<1.7)return hMul(HB.gutter,.8);// the lit lip, then the fascia's face
 if(k>Rd-1)return HB.gutter;
 const rid=Rd*.5;if(Math.abs(k-rid)<.5)return BC.capL;// the ridge
 const bm=((sm-11.2)%12.6+12.6)%12.6;if(bm<.8)return hMul(BC.stL,k<rid?1:.75);// steel purlins across
 if(((sF%2.2)+2.2)%2.2<.35)return hMul(HB.rib,k<rid?1.08:.9);// standing seams
 const c=k<rid?hMul(HB.roof,1.18):hMul(HB.roof2,.8);return c}
// ---- where the outfield ring closes: 74 ft past the wall, measured along each ray from the bowl's centre ----
function bOpenR(phi,t0){const dx=Math.sin(phi*RAD),dy=Math.cos(phi*RAD);let lo=0,hi=1400;for(let i=0;i<22;i++){const m=(lo+hi)/2,x=H_CC.x+dx*m,y=H_CC.y+dy*m,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
  const q=y>0&&Math.abs(th)<=45?r-fenceDist(th)-hPenOff(th)-H_WALLW:(y>0?r-fenceDist(Math.sign(th)*45)-H_WALLW:-1);if(q>84)hi=m;else lo=m}return Math.max(t0,lo)}
// ---- the coast: a shoreline off to the upper left, everything measured as t (ft seaward) and u (ft along it) ----
let B_EXT=null,B_EXT_K='',B_OR=null,B_OR_K='';
function bInOL(x,y){const k=DIMS.join(',');if(!B_OR||B_OR_K!==k){B_OR_K=k;const T=hRS();B_OR=new Float32Array(360);for(let i=0;i<360;i++)B_OR[i]=T.open[i]?bOpenR(i-180,T.R[i]):T.R[i]}
 const phi=Math.atan2(x-H_CC.x,y-H_CC.y)/RAD,f=phi+180,i=Math.floor(f)%360,j=(i+1)%360,R=B_OR[i]+(B_OR[j]-B_OR[i])*(f-Math.floor(f));return Math.hypot(x-H_CC.x,y-H_CC.y)<R+2}
function bExt(){const k=DIMS.join(',');if(B_EXT!=null&&B_EXT_K===k)return B_EXT;B_EXT_K=k;let m=0;for(let ph=-180;ph<180;ph+=1){const T=hRS(),i=((ph+180)%360+360)%360;let t=T.R[i];if(T.open[i])t=bOpenR(ph,t);
  const x=Math.sin(ph*RAD)*t,y=Math.cos(ph*RAD)*t;m=Math.max(m,-.8*x+.6*y)}return B_EXT=m}
function bCoast(x,y){const u=.6*x+.8*(y-180),t=-.8*x+.6*(y-180)-(bExt()+34+16*Math.sin(u/150)+7*Math.sin(u/61));return{t,u}}
function bOcean(x,y){return bCoast(x,y).t>4}
function bTet(u,t){// tetrapods on a jittered 7 ft lattice: four stubby legs from a hub, lit on top
 const cs=7,i=Math.floor(u/cs),j=Math.floor(t/cs);for(let di=0;di<2;di++)for(let dj=0;dj<2;dj++){const ii=i-di+1,jj=j-dj+1,h=vHash(ii+977,jj+313);if(h%7===0)continue;
  const cx=(ii-.5)*cs+((h&7)-3.5)*.5,cy=(jj-.5)*cs+(((h>>3)&7)-3.5)*.5,a=(h>>6&15)/15*2.1,du=u-cx,dt=t-cy,d=Math.hypot(du,dt);if(d>3.4)continue;
  if(d<1.2)return dt<0?BC.tet:BC.tet2;const an=Math.atan2(dt,du)-a;for(let l=0;l<3;l++){const aa=an-l*2.094,pr=d*Math.cos(aa),pp=Math.abs(d*Math.sin(aa));if(pr>0&&pr<3.2&&pp<.85)return pp<.35&&dt<0?BC.tet:dt>0?BC.tetD:BC.tet2}}
 return null}
function bTree(u,t,t0,sp,r){// a row of round canopies along u at t0
 const i=Math.round(u/sp),cu=i*sp+((vHash(i,71)&3)-1.5),du=u-cu,dt=t-t0,d2=du*du+dt*dt;if(d2<r*r){const pink=vHash(i,19)%6===0;const l=du+dt;
  if(pink)return l<-r*.3?BC.pink:BC.pink2;return l<-r*.4?BC.tr3:l>r*.5?BC.tr1:BC.tr2}
 if((du-1.5)**2+(dt-1.5)**2<r*r)return BC.trS;return null}
function bCoastCol(x,y,wx,wy){const{t,u}=bCoast(x,y);if(t<-78)return null;
 if(t<-52){// the coastal road, a crosswalk now and then
  const cw=((u%260)+260)%260;if(t>-76&&t<-54&&cw<12)return ((Math.floor(cw/1.5))&1)?BC.road:BC.lane;
  if(Math.abs(t+65)<.4&&((u%12)+12)%12<6)return BC.lane;return BC.road}
 if(t<-49)return BC.curb;
 if(t<-14){// the promenade: slabs, a row of trees, lamps, benches, people
  const tr=bTree(u,t,-38,24,5.2);if(tr)return tr;
  if(Math.abs(t+22)<.8&&((((u+12)%30)+30)%30)<1.2){H_EMIS=H_NIGHT;return BC.lamp}
  const p=vPerson(wx,wy,6);if(p)return p;
  if(H_NIGHT){const lu=((((u+12)%30)+30)%30)-.6,lt=t+22,d=lu*lu+lt*lt;if(d<30&&(d<12||((Math.floor(wx)+Math.floor(wy))&1))){H_EMIS=true;return BC.promL}}
  if((((u%9)+9)%9)<.35||(((t%9)+9)%9)<.35)return BC.promJ;return vHash(Math.floor(u/9),Math.floor(t/9))%4===0?BC.prom2:BC.prom}
 if(t<-8){if(Math.abs(t+13.4)<.35)return BC.railW;if(((u%14)+14)%14<.4)return BC.wallT2;return t>-9.2?BC.wallT2:BC.wallT}// the seawall's top and rail
 if(t<-6)return BC.wallF;// its face, in shadow
 if(t<7){const c=bTet(u,t);if(c)return c;return BC.sea3}// tetrapods heaped at the foot of the wall
 // the sea: deeper further out, waves as clusters, lamp light lying on the water at night
 const w=Math.sin(u*.09+Math.sin(t*.045)*2.2+t*.02)+Math.sin(t*.21+u*.011);
 if(H_NIGHT&&t<70&&((((u+12)%30)+30)%30)<1.4&&vHash(Math.floor(t/2),Math.floor(u/30))%3===0){H_EMIS=true;return BC.refl}
 if(w>1.5)return t<14?BC.foam:BC.crest;const deep=t>160?2:t>60?1:0;return w<-1.2?BC.sea3:deep===2?BC.sea3:deep===1?BC.sea2:BC.sea}
// ---- past the outfield wall ----
const B_BR={t0:11,t1:43,a0:2.5,piers:[21,35]};
function bBridgeA(th){const f=(th-B_BR.t0)/(B_BR.t1-B_BR.t0);return 2.2*Math.sin(Math.PI*clamp(f,0,1))}// the walkway bows gently outward
function brickCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 if(!fair||q<0){const c=bCoastCol(x,y,wx,wy);if(c)return c;if(!bInOL(x,y))return null;if(y>0&&th<-40){const p=vPerson(wx,wy,6);if(p)return p;return bPave(r*th*RAD,r)}return BC.ring}
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 if(a>80){const c=bCoastCol(x,y,wx,wy);if(c)return c;return !bInOL(x,y)?null:th>-24?fTrees(wx,wy):BC.ring}
 // ---- right field: the footbridge ----
 if(th>B_BR.t0-1.5&&th<B_BR.t1+1.5){const b=a-bBridgeA(th),ends=Math.min((th-B_BR.t0)*RAD*r,(B_BR.t1-th)*RAD*r);
  if(b<2.5)return (Math.floor(s/9)&1)?BC.conc:BC.conc2;// the walk behind the wall
  const pier=B_BR.piers.some(tp=>Math.abs((th-tp)*RAD*r)<5);
  if(ends>-6&&b<34){if(ends<0){if(b>6&&b<24){const st=Math.floor(-ends/1.6);return st&1?BC.conc2:BC.concJ}return BC.conc}// stairs down at each end
   if(b<9){if(pier)return bBrick(s,b,false);const p=vPerson(wx,wy,10);if(p)return hMul(p,.55);if((vHash(Math.floor(s/7),1)&3)===0&&b<4.4){H_EMIS=H_NIGHT;return BC.shop}if(((s%9)+9)%9<1&&b>4.4)return BC.navyD;return (n&7)?BC.under:BC.under2}// the shade under the walkway, shop lights in it
   if(b<10.2)return b<9.6?BC.navy:BC.navyL;// the inner chord and rail
   if(b<18.5&&!pier){// the canopy over the inner half of the walk: navy metal on a steel frame, a lit edge
    if(b<11)return BC.navyL;if(b>17.9)return hMul(BC.navyD,.8);const fm=((s%9)+9)%9;if(fm<.7)return BC.navyL;if(((s%1.8)+1.8)%1.8<.3)return BC.navyD;return b<14.4?BC.navy:hMul(BC.navy,.82)}
   if(b<23){// the deck, with lamps along both rails and people crossing
    if((b<11.2||b>22)&&((s%14)+14)%14<1.1){H_EMIS=H_NIGHT;return BC.lamp}
    const p=vPerson(wx,wy,14);if(p)return p;
    if(H_NIGHT){const lm=((s%14)+14)%14-.55,e1=Math.min(Math.abs(b-10.7),Math.abs(b-22.5)),d=lm*lm+e1*e1;if(d<20&&(d<7||((Math.floor(wx)+Math.floor(wy))&1))){H_EMIS=true;return BC.deckL}}
    const pm=((b%1.6)+1.6)%1.6;if(pm<.3)return BC.deckJ;if(((s%11)+11)%11<.3)return BC.deckJ;return (Math.floor(b/1.6)&1)?BC.deck:BC.deck2}
   if(b<24.2)return b<23.6?BC.navyL:BC.navy;// the outer rail
   if(b<31){// the outer truss face: verticals, X bracing, dark space behind, lights along the bottom chord
    const bw=9,m=((s%bw)+bw)%bw,v=(b-24.2)/6.8,u=m/bw;if(pier)return bBrick(s,b,((s%4)+4)%4<2);
    if(m<1||v<.12||v>.88)return v<.12?BC.navyL:BC.navy;if(Math.abs(u-v)*bw<.7||Math.abs(u+v-1)*bw<.7)return BC.navyL;
    if(v>.74&&((m%3)+3)%3<.8){H_EMIS=H_NIGHT;return BC.shop}return BC.under}
   if(b<33.5)return hMul(BC.conc2,.55);// the bridge's shadow on the ground
  }
  if(a<56&&th>B_BR.t0+2){// ground-level kiosks in brick and metal beyond the bridge
   const k0=a-36,kw=24,km=((s%(kw+6))+(kw+6))%(kw+6);
   if(k0>0&&k0<18&&km<kw){if(k0<1.6){H_EMIS=H_NIGHT;return km%6<.6?BC.stD:BC.shop}// lit shopfronts facing the field
    if(k0>16.6)return hMul(BC.conc2,.6);if(Math.abs(k0-9)<.6)return BC.kRidge;if(km<.8||km>kw-.8)return bBrick(s,k0,false);return ((s%2)+2)%2<.3?BC.kRoof:k0<9?BC.kRoof2:BC.kRoof}
   if(a>=58)return fTrees(wx,wy);const p=vPerson(wx,wy,8);if(p)return p;return bPave(s,a)}}
 // ---- centre: a planted batter's eye under the board ----
 if(ath<=B_BR.t0-1.5&&th>-9){if(a<34){const k=vHash(Math.floor(wx/4),Math.floor(wy/4));return k%5===0?BC.hedge2:BC.hedge}return fTrees(wx,wy)}
 // ---- left-centre and left: stepped food-and-drink terraces, then a brick-paved concourse ----
 if(th<=-9||th<B_BR.t0){
  if(a<2.5)return BC.conc;
  if(a<24&&th<-9&&th>-38){const rw=Math.floor((a-2.5)/5.5),f=(a-2.5)-rw*5.5;if(f<.6)return BC.terrJ;
   // tables under orange and navy umbrellas, in rows on each step
   const um=((s+rw*7)%15+15)%15,cu=7.5,du=um-cu,dv=f-3;if(du*du+dv*dv<3.4){const o=vHash(Math.floor((s+rw*7)/15),rw)&1;return du+dv<0?(o?BC.umbO:BC.umbN):(o?BC.umbO2:BC.umbN2)}
   if(H_NIGHT&&f>4.8&&f<5.2&&((s%3)+3)%3<.6){H_EMIS=true;return BC.lamp}// string lights over each step
   const p=vPerson(wx,wy,22);if(p)return p;return (rw&1)?BC.terr:BC.terr2}
  if(a<25.4&&th<-9&&th>-38)return BC.railW;
  if(a>56){if(a>62)return th>-30?fTrees(wx,wy):BC.ring;return (Math.floor(s/7)&1)?BC.conc:BC.conc2}
  {const tr=th<-30||a>40?bTree(s,a,48,22,4.6):null;if(tr)return tr}
  const p=vPerson(wx,wy,8);if(p)return p;return bPave(s,a)}
 return null}
// ---- shapes (world px, both layers): seagulls and waves on the wall pads, the bridge sign ----
const B_GULL=['X.....X','.X...X.','..X.X..','...X...'];
function bXY(th,a){const r=fenceDist(Math.max(-45,Math.min(45,th)))+hPenOff(th)+a;return{x:Math.round(HX+Math.sin(th*RAD)*r/FT),y:Math.round(HY-Math.cos(th*RAD)*r/FT)}}
function bDecor(g){
 const wv=(th,len)=>{for(let i=-len;i<=len;i++){const t=th+i*.22,p=bXY(t,4.6+Math.sin(i*.42)*1.4),q=bXY(t,3.4+Math.sin(i*.42)*1.4);g.fillStyle='#3a6ab0';g.fillRect(p.x,p.y,1,1);if((i&3)===0){g.fillStyle='#8fb6e8';g.fillRect(q.x,q.y,1,1)}}};
 for(const th of[-25,-19,-4,4,19,24])wv(th,10);
 for(const th of[-33,-11.5,11.5]){const p=bXY(th,4.2);g.fillStyle='#e8eef5';B_GULL.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='X')g.fillRect(p.x-3+i,p.y-2+j,1,1)})}
 // the team's name on the bridge's outer face, mid-span
 {const p=bXY((B_BR.t0+B_BR.t1)/2,H_WALLW+27.5+bBridgeA((B_BR.t0+B_BR.t1)/2));g.save();g.translate(p.x,p.y);g.rotate(((B_BR.t0+B_BR.t1)/2)*RAD);
  g.fillStyle='#101a30';g.fillRect(-30,-6,60,12);g.fillStyle='#e8642a';g.fillRect(-30,-6,60,2);g.fillStyle='#e8eef5';g.font='bold 9px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('SEAGULLS',0,1.5);g.restore()}}
// ---- the main entrance behind home and its plaza (neighbourhood layer, half resolution) ----
function drawBrick(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=Math.round(cx(HX)),gy=Math.round(tip.y);const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 // the plaza: brick pavers, a light walk to the doors, tree grates in rows, a pink tree or two, lamp posts
 const PV=night?['#3c3533','#352f2d','#4a4542','#2c2826']:['#a8826e','#9a7764','#cfc6b8','#8a6a58'];
 g.fillStyle=PV[0];g.beginPath();g.moveTo(gx-160,gy-6);g.lineTo(gx+160,gy-6);g.lineTo(gx+200,gy+120);g.lineTo(gx-200,gy+120);g.closePath();g.fill();
 g.save();g.clip();for(let y=gy-6;y<gy+124;y+=6)R(gx-210,y,420,1,PV[1]);for(let y=gy-6,r2=0;y<gy+124;y+=6,r2++)for(let x=gx-210+(r2&1)*6;x<gx+210;x+=12)R(x,y,1,6,PV[1]);g.restore();
 R(gx-26,gy,52,120,PV[2]);for(let y=gy+4;y<gy+120;y+=8)R(gx-26,y,52,1,night?'#3e3a37':'#bdb3a4');
 for(let y=gy+110;y<gy+120;y+=3)R(gx-196,y,392,1,PV[3]);
 for(const sd of[-1,1])for(let r2=0;r2<2;r2++)for(let k2=0;k2<4;k2++){const tx=gx+sd*(56+r2*44+k2*6),ty=gy+22+k2*24;R(tx-5,ty-4,10,8,night?'#24201f':'#6e5a4c');((k2+r2)%4===1?hBlossom:hGreenTree)(g,tx,ty,7,night)}
 for(const sd of[-1,1])for(let k2=0;k2<4;k2++){const lx=gx+sd*36,ly=gy+18+k2*26;R(lx+1,ly+1,2,2,'rgba(0,0,0,.35)');R(lx-1,ly-1,3,3,'#1e2228');R(lx,ly,1,1,night?'#ffe7a8':'#d9d4c0')}
 // the entrance, built as a block seen from above and a little in front: each piece has a roof plane, a brick face toward the
 // plaza with recessed glass, a side return in shade, and a shadow on the paving
 const brick=(x0,y0,w,h,dark)=>{for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const row=y>>1,c=(((x>>1)+(row&1)*1)%3===0)?'#8c3c2a':(vHash((x>>2)+(row&1),row)%7===0?'#a84d35':'#9a4430');R(x0+x,y0+y,2,2,night?shade(c,dark?-.55:-.38):dark?shade(c,-.22):c)}
  for(let y=1;y<h;y+=2)R(x0,y0+y,w,0.5,'rgba(60,30,24,.25)')};
 const roof=(x0,y0,w,h,beams)=>{R(x0,y0,w,h,night?'#2b2f36':'#4e535b');R(x0,y0,w,1,night?'#4a5058':'#8e959e');R(x0,y0+h-1,w,1,'#1d2026');
  for(let x=x0+2;x<x0+w-1;x+=3)R(x,y0+1,1,h-2,night?'#262a30':'#454a52');if(beams)for(let x=x0+4;x<x0+w-2;x+=beams){R(x,y0+1,2,h-2,night?'#3e444c':'#6e757e');R(x+2,y0+1,1,h-2,'rgba(0,0,0,.25)')}};
 const glass=(x0,y0,w,h,step)=>{R(x0,y0,w,h,night?'#ffc46a':'#2f4458');if(night){for(let y=y0+1;y<y0+h;y+=4)R(x0,y,w,1,'#ffb04a')}else R(x0,y0,w,Math.max(1,h>>2),'#3e5a74');
  for(let x=x0;x<=x0+w;x+=step)R(x,y0,1,h,'#1c222a');R(x0,y0,w,1,'#14181e');R(x0,y0,1,h,'#14181e')};
 const WW=124,FY=gy+6,RH=14,FH=22;// wing half-width, front line, roof depth, front face height
 // shadows first
 R(gx-WW+8,FY-RH-FH+8,WW*2,RH+FH+4,'rgba(10,8,12,.32)');
 for(const sd of[-1,1]){const x0=sd<0?gx-WW:gx+38,w=WW-38;
  roof(x0,FY-FH-RH,w,RH,9);brick(x0,FY-FH,w,FH,false);
  for(let bx=x0+5;bx<x0+w-14;bx+=17){glass(bx,FY-FH+4,12,FH-8,4);R(bx-1,FY-FH+3,14,1,'#22262c');R(bx,FY-FH+FH/2|0,12,1,'#22262c')}// glass bays with a steel floor band
  R(x0,FY-FH,w,2,'#2a2e34');R(x0,FY-2,w,2,'#5e5a54');// steel lintel, stone base
  const ex=sd<0?x0:x0+w-5;brick(ex,FY-FH,5,FH,true);// the end return, in shade
  R(sd<0?x0+w-6:x0+1,FY-FH-RH-2,5,RH+FH+2,night?'#3a3633':'#cbbfae')}// stone pier where each wing meets the centre
 // the centre: a taller block, its roof set back, a deep arched portal with a steel canopy, the logo on the parapet
 const CW2=38,CT=FY-FH-RH-16;
 roof(gx-CW2,CT,CW2*2,RH+2,0);R(gx-CW2,CT+RH+2,CW2*2,3,'#2a2e34');
 brick(gx-CW2,CT+RH+5,CW2*2,FY-(CT+RH+5),false);
 for(const cx2 of[-CW2,-CW2+8,CW2-12,CW2-4])R(gx+cx2,CT+RH+5,4,FY-(CT+RH+5),night?'#5a4a40':'#d6c8b2');
 const ar=17,top=CT+RH+12,ab=FY;for(let y=top;y<ab;y++)for(let x=gx-ar-2;x<gx+ar+2;x++){const dx=x+.5-gx,dy=y+.5-(top+ar);const inA=y>=top+ar?Math.abs(dx)<ar:dx*dx+dy*dy<ar*ar,inR=y>=top+ar?Math.abs(dx)<ar+2:dx*dx+dy*dy<(ar+2)**2;
  if(!inR)continue;if(!inA){R(x,y,1,1,night?'#9a8a74':'#e0d4c0');continue}// the stone surround
  const deep=y<top+5||Math.abs(dx)>ar-3;R(x,y,1,1,deep?(night?'#7a5a2a':'#1a1e24'):night?((x&3)===0?'#d99a4a':'#ffd48a'):((x&3)===0?'#22262c':'#3a5068'))}
 R(gx-ar-6,ab-12,(ar+6)*2,3,'#2a2e34');R(gx-ar-6,ab-12,(ar+6)*2,1,'#7a828e');R(gx-ar-4,ab-9,(ar+4)*2,2,'rgba(0,0,0,.35)');// the canopy over the doors
 if(LOGO[k]){g.imageSmoothingEnabled=false;R(gx-12,CT-6,24,22,'#13254a');R(gx-12,CT-6,24,1,'#e8642a');g.drawImage(LOGO[k],gx-10,CT-4,20,20)}
 R(gx-CW2-10,FY,CW2*2+20,3,'rgba(0,0,0,.25)');
 // banners on the wing piers, people at the doors
 for(const sd of[-1,1]){const bx=gx+sd*(CW2+14)-4;R(bx+2,FY-FH+2,8,16,'rgba(0,0,0,.3)');R(bx,FY-FH,8,15,'#13254a');R(bx,FY-FH,8,2,'#e8642a');R(bx+2,FY-FH+6,4,4,'#e8eef5')}
 const pc=['#e8642a','#13254a','#e8eef5','#f2c230','#3a6ab0','#c94a3a'];for(let i=0;i<34;i++){const h=vHash(i,404),px=gx-60+(h%120),py=FY+6+((h>>8)%60);if(Math.abs(px-gx)>30&&((h>>4)&1))continue;R(px,py,1,2,pc[h%pc.length]);R(px,py-1,1,1,night?'#6a5040':'#e8c8a8')}}
function drawBrickLights(){}
// ---- the board (K units): navy steel frame on braced legs, flags along the top, Gwangan bridge in white line under the score ----
function drawJumboBrick(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,night=!!S.night,fy=(HY-fenceDist(0)/FT)/K,yb=fy-8,ex=16,yt=y0+h+ex+2,legs=[x0+26,x0+w-26];
 g.fillStyle='rgba(0,0,0,.26)';g.fillRect(x0+10,yb+1,w-4,10);
 for(const lx of legs){g.fillStyle=night?'#2a3c60':'#3a5482';g.fillRect(lx-4,yt,4,yb-yt);g.fillStyle='#101a30';g.fillRect(lx,yt,4,yb-yt);
  g.strokeStyle='rgba(6,10,20,.9)';g.lineWidth=.7;g.beginPath();for(let y=yt;y<yb-1;y+=6){g.moveTo(lx-4,y);g.lineTo(lx+4,y+6);g.moveTo(lx+4,y);g.lineTo(lx-4,y+6)}g.stroke();
  g.fillStyle='#6b7078';g.fillRect(lx-8,yb-2,16,5)}
 g.fillStyle='#1c2b4a';g.fillRect(legs[0],yt+(yb-yt)*.45,legs[1]-legs[0],2);
 drawJumbo0(g,now,true);
 // the strip under the score with the bridge drawn in white line
 const sy=y0+h+1;g.fillStyle='#05070c';g.fillRect(x0,sy,w,ex);g.fillStyle='#e8eef5';const P=(x,y)=>g.fillRect(Math.round(x),Math.round(y),1,1);
 const by=sy+ex-4;for(let x=x0+8;x<x0+w-8;x++)P(x,by);
 for(const tx of[cx-40,cx+40]){for(let y=sy+3;y<by;y++){P(tx-1,y);P(tx+1,y)}P(tx,sy+3)}
 const top=sy+3,sag=(by-top)*.72;for(let x=x0+8;x<x0+w-8;x++){const dx=Math.abs(x-cx);let y;if(dx<=40)y=top+sag*(1-(dx/40)**2);else{const f=(dx-40)/(w/2-48);y=top+(by-1-top)*Math.pow(clamp(f,0,1),.75)}P(x,y)}
 for(let x=cx-36;x<=cx+36;x+=6){const dx=Math.abs(x-cx),y=top+sag*(1-(dx/40)**2);for(let yy=Math.ceil(y)+1;yy<by;yy+=2)P(x,yy)}// hangers
 for(let x=x0+10;x<x0+w-10;x+=4)if(Math.abs(Math.abs(x-cx)-40)>2)P(x,by+1);
 g.strokeStyle='#1c2b4a';g.lineWidth=3;g.strokeRect(x0-3.5,y0-3.5,w+7,h+ex+8);g.strokeStyle='#3a5482';g.lineWidth=1;g.strokeRect(x0-5,y0-5,w+10,h+ex+11);
 // flags above
 const cols=['#e8642a','#13254a','#e8eef5','#13254a','#e8642a'];for(let i=0;i<5;i++){const fx=x0+18+i*(w-36)/4,wv=Math.sin(now/300+i)*1.2;g.fillStyle='#9aa0a8';g.fillRect(fx,y0-22,1.2,18);g.fillStyle=cols[i];g.beginPath();g.moveTo(fx+1.2,y0-22);g.lineTo(fx+11,y0-20+wv);g.lineTo(fx+1.2,y0-16);g.closePath();g.fill()}}
