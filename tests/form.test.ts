// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')));
await import('../DS1/3-unit/ds-form');
await import('../DS1/2-core/ds-input');
await import('../DS1/2-core/ds-button');
import type { Form } from '../DS1/3-unit/ds-form';

afterEach(() => document.body.replaceChildren());

async function form(inside: string) {
  document.body.innerHTML = `<ds-form><ds-input name="name" value="Ada"></ds-input>${inside}</ds-form>`;
  const element = document.querySelector('ds-form') as Form;
  await element.updateComplete;
  await document.querySelector('ds-input')!.updateComplete;
  const submitted = vi.fn(), reset = vi.fn();
  element.addEventListener('form-submit', event => submitted((event as CustomEvent).detail.data));
  element.addEventListener('form-reset', reset);
  return { element, submitted, reset };
}

test('a slotted submit button submits the form drawn in the shadow', async () => {
  const { submitted } = await form('<ds-button control="slotted" primary><button type="submit">Join</button></ds-button>');
  document.querySelector('button')!.click();
  await Promise.resolve();
  expect(submitted).toHaveBeenCalledWith({ name: 'Ada' });
});

test('a slotted reset button puts a ds-input back to the value it started with', async () => {
  const { reset, submitted } = await form('<ds-button control="slotted"><button type="reset">Reset</button></ds-button>');
  const input = document.querySelector('ds-input') as HTMLElement & { value: string };
  input.value = 'Grace';
  document.querySelector('button')!.click();
  expect(reset).toHaveBeenCalledTimes(1);
  expect(submitted).not.toHaveBeenCalled();
  expect(input.value).toBe('Ada');
});

test('reset puts native fields back as a native form does, and a radio keeps its value', async () => {
  const { element } = await form(`
    <input type="text" name="city" value="Oslo">
    <input type="checkbox" name="news" checked>
    <input type="checkbox" name="terms">
    <input type="radio" name="plan" value="free" checked>
    <input type="radio" name="plan" value="paid">
    <textarea name="note">First</textarea>
    <select name="size"><option value="s">S</option><option value="m" selected>M</option></select>
    <input type="hidden" name="token" value="kept">`);
  const field = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
  field<HTMLInputElement>('[name="city"]').value = 'Bergen';
  field<HTMLInputElement>('[name="news"]').checked = false;
  field<HTMLInputElement>('[name="terms"]').checked = true;
  field<HTMLInputElement>('[value="paid"]').checked = true;
  field<HTMLTextAreaElement>('textarea').value = 'Second';
  field<HTMLSelectElement>('select').value = 's';
  element.reset();
  expect(field<HTMLInputElement>('[name="city"]').value).toBe('Oslo');
  expect(field<HTMLInputElement>('[name="news"]').checked).toBe(true);
  expect(field<HTMLInputElement>('[name="terms"]').checked).toBe(false);
  expect(field<HTMLInputElement>('[value="free"]').checked).toBe(true);
  expect(field<HTMLInputElement>('[value="paid"]').value).toBe('paid');
  expect(field<HTMLTextAreaElement>('textarea').value).toBe('First');
  expect(field<HTMLSelectElement>('select').value).toBe('m');
  expect(field<HTMLInputElement>('[name="token"]').value).toBe('kept');
});

test('a required ds-input says so in the page\'s words', async () => {
  const { element } = await form('<ds-input name="mail" required></ds-input>');
  expect(element.validate().errors.mail).toBe('This field is required');
});

test('ds-button with type="submit" submits, and a plain button does not', async () => {
  const { submitted } = await form('<button type="button">Other</button><ds-button primary type="submit">Join</ds-button>');
  document.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
  await Promise.resolve();
  expect(submitted).not.toHaveBeenCalled();
  (document.querySelector('ds-button') as HTMLElement).click();
  await Promise.resolve();
  expect(submitted).toHaveBeenCalledTimes(1);
});

test('a disabled or prevented button does not submit', async () => {
  const { submitted } = await form('<button type="submit" disabled>Join</button><button type="submit" class="held">Join</button>');
  document.querySelector<HTMLButtonElement>('[disabled]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const held = document.querySelector<HTMLButtonElement>('.held')!;
  held.addEventListener('click', event => event.preventDefault());
  held.click();
  await Promise.resolve();
  expect(submitted).not.toHaveBeenCalled();
});

test('Enter submits from a field but not from a button or a textarea', async () => {
  const { submitted } = await form('<ds-input name="note" multiline></ds-input><button type="reset">Clear</button>');
  const enter = () => new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true });
  const [field, note] = [...document.querySelectorAll('ds-input')] as (HTMLElement & { updateComplete: Promise<boolean> })[];
  await note.updateComplete;
  note.shadowRoot!.querySelector('textarea')!.dispatchEvent(enter());
  document.querySelector('button')!.dispatchEvent(enter());
  await Promise.resolve();
  expect(submitted).not.toHaveBeenCalled();
  field.shadowRoot!.querySelector('input')!.dispatchEvent(enter());
  await Promise.resolve();
  expect(submitted).toHaveBeenCalledTimes(1);
});
