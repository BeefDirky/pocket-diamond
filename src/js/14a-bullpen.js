// ---------- bullpen: the pitching player picks who pitches; starters throw four pitches, relievers three ----------
// A pitcher who leaves the game can't come back. Online, the change travels with the pitcher's next windup
// snapshot (pIdxOf + usedOf), so both screens agree on who is pitching.
const staffOf=k=>TEAMS[k].staff||[TEAMS[k].pitcher];
const usedOf=k=>((S.usedOf||(S.usedOf={}))[k]||(S.usedOf[k]=[]));
function canPen(){return pitching()&&S.phase==='choose'&&(S.mode==='full'||onlineGame())&&!S.auto&&staffOf(fldKey()).some((p,i)=>penReady(fldKey(),i))}
function penReady(k,i){return i!==(S.pIdxOf[k]||0)&&!usedOf(k).includes(i)}
function closePen(){$('penPanel').hidden=true}
function togglePen(){if(!$('penPanel').hidden){closePen();return}if(!canPen())return;renderPen();$('penPanel').hidden=false}
function renderPen(){const k=fldKey(),st=staffOf(k),cur=S.pIdxOf[k]||0,pc=S.pcOf[k]||0;
 $('penSub').textContent=`${TEAMS[k].name} · current pitcher at ${pc} pitches`;
 $('penList').innerHTML=st.map((p,i)=>{const now=i===cur,used=usedOf(k).includes(i);
  const sf=now?clamp(stamFrac(),0,1):1,tag=now?`<span class="st now">PITCHING · ${pc}P<i class="penStam"><i style="width:${Math.round(sf*100)}%;background:${sf<=0?'#e2603a':sf<.25?'#e2603a':sf<.5?'#e6b93a':'#5fc25a'}"></i></i></span>`:used?'<span class="st">USED</span>':'<span class="st ready">READY</span>';
  const role=p.pos==='SP'?'Starter':p.type==='demon'?'Flamethrower':p.type==='knuckle'?'Knuckleballer':'Reliever';
  return `<button type="button" class="penRow" data-i="${i}" ${now?'aria-current="true"':''} ${now||used?'disabled':''}>
<span class="no">#${p.no}</span><span class="nm"><b>${p.name}</b><small>${role} · ${p.hand}HP${p.slot==='side'?' · sidearm':''}</small></span>${tag}<span class="ln2"><span class="rt">VEL ${rb(p.vel)} MOV ${rb(p.mov)} CTL ${rb(p.ctl)}</span><span class="ars">${arsOf(p).map(a=>`<i>${PITCHES[a].name}</i>`).join('')}</span></span></button>`}).join('')}
function changePitcher(k,i,quiet){const cur=S.pIdxOf[k]||0;if(i===cur)return;usedOf(k).push(cur);
 S.pIdxOf[k]=i;S.penHint=false;S.pRunsOf[k]=0;S.pBFOf[k]=0;S.pcOf[k]=0;applyDefense();stamReset(k);const np=pitcher();
 if(!quiet){banner('PITCHING CHANGE',`#${np.no} ${np.name} in from the pen · ${arsOf(np).map(a=>PITCHES[a].name.toLowerCase()).join(', ')}`);
  S.jumbo={text:'NEW PITCHER',kr:'투수 교체',until:performance.now()+3200}}
 updateHUD()}
// tap the pitcher's info box to open the bullpen
$('muPit').addEventListener('click',e=>{e.stopPropagation();ensureAudio();togglePen()});
$('muPit').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();togglePen()}});
$('muPit').addEventListener('pointerdown',e=>e.stopPropagation());
$('penClose').addEventListener('click',e=>{e.stopPropagation();closePen()});
$('penPanel').addEventListener('pointerdown',e=>e.stopPropagation());
$('penList').addEventListener('click',e=>{const b=e.target.closest('.penRow');if(!b||b.disabled||!canPen())return;
 changePitcher(fldKey(),+b.dataset.i);closePen();
 // online: a new pitcher gets a fresh pitch clock
 if(onlineGame()&&S.online.clkEnd){S.online.clkEnd=0;netPresence({ck:null})}});

