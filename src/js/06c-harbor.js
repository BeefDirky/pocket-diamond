// ---------- Ulsan: a harbor park. The outfield opens onto the sea, a pier with a lighthouse runs out from right field,
// the shipyard fills the shore to the left, and the city wraps the rest of the bowl, with the main gate behind home ----------
// Like the Jeju country, the water and the outfield ring are one pure function of world position (harborCol), shared by
// the park buffer and the neighborhood layer so they meet without a seam.
const HC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 sea:h('#1d5f8f'),sea2:h('#174f78'),wave:h('#7fbfe3'),shal:h('#2a7fae'),foam:h('#d8eef8'),
 wallTop:h('#8a939b'),riser:h('#26323b'),aisle:h('#4d5761'),conc:h('#b8bec4'),conc2:h('#aeb4ba'),edge:h('#e2e6ea'),edgeD:h('#4a545e'),pole:h('#2b3038'),
 deck:h('#c9a77a'),deck2:h('#b8956a'),rail:h('#f1f1ee'),tetra:h('#9aa3ad'),tetra2:h('#7d8790'),tetraD:h('#5b646d'),
 yard:h('#9aa1a8'),yard2:h('#90979e'),yline:h('#e8d27a'),quay:h('#c9ced3')}})();
let H_SEAT=false,H_EMIS=false,H_SHADE=false,H_NIGHT=false;
const hRGB=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];
const HB=Object.fromEntries(Object.entries({rail:'#c9ced3',railD:'#59626c',conc:'#3a4048',concLit:'#ffcf7a',led1:'#5fd4ff',led2:'#e8f6ff',led3:'#2f6fd0',ledD:'#14325a',
 roof:'#dfe4e9',roof2:'#d2d8de',rib:'#b9c1c9',roofEdge:'#ffffff',gutter:'#8d96a0',par:'#4a525c',fTop:'#d9dde1',fTop2:'#cbd0d5',mull:'#55606c',glass:'#8fb7d3',glass2:'#7ea7c6',
 glassN:'#ffd486',glassN2:'#ffc062',fEdge:'#39414b',gate:'#232830',gateN:'#ffe0a0',plaza:'#c8c6c0',
 wallCap:'#d6dade',wallCap2:'#a9b0b7',wallY:'#ffd23f',pad1:'#14325a',pad2:'#2f6fd0',pad3:'#e8eef5',pad4:'#5aa0e6',seam:'#0b1d36',
 terr:'#d2d0c8',terr2:'#c6c3ba',seaWall:'#e2e6ea',seaWallD:'#8a939b',
 port:'#b6b9bb',port2:'#acafb2',joint:'#9fa3a6',asph:'#55595e',asph2:'#4c5055',dash:'#e8d27a',quay:'#dadcdc',bollard:'#2b3038',rails:'#4a4f55',lane:'#e9ebec',
 jet:'#c4c9cd',tet:'#9aa3ad',tet2:'#7d8790',tetD:'#5b646d'}).map(([k,v])=>[k,hRGB(v)]));
const hMul=(c,f)=>[c[0]*f|0,c[1]*f|0,c[2]*f|0];
// ---- the bowl: one smooth footprint, set by how deep the stands run (feet past the field) at each angle around the park ----
// The depth comes from a smoothed distance to the playing field, so the rows run straight along the foul lines and turn in
// round arcs behind home and in the corners; the depth changes gently with the angle: a deep front behind home, a big
// left-field grandstand curling to left-centre, a shorter right side that ends at the right-field corner, the outfield open.
const H_CC={x:0,y:180};// the bowl's centre, for its angle (feet)
const H_DK={R:[[68,0],[92,52],[118,112],[148,150],[180,168]],L:[[34,0],[52,64],[78,122],[112,148],[180,168]]};
function hD(phi){const a=Math.abs(phi),K=phi>=0?H_DK.R:H_DK.L;if(a<=K[0][0])return 0;
 for(let i=0;i<K.length-1;i++)if(a<=K[i+1][0]){const u=(a-K[i][0])/(K[i+1][0]-K[i][0]),t=(1-Math.cos(u*Math.PI))/2;return K[i][1]+(K[i+1][1]-K[i][1])*t}return K[K.length-1][1]}
