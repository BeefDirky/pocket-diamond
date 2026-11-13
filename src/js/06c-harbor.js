// ---------- Ulsan: a harbor park. The outfield opens onto the sea, a pier with a lighthouse runs out from right field,
// the shipyard fills the shore to the left, and the city wraps the rest of the bowl, with the main gate behind home ----------
// Like the Jeju country, the water and the outfield ring are one pure function of world position (harborCol), shared by
// the park buffer and the neighborhood layer so they meet without a seam.
const HC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 sea:h('#1d5f8f'),sea2:h('#174f78'),wave:h('#7fbfe3'),shal:h('#2a7fae'),foam:h('#d8eef8'),
 wallTop:h('#8a939b'),riser:h('#26323b'),aisle:h('#4d5761'),conc:h('#b8bec4'),conc2:h('#aeb4ba'),edge:h('#e2e6ea'),edgeD:h('#4a545e'),pole:h('#2b3038'),
 deck:h('#c9a77a'),deck2:h('#b8956a'),rail:h('#f1f1ee'),tetra:h('#9aa3ad'),tetra2:h('#7d8790'),tetraD:h('#5b646d'),
 yard:h('#9aa1a8'),yard2:h('#90979e'),yline:h('#e8d27a'),quay:h('#c9ced3')}})();
// ---- per-park look for the shared bowl (Ulsan's harbor park, Suwon's fortress) ----
const HB0={};let H_THEME='harbor';
const H_THEMES={
 harbor:{},
 orbit:{dk:{L:[[52,0],[60,24],[80,68],[110,110],[148,148],[180,166]],R:[[48,0],[56,22],[74,64],[106,108],[148,150],[180,166]]},roof:[64,70,181],gates:[-140,140,-104,104],orbit:true,roofIn:.6,facT:1.5,
  seats:[['#1d2a5e','#1a2552'],['#e94e77','#d6446b'],['#2c3c7a','#27366e']],seatU:[[26,36,84],[22,31,74]],cheer:1,
  pal:{pad1:'#141c44',pad2:'#1a2452',pad3:'#f4f1f8',pad4:'#e94e77',seam:'#0a0f26',wallY:'#e94e77',led1:'#ff6fa0',led2:'#ffe6f0',led3:'#e94e77',ledD:'#2a0a1a',
   fTop:'#c9ced6',fTop2:'#bcc2cb',mull:'#2a2f38',glass:'#2e4260',glass2:'#26385a',glassN:'#ffc878',glassN2:'#ffb35a',fEdge:'#22262e',par:'#3a3f4a',gate:'#1a1e26',gateN:'#ffd8a0',
   roof:'#d3d8df',roof2:'#c6ccd4',rib:'#9aa2ad',roofEdge:'#eef1f5',gutter:'#5a616b',conc:'#2a2e38',rail:'#d3d8df',railD:'#4a5060',wallCap:'#b4bac4',wallCap2:'#7a808c'}},
 brick:{dk:{L:[[50,0],[58,22],[78,66],[108,108],[148,146],[180,164]],R:[[47,0],[55,24],[76,70],[110,110],[148,148],[180,164]]},roof:[94,86,181],gates:[-140,140,-104,104],brick:true,roofIn:.62,facT:1.5,
  seats:[['#1d3f78','#1a386c'],['#e8642a','#d65a25'],['#2f5fb0','#2a56a0']],seatU:[[22,40,82],[19,35,72]],cheer:1,sym:true,
  pal:{pad1:'#13254a',pad2:'#182c56',pad3:'#e8eef5',pad4:'#3a6ab0',seam:'#08142a',wallY:'#ffcc48',led1:'#ffb04a',led2:'#fff1d0',led3:'#e8642a',ledD:'#2a1608',
   fTop:'#8e8a86',fTop2:'#837f7b',mull:'#1c222a',glass:'#33475c',glass2:'#2a3c50',glassN:'#ffc46a',glassN2:'#ffb04a',fEdge:'#1a1d22',par:'#2a2e34',gate:'#1a1d22',gateN:'#ffd08a',
   roof:'#5c6169',roof2:'#555a62',rib:'#4a4f56',roofEdge:'#9aa0a8',gutter:'#25292e',conc:'#2e3238',rail:'#c9ced3',railD:'#4a525c',wallCap:'#a3a9b1',wallCap2:'#727880'}},
 steel:{dk:{L:[[33,0],[42,40],[56,72],[80,96],[110,116],[148,150],[180,170]],R:[[37,0],[46,36],[60,66],[84,92],[112,114],[148,150],[180,170]]},roof:[46,54,181],gates:[-138,138,-102,102],steel:true,roofIn:.56,facT:1.6,
  seats:[['#143c2b','#123626'],['#1f5a3e','#1b5037'],['#2c7550','#286a48']],seatU:[[20,56,40],[17,48,35]],cheer:2,
  pal:{pad1:'#123a2a',pad2:'#184832',pad3:'#e8f0e0',pad4:'#2f7a52',seam:'#071a10',led1:'#7fe0a8',led2:'#eafff2',led3:'#2fa86a',ledD:'#0a2418',wallY:'#e2b93a',
   fTop:'#8e9591',fTop2:'#838a86',mull:'#1d3a2c',glass:'#2e434a',glass2:'#26383f',glassN:'#ffc46a',glassN2:'#ffb04a',fEdge:'#141f19',par:'#22302a',gate:'#16201a',gateN:'#ffd08a',
   roof:'#b9bec3',roof2:'#aeb3b9',rib:'#959ba2',roofEdge:'#e2e5e8',gutter:'#5d646b',conc:'#2a332f',rail:'#b9c4bd',railD:'#3e4a44',wallCap:'#8f9893',wallCap2:'#666f6a'}},
 mudung:{dk:{L:[[56,0],[64,16],[82,48],[110,92],[148,138],[180,160]],R:[[46,0],[54,26],[74,70],[106,112],[148,150],[180,168]]},roof:[86,64,181],gates:[-140,140,-104,104],mudung:true,roofIn:.6,facT:1.5,
  seats:[['#2c2b31','#26252b'],['#d0312d','#bc2b28'],['#b52823','#a22320']],seatU:[[160,34,32],[142,30,29]],cheer:1,
  pal:{pad1:'#1d1d22',pad2:'#25252b',pad3:'#f4f1e8',pad4:'#c0262a',seam:'#0c0c0f',wallY:'#ff3a30',led1:'#ff5a48',led2:'#fff0e0',led3:'#d0312d',ledD:'#2a0a0a',
   fTop:'#cfc6b4',fTop2:'#c3baa7',mull:'#2a2224',glass:'#2c3a4a',glass2:'#24303e',glassN:'#ffc46a',glassN2:'#ffb04a',fEdge:'#1e1a1a',par:'#3a3436',gate:'#1e1a1c',gateN:'#ffd08a',
   roof:'#c4c8cc',roof2:'#b8bcc1',rib:'#8a9098',roofEdge:'#e6e8ea',gutter:'#33373d',conc:'#2e2a2c',rail:'#d6d0c6',railD:'#4a4446',wallCap:'#34343a',wallCap2:'#222226'}},
 bread:{dk:{L:[[50,0],[58,20],[78,62],[108,106],[148,146],[180,166]],R:[[47,0],[55,24],[76,68],[110,110],[148,148],[180,166]]},roof:[78,74,181],gates:[-140,140,-104,104],bread:true,roofIn:.6,facT:1.5,
  seats:[['#1c2e62','#182856'],['#2f55b0','#2a4c9e'],['#c8202a','#b01c26']],seatU:[[30,46,98],[26,40,86]],cheer:2,
  pal:{pad1:'#14244e',pad2:'#182b5c',pad3:'#f4ead8',pad4:'#d0202e',seam:'#0a1230',wallY:'#d0202e',led1:'#ff5a5a',led2:'#fff0e0',led3:'#3b5cae',ledD:'#0c1430',
   fTop:'#c9d0d8',fTop2:'#bcc4ce',mull:'#1c2a4a',glass:'#2c4468',glass2:'#243a5a',glassN:'#ffc46a',glassN2:'#ffb04a',fEdge:'#1a2238',par:'#39425a',gate:'#16203a',gateN:'#ffd08a',
   roof:'#d0d5dc',roof2:'#c3c9d2',rib:'#8a94a2',roofEdge:'#eef1f5',gutter:'#2a3040',conc:'#262c3c',rail:'#d6dae2',railD:'#3a4258',wallCap:'#b9c0cc',wallCap2:'#7c8494'}},
 fortress:{dk:{R:[[60,0],[72,34],[90,76],[116,114],[148,150],[180,168]],L:[[50,0],[60,20],[80,62],[110,114],[148,150],[180,168]]},roof:[70,70,181],gates:[180,-142,142,-108,108],tile:124,stone:true,
  seats:[['#3d2470','#36205f'],['#5a35a0','#512f90'],['#7a52c4','#6e48b2']],seatU:[[44,24,82],[38,20,72]],cheer:2,
  pal:{pad1:'#2a1650',pad2:'#3a2068',pad3:'#e8dcff',pad4:'#7a52c4',seam:'#120826',led1:'#b07cff',led2:'#f2e8ff',led3:'#6a3fd0',ledD:'#1e0f3a',
   fTop:'#b9ad98',fTop2:'#ab9f8a',mull:'#6e6452',glass:'#4a4a5e',glass2:'#3f4052',glassN:'#ffc76a',glassN2:'#ffb24a',fEdge:'#4c4436',par:'#5a5242',gate:'#2a2430',gateN:'#ffd08a',
   roof:'#c6cad1',roof2:'#b9bec6',rib:'#a3a9b2',roofEdge:'#e6e9ee',gutter:'#7a808a',conc:'#3a3444',rail:'#c9c2d6',railD:'#5a5268',wallCap:'#cfc6b4',wallCap2:'#9c937f'}}};
