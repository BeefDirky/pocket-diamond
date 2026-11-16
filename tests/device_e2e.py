# (adapted from the ranked test's harness)
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
DB = 'pd_dev'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

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
            if fn in ('friends_list', 'friend_invites_inbox'):   # (a table function: Supabase returns its rows as a JSON list)
                sql = f"select coalesce(json_agg(t), '[]'::json) from public.{fn}(" + ','.join(f'{k} => %s' for k in names) + ") t"
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
    def mkctx():
        ctx = b.new_context(viewport={'width': 800, 'height': 1000}, service_workers='block')
        ctx.add_init_script("(()=>{const F=3,pn=performance.now.bind(performance),t0=pn();performance.now=()=>t0+(pn()-t0)*F;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));})();"
                            + mock + rpcmock + ";localStorage.setItem('pd-opts2',JSON.stringify({music:0,crowd:0,sfx:0,time:'day'}))")
        ctx.route('**/index.html', inject); return ctx
    def inject(route):
        r = route.fetch(); t = r.text(); i = t.rfind('\n})();'); route.fulfill(response=r, body=t[:i] + '\nwindow.__x=c=>eval(c);' + t[i:])
    ca, cb = mkctx(), mkctx(); PA = ca.new_page(); PB = cb.new_page(); errs = []
    for n, pg in (('A', PA), ('B', PB)):
        pg.on('pageerror', lambda e, n=n: errs.append(n + ' ' + str(e)))
        pg.add_init_script("localStorage.setItem('pd-privacy','1');localStorage.setItem('pd-how','1');localStorage.setItem('pd-myteam',JSON.stringify({club:'seoul',base:'seoul'}))")
    def check(c, what):
        global ok
        print(('ok  ' if c else 'FAIL ') + what); ok = ok and bool(c)
    def signin(pg):
        pg.evaluate(f"window.__uid='{A}';__x(\"ACC.user={{id:'{A}',email:'x@x.co'}};ACC.name='BeefDirky';acRender()\")")
    PA.goto('http://localhost:8767/index.html'); PA.wait_for_timeout(2500); signin(PA); PA.wait_for_timeout(3000)
    check(PA.evaluate("__x('DV.state')") == 'ok' and PA.evaluate("document.getElementById('devGate').hidden"), 'the first device takes the account quietly')
    PB.goto('http://localhost:8767/index.html'); PB.wait_for_timeout(2500); signin(PB); PB.wait_for_timeout(3000)
    check(PB.is_visible('#devGate') and 'ACCOUNT IN USE' in PB.text_content('#dgHead'), 'the second device asks first: ' + PB.text_content('#dgTxt'))
    check('Chrome' in PB.text_content('#dgTxt'), 'and names the other device')
    check(PB.evaluate("__x('DV.lock')"), 'and doesn\'t save to the account while it asks')
    PB.click('#dgHere'); PB.wait_for_timeout(4500)
    check(PB.evaluate("document.getElementById('devGate').hidden") and PB.evaluate("__x('DV.state')") == 'ok' and not PB.evaluate("__x('DV.lock')"), 'PLAY HERE: the second device plays')
    PA.evaluate("__x('DV.at=0;devCheck()')"); PA.wait_for_timeout(1500)
    check(PA.is_visible('#devGate') and 'ANOTHER DEVICE' in PA.text_content('#dgHead'), 'the first device is told: ' + PA.text_content('#dgTxt'))
    check(PA.evaluate("__x('DV.lock')"), 'and stops saving')
    PA.evaluate("__x('DV.at=0;devCheck()')"); PA.wait_for_timeout(1500)
    check(PB.evaluate("__x('DV.state')") == 'ok', 'checking again from the first device doesn\'t take it back')
    PA.click('#dgHere'); PA.wait_for_timeout(4500)
    PB.evaluate("__x('DV.at=0;devCheck()')"); PB.wait_for_timeout(1500)
    check(PA.evaluate("__x('DV.state')") == 'ok' and PB.is_visible('#devGate'), 'PLAY HERE INSTEAD takes it back; the second device is told')
    PB.click('#dgOut'); PB.wait_for_timeout(800)
    check(PB.evaluate("__x('!ACC.user')") and PB.evaluate("document.getElementById('devGate').hidden"), 'SIGN OUT signs that device out')
    check(not errs, 'no page errors ' + str(errs[:3]))
    b.close()
print('PASS' if ok else 'FAILED'); sys.exit(0 if ok else 1)
