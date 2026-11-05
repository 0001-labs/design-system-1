import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { applyDocEdit, docsSiteApi, DOCS_SITE, withDocsSite } from '../src/doc-pages';

const code = '<ComponentExample example="gap" />';
const page = {
  path: '/2-core/gap/', file: '2-core/gap.mdx', mdx: true, title: 'Gap', description: 'Space.', head: 'import X from "y";', source: `import X from "y";\n\nWords.\n\n${code}`,
  blocks: [{ kind: 'text', source: 'Words.', html: '<p>Words.</p>' }, { kind: 'atom', source: code, html: '<section>live</section>' }],
};
const files: Record<string, unknown> = { pages: [{ path: page.path, title: 'Gap', description: 'Space.', file: page.file }], '2-core/gap': page };
function bucket() {
  const store = new Map<string, string>();
  return { store, get: vi.fn(async (key: string) => (store.has(key) ? { json: async () => JSON.parse(store.get(key)!) } : null)), put: vi.fn(async (key: string, value: string) => { store.set(key, value); }), delete: vi.fn(async (key: string) => { store.delete(key); }) };
}
const ASSETS = { fetch: async (request: Request) => { const name = new URL(request.url).pathname.replace('/docs-pages/', '').replace('.json', ''); return name in files ? Response.json(files[name]) : new Response(null, { status: 404 }); } };
const owner = async () => ({ owner: true as const });
const url = (route: string) => `https://consistency.site/api/consistency/sites/${DOCS_SITE.code}/${route}`;
const put = (body: unknown, origin = 'https://consistency.site', host = url('api/docs-page?path=/2-core/gap/')) => new Request(host, { method: 'PUT', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('the documentation as a site', () => {
  let env: { ASSETS: Fetcher; LIBRARIES: R2Bucket; }, libraries: ReturnType<typeof bucket>;
  beforeEach(() => { libraries = bucket(); env = { ASSETS: ASSETS as unknown as Fetcher, LIBRARIES: libraries as unknown as R2Bucket }; });
  const opened = async () => (await docsSiteApi(new Request(url('api/docs-page?path=/2-core/gap/')), env, owner)).json() as Promise<Record<string, unknown> & { text: string; base: string; revision: number }>;

  it('answers the owner alone', async () => {
    expect((await docsSiteApi(new Request(url('places')), env, async () => ({ owner: false, email: 'a@b.co' }))).status).toBe(403);
    const denied = new Response(null, { status: 401 });
    expect(await docsSiteApi(new Request(url('places')), env, async () => denied)).toBe(denied);
    expect(await (await docsSiteApi(new Request(url('places')), env, owner)).json()).toEqual({ places: [{ id: 'pages', label: 'Pages' }] });
  });

  it('lists its pages as Pages expects, each one a page of the build', async () => {
    const { pages } = await (await docsSiteApi(new Request(url('api/pages')), env, owner)).json() as { pages: { path: string; edited: number }[] };
    expect(pages).toEqual([{ path: '/2-core/gap/', lang: 'en', title: 'Gap', fields: 2, edited: 0 }]);
    expect((await docsSiteApi(new Request(url('api/docs-page?path=/nope/')), env, owner)).status).toBe(404);
    expect((await docsSiteApi(new Request(url('api/docs-page?path=/../secret/')), env, owner)).status).toBe(404);
  });

  it('refuses a write from another origin, in another shape, or from the lab', async () => {
    const first = await opened(), body = { base: first.base, revision: 0, text: 'New.' };
    expect((await docsSiteApi(put(body, 'https://evil.example'), env, owner)).status).toBe(403);
    expect((await docsSiteApi(new Request(url('api/docs-page?path=/2-core/gap/'), { method: 'PUT', headers: { Origin: 'https://consistency.site' }, body: '{}' }), env, owner)).status).toBe(403);
    expect((await docsSiteApi(put(body, 'https://editor.c9y.site', `https://editor.c9y.site/api/consistency/sites/${DOCS_SITE.code}/api/docs-page?path=/2-core/gap/`), env, owner)).status).toBe(403);
    expect(libraries.put).not.toHaveBeenCalled();
  });

  it('saves words, keeps every revision, and refuses a stale one', async () => {
    const first = await opened();
    expect(first.text).toBe(`Words.\n\n:doc[1]`);
    const saved = await docsSiteApi(put({ base: first.base, revision: 0, text: 'New words.\n\n:doc[1]' }), env, owner);
    expect(saved.status).toBe(200);
    expect((await opened()).text).toBe('New words.\n\n:doc[1]');
    expect((await docsSiteApi(put({ base: first.base, revision: 0, text: 'Late.' }), env, owner)).status).toBe(409);
    expect((await docsSiteApi(put({ base: 'older', revision: 1, text: 'Late.' }), env, owner)).status).toBe(409);
    expect([...libraries.store.keys()].some(key => key.startsWith('docs/pages/history/2-core/gap/'))).toBe(true);
  });

  it('takes the edit away when the page is back to the build', async () => {
    const first = await opened();
    await docsSiteApi(put({ base: first.base, revision: 0, text: 'New.\n\n:doc[1]' }), env, owner);
    await docsSiteApi(put({ base: first.base, revision: 1, text: 'Words.\n\n:doc[1]' }), env, owner);
    expect(libraries.store.has('docs/pages/2-core/gap.json')).toBe(false);
    expect(JSON.parse(libraries.store.get('docs/pages/edited.json')!)).toEqual([]);
  });

  it('refuses markup the build could not read', async () => {
    const first = await opened();
    const refused = await docsSiteApi(put({ base: first.base, revision: 0, text: 'A <b>tag</b>.' }), env, owner);
    expect(refused.status).toBe(422);
    expect(await refused.json()).toEqual({ error: 'bad-markup' });
  });

  it('edits the title and description as Pages does', async () => {
    const saved = await docsSiteApi(new Request(url('api/edit'), { method: 'POST', headers: { Origin: 'https://consistency.site', 'Content-Type': 'application/json' }, body: JSON.stringify({ path: page.path, key: 'title', markdown: 'Gaps' }) }), env, owner);
    expect(saved.status).toBe(200);
    const { fields } = await (await docsSiteApi(new Request(url('api/page?path=/2-core/gap/')), env, owner)).json() as { fields: { key: string; markdown: string; edited: boolean }[] };
    expect(fields[0]).toMatchObject({ key: 'title', markdown: 'Gaps', edited: true });
    expect((await opened()).text).toBe('Words.\n\n:doc[1]');
  });

  it('leaves a page nobody edited exactly as the build drew it', async () => {
    const response = new Response('<title>Gap</title>', { headers: { 'content-type': 'text/html' } });
    expect(await applyDocEdit(response, '/2-core/gap/', env)).toBe(response);
  });

  it('adds the site to the owner\'s workspace named 0001 alone', async () => {
    const sites = (workspace: string) => Response.json({ workspace, sites: [{ code: '10VNDG' }] });
    const list = async () => [{ code: '01STDO', name: '0001' }, { code: '02CLNT', name: 'Client' }];
    expect(((await (await withDocsSite(sites('01STDO'), list)).json()) as { sites: unknown[] }).sites).toHaveLength(2);
    expect(((await (await withDocsSite(sites('02CLNT'), list)).json()) as { sites: unknown[] }).sites).toHaveLength(1);
  });
});
