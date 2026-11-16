// ---------- card art v2: a big original pixel portrait, drawn on a 64x80 grid then doubled to 128x160 ----------
// Every player gets an original cartoon figure: pose from his ratings, face/hair/beard from a hash of his card id.
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
/* ---- card art v3: a head-and-shoulders baseball-card portrait on a 64x80 grid, doubled to 128x160 ----
   Lit from the upper left: every surface has a light side, a base and a shadow side. The face, hair, beard, brows and
   expression come from a hash of the card id; the kit and park from the club he plays for (a plain kit until he's in a
   lineup). Hitters rest a bat on the shoulder (and may wear the helmet); pitchers hold the glove up at the chest. */
const CA_DIG={0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001111'};
function cardArt2(c,tk){
 const G=64,GH=80,L=document.createElement('canvas');L.width=G;L.height=GH;const g=L.getContext('2d');
 const F=document.createElement('canvas');F.width=G;F.height=GH;const f=F.getContext('2d');
 const p=c.p,T=tk?TEAMS[tk]:CARD_KIT,rr=mulberry32(hash(c.id+'v3')),hd=hash(c.id+'face');
 const R=(x,y,w,h,col,ctx)=>{(ctx||g).fillStyle=col;(ctx||g).fillRect(x|0,y|0,w|0,h|0)},P=(x,y,col,ctx)=>R(x,y,1,1,col,ctx);
 const D=(x,y,w,h,col)=>R(x,y,w,h,col,f),Q=(x,y,col)=>R(x,y,1,1,col,f);
 const TXT=[];/* lettering is drawn after a lefty's mirror, so numbers and letters always read the right way */
 const glyph=(gl,x,y,col,bold)=>TXT.push([gl,x,y,col,bold]);
 /* ---- backdrop ---- */
 if(tk){const ST2=STADIUMS[tk]||BL_PARK;
  for(let y=0;y<40;y++)R(0,y,G,1,ST2.seat[(y>>2)&1]);
  for(let y=1;y<38;y+=2)for(let x=(y>>1)&1;x<G;x+=2)if(rr()<.5)P(x,y,['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f1ecdc',T.jersey,T.cap][Math.floor(rr()*7)]);
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,0,G,40);
  R(0,40,G,3,ST2.pad);R(0,43,G,1,ST2.pad2);for(let y=44;y<GH;y++)R(0,y,G,1,ST2.grass[((y-44)>>2)&1])}
 else{const pal=[['#8d959c','#7d858c','#a6adb3'],['#3f7fd6','#3473c6','#6aa1ea'],['#8b55d6','#7a46c4','#ac80ea'],['#f0c95a','#e3b444','#fff0b0']][Math.min(3,c.r)];
  for(let y=0;y<GH;y++)for(let x=0;x<G;x++)P(x,y,((x+y)>>3)&1?pal[0]:pal[1]);
  for(let y=0;y<GH;y+=3)for(let x=(y%6?1:3);x<G;x+=6)P(x,y,pal[2])}
 /* a soft spotlight behind the head, darker toward the corners */
 for(let y=0;y<GH;y++)for(let x=0;x<G;x+=1){const d=Math.hypot((x-32)/34,(y-30)/40);if(d>.75){g.fillStyle=`rgba(0,0,0,${Math.min(.35,(d-.75)*.6).toFixed(3)})`;g.fillRect(x,y,1,1)}else if(d<.45){g.fillStyle=`rgba(255,255,255,${((.45-d)*.22).toFixed(3)})`;g.fillRect(x,y,1,1)}}
 /* ---- palette ---- */
 const sk=p.skin||skinOf(p.name),skL=shade(sk,.1),skD=shade(sk,-.17),skDD=shade(sk,-.32);
 const hair=['#1b1714','#2b1d14','#3a2718','#5a3a20','#14110f','#6e4a28','#8a5a2a','#1f1a17'][hd%8],hairL=shade(hair,.18);
 const J=T.jersey,JL=shade(J,.13),JD=shade(J,-.2),JDD=shade(J,-.36),Cp=T.cap,CpL=shade(Cp,.2),CpD=shade(Cp,-.3);
 const helm=!c.pit&&(hd>>3)%3!==0,pit=c.pit;
 /* ---- torso: broad shoulders, the jersey lit from the left, a placket with buttons, piping round the neck ---- */
 for(let y=50;y<GH;y++){const t=Math.min(1,(y-50)/12),hw=Math.round(12+t*10+(y>62?2:0)),x0=32-hw,x1=32+hw;
  D(x0,y,x1-x0,1,J);D(x0,y,Math.max(2,Math.round(hw*.35)),1,JL);D(x1-Math.round(hw*.5),y,Math.round(hw*.5),1,JD);D(x1-2,y,2,1,JDD)}
 /* sleeves: a darker seam where the arm meets the body */
 for(let y=58;y<GH;y++){D(13,y,1,1,JD);D(50,y,1,1,JDD)}
 /* neck */
 D(27,44,11,9,sk);D(34,44,4,9,skD);D(27,51,11,1,skD);
 /* V-neck and piping */
 for(let k=0;k<7;k++){D(29+k/2|0,50+k,9-(k|0),1,sk);Q(28+(k>>1),50+k,Cp);Q(36-(k>>1),50+k,Cp)}
 D(31,57,3,1,Cp);
 /* placket and buttons */
 for(let y=58;y<GH;y++){Q(32,y,JD);Q(33,y,JL)}for(let y=60;y<GH;y+=6)Q(32,y,CREAM);
 /* the number on the chest (his own number, in the cap colour) */
 {const n=String(p.no!=null?p.no:(hash(c.id)%89)+1).slice(-2);let x0=pit?(n.length>1?37:41):(n.length>1?15:19);for(const ch of n){glyph(CA_DIG[ch],x0,61,Cp,true);x0+=7}}
 /* ---- head: an oval face, shaded on the right, a touch of colour in the cheeks ---- */
 const fx=32,fy=31,fw=12,fh=15;
 for(let y=fy-fh;y<=fy+fh;y++){const ty=(y-fy)/fh,hw=Math.round(fw*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(ty),2.2)))*(ty>0?1-ty*.28:1));
  if(hw<=0)continue;D(fx-hw,y,hw*2+1,1,sk);D(fx-hw,y,Math.max(1,Math.round(hw*.45)),1,skL);D(fx+hw-Math.round(hw*.45),y,Math.round(hw*.45)+1,1,skD)}
 /* ears */
 D(18,29,2,6,sk);Q(18,30,skD);D(45,29,2,6,skD);Q(46,30,skDD);
 /* hair at the sides, sideburns, a bit at the back of the neck */
 D(19,22,3,8,hair);D(43,22,3,8,hair);Q(19,22,hairL);D(20,30,2,3,hair);D(43,30,2,3,hair);
 /* eyes: whites, a pupil looking slightly toward the light, a lid line */
 const ey=30,look=(hd>>5)&1?0:1;
 for(const ex of[24,35]){D(ex,ey,5,3,'#f4f1e8');D(ex+1+look,ey,3,3,'#4a3626');D(ex+2+look,ey+1,2,2,INK);Q(ex+1+look,ey,'#ffffff');D(ex,ey-1,5,1,skDD);Q(ex+4,ey+2,skD)}
 /* brows: angled by mood */
 const mood=(hd>>7)%3;/* 0 calm, 1 focused, 2 fierce */
 for(const[ex,dir]of[[24,1],[35,-1]]){for(let k=0;k<5;k++){const yy=ey-3-(mood===0?0:mood===1?(dir>0?(k>2?1:0):(k<2?1:0)):(dir>0?(k>2?-1:1)*0+(k>2?1:0):(k<2?1:0)));Q(ex+k,yy+(mood===2&&((dir>0&&k>2)||(dir<0&&k<2))?1:0),hair)}}
 /* nose: a shadow down the right side and under the tip */
 D(33,32,1,5,skD);D(30,37,5,1,skDD);Q(29,36,skD);Q(31,36,skL);Q(34,36,skD);
 /* mouth */
 const mt=(hd>>9)%4,my=41;if(mt===0){D(28,my,9,1,'#7a3a2e');Q(27,my-1,'#7a3a2e');Q(37,my-1,'#7a3a2e');D(29,my+1,7,1,skD)}
 else if(mt===1){D(28,my,9,1,'#6d342a');D(29,my+1,7,1,skD)}
 else if(mt===2){D(28,my,8,1,'#6d342a');Q(36,my-1,'#6d342a');D(29,my+1,6,1,skD)}
 else{D(28,my-1,9,3,'#5a2620');D(29,my-1,7,1,'#f4f1e8');D(29,my+2,7,1,skD)}
 /* cheeks */
 D(23,36,3,1,'rgba(226,120,110,.5)');D(39,36,3,1,'rgba(226,120,110,.4)');
 /* facial hair */
 const fh2=(hd>>11)%6;
 if(fh2===1||fh2===2){for(let y=37;y<=46;y++)for(let x=19;x<=45;x++){const ty=(y-fy)/fh,hw=Math.round(fw*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(ty),2.2)))*(ty>0?1-ty*.28:1));
   if(Math.abs(x-fx)<=hw&&!(y>=40&&y<=42&&x>=28&&x<=36)&&(y>=40||Math.abs(x-fx)>=hw-2||fh2===1))Q(x,y,(x+y)%3?hair:hairL)}}
 if(fh2===3||fh2===1){D(28,39,9,1,hair);Q(27,40,hair);Q(37,40,hair)}
 if(fh2===4){for(let y=38;y<=45;y++)for(let x=22;x<=42;x++)if((x*7+y*3)%5===0&&f.getImageData(x,y,1,1).data[3])Q(x,y,shade(sk,-.42))}
 /* eye black for some hitters */
 if(!pit&&(hd>>13)%4===0){D(24,34,4,1,INK);D(36,34,4,1,INK)}
 /* ---- cap or batting helmet: a dome lit from the left, a front logo, a brim that throws a shadow on the brow ---- */
 for(let y=8;y<=25;y++){const ty=(y-25)/17,hw=Math.round(14*Math.sqrt(Math.max(0,1-ty*ty)));if(hw<=0)continue;
  D(32-hw,y,hw*2+1,1,Cp);D(32-hw,y,Math.max(1,Math.round(hw*.4)),1,CpL);D(32+hw-Math.round(hw*.35),y,Math.round(hw*.35)+1,1,CpD)}
 if(helm){/* glossy shell with an ear flap on the side facing the pitcher */
  D(16,21,5,14,Cp);D(16,21,1,14,CpL);D(19,34,3,1,CpD);for(let k=0;k<3;k++)Q(17,24+k*3,CpD);
  D(25,10,7,1,'rgba(255,255,255,.55)');D(24,11,2,2,'rgba(255,255,255,.35)')}
 else{/* seams and the button on top */Q(32,8,CpD);D(32,9,1,9,CpD);D(25,11,1,7,CpL)}
 /* front logo: his club's letter, or a star on the plain kit */
 {const lc=tk?CREAM:'#f4f1e8',lx=29,ly=15;if(tk){const ch=(T.name||'?')[0];const GL={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101110100110101',L:'100100100100111',M:'101111111101101',N:'111101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111'}[ch.toUpperCase()]||'111101101101111';
   glyph(GL,lx+2,ly,lc,false)}
  else{Q(32,ly+1,lc);D(31,ly+2,3,1,lc);D(30,ly+3,5,1,lc);D(31,ly+4,3,1,lc)}}
 /* brim (pitchers and fielders: forward and a little to the light; helmets: short) and its shadow */
 if(helm){D(19,25,27,2,CpD);D(19,25,27,1,Cp)}else{D(18,24,29,3,CpD);D(18,24,29,1,Cp);D(44,25,5,2,CpD)}
 D(21,27,23,1,skDD);D(22,28,21,1,skD);
 /* ---- props ---- */
 if(pit){/* the glove up at his chest: a rounded mitt, fingers on top, a laced web and a dark pocket, the ball tucked in */
  const gx=12,gy=57,GL0=GLOVE,GLL=shade(GLOVE,.22),GLD=shade(GLOVE,-.28),GLDD=shade(GLOVE,-.45);
  for(let y=0;y<18;y++){const t=y/17,hw=Math.round(9*Math.sqrt(Math.max(0,1-Math.pow((t-.45)/.6,2))));if(hw<=0)continue;D(gx+9-hw,gy+y,hw*2,1,GL0);Q(gx+9-hw,gy+y,GLL);Q(gx+8+hw,gy+y,GLD)}
  for(let k=0;k<4;k++){D(gx+3+k*3,gy-3+(k===0?2:k===3?1:0),2,4,GL0);Q(gx+3+k*3,gy-3+(k===0?2:k===3?1:0),GLL);Q(gx+4+k*3,gy+(k===0?2:k===3?1:0),GLD)}
  D(gx+5,gy+5,8,7,GLD);D(gx+6,gy+6,6,5,GLDD);/* pocket */
  for(let k=0;k<4;k++)Q(gx+15,gy+3+k*2,'#e8d7b0');D(gx+14,gy+2,1,8,GLD);/* web lacing */
  D(gx+3,gy+15,12,2,GLD);for(let k=0;k<5;k++)Q(gx+4+k*2,gy+15,'#e8d7b0');/* heel lacing */
  D(gx+12,gy+1,6,5,'#f4f1e8');D(gx+12,gy+1,6,1,'#ffffff');Q(gx+13,gy+3,'#d24a3a');Q(gx+15,gy+2,'#d24a3a');Q(gx+16,gy+4,'#d24a3a')}
 else{/* a bat resting on the shoulder, the barrel up behind his head, both hands on the handle at the chest */
  const bc=p.bat||'#d9b07a',bcL=shade(bc,.22),bcD=shade(bc,-.3),glv=(hd>>15)&1?'#f4f1e8':Cp,glvD=shade(glv,-.25);
  for(let k=0;k<40;k++){const x=40+Math.round(k*.5),y=74-k;const w=k<14?2:k<24?3:4;D(x,y,w,1,bc);Q(x,y,bcL);Q(x+w-1,y,bcD)}
  D(39,74,4,2,bcD);
  /* both hands round the handle: one glove shape, knuckles as short dark lines, the thumb wrapped over */
  const hx=37,hy=62;D(hx+1,hy,7,10,glv);D(hx,hy+1,9,8,glv);D(hx+1,hy,7,1,shade(glv,.18));D(hx+7,hy+1,2,8,glvD);for(let r=0;r<4;r++)D(hx+2,hy+2+r*2,4,1,glvD);D(hx,hy+4,3,2,shade(glv,.1));D(hx+2,hy+5,1,1,glvD)}
 /* ---- outline every figure pixel's empty neighbours in ink, mirror for lefties, lay it on the backdrop ---- */
 {const id=f.getImageData(0,0,G,GH),d=id.data,o=new Uint8ClampedArray(d);const at=(x,y)=>x>=0&&y>=0&&x<G&&y<GH&&d[(y*G+x)*4+3]>40;
  for(let y=0;y<GH;y++)for(let x=0;x<G;x++){const i=(y*G+x)*4;if(d[i+3]>40)continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){o[i]=22;o[i+1]=24;o[i+2]=28;o[i+3]=255}}
  f.putImageData(new ImageData(o,G,GH),0,0)}
 g.save();if(p.hand==='L'){g.translate(G,0);g.scale(-1,1)}g.drawImage(F,0,0);g.restore();
 /* lettering, mirrored in place (not flipped) for a lefty */
 for(const[gl,x,y,col,bold]of TXT){const cw=bold?2:1,w=3*cw,X=p.hand==='L'?G-x-w:x;for(let k=0;k<15;k++)if(gl[k]==='1'){R(X+(k%3)*cw,y+Math.floor(k/3),cw,1,col)}}
 if(c.r>=3){for(const[sx,sy]of[[6,8],[56,14],[54,44],[9,40]]){P(sx,sy,'#fff8d0');P(sx-1,sy,'#ffd84a');P(sx+1,sy,'#ffd84a');P(sx,sy-1,'#ffd84a');P(sx,sy+1,'#ffd84a')}}
 const out=document.createElement('canvas');out.width=128;out.height=160;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(L,0,0,128,160);
 return out.toDataURL()}
