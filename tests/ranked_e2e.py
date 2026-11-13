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
DB = 'pd_e2e'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

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
            vals = [json.dumps(v) if isinstance(v, (dict, list)) else v for v in args.values()]
            c.execute(sql, vals); r = c.fetchone()[0]; c.execute('commit'); return {'data': r}
        except Exception as e:
            c.execute('rollback'); return {'error': {'message': str(e).split('\n')[0]}}
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_POST(self):
        b = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        out = json.dumps(rpc(b['fn'], b['args'], b['user'])).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(out)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8766), functools.partial(H, directory=ROOT))
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
    for n, pg in (('A', PA), ('B', PB)): pg.on('pageerror', lambda e, n=n: errs.append(n + ' ' + str(e)))
    def setup():
      for pg, uid, name in ((PA, A, 'BeefDirky'), (PB, B, 'Rival')):
          pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(3000)
          pg.evaluate(f"window.__uid='{uid}';__x(\"ACC.user={{id:'{uid}',email:'x@x.co'}};ACC.name='{name}';acRender()\")")
      # the bots: the pitcher picks a pitch and releases the meter at a random moment; the batter swings at most pitches
      bot = """()=>{let last=null,rel=null;setInterval(()=>{const S=__x('S');if(!S.online||!S.online.inGame)return;
      const key=(k,c)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,code:c||k,bubbles:true}));
      if(S.phase==='choose'&&Math.random()<.05)key(String(1+Math.floor(Math.random()*3)));
      if(S.phase==='windup'&&__x('pitching()')&&S.pitch&&S.pitch.q==null&&rel!==S.pitch){rel=S.pitch;setTimeout(()=>key(' ','Space'),200+Math.random()*900)}
      if(S.pitch&&S.pitch!==last&&S.pitch.releaseAt&&S.pitch.remote){last=S.pitch;if(Math.random()<.8)setTimeout(()=>key(' ','Space'),(S.pitch.travel+(Math.random()*60-30)-(performance.now()-S.pitch.releaseAt))/3)}
      const sk=document.getElementById('skipBtn');if(!sk.hidden)sk.click()},20)}"""
      PA.evaluate(bot); PB.evaluate(bot)

    def play(label, cheat=False):
        global ok
        setup()
        PA.click('#goMulti'); PA.click('#olCreate'); PA.wait_for_timeout(700); PA.click('#olPick [data-t=seoul]')
        code = PA.inner_text('#olCodeShow')
        PB.click('#goMulti'); PB.fill('#olCode', code); PB.click('#olJoin'); PB.wait_for_timeout(900); PB.click('#olPick [data-t=busan]'); PB.wait_for_timeout(600)
        PA.click('#olRk [data-v="1"]'); PA.click('#olInn [data-v="3"]'); PA.wait_for_timeout(800)
        print(label, '| A lobby:', PA.inner_text('#olRkNote'), '|', PA.inner_text('#olStatus'))
        if cheat:  # the guest's phone lies: one extra run for itself (away) in every snapshot it sends while pitching
            PB.evaluate("__x(\"const _ss=snapState;snapState=()=>{const z=_ss();if(pitching())z.t+=1;return z}\")")
        PA.click('#olGo'); PB.click('#olGo'); PA.wait_for_timeout(4000)
        if not (PA.evaluate("__x('onlineGame()')") and PB.evaluate("__x('onlineGame()')")):
            print('  ranked game did not start:', PA.inner_text('#olStatus'), '|', PB.inner_text('#olStatus')); ok = False; return None
        mid = PA.evaluate("__x('S.online.rk.m')"); print('  match', mid, 'started; ranked on both:', PA.evaluate("__x('S.online.ranked')"), PB.evaluate("__x('S.online.ranked')"))
        t0 = time.time()
        while time.time() - t0 < secs:
            PA.wait_for_timeout(3000)
            if PA.evaluate("__x('S.phase')") == 'over' and PB.evaluate("__x('S.phase')") == 'over': break
        PA.wait_for_timeout(6000)
        ra, rb = PA.inner_text('#rkRes'), PB.inner_text('#rkRes')
        print('  final screen A:', ra, '| B:', rb)
        print('  flags A:', PA.evaluate("__x('JSON.stringify(S.online.flags)')")[:200], '| B:', PB.evaluate("__x('JSON.stringify(S.online.flags)')")[:200])
        with con.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as c:
            c.execute('select status, verified, home_score, away_score, winner_side, dispute_reason from public.matches where id=%s', (mid,)); m = c.fetchone()
            c.execute('select count(*) n from public.plate_appearances where match_id=%s', (mid,)); npa = c.fetchone()['n']
        print('  server:', dict(m), '| plate appearances stored:', npa)
        return m, npa
    r1 = play('GAME 1 (honest)')
    if not r1 or r1[0]['status'] != 'final' or not r1[0]['verified'] or r1[1] < 10: ok = False; print('FAIL: honest ranked game was not settled')
    with con.cursor() as c:
        c.execute("select username, rating, wins, losses from public.leaderboard_ranked order by rank"); print('  leaderboard:', c.fetchall())
        c.execute("select user_id::text, pa, h, hr, so, outs_pitched from public.player_stats where mode='ranked_stock' and season_id=0 order by user_id"); print('  ranked lines:', c.fetchall())
    r2 = play('GAME 2 (guest cheats)', cheat=True)
    if not r2 or r2[0]['status'] != 'disputed': ok = False; print('FAIL: a doctored game was not disputed')
    if errs: ok = False; print('page errors:', errs[:5])
    b.close()
srv.shutdown()
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
