// where the catcher takes the pitch: just in front of him, his mitt reaching left/right and up/down to where it crosses
const CATCH_U=(54+3)/52;
function catchPt(pt){const p1=pitchPos(pt,pt.travel),x=clamp(p1.x,-3.2,3.2),y=-3,h=clamp(p1.h,.8,5.2),q=toPx(x,y),lift=h/FT;return{x,y,h,scr:{x:q.x-lift*.2,y:q.y-lift*.5}}}
// ---------- batting practice rig on the mound: machine, L-screen, ball bucket and a coach feeding it ----------
function drawBPRig(add,now,ph){
 const T=TEAMS[S.you],M=toPx(0,57.5),L=toPx(-2.2,52.5),B=toPx(5.5,58.5),F=toPx(3.6,60.5);
 const k=ph==='windup'&&S.pitch?S.pt/S.pitch.wind:ph==='pitch'?1.2:0;
 // stray balls from earlier rounds
 add(L.y-1,()=>{wg.fillStyle='#f4f1e8';for(const[dx,dy]of[[-22,6],[-17,9],[14,8],[19,3],[-9,12],[25,10]]){wg.fillRect(Math.round(L.x+dx),Math.round(L.y+dy),2,2)}});
 // bucket of balls
 add(B.y,()=>{const x=Math.round(B.x),y=Math.round(B.y);wg.fillStyle='rgba(6,18,10,.3)';wg.fillRect(x-5,y,11,2);
  wg.fillStyle='#e87a1e';wg.fillRect(x-4,y-9,9,9);wg.fillStyle='#c4611a';wg.fillRect(x-4,y-9,2,9);wg.fillStyle='#ff9a3c';wg.fillRect(x+2,y-9,1,9);
  wg.fillStyle='#d9d9d9';wg.fillRect(x-5,y-10,11,1);wg.fillStyle='#f4f1e8';for(const[dx,dy]of[[-3,-12],[0,-13],[3,-12],[-1,-11],[2,-11]])wg.fillRect(x+dx,y+dy,2,2)});
 // pitching machine: tripod, twin wheels spinning, feed chute
 add(M.y,()=>{const x=Math.round(M.x),y=Math.round(M.y);wg.fillStyle='rgba(6,18,10,.32)';wg.fillRect(x-8,y,17,2);
  wg.strokeStyle='#3b4148';wg.lineWidth=1.4;wg.beginPath();wg.moveTo(x-7,y);wg.lineTo(x-1,y-10);wg.moveTo(x+7,y);wg.lineTo(x+1,y-10);wg.moveTo(x,y+1);wg.lineTo(x,y-10);wg.stroke();
  wg.fillStyle='#2b3036';wg.fillRect(x-7,y-19,14,9);wg.fillStyle='#4a525b';wg.fillRect(x-7,y-19,14,2);
  const sp=now/(ph==='windup'||ph==='pitch'?18:60);
  for(const sx of[-3.5,3.5]){wg.fillStyle='#111316';wg.beginPath();wg.arc(x+sx,y-14.5,3.6,0,Math.PI*2);wg.fill();wg.fillStyle='#8a939b';wg.fillRect(Math.round(x+sx+Math.cos(sp*(sx>0?1:-1))*2.2)-1,Math.round(y-14.5+Math.sin(sp*(sx>0?1:-1))*2.2)-1,2,2)}
  wg.fillStyle='#ffd23f';wg.fillRect(x-1,y-26,3,7);wg.fillStyle='#e0b52a';wg.fillRect(x-3,y-29,7,3);
  wg.fillStyle=T.jersey;wg.fillRect(x-7,y-11,14,1);
  if(k>.62&&k<.86){wg.fillStyle='#ffffff';const u=(k-.62)/.24;wg.fillRect(x,Math.round(y-30+u*10),2,2)}});
 // coach feeding the machine
 add(F.y,()=>{const hoist=k>.35&&k<.7,arms=hoist?'hoist':k>=.7&&k<.9?'set':'down';
  drawPlayer(wg,F.x,F.y,T,{legs:'stand',arms,skin:SKINS[1],pants:'#3b3f46',flip:true});
  if(k>.2&&k<.62){wg.fillStyle='#ffffff';wg.fillRect(Math.round(F.x)-1,Math.round(F.y)-(hoist?27:13),2,2)}});
 // portable backstop behind the plate: three chain-link panels on casters, the wings angled in
 {const BS=toPx(0,-21),bx=Math.round(BS.x),by=Math.round(BS.y),ph2=30,cap=T.cap;
  add(by,()=>{const g=wg;
   const panel=(x0,y0,x1,y1)=>{ // base from (x0,y0) to (x1,y1), standing ph2 px tall
    g.fillStyle='rgba(6,18,10,.28)';g.beginPath();g.moveTo(x0,y0+1);g.lineTo(x1,y1+1);g.lineTo(x1+10,y1+7);g.lineTo(x0+10,y0+7);g.closePath();g.fill();
    g.save();g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x1,y1-ph2);g.lineTo(x0,y0-ph2);g.closePath();g.clip();
    g.fillStyle='rgba(150,160,170,.10)';g.fillRect(Math.min(x0,x1),Math.min(y0,y1)-ph2,Math.abs(x1-x0)+1,Math.abs(y1-y0)+ph2+1);
    g.strokeStyle='rgba(205,212,218,.42)';g.lineWidth=.8;g.beginPath();
    for(let k=-60;k<Math.abs(x1-x0)+60;k+=4){g.moveTo(Math.min(x0,x1)+k,Math.max(y0,y1));g.lineTo(Math.min(x0,x1)+k+ph2+20,Math.max(y0,y1)-ph2-20);g.moveTo(Math.min(x0,x1)+k,Math.max(y0,y1));g.lineTo(Math.min(x0,x1)+k-ph2-20,Math.max(y0,y1)-ph2-20)}
    g.stroke();g.restore();
    g.fillStyle='#3a4048';g.fillRect(x0-1,y0-ph2,2,ph2);g.fillRect(x1-1,y1-ph2,2,ph2);
    g.strokeStyle='#4a525b';g.lineWidth=2;g.beginPath();g.moveTo(x0,y0-ph2);g.lineTo(x1,y1-ph2);g.stroke();
    g.strokeStyle=cap;g.lineWidth=3;g.beginPath();g.moveTo(x0,y0-ph2-2);g.lineTo(x1,y1-ph2-2);g.stroke();
    g.strokeStyle='#3a4048';g.lineWidth=1.5;g.beginPath();g.moveTo(x0,y0-1);g.lineTo(x1,y1-1);g.stroke();
    g.fillStyle='#16191d';for(const[xx,yy]of[[x0,y0],[x1,y1]]){g.fillRect(xx-2,yy,4,2)}};
   panel(bx-58,by-16,bx-30,by);panel(bx+30,by,bx+58,by-16);panel(bx-30,by,bx+30,by)})}
 // L-screen: frame and net, with the cut-out the ball comes through
 add(L.y,()=>{const x=Math.round(L.x),y=Math.round(L.y),w=22,h=28,hc=15;
  wg.fillStyle='rgba(6,18,10,.3)';wg.fillRect(x-w/2,y,w,2);
  wg.fillStyle='rgba(28,32,38,.42)';wg.fillRect(x-w/2,y-h,w/2+2,h);wg.fillRect(x+2,y-hc,w/2-2,hc);
  wg.fillStyle='rgba(255,255,255,.13)';for(let yy=y-h;yy<y;yy+=3){wg.fillRect(x-w/2,yy,yy<y-hc?w/2+2:w,1)}for(let xx=x-w/2;xx<x+w/2;xx+=3)wg.fillRect(xx,xx<x+2?y-h:y-hc,1,xx<x+2?h:hc);
  wg.fillStyle='#16191d';wg.fillRect(x-w/2-1,y-h,2,h);wg.fillRect(x-w/2-1,y-h,w/2+4,2);wg.fillRect(x+2,y-h,2,h-hc+1);wg.fillRect(x+2,y-hc,w/2,2);wg.fillRect(x+w/2,y-hc,2,hc);wg.fillRect(x-w/2-1,y-1,w+3,2)});
}
let NIGHT_MASK=null,NIGHT_BEAMS=null;
function isDirtFt(x,y){const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,dm=Math.hypot(x,y-60.5),grassIn=Math.abs(x)+Math.abs(y-63.64)<54.64;
 if((dm<95&&Math.abs(th)<=50&&y>-2&&!grassIn)||r<13||dm<9)return true;return Math.abs(th)<=45&&y>0&&r>fenceDist(th)-14}
