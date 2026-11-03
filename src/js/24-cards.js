// ---------- trading cards: every player in the league is a collectible card ----------
const RARITY=['COMMON','RARE','EPIC','LEGEND'];
let CARDS=[],CARD_BY={};
let COL={packs:3,owned:{},seen:{}};
try{const v=JSON.parse(localStorage.getItem('pd-cards')||'null');if(v&&typeof v==='object')COL={packs:v.packs|0,owned:v.owned||{},seen:v.seen||{}}}catch(e){}
const saveCol=()=>{try{localStorage.setItem('pd-cards',JSON.stringify(COL))}catch(e){}};
function buildCardDB(){
 CARDS=[];for(const k of ORDER){const T=TEAMS[k];
  T.lineup.forEach((p,i)=>{const q=p.custom?T.benched:p;if(q)CARDS.push({id:k+':'+i,k,p:q,pit:false})});
  (T.staff||[T.pitcher]).forEach((p,j)=>CARDS.push({id:k+':p'+j,k,p,pit:true}))}
 const sorted=CARDS.map(c=>ovr(c.p)).sort((a,b)=>b-a),cut=f=>sorted[Math.floor(sorted.length*f)];
 const L=cut(.08),E=cut(.25),Rr=cut(.55);
 for(const c of CARDS){const o=ovr(c.p);c.o=o;c.r=o>=L?3:o>=E?2:o>=Rr?1:0;if(c.p.type&&c.r<2)c.r=2;CARD_BY[c.id]=c}
}
const ART={};
function cardArt(c){if(ART[c.id])return ART[c.id];
 const T=TEAMS[c.k],ST2=STADIUMS[c.k],p=c.p,cv2=document.createElement('canvas');cv2.width=64;cv2.height=80;const g=cv2.getContext('2d');
 const rr=mulberry32(hash(c.id+'art'));
 // backdrop: crowd, wall, grass, dirt where he plays
 g.fillStyle=ST2.seat[0];g.fillRect(0,0,64,22);
 const shirts=['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f38d2e','#f1ecdc','#6c7a86',T.jersey,T.jersey,T.cap];
 for(let y=1;y<21;y+=3)for(let x=(y%2);x<64;x+=3)if(rr()<.7){g.fillStyle=shirts[Math.floor(rr()*shirts.length)];g.fillRect(x,y,2,2);g.fillStyle=SKINS[Math.floor(rr()*5)];g.fillRect(x,y-1,2,1)}
 g.fillStyle=ST2.pad;g.fillRect(0,22,64,5);g.fillStyle=ST2.pad2;g.fillRect(0,26,64,1);
 for(let y=27;y<80;y++){g.fillStyle=ST2.grass[(Math.floor((y-27)/6)&1)];g.fillRect(0,y,64,1)}
 g.fillStyle='#c48c56';
 if(c.pit){g.beginPath();g.ellipse(32,70,26,9,0,0,Math.PI*2);g.fill();g.fillStyle='#f4f1e8';g.fillRect(28,68,8,2)}
 else{g.fillRect(0,60,64,20);g.fillStyle='#b8804a';for(let k=0;k<40;k++)g.fillRect(Math.floor(rr()*64),60+Math.floor(rr()*20),1,1);g.fillStyle='#f4f1e8';g.fillRect(6,64,1,14);g.fillRect(6,64,18,1)}
 // the player, drawn big
 g.save();g.scale(2,2);
 const sk=skinOf(p.name),flipL=c.pit?p.hand==='L':p.hand==='L';
 const v=hash(c.id)%3;
 if(c.pit){
  const o={legs:v===2?'kick':'stride',arms:v===2?'set':(p.slot==='side'?'relside':'release'),skin:sk,pants:'#eeeae0',flip:flipL,glove:true};
  drawPlayer(g,16,36,T,o);
 }else if(p.spd>=80&&v!==0){drawPlayer(g,16,36,T,{legs:'run',arms:'run',frame:1,skin:sk,pants:'#eeeae0',helmet:true,flip:flipL})}
 else if(p.pow>=80&&v===2){drawPlayer(g,16,36,T,{legs:'stand',arms:'punch',skin:sk,pants:'#eeeae0',helmet:true,flip:flipL});drawBatFree(g,flipL?8:24,20,flipL?2.4:.7,p.bat||'#d9b07a',1)}
 else if(p.def>=82&&v===1){drawPlayer(g,16,36,T,{legs:'ready',arms:'catch',skin:sk,pants:'#eeeae0',flip:flipL,glove:true})}
 else{drawPlayer(g,16,36,T,{legs:'stride',arms:'bat',skin:sk,pants:'#eeeae0',helmet:true,flip:flipL});const h=p.hand==='L'?'L':'R';drawBat(g,16,36,(h==='R'?-40:220)*RAD,h,p.bat||'#d9b07a')}
 g.restore();
 // motion dust
 g.fillStyle='rgba(244,241,232,.5)';for(let k=0;k<5;k++)g.fillRect(8+Math.floor(rr()*48),66+Math.floor(rr()*10),2,1);
 return ART[c.id]=cv2.toDataURL()}
