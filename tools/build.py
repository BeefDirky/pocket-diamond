#!/usr/bin/env python3
"""Build Pocket Diamond from src/.

  python3 tools/build.py            -> writes the web build into the repo root (index.html, sw.js)
                                       and the single-file claude.ai version to dist/pocket-diamond.html

Source layout
  src/splash.html, src/head.html, src/style.css, src/body.html, src/tail.html   page shell, styles, markup
  src/js/NN-*.js                                               game code, concatenated in file-name order
                                                               (all files share one scope; order matters)
  audio/*.mp3                                                  sound effects and music
  tools/config.json                                            Supabase project URL + publishable key
"""
import base64, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read()

def page(js):
    # the splash comes first so it paints before the fonts and the big stylesheet arrive
    body = rd('src/body.html')
    assert body.count('<!--@LEGAL-->') == 1
    body = body.replace('<!--@LEGAL-->', rd('src/legal.html'))
    return (rd('src/splash.html') + rd('src/head.html') + '<style>\n' + rd('src/style.css') + '</style>\n' + body
            + '<script>\n' + js + '</script>\n' + rd('src/tail.html'))

def source_js():
    files = sorted(f for f in os.listdir(os.path.join(ROOT, 'src/js')) if f.endswith('.js'))
    return ''.join(rd('src/js/' + f) for f in files)

AUDIO_RE = re.compile(r"const SND_B64=/\*@AUDIO:([a-z0-9,]+)\*/\{\};")

def build_artifact(js):
    keys = AUDIO_RE.search(js).group(1).split(',')
    def b64(k):
        return base64.b64encode(open(os.path.join(ROOT, 'audio', k + '.mp3'), 'rb').read()).decode()
    emb = 'const SND_B64={' + ','.join(f"{k}:'{b64(k)}'" for k in keys) + '};'
    return page(AUDIO_RE.sub(lambda m: emb, js, count=1))

def build_web(js, cfg):
    keys = AUDIO_RE.search(js).group(1).split(',')
    js = AUDIO_RE.sub(lambda m: 'const SND_B64={' + ','.join(f'{k}:1' for k in keys) + '};', js, count=1)
    old = "for(const k in SND_B64){try{AC.decodeAudioData(b64buf(SND_B64[k]),"
    assert js.count(old) == 1, 'audio loader changed: update build_web'
    js = js.replace(old, "for(const k in SND_B64){fetch('audio/'+k+'.mp3').then(r=>r.arrayBuffer()).then(ab=>AC.decodeAudioData(ab,")
    old2 = "if(k==='amb'&&!ambSrc)ambSrc=loopOn('amb',BUS.amb)},()=>{})}catch(e){}}}"
    assert js.count(old2) == 1, 'audio loader changed: update build_web'
    js = js.replace(old2, "if(k==='amb'&&!ambSrc)ambSrc=loopOn('amb',BUS.amb)},()=>{})).catch(()=>{})}}")
    assert js.count('__SUPA_URL__') == 1 and js.count('__SUPA_KEY__') == 1
    js = js.replace('__SUPA_URL__', cfg['supabase_url']).replace('__SUPA_KEY__', cfg['supabase_key'])
    # analytics (website only): PostHog project key and host; the claude.ai build keeps the placeholders, so it sends nothing
    js = js.replace('__PH_KEY__', cfg.get('posthog_key', '')).replace('__PH_HOST__', cfg.get('posthog_host', 'https://us.i.posthog.com'))
    html = rd('tools/web-head.html') + page(js)
    html += '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script>\n</body></html>\n'
    return html, keys

