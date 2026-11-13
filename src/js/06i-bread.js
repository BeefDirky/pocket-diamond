// ---------- Daejeon: Bread Bowl Park. The shared bowl (06c) as a horseshoe in navy, royal blue, red and cream under segmented
// grey-and-glass roofs, with a glass-and-steel front. Past the wall the centre-field skyline is the park's signature:
//   GIANT LEFT BOARD (the club's screen)  -  THE BEAR CAVE  -  GIANT RIGHT BOARD (the batter's card and the score)
// The cave is a rock formation built as a height field of stacked boulders: the camera looks down and outward, so every
// boulder shows a lit top and a shaded face toward the field, crevices fall to near black, and the cliff at the front
// carries an arched mouth with a lit concourse inside (stalls, pillars, people) and a stone relief of the Bears' head above.
// Left of it stand the glass-and-concrete labs of the Daedeok science district; right of it the steel-and-glass pavilions
// of the Expo grounds. Beyond the ring: Expo park, the Gapcheon river with its arch bridge, and Hanbit Tower.
// Ground colours are pure functions of world position (breadCol); trees, signs, the relief, the bridge and the tower are shapes. ----------
const D_ADS=[['빵의 도시','#f4ead8'],['DAEDEOK LABS','#9fc4ff'],['한밭 은행','#f4ead8'],['EXPO AIR','#ff9a8a'],['소보로 빵집','#ffd9a0'],['SCIENCE CITY','#9fc4ff'],['갑천 우유','#f4ead8'],['BEAR BREAD','#ffd9a0']];
const DJ=(()=>{const h=hRGB;return{
 navy:h('#14244e'),navy2:h('#182b5c'),navyD:h('#0c1634'),royal:h('#3b5cae'),red:h('#d0202e'),redD:h('#a01824'),cream:h('#f4ead8'),cream2:h('#e2d6c0'),
 st:h('#2a3040'),stL:h('#56607a'),stD:h('#161b28'),silver:h('#c9d0d8'),silver2:h('#aab2be'),
 gl:h('#2c4468'),gl2:h('#243a5a'),glR:h('#5a7ea8'),glN:h('#ffbe5c'),glNH:h('#ffe49a'),glN2:h('#f2a440'),
 conc:h('#b9bdc4'),conc2:h('#aaaeb6'),concD:h('#7c8088'),concJ:h('#93979f'),
 pv:h('#c6c2b8'),pv2:h('#b9b5ab'),pvJ:h('#a09c92'),pvW:h('#c9ae84'),pvW2:h('#bda178'),
 deck:h('#3a4050'),deck2:h('#343a48'),grate:h('#4a5164'),
 hed:h('#1f4a2a'),hed2:h('#2a5e34'),hed3:h('#3a7a3e'),fl1:h('#d8343c'),fl2:h('#f4ead8'),mulch:h('#3a2c22'),mulch2:h('#44342a'),
 lawn:h('#4f9a48'),lawn2:h('#58a650'),lawnD:h('#3f8440'),tr1:h('#1e4a26'),tr2:h('#2a6230'),tr3:h('#3e8040'),trG:h('#2c5a30'),
 path:h('#d2c8ae'),path2:h('#c4ba9f'),
 riv:h('#2a6a92'),riv2:h('#245e84'),rivHi:h('#6fb0d0'),rivSh:h('#3a80a6'),bank:h('#b8b2a2'),bank2:h('#8e8a7e'),
 road:h('#50545a'),road2:h('#484c52'),dash:h('#e2d48a'),walk:h('#c4c0b6'),
 // the rock: warm greys and browns, lit tops, shaded faces, black crevices
 rk:[h('#a59a88'),h('#9a8f7e'),h('#b0a593'),h('#8f8676'),h('#a3927a'),h('#96897a')],rkLip:h('#cdc3ae'),rkCr:h('#1a1714'),rkF:[h('#6f675c'),h('#7a6f60'),h('#665d52'),h('#837868')],rkFd:h('#3a342d'),rkLedge:h('#9c917f'),
 slab:h('#8c8170'),slab2:h('#857a69'),vous:h('#c2b59c'),vous2:h('#a99c84'),
 // inside the cave
 inD:h('#1c120c'),inW:h('#3a2416'),inW2:h('#4a2e1a'),inFl:h('#b07a3c'),inFl2:h('#9a6a34'),inLit:h('#ffc060'),inHot:h('#ffe6a0'),inPil:h('#6a5a48'),inPilL:h('#8a7860'),awR:h('#c8202a'),awC:h('#f4ead8')}})();
H_PCOL.push(['#14244e','#f4ead8'],['#d0202e','#f4ead8']);// (7, 8): the Bears' navy and red umbrellas
const DJ_UMB=[7,8];
const djSm=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
// ---- the outfield wall: a red line along the top, a cream pinstripe under it, navy pads; some pads carry a faint
// science pattern (a ring of six dots, like a molecule; three on a diagonal) ----
function djWall(q,s){if(q<.9)return DJ.red;if(q<1.35)return hMul(DJ.cream,.82);
 if(q>2.2&&q<6.2){const id=Math.floor(s/18),m=((s%18)+18)%18,P=(id&1)?HB.pad2:HB.pad1,k=((id%3)+3)%3;
  if(k===1){for(const[u,v]of[[6.5,3.2],[9,2.6],[11.5,3.2],[11.5,4.8],[9,5.4],[6.5,4.8]])if(Math.abs(m-u)<.5&&Math.abs(q-v)<.42)return hMul(P,1.7)}
  else if(k===2){for(const[u,v]of[[6,5],[9,4],[12,3]])if(Math.abs(m-u)<.5&&Math.abs(q-v)<.42)return hMul(P,1.7)}}
 return null}
// ---- the bowl's front: a silver cap, a red line, then a curtain wall a floor at a time between deep-blue piers; the
// ground floor is shopfronts (bakeries among them) under striped awnings, lit warm at night ----
function djFacade(k,T,sF){
 if(k<1)return HB.roofEdge;if(k<1.8)return DJ.red;if(k<2.6)return DJ.silver;
 const SEC=30,m=((sF%SEC)+SEC)%SEC,bay=Math.floor(sF/SEC),v=k-2.6,FL=4.6,fl=((v%FL)+FL)%FL,band=Math.floor(v/FL),ground=k>T-1.4-FL-.2;
 if(m<2.4)return m<.5?DJ.silver:m>1.9?DJ.stD:DJ.navy2;
 if(ground){if(fl<1.3){const st=((m%3)+3)%3<1.5;return (bay&1)?(st?DJ.awR:DJ.awC):(st?DJ.navy2:DJ.awC)}
  if(((m-2.4)%6.9)<.5)return DJ.stD;H_EMIS=H_NIGHT;return H_NIGHT?((bay%3)===0?DJ.glNH:DJ.glN):DJ.gl2}
 if(fl<.8)return fl<.35?DJ.silver2:DJ.navy;
 if((((m-2.4)%3.45)+3.45)%3.45<.45)return DJ.st;
 H_EMIS=H_NIGHT;if(H_NIGHT){const dim=(vHash(Math.floor(sF/3.45),band+bay*7)&7)===0;return dim?hMul(DJ.glN,.42):band&1?DJ.glN2:DJ.glN}
 return (sF*.07+fl*.22)%1<.14?DJ.glR:band&1?DJ.gl2:DJ.gl}
