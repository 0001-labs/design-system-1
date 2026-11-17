import { expect, test } from 'vite-plus/test';
import { readFileSync } from 'node:fs';
import { constraints } from '../DS1/0-face/constraints';

test("the select arrow stays clear of the chosen words at every control height", () => {
  const css = readFileSync(new URL('../DS1/3-unit/styles/ds-select.css', import.meta.url), 'utf8');
  const arrowRule = css.slice(css.indexOf('.arrow {'), css.indexOf('}', css.indexOf('.arrow {')));
  expect(arrowRule).toContain('width: calc(16px * var(--ds-sf))');
  expect(arrowRule).toContain('height: calc(16px * var(--ds-sf))');
  expect(arrowRule).not.toContain('var(--ds-control-height)');
  expect(css).toContain('padding: 0 var(--ds-select-unit) 0 calc(4px * var(--ds-sf)) !important');

  const rule = constraints.find(rule => rule.code === 'select.arrow-room')!;
  let arrowWidth = 16;
  const select = {
    getBoundingClientRect: () => ({ right: 300, width: 200 }),
    ownerDocument: { defaultView: { getComputedStyle: () => ({ paddingRight: '20px' }) } },
  };
  const arrow = { getBoundingClientRect: () => ({ left: 300 - 2 - arrowWidth, width: arrowWidth }) };
  const element = {
    querySelector: () => select,
    shadowRoot: { querySelector: () => arrow },
  };
  const root = { querySelectorAll: () => [element] } as unknown as ParentNode;
  expect(rule.inspect(root)).toHaveLength(0);
  arrowWidth = 36;
  const findings = rule.inspect(root);
  expect(findings).toHaveLength(1);
  expect(findings[0].message).toContain('18px');
});
