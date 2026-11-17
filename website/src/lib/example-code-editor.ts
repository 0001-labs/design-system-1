import { createEditor } from '../vendor/aa/aa.js';

export function codeDocument(source: string, language: string): string {
  const fence = '`'.repeat(Math.max(3, ...Array.from(source.matchAll(/`+/g), match => match[0].length + 1)));
  return `${fence}${language}\n${source}\n${fence}`;
}

export function mountCodeEditors(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('.example-code-block').forEach(block => {
    const host = block.querySelector<HTMLElement>('[data-code-editor]');
    const code = block.querySelector<HTMLElement>('code[data-source]');
    if (!host || !code || host.hasAttribute('aria-readonly')) return;
    createEditor(host, {
      value: codeDocument(code.textContent ?? '', code.dataset.source === 'html' ? 'html' : 'javascript'),
      readOnly: true,
      toolbar: false,
      menus: false,
      atoms: [],
    });
    code.parentElement!.hidden = true;
  });
}
