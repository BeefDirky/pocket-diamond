// ---------- menu, lineup cards ----------
let lnView='mine',lnSel=null;
const CUSTOM={name:'ROOKIE',no:99,hand:'R',bat:'#1c1c1f',con:70,pow:70,spd:70,def:70,slot:0,active:false};
try{Object.assign(CUSTOM,JSON.parse(localStorage.getItem('pd-custom')||'{}'))}catch(e){}
function saveCustom(){try{localStorage.setItem('pd-custom',JSON.stringify(CUSTOM))}catch(e){}}
function applyCustom(){
 for(const k of ORDER){const T=TEAMS[k];if(T.benched){const ci=T.lineup.findIndex(p=>p.custom);if(ci>=0)T.lineup[ci]=T.benched;T.benched=null}}
 if(!CUSTOM.active)return;
 const T=TEAMS[S.you],idx=clamp(CUSTOM.slot|0,0,8),rp=T.lineup[idx];T.benched=rp;
 T.lineup[idx]={name:(CUSTOM.name||'ROOKIE').toUpperCase(),hand:CUSTOM.hand,thr:'R',pos:rp.pos,no:CUSTOM.no|0,con:CUSTOM.con,pow:CUSTOM.pow,spd:CUSTOM.spd,def:CUSTOM.def,bat:CUSTOM.bat,custom:true};
}
function syncEditor(){
 $('edName').value=CUSTOM.name;$('edNo').value=CUSTOM.no;
 for(const b of $('edHand').children)b.setAttribute('aria-pressed',String(b.dataset.v===CUSTOM.hand));
 for(const b of $('edBat').children)b.setAttribute('aria-pressed',String(b.dataset.v===CUSTOM.bat));
 for(const[k,id]of[['con','edCon'],['pow','edPow'],['spd','edSpd'],['def','edDef']]){$(id).value=CUSTOM[k];$(id+'V').textContent=CUSTOM[k];$(id+'V').style.color=rcol(CUSTOM[k])}
 const L=TEAMS[S.you].lineup;$('edSlot').innerHTML=L.map((p,i)=>`<option value="${i}">${i+1}. ${(p.custom?(TEAMS[S.you].benched||p):p).name} (${p.pos})</option>`).join('');
 $('edSlot').value=String(clamp(CUSTOM.slot|0,0,8));$('edRemove').hidden=!CUSTOM.active;
}
for(const id of['edHand','edBat'])$(id).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;CUSTOM[id==='edHand'?'hand':'bat']=b.dataset.v;syncEditor()});
for(const[k,id]of[['con','edCon'],['pow','edPow'],['spd','edSpd'],['def','edDef']])$(id).addEventListener('input',e=>{CUSTOM[k]=+e.target.value;$(id+'V').textContent=CUSTOM[k];$(id+'V').style.color=rcol(CUSTOM[k])});
$('edSave').addEventListener('click',()=>{CUSTOM.name=($('edName').value||'ROOKIE').toUpperCase().slice(0,10);CUSTOM.no=clamp(+$('edNo').value||0,0,99);CUSTOM.slot=+$('edSlot').value;CUSTOM.active=true;saveCustom();applyCustom();updateHUD();showScreen('scrLineup')});
$('edRemove').addEventListener('click',()=>{CUSTOM.active=false;saveCustom();applyCustom();updateHUD();showScreen('scrLineup')});
const PORTRAIT={};
function portrait(T,p,home){
 const key=T.name+p.name+(home?1:0);if(PORTRAIT[key])return PORTRAIT[key];
 const c=document.createElement('canvas');c.width=16;c.height=23;const g=c.getContext('2d');
 drawPlayer(g,8,21,T,{legs:'stand',arms:(p.pos==='SP'||p.pos==='RP')?'set':'down',skin:skinOf(p.name),pants:home?'#eeeae0':'#a9b0b5',glove:p.pos!=='DH'&&p.pos!=='SP'&&p.pos!=='RP',flip:p.thr==='R'});
 return PORTRAIT[key]=c.toDataURL();
}
function renderCards(){
 const key=lnView==='mine'?S.you:S.opp,T=TEAMS[key],mine=lnView==='mine';
 $('lnTitle').textContent=`${T.city} ${T.name}`;
 $('lnHint').textContent=mine?'Tap a player to sign one of your cards into his spot, or move him in the batting order.':'Scouting report. Their gloves and their starter shape every play.';
 $('lnMine').setAttribute('aria-pressed',String(mine));$('lnCreate').hidden=!mine;$('lnOpp').setAttribute('aria-pressed',String(!mine));
 const stat=(l,v)=>`<div class="st"><span>${l}</span><i><u style="width:${Math.min(100,v)}%;background:${rcol(v)}"></u></i><b style="color:${rcol(v)}">${v}</b></div>`;
 const card=(p,slot,i)=>`<button type="button" class="pcard${lnSel===i?' sel':''}${!mine?' ro':''}${p.custom?' mine':''}${p.signed?' signed':''}" data-i="${i}" style="--tc:${T.jersey};--tc2:${T.cap}">
  <div class="pcTop"><span class="slot">${slot}</span><span class="pcPos">${p.pos}${p.custom?' ★':''}${p.signed?' · CARD':''}</span><span class="pcOvr">${ovr(p)}</span></div>
  <div class="pcMid"><img alt="" src="${portrait(T,p,key===S.you)}"><div class="pcId"><b>${p.name}</b><span>#${p.no} · ${(p.pos==='SP'||p.pos==='RP')?'Throws '+p.hand+(p.slot==='side'?' side':'')+(p.type==='demon'?' · DEMON':p.type==='knuckle'?' · KNUCKLER':''):'B/T '+p.hand+'/'+p.thr}</span></div></div>
  <div class="pcStats">${(p.pos==='SP'||p.pos==='RP')?stat('VEL',p.vel)+stat('MOV',p.mov)+stat('CTL',p.ctl)+stat('DEF',p.def):stat('CON',p.con)+stat('POW',p.pow)+stat('SPD',p.spd)+stat('DEF',p.def)}</div></button>`;
 $('cards').innerHTML=T.lineup.map((p,i)=>card(p,i+1,i)).join('')+T.staff.map((p,k)=>card(p,'',-1-k)).join('');
}
$('cards').addEventListener('click',e=>{
 const c=e.target.closest('.pcard');if(!c||lnView!=='mine')return;const i=+c.dataset.i;
 if(lnSel===null){openSheet(i);return}if(i<0)return;if(lnSel===i)lnSel=null;
 else{const L=TEAMS[S.you].lineup;[L[lnSel],L[i]]=[L[i],L[lnSel]];lnSel=null;const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}updateHUD()}
 renderCards();
});
$('lnMine').addEventListener('click',()=>{lnView='mine';lnSel=null;renderCards()});
$('lnOpp').addEventListener('click',()=>{lnView='opp';lnSel=null;renderCards()});
let Q_URL=null;function qLogo(){if(Q_URL)return Q_URL;const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');g.fillStyle='#1b1f24';g.beginPath();g.arc(48,48,44,0,Math.PI*2);g.fill();g.strokeStyle='#3a4048';g.lineWidth=6;g.stroke();g.fillStyle='#ffbf3c';g.font='48px "Press Start 2P", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('?',50,52);return Q_URL=c.toDataURL()}
function refreshMenu(){const y=TEAMS[S.you],o=TEAMS[S.opp];$('mLogoY').src=LOGO_URL[S.you];$('mLogoO').src=qLogo();$('mNameY').textContent=`${y.city} ${y.name}`;$('mNameO').textContent='RANDOM';const st=STADIUMS[S.you];$('mMatch').textContent=`The ${y.city} ${y.name} (${y.kcity} ${y.kname}) host a random opponent at ${st.name}, ${st.kname}. ${S.night?'Night game under the lights.':'Day game in the sun.'}`}
function rebuildPark(){NIGHT_MASK=null;NIGHT_BEAMS=null;setStadium();FIELD=buildField();SIGNS=buildSigns();DECOR=buildDecor();S.vendors=null;S.bb=null;S.fidg=[]}
function showScreen(id){if(id==='scrTeams'&&!pendingMode&&!parkFromBP){$('playGo').hidden=true;const h=document.querySelector('#scrTeams h1');if(h)h.innerHTML='PICK <span>TEAMS</span>'}if(id==='scrMain'||id==='scrSingle')pendingMode=null;for(const k of['scrMain','scrSingle','scrAbout','scrTeams','scrLineup','scrHow','scrOpts','scrEdit','scrPause','scrCards','scrPick','scrBracket','scrOnline'])$(k).hidden=k!==id;if(id==='scrEdit')syncEditor();if(id==='scrOpts')syncOpts();if(id==='scrCards')renderBinder();if(id==='scrLineup'){lnSel=null;renderCards()}if(id==='scrMain'||id==='scrSingle')refreshMenu();$('title').scrollTop=0}
const isDesk=()=>isLandscape();// any landscape screen: the park fills it, controls float on top
{let lastDesk=null;addEventListener('resize',()=>{const d=isDesk();if(lastDesk===null||d!==lastDesk)applyWide();lastDesk=d})}
function applyWide(){$('stage').classList.toggle('land',isWide());document.querySelector('.app').classList.toggle('wideApp',isWide()&&!isDesk());document.querySelector('.app').classList.toggle('deskApp',isDesk());requestAnimationFrame(()=>{resize()})}
function syncOpts(){for(const b of $('optCam').children)b.setAttribute('aria-pressed',String(b.dataset.v===OPT.cam));for(const b of $('optTime').children)b.setAttribute('aria-pressed',String(b.dataset.v===OPT.time));for(const b of $('mTime').children)b.setAttribute('aria-pressed',String(b.dataset.v===OPT.time));for(const[id,k]of[['vMusic','music'],['vCrowd','crowd'],['vSfx','sfx']]){$(id).value=OPT[k];$(id+'V').textContent=OPT[k]}}
for(const[id,k]of[['vMusic','music'],['vCrowd','crowd'],['vSfx','sfx']])$(id).addEventListener('input',e=>{OPT[k]=+e.target.value;$(id+'V').textContent=OPT[k];ensureAudio();applyVolumes();saveOpts()});
function decideTime(){const n=OPT.time==='night'?true:OPT.time==='day'?false:Math.random()<.55;if(n!==S.night){S.night=n;if(FIELD)SIGNS=buildSigns()}if($('mLogoY'))refreshMenu()}
const setTime=v=>{OPT.time=v;saveOpts();syncOpts();decideTime()};
$('optTime').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTime(b.dataset.v)});
$('mTime').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTime(b.dataset.v)});
$('optCam').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;OPT.cam=b.dataset.v;saveOpts();syncOpts();applyWide()});
let optsFromGame=false,pausedAt=0,lineFromPause=false;
const canPause=()=>!(S.online&&S.online.inGame)&&S.phase!=='title'&&S.phase!=='over'&&!S.paused&&$('title').hidden&&$('over').hidden;
function pauseGame(){if(!canPause())return;S.paused=true;pausedAt=performance.now();
 const y=TEAMS[S.you],o=TEAMS[S.opp];$('pauseInfo').textContent=`${S.mode==='full'?'Full game':'Arcade'} · ${o.name} ${S.target||0}, ${y.name} ${S.runs||0} · ${S.mode==='full'?(S.half==='top'?'Top':'Bottom'):'Bottom'} of the ${ord(S.inning||1)}`;
 try{if(AC&&AC.state==='running')AC.suspend()}catch(e){}
 $('title').hidden=false;showScreen('scrPause')}
