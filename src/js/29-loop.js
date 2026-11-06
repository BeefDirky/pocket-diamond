// ---------- loop ----------
function update(dt,now){
 if(S.paused)return;
 if(S.online&&S.online.inGame)netTick(now);syncPickBar();
 S.pt+=dt;
 if((!S.wave||now>S.wave.end+15000)&&S.phase!=='title'&&Math.random()<dt/22000)S.wave={start:now,end:now+5500};
 if(now<S.fwUntil&&Math.random()<dt/240)burst(rand(80,880)*K,rand(30,260)*K);
 if(S.fx.length){const k=dt/1000;for(const p of S.fx){p.x+=p.vx*k;p.y+=p.vy*k;p.vy+=28*K*k;p.vx*=.99;p.life-=dt/1150}S.fx=S.fx.filter(p=>p.life>0)}
 updateCam(dt);updateLife(dt,now);
 switch(S.phase){
  case'ready':if(S.pt>60&&S.pt<120&&S.mode!=='bp'&&batKey()===S.you){const on=S.bases.filter(Boolean).length,key=`${S.inning}|${S.half}`;
    if(on>=2&&S.rallyKey!==key){S.rallyKey=key;crowdChant()}else if(now>nextChant&&Math.random()<.18){crowdChant()}if(now>nextChant)nextChant=now+rand(45000,90000)}
   if(S.pt>120&&S.mode!=='bp'&&batKey()===S.you&&S.balls===0&&S.strikes===0&&(S.bases[1]||S.bases[2])){const key=`${S.inning}|${S.half}|${S.orderOf[S.you]}|${S.outs}`;if(S.rampKey!==key&&S.rampAB!==`${S.inning}|${S.half}|${S.orderOf[S.you]}`){S.rampKey=key;S.rampAB=`${S.inning}|${S.half}|${S.orderOf[S.you]}`;organRamp()}}
   if(S.pt>650){
    // the visiting pitcher sometimes throws over (more often when he senses a steal)
    {const abKey=`${S.inning}|${S.half}|${S.orderOf[batKey()]}`;if(!S.pk||S.pk.ab!==abKey)S.pk={ab:abKey,n:0};
     const k=S.bases[0]&&!S.bases[1]?1:S.bases[1]&&!S.bases[2]?2:0;
     // he decides when the batter steps in, but takes his time: get the sign, come set, then spin and throw
     if(S.pkPend==null&&k&&!pitching()&&!onlineGame()&&S.mode!=='bp'&&S.pk.n<2&&Math.random()<(S.steal&&S.steal[k]?.3:.1))S.pkPend={k,at:S.pt+rand(1300,2200)};
     if(S.pkPend){if(S.pt<S.pkPend.at)break;const pk=S.pkPend;S.pkPend=null;if(S.bases[pk.k-1]){S.pk.n++;S.play=buildPickoff(pk.k);S.steal=null;
      if(batKey()===S.you)crowdClip('boo',1.5);setPhase('play');setCam('follow');break}}}
    if(S.online&&S.online.inGame&&!pitching()){}
    else if(pitching()&&S.auto){startWindup()}else if(pitching()){setPhase('choose');banner('YOUR PITCH',arsOf(pitcher()).map((a,i)=>`${i+1} ${PITCHES[a].name[0]+PITCHES[a].name.slice(1).toLowerCase()}`).join(' · '));updateHUD()}else startWindup()}break;
  case'windup':if(S.pt>=S.pitch.wind&&!(S.pitch.remote&&!S.pitch.relRecv))release(now);break;
  case'pitch':{
   if(S.swing&&S.swing.contactAt&&!S.swing.done&&now>=S.swing.contactAt){doContact();break}
   if(S.mode==='bp'){if(now-S.pitch.releaseAt>=S.pitch.travel*1.4)pitchEnd();break}
   if(S.online&&S.online.inGame&&pitching()&&!S.pitch.decided){break}// wait for the batter's call however long it takes; guessing would split the two screens
   {const el=now-S.pitch.releaseAt,tc=S.pitch.travel*(S.pitch.wild?1.6:1.135);
    // the ball is in the mitt, but a very late swing still counts (as a late swing and miss) for a beat before the call
    if(el>=tc&&!(S.swing&&S.swing.contactAt&&!S.swing.done)){if(!S.swing&&!S.pitch.wild&&!pitching()&&el<tc+420){if(!S.pitch.popped){S.pitch.popped=true;if(S.mode!=='bp')sfx('pop')}}else pitchEnd()}}break}
  case'play':{const pl=S.play,t0=pl.t;pl.t+=dt/1000*SPEED;const r=pl.res;
   // walk-off: the dugout empties the moment it's decided (ball leaves the yard, or the winning run touches home)
   if(r&&pl.woAt==null){pl.woAt=-1;const wo=S.mode==='arcade'||(S.half==='bot'&&S.inning>=(S.schedInn||9));const outsAfter=S.outs+(r.outs||0);
    if(wo&&S.mode!=='bp'&&outsAfter<3&&S.runs+(r.runs||0)>S.target){if(r.hr)pl.woAt=pl.ballGone||0;else{const need=S.target+1-S.runs;
      const arr=(pl.runners||[]).filter(x=>x.dest===4&&!x.out).map(x=>x.start+(4-x.from)*LEG/x.speed).sort((a,b)=>a-b);pl.woAt=arr[need-1]!=null?arr[need-1]:pl.end-.4}}}
   if(pl.woAt>=0&&pl.t>=pl.woAt&&!pl.woFired){pl.woFired=true;startCelebration(true);S.cheerUntil=performance.now()+1e9}
   if(pl.endsInning&&!pl.ioFired&&pl.t>=pl.lastOutAt&&!willEndGame()){pl.ioFired=true;banner(sideLabel(),r.desc||'Three outs')}
   if(r&&!pl.reachCued&&!r.steal&&!r.hr&&(r.hit||r.code==='E'||r.code==='IFH')&&S.mode!=='bp'&&pl.t>=pl.reachAt){pl.reachCued=true;crowdReach(r.code==='E');if(r.code==='E'&&fldKey()===S.you)crowdSad()}
   {const dT=pl.watch!=null?pl.watch+(pl.flip?pl.flip.dur:1.1):.6;if(!pl.foul&&!pl.bp&&!(pl.res&&pl.res.steal)&&t0<dT&&pl.t>=dT)sfx('drop')}
   for(const sg of pl.segs)if(sg.snd&&!sg.sounded&&pl.t>=sg.t1){sg.sounded=true;sfx('glove')}
   if(pl.dive&&!pl.diveSnd&&pl.t>=pl.dive.t&&fldKey()===S.opp&&batKey()===S.you){pl.diveSnd=true;crowdSad()}
   if(pl.jump&&!pl.jumpSnd&&pl.t>=pl.jump.t-.05&&fldKey()===S.opp&&batKey()===S.you){pl.jumpSnd=true;crowdSad()}
   if(pl.runners)for(const r of pl.runners)if(r.slide&&!r.slide.sd&&pl.t>=r.slide.t0){r.slide.sd=true;if(!muted)playSample('slide',.85,1)}
   if(pl.clang&&!pl.clang.done&&pl.t>=pl.clang.t){pl.clang.done=true;if(!muted)playSample('clang',pl.clang.k==='board'?.75:.9,pl.clang.k==='pole'?1.08:1)}
   if(r.hr&&!r.bp&&!S.play.hrFired&&S.play.t>=S.play.ballGone){S.play.hrFired=true;hrMoment(r);splashCheck(S.play)}
   if(S.play.t>=S.play.end){S.play.t=S.play.end;finishPlay()}break}
  case'result':if(S.pt>(S.mode==='bp'?420:1450)){hideBanner();setPhase('reset');setCam('pitch')}break;
  case'reset':if(S.pt>(S.mode==='bp'?200:540)){S.play=null;afterPA()}break;
  case'call':if(S.pt>(S.koWalk&&now-S.koWalk.at<1800?1750:850))afterPA();break;
  case'inning':if(S.pt>1900){hideBanner();$('tag').hidden=true;setPhase('ready');updateHUD()}break;
 }
}
let last=performance.now();
function updateRelMeter(now){if(S.phase==='windup'&&pitching()&&S.pitch){const m=S.pitch.mFreeze!=null?S.pitch.mFreeze:meterPos(now);$('rmMk').style.left=`${m*100}%`}}
function frame(now){const dt=Math.min(50,now-last);last=now;update(dt,now);if(!(TS.cur&&!$('scrTeams').hidden&&!$('title').hidden))render(now);/* the club-select wall covers the park, so skip drawing it */updateRelMeter(now);drawFlame(now);baseChase(now);requestAnimationFrame(frame)}

