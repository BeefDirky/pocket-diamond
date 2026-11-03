// ---------- Big League Series: a second card set of parody big-league stars (collectible only) ----------
// Skin: L light, M medium, T tan, D deep (cartoon palette only). '?' = not given yet, drawn with the medium palette.
const BL_SKIN={L:'#f1c7a1',M:'#e0a97e',T:'#c68a5e',D:'#6e4529','?':'#e0a97e'};
// city label, jersey, cap
const BL_CLUBS={
 ARI:['ARIZONA','#a71930','#e3d4ad'],ATH:['SACRAMENTO','#003831','#efb21e'],ATL:['ATLANTA','#ce1141','#13274f'],BAL:['BALTIMORE','#df4601','#000000'],
 BOS:['BOSTON','#bd3039','#0c2340'],CHC:['NORTH SIDE','#0e3386','#cc3433'],CWS:['SOUTH SIDE','#27251f','#c4ced4'],CIN:['CINCINNATI','#c6011f','#000000'],
 CLE:['CLEVELAND','#e31937','#0c2340'],COL:['COLORADO','#33006f','#c4ced4'],DET:['DETROIT','#0c2340','#fa4616'],HOU:['HOUSTON','#002d62','#eb6e1f'],
 KC:['KANSAS CITY','#004687','#bd9b60'],LAA:['ANAHEIM','#ba0021','#003263'],LAD:['LOS ANGELES','#005a9c','#ef3e42'],MIA:['MIAMI','#00a3e0','#ef3340'],
 MIL:['MILWAUKEE','#12284b','#ffc52f'],MIN:['MINNESOTA','#002b5c','#d31145'],NYM:['QUEENS','#002d72','#ff5910'],NYY:['THE BRONX','#003087','#808080'],
 PHI:['PHILADELPHIA','#e81828','#002d72'],PIT:['PITTSBURGH','#fdb827','#27251f'],SD:['SAN DIEGO','#2f241d','#ffc425'],SF:['SAN FRANCISCO','#fd5a1e','#27251f'],
 SEA:['SEATTLE','#0c2c56','#005c5c'],STL:['ST. LOUIS','#c41e3a','#0c2340'],TB:['TAMPA BAY','#092c5c','#8fbce6'],TEX:['TEXAS','#003278','#c0111f'],
 TOR:['TORONTO','#134a8e','#e8291c'],WSH:['WASHINGTON','#ab0003','#14225a'],
};
// team, name, bats, pos, skin, CON, POW, SPD, DEF
const BL_BATS=[
 ['ARI','Corbin Barrel','L','CF','?',89,87,99,94],['ATH','Nick Hurts','L','1B','L',86,95,43,78],['ATL',"Ronald A'Tuna Jr.",'R','RF','?',93,94,95,88],
 ['BAL','Feet Alonso','R','1B','L',83,98,35,73],['BOS','Willson Corn-Tortillas','R','C','T',92,87,44,80],['CHC','Pete Crow-Armstronger','L','CF','L',93,99,99,99],
 ['CWS','Miguel Fartgas','R','3B','M',89,92,79,85],['CIN','Elly De La Cruise','S','SS','T',93,89,99,90],['CLE','José Jamírez','S','3B','?',94,88,83,91],
 ['COL','Hunter Badman','R','C','L',76,97,38,76],['DET','Kevin McGiggle','L','SS','L',98,81,80,93],['HOU','Yordan Alvarice','L','DH','M',99,99,34,48],
 ['KC','Bobby Bit Jr.','R','SS','L',93,78,99,99],['LAA','Zach Nacho','R','SS','L',87,89,90,96],['LAD','Cookie Betts','R','SS','?',93,81,78,94],
 ['MIA','Lotto Lopez','R','2B','M',98,62,87,98],['MIL','Brice Boomerang','L','2B','M',92,83,90,99],['MIN','Kody Clemens','L','1B','L',78,89,57,77],
 ['NYM','Carson Benge','L','RF','L',85,80,89,91],['NYY','Ben Lice','L','1B','L',89,98,44,77],['PHI','Bryce Harbor','L','1B','?',94,94,67,79],
 ['PIT','Brandon Brow','L','2B','L',83,94,45,79],['SD','Fernando Tacos Jr.','R','RF','T',94,93,93,94],['SF','Rafael Levers','L','1B','M',91,96,40,66],
 ['SEA','Randy Arroz-Arena','R','LF','T',91,87,91,82],['STL','Jordan Balker','R','RF','?',86,91,79,81],['TB','Junior Cannonero','R','3B','M',89,99,64,83],
 ['TEX','Wyatt Longball','R','LF','?',86,89,90,88],['TOR','Kazuma Okramoto','R','3B','L',80,91,39,91],['WSH','James Pood','L','LF','?',85,98,83,79],
];
// team, name, throws, role, skin, VEL, MOV, CTL
const BL_ARMS=[
 ['ARI','Zac Gallon','R','SP','?',90,93,91],['ATH','Luis Sever-Rhino','R','SP','?',96,88,84],['ATL','Chris Snail','L','SP','L',93,99,95],
 ['BAL','Trevor Dodgers','L','SP','L',89,92,88],['BOS','Sonny Day','R','SP','L',89,96,95],['CHC','Shota Ima-Nacho','L','SP','L',82,93,95],
 ['CWS','Sean Berserk','R','SP','L',94,88,89],['CIN','Hunter Mean','R','SP','?',99,92,84],['CLE','Gavin Whiffiams','R','SP','?',97,96,87],
 ['COL','Kyle Freeball','L','SP','?',84,87,90],['DET','Jack Flare-ity','R','SP','?',94,91,86],['HOU','Hunter Frown','R','SP','?',97,95,91],
 ['KC','Seth Lego','R','SP','?',86,95,97],['LAA','Reid Detonators','L','SP','L',93,96,90],['LAD','Yoshi Noodle Yamamoto','R','SP','L',94,99,99],
 ['MIA','Sandy Al-Cannon','R','SP','T',97,91,90],['MIL','Jacob Missile-Rowski','R','SP','L',99,99,97],['MIN','Taj Badly','R','SP','D',95,94,86],
 ['NYM','Kodai Sega','R','SP','?',94,98,83],['NYY','Cam Spittler','R','SP','L',98,99,98],['PHI','Zack Wheelie','R','SP','?',96,95,97],
 ['PIT','Paul Skittles','R','SP','?',99,98,95],['SD','Mason Missile','R','RP','L',99,99,91],['SF','Logan Cobwebb','R','SP','L',86,92,92],
 ['SEA','Logan Giblet','R','SP','L',95,94,94],['STL','Michael McGravy','R','SP','L',84,88,92],['TB','Freddy Piñata','R','SP','?',92,95,84],
 ['TEX','Jacob deGnome','R','SP','?',97,97,96],['TOR','Dylan Cheese','R','SP','L',96,99,91],['WSH','Cade Ravioli','R','SP','L',96,94,91],
];
const BL_PARK={seat:['#33475e','#2c3e52'],pad:'#16324a',pad2:'#0f2638',grass:['#3f9a3a','#4aab45']};
const blTeam=code=>{const c=BL_CLUBS[code];return{city:c[0],name:'',jersey:c[1],cap:c[2],brim:c[2],code}};
// a plain badge in club colors: a star over a ball, no letters
const BL_LOGO={};
function blLogo(code){if(BL_LOGO[code])return BL_LOGO[code];const T=blTeam(code),c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 g.fillStyle='#14181c';g.beginPath();g.arc(32,32,31,0,Math.PI*2);g.fill();g.fillStyle=T.cap;g.beginPath();g.arc(32,32,28,0,Math.PI*2);g.fill();
 g.fillStyle=T.jersey;g.beginPath();g.arc(32,32,23,0,Math.PI*2);g.fill();
 g.fillStyle='#f4f1e8';g.beginPath();g.arc(32,38,10,0,Math.PI*2);g.fill();g.strokeStyle='#d24a3a';g.lineWidth=1.5;
 g.beginPath();g.arc(22,38,8,-.9,.9);g.stroke();g.beginPath();g.arc(42,38,8,Math.PI-.9,Math.PI+.9);g.stroke();
 g.fillStyle='#ffc83a';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?4:9;g.lineTo(32+Math.cos(a)*r,20+Math.sin(a)*r)}g.closePath();g.fill();
 return BL_LOGO[code]=c.toDataURL()}
