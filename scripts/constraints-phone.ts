import { remoteConstraintPages, viewportBatches, visitAll } from './constraint-pages';
import { calculateScalingFactor, defaultScalingConfig } from '../DS1/0-face/scaling';
import { build } from 'esbuild';
import { mkdirSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { createHash } from 'node:crypto';
import { extname, join, resolve } from 'node:path';
import puppeteer, { KnownDevices, type Page, type HTTPResponse } from 'puppeteer-core';
import { setTimeout as delay } from 'node:timers/promises';

const WIDTHS = [320, 375, 393, 430, 768, 1024, 1440];

if (process.env.DS1_BROWSER_CONSTRAINTS !== '1') {
  console.log('Browser constraints sweep is paused on this Mac. Set DS1_BROWSER_CONSTRAINTS=1 only when Joachim asks for a run.');
  process.exit(0);
}

const args = process.argv.slice(2);
const option = (name: string) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};
const dist = option('dist');
const origin = option('origin') ?? 'https://designsystem1.com';
const named = args.find(arg => /^https?:\/\//.test(arg));
if (!named && !dist) {
  console.error('Name the site: vp run constraints:phone https://example.com [--widths 320,393] [--pages /,/about/], or --dist website/dist for the built site.');
  process.exit(2);
}
const widths = option('widths')?.split(',').map(Number) ?? WIDTHS;
const workers = Number(args.includes('--workers') ? option('workers') : 1);
if (!Number.isSafeInteger(workers) || workers < 1 || workers > 6) throw new Error('Use an integer from 1 to 6 for --workers.');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wasm': 'application/wasm',
};

function fileOf(folder: string, pathname: string) {
  const file = resolve(folder, '.' + decodeURIComponent(pathname));
  if (!file.startsWith(resolve(folder))) return undefined;
  if (existsSync(file) && statSync(file).isDirectory()) return existsSync(join(file, 'index.html')) ? join(file, 'index.html') : undefined;
  if (existsSync(file)) return file;
  return existsSync(`${file}.html`) ? `${file}.html` : undefined;
}

async function serve(folder: string): Promise<{ server: Server; base: string }> {
  const server = createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
    const url = new URL(request.url ?? '/', 'http://localhost');
    const file = fileOf(folder, url.pathname);
    if (file) {
      response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      response.end(readFileSync(file));
      return;
    }
    try {
      const answer = await fetch(new URL(url.pathname + url.search, origin), { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
      const body = Buffer.from(await answer.arrayBuffer());
      response.writeHead(answer.status, { 'content-type': answer.headers.get('content-type') ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(502).end();
    }
  });
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return { server, base: `http://127.0.0.1:${port}` };
}

const locations = (xml: string) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(match => match[1]!);

function builtPages(folder: string, base: string): string[] {
  const pages = new Set<string>();
  const sitemaps = ['sitemap-index.xml', 'sitemap.xml', 'sitemap-0.xml'].filter(name => existsSync(join(folder, name)));
  const read = (name: string) => {
    for (const location of locations(readFileSync(join(folder, name), 'utf8'))) {
      const { pathname } = new URL(location);
      if (/\.xml$/.test(pathname)) { if (existsSync(join(folder, pathname))) read(pathname.slice(1)); }
      else pages.add(new URL(pathname, base).href);
    }
  };
  for (const name of sitemaps) read(name);
  const layouts = join(folder, 'examples/layouts');
  if (existsSync(layouts)) {
    for (const entry of readdirSync(layouts, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(layouts, entry.name, 'index.html'))) pages.add(new URL(`/examples/layouts/${entry.name}/`, base).href);
    }
  }
  const files = join(folder, 'examples/files');
  if (existsSync(files)) for (const name of readdirSync(files)) if (name.endsWith('.html')) pages.add(new URL(`/examples/files/${name}`, base).href);
  return pages.size ? [...pages] : [new URL('/', base).href];
}

async function pagesOf(site: string): Promise<string[]> {
  const chosen = option('pages');
  if (chosen) return chosen.split(',').map(path => new URL(path, site).href);
  if (dist) return builtPages(dist, site);
  return remoteConstraintPages(site);
}

const checker = (await build({
  stdin: {
    contents: `import { measureConstraints } from './constraints.ts';
import { describeElement } from './constraint-site.ts';
import { inspectFaultLines, paintFaultLines } from './fault-lines.ts';
window.__paintFaultLines = () => {
  inspectFaultLines(document)[0]?.element.scrollIntoView({block:'center', behavior:'instant'});
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-ds-fault-overlay', '');
  document.body.appendChild(svg);
  paintFaultLines(document, svg);
};
window.__inspectConstraints = () => {
  const results = measureConstraints(document);
  return {
    findings: results.flatMap(({ constraint, findings }) => findings.map(({ element, message, review }) =>
      ({ code: constraint.code, message, element: describeElement(element), review: review === true }))),
    measured: Object.fromEntries(results.map(({ constraint, measured }) => [constraint.code, measured])),
  };
};`,
    resolveDir: join(import.meta.dirname, '../DS1/0-face'),
    loader: 'ts',
  },
  bundle: true,
  format: 'iife',
  write: false,
  logLevel: 'silent',
})).outputFiles[0]!.text;

type Broken = { code: string; message: string; element: string; review: boolean };

const served = dist ? await serve(dist) : undefined;
const base = served?.base ?? named!;
const pages = await pagesOf(base);
const requestedTheme = option('theme') ?? 'light';
if (requestedTheme !== 'light' && requestedTheme !== 'dark') throw new Error('Use --theme light or --theme dark.');
const theme: 'light' | 'dark' = requestedTheme;
const started = performance.now();
let peakRss = process.memoryUsage().rss;
const noteMemory = () => { peakRss = Math.max(peakRss, process.memoryUsage().rss); };
let documentLoads = 0;
const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
const batches = viewportBatches(widths);
const report: string[] = [];
const reviews: string[] = [];
let broken = 0;
let notOpened = 0;
const measured: Record<string, number> = {};
const shown = (url: string) => served ? new URL(new URL(url).pathname, origin).href : url;

async function scrollForMeasurement(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise(done => setTimeout(done, 30));
    }
    scrollTo(0, 0);
  });
  await delay(80);
}