// ---- the roofs: separate sections of light grey metal with a band of glass through the middle, steel ribs across, a dark
// underside showing at the inner edge and a red trim line; between the sections the seats show through under bare beams ----
function djRoof(k,Rd,phi,sF,gapSeat){
 const SEG=62,sm=((sF%SEG)+SEG)%SEG;
 if(sm<6.5){if(sm<.9||sm>5.6)return DJ.stL;if(((k%4.5)+4.5)%4.5<.8)return hMul(DJ.stL,.85);return hMul(gapSeat(),k<Rd*.5?.46:.32)}
 if(sm<7.6)return DJ.stD;
 if(k<.7)return HB.roofEdge;if(k<2)return DJ.stD;if(k<2.6)return DJ.red;
 if(k>Rd-1.1)return HB.gutter;
 const bm=((sm-7.6)%9.1+9.1)%9.1;if(bm<.8)return bm<.4?HB.rib:hMul(HB.rib,.8);
 const t=(k-2.6)/Math.max(1,Rd-3.7);
 if(t>.3&&t<.62){if(Math.abs(t-.3)<.03||Math.abs(t-.62)<.03)return DJ.stL;return ((Math.floor(sF/3)+Math.floor(k/3))&1)?hMul(DJ.glR,.9):hMul(DJ.glR,.78)}
 if(((sF%2.3)+2.3)%2.3<.32)return hMul(HB.roof2,.9);
 return t<.3?HB.roof:hMul(HB.roof2,.93)}
// ---- shared ground: paving, lawn, trees from above ----
function djPave(s,a,warm){const row=Math.floor(a/3),off=(row&1)*3,fu=(((s+off)%6)+6)%6;if((((a%3)+3)%3)<.28||fu<.28)return DJ.pvJ;
 const h=vHash(Math.floor((s+off)/6)+17,row);return warm?(h%4===0?DJ.pvW2:DJ.pvW):(h%4===0?DJ.pv2:DJ.pv)}
function djTree(wx,wy,dens){const cs=13,i0=Math.floor(wx/cs),j0=Math.floor(wy/cs);let best=-1e9,bh=0,bdx=0,bdy=0,br=1;
 for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const i=i0+di,j=j0+dj,h=vHash(i+211,j+97);if((h>>>20)%100>=dens)continue;const r=4.5+((h>>>8)&3),
   cx=(i+.5)*cs+(((h&15)-7.5)*.7),cy=(j+.5)*cs+((((h>>>4)&15)-7.5)*.7),dx=wx-cx,dy=wy-cy,d2=dx*dx+dy*dy;
  if(d2<r*r){const z=r-Math.sqrt(d2)*.55+((h>>>12)&3)*.4;if(z>best){best=z;bh=h;bdx=dx;bdy=dy;br=r}}}
 if(best>-1e9){const l=(bdx+bdy)/br,d=Math.hypot(bdx,bdy)/br;if(d>.86)return hMul(DJ.tr1,.86);return l<-.35?DJ.tr3:l>.45?DJ.tr1:DJ.tr2}
 return null}
function djTreeSh(wx,wy,dens){const cs=13,i=Math.floor((wx-4)/cs),j=Math.floor((wy-4)/cs),h=vHash(i+211,j+97);if((h>>>20)%100>=dens)return false;
 const r=4.5+((h>>>8)&3),cx=(i+.5)*cs+(((h&15)-7.5)*.7)+4,cy=(j+.5)*cs+((((h>>>4)&15)-7.5)*.7)+4;return (wx-cx)**2+(wy-cy)**2<r*r}
function djLawn(wx,wy,dens){
 {const n=Math.sin(wx*.0062+1)*Math.sin(wy*.0071)+.5*Math.sin(wx*.017-wy*.013);dens=dens*(n>.35?1.3:n>-.25?.62:.16)}// groves and open lawn, not one even scatter
 const t=djTree(wx,wy,dens);if(t)return t;const c=(Math.floor(wx/14)+Math.floor(wy/14))&1?DJ.lawn:DJ.lawn2;return djTreeSh(wx,wy,dens)?hMul(c,.72):c}
// ---- the Bear Cave ----
// DJ_C: the cliff's front edge (ft past the wall), its height, and the mouth (half-width, jamb height, the arch's rise)
const DJ_C={F:8,H:58,AW:24,AJ:9,AR:15,X:84,A:124};
function djCaveW(a){if(a<5||a>108)return 0;return 64*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(a-54)/56,2.6)))+3*Math.sin(a*.33)+2*Math.sin(a*.9+1)}
// the rock at a ground point: [height, boulder id, 1 in a crevice]
function djRock(x,a){
 const ax=Math.abs(x);
 if(a<DJ_C.F){if(ax<40)return[0,0,0]}
 else if(ax<34&&a<26)return[DJ_C.H,-1,0];// the cliff: one sheer face across the middle, the mouth cut into it
 const cs=9,ci=Math.floor(x/cs),cj=Math.floor(a/cs);let d1=1e9,d2=1e9,sx=0,sa=0,sh=0;
 for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const i=ci+di,j=cj+dj,h=vHash(i*5+801,j*3+433),px=(i+.5)*cs+(((h&15)-7.5)*.42),pa=(j+.5)*cs+((((h>>>4)&15)-7.5)*.42),d=Math.hypot(x-px,a-pa);
  if(d<d1){d2=d1;d1=d;sx=px;sa=pa;sh=h}else if(d<d2)d2=d}
 const ms=djCaveW(sa)-Math.abs(sx);let hh;
 if(ms<=0)hh=(ms>-16&&(sh>>>9)%7===0&&sa>4)?1.5+((sh>>>13)&3):0;// loose rocks round the foot of it
 else{const edge=djSm(0,15,ms);hh=DJ_C.H*edge*(1-.5*djSm(26,62,Math.abs(sx)))*(1-.55*djSm(58,106,sa))+(((sh>>>9)%7)-3)*1.7;
  if(Math.abs(sx)<38&&sa<72)hh=Math.max(hh,DJ_C.H-7+((sh>>>9)%7));hh=Math.max(3,hh)}
 if(hh>0&&a<DJ_C.F+1&&ax<42)hh=0;
 const cr=hh>0&&d2-d1<.85;return[cr?Math.max(0,hh-6):hh,sh,cr?1:0]}
let DJ_HF=null;
function djHF(){if(DJ_HF)return DJ_HF;const ST2=.5,NX=Math.ceil(DJ_C.X*2/ST2),NA=Math.ceil(DJ_C.A/ST2),Hh=new Float32Array(NX*NA),ID=new Int32Array(NX*NA),CR=new Uint8Array(NX*NA);
 for(let j=0;j<NA;j++)for(let i=0;i<NX;i++){const r=djRock(-DJ_C.X+(i+.5)*ST2,(j+.5)*ST2);Hh[j*NX+i]=r[0];ID[j*NX+i]=r[1];CR[j*NX+i]=r[2]}
 return DJ_HF={ST:ST2,NX,NA,H:Hh,ID,CR}}
