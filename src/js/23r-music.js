/* ---------- the music pack: walk-up songs, pitcher entrances, and the closer's stadium show ----------
   Every legendary card has a slot in audio/music/pack.json (the build copies the slots that have a song or an effect
   into the game, below). The songs themselves are mp3s in audio/music/, fetched the first time they're needed.
   - A legendary batter: his walk-up song plays as he comes up, until the first pitch (or its length runs out).
   - A legendary pitcher: his entrance song plays the first time he takes the mound (a starter's first inning, a
     reliever coming in from the pen).
   - fx:"closer" (every legendary closer): the stadium show as he comes in: lights out, spotlights, his name on the
     big screen, light towers flashing, then the lights slam back on. Its two sound cues are slots in pack.json "sfx".
   With no song in a slot nothing plays; the NOW BATTING / NOW PITCHING tag and the closer's show still run. */
const MUSIC_PACK=/*@MUSICPACK*/null||{walkup:{},entrance:{},sfx:{}};
const MP_BUF={};/* file -> Promise<AudioBuffer|null> */
function mpLoad(file){if(!file||!AC)return Promise.resolve(null);
 return MP_BUF[file]||(MP_BUF[file]=fetch('audio/music/'+encodeURIComponent(file).replace(/%2F/g,'/')).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()})
  .then(ab=>new Promise(res=>AC.decodeAudioData(ab,res,()=>res(null)))).catch(()=>{delete MP_BUF[file];return null}))}
/* the player's card (legendary = r 3), remembered per player */
const MP_CARD=new WeakMap();
function mpCard(k,p){if(!p||typeof p!=='object')return null;if(MP_CARD.has(p))return MP_CARD.get(p);let c=null;try{c=lfCard(k,p)}catch(e){}MP_CARD.set(p,c);return c}
const mpLegend=(k,p)=>{const c=mpCard(k,p);return c&&c.r===3?c:null};
const mpOn=()=>OPT.walkup!==false;

/* one song at a time, on its own channel (scaled by the Music slider; the organ ducks under it) */
const MP={src:null,g:null,kind:null,until:0,pa:'',seen:{},show:0,tagT:0};
function mpBus(){if(!AC||!MASTER)return null;if(!BUS.walk){BUS.walk=AC.createGain();BUS.walk.gain.value=1;BUS.walk.connect(MASTER)}return BUS.walk}
function mpStop(fade){const s=MP.src,g=MP.g;MP.src=null;MP.g=null;MP.kind=null;if(!s)return;
 try{const t=AC.currentTime,f=fade==null?.9:fade;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+f);s.stop(t+f+.05)}catch(e){try{s.stop()}catch(_){}}
 unduckMusic()}
async function mpPlay(e,kind){if(!e||!e.file||!mpOn()||muted)return false;const bus=mpBus();if(!bus)return false;
 const tok=MP.tok=(MP.tok||0)+1,buf=await mpLoad(e.file);if(!buf||tok!==MP.tok||S.phase==='title')return false;
 mpStop(.3);const src=AC.createBufferSource(),g=AC.createGain(),t=AC.currentTime,vol=OPT.music/100*(e.vol||1)*.9;
 const st=Math.max(0,Math.min(buf.duration-.5,+e.start||0)),len=Math.max(2,Math.min(buf.duration-st,+e.len||(kind==='walkup'?12:16)));
 src.buffer=buf;src.connect(g);g.connect(bus);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.25);
 g.gain.setValueAtTime(vol,t+len-1.2);g.gain.linearRampToValueAtTime(0,t+len);src.start(t,st,len+.05);
 src.onended=()=>{if(MP.src===src){MP.src=null;MP.g=null;MP.kind=null;unduckMusic()}};
 duckMusic();MP.src=src;MP.g=g;MP.kind=kind;return true}
/* a one-shot sound cue from the pack's "sfx" slots (the closer show) */
async function mpCue(k){const e=(MUSIC_PACK.sfx||{})[k];if(!e||!e.file||muted)return;const bus=mpBus(),buf=await mpLoad(e.file);if(!buf||!bus)return;
 const src=AC.createBufferSource(),g=AC.createGain();src.buffer=buf;g.gain.value=OPT.sfx/100*(e.vol||1);src.connect(g);g.connect(bus);src.start()}

