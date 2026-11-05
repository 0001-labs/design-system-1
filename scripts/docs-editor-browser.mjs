// The real documentation shell and Aa, using synthetic API responses only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const root = resolve(fileURLToPath(new URL('../website/dist/', import.meta.url)));
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
  if (!file.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    response.setHeader('content-type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' })[extname(file)] ?? 'application/octet-stream');
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(10_000);
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  // Do not start a real sign-in bridge or contact a live API.
  await page.route('**/app/**', route => route.fulfill({ body: '' }));
  await page.route('**/ds1/base/latest.css', route => route.fulfill({ body: '', contentType: 'text/css' }));
  let text = 'Editable words.\n\n## Section\n\n:doc[1]', revision = 0, refuse = false, reads = 0;
  let slowSave;
  await page.route('**/api/consistency/sites/01Docs/**', async route => {
    const request = route.request();
    if (request.url().includes('/api/pages')) return route.fulfill({ json: { pages: [] } });
    if (request.method() === 'GET') {
      reads++;
      return route.fulfill({ json: { path: '/1-root/device/', base: 'build', revision, text, title: 'Device', description: '', headings: [{ id: 'section', text: 'Section', level: 2 }], atoms: [{ id: 1, label: 'Example', html: '<p>Intact example</p>' }] } });
    }
    if (refuse) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
    const body = request.postDataJSON();
    assert.equal(body.revision, revision);
    assert.equal(body.base, 'build');
    if (slowSave) await slowSave;
    text = body.text; revision++;
    return route.fulfill({ json: { revision, headings: [{ id: 'section', text: 'Section', level: 2 }] } });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base + '/1-root/device/');
  await page.waitForFunction(() => document.querySelector('#navigation-auth'));
  const auth = owner => page.evaluate(owner => window.dispatchEvent(new CustomEvent('ds1-navigation-auth', { detail: { authenticated: true, owner } })), owner);
  await auth(false);
  assert.equal(reads, 0);
  assert.equal(await page.locator('consistency-docs-editor').count(), 0);
  assert.equal(await page.locator('.sl-markdown-content').isVisible(), true);
  await auth(true);
  const canvas = page.locator('consistency-docs-editor');
  await canvas.getByText('Editable words.', { exact: true }).waitFor();
  assert.equal(await page.locator('.sl-markdown-content').count(), 0);
  assert.equal(await canvas.locator('.docs-canvas__title').count(), 0);
  assert.equal(await page.locator('h1#_top').textContent(), 'Device');
  assert.equal(await canvas.locator('.docs-atom__body').textContent(), 'Intact example');
  assert.equal(await canvas.locator('#section').count(), 1);
  assert.equal(await page.locator('ds-table-of-contents a[href="#section"]').textContent(), 'Section');

  await canvas.getByText('Editable words.', { exact: true }).click();
  await page.keyboard.press('End');
  let release;
  slowSave = new Promise(done => { release = done; });
  await page.keyboard.type(' First.');
  await page.waitForTimeout(700);
  await page.keyboard.type(' Second.');
  release(); slowSave = null;
  await page.waitForFunction(() => !document.querySelector('consistency-docs-editor').unsaved);
  assert(text.includes('Editable words. First. Second.'));
  assert(text.includes(':doc[1]'));

  refuse = true;
  await page.keyboard.type(' Draft.');
  await canvas.getByRole('alert').waitFor();
  await page.locator('.site-brand').click();
  await page.waitForTimeout(100);
  assert.equal(new URL(page.url()).pathname, '/1-root/device/');
  assert((await canvas.textContent()).includes('Draft.'));
  refuse = false;
  await canvas.getByRole('button', { name: 'Try again' }).click();
  await page.waitForFunction(() => !document.querySelector('consistency-docs-editor').unsaved);
  assert(text.includes('Draft.'));
  await auth(false);
  assert.equal(await canvas.isVisible(), false);
  assert.equal(await page.locator('.sl-markdown-content').isVisible(), true);
  await auth(true);
  assert.equal(await canvas.isVisible(), true);
  assert.deepEqual(failures, []);
  console.log('docs-editor-browser: passed (owner gate, Aa, atoms, serial autosave, failed draft, retry, navigation, sign-out)');
} finally { await browser.close(); await new Promise(done => server.close(done)); }
