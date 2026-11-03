// ---------- batting practice: the ball just flies, lands and rolls; nobody fields it ----------
function buildBP(P,dir,b){const C={x:0,y:2},play=newPlay(),fair=Math.abs(P.s)<=45,fd=fenceDist(clamp(P.s,-45,45));let D=0,T=0,code,desc;
 if(P.L<10){const vf=.72*(1-Math.max(0,-P.L)/75),v0=P.EV*1.467*vf,A=15,ts=v0/A,dmax=fair?fd-10:150;
  const gpos=t=>{const tt=Math.min(t,ts);const d=Math.min(v0*tt-.5*A*tt*tt,dmax);return{x:C.x+dir.x*d,y:C.y+dir.y*d,h:Math.abs(Math.sin(t*8))*3*Math.max(0,1-t/ts)}};
  const tE=Math.min(ts,4.2);play.segs.push(fnSeg(0,tE,gpos));const g=gpos(tE);D=Math.hypot(g.x,g.y);code=fair?'GB':'FOUL';
  if(fair&&v0*ts-.5*A*ts*ts>=dmax){const tw=(v0-Math.sqrt(Math.max(0,v0*v0-2*A*dmax)))/A;play.fenceAt=Math.min(tw,tE)}
 }else{const Lr=P.L*RAD;D=Math.max(30,Math.min(475,(P.EV-40)*5.9*(.82+b.pow*.0035)*Math.pow(Math.sin(2*Lr),P.L>45?1:.6)));
  const need=b.pow>=85?.62:b.pow>=72?.7:.78;if(fair&&(b.pow<60||P.q<need)&&D>fd-8)D=fd-8-rand(0,22);
  const vy=P.EV*1.467*Math.sin(Lr);T=Math.max(.7,vy/16*.82);const Hh=Math.max(8,vy*vy/64*.55),land={x:dir.x*D,y:dir.y*D};
  if(fair&&D>fd){play.segs.push(airSeg(0,T,C,land,Hh));play.ballGone=T;code='HR';play.clang=clangFor(D,fd,P.s,T,true)}
  else{const Tr=1.3,room=fair?Math.max(0,fd-8-D):30,vr=Math.min(42,P.EV*.28),rp=t=>{const tau=clamp(t-T,0,Tr);const d=Math.min(vr*tau-.5*(vr/Tr)*tau*tau,room);return{x:land.x+dir.x*d,y:land.y+dir.y*d,h:Math.abs(Math.sin(tau*7))*4*Math.max(0,1-tau/Tr)}};
   play.segs.push(airSeg(0,T,C,land,Hh),fnSeg(T,T+Tr,rp));if(fair)play.clang=clangFor(D,fd,P.s,T,false);if(fair&&vr*Tr*.5>=room&&room<30&&!play.clang)play.fenceAt=T+Math.min(Tr,room/Math.max(1,vr*.6));code=!fair?'FOUL':P.L>50?'POP':P.L<22?'LD':'FB'}}
 const nm={HR:'HOME RUN!',FOUL:'FOUL BALL',GB:'GROUND BALL',LD:'LINE DRIVE',FB:'FLY BALL',POP:'POP-UP'}[code];
 let e=0;for(const sg of play.segs)e=Math.max(e,sg.t1);play.end=Math.min(e,5.5)+.5;play.runners=[];play.bp=true;
 if(code==='HR'){play.watch=T;play.flip=pick(FLIPS)}
 play.res={code,bp:true,hr:code==='HR',hit:code!=='FOUL'&&code!=='POP',outs:0,runs:0,newBases:[null,null,null],banner:nm,tone:code==='HR'?'hr':code==='FOUL'?'':'hit',
  sub:`${Math.round(P.EV)} mph off the bat · ${Math.round(D)} ft`,desc:`${nm.replace('!','').toLowerCase().replace(/^./,c=>c.toUpperCase())}, ${Math.round(D)} ft, ${Math.round(P.EV)} mph EV (${S.pitch?S.pitch.name.toLowerCase():''})`,dist:Math.round(D)};
 return play}
