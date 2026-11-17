import type { FeedbackLoop } from '../../../website/src/vendor/feedback-loop/client';
import { reloadWhenStale } from '../../../website/src/vendor/feedback-loop/stale-reload';
import { version } from '../package.json';

const HOSTS = new Set(['consistency.site', 'editor.c9y.site']);

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
export function startFeedback() {
  if (started || typeof window === 'undefined') return;
  started = true;
  reloadWhenStale({ ask: (part, init) => fetch(part, { ...init, credentials: 'same-origin' }) });
  if (!reports()) return;
  const later = () => idle(() => void start());
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
}

export function step(name: string, props?: Props) {
  if (!reports()) return;
  if (loop) loop.step(name, props);
  else if (queued.length < 50) queued.push(each => each.step(name, props));
}
