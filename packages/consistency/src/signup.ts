/**
 * The signup block in the editor: the form drawn as it will publish (`shared/consistency-signup.ts`), its four
 * words written in place, the fields and button inert. Inserted from the editor's menu as Signup; the fence keeps
 * only the words that differ from the defaults. The form posts once published, to the site's signup page.
 */
import type { Atom } from '../../../website/src/vendor/aa/aa';
import { createPlainEditor } from '../../../website/src/vendor/aa/aa';
import { EMPTY_SIGNUP_SOURCE, SIGNUP_FIELDS, readSignup, signupMarkup, writeSignup, type SignupWords } from '../../../shared/consistency-signup';
import { applyLibraryTokens } from './libraries';

export function signupAtom(canWrite: () => boolean, getHost: () => HTMLElement | null): Atom {
  const tokens = (target: HTMLElement) => { const owner = getHost()?.closest<HTMLElement>('[data-consistency-library]'); applyLibraryTokens(target, owner?.dataset.consistencyLibrary ?? 'original', owner?.dataset.consistencyFonts); };
  return {
    name: 'consistency-signup', fence: 'c9y-signup', match: () => 0,
    insert: { label: 'Signup', icon: 'email', keywords: 'signup sign up newsletter subscribe email emails form list', source: EMPTY_SIGNUP_SOURCE, preview(target) {
      tokens(target);
      target.innerHTML = signupMarkup(readSignup(EMPTY_SIGNUP_SOURCE)!, { editor: true });
      return () => target.replaceChildren();
    } },
    draw(element, initialSource) {
      let value = readSignup(initialSource); if (!value) { element.textContent = initialSource; return; }
      let source = initialSource;
      element.classList.add('consistency-content-element', 'consistency-content-signup');
      element.innerHTML = signupMarkup(value, { editor: true });
      const editors = new Map<keyof SignupWords, ReturnType<typeof createPlainEditor>>();
      for (const node of element.querySelectorAll<HTMLElement>('[data-signup-field]')) {
        const field = node.dataset.signupField as keyof SignupWords;
        if (!(SIGNUP_FIELDS as readonly string[]).includes(field)) continue;
        node.setAttribute('data-aa-interactive', ''); node.setAttribute('aria-label', `Signup ${field === 'note' ? 'note' : `${field} words`}`);
        node.textContent = '';
        editors.set(field, createPlainEditor(node, { value: value[field], readOnly: !canWrite() }));
      }
      // One history entry for a field's edit: the words are written back when the field is left.
      const commit = () => {
        if (!canWrite() || !value) return;
        const next = { ...value };
        for (const [field, editor] of editors) next[field] = field === 'note' ? editor.value : editor.value.replace(/[\r\n]+/g, ' ');
        const nextSource = writeSignup(next);
        if (nextSource === source || !readSignup(nextSource)) return;
        value = readSignup(nextSource); source = nextSource;
        element.dispatchEvent(new CustomEvent('aa-atom-source', { bubbles: true, detail: { source } }));
      };
      element.addEventListener('focusout', commit);
      return () => { element.removeEventListener('focusout', commit); for (const editor of editors.values()) editor.destroy(); };
    },
  };
}
