import { expect, test, vi } from 'vite-plus/test';
import { consistencyPreview } from '../src/consistency';

const env = { REPORTS_AUTH_URL: 'https://example.convex.cloud', ASSETS: { fetch: vi.fn() } } as any;
test('Apple form-post reaches Convex before landing routing, with only flow cookies and the raw body', async () => {
  const body = 'code=provider-code&state=provider-state';
  const send = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { Location: '/app/signin?code=return-code', 'Set-Cookie': '__Host-appleOAuthstate=; Max-Age=0; Secure; Path=/' } }));
  const response = await consistencyPreview(new Request('https://consistency.site/api/auth/callback/apple', {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Bearer private-session', Cookie: '__Host-c9y_owner=private; __Host-ds1-dashboard=private; __Host-appleOAuthstate=state; __Host-appleOAuthpkce=proof' },
  }), env, send);
  const [url, init] = send.mock.calls[0]!;
  expect(String(url)).toBe('https://example.convex.site/api/auth/callback/apple');
  expect(init.headers.get('cookie')).toBe('__Host-appleOAuthstate=state; __Host-appleOAuthpkce=proof');
  expect(init.headers.has('authorization')).toBe(false);
  expect(new TextDecoder().decode(init.body)).toBe(body);
  expect(init.redirect).toBe('manual');
  expect(response.status).toBe(302);
  expect(response.headers.get('set-cookie')).toContain('__Host-appleOAuthstate=');
  expect(response.headers.get('cache-control')).toBe('no-store');
});

test('Google starts on the canonical origin and rejects unexpected hosts, methods and upstreams', async () => {
  const send = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { Location: 'https://accounts.google.com/' } }));
  const request = (host: string, method = 'GET') => new Request(`https://${host}/api/auth/signin/google`, { method });
  expect((await consistencyPreview(request('consistency.site'), env, send)).status).toBe(302);
  send.mockClear();
  expect((await consistencyPreview(request('editor.c9y.site'), env, send)).status).toBe(404);
  expect((await consistencyPreview(request('consistency.site', 'POST'), env, send)).status).toBe(405);
  expect((await consistencyPreview(request('consistency.site'), { ...env, REPORTS_AUTH_URL: 'https://elsewhere.example' }, send)).status).toBe(503);
  expect(send).not.toHaveBeenCalled();
});

test('an unavailable backend returns a noncacheable failure without exposing its error', async () => {
  const response = await consistencyPreview(new Request('https://consistency.site/api/auth/signin/apple'), env, vi.fn().mockRejectedValue(new Error('private upstream details')));
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.text()).not.toContain('private upstream');
});
