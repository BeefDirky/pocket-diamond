// ---------- lineup screen: the club laid out on a field, a card at every position, your card collection in a tray below.
// Tap a player on the field to pick him up; tap a card in the tray to sign it into his spot, or tap another hitter on the
// field to swap their places in the batting order. Uses the signings layer (19a) for the actual roster changes. ----------
const LF_POS={C:[50,86],'1B':[85,58],'2B':[67,43],SS:[33,43],'3B':[15,58],LF:[16,20],CF:[50,14],RF:[84,20],DH:[15,86],SP:[50,58]};/* spaced so no two cards touch at any window size */
const LF_POS_M={C:[50,88],'1B':[80,67],'2B':[68,40],SS:[32,40],'3B':[20,67],LF:[18,12],CF:[50,12],RF:[82,12],DH:[17,89.5],SP:[50,63.5]};/* (phones: the top of the outfield is cut off, CF level with the corners) *//* phones: a taller field so no two cards touch */
const lfMob=()=>matchMedia('(max-width:720px)').matches;
let lfDeck='bat',lfFieldC={};
/* the card tray's order: SORT cycles name → position → rarity → OVR (remembered on this device) */
const LF_POS_ORD=['SP','RP','C','1B','2B','3B','SS','LF','CF','RF','DH'],lfByO=(a,b)=>b.o-a.o||a.p.name.localeCompare(b.p.name);
const LF_SORTS=[{n:'NAME',f:(a,b)=>a.p.name.localeCompare(b.p.name)},{n:'POSITION',f:(a,b)=>LF_POS_ORD.indexOf(a.p.pos)-LF_POS_ORD.indexOf(b.p.pos)||lfByO(a,b)},
 {n:'RARITY',f:(a,b)=>b.r-a.r||lfByO(a,b)},{n:'OVR',f:lfByO}];
let lfSort=(()=>{try{const v=+localStorage.getItem('pd-lfsort');return v>=0&&v<4?v:3}catch(e){return 3}})();
function lfFieldArt(){const m=lfMob();if(lfFieldC[m])return lfFieldC[m];const W=m?100:115,H=m?128:100,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 /* seen straight down: dark stands, a grass fan with mowing stripes and a warning track, the skinned infield, bases, mound and plate */
 const hx=W/2,hy=m?120:93,d=m?40:30,B1=[hx+d*.707,hy-d*.707],B2=[hx,hy-d*1.414],B3=[hx-d*.707,hy-d*.707],FR=m?146:91;
 g.fillStyle='#16241c';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=3)for(let x=(y%2);x<W;x+=3){g.fillStyle=((x*7+y*13)%5)?'#1b2c22':'#24382c';g.fillRect(x,y,1,1)}
 const fan=r=>{g.beginPath();g.moveTo(hx,hy);g.arc(hx,hy,r,-Math.PI*3/4,-Math.PI/4);g.closePath()};
 fan(FR);g.fillStyle='#8a6440';g.fill();fan(FR-5);g.fillStyle='#3c9a3c';g.fill();
 g.save();fan(FR-5);g.clip();g.fillStyle='#46aa44';for(let y=0;y<H;y+=8)g.fillRect(0,y,W,4);
 // the infield dirt: an arc round the mound, out past the bases
 g.fillStyle='#c48c56';g.beginPath();g.arc(hx,hy-d*.95,d*1.02,0,7);g.fill();
 g.beginPath();g.moveTo(hx,hy+3);g.lineTo(B1[0]+5,B1[1]);g.lineTo(B2[0],B2[1]-5);g.lineTo(B3[0]-5,B3[1]);g.closePath();g.fill();
 g.restore();
 // the infield grass inside the base paths
 const ins=4.5;g.fillStyle='#3c9a3c';g.beginPath();g.moveTo(hx,hy-ins*1.4);g.lineTo(B1[0]-ins,B1[1]);g.lineTo(B2[0],B2[1]+ins*1.4);g.lineTo(B3[0]+ins,B3[1]);g.closePath();g.fill();
 g.save();g.clip();g.fillStyle='#46aa44';for(let y=0;y<H;y+=8)g.fillRect(0,y,W,4);g.restore();
 g.fillStyle='#c48c56';g.beginPath();g.arc(hx,hy-d*.707,3.6,0,7);g.fill();g.beginPath();g.arc(hx,hy,m?7:6,0,7);g.fill();
 g.fillStyle='#f4f1e8';
 for(const[x,y]of[B1,B2,B3])g.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);g.fillRect(Math.round(hx)-1,hy-1,3,2);g.fillRect(Math.round(hx)-1,Math.round(hy-d*.707),2,1);
 return lfFieldC[m]=c.toDataURL()}
