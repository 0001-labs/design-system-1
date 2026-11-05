// The documentation on Consistency's canvas, against the gateway's shapes: it opens in Aa from its Markdown, a component
// is one atom, the words save, a refused save keeps them, and Pages opens a page on the canvas.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
const root = fileURLToPath(new URL('../../../website/dist/', import.meta.url));
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  try { const body = await readFile(file); response.setHeader('content-type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' })[extname(file)] ?? 'application/octet-stream'); response.end(body); }
  catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
const site = { code: '01Docs', name: 'Design system 1', url: 'https://designsystem1.com', domain: 'designsystem1.com', docs: true };
const assert = (ok, words) => { if (!ok) throw new Error(words); };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures = []; page.on('pageerror', error => { failures.push(error.message); console.log('pageerror', error.message); }); if (process.env.DEBUG_DOCS) page.on('console', message => console.log(message.text()));
  const state = { revision: 0, text: 'Vertical space.\n\n## Try it\n\n:doc[2]\n\nA gap is empty.', saves: [], refuse: false };
  const opened = path => ({ path, base: 'b1', revision: state.revision, title: path === '/' ? 'Overview' : 'Gap', description: 'Space.', text: path === '/' ? 'Welcome to [the gap](/2-core/gap/).' : state.text, atoms: path === '/' ? [] : [{ id: 2, label: 'Component example: gap', html: '<section class="component-example"><iframe title="gap" srcdoc="<p>live</p>"></iframe></section>' }], file: 'x.mdx', edited: false, superseded: false });
  await page.route('**/api/consistency/workspaces', route => route.fulfill({ json: { owner: true, workspaces: [{ code: '01STDO', name: '0001', role: 'owner', plan: 'plus', siteCodes: ['01Docs'], limits: { sites: null, domains: true, members: null } }] } }));
  await page.route('**/api/consistency/sites', route => route.fulfill({ json: { workspace: '01STDO', sites: [site] } }));
  await page.route('**/api/consistency/draft-sites**', route => route.fulfill({ json: { sites: [] } }));
  await page.route('**/api/consistency/profile', route => route.fulfill({ json: { companyName: '0001' } }));
  await page.route('**/api/consistency/sites/01Docs/**', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.endsWith('/places')) return route.fulfill({ json: { places: [{ id: 'pages', label: 'Pages' }] } });
    if (url.pathname.endsWith('/api/pages')) return route.fulfill({ json: { images: [], pages: [{ path: '/', lang: 'en', title: 'Overview', fields: 2, edited: 0 }, { path: '/2-core/gap/', lang: 'en', title: 'Gap', fields: 2, edited: 0 }] } });
    if (url.pathname.endsWith('/api/detached')) return route.fulfill({ json: { edits: [] } });
    if (url.pathname.endsWith('/api/page')) { const path = url.searchParams.get('path'); return route.fulfill({ json: { path, lang: 'en', title: 'Gap', fields: [{ key: 'title', tag: 'title', kind: 'meta', label: 'Title', markdown: 'Gap', built: 'Gap' }, { key: 'description', tag: 'description', kind: 'meta', label: 'Description', markdown: 'Space.', built: 'Space.' }] } }); }
    if (url.pathname.endsWith('/api/docs-page') && request.method() === 'GET') return route.fulfill({ json: opened(url.searchParams.get('path')) });
    if (url.pathname.endsWith('/api/docs-page')) {
      if (state.refuse) return route.fulfill({ status: 422, json: { error: 'bad-markup' } });
      const body = request.postDataJSON(); assert(body.revision === state.revision && body.base === 'b1', 'a save carries the revision it was made on');
      state.revision++; state.text = body.text; state.saves.push(body.text);
      return route.fulfill({ json: { revision: state.revision, savedAt: 1 } });
    }
    return route.fulfill({ status: 404, json: { error: 'unknown' } });
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/editor/home.html`);
  await page.locator('consistency-home ds-card').first().click();
  const canvas = page.locator('consistency-docs-editor');
  await canvas.locator('.aa-block, [data-block]').first().waitFor();
  assert((await canvas.textContent()).includes('Welcome to'), 'the front page opens');

  // Pages opens another page on the canvas.
  await page.getByText('Pages', { exact: true }).first().click();
  await page.locator('consistency-place-pages ds-row[data-path="/2-core/gap/"]').click();
  await page.locator('consistency-place-pages').getByRole('button', { name: 'Edit' }).first().click();
  await canvas.locator('.docs-atom').waitFor();
  assert(await canvas.locator('.docs-atom__label').textContent() === 'Component example: gap', 'a component is one named atom');
  assert(await canvas.locator('.docs-atom iframe').count() === 1, 'the component is drawn');

  // Words save, with the component left as its atom.
  await canvas.getByText('A gap is empty.').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' Really.');
  await page.waitForTimeout(900);
  assert(state.saves.at(-1)?.endsWith('A gap is empty. Really.'), `the words save: ${state.saves.at(-1)}`);
  assert(state.saves.at(-1)?.includes(':doc[2]'), 'the atom is untouched');

  // A refused save says why and keeps the words.
  state.refuse = true;
  await page.keyboard.type(' More');
  await page.waitForTimeout(900);
  await canvas.locator('ds-message').waitFor();
  assert((await canvas.locator('ds-message').textContent()).includes('not saved yet'), 'a refused save says so');
  assert((await canvas.textContent()).includes('Really. More'), 'the words stay');
  state.refuse = false;
  await page.keyboard.type('!');
  await page.waitForTimeout(900);
  assert(state.saves.at(-1)?.endsWith('Really. More!'), 'the next save takes everything');
  assert(await canvas.locator('ds-message').count() === 0, 'the failure clears');
  assert(!failures.length, failures.join('\n'));
  console.log('docs-site: passed');
} finally { await browser.close(); server.close(); }
