// ---------- render ----------
const cv=$('cv'),ctx=cv.getContext('2d');
const wb=document.createElement('canvas');wb.width=W;wb.height=H;const wg=wb.getContext('2d');
let TOWERS=[];
let FIELD=null,DECOR=null,SIGNS=null,CROWD_A=null,CROWD_B=null,FANS=[],CONC=[],AISLES=[],RAIL=[],FLAGFANS=[];
function resize(){const r=cv.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,3);cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));VA=cv.height/cv.width}
new ResizeObserver(resize).observe(cv);resize();applyWide();if(/dbg/.test(location.hash))window.__pd={TEAMS,S,ev:s=>eval(s),ov:()=>[outsideFor(),wb,EXT_M,W,H],snap:(now,x,y,w,h,z)=>{render(now);const c=document.createElement("canvas");c.width=w*z;c.height=h*z;const g=c.getContext("2d");g.imageSmoothingEnabled=false;g.drawImage(wb,x,y,w,h,0,0,w*z,h*z);return c.toDataURL()},hp:()=>toPx(0,0),rt:(n,skip)=>{const t=performance.now();for(let i=0;i<n;i++){if(skip==="lights")window.__noRL=1;render(performance.now())}window.__noRL=0;return (performance.now()-t)/n},ballScr:()=>{const pl=S.play;if(!pl||S.camMode!=="follow"||!S.view)return null;const b=ballAt(pl,S.phase==="result"?pl.end:pl.t);if(!b)return null;const q=toPx(b.x,b.y),v=S.view;return{x:(q.x-v.sx)*v.scale/cv.width,y:(q.y-(b.h||0)/FT*.5-v.sy)*v.scale/cv.height,d:Math.hypot(b.x,b.y)|0,h:b.h|0}},go:()=>{const t=performance.now();tsGo(1);return performance.now()-t},prof:()=>{const T=[];const m=(n,f)=>{const t=performance.now();f();T.push(n+":"+Math.round(performance.now()-t))};m("sync",syncPicker);m("custom",applyCustom);m("hud",updateHUD);m("rebuild",rebuildPark);return T.join(" ")},logo:k=>LOGO[k],tile:k=>tsTile(k),tsp:(g,k,w,h,t)=>tsPaint(g,k,w,h,t,1),start:m=>startGame(m),show:()=>{S.lightShow=performance.now()},throw:k=>{S.phase="choose";startWindup(k)},zoom:d=>zoomBy(d),park:(t,n)=>{S.you=t;OPT.time=n?"night":"day";S.night=!!n;rebuildPark();buildCrowd()},toTitle:()=>toTitle(),sim:(e,h,b)=>simulateContact(e,h,b),win:()=>WIN,gameOver:w=>gameOver(w),fullInning:()=>fullInning(),pitcher:()=>pitcher(),aud:()=>({ramp:!!S.rampSrc,bufs:Object.keys(BUF),amb:BUS.amb?BUS.amb.gain.value:null,crowd:BUS.crowd?BUS.crowd.gain.value:null,music:BUS.music?BUS.music.gain.value:null})};

// Ulsan's board is a size up and sits in a navy frame shaped like a pair of whale flippers, on its own deck
function drawJumbo(g,now){if(S.you!=='ulsan')return drawJumbo0(g,now);
 const cx=HX/K,fy=(HY-fenceDist(0)/FT)/K,sc=1.22,yb=fy-8;g.save();g.translate(cx,yb);g.scale(sc,sc);g.translate(-cx,-yb);
 {const y0=-18,h=66,night=!!S.night,yc=y0+h/2;// the deck it stands on, and the flippers
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(cx-118,yb-4,250,16);g.fillStyle=night?'#3a4048':'#9aa3ad';g.fillRect(cx-122,yb-8,244,12);g.fillStyle=night?'#4a525c':'#c3cad1';g.fillRect(cx-122,yb-8,244,3);
  for(const sd of[-1,1]){const bx=cx+sd*101;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(bx+4,y0-2);g.quadraticCurveTo(bx+sd*40+4,yc-10,bx+sd*26+4,y0+h+14);g.lineTo(bx+4,y0+h);g.closePath();g.fill();
   g.fillStyle='#14325a';g.beginPath();g.moveTo(bx,y0-6);g.quadraticCurveTo(bx+sd*42,yc-14,bx+sd*28,y0+h+10);g.quadraticCurveTo(bx+sd*12,y0+h-4,bx,y0+h);g.closePath();g.fill();
   g.fillStyle='#2f6fd0';g.beginPath();g.moveTo(bx,y0-2);g.quadraticCurveTo(bx+sd*34,yc-12,bx+sd*24,y0+h+4);g.quadraticCurveTo(bx+sd*12,y0+h-6,bx,y0+h-4);g.closePath();g.fill();
   g.fillStyle='#9fd8f6';for(let k=0;k<4;k++)g.fillRect(bx+sd*(8+k*5)-(sd<0?3:0),y0+10+k*10,3,2)}}
 drawJumbo0(g,now);g.restore()}