const hPhi=(x,y)=>Math.atan2(x,y-H_CC.y)/RAD;
function hFieldD(x,y){const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
 const dS=(y>0&&Math.abs(th)<=45)?Math.max(0,r-fenceDist(th)):1e4;
 const st=sd=>{const al=(sd*x+y)/Math.SQRT2,pe=(sd*x-y)/Math.SQRT2;return Math.hypot(Math.max(-5-al,0,al-328),Math.max(-pe,0,pe-40))};
 const dA=st(1),dB=st(-1),dC=Math.max(0,r-34),m=Math.min(dS,dA,dB,dC);if(m<=0)return 0;
 const k=30,sm=-k*Math.log(Math.exp(-dS/k)+Math.exp(-dA/k)+Math.exp(-dB/k)+Math.exp(-dC/k)),w=clamp((m-12)/55,0,1);return m-(m-Math.max(0,sm))*w}
// is the roof over this angle, and how far in it reaches as a share of the depth? left and right differ on purpose
function hRoofIn(phi){const L=phi<0,a=Math.abs(phi),lo=L?62:112,hi=166;if(a<lo||a>hi)return 9;const e=Math.min(a-lo,hi-a),t=clamp(e/9,0,1),sm=t*t*(3-2*t);return .70+(1-sm)*.32}
const H_GATES=[180,-146,146,-112,114];
// the cove: a compact round bay cut into the shore past right field, a breakwater sheltering its mouth
const H_COVE_C={x:250,y:430,r:122};
const H_JETTY=[[430,597],[362,642],[296,656]];
const hCoveR=(x,y)=>{const a=Math.atan2(x-H_COVE_C.x,y-H_COVE_C.y);return H_COVE_C.r+9*Math.sin(2*a+1)+5*Math.sin(3*a-.4)};// a bay, not a basin
function hInCove(x,y){return Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y)<hCoveR(x,y)}
function hEastLand(x,y){return x>118&&y<548+(x-290)*.35&&!hInCove(x,y)}
function hPort(x,y){return x<=-380&&y>336}
function hSea(x,y){if(hInCove(x,y))return true;if(x<=-380)return false;return y>360+14*Math.sin(x*.02)&&!hEastLand(x,y)}
function hJetD(x,y){if(x<270||y<560)return 1e9;let m=1e9;for(let k=0;k<H_JETTY.length-1;k++){const[ax,ay]=H_JETTY[k],[bx,by]=H_JETTY[k+1],vx=bx-ax,vy=by-ay,t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1),d=Math.hypot(x-ax-vx*t,y-ay-vy*t);if(d<m)m=d}return m}
// the bowl's outer edge as a radius from its centre at each degree: traced where the stands would end, then smoothed
// hard so the outside of the stadium runs in clean continuous curves (the rows inside still follow the field)
let H_RS=null,H_RS_K='';
function hRS(){const key=DIMS.join(',');if(H_RS&&H_RS_K===key)return H_RS;H_RS_K=key;const raw=new Float32Array(360),open=new Uint8Array(360);
 for(let i=0;i<360;i++){const phi=i-180,D=hD(phi),De=Math.max(D,26),dx=Math.sin(phi*RAD),dy=Math.cos(phi*RAD);let t0=0,t1=0;
  for(let t=10;t<1600;t+=10){if(hFieldD(H_CC.x+dx*t,H_CC.y+dy*t)>=De){t1=t;break}t0=t}
  for(let k=0;k<18;k++){const m=(t0+t1)/2;if(hFieldD(H_CC.x+dx*m,H_CC.y+dy*m)>=De)t1=m;else t0=m}raw[i]=t1;open[i]=D<10?1:0}
 // smooth only the closed part: a few passes of a wide circular average, the open ends pinned
 let R=Float32Array.from(raw);for(let p=0;p<6;p++){const o=new Float32Array(360);for(let i=0;i<360;i++){if(open[i]){o[i]=raw[i];continue}let s=0,w=0;for(let k=-10;k<=10;k++){const j=(i+k+360)%360;if(open[j])continue;const ww=11-Math.abs(k);s+=R[j]*ww;w+=ww}o[i]=s/w}R=o}
 // never pull the edge in past where the seats need to be
 for(let i=0;i<360;i++)if(!open[i])R[i]=Math.max(R[i],raw[i]-14);
 return H_RS={R,open}}
