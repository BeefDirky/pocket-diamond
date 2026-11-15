#!/usr/bin/env python3
"""Patch Pixelify Sans glyphs that read badly at small sizes.

src/style.css carries a small @font-face per weight (family 'Pixelify Sans', unicode-range limited to the patched
characters) holding square pixel versions of 5, C and H. This script adds the lowercase a and the 2 (whose bottom right pixel sits one up, so its base isn't flat): Pixelify's a has a notch
between its right stem and its foot, so the stem looks like it stops short of the baseline; here the right side
is one straight stem from the top of the bowl to the baseline, and the foot is dropped.

  python3 tools/glyph_fix.py <dir with fontsource pixelify-sans-latin-{400,500,600,700}-normal.woff2>
"""
import base64, io, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FACE = re.compile(r"(@font-face\{font-family:'Pixelify Sans';font-weight:(\d+);font-style:normal;unicode-range:)([^;]+)(;src:url\(data:font/ttf;base64,)([^)]+)(\))")

def straight_a(src):
    """the source a with a straight right side: the stem runs from the top of the bowl straight down to the baseline,
    square at both ends (so it can't be read as an o), and the foot that kicked out past it is gone"""
    gs = src.getGlyphSet(); rec = RecordingPen(); gs['a'].draw(rec)
    contours, cur = [], []
    for op, args in rec.value:
        if op == 'moveTo': cur = [args[0]]
        elif op == 'lineTo': cur.append(args[0])
        elif op == 'closePath': contours.append(cur)
    outer, inner = contours[0], contours[1:]
    # outer: (bowlL,bottom) (bowlL,y) (left,y) (left,y2) (bowlL,y2) (bowlL,top) (stemL,top) (stemL,y3) (stemR,y3) ...
    bottom = outer[0][1]; top = max(y for _, y in outer); tail_r = max(x for x, _ in outer)
    i = next(k for k in range(1, len(outer)) if outer[k][1] == top and outer[k - 1][1] == top)  # (stemL, top)
    stem_r = outer[i + 2][0]
    pts = outer[:i] + [(stem_r, top), (stem_r, bottom)]
    pen = TTGlyphPen(None)
    for c in [pts] + inner:
        pen.moveTo(c[0]); [pen.lineTo(p) for p in c[1:]]; pen.closePath()
    adv, lsb = src['hmtx']['a']
    return pen.glyph(), adv - (tail_r - stem_r), lsb

def square_two(src):
    """the source 2 with its bottom right corner squared: the base runs flat out to the right edge"""
    gs = src.getGlyphSet(); rec = RecordingPen(); gs['two'].draw(rec)
    pts = [a[0] for op, a in rec.value if a]
    bottom = pts[0][1]; right = max(x for x, _ in pts)
    # the outline ends ... (right, y1) (inner, y1) (inner, bottom): replace that notch with the corner (right, bottom)
    assert pts[-1][1] == bottom and pts[-3][0] == right, pts
    pts = pts[:-3] + [(right, bottom)]
    pen = TTGlyphPen(None); pen.moveTo(pts[0]); [pen.lineTo(p) for p in pts[1:]]; pen.closePath()
    return (pen.glyph(),) + tuple(src['hmtx']['two'])

def patch(tt, name, cp, glyph, adv, lsb):
    if name not in tt.getGlyphOrder():
        tt.setGlyphOrder(tt.getGlyphOrder() + [name])
    tt['glyf'].glyphs[name] = glyph; tt['glyf'].glyphOrder = tt.getGlyphOrder()
    tt['hmtx'].metrics[name] = (adv, lsb)
    for t in tt['cmap'].tables: t.cmap[cp] = name
    tt['maxp'].numGlyphs = len(tt.getGlyphOrder())

def main(srcdir):
    p = os.path.join(ROOT, 'src/style.css'); css = open(p, encoding='utf-8').read()
    def sub(m):
        w = m.group(2); src = TTFont(os.path.join(srcdir, f'pixelify-sans-latin-{w}-normal.woff2'))
        tt = TTFont(io.BytesIO(base64.b64decode(m.group(5))))
        patch(tt, 'a', 0x61, *straight_a(src)); patch(tt, 'two', 0x32, *square_two(src))
        buf = io.BytesIO(); tt.flavor = None; tt.save(buf)
        rng = m.group(3) + ''.join(',' + u for u in ('U+0032', 'U+0061') if u not in m.group(3))
        return m.group(1) + rng + m.group(4) + base64.b64encode(buf.getvalue()).decode() + m.group(6)
    css2, n = FACE.subn(sub, css)
    assert n == 4, n
    open(p, 'w', encoding='utf-8').write(css2.replace("its C's long inner arms read as an O:", "its C's long inner arms read as an O,\n   its a's right stem stops short of the baseline\n   and its 2's bottom right corner sits a pixel high:").replace('replaces just those three glyphs', 'replaces just those five glyphs'))
    print('patched', n, 'faces')

if __name__ == '__main__':
    main(sys.argv[1])
