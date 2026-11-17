import type { Doc } from "../_generated/dataModel";

export type LibraryState =
  | "purged"
  | "archived"
  | "failed-validation"
  | "publishing"
  | "draft"
  | "unpublished-changes"
  | "published";

export function libraryState(library: Doc<"libraries">): LibraryState {
  if (library.purgedAt !== undefined) return "purged";
  if (library.archivedAt !== undefined) return "archived";
  if (library.lastPublishStatus === "failed") return "failed-validation";
  if (library.lastPublishStatus === "in_progress") return "publishing";
  if (library.publishedVersion === undefined) return "draft";
  if (library.draftHash !== library.publishedHash) return "unpublished-changes";
  return "published";
}

export function hasUnpublishedChanges(library: Doc<"libraries">): boolean {
  return library.publishedVersion !== undefined && library.draftHash !== library.publishedHash;
}
