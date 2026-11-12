// ---------- online 1v1 over the artifact room ----------
// Both screens run the same game. The pitcher's screen publishes each pitch (windup, then release with its
// exact flight); the batter's screen plays that pitch locally, judges the swing locally (so lag never touches
// timing), and publishes its decision. Every random outcome uses a seed both sides share, and the pitcher
// re-sends the full game state with every windup, so the two screens can't drift apart.
// Everything travels in room "presence" (latest-state, re-sent on reconnect), so nothing is lost if a message drops.
let ROOM=null;const PCLOCK=15;
// On a self-hosted copy there is no claude.ai room, so the same calls run over Supabase Realtime presence instead.
const SUPA={url:'__SUPA_URL__',key:'__SUPA_KEY__'};
// one Supabase client for the whole game (online rooms and accounts share it, so a signed-in player's rooms are too)
let SB_P=null;const supaOK=()=>/^https:/.test(SUPA.url)&&typeof claude==='undefined';
function supaClient(){return SB_P||(SB_P=new Promise((res,rej)=>{const mk=()=>{try{res(window.supabase.createClient(SUPA.url,SUPA.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}catch(e){SB_P=null;rej({code:'setup'})}};
  if(window.supabase)return mk();const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';sc.onload=mk;sc.onerror=()=>{SB_P=null;rej({code:'offline'})};document.head.appendChild(sc)}))}
function supaRoom(){const load=supaClient;
 // State travels as broadcast messages (fast), re-sent every 2s as a heartbeat so a dropped message or a
 // reconnect heals itself. A peer only counts as gone after 12s of silence, or when it says goodbye.
 return{join:async name=>{const c=await load();const me=Math.random().toString(36).slice(2,10);
  let cbs=[],scbs=[];const state={};const peers=new Map();let live=true,ch=null,up=false,retryT=0,tries=0;
  const list=()=>{const out=[{sameTab:true,presence:{...state}}];for(const[k,v] of peers)out.push({sameTab:false,presence:v.s});return out};
  const fire=()=>{const pl=list();for(const f of cbs)f({peers:pl})};
  const setUp=v=>{if(up===v)return;up=v;for(const f of scbs)f(v)};
  const send=()=>{if(!live||!ch||!up)return;ch.send({type:'broadcast',event:'s',payload:{k:me,s:state}}).catch(()=>{})};
  // open (or re-open) the channel; resolves on the first SUBSCRIBED
  const open=()=>new Promise((res,rej)=>{const mine=c.channel(name,{config:{broadcast:{self:false,ack:false},presence:{key:me}}});ch=mine;
   mine.on('broadcast',{event:'s'},({payload:m})=>{if(!m||m.k===me)return;const had=peers.get(m.k);peers.set(m.k,{s:m.s,t:Date.now()});
    if(!had)send();if(!had||JSON.stringify(had.s)!==JSON.stringify(m.s))fire()});
   mine.on('broadcast',{event:'bye'},({payload:m})=>{if(m&&peers.delete(m.k))fire()});
   mine.on('presence',{event:'join'},()=>send());
   let done=false;const t=setTimeout(()=>{if(!done){done=true;rej({code:'timeout'})}},10000);
   mine.subscribe(st=>{if(ch!==mine)return;
    if(st==='SUBSCRIBED'){tries=0;setUp(true);mine.track({on:1}).catch(()=>{});send();if(!done){done=true;clearTimeout(t);res()}}
    else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){setUp(false);if(!done){done=true;clearTimeout(t);rej({code:st.toLowerCase()})}else reopen()}})});
  // tear down and try again: 1s, 2s, 4s… capped at 8s, for as long as the player stays in the room
  const reopen=()=>{if(!live||retryT)return;setUp(false);const old=ch;ch=null;if(old)c.removeChannel(old).catch(()=>{});
   const wait=Math.min(8000,1000*Math.pow(2,tries++));retryT=setTimeout(async()=>{retryT=0;if(!live)return;try{await open()}catch(e){reopen()}},wait)};
  await open();
  let lastPeer=Date.now();
  const hb=setInterval(()=>{send();const now=Date.now();let ch2=false;for(const[k,v] of peers){if(v.t>lastPeer)lastPeer=v.t;if(now-v.t>12000){peers.delete(k);ch2=true}}if(ch2)fire();
   if(!navigator.onLine)setUp(false)},2000);
  const vis=()=>{if(!document.hidden){if(!up)reopen();else send()}};document.addEventListener('visibilitychange',vis);
  const onl=()=>{tries=0;if(retryT){clearTimeout(retryT);retryT=0}reopen()},offl=()=>setUp(false);
  window.addEventListener('online',onl);window.addEventListener('offline',offl);
  return{presence:async patch=>{Object.assign(state,patch);send()},onPeers:f=>{cbs.push(f);setTimeout(()=>f({peers:list()}),0);return()=>{cbs=cbs.filter(x=>x!==f)}},
   onStatus:f=>{scbs.push(f);setTimeout(()=>f(up),0)},
   reconnect:()=>{tries=0;if(retryT){clearTimeout(retryT);retryT=0}reopen()},
   leave:async()=>{cbs=[];scbs=[];clearInterval(hb);clearTimeout(retryT);document.removeEventListener('visibilitychange',vis);window.removeEventListener('online',onl);window.removeEventListener('offline',offl);
    try{if(ch&&up)await ch.send({type:'broadcast',event:'bye',payload:{k:me}})}catch(e){}live=false;try{if(ch)await c.removeChannel(ch)}catch(e){}}}}}}
(async()=>{if(typeof claude!=='undefined'){try{ROOM=await claude.use('room')}catch(e){ROOM=null}}
 if(!ROOM&&/^https:/.test(SUPA.url)&&typeof claude==='undefined')ROOM=supaRoom()})();
function netRand(fn){if(!S.online||!S.online.inGame||!S.pitch||!S.pitch.pid)return fn();const r=Math.random;Math.random=mulberry32(hash(S.online.gid+'|'+S.pitch.pid));try{return fn()}finally{Math.random=r}}
const RESUME_KEY='pd-olresume';
function resumeSave(){const o=S.online;if(!o||!o.inGame||!o.code)return;try{localStorage.setItem(RESUME_KEY,JSON.stringify({code:o.code,role:o.role,team:o.mine.team,ros:o.mine.ros,start:o.start,gid:o.gid,z:snapState(),t:Date.now()}))}catch(e){}}
function resumeGet(){try{const r=JSON.parse(localStorage.getItem(RESUME_KEY)||'null');if(r&&Date.now()-r.t<30*60*1000)return r}catch(e){}return null}
function resumeClear(){try{localStorage.removeItem(RESUME_KEY)}catch(e){}}
function netPresence(patch){const o=S.online;if(!o||!o.nr)return;Object.assign(o.mine,patch);o.nr.presence(patch).catch(()=>{})}
function snapState(){const T=TEAMS[batKey()];return{i:S.inning,h:S.half,o:S.outs,b:S.balls,s:S.strikes,r:S.runs,t:S.target,hs:[S.hits,S.oppHits,S.errs||0,S.myErrs||0],bs:S.bases.map(p=>p?T.lineup.indexOf(p):-1),or:S.orderOf,pi:S.pIdxOf,pc:S.pcOf,sm:S.stamOf||{},pr:S.pRunsOf,pb:S.pBFOf,yl:S.youLine,ol:S.oppLine,n:S.totalInn,u:S.usedOf||{}}}
function applySnap(z){const fk0=fldKey(),was=S.pIdxOf[fk0]||0;S.usedOf=JSON.parse(JSON.stringify(z.u||{}));S.pIdxOf={...z.pi};S.orderOf={...z.or};S.inning=z.i;S.half=z.h;setSides();S.outs=z.o;S.balls=z.b;S.strikes=z.s;S.runs=z.r;S.target=z.t;
 [S.hits,S.oppHits,S.errs,S.myErrs]=z.hs;const T=TEAMS[batKey()];S.bases=z.bs.map(i=>i>=0?T.lineup[i]:null);S.pcOf={...z.pc};if(z.sm)S.stamOf={...z.sm};S.pRunsOf={...z.pr};S.pBFOf={...z.pb};S.youLine=[...z.yl];S.oppLine=[...z.ol];S.totalInn=z.n;applyDefense();{const fk=fldKey();if(fk===fk0&&(S.pIdxOf[fk]||0)!==was){const np=pitcher();banner('PITCHING CHANGE',`#${np.no} ${np.name} in from the pen · ${arsOf(np).map(a=>PITCHES[a].name.toLowerCase()).join(', ')}`);S.jumbo={text:'NEW PITCHER',kr:'투수 교체',until:performance.now()+3200}}}updateHUD()}
const PITCH_KEYS=['k','name','mph','travel','side','slot','h0','relX','plateX','mov','inZone','kn','wind','hbp','pid'];
function pitchData(){const d={};for(const k of PITCH_KEYS)if(S.pitch[k]!==undefined)d[k]=S.pitch[k];return d}
function netWindup(){const o=S.online;o.n=(o.n||0)+1;S.pitch.pid=o.role[0]+o.n;netPresence({pt:{id:S.pitch.pid,st:'w',p:pitchData(),z:snapState()}})}
function netRelease(){const o=S.online,p=S.pitch;netPresence({pt:{id:p.pid,st:'r',p:{...pitchData(),q:p.q,wild:!!p.wild},z:o.mine.pt?o.mine.pt.z:snapState()}})}
function netDecide(k){const o=S.online,sw=S.swing||{};netPresence({dc:{id:S.pitch.pid,k,e:sw.err||0,m:!!sw.miss,sl:S.steal?{1:!!S.steal[1],2:!!S.steal[2]}:null}})}
// batter side: start the remote pitch
function applyWindup(pt){const o=S.online;o.seenW=pt.id;applySnap(pt.z);hideBanner();
 unduckMusic();S.pitch={...pt.p,releaseAt:0,trail:[],remote:true};WIN=winOf(curBatter())*Math.pow(95/S.pitch.mph,1.3);S.swing=null;o.waitMsg=false;setPhase('windup');updateHUD()}
function applyRelease(pt){const o=S.online;o.seenR=pt.id;Object.assign(S.pitch,{plateX:pt.p.plateX,inZone:pt.p.inZone,q:pt.p.q,wild:pt.p.wild,hbp:pt.p.hbp,relRecv:true});
 if(S.phase==='windup'&&S.pt<S.pitch.wind)S.pt=S.pitch.wind}
// pitcher side: the batter swung, bunted or took
function applyDecision(dc){const p=S.pitch;if(!p||p.decided||dc.id!==p.pid)return;p.decided=true;S.steal=dc.sl&&(dc.sl[1]||dc.sl[2])?{1:dc.sl[1],2:dc.sl[2]}:null;
 const arr=p.releaseAt+p.travel;
 if(dc.k==='bunt'){if(!S.swing)S.swing={at:arr-200,bunt:true,err:0,contactAt:arr}}
 else if(dc.k==='swing'&&!S.swing){S.swing={at:arr+dc.e-60,err:dc.e,cpu:true};if(dc.m)S.swing.miss=true;else S.swing.contactAt=arr+Math.max(0,dc.e)}}
function netTick(now){const o=S.online,opp=o.opp;
 if(o.inGame&&now-(o.szAt||0)>2000&&(S.phase==='ready'||S.phase==='choose')){o.szAt=now;const z=snapState(),j=JSON.stringify(z);if(j!==o.szJ){o.szJ=j;netPresence({sz:{gid:o.gid,z,t:Date.now()}});resumeSave()}}
 // pitch clock: the pitcher has PCLOCK seconds to pick a pitch; both screens show the countdown
 if(o.inGame){let left=-1;
  if(pitching()){if(S.phase==='choose'){if(!o.clkEnd){o.clkEnd=now+PCLOCK*1000;o.clkN=(o.clkN||0)+1;netPresence({ck:{id:o.role[0]+o.clkN,ms:PCLOCK*1000}})}
    left=o.clkEnd-now;if(left<=0){o.clkEnd=0;netPresence({ck:null});hideBanner();startWindup();updateHUD();left=-1}}
   else if(o.clkEnd){o.clkEnd=0;netPresence({ck:null})}}
  else{const ck=opp&&opp.ck;if(ck&&ck.id!==o.oclkId){o.oclkId=ck.id;o.oclkEnd=now+ck.ms-100}
   if(!ck)o.oclkEnd=0;if(o.oclkEnd&&(S.phase==='ready'||S.phase==='choose'))left=o.oclkEnd-now}
  const el=$('clkS');if(left>=0){const sec=Math.ceil(left/1000);el.hidden=false;if(o.clkShown!==sec){o.clkShown=sec;$('clkV').textContent=sec;el.classList.toggle('low',sec<=5)}}else if(!el.hidden){el.hidden=true;o.clkShown=-1}}
 else if(!$('clkS').hidden)$('clkS').hidden=true;if(o.lostAt&&o.lostBan&&$('banner').hidden){$('bt').textContent='CONNECTION LOST';$('bs').textContent='Waiting for your opponent to come back…';$('banner').dataset.tone='';$('banner').hidden=false}if(!opp)return;
 if(!pitching()&&S.phase==='ready'&&S.pt>2600&&!o.waitMsg){o.waitMsg=true;banner('THEIR PITCH','Waiting for the pitcher…')}
 if(!pitching()){const pt=opp.pt;if(pt&&pt.id){
   if(pt.st==='k'){if(o.seenW!==pt.id&&(S.phase==='ready'||S.phase==='choose')&&S.pt>250){o.seenW=pt.id;o.waitMsg=false;hideBanner();applySnap(pt.z);runPickoff(pt.b,o.gid+'|'+pt.id)}}
   else if(o.seenW!==pt.id&&(S.phase==='ready'||S.phase==='choose')&&S.pt>250)applyWindup(pt);
   if(o.seenW===pt.id&&pt.st==='r'&&o.seenR!==pt.id&&S.pitch&&S.pitch.pid===pt.id)applyRelease(pt)}}
 else{const dc=opp.dc;if(dc&&S.phase==='pitch'&&S.pitch&&dc.id===S.pitch.pid)applyDecision(dc);
  if(opp.sk&&S.phase==='play'&&S.play&&S.play.hrFired&&S.pitch&&opp.sk===S.pitch.pid&&S.play.t<S.play.end)S.play.t=S.play.end}}
function startOnline(st){const o=S.online;o.gid=st.gid;o.start=st;if(o.mine.rdy)netPresence({rdy:null});
 o.series={sid:st.sid||st.gid,bo:st.bo||1,gn:st.gn||1,inn:st.inn,w:{host:(st.sw||[0,0])[0],guest:(st.sw||[0,0])[1]},done:false};$('olNext').hidden=true;$('olSeries').hidden=true;o.inGame=true;o.n=0;o.seenW=o.seenR=null;
 o.prevCustom=CUSTOM.active;CUSTOM.active=false;applyCustom();
 {const ok=o.role==='host'?st.away:st.home;if(o.opp&&o.opp.ros)applyRosterSpec(ok,o.opp.ros)}// field the opponent exactly as their phone does
 S.you=st.home;S.opp=st.away;S.night=!!st.night;syncPicker();if(FIELD){rebuildPark();SIGNS=buildSigns()}
 S.auto=false;syncAuto();o.sawIng=false;o.lostAt=0;netPresence({pt:null,dc:null,ing:st.gid});
 pendingMode=null;startGame('full');if(S.night!==!!st.night){S.night=!!st.night;SIGNS=buildSigns()}S.totalInn=st.inn;S.schedInn=st.inn;S.oppLine=Array(st.inn).fill(0);S.youLine=Array(st.inn).fill(0);
 banner(o.series.bo>1?`GAME ${o.series.gn} · BEST OF ${o.series.bo}`:'PLAY BALL',`${TEAMS[S.opp].name} at ${TEAMS[S.you].name} · ${st.inn} innings · you are ${o.me==='home'?'home':'away'}${o.series.bo>1?` · series ${o.series.w[o.role]}-${o.series.w[o.role==='host'?'guest':'host']}`:''}`);updateHUD()}
function lobbyRender(){const o=S.online;netPill();if(!o)return;{const r=resumeGet();const rb=$('olRejoin');rb.hidden=!r||!!o.nr;if(r)rb.textContent=`REJOIN GAME · ROOM ${r.code.toUpperCase()}`}$('olStart').hidden=!!o.nr;$('olRoom').hidden=!o.nr;if(!o.nr)return;
 $('olCodeShow').textContent=o.code.toUpperCase();
 const side=(k,tag)=>k&&TEAMS[k]?`<img alt="" src="${LOGO_URL[k]}"><b>${TEAMS[k].city} ${TEAMS[k].name}</b><small>${tag}</small>`:`<b>Waiting…</b><small>${tag}</small>`;
 const meK=o.mine.team,thK=o.opp&&o.opp.team;
 $('olMe').innerHTML=side(meK,`YOU · ${o.role==='host'?'HOME':'AWAY'}`);$('olThem').innerHTML=side(thK,o.role==='host'?'AWAY':'HOME');$('olThem').classList.toggle('wait',!thK);
 $('olInnRow').hidden=o.role!=='host';$('olBoRow').hidden=o.role!=='host';
 if(!$('olPick').children.length){$('olPick').innerHTML=ORDER.map(t=>`<button type="button" data-t="${t}" aria-label="${TEAMS[t].city} ${TEAMS[t].name}"><img alt="" src="${LOGO_URL[t]}"><span>${TEAMS[t].name.toUpperCase()}</span></button>`).join('')}
 for(const c of $('olPick').children){c.setAttribute('aria-pressed',String(c.dataset.t===meK));c.classList.toggle('taken',c.dataset.t===thK)}
 const same=thK&&thK===meK;
 /* the game starts when both players are ready; nobody is ready by default */
 const meR=o.mine.rdy==='L',thR=!!(o.opp&&o.opp.rdy==='L'),canR=!!(o.opp&&!same);
 const goB=$('olGo');goB.hidden=!canR;goB.textContent=meR?'READY ✓':'READY';goB.setAttribute('aria-pressed',String(meR));goB.classList.toggle('isReady',meR);
 if(o.warnUntil>performance.now())return;
 $('olStatus').classList.toggle('olWarn',!!same);$('olStatus').classList.toggle('olReady',canR&&thR&&!meR);
 $('olStatus').textContent=!o.opp?(o.role==='host'?'Share the code. Waiting for your friend to join…':'Waiting for the host…'):same?`You both picked the ${TEAMS[meK].name}. The same club can't play itself. One of you needs to pick another.`:
  meR&&thR?'Both ready. Starting…':meR?'Waiting for opponent…':thR?'Opponent is ready.':'Both here. Press Ready when you are.';
 readyCheck()}
/* host's phone starts the game the moment both ready flags match (the room, or the next game of a series) */
function readyCheck(){const o=S.online;if(!o||!o.opp||o.inGame||o.role!=='host'||o.opp.team===o.mine.team)return;
 const a=o.mine.rdy,b=o.opp.rdy;if(!a||a!==b)return;
 if(a==='L'){netPresence({rdy:null});hostStart(false)}
 else if(o.series&&!o.series.done&&a==='N'+o.series.gn){netPresence({rdy:null});hostStart(true)}}
/* the results card in a series: both players press Ready for the next game */
function nextRender(){const o=S.online,se=o&&o.series,b=$('olNext');if(!se||se.bo<2){b.hidden=true;return}
 if(se.done){b.hidden=true;$('olSeries').textContent=se.tally||'';return}
 const tok='N'+se.gn,meR=o.mine.rdy===tok,thR=!!(o.opp&&o.opp.rdy===tok);
 b.hidden=false;b.textContent=meR?`READY ✓ · GAME ${se.gn+1}`:`READY FOR GAME ${se.gn+1}`;b.classList.toggle('isReady',meR);
 $('olSeries').textContent=`${se.tally||''} · ${meR&&thR?'Both ready. Starting…':meR?'Waiting for opponent…':thR?'Opponent is ready.':'Press Ready for the next game.'}`;readyCheck()}
async function joinRoom(code,role,resume){const note=t=>{const n=$('olNote');n.textContent=t;n.style.color='var(--amber)';n.scrollIntoView({block:'nearest'})};
 if(!ROOM){note(typeof claude!=='undefined'?'Online play with friends works on play.imugilabs.com. Open the game there and try again.':'Online play is not available here.');return}
 code=code.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,4);if(code.length<4){note('Room codes are 4 letters.');return}
 if(S.online&&S.online.nr)try{await S.online.nr.leave()}catch(e){}
 if(joinRoom.busy)return;joinRoom.busy=true;note('Connecting…');
 let nr;try{nr=await ROOM.join('pd-'+code)}catch(e){joinRoom.busy=false;note('Could not reach the room ('+(e&&e.code||'error')+'). Check your connection and try again.');return}
 joinRoom.busy=false;note(role==='host'?'Room open. Send your friend the code.':'Joined room '+code.toUpperCase()+'.');
 const o=S.online={code,role,me:role==='host'?'home':'away',nr,mine:{},opp:null,inGame:false};
 if(resume){o.gid=resume.gid;o.resume=resume}
 if(nr.onStatus)nr.onStatus(up=>{if(S.online!==o)return;o.selfDown=!up;
  if(!up&&o.inGame){o.selfBan=true;$('bt').textContent='YOU\u2019RE OFFLINE';$('bs').textContent='Reconnecting… your game is saved and picks up where it left off.';$('banner').dataset.tone='';$('banner').hidden=false}
  else if(up&&o.selfBan){o.selfBan=false;hideBanner();if(o.inGame)banner('RECONNECTED','Back in the game.')}
  lobbyRender()});
 nr.onPeers(ch=>{const them=ch.peers.filter(p=>!p.sameTab&&p.presence&&p.presence.v===1&&p.presence.role!==o.role);const prev=o.opp;o.opp=them.length?them[0].presence:null;
  if(o.resume&&o.opp&&!o.inGame){const R0=o.resume;o.resume=null;
   if(o.opp.ing===R0.gid){// they're still in the game: put it back together from whichever snapshot is newer
    startOnline(R0.start);const z=o.opp.sz&&o.opp.sz.gid===R0.gid&&o.opp.sz.t>R0.t?o.opp.sz.z:R0.z;applySnap(z);o.n=1000+(Date.now()%9000);setPhase('ready');S.pt=0;updateHUD();banner('RECONNECTED','Back in the game.')}
   else{resumeClear();o.gid=null}}
  if(o.opp&&role==='guest'&&o.opp.start&&o.opp.start.gid!==o.gid&&!o.inGame)startOnline(o.opp.start);
  if(o.inGame&&prev&&!o.opp&&!o.lostAt){o.lostAt=Date.now();o.lostBan=true;$('bt').textContent='CONNECTION LOST';$('bs').textContent='Waiting for your opponent to come back…';$('banner').dataset.tone='';$('banner').hidden=false;
   clearTimeout(o.lostT);o.lostT=setTimeout(()=>{if(S.online!==o||o.opp||!o.inGame)return;banner('OPPONENT LEFT','They did not come back. Back to the room.');o.inGame=false;setTimeout(()=>{if(S.online!==o||o.inGame)return;toTitle();openOnline()},2500)},45000)}
  if(o.inGame&&o.opp){if(o.opp.ing===o.gid)o.sawIng=true;else if(o.sawIng){o.sawIng=false;clearTimeout(o.lostT);o.lostAt=0;o.lostBan=false;banner('OPPONENT LEFT','They quit the game. Back to the room.');o.inGame=false;setTimeout(()=>{if(S.online!==o||o.inGame)return;toTitle();openOnline()},2500)}}
  if(o.inGame&&o.opp&&o.lostAt){o.lostAt=0;clearTimeout(o.lostT);if(o.lostBan){o.lostBan=false;hideBanner()}}
  if(!o.opp&&prev&&!o.inGame&&o.mine.rdy)netPresence({rdy:null});
  lobbyRender();if(!o.inGame)nextRender()});
 netPresence({v:1,role,team:S.you,ros:rosterSpec(S.you),rdy:null,...(resume?{ing:resume.gid,start:role==='host'?resume.start:undefined}:{})});lobbyRender()}
$('olPick').addEventListener('click',e=>{const c=e.target.closest('button');const o=S.online;if(!c||!o||!o.nr||o.inGame)return;const t=c.dataset.t;
 if(o.opp&&o.opp.team===t){o.warnUntil=performance.now()+3000;$('olStatus').classList.add('olWarn');$('olStatus').textContent=`Your opponent already has the ${TEAMS[t].name}. Same-club games aren't allowed. Pick another club.`;setTimeout(lobbyRender,3050);return}
 S.you=t;if(S.opp===S.you)S.opp=ORDER.find(k=>k!==t);syncPicker();applyCustom();updateHUD();parkDirty();netPresence({team:t,ros:rosterSpec(t),rdy:null});lobbyRender()});
function openOnline(){if(!S.online)S.online={mine:{},opp:null};lobbyRender();showScreen('scrOnline')}
$('olCreate').addEventListener('click',()=>{const L='abcdefghjkmnpqrstuvwxyz';let c='';for(let i=0;i<4;i++)c+=L[Math.floor(Math.random()*L.length)];joinRoom(c,'host')});
$('olJoin').addEventListener('click',()=>joinRoom($('olCode').value,'guest'));
$('olCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')joinRoom($('olCode').value,'guest')});
$('olInn').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const x of $('olInn').children)x.setAttribute('aria-pressed',String(x===b))});
$('olBo').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const x of $('olBo').children)x.setAttribute('aria-pressed',String(x===b))});
// series: the host's phone keeps the tally and sends it with every game it starts, so both screens agree
function hostStart(next){const o=S.online;if(!o||!o.opp)return;if(o.opp.team===o.mine.team){lobbyRender();return}
 const se=next&&o.series&&!o.series.done?o.series:null;
 const inn=se?se.inn:+($('olInn').querySelector('[aria-pressed=true]')||{dataset:{v:3}}).dataset.v;
 const bo=se?se.bo:+($('olBo').querySelector('[aria-pressed=true]')||{dataset:{v:1}}).dataset.v;
 const st={gid:Math.random().toString(36).slice(2,8),home:o.mine.team,away:o.opp.team,inn,night:Math.random()<.55,
  bo,sid:se?se.sid:Math.random().toString(36).slice(2,8),gn:se?se.gn+1:1,sw:se?[se.w.host,se.w.guest]:[0,0]};
 netPresence({start:st});startOnline(st)}
