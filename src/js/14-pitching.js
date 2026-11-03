// ---------- pitching ----------
function startWindup(kf){closePen();
 const bpm=S.mode==='bp';if(bpm)kf=S.bpPitch||'FB';
 const pt=bpm?{vel:70,mov:72,ctl:99,slot:'over',hand:'R'}:pitcher(),dmn=!bpm&&pt.type==='demon',knk=!bpm&&pt.type==='knuckle';
 const r=Math.random()*100;
 let k=kf;if(!k){const A=arsOf(pt),PW={FB:dmn?76:50,SL:dmn?15:21,CH:dmn?5:17,SP:dmn?4:12,KN:42};let x=r/100*A.reduce((a,q)=>a+PW[q],0);k=A.find(q=>(x-=PW[q])<0)||A[0]}
 const P=PITCHES[k];
 // velocity first, then flight time from velocity: every extra mph arrives visibly sooner
 let mph=k==='KN'?rand(P.mph[1],P.mph[0]):rand(P.mph[1],P.mph[0])+(pt.vel-70)*.12;
 if(k==='FB'&&Math.random()<.15)mph+=rand(1,3);
 if(dmn&&k==='FB')mph+=rand(1.5,3.5);
 if(dmn&&k==='SL')mph+=rand(5,8);
 if(knk&&k==='FB')mph-=6;
 mph-=Math.max(0,(S.pcOf[fldKey()]||0)-40)*.07;
 mph=Math.round(clamp(mph,62,dmn?104:102));
 const travel=520*Math.pow(95/mph,2.2)*(k==='FB'?1:1.08);
 WIN=winOf(curBatter())*Math.pow(95/mph,1.3);
 const sideArm=pt.slot==='side'&&!bpm;
 const side=pitcher().hand==='R'?1:-1;
 S.pitch={k,name:P.name,mph,travel,side,slot:pt.slot||'over',h0:sideArm?3.9:6.2,relX:-(sideArm?4.4:2.2)*side,plateX:rand(-.7,.7),mov:.7+pt.mov*.006,inZone:bpm?Math.random()<.92:k==='SP'?Math.random()<.2:Math.random()<P.zone*(.82+pt.ctl*.0035),kn:[rand(9,15),rand(0,6.3),rand(17,24),rand(0,6.3),rand(8,13),rand(0,6.3)],wind:pitching()?rand(1600,2000):rand(1000,1500),releaseAt:0,trail:[]};
 if(bpm){S.pitch.relX=0;S.pitch.h0=4.2;S.pitch.wind=1400;S.pitch.side=1}
 else if(!S.pitch.inZone&&Math.random()<.007+clamp(((S.pcOf[fldKey()]||0)-30)/70,0,1)*.026&&k!=='KN')/* fresh arms rarely plunk anyone; tired ones lose the handle */{S.pitch.hbp=true;S.pitch.plateX=(effHand(curBatter())==='R'?-1:1)*2.6}
 S.swing=null;setPhase('windup');
 if(S.online&&S.online.inGame&&pitching())netWindup();
 if(pitching()&&S.auto){S.pitch.q=clamp(rand(.3,1.08),0,1)}
 else if(pitching()){S.pitch.q=null;S.meterT0=performance.now();const pz=.05+pt.ctl*.0006;$('rmP').style.left=$('rmP').style.right=`${(.5-pz)*100}%`;$('rmTxt').textContent='TAP TO RELEASE';$('relMeter').hidden=false}
}
const meterPos=now=>(Math.sin((now-S.meterT0)/1000*Math.PI*1.7-Math.PI/2)+1)/2;
function releaseTap(){
 if(S.phase!=='windup'||!pitching()||S.pitch.q!=null)return;
 const m=meterPos(performance.now()),pz=.05+pitcher().ctl*.0006,d=Math.abs(m-.5);
 const q=d<=pz?1:clamp(1-(d-pz)/.45,0,1)*.85;S.pitch.q=q;S.pitch.mFreeze=m;
 $('rmTxt').textContent=q>=1?'PAINTED THE CORNER!':q>.55?'GOOD LOCATION':q>.3?'OVER THE PLATE':'MISSED HIS SPOT';
}
function choosePitch(k){if(S.phase!=='choose'||!arsOf(pitcher()).includes(k))return;closePen();hideBanner();startWindup(k);updateHUD()}
function cpuDecide(){
 const b=curBatter(),p=S.pitch,q=p.q,arr=p.releaseAt+p.travel;if(p.hbp)return;
 let sw=p.inZone?.58+(b.con-50)*.004-(q>=1?.12:0):.2+((p.k==='SL'||p.k==='SP'||p.k==='KN')?.18:0)-(b.con-50)*.003;
 if(S.strikes===2)sw+=.15;if(S.balls===3&&!p.inZone)sw-=.1;
 if(Math.random()>sw)return;
 const whiff=clamp(.1+{FB:0,SL:.12,CH:.08,SP:.45,KN:.22}[p.k]+q*.16+(p.mph-92)*.012-(b.con-50)*.004+(p.inZone?0:.2),.03,.9);
 if(Math.random()<whiff){const at=arr+rand(-90,90);S.swing={at:at-60,err:at-arr,miss:true,cpu:true};return}
 const err=clamp(randn()*WIN*.36*(1.3-b.con/150)*(1+q*.6)*(p.inZone?1:1.5),-WIN*1.1,WIN*1.1);
 S.swing={at:arr+err-60,err,cpu:true,contactAt:arr+Math.max(0,err)};
}
function release(now){S.pitch.releaseAt=now;setPhase('pitch');const _rel=()=>{if(S.online&&S.online.inGame&&pitching())netRelease()};setTimeout(_rel,0);
 {const f=fldKey();S.pcOf[f]=(S.pcOf[f]||0)+1}
 if(pitching()){const p=S.pitch;if(p.q==null){p.q=.22;$('rmTxt').textContent='LATE RELEASE'}
  p.inZone=p.q>=.3&&(p.k!=='SP'||Math.random()<(p.q>=1?.3:.15));// a splitter dives out of the zone 80% of the time
const sg=Math.random()<.5?-1:1;p.plateX=p.inZone?(p.q>=1?sg*.65:rand(-.35,.35)):sg*rand(1.2,1.8);
  setTimeout(()=>{$('relMeter').hidden=true},700)}
 if(S.pitch.remote){}else S.pitch.wild=S.mode!=='bp'&&Math.random()<(.004+Math.max(0,(S.pcOf[fldKey()]||0)-25)*.0011+(S.pitch.q!=null&&S.pitch.q<.15?.12:0));
 if(S.pitch.wild)S.wildUntil=now+1700;
 if(!onlineGame()&&(pitching()||(S.auto&&S.mode!=='bp')))cpuDecide();else if(S.auto&&S.mode==='bp'&&Math.random()<.85){const arr=S.pitch.releaseAt+S.pitch.travel,err=randn()*WIN*.3;S.swing={at:arr+err-60,err,cpu:true,contactAt:arr+Math.max(0,err)}}
 sfx('woosh',{FB:1.06,SL:1,CH:.92}[S.pitch.k]);
 const tg=$('tag');tg.style.borderLeftColor=PITCHES[S.pitch.k].trail;spawnFlash(4);$('tagTxt').innerHTML=`${S.pitch.name} <em>${S.pitch.mph}</em> MPH`;tg.hidden=false;
 if(S.pitch.mph>94){S.flame=now;tg.classList.add('hot')}else{S.flame=0;tg.classList.remove('hot')}}
