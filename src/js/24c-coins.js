// ---------- coins: the in-game currency ----------
// Earned by winning and by hitting home runs; a full game (including playoff and online games) pays much more than a
// 3-inning arcade game. Batting practice pays nothing, a home run hit while AUTO is batting for you doesn't count, and a
// simulated game (AUTO played every plate appearance) pays nothing at all.
// Saved as pd-wallet with the rest of the progress, so it follows a signed-in account. Daily challenges come later.
const COIN={win:{full:100,arcade:20},hr:{full:10,arcade:4}};
let WAL={coins:0,earned:0};
try{const v=JSON.parse(localStorage.getItem('pd-wallet')||'null');if(v&&typeof v==='object')WAL={coins:Math.max(0,v.coins|0),earned:Math.max(0,v.earned|0)}}catch(e){}
const saveWal=()=>{try{localStorage.setItem('pd-wallet',JSON.stringify(WAL))}catch(e){}};
const coinFmt=n=>n.toLocaleString('en-US');
const coinMode=()=>S.mode==='full'?'full':S.mode==='arcade'?'arcade':null;
function coinUI(){const el=$('coinBal');if(el)el.querySelector('b').textContent=coinFmt(WAL.coins)}
function coinAdd(n,why){if(!(n>0))return;track('coins_earned',{amount:n,why,mode:S.mode});WAL.coins+=n;WAL.earned+=n;saveWal();coinUI();S.coinGame=S.coinGame||{};S.coinGame[why]=(S.coinGame[why]||0)+n}
function coinPop(txt){const el=$('coinPop');if(!el)return;el.textContent=txt;el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');
 clearTimeout(coinPop.t);coinPop.t=setTimeout(()=>{el.hidden=true},1700)}
function coinHR(){const m=coinMode();if(!m||S.auto)return;const n=COIN.hr[m];coinAdd(n,'hr');coinPop(`+${n} COINS`)}
/* a simulated game (every plate appearance played by AUTO, e.g. watching CPU vs CPU) pays nothing */
const coinSim=()=>{const m=typeof ML!=='undefined'&&ML;return !!(m&&m.pa&&m.pa.length&&!m.pa.some(c=>!c.auto))};
function coinGameOver(win){const m=coinMode(),sim=coinSim();if(m&&win&&!sim)coinAdd(COIN.win[m],'win');
 const g=S.coinGame||{},tot=(g.win||0)+(g.hr||0),el=$('coinEarn');if(!el)return;
 const parts=[];if(g.win)parts.push(`win +${g.win}`);if(g.hr)parts.push(`home runs +${g.hr}`);
 el.innerHTML=tot?`<i class="coinIc"></i>+${coinFmt(tot)} coins · ${parts.join(' · ')} · <b>${coinFmt(WAL.coins)}</b> total`:`<i class="coinIc"></i>${sim?'No coins for simulated games':'No coins this game · win or homer to earn'} · <b>${coinFmt(WAL.coins)}</b> total`;el.hidden=false}
coinUI();
