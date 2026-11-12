// ---------- team ratings: an overall (the average of every rating on the club) and its strengths and weaknesses ----------
// six parts: the lineup's CON / POW / SPD / DEF, the starter (VEL, MOV, CTL) and the bullpen. A part is a strength or a
// weakness by how it sits against the rest of the league, so a club with no glaring hole can still show its best side.
const TR_PARTS=[['con','Contact'],['pow','Power'],['spd','Speed'],['def','Defense'],['sp','Starter'],['pen','Bullpen']];
const trAvg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
function teamRating(k){const T=TEAMS[k],L=T.lineup||[],st=T.staff||[T.pitcher],sp=st[0],pen=st.slice(1);
 const arm=p=>trAvg([p.vel,p.mov,p.ctl]);
 const parts={con:trAvg(L.map(p=>p.con)),pow:trAvg(L.map(p=>p.pow)),spd:trAvg(L.map(p=>p.spd)),def:trAvg(L.filter(p=>p.pos!=='DH').map(p=>p.def)),sp:arm(sp),pen:pen.length?trAvg(pen.map(arm)):arm(sp)};
 // the overall: every hitter's four ratings and every pitcher's three, all averaged together
 const all=[...L.flatMap(p=>[p.con,p.pow,p.spd,p.def]),...st.flatMap(p=>[p.vel,p.mov,p.ctl])];
 return{ovr:Math.round(trAvg(all)),parts}}
let TR_LEAGUE=null;
function trLeague(){if(TR_LEAGUE)return TR_LEAGUE;const R=ORDER.map(teamRating),o={};
 for(const[k]of TR_PARTS){const v=R.map(r=>r.parts[k]),m=trAvg(v),sd=Math.sqrt(trAvg(v.map(x=>(x-m)**2)))||1;o[k]={m,sd}}
 const ov=R.map(r=>r.ovr);o.ovr={m:trAvg(ov),rank:ov.slice().sort((a,b)=>b-a)};return TR_LEAGUE=o}
function trHTML(k){const r=teamRating(k),Lg=trLeague();
 const z=TR_PARTS.map(([p,n])=>({p,n,v:Math.round(r.parts[p]),z:(r.parts[p]-Lg[p].m)/Lg[p].sd}));
 // the clear standouts (half a spread from the league), up to two each way; every club gets at least its best and worst part
 const by=z.slice().sort((a,b)=>b.z-a.z),rv=by.slice().reverse();let str=by.filter(x=>x.z>=.5).slice(0,2),wk=rv.filter(x=>x.z<=-.5).slice(0,2);
 if(!str.length)str=[by[0]];if(!wk.length)wk=[rv[0]];
 const tag=x=>str.includes(x)?'up':wk.includes(x)?'dn':'';
 const rank=Lg.ovr.rank.indexOf(r.ovr)+1,tied=Lg.ovr.rank.filter(v=>v===r.ovr).length>1;
 const bars=z.map(x=>`<div class="trRow ${tag(x)}"><span class="trK">${x.n}</span><span class="trBar"><i style="width:${clamp((x.v-40)/55,0,1)*100}%;background:${rcol(x.v)}"></i></span><b style="color:${rcol(x.v)}">${x.v}</b><em>${tag(x)==='up'?'▲':tag(x)==='dn'?'▼':''}</em></div>`).join('');
 const list=(a,none)=>a.length?a.map(x=>x.n).join(', '):none;
 return `<div class="trTop"><div class="trOvr" style="border-color:${rcol(r.ovr)}"><b style="color:${rcol(r.ovr)}">${r.ovr}</b><span>OVR</span></div>
  <div class="trSum"><span>${tied?'T-':''}${ord(rank)} of ${ORDER.length} in the league</span><span class="up">▲ Strengths: ${list(str,'')}</span><span class="dn">▼ Weaknesses: ${list(wk,'')}</span></div></div>
  <div class="trBars">${bars}</div>`}
