// ---------- logos (vector badges) ----------
function circ(g,x,y,r){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
function ell(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);g.fill()}
function poly(g,...p){g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill()}
function line(g,x1,y1,x2,y2){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function drawEmblem(g,key){
 const T=TEAMS[key],e=T.emblem;g.lineCap='round';
 if(e==='heron'){
  g.strokeStyle=CREAM;g.lineWidth=.06;line(g,-.05,.3,-.14,.78);line(g,.06,.3,.02,.78);
  g.fillStyle=CREAM;ell(g,-.05,.2,.42,.2,-.25);poly(g,-.4,.28,-.7,.46,-.38,.12);
  g.fillStyle=T.jersey;ell(g,-.1,.2,.26,.1,-.25);
  g.strokeStyle=CREAM;g.lineWidth=.13;g.beginPath();g.moveTo(.22,.1);g.bezierCurveTo(.48,-.06,.0,-.2,.15,-.45);g.stroke();
  g.fillStyle=CREAM;circ(g,.17,-.48,.12);
  g.fillStyle='#ffbf3c';poly(g,.25,-.54,.78,-.45,.25,-.41);
  g.strokeStyle=INK;g.lineWidth=.05;line(g,.07,-.56,-.22,-.66);
  g.fillStyle=INK;circ(g,.2,-.51,.035);
 }else if(e==='fox'){
  g.fillStyle='#ef5a3a';poly(g,-.62,-.05,-.52,-.72,-.18,-.32,.18,-.32,.52,-.72,.62,-.05,0,.64);
  g.fillStyle=INK;poly(g,-.48,-.56,-.3,-.34,-.44,-.24);poly(g,.48,-.56,.3,-.34,.44,-.24);
  g.fillStyle=CREAM;poly(g,-.62,-.05,-.1,.2,0,.64);poly(g,.62,-.05,.1,.2,0,.64);
  g.fillStyle=INK;ell(g,-.22,-.08,.08,.04,.45);ell(g,.22,-.08,.08,.04,-.45);circ(g,0,.56,.07);
 }else if(e==='bee'){
  g.fillStyle='rgba(244,241,232,.92)';ell(g,-.05,-.38,.2,.32,-.4);ell(g,.2,-.34,.16,.28,.35);
  g.save();g.beginPath();g.ellipse(.05,.12,.5,.32,0,0,Math.PI*2);g.clip();
  g.fillStyle=T.jersey;g.fillRect(-.5,-.3,1.1,.9);g.fillStyle=INK;g.fillRect(-.12,-.3,.12,.9);g.fillRect(.18,-.3,.12,.9);g.restore();
  g.fillStyle=INK;circ(g,-.5,.06,.2);poly(g,.53,.06,.8,.13,.53,.2);
  g.fillStyle=CREAM;circ(g,-.57,0,.055);
  g.strokeStyle=INK;g.lineWidth=.045;
  g.beginPath();g.moveTo(-.52,-.12);g.quadraticCurveTo(-.62,-.3,-.68,-.46);g.stroke();
  g.beginPath();g.moveTo(-.42,-.12);g.quadraticCurveTo(-.4,-.32,-.33,-.48);g.stroke();
  g.fillStyle=INK;circ(g,-.68,-.48,.05);circ(g,-.33,-.5,.05);
 }else if(e==='koi'){
  g.fillStyle=T.jersey;poly(g,.3,0,.78,-.44,.62,0,.78,.44);poly(g,-.15,.26,-.04,.52,.12,.22);poly(g,-.12,-.26,-.02,-.5,.12,-.22);
  g.fillStyle=CREAM;g.beginPath();g.moveTo(-.7,0);g.bezierCurveTo(-.62,-.42,.15,-.38,.4,-.05);g.lineTo(.4,.05);g.bezierCurveTo(.15,.38,-.62,.42,-.7,0);g.fill();
  g.fillStyle=T.jersey;circ(g,-.2,-.12,.12);circ(g,.1,.1,.1);circ(g,-.44,-.1,.09);circ(g,.2,-.12,.06);
  g.fillStyle=INK;circ(g,-.54,-.04,.045);
 }else if(e==='owl'){
  g.fillStyle=T.jersey;poly(g,-.5,-.3,-.56,-.78,-.16,-.46);poly(g,.5,-.3,.56,-.78,.16,-.46);ell(g,0,.12,.56,.62);
  g.fillStyle='rgba(244,241,232,.35)';ell(g,0,.42,.3,.24);
  g.fillStyle=CREAM;circ(g,-.23,-.14,.23);circ(g,.23,-.14,.23);
  g.fillStyle=INK;circ(g,-.21,-.12,.1);circ(g,.21,-.12,.1);
  g.fillStyle=CREAM;circ(g,-.18,-.16,.03);circ(g,.24,-.16,.03);
  g.fillStyle='#ffbf3c';poly(g,-.08,.08,.08,.08,0,.28);
 }else if(e==='whale'){
  g.fillStyle='#9fd8f6';circ(g,-.4,-.68,.07);circ(g,-.54,-.58,.06);circ(g,-.26,-.58,.06);g.fillRect(-.43,-.6,.06,.3);
  g.fillStyle=CREAM;g.beginPath();g.moveTo(-.8,.08);g.bezierCurveTo(-.8,-.42,.2,-.38,.48,0);g.lineTo(.84,-.3);g.lineTo(.78,.06);g.lineTo(.9,.38);g.lineTo(.48,.14);g.bezierCurveTo(.2,.5,-.8,.5,-.8,.08);g.fill();
  g.fillStyle=T.cap;g.beginPath();g.moveTo(-.72,.2);g.bezierCurveTo(-.5,.42,0,.42,.3,.22);g.bezierCurveTo(0,.3,-.5,.3,-.72,.2);g.fill();
  g.fillStyle=T.cap;poly(g,-.12,.26,.12,.56,.16,.26);
  g.fillStyle=INK;circ(g,-.52,-.02,.055);
 }else if(e==='tangerine'){
  g.fillStyle='#ff9a1f';circ(g,0,.12,.6);
  g.fillStyle='#ffc56e';ell(g,-.22,-.12,.17,.1,-.5);
  g.fillStyle='#e07a0c';for(const[a,b]of[[.3,.34],[-.08,.5],[.36,-.02],[-.34,.3]])circ(g,a,b,.035);
  g.fillStyle='#6b4a2b';g.fillRect(-.03,-.64,.07,.18);
  g.fillStyle='#3f8f3a';ell(g,.24,-.54,.27,.11,-.45);ell(g,-.14,-.56,.2,.09,.45);
  g.fillStyle=INK;circ(g,-.19,.1,.055);circ(g,.19,.1,.055);
  g.strokeStyle=INK;g.lineWidth=.045;g.beginPath();g.arc(0,.2,.14,.25,Math.PI-.25);g.stroke();
 }else if(e==='dillo'){
  const tan='#d7b48a';
  g.fillStyle=tan;g.fillRect(-.34,.22,.12,.2);g.fillRect(.26,.22,.12,.2);poly(g,.55,.15,.92,.36,.56,.27);
  g.fillStyle=T.jersey;g.beginPath();g.moveTo(-.48,.26);g.bezierCurveTo(-.48,-.48,.6,-.48,.62,.26);g.closePath();g.fill();
  g.strokeStyle='rgba(27,31,36,.45)';g.lineWidth=.05;for(const bx of[-.2,.05,.3]){g.beginPath();g.moveTo(bx,-.26);g.quadraticCurveTo(bx+.05,0,bx,.25);g.stroke()}
  g.fillStyle=tan;ell(g,-.6,.12,.2,.13,-.3);poly(g,-.74,.1,-.96,.24,-.7,.24);poly(g,-.56,0,-.5,-.22,-.44,0);
  g.fillStyle=INK;circ(g,-.64,.07,.03);
 }else if(e==='flamingo'){
  const pk='#ff8cc0';
  g.strokeStyle=pk;g.lineWidth=.05;line(g,.1,.32,.1,.82);line(g,.1,.5,.26,.42);line(g,.26,.42,.16,.32);
  g.fillStyle=pk;ell(g,.12,.14,.38,.21,-.2);
  g.fillStyle='#e05592';ell(g,.2,.1,.22,.11,-.2);
  g.strokeStyle=pk;g.lineWidth=.1;g.beginPath();g.moveTo(-.14,.06);g.bezierCurveTo(-.5,-.1,-.05,-.42,-.3,-.62);g.stroke();
  g.fillStyle=pk;circ(g,-.3,-.62,.11);
  g.fillStyle=CREAM;poly(g,-.38,-.64,-.62,-.5,-.4,-.54);g.fillStyle=INK;poly(g,-.55,-.55,-.64,-.48,-.5,-.5);
  g.fillStyle=INK;circ(g,-.28,-.66,.03);
 }else if(e==='crow'){
  const sv='#c3c9d0';
  g.strokeStyle=INK;g.lineWidth=.05;line(g,0,.3,-.05,.62);line(g,.12,.3,.12,.62);
  g.fillStyle=sv;poly(g,-.38,.16,-.86,.44,-.8,.2);ell(g,-.02,.1,.44,.26,-.2);circ(g,.36,-.2,.2);
  g.fillStyle='#7c858f';ell(g,-.08,.06,.28,.13,-.25);
  g.fillStyle='#ffbf3c';poly(g,.5,-.27,.84,-.17,.5,-.1);
  g.fillStyle=CREAM;circ(g,.4,-.24,.06);g.fillStyle=INK;circ(g,.41,-.24,.03);
 }else if(e==='magpie'){
  g.strokeStyle=INK;g.lineWidth=.05;line(g,0,.3,-.04,.62);line(g,.1,.3,.1,.62);
  g.fillStyle=T.jersey;poly(g,-.28,.14,-.94,.52,-.88,.34,-.34,.02);
  g.fillStyle=INK;ell(g,-.02,.08,.4,.25,-.2);circ(g,.34,-.22,.19);
  g.fillStyle=CREAM;ell(g,.04,.2,.22,.12,-.2);ell(g,-.14,.0,.16,.07,-.3);
  g.fillStyle=INK;poly(g,.48,-.28,.82,-.2,.48,-.13);
  g.fillStyle=CREAM;circ(g,.4,-.26,.05);g.fillStyle=INK;circ(g,.41,-.26,.025);
 }else if(e==='gull'){
  g.lineCap='round';g.strokeStyle=CREAM;g.lineWidth=.14;
  g.beginPath();g.moveTo(-.88,-.12);g.quadraticCurveTo(-.46,-.56,-.06,-.04);g.quadraticCurveTo(.4,-.56,.88,-.12);g.stroke();
  g.strokeStyle=INK;g.lineWidth=.14;line(g,-.88,-.12,-.78,-.22);line(g,.88,-.12,.78,-.22);
  g.fillStyle=CREAM;ell(g,0,.06,.13,.22);circ(g,0,-.14,.11);
  g.fillStyle='#ffbf3c';poly(g,-.04,-.08,.04,-.08,0,.06);
  g.fillStyle=INK;circ(g,-.045,-.17,.022);circ(g,.045,-.17,.022);
 }
}function emblemCanvas(key,px){const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');g.translate(px/2,px/2);g.scale(px/2,px/2);drawEmblem(g,key);return c}
function silhouette(src,col){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c}
function stampEmblem(g,key,cx,cy,d,rot,outline,ow){
 const em=emblemCanvas(key,256),sil=outline?silhouette(em,outline):null;
 g.save();g.translate(cx,cy);g.rotate(rot||0);
 if(sil)for(let a=0;a<8;a++)g.drawImage(sil,-d+Math.cos(a*Math.PI/4)*ow,-d+Math.sin(a*Math.PI/4)*ow,2*d,2*d);
 g.drawImage(em,-d,-d,2*d,2*d);g.restore();
}
function makeLogo(key,size){
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');const T=TEAMS[key],R=size/2,l=T.logo;
 const script=(t,y,em,fill,stroke,x)=>{const cx=R+(x||0)*R;g.save();g.setTransform(1,0,0,1,0,0);g.font=`${em*R}px Yellowtail, "Brush Script MT", cursive`;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  if(stroke){g.lineWidth=R*.1;g.strokeStyle=stroke;g.strokeText(t,cx,R+y*R)}g.fillStyle=fill;g.fillText(t,cx,R+y*R);g.restore()};
 g.translate(R,R);g.scale(R,R);
 if(l==='shield'){
  // crest shield with a ribbon
  const sh=k=>{g.save();g.scale(k,k);g.beginPath();g.moveTo(-.8,-.86);g.lineTo(.8,-.86);g.lineTo(.8,.02);g.quadraticCurveTo(.76,.6,0,.96);g.quadraticCurveTo(-.76,.6,-.8,.02);g.closePath();g.fill();g.restore()};
  g.fillStyle=T.brim;sh(1);g.fillStyle=CREAM;sh(.91);g.fillStyle=T.jersey;sh(.85);g.fillStyle=T.cap;sh(.75);
  stampEmblem(g,key,0,-.2,.6,0,CREAM,.04);
  g.fillStyle=T.brim;poly(g,-.99,.38,-.76,.38,-.76,.7,-.99,.7,-.88,.54);poly(g,.99,.38,.76,.38,.76,.7,.99,.7,.88,.54);
  g.fillStyle=CREAM;poly(g,-.84,.3,.84,.3,.84,.62,-.84,.62);
  script(T.script,.46,.42,T.cap,null);
 }else if(l==='script'){
  // fox head over a script wordmark with a swash
  stampEmblem(g,key,0,-.3,.74,0,T.brim,.06);
  script(T.script,.56,.66,CREAM,T.brim);
  g.strokeStyle=T.brim;g.lineWidth=.12;g.lineCap='round';g.beginPath();g.moveTo(-.6,.88);g.quadraticCurveTo(.1,1,.82,.72);g.stroke();
  g.strokeStyle=T.jersey;g.lineWidth=.06;g.beginPath();g.moveTo(-.6,.88);g.quadraticCurveTo(.1,1,.82,.72);g.stroke();
 }else if(l==='hex'){
  // honeycomb hexagon with crossed bats
  const hex=k=>{g.beginPath();for(let i=0;i<6;i++){const a=(-90+60*i)*RAD;g[i?'lineTo':'moveTo'](Math.cos(a)*k,Math.sin(a)*k)}g.closePath();g.fill()};
  g.fillStyle=T.brim;hex(1);g.fillStyle=INK;hex(.9);g.fillStyle=T.jersey;hex(.83);g.fillStyle=T.cap;hex(.71);
  for(const r of[-.62,.62]){g.save();g.rotate(r);g.fillStyle=INK;poly(g,-.13,-.82,.13,-.82,.06,.72,-.06,.72);g.fillStyle='#e2bc85';poly(g,-.1,-.79,.1,-.79,.035,.69,-.035,.69);circ(g,0,.75,.065);g.fillStyle='#5a3820';g.fillRect(-.04,.42,.08,.24);g.restore()}
  stampEmblem(g,key,0,.03,.6,0,INK,.04);
 }else if(l==='ball'){
  // baseball with a koi leaping across it
  g.fillStyle=T.brim;circ(g,0,0,.98);g.fillStyle=CREAM;circ(g,0,0,.9);
  g.strokeStyle='#c7262e';g.lineWidth=.04;
  g.beginPath();g.arc(-1.28,0,.96,-.6,.6);g.stroke();g.beginPath();g.arc(1.28,0,.96,Math.PI-.6,Math.PI+.6);g.stroke();
  g.lineWidth=.03;for(const sd of[-1,1])for(let k=-5;k<=5;k++){const a=k*.1;const ang=sd<0?a:Math.PI-a;const x=sd*-1.28+Math.cos(ang)*.96,y=Math.sin(ang)*.96;line(g,x-.05,y-.03,x+.05,y+.03)}
  stampEmblem(g,key,.02,-.12,.8,-.38,T.brim,.05);
  script(T.script,.58,.5,T.jersey,T.brim);
 }else if(l==='diamond'){
  // diamond crest with pines and a ribbon
  const dia=k=>{g.beginPath();g.moveTo(0,-k);g.lineTo(k,0);g.lineTo(0,k);g.lineTo(-k,0);g.closePath();g.fill()};
  g.fillStyle=T.brim;dia(1);g.fillStyle=CREAM;dia(.9);g.fillStyle=T.jersey;dia(.84);g.fillStyle=T.cap;dia(.74);
  g.fillStyle='#0f3019';poly(g,-.6,.14,-.46,-.24,-.32,.14);poly(g,-.5,.18,-.38,-.1,-.26,.18);poly(g,.32,.14,.46,-.24,.6,.14);poly(g,.26,.18,.38,-.1,.5,.18);
  stampEmblem(g,key,0,-.14,.5,0,CREAM,.035);
  g.fillStyle=T.brim;poly(g,-.99,.42,-.84,.42,-.84,.7,-.99,.7,-.92,.56);poly(g,.99,.42,.84,.42,.84,.7,.99,.7,.92,.56);
  g.fillStyle=CREAM;poly(g,-.86,.34,.86,.34,.86,.64,-.86,.64);
  script(T.script,.49,.42,T.cap,null);
 }else if(l==='pennant'){
  // felt pennant on a pole
  g.fillStyle=T.brim;poly(g,-.88,-.66,.98,.02,-.88,.7);
  g.fillStyle=T.jersey;poly(g,-.82,-.56,.8,.02,-.82,.6);
  g.fillStyle=CREAM;g.fillRect(-.94,-.7,.16,1.44);g.fillStyle='#8a6a44';g.fillRect(-1,-.96,.08,1.92);g.fillStyle='#ffbf3c';circ(g,-.96,-.98,.06);
  stampEmblem(g,key,-.38,-.12,.36,0,CREAM,.03);
  script(T.script,.18,.36,CREAM,T.brim,.05);
 }else if(l==='sunset'){
  // retro sunset disc
  g.fillStyle=T.brim;circ(g,0,0,.98);
  g.save();g.beginPath();g.arc(0,0,.9,0,Math.PI*2);g.clip();
  ['#ffd36b','#ffa65c','#ff7f7f','#f06aa8','#b04a8f','#7d2f68'].forEach((c,k)=>{g.fillStyle=c;g.fillRect(-1,-.9+k*.3,2,.31)});
  g.fillStyle=T.brim;for(let k=0;k<4;k++)g.fillRect(-1,.12+k*.17,2,.035+k*.02);
  g.restore();
  stampEmblem(g,key,.04,-.14,.62,0,T.brim,.045);
  script(T.script,.64,.32,CREAM,T.brim);
 }else if(l==='monogram'){
  // block C monogram with a crow perched on it
  const arc=(lw,col,inset)=>{g.strokeStyle=col;g.lineWidth=lw;g.lineCap='butt';g.beginPath();g.arc(0,.1,.6,.55+inset,Math.PI*2-.55-inset);g.stroke()};
  arc(.46,T.brim,0);arc(.36,CREAM,.04);arc(.22,T.cap,.08);
  stampEmblem(g,key,.44,-.5,.46,0,CREAM,.035);
 }else if(l==='sea'){
  // harbor sunset: sun on the horizon, rolling waves, a gull overhead
  g.fillStyle=T.brim;circ(g,0,0,.98);
  g.save();g.beginPath();g.arc(0,0,.9,0,Math.PI*2);g.clip();
  g.fillStyle=T.cap;g.fillRect(-1,-1,2,2);
  g.fillStyle=T.jersey;circ(g,0,.3,.44);g.fillStyle='#ffd36b';circ(g,0,.3,.3);
  g.fillStyle='#2f6fb0';g.fillRect(-1,.32,2,.8);
  g.strokeStyle='#bfe3ff';g.lineWidth=.05;
  for(let w=0;w<3;w++){g.beginPath();for(let n=0;n<=20;n++){const xx=-1+n*.1,yy=.44+w*.15+Math.sin(xx*9+w)*.03;n?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
  g.restore();
  stampEmblem(g,key,0,-.32,.55,0,T.cap,.04);
  script(T.script,.66,.38,CREAM,T.brim);
 }else{
  g.fillStyle=T.brim;circ(g,0,0,.99);g.fillStyle=T.jersey;circ(g,0,0,.9);g.fillStyle=T.cap;circ(g,0,0,.79);
  g.strokeStyle=CREAM;g.lineWidth=.035;g.beginPath();g.arc(0,0,.84,0,Math.PI*2);g.stroke();
  g.save();g.scale(.72,.72);drawEmblem(g,key);g.restore();
 }
 return c;
}
const LOGO={},LOGO_URL={};
for(const k of ORDER){LOGO[k]=makeLogo(k,128);LOGO_URL[k]=LOGO[k].toDataURL()}

