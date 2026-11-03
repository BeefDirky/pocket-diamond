// ---------- input ----------
const overlayOpen=()=>!$('title').hidden||!$('over').hidden;
cv.addEventListener('pointerdown',e=>{if(overlayOpen())return;e.preventDefault();if(S.phase==='play'&&S.play&&S.play.hrFired){S.play.t=S.play.end;return}
 if(S.view&&S.stealHit&&S.stealHit.length){const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*cv.width/r.width,py=(e.clientY-r.top)*cv.height/r.height,wx=S.view.sx+(px-S.view.ox)/S.view.scale,wy=S.view.sy+py/S.view.scale;
  for(const h of S.stealHit)if(Math.hypot(h.x-wx,h.y-wy)<16){toggleSteal(h.k);return}}
 swing()});
$('swingBtn').addEventListener('pointerdown',e=>{e.preventDefault();swing()});
$('buntBtn').addEventListener('pointerdown',e=>{e.preventDefault();bunt()});
$('buntBtn').addEventListener('click',e=>{if(e.detail===0)bunt()});
$('swingBtn').addEventListener('click',e=>{if(e.detail===0)swing()});
addEventListener('keydown',e=>{
 if((e.key==='p'||e.key==='P'||e.key==='Escape')&&!e.repeat){if(S.paused&&!$('scrPause').hidden){e.preventDefault();resumeGame();return}if(canPause()){e.preventDefault();pauseGame();return}}
 if(overlayOpen())return;
 if(e.code==='Space'||e.key===' '||(e.key==='Enter'&&document.activeElement===document.body)){e.preventDefault();if(!e.repeat)swing()}
 else if((e.key==='b'||e.key==='B')&&!e.repeat)bunt();
 else if((e.key==='s'||e.key==='S')&&!e.repeat){if(canSteal(2))toggleSteal(2);else toggleSteal(1)}
 else if(/^[1-5]$/.test(e.key)&&!e.repeat&&S.mode==='bp'){setBP(['FB','SL','CH','SP','KN'][+e.key-1])}
 else if(/^[1-5]$/.test(e.key)&&!e.repeat){const kk=arsOf(pitcher())[+e.key-1];if(kk)choosePitch(kk)}
 else if((e.key==='b'||e.key==='B')&&!e.repeat&&canPen())togglePen()
 else if((e.key==='q'||e.key==='Q')&&!e.repeat)doPickoff(1)
 else if((e.key==='w'||e.key==='W')&&!e.repeat)doPickoff(2)
});
const toTitle=()=>{$('clkS').hidden=true;S.celebr=null;restoreNetRosters();if(S.online&&S.online.inGame){S.online.inGame=false;clearTimeout(S.online.lostT);netPresence({pt:null,dc:null,ing:null})}stopRamp();$('parkBtn').hidden=true;S.bpOn=false;S.bpFly=[];applyVolumes();$('bpBar').hidden=true;$('actsBat').classList.remove('withBP');S.bpBalls=[];setTimeout(applyVolumes,0);S.fwUntil=0;S.play=null;S.bases=[null,null,null];S.jumbo=null;S.cheerUntil=0;hideBanner();$('tag').hidden=true;$('over').hidden=true;$('title').hidden=false;showScreen('scrMain');setPhase('title');setCam('full');updateHUD()};
let pendingMode=null;
const MODE_NAME={online:'ONLINE 1v1',arcade:'ARCADE',full:'FULL GAME',bp:'BATTING PRACTICE',playoffs:'PLAYOFFS',watch:'WATCH A GAME'};
function drawOpp(){const pool=ORDER.filter(t=>t!==S.you);S.opp=pick(pool);syncPicker();updateOppLine()}
function updateOppLine(){const o=TEAMS[S.opp];$('oppLine').innerHTML=pendingMode==='online'?'Your friend picks their own club when they join.':pendingMode==='playoffs'?'Seven other clubs are drawn into the bracket with you.':parkFromBP?'Pick a club: you hit in their park, with their hitters.':pendingMode==='bp'?'Batting practice: just you, the machine and an empty park.':`Opponent (drawn at random): <b>${o.city} ${o.name}</b>`}
function chooseMode(m){ensureAudio();if(S.online&&!S.online.inGame){const o=S.online;if(o.nr)o.nr.leave().catch(()=>{});if(o.prevCustom!=null){CUSTOM.active=o.prevCustom;applyCustom()}S.online=null}pendingMode=m;if(S.opp===S.you||m!=='bp')drawOpp();updateOppLine();$('playGo').hidden=false;$('playGo').textContent=m==='online'?'TO THE LOBBY':m==='bp'?'START PRACTICE':m==='playoffs'?'TO THE BRACKET':m==='watch'?'WATCH':'PLAY BALL';
 document.querySelector('#scrTeams h1').innerHTML=`${MODE_NAME[m]} · <span>PICK YOUR CLUB</span>`;showScreen('scrTeams')}
$('go').addEventListener('click',()=>chooseMode('arcade'));
$('goFull').addEventListener('click',()=>chooseMode('full'));
$('goBP').addEventListener('click',()=>chooseMode('bp'));
$('goPO').addEventListener('click',()=>chooseMode('playoffs'));
$('goWatch').addEventListener('click',()=>chooseMode('watch'));
$('goMulti').addEventListener('click',()=>{ensureAudio();openOnline()});
$('playGo').addEventListener('click',()=>{if(parkFromBP){backToCage();return}const m=pendingMode;pendingMode=null;$('playGo').hidden=true;
 if(m==='playoffs'){openBracket(true);return}if(m==='online'){openOnline();return}if(m==='watch'){S.auto=true;syncAuto();startGame('full');return}
 if(m){S.auto=false;syncAuto();startGame(m)}});
