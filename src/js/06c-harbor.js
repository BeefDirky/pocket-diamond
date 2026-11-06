// ---------- Ulsan: a harbor park. The outfield opens onto the sea, a pier with a lighthouse runs out from right field,
// the shipyard fills the shore to the left, and the city wraps the rest of the bowl, with the main gate behind home ----------
// Like the Jeju country, the water and the outfield ring are one pure function of world position (harborCol), shared by
// the park buffer and the neighborhood layer so they meet without a seam.
const HC=(()=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];return{
 sea:h('#1d5f8f'),sea2:h('#174f78'),wave:h('#7fbfe3'),shal:h('#2a7fae'),foam:h('#d8eef8'),
 wallTop:h('#8a939b'),riser:h('#26323b'),aisle:h('#4d5761'),conc:h('#b8bec4'),conc2:h('#aeb4ba'),edge:h('#e2e6ea'),edgeD:h('#4a545e'),pole:h('#2b3038'),
 deck:h('#c9a77a'),deck2:h('#b8956a'),rail:h('#f1f1ee'),tetra:h('#9aa3ad'),tetra2:h('#7d8790'),tetraD:h('#5b646d'),
 yard:h('#9aa1a8'),yard2:h('#90979e'),yline:h('#e8d27a'),quay:h('#c9ced3')}})();
let H_SEAT=false;// set by harborCol when the pixel is a seat (so the crowd can fill it)
// the shoreline (feet): the sea comes in above the stadium, lower down on the right; the shipyard holds the left shore
function hSea(x,y){if(x<-360)return false;if(x<-300&&y<540+(-300-x)*9)return false;return y>Math.max(540-Math.max(0,x-150)*1.25,120)}
function hYard(x,y){return x<-330&&y>430}
// the pier: a curved boardwalk out from the right-field corner, hooking round to a breakwater with a lighthouse
const H_PIER=(()=>{const P=[];const b=(t,a,c,d,e)=>{const u=1-t;return u*u*u*a+3*u*u*t*c+3*u*t*t*d+t*t*t*e};// cubic, in feet
 for(let k=0;k<=48;k++){const t=k/48;P.push([b(t,300,390,500,450),b(t,345,440,520,585)])}return P})();
const H_BREAK={x:445,y:615,r:38};
function hPierD(x,y){if(x<260||y<350)return 1e9;let m=1e9;for(let k=0;k<H_PIER.length-1;k++){const[ax,ay]=H_PIER[k],[bx,by]=H_PIER[k+1],vx=bx-ax,vy=by-ay,t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy),0,1),d=Math.hypot(x-ax-vx*t,y-ay-vy*t);if(d<m)m=d}return m}
function hSeaCol(x,y,wx,wy){const w=Math.sin(x*.11+Math.sin(y*.05)*2.2)+Math.sin(y*.23+x*.02);
 const db=Math.hypot(x-H_BREAK.x,y-H_BREAK.y)-H_BREAK.r;if(db<8&&db>=0)return ((Math.floor(wx/3)+Math.floor(wy/3))&3)===0?HC.foam:HC.shal;
 return w>1.35?HC.wave:w<-1.1?HC.sea2:HC.sea}
