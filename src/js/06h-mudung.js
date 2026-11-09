// ---------- Gwangju: Mudung Field. The shared bowl (06c) in red brick, pale stone and dark steel: a facade of brick with pale
// stone pilasters and glass bands, segmented dark-steel roofs with light grey tops, red and charcoal seats; the left-field
// stands stop early and run lower, the right side runs on further. Past the outfield wall: the Mudeungsan stone terrace behind
// left field (viewing platforms and paths stepping up between rows of basalt-like columns, each with a lit top, a front face
// and a shaded side), the board between two pale stone towers behind centre, and behind right field a taller run of brick and
// glass hospitality buildings (glass pavilion, rooftop terraces, a metal-roofed block) with restaurant seating along the wall.
// Beyond the ring the forested foothills of Mudeungsan fill the top of the map, with trails and outcrops of columnar rock.
// Every colour is a pure function of world position (mudungCol); trees, huts, umbrellas, signs and the entrance are shapes. ----------
const M_ADS=[['광주 은행','#f4f1e8'],['CATS MART','#ff6a58'],['무등산','#f4f1e8'],['LIGHT CITY BANK','#ffd23f'],['송정 떡갈비','#f4f1e8'],['GWANGJU AIR','#ff6a58'],['양림 커피','#ffd23f'],['MUDEUNG WATER','#f4f1e8']];
const MC=(()=>{const h=hRGB;return{
 sT:h('#c9c1b2'),sT2:h('#bcb4a4'),sTH:h('#ddd6c8'),sF:h('#948d82'),sF2:h('#878075'),sS:h('#5a5650'),sS2:h('#4a4742'),sR:h('#3a3632'),sR2:h('#46423c'),sAcc:h('#ffe7a0'),
 pv:h('#c9c1b2'),pv2:h('#bdb5a5'),pvJ:h('#a39b8c'),pvW:h('#b39a7c'),pvW2:h('#a68d70'),cop:h('#e2dccf'),
 red:h('#a8202a'),redL:h('#d8342f'),redB:h('#ff3a30'),
 br:h('#8e3a2c'),br2:h('#7f3327'),brL:h('#a8483a'),brD:h('#4a1e18'),brM:h('#7a4a36'),mort:h('#5e3a30'),
 st:h('#2a2d33'),stL:h('#4a4f58'),stD:h('#1a1c20'),
 gl:h('#2c3a4a'),gl2:h('#24303e'),glR:h('#4c6680'),glN:h('#ffb84a'),glNH:h('#ffe28a'),glN2:h('#f0a03a'),
 mr:h('#3a3e45'),mr2:h('#33373e'),mrS:h('#4e535b'),unit:h('#7a8088'),unitD:h('#5a6068'),
 dk:h('#8a6a4c'),dk2:h('#7e6044'),dkJ:h('#5a4430'),railG:h('#bcd6e0'),
 hed:h('#1f3d2a'),hed2:h('#284c34'),
 fo1:h('#1d4424'),fo2:h('#28582c'),fo3:h('#3a7034'),foG:h('#142e18'),au1:h('#a8401c'),au2:h('#d06624'),au3:h('#e8963a'),auR1:h('#8a261c'),auR2:h('#b83424'),auR3:h('#d8583a'),
 road:h('#55595e'),rk:h('#8e8a82'),rk2:h('#a9a59c'),rkD:h('#4c4944'),trail:h('#a8987a'),trail2:h('#988a6e'),step:h('#6a7a50')}})();
H_TCOL.autumn=['#8a3418','#c4521e','#e4862e','#ffd070'];H_TCOL.autumnN=['#3a1a10','#4a2214','#5a2c18','#7a4a2a'];
H_TCOL.maple=['#7a1c16','#a8281e','#d0442a','#ff9a6a'];H_TCOL.mapleN=['#34120e','#421812','#521e16','#703a2a'];
function hAutumn(g,x,y,r,night,red){hTreeTop(g,x,y,r,H_TCOL[(red?'maple':'autumn')+(night?'N':'')])}
H_PCOL.push(['#c0262a','#f4f1e8'],['#2a2a30','#f4f1e8']);// (5, 6): the Cats' red and charcoal umbrellas
// ---- the bowl's facade: red brick between pale stone pilasters, glass bands a floor at a time, a red line and stone coping on top ----
function mBrick(u,v){const ch=1.4,row=Math.floor(v/ch),off=(row&1)*1.4,fv=((v%ch)+ch)%ch,fu=(((u+off)%2.8)+2.8)%2.8;
 if(fv<.28||fu<.28)return MC.mort;const h=vHash(Math.floor((u+off)/2.8),row);return h%3===0?MC.br2:h%7===0?MC.brL:MC.br}
function mStone(u,v,dark){const ch=1.8,row=Math.floor(v/ch),off=(row&1)*2,fv=((v%ch)+ch)%ch,fu=(((u+off)%4.2)+4.2)%4.2;
 if(fv<.25||fu<.25)return dark?MC.sS2:MC.sF;const h=vHash(Math.floor((u+off)/4.2)+31,row);const c=h%3===0?MC.sT2:h%5===0?MC.sTH:MC.sT;return dark?hMul(c,.62):c}
function mFacade(k,T,sF){
 if(k<1.2)return MC.redL;if(k<2.4)return k<1.6?MC.red:MC.cop;
 const SEC=46,m=((sF%SEC)+SEC)%SEC,v=k-2.4,fl=((v%5.2)+5.2)%5.2,band=Math.floor(v/5.2);
 if(m<6.5){if(m>5.8)return MC.sS;return mStone(sF,k,false)}// a pale stone pilaster, its shaded return
 if(fl<.9)return fl<.45?MC.cop:MC.st;// a stone string course and its steel band
 const wm=m-6.5;if(fl>1.3&&fl<4.4&&wm>1.4&&wm<SEC-6.5-1.4){if(((wm%3.4)+3.4)%3.4<.4)return MC.st;// glass, mullions every few feet
  H_EMIS=H_NIGHT;if(H_NIGHT){const dim=(vHash(Math.floor(sF/SEC),band)&7)===0;const c=dim?hMul(MC.glN,.42):fl>3.9?MC.glNH:band&1?MC.glN2:MC.glN;return c}
  return fl<1.8||wm<2?MC.gl2:(sF*.09+fl*.25)%1<.13?MC.glR:MC.gl}
 return mBrick(sF,k)}
