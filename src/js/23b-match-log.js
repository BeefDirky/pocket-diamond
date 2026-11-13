// ---------- the match record: every pitch and plate appearance, written the same way on both online phones ----------
// Fed by small hooks in the pitching and play code; it never changes the game. At the end it becomes:
//  * a ranked submission (both phones send theirs; the server compares them and writes the stats), or
//  * a self-reported line for your profile (single player and casual online; never on a leaderboard).
// Everything here is either an input (pitch type, release quality, swing timing) or something both phones work out
// from the shared seed, so two honest phones produce identical records.
let ML=null;
const ML_RES={'1B':'1B',IFH:'1B','2B':'2B','3B':'3B',IPHR:'HR',HR:'HR',GO:'GO',DP:'DP',LDP:'DP',FC:'FC',E:'E',SF:'SF',PO:'PO',LO:'LO',FO:'FO'};
const r2=v=>v==null||!isFinite(v)?null:Math.round(v*100)/100,r1=v=>v==null||!isFinite(v)?null:Math.round(v*10)/10;
const mlKey=(club,p)=>String(p?(p.signed||club+':'+p.name):club+':?').slice(0,40);
function mlStart(){const on=onlineGame();ML=S.mode==='bp'?null:{v:1,mode:on?(S.online.ranked?'ranked_stock':'casual'):S.mode,me:on?S.online.me:'home',sched:S.schedInn||S.totalInn||9,home:S.you,away:S.opp,pa:[],cur:null,lp:null,t0:Date.now()}}
// the plate appearance in progress (opened by its first pitch, or by a run or out before one)
function mlCur(){if(!ML||S.mode==='bp')return null;let c=ML.cur;
 // an inning only turns over on the third out: a PA still open from the last half ended on a caught stealing or pickoff
 if(c&&(c.i!==S.inning||c.h!==S.half)){mlClose('OTHER',0,3-c.ob);c=null}
 if(!c){const b=curBatter(),p=pitcher();c=ML.cur={i:S.inning,h:S.half,bs:batKey()===S.you?'home':'away',bk:mlKey(batKey(),b),pk:mlKey(fldKey(),p),
  ob:S.outs,bb:(S.bases[0]?1:0)|(S.bases[1]?2:0)|(S.bases[2]?4:0),p:[],rs:0,auto:!!S.auto}}
 return c}
// at release (after the arm has paid for it)
function mlPitch(){const c=mlCur();if(!c)return;const p=S.pitch;S.lastBB=null;
 ML.lp={k:p.k,mph:p.mph,x:r2(p.plateX),z:p.inZone?1:0,q:r2(p.q),w:p.wild?1:0,st:r2(stamFrac()),o:null,e:null};c.p.push(ML.lp)}
// the pitch reached the plate with no ball in play
function mlPitchEnd(){const lp=ML&&ML.lp;if(!lp)return;const sw=S.swing;
 lp.o=S.pitch.hbp&&!sw?'hbp':sw?'swinging_strike':S.pitch.inZone?'called_strike':'ball';if(sw&&!sw.bunt)lp.e=Math.round(sw.err||0)}
function mlContact(){const lp=ML&&ML.lp;if(!lp)return;lp.o='in_play';if(S.swing&&!S.swing.bunt)lp.e=Math.round(S.swing.err||0)}
function mlFoul(){const lp=ML&&ML.lp;if(lp)lp.o='foul'}
function mlRuns(n){const c=n&&mlCur();if(c)c.rs+=n}
// an event that ends a plate appearance (opens one first if it had no pitch, like an intentional walk)
function mlDone(code,rbi){if(mlCur())mlClose(code,rbi)}
// the plate appearance is over: what happened, runs driven in, and (normally) outs made since it began
function mlClose(code,rbi,outs){const c=ML&&ML.cur;if(!c)return;ML.cur=null;ML.lp=null;
 c.r=code;c.rbi=Math.max(0,Math.min(4,rbi|0));c.om=Math.max(0,Math.min(3,outs!=null?outs:S.outs-c.ob));
 if(S.lastBB&&ML_RES[code]!=null&&code!=='OTHER'){c.ev=r1(S.lastBB.EV);c.la=r1(S.lastBB.L);c.sp=r1(S.lastBB.s)}
 ML.pa.push(c);phPA(c)}
// a ball in play finished: turn the play's own result code into a scorebook one
function mlInPlay(r,runs){let code=ML_RES[r.code]||'OTHER';if(code==='GO'&&/^Sacrifice bunt/.test(r.desc||''))code='SH';
 mlDone(code,code==='E'||code==='DP'?0:runs)}
// the game is over: close what's open and keep the final line
function mlEnd(){if(!ML)return null;if(ML.fin)return ML;if(ML.cur)mlClose('OTHER',0);ML.sched=S.schedInn||ML.sched;
 ML.fin={home:S.runs,away:S.target,inn:S.inning,line:{home:S.youLine.slice(),away:S.oppLine.slice()}};ML.secs=Math.round((Date.now()-ML.t0)/1000);return ML}
// the part both phones must agree on exactly: every discrete fact, no floating-point measurements
function mlCore(m){return{v:m.v,sched:m.sched,home:m.home,away:m.away,fin:m.fin,
 pa:m.pa.map(c=>[c.i,c.h,c.bs,c.bk,c.pk,c.ob,c.bb,c.r,c.rbi,c.rs,c.om,c.p.map(p=>[p.k,p.mph,p.z,p.w,p.o])])}}
async function mlHash(m){const s=canon(mlCore(m));try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 catch(e){let h='';for(let i=0;i<8;i++)h+=(hash(i+'|'+s)>>>0).toString(16).padStart(8,'0');return h}}
// the wire format for the server (short keys; the database spells them out)
function mlWire(m){return{v:m.v,mode:m.mode,me:m.me,sched:m.sched,home:m.home,away:m.away,fin:m.fin,secs:m.secs,
 pa:m.pa.map(c=>({i:c.i,h:c.h,bs:c.bs,bk:c.bk,pk:c.pk,ob:c.ob,bb:c.bb,r:c.r,rbi:c.rbi,rs:c.rs,om:c.om,auto:c.auto?1:0,ev:c.ev,la:c.la,sp:c.sp,
  p:c.p.map(p=>[p.k,p.mph,p.x,p.z,p.q,p.o,p.e,p.st,p.w])}))}}
