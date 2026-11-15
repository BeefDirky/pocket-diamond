// ---------- friends: add players by username, see who's online, invite a friend straight into a custom game ----------
// The list lives on the server (migration 011: friend_request / friend_respond / friend_remove / friends_list).
// Online status comes from the 'pd-live' presence channel (signed-in players say their id there). An invite is a
// row on the server with a fresh custom room code (see frInvite below); joining puts both phones in that room.
const FR={list:[],at:0,busy:false,ch:null,chFor:null,inv:null,invT:0};
const frSignedIn=()=>!!(typeof ACC!=='undefined'&&ACC.user&&supaOK());
const frErr=e=>{const m=(e&&e.message)||'';return/friends_list|friend_request|function .* does not exist|schema cache/i.test(m)?'Friends aren’t set up on the server yet.':m||'Could not reach the server.'};
function frSay(t,bad){const m=$('frMsg');m.textContent=t||'';m.classList.toggle('bad',!!bad)}
async function frLoad(){if(!frSignedIn())return;try{const r=await rpc('friends_list');FR.list=Array.isArray(r)?r:[];FR.at=Date.now();frBadge();if(!$('scrFriends').hidden)frRender()}
 catch(e){if(!$('scrFriends').hidden)frSay(frErr(e),true)}}
function frBadge(){const n=FR.list.filter(f=>f.state==='incoming').length,b=$('frBadge');b.hidden=!n;b.textContent=n}
function frStatus(id){const s=LIVE.who&&LIVE.who[id];return s==='g'?['g','IN A GAME']:s==='q'?['q','IN RANKED QUEUE']:s?['m','ONLINE']:['off','OFFLINE']}
function frLive(){if(!$('scrFriends').hidden&&!$('title').hidden)frRender()}
function frRow(f){const id=f.user_id,nm=esc(f.username);
 if(f.state==='incoming')return `<li class="frRow"><div class="frWho"><b>${nm}</b><small>WANTS TO BE FRIENDS · ${f.rating}</small></div><div class="frActs"><button type="button" class="big" data-acc="${id}">ACCEPT</button><button type="button" class="mbtn" data-dec="${id}" aria-label="Decline">✕</button></div></li>`;
 if(f.state==='outgoing')return `<li class="frRow"><div class="frWho"><b>${nm}</b><small>REQUEST SENT</small></div><div class="frActs"><button type="button" class="mbtn" data-rm="${id}">CANCEL</button></div></li>`;
 const[st,lab]=frStatus(id),open=FR.open===id;
 return `<li class="frRow${open?' open':''}"><button type="button" class="frWho" data-open="${id}"><i class="frDot ${st}"></i><b>${nm}</b><small>${lab} · ${f.rating}</small></button>
  <div class="frActs"><button type="button" class="big" data-inv="${id}"${st==='off'||st==='g'?' disabled':''}>INVITE</button></div>
  ${open?`<div class="frMore"><button type="button" class="mbtn" data-prof="${id}">PROFILE</button><button type="button" class="mbtn" data-rm="${id}">REMOVE FRIEND</button></div>`:''}</li>`}
function frRender(){const on=frSignedIn();$('frOut').hidden=on;$('frIn').hidden=!on;if(!on)return;
 const inc=FR.list.filter(f=>f.state==='incoming'),fr=FR.list.filter(f=>f.state==='friend'),out=FR.list.filter(f=>f.state==='outgoing');
 const rank=f=>({g:1,q:1,m:0,off:2})[frStatus(f.user_id)[0]];fr.sort((a,b)=>rank(a)-rank(b)||a.username.localeCompare(b.username));
 const sec=(t,a)=>a.length?`<h4>${t}</h4><ul>${a.map(frRow).join('')}</ul>`:'';
 $('frList').innerHTML=sec(`REQUESTS · ${inc.length}`,inc)+sec(`FRIENDS · ${fr.length}`,fr)+sec('SENT',out)+(FR.list.length?'':`<p class="frEmpty">No friends yet. Add someone by their username, or open a profile on the leaderboard.</p>`)}
