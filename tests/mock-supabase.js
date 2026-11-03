(()=>{const bc=new BroadcastChannel('mocksupa2');window.__off=false;
function mkChan(name){const h={};let subCb=null;
 bc.addEventListener('message',e=>{const m=e.data;if(m.room!==name||window.__off)return;(h['b:'+m.event]||[]).forEach(f=>setTimeout(()=>f({payload:m.payload}),15));if(m.event==='__join')(h['p:join']||[]).forEach(f=>f({}))});
 const C={on(t,f,cb){h[(t==='broadcast'?'b:':'p:')+f.event]=(h[(t==='broadcast'?'b:':'p:')+f.event]||[]).concat(cb);return C},
  subscribe(cb){setTimeout(()=>{cb('SUBSCRIBED');bc.postMessage({room:name,event:'__join'})},50);return C},
  track:async()=>'ok',untrack:async()=>'ok',
  send:async m=>{if(window.__off)return 'error';bc.postMessage({room:name,event:m.event,payload:JSON.parse(JSON.stringify(m.payload))});return 'ok'}};return C}
window.supabase={createClient:()=>({channel:n=>mkChan(n),removeChannel:async()=>{}})};})();
