/* ---------- beta tools (server side: migration 018) ----------
   - Switches: the server can turn a feature off for everyone (ranked, online, friends, shop, cloud saves). The game
     checks them on load and every few minutes, and blocks that feature with the server's message.
   - A log of the last things that happened (screens, events, errors) rides along with bug reports, and errors are
     also written to the server's error log.
   - Gifts: coins and packs an admin sent this account are collected on the next check.
   - Delete account, the admin page, and the one-time beta / what's-new notes. */

/* a one-button note in its own box over everything */
function pdNote(head,html,ok){return new Promise(res=>{const w=document.createElement('div');w.className='devGate';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML=`<div class="dgBox"><h3>${head}</h3>${html}<button type="button" class="big" data-a="1">${ok||'OK'}</button></div>`;
 const done=()=>{w.remove();removeEventListener('keydown',k,true);res()},k=e=>{if(e.key==='Escape'||e.key==='Enter'){e.stopPropagation();e.preventDefault();done()}};
 w.addEventListener('click',e=>{if(e.target.closest('[data-a]')||e.target===w)done()});addEventListener('keydown',k,true);document.body.appendChild(w);w.querySelector('[data-a]').focus()})}

/* ---- switches ---- */
let FLAGS={};try{FLAGS=JSON.parse(localStorage.getItem('pd-flags')||'{}')||{}}catch(e){}
async function flagsLoad(){if(!supaOK())return;try{const f=await rpc('get_flags');if(f&&typeof f==='object'){FLAGS=f;try{localStorage.setItem('pd-flags',JSON.stringify(f))}catch(e){}}}catch(e){/* (migration 018 not run, or offline: keep what we had) */}}
const FLAG_NAMES={ranked:'Ranked',online:'Online play',friends:'Friends',shop:'The shop',cloud:'Cloud saves'};
/* the server's message when a feature is switched off, or null when it's on */
function flagOff(k){const f=FLAGS[k];return f&&f.on===false?(f.msg||`${FLAG_NAMES[k]||'This'} is switched off for a little while. Please try again later.`):null}
function flagBlock(k){const m=flagOff(k);if(!m)return false;pdNote(`${(FLAG_NAMES[k]||'').toUpperCase()} IS OFF`,`<p>${esc(m)}</p>`);return true}
/* buttons that start a switched-off feature say so instead (checked before their own click handlers run) */
const FLAG_GATES=[['#goRanked','ranked'],['#goCustom','online'],['#olCreate','online'],['#olJoin','online'],['#olRejoin','online'],['#goFriends','friends'],['#fpInvite','friends'],['#frInvGo','friends'],['.shopBuy','shop']];
document.addEventListener('click',e=>{for(const[sel,k]of FLAG_GATES){if(e.target.closest(sel)&&flagOff(k)){e.stopImmediatePropagation();e.preventDefault();flagBlock(k);return}}},true);
setTimeout(flagsLoad,1200);setInterval(flagsLoad,4*60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)flagsLoad()});

/* ---- the recent-events log, and errors to the server ---- */
const BLOG=[],BERR=[];
function blog(kind,what){BLOG.push([Math.round(performance.now()/100)/10,kind,String(what).slice(0,120)]);if(BLOG.length>60)BLOG.shift()}
{const t0=track;track=function(n,p){blog('ev',n+(p&&p.screen?' '+p.screen:''));return t0.apply(this,arguments)}}
const ERR_SENT=new Set();
function bErr(where,e){const msg=(String(where)+': '+String((e&&e.message)||e||'?')).slice(0,400),stack=String((e&&e.stack)||'').slice(0,2000);
 BERR.push({t:Math.round(performance.now()/100)/10,msg,stack:stack.slice(0,600)});if(BERR.length>10)BERR.shift();blog('err',msg);
 if(ERR_SENT.has(msg)||ERR_SENT.size>=15||!supaOK())return;ERR_SENT.add(msg);
 supaClient().then(c=>c.from('client_errors').insert({version:PD_VER,message:msg,stack:stack||null,device:fbDevice()})).catch(()=>{})}
addEventListener('error',ev=>{if(ev.error||ev.message)bErr('window',ev.error||ev.message)});
addEventListener('unhandledrejection',ev=>bErr('promise',ev.reason));
{const p0=phError;phError=function(where,e){bErr(where,e);return p0.apply(this,arguments)}}

