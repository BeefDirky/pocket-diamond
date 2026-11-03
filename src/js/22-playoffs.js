// ---------- playoffs: an 8-club bracket, best-of-3 rounds and a best-of-5 final ----------
let PO=null;try{PO=JSON.parse(localStorage.getItem('pd-playoffs')||'null')}catch(e){}
const savePO=()=>{try{localStorage.setItem('pd-playoffs',JSON.stringify(PO))}catch(e){}};
const PO_BEST=[3,3,5],PO_NAMES=['QUARTERFINALS','SEMIFINALS','KOREAN SERIES'];
const teamStr=k=>{const T=TEAMS[k];const b=T.lineup.reduce((a,p)=>a+ovr(p),0)/T.lineup.length;const p=(T.staff||[T.pitcher]).reduce((a,x)=>a+ovr(x),0)/(T.staff||[T.pitcher]).length;return b*.6+p*.4};
const need=r=>Math.ceil(PO_BEST[r]/2);
function newBracket(){const others=ORDER.filter(t=>t!==S.you).sort(()=>Math.random()-.5).slice(0,7);const seeds=[S.you,...others];
 const order=[0,7,3,4,1,6,2,5];PO={you:S.you,round:0,rounds:[[0,1,2,3].map(i=>({a:seeds[order[i*2]],b:seeds[order[i*2+1]],wa:0,wb:0}))],out:false,champ:null};savePO()}
const serDone=(sr,r)=>sr.wa>=need(r)||sr.wb>=need(r);
const serWin=sr=>sr.wa>sr.wb?sr.a:sr.b;
function poMySeries(){if(!PO||PO.champ||PO.out)return null;return PO.rounds[PO.round].find(sr=>(sr.a===PO.you||sr.b===PO.you)&&!serDone(sr,PO.round))||null}
const poLine=sr=>`${TEAMS[sr.a].name} ${sr.wa}, ${TEAMS[sr.b].name} ${sr.wb}`;
function simGame(sr){const pa=clamp(.5+(teamStr(sr.a)-teamStr(sr.b))*.012,.3,.7);if(Math.random()<pa)sr.wa++;else sr.wb++}
function poAdvance(){
 while(!PO.champ){const r=PO.round,rd=PO.rounds[r];
  for(const sr of rd)if(!(sr.a===PO.you||sr.b===PO.you)||PO.out)while(!serDone(sr,r))simGame(sr);
  if(!rd.every(sr=>serDone(sr,r)))return;
  const w=rd.map(serWin);if(!PO.out&&!w.includes(PO.you))PO.out=true;
  if(w.length===1){PO.champ=w[0];break}
  PO.rounds.push([...Array(w.length/2)].map((_,i)=>({a:w[i*2],b:w[i*2+1],wa:0,wb:0})));PO.round++;
  if(!PO.out)return}
}
function poRecord(win){const sr=poMySeries();if(!sr)return;if((sr.a===PO.you)===win)sr.wa++;else sr.wb++;
 if(serDone(sr,PO.round)){const r=PO.round;for(const o of PO.rounds[r])while(!serDone(o,r))simGame(o);
  if(serWin(sr)!==PO.you)PO.out=true;poAdvance();
  if(PO.champ===PO.you){COL.packs+=5;saveCol();updatePackBadge()}}
 savePO()}
function renderBracket(){
 const H=$('bracket');let h='';
 for(let r=0;r<3;r++){const rd=PO.rounds[r];h+=`<div class="rd"><div class="rh">${PO_NAMES[r]}</div>`;
  const n=[4,2,1][r];for(let i=0;i<n;i++){const sr=rd&&rd[i];
   if(!sr){h+=`<div class="ser"><div class="t"><span></span><span style="color:var(--dim)">TBD</span><b></b></div><div class="t"><span></span><span style="color:var(--dim)">TBD</span><b></b></div></div>`;continue}
   const d=serDone(sr,r),wn=d?serWin(sr):null,mine=sr.a===PO.you||sr.b===PO.you;
   const row=(k,w)=>`<div class="t ${d?(wn===k?'win':'lose'):''}"><img alt="" src="${LOGO_URL[k]}"><span>${ABBR[k]}${k===PO.you?' ★':''}</span><b>${w}</b></div>`;
   h+=`<div class="ser ${mine?'mine':''}">${row(sr.a,sr.wa)}${row(sr.b,sr.wb)}<div class="bo">BEST OF ${PO_BEST[r]}</div></div>`}
  h+='</div>'}
 h+=`<div class="champ">${PO.champ?`<img alt="" src="${LOGO_URL[PO.champ]}"><b>CHAMPIONS</b>${TEAMS[PO.champ].city} ${TEAMS[PO.champ].name}`:'<div class="rh">CHAMPION</div>🏆'}</div>`;
 H.innerHTML=h;
 const sr=poMySeries();
 if(PO.champ===PO.you){$('poStatus').textContent='Champions! +5 card packs';$('poNext').innerHTML=`<b>${TEAMS[PO.you].name}</b> win the Korean Series!`}
 else if(PO.out){$('poStatus').textContent='Eliminated';$('poNext').innerHTML=PO.champ?`${TEAMS[PO.champ].city} ${TEAMS[PO.champ].name} won it all. Start a new bracket for another run.`:'Eliminated.'}
 else if(sr){const opp=sr.a===PO.you?sr.b:sr.a,g=sr.wa+sr.wb+1;$('poStatus').textContent=`${PO_NAMES[PO.round]} · ${poLine(sr)}`;$('poNext').innerHTML=`Game ${g} vs <b>${TEAMS[opp].city} ${TEAMS[opp].name}</b> · first to ${need(PO.round)} wins`}
 $('poPlay').hidden=!sr;$('poSim').disabled=!sr;$('poPlay').textContent=sr?`PLAY GAME ${sr.wa+sr.wb+1}`:'PLAY GAME';
}
function openBracket(fresh){if(fresh&&(!PO||PO.you!==S.you||PO.champ||PO.out))newBracket();if(!PO)newBracket();renderBracket();showScreen('scrBracket')}
$('poPlay').addEventListener('click',()=>{const sr=poMySeries();if(!sr)return;if(S.you!==PO.you){S.you=PO.you;syncPicker();applyCustom();if(FIELD)rebuildPark()}S.opp=sr.a===PO.you?sr.b:sr.a;S.poGame=true;S.auto=false;syncAuto();startGame('arcade')});
$('poSim').addEventListener('click',()=>{const sr=poMySeries();if(!sr)return;const pa=clamp(.5+(teamStr(PO.you)-teamStr(sr.a===PO.you?sr.b:sr.a))*.012,.3,.7);poRecord(Math.random()<pa);renderBracket()});
$('poNew').addEventListener('click',()=>{newBracket();renderBracket()});
$('toBracket').addEventListener('click',()=>{$('over').hidden=true;toTitle();openBracket(false)});

