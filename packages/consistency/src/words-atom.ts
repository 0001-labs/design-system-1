import type { Atom } from '../../../website/src/vendor/aa/aa';
import { createPlainEditor } from '../../../website/src/vendor/aa/aa';
import { applyLibraryTokens } from './libraries';

export interface WordsBlock<Field extends string> {
  name: string; fence: string;
  label: string; icon: string; keywords: string;
  empty: string; fields: readonly Field[];
  lines?: readonly Field[];
  read(source: string): Record<Field, string> | null;
  write(value: Record<Field, string>): string;
  markup(value: Record<Field, string>, options: { editor: true }): string;
  attribute: string; className: string;
}

export function wordsAtom<Field extends string>(block: WordsBlock<Field>, canWrite: () => boolean, getHost: () => HTMLElement | null): Atom {
  const tokens = (target: HTMLElement) => { const owner = getHost()?.closest<HTMLElement>('[data-consistency-library]'); applyLibraryTokens(target, owner?.dataset.consistencyLibrary ?? 'original', owner?.dataset.consistencyFonts); };
  return {
    name: block.name, fence: block.fence, match: () => 0,
    insert: { label: block.label, icon: block.icon, keywords: block.keywords, source: block.empty, preview(target) {
      tokens(target);
      target.innerHTML = block.markup(block.read(block.empty)!, { editor: true });
      return () => target.replaceChildren();
    } },
    draw(element, initialSource) {
      let value = block.read(initialSource); if (!value) { element.textContent = initialSource; return; }
      let source = initialSource;
      element.classList.add('consistency-content-element', block.className);
      element.innerHTML = block.markup(value, { editor: true });
      const editors = new Map<Field, ReturnType<typeof createPlainEditor>>();
      for (const node of element.querySelectorAll<HTMLElement>(`[${block.attribute}]`)) {
        const field = node.getAttribute(block.attribute) as Field;
        if (!block.fields.includes(field)) continue;
        node.setAttribute('data-aa-interactive', ''); node.setAttribute('aria-label', `${block.label} ${block.lines?.includes(field) ? field : `${field} words`}`);
        node.textContent = '';
        editors.set(field, createPlainEditor(node, { value: value[field], readOnly: !canWrite() }));
      }
      const commit = () => {
        if (!canWrite() || !value) return;
        const next = { ...value };
        for (const [field, editor] of editors) next[field] = block.lines?.includes(field) ? editor.value : editor.value.replace(/[\r\n]+/g, ' ');
        const nextSource = block.write(next), read = block.read(nextSource);
        if (nextSource === source || !read) return;
        value = read; source = nextSource;
        element.dispatchEvent(new CustomEvent('aa-atom-source', { bubbles: true, detail: { source } }));
      };
      element.addEventListener('focusout', commit);
      return () => { element.removeEventListener('focusout', commit); for (const editor of editors.values()) editor.destroy(); };
    },
  };
}
