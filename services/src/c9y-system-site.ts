import { ownerRoutes, ownerSignOut, systemOwner, type OwnerEnv } from './consistency-owner';

export const C9Y_SYSTEM_HOST = 'system.consistency.site';
export const C9Y_DASH_HOST = 'dash.c9y.site';
const databaseApi = '/api/consistency/database-matrix';
const labelApi = /^\/api\/consistency\/sites\/\d{2}[A-Za-z]{4}\/capability-labels\/[a-z]+$/;
const base = '/private-c9y-system/';
const security = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'same-origin', 'X-Content-Type-Options': 'nosniff', Vary: 'Cookie' };
const isPage = (path: string) => /^\/(?:map|components|sites)?$/.test(path) || /^\/(?:components|sites)\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(path);
const isAsset = (path: string) => /^\/private-c9y-system\/assets\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(path);

const answer = (status: number, extra: Record<string, string> = {}, body: string | null = null) => new Response(body, { status, headers: { ...security, ...extra } });
function protect(response: Response): Response {
  const result = new Response(response.body, response);
  for (const [key, value] of Object.entries(security)) result.headers.set(key, value);
  return result;
}

export function isC9ySystemPath(path: string): boolean {
  let decoded = path;
  for (let count = 0; count < 4; count++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { break; }
  }
  const canonical = new URL(decoded.replace(/\\/g, '/').replace(/^\/+/, '/'), 'https://private.invalid').pathname.toLowerCase();
  return canonical.startsWith(base.slice(0, -1));
}

export async function c9ySystemSite(request: Request, env: OwnerEnv & { ASSETS: Fetcher; CONSISTENCY_WORKSPACE?: Fetcher }): Promise<Response> {
  const url = new URL(request.url);
  const dashboard = url.hostname === C9Y_DASH_HOST;
  if ((!dashboard && url.hostname !== C9Y_SYSTEM_HOST) || url.protocol !== 'https:') return answer(404);
  const signingIn = await ownerRoutes(request, env);
  if (signingIn) return protect(signingIn);
  if (url.pathname === '/app/signin') return answer(401, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Sign in to System to open C9Y System.');
  if (url.pathname === '/auth/sign-out') {
    if (request.method !== 'POST') return answer(405, { Allow: 'POST' });
    if (request.headers.get('Origin') !== url.origin) return answer(403);
    const cleared = await ownerSignOut(request, env).then(value => ({ value }), () => null);
    if (!cleared) return answer(503);
    const response = answer(204);
    if (cleared.value) response.headers.append('Set-Cookie', cleared.value);
    return response;
  }
  const matrix = url.pathname === databaseApi;
  const label = labelApi.test(url.pathname);
  if (dashboard && (matrix || label)) {
    if (request.method !== (matrix ? 'GET' : 'PUT')) return answer(405);
    if (label && (request.headers.get('Origin') !== url.origin || request.headers.get('Content-Type')?.split(';')[0] !== 'application/json')) return answer(403);
    if (!(await systemOwner(request, env))) return answer(401);
    if (!env.CONSISTENCY_WORKSPACE) return answer(503);
    const body = label ? await request.text() : null;
    if (body !== null && body.length > 2_000) return answer(413);
    const headers = { 'X-C9y-Actor': 'owner', 'Content-Type': 'application/json' };
    return protect(await env.CONSISTENCY_WORKSPACE.fetch(new Request('https://workspace.internal' + url.pathname, {
      method: request.method, headers, body,
    })));
  }
  if (!['GET', 'HEAD'].includes(request.method)) return answer(404);
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : url.pathname;
  const page = dashboard ? path === '/' || path === '/database' : isPage(path);
  if (!page && !isAsset(url.pathname)) return answer(404);
  if (!(await systemOwner(request, env))) {
    return page ? answer(302, { Location: `/auth/start?silent=1&next=${encodeURIComponent(path)}` }) : answer(404);
  }
  if (page) url.pathname = base;
  return protect(await env.ASSETS.fetch(new Request(url, request)));
}
