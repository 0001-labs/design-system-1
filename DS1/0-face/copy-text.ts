import { feedbackWord } from "./feedback-words";
import { toast, toasterListening } from "./toast-queue";

export interface CopyTextOptions {
  toast?: string | false;
}

function modalDialog(): HTMLDialogElement | null {
  try {
    return document.querySelector<HTMLDialogElement>("dialog:modal");
  } catch {
    return null;
  }
}

function copyFromField(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : [];
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.setAttribute("aria-hidden", "true");
  field.tabIndex = -1;
  field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;margin:0;padding:0;border:0;opacity:0;pointer-events:none";
  (modalDialog() ?? document.body).appendChild(field);
  field.focus({ preventScroll: true });
  field.select();
  field.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  field.remove();
  active?.focus({ preventScroll: true });
  if (selection) {
    selection.removeAllRanges();
    for (const range of ranges) selection.addRange(range);
  }
  return copied;
}

export async function copyText(text: string, options: CopyTextOptions = {}): Promise<boolean> {
  let copied = false;
  const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (!copied) copied = copyFromField(text);
  if (options.toast !== false) await say(copied, copied ? options.toast ?? feedbackWord("Copied") : feedbackWord("Could not copy"));
  return copied;
}

async function say(copied: boolean, words: string): Promise<void> {
  if (!toasterListening()) {
    try {
      (await import("./load-toaster")).pageToaster();
    } catch {
    }
  }
  if (copied) toast.success(words);
  else toast.error(words, { failure: { code: "clipboard.copy", message: "Clipboard copy failed" } });
}