function drawJumbo0(g,now){
 const cx=HX/K,x0=cx-95,y0=-18,w=190,h=66;
 // the board stands on steel: lattice legs down to concrete footings just behind the wall, braced across the middle
 {const fy=(HY-fenceDist(0)/FT)/K,yb=fy-8,yt=y0+h+2,night=!!S.night,legs=[x0+26,cx,x0+w-26];
  g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.moveTo(x0+8,yb+1);g.lineTo(x0+w-8,yb+1);g.lineTo(x0+w+30,yb+12);g.lineTo(x0+46,yb+12);g.closePath();g.fill();
  for(const lx of legs){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.moveTo(lx-2,yb);g.lineTo(lx+2,yb);g.lineTo(lx+24,yb+13);g.lineTo(lx+20,yb+14);g.closePath();g.fill()}
  // the horizontal brace between the legs
  const by1=yt+(yb-yt)*.35,by2=yt+(yb-yt)*.6;g.strokeStyle=night?'#4a545e':'#6b7680';g.lineWidth=1.4;g.beginPath();g.moveTo(legs[0],by1);g.lineTo(legs[2],by1);g.moveTo(legs[0],by2);g.lineTo(legs[2],by2);
  for(let x=legs[0],k=0;x<legs[2]-1;x+=10,k++){g.moveTo(x,k&1?by1:by2);g.lineTo(Math.min(legs[2],x+10),k&1?by2:by1)}g.stroke();
  for(const lx of legs){g.fillStyle=night?'#6d7884':'#9aa6b0';g.fillRect(lx-3.5,yt,3.5,yb-yt);g.fillStyle=night?'#3c4650':'#56606a';g.fillRect(lx,yt,3.5,yb-yt);
   g.strokeStyle='rgba(30,36,42,.7)';g.lineWidth=.6;g.beginPath();for(let y=yt;y<yb-1;y+=6){g.moveTo(lx-3.5,y);g.lineTo(lx+3.5,y+6);g.moveTo(lx+3.5,y);g.lineTo(lx-3.5,y+6)}g.stroke();
   g.fillStyle='#4a525b';g.fillRect(lx-7,yb-2,14,5);g.fillStyle='#6b747d';g.fillRect(lx-7,yb-2,14,1.5)}}
 // the board's depth: its top and back show past the frame, with a row of beacon lights along the crown
 g.fillStyle='#0c0f12';g.fillRect(x0-6,y0-11,w+12,8);g.fillStyle='#2a3038';g.fillRect(x0-6,y0-11,w+12,2);
 for(let k=0;k<12;k++){g.fillStyle=S.night?'#ffe9a8':'#c9ced3';g.fillRect(x0+4+k*(w-8)/11-1,y0-9,2,2)}
 if(S.you==='ulsan'){// the Whales' board wears a whale's tail rising out of a splash
  const tx=cx,ty=y0-13,tail=(sx,o)=>{g.beginPath();g.moveTo(tx-5*sx-o,ty+2);g.bezierCurveTo(tx-6-o,ty-12,tx-18-o,ty-20,tx-46-o,ty-36+o*.6);g.bezierCurveTo(tx-30,ty-24+o,tx-12,ty-26+o,tx,ty-20+o);
   g.bezierCurveTo(tx+12,ty-26+o,tx+30,ty-24+o,tx+46+o,ty-36+o*.6);g.bezierCurveTo(tx+18+o,ty-20,tx+6+o,ty-12,tx+5*sx+o,ty+2);g.closePath()};
  g.fillStyle='rgba(0,0,0,.25)';tail(1,-4);g.fill();
  g.fillStyle='#14325a';tail(1,1.6);g.fill();g.fillStyle='#2f6fd0';tail(1,0);g.fill();
  g.fillStyle='#6fa8ee';g.beginPath();g.moveTo(tx-3,ty-4);g.bezierCurveTo(tx-6,ty-14,tx-18,ty-21,tx-40,ty-33);g.bezierCurveTo(tx-24,ty-24,tx-10,ty-23,tx-2,ty-18);g.closePath();g.fill();
  for(let k=0;k<14;k++){const a=Math.PI*(1+k/13),r=20+(k%3)*5;g.fillStyle=k%2?'#9fd8f6':'#e8f6ff';g.beginPath();g.arc(tx+Math.cos(a)*r*1.3,ty+2+Math.sin(a)*r*.35,2+(k%3),0,7);g.fill()}
  g.fillStyle='#e8f6ff';g.fillRect(tx-22,ty,44,3)}
 g.fillStyle='#3a424b';g.fillRect(x0-6,y0-5,w+12,h+12);g.fillStyle='#14181c';g.fillRect(x0-4,y0-4,w+8,h+8);g.fillStyle='#05080a';g.fillRect(x0,y0,w,h);
 g.fillStyle='#59636d';for(let k=-4;k<=w+4;k+=8){g.fillRect(x0+k,y0+h+5,1,1);g.fillRect(x0+k,y0-5,1,1)}// bolts along the frame
 g.fillStyle='#8b96a0';g.fillRect(x0-6,y0+h+7,w+12,1.5);g.fillStyle='#59636d';for(let k=-4;k<=w+6;k+=9)g.fillRect(x0+k,y0+h+7,1,3);// catwalk rail
 const msg=S.jumbo&&now<S.jumbo.until?S.jumbo:null;
 g.textBaseline='middle';
 if(msg){
  const flash=Math.floor(now/180)%2;
  g.fillStyle=flash?TEAMS[S.you].jersey:'#ffbf3c';g.font='12px "Press Start 2P", monospace';g.textAlign='center';g.fillText(msg.text,cx,y0+h/2-(msg.kr?12:6),w-12);
  if(msg.kr){g.fillStyle='#f1ecdc';g.font='16px Jua, sans-serif';g.fillText(msg.kr,cx,y0+h/2+10,w-12)}else g.drawImage(LOGO[S.you],cx-9,y0+h-24,18,18);
 }else{
  g.drawImage(LOGO[S.you],x0+6,y0+8,50,50);
  g.textAlign='left';g.font='bold 12px "Pixelify Sans", monospace';
  g.fillStyle='#f1ecdc';g.fillText(TEAMS[S.opp].name,x0+64,y0+16,90);g.fillText(TEAMS[S.you].name,x0+64,y0+32,90);
  g.fillStyle='#ffbf3c';g.textAlign='right';
  const started=S.phase!=='title';g.font='10px "Press Start 2P", monospace';
  g.fillText(started?String(S.target):'-',x0+w-8,y0+17);g.fillText(started?String(S.runs):'-',x0+w-8,y0+33);
  g.fillStyle='#94b4a1';g.textAlign='left';g.font='12px "Pixelify Sans", monospace';
  g.fillText(started?`${S.half==='top'?'TOP':'BOT'} ${ord(S.inning).toUpperCase()} · ${Math.min(S.outs,2)} OUT · ${S.balls}-${S.strikes}`:(S.night?'TONIGHT AT THE PARK':'TODAY AT THE PARK'),x0+64,y0+50,w-70);
 }
 g.fillStyle='rgba(0,0,0,.28)';for(let yy=y0;yy<y0+h;yy+=2)g.fillRect(x0,yy,w,1);
}
// the benches: a row of players leaning on the front rail, mostly still (a weight shift, a look around now and then),
// and a few in the back of the dugout wandering up and down. A touch smaller than the players on the field.
function drawDugoutCrew(g,now){
 [[S.you,1],[S.opp,-1]].forEach(([k,sd])=>{const T=TEAMS[k],c=dugoutFrame(sd),a=-sd*45*RAD,ca=Math.cos(a),sa=Math.sin(a);
  const at=(lx,ly)=>({x:(c.x+lx*ca-ly*sa)*K,y:(c.y+lx*sa+ly*ca)*K});
  if(S.celebr&&S.celebr.k===k)return;// they're all out on the field mobbing the plate
  const party=k===S.you&&now<S.cheerUntil,pants=k===S.you?'#eeeae0':'#a9b0b5',names=(T.staff||[]).slice(1).concat(T.lineup||[]),out=[];
  const skinFor=j=>{const nm=names[j]&&names[j].name;return nm?skinOf(nm):SKINS[hash(T.name+j)%5]};
  // front rail (the field side of the dugout): five guys, standing still
  for(let j=0;j<5;j++){const h=hash(T.name+'|f'+j),lx=-52+j*26+(h%5)-2,ph=(h%1000)/159;
   const shift=Math.sin(now/2600+ph)>.6;// every so often he shifts his weight and turns to look down the bench
   let legs=shift?'ready':'stand',arms=h%3===0?'ready':'down',hop=0;
   if(party){arms=Math.floor(now/220+j)%2?'catch':'down';hop=Math.round(Math.abs(Math.sin(now/130+j*1.7))*3)}
   out.push({p:at(lx,-10),hop,legs,arms,frame:0,flip:(h&1)?!shift:shift,skin:skinFor(j)})}
  // back of the dugout, in front of the bench: three wandering up and down
  for(let j=0;j<3;j++){const h=hash(T.name+'|b'+j),span=18+(h%14),w=.00022+(h%4)*.00006,ph=(h%1000)/159,pos=Math.sin(now*w+ph),vel=Math.cos(now*w+ph),moving=Math.abs(vel)>.3;
   const lx=-40+j*40+pos*span;let legs=moving?'run':'stand',arms=moving?'run':'down',hop=0;
   if(party){legs='stand';arms=Math.floor(now/200+j)%2?'catch':'down';hop=Math.round(Math.abs(Math.sin(now/140+j))*3)}
   out.push({p:at(lx,2),hop,legs,arms,frame:Math.floor(now/230)+j,flip:vel*sd<0,skin:skinFor(5+j)})}
  out.sort((u,v)=>u.p.y-v.p.y).forEach(o=>drawPlayer(g,o.p.x,o.p.y-o.hop,T,{legs:o.legs,arms:o.arms,frame:o.frame,skin:o.skin,pants,flip:o.flip,sc:1.02}));
 })}