function djHat(x,a){const F=djHF(),i=Math.floor((x+DJ_C.X)/F.ST),j=Math.floor(a/F.ST);if(i<0||j<0||i>=F.NX||j>=F.NA)return 0;return F.H[j*F.NX+i]}
const djArch=x=>Math.abs(x)<DJ_C.AW?DJ_C.AJ+DJ_C.AR*Math.sqrt(1-(x/DJ_C.AW)*(x/DJ_C.AW)):-1;
// through the mouth: a lit concourse. x across, g up from the floor
function djInside(x,g,wx,wy){const ax=Math.abs(x),top=djArch(x);
 if(g>top-1.6){const sh=clamp((top-g)/1.6,0,1);return hMul(DJ.inD,.6+sh*.5)}// the roof's shadow just inside the arch
 if(g<5.2){// the floor running back: warm paving, the crowd, a rail of stone posts along the front
  if(g<.9)return ((Math.floor(x/2.2))&1)?DJ.inPil:DJ.inPilL;
  const p=vPerson(wx,wy,38);if(p){H_EMIS=H_NIGHT;return hMul(p,.92)}
  H_EMIS=H_NIGHT;const j=((x+g*.8)%4+4)%4<.3||((g%1.8)+1.8)%1.8<.22;return j?DJ.inFl2:(g>3.6?hMul(DJ.inFl,.86):DJ.inFl)}
 if(Math.abs(ax-6.6)<1.1){return ax<6.6?DJ.inPilL:DJ.inPil}// two stone pillars holding the roof
 if(ax<5.5){// the passage running on into the rock: darker, a string of lamps, light at the far end
  if(ax<3.2&&g<11){H_EMIS=H_NIGHT;return g<10.2&&ax<2.6?DJ.inLit:DJ.inW2}
  if(g>12.4&&g<13.2&&((Math.floor((x+6)*1.3))&1)){H_EMIS=true;return DJ.inHot}
  return g>11?DJ.inD:DJ.inW}
 if(ax>7.8&&ax<19.5){// a stall each side: sign, striped awning, a lit counter
  if(g<10.2){H_EMIS=H_NIGHT;if(g>9.5)return DJ.inHot;if(((ax-7.8)%3.9)<.4)return DJ.inW;return g<6.4?hMul(DJ.inLit,.8):DJ.inLit}
  if(g<11.8)return (Math.floor((ax-7.8)/1.3)&1)?DJ.awR:DJ.awC;
  if(g<14.2&&ax>9.4&&ax<17.9){if(g>12.3&&g<13.7&&((Math.floor(ax*1.4))%3)!==0){H_EMIS=H_NIGHT;return x<0?DJ.awR:DJ.navy}return DJ.cream}}
 if(g>15.5&&g<16.3&&((Math.floor((x+30)*.9))&1)){H_EMIS=true;return DJ.inHot}// lamps strung across under the roof
 const n=vHash(Math.floor(x/2.6)+60,Math.floor(g/3.1)+9);return n%5===0?DJ.inW2:n%7===0?DJ.inD:DJ.inW}
// the cliff's face: strata, cracks, ledges; a smoother slab above the mouth for the relief; cut stones round the arch
function djCliff(x,g,wx,wy){const top=djArch(x);
 if(top>0&&g<top)return djInside(x,g,wx,wy);
 {const ax=Math.abs(x),e=ax<DJ_C.AW+1.9?(ax<DJ_C.AW?g-top:Math.hypot(ax-DJ_C.AW,Math.max(0,g-DJ_C.AJ))):9;
  if(e<1.9&&g<DJ_C.AJ+DJ_C.AR+1.9){const k=Math.floor(Math.atan2(g-DJ_C.AJ,x)*7+(g<DJ_C.AJ?g*.6:0));if(e<.3)return DJ.rkFd;return (k&1)?DJ.vous:DJ.vous2}}
 if(Math.abs(x)<22&&g>26&&g<56.5){const e=Math.min(22-Math.abs(x),g-26,56.5-g);if(e<.6)return DJ.rkFd;const n=vHash(Math.floor(x/4.5)+3,Math.floor(g/3.4));return n%4===0?DJ.slab2:DJ.slab}
 const sw=x+Math.sin(g*.31)*1.4,cu=Math.floor(sw/3.6),fu=((sw%3.6)+3.6)%3.6,gv=g+(cu&1)*2.3,cv=Math.floor(gv/5.2),fv=((gv%5.2)+5.2)%5.2,n=vHash(cu+90,cv+40);
 if(fu<.42)return fu<.2?DJ.rkCr:DJ.rkFd;
 if(fv<.45)return DJ.rkFd;if(fv>4.6)return (n&3)===0?DJ.hed2:DJ.rkLedge;// a ledge catching the light, a tuft growing on it
 const c=DJ.rkF[n%4];return hMul(c,.86+.2*clamp(g/DJ_C.H,0,1))}
// what the camera sees at a point of the cave's patch: null where it is open ground
function djCave(x,a,wx,wy){if(Math.abs(x)>=DJ_C.X-1||a>=DJ_C.A-1)return null;
 const F=djHF(),i=Math.floor((x+DJ_C.X)/F.ST),j1=Math.min(F.NA-1,Math.floor(a/F.ST));let j=Math.max(0,Math.floor((a-DJ_C.H-6)/F.ST));
 for(;j<=j1;j++){const hh=F.H[j*F.NX+i];if(hh<=0)continue;const a0=(j+.5)*F.ST;if(a0+hh<a)continue;
  const id=F.ID[j*F.NX+i],g=a-a0,face=g<hh-F.ST*.6;
  if(id===-1&&face)return djCliff(x,g,wx,wy);
  if(face){// a boulder's face toward the field: darker, strata across it, near black at its foot
   if(F.CR[j*F.NX+i])return DJ.rkCr;const c=DJ.rkF[(id>>>3)&3];if(g<.8)return DJ.rkCr;if(((g+(id&3))%3.4)<.4)return DJ.rkFd;return hMul(c,.8+.25*clamp(g/hh,0,1))}
  // its top
  if(F.CR[j*F.NX+i])return DJ.rkCr;
  const lip=j>0&&F.H[(j-1)*F.NX+i]<hh-1.5,n=vHash(Math.floor(wx/3)+5,Math.floor(wy/3)+11);
  if(id===-1||(Math.abs(x)<34&&a0<30)){// the top of the cliff: slabs with soil and scrub
   if(lip&&g>hh-1.6)return DJ.rkLip;return n%9===0?DJ.hed:n%5===0?DJ.rk[3]:DJ.rk[1]}
  let c=DJ.rk[(id>>>6)%6];if(lip&&g>hh-1.3)return DJ.rkLip;
  if((id>>>17)%6===0&&(n%3)!==0)c=(n&4)?DJ.hed2:DJ.hed;// moss and scrub over some of them
  else if(n%13===0)c=hMul(c,.9);
  {const xs=x-3.2,as=a0+3.2;if(djHat(xs,as)>hh+3||djHat(x-6,a0+6)>hh+7)c=hMul(c,.66)}// a taller neighbour's shadow, falling down and right
  return c}
 return null}
// the ground round the cave: the viewing terrace in front of the mouth, planting and stepping stones round the foot of the rock
function djCentre(a,x,s,wx,wy){
 if(a<2.4){if(a>1.5&&a<1.9)return DJ.st;return a<.5?DJ.concD:DJ.conc}
 const ax=Math.abs(x);
 if(ax<40&&a<DJ_C.F+1){if(a<3.3)return ((Math.floor(x/4))&1)?DJ.st:DJ.silver2;// the rail, then the terrace
  if(ax>37.4)return DJ.concD;const p=vPerson(wx,wy,42);if(p)return p;return djPave(x,a,true)}
 const c=djCave(x,a,wx,wy);if(c)return c;
 // open ground: bark mulch, shrubs and flowers, a stone path curling round each side
 {const pr=Math.abs(Math.hypot(ax-40,a+10)-52);if(ax>40&&a<44&&pr<2.2){if(pr>1.7)return DJ.pvJ;const p=vPerson(wx,wy,14);if(p)return p;return djPave(s,a,false)}}
 const sh=djHat(x-3.2,a+3.2)>3||djHat(x-6,a+6)>7,n=vHash(Math.floor(wx/3)+41,Math.floor(wy/3)+7),k=vHash(Math.floor(wx/8),Math.floor(wy/8)+19)%7;
 let c2=k<3?((n&1)?DJ.hed:DJ.hed2):k===3?(n%23===0?DJ.fl1:n%19===0?DJ.fl2:DJ.hed3):k===4?((n&1)?DJ.hed2:DJ.hed3):(n&3)?DJ.mulch:DJ.mulch2;return sh?hMul(c2,.66):c2}
