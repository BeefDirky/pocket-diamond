// ---------- league map: pixel Korea with every club pinned to its city ----------
const KR_MAIN=[[126.1,37.75],[126.45,37.82],[126.7,37.97],[126.95,38.15],[127.1,38.3],[127.6,38.33],[128.0,38.3],[128.35,38.62],[128.6,38.2],[128.85,37.85],[129.05,37.6],[129.3,37.15],[129.38,36.7],[129.45,36.2],[129.45,35.9],[129.5,35.6],[129.4,35.4],[129.2,35.17],[128.95,35.05],[128.6,34.92],[128.3,34.88],[128.0,34.85],[127.75,34.75],[127.5,34.62],[127.3,34.48],[127.0,34.42],[126.75,34.32],[126.5,34.3],[126.3,34.45],[126.28,34.75],[126.35,35.05],[126.42,35.4],[126.55,35.65],[126.7,35.95],[126.6,36.2],[126.5,36.45],[126.2,36.65],[126.15,36.85],[126.45,37.0],[126.8,37.15],[126.65,37.4],[126.55,37.6]];
const KR_ISL=[[[126.25,33.28],[126.3,33.42],[126.55,33.56],[126.85,33.54],[126.95,33.45],[126.8,33.29],[126.55,33.21]],[[130.86,37.45],[130.92,37.53],[130.8,37.53]],[[128.6,34.9],[128.72,34.95],[128.7,34.75],[128.58,34.72]]];
const KR_NORTH=[[124.6,38.0],[124.9,37.85],[125.6,37.7],[126.1,37.75],[126.55,37.6],[126.45,37.82],[126.7,37.97],[126.95,38.15],[127.1,38.3],[127.6,38.33],[128.0,38.3],[128.35,38.62],[128.1,39.0],[127.6,39.3],[127.4,39.7],[125.2,39.7],[125.0,39.2],[124.7,38.6]];
const CITY_LL={seoul:[126.98,37.57],incheon:[126.70,37.46],suwon:[127.03,37.26],daejeon:[127.38,36.35],daegu:[128.60,35.87],gwangju:[126.85,35.16],busan:[129.08,35.18],changwon:[128.68,35.23],ulsan:[129.31,35.54],jeju:[126.53,33.50]};
const BADGE_AT={seoul:[190,66],incheon:[58,92],suwon:[66,172],daejeon:[232,180],daegu:[302,198],gwangju:[58,276],busan:[318,338],changwon:[222,328],ulsan:[322,262],jeju:[206,408]};
const MAP_LOGO={};let MAP_HIT=[];
const mapXY=(lon,lat)=>[180+(lon-127.75)*60.4,(38.85-lat)*74.6];
function inPoly(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))c=!c}return c}
let KR_GRID=null;
function krGrid(){if(KR_GRID)return KR_GRID;const cell=6,cols=60,rows=Math.ceil(450/cell),g=new Uint8Array(cols*rows);
 const toLL=(x,y)=>[127.75+(x-180)/60.4,38.85-y/74.6];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const ll=toLL(c*cell+3,r*cell+3);g[r*cols+c]=inPoly(ll,KR_MAIN)||KR_ISL.some(p=>inPoly(ll,p))?1:0}
 return KR_GRID={g,cols,rows,cell}}