function cardHTML(c,opts){opts=opts||{};const T=TEAMS[c.k],p=c.p,own=COL.owned[c.id]|0,lock=opts.lock;
 const st=c.pit?[['VEL',p.vel],['MOV',p.mov],['CTL',p.ctl],['DEF',p.def]]:[['CON',p.con],['POW',p.pow],['SPD',p.spd],['DEF',p.def]];
 const tag=p.type==='demon'?' · DEMON':p.type==='knuckle'?' · KNUCKLER':'';
 return `<div class="tc r${c.r}${lock?' lock':''}" data-id="${c.id}" style="--tj:${T.jersey};--tc:${T.cap}">
  <div class="tcHead"><img alt="" src="${LOGO_URL[c.k]}"><span class="ovr"${lock?'':` style="color:${rcol(c.o)}"`}>${lock?'??':c.o}</span></div>
  <img class="art" alt="" src="${cardArt(c)}">
  <div class="nm">${lock?'???':p.name}</div>
  <div class="ps"><span>#${p.no} ${c.pit?(p.pos==='SP'?'SP':'RP'):p.pos}</span><span>${c.pit?'T':'B'} ${p.hand}</span></div>
  <div class="st">${st.map(([k,v])=>`<span>${k}<b${lock?'':` style="color:${rcol(v)}"`}>${lock?'–':v}</b></span>`).join('')}</div>
  <div class="rar">${RARITY[c.r]}${tag}</div>
  ${!lock&&own>1&&!opts.noCount?`<em class="cnt">x${own}</em>`:''}${opts.isNew?'<em class="new">NEW</em>':''}</div>`}
let binderTeam='all';
function renderBinder(){
 if(!CARDS.length)buildCardDB();
 const ownedN=CARDS.filter(c=>COL.owned[c.id]).length;
 $('ckProg').textContent=`Collected ${ownedN} / ${CARDS.length}`;
 $('packN').textContent=COL.packs===1?'1 PACK':`${COL.packs} PACKS`;$('openPack').disabled=COL.packs<=0;
 $('ckFilter').innerHTML=`<button type="button" data-k="all" aria-pressed="${binderTeam==='all'}">All</button>`+ORDER.map(k=>{const n=CARDS.filter(c=>c.k===k&&COL.owned[c.id]).length,t=CARDS.filter(c=>c.k===k).length;return`<button type="button" data-k="${k}" aria-pressed="${binderTeam===k}"><img alt="" src="${LOGO_URL[k]}">${n}/${t}</button>`}).join('');
 const list=CARDS.filter(c=>binderTeam==='all'||c.k===binderTeam).slice().sort((a,b)=>(!!COL.owned[b.id]-!!COL.owned[a.id])||b.r-a.r||b.o-a.o);
 $('binder').innerHTML=list.map(c=>cardHTML(c,{lock:!COL.owned[c.id]})).join('');
 drawPack();updatePackBadge();
}
function updatePackBadge(){const b=$('pkBadge');if(!b)return;b.hidden=COL.packs<=0;b.textContent=COL.packs}
function drawPack(){const g=$('packCv').getContext('2d'),T=TEAMS[S.you];g.clearRect(0,0,48,64);
 g.fillStyle='#1b1f24';g.fillRect(2,2,44,60);g.fillStyle=T.jersey;g.fillRect(4,4,40,56);g.fillStyle=T.cap;g.fillRect(4,4,40,8);g.fillRect(4,52,40,8);
 g.fillStyle='rgba(255,255,255,.25)';for(let x=4;x<44;x+=4){g.fillRect(x,4,2,2);g.fillRect(x+2,58,2,2)}
 g.fillStyle='#ffbf3c';g.fillRect(8,16,32,24);g.fillStyle='#1b1f24';g.fillRect(10,18,28,20);
 g.fillStyle='#f4f1e8';g.beginPath();g.moveTo(24,20);g.lineTo(34,28);g.lineTo(24,36);g.lineTo(14,28);g.closePath();g.fill();
 g.fillStyle='#c48c56';g.beginPath();g.moveTo(24,24);g.lineTo(29,28);g.lineTo(24,32);g.lineTo(19,28);g.closePath();g.fill();
 g.fillStyle='#ffbf3c';g.font='6px "Press Start 2P", monospace';g.textAlign='center';g.fillText('CARDS',24,48);g.textAlign='left'}
