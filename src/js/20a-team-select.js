// ---------- club select: one big club in the middle, arrows to flip through the league, and a moving wall of the
// club's emblem behind it (it scrolls diagonally and cross-fades to the new club's colors when you switch) ----------
const TS={cur:null,prev:null,t0:0,raf:0,rebuildT:0},TS_TILE={};
function tsTile(k){if(TS_TILE[k])return TS_TILE[k];const T=TEAMS[k],s=128,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');
 // the emblem simplified to a flat silhouette in a light tint of the club color
 // the emblem simplified to three flat tones of a light club tint: its bright parts solid, the rest faint, so the
 // shape and its main features read but none of the detail does
 g.imageSmoothingEnabled=false;g.drawImage(LOGO[k],24,24,80,80);const id=g.getImageData(0,0,s,s),d=id.data,tc=hexRGB(shade(T.jersey,.55));
 for(let i=0;i<d.length;i+=4){if(d[i+3]<40){d[i+3]=0;continue}const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;d[i]=tc[0];d[i+1]=tc[1];d[i+2]=tc[2];d[i+3]=l>.6?255:l>.35?140:55}
 g.putImageData(id,0,0);return TS_TILE[k]=c}
const TS_PAT={};
function tsPat(k,S2){const key=k+'|'+S2;if(TS_PAT[key])return TS_PAT[key];const sp=Math.round(S2*1.25),c=document.createElement('canvas');c.width=sp;c.height=sp*2;const g=c.getContext('2d'),tile=tsTile(k);
 // two emblems per repeat: one on the corner, one half a step over on the next row (a brick layout)
 for(const[x,y]of[[0,0],[sp,0],[0,sp*2],[sp,sp*2],[sp/2,sp]])g.drawImage(tile,x-S2/2,y-S2/2,S2,S2);
 return TS_PAT[key]={pat:g.createPattern(c,'repeat'),sp}}
function tsPaint(g,k,w,h,t,alpha){const T=TEAMS[k];g.globalAlpha=alpha;
 const bg=g.createLinearGradient(0,0,w,h);bg.addColorStop(0,shade(T.jersey,-.25));bg.addColorStop(1,shade(T.jersey,-.62));g.fillStyle=bg;g.fillRect(0,0,w,h);
 // a band of the cap color running across, like a team scarf
 g.save();g.translate(w/2,h/2);g.rotate(-.26);g.fillStyle=shade(T.cap,-.2);g.globalAlpha=alpha*.35;g.fillRect(-w*1.5,h*.18,w*3,h*.16);g.restore();
 // the emblem wall: one pre-drawn repeating pattern, slid along each frame (a single fill, cheap on any device)
 const P=tsPat(k,Math.round(Math.max(110,Math.min(w,h)/6.5))),cyc=P.sp*1.5/.028,u=(t%cyc)/cyc;g.globalAlpha=alpha*.3;
 g.save();g.translate(w/2,h/2);g.rotate(-.26);// each loop slides exactly one step of the brick layout (1.5 across, 1 down), so it wraps with no jump
 P.pat.setTransform(new DOMMatrix([1,0,0,1,u*P.sp*1.5,u*P.sp]));g.fillStyle=P.pat;const R=Math.hypot(w,h);g.fillRect(-R,-R,2*R,2*R);
 g.restore();g.globalAlpha=1}
function tsLoop(){TS.raf=0;const cv=$('tsBg');if(!cv||$('title').hidden||$('scrTeams').hidden)return;
 const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
 const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const now=performance.now(),f=Math.min(1,(now-TS.t0)/450);
 if(TS.prev&&f<1)tsPaint(g,TS.prev,w,h,now,1);tsPaint(g,TS.cur||S.you,w,h,now,TS.prev&&f<1?f:1);
 // a soft vignette so the middle reads
 const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,w,h);
 TS.raf=requestAnimationFrame(tsLoop)}
function tsStart(){if(!TS.raf)TS.raf=requestAnimationFrame(tsLoop)}
function tsRender(){if(!$('tsLogo'))return;const k=S.you,T=TEAMS[k],ST2=STADIUMS[k];
 if(TS.cur!==k){if(TS.cur){TS.prev=TS.cur;TS.t0=performance.now();const im=$('tsLogo');im.classList.remove('pop');void im.offsetWidth;im.classList.add('pop')}TS.cur=k}
 $('tsLogo').src=LOGO_URL[k];$('tsLogo').alt=`${T.city} ${T.name}`;$('tsName').textContent=`${T.city} ${T.name}`;$('tsSub').textContent=`${T.kcity} ${T.kname} · ${ST2?ST2.name:''}`;
 $('tsDots').innerHTML=ORDER.map(t=>`<i class="${t===k?'on':''}"></i>`).join('');tsStart()}
function tsGo(d){const i=ORDER.indexOf(S.you),k=ORDER[(i+d+ORDER.length)%ORDER.length];if(k===S.opp)S.opp=S.you;S.you=k;
 syncPicker();applyCustom();updateHUD();
 parkDirty()}
// building a ballpark takes most of a second, so flipping through clubs only marks it; the new park is built once,
// when the game actually starts
function parkDirty(){TS.dirty=true}
function tsFlush(){if(TS.dirty){TS.dirty=false;if(FIELD)rebuildPark()}}
$('tsPrev').addEventListener('click',()=>tsGo(-1));$('tsNext').addEventListener('click',()=>tsGo(1));
const tsInfoOpen=v=>{$('tsInfo').hidden=!v};
$('tsAbout').addEventListener('click',()=>tsInfoOpen(true));$('tsInfoX').addEventListener('click',()=>tsInfoOpen(false));
$('tsInfo').addEventListener('click',e=>{if(e.target===$('tsInfo'))tsInfoOpen(false)});
$('tsMapBtn').addEventListener('click',()=>{const sec=$('tsMapSec'),open=sec.hidden;sec.hidden=!open;$('tsMapBtn').textContent=open?'League map ▴':'League map ▾';if(open)drawKoreaMap()});
addEventListener('keydown',e=>{if($('title').hidden||$('scrTeams').hidden)return;
 if(!$('tsInfo').hidden){if(e.key==='Escape'){e.preventDefault();tsInfoOpen(false)}return}
 if(e.key==='ArrowLeft'){e.preventDefault();tsGo(-1)}else if(e.key==='ArrowRight'){e.preventDefault();tsGo(1)}
 else if(e.key==='Enter'&&!$('playGo').hidden&&document.activeElement===document.body){e.preventDefault();$('playGo').click()}});
// start the background whenever the screen opens
new MutationObserver(()=>{if(!$('scrTeams').hidden&&!$('title').hidden){tsRender();tsStart()}else tsInfoOpen(false)}).observe($('scrTeams'),{attributes:true,attributeFilter:['hidden']});