function drawCheer(g,now){
 const T=TEAMS[S.you],c=cheerFrame(),hype=now<S.cheerUntil;
 g.save();g.translate(c.x,c.y);g.rotate(-45*RAD);
 for(let j=0;j<4;j++){
  const x=-27+j*18,lead=j===3,beat=Math.floor(now/(hype?110:240)+j)%2,y=-3-(hype&&beat?2:0);
  const sk=SKINS[(j*2+1)%SKINS.length];
  g.fillStyle=lead?'#f4f1e8':T.jersey;g.fillRect(x-3,y,6,6);g.fillStyle=lead?T.cap:CREAM;g.fillRect(x-3,y+4,6,2);
  g.fillStyle=sk;g.fillRect(x-1,y-3,3,3);g.fillStyle=lead?T.cap:'#2a1d14';g.fillRect(x-1,y-4,3,1);
  if(lead){g.fillStyle='#e8e1cf';g.fillRect(x+3,y-2+(beat?-1:0),3,2)}
  else{const py=beat?y-6:y+1;g.fillStyle=CREAM;g.fillRect(x-6,py,3,3);g.fillStyle=T.jersey;g.fillRect(x+4,beat?y+1:y-6,3,3)}
 }
 g.restore();
}
function drawFlags(g,now){
 const xs=[298,320,342,364,596,618,640,662];
 ORDER.forEach((k,n)=>{const T=TEAMS[k],x=xs[n],y=3;
  g.fillStyle='#14181c';g.fillRect(x,y,1,15);
  for(let c=0;c<12;c++){const o=Math.round(Math.sin(now/220+c*.55+n)*1.4);g.fillStyle=T.jersey;g.fillRect(x+1+c,y+1+o,1,7);g.fillStyle=T.cap;g.fillRect(x+1+c,y+1+o,1,2)}
 });
}
function burst(x,y){const T=TEAMS[S.you];const col=pick([T.jersey,'#ffbf3c',CREAM,'#7fe0d6','#ff7a66']);
 for(let k=0;k<40;k++){const a=k/40*Math.PI*2,sp=rand(35,85)*K;S.fx.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,col})}}
