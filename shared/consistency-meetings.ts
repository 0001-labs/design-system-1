/**
 * The booking block: a button on a site's page that leads to the site's own booking page (the platform's
 * `meeting-pages.ts` at `/_c9y/meetings`), where a visitor picks an open time with whoever connected their Google
 * calendar under Site settings. Written as a closed fence, ```c9y-meetings {…}```, holding only its words; where the
 * button leads is fixed here, never in the page. Shared by editing and publication. No DOM.
 */
import { escapeWords as escape, fenceWords } from './consistency-fence-words';

export interface MeetingsContent { kind: 'meetings'; button: string; note: string }
export type MeetingsWords = Omit<MeetingsContent, 'kind'>;
export const MEETINGS_DEFAULTS: MeetingsWords = { button: 'Book a meeting', note: 'Pick a time that suits you. You get a calendar invitation by email.' };
const words = fenceWords('c9y-meetings', MEETINGS_DEFAULTS, { button: 60, note: 300 }, ['note']);
export const MEETINGS_FIELDS = words.fields;
/** Where the button leads: every site's own address. */
export const MEETINGS_PAGE = '/_c9y/meetings';
export const EMPTY_MEETINGS_SOURCE = words.empty;

/** The block's words from its fence, defaults for those it leaves out; null for anything that is not a booking block. */
export function readMeetings(source: string): MeetingsContent | null {
  const value = words.read(source);
  return value ? { kind: 'meetings', ...value } : null;
}

/** The fence for the words, keeping only those that differ from the defaults. */
export const writeMeetings = (value: MeetingsWords): string => words.write(value);

/**
 * The button and the line under it. Published, the button is a link to the site's booking page. In the editor its
 * words carry `data-meetings-field` to be written in place, and the button leads nowhere.
 */
export function meetingsMarkup(value: MeetingsContent, options: { editor?: boolean } = {}): string {
  const editor = options.editor === true, field = (name: keyof MeetingsWords) => (editor ? ` data-meetings-field="${name}"` : '');
  return `<div class="c9y-native-meetings">`
    + (editor ? `<span class="ds-button ds-button--primary c9y-native-button"${field('button')}>${escape(value.button)}</span>` : `<a class="ds-button ds-button--primary c9y-native-button" href="${MEETINGS_PAGE}">${escape(value.button)}</a>`)
    + `<p class="c9y-native-meetings-note"${field('note')}>${escape(value.note)}</p></div>`;
}