async function frOpen(){showScreen('scrFriends');frSay('');frRender();await frLoad();frRender()}
$('goFriends').addEventListener('click',frOpen);
$('frToAcct').addEventListener('click',()=>showScreen('scrAcct'));
async function frAdd(name){name=(name||'').trim();if(!name){frSay('Type a username.',true);return}if(FR.busy)return;FR.busy=true;frSay('Sending…');
 try{const r=await rpc('friend_request',{p_username:name});frSay(r.status==='accepted'?`You and ${name} are friends now.`:r.status==='already'?`You're already friends with ${name}.`:`Request sent to ${name}.`);$('frName').value='';track('friend_request',{result:r.status});await frLoad()}
 catch(e){frSay(frErr(e),true)}FR.busy=false}
$('frSend').addEventListener('click',()=>frAdd($('frName').value));
$('frName').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')frAdd($('frName').value)});
$('frList').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||FR.busy)return;const d=b.dataset;
 if(d.open){FR.open=FR.open===d.open?null:d.open;frRender();return}
 if(d.prof){lbOpen();lbProfile(d.prof);return}
 if(d.inv){frInvite(d.inv);return}
 FR.busy=true;try{
  if(d.acc){await rpc('friend_respond',{p_other:d.acc,p_accept:true});frSay('Friend added.');track('friend_accept')}
  else if(d.dec)await rpc('friend_respond',{p_other:d.dec,p_accept:false});
  else if(d.rm){const f=FR.list.find(x=>x.user_id===d.rm);if(f&&f.state==='friend'&&!b.classList.contains('sure')){b.classList.add('sure');b.textContent='TAP AGAIN TO REMOVE';FR.busy=false;return}
   await rpc('friend_remove',{p_other:d.rm});FR.open=null}
  await frLoad()}catch(err){frSay(frErr(err),true)}FR.busy=false});
// ---- invites ----
async function frChannel(){const u=frSignedIn()&&ACC.user.id;if(FR.chFor===u)return;FR.chFor=u;
 const c=await supaClient();if(FR.ch){try{c.removeChannel(FR.ch)}catch(e){}FR.ch=null}if(!u)return;
 const ch=c.channel('pd-u-'+u);ch.on('broadcast',{event:'invite'},m=>frGotInvite(m.payload||{}));ch.on('broadcast',{event:'reply'},m=>frGotReply(m.payload||{}));ch.subscribe(()=>{});FR.ch=ch;frLoad()}
async function frSend(to,event,payload){const c=await supaClient(),ch=c.channel('pd-u-'+to);
 await new Promise(res=>{const t=setTimeout(res,4000);ch.subscribe(s=>{if(s==='SUBSCRIBED'){ch.send({type:'broadcast',event,payload}).finally(()=>{clearTimeout(t);res()})}})});
 setTimeout(()=>{try{c.removeChannel(ch)}catch(e){}},500)}
// An invite is a row on the server (migration 013), so it can't be missed: the friend's game checks its inbox every few
// seconds on the menus and also gets a live nudge to check at once. The sender's game polls the invite's status.
async function frInvite(id){const f=FR.list.find(x=>x.user_id===id&&x.state==='friend');if(!f)return;
 const L='abcdefghjkmnpqrstuvwxyz';let code='';for(let i=0;i<4;i++)code+=L[Math.floor(Math.random()*L.length)];
 frSay(`Inviting ${f.username}…`);let iid;try{iid=await rpc('friend_invite',{p_to:id,p_code:code})}catch(e){frSay(frErr(e),true);return}
 frSend(id,'invite',{from:ACC.user.id,id:iid}).catch(()=>{});
 track('friend_invite');openOnline('custom');joinRoom(code,'host');FR.sent={id:iid,code,name:f.username,st:'open'};
 setTimeout(()=>frSentNote(`Invite sent to ${f.username}. Waiting for them to join…`),900)}
