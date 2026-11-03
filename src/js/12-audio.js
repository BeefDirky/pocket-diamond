// ---------- audio ----------
const SND_B64=/*@AUDIO:dcatch,fworks,chant,csingle,boo,slide,ramp,fence1,clang,grass,horn,echo1,echo2,echo3,amb,woosh,weak,drop,mitt,cheer,crowd,bat,organ*/{};
let AC=null,muted=false,MASTER=null,organSrc=null,crowdSrc=null,ambSrc=null;const BUF={},BUS={};
const OPT={music:45,crowd:35,sfx:85,cam:'broadcast',time:'random',info:true};
try{Object.assign(OPT,JSON.parse(localStorage.getItem('pd-opts2')||'{}'))}catch(e){}
function saveOpts(){try{localStorage.setItem('pd-opts2',JSON.stringify(OPT))}catch(e){}}
function applyVolumes(){if(!AC)return;const bpq=!!S.bpOn;BUS.music.gain.value=(bpq||S.rampSrc)?0:OPT.music/100*.7;BUS.crowd.gain.value=bpq?0:OPT.crowd/100*.4;if(BUS.amb)BUS.amb.gain.value=bpq?Math.max(.15,OPT.crowd/100)*.9:0;BUS.sfx.gain.value=OPT.sfx/100;MASTER.gain.value=muted?0:1}
function b64buf(b){const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer}
function loopOn(k,bus){if(!BUF[k]||!AC)return null;const src=AC.createBufferSource();src.buffer=BUF[k];src.loop=true;src.connect(bus);src.start();return src}
function startOrgan(){if(!organSrc)organSrc=loopOn('organ',BUS.music)}
function startCrowd(){if(!crowdSrc)crowdSrc=loopOn('crowd',BUS.crowd)}
function ensureAudio(){
 if(!AC){
  try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}
  if(AC){MASTER=AC.createGain();MASTER.connect(AC.destination);
   for(const k of['music','crowd','sfx','amb']){BUS[k]=AC.createGain();BUS[k].connect(MASTER)}
   applyVolumes();
   for(const k in SND_B64){try{AC.decodeAudioData(b64buf(SND_B64[k]),bf=>{BUF[k]=bf;if(k==='organ')startOrgan();if(k==='crowd')startCrowd();if(k==='amb'&&!ambSrc)ambSrc=loopOn('amb',BUS.amb)},()=>{})}catch(e){}}}
 }
 wakeAudio();
}
// Phones park the audio when you switch tabs or apps (iOS marks it "interrupted", Android "suspended").
// It can only be woken by a tap, so every tap, key or return to the tab tries to wake it, and a silent
// one-sample blip kicks iOS's output back on.
function wakeAudio(){if(!AC||AC.state==='running'||AC.state==='closed'||S.paused)return;
 try{AC.resume().then(()=>{try{const b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0)}catch(e){}}).catch(()=>{})}catch(e){}}
for(const ev of['pointerdown','touchend','keydown'])document.addEventListener(ev,()=>{if(AC&&AC.state!=='running')wakeAudio()},{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wakeAudio()});
addEventListener('pageshow',()=>wakeAudio());
// organ ramp-up with runners in scoring position: duck the music, play the ramp, bring the music back
function organRamp(){if(!AC||!BUF.ramp||muted||S.rampSrc)return;const t=AC.currentTime,mg=BUS.music.gain;
 mg.cancelScheduledValues(t);mg.setValueAtTime(mg.value,t);mg.linearRampToValueAtTime(0,t+.7);
 const src=AC.createBufferSource(),g=AC.createGain();src.buffer=BUF.ramp;g.gain.value=Math.max(.25,OPT.music/100)*.95;src.connect(g).connect(MASTER);src.start(t+.35);S.rampSrc=src;
 src.onended=()=>{if(S.rampSrc!==src)return;S.rampSrc=null;const t2=AC.currentTime;mg.cancelScheduledValues(t2);mg.setValueAtTime(0,t2);mg.linearRampToValueAtTime(S.bpOn?0:OPT.music/100*.7,t2+1.8)}}