let DUST=[],dustT=0;
const GROUND=new WeakMap();
function dustAt(key,x,y,h){let st=GROUND.get(key);if(!st){GROUND.set(key,{h,n:0});return}
 const hit=st.h>=.75&&h<.75;st.h=h;if(!hit)return;
 // every touchdown on the grass gets a thud, each bounce quieter than the last
 if(!isDirtFt(x,y)){const v=.75*Math.pow(.55,st.n);st.n++;if(v>.04&&!muted)playSample('grass',v,.95+Math.random()*.1);return}
 st.n++;
 {const q=toPx(x,y),n=7+(Math.random()*5|0);
  for(let k=0;k<n;k++)DUST.push({x:q.x+rand(-2,2),y:q.y+rand(-1,1),vx:rand(-34,34),vy:rand(-34,-6),life:rand(.35,.7),m:0,c:pick(['#d6a46e','#c48c56','#e2bd8f','#b8804a'])})}
}
function drawDust(g,now){const dt=Math.min(.05,(now-(dustT||now))/1000);dustT=now;
 for(const d of DUST){d.m+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=70*dt;d.vx*=.92;const a=Math.max(0,1-d.m/d.life);if(a<=0)continue;g.globalAlpha=a*.85;g.fillStyle=d.c;g.fillRect(Math.round(d.x),Math.round(d.y),d.s||2,d.s||2)}
 g.globalAlpha=1;DUST=DUST.filter(d=>d.m<d.life)}
