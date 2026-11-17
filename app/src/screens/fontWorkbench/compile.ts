import { glyphName, type FontSource } from '../../../../shared/font-source';
import { segments } from './geometry';

export async function compileSource(source: FontSource): Promise<ArrayBuffer> {
  const loaded = await import('opentype.js');
  const { Font, Glyph, Path } = 'Font' in loaded && loaded.Font ? loaded : loaded.default;
  const { metrics } = source;
  const glyphs = [new Glyph({ name: '.notdef', advanceWidth: Math.round(metrics.unitsPerEm / 2), path: new Path() })];
  const space = source.glyphs.find(glyph => glyph.unicode === 0x20);
  glyphs.push(new Glyph({ name: 'space', unicode: 0x20, advanceWidth: space?.advance ?? Math.round(metrics.unitsPerEm / 4), path: new Path() }));
  const pathOf = (contours: FontSource['glyphs'][number]['contours'], dx = 0) => {
    const path = new Path();
    for (const contour of contours) {
      const parts = segments(contour);
      if (!parts.length) continue;
      const first = contour[parts[0]!.end]!;
      path.moveTo(first.x + dx, first.y);
      for (const part of [...parts.slice(1), parts[0]!]) {
        const end = contour[part.end]!;
        if (part.controls.length === 2) {
          const a = contour[part.controls[0]!]!, b = contour[part.controls[1]!]!;
          path.curveTo(a.x + dx, a.y, b.x + dx, b.y, end.x + dx, end.y);
        } else if (part !== parts[0]) path.lineTo(end.x + dx, end.y);
      }
      path.close();
    }
    return path;
  };
  const index = new Map<number, number>();
  for (const glyph of source.glyphs) {
    if (glyph.unicode === 0x20) continue;
    index.set(glyph.unicode, glyphs.length);
    glyphs.push(new Glyph({ name: glyphName(glyph.unicode), unicode: glyph.unicode, advanceWidth: glyph.advance, path: pathOf(glyph.contours) }));
  }
  const figures = source.glyphs.filter(glyph => glyph.unicode >= 0x30 && glyph.unicode <= 0x39);
  const figureWidth = metrics.figureWidth ?? Math.max(0, ...figures.map(glyph => glyph.advance));
  const tabular: [number, number][] = [];
  for (const glyph of figures) {
    const xs = glyph.contours.flat().map(point => point.x);
    const dx = xs.length ? Math.round((figureWidth - Math.min(...xs) - Math.max(...xs)) / 2) : Math.round((figureWidth - glyph.advance) / 2);
    tabular.push([index.get(glyph.unicode)!, glyphs.length]);
    glyphs.push(new Glyph({ name: `${glyphName(glyph.unicode)}.tnum`, advanceWidth: figureWidth, path: pathOf(glyph.contours, dx) }));
  }
  const font = new Font({
    familyName: source.family,
    styleName: source.style,
    unitsPerEm: metrics.unitsPerEm,
    ascender: metrics.lineAscent,
    descender: metrics.lineDescent,
    weightClass: source.weight,
    glyphs,
    tables: {
      os2: {
        sTypoAscender: metrics.ascender,
        sTypoDescender: metrics.descender,
        sTypoLineGap: metrics.lineAscent - metrics.lineDescent - (metrics.ascender - metrics.descender),
        usWinAscent: metrics.lineAscent,
        usWinDescent: -metrics.lineDescent,
        sxHeight: metrics.xHeight,
        sCapHeight: metrics.capHeight,
      },
    },
  });
  for (const script of ['DFLT', 'latn']) for (const [sub, by] of tabular) font.substitution.addSingle('tnum', { sub, by }, script, 'dflt');
  return font.toArrayBuffer();
}