// ---- the districts either side: buildings by angle [from, to, where the front stands (ft past the wall), where it ends, floors showing, roof] ----
const DJ_LB=[[-44.5,-33.2,34,90,3,'solar'],[-29.8,-21.2,62,104,4,'curve'],[-19.6,-11.4,70,104,3,'atrium']];
const DJ_RB=[[11.4,19.4,70,104,3,'frame'],[21.2,29.6,62,100,3,'terr'],[33.2,44.5,34,82,2,'geo']];
function djBld(a,e,wB,a0,F,aE,kind,bi,wx,wy,left){const fd=2.5*F,top=a0+fd;
 if(a<top){const v=a-a0,fl=((v%2.5)+2.5)%2.5,fi=Math.floor(v/2.5),cm=((e%6)+6)%6,ground=fi===0;
  if(a>top-.5)return DJ.silver;
  if(left){// Daedeok: concrete frames, glass between
   if(cm<.9)return cm<.45?DJ.conc:DJ.concD;if(fl<.6)return DJ.conc2}
  else{// Expo: thin steel on glass
   if(cm<.5)return DJ.stL;if(fl<.4)return DJ.st}
  H_EMIS=H_NIGHT;if(H_NIGHT)return ground?DJ.glNH:(vHash(Math.floor(e/6)+bi*11,fi)&7)===0?hMul(DJ.glN,.45):fi&1?DJ.glN2:DJ.glN;
  return fl>2.1?DJ.glR:(e*.1+fl*.3)%1<.13?DJ.glR:ground?DJ.gl2:DJ.gl}
 const k=a-top,Rd=aE-top;if(k<.9)return left?DJ.conc:DJ.silver;if(Rd-k<.7)return DJ.stD;if(e<.9||wB-e<.9)return left?DJ.conc2:DJ.silver2;
 if(kind==='solar'){// a flat lab roof: rows of solar panels, plant, a path between
  const pm=((k%7)+7)%7,pe=((e%9)+9)%9;if(pm>1.2&&pm<5.4&&pe>1&&pe<8.2){if(((pe-1)%2.4)<.25||Math.abs(pm-3.3)<.15)return DJ.stD;return (e*.13+k*.21)%1<.2?DJ.royal:DJ.navy2}
  return (Math.floor(e/5)+Math.floor(k/5))&1?DJ.conc:DJ.conc2}
 if(kind==='curve'){// a barrel roof: lit along its crown, falling away to both eaves, ribs across it
  const t=e/wB,sh=.72+.42*Math.sin(Math.min(1,Math.max(0,t*1.25))*Math.PI*.8);if(((k%6)+6)%6<.5)return hMul(DJ.silver2,sh*.82);if(Math.abs(t-.42)<.012)return DJ.cream;return hMul(DJ.silver,sh)}
 if(kind==='atrium'||kind==='frame'){// glass over a hall; the Expo one under an exposed space frame
  const g1=((e%4.5)+4.5)%4.5<.45||((k%4.5)+4.5)%4.5<.45;if(kind==='frame'){const dg=(((e+k)%9)+9)%9<.5||(((e-k)%9)+9)%9<.5;if(dg)return DJ.cream2;if(g1)return DJ.silver}else if(g1)return DJ.stL;
  if(H_NIGHT){const lit=vHash(Math.floor(e/4.5)+bi*31,Math.floor(k/4.5))%9;if(lit<2){H_EMIS=true;return lit?DJ.glN2:DJ.glN}return ((Math.floor(e/4.5)+Math.floor(k/4.5))&1)?DJ.gl:DJ.gl2}return (e*.2+k*.15)%1<.15?DJ.glR:((Math.floor(e/4.5)+Math.floor(k/4.5))&1)?DJ.gl:DJ.gl2}
 if(kind==='terr'){// spectator terraces stepping up: decking, glass rails, people
  const tm=((k%9)+9)%9;if(tm<1)return tm<.5?DJ.silver:hMul(DJ.glR,.9);if(e<1.9||wB-e<1.9)return hMul(DJ.glR,.9);const p=vPerson(wx,wy,26);if(p)return p;return ((e%1.6)+1.6)%1.6<.25?DJ.pvJ:(Math.floor(k/9)&1)?DJ.pvW:DJ.pvW2}
 // 'geo': a pale roof cut by a pyramid of glass and a round skylight
 {const px=e-wB*.3,pk=k-Rd*.5,d=Math.abs(px)+Math.abs(pk);if(d<8.5){if(d>7.7||Math.abs(px)<.3||Math.abs(pk)<.3)return DJ.silver;H_EMIS=H_NIGHT;if(H_NIGHT)return px+pk<0?DJ.glNH:DJ.glN;return px<0?(pk<0?DJ.glR:DJ.gl):(pk<0?DJ.gl:DJ.gl2)}
  const qx=e-wB*.72,qd=Math.hypot(qx,pk);if(qd<5.2){if(qd>4.5)return DJ.silver;H_EMIS=H_NIGHT;return H_NIGHT?DJ.glN:(qx+pk<-2?DJ.glR:DJ.gl)}
  if(((e%2)+2)%2<.28)return DJ.silver2;return k<Rd*.5?DJ.silver:hMul(DJ.silver,.94)}}
function djSide(a,s,wx,wy,th,r){const left=th<0,ath=Math.abs(th),LB=left?DJ_LB:DJ_RB;
 if(a<2.4){if(a>1.5&&a<1.9)return DJ.st;return a<.5?DJ.concD:DJ.conc}
 const board=ath>10.6&&ath<27.9;
 if(board){// under each board: a planted bed, the steel service deck its legs stand on, a catwalk behind, a hedge
  if(a<7){const n=vHash(Math.floor(wx/3)+3,Math.floor(wy/3)+29),k=vHash(Math.floor(wx/7)+5,Math.floor(wy/7))%5;return k===0?(n%3===0?DJ.fl2:n%3===1?DJ.fl1:DJ.hed3):k<3?((n&1)?DJ.hed:DJ.hed2):DJ.hed3}
  if(a<24){const e=Math.min(a-7,24-a,(ath-10.6)*RAD*r,(27.9-ath)*RAD*r);if(e<.7)return DJ.silver2;if(e<1.3)return DJ.stD;
   if(a>18.6&&a<19.2)return DJ.silver2;if(a>19.2){const p=vPerson(wx,wy,5);if(p)return p;return ((s%2.2)+2.2)%2.2<.3?DJ.stD:DJ.grate}
   return (((s%3)+3)%3<.3||((a%3)+3)%3<.3)?DJ.deck2:DJ.deck}
  if(a<30){const n=vHash(Math.floor(wx/3)+9,Math.floor(wy/3)+2);return a<24.8?hMul(DJ.hed,.7):(n&1)?DJ.hed:DJ.hed2}}
 else if(a<26){// behind the bullpens and at the gaps: a standing deck over the wall with tables, people, a glass rail
  if(a<3.3)return ((Math.floor(s/4))&1)?DJ.st:DJ.silver2;if(a>24.6)return a>25.3?DJ.stD:hMul(DJ.glR,.9);
  const p=vPerson(wx,wy,30);if(p)return p;return djPave(s,a,true)}
 else if(a<30){const n=vHash(Math.floor(wx/3)+9,Math.floor(wy/3)+2);return (n&1)?DJ.hed:DJ.hed2}
 let shade=1;
 for(let bi=0;bi<LB.length;bi++){const[t0,t1,a0,aE,F,kind]=LB[bi],e=(th-t0)*RAD*r,wB=(t1-t0)*RAD*r;
  if(e>=0&&e<wB&&a>=a0&&a<aE)return djBld(a,e,wB,a0,F,aE,kind,bi,wx,wy,left);
  const sw=1.1*F;
  if(e>=wB&&e<wB+sw&&a>=a0&&a<aE+.4){const v=a-a0,fl=((v%2.5)+2.5)%2.5;if(fl>.9&&fl<1.9&&((Math.floor(v/2.5))&1)===0){H_EMIS=H_NIGHT;return H_NIGHT?hMul(DJ.glN,.7):DJ.gl2}return left?DJ.concD:DJ.st}// the shaded side wall
  if(e>=wB+sw&&e<wB+sw+2.2*F&&a>=a0&&a<aE)shade=.62;
  if(e>=0&&e<wB&&a>=aE&&a<aE+1.5*F)shade=.62}
 // the plazas between: paving in bands, planters, people; a ring of lamps round each court
 {const pm=((s%34)+34)%34,am=((a%22)+22)%22;if(pm>14&&pm<20&&am>8&&am<14){const e=Math.min(pm-14,20-pm,am-8,14-am);if(e<.6)return hMul(DJ.concD,shade);const n=vHash(Math.floor(wx/3),Math.floor(wy/3)+77);return hMul(n%7===0?DJ.fl1:(n&1)?DJ.hed2:DJ.hed3,shade)}}
 const p=vPerson(wx,wy,12);if(p)return shade<1?hMul(p,shade):p;const c=djPave(s,a,!left);return shade<1?hMul(c,shade):c}
