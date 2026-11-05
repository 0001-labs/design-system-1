/**
 * The documentation as a site in Consistency's app. It is not one of the platform's sites: it is this Worker's own
 * build, so the gateway answers for it here, owner only. A page saved from the app is kept in the libraries bucket
 * (`docs/pages/`, with every revision) and drawn over the build's page as it is delivered, so the words go live at once
 * and a page nobody edited is exactly the build's. `vp run docs:pull` writes saved pages back into their source files.
 */
import { docContents, docRefusal, fromEditable, renderDoc, toEditable, type DocEdit, type DocListing, type DocPage } from '../../shared/doc-pages';
import type { Person } from './consistency-sites';

export const DOCS_SITE_CODE = '01Docs';
export const DOCS_SITE = { code: DOCS_SITE_CODE, name: 'Design system 1', url: 'https://designsystem1.com', domain: 'designsystem1.com', docs: true } as const;
/** A whole page with its Markdown; the largest source page is far under this. */
export const DOC_PAGE_BYTES = 800_000;
const ROUTE = new RegExp(`^/api/consistency/sites/${DOCS_SITE_CODE}/(places|pages|page|edit|detached|api/(?:pages|page|edit|detached|docs-page))$`);
const INDEX_KEY = 'docs/pages/edited.json';
const INDEX_MEMORY_MS = 10_000;

type DocsEnv = { ASSETS: Fetcher; LIBRARIES: R2Bucket };
type Authorize = (request: Request) => Promise<Response | Person>;

export const isDocsSiteRoute = (pathname: string) => pathname.startsWith(`/api/consistency/sites/${DOCS_SITE_CODE}/`);
const refuse = (error: string, status: number, headers: Record<string, string> = {}) => Response.json({ error }, { status, headers });
const nameOf = (path: string) => (path === '/' ? 'index-page' : path.slice(1, -1));
const editKey = (path: string) => `docs/pages/${nameOf(path)}.json`;
const historyKey = (path: string, savedAt: number) => `docs/pages/history/${nameOf(path)}/${savedAt}.json`;
const normal = (pathname: string) => (pathname.endsWith('/') ? pathname : `${pathname}/`);

