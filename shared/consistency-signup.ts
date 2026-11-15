/**
 * The signup block: a form on a site's page that signs a visitor up for the site's emails (the platform's
 * `email-pages.ts` takes it at `/_c9y/emails/subscribe`, with a double opt-in, while the site's Welcome flow is on).
 * Written as a closed fence, ```c9y-signup {…}```, holding only its words; the form itself, its fields, its
 * honeypot and where it posts are fixed here, never in the page. Shared by editing and publication. No DOM.
 */
export interface SignupContent { kind: 'signup'; name: string; email: string; button: string; note: string }
export type SignupWords = Omit<SignupContent, 'kind'>;
export const SIGNUP_FIELDS = ['name', 'email', 'button', 'note'] as const;
export const SIGNUP_DEFAULTS: SignupWords = { name: 'Your name', email: 'Your email', button: 'Sign up', note: 'We send you an email to confirm first. Every email has a link to stop them.' };
const LIMITS: Record<keyof SignupWords, number> = { name: 60, email: 60, button: 60, note: 300 };
/** Where the form posts: every site's own address. */
export const SIGNUP_ACTION = '/_c9y/emails/subscribe';
export const EMPTY_SIGNUP_SOURCE = '```c9y-signup\n{}\n```';

/** The block's words from its fence, defaults for those it leaves out; null for anything that is not a signup block. */
export function readSignup(source: string): SignupContent | null {
  if (source.length > 4_000) return null;
  const match = /^```c9y-signup\r?\n([\s\S]*)\r?\n```$/.exec(source); if (!match) return null;
  try {
    const data = JSON.parse(match[1]!) as unknown;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const value: SignupContent = { kind: 'signup', ...SIGNUP_DEFAULTS };
    for (const [key, words] of Object.entries(data)) {
      if (!(SIGNUP_FIELDS as readonly string[]).includes(key)) return null;
      const field = key as keyof SignupWords;
      if (typeof words !== 'string' || words.length > LIMITS[field] || (field !== 'note' && /[\r\n]/.test(words))) return null;
      if (words.trim()) value[field] = words;
    }
    return value;
  } catch { return null; }
}

/** The fence for the words, keeping only those that differ from the defaults. */
export function writeSignup(value: SignupWords): string {
  const words = Object.fromEntries(SIGNUP_FIELDS.filter(field => value[field].trim() && value[field] !== SIGNUP_DEFAULTS[field]).map(field => [field, value[field].slice(0, LIMITS[field])]));
  return `\`\`\`c9y-signup\n${JSON.stringify(words).replaceAll('`', '\\u0060')}\n\`\`\``;
}

const escape = (text: string) => text.replace(/[&<>"']/g, mark => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[mark]!);

/**
 * The form. Published, it posts to the site's signup page, which confirms the address by email. In the editor its
 * words carry `data-signup-field` to be written in place, and the form neither posts nor takes input.
 */
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
