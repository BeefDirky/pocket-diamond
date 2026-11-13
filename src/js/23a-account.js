// ---------- accounts + cloud saves (Supabase email/password; guests keep playing on this device) ----------
// What's saved: every pd-* progress key in local storage (cards, signings, playoff run, custom lineup, options).
// The device keeps working offline exactly as before; each change is pushed to the player's row in `saves` a few
// seconds later. Signing in on a device that already has guest progress uploads it, unless the account already
// has a different save, in which case the player chooses which one to keep.
const SAVE_KEYS=['pd-cards','pd-signings','pd-playoffs','pd-custom','pd-opts2','pd-wallet'];
const ACC={user:null,state:'out',msg:'',pushT:0,busy:false,cloud:null,name:'',pick:false};
const accMeta=()=>{try{return JSON.parse(localStorage.getItem('pd-acct')||'{}')}catch(e){return{}}};
const accSetMeta=m=>{try{RAW_SET('pd-acct',JSON.stringify(m))}catch(e){}};
const RAW_SI=Storage.prototype.setItem,RAW_SET=(k,v)=>RAW_SI.call(localStorage,k,v);
// every progress write marks the save as changed and schedules an upload
try{Storage.prototype.setItem=function(k,v){RAW_SI.call(this,k,v);if(this===localStorage&&SAVE_KEYS.includes(k))accDirty()}}catch(e){}
function localBlob(){const o={};for(const k of SAVE_KEYS){const v=localStorage.getItem(k);if(v!=null)o[k]=v}return o}
const hasProgress=o=>!!(o['pd-cards']||o['pd-signings']||o['pd-playoffs']||o['pd-custom']||o['pd-wallet']);
function accDirty(){const m=accMeta();m.localAt=Date.now();accSetMeta(m);if(ACC.user){clearTimeout(ACC.pushT);ACC.pushT=setTimeout(accPush,4000)}}
async function accPush(){if(!ACC.user||ACC.state==='conflict')return;try{const c=await supaClient(),at=new Date().toISOString();
  const {error}=await c.from('saves').upsert({user_id:ACC.user.id,data:localBlob(),updated_at:at});if(error)throw error;
  const m=accMeta();m.uid=ACC.user.id;m.syncedAt=at;m.pushedAt=Date.now();accSetMeta(m);ACC.msg='';acRender()}
 catch(e){ACC.msg=/relation|saves/.test(e.message||'')?'Cloud saves are not set up on the server yet.':'Could not reach the cloud; your progress is safe on this device and will upload later.';acRender()}}
function accApply(data){for(const k of SAVE_KEYS){if(data[k]!=null)RAW_SET(k,data[k]);else localStorage.removeItem(k)}}
// after sign-in (or a remembered session on load): line the device up with the account's save
async function accSync(){const c=await supaClient(),u=ACC.user;if(!u)return;
 const {data:row,error}=await c.from('saves').select('data,updated_at').eq('user_id',u.id).maybeSingle();
 if(error){ACC.msg=/relation|saves/.test(error.message||'')?'Cloud saves are not set up on the server yet.':'Could not reach the cloud.';acRender();return}
 const m=accMeta(),local=localBlob(),unsynced=!m.pushedAt||(m.localAt||0)>m.pushedAt;
 if(!row){await accPush();return}
 if(m.uid===u.id&&!unsynced){if(row.updated_at!==m.syncedAt){accApply(row.data);m.syncedAt=row.updated_at;m.pushedAt=Date.now();m.localAt=m.pushedAt;accSetMeta(m);location.reload()}return}
 if(m.uid===u.id&&row.updated_at===m.syncedAt){await accPush();return}
 if(!hasProgress(local)){accApply(row.data);const mm={uid:u.id,syncedAt:row.updated_at,pushedAt:Date.now()};mm.localAt=mm.pushedAt;accSetMeta(mm);location.reload();return}
 // both this device and the account have progress that the other hasn't seen: the player decides
 ACC.cloud=row;ACC.state='conflict';acRender();showScreen('scrAcct')}
