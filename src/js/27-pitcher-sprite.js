// ---------- pitcher delivery: a fully procedural front-view sprite, posed every frame ----------
// T runs 0→1 through the windup (release at T=1) and 1→1.4 through the follow-through.
const PD={
 ty:[[0,0],[.14,-.3],[.3,-.6],[.5,-1],[.7,0],[.85,.6],[.95,1.2],[1,1.8],[1.12,3],[1.28,2.2],[1.4,.6],[1.55,0]],
 tx:[[0,0],[.3,.3],[.5,.8],[.75,-.6],[.95,-1.2],[1.12,-1.6],[1.4,-.6],[1.55,0]],
 ff:[[0,-2,0],[.14,-2,0],[.28,-1.8,-.6],[.42,-1.2,-4.5],[.55,-1.5,-4.5],[.68,-3.2,-1.8],[.78,-4.6,1.2],[1.4,-4.6,1.2],[1.55,-2,0]],
 fk:[[0,-2,-3],[.14,-2,-3],[.28,-2,-4],[.42,-1.6,-9],[.55,-2,-8.5],[.68,-3.6,-6],[.78,-4.4,-3.2],[1,-4.6,-2.6],[1.4,-4.6,-3],[1.55,-2,-3]],
 pf:[[0,2,0],[.98,2,0],[1.1,1.6,-.6],[1.22,.4,-2.6],[1.32,-.6,-1.5],[1.4,-.8,0],[1.55,2,0]],
 pk:[[0,2,-3],[.7,2.3,-2.8],[.98,2.6,-2.4],[1.1,2,-3.5],[1.22,.6,-5],[1.32,-.4,-4],[1.4,-.6,-3],[1.55,2,-3]],
 gh:[[0,-1,-8.5],[.14,-.3,-9.5],[.3,-.2,-11.5],[.5,-.3,-10.5],[.62,-3,-10.5],[.78,-6.5,-11.5],[.9,-6.8,-11],[1,-4,-9.5],[1.12,-2.2,-8],[1.4,-2.5,-8.5],[1.55,-1.5,-8.5]],
 th:[[0,.5,-8.5],[.14,.3,-9.5],[.3,.2,-11.5],[.5,.3,-10.5],[.62,3.5,-8],[.72,5.5,-6.5],[.83,6.2,-12],[.93,4.2,-17],[.975,2.2,-17.5],[1,.8,-14],[1.05,-.8,-9],[1.14,-3.2,-5],[1.25,-4.4,-3.8],[1.4,-3,-6],[1.55,1,-8.5]],
 te:[[0,2.5,-8],[.3,2.6,-10],[.5,2.6,-9.5],[.62,5,-9],[.72,6,-9],[.83,6.8,-10.5],[.93,6.4,-12.5],[.975,5,-13],[1,3.4,-12],[1.05,1.8,-10],[1.14,-.6,-8],[1.25,-1.6,-7],[1.4,0,-7.5],[1.55,2.5,-8]],
 sth:[[0,.5,-8.5],[.14,.3,-9.5],[.3,.2,-11.5],[.5,.3,-10.5],[.62,3.5,-8],[.72,5.5,-7],[.83,7.5,-8],[.93,8.5,-9.5],[.975,6.5,-10],[1,3,-10],[1.05,-1.5,-9.5],[1.14,-4.5,-7.5],[1.25,-5.5,-6],[1.4,-3,-6],[1.55,1,-8.5]],
 ste:[[0,2.5,-8],[.3,2.6,-10],[.5,2.6,-9.5],[.62,5,-9],[.72,6,-9.2],[.83,6,-10],[.93,6.6,-10.6],[.975,5.6,-10.5],[1,3,-10.5],[1.05,.5,-10],[1.14,-1.8,-9],[1.25,-2.6,-8],[1.4,0,-7.5],[1.55,2.5,-8]],
};
function kfi(tr,T){if(T<=tr[0][0])return tr[0].slice(1);for(let k=1;k<tr.length;k++)if(T<=tr[k][0]){const a=tr[k-1],b=tr[k],u=(T-a[0])/(b[0]-a[0]),e=u*u*(3-2*u);return a.slice(1).map((v,j)=>v+(b[j+1]-v)*e)}return tr[tr.length-1].slice(1)}
function drawPitcher(g,X,Y,TM,o,T){
 const x=Math.round(X),y=Math.round(Y),f=o.flip?-1:1,SC=1.2,sk=o.skin,pa=o.pants||'#eeeae0',side=o.side;
 const P=(c,dx,dy,w,h)=>{const x0=Math.round(dx*SC),x1=Math.round((dx+w)*SC),y0=Math.round(dy*SC),y1=Math.round((dy+h)*SC);g.fillStyle=c;g.fillRect(f>0?x+x0:x-x1+1,y+y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
 const seg=(a,b,c,w)=>{const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*2));for(let k=0;k<=n;k++){const px=a[0]+(b[0]-a[0])*k/n,py=a[1]+(b[1]-a[1])*k/n;P(c,px-w/2,py-w/2,w,w)}};
 const [tyv]=kfi(PD.ty,T),[txv]=kfi(PD.tx,T);const ty=tyv,tx=txv;
 const ff=kfi(PD.ff,T),fk=kfi(PD.fk,T),pf=kfi(PD.pf,T),pk=kfi(PD.pk,T);
 const gh=kfi(PD.gh,T),th=kfi(side?PD.sth:PD.th,T),te=kfi(side?PD.ste:PD.te,T);
 // shadow follows the feet
 g.fillStyle='rgba(6,18,10,.3)';const sx=Math.round((ff[0]+pf[0])/2*SC);g.fillRect(x+f*sx-6,y,13,1);g.fillRect(x+f*sx-5,y+1,11,1);
 const hipF=[-1.8+tx*.8,-6+ty*.7],hipP=[1.8+tx*.8,-6+ty*.7];
 // pivot leg (behind), then front leg
 seg(hipP,pk,pa,2);seg(pk,pf,pa,1.8);P(SHOE,pf[0]-1,pf[1]-1,3,1);
 seg(hipF,fk,pa,2);seg(fk,ff,pa,1.8);P(SHOE,ff[0]-1.5,ff[1]-1,3,1);
 // torso
 const R=(c,dx,dy,w,h)=>P(c,dx+tx,dy+ty,w,h);
 R(TM.jersey,-3,-12,7,1);R(TM.jersey,-4,-11,9,1);R(TM.jersey,-3,-10,7,2);R(TM.jersey,-2,-8,5,1);R(BELT,-2,-7,5,1);R('#d9c27a',0,-7,1,1);
 R(TM.cap,-1,-10,2,2);R(TM.cap,-1,-12,3,1);R(TM.cap,-4,-11,1,1);R(TM.cap,4,-11,1,1);
 // head dips through the release
 const hb=T>1.02&&T<1.32?Math.sin((T-1.02)/.3*Math.PI)*.9:0,H=(c,dx,dy,w,h)=>P(c,dx+tx*1.1,dy+ty+hb,w,h);
 H(sk,-1,-13,3,1);H(sk,-2,-16,5,3);H(INK,-1,-15,1,1);H(INK,1,-15,1,1);
 H(TM.cap,-1,-19,3,1);H(TM.cap,-2,-18,5,2);H(TM.brim,-2,-16,6,1);H(TM.jersey,0,-19,1,1);
 // glove arm
 const sG=[-3.5+tx,-11+ty],hG=[gh[0]+tx,gh[1]+ty],eG=[(sG[0]+hG[0])/2-1.1,(sG[1]+hG[1])/2+.5];
 seg(sG,eG,TM.jersey,1.5);seg(eG,hG,sk,1.2);P(GLOVE,hG[0]-1,hG[1]-1,2.2,2.2);
 // throwing arm: sleeve to the elbow, forearm, hand (ball until release)
 const sT=[3.5+tx,-11+ty],eT=[te[0]+tx,te[1]+ty],hT=[th[0]+tx,th[1]+ty];
 seg(sT,eT,TM.jersey,1.6);seg(eT,hT,sk,1.3);P(sk,hT[0]-.6,hT[1]-.6,1.3,1.3);
 if(T<.99)P('#ffffff',hT[0]-.5,hT[1]-1.4,1.1,1.1);
 // a quick motion smear behind the hand at the whip
 if(T>.95&&T<1.1){const tp=kfi(side?PD.sth:PD.th,T-.04);g.globalAlpha=.35;seg([tp[0]+tx,tp[1]+ty],hT,'#f4f1e8',.8);g.globalAlpha=1}
}
function armPath(u,side){const P=side?ARM_SIDE:ARM_OVER;u=clamp(u,0,1);let k=0;while(k<P.length-2&&u>P[k+1][0])k++;const a=P[k],b=P[k+1],f=ease(clamp((u-a[0])/(b[0]-a[0]),0,1));return{x:lerp(a[1],b[1],f),y:lerp(a[2],b[2],f)}}
function gloveAt(u){return u<.55?{x:lerp(-6,-8,u/.55),y:lerp(-11,-13,u/.55)}:u<.8?{x:lerp(-8,-5,(u-.55)/.25),y:lerp(-13,-9,(u-.55)/.25)}:{x:-5,y:-9}}
function drawPlayerRaw(g,X,Y,T,o){
 o=o||{};const x=Math.round(X),y=Math.round(Y);
 const sk=o.skin||SKINS[1],pa=o.pants||'#eeeae0',f=o.flip?-1:1,fr=(((o.frame|0)%4)+4)%4;
 const legs=o.legs||'stand',arms=o.arms||'down';
 let u=0;if(legs==='shuffle')u=(fr===2?0:1);if(legs==='ready'||legs==='stride'||legs==='drive'||legs==='follow')u=1;if(legs==='run'&&(fr===1||fr===3))u=-1;
 const SC=o.sc||1.2,sc=v=>Math.round(v*SC);
 const R=(c,dx,dy,w,h,up)=>{g.fillStyle=c;const yy=dy+(up?u:0),x0=sc(dx),x1=sc(dx+w),y0=sc(yy),y1=sc(yy+h);g.fillRect(f>0?x+x0:x-x1+1,y+y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
 g.fillStyle='rgba(6,18,10,.3)';g.fillRect(x-5,y,11,1);g.fillRect(x-4,y+1,9,1);
 // legs
 if(legs==='stand'){R(pa,-3,-6,2,5);R(pa,1,-6,2,5);R(T.cap,-3,-2,2,1);R(T.cap,1,-2,2,1);R(SHOE,-3,-1,3,1);R(SHOE,1,-1,3,1)}
 else if(legs==='shuffle'){/* a lead-off side step: feet wide, the trail foot closes in, together, then out again */const w=[3,2,1,2][fr];
  R(pa,-1-w,-5,2,4);R(pa,w-1,-5,2,4);R(T.cap,-1-w,-2,2,1);R(T.cap,w-1,-2,2,1);R(SHOE,-2-w,-1,3,1);R(SHOE,w-1,-1,3,1)}
 else if(legs==='ready'){R(pa,-4,-5,2,4);R(pa,2,-5,2,4);R(T.cap,-4,-2,2,1);R(T.cap,2,-2,2,1);R(SHOE,-5,-1,3,1);R(SHOE,2,-1,3,1)}
 else if(legs==='kick'){R(pa,1,-6,2,5);R(SHOE,1,-1,3,1);R(pa,-4,-9,4,2);R(pa,-4,-7,2,3);R(SHOE,-5,-5,3,1)}
 else if(legs==='stride'){R(pa,-5,-5,2,4);R(SHOE,-6,-1,3,1);R(pa,2,-5,2,4);R(SHOE,3,-1,2,1)}
 else if(legs==='rock'){R(pa,1,-6,2,5);R(SHOE,1,-1,3,1);R(pa,-5,-5,2,4);R(SHOE,-6,-1,3,1)}
 else if(legs==='lift'){R(pa,1,-6,2,5);R(SHOE,1,-1,3,1);R(pa,-3,-7,2,3);R(pa,-4,-5,2,2);R(SHOE,-5,-4,3,1)}
 else if(legs==='drive'){R(pa,1,-5,2,4);R(SHOE,1,-1,3,1);R(pa,-4,-5,3,2);R(pa,-6,-4,2,2);R(SHOE,-8,-3,3,1)}
 else if(legs==='follow'){R(pa,-5,-5,2,4);R(SHOE,-6,-1,3,1);R(pa,2,-5,2,2);R(pa,3,-4,2,2);R(SHOE,4,-3,3,1)}
 else if(legs==='run'){
  if(fr===0){R(pa,-3,-6,2,3);R(pa,-4,-4,2,1);R(SHOE,-5,-3,3,1);R(pa,1,-6,2,4);R(pa,2,-3,2,2);R(SHOE,2,-1,3,1)}
  else if(fr===2){R(pa,1,-6,2,3);R(pa,2,-4,2,1);R(SHOE,2,-3,3,1);R(pa,-3,-6,2,4);R(pa,-4,-3,2,2);R(SHOE,-5,-1,3,1)}
  else{R(pa,-2,-7,2,6);R(pa,0,-7,2,5);R(SHOE,-2,-1,3,1);R(SHOE,0,-2,2,1)}
 }
 // torso
 R(T.jersey,-3,-12,7,1,1);R(T.jersey,-4,-11,9,1,1);R(T.jersey,-3,-10,7,2,1);R(T.jersey,-2,-8,5,1,1);R(BELT,-2,-7,5,1,1);R('#d9c27a',0,-7,1,1,1);R(T.cap,-1,-10,2,2,1);R(T.cap,-1,-12,3,1,1);R(T.cap,-4,-11,1,1,1);R(T.cap,4,-11,1,1,1);
 // head: neck, face, eyes
 if(o.back){R(sk,-1,-13,3,1,1);R('#2a2018',-2,-16,5,3,1);R(sk,-3,-15,1,1,1);R(sk,3,-15,1,1,1)}
 else{R(sk,-1,-13,3,1,1);R(sk,-2,-16,5,3,1);R(INK,-1,-15,1,1,1);R(INK,1,-15,1,1,1)}
 if(o.helmet){R(T.cap,-1,-19,3,1,1);R(T.cap,-2,-18,5,2,1);R(T.cap,-2,-16,5,1,1);R(T.brim,3,-17,1,3,1);R(T.brim,-2,-15,1,1,1);R('rgba(255,255,255,.45)',0,-19,1,1,1)}
 else if(o.back){R(T.cap,-1,-19,3,1,1);R(T.cap,-2,-18,5,2,1)}
 else{R(T.cap,-1,-19,3,1,1);R(T.cap,-2,-18,5,2,1);R(T.brim,-2,-16,6,1,1);R(T.jersey,0,-19,1,1,1)}
 // arms
 switch(arms){
  case'down':R(sk,-4,-10,1,3,1);R(sk,4,-10,1,3,1);if(o.glove)R(GLOVE,-5,-8,2,2,1);break;
  case'run':if(fr<2){R(sk,-5,-11,1,3,1);R(sk,4,-9,1,3,1);if(o.glove)R(GLOVE,-6,-12,2,2,1)}else{R(sk,-4,-9,1,3,1);R(sk,5,-11,1,3,1);if(o.glove)R(GLOVE,-5,-7,2,2,1)}break;
  case'ready':R(sk,-3,-9,1,2,1);R(sk,3,-9,1,2,1);if(o.glove)R(GLOVE,-3,-8,2,2,1);break;
  case'catch':R(sk,-4,-15,1,4,1);R(sk,4,-15,1,4,1);if(o.glove)R(GLOVE,-5,-17,2,2,1);break;
  case'throw':R(sk,4,-16,1,5,1);R('#ffffff',4,-17,1,1,1);R(sk,-5,-11,1,2,1);if(o.glove)R(GLOVE,-7,-12,2,2,1);break;
  case'cockside':R(sk,4,-11,5,1,1);R(sk,9,-12,1,2,1);R(sk,-5,-11,1,2,1);R(GLOVE,-7,-12,2,2,1);break;
  case'relside':R(sk,-4,-10,8,1,1);R(sk,-5,-11,1,2,1);R(GLOVE,-6,-9,2,2,1);break;
  case'hoist':R(sk,-2,-20,1,4,1);R(sk,2,-20,1,4,1);R(GLOVE,-1,-22,3,3,1);break;
  case'set':R(sk,-2,-10,1,2,1);R(sk,2,-10,1,2,1);R(GLOVE,-1,-11,3,2,1);break;
  case'cock':R(sk,4,-16,1,5,1);R(sk,5,-17,1,1,1);R(sk,-5,-11,1,2,1);R(GLOVE,-7,-12,2,2,1);break;
  case'release':R(sk,3,-15,1,4,1);R(sk,2,-18,1,3,1);R(sk,-4,-11,1,2,1);R(GLOVE,-5,-10,2,2,1);break;
  case'break':R(GLOVE,-7,-12,2,2,1);R(sk,-5,-11,2,1,1);R(sk,4,-10,1,3,1);R(sk,5,-7,1,1,1);R('#ffffff',5,-6,1,1,1);break;
  case'follow':R(sk,2,-10,2,1,1);R(sk,0,-9,2,1,1);R(sk,-2,-8,2,1,1);R(sk,-3,-7,1,1,1);R(GLOVE,-3,-12,2,2,1);break;
  case'bat':R(sk,-3,-10,1,2,1);R(sk,3,-10,1,2,1);R(sk,1,-10,2,1,1);break;
  case'bunt':R(sk,-3,-10,1,2,1);R(sk,3,-10,1,2,1);R(sk,-2,-11,5,1,1);break;
  case'punch':R(sk,-4,-10,1,3,1);R(sk,4,-16,1,5,1);break;case'cheer':R(sk,-4,-16,1,5,1);R(sk,4,-16,1,5,1);break;
  case'proc':{ // throwing arm drawn every frame from a continuous path (shoulder → elbow → hand)
   const A=o.arm||{x:0,y:3},sx=4,sy=-11,gl=o.gloveAt||{x:-6,y:-11};
   R(sk,gl.x+1,gl.y+1,1,2,1);R(GLOVE,gl.x-1,gl.y,2,2,1);
   const L=Math.hypot(A.x,A.y)||1,ex=sx+A.x*.5+(-A.y/L)*1.4,ey=sy+A.y*.5+(A.x/L)*1.4;
   const seg=(x0,y0,x1,y1,c)=>{const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)*1.4));for(let k=0;k<=n;k++)R(c,x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,1,1,1)};
   seg(sx,sy,ex,ey,T.jersey);seg(ex,ey,sx+A.x,sy+A.y,sk);
   if(o.ball)R('#ffffff',sx+A.x,sy+A.y-1,1,1,1);
   break}
 }
}
/* every player sprite is ~50 little rectangles; paint each distinct pose once into a small canvas and stamp it after that */
const PSPR=new Map();
function drawPlayer(g,X,Y,T,o){o=o||{};const m=g.getTransform();
 if(m.a!==1||m.d!==1||m.b||m.c||(m.e%1)||(m.f%1))return drawPlayerRaw(g,X,Y,T,o);
 const key=T.jersey+T.cap+T.brim+'|'+o.skin+o.pants+(o.flip?1:0)+(o.frame|0)%4+o.legs+o.arms+(o.sc||1.2)+'|'+(o.back==null?'':o.back)+(o.helmet?1:0)+(o.glove==null?'':JSON.stringify(o.glove))+(o.arm?Math.round(o.arm.x*4)+','+Math.round(o.arm.y*4):'')+(o.gloveAt?Math.round(o.gloveAt.x*4)+','+Math.round(o.gloveAt.y*4):'')+(o.ball?1:0);
 let c=PSPR.get(key);
 if(!c){if(PSPR.size>900)PSPR.clear();c=document.createElement('canvas');c.width=80;c.height=88;drawPlayerRaw(c.getContext('2d'),40,68,T,o);PSPR.set(key,c)}
 g.drawImage(c,Math.round(X)-40,Math.round(Y)-68)}
