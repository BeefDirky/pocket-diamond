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
DB = 'pd_fr'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

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
            if fn in ('friends_list',):   # (a table function: Supabase returns its rows as a JSON list)
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
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8768), functools.partial(H, directory=ROOT))
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
    PA.add_init_script("localStorage.setItem('pd-privacy','1');localStorage.setItem('pd-how','1');localStorage.setItem('pd-myteam',JSON.stringify({club:'seoul',base:'seoul'}))")
    PB.add_init_script("localStorage.setItem('pd-privacy','1');localStorage.setItem('pd-how','1');localStorage.setItem('pd-myteam',JSON.stringify({club:'busan',base:'busan'}))")
    for pg, uid, name in ((PA, A, 'BeefDirky'), (PB, B, 'Rival')):
        pg.goto('http://localhost:8768/index.html'); pg.wait_for_timeout(2500)
        pg.evaluate(f"window.__uid='{uid}';__x(\"ACC.user={{id:'{uid}',email:'x@x.co'}};ACC.name='{name}';acRender()\")")
    def check(c, what):
        global ok
        print(('ok  ' if c else 'FAIL ') + what); ok = ok and bool(c)
    PA.wait_for_timeout(3500)
    PA.click('#goMulti'); PA.click('#goFriends'); PA.wait_for_timeout(600)
    check(PA.is_visible('#scrFriends') and PA.is_visible('#frName'), 'Friends page opens, signed in')
    PA.fill('#frName', 'nobody_x'); PA.click('#frSend'); PA.wait_for_timeout(500)
    check('No player' in PA.text_content('#frMsg'), 'unknown username: ' + PA.text_content('#frMsg'))
    PA.fill('#frName', 'rival'); PA.click('#frSend'); PA.wait_for_timeout(600)
    check('case-sensitive' in PA.text_content('#frMsg'), 'wrong capitals: ' + PA.text_content('#frMsg'))
    PA.fill('#frName', 'Rival'); PA.click('#frSend'); PA.wait_for_timeout(700)
    check('Request sent' in PA.text_content('#frMsg') and 'SENT' in PA.text_content('#frList'), 'request sent, listed under SENT')
    PB.evaluate("__x('frLoad()')"); PB.wait_for_timeout(500)
    check(PB.text_content('#frBadge') == '1' and PB.evaluate("!document.getElementById('frBadge').hidden"), 'the other player gets a badge on FRIENDS')
    PB.click('#goMulti'); PB.click('#goFriends'); PB.wait_for_timeout(600)
    check('WANTS TO BE FRIENDS' in PB.text_content('#frList'), 'and sees the request')
    PB.click('[data-acc]'); PB.wait_for_timeout(700)
    check('FRIENDS · 1' in PB.text_content('#frList') and 'BeefDirky' in PB.text_content('#frList'), 'accepted: friends')
    PA.evaluate("__x('frLoad()')"); PA.wait_for_timeout(500)
    check('FRIENDS · 1' in PA.text_content('#frList'), 'the sender sees the new friend')
    check(PA.evaluate("document.querySelector('[data-inv]').disabled"), 'an offline friend can\'t be invited')
    for pg, other in ((PA, B), (PB, A)): pg.evaluate(f"__x(\"LIVE.who={{'{other}':'m'}};frRender()\")")
    check('ONLINE' in PA.text_content('#frList') and not PA.evaluate("document.querySelector('[data-inv]').disabled"), 'an online friend shows ONLINE and can be invited')
    PA.click('[data-inv]'); PA.wait_for_timeout(1500)
    check(PA.is_visible('#scrOnline') and PA.evaluate("__x('!!(S.online&&S.online.nr)')"), 'inviting opens a custom room')
    PB.wait_for_selector('#frInvite:not([hidden])', timeout=5000)
    check('BeefDirky' in PB.text_content('#frInvTxt'), 'the friend gets the invite: ' + PB.text_content('#frInvTxt'))
    PB.click('#frInvGo'); PB.wait_for_timeout(2500)
    check(PB.is_visible('#scrOnline') and PA.evaluate("__x('!!(S.online&&S.online.opp)')") and PB.evaluate("__x('!!(S.online&&S.online.opp)')"), 'JOIN: both in the same room')
    check(PA.evaluate("__x('S.online.code')") == PB.evaluate("__x('S.online.code')"), 'same room code')
    # a stranger's invite is ignored
    PB.evaluate("__x(\"showScreen('scrMain');S.online=null\")")
    PB.evaluate("__x(\"frGotInvite({from:'99999999-9999-9999-9999-999999999999',name:'Stranger',code:'abcd',t:Date.now()})\")"); PB.wait_for_timeout(300)
    check(PB.evaluate("document.getElementById('frInvite').hidden"), 'an invite from someone who isn\'t a friend is ignored')
    # remove (two taps)
    PA.evaluate("__x(\"if(S.online&&S.online.nr)S.online.nr.leave();S.online=null;frOpen()\")"); PA.wait_for_timeout(600)
    PA.click('[data-open]'); PA.click('.frMore [data-rm]'); PA.click('.frMore [data-rm]'); PA.wait_for_timeout(700)
    check('No friends yet' in PA.text_content('#frList'), 'remove friend (tap twice)')
    check(not errs, 'no page errors ' + str(errs[:3]))
    b.close()
print('PASS' if ok else 'FAILED'); sys.exit(0 if ok else 1)
