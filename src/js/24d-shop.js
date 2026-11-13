// ---------- the shop, the inventory and levelling up ----------
// Packs cost coins (200 each); games no longer hand them out. Every card you own sits in the inventory. A duplicate copy
// can be spent to level a player up: +1 to a rating of your choice (up to 99). A levelled player plays at his levelled
// ratings whenever he plays for your club, as one of its own players or signed into your lineup. Online, the levels travel
// with the roster spec, so both phones field the same players.
const PACK_COST=200;
const LV_KEYS={bat:['con','pow','spd','def'],pit:['vel','mov','ctl']};
const LV_NAME={con:'CON',pow:'POW',spd:'SPD',def:'DEF',vel:'VEL',mov:'MOV',ctl:'CTL'};
const lvOf=id=>(COL.lv&&COL.lv[id])||{};
const lvN=id=>Object.values(lvOf(id)).reduce((a,b)=>a+(b|0),0);
// a card's ratings with its levels on top (only the ratings the card has)
function cardEff(c,lv){lv=lv||lvOf(c.id);const b=c.b||c.p,o={};for(const k in b){if(b[k]==null)continue;o[k]=Math.min(99,b[k]+(lv[k]|0))}return o}
// spend one duplicate on +1 to a rating
function levelUp(id,key){const c=CARD_BY[id],own=COL.owned[id]|0;if(!c||own<2)return false;const b=(c.b||c.p)[key];if(b==null)return false;
 const lv=COL.lv[id]=COL.lv[id]||{};if(b+(lv[key]|0)>=99)return false;lv[key]=(lv[key]|0)+1;COL.owned[id]=own-1;saveCol();applyLevels();return true}
// the club's own players take their card's levels in place (only for your club; everyone else plays at their base ratings)
function applyLevels(){if(!CARDS.length)return;const you=S.you;
 for(const c of CARDS){if(c.set!=='kbo'||!c.b)continue;const lv=c.k===you?lvOf(c.id):{};for(const k in c.b){if(c.b[k]==null)continue;c.p[k]=Math.min(99,c.b[k]+(lv[k]|0))}}
 // signed players carry their levels with them
 for(const k of ORDER){const T=TEAMS[k];for(const arr of[T.lineup,T.staff,T.benched?[T.benched]:[]])for(const p of arr){if(!p||!p.signed||!CARD_BY[p.signed])continue;const e=cardEff(CARD_BY[p.signed],p.lvSpec||lvOf(p.signed));for(const kk in e)p[kk]=e[kk]}}}
// the native card for a player of club k
const nativeCard=(k,name)=>CARDS.find(c=>c.set==='kbo'&&c.k===k&&c.p.name===name);
// ---- the zoomed card, with its level-up panel ----
let ZOOM=null;
function zoomOpen(id){ZOOM=id;zoomRender();$('zoomCard').hidden=false}
function zoomRender(){const c=CARD_BY[ZOOM];if(!c)return;const own=COL.owned[c.id]|0,spare=Math.max(0,own-1),keys=LV_KEYS[c.pit?'pit':'bat'],e=cardEff(c),lv=lvOf(c.id),n=lvN(c.id);
 const btns=keys.map(k=>{const v=e[k],max=v>=99;return`<button type="button" class="lvUp" data-k="${k}" ${!spare||max?'disabled':''}><b>${LV_NAME[k]}</b><span>${v}${lv[k]?` <i>+${lv[k]}</i>`:''}</span><em>${max?'MAX':'+1'}</em></button>`}).join('');
 $('zoomCard').innerHTML=`<div class="zoomWrap">${cardHTML(c)}<div class="lvPanel"><div class="lvHead"><b>LEVEL ${n+1}</b><span>${spare?`${spare} spare cop${spare>1?'ies':'y'} · each one is +1 to a rating`:'Get a duplicate of this card to level him up'}</span></div><div class="lvBtns">${btns}</div>
  <p class="lvNote">${c.set==='kbo'?`Plays at these ratings for ${c.k===S.you?'your club':`your club when signed (or when you play as ${TEAMS[c.k].name})`}.`:'Plays at these ratings when signed into your lineup.'}</p><button type="button" class="mbtn lvClose">Close</button></div></div>`}
$('zoomCard').addEventListener('click',e=>{const b=e.target.closest('.lvUp');if(b){if(!b.disabled&&levelUp(ZOOM,b.dataset.k)){sfx('glove');zoomRender();renderBinder();const t=$('zoomCard').querySelector(`.lvUp[data-k="${b.dataset.k}"]`);if(t){t.classList.add('pop');setTimeout(()=>t.classList.remove('pop'),400)}}return}
 if(e.target.closest('.lvPanel')&&!e.target.closest('.lvClose'))return;$('zoomCard').hidden=true;ZOOM=null});
// ---- the shop ----
function shopRender(){if(!$('scrShop'))return;$('shopBal').innerHTML=`<i class="coinIc"></i>${coinFmt(WAL.coins)} COINS`;
 for(const b of document.querySelectorAll('.shopBuy'))b.disabled=WAL.coins<PACK_COST;
 $('shopOwn').hidden=COL.packs<=0;$('shopOwnTxt').textContent=COL.packs===1?'You have 1 unopened pack.':`You have ${COL.packs} unopened packs.`;
 drawPack($('shopCvK'),'kbo');drawPack($('shopCvB'),'bl');updatePackBadge()}
function shopMsg(t){$('shopMsg').textContent=t;clearTimeout(shopMsg.t);shopMsg.t=setTimeout(()=>{$('shopMsg').textContent=''},3500)}
function shopOpen(from){$('shopBack').dataset.go=from||'scrMain';shopRender();showScreen('scrShop')}
function invOpen(from){$('invBack').dataset.go=from||'scrMain';showScreen('scrCards')}
for(const b of document.querySelectorAll('.shopBuy'))b.addEventListener('click',()=>{ensureAudio();if(WAL.coins<PACK_COST){shopMsg(`You need ${coinFmt(PACK_COST-WAL.coins)} more coins.`);return}
 WAL.coins-=PACK_COST;saveWal();coinUI();shopRender();shopMsg(`Bought a ${b.dataset.set==='bl'?'Big League':'KBO'} pack for ${PACK_COST} coins.`);openPack(b.dataset.set,true)});
$('shopOpenOwn').addEventListener('click',()=>{ensureAudio();openPack('kbo',false);shopRender()});
$('shopToInv').addEventListener('click',()=>invOpen('scrShop'));
$('goShop').addEventListener('click',()=>{ensureAudio();shopOpen('scrMain')});
$('goInv').addEventListener('click',()=>{ensureAudio();invOpen('scrMain')});
// the single-player Cards tile opens the inventory, and comes back to single player
for(const t of document.querySelectorAll('#scrSingle .tile[data-go="scrCards"]'))t.addEventListener('click',()=>{$('invBack').dataset.go='scrSingle'});
