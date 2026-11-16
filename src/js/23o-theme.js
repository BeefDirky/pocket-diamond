/* ---------- Options > Fit color scheme: the menus take on your club's colors ----------
   The stylesheet's own colors are re-tinted: the dark greens of the panels, edges and muted text take your club's main
   color, and the amber highlights take its second color. Each color keeps its own lightness, so every dark stays as dark
   and every bright stays as bright; only the hue (and how strong it is) changes. Card rarities, coins, win/loss marks,
   lamps and the like keep their meaning colors, and so do whites and creams. */
const TH_SKIP=/\.r[0-3]\b|coin|Coin|Ovr|Badge|hsRd|\.hsRow\.[wl]\b|\.w\b|\.l\b|frDot|lfc\.r|\blg|holo|mmShop|mmInv|acHero|lamp|bulb|olReady|dropOk|dropNo|tsDots|rcol|kz/;
function thParse(c){let m=c.match(/^#([0-9a-f]{3,8})$/i);
 if(m){let h=m[1];if(h.length<6)h=h.split('').map(x=>x+x).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),h.length>=8?parseInt(h.slice(6,8),16)/255:1]}
 m=c.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
 if(m){let a=m[4]==null?1:m[4].endsWith('%')?parseFloat(m[4])/100:+m[4];return[+m[1],+m[2],+m[3],a]}return null}
function thHsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),n=Math.min(r,g,b),l=(M+n)/2;if(M===n)return[0,0,l];const d=M-n,s=l>.5?d/(2-M-n):d/(M+n);
 const h=M===r?((g-b)/d+(g<b?6:0)):M===g?(b-r)/d+2:(r-g)/d+4;return[h*60,s,l]}
function thRgb(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0),f(8),f(4)].map(x=>Math.round(x*255))}
function thMap(c,P,A){const v=thParse(c);if(!v)return null;const[h,s,l]=thHsl(v[0],v[1],v[2]);let t=null;
 if(h>=85&&h<=185&&s>.08&&s<.46)t=P;/* the muted greens of the menus */
 else if(h>=30&&h<=52&&s>.6&&l>=.38&&l<=.78)t=A;/* the amber highlights */
 if(!t)return null;const ns=Math.max(0,Math.min(1,s*t.k)),o=thRgb(t.h,ns,l);return v[3]<1?`rgba(${o.join(',')},${+v[3].toFixed(3)})`:`rgb(${o.join(',')})`}
function thTone(hex,ref){const v=thParse(hex)||[0,0,0,1],[h,s]=thHsl(v[0],v[1],v[2]);return{h,k:Math.max(.12,Math.min(1.3,s/ref))}}
function thBuild(club){const T=TEAMS[club];if(!T)return'';
 const P=thTone(T.jersey||'#33475e',.4),A=thTone(T.cap||'#c8202a',.75);
 const COL=/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;
 const walk=rules=>{let out='';for(const r of rules){
  if(r.cssRules&&r.conditionText!=null&&!(r instanceof CSSStyleRule)){const inner=walk(r.cssRules);if(inner)out+=`${r instanceof CSSMediaRule?'@media':'@supports'} ${r.conditionText}{${inner}}`;continue}
  if(!(r instanceof CSSStyleRule)||TH_SKIP.test(r.selectorText))continue;const st=r.style;let decl='';
  for(let i=0;i<st.length;i++){const p=st[i],val=st.getPropertyValue(p);if(!val||!/#|rgb/i.test(val)||/^--(lamp|team|f-)/.test(p))continue;
   let ch=false;const nv=val.replace(COL,m=>{const x=thMap(m,P,A);if(x){ch=true;return x}return m});
   if(ch)decl+=`${p}:${nv}${st.getPropertyPriority(p)?' !important':''};`}
  if(decl)out+=`${r.selectorText}{${decl}}`}return out};
 let css='';for(const sh of document.styleSheets){if(sh.ownerNode&&sh.ownerNode.id==='fitTheme')continue;try{css+=walk(sh.cssRules)}catch(e){}}return css}
let thFor=null;
function thApply(){const club=OPT.fit&&typeof MYTEAM!=='undefined'&&MYTEAM&&TEAMS[MYTEAM.club]?MYTEAM.club:'';if(club===thFor)return;thFor=club;
 let el=$('fitTheme');if(!club){if(el)el.remove();return}
 const css=thBuild(club);if(!el){el=document.createElement('style');el.id='fitTheme'}el.textContent=css;document.body.appendChild(el)}/* (last in the page, so it wins over the stylesheet it re-tints) */
function thSync(){for(const b of $('optFit').children)b.setAttribute('aria-pressed',String((b.dataset.v==='on')===!!OPT.fit))}
$('optFit').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;OPT.fit=b.dataset.v==='on';saveOpts();thSync();thApply()});
thSync();thApply();setInterval(thApply,1000);
