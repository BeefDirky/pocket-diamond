// ---------- friends playoff: an 8-club bracket played live with your friends (server: migration 014) ----------
// The host creates it and invites friends; START fills the empty spots with CPU clubs and seeds everyone by ranked
// rating. Quarterfinals and semifinals are best of 3, the final best of 5, every game 3 innings with the higher seed home.
// Your series against a CPU club is played on your phone (a CPU at the level its rating gives); against a friend it's a
// custom room whose code the series keeps. After each game your phone reports the score. Nothing here touches ranked.
const TN={st:null,busy:false,poll:0,seen:{},inv:null};
const TN_ROUND=['','QUARTERFINALS','SEMIFINALS','FINAL'];
const tnErr=e=>{const m=(e&&e.message)||'';return/tourney_|function .* does not exist|schema cache/i.test(m)?'Friends playoffs aren’t set up on the server yet.':m||'Could not reach the server.'};
function tnSay(t,bad){const m=$('tnMsg');m.textContent=t||'';m.classList.toggle('bad',!!bad)}
const tnP=seed=>TN.st&&TN.st.players.find(p=>p.seed===seed);
const tnMe=()=>TN.st&&TN.st.players.find(p=>p.me);
const tnClubName=k=>TEAMS[k]?`${TEAMS[k].city} ${TEAMS[k].name}`:(k||'');
function tnLabel(p){if(!p)return'—';return p.user_id?esc(p.name):`CPU · ${esc(TEAMS[p.club]?TEAMS[p.club].name:p.club)}`}
function tnMySeries(){const me=tnMe();if(!me||!me.seed||!TN.st)return null;return TN.st.series.filter(s=>s.seed_a===me.seed||s.seed_b===me.seed).sort((a,b)=>b.round-a.round)[0]||null}
async function tnLoad(){if(!frSignedIn())return;try{TN.st=await rpc('tourney_state',{p_tid:null});tnBadge();if(!$('scrTourney').hidden)tnRender()}catch(e){if(!$('scrTourney').hidden)tnSay(tnErr(e),true)}}
function tnBadge(){const s=tnMySeries(),st=TN.st;$('tnBadge').hidden=!(st&&st.status==='running'&&s&&s.status==='open')}
async function tnOpen(){showScreen('scrTourney');tnSay('');$('tnBody').innerHTML=frSignedIn()?'<p class="tnLead">Loading…</p>':'';tnRender();await tnLoad();tnRender()}
$('goTourney').addEventListener('click',()=>{ensureAudio();tnOpen()});
// ---- the screen ----
function tnRender(){const B=$('tnBody');if(!frSignedIn()){B.innerHTML=`<p class="tnLead">A friends playoff needs an account, so your friends can find you.</p><button class="big" type="button" data-tn="acct">SIGN IN</button>`;return}
 const st=TN.st;
 if(!st){B.innerHTML=`<p class="tnLead">An 8-club bracket you play live with your friends. Invite up to 7; CPU clubs fill the empty spots. Seeds come from ranked ratings. Quarterfinals and semifinals are best of 3, the final best of 5, every game 3 innings. It doesn’t change your rating.</p><button class="big" type="button" data-tn="create">CREATE A PLAYOFF</button>`;return}
 if(st.status==='lobby'){B.innerHTML=tnLobbyHtml(st);return}
 B.innerHTML=tnYouHtml(st)+tnBracketHtml(st)+`<div class="tnFoot">${st.status==='done'?`<button class="mbtn" type="button" data-tn="close">DONE</button>`:`<button class="mbtn" type="button" data-tn="leave">LEAVE PLAYOFF</button>`}</div>`}