function frSentNote(t){const n=$('olNote'),o=S.online;if(n&&FR.sent&&o&&o.code===FR.sent.code&&!o.opp){n.textContent=t;n.style.color='var(--amber)'}}
async function frSentPoll(){const sd=FR.sent;if(!sd)return;const o=S.online;
 if(!o||o.code!==sd.code||o.opp){if(!o||o.code!==sd.code)rpc('friend_invite_answer',{p_id:sd.id,p_answer:'cancelled'}).catch(()=>{});FR.sent=null;return}
 try{const st=await rpc('friend_invite_status',{p_id:sd.id});if(st&&st!==sd.st){sd.st=st;
  if(st==='declined')frSentNote(`${sd.name} can’t play right now.`);else if(st==='expired')frSentNote(`${sd.name} didn’t answer.`);else if(st==='joined')frSentNote(`${sd.name} is joining…`)}}catch(e){}}
function frBusy(){return $('title').hidden||onlineGame()||Q.on||!!(S.online&&S.online.inGame)}
async function frInbox(){if(!frSignedIn()||FR.inv||(typeof TN!=='undefined'&&TN.inv)||frBusy()||FR.inboxBusy)return;FR.inboxBusy=true;
 try{const r=await rpc('friend_invites_inbox');const list=Array.isArray(r)?r:[];FR.seen=FR.seen||{};
  const p=list.find(x=>!FR.seen[x.id]&&!(FR.sent&&FR.sent.code===x.code));if(p)frShowInvite(p)}catch(e){}FR.inboxBusy=false}
function frGotInvite(p){if(p&&p.kind==='tn'&&typeof tnInbox==='function'){tnInbox();return}frInbox()}/* (the live message only says "check your inbox now") */
function frShowInvite(p){FR.seen[p.id]=1;FR.inv=p;$('frInvite').dataset.kind='';$('frInvTxt').innerHTML=`<b>${esc(p.username)}</b> invited you to a game`;$('frInvite').hidden=false;try{sfx('pop')}catch(e){}
 clearTimeout(FR.invT);FR.invT=setTimeout(()=>frInvClose(false),60000)}
function frInvClose(reply){const p=FR.inv;$('frInvite').hidden=true;clearTimeout(FR.invT);FR.inv=null;if(p&&reply)rpc('friend_invite_answer',{p_id:p.id,p_answer:'declined'}).catch(()=>{})}
$('frInvNo').addEventListener('click',()=>frInvClose(true));
$('frInvGo').addEventListener('click',()=>{const p=FR.inv;frInvClose(false);if(!p)return;ensureAudio();track('friend_invite_join');rpc('friend_invite_answer',{p_id:p.id,p_answer:'joined'}).catch(()=>{});
 if(S.online&&S.online.nr&&!S.online.inGame){try{S.online.nr.leave()}catch(e){}S.online=null}openOnline('custom');joinRoom(p.code,'guest')});
function frGotReply(){}
// keep the invite channel and the list in step with sign-in; refresh the list now and then while on the menus
setInterval(()=>{frChannel().catch(()=>{});if(frSignedIn()&&!$('title').hidden&&Date.now()-FR.at>60000)frLoad();FR.tick=(FR.tick||0)+1;if(FR.tick%2===0){frInbox();frSentPoll()}},3000);
// "+ ADD FRIEND" on a leaderboard profile
$('lbpCard').addEventListener('click',async e=>{const b=e.target.closest('[data-add]');if(!b)return;b.disabled=true;b.textContent='SENDING…';
 try{const r=await rpc('friend_request',{p_username:b.dataset.add});b.textContent=r.status==='accepted'?'FRIENDS':'REQUEST SENT';track('friend_request',{result:r.status,from:'profile'});frLoad()}catch(err){b.textContent=frErr(err);b.disabled=false}});
