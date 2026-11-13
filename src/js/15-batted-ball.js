// ---------- batted-ball simulation (feet, game-seconds) ----------
function newPlay(){return{t:0,segs:[],fk:{},runners:[],end:0,ballGone:null,foul:false,res:null}}
const airSeg=(t0,t1,a,b,Hh,h0,h1)=>({t0,t1,air:true,from:a,to:b,fn:t=>{const u=(t1>t0)?(t-t0)/(t1-t0):1;return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),h:4*Hh*u*(1-u)+(h0==null?3:h0)*(1-u)+(h1||0)*u}}});
const throwSeg=(t0,a,b)=>{const d=dist(a,b);const sg=airSeg(t0,t0+d/THROW,a,b,2+d/30,8,10);sg.thr=true;sg.snd=true;return sg};
const fnSeg=(t0,t1,fn)=>({t0,t1,fn});
const holdSeg=(play,t0,t1,i)=>({t0,t1,hold:i,fn:t=>{const p=fpos(play,i,t);return{x:p.x,y:p.y,h:3}}});
function chase(i,p,tA){const f=POS[i];const t1=Math.max(tA,.05);const ks=[{t:0,x:f.x,y:f.y},{t:Math.min(f.re,t1*.5),x:f.x,y:f.y},{t:t1,x:p.x,y:p.y}];
 const dd=dist(f,p);if(dd>8){const c=Math.min(9,dd*.14)/dd;ks.push({t:t1+.25,x:p.x+(p.x-f.x)*c*.7,y:p.y+(p.y-f.y)*c*.7},{t:t1+.5,x:p.x+(p.x-f.x)*c,y:p.y+(p.y-f.y)*c})}
 return ks}
function pushKey(play,i,k){const ks=play.fk[i];if(!ks)return;while(ks.length>1&&ks[ks.length-1].t>=k.t)ks.pop();ks.push(k)}
const fromF=(play,i,t)=>{const q=fpos(play,i,t);return{x:q.x,y:q.y}};
function cover(i,b,tA){const f=POS[i],d=dist(f,b),t0=Math.min(.18,f.re);const run=t0+d/(f.sp*1.08);return[{t:0,x:f.x,y:f.y},{t:t0,x:f.x,y:f.y},{t:Math.max(.3,Math.min(tA-.05,run)),x:b.x,y:b.y}]}
const BASEPOS=POS.map(p=>({...p}));
function applyDefense(){
 const T=TEAMS[fldKey()];S.fpl=POSCODE.map((c,i)=>i===0?pitcher():T.lineup.find(p=>p.pos===c));
 S.fpl.forEach((pl,i)=>{const b=BASEPOS[i],d=pl.def;POS[i]={...b,sp:b.sp*.92*(.88+d*.0025),re:b.re*(1.2-d*.004),reach:b.reach*(.9+d*.002)}});
}
// 2025 MLB: batters reached on an error in 0.56% of plate appearances (1,018 times), under 1% of balls in play
const errChance=(i,base)=>base*.2*(S.fpl?(1.6-S.fpl[i].def/100*1.2):1);
function keepIn(p){
 const r=Math.hypot(p.x,p.y);if(r<1)return p;const th=Math.atan2(p.x,p.y)/RAD;
 if(Math.abs(th)<=45&&p.y>0){const m=fenceDist(th)-(ST?ST.wallFt+3:11);if(r>m)return{x:p.x*m/r,y:p.y*m/r}}
 else{const perp=(Math.abs(p.x)-p.y)/Math.SQRT2;if(perp>33){const k=perp-33,sx=Math.sign(p.x)||1;return{x:p.x-sx*k/Math.SQRT2,y:p.y+k/Math.SQRT2}}}
 return p;
}
// a diver keeps his momentum: he slides a few feet along his running line, stays down, then gets up from where he stopped
function fpos(play,i,t){const dv=play&&play.dive;
 if(dv&&dv.i===i&&t>dv.t){const b=fpos0(play,i,t<dv.t+.95?dv.t:t),o=(dv.L||0)*(1-Math.exp(-(t-dv.t)/.11));return keepIn({x:b.x+(dv.vx||0)*o,y:b.y+(dv.vy||0)*o})}
 return keepIn(fpos0(play,i,t))}
