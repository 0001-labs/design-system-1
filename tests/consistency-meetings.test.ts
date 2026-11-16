import { describe, expect, it } from 'vite-plus/test';
import { EMPTY_MEETINGS_SOURCE, MEETINGS_DEFAULTS, MEETINGS_PAGE, meetingsMarkup, readMeetings, writeMeetings } from '../shared/consistency-meetings';
import { renderNativeRegion } from '../shared/consistency-native-content';

describe('the booking block', () => {
  it('reads its words, with defaults for those left out, and refuses anything else', () => {
    expect(readMeetings(EMPTY_MEETINGS_SOURCE)).toEqual({ kind: 'meetings', ...MEETINGS_DEFAULTS });
    expect(readMeetings('```c9y-meetings\n{"button":"Talk to us"}\n```')?.button).toBe('Talk to us');
    // A page can only say what the labels read: never where the button leads.
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
    expect(html).toContain('<details class="c9y-native-meetings" data-c9y-meetings-inline><summary class="ds-button ds-button--primary c9y-native-button">&lt;b&gt;Book&lt;/b&gt;</summary>');
    expect(html).toContain('<div class="c9y-native-meetings-panel" data-c9y-meetings-panel><p class="c9y-native-meetings-note">Pick a time that suits you. You get a calendar invitation by email.</p>');
    expect(html).toContain(`<noscript><p><a href="${MEETINGS_PAGE}">Choose a time on the booking page</a></p></noscript>`);
    expect(html).not.toContain('<b>Book</b>');
    expect(MEETINGS_PAGE).toBe('/_c9y/meetings');
  });
  it('draws a button that leads nowhere in the editor, its words marked to be written in place', () => {
    const html = meetingsMarkup(readMeetings(EMPTY_MEETINGS_SOURCE)!, { editor: true });
    expect(html).not.toContain('href=');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('<details');
    expect(html.match(/data-meetings-field="(\w+)"/g)).toEqual(['data-meetings-field="button"', 'data-meetings-field="note"']);
  });
});