function buildFoul(P,dir){
 const play=newPlay();play.foul=true;const C={x:0,y:2};
 if(P.L<10){
  const D=rand(50,110),T=.9,end={x:dir.x*D,y:dir.y*D+2};
  play.segs.push(fnSeg(0,T,t=>{const u=t/T,e=1-(1-u)*(1-u);return{x:lerp(C.x,end.x,e),y:lerp(C.y,end.y,e),h:0}}));
 }else{
  const D=clamp((P.EV-40)*5*Math.pow(Math.sin(2*clamp(P.L,10,80)*RAD),.6),60,280);
  const T=clamp(P.EV*1.467*Math.sin(P.L*RAD)/16*.8,.8,2.6);
  play.segs.push(airSeg(0,T,C,{x:dir.x*D,y:dir.y*D},Math.max(10,D*.25)));play.ballGone=T;
 }
 finalize(play,[],{code:'FOUL',runs:0,outs:0});
 play.end=play.segs[0].t1+.2;return play;
}
function hitAdvance(runners,tp,Pp,delay,ex){
 const ballAt=k=>{const d=dist(Pp,baseP(k));return tp+.7+(ex||0)+d/(THROW*(d>200?.86:1))};
 let cap=4;
 for(const r of runners){
  r.start=r.batter?.65:r.L0!=null?0:delay;r.speed=spdFt(r.who);
  let d=r.from;const minD=r.batter?1:r.from;
  while(d+1<=cap){const arr=r.start+(d+1-r.from-(r.L0||0))*LEG/r.speed;if(d+1<=minD||arr+.3<ballAt(d+1))d++;else break}
  r.dest=d;cap=d===4?4:d-1;
 }
 let trail=null;
 for(let k=runners.length-1;k>=0;k--){const r=runners[k];
  if(r.batter)r.dest=Math.max(1,r.dest);
  else if(trail!==null&&r.dest<=trail&&r.dest<4)r.dest=Math.min(4,trail+1);
  trail=r.dest;
 }
}
function outfieldHit(play,it,P,runners,delay,errBy){
 // retrieval time: an outfielder who had to run it down, dig it off the wall or chase a carom in the corner needs longer to get rid of it
 const ex=it.i>=6?((dist(POS[it.i],it.p)>55?1.05:.3)+(Math.hypot(it.p.x,it.p.y)>285?.75:0)+(P.line?.9:0)):0;
 hitAdvance(runners,it.t,it.p,delay,ex);
 const bd=runners.find(r=>r.batter).dest;runners.find(r=>r.batter).round=true;
 // on a single, the runner from second tries to score on speed: 70+ scores, 50-69 is a play at the plate, under 50 holds at third
 let sendHome=null;
 if(bd===1&&errBy==null){const r2=runners.find(r=>r.from===2&&!r.batter);if(r2&&r2.dest===3&&(r2.who.spd||60)>=50){r2.dest=4;sendHome=r2;
  const sp=r2.who.spd||60;if(sp<70){r2.closeHome=true;if(Math.random()<.2+(70-sp)*.02)r2.out=true}}}
 const tgt=sendHome?4:bd>=3?4:bd+1,tb=baseP(tgt);
 const t0=it.t+.65+ex;
 const cov=tgt===4?1:tgt===3?4:(it.p.x<0?3:5);
 let tArr;
 if(it.i>=6&&Math.hypot(it.p.x,it.p.y)>200){
  // deep hit: the outfielder hits the cutoff man, who turns and relays to the base
  const cut=it.p.x<0?5:3,Cc={x:lerp(tb.x,it.p.x,.45),y:lerp(tb.y,it.p.y,.45)},o=fromF(play,it.i,t0),t1=t0+dist(o,Cc)/THROW;
  play.fk[cut]=cover(cut,Cc,t1);
  play.segs.push(holdSeg(play,it.t,t0,it.i),throwSeg(t0,o,Cc),holdSeg(play,t1,t1+.32,cut),throwSeg(t1+.32,Cc,tb));
  tArr=t1+.32+dist(Cc,tb)/THROW;
 }else{play.segs.push(holdSeg(play,it.t,t0,it.i),throwSeg(t0,fromF(play,it.i,t0),tb));tArr=t0+dist(it.p,tb)/THROW}
 if(cov!==it.i&&!play.fk[cov])play.fk[cov]=cover(cov,tb,tArr);
 if(sendHome){const r2=sendHome,tR=r2.start+2*LEG/r2.speed;
  if(r2.out){if(tR<tArr+.12)r2.speed=2*LEG/Math.max(.5,tArr+.15-r2.start);r2.outAt=tArr+.05}
  else if(tR>tArr-.1)r2.speed=2*LEG/Math.max(.5,tArr-(r2.closeHome?.1:.4)-r2.start)}
 let bu=null,bdist=1e9;for(const i of[6,7,8])if(i!==it.i&&!play.fk[i]){const dd=dist(POS[i],it.p);if(dd<bdist){bdist=dd;bu=i}}
 if(bu!==null&&it.i>=6){const f=POS[bu];play.fk[bu]=chase(bu,{x:lerp(f.x,it.p.x,.55),y:lerp(f.y,it.p.y,.55)},it.t)}
 const code={1:'1B',2:'2B',3:'3B',4:'IPHR'}[bd];
 const runs=runners.filter(r=>r.dest===4&&!r.out).length,homeOut=sendHome&&sendHome.out;
 const word={1:'Single',2:'Double',3:'Triple',4:'Inside-the-park home run'}[bd];
 const ban={1:'SINGLE!',2:'DOUBLE!',3:'TRIPLE!',4:'INSIDE-THE-PARK HR!'}[bd];
 if(errBy!=null)return finalize(play,runners,{code:'E',hit:false,outs:0,banner:'ERROR!',tone:'',sub:'Dropped it!',desc:`Dropped fly ball, E${errBy+1}${runsTxt(runs)}`});
 const dl=P.line||Math.abs(P.s)>=41?' down the line':'';
 return finalize(play,runners,{code,hit:true,outs:homeOut?1:0,banner:ban,tone:bd===4?'hr':'hit',sub:homeOut?`${sendHome.who.name} thrown out at the plate`:sendHome&&sendHome.closeHome?`${sendHome.who.name} slides in safe!`:undefined,desc:`${word} ${dl?dl.trim()+' in '+fieldName(P.s):'to '+fieldName(P.s)}${runsTxt(runs)}${homeOut?`, ${sendHome.who.name} out at home`:''}`});
}
function buildGrounder(P,dir,b){
 const C={x:0,y:2};
 const vf=.72*(1-Math.max(0,-P.L)/75);
 const v0=P.EV*1.467*vf,A=P.bunt?9:15,ts=v0/A,dmax=fenceDist(P.s)-10;
 const gpos=t=>{const tt=Math.min(t,ts);const d=Math.min(v0*tt-.5*A*tt*tt,dmax);return{x:C.x+dir.x*d,y:C.y+dir.y*d,h:Math.abs(Math.sin(t*8))*3*Math.max(0,1-t/ts)}};
 // a scorcher right down the line gets past the corner infielder most of the time and rattles into the corner
 const lineShot=!P.bunt&&Math.abs(P.s)>=40.5&&P.EV>=86&&Math.random()<.7;
 const it=intercept(gpos,.12,ts+10,[0,1,2,3,4,5,6,7,8].filter(i=>!(lineShot&&i===(P.s>0?2:4))),P.bunt?.35:0);
 if(lineShot)P.line=true;
 const play=newPlay();
 const gs=fnSeg(0,it.t,gpos);gs.snd=true;play.segs.push(gs);
 play.fk[it.i]=chase(it.i,it.p,it.t);
 {const f=POS[it.i],dd=dist(f,it.p),need=f.re+(P.bunt?.35:0)+Math.max(0,dd-f.reach)/f.sp;const pl=Math.max(1,Math.hypot(it.p.x,it.p.y)),lat=Math.abs(f.x*it.p.y/pl-f.y*it.p.x/pl);if(it.i>=2&&it.i<=5&&!P.bunt&&lat>12&&dd>11&&it.t-need<.08&&Math.random()<.55){play.dive=diveOf(it.i,it.t,it.p);play.fk[it.i]=play.fk[it.i].slice(0,3)}}
 const runners=runnerList(b);
 if(it.i<=5)return groundOut(play,it,P,runners);
 return outfieldHit(play,it,P,runners,.1);
}
function groundOut(play,it,P,runners){
 const i=it.i,outsBefore=S.outs;let tf=it.t,Pp=it.p;
 const xf=.6+(play.dive&&play.dive.i===i?.9:0);
 const occ=[!!S.bases[0],!!S.bases[1],!!S.bases[2]];
 const forced=k=>k===1?true:occ.slice(0,k-1).every(Boolean);
 const batR=runners.find(r=>r.batter),r1=runners.find(r=>r.from===1);
 const bst=P.bunt?(batR.who.spd>=85?.2:.35):.65;const batArr1=bst+LEG/spdFt(batR.who),r1Arr2=r1?.1+LEG/spdFt(r1.who):99;
 runners.forEach(r=>{r.start=r.batter?bst:r.L0!=null?0:.1;r.speed=spdFt(r.who)});
 const bob=!P.bunt&&Math.random()<errChance(i,play.dive&&play.dive.i===i?.16:.05);// a diving stop is much harder to field cleanly
 if(bob){play.bobble=true;const sq={x:Pp.x+rand(-8,8),y:Pp.y-rand(4,10)},t0=tf;
  play.segs.push(fnSeg(t0,t0+.7,tt=>{const uu=(tt-t0)/.7;return{x:lerp(Pp.x,sq.x,uu),y:lerp(Pp.y,sq.y,uu),h:Math.abs(Math.sin(uu*6))*2*(1-uu)}}));
  pushKey(play,i,{t:t0+1,x:sq.x,y:sq.y});tf=t0+1;Pp=sq}
 const cov1=i===2?0:2,cov2=(i===3||i===2)?5:3;
 let outs=0,code,note;
 const t2=tf+xf+dist(Pp,BASES[2])/THROW;
 if(!P.bunt&&r1&&outsBefore<2&&t2<r1Arr2-.1){
  r1.dest=2;r1.out=true;r1.outAt=t2;outs++;
  play.segs.push(holdSeg(play,tf,tf+xf,i),throwSeg(tf+xf,fromF(play,i,tf+xf),BASES[2]));
  play.fk[cov2]=cover(cov2,BASES[2],t2);
  const t1=t2+.35+dist(BASES[2],BASES[1])/THROW;
  play.segs.push(fnSeg(t2,t2+.35,()=>({x:BASES[2].x,y:BASES[2].y,h:3})),throwSeg(t2+.35,BASES[2],BASES[1]));
  if(!play.fk[cov1])play.fk[cov1]=cover(cov1,BASES[1],t1);
  batR.dest=1;
  if(t1<batArr1){batR.out=true;batR.outAt=t1;outs++;code='DP';note=`${i+1}-${cov2+1}-${cov1+1}`}
  else{code='FC';note=`${i+1}-${cov2+1}`}
 }else{
  let t1;
  if(i===2&&dist(Pp,BASES[1])<25&&!(play.dive&&play.dive.i===2)){
   t1=tf+dist(Pp,BASES[1])/POS[2].sp;pushKey(play,2,{t:t1,x:BASES[1].x,y:BASES[1].y});
   play.segs.push(holdSeg(play,tf,t1,2));note='3U';
  }else{
   t1=tf+xf+dist(Pp,BASES[1])/THROW;
   play.segs.push(holdSeg(play,tf,tf+xf,i),throwSeg(tf+xf,fromF(play,i,tf+xf),BASES[1]));
   if(!play.fk[cov1])play.fk[cov1]=cover(cov1,BASES[1],t1);
   note=`${i+1}-${cov1+1}`;
  }
  batR.dest=1;
  if(t1<batArr1){
   if(note!=='3U'&&Math.random()<errChance(i,play.dive&&play.dive.i===i?.13:.06)){// throwing from the knees
    // throwing error: the ball sails past first and rolls into foul ground
    code='E';note=`E${i+1}`;batR.dest=2;
    const last=play.segs.pop();const over={x:BASES[1].x+22,y:BASES[1].y-18};const ts=throwSeg(last.t0,fromF(play,i,last.t0),over);ts.snd=false;play.segs.push(ts);
    play.segs.push(fnSeg(ts.t1,ts.t1+1.4,tt=>{const uu=Math.min(1,(tt-ts.t1)/1.4),e=1-(1-uu)*(1-uu);return{x:over.x+6*e,y:over.y-4*e,h:0}}));
    if(play.fk[cov1])pushKey(play,cov1,{t:ts.t1+1.5,x:over.x+6,y:over.y-4});
    {const tp=ts.t1+1.5,P1={x:over.x+6,y:over.y-4},tB=bst+2*LEG/spdFt(batR.who),fl=dist(P1,BASES[2])/THROW;
     const tt=Math.max(tp+.55,tB-fl+.25),P2={x:lerp(P1.x,BASES[2].x,.14),y:lerp(P1.y,BASES[2].y,.14)};
     if(play.fk[cov1]){pushKey(play,cov1,{t:tt,x:P2.x,y:P2.y});
      play.segs.push(holdSeg(play,tp,tt,cov1),throwSeg(tt,P2,BASES[2]));
      const c2=[5,3].find(k=>k!==i&&k!==cov1);if(c2!=null){if(!play.fk[c2])play.fk[c2]=cover(c2,BASES[2],tt+fl);else pushKey(play,c2,{t:tt+fl-.05,x:BASES[2].x,y:BASES[2].y-2})}}}
   }else{batR.out=true;batR.outAt=t1;outs++;code='GO'}
  }else{code='IFH';batR.round=true}
 }
 if(bob&&code==='IFH'){code='E';note=`E${i+1}`}
 let cap=4;
 for(const r of runners){
  if(r.batter||r.out)continue;
  let d=r.from;
  if(code==='E')d=bob?(forced(r.from)?r.from+1:r.from):Math.min(4,r.from+2);
  else if(P.bunt&&code==='GO')d=r.from+1;
  else if(forced(r.from))d=r.from+1;
  else if(code!=='IFH'){if(r.from===3&&outsBefore<2)d=4;else if(r.from===2&&Pp.x>0)d=3}
  d=Math.min(d,cap);if(d<r.from)d=r.from;
  r.dest=d;cap=d===4?4:d-1;
 }
 const inningOver=outsBefore+outs>=3;
 const runs=inningOver?0:runners.filter(r=>!r.out&&r.dest===4).length;
 const sac=P.bunt&&code==='GO'&&runners.some(r=>!r.batter&&!r.out&&r.dest>r.from);
 const map={
  GO:P.bunt?(sac?{banner:'SAC BUNT',desc:`Sacrifice bunt ${note}`}:{banner:'BUNT OUT',desc:`Bunt groundout ${note}`}):{banner:'GROUNDOUT',desc:`Groundout ${note}`},
  DP:{banner:'DOUBLE PLAY',desc:`Double play ${note}`},
  FC:{banner:"FIELDER'S CHOICE",desc:`Fielder's choice ${note}`},
  IFH:P.bunt?{banner:'BUNT SINGLE!',desc:`Bunt single toward ${POS[i].n}`}:{banner:'INFIELD SINGLE!',desc:`Infield single to ${POS[i].n}`},
  E:{banner:'ERROR!',desc:`${bob?'Fielding':'Throwing'} error by the ${({pitcher:'pitcher',catcher:'catcher',first:'first baseman',second:'second baseman',third:'third baseman',short:'shortstop'})[POS[i].n]}, ${note}`},
 }[code];
 return finalize(play,runners,{code,hit:code==='IFH',outs,runs,banner:map.banner,sub:map.sub,tone:code==='IFH'?'hit':'',desc:map.desc+runsTxt(runs)});
}
// metal clang: the ball's FIRST contact is the foul pole, the top edge of the wall, or the jumbotron/scoreboard
function clangFor(D,fd,s,T,hr){const as=Math.abs(s),dd=D-fd;
 if(hr){if(as>40&&Math.random()<.4)return{t:T*fd/D,k:'pole'};if(dd<7&&Math.random()<.55)return{t:T*fd/D,k:'edge'};if(dd>50&&as<16&&Math.random()<.45)return{t:T,k:'board'};return null}
 if(dd>-14&&Math.random()<.3)return{t:T,k:'edge'};return null}
