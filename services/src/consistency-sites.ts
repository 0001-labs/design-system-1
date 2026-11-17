import { CANVAS_POLICY, CANVAS_SANDBOX, FACE_HOSTS } from '../../shared/consistency-canvas';
export { FACE_HOSTS } from '../../shared/consistency-canvas';

export const SITE_ROUTE = /^\/api\/consistency\/sites\/(\d{2}[A-Za-z]{4})\/(pages|page|edit|document|places|connections|badge|delete|api\/[\w/-]{1,160}|files\/[^?#]{1,512})$/;
const METHODS: Record<string, string[]> = { document: ['GET'], places: ['GET'], connections: ['GET'], badge: ['PUT'], delete: ['DELETE'], files: ['GET', 'HEAD'] };
export const EDIT_BYTES = 64 * 1024;
export const NATIVE_PAGE_BYTES = 800_000;
export const BUSINESS_BYTES = 1_000_000;
export const QUERY_LIMIT = 2048;

const UUID = '[0-9a-f-]{36}';
const allow = (pattern: string, ...methods: string[]) => ({ pattern: new RegExp(`^${pattern}$`), methods });
export const API_ROUTES = [
  allow('me', 'GET'), allow('pages', 'GET'), allow('page', 'GET'), allow('history', 'GET'), allow('detached', 'GET'),
  allow('edit', 'POST'), allow('reset', 'POST'),
  allow('composition', 'GET', 'PUT'),
  allow('native-page', 'GET', 'PUT'),
  allow('library', 'GET', 'PUT', 'DELETE'),
  allow('emails/templates/[a-z][a-z0-9-]{0,63}', 'GET', 'PUT'),
  allow('emails/flows', 'GET', 'PUT'),
  allow('emails', 'GET'), allow('emails/templates', 'GET'), allow('emails/[\\w-]{1,64}', 'GET'),
  allow('meetings', 'GET', 'PUT'), allow('meetings/google', 'POST', 'DELETE'), allow('meetings/google/callback', 'POST'),
  allow('bookings', 'GET'), allow(`bookings/${UUID}`, 'GET'), allow(`bookings/${UUID}/cancel`, 'POST'),
  allow('booking-offers', 'GET', 'PUT'), allow('booking-settings', 'GET', 'PUT'),
  allow('giftcards', 'GET', 'POST'), allow(`giftcards/${UUID}`, 'GET'), allow(`giftcards/${UUID}/pdf`, 'GET'), allow(`giftcards/${UUID}/(?:resend|void)`, 'POST'),
  allow('orders', 'GET'), allow('orders/config', 'GET'), allow(`orders/${UUID}`, 'GET'),
  allow(`orders/${UUID}/(?:confirm|cancel|mark-paid|invoice|fulfil)`, 'POST'), allow(`orders/${UUID}/note`, 'PUT'), allow('order-settings', 'GET', 'PUT'),
  allow('business', 'POST'),
  allow('peer-products/[a-zA-Z0-9_-]{1,120}/photos', 'POST'),
  allow('peer-products/[a-zA-Z0-9_-]{1,120}', 'GET', 'PUT'),
  allow('peer-products(?:/[a-zA-Z0-9_-]{1,120}(?:/photos/[a-zA-Z0-9_-]{1,120})?)?', 'GET'),
] as const;

export const apiRoute = (path: string) => API_ROUTES.find(each => each.pattern.test(path)) ?? null;

export const DOCUMENT_POLICY = `sandbox ${CANVAS_SANDBOX}; ${CANVAS_POLICY}; frame-ancestors 'self'`;
export const FILE_POLICY = `sandbox; default-src 'none'; style-src 'unsafe-inline' ${FACE_HOSTS.styles}; img-src 'self' data:; font-src 'self' data: ${FACE_HOSTS.fonts}; frame-ancestors 'self'`;
const CANVAS_TYPE = /^(?:text\/css|font\/[\w.+-]+|application\/font-woff|image\/[\w.+-]+|video\/[\w.+-]+)(?:;|$)/i;

interface Gateway { CONSISTENCY_WORKSPACE?: Fetcher }

export type Person = { owner: true } | { owner: false; email: string };
const WORKSPACE_CODE = /^\d{2}[A-Za-z]{4}$/;
export function personHeaders(person: Person, request: Request, extra: Record<string, string> = {}): Headers {
  const headers = new Headers(extra);
  headers.set('X-C9y-Actor', person.owner ? 'owner' : `member ${person.email}`);
  const workspace = request.headers.get('X-C9y-Workspace');
  if (workspace && WORKSPACE_CODE.test(workspace)) headers.set('X-C9y-Workspace', workspace);
  return headers;
}


const refuse = (error: string, status: number, headers: Record<string, string> = {}) => Response.json({ error }, { status, headers });

export const isPagePath = (value: string | null): value is string => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && value.length <= 512 && !/[\p{Cc}\\]/u.test(value);

async function bounded(request: Request, limit: number): Promise<Uint8Array | null> {
  const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  if (reader) for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); return null; } chunks.push(value); }
  const body = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export async function sitesApi(request: Request, env: Gateway, authorize: (request: Request) => Promise<Response | Person>): Promise<Response> {
  const url = new URL(request.url);
  const match = SITE_ROUTE.exec(url.pathname);
  if (!match) return refuse('Not found', 404);
  const named = match[2]!;
  const route = named.startsWith('files/') ? 'files' : named.startsWith('api/') || named === 'pages' || named === 'page' || named === 'edit' ? 'api' : named;
  const path = route === 'api' ? (named.startsWith('api/') ? named.slice(4) : named) : '';
  const allowed = route === 'api' ? apiRoute(path) : null;
  if (route === 'api' && !allowed) return refuse('Not found', 404);
  const person = await authorize(new Request(request.url, { headers: request.headers })); if (person instanceof Response) return person;
  if (route === 'delete' && !person.owner) return refuse('Not found', 404);
  if ((path === 'emails/flows' || /^meetings(?:\/|$)/.test(path)) && !person.owner) return refuse('Not found', 404);
  const methods = allowed ? [...allowed.methods] : METHODS[route]!;
  if (!methods.includes(request.method)) return refuse('Method not allowed', 405, { Allow: methods.join(', ') });
  if (url.search.length > QUERY_LIMIT) return refuse('Bad query', 400);
  const page = url.searchParams.get('path');
  if ((path === 'page' || path === 'composition' || path === 'native-page' || route === 'document') && !isPagePath(page)) return refuse('Bad path', 400);
  let body: Uint8Array | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (request.headers.get('Origin') !== url.origin || request.headers.get('Content-Type')?.split(';')[0]?.trim() !== 'application/json') return refuse('Forbidden', 403);
    const read = await bounded(request, route === 'delete' || route === 'badge' ? 256 : /^peer-products\/[a-zA-Z0-9_-]{1,120}\/photos$/.test(path) ? 13_400_000 : path === 'business' ? BUSINESS_BYTES : path === 'native-page' ? NATIVE_PAGE_BYTES : EDIT_BYTES);
    if (!read) return refuse('Too large', 413);
    body = read;
  }
  if (!env.CONSISTENCY_WORKSPACE) return refuse('Workspace unavailable', 503);
  const search = route === 'api' && path !== 'page' ? url.search : path === 'page' || route === 'document' ? `?path=${encodeURIComponent(page!)}` : '';
  const target = route === 'api' ? `/api/consistency/sites/${match[1]}/api/${path}` : url.pathname;
  const answer = await env.CONSISTENCY_WORKSPACE.fetch(new Request(`https://workspace.internal${target}${search}`, { method: request.method, body, headers: personHeaders(person, request, body ? { 'Content-Type': 'application/json' } : request.headers.has('If-None-Match') ? { 'If-None-Match': request.headers.get('If-None-Match')! } : {}) }));
  if (route !== 'document' && route !== 'files') {
    const result = new Response(answer.body, answer);
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    return result;
  }
  const type = answer.headers.get('Content-Type') ?? '';
  const result = new Response(answer.body, answer);
  if (answer.ok && route === 'document' && !/^text\/html(?:;|$)/i.test(type)) return refuse('Not a page', 502);
  if (answer.ok && route === 'files' && !CANVAS_TYPE.test(type)) return refuse('Not a file the page draws with', 415);
  result.headers.set('Content-Security-Policy', route === 'document' ? DOCUMENT_POLICY : FILE_POLICY);
  result.headers.set('X-Content-Type-Options', 'nosniff');
  result.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return result;
}

export function googleReturn(url: URL, headers: Record<string, string>): Response {
  const state = url.searchParams.get('state') ?? '', code = url.searchParams.get('code') ?? '', error = url.searchParams.get('error') ?? '';
  const site = /^(\d{2}[A-Za-z]{4})\.[\w-]{20,120}$/.exec(state)?.[1];
  const back = new URLSearchParams(site ? { open: site } : {});
  if (site && code && code.length <= 2000 && !error) { back.set('google_code', code); back.set('google_state', state); }
  else if (site) back.set('google_error', /^[a-z_]{1,40}$/.test(error) ? error : 'failed');
  const target = `/${back.size ? `?${back.toString()}` : ''}`.replace(/&/g, '&amp;');
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><title>Consistency</title></head><body><p><a href="${target}">Continue to Consistency</a></p></body></html>`, {
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" },
  });
}
