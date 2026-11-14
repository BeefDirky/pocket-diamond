# Leaderboard screen test: the real page, reading a seeded local Postgres (supabase/tests/board_seed.sql) through a
# stand-in for supabase-js whose table queries run as the logged-out visitor role (anon), like Supabase's API does.
# Usage: python3 tools/build.py && PGHOST=... PGPORT=... PGUSER=postgres python3 tests/board_e2e.py   (needs DB pd_board)
import json, os, re, sys, threading, http.server, functools
import psycopg2
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
con = psycopg2.connect(dbname='pd_board'); con.autocommit = True
TABLES = {'seasons', 'leaderboard_ranked', 'player_stat_lines', 'matches', 'rating_history', 'profiles'}
COL = re.compile(r'^[a-z_]+$')
lock = threading.Lock()

def run_from(b):
    t = b['table']; ops = b['ops']
    if t not in TABLES: return {'error': {'message': 'table not allowed'}}
    cols, where, vals, order, limit, single = '*', [], [], [], None, False
    for op in ops:
        k, a = op[0], op[1:]
        if k == 'select': cols = ','.join(c.strip() for c in a[0].split(',') if COL.match(c.strip())) or '*'
        elif k in ('eq', 'gte'): assert COL.match(a[0]); where.append(f"{a[0]} {'=' if k == 'eq' else '>='} %s"); vals.append(a[1])
        elif k == 'in': assert COL.match(a[0]); where.append(f"{a[0]}::text = any(%s)"); vals.append([str(x) for x in a[1]])
        elif k == 'or':
            parts = []
            for c in a[0].split(','):
                col, opn, v = c.split('.', 2); assert COL.match(col) and opn == 'eq'; parts.append(f'{col}::text = %s'); vals.append(v)
            where.append('(' + ' or '.join(parts) + ')')
        elif k == 'order': assert COL.match(a[0]); asc = (a[1] or {}).get('ascending', True); order.append(f"{a[0]} {'asc' if asc else 'desc'} nulls last")
        elif k == 'limit': limit = int(a[0])
        elif k == 'maybeSingle': single = True
    sql = f'select {cols} from public.{t}' + (' where ' + ' and '.join(where) if where else '') + (' order by ' + ','.join(order) if order else '') + (f' limit {limit}' if limit else '')
    with lock, con.cursor() as c:
        try:
            c.execute('begin'); c.execute('set local role anon')
            c.execute(f'select coalesce(json_agg(q), \'[]\') from ({sql}) q', vals); rows = c.fetchone()[0]; c.execute('commit')
        except Exception as e:
            c.execute('rollback'); return {'error': {'message': str(e).split('\n')[0]}}
    return {'data': (rows[0] if rows else None) if single else rows, 'error': None}

