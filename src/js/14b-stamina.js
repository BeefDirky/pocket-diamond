// ---------- pitcher stamina ----------
// Every pitch costs stamina. The pitch type sets the base cost (fastball cheapest, splitter dearest) and the release
// timing scales it: a PERFECT release costs least, a bad or late one a lot, on a smooth gradient. A starter has 100,
// a reliever 45. Below half he starts to tire (velocity, control); at zero he is gassed: the PERFECT window on the release
// meter is gone and the GOOD window shrinks. A tiring pitcher sweats on the mound.
const STAM_K={FB:1,CH:1.2,SL:1.45,CB:1.7,KN:1.95,SP:2.2};
/* the tank: STAMINA 70 is the old full tank (100 for a starter, 35 for a reliever, about a third); it grows faster than
   the stat, so 100 stamina lasts about two and a half times as long as 50 (157 vs 65 for a starter) */
const stamMax=p=>Math.round((p&&p.pos==='RP'?35:100)*Math.pow(staOf(p)/70,1.3));
function stamOf(k){S.stamOf=S.stamOf||{};const v=S.stamOf[k];return v==null?stamMax(TEAMS[k]&&staffOf(k)[S.pIdxOf[k]||0]):v}
const stamNow=()=>stamOf(fldKey());
const stamFrac=()=>stamNow()/stamMax(pitcher());
const tiredness=()=>clamp((.5-stamFrac())/.5,0,1);// 0 while above half, 1 when empty
const gassed=()=>S.mode!=='bp'&&stamNow()<=0;
function stamReset(k){S.stamOf=S.stamOf||{};S.stamOf[k]=stamMax(staffOf(k)[S.pIdxOf[k]||0])}
// release meter geometry: pz = half-width of PERFECT, gw = how fast quality falls off past it (GOOD is q > .55)
function meterZones(){const g=gassed();return{pz:g?0:.028+pitcher().ctl*.00035,gw:g?.13:.28}}
const goodHalf=z=>z.pz+z.gw*(1-.55/.85);
function stamSpend(p){if(S.mode==='bp'||!p)return;const k=fldKey();
 // q: the meter's release quality when you pitch; a CPU arm (or AUTO) gets one from his control
 const q=p.q!=null?p.q:clamp(.45+pitcher().ctl*.004+randn()*.2,0,1);
 const t=.5+1.4*(1-q);// PERFECT .5x, GOOD ~.7-1.1x, over the plate ~1.3x, missed or late ~1.6-1.9x
 S.stamOf=S.stamOf||{};S.stamOf[k]=Math.max(0,stamOf(k)-1.15*(STAM_K[p.k]||1.3)*t);stamHUD()}
// what the at-bat did to the pitcher: hits wear him down (more for extra bases), a strikeout gives him a little back
const STAM_PA={'1B':-2.5,IFH:-2.5,'2B':-5,'3B':-7.5,HR:-12,IPHR:-12,BB:-2,HBP:-2,K:2,KL:2};
function stamResult(code,k){const d=STAM_PA[code];if(S.mode==='bp'||!d||!k||!TEAMS[k])return;S.stamOf=S.stamOf||{};
 const mx=stamMax(staffOf(k)[S.pIdxOf[k]||0]);S.stamOf[k]=clamp(stamOf(k)+d,0,mx);stamHUD()}
/* stamina colour: green when fresh, yellow at half, red when spent, blending smoothly in between */
function stamCol(f){const G=[95,194,90],Y=[230,185,58],R=[226,96,58],t=clamp(f,0,1),[a,b,u]=t>=.5?[Y,G,(t-.5)*2]:[R,Y,t*2];
 return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*u)).join(',')})`}
function stamHUD(){const el=$('pStam');if(!el)return;const bp=S.mode==='bp'||S.phase==='title';el.hidden=bp;if(bp)return;
 const f=clamp(stamFrac(),0,1);el.firstElementChild.style.width=`${Math.round(f*100)}%`;el.firstElementChild.style.background=stamCol(f);
 el.className='stam'+(f<=0?' out':f<.25?' low':f<.5?' mid':'');el.title=`Stamina ${Math.round(f*100)}%`}
// sweat: drops fly off the cap and fall when he's under a third of his tank; faster and more of them when gassed
function drawSweat(g,x,y,now){if(S.mode==='bp'||S.phase==='title')return;const f=stamFrac();if(f>=.33)return;
 const out=f<=0,n=out?6:3,per=out?560:900;x=Math.round(x);y=Math.round(y);
 for(let i=0;i<n;i++){const u=((now+i*per/n)%per)/per,sd=i%2?1:-1,dx=sd*(3+u*6),dy=-23+u*u*14-u*3;
  const a=u<.8?1:1-(u-.8)/.2;if(a<=0)continue;g.globalAlpha=a;
  g.fillStyle='#8fd3ff';g.fillRect(x+Math.round(dx),y+Math.round(dy),1,2);g.fillStyle='#e8f7ff';g.fillRect(x+Math.round(dx),y+Math.round(dy),1,1)}
 g.globalAlpha=1;
 if(out&&(now%900)<450){g.fillStyle='#bfe8ff';g.fillRect(x-1,y-21,1,1);g.fillRect(x+2,y-20,1,1)}}// a sheen on his face
