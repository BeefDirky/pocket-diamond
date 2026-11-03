// ---------- pick a hitter: tap the at-bat panel ----------
function openPicker(){
 if(S.phase==='title'||S.phase==='over'||pitching()||S.online)return;
 const k=batKey(),T=TEAMS[k],cur=(S.orderOf[k]||0),mine=k===S.you,bp=S.mode==='bp';
 const canSwap=bp||(mine&&S.balls===0&&S.strikes===0&&!['pitch','play','call','result'].includes(S.phase));
 $('pickNote').textContent=bp?'Pick who takes batting practice. He stays in until you pick someone else.':!mine?'The visitors are batting. You can only change your own hitters.':canSwap?'Pinch hit: the hitter you pick moves into this lineup spot, and the current hitter takes his spot.':'You can only change hitters before the first pitch of an at-bat.';
 $('pickList').innerHTML=T.lineup.map((p,i)=>`<button type="button" class="pickRow" data-i="${i}" aria-current="${i===cur}" ${(!canSwap||(!bp&&i===cur))&&i!==cur?'disabled':''}><span class="o">${i+1}</span><img alt="" src="${portrait(T,p,k===S.you)}"><span class="n">#${p.no} ${p.name}<small>${p.pos} · Bats ${p.hand}</small></span><span class="r">CON ${rb(p.con)} POW ${rb(p.pow)} SPD ${rb(p.spd)}</span></button>`).join('');
 if(!S.paused)pauseGame();if(!S.paused)return;showScreen('scrPick');
}
$('muBat').addEventListener('click',openPicker);
$('muBat').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPicker()}});
$('muBat').addEventListener('pointerdown',e=>e.stopPropagation());
$('pickList').addEventListener('click',e=>{const b=e.target.closest('.pickRow');if(!b||b.disabled)return;const k=batKey(),T=TEAMS[k],i=+b.dataset.i,cur=S.orderOf[k]||0;
 if(i!==cur){if(S.mode==='bp')S.orderOf[k]=i;else{const t=T.lineup[cur];T.lineup[cur]=T.lineup[i];T.lineup[i]=t;logPA(T.lineup[cur],`Pinch hitting for ${t.name}`,false)}}
 resumeGame();updateHUD()});
$('pickBack').addEventListener('click',resumeGame);
let parkFromBP=false;
$('parkBtn').addEventListener('pointerdown',e=>e.stopPropagation());
$('parkBtn').addEventListener('click',e=>{e.stopPropagation();if(!S.paused)pauseGame();if(!S.paused)return;parkFromBP=true;
 document.querySelector('#scrTeams h1').innerHTML='BATTING PRACTICE · <span>CHANGE PARK</span>';$('playGo').hidden=false;$('playGo').textContent='BACK TO THE CAGE';
 $('oppLine').textContent='Pick a club: you hit in their park, with their hitters.';showScreen('scrTeams');
 $('playGo').hidden=false;$('playGo').textContent='BACK TO THE CAGE'});
function backToCage(){parkFromBP=false;$('playGo').hidden=true;setSides();S.orderOf[S.you]=S.orderOf[S.you]||0;S.bpBalls=[];S.bpFly=[];S.walkUp=null;resumeGame();updateHUD()}

