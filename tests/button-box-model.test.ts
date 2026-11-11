import { expect, it } from 'vite-plus/test';
import { buttonBoxPins, defaultButtonBox, writeButtonBox } from '../app/src/lib/buttonBoxModel';
it('changes the real button part and keeps existing branded CSS intact', () => {
  const original = ':root { --one-button-padding-inline: 12px; --one-button-padding-block: 8px; --brand: pink; }\n.brand { color: var(--brand); }';
  const next = writeButtonBox(original, { ...defaultButtonBox, paddingX: 20, paddingY: 4, borderTop: 2, marginLeft: 10 });
  expect(next).toContain(original);
  expect(next).toContain('--one-button-padding-inline: 20px;');
  expect(next).toContain('ds-button:not([split])::part(control)');
  expect(next).toContain('border-width: calc(2px * var(--ds-sf, 1))');
  expect(writeButtonBox(next, { ...defaultButtonBox, radius: 8 }).match(/ds1:button-box:start/g)).toHaveLength(1);
});
it('names the button tokens its single block pins, with the values the block draws', () => {
  const css = ':root { --brand: pink; }';
  expect([...buttonBoxPins(css)]).toEqual([]);
  expect([...buttonBoxPins(writeButtonBox(css, defaultButtonBox, 'split'))]).toEqual([]);
  expect(Object.fromEntries(buttonBoxPins(writeButtonBox(css, { ...defaultButtonBox, paddingX: 12, paddingY: 2, radius: 6 })))).toEqual({
    '--ds-button-size': 'auto', '--ds-button-padding-size': '12px', '--ds-button-corner-size': '6px',
  });
});
it('reads the last block, plain px written by hand, and leaves what it cannot read to the drawn component', () => {
  const block = (body: string) => `/* ds1:button-box:start */\nds-button:not([split]) {\n${body}\n}\n/* ds1:button-box:end */\n`;
  const pins = (css: string) => Object.fromEntries(buttonBoxPins(css));
  expect(pins(block('--ds-button-padding: 8px 12px; --ds-radius: 6px;'))).toEqual({ '--ds-button-size': 'auto', '--ds-button-padding-size': '12px', '--ds-button-corner-size': '6px' });
  expect(pins(block('--ds-button-padding: 4px;') + block('--ds-button-padding: 2px 10px; --ds-radius: calc(3px * var(--ds-sf, 1));'))).toMatchObject({ '--ds-button-padding-size': '10px', '--ds-button-corner-size': '3px' });
  expect(pins(block('--ds-button-padding: var(--space) 1em; --ds-radius: 50%;'))).toEqual({ '--ds-button-size': 'auto', '--ds-button-padding-size': '', '--ds-button-corner-size': '' });
});