async function built<T>(env: DocsEnv, name: string): Promise<T | null> {
  const answer = await env.ASSETS.fetch(new Request(`https://designsystem1.com/docs-pages/${name}.json`));
  return answer.ok ? await answer.json() as T : null;
}
const listing = (env: DocsEnv) => built<DocListing[]>(env, 'pages').then(pages => pages ?? []);
const buildPage = (env: DocsEnv, path: string) => (/^\/(?:[\w-]+\/)*$/.test(path) ? built<DocPage>(env, nameOf(path)) : Promise.resolve(null));
async function savedEdit(env: DocsEnv, path: string): Promise<DocEdit | null> {
  const object = await env.LIBRARIES.get(editKey(path));
  return object ? await object.json() as DocEdit : null;
}
/** A short name for the build's page, so a save made against an older build is noticed. */
async function baseOf(page: DocPage): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${page.title}\n${page.description}\n${page.source}`));
  return [...new Uint8Array(digest).slice(0, 8)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

let memory: { paths: Set<string>; at: number } | null = null;
async function editedPaths(env: DocsEnv): Promise<Set<string>> {
  if (memory && Date.now() - memory.at < INDEX_MEMORY_MS) return memory.paths;
  const object = await env.LIBRARIES.get(INDEX_KEY);
  const paths = new Set(object ? await object.json() as string[] : []);
  memory = { paths, at: Date.now() };
  return paths;
}
async function markEdited(env: DocsEnv, path: string, edited: boolean) {
  memory = null;
  const paths = await editedPaths(env);
  if (edited) paths.add(path); else paths.delete(path);
  await env.LIBRARIES.put(INDEX_KEY, JSON.stringify([...paths]), { httpMetadata: { contentType: 'application/json' } });
  memory = null;
}

/** Saves a page, or takes the edit away when the page is back to what the build has. */
async function store(env: DocsEnv, page: DocPage, edit: Omit<DocEdit, 'savedAt' | 'revision' | 'path' | 'base'>, revision: number): Promise<DocEdit> {
  const record: DocEdit = { ...edit, path: page.path, base: await baseOf(page), revision: revision + 1, savedAt: Date.now() };
  const json = JSON.stringify(record), options = { httpMetadata: { contentType: 'application/json' } };
  await env.LIBRARIES.put(historyKey(page.path, record.savedAt), json, options);
  const unchanged = edit.source.trim() === page.source.trim() && edit.title === page.title && edit.description === page.description;
  if (unchanged) await env.LIBRARIES.delete(editKey(page.path));
  else await env.LIBRARIES.put(editKey(page.path), json, options);
  await markEdited(env, page.path, !unchanged);
  return record;
}

async function bounded(request: Request): Promise<unknown> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > DOC_PAGE_BYTES) throw new Response(null, { status: 413 });
  try { return JSON.parse(text); } catch { throw new Response(null, { status: 400 }); }
}

export async function docsSiteApi(request: Request, env: DocsEnv, authorize: Authorize): Promise<Response> {
  const url = new URL(request.url), route = ROUTE.exec(url.pathname)?.[1]?.replace(/^api\//, '');
  if (!route) return refuse('Not found', 404);
  const person = await authorize(new Request(request.url, { headers: request.headers }));
  if (person instanceof Response) return person;
  if (!person.owner) return refuse('Forbidden', 403);
  const write = !['GET', 'HEAD'].includes(request.method);
  if (write && (route !== 'edit' && route !== 'docs-page')) return refuse('Method not allowed', 405);
  if (write && (request.headers.get('Origin') !== url.origin || request.headers.get('Content-Type')?.split(';')[0]?.trim() !== 'application/json')) return refuse('Forbidden', 403);
  // The lab plays with real sites and never saves to one.
  if (write && url.hostname === 'editor.c9y.site') return refuse('Forbidden', 403);

  if (route === 'places') return Response.json({ places: [{ id: 'pages', label: 'Pages' }] });
  if (route === 'detached') return Response.json({ edits: [] });
  if (route === 'pages') {
    const [pages, edited] = await Promise.all([listing(env), editedPaths(env)]);
    return Response.json({ images: [], pages: pages.map(page => ({ path: page.path, lang: 'en', title: page.title, fields: 2, edited: edited.has(page.path) ? 1 : 0 })) });
  }
  if (route === 'page') {
    const path = url.searchParams.get('path') ?? '', page = await buildPage(env, path);
    if (!page) return refuse('unknown-page', 404);
    const edit = await savedEdit(env, path), title = edit?.title ?? page.title, description = edit?.description ?? page.description;
    const field = (key: 'title' | 'description', markdown: string, built_: string) => ({ key, tag: key, kind: 'meta', label: key === 'title' ? 'Title' : 'Description', markdown, built: built_, edited: markdown !== built_ });
    return Response.json({ path, lang: 'en', title, fields: [field('title', title, page.title), field('description', description, page.description)] });
  }
  if (route === 'edit') {
    const body = await bounded(request).catch((answer: Response) => answer) as { path?: unknown; key?: unknown; markdown?: unknown } | Response;
    if (body instanceof Response) return body;
    if (typeof body?.path !== 'string' || (body.key !== 'title' && body.key !== 'description') || typeof body.markdown !== 'string' || body.markdown.length > 400 || /[\n\r]/.test(body.markdown)) return refuse('bad-field', 400);
    const page = await buildPage(env, body.path);
    if (!page) return refuse('unknown-page', 404);
    const edit = await savedEdit(env, body.path);
    const record = await store(env, page, { title: edit?.title ?? page.title, description: edit?.description ?? page.description, source: edit?.source ?? page.source, [body.key]: body.markdown }, edit?.revision ?? 0);
    return Response.json({ html: '', revision: record.revision, edit: { markdown: body.markdown, editor: 'owner', at: record.savedAt } });
  }
  // docs-page
  const path = url.searchParams.get('path') ?? '', page = await buildPage(env, path);
  if (!page) return refuse('unknown-page', 404);
  const saved = await savedEdit(env, path), base = await baseOf(page);
  // Words saved against an older build whose blocks have gone stay in the bucket for `docs:pull`, but the build's page is what opens.
  const edit = saved && !docRefusal(page, saved.source) ? saved : null;
  const answer = (current: DocEdit | null) => ({ ...toEditable(page, current?.source ?? page.source), headings: renderDoc(page, current?.source ?? page.source).headings, path, base, revision: current?.revision ?? 0, title: current?.title ?? page.title, description: current?.description ?? page.description, file: page.file, edited: !!current, superseded: !!saved && !edit });
  if (request.method === 'GET') return Response.json(answer(edit));
  const body = await bounded(request).catch((failure: Response) => failure) as { base?: unknown; revision?: unknown; text?: unknown } | Response;
  if (body instanceof Response) return body;
  if (typeof body?.text !== 'string' || typeof body.revision !== 'number') return refuse('bad-page', 400);
  if (body.base !== base) return refuse('stale-build', 409);
  if (body.revision !== (edit?.revision ?? 0)) return refuse('stale-page', 409);
  const source = fromEditable(page, body.text), refusal = docRefusal(page, source);
  if (refusal) return refuse(refusal, 422);
  const record = await store(env, page, { title: edit?.title ?? page.title, description: edit?.description ?? page.description, source }, saved?.revision ?? 0);
  return Response.json({ revision: record.revision, savedAt: record.savedAt, headings: renderDoc(page, source).headings });
}

/**
 * The owner's sites with the documentation among them, in 0001's own workspace. `workspaces` is the platform's list of
 * the workspaces the owner can open; with none named for 0001 the site stays in the owner's every workspace, never lost.
 */
export async function withDocsSite(answer: Response, workspaces: () => Promise<{ code?: string; name?: string }[]>): Promise<Response> {
  if (!answer.ok) return answer;
  const body = await answer.clone().json().catch(() => null) as { workspace?: string | null; sites?: unknown[] } | null;
  if (!Array.isArray(body?.sites)) return answer;
  const home = (await workspaces().catch(() => [])).find(each => each.name?.trim() === '0001');
  if (home && home.code !== body.workspace) return answer;
  return Response.json({ ...body, sites: [...body.sites, DOCS_SITE] }, { status: answer.status, headers: answer.headers });
}

/** A page as a reader gets it: the build's, or the build's with the owner's saved words in it. */
export async function applyDocEdit(response: Response, pathname: string, env: DocsEnv): Promise<Response> {
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
  const path = normal(pathname);
  if (!(await editedPaths(env).catch(() => new Set<string>())).has(path)) return response;
  const [edit, page] = await Promise.all([savedEdit(env, path), buildPage(env, path)]).catch(() => [null, null] as const);
  if (!edit || !page || docRefusal(page, edit.source)) return response;
  const { html, headings } = renderDoc(page, edit.source), contents = docContents(headings);
  const result = new HTMLRewriter()
    .on('.sl-markdown-content', { element(element) { element.setInnerContent(html, { html: true }); } })
    .on('ds-table-of-contents', { element(element) { element.setInnerContent(contents, { html: true }); } })
    .on('title', { element(element) { element.setInnerContent(`${edit.title} | Design system 1`); } })
    .on('h1#_top', { element(element) { element.setInnerContent(edit.title); } })
    .on('meta[property="og:title"]', { element(element) { element.setAttribute('content', edit.title); } })
    .on('meta[name="description"], meta[property="og:description"]', { element(element) { element.setAttribute('content', edit.description); } })
    .transform(response);
  result.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  result.headers.delete('Content-Length');
  result.headers.delete('ETag');
  return result;
}
