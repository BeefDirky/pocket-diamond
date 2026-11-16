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
DB = 'pd_po'; A = '11111111-1111-1111-1111-111111111111'; B = '22222222-2222-2222-2222-222222222222'

def psql(db, f): subprocess.run(['psql', '-v', 'ON_ERROR_STOP=1', '-q', '-d', db, '-f', f], check=True, capture_output=True)
subprocess.run(['psql', '-q', '-c', f'drop database if exists {DB}', '-c', f'create database {DB}'], check=True, capture_output=True)
for f in ['supabase/tests/supabase_stub.sql', 'supabase/profiles.sql'] + sorted('supabase/migrations/' + x for x in os.listdir(os.path.join(ROOT, 'supabase/migrations'))):
    psql(DB, os.path.join(ROOT, f))
con = psycopg2.connect(dbname=DB); con.autocommit = True
with con.cursor() as c:
    c.execute("insert into auth.users(id,email) values (%s,'a@x.co'),(%s,'b@x.co')", (A, B))
    c.execute("insert into public.profiles(user_id,username) values (%s,'BeefDirky'),(%s,'Rival')", (A, B))
    c.execute("insert into public.friendships(user_lo,user_hi,requester,status) values (least(%s::uuid,%s::uuid),greatest(%s::uuid,%s::uuid),%s,'accepted')", (A, B, A, B, A))