function tnLobbyHtml(st){const J=st.players.filter(p=>p.status==='joined'),I=st.players.filter(p=>p.status==='invited');
 const rows=J.map(p=>`<li><b>${esc(p.name)}</b><small>${p.rating} · ${esc(tnClubName(p.club))}</small></li>`).join('')+I.map(p=>`<li class="inv"><b>${esc(p.name)}</b><small>INVITED…</small></li>`).join('')+Array.from({length:Math.max(0,8-J.length-I.length)},()=>'<li class="cpu"><b>CPU</b><small>FILLS IN AT START</small></li>').join('');
 let html=`<p class="tnLead">${st.host?'Invite your friends, then start. Empty spots become CPU clubs.':`Waiting for <b>${esc(st.host_name)}</b> to start the playoff…`}</p><h4>PLAYERS · ${J.length} / 8</h4><ul class="tnSlots">${rows}</ul>`;
 if(st.host){const taken=new Set(st.players.filter(p=>p.status!=='left').map(p=>p.user_id));const fr=(FR.list||[]).filter(f=>f.state==='friend');
  html+=`<h4>INVITE FRIENDS</h4>${fr.length?`<ul class="tnInv">${fr.map(f=>{const[s,l]=frStatus(f.user_id),inv=taken.has(f.user_id);return `<li><i class="frDot ${s}"></i><b>${esc(f.username)}</b><small>${l}</small><button type="button" class="mbtn" data-tninv="${f.user_id}"${inv||J.length>=8?' disabled':''}>${inv?'INVITED':'INVITE'}</button></li>`}).join('')}</ul>`:`<p class="tnLead">Add friends on the Friends page to invite them.</p>`}
   <button class="big" type="button" data-tn="start">START${J.length<8?` · CPU FILLS ${8-J.length}`:''}</button><button class="mbtn tnLeave" type="button" data-tn="leave">CANCEL PLAYOFF</button>`}
 else html+=`<button class="mbtn tnLeave" type="button" data-tn="leave">LEAVE</button>`;
 return html}
function tnSeriesBox(s,st){const me=tnMe(),a=tnP(s.seed_a),b=tnP(s.seed_b),mine=me&&(s.seed_a===me.seed||s.seed_b===me.seed);
 const row=(p,seed,w)=>`<div class="tnTeam${s.winner===seed?' won':s.winner?' lost':''}${p&&p.me?' me':''}"><span class="tnSeed">${seed}</span><span class="tnNm">${tnLabel(p)}</span><b>${w}</b></div>`;
 return `<div class="tnSer${mine?' mine':''}${s.status==='done'?' done':''}">${row(a,s.seed_a,s.wins_a)}${row(b,s.seed_b,s.wins_b)}<small>BEST OF ${s.need*2-1}</small></div>`}
function tnBracketHtml(st){const col=r=>{const ss=st.series.filter(s=>s.round===r),n=[4,2,1][r-1];const boxes=ss.map(s=>tnSeriesBox(s,st)).join('')+Array.from({length:n-ss.length},()=>'<div class="tnSer tbd"><div class="tnTeam"><span class="tnSeed"></span><span class="tnNm">TBD</span></div><div class="tnTeam"><span class="tnSeed"></span><span class="tnNm">TBD</span></div></div>').join('');
  return `<div class="tnCol r${r}"><h4>${TN_ROUND[r]}</h4><div class="tnStack">${boxes}</div></div>`};return `<div class="tnBracket">${col(1)}${col(2)}${col(3)}</div>`}