/* ---- bug reports: a screenshot of the game, taken when the page opens (before it covers the game) ---- */
let FB_SHOT=null;
function fbGrab(){FB_SHOT=null;try{const cv=$('cv');if(!cv||!cv.width||S.phase==='title'||!$('title').hidden)return;
  const w=Math.min(560,cv.width),h=Math.round(cv.height*w/cv.width),o=document.createElement('canvas');o.width=w;o.height=h;const g=o.getContext('2d');g.drawImage(cv,0,0,w,h);
  for(const q of[.62,.45,.3]){const u=o.toDataURL('image/jpeg',q);if(u.length<380000){FB_SHOT=u;break}}}catch(e){FB_SHOT=null}
 $('fbShotRow').hidden=!FB_SHOT;$('fbShot').checked=!!FB_SHOT;if(FB_SHOT)$('fbShotImg').src=FB_SHOT}
{const o0=fbOpen;fbOpen=function(from){fbGrab();return o0.apply(this,arguments)}}
/* what the report carries besides the message (fbSend in 23h-feedback.js adds these) */
function fbExtra(){return{log:BLOG.slice(-40),errors:BERR.slice(-8)}}
function fbShotSel(){return $('fbShot').checked&&FB_SHOT?FB_SHOT:null}

/* ---- gifts from an admin: collected while signed in on the device holding the account ---- */
let GIFT_BUSY=false;
async function giftCheck(){if(GIFT_BUSY||!ACC.user||!supaOK()||DV.lock||document.hidden)return;GIFT_BUSY=true;let g;try{g=await rpc('claim_gifts')}catch(e){return}finally{GIFT_BUSY=false}
 if(!Array.isArray(g)||!g.length)return;let coins=0,packs=0;const notes=[];
 for(const x of g){coins+=Math.max(0,x.coins|0);packs+=Math.max(0,x.packs|0);if(x.note)notes.push(x.note)}
 if(coins){WAL.coins+=coins;saveWal();coinUI()}if(packs){COL.packs+=packs;saveCol();updatePackBadge()}
 try{accDirty()}catch(e){}track('gift_claimed',{coins,packs});
 const parts=[];if(coins)parts.push(`<b>+${coinFmt(coins)}</b> coins`);if(packs)parts.push(`<b>+${packs}</b> pack${packs>1?'s':''}`);
 pdNote('A GIFT FOR YOU',`<p>${parts.join(' and ')} from Pocket Diamond.</p>${notes.length?`<p>“${notes.map(esc).join('” · “')}”</p>`:''}`,'THANKS!')}
setTimeout(giftCheck,9000);setInterval(giftCheck,90000);

/* ---- delete account ---- */
$('acDelete').addEventListener('click',async()=>{if(!ACC.user)return;
 if(!await pdConfirm('DELETE ACCOUNT?','This deletes your account and everything saved with it in the cloud: cards, lineup, coins, ranked rating, friends and username. <b>It can’t be undone.</b>','DELETE','CANCEL'))return;
 if(!await pdConfirm('ARE YOU SURE?',`Delete <b>${esc(ACC.name||ACC.user.email)}</b> for good?<br>The progress on this device stays here, as a guest.`,'YES, DELETE IT','NO'))return;
 const b=$('acDelete');b.disabled=true;ACC.msg='Deleting your account…';acRender();
 try{await rpc('delete_my_account')}catch(e){b.disabled=false;ACC.msg=/function|schema/.test(e.message||'')?'Deleting accounts isn’t set up on the server yet.':'Could not delete the account. Check your connection and try again.';acRender();return}
 track('account_deleted');clearTimeout(ACC.pushT);try{const c=await supaClient();await c.auth.signOut()}catch(e){}
 try{accSetMeta({})}catch(e){}ACC.user=null;ACC.name='';ACC.pick=false;ACC.msg='Your account was deleted. Your progress stays on this device as a guest.';DV.state='?';DV.lock=false;DV.uid=null;b.disabled=false;acRender()});

