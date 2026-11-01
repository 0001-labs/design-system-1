/**
 * Shared headless harness for the editor's drag contracts. Local only: it serves website/dist (build first
 * with `vp run consistency:build`), stubs the workspace API and mounts <consistency-workspace-page>.
 * Coordinates given to drag() are relative to the canvas frame.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium, webkit } from 'playwright';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
/** The canvas stands below a strip of app chrome, so a pointer can leave the frame upwards. */
export const STAGE = { top: 100, width: 1200, height: 1000 };

export async function serveDist() {
  const root = resolve('website/dist');
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(root + '/')) return response.writeHead(403).end();
    try { response.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream'); response.end(await readFile(file)); }
    catch { response.writeHead(404).end(); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(done => server.close(done)) };
}

export async function launch({ browser = process.env.C9Y_BROWSER ?? 'chromium', reducedMotion, hasTouch } = {}) {
  const type = { chromium, webkit }[browser];
  if (!type) throw Error(`Unknown browser ${browser}`);
  const instance = await type.launch({ headless: true });
  const context = await instance.newContext({ viewport: { width: 1440, height: STAGE.top + STAGE.height }, reducedMotion, hasTouch });
  return { browser: instance, context, page: await context.newPage(), name: browser, close: () => instance.close() };
}

/** Content blocks with these ids, down a page with whole-square spacing. */
export function pageOf(blocks, layout = {}) {
  const block = value => typeof value === 'string' ? { id: value, kind: 'content', source: `Block ${value}` } : value;
  return { schema: 1, kind: 'native-page', layout: { mode: 'document', padding: 40, gap: 20, ...layout }, blocks: blocks.map(block) };
}

/** A picture block, served locally. */
export const picture = (id, height = 60) => ({ id, kind: 'image', src: 'https://designsystem1.com/examples/images/atelier-anders.jpg', alt: '', height });

