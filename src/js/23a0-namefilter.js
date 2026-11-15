// ---------- username filter: offensive names are refused here and, the same way, by the server (migration 010) ----------
// The word lists are ROT13 so the source doesn't read like one. A name is checked in several spellings: lower case, with
// look-alike digits read as letters (0→o 1→i or l 3→e 4→a 5→s 7→t 8→b 9→g), without digits, and with repeated letters
// squeezed. "sub" words are refused anywhere in the name; "exact" words (short ones that hide inside innocent words:
// class, Dickens, cocktail) only as the whole name or as one of its parts, split at _ , capitals and digits.
const NAME_SUB='avtt avttn avtn avte arteb snttbg sntbg xvxr jrgonpx ornare genaal genaavr ergneq tbbx puvatpubat gbjryurnq enturnq uvgyre urvy xxx fjnfgvxn ubybpnhfg crqbcuvy cnrqb crqborne zbyrfg vaprfg orfgvny arpebcuvy shpx spx cuhpx fuvg phag ovgpu ovngpu juber fyhg cbea chffl cravf intvan qvyqb wvmm oybjwbo unaqwbo evzwbo zvys uragnv kkk znfgheong phzfubg pernzcvr ohxxnxr tnatonat betnfz rerpgvba gvggl obbof ahqr anxrq xvyylbhefrys fhvpvqr greebevfg wvunq'.split(' '),NAME_EXACT='fcvp fcvpx pbba cnxv qlxr puvax encr encre encvfg encvat crqb qvpx pbpx gvg gvgf nany phz frk nff nefr ubr wnc gjng anmv snt sntf shx ubeal yrfob avttre xlf'.split(' ');
const rot13=s=>s.replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-97+13)%26+97));
const NAME_BAN={sub:NAME_SUB.map(rot13),exact:new Set(NAME_EXACT.map(rot13))};
const LEET={0:'o',3:'e',4:'a',5:'s',7:'t',8:'b',9:'g'};
function nameForms(s){const l=s.toLowerCase(),leet=one=>l.replace(/[0-9]/g,d=>d==='1'?one:LEET[d]||'').replace(/[^a-z]/g,''),
 squeeze=x=>x.replace(/(.)\1+/g,'$1'),out=new Set();for(const f of[leet('i'),leet('l'),l.replace(/[^a-z]/g,'')]){out.add(f);out.add(squeeze(f))}return[...out].filter(Boolean)}
function nameParts(s){const camel=s.replace(/([a-z0-9])([A-Z])/g,'$1_$2'),out=new Set();
 for(const p of camel.split('_'))for(const f of nameForms(p))out.add(f);
 for(const p of camel.replace(/([A-Za-z])([0-9])/g,'$1_$2').replace(/([0-9])([A-Za-z])/g,'$1_$2').split('_'))if(/[A-Za-z]/.test(p))for(const f of nameForms(p))out.add(f);
 for(const f of nameForms(s))out.add(f);return[...out]}
function nameOffensive(s){if(nameForms(s).some(f=>NAME_BAN.sub.some(w=>f.includes(w))))return true;return nameParts(s).some(p=>NAME_BAN.exact.has(p))}
