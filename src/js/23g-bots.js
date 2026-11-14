// ---------- ranked bots ----------
// Nobody paired with you after 15 seconds in the ranked queue: the server opens a match against a CPU club (migration
// 007) and you play it here, on your phone, as an ordinary 3-inning game. The bot's level comes from your rating
// (1000 = level 3, one level per 150 points, 1 to 10): it raises (or lowers) the bot team's ratings and sharpens how it
// swings and pitches. You're home (the lower rating hosts; the bot is rated the same as you). It counts for rating,
// ±100 like a game against a person. Leaving it, or Forfeit, is a loss.
const BOT_AFTER=15000;
const botClubFor=()=>{const opts=ORDER.filter(k=>k!==S.you&&TEAMS[k]);return opts[Math.floor(Math.random()*opts.length)]};
// the queue asks for a bot once 15 seconds have passed (the server checks the time too); a person found first wins
async function qBotTry(gen){if(Q.botOff||Date.now()-Q.t0<BOT_AFTER)return false;
 let r;try{r=await rpc('queue_bot',{p_bot_club:botClubFor()})}catch(e){if(/queue_bot|function|schema/i.test(String(e&&e.message||e)))Q.botOff=true;return false}
 if(!Q.on||Q.gen!==gen)return true;if(!r||r.queue!=='matched')return false;
 (r.info&&r.info.mode==='ranked_bot'?botMatched:qMatched)(r.info,gen);return true}
function botMatched(info,gen){Q.on=false;clearInterval(Q.tick);if(Q.fromLn){Q.fromLn=false;qLnSync()}showScreen('scrQueue');if(!Q.raf)Q.raf=requestAnimationFrame(qBallLoop);
 track('queue_matched',{wait_secs:Math.round((Date.now()-Q.t0)/1000),bot:true,bot_level:info.bot_level});
 const T=TEAMS[info.away_club];qSay(`OPPONENT FOUND: CPU · LEVEL ${info.bot_level}`,`${T?T.city+' '+T.name:info.away_club} · nobody else was in the queue`);
 setTimeout(()=>{if(Q.gen===gen)botStart(info)},1800)}
function botStart(info){const lv=info.bot_level|0,bot=info.away_club;
 S.rkBot={m:info.match_id,lv,done:false};S.cpuEdge=(lv-3)/7;
 S.you=info.home_club;S.opp=bot;pendingMode=null;startGame('full');botRoster(bot,lv);
 S.totalInn=3;S.schedInn=3;S.oppLine=[0,0,0];S.youLine=[0,0,0];if(ML){ML.mode='ranked_bot';ML.sched=3}
 banner('RANKED · PLAY BALL',`CPU LEVEL ${lv} · ${TEAMS[bot].name} at ${TEAMS[S.you].name} · 3 innings`);updateHUD();
 clearInterval(RK.pingT);const ping=()=>rpc('ranked_ping',{p_match:info.match_id}).catch(()=>{});ping();RK.pingT=setInterval(ping,15000)}
// the bot's players: every rating moves 4 points per level from level 3 (its club's own numbers)
function botRoster(k,lv){const T=TEAMS[k];if(!T.netBackup)T.netBackup={L:T.lineup.slice(),P:T.staff.slice()};const d=(lv-3)*4,st=v=>v==null?v:clamp(Math.round(v+d),25,99);
 T.lineup=T.netBackup.L.map(p=>({...p,con:st(p.con),pow:st(p.pow),spd:st(p.spd)}));T.staff=T.netBackup.P.map(p=>({...p,vel:st(p.vel),mov:st(p.mov),ctl:st(p.ctl)}))}
// the game is over: send your phone's record; the server settles it
async function botGameOver(){const b=S.rkBot,m=ML&&ML.fin?ML:null;if(!b||b.done)return;b.done=true;clearInterval(RK.pingT);
 rkShow('RANKED · sending the result…');
 try{const info=await rpc('bot_submit',{p_match:b.m,p_log:mlWire(m),p_version:PD_VER});if(!rkResult(info))rkShow('RANKED · the result is still being settled','bad')}
 catch(e){rkShow('RANKED · '+rkErr(e),'bad')}}
// leaving early (Quit / Forfeit / Main Menu mid-game): a loss
function botLeave(){const b=S.rkBot;if(!b)return;if(!b.done){b.done=true;clearInterval(RK.pingT);rpc('ranked_concede',{p_match:b.m}).catch(()=>{});track('ranked_bot_forfeit',{level:b.lv})}}
function botClear(){S.rkBot=null;S.cpuEdge=0}