// the card for a roster player: his collectible card if there is one, else the club's portrait
function lfCard(k,p){if(!CARDS.length)buildCardDB();if(p.signed&&CARD_BY[p.signed])return CARD_BY[p.signed];return CARDS.find(c=>c.k===k&&c.p===p)||CARDS.find(c=>c.k===k&&c.p.name===p.name)||null}
/* the back of a card: his ratings as bars */
function lfStats(p,pit){const rows=pit?[['VEL',p.vel],['MOV',p.mov],['CTL',p.ctl]]:[['CON',p.con],['POW',p.pow],['SPD',p.spd],['DEF',p.def]];
 return rows.map(([l,v])=>`<span class="lfSt"><i>${l}</i><b style="color:${rcol(v)}">${v}</b><u><s style="width:${v}%;background:${rcol(v)}"></s></u></span>`).join('')}
function lfFace(art,o,nm,pos){return `<span class="lfF"><span class="lfOvr" style="--oc:${rcol(o)}"><small>OVR</small>${o}</span><img alt="" src="${art}"><span class="lfNm">${nm}</span><span class="lfPos">${pos}</span></span>`}
function lfBackFace(p,pit,o,pos,extra,order){return `<span class="lfB"><span class="lfBNm">${p.name}</span><span class="lfBSub">${pos} · ${p.hand||p.thr||'R'}${p.slot==='side'?' · SIDEARM':''}${order?` · BATS ${order}${['','ST','ND','RD'][order]||'TH'}`:''}</span><span class="lfBOvr" style="color:${rcol(o)}">${o}<small>OVR</small></span>${lfStats(p,pit)}${extra||''}</span>`}
let lfFlip=null,lfMove=false,lfSelWas=null;const lfFlips=new Set();let lfFlipsOf='';
function lfMini(T,k,p,opt){const c=lfCard(k,p),r=c?c.r:0,art=c?cardArt(c,k):portrait(T,p,k===S.you),o=ovr(p),pit=opt.i<0,fk='f'+opt.i;
 return `<button type="button" class="lfc r${r}${lfFlips.has(fk)?' flip':''}${p.signed?' signed':''}" data-i="${opt.i}" style="--tj:${T.jersey};--tc:${T.cap}"><span class="lfIn">
  ${lfFace(art,o,p.name,opt.pos+(pit&&p.slot==='side'?' · SIDE':''))}${lfBackFace(p,pit,o,opt.pos,'',opt.i>=0?opt.i+1:0)}</span></button>`}
let lfTab='field',boSel=null;
/* the BATTING ORDER tab starts exactly where the POSITIONS tab starts (so the header and tabs don't jump), and is only
   as tall as it needs to be */
let lfFieldTop=null;
function lnHold(){const c=$('scrLineup'),o=lfTab==='order';c.classList.toggle('boTab',o);c.style.marginTop=o&&lfFieldTop!=null?Math.max(0,lfFieldTop)+'px':''}
for(const b of $('lnTabs').children)b.addEventListener('click',()=>{if(lfTab==='field'&&!$('scrLineup').hidden){const c=$('scrLineup'),t=$('title');lfFieldTop=c.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop-parseFloat(getComputedStyle(t).paddingTop)}lfTab=b.dataset.t;boSel=null;lfMove=false;lineupRender()});
/* the batting order: the nine hitters in a row, in order. Tap one, then tap the spot he should bat in: they swap */
function boRender(T,key){const row=T.lineup.map((p,i)=>{const c=lfCard(key,p),art=c?cardArt(c,key):portrait(T,p,key===S.you);
  return `<div class="boSlot"><span class="boNum">${i+1}</span><button type="button" class="lfc bo r${c?c.r:0}${boSel===i?' boSel':''}" data-o="${i}" style="--tj:${T.jersey};--tc:${T.cap}"><span class="lfIn">${lfFace(art,ovr(p),p.name,p.pos)}</span></button></div>`}).join('');
 const keep=lfKeepScroll();$('cards').innerHTML=`<div class="boRow">${row}</div>`;keep();$('lnHint').textContent=boSel==null?(matchMedia('(pointer:fine)').matches?'Drag a hitter to a new spot in the order, or tap two hitters to swap them.':'Tap a hitter, then tap the spot you want him to bat in.'):`Now tap the spot for ${T.lineup[boSel].name}.`;lfFit()}
