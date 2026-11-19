// ---------- trading cards: every player in the league is a collectible card ----------
const RARITY=['COMMON','RARE','EPIC','LEGEND'],FA_POW_CAP=[70,80,85,95];
let CARDS=[],CARD_BY={};
let COL={packs:3,owned:{},seen:{},lv:{},mig:1};
try{const v=JSON.parse(localStorage.getItem('pd-cards')||'null');if(v&&typeof v==='object')COL={packs:v.packs|0,owned:v.owned||{},seen:v.seen||{},lv:v.lv||{},mig:v.mig|0}}catch(e){}
const saveCol=()=>{try{localStorage.setItem('pd-cards',JSON.stringify(COL))}catch(e){}};
function buildCardDB(){
 /* each club's own players, as built: after a club switch your roster wears another club's kit, but a card always
    belongs to the club the player came from (so its id and rarity are the same whatever club you play as) */
 CARDS=[];for(const k of ORDER){const T=TEAMS[k],O=typeof PRISTINE!=='undefined'&&PRISTINE[k];
  (O?O.L:T.lineup).forEach((p,i)=>{const q=p.custom?T.benched:p;if(q)CARDS.push({id:k+':'+i,k,p:q,pit:false,set:'club'})});
  /* (in the club's original order, so a card's id never follows the rotation around) */
  (O?O.P:(T.orig&&T.orig.P)||T.staff||[T.pitcher]).forEach((p,j)=>CARDS.push({id:k+':p'+j,k,p,pit:true,set:'club'}));(O?O.R:(T.orig&&T.orig.R)||T.rot||[]).forEach((p,j)=>CARDS.push({id:k+':r'+j,k,p,pit:true,set:'club'}))}
 const sorted=CARDS.map(c=>ovr(c.p)).sort((a,b)=>b-a),cut=f=>sorted[Math.floor(sorted.length*f)];
 const L=cut(.08),E=cut(.25),Rr=cut(.55);
 for(const c of CARDS){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl,sta:c.pit?staOf(c.p):null};const o=ovr(c.p);c.o=o;c.r=o>=L?3:o>=E?2:o>=Rr?1:0;if(c.p.type&&c.r<2)c.r=2;CARD_BY[c.id]=c}
 for(const c of buildFreeAgents()){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl,sta:c.pit?staOf(c.p):null};c.o=ovr(c.p);CARDS.push(c);CARD_BY[c.id]=c}
 {const F=CARDS.filter(c=>c.set==='fa'),s=F.map(c=>c.o).sort((a,b)=>b-a),cut=f=>s[Math.floor(s.length*f)],L=cut(.08),E=cut(.25),R=cut(.55);for(const c of F){c.r=c.o>=L?3:c.o>=E?2:c.o>=R?1:0;if(c.p.type&&c.r<2)c.r=2}
  /* a free agent's power tops out by rarity: common 70, rare 80, epic 85, legend 95 (a ceiling, not a target) */
  for(const c of F){const cap=FA_POW_CAP[c.r];if(c.p.pow!=null&&c.p.pow>cap){c.p.pow=c.b.pow=cap;c.o=ovr(c.p)}}}
 for(const c of buildBigLeague()){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl,sta:c.pit?staOf(c.p):null};CARDS.push(c);CARD_BY[c.id]=c}
 /* closers (CP): the legendary relief cards, so they're the rarer, better relievers */
 for(const c of CARDS)if(c.set!=='club'&&c.pit&&c.p.pos==='RP'&&c.r>=3)c.p.cp=true
}
const ART={};
function cardArt(c,tk){const key=c.id+(tk?'@'+tk:'');if(ART[key])return ART[key];try{return ART[key]=cardArt2(c,tk)}catch(e){console.warn(e)}
 const T=c.T||TEAMS[c.k],ST2=c.set==='bl'||!STADIUMS[c.k]?BL_PARK:STADIUMS[c.k],p=c.p,cv2=document.createElement('canvas');cv2.width=64;cv2.height=80;const g=cv2.getContext('2d');
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
 const sk=p.skin||skinOf(p.name),flipL=c.pit?p.hand==='L':p.hand==='L';
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
function cardHTML(c,opts){opts=opts||{};const T=c.T||TEAMS[c.k],own=COL.owned[c.id]|0,lock=opts.lock,lv=lvOf(c.id),n=lvN(c.id),p={...c.p,...cardEff(c)},o=n?ovr(p):c.o;
 const st=(c.pit?[['VEL','vel'],['MOV','mov'],['CTL','ctl'],['STA','sta']]:[['CON','con'],['POW','pow'],['SPD','spd'],['DEF','def']]).map(([k,f])=>[k,f==='sta'?staOf(p):p[f],lv[f]|0]);
 const tag=(p.slot==='side'?' · SIDEARM':'')+(isDemon(p)?' · DEMON':p.type==='knuckle'?' · KNUCKLER':'');
 return `<div class="tc r${c.r}${lock?' lock':''}${c.set==='bl'?' bl':''}" data-id="${c.id}" style="--tj:${T.jersey};--tc:${T.cap}">
  <div class="tcHead"><img alt="" src="${cardLogo(c)}">${c.set==='bl'||c.set==='fa'?`<span class="city">${T.city}</span>`:''}<span class="ovr"${lock?'':` style="color:${rcol(o)}"`}>${lock?'??':o}</span></div>
  <img class="art" alt="" src="${cardArt(c)}">
  <div class="nm">${lock?'???':p.name}</div>
  <div class="ps"><span>${p.no!=null?'#'+p.no+' ':''}${c.pit?(p.pos==='SP'?'SP':p.cp?'CP':'RP'):p.pos}</span><span>${c.pit?'T':'B'} ${p.hand}</span></div>
  <div class="st">${st.map(([k,v,up])=>`<span${up&&!lock?' class="up"':''}>${k}<b${lock||v==null?'':` style="color:${rcol(v)}"`}>${lock||v==null?'–':v}</b></span>`).join('')}</div>
  <div class="rar">${RARITY[c.r]}${tag}</div>
  ${!lock&&own>1&&!opts.noCount?`<em class="cnt">x${own}</em>`:''}${!lock&&n?`<em class="lvB">LV ${n+1}</em>`:''}${opts.isNew?'<em class="new">NEW</em>':''}</div>`}
let binderTeam='all',binderSet='fa';
function renderBinder(){
 if(!CARDS.length)buildCardDB();
 const SET=CARDS.filter(c=>c.set===binderSet),ownedN=SET.filter(c=>COL.owned[c.id]).length;
 $('ckProg').textContent=`Collected ${ownedN} / ${SET.length}`;
 for(const b of $('ckSet').children)b.setAttribute('aria-pressed',String(b.dataset.v===binderSet));
 $('ckFilter').innerHTML=binderSet==='bl'||binderSet==='fa'?['all','bat','pit'].map(k=>`<button type="button" data-k="${k}" aria-pressed="${binderTeam===k}">${{all:'All',bat:'Hitters',pit:'Pitchers'}[k]}</button>`).join(''):`<button type="button" data-k="all" aria-pressed="${binderTeam==='all'}">All</button>`+ORDER.map(k=>{const n=CARDS.filter(c=>c.k===k&&COL.owned[c.id]).length,t=CARDS.filter(c=>c.k===k).length;return`<button type="button" data-k="${k}" aria-pressed="${binderTeam===k}"><img alt="" src="${LOGO_URL[k]}">${n}/${t}</button>`}).join('');
 const list=SET.filter(c=>binderTeam==='all'||(binderTeam==='pit')===c.pit).slice().sort((a,b)=>(!!COL.owned[b.id]-!!COL.owned[a.id])||b.r-a.r||b.o-a.o);
 $('binder').innerHTML=list.map(c=>cardHTML(c,{lock:!COL.owned[c.id]})).join('');
 updatePackBadge();
}
function updatePackBadge(){for(const id of['pkBadge','pkBadge2']){const b=$(id);if(!b)continue;b.hidden=COL.packs<=0;b.textContent=COL.packs}}
/* a sealed foil pack, drawn pixel by pixel on a 40x56 canvas: crimped ends, a foil body with diagonal sheen bands, and
   a badge in the middle (Free Agent: a baseball on a gold diamond; Big League: a gold star on navy and red) */
function drawPack(cv,set){if(!cv)return;cv.width=40;cv.height=56;const g=cv.getContext('2d'),bl=set==='bl';g.clearRect(0,0,40,56);
 const C=bl?{body:'#1c3b78',dark:'#12285a',band:'#c8202a',bandD:'#8e1219',crimp:'#e9e6ff',crimpD:'#9aa6c8',hi:'rgba(255,255,255,.16)'}
  :{body:'#3d5a4c',dark:'#28403a',band:'#ffbf3c',bandD:'#c7871a',crimp:'#f4ead0',crimpD:'#b8ab88',hi:'rgba(255,255,255,.14)'};
 const R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 /* crimped top and bottom seals (teeth every other pixel) */
 for(const y0 of[1,49]){R(C.crimpD,3,y0,34,6);R(C.crimp,3,y0+1,34,4);for(let x=3;x<37;x+=2){R(C.crimpD,x,y0+(y0<10?0:5),1,1)}for(let x=4;x<37;x+=3)R(C.crimpD,x,y0+2,1,2)}
 /* body */
 R('#0b130e',2,7,36,42);R(C.dark,3,7,34,42);R(C.body,4,7,32,42);
 g.save();g.beginPath();g.rect(4,7,32,42);g.clip();g.fillStyle=C.hi;for(let k=-56;k<56;k+=11){g.beginPath();g.moveTo(k,49);g.lineTo(k+4,49);g.lineTo(k+4+42,7);g.lineTo(k+42,7);g.closePath();g.fill()}g.restore();
 /* coloured bands near the seals */
 R(C.band,4,9,32,4);R(C.bandD,4,12,32,1);R(C.band,4,43,32,4);R(C.bandD,4,43,32,1);
 /* the badge */
 const cx=20,cy=28;
 const dia=(r,c)=>{g.fillStyle=c;for(let dy=-r;dy<=r;dy++){const w=r-Math.abs(dy);g.fillRect(cx-w,cy+dy,w*2+1,1)}};
 if(!bl){dia(12,'#0b130e');dia(11,C.band);dia(9,C.bandD);dia(8,'#1b2a24');
  /* baseball */
  g.fillStyle='#0b130e';for(let dy=-6;dy<=6;dy++){const w=Math.round(Math.sqrt(36-dy*dy));g.fillRect(cx-w,cy+dy,w*2+1,1)}
  g.fillStyle='#f4f1e8';for(let dy=-5;dy<=5;dy++){const w=Math.round(Math.sqrt(25-dy*dy));g.fillRect(cx-w,cy+dy,w*2+1,1)}
  g.fillStyle='#d9d2c0';for(let dy=-5;dy<=5;dy++){const w=Math.round(Math.sqrt(25-dy*dy));g.fillRect(cx+w-1,cy+dy,1,1)}
  g.fillStyle='#c8202a';for(const[x,y]of[[-3,-4],[-4,-2],[-4,0],[-4,2],[-3,4],[3,-4],[4,-2],[4,0],[4,2],[3,4]])g.fillRect(cx+x,cy+y,1,1)}
 else{g.fillStyle='#0b130e';g.fillRect(cx-11,cy-11,23,23);R(C.band,cx-10,cy-10,21,21);R(C.bandD,cx-10,cy+9,21,2);R('#12285a',cx-8,cy-8,17,17);
  /* a five-point star, from a polygon rasterised by the canvas then re-snapped to whole pixels */
  const st=(r1,r2,c,ox,oy)=>{g.fillStyle=c;g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?r2:r1;g.lineTo(Math.round(cx+ox+Math.cos(a)*r),Math.round(cy+oy+Math.sin(a)*r))}g.closePath();g.fill()};
  st(8,3.4,'#0b130e',0,1);st(7,3,'#ffd23f',0,0);st(3,1.3,'#fff3b0',-1,-1);
  for(const x of[-9,9])R('#ffd23f',cx+x,cy-16,2,2);R('#ffd23f',cx-1,cy-17,2,2)}
 /* outline sparkle */
 R('rgba(255,255,255,.55)',6,15,1,3);R('rgba(255,255,255,.55)',5,16,3,1)}
