/* ---------- PREVIEW: in-game players drawn in the card-art style ----------
   Off unless the page is opened with ?look=card (or localStorage pd-look=card). It swaps the on-field drawing of
   players for the card sprites (24b1-sprites.js), picking the closest card pose for what each player is doing. This is
   a first try: the cards only have 10 still poses, so runs, swings and deliveries step between them instead of animating. */
const LOOK_CARD=(()=>{try{return /[?&]look=card\b/.test(location.search)||localStorage.getItem('pd-look')==='card'}catch(e){return false}})();
const LK_SC=.72;/* drawn smaller than the card art: about the size of the current players */
if(LOOK_CARD){
 const lkSpr=(pose,T,skin,flip)=>{const t=T||UMP,sk=skin||SKINS[1],k=ORDER.find(x=>TEAMS[x]===t);
  const glv='#a0602e',bat='#d9b07a';
  const sp=spriteCanvas(pose,{k:INK,c:t.cap,C:t.brim||shade(t.cap,-.3),s:sk,S:shade(sk,-.15),w:'#f4f5f7',W:'#b8bcc4',a:t.jersey,A:shade(t.jersey,-.3),g:glv,G:shade(glv,-.35),b:bat,B:shade(bat,-.22),r:'#d24a3a'});
  return {sp,k}};
 /* one sprite at its own pixel size, feet on (X,Y), with the club's cap mark (one pixel per mark cell) */
 const LKC=new Map();
 const lkDraw=(g,X,Y,T,pose,o)=>{o=o||{};const key=pose+'|'+(T&&T.jersey)+(T&&T.cap)+'|'+(o.skin||'')+(o.flip?1:0);let c=LKC.get(key);
  if(!c){if(LKC.size>600)LKC.clear();const {sp,k}=lkSpr(pose,T,o.skin);const W=sp.c.width,H=sp.c.height;c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d');
   q.save();if(o.flip){q.translate(W,0);q.scale(-1,1)}q.drawImage(sp.c,0,0);q.restore();
   const mk=k&&CAP_MARKS[k];if(mk&&sp.cap){const cp=sp.cap,mw=Math.max(...mk.m.map(r=>r.length)),mh=mk.m.length,fr=SPRITES[pose].fr!=null?SPRITES[pose].fr:1;
    let gx=Math.round(cp.cx+fr*cp.w*.14-mw/2),gy=Math.max(cp.y+1,Math.round(cp.cy-mh/2));
    mk.m.forEach((r,j)=>{for(let i=0;i<r.length;i++){if(r[i]==='.')continue;const sx=gx+i;q.fillStyle=mk.p[r[i]];q.fillRect(o.flip?W-1-sx:sx,gy+j,1,1)}})}
   LKC.set(key,c)}
  const w=Math.round(c.width*LK_SC),h=Math.round(c.height*LK_SC),sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;
  g.fillStyle='rgba(6,18,10,.3)';g.fillRect(Math.round(X)-5,Math.round(Y),11,1);g.fillRect(Math.round(X)-4,Math.round(Y)+1,9,1);
  g.drawImage(c,Math.round(X-w/2),Math.round(Y-h+2),w,h);g.imageSmoothingEnabled=sm};
 /* which card pose fits what the player is doing */
 const lkPose=o=>{const L=o.legs||'stand',A=o.arms||'down',f=((o.frame|0)%4+4)%4;
  if(A==='bat'||A==='bunt')return L==='stride'||L==='follow'?'swing':'batUp';
  if(L==='run')return f%2?'field2':'pitchKick';
  if(A==='catch'||L==='ready'||L==='shuffle')return 'field';
  if(A==='punch'||A==='cheer')return 'batUp3';
  if(L==='kick'||L==='lift')return 'pitchKick';
  if(L==='stride'||L==='drive'||L==='follow'||L==='rock')return 'pitchThrow';
  return 'pitchSet'};
 drawPlayer=function(g,X,Y,T,o){o=o||{};lkDraw(g,X,Y-(o.legs==='run'&&(o.frame|0)%2?1:0),T,lkPose(o),o)};
 drawPitcher=function(g,X,Y,T,o,t){lkDraw(g,X,Y,T,t<.45?'pitchSet':t<.95?'pitchKick':'pitchThrow',o)};
 drawCatcher=function(g,X,Y,T,o){lkDraw(g,X,Y,T,'catch',o)};
 drawDiver=function(g,X,Y,T,o,dir,lift){lkDraw(g,X,Y-(lift||0),T,'field2',{...o,flip:dir<0})};
 drawSlider=function(g,X,Y,T,o,dir,lift){lkDraw(g,X,Y-(lift||0),T,'field',{...o,flip:dir<0})};
 drawBat=function(){}/* the card poses already hold their bats */}
