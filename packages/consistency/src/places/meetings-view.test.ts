import { expect, it } from 'vite-plus/test';
import { SiteApiError } from './api';
import { keepGoogleReturn, takeGoogleReturn } from './google-return';
import { HALF_HOURS, clock, meetingWords, returnWords, when } from './meetings-view';

it('says what went wrong with a connection in words an owner can act on', () => {
  expect(meetingWords(new SiteApiError(409, 'consent-expired'))).toBe('That took too long, or someone else began it. Connect Google again.');
  expect(meetingWords(new SiteApiError(502, 'calendar-permission-missing'))).toContain('leave both calendar permissions ticked');
  expect(meetingWords(new SiteApiError(409, 'connect-google-first'))).toBe('Connect Google before taking bookings.');
  expect(meetingWords(new SiteApiError(0))).toBe('Could not reach Consistency. Try again.');
  expect(meetingWords(new SiteApiError(401))).toBe('Sign in again before retrying.');
  expect(meetingWords(new Error('x'))).toBe('That did not work. Try again.');
  expect(returnWords('access_denied')).toBe('Google was not connected: the permission was declined.');
  expect(returnWords('failed')).toBe('Google was not connected. Try again.');
});

it('writes the hours as a clock and a meeting in the owner\'s zone', () => {
  expect(HALF_HOURS[0]).toBe(0);
  expect(HALF_HOURS.at(-1)).toBe(24 * 60);
  expect(clock(9 * 60 + 30)).toBe('09:30');
  expect(clock(24 * 60)).toBe('24:00');
  expect(when(Date.UTC(2026, 10, 16, 9), 'Europe/Copenhagen')).toBe('Mon 16 Nov, 10:00');
});

it('keeps Google\'s return for the one site it names, once', () => {
  expect(keepGoogleReturn('?open=60BVFI')).toBe(false);
  expect(keepGoogleReturn('?google_code=c&google_state=s')).toBe(false);
  expect(keepGoogleReturn('?open=nonsense&google_code=c&google_state=s')).toBe(false);
  expect(keepGoogleReturn('?open=60BVFI&google_code=4%2F0Ab&google_state=60BVFI.abc')).toBe(true);
  expect(takeGoogleReturn('10VNDG')).toBeNull();
  expect(takeGoogleReturn('60BVFI')).toEqual({ site: '60BVFI', code: '4/0Ab', state: '60BVFI.abc' });
  expect(takeGoogleReturn('60BVFI')).toBeNull();
  expect(keepGoogleReturn('?open=60BVFI&google_error=access_denied')).toBe(true);
  expect(takeGoogleReturn('60BVFI')).toEqual({ site: '60BVFI', error: 'access_denied' });
});
