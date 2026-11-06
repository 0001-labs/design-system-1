// @vitest-environment node
import { expect, test } from 'vite-plus/test';
import { reconcileTemplateRegistry, type TemplateRegistry } from '../scripts/consistency-template-registry';
import registry from '../shared/consistency-template-pages.json';
import { renderNativePage, validateNativePage } from '../shared/consistency-native-page';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import exportsConfig from '../sync.exports.mjs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
const example = (css = '.a { color: red; }', name = 'old'): TemplateRegistry => ({ example: {
  id: 'example', label: 'Example', library: css,
  components: { [name]: { tag: 'style', markup: `<style>${css}</style>` } },
  document: { blocks: [{ id: 'style', kind: 'component', name, children: [] }] },
} });
test('ordinary and comment-only candidates retain the exact recorded bytes and pin names', () => {
  const previous = example();
  const candidate = example('/* explanation */ .a { /* meaning unchanged */ color: red; }', 'new');
  expect(reconcileTemplateRegistry(previous, candidate)).toBe(previous);
  expect(reconcileTemplateRegistry(previous, candidate, true)).toBe(previous);
  expect(JSON.stringify(previous.example.components.old)).toContain('<style>.a { color: red; }</style>');
});
test.each([
  '.a {color:blue}', '.a{color:red;color:blue}', '.a{background:url(/new.png);color:red}',
  '.a {content:"/* meaningful text */";color:red}', '/*! License notice */ .a{color:red}',
])('meaningful CSS or legal notices require refresh: %s', source => {
  expect(() => reconcileTemplateRegistry(example(), example(source, 'new'))).toThrow(/stale.*--refresh/);
});
test('preserves declarations order, URLs, text and authored attributes outside CSS', () => {
  for (const change of [
    (p: any) => { p.example.label = 'Changed label'; },
    (p: any) => { p.example.document.blocks.push({ id: 'text', kind: 'text', text: 'Changed text' }); },
    (p: any) => { p.example.components.old.attributes = { title: 'Changed attribute' }; },
  ]) {
    const candidate = example(); change(candidate);
    expect(() => reconcileTemplateRegistry(example(), candidate)).toThrow();
  }
  expect(() => reconcileTemplateRegistry(example('.a{color:red;color:blue}'), example('.a{color:blue;color:red}', 'new'))).toThrow(/stale/);
});
test('an actual presentation change adds a pin and retains historical definitions byte-for-byte', () => {
  const previous = example(), candidate = example('.a{color:blue}', 'new');
  const next = reconcileTemplateRegistry(previous, candidate, true);
  expect(next.example.document.blocks).toEqual(candidate.example.document.blocks);
  expect(next.example.components.old).toBe(previous.example.components.old);
  expect(next.example.components.new).toEqual(candidate.example.components.new);
  expect(reconcileTemplateRegistry(next, candidate)).toBe(next);
});
test('refuses same-name byte changes even when only comments differ', () => {
  expect(() => reconcileTemplateRegistry(example(), example('/* comment */.a{color:red}'), true)).toThrow(/Immutable/);
});
test('refuses template removal and absent referenced definitions', () => {
  expect(() => reconcileTemplateRegistry(example(), {}, true)).toThrow(/history migration/);
  const missing = example(); missing.example.components = {};
  expect(() => reconcileTemplateRegistry(example(), missing)).toThrow(/Missing template presentation/);
});
test('old saved documents still validate and render after refreshed definitions are added', () => {
  const previous = structuredClone(registry) as unknown as TemplateRegistry;
  const candidate = structuredClone(previous);
  const page = candidate.blank;
  const block = page.document.blocks.find((b: any) => b.kind === 'component') as any;
  const name = block.name;
  const newName = name + '_new';
  page.components[newName] = { ...page.components[name], attributes: { ...page.components[name].attributes as object, 'data-check': 'new' } };
  block.name = newName;
  const old = previous.blank.document;
  const next = reconcileTemplateRegistry(previous, candidate, true);
  for (const [id, entry] of Object.entries(previous)) for (const [pin, definition] of Object.entries(entry.components)) expect(JSON.stringify(next[id].components[pin])).toBe(JSON.stringify(definition));
  const context = (components: any) => ({ images: [], collections: [], runtimes: {}, components });
  const validated = validateNativePage(old, context(next.blank.components));
  expect(renderNativePage(validated, context(next.blank.components))).toBe(renderNativePage(validateNativePage(old, context(previous.blank.components)), context(previous.blank.components)));
});
test('default generator checks a fresh registry without writing it and fails clearly when stale or missing', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'template-registry-'));
  const root = resolve('.');
  const file = join(scratch, 'shared/consistency-template-pages.json');
  const run = () => spawnSync(resolve('node_modules/.bin/tsx'), [resolve('scripts/consistency-templates.ts')], { cwd: scratch, encoding: 'utf8' });
  try {
    mkdirSync(join(scratch, 'shared')); mkdirSync(join(scratch, 'packages/consistency'), { recursive: true }); mkdirSync(join(scratch, 'website'));
    symlinkSync(join(root, 'packages/consistency/src'), join(scratch, 'packages/consistency/src'));
    symlinkSync(join(root, 'website/public'), join(scratch, 'website/public'));
    const source = readFileSync('shared/consistency-template-pages.json', 'utf8'); writeFileSync(file, source);
    const result = run(); expect(result.status, result.stderr).toBe(0); expect(readFileSync(file, 'utf8')).toBe(source);
    expect(JSON.parse(readFileSync(join(scratch, 'packages/consistency/generated/templates.json'), 'utf8')).blank.id).toBe('blank');
    const stale = JSON.parse(source); stale.blank.label = 'Stale label'; writeFileSync(file, JSON.stringify(stale));
    const refused = run(); expect(refused.status).not.toBe(0); expect(refused.stderr).toContain('--refresh');
    expect(JSON.parse(readFileSync(file, 'utf8')).blank.label).toBe('Stale label');
    execFileSync(resolve('node_modules/.bin/tsx'), [resolve('scripts/consistency-templates.ts'), '--refresh'], { cwd: scratch });
    expect(JSON.parse(readFileSync(file, 'utf8')).blank.label).toBe('Blank site');
    rmSync(file); const missing = run(); expect(missing.status).not.toBe(0); expect(missing.stderr).toContain('Restore shared/consistency-template-pages.json from Git');
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}, 20_000);


test('fresh-checkout native exports carry the committed registry byte-for-byte', async () => {
  const read = (path: string) => readFileSync(resolve(path));
  const files = await exportsConfig.exports['native-content'].files({ read, tree: (path: string, options: {only: RegExp}) => new Map(readdirSync(path).filter(name => options.only.test(name)).map(name => [name, read(join(path, name))])) });
  expect(Buffer.from(files['template-pages.json']).equals(read('shared/consistency-template-pages.json'))).toBe(true);
}, 20_000);
