// ---------- Ulsan: a harbor park. The outfield opens onto the sea, a pier with a lighthouse runs out from right field,
// the shipyard fills the shore to the left, and the city wraps the rest of the bowl, with the main gate behind home ----------
// Like the Jeju country, the water and the outfield ring are one pure function of world position (harborCol), shared by
// the park buffer and the neighborhood layer so they meet without a seam.
const HC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 sea:h('#1d5f8f'),sea2:h('#174f78'),wave:h('#7fbfe3'),shal:h('#2a7fae'),foam:h('#d8eef8'),
 wallTop:h('#8a939b'),riser:h('#26323b'),aisle:h('#4d5761'),conc:h('#b8bec4'),conc2:h('#aeb4ba'),edge:h('#e2e6ea'),edgeD:h('#4a545e'),pole:h('#2b3038'),
 deck:h('#c9a77a'),deck2:h('#b8956a'),rail:h('#f1f1ee'),tetra:h('#9aa3ad'),tetra2:h('#7d8790'),tetraD:h('#5b646d'),
 yard:h('#9aa1a8'),yard2:h('#90979e'),yline:h('#e8d27a'),quay:h('#c9ced3')}})();
let H_SEAT=false;
// ---- the park's footprint: which ground past the playing field belongs to the waterfront (in feet) ----
// The wall opens from left-centre round to the right-field pole; past the right-field line the grandstand is cut back
// more and more toward the pole, so the water reaches in along first base. Left field keeps its full grandstand.
const H_OL=-22,H_OR=45;
function hRDepth(al){return al<185?1e9:al<330?Math.max(40,114-(al-185)*.5):Math.max(-40,41.5-(al-330)*2.2)}// past the pole the stands run out altogether
// past the trimmed right-field stands (feet beyond their back wall), or -1
function hRCut(x,y){if(x<=0||y<-60)return -1;const al=(x+y)/Math.SQRT2;if(al<185)return -1;return (x-y)/Math.SQRT2-40-hRDepth(al)}
// the right half of the bowl's outer wall, following the cut (world px, for the outline)
function hRightHalf(){const Pt=(al,pe)=>{const x=(al+pe)/Math.SQRT2,y=(al-pe)/Math.SQRT2;return[x/FT,HY-y/FT]},out=[[0,HY+580],Pt(185,154)];
 for(let al=205;al<=405;al+=25)out.push(Pt(al,40+hRDepth(al)+26));out.push([1000,HY-820],[430,-150],[172,-200]);return out}
function hOwn(x,y,th,r,fd){if(y>0&&th>H_OL&&th<H_OR&&r>=fd+4)return 1;
 if(th>=H_OR){const d=hRCut(x,y);if(d>0&&d<26)return 2}return 0}
// how deep the centre-field bleachers run: deepest left of centre, gone by right-centre
function hCfDepth(th){return th<-4?34:th<12?34*(12-th)/16:0}
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
// the shoreline (feet): the sea comes in above the stadium, lower down on the right; the shipyard holds the left shore
function hSea(x,y){if(x>0&&y>-40+26*Math.sin(x*.021)&&hRCut(x,y)>=26)return true;if(x<-360)return false;if(x<-300&&y<540+(-300-x)*9)return false;return y>Math.max(540-Math.max(0,x-150)*1.25,-300)}
function hYard(x,y){return x<-330&&y>430}
// the pier: a curved boardwalk out from the right-field corner, hooking round to a breakwater with a lighthouse
const H_PIER=(()=>{const P=[];const b=(t,a,c,d,e)=>{const u=1-t;return u*u*u*a+3*u*u*t*c+3*u*t*t*d+t*t*t*e};// cubic, in feet
 for(let k=0;k<=48;k++){const t=k/48;P.push([b(t,204,250,370,430),b(t,326,430,520,582)])}return P})();
