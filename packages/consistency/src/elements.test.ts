// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vite-plus/test';
vi.hoisted(() => { globalThis.fetch = async () => new Response('{}'); });
import { contentElementAtoms, readContentElement, writeContentElement, type ContentElement } from './elements';
afterEach(() => document.body.replaceChildren());
it('round-trips component Markdown with quotes, newlines and closing fences', () => {
  const values: ContentElement[] = [{ kind: 'button', label: '<img onerror=x> ``` "\nButton', secondary: true }, { kind: 'card', label: 'Label', title: 'Title', body: 'Words\nwith ``` and "quotes"' }];
  for (const value of values) expect(readContentElement(writeContentElement(value))).toEqual(value);
  expect(readContentElement('```c9y-card\n{"label":"x","title":3}\n```')).toBeNull();
});
it('offers slash insertions with real DS1 faces and read-only permissions', () => {
  // Signup and Booking hold only their words (words-atom.ts) and have tests of their own below.
  for (const atom of contentElementAtoms(() => false).filter(each => each.fence !== 'c9y-signup' && each.fence !== 'c9y-meetings')) {
    expect(atom.insert?.label).toMatch(/Button|Card|Carousel/);
    expect(readContentElement(atom.insert!.source)?.kind).toBe(atom.fence!.slice(4));
    const host = document.createElement('span'); document.body.append(host);
    atom.draw!(host, atom.insert!.source);
    const face = host.querySelector(atom.fence === 'c9y-button' ? 'ds-button' : atom.fence === 'c9y-carousel' ? 'ds-carousel' : 'ds-card');
    expect(face).not.toBeNull(); if (atom.fence === 'c9y-carousel') expect(host.querySelector<HTMLElement>('.consistency-carousel-tools')!.hidden).toBe(true); else expect(face!.inert).toBe(true);
    host.click(); expect(document.querySelector('ds-overlay')).toBeNull(); expect(host.tabIndex).toBe(-1);
  }
});
it('requests deletion through Aa atom-source for standard history', () => {
  const atom = contentElementAtoms(() => true)[0], host = document.createElement('span'); document.body.append(host);
  const cleanup = atom.draw!(host, atom.insert!.source), change = vi.fn(); host.addEventListener('aa-atom-source', change);
  host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
  expect(change.mock.calls[0][0].detail).toEqual({ source: '' }); cleanup?.();
});

it('edits the rendered card fields directly and commits safely through Aa', () => {
  const atom = contentElementAtoms(() => true)[1], host = document.createElement('span'); document.body.append(host);
  const cleanup = atom.draw!(host, atom.insert!.source), change = vi.fn(); host.addEventListener('aa-atom-source', change);
  expect(host.querySelector('ds-input')).toBeNull();
  const title = host.querySelector<HTMLElement>('[slot="title"] .aa-block')!;
  title.textContent = '<script>bad()</script>';
  title.dispatchEvent(new Event('input', { bubbles: true }));
  title.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  expect(change).toHaveBeenCalledTimes(1);
  expect(readContentElement(change.mock.calls[0][0].detail.source)).toMatchObject({ title: '<script>bad()</script>' });
  expect(host.querySelector('script')).toBeNull(); cleanup?.();
});

it('changes card appearance from its context menu without a second text editor', () => {
  const atom = contentElementAtoms(() => true)[1], host = document.createElement('span'); document.body.append(host);
  const cleanup = atom.draw!(host, atom.insert!.source), change = vi.fn(); host.addEventListener('aa-atom-source', change);
  host.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
  const menu = document.querySelector('ds-context')!;
  expect(menu.querySelector('ds-input, input, textarea, [contenteditable]')).toBeNull();
  Array.from(menu.querySelectorAll('button')).find(button => button.textContent === 'Sharp blue')!.click();
  expect(readContentElement(change.mock.calls.at(-1)![0].detail.source)).toMatchObject({ tone: 'sharp-blue', variant: 'filled' });
  cleanup?.();
});

it.each(['button', 'card', 'carousel'])('inserts /%s through Aa slash menu and undoes through its standard history', async kind => {
  const { createEditor } = await import('../../../website/src/vendor/aa/aa');
  const host = document.createElement('div'); document.body.append(host);
  const editor = createEditor(host, { value: '/' + kind, atoms: contentElementAtoms(() => true) });
  editor.focus(); editor.selectRange(kind.length + 1);
  host.dispatchEvent(new Event('aa-change'));
  document.dispatchEvent(new Event('selectionchange'));
  await new Promise(resolve => setTimeout(resolve, 0));
  const choice = Array.from(document.querySelectorAll<HTMLButtonElement>('.aa-menu button')).find(button => button.textContent?.includes(kind === 'button' ? 'Button' : kind === 'carousel' ? 'Carousel' : 'Card'));
  expect(choice).toBeDefined(); choice!.click();
  expect(editor.value).toContain('```c9y-' + kind); expect(host.querySelector('ds-' + kind)).not.toBeNull();
  editor.undo(); expect(editor.value).toBe('/' + kind); editor.destroy();
});

