// ---------- roof lights: banks of floodlights along the stadium's outer rim, aimed down into the stands ----------
// At night each bank throws a pool of light onto the seats below it (added on top of the darkened bowl, never on the field).
let RL=null,RL_KEY='',RL_POOL=null;
function roofLights(){const key=S.you+(STADIUMS[S.you]?STADIUMS[S.you].dims.join(','):'');if(RL&&RL_KEY===key)return RL;RL_KEY=key;
 const OL=PARK_OUTLINE||parkOutline(),cxp=HX,cyp=HY-420;
 // walk the rim at even spacing
 const L=[];let acc=0;const step=150;
 for(let i=0;i<OL.length;i++){const a=OL[i],b=OL[(i+1)%OL.length],d=Math.hypot(b.x-a.x,b.y-a.y);if(a.open||b.open){acc=0;continue}let t=(step-acc)/d;
  while(t<=1){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;L.push({x,y});t+=step/d}acc=(acc+d)%step}
 RL=L.map(p=>{const dx=cxp-p.x,dy=cyp-p.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;
  // pool: a good way down the seating bowl, longer than it is wide
  return{x:p.x+ux*14,y:p.y+uy*14,ux,uy,px:p.x+ux*200,py:p.y+uy*200,ang:Math.atan2(uy,ux),ord:(Math.atan2(p.x-HX,HY-p.y)/Math.PI+1)/2}});
 // clip for the pools: inside the outer wall but outside the playing field
 // the playing field as the game sees it: fair ground to the fence, plus the foul strips 40 ft wide down each line
 const fp=new Path2D(),Q=(x,y)=>toPx(x,y),r2=Math.SQRT1_2,pt=(sd,al,pe)=>Q(sd*(al+pe)*r2,(al-pe)*r2);
 {let q=Q(0,-34);fp.moveTo(q.x,q.y);q=pt(-1,-5,40);fp.lineTo(q.x,q.y);q=pt(-1,328,40);fp.lineTo(q.x,q.y)}
 for(let th=-45;th<=45;th+=3){const r=fenceDist(th)+4,q=Q(Math.sin(th*RAD)*r,Math.cos(th*RAD)*r);fp.lineTo(q.x,q.y)}
 {let q=pt(1,328,40);fp.lineTo(q.x,q.y);q=pt(1,-5,40);fp.lineTo(q.x,q.y)}fp.closePath();
 const op=new Path2D();OL.forEach((q,i)=>op[i?'lineTo':'moveTo'](q.x,q.y));op.closePath();
 RL.clip=new Path2D();RL.clip.addPath(op);RL.clip.addPath(fp);
 if(!RL_POOL){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,244,214,.2)');gr.addColorStop(.5,'rgba(255,238,200,.09)');gr.addColorStop(1,'rgba(255,238,200,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);RL_POOL=c}
 return RL}
// is bank i lit right now? (the home-run show: slow off/on blinks, each bank a little behind the one before it)
function rlOn(){return true}// the roof ring stays on; the home-run show belongs to the light towers
let RL_GLOW=null;// one pre-drawn halo for every lamp bar (instead of a fresh gradient per lamp per frame)
function rlGlow(){if(RL_GLOW)return RL_GLOW;const c=document.createElement('canvas');c.width=c.height=60;const g=c.getContext('2d'),gr=g.createRadialGradient(30,30,0,30,30,30);gr.addColorStop(0,'rgba(255,248,220,.4)');gr.addColorStop(1,'rgba(255,248,220,0)');g.fillStyle=gr;g.fillRect(0,0,60,60);return RL_GLOW=c}
/* the light pools never change (the roof ring is always on), so all of them are added together once into one soft layer
   and that layer goes down in a single pass, instead of thirty-odd overlapping full-size blends every frame */
let RLP=null;
function rlPools(R){if(RLP&&RLP.R===R)return RLP;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const L of R){const ca=Math.cos(L.ang),sa=Math.sin(L.ang);for(const[u,v]of[[-260,-170],[260,-170],[-260,170],[260,170]]){const x=L.px+u*ca-v*sa,y=L.py+u*sa+v*ca;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}}
 const q=.35,cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil((x1-x0)*q));cv.height=Math.max(1,Math.ceil((y1-y0)*q));const g=cv.getContext('2d');
 g.scale(q,q);g.translate(-x0,-y0);g.globalCompositeOperation='lighter';
 for(const L of R){g.save();g.translate(L.px,L.py);g.rotate(L.ang);g.drawImage(RL_POOL,-260,-170,520,340);g.restore()}
 return RLP={R,cv,x:x0,y:y0,w:x1-x0,h:y1-y0}}
function drawRoofLights(c,vx0,vy0,scale,now){if(window.__noRL)return;if(S.phase==='title')return;const R=roofLights(),night=!!S.night;
 c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);
 if(night){c.save();c.clip(R.clip,'evenodd');c.globalCompositeOperation='lighter';
  {const P=rlPools(R);c.drawImage(P.cv,P.x,P.y,P.w,P.h)}
  c.restore()}
 // the fixtures themselves: a lamp bar on a little bracket at the roof's edge, facing the field
 for(const L of R){const on=rlOn(L,now);c.save();c.translate(L.x,L.y);c.rotate(L.ang+Math.PI/2);
  c.fillStyle='#2a3038';c.fillRect(-15,-3,30,9);c.fillStyle='#4a525c';c.fillRect(-15,-3,30,2);
  for(let k=0;k<4;k++){c.fillStyle=night?(on?'#fffbe8':'#3a3f46'):(on?'#d4dbe1':'#9aa3ab');c.fillRect(-13+k*7,1,5,4)}
  c.restore();
  if(night&&on){c.save();c.globalCompositeOperation='lighter';c.drawImage(rlGlow(),L.x-30,L.y-30,60,60);c.restore()}}
 c.restore()}