/* ---- the admin page (only for accounts in the server's admins list) ---- */
const AD={tab:'coins',is:false,pl:null,seq:0};
/* every admin call gives up after 15s with a visible message, so the page never just sits blank */
const adRpc=(fn,a)=>Promise.race([rpc(fn,a),new Promise((_,j)=>setTimeout(()=>j(new Error('The server did not answer. Check your connection and try again.')),15000))]);
async function adCheck(){const was=AD.is;AD.is=false;if(ACC.user&&supaOK())try{AD.is=!!(await rpc('pd_is_admin'))}catch(e){}$('acAdmin').hidden=!AD.is;if(was&&!AD.is&&!$('scrAdmin').hidden)showScreen('scrAcct')}
setInterval(()=>{const u=ACC.user&&ACC.user.id;if(u!==AD.uid){AD.uid=u;adCheck()}},2000);
$('acAdmin').addEventListener('click',()=>{showScreen('scrAdmin');adTabSync();adRender()});
function adTabSync(){for(const x of $('adTabs').children)x.setAttribute('aria-pressed',String(x.dataset.t===AD.tab))}
$('adTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;AD.tab=b.dataset.t;for(const x of $('adTabs').children)x.setAttribute('aria-pressed',String(x===b));adRender()});
const adWhen=t=>t?new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'—';
const adSum=s=>s?`${coinFmt(s.coins||0)} coins · ${s.packs||0} packs · ${s.cards||0} cards${s.club?' · '+esc(s.club):''}`:'—';
async function adRender(){const B=$('adBody'),M=$('adMsg'),my=++AD.seq;M.textContent='Loading…';B.innerHTML='';
 /* a slower answer from a tab you already left must not paint over the tab you're on */
 const rpc=async(fn,a)=>{const r=await adRpc(fn,a);if(my!==AD.seq)throw{stale:1};return r};
 try{
  if(AD.tab==='fb'){const r=await rpc('admin_feedback',{p_status:null,p_limit:60});
   B.innerHTML=r.length?r.map(f=>`<div class="adRow"><div class="adHd"><b class="adK ${f.kind}">${f.kind.toUpperCase()}</b> ${esc(f.username||'guest')} · ${adWhen(f.created_at)} · v${esc(f.version||'?')}
     <select data-fb="${f.id}">${['new','seen','fixed','wontfix'].map(s=>`<option${s===f.status?' selected':''}>${s}</option>`).join('')}</select></div>
     <p class="adTxt">${esc(f.message)}</p>${f.contact?`<p class="adSm">contact: ${esc(f.contact)}</p>`:''}
     ${f.shot?`<img class="adShot" src="${f.shot}" alt="screenshot">`:''}
     <details><summary>device &amp; log</summary><pre>${esc(JSON.stringify({device:f.device,extra:f.extra},null,1))}</pre></details></div>`).join(''):'<p class="adSm">No feedback yet.</p>';M.textContent=''}
  else if(AD.tab==='err'){const r=await rpc('admin_errors',{p_limit:150});
   B.innerHTML=r.length?r.map(e=>`<div class="adRow"><div class="adHd">${adWhen(e.created_at)} · v${esc(e.version||'?')} · ${esc(e.username||'guest')}</div><p class="adTxt">${esc(e.message)}</p>
     <details><summary>stack &amp; device</summary><pre>${esc((e.stack||'')+'\n'+JSON.stringify(e.device||{},null,1))}</pre></details></div>`).join(''):'<p class="adSm">No errors logged.</p>';M.textContent=''}
  else if(AD.tab==='coins'){/* the quick way: a username and an amount */
   B.innerHTML=`<div class="adRow"><p class="adSm">Add coins (and packs) to any account. They arrive within a couple of minutes while that player is in the game, with a "gift for you" note.</p>
    <div class="adGift"><input class="acIn" id="adCUser" placeholder="USERNAME" spellcheck="false" autocomplete="off"><input class="acIn" id="adCAmt" type="number" min="1" max="1000000" placeholder="COINS"><input class="acIn" id="adCPacks" type="number" min="0" max="100" placeholder="PACKS"><input class="acIn" id="adCNote" maxlength="120" placeholder="NOTE (OPTIONAL)"><button class="mbtn" id="adCGo" type="button">ADD COINS</button></div>
    <div class="adQuick">${[100,500,1000,5000].map(n=>`<button class="mbtn" type="button" data-amt="${n}">+${coinFmt(n)}</button>`).join('')}</div></div>`;
   for(const i of B.querySelectorAll('input'))i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('adCGo').click()});M.textContent=''}
  else if(AD.tab==='pl'){B.innerHTML=`<div class="adFind"><input class="acIn" id="adName" placeholder="USERNAME" spellcheck="false" autocomplete="off" value="${esc(AD.q||'')}"><button class="mbtn" id="adGo" type="button">FIND</button></div><div id="adPl"></div>`;
   $('adName').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('adGo').click()});$('adGo').addEventListener('click',()=>{AD.q=$('adName').value.trim();adPlayer()});M.textContent='';if(AD.q)adPlayer()}
  else{const f=await rpc('get_flags');
   B.innerHTML=Object.keys(FLAG_NAMES).map(k=>{const v=f[k]||{on:true};return `<div class="adRow adFlag"><b>${FLAG_NAMES[k]}</b><input class="acIn" data-msg="${k}" maxlength="200" placeholder="message when off (optional)" value="${esc(v.msg||'')}">
     <button class="mbtn ${v.on?'':'adOff'}" data-flag="${k}" data-on="${v.on?1:0}" type="button">${v.on?'ON':'OFF'}</button></div>`}).join('')+'<p class="adSm">Turning one OFF blocks it for every player within a few minutes, with your message.</p>';
   for(const i of B.querySelectorAll('input'))i.addEventListener('keydown',e=>e.stopPropagation());M.textContent=''}}

 catch(e){if(e&&e.stale)return;try{bErr('admin '+AD.tab,e)}catch(_){}M.textContent=/Admins only/.test(e.message||'')?'This account is not an admin.':/function|schema/.test(e.message||'')?'Run migration 018 on the server first.':'Could not load: '+(e.message||e)}}
