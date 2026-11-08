# Desync check: two simulated players play a 3-inning online game over a mock realtime channel
# (no Supabase needed). Fails if the two screens' play-by-play logs ever disagree, if the game
# doesn't end after the scheduled innings, or on any page error.
# Usage: python3 tools/build.py && python3 tests/desync.py [max seconds]
import subprocess,time,sys,json,os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));d=os.path.dirname(HERE)
secs=int(sys.argv[1]) if len(sys.argv)>1 else 700
mock=open(os.path.join(HERE,'mock-supabase.js')).read()
srv=subprocess.Popen(['python3','-m','http.server','8768','-d',d],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
ok=True
try:
 with sync_playwright() as p:
  exe='/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
  b=p.chromium.launch(executable_path=exe,args=['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
  ctx=b.new_context(viewport={'width':800,'height':1000},service_workers='block')
  ctx.add_init_script("(()=>{const F=3,pn=performance.now.bind(performance),t0=pn();performance.now=()=>t0+(pn()-t0)*F;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));})();"+mock+";localStorage.setItem('pd-opts2',JSON.stringify({music:0,crowd:0,sfx:0,time:'day'}));if(!localStorage.getItem('pd-cards')){const o={};for(let i=0;i<30;i++){o['bl:b'+i]=1;o['bl:p'+i]=1}localStorage.setItem('pd-cards',JSON.stringify({packs:0,owned:o,seen:{}}))}")
  A=ctx.new_page();B=ctx.new_page();errs=[]
  for n,pg in (('A',A),('B',B)):pg.on('pageerror',lambda e,n=n:errs.append(n+' '+str(e)))
  for pg in (A,B):pg.goto('http://localhost:8768/index.html#dbg')
  A.wait_for_timeout(4000)
  # the host signs two card players on its own phone only: the guest must learn them from the lobby
  A.click('#goSingle');A.click('[data-go=scrLineup]');A.wait_for_timeout(300)
  # new lineup screen: tap the player on the field (his card flips), flip a card in your tray, press SIGN IN on its back
  for slot in ('3','-1'):
   A.click('#cards .lfField .lfc[data-i="%s"]'%slot);A.click('#cards .lfTray .lfc.deck:not(.used)');A.wait_for_timeout(450);A.click('#cards .lfTray .lfc.flip [data-sign]');A.wait_for_timeout(200)
  A.evaluate("document.querySelector('#scrLineup .xClose').click()");A.evaluate("document.querySelector('#scrSingle .xClose').click()")
  A.click('#goMulti');A.click('#olCreate');A.wait_for_timeout(600);A.click('#olPick [data-t=seoul]')
  code=A.inner_text('#olCodeShow')
  B.click('#goMulti');B.fill('#olCode',code);B.click('#olJoin');B.wait_for_timeout(800)
  B.click('#olPick [data-t=seoul]');B.wait_for_timeout(300);print('same-club warning:',B.inner_text('#olStatus')[:70])
  B.evaluate("__pd.S.you='seoul'");B.click('#olPick [data-t=busan]');B.wait_for_timeout(800)
  print('A:',A.inner_text('#olStatus'),'| B:',B.inner_text('#olStatus'))
  A.click('#olInn [data-v="3"]')
  # ready-up: nobody is ready to begin with; one ready waits, both ready starts
  assert A.inner_text('#olGo').strip()=='READY' and B.inner_text('#olGo').strip()=='READY','someone started out ready'
  A.click('#olGo');A.wait_for_timeout(1200)
  print('host ready -> A:',A.inner_text('#olStatus'),'| B:',B.inner_text('#olStatus'))
  assert 'Waiting for opponent' in A.inner_text('#olStatus') and 'Opponent is ready' in B.inner_text('#olStatus'),'ready status wrong'
  assert not A.evaluate("__pd.S.online.inGame"),'started with only one player ready'
  A.click('#olGo');A.wait_for_timeout(800);assert 'Opponent is ready' not in B.inner_text('#olStatus'),'un-ready not shown';A.click('#olGo')
  B.click('#olGo');A.wait_for_timeout(1500)
  print('host lineup on guest phone:',B.evaluate("__pd.TEAMS.seoul.lineup[3].name+' / '+__pd.TEAMS.seoul.staff[0].name"),'| on host:',A.evaluate("__pd.TEAMS.seoul.lineup[3].name+' / '+__pd.TEAMS.seoul.staff[0].name"))
  assert A.evaluate("__pd.S.online.inGame") and B.evaluate("__pd.S.online.inGame"),'game did not start'
  bot="""()=>{let last=null;setInterval(()=>{const S=__pd.S;if(!S.online||!S.online.inGame)return;
   if(S.phase==='choose'&&Math.random()<.05){document.dispatchEvent(new KeyboardEvent('keydown',{key:String(1+Math.floor(Math.random()*3)),bubbles:true}))}
   if(S.pitch&&S.pitch!==last&&S.pitch.releaseAt&&S.pitch.remote){last=S.pitch;if(Math.random()<.8)setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true})),(S.pitch.travel+(Math.random()*50-25)-(performance.now()-S.pitch.releaseAt))/3)}
   const sk=document.getElementById('skipBtn');if(!sk.hidden)sk.click()},20)}"""
  A.evaluate(bot);B.evaluate(bot)
  st="JSON.stringify([__pd.S.inning,__pd.S.half,__pd.S.outs,__pd.S.runs,__pd.S.target,__pd.S.youLine,__pd.S.oppLine,__pd.S.phase])"
  t0=time.time();seen_clock=False;skip_vis=set()
  while time.time()-t0<secs:
    A.wait_for_timeout(3000)
    for n,pg in (('A',A),('B',B)):
      if pg.evaluate("!document.getElementById('clkS').hidden"):seen_clock=True
    if A.evaluate("__pd.S.phase")=='over' and B.evaluate("__pd.S.phase")=='over':break
  la=A.evaluate("[...document.getElementById('log').children].map(e=>e.textContent).reverse().join('\\n')");lb=B.evaluate("[...document.getElementById('log').children].map(e=>e.textContent).reverse().join('\\n')")
  # compare the shorter log against the other (one screen can be one play ahead)
  na,nb=la.count('\n'),lb.count('\n')
  sa=A.evaluate(st);sb=B.evaluate(st)
  print('A',sa);print('B',sb);print('plays',na,nb,'clock shown:',seen_clock)
  short,long_=(la,lb) if len(la)<=len(lb) else (lb,la)
  same= long_.startswith(short)
  print('logs consistent:',same)
  if not same: ok=False;print(la[:800]);print('---');print(lb[:800])
  if errs: ok=False;print('\n'.join(errs))
  if not (A.evaluate('__pd.S.phase')=='over' and B.evaluate('__pd.S.phase')=='over'): ok=False;print('game did not finish in time')
  elif A.evaluate('__pd.S.inning')<3 or (A.evaluate('__pd.S.inning')>3 and A.evaluate('__pd.S.youLine[2]+__pd.S.youLine[0]+__pd.S.youLine[1]')!=A.evaluate('__pd.S.oppLine[0]+__pd.S.oppLine[1]+__pd.S.oppLine[2]')): ok=False;print('inning count wrong')
  b.close()
finally: srv.kill()
print('PASS' if ok else 'FAIL');sys.exit(0 if ok else 1)