function acWhen(t){if(!t)return'never';const d=new Date(t),s=(Date.now()-d)/1000;return s<60?'just now':s<3600?`${Math.round(s/60)} min ago`:d.toLocaleString()}
function acRender(){const on=!!ACC.user,cf=ACC.state==='conflict',pk=on&&!cf&&ACC.pick;$('mmAcct').textContent=on?(ACC.name?`SIGNED IN · ${ACC.name.toUpperCase()}`:'SIGNED IN · CHOOSE A USERNAME'):'GUEST · SAVED ON THIS DEVICE';
 if(!$('acSignedOut'))return;$('acSignedOut').hidden=on||cf;$('acSignedIn').hidden=!on||cf||pk;$('acConflict').hidden=!cf;$('acPickName').hidden=!pk;
 if(pk){$('acNameCancel').hidden=!ACC.name;$('acPickTxt').textContent=ACC.name?`Your username is ${ACC.name}. Pick a new one; no one else can have it.`:"Choose your username. It's how other players see you, and no one else can have it."}
 if(on){$('acName').textContent=ACC.name||'(no username yet)';$('acWho').textContent=ACC.user.email;const m=accMeta();$('acSync').textContent=`Cloud save: ${acWhen(m.syncedAt)}${(m.localAt||0)>(m.pushedAt||0)?' · uploading changes…':''}`}
 if(cf){const c=ACC.cloud;$('acCfTxt').innerHTML=`This device has progress, and your account already has a save from <b>${acWhen(c.updated_at)}</b>. Which one do you want to keep? The other one is replaced.`}
 if(!supaOK()&&!on){$('acMsg').textContent='Accounts work in the website version of the game.';for(const id of['acSignIn','acSignUp','acForgot'])$(id).disabled=true}else $('acMsg').textContent=ACC.msg}
const acCreds=()=>({email:$('acEmail').value.trim(),password:$('acPass').value});
async function acDo(kind){if(ACC.busy||!supaOK())return;const {email,password}=acCreds();
 if(!/^\S+@\S+\.\S+$/.test(email)){ACC.msg='Enter your email address.';acRender();return}
 if(kind!=='forgot'&&password.length<6){ACC.msg='Passwords are at least 6 characters.';acRender();return}
 ACC.busy=true;ACC.msg=kind==='up'?'Creating your account…':kind==='in'?'Signing in…':'Sending…';acRender();
 try{const c=await supaClient(),back=location.origin+location.pathname;
  if(kind==='forgot'){const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:back});if(error)throw error;ACC.msg='Check your email for a link to set a new password.'}
  else if(kind==='up'){const un=$('acUser').value.trim(),bad=nameBad(un);if(bad)throw{message:bad};
   const free=await nameFree(un);if(free===false)throw{message:`${un} is taken. Try another username.`};
   const {data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:back,data:{username:un}}});if(error)throw error;
   ACC.msg=data.session?'':'Almost there: open the confirmation link we just emailed you, then sign in.'}
  else{const {error}=await c.auth.signInWithPassword({email,password});if(error)throw error;ACC.msg=''}
 }catch(e){ACC.msg=(e&&e.message)||'Something went wrong. Try again.'}
 ACC.busy=false;acRender()}
async function accWatch(){if(!supaOK())return;const c=await supaClient();
 c.auth.onAuthStateChange((ev,session)=>{const u=session&&session.user||null,was=ACC.user&&ACC.user.id;ACC.user=u;
  if(ev==='PASSWORD_RECOVERY'){const np=prompt('Choose a new password (6+ characters):');if(np&&np.length>=6)c.auth.updateUser({password:np}).then(({error})=>{ACC.msg=error?error.message:'Password updated.';acRender()})}
  if(u&&u.id!==was){accSync().catch(()=>{});accProfile().catch(()=>{})}if(!u){ACC.state='out';ACC.name='';ACC.pick=false}acRender()})}
$('acSignIn').addEventListener('click',()=>acDo('in'));$('acSignUp').addEventListener('click',()=>acDo('up'));$('acForgot').addEventListener('click',()=>acDo('forgot'));
for(const id of['acEmail','acPass','acUser'])$(id).addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')acDo('in')});
$('acSaveNow').addEventListener('click',()=>{ACC.msg='Saving…';acRender();accPush()});
$('acSignOut').addEventListener('click',async()=>{clearTimeout(ACC.pushT);if((accMeta().localAt||0)>(accMeta().pushedAt||0))await accPush();const c=await supaClient();await c.auth.signOut();ACC.user=null;ACC.name='';ACC.pick=false;ACC.msg='Signed out. Your progress stays on this device.';acRender()});
$('acUseCloud').addEventListener('click',()=>{const r=ACC.cloud;accApply(r.data);accSetMeta({uid:ACC.user.id,syncedAt:r.updated_at,pushedAt:Date.now(),localAt:Date.now()});location.reload()});
$('acUseLocal').addEventListener('click',()=>{ACC.state='in';ACC.cloud=null;accPush()});
// leaving the page: get the last changes up if we can
addEventListener('visibilitychange',()=>{if(document.hidden&&ACC.user&&(accMeta().localAt||0)>(accMeta().pushedAt||0))accPush()});
// a remembered session (or a confirmation/reset link) loads the client right away; guests never load it
if(supaOK()&&(Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k))||/access_token|type=recovery|code=/.test(location.hash+location.search)))accWatch().catch(()=>{});
else if(supaOK())$('goAcct').addEventListener('click',()=>accWatch().catch(()=>{}),{once:true});
// ---- usernames: one per account, unique ignoring case (the database's unique index is the final word) ----
const NAME_RE=/^[A-Za-z0-9_]{3,16}$/,NAME_RES=/^(admin|administrator|mod|moderator|imugi|imugilabs|pocketdiamond|system|support|guest|cpu|null|undefined)$/i;
function nameBad(n){if(!n)return'Choose a username.';if(n.length<3)return'Usernames are at least 3 characters.';if(n.length>16)return'Usernames are at most 16 characters.';
 if(!NAME_RE.test(n))return'Use only letters, numbers and _ in your username.';if(NAME_RES.test(n))return'That username is reserved. Try another.';return''}