// ---- beyond the ring: Expo park, the Gapcheon and its far bank ----
const djRivY=x=>664+16*Math.sin(x*.0062+.4)+7*Math.sin(x*.017);
const DJ_BR={x:-152,w:13},DJ_TW={x:196,y:598},DJ_FN={x:118,y:604,r:26};
function djOutside(x,y,wx,wy){
 const phi=Math.atan2(x-H_CC.x,y-H_CC.y)/RAD,lim=78+6*Math.sin(x*.011)+4*Math.sin(y*.013);if(Math.abs(phi)>lim||y<70)return null;
 if(Math.abs(phi)>lim-2.4||y<92){const ed=Math.min(lim-Math.abs(phi),(y-70)/9);return ed<.25||ed>2.1?DJ.walk:(Math.abs(ed-1.2)<.08&&((Math.floor((x+y)/9))&1)?DJ.dash:DJ.road)}// the road round the district
 const d=mRingD(x,y);
 if(d<8){if(d<1.3)return DJ.st;const p=vPerson(wx,wy,10);if(p)return p;return djPave(x+y,d,false)}// the walk round the outside of the ring
 const ry=djRivY(x),dr=y-ry,RW=40;
 // the bridge's deck over the water and its approaches
 if(Math.abs(x-DJ_BR.x)<DJ_BR.w&&y>ry-RW-34&&y<ry+RW+40){const e=DJ_BR.w-Math.abs(x-DJ_BR.x);if(e<1.2)return DJ.cream;if(e<3.6){const p=vPerson(wx,wy,12);if(p)return p;return DJ.walk}
  return Math.abs(x-DJ_BR.x)<.5&&((Math.floor(y/7))&1)?DJ.dash:DJ.road}
 if(Math.abs(dr)<RW){// the river: bands of current, light on it, darker under each bank
  const e=RW-Math.abs(dr);if(e<1.6)return DJ.bank2;const w=Math.sin(x*.09+Math.sin(y*.07)*2.4)+Math.sin(y*.31+x*.013);
  if(Math.abs(x-DJ_BR.x-9)<DJ_BR.w+5&&Math.abs(x-DJ_BR.x)>=DJ_BR.w)return hMul(DJ.riv2,.72);// the bridge's shadow on the water
  return w>1.5?DJ.rivHi:w>1.05?DJ.rivSh:e<7?DJ.riv2:w<-1.2?DJ.riv2:DJ.riv}
 if(Math.abs(dr)<RW+9){const e=Math.abs(dr)-RW;if(e<2.2)return DJ.bank;if(e>7.6)return DJ.bank2;if(Math.abs(e-6.4)<.8&&((x%44)+44)%44<1.6){if(H_NIGHT){H_EMIS=true;return DJ.glNH}return DJ.st}/* lamps along the river walk */const p=vPerson(wx,wy,9);if(p)return p;return (Math.floor((x+dr)/4)&1)?DJ.path:DJ.path2}// a promenade on each bank
 if(dr>0){// the far bank: a boulevard, then campus lawns
  const by=dr-RW-9;if(by>34&&by<58){const e=Math.min(by-34,58-by);if(e<1)return DJ.walk;return Math.abs(by-46)<.5&&((Math.floor(x/9))&1)?DJ.dash:DJ.road}
  return djLawn(wx,wy,by<34?70:38)}
 // Expo park, between the ring and the river: lawns, paths, the fountain court by the tower, the path to the bridge
 {const fd=Math.hypot(x-DJ_FN.x,y-DJ_FN.y);if(fd<DJ_FN.r){if(fd>DJ_FN.r-1.2)return DJ.concD;if(fd<8){if(fd>7)return DJ.concD;const w=Math.sin(x*.9)+Math.sin(y*1.1);return fd<2?DJ.cream:w>1.2?DJ.rivHi:DJ.rivSh}
   if(Math.abs(fd-15)<1.1)return DJ.pvJ;const p=vPerson(wx,wy,16);if(p)return p;return djPave(x,y,true)}
  const td=Math.hypot(x-DJ_TW.x,y-DJ_TW.y);if(td<19){if(td>17.8)return DJ.concD;if(Math.abs(td-11)<.8)return DJ.royal;const p=vPerson(wx,wy,12);if(p)return p;return djPave(x,y,false)}}
 {const p1=Math.abs(y-(ry-RW-30)-7*Math.sin(x*.02)),p2=Math.abs(x-DJ_BR.x)<4.5&&y<ry,p3=Math.abs((x-40)*.92+(y-560)*.38)<3.6&&y<ry-RW,p4=Math.abs(x-DJ_TW.x+(y-560)*.25)<3.4&&y<DJ_TW.y;
  if(p1<3.4||p2||p3||p4){if(((x+y*.6)%52+52)%52<1.6&&((y%5)+5)%5<1.6){if(H_NIGHT){H_EMIS=true;return DJ.glNH}return DJ.st}const p=vPerson(wx,wy,9);if(p)return p;return ((Math.floor((x+y)/4))&1)?DJ.path:DJ.path2}}
 return djLawn(wx,wy,Math.abs(x)>330?34:d<40?62:46)}
// ---- the whole of it ----
function breadCol(x,y,wx,wy,r,th,ath,q,s,n,fair){
 if(!fair||q<0){if(fair)return null;
  if(!bInOL(x,y))return djOutside(x,y,wx,wy);
  if(y>0){const a2=r-fenceDist(Math.sign(th)*45)-H_WALLW;if(a2>64)return djLawn(wx,wy,60);const p=vPerson(wx,wy,7);if(p)return p;return djPave(r*th*RAD,r,th>0)}return DJ.pv}
 const a=q-hPenOff(th)-H_WALLW;if(a<0)return null;
 if(!bInOL(x,y))return djOutside(x,y,wx,wy);
 if(a>B_LIM()-6&&!(ath<9.6&&djCave(x,a,wx,wy))){if(a>B_LIM()-1.5)return DJ.st;const p=vPerson(wx,wy,8);if(p)return p;return djPave(s,a,false)}// a walk inside the ring's edge
 if(ath<10.6)return djCentre(a,x,s,wx,wy);
 return djSide(a,s,wx,wy,th,r)}