function lineupRender(){$('cards').style.setProperty('--lgD',-(performance.now()%2600)+'ms');for(const b of $('lnTabs').children)b.setAttribute('aria-pressed',String(b.dataset.t===lfTab));
 $('lnNext').textContent=pregame?'NEXT':'DONE';
 const key=lnView==='mine'?S.you:S.opp,T=TEAMS[key],mine=lnView==='mine';
 lnHold();if(lfTab==='order'){boRender(T,key);return}
 if(!mine)lfMove=false;
 if(lfFlipsOf!==lnView+key){lfFlipsOf=lnView+key;lfFlips.clear();lfFlip=null}
 if(lfFlip&&!lfFlips.has(lfFlip))lfFlip=null;
 lnSel=lfFlip&&lfFlip[0]==='f'?+lfFlip.slice(1):null;
 const selPit=lnSel!=null&&lnSel<0,selBat=lnSel!=null&&lnSel>=0;
 let field='';
 const LP=lfMob()?LF_POS_M:LF_POS;
 T.lineup.forEach((p,i)=>{const pos=LP[p.pos]?p.pos:'DH',[x,y]=LP[pos];field+=`<div class="lfSlot" style="left:${x}%;top:${y}%">${lfMini(T,key,p,{i,pos})}</div>`});
 {const p=T.staff[0],[x,y]=LP.SP;if(p)field+=`<div class="lfSlot" style="left:${x}%;top:${y}%">${lfMini(T,key,p,{i:-1,pos:'SP'})}</div>`}
 const pen=T.staff.slice(1).map((p,j)=>lfMini(T,key,p,{i:-2-j,pos:p.pos||'RP'})).join('');
 let tray='';
 /* flipping a pitcher or hitter on the field shows the matching cards once; the tabs can still switch after that */
 if(mine){if(lnSel!==lfSelWas){if(selPit)lfDeck='pit';else if(selBat)lfDeck='bat'}lfSelWas=lnSel;
  if(!CARDS.length)buildCardDB();const used=usedCards(S.you);
  const own=CARDS.filter(c=>COL.owned[c.id]&&c.pit===(lfDeck==='pit')).sort(LF_SORTS[lfSort].f);
  tray=own.length?own.map(c=>{const q=c.p,inUse=used.has(c.id),fk='d'+c.id,pos=c.pit?(q.pos==='SP'?'SP':'RP'):q.pos;
    const can=lnSel!=null&&!inUse&&(lnSel<0)===c.pit;
    return `<button type="button" class="lfc deck r${c.r}${inUse?' used':''}${lfFlips.has(fk)?' flip':''}" data-id="${c.id}"><span class="lfIn">
     ${lfFace(cardArt(c),c.o,q.name,pos+(c.pit&&q.slot==='side'?' · SIDE':'')+(inUse?' · IN':''))}${lfBackFace(q,c.pit,c.o,pos,'')}</span></button>`}).join('')
   :`${'<div class="lfc lfHole" aria-hidden="true"></div>'.repeat(8)}<p class="lfEmpty">No ${lfDeck==='pit'?'pitcher':'hitter'} cards yet. Open packs in the Shop to get players.</p>`}
 const sel=lnSel==null?null:lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];
 const acts='';/* (no "restore original": you swap a player out by dragging another card in) */
 const keep=lfKeepScroll();
 $('cards').innerHTML=`<div class="lfWrap"><div class="lfField" style="background-image:url(${lfFieldArt()})">${field}<span class="lfDhTag">DH</span></div>
  <div class="lfSide"><h4>BULLPEN</h4><div class="lfPen">${pen}</div><div class="lfActs">${acts}</div></div></div>
  ${mine?`<div class="lfTrayHead"><h4>YOUR CARDS</h4><button type="button" class="mbtn lfSortB">SORT: ${LF_SORTS[lfSort].n}</button><div class="seg lfTabs"><button type="button" data-d="bat" aria-pressed="${lfDeck==='bat'}">Hitters</button><button type="button" data-d="pit" aria-pressed="${lfDeck==='pit'}">Pitchers</button></div></div><div class="lfTray">${tray}</div>`:''}`;
 $('lnHint').textContent=mine?'Drag one of your cards onto a player to put him in. Tap a card to flip it.':'';lfFit();keep()}