const noProfiles=e=>/profiles|relation|schema cache/i.test((e&&e.message)||'');
// true = free, false = taken, null = couldn't check
async function nameFree(n){try{const c=await supaClient(),{data,error}=await c.from('profiles').select('user_id').eq('uname_lc',n.toLowerCase()).limit(1);if(error)return null;
 return!data.length||!!(ACC.user&&data[0].user_id===ACC.user.id)}catch(e){return null}}
async function nameClaim(n){const c=await supaClient(),{error}=await c.from('profiles').upsert({user_id:ACC.user.id,username:n});
 if(!error){ACC.name=n;const m=accMeta();m.name=n;accSetMeta(m);return''}
 if(error.code==='23505'||/duplicate|unique/i.test(error.message||''))return`${n} is taken. Try another username.`;
 if(noProfiles(error))return'Usernames are not set up on the server yet.';return error.message||'Could not save your username. Try again.'}
// after sign-in: load the username; a new account claims the one it signed up with, or picks one
async function accProfile(){const c=await supaClient(),u=ACC.user;if(!u)return;
 const {data,error}=await c.from('profiles').select('username').eq('user_id',u.id).maybeSingle();
 if(error){if(!noProfiles(error)){const m=accMeta();if(m.uid===u.id&&m.name)ACC.name=m.name}acRender();return}
 if(data){ACC.name=data.username;ACC.pick=false;const m=accMeta();m.name=data.username;accSetMeta(m);acRender();return}
 const want=(u.user_metadata&&u.user_metadata.username)||'';
 if(want&&!nameBad(want)){const err=await nameClaim(want);if(!err){ACC.pick=false;acRender();return}ACC.msg=err}
 ACC.pick=true;$('acNewName').value=want;$('acNameHint').textContent='3-16 letters, numbers or _';$('acNameHint').className='acHint';acRender();showScreen('scrAcct')}
function acNameHint(el,hint){const n=el.value.trim(),h=$(hint);clearTimeout(el._t);h.className='acHint';
 if(!n){h.textContent='3-16 letters, numbers or _';return}const bad=nameBad(n);if(bad){h.textContent=bad;h.classList.add('bad');return}
 if(!supaOK()){h.textContent='';return}h.textContent='Checking…';
 el._t=setTimeout(async()=>{const f=await nameFree(n);if(el.value.trim()!==n)return;h.textContent=f===null?'':f?`${n} is available`:`${n} is taken`;if(f!==null)h.classList.add(f?'ok':'bad')},400)}
$('acUser').addEventListener('input',()=>acNameHint($('acUser'),'acUserHint'));
$('acNewName').addEventListener('input',()=>acNameHint($('acNewName'),'acNameHint'));
async function acSaveName(){if(ACC.busy||!ACC.user)return;const n=$('acNewName').value.trim(),bad=nameBad(n);if(bad){ACC.msg=bad;acRender();return}
 if(n===ACC.name){ACC.pick=false;ACC.msg='';acRender();return}
 ACC.busy=true;ACC.msg='Saving…';acRender();const err=await nameClaim(n).catch(e=>(e&&e.message)||'Could not save your username.');ACC.busy=false;
 if(err){ACC.msg=err;acRender();return}ACC.pick=false;ACC.msg=`You're ${n}.`;acRender()}
$('acNameSave').addEventListener('click',acSaveName);
$('acNewName').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')acSaveName()});
$('acNameCancel').addEventListener('click',()=>{ACC.pick=false;ACC.msg='';acRender()});
$('acRename').addEventListener('click',()=>{ACC.pick=true;ACC.msg='';$('acNewName').value=ACC.name||'';$('acNameHint').textContent='3-16 letters, numbers or _';$('acNameHint').className='acHint';acRender();$('acNewName').focus()});
// the menu shows the last known username before the network answers
{const m=accMeta();if(m.name&&Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k)))ACC.name=m.name}
acRender();
