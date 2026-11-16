// ---------- signings: put any card you own into your club's lineup or staff ----------
// A signed player takes over a lineup spot (keeping that spot's position) or a staff slot. Saved per club.
// Online, each side sends its full roster spec in the lobby so both phones field identical teams.
let SIGN={};try{SIGN=JSON.parse(localStorage.getItem('pd-signings')||'{}')||{}}catch(e){SIGN={}}
const saveSign=()=>{try{localStorage.setItem('pd-signings',JSON.stringify(SIGN))}catch(e){}};
function snapOrig(){for(const k of ORDER){const T=TEAMS[k];if(!T.orig)T.orig={L:T.lineup.slice(),P:T.staff.slice(),R:(T.rot||[]).slice()}}}
function signClone(c,base,lvSpec){const p={...c.p,...cardEff(c,lvSpec)},q={name:p.name,hand:p.hand,thr:p.thr||p.hand,pos:base.pos,natPos:p.pos,no:base.no,signed:c.id,
  con:p.con,pow:p.pow,spd:p.spd,def:p.def==null?60:p.def,vel:p.vel,mov:p.mov,ctl:p.ctl,slot:p.slot||'over',type:p.type,bat:p.bat||base.bat||'#d9b07a'};
 if(p.skin)SKIN_OVR[q.name]=p.skin;if(lvSpec)q.lvSpec=lvSpec;if(c.pit)q.ars=arsFor({...q,pos:base.pos},c.code||c.k||'fa');return q}
// where does the original player for this slot live now (lineup order can be shuffled)
function slotOf(T,orig,pit){const arr=pit?T.staff:T.lineup;return arr.findIndex(p=>p===orig||(p.signedFor===orig.name))}
/* a pitcher's slot: on the staff (today's starter and the bullpen) or among the next four starters */
function pitSlot(T,orig){let i=slotOf(T,orig,true);if(i>=0)return[T.staff,i];const R=T.rot||[];i=R.findIndex(p=>p===orig||(p.signedFor===orig.name));return i>=0?[R,i]:[null,-1]}
const origPit=(T,nm)=>T.orig.P.find(p=>p.name===nm)||(T.orig.R||[]).find(p=>p.name===nm);
function signPlayer(k,origName,cardId,pit,save){const T=TEAMS[k],orig=pit?origPit(T,origName):T.orig.L.find(p=>p.name===origName),c=CARD_BY[cardId];
 if(!orig||!c||c.pit!==pit)return false;const[arr,i]=pit?pitSlot(T,orig):[T.lineup,slotOf(T,orig,false)];if(i<0)return false;
 const q=signClone(c,orig);q.signedFor=orig.name;if(arr[i].custom){T.benched=q}else arr[i]=q;
 if(save!==false){(SIGN[k]=SIGN[k]||{})[(pit?'P:':'L:')+origName]=cardId;saveSign();track('card_signed',{card_set:c.set,rarity:c.r,club:k,pitcher:!!pit})}return true}
function releasePlayer(k,origName,pit){const T=TEAMS[k],orig=pit?origPit(T,origName):T.orig.L.find(p=>p.name===origName);if(!orig)return;
 const[arr,i]=pit?pitSlot(T,orig):[T.lineup,slotOf(T,orig,false)];if(i>=0){if(arr[i].custom)T.benched=orig;else arr[i]=orig}
 if(SIGN[k]){delete SIGN[k][(pit?'P:':'L:')+origName];saveSign()}}
function applySignings(){snapOrig();for(const k in SIGN){if(!TEAMS[k])continue;for(const key in SIGN[k]){const pit=key[0]==='P',nm=key.slice(2),id=SIGN[k][key];
   if(!CARD_BY[id]||!COL.owned[id]){delete SIGN[k][key];continue}signPlayer(k,nm,id,pit,false)}}saveSign();rotApply()}
const usedCards=k=>new Set([...TEAMS[k].lineup,...(TEAMS[k].benched?[TEAMS[k].benched]:[]),...TEAMS[k].staff,...(TEAMS[k].rot||[])].filter(p=>p&&p.signed).map(p=>p.signed));
/* ---- the rotation: five starters take turns. After each game your club played (not online), the next one starts ----
   The order is saved per club ('pd-rot': each slot's original pitcher, today's starter first). */
let ROTO={};try{ROTO=JSON.parse(localStorage.getItem('pd-rot')||'{}')||{}}catch(e){ROTO={}}
const rotFive=T=>[T.staff[0],...(T.rot||[])];
const rotName=p=>p.signedFor||p.name;
function rotSave(k){const T=TEAMS[k];ROTO[k]=rotFive(T).map(rotName);try{localStorage.setItem('pd-rot',JSON.stringify(ROTO));if(typeof accDirty==='function')accDirty()}catch(e){}}
function rotApply(){for(const k in ROTO){const T=TEAMS[k];if(!T||!T.rot||!Array.isArray(ROTO[k]))continue;const five=rotFive(T),by=n=>five.find(p=>rotName(p)===n);
  const ord=ROTO[k].map(by).filter(Boolean);if(ord.length!==5||new Set(ord).size!==5)continue;T.staff[0]=ord[0];T.rot=ord.slice(1)}}