const hRout=phi=>{const T=hRS(),f=phi+180,i=Math.floor(f),u=f-i;return T.R[(i+360)%360]*(1-u)+T.R[(i+361)%360]*u};
// the outline of the bowl (world px), traced where the stands end; open across the outfield
function hOutline(){const T=hRS(),out=[];for(let i=0;i<360;i+=1){const phi=i-180,dx=Math.sin(phi*RAD),dy=Math.cos(phi*RAD),t=T.R[i];out.push({x:HX+(H_CC.x+dx*t)/FT,y:HY-(H_CC.y+dy*t)/FT,open:!!T.open[i]})}return out}
// seats by section: navy, royal and sky blue blocks, a cheering block on each side of the infield, white seats
// tracing a wave through some sections
const H_SEATS=[['#1f3f7a','#1b3870'],['#2f6fd0','#2a63bb'],['#5aa0e6','#5193d6']].map(p=>p.map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)])),
 H_SEATU=[[27,47,94],[24,42,84]],H_WHITE=[232,238,245],H_CHEER=[[255,210,63],[240,196,50]];
function hSeat(ang,row,upper){const sec=Math.floor((ang+400)/10),h=vHash(sec,77);
 if(upper)return H_SEATU[row&1];
 if((ang>14&&ang<34)||(ang<-14&&ang>-34)){if(ang>0)return H_SEATS[2][row&1]}// the home cheering block on the first-base side
 const p=H_SEATS[h%3];return p[row&1]}
// the boardwalk: warm planks, blue-and-white parasols over tables, a cafe kiosk every so often
const H_PARA=[[47,111,208],[244,246,250]];
function hBoard(wx,wy,s2,d,w){const n=vHash(Math.floor(wx/3),Math.floor(wy/3));
 const cs=((s2%72)+72)%72;if(cs<12&&d>w-10&&d<w-1){if(d<w-8||cs<1||cs>11)return [30,50,90];return Math.floor(cs/3)&1?[47,111,208]:[244,246,250]}// cafe roof, awning striped
 const ps=((s2%18)+18)%18-9,pd=d-w*.45,pr=ps*ps+pd*pd;if(cs>=14&&pr<16){if(pr<1.2)return [40,44,50];return H_PARA[((ps>0)^(pd>0))?1:0]}
 if(cs>=14&&pr<22)return [120,90,60];// the parasol's shadow ring
 const p=vPerson(wx,wy,7);if(p)return p;
 return Math.floor(d/2.2)&1?HC.deck:HC.deck2}// set by harborCol when the pixel is a seat (so the crowd can fill it)

// the outfield wall: a yellow home-run line, padded panels in club colours with seams, a concrete cap
function hWall(q,s,n){if(q<1)return HB.wallY;if(q<5.4){const m=((s%16)+16)%16,id=Math.floor(s/16);if(m<.8)return HB.seam;
  const P=[HB.pad1,HB.pad2,HB.pad1,HB.pad3,HB.pad1,HB.pad4][((id%6)+6)%6];if(q>2.6&&q<3.6&&m>3&&m<13&&(Math.floor(m*1.4)&1))return P===HB.pad3?HB.pad1:HB.pad3;// lettering
  return q<1.8?hMul(P,.8):P}
 return q<6.4?HB.wallCap:HB.wallCap2}
