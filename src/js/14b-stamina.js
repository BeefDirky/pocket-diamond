// ---------- pitcher stamina ----------
// Every pitch costs stamina. The pitch type sets the base cost (fastball cheapest, splitter dearest) and the release
// timing scales it: a PERFECT release costs least, a bad or late one a lot, on a smooth gradient. A starter has 100,
// a reliever 45. Below half he starts to tire (velocity, control); at zero he is gassed: the PERFECT window on the release
// meter is gone and the GOOD window shrinks. A tiring pitcher sweats on the mound.
const STAM_K={FB:1,CH:1.2,SL:1.45,CB:1.7,KN:1.95,SP:2.2};
const stamMax=p=>p&&p.pos==='RP'?45:100;
function stamOf(k){S.stamOf=S.stamOf||{};const v=S.stamOf[k];return v==null?stamMax(TEAMS[k]&&staffOf(k)[S.pIdxOf[k]||0]):v}
const stamNow=()=>stamOf(fldKey());
const stamFrac=()=>stamNow()/stamMax(pitcher());
const tiredness=()=>clamp((.5-stamFrac())/.5,0,1);// 0 while above half, 1 when empty
const gassed=()=>S.mode!=='bp'&&stamNow()<=0;
function stamReset(k){S.stamOf=S.stamOf||{};S.stamOf[k]=stamMax(staffOf(k)[S.pIdxOf[k]||0])}
// release meter geometry: pz = half-width of PERFECT, gw = how fast quality falls off past it (GOOD is q > .55)
function meterZones(){const g=gassed();return{pz:g?0:.05+pitcher().ctl*.0006,gw:g?.2:.45}}
const goodHalf=z=>z.pz+z.gw*(1-.55/.85);
function stamSpend(p){if(S.mode==='bp'||!p)return;const k=fldKey();
 // q: the meter's release quality when you pitch; a CPU arm (or AUTO) gets one from his control
 const q=p.q!=null?p.q:clamp(.45+pitcher().ctl*.004+randn()*.2,0,1);
 const t=.5+1.4*(1-q);// PERFECT .5x, GOOD ~.7-1.1x, over the plate ~1.3x, missed or late ~1.6-1.9x
 S.stamOf=S.stamOf||{};S.stamOf[k]=Math.max(0,stamOf(k)-.8*(STAM_K[p.k]||1.3)*t);stamHUD()}
// what the at-bat did to the pitcher: hits wear him down (more for extra bases), a strikeout gives him a little back
const STAM_PA={'1B':-2,'2B':-4,'3B':-6,HR:-9,K:2,KL:2};
function stamResult(code,k){const d=STAM_PA[code];if(S.mode==='bp'||!d||!k||!TEAMS[k])return;S.stamOf=S.stamOf||{};
 const mx=stamMax(staffOf(k)[S.pIdxOf[k]||0]);S.stamOf[k]=clamp(stamOf(k)+d,0,mx);stamHUD()}
function stamHUD(){const el=$('pStam');if(!el)return;const bp=S.mode==='bp'||S.phase==='title';el.hidden=bp;if(bp)return;
 const f=clamp(stamFrac(),0,1);el.firstElementChild.style.width=`${Math.round(f*100)}%`;
 el.className='stam'+(f<=0?' out':f<.25?' low':f<.5?' mid':'');el.title=`Stamina ${Math.round(f*100)}%`}
// sweat: drops fly off the cap and fall when he's under a third of his tank; faster and more of them when gassed
function drawSweat(g,x,y,now){if(S.mode==='bp'||S.phase==='title')return;const f=stamFrac();if(f>=.33)return;
 const out=f<=0,n=out?6:3,per=out?560:900;x=Math.round(x);y=Math.round(y);
 for(let i=0;i<n;i++){const u=((now+i*per/n)%per)/per,sd=i%2?1:-1,dx=sd*(3+u*6),dy=-23+u*u*14-u*3;
  const a=u<.8?1:1-(u-.8)/.2;if(a<=0)continue;g.globalAlpha=a;
  g.fillStyle='#8fd3ff';g.fillRect(x+Math.round(dx),y+Math.round(dy),1,2);g.fillStyle='#e8f7ff';g.fillRect(x+Math.round(dx),y+Math.round(dy),1,1)}
 g.globalAlpha=1;
 if(out&&(now%900)<450){g.fillStyle='#bfe8ff';g.fillRect(x-1,y-21,1,1);g.fillRect(x+2,y-20,1,1)}}// a sheen on his face
