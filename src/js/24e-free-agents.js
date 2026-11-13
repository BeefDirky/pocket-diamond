// ---------- the Free Agent set: general players who belong to no club ----------
// The cards you pull are free agents, not players lifted off the ten clubs' rosters (those stay with their clubs and are
// never in packs). 90 hitters (ten at each spot in the order's positions) and 50 pitchers, generated once from a fixed seed,
// so every phone has the same pool and an online roster spec can name a card by id. Cards wear a plain kit and a
// free-agent badge instead of a club's colours and logo; on the field a signed free agent wears your club's uniform.
const FA_SUR=['KIM','LEE','PARK','CHOI','JUNG','KANG','CHO','YOON','JANG','LIM','HAN','OH','SEO','SHIN','KWON','HWANG','AHN','SONG','YOO','HONG','JEON','KO','MOON','YANG','SON','BAE','BAEK','HEO','NAM','SIM','NOH','HA','KWAK','SUNG','CHA','JOO','WOO','MIN','RYU','NA','JIN','EOM','CHAE','WON','BANG','GONG','HYUN','PYO','DO','YEO'];
const FA_FOR=['ALVARADO','BECKETT','CASTILLO','DUVAL','ESPINOZA','FLETCHER','GRANGER','HOLLOWAY','IBARRA','JANSEN','KESSLER','LOMBARDI','MORENO','NAKAMURA','OKAFOR','PRESCOTT','QUINTANA','RAMIREZ','SAWYER','TOLLIVER','VARGAS','WHITLOCK','YAMADA','ZELLER'];
const FA_KIT={jersey:'#3a4652',cap:'#232b33',city:'FREE AGENT'};
const FA_POS=['C','1B','2B','3B','SS','LF','CF','RF','DH'];
function buildFreeAgents(){const rr=mulberry32(20261113),out=[],used=new Set();
 // names: never the same as anyone on a club roster
 for(const k of ORDER){const T=TEAMS[k];for(const p of[...T.lineup,...(T.staff||[])])if(p)used.add(p.name)}
 const L='ABCDEGHJKMSWY',name=()=>{let n,i=0;do{n=rr()<.15?FA_FOR[(rr()*FA_FOR.length)|0]:`${FA_SUR[(rr()*FA_SUR.length)|0]} ${L[(rr()*L.length)|0]}.${L[(rr()*L.length)|0]}.`;i++}while(used.has(n)&&i<50);used.add(n);return n};
 const st=v=>clamp(Math.round(v),20,99),q=()=>Math.pow(rr(),1.5);// most free agents are role players; a few are stars
 let no=0;const num=()=>{no=(no%98)+1+((rr()*3)|0);return no%99+1};
 FA_POS.forEach((pos,pi)=>{const a=ARCH[pos==='DH'?'DH':pos];for(let i=0;i<10;i++){const u=q(),b=u*26-8,n=()=>(rr()*20-10);
  const p={name:name(),hand:rr()<.32?'L':rr()<.06?'S':'R',thr:'R',pos,no:num(),con:st(a[0]+b+n()),pow:st(a[1]+b+n()),spd:st(a[2]+b*.6+n()),def:st(a[3]+b*.7+n())};
  if(p.hand==='S')p.hand='R';if((pos==='1B'||pos==='LF'||pos==='RF'||pos==='DH')&&rr()<.3)p.thr='L';
  if(rr()<.3){const k=['con','pow','spd','def'][(rr()*4)|0];p[k]=st(p[k]+14)}// one standout tool
  p.bat=['#1c1c1f','#5a2a1e','#d9b07a'][(rr()*3)|0];out.push({id:'fa:b'+(pi*10+i),set:'fa',T:FA_KIT,pit:false,p})}});
 for(let j=0;j<50;j++){const sp=j<20,u=q(),b=u*26-8,n=()=>(rr()*20-10),hand=rr()<.3?'L':'R';
  const p={name:name(),hand,thr:hand,pos:sp?'SP':'RP',no:num(),vel:st((sp?80:83)+b+n()),mov:st(68+b+n()),ctl:st((sp?68:62)+b+n()),def:null,slot:rr()<.18?'side':'over'};
  if(!sp&&j%13===4){p.type='knuckle';p.vel=Math.min(p.vel,62);p.mov=Math.max(p.mov,88)}else if(!sp&&j%17===8){p.type='demon';p.vel=Math.max(p.vel,95)}
  out.push({id:'fa:p'+j,set:'fa',T:FA_KIT,pit:true,p})}
 return out}
// the badge in the corner of a free agent's card: the position on a plain diamond
const FA_LOGO={};
function faLogo(c){const key=c.pit?(c.p.pos||'P'):c.p.pos;if(FA_LOGO[key])return FA_LOGO[key];const cv=document.createElement('canvas');cv.width=cv.height=32;const g=cv.getContext('2d');
 g.fillStyle='#1b1f24';g.beginPath();g.moveTo(16,1);g.lineTo(31,16);g.lineTo(16,31);g.lineTo(1,16);g.closePath();g.fill();
 g.fillStyle='#f4f1e8';g.beginPath();g.moveTo(16,4);g.lineTo(28,16);g.lineTo(16,28);g.lineTo(4,16);g.closePath();g.fill();
 g.fillStyle='#1b1f24';g.font='bold 10px "Pixelify Sans", monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(key,16,17);return FA_LOGO[key]=cv.toDataURL()}
const cardLogo=c=>c.set==='bl'?blLogo(c.code):c.set==='fa'?faLogo(c):LOGO_URL[c.k];
// ---- one-time: cards from the old club-roster set become free agents of the same rarity and kind ----
// counts and levels carry over; a signing of an old card points at its replacement
function migrateCards(){if(COL.mig>=1)return;const map={};
 const old=Object.keys(COL.owned).filter(id=>!/^(fa|bl):/.test(id));
 for(const id of old){const c=CARD_BY[id];if(!c){delete COL.owned[id];continue}
  const pool=CARDS.filter(x=>x.set==='fa'&&x.pit===c.pit&&x.r===c.r),alt=CARDS.filter(x=>x.set==='fa'&&x.pit===c.pit),P=pool.length?pool:alt;
  const nc=P[hash(id+'mig')%P.length];map[id]=nc.id;COL.owned[nc.id]=(COL.owned[nc.id]|0)+(COL.owned[id]|0);delete COL.owned[id];
  if(COL.lv[id]){const L=COL.lv[nc.id]=COL.lv[nc.id]||{};for(const k in COL.lv[id])L[k]=(L[k]|0)+COL.lv[id][k];delete COL.lv[id]}}
 for(const k in SIGN)for(const slot in SIGN[k]){const id=SIGN[k][slot];if(map[id])SIGN[k][slot]=map[id];else if(!/^(fa|bl):/.test(id))delete SIGN[k][slot]}
 COL.mig=1;saveCol();saveSign()}
