import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { nativePageFixture } from './native-page-fixture.mjs';

const component = (id, name, children, values = {}) => ({ id, kind: 'component', name, children, values });
const slide = (id, text) => component(id, 'Slide', [
  component(id + '-link', 'CardLink', [{ id: id + '-words', kind: 'text', text }], { href: '/about/' }),
]);
const fixture = await nativePageFixture({
  definition: {
    document: {
      schema: 1, kind: 'native-page', title: 'Showcase', lang: 'en',
      layout: { mode: 'document', padding: 0, gap: 0 },
      blocks: [component('showcase', 'Track', [slide('ezo', 'Lists on one grid'), slide('woodstock', 'Japan’s leading fintech platform')])],
    },
    bindings: {},
    components: {
      Track: { tag: 'div', attributes: { class: 'ds-carousel__track' }, fields: [] },
      Slide: { tag: 'div', attributes: {}, fields: [] },
      CardLink: { tag: 'a', attributes: {}, fields: ['href'] },
    },
  },
  styles: '.ds-carousel__track{display:flex;gap:40px;overflow:auto}.ds-carousel__track>div{flex:0 0 240px}.ds-carousel__track a{display:block;padding:20px;height:120px}',
});
let browser;
try {
  browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setRequestInterception(true);
  const routes = [];
  await fixture.route({
    route(pattern, handler) {
      const path = pattern.slice(2).split('/').map(part => part === '**' ? '.*' : part === '*' ? '[^/]+' : part).join('/');
      routes.push([new RegExp('^' + path + '$'), handler]);
    },
  });
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    const match = routes.find(([pattern]) => pattern.test(pathname));
    if (!match) return request.continue();
    return match[1]({
      request: () => ({ method: () => request.method(), url: () => request.url(), postDataJSON: () => JSON.parse(request.postData()) }),
      fulfill: ({ json, status, ...response }) => request.respond(json === undefined ? { status, ...response } : {
        status, contentType: 'application/json', body: JSON.stringify(json),
      }),
    });
  });
  await page.goto(fixture.url);
  const iframe = await page.waitForSelector('iframe.consistency-site-frame', { timeout: 10000 });
  const frame = await iframe.contentFrame();
  const title = await frame.waitForSelector('[data-c9y-block="woodstock-words"] .aa-block', { timeout: 10000 });
  const source = await title.boundingBox();
  const first = await frame.waitForSelector('[data-c9y-block="ezo"]');
  const destination = await first.boundingBox();
  await page.mouse.move(source.x + 12, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + 4, source.y + source.height / 2 + 8);
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'PUT' && response.url().includes('/api/native-page') && response.ok(), { timeout: 4000 }),
    (async () => {
      await page.mouse.move(destination.x + 24, source.y + source.height / 2, { steps: 12 });
      await page.mouse.up();
    })(),
  ]);
  assert.equal(await frame.$eval('.ds-carousel__track > [data-c9y-block]', slide => slide.getAttribute('data-c9y-block')), 'woodstock');

  const stored = await fixture.read();
  assert.deepEqual(stored.document.blocks[0].children.map(block => block.id), ['woodstock', 'ezo']);
  assert.equal(stored.document.blocks[0].children[0].children[0].values.href, '/about/');
  assert.equal(stored.document.blocks[0].children[0].children[0].children[0].text, 'Japan’s leading fintech platform');
  const published = await fixture.html();
  assert.ok(published.indexOf('Japan’s leading fintech platform') < published.indexOf('Lists on one grid'));
  await page.reload();
  const reopened = await page.waitForSelector('iframe.consistency-site-frame');
  const reopenedFrame = await reopened.contentFrame();
  await reopenedFrame.waitForSelector('[data-c9y-block="woodstock-words"] .aa-block');
  assert.equal(await reopenedFrame.$eval('.ds-carousel__track > [data-c9y-block]', slide => slide.getAttribute('data-c9y-block')), 'woodstock');
} finally {
  await browser?.close();
  await fixture.close();
}
