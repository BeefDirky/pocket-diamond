// ---------- title picker ----------
function buildPicker(){
 const mk=(id,key)=>{$(id).innerHTML=ORDER.map(t=>`<button type="button" class="chip" data-t="${t}"><img alt="" src="${LOGO_URL[t]}"><span class="c">${TEAMS[t].city}</span><span class="n">${TEAMS[t].name}</span><span class="c kr">${TEAMS[t].kcity} ${TEAMS[t].kname}</span></button>`).join('');
  $(id).addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c||c.disabled)return;S[key]=c.dataset.t;syncPicker();applyCustom();updateHUD();parkDirty()})};
 mk('pickYou','you');mk('pickOpp','opp');syncPicker();
}



