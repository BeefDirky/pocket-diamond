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

// ---------- the strike zone, from behind the plate ----------
// The live pitch comes in as a dot that grows as it nears the plate; where it crosses stays marked (red = strike,
// green = ball) with the call under it, and every earlier pitch of this at-bat stays as a small numbered dot.
const KZ_PX=17;// px per foot
function drawZone(now){const box=$('kz');
 const show=S.phase&&['choose','windup','pitch','result','play'].includes(S.phase)&&S.mode!=='bp'&&OPT.zone!==false;
 if(!show){if(!box.hidden)box.hidden=true;return}if(box.hidden)box.hidden=false;
 const c=$('kzC'),g=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,gy=H-6,X=x=>Math.round(cx+x*KZ_PX),Y=h=>Math.round(gy-h*KZ_PX);
 g.clearRect(0,0,W,H);
 // plate and zone (3x3)
 g.fillStyle='rgba(240,232,210,.9)';g.fillRect(X(-.71),gy+1,X(.71)-X(-.71),2);
 const zl=X(-ZONE.x),zr=X(ZONE.x),zt=Y(ZONE.hi),zb=Y(ZONE.lo);
 g.fillStyle='rgba(240,232,210,.07)';g.fillRect(zl,zt,zr-zl,zb-zt);
 g.fillStyle='rgba(240,232,210,.22)';for(let i=1;i<3;i++){g.fillRect(Math.round(zl+(zr-zl)*i/3),zt,1,zb-zt);g.fillRect(zl,Math.round(zt+(zb-zt)*i/3),zr-zl,1)}
 g.strokeStyle='rgba(240,232,210,.9)';g.lineWidth=1;g.strokeRect(zl+.5,zt+.5,zr-zl-1,zb-zt-1);
 const cl=v=>clamp(v,2,W-3),ch=v=>clamp(v,2,H-3);
 // earlier pitches of the at-bat
 const L=S.kz||[];g.font='5px monospace';
 L.forEach((d,i)=>{const x=cl(X(d.x)),y=ch(Y(d.y));g.fillStyle=d.z?'#ff6b5e':'#7be38a';g.globalAlpha=.5;g.fillRect(x-2,y-2,5,5);g.globalAlpha=1});
 // this pitch
 const p=S.pitch;let txt='',cls='';
 if(p&&p.plateY!=null&&p.releaseAt){const el=(S.phase==='pitch'?now-p.releaseAt:p.travel+1)*1;const u=Math.min(1,el/p.travel);
  if(u>0){const pp=pitchPos(p,Math.min(el,p.travel)),x=cl(X(pp.x)),y=ch(Y(pp.h)),r=u>=1?3:Math.max(1,Math.round(u*3));
   const fin=u>=1;g.fillStyle=fin?(p.inZone?'#ff6b5e':'#7be38a'):'#f4f1e8';g.globalAlpha=fin?1:.35+.65*u;g.fillRect(x-r,y-r,r*2+1,r*2+1);g.globalAlpha=1;
   if(fin){g.strokeStyle='#14110a';g.strokeRect(x-r+.5,y-r+.5,r*2,r*2);
    if(!p._kzLogged){p._kzLogged=true;(S.kz=S.kz||[]).push({x:p.plateX,y:p.plateY,z:!!p.inZone});if(S.kz.length>12)S.kz.shift()}
    const sw=S.swing&&!S.swing.bunt?S.swing:S.swing;txt=p.hbp?'HIT BY PITCH':sw?(sw.miss?'SWING & MISS':S.play&&S.play.foul?'FOUL':'IN PLAY'):p.inZone?'STRIKE':'BALL';cls=p.hbp||(sw&&!sw.miss)?'':p.inZone||(sw&&sw.miss)?'s':'b'}}}
 const t=$('kzT');if(t.textContent!==txt)t.textContent=txt;if(t.className!==cls)t.className=cls}
