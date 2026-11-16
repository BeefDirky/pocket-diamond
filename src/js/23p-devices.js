/* ---------- one device at a time on an account (server side: migration 015) ----------
   Every copy of the game has its own device id. While signed in and open, it checks in with the server every 20 s.
   - Opening the game on a second device while the first is still in use asks: "play here instead?". Saying yes takes
     the account over, nudges the first device to save what it has, then brings that latest save over.
   - The first device notices (at once from the nudge, or at its next check-in) and says another device is playing
     now. From then on it stops saving to the account, so the two never overwrite each other. It can take the account
     back ("play here instead") or sign out.
   - A device that hasn't been used for 2 minutes is replaced without asking. */
Object.assign(DV,{id:null,state:'?',busy:false,info:null,pend:null,uid:null,at:0});
DV.id=(()=>{let v=localStorage.getItem('pd-dev');if(!v||v.length<8){v='d'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);try{RAW_SET('pd-dev',v)}catch(e){}}return v})();
function devLabel(){const u=navigator.userAgent||'',touchMac=/Macintosh/.test(u)&&navigator.maxTouchPoints>1;
 const d=/iPhone/.test(u)?'iPhone':/iPad/.test(u)||touchMac?'iPad':/Android/.test(u)?(/Mobile/.test(u)?'Android phone':'Android tablet'):/CrOS/.test(u)?'Chromebook':/Windows/.test(u)?'Windows PC':/Macintosh/.test(u)?'Mac':/Linux/.test(u)?'Linux PC':'another device';
 const b=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/FxiOS|Firefox/.test(u)?'Firefox':/CriOS|Chrome/.test(u)?'Chrome':/Safari/.test(u)?'Safari':'';return b?`${d} · ${b}`:d}
const devAgo=s=>s==null||s<60?'just now':s<3600?`${Math.round(s/60)} min ago`:`${Math.round(s/3600)} h ago`;
/* the box that asks; it covers everything, so nothing behind it can be pressed */
const DG=document.createElement('div');DG.className='devGate';DG.id='devGate';DG.hidden=true;DG.setAttribute('role','dialog');DG.setAttribute('aria-modal','true');
DG.innerHTML='<div class="dgBox"><h3 id="dgHead"></h3><p id="dgTxt"></p><button type="button" class="big" id="dgHere">PLAY HERE</button><button type="button" class="mbtn" id="dgOut">SIGN OUT</button><p class="dgMsg" id="dgMsg"></p></div>';
document.body.appendChild(DG);
function devShow(kind,info){DV.pend=null;const nm=esc((info&&info.label)||'another device'),ago=devAgo(info&&info.ago);
 $('dgHead').innerHTML=kind==='ask'?'ACCOUNT IN USE':'PLAYING ON ANOTHER DEVICE';
 $('dgTxt').innerHTML=kind==='ask'?`Your account is being played on <b>${nm}</b> (active ${ago}).<br>Play on this device instead? Your latest progress comes with you.`
  :`<b>${nm}</b> is playing on your account now, so this device has stopped saving.<br>Your progress here was saved up to that point.`;
 $('dgHere').textContent=kind==='ask'?'PLAY HERE':'PLAY HERE INSTEAD';$('dgHere').disabled=false;$('dgMsg').textContent='';DG.hidden=false;try{sfx('pop')}catch(e){}}
/* in the middle of a game the box waits for the menus */
function devGateWhenFree(kind,info){if($('title').hidden&&S.phase!=='title'){DV.pend=[kind,info];return}devShow(kind,info)}
async function devCheck(){const u=ACC.user;if(!u||!supaOK()||DV.busy||document.hidden)return;
 if(DV.uid!==u.id){DV.uid=u.id;DV.state='?';DV.lock=false;DG.hidden=true;DV.pend=null}
 DV.busy=true;try{const away=DV.state==='away';
  const r=away?await rpc('device_peek',{p_device:DV.id}):await rpc('device_check',{p_device:DV.id,p_label:devLabel(),p_take:false});DV.at=Date.now();
  if(!r||r.mine){if(away)return;DV.state='ok';DV.lock=false;return}
  DV.info=r;if(away)return;const first=DV.state==='?';DV.state='away';DV.lock=true;clearTimeout(ACC.pushT);track('device_conflict',{first});
  devGateWhenFree(first?'ask':'away',r)}
 catch(e){/* no server support yet (migration 015 not run) or offline: carry on as before */}finally{DV.busy=false}}
/* the other device just took over: get this device's unsaved progress up first, while it's still the one playing */
async function devNudge(p){if(!p||p.from===DV.id||!ACC.user)return;
 if(!DV.lock&&(accMeta().localAt||0)>(accMeta().pushedAt||0)){clearTimeout(ACC.pushT);try{await accPush()}catch(e){}}
 DV.at=0;devCheck()}
$('dgHere').addEventListener('click',async()=>{const u=ACC.user;if(!u)return;const b=$('dgHere');b.disabled=true;$('dgMsg').textContent='Switching to this device…';
 try{await rpc('device_check',{p_device:DV.id,p_label:devLabel(),p_take:true});track('device_take')}catch(e){$('dgMsg').textContent='Could not reach the server. Try again.';b.disabled=false;return}
 try{frSend(u.id,'device',{from:DV.id}).catch(()=>{})}catch(e){}
 /* give the other device a moment to save, then bring the account's latest save here */
 await new Promise(r=>setTimeout(r,3500));DV.state='ok';DV.lock=false;DG.hidden=true;try{await accSync()}catch(e){}});
$('dgOut').addEventListener('click',async()=>{DG.hidden=true;DV.pend=null;clearTimeout(ACC.pushT);try{const c=await supaClient();await c.auth.signOut()}catch(e){}
 ACC.user=null;ACC.name='';ACC.pick=false;ACC.msg='Signed out. Your progress stays on this device.';DV.state='?';DV.lock=false;DV.uid=null;acRender()});
/* check in every 20 s while open (a few seconds after signing in, and straight away when the app comes back) */
setInterval(()=>{if(DV.pend&&!$('title').hidden){const[k,i]=DV.pend;devShow(k,i)}
 if(ACC.user&&(DV.uid!==ACC.user.id||Date.now()-DV.at>20000))devCheck()},2000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ACC.user){DV.at=0;devCheck()}});
