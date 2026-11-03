// ---------- world (SCALE sets pixels per original pixel) ----------
const SCALE=4;
const W=320*SCALE,H=340*SCALE,FT=1.5/SCALE,HX=W/2,HY=300*SCALE;
const toPx=(x,y)=>({x:HX+x/FT,y:HY-y/FT});
const K=SCALE/3;const toPx3=(x,y)=>{const p=toPx(x,y);return{x:p.x/K,y:p.y/K}};
const BASES=[{x:0,y:0},{x:63.64,y:63.64},{x:0,y:127.28},{x:-63.64,y:63.64}];
const baseP=k=>k===4?BASES[0]:BASES[k];
let DIMS=[325,375,400,375,325],ST=null;
function fenceDist(th){const a=clamp(th,-45,45),pts=[-45,-22,0,22,45];for(let k=0;k<4;k++)if(a<=pts[k+1]){const u=(a-pts[k])/(pts[k+1]-pts[k]);return lerp(DIMS[k],DIMS[k+1],u)}return DIMS[4]}
function setStadium(){ST=STADIUMS[S.you];DIMS=ST.dims}
const POS=[
 {n:'pitcher',x:0,y:60.5,sp:19,re:.25,reach:5},
 {n:'catcher',x:0,y:-4.5,sp:17,re:.3,reach:4},
 {n:'first',x:72,y:82,sp:20,re:.22,reach:6},
 {n:'second',x:42,y:142,sp:21,re:.24,reach:6},
 {n:'third',x:-70,y:84,sp:19,re:.24,reach:6},
 {n:'short',x:-44,y:142,sp:22,re:.24,reach:6},
 {n:'left',x:-150,y:255,sp:26,re:.36,reach:7},
 {n:'center',x:0,y:300,sp:27,re:.36,reach:7},
 {n:'right',x:150,y:255,sp:26,re:.36,reach:7},
];
const LEG=90,RS=26,THROW=92,SPEED=1.12,INNINGS=3;let WIN=150;
// timing window: tighter than before, contact still widens it
const winOf=b=>78+.42*b.con;const GOODK=.38,PERFK=.1;
const CAM_PITCH={x:HX,y:846*K,z:4.6},CAM_WIDE={x:HX,y:880*K,z:1.75},CAM_FULL={x:HX,y:H/2,z:1};
const MASCOT_AT={x:66,y:26};
function cheerFrame(){const along=150,perp=60;return toPx3((along+perp)/Math.SQRT2,(along-perp)/Math.SQRT2)}
function dugoutFrame(sd){const along=82.5,perp=48.5;return toPx3(sd*(along+perp)/Math.SQRT2,(along-perp)/Math.SQRT2)}
function penSpot(sd,th){const r=fenceDist(sd*th)+9;return{x:sd*r*Math.sin(th*RAD),y:r*Math.cos(th*RAD)}}

