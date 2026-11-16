/* ---------- player stats: every game you finish adds to your players' season lines (Team > STATS) ----------
   Built from the match record (23b-match-log.js) when a game ends: each plate appearance your club batted counts for its
   hitter, each one it pitched counts for its pitcher. Kept on this device and in your account's save ('pd-pstats').
   A player is known by the same key the match record uses: his signed card, or club:name. Batting practice doesn't count. */
const PS_KEY='pd-pstats';
let PS=(()=>{try{const v=JSON.parse(localStorage.getItem(PS_KEY)||'null');if(v&&v.p)return v}catch(e){}return{v:1,p:{},games:0}})();
function psSave(){try{localStorage.setItem(PS_KEY,JSON.stringify(PS));if(typeof accDirty==='function')accDirty()}catch(e){}}
const PS_HIT={'1B':1,'2B':2,'3B':3,HR:4},PS_NOAB={BB:1,IBB:1,HBP:1,SF:1,SH:1,OTHER:1};
function psLine(k){return PS.p[k]=PS.p[k]||{g:0,pa:0,ab:0,h:0,d:0,t:0,hr:0,bb:0,k:0,hbp:0,rbi:0,sf:0,bf:0,outs:0,pk:0,pbb:0,ph:0,phr:0,pr:0,pg:0}}
/* the game is over: add its plate appearances to your players' lines (once per game) */
function psRecord(m){if(!m||m.ps||!m.pa||!m.pa.length)return;m.ps=1;const side=m.me||'home',inG=new Set(),pG=new Set();
 for(const c of m.pa){if(c.r==='OTHER'&&!c.om)continue;
  if(c.bs===side){if(c.r==='OTHER')continue;const L=psLine(c.bk);inG.add(c.bk);L.pa++;const hit=PS_HIT[c.r];
   if(!PS_NOAB[c.r])L.ab++;if(hit){L.h++;if(hit===2)L.d++;else if(hit===3)L.t++;else if(hit===4)L.hr++}
   if(c.r==='BB'||c.r==='IBB')L.bb++;else if(c.r==='HBP')L.hbp++;else if(c.r==='K')L.k++;else if(c.r==='SF')L.sf++;L.rbi+=c.rbi|0}
  else{const L=psLine(c.pk);pG.add(c.pk);L.outs+=c.om|0;L.pr+=c.rs|0;if(c.r==='OTHER')continue;L.bf++;
   if(PS_HIT[c.r]){L.ph++;if(c.r==='HR')L.phr++}else if(c.r==='K')L.pk++;else if(c.r==='BB'||c.r==='IBB'||c.r==='HBP')L.pbb++}}
 for(const k of inG)PS.p[k].g++;for(const k of pG)PS.p[k].pg++;PS.games=(PS.games|0)+1;psSave()}
const f3=v=>v==null||!isFinite(v)?'—':v.toFixed(3).replace(/^0/,''),f2=v=>v==null||!isFinite(v)?'—':v.toFixed(2);
const psIP=o=>`${Math.floor(o/3)}${o%3?'.'+(o%3):''}`;
function psRates(L){const avg=L.ab?L.h/L.ab:null,obpD=L.ab+L.bb+L.hbp+L.sf,obp=obpD?(L.h+L.bb+L.hbp)/obpD:null,slg=L.ab?(L.h+L.d+2*L.t+3*L.hr)/L.ab:null;
 return{avg,obp,slg,ops:obp!=null&&slg!=null?obp+slg:null,era:L.outs?L.pr*27/L.outs:null,whip:L.outs?(L.ph+L.pbb)*3/L.outs:null,k9:L.outs?L.pk*27/L.outs:null}}
let psOpen=null;/* the player whose page is showing */
function stRender(T,key){const pit=p=>p.pos==='SP'||p.pos==='RP',hit=T.lineup,arms=T.staff,L=p=>PS.p[mlKey(key,p)];
 if(psOpen){const p=[...hit,...arms].find(x=>mlKey(key,x)===psOpen);if(p){psPage(T,key,p);return}psOpen=null}
 const row=(p,cells)=>`<tr data-ps="${esc(mlKey(key,p))}"><td class="psNm"><b>${esc(p.name)}</b><small>${p.pos}</small></td>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;
 const hr=hit.map(p=>{const l=L(p);if(!l||!l.pa)return row(p,['0','—','—','—','—']);const r=psRates(l);return row(p,[l.g,f3(r.avg),l.hr,l.rbi,f3(r.ops)])}).join('');
 const pr=arms.map(p=>{const l=L(p);if(!l||!l.bf)return row(p,['0','—','—','—','—']);const r=psRates(l);return row(p,[l.pg,psIP(l.outs),f2(r.era),l.pk,f2(r.whip)])}).join('');
 $('cards').innerHTML=`<div class="psWrap"><p class="psSub">${PS.games?`ALL GAMES · ${PS.games} PLAYED`:'No games yet: finish a game and your players’ stats show up here.'}</p>
  <table class="psT"><thead><tr><th>HITTERS</th><th>G</th><th>AVG</th><th>HR</th><th>RBI</th><th>OPS</th></tr></thead><tbody>${hr}</tbody></table>
  <table class="psT"><thead><tr><th>PITCHERS</th><th>G</th><th>IP</th><th>ERA</th><th>K</th><th>WHIP</th></tr></thead><tbody>${pr}</tbody></table></div>`;
 $('lnHint').textContent='Tap a player for his full stats.'}
/* one player's page: his card and every number */
function psPage(T,key,p){const l=PS.p[mlKey(key,p)]||psLine('__none'),r=psRates(l),c=lfCard(key,p),art=c?cardArt(c,key):portrait(T,p,key===S.you),isP=p.pos==='SP'||p.pos==='RP';
 delete PS.p.__none;
 const box=(k,v)=>`<div><b>${v}</b><span>${k}</span></div>`;
 const g=isP?[['G',l.pg],['IP',psIP(l.outs)],['ERA',f2(r.era)],['WHIP',f2(r.whip)],['K',l.pk],['BB',l.pbb],['H',l.ph],['HR',l.phr],['R',l.pr],['BF',l.bf],['K/9',f2(r.k9)],['STA',staOf(p)]]
  :[['G',l.g],['PA',l.pa],['AB',l.ab],['H',l.h],['AVG',f3(r.avg)],['OBP',f3(r.obp)],['SLG',f3(r.slg)],['OPS',f3(r.ops)],['2B',l.d],['3B',l.t],['HR',l.hr],['RBI',l.rbi],['BB',l.bb],['K',l.k]];
 $('cards').innerHTML=`<div class="psPage"><button type="button" class="mbtn psBack">‹ ALL PLAYERS</button>
  <div class="psHead"><span class="lfc r${c?c.r:0} psCard" style="--tj:${T.jersey};--tc:${T.cap}"><span class="lfIn">${lfFace(art,ovr(p),p.name,p.pos)}</span></span>
  <div class="psWho"><b>${esc(p.name)}</b><small>${p.pos} · ${esc(T.city+' '+T.name)}</small></div></div>
  <div class="psGrid">${g.map(([k,v])=>box(k,v)).join('')}</div></div>`;
 $('lnHint').textContent='';lfFit()}
$('cards').addEventListener('click',e=>{if(lfTab!=='stats')return;const b=e.target.closest('.psBack');if(b){psOpen=null;lineupRender();return}
 const r=e.target.closest('[data-ps]');if(r){psOpen=r.dataset.ps;lineupRender()}});
