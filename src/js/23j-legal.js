// ---------- privacy policy and terms of use: one source (src/legal.html), shown here and as /privacy and /terms ----------
function legalShow(doc){for(const d of document.querySelectorAll('#lgBody .lgDoc'))d.hidden=d.dataset.doc!==doc;
 for(const b of $('lgTabs').children)b.setAttribute('aria-pressed',String(b.dataset.doc===doc));$('lgBody').scrollTop=0}
function legalOpen(doc,back){$('scrLegal').querySelector('.mbtn.back').dataset.go=back||'scrAbout';showScreen('scrLegal');legalShow(doc)}
for(const b of $('lgTabs').children)b.addEventListener('click',()=>legalShow(b.dataset.doc));
document.addEventListener('click',e=>{const a=e.target.closest('[data-legal]');if(!a||!a.closest('#title'))return;e.preventDefault();
 const from=$('scrAcct').hidden?'scrAbout':'scrAcct';legalOpen(a.dataset.legal,from)});
