// ---------- ranked online: the server opens the match, rolls the seed, and settles the result ----------
// A ranked game is an ordinary online game with four differences: both players must be signed in with a username;
// both clubs play their stock rosters (no signed cards, no levels, no AUTO); the match id and random seed come from
// the server (supabase/migrations/002_ranked.sql), not from the host's phone; and at the end both phones submit their
// match record. The server counts the result only when the two records agree, neither phone's checks failed, and
// the record adds up as a baseball game. Single-player and casual online games are reported as your own
// (unverified) stat line instead, for your profile.
// the release name (bump it by hand when shipping) and the build id (stamped by tools/build.py from the code itself)
const APP_VERSION='2.0.3',PD_BUILD='__PD_VER__',PD_VER=APP_VERSION+'+'+PD_BUILD;
$('abVer').innerHTML=`${APP_VERSION} <small class="abBuild">build ${PD_BUILD}</small>`;
const RK={pingT:0,pollT:0,claimT:0};
async function rpc(fn,args){const c=await supaClient();const {data,error}=await c.rpc(fn,args||{});if(error)throw error;return data}
const rkErr=e=>((e&&e.message)||'Could not reach the server').replace(/^.*?exception:\s*/,'');
const rkReady=()=>supaOK()&&!!(ACC.user&&ACC.name);
// stock rosters: each club's own players at their own ratings, in their usual order
function stockSpec(k,base){const R=PRISTINE[base]||PRISTINE[k];return{base:PRISTINE[base]?base:k,L:R.L.map(p=>['n',p.name,{}]),P:R.P.map(p=>['n',p.name,{}])}}
// is this room playing ranked? (the host chose Ranked on the Multiplayer page; a guest plays whatever room it joined)
const rkOn=o=>!!o&&(o.role==='guest'?!!(o.opp&&o.opp.rk):o.mode==='ranked');
// the room's heading and blurb follow its kind
function rkHead(o){const on=rkOn(o);$('olHead').innerHTML=on?'RANKED <span>1v1</span>':'CUSTOM <span>1v1</span>';
 $('olNote').textContent=on?'A rated game against a friend. One of you creates a room and shares the code, the other joins with it. Each club plays its own roster, one game, and the result counts for both ratings.'
  :'Play a friend in real time. One of you creates a room and shares the code, the other joins with it. Then you each pick a club. The host is the home team.'}
// the lobby: who may ready up, and what the room needs to hear about it
function rkLobby(o){const on=rkOn(o),host=o.role==='host';
 $('olBoRow').hidden=!host||on;
 rkHead(o);
 const nt=$('olRkNote'),odd=!host&&o.mode==='ranked'&&!!o.opp&&!on;nt.hidden=!on&&!odd;
 if(odd)nt.textContent='This is a Custom 1v1 room, so it won\u2019t count for rating.';
 if(on)nt.textContent=`RANKED · ${ACC.name||'you'} vs ${(o.opp&&o.opp.acct)||'?'} · stock rosters, one game, counts for rating`;
 if(host&&o.mine.rk!==(on?1:0))netPresence({rk:on?1:0,ros:on?null:myRosterSpec()});
 if(!host&&on&&o.mine.ros)netPresence({ros:null});
 if(!on&&!o.mine.ros&&o.mine.team)netPresence({ros:myRosterSpec()});// back to casual: your signed cards count again
 if(!on)return null;
 if(!rkReady())return ACC.user?'Ranked needs a username. Choose one on the Account screen.':'Ranked needs an account. Sign in on the Account screen (main menu), then come back.';
 if(o.opp&&!o.opp.acct)return'Your opponent needs to sign in to play ranked.';
 return null}
// the Multiplayer page: Ranked or Custom 1v1
function mpOpen(){const ok=supaOK();$('goRanked').disabled=!ok;$('mpNote').hidden=ok;
 if(!ok)$('mpNote').textContent='Ranked is played on imugilabs.com/pocket-diamond (it needs the game server).';showScreen('scrMulti')}
