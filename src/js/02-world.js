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
 seoul:{city:'SEOUL',kcity:'서울',name:'RATS',kname:'래츠',script:'Rats',emblem:'rat',logo:'shield',
  jersey:'#4a5060',cap:'#c8202a',brim:'#7a1018',mascot:'Chuchu',mdesc:'A subway rat in a conductor\'s cap. Knows every shortcut on Line 2 and squeaks the seventh-inning song.',
  pitcher:{name:'AHN W.K.',hand:'R',slot:'side'},pen:[{name:'WALSH',hand:'R',slot:'over'},{name:'NOH S.H.',hand:'L',slot:'over'}],
  lineup:[['PARK J.H.','L'],['KIM D.W.','R'],['RAMIREZ','S'],['LEE S.M.','R'],['CHOI W.S.','L'],['JUNG H.S.','R'],['KANG M.G.','R'],['OH J.Y.','L'],['YANG E.S.','R']]},
 busan:{city:'BUSAN',kcity:'부산',name:'SEAGULLS',kname:'시걸스',script:'Seagulls',emblem:'seagle',logo:'sea',
  jersey:'#e8642a',cap:'#123a6b',brim:'#0b2547',mascot:'Galmae',mdesc:'Half seagull, half eagle, all attitude. Swoops on foul balls and leads the harbor song from the dugout roof.',
  pitcher:{name:'BRENNAN',hand:'R',slot:'over'},pen:[{name:'PARK S.W.',hand:'R',slot:'side'},{name:'KOO S.J.',hand:'L',slot:'over'}],
  lineup:[['HWANG M.U.','L'],['JEON J.H.','R'],['SON H.S.','L'],['DAVIS','R'],['YOON D.H.','R'],['HAN D.Y.','S'],['NA J.B.','R'],['KIM M.S.','L'],['YOO K.H.','R']]},
 incheon:{city:'INCHEON',kcity:'인천',name:'COSMOS',kname:'코스모스',script:'Cosmos',emblem:'cosmos',logo:'cosmos',
  jersey:'#1d2a5e',cap:'#e94e77',brim:'#a8284e',mascot:'Cosmo',mdesc:'An astronaut who floats in on the flight path from the airport and plants a flag at second base.',
  pitcher:{name:'KIM K.T.',hand:'L',slot:'over'},pen:[{name:'SEO J.Y.',hand:'R',slot:'side'},{name:'MOON S.H.',hand:'R',slot:'over'}],
  lineup:[['CHU S.W.','L'],['CHOI J.U.','R'],['HAN Y.D.','R'],['ESPINAL','R'],['OH T.H.','L'],['PARK S.J.','S'],['JUNG E.S.','R'],['KIM S.H.','L'],['LEE J.K.','R']]},
 gwangju:{city:'GWANGJU',kcity:'광주',name:'CATS',kname:'캣츠',script:'Cats',emblem:'cat',logo:'diamond',
  jersey:'#d0312d',cap:'#1b1b1f',brim:'#0e0e12',mascot:'Nabi',mdesc:'A striped street cat who knocks the rosin bag off the mound and refuses to apologize.',
  pitcher:{name:'YANG H.S.',hand:'L',slot:'over'},pen:[{name:'JEON S.M.',hand:'R',slot:'side'},{name:'CHUNG H.Y.',hand:'R',slot:'over'}],
  lineup:[['KIM D.H.','R'],['NA S.U.','L'],['CHOI H.S.','L'],['MONTERO','L'],['KIM S.Y.','R'],['LEE W.H.','S'],['HAN J.S.','R'],['PARK C.Y.','L'],['KIM T.J.','R']]},
 daegu:{city:'DAEGU',kcity:'대구',name:'KINGS',kname:'킹스',script:'Kings',emblem:'king',logo:'hex',
  jersey:'#1f57c3',cap:'#e8b730',brim:'#a87c12',mascot:'King Dal',mdesc:'A royal from old Dalgubeol in a crown three sizes too big. Knights a fan in the stands every home win.',
  pitcher:{name:'WON S.J.',hand:'R',slot:'over'},pen:[{name:'OH D.K.',hand:'R',slot:'side'},{name:'KWAK B.S.',hand:'L',slot:'over'}],
  lineup:[['KOO J.M.','L'],['BAEK S.H.','R'],['PARK H.J.','R'],['GARCIA','R'],['LEE J.H.','L'],['KIM Y.W.','S'],['CHO S.M.','R'],['YUN T.K.','L'],['KANG H.B.','R']]},
 daejeon:{city:'DAEJEON',kcity:'대전',name:'BEARS',kname:'베어스',script:'Bears',emblem:'bear',logo:'pennant',
  jersey:'#1c2b5a',cap:'#c8202a',brim:'#7a1018',mascot:'Gomi',mdesc:'A big bear who naps in the bullpen between innings and shares bread from the famous bakery with the ball kids.',
  pitcher:{name:'RYU M.S.',hand:'L',slot:'over'},pen:[{name:'KIM S.U.',hand:'R',slot:'side'},{name:'MUN D.W.',hand:'R',slot:'over'}],
  lineup:[['JEONG E.H.','L'],['NOH S.M.','R'],['CHAE E.J.','R'],['WILSON','L'],['HA J.W.','R'],['KIM I.H.','S'],['YOO R.G.','R'],['SIM W.J.','L'],['PARK S.K.','R']]},
 suwon:{city:'SUWON',kcity:'수원',name:'WIZARDS',kname:'위저즈',script:'Wizards',emblem:'wizard',logo:'fortress',
  jersey:'#4b2a8a',cap:'#1b1b22',brim:'#0e0e14',mascot:'Wizzy',mdesc:'A young wizard who casts the rally spell with his bat-wand in the seventh. It works about a third of the time.',
  pitcher:{name:'GO Y.S.',hand:'R',slot:'side'},pen:[{name:'PARK Y.H.',hand:'R',slot:'over'},{name:'SON D.H.',hand:'L',slot:'over'}],
  lineup:[['KANG B.S.','L'],['JANG S.W.','R'],['BAE J.K.','R'],['ORTIZ','S'],['HWANG J.S.','R'],['MOON S.J.','L'],['KIM J.W.','R'],['OH Y.S.','L'],['SHIN B.H.','R']]},
 changwon:{city:'CHANGWON',kcity:'창원',name:'REXES',kname:'렉시즈',script:'Rexes',emblem:'rex',logo:'gear',
  jersey:'#1e8a6e',cap:'#123a32',brim:'#0a2620',mascot:'Rexy',mdesc:'A T-rex in a hard hat from the machine works. Loves high fives, can\'t quite reach them.',
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
// the order the club-select screen walks through (and the picker chips use)
const TS_ORDER=['busan','incheon','gwangju','daegu','seoul','daejeon','suwon','changwon','ulsan','jeju'];
