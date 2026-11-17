import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { docRefusal, fromEditable, renderDoc, toEditable, type DocPage } from '../shared/doc-pages';
import { isPublicComponent } from '../DS1/0-face/component-visibility';

const root = resolve(import.meta.dirname, '..'), built = join(root, 'website/dist/docs-pages');
const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const SHELLS = new Set(['/account/', '/libraries/design-system-1/', '/libraries/playground/', '/libraries/workspace/', '/2-core/notice/', '/2-core/toast/']);
const COVERED: Record<string, string> = { window: '/visual-kit/', 'device-bezel': '/visual-kit/', 'app-chrome': '/visual-kit/' };
const MIN_WORDS = 60;

const pages = walk(built).filter(file => !file.endsWith('pages.json')).map(file => JSON.parse(readFileSync(file, 'utf8')) as DocPage);
const failures: string[] = [];
const fail = (page: string, why: string) => failures.push(`${page.padEnd(36)} ${why}`);

for (const page of pages) {
  const prose = page.blocks.filter(block => block.kind === 'text' && !block.source.startsWith('```')).map(block => block.source).join(' ');
  const words = prose.split(/\s+/).filter(Boolean).length;
  if (!page.description) fail(page.path, 'no description');
  if (!SHELLS.has(page.path) && words < MIN_WORDS) fail(page.path, `only ${words} words`);
  if (/\b(?:TODO|TBD)\b|coming soon|lorem ipsum/i.test(prose)) fail(page.path, 'left to do');
  if (!page.blocks.length) fail(page.path, 'no blocks');
  const { text } = toEditable(page, page.source);
  const back = fromEditable(page, text).replace(/\s+/g, ' ').trim();
  if (back !== page.source.replace(/\s+/g, ' ').trim()) fail(page.path, 'Aa does not save it back as it was');
  const refusal = docRefusal(page, page.source);
  if (refusal) fail(page.path, `Aa cannot read it: ${refusal}`);
  if (/^\s*<[A-Za-z]/m.test(text.replace(/```[\s\S]*?```/g, ''))) fail(page.path, 'markup left in the words');
  const rebuilt = renderDoc(page, page.source).html;
  for (const block of page.blocks) if (!rebuilt.includes(block.html)) { fail(page.path, 'a block is not redrawn from the build'); break; }
}

const paths = new Set(pages.map(page => page.path));
for (const layer of ['2-core', '3-unit', '4-page']) for (const file of readdirSync(join(root, 'DS1', layer))) {
  const name = /^ds-(.+)\.ts$/.exec(file)?.[1];
  if (!name || name.endsWith('.test') || !isPublicComponent(name)) continue;
  if (!paths.has(COVERED[name] ?? `/${layer}/${name}/`)) fail(`${relative(root, join('DS1', layer, file))}`, 'a component with no page');
}

console.log(`docs-audit: ${pages.length} pages, ${failures.length} short`);
for (const failure of failures) console.log(`  ${failure}`);
if (failures.length) process.exit(1);