LEGAL_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · Pocket Diamond</title><meta name="description" content="{title} for Pocket Diamond, a pixel KBO baseball game by Imugi Labs.">
<link rel="icon" href="icon-192.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;600;700&display=swap">
<style>
:root{{--bg:#0f2018;--panel:#1b3a2a;--edge:#0b130e;--amber:#f2be55;--chalk:#f4f1e8;--dim:#a9b8ad}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--chalk);font-family:"Pixelify Sans",system-ui,sans-serif;font-weight:500}}
main{{max-width:760px;margin:0 auto;padding:28px 18px 60px}}
.top{{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}}
.logo{{font-family:"Press Start 2P",monospace;font-size:15px;color:var(--chalk);text-decoration:none}}.logo span{{color:var(--amber)}}
nav a{{color:var(--chalk);text-decoration:none;border:2px solid var(--edge);background:var(--panel);padding:8px 12px;margin-left:6px;font-size:15px;display:inline-block}}
nav a[aria-current]{{border-color:var(--amber);color:var(--amber)}}
.card{{background:var(--panel);border:3px solid var(--edge);box-shadow:inset 0 0 0 2px #2c5a40;padding:22px 22px 14px}}
h2{{font-family:"Press Start 2P",monospace;font-weight:400;font-size:18px;color:var(--amber);margin:0 0 8px;line-height:1.4}}
h3{{font-size:18px;letter-spacing:.04em;color:var(--amber);margin:22px 0 6px}}
p{{font-size:17px;line-height:1.6;margin:0 0 10px}}.lgDate{{color:var(--dim);font-size:15px}}a{{color:var(--amber)}}
.play{{display:inline-block;margin-top:18px;font-family:"Press Start 2P",monospace;font-size:12px;background:var(--amber);color:#14110a;text-decoration:none;padding:14px 18px;border:3px solid var(--edge)}}
</style></head><body><main>
<div class="top"><a class="logo" href="/">POCKET <span>DIAMOND</span></a><nav><a href="privacy"{pa}>Privacy</a><a href="terms"{ta}>Terms</a></nav></div>
<div class="card">{doc}</div>
<a class="play" href="/">PLAY POCKET DIAMOND</a>
</main></body></html>
"""

def build_legal():
    src = rd('src/legal.html')
    for doc, title in (('privacy', 'Privacy Policy'), ('terms', 'Terms of Use')):
        m = re.search(r'<section class="lgDoc" data-doc="%s">(.*?)</section>' % doc, src, re.S)
        cur = ' aria-current="page"'
        html = LEGAL_PAGE.format(title=title, doc=m.group(1), pa=cur if doc == 'privacy' else '', ta=cur if doc == 'terms' else '')
        open(os.path.join(ROOT, doc + '.html'), 'w', encoding='utf-8').write(html)

def main():
    js = source_js()
    # the game's own version (same for both builds): ranked submissions carry it, and both phones must match
    assert js.count('__PD_VER__') == 1
    pd_ver = hashlib.sha1(js.encode()).hexdigest()[:10]
    js = js.replace('__PD_VER__', pd_ver)
    # the running game compares its own version with this file to offer a refresh when a new one is out
    open(os.path.join(ROOT, 'version.json'), 'w').write(json.dumps({'v': pd_ver}) + '\n')
    cfg = json.loads(rd('tools/config.json'))
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    art = build_artifact(js)
    open(os.path.join(ROOT, 'dist/pocket-diamond.html'), 'w', encoding='utf-8').write(art)
    html, keys = build_web(js, cfg)
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
    files = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'] + [f'audio/{k}.mp3' for k in keys]
    ver = hashlib.sha1(html.encode()).hexdigest()[:10]
    sw = (f"const C='pd-{ver}',RT='pd-rt',F={json.dumps(files)};\n"
          "// offline: the game itself and its sounds are stored at install; fonts and the online library are kept in a cache that\n"
          "// survives updates; the page comes from the network when it answers in time and from the store when it doesn't\n"
          "self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));\n"
          "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\n"
          "const put=(n,q,r)=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(n).then(c=>c.put(q,cp))}return r};\n"
          "const home=()=>caches.match(new URL('index.html',self.registration.scope).href);\n"
          "self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url),same=u.origin===location.origin,cdn=/(^|\\.)(fonts\\.googleapis\\.com|fonts\\.gstatic\\.com|cdn\\.jsdelivr\\.net)$/.test(u.hostname);\n"
          " if(!same&&!cdn)return;if(same&&(u.pathname.includes('/_vercel/')||u.pathname.endsWith('/version.json')))return;\n"
          " if(q.mode==='navigate'||(same&&/(\\/|\\.html)$/.test(u.pathname))){e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match(q).then(r=>r||home()).then(r=>{if(!done&&r){done=true;res(r)}});\n"
          "  const t=setTimeout(fb,4000);fetch(q).then(r=>{clearTimeout(t);put(C,q,r);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));return}\n"
          " if(cdn){e.respondWith(caches.match(q).then(h=>{const n=fetch(q).then(r=>put(RT,q,r)).catch(()=>h);return h||n}));return}\n"
          " e.respondWith(caches.match(q).then(h=>h||fetch(q).then(r=>put(C,q,r))))});\n")
    open(os.path.join(ROOT, 'sw.js'), 'w').write(sw)
    build_legal()
    print(f'built: index.html {len(html)//1024} KB, dist/pocket-diamond.html {len(art)//1024} KB, cache pd-{ver}')

if __name__ == '__main__':
    main()
