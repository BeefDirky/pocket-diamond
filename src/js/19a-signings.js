// ---------- signings: put any card you own into your club's lineup or staff ----------
// A signed player takes over a lineup spot (keeping that spot's position) or a staff slot. Saved per club.
// Online, each side sends its full roster spec in the lobby so both phones field identical teams.
let SIGN={};try{SIGN=JSON.parse(localStorage.getItem('pd-signings')||'{}')||{}}catch(e){SIGN={}}
const saveSign=()=>{try{localStorage.setItem('pd-signings',JSON.stringify(SIGN))}catch(e){}};
function snapOrig(){for(const k of ORDER){const T=TEAMS[k];if(!T.orig)T.orig={L:T.lineup.slice(),P:T.staff.slice()}}}
function signClone(c,base){const p=c.p,q={name:p.name,hand:p.hand,thr:p.thr||p.hand,pos:base.pos,natPos:p.pos,no:base.no,signed:c.id,
  con:p.con,pow:p.pow,spd:p.spd,def:p.def==null?60:p.def,vel:p.vel,mov:p.mov,ctl:p.ctl,slot:p.slot||'over',type:p.type,bat:p.bat||base.bat||'#d9b07a'};
 if(p.skin)SKIN_OVR[q.name]=p.skin;if(c.pit)q.ars=arsFor({...q,pos:base.pos},c.code||c.k);return q}
// where does the original player for this slot live now (lineup order can be shuffled)
function slotOf(T,orig,pit){const arr=pit?T.staff:T.lineup;return arr.findIndex(p=>p===orig||(p.signedFor===orig.name))}
function signPlayer(k,origName,cardId,pit,save){const T=TEAMS[k],arr=pit?T.staff:T.lineup,orig=(pit?T.orig.P:T.orig.L).find(p=>p.name===origName),c=CARD_BY[cardId];
 if(!orig||!c||c.pit!==pit)return false;const i=slotOf(T,orig,pit);if(i<0)return false;
 const q=signClone(c,orig);q.signedFor=orig.name;if(arr[i].custom){T.benched=q}else arr[i]=q;
 if(save!==false){(SIGN[k]=SIGN[k]||{})[(pit?'P:':'L:')+origName]=cardId;saveSign()}return true}
function releasePlayer(k,origName,pit){const T=TEAMS[k],arr=pit?T.staff:T.lineup,orig=(pit?T.orig.P:T.orig.L).find(p=>p.name===origName);if(!orig)return;
 const i=slotOf(T,orig,pit);if(i>=0){if(arr[i].custom)T.benched=orig;else arr[i]=orig}
 if(SIGN[k]){delete SIGN[k][(pit?'P:':'L:')+origName];saveSign()}}
function applySignings(){snapOrig();for(const k in SIGN){if(!TEAMS[k])continue;for(const key in SIGN[k]){const pit=key[0]==='P',nm=key.slice(2),id=SIGN[k][key];
   if(!CARD_BY[id]||!COL.owned[id]){delete SIGN[k][key];continue}signPlayer(k,nm,id,pit,false)}}saveSign()}
const usedCards=k=>new Set([...TEAMS[k].lineup,...(TEAMS[k].benched?[TEAMS[k].benched]:[]),...TEAMS[k].staff].filter(p=>p&&p.signed).map(p=>p.signed));
// ---- online roster spec ----
function rosterSpec(k){const T=TEAMS[k],ent=p=>{if(p.custom)p=T.benched||p;return p.signed?['c',p.signed,p.signedFor]:['n',p.name]};return{L:T.lineup.map(ent),P:T.staff.map(ent)}}
function applyRosterSpec(k,spec){if(!spec||!spec.L||!spec.P)return;snapOrig();const T=TEAMS[k];if(!T.netBackup)T.netBackup={L:T.lineup.slice(),P:T.staff.slice()};
 const build=(list,origs,pit)=>list.map(e=>{const base=origs.find(p=>p.name===(e[0]==='c'?e[2]:e[1]))||origs[0];if(e[0]==='c'&&CARD_BY[e[1]]){const q=signClone(CARD_BY[e[1]],base);q.signedFor=base.name;return q}return base});
 T.lineup=build(spec.L,T.orig.L,false);T.staff=build(spec.P,T.orig.P,true)}
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
   const st=c.pit?[['VEL',q.vel],['MOV',q.mov],['CTL',q.ctl]]:[['CON',q.con],['POW',q.pow],['SPD',q.spd],['DEF',q.def]];
   return `<button type="button" class="shRow r${c.r}" data-id="${c.id}" ${inUse?'disabled':''}><img alt="" src="${c.set==='bl'?blLogo(c.code):LOGO_URL[c.k]}">
    <span class="nm"><b>${q.name}</b><small>${c.set==='bl'?T2.city+' · Big League':T2.city+' '+T2.name} · ${q.pos} · ${RARITY[c.r]}${here?' · IN THIS SPOT':inUse?' · ALREADY SIGNED':''}</small></span>
    <span class="o" style="color:${rcol(c.o)}">${c.o}</span><span class="sts">${st.map(([k,v])=>`<i>${k} <b style="color:${rcol(v)}">${v}</b></i>`).join('')}</span></button>`}).join('')
  :`<p class="shEmpty">No ${pit?'pitcher':'hitter'} cards yet. Open card packs to collect players.</p>`;
 $('lnSheet').hidden=false}
function closeSheet(){$('lnSheet').hidden=true;sheetFor=null}
$('shClose').addEventListener('click',closeSheet);
$('lnSheet').addEventListener('click',e=>{if(e.target===$('lnSheet'))closeSheet()});
$('shList').addEventListener('click',e=>{const b=e.target.closest('.shRow');if(!b||b.disabled||!sheetFor)return;
 if(signPlayer(S.you,sheetFor.origName,b.dataset.id,sheetFor.pit)){applyDefense();updateHUD();sfx('glove')}closeSheet();renderCards()});
$('shOrig').addEventListener('click',()=>{if(!sheetFor)return;releasePlayer(S.you,sheetFor.origName,sheetFor.pit);applyDefense();updateHUD();closeSheet();renderCards()});
$('shMove').addEventListener('click',()=>{if(!sheetFor)return;lnSel=sheetFor.i;closeSheet();renderCards();$('lnHint').textContent='Now tap the spot to swap him with.'});
