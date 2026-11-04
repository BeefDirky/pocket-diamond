// ---------- accounts + cloud saves (Supabase email/password; guests keep playing on this device) ----------
// What's saved: every pd-* progress key in local storage (cards, signings, playoff run, custom lineup, options).
// The device keeps working offline exactly as before; each change is pushed to the player's row in `saves` a few
// seconds later. Signing in on a device that already has guest progress uploads it, unless the account already
// has a different save, in which case the player chooses which one to keep.
const SAVE_KEYS=['pd-cards','pd-signings','pd-playoffs','pd-custom','pd-opts2'];
const ACC={user:null,state:'out',msg:'',pushT:0,busy:false,cloud:null};
const accMeta=()=>{try{return JSON.parse(localStorage.getItem('pd-acct')||'{}')}catch(e){return{}}};
const accSetMeta=m=>{try{RAW_SET('pd-acct',JSON.stringify(m))}catch(e){}};
const RAW_SI=Storage.prototype.setItem,RAW_SET=(k,v)=>RAW_SI.call(localStorage,k,v);
// every progress write marks the save as changed and schedules an upload
try{Storage.prototype.setItem=function(k,v){RAW_SI.call(this,k,v);if(this===localStorage&&SAVE_KEYS.includes(k))accDirty()}}catch(e){}
function localBlob(){const o={};for(const k of SAVE_KEYS){const v=localStorage.getItem(k);if(v!=null)o[k]=v}return o}
const hasProgress=o=>!!(o['pd-cards']||o['pd-signings']||o['pd-playoffs']||o['pd-custom']);
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
function acRender(){const on=!!ACC.user,cf=ACC.state==='conflict';$('mmAcct').textContent=on?`SIGNED IN · ${ACC.user.email.toUpperCase()}`:'GUEST · SAVED ON THIS DEVICE';
 if(!$('acSignedOut'))return;$('acSignedOut').hidden=on||cf;$('acSignedIn').hidden=!on||cf;$('acConflict').hidden=!cf;
 if(on){$('acWho').textContent=ACC.user.email;const m=accMeta();$('acSync').textContent=`Cloud save: ${acWhen(m.syncedAt)}${(m.localAt||0)>(m.pushedAt||0)?' · uploading changes…':''}`}
 if(cf){const c=ACC.cloud;$('acCfTxt').innerHTML=`This device has progress, and your account already has a save from <b>${acWhen(c.updated_at)}</b>. Which one do you want to keep? The other one is replaced.`}
 if(!supaOK()&&!on){$('acMsg').textContent='Accounts work in the website version of the game.';for(const id of['acSignIn','acSignUp','acForgot'])$(id).disabled=true}else $('acMsg').textContent=ACC.msg}
const acCreds=()=>({email:$('acEmail').value.trim(),password:$('acPass').value});
async function acDo(kind){if(ACC.busy||!supaOK())return;const {email,password}=acCreds();
 if(!/^\S+@\S+\.\S+$/.test(email)){ACC.msg='Enter your email address.';acRender();return}
 if(kind!=='forgot'&&password.length<6){ACC.msg='Passwords are at least 6 characters.';acRender();return}
 ACC.busy=true;ACC.msg=kind==='up'?'Creating your account…':kind==='in'?'Signing in…':'Sending…';acRender();
 try{const c=await supaClient(),back=location.origin+location.pathname;
  if(kind==='forgot'){const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:back});if(error)throw error;ACC.msg='Check your email for a link to set a new password.'}
  else if(kind==='up'){const {data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:back}});if(error)throw error;
   ACC.msg=data.session?'':'Almost there: open the confirmation link we just emailed you, then sign in.'}
  else{const {error}=await c.auth.signInWithPassword({email,password});if(error)throw error;ACC.msg=''}
 }catch(e){ACC.msg=(e&&e.message)||'Something went wrong. Try again.'}
 ACC.busy=false;acRender()}
async function accWatch(){if(!supaOK())return;const c=await supaClient();
 c.auth.onAuthStateChange((ev,session)=>{const u=session&&session.user||null,was=ACC.user&&ACC.user.id;ACC.user=u;
  if(ev==='PASSWORD_RECOVERY'){const np=prompt('Choose a new password (6+ characters):');if(np&&np.length>=6)c.auth.updateUser({password:np}).then(({error})=>{ACC.msg=error?error.message:'Password updated.';acRender()})}
  if(u&&u.id!==was)accSync().catch(()=>{});if(!u)ACC.state='out';acRender()})}
$('acSignIn').addEventListener('click',()=>acDo('in'));$('acSignUp').addEventListener('click',()=>acDo('up'));$('acForgot').addEventListener('click',()=>acDo('forgot'));
for(const id of['acEmail','acPass'])$(id).addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')acDo('in')});
$('acSaveNow').addEventListener('click',()=>{ACC.msg='Saving…';acRender();accPush()});
$('acSignOut').addEventListener('click',async()=>{clearTimeout(ACC.pushT);if((accMeta().localAt||0)>(accMeta().pushedAt||0))await accPush();const c=await supaClient();await c.auth.signOut();ACC.user=null;ACC.msg='Signed out. Your progress stays on this device.';acRender()});
$('acUseCloud').addEventListener('click',()=>{const r=ACC.cloud;accApply(r.data);accSetMeta({uid:ACC.user.id,syncedAt:r.updated_at,pushedAt:Date.now(),localAt:Date.now()});location.reload()});
$('acUseLocal').addEventListener('click',()=>{ACC.state='in';ACC.cloud=null;accPush()});
// leaving the page: get the last changes up if we can
addEventListener('visibilitychange',()=>{if(document.hidden&&ACC.user&&(accMeta().localAt||0)>(accMeta().pushedAt||0))accPush()});
// a remembered session (or a confirmation/reset link) loads the client right away; guests never load it
if(supaOK()&&(Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k))||/access_token|type=recovery|code=/.test(location.hash+location.search)))accWatch().catch(()=>{});
else if(supaOK())$('goAcct').addEventListener('click',()=>accWatch().catch(()=>{}),{once:true});
acRender();