// each pitch has its own flight shape (x = lateral feet, h = height feet)
function pitchPos(p,el){
 const u=el/p.travel;
 const f=uc=>{const mv=p.mov||1,h0=p.h0||6.2,sd=p.slot==='side';let x=lerp(p.relX,p.plateX,uc),h;
  if(p.k==='FB'){x+=-p.side*(sd?1.8:.5)*mv*uc*(1-uc);h=lerp(h0,3.1,uc)}
  else if(p.k==='SL'){const B=(sd?19:14)*mv,a=1-uc,c1=lerp(p.relX,p.plateX,.33)-p.side*B*.35,c2=p.plateX-p.side*B*.62;
   x=a*a*a*p.relX+3*a*a*uc*c1+3*a*uc*uc*c2+uc*uc*uc*p.plateX;h=lerp(h0-.2,2.3,uc)-.8*uc*uc}
  else if(p.k==='KN'){const n=p.kn||[12,0,20,1,10,2],e=Math.sin(Math.PI*Math.min(1,uc*1.15));x+=(2.3*Math.sin(uc*n[0]+n[1])+1.1*Math.sin(uc*n[2]+n[3]))*e*mv;h=lerp(h0+.3,2.4,uc)+.9*Math.sin(Math.PI*uc)+1.1*Math.sin(uc*n[4]+n[5])*e*mv}
  else if(p.k==='SP'){x+=-p.side*.4*uc*(1-uc);h=Math.max(.3,lerp(h0,3.4,uc)-4.6*mv*Math.pow(uc,4))}
  else{x+=p.side*(sd?6.5:5)*mv*uc*Math.pow(1-uc,1.5);h=lerp(h0-.2,1.8,uc)+(sd?3:4.5)*Math.sin(Math.PI*uc)}
  return{x,h}};
 if(u<=1){const r=f(u);return{x:r.x,y:54-52*u,h:r.h}}
 const a=f(1),b=f(.97),dx=(a.x-b.x)/.03;
 return{x:a.x+dx*(u-1),y:54-52*u,h:Math.max(.3,a.h-(u-1)*4)};
}
function swing(){const had=!!S.swing;swing0();if(S.online&&S.online.inGame&&!pitching()&&!had&&S.swing)netDecide(S.swing.bunt?'bunt':'swing')}
function swing0(){
 ensureAudio();
 if(pitching()){releaseTap();return}
 if(S.pitch&&S.pitch.hbp&&S.phase==='pitch')return;
 if(S.phase!=='pitch'||S.swing)return;
 const now=performance.now();const err=(now-S.pitch.releaseAt)-S.pitch.travel;
 S.swing={at:now,err};
 if(S.pitch.k==='SP'){S.swing.miss=true;showTiming(err);sfx('whiff');return}
 if(Math.abs(err)<=WIN){
  const bb=curBatter(),wp=Math.max(0,58-bb.con)*.006+(S.pitch.k==='SL'?.1:S.pitch.k==='CH'?.04:S.pitch.k==='KN'?.14:0);
  if(Math.random()<wp){S.swing.miss=true;showTiming(err);sfx('whiff');return}
  if(err<0)S.swing.contactAt=S.pitch.releaseAt+S.pitch.travel;else doContact()}
 else{S.swing.miss=true;showTiming(err);sfx('whiff')}
}
function bunt(){const had=!!S.swing;bunt0();if(S.online&&S.online.inGame&&!pitching()&&!had&&S.swing)netDecide('bunt')}
function bunt0(){
 ensureAudio();
 if(pitching())return;
 if(S.phase!=='pitch'||S.swing)return;
 const now=performance.now(),arr=S.pitch.releaseAt+S.pitch.travel;
 if(now>arr-40)return;
 S.swing={at:now,bunt:true,err:0,contactAt:arr};
}
function simulateBunt(b){
 const foul=Math.random()<.13,side=Math.random()<.5?-1:1;
 const s=foul?side*rand(47,62):side*rand(12,38);
 const dir={x:Math.sin(s*RAD),y:Math.cos(s*RAD)};
 const P={err:0,q:.3,EV:rand(24,36),L:-8,s,bunt:true};
 if(foul){const play=newPlay();play.foul=true;play.bunt=true;const C={x:0,y:2};const D=rand(15,35),T=.8,end={x:dir.x*D,y:dir.y*D+2};
  play.segs.push(fnSeg(0,T,t=>{const u=t/T,e=1-(1-u)*(1-u);return{x:lerp(C.x,end.x,e),y:lerp(C.y,end.y,e),h:Math.abs(Math.sin(u*9))*1.5*(1-u)}}));
  finalize(play,[],{code:'FOUL',runs:0,outs:0});play.end=T+.3;return play}
 return buildGrounder(P,dir,b);
}
function doContact(){
 if(S.swing.bunt){
  const sw=S.swing;sw.done=true;
  if(netRand(()=>Math.random()<.08)||S.pitch.k==='SP'){sw.miss=true;return}
  if(S.mode==='bp'){const s0=rand(-38,38),P={err:0,q:.5,EV:rand(22,38),L:rand(-18,-4),s:s0};S.play=buildBP(P,{x:Math.sin(s0*RAD),y:Math.cos(s0*RAD)},curBatter());S.play.res.banner='BUNT';sfx('crack',.1);
   const pl=S.play;pl.fullEnd=pl.end;pl.hide=true;pl.watch=null;pl.end=Math.min(pl.end,.85);(S.bpFly=S.bpFly||[]).push({play:pl,at:performance.now()});setPhase('play');return}
  S.play=netRand(()=>simulateBunt(curBatter()));sfx('crack',.1);spawnFlash(6);setPhase('play');setCam('follow');return;
 }
 S.steal=null;
 const sw=S.swing;sw.done=true;if(!sw.cpu)showTiming(sw.err);spawnFlash(14);
 const b=curBatter();
 S.play=netRand(()=>simulateContact(sw.err,effHand(b),b));
 {const r=S.play.res;if(S.mode!=='bp'&&!S.play.foul&&batKey()===S.you&&(r.hr||S.play.deep||r.runs>0))sfx('bigcheer')}
 const q=clamp(1-Math.pow(Math.abs(sw.err)/WIN,1.25),0,1);
 if(!S.play.foul&&(S.play.res.hr||S.play.deep)&&BUF.echo1&&!muted)playSample(pick(['echo1','echo2','echo3']),.65+.35*q,1);else sfx('crack',q);
 if(S.mode==='bp'){const pl=S.play;pl.fullEnd=pl.end;pl.hide=true;pl.watch=null;pl.end=Math.min(pl.end,.85);(S.bpFly=S.bpFly||[]).push({play:pl,at:performance.now()});setPhase('play');return}
 setPhase('play');setCam('follow');
}
function pitchEnd(){
 const b=curBatter();
 if(S.online&&S.online.inGame&&!pitching()&&!S.swing)netDecide('take');
 if(S.mode==='bp'){banner(S.swing?'SWING AND MISS':'TAKE',S.pitch.name.toLowerCase()+` · ${S.pitch.mph} mph`,S.swing?'strike':'ball');setPhase('call');updateHUD();return}
 if(S.pitch.wild){
  if(S.bases[0]||S.bases[1]||S.bases[2]){const sc=S.bases[2]?1:0;S.bases=[null,S.bases[0],S.bases[1]];addRuns(sc);logPA(b,'Wild pitch, runners advance'+(sc?' · 1 run scores':''),!!sc)}
 }else if(!S.pitch.popped)sfx('pop');
 if(S.pitch.hbp&&!S.swing){const nb=[...S.bases];let runs=0;
  {const hp=pitchPos(S.pitch,S.pitch.travel*.97),sg=hp.x<0?-1:1;S.hbpFx={at:performance.now(),x0:hp.x,y0:hp.y,h0:Math.max(2.5,hp.h),dx:sg*rand(7,13),dy:rand(5,11),who:b,hand:effHand(b),T:TEAMS[batKey()],pants:batKey()===S.you?'#eeeae0':'#a9b0b5'}}
  if(nb[0]){if(nb[1]){if(nb[2])runs++;nb[2]=nb[1]}nb[1]=nb[0]}nb[0]=b;S.bases=nb;addRuns(runs);S.steal=null;
  logPA(b,'Hit by pitch, HBP'+(runs?' · 1 run scores':''),!!runs);banner('HIT BY PITCH',runs?'Forces in a run':'Take your base','ball');
  noise(.07,'lowpass',380,.6);crowdReach();if(batKey()===S.you)crowdClip('boo',1.7);nextBatter();setPhase('call');updateHUD();return}
 const stealOn=S.steal&&(S.steal[1]||S.steal[2])&&!S.pitch.wild,outsB=S.outs,ballsB=S.balls;
 if(S.swing&&S.swing.bunt){S.swing.miss=true;strike(true,b,true)}else if(S.swing)strike(true,b);else if(S.pitch.inZone)strike(false,b);else ball(b);
 if(stealOn){const walked=S.balls===0&&ballsB===3,ko=S.outs>outsB;
  if(!walked&&S.outs<3&&(S.play=netRand(()=>buildSteal(performance.now())))){S.steal=null;if(ko)S.play.res.sub='Strike three';setPhase('play');setCam('follow');updateHUD();return}}
 S.steal=null;
 if(S.pitch.wild)banner('WILD PITCH!',(S.bases[1]||S.bases[2]?'Runners move up · ':'')+`${S.balls}-${S.strikes}`,'ball');
 setPhase('call');updateHUD();
}
function strike(swinging,b,buntMiss){
 S.strikes++;if(!swinging)S.umpPunch=performance.now()+800;
 if(S.strikes>=3){S.outs++;if(batKey()===S.you)S.ks++;else{S.myK++;S.cheerUntil=performance.now()+1800}
  logPA(b,swinging?'Strikeout swinging, K':'Called strike three, backwards K',false);
  banner(swinging?'STRIKEOUT':'STRIKE THREE',swinging?`Got him with the ${S.pitch.name.toLowerCase()}`:'Caught looking','strike');sfx('out');S.koWalk={who:b,at:performance.now(),sd:batKey()===S.you?1:-1,T:TEAMS[batKey()],pants:batKey()===S.you?'#eeeae0':'#a9b0b5',hand:effHand(b)};nextBatter();
 }else banner(buntMiss?'MISSED THE BUNT':swinging?'SWING AND MISS':'STRIKE',`${S.balls}-${S.strikes}`,'strike');
}
function ball(b){
 S.balls++;
 if(S.balls>=4){
  const nb=[...S.bases];let runs=0;
  if(nb[0]){if(nb[1]){if(nb[2])runs++;nb[2]=nb[1]}nb[1]=nb[0]}nb[0]=b;
  S.bases=nb;addRuns(runs);
  logPA(b,'Walk, BB'+(runs?' · 1 run scores':''),!!runs);
  banner('BALL FOUR',runs?'Bases-loaded walk forces in a run':'Take your base','ball');crowdReach();nextBatter();
 }else banner('BALL',`${S.balls}-${S.strikes}`,'ball');
}
function nextBatter(){const f=fldKey(),b=batKey();S.pBFOf[f]=(S.pBFOf[f]||0)+1;S.orderOf[b]=((S.orderOf[b]||0)+1)%9;S.balls=0;S.strikes=0}

