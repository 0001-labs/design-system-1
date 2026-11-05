/** Browser-only leave context; the model stays usable in the Worker. */
import type { FeedbackEvent } from './events';
export * from './sudden-leave-model';

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
