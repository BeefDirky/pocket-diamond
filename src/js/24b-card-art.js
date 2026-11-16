// ---------- card art: the park (or rarity backdrop) on a 32x40 grid blown up 4x, with a classic pixel ballplayer on top ----------
// The player is one of the hand-made sprites in 24b1-sprites.js (pose from his ratings), in his club colours with its logo on the cap.
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
/* the plain kit every card wears until he's put in a lineup */
const CARD_KIT={jersey:'#dfe3e8',cap:'#4b535c'};
/* a quick box blur (two passes) over a whole canvas; works everywhere, unlike ctx.filter */
function softBlur(o,W,H,r){const id=o.getImageData(0,0,W,H),a=id.data,b=new Uint8ClampedArray(a.length);
 for(let pass=0;pass<2;pass++){const src=pass?b:a,dst=pass?a:b;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let R=0,G=0,B=0,n=0;
   for(let k=-r;k<=r;k++){const xx=pass?x:Math.min(W-1,Math.max(0,x+k)),yy=pass?Math.min(H-1,Math.max(0,y+k)):y,i=(yy*W+xx)*4;R+=src[i];G+=src[i+1];B+=src[i+2];n++}
   const j=(y*W+x)*4;dst[j]=R/n;dst[j+1]=G/n;dst[j+2]=B/n;dst[j+3]=255}}
 o.putImageData(id,0,0)}
/* swirl colours for a card with no club, by rarity: common gray, rare blue, epic purple, legend a soft rainbow */
const CARD_SWIRL=[['#3a3f45','#565c63','#737a81','#959ca2','#c3c8cc','#eef0f1','#a9b0b6','#6d747a','#45494e'],
 ['#0d2a5e','#174a9a','#2f6fd0','#5b95e8','#a9cdf6','#eef5ff','#7fb0ec','#2a5fb8','#12306a'],
 ['#2a1250','#46207e','#6a38b4','#8f5bd8','#c6a6f2','#f4ecff','#a77ee4','#5b2c9c','#311660'],
 ['#ffd1dc','#ffe9b8','#fff8c9','#d4f7d0','#c9ecff','#d9d2ff','#f6d0ff','#ffd1dc','#ffe9b8']];
/* the same folded-paint swirl as the TEAM button, on the card's own grid; each card gets its own twist from its id */
function cardSwirl(g,W,H,pal,seed){const P=pal.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))),n=P.length,rnd=mulberry32(hash(seed+'swirl'));
 const ph=rnd()*6.28,ph2=rnd()*6.28,sh=rnd(),img=g.createImageData(W,H),d=img.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let u=x/W*1.5,v=y/H*1.9;
  u+=.55*Math.sin(v*3.1+u*1.2+ph);v+=.35*Math.sin(u*2.3+ph2);u+=.25*Math.sin(v*5+u*.7);
  let t=(u*.42+v*.8+.18*Math.sin(u*4.1+v*2.7)+sh)%1;if(t<0)t+=1;t+=(rnd()-.5)*.035;
  const c=P[Math.max(0,Math.min(n-1,Math.floor(t*n)))],k=(y*W+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255}
 g.putImageData(img,0,0)}
/* rarity backdrops: common gray, rare blue, epic purple, legend a soft chrome rainbow */
function cardBack(g,r,G,GH,R,P){
 if(r>=3){const band=['#ffd1dc','#ffe9b8','#fff8c9','#d4f7d0','#c9ecff','#d9d2ff','#f6d0ff'];
  for(let y=0;y<GH;y++)for(let x=0;x<G;x++){const k=Math.floor(((x+y*.8)/6))%band.length;P(x,y,band[(k+band.length)%band.length])}
  for(let y=0;y<GH;y++)for(let x=0;x<G;x++)if(((x+y)%9)===0)P(x,y,'rgba(255,255,255,.55)');
  for(let y=0;y<GH;y++){g.fillStyle=`rgba(255,255,255,${(.32*(1-Math.abs(y-12)/16)).toFixed(3)})`;if(Math.abs(y-12)<16)g.fillRect(0,y,G,1)}
 }else{const pal=[['#8d959c','#7b838a','#a3aab0'],['#3f7fd6','#3170c4','#5c97e6'],['#8b55d6','#7743c2','#a476e6']][r];
  for(let y=0;y<GH;y++)R(0,y,G,1,(y>>2)&1?pal[0]:pal[1]);
  for(let y=1;y<GH;y+=4)for(let x=(y>>2)&1?0:2;x<G;x+=4)P(x,y,pal[2])}
 g.fillStyle='rgba(0,0,0,.22)';g.fillRect(8,35,16,2);g.fillRect(10,37,12,1)}
