// ---------- helpers ----------
const RAD=Math.PI/180;
const rand=(a,b)=>a+Math.random()*(b-a);
const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function hash(n){let h=2166136261;for(const ch of String(n)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

