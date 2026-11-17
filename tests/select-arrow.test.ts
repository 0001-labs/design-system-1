import { expect, test } from 'vite-plus/test';
import { readFileSync } from 'node:fs';
import { constraints } from '../DS1/0-face/constraints';

test("the select arrow stays clear of the chosen words at every control height", () => {
  // The arrow is a 16px icon, never as high as the control, so a taller control keeps it inside the field's room.
  const css = readFileSync(new URL('../DS1/3-unit/styles/ds-select.css', import.meta.url), 'utf8');
  const arrowRule = css.slice(css.indexOf('.arrow {'), css.indexOf('}', css.indexOf('.arrow {')));
  expect(arrowRule).toContain('width: calc(16px * var(--ds-sf))');
  expect(arrowRule).toContain('height: calc(16px * var(--ds-sf))');
  expect(arrowRule).not.toContain('var(--ds-control-height)');
  expect(css).toContain('padding: 0 var(--ds-select-unit) 0 calc(4px * var(--ds-sf)) !important');

  const rule = constraints.find(rule => rule.code === 'select.arrow-room')!;
  // A field 200px wide ending at 300, with one square (20px) of room for the arrow, drawn 2px from its end.
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
  // The 16px icon stands inside the room.
  expect(rule.inspect(root)).toHaveLength(0);
  // An arrow as high as a 36px control reaches 18px into the words.
  arrowWidth = 36;
  const findings = rule.inspect(root);
  expect(findings).toHaveLength(1);
  expect(findings[0].message).toContain('18px');
});
