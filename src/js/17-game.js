// ---------- game flow ----------
function startGame(mode){
 S.mode=mode||S.mode||'arcade';S.bpOn=S.mode==='bp';applyVolumes();if(OPT.time==='random')decideTime();S.bp={sw:0,hr:0,long:0,n:0};if(!S.bpPitch)S.bpPitch='FB';
 S.orderOf={[S.you]:0,[S.opp]:0};S.pIdxOf={[S.you]:0,[S.opp]:0};S.pcOf={};S.pRunsOf={};S.pBFOf={};S.myErrs=0;S.myK=0;S.wildUntil=0;
 S.half=S.mode==='full'?'top':'bot';setSides();
 S.inning=1;S.errs=0;S.outs=0;S.balls=0;S.strikes=0;S.runs=0;S.hits=0;S.hr=0;S.ks=0;
 S.bases=[null,null,null];S.play=null;S.swing=null;S.pitch=null;S.jumbo=null;
 if(S.mode==='full'){
  S.totalInn=9;S.schedInn=9;S.target=0;S.oppLine=Array(9).fill(0);S.youLine=Array(9).fill(0);S.oppHits=0;
 }else{
  S.totalInn=INNINGS;{const edge=(typeof teamStr==='function')?teamStr(S.opp)-teamStr(S.you):0;S.target=clamp(1+Math.floor(Math.random()*3)+(edge>3?1:0)-(edge<-3?1:0),1,5)}
  const line=[0,0,0];for(let k=0;k<S.target;k++)line[Math.floor(Math.random()*3)]++;
  S.oppLine=line;S.oppHits=S.target+2+Math.floor(Math.random()*4);S.youLine=[0,0,0];
 }
 $('log').innerHTML='';$('mk').hidden=true;$('tRead').textContent='Timing shows here after a swing';
 document.documentElement.style.setProperty('--team',TEAMS[S.you].jersey);
 $('title').hidden=true;$('over').hidden=true;
 DECOR=FIELD?buildDecor():null;
 setCam('pitch');
 $('bpBar').hidden=S.mode!=='bp';$('parkBtn').hidden=S.mode!=='bp';$('actsBat').classList.toggle('withBP',S.mode==='bp');S.bpBalls=[];S.bpFly=[];if(S.mode==='bp')setBP(S.bpPitch);applyVolumes();
 if(S.mode==='bp'){S.target=0;S.totalInn=1;S.oppLine=[0];S.youLine=[0];S.oppHits=0;banner('BATTING PRACTICE','Pick a pitch for the machine. It keeps throwing it until you change.');S.jumbo={text:'BATTING PRACTICE',kr:'타격 연습',until:performance.now()+2500};setPhase('inning');updateHUD();return}
 if(S.mode==='full')banner('PLAY BALL',`${TEAMS[S.opp].name} at ${TEAMS[S.you].name}, 9 innings. You pitch the top halves.`);
 else banner(`${TEAMS[S.opp].name} POSTED ${S.target}`,`${TEAMS[S.you].city} needs ${S.target+1} in ${INNINGS} innings`);
 S.jumbo={text:'PLAY BALL',kr:'플레이 볼!',until:performance.now()+3000};
 setPhase('inning');updateHUD();
}
function gameOver(win){
 setPhase('over');setCam('full');hideBanner();$('tag').hidden=true;
 const you=TEAMS[S.you],opp=TEAMS[S.opp];
 if(win){S.cheerUntil=performance.now()+1e9;S.fwUntil=performance.now()+9000;if(!muted){playSample('fworks',.9,1);setTimeout(()=>{if(S.phase==='over')playSample('fworks',.8,.96)},3600)}S.jumbo={text:'WALK-OFF!',until:performance.now()+1e9}}
 const wo=S.mode==='arcade'||(S.half==='bot'&&win);
 $('overT').innerHTML=win?(wo?`<span>WALK-OFF</span> WIN`:`<span>WIN</span>`):'FINAL';
 $('overS').textContent=win?`${you.city} ${you.name} ${S.runs}, ${opp.name} ${S.target}. ${you.mascot} is already on the dugout roof.`:`${opp.city} ${opp.name} ${S.target}, ${you.name} ${S.runs}.${S.mode==="arcade"?" Out of outs.":""}`;
 $('overStats').innerHTML=S.mode==='full'?`<div><b>${S.hits}</b><span>HITS</span></div><div><b>${S.hr}</b><span>HOME RUNS</span></div><div><b>${S.myK}</b><span>K'S PITCHED</span></div>`:`<div><b>${S.hits}</b><span>HITS</span></div><div><b>${S.hr}</b><span>HOME RUNS</span></div><div><b>${S.ks}</b><span>STRIKEOUTS</span></div>`;
 if(S.online){const iWin=S.online.me==='home'?win:!win;$('overT').innerHTML=iWin?'<span>YOU</span> WIN':'YOU LOSE';$('overS').textContent=`Final: ${opp.city} ${opp.name} ${S.target}, ${you.city} ${you.name} ${S.runs}.`;win=iWin}
 awardPacks(win);
 $('toLobby').hidden=!S.online;if(S.online){$('again').hidden=true;$('toBracket').hidden=true;S.online.inGame=false;netPresence({pt:null,dc:null})}
 else if(S.poGame){S.poGame=false;poRecord(win);$('toBracket').hidden=false;$('again').hidden=true;const sr=poMySeries();if(sr)$('overS').textContent+=` Series: ${poLine(sr)}.`}else{$('toBracket').hidden=true;$('again').hidden=false}
 $('over').hidden=false;updateHUD();
}

