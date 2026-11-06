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
// drawn over the finished frame in world pixels, on a 2px grid with flat colours so it reads as pixel art:
// a white column of spray thrown up and falling back, droplets, a foam patch and rings spreading out
function drawSplashes(c,vx0,vy0,scale,now){if(!SPLASH.length)return;SPLASH=SPLASH.filter(s=>now-s.t0<2600);
 c.save();c.setTransform(scale,0,0,scale,-vx0*scale,-vy0*scale);c.imageSmoothingEnabled=false;
 const P2=v=>Math.round(v/2)*2,px=(x,y,col)=>{c.fillStyle=col;c.fillRect(P2(x),P2(y),2,2)};
 const W1='#ffffff',W2='#d8f0fa',W3='#9fd8f6';
 for(const s of SPLASH){const t=(now-s.t0)/1000;
  // rings: dotted pixel ellipses that thin out as they spread
  for(let k=0;k<3;k++){const tt=t-k*.28;if(tt<0||tt>1.9)continue;const R=12+tt*60,n=Math.round(R*1.6),gap=tt>1.1?3:tt>.6?2:1,col=tt<.6?W1:tt<1.2?W2:W3;
   for(let i=0;i<n;i+=gap){const a=i/n*6.283;px(s.x+Math.cos(a)*R,s.y+Math.sin(a)*R*.55,col)}}
  // foam: a blocky disc that shrinks to scattered pixels
  if(t<1.4){const r=10+t*8,keep=1-t/1.4;for(let y=-r*.55;y<=r*.55;y+=2)for(let x=-r;x<=r;x+=2){if((x*x)/(r*r)+(y*y)/(r*r*.3)>1)continue;if(((Math.abs(x*7+y*13)|0)%10)/10>keep)continue;px(s.x+x,s.y+y,(x+y)%4===0?W2:W1)}}
  // droplets thrown up and falling, with their shadow on the water
  for(const d of s.drops){const h=d.up*t-220*t*t;if(h<-2||t>1.5)continue;const dx=Math.cos(d.a)*d.v*t,dy=Math.sin(d.a)*d.v*t*.55,sz=d.s>3?4:2;
   c.fillStyle=t<.7?W1:W2;c.fillRect(P2(s.x+dx),P2(s.y+dy-Math.max(0,h)),sz,sz);if(h>4){c.fillStyle='rgba(20,60,90,.3)';c.fillRect(P2(s.x+dx),P2(s.y+dy),2,2)}}
  // the column: stacked blocks, widest at the base
  if(t<.6){const H=95*Math.sin(Math.min(1,t/.22)*Math.PI/2)*(1-Math.max(0,t-.35)/.25*.6);for(let y=0;y<H;y+=2){const w=y<H*.2?16:y<H*.5?10:6;c.fillStyle=y>H-6?W2:W1;c.fillRect(P2(s.x-w/2),P2(s.y-y),w,2)}}}
 c.restore()}
