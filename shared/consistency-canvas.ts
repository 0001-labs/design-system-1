export const CANVAS_SANDBOX = 'allow-same-origin allow-scripts';
export const FACE_HOSTS = { styles: 'https://fonts.googleapis.com', fonts: 'https://fonts.gstatic.com' } as const;
export const BASE_STYLES = 'https://designsystem1.com/ds1/base/';
export const CANVAS_POLICY = `default-src 'none'; script-src 'none'; style-src 'self' 'unsafe-inline' ${FACE_HOSTS.styles} ${BASE_STYLES}; img-src 'self' data: https:; font-src 'self' data: ${FACE_HOSTS.fonts}; media-src 'self' https:; form-action 'none'; base-uri 'none'`;
export function protectCanvasHTML(source: string): string {
  const doctype = source.match(/^\s*<!doctype[^>]*>/i)?.[0] ?? '';
  return `${doctype}<meta http-equiv="Content-Security-Policy" content="${CANVAS_POLICY}">${source.slice(doctype.length)}`;
}