$('olGo').addEventListener('click',()=>{const o=S.online;if(!o||!o.opp||o.inGame)return;netPresence({rdy:o.mine.rdy==='L'?null:'L'});lobbyRender()});
$('olNext').addEventListener('click',()=>{const o=S.online,se=o&&o.series;if(!se||se.done||o.inGame)return;const tok='N'+se.gn;netPresence({rdy:o.mine.rdy===tok?null:tok});nextRender()});
$('olLeave').addEventListener('click',async()=>{resumeClear();const o=S.online;if(o&&o.nr)try{await o.nr.leave()}catch(e){}if(o&&o.prevCustom!=null){CUSTOM.active=o.prevCustom;applyCustom()}S.online=null;openOnline()});
$('toLobby').addEventListener('click',()=>{$('over').hidden=true;toTitle();const o=S.online;if(o){netPresence({rdy:null});o.prevCustom!=null&&(CUSTOM.active=o.prevCustom,applyCustom());if(o.role==='host')netPresence({start:null})}openOnline()});

// the connection pill: shown during an online game; green when live, amber while it reconnects (tap to retry now)
function netPill(){const o=S.online,el=$('olNet');const on=!!(o&&o.nr&&o.inGame);el.hidden=!on;if(!on)return;
 const down=!!o.selfDown,lost=!!o.lostAt;el.classList.toggle('down',down);el.classList.toggle('warn',!down&&lost);
 el.querySelector('span').textContent=down?'RECONNECTING… TAP':lost?'OPPONENT OFFLINE':'ONLINE'}
$('olNet').addEventListener('click',()=>{const o=S.online;if(o&&o.nr&&o.nr.reconnect)o.nr.reconnect()});
setInterval(netPill,1000);
$('olRejoin').addEventListener('click',()=>{const r=resumeGet();if(!r)return;S.you=r.team;syncPicker();applyCustom();joinRoom(r.code,r.role,r)});
