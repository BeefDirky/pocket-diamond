// ---------- sponsor preview (menu → SPONSORS): sample signs in the shapes they'd take around a park. Fictional brands only. ----------
const AD_SPONSORS=[
 {n:'GULL AIR',k:'갈매기 항공',bg:'#13254a',fg:'#ffffff',ac:'#e8642a',ic:'plane',tag:'FLY THE COAST'},
 {n:'HANSOL RAMYUN',k:'한솔 라면',bg:'#c8202a',fg:'#ffd23f',ac:'#ffffff',ic:'bowl',tag:'SPICY SINCE 1978'},
 {n:'PALDO MART',k:'팔도 마트',bg:'#1f7a3a',fg:'#ffffff',ac:'#ffd23f',ic:'cart',tag:'OPEN 24 HOURS'},
 {n:'HWASEONG BANK',k:'화성 은행',bg:'#2a1650',fg:'#e8dcff',ac:'#ffd23f',ic:'coin',tag:'SAVE LIKE A WIZARD'},
 {n:'DINO DIG',k:'디노 디그',bg:'#123a2a',fg:'#b9e6c9',ac:'#e2b93a',ic:'bone',tag:'FAMILY DIG PARK'},
 {n:'SEA SALT SODA',k:'바다 소다',bg:'#5aa0e6',fg:'#ffffff',ac:'#14325a',ic:'can',tag:'ICE COLD AT EVERY STAND'},
 {n:'TANGERINE TELECOM',k:'귤 통신',bg:'#f08a1c',fg:'#ffffff',ac:'#2f6a32',ic:'phone',tag:'5G FROM JEJU TO SEOUL'},
 {n:'REX MOTORS',k:'렉스 모터스',bg:'#1b1f24',fg:'#e8f0e0',ac:'#2fa86a',ic:'car',tag:'BUILT IN CHANGWON'},
 {n:'BLUE WHALE COFFEE',k:'고래 커피',bg:'#0f2f55',fg:'#cfe6ff',ac:'#ffffff',ic:'cup',tag:'DEEP ROAST'},
 {n:'GWANGAN FRIED CHICKEN',k:'광안 치킨',bg:'#ffd23f',fg:'#7a2a10',ac:'#c8202a',ic:'chick',tag:'CHIMAEK NIGHT'}];
// tiny pixel icons, 8x8, drawn in the sign's accent colour
const AD_ICON={plane:['...X....','...XX...','XXXXXXXX','.XXXXXX.','...XX...','..XXXX..','...XX...','........'],
 bowl:['.X.X.X..','..X.X...','XXXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..','...XX...','........'],
 cart:['X.......','XXXXXXX.','.XXXXXX.','.XXXXXX.','..XXXXX.','........','..X..X..','........'],
 coin:['..XXXX..','.X....X.','X..XX..X','X.X..X.X','X..XX..X','X.X..X.X','.X....X.','..XXXX..'],
 bone:['XX....XX','XXX..XXX','.XXXXXX.','..XXXX..','..XXXX..','.XXXXXX.','XXX..XXX','XX....XX'],
 can:['.XXXXX..','XXXXXXX.','X.....X.','XXXXXXX.','X.....X.','XXXXXXX.','XXXXXXX.','.XXXXX..'],
 phone:['.XXXXX..','.X...X..','.X...X..','.X...X..','.X...X..','.XXXXX..','.XX.XX..','.XXXXX..'],
 car:['........','..XXXX..','.X....X.','XXXXXXXX','XXXXXXXX','.X....X.','........','........'],
 cup:['.X.X....','..X.X...','XXXXXX..','X....XXX','X....X.X','X....XXX','.XXXX...','XXXXXXX.'],
 chick:['..XX....','.XXXX...','XXX.XXX.','.XXXXXXX','.XXXXXX.','..XXXX..','..X..X..','.XX.XX..']};
function adIcon(g,x,y,ic,c,s){g.fillStyle=c;(AD_ICON[ic]||[]).forEach((r,j)=>{for(let i=0;i<8;i++)if(r[i]==='X')g.fillRect(x+i*s,y+j*s,s,s)})}
function adCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;c.className='adCv';const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g]}
// 1. outfield wall pad: the sponsor painted on the padded panel, with the yellow home-run line on top
function adWall(sp){const[c,g]=adCanvas(240,44);g.fillStyle='#ffd23f';g.fillRect(0,0,240,3);g.fillStyle=sp.bg;g.fillRect(0,3,240,38);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,35,240,6);
 for(let x=0;x<240;x+=60){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,3,1,38)}adIcon(g,10,10,sp.ic,sp.ac,3);
 g.fillStyle=sp.fg;g.font='bold 16px "Pixelify Sans", monospace';g.textBaseline='middle';g.fillText(sp.n,42,16,190);g.fillStyle=sp.ac;g.font='12px Jua, sans-serif';g.fillText(sp.k,42,32,190);return c}
// 2. LED ribbon on the upper-deck fascia: dot-matrix lettering, lit
function adRibbon(sp,now){const[c,g]=adCanvas(320,22);g.fillStyle='#05080a';g.fillRect(0,0,320,22);const txt=`${sp.n} · ${sp.k} · ${sp.tag} · `;
 const t=document.createElement('canvas');t.width=900;t.height=14;const tg=t.getContext('2d');tg.font='bold 12px "Pixelify Sans", monospace';tg.textBaseline='middle';tg.fillStyle=sp.ac==='#ffffff'?sp.fg:sp.ac;tg.fillText(txt+txt,0,8);
 const off=Math.floor(now/40)%Math.max(1,Math.round(tg.measureText(txt).width));const d=tg.getImageData(0,0,900,14).data;
 for(let y=0;y<14;y++)for(let x=0;x<160;x++){const sx=x*2+off,i=(y*900+sx)*4;if(sx<900&&d[i+3]>110){g.fillStyle=`rgb(${d[i]},${d[i+1]},${d[i+2]})`;g.fillRect(x*2,y+4,2,1)}else if(((x+y)&1)===0){g.fillStyle='#10151a';g.fillRect(x*2,y+4,1,1)}}
 return c}