function buildAir(P,dir,b){
 const C={x:0,y:2},Lr=P.L*RAD;
 let D=Math.max(30,Math.min(475,(P.EV-40)*5.9*(.82+b.pow*.0035)*Math.pow(Math.sin(2*Lr),P.L>45?1:.6)));
 {const need=b.pow>=85?.62:b.pow>=72?.7:.78;if(b.pow<60||P.q<need){const fdd=fenceDist(P.s);if(D>fdd-8)D=fdd-8-rand(0,22)}}
 const vy=P.EV*1.467*Math.sin(Lr);
 const T=Math.max(.7,vy/16*.82);
 const Hh=Math.max(8,vy*vy/64*.55);
 const land={x:C.x+dir.x*D,y:C.y+dir.y*D};
 const fd=fenceDist(P.s);
 const play=newPlay();const runners=runnerList(b);const outsBefore=S.outs;
 play.deep=D>fd-30;
 if(D>fd){
  play.segs.push(airSeg(0,T,C,land,Hh));play.ballGone=T;play.clang=clangFor(D,fd,P.s,T,true);
  const wall={x:dir.x*(fd-4),y:dir.y*(fd-4)};
  let of=7,bd=1e9;for(const i of[6,7,8]){const dd=dist(POS[i],wall);if(dd<bd){bd=dd;of=i}}
  play.fk[of]=chaseLate(of,wall,Math.max(T-.2,POS[of].re+bd/POS[of].sp));
  runners.forEach(r=>{r.dest=4;r.start=r.batter?T+.65:.4;r.speed=19});play.watch=T;play.flip=pick(FLIPS);
  const runs=runners.length;
  return finalize(play,runners,{code:'HR',hit:true,hr:true,outs:0,runs,newBases:[null,null,null],
   banner:runs===4?'GRAND SLAM!':'HOME RUN!',tone:'hr',sub:`${Math.round(D)} ft to ${fieldName(P.s)}`,desc:`Home run to ${fieldName(P.s)}, ${Math.round(D)} ft${runsTxt(runs)}`});
 }
 const cands=[2,3,4,5,6,7,8];if(D<60)cands.push(0);if(D<70)cands.push(1);
 let best=7,bn=1e9;for(const i of cands){const f=POS[i];const need=f.re+Math.max(0,dist(f,land)-f.reach)/f.sp;if(need<bn){bn=need;best=i}}
 // outfielders have priority: on anything hit past the infield dirt, an outfielder who can get there calls the infielder off
 if(best<6&&D>=128){let ob=-1,on=1e9;for(const i of[6,7,8]){const f=POS[i];const need=f.re+Math.max(0,dist(f,land)-f.reach)/f.sp;if(need<on){on=need;ob=i}}
  if(ob>=0&&on<=T+.02){best=ob;bn=on}}
 const drop=bn<=T+.05&&P.L<45&&Math.random()<errChance(best,bn>T-.12?.2:.05);// diving catches pop out of the glove far more often
 if(bn<=T+.05&&!drop){
  const XF=.7+(bn>T-.12&&P.L<45?.9:0);
  const dv0=bn>T-.12&&P.L<45,leap=!dv0&&((best<=5&&P.L>=10&&P.L<26)||(best>=6&&D>fd-24))&&Math.random()<.14;if(leap)play.jump={i:best,t:T};
  {const cs=airSeg(0,T,C,land,Hh,null,dv0?3.5:leap?22:rand(12.5,15));cs.snd=true;play.segs.push(cs)}
  play.caughtFly=true;
  {const tA=Math.min(T,Math.max(bn,POS[best].re+.1));play.fk[best]=best>=6&&T-tA>.6?chaseLate(best,land,Math.max(tA,T-rand(.12,.4))):chase(best,land,tA)}
  if(bn>T-.12&&P.L<45)play.fk[best]=play.fk[best].slice(0,3);
  const batR=runners.find(r=>r.batter);batR.dest=1;batR.out=true;batR.outAt=T;batR.start=.65;
  if(play.deep){play.watch=T;play.flip=pick(FLIPS);batR.start=T+.4;batR.outAt=T+.5}
  const outsAfter=outsBefore+1;
  const r3=runners.find(r=>r.from===3),r2=runners.find(r=>r.from===2);
  let tag=false;
  if(outsAfter<3&&r3&&best>=6){
   const tThrow=T+XF+dist(land,BASES[0])/THROW,tArr=T+.1+LEG/spdFt(r3.who);
   if(tArr+.15<tThrow){r3.dest=4;r3.start=T+.1;tag=true}
  }
  if(outsAfter<3&&r2&&best>=6&&D>260&&(!r3||r3.dest===4)){r2.dest=3;r2.start=T+.1}
  for(const r of runners)if(!r.batter){r.tagAt=T;if(r.dest===r.from)r.start=T+.2}
  let dbl=null;
  if(outsAfter<3&&P.L<22&&best<=5){const cand=runners.find(r=>!r.batter&&(r.from===1||r.from===2)&&r.dest===r.from);
   if(cand&&Math.random()<.35){const bb=BASES[cand.from],tt=T+.35+dist(land,bb)/THROW;play.segs.push(holdSeg(play,T,T+.35,best),throwSeg(T+.35,fromF(play,best,T+.35),bb));
    cand.out=true;cand.outAt=tt;cand.dblOff=true;dbl=cand;const cv=cand.from===1?(best===2?0:2):(best===5?3:5);if(cv!==best&&!play.fk[cv])play.fk[cv]=cover(cv,bb,tt)}}
  const empty=!S.bases.some(Boolean);
  if(best>=6){const mi=land.x<0?5:3,tgt=tag?BASES[0]:empty?{x:lerp(POS[mi].x,land.x,.12),y:lerp(POS[mi].y,land.y,.12)}:BASES[2];if(empty&&!tag&&!play.fk[mi])play.fk[mi]=cover(mi,tgt,T+XF+dist(land,tgt)/THROW);play.segs.push(holdSeg(play,T,T+XF,best),throwSeg(T+XF,fromF(play,best,T+XF),tgt));
   const cov=tag?1:(land.x<0?3:5);if(!play.fk[cov]&&!tag)play.fk[cov]=cover(cov,tgt,T+XF+dist(land,tgt)/THROW)}
  const kind=(P.L>=45||(best<=5&&P.L>=30))?'P':P.L<22?'L':'F';
  const diving=bn>T-.12&&kind!=='P';
  if(diving)play.dive=diveOf(best,T,land);
  const runs=outsAfter>=3?0:runners.filter(r=>!r.out&&r.dest===4).length;
  const code=runs?'SF':({P:'PO',L:'LO',F:'FO'}[kind]);
  const word=runs?'Sac fly':({P:'Popout',L:'Lineout',F:'Flyout'}[kind]);
  const ban=runs?'SAC FLY':diving?'DIVING CATCH!':({P:'POPOUT',L:'LINEOUT',F:'FLYOUT'}[kind]);
  if(dbl)return finalize(play,runners,{code:'LDP',hit:false,outs:2,runs:0,banner:'DOUBLE PLAY',tone:'',sub:`Doubled off ${dbl.from===1?'first':'second'}`,desc:`Lineout ${kind}${best+1}, runner doubled off ${dbl.from===1?'first':'second'}`});
  return finalize(play,runners,{code,hit:false,outs:1,runs,banner:ban,tone:'',desc:`${word} ${kind}${best+1}${diving?', diving':''}${runsTxt(runs)}`});
 }
 const vr=drop?14:P.L<22?44:30,Rr=drop?7:(P.L<22?.2:.09)*D,Tr=Math.max(.3,2*Rr/vr),room=Math.max(0,fd-10-D);
 const rollPos=t=>{if(t<T){const u=t/T;return{x:lerp(C.x,land.x,u),y:lerp(C.y,land.y,u),h:4*Hh*u*(1-u)}}
  const tau=clamp(t-T,0,Tr);const d=Math.min(vr*tau-.5*(vr/Tr)*tau*tau,room);return{x:land.x+dir.x*d,y:land.y+dir.y*d,h:Math.abs(Math.sin(tau*7))*4*Math.max(0,1-tau/Tr)}};
 const it=intercept(rollPos,T,T+Tr+12,[2,3,4,5,6,7,8]);
 {const rs=fnSeg(T,it.t,rollPos);rs.snd=true;play.segs.push(airSeg(0,T,C,land,Hh),rs)}
 if(!drop)play.clang=clangFor(D,fd,P.s,T,false);
 play.fk[it.i]=chase(it.i,it.p,it.t);
 const delay=outsBefore===2?.1:.1+T*.55;
 return outfieldHit(play,it,P,runners,delay,drop?best:null);
}
function ballAt(play,t){
 if(play.ballGone!==null&&t>=play.ballGone)return null;
 for(const s of play.segs)if(t>=s.t0&&t<=s.t1){play.curSeg=s;return s.fn(t)}
 let last=null;for(const s of play.segs)if(s.t1<=t&&(!last||s.t1>=last.t1))last=s;
 play.curSeg=last;return last?last.fn(last.t1):null;
}
const LEADFT={1:10,2:13,3:8};
// stealing: tap the little arrow by a runner (or press S) before the pitch; he breaks on the release
const canSteal=k=>batKey()===myTeam()&&!pitching()&&S.mode!=='bp'&&!S.auto&&!!S.bases[k-1]&&k<3&&!S.bases[k]&&S.outs<3;
function toggleSteal(k){if(!canSteal(k)||!['ready','windup','choose'].includes(S.phase))return;S.steal=S.steal||{};S.steal[k]=!S.steal[k];sfx('glove')}
function stealProg(k,now){const b=S.bases[k-1];const el=Math.max(0,(now-S.pitch.releaseAt)/1000*SPEED);return{L:(LEADFT[k]+3)/LEG,run:el*spdFt(b)/LEG,el}}
function buildPickoff(k){
 const play=newPlay(),runners=[],who=S.bases[k-1],hot=S.steal&&S.steal[k];
 for(let j=1;j<=3;j++)if(S.bases[j-1])runners.push({from:j,who:S.bases[j-1],dest:j,start:0,speed:spdFt(S.bases[j-1]),out:false});
 const r=runners.find(x=>x.from===k),P0={x:POS[0].x,y:POS[0].y-2},bag={x:BASES[k].x-(k===1?2:0),y:BASES[k].y-(k===2?2:0)},t0=.32,fl=dist(P0,bag)/(THROW*1.05),ta=t0+fl;
 const out=Math.random()<(hot?.32:.05);
 play.segs.push(fnSeg(0,t0,()=>({x:P0.x,y:P0.y,h:5})),throwSeg(t0,P0,bag),holdSeg(play,ta,ta+.45,k===1?2:5),throwSeg(ta+.45,bag,P0));
 const cov=k===1?2:5;play.fk[cov]=cover(cov,bag,ta);pushKey(play,cov,{t:ta+.9,x:bag.x,y:bag.y});
 r.slide={t0:.12,t1:Math.max(.45,ta-.06),head:true,b:k,back:true};
 if(out){r.out=true;r.outAt=ta+.05}
 const res={code:out?'PKO':'PK',steal:true,pickoff:true,hit:false,outs:out?1:0,runs:0,banner:out?'PICKED OFF!':'PICKOFF ATTEMPT',tone:out?'strike':'',sub:out?`${who.name} caught leaning`:'Back in time',desc:out?`Picked off ${k===1?'first':'second'}, ${who.name}`:''};
 return finalize(play,runners,res)}
