// ---------- trading cards: every player in the league is a collectible card ----------
const RARITY=['COMMON','RARE','EPIC','LEGEND'];
let CARDS=[],CARD_BY={};
let COL={packs:3,owned:{},seen:{},lv:{},mig:1};
try{const v=JSON.parse(localStorage.getItem('pd-cards')||'null');if(v&&typeof v==='object')COL={packs:v.packs|0,owned:v.owned||{},seen:v.seen||{},lv:v.lv||{},mig:v.mig|0}}catch(e){}
const saveCol=()=>{try{localStorage.setItem('pd-cards',JSON.stringify(COL))}catch(e){}};
function buildCardDB(){
 CARDS=[];for(const k of ORDER){const T=TEAMS[k];
  T.lineup.forEach((p,i)=>{const q=p.custom?T.benched:p;if(q)CARDS.push({id:k+':'+i,k,p:q,pit:false,set:'club'})});
  (T.staff||[T.pitcher]).forEach((p,j)=>CARDS.push({id:k+':p'+j,k,p,pit:true,set:'club'}))}
 const sorted=CARDS.map(c=>ovr(c.p)).sort((a,b)=>b-a),cut=f=>sorted[Math.floor(sorted.length*f)];
 const L=cut(.08),E=cut(.25),Rr=cut(.55);
 for(const c of CARDS){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl};const o=ovr(c.p);c.o=o;c.r=o>=L?3:o>=E?2:o>=Rr?1:0;if(c.p.type&&c.r<2)c.r=2;CARD_BY[c.id]=c}
 for(const c of buildFreeAgents()){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl};c.o=ovr(c.p);CARDS.push(c);CARD_BY[c.id]=c}
 {const F=CARDS.filter(c=>c.set==='fa'),s=F.map(c=>c.o).sort((a,b)=>b-a),cut=f=>s[Math.floor(s.length*f)],L=cut(.08),E=cut(.25),R=cut(.55);for(const c of F){c.r=c.o>=L?3:c.o>=E?2:c.o>=R?1:0;if(c.p.type&&c.r<2)c.r=2}}
 for(const c of buildBigLeague()){c.b={con:c.p.con,pow:c.p.pow,spd:c.p.spd,def:c.p.def,vel:c.p.vel,mov:c.p.mov,ctl:c.p.ctl};CARDS.push(c);CARD_BY[c.id]=c}
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
 const st=(c.pit?[['VEL','vel'],['MOV','mov'],['CTL','ctl'],['DEF','def']]:[['CON','con'],['POW','pow'],['SPD','spd'],['DEF','def']]).map(([k,f])=>[k,p[f],lv[f]|0]);
 const tag=(p.slot==='side'?' · SIDEARM':'')+(p.type==='demon'?' · DEMON':p.type==='knuckle'?' · KNUCKLER':'');
 return `<div class="tc r${c.r}${lock?' lock':''}${c.set==='bl'?' bl':''}" data-id="${c.id}" style="--tj:${T.jersey};--tc:${T.cap}">
  <div class="tcHead"><img alt="" src="${cardLogo(c)}">${c.set==='bl'||c.set==='fa'?`<span class="city">${T.city}</span>`:''}<span class="ovr"${lock?'':` style="color:${rcol(o)}"`}>${lock?'??':o}</span></div>
  <img class="art" alt="" src="${cardArt(c)}">
  <div class="nm">${lock?'???':p.name}</div>
  <div class="ps"><span>${p.no!=null?'#'+p.no+' ':''}${c.pit?(p.pos==='SP'?'SP':'RP'):p.pos}</span><span>${c.pit?'T':'B'} ${p.hand}</span></div>
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
function drawPack(cv,set){const g=cv.getContext('2d'),bl=set==='bl',T=bl?{jersey:'#1d3f7a',cap:'#c8202a'}:{jersey:'#4b535c',cap:'#ffbf3c'};g.clearRect(0,0,48,64);
 g.fillStyle='#1b1f24';g.fillRect(2,2,44,60);g.fillStyle=T.jersey;g.fillRect(4,4,40,56);g.fillStyle=T.cap;g.fillRect(4,4,40,8);g.fillRect(4,52,40,8);
 g.fillStyle='rgba(255,255,255,.25)';for(let x=4;x<44;x+=4){g.fillRect(x,4,2,2);g.fillRect(x+2,58,2,2)}
 g.fillStyle='#ffbf3c';g.fillRect(8,16,32,24);g.fillStyle='#1b1f24';g.fillRect(10,18,28,20);
 g.fillStyle='#f4f1e8';g.beginPath();g.moveTo(24,20);g.lineTo(34,28);g.lineTo(24,36);g.lineTo(14,28);g.closePath();g.fill();
 g.fillStyle='#c48c56';g.beginPath();g.moveTo(24,24);g.lineTo(29,28);g.lineTo(24,32);g.lineTo(19,28);g.closePath();g.fill();
 g.fillStyle='#ffbf3c';g.font='6px "Press Start 2P", monospace';g.textAlign='center';g.fillText(bl?'BIG LG':'FREE AG',24,48);g.textAlign='left';
 if(bl){g.fillStyle='#f4f1e8';for(const[x,y]of[[8,7],[24,7],[40,7],[16,55],[32,55]])g.fillRect(x-1,y-1,3,3)}}
function rollCard(minR,set){set=set||'fa';const w=set==='bl'?[0,70,24,6]:[60,28,10,2.6];let r;do{let x=Math.random()*w.reduce((a,b)=>a+b),i=0;while(x>w[i]){x-=w[i];i++}r=i}while(r<minR);
 const all=CARDS.filter(c=>c.set===set);let pool=all.filter(c=>c.r===r);if(!pool.length)pool=all;return pick(pool)}
function openPack(set,paid){set=set||'fa';
 if(!paid&&COL.packs<=0)return;if(!CARDS.length)buildCardDB();
 if(!paid)COL.packs--;const got=[];for(let i=0;i<5;i++)got.push(rollCard(i===4&&!got.some(c=>c.r>=1)?1:0,set));
 got.sort((a,b)=>a.r-b.r);
 const fresh=got.map(c=>{const n=!COL.owned[c.id];COL.owned[c.id]=(COL.owned[c.id]|0)+1;return n});saveCol();
 const pk=$(set==='bl'?'shopCvB':'shopCvK');if(pk)pk.classList.add('shake');sfx('woosh');updatePackBadge();
 setTimeout(()=>{if(pk)pk.classList.remove('shake');
  $('rvTitle').textContent=got.some(c=>c.r===3)?'LEGEND PULL!':got.some(c=>c.r===2)?'EPIC PULL!':'PACK OPENED';
  $('rvCards').innerHTML=got.map((c,i)=>`<button type="button" class="flip r${c.r}" data-i="${i}"><div class="in"><div class="bk">POCKET<br>DIAMOND<br>★</div><div class="fr">${cardHTML(c,{isNew:fresh[i],noCount:true})}</div></div></button>`).join('');
  $('reveal').hidden=false;$('rvAll').hidden=false;renderBinder();shopRender()},650)}
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