/* a redraw (flipping a card) keeps the bullpen and card rows where you had scrolled them */
function lfKeepScroll(){const at={};for(const c of['lfPen','lfTray','boRow']){const e=document.querySelector('#cards .'+c);if(e)at[c]=[e.scrollLeft,e.scrollTop]}
 return()=>{for(const c in at){const e=document.querySelector('#cards .'+c);if(e){e.style.scrollBehavior='auto';e.scrollLeft=at[c][0];e.scrollTop=at[c][1];e.style.scrollBehavior=''}}}}
/* a long name (HWANG M.U.) on a narrow card was cut to HWANG M...: step the type down until the whole name fits */
function lfFit(){for(const e of document.querySelectorAll('#cards .lfNm')){e.style.fontSize='';e.style.lineHeight='';const h=e.clientHeight,cs=getComputedStyle(e),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
 /* (measure the text itself: scrollWidth rounds, so a name a fraction of a pixel too wide still got cut to "JUNG M...") */
 const rg=document.createRange();rg.selectNodeContents(e);const room=()=>e.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
 let fs=parseFloat(cs.fontSize),n=0;while(rg.getBoundingClientRect().width>room()+.05&&fs>7.5&&n++<10){fs-=.75;e.style.fontSize=fs+'px'}
 if(n)e.style.lineHeight=(h-pad)+'px'}}/* (the smaller type keeps the row's height, so a long-named card is as tall as the rest) */
$('cards').addEventListener('click',e=>{
 if(lfDrag.eat>performance.now()){e.stopImmediatePropagation();return}
 const bo=e.target.closest('.lfc.bo');if(bo){const i=+bo.dataset.o,L=TEAMS[S.you].lineup;
  if(boSel==null)boSel=i;else if(boSel===i)boSel=null;else{[L[boSel],L[i]]=[L[i],L[boSel]];boSel=null;const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}
   for(const k of[...lfFlips])if(/^f\d/.test(k))lfFlips.delete(k);applyDefense();updateHUD();try{sfx('glove')}catch(_){}}
  boRender(TEAMS[S.you],S.you);return}
 if(e.target.closest('.lfSortB')){lfSort=(lfSort+1)%LF_SORTS.length;try{localStorage.setItem('pd-lfsort',lfSort)}catch(_){}lineupRender();return}
 const tab=e.target.closest('.lfTabs button');if(tab){lfDeck=tab.dataset.d;lfSelWas=lnSel;for(const k of[...lfFlips])if(k[0]==='d')lfFlips.delete(k);lfMove=false;lineupRender();return}
 const T=TEAMS[S.you];
 if(lnView==='mine'){
  if(e.target.closest('.lfRestore')){const p=lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];if(p){const real=p.custom?T.benched||p:p;releasePlayer(S.you,real.signedFor||real.name,lnSel<0);applyDefense();updateHUD()}lfFlips.delete(lfFlip);lfFlip=null;lineupRender();return}
  if(e.target.closest('.lfMoveB')){lfMove=!lfMove;lineupRender();return}
  const sg=e.target.closest('[data-sign]');
  if(sg&&lnSel!=null){const pit=lnSel<0,p=pit?T.staff[-1-lnSel]:T.lineup[lnSel],real=p.custom?T.benched||p:p;
   const why=lfFitWhy(CARD_BY[sg.dataset.sign],lnSel,p);if(why){lfSay(why,true);return}
   if(signPlayer(S.you,real.signedFor||real.name,sg.dataset.sign,pit)){const b=lfBench(real);if(b)lfSay(b.trim());applyDefense();updateHUD();try{sfx('glove')}catch(_){}}lfFlips.delete(lfFlip);lfFlips.delete('d'+sg.dataset.sign);lfFlip=null;lfMove=false;lineupRender();return}}
 const b=e.target.closest('.lfc');if(!b)return;
 if(b.classList.contains('deck')){const fk='d'+b.dataset.id;
  /* a tray card flips on its own; every other turned card stays turned */
  if(lfFlips.has(fk))lfFlips.delete(fk);else lfFlips.add(fk);b.classList.toggle('flip',lfFlips.has(fk));return}
 const i=+b.dataset.i;
 if(false){const L=T.lineup;[L[lnSel],L[i]]=[L[i],L[lnSel]];for(const k of[...lfFlips])if(k[0]==='f'&&k!=='f-1'&&!k.startsWith('f-'))lfFlips.delete(k);const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}applyDefense();updateHUD();lfMove=false;lfFlip=null;lineupRender();return}
 const fk='f'+i;if(lfFlips.has(fk)){lfFlips.delete(fk);if(lfFlip===fk)lfFlip=[...lfFlips].reverse().find(k=>k[0]==='f')||null}else{lfFlips.add(fk);lfFlip=fk}lfMove=false;
 if(lnView!=='mine'||!b.closest('.lfField,.lfPen')){lineupRender();return}
 b.classList.toggle('flip',lfFlips.has(fk));lnSel=lfFlip&&lfFlip[0]==='f'?+lfFlip.slice(1):null;const T2=TEAMS[S.you],sel=lnSel==null?null:lnSel>=0?T2.lineup[lnSel]:T2.staff[-1-lnSel],a=document.querySelector('#cards .lfActs');
 if(a)a.innerHTML=''});