// 3. outfield billboard on legs above the bleachers
function adBoard(sp){const[c,g]=adCanvas(150,96);g.fillStyle='#3a4048';g.fillRect(26,62,5,34);g.fillRect(119,62,5,34);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(8,8,140,58);
 g.fillStyle='#22262c';g.fillRect(2,2,146,62);g.fillStyle=sp.bg;g.fillRect(5,5,140,56);g.fillStyle=sp.ac;g.fillRect(5,5,140,3);adIcon(g,12,16,sp.ic,sp.ac,4);
 g.fillStyle=sp.fg;g.font='bold 13px "Pixelify Sans", monospace';g.textBaseline='middle';g.fillText(sp.n,52,22,90);g.font='14px Jua, sans-serif';g.fillText(sp.k,52,38,90);g.fillStyle=sp.ac;g.font='9px "Pixelify Sans", monospace';g.fillText(sp.tag,12,54,128);return c}
// 4. the jumbotron's between-innings spot
function adJumbo(sp,now){const[c,g]=adCanvas(190,66);g.fillStyle='#05080a';g.fillRect(0,0,190,66);const fl=Math.floor(now/500)%2;
 g.fillStyle=sp.bg;g.fillRect(4,4,182,58);adIcon(g,12,13,sp.ic,fl?sp.fg:sp.ac,5);g.fillStyle=sp.fg;g.font='bold 15px "Pixelify Sans", monospace';g.textBaseline='middle';g.fillText(sp.n,62,20,120);
 g.fillStyle=sp.ac;g.font='15px Jua, sans-serif';g.fillText(sp.k,62,38,120);g.fillStyle=sp.fg;g.font='9px "Press Start 2P", monospace';g.fillText(fl?'INNING BREAK':sp.tag,62,54,120);
 g.fillStyle='rgba(0,0,0,.28)';for(let y=0;y<66;y+=2)g.fillRect(0,y,190,1);return c}
// 5. the hand-held fan banner in the stands
function adFan(sp){const[c,g]=adCanvas(150,40);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(4,6,144,32);g.fillStyle='#f4f1e8';g.fillRect(1,3,144,30);g.fillStyle=sp.bg;g.fillRect(1,3,144,4);g.fillRect(1,29,144,4);
 g.fillStyle=sp.bg;g.font='bold 12px "Pixelify Sans", monospace';g.textBaseline='middle';g.textAlign='center';g.fillText(`${sp.n}!`,73,18,136);g.fillStyle='#2b3038';g.fillRect(14,33,2,7);g.fillRect(130,33,2,7);return c}
// 6. foul-pole screen and backstop rotating board
function adBackstop(sp){const[c,g]=adCanvas(240,26);g.fillStyle='#1b1f24';g.fillRect(0,0,240,26);g.fillStyle=sp.bg;g.fillRect(2,2,236,22);g.fillStyle=sp.ac;g.fillRect(2,2,4,22);g.fillRect(234,2,4,22);
 adIcon(g,12,5,sp.ic,sp.fg,2);adIcon(g,212,5,sp.ic,sp.fg,2);g.fillStyle=sp.fg;g.font='bold 13px "Pixelify Sans", monospace';g.textBaseline='middle';g.textAlign='center';g.fillText(`${sp.n} · ${sp.k}`,120,14,180);return c}
let ADS_RAF=0;
function adsRender(){const W=$('adsWrap');W.innerHTML='';const live=[];
 const sec=(t,d)=>{const h=document.createElement('h3');h.className='adsH';h.innerHTML=`${t}<small>${d}</small>`;W.appendChild(h);const r=document.createElement('div');r.className='adsRow';W.appendChild(r);return r};
 let r=sec('OUTFIELD WALL PADS','Painted on the padded wall between the yellow line and the warning track');AD_SPONSORS.forEach(sp=>r.appendChild(adWall(sp)));
 r=sec('UPPER-DECK LED RIBBON','Scrolls along the fascia between the decks');AD_SPONSORS.slice(0,4).forEach(sp=>{const box=document.createElement('div');box.className='adLive';r.appendChild(box);live.push([box,now=>adRibbon(sp,now)])});
 r=sec('BILLBOARDS','On legs above the outfield seats and the concourse');AD_SPONSORS.forEach(sp=>r.appendChild(adBoard(sp)));
 r=sec('JUMBOTRON SPOTS','Between innings and during pitching changes');AD_SPONSORS.slice(0,6).forEach(sp=>{const box=document.createElement('div');box.className='adLive';r.appendChild(box);live.push([box,now=>adJumbo(sp,now)])});
 r=sec('BACKSTOP BOARDS','The rotating board behind home plate, seen on every pitch');AD_SPONSORS.forEach(sp=>r.appendChild(adBackstop(sp)));
 r=sec('FAN BANNERS','Hand-held in the stands');AD_SPONSORS.forEach(sp=>r.appendChild(adFan(sp)));
 cancelAnimationFrame(ADS_RAF);const tick=now=>{if($('scrAds').hidden)return;for(const[b,f]of live){const c=f(now);b.replaceChildren(c)}ADS_RAF=setTimeout(()=>requestAnimationFrame(tick),80)};requestAnimationFrame(tick)}
