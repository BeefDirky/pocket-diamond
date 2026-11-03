// ---------- pixel maps ----------
const BODY=['..ccc..','.bbbbb.','..sss..','..sss..','.jjjjj.','sjjjjjs','s.jjj.s','..jjj..','..ppp..','..p.p..','..p.p..','.kk.kk.'];
const RUNA=['..ccc..','.bbbbb.','..sss..','..sss..','.jjjjj.','sjjjjj.','..jjj.s','..jjj..','..ppp..','.p...p.','p.....p','k.....k'];
const RUNB=['..ccc..','.bbbbb.','..sss..','..sss..','.jjjjj.','.jjjjjs','s.jjj..','..jjj..','..ppp..','..pp...','..p.p..','..k.k..'];
const CATCHER=['..ccc..','.mmmmm.','.msssm.','.gjjjg.','sgggggs','.ggggg.','.ppppp.','pp...pp','kk...kk'];
const MASCOTS={
 blue:{c:{w:CREAM,k:INK,y:'#ffbf3c',b:'#3f82e6'},m:['...kk......','....www....','....wkwyyyy','....www....','.....w.....','.....w.....','....ww.....','...wwww....','..wwwwwww..','.bbwwwwwbb.','.bbwwwwwbb.','..wwwwwww..','...wwwww...','....w.w....','....y.y....','....y.y....','...yy.yy...']},
 red:{c:{r:'#ef5a3a',w:CREAM,k:INK},m:['.r.......r.','.rr.....rr.','.rrrrrrrrr.','rrkrrrrrkrr','rrrrrrrrrrr','.rwwwwwwwr.','..wwwkwww..','...wwwww...','..rrrrrrr..','.rrrwwwrrr.','r.rrwwwrr.r','r.rrrrrrr.r','..rrrrrrr..','...rr.rr...','...rr.rr...','..kkk.kkk..']},
 yellow:{c:{y:'#f5c935',k:INK,w:CREAM},m:['..k.....k..','...k...k...','...yyyyy...','..yykyyky..','..yyyyyyy..','...yyyyy...','.ww.yyy.ww.','wwwykkkywww','.wwyyyyyww.','..ykkkkky..','..yyyyyyy..','..ykkkkky..','...yyyyy...','....kkk....','...k...k...','..kk...kk..']},
 green:{c:{g:'#3faa5b',w:CREAM,k:INK,y:'#ffbf3c'},m:['.g.......g.','.gg.....gg.','..ggggggg..','.gwwwgwwwg.','.gwkwgwkwg.','.gwwwywwwg.','..ggyyygg..','..ggwwwgg..','.gggwwwggg.','gg.gwwwg.gg','g..gwwwg..g','...ggggg...','....ggg....','...yy.yy...','..yyy.yyy..']},
 purple:{c:{t:'#d7b48a',p:'#8a5cd6',q:'#b393ea',w:CREAM,k:INK},m:['..t.....t..','..tt...tt..','...ttttt...','..tktttkt..','..ttttttt..','...ttkkt...','..ppppppp..','.ppwpppwpp.','tpqqqqqqqpt','tpppppppppt','.pqqqqqqqp.','.ppppppppp.','..ppppppp..','...tt.tt...','...tt.tt...','..kkk.kkk..']},
 pink:{c:{f:'#ff8cc0',k:INK,w:CREAM},m:['....fff....','...fkfff...','...fffkk...','....ff.....','...ff......','...f.......','...ff......','....fff....','..fffffff..','.fffwwwfff.','fffffffffff','.fffffffff.','..fffffff..','....f.f....','....f.f....','....f.f....','...ff.ff...']},
 black:{c:{c:'#2a2d33',s:'#b9c0c8',w:CREAM,k:INK,y:'#ffbf3c'},m:['...ccccc...','..ccccccc..','..cwkcwkc..','..ccyyycc..','...ccycc...','...ccccc...','..ccsssc...','cccccsssccc','cc.csssc.cc','c..csssc..c','...csssc...','...ccccc...','....c.c....','....y.y....','...yy.yy...']},
 orange:{c:{o:'#f38d2e',w:CREAM,k:INK},m:['...ooooo...','..owwwwwo..','.owkwwwkwo.','.owwwwwwwo.','..owwoowo..','...ooooo...','..owwwwwo..','oowwowwwwoo','o.owwwwoo.o','..owowwwo..','..owwwoow..','...owwwo...','....w.w....','....w.w....','...ww.ww...','...kk.kk...']},
};
MASCOTS.seoul={c:{c:'#15171c',s:CREAM,w:CREAM,k:INK,y:'#ffbf3c'},m:MASCOTS.black.m};
MASCOTS.busan={c:{w:CREAM,k:INK,y:'#ffbf3c',b:'#9aa3ad',o:'#ff8a1f'},m:['....ooo....','...ooooo...'].concat(MASCOTS.blue.m.slice(2))};
MASCOTS.incheon={c:{o:'#d23a2e',w:CREAM,k:INK},m:MASCOTS.orange.m};
MASCOTS.gwangju=MASCOTS.green;
MASCOTS.daegu=MASCOTS.yellow;MASCOTS.daejeon={c:{...MASCOTS.blue.c,b:'#1c9aa0'},m:MASCOTS.blue.m};MASCOTS.suwon=MASCOTS.red;MASCOTS.changwon=MASCOTS.purple;
MASCOTS.ulsan={c:{...MASCOTS.blue.c,b:'#4f9fd8'},m:MASCOTS.blue.m};MASCOTS.jeju={c:{o:'#ff9a1f',w:CREAM,k:INK},m:MASCOTS.orange.m};
function blit(g,map,cols,x0,y0){
 for(let r=0;r<map.length;r++){const row=map[r];for(let c=0;c<row.length;c++){const ch=row[c];if(ch==='.')continue;const col=cols[ch];if(!col)continue;g.fillStyle=col;g.fillRect(x0+c,y0+r,1,1)}}
}