/* the pixel font can arrive after the first draw (it's wider than the stand-in), so fit the names again then */
try{document.fonts.ready.then(()=>{if(!$('scrLineup').hidden)lfFit()});document.fonts.addEventListener('loadingdone',()=>{if(!$('scrLineup').hidden)lfFit()})}catch(e){}
/* rotating a phone or resizing across the phone breakpoint redraws the field to match */
{let lfWasMob=lfMob();addEventListener('resize',()=>{const m=lfMob();if(m!==lfWasMob){lfWasMob=m;if(!$('scrLineup').hidden&&typeof lineupRender==='function')lineupRender()}else if(!$('scrLineup').hidden)lfFit()})}

// ---- drag a card from your tray onto a player on the field (or in the bullpen) to sign it into his spot ----
// A card only goes where he can play: his own position, any outfield spot for an outfielder (LF, CF and RF are one), and
// any hitter at DH. Pitchers: a starter only in the starter's spot, a reliever only in the bullpen.
const LF_OF=new Set(['LF','CF','RF']);
/* a club player you replace isn't thrown away: his card goes into YOUR CARDS, so you can put him back (or elsewhere) later */
function lfBench(p){if(!p||p.signed||p.custom)return'';const c=lfCard(S.you,p);if(!c||COL.owned[c.id])return'';COL.owned[c.id]=1;saveCol();return` ${p.name} went to your cards.`}
function lfSlotPos(T,i){return i>=0?T.lineup[i].pos:i===-1?'SP':'RP'}
function lfFitWhy(c,i,p){if(!c)return'That card is gone.';const T=TEAMS[S.you],slot=lfSlotPos(T,i),cp=c.p.pos,nm=c.p.name;
 if(c.pit!==(i<0))return c.pit?`${nm} is a pitcher. Put him on the mound or in the bullpen.`:`${nm} is a hitter. He can't pitch.`;
 if(usedCards(S.you).has(c.id)&&!(p&&p.signed===c.id))return`${nm} is already in your lineup.`;
 if(c.pit)return slot==='SP'&&cp!=='SP'?`${nm} is a reliever. Only a starter can start.`:slot!=='SP'&&cp==='SP'?`${nm} is a starter. He can only go on the mound, not in the bullpen.`:'';
 if(slot==='DH'||cp===slot||(LF_OF.has(cp)&&LF_OF.has(slot)))return'';
 return`${nm} plays ${cp}. He can't play ${slot}.`}
function lfSay(t,bad){const m=$('lfMsg');m.textContent=t;m.classList.toggle('bad',!!bad);m.classList.add('on');clearTimeout(lfSay.t);lfSay.t=setTimeout(()=>m.classList.remove('on'),2600)}
const lfDrag={st:null,on:false,ghost:null,over:null,eat:0};
function lfScroller(){let e=$('cards');while(e&&e!==document.body){const o=getComputedStyle(e).overflowY;if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight)return e;e=e.parentElement}return document.scrollingElement}
$('cards').addEventListener('pointerdown',e=>{if(lnView!=='mine'||lfTab!=='field'||e.button>0)return;const b=e.target.closest('.lfTray .lfc.deck');if(!b||e.target.closest('[data-sign]'))return;
 const tr=b.closest('.lfTray');lfDrag.st={x:e.clientX,y:e.clientY,b,id:b.dataset.id,pid:e.pointerId,tr,sl:tr?tr.scrollLeft:0,pan:false}});