// ---- the roofs: separate dark-steel sections with light grey tops, a red trim line and a dark fascia showing their thickness;
// between sections the seats show through under exposed steel beams ----
function mRoof(k,Rd,phi,sF,gapSeat){
 const SEG=58,sm=((sF%SEG)+SEG)%SEG;
 if(sm<7){if(sm<1||sm>6)return MC.stL;if(((k%4)+4)%4<.8)return hMul(MC.stL,.85);// exposed beams across the gap
  return hMul(gapSeat(),k<Rd*.5?.46:.32)}
 if(sm<8.2)return MC.stD;// the section's end, in shade
 if(k<.7)return hMul(HB.roofEdge,1);if(k<2.1)return MC.stD;if(k<2.7)return MC.red;// lit lip, the dark fascia, a red trim line
 if(k>Rd-1.1)return HB.gutter;
 const bm=((sm-8.2)%12.5+12.5)%12.5;if(bm<.9)return bm<.45?HB.rib:hMul(HB.rib,.8);// steel beams across the top
 if(((sF%2.4)+2.4)%2.4<.35)return hMul(HB.roof2,.9);// panel seams
 const t=(k-2.7)/Math.max(1,Rd-3.8);return t<.55?(Math.floor(sF/2.4)&1?HB.roof:hMul(HB.roof,.97)):hMul(HB.roof2,.92)}// the inner slope lit, the outer one falling away
// ---- a field of columns: chamfered blocks in staggered rows between v0 and v1 (ft out from the field), u along. Each column
// leans with its height (the camera looks down and outward), so it shows its top, its front face toward the field and a
// shaded side; between them, dark recesses with a warm light here and there. null outside the band ----
function mCols(u,v,v0,v1,sd,hm){
 const ch=6.5,cw=7.2,j=Math.floor((v-v0)/ch);let face=null;
 for(const jj of[j-1,j]){if(jj<0||v0+(jj+1)*ch>v1+.01)continue;const off=(jj&1)*3.6,i=Math.floor((u+off)/cw);
  for(const ii of[i+1,i]){const h=vHash(ii*3+sd,jj*7+sd*5),L=1.2+((h>>>3)%5)/4*hm,Lu=L*.45,
   uA=ii*cw-off+.4+((h&3)*.12),uB=(ii+1)*cw-off-.4,vA=v0+jj*ch+.35,vB=v0+(jj+1)*ch-.45,ta=uA-Lu,tb=uB-Lu,tv0=vA+L,tv1=vB+L;
   if(u>=ta&&u<tb&&v>=tv0&&v<tv1){const du=Math.min(u-ta,tb-u),dv=Math.min(v-tv0,tv1-v);if(du+dv>=1){// the top
     if(dv<.45&&v<tv0+.5)return MC.sTH;// its lit front edge
     if(((h>>>7)&1)&&Math.abs(u-(ta+tb)/2-(v-tv0-2)*.4)<.22)return MC.sT2;// a joint across the column
     return (h>>>9)&1?MC.sT:MC.sT2}}
   if(face)continue;
   if(v>=vA&&v<tv0){const t=(v-vA)/L,a0=uA-t*Lu,b0=uB-t*Lu;if(u>=a0&&u<b0){// the front face
     if(v<vA+.3)face=MC.sR;else face=((Math.floor((u-a0)/1.2))&1)?MC.sF:MC.sF2;continue}}
   if(u>=uB-Lu&&u<uB){const t=(uB-u)/Lu;if(v>=vA+t*L&&v<vB+t*L&&!(v>=tv0&&u<tb)){face=v<vA+t*L+.6?MC.sS2:MC.sS;continue}}}}// the shaded side
 if(face)return face;
 if(v<v0||v>v1)return null;
 // the recesses between the columns
 const lc=vHash(Math.floor(u/3)+sd,Math.floor(v/3));if(lc%13===0){if(H_NIGHT){H_EMIS=true;return MC.sAcc}return MC.sR2}
 return MC.sR}
// ---- left field: the Mudeungsan stone terrace, stepping up from the wall ----
const M_T={plat:[2.4,14],r1:[14,24],t2:[24,34],r2:[34,44],t3:[44,56],big:56};
function mPave(s,a,warm){const row=Math.floor(a/3),off=(row&1)*3,fu=(((s+off)%6)+6)%6;if((((a%3)+3)%3)<.28||fu<.28)return MC.pvJ;
 const h=vHash(Math.floor((s+off)/6),row);return warm?(h%4===0?MC.pvW2:MC.pvW):(h%4===0?MC.pv2:MC.pv)}
function mTerr(a,s,wx,wy,th){
 if(a<2.4){if(a>1.5&&a<1.9)return MC.st;return a<.5?MC.sS:MC.cop}// the coping along the wall and the viewing rail
 const stair=((s%74)+74)%74<5.5;
 if(a<M_T.plat[1]){if(Math.abs(a-12.6)<.5&&((s%26)+26)%26<1){H_EMIS=H_NIGHT;return MC.sAcc}// lamp posts along the back
  if(a<3.2)return MC.st;const p=vPerson(wx,wy,18);if(p)return p;return mPave(s,a,false)}
 if(a<M_T.r1[1]){if(stair)return (Math.floor(a/1.1)&1)?MC.pv:MC.pvJ;const c=mCols(s,a,M_T.r1[0],M_T.r1[0]+6.5,11,1.4);if(c)return c}
 if(a<M_T.t2[1]){if(a>32.8){if(((s%26)+26)%26<1&&H_NIGHT){H_EMIS=true;return MC.sAcc}return MC.st}// a rail at the back of the path
  const p=vPerson(wx,wy,9);if(p)return p;return mPave(s,a,true)}
 if(a<M_T.r2[1]){if(((s+37)%74+74)%74<5.5)return (Math.floor(a/1.1)&1)?MC.pv:MC.pvJ;const c=mCols(s,a,M_T.r2[0],M_T.r2[0]+6.5,23,1.8);if(c)return c}
 if(a<M_T.t3[1]){if(a<44)return mPave(s,a,true);if(a<44.6)return MC.st;const p=vPerson(wx,wy,12);if(p)return p;return mPave(s,a,false)}
 // the big formation: rows of taller columns, a winding path climbing through it
 const pth=Math.abs(((s+(a-56)*1.1)%96+96)%96-48);if(pth<2.4)return pth<.5?MC.trail2:((Math.floor(a/1.3))&1)?MC.pvW:MC.pvW2;
 const c=mCols(s,a,M_T.big,M_T.big+39,37,2.6);if(c)return c;return MC.sR}