function cardArt2(c,tk){/* tk: a club key to dress him in that club's kit in front of its park; none = a plain kit on his rarity colour */
 // chibi style: a 32x40 pixel sprite (big head, tiny body) blown up 4x, every pixel crisp
 const G=32,GH=40,L=document.createElement('canvas');L.width=G;L.height=GH;const g=L.getContext('2d');
 const F=document.createElement('canvas');F.width=G;F.height=GH;const f=F.getContext('2d');// the figure, outlined separately
 const p=c.p,T=tk?TEAMS[tk]:CARD_KIT,bl=!!tk&&false,rr=mulberry32(hash(c.id+'chibi'));
 const R=(x,y,w,h,col,ctx)=>{(ctx||g).fillStyle=col;(ctx||g).fillRect(x|0,y|0,w|0,h|0)},P=(x,y,col,ctx)=>R(x,y,1,1,col,ctx);
 // ---- backdrop: the abstract paint swirl, in the club's colours (or his rarity's colours with no club) ----
 cardSwirl(g,G,GH,tk?maPalette(tk):CARD_SWIRL[Math.min(3,c.r|0)],c.id);
 g.fillStyle='rgba(0,0,0,.28)';g.fillRect(9,36,14,1);g.fillRect(11,37,10,1);
 // ---- the player: a classic pixel sprite (24b1-sprites.js), recoloured for the club ----
 const lefty=p.hand==='L',v=hash(c.id);
 const pose=c.pit?['pitchSet','pitchKick','pitchThrow'][v%3]:p.pos==='C'?'catch':p.def>=88&&v%3===1?(v%2?'field':'field2'):['batUp','batUp2','batUp3','swing'][v%4];
 const out=document.createElement('canvas');out.width=128;out.height=160;const o=out.getContext('2d');
 /* the swirl, softened: blown up smoothly, then a light blur, so it sits behind the crisp player */
 o.imageSmoothingEnabled=true;o.drawImage(L,0,0,128,160);softBlur(o,128,160,3);o.imageSmoothingEnabled=false;
 if(c.r>=3){const Q=(x,y,col)=>{o.fillStyle=col;o.fillRect(x*4,y*4,4,4)};for(const[sx,sy]of[[3,4],[28,9],[27,28]]){Q(sx,sy,'#fff3b0');Q(sx-1,sy,'#ffcf4a');Q(sx+1,sy,'#ffcf4a');Q(sx,sy-1,'#ffcf4a');Q(sx,sy+1,'#ffcf4a')}}
 const sk=p.skin||skinOf(p.name),sp=spriteCanvas(pose,{k:INK,c:T.cap,C:T.brim||shade(T.cap,-.3),s:sk,S:shade(sk,-.15),w:'#f4f5f7',W:'#b8bcc4',a:T.jersey,A:shade(T.jersey,-.3),g:SPR_GLOVE,G:shade(SPR_GLOVE,-.35),r:'#d24a3a'});
 const Z=4,sw=sp.c.width*Z,sh=sp.c.height*Z,x0=Math.round((128-sw)/2),y0=150-sh;
 o.save();if(lefty){o.translate(128,0);o.scale(-1,1)}o.drawImage(sp.c,x0,y0,sw,sh);o.restore();
 /* the club logo on the front of the cap (drawn after the mirror, so it never reads backwards) */
 const mk=tk&&CAP_MARKS[tk];
 if(mk&&sp.cap){const q=sp.cap,mw=Math.max(...mk.m.map(r=>r.length)),mh=mk.m.length;
  const gx=Math.round(q.cx-mw/2),gy=Math.max(q.y,Math.round(q.cy-mh/2));/* cell position on the sprite */
  mk.m.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;o.fillStyle=mk.p[ch];
   const sx=gx+(lefty?mw-1-i:i),px=x0+sx*Z;o.fillRect(lefty?128-px-Z:px,y0+(gy+j)*Z,Z,Z)}})}
 return out.toDataURL()}
/* a sprite drawn at 1 px per cell with an ink rim, plus where its cap sits (for the logo); cached per pose + colours */
const SPR_CACHE={},SPR_GLOVE='#a0602e';
function spriteCanvas(pose,pal){const key=pose+JSON.stringify(pal);if(SPR_CACHE[key])return SPR_CACHE[key];
 const S=SPRITES[pose],M=S.m,W=Math.max(...M.map(r=>r.length))+2,H=M.length+2,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 let cx0=99,cx1=-1,cy0=99,cy1=-1;const span={};
 M.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=pal[ch]||INK;g.fillRect(x+1,y+1,1,1);
  if(ch==='c'&&y<S.brim){const sp=span[y]||(span[y]=[x+1,x+1]);sp[0]=Math.min(sp[0],x+1);sp[1]=Math.max(sp[1],x+1);cx0=Math.min(cx0,x+1);cx1=Math.max(cx1,x+1);cy0=Math.min(cy0,y+1);cy1=Math.max(cy1,y+1)}}});
 const id=g.getImageData(0,0,W,H),d=id.data,o=new Uint8ClampedArray(d),at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0,ik=parseInt(INK.slice(1),16);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3])continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){o[i]=ik>>16;o[i+1]=ik>>8&255;o[i+2]=ik&255;o[i+3]=255}}
 g.putImageData(new ImageData(o,W,H),0,0);
 /* the middle of the dome: average the middle of each cap row, leaving out the bottom rows where the brim sticks out */
 let cap=null;if(cx1>=0){const ys=Object.keys(span).map(Number).filter(y=>y<=cy1-2),mids=(ys.length?ys:Object.keys(span).map(Number)).map(y=>(span[y][0]+span[y][1])/2);
  cap={x:cx0,y:cy0,w:cx1-cx0+1,h:cy1-cy0+1,cx:mids.reduce((a,b)=>a+b,0)/mids.length+.5,cy:(cy0+cy1+1)/2}}
 return SPR_CACHE[key]={c:cv,cap}}