function hTheme(){const k=(ST&&ST.bowl)||'harbor';if(!HB0.rail)for(const k2 in HB)HB0[k2]=HB[k2].slice();H_THEME=k;const T=H_THEMES[k]||{};
 for(const k2 in HB0)HB[k2]=HB0[k2].slice();for(const k2 in (T.pal||{}))HB[k2]=hRGB(T.pal[k2]);
 H_DK=T.dk||{R:[[68,0],[80,44],[96,82],[118,114],[148,150],[180,168]],L:[[34,0],[52,64],[78,122],[112,148],[180,168]]};H_ROOF=T.roof||[62,84,166];H_GATES=T.gates||[180,-146,146,-112,114];
 const sp=(T.seats||[['#1f3f7a','#1b3870'],['#2f6fd0','#2a63bb'],['#5aa0e6','#5193d6']]).map(p=>p.map(hRGB));H_SEATS.splice(0,3,...sp);H_SEATU.splice(0,2,...(T.seatU||[[27,47,94],[24,42,84]]));H_CHEERI=T.cheer!=null?T.cheer:2;H_SYM=!!T.sym}
let H_CHEERI=2,H_SYM=false;
let H_ROWF=0,H_KIND=0,H_SEAT=false,H_EMIS=false,H_SHADE=false,H_NIGHT=false;
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
let H_DK={R:[[68,0],[80,44],[96,82],[118,114],[148,150],[180,168]],L:[[34,0],[52,64],[78,122],[112,148],[180,168]]};
function hD(phi){const a=Math.abs(phi),K=phi>=0?H_DK.R:H_DK.L;if(a<=K[0][0])return 0;
 for(let i=0;i<K.length-1;i++)if(a<=K[i+1][0]){const u=(a-K[i][0])/(K[i+1][0]-K[i][0]),t=(1-Math.cos(u*Math.PI))/2;return K[i][1]+(K[i+1][1]-K[i][1])*t}return K[K.length-1][1]}
const hPhi=(x,y)=>Math.atan2(x,y-H_CC.y)/RAD;
function hFieldD(x,y){const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
 const dS=(y>0&&Math.abs(th)<=45)?Math.max(0,r-fenceDist(th)):1e4;
 const st=sd=>{const al=(sd*x+y)/Math.SQRT2,pe=(sd*x-y)/Math.SQRT2;return Math.hypot(Math.max(-5-al,0,al-328),Math.max(-pe,0,pe-40))};
 const dA=st(1),dB=st(-1),dC=Math.max(0,r-34),m=Math.min(dS,dA,dB,dC);if(m<=0)return 0;
 const k=30,sm=-k*Math.log(Math.exp(-dS/k)+Math.exp(-dA/k)+Math.exp(-dB/k)+Math.exp(-dC/k)),w=clamp((m-12)/55,0,1);return m-(m-Math.max(0,sm))*w}
// position along the row for a point in the stands (feet), and which part of the bowl it belongs to: the run along each
// foul line, the curve behind home, or the arc beyond the outfield wall. Each piece's rows are straight or concentric, so
// a stair at a fixed position along it stays square to the rows.
function hAlong(x,y){const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;
 const dS=(y>0&&Math.abs(th)<=45)?Math.max(0,r-fenceDist(th)):1e4;
 const st=sd=>{const al=(sd*x+y)/Math.SQRT2,pe=(sd*x-y)/Math.SQRT2;return{d:Math.hypot(Math.max(-5-al,0,al-328),Math.max(-pe,0,pe-40)),al}};
 const A=st(1),B=st(-1),dC=Math.max(0,r-34),m=Math.min(dS,A.d,B.d,dC);
 if(m===A.d&&A.al>-5)return{s:A.al,piece:1};if(m===B.d&&B.al>-5)return{s:-B.al,piece:2};
 if(m===dS)return{s:th*RAD*fenceDist(th),piece:3};return{s:Math.atan2(x,y)*60,piece:4}}
