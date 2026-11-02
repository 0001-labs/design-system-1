/**
 * Sudden leaves: when the trace just before a person left a product shows
 * something went wrong or stalled, the leave opens an "investigate" issue in
 * System → Issues (issues.ts), so the owner or the issue fixer reads the trace
 * and finds out why. Not every leave: only one whose last moments give a reason.
 *
 * Shared by the browser client, which says what was on screen as the tab was
 * hidden (`leaveContext`), and the Worker, which reads the session's events in
 * the window before the leave and names the reason (`suddenLeaveReason`). Pure
 * apart from `leaveContext`'s few lookups, so the browser bundle never takes
 * issues.ts. Nothing here reads or keeps text a person wrote or read.
 */
import type { FeedbackEvent } from './events';

/** How far back from a leave its reason is looked for. */
export const SUDDEN_LEAVE_WINDOW = 15_000;
/** A signed-in person gone this soon after arriving bounced. */
export const BOUNCE_MS = 5_000;

/** Browser notifications that do not signal a failed product operation. Exact matches only. */
export const BROWSER_NOTIFICATIONS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
  'Skipping view transition because skipTransition() was called.',
  'Transition was skipped',
] as const;

/**
 * The message with what changes between occurrences of one bug taken out:
 * addresses, ids (a UUID, a run of hex, a token of letters and digits six or
 * more long) and numbers. The words stay, quoted names too.
 */
export function normalizeMessage(message: string): string {
  return message
    .trim()
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s'"`)\]]+/gi, '<url>')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<id>')
    .replace(/\b0x[0-9a-f]+\b/gi, '<n>')
    // A number with its unit (1500ms, 12px) is a number, not an id.
    .replace(/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{6,}\b/g, token => (/^\d+[a-z]{1,3}$/i.test(token) ? token : '<id>'))
    .replace(/\d+(?:\.\d+)?/g, '<n>')
    .replace(/\s+/g, ' ');
}

/** A leave's path with ids and numbers out, as a message is normalized: `/projects/abc123` and `/projects/def456` are one place. */
export const leavePath = (path: string): string => normalizeMessage(path || '/') || '/';

/** Why a leave was sudden, first match wins in this order. */
export const SUDDEN_LEAVE_REASONS = ['rage-click', 'after-error', 'stuck', 'unsaved', 'while-loading', 'bounce'] as const;
export type SuddenLeaveReason = (typeof SUDDEN_LEAVE_REASONS)[number];

/** Each reason in the words System's pages, the CLI and the brief use. */
export const SUDDEN_LEAVE_WORDS: Record<SuddenLeaveReason, string> = {
  'rage-click': 'rage clicks just before leaving',
  'after-error': 'an error just before leaving',
  stuck: 'the same control pressed three or more times with nothing happening',
  unsaved: 'a field changed and never saved',
  'while-loading': 'the page was still loading',
  bounce: `a signed-in person pressed something and left within ${BOUNCE_MS / 1000} s of arriving`,
};

const LOADING = 'ds-loading, .ds-loading, [aria-busy="true"]';
const DIALOG = 'dialog[open], [role="dialog"]:not([hidden]):not([aria-hidden="true"])';

/** Whether a Design system 1 toast of a type is showing: both toasters draw `li.toast[data-type]` in an open shadow root. */
function toastShowing(root: ParentNode, type: 'error' | 'loading'): boolean {
  for (const host of root.querySelectorAll('[data-ds-toaster], ds-toast')) {
    if (host.shadowRoot?.querySelector(`.toast[data-type="${type}"]:not([data-removed="true"])`)) return true;
  }
  return false;
}

/**
 * What was on screen as the tab was hidden, as small flat props with no text,
 * value or name: `loading` when a loading state shows, `dialog` when a dialog is
 * open, `toast: 'error'` when an error toast shows. Undefined when none does.
 * A few lookups, never a walk of the page, and it never throws.
 */
export function leaveContext(root: ParentNode = document): FeedbackEvent['props'] {
  try {
    const props: Record<string, string | number> = {};
    if (root.querySelector(LOADING) || toastShowing(root, 'loading')) props.loading = 1;
    if (root.querySelector(DIALOG)) props.dialog = 1;
    if (toastShowing(root, 'error')) props.toast = 'error';
    return Object.keys(props).length ? props : undefined;
  } catch {
    return undefined;
  }
}

