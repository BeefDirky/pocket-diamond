// ---------- state ----------
const onlineGame=()=>!!(S.online&&S.online.inGame);
const S={phase:'title',pt:0,you:'seoul',opp:'busan',mode:'arcade',half:'bot',bat:null,fld:null,orderOf:{},pIdxOf:{},pcOf:{},pRunsOf:{},pBFOf:{},myErrs:0,myK:0,wildUntil:0,inning:1,totalInn:INNINGS,outs:0,balls:0,strikes:0,runs:0,hits:0,hr:0,ks:0,
 target:0,oppLine:[],youLine:[],oppHits:0,bases:[null,null,null],order:0,pitch:null,swing:null,play:null,
 cam:{...CAM_FULL},zoom:1,camMode:'full',camV:{x:0,y:0,z:0},flame:0,umpPunch:0,camFrom:null,camTo:null,camT:0,camDur:1,cheerUntil:0,jumbo:null,presIdx:2,wave:null,fx:[],fwUntil:0,flashes:[],fidg:[],bb:null,gulls:[],nextGull:0,vendors:null};
const setPhase=p=>{S.phase=p;S.pt=0;document.body.classList.toggle('inMenu',p==='title');const sb=document.getElementById('skipBtn');if(sb&&p!=='play')sb.hidden=true};
const fldKey=()=>S.fld||S.opp,batKey=()=>S.bat||S.you;
const pitcher=()=>{const k=fldKey(),T=TEAMS[k];return(T.staff||[T.pitcher])[(S.pIdxOf&&S.pIdxOf[k])||0]};
const curBatter=()=>{const k=batKey();return TEAMS[k].lineup[(S.orderOf&&S.orderOf[k])||0]};
const myTeam=()=>S.online&&S.online.inGame?(S.online.me==='home'?S.you:S.opp):S.you;
const pitching=()=>S.mode==='full'&&S.fld===myTeam();
const myBat=()=>S.bat===myTeam();
function setSides(){if(S.half==='top'){S.bat=S.opp;S.fld=S.you}else{S.bat=S.you;S.fld=S.opp}applyDefense()}
function addRuns(n){if(!n)return;const f=fldKey();S.pRunsOf[f]=(S.pRunsOf[f]||0)+n;if(batKey()===S.you){S.runs+=n;S.youLine[S.inning-1]+=n}else{S.target+=n;S.oppLine[S.inning-1]+=n}}
const isWalkoff=()=>S.mode==='arcade'?S.runs>S.target:(S.half==='bot'&&S.inning>=(S.schedInn||9)&&S.runs>S.target);
const effHand=b=>b.hand==='S'?(pitcher().hand==='R'?'L':'R'):b.hand;
function setCam(m){S.camMode=m}
function sdamp(cur,target,vel,st,dt){const om=2/st,x=om*dt,e=1/(1+x+.48*x*x+.235*x*x*x);const ch=cur-target,tmp=(vel+om*ch)*dt;return[target+(ch+tmp)*e,(vel-om*tmp)*e]}
let VA=H/W;
// the world past the park walls: every park sits in its neighborhood (drawn at half resolution), so the camera may
// pan and zoom out past the stands. EXT is how far that neighborhood reaches beyond the park buffer on each side.
const EXT_M={mx:1100,my:900},EXT=()=>S.mode==='bp'||S.phase==='title'?{mx:0,my:0}:EXT_M;
const zFit=()=>{const e=EXT();return e.mx?Math.max(W/(W+2*e.mx),W*VA/(H+2*e.my)):Math.min(1,W*VA/H)};// widest zoom allowed
function viewWH(z){const HH=H+2*EXT().my;let vw=W/z,vh=vw*VA;if(vh>HH){vh=HH;vw=HH/VA}return[vw,vh]}
function clampCam(c){const e=EXT(),[vw,vh]=viewWH(c.z),WW=W+2*e.mx,HH=H+2*e.my;
 return{x:vw>=WW?W/2:clamp(c.x,vw/2-e.mx,W+e.mx-vw/2),y:vh>=HH?H/2:clamp(c.y,vh/2-e.my,H+e.my-vh/2),z:c.z}}