// is the roof over this angle, and how far in it reaches as a share of the depth? left and right differ on purpose
let H_ROOF=[62,84,166];
function hRoofIn(phi){const L=phi<0,a=Math.abs(phi),lo=L?H_ROOF[0]:H_ROOF[1],hi=H_ROOF[2];if(a<lo||a>hi)return 9;const e=Math.min(a-lo,hi-a),t=clamp(e/9,0,1),sm=t*t*(3-2*t),b=(H_THEMES[H_THEME]||{}).roofIn||.70;return b+(1-sm)*(1.02-b)}
let H_GATES=[180,-146,146,-112,114];
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
function hRS(){const key=(ST&&ST.bowl)+DIMS.join(',');if(H_RS&&H_RS_K===key)return H_RS;H_RS_K=key;const raw=new Float32Array(360),open=new Uint8Array(360);
 for(let i=0;i<360;i++){const phi=i-180,D=hD(phi),De=Math.max(D,26),dx=Math.sin(phi*RAD),dy=Math.cos(phi*RAD);let t0=0,t1=0;
  for(let t=10;t<1600;t+=10){if(hFieldD(H_CC.x+dx*t,H_CC.y+dy*t)>=De){t1=t;break}t0=t}
  for(let k=0;k<18;k++){const m=(t0+t1)/2;if(hFieldD(H_CC.x+dx*m,H_CC.y+dy*m)>=De)t1=m;else t0=m}raw[i]=t1;open[i]=D<10?1:0}
 // smooth only the closed part: a few passes of a wide circular average, the open ends pinned
 let R=Float32Array.from(raw);for(let p=0;p<14;p++){const o=new Float32Array(360);for(let i=0;i<360;i++){if(open[i]){o[i]=raw[i];continue}let s=0,w=0;for(let k=-10;k<=10;k++){const j=(i+k+360)%360;if(open[j])continue;const ww=11-Math.abs(k);s+=R[j]*ww;w+=ww}o[i]=s/w}R=o}
 // fill any dents (the corner where the foul-line stand meets the outfield bends the raw edge inward): the outer wall
 // of a stadium runs convex, so lift each point up to the chord between its neighbours
 for(let it=0;it<30;it++)for(let i=0;i<360;i++){if(open[i])continue;for(let k=2;k<=14;k+=2){const a=(i-k+360)%360,b=(i+k)%360;if(open[a]||open[b])continue;const ch=(R[a]+R[b])/2*Math.cos(k*RAD);if(ch>R[i])R[i]=ch}}
 {const o=new Float32Array(360);for(let i=0;i<360;i++){if(open[i]){o[i]=R[i];continue}let s2=0,w=0;for(let k=-3;k<=3;k++){const j=(i+k+360)%360;if(open[j])continue;s2+=R[j];w++}o[i]=s2/w}R=o}
 // never pull the edge in past where the seats need to be
 for(let i=0;i<360;i++)if(!open[i])R[i]=Math.max(R[i],raw[i]-48);
 return H_RS={R,open}}
const hRout=phi=>{const T=hRS(),f=phi+180,i=Math.floor(f),u=f-i;return T.R[(i+360)%360]*(1-u)+T.R[(i+361)%360]*u};
// the outline of the bowl (world px), traced where the stands end; open across the outfield
function hOutline(){const T=hRS(),out=[];for(let i=0;i<360;i+=1){const phi=i-180,dx=Math.sin(phi*RAD),dy=Math.cos(phi*RAD);let t=T.R[i],op=!!T.open[i];
  if(H_THEME==='steel'){const tr=sTrR(phi);if(tr>0&&(op||tr+16>t)){t=Math.max(t,tr+16);op=false}}
  if((H_THEME==='brick'||H_THEME==='orbit'||H_THEME==='mudung'||H_THEME==='bread')&&op){t=bOpenR(phi,t);op=false}// Harbor Field's outfield buildings close the ring// Fossil Yard closes over the outfield with its truss
  out.push({x:HX+(H_CC.x+dx*t)/FT,y:HY-(H_CC.y+dy*t)/FT,open:op})}return out}
// seats by section: navy, royal and sky blue blocks, a cheering block on each side of the infield, white seats
// tracing a wave through some sections
const H_SEATS=[['#1f3f7a','#1b3870'],['#2f6fd0','#2a63bb'],['#5aa0e6','#5193d6']].map(p=>p.map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)])),
 H_SEATU=[[27,47,94],[24,42,84]],H_WHITE=[232,238,245],H_CHEER=[[255,210,63],[240,196,50]];
function hSeat(ang,row,upper,secId){const sec=secId!=null?secId+1000:Math.floor((ang+400)/10),h=vHash(sec,77);
 if(upper)return H_SEATU[row&1];
 if((ang>14&&ang<34)||(ang<-14&&ang>-34)){if(ang>0||H_SYM)return H_SEATS[H_CHEERI][row&1]}// the home cheering block on the first-base side
 const p=H_SEATS[h%3];return p[row&1]}
// the boardwalk: warm planks, blue-and-white parasols over tables, a cafe kiosk every so often
const H_PARA=[[47,111,208],[244,246,250]];
function hBoard(wx,wy,s2,d,w){// warm planks laid along the walk, a darker joint every few boards and a butt joint every 12 ft
 if(d<.8||d>w-.8)return HC.deck2;
 const b=Math.floor(d/1.6),sj=((s2+b*5.3)%12+12)%12;if(sj<.35)return hMul(HC.deck2,.86);
 const p=vPerson(wx,wy,6);if(p)return p;
 return b%3===0?hMul(HC.deck,.95):(b&1)?HC.deck:HC.deck2}

// the right-field terrace right behind the wall: three stepped tiers of standing rail and benches looking over the wall,
// then the boardwalk with its umbrellas and cafes running on round to the cove
const hPenOff=th=>{const a=Math.abs(th),t=a<29?clamp((a-27)/2,0,1):a>41?clamp((43-a)/2,0,1):1;return 18*t};// the deck steps out round the bullpens
const hDeckW=th=>lerp(16,21.5,clamp((th-8)/5,0,1));
function hTerr(wx,wy,s,d,w,th){
 if(d<5){const t=d%1.7;if(t<.4)return HB.railD;if(t<.8)return HB.rail;// standing rails along each step
  const p=vPerson(wx,wy,24);if(p)return p;return d<1.7?HB.terr2:d<3.4?HB.terr:hMul(HB.terr,1.05)}
 if(d<6)return d<5.4?HB.railD:HB.rail;
 if(d<w-3.5)return hBoard(wx,wy,s,d-6,w-9.5);
 if(d<w-2.6)return [196,226,238];// glass rail
 if(d<w-2.1)return HB.railD;
 return d<w-.6?HB.seaWall:HB.seaWallD}
// the outfield wall: a yellow home-run line, padded panels in club colours with seams, a concrete cap
const H_WALLW=10;// feet from the fence line to the back of the wall
function hWall(q,s,n){if(H_THEME==='bread'){const c=djWall(q,s);if(c)return c}if(q<.9)return HB.wallY;if(H_THEME==='mudung'&&q<1.5)return MC.red;// Mudung's wall: a deep red trim under the bright red edge
 if(H_THEME==='mudung'&&q>2.2&&q<6.6&&((s%54)+54)%54<9){const m=((s%54)+54)%54;if(Math.abs(m-4.5-(q-4.4)*1.6)<.7)return hMul(MC.red,.8)}// and a red chevron on some panels

 if(q<6.6){const m=((s%18)+18)%18;if(m<.9)return HB.seam;// padded panels, every 18 ft, a dark seam between
  const id=Math.floor(s/18),P=(id&1)?HB.pad2:HB.pad1;return q<1.9?hMul(P,.7):q>5.8?hMul(P,1.18):P}// the face in shade, a lit top edge
 if(q<8.4)return ((Math.floor(s/6)&1)?HB.wallCap:hMul(HB.wallCap,.94));// the concrete cap
 if(q<9.2)return HB.wallCap2;return hMul(HB.wallCap2,.6)}// its back edge, and the shadow it throws