function drawDiver(g,X,Y,T,o,dir,lift){if(o.noGlove)return drawSlider(g,X,Y,T,o,dir,lift);
 const x=Math.round(X),y=Math.round(Y),sk=o.skin,pa=o.pants,yy=y-Math.round(lift);
 const sc=v=>Math.round(v*1.2);const R=(c,dx,dy,w,h)=>{g.fillStyle=c;const x0=sc(dx),x1=sc(dx+w),y0=sc(dy),y1=sc(dy+h);g.fillRect(dir>0?x+x0:x-x1+1,yy+y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
 g.fillStyle='rgba(6,18,10,.3)';g.fillRect(x-9,y,19,2);
 R(SHOE,-11,-5,2,2);R(pa,-9,-5,5,3);R(BELT,-4,-5,1,3);R(T.jersey,-3,-6,8,4);R(T.cap,-1,-5,2,2);
 R(sk,5,-7,3,3);R(T.cap,5,-8,3,1);R(T.brim,8,-8,1,1);R(sk,8,-6,3,1);R(GLOVE,11,-7,2,3);R(sk,0,-2,3,1);
}
// a baserunner on the ground: helmet, arms out (headfirst) or legs leading (feet first)
function drawSlider(g,X,Y,T,o,dir,lift){
 const x=Math.round(X),y=Math.round(Y),sk=o.skin,pa=o.pants,yy=y-Math.round(lift||0);
 const sc=v=>Math.round(v*1.2);const R=(c,dx,dy,w,h)=>{g.fillStyle=c;const x0=sc(dx),x1=sc(dx+w),y0=sc(dy),y1=sc(dy+h);g.fillRect(dir>0?x+x0:x-x1+1,yy+y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
 g.fillStyle='rgba(6,18,10,.3)';g.fillRect(x-9,y,19,2);
 if(o.trans===1&&!o.head){// dropping into it: still half up, leaning back, the lead leg kicking out ahead
  R(T.cap,-4,-17,4,4);R(T.brim,-5,-15,1,2);R(sk,-3,-14,2,2);R(T.jersey,-4,-12,6,6);R(BELT,0,-9,1,3);R(sk,-6,-10,2,2);
  R(pa,0,-7,4,3);R(pa,4,-6,3,2);R('#f1ecdc',7,-6,1,2);R(SHOE,8,-7,2,3);R(pa,-1,-5,3,3);R(pa,-2,-3,2,2);R(SHOE,-3,-1,3,1);return}
 if(o.trans===2&&!o.head){// almost down: hips just off the dirt, the trailing hand reaching for the ground
  R(sk,-10,-5,2,2);R(T.cap,-8,-14,4,4);R(T.brim,-9,-12,1,2);R(sk,-7,-11,2,2);R(T.jersey,-6,-11,6,5);R(T.jersey,-8,-8,3,2);R(BELT,-1,-8,1,4);
  R(pa,0,-8,5,3);R(pa,5,-7,4,2);R('#f1ecdc',9,-7,2,2);R(SHOE,11,-8,2,3);R(pa,0,-5,4,2);R(pa,3,-4,2,2);R(SHOE,4,-3,2,1);return}
 if(o.trans===1&&o.head){// launching: body pitched forward, arms reaching, back leg pushing off
  R(SHOE,-8,-2,3,1);R(pa,-6,-5,2,4);R(pa,-4,-8,3,3);R(BELT,-1,-9,1,3);R(T.jersey,-1,-12,6,5);R(T.cap,4,-15,4,4);R(T.brim,8,-13,1,2);R(sk,5,-12,2,2);R(sk,7,-11,3,1);R(sk,6,-9,3,1);return}
 if(o.trans===2&&o.head){// flying flat, just off the ground
  R(SHOE,-11,-7,2,2);R(pa,-9,-7,5,3);R(BELT,-4,-7,1,3);R(T.jersey,-3,-8,8,4);R(T.cap,5,-10,4,4);R(T.brim,9,-8,1,2);R(sk,6,-7,2,2);R(sk,9,-6,3,1);R(sk,9,-9,2,1);return}
 if(o.head){R(SHOE,-11,-5,2,2);R(pa,-9,-5,5,3);R(BELT,-4,-5,1,3);R(T.jersey,-3,-6,8,4);R(T.cap,5,-8,4,4);R(T.brim,9,-6,1,2);R(sk,6,-5,2,2);R(sk,9,-4,3,1);R(sk,9,-7,2,1)}
 else{// feet first: leaning back on one hand, lead leg out straight at the bag with the spikes up, the other tucked under
  R(sk,-11,-3,2,2);// trailing hand on the dirt
  R(T.cap,-10,-11,4,4);R(T.brim,-11,-9,1,2);R(sk,-9,-8,2,2);// helmet and face, looking at the bag
  R(T.jersey,-8,-9,6,5);R(T.jersey,-10,-6,3,2);R(BELT,-2,-7,1,4);
  R(pa,-1,-7,6,3);R(pa,5,-6,5,2);R('#f1ecdc',10,-6,2,2);R(SHOE,12,-7,2,3);// lead leg: pants, sock, spikes up
  R(pa,0,-4,4,2);R(pa,3,-3,2,2);R('#f1ecdc',4,-2,2,1);R(SHOE,5,-2,2,1)}// the bent leg tucked under
}
function drawCatcher(g,X,Y,T,o){
 const x=Math.round(X),y=Math.round(Y),sk=o.skin,pa=o.pants;
 const sc=v=>Math.round(v*1.2);const R=(c,dx,dy,w,h)=>{g.fillStyle=c;const x0=sc(dx),x1=sc(dx+w),y0=sc(dy),y1=sc(dy+h);g.fillRect(x+x0,y+y0,Math.max(1,x1-x0),Math.max(1,y1-y0))};
 g.fillStyle='rgba(6,18,10,.3)';g.fillRect(x-5,y,11,1);g.fillRect(x-4,y+1,9,1);
 R(pa,-5,-5,3,4);R(pa,2,-5,3,4);R(GEAR,-5,-3,2,2);R(GEAR,3,-3,2,2);R(SHOE,-6,-1,3,1);R(SHOE,3,-1,3,1);
 R(T.jersey,-4,-10,9,2);R(GEAR,-3,-9,7,4);R(T.jersey,-4,-8,1,3);R(T.jersey,4,-8,1,3);
 R(sk,-1,-11,3,1);R(T.cap,-2,-14,5,3);R(GEAR,-2,-13,5,1);R('rgba(255,255,255,.35)',-1,-14,1,1);
 R(T.cap,-1,-15,3,1);
 if(o.reach){const rx=o.reach.x,ry=o.reach.y,n=Math.max(2,Math.ceil(Math.hypot(rx+2,ry+9)*1.2));for(let k=0;k<=n;k++)R(sk,-2+(rx+2)*k/n,-9+(ry+9)*k/n,1,1);// the arm out to the mitt
  R('#2a1a10',rx-2,ry-2,4,4);R(GLOVE,rx-1.5,ry-1.5,3,3);R('#c8935a',rx-1.5,ry-1.5,3,.8);if(o.held)R('#ffffff',rx-.5,ry-.5,1,1)}
 else if(o.target){R(sk,-1,-8,1,1);R(GLOVE,-2,-11,3,3)}else R(GLOVE,-6,-7,2,2);
}
function drawBat(g,bx,by,ang,hand,col,ls){
 // a tapered bat from the hands out: knob and dark grip, then the barrel thickening toward the end, with a light edge.
 // ls (0..1) shortens the whole bat when it's standing up toward the camera.
 col=col||'#d9b07a';ls=ls==null?1:ls;
 const hx=bx+(hand==='R'?1:-1)*2,hy=by-12,L=Math.max(5,Math.round(15*ls)),cx=Math.cos(ang),cy=Math.sin(ang)*.8,lite=shade(col,.35),dark=shade(col,-.3);
 g.fillStyle='#2b2420';g.fillRect(Math.round(hx-cx),Math.round(hy-cy),1,1);// knob
 for(let k=0;k<=L;k++){const xx=Math.round(hx+cx*k),yy=Math.round(hy+cy*k),f=k/L;
  if(f<.27){g.fillStyle='#2b2420';g.fillRect(xx,yy,1,1);continue}
  g.fillStyle=col;g.fillRect(xx,yy,1,1);
  if(f>.5){g.fillStyle=dark;g.fillRect(xx,yy+1,1,1)}
  if(f>.68){g.fillStyle=col;g.fillRect(xx+(cx>0?0:1)*0,yy-1,1,1);g.fillStyle=lite;g.fillRect(xx,yy-1,1,1)}}
}
function drawBatFree(g,cx,cy,ang,col,ls){
 ls=ls==null?1:ls;for(let k=-7;k<=7;k++){const kk=k*ls,xx=Math.round(cx+Math.cos(ang)*kk),yy=Math.round(cy+Math.sin(ang)*kk*.8);g.fillStyle=k<-4?'#2b2420':col;g.fillRect(xx,yy,1,1);if(k>0)g.fillRect(xx,yy+1,1,1)}
}

