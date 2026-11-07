// ---------- lineup screen: the club laid out on a field, a card at every position, your card collection in a tray below.
// Tap a player on the field to pick him up; tap a card in the tray to sign it into his spot, or tap another hitter on the
// field to swap their places in the batting order. Uses the signings layer (19a) for the actual roster changes. ----------
const LF_POS={C:[50,90],'1B':[77,61],'2B':[63,40],SS:[37,40],'3B':[23,61],LF:[17,18],CF:[50,10],RF:[83,18],DH:[9,86],SP:[50,66]};
let lfDeck='bat',lfField=null;
function lfFieldArt(){if(lfField)return lfField;const W=115,H=100,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 // seen straight down: dark stands, a grass fan with mowing stripes and a warning track, the skinned infield, base paths,
 // bases, mound and plate, chalk lines out to the corners
 const hx=57.5,hy=93,d=30,B1=[hx+d*.707,hy-d*.707],B2=[hx,hy-d*1.414],B3=[hx-d*.707,hy-d*.707];
 g.fillStyle='#16241c';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=3)for(let x=(y%2);x<W;x+=3){g.fillStyle=((x*7+y*13)%5)?'#1b2c22':'#24382c';g.fillRect(x,y,1,1)}
 const fan=r=>{g.beginPath();g.moveTo(hx,hy);g.arc(hx,hy,r,-Math.PI*3/4,-Math.PI/4);g.closePath()};
 fan(91);g.fillStyle='#8a6440';g.fill();fan(86);g.fillStyle='#3c9a3c';g.fill();
 g.save();fan(86);g.clip();g.fillStyle='#46aa44';for(let y=0;y<H;y+=8)g.fillRect(0,y,W,4);
 // the infield dirt: an arc round the mound, out past the bases
 g.fillStyle='#c48c56';g.beginPath();g.arc(hx,hy-d*.95,d*1.02,0,7);g.fill();
 g.beginPath();g.moveTo(hx,hy+3);g.lineTo(B1[0]+5,B1[1]);g.lineTo(B2[0],B2[1]-5);g.lineTo(B3[0]-5,B3[1]);g.closePath();g.fill();
 g.restore();
 // the infield grass inside the base paths
 const ins=4.5;g.fillStyle='#3c9a3c';g.beginPath();g.moveTo(hx,hy-ins*1.4);g.lineTo(B1[0]-ins,B1[1]);g.lineTo(B2[0],B2[1]+ins*1.4);g.lineTo(B3[0]+ins,B3[1]);g.closePath();g.fill();
 g.save();g.clip();g.fillStyle='#46aa44';for(let y=0;y<H;y+=8)g.fillRect(0,y,W,4);g.restore();
 g.fillStyle='#c48c56';g.beginPath();g.arc(hx,hy-d*.707,3.6,0,7);g.fill();g.beginPath();g.arc(hx,hy,6,0,7);g.fill();
 g.fillStyle='#f4f1e8';for(let k=0;k<64;k++){g.fillRect(Math.round(hx+k*.707),Math.round(hy-k*.707),1,1);g.fillRect(Math.round(hx-k*.707),Math.round(hy-k*.707),1,1)}
 for(const[x,y]of[B1,B2,B3])g.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);g.fillRect(Math.round(hx)-1,hy-1,3,2);g.fillRect(Math.round(hx)-1,Math.round(hy-d*.707),2,1);
 return lfField=c.toDataURL()}
// the card for a roster player: his collectible card if there is one, else the club's portrait
function lfCard(k,p){if(!CARDS.length)buildCardDB();if(p.signed&&CARD_BY[p.signed])return CARD_BY[p.signed];return CARDS.find(c=>c.k===k&&c.p===p)||CARDS.find(c=>c.k===k&&c.p.name===p.name)||null}
function lfMini(T,k,p,opt){const c=lfCard(k,p),r=c?c.r:0,art=c?cardArt(c):portrait(T,p,k===S.you),o=ovr(p);
 return `<button type="button" class="lfc r${r}${opt.sel?' sel':''}${opt.drop?' drop':''}${p.signed?' signed':''}" data-i="${opt.i}" style="--tj:${T.jersey};--tc:${T.cap}">
  <span class="lfOvr" style="color:${rcol(o)}">${o}</span>${opt.order?`<span class="lfOrd">${opt.order}</span>`:''}
  <img alt="" src="${art}"><span class="lfNm">${p.name}</span><span class="lfPos">${opt.pos}</span></button>`}