/* the lower-third tag: NOW BATTING / NOW PITCHING, with the song's name when there is one */
function mpTag(head,p,e,ms){const w=$('wuTag');if(!w)return;$('wuHead').textContent=head;$('wuName').textContent=`#${p.no} ${p.name}`;
 const t=e&&e.file&&mpOn()?(e.title||''):'';$('wuSong').textContent=t?'♪ '+t:'';$('wuSong').hidden=!t;w.classList.toggle('song',!!t);
 w.hidden=false;w.classList.remove('out');void w.offsetWidth;w.classList.add('in');clearTimeout(MP.tagT);MP.tagT=setTimeout(mpTagOff,ms||4200)}
function mpTagOff(){const w=$('wuTag');if(!w||w.hidden)return;w.classList.remove('in');w.classList.add('out');clearTimeout(MP.tagT);MP.tagT=setTimeout(()=>{w.hidden=true;w.classList.remove('out')},350)}

/* the closer's stadium show (about 5 s; the game carries on underneath, nothing waits for it) */
function closerShow(k,p){const el=$('cpShow');if(!el)return;const T=TEAMS[k]||{};const now=performance.now();MP.show=now+5200;
 el.style.setProperty('--cpA',T.cap||'#ffd23a');el.style.setProperty('--cpB',T.jersey||'#1a2b5c');
 $('cpName').textContent=`#${p.no} ${p.name}`;$('cpClub').textContent=(T.name||'').toUpperCase();
 el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');
 mpCue('closerLightsOut');setTimeout(()=>{if(S.phase==='title')return;S.lightShow=performance.now();S.cheerUntil=performance.now()+2600;mpCue('closerLightsOn')},3700);
 S.jumbo={text:'CLOSER',kr:'마무리',until:now+5200};clearTimeout(MP.showT);MP.showT=setTimeout(()=>{el.hidden=true;el.classList.remove('go')},5300)}
function closerShowOff(){const el=$('cpShow');if(el){el.hidden=true;el.classList.remove('go')}clearTimeout(MP.showT);MP.show=0}

/* watch the game: a new plate appearance, or a pitcher taking the mound */
function mpTick(){const ph=S.phase,live=ph!=='title'&&ph!=='over'&&S.mode!=='bp'&&!S.bpOn;
 if(!live){if(MP.pa||MP.src){MP.pa='';MP.seen={};mpStop(.6);mpTagOff();closerShowOff()}return}
 // the song ends with the first pitch of the at-bat
 if(MP.src&&MP.kind==='walkup'&&(ph==='windup'||ph==='pitch'||ph==='play'))mpStop(1.1);
 const fk=fldKey(),bk=batKey();if(!TEAMS[fk]||!TEAMS[bk])return;
 let np=null;try{np=pitcher()}catch(e){}
 let entered=false;
 if(np&&MP.seen[fk]!==np){const first=!(fk in MP.seen);MP.seen[fk]=np;const c=mpLegend(fk,np);
  if(c&&ph!=='windup'&&ph!=='pitch'&&ph!=='play'){const e=(MUSIC_PACK.entrance||{})[c.id];entered=true;
   if((e&&e.fx==='closer')||(!e&&np.cp&&!first))closerShow(fk,np);else mpTag('NOW PITCHING',np,e);
   if(e&&e.file)mpPlay(e,'entrance')}}
 let bp=null;try{bp=curBatter()}catch(e){}
 const pa=`${S.inning}|${S.half}|${bk}|${(S.orderOf&&S.orderOf[bk])||0}`;
 if(bp&&pa!==MP.pa){MP.pa=pa;
  {if(MP.kind==='walkup')mpStop(.6);const c=mpLegend(bk,bp);
   if(c&&!entered&&performance.now()>MP.show){const e=(MUSIC_PACK.walkup||{})[c.id];mpTag('NOW BATTING',bp,e);if(e&&e.file&&!(MP.src&&MP.kind==='entrance'))mpPlay(e,'walkup')}
   // load the next legendary batter's song now, so it starts on time
   try{const T=TEAMS[bk],nx=T.lineup[(((S.orderOf&&S.orderOf[bk])||0)+1)%9],cn=mpLegend(bk,nx),en=cn&&(MUSIC_PACK.walkup||{})[cn.id];if(en&&en.file)mpLoad(en.file)}catch(e){}}}}
setInterval(()=>{try{mpTick()}catch(e){}},150);

/* Options: walk-up music on/off (the tags and the closer show stay) */
function mpSync(){for(const b of $('optWalk').children)b.setAttribute('aria-pressed',String((b.dataset.v==='on')===mpOn()))}
$('optWalk').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;OPT.walkup=b.dataset.v==='on';saveOpts();mpSync();if(!mpOn())mpStop(.4)});
mpSync();