def run_rpc(b):
    if b['fn'] != 'my_rating': return {'error': {'message': 'not allowed'}}
    with lock, con.cursor() as c:
        c.execute('begin'); c.execute('set local role authenticated'); c.execute("select set_config('request.jwt.claim.sub', %s, true)", (b['user'],))
        c.execute('select public.my_rating()'); r = c.fetchone()[0]; c.execute('commit'); return {'data': r}

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_POST(self):
        b = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        out = json.dumps(run_rpc(b) if self.path == '/rpc' else run_from(b)).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(out)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(H, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

# a chainable query builder that records the calls and runs them when awaited (the subset the game uses)
MOCK = """window.supabase={createClient:()=>({
 from(table){const ops=[],q={};for(const k of ['select','eq','gte','in','or','order','limit'])q[k]=(...a)=>{ops.push([k,...a]);return q};
  q.maybeSingle=()=>{ops.push(['maybeSingle']);return q};
  q.then=(res,rej)=>fetch('/from',{method:'POST',body:JSON.stringify({table,ops})}).then(r=>r.json()).then(res,rej);return q},
 rpc:(fn,args)=>fetch('/rpc',{method:'POST',body:JSON.stringify({fn,args,user:window.__uid})}).then(r=>r.json()),
 auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},getSession:async()=>({data:{session:null}})}})};"""
ok = True
def check(cond, what):
    global ok
    print(('ok  ' if cond else 'FAIL ') + what); ok = ok and bool(cond)
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, h, tag) in ((420, 860, 'phone'), (1400, 900, 'pc')):
        ctx = b.new_context(viewport={'width': w, 'height': h}, service_workers='block')
        ctx.add_init_script(MOCK + ";localStorage.setItem('pd-opts2',JSON.stringify({music:0,crowd:0,sfx:0,time:'day'}));localStorage.setItem('pd-privacy','1');localStorage.setItem('pd-myteam',JSON.stringify({club:'seoul',base:'seoul'}))")
        def inject(route):
            r = route.fetch(); t = r.text(); i = t.rfind('\n})();'); route.fulfill(response=r, body=t[:i] + '\nwindow.__x=c=>eval(c);' + t[i:])
        ctx.route('**/index.html', inject)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(2500)
        # signed in as BeefDirky (4th of 4)
        pg.evaluate("window.__uid='00000000-0000-0000-0000-000000000001';__x(\"ACC.user={id:'00000000-0000-0000-0000-000000000001',email:'x'};ACC.name='BeefDirky'\")")
        pg.click('#goMulti'); pg.click('#goBoard'); pg.wait_for_timeout(1500)
        names = pg.eval_on_selector_all('#lbList .lbName', 'els=>els.map(e=>e.firstChild.textContent)')
        check(names == ['Mallory_99', 'SluggerKim', 'Rival', 'BeefDirky'], f'{tag}: rating order {names}')
        check(pg.inner_text('#lbSeason').startswith('SEASON 1 · RANKED · RATING'), f'{tag}: season label')
        me = pg.inner_text('#lbMe'); check(me.startswith('4') and 'YOU' in me and '800' in me, f'{tag}: your row pinned: {me!r}')
        check('NewGuy' not in pg.inner_text('#lbList'), f'{tag}: unranked player not listed')
        pg.screenshot(path=f'{OUT}/board_{tag}.png')
        pg.click('#lbTabs [data-k=wins]'); pg.wait_for_timeout(800)
        check(pg.eval_on_selector('#lbList .lbName', 'e=>e.firstChild.textContent') == 'Mallory_99' and pg.inner_text('#lbList .lbVal') == '3', f'{tag}: wins tab')
        pg.click('#lbTabs [data-k=avg]'); pg.wait_for_timeout(800)
        top = pg.eval_on_selector('#lbList .lbName', 'e=>e.firstChild.textContent'); check(top == 'SluggerKim' and pg.inner_text('#lbList .lbVal') == '.294', f'{tag}: average tab (top {top})')
        pg.click('#lbTabs [data-k=rating]'); pg.wait_for_timeout(800)
        pg.click('#lbList li:nth-child(2) button'); pg.wait_for_timeout(1500)
        card = pg.inner_text('#lbpCard')
        check('SluggerKim' in card and '1100' in card and '#2' in card, f'{tag}: profile header and rating')
        check(card.count('vs ') >= 3 and ('+100' in card or '-100' in card), f'{tag}: last ranked games with rating change')
        check('Ranked' in card and 'PITCHING' in card, f'{tag}: batting and pitching lines')
        pg.screenshot(path=f'{OUT}/profile_{tag}.png')
        pg.keyboard.press('Escape'); check(not pg.is_visible('#lbProf'), f'{tag}: Escape closes the profile')
        pg.click('#lbMe'); pg.wait_for_timeout(1500); card = pg.inner_text('#lbpCard')
        check('BeefDirky' in card and 'Full game vs CPU' in card, f'{tag}: your own profile shows your vs-CPU line too')
        pg.click('#lbpClose')
        # a signed-in player with no ranked games
        pg.evaluate("window.__uid='00000000-0000-0000-0000-000000000005';__x(\"ACC.user={id:'00000000-0000-0000-0000-000000000005',email:'x'};ACC.name='NewGuy'\")")
        pg.click('#lbTabs [data-k=rating]'); pg.wait_for_timeout(1200)
        check('No ranked games yet' in pg.inner_text('#lbMe') and '1000' in pg.inner_text('#lbMe'), f'{tag}: new player sees 1000 and no games')
        # a visitor: the board, no pinned row
        pg.evaluate("__x('ACC.user=null;ACC.name=\"\"')"); pg.click('#lbTabs [data-k=rating]'); pg.wait_for_timeout(1000)
        check(not pg.is_visible('#lbMe') and len(pg.query_selector_all('#lbList li')) == 4, f'{tag}: logged-out visitor sees the board')
        check(not errs, f'{tag}: no page errors {errs[:2]}')
        ctx.close()
    b.close()
srv.shutdown()
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