// the bowl's layers, outward from the field: rail, lower bowl, the concourse under the upper deck, the LED ribbon on the upper
// deck's fascia, the upper bowl, the roof, and the facade with its window bands
function hBowl(x,y,wx,wy,d,D,phi,lo){const ha=Math.atan2(x,y)/RAD,rh=Math.hypot(x,y)||1,n=vHash(Math.floor(wx/2),Math.floor(wy/2));
 const rC=Math.hypot(x,y-H_CC.y),sF=phi*RAD*rC;
 const TH=H_THEMES[H_THEME]||{},T=(D>100?12+10*clamp((D-100)/50,0,1):D>40?12:2.5)*(TH.facT||1),fac=D-T;
 if(d>=fac){const k=d-fac;
  if(D<=40)return k<1.4?HB.par:HB.fEdge;
  let gate=false;for(const gg of H_GATES){const dg=Math.abs(((phi-gg+540)%360)-180)*RAD*rC;if(dg<6){gate=true;break}}
  if(gate){if(k<1.5)return HB.par;H_EMIS=H_NIGHT;return H_NIGHT?(k>9?HB.gateN:hMul(HB.gateN,.75)):HB.gate}
  if(k<1.6)return HB.par;if(TH.steel&&k<T-1.4)return sFacade(k,T,sF);if(TH.brick&&k<T-1.4)return bFacade(k,T,sF);if(TH.orbit&&k<T-1.4)return oFacade(k,T,sF);if(TH.mudung&&k<T-1.4)return mFacade(k,T,sF);if(TH.bread&&k<T-1.4)return djFacade(k,T,sF);if(k<5.6){if(((sF%22)+22)%22<3&&k>2.4&&k<4.6)return HB.wallCap2;return (Math.floor(sF/6)&1)?HB.fTop:HB.fTop2}// facade top, with rooftop plant
  if(TH.stone&&k<T-1.4){// stone masonry with arched windows, a floor at a time; warm light in them at night
   const fl=((k-5.6)%5.2+5.2)%5.2,band=Math.floor((k-5.6)/5.2),m=((sF%12)+12)%12,wx2=m-6,inW=Math.abs(wx2)<2.8&&fl>1&&fl<4.6&&!(fl<2.2&&Math.abs(wx2)>1.6);
   if(inW){H_EMIS=H_NIGHT;return H_NIGHT?((vHash(Math.floor(sF/12),band)&7)===0?hMul(HB.glassN,.4):HB.glassN):(fl<2.2?HB.glass2:HB.glass)}
   const st=vHash(Math.floor((sF+(Math.floor(fl/1.3)&1)*1.5)/3),Math.floor((k-5.6)/1.3)+band*9);if(((sF%3)+3)%3<.35||fl%1.3<.25)return hMul(HB.fTop,.78);return st%3===0?hMul(HB.fTop,.92):st%5===0?hMul(HB.fTop,1.05):HB.fTop}
  if(k<T-1.4){const m=((sF%4)+4)%4,fl=((k-5.6)%4.2+4.2)%4.2;if(m<.8||fl<.7)return HB.mull;const band=Math.floor((k-5.6)/4.2);H_EMIS=H_NIGHT;// window bands, one per floor
   return H_NIGHT?((vHash(Math.floor(sF/4),band)&7)===0?hMul(HB.glassN,.45):band&1?HB.glassN2:HB.glassN):(band&1?HB.glass2:HB.glass)}
  return HB.fEdge}
 if(d<lo){return d<lo-1.2?HB.rail:HB.railD}
 // the upper deck and its concourse thin out smoothly toward the end of a stand, so the layers never jump
 const RI=Math.min(fac,D*hRoofIn(phi)),up=clamp((D-40)/40,0,1),L1=lerp(RI,Math.min(RI,D*.44),up),C1=L1+7*up,U0=C1+1.6*up;
 // stairs run straight up the bowl, square to the rows: spaced along the row direction (not fanned out from home plate)
 const AL=hAlong(x,y),step=27,sStep=upper=>(((AL.s+(upper?step/2:0))%step)+step)%step;
 const seat=(d0,upper)=>{const t=(d-d0)/2.4,row=Math.floor(t),fr=t-row,m=sStep(upper),dm=Math.abs(m-step/2);
  if(dm<1.3)return upper?hMul(HB.rail,.82):HB.rail;// stairs
  if(dm<1.9)return upper?[20,26,34]:[30,38,48];// their edges
  if(fr>.76)return upper?[22,28,36]:[34,42,52];H_SEAT=true;H_ROWF=fr;return hSeat(ha,row,upper,TH.sym?(AL.piece===2?1:AL.piece)*100+Math.floor(Math.abs(AL.s)/(step*3)):AL.piece*100+Math.floor((AL.s+(upper?step/2:0))/(step*3)))};// a mirrored park picks each section's colour from its distance off the centre line
 let c;
 const roofPx=k=>{if(k<.8)return HB.gutter;if(k<1.8)return HB.roofEdge;if(d>fac-1.4)return HB.gutter;const m=((sF%10)+10)%10;if(m<1)return HB.rib;return (Math.floor(sF/10)&1)?HB.roof:HB.roof2};
 if(d<L1){c=seat(lo,false);if(D>70&&d>L1-9)c=hMul(c,.5+.3*clamp((L1-d)/9,0,1))}// the upper deck's overhang shades the back rows
 else if(d<C1){const p=vPerson(wx,wy,12);if(p)return hMul(p,.6);if(H_NIGHT&&((Math.floor(sF/9)+Math.floor(d))&7)===0){H_EMIS=true;return HB.concLit}return (n&3)?HB.conc:hMul(HB.conc,.85)}
 else if(d<U0){const m=((sF%6)+6)%6;H_EMIS=H_NIGHT;if(d<C1+.4||d>U0-.3)return HB.ledD;return m<2?HB.led1:m<4?HB.led2:HB.led3}
 else if(d<RI){c=seat(U0,true);if(RI<fac&&d>RI-13)c=hMul(c,.42+.36*clamp((RI-d)/13,0,1))}// the roof's shadow on the top rows
 else{const k=d-RI;if(TH.steel)return sRoof(k,fac-RI,phi,sF,()=>seat(U0,true));if(TH.brick)return bRoof(k,fac-RI,phi,sF,()=>seat(U0,true));if(TH.orbit)return oRoof(k,fac-RI,phi,sF);if(TH.mudung)return mRoof(k,fac-RI,phi,sF,()=>seat(U0,true));if(TH.bread)return djRoof(k,fac-RI,phi,sF,()=>seat(U0,true));
  if(TH.tile&&Math.abs(phi)>TH.tile){// a Korean tiled roof: charcoal tile rows running down to a pale lifted eave, a light ridge on top
   const kk=fac-d;if(k<1)return [24,22,30];if(k<2.2)return [214,206,190];if(kk<1.4)return [178,172,160];
   const m=((sF%2.1)+2.1)%2.1,sh=.8+.3*clamp(k/Math.max(4,fac-RI),0,1),c0=m<.55?[26,26,34]:m<1.15?[70,70,84]:[50,50,62];// channels run ridge to eave; the cap tiles catch the light
   if(((kk%5.5)+5.5)%5.5<.35)return [36,36,46];return hMul(c0,sh)}
  if(k<.8)return HB.gutter;if(k<1.8)return HB.roofEdge;if(d>fac-1.4)return HB.gutter;const m=((sF%10)+10)%10;if(m<1)return HB.rib;return (Math.floor(sF/10)&1)?HB.roof:HB.roof2}
 return c}
