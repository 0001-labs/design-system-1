import type { ReportsEnv } from './reports';

const PATH = /^\/api\/auth\/(signin|callback)\/(google|apple)$/;
const COOKIE = /^__Host-(?:google|apple)(?:OAuth(?:pkce|state|nonce)|RedirectTo)$/;

export const isSocialAuthPath = (path: string) => PATH.test(path);

/** Consistency's provider callback uses its own domain; only flow cookies reach Convex. */
export async function consistencySocialAuth(request: Request, env: ReportsEnv, send: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  const match = PATH.exec(url.pathname);
  const privateHeaders = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (!match || url.origin !== 'https://consistency.site') return new Response(null, { status: 404, headers: privateHeaders });
  const methods = match[1] === 'callback' && match[2] === 'apple' ? ['GET', 'POST'] : ['GET'];
  if (!methods.includes(request.method)) return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: methods.join(', ') } });
  if (!/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(env.REPORTS_AUTH_URL ?? '')) return new Response(null, { status: 503, headers: privateHeaders });
  const upstream = new URL(url.pathname + url.search, env.REPORTS_AUTH_URL!.replace(/\.cloud$/, '.site'));
  const headers = new Headers(request.headers);
  for (const name of ['host', 'cookie', 'authorization', 'connection', 'content-length', 'transfer-encoding', 'upgrade', 'x-forwarded-host', 'proxy-authorization']) headers.delete(name);
  const cookies = (request.headers.get('cookie') ?? '').split(';').map(pair => pair.trim()).filter(pair => COOKIE.test(pair.split('=')[0] ?? ''));
  if (cookies.length) headers.set('cookie', cookies.join('; '));
  try {
    const response = await send(upstream, {
      method: request.method, headers,
      body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
      redirect: 'manual', signal: AbortSignal.timeout(15_000),
    });
    const result = new Response(response.body, response);
    for (const [key, value] of Object.entries(privateHeaders)) result.headers.set(key, value);
    return result;
  } catch {
    return new Response('Sign-in is temporarily unavailable.', { status: 503, headers: privateHeaders });
  }
}
