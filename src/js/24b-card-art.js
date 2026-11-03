// ---------- card art v2: a big original pixel portrait, drawn on a 64x80 grid then doubled to 128x160 ----------
// Every player gets an original cartoon figure: pose from his ratings, face/hair/beard from a hash of his card id.
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
 const m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
function cardArt2(c){
 const L=document.createElement('canvas');L.width=64;L.height=80;const g=L.getContext('2d');g.imageSmoothingEnabled=false;
 const p=c.p,T=c.T||TEAMS[c.k],bl=c.set==='bl',rr=mulberry32(hash(c.id+'art2'));
 const P=(x,y,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1)};
 const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 // ---- backdrop ----
 if(bl){const sky=g.createLinearGradient(0,0,0,40);sky.addColorStop(0,'#0b1430');sky.addColorStop(1,'#26305e');g.fillStyle=sky;g.fillRect(0,0,64,40);
  for(const lx of[8,56]){R(lx-4,3,9,4,'#cfd6e6');for(let k=0;k<4;k++)R(lx-3+k*2,4,1,2,'#fff8d8');g.globalAlpha=.16;g.fillStyle='#fff6d8';g.beginPath();g.moveTo(lx-3,7);g.lineTo(lx+3,7);g.lineTo(32+(lx-32)*.2+10,40);g.lineTo(32+(lx-32)*.2-10,40);g.fill();g.globalAlpha=1}
  for(let y=14;y<34;y+=2)for(let x=(y/2)%2;x<64;x+=2)if(rr()<.55){P(x,y,['#7a86a6','#c94a3a','#e8e4dc','#4f6aa8',T.jersey,T.cap][Math.floor(rr()*6)])}
  for(let k=0;k<10;k++){const bx=rr()*64,by=12+rr()*20;g.globalAlpha=.5;P(bx,by,'#fff3c0');g.globalAlpha=1}
 }else{const ST2=STADIUMS[c.k];R(0,0,64,34,ST2.seat[0]);
  const shirts=['#e8d7c3','#3f82e6','#e0473d','#f5c935','#f38d2e','#f1ecdc','#6c7a86',T.jersey,T.jersey,T.cap];
  for(let y=1;y<33;y+=2)for(let x=(y>>1)%2;x<64;x+=2)if(rr()<.62){P(x,y,shirts[Math.floor(rr()*shirts.length)]);if(rr()<.5)P(x,y-1,SKINS[Math.floor(rr()*5)])}
  g.globalAlpha=.25;R(0,0,64,34,'#0b1a12');g.globalAlpha=1}
 const ST3=bl?BL_PARK:STADIUMS[c.k];
 R(0,34,64,5,ST3.pad);R(0,38,64,1,ST3.pad2);R(0,34,64,1,shade(ST3.pad,.25));
 for(let y=39;y<80;y++)R(0,y,64,1,ST3.grass[(Math.floor((y-39)/5)&1)]);
 if(c.pit){R(6,64,52,16,'#c48c56');R(10,62,44,3,'#c48c56');R(14,61,36,1,'#c48c56');R(27,69,10,2,CREAM);for(let k=0;k<30;k++)P(6+rr()*52,63+rr()*16,'#b07a44')}
 else{R(0,62,64,18,'#c48c56');for(let k=0;k<40;k++)P(rr()*64,62+rr()*18,'#b07a44');R(4,66,1,14,CREAM);R(4,66,20,1,CREAM)}
 // ---- figure ----
 const hd=hash(c.id+'face'),sk=p.skin||skinOf(p.name),sk2=shade(sk,-.18),hair=['#1b1714','#2b1d14','#3a2718','#5a3a20','#1b1714','#7a5230'][hd%6];
 const J=T.jersey,J2=shade(J,-.3),Cp=T.cap,Cp2=shade(Cp,-.3),PA='#eeeae0',PA2='#c9c3b4';
 const lefty=c.pit?p.hand==='L':p.hand==='L';const v=hash(c.id)%3;
 let pose;
 if(c.pit)pose=v===2?'kick':'release';
 else if(p.spd>=85&&v!==0)pose='run';
 else if(p.pow>=85&&v!==2)pose='swing';
 else if(p.def>=88&&v===1)pose='field';
 else pose='stance';
 // joints on a 64x80 grid, for a right-hander facing left (mirrored for lefties)
 const POSES={
  stance:{hip:[33,50],sh:[32,33],head:[31,24],kF:[25,61],fF:[21,73],kB:[39,61],fB:[42,73],eF:[25,34],hF:[38,27],eB:[42,36],hB:[39,28],bat:[[38,27],[50,8]]},
  swing:{hip:[32,50],sh:[30,33],head:[27,24],kF:[25,61],fF:[19,73],kB:[39,62],fB:[44,72],eF:[20,32],hF:[16,24],eB:[24,36],hB:[17,25],bat:[[16,24],[44,14]]},
  run:{hip:[31,49],sh:[27,33],head:[24,25],kF:[22,58],fF:[14,66],kB:[38,61],fB:[45,71],eF:[22,38],hF:[17,32],eB:[37,38],hB:[42,44],bat:null},
  field:{hip:[33,54],sh:[29,38],head:[25,30],kF:[22,62],fF:[17,73],kB:[42,63],fB:[47,73],eF:[24,48],hF:[20,56],eB:[36,47],hB:[30,57],bat:null,glove:'F'},
  release:{hip:[33,50],sh:[29,34],head:[25,26],kF:[22,61],fF:[15,73],kB:[42,60],fB:[48,68],eF:[20,36],hF:[12,32],eB:[38,38],hB:[38,44],bat:null,glove:'B'},
  kick:{hip:[34,50],sh:[33,33],head:[33,24],kF:[24,46],fF:[27,56],kB:[35,62],fB:[35,73],eF:[27,40],hF:[33,39],eB:[39,40],hB:[33,39],bat:null,glove:'F'}
 };
 const Q=POSES[pose],X=a=>lefty?64-a[0]:a[0],Y=a=>a[1],pt=a=>({x:X(a),y:Y(a)});
 const limb=(a,b,w,col)=>{const A=pt(a),B=pt(b),n=Math.max(1,Math.ceil(Math.hypot(B.x-A.x,B.y-A.y)));for(let i=0;i<=n;i++){const x=A.x+(B.x-A.x)*i/n,y=A.y+(B.y-A.y)*i/n;R(x-w/2,y-w/2,w,w,col)}};
 // pass 1 draws everything in black a pixel bigger (outline), pass 2 draws the colors
 const body=(o)=>{const ow=o?2:0,cc=(col)=>o?INK:col;
  // back leg
  limb(Q.hip,Q.kB,4+ow,cc(PA2));limb(Q.kB,Q.fB,4+ow,cc(PA2));if(!o){limb([Q.kB[0],Q.kB[1]+4],Q.fB,3,Cp2)}R(X(Q.fB)-(lefty?-1:3)-ow/2,Y(Q.fB)-1-ow/2,5+ow,2+ow,cc(SHOE));
  // back arm
  limb(Q.sh,Q.eB,3+ow,cc(J2));limb(Q.eB,Q.hB,3+ow,cc(sk2));
  // torso
  {const s=pt(Q.sh),h=pt(Q.hip);for(let i=0;i<=10;i++){const u=i/10,x=s.x+(h.x-s.x)*u,y=s.y+(h.y-s.y)*u,w=(9-u*2)+ow;R(x-w/2,y-1-ow/2,w,2+ow,cc(i<2?J:J))}
   if(!o){const mx=Math.round((s.x+h.x)/2),my=Math.round((s.y+h.y)/2);R(mx+(lefty?-4:2),my-6,2,9,J2);R(h.x-4,h.y-1,8,2,BELT);R(mx-2,my-4,1,4,CREAM);R(mx,my-4,1,4,CREAM);R(mx-2,my-4,3,1,CREAM)}}
  // front leg
  limb(Q.hip,Q.kF,4+ow,cc(PA));limb(Q.kF,Q.fF,4+ow,cc(PA));if(!o){limb([Q.kF[0]+(Q.fF[0]-Q.kF[0])*.35,Q.kF[1]+(Q.fF[1]-Q.kF[1])*.35],Q.fF,3,Cp)}
  R(X(Q.fF)-(lefty?-1:3)-ow/2,Y(Q.fF)-1-ow/2,5+ow,2+ow,cc(SHOE));
  // head
  {const h=pt(Q.head),f=lefty?1:-1;R(h.x-4-ow/2,h.y-4-ow/2,9+ow,10+ow,cc(sk));R(h.x-1-ow/2,h.y+5,4+ow,3+ow/2,cc(sk2));
   if(!o){// face: eye, brow, ear, nose, mouth; beard or moustache by hash
    R(h.x+f*2,h.y,1,2,INK);R(h.x+f*2-(f<0?1:0),h.y-1,2,1,hair);R(h.x-f*2,h.y+1,2,2,sk2);R(h.x+f*4,h.y+2,1,2,sk);R(h.x+f*3,h.y+4,2,1,sk2);
    if(hd%5===1){R(h.x-3,h.y+4,7,2,hair);R(h.x-2,h.y+5,5,1,hair)}else if(hd%5===2)R(h.x+f*2-1,h.y+3,3,1,hair);
    R(h.x-f*3-1,h.y-1,2,4,hair)}
   // cap (pitchers, fielders) or helmet (hitters)
   const helm=!c.pit&&pose!=='field';
   R(h.x-5-ow/2,h.y-6-ow/2,11+ow,helm?6+ow:4+ow,cc(Cp));R(h.x+(f<0?-8:3)-ow/2,h.y-2-ow/2,6+ow,2+ow,cc(Cp2));
   if(!o){R(h.x-4,h.y-6,9,1,shade(Cp,.3));if(helm){R(h.x-f*3-1,h.y-2,3,4,Cp);R(h.x-f*3,h.y-1,1,2,Cp2)}}}
  // bat
  if(Q.bat){limb(Q.bat[0],Q.bat[1],2+ow,cc(p.bat||'#d9b07a'));if(!o){const B=pt(Q.bat[1]);R(B.x-1,B.y-1,3,3,p.bat||'#d9b07a')}}
  // front arm
  limb(Q.sh,Q.eF,3+ow,cc(J));limb(Q.eF,Q.hF,3+ow,cc(sk));if(!o){R(X(Q.sh)-1,Y(Q.sh)+2,3,1,Cp)}
  // glove
  if(Q.glove){const gh=pt(Q.glove==='F'?Q.hF:Q.hB);R(gh.x-3-ow/2,gh.y-3-ow/2,6+ow,6+ow,cc(GLOVE));if(!o){R(gh.x-2,gh.y-2,3,2,shade(GLOVE,.25))}}
  if(c.pit&&pose==='release'&&!o){const hb=pt(Q.hF);R(hb.x+(lefty?2:-4),hb.y-2,3,3,CREAM);P(hb.x+(lefty?3:-3),hb.y-1,'#d24a3a')}
 };
 g.globalAlpha=.3;g.fillStyle='#08140e';g.beginPath();g.ellipse(32,74,17,3,0,0,Math.PI*2);g.fill();g.globalAlpha=1;
 body(true);body(false);
 if(pose==='run'){g.globalAlpha=.5;for(let k=0;k<4;k++)R(lefty?50+k*3:6-k*3,40+k*6,4,1,CREAM);g.globalAlpha=1}
 if(pose==='swing'){g.globalAlpha=.45;g.strokeStyle=CREAM;g.lineWidth=1;g.beginPath();g.arc(lefty?34:30,22,18,lefty?-.2:Math.PI+.2,lefty?.9:Math.PI-.9,lefty);g.stroke();g.globalAlpha=1}
 // ---- double the grid, keep it crisp ----
 const out=document.createElement('canvas');out.width=128;out.height=160;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(L,0,0,128,160);
 // light vignette + a rarity glint
 const vg=o.createRadialGradient(64,80,40,64,80,110);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');o.fillStyle=vg;o.fillRect(0,0,128,160);
 if(c.r>=3){o.fillStyle='rgba(255,214,90,.9)';for(const[sx,sy]of[[14,18],[108,30],[100,120]]){o.fillRect(sx,sy-3,2,8);o.fillRect(sx-3,sy,8,2)}}
 return out.toDataURL()}
