/**
 * The words and choices of a site's meetings (`site-meetings.ts`), apart from the element so they test without a page.
 */
import { SiteApiError } from './api';

const WORDS: Record<string, string> = {
  'google-not-set-up': 'Google is not set up for Consistency yet.',
  'consent-expired': 'That took too long, or someone else began it. Connect Google again.',
  'calendar-permission-missing': 'Google was not allowed to use the calendar. Connect again and leave both calendar permissions ticked.',
  'google-gave-no-refresh': 'Google kept an older permission. Remove Consistency at myaccount.google.com/permissions, then connect again.',
  'google-refused': 'Google did not accept the connection. Connect again.',
  'connect-google-first': 'Connect Google before taking bookings.',
  'stale-meeting-settings': 'These settings were changed elsewhere. The latest are shown.',
  access_denied: 'Google was not connected: the permission was declined.',
};
export const meetingWords = (error: unknown) => (error instanceof SiteApiError ? (error.code && WORDS[error.code]) || (error.status === 0 ? 'Could not reach Consistency. Try again.' : error.status === 401 || error.status === 403 ? 'Sign in again before retrying.' : 'That did not work. Try again.') : 'That did not work. Try again.');

export const DAYS: [number, string][] = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']];
export const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const HALF_HOURS = Array.from({ length: 49 }, (_, index) => index * 30);
export const NOTICES: [number, string][] = [[0, 'None'], [1, '1 hour'], [2, '2 hours'], [4, '4 hours'], [12, '12 hours'], [24, '1 day'], [48, '2 days'], [168, '1 week']];
export const AHEAD = [7, 14, 21, 30, 60];
export const zones = (): string[] => { try { return (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf('timeZone'); } catch { return []; } };
/** The owner's own zone, which a site that has never saved its meetings starts in. */
export const ownZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };
export const when = (at: number, zone: string) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(at);
/** Why Google's consent came back without a connection. */
export const returnWords = (error: string) => WORDS[error] ?? 'Google was not connected. Try again.';