function diveOf(i,t,p){const f=POS[i],d=Math.max(1,dist(f,p));return{i,t,dir:Math.sign(p.x-f.x)||1,vx:(p.x-f.x)/d,vy:(p.y-f.y)/d,L:rand(3.5,6)}}
// on long, high flies the outfielder reads it, drifts back, then sprints, arriving just before the ball
function chaseLate(i,p,t1){const f=POS[i],d=dist(f,p),re=Math.min(f.re,t1*.5),tm=t1-.6*d/(f.sp*.95);const ks=chase(i,p,t1);
 if(tm>re+.1)ks.splice(2,0,{t:tm,x:lerp(f.x,p.x,.4),y:lerp(f.y,p.y,.4)});return ks}
function fpos0(play,i,t){
 const ks=play&&play.fk[i];if(!ks)return POS[i];
 if(t<=ks[0].t)return ks[0];
 for(let k=1;k<ks.length;k++)if(t<=ks[k].t){const a=ks[k-1],b=ks[k];const u=b.t>a.t?(t-a.t)/(b.t-a.t):1;return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u)}}
 return ks[ks.length-1];
}
function intercept(gfn,t0,t1,cands,extra,rk){
 extra=extra||0;rk=rk||1;
 for(let t=t0;t<=t1;t+=.04){
  const p=gfn(t);let best=null,bd=1e9;
  for(const i of cands){const f=POS[i];const dd=dist(f,p);if(rk<1&&i<=5&&Math.hypot(p.x,p.y)>Math.hypot(f.x,f.y)+(i<2?6:14))continue;// once a grounder is past him, an infielder doesn't run it down
  const need=f.re+extra+(rk<1&&i===0?.2:0)/* falling off the mound */+Math.max(0,dd-f.reach)/(f.sp*(i<=5?rk:OF_CHASE));if(need<=t&&dd<bd){bd=dd;best=i}}
  if(best!==null)return{i:best,t,p:{x:p.x,y:p.y}};
 }
 const p=gfn(t1);let bi=7,bd=1e9;for(const i of[6,7,8]){const dd=dist(POS[i],p);if(dd<bd){bd=dd;bi=i}}
 return{i:bi,t:t1,p:{x:p.x,y:p.y}};
}
function runnerList(b){
 const arr=[];for(let k=3;k>=1;k--)if(S.bases[k-1]){const r={from:k,who:S.bases[k-1],dest:k,start:0,speed:spdFt(S.bases[k-1]),out:false};if(S.stealCarry&&S.stealCarry[k]!=null)r.L0=S.stealCarry[k];arr.push(r)}
 arr.push({from:0,who:b,batter:true,dest:0,start:.65,speed:spdFt(b),out:false});return arr;
}
const fieldName=s=>s<-28?'left':s<-10?'left-center':s<=10?'center':s<=28?'right-center':'right';
const runsTxt=n=>n?` · ${n} run${n>1?'s':''} score${n>1?'':'s'}`:'';
function ambient(play){
 if(play.foul)return;const s0=play.segs[0];if(!s0)return;
 const bp=s0.fn(s0.t1),deep=Math.hypot(bp.x,bp.y)>150,air=!!s0.air,on=S.bases.some(Boolean);
 const caught=air&&!play.ballGone&&play.segs.some(sg=>sg.snd&&sg.air&&!sg.thr)&&play.caughtFly;
 const go=(i,p,k,dl)=>{if(play.fk[i])return;const f=POS[i],d=dist(f,p);if(d<2)return;const t0=f.re+(dl||0);play.fk[i]=[{t:0,x:f.x,y:f.y},{t:t0,x:f.x,y:f.y},{t:t0+d/(f.sp*(k||.85)),x:p.x,y:p.y}]};
 const B1={x:BASES[1].x-2,y:BASES[1].y+1},B2={x:BASES[2].x,y:BASES[2].y-2},B3={x:BASES[3].x+2,y:BASES[3].y+1};
 if(deep){
  if(caught&&!on){ // routine out with nobody on: infielders just turn and drift a step or two, no relay
   for(const i of[2,3,4,5])go(i,{x:lerp(POS[i].x,bp.x,.06),y:lerp(POS[i].y,bp.y,.06)},.4);
   for(const i of[6,7,8])go(i,{x:lerp(POS[i].x,bp.x,.25),y:lerp(POS[i].y,bp.y,.25)},.7);return}
  go(2,B1);go(4,B3);
  const tgt=(S.bases[0]||S.bases[1])?B3:B2,cp={x:lerp(tgt.x,bp.x,.42),y:lerp(tgt.y,bp.y,.42)},cut=nearMid(cp);
  go(cut,cp,.95);
  go(0,on?{x:-12,y:-24}:{x:-42,y:34},.8);go(1,{x:0,y:-1},.5);
  for(const i of[6,7,8])go(i,{x:lerp(POS[i].x,bp.x,.3),y:lerp(POS[i].y,bp.y,.3)},.85);
 }else{
  if(caught&&!on){for(let i=0;i<9;i++)if(i!==1)go(i,{x:lerp(POS[i].x,bp.x,.12),y:lerp(POS[i].y,bp.y,.12)},.45);return}
  go(2,B1);go(4,B3);
  if(!play.fk[5])go(5,B2);else go(3,B2);
  go(3,{x:lerp(POS[3].x,bp.x,.25),y:lerp(POS[3].y,bp.y,.25)});
  go(1,on?{x:0,y:-1}:{x:30,y:14},.9,.1);
  go(0,!air&&bp.x>15?{x:34,y:52}:{x:lerp(0,bp.x,.2),y:lerp(58,bp.y,.2)},.9);
  go(8,{x:96,y:44},.9);go(7,{x:0,y:178},.9);go(6,{x:-92,y:52},.85,.15);
 }
}
function finalize(play,runners,res){
 play.runners=runners;
 let e=0;for(const s of play.segs)e=Math.max(e,s.t1);
 for(const r of runners)e=Math.max(e,r.out?r.outAt:r.start+Math.abs(r.dest-r.from)*LEG/r.speed+(r.batter&&r.dest===1?(r.round?1.45:.95):0));
 for(const k in play.fk){const ks=play.fk[k];e=Math.max(e,ks[ks.length-1].t)}
 play.end=e+.6;
 {let lo=0,n=0;for(const r of runners)if(r.out){n++;lo=Math.max(lo,r.outAt||0)}play.lastOutAt=n?lo:null;
  if(n&&S.outs+(res.outs||n)>=3&&!res.steal&&S.mode!=='bp'){play.endsInning=true;play.end=Math.min(play.end,lo+.75)}}
 ambient(play);   // background movement never lengthens the play
 for(const r of runners){const b=r.dest;if(b!==2&&b!==3&&!(b===4&&r.closeHome))continue;if(r.dest<=r.from)continue;
  const L=(r.from>=1&&r.tagAt==null)?(r.L0!=null?r.L0:(LEADFT[r.from]+3)/LEG):0,tArr=r.start+((r.dest-r.from)-L)*LEG/r.speed;
  let tThr=null;for(const sg of play.segs)if(sg.thr&&dist(sg.to,BASES[b%4])<5)tThr=sg.t1;
  // every runner going into second or third slides in feet first; stealers (and close plays at home) may dive head first
  const into23=(b===2||b===3)&&!r.steal;
  if(into23||r.steal||(r.out&&r.outAt!=null)||(tThr!=null&&Math.abs(tThr-tArr)<.7)){const tA=tArr;r.slide={t0:tA-.5,t1:tA,head:into23?false:(r.steal||Math.random()<.4),b}}}
 {let tE=0;for(const sg of play.segs)tE=Math.max(tE,sg.t1);
  for(let i=0;i<9;i++){if(play.dive&&play.dive.i===i)continue;const f=POS[i],ks=play.fk[i],lastT=ks?ks[ks.length-1].t:0,t0=Math.max(tE+.2,lastT),a=fpos(play,i,t0),d=dist(a,f);if(d<4)continue;
   if(!play.fk[i])play.fk[i]=[{t:0,x:f.x,y:f.y}];
   const tgt={x:lerp(a.x,f.x,.55),y:lerp(a.y,f.y,.55)};
   if(t0>lastT)play.fk[i].push({t:t0,x:a.x,y:a.y});play.fk[i].push({t:t0+.05+d*.55/(f.sp*.55),x:tgt.x,y:tgt.y})}}
 if(!res.newBases){const nb=[null,null,null];for(const r of runners)if(!r.out&&r.dest>=1&&r.dest<=3)nb[r.dest-1]=r.who;res.newBases=nb}
 if(res.runs==null)res.runs=runners.filter(r=>!r.out&&r.dest===4).length;
 play.res=res;
 {const s0=play.segs[0];play.reachAt=s0&&s0.air?s0.t1:.3}
 return play;
}
function simulateContact(err,hand,b){
 const q0=clamp(1-Math.pow(Math.abs(err)/WIN,1.05)+(b.con-50)*.002-(S.pitch&&S.pitch.k==='SL'?.15:S.pitch&&S.pitch.k==='KN'?.12:S.pitch&&S.pitch.k==='CB'?.1:0),0,1);
 // the curveball's hidden sweet spot: a swing that lands right on the seam between GOOD and LATE stays back on it
 // and drives it the other way (never shown on the timing bar)
 const sweet=S.pitch&&S.pitch.k==='CB'&&Math.abs(err-WIN*GOODK)<=WIN*.045;
 let q=q0;if(sweet)q=Math.max(q,.94);
 // exit velocity and launch angle, shaped on 2025 MLB batted balls (avg ~89 mph, ~13 deg; 42% grounders, 24% liners):
 // timing raises the exit velocity and tightens the angle, but even a perfect swing can be topped or got under
 const pf=S.pitch&&(S.pitch.k==='SL'||S.pitch.k==='CB')?-2:0;
 let EV=sweet?clamp(100+(b.pow-50)*.22+randn()*3,94,116):clamp(63.5+30*Math.pow(q,1.4)+(b.pow-50)*.25+pf+randn()*(11-5*q),40,118);
 let L;
 const perf=Math.abs(err)<=WIN*PERFK;// right on the PERFECT mark: squared up, a line drive more often than not
 if(sweet)L=rand(19,31);
 else if(perf)L=clamp(16+randn()*10,-20,55);
 else L=clamp(14*q+randn()*(36-12*q*q),-50,75);// square contact lifts it on a line; mistimed contact is topped or got under
 L+=(b.pow-50)*.06;
 // a barrel: hard and in the air at the right angle (2025 MLB ~8% of batted balls, most of the home runs). Better timing and
 // more power barrel it more often; a swing right on the PERFECT mark doubles the chance
 const bar=!sweet&&Math.random()<(.01+.12*Math.pow(q,4)*(.55+b.pow/110))*(perf?2:1);
 if(bar){EV=Math.max(EV,clamp(99+(b.pow-50)*.2+randn()*4,95,117));L=rand(21,34)}
 else if(perf){EV+=5}
 const pull=hand==='R'?-1:1;
 const tm=Math.min(1.25,Math.abs(err)/WIN);
 const s=pull*(Math.sign(-err)*Math.pow(tm,.75)*50+3)+randn()*6;
 const dir={x:Math.sin(s*RAD),y:Math.cos(s*RAD)};
 const P={err,q,EV,L,s};S.lastBB=P;
 if(S.mode==='bp')return buildBP(P,dir,b);
 // fouls: fewer than MLB's ~half of contact, which made at-bats drag. Late or early contact fouls off more;
 // a PERFECT swing almost always stays fair
 if(!sweet&&Math.random()<(perf?.05:.2+.4*(1-q)+(S.strikes===2?.04:0))){const fs=(Math.random()<.5?-1:1)*rand(48,160);return buildFoul(P,{x:Math.sin(fs*RAD),y:Math.cos(fs*RAD)})}
 if(Math.abs(s)>45)return buildFoul(P,dir);
 if(L<10)return buildGrounder(P,dir,b);
 return buildAir(P,dir,b);
}