function buildSteal(now){
 const play=newPlay(),runners=[];let anyOut=false,lead=null;
 for(const k of[2,1]){if(!(S.steal&&S.steal[k])||!S.bases[k-1]||S.bases[k])continue;const who=S.bases[k-1],sp=stealProg(k,now);
  const r={from:k,who,dest:k+1,start:-sp.el,speed:spdFt(who),out:false,steal:true};runners.push(r);if(!lead)lead=r}
 for(let k=1;k<=3;k++)if(S.bases[k-1]&&!runners.some(r=>r.from===k))runners.push({from:k,who:S.bases[k-1],dest:k,start:0,speed:spdFt(S.bases[k-1]),out:false});
 if(!lead)return null;
 {const k=lead.from,tgt=BASES[k+1],C={x:0,y:-3},cDef=(S.fpl&&S.fpl[1]?S.fpl[1].def:60);
  const pk=S.pitch?S.pitch.k:'FB',pS=clamp(.52+(spdFt(lead.who)-25)*.06-(cDef-60)*.006+(pk==='CH'||pk==='KN'?.1:pk==='SP'?.05:0)-(k===2?.08:0),.12,.93);
  const safe=Math.random()<pS;const L=(LEADFT[k]+3)/LEG,tR=lead.start+(1-L)*LEG/lead.speed,fl=dist(C,tgt)/THROW;
  const t0=Math.max(.3,safe?tR+.12-fl:tR-.22-fl);play.segs.push(fnSeg(0,t0,()=>({x:C.x,y:C.y,h:4})),throwSeg(t0,C,tgt));
  const cov=k===1?(Math.random()<.5?5:3):4;play.fk[cov]=cover(cov,{x:tgt.x+(k===1?0:2),y:tgt.y-2},t0+fl);
  if(!safe){lead.out=true;lead.outAt=Math.max(tR,t0+fl)+.05;anyOut=true}
  play.tagAt=t0+fl;}
 const desc=lead?(anyOut?`Caught stealing ${['','second','third'][lead.from]}, ${lead.who.name}`:`${lead.who.name} steals ${['','second','third'][lead.from]}`):'';
 const res={code:anyOut?'CS':'SB',steal:true,hit:false,outs:anyOut?1:0,runs:0,banner:anyOut?'CAUGHT STEALING':'STOLEN BASE!',tone:anyOut?'strike':'hit',sub:`${S.balls}-${S.strikes}`,desc};
 return finalize(play,runners,res)}

