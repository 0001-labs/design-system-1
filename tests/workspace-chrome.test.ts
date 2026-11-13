// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';

// The panels' module counts its loads and waits until the test lets it arrive.
const panels = vi.hoisted(() => {
  let release = () => {};
  return { loaded: vi.fn(), arrived: new Promise<void>(resolve => { release = resolve; }), release: () => release() };
});
vi.mock('../DS1/5-visual-kit/workspace', async (original) => {
  panels.loaded();
  await panels.arrived;
  return original();
});
import { DsAppChrome } from '../DS1/5-visual-kit/app-chrome';
import { DsWindow } from '../DS1/5-visual-kit/window';
import { constraints } from '../DS1/0-face/constraints';

afterEach(() => { document.body.replaceChildren(); });
const ticks = async () => { for (let tick = 0; tick < 5; tick++) await new Promise(resolve => setTimeout(resolve, 0)); };

test('other presentations never load the workspace panels', async () => {
  for (const kind of ['macos-compact', 'macos', 'ios', 'safari', 'chrome'] as const) {
    const chrome = new DsAppChrome();
    chrome.kind = kind;
    document.body.append(chrome);
    await chrome.updateComplete;
    chrome.remove();
  }
  expect(panels.loaded).not.toHaveBeenCalled();
});

test('Claude draws its layout and the product at once, and updateComplete waits for the panels', async () => {
  const chrome = new DsAppChrome();
  Object.assign(chrome, { kind: 'claude', label: 'Checkout', items: 'Orders page, Dark mode', prompt: 'Make it one page.', reply: 'Done.', model: 'Opus 5.5', address: 'https://shop.example/checkout', username: 'joachim' });
  chrome.append(document.createElement('iframe'));
  document.body.append(chrome);
  let settled = false;
  void chrome.updateComplete.then(() => { settled = true; });
  await ticks();
  const root = chrome.shadowRoot!;
  // While the panels load: the layout and the stage's slot are drawn, so the product shows where it will stay.
  expect(panels.loaded).toHaveBeenCalledTimes(1);
  expect(root.querySelector('.ws-claude .ws-pane .ws-stage slot')).not.toBeNull();
  expect(root.querySelector('.ws-thread')).toBeNull();
  expect(settled).toBe(false);
  panels.release();
  await chrome.updateComplete;
  expect([...root.querySelectorAll('.ws-side .ws-row')].map(row => row.textContent?.trim())).toEqual(['New', 'Search', 'Artifacts', 'Scheduled', 'Customize', 'Checkout', 'Orders page', 'Dark mode']);
  expect(root.querySelector('.ws-row.on:not(nav .ws-row)')?.textContent?.trim()).toBe('Checkout');
  expect(root.querySelector('.ws-bubble')?.textContent).toBe('Make it one page.');
  expect(root.querySelector('.ws-meta')?.textContent).toContain('Opus 5.5');
  expect(root.querySelector('.ws-tab')?.textContent).toBe('shop.example');
  expect(root.querySelector('.ws-avatar')?.textContent).toBe('J');
  expect(root.querySelector('.ws-pane .ws-stage slot')).not.toBeNull();
});

test('Codex and Figma keep the product in their stage; switching between them reuses the loaded panels', async () => {
  const chrome = new DsAppChrome();
  Object.assign(chrome, { kind: 'codex', label: 'Checkout', model: 'GPT-5.5' });
  document.body.append(chrome);
  await chrome.updateComplete;
  const root = chrome.shadowRoot!;
  expect(root.querySelector('.ws-codex .ws-pane .ws-stage slot')).not.toBeNull();
  expect(root.querySelector('.ws-input')?.textContent).toContain('GPT-5.5');
  chrome.kind = 'figma';
  chrome.items = 'Header, Footer';
  await chrome.updateComplete;
  expect(root.querySelector('.ws-figma .ws-main .ws-stage slot')).not.toBeNull();
  expect([...root.querySelectorAll('.ws-row.child')].map(row => row.textContent?.trim())).toEqual(['Header', 'Footer']);
  expect(panels.loaded).toHaveBeenCalledTimes(1);
  chrome.kind = 'safari';
  await chrome.updateComplete;
  expect(root.querySelector('.ws')).toBeNull();
  expect(root.querySelector('.safari-toolbar')).not.toBeNull();
});

test('a window hands its viewport to the workspace stage and forwards the scene', async () => {
  const frame = new DsWindow();
  Object.assign(frame, { kind: 'claude', prompt: 'Make it one page.' });
  frame.append(document.createElement('iframe'));
  document.body.append(frame);
  await frame.updateComplete;
  const chrome = frame.shadowRoot!.querySelector('ds-app-chrome')!;
  expect(chrome.classList.contains('workspace')).toBe(true);
  expect(chrome.querySelector(':scope > .viewport slot')).not.toBeNull();
  const ownViewport = () => [...frame.shadowRoot!.children].find(child => child.classList.contains('viewport'));
  expect(ownViewport()).toBeUndefined();
  expect(chrome.prompt).toBe('Make it one page.');
  frame.kind = 'safari';
  await frame.updateComplete;
  expect(ownViewport()?.querySelector('slot')).not.toBeNull();
  expect(frame.shadowRoot!.querySelector('ds-app-chrome')!.children).toHaveLength(0);
});

test('a bare workspace chrome is measured as a window', () => {
  document.body.innerHTML = '<div><ds-app-chrome kind="figma"></ds-app-chrome></div>';
  document.body.firstElementChild!.getBoundingClientRect = () => ({ width: 1280, height: 800 }) as DOMRect;
  const rule = constraints.find(c => c.code === 'window.shape')!;
  expect(rule.count(document)).toBe(1);
});