/** Mounts a page (or a template's document) in the workspace editor and returns its handles. */
export async function openNativePage(page, { document, template = 'blank' } = {}) {
  const saves = { api: 0 }, broken = [];
  page.on('console', message => { if (message.text().startsWith('C9Y constraint')) broken.push(message.text()); });
  await page.route('**/api/**', route => {
    const request = route.request(), url = request.url();
    if (request.method() !== 'GET') { saves.api++; return route.fulfill({ json: {} }); }
    if (url.includes('/api/consistency/pages')) return route.fulfill({ json: { pages: [] } });
    if (url.includes('/api/consistency/sites')) return route.fulfill({ json: { sites: [] } });
    return route.fulfill({ status: 404, json: {} });
  });
  // Pictures named on designsystem1.com are served from the local build: no request leaves the machine.
  await page.route('https://designsystem1.com/**', async route => { try { route.fulfill({ body: await readFile(resolve('website/dist', '.' + new URL(route.request().url()).pathname)) }); } catch { route.fulfill({ status: 404 }); } });
  if (!page.url().includes('/editor/')) await page.goto(`${page.context().__base ?? ''}/editor/`);
  const templates = document ? null : JSON.parse(await readFile('shared/consistency-template-pages.json', 'utf8'));
  const source = document ?? templates[template].document;
  await page.evaluate(async ({ source, example, stage }) => {
    document.querySelector('#c9y-stage')?.remove();
    const chrome = Object.assign(document.createElement('div'), { id: 'c9y-chrome' });
    Object.assign(chrome.style, { position: 'fixed', left: '0', top: '0', width: '100%', height: `${stage.top}px`, background: '#eee', zIndex: '999' });
    chrome.addEventListener('pointerup', () => { window.chromeReleases = (window.chromeReleases ?? 0) + 1; });
    const holder = Object.assign(document.createElement('div'), { id: 'c9y-stage' });
    Object.assign(holder.style, { position: 'fixed', left: '0', top: `${stage.top}px`, width: `${stage.width}px`, height: `${stage.height}px`, background: 'white', zIndex: '999', display: 'flex' });
    const host = document.createElement('consistency-workspace-page');
    Object.assign(host.style, { display: 'flex', flex: '1', height: '100%' });
    host.loadDocument({ schema: 2, kind: 'page', example, library: 'original', fonts: {}, page: source });
    holder.append(host); document.body.append(chrome, holder);
    await new Promise(done => host.addEventListener('page-ready', done, { once: true }));
    // Count every save the editor settles: the transport the workspace hands its document state.
    const state = host.pageEditor.controller.state, save = state.save;
    window.c9ySaves = 0; state.save = value => { window.c9ySaves++; return save(value); };
  }, { source, example: template, stage: STAGE });
  const element = await page.$('#c9y-stage iframe');
  const frame = await element.contentFrame();
  await frame.waitForSelector('[data-editor-surface]');
  await settled(frame);
  const origin = async () => { const box = await element.boundingBox(); return { x: box.x, y: box.y }; };
  const read = () => page.evaluate(() => document.querySelector('#c9y-stage consistency-workspace-page').readDocument().page);
  const children = (blocks, parent) => { if (parent === 'page') return blocks; for (const block of blocks) { if (block.id === parent) return block.children ?? []; const found = block.children && children(block.children, parent); if (found) return found; } };
  const order = async (parent = 'page') => (children((await read()).blocks, parent) ?? []).map(block => block.id);
  const rect = id => frame.evaluate(id => { const box = document.querySelector(`[data-native-block="${id}"]`)?.getBoundingClientRect(); return box && { left: box.left, top: box.top, width: box.width, height: box.height, right: box.right, bottom: box.bottom }; }, id);
  /** A point on a block, frame-relative: its left words by default, so a press lands on the block itself. */
  const point = async (id, at = 'press') => { const box = await rect(id); if (!box) throw Error(`No block ${id}`); return { x: at === 'press' ? box.left + Math.min(50, box.width / 2) : box.left + box.width / 2, y: at === 'top' ? box.top + 4 : at === 'bottom' ? box.bottom - 4 : at === 'below' ? box.bottom + 8 : box.top + box.height / 2 }; };
  const cdp = page.context().browser().browserType().name() === 'chromium' ? await page.context().newCDPSession(page) : null;
  const mouse = {
    async move(x, y, buttons) { if (cdp) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons, button: buttons ? 'left' : 'none' }); else await page.mouse.move(x, y); },
    async down(x, y) { if (cdp) await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 }); else { await page.mouse.move(x, y); await page.mouse.down(); } },
    async up(x, y) { if (cdp) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 }); else { await page.mouse.move(x, y); await page.mouse.up(); } },
  };
  let last = null;
  /** Press a block, hold still (writing lifts after 400ms), then carry it to `to`: a frame point, or a block's point. */
  async function drag(fromId, to, { steps = 12, holdMs = 450, release = true, at = 'bottom', page: pagePoint = false, press } = {}) {
    const o = await origin(), from = press ?? await point(fromId);
    const target = typeof to === 'string' ? await point(to, at) : to;
    const start = { x: o.x + from.x, y: o.y + from.y }, end = pagePoint ? target : { x: o.x + target.x, y: o.y + target.y };
    await mouse.move(start.x, start.y, 0); await mouse.down(start.x, start.y);
    await page.waitForTimeout(holdMs);
    for (let n = 1; n <= steps; n++) await mouse.move(start.x + (end.x - start.x) * n / steps, start.y + (end.y - start.y) * n / steps, 1);
    last = end;
    await page.waitForTimeout(80);
    if (release) await up();
  }
  async function moveTo(to, { steps = 6, page: pagePoint = false } = {}) {
    const o = await origin(), end = pagePoint ? to : { x: o.x + to.x, y: o.y + to.y };
    for (let n = 1; n <= steps; n++) await mouse.move(last.x + (end.x - last.x) * n / steps, last.y + (end.y - last.y) * n / steps, 1);
    last = end;
  }
  /** Turns the wheel where the pointer is. */
  async function wheel(deltaY) {
    if (cdp) await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: last.x, y: last.y, deltaX: 0, deltaY, buttons: 1 });
    else await page.mouse.wheel(0, deltaY);
  }
  async function up() { await mouse.up(last.x, last.y); await settled(frame); }
  /** A finger: held `holdMs` then moved to `to`, through Chromium's touch input. */
  async function dragTouch(fromId, to, { steps = 12, holdMs = 300 } = {}) {
    if (!cdp) throw Error('Touch input runs in Chromium');
    const o = await origin(), from = await point(fromId), target = typeof to === 'string' ? await point(to) : to;
    const start = { x: o.x + from.x, y: o.y + from.y }, end = { x: o.x + target.x, y: o.y + target.y };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
    await page.waitForTimeout(holdMs);
    for (let n = 1; n <= steps; n++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * n / steps, y: start.y + (end.y - start.y) * n / steps, id: 1 }] });
    await page.waitForTimeout(80);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settled(frame);
  }
  /** The keyboard lift: focus the block's handle and press Space. */
  async function lift(id) { await frame.evaluate(id => document.querySelector(`[data-native-block="${id}"]`).focus({ preventScroll: true }), id); await page.keyboard.press('Space'); await frame.waitForSelector('[data-drag-preview]'); }
  /** Selects one block with a press on it. */
  async function select(id) { const o = await origin(), p = await point(id); await mouse.move(o.x + p.x, o.y + p.y, 0); await mouse.down(o.x + p.x, o.y + p.y); await mouse.up(o.x + p.x, o.y + p.y); await page.waitForTimeout(50); }
  const selection = () => frame.evaluate(() => [...document.querySelectorAll('[data-selectable][data-selected],[data-selectable][data-composition-selected]')].map(element => element.dataset.selectable));
  const savesSettled = async () => { await page.waitForTimeout(600); return page.evaluate(() => window.c9ySaves); };
  return { host: element, frame, read, order, rect, point, broken, drag, moveTo, wheel, up, dragTouch, lift, select, selection, mouse, origin, saves: () => page.evaluate(() => window.c9ySaves), savesSettled, api: saves, cdp };
}