function tnYouHtml(st){const me=tnMe(),s=tnMySeries();
 if(st.status==='done'){const c=tnP(st.champion);return `<div class="tnYou champ"><small>CHAMPION</small><b>${tnLabel(c)}</b>${c&&c.me?'<p>You won the playoff!</p>':''}</div>`}
 if(!me||me.status==='left')return `<div class="tnYou"><p>You left this playoff. You can still follow the bracket.</p></div>`;
 if(!s)return `<div class="tnYou"><p>Waiting for the bracket…</p></div>`;
 const iA=s.seed_a===me.seed,opp=tnP(iA?s.seed_b:s.seed_a),mw=iA?s.wins_a:s.wins_b,tw=iA?s.wins_b:s.wins_a;
 if(s.status==='done')return `<div class="tnYou"><small>${TN_ROUND[s.round]}</small><p>${s.winner===me.seed?`You beat ${tnLabel(opp)} ${mw}-${tw}. Waiting for the other ${s.round===1?'quarterfinals':'semifinal'} to finish…`:`Out: ${tnLabel(opp)} won ${tw}-${mw}. Follow the rest of the bracket below.`}</p></div>`;
 const g=mw+tw+1,claim=opp&&opp.user_id&&s.idle_secs>480;
 return `<div class="tnYou now"><small>${TN_ROUND[s.round]} · GAME ${g} · BEST OF ${s.need*2-1}</small><p>You <b>${mw}</b> – <b>${tw}</b> ${tnLabel(opp)}${opp&&!opp.user_id?` <span class="tnLv">LEVEL ${opp.bot_level}</span>`:''}</p>
  <button class="big" type="button" data-tn="play">PLAY GAME ${g}</button>${claim?`<button class="mbtn" type="button" data-tn="claim">${esc(opp.name)} DIDN’T SHOW · CLAIM THE SERIES</button>`:''}</div>`}
$('tnBody').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||TN.busy)return;const d=b.dataset,st=TN.st;
 if(d.tn==='acct'){showScreen('scrAcct');return}
 if(d.tn==='close'){TN.st=null;tnRender();mpOpen();return}
 if(d.tn==='play'){tnPlay();return}
 if(d.tn==='leave'&&!b.classList.contains('sure')){b.classList.add('sure');b.textContent=st&&st.status==='running'?'TAP AGAIN: YOUR SERIES IS LOST':'TAP AGAIN TO CONFIRM';return}
 TN.busy=true;tnSay('');try{
  if(d.tn==='create'){await rpc('tourney_create',{p_club:MYTEAM?MYTEAM.club:S.you});track('playoff_create');if(!FR.list.length)await frLoad()}
  else if(d.tninv){await rpc('tourney_invite',{p_tid:st.id,p_user:d.tninv});frSend(d.tninv,'invite',{from:ACC.user.id,kind:'tn'}).catch(()=>{});track('playoff_invite')}
  else if(d.tn==='start'){await rpc('tourney_start',{p_tid:st.id});track('playoff_start',{humans:st.players.filter(p=>p.status==='joined').length})}
  else if(d.tn==='leave'){await rpc('tourney_leave',{p_tid:st.id});track('playoff_leave',{status:st.status});TN.st=null}
  else if(d.tn==='claim'){await rpc('tourney_claim',{p_series:tnMySeries().id})}
  await tnLoad()}catch(err){tnSay(tnErr(err),true)}TN.busy=false;tnRender()});
// ---- playing your game ----
function tnPlay(){const st=TN.st,s=tnMySeries(),me=tnMe();if(!st||!s||s.status!=='open'||!me)return;const iA=s.seed_a===me.seed,opp=tnP(iA?s.seed_b:s.seed_a),g=s.wins_a+s.wins_b+1;
 const tg={sid:s.id,g,iA,tid:st.id,round:s.round};track('playoff_game_start',{round:s.round,game:g,vs:opp.user_id?'friend':'cpu'});
 if(!opp.user_id){/* against a CPU club: an ordinary 3-inning game on this phone, the CPU at its level */
  const lv=opp.bot_level||3;S.tnGame={...tg,bot:true};S.cpuEdge=(lv-3)/7;S.you=MYTEAM?MYTEAM.club:S.you;S.opp=opp.club===S.you?ORDER.find(k=>k!==S.you):opp.club;pendingMode=null;
  startGame('full');botRoster(S.opp,lv);S.totalInn=3;S.schedInn=3;S.oppLine=[0,0,0];S.youLine=[0,0,0];if(ML){ML.mode='playoff_friends';ML.sched=3}
  banner(`${TN_ROUND[s.round]} · GAME ${g}`,`CPU LEVEL ${lv} · ${TEAMS[S.opp].name} at ${TEAMS[S.you].name} · 3 innings`);updateHUD();return}
 /* against a friend: the series' own custom room (the higher seed hosts and is home) */
 openOnline('custom');joinRoom(s.code,iA?'host':'guest').then(()=>{const o=S.online;if(!o||o.code!==s.code)return;o.tn=tg;
  const n=$('olNote');if(n){n.textContent=`${TN_ROUND[s.round]} · game ${g} vs ${opp.name}. Pick your clubs, 3 innings, and both press Ready.`;n.style.color='var(--amber)'}})}