addEventListener('pointermove',e=>{const d=lfDrag;if(!d.st||e.pointerId!==d.st.pid)return;const dx=e.clientX-d.st.x,dy=e.clientY-d.st.y;
 /* the tray cards take every touch themselves (touch-action:none), so the browser never grabs the gesture and cancels the drag
    halfway up the screen; a sideways swipe scrolls the tray by hand instead */
 if(d.st.pan){e.preventDefault();d.st.tr.scrollLeft=d.st.sl-dx;const now=performance.now(),dt=now-(d.st.lt||now)||16;d.st.v=.7*(d.st.v||0)+.3*((e.clientX-(d.st.lx??e.clientX))/dt);d.st.lt=now;d.st.lx=e.clientX;return}
 if(!d.on){if(Math.hypot(dx,dy)<8)return;if(Math.abs(dx)>Math.abs(dy)*1.2&&e.pointerType!=='mouse'&&d.st.tr){d.st.pan=true;d.eat=performance.now()+350;return}lfDragStart(e)}
 if(!d.on)return;e.preventDefault();d.ghost.style.transform=`translate(${e.clientX-d.gw/2}px,${e.clientY-d.gh*.4}px) rotate(-4deg)`;
 const el=document.elementFromPoint(e.clientX,e.clientY),t=el&&el.closest('.lfField .lfc[data-i],.lfPen .lfc[data-i]');
 if(t!==d.over){if(d.over)d.over.classList.remove('dropHover');d.over=t;if(t)t.classList.add('dropHover')}
 const sc=lfScroller(),r=sc===document.scrollingElement?{top:0,bottom:innerHeight}:sc.getBoundingClientRect();
 d.vy=e.clientY<r.top+60?-1:e.clientY>r.bottom-60?1:0;if(d.vy&&!d.raf){const tick=()=>{if(!d.on||!d.vy){d.raf=0;return}sc.scrollTop+=d.vy*9;d.raf=requestAnimationFrame(tick)};d.raf=requestAnimationFrame(tick)}},{passive:false});
function lfDragStart(e){const d=lfDrag,c=CARD_BY[d.st.id];d.on=true;d.card=c;const r=d.st.b.getBoundingClientRect();d.gw=r.width;d.gh=r.height;
 const g=d.st.b.cloneNode(true);g.classList.remove('flip');g.classList.add('lfGhost');g.style.width=r.width+'px';document.body.appendChild(g);d.ghost=g;
 d.st.b.classList.add('dragSrc');document.body.classList.add('lfDragging');
 const T=TEAMS[S.you];for(const t of document.querySelectorAll('.lfField .lfc[data-i],.lfPen .lfc[data-i]')){const i=+t.dataset.i,p=i>=0?T.lineup[i]:T.staff[-1-i];t.classList.add(lfFitWhy(c,i,p)?'dropNo':'dropOk')}
 try{d.st.b.setPointerCapture(e.pointerId)}catch(_){}}
function lfDragEnd(e,cancel){const d=lfDrag;if(!d.st)return;const was=d.on;if(d.st.pan){d.eat=performance.now()+300;lfGlide(d.st.tr,d.st.v||0)}
 if(was){d.eat=performance.now()+350;const t=d.over;if(d.ghost)d.ghost.remove();d.ghost=null;d.st.b.classList.remove('dragSrc');document.body.classList.remove('lfDragging');
  for(const x of document.querySelectorAll('.dropOk,.dropNo,.dropHover'))x.classList.remove('dropOk','dropNo','dropHover');
  if(t&&!cancel){const T=TEAMS[S.you],i=+t.dataset.i,pit=i<0,p=pit?T.staff[-1-i]:T.lineup[i],why=lfFitWhy(d.card,i,p);
   if(why){lfSay(why,true);t.classList.add('dropReject');setTimeout(()=>t.classList.remove('dropReject'),450);}
   else{const real=p.custom?T.benched||p:p,out=real;if(signPlayer(S.you,real.signedFor||real.name,d.card.id,pit)){const b=lfBench(out);applyDefense();updateHUD();try{sfx('glove')}catch(_){}
     lfFlips.delete('f'+i);lfFlips.delete('d'+d.card.id);lfSay(`${d.card.p.name} is in at ${lfSlotPos(T,i)}.${b}`);lineupRender()}}}}
 d.st=null;d.on=false;d.over=null;d.vy=0}