const H_BREAK={x:445,y:615,r:38};
function hPierD(x,y){if(x<180||y<300)return 1e9;let m=1e9;for(let k=0;k<H_PIER.length-1;k++){const[ax,ay]=H_PIER[k],[bx,by]=H_PIER[k+1],vx=bx-ax,vy=by-ay,t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1),d=Math.hypot(x-ax-vx*t,y-ay-vy*t);if(d<m)m=d}return m}
// which side of the pier a point is on (>0: the stadium side), and how far from it
function hPierSide(x,y){let m=1e9,sd=0;for(let k=0;k<H_PIER.length-1;k++){const[ax,ay]=H_PIER[k],[bx,by]=H_PIER[k+1],vx=bx-ax,vy=by-ay,t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1),d=Math.hypot(x-ax-vx*t,y-ay-vy*t);if(d<m){m=d;sd=vx*(y-ay)-vy*(x-ax)}}return sd}
const H_SEA=['#174f78','#1b5f8a','#1f6d98','#2a7fae'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]),
 H_COVE=['#2592a8','#2aa3b6','#36b3c2','#48c3cc'].map(x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]),
 H_HI=[143,208,234],H_HIC=[200,240,242];
const H_DITH=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// calm water: broad swells in four tones, and short glints of light along the wave crests; the cove inside the pier
// is shallower and turquoise, fading out through the mouth to the open sea
function hSeaCol(x,y,wx,wy){const X=Math.floor(wx),Y=Math.floor(wy),dith=H_DITH[(Y&3)*4+(X&3)]/16;
 const db=Math.hypot(x-H_BREAK.x,y-H_BREAK.y)-H_BREAK.r;if(db<6&&db>=0)return ((X>>1)+(Y>>1))%3===0?HC.foam:H_COVE[3];
 let cove=0;{const dc=Math.hypot(x-330,y-440);if(dc<210&&x>110){cove=clamp((190-dc)/110,0,1);if(cove>0&&hPierSide(x,y)<0)cove=0}}
 const sw=Math.sin(x*.045+Math.sin(y*.03)*1.6)+.6*Math.sin(y*.07-x*.02)+.35*Math.sin((x+y)*.11);// -2..2
 const lv=clamp(Math.floor((sw+2)/4*4+dith-.5),0,3);
 const v=y*.8+3.2*Math.sin(x*.06)+2*Math.sin(x*.021+y*.04),crest=((v%14)+14)%14<.7&&Math.sin(x*.13+y*.05)>.93&&Math.sin(x*.031-y*.017)>.2;
 const useC=cove>dith;if(crest)return useC?H_HIC:H_HI;return useC?H_COVE[lv]:H_SEA[lv]}
// returns a colour for harbor ground, or null where the city carries on
function harborCol(wx,wy){H_SEAT=false;const x=(wx-HX)*FT,y=(HY-wy)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th);
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3));
 // the breakwater and its tetrapods, and the pier deck
 {const db=Math.hypot(x-H_BREAK.x,y-H_BREAK.y);if(db<H_BREAK.r){const t=vHash(Math.floor(wx/7),Math.floor(wy/7));if(db<H_BREAK.r-30)return (n&3)===0?HC.conc2:HC.conc;return (t&3)===0?HC.tetraD:(t&3)===1?HC.tetra2:HC.tetra}}
 const pd=hPierD(x,y);if(pd<12){if(pd>10.5)return HC.rail;const p=vPerson(wx,wy,9);if(p)return p;return (Math.floor(wy/4)+Math.floor(wx/9))&1?HC.deck:HC.deck2}
 // the harbor's own ground: the open arc past the outfield wall, and the waterfront past the trimmed right-field stands
 const fd=y>0?fenceDist(th):0,own=hOwn(x,y,th,r,fd);
 if(own===1){const q=r-fd,s2=r*th*RAD;
  if(r*(th-H_OL)*RAD<3.5)return HC.edgeD;// end wall of the left-field grandstand
  if(q<8)return HC.wallTop;
  const dep=hCfDepth(th);
  if(dep>0&&q<8+dep){// the compact centre-field bleachers
   if(((s2%40)+40)%40<3)return HC.aisle;const rq=(q-8)%3.2;if(rq<.7)return HC.riser;H_SEAT=true;return hSeat(th*4,Math.floor((q-8)/3.2),false)}
  if(dep>0&&q<8+dep+9){const d=q-8-dep,m=((s2%26)+26)%26;// terrace behind the bleachers, flags along its back rail
   if(d>6&&d<7.2&&m<1.2)return HC.pole;if(d>3.6&&d<6.2&&m>=1.2&&m<4.6)return Math.floor(s2/26)&1?vRGB('#2f6fd0'):HC.edge;
   const p=vPerson(wx,wy,8);if(p)return p;return (Math.floor(s2/3)+Math.floor(d/3))&1?HC.conc:HC.conc2}
  if(dep>0&&q<8+dep+11)return q<8+dep+10?HC.edge:HC.edgeD;// sea wall
  if(dep<=0){// right field: the boardwalk right behind the wall, then the water (the splash zone)
   const qa=(th>26&&th<44)?19:8;if(q<qa)return HC.wallTop;const d=q-qa;
   if(d<20)return hBoard(wx,wy,s2,d,20);
   if(d<21.6)return HC.rail}
  if(hYard(x,y))return HC.yard;return hSeaCol(x,y,wx,wy)}
 if(own===2){const al=(x+y)/Math.SQRT2,d=hRCut(x,y);
  if(d<3)return HC.edgeD;// the trimmed grandstand's back wall
  if(d<24)return hBoard(wx,wy,al,d-3,21);
  if(d<25.6)return HC.rail;
  return hSeaCol(x,y,wx,wy)}
 if(hYard(x,y)){// the shipyard apron: concrete with yellow lane lines, the quay edge along the water
  if(x>-336)return HC.quay;if(((Math.floor(wy)%60)+60)%60<1.2)return HC.yline;return (n&7)===0?HC.yard2:HC.yard}
 if(hSea(x,y))return hSea(x-3,y-3)&&hSea(x+3,y-3)&&hSea(x-3,y+3)?hSeaCol(x,y,wx,wy):HC.edge;// a pale sea wall along the shore
 return null}