// the bowl's layers, outward from the field: rail, lower bowl, the concourse under the upper deck, the LED ribbon on the upper
// deck's fascia, the upper bowl, the roof, and the facade with its window bands
function hBowl(x,y,wx,wy,d,D,phi,lo){const ha=Math.atan2(x,y)/RAD,rh=Math.hypot(x,y)||1,n=vHash(Math.floor(wx/2),Math.floor(wy/2));
 const rC=Math.hypot(x,y-H_CC.y),sF=phi*RAD*rC;
 const T=D>100?12+10*clamp((D-100)/50,0,1):D>40?12:2.5,fac=D-T;
 if(d>=fac){const k=d-fac;
  if(D<=40)return k<1.4?HB.par:HB.fEdge;
  let gate=false;for(const gg of H_GATES){const dg=Math.abs(((phi-gg+540)%360)-180)*RAD*rC;if(dg<6){gate=true;break}}
  if(gate){if(k<1.5)return HB.par;H_EMIS=H_NIGHT;return H_NIGHT?(k>9?HB.gateN:hMul(HB.gateN,.75)):HB.gate}
  if(k<1.6)return HB.par;if(k<5.6){if(((sF%22)+22)%22<3&&k>2.4&&k<4.6)return HB.wallCap2;return (Math.floor(sF/6)&1)?HB.fTop:HB.fTop2}// facade top, with rooftop plant
  if(k<T-1.4){const m=((sF%4)+4)%4,fl=((k-5.6)%4.2+4.2)%4.2;if(m<.8||fl<.7)return HB.mull;const band=Math.floor((k-5.6)/4.2);H_EMIS=H_NIGHT;// window bands, one per floor
   return H_NIGHT?((vHash(Math.floor(sF/4),band)&7)===0?hMul(HB.glassN,.45):band&1?HB.glassN2:HB.glassN):(band&1?HB.glass2:HB.glass)}
  return HB.fEdge}
 if(d<lo){return d<lo-1.2?HB.rail:HB.railD}
 const L1=D>70?D*.44:fac,C1=L1+7,U0=C1+1.6,RI=Math.min(fac,D*hRoofIn(phi));
 const seat=(d0,upper)=>{const t=(d-d0)/2.4,row=Math.floor(t),fr=t-row,step=9,off=upper?4.5:0,m=(((ha+off)%step)+step)%step;
  if(Math.abs(m-step/2)*RAD*rh<.9)return upper?hMul(HB.rail,.75):HB.rail;// stairs
  if(fr>.76)return upper?[22,28,36]:[34,42,52];H_SEAT=true;return hSeat(ha,row,upper)};
 let c;
 if(d<L1){c=seat(lo,false);if(D>70&&d>L1-5)c=hMul(c,.74)}// the upper deck's overhang shades the back rows
 else if(d<C1){const p=vPerson(wx,wy,12);if(p)return hMul(p,.6);if(H_NIGHT&&((Math.floor(sF/9)+Math.floor(d))&7)===0){H_EMIS=true;return HB.concLit}return (n&3)?HB.conc:hMul(HB.conc,.85)}
 else if(d<U0){const m=((sF%6)+6)%6;H_EMIS=H_NIGHT;if(d<C1+.4||d>U0-.3)return HB.ledD;return m<2?HB.led1:m<4?HB.led2:HB.led3}
 else if(d<RI){c=seat(U0,true);if(RI<fac&&d>RI-9)c=hMul(c,.62)}// the roof's shadow on the top rows
 else{const k=d-RI;if(k<1.1)return HB.roofEdge;if(d>fac-1.4)return HB.gutter;const m=((sF%10)+10)%10;if(m<1)return HB.rib;return (Math.floor(sF/10)&1)?HB.roof:HB.roof2}
 return c}
// the colour of harbor ground at a world pixel, or null where the plain city carries on
function harborCol(wx,wy){H_SEAT=false;H_EMIS=false;H_SHADE=false;const x=(wx-HX)*FT,y=(HY-wy)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th);
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3)),fair=y>0&&ath<=45,q=fair?r-fenceDist(th):-1,s=r*th*RAD;
 if(fair&&q>=0){const pen=ath>=29&&ath<=41,q0=pen?18:0;if(q<q0)return HB.wallCap;if(q<q0+7)return hWall(q-q0,s,n)}
 const phi=hPhi(x,y),D=hD(phi),d=r<1500?hFieldD(x,y):1e4;
 if(d<=0&&PARK_C)return PARK_MOW(x,y,r)?PARK_C.g1:PARK_C.g2;// the last of the foul ground, past the park buffer's edge
 if(D>8){const Ro=hRout(phi),rc=Math.hypot(x-H_CC.x,y-H_CC.y);if(rc<Ro&&d>0){const De=d+(Ro-rc);return hBowl(x,y,wx,wy,d,De,phi,fair?7:3)}}
 // past the open outfield wall: a terrace behind centre, a boardwalk behind right field, then the sea wall
 if(fair&&q<26){if(th>8)return hBoard(wx,wy,s,q-7,17);const m=((s%26)+26)%26;
   if(q>21&&q<22.2&&m<1.2)return HB.par;if(q>18.6&&q<21.2&&m>=1.2&&m<4.6)return Math.floor(s/26)&1?HB.pad2:HB.pad3;// flags along the back rail
   const p=vPerson(wx,wy,8);if(p)return p;return (Math.floor(s/3)+Math.floor(q/3))&1?HB.terr:HB.terr2}
 if(fair&&q<27.6)return HB.seaWall;
 {const jd=hJetD(x,y);if(jd<10){if(jd<3.2)return (n&3)?HB.jet:hMul(HB.jet,.9);const t=vHash(Math.floor(wx/5),Math.floor(wy/5));return (t&3)===0?HB.tetD:(t&3)===1?HB.tet2:HB.tet}}
 if(hSea(x,y)){if(!hSea(x-3,y-3)||!hSea(x+3,y-3)||!hSea(x-3,y+3)||!hSea(x+3,y+3))return hInCove(x,y)?HB.seaWallD:HB.seaWall;return hSeaCol(x,y,wx,wy)}
 // the promenade hugging the cove, and the plaza behind it
 {const dc=Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y)-hCoveR(x,y);if(dc<18&&hEastLand(x,y)){const a=Math.atan2(x-H_COVE_C.x,y-H_COVE_C.y)*(H_COVE_C.r+9);return dc<1.4?HB.seaWall:hBoard(wx,wy,a,dc-1.4,16)}
  if(dc<44&&hEastLand(x,y)){const p=vPerson(wx,wy,5);if(p)return p;return (Math.floor(wx/7)+Math.floor(wy/7))&1?HB.terr:HB.terr2}}
 if(hPort(x,y)){// the port's paving: slabs, service roads, the quay with its bollards and crane rails
  if(x>-386)return ((Math.floor(y)%24)+24)%24<1.4?HB.bollard:HB.quay;
  if(Math.abs(x+398)<.6||Math.abs(x+389)<.6)return HB.rails;
  const road=(y>338&&y<350)||(x>-545&&x<-533)||(y>622&&y<634);if(road){const c=(y>338&&y<350)?y-344:(x>-545&&x<-533)?x+539:y-628;if(Math.abs(c)<.4&&((Math.floor(x+y)%10)+10)%10<5)return HB.dash;return (n&15)?HB.asph:HB.asph2}
  if(x>-524&&x<-424&&y>384&&y<612&&((((x+524)%13)+13)%13<.7))return HB.lane;
  if(((Math.floor(x)%24)+24)%24<.7||((Math.floor(y)%24)+24)%24<.7)return HB.joint;return (n&7)?HB.port:HB.port2}
 if(D>8){const x2=x-6,y2=y+6,p2=hPhi(x2,y2);if(hD(p2)>8&&Math.hypot(x2-H_CC.x,y2-H_CC.y)<hRout(p2))H_SHADE=true}// the bowl's shadow on the ground (sun from the upper left)
 return null}
