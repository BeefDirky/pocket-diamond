const C='pd-4f18ff6adb',RT='pd-rt',F=["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "audio/sad.mp3", "audio/homer.mp3", "audio/charge.mp3", "audio/klost.mp3", "audio/bpthrow.mp3", "audio/fworks.mp3", "audio/chant.mp3", "audio/csingle.mp3", "audio/boo.mp3", "audio/slide.mp3", "audio/ramp.mp3", "audio/fence1.mp3", "audio/clang.mp3", "audio/grass.mp3", "audio/horn.mp3", "audio/echo1.mp3", "audio/echo2.mp3", "audio/echo3.mp3", "audio/amb.mp3", "audio/woosh.mp3", "audio/weak.mp3", "audio/drop.mp3", "audio/mitt.mp3", "audio/cheer.mp3", "audio/crowd.mp3", "audio/bat.mp3", "audio/organ.mp3", "audio/roar.mp3"];
// offline: the game itself and its sounds are stored at install; fonts and the online library are kept in a cache that
// survives updates; the page comes from the network when it answers in time and from the store when it doesn't
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const put=(n,q,r)=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(n).then(c=>c.put(q,cp))}return r};
const home=()=>caches.match(new URL('index.html',self.registration.scope).href);
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url),same=u.origin===location.origin,cdn=/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/.test(u.hostname);
 if(!same&&!cdn)return;if(same&&u.pathname.includes('/_vercel/'))return;
 if(q.mode==='navigate'||(same&&/(\/|\.html)$/.test(u.pathname))){e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match(q).then(r=>r||home()).then(r=>{if(!done&&r){done=true;res(r)}});
  const t=setTimeout(fb,4000);fetch(q).then(r=>{clearTimeout(t);put(C,q,r);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));return}
 if(cdn){e.respondWith(caches.match(q).then(h=>{const n=fetch(q).then(r=>put(RT,q,r)).catch(()=>h);return h||n}));return}
 e.respondWith(caches.match(q).then(h=>h||fetch(q).then(r=>put(C,q,r))))});
