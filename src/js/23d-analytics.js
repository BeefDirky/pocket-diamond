// ---------- analytics: gameplay events to PostHog (see ANALYTICS_EVENTS.md) ----------
// Only the website build sends anything (the key is stamped in by tools/build.py from tools/config.json; the claude.ai
// build has none). Players are known by their account's UUID only: no email, no username, and the PostHog project
// discards IPs. Options → "Share gameplay stats" turns it all off. The authoritative baseball record (ranked results)
// lives in Supabase; this is for how people play: sessions, retention, funnels, popularity, balance samples, errors.
const PH={key:'__PH_KEY__',host:'__PH_HOST__',ready:false,q:[],sample:false};
const phOn=()=>/^phc_/.test(PH.key)&&OPT.stats!==false&&typeof window.claude==='undefined';
// one in five sessions also sends a line per plate appearance (keeps the free tier's 1M events a month far away)
try{let v=sessionStorage.getItem('pd-sample');if(v==null){v=Math.random()<.2?'1':'0';sessionStorage.setItem('pd-sample',v)}PH.sample=v==='1'}catch(e){}
function phLoad(){if(PH.ready||PH.loading||!phOn())return;PH.loading=true;
 const s=document.createElement('script');s.async=true;s.src='https://us-assets.i.posthog.com/static/array.full.js';s.crossOrigin='anonymous';
 s.onload=()=>{try{window.posthog.init(PH.key,{api_host:PH.host,person_profiles:'always',autocapture:false,capture_pageview:true,capture_pageleave:true,
   disable_session_recording:true,persistence:'localStorage',ip:false,property_denylist:['$ip'],
   loaded:ph=>{PH.ready=true;ph.register({/* country only: a PostHog Property Filter transformation strips city, postal code and coordinates */build:PD_VER,layout:document.body.classList.contains('phone')||innerWidth<innerHeight?'phone':'pc',sampled:PH.sample});
    phIdent();for(const [n,p] of PH.q.splice(0))ph.capture(n,p)}})}catch(e){}};
 s.onerror=()=>{PH.loading=false};document.head.appendChild(s)}
// record an event (queued until PostHog has loaded; dropped if stats are off)
function track(name,props){if(!phOn())return;const p={...(props||{}),signed_in:!!ACC.user};
 if(PH.ready)try{window.posthog.capture(name,p)}catch(e){}else{if(PH.q.length<200)PH.q.push([name,p]);phLoad()}}
// the signed-in account is the person (by UUID); signing out starts a fresh anonymous visitor
function phIdent(){if(!PH.ready)return;try{const id=ACC.user&&ACC.user.id;if(id&&window.posthog.get_distinct_id()!==id)window.posthog.identify(id);else if(!id&&PH.who)window.posthog.reset();PH.who=id||null}catch(e){}}
function phOptOut(off){OPT.stats=!off;saveOpts();if(PH.ready)try{off?window.posthog.opt_out_capturing():window.posthog.opt_in_capturing()}catch(e){}if(!off)phLoad()}
// ---- what happens in a game ----
const phGame=()=>{const o=S.online,on=onlineGame();return{mode:on?(o.ranked?'ranked':'custom'):S.mode,club:S.you,opp_club:S.opp,park:S.you,
 innings:S.schedInn||S.totalInn||null,night:!!S.night,series:on?(o.series&&o.series.bo)||1:S.series?S.series.len||null:null,signed_cards:Object.keys(SIGN[S.you]||{}).length}};
