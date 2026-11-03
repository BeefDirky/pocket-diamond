// ---------- ballparks ----------
const STADIUMS={
 seoul:{name:'HANGANG PARK',kname:'한강파크',dims:[325,375,400,375,325],grass:['#3c9f37','#48b142','#52ba4b'],mow:'check',
  seat:['#2d4f8e','#284783'],seatU:['#20386a','#1c315d'],pad:'#123c5c',pad2:'#0d2f49',wallFt:8,feature:'twin',net:true},
 busan:{name:'HARBOR FIELD',kname:'바다구장',dims:[318,352,392,352,318],grass:['#3a9a3c','#46ab46','#50b44f'],mow:'stripe',
  seat:['#b8552a','#a84c25'],seatU:['#2a4a7a','#24416c'],pad:'#1f6b3a',pad2:'#185a30',wallFt:12,feature:'ocean',bags:true},
 incheon:{name:'PORT YARD',kname:'항구야드',dims:[328,368,400,362,315],grass:['#3fa23c','#4cb447','#56bd50'],mow:'arc',
  seat:['#a8202a','#951c25'],seatU:['#3a3f47','#33373e'],pad:'#3a1e22',pad2:'#2c1619',wallFt:8,feature:'lawn',net:true},
 gwangju:{name:'MUDEUNG FIELD',kname:'무등필드',dims:[335,382,405,378,330],grass:['#389a3a','#44ab44','#4fb54d'],mow:'diag',
  seat:['#2f7a3f','#296d38'],seatU:['#c83c33','#b5352d'],pad:'#14402f',pad2:'#0e3324',wallFt:8,feature:'deck',net:true},
 daegu:{name:'HIVE PARK',kname:'하이브파크',dims:[325,372,400,372,325],grass:['#3a9c39','#46ad45','#50b64e'],mow:'check',
  seat:['#c9a227','#b59220'],seatU:['#2b2b30','#25252a'],pad:'#1b1b1f',pad2:'#111114',wallFt:8,feature:'honey',net:true},
 daejeon:{name:'RIVERSIDE PARK',kname:'갑천파크',dims:[325,360,400,355,315],grass:['#3fa23c','#4cb447','#56bd50'],mow:'stripe',
  seat:['#1f8a90','#1a7a80'],seatU:['#d9d4c5','#c9c3b3'],pad:'#0d4f57',pad2:'#083339',wallFt:8,feature:'pool',net:true},
 suwon:{name:'FORTRESS FIELD',kname:'화성필드',dims:[330,380,400,380,330],grass:['#389a3a','#44ab44','#4fb54d'],mow:'diag',
  seat:['#2a2a30','#232328'],seatU:['#b52025','#9f1c20'],pad:'#2a2a30',pad2:'#1d1d22',wallFt:8,feature:'fortress',net:true},
 changwon:{name:'PINE HILL PARK',kname:'솔언덕파크',dims:[324,370,400,370,324],grass:['#3c9f37','#48b142','#52ba4b'],mow:'arc',
  seat:['#3b2a78','#33246a'],seatU:['#c9a227','#b59220'],pad:'#2c1d5c',pad2:'#1c1240',wallFt:8,feature:'trees'},
 ulsan:{name:'WHALE BAY PARK',kname:'고래만파크',dims:[322,365,400,365,322],grass:['#3a9a3c','#46ab46','#50b44f'],mow:'wave',
  seat:['#3f86c4','#3878b0'],seatU:['#1b2f5e','#172851'],pad:'#14325a',pad2:'#0d2442',wallFt:10,feature:'whale',net:true},
 jeju:{name:'HALLA FIELD',kname:'한라필드',dims:[330,375,402,375,330],grass:['#3fa23c','#4cb447','#56bd50'],mow:'check',
  seat:['#e0781c','#c96b18'],seatU:['#2f7a3a','#296b33'],pad:'#2f2f33',pad2:'#202024',wallFt:8,feature:'orchard'},
};
// ---- player ratings: CON widens the timing window, POW adds exit velo and lift, SPD runs the bases, DEF powers the glove ----
const POSCODE=['P','C','1B','2B','3B','SS','LF','CF','RF'];
const ORDERPOS=['CF','2B','SS','1B','LF','3B','RF','DH','C'];
const ARCH={CF:[66,55,82,80],SS:[64,48,75,84],'2B':[72,45,70,74],'3B':[60,68,52,72],'1B':[62,80,40,60],LF:[62,72,58,58],RF:[60,74,60,66],C:[55,58,32,78],DH:[64,84,35,30]};
const SLOTADJ=[[8,-4,6],[6,0,2],[4,6,0],[0,10,-4],[0,5,-2],[0,0,0],[0,-2,0],[-2,-4,0],[-6,-6,0]];
function buildRosters(){
 for(const k of ORDER){const T=TEAMS[k];if(T.built)continue;T.built=true;const used=new Set();
  T.lineup=T.lineup.map((l,slot)=>{const name=l[0],hand=l[1];const r=mulberry32(hash(k+name));
   const pos=ORDERPOS[slot],a=ARCH[pos],adj=SLOTADJ[slot];const st=v=>clamp(Math.round(v+(r()*36-18)),20,99);
   let no;do{no=1+Math.floor(r()*89)}while(used.has(no));used.add(no);
   const thr=(pos==='1B'||pos==='LF'||pos==='RF'||pos==='DH')&&r()<.3?'L':'R';
   const pl={name,hand,thr,pos,no,con:st(a[0]+adj[0]),pow:st(a[1]+adj[1]),spd:st(a[2]+adj[2]),def:st(a[3])};
   if(r()<.3){const k2=['con','pow','spd','def'][Math.floor(r()*4)];pl[k2]=clamp(pl[k2]+16,20,99)}
   pl.bat=['#1c1c1f','#5a2a1e','#d9b07a'][Math.floor(r()*3)];
   return pl});
  const pr=mulberry32(hash(k+T.pitcher.name));const ps=v=>clamp(Math.round(v+(pr()*24-12)),35,99);
  let pno;do{pno=1+Math.floor(pr()*89)}while(used.has(pno));
  Object.assign(T.pitcher,{pos:'SP',no:pno,thr:T.pitcher.hand,vel:ps(78),mov:ps(72),ctl:ps(68),def:ps(60)});
  {const L=T.lineup,av=f=>L.reduce((a,p)=>a+p[f],0)/L.length,lift=(f,floor)=>{const d=Math.round(floor-av(f));if(d>0)for(const p of L)p[f]=clamp(p[f]+d,20,99)};
   lift('con',66);lift('pow',63);if(k==='daejeon'){for(const p of L){p.spd=clamp(p.spd+6,20,99);p.con=clamp(p.con+2,20,99)}}}
  T.staff=[T.pitcher].concat((T.pen||[]).map(rp=>{const rr=mulberry32(hash(k+rp.name));const q=v=>clamp(Math.round(v+(rr()*30-15)),35,99);
   let n;do{n=1+Math.floor(rr()*89)}while(used.has(n));used.add(n);
   return{...rp,pos:'RP',no:n,thr:rp.hand,vel:q(rp.slot==='side'?72:84),mov:q(rp.slot==='side'?84:70),ctl:q(66),def:q(55)}}));
  // speed demons: every club has one flamethrowing reliever, a few clubs start one too
  const hk=hash(k+'demon');
  const dm=T.staff.filter(x=>x.pos==='RP'&&x.slot!=='side').pop();if(dm){dm.type='demon';dm.vel=Math.max(dm.vel,92+hk%7);dm.ctl=Math.min(dm.ctl,70)}
  if(hk%3===0){T.pitcher.type='demon';T.pitcher.vel=Math.max(T.pitcher.vel,90+hk%6)}
  // knuckleballers: rare, only three in the league
  if(['busan','daejeon','changwon'].includes(k)){const kn=T.staff.find(x=>x.pos==='RP'&&!x.type);if(kn){kn.type='knuckle';kn.vel=Math.min(kn.vel,62);kn.mov=Math.max(kn.mov,88)}}
 }
}
const ovr=p=>(p.pos==='SP'||p.pos==='RP')?Math.round(p.vel*.4+p.mov*.35+p.ctl*.25):Math.round(p.con*.3+p.pow*.3+p.spd*.15+p.def*.25);
const spdFt=w=>19+((w&&w.spd)||60)*.1;
const PITCHES={
 FB:{name:'FASTBALL',w:50,ms:[500,560],mph:[99,94.5],zone:.62,trail:'#bfe3ff',tl:18},
 SL:{name:'SLIDER',w:28,ms:[640,700],mph:[88,84],zone:.48,trail:'#ff7a66',tl:26},
 CH:{name:'CHANGEUP',w:22,ms:[730,800],mph:[85,81],zone:.5,trail:'#ffd36b',tl:14},
 SP:{name:'SPLITTER',w:12,ms:[580,630],mph:[91,87],zone:.22,trail:'#ffd36b',tl:18},
 KN:{name:'KNUCKLEBALL',w:0,ms:[800,880],mph:[78,71],zone:.46,trail:'#c9a6ff',tl:22},
};
const SKINS=['#f1c7a1','#e0a97e','#c68a5e','#9a6440','#6e4529'];
const isKoreanName=n=>/^[A-Z]+ [A-Z]\.[A-Z]\.$/.test(n||'');
const skinOf=n=>isKoreanName(n)?(hash(n)%3===0?'#f6d2b0':SKINS[hash(n)%2]):SKINS[hash(n||'')%SKINS.length];
const CREAM='#f4f1e8',INK='#1b1f24';