// any sideways screen (computer, tablet, phone on its side) plays full screen with the wide camera
const isLandscape=()=>innerWidth>innerHeight&&innerWidth>=640;
const isWide=()=>OPT.cam==='wide'||isLandscape();
function camTarget(){
 if(S.camMode==='follow'&&S.play){
  const play=S.play;const t=S.phase==='result'?play.end:play.t;const b=ballAt(play,t);
  // ball gone (a homer is out of the park): show the trot, and the zoom buttons still work
  if(!b)return clampCam(isWide()?{x:HX,y:H*.52,z:Math.max(zFit(),W*VA/1250*S.zoom)}:{...CAM_FULL,z:Math.max(zFit(),CAM_FULL.z*S.zoom)});
  const q=toPx(b.x,b.y),c2=toPx(0,85);const d=Math.hypot(b.x,b.y);
  const wide=isWide(),k=wide?.55:.3,cx=lerp(q.x,c2.x,k),cy=lerp(q.y,c2.y,k);
  let z=Math.max(zFit(),(wide?lerp(1.3,1,clamp(d/260,0,1)):lerp(1.8,1.25,clamp(d/320,0,1)))*S.zoom);
  // the ball is drawn lifted by its height: keep that point inside the frame (with room to spare), zooming out if needed
  const by=q.y-(b.h||0)/FT*.5,bx=q.x,dyN=Math.abs(by-cy)*(by<cy?3.1:2.6),dxN=Math.abs(bx-cx)*2.4;// extra room up top, where the line score sits
  if(dyN>0)z=Math.min(z,W*VA/dyN);if(dxN>0)z=Math.min(z,W/dxN);
  return clampCam({x:cx,y:cy,z:Math.max(zFit(),z)});
 }
 if(S.camMode==='pitch'){// wide: frame a fixed slice of the park (home plate to past second base) whatever the screen's shape
  const c=isWide()?{x:HX,y:HY-210,z:W*VA/820}:CAM_PITCH,z=Math.max(zFit(),c.z*S.zoom);let y=c.y;
  // zooming in slides the view up toward the mound (it's dead center at full zoom), keeping the batter in frame
  let zz=z;if(S.zoom>1){const k=clamp((S.zoom-1)/.35,0,1),mY=toPx(0,60.5).y,hY=toPx(0,0).y;y=lerp(c.y,mY,k);
   // never zoom so far that the batter drops out of the bottom of the frame
   const need=2*(hY+44-y);zz=Math.max(1,Math.min(z,W*VA/need))}
  // zooming out past the default drifts the view up toward the middle of the park, so the whole neighborhood comes into frame
  if(S.zoom<1){const k=clamp((1-S.zoom)/.55,0,1);y=lerp(y,H*.42,k)}
  // whatever the zoom, the batter stays in frame, clear of the controls along the bottom
  {const vh=viewWH(zz)[1];y=clamp(y,HY+34-.33*vh,HY-60+.42*vh)}
  return clampCam({x:c.x,y,z:zz})}
 return clampCam(isWide()?{x:HX,y:H*.56,z:1}:CAM_FULL);
}
function updateCam(dt){
 const tg=camTarget();
 if(reduced){S.cam={...tg};return}
 const k=Math.min(dt,50)/1000,V=S.camV;
 [S.cam.x,V.x]=sdamp(S.cam.x,tg.x,V.x,.42,k);[S.cam.y,V.y]=sdamp(S.cam.y,tg.y,V.y,.42,k);
 let lz;[lz,V.z]=sdamp(Math.log(S.cam.z),Math.log(tg.z),V.z,.6,k);S.cam.z=Math.exp(lz);
}