async function afterViewportChange(page: Page, width: number, mobile: boolean) {
  if (mobile) {
    const sf = calculateScalingFactor(width, { ...defaultScalingConfig, snap: 'layout' });
    await page.evaluate(scale => {
      document.documentElement.style.setProperty('--sf', String(scale));
      document.documentElement.setAttribute('data-mobile', '');
      void document.documentElement.scrollWidth;
    }, sf);
  }
  await delay(80);
}

async function recordAtWidth(page: Page, url: string, width: number) {
  await scrollForMeasurement(page);
  const result = await page.evaluate(() => (window as unknown as { __inspectConstraints: () => { findings: Broken[]; measured: Record<string, number> } }).__inspectConstraints());
  for (const [code, count] of Object.entries(result.measured)) measured[code] = (measured[code] ?? 0) + count;
  const found = result.findings.filter(finding => !finding.review);
  const toReview = result.findings.filter(finding => finding.review);
  if (result.findings.some(finding => finding.code === 'page.fault-lines')) {
    const folder = resolve(option('artifacts') ?? 'test-results/constraints');
    mkdirSync(folder, { recursive: true });
    const pathname = new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
    const suffix = createHash('sha256').update(shown(url)).digest('hex').slice(0, 8);
    const screenshot = join(folder, `${width}-${pathname}-${suffix}.png`);
    await page.evaluate(() => (window as unknown as { __paintFaultLines: () => void }).__paintFaultLines());
    await page.screenshot({ path: screenshot });
    console.log(`Fault lines: ${shown(url)} at ${width}px → ${screenshot}`);
  }
  if (found.length) {
    broken += found.length;
    report.push(`${width}px ${shown(url)}`, ...found.map(({ code, message, element }) => `  ${code}  ${element}: ${message}`));
  }
  if (toReview.length) reviews.push(`${width}px ${shown(url)}`, ...toReview.map(({ code, message, element }) => `  ${code}  ${element}: ${message}`));
}

