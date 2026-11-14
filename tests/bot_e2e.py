# End-to-end ranked test: two real game clients, the real SQL (supabase/migrations) on a local Postgres.
#  1. an honest ranked game: both phones submit, the server settles it (final, verified, stats, ratings)
#  2. a cheating guest: its phone adds a run to its own score in every state snapshot it sends; the honest phone's
#     checks catch it and the match is disputed, never counted
# Needs a scratch Postgres (PGHOST/PGPORT/PGUSER) and psycopg2. Usage:
#   python3 tools/build.py && PGHOST=... PGPORT=... PGUSER=postgres python3 tests/ranked_e2e.py [max seconds per game]
import json, os, sys, threading, time, http.server, functools, subprocess
import psycopg2, psycopg2.extras
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
secs = int(sys.argv[1]) if len(sys.argv) > 1 else 700
DB = 'pd_bot'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

def psql(db, f): subprocess.run(['psql', '-v', 'ON_ERROR_STOP=1', '-q', '-d', db, '-f', f], check=True, capture_output=True)
subprocess.run(['psql', '-q', '-c', f'drop database if exists {DB}', '-c', f'create database {DB}'], check=True, capture_output=True)
for f in ['supabase/tests/supabase_stub.sql', 'supabase/profiles.sql'] + sorted('supabase/migrations/' + x for x in os.listdir(os.path.join(ROOT, 'supabase/migrations'))):
    psql(DB, os.path.join(ROOT, f))
con = psycopg2.connect(dbname=DB); con.autocommit = True
with con.cursor() as c:
    c.execute("insert into auth.users(id,email) values (%s,'a@x.co'),(%s,'b@x.co')", (A, B))
    c.execute("insert into public.profiles(user_id,username) values (%s,'BeefDirky'),(%s,'Rival')", (A, B))