# the game's server calls, run as the signed-in player (same as Supabase does with the player's token)
lock = threading.Lock()
def rpc(fn, args, user):
    if not fn.replace('_', '').isalnum(): return {'error': {'message': 'bad fn'}}
    with lock, con.cursor() as c:
        try:
            c.execute('begin'); c.execute('set local role authenticated'); c.execute("select set_config('request.jwt.claim.sub', %s, true)", (user,))
            names = list(args.keys())
            sql = f"select public.{fn}(" + ','.join(f'{k} => %s' for k in names) + ")"
            if fn in ('friends_list', 'friend_invites_inbox', 'tourney_inbox'):   # (a table function: Supabase returns its rows as a JSON list)
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
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8769), functools.partial(H, directory=ROOT))
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
        pg.goto('http://localhost:8769/index.html'); pg.wait_for_timeout(2500)
        pg.evaluate(f"window.__uid='{uid}';__x(\"ACC.user={{id:'{uid}',email:'x@x.co'}};ACC.name='{name}';acRender()\")")
    def check(c, what):
        global ok
        print(('ok  ' if c else 'FAIL ') + what); ok = ok and bool(c)
    for pg in (PA, PB): pg.evaluate("__x('frLoad()')")
    PA.wait_for_timeout(1500)
    PA.click('#goMulti'); PA.click('#goTourney'); PA.wait_for_timeout(800)
    check('CREATE A TOURNAMENT' in PA.text_content('#tnBody'), 'no playoff yet: CREATE')
    PA.click('[data-tn=create]'); PA.wait_for_timeout(900)
    check('PLAYERS · 1 / 8' in PA.text_content('#tnBody'), 'lobby with the host')
    PA.evaluate(f"__x(\"LIVE.who={{'{B}':'m'}};tnRender()\")")
    PA.click('[data-tninv]'); PA.wait_for_timeout(900)
    check('INVITED' in PA.text_content('#tnBody'), 'invited the friend')
    PB.wait_for_selector('#frInvite:not([hidden])', timeout=16000)
    check('tournament' in PB.text_content('#frInvTxt'), 'the friend gets the playoff invite: ' + PB.text_content('#frInvTxt'))
    PB.click('#frInvGo'); PB.wait_for_timeout(1200)
    check(PB.is_visible('#scrTourney') and 'Waiting for' in PB.text_content('#tnBody'), 'the friend joins and waits for the host')
    PA.evaluate("__x('tnLoad()')"); PA.wait_for_timeout(600)
    check('PLAYERS · 2 / 8' in PA.text_content('#tnBody'), 'host sees 2 / 8')
    PA.click('[data-tn=start]'); PA.wait_for_timeout(1200)
    t = PA.text_content('#tnBody')
    check('QUARTERFINALS' in t and 'CPU' in t, 'started: bracket with CPU clubs')
    # each player's series: find who they face
    def opp(pg): return pg.evaluate("__x(\"(()=>{const s=tnMySeries(),me=tnMe(),o=tnP(s.seed_a===me.seed?s.seed_b:s.seed_a);return o.user_id?'friend':'cpu'})()\")")
    PB.evaluate("__x('tnLoad()')"); PB.wait_for_timeout(600)
    print('   host faces', opp(PA), '| friend faces', opp(PB))
    check(PA.is_visible('[data-tn=play]'), 'PLAY GAME 1 on the host\'s screen')
    if opp(PA) == 'cpu':
        PA.click('[data-tn=play]'); PA.wait_for_timeout(1500)
        check(PA.evaluate("__x('!!S.tnGame&&S.totalInn===3&&document.getElementById(\"title\").hidden')"), 'a CPU playoff game starts: 3 innings on this phone')
        PA.evaluate("__x('S.runs=5;S.target=2;gameOver(true)')"); PA.wait_for_timeout(4500)
        check(PA.text_content('#toLobby') == 'BACK TO THE TOURNAMENT' and PA.is_visible('#toLobby'), 'results card points back to the playoff')
        PA.click('#toLobby'); PA.wait_for_timeout(1200)
        check(PA.is_visible('#scrTourney') and 'GAME 2' in PA.text_content('#tnBody') and 'You 1' in PA.text_content('#tnBody').replace('\n',' '), 'game 1 reported, game 2 next: ' + PA.text_content('.tnYou small'))
    # friend vs friend: put the two players in the same semifinal-style series by hand, then play it through a room
    with con.cursor() as c:
        c.execute("select tid from public.tourney_players where user_id=%s order by id desc limit 1", (A,)); tid = c.fetchone()[0]
        c.execute("delete from public.tourney_games where series_id in (select id from public.tourney_series where tid=%s)", (tid,))
        c.execute("delete from public.tourney_series where tid=%s", (tid,))
        c.execute("update public.tourney_players set seed=null where tid=%s", (tid,))
        c.execute("with r as (select id, row_number() over (order by (user_id is null), id) n from public.tourney_players where tid=%s and status in ('joined','bot')) update public.tourney_players p set seed=r.n from r where p.id=r.id", (tid,))
        c.execute("insert into public.tourney_series(tid,round,slot,seed_a,seed_b,need,code) values (%s,1,1,1,2,2,'tnab'),(%s,1,2,3,4,2,'tncd'),(%s,1,3,5,6,2,'tnef'),(%s,1,4,7,8,2,'tngh')", (tid,tid,tid,tid))
    for pg in (PA, PB): pg.evaluate("__x('tnOpen()')")
    PA.wait_for_timeout(1500)
    check(opp(PA) == 'friend' and opp(PB) == 'friend', 'the two friends face each other')
    PA.click('[data-tn=play]'); PA.wait_for_timeout(800); PB.click('[data-tn=play]'); PB.wait_for_timeout(2500)
    check(PA.evaluate("__x('S.online&&S.online.code')") == 'tnab' and PB.evaluate("__x('S.online&&S.online.code')") == 'tnab' and PA.evaluate("__x('!!S.online.opp')"), 'both land in the series room (tnab), host = higher seed')
    # the game ends 6-3 for the home side (the host): its phone reports it
    PA.evaluate("__x(\"S.online.me='home';S.online.inGame=true;S.runs=6;S.target=3;S.tnBack=tnGameOver()\")"); PA.wait_for_timeout(1200)
    with con.cursor() as c:
        c.execute("select wins_a, wins_b from public.tourney_series where code='tnab' and tid=%s", (tid,)); w = c.fetchone()
    check(tuple(w) == (1, 0), 'friend-vs-friend game 1 reported: ' + str(w))
    PA.evaluate("document.getElementById('toLobby').click()"); PA.wait_for_timeout(1200)
    check(PA.is_visible('#scrTourney') and not PA.evaluate("__x('!!S.online')"), 'back to the playoff, out of the room')
    check(not errs, 'no page errors ' + str(errs[:3]))
    b.close()
print('PASS' if ok else 'FAILED'); sys.exit(0 if ok else 1)