function lineupRender(){const key=lnView==='mine'?S.you:S.opp,T=TEAMS[key],mine=lnView==='mine';
 const selPit=lnSel!=null&&lnSel<0,selBat=lnSel!=null&&lnSel>=0;
 let field='';
 T.lineup.forEach((p,i)=>{const pos=LF_POS[p.pos]?p.pos:'DH',[x,y]=LF_POS[pos];field+=`<div class="lfSlot" style="left:${x}%;top:${y}%">${lfMini(T,key,p,{i,order:i+1,pos,sel:lnSel===i,drop:mine&&selBat&&lnSel!==i})}</div>`});
 {const p=T.staff[0],[x,y]=LF_POS.SP;if(p)field+=`<div class="lfSlot" style="left:${x}%;top:${y}%">${lfMini(T,key,p,{i:-1,pos:'SP',sel:lnSel===-1})}</div>`}
 const pen=T.staff.slice(1).map((p,j)=>lfMini(T,key,p,{i:-2-j,pos:p.pos||'RP',sel:lnSel===-2-j})).join('');
 // the tray: the cards you own, hitters or pitchers, best first; a selected spot narrows it to cards that fit
 let tray='';
 if(mine){if(selPit)lfDeck='pit';else if(selBat)lfDeck='bat';
  if(!CARDS.length)buildCardDB();const used=usedCards(S.you);
  const own=CARDS.filter(c=>COL.owned[c.id]&&c.pit===(lfDeck==='pit')).sort((a,b)=>b.o-a.o);
  tray=own.length?own.map(c=>{const q=c.p,T2=c.T||TEAMS[c.k],inUse=used.has(c.id);
    return `<button type="button" class="lfc deck r${c.r}${inUse?' used':''}${lnSel!=null&&!inUse?' ready':''}" data-id="${c.id}" ${inUse?'disabled':''} style="--tj:${T2.jersey};--tc:${T2.cap}">
     <span class="lfOvr" style="color:${rcol(c.o)}">${c.o}</span><img alt="" src="${cardArt(c)}"><span class="lfNm">${q.name}</span><span class="lfPos">${c.pit?(q.pos==='SP'?'SP':'RP'):q.pos}${inUse?' · IN':''}</span></button>`}).join('')
   :`<p class="lfEmpty">No ${lfDeck==='pit'?'pitcher':'hitter'} cards yet. Open packs in the Card Collection to get players.</p>`}
 const sel=lnSel==null?null:lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];
 const hint=!mine?'Scouting report: their lineup in the field, their staff in the bullpen.':sel?(lnSel>=0?`<b>${sel.name}</b> (${sel.pos}) picked up. Tap a card below to sign it into his spot, or another player on the field to swap batting order.`:`<b>${sel.name}</b> picked up. Tap a pitcher card below to sign it into his spot.`):'Tap a player on the field to change him.';
 $('cards').innerHTML=`<div class="lfWrap"><div class="lfField" style="background-image:url(${lfFieldArt()})">${field}<span class="lfDhTag">DH</span></div>
  <div class="lfSide"><h4>BULLPEN</h4><div class="lfPen">${pen}</div>${mine&&sel&&sel.signed?`<button type="button" class="mbtn lfRestore">Restore original player</button>`:''}</div></div>
  <p class="lfHint">${hint}</p>
  ${mine?`<div class="lfTrayHead"><h4>YOUR CARDS</h4><div class="seg lfTabs"><button type="button" data-d="bat" aria-pressed="${lfDeck==='bat'}">Hitters</button><button type="button" data-d="pit" aria-pressed="${lfDeck==='pit'}">Pitchers</button></div></div><div class="lfTray">${tray}</div>`:''}`;
 $('lnHint').textContent='';}
$('cards').addEventListener('click',e=>{
 const tab=e.target.closest('.lfTabs button');if(tab){lfDeck=tab.dataset.d;lnSel=null;lineupRender();return}
 if(lnView!=='mine')return;
 if(e.target.closest('.lfRestore')){const T=TEAMS[S.you],p=lnSel>=0?T.lineup[lnSel]:T.staff[-1-lnSel];if(p){const real=p.custom?T.benched||p:p;releasePlayer(S.you,real.signedFor||real.name,lnSel<0);applyDefense();updateHUD()}lnSel=null;lineupRender();return}
 const b=e.target.closest('.lfc');if(!b)return;
 if(b.classList.contains('deck')){if(b.disabled||lnSel==null){if(!b.disabled&&lnSel==null){b.classList.add('nudge');setTimeout(()=>b.classList.remove('nudge'),300)}return}
  const T=TEAMS[S.you],pit=lnSel<0,p=pit?T.staff[-1-lnSel]:T.lineup[lnSel],real=p.custom?T.benched||p:p;
  if(signPlayer(S.you,real.signedFor||real.name,b.dataset.id,pit)){applyDefense();updateHUD();try{sfx('glove')}catch(_){}}lnSel=null;lineupRender();return}
 const i=+b.dataset.i;
 if(lnSel===i){lnSel=null}
 else if(lnSel!=null&&lnSel>=0&&i>=0){const L=TEAMS[S.you].lineup;[L[lnSel],L[i]]=[L[i],L[lnSel]];const ci=L.findIndex(p=>p.custom);if(ci>=0){CUSTOM.slot=ci;saveCustom()}applyDefense();updateHUD();lnSel=null}
 else lnSel=i;
 lineupRender()});
