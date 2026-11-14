// ---------- batting practice ball cam: a little zoomed-in camera in the top-right corner that rides along with the
// last ball you hit, then holds on where it came down (with the distance) for a few seconds ----------
function bcPos(pl,tt){let seg=null;for(const sg of pl.segs)if(tt>=sg.t0&&tt<=sg.t1){seg=sg;break}
 if(!seg)for(const sg of pl.segs)if(sg.t1<=tt&&(!seg||sg.t1>=seg.t1))seg=sg;return seg?seg.fn(Math.min(tt,seg.t1)):null}
// In games (arcade, full, online) it rides along with every ball put in play, on the play's own clock, and holds on
// where it ended up for a moment after the play is over.
function drawBallCam(now){const box=$('ballCam'),bp=S.mode==='bp',cam=bp?S.bpCam:S.gCam;
 if(!cam||S.phase==='title'||S.paused||OPT.ballCam===false){if(!box.hidden)box.hidden=true;if(!bp)S.gCam=null;return}
 const pl=cam.pl;let tt,done,end=bp?pl.fullEnd:pl.end;
 if(bp){tt=(now-cam.at)/1000*SPEED;done=tt>=end;if(now-cam.at>end/SPEED*1000+(OPT.bpWait?BP_CAM_HOLD:2600)){box.hidden=true;return}}// it holds on the landing spot, then tucks away
 else{/* in a game it stops the moment a fielder has the ball (or it lands out of play), then tucks away soon after */
  if(cam.fieldT==null){cam.fieldT=end;for(const sg of pl.segs)if(sg.hold!=null||sg.thr){cam.fieldT=Math.min(cam.fieldT,sg.t0);break}}
  end=cam.fieldT;const cur=S.play===pl&&S.phase==='play'?pl.t||0:Infinity;done=cur>=end;tt=Math.min(cur,end);
  if(done&&!cam.doneAt)cam.doneAt=now;if(cam.doneAt&&now-cam.doneAt>1100){box.hidden=true;S.gCam=null;return}}
 const p=bcPos(pl,Math.min(tt,end));if(!p)return;
 if(box.hidden){box.hidden=false;bcPlace(box)}
 const cv=$('ballCamCv'),dpr=Math.min(devicePixelRatio||1,2),cw=Math.round(cv.clientWidth*dpr),ch=Math.round(cv.clientHeight*dpr);if(!cw||!ch)return;
 if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}
 const q=toPx(p.x,p.y),lift=(p.h||0)/FT,tx=q.x-lift*.2,ty=q.y-lift*.5;
 if(cam.cx==null){cam.cx=tx;cam.cy=ty}cam.cx+=(tx-cam.cx)*.3;cam.cy+=(ty-cam.cy)*.3;
 const VW=170,VH=VW*ch/cw,s=cw/VW,x0=cam.cx-VW/2,y0=cam.cy-VH/2,g=cv.getContext('2d'),e=EXT_M;
 g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.fillStyle='#1b232a';g.fillRect(0,0,cw,ch);
 const O=outsideFor();if(O)g.drawImage(O,(x0+e.mx)/2,(y0+e.my)/2,VW/2,VH/2,0,0,cw,ch);
 g.save();if(PARK_OUTLINE){g.beginPath();PARK_OUTLINE.forEach((pt,i)=>g[i?'lineTo':'moveTo']((pt.x-x0)*s,(pt.y-y0)*s));g.closePath();g.clip()}
 const ix0=Math.max(0,x0),iy0=Math.max(0,y0),ix1=Math.min(W,x0+VW),iy1=Math.min(H,y0+VH);
 if(ix1>ix0&&iy1>iy0)g.drawImage(wb,ix0,iy0,ix1-ix0,iy1-iy0,(ix0-x0)*s,(iy0-y0)*s,(ix1-ix0)*s,(iy1-iy0)*s);
 g.restore();
 // the ball on top (a homer leaves the park buffer, so the cam draws it itself)
 g.save();g.scale(s,s);g.translate(-x0,-y0);drawBall(g,q.x,q.y,p.h||0);g.restore();
 const r=pl.res||{},live=Math.round(Math.hypot(p.x,p.y-2));
 $('ballCamTxt').textContent=done?`${r.hr?'HOME RUN · ':r.code==='FOUL'?'FOUL · ':''}${r.dist||live} FT`:`${live} FT`;
 box.classList.toggle('hr',!!(done&&r.hr))}
// in a game the scoreboard can sit in the same corner: drop the cam just below it when they'd overlap
function bcPlace(box){box.style.top='';box.classList.toggle('inGame',S.mode!=='bp');if(S.mode==='bp'||!document.querySelector('.app.deskApp'))return;/* (on a phone it sits on the left, under the pause button) */const par=box.offsetParent;if(!par)return;
 for(let k=0;k<3;k++){const a=box.getBoundingClientRect();let low=0;
  for(const bd of document.querySelectorAll('.bug,.pcBox')){const b=bd.getBoundingClientRect();if(b.width&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)low=Math.max(low,b.bottom)}
  if(!low)return;box.style.top=`${Math.round(low-par.getBoundingClientRect().top+6)}px`}}
