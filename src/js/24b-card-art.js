// ---------- card art v2: a big original pixel portrait, drawn on a 64x80 grid then doubled to 128x160 ----------
// Every player gets an original cartoon figure: pose from his ratings, face/hair/beard from a hash of his card id.
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
function cardArt2(c){
 // chibi style: a 32x40 pixel sprite (big head, tiny body) blown up 4x, every pixel crisp
 const G=32,GH=40,L=document.createElement('canvas');L.width=G;L.height=GH;const g=L.getContext('2d');
 const F=document.createElement('canvas');F.width=G;F.height=GH;const f=F.getContext('2d');// the figure, outlined separately
 const p=c.p,T=c.T||TEAMS[c.k],bl=c.set==='bl',rr=mulberry32(hash(c.id+'chibi'));
 const R=(x,y,w,h,col,ctx)=>{(ctx||g).fillStyle=col;(ctx||g).fillRect(x|0,y|0,w|0,h|0)},P=(x,y,col,ctx)=>R(x,y,1,1,col,ctx);
 // ---- backdrop ----
 if(bl){R(0,0,G,17,'#141c44');R(0,0,G,5,'#0c1230');for(let k=0;k<8;k++)P(rr()*G,rr()*6,'#e9ecf7');
  for(const lx of[4,27]){R(lx-2,1,5,2,'#e6e8f0');P(lx-1,1,'#fff6c8');P(lx+1,1,'#fff6c8')}
  for(let y=7;y<17;y++)for(let x=(y&1);x<G;x+=2)if(rr()<.6)P(x,y,['#4f6aa8','#c94a3a','#e8e4dc','#7a86a6',T.jersey,T.cap][Math.floor(rr()*6)]);
 }else{const ST2=STADIUMS[c.k];R(0,0,G,17,ST2.seat[0]);for(let y=1;y<17;y++)for(let x=(y&1);x<G;x+=2)if(rr()<.55)P(x,y,['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f1ecdc',T.jersey,T.cap][Math.floor(rr()*7)])}
 const ST3=bl?BL_PARK:STADIUMS[c.k];R(0,17,G,2,ST3.pad);R(0,19,G,1,ST3.pad2);
 for(let y=20;y<GH;y++)R(0,y,G,1,ST3.grass[((y-20)>>2)&1]);
 if(c.pit){R(5,31,22,9,'#c48c56');R(8,30,16,1,'#c48c56');R(13,34,6,1,CREAM)}else{R(0,32,G,8,'#c48c56');R(2,34,1,6,CREAM);R(2,34,9,1,CREAM)}
 g.fillStyle='rgba(8,20,14,.35)';g.fillRect(9,36,14,1);
 // ---- the chibi ----
 const lefty=p.hand==='L',hd=hash(c.id+'face'),sk=p.skin||skinOf(p.name),sk2=shade(sk,-.16);
 const hair=['#1b1714','#2b1d14','#3a2718','#5a3a20','#1b1714','#6e4a28'][hd%6],J=T.jersey,J2=shade(J,-.28),Cp=T.cap,Cp2=shade(Cp,-.28);
 const v=hash(c.id)%3;let pose=c.pit?(v===2?'kick':'throw'):p.spd>=85&&v!==0?'run':p.def>=88&&v===1?'field':'bat';
 const helm=!c.pit&&pose!=='field';
 const D=(x,y,w,h,col)=>R(x,y,w,h,col,f);
 // legs + shoes
 if(pose==='run'){D(12,29,3,4,'#eeeae0');D(10,32,3,2,Cp);D(8,33,4,2,SHOE);D(17,29,3,3,'#eeeae0');D(19,31,3,2,Cp);D(21,32,4,2,SHOE)}
 else if(pose==='kick'){D(16,29,3,5,'#eeeae0');D(16,32,3,2,Cp);D(15,34,5,2,SHOE);D(11,26,4,3,'#eeeae0');D(9,28,3,2,Cp);D(8,29,3,2,SHOE)}
 else{D(12,29,3,5,'#eeeae0');D(17,29,3,5,'#eeeae0');D(12,32,3,2,Cp);D(17,32,3,2,Cp);D(11,34,4,2,SHOE);D(17,34,4,2,SHOE)}
 // body: jersey with a little number, belt, pants
 D(11,20,10,7,J);D(11,20,2,7,J2);D(13,22,1,3,CREAM);D(14,22,1,1,CREAM);D(15,22,1,3,CREAM);D(13,24,3,1,CREAM);D(11,26,10,1,BELT);D(12,27,8,2,'#eeeae0');D(12,27,2,2,'#d6d0c0');
 // arms + props
 if(pose==='bat'){D(20,21,3,2,J);D(22,20,2,2,sk);D(8,21,3,2,J2);D(10,21,2,2,sk);
  const bc=p.bat||'#d9b07a';for(let k=0;k<9;k++){D(23+Math.round(k*.5),19-k,2,1,bc)}D(26,9,3,3,bc)}
 else if(pose==='throw'){D(20,18,2,3,J);D(21,15,2,3,sk);D(21,13,3,3,CREAM);P(22,14,'#d24a3a',f);D(7,22,4,2,J2);D(5,21,4,4,GLOVE);D(6,22,2,1,shade(GLOVE,.25))}
 else if(pose==='kick'){D(18,21,3,2,J);D(16,20,4,4,GLOVE);D(10,21,3,2,J2);D(14,21,3,2,sk)}
 else if(pose==='field'){D(8,24,3,2,J2);D(4,25,5,5,GLOVE);D(5,26,2,2,shade(GLOVE,.25));D(20,23,3,2,J);D(22,24,2,2,sk)}
 else{D(8,21,3,2,J2);D(6,19,2,2,sk);D(20,22,3,2,J);D(22,23,2,2,sk)}
 // head: big and round, cap or helmet on top
 const hx=10,hy=7;D(hx+1,hy+3,10,10,sk);D(hx,hy+5,12,6,sk);D(hx+2,hy+12,8,1,sk2);
 D(hx-1,hy+7,1,3,sk);D(hx+12,hy+7,1,3,sk2);// ears
 // face
 const ex=hx+3,ey=hy+7;D(ex,ey,2,2,INK);D(ex+5,ey,2,2,INK);P(ex,ey,'#ffffff',f);P(ex+5,ey,'#ffffff',f);
 D(ex-1,ey+2,2,1,'#f29aa0');D(ex+6,ey+2,2,1,'#f29aa0');
 if(hd%4===1){D(ex+1,ey+3,5,2,hair);P(ex+3,ey+3,sk,f)}else{P(ex+2,ey+3,'#6a3020',f);P(ex+3,ey+4,'#6a3020',f);P(ex+4,ey+3,'#6a3020',f)}
 D(ex-1,ey-1,2,1,hair);D(ex+5,ey-1,2,1,hair);
 // cap / helmet
 D(hx,hy+1,12,5,Cp);D(hx+1,hy,10,1,Cp);D(hx+2,hy+1,8,1,shade(Cp,.25));
 if(helm){D(hx-1,hy+3,2,6,Cp);D(hx+11,hy+3,2,4,Cp2);D(hx-1,hy+8,2,1,Cp2)}else{D(hx-1,hy+4,1,3,hair);D(hx+12,hy+4,1,3,hair)}
 D(hx+8,hy+5,6,2,Cp2);// brim to the side he's facing
 if(pose==='run'){for(let k=0;k<3;k++)D(2,24+k*3,3,1,'rgba(244,241,232,.7)')}
 // outline every figure pixel's empty neighbours in ink, then mirror for lefties, then lay it on the backdrop
 {const id=f.getImageData(0,0,G,GH),d=id.data,o=new Uint8ClampedArray(d);const at=(x,y)=>x>=0&&y>=0&&x<G&&y<GH&&d[(y*G+x)*4+3]>40;
  for(let y=0;y<GH;y++)for(let x=0;x<G;x++){const i=(y*G+x)*4;if(d[i+3]>40)continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){o[i]=27;o[i+1]=31;o[i+2]=36;o[i+3]=255}}
  f.putImageData(new ImageData(o,G,GH),0,0)}
 g.save();if(lefty){g.translate(G,0);g.scale(-1,1)}g.drawImage(F,0,0);g.restore();
 if(c.r>=3){for(const[sx,sy]of[[3,4],[28,9],[27,28]]){P(sx,sy,'#fff3b0');P(sx-1,sy,'#ffcf4a');P(sx+1,sy,'#ffcf4a');P(sx,sy-1,'#ffcf4a');P(sx,sy+1,'#ffcf4a')}}
 const out=document.createElement('canvas');out.width=128;out.height=160;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(L,0,0,128,160);
 return out.toDataURL()}
