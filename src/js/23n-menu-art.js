/* ---------- main menu art: the TEAM button wears a pixel paint swirl in your club's colors; SHOP is holographic ---------- */
/* The swirl is drawn once on a tiny canvas (each canvas pixel becomes one chunky pixel on the button) and redrawn only
   when your club changes. With no club chosen yet it uses the default blue / cream / gold / red swirl. */
const MA_DEFAULT=['#0f1f4a','#1b4f96','#2f86c6','#7cc7e4','#f4ead0','#f6c64a','#e88a2c','#c8361f','#7d1a14'];
function maMix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function maPalette(club){const T=club&&TEAMS[club];if(!T)return MA_DEFAULT;
 const a=T.jersey||'#33475e',b=T.cap||'#c8202a',c=T.brim||maMix(b,'#000000',.4);
 return[maMix(a,'#000000',.55),maMix(a,'#000000',.25),a,maMix(a,'#ffffff',.35),'#f4ead0',maMix(b,'#ffffff',.3),b,c,maMix(c,'#000000',.4)]}
/* the swirl at a moment tau (0..1) of its loop. The folds drift on whole turns of tau and the colors flow one full
   palette step around per loop, so tau=1 lands exactly on tau=0: a seamless, endless loop. Grain and gold flecks are
   fixed per pixel, so they ride along instead of flickering. */
const MA_W=60,MA_H=20,MA_FX={};
function maFixed(club){if(MA_FX[club])return MA_FX[club];let s=0;for(const ch of club||'pd')s=(s*31+ch.charCodeAt(0))>>>0;const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const f={ph:rnd()*6.28,ph2:rnd()*6.28,grain:new Float32Array(MA_W*MA_H),fleck:new Uint8Array(MA_W*MA_H)};
 for(let i=0;i<MA_W*MA_H;i++){f.grain[i]=(rnd()-.5)*.035;f.fleck[i]=rnd()<.035?1:0}
 f.pal=maPalette(club).map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));return MA_FX[club]=f}
function maDraw(g,club,tau){const f=maFixed(club),pal=f.pal,n=pal.length,img=g.createImageData(MA_W,MA_H),d=img.data,T=tau*6.2832;
 const ph=f.ph+T,ph2=f.ph2-T,gold=[246,198,74];
 for(let y=0;y<MA_H;y++)for(let x=0;x<MA_W;x++){const k=y*MA_W+x;let u=x/MA_W*2.3,v=y/MA_H*.9;
  /* fold the space over itself twice so the bands curl like poured paint */
  u+=.55*Math.sin(v*3.1+u*1.2+ph);v+=.35*Math.sin(u*2.3+ph2);u+=.25*Math.sin(v*5+u*.7+T);
  let t=(u*.42+v*1.15+.18*Math.sin(u*4.1+v*2.7)+tau)%1;if(t<0)t+=1;t+=f.grain[k];
  const i=Math.max(0,Math.min(n-1,Math.floor(t*n))),c=f.fleck[k]&&i<=2?gold:pal[i];d[k*4]=c[0];d[k*4+1]=c[1];d[k*4+2]=c[2];d[k*4+3]=255}
 g.putImageData(img,0,0)}
/* a still frame as an image (the Account banner) */
function maSwirl(club){const cv=document.createElement('canvas');cv.width=MA_W;cv.height=MA_H;maDraw(cv.getContext('2d'),club,0);return cv.toDataURL()}
/* the TEAM button: a live canvas behind the label, moving about 12 frames a second while the main menu is showing */
let maFor,maCv=null;const MA_LOOP=16000;
function maPaint(){const club=(typeof MYTEAM!=='undefined'&&MYTEAM&&MYTEAM.club)||'';const b=$('goInv');if(!b)return;
 if(!maCv){maCv=document.createElement('canvas');maCv.className='maArt';maCv.width=MA_W;maCv.height=MA_H;maCv.setAttribute('aria-hidden','true');b.prepend(maCv)}
 if(club===maFor)return;maFor=club;const T=TEAMS[club];b.style.setProperty('--maEdge',T?(T.cap||'#c7871a'):'#c7871a');maDraw(maCv.getContext('2d'),club,(performance.now()%MA_LOOP)/MA_LOOP)}
let maLast=0;
function maTick(now){requestAnimationFrame(maTick);if(now-maLast<80||document.hidden||!maCv||$('title').hidden||$('scrMain').hidden)return;maLast=now;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;maDraw(maCv.getContext('2d'),maFor,(now%MA_LOOP)/MA_LOOP)}
/* banners (your account, a friend's profile) get the same live swirl: a canvas behind the banner, drawn while it's on screen */
const MA_LIVE=new Map();
function maLive(el,club){let cv=el.querySelector(':scope>.maArt');if(!cv){cv=document.createElement('canvas');cv.className='maArt';cv.width=MA_W;cv.height=MA_H;cv.setAttribute('aria-hidden','true');el.prepend(cv)}
 const L=MA_LIVE.get(el)||{cv};L.club=club||'';MA_LIVE.set(el,L);maDraw(cv.getContext('2d'),L.club,(performance.now()%MA_LOOP)/MA_LOOP)}
let maLiveAt=0;
function maLiveTick(now){requestAnimationFrame(maLiveTick);if(now-maLiveAt<80||document.hidden||!MA_LIVE.size)return;maLiveAt=now;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 for(const[el,L]of MA_LIVE)if(el.offsetParent)maDraw(L.cv.getContext('2d'),L.club,(now%MA_LOOP)/MA_LOOP)}
maPaint();setInterval(maPaint,1000);requestAnimationFrame(maTick);requestAnimationFrame(maLiveTick);
