// ---------- your team: one club brand, one roster you own ----------
// You pick a club once (free): its name, colors, logo and ballpark become yours, and so do its current players. From
// then on the club is a brand: switching to another club later costs coins and changes only the look; your players
// come with you (and the club you take over gets the players you left behind, so nobody is on two teams). You change
// the players themselves on the TEAM screen, by signing cards you own into the lineup.
//   MYTEAM = {club: the brand you play as, base: the club whose roster you own (your first club)}
const MYTEAM=(()=>{try{const m=JSON.parse(localStorage.getItem('pd-myteam')||'null');if(m&&/^[a-z]+$/.test(m.club)&&/^[a-z]+$/.test(m.base))return m}catch(e){}return null})();
const saveMyTeam=()=>{try{localStorage.setItem('pd-myteam',JSON.stringify(MYTEAM))}catch(e){}};
const CLUB_SWITCH_COST=1000;
// every club's own roster exactly as built (before any swap), so either phone online can rebuild anyone's team
const PRISTINE={},BASE_OF={};
if(MYTEAM)S.you=MYTEAM.club;
// right after the rosters are built: remember them, then move your players onto your brand
function myTeamApply(){for(const k of ORDER){const T=TEAMS[k];PRISTINE[k]={L:T.lineup.slice(),P:T.staff.slice()};BASE_OF[k]=k}
 if(!MYTEAM||!TEAMS[MYTEAM.club]||!TEAMS[MYTEAM.base]){if(MYTEAM&&(!TEAMS[MYTEAM.club]||!TEAMS[MYTEAM.base]))MYTEAM.base=MYTEAM.club=TEAMS[MYTEAM.club]?MYTEAM.club:'busan';return}
 const a=TEAMS[MYTEAM.club],b=TEAMS[MYTEAM.base];if(a===b)return;
 for(const f of['lineup','staff','pitcher'])[a[f],b[f]]=[b[f],a[f]];
 BASE_OF[MYTEAM.club]=MYTEAM.base;BASE_OF[MYTEAM.base]=MYTEAM.club}
// your roster as an online roster spec (whatever kit you wear in a room)
const myRosterSpec=()=>rosterSpec(MYTEAM?MYTEAM.club:S.you);
// back home after batting practice or an online room picked another club for a while
function myTeamRestore(){if(MYTEAM&&S.you!==MYTEAM.club){S.you=MYTEAM.club;if(S.opp===S.you)S.opp=ORDER.find(k=>k!==S.you);syncPicker();applyCustom();parkDirty();tsFlush();updateHUD()}}
// ---- choosing (first time, free) or switching (costs coins) your club, on the club-select screen ----
let brandFirst=false,brandArm=0;
function brandOpen(first){brandFirst=!!first;brandArm=0;pendingMode='brand';$('playGo').hidden=false;$('scrTeams').querySelector('.mbtn.back').dataset.go='scrLineup';
 document.querySelector('#scrTeams h1').innerHTML=first?'YOUR CLUB<small>CHOOSE THE CLUB YOU PLAY AS</small>':'CHANGE CLUB<small>YOUR PLAYERS COME WITH YOU</small>';
 showScreen('scrTeams');brandSync()}
function brandSync(){if(pendingMode!=='brand')return;const T=TEAMS[S.you],same=MYTEAM&&S.you===MYTEAM.club;
 $('oppLine').innerHTML=brandFirst?`You get <b>${T.city} ${T.name}</b>: their name, colors, ballpark and current players. You can switch clubs later for ${coinFmt(CLUB_SWITCH_COST)} coins.`
  :same?'This is your club now.':`Play as <b>${T.city} ${T.name}</b> from now on: their name, colors and ballpark. Your players and cards stay with you.`;
 $('playGo').disabled=!brandFirst&&same;
 $('playGo').textContent=brandFirst?`THIS IS MY CLUB`:same?'YOUR CLUB':brandArm?'TAP AGAIN TO CONFIRM':`SWITCH · ${coinFmt(CLUB_SWITCH_COST)} COINS`;
 // the back arrow and Back only exist when you already have a club to go back to
 const card=$('scrTeams');for(const b of card.querySelectorAll(':scope>.xClose,.mbtn.back'))if(b.classList.contains('xClose')||!card.classList.contains('hasX'))b.hidden=brandFirst;
 $('tsOvr').hidden=true}// (a club's rating would describe its players, not yours)
function brandDone(){$('playGo').disabled=false;$('tsOvr').hidden=false;const card=$('scrTeams');for(const b of card.querySelectorAll(':scope>.xClose'))b.hidden=false}
function brandConfirm(){if(brandFirst){try{localStorage.setItem('pd-myteam',JSON.stringify({club:S.you,base:S.you}));localStorage.setItem('pd-club',S.you)}catch(e){}
  track('club_chosen',{club:S.you});pendingMode=null;brandDone();location.reload();return}
 if(S.you===MYTEAM.club)return;
 if(WAL.coins<CLUB_SWITCH_COST){$('oppLine').innerHTML=`Switching clubs costs ${coinFmt(CLUB_SWITCH_COST)} coins. You have ${coinFmt(WAL.coins)}: win some games first.`;return}
 if(!brandArm){brandArm=1;brandSync();clearTimeout(brandConfirm.t);brandConfirm.t=setTimeout(()=>{brandArm=0;brandSync()},4000);return}
 // pay, carry your signed cards to the new club, and rebuild everything around your new brand
 WAL.coins-=CLUB_SWITCH_COST;saveWal();const from=MYTEAM.club,to=S.you;
 if(SIGN[from]){SIGN[to]=SIGN[from];delete SIGN[from];saveSign()}
 track('club_changed',{from,to,cost:CLUB_SWITCH_COST});
 try{localStorage.setItem('pd-myteam',JSON.stringify({club:to,base:MYTEAM.base}));localStorage.setItem('pd-club',to)}catch(e){}
 pendingMode=null;brandDone();location.reload()}
// leaving the club-select screen without switching puts your own club back
function brandCancel(){if(pendingMode!=='brand')return;pendingMode=null;brandDone();if(MYTEAM&&S.you!==MYTEAM.club){S.you=MYTEAM.club;if(S.opp===S.you)S.opp=ORDER.find(k=>k!==S.you);syncPicker();applyCustom();updateHUD();TS.dirty=false}}
// ---- the TEAM screen: your lineup (sign cards into it), plus the inventory and the club switch ----
function teamOpen(from){pregame=false;lnView='mine';lnSel=null;lfFlip=null;$('lnPre').hidden=true;
 document.body.classList.add('lnTeam');$('scrLineup').querySelector('.mbtn.back').dataset.go=from||'scrMain';showScreen('scrLineup')}
$('lnInv').addEventListener('click',()=>invOpen('scrLineup'));
$('lnClub').addEventListener('click',()=>brandOpen(false));
for(const t of document.querySelectorAll('#scrSingle .tile[data-go="scrLineup"]'))t.addEventListener('click',e=>{e.stopImmediatePropagation();teamOpen('scrSingle')},true);
