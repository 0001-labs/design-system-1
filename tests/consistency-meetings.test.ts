import { describe, expect, it } from 'vite-plus/test';
import { EMPTY_MEETINGS_SOURCE, MEETINGS_DEFAULTS, MEETINGS_PAGE, meetingsMarkup, readMeetings, writeMeetings } from '../shared/consistency-meetings';
import { renderNativeRegion } from '../shared/consistency-native-content';

describe('the booking block', () => {
  it('reads its words, with defaults for those left out, and refuses anything else', () => {
    expect(readMeetings(EMPTY_MEETINGS_SOURCE)).toEqual({ kind: 'meetings', ...MEETINGS_DEFAULTS });
    expect(readMeetings('```c9y-meetings\n{"message":"Send a message"}\n```')?.message).toBe('Send a message');
    expect(readMeetings('```c9y-meetings\n{"button":"Talk to us"}\n```')?.button).toBe('Talk to us');
    for (const bad of ['```c9y-meetings\n{"href":"https://evil.example"}\n```', '```c9y-meetings\n{"button":"Two\\nlines"}\n```', '```c9y-meetings\n[]\n```', '```c9y-meetings\nnot json\n```', `\`\`\`c9y-meetings\n{"note":"${'x'.repeat(301)}"}\n\`\`\``, '```c9y-signup\n{}\n```'])
      expect(readMeetings(bad)).toBeNull();
  });
  it('keeps only the words that differ from the defaults', () => {
    expect(writeMeetings(MEETINGS_DEFAULTS)).toBe(EMPTY_MEETINGS_SOURCE);
    const written = writeMeetings({ ...MEETINGS_DEFAULTS, button: 'Book `now`' });
    expect(written).toBe('```c9y-meetings\n{"button":"Book \\u0060now\\u0060"}\n```');
    expect(readMeetings(written)?.button).toBe('Book `now`');
  });
  it('publishes the button alone, opening the booking under it, with the booking page for a reader without scripts', () => {
    const html = renderNativeRegion('Let us talk.\n\n```c9y-meetings\n{"button":"<b>Book</b>"}\n```');
    expect(html).toContain('<div class="c9y-native-meetings-choices"><details class="c9y-native-meetings" name="c9y-meetings" data-c9y-meetings-inline><summary class="ds-button ds-button--secondary c9y-native-button">&lt;b&gt;Book&lt;/b&gt;</summary>');
    expect(html).toContain('<div class="c9y-native-meetings-panel" data-c9y-meetings-panel><p class="c9y-native-meetings-note">Pick a time that suits you. You get a calendar invitation by email.</p>');
    expect(html).toContain(`<noscript><p><a href="${MEETINGS_PAGE}">Choose a time on the booking page</a></p></noscript>`);
    expect(html).not.toContain('<b>Book</b>');
    expect(html).not.toContain('data-c9y-meetings-message');
    expect(MEETINGS_PAGE).toBe('/_c9y/meetings');
  });
  it('with a message, a second button of the same name beside it, hidden until the script gives it the page\'s form', () => {
    const html = renderNativeRegion('```c9y-meetings\n{"message":"Send a message"}\n```');
    expect(html).toContain('<div class="c9y-native-meetings-choices"><details class="c9y-native-meetings" name="c9y-meetings" data-c9y-meetings-message hidden><summary class="ds-button ds-button--secondary c9y-native-button">Send a message</summary><div class="c9y-native-meetings-panel" data-c9y-message-panel></div></details><span class="c9y-native-meetings-or" hidden>or</span><details class="c9y-native-meetings" name="c9y-meetings" data-c9y-meetings-inline>');
    expect(html.match(/name="c9y-meetings"/g)?.length).toBe(2);
    expect(writeMeetings({ ...MEETINGS_DEFAULTS, message: 'Send a message' })).toBe('```c9y-meetings\n{"message":"Send a message"}\n```');
  });
  it('draws a button that leads nowhere in the editor, its words marked to be written in place', () => {
    const html = meetingsMarkup(readMeetings(EMPTY_MEETINGS_SOURCE)!, { editor: true });
    expect(html).not.toContain('href=');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('<details');
    expect(html.match(/data-meetings-field="(\w+)"/g)).toEqual(['data-meetings-field="button"', 'data-meetings-field="note"']);
  });
});