const latest = <T>(items: readonly T[], test: (item: T) => boolean): T | undefined => {
  for (let i = items.length - 1; i >= 0; i--) if (test(items[i])) return items[i];
  return undefined;
};
/** Design system 1's contrast watch reports what it measured as a failure (`contrast.<theme>.<component>`): a finding about the page, not something the person met, so a leave after one is no sudden leave. */
const isDesignFinding = (event: FeedbackEvent) => typeof event.props?.failureCode === 'string' && event.props.failureCode.startsWith('contrast.');
/** A page or a step the product named: the person got somewhere. The recorder's own "Recording started" step is not one. */
const moved = (event: FeedbackEvent) => event.kind === 'page' || (event.kind === 'step' && event.props?.source !== 'rage-click');

/**
 * Why a leave was sudden, or null. `before` is the session's events in the
 * window before the leave, oldest first; `session.firstPage` is when its first
 * page was seen, when it is not among them. `about` is what the issue groups
 * on: an error's message normalized, a control's or field's name as the client
 * records it, or the path; never words a person wrote.
 */
export function suddenLeaveReason(
  before: readonly FeedbackEvent[],
  leave: FeedbackEvent,
  session: { account: string | null; firstPage?: number | null },
): { reason: SuddenLeaveReason; about: string } | null {
  const recent = before.filter(event => event.at >= leave.at - SUDDEN_LEAVE_WINDOW && event.at <= leave.at);
  const rage = latest(recent, event => event.kind === 'error' && event.props?.source === 'rage-click');
  if (rage) return { reason: 'rage-click', about: normalizeMessage(rage.name) };
  const error = latest(recent, event => event.kind === 'error' && !BROWSER_NOTIFICATIONS.some(message => message === event.name) && !isDesignFinding(event));
  if (error) return { reason: 'after-error', about: normalizeMessage(error.name) };

  // The same control pressed three times or more, and nothing came of it: no page or step after the first press.
  const presses = new Map<string, number[]>();
  recent.forEach((event, index) => { if (event.kind === 'press') presses.set(event.name, [...(presses.get(event.name) ?? []), index]); });
  let stuck: { name: string; count: number; last: number } | null = null;
  for (const [name, indexes] of presses) {
    if (indexes.length < 3 || recent.slice(indexes[0] + 1).some(moved)) continue;
    const last = indexes[indexes.length - 1];
    if (!stuck || indexes.length > stuck.count || (indexes.length === stuck.count && last > stuck.last)) stuck = { name, count: indexes.length, last };
  }
  if (stuck) return { reason: 'stuck', about: stuck.name };

  const changed = recent.map((event, index) => ({ event, index })).filter(({ event }) => event.kind === 'change').pop();
  if (changed && !recent.slice(changed.index + 1).some(moved)) return { reason: 'unsaved', about: changed.event.name };

  const path = leavePath(leave.path);
  if (leave.props?.loading) return { reason: 'while-loading', about: path };

  // A bounce is a signed-in person who tried something (a press) and was gone within seconds; a quick look that presses nothing is ordinary use.
  const firstPage = session.firstPage ?? recent.find(event => event.kind === 'page')?.at ?? null;
  if (session.account && firstPage !== null && firstPage <= leave.at && leave.at - firstPage <= BOUNCE_MS
      && recent.some(event => event.kind === 'press')
      && !recent.some(event => event.kind === 'step' && event.props?.source !== 'rage-click')) return { reason: 'bounce', about: path };
  return null;
}

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
/** A path as a title shows it: ids and numbers as an ellipsis. */
const shownPath = (path: string) => cut(leavePath(path).replace(/<(?:id|n|url)>/g, '…'), 40);

/** An investigate issue's title in plain words, under 120 characters. */
export function suddenLeaveTitle(reason: SuddenLeaveReason, about: string, path: string): string {
  const where = shownPath(path);
  const name = cut(about, 32);
  switch (reason) {
    case 'rage-click': return `Left suddenly after rage clicks on ${where}`;
    case 'after-error': return `Left suddenly after an error on ${where}`;
    case 'stuck': return `Left suddenly, stuck pressing "${name}" on ${where}`;
    case 'unsaved': return `Left suddenly with unsaved changes to "${name}" on ${where}`;
    case 'while-loading': return `Left suddenly while loading ${where}`;
    case 'bounce': return `Left within ${BOUNCE_MS / 1000} s of arriving on ${where}`;
  }
}