function rollCard(minR,set){set=set||'fa';const w=set==='bl'?[0,0,85,15]:[60,28,10,2.6];let r;do{let x=Math.random()*w.reduce((a,b)=>a+b),i=0;while(x>w[i]){x-=w[i];i++}r=i}while(r<minR);
 const all=CARDS.filter(c=>c.set===set);let pool=all.filter(c=>c.r===r);if(!pool.length)pool=all;return pick(pool)}
function openPack(set,paid){set=set||'fa';
 if(!paid&&COL.packs<=0)return;if(!CARDS.length)buildCardDB();
 if(!paid)COL.packs--;const got=[],n=set==='bl'?1:5;/* a Big League pack is one star (they rate ~90 OVR vs ~69 for free agents) */
 for(let i=0;i<n;i++)got.push(rollCard(set!=='bl'&&i===4&&!got.some(c=>c.r>=1)?1:0,set));
 got.sort((a,b)=>a.r-b.r);
 const fresh=got.map(c=>{const n=!COL.owned[c.id];COL.owned[c.id]=(COL.owned[c.id]|0)+1;return n});saveCol();
 track('pack_opened',{set,paid:!!paid,rarities:got.map(c=>c.r),new_cards:fresh.filter(Boolean).length});
 const pk=$(set==='bl'?'shopCvB':'shopCvK');if(pk)pk.classList.add('shake');sfx('woosh');updatePackBadge();
 setTimeout(()=>{if(pk)pk.classList.remove('shake');
  $('rvTitle').textContent=got.some(c=>c.r===3)?'LEGEND PULL!':got.some(c=>c.r===2)?'EPIC PULL!':'PACK OPENED';
  $('rvCards').innerHTML=got.map((c,i)=>`<button type="button" class="flip r${c.r}" data-i="${i}"><div class="in"><div class="bk">POCKET<br>DIAMOND<br>★</div><div class="fr">${cardHTML(c,{isNew:fresh[i],noCount:true})}</div></div></button>`).join('');
  $('reveal').hidden=false;$('rvAll').hidden=got.length<2;$('rvHint').textContent=got.length<2?'Tap the card to flip it':'Tap each card to flip it';renderBinder();shopRender()},650)}