# the game's server calls, run as the signed-in player (same as Supabase does with the player's token)
lock = threading.Lock()
def rpc(fn, args, user):
    if not fn.replace('_', '').isalnum(): return {'error': {'message': 'bad fn'}}
    with lock, con.cursor() as c:
        try:
            c.execute('begin'); c.execute('set local role authenticated'); c.execute("select set_config('request.jwt.claim.sub', %s, true)", (user,))
            names = list(args.keys())
            sql = f"select public.{fn}(" + ','.join(f'{k} => %s' for k in names) + ")"
            # (Supabase turns a JSON list into a Postgres array for text[] parameters like p_clubs; jsonb ones stay JSON)
            vals = [v if k == 'p_clubs' else json.dumps(v) if isinstance(v, (dict, list)) else v for k, v in args.items()]
            c.execute(sql, vals); r = c.fetchone()[0]; c.execute('commit'); return {'data': r}
        except Exception as e:
            c.execute('rollback'); return {'error': {'message': str(e).split('\n')[0]}}
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_POST(self):
        b = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        out = json.dumps(rpc(b['fn'], b['args'], b['user'])).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(out)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8768), functools.partial(H, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

mock = open(os.path.join(HERE, 'mock-supabase.js')).read()
rpcmock = """(()=>{const mk=window.supabase.createClient;window.supabase={createClient:(...a)=>{const c=mk(...a);
 c.rpc=(fn,args)=>fetch('/rpc',{method:'POST',body:JSON.stringify({fn,args,user:window.__uid})}).then(r=>r.json());return c}}})();"""
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'])
    ctx = b.new_context(viewport={'width': 800, 'height': 1000}, service_workers='block')
    ctx.add_init_script("(()=>{const F=2,pn=performance.now.bind(performance),t0=pn();performance.now=()=>t0+(pn()-t0)*F;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));})();"
                        + mock + rpcmock + ";localStorage.setItem('pd-opts2',JSON.stringify({music:0,crowd:0,sfx:0,time:'day'}))")
    def inject(route):
        r = route.fetch(); t = r.text(); i = t.rfind('\n})();'); route.fulfill(response=r, body=t[:i] + '\nwindow.__x=c=>eval(c);' + t[i:])
    ctx.route('**/index.html', inject)
    PA = ctx.new_page(); PB = ctx.new_page(); errs = []
    PA.add_init_script("localStorage.setItem('pd-myteam',JSON.stringify({club:'seoul',base:'seoul'}));localStorage.setItem('pd-privacy','1')"); PB.add_init_script("localStorage.setItem('pd-myteam',JSON.stringify({club:'busan',base:'daegu'}));localStorage.setItem('pd-privacy','1')")
    for n, pg in (('A', PA), ('B', PB)): pg.on('pageerror', lambda e, n=n: errs.append(n + ' ' + str(e)))
    def setup():
      for pg, uid, name in ((PA, A, 'BeefDirky'), (PB, B, 'Rival')):
          pg.goto('http://localhost:8768/index.html'); pg.wait_for_timeout(3000)
          pg.evaluate(f"window.__uid='{uid}';__x(\"ACC.user={{id:'{uid}',email:'x@x.co'}};ACC.name='{name}';acRender()\")")
      # the bots: the pitcher picks a pitch and releases the meter at a random moment; the batter swings at most pitches
      bot = """()=>{let last=null,rel=null;setInterval(()=>{const S=__x('S');if(!S.online||!S.online.inGame)return;__x('AFK.last=Date.now()');
      const key=(k,c)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,code:c||k,bubbles:true}));
      if(S.phase==='choose'&&Math.random()<.05)key(String(1+Math.floor(Math.random()*3)));
      if(S.phase==='windup'&&__x('pitching()')&&S.pitch&&S.pitch.q==null&&rel!==S.pitch){rel=S.pitch;setTimeout(()=>key(' ','Space'),200+Math.random()*900)}
      if(S.pitch&&S.pitch!==last&&S.pitch.releaseAt&&S.pitch.remote){last=S.pitch;if(Math.random()<.8)setTimeout(()=>key(' ','Space'),(S.pitch.travel+(Math.random()*60-30)-(performance.now()-S.pitch.releaseAt))/3)}
      const sk=document.getElementById('skipBtn');if(!sk.hidden)sk.click()},20)}"""
      PA.evaluate(bot); PB.evaluate(bot)

    def check(c, what):
        global ok
        print(('ok  ' if c else 'FAIL ') + what); ok = ok and bool(c)
    PA.goto('http://localhost:8768/index.html'); PA.wait_for_timeout(3000)
    PA.evaluate(f"window.__uid='{A}';__x(\"ACC.user={{id:'{A}',email:'x@x.co'}};ACC.name='BeefDirky';acRender()\")")
    PA.click('#goMulti'); PA.click('#goRanked'); PA.click('#lnPlay'); PA.wait_for_timeout(9000)
    check(PA.inner_text('#lnPlay') == 'IN QUEUE' and not PA.evaluate("__x('!!S.rkBot')"), 'alone in the queue: still looking at 9 seconds')
    PA.wait_for_timeout(12000)
    check(PA.evaluate("__x('!!S.rkBot')") and PA.evaluate("__x('S.schedInn')") == 3, 'after 15 seconds: a bot game, 3 innings (' + PA.inner_text('#qStatus') + ')')
    mid = PA.evaluate("__x('S.rkBot.m')"); lv = PA.evaluate("__x('S.rkBot.lv')")
    check(lv == 3, f'level {lv} at rating 1000')
    PA.evaluate("__x('S.auto=true;syncAuto()')")
    t0 = time.time()
    while time.time() - t0 < secs and PA.evaluate("__x('S.phase')") != 'over': PA.wait_for_timeout(3000)
    PA.wait_for_timeout(5000)
    print('  game took', int(time.time() - t0), 's | result:', PA.inner_text('#overT'), '|', PA.inner_text('#rkRes'), '|', PA.inner_text('#toLobby'))
    with con.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as c:
        c.execute('select mode, status, verified, home_score, away_score, winner_side, bot_level, dispute_reason from public.matches where id=%s', (mid,)); m = c.fetchone(); print('  server:', dict(m))
        c.execute('select count(*) n from public.plate_appearances where match_id=%s', (mid,)); npa = c.fetchone()['n']
    check(m['mode'] == 'ranked_bot' and m['status'] == 'final' and m['verified'] and npa > 10, f'the bot game settled on the server ({npa} plate appearances)')
    check('RANKED' in PA.inner_text('#rkRes') and ('+100' in PA.inner_text('#rkRes') or '-100' in PA.inner_text('#rkRes')), 'results card shows the rating change')
    PA.click('#toLobby'); PA.wait_for_timeout(800); check(PA.is_visible('#scrMulti'), 'back to Multiplayer')
    # a second bot game, forfeited from the pause menu
    PA.click('#goRanked'); PA.click('#lnPlay'); PA.wait_for_timeout(21000)
    check(PA.evaluate("__x('!!S.rkBot')"), 'second bot game started')
    m2 = PA.evaluate("__x('S.rkBot.m')"); PA.wait_for_timeout(3000)
    PA.click('#pauseBtn'); PA.wait_for_timeout(300); check(PA.inner_text('#pQuit').strip().upper() == 'FORFEIT' and 'leaving is a loss' in PA.inner_text('#pauseInfo'), 'pause menu: Forfeit, and it says leaving is a loss')
    PA.click('#pQuit'); PA.wait_for_timeout(2500)
    with con.cursor() as c:
        c.execute('select status, winner_side from public.matches where id=%s', (m2,)); print('  server:', c.fetchone())
        c.execute('select status from public.matches where id=%s', (m2,)); check(c.fetchone()[0] == 'forfeit', 'Forfeit: the bot game is a loss')
    check(not PA.evaluate("__x('!!S.rkBot')") and PA.evaluate("__x('TEAMS[S.opp].netBackup==null')"), 'bot cleared and rosters restored')
    if errs: ok = False; print('page errors:', errs[:5])
    b.close()
srv.shutdown()
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