function baseChase(now){
 if(!S.baseChase)return;const step=Math.floor((now-S.baseChase)/85);
 if(step>=9){S.baseChase=0;for(let k=1;k<=3;k++){$('d'+k).classList.remove('chase');$('d'+k).classList.remove('on')}return}
 const lit=step%3+1;for(let k=1;k<=3;k++){$('d'+k).classList.toggle('chase',k===lit);$('d'+k).classList.remove('on')}
}
function drawFlame(now){
 const c=$('flame');
 if(!S.flame){if(!c.hidden)c.hidden=true;return}
 const age=(now-S.flame)/1000;
 if(age>1.9){S.flame=0;c.hidden=true;$('tag').classList.remove('hot');return}
 c.hidden=false;const g=c.getContext('2d');const Wc=c.width,Hc=c.height;g.clearRect(0,0,Wc,Hc);
 const cols=['#fff2b0','#ffd23f','#ff9a1f','#ff5a1a','#c8200e'];const tick=Math.floor(now/55);
 for(let x=0;x<Wc;x++){
  const pass=age-(x/Wc)*.55;if(pass<0)continue;
  const st=pass<.18?1:Math.max(0,1-(pass-.18)/.95);if(!st)continue;
  const n=((Math.imul(x*31+tick,2654435761)>>>0)%100)/100;
  const h=Math.round(st*Hc*.92*(.5+.5*n));
  for(let yy=0;yy<h;yy++){const k=yy/Math.max(1,h);g.globalAlpha=.88-k*.3;g.fillStyle=cols[Math.min(4,Math.floor(k*5))];g.fillRect(x,Hc-1-yy,1,1)}
 }
 g.globalAlpha=1;
}
// ---- players: built from parts so legs, arms and head animate independently ----
const UMP={jersey:'#2c2c30',cap:'#151517',brim:'#0c0c0e'};
const FLIPS=[{n:'spin',h:32,d:24,spins:3,dur:1.1,arms:'punch'},{n:'helicopter',h:22,d:8,spins:5,dur:1.0,arms:'catch',heli:true},{n:'toss',h:12,d:32,spins:1,dur:.75,arms:'down'},{n:'moon',h:50,d:14,spins:4,dur:1.4,arms:'punch'},{n:'drop',h:3,d:4,spins:.25,dur:.45,arms:'down'}];
const SHOE='#1b1b1e',GLOVE='#7a4a24',BELT='#2a2a2e',GEAR='#2f3036';
const KMAP=['1001','1010','1100','1010','1001'];
function spawnFlash(n){if(S.mode==='bp'&&S.phase!=='title')return;if(S.night)n=n>=10?n*4:Math.ceil(n*.5);for(let k=0;k<n&&FANS.length;k++){const f=FANS[(Math.random()*FANS.length)|0];S.flashes.push({x:f.x+((Math.random()*5)|0)-2,y:f.y-4,t:performance.now()})}}
function drawCrowdLife(g,now){
 const cheer=now<S.cheerUntil;
 // fans popping up out of their seats
 for(const f of S.fidg)g.drawImage(CROWD_B,f.x-5,f.y-11,10,15,f.x-5,f.y-11,10,15);
 // beach ball: nearby fans reach up for it
 const b=S.bb;
 if(b){for(const f of FANS){if(Math.abs(f.x-b.x)<14&&Math.abs(f.y-b.y)<14)g.drawImage(CROWD_B,f.x-5,f.y-11,10,15,f.x-5,f.y-11,10,15)}}
 // flag wavers
 for(const f of FLAGFANS){
  const amp=cheer?2.2:1;const sw=Math.round(Math.sin(now/(cheer?120:260)+f.ph)*amp);
  const x=f.x+3,y=f.y-6;g.fillStyle='#3a2a1c';g.fillRect(x+sw,y-9,1,10);
  for(let c=0;c<8;c++){const o=Math.round(Math.sin(now/(cheer?90:180)+c*.7+f.ph)*(cheer?1.6:1));g.fillStyle=f.a;g.fillRect(x+sw+1+c,y-9+o,1,5);g.fillStyle=f.b;g.fillRect(x+sw+1+c,y-9+o,1,1)}
 }
 // pennants strung along the concourse rail
 const T=TEAMS[S.you],cols=[T.jersey,T.cap,'#f4f1e8'];
 for(let k=0;k<CONC.length;k+=5){const c=CONC[k];const o=Math.round(Math.sin(now/300+k*.4));
  g.fillStyle=cols[(k/5|0)%3];for(let r=0;r<6;r++){const w=Math.max(1,5-r);g.fillRect(Math.round(c.x)-2+((5-w)>>1)+(r>2?o:0),Math.round(c.y)+r,w,1)}}
 // visitor fans post a K card for every strikeout
 for(let k=0;k<Math.min(S.ks,12);k++){const th=-41+k*2.3;const r=fenceDist(th)+5;const p=toPx(r*Math.sin(th*RAD),r*Math.cos(th*RAD));
  const x=Math.round(p.x)-3,y=Math.round(p.y)-5;g.fillStyle='#f4f1e8';g.fillRect(x,y,7,9);g.fillStyle='#c7262e';
  KMAP.forEach((row,ry)=>{for(let rx=0;rx<4;rx++)if(row[rx]==='1')g.fillRect(x+2+rx,y+2+ry,1,1)})}
 // vendors climbing the aisles
 if(S.vendors)for(const v of S.vendors){
  const ph=now/1000*v.sp+v.ph;const u=(Math.sin(ph)+1)/2;const r=lerp(v.r0,v.r1,u);
  const x=Math.round(HX+Math.sin(v.a*RAD)*r),y=Math.round(HY-Math.cos(v.a*RAD)*r);const step=Math.floor(now/180)%2;
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-2,y+1,6,1);
  g.fillStyle='#1b1f24';g.fillRect(x-1+step,y-1,1,2);g.fillRect(x+1-step,y-1,1,2);
  g.fillStyle='#f4f1e8';g.fillRect(x-2,y-6,5,5);g.fillStyle='#e0b48a';g.fillRect(x-1,y-9,3,3);
  g.fillStyle='#e0473d';g.fillRect(x-2,y-10,5,1);g.fillRect(x-1,y-11,3,1);
  g.fillStyle='#f5c935';g.fillRect(x-3,y-5,7,2);g.fillStyle='#c98f3c';g.fillRect(x-3,y-4,7,1);
 }
 // beach ball
 if(b){const h=Math.abs(Math.sin(b.ph))*10;const x=Math.round(b.x),y=Math.round(b.y);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-2,y+1,5,1);
  const yy=y-Math.round(h)-5;g.fillStyle='#f4f1e8';g.fillRect(x-2,yy,5,5);g.fillRect(x-3,yy+1,7,3);
  g.fillStyle='#e0473d';g.fillRect(x-3,yy+1,2,3);g.fillStyle='#3f82e6';g.fillRect(x+2,yy+1,2,3);g.fillStyle='#f5c935';g.fillRect(x-1,yy,2,1);g.fillRect(x,yy+4,2,1)}
 // camera flashes
 for(const f of S.flashes){const a=now-f.t;const x=f.x,y=f.y;
  if(a<45){g.fillStyle='#ffffff';g.fillRect(x-1,y-1,3,3);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x-4,y,9,1);g.fillRect(x,y-4,1,9);g.fillStyle='rgba(220,235,255,.35)';g.fillRect(x-2,y-2,5,5)}
  else{g.fillStyle=`rgba(255,255,255,${(1-(a-45)/115).toFixed(2)})`;g.fillRect(x,y,1,1);g.fillRect(x-1,y,3,1)}}
}
function drawGulls(g,now){
 for(const gl of S.gulls){const x=Math.round(gl.x),y=Math.round(gl.y);const fl=Math.floor(now/150+gl.ph)%2;
  g.fillStyle='rgba(6,18,10,.18)';g.fillRect(x+30,y+60,5,1);
  g.fillStyle='#f4f1e8';g.fillRect(x,y,2,2);g.fillStyle='#d5d9de';
  if(fl){g.fillRect(x-3,y-2,1,1);g.fillRect(x-2,y-1,2,1);g.fillRect(x+2,y-1,2,1);g.fillRect(x+4,y-2,1,1)}
  else{g.fillRect(x-3,y+1,3,1);g.fillRect(x+2,y+1,3,1)}}
}
function updateLife(dt,now){
 if(!FANS.length)return;
 const cheer=now<S.cheerUntil;
 const rate=(cheer?.04:.005)*dt*(S.night?(cheer?2.5:.6):1);let n=rate;while(n>0){if(Math.random()<Math.min(1,n))spawnFlash(1);n-=1}
 S.flashes=S.flashes.filter(f=>now-f.t<160);
 if(Math.random()<dt/(cheer?25:180)){const f=FANS[(Math.random()*FANS.length)|0];S.fidg.push({x:f.x,y:f.y,until:now+rand(500,2400)})}
 S.fidg=S.fidg.filter(f=>now<f.until);
 // beach ball wanders between nearby fans
 if(!S.bb){const f=FANS[(Math.random()*FANS.length)|0];S.bb={x:f.x,y:f.y,tx:f.x,ty:f.y,ph:0}}
 const b=S.bb;const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);
 if(d<2){const near=[];for(const f of FANS){const dd=Math.hypot(f.x-b.x,f.y-b.y);if(dd>30&&dd<110)near.push(f)}
  const t=near.length?near[(Math.random()*near.length)|0]:FANS[(Math.random()*FANS.length)|0];b.tx=t.x;b.ty=t.y}
 else{const sp=Math.min(d,55*dt/1000);b.x+=dx/d*sp;b.y+=dy/d*sp}
 b.ph+=dt/1000*6.5;
 // vendors
 if(!S.vendors&&AISLES.length){S.vendors=[];const pool=[...AISLES].sort(()=>Math.random()-.5).slice(0,5);for(const a of pool)S.vendors.push({...a,ph:rand(0,6),sp:rand(.08,.16)})}
 // gulls
 if(now>S.nextGull&&!S.night&&S.mode!=='bp'){S.nextGull=now+rand(18000,40000);const dir=Math.random()<.5?1:-1;const y0=rand(150,1000);const n=3+((Math.random()*3)|0);
  for(let k=0;k<n;k++)S.gulls.push({x:dir>0?-20-k*14:W+20+k*14,y:y0+k*(Math.random()<.5?8:-8),vx:dir*rand(70,95),vy:rand(-12,12),ph:k})}
 for(const gl of S.gulls){gl.x+=gl.vx*dt/1000;gl.y+=gl.vy*dt/1000}
 S.gulls=S.gulls.filter(gl=>gl.x>-80&&gl.x<W+80);
}
// throwing-arm path for the pitcher, sampled every frame (u: 0 start of the drive, .72 release, 1 end of follow-through)
const ARM_OVER=[[0,0,3],[.18,3,2.5],[.36,5.5,-1],[.52,3,-6],[.66,.5,-8],[.72,0,-6],[.78,-1,-1],[.88,-4,3],[1,-6,4]];
const ARM_SIDE=[[0,0,3],[.2,3.5,2],[.4,6,0],[.58,6.5,-1.5],[.68,4,-1],[.74,1,0],[.82,-3,1],[.92,-6,2],[1,-7,2.5]];