$('goRanked').addEventListener('click',()=>{ensureAudio();if(!rkReady()){$('mpNote').hidden=false;
  $('mpNote').textContent=ACC.user?'Ranked needs a username. Choose one on the Account screen.':'Ranked needs an account so your rating can be saved. Sign in on the Account screen (main menu).';return}
 qStart()});
$('goCustom').addEventListener('click',()=>{ensureAudio();openOnline('custom')});
// host: open the match on the server, wait for the guest to join it, then start with the server's seed
async function rkHostStart(inn){const o=S.online;if(o.rkBusy)return;o.rkBusy=true;
 try{$('olStatus').textContent='Opening a ranked match…';
  const r=await rpc('ranked_open',{p_home_club:o.mine.team,p_away_club:o.opp.team,p_innings:inn,p_version:PD_VER});
  o.rkm=r.match_id;netPresence({rkm:o.rkm});$('olStatus').textContent='Waiting for your opponent to join the ranked match…';
  const t0=Date.now();while(Date.now()-t0<20000&&S.online===o){
   if(o.opp&&o.opp.rkj===o.rkm){const info=await rpc('ranked_info',{p_match:o.rkm});
    if(info.status==='live'&&info.seed){const st={gid:o.rkm+':'+info.seed,home:o.mine.team,away:o.opp.team,hb:MYTEAM?MYTEAM.base:o.mine.team,ab:o.opp.base||o.opp.team,inn,night:Math.random()<.55,bo:1,sid:o.rkm,gn:1,sw:[0,0],
      rk:{m:o.rkm,home:info.home_name,away:info.away_name}};netPresence({start:st});startOnline(st);return}}
   await new Promise(r=>setTimeout(r,500))}
  throw{message:'Your opponent did not join the ranked match. Press Ready to try again.'}}
 catch(e){o.rkm=null;netPresence({rkm:null,rdy:null});o.warnUntil=performance.now()+6000;$('olStatus').classList.add('olWarn');$('olStatus').textContent=rkErr(e)}
 finally{o.rkBusy=false}}
// guest: the host opened a match: join it on the server (which rolls the seed) and remember what to expect
async function rkGuestJoin(o,m){if(o.rkJoining===m)return;o.rkJoining=m;
 try{const info=await rpc('ranked_join',{p_match:m});if(S.online!==o)return;o.rkGid=m+':'+info.seed;netPresence({rkj:m})}
 catch(e){o.warnUntil=performance.now()+6000;$('olStatus').classList.add('olWarn');$('olStatus').textContent=rkErr(e);o.rkJoining=null}}
// the guest starts only the game the server set up for it
const rkStartOK=(o,st)=>!st.rk||st.gid===o.rkGid;
// ---- in the game ----
function rkBegin(o,st){o.ranked=!!st.rk;o.rk=st.rk||null;clearInterval(RK.pingT);RK.done=false;
 if(o.ranked){applyRosterSpec(st.home,stockSpec(st.home,st.hb));applyRosterSpec(st.away,stockSpec(st.away,st.ab));
  const ping=()=>{if(S.online===o&&o.inGame)rpc('ranked_ping',{p_match:o.rk.m}).catch(()=>{})};ping();RK.pingT=setInterval(ping,30000)}}
function rkStop(){clearInterval(RK.pingT);clearTimeout(RK.pollT);clearTimeout(RK.claimT)}
// the final screen's ranked line
function rkShow(t,tone){const el=$('rkRes');el.hidden=!t;el.textContent=t||'';el.dataset.tone=tone||''}
function rkResult(info){const d=info.rating_after!=null&&info.rating_before!=null?info.rating_after-info.rating_before:null;
 if(['final','forfeit','disputed','abandoned'].includes(info.status)&&rkResult.sent!==info.match_id){rkResult.sent=info.match_id;track('ranked_result',{status:info.status,won:info.winner_side===info.me,rating_after:info.rating_after,dispute:info.dispute||undefined})}
 if(info.status==='final'||info.status==='forfeit'){const won=info.winner_side===info.me;
  rkShow(`RANKED ${won?'WIN':'LOSS'}${info.status==='forfeit'?' (FORFEIT)':''} · RATING ${info.rating_after!=null?info.rating_after:'?'}${d!=null?` (${d>=0?'+':''}${d})`:''}`,won?'win':'loss');return true}
 if(info.status==='disputed'){rkShow(`NOT COUNTED · ${info.dispute||'the two phones did not agree'}`,'bad');return true}
 if(info.status==='abandoned'){rkShow('NOT COUNTED · the match timed out','bad');return true}
 return false}