// ---- right field: the hospitality complex ----
// buildings by angle: [from, to, front roof, front floors, where the front part ends, its roof, total floors at the back, back]
// the front part is low (a glass pavilion, rooftop terraces over restaurants, a metal-roofed lounge); a taller block rises behind it
const M_RB=[[9.6,16.4,'glass',2,28,'metal',4,62],[17.6,26.6,'terr',3,36,'terr',6,86],[27.8,33.4,'metal',3,34,'glass',5,80],[34.6,44.6,'terr',4,42,'metal',7,88]];
// one section of a building: its front face from a0 (F floors showing), then its roof back to aE; e runs across it (0..wB)
function mSect(a,e,wB,a0,F,aE,kind,ground,bi,wx,wy){const fd=2.4*F,top=a0+fd;
 if(a<top){const v=a-a0,fl=((v%2.4)+2.4)%2.4,fi=Math.floor(v/2.4),cm=((e%7)+7)%7;
  if(a>top-.45)return MC.cop;// the balcony rail along the top
  if(cm<.8)return cm<.4?MC.stL:MC.st;// structural columns
  if(fl<.55)return ground&&fi===0?MC.st:MC.brL;// floor slabs
  if(!(ground&&fi===0)&&(cm<1.5||cm>6.4))return mBrick(e,v);// brick between the bays
  if(cm<1.85)return MC.brD;// the window's recess
  H_EMIS=H_NIGHT;if(H_NIGHT)return fl>2.05?MC.glNH:(vHash(Math.floor(e/7),fi+bi*9+(ground?0:40))&7)===0?hMul(MC.glN,.45):ground&&fi===0?MC.glN2:MC.glN;
  return fl>2.05?MC.glR:(e*.11+fl*.3)%1<.12?MC.glR:ground&&fi===0?MC.gl2:MC.gl}
 const k=a-top,Rd=aE-top;if(k<.9)return k<.4?MC.brL:MC.br;if(Rd-k<.7)return MC.brD;// the parapet; the back edge
 if(e<.9||wB-e<.9)return MC.br;
 if(kind==='terr'){// a rooftop terrace: decking, a glass rail round it, people
  if(k<1.6||Rd-k<1.6||e<1.8||wB-e<1.8)return (k<1.6||e<1.8)?MC.railG:hMul(MC.railG,.75);
  const p=vPerson(wx,wy,14);if(p)return p;if(((e%1.5)+1.5)%1.5<.25)return MC.dkJ;return (Math.floor(e/6)&1)?MC.dk:MC.dk2}
 if(kind==='glass'){// a glass roof: panes on steel
  if(((e%4)+4)%4<.45||((k%4)+4)%4<.45)return MC.stL;H_EMIS=H_NIGHT;if(H_NIGHT)return ((Math.floor(e/4)+Math.floor(k/4))&3)?MC.glN:MC.glNH;
  return (e*.2+k*.15)%1<.15?MC.glR:((Math.floor(e/4)+Math.floor(k/4))&1)?MC.gl:MC.gl2}
 // a dark metal roof: standing seams, plant, a long lit skylight
 const u=((e%22)+22)%22;if(k>Rd*.3&&k<Rd*.3+2.2&&e>4&&wB-e>4){H_EMIS=H_NIGHT;return H_NIGHT?MC.glN2:MC.glR}
 if(k>Rd*.62&&k<Rd*.62+5&&u>4&&u<12)return k<Rd*.62+.8?MC.unitD:MC.unit;if(((e%1.6)+1.6)%1.6<.3)return MC.mrS;return k<Rd*.5?MC.mr:MC.mr2}
function mHosp(a,s,wx,wy,th,r){
 if(a<4){// restaurant seating along the wall: tables in rows, people, warm planks
  const tm=((s%7)+7)%7,tr=((a%4)+4)%4;if(a>.6&&a<3.4&&tm>1.6&&tm<4.6&&tr>1.1&&tr<2.9)return a<1.4?hMul(MC.cop,.9):MC.cop;
  const p=vPerson(wx,wy,22);if(p)return p;return ((Math.floor(a/1.2))&1)?MC.dk:MC.dk2}
 if(a<5){if(((s%5)+5)%5<.5)return MC.st;return a<4.4?MC.railG:hMul(MC.railG,.8)}// a glass rail, its posts
 let shade=1;
 for(let bi=0;bi<M_RB.length;bi++){const[t0,t1,k1,F1,aM,k2,F2,aE]=M_RB[bi],e=(th-t0)*RAD*r,wB=(t1-t0)*RAD*r;
  if(e>=0&&e<wB&&a<aE)return a<aM?mSect(a,e,wB,5,F1,aM,k1,true,bi,wx,wy):mSect(a,e,wB,aM,F2-F1,aE,k2,false,bi,wx,wy);
  const sw=1.1*(a<aM?F1:F2);
  if(e>=wB&&e<wB+sw&&a>=5&&a<aE+.4){// the shaded side wall: dark brick with small windows
   const v=a-5,fl=((v%2.4)+2.4)%2.4;if(fl>.9&&fl<1.9&&((Math.floor(v/2.4))&1)===0){H_EMIS=H_NIGHT;return H_NIGHT?hMul(MC.glN,.7):MC.gl2}return ((Math.floor(v/1.2))&1)?MC.brD:MC.brM}
  if(e>=wB+sw&&e<wB+sw+2*(a<aM?F1:F2)&&a>=5&&a<aE)shade=.6;// its shadow on the ground
  if(e>=0&&e<wB&&a>=aE&&a<aE+1.4*F2)shade=.6}
 // the walks between and behind the buildings
 const p=vPerson(wx,wy,9);if(p)return shade<1?hMul(p,shade):p;const c=mPave(s,a,false);return shade<1?hMul(c,shade):c}
