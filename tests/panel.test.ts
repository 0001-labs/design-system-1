import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vite-plus/test';

const css = readFileSync(join(import.meta.dirname, '../DS1/4-page/styles/ds-panel.css'), 'utf8');

test('the body scrolls between a header and a footer that stay put, never sideways', () => {
  expect(css).toMatch(/\.body \{[^}]*min-height: 0;[^}]*overflow: hidden auto;/);
});