// game over: ranked submits the match record; everything else reports your own line (if you're signed in)
async function rkGameOver(){const o=S.online,m=ML&&ML.fin?ML:null;$('toLobby').textContent=o&&o.queued?'BACK TO MULTIPLAYER':'BACK TO THE ROOM';if(!m||RK.done)return;RK.done=true;
 if(o&&o.ranked&&o.rk){clearInterval(RK.pingT);rkShow('RANKED · sending the result…');
  try{const h=await mlHash(m);let info=await rpc('ranked_submit',{p_match:o.rk.m,p_hash:h,p_log:mlWire(m),p_flags:o.flags||[],p_version:PD_VER});
   if(rkResult(info))return;rkShow('RANKED · waiting for your opponent’s result…');
   const t0=Date.now(),poll=async()=>{try{info=await rpc('ranked_info',{p_match:o.rk.m});if(rkResult(info))return}catch(e){}
    if(Date.now()-t0>180000){rkShow('RANKED · still waiting on your opponent. If they left, the win is yours after 3 minutes.');rkClaimLoop(o);return}
    RK.pollT=setTimeout(poll,3000)};RK.pollT=setTimeout(poll,2000)}
  catch(e){rkShow('RANKED · '+rkErr(e),'bad')}
  return}
 // your own line: needs an account, and at least one plate appearance you played yourself
 if(!rkReady()||!m.pa.some(c=>!c.auto))return;
 rpc('report_match',{p_log:mlWire(m),p_version:PD_VER}).catch(()=>{})}
// the opponent left a ranked game: after 3 minutes of silence the server gives you the win
function rkOppGone(o){if(!o.ranked||!o.rk)return false;banner('OPPONENT LEFT','If they don’t come back within 3 minutes, the win is yours.');rkClaimLoop(o);return true}
function rkClaimLoop(o){clearTimeout(RK.claimT);const t0=Date.now();
 const go=async()=>{if(S.online!==o)return;if(o.opp&&o.inGame&&!(ML&&ML.fin))return;// they came back
  try{rpc('ranked_ping',{p_match:o.rk.m}).catch(()=>{});const info=await rpc('ranked_claim',{p_match:o.rk.m});
   if(info.status==='forfeit'||info.status==='final'||info.status==='disputed'){o.inGame=false;rkStop();
    const d=info.rating_after-info.rating_before,won=info.winner_side===info.me;
    banner(won?'WIN BY FORFEIT':'MATCH OVER',won?`Your opponent left. Rating ${info.rating_after} (${d>=0?'+':''}${d})`:'');
    setTimeout(()=>{if(S.online!==o)return;toTitle();openOnline()},5000);return}}catch(e){}
  if(Date.now()-t0<15*60000)RK.claimT=setTimeout(go,20000)};
 RK.claimT=setTimeout(go,20000)}

