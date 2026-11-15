// ---------- lineup screen: the club laid out on a field, a card at every position, your card collection in a tray below.
// Tap a player on the field to pick him up; tap a card in the tray to sign it into his spot, or tap another hitter on the
// field to swap their places in the batting order. Uses the signings layer (19a) for the actual roster changes. ----------
const LF_POS={C:[50,86],'1B':[85,58],'2B':[67,43],SS:[33,43],'3B':[15,58],LF:[16,20],CF:[50,14],RF:[84,20],DH:[15,86],SP:[50,58]};/* spaced so no two cards touch at any window size */
const LF_POS_M={C:[50,90],'1B':[80,72],'2B':[68,49],SS:[32,49],'3B':[20,72],LF:[20,25],CF:[50,9],RF:[80,25],DH:[17,91],SP:[50,69]};/* phones: a taller field so no two cards touch */
const lfMob=()=>matchMedia('(max-width:720px)').matches;
let lfDeck='bat',lfFieldC={};
function lfFieldArt(){const m=lfMob();if(lfFieldC[m])return lfFieldC[m];const W=m?100:115,H=m?150:100,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 /* seen straight down: dark stands, a grass fan with mowing stripes and a warning track, the skinned infield, bases, mound and plate */
 const hx=W/2,hy=m?142:93,d=m?40:30,B1=[hx+d*.707,hy-d*.707],B2=[hx,hy-d*1.414],B3=[hx-d*.707,hy-d*.707],FR=m?146:91;
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
let lfFlip=null,lfMove=false;const lfFlips=new Set();let lfFlipsOf='';
function lfMini(T,k,p,opt){const c=lfCard(k,p),r=c?c.r:0,art=c?cardArt(c,k):portrait(T,p,k===S.you),o=ovr(p),pit=opt.i<0,fk='f'+opt.i;
 return `<button type="button" class="lfc r${r}${lfFlips.has(fk)?' flip':''}${p.signed?' signed':''}" data-i="${opt.i}" style="--tj:${T.jersey};--tc:${T.cap}"><span class="lfIn">
  ${lfFace(art,o,p.name,opt.pos+(pit&&p.slot==='side'?' · SIDE':''))}${lfBackFace(p,pit,o,opt.pos,'',opt.i>=0?opt.i+1:0)}</span></button>`}
let lfTab='field',boSel=null;
for(const b of $('lnTabs').children)b.addEventListener('click',()=>{lfTab=b.dataset.t;boSel=null;lfMove=false;lineupRender()});
/* the batting order: the nine hitters in a row, in order. Tap one, then tap the spot he should bat in: they swap */
function boRender(T,key){const row=T.lineup.map((p,i)=>{const c=lfCard(key,p),art=c?cardArt(c,key):portrait(T,p,key===S.you);
  return `<div class="boSlot"><span class="boNum">${i+1}</span><button type="button" class="lfc bo r${c?c.r:0}${boSel===i?' boSel':''}" data-o="${i}" style="--tj:${T.jersey};--tc:${T.cap}"><span class="lfIn">${lfFace(art,ovr(p),p.name,p.pos)}</span></button></div>`}).join('');
 $('cards').innerHTML=`<div class="boRow">${row}</div>`;$('lnHint').textContent=boSel==null?'Tap a hitter, then tap the spot you want him to bat in.':`Now tap the spot for ${T.lineup[boSel].name}.`;lfFit()}
function lineupRender(){for(const b of $('lnTabs').children)b.setAttribute('aria-pressed',String(b.dataset.t===lfTab));
 $('lnNext').textContent=pregame?'NEXT':'DONE';
 const key=lnView==='mine'?S.you:S.opp,T=TEAMS[key],mine=lnView==='mine';
 if(lfTab==='order'){boRender(T,key);return}
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
 if(mine){if(selPit)lfDeck='pit';else if(selBat)lfDeck='bat';
  if(!CARDS.length)buildCardDB();const used=usedCards(S.you);
  const own=CARDS.filter(c=>COL.owned[c.id]&&c.pit===(lfDeck==='pit')).sort((a,b)=>b.o-a.o);
  tray=own.length?own.map(c=>{const q=c.p,inUse=used.has(c.id),fk='d'+c.id,pos=c.pit?(q.pos==='SP'?'SP':'RP'):q.pos;
    const can=lnSel!=null&&!inUse&&(lnSel<0)===c.pit;
    return `<button type="button" class="lfc deck r${c.r}${inUse?' used':''}${lfFlips.has(fk)?' flip':''}" data-id="${c.id}"><span class="lfIn">
     ${lfFace(cardArt(c),c.o,q.name,pos+(c.pit&&q.slot==='side'?' · SIDE':'')+(inUse?' · IN':''))}${lfBackFace(q,c.pit,c.o,pos,can?`<span class="lfSign" data-sign="${c.id}">SIGN IN</span>`:'')}</span></button>`}).join('')
   :`<p class="lfEmpty">No ${lfDeck==='pit'?'pitcher':'hitter'} cards yet. Open packs in the Card Collection to get players.</p>`}
 const sel=lnSel==null?null:lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];
 const acts=mine&&sel?`${lnSel>=0?`<button type="button" class="mbtn lfMoveB" aria-pressed="${lfMove}">${lfMove?'Tap a hitter to swap with…':'⇅ Batting order'}</button>`:''}${sel.signed?`<button type="button" class="mbtn lfRestore">Restore original</button>`:''}`:'';
 $('cards').innerHTML=`<div class="lfWrap"><div class="lfField" style="background-image:url(${lfFieldArt()})">${field}<span class="lfDhTag">DH</span></div>
  <div class="lfSide"><h4>BULLPEN</h4><div class="lfPen">${pen}</div><div class="lfActs">${acts}</div></div></div>
  ${mine?`<div class="lfTrayHead"><h4>YOUR CARDS</h4><div class="seg lfTabs"><button type="button" data-d="bat" aria-pressed="${lfDeck==='bat'}">Hitters</button><button type="button" data-d="pit" aria-pressed="${lfDeck==='pit'}">Pitchers</button></div></div><div class="lfTray">${tray}</div>`:''}`;
 $('lnHint').textContent=mine?'Drag one of your cards onto a player to put him in. Tap a card to flip it.':'';lfFit()}