function leadNow(k,ph,now){ // how far off the bag a runner on base k (1..3) is between pitches
 const full=LEADFT[k];if(ph==='windup'){const kk=S.pitch?S.pt/S.pitch.wind:0;return lerp(full*.55,full,clamp((kk-.2)/.5,0,1))}
 if(ph==='pitch'){const e=S.pitch?now-S.pitch.releaseAt:0;return full+Math.min(3,e/150)}
 if(ph==='call'){return Math.max(0,full+4-S.pt/60)}
 if(ph==='ready'||ph==='choose')return full*.55*clamp(S.pt/500,0,1);return 0}
function runnerPos(r,t){
 if(r.tagAt!=null&&t<r.start){
  const b=baseP(r.from),nx=baseP(Math.min(4,r.from+1)),Lf=r.L0!=null?r.L0:6/LEG,lead={x:lerp(b.x,nx.x,Lf),y:lerp(b.y,nx.y,Lf)};
  // a runner caught off on a steal turns around from wherever he was and hustles back (no snap)
  const dur=r.L0!=null?Math.max(.45,Lf*LEG/(r.speed*.92)):.55,back=r.dblOff?r.outAt+.15:r.L0!=null?.12+dur:r.tagAt-.12,u=clamp((t-(back-dur))/dur,0,1);
  return{x:lerp(lead.x,b.x,u),y:lerp(lead.y,b.y,u),moving:u>0&&u<1,onBag:u>=1};
 }
 const total=r.dest-r.from;
 if(r.from>=1&&r.tagAt==null){const b=baseP(r.from),nx=baseP(Math.min(4,r.from+1)),L=r.L0!=null?r.L0:(LEADFT[r.from]+3)/LEG;
  if(total<=0){const u=clamp(t/(r.L0!=null?Math.max(.45,L*LEG/(r.speed*.92)):.6),0,1);return{x:lerp(lerp(b.x,nx.x,L),b.x,u),y:lerp(lerp(b.y,nx.y,L),b.y,u),moving:u<1}}
  if(t<r.start){return{x:lerp(b.x,nx.x,L),y:lerp(b.y,nx.y,L),moving:false}}
  const prog0=L,prog=clamp(prog0+(t-r.start)*r.speed/LEG,0,total),leg=Math.min(Math.floor(prog),total-1),f=prog-leg,a=baseP(r.from+leg),c=baseP(r.from+leg+1);
  return{x:lerp(a.x,c.x,f),y:lerp(a.y,c.y,f),moving:prog<total}}
 if(total<=0)return baseP(r.from);
 if(r.batter&&r.dest===1){const ta=r.start+LEG/r.speed,dt=t-ta;
  const dur=r.round?1.5:1.0;
  if(dt>0&&dt<dur){const b1=baseP(1),to=r.round?baseP(2):{x:b1.x*1.6,y:b1.y*1.6},d=dist(b1,to),ux=(to.x-b1.x)/d,uy=(to.y-b1.y)/d,L=r.round?13:12,ta2=r.round?.45:.4;
   const o=dt<ta2?L*(1-Math.pow(1-dt/ta2,2)):L*(1-ease((dt-ta2)/(dur-ta2)));return{x:b1.x+ux*o,y:b1.y+uy*o,moving:true,walk:dt>ta2}}}
 const prog=clamp((t-r.start)*r.speed/LEG,0,total);
 const leg=Math.min(Math.floor(prog),total-1),f=prog-leg;
 const a=baseP(r.from+leg),b=baseP(r.from+leg+1);
 return{x:lerp(a.x,b.x,f),y:lerp(a.y,b.y,f),moving:prog>0&&prog<total};
}
function hrMoment(r){const now=performance.now();$('skipBtn').hidden=!!(S.online&&S.online.inGame&&pitching());banner(r.banner,r.sub,'hr');if(r.bp)return;S.baseChase=now;
 if(batKey()===S.you){const pl=S.play;S.hrHype=pl;setTimeout(()=>{if(S.play===pl&&!S.paused)playSample('horn',.9,1)},700);
  setTimeout(()=>{if(S.play===pl&&!S.paused)playSample('horn',.9,1)},700+((BUF.horn&&BUF.horn.duration)||4.8)*1000+250)}
 if(batKey()===S.you){S.cheerUntil=now+1e9;S.fwUntil=now+4600;setTimeout(()=>{if(!S.paused&&!muted)playSample('fworks',.85,1)},350);S.jumbo={text:r.banner.replace('!',''),kr:'홈런!',until:now+5200}}}