// ---------- pickoffs from the pitching player: throw over to first or second instead of pitching ----------
const pkBase=()=>S.bases[0]&&!S.bases[1]?1:S.bases[1]&&!S.bases[2]?2:S.bases[0]?1:0;
function canPick(k){if(!pitching()||S.phase!=='choose'||S.auto||S.mode==='bp'||!S.bases[k-1])return false;
 const abKey=`${S.inning}|${S.half}|${S.orderOf[batKey()]}`;if(!S.pk||S.pk.ab!==abKey)S.pk={ab:abKey,n:0};return S.pk.n<3}
function runPickoff(k,seed){if(seed)S.steal=null;if(!S.pk)S.pk={ab:'',n:0};const r=Math.random;if(seed)Math.random=mulberry32(hash(seed));let pl;try{pl=buildPickoff(k)}finally{Math.random=r}
 S.pk.n++;S.play=pl;S.steal=null;closePen();hideBanner();if(batKey()===S.you)crowdClip('boo',1.5);setPhase('play');setCam('follow');updateHUD()}
function doPickoff(k){if(!canPick(k))return;ensureAudio();
 if(onlineGame()){const o=S.online;o.n=(o.n||0)+1;const id=o.role[0]+o.n;o.clkEnd=0;
  netPresence({ck:null,pt:{id,st:'k',b:k,z:snapState()}});runPickoff(k,o.gid+'|'+id);return}
 runPickoff(k)}
function syncPickBar(){const on=pitching()&&S.phase==='choose'&&!S.auto&&S.mode!=='bp';
 for(const k of[1,2]){const b=$('pk'+k);const ok=on&&canPick(k);if(b.hidden===ok)b.hidden=!ok}
 const pkOff=$('pk1').hidden&&$('pk2').hidden;if($('pkLbl').hidden!==pkOff)$('pkLbl').hidden=pkOff;
 const ib=on&&canIBB();if($('ibbBtn').hidden===ib)$('ibbBtn').hidden=!ib;
 $('pkBar').hidden=pkOff&&!ib}
// ---------- intentional walk: the manager signals four wide and the batter takes first, no pitches thrown (as in MLB) ----------
function canIBB(){return pitching()&&S.phase==='choose'&&!S.auto&&(S.mode==='full'||onlineGame())&&!!curBatter()}
function runIBB(){const b=curBatter(),nb=[...S.bases];let runs=0;
 if(nb[0]){if(nb[1]){if(nb[2])runs++;nb[2]=nb[1]}nb[1]=nb[0]}nb[0]=b;S.bases=nb;addRuns(runs);S.steal=null;closePen();hideBanner();
 logPA(b,'Intentional walk, IBB'+(runs?' · 1 run scores':''),!!runs);
 banner('INTENTIONAL WALK',runs?'Forces in a run':`${b.name} takes first`,'ball');if(batKey()===S.you)crowdReach();
 nextBatter();setPhase('call');updateHUD()}
function doIBB(){if(!canIBB())return;ensureAudio();
 if(onlineGame()){const o=S.online;o.n=(o.n||0)+1;const id=o.role[0]+o.n;o.clkEnd=0;netPresence({ck:null,pt:{id,st:'i',z:snapState()}})}
 runIBB()}
$('ibbBtn').addEventListener('pointerdown',e=>e.stopPropagation());
$('ibbBtn').addEventListener('click',e=>{e.stopPropagation();doIBB()});
$('pkBar').addEventListener('pointerdown',e=>e.stopPropagation());
$('pkBar').addEventListener('click',e=>{const b=e.target.closest('button');if(b){e.stopPropagation();doPickoff(+b.dataset.b)}});
