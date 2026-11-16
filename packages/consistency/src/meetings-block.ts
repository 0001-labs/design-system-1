/**
 * The booking block in the editor: the button and its line drawn as they will publish
 * (`shared/consistency-meetings.ts`), both written in place, the button leading nowhere. Inserted from the editor's
 * menu as Booking. Published, the button leads to the site's own booking page, which takes meetings once Google is
 * connected under Site settings.
 */
import { EMPTY_MEETINGS_SOURCE, MEETINGS_FIELDS, meetingsMarkup, readMeetings, writeMeetings, type MeetingsWords } from '../../../shared/consistency-meetings';
import { wordsAtom } from './words-atom';

export const meetingsAtom = (canWrite: () => boolean, getHost: () => HTMLElement | null) => wordsAtom<keyof MeetingsWords>({
  name: 'consistency-meetings', fence: 'c9y-meetings', label: 'Booking', icon: 'calendar', keywords: 'booking book meeting meetings call calendar schedule appointment time',
  empty: EMPTY_MEETINGS_SOURCE, fields: MEETINGS_FIELDS, lines: ['note'], read: readMeetings, write: writeMeetings,
  markup: (value, options) => meetingsMarkup({ kind: 'meetings', ...value }, options), attribute: 'data-meetings-field', className: 'consistency-content-meetings',
}, canWrite, getHost);