function resumeGame(){if(!S.paused)return;const gap=performance.now()-pausedAt;
 if(S.pitch&&S.pitch.releaseAt)S.pitch.releaseAt+=gap;if(S.pitch&&S.meterT0)S.meterT0+=gap;if(S.swing){S.swing.at+=gap;if(S.swing.contactAt)S.swing.contactAt+=gap}
 for(const k of['cheerUntil','fwUntil','umpPunch','flame','wildUntil'])if(S[k])S[k]+=gap;
 S.paused=false;optsFromGame=false;$('title').hidden=true;showScreen('scrMain');try{if(AC&&AC.state!=='running'&&AC.state!=='closed')AC.resume()}catch(e){}}
function openOptionsInGame(){if(S.phase==='title'||S.phase==='over'){showScreen('scrOpts');return}if(!S.paused)pauseGame();optsFromGame=true;showScreen('scrOpts')}
$('optBack').addEventListener('click',()=>{if(optsFromGame&&S.paused){optsFromGame=false;showScreen('scrPause')}else showScreen('scrMain')});
$('pauseBtn').addEventListener('click',e=>{e.stopPropagation();pauseGame()});
$('pauseBtn').addEventListener('pointerdown',e=>e.stopPropagation());
$('resume').addEventListener('click',resumeGame);
$('pOpts').addEventListener('click',()=>{optsFromGame=true;showScreen('scrOpts')});
$('pLine').addEventListener('click',()=>{lineFromPause=true;showScreen('scrLineup')});
$('pQuit').addEventListener('click',()=>{S.paused=false;optsFromGame=false;try{if(AC&&AC.state!=='running'&&AC.state!=='closed')AC.resume()}catch(e){}toTitle()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const toMenu=b.dataset.go==='scrMain'||b.dataset.go==='scrSingle';if(parkFromBP&&toMenu){backToCage();return}if(lineFromPause&&S.paused&&toMenu){lineFromPause=false;showScreen('scrPause');return}showScreen(b.dataset.go)}));