// ---- shapes past the wall ----
function djClear(p,rad){return mClear(p,rad)}
// the Bears' head as a stone relief: the club's emblem recut in four tones of the cliff's own rock
function djRelief(g){const L=PIXEL_LOGOS.daejeon;if(!L)return;const rows=L.px.split('/'),N=rows.length,C=2,p=oXY(0,DJ_C.F+41),x0=Math.round(p.x)-N*C/2,y0=Math.round(p.y)-N*C/2;
 const tone={0:'#4a4238',1:'#a39783',2:'#d6ccb6',3:'#efe6d0',4:'#2a251f',5:'#3a342c'};
 // the cut edge's shadow first, down and right of every stone pixel
 g.fillStyle='rgba(20,16,12,.55)';for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(rows[j][i]==='.')continue;g.fillRect(x0+i*C+1,y0+j*C+1,C,C)}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const ch=rows[j][i];if(ch==='.')continue;g.fillStyle=tone[ch]||'#a39783';g.fillRect(x0+i*C,y0+j*C,C,C)}}
const DJ_WALLART=[[-39.5,'atom'],[-26,'skyline'],[-4.4,'bear'],[4.4,'bear'],[11.5,'tower'],[26,'bread'],[39.8,'wheat']];
function djWallArt(g,th,kind){const p=hW(th,fenceDist(th)-4.6);g.save();g.translate(Math.round(p.x),Math.round(p.y));g.rotate(th*RAD);const c='#f4ead8',R=(x,y,w,h,cc)=>{g.fillStyle=cc||c;g.fillRect(x,y,w,h)};
 g.strokeStyle=c;g.lineWidth=1;
 if(kind==='atom'){for(const a of[0,1.05,2.1]){g.beginPath();g.ellipse(0,0,7,2.6,a,0,7);g.stroke()}R(-1,-1,2,2,'#ff9a8a')}
 else if(kind==='skyline'){let x=-13;for(const hh of[4,7,5,9,6,3,8,5]){R(x,3-hh,3,hh);x+=3.4}R(-14,3,28,1)}
 else if(kind==='bear'){R(-5,-3,10,7);R(-6,-5,3,3);R(3,-5,3,3);R(-2,0,4,3,'#14244e');R(-3,-2,1,1,'#14244e');R(2,-2,1,1,'#14244e')}
 else if(kind==='tower'){R(-.5,-7,1,11);R(-3,-3,6,1.5);R(-2,-1.5,4,1);R(-2.5,3,5,1);g.beginPath();g.moveTo(-3,4);g.lineTo(0,-1);g.lineTo(3,4);g.stroke()}
 else if(kind==='bread'){g.beginPath();g.arc(0,2,7,Math.PI,0);g.closePath();g.stroke();for(const x of[-3,0,3]){g.beginPath();g.moveTo(x-1,-1.5);g.lineTo(x+1,.8);g.stroke()}}
 else if(kind==='wheat'){R(-.5,-6,1,11);for(let k=0;k<4;k++){R(-3,-5+k*2.4,2.4,1.2);R(.6,-4+k*2.4,2.4,1.2)}}
 g.restore()}
