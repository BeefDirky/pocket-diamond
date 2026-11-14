// ---------- game flow ----------
function startGame(mode){S.gameNo=(S.gameNo||0)+1;if(!onlineGame())applyLevels();tsFlush();unduckMusic();if(mode!=='bp'||!parkFromBP)clubSave();
 S.mode=mode||S.mode||'arcade';S.bpOn=S.mode==='bp';applyVolumes();if(OPT.time==='random')decideTime();S.bp={sw:0,hr:0,long:0,n:0};if(!S.bpPitch)S.bpPitch='FB';
 S.orderOf={[S.you]:0,[S.opp]:0};S.pIdxOf={[S.you]:0,[S.opp]:0};S.usedOf={};S.penHint=false;S.pkPend=null;S.celebr=null;S.pcOf={};S.stamOf={};S.coinGame={};S.pRunsOf={};S.pBFOf={};S.myErrs=0;S.myK=0;S.kLook=[];S.wildUntil=0;
 S.half=S.mode==='full'?'top':'bot';setSides();
 S.inning=1;S.errs=0;S.outs=0;S.balls=0;S.strikes=0;S.runs=0;S.hits=0;S.hr=0;S.ks=0;
 S.bases=[null,null,null];S.play=null;S.swing=null;S.pitch=null;S.jumbo=null;
 if(S.mode==='full'){
  S.totalInn=9;S.schedInn=9;S.target=0;S.oppLine=Array(9).fill(0);S.youLine=Array(9).fill(0);S.oppHits=0;
 }else{
  S.totalInn=INNINGS;{const edge=(typeof teamStr==='function')?teamStr(S.opp)-teamStr(S.you):0;let k=0;{const W=[37,23,17,10,6,3,2,1,1];let u=Math.random()*100;while(k<8&&u>=W[k]){u-=W[k];k++}}// three innings of CPU-vs-CPU scoring (tests/balance.js): 0 most often, ~1.5 on average
   if(edge>3&&Math.random()<.4)k++;if(edge<-3&&Math.random()<.4)k--;S.target=clamp(k,0,9)}
  const line=[0,0,0];for(let k=0;k<S.target;k++)line[Math.floor(Math.random()*3)]++;
  S.oppLine=line;S.oppHits=S.target+1+Math.floor(Math.random()*4);S.youLine=[0,0,0];
 }
 $('log').innerHTML='';$('mk').hidden=true;$('tRead').textContent='Timing shows here after a swing';
 document.documentElement.style.setProperty('--team',TEAMS[S.you].jersey);
 $('title').hidden=true;$('over').hidden=true;
 DECOR=FIELD?buildDecor():null;
 setCam('pitch');
 $('bpBar').hidden=S.mode!=='bp';$('parkBtn').hidden=S.mode!=='bp';$('actsBat').classList.toggle('withBP',S.mode==='bp');S.bpBalls=[];S.bpFly=[];if(S.mode==='bp')setBP(S.bpPitch);applyVolumes();
 if(S.mode==='bp'){S.target=0;S.totalInn=1;S.oppLine=[0];S.youLine=[0];S.oppHits=0;banner('BATTING PRACTICE','Pick a pitch for the machine. It keeps throwing it until you change.');S.jumbo={text:'BATTING PRACTICE',kr:'타격 연습',until:performance.now()+2500};setPhase('inning');updateHUD();return}
 const se=S.mode==='arcade'&&S.series&&S.series.len>1?S.series:null;
 if(se){const g=se.w+se.l+1;banner(`GAME ${g} OF ${se.len} · ${TEAMS[S.opp].name} POSTED ${S.target}`,`Series ${se.w}-${se.l} · ${TEAMS[S.you].city} needs ${S.target+1} in ${INNINGS} innings`);S.jumbo={text:`GAME ${g}`,kr:`${g}차전`,until:performance.now()+3000};setPhase('inning');updateHUD();return}
 if(S.mode==='full')banner('PLAY BALL',`${TEAMS[S.opp].name} at ${TEAMS[S.you].name}, 9 innings. You pitch the top halves.`);
 else banner(`${TEAMS[S.opp].name} POSTED ${S.target}`,`${TEAMS[S.you].city} needs ${S.target+1} in ${INNINGS} innings`);
 S.jumbo={text:'PLAY BALL',kr:'플레이 볼!',until:performance.now()+3000};
 mlStart();phGameStart();setPhase('inning');updateHUD();
}
function startCelebration(early){const k=batKey(),T=TEAMS[k],sd=k===S.you?1:-1,now=performance.now();
 const dug=toPx(sd*84,14),pants=k===S.you?'#eeeae0':'#a9b0b5',mob=[];
 const on=new Set(S.bases.filter(Boolean));if(early)on.add(curBatter());
 T.lineup.forEach((p,i)=>{if(on.has(p))return;const a=Math.PI*(.15+.7*((i*.37)%1)),r=rand(14,26),tg=toPx(Math.cos(a)*r*sd*.9,Math.sin(a)*r*.55+3);
  const st={x:dug.x+rand(-14,14),y:dug.y+rand(-8,8)};mob.push({sx:st.x,sy:st.y,tx:tg.x,ty:tg.y,d:rand(0,500),dur:rand(1300,1900),ph:rand(0,6),hj:rand(0,4),sk:skinOf(p.name),pants,helmet:false})});
 for(let j=0;j<5;j++){const a=Math.PI*rand(.1,.9),r=rand(18,32),tg=toPx(Math.cos(a)*r,Math.sin(a)*r*.5+4);mob.push({sx:dug.x+rand(-16,16),sy:dug.y+rand(-8,8),tx:tg.x,ty:tg.y,d:rand(300,900),dur:rand(1500,2200),ph:rand(0,6),hj:rand(0,4),sk:SKINS[j%5],pants,helmet:false})}
 S.celebr={k,at:now,mob,early:!!early}}
