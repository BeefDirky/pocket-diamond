// ---------- who's online right now, and the inactivity forfeit ----------
// Every open copy of the game (on a build with the server) sits in one presence channel and says what it's doing:
// on the menus (m), in the ranked queue (q) or in an online game (g). The queue's estimate uses those counts.
const LIVE={ch:null,n:0,q:0,g:0,s:null};
async function liveJoin(){if(LIVE.ch||LIVE.joining||!supaOK())return;LIVE.joining=true;
 try{const c=await supaClient(),ch=c.channel('pd-live',{config:{presence:{key:'p'+Math.random().toString(36).slice(2,10)}}});
  ch.on('presence',{event:'sync'},()=>{try{const st=ch.presenceState();let n=0,q=0,g=0;
   for(const k in st){const m=(st[k]&&st[k][0])||{};n++;if(m.s==='q')q++;else if(m.s==='g')g++}LIVE.n=n;LIVE.q=q;LIVE.g=g;if(Q.on)qEst()}catch(e){}});
  ch.subscribe(s=>{if(s==='SUBSCRIBED'){LIVE.ch=ch;LIVE.s=null;liveSay()}})}catch(e){LIVE.joining=false}}
function liveSay(){if(!LIVE.ch)return;const s=Q.on?'q':onlineGame()?'g':'m';if(LIVE.s===s)return;LIVE.s=s;try{const r=LIVE.ch.track({s,v:PD_VER});if(r&&r.catch)r.catch(()=>{})}catch(e){}}
setTimeout(liveJoin,3000);setInterval(liveSay,2000);
// the estimate: someone else already waiting → any moment; otherwise the more people on the menus, the shorter the
// wait (blended with how long recent waits actually took, when the server has enough of them)
function qEstSecs(){const others=Math.max((Q.n|0)-1,(LIVE.q|0)-1,0);if(others>0)return 5;
 const idle=LIVE.ch?Math.max(0,LIVE.n-LIVE.q-LIVE.g):null;if(idle===0)return Q.est!=null?Q.est:null;
 const byIdle=idle==null?null:clamp(Math.round(180/idle),10,300);
 return byIdle!=null&&Q.est!=null?Math.round((byIdle+Q.est)/2):byIdle!=null?byIdle:Q.est}
function qEst(r){if(r&&r.queue==='waiting'){Q.est=r.est_secs==null?null:r.est_secs;Q.n=r.waiting|0}
 const el=$('qEst');if(!el)return;const est=qEstSecs(),left=est==null?null:est-(Date.now()-Q.t0)/1000;
 const who=LIVE.ch?`${LIVE.n} ONLINE · ${Math.max(LIVE.q,Q.n|0)} IN QUEUE · `:'';
 el.textContent=who+(est==null?(LIVE.ch&&LIVE.n-LIVE.q-LIVE.g<=0?'NO ONE ELSE IS ON RIGHT NOW':'EST. WAIT: UNKNOWN'):left>0?`EST. WAIT ~${fmtClock(Math.ceil(left))}`:'EST. WAIT ANY MOMENT NOW')}
// ---- inactivity: in an online game without AUTO, a minute with no input brings a warning and a 30-second
// countdown; if it runs out, you forfeit (the game keeps going while you're on another tab or app) ----
const AFK={last:0,warn:false,T:0},AFK_IDLE=60,AFK_GRACE=30;
for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,e=>{if(!e.isTrusted)return;AFK.last=Date.now();if(AFK.warn){AFK.warn=false;$('afk').hidden=true}},{capture:true,passive:true});
function afkTick(){const o=S.online,on=onlineGame()&&!S.olAuto&&S.phase!=='over'&&$('over').hidden;
 if(!on){AFK.last=Date.now();if(AFK.warn){AFK.warn=false;$('afk').hidden=true}return}
 if(!AFK.last)AFK.last=Date.now();const idle=(Date.now()-AFK.last)/1000;
 if(idle<AFK_IDLE){if(AFK.warn){AFK.warn=false;$('afk').hidden=true}return}
 const left=Math.ceil(AFK_IDLE+AFK_GRACE-idle);
 if(!AFK.warn){AFK.warn=true;$('afk').hidden=false;try{sfx('glove')}catch(e){}track('afk_warned',{ranked:!!o.ranked})}
 $('afkT').textContent=`FORFEIT IN ${fmtClock(Math.max(0,left))}`;
 if(left<=0){AFK.warn=false;$('afk').hidden=true;track('afk_forfeit',{ranked:!!o.ranked});olForfeit(o,'You were inactive for 90 seconds.')}}
setInterval(afkTick,500);
// you forfeit (the menu's Forfeit/Leave, or inactivity): ranked tells the server at once, so your opponent wins
// right away instead of waiting out their countdown; you land on the results card
function olForfeit(o,why){if(!o)return;if(o.ranked&&o.rk){rkStop();rpc('ranked_concede',{p_match:o.rk.m}).then(info=>{if(S.online===o)rkResult(info)}).catch(()=>{})}
 olEndScreen(o,'FORFEITED',why)}
