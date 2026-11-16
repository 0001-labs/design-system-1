/**
 * The signup block in the editor: the form drawn as it will publish (`shared/consistency-signup.ts`), its four
 * words written in place, the fields and button inert. Inserted from the editor's menu as Signup; the fence keeps
 * only the words that differ from the defaults. The form posts once published, to the site's signup page.
 */
import { EMPTY_SIGNUP_SOURCE, SIGNUP_FIELDS, readSignup, signupMarkup, writeSignup, type SignupWords } from '../../../shared/consistency-signup';
import { wordsAtom } from './words-atom';

export const signupAtom = (canWrite: () => boolean, getHost: () => HTMLElement | null) => wordsAtom<keyof SignupWords>({
  name: 'consistency-signup', fence: 'c9y-signup', label: 'Signup', icon: 'email', keywords: 'signup sign up newsletter subscribe email emails form list',
  empty: EMPTY_SIGNUP_SOURCE, fields: SIGNUP_FIELDS, lines: ['note'], read: readSignup, write: writeSignup,
  markup: (value, options) => signupMarkup({ kind: 'signup', ...value }, options), attribute: 'data-signup-field', className: 'consistency-content-signup',
}, canWrite, getHost);