async function adPlayer(){const P=$('adPl'),M=$('adMsg');if(!AD.q){P.innerHTML='';return}M.textContent='Looking…';
 try{const r=await adRpc('admin_player',{p_username:AD.q});AD.pl=r;M.textContent='';if(!r){P.innerHTML='<p class="adSm">No player with that username.</p>';return}
  P.innerHTML=`<div class="adRow"><div class="adHd"><b>${esc(r.username)}</b></div><p class="adSm">Cloud save now: ${r.save?`${adSum(r.save.sum)} · saved ${adWhen(r.save.at)}`:'none'}</p>
   <div class="adGift"><input class="acIn" id="adCoins" type="number" min="0" max="1000000" placeholder="COINS"><input class="acIn" id="adPacks" type="number" min="0" max="100" placeholder="PACKS"><input class="acIn" id="adNote" maxlength="120" placeholder="NOTE (OPTIONAL)"><button class="mbtn" id="adSend" type="button">SEND GIFT</button></div>
   ${r.gifts.length?`<p class="adSm">Gifts: ${r.gifts.map(g=>`${g.coins?g.coins+' coins ':''}${g.packs?g.packs+' packs ':''}(${g.claimed?'collected':'waiting'})`).join(' · ')}</p>`:''}</div>
   <h5 class="adH5">EARLIER SAVES</h5>${r.history.length?r.history.map(h=>`<div class="adRow adHist"><span>${adWhen(h.saved_at||h.kept_at)}</span><span>${adSum(h.sum)}</span><button class="mbtn" data-restore="${h.id}" type="button">PUT BACK</button></div>`).join(''):'<p class="adSm">No earlier copies yet (one is kept each time the save changes, at most every 20 minutes).</p>'}`;
  for(const i of P.querySelectorAll('input'))i.addEventListener('keydown',e=>e.stopPropagation())}
 catch(e){M.textContent='Could not load: '+(e.message||e)}}
