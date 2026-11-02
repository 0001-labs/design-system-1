/**
 * Consistency's report to the Feedback loop, 0001's own usage analytics, read in System under
 * Consistency (`consistency`). The client is the copy Sync 1 keeps in
 * website/src/vendor/feedback-loop; it records pages, presses, changes, errors, the leave and what a
 * load cost on its own. It starts once, on consistency.site and the lab at editor.c9y.site only,
 * after the page has loaded and gone idle, so it never costs the first paint; Design system 1's
 * contrast watch follows it, loaded the same way, and reports low-contrast text as
 * `contrast.<theme>.<component>` failures the loop turns into issues.
 *
 * Nothing anyone wrote or read leaves the app: a site's canvas and places, its cards, names,
 * addresses, people and domains are named "private" in every press. The app holds no person's id or
 * address in the browser (the workspaces read says only whether the person is the owner), so the
 * loop sends no account and no email; the Worker leaves the owner out by address. Recording
 * (`replay`) is the owner's to turn on.
 */
import type { FeedbackLoop } from '../../../website/src/vendor/feedback-loop/client';
import { reloadWhenStale } from '../../../website/src/vendor/feedback-loop/stale-reload';
import { version } from '../package.json';

const HOSTS = new Set(['consistency.site', 'editor.c9y.site']);

/** Where customers' words, names and addresses are; nothing pressed there is named. */
const PRIVATE_SELECTOR = [
  '.home-stage', '.home-grid', '.home-drafts', '.home-places', '.home-workspaces', '.home-workspace',
  '.home-people', '.home-site-title', '.home-site-domain', '.home-site-people',
  'consistency-members', 'consistency-domains', 'consistency-draft-site', 'consistency-site-editor',
  'consistency-page-editor', 'consistency-workspace-page', 'consistency-editor',
  'aa-editor', '[contenteditable]', '[data-private]',
].join(', ');

type Props = Parameters<FeedbackLoop['step']>[1];

let loop: FeedbackLoop | null = null;
const queued: Array<(loop: FeedbackLoop) => void> = [];

const reports = () => typeof window !== 'undefined' && HOSTS.has(location.hostname) && window.top === window && !import.meta.env?.DEV;

const idle = (run: () => void) => {
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 4_000 });
  else setTimeout(run, 1);
};

async function start() {
  try {
    const { startFeedbackLoop } = await import('../../../website/src/vendor/feedback-loop/client');
    loop = startFeedbackLoop({ product: 'consistency', account: () => null, version, privateSelector: PRIVATE_SELECTOR });
    for (const call of queued.splice(0)) call(loop);
  } catch { queued.length = 0; return; }
  idle(() => void import('../../../DS1/0-face/contrast-watch').then(watch => watch.startContrastWatch()).catch(() => {}));
}

let started = false;
/** Once, as the entry runs: a stale part reloads the page at once; the loop and the contrast watch wait for load and idle. */
export function startFeedback() {
  if (started || typeof window === 'undefined') return;
  started = true;
  // The editor's parts are behind the owner's session, so they are asked about with it: without it,
  // a part still there would answer with the sign-in page and read as gone.
  reloadWhenStale({ ask: (part, init) => fetch(part, { ...init, credentials: 'same-origin' }) });
  if (!reports()) return;
  const later = () => idle(() => void start());
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
}

/**
 * A step the app names when someone finished something: "site created", "changes saved". Props are
 * small and say nothing of the site, its words or its addresses. Kept until the loop has started,
 * dropped off the live hosts.
 */
export function step(name: string, props?: Props) {
  if (!reports()) return;
  if (loop) loop.step(name, props);
  else if (queued.length < 50) queued.push(each => each.step(name, props));
}
