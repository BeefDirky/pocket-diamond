/* ---------- opening a pack (Pokémon TCG Pocket style) ----------
   1. The sealed pack floats in the middle of the screen. Swipe across its top edge to cut it open (a glowing line follows
      your finger; let go too early and it closes up again). Space / Enter cuts it for you.
   2. The top strip flies off, the wrapper drops away, and the cards sit in a stack. The top card is face up: swipe it
      away (or tap) to see the next. Epic and Legend cards wait face down with their colour glowing round the edge:
      tap to turn them over (Legends get the full light show).
   3. All the cards are laid out together, NEW ones marked; open another or finish.
   The cards were already added to your collection when the pack was opened; this is only how you see them. */
const PKO={on:false,stage:'',set:'fa',got:[],fresh:[],paid:false,i:0,cut:null,drag:null,t:[]};
const pkoEl=()=>$('pko');
function pkoSay(t){const h=$('pkoHint');if(h)h.textContent=t}
function pkoLater(fn,ms){PKO.t.push(setTimeout(fn,ms))}
function pkoClear(){for(const t of PKO.t)clearTimeout(t);PKO.t=[]}
/* the pack as two canvases: the top strip (cut off) and the body */
function pkoPackHTML(){return `<div class="pkoPack" id="pkoPack"><canvas class="pkoTop" id="pkoTop" width="40" height="9"></canvas><canvas class="pkoBody" id="pkoBody" width="40" height="47"></canvas>
 <div class="pkoLine" id="pkoLine"><i class="pkoGuide"></i><i class="pkoTrail" id="pkoTrail"></i></div></div>`}
function pkoDrawPack(set){const src=document.createElement('canvas');drawPack(src,set);
 const t=$('pkoTop').getContext('2d'),b=$('pkoBody').getContext('2d');t.clearRect(0,0,40,9);b.clearRect(0,0,40,47);t.drawImage(src,0,0,40,9,0,0,40,9);b.drawImage(src,0,9,40,47,0,0,40,47)}
function pkoShow(set,got,fresh,paid){const el=pkoEl();if(!el)return;pkoClear();
 if(el.parentNode!==document.body)document.body.appendChild(el);
 Object.assign(PKO,{on:true,stage:'pack',set,got,fresh,paid,i:0,cut:null,drag:null});
 const best=Math.max(...got.map(c=>c.r));el.dataset.best=best;el.className='pko';
 el.innerHTML=`<div class="pkoRays"></div><button type="button" class="pkoSkip" id="pkoSkip">SKIP ▸</button>
  <div class="pkoStage" id="pkoStage">${pkoPackHTML()}<div class="pkoStack" id="pkoStack"></div></div>
  <div class="pkoFoot"><b id="pkoCount"></b><span id="pkoHint"></span></div>`;
 pkoDrawPack(set);el.hidden=false;void el.offsetWidth;el.classList.add('in');
 pkoSay(matchMedia('(pointer:fine)').matches?'DRAG ACROSS THE TOP OF THE PACK TO OPEN IT':'SWIPE ACROSS THE TOP OF THE PACK TO OPEN IT');
 try{sfx('woosh')}catch(e){}}
/* ---- 1. cut the pack open ---- */
function pkoCutAt(x){const p=$('pkoPack').getBoundingClientRect(),c=PKO.cut;const u=(x-p.left)/p.width;
 c.lo=Math.min(c.lo,u);c.hi=Math.max(c.hi,u);const lo=Math.max(0,c.lo),hi=Math.min(1,c.hi);
 const tr=$('pkoTrail');tr.style.left=(lo*100)+'%';tr.style.width=Math.max(0,(hi-lo)*100)+'%';
 if(hi-lo>=.78)pkoOpen()}
function pkoOpen(){if(PKO.stage!=='pack')return;PKO.stage='opening';PKO.cut=null;const el=pkoEl();
 const tr=$('pkoTrail');tr.style.left='0';tr.style.width='100%';el.classList.add('cut');pkoSay('');
 try{sfx('woosh')}catch(e){}try{navigator.vibrate&&navigator.vibrate(20)}catch(e){}
 pkoBuildStack();
 pkoLater(()=>{el.classList.add('opened')},420);
 pkoLater(()=>{PKO.stage='stack';pkoTop()},1150)}