// ---- the centre: a planted batter's eye, a stone ledge, then the board's terrace and the foot of the mountain ----
function mCentre(a,s,wx,wy){
 if(a<6){const k=vHash(Math.floor(wx/4),Math.floor(wy/4));return k%5===0?MC.hed2:MC.hed}
 if(a<7.2)return a<6.5?MC.sS:MC.cop;
 if(a<30){if(Math.abs(s)>58&&Math.abs(s)<74)return mCols(s,a,7.2,30,53,2.2)||MC.sR;// stone column clusters under the towers
  const p=vPerson(wx,wy,6);if(p)return p;return mPave(s,a,false)}
 return null}
// ---- Mudeungsan: forest from above, autumn colour through it, terraces, trails and outcrops of columnar rock ----
function mTree(wx,wy){const cs=15,i=Math.floor(wx/cs),j=Math.floor(wy/cs),h=vHash(i+501,j+77);const cx=(i+.5)*cs+((h&7)-3.5),cy=(j+.5)*cs+(((h>>>3)&7)-3.5),r=6+(h>>>6&3);
 const dx=wx-cx,dy=wy-cy,d2=dx*dx+dy*dy,au=(h>>>9)%14;if(d2<r*r){const l=dx+dy;
  if(au===0)return l<-r*.5?MC.auR3:l>r*.6?MC.auR1:MC.auR2;if(au<2)return l<-r*.5?MC.au3:l>r*.6?MC.au1:MC.au2;
  return l<-r*.5?MC.fo3:l>r*.6?MC.fo1:MC.fo2}
 const sx=dx-3,sy=dy-3;if(sx*sx+sy*sy<r*r)return hMul(MC.foG,.85);return MC.foG}
function mMtn(x,y,wx,wy,d){
 if(d<7){if(d<1.2)return MC.st;const p=vPerson(wx,wy,8);if(p)return p;return mPave(x+y,d,true)}// a path round the foot of the hill
 // terraces stepping up the slope: a low stone edge every so often along the contour
 const e=d+18*Math.sin(x*.011)+9*Math.sin(x*.027+1.3),band=d>20&&((e%46)+46)%46<7;// the slope steps up in terraces: the foot of each one lies in shade
 // trails switching back up the hill
 const tu=x+38*Math.sin(y*.016)+18*Math.sin(y*.041),tm=Math.abs(((tu%210)+210)%210-105);if(tm<2.2&&d>8)return tm<.6?MC.trail2:MC.trail;
 // outcrops of columnar rock, more of them higher up
 const n=Math.sin(x*.012+1.7)*Math.sin(y*.015-.4)+.55*Math.sin(x*.031+y*.022)+.3*Math.sin(x*.07-y*.05);if(n>1.32-clamp((d-160)/600,0,.14)){const c=mCols(x,y,-1e5,1e5,71,2.4);return c===MC.sT||c===MC.sTH?MC.rk2:c===MC.sT2?MC.rk:c===MC.sF||c===MC.sF2?hMul(MC.rk,.82):c===MC.sAcc?MC.sAcc:MC.rkD}
 const c=mTree(wx,wy);return band?hMul(c,.8):c}
function mudungCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 if(!fair||q<0){if(fair)return null;
  if(!bInOL(x,y)){const phi=Math.atan2(x-H_CC.x,y-H_CC.y)/RAD;const lim=78+8*Math.sin(x*.01)+5*Math.sin(y*.013);if(Math.abs(phi)>lim||y<60)return null;if(Math.abs(phi)>lim-2.2||y<84){const ed=Math.min(lim-Math.abs(phi),(y-60)/12);return ed<.25||ed>2?MC.pv:MC.road}return mMtn(x,y,wx,wy,mRingD(x,y))}// a road along the foot of the hill
  if(y>0){const a2=r-fenceDist(Math.sign(th)*45)-H_WALLW;if(a2>60)return mTree(wx,wy);const p=vPerson(wx,wy,6);if(p)return p;return mPave(r*th*RAD,r,th<0)}return MC.pv}
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 if(!bInOL(x,y))return mMtn(x,y,wx,wy,mRingD(x,y));
 if(a>B_LIM()-6){if(a>B_LIM()-1.5)return MC.st;const p=vPerson(wx,wy,8);if(p)return p;return mPave(s,a,true)}// a walk inside the ring's edge
 if(th<-9)return mTerr(a,s,wx,wy,th);
 if(th>9.6)return mHosp(a,s,wx,wy,th,r);
 const c=mCentre(a,s,wx,wy);if(c)return c;return mMtn(x,y,wx,wy,a-30)}