function buildBigLeague(){const out=[];
 BL_BATS.forEach((b,i)=>{const[code,name,hand,pos,sk,con,pow,spd,def]=b;out.push({id:'bl:b'+i,set:'bl',code,T:blTeam(code),pit:false,p:{name:name.toUpperCase(),hand,thr:hand==='L'?'L':'R',pos,con,pow,spd,def,skin:BL_SKIN[sk]||BL_SKIN['?'],bat:'#d9b07a'}})});
 BL_ARMS.forEach((a,i)=>{const[code,name,hand,role,sk,vel,mov,ctl]=a;out.push({id:'bl:p'+i,set:'bl',code,T:blTeam(code),pit:true,p:{name:name.toUpperCase(),hand,thr:hand,pos:role,vel,mov,ctl,def:null,skin:BL_SKIN[sk]||BL_SKIN['?'],slot:'over'}})});
 // a star set: no commons. Top 15% legend, next 35% epic, the rest rare
 const o=c=>c.pit?Math.round(c.p.vel*.4+c.p.mov*.35+c.p.ctl*.25):Math.round(c.p.con*.3+c.p.pow*.3+c.p.spd*.15+c.p.def*.25);
 out.forEach(c=>c.o=o(c));const s=out.map(c=>c.o).sort((a,b)=>b-a),L=s[Math.floor(s.length*.15)],E=s[Math.floor(s.length*.5)];
 out.forEach(c=>c.r=c.o>=L?3:c.o>=E?2:1);return out}
