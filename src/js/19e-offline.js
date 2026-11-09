// ---------- offline: the game runs from the stored copy without a connection. Say so when the connection drops or comes back,
// mark multiplayer as needing one, and push any account save once it's back ----------
{const t=$('netToast');let tm=0,tm2=0;
 const say=(msg,ms,good)=>{t.textContent=msg;t.classList.toggle('on',!!good);t.classList.remove('out');t.hidden=false;clearTimeout(tm);clearTimeout(tm2);
  tm=setTimeout(()=>{t.classList.add('out');tm2=setTimeout(()=>t.hidden=true,400)},ms||5000)};
 window.netSay=say;
 const OFF="You're offline. Single player and batting practice still work; multiplayer and account sync need a connection.";
 const sync=()=>document.body.classList.toggle('isOffline',!navigator.onLine);
 addEventListener('offline',()=>{sync();say(S.online&&S.online.inGame?"You're offline. Trying to get back to the match…":OFF,6500)});
 addEventListener('online',()=>{sync();say('Back online.',2500,true);try{if(typeof ACC!=='undefined'&&ACC.user)accPush()}catch(e){}});
 sync();if(!navigator.onLine)setTimeout(()=>say(OFF,6500),1600)}