/* a long name (HWANG M.U.) on a narrow card was cut to HWANG M...: step the type down until the whole name fits */
function lfFit(){for(const e of document.querySelectorAll('#cards .lfNm')){e.style.fontSize='';let fs=parseFloat(getComputedStyle(e).fontSize),n=0;while(e.scrollWidth>e.clientWidth+.5&&fs>7.5&&n++<8){fs-=.75;e.style.fontSize=fs+'px'}}}
$('cards').addEventListener('click',e=>{
 if(lfDrag.eat>performance.now()){e.stopImmediatePropagation();return}
 const bo=e.target.closest('.lfc.bo');if(bo){const i=+bo.dataset.o,L=TEAMS[S.you].lineup;
  if(boSel==null)boSel=i;else if(boSel===i)boSel=null;else{[L[boSel],L[i]]=[L[i],L[boSel]];boSel=null;const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}
   for(const k of[...lfFlips])if(/^f\d/.test(k))lfFlips.delete(k);applyDefense();updateHUD();try{sfx('glove')}catch(_){}}
  boRender(TEAMS[S.you],S.you);return}
 const tab=e.target.closest('.lfTabs button');if(tab){lfDeck=tab.dataset.d;for(const k of[...lfFlips])if(k[0]==='d')lfFlips.delete(k);lfMove=false;lineupRender();return}
 const T=TEAMS[S.you];
 if(lnView==='mine'){
  if(e.target.closest('.lfRestore')){const p=lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];if(p){const real=p.custom?T.benched||p:p;releasePlayer(S.you,real.signedFor||real.name,lnSel<0);applyDefense();updateHUD()}lfFlips.delete(lfFlip);lfFlip=null;lineupRender();return}
  if(e.target.closest('.lfMoveB')){lfMove=!lfMove;lineupRender();return}
  const sg=e.target.closest('[data-sign]');
  if(sg&&lnSel!=null){const pit=lnSel<0,p=pit?T.staff[-1-lnSel]:T.lineup[lnSel],real=p.custom?T.benched||p:p;
   const why=lfFitWhy(CARD_BY[sg.dataset.sign],lnSel,p);if(why){lfSay(why,true);return}
   if(signPlayer(S.you,real.signedFor||real.name,sg.dataset.sign,pit)){applyDefense();updateHUD();try{sfx('glove')}catch(_){}}lfFlips.delete(lfFlip);lfFlips.delete('d'+sg.dataset.sign);lfFlip=null;lfMove=false;lineupRender();return}}
 const b=e.target.closest('.lfc');if(!b)return;
 if(b.classList.contains('deck')){const fk='d'+b.dataset.id;
  /* a tray card flips on its own; every other turned card stays turned */
  if(lfFlips.has(fk))lfFlips.delete(fk);else lfFlips.add(fk);b.classList.toggle('flip',lfFlips.has(fk));return}
 const i=+b.dataset.i;
 if(lnView==='mine'&&lfMove&&lnSel!=null&&lnSel>=0&&i>=0&&i!==lnSel){const L=T.lineup;[L[lnSel],L[i]]=[L[i],L[lnSel]];for(const k of[...lfFlips])if(k[0]==='f'&&k!=='f-1'&&!k.startsWith('f-'))lfFlips.delete(k);const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}applyDefense();updateHUD();lfMove=false;lfFlip=null;lineupRender();return}
 const fk='f'+i;if(lfFlips.has(fk)){lfFlips.delete(fk);if(lfFlip===fk)lfFlip=[...lfFlips].reverse().find(k=>k[0]==='f')||null}else{lfFlips.add(fk);lfFlip=fk}lfMove=false;lineupRender()});