function djDecor(g){
 for(const[th,k]of DJ_WALLART)djWallArt(g,th,k);
 djRelief(g);
 // trees: on the cave's flanks and behind it, along the hedges behind the boards, in the plazas
 for(const[x,a,r]of[[-58,20,8],[-66,44,9],[60,22,8],[68,46,9],[-48,96,8],[50,98,8],[-20,108,7],[22,109,7],[0,112,7]]){const th=x/(fenceDist(0)+H_WALLW+a)/RAD,p=oXY(th,a);hGreenTree(g,p.x,p.y,r,false)}
 for(const sd of[-1,1])for(let th=11.6;th<27.4;th+=2.25){const p=oXY(sd*th,27);hGreenTree(g,p.x,p.y,5.5,false)}
 for(const sd of[-1,1])for(const[th,a]of[[31.6,60],[31.4,84],[20.4,54],[12,50],[26.6,40],[38,30.5],[42,30.5],[34,30.5]]){const p=oXY(sd*th,a);if(!djClear(p,12))continue;(Math.round(th*a)%3===0?hBlossom:hGreenTree)(g,p.x,p.y,7,false)}
 // umbrellas on the standing decks behind the bullpens
 for(const sd of[-1,1])for(let th=29.6,n=0;th<44;th+=2.5,n++)for(const a of[9,18]){const p=oXY(sd*(th+(a>10?1.2:0)),a);hParasol(g,p.x,p.y,DJ_UMB[(n+(a>10?1:0))&1],.5)}
 // the atom court in the Daedeok plaza: three orbits in pale stone round a red nucleus
 {const p=oXY(-31.4,45);g.save();g.translate(p.x,p.y);g.strokeStyle='#e8e4da';g.lineWidth=2;for(const a of[0,1.05,2.1]){g.beginPath();g.ellipse(0,0,24,9,a,0,7);g.stroke()}g.fillStyle='#d0202e';g.beginPath();g.arc(0,0,4,0,7);g.fill();g.fillStyle='#f4ead8';g.fillRect(-1,-2,2,2);g.restore()}
 // the Expo court's piece: a small steel pyramid and a ring
 {const p=oXY(31.4,45);g.save();g.translate(p.x,p.y);g.strokeStyle='#e8e4da';g.lineWidth=2;g.beginPath();g.arc(0,0,20,0,7);g.stroke();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(-8,10);g.lineTo(14,14);g.lineTo(10,-2);g.closePath();g.fill();
  g.fillStyle='#c9d0d8';g.beginPath();g.moveTo(-10,8);g.lineTo(0,-12);g.lineTo(0,8);g.closePath();g.fill();g.fillStyle='#8a94a2';g.beginPath();g.moveTo(10,8);g.lineTo(0,-12);g.lineTo(0,8);g.closePath();g.fill();g.fillStyle='#eef1f5';g.fillRect(-1,-12,2,2);g.restore()}
 // names on the labs' and pavilions' roofs, and over the cave's terrace
 const sign=(th,a,txt,w,bg,fg,f)=>{const p=oXY(th,a);g.save();g.translate(p.x,p.y);g.rotate(th*RAD);g.fillStyle=bg;g.fillRect(-w/2,-6,w,12);g.fillStyle='#d0202e';g.fillRect(-w/2,-6,w,1);g.fillStyle=fg;g.font=f||'bold 8px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,.5,w-6);g.restore()};
 sign(-38.8,46,'DAEDEOK INNOPOLIS',92,'#14244e','#f4ead8');sign(38.8,43.5,"EXPO '93",58,'#14244e','#f4ead8');sign(-25.4,74,'SCIENCE HALL',70,'#2a3040','#9fc4ff');sign(25.4,71,'EXPO TERRACE',70,'#2a3040','#ffd9a0')}
// ---- the board (K units): two of them, each turned to face the plate, standing on steel behind the wall ----
// the left one is the club's screen (the emblem, DAEJEON BEARS, Hanbit Tower over the science city's skyline); the right one
// is the game's: the batter's card (portrait, number, name, ratings) over the line score, and every message the board shows
const DJ_BTH=19.2,DJ_BSC=1.12;
function djBoardAt(sd){const th=sd*DJ_BTH,r=fenceDist(th)+H_WALLW+13;return{x:(HX+Math.sin(th*RAD)*r/FT)/K,y:(HY-Math.cos(th*RAD)*r/FT)/K,th}}
function djBoardFrame(g,now,sd,night){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,yb=y0+h+26;
 // everything below is in the board's own frame: its foot on the service deck at yb, the screen above
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(x0-4,yb+2);g.lineTo(x0+w+6,yb+2);g.lineTo(x0+w+30,yb+15);g.lineTo(x0+22,yb+15);g.closePath();g.fill();
 // the rear housing: a deep steel box behind the screen, seen over its top: ribs, vents, a catwalk with a rail, beacons
 g.drawImage(jCache('djHouse'+sd+(night?1:0),x0-12,y0-36,w+24,30,gg=>{const P=(x,y,ww,hh,c)=>{gg.fillStyle=c;gg.fillRect(x,y,ww,hh)};
  P(x0-10,y0-34,w+20,26,night?'#141a2c':'#243052');P(x0-10,y0-34,w+20,2,night?'#3a4668':'#56669a');P(x0-10,y0-10,w+20,2,'#0a0f1e');
  for(let x=x0-6;x<x0+w+8;x+=12)P(x,y0-31,1,20,night?'#0c1120':'#1a2440');
  for(let x=x0+6;x<x0+w-10;x+=38){P(x,y0-28,16,8,night?'#0a0e1a':'#141c34');for(let k=0;k<4;k++)P(x+1,y0-27+k*2,14,1,night?'#1c2438':'#33406a')}
  P(x0-12,y0-19,w+24,1.5,'#8b96a0');for(let x=x0-12;x<x0+w+12;x+=7)P(x,y0-19,1,4,'#59636d');P(x0-12,y0-15,w+24,2,night?'#20283c':'#3a4666');
  P(x0-10,y0-36,w+20,2,'#d0202e')}),x0-12,y0-36,w+24,30);
 for(let k=0;k<7;k++){const bx=x0+k*(w/6)-1,on=night||Math.floor(now/700+k)%2===0;g.fillStyle=on?'#ff5a4a':'#7a2a2a';g.fillRect(bx,y0-39,2,3)}
 // the legs: four lattice columns and the bracing between them, down to footings on the deck
 const yt=y0+h+7,legs=[x0+14,x0+70,x0+w-70,x0+w-14];
 g.strokeStyle=night?'#4a5878':'#6b789a';g.lineWidth=1.3;g.beginPath();const b1=yt+5,b2=yb-4;g.moveTo(legs[0],b1);g.lineTo(legs[3],b1);g.moveTo(legs[0],b2);g.lineTo(legs[3],b2);
 for(let x=legs[0],k=0;x<legs[3]-1;x+=11,k++){g.moveTo(x,k&1?b1:b2);g.lineTo(Math.min(legs[3],x+11),k&1?b2:b1)}g.stroke();
 for(const lx of legs){g.fillStyle=night?'#6a7898':'#9aa6c4';g.fillRect(lx-3,yt,3,yb-yt);g.fillStyle=night?'#2e3a56':'#4a5878';g.fillRect(lx,yt,3,yb-yt);g.fillStyle='#3a4258';g.fillRect(lx-6,yb-2,12,4);g.fillStyle='#7c88a4';g.fillRect(lx-6,yb-2,12,1)}}
function djBoardTrim(g,night){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66;
 g.strokeStyle='#d0202e';g.lineWidth=2;g.strokeRect(x0-3,y0-3,w+6,h+6);g.strokeStyle=night?'#2a3a6a':'#1c2a4e';g.lineWidth=3;g.strokeRect(x0-7.5,y0-7.5,w+15,h+15);
 g.fillStyle='#f4ead8';for(const[x,y]of[[x0-9,y0-9],[x0+w+7,y0-9],[x0-9,y0+h+7],[x0+w+7,y0+h+7]])g.fillRect(x,y,2,2)}
const djScan=(g,x0,y0,w,h)=>{g.fillStyle='rgba(0,0,0,.28)';for(let yy=y0;yy<y0+h;yy+=2)g.fillRect(x0,yy,w,1)};
// the club's screen
function djScreenClub(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66;
 g.drawImage(jCache('djClub'+cx,x0,y0,w,h,gg=>{const P=(x,y,ww,hh,c)=>{gg.fillStyle=c;gg.fillRect(x,y,ww,hh)};
  P(x0,y0,w,h,'#101c44');for(let k=0;k<h;k+=6)P(x0,y0+k,w,3,'#12204c');
  // the skyline along the bottom, Hanbit Tower standing over it
  let x=x0+118;const hs=[9,14,8,17,11,6,13,9,16,7,12,8,10];for(let i=0;x<x0+w-2;i++){const bw=6+(i*5)%4,bh=hs[i%hs.length];P(x,y0+h-bh,bw,bh,'#2a4290');P(x,y0+h-bh,bw,1,'#5a7ad0');for(let yy=y0+h-bh+3;yy<y0+h-1;yy+=3)for(let xx=x+1;xx<x+bw-1;xx+=2)if(((xx+yy)*7+i)%5===0)P(xx,yy,1,1,'#ffd98a');x+=bw+1}
  {const tx=x0+w-26,ty=y0+6;P(tx,ty,1,h-10,'#f4ead8');P(tx-4,ty+10,9,2,'#f4ead8');P(tx-3,ty+12,7,1,'#c9d0d8');P(tx-2,ty+7,5,3,'#d0202e');P(tx-5,ty+h-22,11,1,'#c9d0d8');
   for(let k=0;k<12;k++){P(tx-1-Math.round(k*.42),ty+h-22+k,1,1,'#f4ead8');P(tx+1+Math.round(k*.42),ty+h-22+k,1,1,'#f4ead8')}P(tx,ty-3,1,3,'#ff5a4a')}
  // an orbit sweeping behind the lettering
  gg.strokeStyle='rgba(120,160,255,.35)';gg.lineWidth=1;gg.beginPath();gg.ellipse(x0+112,y0+26,62,15,-.18,0,7);gg.stroke();
  P(x0,y0,w,2,'#d0202e');P(x0,y0+h-2,w,2,'#d0202e');P(x0,y0+2,w,1,'#f4ead8')}),x0,y0,w,h);
 if(LOGO.daejeon){g.imageSmoothingEnabled=false;g.drawImage(LOGO.daejeon,x0+6,y0+7,52,52)}
 g.textAlign='left';g.textBaseline='middle';g.fillStyle='#f4ead8';g.font='bold 17px "Pixelify Sans", monospace';g.fillText('DAEJEON',x0+64,y0+19,90);g.fillStyle='#ff5a4a';g.fillText('BEARS',x0+64,y0+37,90);
 g.fillStyle='#9fc4ff';g.font='9px Jua, sans-serif';g.fillText('대전 베어스',x0+64,y0+53,60);
 {const t=(now/2600)%1,ax=x0+112+Math.cos(t*6.283)*62*Math.cos(-.18)-Math.sin(t*6.283)*15*Math.sin(-.18),ay=y0+26+Math.cos(t*6.283)*62*Math.sin(-.18)+Math.sin(t*6.283)*15*Math.cos(-.18);
  if(ax>x0+2&&ax<x0+w-2){g.fillStyle='#ffe9a8';g.fillRect(Math.round(ax)-1,Math.round(ay)-1,2,2)}}
 djScan(g,x0,y0,w,h)}
// the batter's card on the game's board (when it isn't carrying a message)
function djScreenGame(g,now){const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66,started=S.phase!=='title';
 g.fillStyle='#0c1634';g.fillRect(x0,y0,w,h);g.fillStyle='#101c44';g.fillRect(x0,y0,w,h-17);g.fillStyle='#d0202e';g.fillRect(x0,y0+h-17,w,1);
 const b=started&&S.mode!=='bp'&&typeof curBatter==='function'?curBatter():null,bk=b?batKey():S.you,T=TEAMS[bk]||TEAMS[S.you];
 // the portrait: a batter from the shoulders up in his club's colours
 {const px=x0+5,py=y0+4,P=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(px+x,py+y,ww,hh)};P(0,0,38,42,'#182b5c');P(0,0,38,1,'#3b5cae');
  P(6,27,26,15,T.jersey||'#f4ead8');P(6,27,26,1,'rgba(255,255,255,.3)');P(17,27,4,15,'rgba(0,0,0,.14)');P(14,22,10,6,'#d9a67c');P(11,9,16,15,'#e2b48c');P(11,9,16,5,T.cap||'#14244e');P(9,13,20,2,T.cap||'#14244e');P(22,13,9,2,'rgba(0,0,0,.25)');
  P(14,17,2,2,'#2a1d14');P(22,17,2,2,'#2a1d14');P(16,21,6,1,'#a8744e');if(LOGO[bk]){g.imageSmoothingEnabled=false;g.drawImage(LOGO[bk],px+24,py+29,11,11)}}
 g.textBaseline='middle';g.textAlign='left';
 if(b){g.fillStyle='#ff5a4a';g.font='bold 15px "Pixelify Sans", monospace';g.fillText('#'+b.no,x0+48,y0+11,40);
  g.fillStyle='#f4ead8';g.font='bold 14px "Pixelify Sans", monospace';g.fillText(b.name,x0+48,y0+26,84);
  g.fillStyle='#9fc4ff';g.font='11px "Pixelify Sans", monospace';g.fillText(`${b.pos||''} · BATS ${b.hand||'R'}`,x0+48,y0+40,84);
  // his ratings, as the board's stat column
  [['CON',b.con],['POW',b.pow],['SPD',b.spd]].forEach(([k,v],i)=>{const yy=y0+9+i*13;g.fillStyle='#9fc4ff';g.font='10px "Pixelify Sans", monospace';g.textAlign='left';g.fillText(k,x0+138,yy);g.fillStyle='#f4ead8';g.font='bold 12px "Pixelify Sans", monospace';g.textAlign='right';g.fillText(String(v),x0+w-6,yy)})}
 else{g.fillStyle='#f4ead8';g.font='bold 15px "Pixelify Sans", monospace';g.fillText('BREAD BOWL PARK',x0+48,y0+14,136);g.fillStyle='#ff5a4a';g.font='bold 12px "Pixelify Sans", monospace';g.fillText('HOME OF THE BEARS',x0+48,y0+29,136);
  g.fillStyle='#9fc4ff';g.font='11px "Pixelify Sans", monospace';g.fillText(S.night?'TONIGHT AT THE PARK':'TODAY AT THE PARK',x0+48,y0+42,136)}
 // the line score along the bottom
 {const yy=y0+h-8;g.textAlign='left';g.font='bold 11px "Pixelify Sans", monospace';g.fillStyle='#f4ead8';g.fillText(`${ABBR[S.opp]||'AWY'} ${started?S.target:'-'}`,x0+6,yy);g.fillText(`${ABBR[S.you]||'HOM'} ${started?S.runs:'-'}`,x0+52,yy);
  g.fillStyle='#ffbf3c';g.textAlign='right';g.fillText(started?`${S.half==='top'?'TOP':'BOT'} ${ord(S.inning).toUpperCase()} · ${Math.min(S.outs,2)} OUT · ${S.balls}-${S.strikes}`:'PLAY BALL',x0+w-6,yy,92)}
 djScan(g,x0,y0,w,h)}
