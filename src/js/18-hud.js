// the player line in the at-bat / pitching boxes: the club's logo, then the name
function muSet(id,k,txt,tags){const el=$(id);el.textContent='';const box=el.closest('.mu');if(box){box.style.setProperty('--tc',TEAMS[k].jersey);box.style.setProperty('--tc2',TEAMS[k].cap)}
 if(LOGO_URL[k]){const lb=document.createElement('span');lb.className='muLogo';const im=document.createElement('img');im.src=LOGO_URL[k];im.alt=TEAMS[k].name;lb.appendChild(im);el.appendChild(lb)}
 const nm=document.createElement('span');nm.className='muNm';nm.textContent=txt;el.appendChild(nm);
 for(const t of tags||[])if(t){const sp=document.createElement('span');sp.className='muTag';sp.textContent=t;el.appendChild(sp)}}
// a row of stat cells like a broadcast graphic: small label over a big value
const muStats=L=>`<span class="muStats">${L.map(([k,v])=>`<span class="muSt"><i>${k}</i>${v}</span>`).join('')}</span>`;
// ---------- HUD ----------
function banner(t,s,tone){if(OPT.info===false&&['windup','pitch','play','call','result'].includes(S.phase))return;$('bt').textContent=t;$('bs').textContent=s||'';$('banner').dataset.tone=tone||'';$('banner').hidden=false}
function hideBanner(){$('banner').hidden=true}
function showTiming(err){
 const a=Math.abs(err);
 const label=a<=WIN*PERFK?'PERFECT':a<=WIN*GOODK?'GOOD':a<=WIN?(err<0?'EARLY':'LATE'):(err<0?'WAY EARLY':'WAY LATE');
 $('tRead').textContent=`${label} ${err>0?'+':''}${Math.round(err)}ms`;
 const mk=$('mk');mk.hidden=false;mk.style.left=`${50+clamp(err,-180,180)/180*50}%`;
}
function logPA(b,desc,good){
 const li=document.createElement('li');
 li.innerHTML=`<span class="inn">${S.mode==='full'?(S.half==='top'?'▲':'▼'):''}${ord(S.inning)}</span><span><span class="who"></span> <span class="what${good?' h':''}"></span></span>`;
 li.querySelector('.who').textContent=b.name;li.querySelector('.what').textContent=desc;
 const log=$('log');const empty=log.querySelector('.empty');if(empty)empty.remove();
 log.prepend(li);while(log.children.length>14)log.lastChild.remove();
}
function bulbs(id,n,on,cls){$(id).innerHTML=Array.from({length:n},(_,i)=>`<i class="bulb ${cls}${i<on?' on':''}"></i>`).join('')}
function updateHUD(){document.body.classList.toggle('bpMode',S.mode==='bp'&&S.phase!=='title');
 const you=TEAMS[S.you],opp=TEAMS[S.opp],n=S.totalInn;
 const started=S.phase!=='title';
 let h='<tr><th></th>';for(let i=0;i<n;i++)h+=`<th>${i+1}</th>`;h+='<th>R</th><th>H</th><th>E</th></tr>';
 h+=`<tr><td class="tname"><img alt="" src="${LOGO_URL[S.opp]}"><span title="${opp.city} ${opp.name}">${ABBR[S.opp]}</span></td>`;
 for(let i=0;i<n;i++){const sh=started&&(S.mode==='arcade'||i<S.inning);const cur=S.mode==='full'&&i===S.inning-1&&S.half==='top'&&S.phase!=='over';h+=`<td class="${cur?'now':''}">${sh?(S.oppLine[i]??0):''}</td>`}
 h+=`<td class="tot">${started?S.target:''}</td><td>${started?S.oppHits:''}</td><td>${started?(S.errs||0):''}</td></tr>`;
 h+=`<tr><td class="tname"><img alt="" src="${LOGO_URL[S.you]}"><span title="${you.city} ${you.name}">${ABBR[S.you]}</span></td>`;
 for(let i=0;i<n;i++){const cur=i===S.inning-1&&S.half==='bot'&&S.phase!=='over';const shown=started&&(i<S.inning-1||(i===S.inning-1&&S.half==='bot'));h+=`<td class="${cur&&started?'now':''}">${shown?S.youLine[i]:''}</td>`}
 h+=`<td class="tot">${started?S.runs:''}</td><td>${started?S.hits:''}</td><td>${started?S.myErrs:''}</td></tr>`;
 $('line').innerHTML=h;
 {const setSc=(id,k,runs)=>{const el=$(id);el.style.setProperty('--c',TEAMS[k].jersey);el.querySelector('span').textContent=ABBR[k];el.querySelector('b').textContent=started?runs:'';el.classList.toggle('up',started&&batKey()===k)};
  setSc('bsA',S.opp,S.target);setSc('bsH',S.you,S.runs)}
 bulbs('lb',3,S.balls,'b');bulbs('ls',2,S.strikes,'s');bulbs('lo',2,Math.min(2,S.outs),'o');
 const hrTrot=S.phase==='play'&&S.play&&S.play.hrFired;
 for(let k=1;k<=3;k++)if(!S.baseChase)$('d'+k).classList.toggle('on',!hrTrot&&!!S.bases[k-1]);
 const b=curBatter(),p=pitcher();
 $('abTeam').textContent='AT BAT';$('pTeam').textContent=S.mode==='bp'&&S.phase!=='title'?'BATTING PRACTICE':`PITCHING${pitching()?' (YOU)':''}`;
 const pit=pitching();$('actsBat').hidden=pit;$('actsPitch').hidden=!pit;if(pit){const A=arsOf(pitcher());for(const pb of document.querySelectorAll('#actsPitch .pbtn[data-k]')){const i=A.indexOf(pb.dataset.k);pb.hidden=i<0;if(i>=0)pb.querySelector('small').textContent=i+1}
  $('actsPitch').style.gridTemplateColumns=isWide()?'':`repeat(${A.length},1fr)`}$('muPit').classList.toggle('canPen',canPen());document.querySelector('.meter').hidden=pit;
 for(const pb of document.querySelectorAll('#actsPitch .pbtn'))pb.disabled=S.phase!=='choose';
 {const bg=document.querySelector('.bug'),pb=document.querySelector('.pcBox');if(bg&&pb){pb.style.top=(bg.offsetTop+bg.offsetHeight)+'px';pb.style.width=bg.offsetWidth+'px';pb.style.boxSizing='border-box'}}
 $('pcV').textContent=(S.pcOf&&S.pcOf[fldKey()])||0;$('bugInn').textContent=S.phase==='title'?'':`${S.mode==='full'&&S.half==='top'?'▲':'▼'}${S.inning}`;
 muSet('abName',batKey(),b.name,[b.pos,`#${b.no}`,`${ord(((S.orderOf&&S.orderOf[batKey()])||0)+1).toUpperCase()} UP`]);
 $('abHand').innerHTML=muStats([[b.hand==='S'?'SWITCH':'BATS',`<b>${b.hand==='S'?effHand(b):b.hand}</b>`],['CON',rb(b.con)],['POW',rb(b.pow)],['SPD',rb(b.spd)]]);
 muSet('pName',fldKey(),p.name,[`#${p.no}`,p.slot==='side'?'SIDEARM':'']);
 if(S.mode==='bp'&&S.phase!=='title'){$('pName').textContent='PITCHING MACHINE';$('pHand').innerHTML=`Throwing: <button type="button" class="bpPick" id="bpPickBtn">${S.bpPitch==='RND'?'RANDOM':PITCHES[S.bpPitch||'FB'].name}<i>▾</i></button><span class="bpStat">${S.bp.sw} swings <i class=muSep></i> ${S.bp.hr} HR <i class=muSep></i> longest <b>${S.bp.long}</b> ft</span>`}else $('pHand').innerHTML=muStats([['THROWS',`<b>${p.hand}</b>`],['VEL',rb(p.vel)],['MOV',rb(p.mov)],['CTL',rb(p.ctl)]])+(p.type==='demon'?'<span class="muTag dmn">SPEED DEMON</span>':p.type==='knuckle'?'<span class="muTag knk">KNUCKLER</span>':'');
 const w=winOf(b),pc=v=>`${50-Math.min(v,180)/180*50}%`,z=document.querySelectorAll('.bar .z');
 [w,w*GOODK,w*PERFK].forEach((v,k)=>{z[k].style.left=z[k].style.right=pc(v)});
}
// line score peek: hover the top strip on a computer, tap it on a phone (stays down a few seconds)
{let hideT=0;const show=ms=>{document.body.classList.add('lsShow');clearTimeout(hideT);if(ms)hideT=setTimeout(()=>document.body.classList.remove('lsShow'),ms)};
 const hot=$('lsHot'),bd=document.querySelector('.app>.board'),fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
 hot.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.pointerType==='mouse'&&fine)return;document.body.classList.contains('lsShow')?document.body.classList.remove('lsShow'):show(4000)});
 for(const el of[hot,bd]){el.addEventListener('mouseenter',()=>{if(fine)show(0)});el.addEventListener('mouseleave',()=>{if(fine){clearTimeout(hideT);hideT=setTimeout(()=>document.body.classList.remove('lsShow'),350)}})}
 bd.addEventListener('pointerdown',e=>e.stopPropagation())}
