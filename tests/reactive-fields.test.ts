import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vite-plus/test';

const root = join(import.meta.dirname, '../DS1');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
  });

test('no element declares a reactive property as a class field', () => {
  const shadowed: string[] = [];
  for (const file of files(root)) {
    const source = readFileSync(file, 'utf8');
    const start = source.search(/\bclass \w+ extends /);
    if (start < 0) continue;
    const body = source.slice(start);
    const block = body.match(/static (?:override )?properties\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (!block) continue;
    const keys = [...block[1]!.matchAll(/^\s*(\w+)\s*:/gm)].map(match => match[1]!);
    for (const key of keys) {
      if (new RegExp(`^ {2}(?:public |protected |private |override )*${key}\\??(?:\\s*:[^=;]+)?(?:\\s*=[^;]+)?;\\s*(?://.*)?$`, 'm').test(body.replace(block[0], ''))) {
        shadowed.push(`${file.slice(root.length + 1)}: ${key}`);
      }
    }
  }
  expect(shadowed).toEqual([]);
});