function drawJumboBread(g,now){const cx=HX/K,y0=-18,h=66,night=!!S.night,msg=S.jumbo&&now<S.jumbo.until;
 for(const sd of[-1,1]){const A=djBoardAt(sd);g.save();g.translate(A.x,A.y);g.rotate(A.th*RAD);g.scale(DJ_BSC,DJ_BSC);g.translate(-cx,-(y0+h+26));
  djBoardFrame(g,now,sd,night);drawJumbo0(g,now,true);
  if(sd<0)djScreenClub(g,now);else if(!msg)djScreenGame(g,now);
  djBoardTrim(g,night);g.restore()}}
// ---- night: the cave is the strongest light in the park; the terrace, the decks, the labs and pavilions, the boards' spill ----
let DJ_NL=null,DJ_NL_K='';
function drawBreadLights(c,vx0,vy0,scale,now){if(!ST||ST.bowl!=='bread'||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!DJ_NL||DJ_NL_K!==key){DJ_NL_K=key;const pts=[];for(let th=-45;th<=45;th+=1)pts.push(oXY(th,0));const x0=Math.min(...pts.map(p=>p.x))-320,y0=Math.min(...pts.map(p=>p.y))-340,x1=Math.max(...pts.map(p=>p.x))+320,y1=Math.max(...pts.map(p=>p.y))+80;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  // the mouth: light pouring out over the terrace, hot at the stalls; a warm wash up the relief
  {const m=oXY(0,DJ_C.F+6);glow(m.x,m.y+14,130,'255,180,90',.3);glow(m.x,m.y+22,56,'255,214,140',.3);for(const dx of[-36,36])glow(m.x+dx,m.y-10,26,'255,206,120',.22)}
  {const p=oXY(0,DJ_C.F+41);glow(p.x,p.y+6,70,'255,190,104',.3);for(const dx of[-50,50])glow(p.x+dx,p.y+40,14,'255,220,150',.45)}
  {const t=oXY(0,5);for(let dx=-96;dx<=96;dx+=24)glow(t.x+dx,t.y,20,'255,214,140',.34)}
  for(const[x,a]of[[-62,30],[64,32],[-52,70],[54,72],[-30,100],[32,102]]){const th=x/(fenceDist(0)+H_WALLW+a)/RAD,p=oXY(th,a);glow(p.x,p.y,26,'255,190,110',.22)}
  // the boards' cool spill on their decks, the standing decks, the plazas and the buildings' fronts
  for(const sd of[-1,1]){for(let th=12;th<27;th+=2.4){const p=oXY(sd*th,9);glow(p.x,p.y,30,'150,180,255',.2)}
   for(let th=29.5;th<44.5;th+=2.2){const p=oXY(sd*th,13);glow(p.x,p.y,22,'255,206,130',.3)}
   for(const[t0,t1,a0,aE,F]of(sd<0?DJ_LB:DJ_RB))for(let th=t0+1;th<t1;th+=1.9){const p=oXY(th,a0+F*1.2);glow(p.x,p.y,18+F*3,'255,184,96',.4)}
   for(const[th,a]of[[31.4,45],[31.4,70],[20.6,50],[12.4,56]]){const p=oXY(sd*th,a);glow(p.x,p.y,34,'255,214,150',.22)}}
  for(let th=-44;th<=44;th+=2){const p=oXY(th,1.2);glow(p.x,p.y,9,'255,70,60',.16)}// the red line along the wall's top
  DJ_NL={cv,x0,y0,x1,y1}}
 const L=DJ_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='lighter';c.drawImage(L.cv,L.x0,L.y0,L.x1-L.x0,L.y1-L.y0);c.restore()}
