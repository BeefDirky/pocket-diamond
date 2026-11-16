/* ---------- one device at a time on an account (server side: migration 015) ----------
   Every copy of the game has its own device id: "<browser id>.<tab id>", so each browser tab counts as its own device.
   A newer tab of the same browser just takes over (the older tab then says the game is open in another tab). While signed in and open, it checks in with the server every 20 s.
   - Opening the game on a second device while the first is still in use asks: "play here instead?". Saying yes takes
     the account over, nudges the first device to save what it has, then brings that latest save over.
   - The first device notices (at once from the nudge, or at its next check-in) and says another device is playing
     now. From then on it stops saving to the account, so the two never overwrite each other. It can take the account
     back ("play here instead") or sign out. Anything it earned before it noticed still gets saved, unless the other
     device has saved in the meantime (then the other device's newer save wins).
   - Mid-game, a single-player game pauses under the message; an online game can't pause, so the message waits for it.
   - Ranked: only the device holding the account can join the queue (the server checks).
   - A device that hasn't been used for 2 minutes is replaced without asking. */
Object.assign(DV,{id:null,state:'?',busy:false,info:null,pend:null,uid:null,at:0});
const devRnd=()=>Math.random().toString(36).slice(2,10);
DV.base=(()=>{let v=localStorage.getItem('pd-dev');if(!v||v.length<8||v.includes('.')){v='d'+devRnd()+Date.now().toString(36);try{RAW_SET('pd-dev',v)}catch(e){}}return v})();
DV.id=(()=>{let t=null;try{t=sessionStorage.getItem('pd-tab')}catch(e){}if(!t){t=devRnd();try{sessionStorage.setItem('pd-tab',t)}catch(e){}}return DV.base+'.'+t})();
const devSameBrowser=d=>typeof d==='string'&&d.split('.')[0]===DV.base;
/* tabs of this browser tell each other at once */
const DV_BC=(()=>{try{const b=new BroadcastChannel('pd-dev');b.onmessage=m=>devNudge(m.data||{});return b}catch(e){return null}})();
function devLabel(){const u=navigator.userAgent||'',touchMac=/Macintosh/.test(u)&&navigator.maxTouchPoints>1;
 const d=/iPhone/.test(u)?'iPhone':/iPad/.test(u)||touchMac?'iPad':/Android/.test(u)?(/Mobile/.test(u)?'Android phone':'Android tablet'):/CrOS/.test(u)?'Chromebook':/Windows/.test(u)?'Windows PC':/Macintosh/.test(u)?'Mac':/Linux/.test(u)?'Linux PC':'another device';
 const b=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/FxiOS|Firefox/.test(u)?'Firefox':/CriOS|Chrome/.test(u)?'Chrome':/Safari/.test(u)?'Safari':'';return b?`${d} · ${b}`:d}
const devAgo=s=>s==null||s<60?'just now':s<3600?`${Math.round(s/60)} min ago`:`${Math.round(s/3600)} h ago`;
/* the box that asks; it covers everything, so nothing behind it can be pressed */
const DG=document.createElement('div');DG.className='devGate';DG.id='devGate';DG.hidden=true;DG.setAttribute('role','dialog');DG.setAttribute('aria-modal','true');
DG.innerHTML='<div class="dgBox"><h3 id="dgHead"></h3><p id="dgTxt"></p><button type="button" class="big" id="dgHere">PLAY HERE</button><button type="button" class="mbtn" id="dgOut">SIGN OUT</button><p class="dgMsg" id="dgMsg"></p></div>';
document.body.appendChild(DG);
function devShow(kind,info){DV.pend=null;const nm=esc((info&&info.label)||'another device'),ago=devAgo(info&&info.ago);
 $('dgHead').innerHTML=kind==='ask'?'ACCOUNT IN USE':kind==='tab'?'OPEN IN ANOTHER TAB':'PLAYING ON ANOTHER DEVICE';$('dgOut').hidden=kind==='tab';/* (signing out here would sign out the other tab too) */
 $('dgTxt').innerHTML=kind==='tab'?'Pocket Diamond is open in another tab of this browser, so this tab has stopped saving.<br>Play here instead?':kind==='ask'?`Your account is being played on <b>${nm}</b> (active ${ago}).<br>Play on this device instead? Your latest progress comes with you.`
  :`<b>${nm}</b> is playing on your account now, so this device has stopped saving.<br>Your progress here was saved up to that point.`;
 $('dgHere').textContent=kind==='away'?'PLAY HERE INSTEAD':'PLAY HERE';$('dgHere').disabled=false;$('dgMsg').textContent='';DG.hidden=false;try{sfx('pop')}catch(e){}}
