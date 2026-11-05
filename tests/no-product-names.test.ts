import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from 'vite-plus/test';

// Design system 1 is a general system: nothing in it says which product a rule came from.
// `Money` and `Ins` also stand for amounts and the Insert key, so those two count only as a product's name.
const root = join(import.meta.dirname, '../DS1');
const NAMES = /\b(?:Ezo|tau99|Peer|Consistency)\b|\b(?:Link|Money|Visual|Ins)['’]s\b/;
const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  if (statSync(path).isDirectory()) return name === 'generated' ? [] : walk(path);
  return /\.(?:ts|css|md)$/.test(name) ? [path] : [];
});

test('nothing in the system names a product', () => {
  const found = walk(root).flatMap(file => readFileSync(file, 'utf8').split('\n').flatMap((line, index) => (NAMES.test(line) ? [`${relative(root, file)}:${index + 1}`] : [])));
  expect(found).toEqual([]);
});
