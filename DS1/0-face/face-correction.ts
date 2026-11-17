export interface FaceMetrics {
  ascent: number;
  descent: number;
  capHeight: number;
}

export const SIXTEEN_FACE = { capHeight: 0.71, baseline: 0.742 } as const;

export interface FaceDescriptors {
  sizeAdjust: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
}

export function faceDescriptors({ ascent, descent, capHeight }: FaceMetrics): FaceDescriptors {
  if (!(capHeight > 0) || !(ascent + descent > 0)) throw new Error('A face needs a cap height and a line height');
  const size = SIXTEEN_FACE.capHeight / capHeight;
  const height = Math.max((ascent + descent) * size, SIXTEEN_FACE.baseline);
  const percent = (value: number) => `${+(value * 100).toFixed(2)}%`;
  return {
    sizeAdjust: percent(size),
    ascentOverride: percent((height + SIXTEEN_FACE.baseline) / 2 / size),
    descentOverride: percent((height - SIXTEEN_FACE.baseline) / 2 / size),
    lineGapOverride: '0%',
  };
}

export function faceCorrection(metrics: FaceMetrics): string {
  const { sizeAdjust, ascentOverride, descentOverride, lineGapOverride } = faceDescriptors(metrics);
  return `size-adjust:${sizeAdjust};ascent-override:${ascentOverride};descent-override:${descentOverride};line-gap-override:${lineGapOverride}`;
}

export function correctFaces(css: string, metrics: Readonly<Record<string, FaceMetrics>>): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{};:,])\s*/g, '$1').trim().replace(/@font-face{([^}]*)}/g, (_, body: string) => {
    const family = body.match(/font-family:(['"]?)([^;'"]+)\1(?:;|$)/)?.[2];
    if (!family || !Object.hasOwn(metrics, family)) throw new Error(`No metrics for the face ${family ?? '(unnamed)'}`);
    return `@font-face{${body}${body.endsWith(';') ? '' : ';'}${faceCorrection(metrics[family]!)}}`;
  });
}

export async function correctedGoogleFonts(href: string, metrics: Readonly<Record<string, FaceMetrics>>, init?: RequestInit): Promise<string> {
  const response = await fetch(href, init);
  if (!response.ok) throw new Error(`Google Fonts answered ${response.status} for ${href}`);
  return correctFaces(await response.text(), metrics);
}

export function readFaceMetrics(file: Uint8Array): FaceMetrics {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const tables = new Map<string, number>();
  for (let i = 0, count = view.getUint16(4); i < count; i++) {
    const at = 12 + i * 16;
    tables.set(String.fromCharCode(...file.subarray(at, at + 4)), view.getUint32(at + 8));
  }
  const head = tables.get('head'), hhea = tables.get('hhea'), os2 = tables.get('OS/2');
  if (head === undefined || hhea === undefined || os2 === undefined) throw new Error('Not a TrueType or OpenType face');
  const em = view.getUint16(head + 18);
  const typo = (view.getUint16(os2 + 62) & 0x80) !== 0;
  const ascent = typo ? view.getInt16(os2 + 68) : view.getInt16(hhea + 4);
  const descent = -(typo ? view.getInt16(os2 + 70) : view.getInt16(hhea + 6));
  const capHeight = view.getUint16(os2) >= 2 ? view.getInt16(os2 + 88) : 0;
  if (!capHeight) throw new Error('The face has no cap height in OS/2');
  const fraction = (value: number) => Math.round((value / em) * 10000) / 10000;
  return { ascent: fraction(ascent), descent: fraction(descent), capHeight: fraction(capHeight) };
}
