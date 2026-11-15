// ---------- how to play: a short paged tutorial. It opens by itself the first time a player starts a game,
// then continues into that game; the TUTORIAL button on the main menu opens it any time ----------
const HOW_KEY='pd-how';
const howSeen=()=>{try{return localStorage.getItem(HOW_KEY)==='1'}catch(e){return true}};
function howMark(){try{localStorage.setItem(HOW_KEY,'1')}catch(e){}$('goHow').classList.remove('mmNew')}
const howTouch=()=>!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const kb=k=>`<kbd>${k}</kbd>`;
function howSteps(){const t=howTouch(),or=(a,b)=>t?a:b;return[
 {t:'THE GAME',art:'field',p:[
  'Score more runs than the other club.',
  'When your team is up, you <b>bat</b>. In Full Game and multiplayer you also <b>pitch</b> when they’re up.',
  'Fielding and running the bases happen on their own. Your job is timing.']},
 {t:'BATTING',art:'swing',p:[
  `Swing when the ball reaches the plate: ${or('tap the field or press <b>SWING</b>',kb('Space')+' or click')}.`,
  'Early pulls the ball, late pushes it the other way. Right on time is where the power is.',
  `Lay off pitches outside the box. Four balls is a walk. ${or('<b>BUNT</b>',kb('B'))} before the pitch arrives to bunt.`]},
 {t:'PITCHING',art:'meter',p:[
  `Pick a pitch from your pitcher’s arsenal: ${or('tap its button','its button or '+kb('1')+'–'+kb('5'))}.`,
  `A meter swings back and forth. Stop it in the <b class="hG">green</b> with ${or('a tap',kb('Space'))}. The <b class="hP">bright middle</b> is PERFECT and paints the corner.`,
  'A sloppy release misses the zone, and a tired arm can get away from the catcher. Mix speeds to wreck their timing.']},
 {t:'ARMS AND RUNNERS',art:'stam',p:[
  `Every pitch and every hit wears your pitcher down. When he’s tiring, ${or('tap his box','click his box or press '+kb('B'))} to bring in a reliever.`,
  `Steal by ${or('tapping a runner',kb('S')+' or clicking a runner')}. Pitching, you can throw over to first or second${or('',' with '+kb('Q')+' / '+kb('W'))}.`,
  `${or('The pause button',kb('Esc'))} pauses the game.`]},
 {t:'YOUR TEAM',art:'cards',p:[
  'Win games and hit home runs to earn <b>coins</b>. Spend them on card packs in the <b>SHOP</b>.',
  'Put your new players in the lineup under <b>TEAM</b>, and level them up as they play.',
  'Make an <b>ACCOUNT</b> to keep your team on every device.']},
 {t:'WHERE TO START',art:'modes',p:[
  '<b>ARCADE</b>: three innings, batting only. The best first game.',
  '<b>BATTING PRACTICE</b>: an empty park to get your timing down.',
  '<b>FULL GAME</b> and <b>PLAYOFFS</b> when you’re ready to pitch too, then <b>RANKED</b> against real players.']}]}
const HOW_ART={
 field:'<div class="hArt hField"><i class="hb h1"></i><i class="hb h2"></i><i class="hb h3"></i><i class="hb hh"></i><b>YOU</b><em>THEM</em></div>',
 swing:'<div class="hArt hTime"><span>EARLY<small>pull</small></span><span class="on">ON TIME<small>power</small></span><span>LATE<small>other way</small></span></div>',
 meter:'<div class="hArt hMeter"><div class="rmBar"><i class="rmG"></i><i class="rmP"></i><b></b></div><small>STOP IT IN THE MIDDLE</small></div>',
 stam:'<div class="hArt hStam"><span>STAMINA</span><div><i></i></div><small>TIRING: GO TO THE BULLPEN</small></div>',
 cards:'<div class="hArt hCards"><i></i><i></i><i></i></div>',
 modes:'<div class="hArt hModes"><span class="a">ARCADE</span><span class="b">FULL GAME</span><span class="c">RANKED</span></div>'};
const HOW={i:0,then:null};
function howRender(){const st=howSteps(),i=HOW.i=clamp(HOW.i,0,st.length-1),s=st[i],last=i===st.length-1;
 $('howStep').innerHTML=`${HOW_ART[s.art]||''}<h3>${s.t}<small>${i+1} / ${st.length}</small></h3>${s.p.map(x=>`<p>${x}</p>`).join('')}`;
 $('howDots').innerHTML=st.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('');
 $('howPrev').disabled=i===0;$('howNext').textContent=last?(HOW.then?'LET’S PLAY':'GOT IT'):'NEXT';$('howSkip').hidden=last||!HOW.then}
function howOpen(then){HOW.i=0;HOW.then=then||null;howMark();showScreen('scrHow');howRender();track('tutorial_opened',{auto:!!then})}
function howDone(){const go=HOW.then;HOW.then=null;track('tutorial_done',{step:HOW.i+1});if(go){showScreen(go.screen);go.btn.click()}else showScreen('scrMain')}
$('howNext').addEventListener('click',()=>{if(HOW.i>=howSteps().length-1){howDone();return}HOW.i++;howRender()});
$('howPrev').addEventListener('click',()=>{HOW.i--;howRender()});
$('howSkip').addEventListener('click',howDone);
$('goHow').addEventListener('click',()=>{HOW.i=0;HOW.then=null;howMark();howRender()});
addEventListener('keydown',e=>{if($('scrHow').hidden||$('title').hidden)return;
 if(e.key==='ArrowRight'){e.preventDefault();$('howNext').click()}else if(e.key==='ArrowLeft'&&HOW.i>0){e.preventDefault();$('howPrev').click()}});
// a first-timer's first game goes through the tutorial first, then straight on into the game they picked
for(const [id,screen] of [['go','scrSingle'],['goFull','scrSingle'],['goPO','scrSingle'],['goRanked','scrMulti']]){const b=$(id);if(!b)continue;
 b.addEventListener('click',e=>{if(howSeen()||HOW.then)return;e.stopImmediatePropagation();e.preventDefault();howOpen({btn:b,screen})},true)}
if(!howSeen())$('goHow').classList.add('mmNew');
