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
 for(const d of DUST){d.m+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=70*dt;d.vx*=.92;const a=Math.max(0,1-d.m/d.life);if(a<=0)continue;g.globalAlpha=a*.85;g.fillStyle=d.c;g.fillRect(Math.round(d.x),Math.round(d.y),2,2)}
 g.globalAlpha=1;DUST=DUST.filter(d=>d.m<d.life)}
function nightPass(g,now){
 if(!NIGHT_MASK){const c=document.createElement('canvas');c.width=W;c.height=H;const m=c.getContext('2d');
  // darkness everywhere, then the whole playing field (fair ground to the wall, plus the foul ground around home) lit up with soft edges
  m.fillStyle='#5a6494';m.fillRect(0,0,W,H);
  const fieldPath=(inset)=>{m.beginPath();const a=toPx(-60,-36);m.moveTo(a.x,a.y);
   for(const[x,y]of[[-112,22]]){const q=toPx(x,y);m.lineTo(q.x,q.y)}
   for(let th=-45;th<=45;th+=3){const r=fenceDist(th)+inset,q=toPx(Math.sin(th*RAD)*r,Math.cos(th*RAD)*r);m.lineTo(q.x,q.y)}
   for(const[x,y]of[[112,22],[60,-36]]){const q=toPx(x,y);m.lineTo(q.x,q.y)}m.closePath()};
  m.save();m.filter='blur(34px)';m.fillStyle='#d9dbe6';fieldPath(18);m.fill();m.restore();
  m.save();m.filter='blur(22px)';m.fillStyle='#e9e8e6';fieldPath(-6);m.fill();m.restore();
  // a touch of extra light on the lower bowl right behind the field
  m.save();m.globalCompositeOperation='lighter';m.filter='blur(30px)';m.fillStyle='rgba(70,70,80,.9)';fieldPath(90);m.fill();m.restore();
  NIGHT_MASK=c;
  // rectangular spotlight beams from each bank, aimed into the field, ending in a bright rectangular pool
  const b=document.createElement('canvas');b.width=W;b.height=H;const bg=b.getContext('2d');
  const aims=[toPx(-40,250),toPx(40,250),toPx(-20,90),toPx(20,90)];
  TOWERS.forEach((t,k)=>{const aim=aims[k]||toPx(0,150),dx=aim.x-t.x,dy=aim.y-t.y,L=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
   bg.save();bg.translate(t.x,t.y);bg.rotate(ang);
   // a cone of light that widens and tapers away to nothing as it falls onto the field
   const gr=bg.createLinearGradient(0,0,L*1.1,0);gr.addColorStop(0,'rgba(255,248,222,.30)');gr.addColorStop(.25,'rgba(255,248,222,.17)');gr.addColorStop(.6,'rgba(255,248,222,.06)');gr.addColorStop(1,'rgba(255,248,222,0)');
   bg.filter='blur(10px)';bg.fillStyle=gr;bg.beginPath();bg.moveTo(0,-20);bg.lineTo(L*1.1,-170);bg.lineTo(L*1.1,170);bg.lineTo(0,20);bg.closePath();bg.fill();
   const g2=bg.createLinearGradient(0,0,L*.8,0);g2.addColorStop(0,'rgba(255,252,235,.22)');g2.addColorStop(1,'rgba(255,252,235,0)');
   bg.fillStyle=g2;bg.beginPath();bg.moveTo(0,-10);bg.lineTo(L*.8,-60);bg.lineTo(L*.8,60);bg.lineTo(0,10);bg.closePath();bg.fill();
   const pg2=bg.createRadialGradient(L*.82,0,0,L*.82,0,150);pg2.addColorStop(0,'rgba(255,246,215,.05)');pg2.addColorStop(1,'rgba(255,246,215,0)');
   bg.filter='none';bg.fillStyle=pg2;bg.fillRect(L*.82-150,-150,300,300);
   bg.restore()});
  NIGHT_BEAMS=b}
 g.save();g.globalCompositeOperation='multiply';g.drawImage(NIGHT_MASK,0,0);
 g.globalCompositeOperation='lighter';if(NIGHT_BEAMS)g.drawImage(NIGHT_BEAMS,0,0);let gr;
 for(const t of TOWERS){const fl=.92+Math.sin(now/90+t.x)*.04;gr=g.createRadialGradient(t.x,t.y,6,t.x,t.y,150);gr.addColorStop(0,`rgba(255,250,225,${.55*fl})`);gr.addColorStop(.25,`rgba(255,240,200,${.16*fl})`);gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(t.x-150,t.y-150,300,300)}
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
 wg.save();wg.scale(K,K);if(!bpv){drawDugoutCrew(wg,now);drawCheer(wg,now)}drawFlags(wg,now);drawJumbo(wg,now);wg.restore();
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
  if(inPlay)p=fpos(play,i,t);
  else if((ph==='result'||ph==='reset')&&play&&!play.foul){const a=fpos(play,i,play.end),el=Math.max(0,(now-(S.postAt||now))/1000),off=S.postOff,tgt=off?{x:off*84+(i-4)*3,y:14+i}:POS[i];
   const d=dist(a,tgt),m=Math.min(d,el*(off?9:i>=6?15:11)*SPEED);p=d>.01?{x:a.x+(tgt.x-a.x)*m/d,y:a.y+(tgt.y-a.y)*m/d}:{...tgt};
   if(ph==='reset'&&!off){const k=ease(clamp((S.pt-260)/240,0,1));p={x:lerp(p.x,POS[i].x,k),y:lerp(p.y,POS[i].y,k)}}
   p.mv=d-m>1&&!(ph==='reset'&&S.pt>260&&!off)}
  else p=POS[i];
  const q=toPx(p.x,p.y);
  const moving=(inPlay&&play.fk[i]&&dist(fpos(play,i,t),fpos(play,i,Math.max(0,t-.05)))>.3)||!!p.mv;
  let legs=moving?'run':'stand',arms=moving?'run':'down';
  if(!moving&&live){legs='ready';arms='ready'}
  if(!moving&&!live&&!inPlay&&Math.sin(now/700+i*1.7)>.85)legs='ready';
  if(!moving&&inPlay){const bb=Math.sin(now/170+i*1.9);legs=bb>-.2?'ready':'stand';arms='ready'}
  if(inPlay)for(const sg of play.segs){
   if(sg.thr&&t>=sg.t0&&t<sg.t0+.28&&dist(sg.from,p)<6){arms='throw';break}
   if(sg.air&&!sg.thr&&!play.foul&&t>sg.t1-.4&&t<=sg.t1+.15&&dist(sg.to,p)<9){arms='catch'}
   else if(sg.hold===i&&t>=sg.t0&&t<=sg.t1&&arms!=='catch')arms='ready';
  }
  const skin=S.fpl?skinOf(S.fpl[i].name):SKINS[hash(S.opp+i)%2];
  let flip=true,armO=null,lean=0,pT=null;
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
  if(i===1&&!moving)add(q.y,()=>drawCatcher(wg,q.x,q.y,fld,{skin,pants:fldPants,target:ph==='windup'||ph==='pitch'}));
  else add(q.y,()=>{if(i===0&&now<S.wildUntil){wg.fillStyle='#1b1f24';wg.fillRect(Math.round(q.x)-2,Math.round(q.y)-38,5,11);wg.fillRect(Math.round(q.x)-2,Math.round(q.y)-25,5,5);wg.fillStyle='#ff4a3d';wg.fillRect(Math.round(q.x)-1,Math.round(q.y)-37,3,9);wg.fillRect(Math.round(q.x)-1,Math.round(q.y)-24,3,3)}if(pT!=null)drawPitcher(wg,q.x,q.y,fld,{skin,pants:fldPants,flip,side:pitcher().slot==='side'},pT);else drawPlayer(wg,q.x,q.y+lean,fld,{legs,arms,frame:fr+i,skin,pants:fldPants,flip,glove:true,...(armO||{})})});
 }
 // runners
 const runSkin=w=>skinOf(w.name);
 if(inPlay&&!play.foul){
  for(const r of play.runners){
   if(r.batter&&t<.6)continue;
   if(r.out&&t>r.outAt+.3){const o=runnerPos(r,r.outAt+.3),sd=batKey()===S.you?1:-1,D={x:sd*84,y:14},dd=dist(o,D),k=Math.min(1,(t-r.outAt-.3)*6.5/Math.max(1,dd));
    if(k>=1)continue;const w={x:lerp(o.x,D.x,k),y:lerp(o.y,D.y,k)},q=toPx(w.x,w.y);
    add(q.y,()=>drawPlayer(wg,q.x+2,q.y,bat,{legs:'run',arms:'down',frame:Math.floor(now/190)+(hash(r.who.name)&3),skin:runSkin(r.who),helmet:true,pants:batPants,flip:D.x<w.x}));continue}
   const p=runnerPos(r,t);const q=toPx(p.x,p.y);
   if(r.tagAt!=null&&r.dest>r.from&&t>=r.start-.05&&t<r.start+.35){const bq=toPx(baseP(r.from).x,baseP(r.from).y),k2=(t-r.start+.05)/.4;
    add(1e6,()=>{wg.globalAlpha=1-k2;wg.strokeStyle='#ffffff';wg.lineWidth=1;wg.beginPath();wg.arc(bq.x,bq.y,4+k2*10,0,Math.PI*2);wg.stroke();
     wg.font='bold 11px "Pixelify Sans", monospace';wg.textAlign='center';wg.fillStyle='#ffbf3c';wg.fillText('TAG!',bq.x,bq.y-24-k2*6);wg.globalAlpha=1})}
   if(r.slide&&t>=r.slide.t0&&t<r.slide.t1+.55&&!(r.out&&t>r.outAt+.3)){const bb=BASES[r.slide.b%4],pv=r.slide.back?baseP(r.slide.b+1):baseP(r.slide.b-1),dir=Math.sign(bb.x-pv.x)||1;
    const u=clamp((t-r.slide.t0)/(r.slide.t1-r.slide.t0),0,1);
    // one continuous glide from where he left his feet to the bag (a tagged-out runner comes up a foot short)
    if(!r.slide.p0)r.slide.p0=runnerPos(r,r.slide.t0);const p0=r.slide.p0,E=r.out?{x:lerp(bb.x,p0.x,.12),y:lerp(bb.y,p0.y,.12)}:bb,k3=1-(1-u)*(1-u);
    const sp={x:lerp(p0.x,E.x,k3),y:lerp(p0.y,E.y,k3)},sq=toPx(sp.x,sp.y);
    if(t<r.slide.t1&&Math.random()<.5){DUST.push({x:sq.x+rand(-4,4),y:sq.y+rand(-1,1),vx:rand(-20,20),vy:rand(-26,-6),life:rand(.3,.55),m:0,c:pick(['#d6a46e','#c48c56','#e2bd8f'])})}
    const back=dir*9*(t<r.slide.t1+.25?1:1-clamp((t-r.slide.t1-.25)/.3,0,1));// keep the leading hand (or spikes) on the bag, then get up onto it
    add(sq.y,()=>drawDiver(wg,sq.x-back,sq.y,bat,{skin:runSkin(r.who),pants:batPants,noGlove:true,head:r.slide.head},r.slide.head?dir:-dir,u<1?(1-u)*3:0));continue}
   add(q.y,()=>drawPlayer(wg,q.x+2,q.y,bat,{legs:p.moving?'run':'ready',arms:p.moving?'run':(r.dest===4&&!p.moving?'catch':'down'),frame:fr+(hash(r.who.name)&3),skin:runSkin(r.who),helmet:true,pants:batPants}));
  }
 }else if(ph!=='title'){
  S.stealHit=[];
  S.bases.forEach((b,k)=>{if(!b)return;const bb=BASES[k+1],nb=BASES[(k+2)%4],going=S.steal&&S.steal[k+1]&&ph==='pitch'&&S.pitch&&S.pitch.releaseAt;
   let Lf=leadNow(k+1,ph,now)/LEG;if(going){const sp=stealProg(k+1,now);Lf=Math.min(.97,sp.L+sp.run)}
   const q=toPx(lerp(bb.x,nb.x,Lf),lerp(bb.y,nb.y,Lf));
   if(canSteal(k+1)&&['ready','windup','choose'].includes(ph)){const on=S.steal&&S.steal[k+1],dx=nb.x-bb.x,dy=nb.y-bb.y,dl=Math.hypot(dx,dy),ux=dx/dl,uy=dy/dl,ap=toPx(q&&lerp(bb.x,nb.x,Lf)+ux*7,lerp(bb.y,nb.y,Lf)+uy*7);
    const ang=Math.atan2(-(uy),ux);S.stealHit.push({k:k+1,x:ap.x,y:ap.y-4});
    add(1e6,()=>{wg.save();wg.translate(ap.x,ap.y-4);wg.rotate(ang);wg.globalAlpha=on?1:.55+.25*Math.sin(now/300);wg.fillStyle=on?'#ffbf3c':'#f4f1e8';
     wg.beginPath();wg.moveTo(7,0);wg.lineTo(-1,-5);wg.lineTo(-1,-2);wg.lineTo(-6,-2);wg.lineTo(-6,2);wg.lineTo(-1,2);wg.lineTo(-1,5);wg.closePath();wg.fill();
     wg.strokeStyle='rgba(8,20,14,.8)';wg.lineWidth=1;wg.stroke();wg.restore();wg.globalAlpha=1})}
   if(going){add(q.y,()=>drawPlayer(wg,q.x,q.y,bat,{legs:'run',arms:'run',frame:Math.floor(now/70)+k,skin:runSkin(b),helmet:true,pants:batPants,flip:nb.x<bb.x}));return}
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
   const A0=(hand==='R'?125:55)*RAD,A1=(hand==='R'?-140:320)*RAD,AV=(hand==='R'?-235:-90)*RAD;
   let ang=A0,bl=1;const sw=S.swing,st=S.stance||{vert:false,ph:0};
   // pre-pitch: some hitters hold the bat straight up and only drop it into the load late in the windup; everyone buckles the knees
   let legsB=flipping?'stand':'ready';
   const pre=ph==='ready'||ph==='windup'||ph==='choose';
   if(pre&&!flipping){const kk=ph==='windup'?S.pt/S.pitch.wind:0,bob=Math.sin(now/300+st.ph);
    legsB=(ph==='windup'&&kk>.55)?'ready':(bob>-.1?'ready':'stand');
    if(st.vert){const u=ph==='windup'?clamp((kk-.45)/.35,0,1):0;ang=lerp(AV,A0,u)+Math.sin(now/240+st.ph)*.06*(1-u);bl=lerp(.5,1,u)}
    else ang=A0+Math.sin(now/260+st.ph)*.14}
   drawPlayer(wg,bx.x,bx.y,bat,{legs:legsB,arms:flipping?(play.res.hr?(play.flip?play.flip.arms:'punch'):'down'):sq?'bunt':'bat',skin:runSkin(cb),helmet:true,flip:hand==='L'});
   if(sq)ang=(hand==='R'?-8:188)*RAD;
   else if(sw&&(ph==='pitch'||ph==='call'||inPlay))ang=lerp(A0,A1,clamp((now-sw.at)/150,0,1));
   else if(ph==='pitch'&&!sw)ang=A0+Math.sin(now/200)*.05;
   if(!flipping)drawBat(wg,bx.x,bx.y,ang,hand,cb.bat,bl);
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
  const p=pitchPos(S.pitch,S.pitch.wild?Math.min(now-S.pitch.releaseAt,S.pitch.travel*1.5):S.mode==='bp'?Math.min(now-S.pitch.releaseAt,S.pitch.travel*1.36):Math.min(now-S.pitch.releaseAt,S.pitch.travel*1.135));const P=PITCHES[S.pitch.k];
  const tl=S.pitch.k==='FB'?Math.round(10+(S.pitch.mph-90)*1.8):P.tl;
  const tr=S.pitch.trail;tr.push(p);while(tr.length>tl)tr.shift();
  for(let k=0;k<tr.length-1;k++){const a=tr[k];const q=toPx(a.x,a.y);const lift=a.h/FT;const oy=Math.round(lift*.5),ox=Math.round(-lift*.2);
   wg.globalAlpha=(k/tr.length)*.6;wg.fillStyle='#c3c8ce';wg.fillRect(Math.round(q.x)+ox-1,Math.round(q.y)-oy-1,2,2)}
  wg.globalAlpha=1;
  const q=toPx(p.x,p.y);
  const spin=S.pitch.k==='SL'?Math.floor(now/30):(S.pitch.k==='CH'||S.pitch.k==='SP')?Math.floor(now/90):null;
  dustAt(S.pitch,p.x,p.y,p.h);drawBall(wg,q.x,q.y,p.h,spin);
 }else if(S.hbpFx&&now-S.hbpFx.at<1150){const f=S.hbpFx,e=(now-f.at)/1150,o=1-(1-e)*(1-e);
  // the pitch ricochets off the hitter and dribbles away
  const x=f.x0+f.dx*o,y=f.y0+f.dy*o,h=f.h0*Math.max(0,1-e*2.4)+Math.abs(Math.sin(e*Math.PI*2.2))*1.6*(1-e),q=toPx(x,y);drawBall(wg,q.x,q.y,h,null)}
 if(false){}else if(inPlay&&!play.hide){const p=ballAt(play,t);if(p){let q=toPx(p.x,p.y),hh=p.h;const dv=play.dive,sg=play.curSeg;
  if(dv&&t>=dv.t&&t<=dv.t+.95&&dist(p,fpos(play,dv.i,t))<8){const f=fpos(play,dv.i,t),fq=toPx(f.x,f.y);q={x:fq.x+dv.dir*15,y:fq.y-7};hh=0}
  else if(sg&&sg.hold!=null&&t>=sg.t0&&t<=sg.t1){const f=fpos(play,sg.hold,t),fq=toPx(f.x,f.y);q={x:fq.x+4,y:fq.y-9};hh=0}
  if(!play.foul||true)dustAt(play,p.x,p.y,p.h);drawBall(wg,q.x,q.y,hh)}}
 drawGulls(wg,now);
 drawDust(wg,now);
 if(S.bpFly&&S.bpFly.length){S.bpFly=S.bpFly.filter(f=>{const tt=(now-f.at)/1000*SPEED,pl=f.play;
   if(tt>=pl.fullEnd-.5){if(!pl.res.hr){let last=null;for(const sg of pl.segs)if(!last||sg.t1>=last.t1)last=sg;if(last){const q=last.fn(last.t1);(S.bpBalls=S.bpBalls||[]).push({x:q.x,y:q.y})}}return false}
   if(pl.clang&&!pl.clang.done&&tt>=pl.clang.t){pl.clang.done=true;if(!muted)playSample('clang',.85,1)}
   if(pl.fenceAt!=null&&!pl.fenceDone&&tt>=pl.fenceAt){pl.fenceDone=true;sfx('fence',.55)}
   if(pl.ballGone!=null&&tt>=pl.ballGone)return true;
   let seg=null;for(const sg of pl.segs)if(tt>=sg.t0&&tt<=sg.t1){seg=sg;break}if(!seg){for(const sg of pl.segs)if(sg.t1<=tt&&(!seg||sg.t1>=seg.t1))seg=sg}
    if(seg){const p=seg.fn(Math.min(tt,seg.t1)),q=toPx(p.x,p.y);dustAt(pl,p.x,p.y,p.h);
    if(OPT.info!==false&&pl.res.code){const tr=f.trail||(f.trail=[]);const lift=p.h/FT;tr.push({x:q.x-lift*.2,y:q.y-lift*.5});if(tr.length>26)tr.shift();
     const col={HR:'#ffcf4a',LD:'#ff6a4a',FB:'#7fc8ff',POP:'#c9a6ff',GB:'#f4f1e8',FOUL:'#9aa5ae'}[pl.res.code]||'#f4f1e8';
     wg.fillStyle=col;for(let k=0;k<tr.length-1;k++){wg.globalAlpha=(k/tr.length)*.75;wg.fillRect(Math.round(tr[k].x)-1,Math.round(tr[k].y)-1,k>tr.length*.6?3:2,k>tr.length*.6?3:2)}wg.globalAlpha=1}
    drawBall(wg,q.x,q.y,p.h)}return true})}
 if(ST.feature==='whale')drawUlsan(wg,now);
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
 // to screen
 const[vw,vh]=viewWH(S.cam.z);
 const sx=clamp(S.cam.x-vw/2,0,Math.max(0,W-vw)),sy=clamp(S.cam.y-vh/2,0,Math.max(0,H-vh));
 const scale=cv.height/vh;
 ctx.imageSmoothingEnabled=scale<1.6;ctx.imageSmoothingQuality='high';
 S.view={sx:vw>W?0:sx,sy,vw:Math.min(vw,W),vh,ox:vw>W?(cv.width-W*scale)/2:0,scale};
 if(vw>W){const dw=W*scale,ox=(cv.width-dw)/2;ctx.fillStyle='#1b232a';ctx.fillRect(0,0,cv.width,cv.height);
  // beyond the park walls: the city
  const CY=cityFor();if(CY){const x0=-(vw-W)/2,sw=Math.min(vw,W+CITY_M*2),sx2=Math.max(0,(x0+CITY_M)/2),dx=Math.max(0,(-CITY_M-x0))*scale;ctx.drawImage(CY,sx2,sy/2,sw/2,vh/2,dx,0,sw*scale,cv.height)}
  ctx.drawImage(wb,0,sy,W,vh,ox,0,dw,cv.height)}
 else ctx.drawImage(wb,sx,sy,vw,vh,0,0,cv.width,cv.height);
}