// the colour of harbor ground at a world pixel, or null where the plain city carries on
function harborCol(wx,wy){H_KIND=0;H_SEAT=false;H_EMIS=false;H_SHADE=false;const x=(wx-HX)*FT,y=(HY-wy)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th);
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3)),fair=y>0&&ath<=45,q=fair?r-fenceDist(th):-1,s=r*th*RAD;
 if(fair&&q>=0){const q0=hPenOff(th);if(q0>.5&&q<q0)return HB.wallCap;if(q<q0+H_WALLW){const w=hWall(q-q0,s,n);return q0>.5&&w===HB.wallY?HB.wallCap:w}}// behind a bullpen the wall carries no home-run line
 const phi=hPhi(x,y),D=hD(phi),Ro=hRout(phi),rc=Math.hypot(x-H_CC.x,y-H_CC.y),d=rc<Ro+4?hFieldD(x,y):1e4;
 if(d<=0&&PARK_C){// the last of the field, past the park buffer's edge: the warning track runs on round the corners, fair and foul
  const trk=()=>((vHash(Math.floor(wx),Math.floor(wy))%5)===0?PARK_C.tr2:PARK_C.tr);
  if(y>0&&ath<=45&&r>fenceDist(th)-14)return trk();
  if(!(y>0&&ath<=45)){const sd=x>=0?1:-1,al=(sd*x+y)/Math.SQRT2,pe=(sd*x-y)/Math.SQRT2;if(pe>=0&&al>-5){const fd=fenceDist(sd*45),e2=fd-al;if(e2<0&&40-pe>0)return hMul(HB.pad1,.8);const e=Math.min(40-pe,e2),wt=e2<40-pe?8:3;
   if(e<wt){const s2=e2<40-pe?pe:al,m=((s2%18)+18)%18;return e<.8?HB.wallY:e<1.6?HB.wallCap:m<.9?HB.seam:(Math.floor(s2/18)&1)?HB.pad2:HB.pad1}// the wall carries on round the corner
   if(e<wt+14/1)return trk()}}// within the track's width of the stands
  return PARK_MOW(x,y,r)?PARK_C.g1:PARK_C.g2}// the last of the foul ground, past the park buffer's edge
 if(D>8){if(rc<Ro&&d>0){{const ph2=phi-Math.sign(phi)*1.6*60/Math.max(60,rc);if(hD(ph2)<=8)return d<5?HB.railD:(Math.floor(rc/4)&1)?HB.fEdge:HB.par}// the end wall where a stand stops
 const De=d+(Ro-rc);return hBowl(x,y,wx,wy,d,De,phi,fair?7:3)}}
 if(H_THEME!=='harbor'){const c=(H_THEME==='steel'?steelCol:H_THEME==='brick'?brickCol:H_THEME==='orbit'?orbitCol:H_THEME==='mudung'?mudungCol:H_THEME==='bread'?breadCol:fortCol)(x,y,wx,wy,r,th,ath,q,s,n,fair);if(c)return c;if(D>8){const x2=x-6,y2=y+6,p2=hPhi(x2,y2);if(hD(p2)>8&&Math.hypot(x2-H_CC.x,y2-H_CC.y)<hRout(p2))H_SHADE=true}return null}
 // past the open outfield wall: a terrace behind centre, a boardwalk behind right field, then the sea wall
 if(fair&&th>8){const q0=hPenOff(th)+H_WALLW,dw=hDeckW(th);if(q<q0)return HB.wallCap;if(q<q0+dw)return hTerr(wx,wy,s,q-q0,dw,th)}
 if(fair&&q<26){const m=((s%26)+26)%26;
   if(q>21&&q<22.2&&m<1.2)return HB.par;if(q>18.6&&q<21.2&&m>=1.2&&m<4.6)return Math.floor(s/26)&1?HB.pad2:HB.pad3;// flags along the back rail
   const p=vPerson(wx,wy,8);if(p)return p;return (Math.floor(s/3)+Math.floor(q/3))&1?HB.terr:HB.terr2}
 if(fair&&q<27.6)return HB.seaWall;
 {const jd=hJetD(x,y);if(jd<10){if(jd<3.2)return (n&3)?HB.jet:hMul(HB.jet,.9);const t=vHash(Math.floor(wx/5),Math.floor(wy/5));return (t&3)===0?HB.tetD:(t&3)===1?HB.tet2:HB.tet}}
 if(hInCove(x,y)){const dc=hCoveR(x,y)-Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y);if(dc<7){const t=vHash(Math.floor(wx/6)+(Math.floor(wy/6)&1)*3,Math.floor(wy/6)),k=t&7;
   if(dc<1.6||k<5-dc*.6)return k<2?HB.tetD:k<4?HB.tet2:HB.tet}}// rocks heaped along the cove's shore
 if(hSea(x,y)){if(!hSea(x-3,y-3)||!hSea(x+3,y-3)||!hSea(x-3,y+3)||!hSea(x+3,y+3));else H_KIND=1;if(!hSea(x-3,y-3)||!hSea(x+3,y-3)||!hSea(x-3,y+3)||!hSea(x+3,y+3))return hInCove(x,y)?HB.seaWallD:HB.seaWall;return hSeaCol(x,y,wx,wy)}
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
 let lv=clamp(Math.floor((sw+2)/4*4+dith-.5),0,3);if(cove>.5){const dcv=hCoveR(x,y)-Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y);if(dcv<26)lv=clamp(lv+(dcv<14?2:1),0,3)}// shallows by the rocks
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
  g.save();g.beginPath();g.arc(gx,gy,R,0,Math.PI);g.closePath();g.fillStyle='#dcdad3';g.fill();g.clip();
  // paving: pale slabs, two blue wave bands round the rim
  g.fillStyle='#cfccc4';for(let yy=gy;yy<gy+R;yy+=8)g.fillRect(gx-R,yy,2*R,1);for(let xx=gx-R;xx<gx+R;xx+=8)g.fillRect(xx,gy,1,R);
  for(const[rb,col]of[[R-7,'#3f78c8'],[R-12,'#9cc0e8']]){g.strokeStyle=col;g.lineWidth=2.5;g.beginPath();for(let a=0;a<=Math.PI+.01;a+=.03){const rr2=rb+2.5*Math.sin(a*14);const x=gx+Math.cos(a)*rr2,y=gy+Math.sin(a)*rr2;a===0?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}
  // the centrepiece: a round fountain
  {const wx=gx+16,wy=gy+78;
   g.fillStyle='#9aa3ad';g.beginPath();g.arc(wx-22,wy-26,10,0,7);g.fill();g.fillStyle='#6fb8e0';g.beginPath();g.arc(wx-22,wy-26,8,0,7);g.fill();g.fillStyle='#d8f0fa';for(let k=0;k<6;k++){const a=k*1.05;g.fillRect(wx-22+Math.cos(a)*4,wy-26+Math.sin(a)*4,1.5,1.5)}g.fillRect(wx-23,wy-27,2,2)}
  // planted beds with trees down both sides, benches in front of them
  for(const sd of[-1,1]){for(let k=0;k<4;k++){const a=Math.PI/2+sd*(.62+k*.2),bx=gx+Math.cos(a)*(R*.62),by=gy+Math.sin(a)*(R*.62);g.fillStyle='#8d877d';g.beginPath();g.arc(bx,by,8,0,7);g.fill();g.fillStyle='#6aa850';g.beginPath();g.arc(bx,by,6.5,0,7);g.fill();hBlossom(g,bx,by-1,5,false);
}}
  // people crossing the plaza
  for(let k=0;k<46;k++){const a=Math.PI*(.05+.9*((k*37%100)/100)),d=R*(.15+.75*((k*53%97)/97)),x=gx+Math.cos(a)*d,y=gy+Math.sin(a)*d;g.fillStyle=['#2f6fd0','#e8eef5','#14325a','#e0473d','#5aa0e6','#f5c935'][k%6];g.fillRect(Math.round(x),Math.round(y),2,2);g.fillStyle='#2a1e16';g.fillRect(Math.round(x),Math.round(y)-1,2,1)}
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

// a tree from above: a darker shadowed base, three or four overlapping leaf clumps, a lit crown and a few highlight
// flecks (pink blossom or green leaf). Seeded by position so the same tree always looks the same.
function hTreeTop(g,x,y,r,cols){const h=vHash(Math.round(x*3),Math.round(y*3)),[dk,md,lt,hi]=cols;
 g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.arc(x+r*.45,y+r*.45,r,0,7);g.fill();
 g.fillStyle=dk;g.beginPath();g.arc(x,y,r,0,7);g.fill();
 const n=3+(h&1);for(let k=0;k<n;k++){const a=(h>>>3)%628/100+k*6.283/n,d=r*.38;g.fillStyle=md;g.beginPath();g.arc(x+Math.cos(a)*d-r*.08,y+Math.sin(a)*d-r*.08,r*.56,0,7);g.fill()}
 g.fillStyle=lt;g.beginPath();g.arc(x-r*.3,y-r*.3,r*.42,0,7);g.fill();
 g.fillStyle=hi;for(let k=0;k<3;k++){const a=((h>>>(9+k*4))&15)/16*6.283,d=r*(.2+((h>>>(20+k))&1)*.3);g.fillRect(Math.round(x-r*.25+Math.cos(a)*d),Math.round(y-r*.25+Math.sin(a)*d),1,1)}}
const H_TCOL={pink:['#d98aa8','#f2a7c3','#f9cde0','#ffffff'],pinkN:['#4a2e3c','#5a3a4a','#6a4a5a','#8a6a7a'],green:['#2f6b2c','#3f8a3c','#58a64c','#8fd070'],greenN:['#122618','#183020','#1e3a26','#2a4a32']};
function hBlossom(g,x,y,r,night){hTreeTop(g,x,y,r,H_TCOL[night?'pinkN':'pink'])}
function hGreenTree(g,x,y,r,night){hTreeTop(g,x,y,r,H_TCOL[night?'greenN':'green'])}

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
// ---- decor drawn once on top of the painted ground, in world pixels (the park buffer draws it at full size, the
// neighborhood layer at half): the outfield wall's lettering and distances, benches and lamps along the promenades ----
const H_ADS=[['울산 수산','#e8eef5'],['WHALE MART','#ffd23f'],['바다 은행','#e8eef5'],['ULSAN PORT','#9fd8f6'],['고래 치킨','#ffd23f'],['BADA AIR','#e8eef5'],['현대 조선','#9fd8f6'],['TAEHWA','#e8eef5']];
const hW=(th,ft)=>({x:HX+Math.sin(th*RAD)*ft/FT,y:HY-Math.cos(th*RAD)*ft/FT});
let H_LAMPS=null;
function hLamps(){if(H_LAMPS)return H_LAMPS;const L=[];
 // the cove promenade: lamps on the rail, every few degrees round the bay where it meets the land
 for(let a=-180;a<180;a+=11){const ar=a*RAD,R=hCoveR(H_COVE_C.x+Math.sin(ar),H_COVE_C.y+Math.cos(ar))+3,x=H_COVE_C.x+Math.sin(ar)*R,y=H_COVE_C.y+Math.cos(ar)*R;if(!hEastLand(x,y))continue;L.push({x:HX+x/FT,y:HY-y/FT,k:'cove',a:ar})}
 // the right-field terrace, along its back rail
 for(let th=10;th<44;th+=4.5){const q=hPenOff(th)+H_WALLW+5.7;L.push({...hW(th,fenceDist(th)+q),k:'terr'})}
 for(let th=10;th<44;th+=4.5){const q=hPenOff(th)+H_WALLW+hDeckW(th)-3;L.push({...hW(th,fenceDist(th)+q),k:'terr'})}
 // the centre-field terrace
 for(let th=-20;th<=8;th+=5){L.push({...hW(th,fenceDist(th)+22),k:'terr'})}
 return H_LAMPS=L}
// the furniture on the boardwalks, as real shapes in world pixels: parasol tables and cafe kiosks along the right-field
// deck and round the cove (spaced by distance along each walk, so they keep their size and shape on the curves)
let H_SPOTS=null,H_SPOTS_K='';
function hSpots(){const key=DIMS.join(',');if(H_SPOTS&&H_SPOTS_K===key)return H_SPOTS;H_SPOTS_K=key;const out=[];
 // right-field deck: walk the centre line of the boardwalk from right-centre to the pole
 {let acc=8,k=0;for(let th=11.5;th<41.5;th+=.1){const R0=fenceDist(th)+hPenOff(th)+H_WALLW,dw=hDeckW(th),Rm=R0+6+(dw-9.5)/2,ds=Rm*.1*RAD;acc+=ds;if(acc<26)continue;acc=0;k++;
   const p=hW(th,Rm);out.push({x:p.x,y:p.y,ang:-th*RAD,kind:k%4===2?'cafe':'para',col:k%3})}}
 // round the cove: in the middle of the promenade, outside the stadium and clear of the right-field deck
 {let acc=0,k=0;for(let a=-180;a<180;a+=.25){const ar=a*RAD,Rm=hCoveR(H_COVE_C.x+Math.sin(ar),H_COVE_C.y+Math.cos(ar))+9.4,x=H_COVE_C.x+Math.sin(ar)*Rm,y=H_COVE_C.y+Math.cos(ar)*Rm;acc+=Rm*.25*RAD;
   if(!hEastLand(x,y)||hOwnDeck(x,y)||insidePoly(hOutline(),HX+x/FT,HY-y/FT)){acc=10;continue}if(acc<17)continue;acc=0;k++;const p={x:HX+x/FT,y:HY-y/FT};out.push({x:p.x,y:p.y,ang:-ar+Math.PI,kind:k%5===3?'cafe':'para',col:k%3,sc:.55})}}
 return H_SPOTS=out}
// is this point on (or right by) the right-field deck?
function hOwnDeck(x,y){const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD;if(y<=0||th<=8||th>45)return false;return r<fenceDist(th)+hPenOff(th)+H_WALLW+hDeckW(th)+10}
const H_PCOL=[['#2f6fd0','#f4f6fa'],['#14325a','#f4f6fa'],['#5aa0e6','#f4f6fa'],['#e8642a','#f4f6fa'],['#e8642a','#1d3f78']];
function hParasol(g,x,y,col,sc){sc=sc||1;const r=11*sc,[c1,c2]=H_PCOL[col];
 g.fillStyle='rgba(16,24,32,.28)';g.beginPath();g.arc(x+5*sc,y+4*sc,r,0,7);g.fill();// its shadow on the boards
 g.fillStyle='#6b4a2e';const ch=Math.max(2,Math.round(3*sc));g.fillRect(Math.round(x-r-ch),Math.round(y-1),ch,ch);g.fillRect(Math.round(x+r),Math.round(y-1),ch,ch);// two chairs peeking out
 for(let k=0;k<8;k++){const a0=k*Math.PI/4-Math.PI/8,a1=a0+Math.PI/4,lit=Math.cos(a0+Math.PI/8+Math.PI*.75)>.2;
  g.fillStyle=k&1?(lit?'#ffffff':c2):(lit?shade(c1,.18):c1);g.beginPath();g.moveTo(x,y);g.arc(x,y,r,a0,a1);g.closePath();g.fill()}
 g.strokeStyle='rgba(10,20,40,.45)';g.lineWidth=1;g.beginPath();g.arc(x,y,r-.5,0,7);g.stroke();
 g.fillStyle='#2b3038';g.fillRect(Math.round(x-1),Math.round(y-1),2,2)}
function hCafe(g,x,y,ang,sc){g.save();g.translate(x,y);g.rotate(ang);if(sc)g.scale(sc,sc);const w=32,h=20;
 g.fillStyle='rgba(16,24,32,.3)';g.fillRect(-w/2+5,-h/2+4,w,h);
 g.fillStyle='#14325a';g.fillRect(-w/2,-h/2,w,h-7);g.fillStyle='#21457a';g.fillRect(-w/2+1,-h/2+1,w-2,h-10);g.fillStyle='#e8eef5';g.fillRect(-w/2,-h/2,w,1);
 g.fillStyle='#8a939b';g.fillRect(-w/2+4,-h/2+3,5,4);g.fillStyle='#4f86c6';g.fillRect(w/2-9,-h/2+3,5,4);// rooftop unit and tank
 for(let k=0;k<w;k+=4){g.fillStyle=(k/4)&1?'#f4f6fa':'#2f6fd0';g.fillRect(-w/2+k,h/2-7,4,6)}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-w/2,h/2-1,w,1);// the striped awning over the counter
 g.restore()}