// ---- the ranked queue: Ranked on the Multiplayer page finds you an opponent ----
// You wait on the server (queue_poll every 2 s). When it pairs you, both phones meet in a room named after the match,
// the player who waited longer hosts (home) and starts the game with the server's seed: 3 innings, bat and pitch.
const Q={on:false,t0:0,tick:0,gen:0};
const fmtClock=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function qSay(status,info){$('qStatus').textContent=status;if(info!=null)$('qInfo').textContent=info}
async function qStart(){const gen=++Q.gen;Q.on=true;Q.t0=Date.now();track('queue_joined',{club:S.you});qSay('FINDING AN OPPONENT','3 innings · you bat and pitch');$('qRate').textContent='';$('qCancel').disabled=false;
 showScreen('scrQueue');clearInterval(Q.tick);Q.tick=setInterval(()=>{$('qTime').textContent=fmtClock((Date.now()-Q.t0)/1000)},250);$('qTime').textContent='0:00';
 rpc('my_rating').then(r=>{if(Q.gen===gen&&r)$('qRate').textContent=`YOUR RATING ${r.rating}${r.games?` · ${r.wins}-${r.losses}`:''}`}).catch(()=>{});
 try{let r=await rpc('queue_join',{p_club:S.you,p_clubs:ORDER.filter(k=>k!==S.you),p_version:PD_VER});
  while(Q.on&&Q.gen===gen){if(r&&r.queue==='matched'){qMatched(r.info,gen);return}
   if(r&&r.queue==='gone'){r=await rpc('queue_join',{p_club:S.you,p_clubs:ORDER.filter(k=>k!==S.you),p_version:PD_VER});continue}
   if(r&&r.waiting>1)qSay('FINDING AN OPPONENT',`3 innings · you bat and pitch · ${r.waiting} in the queue`);
   await new Promise(res=>setTimeout(res,2000));if(!Q.on||Q.gen!==gen)return;r=await rpc('queue_poll')}}
 catch(e){if(Q.gen!==gen)return;Q.on=false;clearInterval(Q.tick);qSay('COULDN\u2019T JOIN THE QUEUE',rkErr(e))}}
function qStop(){Q.on=false;Q.gen++;clearInterval(Q.tick)}
$('qCancel').addEventListener('click',()=>{const was=Q.on;if(was)track('queue_cancelled',{wait_secs:Math.round((Date.now()-Q.t0)/1000)});qStop();if(was)rpc('queue_leave').catch(()=>{});
 const o=S.online;if(o&&o.queued){if(o.nr)o.nr.leave().catch(()=>{});S.online=null}mpOpen()});
// paired: meet the opponent in the match's room
async function qMatched(info,gen){Q.on=false;track('queue_matched',{wait_secs:Math.round((Date.now()-Q.t0)/1000)});const opp=info.me==='home'?info.away_name:info.home_name,mine=info.me==='home'?info.home_club:info.away_club;
 qSay(`OPPONENT FOUND: ${String(opp||'?').toUpperCase()}`,`You play as ${TEAMS[mine]?TEAMS[mine].city+' '+TEAMS[mine].name:mine} · connecting…`);
 S.online={mine:{},opp:null,mode:'ranked'};
 await joinRoom('rk-'+info.match_id,info.me==='home'?'host':'guest');
 const o=S.online;if(!o||!o.nr||Q.gen!==gen){qSay('COULDN\u2019T CONNECT','Check your connection and try again.');clearInterval(Q.tick);return}
 o.queued=true;o.qInfo=info;o.rkGid=info.match_id+':'+info.seed;
 // (whatever the other phone already said before this one finished joining)
 if(o.opp){if(o.role==='host'){if(!o.qStarted)qStartGame(o)}else if(o.opp.start&&!o.inGame&&rkStartOK(o,o.opp.start))startOnline(o.opp.start)}
 // nobody showed up: back to the queue (the empty match is cleaned up by the server)
 setTimeout(()=>{if(S.online===o&&!o.inGame&&Q.gen===gen){o.nr.leave().catch(()=>{});S.online=null;qSay('OPPONENT DIDN\u2019T CONNECT','Back in the queue…');setTimeout(()=>{if(Q.gen===gen)qStart()},1200)}},25000)}
// host: the guest is here: start with the match the server set up
function qStartGame(o){const i=o.qInfo;if(!i)return;o.qStarted=true;clearInterval(Q.tick);
 const st={gid:o.rkGid,home:i.home_club,away:i.away_club,hb:MYTEAM?MYTEAM.base:i.home_club,ab:(o.opp&&o.opp.base)||i.away_club,inn:3,night:Math.random()<.55,bo:1,sid:i.match_id,gn:1,sw:[0,0],rk:{m:i.match_id,home:i.home_name,away:i.away_name}};
 netPresence({start:st});startOnline(st)}
// after the game: leave the match room and go back to the Multiplayer page
function qDone(o){resumeClear();if(o.nr)o.nr.leave().catch(()=>{});if(o.prevCustom!=null){CUSTOM.active=o.prevCustom;applyCustom()}S.online=null;mpOpen()}