$('adBody').addEventListener('change',async e=>{const s=e.target.closest('[data-fb]');if(!s)return;try{await rpc('admin_feedback_set',{p_id:+s.dataset.fb,p_status:s.value});$('adMsg').textContent='Saved.'}catch(er){$('adMsg').textContent='Could not save: '+er.message}});
$('adBody').addEventListener('click',async e=>{const M=$('adMsg');
 const fl=e.target.closest('[data-flag]');if(fl){const k=fl.dataset.flag,on=fl.dataset.on!=='1',msg=$('adBody').querySelector(`[data-msg="${k}"]`).value;
  if(!on&&!await pdConfirm(`TURN ${FLAG_NAMES[k].toUpperCase()} OFF?`,'Every player is blocked from it within a few minutes, until you turn it back on.','TURN OFF','CANCEL'))return;
  try{await rpc('admin_set_flag',{p_key:k,p_on:on,p_msg:msg||null});await flagsLoad();adRender()}catch(er){M.textContent='Could not change it: '+er.message}return}
 const qa=e.target.closest('[data-amt]');if(qa){$('adCAmt').value=qa.dataset.amt;return}
 if(e.target.closest('#adCGo')){const u=$('adCUser').value.trim(),c=+$('adCAmt').value||0,p=+$('adCPacks').value||0,n=$('adCNote').value;
  if(!u){M.textContent='Enter a username.';return}if(c<=0&&p<=0){M.textContent='Enter an amount.';return}
  M.textContent='Looking them up…';let pl;try{pl=await adRpc('admin_player',{p_username:u})}catch(er){M.textContent='Could not look them up: '+er.message;return}
  if(!pl){M.textContent=`No player called “${u}”.`;return}
  if(!await pdConfirm('ADD COINS?',`${c?`<b>${coinFmt(c)}</b> coins `:''}${p?`<b>${p}</b> pack${p>1?'s':''} `:''}to <b>${esc(pl.username)}</b>?`,'ADD','CANCEL'))return;
  M.textContent='Sending…';try{await adRpc('admin_gift',{p_user:pl.user_id,p_coins:c,p_packs:p,p_note:n||null});M.textContent=`Sent to ${pl.username}. They get it within a couple of minutes while playing.`;$('adCAmt').value='';$('adCPacks').value=''}
  catch(er){M.textContent='Could not send: '+er.message}return}
 if(e.target.closest('#adSend')&&AD.pl){const c=+$('adCoins').value||0,p=+$('adPacks').value||0,n=$('adNote').value;if(c<=0&&p<=0){M.textContent='Enter coins or packs.';return}
  if(!await pdConfirm('SEND GIFT?',`${c?c+' coins ':''}${p?p+' packs ':''}to <b>${esc(AD.pl.username)}</b>. They get it the next time their game checks in (within a couple of minutes while they play).`,'SEND','CANCEL'))return;
  try{await adRpc('admin_gift',{p_user:AD.pl.user_id,p_coins:c,p_packs:p,p_note:n||null});M.textContent='Gift sent.';adPlayer()}catch(er){M.textContent='Could not send: '+er.message}return}
 const rs=e.target.closest('[data-restore]');if(rs&&AD.pl){
  if(!await pdConfirm('PUT THIS SAVE BACK?',`<b>${esc(AD.pl.username)}</b>’s cloud save becomes this earlier copy. (Their current save is kept in the list first, so you can undo it.) Their game loads it the next time it opens or syncs; tell them to reload.`,'PUT BACK','CANCEL'))return;
  try{await rpc('admin_restore_save',{p_user:AD.pl.user_id,p_history:+rs.dataset.restore});M.textContent='Done. Ask them to reload the game.';adPlayer()}catch(er){M.textContent='Could not restore: '+er.message}}});

/* ---- the beta note (first time) and what's new (after an update) ---- */
const WN_ID='2026-11-17',WN_ITEMS=[
 'All-new card art: every player in his club’s colors, with the club’s mark on his cap',
 'Legendary cards shimmer with a moving pastel background',
 'Edit Lineup: a five-man rotation, closers, player stats, and a SIDE ARM tag',
 'Change clubs instantly, no reload',
 'Gwangju Cats now wear maroon and gold; Daegu Kings got blue caps',
 'A reshaped infield, and a bigger pitch map on PC',
 'Bug reports can now include a screenshot'];
function bnSeen(k){try{return localStorage.getItem(k)}catch(e){return'1'}}
function bnSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
async function bnShow(){if(typeof window.claude!=='undefined')return;
 const beta=!bnSeen('pd-beta'),wn=bnSeen('pd-wn')!==WN_ID&&bnSeen('pd-wn')!=='*'/* (the tests set *) */,vet=['pd-cards','pd-wallet','pd-myteam','pd-history'].some(k=>bnSeen(k));
 if(!beta&&!wn)return;
 /* wait for the menus: never over a game, a pack opening or the privacy note */
 if($('title').hidden||S.phase&&S.phase!=='title'||$('scrMain').hidden||!$('privBar').hidden||document.querySelector('.devGate:not([hidden])')){setTimeout(bnShow,2500);return}
 bnSet('pd-beta','1');bnSet('pd-wn',WN_ID);
 const news=wn&&vet?`${beta?'<h4 class="bnH">NEW IN THIS UPDATE</h4>':''}<ul class="bnList">${WN_ITEMS.map(t=>`<li>${t}</li>`).join('')}</ul>`:'';
 const note=beta?`<p>Thanks for testing! Pocket Diamond is in <b>beta</b>: things may break, and progress may be reset when the full game launches.</p><p>Found a bug? Tap <b>FEEDBACK</b> on the main menu, or <b>Report a bug</b> in the pause menu.</p>`:'';
 track(beta?'beta_note_shown':'whats_new_shown',{id:WN_ID});
 await pdNote(beta?'WELCOME TO THE BETA':'WHAT’S NEW',note+news,beta?'LET’S PLAY':'GOT IT')}
setTimeout(bnShow,3500);
