import { escapeWords as escape, fenceWords } from './consistency-fence-words';

export interface MeetingsContent { kind: 'meetings'; button: string; note: string; message: string; or: string }
export type MeetingsWords = Omit<MeetingsContent, 'kind'>;
export const MEETINGS_DEFAULTS: MeetingsWords = { button: 'Book a meeting', note: 'Pick a time that suits you. You get a calendar invitation by email.', message: '', or: 'or' };
const words = fenceWords('c9y-meetings', MEETINGS_DEFAULTS, { button: 60, note: 300, message: 60, or: 20 }, ['note']);
export const MEETINGS_FIELDS = words.fields;
export const MEETINGS_PAGE = '/_c9y/meetings';
export const EMPTY_MEETINGS_SOURCE = words.empty;

export function readMeetings(source: string): MeetingsContent | null {
  const value = words.read(source);
  return value ? { kind: 'meetings', ...value } : null;
}

export const writeMeetings = (value: MeetingsWords): string => words.write(value);

export function meetingsMarkup(value: MeetingsContent, options: { editor?: boolean } = {}): string {
  const editor = options.editor === true, field = (name: keyof MeetingsWords) => (editor ? ` data-meetings-field="${name}"` : '');
  if (editor) return `<div class="c9y-native-meetings"><span class="c9y-native-meetings-choices">`
    + (value.message ? `<span class="ds-button ds-button--secondary c9y-native-button"${field('message')}>${escape(value.message)}</span> <span class="c9y-native-meetings-or"${field('or')}>${escape(value.or)}</span> ` : '')
    + `<span class="ds-button ds-button--secondary c9y-native-button"${field('button')}>${escape(value.button)}</span></span><p class="c9y-native-meetings-note"${field('note')}>${escape(value.note)}</p></div>`;
  const booking = `<details class="c9y-native-meetings" name="c9y-meetings" data-c9y-meetings-inline><summary class="ds-button ds-button--secondary c9y-native-button">${escape(value.button)}</summary>`
    + `<div class="c9y-native-meetings-panel" data-c9y-meetings-panel><p class="c9y-native-meetings-note">${escape(value.note)}</p>`
    + `<noscript><p><a href="${MEETINGS_PAGE}">Choose a time on the booking page</a></p></noscript></div></details>`;
  const message = value.message ? `<details class="c9y-native-meetings" name="c9y-meetings" data-c9y-meetings-message hidden><summary class="ds-button ds-button--secondary c9y-native-button">${escape(value.message)}</summary>`
    + '<div class="c9y-native-meetings-panel" data-c9y-message-panel></div></details>' : '';
  return `<div class="c9y-native-meetings-choices">${message ? `${message}<span class="c9y-native-meetings-or" hidden>${escape(value.or)}</span>` : ''}${booking}</div>`;
}
