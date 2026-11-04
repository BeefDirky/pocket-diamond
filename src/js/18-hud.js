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
 $('abTeam').textContent=`${TEAMS[batKey()].name} · AT BAT`;$('pTeam').textContent=S.mode==='bp'&&S.phase!=='title'?'BATTING PRACTICE · ON THE MOUND':`${TEAMS[fldKey()].name} · PITCHING${pitching()?' (YOU)':''}`;
 const pit=pitching();$('actsBat').hidden=pit;$('actsPitch').hidden=!pit;if(pit){const A=arsOf(pitcher());for(const pb of document.querySelectorAll('#actsPitch .pbtn[data-k]')){const i=A.indexOf(pb.dataset.k);pb.hidden=i<0;if(i>=0)pb.querySelector('small').textContent=i+1}
  $('actsPitch').style.gridTemplateColumns=isWide()?'':`repeat(${A.length},1fr)`}$('muPit').classList.toggle('canPen',canPen());document.querySelector('.meter').hidden=pit;
 for(const pb of document.querySelectorAll('#actsPitch .pbtn'))pb.disabled=S.phase!=='choose';
 {const bg=document.querySelector('.bug'),pb=document.querySelector('.pcBox');if(bg&&pb){pb.style.top=(bg.offsetTop+bg.offsetHeight)+'px';pb.style.width=bg.offsetWidth+'px';pb.style.boxSizing='border-box'}}
 $('pcV').textContent=(S.pcOf&&S.pcOf[fldKey()])||0;$('bugInn').textContent=S.phase==='title'?'':`${S.mode==='full'&&S.half==='top'?'▲':'▼'}${S.inning}`;
 $('abName').textContent=`${((S.orderOf&&S.orderOf[batKey()])||0)+1}. #${b.no} ${b.name} · ${b.pos}`;
 $('abHand').innerHTML=(b.hand==='S'?`Switch (<b>${effHand(b)}</b>)`:`Bats <b>${b.hand}</b>`)+` · CON ${rb(b.con)} POW ${rb(b.pow)} SPD ${rb(b.spd)}`;
 $('pName').textContent=`#${p.no} ${p.name}`;
 if(S.mode==='bp'&&S.phase!=='title'){$('pName').textContent='PITCHING MACHINE';$('pHand').innerHTML=`Throwing <b>${S.bpPitch==='RND'?'RANDOM PITCHES':PITCHES[S.bpPitch||'FB'].name}</b> · ${S.bp.sw} swings · ${S.bp.hr} HR · longest <b>${S.bp.long}</b> ft`}else $('pHand').innerHTML=`Throws <b>${p.hand}</b>${p.slot==='side'?' (sidearm)':''}${p.type==='demon'?' · <b class="dmn">SPEED DEMON</b>':p.type==='knuckle'?' · <b class="knk">KNUCKLER</b>':''} · VEL ${rb(p.vel)} MOV ${rb(p.mov)} CTL ${rb(p.ctl)}`;
 const w=winOf(b),pc=v=>`${50-Math.min(v,180)/180*50}%`,z=document.querySelectorAll('.bar .z');
 [w,w*GOODK,w*PERFK].forEach((v,k)=>{z[k].style.left=z[k].style.right=pc(v)});
}
