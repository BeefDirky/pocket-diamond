// ---------- splash: a home run that comes down in water (Ulsan's sea and cove, Busan's harbor, the Daejeon pool) ----------
let SPLASH=[];
function waterAt(x,y){if(!ST)return false;const r=Math.hypot(x,y),th=Math.atan2(x,y)/RAD,ath=Math.abs(th),fd=y>0?fenceDist(Math.max(-45,Math.min(45,th))):0;
 if(ST.harbor){harborCol(HX+x/FT,HY-y/FT);return H_KIND===1||(hInCove(x,y)&&hCoveR(x,y)-Math.hypot(x-H_COVE_C.x,y-H_COVE_C.y)>8)}
 if(y<=0)return false;
 if(ST.feature==='ocean')return ath<33&&r>fd+26;
 if(ST.feature==='pool')return th>8&&th<30&&r>fd+9&&r<fd+49;
 if(ST.feature==='whale')return ath<36&&r>fd+14;
 return false}
// where a homer comes down: the end of the flight that leaves the park
function hrLand(play){let sg=null;for(const s of play.segs)if(s.air&&(!sg||s.t1>sg.t1))sg=s;if(!sg)for(const s of play.segs)if(!sg||s.t1>sg.t1)sg=s;return sg?sg.fn(sg.t1):null}
function splashCheck(play){const p=hrLand(play);if(!p||!waterAt(p.x,p.y))return false;const q=toPx(p.x,p.y);
 SPLASH.push({x:q.x,y:q.y,t0:performance.now(),drops:Array.from({length:40},()=>({a:rand(0,6.283),v:rand(25,110),up:rand(90,210),s:rand(2,4)}))});
 if(!muted)playSample('drop',.9,.6);return true}
// drawn over the finished frame in world pixels: a white crown of spray thrown up and falling back, rings spreading out
function drawSplashes(c,vx0,vy0,scale,now){if(!SPLASH.length)return;SPLASH=SPLASH.filter(s=>now-s.t0<2600);
 c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);
 for(const s of SPLASH){const t=(now-s.t0)/1000;
  // rings
  for(let k=0;k<3;k++){const tt=t-k*.28;if(tt<0)continue;const R=12+tt*60,a=Math.max(0,.75-tt*.42);if(a<=0)continue;c.strokeStyle=`rgba(232,246,255,${a})`;c.lineWidth=Math.max(1,3-tt);c.beginPath();c.ellipse(s.x,s.y,R,R*.55,0,0,7);c.stroke()}
  // foam patch
  if(t<1.4){const a=1-t/1.4;c.fillStyle=`rgba(255,255,255,${.55*a})`;c.beginPath();c.ellipse(s.x,s.y,10+t*10,(10+t*10)*.55,0,0,7);c.fill()}
  // the column and droplets: thrown up, falling back under gravity (height drawn as an upward offset)
  for(const d of s.drops){const h=d.up*t-220*t*t;if(h<-2)continue;const dx=Math.cos(d.a)*d.v*t,dy=Math.sin(d.a)*d.v*t*.55,a=Math.min(1,1.6-t);if(a<=0)continue;
   c.fillStyle=`rgba(240,250,255,${a})`;c.fillRect(Math.round(s.x+dx),Math.round(s.y+dy-Math.max(0,h)),Math.ceil(d.s),Math.ceil(d.s));
   if(h>0){c.fillStyle=`rgba(20,60,90,${.18*a})`;c.fillRect(Math.round(s.x+dx),Math.round(s.y+dy),Math.ceil(d.s),1)}}
  if(t<.6){const a=1-t/.6,H=95*Math.sin(Math.min(1,t/.22)*Math.PI/2);c.fillStyle=`rgba(255,255,255,${.9*a})`;c.fillRect(Math.round(s.x-5),Math.round(s.y-H),10,Math.round(H));c.fillStyle=`rgba(220,240,255,${.8*a})`;c.fillRect(Math.round(s.x-11),Math.round(s.y-H*.55),22,Math.round(H*.3));c.fillRect(Math.round(s.x-16),Math.round(s.y-H*.2),32,Math.round(H*.2))}}
 c.restore()}