/* ---- 2. the stack ---- */
function pkoCardScale(){const w=Math.min(innerWidth*.64,300),h=innerHeight*.58;return Math.max(.8,Math.min(w/170,h/300,1.9))}
function pkoBuildStack(){const S0=$('pkoStack'),sc=pkoCardScale();S0.style.setProperty('--s',sc);
 S0.innerHTML=PKO.got.map((c,i)=>{const down=c.r>=2;return `<div class="pkoCard r${c.r}${down?' down':''}" data-i="${i}" style="--z:${PKO.got.length-i};--k:${i}">
  <div class="pkoIn"><div class="pkoBack"><span>POCKET<br>DIAMOND<br>★</span></div><div class="pkoFront">${cardHTML(c,{isNew:PKO.fresh[i],noCount:true})}</div></div><i class="pkoBurst"></i></div>`}).join('')}
const pkoCur=()=>document.querySelector(`#pkoStack .pkoCard[data-i="${PKO.i}"]`);
function pkoTop(){const n=PKO.got.length,c=pkoCur();$('pkoCount').textContent=n>1?`${PKO.i+1} / ${n}`:'';
 for(const x of document.querySelectorAll('#pkoStack .pkoCard:not(.gone)')){x.classList.toggle('top',x===c);x.style.setProperty('--d',Math.max(0,+x.dataset.i-PKO.i))}
 if(!c){pkoSummary();return}
 pkoEl().dataset.next=PKO.got[PKO.i].r;
 pkoSay(c.classList.contains('down')?(PKO.got[PKO.i].r===3?'SOMETHING SPECIAL… TAP TO REVEAL':'TAP TO REVEAL'):n>1?(PKO.i<n-1?'SWIPE OR TAP FOR THE NEXT CARD':'SWIPE OR TAP TO FINISH'):'TAP TO CONTINUE')}
function pkoReveal(c){if(c.classList.contains('turning'))return;const r=PKO.got[PKO.i].r;c.classList.add('turning');const el=pkoEl();
 /* a Legend shakes and glows brighter for a moment before it turns over */
 const flip=()=>c.classList.remove('down','charge');if(r===3){c.classList.add('charge');pkoLater(flip,520)}else flip();
 pkoLater(()=>{c.classList.remove('turning');c.classList.add('shown');el.classList.add(r===3?'legend':'epic');
  try{sfx(r>=2?'bigcheer':'glove')}catch(e){}if(r===3){try{playSample('fworks',.6)}catch(e){}try{navigator.vibrate&&navigator.vibrate([30,40,30])}catch(e){}}
  pkoLater(()=>el.classList.remove('epic','legend'),r===3?2600:1400);pkoTop()},r===3?1040:520)}
function pkoNext(dir){const c=pkoCur();if(!c||c.classList.contains('down')||c.classList.contains('turning'))return;
 c.classList.add('gone');c.style.transform=`translate(${dir*150}vw,-8vh) rotate(${dir*24}deg) scale(var(--s))`;try{sfx('glove')}catch(e){}
 PKO.i++;pkoLater(()=>c.remove(),480);pkoTop()}
/* ---- 3. the spread ---- */
function pkoSummary(){if(PKO.stage==='summary')return;PKO.stage='summary';pkoClear();const el=pkoEl(),got=PKO.got,best=Math.max(...got.map(c=>c.r));
 const left=COL.packs,cost=PACK_COST[PKO.set],canBuy=PKO.paid&&WAL.coins>=cost;
 el.classList.add('sum');el.classList.remove('cut','opened','epic','legend');
 $('pkoStage').innerHTML=`<div class="pkoSum"><h3>${best===3?'LEGEND PULL!':best===2?'EPIC PULL!':'PACK OPENED'}</h3>
  <div class="pkoSpread">${got.map((c,i)=>`<div class="pkoDeal" style="--k:${i}">${cardHTML(c,{isNew:PKO.fresh[i],noCount:true})}</div>`).join('')}</div>
  <p class="pkoNew">${PKO.fresh.filter(Boolean).length?`${PKO.fresh.filter(Boolean).length} new card${PKO.fresh.filter(Boolean).length>1?'s':''} for your collection`:'All duplicates: spend them to level players up'}</p>
  <div class="pkoBtns">${!PKO.paid&&left>0?`<button type="button" class="mbtn" id="pkoAgain">OPEN ANOTHER · ${left} LEFT</button>`:canBuy?`<button type="button" class="mbtn" id="pkoBuy">BUY ANOTHER · ${coinFmt(cost)}</button>`:''}<button type="button" class="big" id="pkoDone">DONE</button></div></div>`;
 $('pkoCount').textContent='';pkoSay('');$('pkoSkip').hidden=true}
