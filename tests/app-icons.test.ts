// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { expect, test } from 'vite-plus/test';
import apps from '../DS1/x-app/catalog.json';
import '../DS1/2-core/ds-icon';

test('every app logo is self-contained and renders unchanged after deferred loading', async () => {
  for (const app of apps) {
    const original = readFileSync(`DS1/x-app/${app.key}.svg`, 'utf8').trim();
    expect(original).toMatch(/viewBox=/);
    expect(original).not.toMatch(/<(?:script|foreignObject|image|iframe)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#)/i);
    const icon = document.createElement('ds-icon');
    icon.type = `app-${app.key}` as typeof icon.type;
    icon.size = 'app';
    document.body.append(icon);
    await icon.updateComplete;
    const expected = document.createElement('template');
    expected.innerHTML = original;
    expect(icon.shadowRoot?.querySelector('svg')?.outerHTML).toBe(expected.content.querySelector('svg')?.outerHTML);
    icon.remove();
  }
});

test('app sizes are opt-in; ordinary interface sizes remain available', () => {
  const css = readFileSync('DS1/2-core/styles/ds-icon.css', 'utf8');
  expect(css).toContain(':host([size="app"]) { --ds-icon-size: 40px; }');
  expect(css).toContain(':host([size="app-large"]) { --ds-icon-size: 60px; }');
  expect(css).toContain('--ds-icon-size: 12px');
  expect(css).toContain('--ds-icon-size: 16px');
});
