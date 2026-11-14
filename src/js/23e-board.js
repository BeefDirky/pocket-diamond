// ---------- the leaderboard and player profiles ----------
// Everything here is read straight from the public views the server keeps (supabase/migrations/001_core.sql):
// leaderboard_ranked (verified ranked results only), player_stat_lines (every mode, labelled) and the public
// history of finished, verified matches. Nothing is written. Usernames are shown; account ids never are.
const LB={kind:'rating',sid:null,season:'',rows:[],tok:0};
const LB_KINDS={
 rating:{label:'RATING',val:r=>r.rating,sub:r=>`${r.wins}-${r.losses}`,order:[['rating',false],['wins',false]]},
 wins:{label:'WINS',val:r=>r.wins,sub:r=>`${r.games} games · ${pct(r.win_pct)}`,order:[['wins',false],['rating',false]]},
 hr:{label:'HOME RUNS',val:r=>r.hr,sub:r=>`${r.pa} PA`,order:[['hr',false],['rating',false]]},
 avg:{label:'AVERAGE',val:r=>avg3(r.avg),sub:r=>`${r.pa} PA · min 10`,order:[['avg',false],['pa',false]],min:10}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avg3=v=>v==null?'—':Number(v).toFixed(3).replace(/^0/,'');
const pct=v=>v==null?'—':Math.round(Number(v)*100)+'%';
const ipOf=o=>`${Math.floor(o/3)}${o%3?'.'+(o%3):''}`;
async function lbSeason(c){if(LB.sid)return LB.sid;const {data,error}=await c.from('seasons').select('id,name').eq('ladder','stock').eq('is_active',true).maybeSingle();
 if(error)throw error;if(!data)throw{message:'No ranked season is running.'};LB.sid=data.id;LB.season=data.name;return LB.sid}
function lbOpen(){showScreen('scrBoard');lbLoad(LB.kind)}
$('goBoard').addEventListener('click',()=>{ensureAudio();if(!supaOK()){$('mpNote').hidden=false;$('mpNote').textContent='Leaderboards are on pocketdiamond.imugilabs.com (they need the game server).';return}lbOpen()});
$('lbTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;for(const x of $('lbTabs').children)x.setAttribute('aria-pressed',String(x===b));lbLoad(b.dataset.k)});
async function lbLoad(kind){LB.kind=kind;const K=LB_KINDS[kind],tok=++LB.tok;$('lbMsg').textContent='Loading…';
 try{const c=await supaClient(),sid=await lbSeason(c);$('lbSeason').textContent=`${String(LB.season).toUpperCase()} · RANKED · ${K.label}`;
  let q=c.from('leaderboard_ranked').select('user_id,username,rank,rating,peak,games,wins,losses,win_pct,hr,pa,avg').eq('season_id',sid);
  if(K.min)q=q.gte('pa',K.min);for(const [col,asc] of K.order)q=q.order(col,{ascending:asc,nullsFirst:false});
  const {data,error}=await q.limit(100);if(error)throw error;if(tok!==LB.tok)return;LB.rows=data||[];
  const me=ACC.user&&ACC.user.id;
  $('lbList').innerHTML=LB.rows.map((r,i)=>`<li${r.user_id===me?' class="me"':''}><button type="button" data-u="${esc(r.user_id)}"><span class="lbRank">${i+1}</span><span class="lbName">${esc(r.username)}${r.user_id===me?'<i class="lbYou">YOU</i>':''}<small>${esc(K.sub(r))}</small></span><span class="lbVal">${esc(K.val(r))}</span></button></li>`).join('');
  $('lbMsg').textContent=LB.rows.length?'Tap a player for their profile.':kind==='avg'?'Nobody has 10 ranked plate appearances yet.':'No ranked games yet this season. Be the first: Multiplayer → Ranked.';
  // your own line, pinned on top (with your place even if you're outside the top 100)
  const mine=$('lbMe');mine.hidden=true;if(!me)return;
  let i=LB.rows.findIndex(r=>r.user_id===me),row=i>=0?LB.rows[i]:null,place=i>=0?i+1:null;
  if(!row){const r=await c.from('leaderboard_ranked').select('user_id,username,rank,rating,peak,games,wins,losses,win_pct,hr,pa,avg').eq('season_id',sid).eq('user_id',me).maybeSingle();
   if(tok!==LB.tok)return;row=r.data;if(row&&kind==='rating')place=row.rank}
  if(!row){const rt=await rpc('my_rating').catch(()=>null);if(tok!==LB.tok)return;
   mine.innerHTML=`<span class="lbRank">—</span><span class="lbName">${esc(ACC.name||'You')}<small>No ranked games yet this season</small></span><span class="lbVal">${rt?rt.rating:1000}<small>RATING</small></span>`;mine.dataset.u=me;mine.hidden=false;return}
  mine.innerHTML=`<span class="lbRank">${place||'100+'}</span><span class="lbName">${esc(row.username)}<i class="lbYou">YOU</i><small>${esc(K.sub(row))}</small></span><span class="lbVal">${esc(K.val(row))}<small>${K.label}</small></span>`;mine.dataset.u=me;mine.hidden=false}
 catch(e){if(tok!==LB.tok)return;$('lbList').innerHTML='';$('lbMe').hidden=true;$('lbMsg').textContent='Couldn’t load the leaderboard: '+rkErr(e)}}
$('lbList').addEventListener('click',e=>{const b=e.target.closest('button[data-u]');if(b)lbProfile(b.dataset.u)});
$('lbMe').addEventListener('click',()=>{if($('lbMe').dataset.u)lbProfile($('lbMe').dataset.u)});
// ---- a player's profile ----
const LB_MODE={ranked_stock:'Ranked',ranked_bot:'Ranked vs CPU',casual:'Custom 1v1',full:'Full game vs CPU',arcade:'Arcade',playoffs:'Playoffs'};
async function lbProfile(uid){const box=$('lbProf'),card=$('lbpCard');box.hidden=false;card.innerHTML='<p class="lbpEmpty">Loading…</p>';
 try{const c=await supaClient(),sid=await lbSeason(c);
  const [rk,lines,games]=await Promise.all([
   c.from('leaderboard_ranked').select('username,rank,rating,peak,games,wins,losses,win_pct').eq('season_id',sid).eq('user_id',uid).maybeSingle(),
   c.from('player_stat_lines').select('*').eq('user_id',uid),
   c.from('matches').select('id,home_user,away_user,home_club,away_club,home_score,away_score,winner_side,status,ended_at,mode,bot_level').in('mode',['ranked_stock','ranked_bot']).in('status',['final','forfeit']).or(`home_user.eq.${uid},away_user.eq.${uid}`).order('ended_at',{ascending:false}).limit(10)]);
  for(const r of [rk,lines,games])if(r.error)throw r.error;
  const L=lines.data||[],G=games.data||[];
  let name=(rk.data&&rk.data.username)||(L[0]&&L[0].username);
  if(!name){const p=await c.from('profiles').select('username').eq('user_id',uid).maybeSingle();name=p.data&&p.data.username}
  // opponents' names and this player's rating change in each game
  const opp=[...new Set(G.map(g=>g.home_user===uid?g.away_user:g.home_user).filter(Boolean))];
  const [pn,rh]=await Promise.all([opp.length?c.from('profiles').select('user_id,username').in('user_id',opp):{data:[]},
   G.length?c.from('rating_history').select('match_id,before,after').eq('user_id',uid).in('match_id',G.map(g=>g.id)):{data:[]}]);
  const nm=Object.fromEntries((pn.data||[]).map(p=>[p.user_id,p.username])),dr=Object.fromEntries((rh.data||[]).map(h=>[h.match_id,h.after-h.before]));
  const R=rk.data,me=ACC.user&&ACC.user.id===uid,seasonLine=L.find(l=>l.mode==='ranked_stock'&&l.season_id===sid);
  const kpi=(v,l)=>`<div><b>${esc(v)}</b><small>${l}</small></div>`;
  const bat=l=>`<tr><td>${esc(LB_MODE[l.mode]||l.mode)}</td><td>${l.games}</td><td>${l.wins}-${l.losses}</td><td>${l.pa}</td><td>${avg3(l.avg)}</td><td>${avg3(l.obp)}</td><td>${avg3(l.slg)}</td><td>${l.hr}</td><td>${l.so}</td></tr>`;
  const pit=l=>`<tr><td>${esc(LB_MODE[l.mode]||l.mode)}</td><td>${ipOf(l.outs_pitched)}</td><td>${l.ra9==null?'—':Number(l.ra9).toFixed(2)}</td><td>${l.so_pitched}</td><td>${l.bb_allowed}</td><td>${l.hr_allowed}</td></tr>`;
  const career=L.filter(l=>l.season_id===0).sort((a,b)=>(a.mode==='ranked_stock'?-1:0)-(b.mode==='ranked_stock'?-1:0));
  card.innerHTML=`<div class="lbpHead"><h2 id="lbpName">${esc(name||'Player')}${me?' <i class="lbYou">YOU</i>':''}</h2><span>${R?`#${R.rank} · ${esc(String(LB.season).toUpperCase())}`:'UNRANKED THIS SEASON'}</span></div>
   <div class="lbpKpis">${kpi(R?R.rating:1000,'RATING')}${kpi(R?R.peak:1000,'PEAK')}${kpi(R?`${R.wins}-${R.losses}`:'0-0','W-L')}${kpi(seasonLine?avg3(seasonLine.avg):'—','AVG')}</div>
   <h3>BATTING · CAREER</h3>${career.length?`<table class="lbpTbl"><thead><tr><th>MODE</th><th>G</th><th>W-L</th><th>PA</th><th>AVG</th><th>OBP</th><th>SLG</th><th>HR</th><th>SO</th></tr></thead><tbody>${career.map(bat).join('')}</tbody></table>`:'<p class="lbpEmpty">No games recorded yet.</p>'}
   ${career.some(l=>l.outs_pitched)?`<h3>PITCHING · CAREER</h3><table class="lbpTbl"><thead><tr><th>MODE</th><th>IP</th><th>RA/9</th><th>SO</th><th>BB</th><th>HR</th></tr></thead><tbody>${career.filter(l=>l.outs_pitched).map(pit).join('')}</tbody></table>`:''}
   <h3>LAST RANKED GAMES</h3>${G.length?`<ul class="lbpGames">${G.map(g=>{const side=g.home_user===uid?'home':'away',won=g.winner_side===side,o=side==='home'?g.away_user:g.home_user,
     us=side==='home'?g.home_score:g.away_score,them=side==='home'?g.away_score:g.home_score,d=dr[g.id];
     return`<li><b class="${won?'w':'l'}">${won?'W':'L'}</b><span>${g.status==='forfeit'?'forfeit':`${us??'?'}-${them??'?'}`} vs ${esc(o?nm[o]||'?':g.bot_level?'CPU · LV '+g.bot_level:'?')} <em>${new Date(g.ended_at).toLocaleDateString()}</em></span><span>${d==null?'':(d>=0?'+':'')+d}</span></li>`}).join('')}</ul>`:'<p class="lbpEmpty">No ranked games yet.</p>'}
   <p class="lbpEmpty">Vs-CPU and Custom lines are reported by the player's own game; only ranked results are verified.</p>
   <button class="mbtn lbpClose" type="button" id="lbpClose">Close</button>`;
  card.focus({preventScroll:true})}
 catch(e){card.innerHTML=`<p class="lbpEmpty">Couldn’t load this profile: ${esc(rkErr(e))}</p><button class="mbtn lbpClose" type="button" id="lbpClose">Close</button>`}}
$('lbProf').addEventListener('click',e=>{if(e.target===$('lbProf')||e.target.closest('#lbpClose'))$('lbProf').hidden=true});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('lbProf').hidden){$('lbProf').hidden=true;e.stopImmediatePropagation()}},true);// (only closes the profile, not the page under it)
