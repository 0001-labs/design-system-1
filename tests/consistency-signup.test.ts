import { describe, expect, it } from 'vite-plus/test';
import { EMPTY_SIGNUP_SOURCE, SIGNUP_ACTION, SIGNUP_DEFAULTS, readSignup, signupMarkup, writeSignup } from '../shared/consistency-signup';
import { renderNativeRegion } from '../shared/consistency-native-content';

describe('the signup block', () => {
  it('reads its words, with defaults for those left out, and refuses anything else', () => {
    expect(readSignup(EMPTY_SIGNUP_SOURCE)).toEqual({ kind: 'signup', ...SIGNUP_DEFAULTS });
    expect(readSignup('```c9y-signup\n{"button":"Get the news"}\n```')?.button).toBe('Get the news');
    for (const bad of ['```c9y-signup\n{"action":"https://evil.example"}\n```', '```c9y-signup\n{"button":"Two\\nlines"}\n```', '```c9y-signup\n[]\n```', '```c9y-signup\nnot json\n```', `\`\`\`c9y-signup\n{"note":"${'x'.repeat(301)}"}\n\`\`\``, '```c9y-carousel\n{}\n```'])
      expect(readSignup(bad)).toBeNull();
  });
  it('keeps only the words that differ from the defaults', () => {
    expect(writeSignup(SIGNUP_DEFAULTS)).toBe(EMPTY_SIGNUP_SOURCE);
    const written = writeSignup({ ...SIGNUP_DEFAULTS, button: 'Join `us`' });
    expect(written).toBe('```c9y-signup\n{"button":"Join \\u0060us\\u0060"}\n```');
    expect(readSignup(written)?.button).toBe('Join `us`');
  });
  it('publishes a form that posts to the site’s signup page, with its words escaped and a honeypot', () => {
    const html = renderNativeRegion('Get our news.\n\n```c9y-signup\n{"button":"<b>Join</b>"}\n```');
    expect(html).toContain(`<form class="c9y-native-signup" method="post" action="${SIGNUP_ACTION}"`);
    expect(html).toContain('name="email" type="email"');
    expect(html).toContain('name="website" tabindex="-1"');
    expect(html).toContain('&lt;b&gt;Join&lt;/b&gt;');
    expect(html).not.toContain('<b>Join</b>');
  });
  it('draws an inert form in the editor, its words marked to be written in place', () => {
    const html = signupMarkup(readSignup(EMPTY_SIGNUP_SOURCE)!, { editor: true });
    expect(html).not.toContain('action=');
    expect(html).not.toContain('<button');
    expect(html.match(/data-signup-field="(\w+)"/g)?.length).toBe(4);
    expect(html.match(/ disabled /g)?.length).toBe(2);
  });
});
