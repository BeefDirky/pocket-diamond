// ---------- game history: every game you finish, newest first (kept on this device and in your account's save) ----------
// Recorded at game over: mode, both clubs, the score from your side, the line score, a few stats, and for online games the
// opponent's username. Ranked games get their rating change filled in when the server's answer comes back.
const HIST_KEY='pd-history',HIST_MAX=150;
const HIST_MODES={arcade:'ARCADE',full:'FULL GAME',playoffs:'PLAYOFFS',ranked:'RANKED',ranked_bot:'RANKED',custom:'CUSTOM',friends_po:'FRIENDS PLAYOFF'};
const HIST_TABS=[['all','ALL'],['arcade','ARCADE'],['full','FULL'],['playoffs','PLAYOFFS'],['ranked','RANKED'],['online','FRIENDS']];
function histGet(){try{const h=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');return Array.isArray(h)?h:[]}catch(e){return[]}}
function histPut(h){try{localStorage.setItem(HIST_KEY,JSON.stringify(h.slice(0,HIST_MAX)));if(typeof accDirty==='function')accDirty()}catch(e){}}
function histRecord(win,onl){try{const o=S.online,home=onl&&o&&o.me==='home';
  const m=S.rkBot?'ranked_bot':onl&&o&&rkOn(o)?'ranked':(onl&&o&&o.tn)||S.tnGame?'friends_po':onl?'custom':S.poGame?'playoffs':S.mode==='arcade'?'arcade':'full';
  const mine=onl?(home?S.you:S.opp):S.you,theirs=onl?(home?S.opp:S.you):S.opp;
  const my=onl?(home?S.runs:S.target):S.runs,th=onl?(home?S.target:S.runs):S.target;
  const ln=a=>Array.isArray(a)?a.map(x=>x==null?null:+x):null,yl=ln(S.youLine),ol=ln(S.oppLine);
  const e={t:Date.now(),m,w:!!win,my,th,club:mine,opp:theirs,inn:S.inning||null,
   vs:S.rkBot?`CPU · LEVEL ${S.rkBot.lv||''}`.trim():onl&&o&&o.opp?(o.opp.acct||null):null,
   ln:onl?(home?[yl,ol]:[ol,yl]):[yl,ol],h:S.hits|0,hr:S.hr|0,k:(S.mode==='full'||onl?S.myK:S.ks)|0,
   gid:S.rkBot?S.rkBot.m:null};
  const h=histGet();h.unshift(e);histPut(h)}catch(err){}}
/* a ranked result arrived: put the rating change on that game */
function histRating(delta,gid){const h=histGet(),e=h.find(x=>gid&&x.gid===gid)||h.find(x=>(x.m==='ranked'||x.m==='ranked_bot')&&Date.now()-x.t<10*60e3&&x.rd==null);if(!e||delta==null)return;e.rd=Math.round(delta);histPut(h)}
let histTab='all',histOpen=null;
function histOpenScreen(back){$('scrHist').querySelector('.mbtn.back').dataset.go=back||'scrMain';histTab='all';histOpen=null;showScreen('scrHist');histRender()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-hist]');if(b){histOpenScreen(b.dataset.hist)}});
function histFilter(h){return histTab==='all'?h:histTab==='ranked'?h.filter(x=>x.m==='ranked'||x.m==='ranked_bot'):histTab==='online'?h.filter(x=>x.m==='custom'||x.m==='friends_po'):h.filter(x=>x.m===histTab)}
function histWhen(t){const d=new Date(t),now=new Date(),day=86400e3,dd=Math.floor((new Date(now.toDateString())-new Date(d.toDateString()))/day);
 const tm=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});return dd===0?`TODAY · ${tm}`:dd===1?`YESTERDAY · ${tm}`:`${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})} · ${tm}`}
function histRender(){const all=histGet(),h=histFilter(all);
 const W=h.filter(x=>x.w).length,L=h.length-W;let streak=0,sw=null;for(const x of h){if(sw==null)sw=x.w;if(x.w!==sw)break;streak++}
 $('hsSum').innerHTML=`<div><b>${h.length}</b><span>GAMES</span></div><div><b>${W}-${L}</b><span>RECORD</span></div><div><b>${h.length?Math.round(W/h.length*100):0}%</b><span>WIN RATE</span></div><div><b class="${sw?'w':'l'}">${h.length?`${sw?'W':'L'}${streak}`:'—'}</b><span>STREAK</span></div>`;
 $('hsTabs').innerHTML=HIST_TABS.map(([k,n])=>`<button type="button" data-ht="${k}" aria-pressed="${histTab===k}">${n}</button>`).join('');
 if(!h.length){$('hsList').innerHTML=`<li class="hsEmpty">${all.length?'No games of this kind yet.':'No games yet. Finish a game and it shows up here.'}</li>`;return}
 $('hsList').innerHTML=h.slice(0,100).map((x,i)=>{const id=x.t,open=histOpen===id,me=TEAMS[x.club],op=TEAMS[x.opp];
  const name=x.vs?esc(x.vs):op?`${op.city} ${op.name}`:'';
  const rd=x.rd!=null?`<span class="hsRd ${x.rd>=0?'w':'l'}">${x.rd>=0?'+':''}${x.rd}</span>`:'';
  return `<li class="hsRow${x.w?' w':' l'}${open?' open':''}"><button type="button" class="hsMain" data-hi="${id}">
   <span class="hsWL">${x.w?'W':'L'}</span>
   <span class="hsWho"><small>${HIST_MODES[x.m]||x.m} · ${histWhen(x.t)}</small><b>${op?`<img alt="" src="${LOGO_URL[x.opp]||''}">`:''}vs ${name}</b></span>
   <span class="hsSc"><b>${x.my}-${x.th}</b>${rd}</span></button>${open?histDetail(x,me,op):''}</li>`}).join('')}
function histDetail(x,me,op){const[a,b]=x.ln||[];const n=Math.max((a||[]).length,(b||[]).length,x.inn||0);let line='';
 if(n&&(a||b)){const cells=r=>Array.from({length:n},(_,i)=>`<td>${r&&r[i]!=null?r[i]:'–'}</td>`).join('');
  line=`<table class="hsLine"><tr><th></th>${Array.from({length:n},(_,i)=>`<th>${i+1}</th>`).join('')}<th>R</th></tr>
   <tr><td class="hsT">${me?esc(me.name):'YOU'}</td>${cells(a)}<td class="hsR">${x.my}</td></tr><tr><td class="hsT">${op?esc(op.name):'THEM'}</td>${cells(b)}<td class="hsR">${x.th}</td></tr></table>`}
 return `<div class="hsMore">${line}<div class="hsStats"><span><b>${x.h}</b> HITS</span><span><b>${x.hr}</b> HR</span><span><b>${x.k}</b> K</span>${me?`<span>AS ${esc(me.city+' '+me.name)}</span>`:''}</div></div>`}
$('hsTabs').addEventListener('click',e=>{const b=e.target.closest('[data-ht]');if(!b)return;histTab=b.dataset.ht;histOpen=null;histRender()});
$('hsList').addEventListener('click',e=>{const b=e.target.closest('[data-hi]');if(!b)return;const id=+b.dataset.hi;histOpen=histOpen===id?null:id;histRender()});
