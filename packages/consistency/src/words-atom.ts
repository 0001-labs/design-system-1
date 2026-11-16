/**
 * A block whose fence holds only its words (`shared/consistency-fence-words.ts`), in the editor: drawn as it will
 * publish, each word written in place where the markup marks it, the fence keeping only the words that differ from
 * the defaults. What the block does stays inert until it is published. Signup and Booking are made this way.
 */
import type { Atom } from '../../../website/src/vendor/aa/aa';
import { createPlainEditor } from '../../../website/src/vendor/aa/aa';
import { applyLibraryTokens } from './libraries';

export interface WordsBlock<Field extends string> {
  /** The atom's name and its fence, `c9y-…`. */
  name: string; fence: string;
  /** How the editor's menu offers it. */
  label: string; icon: string; keywords: string;
  empty: string; fields: readonly Field[];
  /** The words that may run over several lines; the others are kept on one. */
  lines?: readonly Field[];
  read(source: string): Record<Field, string> | null;
  write(value: Record<Field, string>): string;
  /** The block as it publishes, with each word marked by `attribute` in the editor. */
  markup(value: Record<Field, string>, options: { editor: true }): string;
  /** The attribute the markup marks a word with (`data-signup-field`), and the class its editor styles hang on. */
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
      // One history entry for a field's edit: the words are written back when the field is left.
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
