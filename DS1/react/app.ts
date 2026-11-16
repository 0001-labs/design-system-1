import { createElement, forwardRef, type HTMLAttributes } from "react";
import type { App as AppElement } from "../4-page/ds-app";

export type AppProps = HTMLAttributes<AppElement> &
  Partial<Pick<AppElement, "name" | "home" | "layout" | "navWidth" | "asideWidth" | "resizeKey" | "drawerLabel" | "fixedScale" | "flush">>;
/**
 * The app frame, typed so a React product needs no `IntrinsicElements` entry
 * of its own for `ds-app`. Browser-only registration stays in the product's
 * runtime entry for SSR.
 */
export const App = forwardRef<AppElement, AppProps>(function App(props, ref) {
  return createElement("ds-app", { ...props, ref });
});
