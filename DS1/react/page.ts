import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { Page as PageElement } from "../4-page/ds-page";

export type PageProps = HTMLAttributes<PageElement> &
  Partial<Pick<PageElement, "resizable" | "navWidth" | "asideWidth" | "split" | "resizeKey" | "layout" | "divided" | "measure" | "fill" | "flush" | "view" | "drawer" | "drawerLabel">>;
export const Page = forwardRef<PageElement, PageProps>(function Page(props, ref) {
  return createElement("ds-page", { ...props, ref });
});
