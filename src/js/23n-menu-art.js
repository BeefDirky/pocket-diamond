/* ---------- main menu art: the TEAM button wears a pixel paint swirl in your club's colors; SHOP is holographic ---------- */
/* The swirl is drawn once on a tiny canvas (each canvas pixel becomes one chunky pixel on the button) and redrawn only
   when your club changes. With no club chosen yet it uses the default blue / cream / gold / red swirl. */
const MA_DEFAULT=['#0f1f4a','#1b4f96','#2f86c6','#7cc7e4','#f4ead0','#f6c64a','#e88a2c','#c8361f','#7d1a14'];
function maMix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function maPalette(club){const T=club&&TEAMS[club];if(!T)return MA_DEFAULT;
 const a=T.jersey||'#33475e',b=T.cap||'#c8202a',c=T.brim||maMix(b,'#000000',.4);
 return[maMix(a,'#000000',.55),maMix(a,'#000000',.25),a,maMix(a,'#ffffff',.35),'#f4ead0',maMix(b,'#ffffff',.3),b,c,maMix(c,'#000000',.4)]}
function maSwirl(club){const W=60,H=20,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),pal=maPalette(club);
 let s=0;for(const ch of club||'pd')s=(s*31+ch.charCodeAt(0))>>>0;const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const ph=rnd()*6.28,ph2=rnd()*6.28;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let u=x/W*2.3,v=y/H*.9;
  /* fold the space over itself twice so the bands curl like poured paint */
  u+=.55*Math.sin(v*3.1+u*1.2+ph);v+=.35*Math.sin(u*2.3+ph2);u+=.25*Math.sin(v*5+u*.7);
  let t=(u*.42+v*1.15+.18*Math.sin(u*4.1+v*2.7))%1;if(t<0)t+=1;
  t+=(rnd()-.5)*.035;/* a little grain so neighbouring bands break up into pixels */
  let i=Math.max(0,Math.min(pal.length-1,Math.floor(t*pal.length)));g.fillStyle=pal[i];g.fillRect(x,y,1,1);
  if(i<=2&&rnd()<.035){g.fillStyle='#f6c64a';g.fillRect(x,y,1,1)}}/* gold flecks in the dark paint */
 return cv.toDataURL()}
let maFor;
function maPaint(){const club=(typeof MYTEAM!=='undefined'&&MYTEAM&&MYTEAM.club)||'';if(club===maFor)return;maFor=club;
 const b=$('goInv');if(!b)return;b.style.backgroundImage=`url(${maSwirl(club)})`;
 const T=TEAMS[club];b.style.setProperty('--maEdge',T?(T.cap||'#c7871a'):'#c7871a')}
maPaint();setInterval(maPaint,1000);