function mRingD(x,y){const phi=Math.atan2(x-H_CC.x,y-H_CC.y)/RAD,f=phi+180,i=Math.floor(f)%360,j=(i+1)%360,R=B_OR[i]+(B_OR[j]-B_OR[i])*(f-Math.floor(f));return Math.max(0,Math.hypot(x-H_CC.x,y-H_CC.y)-R)}
// ---- shapes past the wall: autumn trees on the terrace paths, concession huts, the terrace's sign, umbrellas on the rooftops ----
function mDecor(g){
 for(let th=-43;th<-11;th+=4.6){const p=oXY(th,28+((Math.round(th*3)&3)-1.5)*.8);hAutumn(g,p.x,p.y,7,false,(Math.round(th*7)%3)===0)}
 for(let th=-41;th<-12;th+=7.4){const p=oXY(th+2.2,51);hAutumn(g,p.x,p.y,8,false,(Math.round(th)%2)===0)}
 // concession huts on the upper promenade: a dark steel roof with a light ridge, a red awning over a lit counter
 for(const th of[-38.5,-27.8,-17.6]){const p=oXY(th,49);g.save();g.translate(p.x,p.y);g.rotate(th*RAD);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-9,-4,22,12);g.fillStyle='#3a3e45';g.fillRect(-11,-6,22,10);g.fillStyle='#6a707a';g.fillRect(-11,-2,22,1);g.fillStyle='#4e535b';g.fillRect(-11,-6,22,1);
  for(let x=-11;x<11;x+=4){g.fillStyle='#c0262a';g.fillRect(x,4,2,3);g.fillStyle='#f4f1e8';g.fillRect(x+2,4,2,3)}g.fillStyle='#ffd48a';g.fillRect(-8,7,16,1);g.restore()}
 // the terrace's name on the platform's back rail
 {const p=oXY(-27,8.5);g.save();g.translate(p.x,p.y);g.rotate(-27*RAD);g.fillStyle='#1d1d22';g.fillRect(-36,-6,72,12);g.fillStyle='#c0262a';g.fillRect(-36,-6,72,1);g.fillRect(-36,5,72,1);
  g.fillStyle='#f4f1e8';g.font='bold 8px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('무등 STONE TERRACE',0,.5,68);g.restore()}
 // umbrellas on the rooftop terraces, trees along the walks behind the buildings
 for(const[t0,t1,k1,F1,aM,k2,F2,aE]of M_RB){let n=0;const um=(A0,A1)=>{for(let a=A0;a<A1;a+=8.5)for(let th=t0+1.6;th<t1-1;th+=2.6,n++){const p=oXY(th,a);hParasol(g,p.x,p.y,n&1?6:5,.5)}};if(k1==='terr')um(5+2.4*F1+5,aM-4);if(k2==='terr')um(aM+2.4*(F2-F1)+5,aE-4)}
 for(const th of[17,27.2,34])for(const a of[14,34,56]){const p=oXY(th,a);hGreenTree(g,p.x,p.y,5,false)}
 // the lounge's name across the metal roof
 {const p=oXY(30.6,24);g.save();g.translate(p.x,p.y);g.rotate(30.6*RAD);g.fillStyle='#f4f1e8';g.font='bold 9px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('CATS',0,0);g.restore()}
 {const p=oXY(39.6,15.5);g.save();g.translate(p.x,p.y);g.rotate(39.6*RAD);g.fillStyle='#1d1d22';g.fillRect(-30,-5,60,10);g.fillStyle='#c0262a';g.fillRect(-30,-5,60,1);g.fillStyle='#f4f1e8';g.font='bold 7px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('LIGHT CITY CLUB',0,.5,56);g.restore()}}
// ---- the neighbourhood layer: the main entrance and its plaza, crosswalks, streetlights ----
function drawMudung(g,k,night,CW,CH,cx,cy,OL,e){
 const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=Math.round(cx(HX)),gy=Math.round(tip.y);const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const N=(d,n)=>night?n:d;
 // the plaza: pale stone slabs, red brick bands fanning from the doors, planters with maples, lamp posts
 const PV=night?['#3a3836','#33312f','#4a4642','#4a2420']:['#cfc8ba','#bfb8aa','#e4ded2','#9a4032'];
 g.fillStyle=PV[0];g.beginPath();g.moveTo(gx-176,gy-8);g.lineTo(gx+176,gy-8);g.lineTo(gx+214,gy+118);g.lineTo(gx-214,gy+118);g.closePath();g.fill();
 g.save();g.clip();for(let y=gy-8;y<gy+122;y+=7)R(gx-220,y,440,1,PV[1]);for(let y=gy-8,r2=0;y<gy+122;y+=7,r2++)for(let x=gx-220+(r2&1)*7;x<gx+220;x+=14)R(x,y,1,7,PV[1]);
  for(const sd of[-1,1])for(const f of[.55,1.25]){for(let y=gy;y<gy+118;y++)R(gx+sd*(30+(y-gy)*f),y,3,1,PV[3])}g.restore();
 R(gx-28,gy,56,118,PV[2]);for(let y=gy+4;y<gy+118;y+=8)R(gx-28,y,56,1,N('#d2cbbd','#423e3a'));
 for(const sd of[-1,1])for(let r2=0;r2<2;r2++)for(let k2=0;k2<4;k2++){const tx=gx+sd*(62+r2*48+k2*7),ty=gy+24+k2*24;R(tx-6,ty-5,12,10,N('#8a8478','#24221f'));R(tx-6,ty-5,12,1,N('#e4ded2','#3a3836'));hAutumn(g,tx,ty,7,night,(k2+r2)%3===0)}
 for(const sd of[-1,1])for(let k2=0;k2<4;k2++){const lx=gx+sd*40,ly=gy+18+k2*26;R(lx+1,ly+1,2,2,'rgba(0,0,0,.35)');R(lx-1,ly-1,3,3,'#1e2024');R(lx,ly,1,1,night?'#ffe7a8':'#d9d4c0')}
 // the street across the front of the plaza, with a crosswalk to the doors and streetlights
 {const ry=gy+120;R(gx-260,ry,520,14,N('#55595e','#24262a'));R(gx-260,ry,520,1,N('#c9c5bb','#3a3a3a'));R(gx-260,ry+13,520,1,N('#c9c5bb','#3a3a3a'));for(let x=gx-256;x<gx+256;x+=10)R(x,ry+6.5,5,1,N('#e8d27a','#6a6040'));
  for(const cxw of[gx,gx-150,gx+150])for(let x=cxw-14;x<cxw+14;x+=4)R(x,ry+1,2,12,N('#ece9e0','#5a5a58'));
  for(let x=gx-250;x<gx+250;x+=36){R(x,ry-3,2,2,'#1e2024');R(x,ry-3,1,1,night?'#ffe7a8':'#c9c5bb');R(x+12,ry+16,2,2,'#1e2024');R(x+12,ry+16,1,1,night?'#ffe7a8':'#c9c5bb')}}
 const stone=(x0,y0,w,h,dk)=>{for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=5){const row=y/3|0,c=vHash(((x+(row&1)*2)/5)|0,row+7)%3===0?'#cbc3b3':'#d9d2c4';R(x0+x,y0+y,5,3,night?shade(c,dk?-.62:-.5):dk?shade(c,-.3):c)}
  for(let y=0;y<h;y+=3)R(x0,y0+y,w,.5,night?'rgba(0,0,0,.4)':'rgba(120,110,95,.5)')};
 const brick=(x0,y0,w,h,dark)=>{for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const row=y>>1,c=(((x>>1)+(row&1))%3===0)?'#7f3327':(vHash((x>>2)+(row&1),row)%7===0?'#a8483a':'#8e3a2c');R(x0+x,y0+y,2,2,night?shade(c,dark?-.55:-.4):dark?shade(c,-.25):c)}};
 const RH=14,FH=22,FY=gy+6;
 // the front follows the bowl round: brick bays with a glass bay each and pale stone piers, a roof strip, a shadow
 {const ctr={x:gx,y:cy(HY)};const pts=OL.filter(q=>q.y>ctr.y+20&&Math.abs(q.x-gx)>40);
  const bays=[];for(const sd of[-1,1]){const side=pts.filter(q=>(q.x-gx)*sd>0).sort((a2,b2)=>Math.abs(a2.x-gx)-Math.abs(b2.x-gx));let acc=0,last=null;
   for(const q of side){if(last)acc+=Math.hypot(q.x-last.x,q.y-last.y);last=q;if(acc>=24||bays.filter(b2=>b2.sd===sd).length===0&&Math.abs(q.x-gx)>70){if(acc>230)break;bays.push({q,sd});acc=0}}}
  for(const pass of[0,1])for(const{q,sd}of bays){const dx=q.x-ctr.x,dy=q.y-ctr.y,l=Math.hypot(dx,dy),nx=dx/l,ny=dy/l,ang=Math.atan2(ny,nx)-Math.PI/2;
   g.save();g.translate(Math.round(q.x+nx*2),Math.round(q.y+ny*2));g.rotate(ang);
   if(pass===0){R(-12+5,-RH+4,25,RH+FH+2,'rgba(10,8,12,.3)');g.restore();continue}
   R(-13,-RH,26,RH,N('#3a3e45','#24272c'));R(-13,-RH,26,1,N('#9aa0a8','#4a4f58'));for(let x=-12;x<13;x+=3)R(x,-RH+1,1,RH-2,N('#33373e','#1f2226'));R(-13,-2,26,2,'#a8202a');
   brick(-13,0,26,FH,false);R(-13,0,26,2,'#2a2d33');R(-13,FH-2,26,2,N('#d6cfc1','#4a4642'));
   R(-8,4,16,FH-8,night?'#ffb84a':'#2c3a4a');if(night){R(-8,4,16,1,'#ffe28a');for(let y=7;y<FH-4;y+=4)R(-8,y,16,1,'#f0a03a')}else R(-8,4,16,3,'#4c6680');
   for(let x=-8;x<=8;x+=4)R(x,4,1,FH-8,'#1a1c20');
   stone(-15,-RH-1,4,RH+FH+1,false);stone(11,-RH-1,4,RH+FH+1,true);
   if(vHash(Math.round(q.x),Math.round(q.y))%3===0){R(-3,1,6,13,'#a8202a');R(-3,1,6,1,'#f4f1e8');R(-1,5,2,4,'#f4f1e8')}
   g.restore()}}
 // the centre: a tall glass hall between pale stone towers, a steel roof, the sign band, the doors under a canopy
 const W2=58,CT=FY-FH-RH-22,TW=14;
 R(gx-W2-TW+8,CT+8,(W2+TW)*2,FY-CT,'rgba(0,0,0,.3)');
 // the roof over the hall: light grey top, seams, beams, a red trim and the dark fascia
 R(gx-W2,CT,W2*2,RH,N('#c4c8cc','#5a5e64'));for(let x=gx-W2;x<gx+W2;x+=4)R(x,CT+1,1,RH-2,N('#b0b4ba','#4e5258'));for(let x=gx-W2+10;x<gx+W2;x+=20){R(x,CT+1,2,RH-2,N('#8a9098','#3e4248'))}
 R(gx-W2,CT,W2*2,1,N('#e6e8ea','#7a7e84'));R(gx-W2,CT+RH-3,W2*2,1,'#a8202a');R(gx-W2,CT+RH-2,W2*2,2,'#1a1c20');
 // the glass hall: tall panes on steel, warm light inside at night, a mezzanine line
 const gy0=CT+RH,gh=FY-gy0-8;R(gx-W2,gy0,W2*2,gh,night?'#ffb84a':'#2c3a4a');
 if(night){for(let y=gy0+2;y<gy0+gh;y+=5)R(gx-W2,y,W2*2,1,'#f0a03a');R(gx-W2,gy0,W2*2,2,'#ffe28a')}else{for(let x=gx-W2;x<gx+W2;x+=16)R(x+3,gy0,5,gh,'#4c6680');R(gx-W2,gy0,W2*2,2,'#24303e')}
 for(let x=gx-W2;x<=gx+W2;x+=8){R(x,gy0,2,gh,'#1a1c20');R(x,gy0,1,gh,'#4a4f58')}R(gx-W2,gy0+Math.round(gh*.45),W2*2,2,'#1a1c20');
 // the sign band across the glass: MUDUNG FIELD on deep red, GWANGJU CATS under it
 R(gx-46,gy0+3,92,13,'#8e1f1c');R(gx-46,gy0+3,92,1,'#ff3a30');R(gx-46,gy0+15,92,1,'#5a1412');
 g.textAlign='center';g.textBaseline='middle';g.fillStyle=night?'#ffd890':'#f4f1e8';g.font='bold 9px "Pixelify Sans", monospace';g.fillText('MUDUNG FIELD',gx,gy0+10);
 R(gx-34,gy0+17,68,8,'#1d1d22');g.fillStyle=night?'#ffd890':'#f4f1e8';g.font='bold 6px "Pixelify Sans", monospace';g.fillText('GWANGJU CATS',gx,gy0+21.5);
 // the doors under a steel canopy
 const dy0=FY-8;R(gx-W2,dy0,W2*2,8,N('#d6cfc1','#4a4642'));for(let i=0;i<6;i++){const dx=gx-45+i*16;R(dx,dy0+1,10,7,'#1a1c20');R(dx+1,dy0+2,8,6,night?'#ffd48a':'#3a4a5c');R(dx+4.5,dy0+2,1,6,'#1a1c20')}
 R(gx-W2-4,dy0-3,(W2+4)*2,3,'#2a2d33');R(gx-W2-4,dy0-3,(W2+4)*2,1,'#7a828e');R(gx-W2-2,dy0,(W2+2)*2,1,'rgba(0,0,0,.35)');
 // the stone towers either side, taller than the hall: a lit top, a front face in coursed stone, a shaded return
 for(const sd of[-1,1]){const tx=sd<0?gx-W2-TW:gx+W2;R(tx,CT-10,TW,6,N('#ece6d9','#6a6660'));R(tx,CT-10,TW,1,'#fff8ea');stone(tx,CT-4,TW,FY-CT+4,false);R(sd<0?tx:tx+TW-3,CT-4,3,FY-CT+4,N('rgba(60,50,40,.35)','rgba(0,0,0,.35)'));
  R(tx,CT-4,TW,1,'#a8202a');
  // a tall team banner hung on each tower
  const bx=tx+3,by=CT+2;R(bx+2,by+2,8,30,'rgba(0,0,0,.3)');R(bx,by,8,30,'#c0262a');R(bx,by,8,2,'#f4f1e8');R(bx,by+28,8,2,'#1d1d22');R(bx+2,by+8,4,4,'#f4f1e8');R(bx+3,by+9,2,2,'#c0262a');R(bx+1,by+16,6,1,'#f4f1e8');R(bx+1,by+19,6,1,'#f4f1e8')}
 // the Cats' logo in a medallion on the roof's edge
 if(LOGO[k]){g.imageSmoothingEnabled=false;g.fillStyle='#8e1f1c';g.beginPath();g.arc(gx,CT+2,14,0,7);g.fill();g.strokeStyle='#f4f1e8';g.lineWidth=2;g.stroke();g.drawImage(LOGO[k],gx-10,CT-8,20,20)}
 // brick wings between the towers and the curve of bays: roof, brick face with recessed windows, a stone base
 for(const sd of[-1,1]){const wx0=sd<0?gx-W2-TW-34:gx+W2+TW,ww=34,wt=FY-FH-RH+2;R(wx0+6,wt+6,ww,FY-wt,'rgba(0,0,0,.28)');
  R(wx0,wt,ww,RH-2,N('#3a3e45','#24272c'));R(wx0,wt,ww,1,N('#9aa0a8','#4a4f58'));for(let x=wx0+1;x<wx0+ww;x+=3)R(x,wt+1,1,RH-4,N('#33373e','#1f2226'));R(wx0,wt+RH-3,ww,1,'#a8202a');
  brick(wx0,wt+RH-2,ww,FY-(wt+RH-2),false);R(wx0,FY-3,ww,3,N('#d6cfc1','#4a4642'));
  for(let x=wx0+3;x<wx0+ww-5;x+=8)for(const yy of[wt+RH+2,wt+RH+11]){R(x,yy,6,6,'#4a1e18');R(x+1,yy,5,6,night?'#ffb84a':'#2c3a4a');if(night)R(x+1,yy,5,1,'#ffe28a');else R(x+1,yy,5,1,'#4c6680')}}
 // people at the doors and on the plaza
 const pc=['#c0262a','#1d1d22','#f4f1e8','#d8342f','#3a6ab0','#e8b44a'];for(let i=0;i<46;i++){const h=vHash(i,909),px=gx-80+(h%160),py=FY+6+((h>>>8)%96);if(Math.abs(px-gx)>34&&((h>>>4)&1))continue;R(px,py,1,2,pc[h%pc.length]);R(px,py-1,1,1,night?'#6a5040':'#e8c8a8')}}
// ---- night: warm light on the terrace paths and between the columns, the restaurants and rooftops, the board, red on the towers ----
let M_NL=null,M_NL_K='';
function drawMudungLights(c,vx0,vy0,scale,now){if(!ST||ST.bowl!=='mudung'||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!M_NL||M_NL_K!==key){M_NL_K=key;const pts=[];for(let th=-45;th<=45;th+=1)pts.push(oXY(th,0));const x0=Math.min(...pts.map(p=>p.x))-300,y0=Math.min(...pts.map(p=>p.y))-300,x1=Math.max(...pts.map(p=>p.x))+300,y1=Math.max(...pts.map(p=>p.y))+80;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  for(let th=-44;th<-10;th+=2.4){for(const a of[13,33,50]){const p=oXY(th,a);glow(p.x,p.y,14,'255,200,110',.5)}}
  for(let th=-42;th<-12;th+=4){for(const a of[64,80]){const p=oXY(th+(a>70?2:0),a);glow(p.x,p.y,20,'255,214,140',.2)}}
  for(let th=11;th<44;th+=3){const p=oXY(th,3);glow(p.x,p.y,22,'255,196,110',.28)}
  for(const[t0,t1,k1,F1,aM,k2,F2]of M_RB){for(let th=t0+1;th<t1;th+=2.2){const p=oXY(th,5+F1*1.2);glow(p.x,p.y,18+F1*3,'255,180,90',.42);const q=oXY(th,aM+(F2-F1)*1.2);glow(q.x,q.y,18,'255,180,90',.32)}if(k1==='glass')for(let th=t0+1;th<t1;th+=2)for(let a=10;a<aM;a+=6){const p=oXY(th,a);glow(p.x,p.y,14,'255,190,100',.3)}}
  for(let th=10;th<45;th+=2){const p=oXY(th,1.5);glow(p.x,p.y,10,'255,60,48',.18)}// red accent lights along the restaurant rail
  for(const th of[-8.5,8.5]){const p=oXY(th,12);glow(p.x,p.y,30,'255,70,60',.22)}
  {const p=oXY(0,10);glow(p.x,p.y,80,'255,210,150',.24)}
  M_NL={cv,x0,y0,x1,y1}}
 const L=M_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='lighter';c.drawImage(L.cv,L.x0,L.y0,L.x1-L.x0,L.y1-L.y0);c.restore()}
// ---- the board (K units): set between two pale stone towers, dark red trim, flags, MUDUNG FIELD lit above, GWANGJU CATS
// under it, a red mountain ridge along the strip below the score and the Cats' logo in a panel on the left ----
function drawJumboMudung(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,night=!!S.night,fy=(HY-fenceDist(0)/FT)/K,yb=fy-6,ex=12;
 const TW=30,lp=x0-36,rp=x0+w+6,tl=lp-TW-4,tr=rp+30+4,top=y0-34,lintel=[tl,top,tr+TW-tl,16];
 // the shadow on the terrace and the structure behind the board: a dark steel back frame between the towers
 g.fillStyle='rgba(0,0,0,.28)';g.fillRect(tl+10,yb-2,tr+TW-tl,12);
 g.fillStyle='#1a1c20';g.fillRect(lp-2,y0-6,rp+30-lp+4,h+ex+16);
 // the stone towers: a lit cap, coursed pale stone on the front, a shaded return on the outer side, a red band near the top
 const tower=(x,sd)=>{g.drawImage(jCache('mudTower'+x+'_'+(night?1:0),x-4,top-6,TW+8,yb-top+8,gg=>{
   const P=(xx,yy,ww,hh,c)=>{gg.fillStyle=c;gg.fillRect(xx,yy,ww,hh)};
   P(x,top-6,TW,6,night?'#8a857c':'#ece6d9');P(x,top-6,TW,1,'#fff8ea');
   for(let y=top,row=0;y<yb;y+=4,row++)for(let xx=0;xx<TW;xx+=7){const o=(row&1)*3,c=vHash(xx+o+x,row)%3===0?'#c8c0b0':'#d6cfc1';P(x+Math.max(0,xx-o),y,Math.min(7,TW-Math.max(0,xx-o)),4,night?shade(c,-.42):c)}
   for(let y=top;y<yb;y+=4)P(x,y,TW,.6,night?'rgba(0,0,0,.35)':'rgba(120,110,95,.45)');
   P(sd<0?x:x+TW-6,top,6,yb-top,night?'rgba(0,0,0,.42)':'rgba(70,60,50,.36)');
   P(x,top+8,TW,3,'#a8202a');P(x,top+8,TW,1,'#d8342f');
   // a column joint pattern: three tall shafts
   for(const f of[.33,.66])P(x+Math.round(TW*f),top+12,1,yb-top-14,night?'rgba(0,0,0,.3)':'rgba(110,100,86,.45)');
   P(x-3,yb-4,TW+6,4,night?'#4a4642':'#9c958a')}),x-4,top-6,TW+8,yb-top+8)};
 tower(tl,-1);tower(tr,1);
 drawJumbo0(g,now,true);
 // the lintel between the towers: MUDUNG FIELD in lights, the red trim
 const[lx,ly,lw]=lintel;g.fillStyle='#1d1d22';g.fillRect(lx+TW,ly,lw-TW*2,18);g.fillStyle='#a8202a';g.fillRect(lx+TW,ly,lw-TW*2,2);g.fillRect(lx+TW,ly+16,lw-TW*2,2);
 g.textAlign='center';g.textBaseline='middle';g.font='bold 13px "Pixelify Sans", monospace';g.fillStyle=night?'#fff0d8':'#f4f1e8';g.fillText('MUDUNG FIELD',cx,ly+9.5);
 g.fillStyle=night||Math.floor(now/1100)%2?'#ff5a48':'#d8342f';g.fillRect(cx-70,ly+8,6,2);g.fillRect(cx+64,ly+8,6,2);
 // the trim round the board and its side panels
 g.strokeStyle='#a8202a';g.lineWidth=2;g.strokeRect(lp-3,y0-3,rp+30-lp+6,h+ex+6);g.strokeStyle='#5a1412';g.lineWidth=1;g.strokeRect(lp-5,y0-5,rp+30-lp+10,h+ex+10);
 // the left panel: the Cats' logo; the right: the city's name
 g.fillStyle='#05070a';g.fillRect(lp,y0,30,h);g.fillRect(rp,y0,30,h);g.strokeStyle='#a8202a';g.strokeRect(lp+.5,y0+.5,29,h-1);g.strokeRect(rp+.5,y0+.5,29,h-1);
 if(LOGO.gwangju){g.imageSmoothingEnabled=false;g.drawImage(LOGO.gwangju,lp+2,y0+h/2-13,26,26)}
 g.fillStyle='#f4f1e8';g.font='9px Jua, sans-serif';g.fillText('광',rp+15,y0+16);g.fillText('주',rp+15,y0+30);g.fillStyle='#ff5a48';g.font='6px "Press Start 2P", monospace';g.fillText('빛',rp+15,y0+46);g.fillStyle='#ffd23f';g.fillRect(rp+12,y0+54,6,2);
 // the strip under the score: an abstract red mountain ridge
 const sy=y0+h;g.drawImage(jCache('mudRidge'+cx,x0,sy,w,ex,gg=>{gg.fillStyle='#05070a';gg.fillRect(x0,sy,w,ex);
  for(let x=0;x<w;x++){const t=x/w,hh=3+4*Math.abs(Math.sin(t*9.5))+2.5*Math.max(0,Math.sin(t*3.1+.4))+(Math.abs(t-.5)<.06?2:0),yy=sy+ex-1-Math.round(hh);gg.fillStyle='#a8202a';gg.fillRect(x0+x,yy,1,sy+ex-1-yy);gg.fillStyle='#ff3a30';gg.fillRect(x0+x,yy,1,1)}
  gg.fillStyle='#f4f1e8';gg.fillRect(x0+Math.round(w*.5)-1,sy+ex-1-9,2,1)}),x0,sy,w,ex);
 // GWANGJU CATS on a plate below, on the board's frame
 g.fillStyle='#1d1d22';g.fillRect(cx-52,sy+ex+4,104,11);g.fillStyle='#a8202a';g.fillRect(cx-52,sy+ex+4,104,1);g.fillStyle='#f4f1e8';g.font='bold 8px "Pixelify Sans", monospace';g.fillText('GWANGJU CATS',cx,sy+ex+10);
 // team flags along the top of the towers and the lintel
 const cols=['#c0262a','#1d1d22','#f4f1e8','#1d1d22','#c0262a'];for(let i=0;i<5;i++){const fx=lx+TW+16+i*(lw-TW*2-32)/4,wv=Math.sin(now/300+i)*1.2;g.fillStyle='#9aa0a8';g.fillRect(fx,ly-14,1.2,14);g.fillStyle=cols[i];g.beginPath();g.moveTo(fx+1.2,ly-14);g.lineTo(fx+11,ly-12+wv);g.lineTo(fx+1.2,ly-8);g.closePath();g.fill()}
 for(const x of[tl+TW/2,tr+TW/2]){const wv=Math.sin(now/280+x)*1.3;g.fillStyle='#9aa0a8';g.fillRect(x,top-22,1.4,16);g.fillStyle='#c0262a';g.beginPath();g.moveTo(x+1.4,top-22);g.lineTo(x+14,top-19+wv);g.lineTo(x+1.4,top-15);g.closePath();g.fill();g.fillStyle='#f4f1e8';g.fillRect(x+4,top-20,3,2)}}
