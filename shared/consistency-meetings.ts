/**
 * The booking block: a button on a site's page that opens the booking under it (the platform's `meeting-pages.ts`
 * answers the times and takes the booking, at `/_c9y/meetings`), with whoever connected their Google calendar under
 * Site settings. Written as a closed fence, ```c9y-meetings {…}```, holding only its words; where the
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
 * Published, the block is a disclosure: the button alone until it is pressed, then the booking opens under it, the
 * line first, and the platform's script (`/_c9y/meetings.js`) reads the open times and draws the month, the times and
 * the form there; without the script, a link to the site's booking page stands in their place. In the editor the
 * button and its line are written in place, and the button opens nothing.
 */
export function meetingsMarkup(value: MeetingsContent, options: { editor?: boolean } = {}): string {
  const editor = options.editor === true, field = (name: keyof MeetingsWords) => (editor ? ` data-meetings-field="${name}"` : '');
  if (editor) return `<div class="c9y-native-meetings"><span class="ds-button ds-button--primary c9y-native-button"${field('button')}>${escape(value.button)}</span>`
    + `<p class="c9y-native-meetings-note"${field('note')}>${escape(value.note)}</p></div>`;
  return `<details class="c9y-native-meetings" data-c9y-meetings-inline><summary class="ds-button ds-button--primary c9y-native-button">${escape(value.button)}</summary>`
    + `<div class="c9y-native-meetings-panel" data-c9y-meetings-panel><p class="c9y-native-meetings-note">${escape(value.note)}</p>`
    + `<noscript><p><a href="${MEETINGS_PAGE}">Choose a time on the booking page</a></p></noscript></div></details>`;
}