function pkoClose(){pkoClear();PKO.on=false;const el=pkoEl();if(!el)return;el.classList.add('out');pkoLater(()=>{el.hidden=true;el.className='pko';el.innerHTML=''},260);renderBinder();shopRender()}
/* ---- input ---- */
function pkoPointerDown(e){if(!PKO.on)return;const t=e.target;
 if(t.closest('#pkoSkip')||t.closest('.pkoBtns'))return;
 if(PKO.stage==='pack'){const p=$('pkoPack').getBoundingClientRect();
  /* the cut starts anywhere along the top of the pack (a generous band, a little outside it too) */
  if(e.clientY<p.top-30||e.clientY>p.top+p.height*.42||e.clientX<p.left-40||e.clientX>p.right+40)return;
  const u=(e.clientX-p.left)/p.width;PKO.cut={pid:e.pointerId,lo:u,hi:u};pkoEl().classList.add('cutting');e.preventDefault();return}
 if(PKO.stage==='stack'){const c=pkoCur();if(!c)return;PKO.drag={pid:e.pointerId,x:e.clientX,y:e.clientY,dx:0,c};e.preventDefault()}}
function pkoPointerMove(e){if(!PKO.on)return;
 if(PKO.cut&&e.pointerId===PKO.cut.pid){pkoCutAt(e.clientX);return}
 const d=PKO.drag;if(d&&e.pointerId===d.pid&&!d.c.classList.contains('down')){d.dx=e.clientX-d.x;d.c.classList.add('drag');d.c.style.transform=`translate(${d.dx}px,${Math.abs(d.dx)*-.05}px) rotate(${d.dx/18}deg) scale(var(--s))`}}
function pkoPointerUp(e){if(!PKO.on)return;
 if(PKO.cut&&e.pointerId===PKO.cut.pid){PKO.cut=null;pkoEl().classList.remove('cutting');const tr=$('pkoTrail');if(tr&&PKO.stage==='pack'){tr.style.width='0';pkoSay('ALMOST! SWIPE ALL THE WAY ACROSS THE TOP')}return}
 const d=PKO.drag;if(!d||e.pointerId!==d.pid)return;PKO.drag=null;d.c.classList.remove('drag');
 if(d.c.classList.contains('down')){if(Math.abs(e.clientX-d.x)<12)pkoReveal(d.c);return}
 if(Math.abs(d.dx)>70)pkoNext(Math.sign(d.dx));else if(Math.abs(d.dx)<10)pkoNext(-1);else d.c.style.transform=''}
addEventListener('pointerdown',pkoPointerDown,{passive:false});
addEventListener('pointermove',e=>{if(PKO.on&&(PKO.cut||PKO.drag))e.preventDefault();pkoPointerMove(e)},{passive:false});
addEventListener('pointerup',pkoPointerUp);addEventListener('pointercancel',e=>{if(PKO.cut&&e.pointerId===PKO.cut.pid){PKO.cut=null;const tr=$('pkoTrail');if(tr)tr.style.width='0'}if(PKO.drag){PKO.drag.c.style.transform='';PKO.drag=null}});
document.addEventListener('click',e=>{if(!PKO.on)return;
 if(e.target.closest('#pkoSkip')){for(const c of document.querySelectorAll('#pkoStack .pkoCard'))c.classList.remove('down');pkoSummary();return}
 if(e.target.closest('#pkoDone')){pkoClose();return}
 if(e.target.closest('#pkoAgain')){const s=PKO.set;pkoClose();setTimeout(()=>openPack(s,false),280);return}
 if(e.target.closest('#pkoBuy')){const s=PKO.set;pkoClose();setTimeout(()=>{const b=document.querySelector(`.shopBuy[data-set="${s}"]`);if(b)b.click()},280);return}});
addEventListener('keydown',e=>{if(!PKO.on)return;const k=e.key;
 if(k==='Escape'){e.preventDefault();if(PKO.stage==='summary')pkoClose();else pkoSummary();return}
 if(k===' '||k==='Enter'||k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();e.stopPropagation();
  if(PKO.stage==='pack')pkoOpen();else if(PKO.stage==='stack'){const c=pkoCur();if(c&&c.classList.contains('down'))pkoReveal(c);else pkoNext(k==='ArrowRight'?1:-1)}else if(PKO.stage==='summary'&&k==='Enter')pkoClose()}},true);
addEventListener('resize',()=>{const s=$('pkoStack');if(PKO.on&&s)s.style.setProperty('--s',pkoCardScale())});
