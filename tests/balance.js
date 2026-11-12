// Balance harness: plays thousands of plate appearances through the game's own pitch, swing and batted-ball code
// (no animation) and prints result rates next to the 2025 MLB league totals (Baseball-Reference).
//
//   python3 tools/build.py && python3 -m http.server 8771 &      (from the repo root)
//   node tests/balance.js [PA per scenario, default 20000]
//
// SC=cpu,you25,you40,you60,pitch12,pitch20 picks scenarios (default: all of them)
//   cpu      both teams on the computer (watch mode, and every CPU at-bat in a game); this one should match MLB
//   youNN    a human batter: swings at 75% of strikes and 28% of balls, timing error ~ N(0, NN ms)
//   pitchNN  you pitch, CPU bats; your meter release lands ~ |N(0, NN/100)| from centre
// GRID=300 instead prints hit rates for a grid of exit velocity x launch angle (the fielding "physics")
const {chromium}=require('playwright');
const N=+process.argv[2]||20000;
const URL='http://localhost:8771/index.html#dbg';

// 2025 MLB, all 30 teams (Baseball-Reference league batting totals)
const MLB={PA:182926,H:40138,D:7745,T:628,HR:5650,BB:15379,SO:40645,HBP:1928,ROE:1018,GDP:3122,SF:1307,R:21614,G:4860};

const HARNESS=String.raw`
window.__grid=function(n){S.mode='full';S.auto=true;S.half='top';setSides();const b={...curBatter(),pow:60,con:60,spd:60};const o={};
 for(const L of[-20,-10,0,5,10,15,20,25,30,35,40,50,60])for(const EV of[60,70,80,90,95,100,105,110]){const c={};
  for(let k=0;k<n;k++){S.bases=[null,null,null];S.outs=0;const s=rand(-43,43),P={err:0,q:.9,EV,L,s},d={x:Math.sin(s*RAD),y:Math.cos(s*RAD)};
   const r=(L<10?buildGrounder(P,d,b):buildAir(P,d,b)).res;c[r.code]=(c[r.code]||0)+1}
  o[L+'/'+EV]=c}return o};
window.__bal=function(n,o){
 o=o||{};const out={PA:0,c:{},pitches:0,wp:0,pp:{zone:0,swing:0,zsw:0,osw:0,whiff:0,foul:0,inplay:0,called:0,ball:0},runs:0,outs:0,bip:0,ev:[],perf:{n:0,hr:0,h:0,c:{}}};
 const inc=k=>out.c[k]=(out.c[k]||0)+1;
 const rn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const keep={sfx,banner,logPA,crowdReach,crowdSad,organCue,playSample,showTiming};
 S.you=o.you||'busan';S.opp=o.opp||'seoul';
 startGame('full');S.auto=o.mode==='cpu';out.pulls=0;
 // humans: o.mode 'you' bats in the bottom half; 'pitch' pitches the top half
 const side=o.mode==='pitch'?'top':o.mode==='you'?'bot':null;
 let half=0;
 const newHalf=()=>{half++;S.half=side||(half%2?'top':'bot');setSides();S.outs=0;S.bases=[null,null,null];S.balls=0;S.strikes=0;
  const f=fldKey();if(stamOf(f)<=12){S.pcOf[f]=0;stamReset(f)}S.steal=null};
 newHalf();
 const bg=buildGrounder,ba=buildAir;let lastP=null;buildGrounder=(P,d,b)=>{lastP=P;return bg(P,d,b)};buildAir=(P,d,b)=>{lastP=P;return ba(P,d,b)};
 out.evs=0;out.las=0;out.nP=0;out.gb=0;out.ld=0;out.fb=0;out.pu=0;
 while(out.PA<n){lastP=null;if(out.PA%200===0){const lg=document.getElementById('log');if(lg)lg.innerHTML=''}
  const bk=batKey(),ord0=S.orderOf[bk],outs0=S.outs,b0=S.balls,s0=S.strikes,run0=S.runs+S.target;
  startWindup();
  const p=S.pitch;
  if(o.mode==='pitch'){// the meter: |position - centre| ~ |N(0, sd)|
   const pz=.05+pitcher().ctl*.0006,d=Math.abs(rn()*o.meter),q=d<=pz?1:clamp(1-(d-pz)/.45,0,1)*.85;p.q=q}
  const on=S.bases.some(Boolean);const now=performance.now();release(now);out.pitches++;if(p.wild&&on)out.wp++;if(p.inZone)out.pp.zone++;
  if(o.mode==='you'&&!p.hbp){
   const sw=p.inZone?o.swIn:o.swOut+(S.strikes===2?.1:0);
   if(Math.random()<sw){const err=clamp(rn()*o.sigma+(o.bias||0),-400,400);p.releaseAt=performance.now()-p.travel-err;swing0()}}
  const sw=S.swing,pp=out.pp;if(sw){pp.swing++;if(p.inZone)pp.zsw++;else pp.osw++;if(sw.miss)pp.whiff++}else if(!p.hbp){if(p.inZone)pp.called++;else pp.ball++}
  if(sw&&!sw.miss){doContact();const r=S.play.res;if(r.code==='FOUL')pp.foul++;else pp.inplay++;
   if(r.code!=='FOUL'&&lastP&&!lastP.bunt){out.nP++;out.evs+=lastP.EV;out.las+=lastP.L;const L=lastP.L,hh=r.hit&&!r.hr;out.bk=out.bk||{gb:[0,0],ld:[0,0],fb:[0,0],pu:[0,0]};const bk=L<10?'gb':L<25?'ld':L<50?'fb':'pu';out.bk[bk][0]++;if(hh)out.bk[bk][1]++;if(L<10)out.gb++;else if(L<25)out.ld++;else if(L<50)out.fb++;else out.pu++}
   if(r.code!=='FOUL'){out.bip++;
    if(o.mode==='you'&&Math.abs(sw.err)<=WIN*PERFK){out.perf.n++;out.perf.c[r.code]=(out.perf.c[r.code]||0)+1;if(r.hr)out.perf.hr++;if(r.hit)out.perf.h++}}
   finishPlay();if(r.code!=='FOUL'){inc(r.code);out.PA++}}
  else{pitchEnd();
   if(S.orderOf[bk]!==ord0||S.outs>outs0){out.PA++;
    inc(p.hbp&&!sw?'HBP':S.outs>outs0&&s0===2?'K':b0===3?'BB':'other')}}
  out.runs+=S.runs+S.target-run0;
  out.hr_=(out.hr_||0)+S.runs+S.target-run0;
  if(S.outs>=3){out.outs+=3;(out.halves=out.halves||[]).push(out.hr_);out.hr_=0;newHalf()}
 }
 buildGrounder=bg;buildAir=ba;S.phase='title';return out};
`;