addEventListener('pointerup',e=>lfDragEnd(e,false));addEventListener('pointercancel',e=>lfDragEnd(e,true));
$('lnNext').addEventListener('click',()=>{if(pregame){plOpen();return}document.querySelector('#scrLineup .mbtn.back').click()});
$('cards').addEventListener('dragstart',e=>e.preventDefault());/* (a card's picture would start the browser's own image drag and cancel ours) */

const boDrag={st:null,on:false};
$('cards').addEventListener('pointerdown',e=>{if(lfTab!=='order'||e.button>0||e.pointerType==='touch')return;const b=e.target.closest('.lfc.bo');if(!b)return;
 boDrag.st={x:e.clientX,y:e.clientY,b,i:+b.dataset.o,pid:e.pointerId}});
function boSlots(){return[...document.querySelectorAll('.boRow .boSlot')]}
function boIndexAt(x){const sl=boSlots();let k=0;for(let j=0;j<sl.length;j++){const r=sl[j].getBoundingClientRect();if(x>r.left+r.width/2)k=j+1}return k}
addEventListener('pointermove',e=>{const d=boDrag;if(!d.st||e.pointerId!==d.st.pid)return;
 if(!d.on){if(Math.hypot(e.clientX-d.st.x,e.clientY-d.st.y)<6)return;d.on=true;const r=d.st.b.getBoundingClientRect();d.w=r.width;d.h=r.height;
  const g=d.st.b.cloneNode(true);g.classList.add('lfGhost');g.classList.remove('boSel');g.style.width=r.width+'px';document.body.appendChild(g);d.g=g;d.st.b.classList.add('dragSrc');document.body.classList.add('lfDragging')}
 e.preventDefault();d.g.style.transform=`translate(${e.clientX-d.w/2}px,${e.clientY-d.h*.45}px) rotate(-3deg)`;
 const k=boIndexAt(e.clientX),sl=boSlots();sl.forEach((x,j)=>{x.classList.toggle('boGapL',j===k&&k!==d.st.i&&k!==d.st.i+1);x.classList.toggle('boGapR',k===sl.length&&j===sl.length-1&&d.st.i!==sl.length-1)});
 const row=document.querySelector('.boRow'),rr=row.getBoundingClientRect();if(e.clientX<rr.left+40)row.scrollLeft-=12;else if(e.clientX>rr.right-40)row.scrollLeft+=12},{passive:false});
function boDragEnd(e,cancel){const d=boDrag;if(!d.st)return;if(d.on){if(d.g)d.g.remove();document.body.classList.remove('lfDragging');lfDrag.eat=performance.now()+300;
  if(!cancel){const from=d.st.i;let to=boIndexAt(e.clientX);if(to>from)to--;if(to!==from){const L=TEAMS[S.you].lineup,[p]=L.splice(from,1);L.splice(to,0,p);
    const ci=L.findIndex(q=>q.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}for(const k of[...lfFlips])if(/^f\d/.test(k))lfFlips.delete(k);applyDefense();updateHUD();try{sfx('glove')}catch(_){}lfSay(`${p.name} now bats ${to+1}${['','st','nd','rd'][to+1]||'th'}.`)}}
  boSel=null;boRender(TEAMS[S.you],S.you)}
 d.st=null;d.on=false;d.g=null}
addEventListener('pointerup',e=>boDragEnd(e,false));addEventListener('pointercancel',e=>boDragEnd(e,true));

/* a swipe on the card tray keeps gliding after you let go, slowing down like a normal scroll */
function lfGlide(tr,v){if(!tr||Math.abs(v)<.05)return;let last=performance.now();const step=t=>{const dt=Math.min(32,t-last);last=t;tr.scrollLeft-=v*dt;v*=Math.pow(.994,dt);
 if(Math.abs(v)>.02&&tr.isConnected&&!lfDrag.st)requestAnimationFrame(step)};requestAnimationFrame(step)}
