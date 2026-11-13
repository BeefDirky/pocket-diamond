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
    return (rd('src/splash.html') + rd('src/head.html') + '<style>\n' + rd('src/style.css') + '</style>\n' + rd('src/body.html')
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
    html = rd('tools/web-head.html') + page(js)
    html += '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script>\n</body></html>\n'
    return html, keys

def main():
    js = source_js()
    # the game's own version (same for both builds): ranked submissions carry it, and both phones must match
    assert js.count('__PD_VER__') == 1
    js = js.replace('__PD_VER__', hashlib.sha1(js.encode()).hexdigest()[:10])
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
          " if(!same&&!cdn)return;if(same&&u.pathname.includes('/_vercel/'))return;\n"
          " if(q.mode==='navigate'||(same&&/(\\/|\\.html)$/.test(u.pathname))){e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match(q).then(r=>r||home()).then(r=>{if(!done&&r){done=true;res(r)}});\n"
          "  const t=setTimeout(fb,4000);fetch(q).then(r=>{clearTimeout(t);put(C,q,r);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));return}\n"
          " if(cdn){e.respondWith(caches.match(q).then(h=>{const n=fetch(q).then(r=>put(RT,q,r)).catch(()=>h);return h||n}));return}\n"
          " e.respondWith(caches.match(q).then(h=>h||fetch(q).then(r=>put(C,q,r))))});\n")
    open(os.path.join(ROOT, 'sw.js'), 'w').write(sw)
    print(f'built: index.html {len(html)//1024} KB, dist/pocket-diamond.html {len(art)//1024} KB, cache pd-{ver}')

if __name__ == '__main__':
    main()