(async()=>{
 const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:900,height:700},serviceWorkers:'block'});
 await ctx.route('**/index.html',async r=>{const res=await r.fetch();let t=await res.text();
  const i=t.lastIndexOf('\n})();');if(i<0)throw new Error('no IIFE end');t=t.slice(0,i)+'\n'+HARNESS+t.slice(i);
  r.fulfill({response:res,body:t,headers:{...res.headers(),'content-type':'text/html'}})});
 let pg=null;
 const open=async()=>{if(pg)await pg.close();pg=await ctx.newPage();pg.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await pg.goto(URL);await pg.waitForFunction(()=>window.__bal&&window.__pd,null,{timeout:30000});await pg.waitForTimeout(1000)};
 await open();
 const pct=(a,b)=>(100*a/b).toFixed(1).padStart(5)+'%';
 const mlbPA=MLB.PA,S1=MLB.H-MLB.D-MLB.T-MLB.HR;
 const row=(name,c,PA,ref)=>console.log(name.padEnd(5),pct(c,PA),ref!=null?'   MLB '+pct(ref,mlbPA):'');
 const show=(title,r)=>{const c=r.c,g=k=>c[k]||0,PA=r.PA;
  const s1=g('1B')+g('IFH'),hr=g('HR')+g('IPHR'),H=s1+g('2B')+g('3B')+hr,AB=PA-g('BB')-g('HBP')-g('SF');
  const outsIP=g('GO')+g('FO')+g('LO')+g('PO')+g('DP')+g('FC')+g('LDP')+g('SF');
  console.log('\n== '+title+'  ('+PA+' PA, '+r.pitches+' pitches)');
  row('1B',s1,PA,S1);row('2B',g('2B'),PA,MLB.D);row('3B',g('3B'),PA,MLB.T);row('HR',hr,PA,MLB.HR);
  row('BB',g('BB'),PA,MLB.BB);row('HBP',g('HBP'),PA,MLB.HBP);row('K',g('K'),PA,MLB.SO);row('E',g('E'),PA,MLB.ROE);row('DP',g('DP')+g('LDP'),PA,MLB.GDP);
  row('outIP',outsIP,PA,MLB.PA-MLB.H-MLB.BB-MLB.SO-MLB.HBP-MLB.ROE);
  const bip=r.bip,hrB=hr/bip;
  console.log('AVG',(H/AB).toFixed(3),' OBP',((H+g('BB')+g('HBP'))/PA).toFixed(3),' SLG',((s1+2*g('2B')+3*g('3B')+4*hr)/AB).toFixed(3),
   '   MLB .245 .315 .404');
  console.log('HR per ball in play',(100*hrB).toFixed(1)+'%','(MLB 4.5%)  BABIP',((H-hr)/(AB-g('K')-hr+g('SF'))).toFixed(3),'(MLB .291)');
  console.log('runs per 9 inn',(r.runs/(r.outs/27)).toFixed(2),'(MLB 4.45)  pitches/PA',(r.pitches/PA).toFixed(2),'(MLB 3.87)  wild pitches per 9',(r.wp/(r.outs/27)).toFixed(2),'(MLB 0.29)');
  {const q=r.pp,P=r.pitches,z=q.zone,f=x=>pct(x,P);
   console.log('per pitch: ball',f(q.ball),'(36.2) called',f(q.called),'(16.2) whiff',f(q.whiff),'(12.0) foul',f(q.foul),'(18.1) in play',f(q.inplay),'(17.5)');
   console.log('           zone',f(z),'(~48) swing',f(q.swing),'(47.8) z-swing',pct(q.zsw,z),'(~67) chase',pct(q.osw,P-z),'(~30) contact',pct(q.swing-q.whiff,q.swing),'(74.7)')}
  if(r.nP)console.log('batted balls: EV',(r.evs/r.nP).toFixed(1),'(88.8) LA',(r.las/r.nP).toFixed(1),'(13.9)  GB',pct(r.gb,r.nP),'(42.4) LD',pct(r.ld,r.nP),'(23.6) FB',pct(r.fb,r.nP),'(26.7) PU',pct(r.pu,r.nP),'(7.3)');
  if(r.bk)console.log('hit rate (no HR): GB',(r.bk.gb[1]/r.bk.gb[0]).toFixed(3),'(~.24) LD',(r.bk.ld[1]/r.bk.ld[0]).toFixed(3),'(~.63) FB',(r.bk.fb[1]/r.bk.fb[0]).toFixed(3),'(~.13) PU',(r.bk.pu[1]/r.bk.pu[0]).toFixed(3),'(~.02)');
  if(r.halves&&r.halves.length>30){// arcade: you need more than the posted 1-6 (weights 8,20,28,23,14,7) in 3 innings; a tie goes to extras (~half)
   const h=r.halves,d={};let n=0;for(let i=0;i+2<h.length;i+=3){const t=h[i]+h[i+1]+h[i+2];d[t]=(d[t]||0)+1;n++}
   const P=k=>(d[k]||0)/n,cum=k=>{let c=0;for(let j=0;j<=k;j++)c+=P(j);return c};const W=[8,20,28,23,14,7];let win=0;W.forEach((w,i)=>{const k=i+1;win+=w/100*((1-cum(k))+P(k)*.5)});
   console.log('3-inning runs:',Object.keys(d).sort((a,b)=>a-b).slice(0,8).map(k=>k+':'+(100*P(+k)).toFixed(0)+'%').join(' '),'  arcade win rate vs the posted target ~'+(100*win).toFixed(0)+'%')}
  if(r.perf.n)console.log('perfect-timing contact:',r.perf.n,'balls, HR',pct(r.perf.hr,r.perf.n),' hit',pct(r.perf.h,r.perf.n),JSON.stringify(r.perf.c));
  console.log('DP',g('DP'),'LDP',g('LDP'),'FC',g('FC'),'SF',g('SF'),'IFH',g('IFH'),'IPHR',g('IPHR'));
  const oth=Object.entries(c).filter(([k])=>!['1B','IFH','2B','3B','HR','IPHR','BB','HBP','K','E','DP','LDP','GO','FO','LO','PO','FC','SF'].includes(k));if(oth.length)console.log('other',JSON.stringify(oth))};
 if(process.env.GRID){const g=await pg.evaluate(n=>window.__grid(n),+process.env.GRID);let last='';for(const[k,c]of Object.entries(g)){const[L,EV]=k.split('/');if(L!==last){console.log('\nLA '+L);last=L}const n=Object.values(c).reduce((a,b)=>a+b,0),h=['1B','2B','3B','HR','IFH','IPHR'].reduce((a,x)=>a+(c[x]||0),0);console.log(' EV',EV.padStart(3),'hit',pct(h,n),Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([x,v])=>x+':'+Math.round(100*v/n)).join(' '))}await br.close();return}
 const sc=(process.env.SC||'cpu,you25,you40,you60,pitch12,pitch20').split(',');
 for(const s of sc){
  const o=s==='cpu'?{mode:'cpu'}:s.startsWith('pitch')?{mode:'pitch',meter:+(s.slice(5)||12)/100}:{mode:'you',sigma:+s.slice(3),swIn:.75,swOut:.28};
  await open();// a fresh page per scenario
  const r=await pg.evaluate(([n,o])=>window.__bal(n,o),[N,o]);
  show(s==='cpu'?'CPU vs CPU':s.startsWith('pitch')?`You pitch (meter sd ${o.meter}), CPU bats`:`You bat, timing sd ${o.sigma} ms`,r)}
 await br.close();
})();
