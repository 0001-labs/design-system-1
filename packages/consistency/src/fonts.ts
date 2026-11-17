import { correctedGoogleFonts } from '../../../DS1/0-face/face-correction';
import FACE_METRICS from '../../../DS1/0-face/google-face-metrics.json';

const MONOSPACE_FALLBACK_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const GOOGLE_FONTS = {
  Inter: 'Inter, sans-serif',
  Roboto: 'Roboto, sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  Montserrat: 'Montserrat, sans-serif',
  Poppins: 'Poppins, sans-serif',
  Nunito: 'Nunito, sans-serif',
  'Work Sans': '"Work Sans", sans-serif',
  Manrope: 'Manrope, sans-serif',
  'DM Sans': '"DM Sans", sans-serif',
  'Source Sans 3': '"Source Sans 3", sans-serif',
  Rubik: 'Rubik, sans-serif',
  Urbanist: 'Urbanist, sans-serif',
  Outfit: 'Outfit, sans-serif',
  Raleway: 'Raleway, sans-serif',
  'Noto Sans': '"Noto Sans", sans-serif',
  'Noto Sans JP': '"Noto Sans JP", "Noto Sans", sans-serif',
  Lora: 'Lora, serif',
  'Playfair Display': '"Playfair Display", serif',
  'Source Serif 4': '"Source Serif 4", serif',
  'JetBrains Mono': `"JetBrains Mono", ${MONOSPACE_FALLBACK_STACK}`,
} as const;

export type GoogleFont = keyof typeof GOOGLE_FONTS;
export const GOOGLE_FONT_FAMILIES = Object.keys(GOOGLE_FONTS) as GoogleFont[];

export interface PageFonts { heading?: GoogleFont; text?: GoogleFont }

export const isGoogleFont = (value: unknown): value is GoogleFont => typeof value === 'string' && Object.hasOwn(GOOGLE_FONTS, value);

export function readPageFonts(value: unknown): PageFonts {
  if (!value || typeof value !== 'object') return {};
  const { heading, text } = value as Record<string, unknown>;
  return { ...(isGoogleFont(heading) ? { heading } : {}), ...(isGoogleFont(text) ? { text } : {}) };
}

export function fontTokens(fonts: PageFonts): Record<string, string> {
  return {
    ...(fonts.heading ? { '--ds-typeface-medium': GOOGLE_FONTS[fonts.heading] } : {}),
    ...(fonts.text ? { '--ds-typeface-regular': GOOGLE_FONTS[fonts.text] } : {}),
  };
}

export function googleFontsHref(fonts: PageFonts): string | undefined {
  const weights = new Map<GoogleFont, Set<number>>();
  const add = (family: GoogleFont | undefined, weight: number) => { if (family) weights.set(family, (weights.get(family) ?? new Set()).add(weight)); };
  add(fonts.heading, 500); add(fonts.text, 400);
  if (!weights.size) return undefined;
  const families = [...weights].map(([family, set]) => `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${[...set].sort((a, b) => a - b).join(';')}`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

export function loadPageFonts(fonts: PageFonts, root: Document = document): void {
  const href = googleFontsHref(fonts);
  const current = root.head.querySelector<HTMLElement>('[data-consistency-fonts]');
  if (current?.dataset.consistencyFonts === (href ?? '')) return;
  current?.remove();
  if (!href) return;
  if (!root.head.querySelector('link[data-consistency-fonts-preconnect]')) {
    const preconnect = root.createElement('link');
    preconnect.rel = 'preconnect'; preconnect.href = 'https://fonts.gstatic.com'; preconnect.crossOrigin = ''; preconnect.dataset.consistencyFontsPreconnect = '';
    root.head.append(preconnect);
  }
  const style = root.createElement('style');
  style.dataset.consistencyFonts = href;
  root.head.append(style);
  correctedGoogleFonts(href, FACE_METRICS).then((css) => { style.textContent = css; }, () => {
    if (!style.isConnected) return;
    const link = root.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset.consistencyFonts = href;
    style.replaceWith(link);
  });
}

export const encodePageFonts = (fonts: PageFonts) => `${fonts.heading ?? ''}|${fonts.text ?? ''}`;
export function decodePageFonts(value: string | undefined): PageFonts {
  const [heading, text] = (value ?? '').split('|');
  return readPageFonts({ heading, text });
}