function drawKoreaMap(){
 const cvm=$('koreaMap');if(!cvm)return;const g=cvm.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
 const{g:grid,cols,rows,cell}=krGrid();
 g.fillStyle='#173650';g.fillRect(0,0,360,450);
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=grid[r*cols+c],x=c*cell,y=r*cell;
  if(v===0){if(((c*7+r*13)%23)===0){g.fillStyle='#24506f';g.fillRect(x+1,y+3,4,1)}continue}
  const up=r>0?grid[(r-1)*cols+c]:0,dn=r<rows-1?grid[(r+1)*cols+c]:0,lf=c>0?grid[r*cols+c-1]:0,rt=c<cols-1?grid[r*cols+c+1]:0;
  if(v===2)continue;
  const edge=!up||!dn||!lf||!rt;const ll=[127.75+(x+3-180)/60.4,38.85-(y+3)/74.6];
  const mtn=(ll[0]>128.2&&ll[0]<129.1&&ll[1]>36.3&&ll[1]<38.4&&((c+r)%3!==0))||(ll[0]>127.4&&ll[0]<128.2&&ll[1]>35.1&&ll[1]<35.9&&((c*2+r)%4===0))||(ll[1]<33.6&&Math.hypot(ll[0]-126.53,(ll[1]-33.36)*1.3)<.08);
  g.fillStyle=edge?'#d9c48a':mtn?'#3d7d3e':((c+r)&1)?'#55a24f':'#4f9a4a';g.fillRect(x,y,cell,cell);
  if(!up&&edge){g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x,y,cell,1)}}
 // DMZ line
 g.fillStyle='#c9473d';for(let i=0;i<KR_MAIN.length;i++){}
 {const dmz=[[126.1,37.75],[126.45,37.82],[126.7,37.97],[126.95,38.15],[127.1,38.3],[127.6,38.33],[128.0,38.3],[128.35,38.62]];
  for(let i=0;i<dmz.length-1;i++){const[a,b]=[mapXY(...dmz[i]),mapXY(...dmz[i+1])];const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);for(let k=0;k<n;k+=2){g.fillStyle='rgba(255,220,200,.55)';g.fillRect(Math.round(a[0]+(b[0]-a[0])*k/n)-1,Math.round(a[1]+(b[1]-a[1])*k/n)-1,2,2)}}}
 g.font='9px "Press Start 2P", monospace';g.fillStyle='rgba(255,255,255,.28)';g.fillText('EAST SEA',282,120);g.fillText('YELLOW',18,214);g.fillText('SEA',30,226);
 MAP_HIT=[];
 for(const t of ORDER){const[cx,cy]=mapXY(...CITY_LL[t]),[bx,by]=BADGE_AT[t],T=TEAMS[t];const sel=t===S.you,opp=t===S.opp;
  // leader line (pixel steps)
  const n=Math.ceil(Math.hypot(bx-cx,by-cy)/3);g.fillStyle=sel?'#ffbf3c':'rgba(244,241,232,.75)';for(let k=0;k<n;k++)g.fillRect(Math.round(cx+(bx-cx)*k/n)-1,Math.round(cy+(by-cy)*k/n)-1,2,2);
  g.fillStyle=INK;g.fillRect(Math.round(cx)-3,Math.round(cy)-3,6,6);g.fillStyle=T.jersey;g.fillRect(Math.round(cx)-2,Math.round(cy)-2,4,4);
  const R=sel?24:21;
  if(sel||opp){g.fillStyle=sel?'#ffbf3c':CREAM;g.beginPath();g.arc(bx,by,R+3,0,Math.PI*2);g.fill()}
  g.fillStyle=INK;g.beginPath();g.arc(bx,by,R+1,0,Math.PI*2);g.fill();
  if(!MAP_LOGO[t])MAP_LOGO[t]=makeLogo(t,128);g.imageSmoothingEnabled=true;g.drawImage(MAP_LOGO[t],bx-R,by-R,R*2,R*2);g.imageSmoothingEnabled=false;
  g.font='12px "Pixelify Sans", monospace';g.textAlign='center';const lb=T.city;const tw=g.measureText(lb).width+6;
  g.fillStyle='rgba(8,20,14,.85)';g.fillRect(bx-tw/2,by+R+3,tw,13);g.fillStyle=sel?'#ffbf3c':CREAM;g.fillText(lb,bx,by+R+13);
  if(sel||opp){g.font='7px "Press Start 2P", monospace';const tag=sel?'HOME':'AWAY';const w2=g.measureText(tag).width+6;g.fillStyle=sel?'#ffbf3c':CREAM;g.fillRect(bx-w2/2,by-R-12,w2,10);g.fillStyle=INK;g.fillText(tag,bx,by-R-4)}
  g.textAlign='left';
  MAP_HIT.push({t,x:bx,y:by,r:R+6})}
}
$('koreaMap').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*360,y=(e.clientY-r.top)/r.height*450;
 let best=null,bd=1e9;for(const h of MAP_HIT){const d=Math.hypot(h.x-x,h.y-y);if(d<h.r+8&&d<bd){bd=d;best=h}}
 if(!best)return;if(best.t===S.you)return;if(best.t===S.opp)S.opp=S.you;S.you=best.t;syncPicker();applyCustom();updateHUD();if(FIELD)rebuildPark()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>drawKoreaMap());
function syncPicker(){
 if(S.you===S.opp)S.opp=pick(ORDER.filter(t=>t!==S.you));if(typeof updateOppLine==='function'&&$('oppLine'))try{updateOppLine()}catch(e){}
 for(const c of $('pickYou').children)c.setAttribute('aria-pressed',c.dataset.t===S.you);
 for(const c of $('pickOpp').children){c.setAttribute('aria-pressed',c.dataset.t===S.opp);c.disabled=c.dataset.t===S.you}
 const T=TEAMS[S.you];const mc=$('mascCv').getContext('2d');mc.clearRect(0,0,11,17);blit(mc,MASCOTS[S.you].m,MASCOTS[S.you].c,0,17-MASCOTS[S.you].m.length);
 $('mascTxt').innerHTML=`<b>${T.mascot.toUpperCase()}</b>${T.mdesc}`;
 if($('mLogoY'))refreshMenu();
 drawKoreaMap();
}