const sideLabel=()=>S.mode==='arcade'?'INNING OVER':'CHANGE SIDES';
// would three outs right now end the whole game? (then the final screen does the talking)
function willEndGame(applied){if(S.mode==='arcade')return S.inning>=S.totalInn;const n=S.schedInn||9;if(S.inning<n)return false;
 return S.half==='top'?S.runs>S.target:S.runs!==S.target}
function finishPlay(){
 $('skipBtn').hidden=true;
 if(S.hrHype&&S.hrHype===S.play){S.hrHype=null;S.cheerUntil=performance.now()+2600}
 const r=S.play.res;const now=performance.now();
 if(r.bp){S.bp.sw++;S.bp.n++;if(r.hr)S.bp.hr++;if(r.code!=='FOUL')S.bp.long=Math.max(S.bp.long,r.dist);
  banner(r.banner,r.sub,r.tone);logPA(curBatter(),r.desc,r.hr||r.code==='LD');
  setPhase('result');updateHUD();return}
 if(r.code==='FOUL'&&S.play.bunt&&S.strikes>=2){
  S.outs++;S.ks++;logPA(curBatter(),'Foul bunt on strike three, K',false);banner('STRIKEOUT','Foul bunt with two strikes','strike');sfx('out');nextBatter();
 }else if(r.code==='FOUL'){
  if(S.strikes<2)S.strikes++;
  banner(S.play.bunt?'FOUL BUNT':'FOUL BALL',S.strikes<2?`${S.balls}-${S.strikes}`:'Still two strikes');
 }else{
  const outsAfter=S.outs+r.outs;const runs=outsAfter>=3?0:r.runs;
  S.outs=Math.min(3,outsAfter);addRuns(runs);
  const mine=batKey()===S.you;
  if(r.hit){if(mine)S.hits++;else S.oppHits++}if(r.hr&&mine)S.hr++;if(r.code==='E'){if(fldKey()===S.opp)S.errs++;else S.myErrs++;if(mine)S.cheerUntil=now+1600}
  S.bases=outsAfter>=3?[null,null,null]:r.newBases;
  if(r.desc)logPA(curBatter(),r.desc,!!r.hit||runs>0);
  const runTxt=`+${runs} RUN${runs>1?'S':''}`;
  const sub=isWalkoff()?'Walk-off!':r.hr?runTxt:r.sub||(runs?runTxt:r.desc);
  if(outsAfter>=3&&!willEndGame(true)){banner(sideLabel(),r.desc||'Three outs')}else banner(r.banner,sub,r.tone);
  if(!r.hr){sfx(r.hit?'hit':'out');if(mine?(r.hit||runs):r.outs>0)S.cheerUntil=now+2200;if((r.hit||r.code==='E'||r.code==='IFH')&&!r.steal&&!S.play.reachCued)crowdReach()}
  if(r.hr){}
  else if(runs)S.jumbo={text:runs>1?`${runs} RUNS SCORE`:'RUN SCORES',until:now+3000};
  if(!r.steal)nextBatter();
  S.postOff=outsAfter>=3?(fldKey()===S.you?1:-1):0;
 }
 S.postAt=now;if(!(S.outs>=3))S.postOff=0;
 setPhase('result');updateHUD();
}
function afterPA(){
 if(S.mode==='bp'){S.balls=0;S.strikes=0;setPhase('ready');updateHUD();return}
 if(S.mode==='full'){if(fullInning())return}
 else if(S.runs>S.target){gameOver(true);return}
 if(S.mode==='arcade'&&S.outs>=3){
  if(S.inning>=S.totalInn){
   if(S.runs===S.target){
    S.totalInn++;S.oppLine.push(0);S.youLine.push(0);
    S.inning++;S.outs=0;S.bases=[null,null,null];
    banner('EXTRA INNINGS',`Tied ${S.runs}-${S.target}. Next run wins.`);setPhase('inning');updateHUD();return;
   }
   gameOver(false);return;
  }
  const need=S.target+1-S.runs;
  banner(`END OF THE ${ord(S.inning).toUpperCase()}`,`Need ${need} to win, ${S.totalInn-S.inning} inning${S.totalInn-S.inning>1?'s':''} left`);
  S.inning++;S.outs=0;S.bases=[null,null,null];S.balls=0;S.strikes=0;
  setPhase('inning');updateHUD();return;
 }
 const fk=fldKey(),st=TEAMS[fk].staff||[],lim=S.mode==='full'?95:55;
 const humanPen=onlineGame()||(S.mode==='full'&&fk===S.you&&!S.auto);// a human manager makes their own calls
 const nxt=st.findIndex((p,i)=>i>(S.pIdxOf[fk]||0)&&!usedOf(fk).includes(i));
 if(humanPen&&nxt>=0&&((S.pRunsOf[fk]||0)>=4||(S.pcOf[fk]||0)>=lim)&&!S.penHint){S.penHint=true;setTimeout(()=>{if(pitching()&&S.phase==='choose')banner('YOUR PITCHER IS TIRING',`${S.pcOf[fk]||0} pitches. Tap BULLPEN (or press B) to make a change.`)},900)}
 if(!humanPen&&nxt>=0&&((S.pRunsOf[fk]||0)>=4||(S.pcOf[fk]||0)>=lim)){
  changePitcher(fk,nxt,true);const np=pitcher();
  banner('PITCHING CHANGE',`${fk===S.you?'Your bullpen: ':''}#${np.no} ${np.name}, ${np.slot==='side'?'sidearm ':''}${np.hand}HP, in from the pen`);
  S.jumbo={text:'NEW PITCHER',kr:'투수 교체',until:performance.now()+3200};$('tag').hidden=true;setPhase('inning');updateHUD();return;
 }
 hideBanner();$('tag').hidden=true;setPhase('ready');updateHUD();
}
function fullInning(){
 if(isWalkoff()){gameOver(true);return true}
 if(S.outs<3)return false;
 if(S.half==='top'){
  if(S.inning>=(S.schedInn||9)&&S.runs>S.target){gameOver(true);return true}
  S.half='bot';
 }else{
  if(S.inning>=(S.schedInn||9)&&S.runs!==S.target){gameOver(S.runs>S.target);return true}
  S.half='top';S.inning++;if(S.inning>S.totalInn){S.totalInn++;S.oppLine.push(0);S.youLine.push(0)}
 }
 S.outs=0;S.bases=[null,null,null];S.balls=0;S.strikes=0;setSides();
 const extra=S.inning>(S.schedInn||9)?' · extra innings':'';
 banner(`${S.half==='top'?'TOP':'BOTTOM'} OF THE ${ord(S.inning).toUpperCase()}`,S.half==='top'?`You're pitching to the ${TEAMS[S.opp].name}${extra}`:`${TEAMS[S.you].name} batting · ${TEAMS[S.opp].name} ${S.target}, ${TEAMS[S.you].name} ${S.runs}${extra}`);
 setPhase('inning');updateHUD();return true;
}
const ord=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');