const setBP=k=>{S.bpPitch=k;for(const b of $('bpBar').querySelectorAll('.pbtn'))b.setAttribute('aria-pressed',String(b.dataset.k===k));updateHUD()};
$('bpBar').addEventListener('click',e=>{const b=e.target.closest('.pbtn');if(b){ensureAudio();setBP(b.dataset.k)}});
$('again').addEventListener('click',()=>{ensureAudio();S.cheerUntil=0;startGame(S.mode)});
$('change').addEventListener('click',toTitle);
$('quit').addEventListener('click',toTitle);
$('optsBtn').addEventListener('click',openOptionsInGame);
$('actsPitch').addEventListener('click',e=>{const b=e.target.closest('.pbtn');if(b){ensureAudio();choosePitch(b.dataset.k)}});
const zoomBy=d=>{const lo=zFit()/(isWide()?CAM_WIDE.z:CAM_PITCH.z);S.zoom=clamp(S.zoom*(d>0?1.15:1/1.15),lo,1.35);if(S.zoom<lo*1.07&&d<0)S.zoom=lo};
$('zIn').addEventListener('click',()=>zoomBy(1));$('zOut').addEventListener('click',()=>zoomBy(-1));
cv.addEventListener('wheel',e=>{if(overlayOpen())return;e.preventDefault();zoomBy(e.deltaY<0?1:-1)},{passive:false});
const syncAuto=()=>{const on=!!S.auto;$('autoBtn').setAttribute('aria-pressed',String(on));$('autoBtn').innerHTML=`AUTO <b>${on?'ON':'OFF'}</b>`;document.body.classList.toggle('autoOn',on);if(on&&S.phase==='choose'&&pitching()){hideBanner();startWindup()}if(on&&S.phase==='windup'&&pitching()&&S.pitch&&S.pitch.q==null){S.pitch.q=clamp(rand(.3,1.08),0,1);$('relMeter').hidden=true}};
$('autoBtn').addEventListener('click',e=>{e.stopPropagation();if(onlineGame())return;S.auto=!S.auto;syncAuto()});$('autoBtn').addEventListener('pointerdown',e=>e.stopPropagation());
const syncInfo=()=>{const on=OPT.info!==false;$('infoBtn').setAttribute('aria-pressed',String(on));$('infoBtn').innerHTML=`INFO <b>${on?'ON':'OFF'}</b>`};
$('infoBtn').addEventListener('click',e=>{e.stopPropagation();OPT.info=OPT.info===false;saveOpts();syncInfo();if(OPT.info===false)hideBanner()});
$('infoBtn').addEventListener('pointerdown',e=>e.stopPropagation());syncInfo();
$('skipBtn').addEventListener('click',()=>{if(S.phase==='play'&&S.play&&S.play.hrFired){if(S.online&&S.online.inGame){if(pitching())return;netPresence({sk:S.pitch&&S.pitch.pid})}S.play.t=S.play.end}});
$('snd').addEventListener('click',()=>{muted=!muted;ensureAudio();applyVolumes();$('snd').textContent=muted?'Sound off':'Sound on';$('snd').setAttribute('aria-pressed',String(!muted))});

document.addEventListener('pointerdown',e=>{if(e.button>0||overlayOpen()||e.target===cv)return;if(e.target.closest('button,input,select,textarea,a,label,.book,.zoomCtl,.pauseBtn'))return;if(S.phase==='title'||S.phase==='over')return;swing()});
addEventListener('pointerdown',ensureAudio,{once:true});addEventListener('keydown',ensureAudio,{once:true});
document.body.classList.add('inMenu');S.night=OPT.time==='night'||(OPT.time==='random'&&Math.random()<.55);setStadium();buildRosters();buildCardDB();applySignings();applyCustom();addCloseX();buildPicker();updatePackBadge();syncOpts();updateHUD();showScreen('scrMain');
const fontsReady=Promise.race([
 Promise.all([document.fonts.load('12px "Pixelify Sans"'),document.fonts.load('12px Jua'),document.fonts.load('bold 10px "Silkscreen"'),document.fonts.load('12px "Press Start 2P"'),document.fonts.load('40px "Yellowtail"')]),
 new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
fontsReady.then(()=>{
 for(const k of ORDER){LOGO[k]=makeLogo(k,128);LOGO_URL[k]=LOGO[k].toDataURL()}
 document.querySelectorAll('.chip').forEach(c=>{const im=c.querySelector('img');if(im)im.src=LOGO_URL[c.dataset.t]});
 updateHUD();refreshMenu();rebuildPark()});
requestAnimationFrame(frame);
})();

// every menu card closes from an X in its top-right corner instead of a Back button at the bottom of a long scroll
function addCloseX(){for(const back of document.querySelectorAll('#title .card .mbtn.back')){const card=back.closest('.card');if(!card||card.querySelector(':scope>.xClose'))continue;
  const x=document.createElement('button');x.type='button';x.className='xClose';x.setAttribute('aria-label',back.textContent.trim()||'Close');x.textContent='✕';
  x.addEventListener('click',e=>{e.stopPropagation();back.click()});card.prepend(x);card.classList.add('hasX');back.hidden=true}}