const H_SEA=['#174f78','#1b5f8a','#1f6d98','#2a7fae'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]),
 H_COVE=['#2592a8','#2aa3b6','#36b3c2','#48c3cc'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]),
 H_HI=[143,208,234],H_HIC=[200,240,242];
const H_DITH=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// calm water: broad swells in four tones, and short glints of light along the wave crests; the cove inside the pier
// is shallower and turquoise, fading out through the mouth to the open sea
function hSeaCol(x,y,wx,wy){const X=Math.floor(wx),Y=Math.floor(wy),dith=H_DITH[(Y&3)*4+(X&3)]/16;
 let cove=0;{const dc=Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y);cove=clamp((H_COVE_C.r+20-dc)/60,0,1)}
 const sw=Math.sin(x*.045+Math.sin(y*.03)*1.6)+.6*Math.sin(y*.07-x*.02)+.35*Math.sin((x+y)*.11);// -2..2
 const lv=clamp(Math.floor((sw+2)/4*4+dith-.5),0,3);
 const v=y*.8+3.2*Math.sin(x*.06)+2*Math.sin(x*.021+y*.04),crest=((v%14)+14)%14<.7&&Math.sin(x*.13+y*.05)>.93&&Math.sin(x*.031-y*.017)>.2;
 const useC=cove>dith;if(crest)return useC?H_HIC:H_HI;return useC?H_COVE[lv]:H_SEA[lv]}