function hDecor(g){
 if(H_THEME==='harbor')for(const p of hSpots()){if(p.kind==='cafe')hCafe(g,p.x,p.y,p.ang,p.sc);else hParasol(g,p.x,p.y,p.col,p.sc)}
 // the wall: club and sponsor boards painted on the pads, distances at the poles, the gaps and dead centre
 const wallAt=th=>fenceDist(th)-4.6;// the middle of the padded face, just inside the fence
 g.save();g.textAlign='center';g.textBaseline='middle';
 const paint=(th,txt,col,font)=>{const p=hW(th,wallAt(th));g.save();g.translate(p.x,p.y);g.rotate(th*RAD);g.font=font;g.fillStyle='rgba(0,0,0,.35)';g.fillText(txt,1,1);g.fillStyle=col;g.fillText(txt,0,0);g.restore()};
 const ADS=H_THEME==='fortress'?F_ADS:H_THEME==='steel'?S_ADS:H_THEME==='brick'?B_ADS:H_THEME==='orbit'?O_ADS:H_THEME==='mudung'?M_ADS:H_THEME==='bread'?D_ADS:H_ADS;[-36,-30,-15,-8,8,15,30,36].forEach((th,i)=>{const[t,c]=ADS[i%ADS.length];paint(th,t,c,/[A-Z]/.test(t)?'bold 12px "Pixelify Sans", monospace':'14px Jua, sans-serif')});
 [[-42.5,DIMS[0]],[-22,DIMS[1]],[0,DIMS[2]],[22,DIMS[3]],[42.5,DIMS[4]]].forEach(([th,v])=>paint(th,v+'',H_THEME==='fortress'?'#ffd23f':H_THEME==='steel'?'#e2b93a':H_THEME==='brick'?'#ffcc48':H_THEME==='orbit'?'#f4f1f8':H_THEME==='mudung'?'#ffd23f':H_THEME==='bread'?'#f4ead8':'#ffffff','bold 15px "Pixelify Sans", monospace'));
 g.restore();
 if(H_THEME!=='harbor'){(H_THEME==='steel'?sDecor:H_THEME==='brick'?bDecor:H_THEME==='orbit'?oDecor:H_THEME==='mudung'?mDecor:H_THEME==='bread'?djDecor:fDecor)(g);return}
 // benches facing the water round the cove, and lamp posts
 for(let a=-180;a<180;a+=5.5){const ar=a*RAD,R=hCoveR(H_COVE_C.x+Math.sin(ar),H_COVE_C.y+Math.cos(ar))+15.5,x=H_COVE_C.x+Math.sin(ar)*R,y=H_COVE_C.y+Math.cos(ar)*R;if(!hEastLand(x,y))continue;
  const p={x:HX+x/FT,y:HY-y/FT};g.save();g.translate(p.x,p.y);g.rotate(-ar+Math.PI/2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-6,1,13,4);g.fillStyle='#8a5a32';g.fillRect(-7,-2,14,3);g.fillStyle='#a8743f';g.fillRect(-7,-2,14,1);g.restore()}
 for(const L of hLamps()){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(L.x+1,L.y+1,4,2);g.fillStyle='#2b3038';g.fillRect(L.x-1,L.y-1,3,3);g.fillStyle='#e8e2c8';g.fillRect(L.x,L.y,1,1)}}