/* mid-game: a single-player game pauses under the box; an online game can't pause, so the box waits for the menus */
function devGateWhenFree(kind,info){const inGame=$('title').hidden&&S.phase!=='title';
 if(inGame&&(onlineGame()||(S.online&&S.online.inGame))){DV.pend=[kind,info];return}
 if(inGame&&typeof canPause==='function'&&canPause())pauseGame();devShow(kind,info)}
/* this device just lost the account: save what it has (accPush only does so if the other device hasn't saved since) */
function devSaveLast(){if((accMeta().localAt||0)>(accMeta().pushedAt||0)){clearTimeout(ACC.pushT);accPush().catch(()=>{})}}
async function devCheck(){const u=ACC.user;if(!u||!supaOK()||DV.busy||document.hidden)return;
 if(DV.uid!==u.id){DV.uid=u.id;DV.state='?';DV.lock=false;DG.hidden=true;DV.pend=null}
 DV.busy=true;try{const away=DV.state==='away';
  const r=away?await rpc('device_peek',{p_device:DV.id}):await rpc('device_check',{p_device:DV.id,p_label:devLabel(),p_take:false});DV.at=Date.now();
  if(!r||r.mine){if(away)return;DV.state='ok';DV.lock=false;return}
  DV.info=r;if(away)return;const first=DV.state==='?',tab=devSameBrowser(r.device);
  /* a newer tab of this browser simply takes over from the older one */
  if(first&&tab){await rpc('device_check',{p_device:DV.id,p_label:devLabel(),p_take:true});devTell();DV.state='ok';DV.lock=false;return}
  DV.state='away';DV.lock=true;devSaveLast();track('device_conflict',{first,tab});
  devGateWhenFree(tab?'tab':first?'ask':'away',r)}
 catch(e){/* no server support yet (migration 015 not run) or offline: carry on as before */}finally{DV.busy=false}}
/* tell the other device (and other tabs) to look now */
function devTell(){try{DV_BC&&DV_BC.postMessage({from:DV.id})}catch(e){}try{if(ACC.user)frSend(ACC.user.id,'device',{from:DV.id}).catch(()=>{})}catch(e){}}
/* the other device just took over: get this device's unsaved progress up first, while it's still the one playing */
async function devNudge(p){if(!p||p.from===DV.id||!ACC.user)return;
 if(!DV.lock&&(accMeta().localAt||0)>(accMeta().pushedAt||0)){clearTimeout(ACC.pushT);try{await accPush()}catch(e){}}
 DV.at=0;devCheck()}
$('dgHere').addEventListener('click',async()=>{const u=ACC.user;if(!u)return;const b=$('dgHere');b.disabled=true;$('dgMsg').textContent='Switching to this device…';
 try{await rpc('device_check',{p_device:DV.id,p_label:devLabel(),p_take:true});track('device_take')}catch(e){$('dgMsg').textContent='Could not reach the server. Try again.';b.disabled=false;return}
 devTell();
 /* give the other device a moment to save, then bring the account's latest save here */
 await new Promise(r=>setTimeout(r,devSameBrowser(DV.info&&DV.info.device)?800:3500));DV.state='ok';DV.lock=false;DG.hidden=true;try{await accSync()}catch(e){}});
$('dgOut').addEventListener('click',async()=>{DG.hidden=true;DV.pend=null;clearTimeout(ACC.pushT);try{const c=await supaClient();await c.auth.signOut()}catch(e){}
 ACC.user=null;ACC.name='';ACC.pick=false;ACC.msg='Signed out. Your progress stays on this device.';DV.state='?';DV.lock=false;DV.uid=null;acRender()});
/* check in every 20 s while open (a few seconds after signing in, and straight away when the app comes back) */
setInterval(()=>{if(DV.pend&&!$('title').hidden){const[k,i]=DV.pend;devShow(k,i)}
 if(ACC.user&&(DV.uid!==ACC.user.id||Date.now()-DV.at>20000))devCheck()},2000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ACC.user){DV.at=0;devCheck()}});
/* a yes / no question in its own box over everything (resolves true for yes) */
function pdConfirm(head,html,yes,no){return new Promise(res=>{const w=document.createElement('div');w.className='devGate';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML=`<div class="dgBox"><h3>${head}</h3><p>${html}</p><button type="button" class="big" data-a="1">${yes||'YES'}</button><button type="button" class="mbtn" data-a="0">${no||'NO'}</button></div>`;
 const done=v=>{w.remove();removeEventListener('keydown',k,true);res(v)},k=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done(false)}};
 w.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)done(b.dataset.a==='1');else if(e.target===w)done(false)});addEventListener('keydown',k,true);
 document.body.appendChild(w);try{sfx('pop')}catch(e){}w.querySelector('[data-a="0"]').focus()})}