const TEAMS={
 seoul:{city:'SEOUL',kcity:'서울',name:'MAGPIES',kname:'까치',script:'Magpies',emblem:'magpie',logo:'shield',
  jersey:'#1f4fa8',cap:'#0d2552',brim:'#081733',mascot:'Kkachi',mdesc:'A magpie in a traditional gat. Brings good news to the home dugout.',
  pitcher:{name:'AHN W.K.',hand:'R',slot:'side'},pen:[{name:'WALSH',hand:'R',slot:'over'},{name:'NOH S.H.',hand:'L',slot:'over'}],
  lineup:[['PARK J.H.','L'],['KIM D.W.','R'],['RAMIREZ','S'],['LEE S.M.','R'],['CHOI W.S.','L'],['JUNG H.S.','R'],['KANG M.G.','R'],['OH J.Y.','L'],['YANG E.S.','R']]},
 busan:{city:'BUSAN',kcity:'부산',name:'GULLS',kname:'갈매기',script:'Gulls',emblem:'gull',logo:'sea',
  jersey:'#ef6a1f',cap:'#123a6b',brim:'#0b2547',mascot:'Gulli',mdesc:'Leads the harbor song from the dugout roof, with an orange bag on his head.',
  pitcher:{name:'BRENNAN',hand:'R',slot:'over'},pen:[{name:'PARK S.W.',hand:'R',slot:'side'},{name:'KOO S.J.',hand:'L',slot:'over'}],
  lineup:[['HWANG M.U.','L'],['JEON J.H.','R'],['SON H.S.','L'],['DAVIS','R'],['YOON D.H.','R'],['HAN D.Y.','S'],['NA J.B.','R'],['KIM M.S.','L'],['YOO K.H.','R']]},
 incheon:{city:'INCHEON',kcity:'인천',name:'KOI',kname:'잉어',script:'Koi',emblem:'koi',logo:'ball',
  jersey:'#d23a2e',cap:'#7a1a14',brim:'#4f100c',mascot:'Ingi',mdesc:'A lucky red koi. Swims laps around the outfield lawn.',
  pitcher:{name:'KIM K.T.',hand:'L',slot:'over'},pen:[{name:'SEO J.Y.',hand:'R',slot:'side'},{name:'MOON S.H.',hand:'R',slot:'over'}],
  lineup:[['CHU S.W.','L'],['CHOI J.U.','R'],['HAN Y.D.','R'],['ESPINAL','R'],['OH T.H.','L'],['PARK S.J.','S'],['JUNG E.S.','R'],['KIM S.H.','L'],['LEE J.K.','R']]},
 gwangju:{city:'GWANGJU',kcity:'광주',name:'OWLS',kname:'부엉이',script:'Owls',emblem:'owl',logo:'diamond',
  jersey:'#3faa5b',cap:'#1d5a32',brim:'#123b20',mascot:'Professor Buong',mdesc:'Wears reading glasses. Has opinions about the infield fly rule.',
  pitcher:{name:'YANG H.S.',hand:'L',slot:'over'},pen:[{name:'JEON S.M.',hand:'R',slot:'side'},{name:'CHUNG H.Y.',hand:'R',slot:'over'}],
  lineup:[['KIM D.H.','R'],['NA S.U.','L'],['CHOI H.S.','L'],['MONTERO','L'],['KIM S.Y.','R'],['LEE W.H.','S'],['HAN J.S.','R'],['PARK C.Y.','L'],['KIM T.J.','R']]},
 daegu:{city:'DAEGU',kcity:'대구',name:'BEES',kname:'꿀벌',script:'Bees',emblem:'bee',logo:'hex',
  jersey:'#f5c935',cap:'#2b2b30',brim:'#151517',mascot:'Buzzi',mdesc:'Does the wave by himself. Hands out honey candy to kids in the front row.',
  pitcher:{name:'WON S.J.',hand:'R',slot:'over'},pen:[{name:'OH D.K.',hand:'R',slot:'side'},{name:'KWAK B.S.',hand:'L',slot:'over'}],
  lineup:[['KOO J.M.','L'],['BAEK S.H.','R'],['PARK H.J.','R'],['GARCIA','R'],['LEE J.H.','L'],['KIM Y.W.','S'],['CHO S.M.','R'],['YUN T.K.','L'],['KANG H.B.','R']]},
 daejeon:{city:'DAEJEON',kcity:'대전',name:'HERONS',kname:'왜가리',script:'Herons',emblem:'heron',logo:'pennant',
  jersey:'#1c9aa0',cap:'#0d4f57',brim:'#083339',mascot:'Captain Wade',mdesc:'A seven-foot heron who lifeguards the outfield pool.',
  pitcher:{name:'RYU M.S.',hand:'L',slot:'over'},pen:[{name:'KIM S.U.',hand:'R',slot:'side'},{name:'MUN D.W.',hand:'R',slot:'over'}],
  lineup:[['JEONG E.H.','L'],['NOH S.M.','R'],['CHAE E.J.','R'],['WILSON','L'],['HA J.W.','R'],['KIM I.H.','S'],['YOO R.G.','R'],['SIM W.J.','L'],['PARK S.K.','R']]},
 suwon:{city:'SUWON',kcity:'수원',name:'FOXES',kname:'여우',script:'Foxes',emblem:'fox',logo:'script',
  jersey:'#1f1f24',cap:'#c8202a',brim:'#8f161d',mascot:'Rusty',mdesc:'A sly fox who patrols the fortress wall and steals hot dogs from the press box.',
  pitcher:{name:'GO Y.S.',hand:'R',slot:'side'},pen:[{name:'PARK Y.H.',hand:'R',slot:'over'},{name:'SON D.H.',hand:'L',slot:'over'}],
  lineup:[['KANG B.S.','L'],['JANG S.W.','R'],['BAE J.K.','R'],['ORTIZ','S'],['HWANG J.S.','R'],['MOON S.J.','L'],['KIM J.W.','R'],['OH Y.S.','L'],['SHIN B.H.','R']]},
 changwon:{city:'CHANGWON',kcity:'창원',name:'ARMADILLOS',kname:'아르마딜로',script:'Dillos',emblem:'dillo',logo:'monogram',
  jersey:'#7d55c9',cap:'#2c1d5c',brim:'#1c1240',mascot:'Dilly',mdesc:'Rolls into a ball during rain delays. Naps under the center-field trees.',
  pitcher:{name:'KOO C.H.',hand:'L',slot:'over'},pen:[{name:'LIM J.S.',hand:'R',slot:'side'},{name:'RYU J.H.',hand:'R',slot:'over'}],
  lineup:[['SON A.R.','L'],['PARK M.S.','R'],['KIM J.K.','R'],['HOLLIS','L'],['KWON H.S.','R'],['SEO H.W.','S'],['DO T.H.','R'],['CHEON J.H.','L'],['OH Y.J.','R']]},
 ulsan:{city:'ULSAN',kcity:'울산',name:'WHALES',kname:'고래',script:'Whales',emblem:'whale',logo:'ball',
  jersey:'#4f9fd8',cap:'#14325a',brim:'#0d2442',mascot:'Gorae',mdesc:'A blue whale who sprays the bullpen from his blowhole on hot days.',
  pitcher:{name:'SHIN H.J.',hand:'R',slot:'over'},pen:[{name:'BAEK J.W.',hand:'L',slot:'side'},{name:'THOMPSON',hand:'R',slot:'over'}],
  lineup:[['JO M.H.','L'],['YOON S.B.','R'],['KIM H.R.','S'],['PEREZ','R'],['LEE D.G.','L'],['CHA S.W.','R'],['NAM K.Y.','R'],['HONG J.S.','L'],['MIN B.K.','R']]},
 jeju:{city:'JEJU',kcity:'제주',name:'TANGERINES',kname:'귤',script:'Tangerines',emblem:'tangerine',logo:'shield',
  jersey:'#f1e9d2',cap:'#f28a1e',brim:'#2f7a3a',mascot:'Gyuli',mdesc:'A round island tangerine. Rolls down the Halla hill after every home run.',
  pitcher:{name:'KO D.H.',hand:'L',slot:'over'},pen:[{name:'YANG J.M.',hand:'R',slot:'over'},{name:'BOO S.H.',hand:'R',slot:'side'}],
  lineup:[['KANG T.Y.','R'],['HYUN J.W.','L'],['MOON B.S.','R'],['SANTOS','L'],['KO S.M.','R'],['YANG H.J.','S'],['BOO D.Y.','R'],['KIM N.H.','L'],['JWA S.U.','R']]},
};
// rating colors: red bad, orange below average, yellow average, green decent, blue great, purple 100+
const RC_STOPS=[[30,4],[45,24],[58,48],[70,90],[82,140],[92,212],[100,278]];
const rcol=v=>{v=clamp(v,30,100);let k=0;while(k<RC_STOPS.length-2&&v>RC_STOPS[k+1][0])k++;const[a0,h0]=RC_STOPS[k],[a1,h1]=RC_STOPS[k+1],h=lerp(h0,h1,clamp((v-a0)/(a1-a0),0,1));return`hsl(${h.toFixed(0)},88%,${(h>180?66:60)}%)`};
const rb=v=>`<b style="color:${rcol(v)}">${v}</b>`;
const ABBR={seoul:'SEL',busan:'BSN',incheon:'ICN',gwangju:'GWJ',daegu:'DGU',daejeon:'DJN',suwon:'SWN',changwon:'CWN',ulsan:'USN',jeju:'JJU'};
const ORDER=['seoul','busan','incheon','gwangju','daegu','daejeon','suwon','changwon','ulsan','jeju'];