function rollCard(minR){const w=[60,28,10,2.6];let r;do{let x=Math.random()*w.reduce((a,b)=>a+b),i=0;while(x>w[i]){x-=w[i];i++}r=i}while(r<minR);
 let pool=CARDS.filter(c=>c.r===r);if(!pool.length)pool=CARDS;return pick(pool)}
function openPack(){
 if(COL.packs<=0)return;if(!CARDS.length)buildCardDB();
 COL.packs--;const got=[];for(let i=0;i<5;i++)got.push(rollCard(i===4&&!got.some(c=>c.r>=1)?1:0));
 got.sort((a,b)=>a.r-b.r);
 const fresh=got.map(c=>{const n=!COL.owned[c.id];COL.owned[c.id]=(COL.owned[c.id]|0)+1;return n});saveCol();
 const pk=$('packBtn');pk.classList.add('shake');sfx('woosh');
 setTimeout(()=>{pk.classList.remove('shake');
  $('rvTitle').textContent=got.some(c=>c.r===3)?'LEGEND PULL!':got.some(c=>c.r===2)?'EPIC PULL!':'PACK OPENED';
  $('rvCards').innerHTML=got.map((c,i)=>`<button type="button" class="flip r${c.r}" data-i="${i}"><div class="in"><div class="bk">POCKET<br>DIAMOND<br>★</div><div class="fr">${cardHTML(c,{isNew:fresh[i],noCount:true})}</div></div></button>`).join('');
  $('reveal').hidden=false;$('rvAll').hidden=false;renderBinder()},650)}
function flipCard(b){if(!b||b.classList.contains('on'))return;b.classList.add('on');const r=+(b.className.match(/r(\d)/)||[0,0])[1];sfx(r>=2?'bigcheer':'glove');
 if([...document.querySelectorAll('#rvCards .flip')].every(x=>x.classList.contains('on')))$('rvAll').hidden=true}
$('rvCards').addEventListener('click',e=>flipCard(e.target.closest('.flip')));
$('rvAll').addEventListener('click',()=>{const fs=[...document.querySelectorAll('#rvCards .flip:not(.on)')];fs.forEach((b,i)=>setTimeout(()=>flipCard(b),i*160))});
$('rvDone').addEventListener('click',()=>{$('reveal').hidden=true;renderBinder()});
$('openPack').addEventListener('click',()=>{ensureAudio();openPack()});
$('packBtn').addEventListener('click',()=>{ensureAudio();openPack()});
$('ckFilter').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;binderTeam=b.dataset.k;renderBinder()});
$('binder').addEventListener('click',e=>{const c=e.target.closest('.tc');if(!c||c.classList.contains('lock'))return;$('zoomCard').innerHTML=cardHTML(CARD_BY[c.dataset.id]);$('zoomCard').hidden=false});
$('zoomCard').addEventListener('click',()=>{$('zoomCard').hidden=true});
function awardPacks(win){const n=win?2:1;COL.packs+=n;saveCol();updatePackBadge();const el=$('packEarn');el.textContent=`+${n} card pack${n>1?'s':''} earned${win?' (win bonus)':''} · ${COL.packs} to open`;el.hidden=false}
$('overCards').addEventListener('click',()=>{$('over').hidden=true;toTitle();showScreen('scrCards')});