async function tnReport(tg,my,their){if(!tg||my===their)return;try{const r=await rpc('tourney_report',{p_series:tg.sid,p_game:tg.g,p_my_runs:my,p_their_runs:their});track('playoff_game_end',{round:tg.round,game:tg.g,won:my>their});TN.lastReport=r}catch(e){tnSay(tnErr(e),true)}
 await tnLoad()}
/* (called by the game-over code) a playoff game ended: report it, and point the results card back at the bracket */
function tnGameOver(){const t=S.tnGame;if(t&&t.bot){S.tnGame=null;S.cpuEdge=0;tnReport(t,S.runs,S.target);$('again').hidden=true;$('toLobby').hidden=false;$('toLobby').textContent='BACK TO THE PLAYOFF';return true}
 const o=S.online;if(o&&o.tn&&!o.tnDone){o.tnDone=true;const home=o.me==='home',my=home?S.runs:S.target,their=home?S.target:S.runs;tnReport(o.tn,my,their);$('toLobby').textContent='BACK TO THE PLAYOFF';return true}
 return false}
function tnBackFromGame(){const o=S.online;if(o&&o.tn){if(o.nr)try{o.nr.leave()}catch(e){}S.online=null}tnOpen()}
// leaving a CPU playoff game early (main menu / quit) counts as a loss in that game
function tnLeaveGame(){const t=S.tnGame;if(!t)return;S.tnGame=null;S.cpuEdge=0;if(S.phase!=='over')tnReport(t,0,1)}
// ---- invites to a playoff ----
async function tnInbox(){if(!frSignedIn()||FR.inv||TN.inv||frBusy())return;try{const r=await rpc('tourney_inbox');const p=(Array.isArray(r)?r:[]).find(x=>!TN.seen[x.tid]);if(!p)return;TN.seen[p.tid]=1;TN.inv=p;
 $('frInvTxt').innerHTML=`<b>${esc(p.host_name)}</b> invited you to a friends playoff (${p.players}/8 in)`;$('frInvite').hidden=false;$('frInvite').dataset.kind='tn';try{sfx('pop')}catch(e){}}catch(e){}}
$('frInvGo').addEventListener('click',async e=>{const p=TN.inv;if(!p||$('frInvite').dataset.kind!=='tn')return;e.stopImmediatePropagation();TN.inv=null;$('frInvite').hidden=true;$('frInvite').dataset.kind='';
 try{await rpc('tourney_respond',{p_tid:p.tid,p_accept:true,p_club:MYTEAM?MYTEAM.club:S.you});track('playoff_join')}catch(err){tnOpen().then(()=>tnSay(tnErr(err),true));return}tnOpen()},true);
$('frInvNo').addEventListener('click',e=>{const p=TN.inv;if(!p||$('frInvite').dataset.kind!=='tn')return;e.stopImmediatePropagation();TN.inv=null;$('frInvite').hidden=true;$('frInvite').dataset.kind='';rpc('tourney_respond',{p_tid:p.tid,p_accept:false,p_club:null}).catch(()=>{})},true);
// keep the bracket fresh while it's on screen; look for playoff invites (and your turn) on the menus
setInterval(()=>{if(!frSignedIn())return;TN.poll++;const on=!$('scrTourney').hidden&&!$('title').hidden;if(on&&!TN.busy)tnLoad();else if(TN.poll%4===0&&!$('title').hidden){tnInbox();tnLoad()}},3000);