function flipCard(b){if(!b||b.classList.contains('on'))return;b.classList.add('on');const r=+(b.className.match(/r(\d)/)||[0,0])[1];sfx(r>=2?'bigcheer':'glove');
 if([...document.querySelectorAll('#rvCards .flip')].every(x=>x.classList.contains('on')))$('rvAll').hidden=true}
$('rvCards').addEventListener('click',e=>flipCard(e.target.closest('.flip')));
$('rvAll').addEventListener('click',()=>{const fs=[...document.querySelectorAll('#rvCards .flip:not(.on)')];fs.forEach((b,i)=>setTimeout(()=>flipCard(b),i*160))});
$('rvDone').addEventListener('click',()=>{$('reveal').hidden=true;renderBinder()});
$('ckSet').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;binderSet=b.dataset.v;binderTeam='all';renderBinder()});
$('ckFilter').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;binderTeam=b.dataset.k;renderBinder()});
$('binder').addEventListener('click',e=>{const c=e.target.closest('.tc');if(!c||c.classList.contains('lock'))return;zoomOpen(c.dataset.id)});
function awardPacks(){$('packEarn').hidden=true}// packs are bought with coins in the shop now; games pay coins
$('overCards').addEventListener('click',()=>{$('over').hidden=true;toTitle();shopOpen('scrMain')});