function phGameStart(){if(S.mode==='bp'){track('practice_started',{club:S.you});return}PH.g={t0:Date.now(),hr:0};setTimeout(()=>track('game_started',phGame()),0)}
function phGameEnd(win){if(!PH.g||S.mode==='bp')return;const m=ML&&ML.fin?ML:null,mine=m?m.me:'home',secs=Math.round((Date.now()-PH.g.t0)/1000);
 const myPA=m?m.pa.filter(c=>c.bs===mine&&!c.auto):[],res=k=>myPA.filter(c=>k.includes(c.r)).length;
 track('game_ended',{...phGame(),won:!!win,runs_for:mine==='home'?S.runs:S.target,runs_against:mine==='home'?S.target:S.runs,innings_played:S.inning,seconds:secs,
  pa:myPA.length,hits:res(['1B','2B','3B','HR']),hr:res(['HR']),so:res(['K','KL']),bb:res(['BB','IBB','HBP']),auto_pa:m?m.pa.filter(c=>c.bs===mine&&c.auto).length:0,
  match_id:onlineGame()&&S.online.rk?S.online.rk.m:undefined,check_flags:onlineGame()?(S.online.flags||[]).length:undefined});PH.g=null}
function phGameLeft(reason){if(!PH.g||S.mode==='bp'||S.phase==='over')return;const mine=ML?ML.me:'home';
 track('game_abandoned',{...phGame(),reason,inning:S.inning,half:S.half,outs:S.outs,score_diff:(mine==='home'?S.runs-S.target:S.target-S.runs),seconds:Math.round((Date.now()-PH.g.t0)/1000)});PH.g=null}
addEventListener('pagehide',()=>{if(PH.g&&S.phase!=='title')phGameLeft('closed')});
// one line per plate appearance, in sampled sessions only
function phPA(c){if(!PH.sample||!c)return;const lp=c.p[c.p.length-1];const b=c.bs==='home'?S.you:S.opp;
 track('pa_ended',{mode:ML.mode,human:c.auto?'none':onlineGame()?'online':c.bs===(ML.me||'home')?'bat':'pitch',result:c.r,pitches:c.p.length,outs:c.ob,bases:c.bb,
  ev:c.ev,la:c.la,spray:c.sp,last_pitch:lp?lp[0]:null,last_mph:lp?lp[1]:null,swing_err_ms:lp?lp[6]:null,meter_q:lp?lp[4]:null,in_zone:lp?!!lp[3]:null,stamina:lp?lp[7]:null,inning:c.i,batting:b})}
// errors the game's guard caught (one report per distinct message per session)
const phErrSeen=new Set();
function phError(where,e){const m=String(where)+': '+String((e&&e.message)||e).slice(0,300);if(phErrSeen.has(m)||phErrSeen.size>20)return;phErrSeen.add(m);
 track('$exception',{$exception_message:m,$exception_type:(e&&e.name)||'Error',stack:String((e&&e.stack)||'').slice(0,2000),phase:S.phase})}
addEventListener('error',ev=>phError('window',ev.error||ev.message));
addEventListener('unhandledrejection',ev=>phError('promise',ev.reason));
// the options toggle
for(const b of $('optStats').children)b.addEventListener('click',()=>{phOptOut(b.dataset.v==='off');phOptSync()});
function phOptSync(){for(const b of $('optStats').children)b.setAttribute('aria-pressed',String((b.dataset.v==='off')===(OPT.stats===false)))}
phOptSync();if(phOn())setTimeout(phLoad,1500);// after the title screen is up
// ---- the first-visit notice: says stats are collected, links the policy, offers the off switch; shown once ----
const privSeen=()=>{try{return localStorage.getItem('pd-privacy')==='1'}catch(e){return true}};
function privClose(){$('privBar').hidden=true;try{localStorage.setItem('pd-privacy','1')}catch(e){}}
if(/^phc_/.test(PH.key)&&typeof window.claude==='undefined'&&!privSeen())setTimeout(()=>{if(!privSeen())$('privBar').hidden=false},2600);// after the title screen
$('privOk').addEventListener('click',privClose);
$('privOff').addEventListener('click',()=>{phOptOut(true);phOptSync();privClose()});
$('privMore').addEventListener('click',()=>{privClose();showScreen('scrAbout');setTimeout(()=>$('abPriv').scrollIntoView({block:'start',behavior:'smooth'}),60)});