/** Waits until no drag is in progress in the frame: no overlay and no drag attributes. */
export async function settled(frame) {
  await frame.waitForFunction(() => !document.querySelector('[data-drag-overlay]') && !document.documentElement.hasAttribute('data-drag-active'), null, { timeout: 5000 });
}

/** What a drag leaves behind, empty when the page is clean. */
export function leftovers(frame) {
  return frame.evaluate(() => {
    const found = [];
    if (document.querySelector('[data-drag-overlay]')) found.push('overlay');
    for (const name of ['data-drag-active', 'data-drag-outside', 'data-drag-over', 'data-drag-source']) if (document.querySelector(`[${name}]`)) found.push(name);
    for (const element of document.querySelectorAll('[data-native-block]')) { const t = element.style.translate; if (t && t !== 'none' && t !== '0px' && t !== '0px 0px') found.push(`translate ${element.dataset.nativeBlock} ${t}`); }
    return found;
  });
}

/**
 * Starts sampling the carried preview and the authored block every frame; call the returned function after
 * releasing. It throws unless the last preview frame and the committed block agree within 1px and nothing moves
 * after the handoff (drag.single-landing).
 */
export async function landing(frame, id, ms = 900) {
  await frame.evaluate(({ id, ms }) => {
    window.landingFrames = []; const end = window.landingEnd = performance.now() + ms;
    const tick = () => {
      const preview = document.querySelector('[data-drag-preview]')?.getBoundingClientRect(), block = document.querySelector(`[data-native-block="${id}"]`)?.getBoundingClientRect();
      window.landingFrames.push({ preview: preview && { top: preview.top, left: preview.left }, top: block?.top, left: block?.left });
      if (performance.now() < end) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { id, ms });
  return async () => {
    await frame.waitForFunction(() => performance.now() > window.landingEnd + 50, null, { timeout: 5000 });
    const frames = await frame.evaluate(() => window.landingFrames);
    const handoff = frames.findIndex((f, i) => i && !f.preview && frames[i - 1].preview);
    if (handoff < 0) throw Error(`${id}: no handoff from preview to block was sampled`);
    const last = frames[handoff - 1].preview, final = frames.at(-1);
    if (Math.abs(last.top - final.top) > 1 || Math.abs(last.left - final.left) > 1) throw Error(`${id}: second landing ${JSON.stringify({ last, final })}`);
    if (frames.slice(handoff).some(f => Math.abs(f.top - final.top) > 1 || Math.abs(f.left - final.left) > 1)) throw Error(`${id}: moved after the handoff`);
  };
}

/** Runs a contract with a served dist and a browser, closing both. */
export async function contract(options, body) {
  const served = await serveDist(), launched = await launch(options);
  launched.context.__base = served.base;
  try { await launched.page.goto(`${served.base}/editor/`); return await body({ ...launched, base: served.base }); }
  finally { await launched.close(); await served.close(); }
}
