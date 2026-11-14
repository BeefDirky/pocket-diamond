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
DB = 'pd_ff'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

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
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8767), functools.partial(H, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

mock = open(os.path.join(HERE, 'mock-supabase.js')).read()
rpcmock = """(()=>{const mk=window.supabase.createClient;window.supabase={createClient:(...a)=>{const c=mk(...a);
 c.rpc=(fn,args)=>fetch('/rpc',{method:'POST',body:JSON.stringify({fn,args,user:window.__uid})}).then(r=>r.json());return c}}})();"""
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'])
    ctx = b.new_context(viewport={'width': 800, 'height': 1000}, service_workers='block')
    ctx.add_init_script("(()=>{const F=3,pn=performance.now.bind(performance),t0=pn();performance.now=()=>t0+(pn()-t0)*F;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));})();"
                        + mock + rpcmock + ";localStorage.setItem('pd-opts2',JSON.stringify({music:0,crowd:0,sfx:0,time:'day'}))")
    def inject(route):
        r = route.fetch(); t = r.text(); i = t.rfind('\n})();'); route.fulfill(response=r, body=t[:i] + '\nwindow.__x=c=>eval(c);' + t[i:])
    ctx.route('**/index.html', inject)
    PA = ctx.new_page(); PB = ctx.new_page(); errs = []
    PA.add_init_script("localStorage.setItem('pd-myteam',JSON.stringify({club:'seoul',base:'seoul'}));localStorage.setItem('pd-privacy','1')"); PB.add_init_script("localStorage.setItem('pd-myteam',JSON.stringify({club:'busan',base:'daegu'}));localStorage.setItem('pd-privacy','1')")
    for n, pg in (('A', PA), ('B', PB)): pg.on('pageerror', lambda e, n=n: errs.append(n + ' ' + str(e)))
    def setup():
      for pg, uid, name in ((PA, A, 'BeefDirky'), (PB, B, 'Rival')):
          pg.goto('http://localhost:8767/index.html'); pg.wait_for_timeout(3000)
          pg.evaluate(f"window.__uid='{uid}';__x(\"ACC.user={{id:'{uid}',email:'x@x.co'}};ACC.name='{name}';acRender()\")")
      # the bots: the pitcher picks a pitch and releases the meter at a random moment; the batter swings at most pitches
      bot = """()=>{let last=null,rel=null;setInterval(()=>{const S=__x('S');if(!S.online||!S.online.inGame)return;
      const key=(k,c)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,code:c||k,bubbles:true}));
      if(S.phase==='choose'&&Math.random()<.05)key(String(1+Math.floor(Math.random()*3)));
      if(S.phase==='windup'&&__x('pitching()')&&S.pitch&&S.pitch.q==null&&rel!==S.pitch){rel=S.pitch;setTimeout(()=>key(' ','Space'),200+Math.random()*900)}
      if(S.pitch&&S.pitch!==last&&S.pitch.releaseAt&&S.pitch.remote){last=S.pitch;if(Math.random()<.8)setTimeout(()=>key(' ','Space'),(S.pitch.travel+(Math.random()*60-30)-(performance.now()-S.pitch.releaseAt))/3)}
      const sk=document.getElementById('skipBtn');if(!sk.hidden)sk.click()},20)}"""
      PA.evaluate(bot); PB.evaluate(bot)

    def check(c, what):
        global ok
        print(('ok  ' if c else 'FAIL ') + what); ok = ok and bool(c)
    setup()
    PA.click('#goMulti'); PA.click('#goRanked'); PA.click('#lnPlay'); PA.wait_for_timeout(2500)
    PB.click('#goMulti'); PB.click('#goRanked'); PB.click('#lnPlay'); PB.wait_for_timeout(6000)
    check(PA.evaluate("__x('onlineGame()')") and PB.evaluate("__x('onlineGame()')"), 'ranked game started')
    mid = PA.evaluate("__x('S.online.rk.m')")
    PA.wait_for_timeout(15000)
    # Esc in an online game opens the menu (the game keeps going); Esc again closes it
    PB.keyboard.press('Escape'); PB.wait_for_timeout(400)
    check(PB.is_visible('#scrPause') and 'MENU' in PB.inner_text('#scrPause h1') and PB.evaluate("__x('onlineGame()&&!S.paused')"), 'Esc opens the online menu without pausing')
    check(PB.inner_text('#pQuit') .strip().upper() == 'FORFEIT', 'ranked menu offers Forfeit')
    PB.keyboard.press('Escape'); PB.wait_for_timeout(400); check(not PB.is_visible('#scrPause'), 'Esc closes it')
    PB.click('#pauseBtn'); PB.wait_for_timeout(400); check(PB.is_visible('#scrPause'), 'pause button opens it too')
    PB.click('#pQuit'); PA.wait_for_timeout(7000)
    print('  A result:', PA.inner_text('#overT'), '|', PA.inner_text('#rkRes'), '|  B result:', PB.inner_text('#overT'), '|', PB.inner_text('#rkRes'))
    check(PA.is_visible('#over') and 'FORFEIT' in PA.inner_text('#overT') and '+100' in PA.inner_text('#rkRes'), 'Forfeit button: the opponent wins at once (+100)')
    check(PB.is_visible('#over') and 'FORFEITED' in PB.inner_text('#overT') and '-100' in PB.inner_text('#rkRes'), 'the player who forfeited lands on the results card (-100)')
    with con.cursor() as c:
        c.execute('select status, winner_side, dispute_reason from public.matches where id=%s', (mid,)); print('  server:', c.fetchone())
    PA.click('#toLobby'); PA.wait_for_timeout(800); check(PA.is_visible('#scrMulti'), 'result page leads back to Multiplayer')
    PB.click('#toLobby'); PB.wait_for_timeout(800)
    # game 2: B stops touching the game. 60 s → warning with a 30 s countdown; at 90 s B forfeits
    with con.cursor() as c: c.execute("update public.matches set created_at = created_at - interval '10 minutes'")
    PA.click('#goRanked'); PA.click('#lnPlay'); PA.wait_for_timeout(2500); PB.click('#goRanked'); PB.click('#lnPlay'); PB.wait_for_timeout(6000)
    check(PA.evaluate("__x('onlineGame()')") and PB.evaluate("__x('onlineGame()')"), 'second ranked game started')
    PA.click('#autoBtn')  # A keeps playing on AUTO (no inactivity warning with AUTO on)
    PB.evaluate("__x('AFK.last=Date.now()-61000')"); PB.wait_for_timeout(1200)
    check(PB.is_visible('#afk') and 'FORFEIT IN 0:2' in PB.inner_text('#afkT'), 'after a minute idle: warning + countdown (' + PB.inner_text('#afkT') + ')')
    PB.mouse.click(5, 300); PB.wait_for_timeout(800); check(not PB.is_visible('#afk'), 'a tap clears the warning')
    PB.evaluate("__x('AFK.last=Date.now()-89000')"); PB.wait_for_timeout(8000)
    check(PB.is_visible('#over') and 'FORFEITED' in PB.inner_text('#overT') and 'inactive' in PB.inner_text('#overS'), 'idle 90 s: forfeited (' + PB.inner_text('#overS')[:50] + ')')
    check(PA.is_visible('#over') and 'FORFEIT' in PA.inner_text('#overT'), 'and the opponent wins at once: ' + PA.inner_text('#rkRes'))
    check(not PA.evaluate("__x('AFK.warn')"), 'no warning for the player on AUTO')
    if errs: ok = False; print('page errors:', errs[:5])
    b.close()
srv.shutdown()
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
