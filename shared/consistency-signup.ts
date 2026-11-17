import { escapeWords as escape, fenceWords } from './consistency-fence-words';

export interface SignupContent { kind: 'signup'; name: string; email: string; button: string; note: string }
export type SignupWords = Omit<SignupContent, 'kind'>;
export const SIGNUP_DEFAULTS: SignupWords = { name: 'Your name', email: 'Your email', button: 'Sign up', note: 'We send you an email to confirm first. Every email has a link to stop them.' };
const words = fenceWords('c9y-signup', SIGNUP_DEFAULTS, { name: 60, email: 60, button: 60, note: 300 }, ['note']);
export const SIGNUP_FIELDS = words.fields;
export const SIGNUP_ACTION = '/_c9y/emails/subscribe';
export const EMPTY_SIGNUP_SOURCE = words.empty;

export function readSignup(source: string): SignupContent | null {
  const value = words.read(source);
  return value ? { kind: 'signup', ...value } : null;
}

export const writeSignup = (value: SignupWords): string => words.write(value);

export function signupMarkup(value: SignupContent, options: { editor?: boolean } = {}): string {
  const editor = options.editor === true, field = (name: keyof SignupWords) => (editor ? ` data-signup-field="${name}"` : '');
  const inert = editor ? ' disabled tabindex="-1"' : '';
  return `<form class="c9y-native-signup"${editor ? '' : ` method="post" action="${SIGNUP_ACTION}"`} aria-label="${escape(value.button)}">`
    + `<label class="ds-field"><span class="ds-field__label"${field('name')}>${escape(value.name)}</span><input class="ds-input" name="name" autocomplete="name" required maxlength="100"${inert}></label>`
    + `<label class="ds-field"><span class="ds-field__label"${field('email')}>${escape(value.email)}</span><input class="ds-input" name="email" type="email" autocomplete="email" required maxlength="254"${inert}></label>`
    + `<span class="c9y-native-signup-trap" aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden"><input name="website" tabindex="-1" autocomplete="off"></span>`
    + (editor ? `<span class="ds-button ds-button--primary c9y-native-button"${field('button')}>${escape(value.button)}</span>` : `<button type="submit" class="ds-button ds-button--primary c9y-native-button">${escape(value.button)}</button>`)
    + `<p class="c9y-native-signup-note"${field('note')}>${escape(value.note)}</p></form>`;
}
