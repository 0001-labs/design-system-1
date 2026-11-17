export const AUTOSAVE_DEBOUNCE_MS = 1200;

export const AUTOSAVE_MAX_WAIT_MS = 8000;

export type SaveState = "saved" | "dirty" | "saving" | "conflict" | "offline" | "error";

export interface PendingDraft {
  css: string;
  config: string;
  baseRev: number;
  savedAt: number;
}

export function localDraftKey(libraryId: string): string {
  return `ds1.draft.${libraryId}`;
}

export function stashLocalDraft(libraryId: string, draft: PendingDraft): void {
  try {
    localStorage.setItem(localDraftKey(libraryId), JSON.stringify(draft));
  } catch {
  }
}

export function readLocalDraft(libraryId: string): PendingDraft | null {
  try {
    const raw = localStorage.getItem(localDraftKey(libraryId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingDraft>;
    if (typeof parsed.css !== "string" || typeof parsed.baseRev !== "number") return null;

    return {
      css: parsed.css,
      config: typeof parsed.config === "string" ? parsed.config : "{}",
      baseRev: parsed.baseRev,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return null;
  }
}

export function clearLocalDraft(libraryId: string): void {
  try {
    localStorage.removeItem(localDraftKey(libraryId));
  } catch {
  }
}

export function backoffMs(attempt: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, attempt - 1));
}