function rotAdvance(k){const T=TEAMS[k];if(!T||!T.rot||!T.rot.length)return;const f=rotFive(T);T.staff[0]=f[1];T.rot=[...f.slice(2),f[0]];rotSave(k)}
/* swap two of the five rotation spots (Team > Positions > PITCHERS: tap two starters) */
function rotSwap(k,a,b){const T=TEAMS[k],f=rotFive(T);[f[a],f[b]]=[f[b],f[a]];T.staff[0]=f[0];T.rot=f.slice(1);rotSave(k)}
// ---- online roster spec ----
function rosterSpec(k){const T=TEAMS[k],ent=p=>{if(p.custom)p=T.benched||p;if(p.signed)return['c',p.signed,p.signedFor,lvOf(p.signed)];const nc=nativeCard(k,p.name);return['n',p.name,nc?lvOf(nc.id):{}]};return{L:T.lineup.map(ent),P:T.staff.map(ent),base:BASE_OF[k]||k}}
// (spec.base: whose roster this is; a player who rebranded fields his first club's players in his new club's kit)
function applyRosterSpec(k,spec){if(!spec||!spec.L||!spec.P)return;snapOrig();const T=TEAMS[k];if(!T.netBackup)T.netBackup={L:T.lineup.slice(),P:T.staff.slice()};
 const OR=spec.base&&PRISTINE[spec.base]?{L:PRISTINE[spec.base].L,P:[...PRISTINE[spec.base].P,...(PRISTINE[spec.base].R||[])]}:{L:T.orig.L,P:[...T.orig.P,...(T.orig.R||[])]};/* (today's starter may be any of the five) */
 const build=(list,origs,pit)=>list.map(e=>{const base=origs.find(p=>p.name===(e[0]==='c'?e[2]:e[1]))||origs[0];if(e[0]==='c'&&CARD_BY[e[1]]){const q=signClone(CARD_BY[e[1]],base,e[3]||{});q.signedFor=base.name;return q}
  // one of the club's own players: at his base ratings plus whatever levels his owner has given him
  const lv=e[0]==='n'&&e[2]?e[2]:null,nc=lv&&Object.keys(lv).length?nativeCard(k,base.name):null;if(nc){const q={...base,...cardEff(nc,lv)};return q}return base});
 T.lineup=build(spec.L,OR.L,false);T.staff=build(spec.P,OR.P,true)}
function restoreNetRosters(){for(const k of ORDER){const T=TEAMS[k];if(T.netBackup){T.lineup=T.netBackup.L;T.staff=T.netBackup.P;T.netBackup=null}}}

// ---- the lineup screen's player sheet ----
let sheetFor=null;
function openSheet(i){const T=TEAMS[S.you],pit=i<0,p=pit?T.staff[-1-i]:T.lineup[i];if(!p)return;
 const real=p.custom?T.benched||p:p,origName=real.signedFor||real.name;sheetFor={i,pit,origName};
 const own=CARDS.filter(c=>COL.owned[c.id]&&c.pit===pit),used=usedCards(S.you);
 $('shTitle').innerHTML=`${pit?'STAFF':'SPOT '+(i+1)} · <span>${real.name}</span>`;
 $('shSub').textContent=pit?'Swap in a pitcher card you own. Starters bring four pitches, relievers three.':`Sign a hitter card you own into this spot. He plays ${real.pos} here.`;
 $('shOrig').hidden=!real.signed;$('shOrig').textContent=real.signed?`Restore ${origName}`:'';
 $('shMove').hidden=pit;
 const sorted=own.slice().sort((a,b)=>b.o-a.o);
 $('shList').innerHTML=sorted.length?sorted.map(c=>{const q=c.p,T2=c.T||TEAMS[c.k],inUse=used.has(c.id),here=real.signed===c.id;
   const st=c.pit?[['VEL',q.vel],['MOV',q.mov],['CTL',q.ctl],['STA',staOf(q)]]:[['CON',q.con],['POW',q.pow],['SPD',q.spd],['DEF',q.def]];
   return `<button type="button" class="shRow r${c.r}" data-id="${c.id}" ${inUse?'disabled':''}><img alt="" src="${cardLogo(c)}">
    <span class="nm"><b>${q.name}</b><small>${c.set==='bl'?T2.city+' · Big League':T2.city+' '+T2.name} · ${q.pos} · ${RARITY[c.r]}${here?' · IN THIS SPOT':inUse?' · ALREADY SIGNED':''}</small></span>
    <span class="o" style="color:${rcol(c.o)}">${c.o}</span><span class="sts">${st.map(([k,v])=>`<i>${k} <b style="color:${rcol(v)}">${v}</b></i>`).join('')}</span></button>`}).join('')
  :`<p class="shEmpty">No ${pit?'pitcher':'hitter'} cards yet. Buy card packs in the shop to collect players.</p>`;
 $('lnSheet').hidden=false}
function closeSheet(){$('lnSheet').hidden=true;sheetFor=null}
$('shClose').addEventListener('click',closeSheet);
$('lnSheet').addEventListener('click',e=>{if(e.target===$('lnSheet'))closeSheet()});
$('shList').addEventListener('click',e=>{const b=e.target.closest('.shRow');if(!b||b.disabled||!sheetFor)return;
 if(signPlayer(S.you,sheetFor.origName,b.dataset.id,sheetFor.pit)){applyDefense();updateHUD();sfx('glove')}closeSheet();renderCards()});
$('shOrig').addEventListener('click',()=>{if(!sheetFor)return;releasePlayer(S.you,sheetFor.origName,sheetFor.pit);applyDefense();updateHUD();closeSheet();renderCards()});
$('shMove').addEventListener('click',()=>{if(!sheetFor)return;lnSel=sheetFor.i;closeSheet();renderCards();$('lnHint').textContent='Now tap the spot to swap him with.'});