it('previews the selected library with real components and follows library changes', async () => {
  const owner = document.createElement('section'); owner.dataset.consistencyLibrary = 'blue';
  const host = document.createElement('div'), preview = document.createElement('div'); owner.append(host); document.body.append(owner, preview);
  const atom = contentElementAtoms(() => true, () => host)[0];
  const cleanup = atom.insert!.preview!(preview, { input: 'keyboard' });
  expect(preview.querySelector('ds-button[primary]')).not.toBeNull();
  expect(preview.dataset.consistencyLibrary).toBe('blue');
  await preview.querySelector('ds-icon')!.updateComplete; expect(preview.querySelector('ds-icon[type="cursor"]')).not.toBeNull();
  owner.dataset.consistencyLibrary = 'ink'; await new Promise(resolve => setTimeout(resolve, 0));
  expect(preview.dataset.consistencyLibrary).toBe('ink'); expect(preview.style.colorScheme).toBe('dark');
  cleanup?.(); expect(preview.children).toHaveLength(0);
});

it('keeps button destinations in source and rejects unsafe destinations', () => {
  for (const action of [{ kind: 'link' as const, target: 'https://example.com' }, { kind: 'page' as const, target: '/about' }]) {
    const value: ContentElement = { kind: 'button', label: 'Read more', secondary: false, action };
    expect(readContentElement(writeContentElement(value))).toEqual(value);
  }
  const unsafe = readContentElement('```c9y-button\n{"label":"Go","secondary":false,"action":{"kind":"link","target":"javascript:alert(1)"}}\n```');
  expect(unsafe).toEqual({ kind: 'button', label: 'Go', secondary: false });
});

it('keeps card dimensions through text and appearance source changes', () => {
  const card: ContentElement = { kind: 'card', label: 'Label', title: 'Title', body: 'Body', width: 300, height: 240 };
  const read = readContentElement(writeContentElement(card));
  expect(read).toEqual(card);
  expect(readContentElement(writeContentElement({ ...card, title: 'Changed', tone: 'pink' }))).toMatchObject({ width: 300, height: 240, title: 'Changed', tone: 'pink' });
});

it('draws the signup block as its published form, its words written in place and kept on leaving a field', () => {
  const atom = contentElementAtoms(() => true).find(each => each.fence === 'c9y-signup')!;
  expect(atom.insert?.label).toBe('Signup');
  const host = document.createElement('div'); document.body.append(host);
  const sources: string[] = [];
  host.addEventListener('aa-atom-source', event => sources.push((event as CustomEvent<{ source: string }>).detail.source));
  atom.draw!(host, atom.insert!.source);
  expect(host.querySelector('form.c9y-native-signup')?.hasAttribute('action')).toBe(false);
  expect([...host.querySelectorAll('input.ds-input')].every(input => (input as HTMLInputElement).disabled)).toBe(true);
  const button = host.querySelector<HTMLElement>('[data-signup-field="button"]')!;
  button.querySelector<HTMLElement>('[contenteditable]')!.textContent = 'Get the news';
  host.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  expect(sources).toEqual(['```c9y-signup\n{"button":"Get the news"}\n```']);
  const readOnly = contentElementAtoms(() => false).find(each => each.fence === 'c9y-signup')!, other = document.createElement('div'); document.body.append(other);
  readOnly.draw!(other, atom.insert!.source);
  other.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  expect(other.querySelector('[data-signup-field="note"] [contenteditable="true"]')).toBeNull();
});

it('draws the booking block as its published button, its words written in place and kept on leaving a field', () => {
  const atom = contentElementAtoms(() => true).find(each => each.fence === 'c9y-meetings')!;
  expect(atom.insert?.label).toBe('Booking');
  const host = document.createElement('div'); document.body.append(host);
  const sources: string[] = [];
  host.addEventListener('aa-atom-source', event => sources.push((event as CustomEvent<{ source: string }>).detail.source));
  atom.draw!(host, atom.insert!.source);
  expect(host.classList.contains('consistency-content-meetings')).toBe(true);
  expect(host.querySelector('a')).toBeNull();
  const button = host.querySelector<HTMLElement>('[data-meetings-field="button"]')!;
  expect(button.getAttribute('aria-label')).toBe('Booking button words');
  button.querySelector<HTMLElement>('[contenteditable]')!.textContent = 'Talk to us';
  host.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  expect(sources).toEqual(['```c9y-meetings\n{"button":"Talk to us"}\n```']);
});