function gameOver(win){if(S.olMenu){S.olMenu=false;$('title').hidden=true;showScreen('scrMain')}const onl=onlineGame();mlEnd();phGameEnd(win);rkShow('');rkGameOver();
 if(!(S.celebr&&S.celebr.early&&win)){S.celebr=null;if(win&&(S.mode==='arcade'||S.half==='bot'))startCelebration()}
 setPhase('over');setCam(S.celebr?'pitch':'full');hideBanner();$('tag').hidden=true;
 const you=TEAMS[S.you],opp=TEAMS[S.opp];
 if(win){S.cheerUntil=performance.now()+1e9;S.fwUntil=performance.now()+9000;if(!muted){playSample('fworks',.9,1);setTimeout(()=>{if(S.phase==='over')playSample('fworks',.8,.96)},3600)}S.jumbo={text:'WALK-OFF!',until:performance.now()+1e9}}
 const wo=S.mode==='arcade'||(S.half==='bot'&&win);
 $('overT').innerHTML=win?(wo?`<span>WALK-OFF</span> WIN`:`<span>WIN</span>`):'FINAL';
 $('overS').textContent=win?`${you.city} ${you.name} ${S.runs}, ${opp.name} ${S.target}. ${you.mascot} is already on the dugout roof.`:`${opp.city} ${opp.name} ${S.target}, ${you.name} ${S.runs}.${S.mode==="arcade"?" Out of outs.":""}`;
 $('overStats').innerHTML=S.mode==='full'?`<div><b>${S.hits}</b><span>HITS</span></div><div><b>${S.hr}</b><span>HOME RUNS</span></div><div><b>${S.myK}</b><span>K'S PITCHED</span></div>`:`<div><b>${S.hits}</b><span>HITS</span></div><div><b>${S.hr}</b><span>HOME RUNS</span></div><div><b>${S.ks}</b><span>STRIKEOUTS</span></div>`;
 $('olNext').hidden=true;$('olSeries').hidden=true;
 if(onl){const iWin=S.online.me==='home'?win:!win;$('overT').innerHTML=iWin?'<span>YOU</span> WIN':'YOU LOSE';$('overS').textContent=`Final: ${opp.city} ${opp.name} ${S.target}, ${you.city} ${you.name} ${S.runs}.`;win=iWin;
  // best-of series: tally this game, then either crown the series winner or line up the next game
  const o=S.online,se=o.series;if(se&&se.bo>1&&se.counted!==o.gid){se.counted=o.gid;const me=o.role,them=me==='host'?'guest':'host';se.w[iWin?me:them]++;
   const need=Math.ceil(se.bo/2),mw=se.w[me],tw=se.w[them];se.done=mw>=need||tw>=need;
   if(se.done)$('overT').innerHTML=mw>tw?'<span>SERIES</span> WON':'SERIES LOST';
   $('olSeries').hidden=false;se.tally=se.done?`${mw>tw?'You take':'They take'} the best of ${se.bo}, ${Math.max(mw,tw)}-${Math.min(mw,tw)}.`:`Best of ${se.bo} · you ${mw}, them ${tw}`;
   netPresence({rdy:null});nextRender()}}
 if(!onl&&!S.poGame&&S.mode==='arcade'&&S.series&&S.series.len>1){const se=S.series;if(se.counted!==S.gameNo){se.counted=S.gameNo;win?se.w++:se.l++}
  const need=Math.ceil(se.len/2);se.done=se.w>=need||se.l>=need;$('olSeries').hidden=false;
  if(se.done){$('overT').innerHTML=se.w>se.l?'<span>SERIES</span> WON':'SERIES LOST';$('olSeries').textContent=`${se.w>se.l?you.name+' take':opp.name+' take'} the best of ${se.len}, ${Math.max(se.w,se.l)}-${Math.min(se.w,se.l)}.`}
  else $('olSeries').textContent=`Best of ${se.len} · ${you.name} ${se.w}, ${opp.name} ${se.l} · game ${se.w+se.l+1} next.`}
 awardPacks(win);coinGameOver(win);
 $('toLobby').hidden=!onl;if(onl){resumeClear();$('again').hidden=true;$('toBracket').hidden=true;S.online.inGame=false;netPresence({pt:null,dc:null})}
 else if(S.poGame){S.poGame=false;poRecord(win);$('toBracket').hidden=false;$('again').hidden=true;const sr=poMySeries();if(sr)$('overS').textContent+=` Series: ${poLine(sr)}.`}else{$('toBracket').hidden=true;$('again').hidden=false;const se=S.mode==='arcade'&&S.series&&S.series.len>1?S.series:null;$('again').textContent=se?(se.done?'NEW SERIES':`GAME ${se.w+se.l+1}`):'PLAY AGAIN'}
 if(S.celebr){const gid=S.overGid=(S.overGid||0)+1;setTimeout(()=>{if(S.phase==='over'&&S.overGid===gid&&$('title').hidden)$('over').hidden=false},3400)}else $('over').hidden=false;/* the results card always follows the celebration */updateHUD();
}