// ---- night: the promenade and terrace lamps, the cafes, and their light on the cove, laid over the finished frame ----
let H_NL=null,H_NL_K='';
function drawHarborLights(c,vx0,vy0,scale,now){if(!ST||!ST.harbor||!S.night||S.phase==='title')return;const key=DIMS.join(',');
 if(!H_NL||H_NL_K!==key){H_NL_K=key;const Ls=hLamps(),x0=Math.min(...Ls.map(l=>l.x))-80,y0=Math.min(...Ls.map(l=>l.y))-80,x1=Math.max(...Ls.map(l=>l.x))+80,y1=Math.max(...Ls.map(l=>l.y))+120;
  const cv=document.createElement('canvas'),S2=.5;cv.width=Math.ceil((x1-x0)*S2);cv.height=Math.ceil((y1-y0)*S2);const g=cv.getContext('2d');g.scale(S2,S2);g.translate(-x0,-y0);
  const glow=(x,y,r,col,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
  for(const L of Ls){glow(L.x,L.y,L.k==='cove'?46:34,'255,206,140',.3);glow(L.x,L.y,7,'255,240,200',.8);
   if(L.k==='cove'){// its reflection: a broken column of light on the water toward the cove's centre
    const dx=-Math.sin(L.a),dy=Math.cos(L.a);for(let k=1;k<9;k++){const w=10-k;g.fillStyle=`rgba(255,214,150,${.32-k*.03})`;g.fillRect(L.x+dx*(14+k*9)-w/2+((k*5)%3-1)*2,L.y+dy*(14+k*9),w,2)}}}
  // cafe windows along the cove boardwalk
  for(const p of hSpots())if(p.kind==='cafe')glow(p.x,p.y,44,'255,184,100',.34);else glow(p.x,p.y,16,'255,214,150',.14)
  H_NL={cv,x0,y0,x1,y1}}
 const N=H_NL;c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.globalCompositeOperation='lighter';c.drawImage(N.cv,N.x0,N.y0,N.x1-N.x0,N.y1-N.y0);
 // the lighthouse lamp turning: a soft cone sweeping slowly round the breakwater (one turn every 9 seconds)
 {const[lx,ly]=H_JETTY[H_JETTY.length-1],L={x:HX+lx/FT,y:HY-ly/FT},a=now/9000*Math.PI*2,R=520,sp=.2;
  if(!H_BEAM){H_BEAM=document.createElement('canvas');H_BEAM.width=H_BEAM.height=256;const q=H_BEAM.getContext('2d'),gr=q.createRadialGradient(128,128,4,128,128,128);
   gr.addColorStop(0,'rgba(255,246,210,.3)');gr.addColorStop(.35,'rgba(255,240,200,.1)');gr.addColorStop(1,'rgba(255,240,200,0)');q.fillStyle=gr;q.fillRect(0,0,256,256)}
  c.save();c.translate(L.x,L.y);c.rotate(a);c.beginPath();c.moveTo(0,0);c.arc(0,0,R,-sp,sp);c.closePath();c.clip();c.drawImage(H_BEAM,-R,-R,R*2,R*2);c.restore();
  // the beam's back side, fainter, and the lamp itself flaring as the beam faces the camera
  c.save();c.translate(L.x,L.y);c.rotate(a+Math.PI);c.beginPath();c.moveTo(0,0);c.arc(0,0,R*.35,-sp*.8,sp*.8);c.closePath();c.clip();c.globalAlpha=.5;c.drawImage(H_BEAM,-R*.35,-R*.35,R*.7,R*.7);c.restore();
  const fl=.55+.45*Math.max(0,Math.cos(a-Math.PI/2)),gr=c.createRadialGradient(L.x,L.y,0,L.x,L.y,26);gr.addColorStop(0,`rgba(255,250,220,${.55*fl})`);gr.addColorStop(1,'rgba(255,250,220,0)');c.fillStyle=gr;c.fillRect(L.x-26,L.y-26,52,52)}
 c.restore()}
let H_BEAM=null;
// ---- the Ulsan city: each block is laid out as one designed piece (an apartment complex, a commercial building, a
// school, a park, a market street, or a row of shop houses), with sidewalks, consistent shadows and rooftop plant ----
const H_CITYN={apt:0,school:0,park:0,com:0};
function hCityBlock(g,x0,y0,x1,y1,night,rr){const w=x1-x0,h=y1-y0,R=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh))};
 const SH=night?'rgba(0,0,0,.45)':'rgba(20,28,36,.3)';
 R(x0-2,y0-2,w+4,h+4,night?'#22252a':'#c9c6be');// sidewalk
 const bld=(x,y,ww,hh,roof,ht,opt={})=>{if(night)roof=shade(roof,-.68);R(x+ht,y+ht*.75,ww,hh,SH);R(x,y,ww,hh,shade(roof,-.22));R(x+1,y+1,ww-2,hh-2,roof);R(x+1,y+1,ww-2,1,shade(roof,.15));
  if(!night){const n=1+((ww*hh)/260|0);for(let k=0;k<Math.min(n,4);k++){const ax=x+3+rr()*(ww-8),ay=y+3+rr()*(hh-7);R(ax,ay,3,2,'#8a9096');R(ax+1,ay+2,3,1,'rgba(0,0,0,.25)')}
   if(opt.tank&&ww>10){R(x+ww-7,y+3,4,4,'#4f86c6');R(x+ww-6,y+4,2,1,'#9fd0f0')}}
  else{for(let yy=y+2;yy<y+hh-1;yy+=3)for(let xx=x+2;xx<x+ww-1;xx+=3)if(rr()<(opt.lit||.3))R(xx,yy,1,1,rr()<.85?'#ffd98a':'#bfe3ff')}};
 const C=H_CITYN;let v=(vHash(x0|0,y0|0)%1000)/1000;const big=w>70&&h>60;v=v<.26?.1:v<.38?.4:v<.44?.55:v<.54?.64:.8;if(v===.55&&C.school>=2)v=.8;if(v===.64&&C.park>=8)v=.8;if(v===.1&&C.apt>=16)v=.8;if(v===.4&&C.com>=12)v=.8;
 if(big&&v<.32){// an apartment complex: tall slabs in parallel rows, numbered on the roof, parking and a playground between
  C.apt++;R(x0,y0,w,h,night?'#242a24':'#9fc48a');const horiz=w>=h,n=Math.max(2,Math.floor((horiz?h:w)/26));
  for(let k=0;k<n;k++){const t=(horiz?h:w)/n,o=k*t+4;const bw=horiz?w-14:t-12,bh=horiz?t-12:h-14,bx=horiz?x0+7:x0+o,by=horiz?y0+o:y0+7;
   bld(bx,by,bw,bh,['#ece9e2','#e4e8ec','#f0ebe0'][k%3],7,{lit:.45});if(night)continue;if(!night){R(bx+2,by+bh/2-1,bw-4,2,['#5aa0e6','#3faa8a','#e0915a'][(k+((x0*7)|0))%3]);g.fillStyle='#5a6470';g.font='6px "Pixelify Sans", monospace';g.textAlign='left';g.textBaseline='top';g.fillText(String(101+k),bx+3,by+2)}}
  if(!night){R(x0+w-18,y0+h-14,14,10,'#d8b070');R(x0+w-15,y0+h-12,3,3,'#e0473d');R(x0+w-9,y0+h-10,3,3,'#3f82e6')}return}
 if(big&&v<.5){// a department store / office podium with a tower rising from it, a helipad and a sign on top
  C.com++;const px=x0+4,py=y0+4,pw=w-8,ph=h-8;bld(px,py,pw,ph,'#b9bec4',5,{lit:.25});
  const tw=pw*.45,th=ph*.5,tx=px+pw*.12,ty=py+ph*.18;bld(tx,ty,tw,th,'#7c8fa8',16,{lit:.5,tank:true});
  if(!night){g.strokeStyle='#e8e4dc';g.lineWidth=1;g.beginPath();g.arc(tx+tw*.6,ty+th*.55,Math.min(tw,th)*.25,0,7);g.stroke();g.fillStyle='#e8e4dc';g.font='bold 7px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('H',tx+tw*.6,ty+th*.55)}
  R(px+pw*.62,py+ph*.62,pw*.32,ph*.3,night?'#2b2f36':'#8d939a');return}
 if(big&&v<.6){// a school: the building along one side and a dirt yard with a running track
  C.school++;R(x0,y0,w,h,night?'#2a2620':'#c9a878');const yw=w-12,yh=h*.55;g.strokeStyle=night?'#4a3a30':'#e8e4dc';g.lineWidth=1.2;g.beginPath();g.roundRect(x0+6,y0+h-yh-4,yw,yh,yh/2);g.stroke();
  R(x0+12,y0+h-yh*.62-4,yw-12,1,night?'#4a3a30':'#e8e4dc');bld(x0+6,y0+5,w-12,h*.28,'#e8d8b8',8,{lit:.2,tank:true});return}
 if(v<.68&&w>36&&h>30){// a pocket park: lawn, a looping path, trees, a pavilion
  C.park++;R(x0,y0,w,h,night?'#1d2a1d':'#7cb85c');g.strokeStyle=night?'#3a3a36':'#e0d6bc';g.lineWidth=3;g.beginPath();g.ellipse(x0+w/2,y0+h/2,w*.32,h*.3,0,0,7);g.stroke();
  for(let k=0;k<Math.max(4,(w*h)/260|0);k++){const tx=x0+4+rr()*(w-8),ty=y0+4+rr()*(h-8);if(rr()<.45)hBlossom(g,tx,ty,4,night);else hGreenTree(g,tx,ty,4.5,night)}
  return}
 // otherwise a street of shop houses: a row of buildings of varied widths and heights round the edge, a lane through the middle
 const roofs=night?['#2b3038','#323840','#2a2e34','#363b42']:['#d9d5ca','#b9b6ae','#c9c4b8','#e4e1d8','#8fa3b5','#a8b39a','#b5654a','#cfc6b0','#9aa3ab','#6f8fa8'];
 const lane=h>w?null:y0+h/2;
 for(let row=0;row<2;row++){let x=x0;const ry=row?(lane?lane+2:y0+h/2+1):y0,rh=(lane?h/2-2:h/2-1);
  while(x<x1-6){const bw=Math.min(x1-x,10+rr()*20|0),bh=rh*(.7+rr()*.3);bld(x,row?ry+rh-bh:ry,bw-2,bh,roofs[(rr()*roofs.length)|0],2+rr()*6,{tank:rr()<.5,lit:.4});
   if(!night&&rr()<.35)R(x+1,row?ry-1:ry+bh,bw-4,1.5,['#e0473d','#3f82e6','#f5c935','#3faa5b'][(rr()*4)|0]);// a shop awning
   x+=bw}}
 if(lane){R(x0,lane-1,w,3,night?'#1e2126':'#8d8a84')}}
