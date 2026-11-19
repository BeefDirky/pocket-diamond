/* ---------- TEAM VS TEAM: a short intro before the first pitch (single player) ----------
   Your club slides in from the left, the opponent from the right, VS slams down between them, then each side's
   batting order and starting pitcher drop in. About four and a half seconds; a tap or any key skips it. The game
   holds on its "PLAY BALL" beat until the intro is gone. (Online games skip it: both phones have to stay in step.) */
const VSI={on:false,t:[],key:null};
function vsSide(k,cls){const T=TEAMS[k],r=teamRating(k),sp=(T.staff||[T.pitcher])[0];
 const rows=T.lineup.map((p,i)=>`<li style="--d:${i}"><b>${i+1}</b><span class="vsNm">${esc(p.name)}</span><i>${p.pos}</i><em>${ovr(p)}</em></li>`).join('');
 return `<div class="vsSide ${cls}" style="--tj:${T.jersey};--tc:${T.cap}">
  <div class="vsHead"><img src="${LOGO_URL[k]||''}" alt=""><div><small>${esc(T.city)}</small><b>${esc(T.name)}</b></div><span class="vsOvr"><small>OVR</small>${r.ovr}</span></div>
  <div class="vsSp"><small>STARTER</small><b>#${sp.no} ${esc(sp.name)}</b><span>${sp.hand}HP · VEL ${sp.vel} · MOV ${sp.mov} · CTL ${sp.ctl}</span></div>
  <ol class="vsLine">${rows}</ol></div>`}
function vsIntro(){if(onlineGame()||S.mode==='bp'||!TEAMS[S.you]||!TEAMS[S.opp])return;const el=$('vsIntro');if(!el)return;
 /* on PC the batter and pitcher panels float above the park, so the intro covers the whole window instead */
 const desk=!!document.querySelector('.app.deskApp:not(.phoneLand)'),home=desk?document.body:$('stage');if(el.parentNode!==home)home.appendChild(el);el.classList.toggle('vsFull',desk);
 vsEnd(true);S.vsHold=true;VSI.on=true;
 el.innerHTML=`${vsSide(S.you,'you')}<div class="vsMid"><b>VS</b></div>${vsSide(S.opp,'opp')}<p class="vsSkip">TAP TO SKIP</p>`;
 // wait for the loading screen to lift, then play
 const t0=performance.now(),go=()=>{if(!VSI.on)return;const L=$('loadScr');if(L&&!L.hidden&&performance.now()-t0<2500){VSI.t.push(setTimeout(go,80));return}
  el.hidden=false;el.classList.remove('out','go');void el.offsetWidth;el.classList.add('go');try{playSample('woosh',.55)}catch(e){}
  VSI.t.push(setTimeout(()=>{try{playSample('woosh',.4,1.3)}catch(e){}},330));
  VSI.t.push(setTimeout(()=>vsEnd(),4300))};
 go()}
function vsEnd(now){for(const t of VSI.t)clearTimeout(t);VSI.t=[];const el=$('vsIntro'),was=VSI.on;VSI.on=false;S.vsHold=false;if(!el)return;
 if(now||el.hidden){el.hidden=true;el.classList.remove('go','out');return}
 if(was){el.classList.add('out');VSI.t.push(setTimeout(()=>{el.hidden=true;el.classList.remove('go','out')},320))}}
$('vsIntro').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();vsEnd()});
addEventListener('keydown',e=>{if(!VSI.on)return;e.stopImmediatePropagation();e.preventDefault();vsEnd()},true);
