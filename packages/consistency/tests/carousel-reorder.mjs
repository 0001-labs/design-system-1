import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { nativePageFixture } from './native-page-fixture.mjs';

const website = JSON.parse(readFileSync(new URL('../../../../../Consistency/sites/website/c9y/pages.native.json', import.meta.url)));
const definition = website.pages['/'];
const styles = [...definition.shell.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
const fixture = await nativePageFixture({definition, styles});
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
  const track = '.showcase .ds-carousel__track';
  const woodstockLink = track + ' a[href="/projects/woodstock"]';
  const linkCard = track + ' a[href="https://using.link"]';
  const titleSelector = woodstockLink + ' .ds-card__title .aa-block';
  const title = await frame.waitForSelector(titleSelector, { timeout: 10000 });
  const orderIn = frame => frame.$$eval(track + ' > div > a', cards => cards.map(card => card.getAttribute('href')));
  const initialOrder = await orderIn(frame);
  const expectedOrder = initialOrder.filter(href => href !== '/projects/woodstock');
  expectedOrder.splice(expectedOrder.indexOf('https://using.link'), 0, '/projects/woodstock');

  await frame.$eval(linkCard, card => {
    const slide = card.parentElement;
    const track = slide.parentElement;
    track.scrollLeft = slide.offsetLeft - track.firstElementChild.offsetLeft + slide.offsetWidth * 0.57;
    track.scrollIntoView({ block: 'center' });
  });
  const source = await title.boundingBox();
  const target = await (await frame.waitForSelector(linkCard)).boundingBox();
  const viewport = await (await frame.waitForSelector(track)).boundingBox();
  const visibleLeft = Math.max(target.x, viewport.x);
  const visibleRight = Math.min(target.x + target.width, viewport.x + viewport.width);
  const dropX = visibleLeft + (visibleRight - visibleLeft) / 4;
  assert.ok(target.x + target.width / 2 < viewport.x && visibleRight > visibleLeft,
    'The Link card is visible but its full midpoint is clipped');

  const startX = source.x + 12, startY = source.y + source.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 8, startY + 8);
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'PUT' && response.url().includes('/api/native-page') && response.ok(), { timeout: 4000 }),
    (async () => {
      await page.mouse.move(dropX, startY, { steps: 12 });
      await page.mouse.up();
    })(),
  ]);
  assert.deepEqual(await orderIn(frame), expectedOrder, 'The editor shows the reordered slides');
  const published = await fixture.html();
  const publishedOrder = [...published.matchAll(/<a class="ds-card showcase__card[^"]*"[^>]*href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(publishedOrder, expectedOrder, 'Public rendering uses the saved slide order');

  await page.reload();
  const reopened = await page.waitForSelector('iframe.consistency-site-frame');
  const reopenedFrame = await reopened.contentFrame();
  await reopenedFrame.waitForSelector(titleSelector);
  assert.deepEqual(await orderIn(reopenedFrame), expectedOrder, 'The slide order survives reopening');
} finally {
  await browser?.close();
  await fixture.close();
}