/* rotating a phone or resizing across the phone breakpoint redraws the field to match */
{let lfWasMob=lfMob();addEventListener('resize',()=>{const m=lfMob();if(m!==lfWasMob){lfWasMob=m;if(!$('scrLineup').hidden&&typeof lineupRender==='function')lineupRender()}else if(!$('scrLineup').hidden)lfFit()})}

// ---- drag a card from your tray onto a player on the field (or in the bullpen) to sign it into his spot ----
// A card only goes where he can play: his own position, any outfield spot for an outfielder (LF, CF and RF are one), and
// any hitter at DH. Pitchers: a starter for the starter's spot, any pitcher in the bullpen.
const LF_OF=new Set(['LF','CF','RF']);
function lfSlotPos(T,i){return i>=0?T.lineup[i].pos:i===-1?'SP':'RP'}
function lfFitWhy(c,i,p){if(!c)return'That card is gone.';const T=TEAMS[S.you],slot=lfSlotPos(T,i),cp=c.p.pos,nm=c.p.name;
 if(c.pit!==(i<0))return c.pit?`${nm} is a pitcher. Put him on the mound or in the bullpen.`:`${nm} is a hitter. He can't pitch.`;
 if(usedCards(S.you).has(c.id)&&!(p&&p.signed===c.id))return`${nm} is already in your lineup.`;
 if(c.pit)return slot==='SP'&&cp!=='SP'?`${nm} is a reliever. Only a starter can start.`:'';
 if(slot==='DH'||cp===slot||(LF_OF.has(cp)&&LF_OF.has(slot)))return'';
 return`${nm} plays ${cp}. He can't play ${slot}.`}
function lfSay(t,bad){const m=$('lfMsg');m.textContent=t;m.classList.toggle('bad',!!bad);m.classList.add('on');clearTimeout(lfSay.t);lfSay.t=setTimeout(()=>m.classList.remove('on'),2600)}
const lfDrag={st:null,on:false,ghost:null,over:null,eat:0};
function lfScroller(){let e=$('cards');while(e&&e!==document.body){const o=getComputedStyle(e).overflowY;if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight)return e;e=e.parentElement}return document.scrollingElement}
$('cards').addEventListener('pointerdown',e=>{if(lnView!=='mine'||lfTab!=='field'||e.button>0)return;const b=e.target.closest('.lfTray .lfc.deck');if(!b||e.target.closest('[data-sign]'))return;
 lfDrag.st={x:e.clientX,y:e.clientY,b,id:b.dataset.id,pid:e.pointerId}});
addEventListener('pointermove',e=>{const d=lfDrag;if(!d.st||e.pointerId!==d.st.pid)return;const dx=e.clientX-d.st.x,dy=e.clientY-d.st.y;
 if(!d.on){if(Math.hypot(dx,dy)<8)return;if(Math.abs(dx)>Math.abs(dy)*1.2&&e.pointerType!=='mouse'){d.st=null;return}/* (sideways: the tray scrolls) */lfDragStart(e)}
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
function lfDragEnd(e,cancel){const d=lfDrag;if(!d.st)return;const was=d.on;
 if(was){d.eat=performance.now()+350;const t=d.over;if(d.ghost)d.ghost.remove();d.ghost=null;d.st.b.classList.remove('dragSrc');document.body.classList.remove('lfDragging');
  for(const x of document.querySelectorAll('.dropOk,.dropNo,.dropHover'))x.classList.remove('dropOk','dropNo','dropHover');
  if(t&&!cancel){const T=TEAMS[S.you],i=+t.dataset.i,pit=i<0,p=pit?T.staff[-1-i]:T.lineup[i],why=lfFitWhy(d.card,i,p);
   if(why){lfSay(why,true);t.classList.add('dropReject');setTimeout(()=>t.classList.remove('dropReject'),450);}
   else{const real=p.custom?T.benched||p:p;if(signPlayer(S.you,real.signedFor||real.name,d.card.id,pit)){applyDefense();updateHUD();try{sfx('glove')}catch(_){}
     lfFlips.delete('f'+i);lfFlips.delete('d'+d.card.id);lfSay(`${d.card.p.name} is in at ${lfSlotPos(T,i)}.`);lineupRender()}}}}
 d.st=null;d.on=false;d.over=null;d.vy=0}
addEventListener('pointerup',e=>lfDragEnd(e,false));addEventListener('pointercancel',e=>lfDragEnd(e,true));
$('lnNext').addEventListener('click',()=>{if(pregame){plOpen();return}document.querySelector('#scrLineup .mbtn.back').click()});
$('cards').addEventListener('dragstart',e=>e.preventDefault());/* (a card's picture would start the browser's own image drag and cancel ours) */
