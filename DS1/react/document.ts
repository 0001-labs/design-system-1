import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { DocumentPage as DocumentElement } from "../4-page/ds-document";

export type DocumentPageProps = HTMLAttributes<DocumentElement> &
  Partial<Pick<DocumentElement, "levels" | "label" | "literal" | "hideContents">>;
export const DocumentPage = forwardRef<DocumentElement, DocumentPageProps>(function DocumentPage({ hideContents, ...props }, ref) {
  return createElement("ds-document", { ...props, "hide-contents": hideContents || undefined, "data-ds-prose": "", ref });
});