// light towers: on all night, off by day; after a home run each bank blinks off and on, one after another
function towerOn(i,now){const s=S.lightShow,base=!!S.night;if(!s)return base;const t=now-s-i*380;if(t<0||t>4400)return base;return Math.floor(t/440)%2===(base?0:1)?!base:base}
// paint each bank's lamp face for its current state over the static signage
function drawTowerLamps(g,now){if(!S.lightShow)return;for(const[i,t]of TOWERS.entries()){const on=towerOn(i,now);if(on===!!S.night)continue;
 g.save();g.scale(K,K);g.translate(t.kx,t.ky);g.rotate(t.a+Math.PI/2);g.fillStyle='#1d2228';g.fillRect(-25,-9,50,18);
 for(let r=0;r<3;r++)for(let k=0;k<6;k++){const lx=-23+k*8,ly=-8+r*5.6;g.fillStyle=on?((r+k)%2?'#fffdf0':'#fff3c4'):'#3a4048';g.fillRect(lx,ly,6.5,4.4)}
 g.restore();if(on){g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(t.x,t.y,4,t.x,t.y,110);gr.addColorStop(0,'rgba(255,250,225,.6)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(t.x-110,t.y-110,220,220);g.restore()}}}
// ---------- soft (blurred) shapes that look the same on every browser ----------
// Safari (iPhone/iPad) has no canvas blur filter, which left the night lighting with hard edges on phones. There the
// shape is painted on a small scratch canvas, blurred by hand (three box passes, about a Gaussian) and laid back on.
const CANVAS_BLUR=!/nofilter/.test(location.hash)&&(()=>{try{const c=document.createElement('canvas');c.width=c.height=9;const g=c.getContext('2d');g.filter='blur(2px)';g.fillStyle='#fff';g.fillRect(4,4,1,1);return g.getImageData(2,4,1,1).data[3]>0}catch(e){return false}})();
function boxBlurRGBA(id,w,h,sigma){const d=id.data,n=w*h,ch=[0,1,2,3].map(()=>new Float32Array(n)),tmp=new Float32Array(Math.max(w,h));
 for(let i=0;i<n;i++){const a=d[i*4+3]/255;ch[0][i]=d[i*4]*a;ch[1][i]=d[i*4+1]*a;ch[2][i]=d[i*4+2]*a;ch[3][i]=d[i*4+3]}
 const br=Math.max(1,Math.round((Math.sqrt(4*sigma*sigma+1)-1)/2));
 const line=(A,start,step,len)=>{let acc=0;for(let k=0;k<len;k++)tmp[k]=A[start+k*step];
  for(let k=-br;k<=br;k++)if(k>=0&&k<len)acc+=tmp[k];
  for(let k=0;k<len;k++){A[start+k*step]=acc/(2*br+1);const o=k-br,ni=k+br+1;if(o>=0)acc-=tmp[o];if(ni<len)acc+=tmp[ni]}};
 for(const A of ch)for(let p=0;p<3;p++){for(let y=0;y<h;y++)line(A,y*w,1,w);for(let x=0;x<w;x++)line(A,x,w,h)}
 for(let i=0;i<n;i++){const a=ch[3][i],f=a>0?255/a:0;d[i*4]=ch[0][i]*f;d[i*4+1]=ch[1][i]*f;d[i*4+2]=ch[2][i]*f;d[i*4+3]=a}}
function softDraw(g,r,draw){if(CANVAS_BLUR){g.save();g.filter=`blur(${r}px)`;draw(g);g.restore();return}
 const W0=g.canvas.width,H0=g.canvas.height,ds=r>=16?4:2,sc=document.createElement('canvas');sc.width=Math.ceil(W0/ds);sc.height=Math.ceil(H0/ds);
 const s=sc.getContext('2d'),T=g.getTransform();s.setTransform(T.a/ds,T.b/ds,T.c/ds,T.d/ds,T.e/ds,T.f/ds);draw(s);
 const id=s.getImageData(0,0,sc.width,sc.height);boxBlurRGBA(id,sc.width,sc.height,r/ds);s.putImageData(id,0,0);
 g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(sc,0,0,W0,H0);g.restore()}
// a W x H canvas of one colour that is clear in the middle and solid at the edges (a frame fading in over B px)
const EDGE_FADE={};function edgeFade(w,h,B,col){const k=w+'x'+h+B+col;if(EDGE_FADE[k])return EDGE_FADE[k];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 const side=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,col);gr.addColorStop(1,col.length===7?`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},0)`:'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(rx,ry,rw,rh)};
 g.save();side(0,0,B,0,0,0,B,h);side(w,0,w-B,0,w-B,0,B,h);side(0,0,0,B,0,0,w,B);side(0,h,0,h-B,0,h-B,w,B);g.restore();return EDGE_FADE[k]=c}
function nightPass(g,now){
 if(!NIGHT_MASK){const c=document.createElement('canvas');c.width=W;c.height=H;const m=c.getContext('2d');
  // darkness everywhere, then the whole playing field (fair ground to the wall, plus the foul ground around home) lit up with soft edges
  m.fillStyle='#5a6494';m.fillRect(0,0,W,H);
  const fieldPath=(m,inset)=>{m.beginPath();const a=toPx(-60,-36);m.moveTo(a.x,a.y);
   for(const[x,y]of[[-112,22]]){const q=toPx(x,y);m.lineTo(q.x,q.y)}
   for(let th=-45;th<=45;th+=3){const r=fenceDist(th)+inset,q=toPx(Math.sin(th*RAD)*r,Math.cos(th*RAD)*r);m.lineTo(q.x,q.y)}
   for(const[x,y]of[[112,22],[60,-36]]){const q=toPx(x,y);m.lineTo(q.x,q.y)}m.closePath()};
  softDraw(m,34,c=>{c.fillStyle='#d9dbe6';fieldPath(c,18);c.fill()});
  softDraw(m,22,c=>{c.fillStyle='#e9e8e6';fieldPath(c,-6);c.fill()});
  // a touch of extra light on the lower bowl right behind the field
  m.save();m.globalCompositeOperation='lighter';softDraw(m,30,c=>{c.fillStyle='rgba(70,70,80,.9)';fieldPath(c,90);c.fill()});m.restore();
  // the park buffer stops at a hard rectangle; let the light die away before its edges so it meets the neighborhood smoothly
  {const ov=edgeFade(W,H,90,'#5a6494');m.drawImage(ov,0,0)}
  NIGHT_MASK=c;
  // spotlight beams from each bank, one canvas per tower (so a bank can go dark on its own), plus the patch of
  // field each bank lights (used to dim that section when the bank is off)
  const aims=[toPx(-40,250),toPx(40,250),toPx(-20,90),toPx(20,90)];
  NIGHT_BEAMS=TOWERS.map((t,k)=>{const aim=aims[k]||toPx(0,150),dx=aim.x-t.x,dy=aim.y-t.y,L=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
   const pad=40,ca=Math.cos(ang),sa=Math.sin(ang),pts=[[0,-20],[L*1.1,-170],[L*1.1,170],[0,20],[L*1.25,-300],[L*1.25,300]].map(([u,v])=>({x:t.x+u*ca-v*sa,y:t.y+u*sa+v*ca}));
   const x0=Math.floor(Math.min(...pts.map(p=>p.x))-pad),y0=Math.floor(Math.min(...pts.map(p=>p.y))-pad),x1=Math.ceil(Math.max(...pts.map(p=>p.x))+pad),y1=Math.ceil(Math.max(...pts.map(p=>p.y))+pad);
   const mk=()=>{const c=document.createElement('canvas');c.width=x1-x0;c.height=y1-y0;const g=c.getContext('2d');g.translate(t.x-x0,t.y-y0);g.rotate(ang);return[c,g]};
   const[bc,bg]=mk();
   softDraw(bg,10,c=>{const gr=c.createLinearGradient(0,0,L*1.1,0);gr.addColorStop(0,'rgba(255,248,222,.30)');gr.addColorStop(.25,'rgba(255,248,222,.17)');gr.addColorStop(.6,'rgba(255,248,222,.06)');gr.addColorStop(1,'rgba(255,248,222,0)');
    c.fillStyle=gr;c.beginPath();c.moveTo(0,-20);c.lineTo(L*1.1,-170);c.lineTo(L*1.1,170);c.lineTo(0,20);c.closePath();c.fill();
    const g2=c.createLinearGradient(0,0,L*.8,0);g2.addColorStop(0,'rgba(255,252,235,.22)');g2.addColorStop(1,'rgba(255,252,235,0)');
    c.fillStyle=g2;c.beginPath();c.moveTo(0,-10);c.lineTo(L*.8,-60);c.lineTo(L*.8,60);c.lineTo(0,10);c.closePath();c.fill()});
   const pg2=bg.createRadialGradient(L*.82,0,0,L*.82,0,150);pg2.addColorStop(0,'rgba(255,246,215,.05)');pg2.addColorStop(1,'rgba(255,246,215,0)');
   bg.fillStyle=pg2;bg.fillRect(L*.82-150,-150,300,300);
   // the section of field this bank lights: a wide soft wedge ending past its aim point
   const[sc,sg]=mk();softDraw(sg,40,c=>{c.fillStyle='#333a5c';c.beginPath();c.moveTo(L*.15,-60);c.lineTo(L*1.25,-300);c.lineTo(L*1.25,300);c.lineTo(L*.15,60);c.closePath();c.fill()});
   {bg.setTransform(1,0,0,1,0,0);bg.globalCompositeOperation='destination-out';bg.drawImage(edgeFade(W,H,110,'#000'),-x0,-y0)}
   return{beam:bc,shade:sc,x:x0,y:y0}});}

 g.save();g.globalCompositeOperation='multiply';g.drawImage(NIGHT_MASK,0,0);
 // a dark bank leaves its section of the field dim
 if(NIGHT_BEAMS)NIGHT_BEAMS.forEach((B,i)=>{if(!towerOn(i,now)){g.globalAlpha=.55;g.drawImage(B.shade,B.x,B.y);g.globalAlpha=1}});
 g.globalCompositeOperation='lighter';if(NIGHT_BEAMS)NIGHT_BEAMS.forEach((B,i)=>{if(towerOn(i,now))g.drawImage(B.beam,B.x,B.y)});let gr;
 for(const[i,t]of TOWERS.entries()){if(!towerOn(i,now))continue;const fl=.92+Math.sin(now/90+t.x)*.04;const gR=Math.max(20,Math.min(150,t.x,t.y,W-t.x,H-t.y));gr=g.createRadialGradient(t.x,t.y,6,t.x,t.y,gR);gr.addColorStop(0,`rgba(255,250,225,${.55*fl})`);gr.addColorStop(.25,`rgba(255,240,200,${.16*fl})`);gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(t.x-150,t.y-150,300,300)}
 g.restore();
}
function dayPass(g){g.save();g.globalCompositeOperation='multiply';g.fillStyle='#fff7ea';g.fillRect(0,0,W,H);g.restore()}
function render(now){
 if(!FIELD){ctx.fillStyle='#232f37';ctx.fillRect(0,0,cv.width,cv.height);return}
 wg.drawImage(FIELD,0,0);
 const bpv=S.mode==='bp'&&S.phase!=='title'&&S.phase!=='over';
 if(CROWD_A&&!bpv){
  wg.drawImage(CROWD_A,0,0);
  if(now<S.cheerUntil){for(let yy=0;yy<H;yy+=16)if(Math.sin(now/110+yy*.28)>.1)wg.drawImage(CROWD_B,0,yy,W,16,0,yy,W,16)}
  if(S.wave&&now<S.wave.end){
   const uu=(now-S.wave.start)/(S.wave.end-S.wave.start);const a=(lerp(-150,150,uu)-90)*RAD;
   wg.save();wg.beginPath();wg.moveTo(HX,HY);wg.arc(HX,HY,3400,a-6*RAD,a+6*RAD);wg.closePath();wg.clip();wg.drawImage(CROWD_B,0,0);wg.restore();
  }
 }
 if(CROWD_A&&!bpv)drawCrowdLife(wg,now);
 if(SIGNS)wg.drawImage(SIGNS,0,0);
 if(DECOR)wg.drawImage(DECOR,0,0);
 if(!bpv)drawDugoutCrew(wg,now);wg.save();wg.scale(K,K);if(!bpv)drawCheer(wg,now);drawFlags(wg,now);wg.restore();
 const ph=S.phase,play=S.play;
 const inPlay=!!play&&(ph==='play'||ph==='result');
 const t=play?(ph==='result'?play.end:play.t):0;
 const fld=TEAMS[fldKey()],bat=TEAMS[batKey()],fldPants=fldKey()===S.you?'#eeeae0':'#a9b0b5',batPants=batKey()===S.you?'#eeeae0':'#a9b0b5';
 const fr=Math.floor(now/85);
 const list=[];const add=(y,f)=>list.push({y,f});
 // umpire
 if(!bpv){
 const up=toPx(0,-9);const punch=now<S.umpPunch;
 add(up.y,()=>drawPlayer(wg,up.x,up.y,UMP,{legs:'ready',arms:punch?'punch':'down',skin:SKINS[2],pants:'#7c848a',back:true}));
 // mascot
 const mp=toPx(MASCOT_AT.x,MASCOT_AT.y);const cheering=now<S.cheerUntil;
 const lift=cheering?Math.abs(Math.sin(now/110))*9:(Math.sin(now/380)>.6?1:0);
 add(mp.y,()=>drawMascot(wg,S.you,mp.x+(cheering?Math.sin(now/160)*4:0),mp.y,lift));
 }
 if(bpv){drawBPRig(add,now,ph);for(const b of (S.bpBalls||[])){const q=toPx(b.x,b.y);add(q.y-2,()=>{wg.fillStyle='rgba(6,18,10,.28)';wg.fillRect(Math.round(q.x)-1,Math.round(q.y)+1,3,1);wg.fillStyle='#f4f1e8';wg.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,2,2);wg.fillStyle='#c7262e';wg.fillRect(Math.round(q.x),Math.round(q.y)-1,1,1)})}}
 // fielders
 const live=ph==='pitch'||(ph==='windup'&&S.pt/S.pitch.wind>.7);
 for(let i=0;i<9&&!bpv;i++){
  let p;
  // during the play they follow it; once the result shows (SINGLE, DOUBLE...) they walk back to their spots right away
  // instead of holding the last frame and jogging in place
  if(inPlay&&ph!=='result')p=fpos(play,i,t);
  else if((ph==='result'||ph==='reset')&&play&&!play.foul){const a=fpos(play,i,play.end),el=Math.max(0,(now-(S.postAt||now))/1000),off=S.postOff,tgt=off?{x:off*84+(i-4)*3,y:14+i}:POS[i];
   const d=dist(a,tgt),m=Math.min(d,el*(off?9:i>=6?15:11)*SPEED);p=d>.01?{x:a.x+(tgt.x-a.x)*m/d,y:a.y+(tgt.y-a.y)*m/d}:{...tgt};
   if(ph==='reset'&&!off){const k=ease(clamp((S.pt-260)/240,0,1));p={x:lerp(p.x,POS[i].x,k),y:lerp(p.y,POS[i].y,k)}}
   p.mv=d-m>1&&!(ph==='reset'&&S.pt>260&&!off)}
  else p=POS[i];
  const q=toPx(p.x,p.y);
  const moving=(inPlay&&ph!=='result'&&play.fk[i]&&dist(fpos(play,i,t),fpos(play,i,Math.max(0,t-.05)))>.3)||!!p.mv;
  let legs=moving?'run':'stand',arms=moving?'run':'down';
  if(!moving&&live){legs='ready';arms='ready'}
  if(!moving&&!live&&!inPlay&&Math.sin(now/700+i*1.7)>.85)legs='ready';
  if(!moving&&inPlay&&ph!=='result'){const bb=Math.sin(now/170+i*1.9);legs=bb>-.2?'ready':'stand';arms='ready'}
  let thr=null,lean=0;
  if(inPlay&&ph!=='result')for(const sg of play.segs){
   if(sg.thr&&t>=sg.t0-.2&&t<sg.t0+.2&&dist(sg.from,p)<7){// a real throw: arm back, step toward the target, whip through and follow
    const u=t<sg.t0?.72*clamp((t-(sg.t0-.2))/.2,0,1)*.6+.72*.4*clamp((t-(sg.t0-.2))/.2,0,1):.72+.28*clamp((t-sg.t0)/.2,0,1),fa=toPx(sg.from.x,sg.from.y),ta=toPx(sg.to.x,sg.to.y);
    arms='proc';legs=u<.36?'ready':u<.8?'stride':'follow';thr={arm:armPath(u,false),gloveAt:gloveAt(u),ball:u<.72,flip:ta.x>fa.x};lean=u>.6&&u<.95?1:0;break}
   if(sg.air&&!sg.thr&&!play.foul&&t>sg.t1-.4&&t<=sg.t1+.15&&dist(sg.to,p)<9){arms='catch'}
   else if(sg.hold===i&&t>=sg.t0&&t<=sg.t1&&arms!=='catch')arms='ready';
  }
  const skin=S.fpl?skinOf(S.fpl[i].name):SKINS[hash(S.opp+i)%2];
  let flip=true,armO=null,pT=null;if(thr){armO={arm:thr.arm,gloveAt:thr.gloveAt,ball:thr.ball};flip=thr.flip}
  if(i===0&&!inPlay&&ph!=='reset'){
   flip=pitcher().hand==='R';
   const side=pitcher().slot==='side';
   if(ph==='windup'){pT=clamp(S.pt/S.pitch.wind,0,1)}
   else if(ph==='pitch'){const e=now-S.pitch.releaseAt;
    if(e<580)pT=1+e/1055;else{legs='ready';arms='ready'}}
   else if(ph==='ready'){legs='stand';arms=S.pt>350?'set':'down'}
  }
  const dv=inPlay&&play.dive&&play.dive.i===i&&t>=play.dive.t-.24&&t<=play.dive.t+.95?play.dive:null;
  if(dv){const lf=t<dv.t?Math.sin((t-(dv.t-.24))/.24*Math.PI/2)*4:0;add(q.y,()=>drawDiver(wg,q.x,q.y,fld,{skin,pants:fldPants},dv.dir,lf));continue}
  const jp=inPlay&&play.jump&&play.jump.i===i&&t>play.jump.t-.32&&t<play.jump.t+.3?play.jump:null;
  if(jp){const u=(t-(jp.t-.32))/.62,hgt=Math.sin(clamp(u,0,1)*Math.PI)*11;
   add(q.y,()=>{wg.fillStyle='rgba(6,18,10,.3)';wg.fillRect(Math.round(q.x)-4,Math.round(q.y),9,2);drawPlayer(wg,q.x,q.y-hgt,fld,{legs:'lift',arms:'catch',frame:0,skin,pants:fldPants,flip,glove:true})});continue}
  if(inPlay&&play.errMark&&play.errMark.i===i&&t>=play.errMark.t&&t<play.errMark.t+1.3){// an error: a red "!" pops up over his head and stays through the result
   const ea=t-play.errMark.t,pop=ea<.18?Math.round((1-ea/.18)*6):0,bob=Math.round(Math.sin(now/160)),ex=Math.round(q.x),ey=Math.round(q.y)-35-pop+bob;
   add(1e6,()=>{wg.fillStyle='#14181c';wg.fillRect(ex-2,ey-1,5,11);wg.fillStyle='#ff3b30';wg.fillRect(ex-1,ey,3,6);wg.fillRect(ex-1,ey+7,3,2);wg.fillStyle='#ffd0c8';wg.fillRect(ex-1,ey,1,2)})}
  if(i===1&&!moving){let reach=null,held=false;const ck=ph==='pitch'&&S.pitch&&S.pitch.releaseAt&&!S.pitch.wild&&S.mode!=='bp'?catchPt(S.pitch):null;
   if(ck){const el=now-S.pitch.releaseAt,k=ease(clamp((el/S.pitch.travel-.5)/.45,0,1)),G=ck.scr;reach={x:lerp(-.5,(G.x-q.x)/1.2,k),y:lerp(-9.5,(G.y-q.y)/1.2,k)};held=el>=S.pitch.travel*CATCH_U}
   add(q.y,()=>drawCatcher(wg,q.x,q.y,fld,{skin,pants:fldPants,target:ph==='windup'||ph==='pitch',reach,held}))}
  else add(q.y,()=>{if(i===0&&now<S.wildUntil){wg.fillStyle='#1b1f24';wg.fillRect(Math.round(q.x)-2,Math.round(q.y)-38,5,11);wg.fillRect(Math.round(q.x)-2,Math.round(q.y)-25,5,5);wg.fillStyle='#ff4a3d';wg.fillRect(Math.round(q.x)-1,Math.round(q.y)-37,3,9);wg.fillRect(Math.round(q.x)-1,Math.round(q.y)-24,3,3)}if(pT!=null)drawPitcher(wg,q.x,q.y,fld,{skin,pants:fldPants,flip,side:pitcher().slot==='side'},pT);else drawPlayer(wg,q.x,q.y+lean,fld,{legs,arms,frame:fr+i,skin,pants:fldPants,flip,glove:true,...(armO||{})})});
 }
 // runners
 const runSkin=w=>skinOf(w.name);
 if(inPlay&&!play.foul){
  for(const r of play.runners){
   if(r.batter&&t<.6)continue;
   const tw=ph==='result'?play.end+Math.max(0,(now-(S.postAt||now))/1000):t;// a retired runner keeps jogging off after the play is over
   const offAt=r.out?(r.slide&&!r.slide.back?Math.max(r.outAt,r.slide.t1+.25):r.outAt)+.3:1e9;// a runner who slid into the tag finishes his slide before he jogs off
   if(r.out&&tw>offAt){const o=r.slide&&!r.slide.back&&r.slide.p0?(()=>{const bb=BASES[r.slide.b%4],p0=r.slide.p0;return{x:lerp(bb.x,p0.x,.12),y:lerp(bb.y,p0.y,.12)}})():runnerPos(r,offAt),sd=batKey()===S.you?1:-1,D={x:sd*84,y:14},dd=dist(o,D),k=Math.min(1,(tw-offAt)*6.5/Math.max(1,dd));
    if(k>=1)continue;const w={x:lerp(o.x,D.x,k),y:lerp(o.y,D.y,k)},q=toPx(w.x,w.y);
    add(q.y,()=>drawPlayer(wg,q.x+2,q.y,bat,{legs:'run',arms:'down',frame:Math.floor(now/190)+(hash(r.who.name)&3),skin:runSkin(r.who),helmet:true,pants:batPants,flip:D.x<w.x}));continue}
   const p=runnerPos(r,t);const q=toPx(p.x,p.y);
   if(r.tagAt!=null&&r.dest>r.from&&t>=r.start-.05&&t<r.start+.35){const bq=toPx(baseP(r.from).x,baseP(r.from).y),k2=(t-r.start+.05)/.4;
    add(1e6,()=>{wg.globalAlpha=1-k2;wg.strokeStyle='#ffffff';wg.lineWidth=1;wg.beginPath();wg.arc(bq.x,bq.y,4+k2*10,0,Math.PI*2);wg.stroke();
     wg.font='bold 11px "Pixelify Sans", monospace';wg.textAlign='center';wg.fillStyle='#ffbf3c';wg.fillText('TAG!',bq.x,bq.y-24-k2*6);wg.globalAlpha=1})}
   if(r.slide&&t>=r.slide.t0&&t<r.slide.t1+.55&&!(r.out&&t>offAt)){const bb=BASES[r.slide.b%4],pv=r.slide.back?baseP(r.slide.b+1):baseP(r.slide.b-1),dir=Math.sign(bb.x-pv.x)||1;
    const u=clamp((t-r.slide.t0)/(r.slide.t1-r.slide.t0),0,1);
    // one continuous glide from where he left his feet to the bag (a tagged-out runner comes up a foot short)
    if(!r.slide.p0)r.slide.p0=runnerPos(r,r.slide.t0);const p0=r.slide.p0,E=r.out?{x:lerp(bb.x,p0.x,.12),y:lerp(bb.y,p0.y,.12)}:bb,k3=1-(1-u)*(1-u);
    const sp={x:lerp(p0.x,E.x,k3),y:lerp(p0.y,E.y,k3)},sq=toPx(sp.x,sp.y);
    // a rooster tail of dirt kicked up along the slide, and a puff at the bag when he gets there
    if(t<r.slide.t1){for(let n=0;n<6;n++)if(Math.random()<.9)DUST.push({x:sq.x+rand(-7,7),y:sq.y+rand(-2,1),vx:rand(-34,34)-dir*18,vy:rand(-42,-8),life:rand(.35,.85),m:0,s:Math.random()<.35?3:2,c:pick(['#d6a46e','#c48c56','#e2bd8f','#b8804a','#ead2ae'])})}
    else if(!r.slide.puff){r.slide.puff=true;const bq2=toPx(bb.x,bb.y);for(let n=0;n<34;n++)DUST.push({x:bq2.x+rand(-8,8),y:bq2.y+rand(-3,2),vx:rand(-55,55),vy:rand(-46,-6),life:rand(.45,1.1),m:0,s:Math.random()<.4?3:2,c:pick(['#d6a46e','#c48c56','#e2bd8f','#b8804a','#ead2ae'])})}
    const back=dir*(r.slide.head?14:16)*K/1.333*(t<r.slide.t1+.25?1:1-clamp((t-r.slide.t1-.25)/.3,0,1));// the lead hand or spikes reach exactly the bag// keep the leading hand (or spikes) on the bag, then get up onto it
    const dn=t-r.slide.t0,upT=t-(r.slide.t1+.3),trans=dn<.09?1:dn<.18?2:upT>.14?1:upT>0?2:0;// in-between frames going down and getting back up
    add(sq.y,()=>drawDiver(wg,sq.x-back,sq.y,bat,{skin:runSkin(r.who),pants:batPants,noGlove:true,head:r.slide.head,trans},dir,u<1?(1-u)*3:0));continue}
   add(q.y,()=>drawPlayer(wg,q.x+2,q.y,bat,{legs:p.moving?'run':'ready',arms:p.moving?'run':(r.dest===4&&!p.moving?'catch':'down'),frame:fr+(hash(r.who.name)&3),skin:runSkin(r.who),helmet:true,pants:batPants}));
  }
 }else if(ph!=='title'){
  S.stealHit=[];S.runHit=[];
  S.bases.forEach((b,k)=>{if(!b)return;const bb=BASES[k+1],nb=BASES[(k+2)%4],going=S.steal&&S.steal[k+1]&&ph==='pitch'&&S.pitch&&S.pitch.releaseAt;
   let Lf=leadNow(k+1,ph,now)/LEG;if(going){const sp=stealProg(k+1,now);Lf=Math.min(.97,sp.L+sp.run)}
   const q=toPx(lerp(bb.x,nb.x,Lf),lerp(bb.y,nb.y,Lf));
   if(canSteal(k+1)&&['ready','windup','choose'].includes(ph)){const on=S.steal&&S.steal[k+1],dx=nb.x-bb.x,dy=nb.y-bb.y,dl=Math.hypot(dx,dy),ux=dx/dl,uy=dy/dl,ap=toPx(q&&lerp(bb.x,nb.x,Lf)+ux*7,lerp(bb.y,nb.y,Lf)+uy*7);
    const ang=Math.atan2(-(uy),ux);S.stealHit.push({k:k+1,x:ap.x,y:ap.y-4});
    add(1e6,()=>{wg.save();wg.translate(ap.x,ap.y-4);wg.rotate(ang);wg.globalAlpha=on?1:.55+.25*Math.sin(now/300);wg.fillStyle=on?'#ffbf3c':'#f4f1e8';
     wg.beginPath();wg.moveTo(7,0);wg.lineTo(-1,-5);wg.lineTo(-1,-2);wg.lineTo(-6,-2);wg.lineTo(-6,2);wg.lineTo(-1,2);wg.lineTo(-1,5);wg.closePath();wg.fill();
     wg.strokeStyle='rgba(8,20,14,.8)';wg.lineWidth=1;wg.stroke();wg.restore();wg.globalAlpha=1})}
   if(going){add(q.y,()=>drawPlayer(wg,q.x,q.y,bat,{legs:'run',arms:'run',frame:Math.floor(now/70)+k,skin:runSkin(b),helmet:true,pants:batPants,flip:nb.x<bb.x}));return}
   S.runHit.push({x:q.x,y:q.y-9,who:b,k:k+1});
   const off=Lf>0?0:7,back=ph==='call'&&Lf>0;add(q.y,()=>drawPlayer(wg,q.x+off,q.y,bat,{legs:back?'run':(live||Lf>0)?'ready':'stand',arms:back?'run':'down',frame:Math.floor(now/110)+k,skin:runSkin(b),helmet:true,pants:batPants,flip:back}))});
 }
 // batter
 const cb=curBatter(),hand=effHand(cb);
 const bx=toPx(hand==='R'?-3.2:3.2,0);
 const wt=inPlay&&!play.foul&&play.watch!=null?play.watch:null,hrPlay=wt!=null,flipping=hrPlay&&t>wt;
 if(flipping){const fs=play.flip||FLIPS[0],uu=Math.min(1,(t-wt)/fs.dur),sd=hand==='R'?1:-1;
  const fx=bx.x+sd*(4+uu*fs.d),fy=bx.y-12-Math.sin(Math.PI*uu)*fs.h+uu*12,spin=uu*Math.PI*2*fs.spins;
  const fa=fs.heli&&uu<1?0:(hand==='R'?0:Math.PI)+spin,ls=fs.heli&&uu<1?Math.cos(spin):1;
  add(uu<1?1e6:bx.y+1,()=>drawBatFree(wg,fx,fy,fa,cb.bat||'#d9b07a',ls))}
 const sdB=batKey()===S.you?1:-1,deckP=toPx(sdB*38,-6);
 if(ph!=='title'&&ph!=='over'){
  if(!S.walkUp||S.walkUp.who!==cb){S.walkUp={who:cb,at:(S.walkUp?now+(S.koWalk?650:0):now-2000)};S.stance={vert:Math.random()<.55,ph:Math.random()*6}}
  const waitUp=inPlay&&ph==='result'&&!play.foul&&S.mode!=='bp';if(waitUp)S.walkUp.at=now;
  const od=waitUp?cb:TEAMS[batKey()].lineup[((S.orderOf[batKey()]||0)+1)%9],wu=waitUp?1:(now-S.walkUp.at)/900;
  if(od&&(od!==cb||waitUp)&&wu>=1&&S.mode!=='bp'){const sw=Math.sin(now/520+1.3);add(deckP.y,()=>{drawPlayer(wg,deckP.x,deckP.y,bat,{legs:'stand',arms:'bat',skin:runSkin(od),helmet:true,pants:batPants,flip:sdB<0});drawBat(wg,deckP.x,deckP.y,(sdB>0?125:55)*RAD+sw*.9,sdB>0?'R':'L',od.bat)})}
 }
 if(S.hbpFx&&now-S.hbpFx.at<800&&ph!=='title'){const f=S.hbpFx,e=(now-f.at)/800,sd=f.hand==='R'?-1:1;
  // hit by pitch: a jolt away from the plate, a hunched wince, then shaking it off
  const st=toPx(sd*3.2,0),jolt=Math.sin(Math.min(1,e*3)*Math.PI/2)*sd*7,shake=e>.35&&e<.75?Math.sin(now/28)*1.2:0;
  add(st.y,()=>{drawPlayer(wg,st.x+jolt+shake,st.y+(e<.6?2:0),f.T,{legs:e<.6?'ready':'stand',arms:e<.5?'set':'down',skin:skinOf(f.who.name),helmet:true,pants:f.pants,flip:sd>0});})}
 if(S.koWalk){const kw=S.koWalk,u=(now-kw.at)/1700;if(u>=1||ph==='title')S.koWalk=null;else{
   const st=toPx(kw.hand==='R'?-3.2:3.2,0),D=toPx(kw.sd*84,14),k=ease(clamp(u*1.15-.1,0,1)),x=lerp(st.x,D.x,k),y=lerp(st.y,D.y,k);
   add(y,()=>{drawPlayer(wg,x,y,kw.T,{legs:k>0&&k<1?'run':'stand',arms:'down',frame:Math.floor(now/190),skin:skinOf(kw.who.name),helmet:true,pants:kw.pants,flip:D.x<st.x});drawBat(wg,x,y,(D.x<st.x?235:-55)*RAD,D.x<st.x?'L':'R',kw.who.bat,.8)})}}
 // walk-off: the home dugout empties and mobs the plate, jumping as they arrive
 if(S.celebr&&(ph==='over'||ph==='play'||ph==='result')){const ce=S.celebr,T=TEAMS[ce.k];
  for(const m of ce.mob){const u=clamp((now-ce.at-m.d)/m.dur,0,1);if(now-ce.at<m.d)continue;const k=ease(u);
   const x=lerp(m.sx,m.tx,k),y=lerp(m.sy,m.ty,k);const hop=u>=1?Math.abs(Math.sin((now-ce.at)/170+m.ph))*(5+m.hj):0;
   add(y,()=>drawPlayer(wg,x,y-hop,T,{legs:u<1?'run':hop>2?'stand':'ready',arms:u<1?'run':(Math.sin((now-ce.at)/260+m.ph)>0?'cheer':'punch'),frame:Math.floor(now/150+m.ph),skin:m.sk,helmet:m.helmet,pants:m.pants,flip:u<1?m.tx<m.sx:Math.sin(now/600+m.ph)>0}))}}
 const walking=S.mode!=='bp'&&S.walkUp&&S.walkUp.who===cb&&now-S.walkUp.at<900&&ph!=='pitch'&&!inPlay;
 if(walking){const k=ease(clamp((now-S.walkUp.at)/900,0,1)),wx=lerp(deckP.x,bx.x,k),wy=lerp(deckP.y,bx.y,k);
  add(wy,()=>{drawPlayer(wg,wx,wy,bat,{legs:'run',arms:'down',frame:Math.floor(now/170),skin:runSkin(cb),helmet:true,pants:batPants,flip:wx>bx.x});drawBat(wg,wx,wy,(hand==='R'?120:60)*RAD,hand,cb.bat,.8)})}
 const batterVisible=!walking&&(!inPlay||play.foul||play.bp||t<(hrPlay?wt+.6:.6));
 if(batterVisible){
  add(bx.y,()=>{
   const sq=S.swing&&S.swing.bunt&&(ph==='pitch'||ph==='call'||(inPlay&&t<.6));
   const sw=S.swing,st=S.stance||{vert:false,ph:0};
   // the swing, as a righty sees it (a lefty is the mirror image): bat up over the back shoulder in the stance, drops
   // into the slot behind him, whips through the zone (pointing at the plate at contact), then finishes high over the
   // front shoulder. Angles are on screen, going around counter-clockwise; ls is how much of the bat's length shows
   // (short = standing up toward the camera).
   const mir=a=>hand==='R'?a:180-a;
   let A=-112,ls=.6,legsB=flipping?'stand':'ready',armsB='bat',dx=0,ghost=null;
   const pre=ph==='ready'||ph==='windup'||ph==='choose';
   if(pre&&!flipping){const kk=ph==='windup'?S.pt/S.pitch.wind:0,bob=Math.sin(now/300+st.ph);
    legsB=(ph==='windup'&&kk>.55)?'ready':(bob>-.1?'ready':'stand');
    // waggle, then a small load (hands back, bat tipping toward the catcher) as the pitcher comes set
    const load=ph==='windup'?clamp((kk-.5)/.4,0,1):0;A=-112-load*28+Math.sin(now/260+st.ph)*7*(1-load);ls=st.vert?.5:.6+load*.08}
   else if(sw&&!sq&&(ph==='pitch'||ph==='call'||inPlay)){
    const T=now-sw.at,pose=T=>{
     if(T<0)return{A:-140,ls:.66};
     if(T<50){const u=T/50,e=u*u;return{A:-140-e*92,ls:lerp(.66,1,u)}}           // drop into the slot
     if(T<95){const u=(T-50)/45,e=u*u*(3-2*u);return{A:-232-e*128,ls:1}}       // whip through the zone
     if(T<175){const u=(T-95)/80,e=1-(1-u)*(1-u);return{A:-360-e*148,ls:lerp(1,.58,e)}}// follow-through, up over the front shoulder
     if(T<480)return{A:-508,ls:.58};
     const u=clamp((T-480)/260,0,1),e=u*u*(3-2*u);return{A:lerp(-508,-472,e),ls:.58}};// relax the finish
    const P0=pose(T);A=P0.A;ls=P0.ls;
    legsB=T<12?'ready':T<95?'stride':'follow';dx=T<12?0:T<95?1:2;
    // motion blur through the fast part of the swing
    if(T>30&&T<150)ghost=[pose(T-10),pose(T-20),pose(T-30)]}
   else if(ph==='pitch'&&!sw){A=-140+Math.sin(now/200)*3;ls=.66;legsB='ready'}
   const sd=hand==='R'?1:-1,X=bx.x+dx*sd;
   drawPlayer(wg,X,bx.y,bat,{legs:legsB,arms:flipping?(play.res.hr?(play.flip?play.flip.arms:'punch'):'down'):sq?'bunt':armsB,skin:runSkin(cb),helmet:true,flip:hand==='L'});
   if(flipping){}
   else if(sq)drawBat(wg,X,bx.y,(hand==='R'?-8:188)*RAD,hand,cb.bat,1);
   else{if(ghost){wg.save();[.32,.18,.08].forEach((al,k)=>{wg.globalAlpha=al;drawBat(wg,X,bx.y,mir(ghost[k].A)*RAD,hand,cb.bat,ghost[k].ls)});wg.restore()}
    drawBat(wg,X,bx.y,mir(A)*RAD,hand,cb.bat,ls)}
  });
 }else if(!hrPlay){wg.fillStyle=cb.bat||'#d9b07a';wg.fillRect(Math.round(bx.x)+3,Math.round(bx.y)+3,11,1);wg.fillStyle='#5a3820';wg.fillRect(Math.round(bx.x)+3,Math.round(bx.y)+3,3,1)}
 // bullpens: relievers playing catch
 if(!bpv)[[1,TEAMS[S.you],'#eeeae0',0],[-1,TEAMS[S.opp],'#a9b0b5',1600]].forEach(([sd,T,pants,phs])=>{
  const pm=penSpot(sd,32),pc=penSpot(sd,38.2);const m=toPx(pm.x,pm.y),k=toPx(pc.x,pc.y);
  const sk=SKINS[hash(T.name)%SKINS.length],sk2=SKINS[(hash(T.name)+2)%SKINS.length];
  const cyc=((now+phs)%3400)/3400;
  const pl=cyc<.7?['stand','set']:cyc<.76?['lift','set']:cyc<.82?['kick','set']:cyc<.87?['drive','break']:cyc<.92?['stride','cock']:cyc<.96?['stride','release']:['follow','follow'];
  const pT2=cyc>=.62?(cyc-.62)/.34:cyc<.1?1+cyc/.1*.55:null;
  add(m.y,()=>pT2!=null&&pT2<=1.55?drawPitcher(wg,m.x,m.y,T,{skin:sk,pants,flip:true},Math.min(1.55,pT2)):drawPlayer(wg,m.x,m.y,T,{legs:pl[0],arms:pl[1],skin:sk,pants,flip:true}));
  add(k.y,()=>drawCatcher(wg,k.x,k.y,T,{skin:sk2,pants,target:cyc>.78||cyc<.14}));
  if(cyc>=.94||cyc<.1){const uu=cyc>=.94?(cyc-.94)/.16:(cyc+.06)/.16;add(1e6,()=>{wg.fillStyle='#fff';wg.fillRect(Math.round(lerp(m.x,k.x,uu))-1,Math.round(lerp(m.y-14,k.y-9,uu)),2,2)})}
 });
 list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
 // ball + pitch trail
 if(ph==='pitch'&&S.mode==='bp'&&!S.pitch.reb&&!(S.swing&&S.swing.done&&!S.swing.miss)&&now-S.pitch.releaseAt>=S.pitch.travel*1.36){
  // the ball smacks the backstop, pops back toward the plate a few feet and settles
  S.pitch.reb=true;const H=pitchPos(S.pitch,S.pitch.travel*1.36),dx=rand(-1.2,1.2),back=rand(2.5,4.5);
  const pl={segs:[fnSeg(0,.62,t=>{const e=t/.62,o=1-(1-e)*(1-e);return{x:H.x+dx*o,y:H.y+back*o,h:Math.max(0,H.h*(1-e)*(1-e))+Math.abs(Math.sin(e*Math.PI*2.4))*1.1*(1-e)}})],fullEnd:1.12,res:{hr:false},ballGone:null};
  (S.bpFly=S.bpFly||[]).push({play:pl,at:now});sfx('fence')}
 if(ph==='pitch'&&!S.pitch.reb){
  const elP=now-S.pitch.releaseAt,inMitt=!S.pitch.wild&&S.mode!=='bp'&&elP>=S.pitch.travel*CATCH_U;
  let p=pitchPos(S.pitch,S.pitch.wild?Math.min(elP,S.pitch.travel*1.5):S.mode==='bp'?Math.min(elP,S.pitch.travel*1.36):Math.min(elP,S.pitch.travel*CATCH_U));const P=PITCHES[S.pitch.k];
  // past the plate the ball bends into the catcher's mitt (it never flies on through him)
  if(!S.pitch.wild&&S.mode!=='bp'&&elP>S.pitch.travel){const ck=catchPt(S.pitch),f=clamp((elP/S.pitch.travel-1)/(CATCH_U-1),0,1),p1=pitchPos(S.pitch,S.pitch.travel);p={x:lerp(p1.x,ck.x,f),y:lerp(p1.y,ck.y,f),h:lerp(p1.h,ck.h,f)}}
  const tl=S.pitch.k==='FB'?Math.round(10+(S.pitch.mph-90)*1.8):P.tl;
  const tr=S.pitch.trail;tr.push(p);while(tr.length>tl)tr.shift();
  for(let k=0;k<tr.length-1;k++){const a=tr[k];const q=toPx(a.x,a.y);const lift=a.h/FT;const oy=Math.round(lift*.5),ox=Math.round(-lift*.2);
   wg.globalAlpha=(k/tr.length)*.6;wg.fillStyle='#c3c8ce';wg.fillRect(Math.round(q.x)+ox-1,Math.round(q.y)-oy-1,2,2)}
  wg.globalAlpha=1;
  const q=toPx(p.x,p.y);
  const spin=S.pitch.k==='SL'?Math.floor(now/30):S.pitch.k==='CB'?Math.floor(now/45):(S.pitch.k==='CH'||S.pitch.k==='SP')?Math.floor(now/90):null;
  if(!inMitt){dustAt(S.pitch,p.x,p.y,p.h);drawBall(wg,q.x,q.y,p.h,spin,S.pitch.k==='CB'?Math.round(Math.max(0,p.h-4.2)/2):0)}
 }else if(S.hbpFx&&now-S.hbpFx.at<1150){const f=S.hbpFx,e=(now-f.at)/1150,o=1-(1-e)*(1-e);
  // the pitch ricochets off the hitter and dribbles away
  const x=f.x0+f.dx*o,y=f.y0+f.dy*o,h=f.h0*Math.max(0,1-e*2.4)+Math.abs(Math.sin(e*Math.PI*2.2))*1.6*(1-e),q=toPx(x,y);drawBall(wg,q.x,q.y,h,null)}
 if(false){}else if(inPlay&&!play.hide&&!(ph==='result'&&!play.foul&&!(play.res&&play.res.hr))){const p=ballAt(play,t);if(p){let q=toPx(p.x,p.y),hh=p.h;const dv=play.dive,sg=play.curSeg;
  const inGlove=dv&&!play.bobble&&t>=dv.t-.03&&t<=dv.t+.95&&(!sg||sg.hold===dv.i||(!sg.thr&&sg.hold==null&&t>=sg.t1-.03));
  if(inGlove){const f=fpos(play,dv.i,t),fq=toPx(f.x,f.y),lf=t<dv.t?4:0;q={x:fq.x+dv.dir*15,y:fq.y-6-lf};hh=0}
  else if(sg&&sg.hold!=null&&t>=sg.t0&&t<=sg.t1){const f=fpos(play,sg.hold,t),fq=toPx(f.x,f.y);q={x:fq.x+4,y:fq.y-9};hh=0}
  if(!play.foul||true)dustAt(play,p.x,p.y,p.h);drawBall(wg,q.x,q.y,hh)}}
 drawGulls(wg,now);
 drawDust(wg,now);
 if(S.bpFly&&S.bpFly.length){S.bpFly=S.bpFly.filter(f=>{const tt=(now-f.at)/1000*SPEED,pl=f.play;
   if(tt>=pl.fullEnd-.5){if(!pl.res.hr){let last=null;for(const sg of pl.segs)if(!last||sg.t1>=last.t1)last=sg;if(last){const q=last.fn(last.t1);(S.bpBalls=S.bpBalls||[]).push({x:q.x,y:q.y})}}return false}
   if(pl.clang&&!pl.clang.done&&tt>=pl.clang.t){pl.clang.done=true;if(!muted)playSample('clang',.85,1)}
   if(pl.fenceAt!=null&&!pl.fenceDone&&tt>=pl.fenceAt){pl.fenceDone=true;sfx('fence',.55)}
   if(pl.ballGone!=null&&tt>=pl.ballGone){if(!f.splashed){f.splashed=true;splashCheck(pl)}return true}
   let seg=null;for(const sg of pl.segs)if(tt>=sg.t0&&tt<=sg.t1){seg=sg;break}if(!seg){for(const sg of pl.segs)if(sg.t1<=tt&&(!seg||sg.t1>=seg.t1))seg=sg}
    if(seg){const p=seg.fn(Math.min(tt,seg.t1)),q=toPx(p.x,p.y);dustAt(pl,p.x,p.y,p.h);
    if(OPT.info!==false&&pl.res.code){const tr=f.trail||(f.trail=[]);const lift=p.h/FT;tr.push({x:q.x-lift*.2,y:q.y-lift*.5});if(tr.length>26)tr.shift();
     const col={HR:'#ffcf4a',LD:'#ff6a4a',FB:'#7fc8ff',POP:'#c9a6ff',GB:'#f4f1e8',FOUL:'#9aa5ae'}[pl.res.code]||'#f4f1e8';
     wg.fillStyle=col;for(let k=0;k<tr.length-1;k++){wg.globalAlpha=(k/tr.length)*.75;wg.fillRect(Math.round(tr[k].x)-1,Math.round(tr[k].y)-1,k>tr.length*.6?3:2,k>tr.length*.6?3:2)}wg.globalAlpha=1}
    drawBall(wg,q.x,q.y,p.h)}return true})}
 if(ST.feature==='whale'&&!ST.harbor)drawUlsan(wg,now);
 for(const p of S.fx){wg.globalAlpha=Math.max(0,p.life);wg.fillStyle=p.col;wg.fillRect(Math.round(p.x),Math.round(p.y),3,3)}
 wg.globalAlpha=1;
 if(S.night){nightPass(wg,now);
  // camera flashes punch through the dark: bright cores with a soft bloom
  wg.save();wg.globalCompositeOperation='lighter';
  for(const f of S.flashes){const a=now-f.t;if(a>110)continue;const k=1-a/110;
   const gr=wg.createRadialGradient(f.x,f.y,0,f.x,f.y,16);gr.addColorStop(0,`rgba(255,255,255,${.95*k})`);gr.addColorStop(.3,`rgba(220,235,255,${.4*k})`);gr.addColorStop(1,'rgba(220,235,255,0)');
   wg.fillStyle=gr;wg.fillRect(f.x-16,f.y-16,32,32);if(a<50){wg.fillStyle='#ffffff';wg.fillRect(f.x-1,f.y-1,3,3);wg.fillRect(f.x-6,f.y,13,1);wg.fillRect(f.x,f.y-6,1,13)}}
  wg.restore()}
 else dayPass(wg);
 drawTowerLamps(wg,now);
 // to screen
 const C=clampCam(S.cam),[vw,vh]=viewWH(C.z),e=EXT();
 const vx0=C.x-vw/2,vy0=C.y-vh/2,scale=cv.height/vh;
 // smoothing only when shrinking the park; 'high' quality re-filters the whole park every frame and stutters once
 // zoomed out, so plain bilinear for mild shrinking and the mid setting only for the widest views
 ctx.imageSmoothingEnabled=scale<1.6;ctx.imageSmoothingQuality=window.__sq||(scale<.5?'medium':'low');
 S.view={sx:vx0,sy:vy0,vw,vh,ox:0,scale};
 let OUT=e.mx?outsideFor():null;const inside=vx0>=0&&vy0>=0&&vx0+vw<=W&&vy0+vh<=H;
 // the usual close-up never reaches past the outer wall: skip the neighborhood and the clip entirely (cheap on phones)
 if(OUT&&inside&&PARK_OUTLINE&&[[vx0,vy0],[vx0+vw,vy0],[vx0,vy0+vh],[vx0+vw,vy0+vh]].every(([x,y])=>insidePoly(PARK_OUTLINE,x,y)))OUT=null;
 if(OUT)ctx.drawImage(OUT,(vx0+e.mx)/2,(vy0+e.my)/2,vw/2,vh/2,0,0,cv.width,cv.height);else if(!inside){ctx.fillStyle='#1b232a';ctx.fillRect(0,0,cv.width,cv.height)}
 const ix0=Math.max(0,vx0),iy0=Math.max(0,vy0),ix1=Math.min(W,vx0+vw),iy1=Math.min(H,vy0+vh);
 if(ix1>ix0&&iy1>iy0){const dx=(ix0-vx0)*scale,dy=(iy0-vy0)*scale,dw=(ix1-ix0)*scale,dh=(iy1-iy0)*scale;
  if(OUT&&PARK_OUTLINE){// the stands end at the stadium's outer wall; the neighborhood shows past it
   ctx.save();ctx.beginPath();PARK_OUTLINE.forEach((q,k)=>ctx[k?'lineTo':'moveTo']((q.x-vx0)*scale,(q.y-vy0)*scale));ctx.closePath();ctx.clip();
   ctx.drawImage(wb,ix0,iy0,ix1-ix0,iy1-iy0,dx,dy,dw,dh);if(OUT_FEATHER)ctx.drawImage(OUT_FEATHER,(vx0+e.mx)/2,(vy0+e.my)/2,vw/2,vh/2,0,0,cv.width,cv.height);ctx.restore();
   if(!ST.bowl){ctx.save();ctx.lineJoin='round';ctx.lineCap='round';if(ST.openTop)outlinePath(PARK_OUTLINE,x=>(x-vx0)*scale,y=>(y-vy0)*scale,ctx);else{ctx.beginPath();PARK_OUTLINE.forEach((q,k)=>ctx[k?'lineTo':'moveTo']((q.x-vx0)*scale,(q.y-vy0)*scale));ctx.closePath()}
   ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=Math.max(2,16*scale);ctx.stroke();ctx.strokeStyle=S.night?'#3a424c':'#b9b4a8';ctx.lineWidth=Math.max(1.5,9*scale);ctx.stroke();
   ctx.strokeStyle=TEAMS[S.you].jersey;ctx.lineWidth=Math.max(1,2.5*scale);ctx.stroke();ctx.restore()}}
  else ctx.drawImage(wb,ix0,iy0,ix1-ix0,iy1-iy0,dx,dy,dw,dh)}
 drawRoofLights(ctx,vx0,vy0,scale,now);
 drawHarborLights(ctx,vx0,vy0,scale,now);
 drawFortLights(ctx,vx0,vy0,scale,now);drawSteelLights(ctx,vx0,vy0,scale,now);
 drawSplashes(ctx,vx0,vy0,scale,now);
 if(ST.harbor&&S.phase!=='title'){ctx.save();ctx.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);drawUlsan(ctx,now);ctx.restore()}// the harbor's whales and ships, out past the park
 drawNeon(ctx,vx0,vy0,scale,now);
 if(S.phase!=='title'){ctx.save();ctx.setTransform(scale*K,0,0,scale*K,-vx0*scale,-vy0*scale);ctx.imageSmoothingEnabled=false;drawJumbo(ctx,now);ctx.restore()}// the board stands above everything on its legs
 drawBallCam(now);
}

