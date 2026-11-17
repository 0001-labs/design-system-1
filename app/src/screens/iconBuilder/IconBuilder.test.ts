// @vitest-environment happy-dom
import { expect, it } from 'vite-plus/test';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-checkbox';
import '../../../../DS1/2-core/ds-color';
import '../../../../DS1/2-core/ds-file-picker';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/3-unit/ds-select';
import '../../../../DS1/2-core/ds-swatch';
import '../../../../DS1/3-unit/ds-tabs';
import type { Button } from '../../../../DS1/2-core/ds-button';
import { builderMarkup } from './markup';

it('draws the builder with Design system 1 controls and keeps the editor wired to them', async () => {
  localStorage.clear();
  document.body.innerHTML = builderMarkup();
  await import('./editor');
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

  expect(document.querySelector('[title]')).toBeNull();
  expect([...document.querySelectorAll('button, a')].map(control => control.textContent).join(' ')).not.toMatch(/[↶↷↻↔↗↓＋−×]/);

  const triangle = document.querySelector<HTMLButtonElement>('[data-tool="triangle"]')!;
  expect(triangle.closest('ds-tabs')?.getAttribute('role')).toBe('group');
  triangle.click();
  expect(triangle.getAttribute('aria-pressed')).toBe('true');
  expect(triangle.closest('ds-button')!.hasAttribute('active')).toBe(true);
  expect(document.querySelector('[data-tool="paint"]')!.closest('ds-button')!.hasAttribute('active')).toBe(false);

  const inks = () => $('inks').querySelectorAll('ds-button[choice] ds-swatch').length;
  const before = inks();
  const history = $<Button>('history');
  expect(history.segments?.map(segment => segment.disabled)).toEqual([true, true]);
  $('add-ink').click();
  expect(inks()).toBe(before + 1);
  expect(history.segments?.map(segment => segment.disabled)).toEqual([false, true]);
  history.dispatchEvent(new CustomEvent('press', { detail: { value: 'undo' } }));
  expect(inks()).toBe(before);
  expect(history.segments?.map(segment => segment.disabled)).toEqual([true, false]);

  document.querySelector<HTMLButtonElement>('[data-mask="circle"]')!.click();
  expect(document.querySelector('[data-mask="circle"]')!.closest('ds-button')!.hasAttribute('active')).toBe(true);
  expect($<HTMLInputElement>('radius').disabled).toBe(true);

  expect($('drawing-name').localName).toBe('ds-input');
  expect($('ink-hex').localName).toBe('ds-input');
  expect($('file-input').parentElement!.localName).toBe('ds-file-picker');
});
