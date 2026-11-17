// ---------- feedback / bug reports, and "a new version is available" ----------
// FEEDBACK on the main menu and "Report a bug" in the pause menu open one page. It goes to the server's feedback table
// (migration 009: anyone can send, nobody can read it back from the game) and, as a backup, to the stats service.
let fbFrom='scrMain',fbKindV='bug';
function fbOpen(from){fbFrom=from||'scrMain';$('fbBack').dataset.go=fbFrom;$('fbMsg').textContent='';$('fbSend').disabled=false;showScreen('scrFb');setTimeout(()=>$('fbText').focus(),60)}
$('goFb').addEventListener('click',()=>fbOpen('scrMain'));
$('pFb').addEventListener('click',()=>fbOpen('scrPause'));
for(const b of $('fbKind').children)b.addEventListener('click',()=>{fbKindV=b.dataset.v;for(const c of $('fbKind').children)c.setAttribute('aria-pressed',String(c===b))});
for(const id of['fbText','fbContact'])$(id).addEventListener('keydown',e=>e.stopPropagation());// (typing never reaches the game's keys)
function fbDevice(){const o=S.online;return{ua:navigator.userAgent.slice(0,300),screen:`${innerWidth}x${innerHeight}@${devicePixelRatio||1}`,layout:document.querySelector('.app.deskApp')?'pc':'phone',
 standalone:!!(matchMedia&&matchMedia('(display-mode: standalone)').matches),lang:navigator.language,mode:S.mode||null,phase:S.phase||null,inning:S.phase&&S.phase!=='title'?`${S.half||''} ${S.inning||''}`.trim():null,
 online:!!(o&&o.inGame),ranked:!!((o&&o.ranked)||S.rkBot),club:S.you||null,auto:!!(S.auto||S.olAuto)}}
$('fbSend').addEventListener('click',async()=>{const msg=$('fbText').value.trim(),contact=$('fbContact').value.trim()||null;
 if(msg.length<3){$('fbMsg').textContent='Write a few words first.';return}
 $('fbSend').disabled=true;$('fbMsg').textContent='Sending…';const dev=fbDevice();
 track('feedback_sent',{kind:fbKindV,message:msg.slice(0,2000),contact,...dev});
 let ok=false,why='';
 if(supaOK())try{const c=await supaClient(),row={kind:fbKindV,message:msg.slice(0,2000),contact,username:ACC.name||null,version:PD_VER,device:dev};
   /* the recent-events log and the optional screenshot (23q-beta.js); if the server doesn't take them yet (migration 018), send the message alone */
   let {error}=await c.from('feedback').insert({...row,extra:fbExtra(),shot:fbShotSel()});
   if(error&&/extra|shot|column/i.test(error.message||''))({error}=await c.from('feedback').insert(row));if(error)throw error;ok=true}catch(e){why=String(e&&e.message||e)}
 if(ok||phOn()){$('fbMsg').textContent='Thanks! Sent.';$('fbText').value='';setTimeout(()=>{if(!$('scrFb').hidden)$('fbBack').click()},1400)}
 else{$('fbSend').disabled=false;$('fbMsg').textContent=/many messages/i.test(why)?why:'Couldn\'t send it right now. Check your connection and try again.'}});
// ---- a new version: compare this build with the one the site serves now (version.json, never cached) ----
const UPD={seen:null,shownFor:null};
async function updCheck(){if(typeof window.claude!=='undefined'||!/^https?:/.test(location.protocol))return;
 try{const r=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;const v=(await r.json()).v,mine=String(PD_VER).split('+').pop();/* (PD_VER is <version>+<build>) */if(v&&v!==mine){UPD.seen=v;updShow()}}catch(e){}}
// only where it can't interrupt anything: the menus and the results card, never mid-game
function updShow(){if(!UPD.seen)return;const busy=S.phase&&S.phase!=='title'&&S.phase!=='over'&&$('over').hidden;$('upd').hidden=busy}
$('updGo').addEventListener('click',async()=>{$('updGo').disabled=true;$('updGo').textContent='LOADING…';track('update_refresh',{from:PD_VER,to:UPD.seen});
 try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(e){}
 location.reload()});
setTimeout(updCheck,8000);setInterval(updCheck,5*60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updCheck()});
setInterval(updShow,1500);
