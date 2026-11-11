import { afterAll, beforeAll, expect, test } from 'vite-plus/test';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const server = createServer((request, response) => {
  const failed = request.url === '/unavailable';
  response.writeHead(failed ? 503 : 200, { 'content-type': 'text/html', 'cf-ray': 'fixture-ray' });
  response.end(`<html><head><title>${failed ? 'Service unavailable' : 'Ready'}</title></head><body>${failed ? '<small style="display:block;width:2000px">Error 1101</small>' : ''}</body></html>`);
});
let base: string;
let artifacts: string;
beforeAll(async () => {
  artifacts = await mkdtemp(join(tmpdir(), 'constraint-navigation-'));
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No fixture address');
  base = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => {
  await new Promise<void>(done => server.close(() => done()));
  await rm(artifacts, { recursive: true, force: true });
});

function run(path: string) {
  return new Promise<{ code: number; output: string }>(resolve => {
    execFile(process.execPath, ['--import', 'tsx', 'scripts/constraints-phone.ts', base, '--pages', path, '--widths', '393', '--workers', '1', '--artifacts', artifacts], { timeout: 45_000 }, (error, stdout, stderr) => {
      resolve({ code: error ? Number(error.code) || 1 : 0, output: stdout + stderr });
    });
  });
}

// The sweep is paused (see scripts/constraints-phone.ts): these open WebKit, so they run only when it is switched on.
const sweep = process.env.DS1_BROWSER_CONSTRAINTS === '1';

test.skipIf(sweep)('while the sweep is paused the script measures nothing and says so', async () => {
  const result = await run('/ready');
  expect(result.code).toBe(0);
  expect(result.output).toContain('Browser constraints sweep is paused');
  expect(result.output).not.toContain('measured.');
  expect(await readdir(artifacts)).toEqual([]);
}, 60_000);

test.runIf(sweep)('HTTP error pages fail availability, preserve evidence, and never run layout rules', async () => {
  const result = await run('/unavailable');
  expect(result.code).toBe(1);
  expect(result.output).toContain('Document returned HTTP 503');
  expect(result.output).not.toContain('measured.');
  const names = await readdir(artifacts);
  const evidence = JSON.parse(await readFile(join(artifacts, names.find(name => name.endsWith('.json'))!), 'utf8'));
  expect(evidence).toMatchObject({ title: 'Service unavailable', width: 393, attempts: [{ status: 503, ray: 'fixture-ray', url: `${base}/unavailable` }] });
  expect(await readFile(join(artifacts, names.find(name => name.endsWith('.html'))!), 'utf8')).toContain('Error 1101');
  expect(names.some(name => name.endsWith('.png'))).toBe(true);
}, 60_000);

test.runIf(sweep)('a successful document still runs the normal constraint measurement', async () => {
  const result = await run('/ready');
  expect(result.output).toContain('measured.');
  expect(result.output).not.toContain('navigation failed');
  expect(result.code).toBe(0);
}, 60_000);