function crowdClip(k,vol){if(!AC||!BUF[k]||muted||S.bpOn)return;const src=AC.createBufferSource(),g=AC.createGain();src.buffer=BUF[k];g.gain.value=vol;src.connect(g).connect(BUS.crowd);src.start();return src}
// someone reached base: the home crowd roars, and is much quieter for the visitors
function crowdReach(err){crowdClip('csingle',(batKey()===S.you?3.4:1.1)*(err?1.6:1))}
let chantSrc=null,nextChant=0;
function crowdChant(){if(chantSrc||S.mode==='bp')return;chantSrc=crowdClip('chant',1.9);if(chantSrc)chantSrc.onended=()=>{chantSrc=null}}
function stopRamp(){if(S.rampSrc){const s0=S.rampSrc;S.rampSrc=null;try{s0.stop()}catch(e){}applyVolumes()}}
function playSample(k,vol,rate){if(!AC||!BUF[k])return false;const src=AC.createBufferSource(),gn=AC.createGain();src.buffer=BUF[k];src.playbackRate.value=rate||1;gn.gain.value=vol;src.connect(gn).connect(BUS.sfx);src.start();return true}
function noise(dur,type,freq,vol,swell){
 const len=Math.max(1,Math.floor(AC.sampleRate*dur));const b=AC.createBuffer(1,len,AC.sampleRate);const dd=b.getChannelData(0);
 for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;
 const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;
 const gn=AC.createGain();const t=AC.currentTime;
 if(swell){gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+dur*.3);gn.gain.exponentialRampToValueAtTime(.0001,t+dur)}
 else{gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+dur)}
 s.connect(f).connect(gn).connect(BUS.sfx);s.start(t);s.stop(t+dur);
}
function tone(freq,dur,type,vol,delay){
 const o=AC.createOscillator(),gn=AC.createGain();const t=AC.currentTime+(delay||0);
 o.type=type;o.frequency.value=freq;gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(gn).connect(BUS.sfx);o.start(t);o.stop(t+dur+.02);
}
function sfx(k,q){
 if(!AC||muted)return;
 try{
  if(k==='crack'&&S.mode==='bp'&&S.bpOn&&(q==null?.5:q)>=.55){const qq=q==null?.5:q;if(!playSample(pick(['echo1','echo2','echo3']),.6+.4*qq,1))playSample('bat',.55+.45*qq,1)}
  else if(k==='crack'){const qq=q==null?.5:q;const ok=qq>=.55?playSample('bat',.55+.45*qq,.94+.1*qq):playSample('weak',.5+.6*qq,.95+.1*qq);if(!ok){noise(.09,'highpass',1300+1800*qq,.45+.4*qq);tone(190,.05,'square',.08)}}
  else if(k==='fence'){const v=q==null?.85:q;if(!playSample('fence1',v,.97+Math.random()*.06)){noise(.22,'bandpass',2600,.16);noise(.08,'lowpass',500,.25)}}
  else if(k==='pop'){if(!playSample('mitt',.85,1))noise(.05,'lowpass',650,.5)}
  else if(k==='glove'){if(!playSample('mitt',.45,1.12))noise(.04,'lowpass',700,.3)}
  else if(k==='woosh'){playSample('woosh',.6,q||1)}
  else if(k==='drop'){playSample('drop',.7,.95+Math.random()*.1)}
  else if(k==='bigcheer'){if(!playSample('cheer',.55,1))noise(1.5,'bandpass',900,.22,true)}
  else if(k==='whiff')noise(.16,'bandpass',480,.18);
  else if(k==='cheer')noise(1.5,'bandpass',900,.22,true);
  else if(k==='out')tone(220,.12,'square',.06);
  else if(k==='hit'){tone(660,.08,'square',.06);tone(880,.1,'square',.06,.09)}
 }catch(e){}
}