// returns a colour for harbor ground, or null where the city carries on
function harborCol(wx,wy){H_SEAT=false;const x=(wx-HX)*FT,y=(HY-wy)*FT,r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th);
 const n=vHash(Math.floor(wx/3),Math.floor(wy/3));
 // the breakwater and its tetrapods, and the pier deck
 {const db=Math.hypot(x-H_BREAK.x,y-H_BREAK.y);if(db<H_BREAK.r){const t=vHash(Math.floor(wx/7),Math.floor(wy/7));if(db<H_BREAK.r-30)return (n&3)===0?HC.conc2:HC.conc;return (t&3)===0?HC.tetraD:(t&3)===1?HC.tetra2:HC.tetra}}
 const pd=hPierD(x,y);if(pd<12){if(pd>10.5)return HC.rail;const p=vPerson(wx,wy,9);if(p)return p;return (Math.floor(wy/4)+Math.floor(wx/9))&1?HC.deck:HC.deck2}
 // the outfield ring: bleachers behind the wall, a concourse with flags, the sea wall, then water
 if(y>0&&ath<ST.openTop){const fd=fenceDist(th),q=r-fd;if(q>=4){const pv=vPav(),d=Math.hypot(x,y-pv.cy)-pv.R+22,s=Math.atan2(x,y-pv.cy)*pv.R;
   if(q<10)return HC.wallTop;
   if(d<0){if(((s%44)+44)%44<3.2)return HC.aisle;const rq=(q-10)%3.2;if(rq<.7)return HC.riser;H_SEAT=true;return Math.floor((q-10)/3.2)&1?vRGB(ST.seat[0]):vRGB(ST.seat[1])}
   if(d<8+Math.max(0,ath-22)*4.5){const m=((s%26)+26)%26;if(d>4&&d<5.2&&m<1.2)return HC.pole;if(d>1.2&&d<4&&m>=1.2&&m<4.6)return Math.floor(s/26)&1?vRGB('#2f6fd0'):HC.edge;// flags
    const p=vPerson(wx,wy,8);if(p)return p;return (Math.floor(s/3)+Math.floor(d/3))&1?HC.conc:HC.conc2}
   if(d<10)return d<9?HC.edge:HC.edgeD;
   return hSeaCol(x,y,wx,wy)}}
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
  const cc=['#d23a2e','#3f82e6','#f5c935','#3faa5b','#ef6a1f','#9aa5ae'];for(let i=0;i<7;i++)for(let j=0;j<3;j++){const a=P(-470+i*15,600-j*16);g.fillStyle=cc[(i*3+j*5)%6];g.fillRect(a.x,a.y,6,5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x,a.y+4,6,1)}}
 {const sh=[[-760,700,140,70],[-760,600,120,50],[-640,470,80,40]];for(const[x,y,w,h]of sh){const a=P(x,y),b=P(x+w,y-h);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x+4,a.y+3,b.x-a.x,b.y-a.y);g.fillStyle='#4a6f96';g.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);g.fillStyle='#5a82ad';for(let q=2;q<b.x-a.x-2;q+=4)g.fillRect(a.x+q,a.y+2,2,b.y-a.y-4)}
  const cc=['#d23a2e','#3f82e6','#f5c935','#3faa5b','#ef6a1f','#9aa5ae'];for(let i=0;i<10;i++)for(let j=0;j<4;j++){const a=P(-610+i*14,760-j*14);g.fillStyle=cc[(i*7+j*3)%6];g.fillRect(a.x,a.y,6,5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(a.x,a.y+4,6,1)}
  // a car carrier moored along the quay
  {const a=P(-318,690),b=P(-262,470),X=a.x,Y=a.y,Wd=b.x-a.x,Hd=b.y-a.y;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+3,Y+4,Wd,Hd);g.fillStyle='#8f2a24';g.beginPath();g.moveTo(X,Y+10);g.lineTo(X+Wd/2,Y);g.lineTo(X+Wd,Y+10);g.lineTo(X+Wd,Y+Hd);g.lineTo(X,Y+Hd);g.closePath();g.fill();
   g.fillStyle='#e8e4dc';g.fillRect(X+2,Y+10,Wd-4,Hd-14);g.fillStyle='#c9c4b8';for(let q=Y+14;q<Y+Hd-6;q+=6)g.fillRect(X+3,q,Wd-6,1);g.fillStyle='#2a3a5a';g.fillRect(X+3,Y+Hd-14,Wd-6,9);g.fillStyle='#ffd98a';g.fillRect(X+5,Y+Hd-12,Wd-10,1)}}
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
  if(LOGO[k]){g.imageSmoothingEnabled=false;g.drawImage(LOGO[k],gx-11,gy-20,22,22)}
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
 band(26,32);g.fillStyle='rgba(0,0,0,.22)';g.fill();// the roof's shadow on the seats
 band(0,26);g.fillStyle=night?'#3a4048':'#d3d9df';g.fill();
 g.strokeStyle=night?'#2e343b':'#b3bbc4';g.lineWidth=1;g.beginPath();let acc=0;
 for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],L=Math.hypot(b.x-a.x,b.y-a.y);for(let t=(8-acc)/L;t<1;t+=8/L){const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},p=inw(q,26);g.moveTo(q.x,q.y);g.lineTo(p.x,p.y)}acc=(acc+L)%8}g.stroke();
 g.strokeStyle=night?'#4a525c':'#eef1f4';g.lineWidth=2;g.beginPath();C.forEach((q,i)=>{const p=inw(q,25);g[i?'lineTo':'moveTo'](p.x,p.y)});g.stroke();
 // banners on the facade, just outside the wall
 acc=0;for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],L=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);for(let t=(26-acc)/L;t<1;t+=26/L){const q={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},p=inw(q,-5);
   g.save();g.translate(p.x,p.y);g.rotate(ang);g.fillStyle='#14325a';g.fillRect(-6,-3,12,6);g.fillStyle='#2f6fd0';g.fillRect(-5,-2,10,4);g.fillStyle='#e8f2ff';g.fillRect(-4,0,3,1);g.fillRect(-1,-1,3,1);g.fillRect(2,0,2,1);g.restore()}acc=(acc+L)%26}}
// night lights on the shore: the lighthouse lamp and the glow under the main gate's arch
function drawHarborGlow(g,cx,cy,OL){const P=(xf,yf)=>({x:cx(HX+xf/FT),y:cy(HY-yf/FT)});g.save();g.globalCompositeOperation='lighter';
 {const a=P(H_BREAK.x+10,H_BREAK.y+8),gr=g.createRadialGradient(a.x,a.y,0,a.x,a.y,26);gr.addColorStop(0,'rgba(255,240,180,.55)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.fillRect(a.x-26,a.y-26,52,52);g.fillStyle='#fff4c0';g.fillRect(a.x-1,a.y-1,2,2)}
 {const tip=OL.reduce((m,q)=>q.y>m.y?q:m,OL[0]),gx=cx(HX),gy=tip.y+4,gr=g.createRadialGradient(gx,gy+10,0,gx,gy+10,70);gr.addColorStop(0,'rgba(255,220,160,.35)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(gx-70,gy-60,140,140)}
 g.restore()}