// ---- the canvas-drawn pieces on the neighborhood layer (half resolution): the port's buildings, cranes, stacks and the
// moored ship; boats; the lighthouse; the main gate plaza behind home ----
function drawHarbor(g,k,night,CW,CH,cx,cy,OL,e){const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)});
 const rect=(x0,y0,x1,y1)=>{const a=P(x0,y1),b=P(x1,y0);return[Math.round(a.x),Math.round(a.y),Math.round(b.x-a.x),Math.round(b.y-a.y)]};
 const sh=(X,Y,Wd,Hd,h)=>{g.fillStyle='rgba(16,24,32,.34)';g.fillRect(X+h,Y+h*.8,Wd,Hd)};// cast shadow toward the lower right
 const rr=mulberry32(5151);
 // warehouses: long gabled sheds, sunlit and shaded roof halves, corrugation, the port's names painted on top
 [[-640,384,-556,452,'#4f86bf','#3c6c9e','울산항'],[-640,466,-556,534,'#9aa3ab','#7d8790','제3부두'],[-640,548,-556,612,'#4f86bf','#3c6c9e','조선 창고']].forEach(([x0,y0,x1,y1,c1,c2,t])=>{
  const[X,Y,Wd,Hd]=rect(x0,y0,x1,y1);sh(X,Y,Wd,Hd,7);g.fillStyle='#2a3038';g.fillRect(X-1,Y-1,Wd+2,Hd+2);
  g.fillStyle=c1;g.fillRect(X,Y,Wd,Hd/2|0);g.fillStyle=c2;g.fillRect(X,Y+(Hd/2|0),Wd,Hd-(Hd/2|0));
  g.fillStyle='rgba(0,0,0,.12)';for(let q=X+2;q<X+Wd;q+=3)g.fillRect(q,Y,1,Hd);
  g.fillStyle='#dfe6ec';g.fillRect(X,Y+(Hd/2|0)-1,Wd,2);
  for(let q=0;q<3;q++){g.fillStyle='#c9d2da';g.fillRect(X+10+q*(Wd-24)/2,Y+3,5,4);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+11+q*(Wd-24)/2,Y+7,5,1)}
  g.fillStyle='rgba(255,255,255,.88)';g.font='14px Jua, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,X+Wd/2,Y+Hd*.75)});
 {const[X,Y,Wd,Hd]=rect(-640,350,-596,376);sh(X,Y,Wd,Hd,10);g.fillStyle='#e4e1d8';g.fillRect(X,Y,Wd,Hd);g.fillStyle='#c9c4b8';g.fillRect(X,Y,Wd,2);g.fillRect(X,Y+Hd-2,Wd,2);g.fillStyle='#8a9096';g.fillRect(X+5,Y+6,8,5);g.fillRect(X+Wd-14,Y+8,6,4)}
 // container stacks: 8x20 ft boxes piled one to four high, higher stacks lighter and casting longer shadows
 const CC=['#2f6fd0','#2f6fd0','#1f4f9a','#d23a2e','#3faa5b','#e8e4dc','#ef6a1f','#5aa0e6'];
 for(let cx0=-522;cx0<-430;cx0+=13)for(let cy0=390;cy0<604;cy0+=23){if(rr()<.12)continue;const ht=1+(rr()*4|0),c=CC[(rr()*CC.length)|0],[X,Y,Wd,Hd]=rect(cx0,cy0,cx0+8,cy0+20);
  sh(X,Y,Wd,Hd,ht*1.6);g.fillStyle=shade(c,-.25+ht*.06);g.fillRect(X,Y,Wd,Hd);g.fillStyle='rgba(0,0,0,.18)';for(let q=Y+2;q<Y+Hd;q+=3)g.fillRect(X,q,Wd,1);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(X,Y,Wd,1)}
 for(const gy of[452,548]){const[X,Y,Wd,Hd]=rect(-526,gy,-482,gy+10);sh(X,Y,Wd,Hd,14);g.fillStyle='#f5c518';g.fillRect(X,Y,Wd,3);g.fillRect(X,Y+Hd-3,Wd,3);g.fillRect(X,Y,3,Hd);g.fillRect(X+Wd-3,Y,3,Hd);g.fillStyle='#c99a00';g.fillRect(X,Y+2,Wd,1)}
 // the moored container ship along the quay
 {const[X,Y,Wd,Hd]=rect(-376,440,-346,604);sh(X,Y,Wd,Hd,5);g.fillStyle='#8f2a24';g.beginPath();g.moveTo(X,Y+14);g.lineTo(X+Wd/2,Y);g.lineTo(X+Wd,Y+14);g.lineTo(X+Wd,Y+Hd);g.lineTo(X,Y+Hd);g.closePath();g.fill();
  g.fillStyle='#1d2a36';g.fillRect(X+2,Y+14,Wd-4,Hd-16);for(let yy=Y+18;yy<Y+Hd-40;yy+=12)for(let xx=X+4;xx<X+Wd-5;xx+=6){g.fillStyle=CC[(rr()*CC.length)|0];g.fillRect(xx,yy,5,10)}
  g.fillStyle='#e8e4dc';g.fillRect(X+3,Y+Hd-34,Wd-6,22);g.fillStyle='#2a3a5a';g.fillRect(X+5,Y+Hd-30,Wd-10,3);g.fillStyle='#c94a3a';g.fillRect(X+Wd/2-3,Y+Hd-12,6,8)}
 // ship-to-shore cranes on the quay, their booms reaching out over the ship and the water
 for(const cy0 of[452,522,592]){const[X,Y,Wd,Hd]=rect(-404,cy0-12,-386,cy0+12),[BX,BY,BW,BH]=rect(-404,cy0-3,-320,cy0+3);
  g.fillStyle='rgba(10,30,50,.32)';g.fillRect(BX+20,BY+16,BW,BH);g.fillRect(X+20,Y+16,Wd,Hd);
  g.fillStyle='#e0473d';g.fillRect(X,Y,4,Hd);g.fillRect(X+Wd-4,Y,4,Hd);g.fillRect(X,Y,Wd,3);g.fillRect(X,Y+Hd-3,Wd,3);
  g.fillStyle='#f4f1e8';g.fillRect(BX,BY,BW,BH);g.fillStyle='#e0473d';for(let q=BX;q<BX+BW;q+=10)g.fillRect(q,BY,5,BH);g.fillStyle='#2b3038';g.fillRect(X+Wd/2-3,Y+Hd/2-3,6,6);g.fillRect(BX+BW-30,BY-1,6,BH+2)}
 const boat=(xf,yf,ang,len,col)=>{const p=P(xf,yf),L=len/FT/4.2;g.save();g.translate(p.x,p.y);g.rotate(ang);g.fillStyle='rgba(10,40,60,.32)';g.beginPath();g.ellipse(3,3,L,L*.32,0,0,7);g.fill();
  g.fillStyle='#f4f1e8';g.beginPath();g.moveTo(-L,-L*.28);g.lineTo(L*.6,-L*.3);g.lineTo(L,0);g.lineTo(L*.6,L*.3);g.lineTo(-L,L*.28);g.closePath();g.fill();g.fillStyle=col;g.fillRect(-L*.4,-L*.18,L*.7,L*.36);g.fillStyle='#bcd8ea';g.fillRect(-L*.1,-L*.12,L*.3,L*.24);g.restore()};
 [[-330,430,1.6,30,'#e0473d'],[-325,612,1.4,26,'#2b3038'],
  [228,452,.4,26,'#2f6fd0'],[268,402,1.2,24,'#e0473d'],[208,404,-.3,22,'#f5c935'],[284,474,.9,26,'#2f6fd0'],
  [130,700,-.2,40,'#14325a'],[520,720,1.3,44,'#8f2a24'],[-120,560,.2,30,'#2f6fd0'],[40,770,.1,30,'#3f86c4']].forEach(b=>boat(...b));
 {const p=P(130,700);g.fillStyle='rgba(255,255,255,.55)';for(let q=1;q<8;q++)g.fillRect(p.x-14-q*5,p.y+(q&1?-1:1)*q*.7,3,1)}
 // the lighthouse at the end of the breakwater
 {const a=P(...H_JETTY[H_JETTY.length-1]);g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(a.x+9,a.y+6,8,4,0,0,7);g.fill();g.fillStyle='#9aa3ad';g.beginPath();g.arc(a.x,a.y,9,0,7);g.fill();
  g.fillStyle='#d0312d';g.beginPath();g.arc(a.x,a.y,6,0,7);g.fill();g.fillStyle='#f4f1e8';g.beginPath();g.arc(a.x,a.y,3.6,0,7);g.fill();g.fillStyle='#d0312d';g.beginPath();g.arc(a.x,a.y,2.4,0,7);g.fill();g.fillStyle=night?'#fff4c0':'#ffe9a8';g.fillRect(a.x-1,a.y-1,2,2)}
 // ---- the main gate plaza behind home: wave-patterned paving, the arch, flags and cherry trees ----
 {const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=cx(HX),gy=tip.y+4,R=118;
  g.save();g.beginPath();g.arc(gx,gy,R,0,Math.PI);g.closePath();g.fillStyle=night?'#2a2e36':'#dcdfe2';g.fill();g.clip();
  for(let b=0;b<6;b++){g.strokeStyle=b&1?(night?'#1d3a66':'#3f78c8'):(night?'#3a4a66':'#9cc0e8');g.lineWidth=5;g.beginPath();for(let x=gx-R;x<=gx+R;x+=3){const y=gy+16+b*17+Math.sin((x-gx)*.06+b)*5;x===gx-R?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}
  g.restore();
  // the arch: a navy canopy over the gate, the club's emblem at its crown
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(gx+4,gy+10,44,10,0,0,7);g.fill();
  g.strokeStyle='#14325a';g.lineWidth=9;g.beginPath();g.ellipse(gx,gy+4,40,14,0,Math.PI,0);g.stroke();g.strokeStyle='#2f6fd0';g.lineWidth=2;g.beginPath();g.ellipse(gx,gy+1,40,14,0,Math.PI,0);g.stroke();
  g.fillStyle='#14325a';g.fillRect(gx-42,gy+2,8,8);g.fillRect(gx+34,gy+2,8,8);
  {const C=closedRun(OL).filter(q=>q.y>tip.y-70);g.strokeStyle='#9fd0e8';g.lineWidth=5;g.beginPath();C.forEach((q,i)=>g[i?'lineTo':'moveTo'](q.x,q.y+3));g.stroke();g.strokeStyle='#5a8fb0';g.lineWidth=1;g.setLineDash([1,4]);g.stroke();g.setLineDash([])}
  if(LOGO[k]){g.imageSmoothingEnabled=false;g.drawImage(LOGO[k],gx-11,gy-22,22,22)}
  g.fillStyle='#14325a';g.fillRect(gx-30,gy+8,60,9);g.fillStyle='#f4f1e8';g.font='bold 6px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('ULSAN WHALES',gx,gy+12.5);g.fillStyle='#9fd8f6';g.fillRect(gx-28,gy+15,56,1)
  if(night){const gr=g.createRadialGradient(gx,gy+10,0,gx,gy+10,60);gr.addColorStop(0,'rgba(255,220,160,.35)');gr.addColorStop(1,'rgba(255,220,160,0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(gx-60,gy-50,120,120);g.restore()}
  // the whale-tail sculpture on the right of the plaza
  {const sx=gx+70,sy=gy+40;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(sx+5,sy+4,9,3,0,0,7);g.fill();g.fillStyle='#3f86c4';g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx-2,sy-8,sx-10,sy-12);g.quadraticCurveTo(sx-3,sy-10,sx,sy-6);g.quadraticCurveTo(sx+3,sy-10,sx+10,sy-12);g.quadraticCurveTo(sx+2,sy-8,sx,sy);g.fill();g.fillStyle='#9fd8f6';g.fillRect(sx-7,sy-11,3,1);g.fillRect(sx+4,sy-11,3,1)}
  // flags round the rim and cherry trees beyond them
  for(let a=.15;a<Math.PI-.1;a+=.22){const x=gx+Math.cos(a)*(R-6),y=gy+Math.sin(a)*(R-6);g.fillStyle='#2b3038';g.fillRect(x,y-6,1,7);g.fillStyle=(a*10|0)&1?'#2f6fd0':'#f4f1e8';g.fillRect(x+1,y-6,4,3)}
  for(let a=.08;a<Math.PI;a+=.16){const x=gx+Math.cos(a)*(R+8),y=gy+Math.sin(a)*(R+8);hBlossom(g,x,y,5,night)}}}

function hBlossom(g,x,y,r,night){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.arc(x+2,y+2,r,0,7);g.fill();g.fillStyle=night?'#5a3a4a':'#f2a7c3';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle=night?'#6a4a5a':'#f9cde0';g.beginPath();g.arc(x-r*.35,y-r*.35,r*.5,0,7);g.fill()}

// night: the lighthouse, the gate, warm light spilling from the facade, port masts, and the stadium's light on the water
function drawHarborGlow(g,cx,cy,OL){const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)});g.save();g.globalCompositeOperation='lighter';
 const glow=(x,y,r,c,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},${a})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
 {const a=P(...H_JETTY[H_JETTY.length-1]);glow(a.x,a.y,34,'255,240,180',.6);g.fillStyle='rgba(255,240,180,.25)';for(let k=1;k<9;k++)g.fillRect(a.x-6+((k*7)%11),a.y+6+k*4,8-(k>>1),1)}
 {const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]);glow(cx(HX),tip.y+14,80,'255,214,150',.38)}
 for(let i=0;i<OL.length;i+=2){const q=OL[i];if(q.open)continue;const dx=q.x-cx(HX),dy=q.y-cy(HY-420),l=Math.hypot(dx,dy)||1;glow(q.x+dx/l*6,q.y+dy/l*6,16,'255,200,120',.2)}
 for(const[x,y]of[[-470,420],[-470,580],[-600,456],[-395,488],[-395,558],[-600,660]]){const a=P(x,y);glow(a.x,a.y,26,'255,226,170',.28);g.fillStyle='#fff4d0';g.fillRect(a.x-1,a.y-1,2,2)}
 const rr=mulberry32(808);for(let k=0;k<320;k++){const th=-30+rr()*76,R=fenceDist(Math.max(-45,Math.min(45,th)))+30+rr()*rr()*170,x=Math.sin(th*RAD)*R,y=Math.cos(th*RAD)*R;if(!hSea(x,y)||!hSea(x,y+8))continue;
  const a=P(x,y),w=2+rr()*7;g.fillStyle=rr()<.7?'rgba(255,236,190,.28)':'rgba(140,220,255,.3)';g.fillRect(Math.round(a.x),Math.round(a.y),Math.round(w),1)}
 g.restore()}