async function openPage(url: string, last: boolean): Promise<boolean> {
  for (const batch of batches) {
    const mobile = batch[0]! < 768;
    const first = batch[0]!;
    const context = await browser.createBrowserContext();
    try {
      const page = await context.newPage();
      const phone = KnownDevices['iPhone 14'];
      const viewport = { ...(mobile ? phone.viewport : {}), width: first, height: 844 };
      if (mobile) await page.setUserAgent(phone.userAgent);
      await page.setViewport(viewport);
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      const attempts: { error?: string; status?: number; url?: string; ray?: string }[] = [];
      let documentResponse: HTTPResponse | undefined;
      page.on('response', response => {
        if (response.request().isNavigationRequest() && response.request().frame() === page.mainFrame()) documentResponse = response;
      });
      const navigate = async (timeout: number) => {
        documentResponse = undefined;
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle0', timeout });
          attempts.push(response ? { status: response.status(), url: response.url(), ray: response.headers()['cf-ray'] } : { error: 'Navigation returned no document response' });
          return response;
        } catch (error) {
          const response = documentResponse as HTTPResponse | undefined;
          attempts.push({ error: (error as Error).message, status: response?.status(), url: response?.url(), ray: response?.headers()['cf-ray'] });
          if (response && !response.ok()) return response;
          throw error;
        }
      };
      documentLoads += 1;
      const loaded = await navigate(30_000).catch(() => navigate(60_000))
        .then(response => ({ response }), (error: Error) => ({ error }));
      const failure = 'error' in loaded ? loaded.error.message
        : !loaded.response ? 'Navigation returned no document response'
        : !loaded.response.ok() ? `Document returned HTTP ${loaded.response.status()}` : undefined;
      if (failure) {
        const folder = resolve(option('artifacts') ?? 'test-results/constraints');
        mkdirSync(folder, { recursive: true });
        const suffix = createHash('sha256').update(shown(url)).digest('hex').slice(0, 12);
        const artifact = join(folder, `${first}-${suffix}-${last ? 'retry' : 'first'}-navigation`);
        const title = await page.title().catch(() => '');
        const html = await page.content().catch(() => '');
        writeFileSync(`${artifact}.json`, JSON.stringify({ requested: shown(url), actual: page.url(), width: first, widths: batch, title, failure, attempts }, null, 2));
        writeFileSync(`${artifact}.html`, html);
        await page.screenshot({ path: `${artifact}.png` }).catch(() => undefined);
        console.log(`Navigation failure: ${shown(url)} at ${first}px (${batch.join(', ')}px) → ${artifact}.json`);
        if ('error' in loaded && !last) return false;
        for (const width of batch) {
          notOpened += 1;
          report.push(`${width}px ${shown(url)}`, `  navigation failed: ${failure.split('\n')[0]} (evidence: ${artifact}.json)`);
        }
        continue;
      }
      if (option('theme')) await page.evaluate(appearance => {
        document.documentElement.classList.remove('light-theme', 'dark-theme');
        document.documentElement.classList.add(`${appearance}-theme`);
        document.documentElement.style.colorScheme = appearance;
      }, theme);
      await page.addScriptTag({ content: checker });
      for (const width of batch) {
        if (width !== first) await page.setViewport({ ...viewport, width });
        await afterViewportChange(page, width, mobile);
        await recordAtWidth(page, url, width);
      }
    } catch (error) {
      for (const width of batch) {
        broken += 1;
        report.push(`${width}px ${shown(url)}`, `  could not be opened: ${(error as Error).message.split('\n')[0]}`);
      }
    } finally {
      await context.close();
      noteMemory();
    }
  }
  return true;
}

const retried = await visitAll(pages, workers, openPage);
await browser.close();
served?.server.close();

console.log(report.join('\n'));
if (reviews.length) console.log(`\nTo review by eye (not measured, so not counted as broken):\n${reviews.join('\n')}\n`);
for (const [code, count] of Object.entries(measured)) console.log(`${code}: ${count} measured.`);
const elapsed = ((performance.now() - started) / 1000).toFixed(1);
const peakMiB = Math.round(peakRss / 1024 / 1024);
console.log(`${pages.length} pages at ${widths.join(', ')}px${served ? ` from ${dist}` : ''} with ${workers} workers and ${documentLoads} document loads: ${broken ? `${broken} broken` : notOpened ? 'no layout rules checked on failed documents' : 'every rule kept'}${notOpened ? `, ${notOpened} documents failed` : ''}${retried.length ? ` (${retried.length} tried again alone after a slow load)` : ''}. Sweep ${elapsed}s, peak RSS ${peakMiB} MiB.`);
process.exit(broken || notOpened ? 1 : 0);