// the canvas-drawn pieces on this layer (half resolution): the shipyard's sheds and stacks, the lighthouse, the main gate
// plaza behind home, the roof over the bowl and the banners on its facade
function drawHarbor(g,k,night,CW,CH,cx,cy,OL,e){const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)});
 // ---- shipyard sheds and container stacks ----
 {const sheds=[[-600,520,110,60],[-600,620,90,52],[-470,690,120,48]];for(const[x,y,w,h]of sheds){const a=P(x,y),b=P(x+w,y-h);const X=a.x,Y=a.y,Wd=b.x-a.x,Hd=b.y-a.y;
   g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X+4,Y+3,Wd,Hd);g.fillStyle='#2f5f96';g.fillRect(X,Y,Wd,Hd);g.fillStyle='#3a72ae';for(let q=2;q<Wd-2;q+=4)g.fillRect(X+q,Y+2,2,Hd-4);g.fillStyle='#e8ecef';g.fillRect(X,Y,Wd,1.5)}
  const cc=['#d23a2e','#3f82e6','#f5c935','#3faa5b','#ef6a1f','#9aa5ae'];for(let i=0;i<12;i++)for(let j=0;j<6;j++){const a=P(-470+i*8,600-j*6);g.fillStyle=cc[vHash(i,j+9)%6];g.fillRect(a.x,a.y,5,3);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x,a.y+2,5,1)}}
 {const sh=[[-760,700,140,70],[-760,600,120,50],[-640,470,80,40]];for(const[x,y,w,h]of sh){const a=P(x,y),b=P(x+w,y-h);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x+4,a.y+3,b.x-a.x,b.y-a.y);g.fillStyle='#4a6f96';g.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);g.fillStyle='#5a82ad';for(let q=2;q<b.x-a.x-2;q+=4)g.fillRect(a.x+q,a.y+2,2,b.y-a.y-4)}
  const cc=['#d23a2e','#3f82e6','#f5c935','#3faa5b','#ef6a1f','#9aa5ae'];for(const[bx,by]of[[-640,790],[-500,790]])for(let i=0;i<14;i++)for(let j=0;j<7;j++){const a=P(bx+i*8,by-j*6);g.fillStyle=cc[vHash(i+bx,j)%6];g.fillRect(a.x,a.y,5,3);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x,a.y+2,5,1)}
  // a car carrier moored along the quay
  {const a=P(-318,690),b=P(-262,470),X=a.x,Y=a.y,Wd=b.x-a.x,Hd=b.y-a.y;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+3,Y+4,Wd,Hd);g.fillStyle='#8f2a24';g.beginPath();g.moveTo(X,Y+10);g.lineTo(X+Wd/2,Y);g.lineTo(X+Wd,Y+10);g.lineTo(X+Wd,Y+Hd);g.lineTo(X,Y+Hd);g.closePath();g.fill();
   g.fillStyle='#e8e4dc';g.fillRect(X+2,Y+10,Wd-4,Hd-14);g.fillStyle='#c9c4b8';for(let q=Y+14;q<Y+Hd-6;q+=6)g.fillRect(X+3,q,Wd-6,1);g.fillStyle='#2a3a5a';g.fillRect(X+3,Y+Hd-14,Wd-6,9);g.fillStyle='#ffd98a';g.fillRect(X+5,Y+Hd-12,Wd-10,1)}}
 // ---- the pier's lamps and flags, and boats: moored in the cove, a few out at sea ----
 for(let k=2;k<H_PIER.length-1;k+=3){const[ax,ay]=H_PIER[k],[bx,by]=H_PIER[k+1],l=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/l,ny=(bx-ax)/l;
  for(const sd of[-1,1]){const p=P(ax+nx*sd*10,ay+ny*sd*10);g.fillStyle='#2b3038';g.fillRect(p.x-.5,p.y-.5,1.5,1.5);if(k%6===2){g.fillStyle=sd>0?'#2f6fd0':'#f4f1e8';g.fillRect(p.x+1,p.y-3,3,2)}}}
 const boat=(xf,yf,ang,len,col)=>{const p=P(xf,yf),L=len/FT/4.2;g.save();g.translate(p.x,p.y);g.rotate(ang);g.fillStyle='rgba(10,40,60,.3)';g.beginPath();g.ellipse(2,2,L,L*.32,0,0,7);g.fill();
  g.fillStyle='#f4f1e8';g.beginPath();g.moveTo(-L,-L*.28);g.lineTo(L*.6,-L*.3);g.lineTo(L,0);g.lineTo(L*.6,L*.3);g.lineTo(-L,L*.28);g.closePath();g.fill();g.fillStyle=col;g.fillRect(-L*.4,-L*.18,L*.7,L*.36);g.fillStyle='#bcd8ea';g.fillRect(-L*.1,-L*.12,L*.3,L*.24);g.restore()};
 [[360,520,.6,34,'#2f6fd0'],[395,548,.8,28,'#e0473d'],[330,470,.3,30,'#3f86c4'],[300,560,-.4,26,'#f5c935'],[372,590,1.1,24,'#2f6fd0'],[150,690,-.2,40,'#14325a'],[620,520,1.4,46,'#8f2a24'],[40,760,.1,30,'#2f6fd0']].forEach(b=>boat(...b));
 // a wake behind the boat heading out
 {const p=P(150,690);g.fillStyle='rgba(255,255,255,.5)';for(let k=1;k<7;k++)g.fillRect(p.x-12-k*5,p.y+(k&1?-1:1)*k*.6,3,1)}
 // ---- the lighthouse on the breakwater ----
 {const a=P(H_BREAK.x+10,H_BREAK.y+8);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(a.x+7,a.y+4,7,3,0,0,7);g.fill();g.fillStyle='#d0312d';g.beginPath();g.arc(a.x,a.y,5,0,7);g.fill();g.fillStyle='#f4f1e8';g.fillRect(a.x-5,a.y-1,10,2);g.fillStyle='#2b3038';g.beginPath();g.arc(a.x,a.y,2.2,0,7);g.fill();g.fillStyle=night?'#fff4c0':'#e8e2d0';g.fillRect(a.x-1,a.y-1,2,2);
  if(night){const gr=g.createRadialGradient(a.x,a.y,0,a.x,a.y,26);gr.addColorStop(0,'rgba(255,240,180,.5)');gr.addColorStop(1,'rgba(255,240,180,0)');g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(a.x-26,a.y-26,52,52);g.restore()}}
 // ---- the main gate plaza behind home: wave-patterned paving, the arch, flags and cherry trees ----
 {const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=cx(HX),gy=tip.y+4,R=118;
  g.save();g.beginPath();g.arc(gx,gy,R,0,Math.PI);g.closePath();g.fillStyle=night?'#2a2e36':'#dcdfe2';g.fill();g.clip();
  for(let b=0;b<6;b++){g.strokeStyle=b&1?(night?'#1d3a66':'#3f78c8'):(night?'#3a4a66':'#9cc0e8');g.lineWidth=5;g.beginPath();for(let x=gx-R;x<=gx+R;x+=3){const y=gy+16+b*17+Math.sin((x-gx)*.06+b)*5;x===gx-R?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}
  g.restore();
  // the arch: a navy canopy over the gate, the club's emblem at its crown
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(gx+4,gy+10,44,10,0,0,7);g.fill();
  g.strokeStyle='#14325a';g.lineWidth=9;g.beginPath();g.ellipse(gx,gy+4,40,14,0,Math.PI,0);g.stroke();g.strokeStyle='#2f6fd0';g.lineWidth=2;g.beginPath();g.ellipse(gx,gy+1,40,14,0,Math.PI,0);g.stroke();
  g.fillStyle='#14325a';g.fillRect(gx-42,gy+2,8,8);g.fillRect(gx+34,gy+2,8,8);
  // the glass front of the concourse either side of the gate
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
// the roof over the bowl: light panels cantilevered over the top rows, ribbed, with banners hung on the facade below
function drawHarborRoof(g,night,OL){const C=closedRun(OL),cx0=OL.reduce((s,q)=>s+q.x,0)/OL.length,cy0=OL.reduce((s,q)=>s+q.y,0)/OL.length;
 const inw=(q,o)=>{const dx=cx0-q.x,dy=cy0-q.y,l=Math.hypot(dx,dy)||1;return{x:q.x+dx/l*o,y:q.y+dy/l*o}};
 const band=(o0,o1)=>{g.beginPath();C.forEach((q,i)=>{const p=inw(q,o0);g[i?'lineTo':'moveTo'](p.x,p.y)});for(let i=C.length-1;i>=0;i--){const p=inw(C[i],o1);g.lineTo(p.x,p.y)}g.closePath()};
 band(40,48);g.fillStyle='rgba(0,0,0,.24)';g.fill();// the roof's shadow on the seats
 band(0,40);g.fillStyle=night?'#3e444c':'#e6eaee';g.fill();band(0,6);g.fillStyle=night?'#2e343b':'#c3cad1';g.fill();
 g.strokeStyle=night?'#2e343b':'#b3bbc4';g.lineWidth=1;g.beginPath();let acc=0;
 for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],L=Math.hypot(b.x-a.x,b.y-a.y);for(let t=(10-acc)/L;t<1;t+=10/L){const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},p=inw(q,40);g.moveTo(q.x,q.y);g.lineTo(p.x,p.y)}acc=(acc+L)%10}g.stroke();
 g.strokeStyle=night?'#4a525c':'#eef1f4';g.lineWidth=2;g.beginPath();C.forEach((q,i)=>{const p=inw(q,39);g[i?'lineTo':'moveTo'](p.x,p.y)});g.stroke();
 // banners on the facade, just outside the wall
 acc=0;for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],L=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);for(let t=(30-acc)/L;t<1;t+=30/L){const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},p=inw(q,-7);
   g.save();g.translate(p.x,p.y);g.rotate(ang);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-7,-3,15,9);g.fillStyle='#14325a';g.fillRect(-8,-5,16,9);g.fillStyle='#2f6fd0';g.fillRect(-7,-4,14,7);g.fillStyle='#e8f2ff';g.fillRect(-6,0,4,1);g.fillRect(-2,-1,4,1);g.fillRect(2,0,4,1);g.fillStyle='#9fd8f6';g.fillRect(-6,1,12,1);g.restore()}acc=(acc+L)%30}}
// night lights on the shore: the lighthouse lamp and the glow under the main gate's arch
function drawHarborGlow(g,cx,cy,OL){const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)});g.save();g.globalCompositeOperation='lighter';
 {const a=P(H_BREAK.x+10,H_BREAK.y+8),gr=g.createRadialGradient(a.x,a.y,0,a.x,a.y,26);gr.addColorStop(0,'rgba(255,240,180,.55)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.fillRect(a.x-26,a.y-26,52,52);g.fillStyle='#fff4c0';g.fillRect(a.x-1,a.y-1,2,2)}
 {const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=cx(HX),gy=tip.y+4,gr=g.createRadialGradient(gx,gy+10,0,gx,gy+10,70);gr.addColorStop(0,'rgba(255,220,160,.35)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(gx-70,gy-60,140,140)}
 g.restore()}
