// ---------- card art: the park (or rarity backdrop) on a 32x40 grid blown up 4x, with a classic pixel ballplayer on top ----------
// The player is one of the hand-made sprites in 24b1-sprites.js (pose from his ratings), in his club colours with its logo on the cap.
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
/* the plain kit every card wears until he's put in a lineup */
const CARD_KIT={jersey:'#dfe3e8',cap:'#4b535c'};
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
 // ---- backdrop ----
 if(tk){const ST2=STADIUMS[tk]||BL_PARK;R(0,0,G,17,ST2.seat[0]);for(let y=1;y<17;y++)for(let x=(y&1);x<G;x+=2)if(rr()<.55)P(x,y,['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f1ecdc',T.jersey,T.cap][Math.floor(rr()*7)]);
  R(0,17,G,2,ST2.pad);R(0,19,G,1,ST2.pad2);for(let y=20;y<GH;y++)R(0,y,G,1,ST2.grass[((y-20)>>2)&1]);
  if(c.pit){R(5,31,22,9,'#c48c56');R(8,30,16,1,'#c48c56');R(13,34,6,1,CREAM)}else{R(0,32,G,8,'#c48c56');R(2,34,1,6,CREAM);R(2,34,9,1,CREAM)}}
 else cardBack(g,c.r,G,GH,R,P);
 g.fillStyle='rgba(8,20,14,.35)';g.fillRect(9,36,14,1);
 // ---- the player: a classic pixel sprite (24b1-sprites.js), recoloured for the club ----
 const lefty=p.hand==='L',v=hash(c.id);
 const pose=c.pit?['pitchSet','pitchKick','pitchThrow'][v%3]:p.pos==='C'?'catch':p.def>=88&&v%3===1?(v%2?'field':'field2'):['batUp','batUp2','batUp3','swing'][v%4];
 if(c.r>=3){for(const[sx,sy]of[[3,4],[28,9],[27,28]]){P(sx,sy,'#fff3b0');P(sx-1,sy,'#ffcf4a');P(sx+1,sy,'#ffcf4a');P(sx,sy-1,'#ffcf4a');P(sx,sy+1,'#ffcf4a')}}
 const out=document.createElement('canvas');out.width=128;out.height=160;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(L,0,0,128,160);
 const sk=p.skin||skinOf(p.name),sp=spriteCanvas(pose,{k:INK,c:T.cap,C:T.brim||shade(T.cap,-.3),s:sk,S:shade(sk,-.15),w:'#f4f5f7',W:'#b8bcc4',a:T.jersey,A:shade(T.jersey,-.3),g:SPR_GLOVE,G:shade(SPR_GLOVE,-.35),r:'#d24a3a'});
 const Z=4,sw=sp.c.width*Z,sh=sp.c.height*Z,x0=Math.round((128-sw)/2),y0=150-sh;
 o.save();if(lefty){o.translate(128,0);o.scale(-1,1)}o.drawImage(sp.c,x0,y0,sw,sh);o.restore();
 /* the club logo on the front of the cap (drawn after the mirror, so it never reads backwards) */
 if(tk&&LOGO[tk]&&sp.cap){const q=sp.cap,ls=Math.round(Math.min(q.w*.62,q.h*1.05)*Z),cx=x0+(q.x+q.w/2)*Z,cy=y0+(q.y+q.h/2)*Z,mx=lefty?128-cx:cx;
  o.imageSmoothingEnabled=true;o.imageSmoothingQuality='high';o.drawImage(LOGO[tk],Math.round(mx-ls/2),Math.round(cy-ls/2),ls,ls);o.imageSmoothingEnabled=false}
 return out.toDataURL()}
/* a sprite drawn at 1 px per cell with an ink rim, plus where its cap sits (for the logo); cached per pose + colours */
const SPR_CACHE={},SPR_GLOVE='#a0602e';
function spriteCanvas(pose,pal){const key=pose+JSON.stringify(pal);if(SPR_CACHE[key])return SPR_CACHE[key];
 const S=SPRITES[pose],M=S.m,W=Math.max(...M.map(r=>r.length))+2,H=M.length+2,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 let cx0=99,cx1=-1,cy0=99,cy1=-1;
 M.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=pal[ch]||INK;g.fillRect(x+1,y+1,1,1);
  if(ch==='c'&&y<S.brim){cx0=Math.min(cx0,x+1);cx1=Math.max(cx1,x+1);cy0=Math.min(cy0,y+1);cy1=Math.max(cy1,y+1)}}});
 const id=g.getImageData(0,0,W,H),d=id.data,o=new Uint8ClampedArray(d),at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0,ik=parseInt(INK.slice(1),16);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3])continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){o[i]=ik>>16;o[i+1]=ik>>8&255;o[i+2]=ik&255;o[i+3]=255}}
 g.putImageData(new ImageData(o,W,H),0,0);
 return SPR_CACHE[key]={c:cv,cap:cx1<0?null:{x:cx0,y:cy0,w:cx1-cx0+1,h:cy1-cy0+1}}}
